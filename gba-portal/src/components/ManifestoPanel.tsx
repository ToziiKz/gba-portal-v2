'use client'

import { motion } from 'framer-motion'

type ManifestoItem = {
  title: string
  text: string
}

type ManifestoPanelProps = {
  items: ManifestoItem[]
}

export function ManifestoPanel({ items }: ManifestoPanelProps) {
  return (
    <div className="mt-12 grid gap-5 md:grid-cols-3">
      {items.map((item, index) => (
        <motion.article
          key={item.title}
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl"
        >
          <p className="font-[family-name:var(--font-teko)] text-2xl font-bold uppercase tracking-wide text-white">
            {item.title}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">{item.text}</p>
        </motion.article>
      ))}
    </div>
  )
}
