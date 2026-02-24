import { createClient } from "@/lib/supabase/server";
import type { DashboardRole } from "@/lib/dashboardRole";

export type DashboardScope = {
  role: DashboardRole;
  viewableTeamIds: string[] | null;
  editableTeamIds: string[] | null;
  assignedTeams: { id: string; name: string; category: string }[];
  viewablePoles: string[] | null;
};

type TeamLite = { id: string; name: string; category: string };

async function getCoachTeamsFromPivot(
  userId: string,
): Promise<TeamLite[] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_staff")
    .select("team:team_id(id, name, category)")
    .eq("profile_id", userId);

  if (error) return null;

  return (data ?? [])
    .map((row) =>
      Array.isArray((row as any).team)
        ? (row as any).team[0]
        : (row as any).team,
    )
    .filter(Boolean)
    .map((t: any) => ({
      id: String(t.id),
      name: String(t.name ?? ""),
      category: String(t.category ?? ""),
    }));
}

async function getCoachTeamsFromLegacyCoachId(
  userId: string,
): Promise<TeamLite[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("teams")
    .select("id, name, category")
    .eq("coach_id", userId);

  return (data ?? []).map((t) => ({
    id: String(t.id),
    name: String(t.name ?? ""),
    category: String(t.category ?? ""),
  }));
}

export async function getDashboardScope(): Promise<DashboardScope> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      role: "coach",
      viewableTeamIds: [],
      editableTeamIds: [],
      assignedTeams: [],
      viewablePoles: [],
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active, pole_scope")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_active === false) {
    return {
      role: "coach",
      viewableTeamIds: [],
      editableTeamIds: [],
      assignedTeams: [],
      viewablePoles: [],
    };
  }

  const rawRole = String(profile.role ?? "").trim() as DashboardRole;
  const poleScope = profile.pole_scope
    ? String(profile.pole_scope).trim()
    : null;

  if (
    rawRole === "admin" ||
    rawRole === "resp_sportif" ||
    rawRole === "resp_equipements"
  ) {
    return {
      role: rawRole,
      viewableTeamIds: null,
      editableTeamIds: null,
      assignedTeams: [],
      viewablePoles: null,
    };
  }

  if (rawRole === "resp_pole") {
    let poleTeams: TeamLite[] = [];
    if (poleScope) {
      const { data } = await supabase
        .from("teams")
        .select("id, name, category")
        .eq("pole", poleScope);
      poleTeams = (data ?? []).map((t) => ({
        id: String(t.id),
        name: String(t.name ?? ""),
        category: String(t.category ?? ""),
      }));
    }
    const ids = poleTeams.map((t) => t.id);
    return {
      role: "resp_pole",
      viewableTeamIds: ids,
      editableTeamIds: ids,
      assignedTeams: poleTeams,
      viewablePoles: poleScope ? [poleScope] : [],
    };
  }

  // Coach scope (M2M first, fallback legacy coach_id)
  const pivotTeams = await getCoachTeamsFromPivot(user.id);
  let assignedTeams = pivotTeams ?? [];

  if (!pivotTeams) {
    assignedTeams = await getCoachTeamsFromLegacyCoachId(user.id);
  }

  let teamIds = [...new Set(assignedTeams.map((t) => t.id))];

  if (poleScope) {
    const { data: poleTeams } = await supabase
      .from("teams")
      .select("id, name, category")
      .eq("pole", poleScope);

    if (poleTeams) {
      const newTeams = poleTeams
        .map((t) => ({
          id: String(t.id),
          name: String(t.name ?? ""),
          category: String(t.category ?? ""),
        }))
        .filter((pt) => !teamIds.includes(pt.id));
      assignedTeams = [...assignedTeams, ...newTeams];
      teamIds = [...teamIds, ...newTeams.map((t) => t.id)];
    }
  }

  return {
    role: "coach",
    viewableTeamIds: teamIds,
    editableTeamIds: teamIds,
    assignedTeams,
    viewablePoles: poleScope ? [poleScope] : [],
  };
}
