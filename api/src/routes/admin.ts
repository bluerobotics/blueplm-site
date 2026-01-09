import { Hono } from 'hono';
import type { Env, Variables, ApiResponse, ExtensionReport, PaginatedResponse } from '../types';
import {
  verifyExtensionSchema,
  featureExtensionSchema,
  deprecateExtensionSchema,
  updateReportSchema,
} from '../schemas/store';
import { badRequest, notFound, forbidden } from '../utils/errors';
import { noCacheHeaders } from '../utils/cache';

const admin = new Hono<{ Bindings: Env; Variables: Variables }>();

// Admin middleware - all routes require admin access
admin.use('*', async (c, next) => {
  const isAdmin = c.get('isAdmin');
  if (!isAdmin) {
    throw forbidden('Admin access required');
  }
  await next();
});

// ============================================================================
// ADMIN ENDPOINTS (Blue Robotics only)
// ============================================================================

/**
 * POST /admin/extensions/:id/verify - Mark extension as verified
 */
admin.post('/extensions/:id/verify', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = verifyExtensionSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const supabaseAdmin = c.get('supabaseAdmin');

  // Get extension
  const { data: ext } = await supabaseAdmin
    .from('extensions')
    .select('id, verified')
    .eq('id', id)
    .single();

  if (!ext) {
    throw notFound('Extension');
  }

  // Update verification status
  const updateData = parsed.data.verified
    ? {
        verified: true,
        verified_at: new Date().toISOString(),
        verified_by: c.get('publisherEmail') || 'admin',
      }
    : {
        verified: false,
        verified_at: null,
        verified_by: null,
      };

  const { data: updated, error } = await supabaseAdmin
    .from('extensions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Verify extension error:', error);
    throw badRequest('Failed to update verification status');
  }

  return c.json(
    {
      success: true,
      message: parsed.data.verified
        ? 'Extension verified successfully'
        : 'Extension verification removed',
      data: updated,
    } as ApiResponse,
    200,
    noCacheHeaders()
  );
});

/**
 * POST /admin/extensions/:id/feature - Mark extension as featured
 */
admin.post('/extensions/:id/feature', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = featureExtensionSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const supabaseAdmin = c.get('supabaseAdmin');

  // Get extension
  const { data: ext } = await supabaseAdmin
    .from('extensions')
    .select('id, featured')
    .eq('id', id)
    .single();

  if (!ext) {
    throw notFound('Extension');
  }

  // Update featured status
  const updateData = parsed.data.featured
    ? {
        featured: true,
        featured_at: new Date().toISOString(),
      }
    : {
        featured: false,
        featured_at: null,
      };

  const { data: updated, error } = await supabaseAdmin
    .from('extensions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Feature extension error:', error);
    throw badRequest('Failed to update featured status');
  }

  return c.json(
    {
      success: true,
      message: parsed.data.featured
        ? 'Extension featured successfully'
        : 'Extension removed from featured',
      data: updated,
    } as ApiResponse,
    200,
    noCacheHeaders()
  );
});

/**
 * POST /admin/extensions/:id/deprecate - Deprecate extension
 */
admin.post('/extensions/:id/deprecate', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = deprecateExtensionSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const supabaseAdmin = c.get('supabaseAdmin');

  // Get extension
  const { data: ext } = await supabaseAdmin
    .from('extensions')
    .select('id')
    .eq('id', id)
    .single();

  if (!ext) {
    throw notFound('Extension');
  }

  // Check if replacement exists (if specified)
  if (parsed.data.replacement_id) {
    const { data: replacement } = await supabaseAdmin
      .from('extensions')
      .select('id')
      .eq('id', parsed.data.replacement_id)
      .single();

    if (!replacement) {
      throw badRequest('Replacement extension not found');
    }
  }

  // Check for existing active deprecation
  const { data: existingDep } = await supabaseAdmin
    .from('extension_deprecations')
    .select('id')
    .eq('extension_id', id)
    .eq('active', true)
    .single();

  if (existingDep) {
    // Update existing deprecation
    await supabaseAdmin
      .from('extension_deprecations')
      .update({ active: false })
      .eq('id', existingDep.id);
  }

  // Create deprecation notice
  const { data: deprecation, error } = await supabaseAdmin
    .from('extension_deprecations')
    .insert({
      extension_id: id,
      reason: parsed.data.reason,
      replacement_id: parsed.data.replacement_id || null,
      migration_guide: parsed.data.migration_guide || null,
      sunset_date: parsed.data.sunset_date || null,
      deprecated_by: c.get('publisherEmail') || 'admin',
    })
    .select()
    .single();

  if (error) {
    console.error('Deprecate extension error:', error);
    throw badRequest('Failed to deprecate extension');
  }

  return c.json(
    {
      success: true,
      message: 'Extension deprecated successfully',
      data: deprecation,
    } as ApiResponse,
    201,
    noCacheHeaders()
  );
});

