import type { Metadata } from 'next'
import Link from 'next/link'

import { TrustPageShell } from '@/components/TrustPageShell'

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'ESPACE GBA : site officiel premium du Groupement Bruche Ackerland — histoire, formation, communauté, actus et partenaires.',
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  return (
    <TrustPageShell
      eyebrow="ESPACE GBA"
      title="À propos"
      lead="ESPACE GBA est le site officiel premium du Groupement Bruche Ackerland : une vitrine cinématique qui raconte le club, valorise la formation, et crée un lien simple avec la communauté et les partenaires. Notre obsession : une expérience rapide, accessible, et assez belle pour donner envie de s’engager — avec une confiance explicite (confidentialité, conditions, accessibilité)."
    >
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Notre promesse</h2>
        <p className="text-sm leading-relaxed text-white/70">
          Mettre en scène l’histoire et la formation avec une narration digne d’une campagne, tout
          en restant concret : infos clés, actus, événements, partenaires et boutique.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            {
              title: 'Image premium',
              text: 'Une vitrine qui valorise le projet et rassure partenaires, parents et joueurs.',
            },
            {
              title: 'Vie de club',
              text: 'Des informations claires (actus, événements, résultats) et des repères simples pour suivre le projet.',
            },
            {
              title: 'Confiance',
              text: 'Pages légales, micro-copies explicites, et sécurité pensée pour un usage réel.',
            },
            {
              title: 'Partenaires',
              text: 'Une vitrine qui met en valeur les partenaires, et un parcours simple pour entrer en contact.',
            },
          ].map((item) => (
            <li key={item.title} className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <p className="text-xs uppercase tracking-widest text-white/50">Pilier</p>
              <p className="mt-3 text-lg font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm text-white/70">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Pour qui ?</h2>
        <p className="text-sm leading-relaxed text-white/70">
          Staff, éducateurs, dirigeants, bénévoles et partenaires. Les interfaces sont pensées pour
          être consultées vite (mobile), sans sacrifier le niveau de finition.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Confiance (E-E-A-T)</h2>
        <p className="text-sm leading-relaxed text-white/70">
          On privilégie la clarté : ce que la plateforme fait (et ne fait pas), comment on vous
          contacte, et où se trouvent les engagements essentiels. L’objectif : rassurer sans
          “blabla”, et faciliter une décision.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: 'Transparence',
              text: 'Pages trust accessibles depuis le site : confidentialité, conditions, accessibilité.',
            },
            {
              title: 'Responsabilité',
              text: 'Un point de contact unique pour les demandes produit, sponsors et conformité.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-black/40 p-6">
              <p className="text-xs uppercase tracking-widest text-white/50">Principe</p>
              <p className="mt-3 text-lg font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm text-white/70">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Crédits & contact</h2>
        <p className="text-sm leading-relaxed text-white/70">
          ESPACE GBA est conçu pour le Groupement Bruche Ackerland. Pour une démo, un sponsoring ou
          un accès staff, utilisez la page Contact.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href="/contact"
            className="btn-premium inline-flex items-center justify-center rounded-full border border-white/40 bg-gradient-to-r from-[#00a1ff] to-[#0065bd] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-[#00a1ff]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Contacter
          </a>
          <Link
            href="/shop"
            className="btn-ghost inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white/80 transition hover:border-white/50 hover:bg-white/10"
          >
            Boutique
          </Link>
          <a
            href="/privacy"
            className="btn-ghost inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white/80 transition hover:border-white/50 hover:bg-white/10"
          >
            Confidentialité
          </a>
        </div>
      </div>
    </TrustPageShell>
  )
}
