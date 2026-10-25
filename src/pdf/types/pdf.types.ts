import type { CatalogoItemTipo, OrdemStatus } from '../../types/database.types.js';

export interface OficinaPdf { nome_fantasia: string; razao_social?: string | null; cpf_cnpj?: string | null; telefone?: string | null; endereco?: string | null; logo_url?: string | null }
export interface ClientePdf { nome: string; telefone?: string | null; cpf_cnpj?: string | null }
export interface VeiculoPdf { marca: string; modelo: string; placa?: string | null; ano?: number | null; cor?: string | null }
export interface PdfItem { tipo: CatalogoItemTipo; descricao: string; quantidade: string; preco_unitario: string; subtotal: string }
export interface OrcamentoPdfData { oficina: OficinaPdf; numero: number; emitido_em: string; cliente: ClientePdf; veiculo: VeiculoPdf; descricao_problema: string; observacoes?: string | null; status: string; desconto: string; total: string; itens: PdfItem[] }
export interface OrdemPdfData { oficina: OficinaPdf; numero: number; data_entrada: string; data_conclusao?: string | null; cliente: ClientePdf; veiculo: VeiculoPdf; descricao_problema: string; diagnostico?: string | null; descricao_servico?: string | null; observacoes?: string | null; status: OrdemStatus; desconto: string; total: string; itens: PdfItem[] }
export interface ReceiptEntry { id: string; valor: string; recebido_em: string; estorno_de?: string | null; observacoes?: string | null }
export interface ReciboPdfData { oficina: OficinaPdf; recibo_id: string; recibo_numero: number; ordem_numero: number; cliente: ClientePdf; veiculo: VeiculoPdf; recebido_em: string; valor: string; descricao_servico: string; responsavel: string; estornado: boolean }
export interface DemonstrativoPdfData { oficina: OficinaPdf; ordem_numero: number; cliente: ClientePdf; veiculo: VeiculoPdf; total_ordem: string; total_recebido: string; saldo_pendente: string; status_financeiro: string; recebimentos: ReceiptEntry[] }
export interface PdfFile { bytes: Uint8Array; filename: string; contentType: 'application/pdf' }
