-- Planning + Attendance schema
-- Run in Supabase SQL editor.

create extension if not exists "uuid-ossp";

-- PLANNING SESSIONS
create table if not exists public.planning_sessions (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  day text not null check (day in ('Lun','Mar','Mer','Jeu','Ven','Sam','Dim')),
  pole text not null,
  start_time time not null,
  end_time time not null,
  location text not null,
  staff text[] not null default '{}',
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.planning_sessions enable row level security;

-- Basic RLS: anyone authenticated can read
create policy if not exists "Planning sessions are viewable by auth users"
  on public.planning_sessions for select
  using ( auth.role() = 'authenticated' );

-- Staff/Admin can manage all sessions
create policy if not exists "Staff/Admin manage planning sessions"
  on public.planning_sessions for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and role in ('admin','staff')
    )
  );

-- ATTENDANCE
create table if not exists public.attendance (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.planning_sessions(id) on delete cascade not null,
  player_id uuid references public.players(id) on delete cascade not null,
  status text not null check (status in ('present','late','absent','excused')),
  note text,
  updated_by uuid references public.profiles(id),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(session_id, player_id)
);

alter table public.attendance enable row level security;

create policy if not exists "Attendance is viewable by auth users"
  on public.attendance for select
  using ( auth.role() = 'authenticated' );

create policy if not exists "Staff/Admin manage attendance"
  on public.attendance for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and role in ('admin','staff')
    )
  );
