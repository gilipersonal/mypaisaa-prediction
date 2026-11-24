import type { DataState } from '#lib/data/state.ts';
import type { AllocationSlice, Holding, Money, Portfolio } from '#lib/data/types.ts';

/**
 * Home, option A "Tile board", screen a-portfolio (docs/design/journeys/src/journeys/home.js), as the app draws it from
 * the sample source. Every word and every figure here that does not come from `source` is the design's own, and
 * tests/unit/home.test.ts finds each one in the rendered design, state by state, so none can drift.
 */

/** The design names the ready state "default". */
export type DesignState = 'default' | Exclude<DataState, 'ready'>;
export const designState = (st: DataState): DesignState => (st === 'ready' ? 'default' : st);

/* ---------- Prism's helpers (docs/design/prism/index.html: pct, ACT) ---------- */
export const MINUS = '−';
export const pct = (v: number, d = 1): string => (v < 0 ? MINUS : '+') + Math.abs(v).toFixed(d) + '%';
/** An action's icon, as Prism's badge draws it. Decision support only; nothing here places an order. */
export const ACT_ICON: Record<string, string> = { Add: 'plus', Hold: 'equal', Pause: 'pause', Trim: 'trim', Rebalance: 'rebalance' };

/* ---------- each market's own price time and source (home.js: CCY, PRICE, stamp) ---------- */
export const CCY: Record<string, string> = { XNAS: 'USD', ARCX: 'USD', XLON: 'GBP', XNSE: 'INR' };
export const PRICE: Record<string, readonly [string, string]> = {
  XNAS: ['21:00', 'Twelve Data'], ARCX: ['21:00', 'Twelve Data'], XLON: ['16:35', 'Yahoo'], XNSE: ['10:00', 'Yahoo']
};
/** A holding's price time and source. A late price carries its own time; in Error the US run is Monday's (ADM-10). */
export function stamp(h: Holding, st: DesignState): { t: string; who: string } {
  const p = PRICE[h.venue];
  if (!p) throw new Error(`no price clock for ${h.venue}`);
  const [at, who] = p;
  const t = h.staleAt ?? at;
  return { t: st === 'error' && who === 'Twelve Data' ? `Mon ${t}` : t, who };
}
export const ccyOf = (h: Holding): string => {
  const c = CCY[h.venue];
  if (!c) throw new Error(`no currency for ${h.venue}`);
  return c;
};

/* ---------- the run clock (shell.js: CUTOFFS, ASOF_ALL, LASTGOOD_ALL) ---------- */
export const CUTOFFS = 'cutoffs US 22:00, UK 17:35, India 11:00';
export const LASTGOOD_ALL = 'US: last good run Mon 22:15 · cutoff 22:00. UK and India ran today';
/** The source says when its figures were true; the design adds each market's cutoff. */
export const asOfAll = (asOf: string): string => `${asOf} · ${CUTOFFS}`;

/* ---------- fixed lines (home.js: sup, qLate; shell.js: BROWSER_UNVERIFIED) ---------- */
export const SUPPORT = 'Actions are decision support, not advice. MyPrediction places no trades.';
export const LATE_RULE = 'Settled · OWN-07';
export const BROWSER_UNVERIFIED = 'How a browser protects saved records is unverified.';
export const EMPTY = { title: 'No holdings yet', text: 'Add what you hold and MyPrediction starts watching it. It never connects to a broker.' };

/* ---------- the day's move (home.js: dayLine, dayWord) ---------- */
/** The day's move in pounds is the design's figure: the sample holds no opening value to compute it from. */
export const DAY_CHANGE: Money = { pence: 123_618, currency: 'GBP' };
/** The day's move as a share of the opening value, computed from the total and the move (lesson 37). */
export function dayPct(total: Money, change: Money): string {
  const open = total.pence - change.pence;
  if (open <= 0) throw new Error('no opening value');
  return `${((change.pence / open) * 100).toFixed(2)}%`;
}
export const dayWord = (st: DesignState): string => (st === 'error' ? 'last good' : 'today');

