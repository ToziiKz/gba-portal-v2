'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getDashboardScope } from '@/lib/dashboard/getDashboardScope'
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  teamId: z.string().uuid(),
})

export async function createPlayer(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const data = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    teamId: formData.get('teamId'),
  }

  const parsed = schema.safeParse(data)
  if (!parsed.success) return { message: 'Données invalides' }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { message: 'Non authentifié' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (profile?.is_active === false) return { message: 'Compte suspendu' }

  const scope = await getDashboardScope()
  if (
    !(scope.editableTeamIds ?? []).includes(parsed.data.teamId) &&
    profile?.role !== 'admin' &&
    profile?.role !== 'resp_sportif'
  ) {
    return { message: 'Vous ne pouvez pas créer un joueur hors de vos équipes.' }
  }

  // Optional: derive category from selected team for consistency
  const { data: team } = await supabase
    .from('teams')
    .select('category')
    .eq('id', parsed.data.teamId)
    .single()

  const payload = {
    firstname: parsed.data.firstName,
    lastname: parsed.data.lastName,
    team_id: parsed.data.teamId,
    category: team?.category ?? null,
  }

  const { error } = await supabase.from('players').insert([payload])
  if (error) return { message: 'Erreur lors de la création: ' + error.message }

  revalidatePath('/dashboard/joueurs')
  revalidatePath('/dashboard/effectif')
  return { message: 'Joueur créé !', success: true }
}
