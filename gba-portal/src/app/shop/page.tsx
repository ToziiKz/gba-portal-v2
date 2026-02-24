import type { Metadata } from "next";
import { ShoppingBag, Package, Truck, ArrowUpRight } from "lucide-react";
import { featuredProducts, shopCategories, shopFaqs } from "@/lib/shop-data";

export const metadata: Metadata = {
  title: "Boutique Officielle — ESPACE GBA",
  description:
    "Portez nos couleurs. Soutenez la formation. Maillots, packs et accessoires officiels du Groupement Bruche Ackerland.",
};

export default function ShopPage() {
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@gba-portal.fr";
  const mailtoBase = `mailto:${contactEmail}`;

  return (
    <div className="min-h-screen bg-[#03040a] text-white pt-40 pb-24 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Cinematic Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial Glows */}
        <div className="absolute top-0 right-0 h-[800px] w-[800px] bg-blue-600/10 blur-[140px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 h-[800px] w-[800px] bg-cyan-600/5 blur-[140px] rounded-full -translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[1000px] bg-indigo-500/[0.03] blur-[120px] rounded-full rotate-12" />
        {/* Amber/Gold Accent Glow */}
        <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] bg-amber-500/[0.02] blur-[100px] rounded-full" />

        {/* Noise Texture for Depth */}
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-soft-light"
          style={{
            backgroundImage:
              "url('https://grainy-gradients.vercel.app/noise.svg')",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Hero Section */}
        <div className="mb-32">
          <p className="text-xs font-bold uppercase tracking-[0.5em] text-cyan-400 mb-6">
            Boutique Officielle
          </p>
          <h1 className="font-[family-name:var(--font-teko)] text-7xl font-black uppercase leading-[0.85] tracking-tight sm:text-9xl">
            Portez <br />
            <span className="text-white/20">Nos Couleurs.</span>
          </h1>
          <div className="mt-12 flex flex-col md:flex-row gap-12 items-end justify-between">
            <p className="max-w-xl text-xl text-white/60 leading-relaxed">
              Plus qu&apos;un simple maillot, une identité. Chaque achat
              soutient directement nos équipes de jeunes et le développement du
              club.
            </p>
            <div className="flex gap-4">
              <span className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                Pré-lancement 2026
              </span>
            </div>
          </div>
        </div>

        {/* How to Order - Cinematic Steps */}
        <div className="mb-32 grid md:grid-cols-3 gap-8">
          {[
            {
              id: "01",
              title: "Sélectionnez",
              desc: "Choisissez votre article, taille et quantité.",
              icon: ShoppingBag,
            },
            {
              id: "02",
              title: "Commandez",
              desc: "Envoyez-nous un simple email avec vos choix.",
              icon: Package,
            },
            {
              id: "03",
              title: "Récupérez",
              desc: "Retrait au club après confirmation.",
              icon: Truck,
            },
          ].map((step) => (
            <div
              key={step.id}
              className="relative p-10 rounded-[32px] border border-white/5 bg-white/[0.02]"
            >
              <div className="mb-6 flex items-center justify-between">
                <step.icon className="w-6 h-6 text-cyan-400" />
                <span className="font-[family-name:var(--font-teko)] text-4xl font-bold text-white/10">
                  {step.id}
                </span>
              </div>
              <h3 className="font-[family-name:var(--font-teko)] text-2xl font-bold uppercase tracking-wide mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-white/50">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Featured Products */}
        <div className="mb-32">
          <div className="flex items-center justify-between mb-16">
            <h2 className="font-[family-name:var(--font-teko)] text-4xl font-bold uppercase tracking-wide">
              À la une
            </h2>
            <div className="h-px flex-1 bg-white/10 mx-8 hidden sm:block" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.name}
                className="group flex flex-col rounded-[32px] border border-white/10 bg-white/[0.02] overflow-hidden transition-all duration-500 hover:border-cyan-500/50 hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]"
              >
                <div className="aspect-square bg-white/[0.03] relative flex items-center justify-center overflow-hidden">
                  {/* Animated Background Pattern for the product image area */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent_70%)]" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                    {/* Floating Tech Lines */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent -translate-y-full group-hover:animate-[shimmer_2s_infinite]" />
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent translate-y-full group-hover:animate-[shimmer_2s_infinite_1s]" />
                  </div>

                  <ShoppingBag className="w-16 h-16 text-white/5 group-hover:text-amber-400/30 group-hover:scale-125 group-hover:rotate-6 transition-all duration-700" />

                  <div className="absolute top-6 right-6 z-10">
                    <span className="rounded-full bg-cyan-500 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-black shadow-[0_10px_30px_rgba(6,182,212,0.5)] transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] group-hover:bg-amber-500">
                      {product.priceHint}
                    </span>
                  </div>

                  {/* Glassmorphism Badge */}
                  <div className="absolute bottom-6 left-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="backdrop-blur-md bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/70">
                      Édition 2026
                    </span>
                  </div>
                </div>

                <div className="p-8 flex flex-1 flex-col relative">
                  <div className="mb-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="h-px w-8 bg-cyan-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-500">
                      Premium Quality
                    </span>
                  </div>

                  <h3 className="font-[family-name:var(--font-teko)] text-4xl font-bold uppercase tracking-wide group-hover:text-amber-400 transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="mt-4 text-sm text-white/50 leading-relaxed mb-8 flex-1 group-hover:text-white/70 transition-colors">
                    {product.detail}
                  </p>

                  <a
                    href={`${mailtoBase}?subject=${encodeURIComponent(`Précommande — ${product.name}`)}`}
                    className="relative flex items-center justify-center gap-3 w-full rounded-2xl bg-white px-6 py-5 text-xs font-black uppercase tracking-widest text-black transition-all duration-300 hover:bg-cyan-400 hover:shadow-[0_10px_30px_rgba(6,182,212,0.4)] group-active:scale-95"
                  >
                    Réserver l&apos;article <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-32">
          <h2 className="font-[family-name:var(--font-teko)] text-4xl font-bold uppercase tracking-wide mb-16">
            Catégories
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {shopCategories.map((category) => (
              <div
                key={category.title}
                className="group relative p-10 rounded-[32px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/20 transition-all duration-500 overflow-hidden"
              >
                {/* Decorative Tech Circle */}
                <div className="absolute -right-8 -top-8 w-32 h-32 border border-white/[0.03] rounded-full group-hover:border-cyan-500/20 group-hover:scale-150 transition-all duration-700" />

                <div className="absolute -right-16 -top-16 w-48 h-48 bg-cyan-500/5 rounded-full blur-[60px] group-hover:bg-cyan-500/10 transition-colors" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-[family-name:var(--font-teko)] text-5xl font-bold uppercase tracking-wide group-hover:text-cyan-400 transition-colors">
                      {category.title}
                    </h3>
                    <span className="backdrop-blur-sm bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] border border-white/5">
                      {category.note}
                    </span>
                  </div>
                  <p className="text-white/50 text-base mb-10 leading-relaxed group-hover:text-white/70 transition-colors max-w-md">
                    {category.detail}
                  </p>
                  <a
                    href={`${mailtoBase}?subject=${encodeURIComponent(`Info Boutique — ${category.title}`)}`}
                    className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-all"
                  >
                    Explorer la gamme{" "}
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-32 max-w-3xl mx-auto">
          <h2 className="font-[family-name:var(--font-teko)] text-4xl font-bold uppercase tracking-wide mb-16 text-center">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {shopFaqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-3xl border border-white/5 bg-white/[0.01] p-8 transition-all open:bg-white/[0.03]"
              >
                <summary className="list-none flex justify-between items-center cursor-pointer font-bold text-lg">
                  {faq.q}
                  <ArrowUpRight className="w-5 h-5 text-white/20 group-open:rotate-45 transition-transform" />
                </summary>
                <p className="mt-6 text-white/50 text-sm leading-relaxed border-t border-white/5 pt-6">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="relative p-12 md:p-20 rounded-[40px] border border-white/10 bg-white/[0.02] overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
          <h2 className="font-[family-name:var(--font-teko)] text-6xl font-black uppercase tracking-tight mb-8">
            Prêt à porter <br /> l&apos;esprit GBA ?
          </h2>
          <p className="text-xl text-white/50 mb-12 max-w-xl mx-auto">
            Envoyez votre demande par email. Nous confirmons la disponibilité et
            les modalités de retrait sous 24h.
          </p>
          <a
            href={`mailto:${contactEmail}?subject=Commande Boutique GBA`}
            className="inline-block rounded-full bg-white px-12 py-5 text-sm font-black uppercase tracking-[0.2em] text-black shadow-[0_20px_60px_rgba(255,255,255,0.2)] transition-transform hover:scale-105"
          >
            Lancer une commande
          </a>
        </div>
      </div>
    </div>
  );
}
