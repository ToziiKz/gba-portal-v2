-- Atomic admin profile/team update for dashboard access management.
-- Prevents partial state when role/team updates fail mid-flight.

create or replace function public.admin_update_profile_and_teams(
  p_user_id uuid,
  p_role text,
  p_is_active boolean,
  p_team_ids uuid[] default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assigned_count integer := 0;
  v_expected_count integer := 0;
begin
  if p_user_id is null then
    raise exception 'p_user_id is required';
  end if;

  if p_role is null or length(trim(p_role)) = 0 then
    raise exception 'p_role is required';
  end if;

  update public.profiles
  set
    role = p_role,
    is_active = coalesce(p_is_active, true),
    updated_at = now()
  where id = p_user_id;

  -- Always clear previous coach assignments for this user.
  update public.teams
  set coach_id = null
  where coach_id = p_user_id;

  -- Re-assign selected teams only for coach role.
  if p_role = 'coach' and coalesce(array_length(p_team_ids, 1), 0) > 0 then
    update public.teams
    set coach_id = p_user_id
    where id = any(p_team_ids);
  end if;

  if p_role = 'coach' then
    select count(*) into v_assigned_count
    from public.teams
    where coach_id = p_user_id;

    v_expected_count := coalesce(array_length(p_team_ids, 1), 0);

    if v_assigned_count <> v_expected_count then
      raise exception 'Affectation partielle détectée (% assigned / % expected)', v_assigned_count, v_expected_count;
    end if;
  end if;
end;
$$;

grant execute on function public.admin_update_profile_and_teams(uuid, text, boolean, uuid[]) to authenticated;
