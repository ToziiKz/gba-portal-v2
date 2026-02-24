"use client";

import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Modal } from "@/components/ui/Modal";
import { usePermissions } from "@/components/PermissionsProvider";
import { createApprovalRequest } from "@/lib/approvals";
import {
  updateStaffAvailability,
  updateStaffDetails,
  type StaffMember,
} from "./actions";
import { staffPoles, staffRoles } from "@/lib/mocks/dashboardStaff";

type AvailabilityFilter = "ok" | "limited" | "off" | "all";

function inputBaseClassName() {
  return "w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/20";
}

function availabilityVariant(a: string) {
  if (a === "ok") return "success" as const;
  if (a === "limited") return "warning" as const;
  return "neutral" as const;
}

function availabilityLabel(a: string) {
  if (a === "ok") return "dispo";
  if (a === "limited") return "limité";
  return "off";
}

function roleLabel(role: string) {
  const match = staffRoles.find((r) => r.id === role);
  return match ? match.label : role;
}

function stats(members: StaffMember[]) {
  let total = 0;
  let onDuty = 0;
  let off = 0;
  let limited = 0;

  for (const m of members) {
    total += 1;
    if (m.availability === "ok") onDuty += 1;
    if (m.availability === "off") off += 1;
    if (m.availability === "limited") limited += 1;
  }

  return { total, onDuty, off, limited };
}

