# Agent 6: Extension Store Database - Completion Report

## Status: ✅ COMPLETE

**Agent**: 6 - Extension Store Database  
**Wave**: 2 (Infrastructure)  
**Dependencies**: None  
**Completed**: January 7, 2026  
**Repository**: `blueplm-site` (moved from `bluePLM`)

---

## Summary

Created the complete database schema for the BluePLM Extension Store marketplace at `marketplace.blueplm.io`. This is a **separate Supabase project** from organization databases, managed by Blue Robotics.

> **Note**: This schema was moved from `bluePLM/supabase-store/` to `blueplm-site/supabase-store/` because the marketplace is a centralized Blue Robotics service, separate from the self-hosted BluePLM application.

---

## Deliverables

| File | Status | Description |
|------|--------|-------------|
| `supabase-store/schema.sql` | ✅ | Complete database schema |
| `supabase-store/seed.sql` | ✅ | Sample data for testing |
| `supabase-store/README.md` | ✅ | Documentation |

---

## DATABASE TABLES

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `publishers` | Organizations that submit extensions | `id`, `slug`, `verified`, `owner_email` |
| `extensions` | Extension metadata | `id`, `publisher_id`, `name`, `category`, `verified`, `featured` |
| `extension_versions` | Published versions | `extension_id`, `version`, `bundle_url`, `bundle_hash`, `signature` |
| `signing_keys` | Ed25519 public keys for verification | `id`, `public_key`, `publisher_id`, `revoked` |

### Supporting Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `extension_reviews` | User ratings (1-5 stars) | `extension_id`, `user_id`, `rating`, `title`, `body` |
| `extension_reports` | Abuse/security reports | `extension_id`, `reason`, `status`, `priority` |
| `extension_deprecations` | Deprecation notices | `extension_id`, `replacement_id`, `sunset_date` |
| `extension_installs` | Anonymous analytics | `extension_id`, `platform`, `org_hash`, `install_type` |

### Utility Tables

| Table | Purpose |
|-------|---------|
| `schema_version` | Tracks schema version |

---

## FUNCTIONS

| Function | Purpose | Returns |
|----------|---------|---------|
| `get_extension_full_id(ext_id)` | Get `publisher.name` format | `TEXT` |
| `increment_download_count(ext_id)` | Atomically increment downloads | `VOID` |
| `get_latest_version(ext_id, include_prerelease)` | Get latest published version | `TABLE` |
| `search_extensions(query, categories, verified_only, ...)` | Full-text search with filters | `TABLE` |
| `get_extension_stats(ext_id)` | Get download/rating statistics | `TABLE` |
| `is_signing_key_valid(key_id)` | Check if signing key is valid | `BOOLEAN` |
| `get_featured_extensions(max_count)` | Get featured extensions | `TABLE` |
| `record_install(...)` | Record anonymous install analytics | `VOID` |
| `update_updated_at()` | Trigger function for timestamps | `TRIGGER` |
| `validate_native_extension()` | Ensure native extensions are verified | `TRIGGER` |

---

## RLS POLICIES

### Public Read Access

- `Public read publishers` - Anyone can browse publishers
- `Public read extensions` - Anyone can browse published extensions
- `Public read versions` - Anyone can see published versions
- `Public read reviews` - Anyone can read approved reviews
- `Public read deprecations` - Anyone can see active deprecations
- `Public read signing keys` - Anyone can access valid signing keys

### Publisher Access

- `Publishers can update own profile` - Publishers can modify their profile
- `Publishers can insert own extensions` - Publishers can submit extensions
- `Publishers can update own extensions` - Publishers can update their extensions
- `Publishers can insert versions` - Publishers can publish new versions

### Open Submission

- `Anyone can submit reports` - Abuse reports (rate-limited in API)
- `Anyone can record installs` - Anonymous analytics

---

## INDEXES

