import type { AppSupabaseClient } from '../lib/supabase.js';
import type { Database } from '../types/database.types.js';
import { mapSupabaseError } from '../lib/errors.js';
type Orcamento = Database['public']['Tables']['orcamentos']['Row'];
type Item = Database['public']['Tables']['orcamento_itens']['Row'];
type OrcamentoInsert = Database['public']['Tables']['orcamentos']['Insert'];
type ItemInsert = Database['public']['Tables']['orcamento_itens']['Insert'];
export class OrcamentosRepository {
  constructor(private readonly db: AppSupabaseClient) {}
  async create(input: OrcamentoInsert): Promise<Orcamento> { const { data, error } = await this.db.from('orcamentos').insert(input).select().single(); if (error) throw mapSupabaseError(error); return data; }
  async getById(id: string): Promise<Orcamento | null> { const { data, error } = await this.db.from('orcamentos').select('*').eq('id', id).maybeSingle(); if (error) throw mapSupabaseError(error); return data; }
  async list(): Promise<Orcamento[]> { const { data, error } = await this.db.from('orcamentos').select('*').order('created_at', { ascending: false }); if (error) throw mapSupabaseError(error); return data ?? []; }
  async update(id: string, input: Partial<OrcamentoInsert>): Promise<Orcamento> { const { data, error } = await this.db.from('orcamentos').update(input).eq('id', id).select().single(); if (error) throw mapSupabaseError(error); return data; }
  async addItem(input: ItemInsert): Promise<Item> { const { data, error } = await this.db.from('orcamento_itens').insert(input).select().single(); if (error) throw mapSupabaseError(error); return data; }
  async updateItem(id: string, input: Partial<ItemInsert>): Promise<Item> { const { data, error } = await this.db.from('orcamento_itens').update(input).eq('id', id).select().single(); if (error) throw mapSupabaseError(error); return data; }
  async removeItem(id: string): Promise<void> { const { error } = await this.db.from('orcamento_itens').delete().eq('id', id); if (error) throw mapSupabaseError(error); }
  async listItems(id: string): Promise<Item[]> { const { data, error } = await this.db.from('orcamento_itens').select('*').eq('orcamento_id', id).order('created_at'); if (error) throw mapSupabaseError(error); return data ?? []; }
}
