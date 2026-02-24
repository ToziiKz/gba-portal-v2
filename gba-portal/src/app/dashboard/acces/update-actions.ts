'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/dashboard/authz'
import { log } from '@/lib/logger'

/**
 * Met à jour le profil complet d'un utilisateur (rôle, activité)
 * et ses équipes assignées.
 */
export async function updateUserProfile(formData: FormData) {
  const { supabase } = await requireRole('admin')

  const userId = String(formData.get('userId') ?? '')
  const role = String(formData.get('role') ?? 'coach')
  const isActive = formData.get('isActive') === 'on'
  const teamIds = formData
    .getAll('teamIds')
    .map((v) => String(v))
    .filter(Boolean)

  if (!userId) {
    redirect('/dashboard/acces?err=' + encodeURIComponent('userId manquant'))
  }

  // Preferred path: atomic RPC (if deployed in DB)
  const { error: rpcErr } = await supabase.rpc('admin_update_profile_and_teams', {
    p_user_id: userId,
    p_role: role,
    p_is_active: isActive,
    p_team_ids: role === 'coach' ? teamIds : [],
  })

  if (rpcErr) {
    // Fallback for environments where RPC migration is not yet applied
    if (rpcErr.code === 'PGRST202') {
      const { error: profErr } = await supabase
        .from('profiles')
        .update({ role, is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (profErr) {
        log.error('Profile fallback update failed:', profErr)
        redirect('/dashboard/acces?err=' + encodeURIComponent(profErr.message))
      }

      // clear coach assignments first
      const { error: clearErr } = await supabase
        .from('teams')
        .update({ coach_id: null })
        .eq('coach_id', userId)
      if (clearErr) {
        log.error('Fallback clear coach teams failed:', clearErr)
        redirect('/dashboard/acces?err=' + encodeURIComponent(clearErr.message))
      }

      // re-assign only for coach role
      if (role === 'coach' && teamIds.length > 0) {
        const { error: assignErr } = await supabase
          .from('teams')
          .update({ coach_id: userId })
          .in('id', teamIds)
        if (assignErr) {
          log.error('Fallback assign coach teams failed:', assignErr)
          redirect('/dashboard/acces?err=' + encodeURIComponent(assignErr.message))
        }
      }
    } else {
      log.error('Atomic profile/team update failed:', rpcErr)
      redirect('/dashboard/acces?err=' + encodeURIComponent(rpcErr.message))
    }
  }

  revalidatePath('/dashboard/acces')
  redirect('/dashboard/acces?ok=1')
}

/**
 * Supprime définitivement un profil utilisateur et ses liaisons.
 */
export async function deleteUserProfile(formData: FormData) {
  const { supabase } = await requireRole('admin')
  const userId = String(formData.get('userId') ?? '')

  if (!userId) throw new Error('userId manquant')

  try {
    // 1. Détacher des équipes (coach_id)
    await supabase.from('teams').update({ coach_id: null }).eq('coach_id', userId)

    // 2. Supprimer les invitations liées (évite les conflits d'emails futurs)
    await supabase.from('coach_invitations').delete().eq('used_by', userId)

    // 3. Détacher des planning_sessions (si créé par ou staffé)
    await supabase.from('planning_sessions').update({ created_by: null }).eq('created_by', userId)

    // 4. Supprimer le profil staff étendu (si existant)
    await supabase.from('staff_profiles').delete().eq('user_id', userId)

    // 6. Tenter la suppression finale du profil public
    const { error } = await supabase.from('profiles').delete().eq('id', userId)

    if (error) throw error

    revalidatePath('/dashboard/acces')
    return
  } catch (err: unknown) {
    log.error('Delete error:', err)

    // Si échec (FK persistante), on passe en mode "Archivage" pour libérer l'email
    const { error: archiveErr } = await supabase
      .from('profiles')
      .update({
        is_active: false,
        role: 'viewer',
        email: `deleted_${Date.now()}_${userId.slice(0, 4)}@gba.internal`, // Libère l'email réel
        full_name: 'Compte Supprimé',
      })
      .eq('id', userId)

    if (archiveErr) throw new Error('Erreur archivage: ' + archiveErr.message)

    revalidatePath('/dashboard/acces')
    return
  }
}
