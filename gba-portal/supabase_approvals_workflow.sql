-- Approvals workflow (admin must approve all writes)
-- Run in Supabase SQL Editor.

create extension if not exists "uuid-ossp";

-- 1) Approval requests table
create table if not exists public.approval_requests (
  id uuid default uuid_generate_v4() primary key,

  -- who asked
  requested_by uuid references public.profiles(id) on delete cascade not null,

  -- what
  action text not null,
  entity text not null,
  payload jsonb not null,

  -- status
  status text not null check (status in ('pending','approved','rejected')) default 'pending',

  -- decision
  decided_by uuid references public.profiles(id),
  decided_at timestamp with time zone,
  decision_note text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists approval_requests_status_idx on public.approval_requests(status);
create index if not exists approval_requests_entity_idx on public.approval_requests(entity);
create index if not exists approval_requests_requested_by_idx on public.approval_requests(requested_by);

alter table public.approval_requests enable row level security;

-- Anyone authenticated can create a request
drop policy if exists "Auth can create approval requests" on public.approval_requests;
create policy "Auth can create approval requests"
  on public.approval_requests for insert
  with check (auth.role() = 'authenticated');

-- Requesters can see their own requests
drop policy if exists "Requesters can read own approval requests" on public.approval_requests;
create policy "Requesters can read own approval requests"
  on public.approval_requests for select
  using (requested_by = auth.uid());

-- Admin can read/manage all requests
drop policy if exists "Admin can manage approval requests" on public.approval_requests;
create policy "Admin can manage approval requests"
  on public.approval_requests for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 2) IMPORTANT: enforce "admin-only writes" on core tables
-- (coaches/staff create requests, admin applies changes)

-- TEAMS
alter table public.teams enable row level security;
drop policy if exists "Teams are viewable by auth users" on public.teams;
create policy "Teams are viewable by auth users"
  on public.teams for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin manages teams" on public.teams;
create policy "Admin manages teams"
  on public.teams for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- PLAYERS
alter table public.players enable row level security;
drop policy if exists "Players are viewable by auth users" on public.players;
create policy "Players are viewable by auth users"
  on public.players for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin manages players" on public.players;
create policy "Admin manages players"
  on public.players for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- PLANNING SESSIONS
alter table public.planning_sessions enable row level security;
drop policy if exists "Planning sessions are viewable by auth users" on public.planning_sessions;
create policy "Planning sessions are viewable by auth users"
  on public.planning_sessions for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin manages planning sessions" on public.planning_sessions;
create policy "Admin manages planning sessions"
  on public.planning_sessions for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ATTENDANCE
alter table public.attendance enable row level security;
drop policy if exists "Attendance is viewable by auth users" on public.attendance;
create policy "Attendance is viewable by auth users"
  on public.attendance for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin manages attendance" on public.attendance;
create policy "Admin manages attendance"
  on public.attendance for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
