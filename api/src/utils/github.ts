/**
 * GitHub API utilities for extension store
 * 
 * Handles:
 * - Fetching releases from public repositories
 * - Downloading and hashing .bpx files
 * - Fetching and validating extension.json manifests
 * - Rate limiting with exponential backoff
 */

import type {
  GitHubRelease,
  GitHubAsset,
  ExtensionManifest,
  ManifestValidationResult,
  BpxHashResult,
} from '../types';

// ============================================================================
// Constants
// ============================================================================

const GITHUB_API_BASE = 'https://api.github.com';
const MAX_BPX_SIZE = 50 * 1024 * 1024; // 50MB max
const DOWNLOAD_TIMEOUT = 30_000; // 30 seconds
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

// ============================================================================
// URL Parsing
// ============================================================================

/**
 * Parse a GitHub repository URL to extract owner and repo
 * 
 * Supports formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - git@github.com:owner/repo.git
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  if (!url) return null;

  // Try HTTPS format: https://github.com/owner/repo(.git)?
  const httpsMatch = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(\.git)?$/);
  if (httpsMatch) {
    return {
      owner: httpsMatch[1],
      repo: httpsMatch[2].replace(/\.git$/, ''),
    };
  }

  // Try SSH format: git@github.com:owner/repo.git
  const sshMatch = url.match(/^git@github\.com:([^/]+)\/([^/]+?)(\.git)?$/);
  if (sshMatch) {
    return {
      owner: sshMatch[1],
      repo: sshMatch[2].replace(/\.git$/, ''),
    };
  }

  return null;
}

// ============================================================================
// API Helpers
// ============================================================================

/**
 * Get headers for GitHub API requests
 */
function getGitHubHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'BluePLM-Extension-Store/1.0',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Check if we're being rate limited
 */
function isRateLimited(response: Response): boolean {
  const remaining = response.headers.get('X-RateLimit-Remaining');
  return response.status === 403 && remaining === '0';
}

/**
 * Get rate limit reset time from response
 */
function getRateLimitReset(response: Response): number {
  const reset = response.headers.get('X-RateLimit-Reset');
  return reset ? parseInt(reset, 10) * 1000 : Date.now() + 60_000;
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with exponential backoff for rate limiting
 */
async function fetchWithBackoff(
  url: string,
  options: RequestInit,
  attempt = 0
): Promise<Response> {
  const response = await fetch(url, options);

  if (isRateLimited(response) && attempt < MAX_RETRIES) {
    const resetTime = getRateLimitReset(response);
    const waitTime = Math.min(
      Math.max(resetTime - Date.now(), BASE_BACKOFF_MS * Math.pow(2, attempt)),
      60_000 // Max 1 minute wait
    );

    console.warn(
      `[GitHub] Rate limited. Waiting ${Math.ceil(waitTime / 1000)}s before retry ${attempt + 1}/${MAX_RETRIES}`
    );

    await sleep(waitTime);
    return fetchWithBackoff(url, options, attempt + 1);
  }

  return response;
}

// ============================================================================
// Releases API
// ============================================================================

/**
 * Fetch all releases for a repository
 * 
 * Uses GITHUB_API_TOKEN if available for higher rate limits (5,000/hr vs 60/hr)
 */
export async function fetchReleases(
  owner: string,
  repo: string,
  token?: string
): Promise<GitHubRelease[]> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/releases`;
  const headers = getGitHubHeaders(token);

  const response = await fetchWithBackoff(url, { headers });

  if (response.status === 404) {
    throw new Error('Repository not found. Note: Private repositories are not supported yet.');
  }

  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to fetch releases: ${response.status} ${error}`);
  }

  const data = await response.json() as unknown[];

  // Map to our GitHubRelease type
  return data.map((release: Record<string, unknown>) => ({
    tag_name: String(release.tag_name || ''),
    name: String(release.name || release.tag_name || ''),
    body: String(release.body || ''),
    prerelease: Boolean(release.prerelease),
    draft: Boolean(release.draft),
    published_at: String(release.published_at || ''),
    assets: Array.isArray(release.assets)
      ? release.assets.map((asset: Record<string, unknown>) => ({
          name: String(asset.name || ''),
          browser_download_url: String(asset.browser_download_url || ''),
          size: Number(asset.size || 0),
        }))
      : [],
  }));
}

/**
 * Find the .bpx asset in a release
 */
export function findBpxAsset(release: GitHubRelease): GitHubAsset | null {
  return release.assets.find(asset => asset.name.endsWith('.bpx')) || null;
}

/**
 * Find the latest release with a .bpx asset
 * 
 * Prefers non-prerelease versions, but falls back to prereleases if none available
 */
export function findLatestReleaseWithBpx(
  releases: GitHubRelease[]
): { release: GitHubRelease; asset: GitHubAsset } | null {
  // Filter out drafts and releases without .bpx
  const validReleases = releases
    .filter(r => !r.draft)
    .map(release => ({
      release,
      asset: findBpxAsset(release),
    }))
    .filter((r): r is { release: GitHubRelease; asset: GitHubAsset } => r.asset !== null);

  if (validReleases.length === 0) {
    return null;
  }

  // Prefer non-prerelease
  const stable = validReleases.find(r => !r.release.prerelease);
  if (stable) {
    return stable;
  }

  // Fall back to first prerelease
  return validReleases[0];
}

// ============================================================================
// Extension Manifest
// ============================================================================

