import { createClient } from '@supabase/supabase-js';

let supabaseClient;

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const publicKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!url || !publicKey) {
    throw new Error('database belum connect');
  }

  supabaseClient = createClient(url, publicKey);
  return supabaseClient;
}
