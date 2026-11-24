/**
 * The Track record's sample: the one illustrative table the Track record design computes every figure from
 * (docs/design/journeys/src/journeys/track.js, option A "Scorecard", picked by the owner on 24 Nov 2026, MP-187), with the
 * design's "today" of 3 Nov 2026. Synthetic and illustrative: no figure here is a real result, and none is the owner's.
 * tests/unit/track.test.ts finds every row here in the design's source and every derived text in the rendered design, so
 * none can drift (lessons 2, 37 and 63).
 *
 * Live forecasts only. Seven holdings, one forecast each per daily origin since R2-HGB v2 went live on 2 Feb 2026: 192 origins,
 * so 1,344 forecasts at every horizon. A window holds the forecasts whose horizon passed inside it.
 * Matured = scored + censored + abstained; issued = matured + pending. Pending, censored and abstained are never misses.
 */
export const synthetic = true;
export const illustrative = true;

/** When the live record began, how many forecasts each horizon has issued, the scored count a rate needs, and the blocks a claim needs. */
export const START = '2 Feb 2026';
export const ISSUED = 1344;
export const MIN = 30;
export const FLOOR = 20;
/** The three windows a horizon is read over. */
export const WINDOWS = ['30 days', '90 days', '365 days'] as const;

/** One window of one horizon: the forecasts whose horizon passed inside it. */
export interface Window {
  /** horizon passed */
  due: number;
  /** inside and outside the 80% range: together, the scored */
  inside: number;
  outside: number;
  censored: number;
  abstained: number;
  /** direction right */
  dir: number;
  /** median absolute error, in points */
  err: number;
  /** calibration slope, kept as text so 0.90 prints as 0.90 (lesson 64) */
  cal: string;
  /** the baseline's median absolute error on the same origins */
  base: number;
  /** non-overlapping blocks */
  blocks: number;
  scored: number;
}

/** The design's w(): a window, with its scored count derived, never stated. */
export function w(due: number, inside: number, outside: number, censored: number, abstained: number, dir: number, err: number, cal: string, base: number, blocks: number): Window {
  return { due, inside, outside, censored, abstained, dir, err, cal, base, blocks, scored: inside + outside };
}

export type HorizonKey = 'm3' | 'm6' | 'm12' | 's10' | 's20';
export interface Horizon {
  n: string;
  k: HorizonKey;
  long?: boolean;
  pending: number;
  /** action changes a year, where an action can follow */
  turn?: string;
  /** the first maturity date, where nothing has matured */
  first?: string;
  w: [Window, Window, Window];
}

const nothing = (): [Window, Window, Window] => [w(0, 0, 0, 0, 0, 0, 0, '', 0, 0), w(0, 0, 0, 0, 0, 0, 0, '', 0, 0), w(0, 0, 0, 0, 0, 0, 0, '', 0, 0)];

export const HZ: Record<HorizonKey, Horizon> = {
  m3: { n: '3 months', k: 'm3', long: true, pending: 455, turn: '1.2', w: [w(147, 104, 35, 3, 5, 82, 5.6, '0.92', 6.0, 1), w(441, 322, 91, 12, 16, 248, 5.1, '0.95', 5.9, 1), w(889, 663, 171, 21, 34, 506, 4.9, '0.97', 5.8, 2)] },
  m6: { n: '6 months', k: 'm6', long: true, pending: 903, turn: '0.7', w: [w(147, 101, 35, 4, 7, 77, 9.9, '0.90', 10.4, 1), w(427, 308, 92, 9, 18, 233, 9.3, '0.94', 10.2, 1), w(441, 318, 95, 9, 19, 241, 9.2, '0.94', 10.1, 1)] },
  m12: { n: '12 months', k: 'm12', long: true, pending: 1344, first: '2 Feb 2027', w: nothing() },
  s10: { n: '10 sessions', k: 's10', pending: 70, w: [w(147, 108, 33, 1, 5, 79, 2.4, '0.93', 2.5, 2), w(448, 342, 93, 2, 11, 237, 2.2, '0.96', 2.4, 6), w(1274, 982, 252, 6, 34, 679, 2.1, '0.98', 2.3, 18)] },
  s20: { n: '20 sessions', k: 's20', pending: 140, w: [w(147, 107, 35, 1, 4, 80, 3.6, '0.90', 3.8, 1), w(448, 333, 101, 2, 12, 241, 3.4, '0.93', 3.7, 3), w(1204, 905, 263, 6, 30, 654, 3.3, '0.95', 3.6, 8)] }
};
export const LONG: readonly Horizon[] = [HZ.m3, HZ.m6, HZ.m12];
export const SHORT: readonly Horizon[] = [HZ.s10, HZ.s20];

