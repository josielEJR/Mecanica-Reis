import { dashboardFiltroSchema, type DashboardFiltro } from '../schemas/dashboard.schema.js';
import { DashboardRepository } from '../repositories/dashboard.repository.js';
export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}
  obterResumoFinanceiro(filters: DashboardFiltro) { return this.repository.summary(dashboardFiltroSchema.parse(filters)); }
  obterFaturamento(filters: DashboardFiltro) { return this.obterResumoFinanceiro(filters).then((v) => v?.faturamento ?? 0); }
  obterRecebimentos(filters: DashboardFiltro) { return this.obterResumoFinanceiro(filters).then((v) => v?.total_recebido ?? 0); }
  obterDespesas(filters: DashboardFiltro) { return this.obterResumoFinanceiro(filters).then((v) => ({ pagas: v?.despesas_pagas ?? 0, pendentes: v?.despesas_pendentes ?? 0 })); }
  obterSaldoAReceber(filters: DashboardFiltro) { return this.obterResumoFinanceiro(filters).then((v) => v?.saldo_a_receber ?? 0); }
  obterResultadoEstimado(filters: DashboardFiltro) { return this.obterResumoFinanceiro(filters).then((v) => v?.resultado_estimado ?? 0); }
  obterFluxoCaixa(filters: DashboardFiltro) { return this.obterResumoFinanceiro(filters).then((v) => v?.fluxo_caixa_realizado ?? 0); }
  async obterResumoPorCategoria(filters: DashboardFiltro) { const parsed = dashboardFiltroSchema.parse(filters); const categorias = ['PECA', 'MAO_DE_OBRA', 'SERVICO_TERCEIRO', 'DESPESA_GERAL'] as const; return Object.fromEntries(await Promise.all(categorias.map(async (categoria) => [categoria, await this.repository.summary({ ...parsed, categoria })]))); }
  listarClientesDevedores(search?: string, page?: number, pageSize?: number) { return this.repository.debtors(search, page, pageSize); }
  obterPendenciasDoCliente(clienteId: string, _periodo: Pick<DashboardFiltro, 'inicio' | 'fim'>) { return this.repository.debtors(undefined, 1, 500, clienteId); }
  obterSaldoTotalDoCliente(clienteId: string, _periodo: Pick<DashboardFiltro, 'inicio' | 'fim'>) { return this.repository.debtors(undefined, 1, 500, clienteId).then((rows) => rows.reduce((sum: number, row: Record<string, unknown>) => sum + Number(row.saldo_pendente ?? 0), 0)); }
  listarOrdensPendentes(search?: string, page?: number, pageSize?: number) { return this.repository.debtors(search, page, pageSize); }
}