/* ---------- the value and what it leaves out (home.js: valOf, META, allocOf) ---------- */
/** In Stale a holding past the freshness limit leaves the total; in every other state a late price stays in it. */
export const isOut = (h: Holding, st: DesignState): boolean => st === 'stale' && !!h.staleAt;

export interface Value {
  label: string;
  total: Money;
  holdings: Money;
  cash: Money;
  priced: number;
  count: number;
  out: Holding[];
}

const gbp = (pence: number): Money => ({ pence, currency: 'GBP' });

export function valueOf(p: Portfolio, st: DesignState): Value {
  const out = p.items.filter((h) => isOut(h, st));
  const kept = p.items.filter((h) => !isOut(h, st));
  const held = kept.reduce((a, h) => a + h.value.pence, 0);
  const count = p.items.length;
  const priced = kept.length;
  return {
    label: out.length ? `Known value, ${priced} of ${count} priced` : 'Portfolio value',
    total: gbp(held + p.cash.pence),
    holdings: gbp(held),
    cash: p.cash,
    priced,
    count,
    out
  };
}

/** The line under the value, by state. Stale's names what it leaves out, with money, so the page draws that one itself. */
export function metaOf(st: DesignState, asOf: string, v: Value): string {
  if (st === 'loading') return 'Refreshing · showing 22:15';
  if (st === 'error') return LASTGOOD_ALL;
  if (st === 'offline') return 'Saved 22:15 · not updating';
  if (st === 'stale') return asOfAll(asOf);
  return `${asOfAll(asOf)} · ${v.priced} of ${v.count} priced`;
}

/** The market a venue belongs to, as the allocation names it. */
export const MARKET: Record<string, string> = { XNAS: 'US', ARCX: 'US', XLON: 'UK', XNSE: 'India' };

/**
 * The allocation of what the value counts, by market and cash, each share to one place and kept as text (lesson 64).
 * It takes each slice's colour from the source; a holding left out of the total is left out of the shares too.
 */
export function allocationOf(p: Portfolio, st: DesignState): AllocationSlice[] {
  const v = valueOf(p, st);
  const by = new Map<string, number>();
  for (const h of p.items) {
    if (isOut(h, st)) continue;
    const m = MARKET[h.venue];
    if (!m) throw new Error(`no market for ${h.venue}`);
    by.set(m, (by.get(m) ?? 0) + h.value.pence);
  }
  by.set('Cash', v.cash.pence);
  return p.allocation.map((a) => ({ ...a, pct: (((by.get(a.name) ?? 0) / v.total.pence) * 100).toFixed(1) }));
}
export const allocLabel = (a: AllocationSlice[]): string =>
  `Allocation: ${a.map((s) => `${s.name === 'Cash' ? 'cash' : s.name} ${s.pct}%`).join(', ')}`;

/* ---------- the freshness row (shell.js: freshRow) ---------- */
export interface Fresh {
  kind: 'fresh' | 'stale' | 'offline' | 'error';
  icon?: string;
  text: string;
}
const ok = (who: string): Fresh => ({ kind: 'fresh', text: `${who} · Fresh` });
export function freshOf(st: DesignState): Fresh[] {
  const late: Fresh = { kind: 'stale', icon: 'clock', text: 'Yahoo · HSBC late' };
  switch (st) {
    case 'offline': return [{ kind: 'offline', icon: 'wifi-off', text: 'Offline · from 22:15' }];
    case 'error': return [{ kind: 'error', icon: 'alert', text: 'Twelve Data · error 21:16' }, ok('Yahoo')];
    case 'stale': return [ok('Twelve Data'), { kind: 'stale', icon: 'clock', text: 'Yahoo · HSBC stale' }];
    case 'empty': return [ok('Twelve Data'), ok('Yahoo')];
    case 'loading': return [{ kind: 'fresh', text: 'Refreshing · last good 22:15' }, ok('Twelve Data'), late];
    default: return [ok('Twelve Data'), late];
  }
}

