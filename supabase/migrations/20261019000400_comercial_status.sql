create or replace function public.validar_status_orcamento() returns trigger language plpgsql as $$
begin
  if old.status = 'RASCUNHO' and new.status not in ('RASCUNHO','ENVIADO','CANCELADO') then raise exception 'Transição de orçamento inválida'; end if;
  if old.status = 'ENVIADO' and new.status not in ('ENVIADO','APROVADO','REJEITADO','CANCELADO') then raise exception 'Transição de orçamento inválida'; end if;
  if old.status in ('APROVADO','REJEITADO','CANCELADO') and new.status <> old.status then raise exception 'Orçamento em estado final não pode mudar de status'; end if;
  if new.status = 'APROVADO' and old.status <> 'APROVADO' then new.aprovado_em = coalesce(new.aprovado_em, now()); end if;
  if old.status = 'APROVADO' and (new.cliente_id <> old.cliente_id or new.veiculo_id <> old.veiculo_id or new.descricao_problema <> old.descricao_problema or new.desconto <> old.desconto) then raise exception 'Orçamento aprovado exige revisão explícita'; end if;
  return new;
end; $$;
create trigger validar_status_orcamento before update on public.orcamentos for each row execute function public.validar_status_orcamento();

create or replace function public.bloquear_item_orcamento_final() returns trigger language plpgsql as $$
declare estado public.orcamento_status; id_orc uuid;
begin
  id_orc := coalesce(new.orcamento_id, old.orcamento_id);
  select status into estado from public.orcamentos where id = id_orc;
  if estado in ('APROVADO','REJEITADO','CANCELADO') then raise exception 'Itens de orçamento finalizado não podem ser alterados'; end if;
  return coalesce(new, old);
end; $$;
create trigger bloquear_item_orcamento_final before insert or update or delete on public.orcamento_itens for each row execute function public.bloquear_item_orcamento_final();
