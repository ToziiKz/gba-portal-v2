import Link from "next/link";
import { Users, UserCircle2, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getEffectifClubData } from "@/lib/dashboard/effectif-club-data";
import { PlayerDrawer } from "./PlayerDrawer";
import { TeamDrawer } from "./TeamDrawer";

export const metadata = {
  title: "Effectif Club · GBA Dashboard",
};

function fullName(firstname: string | null, lastname: string | null) {
  return `${firstname ?? ""} ${lastname ?? ""}`.trim() || "Sans nom";
}

function normalizeMutation(value: string | null) {
  const v = String(value ?? "").trim().toLowerCase();
  if (!v) return null;
  if (v.includes("hp") || v.includes("hors")) return "Mutation HP";
  if (v.includes("surclass")) return "Surclassé";
  if (v.includes("disp")) return "Disp. Mutation";
  if (v.includes("mut")) return "Mutation";
  return null;
}

function mutationBadgeClass(label: string | null) {
  if (!label) return "";
  if (label === "Mutation HP")
    return "bg-rose-100 text-rose-700 border border-rose-200";
  if (label === "Surclassé")
    return "bg-violet-100 text-violet-700 border border-violet-200";
  if (label === "Disp. Mutation")
    return "bg-amber-100 text-amber-700 border border-amber-200";
  return "bg-blue-100 text-blue-700 border border-blue-200";
}

