# Agent 1: GitHub Releases API Service - Completion Report

## Summary

Successfully implemented the GitHub API service for fetching releases, downloading assets, and computing hashes. The implementation provides robust error handling, rate limiting with exponential backoff, and XSS-safe changelog sanitization.

## Files Created/Modified

### Created

1. **`api/src/utils/github.ts`** - Core GitHub API utilities
   - `parseGitHubUrl()` - Parses GitHub URLs (HTTPS and SSH formats)
   - `fetchReleases()` - Fetches all releases with auth token support
   - `findBpxAsset()` - Finds .bpx asset in release assets
   - `findLatestReleaseWithBpx()` - Finds latest release with .bpx (prefers stable)
   - `fetchExtensionManifest()` - Fetches extension.json from release tag
   - `validateManifest()` - Validates required manifest fields
   - `downloadAndHashBpx()` - Downloads .bpx and computes SHA256 hash
   - `sanitizeChangelog()` - XSS-safe changelog sanitization
   - `checkVersionMismatch()` - Warns when tag differs from manifest version
   - `extractVersionFromTag()` - Extracts version from common tag formats

2. **`api/src/routes/sync.ts`** - Sync endpoints
   - `POST /admin/sync/all` - Admin bulk sync (for cron job)
   - `POST /store/extensions/:name/sync` - Public single-extension sync (rate limited)

### Modified

1. **`api/src/types.ts`** - Added GitHub-related types:
   - `GitHubRelease` - Release from GitHub API
   - `GitHubAsset` - Release asset
   - `ExtensionManifest` - extension.json structure
   - `ManifestValidationResult` - Manifest validation result
   - `BpxHashResult` - Download/hash result
   - `ExtensionSyncResult` - Single extension sync result
   - `BulkSyncResult` - Bulk sync operation result
   - Added `GITHUB_API_TOKEN` to `Env` interface

2. **`api/src/routes/index.ts`** - Mounted sync routes:
   - `/admin/sync` → `adminSync` router
   - `/store/extensions` → `storeSync` router

## Implementation Details

### Rate Limiting Strategy

1. **GitHub API Rate Limiting**
   - Unauthenticated: 60 requests/hour
   - With `GITHUB_API_TOKEN`: 5,000 requests/hour
   - Exponential backoff with max 3 retries
   - Respects `X-RateLimit-Reset` header

2. **Public Sync Endpoint**
   - 10 requests per minute per IP
   - Uses existing `checkRateLimit()` utility

### Security Considerations

1. **XSS Prevention**
   - Changelog sanitization strips HTML tags
   - Removes `javascript:` URLs
   - Removes unsafe `data:` URLs
   - Removes event handlers (`onclick`, etc.)
   - Limits length to 10KB

2. **Input Validation**
   - GitHub URL parsing validates format
   - Manifest validation ensures required fields
   - Semver validation for version field

3. **Download Safety**
   - 50MB max file size
   - 30 second timeout
   - SHA256 hash computed server-side

### Version Source of Truth

- The `version` field in `extension.json` is authoritative
- Git tag is informational only
- Mismatch logs a warning but uses manifest version

## API Endpoints

### Admin Bulk Sync
```
POST /admin/sync/all
Authorization: Bearer {ADMIN_API_KEY}

Response:
{
  "success": true,
  "message": "Synced 5/10 extensions",
  "data": {
    "totalExtensions": 10,
    "synced": 5,
    "failed": 0,
    "newVersionsAdded": 3,
    "errors": []
  }
}
```

### Public Single-Extension Sync
```
POST /store/extensions/{name}/sync

Response:
{
  "success": true,
  "message": "Found 2 new version(s)",
  "data": {
    "updated": true,
    "latestVersion": "1.2.0",
    "newVersions": ["1.2.0", "1.1.1"]
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_API_TOKEN` | Recommended | Personal Access Token for 5,000 req/hour |

### Creating the GitHub PAT

1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate new token (classic)
3. Name: "BluePLM Store API"
4. Expiration: 90 days (set reminder to rotate)
5. Scopes: `public_repo` only
6. Add to Cloudflare Worker: `wrangler secret put GITHUB_API_TOKEN`

## Database Dependencies

Requires Agent 2's schema updates:
- `extension_sync_log` table for tracking sync jobs
- `last_synced_at` column on `extensions` table

## Testing

To test locally:

```bash
# Start the API
cd api
npm run dev

# Test admin sync (requires ADMIN_API_KEY)
curl -X POST http://localhost:8787/admin/sync/all \
  -H "Authorization: Bearer your-admin-key"

# Test single extension sync
curl -X POST http://localhost:8787/store/extensions/blueplm.google-drive/sync
```

## Dependencies on Other Agents

| Agent | Dependency | Status |
|-------|------------|--------|
| Agent 2 | `extension_sync_log` table, `last_synced_at` column | Required |
| Agent 3 | Uses GitHub utilities for submission validation | Ready |
| Agent 5 | Consumes sync API endpoints | Ready |

## Cron Trigger Setup (Future)

Add to `wrangler.toml`:

```toml
[triggers]
crons = ["0 * * * *"]  # Every hour
```

And handle in worker:

```typescript
export default {
  async scheduled(event: ScheduledEvent, env: Env) {
    // Call /admin/sync/all internally
  },
  async fetch(request: Request, env: Env) {
    // ... existing fetch handler
  }
}
```

## Known Limitations

1. **Public repos only** - Private repositories return 404
2. **No webhook support** - Relies on polling (acceptable for MVP)
3. **No retry queue** - Failed syncs are logged but not retried automatically

## Completion Status

✅ All Agent 1 tasks completed:
- [x] GitHub URL parser with validation
- [x] Releases fetching via GitHub API with auth token
- [x] extension.json fetching from release tags
- [x] .bpx asset detection in releases
- [x] .bpx download and SHA256 hash computation
- [x] Exponential backoff for rate limiting
- [x] Manifest validation
- [x] Changelog sanitization (XSS prevention)
- [x] Admin bulk sync endpoint (`POST /admin/sync/all`)
- [x] Public single-extension sync endpoint (`POST /store/extensions/:name/sync`)
- [x] Rate limiting on public sync endpoint (10/min per IP)
- [x] Types added to `api/src/types.ts`
- [x] Routes mounted in `api/src/routes/index.ts`
