# Audit architecture & assainissement — `gba-portal`

Contexte: audit **lecture seule** du projet Next.js `gba-portal` (App Router) dans `/root/.openclaw/workspace/gba-portal`. Objectif: identifier les optimisations (structure/archi/perf/maintenabilité), repérer doublons & éléments obsolètes, et proposer un plan de refactor **sans casser les fonctionnalités**.

> Méthode: inspection de l’arborescence `src/`, lecture ciblée des routes/composants/actions, recherche de dépendances/imports, comparaison avec les scripts SQL Supabase présents à la racine.

---

## 1) Résumé exécutif (points clés)

1. **Incohérence majeure entre schéma Supabase et code UI**: les tables définies dans `supabase_schema.sql` (ex: `players.first_name/last_name`) ne correspondent pas aux champs attendus côté UI (`firstname/lastname`) → risque de pages cassées.
2. **Dépendance manquante (`zod`)** alors que plusieurs _server actions_ l’importent (`src/app/dashboard/**/actions.ts`) → build/exec en erreur.
3. **Deux systèmes de “validation/approvals” coexistent**: certaines pages utilisent `localStorage` (`src/lib/approvals.ts`), tandis que d’autres écrivent en base (`approval_requests`) → fonctionnalités divergentes et validations incomplètes.
4. **Routes “dashboard” redondantes et hétérogènes** (`/dashboard/effectif` vs `/dashboard/joueurs`) avec UI mockée vs UI Supabase → complexité et maintenance difficile.
5. **Doublon de composant** `CreatePlayerModal` (2 versions) dont une sur mocks, l’autre branchée sur Supabase → source de confusion et bugs.
6. **Shim TypeScript risqué** sur `framer-motion` (`src/types/framer-motion.d.ts` force `any`) qui masque des erreurs de type au lieu de corriger les versions/types.
7. **Dépendances probablement inutilisées** (ex: `gsap` introuvable dans `src/`) → dette & surface d’attaque (supply chain) + bundle inutile.
8. **Artefacts/backup dans l’arbre** (`*.bak`, logs, pid, CSS généré) → bruit, risque de commit accidentel, lisibilité réduite.
9. **Absence de séparation claire “domain/data/ui”**: mélange mocks/queries/présentation dans pages & composants → refactor plus risqué.

---

## 2) Problèmes classés par priorité

### P0 — À corriger avant tout (risque de build cassé / fonctionnalités cassées)

1. **`zod` importé mais non déclaré**
   - Fichiers:
     - `src/app/dashboard/joueurs/actions.ts`
     - `src/app/dashboard/equipes/actions.ts`
     - `src/app/dashboard/planning/actions.ts`
   - Symptôme: `import { z } from 'zod'` alors que `npm ls zod --depth=0` renvoie _(empty)_.
   - Impact: build ou runtime en échec dès que ces actions sont compilées/exécutées.

2. **Mismatch schéma `players` (SQL) vs UI**
   - Schéma: `supabase_schema.sql` définit `players.first_name`, `players.last_name`.
   - UI:
     - `src/components/dashboard/players/PlayersView.tsx` attend `firstname`, `lastname`.
     - `src/app/dashboard/joueurs/page.tsx` fait `.order('lastname')`.
   - Impact: données `undefined`, tri non fonctionnel, potentiels crashs UI.

3. **Deux systèmes d’“approvals” incompatibles**
   - `src/lib/approvals.ts` = localStorage + event `gba:approvals`.
   - `src/app/dashboard/validations/page.tsx` = lit `approval_requests` en base.
   - Pages utilisant encore localStorage (au moins):
     - `src/app/dashboard/licences/page.tsx`
     - `src/app/dashboard/stock/page.tsx`
     - `src/app/dashboard/competitions/page.tsx`
     - `src/app/dashboard/staff/page.tsx`
   - Impact: des demandes ne remontent jamais dans `/dashboard/validations`.

