import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  ArrowRight,
  MapPin,
  Clock,
  ChevronRight,
  AlertCircle,
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
  const { sessions } = await getDashboardHomeData();
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
      <section>
        <Card className="overflow-hidden border-none bg-blue-600 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 relative group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />

          <CardContent className="p-0 relative z-10">
            {nextSession ? (
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                      Prochaine séance
                    </span>
                    <h3 className="mt-3 text-4xl md:text-6xl font-black text-white uppercase font-[var(--font-teko)] tracking-tight leading-none">
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

                  <Link href="/dashboard/planning">
                    <Button className="rounded-3xl h-14 px-8 font-black uppercase tracking-widest bg-white text-blue-600 hover:bg-blue-50 shadow-xl">
                      Voir le planning
                    </Button>
                  </Link>
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

      <div className="grid gap-8 lg:grid-cols-12">
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
              <Link key={s.id} href="/dashboard/planning" className="group">
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

        <div className="lg:col-span-5 space-y-8">
          <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-sm overflow-hidden border-t-4 border-t-blue-600">
            <CardContent className="p-8 space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Effectif suivi
              </h4>
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-2">
                  Joueurs visibles
                </p>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">
                  {healthStats?.total ?? 0}
                </span>
              </div>
              <div className="space-y-2">
                {healthPlayers.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/effectif-club`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200"
                  >
                    <span className="text-xs font-black text-slate-800 uppercase truncate">
                      {p.last_name} {p.first_name}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[2.5rem] border border-blue-50 bg-blue-50/50 flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1.5">
                Focus
              </p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                Priorité au planning, aux équipes et à la tenue propre de
                l&apos;effectif.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
