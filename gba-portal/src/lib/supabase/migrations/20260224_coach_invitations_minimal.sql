-- Minimal invitation-only table for access workflow
-- Flow: admin invites -> coach activates account via token link

create table if not exists public.coach_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  role text not null check (role in ('admin', 'coach')),
  token_hash text not null,
  target_team_ids uuid[] not null default '{}',
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references auth.users(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_coach_invitations_email_pending
  on public.coach_invitations(email)
  where used_at is null;

create index if not exists idx_coach_invitations_token_hash
  on public.coach_invitations(token_hash);

alter table public.coach_invitations enable row level security;

drop policy if exists "coach_invitations admin read" on public.coach_invitations;
create policy "coach_invitations admin read"
  on public.coach_invitations
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

drop policy if exists "coach_invitations admin write" on public.coach_invitations;
create policy "coach_invitations admin write"
  on public.coach_invitations
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
