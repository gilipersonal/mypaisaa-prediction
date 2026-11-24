import { fakeSource } from './fake';
import type { DataSource } from './types';

/** Step 1 has one source, the fake one. The API client (step 4) replaces it behind the same interface. */
export const source: DataSource = fakeSource;
export type { DataSource, Money, PortfolioTotal } from './types';
