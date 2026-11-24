import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SAMPLE_PORTFOLIO, SAMPLE_TOTAL, fakeSource } from '../../src/lib/data/fake';
import { DATA_STATES, dataStateOf } from '../../src/lib/data/state';
import { shownMoney, shownUnits } from '../../src/lib/privacy.svelte';
import { pence } from '../../scripts/sample.mjs';

const prism = readFileSync(new URL('../../../docs/design/prism/index.html', import.meta.url), 'utf8');

describe('the sample is the designs\' own', () => {
  it('reads every holding Prism draws, with its value to the penny', () => {
    for (const h of SAMPLE_PORTFOLIO.items) {
      const line = prism.split('\n').find((l) => l.includes(`t: '${h.ticker}'`));
      expect(line, h.ticker).toBeTruthy();
      const val = /val: '([\d,.]+)'/.exec(line!)![1]!;
      expect(h.value.pence, h.ticker).toBe(pence(val));
    }
    expect(SAMPLE_PORTFOLIO.items).toHaveLength(7);
  });

  it('sums the holdings to £84,612.40 and adds cash for the total (MP-185)', () => {
    expect(SAMPLE_TOTAL.holdings.pence).toBe(8_461_240);
    expect(SAMPLE_TOTAL.total.pence).toBe(SAMPLE_TOTAL.holdings.pence + SAMPLE_TOTAL.cash.pence);
    expect(SAMPLE_PORTFOLIO.synthetic).toBe(true);
  });

  it('keeps 17.0 as written (lesson 64)', () => {
    expect(SAMPLE_PORTFOLIO.allocation.find((a) => a.name === 'UK')!.pct).toBe('17.0');
  });

  it('marks the late HSBC price with its time', () => {
    expect(SAMPLE_PORTFOLIO.items.find((h) => h.ticker === 'HSBA')!.staleAt).toBe('14:10');
  });

  it('hands out copies', async () => {
    const p = await fakeSource.portfolio();
    p.items[0]!.value.pence = 1;
    expect(SAMPLE_PORTFOLIO.items[0]!.value.pence).not.toBe(1);
  });

  it('refuses a figure that is not money', () => {
    expect(() => pence('14820.5')).toThrow();
    expect(() => pence('£1.00')).toThrow();
    expect(pence('0.05')).toBe(5);
  });
});

describe('data states and hidden amounts', () => {
  it('reads only known states from the address', () => {
    for (const s of DATA_STATES) expect(dataStateOf(`?data=${s}`)).toBe(s);
    expect(dataStateOf('?data=<x>')).toBe('ready');
    expect(dataStateOf('')).toBe('ready');
  });

  it('masks money and units, never percentages (OWN-18)', () => {
    expect(shownMoney({ pence: 9_015_525, currency: 'GBP' }, false)).toBe('£90,155.25');
    expect(shownMoney({ pence: 9_015_525, currency: 'GBP' }, true)).toBe('£••');
    expect(shownUnits('12.5', true)).toBe('••');
    expect(shownUnits('12.5', false)).toBe('12.5');
    expect(() => shownMoney({ pence: 0.5, currency: 'GBP' }, false)).toThrow();
  });
});
