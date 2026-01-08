import { Hono } from 'hono';
import type { Env, Variables, ExtensionListItem, ExtensionDetail, PaginatedResponse, ApiResponse } from '../types';
import {
  searchExtensionsSchema,
  createPublisherSchema,
  updatePublisherSchema,
  submitExtensionSchema,
  updateExtensionSchema,
  publishVersionSchema,
  submitReportSchema,
  recordInstallSchema,
} from '../schemas/store';
import { badRequest, notFound, unauthorized, conflict, rateLimitExceeded, forbidden } from '../utils/errors';
import { checkRateLimit, rateLimitHeaders } from '../utils/rate-limit';
import { withCache, noCacheHeaders, getCacheTtl } from '../utils/cache';

const store = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============================================================================
// PUBLIC ENDPOINTS (no auth required)
// ============================================================================

/**
 * GET /store/extensions - List/search extensions
 */
store.get('/extensions', async (c) => {
  const query = c.req.query();
  const parsed = searchExtensionsSchema.safeParse(query);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const { q, categories, type, verified, sort, page, limit } = parsed.data;
  const offset = (page - 1) * limit;

  const supabase = c.get('supabase');

  // Use the search_extensions function from the database
  const { data, error } = await supabase.rpc('search_extensions', {
    query: q || null,
    filter_categories: categories || null,
    verified_only: verified || false,
    extension_category: type || null,
    sort_by: sort,
    page_size: limit,
    page_offset: offset,
  });

  if (error) {
    console.error('Search error:', error);
    throw badRequest('Search failed');
  }

  // Get total count for pagination
  const { count } = await supabase
    .from('extensions')
    .select('*', { count: 'exact', head: true })
    .eq('published', true);

  const extensions: ExtensionListItem[] = (data || []).map((ext: Record<string, unknown>) => ({
    id: ext.id as string,
    publisher_slug: ext.publisher_slug as string,
    name: ext.name as string,
    display_name: ext.display_name as string,
    description: ext.description as string | null,
    icon_url: ext.icon_url as string | null,
    category: ext.category as 'sandboxed' | 'native',
    categories: ext.categories as string[],
    tags: ext.tags as string[],
    verified: ext.verified as boolean,
    featured: ext.featured as boolean,
    download_count: ext.download_count as number,
    latest_version: ext.latest_version as string | null,
    created_at: ext.created_at as string,
  }));

  const response: PaginatedResponse<ExtensionListItem> = {
    success: true,
    data: extensions,
    pagination: {
      page,
      limit,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit),
    },
  };

  const ttl = getCacheTtl(c.env);
  return c.json(response, 200, {
    'Cache-Control': `public, max-age=${ttl}, stale-while-revalidate=${ttl * 2}`,
  });
});

/**
 * GET /store/extensions/:id - Extension details
 */
store.get('/extensions/:id', async (c) => {
  const id = c.req.param('id');
  const supabase = c.get('supabase');

  // Get extension with publisher
  const { data: ext, error } = await supabase
    .from('extensions')
    .select(`
      *,
      publishers!inner (
        id,
        name,
        slug,
        logo_url,
        verified
      )
    `)
    .eq('id', id)
    .eq('published', true)
    .single();

  if (error || !ext) {
    throw notFound('Extension');
  }

  // Get latest version
  const { data: versions } = await supabase
    .from('extension_versions')
    .select('*')
    .eq('extension_id', id)
    .eq('published', true)
    .eq('yanked', false)
    .order('published_at', { ascending: false })
    .limit(1);

  // Get stats
  const { data: stats } = await supabase.rpc('get_extension_stats', {
    ext_id: id,
  });

  // Get active deprecation
  const { data: deprecation } = await supabase
    .from('extension_deprecations')
    .select('*')
    .eq('extension_id', id)
    .eq('active', true)
    .single();

  const detail: ExtensionDetail = {
    ...ext,
    publisher: ext.publishers,
    latest_version: versions?.[0] || null,
    stats: stats?.[0] || {
      total_downloads: ext.download_count,
      total_installs: ext.install_count,
      unique_orgs: 0,
      avg_rating: null,
      review_count: 0,
      version_count: 0,
    },
    deprecation: deprecation || null,
  };

  return withCache(c, detail);
});

/**
 * GET /store/extensions/:id/versions - Version history
 */
