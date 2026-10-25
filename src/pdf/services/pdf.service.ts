import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { DomainError } from '../../lib/errors.js';
import { AuthService } from '../../services/auth.service.js';
import { mapOrcamentoPdf } from '../mappers/orcamento.mapper.js';
import { mapOrdemPdf } from '../mappers/ordem.mapper.js';
import { mapDemonstrativoPdf, mapReciboPdf } from '../mappers/recibo.mapper.js';
import { DemonstrativoRecebimentosPDF, ReciboPDF } from '../templates/ReciboPDF.js';
import { OrcamentoPDF } from '../templates/OrcamentoPDF.js';
import { OrdemServicoPDF } from '../templates/OrdemServicoPDF.js';
import type { PdfFile } from '../types/pdf.types.js';
import { PdfDataRepository } from '../repositories/pdf-data.repository.js';
export class PdfService {
  constructor(private readonly repository: PdfDataRepository, private readonly auth: AuthService) {}
  private async authorized() { if (!(await this.auth.verificarAutorizacao())) throw new DomainError('UNAUTHORIZED', 'Acesso não autorizado'); }
  private async render(element: React.ReactElement<any>, filename: string): Promise<PdfFile> { const bytes = await renderToBuffer(element); return { bytes, filename, contentType: 'application/pdf' }; }
  async gerarOrcamentoPDF(id: string) { await this.authorized(); const data = mapOrcamentoPdf(await this.repository.budget(id)); return this.render(React.createElement(OrcamentoPDF, { data }), `orcamento-${String(data.numero).padStart(6, '0')}.pdf`); }
  async gerarOrdemServicoPDF(id: string) { await this.authorized(); const data = mapOrdemPdf(await this.repository.order(id)); return this.render(React.createElement(OrdemServicoPDF, { data }), `ordem-servico-${String(data.numero).padStart(6, '0')}.pdf`); }
  async gerarReciboPDF(id: string) { await this.authorized(); const raw = await this.repository.receipt(id); if (raw.recebimento.estorno_de) throw new DomainError('INVALID_STATE', 'Recibo de lançamento estornado não pode ser emitido'); const data = mapReciboPdf(raw); return this.render(React.createElement(ReciboPDF, { data }), `recibo-${String(data.recibo_numero).padStart(6, '0')}.pdf`); }
  async gerarDemonstrativoRecebimentosPDF(orderId: string) { await this.authorized(); const data = mapDemonstrativoPdf(await this.repository.statement(orderId)); return this.render(React.createElement(DemonstrativoRecebimentosPDF, { data }), `recebimentos-os-${String(data.ordem_numero).padStart(6, '0')}.pdf`); }
}
