import type { Metadata } from "next";
import {
  Mail,
  MessageSquare,
  ShieldCheck,
  Trophy,
  ArrowUpRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — ESPACE GBA",
  description:
    "Prenez contact avec le Groupement Bruche Ackerland : Sponsoring, Presse, Inscriptions ou Support.",
};

const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@gba-portal.fr";

const topics = [
  {
    title: "Partenariats",
    description:
      "Devenez sponsor et associez votre marque à l&apos;ambition du GBA.",
    icon: Trophy,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    subject: "Partenariat Sponsor GBA",
  },
  {
    title: "Support Staff",
    description:
      "Aide à la connexion, droits d&apos;accès et outils numériques.",
    icon: ShieldCheck,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    subject: "Support Accès Dashboard",
  },
  {
    title: "Inscriptions",
    description:
      "Rejoindre le club, licences jeunes et seniors, informations pratiques.",
    icon: MessageSquare,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    subject: "Demande Inscription / Licence",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#03040a] text-white pt-40 pb-24 overflow-hidden">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-blue-600/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-cyan-600/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-24">
          <p className="text-xs font-bold uppercase tracking-[0.5em] text-cyan-400 mb-6">
            Contact & Support
          </p>
          <h1 className="font-[family-name:var(--font-teko)] text-7xl font-black uppercase leading-[0.85] tracking-tight sm:text-9xl">
            Parlons <br />
            <span className="text-white/20">Projet.</span>
          </h1>
          <p className="mt-12 max-w-2xl text-xl text-white/60 leading-relaxed">
            Une question sur le club, une envie de partenariat ou un besoin
            technique ? Notre équipe est là pour vous répondre précisément.
          </p>
        </div>

        {/* Main Email Action */}
        <div className="mb-20 group">
          <a
            href={`mailto:${contactEmail}`}
            className="relative flex flex-col md:flex-row items-center justify-between p-10 md:p-16 rounded-[40px] border border-white/10 bg-white/[0.02] overflow-hidden transition-all hover:border-cyan-500/30"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 mb-8 md:mb-0 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-white/5">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Email Principal
                </span>
              </div>
              <p className="text-2xl sm:text-4xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                {contactEmail}
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-4 rounded-full bg-white px-10 py-5 text-sm font-black uppercase tracking-widest text-black transition-transform group-hover:scale-105">
              Écrire au club
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </a>
        </div>

        {/* Rapid Topics Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {topics.map((topic) => (
            <a
              key={topic.title}
              href={`mailto:${contactEmail}?subject=${encodeURIComponent(topic.subject)}`}
              className="group relative p-10 rounded-[32px] border border-white/5 bg-white/[0.01] transition-all hover:bg-white/[0.03] hover:border-white/10"
            >
              <div className={`mb-8 inline-flex p-4 rounded-2xl ${topic.bg}`}>
                <topic.icon className={`w-6 h-6 ${topic.color}`} />
              </div>
              <h2 className="font-[family-name:var(--font-teko)] text-3xl font-bold uppercase tracking-wide mb-4 group-hover:text-cyan-400 transition-colors">
                {topic.title}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                {topic.description}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 group-hover:text-white transition-colors">
                Ouvrir un ticket <ArrowUpRight className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-24 grid md:grid-cols-2 gap-8">
          <div className="p-10 rounded-[32px] bg-white/[0.02] border border-white/5">
            <h3 className="font-[family-name:var(--font-teko)] text-2xl font-bold uppercase tracking-wide mb-6">
              Réponse rapide
            </h3>
            <p className="text-sm text-white/50 leading-relaxed italic">
              &quot;Nous privilégions des échanges directs et efficaces. Vous
              recevrez généralement un retour sous 24h à 48h ouvrées.&quot;
            </p>
          </div>
          <div className="p-10 rounded-[32px] bg-white/[0.02] border border-white/5">
            <h3 className="font-[family-name:var(--font-teko)] text-2xl font-bold uppercase tracking-wide mb-6">
              Localisation
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Basé au cœur de la vallée de la Bruche et de l&apos;Ackerland.{" "}
              <br />
              Entraînements et matchs sur nos complexes partenaires.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
