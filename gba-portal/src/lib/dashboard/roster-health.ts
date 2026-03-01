import { createClient } from "@/lib/supabase/server";
import { getDashboardScope } from "@/lib/dashboard/getDashboardScope";
import { log } from "@/lib/logger";

export type PlayerHealthInfo = {
  id: string;
  first_name: string;
  last_name: string;
  team_id: string | null;
};

export async function getCoachRosterHealth() {
  const supabase = await createClient();
  const scope = await getDashboardScope();

  const allowedRoles = new Set(["coach", "admin", "resp_sportif", "resp_pole"]);
  if (!allowedRoles.has(scope.role)) {
    return { players: [], stats: null };
  }

  let query = supabase
    .from("players")
    .select("player_uid, license, firstname, lastname, team_id");

  if (scope.viewableTeamIds) {
    if (scope.viewableTeamIds.length > 0) {
      query = query.in("team_id", scope.viewableTeamIds);
    } else {
      query = query.eq("team_id", "00000000-0000-0000-0000-000000000000");
    }
  }

  const { data: players, error } = await query.order("lastname");

  if (error) {
    log.error("Error fetching roster health:", error);
    return { players: [], stats: null };
  }

  const playerList = (players ?? []) as Array<{
    player_uid: string | null;
    license: string | number | null;
    firstname: string;
    lastname: string;
    team_id: string | null;
  }>;

  return {
    players: playerList.map((p, idx) => ({
      id:
        p.player_uid ??
        `${String(p.license ?? "no-lic")}-${p.lastname}-${p.firstname}-${idx}`,
      first_name: p.firstname,
      last_name: p.lastname,
      team_id: p.team_id,
    })) as PlayerHealthInfo[],
    stats: {
      total: playerList.length,
    },
  };
}
