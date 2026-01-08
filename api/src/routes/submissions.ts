import { Hono } from 'hono';
import type { Env, Variables, ApiResponse, ExtensionSubmission, PaginatedResponse } from '../types';
import {
  createSubmissionSchema,
  listSubmissionsSchema,
  approveSubmissionSchema,
  rejectSubmissionSchema,
  requestChangesSchema,
} from '../schemas/submissions';
import { badRequest, notFound, forbidden, rateLimitExceeded } from '../utils/errors';
import { checkRateLimit, rateLimitHeaders } from '../utils/rate-limit';
import { noCacheHeaders } from '../utils/cache';

// ============================================================================
// PUBLIC SUBMISSION ROUTES (mounted at /store/submissions)
// ============================================================================

export const storeSubmissions = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * POST /store/submissions - Submit extension for review (public)
 * 
 * Allows anyone to submit an extension for review by the Blue Robotics team.
 * Rate limited to prevent spam.
 */
storeSubmissions.post('/', async (c) => {
  // Rate limit submissions by IP
  const clientIp = c.req.header('CF-Connecting-IP') || 'unknown';
  const limit = parseInt(c.env.RATE_LIMIT_SUBMISSIONS_PER_HOUR || '5', 10);
  const rateLimitResult = await checkRateLimit(
    c.env,
    `submission:${clientIp}`,
    limit,
    60 * 60 * 1000 // 1 hour
  );

  if (!rateLimitResult.allowed) {
    throw rateLimitExceeded(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
  }

  const body = await c.req.json();
  const parsed = createSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const supabaseAdmin = c.get('supabaseAdmin');

  // Check for duplicate submission (same repo URL pending)
  const { data: existing } = await supabaseAdmin
    .from('extension_submissions')
    .select('id')
    .eq('repository_url', parsed.data.repository_url)
    .eq('status', 'pending')
    .single();

  if (existing) {
    throw badRequest('A submission for this repository is already pending review');
  }

  // Check for duplicate name pending
  const { data: existingName } = await supabaseAdmin
    .from('extension_submissions')
    .select('id')
    .eq('name', parsed.data.name)
    .eq('status', 'pending')
    .single();

  if (existingName) {
    throw badRequest('An extension with this name is already pending review');
  }

  // Create submission
  const { data: submission, error } = await supabaseAdmin
    .from('extension_submissions')
    .insert({
      submitter_email: parsed.data.submitter_email,
      submitter_name: parsed.data.submitter_name || null,
      repository_url: parsed.data.repository_url,
      name: parsed.data.name,
      display_name: parsed.data.display_name,
      description: parsed.data.description || null,
      category: parsed.data.category,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Create submission error:', error);
    throw badRequest('Failed to create submission');
  }

  return c.json(
    {
      success: true,
      message: 'Extension submitted for review. You will be notified when it is reviewed.',
      data: {
        id: submission.id,
        status: submission.status,
        created_at: submission.created_at,
      },
    } as ApiResponse,
    201,
    {
      ...noCacheHeaders(),
      ...rateLimitHeaders(limit, rateLimitResult.remaining, rateLimitResult.resetAt),
    }
  );
});

// ============================================================================
// ADMIN SUBMISSION ROUTES (mounted at /admin/submissions)
// ============================================================================

export const adminSubmissions = new Hono<{ Bindings: Env; Variables: Variables }>();

// Admin middleware - all routes require admin access
adminSubmissions.use('*', async (c, next) => {
  const isAdmin = c.get('isAdmin');
  if (!isAdmin) {
    throw forbidden('Admin access required');
  }
  await next();
});

/**
 * GET /admin/submissions - List submissions (admin only)
 * 
 * Returns paginated list of submissions with optional status filter and search.
 */
adminSubmissions.get('/', async (c) => {
  const query = c.req.query();
  const parsed = listSubmissionsSchema.safeParse(query);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const { status, search, page, limit } = parsed.data;
  const offset = (page - 1) * limit;

  const supabaseAdmin = c.get('supabaseAdmin');

  // Use the database function for listing
  const { data, error } = await supabaseAdmin.rpc('list_submissions', {
    p_status: status || null,
    p_search: search || null,
    p_page_size: limit,
    p_page_offset: offset,
  });

  if (error) {
    console.error('List submissions error:', error);
    throw badRequest('Failed to fetch submissions');
  }

  // Get total count
  let countQuery = supabaseAdmin
    .from('extension_submissions')
    .select('*', { count: 'exact', head: true });

  if (status) {
    countQuery = countQuery.eq('status', status);
  }

  if (search) {
    countQuery = countQuery.or(
      `display_name.ilike.%${search}%,name.ilike.%${search}%,submitter_email.ilike.%${search}%`
    );
  }

  const { count } = await countQuery;

  const response: PaginatedResponse<ExtensionSubmission> = {
    success: true,
    data: data || [],
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
 * GET /admin/submissions/count - Get pending submission count (admin only)
 * 
 * Returns the count of pending submissions for dashboard badges.
 */
adminSubmissions.get('/count', async (c) => {
  const supabaseAdmin = c.get('supabaseAdmin');

  const { data, error } = await supabaseAdmin.rpc('get_pending_submission_count');

  if (error) {
    console.error('Get pending count error:', error);
    throw badRequest('Failed to fetch pending count');
  }

  return c.json({
    success: true,
    data: { count: data || 0 },
  } as ApiResponse);
});

/**
 * GET /admin/submissions/:id - Get submission details (admin only)
 */
adminSubmissions.get('/:id', async (c) => {
  const id = c.req.param('id');
  const supabaseAdmin = c.get('supabaseAdmin');

  const { data: submission, error } = await supabaseAdmin
    .from('extension_submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !submission) {
    throw notFound('Submission');
  }

  return c.json({
    success: true,
    data: submission,
  } as ApiResponse);
});

/**
 * POST /admin/submissions/:id/approve - Approve a submission (admin only)
 * 
 * Approves the submission and creates the extension in the store.
 */
adminSubmissions.post('/:id/approve', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const parsed = approveSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const reviewerEmail = c.get('publisherEmail') || 'admin@bluerobotics.com';
  const supabaseAdmin = c.get('supabaseAdmin');

  // Use the database function for atomic approval
  const { data: extensionId, error } = await supabaseAdmin.rpc('approve_submission', {
    p_submission_id: id,
    p_reviewer_email: reviewerEmail,
    p_reviewer_notes: parsed.data.notes || null,
    p_publisher_id: parsed.data.publisher_id || null,
  });

  if (error) {
    console.error('Approve submission error:', error);
    if (error.message.includes('not found')) {
      throw notFound('Submission');
    }
    if (error.message.includes('cannot be approved')) {
      throw badRequest(error.message);
    }
    throw badRequest('Failed to approve submission');
  }

  // Fetch the updated submission
  const { data: submission } = await supabaseAdmin
    .from('extension_submissions')
    .select('*')
    .eq('id', id)
    .single();

  return c.json(
    {
      success: true,
      message: 'Submission approved and extension created',
      data: {
        submission,
        extension_id: extensionId,
      },
    } as ApiResponse,
    200,
    noCacheHeaders()
  );
});

/**
 * POST /admin/submissions/:id/reject - Reject a submission (admin only)
 * 
 * Rejects the submission with required feedback.
 */
adminSubmissions.post('/:id/reject', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = rejectSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const reviewerEmail = c.get('publisherEmail') || 'admin@bluerobotics.com';
  const supabaseAdmin = c.get('supabaseAdmin');

  // Use the database function for rejection
  const { error } = await supabaseAdmin.rpc('reject_submission', {
    p_submission_id: id,
    p_reviewer_email: reviewerEmail,
    p_reviewer_notes: parsed.data.notes,
  });

  if (error) {
    console.error('Reject submission error:', error);
    if (error.message.includes('not found')) {
      throw notFound('Submission');
    }
    if (error.message.includes('cannot be rejected')) {
      throw badRequest(error.message);
    }
    throw badRequest('Failed to reject submission');
  }

  // Fetch the updated submission
  const { data: submission } = await supabaseAdmin
    .from('extension_submissions')
    .select('*')
    .eq('id', id)
    .single();

  return c.json(
    {
      success: true,
      message: 'Submission rejected',
      data: submission,
    } as ApiResponse,
    200,
    noCacheHeaders()
  );
});

/**
 * POST /admin/submissions/:id/request-changes - Request changes on a submission (admin only)
 * 
 * Marks the submission as needing changes with required feedback.
 */
adminSubmissions.post('/:id/request-changes', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = requestChangesSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0].message);
  }

  const reviewerEmail = c.get('publisherEmail') || 'admin@bluerobotics.com';
  const supabaseAdmin = c.get('supabaseAdmin');

  // Use the database function for requesting changes
  const { error } = await supabaseAdmin.rpc('request_changes_submission', {
    p_submission_id: id,
    p_reviewer_email: reviewerEmail,
    p_reviewer_notes: parsed.data.notes,
  });

  if (error) {
    console.error('Request changes error:', error);
    if (error.message.includes('not found')) {
      throw notFound('Submission');
    }
    if (error.message.includes('pending submissions')) {
      throw badRequest(error.message);
    }
    throw badRequest('Failed to request changes');
  }

  // Fetch the updated submission
  const { data: submission } = await supabaseAdmin
    .from('extension_submissions')
    .select('*')
    .eq('id', id)
    .single();

  return c.json(
    {
      success: true,
      message: 'Changes requested on submission',
      data: submission,
    } as ApiResponse,
    200,
    noCacheHeaders()
  );
});

// Named exports are defined above with 'export const'
