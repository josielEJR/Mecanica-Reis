# Testes de interface

## Situação atual

Os fluxos de PDF foram integrados ao navegador por `apps/web/src/pdf.tsx` e podem ser validados manualmente no servidor Vite local. Playwright ainda não está instalado no repositório nem há navegador disponível neste ambiente; por isso nenhum teste E2E é declarado como executado nesta etapa. Quando o navegador de CI estiver disponível, instalar Playwright e cobrir login, cadastro, orçamento, ordem, recebimentos e ações de PDF contra o Supabase local.

O build web é validado com `npm run web:build`. A suíte Vitest existente continua cobrindo domínio, serviços, integração Supabase local e PDFs. Playwright ainda não foi adicionado porque não há navegador instalado no ambiente atual; os fluxos E2E devem ser executados quando o navegador de CI estiver disponível, usando exclusivamente o Supabase local.
