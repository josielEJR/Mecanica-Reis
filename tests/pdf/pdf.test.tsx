import { describe, expect, it } from 'vitest';
import fs from 'node:fs/promises';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { formatarData, formatarDataHora } from '../../src/pdf/formatters/datas.js';
import { formatarMoeda, lineSubtotal } from '../../src/pdf/formatters/moeda.js';
import { mapOrcamentoPdf } from '../../src/pdf/mappers/orcamento.mapper.js';
import { OrcamentoPDF } from '../../src/pdf/templates/OrcamentoPDF.js';
import { OrdemServicoPDF } from '../../src/pdf/templates/OrdemServicoPDF.js';
import { DemonstrativoRecebimentosPDF, ReciboPDF } from '../../src/pdf/templates/ReciboPDF.js';

const office = { nome_fantasia: 'Mecânica Reis', telefone: '(11) 99999-0000', endereco: 'Rua São José, 10', logo_url: null };
const parties = { cliente: { nome: 'José da Silva', telefone: '(11) 98888-0000' }, veiculo: { marca: 'Ford', modelo: 'Focus', placa: 'ABC1D23', ano: 2020, cor: 'Azul' } };
const items = [{ tipo: 'PECA' as const, descricao: 'Filtro de óleo com descrição longa para validar quebra de linha e acentuação', quantidade: '1', preco_unitario: '45.00', subtotal: '45.00' }];

describe('PDF comercial', () => {
  it('formata moeda, datas e quantidades em pt-BR', () => {
    expect(formatarMoeda('1500.50')).toBe('R$ 1.500,50');
    expect(formatarData('2026-10-24T03:00:00Z')).toMatch(/24\/10\/2026/);
    expect(formatarDataHora('2026-10-24T03:00:00Z')).toContain('24/10/2026');
    expect(lineSubtotal('2.5', '10.00')).toBe('25.00');
  });
  it('mapeia orçamento com snapshots e nunca inclui custos internos no DTO', () => {
    const mapped = mapOrcamentoPdf({ oficina: office, cliente: parties.cliente, veiculo: parties.veiculo, orcamento: { numero: 12, created_at: '2026-10-24T12:00:00Z', descricao_problema: 'Revisão', observacoes: null, status: 'RASCUNHO', desconto: 5 }, itens: [{ ...items[0], custo_unitario: 10 }] });
    expect(mapped.total).toBe('40.00');
    expect(JSON.stringify(mapped)).not.toContain('custo_unitario');
  });
  it('renderiza orçamento, ordem, recibo parcial e demonstrativo como PDF', async () => {
    const budget = { oficina: office, numero: 12, emitido_em: '2026-10-24T12:00:00Z', ...parties, descricao_problema: 'Revisão', observacoes: 'Retornar até amanhã', status: 'ENVIADO', desconto: '5.00', total: '40.00', itens: items };
    const order = { oficina: office, numero: 18, data_entrada: '2026-10-24T12:00:00Z', data_conclusao: null, ...parties, descricao_problema: 'Revisão', diagnostico: null, descricao_servico: 'Serviço previsto', observacoes: null, status: 'EM_ANDAMENTO' as const, desconto: '5.00', total: '40.00', itens: items };
    const receipt = { oficina: office, recibo_id: 'receipt-1', recibo_numero: 1, ordem_numero: 18, ...parties, recebido_em: '2026-10-24T12:00:00Z', valor: '20.00', descricao_servico: 'Revisão', responsavel: 'Mecânica Reis', estornado: false };
    const statement = { oficina: office, ordem_numero: 18, ...parties, total_ordem: '40.00', total_recebido: '20.00', saldo_pendente: '20.00', status_financeiro: 'PARCIAL', recebimentos: [{ id: 'receipt-1', valor: '20.00', recebido_em: '2026-10-24T12:00:00Z', estorno_de: null }] };
    for (const element of [React.createElement(OrcamentoPDF, { data: budget }), React.createElement(OrdemServicoPDF, { data: order }), React.createElement(ReciboPDF, { data: receipt }), React.createElement(DemonstrativoRecebimentosPDF, { data: statement })]) {
      const pdf = await renderToBuffer(element as any);
      expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
      expect(pdf.length).toBeGreaterThan(1000);
    }
  });
  it('renderiza campos opcionais ausentes e muitos itens sem falhar', async () => {
    const data = { oficina: { nome_fantasia: 'Mecânica Reis' }, numero: 99, emitido_em: '2026-10-24T12:00:00Z', cliente: { nome: 'Cliente' }, veiculo: { marca: 'Fiat', modelo: 'Uno' }, descricao_problema: 'x'.repeat(500), status: 'RASCUNHO', desconto: '0.00', total: '100.00', itens: Array.from({ length: 80 }, (_, i) => ({ tipo: 'MAO_DE_OBRA' as const, descricao: `Item ${i}`, quantidade: '1', preco_unitario: '1.25', subtotal: '1.25' })) };
    const pdf = await renderToBuffer(React.createElement(OrcamentoPDF, { data }) as any);
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
    expect(pdf.length).toBeGreaterThan(3000);
  });
  it('gera os quatro PDFs fictícios quando solicitado', async () => {
    if (!process.env.GENERATE_PDF_EXAMPLES) return;
    await fs.mkdir('examples/pdf', { recursive: true });
    const files = [
      ['orcamento-000001.pdf', React.createElement(OrcamentoPDF, { data: { oficina: office, numero: 1, emitido_em: '2026-10-24T12:00:00Z', cliente: parties.cliente, veiculo: parties.veiculo, descricao_problema: 'Revisão preventiva', observacoes: 'Dados fictícios.', status: 'ENVIADO', desconto: '10.00', total: '125.00', itens: items } })],
      ['ordem-servico-000001.pdf', React.createElement(OrdemServicoPDF, { data: { oficina: office, numero: 1, data_entrada: '2026-10-24T12:00:00Z', data_conclusao: null, cliente: parties.cliente, veiculo: parties.veiculo, descricao_problema: 'Revisão preventiva', diagnostico: 'Itens em avaliação', descricao_servico: 'Serviço previsto', observacoes: null, status: 'EM_ANDAMENTO', desconto: '10.00', total: '125.00', itens: items } })],
      ['recibo-000001.pdf', React.createElement(ReciboPDF, { data: { oficina: office, recibo_id: 'exemplo-000001', recibo_numero: 1, ordem_numero: 1, cliente: parties.cliente, veiculo: parties.veiculo, recebido_em: '2026-10-24T12:00:00Z', valor: '50.00', descricao_servico: 'Revisão preventiva', responsavel: office.nome_fantasia, estornado: false } })],
      ['recebimentos-os-000001.pdf', React.createElement(DemonstrativoRecebimentosPDF, { data: { oficina: office, ordem_numero: 1, cliente: parties.cliente, veiculo: parties.veiculo, total_ordem: '125.00', total_recebido: '50.00', saldo_pendente: '75.00', status_financeiro: 'PARCIAL', recebimentos: [{ id: 'exemplo-000001', valor: '50.00', recebido_em: '2026-10-24T12:00:00Z', estorno_de: null }] } })],
    ] as const;
    for (const [name, element] of files) await fs.writeFile(`examples/pdf/${name}`, await renderToBuffer(element as any));
    expect(files).toHaveLength(4);
  });
});
