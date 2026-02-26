"use server";

import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/dashboard/authz";
import { log } from "@/lib/logger";

async function requireAdmin() {
  try {
    const { supabase, user } = await requireRole("admin");
    return { supabase, user };
  } catch {
    redirect(
      "/dashboard/acces?err=" + encodeURIComponent("Accès admin requis"),
    );
  }
}

function buildInviteUrl(invitationId: string, token: string) {
  const configuredBase =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  const base = configuredBase || "http://localhost:3000";
  return `${base}/activate?inv=${invitationId}&token=${token}`;
}

async function logAccessEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  meta?: Record<string, unknown>,
) {
  // Optional audit trail: invitation flow must not fail if audit table is absent.
  const { error } = await supabase.from("access_admin_events").insert([
    {
      actor_id: actorId,
      action,
      target_type: targetType,
      target_id: targetId,
      meta: meta ?? {},
    },
  ]);

  if (error) {
    log.warn("Audit event skipped (access_admin_events unavailable):", error);
  }
}

// Invitation-only workflow (coach_access_requests disabled)
export async function createDirectInvitation(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "coach");
  const role = roleRaw === "admin" ? "admin" : "coach";
  const targetTeamIds = formData
    .getAll("targetTeamIds")
    .map((id) => String(id))
    .filter(Boolean);

  if (!email || !fullName) {
    throw new Error("Email et Nom complet sont obligatoires.");
  }

  const token = randomBytes(24).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

  // Expire previous pending invites for same email to avoid duplicate conflicts
  await supabase
    .from("coach_invitations")
    .update({ expires_at: new Date().toISOString() })
    .eq("email", email)
    .is("used_at", null);

  const { data: inv, error: invErr } = await supabase
    .from("coach_invitations")
    .insert([
      {
        email,
        full_name: fullName,
        role,
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_by: user.id,
        target_team_ids: targetTeamIds,
      },
    ])
    .select("id")
    .single();

  if (invErr || !inv) {
    log.error("Insert error:", invErr);
    redirect(
      "/dashboard/acces?err=" +
        encodeURIComponent(
          invErr?.message || "Impossible de créer l’invitation.",
        ),
    );
  }

  await logAccessEvent(
    supabase,
    user.id,
    "invitation.create_direct",
    "coach_invitation",
    inv.id,
    {
      email,
      role,
    },
  );

  revalidatePath("/dashboard/acces");

  const inviteUrl = buildInviteUrl(inv.id, token);
  redirect(`/dashboard/acces?invite=${encodeURIComponent(inviteUrl)}`);
}

export async function regenerateCoachInvitation(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const invitationId = String(formData.get("invitationId") ?? "");
  if (!invitationId) throw new Error("invitationId manquant");

  const { data: inv, error: invErr } = await supabase
    .from("coach_invitations")
    .select("id")
    .eq("id", invitationId)
    .single();

  if (invErr || !inv) throw new Error("Invitation introuvable");

  const token = randomBytes(24).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

  const { error: updErr } = await supabase
    .from("coach_invitations")
    .update({
      token_hash: tokenHash,
      expires_at: expiresAt,
      used_at: null,
      used_by: null,
    })
    .eq("id", inv.id);

  if (updErr) throw new Error("Impossible de régénérer l’invitation");

  await logAccessEvent(
    supabase,
    user.id,
    "invitation.regenerate",
    "coach_invitation",
    inv.id,
  );

  revalidatePath("/dashboard/acces");

  const inviteUrl = buildInviteUrl(inv.id, token);
  redirect(`/dashboard/acces?invite=${encodeURIComponent(inviteUrl)}`);
}

export async function setCoachActiveState(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const coachId = String(formData.get("coachId") ?? "");
  const active = String(formData.get("active") ?? "") === "1";

  if (!coachId) throw new Error("coachId manquant");

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: active })
    .eq("id", coachId)
    .eq("role", "coach");

  if (error) throw new Error("Impossible de changer l’état du coach");

  await logAccessEvent(
    supabase,
    user.id,
    active ? "coach.activate" : "coach.suspend",
    "profile",
    coachId,
  );
  revalidatePath("/dashboard/acces");
}

export async function setCoachTeams(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const coachId = String(formData.get("coachId") ?? "");
  const teamIds = formData
    .getAll("teamIds")
    .map((v) => String(v))
    .filter(Boolean);

  if (!coachId) throw new Error("coachId manquant");

  const { error: clearErr } = await supabase
    .from("team_staff")
    .delete()
    .eq("profile_id", coachId);

  if (clearErr) {
    throw new Error(
      "Impossible de réinitialiser les affectations coach: " + clearErr.message,
    );
  }

  if (teamIds.length > 0) {
    const rows = teamIds.map((teamId, index) => ({
      team_id: teamId,
      profile_id: coachId,
      role_in_team: index === 0 ? "coach" : "assistant",
      is_primary: index === 0,
    }));

    const { error: insErr } = await supabase.from("team_staff").insert(rows);

    if (insErr) {
      throw new Error(
        "Impossible d’affecter les équipes coach: " + insErr.message,
      );
    }
  }

  await logAccessEvent(
    supabase,
    user.id,
    "coach.assign_teams",
    "profile",
    coachId,
    {
      teamIds,
      count: teamIds.length,
    },
  );

  revalidatePath("/dashboard/acces");
}

export async function deleteCoachInvitation(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const invitationId = String(formData.get("invitationId") ?? "");
  if (!invitationId) {
    redirect(
      "/dashboard/acces?err=" + encodeURIComponent("invitationId manquant"),
    );
  }

  const { error } = await supabase
    .from("coach_invitations")
    .delete()
    .eq("id", invitationId);

  if (error) {
    redirect(
      "/dashboard/acces?err=" +
        encodeURIComponent(error.message || "Suppression impossible"),
    );
  }

  await logAccessEvent(
    supabase,
    user.id,
    "invitation.delete",
    "coach_invitation",
    invitationId,
  );

  revalidatePath("/dashboard/acces");
  redirect("/dashboard/acces?ok=1");
}
