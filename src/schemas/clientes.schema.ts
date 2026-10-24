import { z } from 'zod';
export const clienteInputSchema = z.object({ nome: z.string().trim().min(1), telefone: z.string().trim().nullable().optional().default(null), cpf_cnpj: z.string().trim().nullable().optional().default(null), email: z.string().email().nullable().optional().default(null), observacoes: z.string().nullable().optional().default(null) });
export type ClienteInput = z.infer<typeof clienteInputSchema>;
