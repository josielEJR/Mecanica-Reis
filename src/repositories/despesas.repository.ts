import type { AppSupabaseClient } from '../lib/supabase.js';
import type { Database, DespesaCategoria } from '../types/database.types.js';
import { mapSupabaseError } from '../lib/errors.js';
type Despesa = Database['public']['Tables']['despesas']['Row'];
export class DespesasRepository {
  constructor(private readonly db: AppSupabaseClient) {}
  async create(input: Record<string, unknown>): Promise<Despesa> { const { data, error } = await this.db.rpc('cadastrar_despesa', { p_ordem_servico_id: input.ordem_servico_id ?? null, p_categoria: input.categoria, p_descricao: input.descricao, p_valor: input.valor, p_data_competencia: input.data_competencia, p_observacoes: input.observacoes ?? null }); if (error) throw mapSupabaseError(error); return data; }
  async getById(id: string): Promise<Despesa | null> { const { data, error } = await this.db.from('despesas').select('*').eq('id', id).maybeSingle(); if (error) throw mapSupabaseError(error); return data; }
  async list(filters: { categoria?: DespesaCategoria; ordemId?: string; pendentes?: boolean } = {}): Promise<Despesa[]> { let q = this.db.from('despesas').select('*').is('cancelada_em', null).order('data_competencia', { ascending: false }); if (filters.categoria) q = q.eq('categoria', filters.categoria); if (filters.ordemId) q = q.eq('ordem_servico_id', filters.ordemId); if (filters.pendentes) q = q.is('pago_em', null); const { data, error } = await q; if (error) throw mapSupabaseError(error); return data ?? []; }
  async update(id: string, input: Record<string, unknown>): Promise<Despesa> { const { data, error } = await this.db.rpc('atualizar_despesa', { p_despesa_id: id, p_descricao: input.descricao ?? null, p_valor: input.valor ?? null, p_data_competencia: input.data_competencia ?? null, p_observacoes: input.observacoes ?? null }); if (error) throw mapSupabaseError(error); return data; }
  async markPaid(id: string, paidAt?: string): Promise<Despesa> { const { data, error } = await this.db.rpc('marcar_despesa_paga', { p_despesa_id: id, p_pago_em: paidAt ?? null }); if (error) throw mapSupabaseError(error); return data; }
  async cancel(id: string, reason: string): Promise<Despesa> { const { data, error } = await this.db.rpc('cancelar_despesa', { p_despesa_id: id, p_motivo: reason }); if (error) throw mapSupabaseError(error); return data; }
}
