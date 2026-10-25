import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Cabecalho } from '../components/Cabecalho.js';
import { IdentificacaoVeiculo } from '../components/IdentificacaoVeiculo.js';
import { Rodape } from '../components/Rodape.js';
import { ResumoValores } from '../components/ResumoValores.js';
import { TabelaItens } from '../components/TabelaItens.js';
import { formatarData } from '../formatters/datas.js';
import type { OrcamentoPdfData } from '../types/pdf.types.js';
export function OrcamentoPDF({ data }: { data: OrcamentoPdfData }) { return <Document title={`Orçamento ${data.numero}`} author={data.oficina.nome_fantasia}><Page size="A4" style={{ padding: 36, paddingBottom: 54, fontFamily: 'Helvetica', color: '#292f33' }}><Cabecalho oficina={data.oficina} titulo="ORÇAMENTO" /><Text style={{ fontSize: 9, marginBottom: 8 }}>Orçamento nº {String(data.numero).padStart(6, '0')} · Emissão: {formatarData(data.emitido_em)} · Status: {data.status}</Text><IdentificacaoVeiculo cliente={data.cliente} veiculo={data.veiculo} /><Text style={{ fontSize: 10, fontWeight: 700, color: '#244d70' }}>SOLICITAÇÃO</Text><Text style={{ fontSize: 9, marginTop: 4 }}>{data.descricao_problema}</Text><TabelaItens itens={data.itens} /><ResumoValores desconto={data.desconto} total={data.total} />{data.observacoes ? <View style={{ marginTop: 14 }}><Text style={{ fontSize: 9, fontWeight: 700 }}>Observações</Text><Text style={{ fontSize: 8, marginTop: 4 }}>{data.observacoes}</Text></View> : null}<Text style={{ fontSize: 7, marginTop: 18, color: '#666' }}>Documento comercial sem valor de nota fiscal.</Text><Rodape oficina={data.oficina} /></Page></Document>; }
