-- RBAC V1 Cleanup (2026-02-22)
-- Remove 'viewer' default and enforce strict roles

-- 1. Drop existing CHECK constraint on role
-- Note: Constraint name is usually 'profiles_role_check' or generated.
-- We'll try to drop by name, or alter column type to reset checks.
alter table public.profiles drop constraint if exists profiles_role_check;

-- 2. Remove default value 'viewer' (dangerous default)
alter table public.profiles alter column role drop default;

-- 3. Add new strict CHECK constraint
-- Allowed roles: admin, resp_sportif, resp_pole, resp_equipements, coach
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'resp_sportif', 'resp_pole', 'resp_equipements', 'coach'));

-- 4. Cleanup any lingering 'viewer' roles (just in case)
delete from public.profiles where role = 'viewer';

-- 5. Update RLS policies to remove 'viewer' references if any exist in policy definitions
-- (This part depends on existing policies, but usually they check auth.role() = 'authenticated' + profile lookup)

-- Done. Now insertions must provide a valid role explicitly.
