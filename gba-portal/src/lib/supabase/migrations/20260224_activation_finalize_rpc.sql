-- Finalize invitation activation with controlled privileged writes.
-- Needed because activation runs as anon and cannot write team_staff with admin-only RLS.

create or replace function public.finalize_invitation_activation(
  p_invitation_id uuid,
  p_token_hash text,
  p_user_id uuid,
  p_full_name text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv public.coach_invitations%rowtype;
begin
  select *
  into v_inv
  from public.coach_invitations
  where id = p_invitation_id
    and token_hash = p_token_hash
    and used_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'INVITATION_INVALID_OR_EXPIRED';
  end if;

  insert into public.profiles (id, email, full_name, role, is_active)
  values (
    p_user_id,
    v_inv.email,
    p_full_name,
    v_inv.role::public.app_role,
    true
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      role = excluded.role,
      is_active = true,
      updated_at = now();

  delete from public.team_staff where profile_id = p_user_id;

  if coalesce(array_length(v_inv.target_team_ids, 1), 0) > 0 then
    insert into public.team_staff (team_id, profile_id, role_in_team, is_primary)
    select
      t.id as team_id,
      p_user_id,
      'coach'::text as role_in_team,
      (x.rn = 1) as is_primary
    from (
      select unnest(v_inv.target_team_ids) as team_id,
             row_number() over () as rn
    ) x
    join public.teams t on t.id = x.team_id
    on conflict (team_id, profile_id) do update
    set role_in_team = excluded.role_in_team,
        is_primary = excluded.is_primary;
  end if;

  update public.coach_invitations
  set used_at = now(),
      used_by = p_user_id
  where id = v_inv.id;

  return true;
end;
$$;

revoke all on function public.finalize_invitation_activation(uuid, text, uuid, text)
from public;

grant execute on function public.finalize_invitation_activation(uuid, text, uuid, text)
to anon, authenticated;
