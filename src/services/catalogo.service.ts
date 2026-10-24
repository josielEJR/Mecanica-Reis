import { catalogoItemInputSchema, type CatalogoItemInput } from '../schemas/catalogo.schema.js';
import type { CatalogoItemTipo } from '../types/database.types.js';
import { CatalogoRepository } from '../repositories/catalogo.repository.js';
export class CatalogoService {
  constructor(private readonly repository: CatalogoRepository) {}
  cadastrarItem(input: CatalogoItemInput) { return this.repository.create(catalogoItemInputSchema.parse(input)); }
  listarItens(tipo?: CatalogoItemTipo) { return this.repository.list(tipo); }
  pesquisarItens(term: string, tipo?: CatalogoItemTipo) { return this.repository.search(term, tipo); }
  atualizarItem(id: string, input: CatalogoItemInput) { return this.repository.update(id, catalogoItemInputSchema.parse(input)); }
  desativarItem(id: string) { return this.repository.deactivate(id); }
}