export default async function EffectifClubPage({
  searchParams,
}: {
  searchParams?: Promise<{
    player?: string;
    playerKey?: string;
    saved?: string;
    err?: string;
    pole?: string;
    category?: string;
    mutation?: string;
    team?: string;
  }>;
}) {
  const params = (await searchParams) ?? {};
  const { teams, players, staff, scope, diagnostics } = await getEffectifClubData();

  const activePole = params.pole ? decodeURIComponent(params.pole) : "";
  const activeCategory = params.category ? decodeURIComponent(params.category) : "";
  const activeMutation = params.mutation ? decodeURIComponent(params.mutation) : "";

  const poles = [...new Set(teams.map((t) => t.pole ?? "NON_DEFINI"))];
  const categories = [...new Set(teams.map((t) => t.category ?? "NON_DEFINI"))];

  const filteredTeams = teams.filter((t) => {
    if (activePole && (t.pole ?? "NON_DEFINI") !== activePole) return false;
    if (activeCategory && (t.category ?? "NON_DEFINI") !== activeCategory)
      return false;
    return true;
  });

  const filteredTeamIds = new Set(filteredTeams.map((t) => t.id));
  const filteredPlayers = players.filter((p) => {
    if (!filteredTeamIds.has(String(p.team_id ?? ""))) return false;
    const m = normalizeMutation(p.mutation) ?? "";
    if (activeMutation && m !== activeMutation) return false;
    return true;
  });

  const filteredStaff = staff.filter((s) => filteredTeamIds.has(s.team_id));

  const teamsByPole = poles.map((pole) => {
    const poleTeams = filteredTeams.filter(
      (t) => (t.pole ?? "NON_DEFINI") === pole,
    );

    const enrichedTeams = poleTeams.map((team) => {
      const teamPlayers = filteredPlayers.filter((p) => p.team_id === team.id);
      const teamStaff = filteredStaff.filter((s) => s.team_id === team.id);

      const primaryCoach =
        teamStaff.find((s) => s.role_in_team === "coach" && s.is_primary) ??
        teamStaff.find((s) => s.role_in_team === "coach") ??
        null;

      return {
        ...team,
        players: teamPlayers,
        staff: teamStaff,
        primaryCoach,
      };
    });

    return {
      pole,
      teams: enrichedTeams,
      teamCount: enrichedTeams.length,
      playersCount: enrichedTeams.reduce((acc, t) => acc + t.players.length, 0),
      staffCount: enrichedTeams.reduce((acc, t) => acc + t.staff.length, 0),
    };
  });

  const totalPlayers = filteredPlayers.length;
  const totalTeams = filteredTeams.length;
  const totalStaff = filteredStaff.length;

  const selectedPlayer = params.playerKey
    ? (players.find((p) => p.player_key === params.playerKey) ?? null)
    : params.player
      ? (players.find((p) => (p.license ?? "") === params.player) ?? null)
      : null;

  const selectedTeamDetail = params.team
    ? (() => {
        const t = teams.find((x) => x.id === params.team);
        if (!t) return null;
        const teamPlayers = filteredPlayers.filter((p) => p.team_id === t.id);
        const teamStaff = filteredStaff.filter((s) => s.team_id === t.id);
        const primaryCoach =
          teamStaff.find((s) => s.role_in_team === "coach" && s.is_primary) ??
          teamStaff.find((s) => s.role_in_team === "coach") ??
          null;

        return {
          ...t,
          players: teamPlayers,
          staff: teamStaff,
          primaryCoach,
        };
      })()
    : null;

  const buildFilterHref = (next: {
    pole?: string;
    category?: string;
    mutation?: string;
  }) => {
    const q = new URLSearchParams();
    const pole = next.pole ?? activePole;
    const category = next.category ?? activeCategory;
    const mutation = next.mutation ?? activeMutation;

    if (pole) q.set("pole", pole);
    if (category) q.set("category", category);
    if (mutation) q.set("mutation", mutation);

    return `/dashboard/effectif-club${q.toString() ? `?${q.toString()}` : ""}`;
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1">
            Système
          </p>
          <h2 className="font-[var(--font-teko)] text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900 leading-none">
            Effectif <span className="text-blue-600">Club</span>
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl font-medium">
            Pilotage unifié des pôles, équipes, staffs et joueurs, avec accès
            direct aux fiches détaillées.
          </p>
        </div>
      </div>

      <Card className="rounded-3xl border-slate-100 bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Filtre pôle
            </span>
            <Link
              href={buildFilterHref({ pole: "", category: activeCategory, mutation: activeMutation })}
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${activePole ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-700"}`}
            >
              Tous
            </Link>
            {poles.map((pole) => (
              <Link
                key={pole}
                href={buildFilterHref({ pole, category: activeCategory, mutation: activeMutation })}
                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${(activePole || "") === pole ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}
              >
                {pole === "NON_DEFINI" ? "Sans pôle" : pole}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Filtre catégorie
            </span>
            <Link
              href={buildFilterHref({ category: "" })}
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${activeCategory ? "bg-slate-100 text-slate-600" : "bg-indigo-100 text-indigo-700"}`}
            >
              Toutes
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={buildFilterHref({ category: cat })}
                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${(activeCategory || "") === cat ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}
              >
                {cat === "NON_DEFINI" ? "Sans catégorie" : cat}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Filtre statut
            </span>
            <Link
              href={buildFilterHref({ mutation: "" })}
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${activeMutation ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700"}`}
            >
              Tous
            </Link>
            {["Mutation", "Mutation HP", "Surclassé", "Disp. Mutation"].map(
              (m) => (
                <Link
                  key={m}
                  href={buildFilterHref({ mutation: m })}
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${(activeMutation || "") === m ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                >
                  {m}
                </Link>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {(diagnostics.teamsErrorCode ||
        diagnostics.playersErrorCode ||
        diagnostics.staffErrorCode ||
        (teams.length === 0 && players.length === 0)) && (
        <Card className="rounded-3xl border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-xs text-amber-900 space-y-1">
            <p className="font-black uppercase tracking-widest">
              Diagnostic Effectif Club (code: EFC-DIAG-01)
            </p>
            <p>
              Rôle scope: <strong>{scope.role}</strong> • équipes visibles:{" "}
              <strong>
                {scope.viewableTeamIds ? scope.viewableTeamIds.length : "all"}
              </strong>
            </p>
            <p>
              teams={teams.length}, players={players.length}, staff={staff.length}
            </p>
            {diagnostics.teamsError ? (
              <p>
                teams_error: {diagnostics.teamsErrorCode} — {diagnostics.teamsError}
              </p>
            ) : null}
            {diagnostics.playersError ? (
              <p>
                players_error: {diagnostics.playersErrorCode} —{" "}
                {diagnostics.playersError}
              </p>
            ) : null}
            {diagnostics.staffError ? (
              <p>
                staff_error: {diagnostics.staffErrorCode} — {diagnostics.staffError}
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}

      {params.saved === "1" && (
        <Card className="rounded-3xl border-emerald-200 bg-emerald-50">
          <CardContent className="p-4 text-xs font-black uppercase tracking-widest text-emerald-700">
            Joueur mis à jour avec succès.
          </CardContent>
        </Card>
      )}
      {params.err ? (
        <Card className="rounded-3xl border-rose-200 bg-rose-50">
          <CardContent className="p-4 text-xs font-black uppercase tracking-widest text-rose-700">
            {params.err}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-3xl border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Équipes
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {totalTeams}
              </p>
            </div>
            <ShieldCheck className="h-7 w-7 text-blue-600" />
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Joueurs
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {totalPlayers}
              </p>
            </div>
            <Users className="h-7 w-7 text-indigo-600" />
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Staff
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {totalStaff}
              </p>
            </div>
            <UserCircle2 className="h-7 w-7 text-emerald-600" />
          </CardContent>
        </Card>
      </div>

      {params.playerKey && !selectedPlayer ? (
        <Card className="rounded-3xl border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-xs font-black uppercase tracking-widest text-amber-800">
            Joueur introuvable pour la clé sélectionnée.
          </CardContent>
        </Card>
      ) : null}

      <TeamDrawer team={selectedTeamDetail} />

      <PlayerDrawer
        selectedPlayer={selectedPlayer}
        teams={teams.map((t) => ({ id: t.id, name: t.name }))}
        role={scope.role}
      />

      <div className="space-y-5">
        {teamsByPole.map((poleBlock) => (
          <Card
            key={poleBlock.pole}
            className="rounded-3xl border-slate-100 bg-white"
          >
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-slate-900 uppercase tracking-wide">
                  {poleBlock.pole === "NON_DEFINI"
                    ? "Pôle non défini"
                    : poleBlock.pole}
                </CardTitle>
                <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    {poleBlock.teamCount} équipe(s)
                  </span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                    {poleBlock.playersCount} joueur(s)
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                    {poleBlock.staffCount} staff
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {poleBlock.teams.map((team) => (
                <details
                  key={team.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 open:bg-white"
                >
                  <summary className="cursor-pointer list-none px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-black uppercase tracking-wide text-slate-900">
                          {team.name}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          {team.category ?? "—"} • {team.players.length} joueur(s)
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Coach principal
                        </p>
                        <p className="text-xs font-bold text-slate-700">
                          {team.primaryCoach?.profile?.full_name ?? "Non défini"}
                        </p>
                        <Link
                          href={`/dashboard/effectif-club?team=${encodeURIComponent(team.id)}`}
                          className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-blue-700 hover:bg-blue-200"
                        >
                          Ouvrir fiche équipe
                        </Link>
                      </div>
                    </div>
                  </summary>

                  <div className="border-t border-slate-200 p-4 grid gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                        Staff équipe
                      </p>
                      {team.staff.length === 0 ? (
                        <p className="text-xs text-slate-500">Aucun staff assigné.</p>
                      ) : (
                        <ul className="space-y-2">
                          {team.staff.map((s) => (
                            <li
                              key={`${s.team_id}-${s.profile_id}`}
                              className="text-xs"
                            >
                              <p className="font-bold text-slate-800">
                                {s.profile?.full_name ?? s.profile?.email ?? "Profil"}
                              </p>
                              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                                {s.role_in_team}
                                {s.is_primary ? " • principal" : ""}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Roster joueurs
                        </p>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                          {team.players.length}
                        </span>
                      </div>

                      {team.players.length === 0 ? (
                        <p className="text-xs text-slate-500">Aucun joueur dans cette équipe.</p>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {team.players.map((p) => (
                            <Link
                              key={p.player_key}
                              href={`/dashboard/effectif-club?playerKey=${encodeURIComponent(p.player_key)}#fiche-joueur`}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:border-blue-300 hover:bg-blue-50 transition"
                            >
                              <p className="text-xs font-bold text-slate-800">
                                {fullName(p.firstname, p.lastname)}
                              </p>
                              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                                {p.category ?? team.category ?? "—"} • {p.gender ?? "—"}
                              </p>
                              <div className="mt-1 flex items-center gap-2 flex-wrap">
                                {p.license ? (
                                  <p className="text-[10px] text-slate-400">Licence: {p.license}</p>
                                ) : (
                                  <p className="text-[10px] text-amber-600 font-bold">Licence manquante</p>
                                )}
                                {normalizeMutation(p.mutation) ? (
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${mutationBadgeClass(normalizeMutation(p.mutation))}`}
                                  >
                                    {normalizeMutation(p.mutation)}
                                  </span>
                                ) : null}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              ))}

              {poleBlock.teams.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                  Aucun effectif pour ce pôle
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
