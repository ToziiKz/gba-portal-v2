-- Tactical Module RLS Update (2026-02-21)
-- Restricting access to team-specific scope using RBAC V1 `has_permission`

-- 1. MATCHES
alter table public.matches enable row level security;

-- Drop previous broad/legacy policies
drop policy if exists "Matches viewable by auth users" on public.matches;
drop policy if exists "Coaches can manage their own matches" on public.matches;
drop policy if exists "Matches viewable by team members" on public.matches;
drop policy if exists "Coaches can manage matches for their teams" on public.matches;

-- New strict policies using RBAC

-- SELECT: 
-- Module: 'tactique', Action: 'read' or 'write' (write usually implies read access needed for UI)
create policy "RBAC V1 matches select"
  on public.matches for select
  using (
    public.has_permission(auth.uid(), 'tactique', 'read', team_id, null)
    or public.has_permission(auth.uid(), 'tactique', 'write', team_id, null)
  );

-- INSERT/UPDATE/DELETE:
-- Module: 'tactique', Action: 'write'
create policy "RBAC V1 matches write"
  on public.matches for all
  using (
    public.has_permission(auth.uid(), 'tactique', 'write', team_id, null)
  )
  with check (
    public.has_permission(auth.uid(), 'tactique', 'write', team_id, null)
  );

-- 2. MATCH LINEUPS (Feuilles de match)
alter table public.match_lineups enable row level security;

drop policy if exists "Lineups viewable by auth users" on public.match_lineups;
drop policy if exists "Coaches can manage their lineups" on public.match_lineups;

-- Policies inherit from match access via match_id
-- Ideally we join matches to check permissions on the match's team_id
create policy "RBAC V1 lineups select"
  on public.match_lineups for select
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_lineups.match_id
      and (
        public.has_permission(auth.uid(), 'tactique', 'read', m.team_id, null)
        or public.has_permission(auth.uid(), 'tactique', 'write', m.team_id, null)
      )
    )
  );

create policy "RBAC V1 lineups write"
  on public.match_lineups for all
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_lineups.match_id
      and public.has_permission(auth.uid(), 'tactique', 'write', m.team_id, null)
    )
  )
  with check (
    exists (
      select 1 from public.matches m
      where m.id = match_lineups.match_id
      and public.has_permission(auth.uid(), 'tactique', 'write', m.team_id, null)
    )
  );