/**
 * DELETE /admin/extensions/:id/deprecate - Remove deprecation
 */
admin.delete('/extensions/:id/deprecate', async (c) => {
  const id = c.req.param('id');
  const supabaseAdmin = c.get('supabaseAdmin');

  const { data: deprecation, error } = await supabaseAdmin
    .from('extension_deprecations')
    .update({ active: false })
    .eq('extension_id', id)
    .eq('active', true)
    .select()
    .single();

  if (error || !deprecation) {
    throw notFound('Active deprecation');
  }

  return c.json(
    {
      success: true,
      message: 'Deprecation removed successfully',
    } as ApiResponse,
    200,
    noCacheHeaders()
  );
});

/**
 * GET /admin/extensions - List all extensions (including unpublished)
 */
admin.get('/extensions', async (c) => {
  const status = c.req.query('status'); // 'all' | 'published' | 'unpublished'
  const search = c.req.query('search');
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '20', 10);
  const offset = (page - 1) * limit;

  const supabaseAdmin = c.get('supabaseAdmin');

  let query = supabaseAdmin
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
    `, { count: 'exact' });

  // Filter by published status
  if (status === 'published') {
    query = query.eq('published', true);
  } else if (status === 'unpublished') {
    query = query.eq('published', false);
  }
  // 'all' or undefined shows all

  // Search by name or display_name
  if (search) {
    query = query.or(`name.ilike.%${search}%,display_name.ilike.%${search}%`);
  }

  // Order and paginate
  query = query
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: extensions, error, count } = await query;

  if (error) {
    console.error('List extensions error:', error);
    throw badRequest('Failed to list extensions');
  }

  // Get version counts for each extension
  const extensionIds = extensions?.map(e => e.id) || [];
  let versionCounts: Record<string, number> = {};
  
  if (extensionIds.length > 0) {
    const { data: versions } = await supabaseAdmin
      .from('extension_versions')
      .select('extension_id')
      .in('extension_id', extensionIds);
    
    if (versions) {
      versionCounts = versions.reduce((acc, v) => {
        acc[v.extension_id] = (acc[v.extension_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }
  }

  const response: PaginatedResponse<unknown> = {
    success: true,
    data: (extensions || []).map(ext => ({
      id: ext.id,
      name: ext.name,
      display_name: ext.display_name,
      description: ext.description,
      icon_url: ext.icon_url,
      category: ext.category,
      categories: ext.categories,
      tags: ext.tags,
      verified: ext.verified,
      featured: ext.featured,
      published: ext.published,
      download_count: ext.download_count,
      install_count: ext.install_count,
      version_count: versionCounts[ext.id] || 0,
      created_at: ext.created_at,
      updated_at: ext.updated_at,
      publisher: ext.publishers,
    })),
    pagination: {
      page,
      limit,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit),
    },
  };

  return c.json(response, 200, noCacheHeaders());
});

/**
 * GET /admin/reports - List all reports
 */
admin.get('/reports', async (c) => {
  const status = c.req.query('status');
  const priority = c.req.query('priority');
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '20', 10);
  const offset = (page - 1) * limit;

  const supabaseAdmin = c.get('supabaseAdmin');

  let query = supabaseAdmin
    .from('extension_reports')
    .select(`
      *,
      extensions!inner (
        id,
        name,
        display_name,
        publishers!inner (
          slug,
          name
        )
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }
  if (priority) {
    query = query.eq('priority', priority);
  }

  const { data: reports, count, error } = await query;

  if (error) {
    console.error('List reports error:', error);
    throw badRequest('Failed to fetch reports');
  }

  const response: PaginatedResponse<ExtensionReport> = {
    success: true,
    data: reports || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit),
    },
  };

  return c.json(response);
});

/**
 * GET /admin/reports/:id - Get report details
 */
