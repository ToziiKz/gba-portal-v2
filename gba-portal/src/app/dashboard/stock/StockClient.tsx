'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pill } from '@/components/ui/Pill'
import { StockMovementModal } from '@/components/dashboard/StockMovementModal'
import { usePermissions } from '@/components/PermissionsProvider'
import { createApprovalRequest } from '@/lib/approvals'
import { updateStockQuantity, type StockItem } from './actions'
import {
  stockKinds,
  stockLocations,
  stockPoles,
  type StockItemKind,
  type StockLocation,
  type StockPole,
} from '@/lib/mocks/dashboardStock'

type KindFilter = StockItemKind | 'all'

function inputBaseClassName() {
  return 'w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/20'
}

function lowStock(qty: number, minQty: number) {
  return qty < minQty
}

function lowVariant(isLow: boolean) {
  return isLow ? ('danger' as const) : ('success' as const)
}

function lowLabel(isLow: boolean) {
  return isLow ? 'à réassort' : 'ok'
}

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function StockClient({ initialStock }: { initialStock: StockItem[] }) {
  const { role } = usePermissions()
  const isAdmin = role === 'admin'
  const canManageStock = role === 'admin' || role === 'resp_equipements'
  const [rows, setRows] = React.useState<StockItem[]>(initialStock)
  const [, startTransition] = React.useTransition()

  // Sync with prop updates (e.g. after revalidate)
  React.useEffect(() => {
    setRows(initialStock)
  }, [initialStock])

  // Filters
  const [query, setQuery] = React.useState('')
  const [pole, setPole] = React.useState<StockPole | 'all'>('all')
  const [location, setLocation] = React.useState<StockLocation | 'all'>('all')
  const [kind, setKind] = React.useState<KindFilter>('all')
  const [onlyLow, setOnlyLow] = React.useState(false)

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<StockItem | null>(null)

  const [toast, setToast] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(t)
  }, [toast])

  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase()

    return rows
      .map((row) => {
        const isLow = lowStock(row.qty, row.minQty)
        return { ...row, isLow }
      })
      .filter((r) => (pole === 'all' ? true : r.pole === pole))
      .filter((r) => (location === 'all' ? true : r.location === location))
      .filter((r) => (kind === 'all' ? true : r.kind === kind))
      .filter((r) => (onlyLow ? r.isLow : true))
      .filter((r) => {
        if (!q) return true
        const hay =
          `${r.label} ${r.kind} ${r.pole} ${r.location} ${r.sizeLabel ?? ''} ${r.sku ?? ''}`.toLowerCase()
        return hay.includes(q)
      })
      .sort((a, b) => {
        if (a.isLow !== b.isLow) return a.isLow ? -1 : 1
        return a.label.localeCompare(b.label)
      })
  }, [query, pole, location, kind, onlyLow, rows])

  const kpis = React.useMemo(() => {
    const total = filteredRows.length
    const low = filteredRows.filter((r) => r.isLow).length
    const units = filteredRows.reduce((acc, r) => acc + r.qty, 0)
    return { total, low, units }
  }, [filteredRows])

  const handleOpenModal = (row: StockItem) => {
    setSelectedItem(row)
    setIsModalOpen(true)
  }

  const handleModalConfirm = async ({
    type,
    amount,
    reason,
    note,
  }: {
    type: 'entry' | 'exit'
    amount: number
    reason: string
    note: string
  }) => {
    if (!selectedItem) return

    if (!canManageStock) {
      setToast('Action réservée au staff/admin')
      return
    }

    const delta = type === 'entry' ? amount : -amount

    if (isAdmin) {
      startTransition(async () => {
        const result = await updateStockQuantity(selectedItem.id, delta, reason, note)
        if (result.error) {
          setToast(`Erreur: ${result.error}`)
        } else {
          setToast(`Validé (${reason})`)
          // Optimistic update or wait for revalidate via prop
        }
      })
    } else {
      createApprovalRequest({
        authorRole: role,
        action: 'stock.movement',
        payload: {
          itemId: selectedItem.id,
          itemName: selectedItem.label,
          delta,
          reason: note ? `${reason} (${note})` : reason,
        },
      })
      setToast('Demande envoyée pour validation')
    }
  }

  return (
    <div className="grid gap-6">
      <StockMovementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        onConfirm={handleModalConfirm}
      />

      <div>
        <p className="text-xs uppercase tracking-[0.6em] text-white/60">Module</p>
        <h2 className="mt-3 font-[var(--font-teko)] text-3xl font-black tracking-[0.06em] text-white md:text-4xl">
          Stock & matériel
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          Suivi inventaire temps réel : quantités, seuils mini, filtres (pôle/lieu/type) et
          mouvements.
        </p>
      </div>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-white shadow-2xl"
        >
          {toast}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-white/55">
              Références
            </CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {kpis.total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-white/55">
              Sous seuil
            </CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {kpis.low}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-white/55">
              Unités (tot.)
            </CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {kpis.units}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="premium-card card-shell rounded-3xl">
        <CardHeader>
          <CardTitle>Recherche & filtres</CardTitle>
          <CardDescription>Filtrer l’inventaire et isoler les réassorts.</CardDescription>
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
                placeholder="Ex: ballon, 39-42, SKU…"
                className={inputBaseClassName()}
                inputMode="search"
                aria-label="Rechercher dans le stock"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                Pôle
              </span>
              <select
                value={pole}
                onChange={(e) => setPole(e.target.value as StockPole | 'all')}
                className={inputBaseClassName()}
                aria-label="Filtrer par pôle"
              >
                <option value="all">Tous</option>
                {stockPoles.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                Lieu
              </span>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as StockLocation | 'all')}
                className={inputBaseClassName()}
                aria-label="Filtrer par lieu"
              >
                <option value="all">Tous</option>
                {stockLocations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                Type
              </span>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as KindFilter)}
                className={inputBaseClassName()}
                aria-label="Filtrer par type d’équipement"
              >
                {stockKinds.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label} — {k.note}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <label className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                <input
                  type="checkbox"
                  checked={onlyLow}
                  onChange={(e) => setOnlyLow(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-white/75">Sous seuil uniquement</span>
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-white/60" aria-live="polite">
              {filteredRows.length} ligne(s)
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setQuery('')
                  setPole('all')
                  setLocation('all')
                  setKind('all')
                  setOnlyLow(false)
                }}
              >
                Réinitialiser
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={filteredRows.length === 0}
                onClick={() => {
                  const headers = [
                    'label',
                    'sku',
                    'qty',
                    'minQty',
                    'pole',
                    'location',
                    'kind',
                    'updatedAt',
                  ]
                  const escape = (val: unknown) => {
                    const s = String(val ?? '')
                    const needsQuotes = /[",\n\r;]/.test(s)
                    const cleaned = s.replaceAll('"', '""')
                    return needsQuotes ? `"${cleaned}"` : cleaned
                  }

                  const lines = [headers.join(';')]
                  for (const r of filteredRows) {
                    lines.push(
                      [
                        r.label,
                        r.sku ?? '',
                        r.qty,
                        r.minQty,
                        r.pole,
                        r.location,
                        r.kind,
                        formatDate(r.updatedAt),
                      ]
                        .map(escape)
                        .join(';')
                    )
                  }

                  const csv = `${lines.join('\n')}\n`
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  const date = new Date().toISOString().slice(0, 10)
                  a.href = url
                  a.download = `gba-stock-${date}.csv`
                  document.body.appendChild(a)
                  a.click()
                  a.remove()
                  window.setTimeout(() => URL.revokeObjectURL(url), 500)
                  setToast('Export CSV téléchargé')
                }}
              >
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="premium-card card-shell rounded-3xl p-0">
        <div className="border-b border-white/10 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Inventaire</h3>
        </div>

        {filteredRows.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-white">Aucun résultat</p>
            <p className="mt-2 text-xs text-white/50">
              Essayez d’élargir les filtres ou de vider la recherche.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {filteredRows.map((row) => (
              <StockRowLine
                key={row.id}
                row={row}
                onAction={() => {
                  if (!canManageStock) {
                    setToast('Action réservée au staff/admin')
                    return
                  }
                  handleOpenModal(row)
                }}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function StockRowLine({
  row,
  onAction,
}: {
  row: StockItem & { isLow: boolean }
  onAction: () => void
}) {
  const isLow = row.isLow

  return (
    <li className="px-4 py-4 transition-colors hover:bg-white/[0.02]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">{row.label}</p>
            <Pill variant={lowVariant(isLow)}>{lowLabel(isLow)}</Pill>
            <Pill className="hidden md:inline-flex">{row.location}</Pill>
            <Pill className="hidden md:inline-flex">{row.pole}</Pill>
          </div>
          <p className="text-xs text-white/55">
            {row.kind}
            {row.sizeLabel ? ` · ${row.sizeLabel}` : ''} · seuil {row.minQty}
          </p>
          <p className="text-xs text-white/35">
            maj {formatDate(row.updatedAt)}
            {row.sku ? ` · SKU ${row.sku}` : ''}
          </p>
          {row.note ? <p className="text-xs text-white/55">{row.note}</p> : null}
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-sm font-semibold text-white">{row.qty}</p>
            <p className="text-xs text-white/45">unités</p>
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label={`Actions sur ${row.label}`}
          >
            <Button size="sm" variant="secondary" onClick={onAction}>
              Mouvement (+/-)
            </Button>
          </div>
        </div>
      </div>
    </li>
  )
}
