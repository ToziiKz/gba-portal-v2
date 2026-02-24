'use client'

import * as React from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pill } from '@/components/ui/Pill'
import { readLocal, writeLocal } from '@/lib/dashboard/storage'
import {
  dashboardEquipmentMock,
  equipmentItemLabels,
  equipmentPoles,
  type DashboardEquipmentPlayer,
  type EquipmentPole,
  type EquipmentItemType,
} from '@/lib/mocks/dashboardEquipment'

type DeliveryFilter = 'all' | 'todo' | 'complete'

type PersistedFilters = {
  query: string
  pole: EquipmentPole | 'all'
  deliveryFilter: DeliveryFilter
  selectedId: string | null
}

const STORAGE_KEY_PLAYERS = 'gba-dashboard-equipements-players-v1'
const STORAGE_KEY_FILTERS = 'gba-dashboard-equipements-filters-v1'

function inputBaseClassName() {
  return 'w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/20'
}

function completion(player: DashboardEquipmentPlayer) {
  const total = player.items.length
  const given = player.items.filter((i) => i.given).length
  return {
    total,
    given,
    ratio: total === 0 ? 0 : given / total,
  }
}

function hasMissingSize(player: DashboardEquipmentPlayer) {
  return player.items.some((i) => !i.size)
}

function defaultSelected(players: DashboardEquipmentPlayer[]) {
  return players[0]?.id ?? null
}

function summaryCounts(players: DashboardEquipmentPlayer[]) {
  let missingSize = 0
  let incomplete = 0

  for (const p of players) {
    if (hasMissingSize(p)) missingSize += 1
    if (completion(p).given !== completion(p).total) incomplete += 1
  }

  return {
    players: players.length,
    incomplete,
    missingSize,
  }
}

function formatItemLine(itemType: EquipmentItemType, size: string | null) {
  const label = equipmentItemLabels[itemType]
  return size ? `${label} · ${size}` : `${label} · taille ?`
}

function buildShareUrl(filters: PersistedFilters) {
  if (typeof window === 'undefined') return ''
  const sp = new URLSearchParams(window.location.search)

  if (filters.pole !== 'all') sp.set('pole', filters.pole)
  else sp.delete('pole')

  if (filters.deliveryFilter !== 'todo') sp.set('delivery', filters.deliveryFilter)
  else sp.delete('delivery')

  if (filters.query.trim()) sp.set('q', filters.query.trim())
  else sp.delete('q')

  return `${window.location.pathname}?${sp.toString()}`
}

