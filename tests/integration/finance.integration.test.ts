import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createSupabaseClient } from '../../src/lib/supabase.js';

const configured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_TEST_EMAIL && process.env.SUPABASE_TEST_PASSWORD);

describe.skipIf(!configured)('integração financeira Supabase local', () => {
  it('registra recebimentos parciais, evita duplicidade e estorna de forma líquida', async () => {
    const db = createSupabaseClient();
    expect((await db.auth.signInWithPassword({ email: process.env.SUPABASE_TEST_EMAIL!, password: process.env.SUPABASE_TEST_PASSWORD! })).error).toBeNull();
    const suffix = randomUUID().slice(0, 8);
    const client = (await db.from('clientes').insert({ nome: `Financeiro ${suffix}` }).select().single()).data!;
    const vehicle = (await db.from('veiculos').insert({ cliente_id: client.id, marca: 'Ford', modelo: `Financeiro ${suffix}` }).select().single()).data!;
    const order = (await db.from('ordens_servico').insert({ cliente_id: client.id, veiculo_id: vehicle.id, descricao_problema: 'Teste financeiro' }).select().single()).data!;
    await db.from('ordem_servico_itens').insert({ ordem_servico_id: order.id, tipo: 'MAO_DE_OBRA', descricao: 'Serviço', quantidade: 1, custo_unitario: 20, preco_unitario: 100 });
    const first = await db.rpc('adicionar_recebimento', { p_ordem_servico_id: order.id, p_valor: '60.00', p_recebido_em: null, p_observacoes: null, p_idempotency_key: `first-${suffix}` });
    expect(first.error).toBeNull();
    const retry = await db.rpc('adicionar_recebimento', { p_ordem_servico_id: order.id, p_valor: '60.00', p_recebido_em: null, p_observacoes: null, p_idempotency_key: `first-${suffix}` });
    expect(retry.error).toBeNull();
    expect(retry.data?.id).toBe(first.data?.id);
    const second = await db.rpc('adicionar_recebimento', { p_ordem_servico_id: order.id, p_valor: '40.00', p_recebido_em: null, p_observacoes: null, p_idempotency_key: `second-${suffix}` });
    expect(second.error).toBeNull();
    const reversed = await db.rpc('estornar_recebimento', { p_recebimento_id: first.data!.id, p_estornado_em: null, p_observacoes: 'Correção de integração' });
    expect(reversed.error).toBeNull();
    const repeatedReverse = await db.rpc('estornar_recebimento', { p_recebimento_id: first.data!.id, p_estornado_em: null, p_observacoes: null });
    expect(repeatedReverse.error).toBeNull();
    expect(repeatedReverse.data?.id).toBe(reversed.data?.id);
    const finance = (await db.from('ordem_financeiro').select('total, total_recebido, saldo_pendente, status_financeiro').eq('id', order.id).single()).data!;
    expect(finance).toMatchObject({ total: 100, total_recebido: 40, saldo_pendente: 60, status_financeiro: 'PARCIAL' });
  });

  it('separa despesa pendente, despesa paga e fluxo de caixa', async () => {
    const db = createSupabaseClient();
    expect((await db.auth.signInWithPassword({ email: process.env.SUPABASE_TEST_EMAIL!, password: process.env.SUPABASE_TEST_PASSWORD! })).error).toBeNull();
    const today = new Date().toISOString().slice(0, 10);
    const pending = await db.rpc('cadastrar_despesa', { p_ordem_servico_id: null, p_categoria: 'DESPESA_GERAL', p_descricao: 'Aluguel de teste', p_valor: '30.00', p_data_competencia: today, p_observacoes: null });
    expect(pending.error).toBeNull();
    const paid = await db.rpc('cadastrar_despesa', { p_ordem_servico_id: null, p_categoria: 'DESPESA_GERAL', p_descricao: 'Energia de teste', p_valor: '20.00', p_data_competencia: today, p_observacoes: null });
    expect(paid.error).toBeNull();
    const paidResult = await db.rpc('marcar_despesa_paga', { p_despesa_id: paid.data!.id, p_pago_em: null });
    expect(paidResult.error).toBeNull();
    const summary = (await db.rpc('dashboard_resumo_financeiro', { p_inicio: today, p_fim: today })).data?.[0];
    expect(summary).toBeTruthy();
    expect(Number(summary?.despesas_pagas)).toBeGreaterThanOrEqual(20);
    expect(Number(summary?.despesas_pendentes)).toBeGreaterThanOrEqual(30);
  });
});
