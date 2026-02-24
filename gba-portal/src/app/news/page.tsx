import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

const news = [
  {
    title: 'Week-end de match : l’école de foot à l’honneur',
    date: '2026-02-01',
    summary:
      'Tournoi jeunes, buvette, photos : une journée club qui rassemble toutes les générations au stade municipal.',
    tag: 'Vie de club',
    image: '/actu-stadium-bg.jpg',
    readTime: '2 min',
  },
  {
    title: 'Partenaire premium signé : Boulangerie Martin',
    date: '2026-01-25',
    summary:
      'La Boulangerie Martin devient official partner et soutient la formation et la vie locale du Groupement.',
    tag: 'Partenaires',
    image: '/manifesto-bg.png',
    readTime: '3 min',
  },
  {
    title: 'Boutique : précommandes ouvertes pour la nouvelle saison',
    date: '2026-01-20',
    summary:
      'Maillot, écharpe, pack supporter : découvrez la nouvelle collection et précommandez vos articles dès maintenant.',
    tag: 'Boutique',
    image: '/shop-locker.avif',
    readTime: '1 min',
  },
]

export const metadata: Metadata = {
  title: 'Actualités — ESPACE GBA',
  description:
    'Suivez les derniers moments forts, infos club et nouveautés du Groupement Bruche Ackerland.',
}

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-[#03040a] text-white pt-40 pb-24 overflow-hidden">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[40%] w-[40%] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-24">
          <p className="text-xs font-bold uppercase tracking-[0.5em] text-cyan-400 mb-6">
            Le Fil d&apos;Actu
          </p>
          <h1 className="font-[family-name:var(--font-teko)] text-7xl font-black uppercase leading-[0.85] tracking-tight sm:text-9xl">
            Moments <br />
            <span className="text-white/20">Forts.</span>
          </h1>
          <p className="mt-12 max-w-2xl text-xl text-white/60 leading-relaxed">
            Ici bat le cœur du club. Entre victoires sur le terrain, engagements locaux et vie
            associative, découvrez tout ce qui fait l&apos;ADN du GBA.
          </p>
        </div>

        {/* Featured News (First item) */}
        <div className="mb-16">
          <Link
            href="#"
            className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] transition-all hover:border-white/20"
          >
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-video md:aspect-auto">
                <Image
                  src={news[0].image}
                  alt={news[0].title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r" />
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
                    {news[0].tag}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-white/40">
                    {news[0].readTime} de lecture
                  </span>
                </div>
                <h2 className="font-[family-name:var(--font-teko)] text-4xl font-bold uppercase leading-none tracking-wide md:text-5xl group-hover:text-cyan-400 transition-colors">
                  {news[0].title}
                </h2>
                <p className="mt-6 text-white/60 leading-relaxed">{news[0].summary}</p>
                <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white group-hover:gap-4 transition-all">
                  Lire la suite <span className="text-xl">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Grid for other news */}
        <div className="grid gap-8 md:grid-cols-2">
          {news.slice(1).map((item) => (
            <Link
              key={item.title}
              href="#"
              className="group flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all hover:border-white/20"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
                    {item.tag}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-8">
                <div className="mb-4 text-[10px] uppercase tracking-widest text-white/40">
                  {new Date(item.date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}{' '}
                  — {item.readTime}
                </div>
                <h3 className="font-[family-name:var(--font-teko)] text-3xl font-bold uppercase leading-tight tracking-wide group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm text-white/60 leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
                <div className="mt-auto pt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">
                  Découvrir <span className="text-lg">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Categories / Filters Bottom */}
        <div className="mt-24 rounded-3xl border border-white/5 bg-white/[0.01] p-12 text-center">
          <h3 className="font-[family-name:var(--font-teko)] text-3xl font-bold uppercase tracking-wide mb-6">
            Ne manquez rien.
          </h3>
          <p className="text-white/50 mb-10 max-w-xl mx-auto">
            Suivez-nous également sur nos réseaux sociaux pour les résultats en direct et les
            coulisses du club.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Instagram', 'Facebook', 'LinkedIn'].map((social) => (
              <button
                key={social}
                className="rounded-full border border-white/10 bg-white/5 px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white hover:text-black"
              >
                {social}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
