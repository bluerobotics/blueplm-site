/**
 * Extension sync routes
 * 
 * Handles syncing extensions with their GitHub repositories to fetch new releases.
 * 
 * Endpoints:
 * - POST /admin/sync/all - Admin-only bulk sync of all approved extensions
 * - POST /store/extensions/:name/sync - Public single extension sync (rate limited)
 */

import { Hono } from 'hono';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Env,
  Variables,
  ApiResponse,
  ExtensionSyncResult,
  BulkSyncResult,
} from '../types';
import {
  parseGitHubUrl,
  fetchReleases,
  findBpxAsset,
  fetchExtensionManifest,
  validateManifest,
  downloadAndHashBpx,
  sanitizeChangelog,
  checkVersionMismatch,
} from '../utils/github';
import { badRequest, notFound, forbidden, rateLimitExceeded } from '../utils/errors';
import { checkRateLimit, rateLimitHeaders } from '../utils/rate-limit';
import { noCacheHeaders } from '../utils/cache';

// ============================================================================
// Admin Sync Routes (mounted at /admin/sync)
// ============================================================================

export const adminSync = new Hono<{ Bindings: Env; Variables: Variables }>();

// Admin middleware
adminSync.use('*', async (c, next) => {
  const isAdmin = c.get('isAdmin');
  if (!isAdmin) {
    throw forbidden('Admin access required');
  }
  await next();
});

/**
 * POST /admin/sync/all - Sync all approved extensions
 * 
 * Called by Cloudflare Cron Trigger (hourly) or manually by admin.
 * Iterates through all approved extensions and checks for new releases.
 */
