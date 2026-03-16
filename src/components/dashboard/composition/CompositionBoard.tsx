"use client";

import * as React from "react";
import { Download, RotateCcw, Sparkles, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";

import { PlayerBench } from "./PlayerBench";
import { PitchCanvas } from "./PitchCanvas";
import { SubstitutesBench } from "./SubstitutesBench";
import {
  detectSquadFormat,
  getFormationsForFormat,
  type CompositionPlayer,
  type FormationPreset,
  type PositionedPlayer,
} from "./types";

type Props = {
  players: CompositionPlayer[];
  teams: Array<{ id: string; name: string; category: string | null }>;
};

const SUBSTITUTE_SLOTS = 5;

type ExportFormat = "svg" | "png" | "jpg";

function makePositionedPlayer(player: CompositionPlayer): PositionedPlayer {
  const fallback = player.numberLabel.replace(/[^0-9]/g, "").slice(-2);
  return {
    player,
    shirtNumber: fallback || "",
  };
}

function shortDisplayName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? fullName;
  const first = parts[0];
  const lastInitial = parts[parts.length - 1]?.[0] ?? "";
  return `${first} ${lastInitial}.`;
}

function buildExportSvg({
  activeFormation,
  activeTeam,
  slots,
  playersBySlot,
  substitutes,
  startersCount,
  starterTarget,
  substitutesCount,
  logoHref,
}: {
  activeFormation: FormationPreset;
  activeTeam: { id: string; name: string; category: string | null };
  slots: FormationPreset["slots"];
  playersBySlot: Record<string, PositionedPlayer | null>;
  substitutes: Array<PositionedPlayer | null>;
  startersCount: number;
  starterTarget: number;
  substitutesCount: number;
  logoHref: string;
}) {
  const width = 1200;
  const height = 1850;
  const pitchX = 270;
  const pitchY = 320;
  const pitchWidth = 660;
  const pitchHeight = 1220;
  const pitchInsetX = pitchWidth * 0.08;
  const pitchInsetY = pitchHeight * 0.045;
  const playableX = pitchX + pitchInsetX;
  const playableY = pitchY + pitchInsetY;
  const playableWidth = pitchWidth - pitchInsetX * 2;
  const playableHeight = pitchHeight - pitchInsetY * 2;

  const slotMarkup = slots
    .map((slot) => {
      const entry = playersBySlot[slot.id];
      const x =
        playableX + (Number.parseFloat(slot.left) / 100) * playableWidth;
      const y =
        playableY + (Number.parseFloat(slot.top) / 100) * playableHeight;

      if (!entry) {
        return `<g transform="translate(${x},${y})"><rect x="-52" y="-52" width="104" height="104" rx="26" fill="rgba(15,23,42,0.20)" stroke="rgba(255,255,255,0.38)"/><text x="0" y="-3" text-anchor="middle" fill="white" font-size="16" font-weight="800">${slot.shortLabel}</text><text x="0" y="18" text-anchor="middle" fill="rgba(255,255,255,0.86)" font-size="12">${slot.label}</text></g>`;
      }

      return `<g transform="translate(${x},${y})"><rect x="-54" y="-62" width="108" height="124" rx="26" fill="rgba(255,255,255,0.98)" stroke="rgba(255,255,255,0.92)"/><rect x="-34" y="-38" width="68" height="40" rx="14" fill="#0f172a" stroke="#93c5fd" stroke-width="2.5"/><text x="0" y="-11" text-anchor="middle" fill="white" font-size="24" font-weight="900">${entry.shirtNumber || "#"}</text><text x="0" y="16" text-anchor="middle" fill="#1d4ed8" font-size="11" font-weight="900">${slot.shortLabel}</text><text x="0" y="36" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="900">${shortDisplayName(entry.player.name)}</text><text x="0" y="55" text-anchor="middle" fill="#64748b" font-size="10" font-weight="700">${entry.player.teamName}</text></g>`;
    })
    .join("");

  const subsStartX = 170;
  const subsGap = 215;
  const subsY = 1680;

  const subsMarkup = substitutes
    .map((entry, index) => {
      const x = subsStartX + index * subsGap;
      if (!entry) {
        return `<g transform="translate(${x},${subsY})"><rect x="-88" y="-54" width="176" height="108" rx="24" fill="#f8fafc" stroke="#cbd5e1" stroke-dasharray="8 8"/><text x="0" y="-5" text-anchor="middle" fill="#94a3b8" font-size="12" font-weight="800">REMPLAÇANT ${index + 1}</text><text x="0" y="20" text-anchor="middle" fill="#64748b" font-size="13" font-weight="700">Libre</text></g>`;
      }
      return `<g transform="translate(${x},${subsY})"><rect x="-88" y="-54" width="176" height="108" rx="24" fill="#fff7ed" stroke="#fdba74" stroke-width="2"/><rect x="-34" y="-34" width="68" height="40" rx="14" fill="#0f172a" stroke="#fdba74" stroke-width="2.5"/><text x="0" y="-11" text-anchor="middle" fill="white" font-size="24" font-weight="900">${entry.shirtNumber || "#"}</text><text x="0" y="15" text-anchor="middle" fill="#9a3412" font-size="11" font-weight="900">REMPLAÇANT ${index + 1}</text><text x="0" y="37" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="900">${shortDisplayName(entry.player.name)}</text></g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="55%" stop-color="#1d4ed8"/><stop offset="100%" stop-color="#312e81"/></linearGradient><linearGradient id="pitch" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#16a34a"/><stop offset="60%" stop-color="#15803d"/><stop offset="100%" stop-color="#14532d"/></linearGradient><radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(255,255,255,0.16)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient></defs><rect width="100%" height="100%" fill="#f8fafc"/><rect x="40" y="40" width="1120" height="250" rx="46" fill="url(#bg)"/><circle cx="1030" cy="165" r="96" fill="rgba(255,255,255,0.06)"/><circle cx="930" cy="95" r="42" fill="rgba(255,255,255,0.05)"/><text x="80" y="112" fill="#93c5fd" font-size="16" font-weight="900" letter-spacing="4">GBA STAFF</text><text x="80" y="160" fill="white" font-size="38" font-weight="900">COMPOSITION D'ÉQUIPE</text><text x="80" y="205" fill="#dbeafe" font-size="21" font-weight="700">${activeTeam.name} · ${activeTeam.category ?? "Format non défini"} · ${activeFormation.label}</text><text x="80" y="240" fill="#bfdbfe" font-size="16" font-weight="700">Titulaires ${startersCount}/${starterTarget} · Remplaçants ${substitutesCount}/5</text><image href="${logoHref}" x="895" y="55" width="210" height="210" opacity="0.22"/><rect x="190" y="300" width="820" height="1260" rx="54" fill="url(#pitch)"/><rect x="190" y="300" width="820" height="1260" rx="54" fill="url(#glow)"/><rect x="${playableX}" y="${playableY}" width="${playableWidth}" height="${playableHeight}" rx="38" fill="none" stroke="rgba(255,255,255,0.78)" stroke-width="4"/><line x1="${playableX}" y1="${playableY + playableHeight / 2}" x2="${playableX + playableWidth}" y2="${playableY + playableHeight / 2}" stroke="rgba(255,255,255,0.82)" stroke-width="3"/><circle cx="${playableX + playableWidth / 2}" cy="${playableY + playableHeight / 2}" r="92" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="3"/><circle cx="${playableX + playableWidth / 2}" cy="${playableY + playableHeight / 2}" r="6" fill="white"/><rect x="${pitchX + pitchWidth * 0.2}" y="${playableY}" width="${pitchWidth * 0.6}" height="${pitchHeight * 0.135}" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="3"/><rect x="${pitchX + pitchWidth * 0.2}" y="${playableY + playableHeight - pitchHeight * 0.135}" width="${pitchWidth * 0.6}" height="${pitchHeight * 0.135}" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="3"/><rect x="${pitchX + pitchWidth * 0.33}" y="${playableY}" width="${pitchWidth * 0.34}" height="${pitchHeight * 0.064}" fill="none" stroke="rgba(255,255,255,0.72)" stroke-width="2.5"/><rect x="${pitchX + pitchWidth * 0.33}" y="${playableY + playableHeight - pitchHeight * 0.064}" width="${pitchWidth * 0.34}" height="${pitchHeight * 0.064}" fill="none" stroke="rgba(255,255,255,0.72)" stroke-width="2.5"/><image href="${logoHref}" x="390" y="735" width="420" height="420" opacity="0.10"/>${slotMarkup}<text x="90" y="1608" fill="#0f172a" font-size="24" font-weight="900">BANC DES REMPLAÇANTS</text>${subsMarkup}</svg>`;
}

async function downloadSvgAsRaster(
  svg: string,
  filename: string,
  mimeType: "image/png" | "image/jpeg",
) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image();

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () =>
      reject(new Error("Impossible de charger le SVG pour export raster."));
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D indisponible.");

  if (mimeType === "image/jpeg") {
    context.fillStyle = "#f8fafc";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0);
  URL.revokeObjectURL(url);

  const dataUrl = canvas.toDataURL(mimeType, 0.95);
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export function CompositionBoard({ players, teams }: Props) {
  const [selectedTeam, setSelectedTeam] = React.useState("");

  const activeTeam = React.useMemo(
    () => teams.find((team) => team.id === selectedTeam) ?? null,
    [selectedTeam, teams],
  );

  const squadFormat = React.useMemo(
    () => detectSquadFormat(activeTeam?.category),
    [activeTeam?.category],
  );

  const availableFormations = React.useMemo(
    () => getFormationsForFormat(squadFormat),
    [squadFormat],
  );

  const [selectedFormationId, setSelectedFormationId] = React.useState("");

  React.useEffect(() => {
    setSelectedFormationId(availableFormations[0]?.id ?? "");
  }, [availableFormations]);

  const activeFormation = React.useMemo<FormationPreset | null>(
    () =>
      availableFormations.find((preset) => preset.id === selectedFormationId) ??
      availableFormations[0] ??
      null,
    [availableFormations, selectedFormationId],
  );

  const slots = React.useMemo(
    () => activeFormation?.slots ?? [],
    [activeFormation],
  );

  const [playersBySlot, setPlayersBySlot] = React.useState<
    Record<string, PositionedPlayer | null>
  >({});
  const [substitutes, setSubstitutes] = React.useState<
    Array<PositionedPlayer | null>
  >(() => Array.from({ length: SUBSTITUTE_SLOTS }, () => null));

  React.useEffect(() => {
    setPlayersBySlot((current) => {
      const next: Record<string, PositionedPlayer | null> = {};
      for (const slot of slots) next[slot.id] = current[slot.id] ?? null;
      return next;
    });
  }, [slots]);

  const playersMap = React.useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  );

  const placedPlayerIds = React.useMemo(() => {
    const starters = Object.values(playersBySlot)
      .filter((player): player is PositionedPlayer => Boolean(player))
      .map((entry) => entry.player.id);
    const bench = substitutes
      .filter((player): player is PositionedPlayer => Boolean(player))
      .map((entry) => entry.player.id);
    return new Set([...starters, ...bench]);
  }, [playersBySlot, substitutes]);

  const clearPlayerEverywhere = React.useCallback(
    (stateSlots: Record<string, PositionedPlayer | null>, playerId: string) => {
      const nextSlots = { ...stateSlots };
      for (const key of Object.keys(nextSlots)) {
        if (nextSlots[key]?.player.id === playerId) nextSlots[key] = null;
      }
      return nextSlots;
    },
    [],
  );

  const assignPlayerToSlot = React.useCallback(
    (slotId: string, playerId: string) => {
      const nextPlayer = playersMap.get(playerId);
      if (!nextPlayer || !activeTeam) return;

      setPlayersBySlot((current) => {
        const next = clearPlayerEverywhere(current, playerId);
        next[slotId] = makePositionedPlayer(nextPlayer);
        return next;
      });

      setSubstitutes((current) =>
        current.map((entry) => (entry?.player.id === playerId ? null : entry)),
      );
    },
    [activeTeam, clearPlayerEverywhere, playersMap],
  );

  const removePlayerFromSlot = React.useCallback((slotId: string) => {
    setPlayersBySlot((current) => ({ ...current, [slotId]: null }));
  }, []);

  const assignPlayerToSubstitute = React.useCallback(
    (slotIndex: number, playerId: string) => {
      const nextPlayer = playersMap.get(playerId);
      if (!nextPlayer || !activeTeam) return;

      setPlayersBySlot((current) => clearPlayerEverywhere(current, playerId));
      setSubstitutes((current) => {
        const next = current.map((entry) =>
          entry?.player.id === playerId ? null : entry,
        );
        next[slotIndex] = makePositionedPlayer(nextPlayer);
        return next;
      });
    },
    [activeTeam, clearPlayerEverywhere, playersMap],
  );

  const removePlayerFromSubstitute = React.useCallback((slotIndex: number) => {
    setSubstitutes((current) =>
      current.map((entry, index) => (index === slotIndex ? null : entry)),
    );
  }, []);

  const updateStarterNumber = React.useCallback(
    (slotId: string, number: string) => {
      setPlayersBySlot((current) => {
        const entry = current[slotId];
        if (!entry) return current;
        return { ...current, [slotId]: { ...entry, shirtNumber: number } };
      });
    },
    [],
  );

  const updateSubstituteNumber = React.useCallback(
    (slotIndex: number, number: string) => {
      setSubstitutes((current) =>
        current.map((entry, index) =>
          index === slotIndex && entry
            ? { ...entry, shirtNumber: number }
            : entry,
        ),
      );
    },
    [],
  );

  const resetComposition = React.useCallback(() => {
    setPlayersBySlot(Object.fromEntries(slots.map((slot) => [slot.id, null])));
    setSubstitutes(Array.from({ length: SUBSTITUTE_SLOTS }, () => null));
  }, [slots]);

  const startersCount = Object.values(playersBySlot).filter(Boolean).length;
  const substitutesCount = substitutes.filter(Boolean).length;
  const squadCount = startersCount + substitutesCount;
  const starterTarget = slots.length;

  const exportComposition = React.useCallback(
    async (format: ExportFormat) => {
      if (!activeTeam || !activeFormation) return;

      const logoHref = `${window.location.origin}/gba-logo.png`;
      const svg = buildExportSvg({
        activeFormation,
        activeTeam,
        slots,
        playersBySlot,
        substitutes,
        startersCount,
        starterTarget,
        substitutesCount,
        logoHref,
      });

      const baseName = `gba-composition-${activeTeam.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

      if (format === "svg") {
        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${baseName}.svg`;
        link.click();
        URL.revokeObjectURL(url);
        return;
      }

      if (format === "png") {
        await downloadSvgAsRaster(svg, `${baseName}.png`, "image/png");
        return;
      }

      await downloadSvgAsRaster(svg, `${baseName}.jpg`, "image/jpeg");
    },
    [
      activeFormation,
      activeTeam,
      playersBySlot,
      slots,
      startersCount,
      starterTarget,
      substitutes,
      substitutesCount,
    ],
  );

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#312e81] p-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(148,163,184,0.12),transparent_34%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200/80">
              Module staff
            </p>
            <h2 className="mt-2 font-[var(--font-teko)] text-5xl font-black uppercase tracking-tight leading-none">
              Composition d’équipe
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-blue-50/85">
              Prépare ton onze et ton banc selon le vrai format de jeu de la
              catégorie sélectionnée.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => exportComposition("png")}
              disabled={!activeTeam}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-blue-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> PNG
            </button>
            <button
              type="button"
              onClick={() => exportComposition("jpg")}
              disabled={!activeTeam}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-blue-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> JPG
            </button>
            <button
              type="button"
              onClick={() => exportComposition("svg")}
              disabled={!activeTeam}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-blue-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> SVG
            </button>
            <button
              type="button"
              onClick={resetComposition}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-sm hover:bg-white/20"
            >
              <RotateCcw className="h-4 w-4" /> Réinitialiser
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="rounded-3xl border-slate-100 bg-white">
          <CardContent className="grid gap-4 p-5 md:grid-cols-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Équipe active
              </label>
              <select
                value={selectedTeam}
                onChange={(event) => setSelectedTeam(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
              >
                <option value="">Choisir une équipe</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {activeTeam?.category ?? "Sélection obligatoire pour composer"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Format détecté
              </p>
              <p className="mt-2 text-lg font-black uppercase text-slate-900">
                Foot à {starterTarget}
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                + 5 remplaçants max
              </p>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Schéma
              </label>
              <select
                value={selectedFormationId}
                onChange={(event) => setSelectedFormationId(event.target.value)}
                disabled={!activeTeam}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white disabled:opacity-50"
              >
                {availableFormations.map((formation) => (
                  <option key={formation.id} value={formation.id}>
                    {formation.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-100 bg-white">
          <CardContent className="flex h-full items-center justify-between gap-4 p-5 text-sm font-bold text-slate-600">
            <div>
              <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-blue-600">
                <Sparkles className="h-4 w-4" /> Export image
              </p>
              <p className="mt-2">
                Exports disponibles en SVG, PNG et JPG, avec terrain renforcé
                visuellement et banc réaligné.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="rounded-3xl border-slate-100 bg-white">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Titulaires
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {startersCount}/{starterTarget}
              </p>
            </div>
            <Users className="h-7 w-7 text-blue-600" />
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-slate-100 bg-white">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Remplaçants
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {substitutesCount}/5
              </p>
            </div>
            <Users className="h-7 w-7 text-amber-600" />
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-slate-100 bg-white">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Feuille totale
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {squadCount}/{starterTarget + SUBSTITUTE_SLOTS}
              </p>
            </div>
            <Users className="h-7 w-7 text-indigo-600" />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <PlayerBench
          players={players.filter(
            (player) => !activeTeam || player.teamId === activeTeam.id,
          )}
          teams={teams.map((team) => ({ id: team.id, name: team.name }))}
          selectedTeam={selectedTeam}
          onSelectTeam={setSelectedTeam}
          placedPlayerIds={placedPlayerIds}
        />
        <div className="space-y-6">
          <PitchCanvas
            slots={slots}
            playersBySlot={playersBySlot}
            onAssign={assignPlayerToSlot}
            onRemove={removePlayerFromSlot}
            onNumberChange={updateStarterNumber}
            disabled={!activeTeam}
          />
          <SubstitutesBench
            substitutes={substitutes}
            onAssign={assignPlayerToSubstitute}
            onRemove={removePlayerFromSubstitute}
            onNumberChange={updateSubstituteNumber}
            disabled={!activeTeam}
          />
        </div>
      </section>
    </div>
  );
}
