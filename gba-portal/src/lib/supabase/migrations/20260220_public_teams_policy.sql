-- Allow public read access to teams table
-- Required for the public "Coach Access Request" form to list available teams.

drop policy if exists "Teams are viewable by auth users" on public.teams;

create policy "Teams are viewable by everyone"
  on public.teams for select
  using ( true );
