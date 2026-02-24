# Invitation → Activation Flow

## 1) Création invitation (admin)

- Module: `/dashboard/acces`
- Action: `createDirectInvitation`
- Génère:
  - `invitationId`
  - `token` (hashé côté DB)
  - URL d'activation

## 2) Pré-assignation équipes

- Les équipes cibles sont stockées sur l'invitation (`target_team_ids`).

## 3) Activation publique

- Page: `/activate?inv=...&token=...`
- Vérifications:
  - token valide
  - non utilisé
  - non expiré

## 4) Claim sécurisé

- Marquage `used_at/used_by` avec contraintes strictes
  - même id
  - même token hash
  - `used_at is null`
  - `expires_at > now`

## 5) Provisioning profil

- Création/MAJ du `profiles` avec rôle attendu.
- Assignation équipes via logique serveur atomique.

## 6) Opérations atomiques

- RPC SQL: `admin_update_profile_and_teams`
- But: éviter les états partiels profil/équipes.
