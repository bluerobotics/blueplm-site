-- ============================================================================
-- BluePLM Extension Store Database Schema
-- ============================================================================
-- This is a SEPARATE Supabase project for extensions.blueplm.io
-- Hosted by Blue Robotics, shared across all organizations
--
-- IDEMPOTENT: Safe to run multiple times
--
-- Key concepts:
--   - Publishers: Organizations that submit extensions
--   - Extensions: The actual extension packages
--   - Versions: Versioned releases of extensions
--   - All extensions are open source and free
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- ============================================================================
-- PUBLISHERS
-- ============================================================================
-- Organizations or individuals that submit extensions to the store

CREATE TABLE IF NOT EXISTS publishers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
    
    -- Profile
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    support_email TEXT,
    support_url TEXT,
    
    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID,  -- Admin user ID
    
    -- Auth
    owner_email TEXT NOT NULL,
    api_key_hash TEXT,  -- For CI/CD publishing
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publishers_slug ON publishers(slug);
CREATE INDEX IF NOT EXISTS idx_publishers_verified ON publishers(verified);

COMMENT ON TABLE publishers IS 'Organizations or individuals that submit extensions';
COMMENT ON COLUMN publishers.slug IS 'URL-safe identifier, e.g., "bluerobotics"';
COMMENT ON COLUMN publishers.verified IS 'True if verified by Blue Robotics';

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
-- Extension metadata (not version-specific)

CREATE TABLE IF NOT EXISTS extensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
    
    -- Identity (unique per publisher)
    name TEXT NOT NULL CHECK (name ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
    display_name TEXT NOT NULL,
    
    -- Metadata
    description TEXT,
    long_description TEXT,  -- Markdown for detail page
    icon_url TEXT,
    banner_url TEXT,  -- Hero image for detail page
    
    -- Links (all extensions must be open source)
    repository_url TEXT NOT NULL,
    license TEXT NOT NULL,  -- Must be OSI-approved (MIT, Apache-2.0, GPL-3.0, etc.)
    
    -- Extension type
    category TEXT NOT NULL DEFAULT 'sandboxed' CHECK (category IN ('sandboxed', 'native')),
    
    -- Discovery
    categories TEXT[] DEFAULT '{}',  -- e.g., ['sync', 'erp', 'cad']
    tags TEXT[] DEFAULT '{}',
    
    -- Status
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID,
    featured BOOLEAN DEFAULT FALSE,
    featured_at TIMESTAMPTZ,
    published BOOLEAN DEFAULT TRUE,  -- False = hidden from store
    
    -- Stats
    download_count INTEGER DEFAULT 0,
    install_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one extension name per publisher
    UNIQUE(publisher_id, name)
);

-- Note: Full extension ID (e.g., "blueplm.google-drive") is constructed 
-- by joining publisher.slug + extension.name. Uniqueness is enforced by 
-- UNIQUE(publisher_id, name) above, since each publisher has a unique slug.

CREATE INDEX IF NOT EXISTS idx_extensions_publisher ON extensions(publisher_id);
CREATE INDEX IF NOT EXISTS idx_extensions_category ON extensions(category);
CREATE INDEX IF NOT EXISTS idx_extensions_categories ON extensions USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_extensions_tags ON extensions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_extensions_verified ON extensions(verified);
CREATE INDEX IF NOT EXISTS idx_extensions_featured ON extensions(featured);
CREATE INDEX IF NOT EXISTS idx_extensions_published ON extensions(published);
CREATE INDEX IF NOT EXISTS idx_extensions_download_count ON extensions(download_count DESC);

-- Immutable wrapper for full-text search (required for index expressions)
CREATE OR REPLACE FUNCTION extensions_search_vector(p_display_name TEXT, p_description TEXT, p_tags TEXT[])
RETURNS tsvector AS $$
BEGIN
    RETURN to_tsvector('english', coalesce(p_display_name, '') || ' ' || coalesce(p_description, '') || ' ' || coalesce(array_to_string(p_tags, ' '), ''));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_extensions_search ON extensions USING GIN(
    extensions_search_vector(display_name, description, tags)
);

COMMENT ON TABLE extensions IS 'Extension packages available in the store';
COMMENT ON COLUMN extensions.name IS 'URL-safe name, e.g., "google-drive"';
COMMENT ON COLUMN extensions.category IS 'sandboxed (default) or native (verified only)';
COMMENT ON COLUMN extensions.categories IS 'Browsable categories like sync, erp, cad';

-- ============================================================================
-- EXTENSION VERSIONS
-- ============================================================================
-- Each published version of an extension

CREATE TABLE IF NOT EXISTS extension_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extension_id UUID NOT NULL REFERENCES extensions(id) ON DELETE CASCADE,
    
    -- Version info (semver)
    version TEXT NOT NULL CHECK (version ~ '^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$'),
    prerelease BOOLEAN DEFAULT FALSE,
    
    -- Release notes
    changelog TEXT,
    
    -- Bundle
    bundle_url TEXT NOT NULL,  -- URL to .bpx file (e.g., R2/S3)
    bundle_hash TEXT NOT NULL,  -- SHA256 hash for verification
    bundle_size INTEGER,  -- Bytes
    
    -- Signature (for verified extensions)
    signature TEXT,  -- Ed25519 signature
    signing_key_id TEXT,  -- Which key was used
    
    -- Compatibility
    min_app_version TEXT,  -- Minimum BluePLM version required
    max_app_version TEXT,  -- Maximum BluePLM version (for breaking changes)
    
    -- Full manifest snapshot
    manifest JSONB NOT NULL,
    
    -- Status
    published BOOLEAN DEFAULT TRUE,
    yanked BOOLEAN DEFAULT FALSE,  -- Deprecated but still downloadable
    yanked_reason TEXT,
    
    -- Timestamps
    published_at TIMESTAMPTZ DEFAULT NOW(),
    yanked_at TIMESTAMPTZ,
    
    -- Unique constraint: one version per extension
    UNIQUE(extension_id, version)
);

