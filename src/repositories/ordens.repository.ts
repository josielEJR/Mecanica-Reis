import type { AppSupabaseClient } from '../lib/supabase.js';
import type { Database } from '../types/database.types.js';
import { mapSupabaseError } from '../lib/errors.js';
type Ordem = Database['public']['Tables']['ordens_servico']['Row'];
type Item = Database['public']['Tables']['ordem_servico_itens']['Row'];
type OrdemInsert = Database['public']['Tables']['ordens_servico']['Insert'];
type ItemInsert = Database['public']['Tables']['ordem_servico_itens']['Insert'];
type Finance = Database['public']['Views']['ordem_financeiro']['Row'];
export class OrdensRepository {
  constructor(private readonly db: AppSupabaseClient) {}
  async create(input: OrdemInsert): Promise<Ordem> { const { data, error } = await this.db.from('ordens_servico').insert(input).select().single(); if (error) throw mapSupabaseError(error); return data; }
  async getById(id: string): Promise<Ordem | null> { const { data, error } = await this.db.from('ordens_servico').select('*').eq('id', id).maybeSingle(); if (error) throw mapSupabaseError(error); return data; }
  async list(): Promise<Ordem[]> { const { data, error } = await this.db.from('ordens_servico').select('*').order('created_at', { ascending: false }); if (error) throw mapSupabaseError(error); return data ?? []; }
  async update(id: string, input: Partial<OrdemInsert>): Promise<Ordem> { const { data, error } = await this.db.from('ordens_servico').update(input).eq('id', id).select().single(); if (error) throw mapSupabaseError(error); return data; }
  async addItem(input: ItemInsert): Promise<Item> { const { data, error } = await this.db.from('ordem_servico_itens').insert(input).select().single(); if (error) throw mapSupabaseError(error); return data; }
  async updateItem(id: string, input: Partial<ItemInsert>): Promise<Item> { const { data, error } = await this.db.from('ordem_servico_itens').update(input).eq('id', id).select().single(); if (error) throw mapSupabaseError(error); return data; }
  async removeItem(id: string): Promise<void> { const { error } = await this.db.from('ordem_servico_itens').delete().eq('id', id); if (error) throw mapSupabaseError(error); }
  async listItems(id: string): Promise<Item[]> { const { data, error } = await this.db.from('ordem_servico_itens').select('*').eq('ordem_servico_id', id).order('created_at'); if (error) throw mapSupabaseError(error); return data ?? []; }
  async getFinance(id: string): Promise<Finance | null> { const { data, error } = await this.db.from('ordem_financeiro').select('*').eq('id', id).maybeSingle(); if (error) throw mapSupabaseError(error); return data; }
  async convertBudget(orcamentoId: string): Promise<string> { const { data, error } = await this.db.rpc('converter_orcamento_em_ordem', { p_orcamento_id: orcamentoId }); if (error) throw mapSupabaseError(error); return data; }
  async setStatus(id: string, status: Ordem['status']): Promise<Ordem> { return this.update(id, { status }); }
}
