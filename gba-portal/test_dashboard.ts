import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const db = admin;
  let sessionsQuery = db.from('planning_sessions').select(`
      id,
      day,
      start_time,
      end_time,
      location,
      team:team_id (
        id,
        name
      )
    `);
  const res = await sessionsQuery;
  console.log('Sessions Query:', JSON.stringify(res, null, 2));

  let teamsCountQuery = db.from('teams').select('*', { count: 'exact', head: true });
  const countRes = await teamsCountQuery;
  console.log('Count Query:', countRes);
}

main().catch(console.error);
