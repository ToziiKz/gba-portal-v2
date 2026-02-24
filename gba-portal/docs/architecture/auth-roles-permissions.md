# Auth / Roles / Permissions

## Rôles applicatifs

- `viewer`
- `coach`
- `staff`
- `admin`

## Contrôle d'accès

### 1) Authentification

- Session Supabase lue via `supabase.auth.getUser()`.
- Si non connecté dans dashboard: redirection `/login`.

### 2) Activation compte

- Le profil `profiles` porte:
  - `role`
  - `is_active`
- Si `is_active = false`: accès dashboard refusé.

### 3) Scope métier

- `getDashboardScope()` calcule:
  - équipes éditables
  - équipes visibles
  - rôle effectif
- Source de vérité coach: `teams.coach_id`.

### 4) Garde stricte actions sensibles

- `requireRole('admin')` pour actions critiques (accès, validations, suppression).

## RLS / SQL

- Les politiques SQL doivent aligner les règles ci-dessus.
- Les migrations actives sont dans `src/lib/supabase/migrations/`.