export default function DashboardEquipementsPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [players, setPlayers] = React.useState<DashboardEquipmentPlayer[]>(dashboardEquipmentMock)

  const [query, setQuery] = React.useState('')
  const [pole, setPole] = React.useState<EquipmentPole | 'all'>('all')
  const [deliveryFilter, setDeliveryFilter] = React.useState<DeliveryFilter>('todo')
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const didInitFromUrl = React.useRef(false)
  const didInitFromStorage = React.useRef(false)

  // Restore persisted state (players + filters)
  React.useEffect(() => {
    if (didInitFromStorage.current) return

    const savedPlayers = readLocal<DashboardEquipmentPlayer[]>(
      STORAGE_KEY_PLAYERS,
      dashboardEquipmentMock
    )
    const savedFilters = readLocal<PersistedFilters | null>(STORAGE_KEY_FILTERS, null)

    setPlayers(savedPlayers)

    if (savedFilters) {
      setQuery(savedFilters.query ?? '')
      setPole((savedFilters.pole ?? 'all') as EquipmentPole | 'all')
      setDeliveryFilter((savedFilters.deliveryFilter ?? 'todo') as DeliveryFilter)
      setSelectedId(savedFilters.selectedId ?? null)
    }

    didInitFromStorage.current = true
  }, [])

  // Init from URL (deep links) - only if filters weren't restored
  React.useEffect(() => {
    if (didInitFromUrl.current) return
    if (!didInitFromStorage.current) return

    const sp = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search)

    const poleRaw = sp.get('pole')
    const deliveryRaw = sp.get('delivery') ?? sp.get('status')
    const qRaw = sp.get('q') ?? sp.get('query')

    if (poleRaw && (equipmentPoles as string[]).includes(poleRaw)) setPole(poleRaw as EquipmentPole)

    const deliveryOptions: DeliveryFilter[] = ['all', 'todo', 'complete']
    if (deliveryRaw && deliveryOptions.includes(deliveryRaw as DeliveryFilter))
      setDeliveryFilter(deliveryRaw as DeliveryFilter)

    if (typeof qRaw === 'string' && qRaw.trim()) setQuery(qRaw)

    didInitFromUrl.current = true
  }, [])

  // Fake loading
  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setIsLoading(false)
      setSelectedId((prev) => prev ?? defaultSelected(players))
    }, 520)

    return () => window.clearTimeout(t)
  }, [players])

  // Persist
  React.useEffect(() => {
    if (isLoading) return
    writeLocal(STORAGE_KEY_PLAYERS, players)
  }, [players, isLoading])

  React.useEffect(() => {
    if (isLoading) return
    const next: PersistedFilters = { query, pole, deliveryFilter, selectedId }
    writeLocal(STORAGE_KEY_FILTERS, next)
  }, [query, pole, deliveryFilter, selectedId, isLoading])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()

    return players
      .filter((p) => (pole === 'all' ? true : p.pole === pole))
      .filter((p) => {
        const { given, total } = completion(p)
        if (deliveryFilter === 'todo') return given !== total
        if (deliveryFilter === 'complete') return given === total
        return true
      })
      .filter((p) => {
        if (!q) return true
        const hay = `${p.name} ${p.category} ${p.teamName} ${p.pole}`.toLowerCase()
        return hay.includes(q)
      })
  }, [players, pole, deliveryFilter, query])

  const selectedPlayer = React.useMemo(() => {
    return filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null
  }, [filtered, selectedId])

  React.useEffect(() => {
    if (!selectedPlayer) setSelectedId(null)
    else setSelectedId(selectedPlayer.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayer?.id])

  const counts = React.useMemo(() => summaryCounts(players), [players])

  function toggleGiven(playerId: string, itemType: EquipmentItemType) {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== playerId) return p
        return {
          ...p,
          items: p.items.map((it) => {
            if (it.type !== itemType) return it
            const nextGiven = !it.given
            return {
              ...it,
              given: nextGiven,
              givenAt: nextGiven ? new Date().toISOString().slice(0, 10) : undefined,
            }
          }),
        }
      })
    )
  }

  async function copyShareLink() {
    const next: PersistedFilters = { query, pole, deliveryFilter, selectedId }
    const url = buildShareUrl(next)
    if (!url) return

    try {
      await window.navigator.clipboard.writeText(window.location.origin + url)
    } catch {
      // ignore (some contexts block clipboard without permissions)
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.6em] text-white/60">Module</p>
        <h2 className="mt-3 font-[var(--font-teko)] text-3xl font-black tracking-[0.06em] text-white md:text-4xl">
          Équipements
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          Suivi des dotations (tailles, remis / non remis).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-white/55">
              Joueurs
            </CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {counts.players}
              <span className="ml-2 text-xs font-semibold text-white/45"></span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-white/55">
              Dotations incomplètes
            </CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {counts.incomplete}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-white/55">
              Tailles manquantes
            </CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {counts.missingSize}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="premium-card card-shell rounded-3xl">
        <CardHeader>
          <CardTitle>Recherche & filtres</CardTitle>
          <CardDescription>
            Filtrer par pôle, statut de remise et recherche par nom / équipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                Recherche
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Enzo, U13…"
                className={inputBaseClassName()}
                inputMode="search"
                aria-label="Rechercher un joueur"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                Pôle
              </span>
              <select
                value={pole}
                onChange={(e) => setPole(e.target.value as EquipmentPole | 'all')}
                className={inputBaseClassName()}
                aria-label="Filtrer par pôle"
              >
                <option value="all">Tous les pôles</option>
                {equipmentPoles.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                Statut
              </span>
              <select
                value={deliveryFilter}
                onChange={(e) => setDeliveryFilter(e.target.value as DeliveryFilter)}
                className={inputBaseClassName()}
                aria-label="Filtrer par statut"
              >
                <option value="todo">À remettre</option>
                <option value="complete">Complet</option>
                <option value="all">Tous</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-white/60" aria-live="polite">
              {isLoading ? 'Chargement des dotations…' : `${filtered.length} joueur(s)`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setQuery('')
                  setPole('all')
                  setDeliveryFilter('todo')
                }}
              >
                Réinitialiser
              </Button>
              <Button size="sm" variant="ghost" onClick={copyShareLink}>
                Copier le lien
              </Button>
              <Button size="sm" variant="ghost" disabled>
                Export CSV (bientôt)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardTitle>Liste</CardTitle>
            <CardDescription>Sélectionnez un joueur pour gérer les dotations.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ul className="grid gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <li
                    key={i}
                    className="h-[92px] animate-pulse rounded-2xl border border-white/10 bg-white/5"
                  />
                ))}
              </ul>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Aucun résultat</p>
                <p className="mt-1 text-sm text-white/65">Ajustez la recherche ou les filtres.</p>
              </div>
            ) : (
              <ul className="grid gap-3">
                {filtered.map((p) => {
                  const isSelected = p.id === selectedPlayer?.id
                  const { given, total, ratio } = completion(p)
                  const pillVariant =
                    given === total ? 'success' : ratio >= 0.6 ? 'warning' : 'danger'

                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(p.id)}
                        className={`group w-full rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                          isSelected
                            ? 'border-white/25 bg-white/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/7'
                        }`}
                        aria-current={isSelected ? 'true' : undefined}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">{p.name}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/55">
                              {p.teamName} • {p.pole}
                            </p>
                          </div>
                          <Pill variant={pillVariant} className="shrink-0">
                            {given}/{total}
                          </Pill>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/15 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/65">
                            {p.category}
                          </span>
                          {hasMissingSize(p) ? (
                            <span className="rounded-full border border-white/15 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">
                              taille ?
                            </span>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardTitle>Détails</CardTitle>
            <CardDescription>Checklist des pièces + actions de remise.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-3">
                <div className="h-5 w-2/3 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                <div className="mt-2 h-28 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
              </div>
            ) : !selectedPlayer ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Aucune sélection</p>
                <p className="mt-1 text-sm text-white/65">Choisissez un joueur dans la liste.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/55">Joueur</p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedPlayer.name}</p>
                  <p className="mt-1 text-sm text-white/70">
                    {selectedPlayer.teamName} • {selectedPlayer.pole} • {selectedPlayer.category}
                  </p>
                </div>

                {selectedPlayer.notes ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/55">Note</p>
                    <p className="mt-2 text-sm text-white/70">{selectedPlayer.notes}</p>
                  </div>
                ) : null}

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/55">Dotation</p>
                  <ul className="mt-3 grid gap-2">
                    {selectedPlayer.items.map((it) => {
                      const variant = it.given ? 'success' : it.size ? 'warning' : 'danger'

                      return (
                        <li
                          key={it.type}
                          className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-3 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">
                              {formatItemLine(it.type, it.size)}
                            </p>
                            <p className="mt-1 text-xs text-white/45">
                              {it.given
                                ? `Remis le ${it.givenAt ?? ''}`
                                : it.size
                                  ? 'À remettre'
                                  : 'Taille à confirmer'}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Pill variant={variant}>
                              {it.given ? 'remis' : it.size ? 'en attente' : 'taille ?'}
                            </Pill>
                            <Button
                              size="sm"
                              variant={it.given ? 'ghost' : 'secondary'}
                              onClick={() => toggleGiven(selectedPlayer.id, it.type)}
                            >
                              {it.given ? 'Marquer non remis' : 'Marquer remis'}
                            </Button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="ghost" disabled>
                    Modifier tailles (bientôt)
                  </Button>
                  <Button size="sm" variant="ghost" disabled>
                    Historique complet (bientôt)
                  </Button>
                </div>

                <p className="text-xs text-white/45">
                  Prochaines itérations : gestion par lots (remise équipe), import tailles, export
                  CSV, permissions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
