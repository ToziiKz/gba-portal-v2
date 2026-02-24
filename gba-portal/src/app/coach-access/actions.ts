'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function submitCoachAccessRequest(_prevState: unknown, formData: FormData) {
  const fullName = String(formData.get('fullName') ?? '').trim()
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const phone = String(formData.get('phone') ?? '').trim()
  const requestedPole = String(formData.get('requestedPole') ?? '').trim()
  const requestedTeam = String(formData.get('requestedTeam') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (!fullName || !email) {
    return { ok: false as const, error: 'Nom et email sont obligatoires.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('coach_access_requests').insert([
    {
      full_name: fullName,
      email,
      phone: phone || null,
      requested_pole: requestedPole || null,
      requested_team: requestedTeam || null,
      message: message || null,
      status: 'pending',
    },
  ])

  if (error) {
    return { ok: false as const, error: 'Impossible d’envoyer la demande pour le moment.' }
  }

  revalidatePath('/coach-access')
  return { ok: true as const }
}
