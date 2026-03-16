"use client";

import Image from "next/image";
import { X } from "lucide-react";

import type { FormationSlot, PositionedPlayer } from "./types";

type Props = {
  slots: FormationSlot[];
  playersBySlot: Record<string, PositionedPlayer | null>;
  onAssign: (slotId: string, playerId: string) => void;
  onRemove: (slotId: string) => void;
  onNumberChange: (slotId: string, number: string) => void;
  disabled?: boolean;
};

function shortDisplayName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? fullName;
  const first = parts[0];
  const lastInitial = parts[parts.length - 1]?.[0] ?? "";
  return `${first} ${lastInitial}.`;
}

export function PitchCanvas({
  slots,
  playersBySlot,
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
              Terrain GBA
            </p>
            <h3 className="mt-1 text-lg font-black uppercase tracking-tight text-slate-900">
              Onze titulaire
            </h3>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
            Glisser → déposer
          </span>
        </div>
      </div>

      <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-b from-emerald-700 via-emerald-800 to-emerald-950 p-3 shadow-[0_18px_56px_rgba(15,23,42,0.18)]">
          <div className="relative mx-auto aspect-[7/8.8] w-full max-w-[30rem] overflow-hidden rounded-[1.6rem] border border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.01)_100%)]">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0.06)_28px,rgba(0,0,0,0.03)_28px,rgba(0,0,0,0.03)_56px)] opacity-55" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.04)_28%,transparent_56%)]" />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-64 w-64 opacity-[0.13] saturate-0 brightness-200">
                <Image
                  src="/gba-logo.png"
                  alt="Logo GBA"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="absolute inset-x-[8%] top-[4.5%] bottom-[4.5%] rounded-[1.5rem] border border-white/72" />
            <div className="absolute inset-x-[8%] top-1/2 h-px -translate-y-1/2 bg-white/80" />
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/78" />
            <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow-[0_0_24px_rgba(255,255,255,0.7)]" />
            <div className="absolute inset-x-[14%] top-[4.5%] h-[13.5%] rounded-b-[1.4rem] border border-t-0 border-white/72" />
            <div className="absolute inset-x-[14%] bottom-[4.5%] h-[13.5%] rounded-t-[1.4rem] border border-b-0 border-white/72" />
            <div className="absolute inset-x-[31%] top-[4.5%] h-[6.4%] rounded-b-xl border border-t-0 border-white/72" />
            <div className="absolute inset-x-[31%] bottom-[4.5%] h-[6.4%] rounded-t-xl border border-b-0 border-white/72" />

            {slots.map((slot) => {
              const assigned = playersBySlot[slot.id] ?? null;

              return (
                <div
                  key={slot.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ top: slot.top, left: slot.left }}
                >
                  <button
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
                      if (playerId) onAssign(slot.id, playerId);
                    }}
                    className={`group relative flex h-20 w-[5.1rem] flex-col items-center justify-center rounded-[1.25rem] border text-center shadow-[0_16px_34px_rgba(15,23,42,0.2)] transition duration-200 ${
                      assigned
                        ? "border-white/90 bg-white/97 text-slate-900 hover:-translate-y-0.5"
                        : "border-white/28 bg-slate-950/18 text-white backdrop-blur-md hover:border-white/50 hover:bg-white/18"
                    } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
                  >
                    {assigned ? (
                      <>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onRemove(slot.id);
                          }}
                          className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-700 shadow-sm hover:bg-rose-200"
                          aria-label="Retirer le joueur"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.28em] text-blue-700">
                          {slot.shortLabel}
                        </span>
                        <div className="mt-1 flex items-center gap-1 rounded-xl bg-slate-950 px-2.5 py-1.5 text-white shadow-sm ring-2 ring-blue-200/60">
                          <span className="text-[8px] font-bold uppercase text-slate-300">
                            N°
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            value={assigned.shirtNumber}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) =>
                              onNumberChange(
                                slot.id,
                                event.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 2),
                              )
                            }
                            className="w-8 bg-transparent text-center text-[18px] font-black leading-none !text-white caret-white outline-none [color:white]"
                          />
                        </div>
                        <span className="mt-1 px-1 text-[10px] font-black uppercase leading-tight tracking-wide text-slate-900">
                          {shortDisplayName(assigned.player.name)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.28em] text-white/90">
                          {slot.shortLabel}
                        </span>
                        <span className="mt-2 px-1 text-[9px] font-bold uppercase tracking-wide text-white/90">
                          {slot.label}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white px-5 py-3">
        <p className="text-[11px] font-bold text-slate-500">
          Astuce : sélectionne une équipe, glisse un joueur vers un poste, puis
          règle son numéro avec le badge sombre. Le bouton rouge retire le
          joueur du terrain.
        </p>
      </div>
    </div>
  );
}
