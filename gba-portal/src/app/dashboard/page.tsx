import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardCheck,
  Users,
  Calendar,
  ArrowRight,
  MapPin,
  Clock,
  ChevronRight,
  AlertCircle,
  Trophy,
  Lock,
} from "lucide-react";

import { getDashboardHomeData } from "@/lib/dashboard/server-data";
import { getCoachRosterHealth } from "@/lib/dashboard/roster-health";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Espace GBA · Dashboard",
  description:
    "Tableau de bord opérationnel : priorités terrain, effectif et organisation du club.",
};

const weekdayOrder = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default async function DashboardPage() {
  const { scope, sessions } = await getDashboardHomeData();
  const { players: healthPlayers, stats: healthStats } =
    await getCoachRosterHealth();

  const orderedSessions = sessions.slice().sort((a, b) => {
    const ai = weekdayOrder.indexOf(a.day ?? "");
    const bi = weekdayOrder.indexOf(b.day ?? "");
    if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return String(a.start_time ?? "").localeCompare(String(b.start_time ?? ""));
  });

  const nextSession = orderedSessions[0] ?? null;

  return (
    <div className="space-y-8 pb-10">
      {/* 1. SECTION TERRAIN : L'ACTION DU JOUR */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
            Action terrain
          </h3>
          <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">
            Live
          </span>
        </div>

        <Card className="overflow-hidden border-none bg-blue-600 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 relative group">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />

          <CardContent className="p-0 relative z-10">
            {nextSession ? (
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-2 w-2 rounded-full bg-blue-200 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                        Prochaine séance
                      </span>
                    </div>
                    <h3 className="text-4xl md:text-6xl font-black text-white uppercase font-[var(--font-teko)] tracking-tight leading-none">
                      {nextSession.team?.name ?? "Mon Équipe"}
                    </h3>
                    <div className="mt-6 flex flex-wrap gap-5 text-blue-50/80">
                      <div className="flex items-center gap-2 text-sm md:text-base font-bold uppercase tracking-wide">
                        <Calendar className="h-5 w-5 text-blue-200" />
                        <span>{nextSession.day}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm md:text-base font-bold uppercase tracking-wide">
                        <Clock className="h-5 w-5 text-blue-200" />
                        <span>
                          {nextSession.start_time} — {nextSession.end_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm md:text-base font-bold uppercase tracking-wide">
                        <MapPin className="h-5 w-5 text-blue-200" />
                        <span>{nextSession.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                    <Link href="/dashboard/presences">
                      <Button className="w-full sm:w-auto rounded-3xl h-16 md:h-20 px-8 md:px-12 font-black uppercase tracking-widest text-base md:text-lg bg-white text-blue-600 hover:bg-blue-50 shadow-xl transition-all active:scale-95">
                        <ClipboardCheck className="mr-3 h-6 w-6" />
                        Pointer
                      </Button>
                    </Link>
                    <Link href="/dashboard/tactique">
                      <Button
                        variant="secondary"
                        className="w-full sm:w-auto rounded-3xl h-16 md:h-20 px-8 font-black uppercase tracking-widest text-sm bg-blue-700/50 hover:bg-blue-700 border-none text-white backdrop-blur-md"
                      >
                        <Trophy className="mr-3 h-5 w-5" /> Match
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-blue-100/60 font-black uppercase tracking-[0.2em] italic">
                  Aucune séance prévue
                </p>
                <Link href="/dashboard/planning" className="mt-6 inline-block">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-xs">
                    Ouvrir le planning
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 2. CORE GRID : PLANNING & TEAM HEALTH */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* LEFT: Agenda Hebdo */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
              Agenda Hebdomadaire
            </h4>
            <Link
              href="/dashboard/planning"
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              Tout le planning <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {orderedSessions.slice(0, 6).map((s) => (
              <Link key={s.id} href="/dashboard/presences" className="group">
                <Card className="rounded-3xl border-slate-100 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                        <span className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">
                          {s.day?.slice(0, 3)}
                        </span>
                        <span className="text-sm font-black text-slate-700 uppercase group-hover:text-blue-600 transition-colors">
                          {s.start_time?.split(":")[0]}h
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 uppercase tracking-wide group-hover:text-blue-600 transition-colors truncate">
                          {s.team?.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {s.location}
                          </span>
                          <span className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest">
                            {s.start_time} — {s.end_time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {orderedSessions.length === 0 && (
              <div className="p-12 text-center rounded-[2.5rem] border-2 border-dashed border-slate-100">
                <Calendar className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Planning vide
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Team Status & Workflow */}
        <div className="lg:col-span-5 space-y-8">
          {/* TEAM HEALTH WIDGET */}
          {scope.role === "coach" && healthStats && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 px-2">
                État de l&apos;effectif
              </h4>
              <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-sm overflow-hidden border-t-4 border-t-blue-600">
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                      <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-2">
                        Prêts (Admin)
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">
                          {healthStats.ready}
                        </span>
                        <span className="text-sm font-black text-slate-300 italic">
                          / {healthStats.total}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 rounded-3xl bg-amber-50 border border-amber-100 text-center">
                      <p className="text-[10px] uppercase text-amber-700 font-black tracking-widest mb-2">
                        Dotations ⚠️
                      </p>
                      <span className="text-3xl font-black text-amber-600 tracking-tighter">
                        {healthStats.pendingEquipment}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                      Urgences administratives
                    </p>
                    {healthPlayers
                      .filter(
                        (p) =>
                          p.payment_status === "unpaid" ||
                          p.licence_status === "missing",
                      )
                      .slice(0, 3)
                      .map((p) => (
                        <Link
                          key={p.id}
                          href={`/dashboard/effectif?search=${p.last_name}`}
                          className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all group"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-800 uppercase group-hover:text-blue-600 truncate">
                              {p.last_name} {p.first_name[0]}.
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              Taille : {p.size_label || "NC"}
                            </p>
                          </div>
                          <div className="px-2.5 py-1 rounded-full bg-red-100 text-red-600 text-[8px] font-black uppercase tracking-wider">
                            Bloqué
                          </div>
                        </Link>
                      ))}
                    <Link
                      href="/dashboard/effectif"
                      className="block text-center pt-2"
                    >
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:underline">
                        Gérer tout l&apos;effectif
                      </span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* WORKFLOW TOOLBOX */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 px-2">
              Boîte à outils
            </h4>
            <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-sm overflow-hidden">
              <CardContent className="p-4 space-y-2">
                {[
                  {
                    label: "Effectif complet",
                    href:
                      scope.role === "coach"
                        ? "/dashboard/effectif"
                        : "/dashboard/joueurs",
                    icon: Users,
                    desc: "Contacts & données",
                  },
                  {
                    label: "Feuilles de match",
                    href: "/dashboard/tactique",
                    icon: Trophy,
                    desc: "Compos & Tactiques",
                  },
                  {
                    label: "Accès & Staff",
                    href: "/dashboard/acces",
                    icon: Lock,
                    desc: "Permissions (Admin)",
                  },
                ].map((tool) => (
                  <Link
                    key={tool.label}
                    href={tool.href}
                    className="flex items-center gap-5 p-4 rounded-3xl border border-transparent hover:border-blue-100 hover:bg-blue-50 transition-all group"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:border-blue-100 transition-all shadow-sm">
                      <tool.icon className="h-6 w-6 text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-wide group-hover:text-blue-700 transition-colors">
                        {tool.label}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                        {tool.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* TIP AREA */}
          <div className="p-8 rounded-[2.5rem] border border-blue-50 bg-blue-50/50 flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1.5">
                Coach Tip
              </p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                &quot;Faites pointer les joueurs directement à l&apos;arrivée au
                stade pour gagner du temps lors de la causerie.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
