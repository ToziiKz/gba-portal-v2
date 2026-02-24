import type { ReactNode } from 'react'
import Link from 'next/link'

type TrustPageShellProps = {
  eyebrow?: string
  title: string
  lead: string
  children: ReactNode
  cta?: ReactNode
  showTopNav?: boolean
}

export function TrustPageShell({
  eyebrow = 'Infos',
  title,
  lead,
  children,
  cta,
  showTopNav = true,
}: TrustPageShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020202] via-[#050505] to-[#000000]">
      <header className="px-6 pt-20 pb-12 sm:pt-28">
        <div className="mx-auto max-w-4xl">
          {showTopNav ? (
            <nav aria-label="Navigation" className="mb-8 flex flex-wrap gap-2">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/shop', label: 'Boutique' },
                { href: '/sponsors', label: 'Sponsors' },
                { href: '/contact', label: 'Contact' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white/75 transition hover:border-white/35 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}

          {eyebrow ? (
            <p className="text-xs uppercase tracking-widest text-white/60">{eyebrow}</p>
          ) : null}
          <h1 className="mt-4 font-[var(--font-teko)] text-5xl font-black tracking-[0.06em] text-white sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/70">{lead}</p>
          {cta ? <div className="mt-8">{cta}</div> : null}
        </div>
      </header>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl space-y-10 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur sm:p-10">
          {children}
        </div>
      </section>
    </div>
  )
}
