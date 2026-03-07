# GBA_ARCHITECTURE.md

> Référence unique de contexte projet (mémoire externe).
> À lire avant chaque tâche et à mettre à jour après chaque tâche validée.

---

## 1) Identité du projet

- **Nom produit :** GBA Portal / GBA CRM
- **Organisation :** Groupement Bruche Ackerland (club de football)
- **Périmètre :**
  - **Front-Office public** (site vitrine)
  - **Back-Office / CRM staff** (dashboard interne)
- **Environnement d’exécution :** VPS Ubuntu (développement local), repo isolé
- **Backend data/auth :** Supabase

---

## 2) Contraintes opérationnelles (résumé exécutable)

1. **Confinement strict** : intervenir uniquement dans le dossier projet `gba-portal/`.
2. **Supabase protégé** :
   - pas de mock injecté en base,
   - évolutions schéma via fichiers SQL dans `supabase/migrations` (ou `src/lib/supabase/migrations` selon existant),
   - exécution SQL seulement après validation PO.
3. **Workflow P.E.R.C.** :
   - Planifier → Exécuter → Réviser → Commiter,
   - commit uniquement après validation explicite PO.

---

## 3) Stack technique (état actuel)

### Runtime / Framework
- **Next.js 16.1.6** (App Router)
- **React 19.2.4**
- **TypeScript 5**

### UI / Styles
- **Tailwind CSS v4**
- **Framer Motion** (animations front)
- **Lucide React** (icônes)
- **Radix Slot** (`@radix-ui/react-slot`) pour composant Button polymorphique

### Data / Auth
- **Supabase SSR + supabase-js**
- Middleware/proxy d’auth présent (`src/proxy.ts`)

### Qualité / Tooling
- ESLint v9 (flat config)
- Prettier
- Scripts: `dev`, `build`, `start`, `lint`, `lint:fix`, `type-check`, `verify`

---

## 4) Arborescence utile (cartographie)

## Racine
- `package.json`
- `next.config.js`
- `eslint.config.mjs`
- `.env.example`
- `README.md`
- `GBA_ARCHITECTURE.md` (ce fichier)
- `supabase/option-a-clean-bootstrap.sql` (bootstrap DB propre)

## App (routes)
- `src/app/page.tsx` (landing)
- `src/app/shop/page.tsx` (boutique)
- `src/app/boutique/page.tsx` (redirect vers `/shop`)
- `src/app/about`, `news`, `sponsors`, `contact`, `privacy`, `terms`, `accessibility`
- `src/app/login`
- `src/app/activate`
- `src/app/coach-access`
- `src/app/dashboard/*`
  - `layout.tsx`
  - `page.tsx`
  - `acces`
  - `equipes`
  - `effectif`
  - `joueurs`
  - `planning`

## Composants
- `src/components/*` (front public)
- `src/components/dashboard/*` (CRM)
- `src/components/ui/*` (primitives)

## Libs
- `src/lib/site.ts`, `site-content.ts`, `shop-data.ts`
- `src/lib/supabase/{client,server}.ts`
- `src/lib/dashboard/*` (scope, authz, nav, data fetch)
- `src/lib/supabase/migrations/*.sql` (historique SQL conservé)

## Assets
- `public/brand/*`, `public/sounds/*`, `public/sponsors/*`

---

## 5) État fonctionnel (terminé / en place)

### Front-Office public
- Landing premium animée (Hero + sections branding)
- Pages institutionnelles (about/contact/news/sponsors/legal/accessibility)
- Boutique (`/shop`) active
- `/boutique` redirige vers `/shop`

### Back-Office / CRM (scope actuel)
- Auth/login staff
- Dashboard principal
- Modules conservés et opérationnels:
  - **Accès & rôles** (`/dashboard/acces`)
  - **Effectif Club** (`/dashboard/effectif-club`) — fusion macro/micro équipes + joueurs
  - **Planning** (`/dashboard/planning`)
- Routes historiques redirigées vers le module unifié:
  - `/dashboard/effectif` → `/dashboard/effectif-club`
  - `/dashboard/joueurs` → `/dashboard/effectif-club`
  - `/dashboard/equipes` → `/dashboard/effectif-club`
- Gestion staff↔équipes en **many-to-many** via `team_staff` (coach/assistant/staff + principal)

### Nettoyage déjà effectué (historique récent)
- Suppression de nombreux modules hors scope/non finis
- Suppression mocks et composants orphelins
- Réduction des dépendances npm inutiles
- Suppression assets inutilisés
- Purge partielle migrations SQL obsolètes
- Backup GitHub créé (branche + tag dédiés)
- Correctif Stripe SDK + passage de l’état QA à lint/type-check/build green
- Nettoyage des derniers warnings Prettier
- Durcissement `createAdminClient` (clé service role obligatoire)
- Ré-alignement applicatif des rôles actifs (`admin`/`coach`)

---

## 6) Modèle de données cible court terme (source de vérité produit)

Tables métier minimales:
- `profiles`
- `teams`
- `players`
- (optionnel selon roadmap staff: `planning_sessions`)

