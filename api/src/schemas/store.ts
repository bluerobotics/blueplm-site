import { z } from 'zod';

// ============================================================================
// Common schemas
// ============================================================================

/** Slug format: lowercase alphanumeric with hyphens */
const slugSchema = z.string().regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, {
  message: 'Must be lowercase alphanumeric with hyphens (e.g., "my-extension")',
});

/** Semver format */
const semverSchema = z.string().regex(
  /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/,
  { message: 'Must be valid semver (e.g., "1.0.0" or "1.0.0-beta.1")' }
);

/** Pagination parameters */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** Sort options for extensions */
export const extensionSortSchema = z.enum([
  'relevance',
  'downloads',
  'newest',
  'name',
]).default('relevance');

// ============================================================================
// Search & Browse
// ============================================================================

/** Query params for listing/searching extensions */
export const searchExtensionsSchema = z.object({
  q: z.string().max(200).optional(),
  categories: z.string().optional().transform(val => 
    val ? val.split(',').map(s => s.trim()).filter(Boolean) : undefined
  ),
  type: z.enum(['sandboxed', 'native']).optional(),
  verified: z.coerce.boolean().optional(),
  sort: extensionSortSchema,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type SearchExtensionsQuery = z.infer<typeof searchExtensionsSchema>;

// ============================================================================
// Publisher schemas
// ============================================================================

/** Create publisher request */
export const createPublisherSchema = z.object({
  name: z.string().min(2).max(100),
  slug: slugSchema.min(2).max(50),
  description: z.string().max(500).optional(),
  website_url: z.string().url().optional(),
  logo_url: z.string().url().optional(),
  support_email: z.string().email().optional(),
  support_url: z.string().url().optional(),
});

export type CreatePublisherBody = z.infer<typeof createPublisherSchema>;

/** Update publisher request */
export const updatePublisherSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  website_url: z.string().url().nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  support_email: z.string().email().nullable().optional(),
  support_url: z.string().url().nullable().optional(),
});

export type UpdatePublisherBody = z.infer<typeof updatePublisherSchema>;

// ============================================================================
// Extension schemas
// ============================================================================

/** OSI-approved licenses */
export const licenseSchema = z.enum([
  'MIT',
  'Apache-2.0',
  'GPL-3.0',
  'GPL-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'MPL-2.0',
  'LGPL-3.0',
  'LGPL-2.1',
  'AGPL-3.0',
  'Unlicense',
  'CC0-1.0',
]);

/** Extension categories for browsing */
export const browseCategorySchema = z.enum([
  'sync',
  'erp',
  'cad',
  'backup',
  'cloud',
  'notifications',
  'collaboration',
  'ecommerce',
  'project-management',
  'manufacturing',
  'preview',
  'properties',
  'tracking',
  'other',
]);

/** Submit new extension */
export const submitExtensionSchema = z.object({
  name: slugSchema.min(2).max(50),
  display_name: z.string().min(2).max(100),
  description: z.string().max(300),
  long_description: z.string().max(10000).optional(),
  icon_url: z.string().url().optional(),
  banner_url: z.string().url().optional(),
  repository_url: z.string().url(),
  license: licenseSchema,
  category: z.enum(['sandboxed', 'native']).default('sandboxed'),
  categories: z.array(browseCategorySchema).max(5).default([]),
  tags: z.array(z.string().max(30)).max(10).default([]),
});

export type SubmitExtensionBody = z.infer<typeof submitExtensionSchema>;

/** Update extension metadata */
export const updateExtensionSchema = z.object({
  display_name: z.string().min(2).max(100).optional(),
  description: z.string().max(300).optional(),
  long_description: z.string().max(10000).nullable().optional(),
  icon_url: z.string().url().nullable().optional(),
  banner_url: z.string().url().nullable().optional(),
  repository_url: z.string().url().optional(),
  categories: z.array(browseCategorySchema).max(5).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  published: z.boolean().optional(),
});

export type UpdateExtensionBody = z.infer<typeof updateExtensionSchema>;

// ============================================================================
// Version schemas
// ============================================================================

/** Publish new version */
export const publishVersionSchema = z.object({
  version: semverSchema,
  changelog: z.string().max(10000).optional(),
  bundle_url: z.string().url(),
  bundle_hash: z.string().regex(/^sha256:[a-f0-9]{64}$/i, {
    message: 'Must be SHA256 hash in format "sha256:..."',
  }),
  bundle_size: z.number().int().positive().optional(),
  min_app_version: semverSchema.optional(),
  max_app_version: semverSchema.optional(),
  manifest: z.record(z.unknown()),
  prerelease: z.boolean().default(false),
  signature: z.string().optional(),
  signing_key_id: z.string().optional(),
});

export type PublishVersionBody = z.infer<typeof publishVersionSchema>;

// ============================================================================
// Report schemas
// ============================================================================

/** Report reason */
export const reportReasonSchema = z.enum([
  'malicious',
  'security',
  'broken',
  'spam',
  'license',
  'other',
]);

/** Submit report */
export const submitReportSchema = z.object({
  reason: reportReasonSchema,
  details: z.string().max(5000).optional(),
  evidence_urls: z.array(z.string().url()).max(10).optional(),
  version_id: z.string().uuid().optional(),
});

export type SubmitReportBody = z.infer<typeof submitReportSchema>;

/** Update report (admin) */
export const updateReportSchema = z.object({
  status: z.enum(['pending', 'investigating', 'resolved', 'dismissed']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
  resolution_notes: z.string().max(5000).optional(),
  action_taken: z.enum(['none', 'warning', 'suspended', 'removed']).optional(),
});

export type UpdateReportBody = z.infer<typeof updateReportSchema>;

// ============================================================================
// Admin schemas
// ============================================================================

/** Verify extension */
export const verifyExtensionSchema = z.object({
  verified: z.boolean(),
});

export type VerifyExtensionBody = z.infer<typeof verifyExtensionSchema>;

/** Feature extension */
export const featureExtensionSchema = z.object({
  featured: z.boolean(),
});

export type FeatureExtensionBody = z.infer<typeof featureExtensionSchema>;

/** Deprecate extension */
export const deprecateExtensionSchema = z.object({
  reason: z.string().min(10).max(1000),
  replacement_id: z.string().uuid().optional(),
  migration_guide: z.string().max(10000).optional(),
  sunset_date: z.string().date().optional(),
});

export type DeprecateExtensionBody = z.infer<typeof deprecateExtensionSchema>;

// ============================================================================
// Record install (analytics)
// ============================================================================

export const recordInstallSchema = z.object({
  version: semverSchema,
  app_version: semverSchema,
  platform: z.enum(['win32', 'darwin', 'linux']),
  arch: z.enum(['x64', 'arm64', 'ia32']),
  org_hash: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
  install_type: z.enum(['store', 'sideload', 'update', 'reinstall']).default('store'),
});

export type RecordInstallBody = z.infer<typeof recordInstallSchema>;
