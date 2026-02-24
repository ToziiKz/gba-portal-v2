'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getDashboardScope } from '@/lib/dashboard/getDashboardScope'

async function getAuthContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (profile?.is_active === false) throw new Error('Compte suspendu')

  return { supabase, role: String(profile?.role ?? 'coach') }
}

export async function requestCreatePlayer(formData: FormData) {
  const { supabase, role } = await getAuthContext()
  const scope = await getDashboardScope()

  const firstname = String(formData.get('firstname') ?? '').trim()
  const lastname = String(formData.get('lastname') ?? '').trim()
  const teamId = String(formData.get('teamId') ?? '').trim()
  const gender = String(formData.get('gender') ?? '').trim() || null
  const category = String(formData.get('category') ?? '').trim() || null
  const club_name = String(formData.get('club_name') ?? '').trim() || null
  const license_number = String(formData.get('license_number') ?? '').trim() || null
  const mobile_phone = String(formData.get('mobile_phone') ?? '').trim() || null
  const email = String(formData.get('email') ?? '').trim() || null
  const legal_guardian_name = String(formData.get('legal_guardian_name') ?? '').trim() || null
  const address_street = String(formData.get('address_street') ?? '').trim() || null
  const address_zipcode = String(formData.get('address_zipcode') ?? '').trim() || null
  const address_city = String(formData.get('address_city') ?? '').trim() || null

  if (!firstname || !lastname || !teamId) throw new Error('Champs requis manquants')

  if (role === 'coach' && !(scope.editableTeamIds ?? []).includes(teamId)) {
    throw new Error('Vous ne pouvez ajouter un joueur que dans vos équipes.')
  }

  const { error } = await supabase.from('players').insert([
    {
      firstname,
      lastname,
      team_id: teamId,
      gender,
      category,
      club_name,
      license_number,
      mobile_phone,
      email,
      legal_guardian_name,
      address_street,
      address_zipcode,
      address_city,
    },
  ])

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/effectif')
  revalidatePath('/dashboard/joueurs')
}

export async function requestUpdatePlayer(formData: FormData) {
  const { supabase, role } = await getAuthContext()
  const scope = await getDashboardScope()

  const playerId = String(formData.get('playerId') ?? '').trim()
  const teamId = String(formData.get('teamId') ?? '').trim()
  const firstname = String(formData.get('firstname') ?? '').trim()
  const lastname = String(formData.get('lastname') ?? '').trim()
  const gender = String(formData.get('gender') ?? '').trim() || null
  const mobile_phone = String(formData.get('mobile_phone') ?? '').trim() || null
  const email = String(formData.get('email') ?? '').trim() || null
  const legal_guardian_name = String(formData.get('legal_guardian_name') ?? '').trim() || null

  if (!playerId || !teamId || !firstname || !lastname) throw new Error('Champs requis manquants')

  if (role === 'coach' && !(scope.editableTeamIds ?? []).includes(teamId)) {
    throw new Error('Vous ne pouvez modifier qu’un joueur de vos équipes.')
  }

  const { error } = await supabase
    .from('players')
    .update({
      firstname,
      lastname,
      gender,
      mobile_phone,
      email,
      legal_guardian_name,
      team_id: teamId,
    })
    .eq('id', playerId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/effectif')
  revalidatePath('/dashboard/joueurs')
}

export async function requestMovePlayer(formData: FormData) {
  const { supabase, role } = await getAuthContext()
  const scope = await getDashboardScope()

  const playerId = String(formData.get('playerId') ?? '').trim()
  const fromTeamId = String(formData.get('fromTeamId') ?? '').trim()
  const toTeamId = String(formData.get('toTeamId') ?? '').trim()

  if (!playerId || !fromTeamId || !toTeamId) throw new Error('Champs requis manquants')

  if (role === 'coach' && !(scope.editableTeamIds ?? []).includes(fromTeamId)) {
    throw new Error('Déplacement autorisé uniquement depuis vos équipes.')
  }

  const { error } = await supabase.from('players').update({ team_id: toTeamId }).eq('id', playerId)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/effectif')
  revalidatePath('/dashboard/joueurs')
}

export async function requestDeletePlayer(formData: FormData) {
  const { supabase, role } = await getAuthContext()
  const scope = await getDashboardScope()

  const playerId = String(formData.get('playerId') ?? '').trim()
  const teamId = String(formData.get('teamId') ?? '').trim()

  if (!playerId || !teamId) throw new Error('Champs requis manquants')

  if (role === 'coach' && !(scope.editableTeamIds ?? []).includes(teamId)) {
    throw new Error('Suppression autorisée uniquement sur vos équipes.')
  }

  const { error } = await supabase.from('players').delete().eq('id', playerId)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/effectif')
  revalidatePath('/dashboard/joueurs')
}
