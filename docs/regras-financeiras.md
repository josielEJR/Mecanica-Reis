# Regras financeiras

`ordem_financeiro` calcula subtotal, total, custo estimado dos itens, recebimentos, saldo pendente e status financeiro. O status é derivado (`NAO_RECEBIDO`, `PARCIAL`, `QUITADO`) e nunca editado manualmente.

Custos de itens são estimativas/atribuições comerciais. `despesas` são obrigações reais da oficina: `pago_em IS NULL` é pendente e uma data em `pago_em` representa caixa realizado. O dashboard separa competência (faturamento pela conclusão) de caixa (recebimentos e despesas pagas pelo timestamp correspondente).

Ordens concluídas, entregues ou canceladas não podem sofrer alterações financeiras por operações comuns. Recebimentos não são apagados; correções devem criar estorno vinculado ao lançamento original em uma evolução auditável.
