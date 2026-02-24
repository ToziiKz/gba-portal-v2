-- ==========================================
-- 4) CATEGORIES
-- ==========================================
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  pole text not null,
  age_range_label text,
  teams_label text,
  teams_count integer default 0,
  players_estimate integer default 0,
  lead_staff jsonb default '[]'::jsonb,
  notes text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.categories enable row level security;

drop policy if exists categories_select_auth on public.categories;
create policy categories_select_auth on public.categories
for select using (auth.role() = 'authenticated');

drop policy if exists categories_write_staff_admin on public.categories;
create policy categories_write_staff_admin on public.categories
for all using (public.is_role_allowed(array['admin','staff']))
with check (public.is_role_allowed(array['admin','staff']));

drop trigger if exists on_categories_updated on public.categories;
create trigger on_categories_updated
before update on public.categories
for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 5) COMPETITIONS
-- ==========================================
create table if not exists public.competitions (
  id uuid default uuid_generate_v4() primary key,
  category text not null,
  team_home text not null,
  team_away text not null,
  score_home integer default 0,
  score_away integer default 0,
  match_date date default now(),
  status text default 'approved', -- 'approved', 'pending'
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.competitions enable row level security;

drop policy if exists competitions_select_auth on public.competitions;
create policy competitions_select_auth on public.competitions
for select using (auth.role() = 'authenticated');

drop policy if exists competitions_write_staff_admin on public.competitions;
create policy competitions_write_staff_admin on public.competitions
for all using (public.is_role_allowed(array['admin','staff']))
with check (public.is_role_allowed(array['admin','staff']));

drop trigger if exists on_competitions_updated on public.competitions;
create trigger on_competitions_updated
before update on public.competitions
for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 6) RELANCES
-- ==========================================
create table if not exists public.relances (
  id uuid default uuid_generate_v4() primary key,
  kind text not null, -- 'licence' or 'equipment'
  pole text,
  category text,
  team text,
  player_name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  channel_hint text default 'email',
  last_action_label text,
  amount_due_eur numeric(10,2),
  due_date date,
  equipment_todo_label text,
  note text,
  status text default 'pending', -- pending, done, etc.
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.relances enable row level security;

drop policy if exists relances_select_auth on public.relances;
create policy relances_select_auth on public.relances
for select using (auth.role() = 'authenticated');

drop policy if exists relances_write_staff_admin on public.relances;
create policy relances_write_staff_admin on public.relances
for all using (public.is_role_allowed(array['admin','staff']))
with check (public.is_role_allowed(array['admin','staff']));

drop trigger if exists on_relances_updated on public.relances;
create trigger on_relances_updated
before update on public.relances
for each row execute procedure public.handle_updated_at();
