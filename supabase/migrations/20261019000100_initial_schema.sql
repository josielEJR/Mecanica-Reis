-- Mecanica-Reis / Etapa 01
-- Todos os timestamps são timestamptz (armazenados em UTC pelo PostgreSQL).

create extension if not exists pgcrypto;

create type public.catalogo_item_tipo as enum ('PECA', 'MAO_DE_OBRA', 'SERVICO_TERCEIRO');
create type public.orcamento_status as enum ('RASCUNHO', 'ENVIADO', 'APROVADO', 'REJEITADO', 'CANCELADO');
create type public.ordem_status as enum ('ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'ENTREGUE', 'CANCELADA');
create type public.despesa_categoria as enum ('PECA', 'MAO_DE_OBRA', 'SERVICO_TERCEIRO', 'DESPESA_GERAL');

create table public.oficina_autorizados (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.oficina_configuracoes (
  id uuid primary key default gen_random_uuid(),
  nome_fantasia text not null check (length(trim(nome_fantasia)) > 0),
  razao_social text,
  cpf_cnpj text,
  telefone text,
  endereco text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint oficina_configuracoes_unica check (id is not null)
);
create unique index oficina_configuracoes_apenas_uma on public.oficina_configuracoes ((true));

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) > 0),
  telefone text,
  cpf_cnpj text,
  email text,
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.veiculos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  marca text not null check (length(trim(marca)) > 0),
  modelo text not null check (length(trim(modelo)) > 0),
  ano integer check (ano is null or ano between 1886 and 2200),
  placa text,
  cor text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index veiculos_placa_unica on public.veiculos (upper(regexp_replace(placa, '[^A-Za-z0-9]', '', 'g'))) where placa is not null and length(trim(placa)) > 0;