4. **Route “effectif” très probablement obsolète et mockée**
   - `src/app/dashboard/effectif/page.tsx` est 100% client, mock data, logique “API simulée”.
   - En parallèle `/dashboard/joueurs` utilise Supabase.
   - Impact: UX incohérente + maintenance doublée + risque de confusion utilisateur.

### P1 — Dette importante (maintenabilité/perf/sécurité)

1. **Shim `framer-motion` en `any`**
   - `src/types/framer-motion.d.ts` force `motion/AnimatePresence` à `any`.
   - Cause probable: versions React/Next/types non alignées.
   - Impact: perte de garanties TS + erreurs masquées.

2. **Doublon `CreatePlayerModal`**
   - `src/components/dashboard/CreatePlayerModal.tsx` (version mocks)
   - `src/components/dashboard/players/CreatePlayerModal.tsx` (version server action)
   - Impact: divergences UI/logic, imports accidentels.

3. **Dépendance `gsap` non utilisée**
   - `package.json` inclut `gsap`, mais aucune occurrence trouvée dans `src/`.
   - Impact: poids, surface d’attaque, updates.

4. **Artefacts “backup/log/pid” dans le repo**
   - Exemples: `eslint.config.mjs.bak`, `src/styles/globals.css.bak`, `package.json.bak`, `public/robots.txt.bak`, `public/sitemap.xml.bak`, `dev-server.log`, `.devserver.pid`, etc.
   - Impact: bruit + risque commit accidentel + confusion sur la source de vérité.

5. **CSS généré dans `src/`**
   - `src/styles/tailwind.generated.css` produit par `scripts/build-tailwind.mjs`.
   - Impact: peut devenir désynchronisé des sources; risque de merge conflicts.

### P2 — Améliorations recommandées (qualité/organisation)

1. **Cohérence des “mocks”**
   - Dossier `src/lib/mocks/*` très utilisé par plusieurs modules dashboard.
   - Recommandation: isoler un mode “demo/mock” (flag) ou migrer module par module vers Supabase.

2. **Nommage & conventions**
   - Incohérences FR/EN dans routes et composants (`joueurs` vs `players`, `equipes` vs `teams`).
   - Recommandation: définir une convention (routes FR OK, mais types/DB et code alignés).

---

## 3) Fichiers / modules probablement inutiles ou redondants

> NB: “probablement” = à confirmer via usage fonctionnel, mais les indices dans le code sont forts.

### Très suspects (candidats suppression/mise à l’écart)

- `src/lib/dashboardRole.ts`
  - Les fonctions liées au `localStorage` (`readDashboardRoleFromStorage`, `useDashboardRole`, `DASHBOARD_ROLE_STORAGE_KEY`) ne sont pas utilisées.
  - Seul le type `DashboardRole` est importé ailleurs.

- `src/lib/approvals.ts`
  - Système localStorage en conflit avec l’approche Supabase `approval_requests`.
  - Si migration vers Supabase: ce module devient obsolète.

- `src/app/dashboard/effectif/page.tsx`
  - Mock complet; doublon fonctionnel avec `/dashboard/joueurs`.

- `src/components/dashboard/CreatePlayerModal.tsx`
  - Version mockée (alors qu’une version “prod” existe dans `players/`).

### Dépendances (candidats nettoyage)

- `gsap` (non trouvé dans `src/`).
- `lightningcss-linux-x64-gnu`: à vérifier; souvent inutile car Next embarque/optionne lightningcss (mais ici dépendance explicite). À confirmer selon build.

### Artefacts / “déchets”

- `*.bak`, `*.log`, `*.pid` à la racine et dans `public/` / `src/styles/`.
- `.next/` et `node_modules/` présents localement (ok) mais doivent rester hors VCS.

---

## 4) Proposition de structure cible (dossiers & responsabilités)

Objectif: clarifier **data access / domain / UI**, isoler le “legacy/mock”, et rendre la migration progressive.

Proposition:

