-- Option A: New Supabase project bootstrap (ultra-clean minimal schema)
-- Run this in the NEW project SQL Editor.

create extension if not exists pgcrypto;

-- ===== Enums =====
do $$ begin
  create type public.app_role as enum ('admin','coach');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.team_gender as enum ('M','F','Mixte');
exception when duplicate_object then null; end $$;

-- ===== Tables =====
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  gender public.team_gender not null default 'Mixte',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.app_role not null default 'coach',
  coach_team_label text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.players (
  id bigint generated always as identity primary key,
  firstname text not null,
  lastname text not null,
  team_id uuid references public.teams(id) on delete set null,
  gender public.team_gender,
  category text,
  license_number text unique,
  mobile_phone text,
  email text,
  created_at timestamptz not null default now()
);

create index if not exists idx_players_team_id on public.players(team_id);
create index if not exists idx_players_lastname on public.players(lastname);

-- ===== RLS =====
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;

-- profiles: user can read self

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read"
on public.profiles for select to authenticated
using (id = auth.uid());

-- profiles: admin can read all

drop policy if exists "profiles admin read all" on public.profiles;
create policy "profiles admin read all"
on public.profiles for select to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
);

-- teams / players: all authenticated can read

drop policy if exists "teams auth read" on public.teams;
create policy "teams auth read"
on public.teams for select to authenticated
using (true);

drop policy if exists "players auth read" on public.players;
create policy "players auth read"
on public.players for select to authenticated
using (true);

-- teams / players write: admin only

drop policy if exists "teams admin write" on public.teams;
create policy "teams admin write"
on public.teams for all to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.is_active = true
  )
);

drop policy if exists "players admin write" on public.players;
create policy "players admin write"
on public.players for all to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.is_active = true
  )
);

-- ===== Helper: updated_at =====
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ===== Seed profiles (IMPORTANT: replace UUIDs with auth.users ids) =====
-- insert into public.profiles (id, email, full_name, role, coach_team_label)
-- values
--   ('UUID_YOANN', 'yoann.67130@hotmail.fr', 'Yoann Lefefevre', 'admin', null),
--   ('UUID_NATHAN', 'samuelangenieux@gmail.com', 'Nathan Savin', 'coach', 'U11 D1')
-- on conflict (id) do update
-- set email = excluded.email,
--     full_name = excluded.full_name,
--     role = excluded.role,
--     coach_team_label = excluded.coach_team_label,
--     is_active = true;