create table public.catalogo_itens (
  id uuid primary key default gen_random_uuid(),
  tipo public.catalogo_item_tipo not null,
  descricao text not null check (length(trim(descricao)) > 0),
  custo_padrao numeric(12,2) not null default 0 check (custo_padrao >= 0),
  preco_padrao numeric(12,2) not null default 0 check (preco_padrao >= 0),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity unique,
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  veiculo_id uuid not null references public.veiculos(id) on delete restrict,
  descricao_problema text not null check (length(trim(descricao_problema)) > 0),
  observacoes text,
  status public.orcamento_status not null default 'RASCUNHO',
  desconto numeric(12,2) not null default 0 check (desconto >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  aprovado_em timestamptz
);

create table public.orcamento_itens (
  id uuid primary key default gen_random_uuid(),
  orcamento_id uuid not null references public.orcamentos(id) on delete cascade,
  catalogo_item_id uuid references public.catalogo_itens(id) on delete set null,
  tipo public.catalogo_item_tipo not null,
  descricao text not null check (length(trim(descricao)) > 0),
  quantidade numeric(12,3) not null check (quantidade > 0),
  custo_unitario numeric(12,2) not null check (custo_unitario >= 0),
  preco_unitario numeric(12,2) not null check (preco_unitario >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ordens_servico (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity unique,
  orcamento_id uuid unique references public.orcamentos(id) on delete restrict,
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  veiculo_id uuid not null references public.veiculos(id) on delete restrict,
  descricao_problema text not null check (length(trim(descricao_problema)) > 0),
  diagnostico text,
  descricao_servico text,
  observacoes text,
  status public.ordem_status not null default 'ABERTA',
  desconto numeric(12,2) not null default 0 check (desconto >= 0),
  data_entrada timestamptz not null default now(),
  data_conclusao timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ordem_servico_itens (
  id uuid primary key default gen_random_uuid(),
  ordem_servico_id uuid not null references public.ordens_servico(id) on delete cascade,
  catalogo_item_id uuid references public.catalogo_itens(id) on delete set null,
  tipo public.catalogo_item_tipo not null,
  descricao text not null check (length(trim(descricao)) > 0),
  quantidade numeric(12,3) not null check (quantidade > 0),
  custo_unitario numeric(12,2) not null check (custo_unitario >= 0),
  preco_unitario numeric(12,2) not null check (preco_unitario >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recebimentos (
  id uuid primary key default gen_random_uuid(),
  ordem_servico_id uuid not null references public.ordens_servico(id) on delete restrict,
  valor numeric(12,2) not null check (valor > 0),
  recebido_em timestamptz not null default now(),
  observacoes text,
  estorno_de uuid unique references public.recebimentos(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.despesas (
  id uuid primary key default gen_random_uuid(),
  ordem_servico_id uuid references public.ordens_servico(id) on delete restrict,
  categoria public.despesa_categoria not null,
  descricao text not null check (length(trim(descricao)) > 0),
  valor numeric(12,2) not null check (valor > 0),
  data_competencia date not null,
  pago_em timestamptz,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index veiculos_cliente_id_idx on public.veiculos(cliente_id);
create index orcamentos_cliente_id_idx on public.orcamentos(cliente_id);
create index orcamentos_veiculo_id_idx on public.orcamentos(veiculo_id);
create index ordem_servico_cliente_id_idx on public.ordens_servico(cliente_id);
create index ordem_servico_veiculo_id_idx on public.ordens_servico(veiculo_id);
create index recebimentos_ordem_id_idx on public.recebimentos(ordem_servico_id);
create index despesas_competencia_idx on public.despesas(data_competencia);

create or replace function public.atualizar_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger oficina_configuracoes_updated_at before update on public.oficina_configuracoes for each row execute function public.atualizar_updated_at();
create trigger clientes_updated_at before update on public.clientes for each row execute function public.atualizar_updated_at();
create trigger veiculos_updated_at before update on public.veiculos for each row execute function public.atualizar_updated_at();
create trigger catalogo_itens_updated_at before update on public.catalogo_itens for each row execute function public.atualizar_updated_at();
create trigger orcamentos_updated_at before update on public.orcamentos for each row execute function public.atualizar_updated_at();
create trigger orcamento_itens_updated_at before update on public.orcamento_itens for each row execute function public.atualizar_updated_at();
create trigger ordens_servico_updated_at before update on public.ordens_servico for each row execute function public.atualizar_updated_at();
create trigger ordem_servico_itens_updated_at before update on public.ordem_servico_itens for each row execute function public.atualizar_updated_at();
create trigger despesas_updated_at before update on public.despesas for each row execute function public.atualizar_updated_at();

create or replace function public.usuario_autorizado() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.oficina_autorizados where user_id = (select auth.uid()) and ativo);
$$;
revoke all on function public.usuario_autorizado() from public;
grant execute on function public.usuario_autorizado() to authenticated;

create or replace function public.validar_cliente_veiculo() returns trigger language plpgsql as $$
begin
  if not exists (select 1 from public.veiculos v where v.id = new.veiculo_id and v.cliente_id = new.cliente_id) then
    raise exception 'O veículo não pertence ao cliente informado';
  end if;
  return new;
end; $$;
create trigger validar_orcamento_cliente_veiculo before insert or update on public.orcamentos for each row execute function public.validar_cliente_veiculo();
create trigger validar_ordem_cliente_veiculo before insert or update on public.ordens_servico for each row execute function public.validar_cliente_veiculo();

create or replace function public.validar_desconto() returns trigger language plpgsql as $$
declare subtotal numeric(12,2);
begin
  select coalesce(sum(quantidade * preco_unitario), 0)::numeric(12,2) into subtotal from public.ordem_servico_itens where ordem_servico_id = new.id;
  if new.desconto > subtotal then raise exception 'Desconto não pode superar o subtotal da ordem'; end if;
  return new;
end; $$;
create trigger validar_desconto_ordem before insert or update of desconto on public.ordens_servico for each row execute function public.validar_desconto();

create or replace function public.validar_desconto_item() returns trigger language plpgsql as $$
declare desconto_atual numeric(12,2); subtotal_atual numeric(12,2); ordem_id uuid;
begin
  ordem_id := coalesce(new.ordem_servico_id, old.ordem_servico_id);
  select desconto into desconto_atual from public.ordens_servico where id = ordem_id;
  select coalesce(sum(quantidade * preco_unitario), 0)::numeric(12,2) into subtotal_atual from public.ordem_servico_itens where ordem_servico_id = ordem_id and id <> coalesce(new.id, old.id);
  if tg_op <> 'DELETE' then subtotal_atual := subtotal_atual + new.quantidade * new.preco_unitario; end if;
  if desconto_atual > subtotal_atual then raise exception 'Desconto não pode superar o subtotal da ordem'; end if;
  return coalesce(new, old);
end; $$;
create trigger validar_desconto_itens before insert or update or delete on public.ordem_servico_itens for each row execute function public.validar_desconto_item();

create or replace function public.validar_status_ordem() returns trigger language plpgsql as $$
begin
  if old.status in ('CONCLUIDA','ENTREGUE','CANCELADA') and (new.status <> old.status or new.desconto <> old.desconto or new.cliente_id <> old.cliente_id or new.veiculo_id <> old.veiculo_id) then
    raise exception 'Ordem concluída, entregue ou cancelada exige procedimento auditável';
  end if;
  if new.status = 'CONCLUIDA' and old.status <> 'CONCLUIDA' then new.data_conclusao = coalesce(new.data_conclusao, now()); end if;
  if new.status = 'CANCELADA' and exists (select 1 from public.recebimentos where ordem_servico_id = new.id and estorno_de is null) then
    raise exception 'Não é permitido cancelar ordem com recebimentos; faça estorno auditável';
  end if;
  return new;
end; $$;
create trigger validar_status_ordem before update on public.ordens_servico for each row execute function public.validar_status_ordem();

create or replace function public.bloquear_ordem_faturada() returns trigger language plpgsql as $$
declare status_atual public.ordem_status;
begin
  select status into status_atual from public.ordens_servico where id = coalesce(new.ordem_servico_id, old.ordem_servico_id);
  if status_atual in ('CONCLUIDA','ENTREGUE','CANCELADA') then raise exception 'Ordem faturada, entregue ou cancelada não pode ser alterada financeiramente'; end if;
  return coalesce(new, old);
end; $$;
create trigger bloquear_item_ordem_faturada before insert or update or delete on public.ordem_servico_itens for each row execute function public.bloquear_ordem_faturada();

create or replace view public.ordem_financeiro as
select o.id, o.numero, o.cliente_id, o.veiculo_id, o.status, o.desconto, o.data_entrada, o.data_conclusao,
  coalesce(i.subtotal, 0)::numeric(12,2) as subtotal,
  (coalesce(i.subtotal, 0) - o.desconto)::numeric(12,2) as total,
  coalesce(i.custo_itens, 0)::numeric(12,2) as custo_itens,
  coalesce(r.total_recebido, 0)::numeric(12,2) as total_recebido,
  (coalesce(i.subtotal, 0) - o.desconto - coalesce(r.total_recebido, 0))::numeric(12,2) as saldo_pendente,
  case when coalesce(r.total_recebido, 0) = 0 then 'NAO_RECEBIDO' when coalesce(r.total_recebido, 0) < coalesce(i.subtotal, 0) - o.desconto then 'PARCIAL' else 'QUITADO' end as status_financeiro
from public.ordens_servico o
left join lateral (select sum(quantidade * preco_unitario) as subtotal, sum(quantidade * custo_unitario) as custo_itens from public.ordem_servico_itens where ordem_servico_id = o.id) i on true
left join lateral (select sum(valor) as total_recebido from public.recebimentos where ordem_servico_id = o.id and estorno_de is null) r on true;

create or replace function public.adicionar_recebimento(p_ordem_servico_id uuid, p_valor numeric(12,2), p_recebido_em timestamptz default now(), p_observacoes text default null) returns public.recebimentos language plpgsql security definer set search_path = public as $$
declare ordem public.ordens_servico; total_ordem numeric(12,2); recebido numeric(12,2); novo public.recebimentos;
begin
  if not public.usuario_autorizado() then raise exception 'Usuário não autorizado'; end if;
  if p_valor is null or p_valor <= 0 then raise exception 'Valor do recebimento deve ser maior que zero'; end if;
  select * into ordem from public.ordens_servico where id = p_ordem_servico_id for update;
  if not found then raise exception 'Ordem não encontrada'; end if;
  if ordem.status = 'CANCELADA' then raise exception 'Não é permitido receber em ordem cancelada'; end if;
  select total into total_ordem from public.ordem_financeiro where id = p_ordem_servico_id;
  select coalesce(sum(valor), 0) into recebido from public.recebimentos where ordem_servico_id = p_ordem_servico_id and estorno_de is null;
  if recebido + p_valor > total_ordem then raise exception 'Recebimento supera o saldo da ordem'; end if;
  insert into public.recebimentos(ordem_servico_id, valor, recebido_em, observacoes) values (p_ordem_servico_id, p_valor, p_recebido_em, p_observacoes) returning * into novo;
  return novo;
end; $$;
revoke all on function public.adicionar_recebimento(uuid, numeric, timestamptz, text) from public;
grant execute on function public.adicionar_recebimento(uuid, numeric, timestamptz, text) to authenticated;

create or replace function public.dashboard_financeiro(p_inicio date, p_fim date) returns table (faturamento numeric, total_recebido numeric, a_receber numeric, custos_estimados numeric, despesas_pagas numeric, despesas_pendentes numeric, resultado_estimado numeric, fluxo_caixa_realizado numeric) language sql stable security invoker as $$
  with periodo as (select (p_inicio::timestamp at time zone 'America/Sao_Paulo') inicio, ((p_fim + 1)::timestamp at time zone 'America/Sao_Paulo') fim),
  ordens as (select * from public.ordem_financeiro where status <> 'CANCELADA'),
  receb as (select coalesce(sum(valor),0) total from public.recebimentos, periodo where estorno_de is null and recebido_em >= periodo.inicio and recebido_em < periodo.fim),
  desp as (select coalesce(sum(valor) filter (where pago_em is not null and pago_em >= periodo.inicio and pago_em < periodo.fim),0) pagas, coalesce(sum(valor) filter (where pago_em is null),0) pendentes from public.despesas, periodo)
  select coalesce(sum(total) filter (where status in ('CONCLUIDA','ENTREGUE') and data_conclusao >= periodo.inicio and data_conclusao < periodo.fim),0), (select total from receb), coalesce(sum(saldo_pendente) filter (where status in ('CONCLUIDA','ENTREGUE')),0), coalesce(sum(custo_itens),0), (select pagas from desp), (select pendentes from desp), coalesce(sum(total - custo_itens),0), (select total from receb) - (select pagas from desp) from ordens, periodo;
$$;

alter table public.oficina_autorizados enable row level security;
alter table public.oficina_configuracoes enable row level security;
alter table public.clientes enable row level security;
alter table public.veiculos enable row level security;
alter table public.catalogo_itens enable row level security;
alter table public.orcamentos enable row level security;
alter table public.orcamento_itens enable row level security;
alter table public.ordens_servico enable row level security;
alter table public.ordem_servico_itens enable row level security;
alter table public.recebimentos enable row level security;
alter table public.despesas enable row level security;

create policy oficina_configuracoes_autorizada on public.oficina_configuracoes for all to authenticated using (public.usuario_autorizado()) with check (public.usuario_autorizado());
create policy clientes_autorizada on public.clientes for all to authenticated using (public.usuario_autorizado()) with check (public.usuario_autorizado());
create policy veiculos_autorizada on public.veiculos for all to authenticated using (public.usuario_autorizado()) with check (public.usuario_autorizado());
create policy catalogo_itens_autorizada on public.catalogo_itens for all to authenticated using (public.usuario_autorizado()) with check (public.usuario_autorizado());
create policy orcamentos_autorizada on public.orcamentos for all to authenticated using (public.usuario_autorizado()) with check (public.usuario_autorizado());
create policy orcamento_itens_autorizada on public.orcamento_itens for all to authenticated using (public.usuario_autorizado()) with check (public.usuario_autorizado());
create policy ordens_servico_autorizada on public.ordens_servico for all to authenticated using (public.usuario_autorizado()) with check (public.usuario_autorizado());
create policy ordem_servico_itens_autorizada on public.ordem_servico_itens for all to authenticated using (public.usuario_autorizado()) with check (public.usuario_autorizado());
create policy recebimentos_leitura_autorizada on public.recebimentos for select to authenticated using (public.usuario_autorizado());
create policy despesas_autorizada on public.despesas for all to authenticated using (public.usuario_autorizado()) with check (public.usuario_autorizado());

revoke all on public.oficina_autorizados from anon, authenticated;
revoke all on public.recebimentos from anon, authenticated;
grant select on public.ordem_financeiro to authenticated;
grant execute on function public.dashboard_financeiro(date, date) to authenticated;
