"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createTeam } from "@/app/dashboard/equipes/actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const categories = [
  "U6",
  "U7",
  "U8",
  "U9",
  "U10",
  "U11",
  "U12",
  "U13",
  "U14",
  "U15",
  "U16",
  "U17",
  "U18",
  "Seniors",
  "Veterans",
];

export function CreateTeamModal({ isOpen, onClose, onCreated }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const result = await createTeam(null, formData);

      if (result?.success) {
        onClose();
        onCreated?.();
      } else {
        setError(result?.message || "Erreur inconnue");
      }
    } catch {
      setError("Erreur technique lors de la création");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouvelle équipe"
      description="Ajoutez une équipe à l'effectif."
    >
      <form action={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-xs uppercase tracking-widest text-white/50"
          >
            Nom de l'équipe
          </label>
          <input
            name="name"
            id="name"
            required
            placeholder="Ex: U13 A"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="text-xs uppercase tracking-widest text-white/50"
            >
              Catégorie
            </label>
            <select
              name="category"
              id="category"
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-2 text-white focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="gender"
              className="text-xs uppercase tracking-widest text-white/50"
            >
              Genre
            </label>
            <select
              name="gender"
              id="gender"
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-2 text-white focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            >
              <option value="Mixte">Mixte</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Création..." : "Créer l'équipe"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
