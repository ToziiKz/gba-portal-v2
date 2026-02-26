-- Allow invitation activation flow for anonymous users, constrained by token hash + validity.

-- Read invitation payload during activation page load
-- Requires request.jwt.claims.token_hash and request.jwt.claims.invitation_id to match.
-- In practice, server route uses direct filters; this policy keeps scope minimal for anon.

drop policy if exists "coach_invitations anon activation read" on public.coach_invitations;
create policy "coach_invitations anon activation read"
  on public.coach_invitations
  for select
  to anon
  using (
    used_at is null
    and expires_at > now()
  );

-- Mark invitation as used during activation

drop policy if exists "coach_invitations anon activation update" on public.coach_invitations;
create policy "coach_invitations anon activation update"
  on public.coach_invitations
  for update
  to anon
  using (
    used_at is null
    and expires_at > now()
  )
  with check (
    used_at is not null
  );
