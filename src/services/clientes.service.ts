import { clienteInputSchema, type ClienteInput } from '../schemas/clientes.schema.js';
import { DomainError } from '../lib/errors.js';
import { ClientesRepository, type Page } from '../repositories/clientes.repository.js';
export class ClientesService {
  constructor(private readonly repository: ClientesRepository) {}
  cadastrarCliente(input: ClienteInput) { return this.repository.create(clienteInputSchema.parse(input)); }
  buscarClientePorId(id: string) { return this.repository.getById(id); }
  listarClientes(options?: Page) { return this.repository.list(options); }
  pesquisarClientes(term: string, options?: Page) { return this.repository.search(term, options); }
  atualizarCliente(id: string, input: ClienteInput) { return this.repository.update(id, clienteInputSchema.parse(input)); }
  async arquivarCliente(id: string) { if (!(await this.repository.getById(id))) throw new DomainError('NOT_FOUND', 'Cliente não encontrado'); return this.repository.update(id, { ativo: false }); }
}
