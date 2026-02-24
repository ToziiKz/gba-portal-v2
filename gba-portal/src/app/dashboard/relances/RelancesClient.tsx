'use client'

import * as React from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pill } from '@/components/ui/Pill'
import { updateRelanceStatus, type Relance } from './actions'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/components/PermissionsProvider'

const REMINDER_KINDS = [
  { id: 'all', label: 'Tous', note: 'licences + équipements' },
  { id: 'licence', label: 'Licences', note: 'à encaisser / en retard' },
  { id: 'equipment', label: 'Équipements', note: 'tailles / remise' },
]

const REMINDER_POLES = ['École de foot', 'Pré-formation', 'Formation']

function inputBaseClassName() {
  return 'w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/20'
}

function kindLabel(kind: string) {
  return kind === 'licence' ? 'licence' : 'équipement'
}

function kindVariant(kind: string) {
  return kind === 'licence' ? ('warning' as const) : ('neutral' as const)
}

function statusVariant(status: string) {
  switch (status) {
    case 'done':
      return 'success' as const
    case 'snoozed':
      return 'neutral' as const
    default:
      return 'danger' as const
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'done':
      return 'traité'
    case 'snoozed':
      return 'snoozé'
    default:
      return 'à faire'
  }
}

function formatEur(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function buildMessage(row: Relance) {
  if (row.kind === 'licence') {
    const amount =
      typeof row.amount_due_eur === 'number' ? formatEur(row.amount_due_eur) : '(montant ?)'
    const due = row.due_date ? ` (échéance ${row.due_date})` : ''

    return [
      `Bonjour ${row.contact_name || ''},`,
      '',
      `Petit rappel pour la licence de ${row.player_name} (${row.team}, ${row.category}).`,
      `Montant restant : ${amount}${due}.`,
      '',
      'Merci de nous confirmer le règlement ou la date prévue.',
      'Sportivement,',
      'GBA — Staff',
      '',
      '',
    ].join('\n')
  }

  const todo = row.equipment_todo_label
    ? `Équipement à traiter : ${row.equipment_todo_label}.`
    : 'Équipement à traiter.'
  return [
    `Bonjour ${row.contact_name || ''},`,
    '',
    `On prépare la dotation équipement pour ${row.player_name} (${row.team}, ${row.category}).`,
    todo,
    '',
    'Pouvez-vous nous confirmer la/les taille(s) manquante(s) si besoin ?',
    'Merci !',
    'GBA — Staff',
    '',
    '',
  ].join('\n')
}

export default function RelancesClient({ initialRelances }: { initialRelances: Relance[] }) {
  const router = useRouter()
  const { role } = usePermissions()
  const canWrite = role === 'admin' || role === 'resp_sportif'

  const [relances, setRelances] = React.useState<Relance[]>(initialRelances)

  const [query, setQuery] = React.useState('')
  const [kind, setKind] = React.useState<string>('all')
  const [pole, setPole] = React.useState<string | 'all'>('all')
  const [onlyTodo, setOnlyTodo] = React.useState(true)

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [toast, setToast] = React.useState<string | null>(null)

  React.useEffect(() => {
    setRelances(initialRelances)
  }, [initialRelances])

  React.useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(t)
  }, [toast])

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()

    return relances
      .filter((r) => (kind === 'all' ? true : r.kind === kind))
      .filter((r) => (pole === 'all' ? true : r.pole === pole))
      .filter((r) => {
        if (!onlyTodo) return true
        return (r.status ?? 'pending') === 'pending'
      })
      .filter((r) => {
        if (!q) return true
        const hay =
          `${r.player_name} ${r.team} ${r.category} ${r.pole} ${r.contact_name}`.toLowerCase()
        return hay.includes(q)
      })
  }, [query, kind, pole, onlyTodo, relances])

  const selectedRow = React.useMemo(() => {
    return rows.find((r) => r.id === selectedId) ?? rows[0] ?? null
  }, [rows, selectedId])

  const selectedRowId = selectedRow?.id ?? null

  React.useEffect(() => {
    setSelectedId(selectedRowId)
  }, [selectedRowId])

  const todoCount = React.useMemo(() => {
    return relances.filter((s) => (s.status ?? 'pending') === 'pending').length
  }, [relances])

  async function handleStatusUpdate(id: string, status: string) {
    if (!canWrite) return
    try {
      // optimistic update
      setRelances((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
      await updateRelanceStatus(id, status)
      router.refresh()
    } catch {
      setToast('Erreur lors de la mise à jour')
      router.refresh()
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.6em] text-white/60">Module</p>
        <h2 className="mt-3 font-[var(--font-teko)] text-3xl font-black tracking-[0.06em] text-white md:text-4xl">
          Relances
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          Liste de relances : licences à encaisser + équipements à traiter.
        </p>
      </div>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
        >
          {toast}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-white/55">
              À traiter
            </CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {todoCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-white/55">
              Lignes visibles
            </CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {rows.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="premium-card card-shell rounded-3xl">
        <CardHeader>
          <CardTitle>Recherche & filtres</CardTitle>
          <CardDescription>
            Filtrer par type/pôle, puis rechercher par joueur/équipe/contact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                Type
              </span>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className={inputBaseClassName()}
                aria-label="Filtrer par type"
              >
                {REMINDER_KINDS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label} — {k.note}
                  </option>
                ))}
              </select>
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
                {REMINDER_POLES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                Recherche
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: U13, Diallo, parent…"
                className={inputBaseClassName()}
                inputMode="search"
                aria-label="Rechercher une relance"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <input
                type="checkbox"
                checked={onlyTodo}
                onChange={(e) => setOnlyTodo(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm text-white/75">Afficher uniquement “à faire”</span>
            </label>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setQuery('')
                  setKind('all')
                  setPole('all')
                  setOnlyTodo(true)
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardTitle>Backlog</CardTitle>
            <CardDescription>Sélectionnez une ligne pour voir l’aperçu du message.</CardDescription>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Aucun résultat</p>
                <p className="mt-1 text-sm text-white/65">
                  Essayez de modifier les filtres ou la recherche.
                </p>
              </div>
            ) : (
              <ul className="grid gap-3">
                {rows.map((r) => {
                  const isSelected = r.id === selectedRow?.id
                  const st = r.status ?? 'pending'

                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(r.id)}
                        className={`group w-full rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                          isSelected
                            ? 'border-white/25 bg-white/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/7'
                        }`}
                        aria-current={isSelected ? 'true' : undefined}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">{r.player_name}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/55">
                              {r.team} • {r.pole}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <Pill variant={statusVariant(st)}>{statusLabel(st)}</Pill>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Pill variant={kindVariant(r.kind)}>{kindLabel(r.kind)}</Pill>
                          <span className="rounded-full border border-white/15 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/65">
                            {r.category}
                          </span>
                          <span className="rounded-full border border-white/15 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
                            canal: {r.channel_hint}
                          </span>
                        </div>

                        {r.kind === 'licence' && typeof r.amount_due_eur === 'number' ? (
                          <p className="mt-2 text-xs text-white/60">
                            Reste: {formatEur(r.amount_due_eur)}
                          </p>
                        ) : null}
                        {r.kind === 'equipment' && r.equipment_todo_label ? (
                          <p className="mt-2 text-xs text-white/60">{r.equipment_todo_label}</p>
                        ) : null}

                        <p className="mt-2 text-[11px] text-white/35">{r.last_action_label}</p>
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
            <CardTitle>Aperçu & actions</CardTitle>
            <CardDescription>
              UI-only : copier/coller le message puis marquer traité.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedRow ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Aucune sélection</p>
                <p className="mt-1 text-sm text-white/65">Choisissez une ligne dans le backlog.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/55">Cible</p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedRow.player_name}</p>
                  <p className="mt-1 text-sm text-white/70">
                    {selectedRow.team} • {selectedRow.category} • {selectedRow.pole}
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    Contact : {selectedRow.contact_name}
                    {selectedRow.contact_email ? ` · ${selectedRow.contact_email}` : ''}
                    {selectedRow.contact_phone ? ` · ${selectedRow.contact_phone}` : ''}
                  </p>
                </div>

                {selectedRow.note ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/55">Note</p>
                    <p className="mt-2 text-sm text-white/70">{selectedRow.note}</p>
                  </div>
                ) : null}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                    Message
                  </p>
                  {!canWrite ? (
                    <p className="mt-2 text-xs text-white/50">Lecture seule (permissions).</p>
                  ) : null}
                  <pre className="mt-3 min-h-[260px] whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/70">
                    {buildMessage(selectedRow)}
                  </pre>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(buildMessage(selectedRow))
                          setToast('Message copié (clipboard)')
                        } catch {
                          setToast('Impossible de copier (permissions navigateur)')
                        }
                      }}
                    >
                      Copier
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusUpdate(selectedRow.id, 'done')}
                    >
                      Marquer traité
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStatusUpdate(selectedRow.id, 'snoozed')}
                    >
                      Snoozer
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStatusUpdate(selectedRow.id, 'pending')}
                    >
                      Remettre à faire
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
