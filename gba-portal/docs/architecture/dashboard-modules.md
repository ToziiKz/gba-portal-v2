# Dashboard Modules Map

## Core shell

- `src/app/dashboard/layout.tsx`
  - Vérifie session utilisateur
  - Charge `getDashboardScope()`
  - Injecte `PermissionsProvider`

## Modules principaux

- `acces/`
  - Invitations, rôles, activation, assignation équipes
  - Actions serveur: `actions.ts`, `update-actions.ts`
- `planning/`
  - Création/suppression séances
  - Vue planning + présence liée
- `presences/`
  - Pointage par séance/équipe
- `effectif/` + `joueurs/`
  - CRUD joueurs (soumis validation pour coach)
- `validations/`
  - File d'approbation admin des actions staff/coach
- `tactique/`
  - Compositions, lineups, export image, sauvegarde match
- `equipes/`, `staff/`, `stock/`, `competitions/`, `categories/`, `licences/`
  - Modules métier secondaires

## Couches backend utilisées

- Supabase server client: `src/lib/supabase/server.ts`
- Scope métier: `src/lib/dashboard/getDashboardScope.ts`
- Authz stricte admin: `src/lib/dashboard/authz.ts`
- Logger unifié: `src/lib/logger.ts`