store.get('/extensions/:id/versions', async (c) => {
  const id = c.req.param('id');
  const includePrerelease = c.req.query('prerelease') === 'true';
  const supabase = c.get('supabase');

  // Verify extension exists
  const { data: ext } = await supabase
    .from('extensions')
    .select('id')
    .eq('id', id)
    .eq('published', true)
    .single();

  if (!ext) {
    throw notFound('Extension');
  }

  let query = supabase
    .from('extension_versions')
    .select('*')
    .eq('extension_id', id)
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (!includePrerelease) {
    query = query.eq('prerelease', false);
  }

  const { data: versions, error } = await query;

  if (error) {
    throw badRequest('Failed to fetch versions');
  }

  return withCache(c, versions || []);
});

/**
 * GET /store/extensions/:id/download - Download latest .bpx
 * GET /store/extensions/:id/download/:version - Download specific version
 */
store.get('/extensions/:id/download/:version?', async (c) => {
  const id = c.req.param('id');
  const version = c.req.param('version');
  const supabase = c.get('supabase');
  const supabaseAdmin = c.get('supabaseAdmin');

  // Rate limit downloads
  const clientIp = c.req.header('CF-Connecting-IP') || 'unknown';
  const limit = parseInt(c.env.RATE_LIMIT_DOWNLOADS_PER_MINUTE || '30', 10);
  const { allowed, resetAt } = await checkRateLimit(
    c.env,
    `download:${clientIp}`,
    limit,
    60 * 1000 // 1 minute
  );

  if (!allowed) {
    throw rateLimitExceeded(Math.ceil((resetAt - Date.now()) / 1000));
  }

  // Get the version
  let query = supabase
    .from('extension_versions')
    .select('*, extensions!inner(id, name, published)')
    .eq('extension_id', id)
    .eq('published', true)
    .eq('yanked', false);

  if (version) {
    query = query.eq('version', version);
  } else {
    query = query.eq('prerelease', false).order('published_at', { ascending: false }).limit(1);
  }

  const { data: versions, error } = await query;

  if (error || !versions?.[0]) {
    throw notFound('Version');
  }

  const ver = versions[0];

  // Increment download count (fire and forget)
  supabaseAdmin.rpc('increment_download_count', { ext_id: id }).then(() => {});

  // Return redirect to bundle URL
  return c.redirect(ver.bundle_url, 302);
});

/**
 * GET /store/extensions/:id/deprecation - Check deprecation status
 */
store.get('/extensions/:id/deprecation', async (c) => {
  const id = c.req.param('id');
  const supabase = c.get('supabase');

  const { data: deprecation } = await supabase
    .from('extension_deprecations')
    .select(`
      *,
      replacement:extensions!extension_deprecations_replacement_id_fkey (
        id,
        name,
        display_name
      )
    `)
    .eq('extension_id', id)
    .eq('active', true)
    .single();

  if (!deprecation) {
    return c.json({
      success: true,
      data: { deprecated: false },
    } as ApiResponse);
  }

  return c.json({
    success: true,
    data: {
      deprecated: true,
      ...deprecation,
    },
  } as ApiResponse);
});

/**
 * GET /store/featured - Featured extensions
 */
store.get('/featured', async (c) => {
  const limit = parseInt(c.req.query('limit') || '6', 10);
  const supabase = c.get('supabase');

  const { data, error } = await supabase.rpc('get_featured_extensions', {
    max_count: Math.min(limit, 12),
  });

  if (error) {
    console.error('Featured error:', error);
    throw badRequest('Failed to fetch featured extensions');
  }

  return withCache(c, data || [], getCacheTtl(c.env) * 2); // Cache featured longer
});

/**
 * GET /store/categories - List available categories
 */
store.get('/categories', async (c) => {
  // Static list of categories
  const categories = [
    { id: 'sync', name: 'Sync', description: 'File synchronization and backup' },
    { id: 'erp', name: 'ERP', description: 'Enterprise resource planning integrations' },
    { id: 'cad', name: 'CAD', description: 'CAD software integrations' },
    { id: 'backup', name: 'Backup', description: 'Backup and recovery' },
    { id: 'cloud', name: 'Cloud', description: 'Cloud storage services' },
    { id: 'notifications', name: 'Notifications', description: 'Alerts and notifications' },
    { id: 'collaboration', name: 'Collaboration', description: 'Team collaboration tools' },
    { id: 'ecommerce', name: 'E-commerce', description: 'Online store integrations' },
    { id: 'project-management', name: 'Project Management', description: 'Project tracking tools' },
    { id: 'manufacturing', name: 'Manufacturing', description: 'Manufacturing and production' },
    { id: 'preview', name: 'Preview', description: 'File preview and viewing' },
    { id: 'properties', name: 'Properties', description: 'Metadata and properties' },
  ];

  return withCache(c, categories, 3600); // Cache for 1 hour
});

