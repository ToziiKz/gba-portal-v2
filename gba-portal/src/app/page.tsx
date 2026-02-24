import { FormationTimeline } from '@/components/FormationTimeline'
import { HeroShowcase } from '@/components/HeroShowcase'
import { ManifestoPanel } from '@/components/ManifestoPanel'
// (StatsTicker removed)
import { ProductCard } from '@/components/shop/ProductCard'
import { featuredProducts } from '@/lib/shop-data'
import { CONTACT_EMAIL, KEY_STATS, SPONSORS_LIST } from '@/lib/site-content'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "ESPACE GBA — Plus qu'un club, une famille",
  description:
    "Découvrez le Groupement Bruche Ackerland : une aventure humaine, sportive et locale. Formation, passion et excellence au cœur de l'Alsace.",
  alternates: { canonical: '/' },
  openGraph: {
    title: "ESPACE GBA — Plus qu'un club, une famille",
    description:
      "Rejoignez l'aventure GBA. Une histoire de passion, de formation et de victoires partagées.",
    url: '/',
    images: [
      {
        url: '/gba-logo.png',
        width: 1200,
        height: 630,
        alt: 'ESPACE GBA — Groupement Bruche Ackerland',
      },
    ],
  },
}

const pillars = [
  {
    title: 'Notre Histoire',
    text: 'Né de la fusion de deux villages passionnés, le GBA s’est imposé comme une référence régionale. Un projet collectif, structuré et ambitieux, qui grandit saison après saison.',
  },
  {
    title: "L'Esprit GBA",
    text: 'Bienveillance. Exigence. Dépassement. Un maillot, une responsabilité. Une équipe, une direction : se dépasser, rester humble, et construire quelque chose qui dure.',
  },
  {
    title: 'Notre Force',
    text: 'Un territoire rassemblé, une exigence partagée. Éducateurs, bénévoles, familles, supporters : le GBA avance uni — et grandit, match après match.',
  },
]

