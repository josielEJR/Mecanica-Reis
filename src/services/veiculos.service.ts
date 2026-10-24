import { DomainError } from '../lib/errors.js';
import { veiculoInputSchema, normalizePlaca, type VeiculoInput } from '../schemas/veiculos.schema.js';
import { VeiculosRepository } from '../repositories/veiculos.repository.js';
export class VeiculosService {
  constructor(private readonly repository: VeiculosRepository) {}
  cadastrarVeiculo(input: VeiculoInput) { const parsed = veiculoInputSchema.parse(input); return this.repository.create({ ...parsed, placa: normalizePlaca(parsed.placa) }); }
  buscarVeiculoPorId(id: string) { return this.repository.getById(id); }
  listarVeiculosDoCliente(clienteId: string) { return this.repository.listByClient(clienteId); }
  pesquisarVeiculoPorPlaca(placa: string) { return this.repository.findByPlate(normalizePlaca(placa) ?? ''); }
  atualizarVeiculo(id: string, input: VeiculoInput) { const parsed = veiculoInputSchema.parse(input); return this.repository.update(id, { ...parsed, placa: normalizePlaca(parsed.placa) }); }
  async arquivarVeiculo(id: string) { if (!(await this.repository.getById(id))) throw new DomainError('NOT_FOUND', 'Veículo não encontrado'); return this.repository.update(id, { ativo: false }); }
}
