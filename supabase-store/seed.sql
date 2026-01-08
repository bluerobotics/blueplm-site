-- ============================================================================
-- BluePLM Extension Store Seed Data
-- ============================================================================
-- Sample data for development and testing
-- Run after schema.sql
-- ============================================================================

-- ============================================================================
-- PUBLISHERS
-- ============================================================================

-- Blue Robotics (verified publisher)
INSERT INTO publishers (id, name, slug, description, website_url, logo_url, verified, verified_at, owner_email, support_email, support_url)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Blue Robotics',
    'blueplm',
    'Official extensions from the BluePLM team. High-quality, verified integrations for enterprise PLM.',
    'https://bluerobotics.com',
    'https://bluerobotics.com/logo.png',
    TRUE,
    NOW(),
    'extensions@bluerobotics.com',
    'support@bluerobotics.com',
    'https://docs.blueplm.io'
);

-- Community publisher: Acme Corp
INSERT INTO publishers (id, name, slug, description, website_url, logo_url, verified, owner_email)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Acme Corporation',
    'acme',
    'Industrial automation and ERP integrations for manufacturing.',
    'https://acme-corp.example.com',
    'https://acme-corp.example.com/logo.png',
    FALSE,
    'dev@acme-corp.example.com'
);

-- Community publisher: OpenPLM Community
INSERT INTO publishers (id, name, slug, description, website_url, verified, owner_email)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'OpenPLM Community',
    'openplm',
    'Open source extensions built by the community.',
    'https://github.com/openplm',
    FALSE,
    'community@openplm.example.org'
);

-- ============================================================================
-- SIGNING KEYS
-- ============================================================================

-- Blue Robotics official signing key
INSERT INTO signing_keys (id, public_key, algorithm, publisher_id, active, valid_from)
VALUES (
    'bluerobotics-2024',
    'MCowBQYDK2VwAyEAexamplePublicKeyBase64EncodedHere1234567890abc=',
    'ed25519',
    '00000000-0000-0000-0000-000000000001',
    TRUE,
    '2024-01-01 00:00:00+00'
);

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Google Drive (Verified, Featured)
INSERT INTO extensions (id, publisher_id, name, display_name, description, long_description, icon_url, repository_url, license, category, categories, tags, verified, verified_at, featured, featured_at, download_count, install_count)
VALUES (
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'google-drive',
    'Google Drive',
    'Sync your vault files with Google Drive for backup and collaboration.',
    E'# Google Drive Integration\n\nAutomatically sync your vault files to Google Drive.\n\n## Features\n\n- **Automatic sync**: Changes are synced in real-time\n- **Selective sync**: Choose which folders to sync\n- **Version history**: Access previous versions from Google Drive\n- **Team drives**: Support for shared drives\n\n## Setup\n\n1. Click "Connect" in extension settings\n2. Sign in with your Google account\n3. Select a destination folder\n4. Enable sync for your vaults',
    'https://storage.blueplm.io/icons/google-drive.png',
    'https://github.com/bluerobotics/blueplm',
    'MIT',
    'sandboxed',
    ARRAY['sync', 'backup', 'cloud'],
    ARRAY['google', 'drive', 'cloud', 'sync', 'backup'],
    TRUE,
    NOW(),
    TRUE,
    NOW(),
    1523,
    892
);

-- Odoo ERP (Verified, Featured)
INSERT INTO extensions (id, publisher_id, name, display_name, description, long_description, icon_url, repository_url, license, category, categories, tags, verified, verified_at, featured, featured_at, download_count, install_count)
VALUES (
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'odoo-erp',
    'Odoo ERP',
    'Two-way sync with Odoo ERP for products, BOMs, and inventory.',
    E'# Odoo ERP Integration\n\nConnect BluePLM to your Odoo instance for seamless ERP integration.\n\n## Features\n\n- **Product sync**: Sync parts as Odoo products\n- **BOM sync**: Export BOMs to Odoo manufacturing\n- **Inventory**: Real-time stock levels\n- **Pricing**: Sync costs and prices\n\n## Requirements\n\n- Odoo 14.0 or later\n- API access enabled',
    'https://storage.blueplm.io/icons/odoo.png',
    'https://github.com/bluerobotics/blueplm',
    'MIT',
    'sandboxed',
    ARRAY['erp', 'sync', 'manufacturing'],
    ARRAY['odoo', 'erp', 'manufacturing', 'bom', 'inventory'],
    TRUE,
    NOW(),
    TRUE,
    NOW(),
    987,
    654
);

