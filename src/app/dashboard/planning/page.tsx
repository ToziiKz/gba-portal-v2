import {
  PlanningView,
  type Session,
  type TeamOption,
} from "@/components/dashboard/planning/PlanningView";
import { getScopedPlanningData } from "@/lib/dashboard/server-data";

export const metadata = {
  title: "Planning · ESPACE GBA",
};

export default async function PlanningPage() {
  const { scope, sessions, teams } = await getScopedPlanningData();

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.32em] text-slate-400">
          Module
        </p>
        <h2 className="mt-2 font-[var(--font-teko)] text-4xl font-black uppercase tracking-[0.04em] text-slate-900">
          Planning
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          {scope.role === "coach"
            ? "Vue terrain de vos équipes : créneaux, chevauchements et accès rapide au planning."
            : "Planning club : création, suppression et pilotage hebdomadaire."}
        </p>
      </div>

      <PlanningView
        sessions={(sessions ?? []) as Session[]}
        teams={(teams ?? []) as unknown as TeamOption[]}
      />
    </div>
  );
}
