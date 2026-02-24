'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/dashboard/authz'
import { createClient } from '@/lib/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>
type Payload = Record<string, unknown>

const handlers: Record<
  string,
  (sb: SupabaseClient, p: Payload) => Promise<{ error: { message: string; code?: string } | null }>
> = {
  'teams.create': async (sb, p) => {
    return sb.from('teams').insert([
      {
        name: p.name as string,
        category: p.category as string,
        gender: p.gender as string,
        coach_id: (p.coach_id as string) ?? null,
      },
    ])
  },
  'players.create': async (sb, p) => {
    return sb.from('players').insert([
      {
        firstname: (p.firstname as string) ?? (p.first_name as string),
        lastname: (p.lastname as string) ?? (p.last_name as string),
        team_id: p.team_id as string,
        gender: (p.gender as string) ?? null,
        category: (p.category as string) ?? null,
        club_name: (p.club_name as string) ?? null,
        license_number: (p.license_number as string) ?? null,
        mobile_phone: (p.mobile_phone as string) ?? null,
        email: (p.email as string) ?? null,
        legal_guardian_name: (p.legal_guardian_name as string) ?? null,
        address_street: (p.address_street as string) ?? null,
        address_zipcode: (p.address_zipcode as string) ?? null,
        address_city: (p.address_city as string) ?? null,
        licence_status: (p.licence_status as string) ?? 'missing',
        payment_status: (p.payment_status as string) ?? 'unpaid',
        equipment_status: (p.equipment_status as string) ?? 'pending',
      },
    ])
  },
  'players.update': async (sb, p) => {
    const { id, ...updateData } = {
      id: p.id as string,
      team_id: p.team_id as string,
      firstname: p.firstname as string,
      lastname: p.lastname as string,
      gender: (p.gender as string) ?? null,
      mobile_phone: (p.mobile_phone as string) ?? null,
      email: (p.email as string) ?? null,
      legal_guardian_name: (p.legal_guardian_name as string) ?? null,
    }
    return sb.from('players').update(updateData).eq('id', id)
  },
  'players.move': async (sb, p) => {
    return sb
      .from('players')
      .update({ team_id: p.team_id as string })
      .eq('id', p.id as string)
  },
  'players.delete': async (sb, p) => {
    return sb
      .from('players')
      .delete()
      .eq('id', p.id as string)
  },
  'planning_sessions.create': async (sb, p) => {
    const insertPayload = {
      team_id: p.team_id as string,
      day: p.day as string,
      session_date: (p.session_date as string) ?? null,
      pole: p.pole as string,
      start_time: p.start_time as string,
      end_time: p.end_time as string,
      location: p.location as string,
      staff: (p.staff as string[]) ?? [],
      note: (p.note as string) ?? null,
    }

    let { error } = await sb.from('planning_sessions').insert([insertPayload])

    // Backward compatibility if session_date column not yet deployed
    if (error && (error.message?.includes('session_date') || error.code === 'PGRST204')) {
      const legacyInsertPayload = Object.fromEntries(
        Object.entries(insertPayload).filter(([key]) => key !== 'session_date')
      )
      const retry = await sb.from('planning_sessions').insert([legacyInsertPayload])
      error = retry.error
    }
    return { error }
  },
  'planning_sessions.delete': async (sb, p) => {
    return sb
      .from('planning_sessions')
      .delete()
      .eq('id', p.id as string)
  },
}

export async function approveRequest(formData: FormData): Promise<void> {
  const { supabase } = await requireRole('admin')
  const id = formData.get('id')
  if (typeof id !== 'string' || !id) throw new Error('ID manquant')

  const { data: req, error } = await supabase
    .from('approval_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !req) throw new Error('Demande introuvable')
  if (req.status !== 'pending') throw new Error('Demande déjà traitée')

  const action = req.action as string
  const payload = req.payload as unknown as Payload

  const handler = handlers[action]
  if (!handler) throw new Error(`Action inconnue: ${action}`)

  const { error: applyError } = await handler(supabase, payload)

  if (applyError) {
    throw new Error('Erreur application: ' + (applyError.message ?? ''))
  }

  // Mark approved
  const { error: updErr } = await supabase
    .from('approval_requests')
    .update({ status: 'approved', decided_at: new Date().toISOString() })
    .eq('id', id)

  if (updErr) throw new Error('Appliqué mais erreur statut')

  revalidatePath('/dashboard/validations')
  revalidatePath('/dashboard/equipes')
  revalidatePath('/dashboard/joueurs')
  revalidatePath('/dashboard/planning')
}

export async function rejectRequest(formData: FormData): Promise<void> {
  const { supabase } = await requireRole('admin')
  const id = formData.get('id')
  if (typeof id !== 'string' || !id) throw new Error('ID manquant')

  const { error } = await supabase
    .from('approval_requests')
    .update({ status: 'rejected', decided_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error('Erreur rejet')

  revalidatePath('/dashboard/validations')
}
