# Homologação da Fase E

## Ambiente

Os testes E2E usam Playwright, Chromium local e o Vite em `http://127.0.0.1:4173`. As credenciais são lidas de `.env.test`, que é ignorado pelo Git. O navegador usa apenas a chave pública do Supabase configurada no bundle web; nenhuma `service_role` é usada pelo teste de navegador.

```bash
npm run db:integration:setup
npm run test:e2e
```

O Playwright gera relatório em `playwright-report/`, screenshots e traces de falhas em `test-results/`; esses diretórios não são versionados.

## Cenários automatizados

`tests/e2e/smoke.spec.ts` cobre login inválido, login autorizado, persistência após reload, logout, proteção de rota, abertura do popup de cliente, validação de marca/modelo do veículo, acesso ao catálogo e ausência de rolagem horizontal em três viewports.

Os testes que gravam dados comerciais e financeiros continuam cobertos pelas suítes de integração Supabase existentes. A suíte E2E não cria dados persistentes: o cenário de cliente interrompe antes do salvamento para validar a regra obrigatória do veículo.

## Limitação deste ambiente

O pacote Playwright e o Chromium foram instalados, mas a execução do Chromium requer bibliotecas nativas (incluindo `libnspr4.so`). `npx playwright install-deps chromium` não pôde instalar essas bibliotecas porque o ambiente não fornece senha sudo. Assim, a configuração está pronta, porém a execução E2E permanece bloqueada até que as dependências do sistema sejam instaladas por um administrador ou em CI.

## Critério de liberação

Antes da publicação, executar `npm run test:e2e` em uma máquina/CI com Chromium funcional, além de `npm test`, `npm run db:test`, `npm run build` e `npm run web:build`, e inspecionar os screenshots dos viewports mobile e desktop.
