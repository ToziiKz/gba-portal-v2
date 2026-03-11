import type { Metadata } from "next";
import { TrustPageShell } from "@/components/TrustPageShell";

export const metadata: Metadata = {
  title: "Conditions d’utilisation",
  description:
    "Conditions d’utilisation de ESPACE GBA : accès, responsabilités, propriété, contact.",
  alternates: {
    canonical: "/terms",
  },
};

const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@gba-portal.fr";

export default function TermsPage() {
  return (
    <TrustPageShell
      eyebrow="Cadre"
      title="Conditions d’utilisation"
      lead="Un cadre simple : utiliser la plateforme de bonne foi, respecter les accès, et garder le jeu propre."
      cta={
        <a
          href={`mailto:${contactEmail}?subject=${encodeURIComponent("Conditions d’utilisation — ESPACE GBA")}`}
          className="btn-ghost inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.5em] text-white/80 transition hover:border-white/50 hover:bg-white/10"
        >
          Nous écrire
        </a>
      }
    >
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Accès</h2>
        <p className="text-sm leading-relaxed text-white/70">
          Certaines zones sont réservées (staff, parents, partenaires). Vous
          êtes responsable de la confidentialité de vos identifiants. Toute
          tentative d’accès non autorisé peut entraîner une suspension.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Usage acceptable</h2>
        <ul className="space-y-3 text-sm text-white/70">
          {[
            "Ne pas perturber le service (spam, attaques, extraction abusive).",
            "Ne pas publier de contenu illégal, diffamatoire ou portant atteinte aux mineurs.",
            "Respecter les rôles et permissions (staff/parent/partenaire).",
            "Signaler les bugs de sécurité plutôt que les exploiter.",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#00a1ff]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Propriété & contenus</h2>
        <p className="text-sm leading-relaxed text-white/70">
          Les visuels, textes, marques et éléments d’interface restent la
          propriété de leurs titulaires. Les contenus fournis par le club ou les
          partenaires restent sous leur responsabilité.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">
          Disponibilité & limites
        </h2>
        <p className="text-sm leading-relaxed text-white/70">
          On vise une disponibilité élevée, mais un service web peut connaître
          des interruptions (maintenance, incidents, réseau). Les informations
          affichées sont fournies “en l’état” et doivent être recoupées pour les
          décisions sensibles.
        </p>
        <p className="text-xs text-white/45">
          Micro-copy premium : le produit est sérieux, mais la réalité reste le
          terrain.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Contact</h2>
        <p className="text-sm leading-relaxed text-white/70">
          Pour toute question sur ces conditions :{" "}
          <a
            className="underline decoration-white/30 underline-offset-4 hover:text-white"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          .
        </p>
      </div>
    </TrustPageShell>
  );
}
