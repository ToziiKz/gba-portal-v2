'use client'

import { motion } from 'framer-motion'

type StatItem = {
  label: string
  value: string
}

type StatsTickerProps = {
  stats: StatItem[]
}

const motionEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: motionEase },
  },
}

export function StatsTicker({ stats }: StatsTickerProps) {
  const ribbon = [...stats, ...stats]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:grid-rows-2">
        {stats.map((item, index) => {
          const featured = index === 0
          const className = featured
            ? 'sm:col-span-2 sm:row-span-2'
            : index === 1
              ? 'sm:col-span-2'
              : 'sm:col-span-1'

          return (
            <motion.article
              key={item.label}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: 0.08 * index }}
              className={`group relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#05070d]/70 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.1),0_0_28px_rgba(56,189,248,0.14)] backdrop-blur-xl ${className}`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.18),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.2),transparent_40%)] opacity-80" />
              <p className="relative font-[family-name:var(--font-teko)] text-5xl font-black leading-none tracking-wide text-cyan-200 sm:text-6xl">
                {item.value}
              </p>
              <p className="relative mt-3 text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-100/65">
                {item.label}
              </p>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
            </motion.article>
          )
        })}
      </div>

      <div className="relative overflow-hidden rounded-full border border-white/10 bg-white/[0.03] py-2">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
          className="flex w-max"
        >
          {ribbon.map((item, idx) => (
            <span
              key={`${item.label}-${idx}`}
              className="px-5 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/55"
            >
              {item.label} · {item.value}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
