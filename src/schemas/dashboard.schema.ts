import { z } from 'zod';
const periodoBaseSchema = z.object({ inicio: z.string().date(), fim: z.string().date() });
export const periodoSchema = periodoBaseSchema.refine((v) => v.inicio <= v.fim, 'Período inválido');
export const dashboardFiltroSchema = periodoBaseSchema.extend({ cliente_id: z.string().uuid().optional(), veiculo_id: z.string().uuid().optional(), categoria: z.enum(['PECA', 'MAO_DE_OBRA', 'SERVICO_TERCEIRO', 'DESPESA_GERAL']).optional(), situacao_financeira: z.enum(['NAO_RECEBIDO', 'PARCIAL', 'QUITADO']).optional() }).refine((v) => v.inicio <= v.fim, 'Período inválido');
export type DashboardFiltro = z.infer<typeof dashboardFiltroSchema>;
