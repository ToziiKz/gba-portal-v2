import { createClient } from "@/lib/supabase/server";
import { getDashboardScope } from "@/lib/dashboard/getDashboardScope";
import { log } from "@/lib/logger";

/**
 * Module "Santé Équipe" pour le Coach
 * Extrait les infos critiques : administratif, logistique, éligibilité.
 */

export type PlayerHealthInfo = {
  id: string;
  first_name: string;
  last_name: string;
  team_id: string | null;
  licence_status: "valid" | "pending" | "missing" | "expired";
  payment_status: "paid" | "partial" | "unpaid";
  equipment_status: "received" | "partial" | "pending";
  size_label?: string | null; // On l'ajoutera via metadata ou colonne si nécessaire
};

export async function getCoachRosterHealth() {
  const supabase = await createClient();
  const scope = await getDashboardScope();

  const allowedRoles = new Set(["coach", "admin", "resp_sportif", "resp_pole"]);

  if (!allowedRoles.has(scope.role)) {
    return { players: [], stats: null };
  }

  let query = supabase.from("players").select(`
    id,
    firstname,
    lastname,
    team_id,
    licence_status,
    payment_status,
    equipment_status
  `);

  // Coach/Resp Pole restricted scope
  if (scope.viewableTeamIds) {
    if (scope.viewableTeamIds.length > 0) {
      query = query.in("team_id", scope.viewableTeamIds);
    } else {
      // Impossible UUID

      query = query.eq("team_id", "00000000-0000-0000-0000-000000000000");
    }
  }

  const { data: players, error } = await query.order("lastname");

  if (error) {
    log.error("Error fetching roster health:", error);
    return { players: [], stats: null };
  }

  const playerList = (players ?? []) as any[];

  const stats = {
    total: playerList.length,
    ready: playerList.filter(
      (p) => p.licence_status === "valid" && p.payment_status === "paid",
    ).length,
    pendingEquipment: playerList.filter(
      (p) => p.equipment_status !== "received",
    ).length,
    unpaid: playerList.filter((p) => p.payment_status === "unpaid").length,
  };

  return {
    players: playerList.map((p) => ({
      ...p,
      first_name: p.firstname,
      last_name: p.lastname,
    })) as PlayerHealthInfo[],
    stats,
  };
}
