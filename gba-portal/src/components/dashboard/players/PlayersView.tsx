"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CreatePlayerModal } from "./CreatePlayerModal";
import { createClient } from "@/lib/supabase/client";

export type PlayerWithTeam = {
  id: string;
  firstname: string;
  lastname: string;
  team_id: string;
  updated_at: string;
  category: string;
  club_name: string;
  license_number: string;
  gender: string;
  status_label?: string;
  status_start_date?: string;
  status_end_date?: string;
  mobile_phone?: string;
  email?: string;
  legal_guardian_name?: string;
  address_street?: string;
  address_zipcode?: string;
  address_city?: string;
  team?: {
    name: string;
    category: string;
    gender: string;
  } | null;
};

type Props = {
  initialPlayers: PlayerWithTeam[];
  teams: { id: string; name: string }[];
};

function inputBaseClassName() {
  return "w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/20";
}

function formatPhone(phone?: string | null) {
  const raw = (phone ?? "").trim();
  if (!raw) return "—";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 9 && (digits.startsWith("6") || digits.startsWith("7")))
    return `0${digits}`;
  if (
    digits.length === 11 &&
    digits.startsWith("33") &&
    (digits[2] === "6" || digits[2] === "7")
  )
    return `0${digits.slice(2)}`;
  return raw;
}

type TabKey = "resume" | "contact" | "legal" | "presences";

type PresenceStats = {
  present: number;
  late: number;
  excused: number;
  absent: number;
  total: number;
};

