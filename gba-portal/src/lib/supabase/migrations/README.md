# Supabase Migrations (Active)

Ce dossier contient les migrations SQL actives et versionnées.

## Ordre recommandé d'application

Appliquer dans l'ordre alphabétique/chronologique des noms:

1. `20260214_sprint_d_migration.sql`
2. `20260215_finalize_migration.sql`
3. `20260219_invitation_teams.sql`
4. `20260219_profiles_delete_policy.sql`
5. `20260220_access_atomic_rpc.sql`
6. `20260220_public_teams_policy.sql`
7. `20260220_tactical_module.sql`

## Fichiers SQL legacy (racine projet)

Les fichiers `supabase_*.sql` en racine sont conservés comme références historiques.
La source de vérité opérationnelle est ce dossier `migrations/`.

## Vérification post-apply

- Vérifier que les fonctions RPC sont présentes.
- Vérifier les policies RLS critiques (`profiles`, `teams`, `players`, `planning_sessions`, `matches`, `match_lineups`).
- Refaire un smoke test `/dashboard/acces`, `/activate`, `/dashboard/tactique`.
