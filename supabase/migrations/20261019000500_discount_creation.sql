-- Permite criar um orçamento/ordem com desconto antes dos itens; o trigger
-- de itens impede que o subtotal final fique abaixo do desconto.
create or replace function public.validar_desconto() returns trigger language plpgsql as $$
declare subtotal numeric(12,2); possui_itens boolean;
begin
  select exists (select 1 from public.ordem_servico_itens where ordem_servico_id = new.id), coalesce(sum(quantidade * preco_unitario), 0)::numeric(12,2)
    into possui_itens, subtotal from public.ordem_servico_itens where ordem_servico_id = new.id;
  if possui_itens and new.desconto > subtotal then raise exception 'Desconto não pode superar o subtotal da ordem'; end if;
  return new;
end; $$;
