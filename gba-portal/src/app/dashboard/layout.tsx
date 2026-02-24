import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { PermissionsProvider } from '@/components/PermissionsProvider'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { getDashboardScope } from '@/lib/dashboard/getDashboardScope'
import type { DashboardRole } from '@/lib/dashboardRole'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Espace staff GBA.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/dashboard',
  },
}

const VALID_ROLES = new Set([
  'admin',
  'resp_sportif',
  'resp_pole',
  'resp_equipements',
  'coach',
])

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('role, is_active, full_name, email, id')
    .eq('id', user.id)
    .single()

  // Hard rule: no profile => no dashboard access
  if (!profile) {
    redirect('/login?no_profile=1')
  }

  if (profile.is_active === false) {
    redirect('/login?disabled=1')
  }

  const rawRole = String(profile.role ?? '').trim()

  // Hard rule: unknown role cannot access dashboard
  if (!VALID_ROLES.has(rawRole)) {
    console.error('[dashboard-layout] Invalid role denied:', rawRole, 'User:', user.id)
    redirect('/login?role_invalid=1')
  }

  const role = rawRole as DashboardRole

  const userProfile = {
    ...profile,
    role,
  }

  const scopeRaw = await getDashboardScope()
  // Source of truth for role in dashboard shell = profile role resolved above.
  const scope = { ...scopeRaw, role }

  return (
    <DashboardShell userProfile={userProfile} scope={scope}>
      <div className="mx-auto w-full max-w-6xl">
        <section aria-label="Contenu du dashboard" className="min-w-0">
          <PermissionsProvider role={role}>{children}</PermissionsProvider>
        </section>
      </div>
    </DashboardShell>
  )
}
