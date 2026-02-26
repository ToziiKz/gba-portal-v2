import { createClient } from "@/lib/supabase/server";
import { getDashboardScope } from "@/lib/dashboard/getDashboardScope";
import { log } from "@/lib/logger";

export type EffectifClubTeam = {
  id: string;
  name: string;
  category: string | null;
  pole: string | null;
};

export type EffectifClubPlayer = {
  player_uid: string | null;
  player_key: string;
  firstname: string | null;
  lastname: string | null;
  team_id: string | null;
  category: string | null;
  gender: string | null;
  license: string | null;
  mutation: string | null;
  debut_mutation: string | null;
  fin_mutation: string | null;
  mobile: string | null;
  email: string | null;
  resp_legal_1: string | null;
  adress_resp_legal_1: string | null;
  zip_resp_legal_1: string | null;
  city_resp_legal_1: string | null;
  mobile_resp_legal_1: string | null;
  email_resp_legal_1: string | null;
  resp_legal_2: string | null;
  adress_resp_legal_2: string | null;
  zip_resp_legal_2: string | null;
  city_resp_legal_2: string | null;
  mobile_resp_legal_2: string | null;
  email_resp_legal_2: string | null;
};

export type EffectifClubStaff = {
  team_id: string;
  profile_id: string;
  role_in_team: "coach" | "assistant" | "staff";
  is_primary: boolean;
  profile: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
};

export async function getEffectifClubData() {
  const db = await createClient();
  const scope = await getDashboardScope();

  let teamsQuery = db
    .from("teams")
    .select("id, name, category, pole")
    .order("pole")
    .order("category")
    .order("name");

  let playersQuery = db
    .from("players")
    .select(
      "player_uid, firstname, lastname, team_id, category, gender, license, mutation, debut_mutation, fin_mutation, mobile, email, resp_legal_1, adress_resp_legal_1, zip_resp_legal_1, city_resp_legal_1, mobile_resp_legal_1, email_resp_legal_1, resp_legal_2, adress_resp_legal_2, zip_resp_legal_2, city_resp_legal_2, mobile_resp_legal_2, email_resp_legal_2",
    )
    .order("lastname")
    .order("firstname");

  let staffQuery = db.from("team_staff").select(
    "team_id, profile_id, role_in_team, is_primary, profile:profile_id(id, full_name, email)",
  );

  if (scope.role === "coach") {
    if (scope.viewableTeamIds && scope.viewableTeamIds.length > 0) {
      teamsQuery = teamsQuery.in("id", scope.viewableTeamIds);
      playersQuery = playersQuery.in("team_id", scope.viewableTeamIds);
      staffQuery = staffQuery.in("team_id", scope.viewableTeamIds);
    } else {
      const impossible = "00000000-0000-0000-0000-000000000000";
      teamsQuery = teamsQuery.eq("id", impossible);
      playersQuery = playersQuery.eq("team_id", impossible);
      staffQuery = staffQuery.eq("team_id", impossible);
    }
  }

  const [{ data: teams, error: teamsErr }, { data: players, error: playersErr }, { data: staff, error: staffErr }] =
    await Promise.all([teamsQuery, playersQuery, staffQuery]);

  if (teamsErr) log.error("[effectif-club] teams query error:", teamsErr);
  if (playersErr) log.error("[effectif-club] players query error:", playersErr);
  if (staffErr) log.error("[effectif-club] team_staff query error:", staffErr);

  const diagnostics = {
    teamsErrorCode: teamsErr?.code ?? null,
    playersErrorCode: playersErr?.code ?? null,
    staffErrorCode: staffErr?.code ?? null,
    teamsError: teamsErr?.message ?? null,
    playersError: playersErr?.message ?? null,
    staffError: staffErr?.message ?? null,
  };

  return {
    scope,
    diagnostics,
    teams: (teams ?? []) as EffectifClubTeam[],
    players: ((players ?? []) as any[]).map((p, idx) => ({
      player_uid: p.player_uid ?? null,
      player_key: `${p.player_uid ?? "no-uid"}-${p.license ?? "no-lic"}-${p.lastname ?? "x"}-${p.firstname ?? "y"}-${idx}`,
      firstname: p.firstname ?? null,
      lastname: p.lastname ?? null,
      team_id: p.team_id ?? null,
      category: p.category ?? null,
      gender: p.gender ?? null,
      license: p.license ?? null,
      mutation: p.mutation ?? null,
      debut_mutation: p.debut_mutation ?? null,
      fin_mutation: p.fin_mutation ?? null,
      mobile: p.mobile ?? null,
      email: p.email ?? null,
      resp_legal_1: p.resp_legal_1 ?? null,
      adress_resp_legal_1: p.adress_resp_legal_1 ?? null,
      zip_resp_legal_1: p.zip_resp_legal_1 ?? null,
      city_resp_legal_1: p.city_resp_legal_1 ?? null,
      mobile_resp_legal_1: p.mobile_resp_legal_1 ?? null,
      email_resp_legal_1: p.email_resp_legal_1 ?? null,
      resp_legal_2: p.resp_legal_2 ?? null,
      adress_resp_legal_2: p.adress_resp_legal_2 ?? null,
      zip_resp_legal_2: p.zip_resp_legal_2 ?? null,
      city_resp_legal_2: p.city_resp_legal_2 ?? null,
      mobile_resp_legal_2: p.mobile_resp_legal_2 ?? null,
      email_resp_legal_2: p.email_resp_legal_2 ?? null,
    })) as EffectifClubPlayer[],
    staff: ((staff ?? []) as any[]).map((s) => ({
      team_id: String(s.team_id),
      profile_id: String(s.profile_id),
      role_in_team: String(s.role_in_team ?? "staff") as
        | "coach"
        | "assistant"
        | "staff",
      is_primary: Boolean(s.is_primary),
      profile: Array.isArray(s.profile)
        ? (s.profile[0] ?? null)
        : (s.profile ?? null),
    })) as EffectifClubStaff[],
  };
}
