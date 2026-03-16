import type { Metadata } from "next";

import { CompositionBoard } from "@/components/dashboard/composition/CompositionBoard";
import { getEffectifClubData } from "@/lib/dashboard/effectif-club-data";

export const metadata: Metadata = {
  title: "Composition · GBA Dashboard",
  description:
    "Compose ton équipe sur un terrain interactif en glissant les joueurs poste par poste.",
};

function fullName(firstname: string | null, lastname: string | null) {
  return `${firstname ?? ""} ${lastname ?? ""}`.trim() || "Sans nom";
}

export default async function CompositionPage() {
  const { teams, players } = await getEffectifClubData();

  const compositionPlayers = players.map((player) => {
    const team = teams.find((entry) => entry.id === player.team_id) ?? null;

    return {
      id: player.player_key,
      name: fullName(player.firstname, player.lastname),
      teamId: player.team_id,
      teamName: team?.name ?? "Équipe non assignée",
      category: player.category ?? team?.category ?? "Catégorie non définie",
      numberLabel: player.license
        ? `#${String(player.license).slice(-2)}`
        : "Joueur",
    };
  });

  const orderedTeams = teams
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((team) => ({ id: team.id, name: team.name, category: team.category }));

  return <CompositionBoard players={compositionPlayers} teams={orderedTeams} />;
}