/**
 * Fetch extension.json from a specific release tag
 * 
 * Tries to fetch from the raw content URL using the tag reference
 */
export async function fetchExtensionManifest(
  owner: string,
  repo: string,
  tag: string,
  token?: string
): Promise<ExtensionManifest> {
  // Fetch from raw.githubusercontent.com using the tag
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${tag}/extension.json`;
  
  const response = await fetch(rawUrl, {
    headers: {
      'User-Agent': 'BluePLM-Extension-Store/1.0',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 404) {
    throw new Error(
      'extension.json not found in release. Make sure your repository root contains an extension.json file.'
    );
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch extension.json: ${response.status}`);
  }

  const manifest = await response.json() as ExtensionManifest;
  return manifest;
}

/**
 * Validate that extension manifest has required fields
 */
export function validateManifest(manifest: unknown): ManifestValidationResult {
  const errors: string[] = [];

  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['extension.json must be a valid JSON object'] };
  }

  const m = manifest as Record<string, unknown>;

  // Required fields
  if (!m.id || typeof m.id !== 'string') {
    errors.push('extension.json missing required field: id');
  } else if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/i.test(m.id)) {
    errors.push('extension.json id must be alphanumeric with dots/hyphens (e.g., "publisher.extension-name")');
  }

  if (!m.name || typeof m.name !== 'string') {
    errors.push('extension.json missing required field: name');
  }

  if (!m.version || typeof m.version !== 'string') {
    errors.push('extension.json missing required field: version');
  } else if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/.test(m.version)) {
    errors.push('extension.json version must be valid semver (e.g., "1.0.0" or "1.0.0-beta.1")');
  }

  if (!m.description || typeof m.description !== 'string') {
    errors.push('extension.json missing required field: description');
  }

  // Optional field validation
  if (m.icon !== undefined && typeof m.icon !== 'string') {
    errors.push('extension.json icon must be a string path');
  }

  if (m.categories !== undefined) {
    if (!Array.isArray(m.categories)) {
      errors.push('extension.json categories must be an array');
    } else if (!m.categories.every((c: unknown) => typeof c === 'string')) {
      errors.push('extension.json categories must be an array of strings');
    }
  }

  if (m.license !== undefined && typeof m.license !== 'string') {
    errors.push('extension.json license must be a string');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// BPX Download and Hashing
// ============================================================================

/**
 * Download a .bpx file and compute its SHA256 hash
 * 
 * Implements:
 * - Size limit check (50MB max)
 * - Timeout handling (30s)
 * - SHA256 hash computation using Web Crypto API
 */
export async function downloadAndHashBpx(
  downloadUrl: string,
  token?: string
): Promise<BpxHashResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT);

  try {
    const response = await fetch(downloadUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'BluePLM-Extension-Store/1.0',
        Accept: 'application/octet-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download .bpx file: ${response.status}`);
    }

    // Check content-length header
    const contentLength = response.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BPX_SIZE) {
      throw new Error(`BPX file too large (max ${MAX_BPX_SIZE / 1024 / 1024}MB)`);
    }

    // Download as ArrayBuffer
    const buffer = await response.arrayBuffer();

    // Check actual size
    if (buffer.byteLength > MAX_BPX_SIZE) {
      throw new Error(`BPX file too large (max ${MAX_BPX_SIZE / 1024 / 1024}MB)`);
    }

    // Compute SHA256 hash using Web Crypto API
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return {
      hash: `sha256:${hashHex}`,
      size: buffer.byteLength,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// Changelog Sanitization
// ============================================================================

/**
 * Sanitize release notes/changelog for XSS prevention
 * 
 * GitHub release bodies can contain arbitrary Markdown/HTML.
 * This sanitizes the content to remove potentially malicious elements.
 * 
 * For Cloudflare Workers (no DOMPurify), we use a conservative approach:
 * - Strip HTML tags entirely
 * - Keep Markdown formatting
 * - Limit length
 */
export function sanitizeChangelog(body: string | null | undefined): string {
  if (!body) return '';

  let sanitized = body;

  // Remove HTML tags (conservative approach for Workers environment)
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: URLs (except safe image types)
  sanitized = sanitized.replace(/data:(?!image\/(png|jpeg|gif|webp))[^;,]*/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  // Limit length (max 10KB)
  if (sanitized.length > 10_000) {
    sanitized = sanitized.slice(0, 10_000) + '\n\n... (truncated)';
  }

  return sanitized.trim();
}

// ============================================================================
// Version Utilities
// ============================================================================

/**
 * Compare if the manifest version differs from the tag version
 * Returns a warning message if they differ
 */
export function checkVersionMismatch(
  tag: string,
  manifestVersion: string
): string | null {
  // Normalize tag by removing 'v' prefix
  const normalizedTag = tag.replace(/^v/, '');

  if (normalizedTag !== manifestVersion) {
    return `Tag "${tag}" differs from manifest version "${manifestVersion}". Using manifest version as source of truth.`;
  }

  return null;
}

/**
 * Extract version from a Git tag
 * Handles common formats: v1.0.0, 1.0.0, release/1.0.0, etc.
 */
export function extractVersionFromTag(tag: string): string {
  // Remove common prefixes
  let version = tag.replace(/^(v|release\/|releases\/)/i, '');

  // If still doesn't look like semver, return original
  if (!/^\d+\.\d+/.test(version)) {
    return tag;
  }

  return version;
}
