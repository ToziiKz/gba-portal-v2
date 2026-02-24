import { createClient } from '@/lib/supabase/server'
import type { DashboardRole } from '@/lib/dashboardRole'

// Keep order in sync with dashboardRole.ts if possible, or define locally for server auth logic
const roleOrder: Record<DashboardRole, number> = {
  coach: 1,
  resp_pole: 2,
  resp_equipements: 2, // Same level roughly as pole resp
  resp_sportif: 3,
  admin: 4,
}

const VALID_ROLES = new Set(['admin', 'resp_sportif', 'resp_pole', 'resp_equipements', 'coach'])

export async function requireRole(minRole: DashboardRole) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (profile?.is_active === false) throw new Error('Compte suspendu')

  const rawRole = String(profile?.role ?? '').trim()

  // Strict validation: must be one of the known roles
  if (!VALID_ROLES.has(rawRole)) {
    throw new Error('Aucun rôle dashboard valide (contactez un admin)')
  }

  const role = rawRole as DashboardRole

  if (roleOrder[role] < roleOrder[minRole]) {
    throw new Error('Accès insuffisant pour ce rôle')
  }

  return { supabase, user, role }
}