CREATE INDEX IF NOT EXISTS idx_versions_extension ON extension_versions(extension_id);
CREATE INDEX IF NOT EXISTS idx_versions_published_at ON extension_versions(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_published ON extension_versions(published);
CREATE INDEX IF NOT EXISTS idx_versions_yanked ON extension_versions(yanked);

COMMENT ON TABLE extension_versions IS 'Published versions of extensions';
COMMENT ON COLUMN extension_versions.version IS 'Semantic version, e.g., "1.2.3"';
COMMENT ON COLUMN extension_versions.bundle_hash IS 'SHA256 hash for integrity verification';
COMMENT ON COLUMN extension_versions.yanked IS 'True if deprecated but still downloadable';

-- ============================================================================
-- EXTENSION REVIEWS (Future: Ratings system)
-- ============================================================================
-- User reviews and ratings

CREATE TABLE IF NOT EXISTS extension_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extension_id UUID NOT NULL REFERENCES extensions(id) ON DELETE CASCADE,
    
    -- Reviewer
    user_id UUID NOT NULL,  -- From org's Supabase (not enforced here)
    user_email TEXT NOT NULL,
    user_name TEXT,
    org_id UUID,  -- Optional: which org they're reviewing from
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    body TEXT,
    
    -- Moderation
    approved BOOLEAN DEFAULT TRUE,
    flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One review per user per extension
    UNIQUE(extension_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_extension ON extension_reviews(extension_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON extension_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON extension_reviews(approved);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON extension_reviews(created_at DESC);

COMMENT ON TABLE extension_reviews IS 'User reviews and ratings for extensions';

-- ============================================================================
-- EXTENSION REPORTS
-- ============================================================================
-- Abuse, security, and issue reports

CREATE TABLE IF NOT EXISTS extension_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extension_id UUID NOT NULL REFERENCES extensions(id) ON DELETE CASCADE,
    version_id UUID REFERENCES extension_versions(id) ON DELETE SET NULL,
    
    -- Reporter
    reporter_email TEXT NOT NULL,
    reporter_org_id UUID,
    
    -- Report details
    reason TEXT NOT NULL CHECK (reason IN ('malicious', 'security', 'broken', 'spam', 'license', 'other')),
    details TEXT,
    evidence_urls TEXT[],  -- Screenshots, logs, etc.
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    
    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,  -- Admin email
    resolution_notes TEXT,
    action_taken TEXT,  -- 'none', 'warning', 'suspended', 'removed'
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_extension ON extension_reports(extension_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON extension_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON extension_reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_created ON extension_reports(created_at DESC);

COMMENT ON TABLE extension_reports IS 'Abuse and security reports for extensions';
COMMENT ON COLUMN extension_reports.reason IS 'Category: malicious, security, broken, spam, license, other';

-- ============================================================================
-- EXTENSION DEPRECATIONS
-- ============================================================================
-- Deprecation notices for extensions

CREATE TABLE IF NOT EXISTS extension_deprecations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extension_id UUID NOT NULL REFERENCES extensions(id) ON DELETE CASCADE,
    
    -- Deprecation info
    reason TEXT NOT NULL,
    replacement_id UUID REFERENCES extensions(id) ON DELETE SET NULL,
    migration_guide TEXT,  -- Markdown
    
    -- Timeline
    deprecated_at TIMESTAMPTZ DEFAULT NOW(),
    sunset_date DATE,  -- When it will stop working
    
    -- Who deprecated it
    deprecated_by TEXT,  -- Admin or publisher email
    
    -- Status
    active BOOLEAN DEFAULT TRUE,  -- Can be reverted
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deprecations_extension ON extension_deprecations(extension_id);
CREATE INDEX IF NOT EXISTS idx_deprecations_active ON extension_deprecations(active);
CREATE INDEX IF NOT EXISTS idx_deprecations_sunset ON extension_deprecations(sunset_date);

COMMENT ON TABLE extension_deprecations IS 'Deprecation notices with replacement suggestions';
COMMENT ON COLUMN extension_deprecations.sunset_date IS 'Date when extension will be removed';

-- ============================================================================
-- EXTENSION INSTALLS (Analytics)
-- ============================================================================
-- Anonymous install analytics

CREATE TABLE IF NOT EXISTS extension_installs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extension_id UUID NOT NULL REFERENCES extensions(id) ON DELETE CASCADE,
    version_id UUID REFERENCES extension_versions(id) ON DELETE SET NULL,
    
    -- Version info (denormalized for analytics)
    version TEXT,
    
    -- Client info
    app_version TEXT,
    platform TEXT CHECK (platform IN ('win32', 'darwin', 'linux')),
    arch TEXT CHECK (arch IN ('x64', 'arm64', 'ia32')),
    
    -- Anonymous org tracking (hashed)
    org_hash TEXT,  -- SHA256 of org_id, for unique counts
    
    -- Install type
    install_type TEXT DEFAULT 'store' CHECK (install_type IN ('store', 'sideload', 'update', 'reinstall')),
    
    -- Timestamps
    installed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partition by month for efficient analytics queries
CREATE INDEX IF NOT EXISTS idx_installs_extension ON extension_installs(extension_id);
CREATE INDEX IF NOT EXISTS idx_installs_version ON extension_installs(version_id);
CREATE INDEX IF NOT EXISTS idx_installs_date ON extension_installs(installed_at);
CREATE INDEX IF NOT EXISTS idx_installs_platform ON extension_installs(platform);

COMMENT ON TABLE extension_installs IS 'Anonymous install analytics';
COMMENT ON COLUMN extension_installs.org_hash IS 'Hashed org_id for unique counts without PII';

-- ============================================================================
-- SIGNING KEYS
-- ============================================================================
-- Public keys for verifying extension signatures

CREATE TABLE IF NOT EXISTS signing_keys (
    id TEXT PRIMARY KEY,  -- Key ID, e.g., "bluerobotics-2024"
    
    -- Key info
    public_key TEXT NOT NULL,  -- Ed25519 public key (base64)
    algorithm TEXT NOT NULL DEFAULT 'ed25519',
    
    -- Owner
    publisher_id UUID REFERENCES publishers(id) ON DELETE CASCADE,
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT,
    
    -- Validity period
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,  -- NULL = no expiry
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keys_publisher ON signing_keys(publisher_id);
CREATE INDEX IF NOT EXISTS idx_keys_active ON signing_keys(active);
CREATE INDEX IF NOT EXISTS idx_keys_revoked ON signing_keys(revoked);

COMMENT ON TABLE signing_keys IS 'Public keys for Ed25519 signature verification';
COMMENT ON COLUMN signing_keys.id IS 'Key ID referenced in signatures, e.g., "bluerobotics-2024"';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get full extension ID (publisher.name)
CREATE OR REPLACE FUNCTION get_extension_full_id(ext_id UUID)
RETURNS TEXT AS $$
    SELECT p.slug || '.' || e.name
    FROM extensions e
    JOIN publishers p ON p.id = e.publisher_id
    WHERE e.id = ext_id;
$$ LANGUAGE SQL STABLE;

-- Increment download count atomically
CREATE OR REPLACE FUNCTION increment_download_count(ext_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE extensions
    SET download_count = download_count + 1,
        updated_at = NOW()
    WHERE id = ext_id;
END;
$$ LANGUAGE plpgsql;

-- Get latest version for an extension
CREATE OR REPLACE FUNCTION get_latest_version(ext_id UUID, include_prerelease BOOLEAN DEFAULT FALSE)
RETURNS TABLE (
    version_id UUID,
    version TEXT,
    bundle_url TEXT,
    bundle_hash TEXT,
    published_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ev.id,
        ev.version,
        ev.bundle_url,
        ev.bundle_hash,
        ev.published_at
    FROM extension_versions ev
    WHERE ev.extension_id = ext_id
      AND ev.published = TRUE
      AND ev.yanked = FALSE
      AND (include_prerelease OR ev.prerelease = FALSE)
    ORDER BY ev.published_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Search extensions with full-text and filters
CREATE OR REPLACE FUNCTION search_extensions(
    query TEXT DEFAULT NULL,
    filter_categories TEXT[] DEFAULT NULL,
    verified_only BOOLEAN DEFAULT FALSE,
    extension_category TEXT DEFAULT NULL,  -- 'sandboxed' or 'native'
    sort_by TEXT DEFAULT 'relevance',  -- 'relevance', 'downloads', 'newest', 'name'
    page_size INTEGER DEFAULT 20,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    publisher_slug TEXT,
    name TEXT,
    display_name TEXT,
    description TEXT,
    icon_url TEXT,
    category TEXT,
    categories TEXT[],
    tags TEXT[],
    verified BOOLEAN,
    featured BOOLEAN,
    download_count INTEGER,
    latest_version TEXT,
    created_at TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_extensions AS (
        SELECT 
            e.id,
            p.slug AS publisher_slug,
            e.name,
            e.display_name,
            e.description,
            e.icon_url,
            e.category,
            e.categories,
            e.tags,
            e.verified,
            e.featured,
            e.download_count,
            (SELECT ev.version FROM extension_versions ev 
             WHERE ev.extension_id = e.id AND ev.published = TRUE AND ev.yanked = FALSE 
             ORDER BY ev.published_at DESC LIMIT 1) AS latest_version,
            e.created_at,
            CASE 
                WHEN query IS NOT NULL THEN
                    ts_rank(
                        to_tsvector('english', coalesce(e.display_name, '') || ' ' || coalesce(e.description, '') || ' ' || coalesce(array_to_string(e.tags, ' '), '')),
                        plainto_tsquery('english', query)
                    )
                ELSE 1.0
            END AS rank
        FROM extensions e
        JOIN publishers p ON p.id = e.publisher_id
        WHERE e.published = TRUE
          AND (query IS NULL OR 
               to_tsvector('english', coalesce(e.display_name, '') || ' ' || coalesce(e.description, '') || ' ' || coalesce(array_to_string(e.tags, ' '), ''))
               @@ plainto_tsquery('english', query)
               OR e.display_name ILIKE '%' || query || '%'
               OR e.name ILIKE '%' || query || '%')
          AND (filter_categories IS NULL OR e.categories && filter_categories)
          AND (NOT verified_only OR e.verified = TRUE)
          AND (extension_category IS NULL OR e.category = extension_category)
    )
    SELECT 
        re.id,
        re.publisher_slug,
        re.name,
        re.display_name,
        re.description,
        re.icon_url,
        re.category,
        re.categories,
        re.tags,
        re.verified,
        re.featured,
        re.download_count,
        re.latest_version,
        re.created_at,
        re.rank
    FROM ranked_extensions re
    ORDER BY
        CASE sort_by
            WHEN 'relevance' THEN -re.rank
            WHEN 'downloads' THEN 0
            WHEN 'newest' THEN 0
            WHEN 'name' THEN 0
            ELSE -re.rank
        END,
        CASE sort_by
            WHEN 'downloads' THEN -re.download_count
            ELSE 0
        END,
        CASE sort_by
            WHEN 'newest' THEN re.created_at
            ELSE NULL
        END DESC NULLS LAST,
        CASE sort_by
            WHEN 'name' THEN re.display_name
            ELSE NULL
        END ASC NULLS LAST,
        re.featured DESC,
        re.download_count DESC
    LIMIT page_size
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get extension statistics
CREATE OR REPLACE FUNCTION get_extension_stats(ext_id UUID)
RETURNS TABLE (
    total_downloads INTEGER,
    total_installs BIGINT,
    unique_orgs BIGINT,
    avg_rating NUMERIC,
    review_count BIGINT,
    version_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.download_count AS total_downloads,
        (SELECT COUNT(*) FROM extension_installs ei WHERE ei.extension_id = ext_id) AS total_installs,
        (SELECT COUNT(DISTINCT org_hash) FROM extension_installs ei WHERE ei.extension_id = ext_id) AS unique_orgs,
        (SELECT ROUND(AVG(rating)::numeric, 1) FROM extension_reviews er WHERE er.extension_id = ext_id AND er.approved = TRUE) AS avg_rating,
        (SELECT COUNT(*) FROM extension_reviews er WHERE er.extension_id = ext_id AND er.approved = TRUE) AS review_count,
        (SELECT COUNT(*) FROM extension_versions ev WHERE ev.extension_id = ext_id AND ev.published = TRUE) AS version_count
    FROM extensions e
    WHERE e.id = ext_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if a signing key is valid
CREATE OR REPLACE FUNCTION is_signing_key_valid(key_id TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM signing_keys
        WHERE id = key_id
          AND active = TRUE
          AND revoked = FALSE
          AND valid_from <= NOW()
          AND (valid_until IS NULL OR valid_until > NOW())
    );
$$ LANGUAGE SQL STABLE;

-- Get featured extensions
CREATE OR REPLACE FUNCTION get_featured_extensions(max_count INTEGER DEFAULT 6)
RETURNS TABLE (
    id UUID,
    publisher_slug TEXT,
    name TEXT,
    display_name TEXT,
    description TEXT,
    icon_url TEXT,
    banner_url TEXT,
    category TEXT,
    verified BOOLEAN,
    download_count INTEGER,
    latest_version TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        p.slug,
        e.name,
        e.display_name,
        e.description,
        e.icon_url,
        e.banner_url,
        e.category,
        e.verified,
        e.download_count,
        (SELECT ev.version FROM extension_versions ev 
         WHERE ev.extension_id = e.id AND ev.published = TRUE AND ev.yanked = FALSE 
         ORDER BY ev.published_at DESC LIMIT 1)
    FROM extensions e
    JOIN publishers p ON p.id = e.publisher_id
    WHERE e.featured = TRUE
      AND e.published = TRUE
    ORDER BY e.featured_at DESC NULLS LAST, e.download_count DESC
    LIMIT max_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Record an install (with deduplication)
CREATE OR REPLACE FUNCTION record_install(
    p_extension_id UUID,
    p_version TEXT,
    p_app_version TEXT,
    p_platform TEXT,
    p_arch TEXT,
    p_org_hash TEXT,
    p_install_type TEXT DEFAULT 'store'
)
RETURNS VOID AS $$
BEGIN
    -- Insert install record
    INSERT INTO extension_installs (
        extension_id, version, app_version, platform, arch, org_hash, install_type
    ) VALUES (
        p_extension_id, p_version, p_app_version, p_platform, p_arch, p_org_hash, p_install_type
    );
    
    -- Increment install count on extension
    UPDATE extensions
    SET install_count = install_count + 1,
        updated_at = NOW()
    WHERE id = p_extension_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate triggers (idempotent)
DROP TRIGGER IF EXISTS tr_publishers_updated_at ON publishers;
CREATE TRIGGER tr_publishers_updated_at
    BEFORE UPDATE ON publishers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tr_extensions_updated_at ON extensions;
CREATE TRIGGER tr_extensions_updated_at
    BEFORE UPDATE ON extensions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tr_reviews_updated_at ON extension_reviews;
CREATE TRIGGER tr_reviews_updated_at
    BEFORE UPDATE ON extension_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tr_reports_updated_at ON extension_reports;
CREATE TRIGGER tr_reports_updated_at
    BEFORE UPDATE ON extension_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Validate native extensions must be verified
CREATE OR REPLACE FUNCTION validate_native_extension()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.category = 'native' AND NEW.verified = FALSE THEN
        RAISE EXCEPTION 'Native extensions must be verified by Blue Robotics';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_validate_native_extension ON extensions;
CREATE TRIGGER tr_validate_native_extension
    BEFORE INSERT OR UPDATE ON extensions
    FOR EACH ROW EXECUTE FUNCTION validate_native_extension();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_deprecations ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_installs ENABLE ROW LEVEL SECURITY;
ALTER TABLE signing_keys ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies (idempotent)
-- Public read access for store browsing
DROP POLICY IF EXISTS "Public read publishers" ON publishers;
CREATE POLICY "Public read publishers"
    ON publishers FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public read extensions" ON extensions;
CREATE POLICY "Public read extensions"
    ON extensions FOR SELECT
    USING (published = true);

DROP POLICY IF EXISTS "Public read versions" ON extension_versions;
CREATE POLICY "Public read versions"
    ON extension_versions FOR SELECT
    USING (published = true);

DROP POLICY IF EXISTS "Public read reviews" ON extension_reviews;
CREATE POLICY "Public read reviews"
    ON extension_reviews FOR SELECT
    USING (approved = true);

DROP POLICY IF EXISTS "Public read deprecations" ON extension_deprecations;
CREATE POLICY "Public read deprecations"
    ON extension_deprecations FOR SELECT
    USING (active = true);

DROP POLICY IF EXISTS "Public read signing keys" ON signing_keys;
CREATE POLICY "Public read signing keys"
    ON signing_keys FOR SELECT
    USING (active = true AND revoked = false);

-- Publishers can modify their own data
DROP POLICY IF EXISTS "Publishers can update own profile" ON publishers;
CREATE POLICY "Publishers can update own profile"
    ON publishers FOR UPDATE
    USING (auth.jwt() ->> 'email' = owner_email);

DROP POLICY IF EXISTS "Publishers can insert own extensions" ON extensions;
CREATE POLICY "Publishers can insert own extensions"
    ON extensions FOR INSERT
    WITH CHECK (
        publisher_id IN (
            SELECT id FROM publishers WHERE owner_email = auth.jwt() ->> 'email'
        )
    );

DROP POLICY IF EXISTS "Publishers can update own extensions" ON extensions;
CREATE POLICY "Publishers can update own extensions"
    ON extensions FOR UPDATE
    USING (
        publisher_id IN (
            SELECT id FROM publishers WHERE owner_email = auth.jwt() ->> 'email'
        )
    );

DROP POLICY IF EXISTS "Publishers can insert versions" ON extension_versions;
CREATE POLICY "Publishers can insert versions"
    ON extension_versions FOR INSERT
    WITH CHECK (
        extension_id IN (
            SELECT e.id FROM extensions e
            JOIN publishers p ON p.id = e.publisher_id
            WHERE p.owner_email = auth.jwt() ->> 'email'
        )
    );

-- Anyone can submit reports (with rate limiting in API)
DROP POLICY IF EXISTS "Anyone can submit reports" ON extension_reports;
CREATE POLICY "Anyone can submit reports"
    ON extension_reports FOR INSERT
    WITH CHECK (true);

-- Analytics are insert-only
DROP POLICY IF EXISTS "Anyone can record installs" ON extension_installs;
CREATE POLICY "Anyone can record installs"
    ON extension_installs FOR INSERT
    WITH CHECK (true);

-- Admin policies (service role bypass)
-- Note: Admins use service role key which bypasses RLS

-- ============================================================================
-- SCHEMA VERSION
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent insert
INSERT INTO schema_version (version, description)
VALUES (1, 'Initial extension store schema')
ON CONFLICT (version) DO NOTHING;

COMMENT ON TABLE schema_version IS 'Tracks database schema version';

-- ============================================================================
-- EXTENSION SUBMISSIONS
-- ============================================================================
-- Tracks extension submissions through the approval workflow.
-- Users submit extensions publicly, admins (Blue Robotics) review and approve.

CREATE TABLE IF NOT EXISTS extension_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Submitter info
    submitter_email TEXT NOT NULL,
    submitter_name TEXT,
    
    -- Extension metadata
    repository_url TEXT NOT NULL,
    name TEXT NOT NULL CHECK (name ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
    display_name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'sandboxed' CHECK (category IN ('sandboxed', 'native')),
    
    -- Optional: Publisher to associate with (if existing)
    publisher_id UUID REFERENCES publishers(id) ON DELETE SET NULL,
    
    -- Review workflow
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_changes')),
    reviewer_email TEXT,
    reviewer_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    
    -- Resulting extension (set after approval)
    extension_id UUID REFERENCES extensions(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_submissions_status ON extension_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON extension_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_submitter ON extension_submissions(submitter_email);
CREATE INDEX IF NOT EXISTS idx_submissions_reviewer ON extension_submissions(reviewer_email);
CREATE INDEX IF NOT EXISTS idx_submissions_pending ON extension_submissions(status) WHERE status = 'pending';

COMMENT ON TABLE extension_submissions IS 'Extension submission workflow for marketplace approval';
COMMENT ON COLUMN extension_submissions.status IS 'pending: awaiting review, approved: published, rejected: denied, needs_changes: returned to submitter';
COMMENT ON COLUMN extension_submissions.reviewer_notes IS 'Feedback from reviewer for rejection or requested changes';
COMMENT ON COLUMN extension_submissions.extension_id IS 'The created extension after approval';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS tr_submissions_updated_at ON extension_submissions;
CREATE TRIGGER tr_submissions_updated_at
    BEFORE UPDATE ON extension_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- EXTENSION SUBMISSIONS RLS
-- ============================================================================

ALTER TABLE extension_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit extensions (rate-limited in API)
DROP POLICY IF EXISTS "Anyone can submit extensions" ON extension_submissions;
CREATE POLICY "Anyone can submit extensions"
    ON extension_submissions FOR INSERT
    WITH CHECK (true);

-- Submitters can view their own submissions
DROP POLICY IF EXISTS "Submitters can view own submissions" ON extension_submissions;
CREATE POLICY "Submitters can view own submissions"
    ON extension_submissions FOR SELECT
    USING (submitter_email = auth.jwt() ->> 'email');

-- Admins (@bluerobotics.com) can view all submissions
DROP POLICY IF EXISTS "Admins can view all submissions" ON extension_submissions;
CREATE POLICY "Admins can view all submissions"
    ON extension_submissions FOR SELECT
    USING (
        (auth.jwt() ->> 'email') LIKE '%@bluerobotics.com'
    );

-- Admins (@bluerobotics.com) can update submissions (approve/reject)
DROP POLICY IF EXISTS "Admins can update submissions" ON extension_submissions;
CREATE POLICY "Admins can update submissions"
    ON extension_submissions FOR UPDATE
    USING (
        (auth.jwt() ->> 'email') LIKE '%@bluerobotics.com'
    );

-- ============================================================================
-- SUBMISSION HELPER FUNCTIONS
-- ============================================================================

-- Approve a submission and create the extension atomically
-- Returns the created extension ID
CREATE OR REPLACE FUNCTION approve_submission(
    p_submission_id UUID,
    p_reviewer_email TEXT,
    p_reviewer_notes TEXT DEFAULT NULL,
    p_publisher_id UUID DEFAULT NULL  -- Can specify publisher or create new
)
RETURNS UUID AS $$
DECLARE
    v_submission extension_submissions%ROWTYPE;
    v_publisher_id UUID;
    v_extension_id UUID;
BEGIN
    -- Lock and get submission
    SELECT * INTO v_submission
    FROM extension_submissions
    WHERE id = p_submission_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found: %', p_submission_id;
    END IF;
    
    IF v_submission.status != 'pending' AND v_submission.status != 'needs_changes' THEN
        RAISE EXCEPTION 'Submission cannot be approved from status: %', v_submission.status;
    END IF;
    
    -- Determine publisher
    v_publisher_id := COALESCE(p_publisher_id, v_submission.publisher_id);
    
    IF v_publisher_id IS NULL THEN
        -- Create new publisher from submitter info
        INSERT INTO publishers (
            name,
            slug,
            owner_email,
            description
        ) VALUES (
            COALESCE(v_submission.submitter_name, split_part(v_submission.submitter_email, '@', 1)),
            lower(regexp_replace(COALESCE(v_submission.submitter_name, split_part(v_submission.submitter_email, '@', 1)), '[^a-z0-9]+', '-', 'g')),
            v_submission.submitter_email,
            'Extension publisher'
        )
        RETURNING id INTO v_publisher_id;
    END IF;
    
    -- Create the extension
    INSERT INTO extensions (
        publisher_id,
        name,
        display_name,
        description,
        repository_url,
        category,
        license,
        published
    ) VALUES (
        v_publisher_id,
        v_submission.name,
        v_submission.display_name,
        v_submission.description,
        v_submission.repository_url,
        v_submission.category,
        'MIT',  -- Default license, can be updated later
        TRUE    -- Published immediately on approval
    )
    RETURNING id INTO v_extension_id;
    
    -- Update submission as approved
    UPDATE extension_submissions
    SET status = 'approved',
        reviewer_email = p_reviewer_email,
        reviewer_notes = p_reviewer_notes,
        reviewed_at = NOW(),
        publisher_id = v_publisher_id,
        extension_id = v_extension_id,
        updated_at = NOW()
    WHERE id = p_submission_id;
    
    RETURN v_extension_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION approve_submission IS 'Atomically approve a submission and create the extension';

-- Reject a submission with feedback
CREATE OR REPLACE FUNCTION reject_submission(
    p_submission_id UUID,
    p_reviewer_email TEXT,
    p_reviewer_notes TEXT
)
RETURNS VOID AS $$
DECLARE
    v_submission extension_submissions%ROWTYPE;
BEGIN
    -- Lock and get submission
    SELECT * INTO v_submission
    FROM extension_submissions
    WHERE id = p_submission_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found: %', p_submission_id;
    END IF;
    
    IF v_submission.status NOT IN ('pending', 'needs_changes') THEN
        RAISE EXCEPTION 'Submission cannot be rejected from status: %', v_submission.status;
    END IF;
    
    IF p_reviewer_notes IS NULL OR length(trim(p_reviewer_notes)) = 0 THEN
        RAISE EXCEPTION 'Reviewer notes are required when rejecting a submission';
    END IF;
    
    UPDATE extension_submissions
    SET status = 'rejected',
        reviewer_email = p_reviewer_email,
        reviewer_notes = p_reviewer_notes,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_submission_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reject_submission IS 'Reject a submission with required feedback';

-- Request changes on a submission
CREATE OR REPLACE FUNCTION request_changes_submission(
    p_submission_id UUID,
    p_reviewer_email TEXT,
    p_reviewer_notes TEXT
)
RETURNS VOID AS $$
DECLARE
    v_submission extension_submissions%ROWTYPE;
BEGIN
    -- Lock and get submission
    SELECT * INTO v_submission
    FROM extension_submissions
    WHERE id = p_submission_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found: %', p_submission_id;
    END IF;
    
    IF v_submission.status != 'pending' THEN
        RAISE EXCEPTION 'Changes can only be requested on pending submissions, current status: %', v_submission.status;
    END IF;
    
    IF p_reviewer_notes IS NULL OR length(trim(p_reviewer_notes)) = 0 THEN
        RAISE EXCEPTION 'Reviewer notes are required when requesting changes';
    END IF;
    
    UPDATE extension_submissions
    SET status = 'needs_changes',
        reviewer_email = p_reviewer_email,
        reviewer_notes = p_reviewer_notes,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_submission_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION request_changes_submission IS 'Request changes on a submission with required feedback';

-- Get pending submission count (for dashboard badge)
CREATE OR REPLACE FUNCTION get_pending_submission_count()
RETURNS BIGINT AS $$
    SELECT COUNT(*) FROM extension_submissions WHERE status = 'pending';
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_pending_submission_count IS 'Get count of pending submissions for admin dashboard';

-- List submissions with filters (for admin dashboard)
CREATE OR REPLACE FUNCTION list_submissions(
    p_status TEXT DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_page_size INTEGER DEFAULT 20,
    p_page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    submitter_email TEXT,
    submitter_name TEXT,
    repository_url TEXT,
    name TEXT,
    display_name TEXT,
    description TEXT,
    category TEXT,
    status TEXT,
    reviewer_email TEXT,
    reviewer_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.submitter_email,
        s.submitter_name,
        s.repository_url,
        s.name,
        s.display_name,
        s.description,
        s.category,
        s.status,
        s.reviewer_email,
        s.reviewer_notes,
        s.reviewed_at,
        s.created_at,
        s.updated_at
    FROM extension_submissions s
    WHERE (p_status IS NULL OR s.status = p_status)
      AND (p_search IS NULL OR 
           s.display_name ILIKE '%' || p_search || '%' OR
           s.name ILIKE '%' || p_search || '%' OR
           s.submitter_email ILIKE '%' || p_search || '%')
    ORDER BY 
        CASE s.status 
            WHEN 'pending' THEN 0 
            WHEN 'needs_changes' THEN 1 
            ELSE 2 
        END,
        s.created_at DESC
    LIMIT p_page_size
    OFFSET p_page_offset;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION list_submissions IS 'List submissions with optional status filter and search';

-- ============================================================================
-- SCHEMA VERSION 2
-- ============================================================================

INSERT INTO schema_version (version, description)
VALUES (2, 'Extension submissions workflow for marketplace approval')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- GITHUB RELEASES INTEGRATION (Schema Version 3)
-- ============================================================================
-- Adds support for:
--   - Fetching extension metadata from GitHub releases
--   - Computing SHA256 hashes for .bpx files
--   - Tracking sync job state
--   - Creating versions automatically on approval

-- ============================================================================
-- EXTENSION SUBMISSIONS - GitHub Release Columns
-- ============================================================================
-- These columns store data fetched from GitHub when a submission is created

-- GitHub repository info
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS github_owner TEXT;
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS github_repo TEXT;
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS latest_release_tag TEXT;

-- Fetched manifest data (from extension.json in release)
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS fetched_manifest JSONB;
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS fetched_version TEXT;
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS fetched_display_name TEXT;
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS fetched_description TEXT;
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS fetched_icon_url TEXT;
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS fetched_categories TEXT[];
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS fetched_license TEXT;

-- .bpx bundle info
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS bpx_download_url TEXT;
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS bpx_hash TEXT;
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS bpx_size INTEGER;

-- Release notes (sanitized for XSS)
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS changelog TEXT;

-- Fetch status
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS fetch_error TEXT;
ALTER TABLE extension_submissions ADD COLUMN IF NOT EXISTS fetched_at TIMESTAMPTZ;

COMMENT ON COLUMN extension_submissions.github_owner IS 'GitHub repository owner (e.g., "bluerobotics")';
COMMENT ON COLUMN extension_submissions.github_repo IS 'GitHub repository name (e.g., "blueplm-ext-google-drive")';
COMMENT ON COLUMN extension_submissions.latest_release_tag IS 'Git tag of the latest release (e.g., "v1.0.0")';
COMMENT ON COLUMN extension_submissions.fetched_manifest IS 'Full extension.json contents from the release';
COMMENT ON COLUMN extension_submissions.fetched_version IS 'Version from manifest (source of truth, not tag)';
COMMENT ON COLUMN extension_submissions.bpx_hash IS 'SHA256 hash of .bpx file computed server-side';
COMMENT ON COLUMN extension_submissions.changelog IS 'Sanitized release notes from GitHub release body';

-- ============================================================================
-- EXTENSIONS - Sync Tracking
-- ============================================================================
-- Track when extensions were last synced with GitHub

ALTER TABLE extensions ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_extensions_last_synced ON extensions(last_synced_at);

COMMENT ON COLUMN extensions.last_synced_at IS 'When releases were last fetched from GitHub';

-- ============================================================================
-- EXTENSION SYNC LOG
-- ============================================================================
-- Tracks sync job executions for debugging and monitoring

CREATE TABLE IF NOT EXISTS extension_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extension_id UUID REFERENCES extensions(id) ON DELETE CASCADE,
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Results
    releases_checked INTEGER DEFAULT 0,
    versions_added INTEGER DEFAULT 0,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'running',
    error_message TEXT,
    
    CONSTRAINT valid_sync_status CHECK (status IN ('running', 'success', 'error'))
);

CREATE INDEX IF NOT EXISTS idx_sync_log_extension ON extension_sync_log(extension_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON extension_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_sync_log_started ON extension_sync_log(started_at DESC);

COMMENT ON TABLE extension_sync_log IS 'Tracks sync job executions for GitHub release polling';
COMMENT ON COLUMN extension_sync_log.releases_checked IS 'Number of GitHub releases examined';
COMMENT ON COLUMN extension_sync_log.versions_added IS 'Number of new versions added to database';

-- RLS for sync log (read-only for admins, service role can write)
ALTER TABLE extension_sync_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view sync log" ON extension_sync_log;
CREATE POLICY "Admins can view sync log"
    ON extension_sync_log FOR SELECT
    USING (
        (auth.jwt() ->> 'email') LIKE '%@bluerobotics.com'
    );

-- ============================================================================
-- UPDATED APPROVE_SUBMISSION FUNCTION
-- ============================================================================
-- Now creates initial version from fetched GitHub release data

CREATE OR REPLACE FUNCTION approve_submission(
    p_submission_id UUID,
    p_reviewer_email TEXT,
    p_reviewer_notes TEXT DEFAULT NULL,
    p_publisher_id UUID DEFAULT NULL  -- Can specify publisher or create new
)
RETURNS UUID AS $$
DECLARE
    v_submission extension_submissions%ROWTYPE;
    v_publisher_id UUID;
    v_extension_id UUID;
    v_display_name TEXT;
    v_description TEXT;
    v_license TEXT;
    v_categories TEXT[];
BEGIN
    -- Lock and get submission
    SELECT * INTO v_submission
    FROM extension_submissions
    WHERE id = p_submission_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found: %', p_submission_id;
    END IF;
    
    IF v_submission.status != 'pending' AND v_submission.status != 'needs_changes' THEN
        RAISE EXCEPTION 'Submission cannot be approved from status: %', v_submission.status;
    END IF;
    
    -- Validate required GitHub release data
    IF v_submission.bpx_hash IS NULL THEN
        RAISE EXCEPTION 'Cannot approve submission without .bpx hash. Re-fetch release data.';
    END IF;
    
    IF v_submission.fetched_version IS NULL THEN
        RAISE EXCEPTION 'Cannot approve submission without version. Re-fetch release data.';
    END IF;
    
    -- Use fetched data, falling back to submission data
    v_display_name := COALESCE(v_submission.fetched_display_name, v_submission.display_name);
    v_description := COALESCE(v_submission.fetched_description, v_submission.description);
    v_license := COALESCE(v_submission.fetched_license, 'MIT');
    v_categories := COALESCE(v_submission.fetched_categories, '{}');
    
    -- Determine publisher
    v_publisher_id := COALESCE(p_publisher_id, v_submission.publisher_id);
    
    IF v_publisher_id IS NULL THEN
        -- Create new publisher from submitter info
        INSERT INTO publishers (
            name,
            slug,
            owner_email,
            description
        ) VALUES (
            COALESCE(v_submission.submitter_name, split_part(v_submission.submitter_email, '@', 1)),
            lower(regexp_replace(COALESCE(v_submission.submitter_name, split_part(v_submission.submitter_email, '@', 1)), '[^a-z0-9]+', '-', 'g')),
            v_submission.submitter_email,
            'Extension publisher'
        )
        RETURNING id INTO v_publisher_id;
    END IF;
    
    -- Create the extension with fetched metadata
    INSERT INTO extensions (
        publisher_id,
        name,
        display_name,
        description,
        repository_url,
        category,
        categories,
        license,
        icon_url,
        published,
        last_synced_at
    ) VALUES (
        v_publisher_id,
        v_submission.name,
        v_display_name,
        v_description,
        v_submission.repository_url,
        v_submission.category,
        v_categories,
        v_license,
        v_submission.fetched_icon_url,
        TRUE,
        NOW()
    )
    RETURNING id INTO v_extension_id;
    
    -- Create initial version from fetched release data
    INSERT INTO extension_versions (
        extension_id,
        version,
        manifest,
        changelog,
        bundle_url,
        bundle_hash,
        bundle_size,
        prerelease,
        published,
        published_at
    ) VALUES (
        v_extension_id,
        v_submission.fetched_version,
        COALESCE(v_submission.fetched_manifest, '{}'::jsonb),
        v_submission.changelog,
        v_submission.bpx_download_url,
        v_submission.bpx_hash,
        v_submission.bpx_size,
        FALSE,
        TRUE,
        NOW()
    );
    
    -- Update submission as approved
    UPDATE extension_submissions
    SET status = 'approved',
        reviewer_email = p_reviewer_email,
        reviewer_notes = p_reviewer_notes,
        reviewed_at = NOW(),
        publisher_id = v_publisher_id,
        extension_id = v_extension_id,
        updated_at = NOW()
    WHERE id = p_submission_id;
    
    RETURN v_extension_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION approve_submission IS 'Atomically approve a submission and create extension with initial version from GitHub release';

-- ============================================================================
-- ADD VERSION FROM SYNC JOB
-- ============================================================================
-- Used by sync job to add new versions discovered from GitHub releases

CREATE OR REPLACE FUNCTION add_version_from_sync(
    p_extension_id UUID,
    p_version TEXT,
    p_manifest JSONB,
    p_changelog TEXT,
    p_bundle_url TEXT,
    p_bundle_hash TEXT,
    p_bundle_size INTEGER,
    p_prerelease BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
    v_version_id UUID;
    v_existing_version UUID;
BEGIN
    -- Check if version already exists
    SELECT id INTO v_existing_version
    FROM extension_versions
    WHERE extension_id = p_extension_id
      AND version = p_version;
    
    IF v_existing_version IS NOT NULL THEN
        -- Version already exists, return existing ID
        RETURN v_existing_version;
    END IF;
    
    -- Validate hash is provided
    IF p_bundle_hash IS NULL OR length(p_bundle_hash) != 64 THEN
        RAISE EXCEPTION 'Invalid or missing bundle_hash. Must be 64-character SHA256 hex string.';
    END IF;
    
    -- Insert new version
    INSERT INTO extension_versions (
        extension_id,
        version,
        manifest,
        changelog,
        bundle_url,
        bundle_hash,
        bundle_size,
        prerelease,
        published,
        published_at
    ) VALUES (
        p_extension_id,
        p_version,
        p_manifest,
        p_changelog,
        p_bundle_url,
        p_bundle_hash,
        p_bundle_size,
        p_prerelease,
        TRUE,
        NOW()
    )
    RETURNING id INTO v_version_id;
    
    -- Update extension's last_synced_at
    UPDATE extensions
    SET last_synced_at = NOW(),
        updated_at = NOW()
    WHERE id = p_extension_id;
    
    RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION add_version_from_sync IS 'Add a new version from GitHub sync job. Idempotent - returns existing version if already exists.';

-- ============================================================================
-- START SYNC JOB
-- ============================================================================
-- Creates a sync log entry when starting a sync

CREATE OR REPLACE FUNCTION start_sync_job(p_extension_id UUID)
RETURNS UUID AS $$
DECLARE
    v_sync_id UUID;
BEGIN
    INSERT INTO extension_sync_log (extension_id, status)
    VALUES (p_extension_id, 'running')
    RETURNING id INTO v_sync_id;
    
    RETURN v_sync_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION start_sync_job IS 'Create a sync log entry when starting a sync job';

-- ============================================================================
-- COMPLETE SYNC JOB
-- ============================================================================
-- Updates sync log entry when sync completes (success or error)

CREATE OR REPLACE FUNCTION complete_sync_job(
    p_sync_id UUID,
    p_releases_checked INTEGER,
    p_versions_added INTEGER,
    p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE extension_sync_log
    SET completed_at = NOW(),
        releases_checked = p_releases_checked,
        versions_added = p_versions_added,
        status = CASE WHEN p_error_message IS NULL THEN 'success' ELSE 'error' END,
        error_message = p_error_message
    WHERE id = p_sync_id;
    
    -- Also update extension's last_synced_at if successful
    IF p_error_message IS NULL THEN
        UPDATE extensions
        SET last_synced_at = NOW()
        WHERE id = (SELECT extension_id FROM extension_sync_log WHERE id = p_sync_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION complete_sync_job IS 'Update sync log entry when job completes';

-- ============================================================================
-- GET EXTENSION BY NAME
-- ============================================================================
-- Lookup extension by full name (publisher.name) for deep link support

CREATE OR REPLACE FUNCTION get_extension_by_name(p_full_name TEXT)
RETURNS TABLE (
    id UUID,
    publisher_id UUID,
    publisher_slug TEXT,
    name TEXT,
    display_name TEXT,
    description TEXT,
    repository_url TEXT,
    github_owner TEXT,
    github_repo TEXT,
    icon_url TEXT,
    license TEXT,
    category TEXT,
    categories TEXT[],
    verified BOOLEAN,
    published BOOLEAN,
    download_count INTEGER,
    last_synced_at TIMESTAMPTZ
) AS $$
DECLARE
    v_parts TEXT[];
    v_publisher_slug TEXT;
    v_extension_name TEXT;
BEGIN
    -- Parse "publisher.name" format
    v_parts := string_to_array(p_full_name, '.');
    
    IF array_length(v_parts, 1) != 2 THEN
        RAISE EXCEPTION 'Invalid extension name format. Expected "publisher.name", got: %', p_full_name;
    END IF;
    
    v_publisher_slug := v_parts[1];
    v_extension_name := v_parts[2];
    
    RETURN QUERY
    SELECT 
        e.id,
        e.publisher_id,
        p.slug,
        e.name,
        e.display_name,
        e.description,
        e.repository_url,
        -- Parse github owner/repo from repository_url
        (regexp_match(e.repository_url, 'github\.com/([^/]+)'))[1],
        (regexp_match(e.repository_url, 'github\.com/[^/]+/([^/]+)'))[1],
        e.icon_url,
        e.license,
        e.category,
        e.categories,
        e.verified,
        e.published,
        e.download_count,
        e.last_synced_at
    FROM extensions e
    JOIN publishers p ON p.id = e.publisher_id
    WHERE p.slug = v_publisher_slug
      AND e.name = v_extension_name;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_extension_by_name IS 'Get extension by full name (publisher.name) for deep link support';

-- ============================================================================
-- GET EXTENSIONS NEEDING SYNC
-- ============================================================================
-- Returns extensions that haven't been synced recently (for hourly cron job)

CREATE OR REPLACE FUNCTION get_extensions_needing_sync(
    p_max_age_hours INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    publisher_slug TEXT,
    repository_url TEXT,
    github_owner TEXT,
    github_repo TEXT,
    last_synced_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.name,
        p.slug,
        e.repository_url,
        (regexp_match(e.repository_url, 'github\.com/([^/]+)'))[1],
        (regexp_match(e.repository_url, 'github\.com/[^/]+/([^/]+)'))[1],
        e.last_synced_at
    FROM extensions e
    JOIN publishers p ON p.id = e.publisher_id
    WHERE e.published = TRUE
      AND (e.last_synced_at IS NULL 
           OR e.last_synced_at < NOW() - (p_max_age_hours || ' hours')::interval)
    ORDER BY e.last_synced_at NULLS FIRST
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_extensions_needing_sync IS 'Get extensions that need to be synced with GitHub';

-- ============================================================================
-- SCHEMA VERSION 3
-- ============================================================================

INSERT INTO schema_version (version, description)
VALUES (3, 'GitHub Releases integration with hash verification')
ON CONFLICT (version) DO NOTHING;