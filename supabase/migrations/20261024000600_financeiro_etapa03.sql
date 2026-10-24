-- ETAPA 03: recebimentos líquidos/idempotentes, estornos, despesas auditáveis
-- e consultas financeiras sem duplicidade.

alter table public.recebimentos
  add column if not exists idempotency_key text,
  add constraint recebimentos_idempotency_key_nao_vazio check (idempotency_key is null or length(trim(idempotency_key)) > 0);
create unique index if not exists recebimentos_idempotency_unica on public.recebimentos (ordem_servico_id, idempotency_key) where idempotency_key is not null and estorno_de is null;

alter table public.despesas
  add column if not exists cancelada_em timestamptz,
  add column if not exists cancelamento_motivo text;
alter table public.despesas drop constraint if exists despesas_cancelamento_motivo_check;
alter table public.despesas add constraint despesas_cancelamento_motivo_check check (cancelada_em is null or length(trim(coalesce(cancelamento_motivo, ''))) > 0);

create or replace view public.ordem_financeiro as
select o.id, o.numero, o.cliente_id, o.veiculo_id, o.status, o.desconto, o.data_entrada, o.data_conclusao,
  coalesce(i.subtotal, 0)::numeric(12,2) as subtotal,
  (coalesce(i.subtotal, 0) - o.desconto)::numeric(12,2) as total,
  coalesce(i.custo_itens, 0)::numeric(12,2) as custo_itens,
  coalesce(r.total_recebido, 0)::numeric(12,2) as total_recebido,
  greatest((coalesce(i.subtotal, 0) - o.desconto - coalesce(r.total_recebido, 0)), 0)::numeric(12,2) as saldo_pendente,
  case when coalesce(r.total_recebido, 0) <= 0 then 'NAO_RECEBIDO' when coalesce(r.total_recebido, 0) < coalesce(i.subtotal, 0) - o.desconto then 'PARCIAL' else 'QUITADO' end as status_financeiro
from public.ordens_servico o
left join lateral (select sum(quantidade * preco_unitario) as subtotal, sum(quantidade * custo_unitario) as custo_itens from public.ordem_servico_itens where ordem_servico_id = o.id) i on true
left join lateral (select sum(case when estorno_de is null then valor else -valor end) as total_recebido from public.recebimentos where ordem_servico_id = o.id) r on true;

create or replace function public.adicionar_recebimento(
  p_ordem_servico_id uuid, p_valor numeric(12,2), p_recebido_em timestamptz, p_observacoes text, p_idempotency_key text
) returns public.recebimentos language plpgsql security definer set search_path = public as $$
declare ordem public.ordens_servico; total_ordem numeric(12,2); recebido numeric(12,2); existente public.recebimentos; novo public.recebimentos;
begin
  if not public.usuario_autorizado() then raise exception using errcode = '42501', message = 'Usuário não autorizado'; end if;
  if p_valor is null or p_valor <= 0 then raise exception using errcode = '22003', message = 'Valor do recebimento deve ser maior que zero'; end if;
  if p_idempotency_key is not null then
    select * into existente from public.recebimentos where ordem_servico_id = p_ordem_servico_id and idempotency_key = p_idempotency_key and estorno_de is null;
    if found then return existente; end if;
  end if;
  select * into ordem from public.ordens_servico where id = p_ordem_servico_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'Ordem não encontrada'; end if;
  if ordem.status = 'CANCELADA' then raise exception using errcode = 'P0001', message = 'Não é permitido receber em ordem cancelada'; end if;
  select total into total_ordem from public.ordem_financeiro where id = p_ordem_servico_id;
  select coalesce(sum(case when estorno_de is null then valor else -valor end), 0) into recebido from public.recebimentos where ordem_servico_id = p_ordem_servico_id;
  if recebido + p_valor > total_ordem then raise exception using errcode = 'P0001', message = 'Recebimento supera o saldo da ordem'; end if;
  insert into public.recebimentos(ordem_servico_id, valor, recebido_em, observacoes, idempotency_key) values (p_ordem_servico_id, p_valor, coalesce(p_recebido_em, now()), p_observacoes, p_idempotency_key) returning * into novo;
  return novo;
exception when unique_violation then
  select * into existente from public.recebimentos where ordem_servico_id = p_ordem_servico_id and idempotency_key = p_idempotency_key and estorno_de is null;
  if found then return existente; end if;
  raise;
end; $$;
revoke all on function public.adicionar_recebimento(uuid,numeric,timestamptz,text,text) from public;
grant execute on function public.adicionar_recebimento(uuid,numeric,timestamptz,text,text) to authenticated;

