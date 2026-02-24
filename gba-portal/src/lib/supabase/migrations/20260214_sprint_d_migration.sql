create extension if not exists "uuid-ossp";

-- ==========================================
-- Helpers
-- ==========================================
create or replace function public.is_role_allowed(_roles text[])
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active is distinct from false
      and p.role = any(_roles)
  );
$$;

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ==========================================
-- 1) STOCK
-- ==========================================
create table if not exists public.stock_items (
  id uuid default uuid_generate_v4() primary key,
  label text not null,
  kind text not null,
  pole text not null,
  location text not null,
  size_label text,
  sku text,
  qty integer not null default 0,
  min_qty integer not null default 0,
  note text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.stock_movements (
  id uuid default uuid_generate_v4() primary key,
  stock_item_id uuid not null references public.stock_items(id) on delete cascade,
  change_amount integer not null,
  reason text,
  performed_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.stock_items enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists stock_items_select_auth on public.stock_items;
create policy stock_items_select_auth on public.stock_items
for select using (auth.role() = 'authenticated');

drop policy if exists stock_items_write_staff_admin on public.stock_items;
create policy stock_items_write_staff_admin on public.stock_items
for all using (public.is_role_allowed(array['admin','staff']))
with check (public.is_role_allowed(array['admin','staff']));

drop policy if exists stock_movements_select_auth on public.stock_movements;
create policy stock_movements_select_auth on public.stock_movements
for select using (auth.role() = 'authenticated');

drop policy if exists stock_movements_write_staff_admin on public.stock_movements;
create policy stock_movements_write_staff_admin on public.stock_movements
for all using (public.is_role_allowed(array['admin','staff']))
with check (public.is_role_allowed(array['admin','staff']));

drop trigger if exists on_stock_updated on public.stock_items;
create trigger on_stock_updated
before update on public.stock_items
for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 2) LICENCES
-- ==========================================
create table if not exists public.licences (
  id uuid default uuid_generate_v4() primary key,
  player_name text not null,
  team text,
  category text,
  pole text,
  status text not null default 'unpaid',
  amount_total_eur numeric(10,2) not null default 0,
  amount_paid_eur numeric(10,2) not null default 0,
  due_date date,
  contact_name text,
  contact_email text,
  contact_phone text,
  last_payment_method text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.licence_payments (
  id uuid default uuid_generate_v4() primary key,
  licence_id uuid not null references public.licences(id) on delete cascade,
  amount numeric(10,2) not null,
  method text,
  note text,
  recorded_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.licences enable row level security;
alter table public.licence_payments enable row level security;

drop policy if exists licences_select_auth on public.licences;
create policy licences_select_auth on public.licences
for select using (auth.role() = 'authenticated');

drop policy if exists licences_write_staff_admin on public.licences;
create policy licences_write_staff_admin on public.licences
for all using (public.is_role_allowed(array['admin','staff']))
with check (public.is_role_allowed(array['admin','staff']));

drop policy if exists licence_payments_select_auth on public.licence_payments;
create policy licence_payments_select_auth on public.licence_payments
for select using (auth.role() = 'authenticated');

drop policy if exists licence_payments_write_staff_admin on public.licence_payments;
create policy licence_payments_write_staff_admin on public.licence_payments
for all using (public.is_role_allowed(array['admin','staff']))
with check (public.is_role_allowed(array['admin','staff']));

drop trigger if exists on_licences_updated on public.licences;
create trigger on_licences_updated
before update on public.licences
for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 3) STAFF
-- ==========================================
create table if not exists public.staff_profiles (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  role text not null,
  pole text not null,
  teams_label text,
  phone text,
  email text,
  availability text default 'ok',
  availability_hint text,
  tags text[],
  note text,
  user_id uuid references auth.users(id),
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.staff_profiles enable row level security;

drop policy if exists staff_profiles_select_auth on public.staff_profiles;
create policy staff_profiles_select_auth on public.staff_profiles
for select using (auth.role() = 'authenticated');

drop policy if exists staff_profiles_write_admin on public.staff_profiles;
create policy staff_profiles_write_admin on public.staff_profiles
for all using (public.is_role_allowed(array['admin']))
with check (public.is_role_allowed(array['admin']));

drop trigger if exists on_staff_updated on public.staff_profiles;
create trigger on_staff_updated
before update on public.staff_profiles
for each row execute procedure public.handle_updated_at();
