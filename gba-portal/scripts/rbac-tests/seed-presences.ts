import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing env vars (SUPABASE_URL or SERVICE_ROLE_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function seedPresences() {
  console.log('🌱 Seeding Test Data for Presences RLS...')

  // 1. Get/Create Coach
  const { data: users } = await supabase.from('profiles').select('id, email, role').limit(5)
  const coachUser = users?.find((u) => u.role === 'coach') || users?.[0]

  if (!coachUser) {
    console.error('❌ No users found. Please sign up via app first.')
    return
  }

  console.log(`👤 Using Coach: ${coachUser.email} (${coachUser.id})`)

  // Ensure role is coach
  if (coachUser.role !== 'coach') {
    await supabase.from('profiles').update({ role: 'coach' }).eq('id', coachUser.id)
  }

  // 2. Create Team
  const teamName = 'Team Presences ' + Date.now()
  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .insert({
      name: teamName,
      category: 'U18',
      coach_id: coachUser.id,
    })
    .select()
    .single()

  if (teamErr) {
    console.error('❌ Team creation failed:', teamErr)
    return
  }
  console.log(`✅ Created Team: ${team.name}`)

  // 3. Create Players for this team (matching category)
  const playersData = [
    { firstname: 'Jean', lastname: 'Dupont', category: 'U18' },
    { firstname: 'Paul', lastname: 'Martin', category: 'U18' },
    { firstname: 'Lucas', lastname: 'Bernard', category: 'U18' },
  ]

  const { data: players, error: playersErr } = await supabase
    .from('players')
    .insert(playersData)
    .select()

  if (playersErr) {
    console.error('❌ Players creation failed:', playersErr)
  } else {
    console.log(`✅ Created ${players.length} players for U18`)
  }

  // 4. Create Planning Sessions
  const { data: session1, error: sessErr } = await supabase
    .from('planning_sessions')
    .insert({
      team_id: team.id,
      day: 'Lun',
      start_time: '18:00',
      end_time: '19:30',
      location: 'Stade Principal',
      pole: 'FORMATION',
      staff: ['Coach A'],
      note: 'Test Session Presences',
    })
    .select()
    .single()

  if (sessErr) {
    console.error('❌ Session creation failed:', sessErr)
  } else {
    console.log(`✅ Created Session: ${session1.day} ${session1.start_time}`)

    // 5. Insert Attendance (Test Write)
    if (players && players.length > 0) {
      const firstPlayer = players[0]
      const sessId = session1.id

      console.log(`Debug IDs: Session=${sessId}, Player=${firstPlayer.id}`)

      const { error: attErr } = await supabase.from('attendance').insert({
        session_id: sessId,
        player_id: firstPlayer.id,
        status: 'present',
        note: 'Seeded via script',
      })

      if (attErr) console.error('❌ Attendance insert failed:', attErr)
      else console.log('✅ Pre-filled attendance for 1 player')
    }
  }

  console.log('\n🎉 Presences Seeding Complete!')
  console.log('👉 Go to http://localhost:3001/dashboard/presences')
  console.log(`👉 Login as: ${coachUser.email}`)
  console.log('   Verify you see the "U18" team session and can mark absent/present.')
}

seedPresences()
