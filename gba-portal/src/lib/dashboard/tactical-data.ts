import { createClient } from "@/lib/supabase/client";

type Team = {
  id: string;
  name: string;
  category: string;
  pole?: string | null;
};

type PlayerDb = {
  id: string;
  firstname: string | null;
  lastname: string | null;
  category: string | null;
};

export async function fetchVisibleTacticalTeams(includePoleTeams: boolean) {
  const supabase = createClient();

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) {
    return { isCoach: false, teams: [] as Team[] };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  const rawRole = String(profile?.role ?? "")
    .trim()
    .toLowerCase();

  const isAdminOrStaff = rawRole === "admin" || rawRole === "staff";
  const isCoachLike = rawRole === "coach";

  if (isAdminOrStaff) {
    const { data } = await supabase
      .from("teams")
      .select("id, name, category, pole")
      .order("name");
    return { isCoach: false, teams: (data ?? []) as Team[] };
  }

  if (!isCoachLike) {
    return { isCoach: false, teams: [] as Team[] };
  }

  const { data: ownTeamsData } = await supabase
    .from("teams")
    .select("id, name, category, pole")
    .eq("coach_id", userId)
    .order("name");

  const ownTeams = (ownTeamsData ?? []) as Team[];

  const { data: scopes } = await supabase
    .from("user_scopes")
    .select("scope_type, team_id, pole")
    .eq("user_id", userId);

  const scopeTeamIds = Array.from(
    new Set(
      (
        (scopes ?? []) as Array<{
          scope_type: string;
          team_id: string | null;
          pole: string | null;
        }>
      )
        .filter((s) => s.scope_type === "team" && s.team_id)
        .map((s) => String(s.team_id)),
    ),
  );

  const scopePoles = Array.from(
    new Set(
      (
        (scopes ?? []) as Array<{
          scope_type: string;
          team_id: string | null;
          pole: string | null;
        }>
      )
        .filter((s) => s.scope_type === "pole" && s.pole)
        .map((s) => String(s.pole)),
    ),
  );

  let teamsByScope: Team[] = [];
  if (scopeTeamIds.length > 0) {
    const { data } = await supabase
      .from("teams")
      .select("id, name, category, pole")
      .in("id", scopeTeamIds);
    teamsByScope = [...teamsByScope, ...((data ?? []) as Team[])];
  }

  if (scopePoles.length > 0) {
    const { data } = await supabase
      .from("teams")
      .select("id, name, category, pole")
      .in("pole", scopePoles);
    teamsByScope = [...teamsByScope, ...((data ?? []) as Team[])];
  }

  let visibleTeams = [...ownTeams, ...teamsByScope];

  if (includePoleTeams && ownTeams.length > 0) {
    const poles = Array.from(
      new Set(ownTeams.map((t) => t.pole).filter(Boolean)),
    ) as string[];
    if (poles.length > 0) {
      const { data: poleTeamsData } = await supabase
        .from("teams")
        .select("id, name, category, pole")
        .in("pole", poles)
        .order("name");
      visibleTeams = [...visibleTeams, ...((poleTeamsData ?? []) as Team[])];
    }
  }

  const byId = new Map(visibleTeams.map((t) => [t.id, t]));
  visibleTeams = Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return { isCoach: rawRole === "coach", teams: visibleTeams };
}

export async function fetchPlayersByTeam(teamId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("players")
    .select("id, firstname, lastname, category")
    .eq("team_id", teamId)
    .order("lastname");

  return ((data ?? []) as PlayerDb[]).map((p) => ({
    id: String(p.id),
    name: `${p.firstname ?? ""} ${(p.lastname ?? "").slice(0, 1)}.`.trim(),
    category: p.category ?? "",
  }));
}
