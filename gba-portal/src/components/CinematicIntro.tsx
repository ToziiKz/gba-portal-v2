'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Teko, Cinzel } from 'next/font/google'
import { Play } from 'lucide-react'
import { log } from '@/lib/logger'

// Optimisation : Chargement des polices (pourrait être déplacé dans layout.tsx plus tard)
const teko = Teko({ subsets: ['latin'], weight: ['400', '600'] })
const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'] })

export default function CinematicIntro() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return true
    return !sessionStorage.getItem('gba_intro_seen')
  })
  const [isChecked, setIsChecked] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsChecked(true)
  }, [])

  const handleEnter = () => {
    sessionStorage.setItem('gba_intro_seen', 'true')

    if (audioRef.current) {
      audioRef.current.volume = 1.0
      // Gestion robuste des erreurs de lecture auto (bloquées par les navigateurs parfois)
      audioRef.current.play().catch((e) => log.warn('Autoplay audio bloqué ou interrompu :', e))
    }

    setIsVisible(false)
  }

  // Évite un mismatch SSR/CSR (intro dépend de sessionStorage)
  if (!isChecked) return null

  return (
    <>
      {/* Correction : Chemin sensible à la casse (intro.MP3 dans vos fichiers) */}
      <audio ref={audioRef} src="/sounds/intro.MP3" preload="auto" />

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 1.5, ease: 'easeInOut' },
            }}
            className="fixed inset-0 z-[9999] bg-[#020202] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* --- FOND ATMOSPHÈRE "NIGHT STADIUM" --- */}

            {/* 1. Base Noire Profonde */}
            <div className="absolute inset-0 bg-[#020202]"></div>

            {/* 2. Faisceau Gauche (Spotlight) */}
            <motion.div
              animate={{
                rotate: [35, 45, 35],
                opacity: [0.15, 0.3, 0.15],
                x: ['-10%', '0%', '-10%'],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[-50%] left-[-10%] w-[60%] h-[200%] bg-gradient-to-r from-transparent via-[#0065BD]/20 to-transparent blur-[80px]"
            />

            {/* 3. Faisceau Droit (Spotlight) */}
            <motion.div
              animate={{
                rotate: [-35, -45, -35],
                opacity: [0.1, 0.25, 0.1],
                x: ['10%', '0%', '10%'],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-[-50%] right-[-10%] w-[60%] h-[200%] bg-gradient-to-l from-transparent via-white/5 to-transparent blur-[80px]"
            />

            {/* 4. Brume au sol (Ground Fog) */}
            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0065BD]/10 via-transparent to-transparent"
            />

            {/* 5. Grain Cinéma (Texture Hype) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center px-6">
              {/* --- LOGO --- */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
                className="mb-16 flex flex-col items-center"
              >
                <div className="relative w-48 h-48 md:w-64 md:h-64">
                  <Image
                    src="/brand/logo.png"
                    alt="GBA Logo"
                    fill
                    className="object-contain drop-shadow-[0_0_60px_rgba(0,101,189,0.3)]"
                    priority
                  />
                </div>

                <p
                  className={`${cinzel.className} text-white/50 text-xs md:text-sm uppercase tracking-[0.5em] mt-12 font-medium`}
                >
                  L'expérience commence ici.
                </p>
              </motion.div>

              {/* --- BOUTON "THE MONOLITH" --- */}
              <motion.button
                onClick={handleEnter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-12 py-5 md:px-16 md:py-6 border border-white/30 bg-transparent overflow-hidden cursor-pointer transition-all duration-500 hover:border-white hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]"
              >
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>

                <div className="relative z-10 flex items-center gap-4">
                  <span
                    className={`${teko.className} text-2xl md:text-3xl uppercase font-bold tracking-[0.15em] text-white group-hover:text-black transition-colors duration-500`}
                  >
                    Découvrir l'univers
                  </span>
                  <Play
                    size={18}
                    fill="currentColor"
                    className="text-white group-hover:text-black transition-colors duration-500"
                  />
                </div>
              </motion.button>

              {/* --- TEXTE IMMERSION --- */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="text-white/20 text-[10px] uppercase tracking-widest mt-16 font-mono flex items-center gap-3"
              >
                <span className="w-1 h-1 bg-[#0065BD] rounded-full animate-pulse"></span>
                Activez le son. Immersion absolue.
                <span className="w-1 h-1 bg-[#0065BD] rounded-full animate-pulse"></span>
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
