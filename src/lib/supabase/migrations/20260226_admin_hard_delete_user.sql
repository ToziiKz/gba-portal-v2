-- Hard-delete user account and related app data (admin-only).
-- Goal: remove profile + assignments + auth user to leave no operational trace.

create or replace function public.admin_hard_delete_user(
  p_target_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_role text;
  v_target_email text;
begin
  select p.role
  into v_actor_role
  from public.profiles p
  where p.id = v_actor_id
    and coalesce(p.is_active, true) = true;

  if v_actor_role is distinct from 'admin' then
    raise exception 'FORBIDDEN_ADMIN_ONLY';
  end if;

  if p_target_user_id = v_actor_id then
    raise exception 'CANNOT_DELETE_SELF';
  end if;

  select email into v_target_email
  from public.profiles
  where id = p_target_user_id;

  -- Detach references first (best effort, idempotent)
  update public.planning_sessions
  set created_by = null
  where created_by = p_target_user_id;

  update public.coach_invitations
  set used_by = null
  where used_by = p_target_user_id;

  if v_target_email is not null then
    delete from public.coach_invitations
    where lower(email) = lower(v_target_email);
  end if;

  delete from public.team_staff where profile_id = p_target_user_id;

  -- Legacy compatibility if teams.coach_id still exists
  begin
    execute 'update public.teams set coach_id = null where coach_id = $1'
    using p_target_user_id;
  exception when undefined_column then
    null;
  end;

  -- Optional table compatibility
  begin
    execute 'delete from public.staff_profiles where user_id = $1'
    using p_target_user_id;
  exception when undefined_table then
    null;
  end;

  delete from public.profiles where id = p_target_user_id;

  -- Finally remove auth user (cascade should remove identities)
  delete from auth.users where id = p_target_user_id;

  return true;
end;
$$;

revoke all on function public.admin_hard_delete_user(uuid) from public;
grant execute on function public.admin_hard_delete_user(uuid) to authenticated;
