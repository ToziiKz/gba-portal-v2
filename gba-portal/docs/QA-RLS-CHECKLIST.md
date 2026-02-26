# QA RLS Checklist — GBA Portal

## Profiles policies
- profiles self read (SELECT, authenticated)
- profiles admin read all (SELECT, authenticated)
- profiles admin write all (UPDATE, authenticated)

## Coach invitations policies
- coach_invitations admin read (SELECT, authenticated)
- coach_invitations admin write (ALL, authenticated)
- No anon policy on `coach_invitations`

## RPC permissions
- `admin_hard_delete_user(uuid)` executable by authenticated only (not anon)
- `get_invitation_activation_preview(uuid,text)` executable by anon + authenticated
- `finalize_invitation_activation(uuid,text,uuid,text)` executable by anon + authenticated

## Functional smoke tests
1. Admin can access `/dashboard/acces` and manage invites.
2. Coach cannot access `/dashboard/acces` (redirect to `/dashboard`).
3. Invitation activation creates/updates profile + team_staff.
4. Hard delete removes profile + team_staff + auth user.

## Build gates
- `npm run lint`
- `npm run type-check`
- `npm run build`
