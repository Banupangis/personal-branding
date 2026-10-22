import { createClient } from '@supabase/supabase-js';

let supabaseClient;

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const publicKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!url || !publicKey) {
    throw new Error('Konfigurasi Supabase belum tersedia. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env lokal.');
  }

  supabaseClient = createClient(url, publicKey);
  return supabaseClient;
}
