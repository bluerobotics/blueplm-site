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
import {
  parseGitHubUrl,
  fetchReleases,
  findLatestReleaseWithBpx,
  fetchExtensionManifest,
  validateManifest,
  downloadAndHashBpx,
  sanitizeChangelog,
} from '../utils/github';

// ============================================================================
// PUBLIC SUBMISSION ROUTES (mounted at /store/submissions)
// ============================================================================

export const storeSubmissions = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * POST /store/submissions - Submit extension for review (public)
 * 
 * Allows anyone to submit an extension for review by the Blue Robotics team.
 * Rate limited to prevent spam.
 * 
 * This endpoint:
 * 1. Validates the GitHub URL
 * 2. Fetches releases and finds the latest .bpx
 * 3. Downloads and hashes the .bpx file
 * 4. Fetches and validates extension.json
 * 5. Stores all fetched data for approval workflow
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
  const githubToken = c.env.GITHUB_API_TOKEN;

  // ========================================================================
  // Step 1: Parse GitHub URL
  // ========================================================================
  const githubInfo = parseGitHubUrl(parsed.data.repository_url);
  if (!githubInfo) {
    throw badRequest(
      'Invalid GitHub URL format. Expected: https://github.com/owner/repo'
    );
  }
  const { owner: githubOwner, repo: githubRepo } = githubInfo;

  // ========================================================================
  // Step 2: Fetch releases from GitHub
  // ========================================================================
  let releases;
  try {
    releases = await fetchReleases(githubOwner, githubRepo, githubToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('not found')) {
      throw badRequest(
        'Repository not found. Note: Private repositories are not supported yet.'
      );
    }
    throw badRequest(`Failed to fetch releases: ${message}`);
  }

  if (releases.length === 0) {
    throw badRequest(
      'No releases found. Please create a GitHub Release with a .bpx file attached.'
    );
  }

  // ========================================================================
  // Step 3: Find latest release with .bpx asset
  // ========================================================================
  const latestWithBpx = findLatestReleaseWithBpx(releases);
  if (!latestWithBpx) {
    throw badRequest(
      'No .bpx file found in any release. Attach your extension package (.bpx) to a GitHub Release.'
    );
  }
  const { release, asset } = latestWithBpx;

  // ========================================================================
  // Step 4: Fetch extension.json manifest
  // ========================================================================
  let manifest;
  try {
    manifest = await fetchExtensionManifest(
      githubOwner,
      githubRepo,
      release.tag_name,
      githubToken
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw badRequest(message);
  }

  // ========================================================================
  // Step 5: Validate manifest
  // ========================================================================
  const validation = validateManifest(manifest);
  if (!validation.valid) {
    throw badRequest(validation.errors[0]);
  }

  // ========================================================================
  // Step 6: Download .bpx and compute hash
  // ========================================================================
  let bpxResult;
  try {
    bpxResult = await downloadAndHashBpx(asset.browser_download_url, githubToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw badRequest(`Failed to download .bpx file: ${message}`);
  }

  // ========================================================================
  // Step 7: Sanitize changelog
  // ========================================================================
  const changelog = sanitizeChangelog(release.body);

  // ========================================================================
  // Step 8: Check for duplicates
  // ========================================================================
  
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

  // Extract extension name from manifest.id (format: "publisher.name")
  // The database stores just the name part (e.g., "google-drive"), not the full ID
  const extensionId = manifest.id;
  const extensionName = extensionId.includes('.') 
    ? extensionId.split('.').slice(1).join('.') // Get everything after first dot
    : extensionId;

  // Check for duplicate name pending
  const { data: existingName } = await supabaseAdmin
    .from('extension_submissions')
    .select('id')
    .eq('name', extensionName)
    .eq('status', 'pending')
    .single();

  if (existingName) {
    throw badRequest('An extension with this name is already pending review');
  }

  // Also check if this extension already exists in the store
  const { data: existingExtension } = await supabaseAdmin
    .from('extensions')
    .select('id')
    .eq('name', extensionName)
    .single();

  if (existingExtension) {
    throw badRequest(
      `An extension with ID "${extensionName}" already exists in the store. ` +
      'If this is your extension and you want to publish an update, please use the sync feature instead.'
    );
  }

  // ========================================================================
  // Step 9: Construct icon URL if icon is specified
  // ========================================================================
  let fetchedIconUrl = null;
  if (manifest.icon) {
    // Construct raw GitHub URL for the icon
    // manifest.icon is typically a relative path like "assets/icon.png"
    fetchedIconUrl = `https://raw.githubusercontent.com/${githubOwner}/${githubRepo}/${release.tag_name}/${manifest.icon}`;
  }

  // ========================================================================
  // Step 10: Create submission with all fetched data
  // ========================================================================
  const { data: submission, error } = await supabaseAdmin
    .from('extension_submissions')
    .insert({
      // Submitter info
      submitter_email: parsed.data.submitter_email,
      submitter_name: parsed.data.submitter_name || null,
      
      // Repository info
      repository_url: parsed.data.repository_url,
      
      // GitHub-derived fields
      github_owner: githubOwner,
      github_repo: githubRepo,
      latest_release_tag: release.tag_name,
      
      // Fetched manifest data
      fetched_manifest: manifest,
      fetched_version: manifest.version,
      fetched_display_name: manifest.name,
      fetched_description: manifest.description,
      fetched_icon_url: fetchedIconUrl,
      fetched_categories: manifest.categories || [],
      fetched_license: manifest.license || null,
      
      // .bpx bundle info
      bpx_download_url: asset.browser_download_url,
      bpx_hash: bpxResult.hash,
      bpx_size: bpxResult.size,
      
      // Changelog
      changelog,
      
      // Fetch timestamp
      fetched_at: new Date().toISOString(),
      
      // Use manifest data for name/display_name
      name: extensionName,
      display_name: manifest.name,
      description: manifest.description,
      
      // Category from user or default
      category: parsed.data.category,
      
      // Status
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Create submission error:', error);
    // Include more detail in error for debugging
    throw badRequest(`Failed to create submission: ${error.message || error.code || 'Unknown error'}`);
  }

  return c.json(
    {
      success: true,
      message: 'Extension submitted for review. You will be notified when it is reviewed.',
      data: {
        id: submission.id,
        name: submission.name,
        display_name: submission.display_name,
        version: submission.fetched_version,
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
    // Include full error message for debugging
    throw badRequest(`Failed to approve submission: ${error.message || error.code || 'Unknown error'}`);
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
