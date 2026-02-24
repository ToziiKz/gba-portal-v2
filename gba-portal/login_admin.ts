import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function main() {
  const { data: { session }, error } = await supabase.auth.signInWithPassword({
    email: 'yoann.67130@hotmail.fr',
    password: 'password123'
  });
  
  if (session) {
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: p } = await admin.from('profiles').select('*').eq('id', session.user.id).single();
    console.log(p);
  }
}
main();
