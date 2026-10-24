import { z } from 'zod';
export const orcamentoInputSchema = z.object({ cliente_id: z.string().uuid(), veiculo_id: z.string().uuid(), descricao_problema: z.string().trim().min(1), observacoes: z.string().optional(), desconto: z.number().finite().nonnegative().default(0) });
export const orcamentoItemInputSchema = z.object({ catalogo_item_id: z.string().uuid().nullable().optional(), tipo: z.enum(['PECA', 'MAO_DE_OBRA', 'SERVICO_TERCEIRO']), descricao: z.string().trim().min(1), quantidade: z.number().finite().positive(), custo_unitario: z.number().finite().nonnegative(), preco_unitario: z.number().finite().nonnegative() });
export type OrcamentoInput = z.infer<typeof orcamentoInputSchema>;
export type OrcamentoItemInput = z.infer<typeof orcamentoItemInputSchema>;