create or replace function public.adicionar_recebimento(p_ordem_servico_id uuid, p_valor numeric(12,2), p_recebido_em timestamptz default now(), p_observacoes text default null) returns public.recebimentos language sql security definer set search_path = public as $$
  select public.adicionar_recebimento(p_ordem_servico_id, p_valor, p_recebido_em, p_observacoes, null);
$$;
revoke all on function public.adicionar_recebimento(uuid,numeric,timestamptz,text) from public;
grant execute on function public.adicionar_recebimento(uuid,numeric,timestamptz,text) to authenticated;

create or replace function public.estornar_recebimento(p_recebimento_id uuid, p_estornado_em timestamptz default now(), p_observacoes text default null)
returns public.recebimentos language plpgsql security definer set search_path = public as $$
declare original public.recebimentos; existente public.recebimentos; estorno public.recebimentos;
begin
  if not public.usuario_autorizado() then raise exception using errcode = '42501', message = 'Usuário não autorizado'; end if;
  select * into original from public.recebimentos where id = p_recebimento_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'Recebimento não encontrado'; end if;
  if original.estorno_de is not null then raise exception using errcode = 'P0001', message = 'Não é permitido estornar um estorno'; end if;
  select * into existente from public.recebimentos where estorno_de = original.id for update;
  if found then return existente; end if;
  insert into public.recebimentos(ordem_servico_id, valor, recebido_em, observacoes, estorno_de, idempotency_key)
    values (original.ordem_servico_id, original.valor, coalesce(p_estornado_em, now()), p_observacoes, original.id, null)
    returning * into estorno;
  return estorno;
end; $$;
revoke all on function public.estornar_recebimento(uuid,timestamptz,text) from public;
grant execute on function public.estornar_recebimento(uuid,timestamptz,text) to authenticated;

create or replace function public.marcar_despesa_paga(p_despesa_id uuid, p_pago_em timestamptz default now()) returns public.despesas language plpgsql security definer set search_path = public as $$
declare desp public.despesas;
begin
  if not public.usuario_autorizado() then raise exception using errcode = '42501', message = 'Usuário não autorizado'; end if;
  select * into desp from public.despesas where id = p_despesa_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'Despesa não encontrada'; end if;
  if desp.cancelada_em is not null then raise exception using errcode = 'P0001', message = 'Despesa cancelada não pode ser paga'; end if;
  if desp.pago_em is not null then return desp; end if;
  update public.despesas set pago_em = coalesce(p_pago_em, now()) where id = p_despesa_id returning * into desp;
  return desp;
end; $$;
revoke all on function public.marcar_despesa_paga(uuid,timestamptz) from public;
grant execute on function public.marcar_despesa_paga(uuid,timestamptz) to authenticated;

create or replace function public.cancelar_despesa(p_despesa_id uuid, p_motivo text) returns public.despesas language plpgsql security definer set search_path = public as $$
declare desp public.despesas;
begin
  if not public.usuario_autorizado() then raise exception using errcode = '42501', message = 'Usuário não autorizado'; end if;
  if p_motivo is null or length(trim(p_motivo)) = 0 then raise exception using errcode = '22023', message = 'Motivo do cancelamento é obrigatório'; end if;
  select * into desp from public.despesas where id = p_despesa_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'Despesa não encontrada'; end if;
  if desp.cancelada_em is not null then return desp; end if;
  update public.despesas set cancelada_em = now(), cancelamento_motivo = trim(p_motivo) where id = p_despesa_id returning * into desp;
  return desp;
end; $$;
revoke all on function public.cancelar_despesa(uuid,text) from public;
grant execute on function public.cancelar_despesa(uuid,text) to authenticated;
revoke insert, update, delete on public.recebimentos, public.despesas from authenticated;
grant select on public.recebimentos, public.despesas to authenticated;

create or replace function public.cadastrar_despesa(p_ordem_servico_id uuid, p_categoria public.despesa_categoria, p_descricao text, p_valor numeric(12,2), p_data_competencia date, p_observacoes text default null) returns public.despesas language plpgsql security definer set search_path = public as $$
declare desp public.despesas;
begin
  if not public.usuario_autorizado() then raise exception using errcode = '42501', message = 'Usuário não autorizado'; end if;
  if p_valor is null or p_valor <= 0 or p_descricao is null or length(trim(p_descricao)) = 0 then raise exception using errcode = '22023', message = 'Dados de despesa inválidos'; end if;
  insert into public.despesas(ordem_servico_id, categoria, descricao, valor, data_competencia, observacoes) values (p_ordem_servico_id, p_categoria, trim(p_descricao), p_valor, p_data_competencia, p_observacoes) returning * into desp;
  return desp;
