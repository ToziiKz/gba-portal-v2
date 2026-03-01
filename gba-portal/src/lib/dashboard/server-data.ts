import { createClient } from "@/lib/supabase/server";
import { getDashboardScope } from "@/lib/dashboard/getDashboardScope";

// Helper to identify roles with broad access (admin + resps) vs scoped roles (coach)
function hasGlobalAccess(role: string) {
  return role === "admin" || role.startsWith("resp_");
}

type TeamLite = {
  id: string;
  name: string;
  category: string | null;
  pole: string | null;
};

export async function getScopedRosterData() {
  const db = await createClient();
  const scope = await getDashboardScope();

  let teamsQuery = db
    .from("teams")
    .select("id, name, category, pole")
    .order("name");
  let playersQuery = db
    .from("players")
    .select(
      "id, firstname, lastname, team_id, category, club_name, license_number, mobile_phone, email, gender, status_label, status_start_date, status_end_date, legal_guardian_name, address_street, address_zipcode, address_city",
    )
    .order("lastname");

  if (!hasGlobalAccess(scope.role)) {
    // Restrict to scoped teams for coaches
    if (scope.viewableTeamIds && scope.viewableTeamIds.length > 0) {
      teamsQuery = teamsQuery.in("id", scope.viewableTeamIds);
      playersQuery = playersQuery.in("team_id", scope.viewableTeamIds);
    } else {
      // No teams assigned -> return empty
      teamsQuery = teamsQuery.eq("id", "00000000-0000-0000-0000-000000000000"); // Impossible UUID
      playersQuery = playersQuery.eq(
        "team_id",
        "00000000-0000-0000-0000-000000000000",
      );
    }
  }

  const [{ data: teams }, { data: players }] = await Promise.all([
    teamsQuery,
    playersQuery,
  ]);

  return {
    scope,
    teams: ((teams ?? []) as TeamLite[]).map((t) => ({
      id: String(t.id),
      name: t.name ?? "Équipe sans nom",
      category: t.category ?? null,
      pole: t.pole ?? null,
    })),

    players: (players ?? []) as any[],
  };
}

export async function getScopedPlanningData() {
  const db = await createClient();
  const scope = await getDashboardScope();

  let sessionsQuery = db.from("planning_sessions").select(
    `
      id,
      day,
      session_date,
      pole,
      start_time,
      end_time,
      location,
      staff,
      note,
      team:team_id (
        id,
        name,
        category
      )
    `,
  );

  let teamsQuery = db
    .from("teams")
    .select("id, name, category, pole")
    .order("category");

  if (!hasGlobalAccess(scope.role)) {
    if (scope.viewableTeamIds && scope.viewableTeamIds.length > 0) {
      sessionsQuery = sessionsQuery.in("team_id", scope.viewableTeamIds);
      teamsQuery = teamsQuery.in("id", scope.viewableTeamIds);
    } else {
      sessionsQuery = sessionsQuery.eq(
        "team_id",
        "00000000-0000-0000-0000-000000000000",
      );
      teamsQuery = teamsQuery.eq("id", "00000000-0000-0000-0000-000000000000");
    }
  }

  const [sessionsResult, teamsResult] = await Promise.all([
    sessionsQuery,
    teamsQuery,
  ]);
  let sessions = sessionsResult.data;
  const sessionsError = sessionsResult.error;
  const teams = teamsResult.data;

  // Backward compatibility check for session_date
  if (
    sessionsError &&
    (sessionsError.message?.includes("session_date") ||
      sessionsError.code === "PGRST204")
  ) {
    let legacySessionsQuery = db.from("planning_sessions").select(
      `
        id,
        day,
        pole,
        start_time,
        end_time,
        location,
        staff,
        note,
        team:team_id (
          id,
          name,
          category
        )
      `,
    );

    if (!hasGlobalAccess(scope.role)) {
      if (scope.viewableTeamIds && scope.viewableTeamIds.length > 0) {
        legacySessionsQuery = legacySessionsQuery.in(
          "team_id",
          scope.viewableTeamIds,
        );
      } else {
        legacySessionsQuery = legacySessionsQuery.eq(
          "team_id",
          "00000000-0000-0000-0000-000000000000",
        );
      }
    }

    const { data: legacySessions } = await legacySessionsQuery;

    sessions = legacySessions as any;
  }

  return {
    scope,
    teams: (teams ?? []) as TeamLite[],

    sessions: ((sessions ?? []) as any[]).map((s) => ({
      ...s,

      team: Array.isArray(s.team) ? (s.team[0] ?? null) : s.team,
    })),
  };
}

export async function getDashboardHomeData() {
  const db = await createClient();
  const scope = await getDashboardScope();

  let teamsCountQuery = db
    .from("teams")
    .select("*", { count: "exact", head: true });

  let playersCountQuery = db
    .from("players")
    .select("*", { count: "exact", head: true });

  let sessionsCountQuery = db
    .from("planning_sessions")
    .select("*", { count: "exact", head: true });

  let sessionsQuery = db.from("planning_sessions").select(
    `
      id,
      day,
      start_time,
      end_time,
      location,
      team:team_id (
        id,
        name
      )
    `,
  );

  if (!hasGlobalAccess(scope.role)) {
    if (scope.viewableTeamIds && scope.viewableTeamIds.length > 0) {
      teamsCountQuery = teamsCountQuery.in("id", scope.viewableTeamIds);
      playersCountQuery = playersCountQuery.in(
        "team_id",
        scope.viewableTeamIds,
      );
      sessionsCountQuery = sessionsCountQuery.in(
        "team_id",
        scope.viewableTeamIds,
      );
      sessionsQuery = sessionsQuery.in("team_id", scope.viewableTeamIds);
    } else {
      teamsCountQuery = teamsCountQuery.eq(
        "id",
        "00000000-0000-0000-0000-000000000000",
      );
      playersCountQuery = playersCountQuery.eq(
        "team_id",
        "00000000-0000-0000-0000-000000000000",
      );
      sessionsCountQuery = sessionsCountQuery.eq(
        "team_id",
        "00000000-0000-0000-0000-000000000000",
      );
      sessionsQuery = sessionsQuery.eq(
        "team_id",
        "00000000-0000-0000-0000-000000000000",
      );
    }
  }

  const [
    { count: teamCount },
    { count: playerCount },
    { count: sessionsCount },
    { data: sessions },
  ] = await Promise.all([
    teamsCountQuery,
    playersCountQuery,
    sessionsCountQuery,
    sessionsQuery,
  ]);

  const normalizedSessions = ((sessions ?? []) as any[]).map((row) => ({
    id: String(row.id),
    day: row.day ?? null,
    start_time: row.start_time ?? null,
    end_time: row.end_time ?? null,
    location: row.location ?? null,

    team: Array.isArray(row.team) ? (row.team[0] ?? null) : row.team,
  }));

  return {
    scope,
    teamCount: teamCount ?? 0,
    playerCount: playerCount ?? 0,
    sessionsCount: sessionsCount ?? 0,
    sessions: normalizedSessions,
  };
}
