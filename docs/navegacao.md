# Navegação

Rotas públicas: `/login`.

Rotas protegidas: `/`, `/servicos`, `/clientes`, `/financeiro`, `/catalogo`, `/configuracoes`, `/ordens/nova` e `/orcamentos/novo`.

Em telas de até 800px a navegação vira barra inferior com quatro áreas principais; em telas maiores usa menu lateral. A navegação não duplica autorização: todos os dados continuam sujeitos ao Supabase Auth e RLS.
