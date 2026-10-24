# Fluxos comerciais

1. Cadastre o cliente e depois o veículo. A placa é normalizada para alfanumérico maiúsculo e o banco mantém unicidade.
2. Crie um orçamento em `RASCUNHO`, adicione itens com snapshots e envie (`ENVIADO`). Um orçamento enviado pode ser aprovado, rejeitado ou cancelado.
3. Orçamento aprovado fica protegido contra alterações comerciais e pode ser convertido com `OrdensService.converterOrcamentoEmOrdem`. A RPC bloqueia o orçamento, copia todos os itens em uma transação e retorna a mesma ordem em chamadas repetidas.
4. Uma ordem direta começa em `ABERTA`; pode iniciar (`EM_ANDAMENTO`), concluir (`CONCLUIDA`) e entregar (`ENTREGUE`). Cancelamento só é aceito antes da conclusão e o banco rejeita cancelamento com recebimentos.
5. Recebimentos devem usar `adicionar_recebimento`; a RPC bloqueia a ordem e impede valores acima do saldo. O status financeiro é derivado pela view.

Transições comerciais inválidas são rejeitadas tanto pelo service quanto pelos triggers incrementais `20261019000400_comercial_status.sql`.