export function PlayersView({ initialPlayers, teams }: Props) {
  const searchParams = useSearchParams();

  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [isCreateOpen, setCreateOpen] = React.useState(false);
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [filterClub, setFilterClub] = React.useState<string>("all");
  const [tab, setTab] = React.useState<TabKey>("resume");
  const [presenceStats, setPresenceStats] =
    React.useState<PresenceStats | null>(null);
  const [presenceLoading, setPresenceLoading] = React.useState(false);

  // Hydrate from URL ONCE
  React.useEffect(() => {
    const q = searchParams.get("q");
    const pid = searchParams.get("playerId");

    if (q) setQuery(q);

    if (pid) {
      setSelectedId(pid);
    }
  }, [searchParams]);

  // Manual update function to update URL without triggering re-renders loop
  const updateUrl = (newQuery: string, newId: string | null) => {
    const params = new URLSearchParams(window.location.search);

    if (newQuery) params.set("q", newQuery);
    else params.delete("q");

    if (newId) params.set("playerId", newId);
    else params.delete("playerId");

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  const handleSelectPlayer = (id: string) => {
    setSelectedId(id);
    updateUrl(query, id);
  };

  const handleSearch = (val: string) => {
    setQuery(val);
    updateUrl(val, selectedId);
  };

  const uniqueCategories = React.useMemo(
    () =>
      Array.from(
        new Set(initialPlayers.map((p) => p.category).filter(Boolean)),
      ).sort(),
    [initialPlayers],
  );

  const uniqueClubs = React.useMemo(
    () =>
      Array.from(
        new Set(initialPlayers.map((p) => p.club_name).filter(Boolean)),
      ).sort(),
    [initialPlayers],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialPlayers.filter((p) => {
      // 1. Text Search
      if (q) {
        const hay =
          `${p.firstname} ${p.lastname} ${p.category} ${p.club_name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // 2. Category Filter
      if (filterCategory !== "all" && p.category !== filterCategory)
        return false;

      // 3. Club Filter
      if (filterClub !== "all" && p.club_name !== filterClub) return false;

      return true;
    });
  }, [initialPlayers, query, filterCategory, filterClub]);

  const selectedPlayer = React.useMemo(() => {
    return filtered.find((p) => p.id === selectedId) || filtered[0] || null;
  }, [filtered, selectedId]);

  React.useEffect(() => {
    // Reset tab + load presence stats when switching player
    setTab("resume");
    setPresenceStats(null);

    if (!selectedPlayer?.id) return;

    let cancelled = false;
    async function loadPresence() {
      setPresenceLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("attendance")
          .select("status")
          .eq("player_id", selectedPlayer.id);

        if (cancelled) return;
        if (error) {
          setPresenceStats(null);
          return;
        }

        const stats: PresenceStats = {
          present: 0,
          late: 0,
          excused: 0,
          absent: 0,
          total: 0,
        };

        for (const row of data ?? []) {
          stats.total += 1;
          if (row.status === "present") stats.present += 1;
          else if (row.status === "late") stats.late += 1;
          else if (row.status === "excused") stats.excused += 1;
          else if (row.status === "absent") stats.absent += 1;
        }

        setPresenceStats(stats);
      } finally {
        if (!cancelled) setPresenceLoading(false);
      }
    }

    loadPresence();

    return () => {
      cancelled = true;
    };
  }, [selectedPlayer?.id]);

  return (
    <>
      <div className="grid gap-6">
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardTitle>Recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="w-full max-w-4xl grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                    Recherche
                  </label>
                  <input
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Ex: Diallo, U13..."
                    className={inputBaseClassName()}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                    Catégorie
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={inputBaseClassName()}
                  >
                    <option value="all">Toutes</option>
                    {uniqueCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                    Club
                  </label>
                  <select
                    value={filterClub}
                    onChange={(e) => setFilterClub(e.target.value)}
                    className={inputBaseClassName()}
                  >
                    <option value="all">Tous</option>
                    {uniqueClubs.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCreateOpen(true)}
                >
                  Ajouter un joueur
                </Button>
              </div>
            </div>
            <p className="mt-4 text-sm text-white/60">
              {filtered.length} joueur(s)
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card className="premium-card card-shell rounded-3xl">
            <CardHeader>
              <CardTitle>Liste</CardTitle>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <p className="text-sm text-white/60">Aucun joueur trouvé.</p>
              ) : (
                <ul className="grid gap-3">
                  {filtered.map((p) => {
                    const isSelected = p.id === selectedPlayer?.id;
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectPlayer(p.id)}
                          className={`group w-full rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                            isSelected
                              ? "border-white/25 bg-white/10"
                              : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/7"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-white">
                                {p.lastname} {p.firstname}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/55">
                                {p.category ?? "Sans catégorie"}
                              </p>
                              <p className="text-[10px] text-white/40">
                                {p.club_name}
                              </p>
                            </div>
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
              <CardTitle>Fiche joueur</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedPlayer ? (
                <p className="text-sm text-white/60">Sélectionnez un joueur.</p>
              ) : (
                <div className="grid gap-4">
                  {/* Tabs */}
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { key: "resume", label: "Résumé" },
                        { key: "contact", label: "Contact" },
                        { key: "legal", label: "Resp. légal" },
                        { key: "presences", label: "Présences" },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTab(t.key)}
                        className={
                          `rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border transition ` +
                          (tab === t.key
                            ? "bg-white text-black border-white"
                            : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10")
                        }
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {tab === "resume" ? (
                    <div className="grid gap-6">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                              Identité
                            </p>
                            <h3 className="mt-2 text-3xl font-[var(--font-teko)] uppercase font-bold text-white">
                              {selectedPlayer.lastname}{" "}
                              {selectedPlayer.firstname}
                            </h3>
                            <p className="mt-1 text-sm text-white/70">
                              {(() => {
                                const g = (selectedPlayer.gender ?? "")
                                  .trim()
                                  .toUpperCase();
                                if (g === "M" || g === "MALE")
                                  return "Masculin";
                                if (g === "F" || g === "FEMALE")
                                  return "Féminin";
                                return "Non renseigné";
                              })()}{" "}
                              • {selectedPlayer.category}
                            </p>
                          </div>
                          {selectedPlayer.status_label ? (
                            <div className="px-3 py-1 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 text-xs font-bold uppercase tracking-wider">
                              {selectedPlayer.status_label}
                            </div>
                          ) : (
                            <div className="px-3 py-1 rounded bg-green-500/20 border border-green-500/30 text-green-500 text-xs font-bold uppercase tracking-wider">
                              Libre
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                          <p className="text-xs uppercase tracking-[0.35em] text-white/55 mb-2">
                            Sportif
                          </p>

                          <div className="space-y-1">
                            <p className="text-[10px] uppercase text-white/40">
                              Club
                            </p>
                            <p className="text-sm font-semibold text-white">
                              {selectedPlayer.club_name}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] uppercase text-white/40">
                              Licence
                            </p>
                            <p className="text-sm font-mono text-white/80">
                              {selectedPlayer.license_number ?? "—"}
                            </p>
                          </div>

                          {selectedPlayer.status_label && (
                            <div className="space-y-1 pt-2 border-t border-white/10 mt-2">
                              <p className="text-[10px] uppercase text-white/40">
                                Mutation
                              </p>
                              <p className="text-xs text-white/70">
                                Du {selectedPlayer.status_start_date ?? "?"} au{" "}
                                {selectedPlayer.status_end_date ?? "?"}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                          <p className="text-xs uppercase tracking-[0.35em] text-white/55 mb-2">
                            Contact
                          </p>

                          <div className="space-y-1">
                            <p className="text-[10px] uppercase text-white/40">
                              Email
                            </p>
                            <p className="text-sm text-white break-all">
                              {selectedPlayer.email || "—"}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] uppercase text-white/40">
                              Mobile
                            </p>
                            <p className="text-sm text-white">
                              {formatPhone(selectedPlayer.mobile_phone)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <p className="text-xs uppercase tracking-[0.35em] text-white/55 mb-2">
                          Responsable Légal
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase text-white/40">
                              Nom
                            </p>
                            <p className="text-sm font-semibold text-white">
                              {selectedPlayer.legal_guardian_name || "—"}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] uppercase text-white/40">
                              Adresse
                            </p>
                            <p className="text-sm text-white/80">
                              {selectedPlayer.address_street}
                              <br />
                              {selectedPlayer.address_zipcode}{" "}
                              {selectedPlayer.address_city}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : tab === "contact" ? (
                    <div className="grid gap-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                          Email
                        </p>
                        <p className="mt-2 text-sm text-white break-all">
                          {selectedPlayer.email || "—"}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={async () => {
                              if (!selectedPlayer.email) return;
                              await navigator.clipboard.writeText(
                                selectedPlayer.email,
                              );
                            }}
                          >
                            Copier
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                          Mobile
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {formatPhone(selectedPlayer.mobile_phone)}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={async () => {
                              if (!selectedPlayer.mobile_phone) return;
                              await navigator.clipboard.writeText(
                                formatPhone(selectedPlayer.mobile_phone),
                              );
                            }}
                          >
                            Copier
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : tab === "legal" ? (
                    <div className="grid gap-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                          Responsable légal
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {selectedPlayer.legal_guardian_name || "—"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                          Adresse
                        </p>
                        <p className="mt-2 text-sm text-white/80">
                          {selectedPlayer.address_street || "—"}
                          <br />
                          {selectedPlayer.address_zipcode}{" "}
                          {selectedPlayer.address_city}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                        Statistiques
                      </p>
                      {presenceLoading ? (
                        <p className="mt-3 text-sm text-white/60">
                          Chargement…
                        </p>
                      ) : !presenceStats ? (
                        <p className="mt-3 text-sm text-white/60">
                          Aucune donnée de présence.
                        </p>
                      ) : (
                        <div className="mt-4 grid gap-2">
                          <div className="flex justify-between text-sm text-white">
                            <span>Présences</span>
                            <span className="font-semibold text-green-400">
                              {presenceStats.present}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-white">
                            <span>Retards</span>
                            <span className="font-semibold text-yellow-400">
                              {presenceStats.late}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-white">
                            <span>Excusés</span>
                            <span className="font-semibold text-blue-400">
                              {presenceStats.excused}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-white">
                            <span>Absences</span>
                            <span className="font-semibold text-red-400">
                              {presenceStats.absent}
                            </span>
                          </div>
                          <div className="mt-2 border-t border-white/10 pt-2 flex justify-between text-sm text-white/80">
                            <span>Total séances</span>
                            <span className="font-semibold">
                              {presenceStats.total}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <CreatePlayerModal
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        teams={teams}
      />
    </>
  );
}
