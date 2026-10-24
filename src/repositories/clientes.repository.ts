import type { AppSupabaseClient } from '../lib/supabase.js';
import type { Database } from '../types/database.types.js';
import { mapSupabaseError } from '../lib/errors.js';
type Cliente = Database['public']['Tables']['clientes']['Row'];
type ClienteInsert = Database['public']['Tables']['clientes']['Insert'];
export type Page = { page?: number; pageSize?: number };
const range = ({ page = 1, pageSize = 20 }: Page): [number, number] => { const size = Math.min(Math.max(pageSize, 1), 100); return [(Math.max(page, 1) - 1) * size, Math.max(page, 1) * size - 1]; };
export class ClientesRepository {
  constructor(private readonly db: AppSupabaseClient) {}
  async create(input: ClienteInsert): Promise<Cliente> { const { data, error } = await this.db.from('clientes').insert(input).select().single(); if (error) throw mapSupabaseError(error); return data; }
  async getById(id: string): Promise<Cliente | null> { const { data, error } = await this.db.from('clientes').select('*').eq('id', id).maybeSingle(); if (error) throw mapSupabaseError(error); return data; }
  async list(options: Page = {}): Promise<Cliente[]> { const { data, error } = await this.db.from('clientes').select('*').order('nome').range(...range(options)); if (error) throw mapSupabaseError(error); return data ?? []; }
  async search(term: string, options: Page = {}): Promise<Cliente[]> { const { data, error } = await this.db.from('clientes').select('*').ilike('nome', `%${term}%`).order('nome').range(...range(options)); if (error) throw mapSupabaseError(error); return data ?? []; }
  async update(id: string, input: Partial<ClienteInsert>): Promise<Cliente> { const { data, error } = await this.db.from('clientes').update(input).eq('id', id).select().single(); if (error) throw mapSupabaseError(error); return data; }
}
