export type TeamPole = 'École de foot' | 'Pré-formation' | 'Formation'

export type StaffRole = 'coach' | 'adjoint' | 'dir-sportif' | 'resp-pôle'

export type TeamStaffMember = {
  id: string
  name: string
  role: StaffRole
}

export type DashboardTeam = {
  id: string
  name: string
  category: string // ex: U6, U9, U13, Seniors
  pole: TeamPole
  playersCount: number
  staff: TeamStaffMember[]
  sessionsWeekly: number
  lastUpdateLabel: string
}

export const dashboardTeamsMock: DashboardTeam[] = [
  {
    id: 'u7',
    name: 'GBA U7',
    category: 'U7',
    pole: 'École de foot',
    playersCount: 18,
    staff: [
      { id: 's1', name: 'A. Bernard', role: 'coach' },
      { id: 's2', name: 'L. Martin', role: 'adjoint' },
    ],
    sessionsWeekly: 2,
    lastUpdateLabel: 'il y a 2 jours',
  },
  {
    id: 'u9',
    name: 'GBA U9',
    category: 'U9',
    pole: 'École de foot',
    playersCount: 24,
    staff: [{ id: 's3', name: 'M. Dubois', role: 'coach' }],
    sessionsWeekly: 2,
    lastUpdateLabel: 'aujourd’hui',
  },
  {
    id: 'u11a',
    name: 'GBA U11 A',
    category: 'U11',
    pole: 'École de foot',
    playersCount: 17,
    staff: [
      { id: 's4', name: 'C. Laurent', role: 'coach' },
      { id: 's5', name: 'N. Petit', role: 'adjoint' },
    ],
    sessionsWeekly: 3,
    lastUpdateLabel: 'il y a 1 semaine',
  },
  {
    id: 'u13',
    name: 'GBA U13',
    category: 'U13',
    pole: 'Pré-formation',
    playersCount: 20,
    staff: [
      { id: 's6', name: 'S. Leroy', role: 'coach' },
      { id: 's7', name: 'R. Girard', role: 'resp-pôle' },
    ],
    sessionsWeekly: 3,
    lastUpdateLabel: 'hier',
  },
  {
    id: 'u15',
    name: 'GBA U15',
    category: 'U15',
    pole: 'Pré-formation',
    playersCount: 19,
    staff: [{ id: 's8', name: 'T. Moreau', role: 'coach' }],
    sessionsWeekly: 3,
    lastUpdateLabel: 'il y a 3 jours',
  },
  {
    id: 'u17',
    name: 'GBA U17',
    category: 'U17',
    pole: 'Formation',
    playersCount: 22,
    staff: [
      { id: 's9', name: 'P. Fontaine', role: 'coach' },
      { id: 's10', name: 'J. Caron', role: 'dir-sportif' },
    ],
    sessionsWeekly: 4,
    lastUpdateLabel: 'il y a 4 jours',
  },
]

export const dashboardTeamPoles: TeamPole[] = ['École de foot', 'Pré-formation', 'Formation']