```
src/
  app/
    (marketing)/...                 # pages publiques
    (auth)/login/...
    dashboard/
      layout.tsx
      joueurs/
        page.tsx
        actions.ts
      ...
  components/
    ui/                             # design system (Button, Card, Modal...)
    dashboard/
      players/                      # module Joueurs (UI)
      planning/
      ...
  lib/
    supabase/
      client.ts
      server.ts
    domain/
      players/                      # types + mapping DB<->UI
      approvals/
      planning/
    data/
      players.server.ts             # requêtes Supabase côté serveur
      approvals.server.ts
    mocks/                          # mock data, optionnel
  styles/
  types/
```

Clés:

- Introduire un **mapping** explicite DB → UI (ex: `PlayerRow` → `PlayerVM`) pour éviter les erreurs `first_name` vs `firstname`.
- Centraliser les accès Supabase dans `lib/data/*` pour réduire la duplication.
- Mettre les pages legacy (ex: effectif mock) sous `src/app/dashboard/(legacy)/...` ou les supprimer après redirection.

---

## 5) Plan d’action (étapes)

### Quick wins (1–2h)

1. **Ajouter `zod`** aux dépendances (ou retirer l’usage)
   - Action minimale: `npm i zod` + vérifier build.
2. **Fixer le mismatch `players`**
   - Option A (recommandée): adapter l’UI à `first_name/last_name`.
   - Option B: créer une vue SQL `players_view` avec alias `firstname/lastname` (moins idéal).
3. **Nettoyer les artefacts** (`*.bak`, logs, pid) et renforcer `.gitignore` si nécessaire.
4. **Supprimer `gsap`** si vraiment inutilisé.

### Chantiers (progressifs, module par module)

5. **Unifier le système d’approvals**
   - Cible: _une seule source de vérité_ (Supabase `approval_requests`).
   - Étapes:
     - Migrer les pages `licences/stock/competitions/staff` vers des server actions qui écrivent en table.
     - Déprécier puis supprimer `src/lib/approvals.ts`.

6. **Décommissionner `/dashboard/effectif`**
   - Soit redirection vers `/dashboard/joueurs`, soit remplacement du contenu.

7. **Réduire les “any shims”**
   - Aligner versions `framer-motion`, `react`, `@types/react`.
   - Retirer `src/types/framer-motion.d.ts`.

8. **Normaliser les conventions**
   - Fixer un standard pour:
     - noms de colonnes (snake_case DB),
     - noms de types (PascalCase),
     - noms de champs UI (camelCase).

---

## 6) Checklist de validation après refactor

- `npm run type-check` passe sans shim `framer-motion`.
- `npm run build` passe.
- Parcours fonctionnel:
  - Auth: login → accès dashboard.
  - `/dashboard/joueurs`: liste + création joueur (admin direct / non-admin via approval).
  - `/dashboard/validations`: voit les demandes; approve/reject fonctionne.
  - Planning: création + suppression (admin vs non-admin).
- Vérifier permissions coach:
  - scope calculé par `getDashboardScope()`.
  - filtrage effectif/planning par équipes/pôles.
- Vérifier qu’aucun fichier sensible n’est committé:
  - `.env.local` absent du VCS.

---

## 7) Risques & précautions

1. **Risque de casse silencieuse lié à `skipLibCheck` + shims `any`**: les erreurs peuvent n’apparaître qu’en prod.
2. **Risque de divergence DB**: si la base réelle ne suit pas `supabase_schema.sql`, il faut d’abord confirmer le schéma effectif (via introspection Supabase) avant migration UI.
3. **Risque d’auth/permissions**: les pages “mock” donnent une fausse impression de fonctionnalités; migrer progressivement et garder des tests manuels.
4. **Supply chain**: dépendances inutilisées (ex: `gsap`) augmentent la surface d’attaque.

---

### Annexes — Faits observés (extraits)

- `npm ls zod --depth=0` → _(empty)_
- `supabase_schema.sql` définit `players.first_name`, `players.last_name`
- `PlayersView.tsx` attend `firstname`, `lastname`
- `CreatePlayerModal.tsx` existe en double (mocks vs server action)
