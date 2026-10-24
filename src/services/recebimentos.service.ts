import { moneyToCents, centsToMoney } from '../domain/decimal.js';
import { DomainError } from '../lib/errors.js';
import { estornoInputSchema, recebimentoInputSchema, type EstornoInput, type RecebimentoInput } from '../schemas/recebimentos.schema.js';
import { RecebimentosRepository } from '../repositories/recebimentos.repository.js';
export class RecebimentosService {
  constructor(private readonly repository: RecebimentosRepository) {}
  registrarRecebimento(input: RecebimentoInput) { const parsed = recebimentoInputSchema.parse(input); const cents = moneyToCents(parsed.valor); if (cents <= 0n) throw new DomainError('VALIDATION', 'Valor deve ser maior que zero'); return this.repository.register({ ordem_servico_id: parsed.ordem_servico_id, p_valor: centsToMoney(cents), p_recebido_em: parsed.recebido_em, p_observacoes: parsed.observacoes, p_idempotency_key: parsed.idempotency_key }); }
  listarRecebimentos(orderId: string) { return this.repository.listByOrder(orderId); }
  async obterTotalRecebido(orderId: string) { return (await this.repository.getFinance(orderId)).total_recebido; }
  async obterSaldoPendente(orderId: string) { return (await this.repository.getFinance(orderId)).saldo_pendente; }
  async obterSituacaoFinanceira(orderId: string) { return (await this.repository.getFinance(orderId)).status_financeiro; }
  estornarRecebimento(input: EstornoInput) { const parsed = estornoInputSchema.parse(input); return this.repository.reverse(parsed.recebimento_id, { p_estornado_em: parsed.estornado_em, p_observacoes: parsed.observacoes }); }
}