// ============================================================================
// PUBLISHER ENDPOINTS (auth required)
// ============================================================================

/**
 * POST /store/publishers - Register as publisher
 */
store.post('/publishers', async (c) => {
  const email = c.get('publisherEmail');
  if (!email) {
    throw unauthorized('Authentication required');
  }

  const body = await c.req.json();
  const parsed = createPublisherSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const supabase = c.get('supabase');

  // Check if slug is taken
  const { data: existing } = await supabase
    .from('publishers')
    .select('id')
    .eq('slug', parsed.data.slug)
    .single();

  if (existing) {
    throw conflict('Publisher slug already taken');
  }

  // Check if user already has a publisher
  const { data: userPublisher } = await supabase
    .from('publishers')
    .select('id')
    .eq('owner_email', email)
    .single();

  if (userPublisher) {
    throw conflict('You already have a publisher account');
  }

  // Create publisher
  const { data: publisher, error } = await supabase
    .from('publishers')
    .insert({
      ...parsed.data,
      owner_email: email,
    })
    .select()
    .single();

  if (error) {
    console.error('Create publisher error:', error);
    throw badRequest('Failed to create publisher');
  }

  return c.json(
    { success: true, data: publisher } as ApiResponse,
    201,
    noCacheHeaders()
  );
});

/**
 * GET /store/publishers/me - My publisher profile
 */
store.get('/publishers/me', async (c) => {
  const email = c.get('publisherEmail');
  if (!email) {
    throw unauthorized('Authentication required');
  }

  const supabase = c.get('supabase');

  const { data: publisher, error } = await supabase
    .from('publishers')
    .select('*')
    .eq('owner_email', email)
    .single();

  if (error || !publisher) {
    throw notFound('Publisher profile');
  }

  // Get extension count
  const { count } = await supabase
    .from('extensions')
    .select('*', { count: 'exact', head: true })
    .eq('publisher_id', publisher.id);

  return c.json({
    success: true,
    data: {
      ...publisher,
      extension_count: count || 0,
    },
  } as ApiResponse);
});

/**
 * PUT /store/publishers/me - Update publisher profile
 */
store.put('/publishers/me', async (c) => {
  const email = c.get('publisherEmail');
  if (!email) {
    throw unauthorized('Authentication required');
  }

  const body = await c.req.json();
  const parsed = updatePublisherSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const supabase = c.get('supabase');

  const { data: publisher, error } = await supabase
    .from('publishers')
    .update(parsed.data)
    .eq('owner_email', email)
    .select()
    .single();

  if (error || !publisher) {
    throw notFound('Publisher profile');
  }

  return c.json({ success: true, data: publisher } as ApiResponse);
});

/**
 * POST /store/extensions - Submit new extension
 */
