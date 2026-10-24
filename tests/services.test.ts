import { describe, expect, it } from 'vitest';
import { normalizePlaca } from '../src/schemas/veiculos.schema.js';
import { catalogoItemInputSchema } from '../src/schemas/catalogo.schema.js';
import { clienteInputSchema } from '../src/schemas/clientes.schema.js';
import { DomainError, mapSupabaseError } from '../src/lib/errors.js';

describe('validações da camada comercial', () => {
  it('normaliza placas para comparação e índice do banco', () => expect(normalizePlaca('abc-1d23')).toBe('ABC1D23'));
  it('aceita os três tipos de catálogo e rejeita preço negativo', () => {
    expect(catalogoItemInputSchema.parse({ tipo: 'PECA', descricao: 'Filtro', custo_padrao: 1, preco_padrao: 2 }).tipo).toBe('PECA');
    expect(() => catalogoItemInputSchema.parse({ tipo: 'PECA', descricao: 'Filtro', custo_padrao: -1, preco_padrao: 2 })).toThrow();
  });
  it('aplica valores nulos aos opcionais persistidos', () => expect(clienteInputSchema.parse({ nome: 'Ana' }).telefone).toBeNull());
  it('mapeia códigos de integridade para erros de domínio', () => {
    expect(mapSupabaseError({ code: '23505' })).toBeInstanceOf(DomainError);
    expect(mapSupabaseError({ code: '42501' }).code).toBe('UNAUTHORIZED');
  });
});
