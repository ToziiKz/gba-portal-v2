"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragEndEvent,
  rectIntersection,
  MeasuringStrategy,
} from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { toPng } from "html-to-image";
import {
  fetchPlayersByTeam,
  fetchVisibleTacticalTeams,
} from "@/lib/dashboard/tactical-data";
import { Loader2 } from "lucide-react";
import { log } from "@/lib/logger";

type Player = {
  id: string;
  name: string;
  category: string;
};

type Team = {
  id: string;
  name: string;
  category: string;
  pole?: string | null;
};

type Slot = {
  id: string;
  x: number;
  y: number;
  label: string;
  number: number;
  playerId: string | null;
  isBench?: boolean;
};

type GameFormat = 11 | 8 | 5 | 4;

type FormationKey11 = string;

type FormationKey8 = string;

type FormationKey5 = string;

type FormationKey4 = string;

function computeFormatFromTeamCategory(
  teamCategory: string | null | undefined,
): GameFormat {
  const c = (teamCategory ?? "").toUpperCase().trim();
  // explicit
  if (c.startsWith("U6") || c.startsWith("U7")) return 4;
  if (c.startsWith("U8") || c.startsWith("U9")) return 5;
  if (
    c.startsWith("U10") ||
    c.startsWith("U11") ||
    c.startsWith("U12") ||
    c.startsWith("U13")
  )
    return 8;
  return 11;
}

function labelForFormat(format: GameFormat) {
  if (format === 11) return "Foot à 11";
  if (format === 8) return "Foot à 8 (7 + GB)";
  if (format === 5) return "Foot à 5";
  return "Foot à 4";
}

