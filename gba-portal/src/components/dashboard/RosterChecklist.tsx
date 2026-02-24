'use client'

import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { log } from '@/lib/logger'

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused'

type RosterChecklistProps = {
  sessionId: string
  teamId: string
  teamLabel: string
  onBack: () => void
  onClose: () => void
}

type LocalAttendance = {
  playerId: string
  name: string
  status: AttendanceStatus
  note: string
}

type PlayerRow = {
  id: string
  firstname: string | null
  lastname: string | null
  category: string | null
}
type TeamSessionRow = { id: string }
type AttendanceHistoryRow = {
  session_id: string
  player_id: string
  status: AttendanceStatus
  updated_at: string | null
}

const statusOptions: { value: AttendanceStatus; label: string; color: string }[] = [
  {
    value: 'present',
    label: 'Présent',
    color: 'text-green-400 bg-green-400/10 border-green-400/20',
  },
  {
    value: 'late',
    label: 'Retard',
    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  },
  { value: 'excused', label: 'Excusé', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  { value: 'absent', label: 'Absent', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
]

export function RosterChecklist({
  sessionId,
  teamId,
  teamLabel,
  onBack,
  onClose,
}: RosterChecklistProps) {
  const [rows, setRows] = React.useState<LocalAttendance[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [playerStats, setPlayerStats] = React.useState<
    Record<string, { pct: number; presentLike: number; total: number }>
  >({})
  const [statsMeta, setStatsMeta] = React.useState<{ sessionsUsed: number } | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      const supabase = createClient()

      try {
        // 1. Get team details to find its category
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('category')
          .eq('id', teamId)
          .single()

        if (teamError || !teamData) {
          log.error('Team fetch error:', teamError)
          setIsLoading(false)
          return
        }

        // 2. Fetch players matching that category (fuzzy match)
        const [playersResult, attendanceResult] = await Promise.all([
          supabase
            .from('players')
            .select('id, firstname, lastname, category')
            .ilike('category', `${teamData.category}%`)
            .order('lastname'),
          supabase.from('attendance').select('player_id, status, note').eq('session_id', sessionId),
        ])

        if (cancelled) return

        const { data: players, error: playersError } = playersResult
        const { data: attendance, error: attError } = attendanceResult

        if (playersError || attError) {
          log.error('Data fetch error:', playersError, attError)
          setRows([])
          setIsLoading(false)
          return
        }

        const attendanceMap = new Map<string, { status: AttendanceStatus; note: string }>()
        for (const row of attendance ?? []) {
          attendanceMap.set(row.player_id, {
            status: row.status as AttendanceStatus,
            note: row.note ?? '',
          })
        }

        const data: LocalAttendance[] = ((players ?? []) as PlayerRow[]).map((p) => {
          const existing = attendanceMap.get(p.id)
          return {
            playerId: p.id,
            name: `${p.firstname ?? ''} ${p.lastname ?? ''}`.trim(),
            status: existing?.status ?? 'present',
            note: existing?.note ?? '',
          }
        })

        setRows(data)

        // 3. Compute simple per-player attendance stats over last N sessions for this team
        // We infer "last sessions" from attendance.updated_at since planning_sessions has no date.
        const N = 6
        const playerIds = ((players ?? []) as PlayerRow[]).map((p) => p.id)

        const { data: teamSessions } = await supabase
          .from('planning_sessions')
          .select('id')
          .eq('team_id', teamId)

        const sessionIds = ((teamSessions ?? []) as TeamSessionRow[]).map((s) => s.id)
        if (sessionIds.length === 0 || playerIds.length === 0) {
          setPlayerStats({})
          setStatsMeta({ sessionsUsed: 0 })
          return
        }

        const { data: histAttendance, error: histErr } = await supabase
          .from('attendance')
          .select('session_id, player_id, status, updated_at')
          .in('session_id', sessionIds)
          .in('player_id', playerIds)

        if (histErr) {
          log.error('History attendance fetch error:', histErr)
          setPlayerStats({})
          setStatsMeta({ sessionsUsed: 0 })
          return
        }

        const latestBySession = new Map<string, number>()
        for (const r of (histAttendance ?? []) as AttendanceHistoryRow[]) {
          const sid = String(r.session_id)
          const ts = Date.parse(r.updated_at ?? '')
          if (!Number.isFinite(ts)) continue
          const prev = latestBySession.get(sid) ?? 0
          if (ts > prev) latestBySession.set(sid, ts)
        }

        const lastSessionIds = Array.from(latestBySession.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, N)
          .map(([sid]) => sid)

        const stats: Record<string, { pct: number; presentLike: number; total: number }> = {}
        for (const pid of playerIds) {
          let total = 0
          let presentLike = 0

          for (const r of (histAttendance ?? []) as AttendanceHistoryRow[]) {
            if (String(r.player_id) !== String(pid)) continue
            if (!lastSessionIds.includes(String(r.session_id))) continue

            total += 1
            const st = r.status
            if (st === 'present' || st === 'late') presentLike += 1
          }

          const pct = total > 0 ? Math.round((presentLike / total) * 100) : 0
          stats[String(pid)] = { pct, presentLike, total }
        }

        setStatsMeta({ sessionsUsed: lastSessionIds.length })
        setPlayerStats(stats)
      } catch (err) {
        log.error('Unexpected error in load:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [sessionId, teamId])

  const handleStatusChange = (playerId: string, newStatus: AttendanceStatus) => {
    setRows((prev) =>
      prev.map((row) => (row.playerId === playerId ? { ...row, status: newStatus } : row))
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const payload = rows.map((r) => ({
        session_id: sessionId,
        player_id: r.playerId,
        status: r.status,
        note: r.note || null,
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('attendance')
        .upsert(payload, { onConflict: 'session_id,player_id' })

      if (error) {
        // keep modal open
        setIsSaving(false)
        return
      }

      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    )
  }

  const counts = {
    present: rows.filter((r) => r.status === 'present').length,
    late: rows.filter((r) => r.status === 'late').length,
    excused: rows.filter((r) => r.status === 'excused').length,
    absent: rows.filter((r) => r.status === 'absent').length,
  }

  const total = rows.length
  const attendancePct = total > 0 ? Math.round(((counts.present + counts.late) / total) * 100) : 0

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Feuille de présence</h3>
          <p className="mt-1 text-sm text-white/60">{teamLabel}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider font-bold">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/75">
            Total {total}
          </span>
          <span className="text-green-400">{counts.present} Présents</span>
          <span className="text-yellow-400">{counts.late} Retards</span>
          <span className="text-blue-400">{counts.excused} Excusés</span>
          <span className="text-red-400">{counts.absent} Absents</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
            Taux présence
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-white">{attendancePct}%</p>
          <p className="mt-1 text-xs text-white/45">Présent + retard / total</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
            Absences
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-white">{counts.absent}</p>
          <p className="mt-1 text-xs text-white/45">À relancer si besoin</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">Excusés</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-white">{counts.excused}</p>
          <p className="mt-1 text-xs text-white/45">Info coach</p>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {rows.map((row) => (
          <div
            key={row.playerId}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition hover:bg-white/10"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate max-w-[180px] sm:max-w-none">
                  {row.name}
                </span>
                {statsMeta?.sessionsUsed ? (
                  <span className="shrink-0 rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65">
                    {playerStats[row.playerId]?.pct ?? 0}%
                  </span>
                ) : null}
              </div>
              {statsMeta?.sessionsUsed ? (
                <p className="mt-1 text-[11px] text-white/45">
                  Assiduité sur {statsMeta.sessionsUsed} séance(s)
                </p>
              ) : null}
            </div>

            <div className="flex gap-1">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleStatusChange(row.playerId, opt.value)}
                  className={`
                            h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition
                            ${
                              row.status === opt.value
                                ? opt.color + ' border ring-1 ring-inset ring-white/10'
                                : 'text-white/20 hover:bg-white/10 hover:text-white/60'
                            }
                        `}
                  title={opt.label}
                  aria-label={`Marquer ${opt.label}`}
                >
                  {opt.label.charAt(0)}
                </button>
              ))}
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <p className="text-center text-sm text-white/40 py-4">
            Aucun joueur trouvé pour cette équipe.
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-white/10 flex justify-between gap-3">
        <Button variant="ghost" onClick={onBack} disabled={isSaving}>
          Retour
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  )
}
