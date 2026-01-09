import { z } from 'zod';

// ============================================================================
// Common schemas
// ============================================================================

/** Slug format: lowercase alphanumeric with hyphens */
const slugSchema = z.string().regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, {
  message: 'Must be lowercase alphanumeric with hyphens (e.g., "my-extension")',
});

/** Submission status */
export const submissionStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'needs_changes',
]);

export type SubmissionStatusType = z.infer<typeof submissionStatusSchema>;

// ============================================================================
// Public submission endpoint
// ============================================================================

/** Submit a new extension for review */
export const createSubmissionSchema = z.object({
  // Submitter info (required)
  submitter_email: z.string().email('Valid email required'),
  submitter_name: z.string().min(1).max(100).optional(),

  // Repository URL (required) - we'll fetch extension details from here
  repository_url: z.string().url('Valid repository URL required'),
  
  // Extension metadata (optional - maintainers can fill in during review)
  name: slugSchema.min(2).max(50).optional(),
  display_name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(['sandboxed', 'native']).default('sandboxed'),
});

export type CreateSubmissionBody = z.infer<typeof createSubmissionSchema>;

// ============================================================================
// Admin listing endpoint
// ============================================================================

/** Query params for listing submissions */
export const listSubmissionsSchema = z.object({
  status: submissionStatusSchema.optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListSubmissionsQuery = z.infer<typeof listSubmissionsSchema>;

// ============================================================================
// Admin action endpoints
// ============================================================================

/** Approve a submission */
export const approveSubmissionSchema = z.object({
  notes: z.string().max(2000).optional(),
  publisher_id: z.string().uuid().optional(), // Optionally specify existing publisher
});

export type ApproveSubmissionBody = z.infer<typeof approveSubmissionSchema>;

/** Reject a submission */
export const rejectSubmissionSchema = z.object({
  notes: z.string().min(1).max(2000).optional(),
});

export type RejectSubmissionBody = z.infer<typeof rejectSubmissionSchema>;

/** Request changes on a submission */
export const requestChangesSchema = z.object({
  notes: z.string().min(1).max(2000).optional(),
});

export type RequestChangesBody = z.infer<typeof requestChangesSchema>;
