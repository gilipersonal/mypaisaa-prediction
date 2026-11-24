import { describe, expect, it } from 'vitest';
import { formatMoney } from '../../src/lib/money';
import { SAMPLE_TOTAL, fakeSource } from '../../src/lib/data/fake';

describe('money and the sample total', () => {
  it('prints pounds and pence from whole pence', () => {
    expect(formatMoney({ pence: 9_015_525, currency: 'GBP' })).toBe('£90,155.25');
    expect(formatMoney({ pence: 5, currency: 'GBP' })).toBe('£0.05');
  });

  it('refuses money that is not whole pence', () => {
    expect(() => formatMoney({ pence: 10.5, currency: 'GBP' })).toThrow();
  });

  it('the total is holdings plus cash (MP-185), and every figure is synthetic', async () => {
    const t = await fakeSource.portfolioTotal();
    expect(t.total.pence).toBe(t.holdings.pence + t.cash.pence);
    expect(t.synthetic).toBe(true);
    expect(formatMoney(t.total)).toBe('£90,155.25');
  });

  it('hands out a copy, so a screen cannot change the source', async () => {
    const t = await fakeSource.portfolioTotal();
    t.total.pence = 1;
    expect(SAMPLE_TOTAL.total.pence).toBe(9_015_525);
  });
});
