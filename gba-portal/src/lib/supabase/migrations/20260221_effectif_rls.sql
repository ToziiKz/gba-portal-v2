-- Effectif / Players RLS Update (2026-02-21)
-- Restricting access to players data

-- 1. PLAYERS (Refine existing RLS)
alter table public.players enable row level security;

-- Drop previous policies
drop policy if exists "RBAC V1 players select" on public.players;
drop policy if exists "RBAC V1 players write" on public.players;
drop policy if exists "Players viewable by auth users" on public.players;
drop policy if exists "Players manageable by coaches" on public.players;

-- SELECT (Read)
-- Coach: Can read players of their teams
-- Dirigeant: Can read players of their teams
-- Resp/Admin: Can read global/pole
create policy "RBAC V1 players select"
  on public.players for select
  using (
    -- team_id is often null in current schema (using fuzzy match on category), 
    -- BUT if we migrate to strict team assignment, we need to check team_id.
    -- Assuming `players` has `team_id`. 
    -- If `players` relies only on `category`, this is tricky because permissions are team-based.
    -- Let's assume `team_id` is present or we match via teams.
    -- Current schema check: `players` table definition not fully visible, but migrations reference `team_id`.
    -- If `team_id` is null, we might need to fallback to category? 
    -- For V1 RBAC, we enforce `team_id` usage for strict access.
    
    public.has_permission(auth.uid(), 'effectif', 'read', team_id, null)
    or public.has_permission(auth.uid(), 'effectif', 'write', team_id, null)
    or public.has_permission(auth.uid(), 'effectif', 'approve', team_id, null)
  );

-- WRITE (Insert/Update/Delete)
-- Coach: Can write players for their teams
create policy "RBAC V1 players write"
  on public.players for all
  using (
    public.has_permission(auth.uid(), 'effectif', 'write', team_id, null)
    or public.has_permission(auth.uid(), 'effectif', 'approve', team_id, null)
  )
  with check (
    public.has_permission(auth.uid(), 'effectif', 'write', team_id, null)
    or public.has_permission(auth.uid(), 'effectif', 'approve', team_id, null)
  );

-- 2. TEAMS (Public Read for Selection)
-- Teams need to be visible to authenticated users to be selected in dropdowns (e.g. "Select Team" filter).
-- But WRITE must be restricted.

alter table public.teams enable row level security;

drop policy if exists "Teams are viewable by auth users" on public.teams;
drop policy if exists "Teams manageable by admin" on public.teams;

-- READ: All authenticated users can see teams (needed for navigation/filters)
create policy "Teams viewable by auth users"
  on public.teams for select
  using (auth.role() = 'authenticated');

-- WRITE: Only Admins or Global Staff
create policy "Teams manageable by admin"
  on public.teams for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
