import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types.js';

// Mantemos Database exportado para tipar payloads; a versão atual do PostgREST
// exige relacionamentos gerados completos para inferir o builder. A geração
// oficial (`npm run db:types`) substitui este any quando houver um projeto alvo.
export type AppSupabaseClient = SupabaseClient<any>;

export function createSupabaseClient(url = process.env.SUPABASE_URL, anonKey = process.env.SUPABASE_ANON_KEY): AppSupabaseClient {
  if (!url || !anonKey) throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios');
  return createClient<Database>(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
