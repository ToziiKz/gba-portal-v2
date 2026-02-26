-- Phase 1 hardening: remove broad anon table access, use RPC preview, tighten function grants.

-- 1) Remove broad anon access on invitations table
DROP POLICY IF EXISTS "coach_invitations anon activation read" ON public.coach_invitations;
DROP POLICY IF EXISTS "coach_invitations anon activation update" ON public.coach_invitations;

-- 2) Invitation preview RPC (token-gated)
CREATE OR REPLACE FUNCTION public.get_invitation_activation_preview(
  p_invitation_id uuid,
  p_token_hash text
)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  target_team_ids uuid[],
  expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ci.id, ci.full_name, ci.email, ci.target_team_ids, ci.expires_at
  FROM public.coach_invitations ci
  WHERE ci.id = p_invitation_id
    AND ci.token_hash = p_token_hash
    AND ci.used_at IS NULL
    AND ci.expires_at > now()
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_invitation_activation_preview(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_invitation_activation_preview(uuid, text) TO anon, authenticated;

-- 3) Tighten hard-delete RPC: no anonymous execute
REVOKE EXECUTE ON FUNCTION public.admin_hard_delete_user(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_hard_delete_user(uuid) TO authenticated;
