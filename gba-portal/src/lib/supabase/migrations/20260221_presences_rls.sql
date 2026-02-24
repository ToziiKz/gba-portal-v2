-- Presences & Planning RLS Update (2026-02-21)
-- Restricting access to attendance sheets and planning sessions

-- 1. ATTENDANCE (New RLS)
-- Note: 'attendance' table definition is missing in recent migrations, assuming it exists based on app code.
-- If it doesn't exist, we must create it.
create table if not exists public.attendance (
  session_id uuid not null references public.planning_sessions(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status text not null check (status in ('present', 'late', 'absent', 'excused')),
  note text,
  updated_at timestamptz default now(),
  primary key (session_id, player_id)
);

alter table public.attendance enable row level security;

-- Drop previous policies if any
drop policy if exists "Attendance viewable by auth users" on public.attendance;
drop policy if exists "Attendance manageable by coaches" on public.attendance;

-- SELECT (Read)
-- Coach: Can read attendance for sessions of their teams
-- Dirigeant: Can read attendance for their teams
-- Resp: Can read global/pole
create policy "RBAC V1 attendance select"
  on public.attendance for select
  using (
    exists (
      select 1 from public.planning_sessions s
      where s.id = attendance.session_id
      and (
        public.has_permission(auth.uid(), 'presences', 'read', s.team_id, s.pole)
        or public.has_permission(auth.uid(), 'presences', 'write', s.team_id, s.pole)
      )
    )
  );

-- WRITE (Insert/Update/Delete)
-- Coach/Dirigeant: Can write attendance for their teams
create policy "RBAC V1 attendance write"
  on public.attendance for all
  using (
    exists (
      select 1 from public.planning_sessions s
      where s.id = attendance.session_id
      and public.has_permission(auth.uid(), 'presences', 'write', s.team_id, s.pole)
    )
  )
  with check (
    exists (
      select 1 from public.planning_sessions s
      where s.id = attendance.session_id
      and public.has_permission(auth.uid(), 'presences', 'write', s.team_id, s.pole)
    )
  );

-- 2. PLANNING SESSIONS (Refine existing RLS)
-- Ensure 'presences' module readers can also READ the planning sessions to display them
-- Current foundation only checked 'planning' module permissions.

drop policy if exists "RBAC V1 planning select" on public.planning_sessions;
create policy "RBAC V1 planning select"
  on public.planning_sessions
  for select
  using (
    public.has_permission(auth.uid(), 'planning', 'read', team_id, pole)
    or public.has_permission(auth.uid(), 'planning', 'write', team_id, pole)
    or public.has_permission(auth.uid(), 'presences', 'read', team_id, pole) -- Added for Presences view
    or public.has_permission(auth.uid(), 'presences', 'write', team_id, pole) -- Added for Presences view
  );

-- Write remains strict on 'planning' module
drop policy if exists "RBAC V1 planning write" on public.planning_sessions;
create policy "RBAC V1 planning write"
  on public.planning_sessions
  for all
  using (
    public.has_permission(auth.uid(), 'planning', 'write', team_id, pole)
    or public.has_permission(auth.uid(), 'planning', 'approve', team_id, pole)
  )
  with check (
    public.has_permission(auth.uid(), 'planning', 'write', team_id, pole)
    or public.has_permission(auth.uid(), 'planning', 'approve', team_id, pole)
  );
