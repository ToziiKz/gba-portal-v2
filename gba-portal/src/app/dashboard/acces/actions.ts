'use server'

import { createHash, randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/dashboard/authz'
import { log } from '@/lib/logger'

async function requireAdmin() {
  const { supabase, user } = await requireRole('admin')
  return { supabase, user }
}

function buildInviteUrl(invitationId: string, token: string) {
  const configuredBase = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (process.env.NODE_ENV === 'production' && !configuredBase) {
    throw new Error(
      'NEXT_PUBLIC_APP_URL est requis en production pour générer les liens d’invitation.'
    )
  }

  const base = configuredBase || 'http://localhost:3000'
  return `${base}/activate?inv=${invitationId}&token=${token}`
}

async function logAccessEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  meta?: Record<string, unknown>
) {
  await supabase.from('access_admin_events').insert([
    {
      actor_id: actorId,
      action,
      target_type: targetType,
      target_id: targetId,
      meta: meta ?? {},
    },
  ])
}

// Invitation-only workflow (coach_access_requests disabled)
export async function createDirectInvitation(formData: FormData) {
  const { supabase, user } = await requireAdmin()

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const fullName = String(formData.get('fullName') ?? '').trim()
  const role = String(formData.get('role') ?? 'coach')
  const targetTeamIds = formData
    .getAll('targetTeamIds')
    .map((id) => String(id))
    .filter(Boolean)

  if (!email || !fullName) {
    throw new Error('Email et Nom complet sont obligatoires.')
  }

  const token = randomBytes(24).toString('hex')
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

  const { data: inv, error: invErr } = await supabase
    .from('coach_invitations')
    .insert([
      {
        email,
        full_name: fullName,
        role,
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_by: user.id,
        target_team_ids: targetTeamIds,
      },
    ])
    .select('id')
    .single()

  if (invErr || !inv) {
    log.error('Insert error:', invErr)
    throw new Error('Impossible de créer l’invitation.')
  }

  await logAccessEvent(supabase, user.id, 'invitation.create_direct', 'coach_invitation', inv.id, {
    email,
    role,
  })

  revalidatePath('/dashboard/acces')

  const inviteUrl = buildInviteUrl(inv.id, token)
  redirect(`/dashboard/acces?invite=${encodeURIComponent(inviteUrl)}`)
}

export async function regenerateCoachInvitation(formData: FormData) {
  const { supabase, user } = await requireAdmin()

  const invitationId = String(formData.get('invitationId') ?? '')
  if (!invitationId) throw new Error('invitationId manquant')

  const { data: inv, error: invErr } = await supabase
    .from('coach_invitations')
    .select('id')
    .eq('id', invitationId)
    .single()

  if (invErr || !inv) throw new Error('Invitation introuvable')

  const token = randomBytes(24).toString('hex')
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

  const { error: updErr } = await supabase
    .from('coach_invitations')
    .update({ token_hash: tokenHash, expires_at: expiresAt, used_at: null, used_by: null })
    .eq('id', inv.id)

  if (updErr) throw new Error('Impossible de régénérer l’invitation')

  await logAccessEvent(supabase, user.id, 'invitation.regenerate', 'coach_invitation', inv.id)

  revalidatePath('/dashboard/acces')

  const inviteUrl = buildInviteUrl(inv.id, token)
  redirect(`/dashboard/acces?invite=${encodeURIComponent(inviteUrl)}`)
}

export async function setCoachActiveState(formData: FormData) {
  const { supabase, user } = await requireAdmin()

  const coachId = String(formData.get('coachId') ?? '')
  const active = String(formData.get('active') ?? '') === '1'

  if (!coachId) throw new Error('coachId manquant')

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: active })
    .eq('id', coachId)
    .eq('role', 'coach')

  if (error) throw new Error('Impossible de changer l’état du coach')

  await logAccessEvent(
    supabase,
    user.id,
    active ? 'coach.activate' : 'coach.suspend',
    'profile',
    coachId
  )
  revalidatePath('/dashboard/acces')
}

export async function setCoachTeams(formData: FormData) {
  const { supabase, user } = await requireAdmin()

  const coachId = String(formData.get('coachId') ?? '')
  const teamIds = formData
    .getAll('teamIds')
    .map((v) => String(v))
    .filter(Boolean)

  if (!coachId) throw new Error('coachId manquant')

  const { error: rpcErr } = await supabase.rpc('admin_update_profile_and_teams', {
    p_user_id: coachId,
    p_role: 'coach',
    p_is_active: true,
    p_team_ids: teamIds,
  })

  if (rpcErr) {
    throw new Error('Impossible d’affecter les équipes coach: ' + rpcErr.message)
  }

  await logAccessEvent(supabase, user.id, 'coach.assign_teams', 'profile', coachId, {
    teamIds,
    count: teamIds.length,
  })

  revalidatePath('/dashboard/acces')
}
