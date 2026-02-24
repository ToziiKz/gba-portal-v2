import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function seed() {
  console.log('🌱 Seeding Test Data for Tactique RLS...')

  // 1. Get or Create Coach User (we need a real auth user ID to test RLS properly, but for seeding we just need a profile)
  // We'll fetch the first user who is a coach, or just pick the first user and make them a coach for this test.

  const { data: users } = await supabase.from('profiles').select('id, email, role').limit(5)
  if (!users || users.length === 0) {
    console.error('❌ No users found in profiles. Please sign up a user first via the app.')
    return
  }

  const coachUser = users.find((u) => u.role === 'coach') || users[0]
  console.log(`👤 Selected Coach/User: ${coachUser.email} (${coachUser.id})`)

  // Ensure they are a coach for the test (if not already)
  if (coachUser.role !== 'coach') {
    console.log('  -> Temporarily setting role to "coach" for testing...')
    await supabase.from('profiles').update({ role: 'coach' }).eq('id', coachUser.id)
  }

  // 2. Create a Team for this Coach
  const { data: myTeam, error: myTeamError } = await supabase
    .from('teams')
    .insert({
      name: 'Team Coach A (My Team) ' + Date.now(),
      category: 'SEN',
      // sex: 'M', // Removed based on schema error
      coach_id: coachUser.id,
    })
    .select()
    .single()

  if (myTeamError) {
    console.error('❌ Error creating Team A:', myTeamError)
    return
  }
  console.log(`✅ Created Team A: ${myTeam.name} (${myTeam.id})`)

  // 3. Create a Team for Another Coach (to test exclusion)
  const { data: otherTeam, error: otherTeamError } = await supabase
    .from('teams')
    .insert({
      name: 'Team Coach B (Other) ' + Date.now(),
      category: 'U15',
      // sex: 'F' // Removed
    })
    .select()
    .single()

  if (otherTeamError) {
    console.error('❌ Error creating Team B:', otherTeamError)
    return
  }
  console.log(`✅ Created Team B: ${otherTeam.name} (${otherTeam.id})`)

  // 4. Create Matches
  // Match for My Team
  await supabase.from('matches').insert({
    team_id: myTeam.id,
    coach_id: coachUser.id,
    game_date: new Date().toISOString().split('T')[0], // Today
    opponent: 'Adversaire Accessible',
    formation: '4-3-3',
    status: 'scheduled',
  })
  console.log('✅ Created Match for Team A (Should be VISIBLE)')

  // Match for Other Team
  await supabase.from('matches').insert({
    team_id: otherTeam.id,
    // coach_id: null,
    game_date: new Date().toISOString().split('T')[0],
    opponent: 'Adversaire Interdit',
    formation: '4-4-2',
    status: 'scheduled',
  })
  console.log('✅ Created Match for Team B (Should be HIDDEN for Coach A)')

  console.log('\n🎉 Seeding Complete!')
  console.log('👉 Go to http://localhost:3001/dashboard/tactique')
  console.log(`👉 Login as: ${coachUser.email}`)
  console.log('   You should verify:')
  console.log('   1. You see "Adversaire Accessible"')
  console.log('   2. You DO NOT see "Adversaire Interdit"')
}

seed()
