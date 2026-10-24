import { describe, expect, it } from 'vitest';
import { estimatedCost, paymentStatus, remainingBalance, subtotal, total } from '../src/domain/finance.js';

const items = [
  { quantity: 2, unitPrice: 45, unitCost: 25 },
  { quantity: 1, unitPrice: 90, unitCost: 40 },
] as const;

describe('regras financeiras', () => {
  it('calcula subtotal e custo estimado separadamente', () => {
    expect(subtotal(items)).toBe(180);
    expect(estimatedCost(items)).toBe(90);
  });

  it('aplica desconto e impede desconto maior que subtotal', () => {
    expect(total(items, 20)).toBe(160);
    expect(() => total(items, 180.01)).toThrow();
  });

  it('calcula recebimento parcial, quitado e saldo implicitamente', () => {
    expect(paymentStatus(160, 0)).toBe('NAO_RECEBIDO');
    expect(paymentStatus(160, 80)).toBe('PARCIAL');
    expect(paymentStatus(160, 160)).toBe('QUITADO');
    expect(() => paymentStatus(160, 160.01)).toThrow();
    expect(remainingBalance(160, [40, 40])).toBe(80);
    expect(() => remainingBalance(160, [100, 60.01])).toThrow();
  });

  it('separa faturamento, custo estimado e caixa recebido', () => {
    expect(total(items, 20)).toBe(160);
    expect(estimatedCost(items)).toBe(90);
    expect(remainingBalance(160, [50])).toBe(110);
  });

  it('recusa quantidades e valores inválidos', () => {
    expect(() => subtotal([{ quantity: 0, unitPrice: 1, unitCost: 1 }])).toThrow();
    expect(() => subtotal([{ quantity: 1, unitPrice: -1, unitCost: 1 }])).toThrow();
  });
});
