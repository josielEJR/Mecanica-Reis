# Banco de dados

As migrations estão em `supabase/migrations`. O reset local aplica a migration e depois `supabase/seed.sql`, que contém somente dados fictícios. A lista de usuários autorizados não é exposta por RLS; o primeiro usuário deve ser incluído por uma operação administrativa segura (SQL Editor com privilégio de serviço), por exemplo:

```sql
insert into public.oficina_autorizados (user_id) values ('UUID_DO_USUARIO_AUTH');
```

O relacionamento veículo–cliente é validado por trigger. `orcamentos.orcamento_id` é único em ordens, impedindo que um orçamento origine ordens duplicadas. Exclusões de clientes, veículos, ordens e despesas relacionadas usam `ON DELETE RESTRICT`; clientes podem ser arquivados pelo campo `ativo`.
