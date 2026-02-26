"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X, Shield, Users, UserCircle2 } from "lucide-react";

type TeamDetail = {
  id: string;
  name: string;
  category: string | null;
  pole: string | null;
  players: Array<{
    player_key: string;
    firstname: string | null;
    lastname: string | null;
    category: string | null;
    gender: string | null;
    license: string | null;
    mutation: string | null;
  }>;
  staff: Array<{
    team_id: string;
    profile_id: string;
    role_in_team: "coach" | "assistant" | "staff";
    is_primary: boolean;
    profile: { full_name: string | null; email: string } | null;
  }>;
  primaryCoach?: {
    profile?: { full_name: string | null; email: string } | null;
  } | null;
};

function fullName(firstname: string | null, lastname: string | null) {
  return `${firstname ?? ""} ${lastname ?? ""}`.trim() || "Sans nom";
}

function normalizeMutation(value: string | null) {
  const v = String(value ?? "").trim().toLowerCase();
  if (!v) return null;
  if (v.includes("hp") || v.includes("hors")) return "Mutation HP";
  if (v.includes("surclass")) return "Surclassé";
  if (v.includes("disp")) return "Disp. Mutation";
  if (v.includes("mut")) return "Mutation";
  return null;
}

export function TeamDrawer({ team }: { team: TeamDetail | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const closeHref = useMemo(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("team");
    const q = params.toString();
    return q ? `${pathname}?${q}` : pathname;
  }, [pathname, searchParams]);

  if (!team) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Fermer la fiche équipe"
        className="fixed inset-0 z-40 bg-slate-900/45"
        onClick={() => router.push(closeHref)}
      />

      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                Fiche équipe
              </p>
              <p className="mt-1 text-lg font-black uppercase tracking-wide text-slate-900">
                {team.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                  {team.category ?? "Catégorie —"}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                  {team.pole ?? "Sans pôle"}
                </span>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">
                  {team.players.length} joueurs
                </span>
              </div>
            </div>
            <button
              type="button"
              className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50"
              onClick={() => router.push(closeHref)}
            >
              <X className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5 pb-10">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
              <Shield className="h-3.5 w-3.5" /> Staff équipe
            </h3>
            {team.staff.length === 0 ? (
              <p className="text-xs text-slate-500">Aucun staff assigné.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {team.staff.map((s) => (
                  <div
                    key={`${s.team_id}-${s.profile_id}`}
                    className="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <p className="text-xs font-bold text-slate-800">
                      {s.profile?.full_name ?? s.profile?.email ?? "Profil"}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">
                      {s.role_in_team}
                      {s.is_primary ? " • principal" : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
              <Users className="h-3.5 w-3.5" /> Roster joueurs
            </h3>
            {team.players.length === 0 ? (
              <p className="text-xs text-slate-500">Aucun joueur dans cette équipe.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {team.players.map((p) => {
                  const m = normalizeMutation(p.mutation);
                  return (
                    <Link
                      key={p.player_key}
                      href={`/dashboard/effectif-club?team=${encodeURIComponent(team.id)}&playerKey=${encodeURIComponent(p.player_key)}`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:border-blue-300 hover:bg-blue-50 transition"
                    >
                      <p className="text-xs font-bold text-slate-800">
                        {fullName(p.firstname, p.lastname)}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">
                        {p.category ?? "—"} • {p.gender ?? "—"}
                      </p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        {p.license ? (
                          <p className="text-[10px] text-slate-400">Licence: {p.license}</p>
                        ) : null}
                        {m ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-blue-700">
                            {m}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
              <UserCircle2 className="h-3.5 w-3.5" /> Coaching principal
            </h3>
            <p className="text-sm font-bold text-slate-800">
              {team.primaryCoach?.profile?.full_name ?? "Non défini"}
            </p>
          </section>
        </div>
      </aside>
    </>
  );
}
