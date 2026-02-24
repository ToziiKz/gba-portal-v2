import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accès coach · GBA',
  description: 'Accès sur invitation uniquement.',
}

export default function CoachAccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020202] via-[#050505] to-[#000000] px-6 py-24">
      <div className="mx-auto w-full max-w-2xl rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.65)] backdrop-blur md:p-10">
        <p className="text-xs uppercase tracking-widest text-white/60">Accès coach</p>
        <h1 className="mt-4 font-[var(--font-teko)] text-4xl font-black tracking-[0.06em] text-white md:text-5xl">
          Invitation requise
        </h1>
        <p className="mt-4 text-sm text-white/70">
          Le dashboard fonctionne désormais en mode invitation-only. Contacte un administrateur du
          club pour recevoir ton lien d’activation.
        </p>
      </div>
    </div>
  )
}
