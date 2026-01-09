/**
 * API client for the BluePLM Extension Store
 * Connects to Agent 8's Store API endpoints
 */

const API_BASE = import.meta.env.VITE_STORE_API_URL || '/api';

// ============================================================================
// Types (matching Agent 8's API responses)
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
  owner_email?: string;
  created_at: string;
  updated_at: string;
}

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

export interface ExtensionVersion {
  id: string;
  extension_id: string;
  version: string;
  prerelease: boolean;
  changelog: string | null;
  bundle_url: string;
  bundle_hash: string;
  bundle_size: number | null;
  min_app_version: string | null;
  max_app_version: string | null;
  published_at: string;
}

export interface ExtensionDetail {
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
  featured: boolean;
  published: boolean;
  download_count: number;
  install_count: number;
  created_at: string;
  updated_at: string;
  publisher: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    verified: boolean;
  };
  latest_version: ExtensionVersion | null;
  stats: {
    total_downloads: number;
    total_installs: number;
    unique_orgs: number;
    avg_rating: number | null;
    review_count: number;
    version_count: number;
  };
  deprecation: {
    id: string;
    reason: string;
    replacement_id: string | null;
    migration_guide: string | null;
    deprecated_at: string;
    sunset_date: string | null;
    active: boolean;
  } | null;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface SearchParams {
  q?: string;
  categories?: string;
  type?: 'sandboxed' | 'native';
  verified?: boolean;
  sort?: 'popular' | 'recent' | 'name' | 'downloads';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// Helper functions
// ============================================================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(
      error.error || `HTTP ${response.status}`,
      response.status,
      error.code
    );
  }
  return response.json();
}

// ============================================================================
// Public API functions
// ============================================================================

/**
 * Search and list extensions
 */
export async function fetchExtensions(params: SearchParams = {}): Promise<PaginatedResponse<ExtensionListItem>> {
  const searchParams = new URLSearchParams();
  
  // Map frontend sort values to API values
  const sortMap: Record<string, string> = {
    'popular': 'downloads',
    'recent': 'newest',
    'name': 'name',
    'downloads': 'downloads',
  };
  
  if (params.q) searchParams.set('q', params.q);
  if (params.categories) searchParams.set('categories', params.categories);
  if (params.type) searchParams.set('type', params.type);
  if (params.verified) searchParams.set('verified', 'true');
  if (params.sort) searchParams.set('sort', sortMap[params.sort] || 'downloads');
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  
  const response = await fetch(`${API_BASE}/store/extensions?${searchParams}`);
  return handleResponse<PaginatedResponse<ExtensionListItem>>(response);
}

/**
 * Get extension details by ID
 */
export async function fetchExtension(id: string): Promise<ExtensionDetail> {
  const response = await fetch(`${API_BASE}/store/extensions/${id}`);
  const result = await handleResponse<ApiResponse<ExtensionDetail>>(response);
  return result.data;
}

/**
 * Get extension version history
 */
export async function fetchExtensionVersions(id: string, includePrerelease = false): Promise<ExtensionVersion[]> {
  const params = includePrerelease ? '?prerelease=true' : '';
  const response = await fetch(`${API_BASE}/store/extensions/${id}/versions${params}`);
  const result = await handleResponse<ApiResponse<ExtensionVersion[]>>(response);
  return result.data;
}

/**
 * Get featured extensions
 */
export async function fetchFeatured(limit = 6): Promise<ExtensionListItem[]> {
  const response = await fetch(`${API_BASE}/store/featured?limit=${limit}`);
  const result = await handleResponse<ApiResponse<ExtensionListItem[]>>(response);
  return result.data;
}

/**
 * Get available categories
 */
