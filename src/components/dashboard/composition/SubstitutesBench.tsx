"use client";

import { X } from "lucide-react";

import type { PositionedPlayer } from "./types";

type Props = {
  substitutes: Array<PositionedPlayer | null>;
  onAssign: (slotIndex: number, playerId: string) => void;
  onRemove: (slotIndex: number) => void;
  onNumberChange: (slotIndex: number, number: string) => void;
  disabled?: boolean;
};

function shortDisplayName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? fullName;
  const first = parts[0];
  const lastInitial = parts[parts.length - 1]?.[0] ?? "";
  return `${first} ${lastInitial}.`;
}

export function SubstitutesBench({
  substitutes,
  onAssign,
  onRemove,
  onNumberChange,
  disabled = false,
}: Props) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm shadow-blue-100/30">
      <div className="border-b border-slate-100 bg-gradient-to-r from-white via-slate-50 to-blue-50 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Banc remplaçants
            </p>
            <h3 className="mt-1 text-lg font-black uppercase tracking-tight text-slate-900">
              5 places maximum
            </h3>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
            {substitutes.filter(Boolean).length}/5
          </span>
        </div>
      </div>

      <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-5">
        {substitutes.map((entry, index) => (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onDragOver={(event) => {
              if (disabled) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            onDrop={(event) => {
              if (disabled) return;
              event.preventDefault();
              const playerId = event.dataTransfer.getData(
                "text/composition-player",
              );
              if (playerId) onAssign(index, playerId);
            }}
            className={`relative flex min-h-28 flex-col justify-center rounded-2xl border px-4 py-3 text-left shadow-sm transition ${
              entry
                ? "border-amber-200 bg-gradient-to-br from-white via-amber-50 to-orange-50 hover:-translate-y-0.5 hover:shadow-md"
                : "border-dashed border-slate-200 bg-slate-50 text-slate-400 hover:border-blue-200 hover:bg-blue-50/60"
            } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
          >
            {entry ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove(index);
                  }}
                  className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-700 shadow-sm hover:bg-rose-200"
                  aria-label="Retirer le joueur"
                >
                  <X className="h-3 w-3" />
                </button>
                <span className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-700">
                  Remplaçant {index + 1}
                </span>
                <div className="mt-2 inline-flex w-fit items-center gap-1 rounded-xl bg-slate-950 px-2.5 py-1.5 text-white shadow-sm ring-2 ring-amber-200/70">
                  <span className="text-[8px] font-bold uppercase text-slate-300">
                    N°
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={entry.shirtNumber}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) =>
                      onNumberChange(
                        index,
                        event.target.value.replace(/\D/g, "").slice(0, 2),
                      )
                    }
                    className="w-8 bg-transparent text-center text-[18px] font-black leading-none !text-white caret-white outline-none [color:white]"
                  />
                </div>
                <span className="mt-2 text-sm font-black uppercase tracking-wide text-slate-900">
                  {shortDisplayName(entry.player.name)}
                </span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {entry.player.teamName}
                </span>
              </>
            ) : (
              <>
                <span className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-400">
                  Remplaçant {index + 1}
                </span>
                <span className="mt-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Dépose un joueur ici
                </span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
