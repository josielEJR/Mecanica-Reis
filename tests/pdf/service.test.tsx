import { describe, expect, it } from 'vitest';
import { AuthService } from '../../src/services/auth.service.js';
import { PdfService } from '../../src/pdf/services/pdf.service.js';

const office = { nome_fantasia: 'Mecânica Reis', telefone: null, endereco: null, logo_url: null };
const client = { nome: 'Cliente Teste', telefone: null };
const vehicle = { marca: 'Fiat', modelo: 'Uno', placa: null, ano: null, cor: null };
const item = { tipo: 'PECA', descricao: 'Filtro', quantidade: 1, preco_unitario: 10, custo_unitario: 5 };
const budget = { oficina: office, orcamento: { numero: 1, created_at: '2026-10-24T12:00:00Z', descricao_problema: 'Revisão', observacoes: null, status: 'RASCUNHO', desconto: 0 }, cliente: client, veiculo: vehicle, itens: [item] };

describe('PdfService', () => {
  it('bloqueia geração sem autorização', async () => {
    const auth = { verificarAutorizacao: async () => false } as unknown as AuthService;
    const repository = { budget: async () => budget } as any;
    await expect(new PdfService(repository, auth).gerarOrcamentoPDF('x')).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
  it('gera bytes, MIME e nome previsível para orçamento', async () => {
    const auth = { verificarAutorizacao: async () => true } as unknown as AuthService;
    const repository = { budget: async () => budget } as any;
    const file = await new PdfService(repository, auth).gerarOrcamentoPDF('x');
    expect(file.filename).toBe('orcamento-000001.pdf');
    expect(file.contentType).toBe('application/pdf');
    expect(Buffer.from(file.bytes).subarray(0, 4).toString()).toBe('%PDF');
  });
  it('não emite recibo válido para lançamento estornado', async () => {
    const auth = { verificarAutorizacao: async () => true } as unknown as AuthService;
    const repository = { receipt: async () => ({ recebimento: { id: 'r', numero: 1, valor: 10, recebido_em: '2026-10-24T12:00:00Z', estorno_de: 'original' }, ordem: { numero: 1, descricao_problema: 'x' }, cliente: client, veiculo: vehicle, oficina: office, itens: [], financeiro: {} }) } as any;
    await expect(new PdfService(repository, auth).gerarReciboPDF('r')).rejects.toMatchObject({ code: 'INVALID_STATE' });
  });
});