adminSync.post('/all', async (c) => {
  const supabaseAdmin = c.get('supabaseAdmin');
  const githubToken = c.env.GITHUB_API_TOKEN;

  // Fetch all approved extensions with repository URLs
  const { data: extensions, error: fetchError } = await supabaseAdmin
    .from('extensions')
    .select('id, name, display_name, repository_url, last_synced_at')
    .eq('published', true)
    .not('repository_url', 'is', null);

  if (fetchError) {
    console.error('Failed to fetch extensions for sync:', fetchError);
    throw badRequest('Failed to fetch extensions');
  }

  const result: BulkSyncResult = {
    totalExtensions: extensions?.length || 0,
    synced: 0,
    failed: 0,
    newVersionsAdded: 0,
    errors: [],
  };

  if (!extensions || extensions.length === 0) {
    return c.json({
      success: true,
      message: 'No extensions to sync',
      data: result,
    } as ApiResponse);
  }

  // Process each extension
  for (const ext of extensions) {
    try {
      const syncResult = await syncExtension(
        supabaseAdmin,
        ext.id,
        ext.name,
        ext.repository_url,
        githubToken
      );

      if (syncResult.updated) {
        result.synced++;
        result.newVersionsAdded += syncResult.newVersions.length;
      }

      // Update last_synced_at
      await supabaseAdmin
        .from('extensions')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', ext.id);

    } catch (err) {
      result.failed++;
      result.errors.push({
        extensionId: ext.id,
        extensionName: ext.name,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
      console.error(`Failed to sync extension ${ext.name}:`, err);
    }
  }

  // Log sync job to extension_sync_log
  await supabaseAdmin.from('extension_sync_log').insert({
    started_at: new Date(Date.now() - 1000).toISOString(), // Approximate start time
    completed_at: new Date().toISOString(),
    releases_checked: result.totalExtensions,
    versions_added: result.newVersionsAdded,
    status: result.failed === 0 ? 'success' : 'error',
    error_message: result.failed > 0
      ? `${result.failed} extension(s) failed to sync`
      : null,
  });

  return c.json(
    {
      success: true,
      message: `Synced ${result.synced}/${result.totalExtensions} extensions`,
      data: result,
    } as ApiResponse,
    200,
    noCacheHeaders()
  );
});

// ============================================================================
// Store Sync Routes (mounted at /store/extensions)
// ============================================================================

export const storeSync = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * POST /store/extensions/:name/sync - Sync a single extension
 * 
 * Public endpoint, rate limited to 10 requests per minute per IP.
 * Called by:
 * - "Check for updates" button on extension detail page
 * - Install flow (before downloading) to ensure latest versions
 */
storeSync.post('/:name/sync', async (c) => {
  const name = c.req.param('name');

  // Rate limit: 10 per minute per IP
  const clientIp = c.req.header('CF-Connecting-IP') || 'unknown';
  const limit = 10;
  const windowMs = 60_000; // 1 minute

  const rateLimitResult = await checkRateLimit(
    c.env,
    `sync:${clientIp}`,
    limit,
    windowMs
  );

  if (!rateLimitResult.allowed) {
    throw rateLimitExceeded(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
  }

  const supabaseAdmin = c.get('supabaseAdmin');
  const githubToken = c.env.GITHUB_API_TOKEN;

  // Find extension by name
  const { data: extension, error: findError } = await supabaseAdmin
    .from('extensions')
    .select('id, name, display_name, repository_url')
    .eq('name', name)
    .eq('published', true)
    .single();

  if (findError || !extension) {
    throw notFound('Extension');
  }

  if (!extension.repository_url) {
    throw badRequest('Extension does not have a repository URL');
  }

  try {
    const result = await syncExtension(
      supabaseAdmin,
      extension.id,
      extension.name,
      extension.repository_url,
      githubToken
    );

    // Update last_synced_at
    await supabaseAdmin
      .from('extensions')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', extension.id);

    return c.json(
      {
        success: true,
        message: result.updated
          ? `Found ${result.newVersions.length} new version(s)`
          : 'Extension is up to date',
        data: result,
      } as ApiResponse,
      200,
      {
        ...noCacheHeaders(),
        ...rateLimitHeaders(limit, rateLimitResult.remaining, rateLimitResult.resetAt),
      }
    );
  } catch (err) {
    console.error(`Failed to sync extension ${name}:`, err);
    throw badRequest(err instanceof Error ? err.message : 'Sync failed');
  }
});

// ============================================================================
// Core Sync Logic
// ============================================================================

/**
 * Sync a single extension with its GitHub repository
 * 
 * Fetches releases, finds new ones, downloads .bpx files, computes hashes,
 * and adds new versions to the database.
 */
async function syncExtension(
  supabase: SupabaseClient,
  extensionId: string,
  extensionName: string,
  repositoryUrl: string,
  githubToken?: string
): Promise<ExtensionSyncResult> {
  // Parse repository URL
  const parsed = parseGitHubUrl(repositoryUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub repository URL format');
  }

  const { owner, repo } = parsed;

  // Fetch all releases
  const releases = await fetchReleases(owner, repo, githubToken);

  if (releases.length === 0) {
    return {
      updated: false,
      latestVersion: '',
      newVersions: [],
    };
  }

  // Get existing versions from database
  const { data: existingVersions } = await supabase
    .from('extension_versions')
    .select('version')
    .eq('extension_id', extensionId);

  const existingVersionSet = new Set(
    existingVersions?.map(v => v.version) || []
  );

  // Process releases to find new ones
  const newVersions: string[] = [];
  let latestVersion = '';

  for (const release of releases) {
    // Skip drafts
    if (release.draft) continue;

    // Find .bpx asset
    const bpxAsset = findBpxAsset(release);
    if (!bpxAsset) continue;

    // Fetch manifest to get version
    let manifest;
    try {
      manifest = await fetchExtensionManifest(owner, repo, release.tag_name, githubToken);
    } catch (err) {
      console.warn(
        `Could not fetch extension.json for ${extensionName}@${release.tag_name}:`,
        err instanceof Error ? err.message : err
      );
      continue;
    }

    // Validate manifest
    const validation = validateManifest(manifest);
    if (!validation.valid) {
      console.warn(
        `Invalid manifest for ${extensionName}@${release.tag_name}:`,
        validation.errors
      );
      continue;
    }

    const version = manifest.version;

    // Check version mismatch
    const mismatchWarning = checkVersionMismatch(release.tag_name, version);
    if (mismatchWarning) {
      console.warn(`[${extensionName}] ${mismatchWarning}`);
    }

    // Track latest version (first non-prerelease, or first prerelease if no stable)
    if (!latestVersion || (!release.prerelease && releases[0]?.prerelease)) {
      latestVersion = version;
    }

    // Skip if version already exists
    if (existingVersionSet.has(version)) {
      continue;
    }

    // Download .bpx and compute hash
    let bpxHash;
    try {
      bpxHash = await downloadAndHashBpx(bpxAsset.browser_download_url, githubToken);
    } catch (err) {
      console.error(
        `Failed to download/hash .bpx for ${extensionName}@${version}:`,
        err instanceof Error ? err.message : err
      );
      continue;
    }

    // Sanitize changelog
    const changelog = sanitizeChangelog(release.body);

    // Insert new version
    const { error: insertError } = await supabase
      .from('extension_versions')
      .insert({
        extension_id: extensionId,
        version,
        prerelease: release.prerelease,
        changelog,
        bundle_url: bpxAsset.browser_download_url,
        bundle_hash: bpxHash.hash,
        bundle_size: bpxHash.size,
        manifest,
        published: true,
        published_at: release.published_at || new Date().toISOString(),
      });

    if (insertError) {
      // Unique constraint violation means version was added concurrently
      if (insertError.code === '23505') {
        console.log(`Version ${version} was added concurrently for ${extensionName}`);
      } else {
        console.error(
          `Failed to insert version ${version} for ${extensionName}:`,
          insertError
        );
      }
      continue;
    }

    newVersions.push(version);
    existingVersionSet.add(version);

    console.log(`Added version ${version} for ${extensionName}`);
  }

  return {
    updated: newVersions.length > 0,
    latestVersion: latestVersion || (existingVersions?.[0]?.version || ''),
    newVersions,
  };
}

export default {
  adminSync,
  storeSync,
};
