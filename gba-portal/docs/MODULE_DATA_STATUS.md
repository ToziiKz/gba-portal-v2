# Module Data Status (DB vs Mock)

Updated: 2026-02-14 (Sprint D Complete)

## Dashboard modules

- `dashboard/acces` → **DB** (Supabase)
- `dashboard/equipes` → **DB**
- `dashboard/joueurs` → **DB**
- `dashboard/planning` → **DB**
- `dashboard/presences` → **DB**
- `dashboard/effectif` → **DB** (aggregated teams+players)
- `dashboard/tactique` → **DB** (teams/players fetch)
- `dashboard/validations` → **DB** (`approval_requests`)
- `dashboard/stock` → **DB** (Supabase)
- `dashboard/licences` → **DB** (Supabase)
- `dashboard/staff` → **DB** (Supabase)

### Legacy / to migrate

- `dashboard/categories` → **DB** (Supabase, server actions + RLS)
- `dashboard/competitions` → **DB** (Supabase, server actions + RLS)
- `dashboard/relances` → **DB** (Supabase, server actions + RLS)

## Notes

- Rule: all sensitive writes must go through server actions with role checks.
- ACL now centralized by role helper (`src/lib/dashboard/authz.ts`) and `src/proxy.ts` route gate.
