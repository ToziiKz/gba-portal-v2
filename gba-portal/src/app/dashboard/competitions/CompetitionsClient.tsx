"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { usePermissions } from "@/components/PermissionsProvider";
import { createCompetition, deleteCompetition } from "./actions";
import { useRouter } from "next/navigation";

export type Competition = {
  id: string;
  category: string;
  team_home: string;
  team_away: string;
  score_home: number;
  score_away: number;
  match_date: string;
};

export default function CompetitionsClient({
  initialCompetitions,
}: {
  initialCompetitions: Competition[];
}) {
  const router = useRouter();
  const { role } = usePermissions();
  const isAdmin = role === "admin";
  const isStaff = role === "resp_sportif" || isAdmin; // Staff can also manage competitions in this model

  const [competitions, setCompetitions] =
    React.useState<Competition[]>(initialCompetitions);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  // Update local state when prop changes
  React.useEffect(() => {
    setCompetitions(initialCompetitions);
  }, [initialCompetitions]);

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("Supprimer ce résultat ?")) return;

    try {
      await deleteCompetition(id);
      router.refresh();
      setFeedback("Résultat supprimé.");
    } catch {
      setFeedback("Erreur lors de la suppression.");
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      await createCompetition(formData);
      setIsModalOpen(false);
      router.refresh();
      setFeedback("Résultat enregistré.");
    } catch {
      setFeedback("Erreur lors de l’enregistrement.");
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">
            Compétitions
          </h1>
          <p className="text-black/60">Suivi des résultats et classements.</p>
        </div>
        {isStaff && (
          <Button onClick={() => setIsModalOpen(true)}>
            + Ajouter un résultat
          </Button>
        )}
      </div>

      {feedback && (
        <div className="rounded-2xl bg-black/5 p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <p className="text-sm font-medium text-black">{feedback}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {competitions.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-black/10 bg-black/5 p-12 text-center">
            <p className="text-black/40">Aucun résultat enregistré.</p>
          </div>
        ) : (
          competitions.map((res) => (
            <Card
              key={res.id}
              className="premium-card card-shell rounded-3xl group relative"
            >
              {isAdmin && (
                <button
                  onClick={() => handleDelete(res.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                  title="Supprimer"
                >
                  ×
                </button>
              )}
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
                    {res.category}
                  </span>
                  <span className="text-xs text-black/40">
                    {res.match_date}
                  </span>
                </div>
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{res.team_home}</span>
                  <span className="text-black/40 text-sm">vs</span>
                  <span>{res.team_away}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center py-4 bg-black/5 rounded-2xl">
                  <span className="text-3xl font-black tabular-nums tracking-tighter">
                    {res.score_home} - {res.score_away}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter un résultat"
        description="Enregistrez un score de match."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black/55">
                Catégorie
              </label>
              <select
                name="category"
                className="w-full rounded-xl border border-black/10 bg-black/5 px-3 py-2 text-sm outline-none focus:border-black/20"
              >
                {["U9", "U11", "U13", "U15", "U17", "U20", "Seniors"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black/55">
                Date
              </label>
              <input
                name="match_date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border border-black/10 bg-black/5 px-3 py-2 text-sm outline-none focus:border-black/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black/55">
                Domicile
              </label>
              <input
                name="team_home"
                type="text"
                defaultValue="GBA"
                className="w-full rounded-xl border border-black/10 bg-black/5 px-3 py-2 text-sm outline-none focus:border-black/20"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black/55">
                Score
              </label>
              <input
                name="score_home"
                type="number"
                defaultValue={0}
                className="w-full rounded-xl border border-black/10 bg-black/5 px-3 py-2 text-sm outline-none focus:border-black/20"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black/55">
                Extérieur
              </label>
              <input
                name="team_away"
                type="text"
                placeholder="Equipe B"
                className="w-full rounded-xl border border-black/10 bg-black/5 px-3 py-2 text-sm outline-none focus:border-black/20"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black/55">
                Score
              </label>
              <input
                name="score_away"
                type="number"
                defaultValue={0}
                className="w-full rounded-xl border border-black/10 bg-black/5 px-3 py-2 text-sm outline-none focus:border-black/20"
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
