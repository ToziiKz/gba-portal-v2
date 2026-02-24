-- Allow authenticated users to read their own profile row
-- and admins to read all profiles.

alter table public.profiles enable row level security;

drop policy if exists "Profiles self read" on public.profiles;
create policy "Profiles self read"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "Profiles admin read all" on public.profiles;
create policy "Profiles admin read all"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and coalesce(p.is_active, true) = true
    )
  );
