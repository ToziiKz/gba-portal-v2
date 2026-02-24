import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const adminUserEmail = 'yoann.67130@hotmail.fr';

async function main() {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const u = users.find(u => u.email === adminUserEmail);
  if (!u) { console.log('not found'); return; }
  
  // create magic link link to bypass password
  const { data: link, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: adminUserEmail,
  });
  console.log(link?.properties?.action_link);
}
main().catch(console.error);
