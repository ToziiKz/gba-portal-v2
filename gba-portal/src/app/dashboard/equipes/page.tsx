import { createClient } from '@/lib/supabase/server'
import { TeamsView, type TeamWithCoach } from '@/components/dashboard/teams/TeamsView'
import { getDashboardScope } from '@/lib/dashboard/getDashboardScope'

export const metadata = {
  title: 'Équipes · GBA Dashboard',
}

export default async function TeamsPage() {
  const supabase = await createClient()
  const scope = await getDashboardScope()
  const role = scope.role

  const isGlobal = role === 'admin' || role.startsWith('resp_')

  let query = supabase
    .from('teams')
    .select(
      `
      id,
      name,
      category,
      pole,
      gender,
      coach_id,
      coach:coach_id(full_name),
      players(count)
    `
    )
    .order('name')

  // Non-admin/resp are restricted to their viewable scope.
  if (!isGlobal) {
    if (scope.viewableTeamIds && scope.viewableTeamIds.length > 0) {
      query = query.in('id', scope.viewableTeamIds)
    } else {
      // Impossible UUID to return empty set safely
      query = query.eq('id', '00000000-0000-0000-0000-000000000000')
    }
  }

  const { data: teams } = await query

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.6em] text-white/60">Module</p>
        <h2 className="mt-3 font-[var(--font-teko)] text-3xl font-black tracking-[0.06em] text-white md:text-4xl">
          Équipes
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          {role === 'admin'
            ? 'Gestion des équipes (structure fixe) et affectation des coachs.'
            : role === 'coach'
              ? 'Toutes les équipes de votre pôle.'
              : 'Accès lecture.'}
        </p>
      </div>

      <TeamsView role={role} initialTeams={(teams ?? []) as unknown as TeamWithCoach[]} />
    </div>
  )
}
