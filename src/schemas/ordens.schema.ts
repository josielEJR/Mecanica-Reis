import { z } from 'zod';
import { orcamentoItemInputSchema } from './orcamentos.schema.js';
export const ordemInputSchema = z.object({ cliente_id: z.string().uuid(), veiculo_id: z.string().uuid(), descricao_problema: z.string().trim().min(1), diagnostico: z.string().optional(), descricao_servico: z.string().optional(), observacoes: z.string().optional(), desconto: z.number().finite().nonnegative().default(0) });
export const ordemItemInputSchema = orcamentoItemInputSchema;
export type OrdemInput = z.infer<typeof ordemInputSchema>;
export type OrdemItemInput = z.infer<typeof ordemItemInputSchema>;
