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
 * The pill is the design's button, in the design's words, "Opens the month" with them. Cost's month is not built in this
 * step, so pressing it says so beside it and opens nothing (lesson 28: the promise has a destination, the note). With
 * amounts hidden the pounds are masked and the bar stays, as a percentage does (OWN-18).
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
  return { parts, icon, fill: parseFloat(so), more: hidden ? 'Amounts hidden. Opens the month' : `£${so} ${word}. ${status}. Forecast ${fc}. Opens the month` };
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

/* ---------- money as Prism draws it (Prism: money, roll; home.js pTr) ---------- */
/** A figure split for Prism's money(): the whole pounds with their sign, and the pence after the point. It formats as
 * privacy.svelte.ts shownMoney does (tests/unit/home.test.ts holds the two equal); this file stays free of runes so the
 * browser tests can read its words. */
const GBP = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 });
export function moneyParts(m: Money): { whole: string; pence: string } {
  if (!Number.isSafeInteger(m.pence)) throw new Error('money must be whole pence');
  const s = GBP.format(m.pence / 100);
  const at = s.lastIndexOf('.');
  if (at < 0) throw new Error(`no pence in ${s}`);
  return { whole: s.slice(0, at), pence: s.slice(at + 1) };
}

/* ---------- the horizon switch (Prism: H36) ---------- */
export const HORIZONS = [{ s: '3M', n: '3 months' }, { s: '6M', n: '6 months' }, { s: '12M', n: '12 months' }] as const;
/** The horizon Home reads at: 6 months, the middle of the three. */
export const HZ_ON = 1;

/* ---------- the top 5 board (home.js: ORDER, LIST, score, bTile, legendT) ---------- */
/** The board's order: eight tiles, gold and silver last. */
export const ORDER = ['uslarge', 'ustech', 'n50', 'midcap', 'usetf', 'uketf', 'inetf', 'metals'] as const;
/** Each segment's market, for its price time and source. */
export const SEGP: Record<string, string> = { uslarge: 'XNAS', ustech: 'XNAS', usetf: 'ARCX', uketf: 'XLON', n50: 'XNSE', midcap: 'XNSE', inetf: 'XNSE' };
export type ListRow = readonly [string, number, number, number];
/**
 * Each list as the design ranks it: [ticker, growth, protection, opportunity]. The sample source carries only US tech and
 * Nifty 50 (Prism's T5), so the board's lists are the design's own, illustrative; tests/unit/home.test.ts holds the two
 * the source carries equal to these and every tile to the rendered design. US tech has four: the fifth is withheld.
 */
export const LIST: Record<string, readonly ListRow[]> = {
  uslarge: [['JPM', 72, 70, 66], ['JNJ', 58, 80, 60], ['BRK.B', 60, 78, 56], ['LLY', 80, 50, 68], ['XOM', 56, 70, 60]],
  ustech: [['MSFT', 78, 72, 72], ['NVDA', 88, 52, 78], ['AAPL', 68, 70, 65], ['AMZN', 74, 60, 64]],
  n50: [['ICICIBANK', 76, 70, 70], ['HDFCBANK', 68, 74, 63], ['TCS', 62, 74, 60], ['INFY', 64, 66, 60], ['SBIN', 66, 56, 61]],
  midcap: [['PERSISTENT', 74, 56, 70], ['MAXHEALTH', 72, 58, 64], ['FEDERALBNK', 62, 62, 60], ['TATAPOWER', 64, 54, 62], ['POLYCAB', 60, 54, 60]],
  usetf: [['SPY', 60, 82, 58], ['QQQ', 72, 62, 66], ['VTI', 58, 78, 58], ['DIA', 54, 76, 54], ['IWM', 62, 58, 64]],
  uketf: [['VUSA', 60, 78, 58], ['VWRL', 58, 80, 56], ['CNX1', 70, 60, 62], ['ISF', 50, 76, 62], ['VMID', 52, 66, 60]],
  inetf: [['NIFTYBEES', 58, 76, 56], ['BANKBEES', 64, 62, 58], ['JUNIORBEES', 66, 58, 60], ['ITBEES', 60, 60, 60], ['MID150BEES', 66, 50, 62]]
};
/** Score = growth 35% + protection 40% + opportunity 25%, computed from its three parts (home.js score). */
export const score = (r: ListRow): number => Math.round(0.35 * r[1] + 0.4 * r[2] + 0.25 * r[3]);
/** Gold and silver: prices and no list (OWN-26). */
export const METALS: readonly (readonly [string, string])[] = [['Gold', '$2,684'], ['Silver', '$31.72']];
const quoteAt = (st: DesignState): string => (st === 'offline' ? 'saved 22:15' : st === 'error' ? 'Mon 21:00' : '21:00');
/** A tile's foot: its market's price time, or the saved copy, or the last good run. */
export function tileFoot(k: string, st: DesignState): string {
  if (k === 'metals') return `Quote ${quoteAt(st)} · Daily bar, cover unproven (OWN-26)`;
  const p = PRICE[SEGP[k] ?? ''];
  if (!p) throw new Error(`no price clock for ${k}`);
  const [t, who] = p;
  return st === 'offline' ? 'Saved 22:15' : st === 'error' ? `Ranked 2 Nov · ${who} Mon ${t}` : `${who} ${t}`;
}
/** Gold and silver's line, short on the desktop's small tiles. */
export const metalsLine = (sm: boolean): string => (sm ? 'Not ranked (SCI-D08)' : 'Not ranked until their daily bar proves cover for a first month (OWN-26).');
export const rankLine = (st: DesignState): string => `Ranked ${st === 'error' ? '2' : '3'} Nov · policy v1 · decision support`;
export const LEGEND = ['Score out of 100', 'Ranked on 3 to 12 months, re-ranked daily'] as const;

