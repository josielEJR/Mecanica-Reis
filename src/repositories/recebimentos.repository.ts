import type { AppSupabaseClient } from '../lib/supabase.js';
import type { Database } from '../types/database.types.js';
import { mapSupabaseError } from '../lib/errors.js';
type Recebimento = Database['public']['Tables']['recebimentos']['Row'];
export class RecebimentosRepository {
  constructor(private readonly db: AppSupabaseClient) {}
  async register(input: { ordem_servico_id: string; p_valor: string; p_recebido_em?: string; p_observacoes?: string | null; p_idempotency_key?: string | null }): Promise<Recebimento> { const { data, error } = await this.db.rpc('adicionar_recebimento', { p_ordem_servico_id: input.ordem_servico_id, p_valor: input.p_valor, p_recebido_em: input.p_recebido_em ?? null, p_observacoes: input.p_observacoes ?? null, p_idempotency_key: input.p_idempotency_key ?? null }); if (error) throw mapSupabaseError(error); return data; }
  async listByOrder(orderId: string): Promise<Recebimento[]> { const { data, error } = await this.db.from('recebimentos').select('*').eq('ordem_servico_id', orderId).order('recebido_em'); if (error) throw mapSupabaseError(error); return data ?? []; }
  async getById(id: string): Promise<Recebimento | null> { const { data, error } = await this.db.from('recebimentos').select('*').eq('id', id).maybeSingle(); if (error) throw mapSupabaseError(error); return data; }
  async reverse(id: string, input: { p_estornado_em?: string; p_observacoes?: string | null }): Promise<Recebimento> { const { data, error } = await this.db.rpc('estornar_recebimento', { p_recebimento_id: id, p_estornado_em: input.p_estornado_em ?? null, p_observacoes: input.p_observacoes ?? null }); if (error) throw mapSupabaseError(error); return data; }
  async getFinance(orderId: string) { const { data, error } = await this.db.from('ordem_financeiro').select('total, total_recebido, saldo_pendente, status_financeiro').eq('id', orderId).single(); if (error) throw mapSupabaseError(error); return data; }
}
