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
  
  if (params.q) searchParams.set('q', params.q);
  if (params.categories) searchParams.set('categories', params.categories);
  if (params.type) searchParams.set('type', params.type);
  if (params.verified) searchParams.set('verified', 'true');
  if (params.sort) searchParams.set('sort', params.sort);
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
 * Submit extension for review (requires authentication)
 */
export async function submitExtension(data: {
  repositoryUrl: string;
  email: string;
}): Promise<{ id: string }> {
  // For now, this is a simplified submission that just records interest
  // Full submission requires authentication and publisher account
  const response = await fetch(`${API_BASE}/store/extensions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repository_url: data.repositoryUrl,
      contact_email: data.email,
    }),
  });
  
  // If unauthorized, that's expected - user needs to authenticate first
  if (response.status === 401) {
    throw new ApiError('Authentication required. Please sign in to submit extensions.', 401);
  }
  
  const result = await handleResponse<ApiResponse<{ id: string }>>(response);
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
