import { moneyToCents, centsToMoney } from '../domain/decimal.js';
import { DomainError } from '../lib/errors.js';
import { despesaInputSchema, type DespesaInput } from '../schemas/despesas.schema.js';
import { DespesasRepository } from '../repositories/despesas.repository.js';
export class DespesasService {
  constructor(private readonly repository: DespesasRepository) {}
  cadastrarDespesa(input: DespesaInput) { const parsed = despesaInputSchema.parse(input); const cents = moneyToCents(parsed.valor); if (cents <= 0n) throw new DomainError('VALIDATION', 'Valor deve ser maior que zero'); return this.repository.create({ ...parsed, valor: centsToMoney(cents) }); }
  buscarDespesa(id: string) { return this.repository.getById(id); }
  listarDespesas(filters?: Parameters<DespesasRepository['list']>[0]) { return this.repository.list(filters); }
  atualizarDespesa(id: string, input: Partial<DespesaInput>) { const parsed = despesaInputSchema.partial().parse(input); const value = parsed.valor === undefined ? undefined : centsToMoney(moneyToCents(parsed.valor)); if (value === '0.00') throw new DomainError('VALIDATION', 'Valor deve ser maior que zero'); return this.repository.update(id, { ...parsed, ...(value === undefined ? {} : { valor: value }) }); }
  marcarDespesaComoPaga(id: string, pagoEm?: string) { return this.repository.markPaid(id, pagoEm); }
  listarDespesasPendentes() { return this.repository.list({ pendentes: true }); }
  cancelarDespesa(id: string, motivo: string) { return this.repository.cancel(id, motivo); }
}
