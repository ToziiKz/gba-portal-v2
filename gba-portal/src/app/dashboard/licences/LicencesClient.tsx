"use client";

import * as React from "react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { usePermissions } from "@/components/PermissionsProvider";
import { createApprovalRequest } from "@/lib/approvals";
import { LicencePaymentModal } from "@/components/dashboard/LicencePaymentModal";
import {
  registerLicencePayment,
  resetLicencePayment,
  type LicenceRow,
} from "./actions";

type StatusFilter = "all" | "unpaid" | "partial" | "paid" | "overdue";

function formatEur(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusToPillVariant(status: string, isOverdue: boolean) {
  if (status === "paid") return "success";
  if (isOverdue) return "danger";
  if (status === "partial") return "warning";
  return "neutral";
}

function statusLabel(status: string, isOverdue: boolean) {
  if (status === "paid") return "payée";
  if (isOverdue) return "en retard";
  if (status === "partial") return "acompte";
  return "à payer";
}

function inputBaseClassName() {
  return "h-10 w-full rounded-[var(--ui-radius-sm)] border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25";
}

function buildFilterSearchParams(
  query: string,
  poleFilter: string | "all",
  statusFilter: StatusFilter,
) {
  const sp = new URLSearchParams();
  const q = query.trim();
  if (q) sp.set("q", q);
  if (poleFilter !== "all") sp.set("pole", poleFilter);
  if (statusFilter !== "all") sp.set("status", statusFilter);
  return sp;
}

export function LicencesClient({ initialRows }: { initialRows: LicenceRow[] }) {
  const { canEdit, canViewMoney, role } = usePermissions();
  const isAdmin = role === "admin";
  const [rows, setRows] = React.useState<LicenceRow[]>(initialRows);
  const [, startTransition] = React.useTransition();

  // Sync with prop updates
  React.useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [poleFilter, setPoleFilter] = React.useState<string | "all">("all");

  const [openRowId, setOpenRowId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const didInitFromUrl = React.useRef(false);

  React.useEffect(() => {
    if (didInitFromUrl.current) return;

    const sp = new URLSearchParams(
      typeof window === "undefined" ? "" : window.location.search,
    );

    const poleRaw = sp.get("pole");
    const statusRaw = sp.get("status");
    const qRaw = sp.get("q") ?? sp.get("query");

    const poles = ["École de foot", "Pré-formation", "Formation"];
    if (poleRaw && poles.includes(poleRaw)) setPoleFilter(poleRaw);

    const statuses: StatusFilter[] = [
      "all",
      "unpaid",
      "partial",
      "paid",
      "overdue",
    ];
    if (statusRaw && statuses.includes(statusRaw as StatusFilter))
      setStatusFilter(statusRaw as StatusFilter);

    if (typeof qRaw === "string" && qRaw.trim()) setQuery(qRaw);

    didInitFromUrl.current = true;
  }, []);

  // Keep URL in sync with filters
  const urlSyncTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!didInitFromUrl.current) return;
    if (typeof window === "undefined") return;

    if (urlSyncTimer.current) window.clearTimeout(urlSyncTimer.current);

    urlSyncTimer.current = window.setTimeout(() => {
      const sp = buildFilterSearchParams(query, poleFilter, statusFilter);
      const qs = sp.toString();
      const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      window.history.replaceState(null, "", nextUrl);
    }, 250);

    return () => {
      if (urlSyncTimer.current) window.clearTimeout(urlSyncTimer.current);
    };
  }, [query, poleFilter, statusFilter]);

  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filteredRows = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (poleFilter !== "all" && row.pole !== poleFilter) return false;

      if (statusFilter === "overdue" && !row.isOverdue) return false;
      if (
        statusFilter !== "all" &&
        statusFilter !== "overdue" &&
        row.status !== statusFilter
      )
        return false;

      if (!normalizedQuery) return true;
      const haystack =
        `${row.playerName} ${row.team} ${row.category}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query, poleFilter, statusFilter, rows]);

  const stats = React.useMemo(() => {
    const totals = filteredRows.reduce(
      (acc, row) => {
        acc.totalDueEur += Math.max(0, row.amountTotalEur - row.amountPaidEur);
        if (row.status === "paid") acc.paidCount += 1;
        if (row.isOverdue) acc.overdueCount += 1;
        return acc;
      },
      { totalDueEur: 0, paidCount: 0, overdueCount: 0 },
    );

    return {
      ...totals,
      totalCount: filteredRows.length,
    };
  }, [filteredRows]);

  const openRow = React.useMemo(() => {
    if (!openRowId) return null;
    return rows.find((r) => r.id === openRowId) ?? null;
  }, [openRowId, rows]);

  const handlePaymentSubmit = (
    amountEur: number,
    method: string,
    note: string,
    sendReceipt: boolean,
  ) => {
    if (!openRowId || !openRow) return;

    if (!isAdmin) {
      createApprovalRequest({
        authorRole: role,
        action: "licence.payment",
        payload: {
          licenceId: openRowId,
          playerName: openRow.playerName,
          amountEur,
          method,
          note,
        },
      });
      setToast("Demande de paiement envoyée (en attente de validation)");
      setOpenRowId(null);
      return;
    }

    startTransition(async () => {
      const result = await registerLicencePayment(
        openRowId,
        amountEur,
        method,
        note,
      );
      if (result.error) {
        setToast(`Erreur: ${result.error}`);
      } else {
        setToast(
          sendReceipt
            ? "Paiement enregistré + reçu envoyé (simulé)"
            : "Paiement enregistré",
        );
      }
      setOpenRowId(null);
    });
  };

  const handleReset = (id: string) => {
    if (!confirm("Voulez-vous vraiment réinitialiser ce paiement ?")) return;

    startTransition(async () => {
      const result = await resetLicencePayment(id);
      if (result.error) {
        setToast(`Erreur: ${result.error}`);
      } else {
        setToast("Paiement réinitialisé");
      }
    });
  };

  const resetFilters = () => {
    setQuery("");
    setPoleFilter("all");
    setStatusFilter("all");
    setToast("Filtres réinitialisés");
  };

  const copyLink = async () => {
    if (typeof window === "undefined") return;

    const sp = buildFilterSearchParams(query, poleFilter, statusFilter);
    const qs = sp.toString();
    const url = `${window.location.origin}${window.location.pathname}${qs ? `?${qs}` : ""}`;

    try {
      await navigator.clipboard.writeText(url);
      setToast("Lien copié");
    } catch {
      setToast("Impossible de copier le lien (autorisation navigateur)");
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">
          Licences & paiements
        </h2>
        <p className="text-sm text-white/65">
          Module connecté : suivi des paiements en temps réel.
        </p>
      </header>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 animate-in fade-in slide-in-from-top-2"
        >
          {toast}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="premium-card card-shell rounded-3xl p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            À encaisser (filtre)
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {canViewMoney ? formatEur(stats.totalDueEur) : "•••• €"}
          </p>
        </Card>
        <Card className="premium-card card-shell rounded-3xl p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Payées
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {stats.paidCount}
          </p>
        </Card>
        <Card className="premium-card card-shell rounded-3xl p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            En retard
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {stats.overdueCount}
          </p>
        </Card>
      </div>

      <Card className="premium-card card-shell rounded-3xl p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_200px_220px] md:items-end">
          <div className="space-y-1">
            <label
              htmlFor="licences-search"
              className="text-xs font-medium text-white/70"
            >
              Rechercher
            </label>
            <input
              id="licences-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom, équipe, catégorie…"
              className={inputBaseClassName()}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="licences-pole"
              className="text-xs font-medium text-white/70"
            >
              Pôle
            </label>
            <select
              id="licences-pole"
              value={poleFilter}
              onChange={(event) => setPoleFilter(event.target.value)}
              className={inputBaseClassName()}
            >
              <option value="all">Tous</option>
              <option value="École de foot">École de foot</option>
              <option value="Pré-formation">Pré-formation</option>
              <option value="Formation">Formation</option>
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="licences-status"
              className="text-xs font-medium text-white/70"
            >
              Statut
            </label>
            <select
              id="licences-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className={inputBaseClassName()}
            >
              <option value="all">Tous</option>
              <option value="unpaid">À payer</option>
              <option value="partial">Acompte</option>
              <option value="paid">Payée</option>
              <option value="overdue">En retard</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={resetFilters}>
            Réinitialiser les filtres
          </Button>
          <Button size="sm" variant="secondary" onClick={copyLink}>
            Copier le lien
          </Button>
        </div>
      </Card>

      <Card className="premium-card card-shell rounded-3xl p-0">
        <div className="border-b border-white/10 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">
            Joueurs ({stats.totalCount})
          </h3>
        </div>

        {filteredRows.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-white">Aucun résultat</p>
            <p className="mt-2 text-xs text-white/50">
              Essaie d’élargir les filtres.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {filteredRows.map((row) => {
              const remaining = Math.max(
                0,
                row.amountTotalEur - row.amountPaidEur,
              );

              return (
                <li
                  key={row.id}
                  className="px-4 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-white">
                          {row.playerName}
                        </p>
                        <Pill
                          variant={statusToPillVariant(
                            row.status,
                            row.isOverdue,
                          )}
                        >
                          {statusLabel(row.status, row.isOverdue)}
                        </Pill>
                        <Pill className="hidden md:inline-flex">
                          {row.pole}
                        </Pill>
                      </div>
                      <p className="text-xs text-white/55">
                        {row.team} · {row.category} · échéance{" "}
                        {row.dueDateLabel}
                      </p>
                      <p className="text-xs text-white/35">
                        Maj {row.updatedAtLabel}
                        {row.lastPaymentMethod
                          ? ` · par ${row.lastPaymentMethod}`
                          : ""}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <p className="text-sm font-semibold text-white">
                          {formatEur(remaining)}
                        </p>
                        <p className="text-xs text-white/45">
                          dus (sur {formatEur(row.amountTotalEur)})
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {canEdit && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setOpenRowId(row.id)}
                            >
                              Gérer / Payer
                            </Button>
                            {row.status !== "paid" && row.amountPaidEur > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReset(row.id)}
                              >
                                Reset
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <LicencePaymentModal
        isOpen={!!openRowId}
        onClose={() => setOpenRowId(null)}
        row={openRow}
        remainingEur={
          openRow
            ? Math.max(0, openRow.amountTotalEur - openRow.amountPaidEur)
            : 0
        }
        onPaymentSubmit={handlePaymentSubmit}
      />
    </div>
  );
}
