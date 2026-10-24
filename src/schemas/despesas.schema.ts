import { z } from 'zod';
export const despesaInputSchema = z.object({ ordem_servico_id: z.string().uuid().nullable().optional(), categoria: z.enum(['PECA', 'MAO_DE_OBRA', 'SERVICO_TERCEIRO', 'DESPESA_GERAL']), descricao: z.string().trim().min(1), valor: z.union([z.string(), z.number()]), data_competencia: z.string().date(), observacoes: z.string().nullable().optional() });
export type DespesaInput = z.infer<typeof despesaInputSchema>;
