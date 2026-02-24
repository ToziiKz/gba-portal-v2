-- Normalize team_staff role model to:
-- - coach (exactly one primary per team)
-- - assistant (0..2)
-- - staff (0..3)

-- 1) Normalize existing values
update public.team_staff
set role_in_team = case
  when role_in_team in ('head_coach', 'coach') then 'coach'
  when role_in_team in ('assistant_coach', 'adjoint') then 'assistant'
  else 'staff'
end;

-- 2) Replace role check constraint
alter table public.team_staff
  drop constraint if exists team_staff_role_in_team_check;

alter table public.team_staff
  add constraint team_staff_role_in_team_check
  check (role_in_team in ('coach', 'assistant', 'staff'));

-- 3) Ensure primary applies only to coach rows
update public.team_staff
set is_primary = false
where role_in_team <> 'coach'
  and is_primary = true;

-- 4) Guardrails trigger: assistant <= 2, staff <= 3, primary only for coach
create or replace function public.validate_team_staff_limits()
returns trigger
language plpgsql
as $$
declare
  v_assistants int;
  v_staff int;
  v_primary int;
begin
  if new.role_in_team not in ('coach', 'assistant', 'staff') then
    raise exception 'role_in_team invalide: %', new.role_in_team;
  end if;

  if new.is_primary and new.role_in_team <> 'coach' then
    raise exception 'Seul le rôle coach peut être primary';
  end if;

  select count(*) into v_assistants
  from public.team_staff
  where team_id = new.team_id
    and role_in_team = 'assistant'
    and (tg_op = 'INSERT' or profile_id <> new.profile_id);

  if new.role_in_team = 'assistant' and v_assistants >= 2 then
    raise exception 'Max assistants atteint (2) pour team_id=%', new.team_id;
  end if;

  select count(*) into v_staff
  from public.team_staff
  where team_id = new.team_id
    and role_in_team = 'staff'
    and (tg_op = 'INSERT' or profile_id <> new.profile_id);

  if new.role_in_team = 'staff' and v_staff >= 3 then
    raise exception 'Max staff atteint (3) pour team_id=%', new.team_id;
  end if;

  select count(*) into v_primary
  from public.team_staff
  where team_id = new.team_id
    and is_primary = true
    and (tg_op = 'INSERT' or profile_id <> new.profile_id);

  if new.is_primary and v_primary >= 1 then
    raise exception 'Un seul primary est autorisé par équipe';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_team_staff_limits on public.team_staff;
create trigger trg_validate_team_staff_limits
before insert or update on public.team_staff
for each row
execute function public.validate_team_staff_limits();