function makeSlots(format: GameFormat, formation: string): Slot[] {
  // Coordinates are percentages (x,y)
  if (format === 11) {
    const base: Record<FormationKey11, Omit<Slot, "playerId" | "number">[]> = {
      "4-3-3": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "lb", x: 12, y: 73, label: "DG" },
        { id: "lcb", x: 35, y: 76, label: "DC" },
        { id: "rcb", x: 65, y: 76, label: "DC" },
        { id: "rb", x: 88, y: 73, label: "DD" },
        { id: "lcm", x: 30, y: 52, label: "MC" },
        { id: "cm", x: 50, y: 56, label: "MC" },
        { id: "rcm", x: 70, y: 52, label: "MC" },
        { id: "lw", x: 20, y: 25, label: "AG" },
        { id: "st", x: 50, y: 18, label: "BU" },
        { id: "rw", x: 80, y: 25, label: "AD" },
      ],
      "4-4-2": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "lb", x: 12, y: 73, label: "DG" },
        { id: "lcb", x: 35, y: 76, label: "DC" },
        { id: "rcb", x: 65, y: 76, label: "DC" },
        { id: "rb", x: 88, y: 73, label: "DD" },
        { id: "lm", x: 18, y: 50, label: "MG" },
        { id: "lcm", x: 40, y: 55, label: "MC" },
        { id: "rcm", x: 60, y: 55, label: "MC" },
        { id: "rm", x: 82, y: 50, label: "MD" },
        { id: "st1", x: 42, y: 20, label: "BU" },
        { id: "st2", x: 58, y: 20, label: "BU" },
      ],
      "3-5-2": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "lcb", x: 28, y: 78, label: "DC" },
        { id: "cb", x: 50, y: 80, label: "DC" },
        { id: "rcb", x: 72, y: 78, label: "DC" },
        { id: "lwb", x: 12, y: 52, label: "PIS" },
        { id: "lcm", x: 35, y: 56, label: "MC" },
        { id: "cm", x: 50, y: 60, label: "MDC" },
        { id: "rcm", x: 65, y: 56, label: "MC" },
        { id: "rwb", x: 88, y: 52, label: "PID" },
        { id: "st1", x: 42, y: 20, label: "BU" },
        { id: "st2", x: 58, y: 20, label: "BU" },
      ],
      // 4-4-2 à plat (alias)
      "4-4-2 à plat": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "lb", x: 12, y: 73, label: "DG" },
        { id: "lcb", x: 35, y: 76, label: "DC" },
        { id: "rcb", x: 65, y: 76, label: "DC" },
        { id: "rb", x: 88, y: 73, label: "DD" },
        { id: "lm", x: 18, y: 50, label: "MG" },
        { id: "lcm", x: 40, y: 55, label: "MC" },
        { id: "rcm", x: 60, y: 55, label: "MC" },
        { id: "rm", x: 82, y: 50, label: "MD" },
        { id: "st1", x: 44, y: 20, label: "BU" },
        { id: "st2", x: 56, y: 20, label: "BU" },
      ],
      // 4-4-2 losange (demi-ailiers)
      "4-4-2 losange": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "lb", x: 12, y: 73, label: "DG" },
        { id: "lcb", x: 35, y: 76, label: "DC" },
        { id: "rcb", x: 65, y: 76, label: "DC" },
        { id: "rb", x: 88, y: 73, label: "DD" },
        { id: "mdc", x: 50, y: 60, label: "MDC" },
        { id: "mgg", x: 32, y: 50, label: "DAG" },
        { id: "mgd", x: 68, y: 50, label: "DAD" },
        { id: "moc", x: 50, y: 40, label: "MOC" },
        { id: "st1", x: 44, y: 20, label: "BU" },
        { id: "st2", x: 56, y: 20, label: "BU" },
      ],
      // 4-3-3 à plat (alias)
      "4-3-3 à plat": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "lb", x: 12, y: 73, label: "DG" },
        { id: "lcb", x: 35, y: 76, label: "DC" },
        { id: "rcb", x: 65, y: 76, label: "DC" },
        { id: "rb", x: 88, y: 73, label: "DD" },
        { id: "mc1", x: 30, y: 54, label: "MC" },
        { id: "mc2", x: 50, y: 58, label: "MC" },
        { id: "mc3", x: 70, y: 54, label: "MC" },
        { id: "ag", x: 20, y: 25, label: "AG" },
        { id: "bu", x: 50, y: 18, label: "BU" },
        { id: "ad", x: 80, y: 25, label: "AD" },
      ],
      // 4-3-3 (1 MDC / 2 MOC)
      "4-3-3 (1 MDC / 2 MOC)": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "lb", x: 12, y: 73, label: "DG" },
        { id: "lcb", x: 35, y: 76, label: "DC" },
        { id: "rcb", x: 65, y: 76, label: "DC" },
        { id: "rb", x: 88, y: 73, label: "DD" },
        { id: "mdc", x: 50, y: 62, label: "MDC" },
        { id: "mocg", x: 38, y: 48, label: "MOC" },
        { id: "mocd", x: 62, y: 48, label: "MOC" },
        { id: "ag", x: 20, y: 25, label: "AG" },
        { id: "bu", x: 50, y: 18, label: "BU" },
        { id: "ad", x: 80, y: 25, label: "AD" },
      ],
      // 4-2-3-1 (2 MDC, 1 MOC)
      "4-2-3-1": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "lb", x: 12, y: 73, label: "DG" },
        { id: "lcb", x: 35, y: 76, label: "DC" },
        { id: "rcb", x: 65, y: 76, label: "DC" },
        { id: "rb", x: 88, y: 73, label: "DD" },
        { id: "mdc1", x: 42, y: 62, label: "MDC" },
        { id: "mdc2", x: 58, y: 62, label: "MDC" },
        { id: "mocg", x: 25, y: 42, label: "MOG" },
        { id: "moc", x: 50, y: 40, label: "MOC" },
        { id: "mocd", x: 75, y: 42, label: "MOD" },
        { id: "bu", x: 50, y: 18, label: "BU" },
      ],
      // 3-5-2 (2 MDC + 1 MOC + 2 pistons)
      "3-5-2 (pistons)": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "dcg", x: 28, y: 78, label: "DC" },
        { id: "dc", x: 50, y: 80, label: "DC" },
        { id: "dcd", x: 72, y: 78, label: "DC" },
        { id: "pisg", x: 12, y: 52, label: "PIS" },
        { id: "mdc1", x: 42, y: 60, label: "MDC" },
        { id: "mdc2", x: 58, y: 60, label: "MDC" },
        { id: "moc", x: 50, y: 44, label: "MOC" },
        { id: "pisd", x: 88, y: 52, label: "PID" },
        { id: "bu1", x: 44, y: 20, label: "BU" },
        { id: "bu2", x: 56, y: 20, label: "BU" },
      ],
      // 3-5-2 (1 MDC / 2 MOC)
      "3-5-2 (1 MDC / 2 MOC)": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "dcg", x: 28, y: 78, label: "DC" },
        { id: "dc", x: 50, y: 80, label: "DC" },
        { id: "dcd", x: 72, y: 78, label: "DC" },
        { id: "pisg", x: 12, y: 52, label: "PIS" },
        { id: "mdc", x: 50, y: 62, label: "MDC" },
        { id: "mocg", x: 38, y: 48, label: "MOC" },
        { id: "mocd", x: 62, y: 48, label: "MOC" },
        { id: "pisd", x: 88, y: 52, label: "PID" },
        { id: "bu1", x: 44, y: 20, label: "BU" },
        { id: "bu2", x: 56, y: 20, label: "BU" },
      ],
      // 3-4-3 (2 MC à plat)
      "3-4-3 (2 MC)": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "dcg", x: 28, y: 78, label: "DC" },
        { id: "dc", x: 50, y: 80, label: "DC" },
        { id: "dcd", x: 72, y: 78, label: "DC" },
        { id: "mg", x: 15, y: 55, label: "MG" },
        { id: "mcg", x: 42, y: 58, label: "MC" },
        { id: "mcd", x: 58, y: 58, label: "MC" },
        { id: "md", x: 85, y: 55, label: "MD" },
        { id: "ag", x: 22, y: 25, label: "AG" },
        { id: "bu", x: 50, y: 18, label: "BU" },
        { id: "ad", x: 78, y: 25, label: "AD" },
      ],
      // 3-4-3 (1 MDC + 1 MOC)
      "3-4-3 (MDC+MOC)": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "dcg", x: 28, y: 78, label: "DC" },
        { id: "dc", x: 50, y: 80, label: "DC" },
        { id: "dcd", x: 72, y: 78, label: "DC" },
        { id: "mg", x: 15, y: 55, label: "MG" },
        { id: "mdc", x: 50, y: 62, label: "MDC" },
        { id: "moc", x: 50, y: 44, label: "MOC" },
        { id: "md", x: 85, y: 55, label: "MD" },
        { id: "ag", x: 22, y: 25, label: "AG" },
        { id: "bu", x: 50, y: 18, label: "BU" },
        { id: "ad", x: 78, y: 25, label: "AD" },
      ],
      // 4-1-4-1 (1 MDC, 2 MC)
      "4-1-4-1": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "lb", x: 12, y: 73, label: "DG" },
        { id: "lcb", x: 35, y: 76, label: "DC" },
        { id: "rcb", x: 65, y: 76, label: "DC" },
        { id: "rb", x: 88, y: 73, label: "DD" },
        { id: "mdc", x: 50, y: 62, label: "MDC" },
        { id: "mg", x: 18, y: 45, label: "MG" },
        { id: "mcg", x: 42, y: 52, label: "MC" },
        { id: "mcd", x: 58, y: 52, label: "MC" },
        { id: "md", x: 82, y: 45, label: "MD" },
        { id: "bu", x: 50, y: 18, label: "BU" },
      ],
      // 5-4-1 (3 centraux, 2 MC)
      "5-4-1": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "pistg", x: 10, y: 68, label: "PIS" },
        { id: "dcg", x: 30, y: 78, label: "DC" },
        { id: "dc", x: 50, y: 80, label: "DC" },
        { id: "dcd", x: 70, y: 78, label: "DC" },
        { id: "pistd", x: 90, y: 68, label: "PID" },
        { id: "mg", x: 20, y: 50, label: "MG" },
        { id: "mcg", x: 42, y: 55, label: "MC" },
        { id: "mcd", x: 58, y: 55, label: "MC" },
        { id: "md", x: 80, y: 50, label: "MD" },
        { id: "bu", x: 50, y: 18, label: "BU" },
      ],
    };
    const arr = base[formation as FormationKey11] ?? base["4-3-3"];
    return arr.map((s, i) => ({ ...s, number: i + 1, playerId: null }));
  }

  if (format === 8) {
    const base: Record<FormationKey8, Omit<Slot, "playerId" | "number">[]> = {
      // 2-3-1-1 (GB + 2 defs + 3 mil + 1 10 + 1 attaq)
      "2-3-1-1": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "d1", x: 32, y: 72, label: "D" },
        { id: "d2", x: 68, y: 72, label: "D" },
        { id: "m1", x: 20, y: 52, label: "M" },
        { id: "m2", x: 50, y: 56, label: "M" },
        { id: "m3", x: 80, y: 52, label: "M" },
        { id: "ten", x: 50, y: 34, label: "10" },
        { id: "st", x: 50, y: 18, label: "A" },
      ],
      // 3-3-1 (GB + 3 defs + 3 mil + 1 attaq)
      "3-3-1": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "d1", x: 22, y: 74, label: "D" },
        { id: "d2", x: 50, y: 76, label: "D" },
        { id: "d3", x: 78, y: 74, label: "D" },
        { id: "m1", x: 25, y: 52, label: "M" },
        { id: "m2", x: 50, y: 56, label: "M" },
        { id: "m3", x: 75, y: 52, label: "M" },
        { id: "st", x: 50, y: 20, label: "A" },
      ],
      // 2-4-1 (GB + 2 defs + 4 mil + 1 attaq)
      "2-4-1": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "d1", x: 32, y: 74, label: "D" },
        { id: "d2", x: 68, y: 74, label: "D" },
        { id: "m1", x: 18, y: 54, label: "M" },
        { id: "m2", x: 40, y: 58, label: "M" },
        { id: "m3", x: 60, y: 58, label: "M" },
        { id: "m4", x: 82, y: 54, label: "M" },
        { id: "st", x: 50, y: 20, label: "A" },
      ],
      // 3-1-3 (GB + 3 defs + 1 mil + 3 avants)
      "3-1-3": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "d1", x: 22, y: 76, label: "D" },
        { id: "d2", x: 50, y: 78, label: "D" },
        { id: "d3", x: 78, y: 76, label: "D" },
        { id: "m", x: 50, y: 56, label: "M" },
        { id: "a1", x: 22, y: 24, label: "A" },
        { id: "a2", x: 50, y: 18, label: "A" },
        { id: "a3", x: 78, y: 24, label: "A" },
      ],
      // 2-3-2 (GB + 2 defs + 3 mil + 2 avants)
      "2-3-2": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "d1", x: 32, y: 74, label: "D" },
        { id: "d2", x: 68, y: 74, label: "D" },
        { id: "m1", x: 25, y: 54, label: "M" },
        { id: "m2", x: 50, y: 58, label: "M" },
        { id: "m3", x: 75, y: 54, label: "M" },
        { id: "a1", x: 42, y: 20, label: "A" },
        { id: "a2", x: 58, y: 20, label: "A" },
      ],
      // 3-2-2 (GB + 3 defs + 2 mil + 2 avants)
      "3-2-2": [
        { id: "gk", x: 50, y: 90, label: "GB" },
        { id: "d1", x: 22, y: 76, label: "D" },
        { id: "d2", x: 50, y: 78, label: "D" },
        { id: "d3", x: 78, y: 76, label: "D" },
        { id: "m1", x: 40, y: 56, label: "M" },
        { id: "m2", x: 60, y: 56, label: "M" },
        { id: "a1", x: 42, y: 20, label: "A" },
        { id: "a2", x: 58, y: 20, label: "A" },
      ],
    };
    const arr = base[formation as FormationKey8] ?? base["2-3-1-1"];
    return arr.map((s, i) => ({ ...s, number: i + 1, playerId: null }));
  }

  if (format === 5) {
    const base: Record<FormationKey5, Omit<Slot, "playerId" | "number">[]> = {
      // 1-2-1 (GB + 1 def + 2 mil + 1 att)
      "1-2-1": [
        { id: "gk", x: 50, y: 88, label: "GB" },
        { id: "d", x: 50, y: 66, label: "D" },
        { id: "m1", x: 32, y: 42, label: "M" },
        { id: "m2", x: 68, y: 42, label: "M" },
        { id: "st", x: 50, y: 18, label: "A" },
      ],
      // 2-1-1 (GB + 2 defs + 1 mil + 1 att)
      "2-1-1": [
        { id: "gk", x: 50, y: 88, label: "GB" },
        { id: "d1", x: 35, y: 66, label: "D" },
        { id: "d2", x: 65, y: 66, label: "D" },
        { id: "m", x: 50, y: 42, label: "M" },
        { id: "st", x: 50, y: 18, label: "A" },
      ],
      // 2-2 (GB + 2 derrière + 2 devant)
      "2-2": [
        { id: "gk", x: 50, y: 88, label: "GB" },
        { id: "d1", x: 35, y: 66, label: "D" },
        { id: "d2", x: 65, y: 66, label: "D" },
        { id: "a1", x: 35, y: 20, label: "A" },
        { id: "a2", x: 65, y: 20, label: "A" },
      ],
    };
    const arr = base[formation as FormationKey5] ?? base["1-2-1"];
    return arr.map((s, i) => ({ ...s, number: i + 1, playerId: null }));
  }

  // format === 4
  const base: Record<FormationKey4, Omit<Slot, "playerId" | "number">[]> = {
    // 1-1-1 (GB + 1 def + 1 mil + 1 att)
    "1-1-1": [
      { id: "gk", x: 50, y: 88, label: "GB" },
      { id: "d", x: 50, y: 62, label: "D" },
      { id: "m", x: 50, y: 38, label: "M" },
      { id: "st", x: 50, y: 16, label: "A" },
    ],
    // 2-1 (GB + 2 + 1)
    "2-1": [
      { id: "gk", x: 50, y: 88, label: "GB" },
      { id: "p1", x: 35, y: 52, label: "P" },
      { id: "p2", x: 65, y: 52, label: "P" },
      { id: "st", x: 50, y: 18, label: "A" },
    ],
    // 1-2 (GB + 1 derrière + 2 devant)
    "1-2": [
      { id: "gk", x: 50, y: 88, label: "GB" },
      { id: "d", x: 50, y: 62, label: "D" },
      { id: "a1", x: 35, y: 20, label: "A" },
      { id: "a2", x: 65, y: 20, label: "A" },
    ],
  };
  const arr = base[formation as FormationKey4] ?? base["1-1-1"];
  return arr.map((s, i) => ({ ...s, number: i + 1, playerId: null }));
}

