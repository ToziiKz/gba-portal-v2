import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
)

async function cleanupGlobalDemo() {
  console.log('🧹 Nettoyage des données de démo...')

  // 1. Delete Teams (will cascade delete matches, planning, players if foreign keys are cascade, but we explicitly delete players to be sure)
  await supabase.from('teams').delete().ilike('name', 'DEMO__%')
  await supabase.from('players').delete().ilike('firstname', 'Léo') // Just to be safe if cascade isn't on for some tables
  await supabase.from('players').delete().ilike('firstname', 'Tom')
  await supabase.from('players').delete().ilike('firstname', 'Jean')
  await supabase.from('players').delete().ilike('firstname', 'Pierre')

  // 2. Delete Auth Users
  const emails = ['coach.u11@demo.fr', 'coach.seniors@demo.fr', 'resp.pole@demo.fr']
  for (const email of emails) {
    const { data: profiles } = await supabase.from('profiles').select('id').eq('email', email)
    if (profiles && profiles.length > 0) {
      for (const p of profiles) {
        await supabase.auth.admin.deleteUser(p.id)
      }
    }
  }

  console.log('✅ Nettoyage terminé.')
}

cleanupGlobalDemo()
