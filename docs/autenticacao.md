# Autenticação e autorização

`AuthService` usa Supabase Auth real: `entrar`, `sair`, `obterSessao`, `obterUsuarioAtual` e `verificarAutorizacao`. A identidade é verificada por `auth.getUser()` e a autorização é consultada pelo PostgreSQL em `usuario_autorizado`, que valida o UID em `oficina_autorizados`.

Repositories comuns usam apenas `SUPABASE_ANON_KEY` e a sessão atual. A `SERVICE_ROLE_KEY` não é necessária para operações comerciais; scripts de preparação de integração usam a chave administrativa somente para criar o usuário fictício local e autorizá-lo.
