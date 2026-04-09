
import { createClient } from './lib/supabase/server';

async function listProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select('id, name');
  if (error) {
    console.error(error);
    return;
  }
  console.log(JSON.stringify(data, null, 2));
}

listProducts();