end; $$;
revoke all on function public.cadastrar_despesa(uuid,public.despesa_categoria,text,numeric,date,text) from public;
grant execute on function public.cadastrar_despesa(uuid,public.despesa_categoria,text,numeric,date,text) to authenticated;

create or replace function public.atualizar_despesa(p_despesa_id uuid, p_descricao text default null, p_valor numeric(12,2) default null, p_data_competencia date default null, p_observacoes text default null) returns public.despesas language plpgsql security definer set search_path = public as $$
declare desp public.despesas;
begin
  if not public.usuario_autorizado() then raise exception using errcode = '42501', message = 'Usuário não autorizado'; end if;
  select * into desp from public.despesas where id = p_despesa_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'Despesa não encontrada'; end if;
  if desp.pago_em is not null or desp.cancelada_em is not null then raise exception using errcode = 'P0001', message = 'Despesa paga ou cancelada não pode ser alterada'; end if;
  update public.despesas set descricao = coalesce(nullif(trim(p_descricao), ''), descricao), valor = coalesce(p_valor, valor), data_competencia = coalesce(p_data_competencia, data_competencia), observacoes = coalesce(p_observacoes, observacoes) where id = p_despesa_id returning * into desp;
  return desp;
end; $$;
revoke all on function public.atualizar_despesa(uuid,text,numeric,date,text) from public;
grant execute on function public.atualizar_despesa(uuid,text,numeric,date,text) to authenticated;

create or replace function public.listar_clientes_devedores(p_busca text default null, p_limite integer default 100, p_offset integer default 0)
returns table (cliente_id uuid, cliente_nome text, telefone text, veiculo_id uuid, veiculo text, placa text, ordem_id uuid, ordem_numero bigint, total numeric, total_recebido numeric, saldo_pendente numeric, data_conclusao timestamptz)
language sql stable security invoker as $$
  select c.id, c.nome, c.telefone, v.id, concat_ws(' ', v.marca, v.modelo), v.placa, f.id, f.numero, f.total, f.total_recebido, f.saldo_pendente, f.data_conclusao
  from public.ordem_financeiro f join public.clientes c on c.id = f.cliente_id join public.veiculos v on v.id = f.veiculo_id
  where f.status in ('CONCLUIDA','ENTREGUE') and f.saldo_pendente > 0 and (p_busca is null or c.nome ilike '%' || p_busca || '%' or v.placa ilike '%' || p_busca || '%')
  order by f.saldo_pendente desc, f.data_conclusao asc nulls last limit greatest(least(p_limite, 500), 1) offset greatest(p_offset, 0);
$$;
grant execute on function public.listar_clientes_devedores(text,integer,integer) to authenticated;

create or replace function public.listar_clientes_devedores(p_busca text, p_limite integer, p_offset integer, p_cliente_id uuid)
returns table (cliente_id uuid, cliente_nome text, telefone text, veiculo_id uuid, veiculo text, placa text, ordem_id uuid, ordem_numero bigint, total numeric, total_recebido numeric, saldo_pendente numeric, data_conclusao timestamptz)
language sql stable security invoker as $$
  select c.id, c.nome, c.telefone, v.id, concat_ws(' ', v.marca, v.modelo), v.placa, f.id, f.numero, f.total, f.total_recebido, f.saldo_pendente, f.data_conclusao
  from public.ordem_financeiro f join public.clientes c on c.id = f.cliente_id join public.veiculos v on v.id = f.veiculo_id
  where f.status in ('CONCLUIDA','ENTREGUE') and f.saldo_pendente > 0 and (p_cliente_id is null or c.id = p_cliente_id) and (p_busca is null or c.nome ilike '%' || p_busca || '%' or v.placa ilike '%' || p_busca || '%')
  order by f.saldo_pendente desc, f.data_conclusao asc nulls last limit greatest(least(p_limite, 500), 1) offset greatest(p_offset, 0);
$$;
grant execute on function public.listar_clientes_devedores(text,integer,integer,uuid) to authenticated;

