# RLS Policy Checklist (Tactique Module)

Target: `matches` table (Tactique)

## Required Policies

- [x] SELECT: Authenticated users can view matches they are part of (coach/player).
- [x] INSERT: Coaches can create matches for their teams.
- [x] UPDATE: Coaches can update match details.
- [x] DELETE: Coaches can delete matches.

## Implementation Steps

1. [x] Create migration file: `src/lib/supabase/migrations/20260221_tactique_rls.sql`
2. [x] Enable RLS on `matches`.
3. [x] Add policies using `auth.uid()` and team membership checks.
4. [x] Verify with `scripts/verify-rls.ts` (if exists) or manual test.

## Notes

- Avoid "God Function" validation in RLS.
- Use helper functions for team membership if possible.
