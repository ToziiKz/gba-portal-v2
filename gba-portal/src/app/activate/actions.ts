"use server";

import { createHash } from "crypto";

import { createClient } from "@/lib/supabase/server";

export async function activateCoachAccount(
  _prevState: unknown,
  formData: FormData,
) {
  const invitationId = String(formData.get("invitationId") ?? "");
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!invitationId || !token || !password || !confirmPassword) {
    return { ok: false as const, error: "Informations incomplètes." };
  }

  if (password !== confirmPassword) {
    return {
      ok: false as const,
      error: "Les mots de passe ne correspondent pas.",
    };
  }

  if (password.length < 8) {
    return {
      ok: false as const,
      error: "Le mot de passe doit contenir au moins 8 caractères.",
    };
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const supabase = await createClient();

  const { data: inv, error: invErr } = await supabase
    .from("coach_invitations")
    .select("*")
    .eq("id", invitationId)
    .eq("token_hash", tokenHash)
    .single();

  if (invErr || !inv) {
    return { ok: false as const, error: "Lien invalide." };
  }

  if (inv.used_at) {
    return { ok: false as const, error: "Ce lien a déjà été utilisé." };
  }

  if (new Date(inv.expires_at).getTime() < Date.now()) {
    return {
      ok: false as const,
      error: "Lien expiré. Demandez une nouvelle invitation.",
    };
  }

  const invitationFullName = String(inv.full_name ?? "").trim();

  // Idempotent flow to avoid repeated signUp email limits:
  // 1) try sign-in first (existing account)
  // 2) fallback to sign-up only if account does not exist yet
  let newUserId: string | null = null;

  const { data: signInData, error: signInErr } =
    await supabase.auth.signInWithPassword({
      email: inv.email,
      password,
    });

  if (!signInErr && signInData.user) {
    newUserId = signInData.user.id;
  } else {
    const msg = String(signInErr?.message ?? "").toLowerCase();
    const accountMissing =
      msg.includes("invalid login credentials") ||
      msg.includes("email not confirmed") ||
      msg.includes("user not found") ||
      msg.includes("invalid_credentials");

    if (!accountMissing) {
      return {
        ok: false as const,
        error:
          "Compte existant détecté mais mot de passe incorrect. Utilisez le bon mot de passe ou demandez une nouvelle invitation.",
      };
    }

    const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
      email: inv.email,
      password,
      options: {
        data: { full_name: invitationFullName },
      },
    });

    if (signUpErr || !signUp.user) {
      return {
        ok: false as const,
        error: signUpErr?.message || "Impossible de créer le compte.",
      };
    }

    newUserId = signUp.user.id;
  }

  const { error: finalizeErr } = await supabase.rpc(
    "finalize_invitation_activation",
    {
      p_invitation_id: inv.id,
      p_token_hash: tokenHash,
      p_user_id: newUserId,
      p_full_name: invitationFullName,
    },
  );

  if (finalizeErr) {
    const msg = String(finalizeErr.message ?? "");
    if (
      msg.includes("finalize_invitation_activation") ||
      msg.includes("PGRST")
    ) {
      return {
        ok: false as const,
        error:
          "Compte créé mais finalisation non configurée sur cette base (fonction SQL manquante). Contactez un admin.",
      };
    }

    return {
      ok: false as const,
      error: `Compte créé mais finalisation invitation impossible: ${msg}`,
    };
  }

  return { ok: true as const };
}