function PlayerChip({ id, name }: { id: string; name: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });
  const style: React.CSSProperties | undefined = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      type="button"
      className={
        `w-full touch-none rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-left text-sm font-semibold text-white ` +
        `hover:bg-white/15 transition ` +
        (isDragging ? "opacity-20" : "")
      }
      title="Glisser vers un poste"
    >
      <span className="block truncate">{name}</span>
    </button>
  );
}

function SlotView({
  slot,
  playerName,
  onClear,
  onSetNumber,
}: {
  slot: Slot;
  playerName: string | null;
  onClear: () => void;
  onSetNumber: (n: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slot.id });

  return (
    <div
      className={
        `absolute -translate-x-1/2 -translate-y-1/2 z-10 touch-none ` +
        (isOver ? "scale-110" : "") +
        (slot.isBench ? " !static !translate-x-0 !translate-y-0" : "")
      }
      style={slot.isBench ? {} : { left: `${slot.x}%`, top: `${slot.y}%` }}
    >
      {/* Hit area larger than the visible chip */}
      <div
        ref={setNodeRef}
        className={
          "pointer-events-auto flex flex-col items-center justify-center gap-1 rounded-2xl " +
          (slot.isBench ? "h-12 w-12" : "h-24 w-24") +
          (isOver
            ? " bg-emerald-400/10 outline outline-2 outline-emerald-400/50"
            : "")
        }
      >
        <div
          className={
            `relative h-10 w-10 rounded-full border-2 shadow-[0_4px_12px_rgba(0,0,0,0.45)] ` +
            (playerName
              ? "bg-white text-black border-white"
              : "bg-black/30 text-white/85 border-white/60 border-dashed") +
            (isOver ? " shadow-[0_0_18px_rgba(255,255,255,0.35)]" : "")
          }
        >
          <button
            type="button"
            className="h-full w-full rounded-full flex items-center justify-center text-[12px] font-black"
            title={playerName ? "Modifier le numéro" : ""}
            onClick={(e) => {
              e.stopPropagation();
              if (!playerName) return;
              const raw = window.prompt(
                "Numéro du joueur (1-99) :",
                String(slot.number),
              );
              if (!raw) return;
              const n = Number(raw);
              if (!Number.isFinite(n) || n < 1 || n > 99) return;
              onSetNumber(Math.trunc(n));
            }}
          >
            {playerName ? slot.number : slot.label}
          </button>

          {playerName ? (
            <button
              type="button"
              title="Enlever le joueur"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-lg border border-white/20 hover:bg-red-500"
            >
              ×
            </button>
          ) : null}
        </div>
        {playerName ? (
          <div
            className={
              "px-2.5 py-1 rounded-lg bg-black/85 border border-white/30 !text-white text-[12px] font-extrabold shadow-lg whitespace-nowrap max-w-[190px] " +
              (slot.isBench ? "absolute top-12 left-1/2 -translate-x-1/2" : "")
            }
          >
            <span className="block truncate drop-shadow !text-white">
              {playerName}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function TactiquePage() {
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null);
  const [debug, setDebug] = React.useState<string>("");
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCoach, setIsCoach] = React.useState(false);
  const [includePoleTeams, setIncludePoleTeams] = React.useState(false);

  // Save Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);
  const [saveDate, setSaveDate] = React.useState("");
  const [saveOpponent, setSaveOpponent] = React.useState("");

  const selectedTeam = React.useMemo(
    () => teams.find((t) => t.id === selectedTeamId) ?? null,
    [teams, selectedTeamId],
  );

  const format: GameFormat = React.useMemo(
    () => computeFormatFromTeamCategory(selectedTeam?.category),
    [selectedTeam?.category],
  );

  const [formation, setFormation] = React.useState<string>("4-3-3 à plat");
  const [slots, setSlots] = React.useState<Slot[]>(() =>
    makeSlots(11, "4-3-3 à plat"),
  );
  const [benchSlots, setBenchSlots] = React.useState<Slot[]>([
    {
      id: "sub1",
      x: 25,
      y: 0,
      label: "R",
      number: 12,
      playerId: null,
      isBench: true,
    },
    {
      id: "sub2",
      x: 50,
      y: 0,
      label: "R",
      number: 13,
      playerId: null,
      isBench: true,
    },
    {
      id: "sub3",
      x: 75,
      y: 0,
      label: "R",
      number: 14,
      playerId: null,
      isBench: true,
    },
  ]);

  const pitchRef = React.useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 8 },
    }),
  );

  // Load teams (coach: only assigned teams, optionally same pole)
  React.useEffect(() => {
    async function loadTeams() {
      setIsLoading(true);
      const result = await fetchVisibleTacticalTeams(includePoleTeams);
      const visibleTeams = result.teams as Team[];

      setIsCoach(result.isCoach);
      setTeams(visibleTeams);
      setSelectedTeamId((prev) =>
        visibleTeams.some((t) => t.id === prev)
          ? prev
          : (visibleTeams[0]?.id ?? ""),
      );
      setIsLoading(false);
    }
    loadTeams();
  }, [includePoleTeams]);

  // Load players for selected team
  React.useEffect(() => {
    if (!selectedTeamId) return;

    async function loadPlayers() {
      const formatted = await fetchPlayersByTeam(selectedTeamId);
      setPlayers(formatted);
      // reset compo on team change
      setSlots(makeSlots(format, defaultFormationFor(format)));
      setFormation(defaultFormationFor(format));
    }

    loadPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeamId]);

  // When format changes (team category), reset formation + slots
  React.useEffect(() => {
    const f = defaultFormationFor(format);
    setFormation(f);
    setSlots(makeSlots(format, f));
  }, [format]);

  function defaultFormationFor(fmt: GameFormat) {
    if (fmt === 11) return "4-3-3 à plat";
    if (fmt === 8) return "3-3-1";
    if (fmt === 5) return "1-2-1";
    return "1-1-1";
  }

  const availableFormations = React.useMemo(() => {
    if (format === 11)
      return [
        "4-4-2 à plat",
        "4-4-2 losange",
        "4-3-3 à plat",
        "4-3-3 (1 MDC / 2 MOC)",
        "4-2-3-1",
        "3-5-2 (pistons)",
        "3-5-2 (1 MDC / 2 MOC)",
        "3-4-3 (2 MC)",
        "3-4-3 (MDC+MOC)",
        "4-1-4-1",
        "5-4-1",
      ];
    if (format === 8)
      return ["3-3-1", "2-4-1", "3-1-3", "2-3-2", "3-2-2", "2-3-1-1"];
    if (format === 5) return ["1-2-1", "2-2", "2-1-1"];
    return ["1-1-1", "1-2", "2-1"];
  }, [format]);

  const placedPlayerIds = React.useMemo(() => {
    const onField = slots.map((s) => s.playerId);
    const onBench = benchSlots.map((s) => s.playerId);
    return new Set([...onField, ...onBench].filter(Boolean) as string[]);
  }, [slots, benchSlots]);
  const bench = React.useMemo(
    () => players.filter((p) => !placedPlayerIds.has(p.id)),
    [players, placedPlayerIds],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    const playerId = String(active.id);
    const overId = over ? String(over.id) : "null";
    setDebug(`dragEnd active=${playerId} over=${overId}`);

    if (!over) return;

    // Dropped on bench (list) => remove from any slot (field or substitutes)
    if (overId === "bench") {
      setSlots((prev) =>
        prev.map((s) =>
          s.playerId === playerId ? { ...s, playerId: null } : s,
        ),
      );
      setBenchSlots((prev) =>
        prev.map((s) =>
          s.playerId === playerId ? { ...s, playerId: null } : s,
        ),
      );
      return;
    }

    // Dropped on a substitute slot
    if (overId.startsWith("sub")) {
      // Remove player from any other slot first
      setSlots((prev) =>
        prev.map((s) =>
          s.playerId === playerId ? { ...s, playerId: null } : s,
        ),
      );
      setBenchSlots((prev) => {
        const next = prev.map((s) =>
          s.playerId === playerId ? { ...s, playerId: null } : s,
        );
        return next.map((s) => (s.id === overId ? { ...s, playerId } : s));
      });
      return;
    }

    // Dropped on a field slot
    setSlots((prev) => {
      const target = prev.find((s) => s.id === overId);
      if (!target) return prev;

      // remove player from any other field slot
      const next = prev.map((s) =>
        s.playerId === playerId ? { ...s, playerId: null } : s,
      );
      // also remove from bench slots
      setBenchSlots((prevB) =>
        prevB.map((s) =>
          s.playerId === playerId ? { ...s, playerId: null } : s,
        ),
      );

      // if slot has someone, push that someone back to bench (just overwrite)
      return next.map((s) => (s.id === overId ? { ...s, playerId } : s));
    });
  };

  const handleFormationChange = (nextFormation: string) => {
    setFormation(nextFormation);
    // keep players if possible by mapping by index
    setSlots((prev) => {
      const currentPlayers = prev
        .map((s) => s.playerId)
        .filter(Boolean) as string[];
      const nextSlots = makeSlots(format, nextFormation);
      // fill sequentially
      let i = 0;
      return nextSlots.map((s) => ({
        ...s,
        playerId: currentPlayers[i++] ?? null,
      }));
    });
  };

  const openSaveModal = () => {
    setSaveDate(new Date().toISOString().split("T")[0]);
    setSaveOpponent("");
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaveModalOpen(false);

    // V1 simplifiée: tables matches/match_lineups supprimées de la DB.
    // On conserve le module pour préparer les compositions (terrain + export image),
    // mais sans persistance serveur pour l'instant.
    log.info("Composition save disabled (V1 simplified)", {
      teamId: selectedTeamId,
      formation,
      saveDate,
      saveOpponent,
      starters: slots.filter((s) => s.playerId).length,
      bench: benchSlots.filter((s) => s.playerId).length,
    });

    alert(
      'Mode V1: composition non persistée en base. Utilise "Télécharger" pour exporter l\'image.',
    );
  };

  const exportImage = async () => {
    if (!pitchRef.current) return;
    const dataUrl = await toPng(pitchRef.current, {
      cacheBust: true,
      pixelRatio: 3,
    });
    const link = document.createElement("a");
    link.download = `compo-${selectedTeam?.name ?? "gba"}.png`;
    link.href = dataUrl;
    link.click();
  };

  const { setNodeRef: benchRef, isOver: benchOver } = useDroppable({
    id: "bench",
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={(e) => {
        setActiveDragId(String(e.active.id));
        setDebug(`dragStart active=${String(e.active.id)}`);
      }}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDragId(null)}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Card className="premium-card card-shell rounded-3xl">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-[var(--font-teko)] text-3xl font-black uppercase text-white tracking-wide">
                    Composition
                  </h2>
                  <p className="text-sm text-white/60">
                    {labelForFormat(format)} • Glisser-déposer
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id} className="text-black">
                        {t.name}
                      </option>
                    ))}
                  </select>

                  {isCoach ? (
                    <label className="inline-flex items-center gap-2 text-xs text-white/70">
                      <input
                        type="checkbox"
                        checked={includePoleTeams}
                        onChange={(e) => setIncludePoleTeams(e.target.checked)}
                        className="h-3.5 w-3.5"
                      />
                      Inclure les équipes de mon pôle
                    </label>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {availableFormations.map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={formation === f ? "primary" : "secondary"}
                    onClick={() => handleFormationChange(f)}
                  >
                    {f}
                  </Button>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/55">
                    Remplaçants (Match)
                  </p>
                  <p className="text-xs text-white/45">3 slots</p>
                </div>
                <div className="mt-4 flex justify-around gap-2">
                  {benchSlots.map((s) => {
                    const name = s.playerId
                      ? (players.find((p) => p.id === s.playerId)?.name ?? null)
                      : null;
                    return (
                      <div
                        key={s.id}
                        className="relative flex flex-col items-center gap-2 group"
                      >
                        <div className="relative h-12 w-12 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center bg-white/5 group-hover:border-cyan-500/50 transition-colors overflow-visible">
                          <SlotView
                            slot={{ ...s, x: 50, y: 50 }}
                            playerName={name}
                            onClear={() =>
                              setBenchSlots((prev) =>
                                prev.map((x) =>
                                  x.id === s.id ? { ...x, playerId: null } : x,
                                ),
                              )
                            }
                            onSetNumber={(n) =>
                              setBenchSlots((prev) =>
                                prev.map((x) =>
                                  x.id === s.id ? { ...x, number: n } : x,
                                ),
                              )
                            }
                          />
                        </div>
                        <span className="text-[10px] font-bold text-white/40 uppercase">
                          R{s.id.slice(-1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/55">
                    Effectif disponible
                  </p>
                  <p className="text-xs text-white/45">
                    {bench.length} joueurs
                  </p>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-white/30" />
                  </div>
                ) : bench.length === 0 ? (
                  <p className="py-6 text-center text-sm text-white/40">
                    Tous les joueurs sont placés.
                  </p>
                ) : (
                  <div
                    ref={benchRef}
                    className={
                      `mt-4 grid grid-cols-2 gap-2 rounded-xl p-2 transition ` +
                      (benchOver
                        ? "bg-emerald-500/10 border border-emerald-500/30"
                        : "")
                    }
                  >
                    {bench.map((p) => (
                      <PlayerChip key={p.id} id={p.id} name={p.name} />
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-4 text-xs text-white/40">
                Astuce: glisse un joueur sur un poste. Glisse sur le banc pour
                retirer.
              </p>
              <p className="mt-2 text-[11px] text-white/35 font-mono break-all">
                {debug}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col items-center gap-4">
          <DragOverlay dropAnimation={null}>
            {activeDragId ? (
              <div className="pointer-events-none rounded-xl border border-white/20 bg-black/80 px-3 py-2 text-sm font-bold !text-white shadow-2xl">
                {players.find((p) => p.id === activeDragId)?.name ?? ""}
              </div>
            ) : null}
          </DragOverlay>
          <div
            ref={pitchRef}
            className="relative w-full max-w-[420px] aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-[#1a472a] shadow-2xl"
          >
            {/* Pelouse */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.05)_50%,transparent_50%)] bg-[size:100%_10%]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.45)_100%)]" />

            {/* Lignes */}
            <div className="pointer-events-none absolute inset-4 border-2 border-white/60 opacity-90">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/60 -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/60 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-0 left-1/2 w-32 h-16 border-2 border-t-0 border-white/60 -translate-x-1/2" />
              <div className="absolute bottom-0 left-1/2 w-32 h-16 border-2 border-b-0 border-white/60 -translate-x-1/2" />
              <div className="absolute top-12 left-1/2 w-1 h-1 bg-white/60 rounded-full -translate-x-1/2" />
              <div className="absolute bottom-12 left-1/2 w-1 h-1 bg-white/60 rounded-full -translate-x-1/2" />
            </div>

            {/* Filigrane */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 opacity-20 grayscale brightness-200 bg-contain bg-no-repeat bg-center"
              style={{ backgroundImage: "url(/brand/logo.png)" }}
            />

            <div className="absolute top-6 left-0 right-0 text-center pointer-events-none">
              <h3 className="text-white/35 font-[var(--font-teko)] uppercase text-4xl font-black tracking-widest drop-shadow">
                {selectedTeam?.name ?? "GBA"}
              </h3>
            </div>

            {slots.map((s) => {
              const name = s.playerId
                ? (players.find((p) => p.id === s.playerId)?.name ?? null)
                : null;
              return (
                <SlotView
                  key={s.id}
                  slot={s}
                  playerName={name}
                  onClear={() =>
                    setSlots((prev) =>
                      prev.map((x) =>
                        x.id === s.id ? { ...x, playerId: null } : x,
                      ),
                    )
                  }
                  onSetNumber={(n) =>
                    setSlots((prev) =>
                      prev.map((x) =>
                        x.id === s.id ? { ...x, number: n } : x,
                      ),
                    )
                  }
                />
              );
            })}
          </div>

          <div className="flex gap-4 w-full max-w-[420px]">
            <Button
              onClick={exportImage}
              className="flex-1 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm"
            >
              Télécharger
            </Button>
            <Button
              onClick={openSaveModal}
              variant="primary"
              className="flex-1 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm bg-emerald-600 hover:bg-emerald-500"
            >
              Exporter note
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Enregistrer la feuille de match"
        description="Crée un match et sauvegarde la composition actuelle."
      >
        <form onSubmit={handleConfirmSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Date du match
            </label>
            <input
              type="date"
              required
              value={saveDate}
              onChange={(e) => setSaveDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Adversaire
            </label>
            <input
              type="text"
              required
              placeholder="Ex: FC Geispolsheim"
              value={saveOpponent}
              onChange={(e) => setSaveOpponent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsSaveModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 text-white hover:bg-emerald-700 border-none"
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>
    </DndContext>
  );
}
