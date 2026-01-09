# Agent B: Frontend Version Selector and Refresh - Completion Report

## Summary

Completed all frontend features for version selection, changelog display, and auto-refresh functionality.

## Changes Made

### 1. API Functions (`src/lib/api.ts`)

Added `syncExtension()` function to trigger GitHub sync for an extension:

```typescript
export async function syncExtension(extensionName: string): Promise<{
  updated: boolean;
  latestVersion: string;
  newVersions: string[];
}>
```

Note: `fetchExtensionVersions()` already existed.

### 2. New Component: `VersionSelector` (`src/components/marketplace/VersionSelector.tsx`)

Created a reusable version selector dropdown with:
- Version dropdown showing all versions with dates
- "Latest" badge on newest version
- "Pre-release" badge on pre-release versions
- Check mark on currently selected version
- "Check for updates" refresh button with loading spinner
- Responsive design (button text hidden on mobile)

### 3. Extension Detail Page (`src/pages/marketplace/Extension.tsx`)

Added:
- State management for `selectedVersion`, `isRefreshing`, and `refreshMessage`
- `handleRefresh()` callback that syncs with GitHub and reloads versions
- Version selector below badges in header
- Toast message showing sync results
- Changelog section that displays when a version has changelog content
- Updated InstallButton props to use `extensionName` for deep links

### 4. InstallButton Component (`src/components/marketplace/InstallButton.tsx`)

Completely updated with:
- **New props**: `extensionName` (e.g., "blueplm.google-drive") and `displayName`
- **Fixed deep link format**: `blueplm://install/{extensionName}?version={version}`
- **Auto-refresh before install**: Calls `syncExtension()` before opening deep link
- **Loading state**: Shows "Checking..." with spinner during sync
- **Update notification**: Shows toast if new versions are found

## Deep Link Format

Before:
```
blueplm://install/{uuid}
```

After:
```
blueplm://install/{extensionName}?version={version}
```

Example:
```
blueplm://install/blueplm.google-drive?version=0.1.0
```

## UI/UX Features

1. **Version Dropdown**
   - Shows all versions sorted by date (newest first)
   - Formatted as: "v1.2.0" with date below
   - Pre-release versions clearly marked with amber badge

2. **Check for Updates**
   - Button with refresh icon
   - Shows spinner while syncing
   - Success/error toast appears for 5 seconds

3. **Changelog Display**
   - Shows changelog for selected version
   - Appears below the About section
   - Pre-release versions marked with badge in heading

4. **Install Flow**
   - Button shows "Checking..." while syncing
   - If new versions found, shows notification toast
   - Proceeds with install regardless of sync result

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/api.ts` | Added `syncExtension()` function |
| `src/components/marketplace/VersionSelector.tsx` | New component |
| `src/components/marketplace/InstallButton.tsx` | Major rewrite with new props and auto-refresh |
| `src/pages/marketplace/Extension.tsx` | Added version state, selector, changelog, updated InstallButton usage |

## Testing Checklist

- [ ] Version dropdown shows all versions for an extension
- [ ] Selecting a version updates the changelog display
- [ ] "Check for updates" button triggers sync and shows result
- [ ] Pre-release versions display with amber badge
- [ ] Latest version shows "Latest" badge
- [ ] Install button shows "Checking..." then opens deep link
- [ ] Deep link contains extension name and version
- [ ] Update notification appears if new versions found during install

## Notes

- The sync endpoint (`POST /store/extensions/{name}/sync`) must be implemented in the API for refresh functionality to work
- All error handling is graceful - failures don't block the install flow
- Pre-release versions are included in the version list (enabled by passing `true` to `fetchExtensionVersions`)
