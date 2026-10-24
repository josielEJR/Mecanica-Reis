import { z } from 'zod';
export const catalogoItemInputSchema = z.object({ tipo: z.enum(['PECA', 'MAO_DE_OBRA', 'SERVICO_TERCEIRO']), descricao: z.string().trim().min(1), custo_padrao: z.number().finite().nonnegative(), preco_padrao: z.number().finite().nonnegative() });
export type CatalogoItemInput = z.infer<typeof catalogoItemInputSchema>;