store.post('/extensions', async (c) => {
  const email = c.get('publisherEmail');
  if (!email) {
    throw unauthorized('Authentication required');
  }

  // Rate limit submissions
  const limit = parseInt(c.env.RATE_LIMIT_SUBMISSIONS_PER_HOUR || '10', 10);
  const rateLimitResult = await checkRateLimit(
    c.env,
    `submit:${email}`,
    limit,
    60 * 60 * 1000 // 1 hour
  );

  if (!rateLimitResult.allowed) {
    throw rateLimitExceeded(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
  }

  const body = await c.req.json();
  const parsed = submitExtensionSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const supabase = c.get('supabase');

  // Get publisher
  const { data: publisher } = await supabase
    .from('publishers')
    .select('id, verified')
    .eq('owner_email', email)
    .single();

  if (!publisher) {
    throw forbidden('You must register as a publisher first');
  }

  // Native extensions require verified publisher
  if (parsed.data.category === 'native' && !publisher.verified) {
    throw forbidden('Native extensions require a verified publisher');
  }

  // Check if extension name is taken for this publisher
  const { data: existing } = await supabase
    .from('extensions')
    .select('id')
    .eq('publisher_id', publisher.id)
    .eq('name', parsed.data.name)
    .single();

  if (existing) {
    throw conflict('Extension name already taken');
  }

  // Create extension
  const { data: extension, error } = await supabase
    .from('extensions')
    .insert({
      ...parsed.data,
      publisher_id: publisher.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Create extension error:', error);
    throw badRequest('Failed to create extension');
  }

  return c.json(
    { success: true, data: extension } as ApiResponse,
    201,
    {
      ...noCacheHeaders(),
      ...rateLimitHeaders(limit, rateLimitResult.remaining, rateLimitResult.resetAt),
    }
  );
});

/**
 * PUT /store/extensions/:id - Update extension metadata
 */
store.put('/extensions/:id', async (c) => {
  const email = c.get('publisherEmail');
  if (!email) {
    throw unauthorized('Authentication required');
  }

  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateExtensionSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const supabase = c.get('supabase');

  // Verify ownership
  const { data: ext } = await supabase
    .from('extensions')
    .select('id, publishers!inner(owner_email)')
    .eq('id', id)
    .single();

  if (!ext) {
    throw notFound('Extension');
  }

  const publishers = ext.publishers as unknown as { owner_email: string };
  if (publishers.owner_email !== email) {
    throw forbidden('You do not own this extension');
  }

  // Update extension
  const { data: updated, error } = await supabase
    .from('extensions')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update extension error:', error);
    throw badRequest('Failed to update extension');
  }

  return c.json({ success: true, data: updated } as ApiResponse);
});

/**
 * POST /store/extensions/:id/versions - Publish new version
 */
store.post('/extensions/:id/versions', async (c) => {
  const email = c.get('publisherEmail');
  if (!email) {
    throw unauthorized('Authentication required');
  }

  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = publishVersionSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const supabase = c.get('supabase');

  // Verify ownership
  const { data: ext } = await supabase
    .from('extensions')
    .select('id, publishers!inner(owner_email)')
    .eq('id', id)
    .single();

  if (!ext) {
    throw notFound('Extension');
  }

  const publishers = ext.publishers as unknown as { owner_email: string };
  if (publishers.owner_email !== email) {
    throw forbidden('You do not own this extension');
  }

  // Check if version already exists
  const { data: existingVer } = await supabase
    .from('extension_versions')
    .select('id')
    .eq('extension_id', id)
    .eq('version', parsed.data.version)
    .single();

  if (existingVer) {
    throw conflict(`Version ${parsed.data.version} already exists`);
  }

  // Create version
  const { data: version, error } = await supabase
    .from('extension_versions')
    .insert({
      ...parsed.data,
      extension_id: id,
    })
    .select()
    .single();

  if (error) {
    console.error('Create version error:', error);
    throw badRequest('Failed to publish version');
  }

  return c.json(
    { success: true, data: version } as ApiResponse,
    201,
    noCacheHeaders()
  );
});

/**
 * POST /store/extensions/:id/report - Report extension
 */
store.post('/extensions/:id/report', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = submitReportSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  // Rate limit reports
  const clientIp = c.req.header('CF-Connecting-IP') || 'unknown';
  const { allowed, resetAt } = await checkRateLimit(
    c.env,
    `report:${clientIp}`,
    5,
    60 * 60 * 1000 // 1 hour
  );

  if (!allowed) {
    throw rateLimitExceeded(Math.ceil((resetAt - Date.now()) / 1000));
  }

  const supabase = c.get('supabase');

  // Verify extension exists
  const { data: ext } = await supabase
    .from('extensions')
    .select('id')
    .eq('id', id)
    .eq('published', true)
    .single();

  if (!ext) {
    throw notFound('Extension');
  }

  // Get reporter email (optional auth)
  const reporterEmail = c.get('publisherEmail') || c.req.header('X-Reporter-Email') || 'anonymous@unknown';

  // Create report
  const { data: report, error } = await supabase
    .from('extension_reports')
    .insert({
      extension_id: id,
      reporter_email: reporterEmail,
      ...parsed.data,
    })
    .select()
    .single();

  if (error) {
    console.error('Create report error:', error);
    throw badRequest('Failed to submit report');
  }

  return c.json(
    {
      success: true,
      message: 'Report submitted successfully',
      data: { id: report.id },
    } as ApiResponse,
    201
  );
});

/**
 * POST /store/extensions/:id/install - Record install analytics
 */
store.post('/extensions/:id/install', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = recordInstallSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const supabaseAdmin = c.get('supabaseAdmin');

  // Record install (fire and forget for speed)
  supabaseAdmin.rpc('record_install', {
    p_extension_id: id,
    p_version: parsed.data.version,
    p_app_version: parsed.data.app_version,
    p_platform: parsed.data.platform,
    p_arch: parsed.data.arch,
    p_org_hash: parsed.data.org_hash || null,
    p_install_type: parsed.data.install_type,
  }).then(() => {});

  return c.json({ success: true } as ApiResponse, 202);
});

export default store;
