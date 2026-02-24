-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  role text not null check (role in ('admin', 'staff', 'coach', 'viewer')) default 'viewer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Secure the table
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- 2. TEAMS (Équipes)
create table public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null, -- U11, U13...
  gender text check (gender in ('M', 'F', 'Mixte')) default 'Mixte',
  coach_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.teams enable row level security;

-- Teams are viewable by authenticated users (for now)
create policy "Teams are viewable by auth users"
  on teams for select
  using ( auth.role() = 'authenticated' );

-- Only Admin/Staff can create/edit teams
create policy "Staff/Admin can manage teams"
  on teams for all
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and role in ('admin', 'staff')
    )
  );

-- 3. PLAYERS (Joueurs)
create table public.players (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  team_id uuid references public.teams(id),
  licence_status text check (licence_status in ('valid', 'pending', 'missing', 'expired')) default 'missing',
  payment_status text check (payment_status in ('paid', 'partial', 'unpaid')) default 'unpaid',
  equipment_status text check (equipment_status in ('received', 'partial', 'pending')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.players enable row level security;

-- Coaches can view their own players
create policy "Coaches see their team players"
  on players for select
  using (
    exists (
      select 1 from public.teams
      where teams.id = players.team_id and teams.coach_id = auth.uid()
    )
    or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and role in ('admin', 'staff')
    )
  );

-- Admin/Staff manage players
create policy "Staff/Admin manage players"
  on players for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and role in ('admin', 'staff')
    )
  );

-- 4. Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'viewer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