-- SolidWorks (Native, Verified)
INSERT INTO extensions (id, publisher_id, name, display_name, description, long_description, icon_url, repository_url, license, category, categories, tags, verified, verified_at, download_count, install_count)
VALUES (
    '00000000-0000-0000-0001-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'solidworks',
    'SolidWorks',
    'Deep integration with SolidWorks for CAD file management and preview.',
    E'# SolidWorks Integration\n\nNative integration with SOLIDWORKS for CAD file management.\n\n## Features\n\n- **File preview**: View SolidWorks files without opening SW\n- **Property extraction**: Auto-extract custom properties\n- **BOM extraction**: Generate BOMs from assemblies\n- **Check-in/out**: Vault integration from SolidWorks\n\n## Requirements\n\n- SOLIDWORKS 2020 or later\n- Windows 10/11\n- BluePLM SolidWorks Add-in installed',
    'https://storage.blueplm.io/icons/solidworks.png',
    'https://github.com/bluerobotics/blueplm',
    'MIT',
    'native',
    ARRAY['cad', 'preview', 'properties'],
    ARRAY['solidworks', 'cad', '3d', 'modeling', 'engineering'],
    TRUE,
    NOW(),
    2341,
    1876
);

-- WooCommerce (Verified)
INSERT INTO extensions (id, publisher_id, name, display_name, description, icon_url, repository_url, license, category, categories, tags, verified, verified_at, download_count, install_count)
VALUES (
    '00000000-0000-0000-0001-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'woocommerce',
    'WooCommerce',
    'Sync products with your WooCommerce store for e-commerce.',
    'https://storage.blueplm.io/icons/woocommerce.png',
    'https://github.com/bluerobotics/blueplm',
    'MIT',
    'sandboxed',
    ARRAY['ecommerce', 'sync'],
    ARRAY['woocommerce', 'wordpress', 'ecommerce', 'shop', 'products'],
    TRUE,
    NOW(),
    456,
    312
);

-- Community: SAP Connector (Not verified)
INSERT INTO extensions (id, publisher_id, name, display_name, description, icon_url, repository_url, license, category, categories, tags, download_count, install_count)
VALUES (
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'sap-connector',
    'SAP Business One Connector',
    'Connect BluePLM to SAP Business One for ERP integration.',
    'https://acme-corp.example.com/icons/sap.png',
    'https://github.com/acme-corp/blueplm-sap',
    'Apache-2.0',
    'sandboxed',
    ARRAY['erp', 'sync'],
    ARRAY['sap', 'erp', 'business-one', 'enterprise'],
    234,
    156
);

-- Community: Slack Notifications (Not verified)
INSERT INTO extensions (id, publisher_id, name, display_name, description, icon_url, repository_url, license, category, categories, tags, download_count, install_count)
VALUES (
    '00000000-0000-0000-0003-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'slack-notifications',
    'Slack Notifications',
    'Get notified in Slack when files are checked in or approvals are needed.',
    'https://storage.blueplm.io/community/slack.png',
    'https://github.com/openplm/blueplm-slack',
    'MIT',
    'sandboxed',
    ARRAY['notifications', 'collaboration'],
    ARRAY['slack', 'notifications', 'chat', 'alerts'],
    567,
    423
);

-- Community: Jira Integration (Not verified)
INSERT INTO extensions (id, publisher_id, name, display_name, description, icon_url, repository_url, license, category, categories, tags, download_count, install_count)
VALUES (
    '00000000-0000-0000-0003-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'jira',
    'Jira',
    'Link PLM items to Jira issues for project tracking.',
    'https://storage.blueplm.io/community/jira.png',
    'https://github.com/openplm/blueplm-jira',
    'MIT',
    'sandboxed',
    ARRAY['project-management', 'tracking'],
    ARRAY['jira', 'atlassian', 'issues', 'tracking', 'agile'],
    345,
    234
);