const formationSteps = [
  { label: "L'École de Foot", sub: 'Babyfoot à U9 — Découverte & Sourires' },
  { label: 'La Pré‑formation', sub: 'U11 à U13 — Bases & Technique' },
  { label: 'La Formation', sub: 'U15 à U18 — Compétition & Rigueur' },
  { label: 'Les Séniors', sub: 'Équipe Fanion — Ambition & Exemplarité' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#03040a] text-white">
      <HeroShowcase />

      <section
        id="proof"
        className="relative overflow-hidden border-t border-white/5 px-5 py-32 sm:px-6"
        aria-labelledby="proof-title"
      >
        {/* Cinematic background (premium + inspiring) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#03040a]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(0,161,255,0.18),transparent_45%),radial-gradient(circle_at_82%_18%,rgba(212,175,55,0.18),transparent_46%),radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.06),transparent_55%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#03040a] via-black/35 to-[#03040a]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-soft-light"
          style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#03040a] to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#03040a] to-transparent"
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <div className="flex-1 min-w-0">
              <h2
                id="proof-title"
                className="font-[family-name:var(--font-teko)] text-4xl font-black uppercase tracking-[0.06em] sm:text-6xl whitespace-nowrap"
              >
                La puissance d&apos;un groupement.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base whitespace-nowrap overflow-hidden text-ellipsis">
                Des racines locales. Une ambition qui dépasse les lignes.
              </p>
            </div>
            <Link
              href="/contact"
              className="mx-auto mt-3 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-7 py-2.5 text-sm font-black uppercase tracking-[0.18em] text-white backdrop-blur-sm transition hover:border-white/35 hover:bg-white/[0.06] md:mx-0 md:mt-0 md:translate-y-4"
            >
              Rejoindre le mouvement
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {KEY_STATS.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-white/55">
                  {stat.label}
                </p>
                <p className="mt-3 font-[family-name:var(--font-teko)] text-5xl font-black uppercase leading-none tracking-wide text-white">
                  {stat.value}
                </p>
                <p className="mt-3 text-sm text-white/60">{stat.sub}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Parents & joueurs',
                text: 'Découvrir les équipes, la méthode et le cadre de progression.',
                href: '/about',
                cta: 'Découvrir le club',
              },
              {
                title: 'Partenaires',
                text: 'Associer votre image à un projet sportif local et durable.',
                href: '/sponsors',
                cta: 'Voir les partenaires',
              },
              {
                title: 'Supporters',
                text: 'Porter les couleurs du club au quotidien.',
                href: '/shop',
                cta: 'Aller à la boutique',
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
              >
                <h3 className="font-[family-name:var(--font-teko)] text-xl font-bold tracking-wide">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-white/60">{item.text}</p>
                <Link
                  href={item.href}
                  className="mt-4 inline-block text-sm font-bold underline decoration-white/25 hover:decoration-white/70"
                >
                  {item.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="manifesto"
        className="relative overflow-hidden px-5 py-32 sm:px-6"
        aria-labelledby="manifesto-title"
      >
        {/* Background photo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: "url('/manifesto-bg.png')" }}
        />

        {/* Premium overlays for readability */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/45" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(212,175,55,0.18),transparent_55%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#03040a] via-black/40 to-[#03040a]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-12 mix-blend-soft-light"
          style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#03040a] to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#03040a] to-transparent"
        />

        <div className="relative mx-auto max-w-6xl text-center">
          <p className="text-xs uppercase tracking-[0.36em] text-white/45">Notre manifeste</p>
          <h2
            id="manifesto-title"
            className="mt-4 font-[family-name:var(--font-teko)] text-5xl font-black uppercase tracking-[0.04em] text-white sm:text-6xl"
          >
            L&apos;ambition d&apos;un territoire.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-white/65 sm:text-base">
            D’ici, on vise haut. Parce que l’ambition d’un territoire, c’est de faire naître
            l’excellence — dans le jeu, et dans la vie. Un cadre exigeant, une famille soudée, et
            une même direction : progresser, se dépasser, et construire quelque chose qui dure.
          </p>

          <ManifestoPanel items={pillars} />
        </div>
      </section>

      <section
        id="formation"
        className="relative overflow-hidden bg-white/[0.02] px-5 py-32 sm:px-6"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#03040a] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#03040a] to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
        <div className="relative mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/55">Formation</p>
            <h2 className="mt-3 font-[family-name:var(--font-teko)] text-4xl font-bold uppercase tracking-wide sm:text-5xl">
              La Formation GBA
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60">
              Du premier ballon aux matchs décisifs, chaque joueur avance avec un cadre clair :
              apprendre, progresser, et respecter le jeu. Ici, on grandit ensemble — avec exigence,
              bienveillance, et l’ambition de viser plus haut.
            </p>
          </div>

          <div className="mt-12">
            <FormationTimeline steps={formationSteps} />
            <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-white/55">
              Dans toutes les catégories, nos équipes évoluent au plus haut niveau district.
            </p>
          </div>
        </div>
      </section>

      <section
        id="shop-preview"
        className="relative overflow-hidden border-t border-white/5 px-6 py-32"
      >
        {/* Locker room background (subtle + premium) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: "url('/shop-locker.avif')" }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/65" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#03040a] via-black/35 to-[#03040a]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-soft-light"
          style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#03040a] to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#03040a] to-transparent"
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-16 flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="text-center md:text-left">
              <h2 className="font-[family-name:var(--font-teko)] text-4xl font-bold uppercase tracking-wide">
                Boutique Officielle
              </h2>
              <p className="mt-2 text-white/50">
                Affichez vos couleurs sur et en dehors du terrain.
              </p>
            </div>
            <Link
              href="/shop"
              className="rounded-full border border-white/20 px-6 py-2 text-sm font-bold transition-all hover:bg-white hover:text-black"
            >
              Voir toute la boutique GBA
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.name} {...product} contactEmail={CONTACT_EMAIL} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="sponsors"
        className="relative overflow-hidden border-t border-white/5 px-6 py-32"
        aria-labelledby="sponsors-title"
      >
        {/* Cinematic background (inspiring + premium) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#03040a]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,161,255,0.18),transparent_48%),radial-gradient(circle_at_82%_22%,rgba(212,175,55,0.16),transparent_50%),radial-gradient(circle_at_50%_88%,rgba(255,255,255,0.06),transparent_55%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#03040a] via-black/35 to-[#03040a]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-soft-light"
          style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
        />

        {/* Soften transitions top/bottom */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#03040a] to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#03040a] to-transparent"
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-16 flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
            <div>
              <h2
                id="sponsors-title"
                className="font-[family-name:var(--font-teko)] text-4xl font-bold uppercase tracking-wide"
              >
                Nos Partenaires
              </h2>
              <p className="mt-2 text-white/55">
                Un territoire qui se rassemble. Des partenaires qui s’engagent.
                <br className="hidden md:block" />
                Une ambition qui ne lâche rien : faire grandir le club, saison après saison.
              </p>
            </div>
            <Link
              href="/sponsors"
              className="rounded-full border border-white/20 px-6 py-2 text-sm font-bold transition-all hover:bg-white hover:text-black"
            >
              Découvrir tous nos partenaires
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SPONSORS_LIST.map((s) => (
              <article
                key={s.name}
                className="group rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04]"
              >
                {/* role displayed inside card header for logo partners */}
                {'logoUrl' in s && s.logoUrl ? (
                  <div className="mb-4 flex items-center gap-4">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full bg-white p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.10)]">
                      <Image
                        src={s.logoUrl as string}
                        alt={`Logo ${s.name}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-[family-name:var(--font-teko)] text-xl font-bold tracking-wide text-white">
                        {s.name}
                      </h3>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/50">
                        {s.role}
                      </p>
                    </div>
                  </div>
                ) : (
                  <h3 className="font-[family-name:var(--font-teko)] text-xl font-bold tracking-wide text-white transition-colors group-hover:text-white">
                    {s.name}
                  </h3>
                )}
                <p className="mt-3 text-sm text-white/50">{s.impact}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="actu" className="relative overflow-hidden px-6 py-32">
        {/* Stadium background photo (subtle + premium) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('/actu-stadium-bg.jpg')" }}
        />

        {/* Overlays for readability + premium blend */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/60" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_25%,rgba(0,161,255,0.22),transparent_55%),radial-gradient(circle_at_78%_28%,rgba(212,175,55,0.16),transparent_58%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#03040a] via-black/35 to-[#03040a]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-soft-light"
          style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#03040a] to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#03040a] to-transparent"
        />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="mb-6 font-[family-name:var(--font-teko)] text-5xl font-bold uppercase tracking-wide md:text-6xl">
            Entrez dans l&apos;Histoire
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-white/70">
            Vibrez au bord du terrain, portez nos couleurs, partagez nos victoires. Le GBA
            n&apos;attend que vous.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link
              href="/shop"
              className="rounded-full bg-white px-10 py-4 text-sm font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-transform hover:scale-105"
            >
              Accéder à la Boutique
            </Link>
            <Link
              href="/news"
              className="rounded-full border border-white/20 px-10 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-white/10"
            >
              Lire les Actualités
            </Link>
          </div>
        </div>
      </section>

      <footer id="footer" className="border-t border-white/10 bg-black px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-12 text-sm text-white/60 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <div className="relative h-12 w-12">
                <Image src="/brand/logo.png" alt="Logo GBA" fill className="object-contain" />
              </div>
              <p className="font-[family-name:var(--font-teko)] text-3xl font-bold tracking-wide text-white">
                GBA.
              </p>
            </div>
            <p className="leading-relaxed text-white/50">
              L&apos;esprit d&apos;équipe, la passion du jeu, la force du collectif.
            </p>
          </div>
          <div>
            <p className="mb-6 text-xs font-bold uppercase tracking-widest text-white">Explorer</p>
            <ul className="space-y-4">
              <li>
                <Link href="/news" className="transition-colors hover:text-white">
                  Actualités
                </Link>
              </li>
              <li>
                <Link href="/shop" className="transition-colors hover:text-white">
                  Boutique
                </Link>
              </li>
              <li>
                <Link href="/sponsors" className="transition-colors hover:text-white">
                  Partenaires
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-6 text-xs font-bold uppercase tracking-widest text-white">Légal</p>
            <ul className="space-y-4">
              <li>
                <Link href="/privacy" className="transition-colors hover:text-white">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-white">
                  Conditions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-6 text-xs font-bold uppercase tracking-widest text-white">Contact</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mb-2 block transition-colors hover:text-[#00a1ff]"
            >
              {CONTACT_EMAIL}
            </a>
            <p className="mt-4 text-xs text-white/30">
              &copy; {new Date().getFullYear()} GBA. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