/** The note over the board, by state; Empty draws none. The stale holding is named from the source. */
export function boardNoteOf(st: DesignState, late?: Holding): Note | undefined {
  switch (st) {
    case 'loading': return { kind: '', icon: 'refresh', title: 'Re-ranking.', text: 'The last good lists stay here until the daily run lands.' };
    case 'error': return { kind: 'fall', icon: 'alert', title: 'Today\'s ranking run failed.', text: 'The lists from 2 November stay current, with their date, until a run succeeds.' };
    case 'stale':
      if (!late) return undefined;
      return { kind: 'warn', icon: 'clock', title: `${late.name} is stale.`, text: `Its last price is ${late.staleAt}. It is in none of these lists, so they stand as ranked until its price returns.` };
    case 'offline': return { kind: '', icon: 'wifi-off', title: 'Offline.', text: `Lists from 22:15, saved on this device. ${BROWSER_UNVERIFIED}` };
    default: return undefined;
  }
}

/* ---------- the brief, as it surfaces on Home (home.js: BL, stamps, briefCard, briefPill) ---------- */
export const BRIEF: Record<DesignState, readonly [string, string]> = {
  default: ['Today\'s brief · 07:30', '3 actions · 2 risks · 2 changes'],
  loading: ['Today\'s brief · 07:30', 'Stays readable while prices refresh'],
  empty: ['First brief tomorrow', 'Due 07:30 London'],
  error: ['Plain brief · 07:30', 'Code wrote it: the text route failed'],
  stale: ['Late brief · issued 09:12', 'MyPrediction was down at 07:30'],
  offline: ['Saved brief · 07:30', 'Readable offline, not updating']
};
export const STAMPS = ['US closed Mon 21:00', 'UK closed Mon 16:35', 'India closed Mon 10:00'] as const;
export const BRIEF_FIRST = 'The brief starts the morning after your first holdings are in. Each market keeps its own timestamp.';

/* ---------- the ranked actions in the rail (home.js: ACTS, actRows) ---------- */
export const ACTS_LEAD = 'Decision support, with the reasons a tap away.';
export interface Act { ticker: string; name: string; action: string; why: string; settled: boolean }
/**
 * The three ranked actions, each reason computed from the source: NVIDIA's share of the portfolio, SPY's range, and
 * HSBC's late or stale price beside its market's close (lesson 37).
 */
export function actsOf(p: Portfolio, st: DesignState): Act[] {
  const by = (t: string): Holding => {
    const h = p.items.find((x) => x.ticker === t);
    if (!h) throw new Error(`no holding ${t}`);
    return h;
  };
  const nvda = by('NVDA'), spy = by('SPY'), hsba = by('HSBA');
  const share = ((nvda.value.pence / p.total.pence) * 100).toFixed(1);
  const close = PRICE[hsba.venue]?.[0];
  return [
    { ticker: 'NVDA', name: nvda.name, action: nvda.action, why: `Widest 80% range of the holdings, and ${share}% of the portfolio.`, settled: false },
    { ticker: 'SPY', name: spy.name, action: spy.action, why: `Among the narrowest 80% ranges of the holdings: ${pct(spy.lo)} to ${pct(spy.hi)}.`, settled: false },
    {
      ticker: 'HSBA', name: hsba.name, action: hsba.action, settled: true,
      why: st === 'stale'
        ? `Last price ${hsba.staleAt}, past the freshness limit. Out of the total until its price returns.`
        : `Last price ${hsba.staleAt}, before the ${close} UK close. Late but inside the limit, so its forecast is held.`
    }
  ];
}

/* ---------- what a control not built in this step says when pressed ---------- */
/** One sentence each: the act comes in a later build step. Nothing is written. */
export const LATER = {
  cost: 'The month\'s costs open in a later build step.',
  search: 'Search comes in a later build step.',
  horizon: 'Switching the forecast horizon comes in a later build step.',
  retry: 'Trying the run again comes in a later build step.',
  add: 'Adding a holding comes in a later build step.',
  brief: 'The daily brief opens in a later build step.',
  act: 'An action\'s reasons open in a later build step.',
  tile: 'A segment\'s list opens in a later build step.'
} as const;
