# Despesas

Despesas são criadas, pagas e canceladas por RPCs protegidas. Uma despesa pendente tem `pago_em IS NULL`; uma despesa paga entra no caixa pela data de `pago_em`. Cancelamento exige motivo e mantém `cancelada_em` e `cancelamento_motivo` para auditoria.

Despesas vinculadas a uma ordem representam obrigação real. Custos estimados dos itens continuam na view financeira e não são somados novamente ao resultado quando a despesa é vinculada a uma ordem; despesas gerais são abatidas do resultado estimado.
