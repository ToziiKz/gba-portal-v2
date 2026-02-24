-- Coach permissions for Planning + Attendance
-- Run in Supabase SQL Editor.

-- PLANNING: allow coaches to manage sessions for their teams
-- (team coach is stored on public.teams.coach_id)

drop policy if exists "Coach manage planning sessions (own teams)" on public.planning_sessions;
create policy "Coach manage planning sessions (own teams)"
  on public.planning_sessions
  for all
  using (
    exists (
      select 1
      from public.profiles
      join public.teams on teams.coach_id = profiles.id
      where profiles.id = auth.uid()
        and profiles.role = 'coach'
        and teams.id = planning_sessions.team_id
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      join public.teams on teams.coach_id = profiles.id
      where profiles.id = auth.uid()
        and profiles.role = 'coach'
        and teams.id = planning_sessions.team_id
    )
  );

-- ATTENDANCE: allow coaches to manage attendance for sessions of their teams

drop policy if exists "Coach manage attendance (own teams)" on public.attendance;
create policy "Coach manage attendance (own teams)"
  on public.attendance
  for all
  using (
    exists (
      select 1
      from public.profiles
      join public.teams on teams.coach_id = profiles.id
      join public.planning_sessions ps on ps.team_id = teams.id
      where profiles.id = auth.uid()
        and profiles.role = 'coach'
        and ps.id = attendance.session_id
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      join public.teams on teams.coach_id = profiles.id
      join public.planning_sessions ps on ps.team_id = teams.id
      where profiles.id = auth.uid()
        and profiles.role = 'coach'
        and ps.id = attendance.session_id
    )
  );
