'use client'

import { Construction, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Teko } from 'next/font/google'

const teko = Teko({ subsets: ['latin'], weight: ['400', '600'] })

export default function ConstructionPage({ title, label }: { title: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="relative">
        <div className="absolute -inset-4 bg-[#0065BD]/20 blur-xl rounded-full animate-pulse"></div>
        <Construction size={64} className="text-[#0065BD] relative z-10" />
      </div>

      <div>
        <span className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold">
          {label}
        </span>
        <h1 className={`${teko.className} text-5xl md:text-6xl uppercase text-black mt-2`}>
          {title}
        </h1>
      </div>

      <div className="max-w-md mx-auto p-6 rounded-2xl border border-dashed border-black/10 bg-black/5">
        <p className="text-sm text-slate-400">
          Cette zone du quartier général est en cours de déploiement. Les fonctionnalités seront
          activées prochainement.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/50 hover:text-black transition-colors"
      >
        <ArrowLeft size={16} />
        Retour au QG
      </Link>
    </div>
  )
}
