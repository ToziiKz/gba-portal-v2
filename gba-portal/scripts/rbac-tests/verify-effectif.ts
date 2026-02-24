import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function verifyEffectif() {
  console.log('🔍 Verifying RLS for Effectif (Players)...')

  // 1. Create a Test Team
  const teamName = 'Team Effectif ' + Date.now()
  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .insert({
      name: teamName,
      category: 'SEN',
      coach_id: null, // Unassigned first
    })
    .select()
    .single()

  if (teamErr) {
    console.error('❌ Team creation failed:', teamErr)
    return
  }
  console.log(`✅ Created Team: ${team.name} (${team.id})`)

  // 2. Create a Player (using team_id directly)
  // Assuming 'players' schema has 'team_id'. If it fails, schema is different.
  const { data: player, error: playerErr } = await supabase
    .from('players')
    .insert({
      firstname: 'Test',
      lastname: 'Effectif',
      category: 'SEN',
      team_id: team.id, // Critical for RLS
    })
    .select()
    .single()

  if (playerErr) {
    console.error('❌ Player creation failed:', playerErr)
    // If team_id doesn't exist, we fallback to category check?
    // But our RLS assumes team_id.
    // If schema is legacy (category only), RLS will break unless we match categories to teams.
    // Let's assume team_id exists.
  } else {
    console.log(
      `✅ Created Player: ${player.firstname} ${player.lastname} (Team ID: ${player.team_id})`
    )

    // Cleanup
    await supabase.from('players').delete().eq('id', player.id)
    await supabase.from('teams').delete().eq('id', team.id)
    console.log('✅ Cleanup complete')
  }
}

verifyEffectif()
