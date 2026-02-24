'use client'

import * as React from 'react'

import Link from 'next/link'

import { Button } from '@/components/ui/Button'

type QuickLink = {
  label: string
  href: string
  kicker?: string
}

const quickLinks: QuickLink[] = [
  { label: 'Voir les alertes', href: '/dashboard/rapports', kicker: 'KPI / risques' },
  { label: 'Encaissements licences', href: '/dashboard/licences', kicker: 'paiements' },
  { label: 'Remises équipements', href: '/dashboard/equipements', kicker: 'dotations' },
  { label: 'Préparer la semaine', href: '/dashboard/planning', kicker: 'planning' },
]

export function DashboardHero() {
  const [now, setNow] = React.useState<Date | null>(null)

  React.useEffect(() => {
    setNow(new Date())
  }, [])

  const label = now
    ? new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      }).format(now)
    : null

  return (
    <section aria-label="Hero dashboard" className="relative overflow-hidden rounded-[32px]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(900px_380px_at_12%_10%,rgba(7,10,17,0.08),transparent_55%),radial-gradient(820px_360px_at_86%_18%,rgba(7,10,17,0.06),transparent_58%),linear-gradient(to_bottom,rgba(7,10,17,0.02),rgba(255,255,255,0.05))]"
      />
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.14] hero-grain" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_70%,transparent_20%,rgba(255,255,255,0.05)_70%,rgba(255,255,255,0.08)_100%)]"
      />

      <div className="relative border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-6 shadow-[var(--ui-shadow-md)] md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.52em] text-[color:var(--ui-muted-2)]">
              Cockpit staff{label ? ` • ${label}` : ''}
            </p>
            <h2 className="mt-4 font-[var(--font-teko)] text-4xl font-black tracking-[0.06em] text-[color:var(--ui-fg)] md:text-5xl">
              Une vue claire.
              <span className="block text-[color:var(--ui-muted)]">Des actions immédiates.</span>
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--ui-muted)]">
              Tout est pensé pour aller vite : repérer l’essentiel, décider, exécuter.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/planning">
              <Button className="btn-premium" size="md">
                Voir le planning
              </Button>
            </Link>
            <Link href="/dashboard/tactique">
              <Button variant="secondary" size="md">
                Compo / Tactique
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-3xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-4 transition hover:-translate-y-[1px] hover:bg-[color:var(--ui-surface-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-ring)]"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.45em] text-[color:var(--ui-muted-2)]">
                {link.kicker ?? 'raccourci'}
              </p>
              <p className="mt-3 truncate font-semibold text-[color:var(--ui-fg)]">{link.label}</p>
              <p className="mt-1 text-xs text-[color:var(--ui-muted)]">
                Accès direct → pas de détour.
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
