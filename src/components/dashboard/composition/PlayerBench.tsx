"use client";

import type { CompositionPlayer } from "./types";

type Props = {
  players: CompositionPlayer[];
  selectedTeam: string;
  onSelectTeam: (teamId: string) => void;
  teams: Array<{ id: string; name: string }>;
  placedPlayerIds: Set<string>;
};

export function PlayerBench({
  players,
  selectedTeam,
  onSelectTeam,
  teams,
  placedPlayerIds,
}: Props) {
  const visiblePlayers = players.filter((player) => {
    if (!selectedTeam) return !placedPlayerIds.has(player.id);
    return player.teamId === selectedTeam && !placedPlayerIds.has(player.id);
  });

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm shadow-blue-100/30">
      <div className="border-b border-slate-100 bg-gradient-to-r from-white via-slate-50 to-blue-50 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Banc de touche
            </p>
            <h3 className="mt-1 text-lg font-black uppercase tracking-tight text-slate-900">
              Joueurs disponibles
            </h3>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
            {visiblePlayers.length}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">
            Filtre équipe
          </label>
          <select
            value={selectedTeam}
            onChange={(event) => onSelectTeam(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
          >
            <option value="">Toutes les équipes</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 max-h-[38rem] space-y-2 overflow-y-auto pr-1">
          {visiblePlayers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs font-black uppercase tracking-widest text-slate-400">
              Aucun joueur disponible avec ce filtre.
            </div>
          ) : (
            visiblePlayers.map((player) => (
              <button
                key={player.id}
                type="button"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    "text/composition-player",
                    player.id,
                  );
                  event.dataTransfer.effectAllowed = "move";
                }}
                className="w-full rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-blue-50 px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-slate-900">
                      {player.name}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {player.teamName} • {player.category}
                    </p>
                  </div>
                  <span className="rounded-full border border-blue-100 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700 shadow-sm">
                    {player.numberLabel}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
