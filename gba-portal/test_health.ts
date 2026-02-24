import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const adminUserEmail = 'yoann.67130@hotmail.fr';

async function main() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const u = users.users.find(u => u.email === adminUserEmail);

  // simulate user client by creating one with user's access token
  // Or just check RLS directly? Let's check RLS on players.
}
main().catch(console.error);
