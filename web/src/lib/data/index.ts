import { fakeSource } from './fake';
import type { DataSource } from './types';

/** Until the local API (step 4), one source: the fake one. The API client replaces it behind the same interface. */
export const source: DataSource = fakeSource;
export type { AllocationSlice, DataSource, Holding, Money, Portfolio, PortfolioTotal, Segment } from './types';
