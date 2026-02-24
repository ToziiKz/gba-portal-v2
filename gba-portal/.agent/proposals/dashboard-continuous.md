# Dashboard continuous improvement — Stock

## Module

- `stock`

## Changement

- Activation de l’export CSV (client-side) sur la liste **filtrée** (séparateur `;`, échappement basique RFC4180).
- Bouton désactivé tant que chargement + quand aucune ligne.
- Toast de confirmation après téléchargement.

## Fichiers modifiés

- `src/app/dashboard/stock/page.tsx`
- `.agent/state/dashboard-rotation.json`

## À tester

1. Aller sur `/dashboard/stock`.
2. Appliquer des filtres (pôle/lieu/type) + recherche.
3. Cliquer **Export CSV** → vérifier téléchargement `gba-stock-YYYY-MM-DD.csv`.
4. Ouvrir le CSV → vérifier colonnes: `label, sku, qty, minQty, pole, location, kind, updatedAt`.
5. Vérifier que le bouton est désactivé quand la liste est vide.