Règles clés:
- `profiles.id` **doit** correspondre à `auth.users.id`
- rôles staff contrôlés par `profiles.role`
- RLS minimale lisible + restrictive sur écriture

---

## 7) Endpoints / routes techniques importantes

- `src/proxy.ts` : contrôle auth/protection de routes `/dashboard`
- `src/app/health/route.ts` : endpoint de santé
- `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/manifest.ts` : SEO/PWA

---

## 8) Variables d’environnement (attendues)

### Variables publiques (frontend/runtime)
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_GIT_SHA` (optionnel)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (si checkout côté front)

### Variables serveur sensibles
- `SUPABASE_SERVICE_ROLE_KEY` (**obligatoire** pour `createAdminClient`)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_ALLOWED_PRICE_IDS`

> Notes sécurité:
> - `.env.local` est runtime sensible et ne doit pas être commité.
> - `createAdminClient()` ne fallback plus vers anon key: absence de `SUPABASE_SERVICE_ROLE_KEY` => erreur explicite.
> - Rotation périodique recommandée des clés Stripe (au minimum `STRIPE_SECRET_KEY`).

---

## 9) Standards de code imposés (projet)

1. Zéro code mort après modification.
2. UI et logique data séparées autant que possible.
3. Pas de mock DB en production Supabase.
4. Migrations SQL explicites, nommées, traçables.
5. Toute livraison passe par:
   - `npm run lint`
   - `npm run type-check`
   - `npm run build`

---

## 10) Procédure de travail P.E.R.C. (ancrée)

Pour chaque nouvelle fonctionnalité:
1. **PLANIFIER** : liste des fichiers impactés + stratégie.
2. **EXÉCUTER** : implémentation + nettoyage.
3. **RÉVISER** : compilation/tests + URL de test au PO.
4. **COMMITER** : seulement après message explicite PO: **« C’est validé »**.

---

## 11) Risques/points de vigilance connus

### Sécurité / accès
- RLS `profiles` peut bloquer l’accès dashboard si policies incohérentes.
- Incohérences possibles entre email de login et ligne `profiles` (UUID mismatch).
- Risque opérationnel si `SUPABASE_SERVICE_ROLE_KEY` absente en environnement (les flows admin dépendant de `createAdminClient` échouent explicitement, ce qui est voulu mais doit être anticipé).

### Paiements (Stripe)
- Risque de configuration incomplète si `STRIPE_ALLOWED_PRICE_IDS` non aligné avec les Price IDs actifs.
- Risque d’observabilité faible si webhook non configuré (`STRIPE_WEBHOOK_SECRET`) ou non monitoré.
- Secrets Stripe en `.env.local` => vigilance forte contre divulgation/commit accidentel.

### Produit / gouvernance rôles
- Les rôles dashboard actifs ont été re-verrouillés à `admin` + `coach`; toute réactivation `resp_*` devra être traitée comme un chantier dédié (code + RLS + UI + QA).

### Développement
- `allowedDevOrigins` Next peut générer warning en mode dev si origine non whitelistée.

---

## 12) Snapshot d’état (état actuel vérifié)

- Repo GitHub: `https://github.com/ToziiKz/gba-portal-v2.git`
- Branche locale actuelle: `master` (initialisation locale en cours, historique de commits locaux récent)
- Serveur dev: `http://localhost:3000` (network: `http://76.13.33.246:3000`)
- Build état: **OK** (`lint`, `type-check`, `build` validés après correctifs)
- Stripe backend: endpoints checkout + webhook présents, compilation validée
- Durcissement Supabase serveur: `createAdminClient` exige désormais explicitement `SUPABASE_SERVICE_ROLE_KEY`

---

## 13) Matrice route → données Supabase (référence opérationnelle)

### Auth / Accès
- `/login`
  - Tables lues: `profiles` (rôle, is_active)
  - Auth: `auth.users` (via session)
- `/activate`
  - Tables lues/écrites: `coach_invitations`, `profiles`, `teams`
  - Auth: création/activation compte lié
- `/coach-access`
  - Page informative uniquement (invitation obligatoire)
  - Aucune écriture DB

### Dashboard Core
- `/dashboard`
  - Tables lues: `profiles`, `planning_sessions`, `teams`, `players`
- `/dashboard/acces`
  - Tables lues/écrites: `profiles`, `coach_invitations`, `teams`, `planning_sessions`, `staff_profiles`, `access_admin_events`
- `/dashboard/equipes`
  - Tables lues/écrites: `teams`
- `/dashboard/effectif`
  - Tables lues/écrites: `players`, `teams`, `profiles`
- `/dashboard/joueurs`
  - Tables lues/écrites: `players`, `teams`, `profiles`, `attendance` (lecture ciblée côté vue joueur)
- `/dashboard/planning`
  - Tables lues/écrites: `planning_sessions`, `teams`, `profiles`, `approval_requests`

### Règle d’architecture
- Toute nouvelle page CRM doit déclarer explicitement:
  1) tables lues,
  2) tables écrites,
  3) rôle minimal attendu,
  4) dépendances RLS.

---

## 14) Matrice rôles → permissions métier (version actuelle)

