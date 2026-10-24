import { z } from 'zod';
export const veiculoInputSchema = z.object({ cliente_id: z.string().uuid(), marca: z.string().trim().min(1), modelo: z.string().trim().min(1), ano: z.number().int().min(1886).max(2200).nullable().optional().default(null), placa: z.string().trim().nullable().optional().default(null), cor: z.string().trim().nullable().optional().default(null), observacoes: z.string().nullable().optional().default(null) });
export type VeiculoInput = z.infer<typeof veiculoInputSchema>;
export const normalizePlaca = (placa?: string | null): string | null => { const value = placa?.replace(/[^a-z0-9]/gi, '').toUpperCase() ?? ''; return value || null; };
