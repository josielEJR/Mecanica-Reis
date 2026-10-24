# Dashboard financeiro

`DashboardService` consulta `dashboard_resumo_financeiro` no PostgreSQL. Os períodos usam início inclusivo e fim inclusivo na API de datas, convertidos internamente para intervalo `[início, fim + 1 dia)` em `America/Sao_Paulo`; timestamps permanecem em UTC.

O retorno separa faturamento por conclusão, recebimentos líquidos por data efetiva, saldo de ordens concluídas/entregues, custos estimados, despesas pagas, despesas pendentes, resultado estimado e fluxo de caixa realizado. `listar_clientes_devedores` calcula saldos no banco, ordena pelo maior saldo e aceita busca/paginação.
