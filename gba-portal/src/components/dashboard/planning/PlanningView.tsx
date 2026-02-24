"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  User,
  MapPin,
} from "lucide-react";

import { CreatePlanningSessionModal } from "./CreatePlanningSessionModal";
import { deletePlanningSession } from "@/app/dashboard/planning/actions";
import { RosterChecklist } from "@/components/dashboard/RosterChecklist";

const planningDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;
type PlanningDay = (typeof planningDays)[number];

export type TeamOption = { id: string; name: string; category: string };

export type Session = {
  id: string;
  day: PlanningDay;
  session_date?: string | null;
  pole: string;
  start_time: string;
  end_time: string;
  location: string;
  staff: string[];
  note: string | null;
  team: { id: string; name: string; category: string } | null;
};

type Props = {
  sessions: Session[];
  teams: TeamOption[];
};

function sessionTimeLabel(s: Session) {
  return `${s.start_time}–${s.end_time}`;
}

function toMinutes(v: string) {
  const [h, m] = v.split(":").map(Number);
  return h * 60 + m;
}

function buildTimeSlots(start = "08:00", end = "22:00", stepMinutes = 60) {
  const out: string[] = [];
  let cur = toMinutes(start);
  const max = toMinutes(end);
  while (cur <= max) {
    const h = String(Math.floor(cur / 60)).padStart(2, "0");
    const m = String(cur % 60).padStart(2, "0");
    out.push(`${h}:${m}`);
    cur += stepMinutes;
  }
  return out;
}

type SessionTone =
  | "training"
  | "event"
  | "plateau"
  | "match_championnat"
  | "match_coupe"
  | "match_amical"
  | "competition";

function getSessionTone(s: Session): SessionTone {
  const note = (s.note ?? "").toLowerCase();
  const pole = (s.pole ?? "").toLowerCase();
  const name = (s.team?.name ?? "").toLowerCase();

  if (note.includes("[plateau]") || note.includes("plateau")) return "plateau";
  if (note.includes("championnat")) return "match_championnat";
  if (note.includes("coupe")) return "match_coupe";
  if (note.includes("amical")) return "match_amical";
  if (
    note.includes("[competition]") ||
    note.includes("compétition") ||
    note.includes("competition") ||
    note.includes("[match]") ||
    note.includes("match")
  )
    return "competition";
  if (
    note.includes("[event]") ||
    pole.includes("évèn") ||
    pole.includes("évén") ||
    pole.includes("réunion") ||
    name.includes("réunion")
  )
    return "event";
  return "training";
}

function sessionKindClasses(kind: SessionTone) {
  if (kind === "match_championnat")
    return "border-amber-300 bg-amber-100 hover:border-amber-400 hover:bg-amber-200/70";
  if (kind === "match_coupe")
    return "border-amber-400 bg-amber-200 hover:border-amber-500 hover:bg-amber-300/70";
  if (kind === "match_amical")
    return "border-amber-200 bg-amber-50 hover:border-amber-300 hover:bg-amber-100/70";
  if (kind === "plateau")
    return "border-amber-500 bg-amber-300/60 hover:border-amber-600 hover:bg-amber-300/90";
  if (kind === "competition")
    return "border-amber-300 bg-amber-100/70 hover:border-amber-400 hover:bg-amber-200/70";
  if (kind === "event")
    return "border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100/60";
  return "border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100/60";
}

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return weekNo;
}

