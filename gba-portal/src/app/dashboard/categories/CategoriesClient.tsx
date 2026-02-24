"use client";

import * as React from "react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createCategory, updateCategory, deleteCategory } from "./actions";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/components/PermissionsProvider";

export type CategoryPole =
  | "École de foot"
  | "Pré-formation"
  | "Formation"
  | "Seniors";

export type Category = {
  id: string;
  name: string;
  pole: string;
  age_range_label?: string;
  teams_label?: string;
  teams_count: number;
  players_estimate: number;
  lead_staff: { id: string; name: string; role: string }[];
  updated_at: string;
  notes?: string;
};

function inputBaseClassName() {
  return "w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/20";
}

function roleLabel(role: string) {
  switch (role) {
    case "resp-categorie":
      return "Resp. catégorie";
    case "coord":
      return "Coordinateur";
    case "coach":
      return "Coach";
    default:
      return role;
  }
}

const POLES: CategoryPole[] = [
  "École de foot",
  "Pré-formation",
  "Formation",
  "Seniors",
];

const STORAGE_KEY = "gba.dashboard.categories.state.v1";

type StoredState = {
  query?: string;
  pole?: string;
  selectedId?: string | null;
};

export default function CategoriesClient({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const router = useRouter();
  const { role } = usePermissions();
  const canWrite = role === "admin" || role === "resp_sportif";

  const [categories, setCategories] =
    React.useState<Category[]>(initialCategories);
  const [query, setQuery] = React.useState("");
  const [pole, setPole] = React.useState<string>("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [currentCategory, setCurrentCategory] = React.useState<
    Partial<Category>
  >({});

  // Update local state when prop changes (e.g. after revalidate)
  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredState;
        if (typeof parsed.query === "string") setQuery(parsed.query);
        if (parsed.pole) setPole(parsed.pole);
        if (
          typeof parsed.selectedId === "string" ||
          parsed.selectedId === null
        ) {
          setSelectedId(parsed.selectedId);
        }
      }
    } catch {
      // ignore localStorage / parsing errors
    }
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();

    return categories
      .filter((c) => (pole === "all" ? true : c.pole === pole))
      .filter((c) => {
        if (!q) return true;
        const hay =
          `${c.name} ${c.pole} ${c.teams_label || ""} ${c.age_range_label || ""} ${(c.lead_staff || []).map((s) => s.name).join(" ")}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, pole, query]);

  const selectedCategory = React.useMemo(() => {
    return filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null;
  }, [filtered, selectedId]);

  React.useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !filtered.some((c) => c.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  React.useEffect(() => {
    const payload: StoredState = { query, pole, selectedId };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [pole, query, selectedId]);

  const stats = React.useMemo(() => {
    return filtered.reduce(
      (acc, c) => {
        acc.categories += 1;
        acc.teams += c.teams_count || 0;
        acc.players += c.players_estimate || 0;
        if ((c.lead_staff || []).some((s) => s.role === "resp-categorie"))
          acc.withOwner += 1;
        return acc;
      },
      { categories: 0, teams: 0, players: 0, withOwner: 0 },
    );
  }, [filtered]);

  const handleCreate = () => {
    setCurrentCategory({});
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      await deleteCategory(id);
      router.refresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      if (isEditMode && currentCategory.id) {
        await updateCategory(currentCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      setIsModalOpen(false);
      router.refresh();
    } catch {
      alert("Une erreur est survenue.");
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.6em] text-white/60">
            Module
          </p>
          <h2 className="mt-3 font-[var(--font-teko)] text-3xl font-black tracking-[0.06em] text-white md:text-4xl">
            Catégories
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-white/70">
            Vue “staff” des catégories (U6→U18, seniors…) avec responsables,
            volumes (équipes/joueurs) et notes.
          </p>
        </div>
        {canWrite ? <Button onClick={handleCreate}>+ Ajouter</Button> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-white/55">
              Catégories (filtre)
            </CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {stats.categories}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-white/55">
              Équipes (est.)
            </CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {stats.teams}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-white/55">
              Joueurs (est.)
            </CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {stats.players}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="premium-card card-shell rounded-3xl">
        <CardHeader>
          <CardTitle>Recherche & filtres</CardTitle>
          <CardDescription>
            Filtrer par pôle et rechercher par catégorie / équipes / staff.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                Recherche
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: U12, seniors, Bernard…"
                className={inputBaseClassName()}
                inputMode="search"
                aria-label="Rechercher une catégorie"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                Pôle
              </span>
              <select
                value={pole}
                onChange={(e) => setPole(e.target.value)}
                className={inputBaseClassName()}
                aria-label="Filtrer par pôle"
              >
                <option value="all">Tous les pôles</option>
                {POLES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-white/60" aria-live="polite">
              {`${filtered.length} catégorie(s) • ${stats.withOwner} avec resp.`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setPole("all");
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardTitle>Liste</CardTitle>
            <CardDescription>
              Sélectionnez une catégorie pour afficher la fiche.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">
                  Aucune catégorie
                </p>
                <p className="mt-1 text-sm text-white/65">
                  Essayez de modifier le pôle ou la recherche.
                </p>
              </div>
            ) : (
              <ul className="grid gap-3">
                {filtered.map((c) => {
                  const isSelected = c.id === selectedCategory?.id;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className={`group w-full rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                          isSelected
                            ? "border-white/25 bg-white/10"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/7"
                        }`}
                        aria-current={isSelected ? "true" : undefined}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">
                              {c.name}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/55">
                              {c.pole} • {c.age_range_label}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold text-white">
                              {c.teams_count}
                            </p>
                            <p className="text-xs text-white/45">équipes</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/15 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/65">
                            {c.players_estimate} joueurs (est.)
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardTitle>Fiche</CardTitle>
            <CardDescription>
              Résumé + responsables + actions futures.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedCategory ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">
                  Aucune sélection
                </p>
                <p className="mt-1 text-sm text-white/65">
                  Choisissez une catégorie dans la liste.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                      Catégorie
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {selectedCategory.name}
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      {selectedCategory.pole} •{" "}
                      {selectedCategory.age_range_label}
                    </p>
                  </div>
                  {canWrite ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(selectedCategory)}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(selectedCategory.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                    Périmètre
                  </p>
                  <dl className="mt-3 grid gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-sm text-white/65">Équipes</dt>
                      <dd className="text-sm font-semibold text-white">
                        {selectedCategory.teams_label}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-sm text-white/65">Volume</dt>
                      <dd className="text-sm font-semibold text-white">
                        {selectedCategory.players_estimate} joueurs (est.)
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                    Responsables
                  </p>
                  {(selectedCategory.lead_staff || []).length === 0 ? (
                    <p className="mt-2 text-sm text-white/65">
                      Aucun responsable défini.
                    </p>
                  ) : (
                    <ul className="mt-3 grid gap-2">
                      {(selectedCategory.lead_staff || []).map((s) => (
                        <li
                          key={s.id}
                          className="flex items-start justify-between gap-3"
                        >
                          <span className="text-sm font-semibold text-white">
                            {s.name}
                          </span>
                          <span className="rounded-full border border-white/15 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
                            {roleLabel(s.role)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {selectedCategory.notes ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                      Note
                    </p>
                    <p className="mt-2 text-sm text-white/70">
                      {selectedCategory.notes}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/equipes?category=${encodeURIComponent(selectedCategory.name)}&pole=${encodeURIComponent(selectedCategory.pole)}`}
                  >
                    <Button size="sm" variant="secondary">
                      Voir équipes
                    </Button>
                  </Link>
                  <Link
                    href={`/dashboard/joueurs?category=${encodeURIComponent(selectedCategory.name)}&pole=${encodeURIComponent(selectedCategory.pole)}`}
                  >
                    <Button size="sm" variant="secondary">
                      Voir joueurs
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Modifier la catégorie" : "Ajouter une catégorie"}
        description="Remplissez les informations ci-dessous."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black">Nom</label>
            <input
              name="name"
              defaultValue={currentCategory.name}
              required
              className="mt-1 w-full rounded border p-2 text-black"
              placeholder="ex: U10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Pôle</label>
            <select
              name="pole"
              defaultValue={currentCategory.pole || POLES[0]}
              className="mt-1 w-full rounded border p-2 text-black"
            >
              {POLES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              Années (label)
            </label>
            <input
              name="age_range_label"
              defaultValue={currentCategory.age_range_label}
              className="mt-1 w-full rounded border p-2 text-black"
              placeholder="ex: 2013-2014"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              Équipes (label)
            </label>
            <input
              name="teams_label"
              defaultValue={currentCategory.teams_label}
              className="mt-1 w-full rounded border p-2 text-black"
              placeholder="ex: U10, U11"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black">
                Nb Équipes
              </label>
              <input
                name="teams_count"
                type="number"
                defaultValue={currentCategory.teams_count || 0}
                className="mt-1 w-full rounded border p-2 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">
                Nb Joueurs (est.)
              </label>
              <input
                name="players_estimate"
                type="number"
                defaultValue={currentCategory.players_estimate || 0}
                className="mt-1 w-full rounded border p-2 text-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              Notes
            </label>
            <textarea
              name="notes"
              defaultValue={currentCategory.notes}
              className="mt-1 w-full rounded border p-2 text-black"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {isEditMode ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
