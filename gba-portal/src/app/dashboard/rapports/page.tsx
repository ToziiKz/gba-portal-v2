import type { Metadata } from 'next'

import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Synthèse · ESPACE GBA',
  robots: { index: false, follow: false },
}

const dayOrder = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const

type SessionTeam = { id: string; name: string; category: string | null }
type SessionRow = {
  id: string
  day: string | null
  pole: string | null
  start_time: string | null
  end_time: string | null
  location: string | null
  team: SessionTeam | SessionTeam[] | null
}

type AttendanceRow = { session_id: string }

function dayRank(day: string | null | undefined) {
  const idx = dayOrder.findIndex((d) => d === day)
  return idx === -1 ? 999 : idx
}

function normalizeTeam(team: SessionTeam | SessionTeam[] | null): SessionTeam | null {
  if (!team) return null
  return Array.isArray(team) ? (team[0] ?? null) : team
}

export default async function DashboardSynthesePage() {
  const supabase = await createClient()

  const [{ count: playersCount }, { count: teamsCount }, { data: sessions }] = await Promise.all([
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('planning_sessions').select(
      `
        id,
        day,
        pole,
        start_time,
        end_time,
        location,
        staff,
        note,
        team:team_id(id,name,category)
      `
    ),
  ])

  const orderedSessions = ((sessions ?? []) as SessionRow[]).slice().sort((a, b) => {
    const dr = dayRank(a.day) - dayRank(b.day)
    if (dr !== 0) return dr
    return String(a.start_time).localeCompare(String(b.start_time))
  })

  const nextSessions = orderedSessions.slice(0, 6)

  // Quick “needs attendance” indicator: sessions with 0 rows in attendance.
  const nextIds = nextSessions.map((s) => s.id)
  let attendanceCountBySession = new Map<string, number>()
  if (nextIds.length > 0) {
    const { data: att } = await supabase
      .from('attendance')
      .select('session_id')
      .in('session_id', nextIds)

    attendanceCountBySession = new Map<string, number>()
    for (const row of (att ?? []) as AttendanceRow[]) {
      const sid = String(row.session_id)
      attendanceCountBySession.set(sid, (attendanceCountBySession.get(sid) ?? 0) + 1)
    }
  }

  const missingAttendance = nextSessions.filter(
    (s) => (attendanceCountBySession.get(String(s.id)) ?? 0) === 0
  )

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.6em] text-white/60">Module</p>
        <h2 className="mt-3 font-[var(--font-teko)] text-3xl font-black tracking-[0.06em] text-white md:text-4xl">
          Synthèse
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          Vue simple, utile et actionnable pour piloter le quotidien du club.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardTitle>Effectif</CardTitle>
            <CardDescription>Base joueurs & équipes.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black tracking-tight text-white">{playersCount ?? '—'}</p>
            <p className="mt-1 text-xs text-white/50">joueurs</p>
            <p className="mt-3 text-sm text-white/65">
              Équipes : <span className="font-semibold text-white">{teamsCount ?? '—'}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/dashboard/joueurs">
                <Button size="sm" variant="secondary">
                  Ouvrir Joueurs
                </Button>
              </Link>
              <Link href="/dashboard/equipes">
                <Button size="sm" variant="ghost">
                  Ouvrir Équipes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardTitle>Présences à faire</CardTitle>
            <CardDescription>Priorité : compléter l’appel.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black tracking-tight text-white">
              {missingAttendance.length}
            </p>
            <p className="mt-1 text-xs text-white/50">séance(s) sans saisie (sur les prochaines)</p>
            <div className="mt-4">
              <Link href="/dashboard/presences">
                <Button size="sm">Aller aux Présences</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card card-shell rounded-3xl">
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Accès direct aux outils coach.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Link href="/dashboard/planning">
                <Button variant="secondary" className="w-full">
                  Planning club
                </Button>
              </Link>
              <Link href="/dashboard/convocations">
                <Button variant="secondary" className="w-full">
                  Convocations
                </Button>
              </Link>
              <Link href="/dashboard/tactique">
                <Button variant="secondary" className="w-full">
                  Tactique
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="premium-card card-shell rounded-3xl">
        <CardHeader>
          <CardTitle>Prochaines séances</CardTitle>
          <CardDescription>Référence club. Clique pour gérer les présences.</CardDescription>
        </CardHeader>
        <CardContent>
          {nextSessions.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Aucune séance</p>
              <p className="mt-1 text-sm text-white/65">
                Ajoute des séances dans le planning pour démarrer.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {nextSessions.map((s) => {
                const hasAttendance = (attendanceCountBySession.get(String(s.id)) ?? 0) > 0
                const team = normalizeTeam(s.team)
                return (
                  <li key={s.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {team?.category ?? '—'} • {team?.name ?? 'Séance'}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/55">
                          {s.pole}
                        </p>
                        <p className="mt-2 text-xs text-white/60">
                          {s.day} • {s.start_time}–{s.end_time} • {s.location}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${hasAttendance ? 'border-green-400/20 bg-green-400/10 text-green-300' : 'border-yellow-400/20 bg-yellow-400/10 text-yellow-300'}`}
                      >
                        {hasAttendance ? 'OK' : 'À faire'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href="/dashboard/presences">
                        <Button size="sm">Ouvrir Présences</Button>
                      </Link>
                      <Link href="/dashboard/planning">
                        <Button size="sm" variant="ghost">
                          Voir planning
                        </Button>
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-white/45">
        Note : cette page remplace l’ancien module “Rapports” (trop complexe). On garde uniquement
        du concret et actionnable.
      </p>
    </div>
  )
}
