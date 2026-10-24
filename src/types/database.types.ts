export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type CatalogoItemTipo = 'PECA' | 'MAO_DE_OBRA' | 'SERVICO_TERCEIRO';
export type OrcamentoStatus = 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'REJEITADO' | 'CANCELADO';
export type OrdemStatus = 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ENTREGUE' | 'CANCELADA';
export type DespesaCategoria = 'PECA' | 'MAO_DE_OBRA' | 'SERVICO_TERCEIRO' | 'DESPESA_GERAL';

type Entity<Row extends Record<string, unknown>> = { Row: Row; Insert: { [K in keyof Row]?: Row[K] | null }; Update: { [K in keyof Row]?: Row[K] | null }; Relationships: [] };
type UUID = string;
type Timestamps = { created_at: string; updated_at: string };

export interface Database {
  public: {
    CompositeTypes: Record<string, never>;
    Enums: { catalogo_item_tipo: CatalogoItemTipo; orcamento_status: OrcamentoStatus; ordem_status: OrdemStatus; despesa_categoria: DespesaCategoria };
    Tables: {
      oficina_configuracoes: Entity<{ id: UUID; nome_fantasia: string; razao_social: string | null; cpf_cnpj: string | null; telefone: string | null; endereco: string | null; logo_url: string | null } & Timestamps>;
      clientes: Entity<{ id: UUID; nome: string; telefone: string | null; cpf_cnpj: string | null; email: string | null; observacoes: string | null; ativo: boolean } & Timestamps>;
      veiculos: Entity<{ id: UUID; cliente_id: UUID; marca: string; modelo: string; ano: number | null; placa: string | null; cor: string | null; observacoes: string | null; ativo: boolean } & Timestamps>;
      catalogo_itens: Entity<{ id: UUID; tipo: CatalogoItemTipo; descricao: string; custo_padrao: number; preco_padrao: number; ativo: boolean } & Timestamps>;
      orcamentos: Entity<{ id: UUID; numero: number; cliente_id: UUID; veiculo_id: UUID; descricao_problema: string; observacoes: string | null; status: OrcamentoStatus; desconto: number; aprovado_em: string | null } & Timestamps>;
      orcamento_itens: Entity<{ id: UUID; orcamento_id: UUID; catalogo_item_id: UUID | null; tipo: CatalogoItemTipo; descricao: string; quantidade: number; custo_unitario: number; preco_unitario: number } & Timestamps>;
      ordens_servico: Entity<{ id: UUID; numero: number; orcamento_id: UUID | null; cliente_id: UUID; veiculo_id: UUID; descricao_problema: string; diagnostico: string | null; descricao_servico: string | null; observacoes: string | null; status: OrdemStatus; desconto: number; data_entrada: string; data_conclusao: string | null } & Timestamps>;
      ordem_servico_itens: Entity<{ id: UUID; ordem_servico_id: UUID; catalogo_item_id: UUID | null; tipo: CatalogoItemTipo; descricao: string; quantidade: number; custo_unitario: number; preco_unitario: number } & Timestamps>;
      recebimentos: Entity<{ id: UUID; ordem_servico_id: UUID; valor: number; recebido_em: string; observacoes: string | null; estorno_de: UUID | null; created_at: string }>;
      despesas: Entity<{ id: UUID; ordem_servico_id: UUID | null; categoria: DespesaCategoria; descricao: string; valor: number; data_competencia: string; pago_em: string | null; observacoes: string | null } & Timestamps>;
    };
    Views: {
      ordem_financeiro: { Row: { id: UUID; numero: number; cliente_id: UUID; veiculo_id: UUID; status: OrdemStatus; desconto: number; data_entrada: string; data_conclusao: string | null; subtotal: number; total: number; custo_itens: number; total_recebido: number; saldo_pendente: number; status_financeiro: 'NAO_RECEBIDO' | 'PARCIAL' | 'QUITADO' } };
    };
    Functions: {
      adicionar_recebimento: { Args: { p_ordem_servico_id: UUID; p_valor: number; p_recebido_em?: string; p_observacoes?: string | null }; Returns: Database['public']['Tables']['recebimentos']['Row'] };
      converter_orcamento_em_ordem: { Args: { p_orcamento_id: UUID }; Returns: UUID };
      dashboard_financeiro: { Args: { p_inicio: string; p_fim: string }; Returns: Array<Record<string, number>> };
    };
  };
}
