# API de serviços

Os serviços recebem um `AppSupabaseClient` criado por `createSupabaseClient()`. O cliente usa somente `SUPABASE_URL` e `SUPABASE_ANON_KEY`; a sessão deve ser obtida pelo Supabase Auth antes das chamadas. Não existe fallback local que ignore RLS.

```ts
import { createSupabaseClient } from './src/lib/supabase.js';
import { ClientesRepository } from './src/repositories/clientes.repository.js';
import { ClientesService } from './src/services/clientes.service.js';

const db = createSupabaseClient();
const clientes = new ClientesService(new ClientesRepository(db));
const cliente = await clientes.cadastrarCliente({ nome: 'João da Silva', telefone: null, cpf_cnpj: null, email: null, observacoes: null });
```

As classes em `src/repositories` fazem apenas acesso ao Supabase. As classes em `src/services` validam entrada, coordenam fluxos e traduzem erros para `DomainError`. Regras financeiras críticas continuam no PostgreSQL.

Para o financeiro, use `RecebimentosService` para registrar/estornar lançamentos com chave idempotente, `DespesasService` para criar, pagar e cancelar despesas e `DashboardService` para resumos, devedores e fluxo de caixa. Valores aceitos pelos schemas financeiros podem ser strings decimais, como `'125.90'`; o domínio converte-os para centavos antes de enviá-los ao banco.
