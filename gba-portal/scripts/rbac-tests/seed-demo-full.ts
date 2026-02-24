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

// Utilisation du Service Role pour créer des utilisateurs Auth et bypasser le RLS pendant le seed
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function createAuthUser(email: string, fullName: string, role: string) {
  // 1. Créer l'utilisateur Auth
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
  })

  if (authErr) {
    console.log(`⚠️ User ${email} already exists or error:`, authErr.message)
    // Tenter de le récupérer s'il existe déjà
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()
    if (existing) {
      await supabase.from('profiles').update({ role, full_name: fullName }).eq('id', existing.id)
      return existing.id
    }
    return null
  }

  const userId = authData.user.id

  // 2. Mettre à jour le profil
  await supabase
    .from('profiles')
    .update({
      role: role,
      full_name: fullName,
      is_active: true,
    })
    .eq('id', userId)

  return userId
}

async function seedGlobalDemo() {
  console.log('🚀 Démarrage du Seed de Test Global (Multi-rôles)...')

  // --- 1. CREATION DES UTILISATEURS ---
  console.log('\n👤 1. Création des comptes...')
  const idCoachU11 = await createAuthUser('coach.u11@demo.fr', 'Coach Paul (U11)', 'coach')
  const idCoachSen = await createAuthUser('coach.seniors@demo.fr', 'Coach Marc (SEN)', 'coach')
  const idRespPole = await createAuthUser(
    'resp.pole@demo.fr',
    'Julie Resp (FORMATION)',
    'resp_pole'
  )

  if (!idCoachU11 || !idCoachSen || !idRespPole) {
    console.error('❌ Erreur critique lors de la création des utilisateurs.')
    return
  }

  // Assigner le resp_pole au pole FORMATION
  await supabase.from('user_scopes').upsert(
    {
      user_id: idRespPole,
      scope_type: 'pole',
      pole: 'FORMATION',
    },
    { onConflict: 'user_id, scope_type, team_id, pole' }
  )

  // --- 2. CREATION DES EQUIPES ---
  console.log('\n🛡️ 2. Création des Équipes...')

  const { data: teamU11, error: errU11 } = await supabase
    .from('teams')
    .insert({
      name: 'DEMO__Tigres',
      category: 'U11',
      gender: 'M',
      pole: 'FORMATION',
      coach_id: idCoachU11,
    })
    .select()
    .single()

  if (errU11) console.error('Erreur création team U11:', errU11)

  const { data: teamSen, error: errSen } = await supabase
    .from('teams')
    .insert({
      name: 'DEMO__Seniors A',
      category: 'SEN',
      gender: 'M',
      pole: null, // Avoid breaking check constraint if pole values are strict in DB
      coach_id: idCoachSen,
    })
    .select()
    .single()

  if (errSen) console.error('Erreur création team Seniors:', errSen)

  if (!teamU11 || !teamSen) {
    console.error('❌ Arrêt : Impossible de créer les équipes de test.')
    return
  }

  // Mettre à jour les user_scopes pour les coachs
  await supabase.from('user_scopes').upsert(
    [
      { user_id: idCoachU11, scope_type: 'team', team_id: teamU11.id },
      { user_id: idCoachSen, scope_type: 'team', team_id: teamSen.id },
    ],
    { onConflict: 'user_id, scope_type, team_id, pole' }
  )

  // --- 3. CREATION DES JOUEURS ---
  console.log('\n🏃‍♂️ 3. Création des Joueurs...')
  const { data: playersU11 } = await supabase
    .from('players')
    .insert([
      { firstname: 'Léo', lastname: 'Petit', category: 'U11', gender: 'M', team_id: teamU11.id },
      { firstname: 'Tom', lastname: 'Micro', category: 'U11', gender: 'M', team_id: teamU11.id },
    ])
    .select()

  const { data: playersSen } = await supabase
    .from('players')
    .insert([
      { firstname: 'Jean', lastname: 'Costaud', category: 'SEN', gender: 'M', team_id: teamSen.id },
      {
        firstname: 'Pierre',
        lastname: 'Rapide',
        category: 'SEN',
        gender: 'M',
        team_id: teamSen.id,
      },
    ])
    .select()

  // --- 4. CREATION DES SEANCES (PLANNING) ---
  console.log('\n📅 4. Création du Planning...')
  await supabase.from('planning_sessions').insert([
    {
      team_id: teamU11.id,
      day: 'Mer',
      pole: 'FORMATION',
      start_time: '14:00:00',
      end_time: '15:30:00',
      location: 'Terrain B',
      staff: ['Coach Paul'],
    },
    {
      team_id: teamSen.id,
      day: 'Mar',
      pole: 'SENIORS',
      start_time: '19:30:00',
      end_time: '21:00:00',
      location: 'Stade Principal',
      staff: ['Coach Marc'],
    },
  ])

  // --- 5. CREATION DES MATCHS (TACTIQUE) ---
  console.log('\n⚽ 5. Création des Matchs...')
  const nextSaturday = new Date()
  nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay()))
  const nextSunday = new Date()
  nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()))

  await supabase.from('matches').insert([
    {
      team_id: teamU11.id,
      coach_id: idCoachU11,
      game_date: nextSaturday.toISOString().split('T')[0],
      opponent: 'FC Ville Voisine',
      formation: '2-3-1',
      status: 'scheduled',
    },
    {
      team_id: teamSen.id,
      coach_id: idCoachSen,
      game_date: nextSunday.toISOString().split('T')[0],
      opponent: 'US Grosse Equipe',
      formation: '4-3-3',
      status: 'scheduled',
    },
  ])

  console.log('\n✅ SEED TERMINE AVEC SUCCES !')
  console.log('----------------------------------------------------')
  console.log('📋 COMPTES A TESTER (Mot de passe pour tous : password123)')
  console.log('1. coach.u11@demo.fr      -> Ne voit QUE les U11 (Tigres)')
  console.log('2. coach.seniors@demo.fr  -> Ne voit QUE les Seniors A')
  console.log('3. resp.pole@demo.fr      -> Voit les U11 (Pole Formation), PAS les Seniors')
  console.log('----------------------------------------------------')
}

seedGlobalDemo()
