import { dashboardPlayersMock } from '@/lib/mocks/dashboardPlayers'
import { planningSessionsMock, type PlanningSession } from '@/lib/mocks/dashboardPlanning'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export type AttendanceRow = {
  id: string
  playerId: string
  playerName: string
  status: AttendanceStatus
  note?: string
}

export type AttendanceSession = {
  id: string
  planningSessionId: PlanningSession['id']
  pole: PlanningSession['pole']
  day: PlanningSession['day']
  start: PlanningSession['start']
  end: PlanningSession['end']
  team: PlanningSession['team']
  location: PlanningSession['location']
  updatedAtLabel: string
  rows: AttendanceRow[]
}

function pickRoster(team: string, size: number) {
  const fromTeam = dashboardPlayersMock.filter((p) => p.team === team)
  const pool = fromTeam.length > 0 ? fromTeam : dashboardPlayersMock
  return pool.slice(0, Math.min(size, pool.length))
}

function makeRows(team: string): AttendanceRow[] {
  const roster = pickRoster(team, 14)

  return roster.map((p, index) => {
    let status: AttendanceStatus = 'present'
    if (index === 1) status = 'late'
    if (index === 4) status = 'excused'
    if (index === 7) status = 'absent'

    return {
      id: `att-${p.id}`,
      playerId: p.id,
      playerName: `${p.firstName} ${p.lastName}`,
      status,
      note: status === 'late' ? 'Trafic' : status === 'excused' ? 'Certificat' : undefined,
    }
  })
}

export const attendanceSessionsMock: AttendanceSession[] = planningSessionsMock
  .slice(0, 10)
  .map((s, idx) => ({
    id: `attendance-${s.id}`,
    planningSessionId: s.id,
    pole: s.pole,
    day: s.day,
    start: s.start,
    end: s.end,
    team: s.team,
    location: s.location,
    updatedAtLabel: idx === 0 ? 'hier' : 'il y a 2j',
    rows: makeRows(s.team),
  }))
