import {
  PlanningView,
  type Session,
  type TeamOption,
} from '@/components/dashboard/planning/PlanningView'
import { getScopedPlanningData } from '@/lib/dashboard/server-data'

export const metadata = {
  title: 'Planning · ESPACE GBA',
}

function withStressMock(sessions: Session[]): Session[] {
  const mock: Session[] = [
    {
      id: 'mock-babyfoot',
      day: 'Mer',
      pole: 'École de foot',
      start_time: '15:30',
      end_time: '16:30',
      location: 'Ittenheim - Babyfoot',
      staff: ['Coach Babyfoot'],
      note: '[MOCK STRESS] Babyfoot',
      team: { id: 't-babyfoot', name: 'Babyfoot', category: 'Loisir' },
    },

    {
      id: 'mock-u6',
      day: 'Mer',
      pole: 'École de foot',
      start_time: '17:00',
      end_time: '18:30',
      location: 'Ittenheim - Terrain A',
      staff: ['Coach U6'],
      note: '[MOCK STRESS] créneau commun',
      team: { id: 't-u6', name: 'U6', category: 'U6' },
    },
    {
      id: 'mock-u7',
      day: 'Mer',
      pole: 'École de foot',
      start_time: '17:00',
      end_time: '18:30',
      location: 'Ittenheim - Terrain B',
      staff: ['Coach U7'],
      note: '[MOCK STRESS] créneau commun',
      team: { id: 't-u7', name: 'U7', category: 'U7' },
    },
    {
      id: 'mock-u8',
      day: 'Mer',
      pole: 'École de foot',
      start_time: '17:00',
      end_time: '18:30',
      location: 'Ittenheim - Terrain C',
      staff: ['Coach U8'],
      note: '[MOCK STRESS] créneau commun',
      team: { id: 't-u8', name: 'U8', category: 'U8' },
    },
    {
      id: 'mock-u9',
      day: 'Mer',
      pole: 'École de foot',
      start_time: '17:15',
      end_time: '18:45',
      location: 'Ittenheim - Terrain D',
      staff: ['Coach U9'],
      note: '[MOCK STRESS] créneau commun',
      team: { id: 't-u9', name: 'U9', category: 'U9' },
    },

    {
      id: 'mock-u16d1',
      day: 'Mer',
      pole: 'Formation',
      start_time: '18:30',
      end_time: '20:00',
      location: 'Ittenheim - Terrain A',
      staff: ['Coach U16 D1'],
      note: '[MOCK STRESS] chevauchement staff/terrain',
      team: { id: 't-u16d1', name: 'U16 D1', category: 'U16' },
    },
    {
      id: 'mock-u18fr2',
      day: 'Mer',
      pole: 'Féminines',
      start_time: '18:30',
      end_time: '20:00',
      location: 'Ittenheim - Terrain B',
      staff: ['Coach U18F R2'],
      note: '[MOCK STRESS] chevauchement staff/terrain',
      team: { id: 't-u18fr2', name: 'U18F R2', category: 'U18F' },
    },

    {
      id: 'mock-u18d1',
      day: 'Mer',
      pole: 'Formation',
      start_time: '20:00',
      end_time: '21:30',
      location: 'Ittenheim - Terrain A',
      staff: ['Coach U18 D1'],
      note: '[MOCK STRESS] soirée',
      team: { id: 't-u18d1', name: 'U18 D1', category: 'U18' },
    },
    {
      id: 'mock-seniorsf',
      day: 'Mer',
      pole: 'Séniors',
      start_time: '20:00',
      end_time: '21:30',
      location: 'Ittenheim - Terrain B',
      staff: ['Coach Seniors F'],
      note: '[MOCK STRESS] soirée',
      team: { id: 't-seniorsf', name: 'Seniors F', category: 'Seniors F' },
    },

    {
      id: 'mock-seniors1-match',
      day: 'Dim',
      pole: 'Séniors',
      start_time: '15:00',
      end_time: '17:00',
      location: 'Ittenheim - Terrain Synthétique',
      staff: ['Coach Seniors 1'],
      note: '[MATCH] Seniors 1',
      team: { id: 't-seniors1', name: 'Seniors 1', category: 'Seniors' },
    },
    {
      id: 'mock-u11-plateau',
      day: 'Sam',
      pole: 'École de foot',
      start_time: '10:30',
      end_time: '12:30',
      location: 'Achenheim - Terrain Synthétique',
      staff: ['Coach U11'],
      note: '[PLATEAU] U11',
      team: { id: 't-u11', name: 'U11', category: 'U11' },
    },
    {
      id: 'mock-u15-competition',
      day: 'Sam',
      pole: 'Formation',
      start_time: '14:00',
      end_time: '16:00',
      location: 'Achenheim - Terrain Herbe',
      staff: ['Coach U15'],
      note: '[COMPETITION] U15',
      team: { id: 't-u15', name: 'U15 D1', category: 'U15' },
    },
    {
      id: 'mock-reunion-clubhouse',
      day: 'Ven',
      pole: 'Réunion',
      start_time: '18:00',
      end_time: '19:00',
      location: 'Achenheim - Clubhouse',
      staff: ['Direction sportive'],
      note: '[EVENT] Réunion staff',
      team: { id: 't-reunion', name: 'Réunion staff', category: 'Staff' },
    },
  ]

  return [...sessions, ...mock]
}

export default async function PlanningPage({
  searchParams,
}: {
  searchParams?: Promise<{ stress?: string }>
}) {
  const params = (await searchParams) ?? {}
  const stressEnabled = params.stress === '1'

  const { scope, sessions, teams } = await getScopedPlanningData()
  const finalSessions = stressEnabled
    ? withStressMock((sessions ?? []) as Session[])
    : ((sessions ?? []) as Session[])

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.32em] text-slate-400">Module</p>
        <h2 className="mt-2 font-[var(--font-teko)] text-4xl font-black uppercase tracking-[0.04em] text-slate-900">
          Planning
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          {scope.role === 'coach'
            ? 'Vue terrain de vos équipes : créneaux, chevauchements et accès rapide à la présence.'
            : 'Planning club : création, suppression et pilotage hebdomadaire.'}
        </p>
        {stressEnabled ? (
          <p className="mt-2 inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
            Mode stress actif (mock)
          </p>
        ) : null}
      </div>

      <PlanningView sessions={finalSessions} teams={(teams ?? []) as unknown as TeamOption[]} />
    </div>
  )
}
