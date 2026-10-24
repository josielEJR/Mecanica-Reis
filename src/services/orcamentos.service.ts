import { DomainError } from '../lib/errors.js';
import { subtotal, estimatedCost, total } from '../domain/finance.js';
import { orcamentoInputSchema, orcamentoItemInputSchema, type OrcamentoInput, type OrcamentoItemInput } from '../schemas/orcamentos.schema.js';
import { OrcamentosRepository } from '../repositories/orcamentos.repository.js';
import type { OrcamentoStatus } from '../types/database.types.js';
const editable = new Set<OrcamentoStatus>(['RASCUNHO', 'ENVIADO']);
export class OrcamentosService {
  constructor(private readonly repository: OrcamentosRepository) {}
  async criarOrcamento(input: OrcamentoInput) { return this.repository.create(orcamentoInputSchema.parse(input)); }
  buscarOrcamento(id: string) { return this.repository.getById(id); }
  listarOrcamentos() { return this.repository.list(); }
  async adicionarItemOrcamento(id: string, input: OrcamentoItemInput) { await this.assertEditable(id); return this.repository.addItem({ ...orcamentoItemInputSchema.parse(input), orcamento_id: id }); }
  async atualizarItemOrcamento(itemId: string, input: Partial<OrcamentoItemInput>) { const item = await this.repository.updateItem(itemId, input); return item; }
  removerItemOrcamento(itemId: string) { return this.repository.removeItem(itemId); }
  async atualizarOrcamento(id: string, input: Partial<OrcamentoInput>) { const current = await this.require(id); this.assertStatus(current.status); return this.repository.update(id, input); }
  enviarOrcamento(id: string) { return this.transition(id, 'ENVIADO', ['RASCUNHO','ENVIADO']); }
  aprovarOrcamento(id: string) { return this.transition(id, 'APROVADO', ['ENVIADO']); }
  rejeitarOrcamento(id: string) { return this.transition(id, 'REJEITADO', ['ENVIADO']); }
  cancelarOrcamento(id: string) { return this.transition(id, 'CANCELADO', ['RASCUNHO','ENVIADO']); }
  async calcularTotaisOrcamento(id: string) { const orc = await this.require(id); const items = await this.repository.listItems(id); const normalized = items.map((i) => ({ quantity: i.quantidade, unitPrice: i.preco_unitario, unitCost: i.custo_unitario })); return { subtotal: subtotal(normalized), desconto: orc.desconto, total: total(normalized, orc.desconto), custoEstimado: estimatedCost(normalized) }; }
  private async require(id: string) { const value = await this.repository.getById(id); if (!value) throw new DomainError('NOT_FOUND', 'Orçamento não encontrado'); return value; }
  private assertStatus(status: OrcamentoStatus) { if (!editable.has(status)) throw new DomainError('INVALID_STATE', 'Orçamento não pode ser alterado neste status'); }
  private async assertEditable(id: string) { const value = await this.require(id); this.assertStatus(value.status); }
  private async transition(id: string, next: OrcamentoStatus, from: OrcamentoStatus[]) { const value = await this.require(id); if (!from.includes(value.status)) throw new DomainError('INVALID_STATE', 'Transição de orçamento inválida'); return this.repository.update(id, { status: next }); }
}
