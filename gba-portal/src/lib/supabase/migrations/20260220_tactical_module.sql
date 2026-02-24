-- Tactical Module Schema
-- Matches and Lineups management

-- 1. MATCHES
create table if not exists public.matches (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  coach_id uuid references public.profiles(id),
  game_date date not null,
  opponent text not null,
  formation text not null,
  status text check (status in ('scheduled', 'played', 'cancelled')) default 'scheduled',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.matches enable row level security;

-- Policies for matches
create policy "Matches viewable by auth users"
  on public.matches for select
  using ( auth.role() = 'authenticated' );

create policy "Coaches can manage their own matches"
  on public.matches for all
  using (
    coach_id = auth.uid() 
    or 
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'staff'))
  );

-- 2. MATCH LINEUPS (Feuilles de match)
create table if not exists public.match_lineups (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references public.matches(id) on delete cascade not null,
  player_id uuid references public.players(id) on delete set null,
  position_label text not null, -- GB, ARG, MC...
  jersey_number integer,
  is_starter boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.match_lineups enable row level security;

-- Policies for lineups (inherit from match access usually, or simplified)
create policy "Lineups viewable by auth users"
  on public.match_lineups for select
  using ( auth.role() = 'authenticated' );

create policy "Coaches can manage their lineups"
  on public.match_lineups for all
  using (
    exists (
      select 1 from public.matches 
      where matches.id = match_lineups.match_id 
      and (
        matches.coach_id = auth.uid()
        or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'staff'))
      )
    )
  )
  with check (
    exists (
      select 1 from public.matches 
      where matches.id = match_lineups.match_id 
      and (
        matches.coach_id = auth.uid()
        or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'staff'))
      )
    )
  );
