# Front-end web

A aplicação React fica em `apps/web` e usa Vite, React Router, TanStack Query e o cliente oficial do Supabase. O código Node existente em `src/` não é importado pelo bundle do navegador; o front-end possui um cliente Supabase próprio com variáveis `VITE_`.

## Executar

```bash
cp apps/web/.env.example apps/web/.env.local
# preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY com `npx supabase status`
npm run web:dev
```

O build de produção é `npm run web:build` e gera `dist-web/`. A chave `service_role` nunca deve ser colocada em `.env.local`.

## Estrutura e segurança

- `src/main.tsx`: rotas, layout e telas operacionais.
- `src/lib/supabase.ts`: cliente anon com sessão persistente.
- `src/lib/api.ts`: consultas autorizadas ao PostgREST/RPC.
- `src/styles.css`: tokens visuais e responsividade mobile-first.

`Protected` exige sessão válida antes de renderizar as rotas. O login chama `usuario_autorizado`; RLS continua sendo a barreira efetiva no banco. No logout, o cache privado do TanStack Query é limpo.

## Estado atual

Estão disponíveis login, navegação, início com indicadores reais, clientes com pesquisa, serviços/ordens, financeiro e páginas de catálogo/configurações. Os formulários completos de criação/edição, recebimento, despesas e integração visual dos PDFs devem ser conectados aos services existentes na próxima iteração da Etapa 05; as rotas já estão preparadas sem simular gravações ou documentos.