-- ============================================================================
-- EXTENSION VERSIONS
-- ============================================================================

-- Google Drive versions
INSERT INTO extension_versions (id, extension_id, version, changelog, bundle_url, bundle_hash, bundle_size, min_app_version, manifest, signature, signing_key_id)
VALUES 
(
    '00000000-0000-0001-0001-000000000001',
    '00000000-0000-0000-0001-000000000001',
    '1.0.0',
    E'## 1.0.0\n\n- Initial release\n- Basic sync functionality\n- OAuth authentication',
    'https://storage.blueplm.io/extensions/blueplm.google-drive/1.0.0/bundle.bpx',
    'sha256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    245760,
    '1.0.0',
    '{"id": "blueplm.google-drive", "version": "1.0.0", "permissions": {"server": ["secrets:read", "secrets:write", "http:domain:googleapis.com"]}}',
    'sig:exampleSignatureBase64Here==',
    'bluerobotics-2024'
),
(
    '00000000-0000-0001-0001-000000000002',
    '00000000-0000-0000-0001-000000000001',
    '1.1.0',
    E'## 1.1.0\n\n- Added selective sync\n- Improved error handling\n- Bug fixes',
    'https://storage.blueplm.io/extensions/blueplm.google-drive/1.1.0/bundle.bpx',
    'sha256:b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1',
    251904,
    '1.0.0',
    '{"id": "blueplm.google-drive", "version": "1.1.0", "permissions": {"server": ["secrets:read", "secrets:write", "http:domain:googleapis.com"]}}',
    'sig:exampleSignatureBase64Here2==',
    'bluerobotics-2024'
),
(
    '00000000-0000-0001-0001-000000000003',
    '00000000-0000-0000-0001-000000000001',
    '1.2.0',
    E'## 1.2.0\n\n- Team Drive support\n- Version history access\n- Performance improvements',
    'https://storage.blueplm.io/extensions/blueplm.google-drive/1.2.0/bundle.bpx',
    'sha256:c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2',
    262144,
    '1.1.0',
    '{"id": "blueplm.google-drive", "version": "1.2.0", "permissions": {"server": ["secrets:read", "secrets:write", "http:domain:googleapis.com"]}}',
    'sig:exampleSignatureBase64Here3==',
    'bluerobotics-2024'
);

-- Odoo ERP versions
INSERT INTO extension_versions (id, extension_id, version, changelog, bundle_url, bundle_hash, bundle_size, min_app_version, manifest, signature, signing_key_id)
VALUES 
(
    '00000000-0000-0001-0002-000000000001',
    '00000000-0000-0000-0001-000000000002',
    '1.0.0',
    E'## 1.0.0\n\n- Initial release\n- Product sync\n- BOM export',
    'https://storage.blueplm.io/extensions/blueplm.odoo-erp/1.0.0/bundle.bpx',
    'sha256:d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3',
    327680,
    '1.0.0',
    '{"id": "blueplm.odoo-erp", "version": "1.0.0"}',
    'sig:odooSig1==',
    'bluerobotics-2024'
),
(
    '00000000-0000-0001-0002-000000000002',
    '00000000-0000-0000-0001-000000000002',
    '2.0.0',
    E'## 2.0.0 (Breaking)\n\n- New API structure\n- Inventory sync\n- Multi-company support\n\n### Migration\n\nRe-authenticate after update.',
    'https://storage.blueplm.io/extensions/blueplm.odoo-erp/2.0.0/bundle.bpx',
    'sha256:e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4',
    389120,
    '1.2.0',
    '{"id": "blueplm.odoo-erp", "version": "2.0.0"}',
    'sig:odooSig2==',
    'bluerobotics-2024'
);