create or replace function public.dashboard_financeiro(p_inicio date, p_fim date) returns table (faturamento numeric, total_recebido numeric, a_receber numeric, custos_estimados numeric, despesas_pagas numeric, despesas_pendentes numeric, resultado_estimado numeric, fluxo_caixa_realizado numeric) language sql stable security invoker as $$
  with periodo as (select (p_inicio::timestamp at time zone 'America/Sao_Paulo') inicio, ((p_fim + 1)::timestamp at time zone 'America/Sao_Paulo') fim),
  ordens as (select * from public.ordem_financeiro where status <> 'CANCELADA'),
  receb as (select coalesce(sum(case when estorno_de is null then valor else -valor end),0) total from public.recebimentos, periodo where recebido_em >= periodo.inicio and recebido_em < periodo.fim),
  desp as (select coalesce(sum(valor) filter (where pago_em is not null and pago_em >= periodo.inicio and pago_em < periodo.fim),0) pagas, coalesce(sum(valor) filter (where pago_em is null and cancelada_em is null),0) pendentes, coalesce(sum(valor) filter (where cancelada_em is null and ordem_servico_id is null and data_competencia >= p_inicio and data_competencia <= p_fim),0) gerais from public.despesas, periodo)
  select coalesce(sum(total) filter (where status in ('CONCLUIDA','ENTREGUE') and data_conclusao >= periodo.inicio and data_conclusao < periodo.fim),0), (select total from receb), coalesce(sum(saldo_pendente) filter (where status in ('CONCLUIDA','ENTREGUE')),0), coalesce(sum(custo_itens),0), (select pagas from desp), (select pendentes from desp), coalesce(sum(total) filter (where status in ('CONCLUIDA','ENTREGUE') and data_conclusao >= periodo.inicio and data_conclusao < periodo.fim),0) - coalesce(sum(custo_itens) filter (where status in ('CONCLUIDA','ENTREGUE') and data_conclusao >= periodo.inicio and data_conclusao < periodo.fim),0) - (select gerais from desp), (select total from receb) - (select pagas from desp) from ordens, periodo;
$$;

create or replace function public.dashboard_resumo_financeiro(p_inicio date, p_fim date, p_cliente_id uuid default null, p_veiculo_id uuid default null, p_categoria public.despesa_categoria default null, p_situacao text default null)
returns table (faturamento numeric, total_recebido numeric, saldo_a_receber numeric, custos_estimados numeric, despesas_pagas numeric, despesas_pendentes numeric, resultado_estimado numeric, fluxo_caixa_realizado numeric)
language sql stable security invoker as $$
  with periodo as (select (p_inicio::timestamp at time zone 'America/Sao_Paulo') inicio, ((p_fim + 1)::timestamp at time zone 'America/Sao_Paulo') fim),
  ordens as (select f.* from public.ordem_financeiro f where f.status in ('CONCLUIDA','ENTREGUE') and (p_cliente_id is null or f.cliente_id = p_cliente_id) and (p_veiculo_id is null or f.veiculo_id = p_veiculo_id) and (p_situacao is null or f.status_financeiro = p_situacao)),
  receb as (select coalesce(sum(case when r.estorno_de is null then r.valor else -r.valor end), 0) total from public.recebimentos r join ordens o on o.id = r.ordem_servico_id, periodo where r.recebido_em >= periodo.inicio and r.recebido_em < periodo.fim),
  despesas as (select coalesce(sum(d.valor) filter (where d.pago_em is not null and d.pago_em >= periodo.inicio and d.pago_em < periodo.fim), 0) pagas, coalesce(sum(d.valor) filter (where d.pago_em is null), 0) pendentes, coalesce(sum(d.valor) filter (where d.ordem_servico_id is null and d.data_competencia between p_inicio and p_fim), 0) gerais from public.despesas d, periodo where d.cancelada_em is null and (p_categoria is null or d.categoria = p_categoria))
  select coalesce(sum(o.total) filter (where o.data_conclusao >= periodo.inicio and o.data_conclusao < periodo.fim), 0), (select total from receb), coalesce(sum(o.saldo_pendente), 0), coalesce(sum(o.custo_itens) filter (where o.data_conclusao >= periodo.inicio and o.data_conclusao < periodo.fim), 0), (select pagas from despesas), (select pendentes from despesas), coalesce(sum(o.total - o.custo_itens) filter (where o.data_conclusao >= periodo.inicio and o.data_conclusao < periodo.fim), 0) - (select gerais from despesas), (select total from receb) - (select pagas from despesas) from ordens o, periodo;
$$;
revoke all on function public.dashboard_resumo_financeiro(date,date,uuid,uuid,public.despesa_categoria,text) from public;
grant execute on function public.dashboard_resumo_financeiro(date,date,uuid,uuid,public.despesa_categoria,text) to authenticated;
