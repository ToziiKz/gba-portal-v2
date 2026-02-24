-- Team staff many-to-many model
-- Supports: multiple coaches/assistants per team, and multi-team assignments per profile.

create table if not exists public.team_staff (
  team_id uuid not null references public.teams(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_in_team text not null default 'coach'
    check (role_in_team in ('head_coach', 'assistant_coach', 'adjoint', 'coach', 'staff')),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid null references public.profiles(id) on delete set null,
  primary key (team_id, profile_id)
);

create index if not exists idx_team_staff_profile on public.team_staff(profile_id);
create index if not exists idx_team_staff_team on public.team_staff(team_id);

-- Ensure only one primary assignment per team
create unique index if not exists uq_team_staff_one_primary_per_team
  on public.team_staff(team_id)
  where is_primary = true;

alter table public.team_staff enable row level security;

drop policy if exists "team_staff select auth" on public.team_staff;
create policy "team_staff select auth"
  on public.team_staff
  for select
  to authenticated
  using (true);

drop policy if exists "team_staff write admin" on public.team_staff;
create policy "team_staff write admin"
  on public.team_staff
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and coalesce(p.is_active, true) = true
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and coalesce(p.is_active, true) = true
    )
  );

-- Backfill from legacy teams.coach_id when present.
insert into public.team_staff (team_id, profile_id, role_in_team, is_primary)
select t.id, t.coach_id, 'head_coach', true
from public.teams t
where t.coach_id is not null
on conflict (team_id, profile_id) do update
set role_in_team = excluded.role_in_team,
    is_primary = excluded.is_primary;
