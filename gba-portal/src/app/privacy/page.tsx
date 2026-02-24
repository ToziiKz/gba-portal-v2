import type { Metadata } from 'next'
import { TrustPageShell } from '@/components/TrustPageShell'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Comprendre comment ESPACE GBA traite les données : finalités, sécurité, droits et contact.',
  alternates: {
    canonical: '/privacy',
  },
}

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contact@gba-portal.fr'

export default function PrivacyPage() {
  return (
    <TrustPageShell
      eyebrow="Confiance"
      title="Politique de confidentialité"
      lead="On collecte le minimum utile pour faire tourner la plateforme. Pas de blabla : finalités, sécurité, et vos droits — noir sur blanc."
      cta={
        <a
          href={`mailto:${contactEmail}?subject=${encodeURIComponent('Confidentialité — ESPACE GBA')}`}
          className="btn-ghost inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.5em] text-white/80 transition hover:border-white/50 hover:bg-white/10"
        >
          Question confidentialité
        </a>
      }
    >
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Résumé (micro)</h2>
        <ul className="space-y-3 text-sm text-white/70">
          {[
            'Données utilisées pour fournir le service (authentification, accès, contenu).',
            'Sécurité : contrôle d’accès, journalisation, bonnes pratiques d’hébergement.',
            'Pas de revente de données.',
            'Vous pouvez demander l’accès, la rectification ou la suppression selon les cas.',
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#00a1ff]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Données traitées</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
            <p className="text-xs uppercase tracking-[0.6em] text-white/50">Identité & comptes</p>
            <p className="mt-3 text-sm text-white/70">
              Email, rôle (staff/parent/partenaire), et informations nécessaires à l’activation
              d’accès.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
            <p className="text-xs uppercase tracking-[0.6em] text-white/50">Usage produit</p>
            <p className="mt-3 text-sm text-white/70">
              Éléments techniques (logs, erreurs, sécurité) pour fiabiliser l’expérience et prévenir
              les abus.
            </p>
          </div>
        </div>
        <p className="text-xs text-white/45">
          Le contenu exact dépend des fonctionnalités activées (news, inscriptions, sponsoring).
          Objectif : du signal utile, pas de curiosité.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Cookies & stockage local</h2>
        <p className="text-sm leading-relaxed text-white/70">
          Le site peut utiliser des cookies (ou mécanismes équivalents) nécessaires au
          fonctionnement : session, sécurité, préférences. Certaines animations peuvent utiliser le
          stockage local (ex. ne pas rejouer un effet visuel à chaque visite).
        </p>
        <p className="text-sm leading-relaxed text-white/70">
          Si des cookies non essentiels sont ajoutés (mesure d’audience, marketing), ils doivent
          être documentés et soumis à consentement.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Vos droits & contact</h2>
        <p className="text-sm leading-relaxed text-white/70">
          Vous pouvez demander l’accès, la rectification ou la suppression de vos données, dans les
          limites légales et opérationnelles. Contact :{' '}
          <a
            className="underline decoration-white/30 underline-offset-4 hover:text-white"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          .
        </p>
        <p className="text-xs text-white/45">
          Note : ce document est une base produit. Pour une conformité complète (RGPD), adaptez-le
          au contexte réel d’hébergement et d’usage.
        </p>
      </div>
    </TrustPageShell>
  )
}
