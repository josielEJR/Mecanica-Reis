import type { AppSupabaseClient } from '../lib/supabase.js';
import type { Database } from '../types/database.types.js';
import { mapSupabaseError } from '../lib/errors.js';
type Veiculo = Database['public']['Tables']['veiculos']['Row'];
type VeiculoInsert = Database['public']['Tables']['veiculos']['Insert'];
export class VeiculosRepository {
  constructor(private readonly db: AppSupabaseClient) {}
  async create(input: VeiculoInsert): Promise<Veiculo> { const { data, error } = await this.db.from('veiculos').insert(input).select().single(); if (error) throw mapSupabaseError(error); return data; }
  async getById(id: string): Promise<Veiculo | null> { const { data, error } = await this.db.from('veiculos').select('*').eq('id', id).maybeSingle(); if (error) throw mapSupabaseError(error); return data; }
  async listByClient(clienteId: string): Promise<Veiculo[]> { const { data, error } = await this.db.from('veiculos').select('*').eq('cliente_id', clienteId).eq('ativo', true).order('modelo'); if (error) throw mapSupabaseError(error); return data ?? []; }
  async findByPlate(placa: string): Promise<Veiculo | null> { const normalized = placa.replace(/[^a-z0-9]/gi, '').toUpperCase(); const { data, error } = await this.db.from('veiculos').select('*').eq('placa', normalized).maybeSingle(); if (error) throw mapSupabaseError(error); return data; }
  async update(id: string, input: Partial<VeiculoInsert>): Promise<Veiculo> { const { data, error } = await this.db.from('veiculos').update(input).eq('id', id).select().single(); if (error) throw mapSupabaseError(error); return data; }
}