-- SolidWorks versions
INSERT INTO extension_versions (id, extension_id, version, changelog, bundle_url, bundle_hash, bundle_size, min_app_version, manifest, signature, signing_key_id)
VALUES 
(
    '00000000-0000-0001-0003-000000000001',
    '00000000-0000-0000-0001-000000000003',
    '1.0.0',
    E'## 1.0.0\n\n- Initial release\n- File preview\n- Property extraction',
    'https://storage.blueplm.io/extensions/blueplm.solidworks/1.0.0/bundle.bpx',
    'sha256:f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5',
    524288,
    '1.0.0',
    '{"id": "blueplm.solidworks", "version": "1.0.0", "category": "native", "native": {"platforms": ["win32"]}}',
    'sig:swSig1==',
    'bluerobotics-2024'
);

-- Slack versions (community, no signature)
INSERT INTO extension_versions (id, extension_id, version, changelog, bundle_url, bundle_hash, bundle_size, min_app_version, manifest)
VALUES 
(
    '00000000-0000-0001-0005-000000000001',
    '00000000-0000-0000-0003-000000000001',
    '0.5.0',
    E'## 0.5.0 (Beta)\n\n- Check-in notifications\n- Approval requests\n- Direct messages',
    'https://github.com/openplm/blueplm-slack/releases/download/v0.5.0/bundle.bpx',
    'sha256:g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6',
    163840,
    '1.0.0',
    '{"id": "openplm.slack-notifications", "version": "0.5.0"}'
);

-- ============================================================================
-- SAMPLE REVIEWS
-- ============================================================================

INSERT INTO extension_reviews (extension_id, user_id, user_email, user_name, rating, title, body)
VALUES 
(
    '00000000-0000-0000-0001-000000000001',
    '00000000-1111-0000-0000-000000000001',
    'john@example.com',
    'John Smith',
    5,
    'Essential for our workflow',
    'We use this daily to sync our engineering files. Works flawlessly with shared drives.'
),
(
    '00000000-0000-0000-0001-000000000001',
    '00000000-1111-0000-0000-000000000002',
    'sarah@example.com',
    'Sarah Johnson',
    4,
    'Great extension, minor issues',
    'Love the automatic sync. Sometimes takes a few seconds to update, but overall excellent.'
),
(
    '00000000-0000-0000-0001-000000000003',
    '00000000-1111-0000-0000-000000000003',
    'mike@manufacturing.com',
    'Mike Chen',
    5,
    'Game changer for SolidWorks users',
    'Finally a PLM that integrates properly with SolidWorks. BOM extraction saves us hours every week.'
);

-- ============================================================================
-- SAMPLE DEPRECATION (for testing)
-- ============================================================================

-- Note: Not adding any active deprecations, but here's the pattern:
-- INSERT INTO extension_deprecations (extension_id, reason, replacement_id, sunset_date, deprecated_by)
-- VALUES (...);

-- ============================================================================
-- SAMPLE INSTALL ANALYTICS
-- ============================================================================

-- Simulate some installs for analytics
INSERT INTO extension_installs (extension_id, version, app_version, platform, arch, org_hash, install_type)
SELECT 
    '00000000-0000-0000-0001-000000000001',
    '1.2.0',
    '1.2.3',
    (ARRAY['win32', 'darwin', 'linux'])[floor(random() * 3 + 1)],
    (ARRAY['x64', 'arm64'])[floor(random() * 2 + 1)],
    md5(random()::text),
    'store'
FROM generate_series(1, 50);

INSERT INTO extension_installs (extension_id, version, app_version, platform, arch, org_hash, install_type)
SELECT 
    '00000000-0000-0000-0001-000000000003',
    '1.0.0',
    '1.2.3',
    'win32',  -- SolidWorks is Windows only
    'x64',
    md5(random()::text),
    'store'
FROM generate_series(1, 100);

-- ============================================================================
-- VERIFY DATA
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Seed data loaded:';
    RAISE NOTICE '  Publishers: %', (SELECT COUNT(*) FROM publishers);
    RAISE NOTICE '  Extensions: %', (SELECT COUNT(*) FROM extensions);
    RAISE NOTICE '  Versions: %', (SELECT COUNT(*) FROM extension_versions);
    RAISE NOTICE '  Reviews: %', (SELECT COUNT(*) FROM extension_reviews);
    RAISE NOTICE '  Installs: %', (SELECT COUNT(*) FROM extension_installs);
    RAISE NOTICE '  Signing Keys: %', (SELECT COUNT(*) FROM signing_keys);
END $$;
