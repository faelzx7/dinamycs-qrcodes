require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables'); // Or try selecting from qr_codes
  console.log('Fetching qr_codes...');
  const res1 = await supabase.from('qr_codes').select('id').limit(1);
  console.log('qr_codes:', res1.error || 'Exists');
  
  const res2 = await supabase.from('qr_batches').select('id').limit(1);
  console.log('qr_batches:', res2.error || 'Exists');
  
  const res3 = await supabase.from('profiles').select('id').limit(1);
  console.log('profiles:', res3.error || 'Exists');
}

listTables();
