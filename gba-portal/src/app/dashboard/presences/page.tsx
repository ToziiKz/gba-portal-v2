import type { Metadata } from "next";

import { getScopedPlanningData } from "@/lib/dashboard/server-data";
import {
  PresencesView,
  type PresenceSession,
} from "@/components/dashboard/presences/PresencesView";

export const metadata: Metadata = {
  title: "Présences · ESPACE GBA",
  robots: { index: false, follow: false },
};

export default async function PresencesPage() {
  const { sessions } = await getScopedPlanningData();

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.32em] text-slate-400">
          Module
        </p>
        <h2 className="mt-2 font-[var(--font-teko)] text-4xl font-black uppercase tracking-[0.04em] text-slate-900">
          Présences
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          Pointage rapide des séances avec vue coach-first, filtres clairs et
          accès direct à la feuille.
        </p>
      </div>

      <PresencesView
        sessions={(sessions ?? []) as unknown as PresenceSession[]}
      />
    </div>
  );
}
