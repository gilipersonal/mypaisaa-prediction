import type { DataSource, PortfolioTotal } from './types';

/**
 * The fake source: synthetic figures only, the same ones the Journeys designs draw (MP-185: cash in the total).
 * Nothing here is the owner's data, and every result is marked synthetic.
 */
export const SAMPLE_TOTAL: PortfolioTotal = {
  holdings: { pence: 8_461_240, currency: 'GBP' },
  cash: { pence: 554_285, currency: 'GBP' },
  total: { pence: 9_015_525, currency: 'GBP' },
  asOf: 'As of 22:15 London',
  synthetic: true
};

export const fakeSource: DataSource = {
  name: 'Sample data',
  async portfolioTotal() {
    return structuredClone(SAMPLE_TOTAL);
  }
};
