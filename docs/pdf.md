# Documentos PDF

Os documentos usam `@react-pdf/renderer` com React somente como runtime de templates. Não há telas, DOM, servidor ou dependência de navegador. `PdfService` exige Auth/RLS, consulta dados pela camada `PdfDataRepository`, transforma os registros em DTOs privados e renderiza bytes `application/pdf`.

Templates disponíveis:

- `OrcamentoPDF`: orçamento comercial, sem custos internos.
- `OrdemServicoPDF`: ordem com problema, diagnóstico, serviço, status e assinaturas em branco.
- `ReciboPDF`: recibo de um lançamento válido.
- `DemonstrativoRecebimentosPDF`: histórico líquido de recebimentos e estornos.

```ts
const service = new PdfService(new PdfDataRepository(db), new AuthService(db));
const arquivo = await service.gerarOrcamentoPDF(orcamentoId);
// arquivo.bytes, arquivo.filename e arquivo.contentType
```

Moedas e subtotais de apresentação usam conversão exata para centavos em [moeda.ts](../src/pdf/formatters/moeda.ts). Datas usam `America/Sao_Paulo` e `pt-BR`. Logos externos não são carregados: somente data URLs PNG/JPEG em base64 dentro do limite definido são aceitos.

Para gerar exemplos fictícios:

```bash
npm run pdf:examples
```

Os arquivos são gravados em `examples/pdf/` e não consultam o Supabase. Em uma futura aplicação React/PWA, o mesmo `PdfService` pode ser chamado por uma camada de download sem alterar os templates.
