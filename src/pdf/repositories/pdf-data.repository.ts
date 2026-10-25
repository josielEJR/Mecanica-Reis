import type { AppSupabaseClient } from '../../lib/supabase.js';
import { DomainError, mapSupabaseError } from '../../lib/errors.js';
export class PdfDataRepository {
  constructor(private readonly db: AppSupabaseClient) {}
  private async one(table: string, id: string) { const { data, error } = await this.db.from(table).select('*').eq('id', id).maybeSingle(); if (error) throw mapSupabaseError(error); if (!data) throw new DomainError('NOT_FOUND', 'Registro não encontrado'); return data; }
  private async office() { const { data, error } = await this.db.from('oficina_configuracoes').select('*').limit(1).single(); if (error) throw mapSupabaseError(error); return data; }
  private async parties(clienteId: string, veiculoId: string) { const [cliente, veiculo] = await Promise.all([this.one('clientes', clienteId), this.one('veiculos', veiculoId)]); if (veiculo.cliente_id !== cliente.id) throw new DomainError('INTEGRITY', 'Veículo não pertence ao cliente'); return { cliente, veiculo }; }
  async budget(id: string) { const orcamento = await this.one('orcamentos', id); const [{ data: itens, error }, parties, oficina] = await Promise.all([this.db.from('orcamento_itens').select('*').eq('orcamento_id', id).order('created_at'), this.parties(orcamento.cliente_id, orcamento.veiculo_id), this.office()]); if (error) throw mapSupabaseError(error); return { orcamento, itens: itens ?? [], ...parties, oficina }; }
  async order(id: string) { const ordem = await this.one('ordens_servico', id); const [{ data: itens, error }, parties, oficina, finance] = await Promise.all([this.db.from('ordem_servico_itens').select('*').eq('ordem_servico_id', id).order('created_at'), this.parties(ordem.cliente_id, ordem.veiculo_id), this.office(), this.one('ordem_financeiro', id)]); if (error) throw mapSupabaseError(error); return { ordem, itens: itens ?? [], ...parties, oficina, financeiro: finance }; }
  async receipt(id: string) { const recebimento = await this.one('recebimentos', id); const order = await this.order(recebimento.ordem_servico_id); return { recebimento, ...order }; }
  async statement(orderId: string) { const order = await this.order(orderId); const { data, error } = await this.db.from('recebimentos').select('*').eq('ordem_servico_id', orderId).order('recebido_em'); if (error) throw mapSupabaseError(error); return { ...order, recebimentos: data ?? [] }; }
}
