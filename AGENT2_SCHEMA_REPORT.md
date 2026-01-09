# Agent 2: Database Schema Updates - Report

## Summary

Successfully updated the database schema to support GitHub releases integration with hash verification. All changes are idempotent and safe to run multiple times.

## Changes Made

### 1. Extension Submissions - New Columns

Added columns to `extension_submissions` table for storing fetched GitHub release data:

| Column | Type | Purpose |
|--------|------|---------|
| `github_owner` | TEXT | GitHub repository owner (e.g., "bluerobotics") |
| `github_repo` | TEXT | GitHub repository name (e.g., "blueplm-ext-google-drive") |
| `latest_release_tag` | TEXT | Git tag of the latest release (e.g., "v1.0.0") |
| `fetched_manifest` | JSONB | Full extension.json contents from the release |
| `fetched_version` | TEXT | Version from manifest (SOURCE OF TRUTH) |
| `fetched_display_name` | TEXT | Human-readable name from manifest |
| `fetched_description` | TEXT | Description from manifest |
| `fetched_icon_url` | TEXT | Icon URL from release or repo |
| `fetched_categories` | TEXT[] | Categories array from manifest |
| `fetched_license` | TEXT | License identifier from manifest |
| `bpx_download_url` | TEXT | GitHub release asset URL for .bpx file |
| `bpx_hash` | TEXT | SHA256 hash of .bpx file (computed server-side) |
| `bpx_size` | INTEGER | Size of .bpx file in bytes |
| `changelog` | TEXT | Sanitized release notes from GitHub release body |
| `fetch_error` | TEXT | Error message if fetch failed |
| `fetched_at` | TIMESTAMPTZ | When data was fetched from GitHub |

### 2. Extensions - Sync Tracking

Added to `extensions` table:

| Column | Type | Purpose |
|--------|------|---------|
| `last_synced_at` | TIMESTAMPTZ | When releases were last fetched from GitHub |

Added index `idx_extensions_last_synced` for efficient sync job queries.

### 3. Extension Sync Log Table

New table `extension_sync_log` for tracking sync job executions:

```sql
CREATE TABLE extension_sync_log (
    id UUID PRIMARY KEY,
    extension_id UUID REFERENCES extensions(id),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    releases_checked INTEGER,
    versions_added INTEGER,
    status TEXT CHECK (status IN ('running', 'success', 'error')),
    error_message TEXT
);
```

Includes RLS policy for admin read access.

### 4. Updated Functions

#### `approve_submission`

Enhanced to:
- **Validate** required GitHub release data (bpx_hash, fetched_version) before approval
- **Use fetched metadata** (display_name, description, license, categories) from GitHub
- **Create initial version** with complete data including bundle_hash

#### `add_version_from_sync`

New function for sync job to add discovered versions:
- **Idempotent** - returns existing version ID if version already exists
- **Validates** bundle_hash is 64-character SHA256 hex string
- **Updates** extension's `last_synced_at` timestamp

#### `start_sync_job` / `complete_sync_job`

Helper functions for sync job logging:
- `start_sync_job(extension_id)` - Creates running log entry
- `complete_sync_job(sync_id, releases_checked, versions_added, error_message)` - Marks completion

#### `get_extension_by_name`

Lookup extension by full name (e.g., "blueplm.google-drive") for deep link support:
- Parses "publisher.name" format
- Returns extension details including parsed github_owner/github_repo

#### `get_extensions_needing_sync`

Returns extensions that haven't been synced recently:
- Configurable max age (default 1 hour)
- Orders by least recently synced first
- Used by hourly cron job

### 5. Schema Version

Bumped to version 3 with description: "GitHub Releases integration with hash verification"

## Field Mappings (Submission → Extension)

| Submission Field | Extension Field |
|------------------|-----------------|
| `fetched_display_name` | `display_name` |
| `fetched_description` | `description` |
| `fetched_categories` | `categories` |
| `fetched_license` | `license` |
| `fetched_icon_url` | `icon_url` |
| `fetched_manifest.id` | Used as extension `name` (unique identifier) |

## Migration for Existing Databases

All changes use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` and `CREATE TABLE IF NOT EXISTS`, making the schema idempotent. To migrate:

```sql
-- Simply run the full schema.sql
\i supabase-store/schema.sql
```

Or apply the new sections starting from the comment:
```sql
-- GITHUB RELEASES INTEGRATION (Schema Version 3)
```

## Files Modified

- `blueplm-site/supabase-store/schema.sql` - All schema changes

## Testing Recommendations

1. **Test approve_submission** with a submission that has fetched release data
2. **Test add_version_from_sync** with duplicate version (should be idempotent)
3. **Test get_extension_by_name** with valid "publisher.name" format
4. **Test get_extensions_needing_sync** returns extensions with NULL or old `last_synced_at`
5. **Verify RLS** - admins can read sync_log, service role can write

## Dependencies

- **Agent 1** will use these tables/functions via the API
- **Agent 3** will populate `extension_submissions` with GitHub data before approval
- **Agent 5** will display version data from `extension_versions`

## Notes

- All `ALTER TABLE` statements use `IF NOT EXISTS` for idempotency
- `approve_submission` now requires `bpx_hash` and `fetched_version` to be set
- `bundle_hash` is validated to be 64 characters (SHA256 hex format)
- Sync log uses RLS with admin-only read access
