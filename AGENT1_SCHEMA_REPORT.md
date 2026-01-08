# Agent 1: Database Schema Report

## Summary

Successfully implemented the `extension_submissions` table and supporting infrastructure for the maintainer dashboard workflow.

## Changes Made

### 1. New Table: `extension_submissions`

Added to `supabase-store/schema.sql`:

```sql
extension_submissions (
    id UUID PRIMARY KEY,
    
    -- Submitter info
    submitter_email TEXT NOT NULL,
    submitter_name TEXT,
    
    -- Extension metadata
    repository_url TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'sandboxed',
    
    -- Publisher association
    publisher_id UUID REFERENCES publishers(id),
    
    -- Review workflow
    status TEXT DEFAULT 'pending',  -- pending, approved, rejected, needs_changes
    reviewer_email TEXT,
    reviewer_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    
    -- Result
    extension_id UUID REFERENCES extensions(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### 2. Indexes

Created optimized indexes for dashboard queries:

| Index | Purpose |
|-------|---------|
| `idx_submissions_status` | Filter by status |
| `idx_submissions_created_at` | Sort by newest |
| `idx_submissions_submitter` | Find by submitter email |
| `idx_submissions_reviewer` | Find by reviewer email |
| `idx_submissions_pending` | Partial index for pending submissions |

### 3. Row Level Security Policies

| Policy | Access | Condition |
|--------|--------|-----------|
| "Anyone can submit extensions" | INSERT | Always allowed (rate-limited in API) |
| "Submitters can view own submissions" | SELECT | `submitter_email = auth.jwt() ->> 'email'` |
| "Admins can view all submissions" | SELECT | Email ends with `@bluerobotics.com` |
| "Admins can update submissions" | UPDATE | Email ends with `@bluerobotics.com` |

### 4. Helper Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `approve_submission(...)` | Atomically approve and create extension | Extension UUID |
| `reject_submission(...)` | Reject with required feedback | VOID |
| `request_changes_submission(...)` | Request changes with notes | VOID |
| `get_pending_submission_count()` | Dashboard badge count | BIGINT |
| `list_submissions(...)` | Paginated listing with filters | TABLE |

#### `approve_submission` Details

This function atomically:
1. Validates submission is in `pending` or `needs_changes` status
2. Creates a new publisher if needed (from submitter info)
3. Creates the extension record
4. Updates submission with `approved` status and links to new extension

#### `list_submissions` Details

Returns submissions with:
- Optional status filter
- Optional search (name, display_name, submitter_email)
- Pagination support
- Priority ordering: pending first, then needs_changes, then others

### 5. Schema Version

Bumped schema version to **2** with description:
> "Extension submissions workflow for marketplace approval"

## Files Modified

| File | Changes |
|------|---------|
| `supabase-store/schema.sql` | Added table, indexes, RLS policies, functions, version bump |
| `supabase-store/README.md` | Added documentation for submissions workflow and functions |

## Testing

The SQL is idempotent and can be verified by:

```bash
# Check syntax (requires psql)
psql -f supabase-store/schema.sql --echo-errors

# Or use Supabase SQL editor to validate
```

## Dependencies

- None. This is Phase 1 and can run independently.

## Next Steps for Other Agents

### Agent 2 (API)
- Use `list_submissions()` function for listing endpoint
- Use `approve_submission()`, `reject_submission()`, `request_changes_submission()` for action endpoints
- Use `get_pending_submission_count()` for dashboard badge

### Agent 3 (Auth)
- RLS policies check for `@bluerobotics.com` email domain
- JWT must include `email` claim for admin verification

### Agent 4 (Frontend)
- Status values: `pending`, `approved`, `rejected`, `needs_changes`
- Submissions ordered by status priority (pending first)

## Verification Checklist

- [x] Table created with all required columns
- [x] Proper CHECK constraints on status and category
- [x] Foreign keys to publishers and extensions tables
- [x] Indexes for status, date, and email queries
- [x] Partial index for pending submissions (optimized)
- [x] RLS enabled with public insert policy
- [x] RLS admin policies check @bluerobotics.com domain
- [x] `approve_submission` creates extension atomically
- [x] `reject_submission` requires feedback
- [x] `request_changes_submission` requires feedback
- [x] Schema version bumped to 2
- [x] README updated with documentation
