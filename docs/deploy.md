# Preparação para publicação

Esta documentação prepara o Mecanica-Reis para Supabase Cloud e Cloudflare Pages. Nenhum comando abaixo aplica migrations ou publica o site automaticamente; os passos de produção devem ser executados manualmente, após revisão e autorização.

## Ambientes

### Local

- Supabase local em `http://127.0.0.1:54321`.
- Variáveis de testes no `.env.test` (ignorado pelo Git).
- Variáveis do navegador em `apps/web/.env.local` (ignorado pelo Git).

### Produção

- Projeto Supabase Cloud separado do projeto local.
- Cloudflare Pages com HTTPS.
- Usuário real criado pelo fluxo seguro do Supabase Auth e incluído em `oficina_autorizados` por um administrador.
- Nenhum dado de `seed.sql` deve ser copiado para produção.

Variáveis públicas necessárias no Cloudflare Pages:

```text
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

A chave publishable/anon pode estar no bundle do navegador porque o acesso é protegido por Auth e RLS. Nunca configure `SUPABASE_SERVICE_ROLE_KEY`, senha de banco ou token administrativo no Cloudflare Pages.

## Supabase Cloud — procedimento controlado

1. Crie um projeto Cloud separado e guarde o project ref.
2. Instale/autentique a CLI: `npx supabase login`.
3. Vincule explicitamente o repositório: `npx supabase link --project-ref SEU_PROJECT_REF`.
4. Confira o estado antes de alterar: `npx supabase migration list --linked`.
5. Revise a lista em `supabase/migrations/` e o SQL que será aplicado.
6. Faça um backup/exportação conforme a seção de backup abaixo.
7. Somente após aprovação explícita, aplique: `npx supabase db push --linked`.
8. Confirme novamente as migrations: `npx supabase migration list --linked`.
9. Valide no SQL Editor/RLS que `oficina_autorizados` está preenchida apenas com o UID autorizado.

Não use `db reset` contra o projeto Cloud. Não execute `db push --linked` sem revisar o plano e confirmar o projeto selecionado.

### Usuário autorizado

Crie o usuário no Auth Dashboard (ou em um procedimento administrativo protegido) e obtenha o UUID. Insira somente esse UUID na tabela `public.oficina_autorizados`, usando uma conexão administrativa segura. Não conceda acesso direto à tabela a `anon` ou `authenticated`.

Depois, valide com o cliente público: login do usuário autorizado, leitura de uma tabela protegida e rejeição de um usuário autenticado sem registro em `oficina_autorizados`.

No projeto Cloud, desative o cadastro público (`Authentication > Providers > Email > Allow new users`) depois de criar o usuário inicial. Não remova o usuário autorizado existente.

Em `Authentication > URL Configuration`, configure a URL do Cloudflare Pages como `Site URL` e adicione a mesma origem (incluindo o domínio customizado, se houver) às URLs de redirecionamento permitidas. Não deixe `127.0.0.1` como URL principal de produção.

## Cloudflare Pages

Configuração recomendada no projeto conectado ao GitHub:

- **Root directory:** `/` (raiz do repositório).
- **Build command:** `npm run web:build`.
- **Build output directory:** `dist-web`.
- **Node version:** `22` (variável `NODE_VERSION=22`, compatível com `.nvmrc`).
- **Variáveis:** `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` como Production variables.

O arquivo `apps/web/public/_redirects` é copiado para `dist-web/_redirects` e mantém as rotas SPA, como `/clientes` e `/financeiro`, funcionando após atualização direta.

Antes de publicar, execute localmente:

```bash
npm ci
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co \
VITE_SUPABASE_ANON_KEY=sb_publishable_... \
npm run verify:production
```

O verificador confirma manifesto/ícones e falha se encontrar URLs locais ou credenciais privadas nos arquivos do bundle.

## PWA e cache

O manifesto define `standalone`, `start_url`, `scope`, ícones 192/512 e a identidade visual da oficina. O service worker (`/sw.js`) limita o cache a recursos estáticos do próprio site. Não cacheia respostas do Supabase, sessões, clientes, ordens, recebimentos ou despesas.

O HTTPS fornecido pelo Cloudflare Pages é necessário para instalação PWA fora de `localhost`. Após cada alteração do frontend, incremente `CACHE_NAME` em `apps/web/public/sw.js` para invalidar os assets antigos de forma controlada.

## Backup e restauração

O backup deve ficar fora do repositório e fora do diretório público do site, com criptografia, controle de acesso e retenção definida. Um procedimento administrativo típico é:

```bash
# Execute somente com o projeto explicitamente vinculado e credenciais seguras.
npx supabase db dump --linked -f /caminho/seguro/mecanica-reis-YYYY-MM-DD.sql
```

Regras mínimas: backup diário, retenção de 30 dias, cópia externa protegida e teste mensal de restauração em projeto isolado. Nunca versione dumps, tokens ou credenciais. A restauração deve ser validada primeiro em um projeto não produtivo; não substitua o banco de produção sem janela aprovada e plano de rollback.

## Checklist de publicação

### Preparado no repositório

- [x] Build web em `dist-web`.
- [x] Variáveis do navegador separadas por ambiente.
- [x] Fallback SPA para Cloudflare Pages.
- [x] Manifesto e service worker sem cache de dados privados.
- [x] Verificação de bundle e manifesto (`npm run verify:production`).
- [x] Node documentado em `.nvmrc`.
- [x] Estratégia de backup e restauração documentada.

### Execução manual pendente

- [ ] Criar projeto Supabase Cloud separado.
- [ ] Revisar e aplicar migrations no projeto correto.
- [ ] Validar RLS, RPCs e usuário autorizado.
- [ ] Desativar cadastro público após criar o usuário inicial.
- [ ] Configurar variáveis no Cloudflare Pages.
- [ ] Publicar e validar HTTPS, login, rotas e PDFs.
- [ ] Configurar backups externos e testar restauração.
- [ ] Instalar a PWA em Android e validar atualização do cache.

## Riscos e limitações

- O plano gratuito do Supabase possui limites de banco, Auth, armazenamento e disponibilidade; monitore-os antes de uso real.
- A geração de PDF ocorre no navegador e depende de recursos autorizados da sessão atual.
- O cache PWA é somente de recursos estáticos; a aplicação não oferece operação financeira offline.
- Não há deploy, vínculo Cloud ou backup produtivo executado nesta etapa.
