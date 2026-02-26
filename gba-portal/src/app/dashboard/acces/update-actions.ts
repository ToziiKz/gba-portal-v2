"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/dashboard/authz";
import { log } from "@/lib/logger";

async function requireAdminSupabase() {
  try {
    const { supabase } = await requireRole("admin");
    return supabase;
  } catch {
    redirect(
      "/dashboard/acces?err=" + encodeURIComponent("Accès admin requis"),
    );
  }
}

export async function updateUserProfile(formData: FormData) {
  const supabase = await requireAdminSupabase();

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "coach");
  const hasIsActiveField = formData.has("isActive");
  const isActiveRaw = formData.get("isActive");
  const isActive = hasIsActiveField && String(isActiveRaw) === "on";
  const assignTeamIds = Array.from(formData.keys())
    .filter((k) => k.startsWith("assign_"))
    .map((k) => k.replace("assign_", ""))
    .filter(Boolean);

  if (!userId) {
    redirect("/dashboard/acces?err=" + encodeURIComponent("userId manquant"));
  }

  const { data: updatedRows, error: profErr } = await supabase
    .from("profiles")
    .update({
      role,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id, is_active")
    .limit(1);

  if (profErr) {
    log.error("Profile update failed:", profErr);
    redirect("/dashboard/acces?err=" + encodeURIComponent(profErr.message));
  }

  if (!updatedRows || updatedRows.length === 0) {
    redirect(
      "/dashboard/acces?err=" +
        encodeURIComponent(
          "Aucun profil mis à jour (RLS ou user introuvable).",
        ),
    );
  }

  // M2M assignment source of truth
  const { error: clearAssignErr } = await supabase
    .from("team_staff")
    .delete()
    .eq("profile_id", userId);

  if (clearAssignErr) {
    log.error("Clear team_staff failed:", clearAssignErr);
    redirect(
      "/dashboard/acces?err=" + encodeURIComponent(clearAssignErr.message),
    );
  }

  if (role === "coach" && assignTeamIds.length > 0) {
    const rows = assignTeamIds.map((teamId) => {
      const rawRole = String(formData.get(`role_${teamId}`) ?? "assistant");
      const roleInTeam = ["coach", "assistant", "staff"].includes(rawRole)
        ? rawRole
        : "assistant";
      const isPrimary = formData.get(`primary_${teamId}`) === "on";

      return {
        team_id: teamId,
        profile_id: userId,
        role_in_team: roleInTeam,
        is_primary: isPrimary,
      };
    });

    const { error: insAssignErr } = await supabase
      .from("team_staff")
      .insert(rows);
    if (insAssignErr) {
      log.error("Insert team_staff failed:", insAssignErr);
      redirect(
        "/dashboard/acces?err=" + encodeURIComponent(insAssignErr.message),
      );
    }
  }

  revalidatePath("/dashboard/acces");
  redirect(`/dashboard/acces?ok=1&user=${encodeURIComponent(userId)}`);
}

export async function deleteUserProfile(formData: FormData) {
  const supabase = await requireAdminSupabase();
  const userId = String(formData.get("userId") ?? "");

  if (!userId) {
    redirect("/dashboard/acces?err=" + encodeURIComponent("userId manquant"));
  }

  const { error } = await supabase.rpc("admin_hard_delete_user", {
    p_target_user_id: userId,
  });

  if (error) {
    log.error("Hard delete error:", error);
    redirect(
      "/dashboard/acces?err=" +
        encodeURIComponent(error.message || "Suppression impossible"),
    );
  }

  revalidatePath("/dashboard/acces");
  redirect("/dashboard/acces?ok=1");
}
