import { DomainError } from '../lib/errors.js';
import { estimatedCost, subtotal, total } from '../domain/finance.js';
import { ordemInputSchema, ordemItemInputSchema, type OrdemInput, type OrdemItemInput } from '../schemas/ordens.schema.js';
import { OrdensRepository } from '../repositories/ordens.repository.js';
import type { OrdemStatus } from '../types/database.types.js';
const editable = new Set<OrdemStatus>(['ABERTA', 'EM_ANDAMENTO']);
export class OrdensService {
  constructor(private readonly repository: OrdensRepository) {}
  async criarOrdemDireta(input: OrdemInput) { const parsed = ordemInputSchema.parse(input); return this.repository.create({ ...parsed, desconto: parsed.desconto }); }
  buscarOrdem(id: string) { return this.repository.getById(id); }
  listarOrdens() { return this.repository.list(); }
  async adicionarItemOrdem(id: string, input: OrdemItemInput) { await this.assertEditable(id); return this.repository.addItem({ ...ordemItemInputSchema.parse(input), ordem_servico_id: id }); }
  async atualizarItemOrdem(itemId: string, input: Partial<OrdemItemInput>) { return this.repository.updateItem(itemId, input); }
  removerItemOrdem(itemId: string) { return this.repository.removeItem(itemId); }
  async atualizarOrdem(id: string, input: Partial<OrdemInput>) { const order = await this.require(id); if (!editable.has(order.status)) throw new DomainError('INVALID_STATE', 'Ordem não pode ser alterada neste status'); return this.repository.update(id, input); }
  iniciarServico(id: string) { return this.transition(id, 'EM_ANDAMENTO', ['ABERTA']); }
  concluirServico(id: string) { return this.transition(id, 'CONCLUIDA', ['ABERTA','EM_ANDAMENTO']); }
  entregarVeiculo(id: string) { return this.transition(id, 'ENTREGUE', ['CONCLUIDA']); }
  cancelarOrdem(id: string) { return this.transition(id, 'CANCELADA', ['ABERTA','EM_ANDAMENTO']); }
  converterOrcamentoEmOrdem(orcamentoId: string) { return this.repository.convertBudget(orcamentoId); }
  async calcularTotaisOrdem(id: string) { const order = await this.require(id); const finance = await this.repository.getFinance(id); if (finance) return finance; const items = await this.repository.listItems(id); const normalized = items.map((i) => ({ quantity: i.quantidade, unitPrice: i.preco_unitario, unitCost: i.custo_unitario })); return { subtotal: subtotal(normalized), total: total(normalized, order.desconto), desconto: order.desconto, custo_itens: estimatedCost(normalized) }; }
  private async require(id: string) { const value = await this.repository.getById(id); if (!value) throw new DomainError('NOT_FOUND', 'Ordem não encontrada'); return value; }
  private async assertEditable(id: string) { const order = await this.require(id); if (!editable.has(order.status)) throw new DomainError('INVALID_STATE', 'Ordem não pode receber itens neste status'); }
  private async transition(id: string, next: OrdemStatus, from: OrdemStatus[]) { const order = await this.require(id); if (!from.includes(order.status)) throw new DomainError('INVALID_STATE', 'Transição de ordem inválida'); return this.repository.setStatus(id, next); }
}
