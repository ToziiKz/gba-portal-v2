'use client'

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import Image from 'next/image'
import { User } from 'lucide-react'
import { Teko } from 'next/font/google'

const teko = Teko({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

interface Player {
  id: number
  nom: string
  prenom: string
  categorie: string
  sous_categorie: string
  poste?: string
  numero?: string
  note_globale?: number
  photo_url?: string
  equipe?: string // Nom de l'équipe
}

interface PlayerCardProps {
  player: Player
  onClick: () => void
}

export default function PlayerCard({ player, onClick }: PlayerCardProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      onClick={onClick}
      className="group relative h-full rounded-2xl border border-black/10 bg-black/5 backdrop-blur-md shadow-lg overflow-hidden cursor-pointer hover:border-[#0065BD]/50 transition-all duration-300"
      onMouseMove={handleMouseMove}
    >
      {/* Effet de brillance au survol */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              500px circle at ${mouseX}px ${mouseY}px,
              rgba(0, 101, 189, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      <div className="relative h-full p-6 flex flex-col justify-between z-10">
        {/* Header Carte */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              {player.equipe && (
                <span className="px-1.5 py-0.5 rounded bg-black/5 border border-black/10 text-[9px] font-bold text-slate-300 uppercase tracking-wider">
                  {player.equipe}
                </span>
              )}
              {player.categorie && (
                <span className="text-[9px] font-bold text-[#0065BD] uppercase tracking-wider">
                  {player.categorie}
                </span>
              )}
            </div>

            <span className="text-[10px] font-bold text-[#0065BD] uppercase tracking-[0.3em] mb-1">
              {player.poste || 'Joueur'}
            </span>

            <h3
              className={`${teko.className} text-3xl font-medium text-black leading-none uppercase tracking-wide`}
            >
              {player.nom}
            </h3>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
              {player.prenom}
            </p>
          </div>

          {/* Note Globale */}
          <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center bg-black/5">
            <span className={`${teko.className} text-lg pt-1 text-black`}>
              {player.note_globale || '-'}
            </span>
          </div>
        </div>

        {/* Visuel Joueur */}
        <div className="relative mt-6 h-28 flex items-center justify-center">
          {/* Numéro en fond */}
          <div
            className={`${teko.className} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8rem] font-bold text-transparent opacity-10 select-none pointer-events-none`}
            style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}
          >
            {player.numero || '--'}
          </div>

          {/* Avatar */}
          <div className="relative z-10 w-20 h-20 bg-gradient-to-b from-slate-700 to-slate-900 rounded-full flex items-center justify-center border border-black/10 shadow-2xl group-hover:scale-110 transition-transform duration-500 overflow-hidden">
            {player.photo_url ? (
              <Image src={player.photo_url} alt={player.nom} fill className="object-cover" />
            ) : (
              <User size={32} className="text-slate-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
