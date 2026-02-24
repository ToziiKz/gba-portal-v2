"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getDashboardScope } from "@/lib/dashboard/getDashboardScope";

function dayFromIso(
  dateStr: string,
): "Lun" | "Mar" | "Mer" | "Jeu" | "Ven" | "Sam" | "Dim" {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay();
  const map = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"] as const;
  return map[day];
}

function poleFromTeamCategory(category?: string | null): string {
  const cat = String(category ?? "").toUpperCase();
  if (
    cat.includes("U6") ||
    cat.includes("U7") ||
    cat.includes("U8") ||
    cat.includes("U9")
  )
    return "École de foot";
  if (cat.includes("U11") || cat.includes("U13")) return "Pré-formation";
  if (cat.includes("FÉM") || cat.includes("FEM")) return "Féminines";
  if (cat.includes("SENIOR")) return "Séniors";
  if (cat.includes("VÉT")) return "Vétérans";
  return "Formation";
}

function eventTag(eventType: string) {
  if (eventType === "match_amical") return "[MATCH AMICAL]";
  if (eventType === "match_championnat") return "[MATCH CHAMPIONNAT]";
  if (eventType === "match_coupe") return "[MATCH COUPE]";
  if (eventType === "plateau") return "[PLATEAU]";
  if (eventType === "competition") return "[COMPETITION]";
  if (eventType === "event") return "[EVENT]";
  return "[TRAINING]";
}

const createSchema = z.object({
  teamId: z.string().uuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  eventType: z.enum([
    "training",
    "match_amical",
    "match_championnat",
    "match_coupe",
    "plateau",
    "competition",
    "event",
  ]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string().min(2),
  staff: z.string().optional(),
  note: z.string().optional(),
});

export async function createPlanningSession(
  prevState: unknown,
  formData: FormData,
) {
  const supabase = await createClient();

  const raw = {
    teamId: formData.get("teamId"),
    sessionDate: formData.get("sessionDate"),
    eventType: formData.get("eventType"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    location: formData.get("location"),
    staff: formData.get("staff") ?? undefined,
    note: formData.get("note") ?? undefined,
  };

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) return { message: "Données invalides" };

  const staffList = (parsed.data.staff ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { message: "Non authentifié" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (profile?.is_active === false) return { message: "Compte suspendu" };

  if (profile?.role === "coach") {
    const scope = await getDashboardScope();
    if (!(scope.editableTeamIds ?? []).includes(parsed.data.teamId)) {
      return {
        message: "Vous ne pouvez créer une séance que pour vos équipes.",
      };
    }
  }

  const { data: teamMeta } = await supabase
    .from("teams")
    .select("category")
    .eq("id", parsed.data.teamId)
    .single();

  const derivedPole =
    parsed.data.eventType === "event"
      ? "Évènements"
      : poleFromTeamCategory(teamMeta?.category);
  const tag = eventTag(parsed.data.eventType);

  const payload = {
    team_id: parsed.data.teamId,
    day: dayFromIso(parsed.data.sessionDate),
    session_date: parsed.data.sessionDate,
    pole: derivedPole,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
    location: `${formData.get("site")} - ${parsed.data.location}`,
    staff: staffList,
    note: `${tag}${parsed.data.note ? ` ${parsed.data.note}` : ""}`,
  };

  if (profile?.role === "admin") {
    let { error } = await supabase.from("planning_sessions").insert([payload]);

    // Backward compatibility if session_date column is not yet deployed in DB
    if (
      error &&
      (error.message?.includes("session_date") || error.code === "PGRST204")
    ) {
      const legacyPayload = Object.fromEntries(
        Object.entries(payload).filter(([key]) => key !== "session_date"),
      );
      const retry = await supabase
        .from("planning_sessions")
        .insert([legacyPayload]);
      error = retry.error;
    }

    if (error) return { message: `Erreur création séance: ${error.message}` };
    revalidatePath("/dashboard/planning");
    return { success: true };
  }

  const { error } = await supabase.from("approval_requests").insert([
    {
      requested_by: user.id,
      action: "planning_sessions.create",
      entity: "planning_sessions",
      payload,
    },
  ]);

  if (error) return { message: "Erreur demande validation" };

  revalidatePath("/dashboard/validations");
  return { success: true };
}

export async function deletePlanningSession(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("ID manquant");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (profile?.is_active === false) throw new Error("Compte suspendu");

  if (profile?.role === "coach") {
    const { data: session } = await supabase
      .from("planning_sessions")
      .select("team_id")
      .eq("id", id)
      .single();

    if (!session?.team_id) throw new Error("Séance introuvable");

    const scope = await getDashboardScope();
    if (!(scope.editableTeamIds ?? []).includes(String(session.team_id))) {
      throw new Error(
        "Vous ne pouvez pas supprimer une séance hors de vos équipes",
      );
    }
  }

  if (profile?.role === "admin") {
    const { error } = await supabase
      .from("planning_sessions")
      .delete()
      .eq("id", id);
    if (error) throw new Error("Erreur suppression séance");
    revalidatePath("/dashboard/planning");
    return;
  }

  const { error } = await supabase.from("approval_requests").insert([
    {
      requested_by: user.id,
      action: "planning_sessions.delete",
      entity: "planning_sessions",
      payload: { id },
    },
  ]);

  if (error) throw new Error("Erreur demande validation");

  revalidatePath("/dashboard/validations");
  return;
}
