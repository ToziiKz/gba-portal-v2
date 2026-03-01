import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Users,
  ShieldCheck,
  UserCircle2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

import { getDashboardHomeData } from "@/lib/dashboard/server-data";
import { getCoachRosterHealth } from "@/lib/dashboard/roster-health";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Espace GBA · Vue d’ensemble",
  description:
    "Cockpit opérationnel du club : planning, effectif, équipes et priorités.",
};

const weekdayOrder = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default async function DashboardPage() {
  const { teamCount, playerCount, sessionsCount, sessions } =
    await getDashboardHomeData();
  const { players: rosterPlayers } = await getCoachRosterHealth();

  const orderedSessions = sessions.slice().sort((a, b) => {
    const ai = weekdayOrder.indexOf(a.day ?? "");
    const bi = weekdayOrder.indexOf(b.day ?? "");
    if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return String(a.start_time ?? "").localeCompare(String(b.start_time ?? ""));
  });

  const nextSession = orderedSessions[0] ?? null;
  const teamsWithoutName = orderedSessions.filter((s) => !s.team?.name).length;

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-[2.5rem] border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-8 text-white shadow-2xl shadow-blue-500/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-100/80">
              Vue d’ensemble
            </p>
            <h2 className="mt-2 font-[var(--font-teko)] text-5xl font-black uppercase tracking-tight leading-none">
              Cockpit du club
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-blue-50/90">
              Suivi visuel des priorités du jour : planning, effectif, équipes
              et alertes opérationnelles.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/effectif-club"
              className="rounded-xl bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-blue-700 hover:bg-blue-50"
            >
              Ouvrir Effectif Club
            </Link>
            <Link
              href="/dashboard/planning"
              className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/20"
            >
              Voir planning
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-3xl border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Équipes
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">{teamCount}</p>
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
              <p className="mt-1 text-3xl font-black text-slate-900">{playerCount}</p>
            </div>
            <Users className="h-7 w-7 text-indigo-600" />
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Séances
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">{sessionsCount}</p>
            </div>
            <Calendar className="h-7 w-7 text-emerald-600" />
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Joueurs scope
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {rosterPlayers.length}
              </p>
            </div>
            <UserCircle2 className="h-7 w-7 text-amber-600" />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 rounded-3xl border-slate-100 bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">
                Planning immédiat
              </CardTitle>
              <Link
                href="/dashboard/planning"
                className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline flex items-center gap-1"
              >
                Ouvrir module <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextSession ? (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                  Prochaine séance
                </p>
                <p className="mt-1 text-lg font-black uppercase text-slate-900">
                  {nextSession.team?.name ?? "Équipe"}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-bold text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-blue-500" /> {nextSession.day}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-500" /> {nextSession.start_time} — {nextSession.end_time}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-blue-500" /> {nextSession.location}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                Aucune séance planifiée
              </div>
            )}

            <div className="grid gap-2">
              {orderedSessions.slice(0, 5).map((s) => (
                <Link
                  key={s.id}
                  href="/dashboard/planning"
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black uppercase text-slate-800">
                      {s.team?.name ?? "Équipe"}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">
                      {s.day} • {s.start_time} — {s.end_time}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-3xl border-slate-100 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">
                Alertes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {teamsWithoutName > 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {teamsWithoutName} séance(s) sans équipe correctement liée
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700">
                  Aucune alerte bloquante détectée.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-100 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">
                Actions rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link
                href="/dashboard/acces"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-blue-200 hover:bg-blue-50"
              >
                Gérer accès & rôles
              </Link>
              <Link
                href="/dashboard/effectif-club"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-blue-200 hover:bg-blue-50"
              >
                Ouvrir effectif club
              </Link>
              <Link
                href="/dashboard/planning"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-blue-200 hover:bg-blue-50"
              >
                Piloter planning
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
