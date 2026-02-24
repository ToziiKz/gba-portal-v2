import { CONTACT_EMAIL, SPONSORS_LIST } from '@/lib/site-content'
import type { Metadata } from 'next'
import Image from 'next/image'

const stats = [
  { label: 'Licenciés', value: '350+', sub: 'École de foot → Seniors' },
  { label: 'Équipes', value: '20+', sub: 'Féminines & Masculines' },
  { label: 'Matchs / an', value: '450+', sub: 'Une visibilité constante' },
  { label: 'Territoire', value: '2 Vallées', sub: 'Bruche & Ackerland' },
]

const tiers = [
  {
    name: 'Partenaire Club',
    price: 'Dès 300€',
    tagline: 'Soutenez la formation locale',
    perks: ['Logo sur le site officiel', 'Accès aux événements club', 'Attestation de mécénat'],
    color: 'border-white/10',
  },
  {
    name: 'Partenaire Officiel',
    price: 'Dès 800€',
    tagline: 'Une visibilité terrain & digitale',
    perks: ['Logo sur équipements', 'Relais réseaux sociaux', 'Panneau stade (option)'],
    featured: true,
    color: 'border-cyan-500/30',
  },
  {
    name: 'Partenaire Majeur',
    price: 'Sur Mesure',
    tagline: 'Le GBA au cœur de votre marque',
    perks: ['Naming / Sponsoring maillot', 'Contenus vidéo dédiés', 'Reporting annuel'],
    color: 'border-amber-500/30',
  },
]

export const metadata: Metadata = {
  title: 'Sponsors — ESPACE GBA',
  description: 'Devenez partenaire du Groupement Bruche Ackerland et soutenez le football local.',
}

export default function SponsorsPage() {
  return (
    <div className="min-h-screen bg-[#03040a] text-white overflow-hidden">
      {/* Cinematic Hero */}
      <section className="relative pt-40 pb-32 px-6">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-cyan-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 h-[600px] w-[600px] bg-amber-500/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.5em] text-cyan-400 mb-6">
            Partenariats 2026
          </p>
          <h1 className="font-[family-name:var(--font-teko)] text-7xl font-black uppercase leading-[0.85] tracking-tight sm:text-9xl">
            Plus qu&apos;un logo. <br />
            <span className="text-white/20">Une ambition.</span>
          </h1>
          <div className="mt-12 flex flex-col md:flex-row gap-12 items-start">
            <p className="max-w-xl text-xl text-white/60 leading-relaxed">
              Associez votre entreprise à un projet qui forme les citoyens de demain. Le GBA offre
              une visibilité unique au cœur de la Bruche et de l&apos;Ackerland.
            </p>
            <div className="flex gap-4">
              <a
                href="#contact"
                className="rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition-transform hover:scale-105"
              >
                Nous rejoindre
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Grid Layout */}
      <section className="relative z-10 py-24 border-y border-white/5 bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <div className="font-[family-name:var(--font-teko)] text-6xl font-black text-white">
                  {stat.value}
                </div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mt-2">
                  {stat.label}
                </div>
                <div className="text-[10px] text-white/20 mt-1 uppercase">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers Section - Card Design */}
      <section className="relative z-10 py-32 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="font-[family-name:var(--font-teko)] text-5xl font-bold uppercase tracking-wide">
              Choisissez votre impact
            </h2>
            <div className="h-1 w-20 bg-cyan-500 mx-auto mt-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`group relative flex flex-col rounded-3xl border ${tier.color} bg-white/[0.02] p-10 transition-all hover:bg-white/[0.04]`}
              >
                {tier.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-black">
                    Recommandé
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="font-[family-name:var(--font-teko)] text-3xl font-bold uppercase tracking-wide">
                    {tier.name}
                  </h3>
                  <p className="text-white/40 text-sm mt-2">{tier.tagline}</p>
                </div>
                <div className="font-[family-name:var(--font-teko)] text-5xl font-black mb-8">
                  {tier.price}
                </div>
                <ul className="space-y-4 mb-12 flex-1">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-3 text-sm text-white/60">
                      <span className="h-1 w-1 rounded-full bg-cyan-400" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-4 text-center text-xs font-bold uppercase tracking-widest transition-all group-hover:bg-white group-hover:text-black"
                >
                  En savoir plus
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Partners - Wall of Fame */}
      <section className="relative z-10 py-32 px-6 bg-white/[0.01]">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-[family-name:var(--font-teko)] text-4xl font-bold uppercase tracking-wide mb-16 text-center md:text-left">
            Ils nous font confiance
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {SPONSORS_LIST.map((partner) => (
              <div
                key={partner.name}
                className="group relative aspect-square flex items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] p-6 grayscale transition-all hover:grayscale-0 hover:border-white/20"
              >
                {'logoUrl' in partner && partner.logoUrl ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={partner.logoUrl as string}
                      alt={partner.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <span className="font-[family-name:var(--font-teko)] text-xl font-bold text-white/20 group-hover:text-white transition-colors">
                    {partner.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="relative z-10 py-40 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-cyan-600/10 pointer-events-none" />
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-[family-name:var(--font-teko)] text-6xl font-black uppercase tracking-tight mb-8">
            Construisons le futur <br className="hidden md:block" /> du football local.
          </h2>
          <p className="text-xl text-white/50 mb-12">
            Prenons rendez-vous pour discuter de votre visibilité et de votre impact au sein du GBA.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Partenariat GBA`}
            className="inline-block rounded-full bg-white px-12 py-5 text-sm font-black uppercase tracking-[0.2em] text-black shadow-[0_20px_60px_rgba(255,255,255,0.2)] transition-transform hover:scale-105"
          >
            Contacter le club
          </a>
        </div>
      </section>
    </div>
  )
}
