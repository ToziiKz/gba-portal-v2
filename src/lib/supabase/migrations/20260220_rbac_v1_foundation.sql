-- RBAC V1 foundation (non-destructive)
-- Goal: add permissions/scopes layer without breaking existing policies.

-- 1) Permissions matrix table
create table if not exists public.role_permissions (
  id bigserial primary key,
  role text not null,
  module text not null,
  action text not null,
  scope text not null check (scope in ('team', 'pole', 'global')),
  allowed boolean not null default true,
  created_at timestamptz not null default now(),
  unique(role, module, action)
);

-- 2) User scope assignments
create table if not exists public.user_scopes (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  scope_type text not null check (scope_type in ('team', 'pole', 'global')),
  team_id uuid null references public.teams(id) on delete cascade,
  pole text null,
  created_at timestamptz not null default now(),
  unique(user_id, scope_type, team_id, pole)
);

create index if not exists idx_user_scopes_user_scope on public.user_scopes(user_id, scope_type);
create index if not exists idx_user_scopes_team on public.user_scopes(team_id);

-- 3) Seed role permissions (MVP, aligned with current decisions)
insert into public.role_permissions(role, module, action, scope, allowed) values
  -- admin
  ('admin', 'all', 'all', 'global', true),

  -- resp_sportif (global)
  ('resp_sportif', 'planning', 'write', 'global', true),
  ('resp_sportif', 'presences', 'read', 'global', true),
  ('resp_sportif', 'convocations', 'read', 'global', true),
  ('resp_sportif', 'tactique', 'read', 'global', true),
  ('resp_sportif', 'effectif', 'read', 'global', true),
  ('resp_sportif', 'effectif', 'write', 'global', true),
  ('resp_sportif', 'effectif', 'approve', 'global', true),
  ('resp_sportif', 'joueurs_detail', 'read', 'global', true),
  ('resp_sportif', 'joueurs_detail', 'write', 'global', true),
  ('resp_sportif', 'joueurs_detail', 'approve', 'global', true),
  ('resp_sportif', 'licences_admin', 'read', 'global', true),
  ('resp_sportif', 'licences_admin', 'write', 'global', true),
  ('resp_sportif', 'licences_admin', 'approve', 'global', true),
  ('resp_sportif', 'validations', 'approve', 'global', true),

  -- resp_pole (pole)
  ('resp_pole', 'planning', 'write', 'pole', true),
  ('resp_pole', 'presences', 'read', 'pole', true),
  ('resp_pole', 'convocations', 'read', 'pole', true),
  ('resp_pole', 'tactique', 'read', 'pole', true),
  ('resp_pole', 'effectif', 'read', 'pole', true),
  ('resp_pole', 'effectif', 'write', 'pole', true),
  ('resp_pole', 'effectif', 'approve', 'pole', true),
  ('resp_pole', 'joueurs_detail', 'read', 'pole', true),
  ('resp_pole', 'joueurs_detail', 'write', 'pole', true),
  ('resp_pole', 'joueurs_detail', 'approve', 'pole', true),
  ('resp_pole', 'validations', 'approve', 'pole', true),

  -- coach (team)
  ('coach', 'planning', 'write', 'team', true),
  ('coach', 'presences', 'write', 'team', true),
  ('coach', 'convocations', 'write', 'team', true),
  ('coach', 'tactique', 'write', 'team', true),
  ('coach', 'effectif', 'write', 'team', true),
  ('coach', 'joueurs_detail', 'write', 'team', true),

  -- dirigeant
  ('dirigeant', 'presences', 'write', 'team', true),
  ('dirigeant', 'convocations', 'write', 'team', true),
  ('dirigeant', 'effectif', 'read', 'team', true),
  ('dirigeant', 'joueurs_detail', 'read', 'team', true),
  ('dirigeant', 'planning', 'read', 'team', true),
  ('dirigeant', 'tactique', 'read', 'team', true),

  -- resp_administratif
  ('resp_administratif', 'licences_admin', 'write', 'global', true),
  ('resp_administratif', 'licences_admin', 'approve', 'global', true),
  ('resp_administratif', 'acces_permissions', 'write', 'global', true),
  ('resp_administratif', 'invitations_activation', 'write', 'global', true),
  ('resp_administratif', 'effectif', 'write', 'global', true),
  ('resp_administratif', 'joueurs_detail', 'write', 'global', true),
  ('resp_administratif', 'validations', 'approve', 'global', true),

  -- resp_equipements
  ('resp_equipements', 'equipements_stock', 'write', 'global', true),
  ('resp_equipements', 'effectif', 'read', 'global', true),
  ('resp_equipements', 'joueurs_detail', 'read', 'global', true),

  -- Legacy compatibility
  ('staff', 'all', 'all', 'global', true)
