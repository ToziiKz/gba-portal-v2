import type { DashboardRole } from '@/lib/dashboardRole'

export type NavItem = {
  label: string
  href: string
  status: 'ready' | 'coming'
  note?: string
  minRole?: DashboardRole
  children?: NavItem[]
}

export const roleLabels: Record<DashboardRole, string> = {
  coach: 'Coach',
  resp_pole: 'Resp. Pôle',
  resp_equipements: 'Resp. Équipements',
  resp_sportif: 'Resp. Sportif',
  admin: 'Admin',
}

export const roleOrder: Record<DashboardRole, number> = {
  coach: 1,
  resp_pole: 2,
  resp_equipements: 2,
  resp_sportif: 3,
  admin: 4,
}

export const navItems: NavItem[] = [
  { label: 'Vue d’ensemble', href: '/dashboard', status: 'ready', minRole: 'coach' },
  {
    label: 'Compositions',
    href: '/dashboard/tactique',
    status: 'ready',
    note: 'terrain & export image',
    minRole: 'coach',
  },
  {
    label: 'Rapports',
    href: '/dashboard/rapports',
    status: 'ready',
    note: 'KPIs + alertes',
    minRole: 'coach', // Was viewer, now minimal role is coach
  },
  {
    label: 'Relances',
    href: '/dashboard/relances',
    status: 'ready',
    note: 'backlog actionnable',
    minRole: 'resp_sportif', // Ex-staff
  },
  { label: 'Équipes', href: '/dashboard/equipes', status: 'ready', minRole: 'coach' },
  {
    label: 'Effectif',
    href: '/dashboard/effectif',
    status: 'ready',
    note: 'équipes + joueurs',
    minRole: 'coach',
  },
  { label: 'Joueurs', href: '/dashboard/joueurs', status: 'ready', minRole: 'coach' },
  {
    label: 'Planning hebdomadaire',
    href: '/dashboard/planning',
    status: 'ready',
    minRole: 'coach',
  },
  {
    label: 'Présences',
    href: '/dashboard/presences',
    status: 'ready',
    note: 'par séance',
    minRole: 'coach',
  },
  {
    label: 'Équipements',
    href: '/dashboard/equipements',
    status: 'ready',
    minRole: 'resp_equipements', // Ex-staff
  },
  {
    label: 'Stock & matériel',
    href: '/dashboard/stock',
    status: 'ready',
    note: 'inventaire',
    minRole: 'resp_equipements', // Ex-staff
  },
  {
    label: 'Annuaire Staff',
    href: '/dashboard/staff',
    status: 'ready',
    note: 'contacts & dispo',
    minRole: 'admin',
  },
  {
    label: 'Accès & Rôles',
    href: '/dashboard/acces',
    status: 'ready',
    note: 'invitations',
    minRole: 'admin',
  },
]

// Specific restricted views for Coach (whitelist approach if needed, else role based)
// Since we removed 'viewer', coach is the base.
// We can rely on minRole mostly now.

export function canAccess(role: DashboardRole, item: NavItem) {
  const min = item.minRole ?? 'coach'
  return roleOrder[role] >= roleOrder[min]
}

export function getVisibleNavItems(role: DashboardRole) {
  return navItems
    .filter((item) => item.status === 'ready' && canAccess(role, item))
    .map((item) => ({
      ...item,
      children: (item.children ?? []).filter(
        (child) => child.status === 'ready' && canAccess(role, child)
      ),
    }))
}

export function flattenVisibleNavItems(role: DashboardRole) {
  const visible = getVisibleNavItems(role)
  const out: NavItem[] = []

  for (const item of visible) {
    out.push(item)
    for (const child of item.children ?? []) out.push(child)
  }

  return out
}

export function normalizePath(pathname: string | null) {
  if (!pathname) return '/'
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1)
  return pathname
}

export function isActivePath(current: string, href: string) {
  const cur = normalizePath(current)
  const target = normalizePath(href)
  return cur === target
}

export function getNavLabelForPath(pathname: string | null) {
  const cur = normalizePath(pathname)

  for (const item of navItems) {
    if (normalizePath(item.href) === cur) return item.label
    for (const child of item.children ?? []) {
      if (normalizePath(child.href) === cur) return child.label
    }
  }

  return 'Dashboard'
}
