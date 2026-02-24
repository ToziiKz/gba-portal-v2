# RBAC V1 — Version visuelle (sans tableau)

## Rôles finaux

- **admin**
- **resp_sportif**
- **resp_pole**
- **coach** _(adjoint inclus dans coach)_
- **dirigeant**
- **resp_administratif**
- **resp_equipements**

## Légende

- **read** = voir
- **write** = créer / modifier
- **approve** = valider / rejeter
- **admin** = contrôle total
- **team / pole / global** = portée des droits

---

## 1) admin (global)

- Tous les modules en **admin**.

## 2) resp_sportif (global)

- planning: **write**
- presences: **read**
- convocations: **read**
- tactique: **read**
- effectif + joueurs: **read + write + approve**
- licences_admin: **read + write + approve**
- validations: **approve**
- rapports: **read**

## 3) resp_pole (pole)

- planning: **write**
- presences: **read**
- convocations: **read**
- tactique: **read**
- effectif + joueurs: **read + write + approve**
- validations: **approve**
- rapports: **read**

## 4) coach (team)

- planning: **write**
- presences: **write**
- convocations: **write**
- tactique: **write**
- effectif + joueurs: **write** _(soumis à approbation hiérarchique)_

## 5) dirigeant (team)

- presences: **write**
- convocations: **write**
- effectif/joueurs: **read**
- planning/tactique: **read**

## 6) resp_administratif (global)

- licences_admin: **approve + write**
- acces_permissions: **write**
- invitations_activation: **write**
- effectif/joueurs: **write**
- validations: **approve**
- rapports: **read**

## 7) resp_equipements (global)

- equipements_stock: **write**
- effectif/joueurs: **read**
- rapports: **read**

---

## Hiérarchie et validation (important)

Hiérarchie métier:

- `resp_sportif` > `resp_pole` > `coach`

Règle demandée:

- Un `resp_pole` peut appliquer directement une décision d'effectif/joueurs.
- `resp_sportif` est toujours notifié.
- `resp_sportif` peut **révoquer / override** la décision du `resp_pole`.
- Si pas d'override, la décision du `resp_pole` reste valide.

`approve` inclut toujours `read`, mais n'inclut pas automatiquement `write`.