> Référence fonctionnelle UI/produit. Les policies RLS doivent rester alignées.

### `admin`
- Accès complet dashboard
- Gestion accès/utilisateurs (`/dashboard/acces`)
- CRUD équipes, joueurs, planning
- Vision globale toutes équipes

### `coach`
- Accès dashboard
- Accès équipes/joueurs/planning selon périmètre assigné
- Pas de gouvernance accès globale
- Écriture encadrée selon règles métier et policies

### Rôles actifs en production (phase actuelle)
- `admin`
- `coach`

### Statut applicatif (mise à jour 2026-03-07)
- Le code dashboard a été **explicitement aligné** sur ces deux rôles (`admin`, `coach`) pour supprimer l’ambiguïté des `resp_*`.
- Les contrôles de rôle (layout, authz, scope, nav, permissions) rejettent désormais les rôles hors périmètre actif.

### Rôles prévus (future activation, non actifs)
- `resp_pole`
- `resp_sportif`
- `resp_admin`
- `resp_equipements`
- (éventuels modérateurs/admins secondaires)

> Tant que non activés produit, les écrans d’administration n’exposent que `admin` et `coach` pour éviter les ambiguïtés.
> Toute réactivation future des `resp_*` doit passer par un lot dédié: code + RLS + QA + validation PO.

### Contrat d’intégrité rôle
- Source de vérité = `public.profiles.role`
- Interdiction de fallback implicite de rôle en production
- Si profil absent/invalide: redirection contrôlée + message explicite

### Rôles d’équipe (team_staff) — convention GBA
- `coach` : 1 principal max par équipe (`is_primary=true`)
- `assistant` : 0 à 2 par équipe
- `staff` : 0 à 3 par équipe
- Modèle relationnel: many-to-many (`team_staff`) entre `profiles` et `teams`

---

## 15) Checklist QA pré-livraison (obligatoire avant validation humaine)

### A. Qualité technique
- [ ] `npm run lint` OK
- [ ] `npm run type-check` OK
- [ ] `npm run build` OK
- [ ] Aucun warning critique console serveur/client
- [ ] Aucun import mort/fichier orphelin introduit

### B. Qualité fonctionnelle
- [ ] Parcours login/logout testé
- [ ] Rôle affiché cohérent avec `profiles.role`
- [ ] Modules impactés testés manuellement par URL
- [ ] État vide + état nominal testés
- [ ] Messages d’erreur utilisateur compréhensibles

### C. Qualité data / Supabase
- [ ] Pas de mock injecté en DB
- [ ] Pas de changement schéma hors migration SQL
- [ ] Migrations nommées proprement et traçables
- [ ] Vérif RLS sur tables touchées
- [ ] Vérif correspondance `auth.users.id` = `profiles.id`

### D. Validation PO (barrière humaine)
- [ ] URL de test communiquée au PO
- [ ] Retour PO reçu
- [ ] Commit uniquement après message explicite: **« C’est validé »**

---

## 16) TODO stratégique (prochaine phase)

1. **Rotation clés Stripe** (priorité sécurité): régénérer `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET`, puis revalider checkout+webhook.
2. Stabiliser définitivement RBAC/RLS `profiles` + parcours login (alignement strict code↔policies↔données).
3. Finaliser UX d’assignation staff par équipe (rôle + principal) et feedback visuel fin.
4. Assainir `README.md` (actuellement obsolète sur certaines dépendances/modules supprimés).
5. Uniformiser emplacement des migrations (éviter double convention dossier `supabase/` vs `src/lib/supabase/migrations/`).
6. Réduire la dette TypeScript (`as any`) dans la couche dashboard/data sans régression métier.
7. Préparer roadmap CRM v2 (modules à réintégrer proprement, un par un).

---

## 17) Historique de maintenance de ce document

- **2026-02-24** : Création initiale complète (cartographie + standards + état réel).
- **2026-02-24** : Ajout des matrices opérationnelles (route→DB, rôles→permissions) + checklist QA pré-livraison.
- **2026-02-24** : Mise à jour modèle staff M2M (`team_staff`) + clarification rôles actifs (`admin`, `coach`) et sous-rôles équipe (`coach`, `assistant`, `staff`).
- **2026-02-26** : Refonte module unifié `Effectif Club` (fusion effectif/joueurs/équipes), drawer joueur + fiche équipe, filtres visuels, badges mutation, redirections historiques, suppression module Équipes dédié de la navigation.
- **2026-03-02** : Ajout de la fondation Stripe en mode additif (checkout endpoint, webhook endpoint, pages succès/annulation, tables `orders`/`order_items`).
- **2026-03-07** : Correctif de compatibilité Stripe SDK (`apiVersion`), restauration du statut compilable complet (`lint`/`type-check`/`build`), puis nettoyage warnings Prettier restants.
- **2026-03-07** : Durcissement sécurité Supabase serveur: `createAdminClient()` requiert explicitement `SUPABASE_SERVICE_ROLE_KEY` (suppression fallback anon).
- **2026-03-07** : Alignement produit/code sur rôles dashboard actifs `admin` + `coach` (désactivation applicative explicite des `resp_*`).