export function StaffClient({
  initialMembers,
}: {
  initialMembers: StaffMember[];
}) {
  const { canEdit, role: userRole } = usePermissions();
  const isAdmin = userRole === "admin";
  const [members, setMembers] = React.useState<StaffMember[]>(initialMembers);
  const [, startTransition] = React.useTransition();

  React.useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  // Filters
  const [query, setQuery] = React.useState("");
  const [pole, setPole] = React.useState<string | "all">("all");
  const [roleFilter, setRoleFilter] = React.useState<string | "all">("all");
  const [availability, setAvailability] =
    React.useState<AvailabilityFilter>("all");

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<"infos" | "equipes" | "actions">(
    "infos",
  );

  // Modal State
  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    email: "",
    phone: "",
    note: "",
  });
  const [pendingToast, setPendingToast] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();

    return members
      .filter((m) => (pole === "all" ? true : m.pole === pole))
      .filter((m) => (roleFilter === "all" ? true : m.role === roleFilter))
      .filter((m) =>
        availability === "all" ? true : m.availability === availability,
      )
      .filter((m) => {
        if (!q) return true;
        const hay =
          `${m.fullName} ${m.role} ${m.pole} ${m.teamsLabel} ${m.tags.join(" ")}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [query, pole, roleFilter, availability, members]);

  const selected = React.useMemo(() => {
    return filtered.find((m) => m.id === selectedId) ?? filtered[0] ?? null;
  }, [filtered, selectedId]);

  React.useEffect(() => {
    if (!selected) setSelectedId(null);
    else setSelectedId(selected.id);
  }, [selected]);

  const kpis = React.useMemo(() => stats(filtered), [filtered]);

  function toggleOnDuty(id: string) {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    const nextState = m.availability === "ok" ? "off" : "ok";

    startTransition(async () => {
      await updateStaffAvailability(id, nextState);
    });
  }

  function handleEdit() {
    if (!selected) return;
    setEditForm({
      email: selected.email ?? "",
      phone: selected.phone ?? "",
      note: selected.note ?? "",
    });
    setIsEditing(true);
  }

  function handleSave() {
    if (!selected) return;

    if (isAdmin) {
      startTransition(async () => {
        const result = await updateStaffDetails(selected.id, editForm);
        if (result.error) {
          setPendingToast(`Erreur: ${result.error}`);
        } else {
          setPendingToast("Modifications enregistrées");
        }
        setIsEditing(false);
        setTimeout(() => setPendingToast(null), 3000);
      });
    } else {
      createApprovalRequest({
        action: "staff.update",
        authorRole: userRole, // Should probably be properly typed but userRole can be anything
        payload: {
          id: selected.id,
          ...editForm,
        },
      });

      setPendingToast("Demande de modification envoyée aux admins.");
      setIsEditing(false);
      setTimeout(() => setPendingToast(null), 3000);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.6em] text-white/60">
          Module
        </p>
        <h2 className="mt-3 font-[var(--font-teko)] text-3xl font-black tracking-[0.06em] text-white md:text-4xl">
          Staff (annuaire)
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          Annuaire staff connecté à la base de données.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-white/55">
              Membres
            </CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {kpis.total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-white/55">
              En service
            </CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {kpis.onDuty}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-white/55">
              Dispo limitée
            </CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {kpis.limited}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-white/55">
              Off
            </CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {kpis.off}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="premium-card card-shell rounded-3xl">
        <CardHeader>
          <CardTitle>Recherche & filtres</CardTitle>
          <CardDescription>
            Trouvez un membre par nom, pôle, rôle ou disponibilité.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <label className="grid gap-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                Recherche
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Julie, U13…"
                className={inputBaseClassName()}
                inputMode="search"
                aria-label="Rechercher"
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
                aria-label="Pôle"
              >
                <option value="all">Tous</option>
                {staffPoles.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                Rôle
              </span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={inputBaseClassName()}
                aria-label="Rôle"
              >
                <option value="all">Tous</option>
                {staffRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap gap-2 md:col-span-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setPole("all");
                  setRoleFilter("all");
                  setAvailability("all");
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Liste */}
        <Card className="premium-card card-shell rounded-3xl h-[600px] flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle>Effectif</CardTitle>
            <CardDescription>
              {filtered.length} membre(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                <p className="text-sm font-semibold text-white">
                  Aucun résultat
                </p>
              </div>
            ) : (
              <ul className="grid gap-3">
                {filtered.map((m) => {
                  const isSelected = m.id === selected?.id;
                  const onDuty = m.availability === "ok";

                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(m.id);
                          setTab("infos"); // Reset tab on change
                        }}
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
                              {m.fullName}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/55">
                              {roleLabel(m.role)}
                            </p>
                          </div>
                          <div className="shrink-0 flex flex-col items-end gap-1">
                            <div
                              className={`h-2 w-2 rounded-full ${onDuty ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-white/20"}`}
                            />
                            <span className="text-[9px] uppercase tracking-wider text-white/30">
                              {m.pole}
                            </span>
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

        {/* Fiche Détail */}
        <Card className="premium-card card-shell rounded-3xl h-[600px] flex flex-col relative">
          {pendingToast && (
            <div className="absolute top-4 left-4 right-4 z-20 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="rounded-xl bg-green-500/90 px-4 py-3 text-sm font-bold text-black shadow-lg backdrop-blur-md">
                ✓ {pendingToast}
              </div>
            </div>
          )}

          {!selected ? (
            <div className="flex h-full items-center justify-center p-8 text-center text-white/40">
              <div className="grid place-items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/5" />
                <p>Sélectionnez un membre pour voir les détails.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="shrink-0 border-b border-white/10 p-6 pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-white">
                      {selected.fullName}
                    </h3>
                    <p className="text-sm text-white/60">
                      {roleLabel(selected.role)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Pill variant={availabilityVariant(selected.availability)}>
                      {availabilityLabel(selected.availability)}
                    </Pill>
                    <p className="mt-1 text-[10px] text-white/40">
                      Maj: {selected.updatedAtLabel ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-6 overflow-x-auto pb-1px">
                  {(["infos", "equipes", "actions"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`relative pb-3 text-xs font-bold uppercase tracking-widest transition hover:text-white ${
                        tab === t
                          ? "text-white after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-white"
                          : "text-white/40"
                      }`}
                    >
                      {t === "infos"
                        ? "Informations"
                        : t === "equipes"
                          ? "Équipes"
                          : "Actions"}
                    </button>
                  ))}
                </div>
              </div>

              <CardContent className="flex-1 overflow-y-auto pt-6">
                {tab === "infos" && (
                  <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                        Coordonnées
                      </p>
                      <dl className="grid gap-3">
                        <div className="flex justify-between">
                          <dt className="text-sm text-white/60">Email</dt>
                          <dd className="text-sm font-semibold text-white">
                            {selected.email ?? "—"}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-white/60">Téléphone</dt>
                          <dd className="text-sm font-semibold text-white">
                            {selected.phone ?? "—"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                        Contexte
                      </p>
                      <dl className="grid gap-3">
                        <div className="flex justify-between">
                          <dt className="text-sm text-white/60">Pôle</dt>
                          <dd className="text-sm font-semibold text-white">
                            {selected.pole}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-white/60">Équipes</dt>
                          <dd className="text-sm font-semibold text-white">
                            {selected.teamsLabel}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {selected.note && (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-white/55 mb-2">
                          Note interne
                        </p>
                        <p className="text-sm text-white/70 italic leading-relaxed">
                          &quot;{selected.note}&quot;
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {selected.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-wider text-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "equipes" && (
                  <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                      <p className="text-white/50 text-sm">
                        Ce membre intervient sur :
                      </p>
                      <p className="text-2xl font-black text-white mt-2">
                        {selected.teamsLabel}
                      </p>
                    </div>
                  </div>
                )}

                {tab === "actions" && (
                  <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {canEdit ? (
                      <div className="grid gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-white">
                              Statut &quot;En Service&quot;
                            </p>
                            <p className="text-xs text-white/50">
                              Déclare la présence sur site
                            </p>
                          </div>
                          <Button
                            variant={
                              selected.availability === "ok"
                                ? "secondary"
                                : "ghost"
                            }
                            onClick={() => toggleOnDuty(selected.id)}
                          >
                            {selected.availability === "ok"
                              ? "Désactiver"
                              : "Activer"}
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={handleEdit}
                        >
                          <span className="mr-2">✏️</span> Modifier la fiche
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <p className="text-sm text-white/60">
                          Mode lecture seule.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>

      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Modifier la fiche"
        description={selected ? `Édition: ${selected.fullName}` : undefined}
      >
        <div className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">
              Email
            </span>
            <input
              value={editForm.email}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className={inputBaseClassName()}
              placeholder="email@example.com"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">
              Téléphone
            </span>
            <input
              value={editForm.phone}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              className={inputBaseClassName()}
              placeholder="+33 6..."
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">
              Note interne
            </span>
            <textarea
              value={editForm.note}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, note: e.target.value }))
              }
              className={inputBaseClassName()}
              rows={3}
              placeholder="Note visible uniquement par le staff..."
            />
          </label>

          <div className="mt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button variant="secondary" onClick={handleSave}>
              Valider modification
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
