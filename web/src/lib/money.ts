import type { Money } from './data/types';

const GBP = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 });

/** Pounds and pence from exact integer pence. */
export function formatMoney(m: Money): string {
  if (!Number.isSafeInteger(m.pence)) throw new Error('money must be whole pence');
  return GBP.format(m.pence / 100);
}
