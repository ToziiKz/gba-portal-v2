import type { Metadata } from 'next'
import { TrustPageShell } from '@/components/TrustPageShell'

export const metadata: Metadata = {
  title: 'Accessibilité',
  description:
    'Engagement accessibilité de ESPACE GBA : navigation clavier, contrastes, contenus, contact et retours.',
  alternates: {
    canonical: '/accessibility',
  },
}

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contact@gba-portal.fr'

export default function AccessibilityPage() {
  return (
    <TrustPageShell
      eyebrow="Accessibilité"
      title="Déclaration d’accessibilité"
      lead="On vise une expérience lisible et utilisable par tous : clavier, contrastes, structure claire. Si quelque chose bloque, dites-le — on corrige."
      cta={
        <a
          href={`mailto:${contactEmail}?subject=${encodeURIComponent('Accessibilité — retour')}`}
          className="inline-flex items-center justify-center rounded-full border border-white/40 bg-gradient-to-r from-[#00a1ff] to-[#0065bd] px-6 py-3 text-xs font-black uppercase tracking-[0.5em] text-white shadow-[0_15px_50px_rgba(0,161,255,0.45)]"
        >
          Signaler un problème
        </a>
      }
    >
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Ce qui est déjà en place</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: 'Navigation clavier',
              text: 'Lien d’évitement “Aller au contenu”, focus visible et structure cohérente des sections.',
            },
            {
              title: 'Lisibilité',
              text: 'Contrastes élevés, typographies nettes, et hiérarchie de titres explicite.',
            },
            {
              title: 'Sémantique',
              text: 'Sections balisées, attributs aria quand nécessaire, et micro-copy courte.',
            },
            {
              title: 'Images',
              text: 'Alternatives textuelles (alt) sur les images pertinentes.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-black/40 p-6">
              <p className="text-xs uppercase tracking-[0.6em] text-white/50">Point</p>
              <p className="mt-3 text-lg font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm text-white/70">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Limitations connues</h2>
        <p className="text-sm leading-relaxed text-white/70">
          Certaines animations et effets “cinématiques” peuvent être plus difficiles à appréhender.
          On cherche un équilibre : un rendu premium, sans pénaliser l’usage.
        </p>
        <ul className="space-y-3 text-sm text-white/70">
          {[
            'Si une section est trop animée, signalez-la : on peut réduire l’effet.',
            'Si un contraste est insuffisant sur votre écran, on ajuste la palette.',
            'Si un composant n’est pas correctement navigable au clavier, on le corrige en priorité.',
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#00a1ff]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Contact & retours</h2>
        <p className="text-sm leading-relaxed text-white/70">
          Vous pouvez nous écrire à{' '}
          <a
            className="underline decoration-white/30 underline-offset-4 hover:text-white"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          .
        </p>
        <p className="text-xs text-white/45">
          Micro-copy premium : l’accessibilité n’est pas un badge — c’est une promesse produit.
          Merci de nous aider à la tenir.
        </p>
      </div>
    </TrustPageShell>
  )
}
