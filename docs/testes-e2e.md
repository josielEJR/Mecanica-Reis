# Testes de interface

O build web é validado com `npm run web:build`. A suíte Vitest existente continua cobrindo domínio, serviços, integração Supabase local e PDFs. Playwright ainda não foi adicionado porque não há navegador instalado no ambiente atual; os fluxos E2E devem ser executados quando o navegador de CI estiver disponível, usando exclusivamente o Supabase local.
