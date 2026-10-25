alter table public.recebimentos add column if not exists numero bigint generated always as identity;
create unique index if not exists recebimentos_numero_unico on public.recebimentos(numero);
