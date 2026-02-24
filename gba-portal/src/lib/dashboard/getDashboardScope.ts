import { createClient } from "@/lib/supabase/server";
import type { DashboardRole } from "@/lib/dashboardRole";

export type DashboardScope = {
  role: DashboardRole;
  viewableTeamIds: string[] | null; // null means ALL (global access)
  editableTeamIds: string[] | null; // null means ALL (global edit)
  assignedTeams: { id: string; name: string; category: string }[];
  viewablePoles: string[] | null; // null means ALL
};

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

  // 1. Global Roles
  if (
    rawRole === "admin" ||
    rawRole === "resp_sportif" ||
    rawRole === "resp_equipements"
  ) {
    return {
      role: rawRole,
      viewableTeamIds: null,
      editableTeamIds: null, // Admin edits everything
      assignedTeams: [], // Global scope doesn't need specific assignment list usually
      viewablePoles: null,
    };
  }

  // 2. Resp Pole
  if (rawRole === "resp_pole") {
    let poleTeams: { id: string; name: string; category: string }[] = [];
    if (poleScope) {
      const { data } = await supabase
        .from("teams")
        .select("id, name, category")
        .eq("pole", poleScope);
      poleTeams = (data ?? []).map((t) => ({
        id: String(t.id),
        name: t.name,
        category: t.category,
      }));
    }
    const ids = poleTeams.map((t) => t.id);
    return {
      role: "resp_pole",
      viewableTeamIds: ids,
      editableTeamIds: ids, // Can edit their pole
      assignedTeams: poleTeams,
      viewablePoles: poleScope ? [poleScope] : [],
    };
  }

  // 3. Coach
  let teamIds: string[] = [];
  let assignedTeams: { id: string; name: string; category: string }[] = [];

  // Direct assignment
  const { data: directTeams } = await supabase
    .from("teams")
    .select("id, name, category")
    .eq("coach_id", user.id);

  if (directTeams) {
    assignedTeams = [
      ...assignedTeams,
      ...directTeams.map((t) => ({
        id: String(t.id),
        name: t.name,
        category: t.category,
      })),
    ];
    teamIds = [...teamIds, ...directTeams.map((t) => String(t.id))];
  }

  // Pole assignment (optional for coach)
  if (poleScope) {
    const { data: poleTeams } = await supabase
      .from("teams")
      .select("id, name, category")
      .eq("pole", poleScope);

    if (poleTeams) {
      // Avoid duplicates
      const newTeams = poleTeams.filter(
        (pt) => !teamIds.includes(String(pt.id)),
      );
      assignedTeams = [
        ...assignedTeams,
        ...newTeams.map((t) => ({
          id: String(t.id),
          name: t.name,
          category: t.category,
        })),
      ];
      teamIds = [...teamIds, ...newTeams.map((t) => String(t.id))];
    }
  }

  return {
    role: "coach",
    viewableTeamIds: teamIds,
    editableTeamIds: teamIds, // Can edit what they see (or subset, but for now same)
    assignedTeams: assignedTeams,
    viewablePoles: poleScope ? [poleScope] : [],
  };
}
