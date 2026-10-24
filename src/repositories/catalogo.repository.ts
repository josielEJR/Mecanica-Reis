import type { AppSupabaseClient } from '../lib/supabase.js';
import type { Database, CatalogoItemTipo } from '../types/database.types.js';
import { mapSupabaseError } from '../lib/errors.js';
type Item = Database['public']['Tables']['catalogo_itens']['Row'];
type ItemInsert = Database['public']['Tables']['catalogo_itens']['Insert'];
export class CatalogoRepository {
  constructor(private readonly db: AppSupabaseClient) {}
  async create(input: ItemInsert): Promise<Item> { const { data, error } = await this.db.from('catalogo_itens').insert(input).select().single(); if (error) throw mapSupabaseError(error); return data; }
  async list(tipo?: CatalogoItemTipo): Promise<Item[]> { let query = this.db.from('catalogo_itens').select('*').eq('ativo', true).order('descricao'); if (tipo) query = query.eq('tipo', tipo); const { data, error } = await query; if (error) throw mapSupabaseError(error); return data ?? []; }
  async search(term: string, tipo?: CatalogoItemTipo): Promise<Item[]> { let query = this.db.from('catalogo_itens').select('*').eq('ativo', true).ilike('descricao', `%${term}%`).order('descricao'); if (tipo) query = query.eq('tipo', tipo); const { data, error } = await query; if (error) throw mapSupabaseError(error); return data ?? []; }
  async update(id: string, input: Partial<ItemInsert>): Promise<Item> { const { data, error } = await this.db.from('catalogo_itens').update(input).eq('id', id).select().single(); if (error) throw mapSupabaseError(error); return data; }
  async deactivate(id: string): Promise<Item> { return this.update(id, { ativo: false }); }
}
