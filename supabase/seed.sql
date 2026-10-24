-- Dados fictícios somente para desenvolvimento local. Não contém usuários Auth reais.
insert into public.oficina_configuracoes (nome_fantasia, telefone, endereco)
values ('Mecânica Reis (Desenvolvimento)', '(11) 99999-0000', 'Rua Exemplo, 100')
on conflict do nothing;

insert into public.clientes (id, nome, telefone, email)
values ('10000000-0000-0000-0000-000000000001', 'Cliente Fictício', '(11) 98888-1111', 'cliente@example.test')
on conflict (id) do nothing;

insert into public.veiculos (id, cliente_id, marca, modelo, ano, placa, cor)
values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Toyota', 'Corolla', 2020, 'ABC1D23', 'Prata')
on conflict (id) do nothing;

insert into public.catalogo_itens (id, tipo, descricao, custo_padrao, preco_padrao)
values
 ('30000000-0000-0000-0000-000000000001', 'PECA', 'Filtro de óleo', 25.00, 45.00),
 ('30000000-0000-0000-0000-000000000002', 'MAO_DE_OBRA', 'Troca de óleo', 40.00, 90.00),
 ('30000000-0000-0000-0000-000000000003', 'SERVICO_TERCEIRO', 'Alinhamento', 60.00, 120.00)
on conflict (id) do nothing;