admin.get('/reports/:id', async (c) => {
  const id = c.req.param('id');
  const supabaseAdmin = c.get('supabaseAdmin');

  const { data: report, error } = await supabaseAdmin
    .from('extension_reports')
    .select(`
      *,
      extensions!inner (
        id,
        name,
        display_name,
        publishers!inner (
          slug,
          name,
          owner_email
        )
      ),
      version:extension_versions (
        version,
        published_at
      )
    `)
    .eq('id', id)
    .single();

  if (error || !report) {
    throw notFound('Report');
  }

  return c.json({ success: true, data: report } as ApiResponse);
});

/**
 * PUT /admin/reports/:id - Update report status
 */
admin.put('/reports/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateReportSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const supabaseAdmin = c.get('supabaseAdmin');

  // Build update data
  const updateData: Record<string, unknown> = { ...parsed.data };

  if (parsed.data.status === 'resolved' || parsed.data.status === 'dismissed') {
    updateData.resolved_at = new Date().toISOString();
    updateData.resolved_by = c.get('publisherEmail') || 'admin';
  }

  const { data: report, error } = await supabaseAdmin
    .from('extension_reports')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !report) {
    throw notFound('Report');
  }

  return c.json(
    {
      success: true,
      message: 'Report updated successfully',
      data: report,
    } as ApiResponse,
    200,
    noCacheHeaders()
  );
});

/**
 * DELETE /admin/extensions/:id - Remove extension (soft delete / unpublish)
 */
admin.delete('/extensions/:id', async (c) => {
  const id = c.req.param('id');
  const supabaseAdmin = c.get('supabaseAdmin');

  const { data: ext, error } = await supabaseAdmin
    .from('extensions')
    .update({ published: false })
    .eq('id', id)
    .select()
    .single();

  if (error || !ext) {
    throw notFound('Extension');
  }

  return c.json(
    {
      success: true,
      message: 'Extension unpublished successfully',
    } as ApiResponse,
    200,
    noCacheHeaders()
  );
});

/**
 * DELETE /admin/extensions/:id/permanent - Permanently delete extension
 * This removes the extension and all related data from the database.
 * Only works on unpublished extensions as a safety measure.
 */
admin.delete('/extensions/:id/permanent', async (c) => {
  const id = c.req.param('id');
  const supabaseAdmin = c.get('supabaseAdmin');

  // First check if extension exists and is unpublished
  const { data: ext, error: fetchError } = await supabaseAdmin
    .from('extensions')
    .select('id, name, published')
    .eq('id', id)
    .single();

  if (fetchError || !ext) {
    throw notFound('Extension');
  }

  // Safety check: only allow permanent deletion of unpublished extensions
  if (ext.published) {
    throw badRequest('Cannot permanently delete a published extension. Unpublish it first.');
  }

  // Delete related data first (due to foreign key constraints)
  // Delete extension versions
  await supabaseAdmin
    .from('extension_versions')
    .delete()
    .eq('extension_id', id);

  // Delete extension installs
  await supabaseAdmin
    .from('extension_installs')
    .delete()
    .eq('extension_id', id);

  // Delete extension reports
  await supabaseAdmin
    .from('extension_reports')
    .delete()
    .eq('extension_id', id);

  // Delete extension deprecations
  await supabaseAdmin
    .from('extension_deprecations')
    .delete()
    .eq('extension_id', id);

  // Finally delete the extension itself
  const { error: deleteError } = await supabaseAdmin
    .from('extensions')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Permanent delete error:', deleteError);
    throw badRequest('Failed to delete extension');
  }

  return c.json(
    {
      success: true,
      message: `Extension "${ext.name}" permanently deleted`,
    } as ApiResponse,
    200,
    noCacheHeaders()
  );
});

/**
 * POST /admin/extensions/:id/restore - Restore unpublished extension
 */
admin.post('/extensions/:id/restore', async (c) => {
  const id = c.req.param('id');
  const supabaseAdmin = c.get('supabaseAdmin');

  const { data: ext, error } = await supabaseAdmin
    .from('extensions')
    .update({ published: true })
    .eq('id', id)
    .select()
    .single();

  if (error || !ext) {
    throw notFound('Extension');
  }

  return c.json(
    {
      success: true,
      message: 'Extension restored successfully',
      data: ext,
    } as ApiResponse,
    200,
    noCacheHeaders()
  );
});

export default admin;
