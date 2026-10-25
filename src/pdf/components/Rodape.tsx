import { Text, View } from '@react-pdf/renderer';
import type { OficinaPdf } from '../types/pdf.types.js';
export function Rodape({ oficina, children }: { oficina: OficinaPdf; children?: React.ReactNode }) { return <View fixed style={{ position: 'absolute', bottom: 24, left: 36, right: 36, borderTop: '0.5pt solid #d5dbe1', paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#555' }}><Text>{oficina.nome_fantasia} · Documento comercial</Text>{children ?? <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />}</View>; }
