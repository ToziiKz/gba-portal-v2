# Checkup complet — 2026-02-14

## Scope

Audit structurel complet sur:

- architecture App Router,
- séparation public/dashboard,
- dette mock/localStorage,
- organisation dossiers/fichiers,
- risques de maintenance.

## Chiffres clés

- Fichiers TS/TSX: **116**
- Plus gros fichiers:
  - `src/app/dashboard/tactique/page.tsx` (~893 lignes)
  - `src/app/dashboard/equipements/EquipementsClient.tsx` (~823)
  - `src/app/dashboard/staff/page.tsx` (~680)
  - `src/app/dashboard/stock/page.tsx` (~577)
  - `src/app/dashboard/licences/page.tsx` (~540)

## État architecture

### Points solides

- Auth/ACL serveur consolidée via `src/proxy.ts` (compatible Next 16).
- Scope coach structuré (`getDashboardScope`) et désormais réutilisé via couche data partagée.
- Nouveau socle data dashboard:
  - `src/lib/dashboard/server-data.ts`
  - `src/lib/dashboard/tactical-data.ts`
- Début de découpage de la logique métier hors pages monolithiques.

### Dettes prioritaires

#### P0 — Source de vérité data

Modules encore dépendants de mocks/localStorage:

- `dashboard/licences`
- `dashboard/stock`
- `dashboard/staff`
- `dashboard/categories`
- `dashboard/competitions`
- `dashboard/relances`

Fichiers mocks actifs:

- `src/lib/mocks/dashboard*.ts`

#### P0 — Monolithes UI

Pages/composants lourds à découper:

- tactique, equipements, staff, stock, licences.

#### P1 — Cohérence IA/navigation

- IA coach améliorée mais encore hétérogène selon modules (legacy + nouveaux flux).
- `match` introduit: aligner complètement les raccourcis home + sidebar + spotlight.

#### P1 — Public IA/SEO

- Home/public améliorée visuellement mais encore inégale selon sections.
- Coexistence `/shop` et `/boutique` à rationaliser.

## Plan d’exécution recommandé (ordre)

### Sprint B3 (en cours)

1. Basculer `stock` en DB-first (état, mouvements, seuils) ; garder approvals admin.
2. Basculer `licences` en DB-first (paiements + statuts).
3. Basculer `staff` en DB-first (disponibilités/canaux).

### Sprint B4

1. Extraire services par domaine (`stock-data`, `licences-data`, `staff-data`).
2. Réduire pages à orchestration UI + appels services.
3. Supprimer imports mock dans pages migrées.

### Sprint C

1. Harmonisation IA public + cleanup `/shop` vs `/boutique`.
2. Uniformisation composants hero/sections trust.

## Règles de conduite validées

- Updates proactives toutes les **15 min** via cron.
- Arrêt et suppression du cron dès fin du chantier.
- Exécution autonome sans attendre un message utilisateur.
