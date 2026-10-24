-- ETAPA 02: conversão atômica de orçamento aprovado em ordem.
create or replace function public.converter_orcamento_em_ordem(p_orcamento_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  orc public.orcamentos;
  ordem_id uuid;
begin
  if not public.usuario_autorizado() then
    raise exception using errcode = '42501', message = 'Usuário não autorizado';
  end if;

  select * into orc from public.orcamentos where id = p_orcamento_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'Orçamento não encontrado'; end if;

  select id into ordem_id from public.ordens_servico where orcamento_id = p_orcamento_id for update;
  if ordem_id is not null then return ordem_id; end if;
  if orc.status <> 'APROVADO' then
    raise exception using errcode = 'P0001', message = 'Somente orçamentos aprovados podem ser convertidos';
  end if;

  -- O desconto é aplicado depois dos itens para respeitar o trigger de subtotal.
  insert into public.ordens_servico (
    orcamento_id, cliente_id, veiculo_id, descricao_problema, observacoes, desconto
  ) values (
    orc.id, orc.cliente_id, orc.veiculo_id, orc.descricao_problema, orc.observacoes, 0
  ) returning id into ordem_id;

  insert into public.ordem_servico_itens (
    ordem_servico_id, catalogo_item_id, tipo, descricao, quantidade, custo_unitario, preco_unitario
  )
  select ordem_id, catalogo_item_id, tipo, descricao, quantidade, custo_unitario, preco_unitario
  from public.orcamento_itens where orcamento_id = orc.id;

  update public.ordens_servico set desconto = orc.desconto where id = ordem_id;
  return ordem_id;
end;
$$;

revoke all on function public.converter_orcamento_em_ordem(uuid) from public;
grant execute on function public.converter_orcamento_em_ordem(uuid) to authenticated;
