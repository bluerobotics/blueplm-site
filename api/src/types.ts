import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// Environment bindings (Cloudflare Workers)
// ============================================================================

export interface Env {
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;

  // Admin authentication
  ADMIN_API_KEY: string;

  // GitHub API (for extension sync)
  GITHUB_API_TOKEN?: string;

  // Configuration
  ENVIRONMENT: 'development' | 'staging' | 'production';
  RATE_LIMIT_DOWNLOADS_PER_MINUTE: string;
  RATE_LIMIT_SUBMISSIONS_PER_HOUR: string;
  CACHE_TTL_SECONDS: string;

  // Cloudflare KV for rate limiting (optional)
  RATE_LIMIT_KV?: KVNamespace;
}

// ============================================================================
// Hono context variables
// ============================================================================

export interface Variables {
  supabase: SupabaseClient;
  supabaseAdmin: SupabaseClient;
  publisherEmail?: string;
  publisherId?: string;
  isAdmin: boolean;
  requestId: string;
}

// ============================================================================
// Database types (matching schema.sql)
// ============================================================================

export interface Publisher {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  support_email: string | null;
  support_url: string | null;
  verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  owner_email: string;
  api_key_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface Extension {
  id: string;
  publisher_id: string;
  name: string;
  display_name: string;
  description: string | null;
  long_description: string | null;
  icon_url: string | null;
  banner_url: string | null;
  repository_url: string;
  license: string;
  category: 'sandboxed' | 'native';
  categories: string[];
  tags: string[];
  verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  featured: boolean;
  featured_at: string | null;
  published: boolean;
  download_count: number;
  install_count: number;
  created_at: string;
  updated_at: string;
}

export interface ExtensionVersion {
  id: string;
  extension_id: string;
  version: string;
  prerelease: boolean;
  changelog: string | null;
  bundle_url: string;
  bundle_hash: string;
  bundle_size: number | null;
  signature: string | null;
  signing_key_id: string | null;
  min_app_version: string | null;
  max_app_version: string | null;
  manifest: Record<string, unknown>;
  published: boolean;
  yanked: boolean;
  yanked_reason: string | null;
  published_at: string;
  yanked_at: string | null;
}

export interface ExtensionReport {
  id: string;
  extension_id: string;
  version_id: string | null;
  reporter_email: string;
  reporter_org_id: string | null;
  reason: 'malicious' | 'security' | 'broken' | 'spam' | 'license' | 'other';
  details: string | null;
  evidence_urls: string[] | null;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'normal' | 'high' | 'critical';
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  action_taken: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExtensionDeprecation {
  id: string;
  extension_id: string;
  reason: string;
  replacement_id: string | null;
  migration_guide: string | null;
  deprecated_at: string;
  sunset_date: string | null;
  deprecated_by: string | null;
  active: boolean;
  created_at: string;
}

// ============================================================================
// API response types
// ============================================================================

export interface ExtensionListItem {
  id: string;
  publisher_slug: string;
  name: string;
  display_name: string;
  description: string | null;
  icon_url: string | null;
  category: 'sandboxed' | 'native';
  categories: string[];
  tags: string[];
  verified: boolean;
  featured: boolean;
  download_count: number;
  latest_version: string | null;
  created_at: string;
}

export interface ExtensionDetail extends Extension {
  publisher: Pick<Publisher, 'id' | 'name' | 'slug' | 'logo_url' | 'verified'>;
  latest_version: ExtensionVersion | null;
  stats: {
    total_downloads: number;
    total_installs: number;
    unique_orgs: number;
    avg_rating: number | null;
    review_count: number;
    version_count: number;
  };
  deprecation: ExtensionDeprecation | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ============================================================================
// Auth types
// ============================================================================

export interface AuthToken {
  email: string;
  sub: string;
  exp: number;
  iat: number;
}

/**
 * Authenticated admin user (Blue Robotics team member)
 */
export interface AdminUser {
  email: string;
  isAdmin: true;
}

/**
 * Google OAuth user info returned from Supabase auth
 */
export interface GoogleUser {
  id: string;
  email: string;
  email_verified: boolean;
  full_name?: string;
  avatar_url?: string;
  provider: 'google';
}

// ============================================================================
// Extension Submission types
// ============================================================================

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'needs_changes';

export interface ExtensionSubmission {
  id: string;
  submitter_email: string;
  submitter_name: string | null;
  repository_url: string;
  name: string;
  display_name: string;
  description: string | null;
  category: 'sandboxed' | 'native';
  publisher_id: string | null;
  status: SubmissionStatus;
  reviewer_email: string | null;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  extension_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionListItem extends ExtensionSubmission {
  // Extended with any joined data if needed
}

// ============================================================================
// GitHub API types
// ============================================================================

/**
 * GitHub Release from API
 */
export interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  prerelease: boolean;
  draft: boolean;
  published_at: string;
  assets: GitHubAsset[];
}

/**
 * GitHub Release Asset
 */
export interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

/**
 * Extension manifest from extension.json
 */
export interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  icon?: string;
  categories?: string[];
  license?: string;
  author?: string;
  homepage?: string;
  repository?: string;
  bugs?: string;
  engines?: {
    blueplm?: string;
  };
  [key: string]: unknown;
}

/**
 * Result of manifest validation
 */
export interface ManifestValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Result of downloading and hashing a .bpx file
 */
export interface BpxHashResult {
  hash: string;
  size: number;
}

/**
 * Result of syncing a single extension
 */
export interface ExtensionSyncResult {
  updated: boolean;
  latestVersion: string;
  newVersions: string[];
  error?: string;
}

/**
 * Result of bulk sync operation
 */
export interface BulkSyncResult {
  totalExtensions: number;
  synced: number;
  failed: number;
  newVersionsAdded: number;
  errors: Array<{
    extensionId: string;
    extensionName: string;
    error: string;
  }>;
}