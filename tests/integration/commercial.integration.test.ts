import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createSupabaseClient } from '../../src/lib/supabase.js';

const configured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_TEST_EMAIL && process.env.SUPABASE_TEST_PASSWORD);

describe.skipIf(!configured)('integração Supabase local (sessão e RLS reais)', () => {
  it('não expõe clientes para uma sessão anônima', async () => {
    const db = createSupabaseClient();
    const { data, error } = await db.from('clientes').select('id').limit(1);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('converte orçamento aprovado atomicamente e é idempotente', async () => {
    const db = createSupabaseClient();
    const { error: authError } = await db.auth.signInWithPassword({ email: process.env.SUPABASE_TEST_EMAIL!, password: process.env.SUPABASE_TEST_PASSWORD! });
    expect(authError).toBeNull();

    const suffix = randomUUID().slice(0, 8);
    const { data: cliente, error: clienteError } = await db.from('clientes').insert({ nome: `Integração ${suffix}` }).select().single();
    expect(clienteError).toBeNull();
    expect(cliente).toBeTruthy();
    const { data: veiculo, error: veiculoError } = await db.from('veiculos').insert({ cliente_id: cliente!.id, marca: 'Toyota', modelo: `Teste ${suffix}`, placa: `T${suffix.slice(0, 6)}` }).select().single();
    expect(veiculoError).toBeNull();

    const { data: orcamento, error: orcamentoError } = await db.from('orcamentos').insert({ cliente_id: cliente!.id, veiculo_id: veiculo!.id, descricao_problema: 'Validação de conversão', desconto: 10 }).select().single();
    expect(orcamentoError).toBeNull();
    const { error: itemError } = await db.from('orcamento_itens').insert({ orcamento_id: orcamento!.id, tipo: 'PECA', descricao: 'Peça de integração', quantidade: 1, custo_unitario: 20, preco_unitario: 100 });
    expect(itemError).toBeNull();
    const { error: sendError } = await db.from('orcamentos').update({ status: 'ENVIADO' }).eq('id', orcamento!.id);
    expect(sendError).toBeNull();
    const { error: approveError } = await db.from('orcamentos').update({ status: 'APROVADO' }).eq('id', orcamento!.id);
    expect(approveError).toBeNull();

    const first = await db.rpc('converter_orcamento_em_ordem', { p_orcamento_id: orcamento!.id });
    expect(first.error).toBeNull();
    expect(first.data).toBeTruthy();
    const { data: persisted, error: persistedError } = await db.from('ordens_servico').select('id, orcamento_id, desconto').eq('id', first.data).single();
    expect(persistedError).toBeNull();
    expect(persisted?.orcamento_id).toBe(orcamento!.id);
    expect(persisted?.desconto).toBe(10);
    const { data: copiedItems, error: copiedItemsError } = await db.from('ordem_servico_itens').select('descricao, quantidade, custo_unitario, preco_unitario').eq('ordem_servico_id', first.data);
    expect(copiedItemsError).toBeNull();
    expect(copiedItems).toHaveLength(1);
    expect(copiedItems?.[0]).toMatchObject({ descricao: 'Peça de integração', quantidade: 1, custo_unitario: 20, preco_unitario: 100 });

    const second = await db.rpc('converter_orcamento_em_ordem', { p_orcamento_id: orcamento!.id });
    expect(second.error).toBeNull();
    expect(second.data).toBe(first.data);
    const { count } = await db.from('ordens_servico').select('id', { count: 'exact', head: true }).eq('orcamento_id', orcamento!.id);
    expect(count).toBe(1);
  });
});
