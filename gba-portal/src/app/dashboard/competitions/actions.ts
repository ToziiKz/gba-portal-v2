"use server";

import { requireRole } from "@/lib/dashboard/authz";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { log } from "@/lib/logger";

export type Competition = {
  id: string;
  category: string;
  team_home: string;
  team_away: string;
  score_home: number;
  score_away: number;
  match_date: string;
  created_at: string;
};

export async function getCompetitions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("competitions")
    .select("*")
    .order("match_date", { ascending: false });

  if (error) {
    log.error("Error fetching competitions:", error);
    return [];
  }
  return data as Competition[];
}

export async function createCompetition(formData: FormData) {
  const { supabase } = await requireRole("resp_sportif");

  const category = formData.get("category") as string;
  const team_home = formData.get("team_home") as string;
  const team_away = formData.get("team_away") as string;
  const match_date = formData.get("match_date") as string;
  const score_home = parseInt((formData.get("score_home") as string) || "0");
  const score_away = parseInt((formData.get("score_away") as string) || "0");

  const { error } = await supabase.from("competitions").insert({
    category,
    team_home,
    team_away,
    score_home,
    score_away,
    match_date,
  });

  if (error) {
    log.error("Error creating competition:", error);
    throw new Error("Failed to create competition");
  }

  revalidatePath("/dashboard/competitions");
}

export async function deleteCompetition(id: string) {
  const { supabase } = await requireRole("resp_sportif");
  const { error } = await supabase.from("competitions").delete().eq("id", id);

  if (error) {
    log.error("Error deleting competition:", error);
    throw new Error("Failed to delete competition");
  }
  revalidatePath("/dashboard/competitions");
}
