import { z } from 'zod';
export const recebimentoInputSchema = z.object({ ordem_servico_id: z.string().uuid(), valor: z.union([z.string(), z.number()]), recebido_em: z.string().datetime().optional(), observacoes: z.string().nullable().optional(), idempotency_key: z.string().trim().min(1).max(128).optional() });
export const estornoInputSchema = z.object({ recebimento_id: z.string().uuid(), estornado_em: z.string().datetime().optional(), observacoes: z.string().nullable().optional() });
export type RecebimentoInput = z.infer<typeof recebimentoInputSchema>;
export type EstornoInput = z.infer<typeof estornoInputSchema>;
