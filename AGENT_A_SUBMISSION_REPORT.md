# Agent A: Submission Flow with GitHub Validation - COMPLETE

## Summary

Updated the submission endpoint to validate GitHub releases and fetch all metadata before storing the submission. This ensures `approve_submission` has all required data (`bpx_hash`, `fetched_version`) to successfully create an extension.

## Changes Made

### File Modified: `api/src/routes/submissions.ts`

#### 1. Added GitHub Utility Imports

```typescript
import {
  parseGitHubUrl,
  fetchReleases,
  findLatestReleaseWithBpx,
  fetchExtensionManifest,
  validateManifest,
  downloadAndHashBpx,
  sanitizeChangelog,
} from '../utils/github';
```

#### 2. Updated POST `/store/submissions` Handler

The handler now performs a 10-step validation and data-fetching process:

| Step | Action | User-Friendly Error |
|------|--------|---------------------|
| 1 | Parse GitHub URL | "Invalid GitHub URL format. Expected: https://github.com/owner/repo" |
| 2 | Fetch releases | "Repository not found. Note: Private repositories are not supported yet." |
| 3 | Find .bpx in releases | "No .bpx file found in any release. Attach your extension package (.bpx) to a GitHub Release." |
| 4 | Fetch extension.json | "extension.json not found in release..." |
| 5 | Validate manifest | "extension.json missing required field: {field}" |
| 6 | Download & hash .bpx | "Failed to download .bpx file: {error}" |
| 7 | Sanitize changelog | (no error - returns empty string) |
| 8 | Check duplicates | "A submission for this repository is already pending review" |
| 9 | Construct icon URL | (no error - sets null if no icon) |
| 10 | Insert submission | "Failed to create submission" |

#### 3. All Fetched Columns Now Populated

```typescript
{
  // Submitter info
  submitter_email,
  submitter_name,
  
  // Repository info
  repository_url,
  
  // GitHub-derived fields
  github_owner,              // From parseGitHubUrl()
  github_repo,               // From parseGitHubUrl()
  latest_release_tag,        // From release.tag_name
  
  // Fetched manifest data
  fetched_manifest,          // Full extension.json as JSONB
  fetched_version,           // From manifest.version (SOURCE OF TRUTH)
  fetched_display_name,      // From manifest.name
  fetched_description,       // From manifest.description
  fetched_icon_url,          // Constructed from manifest.icon + raw.githubusercontent.com
  fetched_categories,        // From manifest.categories
  fetched_license,           // From manifest.license
  
  // .bpx bundle info
  bpx_download_url,          // From release asset URL
  bpx_hash,                  // From downloadAndHashBpx() - CRITICAL!
  bpx_size,                  // From downloadAndHashBpx()
  
  // Changelog
  changelog,                 // From sanitizeChangelog(release.body)
  
  // Timestamp
  fetched_at,                // NOW()
  
  // Use manifest data for name/display_name
  name: manifest.id,         // e.g., "blueplm.google-drive"
  display_name: manifest.name,
  description: manifest.description,
}
```

## Error Handling

All errors are user-friendly and actionable:

| Scenario | Error Message |
|----------|---------------|
| Invalid URL | "Invalid GitHub URL format. Expected: https://github.com/owner/repo" |
| Private repo | "Repository not found. Note: Private repositories are not supported yet." |
| No releases | "No releases found. Please create a GitHub Release with a .bpx file attached." |
| No .bpx | "No .bpx file found in any release. Attach your extension package (.bpx) to a GitHub Release." |
| Missing manifest | "extension.json not found in release..." |
| Invalid manifest | "extension.json missing required field: {field}" |
| Extension exists | "An extension with ID '{name}' already exists in the store..." |

## Testing Checklist

### Manual Testing with `blueplm-ext-google-drive`

To test with the actual repository:

```bash
curl -X POST https://blueplm-api.workers.dev/store/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "submitter_email": "test@example.com",
    "submitter_name": "Test User",
    "repository_url": "https://github.com/bluerobotics/blueplm-ext-google-drive",
    "category": "sandboxed"
  }'
```

Expected response:

```json
{
  "success": true,
  "message": "Extension submitted for review. You will be notified when it is reviewed.",
  "data": {
    "id": "uuid-here",
    "name": "blueplm.google-drive",
    "display_name": "Google Drive Integration",
    "version": "0.1.0",
    "status": "pending",
    "created_at": "2026-01-08T..."
  }
}
```

### Verify Submission Data

After submission, verify all columns are populated:

```sql
SELECT 
  name,
  fetched_version,
  bpx_hash,
  bpx_size,
  github_owner,
  github_repo,
  latest_release_tag,
  fetched_icon_url,
  fetched_categories,
  changelog
FROM extension_submissions
WHERE name = 'blueplm.google-drive';
```

### Verify Approval Works

With `bpx_hash` and `fetched_version` populated, approval should succeed:

```bash
curl -X POST https://blueplm-api.workers.dev/admin/submissions/{id}/approve \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Environment Requirements

The `GITHUB_API_TOKEN` environment variable should be set in the Cloudflare Worker for higher rate limits (5,000/hr vs 60/hr for unauthenticated):

```bash
cd blueplm-site/api
wrangler secret put GITHUB_API_TOKEN
# Paste your GitHub Personal Access Token
```

## Integration Points

- **Uses utilities from:** `api/src/utils/github.ts`
- **Works with schema:** v3 with all GitHub-derived columns
- **Enables:** `approve_submission` to create extension + initial version

## Boundaries Respected

- ✅ MODIFIED: `api/src/routes/submissions.ts` (POST handler only)
- ✅ USED: `api/src/utils/github.ts` (read-only)
- ✅ DID NOT modify: database schema, sync routes, admin routes
