"use server";

import { createHash } from "crypto";

import { createClient } from "@/lib/supabase/server";

export async function activateCoachAccount(
  _prevState: unknown,
  formData: FormData,
) {
  const invitationId = String(formData.get("invitationId") ?? "");
  const token = String(formData.get("token") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!invitationId || !token || !fullName || !password) {
    return { ok: false as const, error: "Informations incomplètes." };
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

  const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
    email: inv.email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (signUpErr || !signUp.user) {
    return {
      ok: false as const,
      error: signUpErr?.message || "Impossible de créer le compte.",
    };
  }

  const usedAt = new Date().toISOString();

  const { data: claimedInvite, error: markUsedErr } = await supabase
    .from("coach_invitations")
    .update({ used_at: usedAt, used_by: signUp.user.id })
    .eq("id", inv.id)
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("id")
    .maybeSingle();

  if (markUsedErr || !claimedInvite) {
    return {
      ok: false as const,
      error:
        "Compte créé mais le lien n’est plus valide (déjà utilisé ou expiré). Contactez un admin.",
    };
  }

  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ full_name: fullName, role: inv.role })
    .eq("id", signUp.user.id);

  if (profileErr) {
    return {
      ok: false as const,
      error: "Compte créé mais rôle non appliqué.",
    };
  }

  // 3. Auto-assignation des équipes si renseignées dans l'invitation
  if (inv.target_team_ids && inv.target_team_ids.length > 0) {
    await supabase
      .from("teams")
      .update({ coach_id: signUp.user.id })
      .in("id", inv.target_team_ids);
  }

  return { ok: true as const };
}
