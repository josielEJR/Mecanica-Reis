# Arquitetura — ETAPA 01

O projeto é banco-first e não possui front-end nesta etapa. O Supabase fornece PostgreSQL, Auth e a API; o cliente futuro usará apenas a chave anônima e sessões do Auth. A autorização é independente da autenticação: `auth.uid()` precisa existir em `oficina_autorizados` com `ativo = true`.

As entidades são normalizadas e usam UUID, `timestamptz` e `numeric(12,2)`. Itens de orçamento e ordem armazenam snapshots de descrição, tipo, custo e preço, portanto alterações no catálogo não reescrevem histórico. A view `ordem_financeiro` agrega itens e recebimentos em subconsultas laterais para evitar duplicidade em joins.

Recebimentos são inseridos exclusivamente pela RPC `adicionar_recebimento`, que valida o usuário, bloqueia a ordem com `FOR UPDATE` e compara o novo valor ao saldo dentro da mesma transação. A conversão comercial usa a RPC `converter_orcamento_em_ordem`, também com `SECURITY DEFINER`, lock do orçamento e cópia atômica dos snapshots.

A camada TypeScript separa schemas Zod, repositories e services. Os repositories não usam `service_role`; o cliente usa a chave anônima e a sessão do usuário, deixando RLS como última autoridade.
