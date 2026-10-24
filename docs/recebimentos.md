# Recebimentos e estornos

`RecebimentosService` usa a RPC `adicionar_recebimento`, nunca um `insert` direto. O valor é convertido para centavos com `bigint` em [decimal.ts](../src/domain/decimal.ts) e enviado como decimal textual ao PostgreSQL. A RPC bloqueia a ordem, verifica o saldo líquido e aceita `idempotency_key`; uma repetição retorna o lançamento original.

Estornos usam `estornar_recebimento`. O lançamento original permanece intacto e um novo registro com `estorno_de` é criado. A view `ordem_financeiro` soma lançamentos originais e subtrai estornos. O mesmo estorno não pode ser criado duas vezes.

```ts
await recebimentos.registrarRecebimento({ ordem_servico_id, valor: '120.00', idempotency_key: 'ordem-123-tentativa-1' });
await recebimentos.estornarRecebimento({ recebimento_id, observacoes: 'Correção auditável' });
```
