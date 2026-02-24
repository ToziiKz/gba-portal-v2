import type { Metadata } from 'next'

import { createClient } from '@/lib/supabase/server'
import { ConvocationsView } from '@/components/dashboard/convocations/ConvocationsView'

export const metadata: Metadata = {
  title: 'Convocations · GBA Dashboard',
  robots: { index: false, follow: false },
}

export default async function ConvocationsPage() {
  const supabase = await createClient()

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, category')
    .order('category')

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.6em] text-white/60">Module</p>
        <h2 className="mt-3 font-[var(--font-teko)] text-3xl font-black tracking-[0.06em] text-white md:text-4xl">
          Convocations
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          Sélectionne une équipe, choisis les joueurs, génère un message prêt à envoyer.
        </p>
      </div>

      <ConvocationsView
        teams={(teams ?? []) as Array<{ id: string; name: string; category: string }>}
      />
    </div>
  )
}