on conflict (role, module, action) do update
set scope = excluded.scope,
    allowed = excluded.allowed;

-- 4) Backfill scopes from existing model
-- Admin/staff global scope
insert into public.user_scopes(user_id, scope_type, pole)
select p.id, 'global', null
from public.profiles p
where p.role in ('admin', 'staff')
on conflict do nothing;

-- Coach team scope from teams.coach_id
insert into public.user_scopes(user_id, scope_type, team_id)
select distinct t.coach_id, 'team', t.id
from public.teams t
where t.coach_id is not null
on conflict do nothing;

-- 5) Permission helper
create or replace function public.has_permission(
  p_user_id uuid,
  p_module text,
  p_action text,
  p_team_id uuid default null,
  p_pole text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_scope text;
begin
  if p_user_id is null then
    return false;
  end if;

  select role into v_role
  from public.profiles
  where id = p_user_id and coalesce(is_active, true) = true;

  if v_role is null then
    return false;
  end if;

  if exists (
    select 1 from public.role_permissions rp
    where rp.role = v_role
      and rp.allowed = true
      and ((rp.module = 'all' and rp.action = 'all') or (rp.module = p_module and rp.action = p_action))
  ) then
    select rp.scope into v_scope
    from public.role_permissions rp
    where rp.role = v_role
      and rp.allowed = true
      and ((rp.module = 'all' and rp.action = 'all') or (rp.module = p_module and rp.action = p_action))
    order by case rp.scope when 'global' then 1 when 'pole' then 2 else 3 end
    limit 1;

    if v_scope = 'global' then
      return true;
    end if;

    if v_scope = 'team' then
      return exists (
        select 1
        from public.user_scopes us
        where us.user_id = p_user_id
          and us.scope_type = 'team'
          and us.team_id = p_team_id
      );
    end if;

    if v_scope = 'pole' then
      if p_pole is null then
        return false;
      end if;
      return exists (
        select 1
        from public.user_scopes us
        where us.user_id = p_user_id
          and us.scope_type = 'pole'
          and us.pole = p_pole
      );
    end if;
  end if;

  return false;
end;
$$;

grant execute on function public.has_permission(uuid, text, text, uuid, text) to authenticated;

-- 6) Pilot policies (additive): planning_sessions + players
drop policy if exists "RBAC V1 planning select" on public.planning_sessions;
create policy "RBAC V1 planning select"
  on public.planning_sessions
  for select
  using (
    public.has_permission(auth.uid(), 'planning', 'write', team_id, null)
    or public.has_permission(auth.uid(), 'planning', 'approve', team_id, null)
    or public.has_permission(auth.uid(), 'planning', 'read', team_id, null)
  );

drop policy if exists "RBAC V1 planning write" on public.planning_sessions;
create policy "RBAC V1 planning write"
  on public.planning_sessions
  for all
  using (
    public.has_permission(auth.uid(), 'planning', 'write', team_id, null)
    or public.has_permission(auth.uid(), 'planning', 'approve', team_id, null)
  )
  with check (
    public.has_permission(auth.uid(), 'planning', 'write', team_id, null)
    or public.has_permission(auth.uid(), 'planning', 'approve', team_id, null)
  );

drop policy if exists "RBAC V1 players select" on public.players;
create policy "RBAC V1 players select"
  on public.players
  for select
  using (
    public.has_permission(auth.uid(), 'effectif', 'write', team_id, null)
    or public.has_permission(auth.uid(), 'effectif', 'approve', team_id, null)
    or public.has_permission(auth.uid(), 'effectif', 'read', team_id, null)
  );

drop policy if exists "RBAC V1 players write" on public.players;
create policy "RBAC V1 players write"
  on public.players
  for all
  using (
    public.has_permission(auth.uid(), 'effectif', 'write', team_id, null)
    or public.has_permission(auth.uid(), 'effectif', 'approve', team_id, null)
  )
  with check (
    public.has_permission(auth.uid(), 'effectif', 'write', team_id, null)
    or public.has_permission(auth.uid(), 'effectif', 'approve', team_id, null)
  );