export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/store/categories`);
  const result = await handleResponse<ApiResponse<Category[]>>(response);
  return result.data;
}

/**
 * Get publisher profile by ID
 * NOTE: This endpoint needs to be added to the Store API
 * Currently the API only has authenticated /publishers/me endpoint
 */
export async function fetchPublisher(id: string): Promise<Publisher & { extensions: ExtensionListItem[]; stats: { extensions: number; totalDownloads: number } }> {
  // First, try to get extensions by this publisher to extract publisher info
  const extensionsResponse = await fetchExtensions({ q: '', limit: 50 });
  
  // Filter extensions by publisher slug
  const publisherExtensions = extensionsResponse.data.filter(
    ext => ext.publisher_slug === id
  );
  
  if (publisherExtensions.length === 0) {
    throw new ApiError('Publisher not found', 404);
  }
  
  // Get full details of first extension to get publisher info
  const firstExtension = await fetchExtension(publisherExtensions[0].id);
  
  // Calculate stats
  const totalDownloads = publisherExtensions.reduce((sum, ext) => sum + ext.download_count, 0);
  
  // Build publisher response from available data
  return {
    id: firstExtension.publisher.id,
    name: firstExtension.publisher.name,
    slug: firstExtension.publisher.slug,
    description: null, // Not available without dedicated endpoint
    website_url: null,
    logo_url: firstExtension.publisher.logo_url,
    support_email: null,
    support_url: null,
    verified: firstExtension.publisher.verified,
    verified_at: null,
    created_at: '', // Not available
    updated_at: '',
    extensions: publisherExtensions,
    stats: {
      extensions: publisherExtensions.length,
      totalDownloads,
    },
  };
}

/**
 * Submit extension for review (public - no auth required)
 */
export async function submitExtension(data: {
  repositoryUrl: string;
  email: string;
  name?: string;
}): Promise<{ id: string }> {
  const response = await fetch(`${API_BASE}/store/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repository_url: data.repositoryUrl,
      submitter_email: data.email,
      submitter_name: data.name || undefined,
    }),
  });
  
  const result = await handleResponse<ApiResponse<{ id: string }>>(response);
  return result.data;
}

/**
 * Sync extension with GitHub to check for updates
 */
export async function syncExtension(extensionName: string): Promise<{
  updated: boolean;
  latestVersion: string;
  newVersions: string[];
}> {
  const response = await fetch(`${API_BASE}/store/extensions/${extensionName}/sync`, {
    method: 'POST',
  });
  const result = await handleResponse<ApiResponse<{
    updated: boolean;
    latestVersion: string;
    newVersions: string[];
  }>>(response);
  return result.data;
}

/**
 * Report an extension
 */