| Index | Table | Purpose |
|-------|-------|---------|
| `idx_publishers_slug` | publishers | Fast slug lookups |
| `idx_publishers_verified` | publishers | Filter verified |
| `idx_extensions_publisher` | extensions | Publisher lookups |
| `idx_extensions_category` | extensions | Category filtering |
| `idx_extensions_categories` | extensions | GIN index for array search |
| `idx_extensions_tags` | extensions | GIN index for tags |
| `idx_extensions_verified` | extensions | Filter verified |
| `idx_extensions_featured` | extensions | Featured extensions |
| `idx_extensions_download_count` | extensions | Sort by popularity |
| `idx_extensions_search` | extensions | Full-text search |
| `idx_versions_extension` | extension_versions | Version lookups |
| `idx_versions_published_at` | extension_versions | Sort by date |
| `idx_reviews_extension` | extension_reviews | Review lookups |
| `idx_reviews_rating` | extension_reviews | Rating filters |
| `idx_reports_extension` | extension_reports | Report lookups |
| `idx_reports_status` | extension_reports | Status filters |
| `idx_deprecations_extension` | extension_deprecations | Deprecation lookups |
| `idx_installs_extension` | extension_installs | Analytics queries |
| `idx_installs_date` | extension_installs | Time-based analytics |
| `idx_keys_publisher` | signing_keys | Key lookups |

---

## TRIGGERS

| Trigger | Table | Purpose |
|---------|-------|---------|
| `tr_publishers_updated_at` | publishers | Auto-update timestamp |
| `tr_extensions_updated_at` | extensions | Auto-update timestamp |
| `tr_reviews_updated_at` | extension_reviews | Auto-update timestamp |
| `tr_reports_updated_at` | extension_reports | Auto-update timestamp |
| `tr_validate_native_extension` | extensions | Enforce native = verified |

---

## SEED DATA

| Entity | Count | Notes |
|--------|-------|-------|
| Publishers | 3 | Blue Robotics (verified), Acme Corp, OpenPLM |
| Extensions | 7 | Google Drive, Odoo, SolidWorks, WooCommerce, SAP, Slack, Jira |
| Versions | 7 | Multiple versions for Google Drive and Odoo |
| Reviews | 3 | Sample user reviews |
| Installs | 150 | Simulated analytics data |
| Signing Keys | 1 | Blue Robotics 2024 key |

---

## Extension Categories

| Category | Trust Level | Example |
|----------|-------------|---------|
| `sandboxed` | Community or Verified | Google Drive, Odoo |
| `native` | **Verified only** | SolidWorks |

Native extensions are enforced by the `tr_validate_native_extension` trigger.

---

## Security Features

1. **RLS Enabled**: All tables have Row Level Security
2. **Native Validation**: Trigger prevents unverified native extensions
3. **Key Revocation**: Signing keys can be revoked with reason
4. **Report System**: Abuse reports with priority levels
5. **Audit Trail**: `extension_secret_access` in org DB (Agent 7)

---

## Integration Points

### Agent 7 (API Sandbox)

- Uses `extension_versions.manifest` for permission validation
- Checks `is_signing_key_valid()` for signatures

### Agent 8 (Store API)

- All store endpoints query these tables
- Uses `search_extensions()` for browse/search
- Uses `get_featured_extensions()` for home page
- Uses `record_install()` for analytics

### Agent 9 (Marketplace Frontend)

- Displays extension cards from `search_extensions()`
- Shows verification badges from `extensions.verified`
- Displays ratings from `get_extension_stats()`

---

## API ENDPOINTS

None (database only - endpoints are in Agent 8).

---

## IPC CHANNELS

None (server-side only).

---

## Notes

1. **Separate Project**: This schema is for a standalone Supabase project, not the org database
2. **Bundle Storage**: `bundle_url` points to Cloudflare R2 or S3
3. **Privacy**: `org_hash` in installs is SHA256 of org_id
4. **Rate Limiting**: Implemented in API (Agent 8), not database
5. **Admin Access**: Uses service role key to bypass RLS

---

## Dependencies on This Agent

| Agent | What They Need |
|-------|----------------|
| Agent 7 | Extension manifest structure for validation |
| Agent 8 | All tables and functions |
| Agent 9 | Search results format |
| Agent 10 | Extension listing format |

---

## Completion Checklist

- [x] Design publishers table
- [x] Design extensions table with category field
- [x] Design versions table with bundle storage
- [x] Design extension_reports table
- [x] Design extension_deprecations table
- [x] Design extension_reviews table
- [x] Design extension_installs analytics
- [x] Design signing_keys table
- [x] Create RLS policies
- [x] Create helper functions (search, stats, etc.)
- [x] Create triggers (updated_at, native validation)
- [x] Create seed data
- [x] Write documentation
- [x] Write completion report