/** Over 365 days, by holding, at 3 and 6 months: [ticker, scored, inside, censored, abstained]. HSBC's censored are its disputed dividend. */
export type HoldRow = [ticker: string, scored: number, inside: number, censored: number, abstained: number];
export const HOLD: Record<'m3' | 'm6', HoldRow[]> = {
  m3: [['AAPL', 124, 101, 0, 3], ['NVDA', 121, 88, 0, 6], ['SPY', 127, 105, 0, 0], ['AZN', 111, 86, 0, 16], ['HSBA', 102, 79, 21, 4], ['RELIANCE', 122, 98, 0, 5], ['NIFTYBEES', 127, 106, 0, 0]],
  m6: [['AAPL', 62, 49, 0, 1], ['NVDA', 60, 43, 0, 3], ['SPY', 63, 51, 0, 0], ['AZN', 53, 37, 0, 10], ['HSBA', 51, 38, 9, 3], ['RELIANCE', 61, 48, 0, 2], ['NIFTYBEES', 63, 52, 0, 0]]
};

/** One model at one horizon: a window with what is still pending, or nothing matured yet. */
export type ModelCell = (Window & { pending: number; first?: string }) | { due?: undefined; pending: number; first?: string };
export interface Model {
  n: string;
  s: string;
  cells: Record<HorizonKey, ModelCell>;
}
export type ModelKey = 'v2' | 'v3';
/** By model, over 365 days. v3 has nothing matured at 3, 6 or 12 months; its first forecasts there mature on these dates. */
export const MODEL: Record<ModelKey, Model> = {
  v2: {
    n: 'R2-HGB v2', s: 'Live 2 Feb to 30 Sep 2026. Its forecasts still mature, and are scored against v2.',
    cells: {
      m3: { ...HZ.m3.w[2], pending: 287 }, m6: { ...HZ.m6.w[2], pending: 735 }, m12: { pending: 1176 },
      s10: { ...w(1176, 905, 233, 6, 32, 627, 2.1, '0.98', 2.3, 17), pending: 0 }, s20: { ...w(1176, 883, 258, 6, 29, 638, 3.3, '0.95', 3.6, 8), pending: 0 }
    }
  },
  v3: {
    n: 'R2-HGB v3', s: 'Approved 1 Oct 2026. It issues today’s forecasts.',
    cells: {
      m3: { pending: 168, first: '1 Jan 2027' }, m6: { pending: 168, first: '1 Apr 2027' }, m12: { pending: 168, first: '1 Oct 2027' },
      s10: { ...w(98, 77, 19, 0, 2, 52, 2.0, '0.97', 2.2, 1), pending: 70 }, s20: { ...w(28, 22, 5, 0, 1, 16, 3.1, '0.94', 3.4, 0), pending: 140 }
    }
  }
};
export const MODEL_ROWS: readonly HorizonKey[] = ['m3', 'm6', 'm12', 's10', 's20'];

/** The historical-distribution baseline, scored on exactly the same origins as the model: [inside, error] by horizon. */
export const BASE: Record<'m3' | 'm6' | 's10' | 's20', [inside: number, err: number]> = { m3: [704, 5.8], m6: [349, 10.1], s10: [1017, 2.3], s20: [958, 3.6] };
export const BASE_ROWS = ['m3', 'm6', 's10', 's20'] as const;

/** By the regime at each forecast's origin, over 365 days: [regime, scored, inside]. */
export type RegRow = [regime: string, scored: number, inside: number];
export const REG: Record<'m3' | 'm6', RegRow[]> = {
  m3: [['Rising, calm', 412, 338], ['Rising, volatile', 118, 86], ['Falling, calm', 196, 154], ['Falling, volatile', 108, 85]],
  m6: [['Rising, calm', 207, 170], ['Rising, volatile', 61, 41], ['Falling, calm', 92, 70], ['Falling, volatile', 53, 37]]
};
export const REGIME_HOW = 'The regime at each forecast’s origin: whether the last 60 sessions rose or fell, and whether 20-session volatility was above its 80th percentile.';

/** The two 6-month outcomes from the journal, so the record and the journal agree, and why 6-month forecasts were not scored. */
export const YOURS: [string, string][] = [['NVIDIA · 28 Apr', 'Inside, +12.4%'], ['AstraZeneca · 3 Mar', 'Outside, −11.6%']];
export const WHY_OUT: [string, number][] = [['HSBC · censored', 9], ['AstraZeneca · abstained', 10], ['Other holdings · abstained', 9]];

export interface TrackSample {
  synthetic: true;
  HZ: typeof HZ;
  HOLD: typeof HOLD;
  MODEL: typeof MODEL;
  BASE: typeof BASE;
  REG: typeof REG;
}

/** Reads the record. On sample data it is always the illustrative table; it is read in the browser, never at build time. */
export async function readTrack(): Promise<TrackSample> {
  return { synthetic, HZ, HOLD, MODEL, BASE, REG };
}
