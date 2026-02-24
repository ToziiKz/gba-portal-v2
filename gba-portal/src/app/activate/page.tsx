import { createClient } from '@/lib/supabase/server'
import { ActivateForm } from './activate-form'

export const metadata = {
  title: 'Activation compte coach · GBA',
}

export default async function ActivatePage({
  searchParams,
}: {
  searchParams?: Promise<{ inv?: string; token?: string }>
}) {
  const params = (await searchParams) ?? {}
  const supabase = await createClient()

  let initialFullName = ''
  if (params.inv) {
    const { data: inv } = await supabase
      .from('coach_invitations')
      .select('full_name')
      .eq('id', params.inv)
      .single()

    if (inv?.full_name) {
      initialFullName = inv.full_name
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020202] via-[#050505] to-[#000000] px-6 py-24">
      <div className="mx-auto w-full max-w-md rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.65)] backdrop-blur md:p-10">
        <p className="text-xs uppercase tracking-widest text-white/60">Activation coach</p>
        <h1 className="mt-4 font-[var(--font-teko)] text-4xl font-black tracking-[0.06em] text-white md:text-5xl">
          Créer le compte
        </h1>
        <p className="mt-4 text-sm text-white/70">
          Finalisez votre accès dashboard via le lien d’invitation transmis par un admin.
        </p>

        <div className="mt-8">
          <ActivateForm
            invitationId={params.inv}
            token={params.token}
            initialFullName={initialFullName}
          />
        </div>
      </div>
    </div>
  )
}