/* ---------- the cost pill (shell.js: PILLM, costPillOf; Prism: costPill) ---------- */
/** The month as Cost states it: [committed, its word, its status, the forecast]. */
export const PILLM: Record<DesignState, readonly [string, string, string, string]> = {
  default: ['46.42', 'committed so far', 'On plan', 'up to £59.73'],
  loading: ['46.42', 'committed so far', 'Refreshing · last good 22:15', 'up to £59.73'],
  empty: ['27.84', 'committed so far', 'New month', 'up to £59.73, the plan'],
  error: ['37.69', 'last reconciled', 'Stale · 39 h old', 'up to £59.73, estimated only'],
  stale: ['46.42', 'committed so far', 'Billing 39 h old', 'up to £59.73'],
  offline: ['46.42', 'committed so far', 'Offline · from 22:15', 'up to £59.73']
};
export interface Pill {
  /** What shows, in order; a part marked sr is read, not shown. */
  parts: { t: string; sr: boolean }[];
  icon?: string;
  /** The bar's fill, per cent of the £100 ceiling. */
  fill: number;
  /** What a screen reader hears after the words. */
  more: string;
}
/**
 * The pill is status, not a link: Cost's month is not built in this step, so the design's "Opens the month" is left
 * off (lesson 28). With amounts hidden the pounds are masked and the bar stays, as a percentage does (OWN-18).
 */
export function pillOf(st: DesignState, hidden: boolean): Pill {
  const [so, word, status, fc] = PILLM[st];
  const whole = `£${Math.round(parseFloat(so))}`;
  const mask = (t: string) => (hidden ? t.replace(/^(Last good )?£[\d.]+/, '$1£••') : t);
  const ceil = { t: ' of £100', sr: true };
  const tail: Partial<Record<DesignState, string>> = { error: ' · collector failed', stale: ' · billing 39 h old', offline: ' · saved' };
  const parts = st === 'loading'
    ? [{ t: mask(`Last good ${whole}`), sr: false }]
    : tail[st] !== undefined
      ? [{ t: mask(whole), sr: false }, ceil, { t: tail[st]!, sr: false }]
      : [{ t: mask(`${whole} of £100`), sr: false }];
  const icon = ({ error: 'alert', stale: 'clock', offline: 'wifi-off' } as Partial<Record<DesignState, string>>)[st];
  return { parts, icon, fill: parseFloat(so), more: hidden ? 'Amounts hidden' : `£${so} ${word}. ${status}. Forecast ${fc}` };
}

/* ---------- the notes over the holdings (home.js: holdingsNote, flagChip) ---------- */
export interface Note {
  kind: '' | 'warn' | 'fall';
  icon: string;
  title: string;
  text: string;
}
export function noteOf(st: DesignState): Note | undefined {
  switch (st) {
    case 'loading': return { kind: '', icon: 'refresh', title: 'Refreshing.', text: 'The last good rows from 22:15 stay here, with their ranges and flags, until the run lands.' };
    case 'error': return { kind: 'fall', icon: 'alert', title: 'The US run did not issue.', text: 'Twelve Data failed at 21:16. Apple, NVIDIA and SPY show Monday\'s run, issued 22:15 · cutoff 22:00. The UK and India ran today, each on its own clock.' };
    case 'offline': return { kind: '', icon: 'wifi-off', title: 'Offline.', text: `Holdings from 22:15, saved on this device. Nothing here is fresh analysis until you reconnect. ${BROWSER_UNVERIFIED}` };
    default: return undefined;
  }
}
/** A late or stale price, said on its row. */
export const flagWord = (st: DesignState): string => (st === 'stale' ? 'Stale' : 'Late');
export const flagText = (h: Holding, st: DesignState): string => `${flagWord(st)}: last price ${h.staleAt} (${stamp(h, st).who})`;
export const OUT_NOTE = 'Left out of the total until its price returns.';

/* ---------- a holding's range (Prism: range, on one shared scale, −20% to +36%) ---------- */
export const RMIN = -20;
export const RMAX = 36;
export const rangeLabel = (h: Holding): string => `6-month forecast: median ${pct(h.med)}, 80% range ${pct(h.lo)} to ${pct(h.hi)}`;
