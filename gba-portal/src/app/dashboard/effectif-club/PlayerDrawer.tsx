"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X, PencilLine, Shield, Phone, MapPin } from "lucide-react";

import { updateEffectifClubPlayer } from "./actions";

function normalizeMutation(value: string | null) {
  const v = String(value ?? "").trim().toLowerCase();
  if (!v) return null;
  if (v.includes("hp") || v.includes("hors")) return "Mutation HP";
  if (v.includes("surclass")) return "Surclassé";
  if (v.includes("disp")) return "Disp. Mutation";
  if (v.includes("mut")) return "Mutation";
  return null;
}

function mutationBadgeClass(label: string | null) {
  if (!label) return "";
  if (label === "Mutation HP")
    return "bg-rose-100 text-rose-700 border border-rose-200";
  if (label === "Surclassé")
    return "bg-violet-100 text-violet-700 border border-violet-200";
  if (label === "Disp. Mutation")
    return "bg-amber-100 text-amber-700 border border-amber-200";
  return "bg-blue-100 text-blue-700 border border-blue-200";
}

type Team = { id: string; name: string };

type Player = {
  player_uid: string | null;
  player_key: string;
  firstname: string | null;
  lastname: string | null;
  team_id: string | null;
  category: string | null;
  gender: string | null;
  license: string | null;
  mutation: string | null;
  debut_mutation: string | null;
  fin_mutation: string | null;
  mobile: string | null;
  email: string | null;
  resp_legal_1: string | null;
  adress_resp_legal_1: string | null;
  zip_resp_legal_1: string | null;
  city_resp_legal_1: string | null;
  mobile_resp_legal_1: string | null;
  email_resp_legal_1: string | null;
  resp_legal_2: string | null;
  adress_resp_legal_2: string | null;
  zip_resp_legal_2: string | null;
  city_resp_legal_2: string | null;
  mobile_resp_legal_2: string | null;
  email_resp_legal_2: string | null;
};

export function PlayerDrawer({
  selectedPlayer,
  teams,
  role,
}: {
  selectedPlayer: Player | null;
  teams: Team[];
  role: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const open = Boolean(selectedPlayer);

  const closeHref = useMemo(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("playerKey");
    params.delete("player");
    const q = params.toString();
    return q ? `${pathname}?${q}` : pathname;
  }, [pathname, searchParams]);

  if (!open || !selectedPlayer) return null;

  const mutationLabel = normalizeMutation(selectedPlayer.mutation);
  const fullName = `${selectedPlayer.firstname ?? ""} ${selectedPlayer.lastname ?? ""}`.trim() ||
    "Sans nom";

  return (
    <>
      <button
        type="button"
        aria-label="Fermer la fiche joueur"
        className="fixed inset-0 z-40 bg-slate-900/45"
        onClick={() => router.push(closeHref)}
      />

      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                Fiche joueur
              </p>
              <p className="mt-1 text-lg font-black uppercase tracking-wide text-slate-900">
                {fullName}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                  {selectedPlayer.category ?? "Catégorie —"}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                  {selectedPlayer.gender ?? "Genre —"}
                </span>
                {selectedPlayer.license ? (
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 border border-blue-100">
                    {selectedPlayer.license}
                  </span>
                ) : null}
                {mutationLabel ? (
                  <span
                    className={`rounded-full px-2.5 py-1 ${mutationBadgeClass(mutationLabel)}`}
                  >
                    {mutationLabel}
                  </span>
                ) : null}
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

        <form id="player-drawer-form" action={updateEffectifClubPlayer} className="space-y-4 px-5 py-4 pb-24">
          <input type="hidden" name="player_uid" value={selectedPlayer.player_uid ?? ""} />
          <input
            type="hidden"
            name="original_license"
            value={selectedPlayer.license ?? ""}
          />

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2">
              <PencilLine className="h-3.5 w-3.5" /> Identité sportive
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Licence
                <input name="license" defaultValue={selectedPlayer.license ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Équipe
                <select name="team_id" defaultValue={selectedPlayer.team_id ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm">
                  <option value="">Non assignée</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Prénom
                <input name="firstname" defaultValue={selectedPlayer.firstname ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Nom
                <input name="lastname" defaultValue={selectedPlayer.lastname ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Genre
                <input name="gender" defaultValue={selectedPlayer.gender ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Catégorie
                <input name="category" defaultValue={selectedPlayer.category ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" /> Contact joueur
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Mobile
                <input name="mobile" defaultValue={selectedPlayer.mobile ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Email
                <input name="email" defaultValue={selectedPlayer.email ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" /> Responsable légal 1
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Nom
                <input name="resp_legal_1" defaultValue={selectedPlayer.resp_legal_1 ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Mobile
                <input name="mobile_resp_legal_1" defaultValue={selectedPlayer.mobile_resp_legal_1 ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600 md:col-span-2">
                Adresse
                <input name="adress_resp_legal_1" defaultValue={selectedPlayer.adress_resp_legal_1 ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Code postal
                <input name="zip_resp_legal_1" defaultValue={selectedPlayer.zip_resp_legal_1 ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Ville
                <input name="city_resp_legal_1" defaultValue={selectedPlayer.city_resp_legal_1 ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600 md:col-span-2">
                Email
                <input name="email_resp_legal_1" defaultValue={selectedPlayer.email_resp_legal_1 ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> Responsable légal 2
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Nom
                <input name="resp_legal_2" defaultValue={selectedPlayer.resp_legal_2 ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Mobile
                <input name="mobile_resp_legal_2" defaultValue={selectedPlayer.mobile_resp_legal_2 ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600 md:col-span-2">
                Adresse
                <input name="adress_resp_legal_2" defaultValue={selectedPlayer.adress_resp_legal_2 ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Code postal
                <input name="zip_resp_legal_2" defaultValue={selectedPlayer.zip_resp_legal_2 ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600">
                Ville
                <input name="city_resp_legal_2" defaultValue={selectedPlayer.city_resp_legal_2 ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-600 md:col-span-2">
                Email
                <input name="email_resp_legal_2" defaultValue={selectedPlayer.email_resp_legal_2 ?? ""} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
              </label>
            </div>
          </section>
        </form>

        <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
              onClick={() => router.push(closeHref)}
            >
              Fermer
            </button>
            {role === "admin" ? (
              <button
                form="player-drawer-form"
                type="submit"
                className="h-10 rounded-xl bg-blue-600 px-4 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700"
              >
                Enregistrer
              </button>
            ) : (
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Lecture seule (coach)
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
