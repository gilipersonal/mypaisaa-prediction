import { source } from '#lib/data/index.ts';
import type { EntryGenerator } from './$types';

// The static app prebuilds one page per sample holding (prerender comes from the root layout). Only the ticker is in the
// address; every figure is read in the browser.
export const entries: EntryGenerator = async () => (await source.portfolio()).items.map((h) => ({ ticker: h.ticker }));