function getWeekDays(anchor: Date) {
  const d = new Date(anchor);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));

  return planningDays.map((_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

export function PlanningView({ sessions, teams }: Props) {
  const [currentAnchor, setCurrentAnchor] = React.useState(new Date());
  const [activeSite, setActiveSite] = React.useState<"Ittenheim" | "Achenheim">(
    "Ittenheim",
  );
  const [pole, setPole] = React.useState<string | "all">("all");
  const [terrain, setTerrain] = React.useState<
    "all" | "synthetique" | "herbe" | "clubhouse"
  >("all");
  const [query, setQuery] = React.useState("");
  const [selectedSession, setSelectedSession] = React.useState<Session | null>(
    null,
  );
  const [modalView, setModalView] = React.useState<"details" | "attendance">(
    "details",
  );
  const [createOpen, setCreateOpen] = React.useState(false);

  const weekDays = React.useMemo(
    () => getWeekDays(currentAnchor),
    [currentAnchor],
  );
  const weekNumber = React.useMemo(
    () => getWeekNumber(currentAnchor),
    [currentAnchor],
  );

  const navigateWeek = (direction: number) => {
    const next = new Date(currentAnchor);
    next.setDate(currentAnchor.getDate() + direction * 7);
    setCurrentAnchor(next);
  };

  const fixedPoles = [
    "École de foot",
    "Pré-formation",
    "Formation",
    "Féminines",
    "Séniors",
    "Vétérans",
    "Super-Vétérans",
    "Évènements",
    "Réunion",
  ];

  React.useEffect(() => {
    if (!selectedSession) setModalView("details");
  }, [selectedSession]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();

    const weekStart = new Date(weekDays[0]);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekDays[6]);
    weekEnd.setHours(23, 59, 59, 999);

    return sessions
      .filter((s) => {
        const sLoc = (s.location || "").toLowerCase();
        const aLoc = (activeSite || "").toLowerCase();
        return sLoc.includes(aLoc);
      })
      .filter((s) => (pole === "all" ? true : s.pole === pole))
      .filter((s) => {
        if (terrain === "all") return true;
        const loc = (s.location || "").toLowerCase();
        if (terrain === "synthetique") return loc.includes("synth");
        if (terrain === "herbe") return loc.includes("herbe");
        if (terrain === "clubhouse") return loc.includes("clubhouse");
        return true;
      })
      .filter((s) => {
        // If a specific date exists, only show it in its corresponding week
        if (!s.session_date) return true;
        const d = new Date(`${s.session_date}T00:00:00`);
        return d >= weekStart && d <= weekEnd;
      })
      .filter((s) => {
        if (!q) return true;
        const hay =
          `${s.team?.name ?? ""} ${s.team?.category ?? ""} ${s.location} ${s.staff.join(" ")} ${s.note ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
  }, [sessions, pole, terrain, query, activeSite, weekDays]);

  const sessionsByDay = React.useMemo(() => {
    const map = new Map<PlanningDay, Session[]>();
    for (const d of planningDays) map.set(d, []);

    for (const s of filtered) {
      const d = s.day as PlanningDay;
      if (map.has(d)) {
        map.get(d)?.push(s);
      }
    }

    for (const d of planningDays) {
      map
        .get(d)
        ?.sort((a, b) =>
          (a.start_time || "").localeCompare(b.start_time || ""),
        );
    }
    return map;
  }, [filtered]);

  const timelineStart = "10:00";
  const timelineEnd = "22:00";
  const pxPerHour = 52;
  const slotLabels = React.useMemo(
    () => buildTimeSlots(timelineStart, timelineEnd, 60),
    [],
  );
  const startMin = React.useMemo(() => toMinutes(timelineStart), []);
  const endMin = React.useMemo(() => toMinutes(timelineEnd), []);
  const totalMinutes = endMin - startMin;

  const placedByDay = React.useMemo(() => {
    const map = new Map<
      PlanningDay,
      Array<
        Session & { lane: number; lanes: number; top: number; height: number }
      >
    >();

    for (const day of planningDays) {
      const daySessions = (sessionsByDay.get(day) ?? [])
        .slice()
        .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
      const placed: Array<
        Session & { lane: number; lanes: number; top: number; height: number }
      > = [];

      for (const s of daySessions) {
        const overlaps = daySessions.filter((o) => {
          if (o.id === s.id) return false;
          return (
            toMinutes(s.start_time) < toMinutes(o.end_time) &&
            toMinutes(o.start_time) < toMinutes(s.end_time)
          );
        });
        const lanes = Math.min(4, overlaps.length + 1);

        const used = new Set(
          placed
            .filter(
              (p) =>
                toMinutes(p.start_time) < toMinutes(s.end_time) &&
                toMinutes(s.start_time) < toMinutes(p.end_time),
            )
            .map((p) => p.lane),
        );

        let lane = 0;
        while (used.has(lane) && lane < lanes - 1) lane += 1;

        const top = Math.max(
          0,
          ((toMinutes(s.start_time) - startMin) / 60) * pxPerHour,
        );
        const height = Math.max(
          22,
          ((toMinutes(s.end_time) - toMinutes(s.start_time)) / 60) * pxPerHour -
            2,
        );

        placed.push({ ...s, lane, lanes, top, height });
      }

      map.set(day, placed);
    }

    return map;
  }, [sessionsByDay, startMin]);

  return (
    <div className="grid gap-4">
      {/* Top Bar: Site Switcher + Week Navigation + Filters */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          {/* Site Switcher */}
          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 w-fit">
            {(["Ittenheim", "Achenheim"] as const).map((site) => (
              <button
                key={site}
                type="button"
                onClick={() => setActiveSite(site)}
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  activeSite === site
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                }`}
              >
                {site}
              </button>
            ))}
          </div>

          {/* Week Nav */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl p-1">
            <button
              type="button"
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-2 px-2">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                Semaine {weekNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-[170px]">
            <select
              value={pole}
              onChange={(e) => setPole(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none focus:border-blue-300 transition-all appearance-none"
            >
              <option value="all">Tous les Pôles</option>
              {fixedPoles.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setTerrain("all")}
              className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg ${terrain === "all" ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => setTerrain("synthetique")}
              className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg ${terrain === "synthetique" ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}
            >
              Synthé
            </button>
            <button
              type="button"
              onClick={() => setTerrain("herbe")}
              className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg ${terrain === "herbe" ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}
            >
              Herbe
            </button>
            <button
              type="button"
              onClick={() => setTerrain("clubhouse")}
              className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg ${terrain === "clubhouse" ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}
            >
              Clubhouse
            </button>
          </div>

          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-[150px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:border-blue-300 transition-all"
            />
          </div>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-10 px-5 text-[10px] font-black uppercase tracking-[0.2em] border border-slate-200 hover:bg-slate-50 text-slate-600"
            onClick={() => setCreateOpen(true)}
          >
            + Évènement
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl !text-slate-900">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-xl font-black uppercase tracking-widest text-slate-900">
            Planning Hebdomadaire
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
            {filtered.length} évènement(s) à {activeSite}
          </p>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Aucune séance trouvée pour {activeSite}
          </p>
        ) : (
          <div className="max-w-full overflow-hidden rounded-2xl border border-slate-200">
            <div className="w-full">
              <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-slate-200 bg-slate-50">
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Heure
                </div>
                {planningDays.map((day, idx) => {
                  const date = weekDays[idx];
                  const isToday =
                    new Date().toDateString() === date.toDateString();
                  return (
                    <div
                      key={day}
                      className={`px-3 py-2 ${isToday ? "bg-blue-50" : ""}`}
                    >
                      <p
                        className={`text-[10px] font-black uppercase tracking-wider ${isToday ? "text-blue-700" : "text-slate-600"}`}
                      >
                        {day}
                      </p>
                      <p className="text-xs font-bold text-slate-500">
                        {date.toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]">
                <div
                  className="relative border-r border-slate-200 bg-slate-50"
                  style={{ height: `${(totalMinutes / 60) * pxPerHour}px` }}
                >
                  {slotLabels.map((slot, i) => (
                    <div
                      key={slot}
                      className="absolute left-0 right-0 border-t border-slate-100"
                      style={{ top: `${i * pxPerHour}px` }}
                    >
                      <span className="absolute -top-2.5 left-2 bg-slate-50 px-1 text-[10px] font-bold text-slate-500">
                        {slot}
                      </span>
                    </div>
                  ))}
                </div>

                {planningDays.map((day) => {
                  const placed = placedByDay.get(day) ?? [];
                  return (
                    <div
                      key={day}
                      className="relative border-l border-slate-100"
                      style={{ height: `${(totalMinutes / 60) * pxPerHour}px` }}
                    >
                      {slotLabels.map((_, i) => (
                        <div
                          key={`${day}-line-${i}`}
                          className="absolute left-0 right-0 border-t border-slate-100"
                          style={{ top: `${i * pxPerHour}px` }}
                        />
                      ))}

                      {placed.map((s) => {
                        const colWidth = 100 / s.lanes;
                        const left = s.lane * colWidth;
                        const kind = getSessionTone(s);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedSession(s)}
                            className={`absolute overflow-hidden rounded-lg border px-1 py-0.5 text-left ${sessionKindClasses(kind)}`}
                            style={{
                              top: `${s.top}px`,
                              height: `${s.height}px`,
                              left: `calc(${left}% + 2px)`,
                              width: `calc(${colWidth}% - 4px)`,
                            }}
                          >
                            <p className="truncate text-[9px] font-black uppercase tracking-tight text-slate-900">
                              {s.team?.name ?? "—"}
                            </p>
                            <p className="mt-0.5 text-[9px] font-semibold text-slate-600">
                              {s.start_time}-{s.end_time}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title={
          selectedSession ? `Séance ${selectedSession.team?.name ?? ""}` : ""
        }
        description={
          selectedSession
            ? `${selectedSession.day} • ${sessionTimeLabel(selectedSession)}`
            : ""
        }
      >
        {selectedSession ? (
          modalView === "attendance" && selectedSession.team ? (
            <RosterChecklist
              sessionId={selectedSession.id}
              teamId={selectedSession.team.id}
              teamLabel={`${selectedSession.team.category} • ${selectedSession.team.name}`}
              onBack={() => setModalView("details")}
              onClose={() => setSelectedSession(null)}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-500">
                    <MapPin className="h-4 w-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      Terrain
                    </p>
                  </div>
                  <p className="text-lg font-black uppercase tracking-tight text-slate-900">
                    {selectedSession.location.toLowerCase().includes("synth")
                      ? "Synthétique"
                      : selectedSession.location.toLowerCase().includes("herbe")
                        ? "Herbe"
                        : selectedSession.location
                              .toLowerCase()
                              .includes("clubhouse")
                          ? "Clubhouse"
                          : "Non précisé"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedSession.location}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-500">
                    <User className="h-4 w-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      Coach
                    </p>
                  </div>
                  <p className="text-lg font-black uppercase tracking-tight text-slate-900">
                    {selectedSession.staff?.length
                      ? selectedSession.staff.join(", ")
                      : "Non précisé"}
                  </p>
                </div>
              </div>

              {selectedSession.note ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Note
                  </p>
                  <p className="text-sm italic leading-relaxed text-slate-700">
                    &quot;{selectedSession.note}&quot;
                  </p>
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
                {selectedSession.team ? (
                  <Button
                    onClick={() => setModalView("attendance")}
                    className="bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700"
                  >
                    Gérer les présences
                  </Button>
                ) : null}
                <form action={deletePlanningSession}>
                  <input type="hidden" name="id" value={selectedSession.id} />
                  <Button
                    variant="secondary"
                    type="submit"
                    className="border-rose-200 text-[10px] font-black uppercase tracking-widest text-rose-700 hover:bg-rose-50"
                  >
                    Supprimer
                  </Button>
                </form>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedSession(null)}
                  className="text-[10px] font-black uppercase tracking-widest"
                >
                  Fermer
                </Button>
              </div>
            </div>
          )
        ) : null}
      </Modal>

      <CreatePlanningSessionModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        teams={teams}
      />
    </div>
  );
}
