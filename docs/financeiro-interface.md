# Interface financeira

A tela `/financeiro` consulta o PostgreSQL por meio da RPC `dashboard_resumo_financeiro` e permite selecionar mês/ano. O indicador **Total a receber** representa as pendências de ordens concluídas ou entregues, independentemente do mês escolhido.

Na tela de detalhe de uma ordem, o componente financeiro consulta `recebimentos` e registra lançamentos exclusivamente pela RPC `adicionar_recebimento`. Cada envio mantém uma chave de idempotência durante a tentativa; a confirmação só é exibida após a resposta do servidor. O botão de estorno chama `estornar_recebimento` e nunca remove o lançamento original.

A seção de despesas usa `cadastrar_despesa`, `marcar_despesa_paga` e `cancelar_despesa`. Despesas pagas ou canceladas não são editadas pela interface. A lista de devedores usa `listar_clientes_devedores` e só apresenta ordens concluídas/entregues com saldo pendente.

Para validar localmente:

```bash
npm run build
npm run web:build
npm run test:unit
SUPABASE_TELEMETRY_DISABLED=1 npm run db:test
SUPABASE_TELEMETRY_DISABLED=1 npm run test:integration
```
