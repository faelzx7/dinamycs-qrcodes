require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  console.log('PROFILES:', profiles);
  if (error) console.error('ERROR:', error);
}

check();
