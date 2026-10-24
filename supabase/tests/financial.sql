-- Executar com `supabase db test` após iniciar o stack local.
begin;
select plan(10);
select has_table('public', 'clientes', 'clientes existe');
select has_table('public', 'ordens_servico', 'ordens_servico existe');
select has_table('public', 'recebimentos', 'recebimentos existe');
select col_type_is('public', 'ordens_servico', 'desconto', 'numeric(12,2)', 'desconto é NUMERIC(12,2)');
select col_type_is('public', 'recebimentos', 'valor', 'numeric(12,2)', 'recebimento é NUMERIC(12,2)');
select has_function('public', 'adicionar_recebimento', array['uuid', 'numeric', 'timestamp with time zone', 'text'], 'RPC de recebimento existe');
select has_function('public', 'dashboard_financeiro', array['date', 'date'], 'dashboard existe');
select has_function('public', 'converter_orcamento_em_ordem', array['uuid'], 'RPC de conversão existe');
select has_column('public', 'veiculos', 'ativo', 'arquivamento lógico de veículo');
select ok((select relrowsecurity from pg_class where oid = 'public.clientes'::regclass), 'RLS de clientes habilitado');
select * from finish();
rollback;
