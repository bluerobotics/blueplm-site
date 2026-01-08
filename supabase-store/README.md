# BluePLM Extension Store Database

This directory contains the database schema for the BluePLM Extension Store, hosted at `marketplace.blueplm.io`.

> **Note**: This is a **separate Supabase project** from the main BluePLM organization databases. It is managed by Blue Robotics and shared across all organizations.

## Overview

| Aspect | Description |
|--------|-------------|
| **Purpose** | Public extension marketplace |
| **Hosted by** | Blue Robotics |
| **Access** | Public read, authenticated write |
| **URL** | marketplace.blueplm.io |

## Quick Start

```bash
# Apply schema to a new Supabase project
psql $DATABASE_URL < schema.sql

# Load test data (development only)
psql $DATABASE_URL < seed.sql
```

## Schema Diagram

```
┌─────────────────┐
│   publishers    │
│─────────────────│
│ id              │
│ name, slug      │
│ verified        │◄──────────────────────────────────────────┐
│ owner_email     │                                           │
└────────┬────────┘                                           │
         │ 1:N                                                │
         ▼                                                    │
┌─────────────────┐     ┌──────────────────────┐              │
│   extensions    │     │  extension_versions  │              │
│─────────────────│     │──────────────────────│              │
│ id              │◄────│ extension_id         │              │
│ publisher_id    │     │ version              │              │
│ name            │     │ bundle_url/hash      │              │
│ category        │     │ manifest (JSONB)     │              │
│ verified        │     │ signature            │──────────────┤
│ featured        │     └──────────────────────┘              │
│ download_count  │                                           │
└────────┬────────┘     ┌──────────────────────┐              │
         │              │   signing_keys       │              │
         │              │──────────────────────│              │
         │              │ id (key ID)          │──────────────┘
         │              │ public_key           │
         │              │ publisher_id         │
         │              │ active, revoked      │
         │              └──────────────────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         │              │              │              │
         ▼              ▼              ▼              ▼
┌────────────────┐ ┌──────────────┐ ┌───────────────┐ ┌────────────────┐
│extension_reviews│ │extension_reports│ │extension_deprecations│ │extension_installs│
│────────────────│ │──────────────│ │───────────────│ │────────────────│
│ rating (1-5)   │ │ reason       │ │ replacement_id│ │ platform       │
│ title, body    │ │ status       │ │ sunset_date   │ │ org_hash       │
│ user_id        │ │ priority     │ │ deprecated_by │ │ install_type   │
└────────────────┘ └──────────────┘ └───────────────┘ └────────────────┘
```

## Tables

### Core Tables

| Table | Description |
|-------|-------------|
| `publishers` | Organizations/individuals that submit extensions |
| `extensions` | Extension metadata (name, description, categories) |
| `extension_versions` | Published versions with bundles and signatures |
| `signing_keys` | Ed25519 public keys for signature verification |

### Supporting Tables

| Table | Description |
|-------|-------------|
| `extension_reviews` | User ratings and reviews (1-5 stars) |
| `extension_reports` | Abuse/security reports |
| `extension_deprecations` | Deprecation notices with replacements |
| `extension_installs` | Anonymous install analytics |

## Extension Categories

Extensions have a `category` field:

| Category | Description | Trust Level |
|----------|-------------|-------------|
| `sandboxed` | Runs in V8 isolate (default) | Community or Verified |
| `native` | Runs in main process | **Verified only** |

Native extensions (like SolidWorks) require Blue Robotics verification.

## Verification Tiers

| Tier | Badge | Meaning |
|------|-------|---------|
| **Verified** | ✓ Checkmark | Code reviewed and signed by Blue Robotics |
| **Community** | ⚠ Warning | Not reviewed - use at your own risk |

## Helper Functions

### Search Extensions

```sql
SELECT * FROM search_extensions(
    query := 'google drive',
    filter_categories := ARRAY['sync'],
    verified_only := FALSE,
    sort_by := 'downloads',
    page_size := 20,
    page_offset := 0
);
```

### Get Latest Version

```sql
SELECT * FROM get_latest_version(
    ext_id := '00000000-0000-0000-0001-000000000001',
    include_prerelease := FALSE
);
```

### Get Featured Extensions

```sql
SELECT * FROM get_featured_extensions(max_count := 6);
```

### Get Extension Statistics

```sql
SELECT * FROM get_extension_stats('00000000-0000-0000-0001-000000000001');
-- Returns: total_downloads, total_installs, unique_orgs, avg_rating, review_count, version_count
```

### Record Install (Analytics)

```sql
SELECT record_install(
    p_extension_id := '...',
    p_version := '1.2.0',
    p_app_version := '1.5.0',
    p_platform := 'win32',
    p_arch := 'x64',
    p_org_hash := 'sha256:...', -- Hashed org ID
    p_install_type := 'store'   -- 'store', 'sideload', 'update', 'reinstall'
);
```

### Increment Download Count

```sql
SELECT increment_download_count('00000000-0000-0000-0001-000000000001');
```

### Check Signing Key Validity

```sql
SELECT is_signing_key_valid('bluerobotics-2024');
-- Returns: TRUE/FALSE
```

## Row Level Security

### Public Access (No Auth)

- Read all published extensions
- Read published versions
- Read approved reviews
- Read active deprecations
- Read valid signing keys

### Publisher Access (Authenticated)

- Update own publisher profile
- Create/update own extensions
- Publish new versions

### Report Submission

- Anyone can submit reports (rate-limited in API)
- Anyone can record install analytics

### Admin Access

- Use service role key (bypasses RLS)
- Verify/feature extensions
- Resolve reports
- Manage deprecations

## Indexes

The schema includes indexes for:

- Full-text search on extension names/descriptions
- Category filtering (GIN index on arrays)
- Sorting by downloads, creation date
- Publisher lookups
- Version lookups

## Schema Versioning

```sql
SELECT * FROM schema_version ORDER BY version DESC LIMIT 1;
```

Current version: **1** (Initial release)

## Development

### Reset Database

```bash
# Drop all tables and recreate
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql $DATABASE_URL < schema.sql
psql $DATABASE_URL < seed.sql
```

### Test Search

```sql
-- Search for "drive" extensions
SELECT display_name, verified, download_count 
FROM search_extensions('drive');

-- Get featured extensions
SELECT display_name, category FROM get_featured_extensions();
```

## Production Notes

1. **Bundle Storage**: Bundle URLs point to Cloudflare R2/S3 bucket
2. **Rate Limiting**: Implemented in API layer, not database
3. **Signature Verification**: Done client-side using stored public keys
4. **Analytics**: `org_hash` is SHA256 of org_id for privacy
5. **Backups**: Supabase automatic backups + point-in-time recovery

## API Endpoints (Reference)

The Store API (Agent 8) implements these endpoints:

```
GET  /store/extensions                    - List/search
GET  /store/extensions/:id                - Details
GET  /store/extensions/:id/versions       - Version history
GET  /store/extensions/:id/download       - Download latest .bpx
GET  /store/extensions/:id/download/:ver  - Download specific version
GET  /store/featured                      - Featured extensions
POST /store/extensions                    - Submit new (auth required)
POST /store/extensions/:id/versions       - Publish version (auth required)
POST /store/extensions/:id/report         - Report extension
```

## Files

| File | Description |
|------|-------------|
| `schema.sql` | Complete database schema with RLS and functions |
| `seed.sql` | Sample data for development/testing |
| `README.md` | This documentation |
