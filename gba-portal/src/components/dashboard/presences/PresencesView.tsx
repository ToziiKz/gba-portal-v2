'use client'

import * as React from 'react'
import { Search, RotateCcw, Clock3, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { RosterChecklist } from '@/components/dashboard/RosterChecklist'
import { useDashboardScope } from '@/components/dashboard/DashboardScopeProvider'

const planningDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const

type PlanningDay = (typeof planningDays)[number]

export type PresenceSession = {
  id: string
  day: PlanningDay
  pole: string
  start_time: string
  end_time: string
  location: string
  staff: string[]
  note: string | null
  team: { id: string; name: string; category: string } | null
}

type Props = {
  sessions: PresenceSession[]
}

function sessionTimeLabel(s: PresenceSession) {
  return `${s.start_time}–${s.end_time}`
}

function groupByDay(sessions: PresenceSession[]) {
  const map = new Map<PlanningDay, PresenceSession[]>()
  for (const day of planningDays) map.set(day, [])
  for (const s of sessions) map.get(s.day)?.push(s)
  for (const day of planningDays) {
    const items = map.get(day)
    if (!items) continue
    items.sort((a, b) => a.start_time.localeCompare(b.start_time))
  }
  return map
}

function inputBaseClassName() {
  return 'h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white'
}

export function PresencesView({ sessions }: Props) {
  const scope = useDashboardScope()

  const [teamId, setTeamId] = React.useState<string | 'all'>('all')
  const [query, setQuery] = React.useState('')
  const [selectedSession, setSelectedSession] = React.useState<PresenceSession | null>(null)

  const coachTeamIds = React.useMemo(
    () => (scope.role === 'coach' ? (scope.editableTeamIds ?? []) : []),
    [scope.role, scope.editableTeamIds]
  )

  React.useEffect(() => {
    if (scope.role !== 'coach') return
    if (teamId !== 'all') return
    if (coachTeamIds.length === 0) return
    setTeamId(coachTeamIds[0])
  }, [scope.role, coachTeamIds, teamId])

  const teamOptions = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; category: string }>()
    for (const s of sessions) {
      const t = s.team
      if (!t) continue
      map.set(t.id, t)
    }
    return Array.from(map.values()).sort((a, b) =>
      `${a.category} ${a.name}`.localeCompare(`${b.category} ${b.name}`)
    )
  }, [sessions])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()

    return sessions
      .filter((s) => {
        if (scope.role !== 'coach') return true
        const tid = s.team?.id
        return tid ? coachTeamIds.includes(tid) : false
      })
      .filter((s) => (teamId === 'all' ? true : s.team?.id === teamId))
      .filter((s) => {
        if (!q) return true
        const hay =
          `${s.team?.name ?? ''} ${s.team?.category ?? ''} ${s.location} ${s.staff.join(' ')} ${s.note ?? ''}`.toLowerCase()
        return hay.includes(q)
      })
  }, [sessions, scope.role, teamId, query, coachTeamIds])

  const sessionsByDay = React.useMemo(() => groupByDay(filtered), [filtered])

  const myNextSessions = React.useMemo(() => {
    if (scope.role !== 'coach') return [] as PresenceSession[]

    const mine = sessions
      .filter((s) => {
        const tid = s.team?.id
        return tid ? coachTeamIds.includes(tid) : false
      })
      .slice()
      .sort((a, b) => {
        const ar = planningDays.indexOf(a.day)
        const br = planningDays.indexOf(b.day)
        if (ar !== br) return ar - br
        return a.start_time.localeCompare(b.start_time)
      })

    return mine.slice(0, 4)
  }, [scope.role, sessions, coachTeamIds])

  return (
    <div className="grid gap-6">
      <Card className="rounded-3xl border-slate-100 bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Accès rapide présences</CardTitle>
          <CardDescription>
            {scope.role === 'coach'
              ? 'Focus sur tes équipes. Ouvre une séance et lance l’appel en 1 clic.'
              : 'Filtre les séances puis ouvre la feuille de présence.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Équipe
              </span>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className={inputBaseClassName()}
              >
                <option value="all">Toutes</option>
                {teamOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.category} • {t.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 md:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Recherche
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ex: U11, Synthétique, Ittenheim..."
                  className={`${inputBaseClassName()} pl-10`}
                />
              </div>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                {filtered.length} séance(s)
              </span>
              {scope.role === 'coach' ? (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Mode coach</span>
              ) : null}
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setTeamId('all')
                setQuery('')
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {scope.role === 'coach' ? (
        <Card className="rounded-3xl border-slate-100 bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Mes prochaines séances</CardTitle>
            <CardDescription>Raccourcis terrain pour pointer rapidement.</CardDescription>
          </CardHeader>
          <CardContent>
            {myNextSessions.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Aucune séance visible pour vos équipes.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {myNextSessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSession(s)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <p className="text-sm font-bold text-slate-900">{s.team?.name ?? '—'}</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-xs text-slate-600">
                      <Clock3 className="h-3.5 w-3.5" /> {s.day} • {sessionTimeLabel(s)}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-2 text-xs text-slate-600">
                      <MapPin className="h-3.5 w-3.5" /> {s.location}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-3xl border-slate-100 bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Planning des présences</CardTitle>
          <CardDescription>
            Cliquer sur une séance pour ouvrir la feuille de présence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Aucune séance avec ces filtres.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-7">
              {planningDays.map((day) => {
                const items = sessionsByDay.get(day) ?? []
                return (
                  <section
                    key={day}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <header className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                        {day}
                      </p>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        {items.length}
                      </span>
                    </header>

                    {items.length === 0 ? (
                      <p className="mt-3 text-xs text-slate-400">—</p>
                    ) : (
                      <ul className="mt-3 grid gap-2">
                        {items.map((s) => (
                          <li key={s.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedSession(s)}
                              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                            >
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {s.team?.name ?? '—'}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-500">{s.pole}</p>
                              <p className="mt-1 text-[11px] text-slate-600">
                                {sessionTimeLabel(s)}
                              </p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title={selectedSession ? `Présences — ${selectedSession.team?.name ?? ''}` : ''}
        description={
          selectedSession ? `${selectedSession.day} • ${sessionTimeLabel(selectedSession)}` : ''
        }
      >
        {selectedSession?.team ? (
          <RosterChecklist
            sessionId={selectedSession.id}
            teamId={selectedSession.team.id}
            teamLabel={`${selectedSession.team.category} • ${selectedSession.team.name}`}
            onBack={() => setSelectedSession(null)}
            onClose={() => setSelectedSession(null)}
          />
        ) : (
          <p className="text-sm text-slate-500">Aucune équipe liée à cette séance.</p>
        )}
      </Modal>
    </div>
  )
}
