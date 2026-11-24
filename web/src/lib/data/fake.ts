import type { DataSource, Portfolio, PortfolioTotal } from './types';
import sample from './sample.generated.json';

/**
 * The fake source: synthetic figures only, the approved designs' own (Prism's sample, read at build time by
 * scripts/sample.mjs). Cash is in the total (MP-185: "Cash in the total"); its £5,542.85 is the designs' figure.
 * Nothing here is the owner's data, and every result is marked synthetic.
 */
const holdingsPence = sample.holdings.reduce((a, h) => a + h.value.pence, 0);
const CASH = 554_285;

export const SAMPLE_TOTAL: PortfolioTotal = {
  holdings: { pence: holdingsPence, currency: 'GBP' },
  cash: { pence: CASH, currency: 'GBP' },
  total: { pence: holdingsPence + CASH, currency: 'GBP' },
  asOf: 'As of 22:15 London',
  synthetic: true
};

export const SAMPLE_PORTFOLIO: Portfolio = {
  ...SAMPLE_TOTAL,
  items: sample.holdings as Portfolio['items'],
  segments: sample.segments as unknown as Portfolio['segments'],
  topFives: sample.topFives as unknown as Portfolio['topFives'],
  allocation: sample.allocation
};

export const fakeSource: DataSource = {
  name: 'Sample data',
  async portfolioTotal() {
    return structuredClone(SAMPLE_TOTAL);
  },
  async portfolio() {
    return structuredClone(SAMPLE_PORTFOLIO);
  }
};
