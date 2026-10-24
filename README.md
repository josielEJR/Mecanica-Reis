# Mecanica-Reis

Sistema de gestão para oficina mecânica.

## Tecnologias

- TypeScript
- Supabase
- PostgreSQL
- Node.js LTS, Vitest e Supabase CLI

## Funcionalidades planejadas

- Cadastro de clientes e veículos
- Orçamentos e ordens de serviço
- Geração de documentos PDF
- Controle financeiro
- Acompanhamento de pagamentos pendentes

## Desenvolvimento local (ETAPAS 01 e 02)

Pré-requisitos: Node.js LTS, Docker e Supabase CLI. O ambiente atual deste repositório não possui Docker nem o binário global do Supabase CLI, então a aplicação das migrations precisa ser executada em uma máquina com esses componentes.

```bash
npm install
npx supabase start
npm run db:reset
npm test
npm run build
```

Para configurar um usuário local, crie-o no Auth e insira seu UUID em `oficina_autorizados` usando o SQL Editor/credencial de serviço. Nunca versionar credenciais; use `.env.example` como referência. A camada comercial está em `src/repositories`, `src/services`, `src/schemas` e `src/types`.

Comandos adicionais: `npm run test:unit`, `npm run test:integration`, `npm run db:test` e `npm run db:types`. Os testes de integração só são habilitados quando `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_TEST_EMAIL` e `SUPABASE_TEST_PASSWORD` são fornecidos para um ambiente de desenvolvimento descartável.

## Desenvolvimento

Projeto desenvolvido em etapas com auxílio do Codex.