export async function reportExtension(
  extensionId: string,
  data: {
    reason: 'malicious' | 'security' | 'broken' | 'spam' | 'license' | 'other';
    details?: string;
  }
): Promise<{ id: string }> {
  const response = await fetch(`${API_BASE}/store/extensions/${extensionId}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  const result = await handleResponse<ApiResponse<{ id: string }>>(response);
  return result.data;
}

// ============================================================================
// Admin API types
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

export interface SubmissionListParams {
  status?: SubmissionStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Admin API functions (requires @bluerobotics.com authentication)
// ============================================================================

/**
 * Create authenticated headers for admin API calls
 */
function getAdminHeaders(accessToken: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };
}

/**
 * List submissions with filters and pagination (admin only)
 */
export async function fetchSubmissions(
  accessToken: string,
  params: SubmissionListParams = {}
): Promise<PaginatedResponse<ExtensionSubmission>> {
  const searchParams = new URLSearchParams();
  
  if (params.status) searchParams.set('status', params.status);
  if (params.search) searchParams.set('search', params.search);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  
  const response = await fetch(`${API_BASE}/admin/submissions?${searchParams}`, {
    headers: getAdminHeaders(accessToken),
  });
  
  return handleResponse<PaginatedResponse<ExtensionSubmission>>(response);
}

/**
 * Get pending submission count (admin only)
 */
export async function fetchPendingCount(
  accessToken: string
): Promise<number> {
  const response = await fetch(`${API_BASE}/admin/submissions/count`, {
    headers: getAdminHeaders(accessToken),
  });
  
  const result = await handleResponse<ApiResponse<{ count: number }>>(response);
  return result.data?.count || 0;
}

/**
 * Get submission details (admin only)
 */
export async function fetchSubmission(
  accessToken: string,
  id: string
): Promise<ExtensionSubmission> {
  const response = await fetch(`${API_BASE}/admin/submissions/${id}`, {
    headers: getAdminHeaders(accessToken),
  });
  
  const result = await handleResponse<ApiResponse<ExtensionSubmission>>(response);
  return result.data!;
}

/**
 * Approve a submission (admin only)
 */
export async function approveSubmission(
  accessToken: string,
  id: string,
  data: { notes?: string; publisher_id?: string }
): Promise<{ submission: ExtensionSubmission; extension_id: string }> {
  const response = await fetch(`${API_BASE}/admin/submissions/${id}/approve`, {
    method: 'POST',
    headers: getAdminHeaders(accessToken),
    body: JSON.stringify(data),
  });
  
  const result = await handleResponse<ApiResponse<{ submission: ExtensionSubmission; extension_id: string }>>(response);
  return result.data!;
}

/**
 * Reject a submission (admin only)
 * Notes are required (min 10 characters)
 */
export async function rejectSubmission(
  accessToken: string,
  id: string,
  notes: string
): Promise<ExtensionSubmission> {
  const response = await fetch(`${API_BASE}/admin/submissions/${id}/reject`, {
    method: 'POST',
    headers: getAdminHeaders(accessToken),
    body: JSON.stringify({ notes }),
  });
  
  const result = await handleResponse<ApiResponse<ExtensionSubmission>>(response);
  return result.data!;
}

/**
 * Request changes on a submission (admin only)
 * Notes are required (min 10 characters)
 */
export async function requestChangesSubmission(
  accessToken: string,
  id: string,
  notes: string
): Promise<ExtensionSubmission> {
  const response = await fetch(`${API_BASE}/admin/submissions/${id}/request-changes`, {
    method: 'POST',
    headers: getAdminHeaders(accessToken),
    body: JSON.stringify({ notes }),
  });
  
  const result = await handleResponse<ApiResponse<ExtensionSubmission>>(response);
  return result.data!;
}

// ============================================================================
// Admin Extension Management API
// ============================================================================

export interface AdminExtension {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon_url: string | null;
  category: 'sandboxed' | 'native';
  categories: string[];
  tags: string[];
  verified: boolean;
  featured: boolean;
  published: boolean;
  download_count: number;
  install_count: number;
  version_count: number;
  created_at: string;
  updated_at: string;
  publisher: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    verified: boolean;
  };
}

export type ExtensionPublishStatus = 'all' | 'published' | 'unpublished';

export interface AdminExtensionListParams {
  status?: ExtensionPublishStatus;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * List all extensions including unpublished (admin only)
 */
export async function fetchAdminExtensions(
  accessToken: string,
  params: AdminExtensionListParams = {}
): Promise<PaginatedResponse<AdminExtension>> {
  const searchParams = new URLSearchParams();
  
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.search) searchParams.set('search', params.search);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  
  const response = await fetch(`${API_BASE}/admin/extensions?${searchParams}`, {
    headers: getAdminHeaders(accessToken),
  });
  
  return handleResponse<PaginatedResponse<AdminExtension>>(response);
}

/**
 * Unpublish (soft delete) an extension (admin only)
 */
export async function unpublishExtension(
  accessToken: string,
  id: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/extensions/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders(accessToken),
  });
  
  await handleResponse<ApiResponse<void>>(response);
}

/**
 * Restore an unpublished extension (admin only)
 */
export async function restoreExtension(
  accessToken: string,
  id: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/extensions/${id}/restore`, {
    method: 'POST',
    headers: getAdminHeaders(accessToken),
  });
  
  await handleResponse<ApiResponse<void>>(response);
}

/**
 * Permanently delete an extension (admin only)
 * Only works on unpublished extensions.
 */
export async function deleteExtensionPermanently(
  accessToken: string,
  id: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/extensions/${id}/permanent`, {
    method: 'DELETE',
    headers: getAdminHeaders(accessToken),
  });
  
  await handleResponse<ApiResponse<void>>(response);
}

/**
 * Toggle extension verification status (admin only)
 */
export async function setExtensionVerified(
  accessToken: string,
  id: string,
  verified: boolean
): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/extensions/${id}/verify`, {
    method: 'POST',
    headers: getAdminHeaders(accessToken),
    body: JSON.stringify({ verified }),
  });
  
  await handleResponse<ApiResponse<void>>(response);
}

/**
 * Toggle extension featured status (admin only)
 */
export async function setExtensionFeatured(
  accessToken: string,
  id: string,
  featured: boolean
): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/extensions/${id}/feature`, {
    method: 'POST',
    headers: getAdminHeaders(accessToken),
    body: JSON.stringify({ featured }),
  });
  
  await handleResponse<ApiResponse<void>>(response);
}