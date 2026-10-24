export type Money = number;

export interface OrderItem {
  quantity: number;
  unitPrice: Money;
  unitCost: Money;
}

const assertNonNegative = (value: number, label: string): void => {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} deve ser não negativo`);
};

export function subtotal(items: readonly OrderItem[]): Money {
  return round(items.reduce((sum, item) => {
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) throw new Error('Quantidade deve ser maior que zero');
    assertNonNegative(item.unitPrice, 'Preço');
    assertNonNegative(item.unitCost, 'Custo');
    return sum + item.quantity * item.unitPrice;
  }, 0));
}

export function total(items: readonly OrderItem[], discount: Money): Money {
  assertNonNegative(discount, 'Desconto');
  const value = subtotal(items);
  if (discount > value) throw new Error('Desconto não pode superar o subtotal');
  return round(value - discount);
}

export function estimatedCost(items: readonly OrderItem[]): Money {
  return round(items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0));
}

export function paymentStatus(orderTotal: Money, received: Money): 'NAO_RECEBIDO' | 'PARCIAL' | 'QUITADO' {
  if (orderTotal < 0 || received < 0 || received > orderTotal) throw new Error('Valores financeiros inválidos');
  if (received === 0) return 'NAO_RECEBIDO';
  if (received < orderTotal) return 'PARCIAL';
  return 'QUITADO';
}

export function remainingBalance(orderTotal: Money, receipts: readonly Money[]): Money {
  assertNonNegative(orderTotal, 'Total');
  const received = receipts.reduce((sum, value) => {
    if (!Number.isFinite(value) || value <= 0) throw new Error('Recebimento deve ser maior que zero');
    return sum + value;
  }, 0);
  if (received > orderTotal) throw new Error('Recebimentos superam o total da ordem');
  return round(orderTotal - received);
}

export function round(value: number): Money {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
