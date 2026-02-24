'use client'

import { motion } from 'framer-motion'

type FormationStep = {
  label: string
  sub: string
}

type FormationTimelineProps = {
  steps: FormationStep[]
}

export function FormationTimeline({ steps }: FormationTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-cyan-300/80 via-indigo-300/45 to-transparent sm:hidden" />
      <div className="hidden sm:block absolute left-0 right-0 top-10 h-px bg-gradient-to-r from-cyan-300/80 via-indigo-300/45 to-transparent" />

      <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-4">
        {steps.map((step, index) => (
          <motion.article
            key={step.label}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
            className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 pl-10 shadow-[0_0_30px_rgba(0,0,0,0.25)] backdrop-blur-lg sm:pt-14 sm:pl-5"
          >
            <span className="absolute left-[11px] top-8 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_0_5px_rgba(34,211,238,0.14)] sm:left-1/2 sm:top-[35px] sm:-translate-x-1/2" />
            <p className="font-[family-name:var(--font-teko)] text-2xl font-bold uppercase tracking-wide text-white">
              {step.label}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/60">{step.sub}</p>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
