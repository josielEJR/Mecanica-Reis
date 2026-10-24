import type { AppSupabaseClient } from '../lib/supabase.js';
import { mapSupabaseError } from '../lib/errors.js';
import type { DashboardFiltro } from '../schemas/dashboard.schema.js';
export class DashboardRepository {
  constructor(private readonly db: AppSupabaseClient) {}
  async summary(filters: DashboardFiltro) { const { data, error } = await this.db.rpc('dashboard_resumo_financeiro', { p_inicio: filters.inicio, p_fim: filters.fim, p_cliente_id: filters.cliente_id ?? null, p_veiculo_id: filters.veiculo_id ?? null, p_categoria: filters.categoria ?? null, p_situacao: filters.situacao_financeira ?? null }); if (error) throw mapSupabaseError(error); return data?.[0] ?? null; }
  async debtors(search?: string, page = 1, pageSize = 50, clientId?: string) { const { data, error } = await this.db.rpc('listar_clientes_devedores', { p_busca: search ?? null, p_limite: pageSize, p_offset: (Math.max(page, 1) - 1) * pageSize, p_cliente_id: clientId ?? null }); if (error) throw mapSupabaseError(error); return data ?? []; }
}
