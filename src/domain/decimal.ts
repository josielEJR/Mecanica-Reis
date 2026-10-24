/** Conversão exata para centavos; cálculos críticos não usam float. */
export type DecimalInput = string | number;

export function moneyToCents(value: DecimalInput): bigint {
  const raw = typeof value === 'number' ? value.toString() : value.trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(raw)) throw new Error('Valor monetário inválido');
  const [whole = '0', fraction = ''] = raw.split('.');
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
}

export function centsToMoney(cents: bigint): string {
  if (cents < 0n) throw new Error('Valor monetário não pode ser negativo');
  const whole = cents / 100n;
  const fraction = (cents % 100n).toString().padStart(2, '0');
  return `${whole}.${fraction}`;
}

export function centsToNumber(cents: bigint): number { return Number(centsToMoney(cents)); }
