/**
 * Holdings, option A "Review desk" (docs/design/journeys/src/journeys/holdings.js, MP-205): the figures and words the
 * design writes that the sample source does not hold. Each string here is copied word for word, and
 * tests/unit/holdings.test.ts finds every one in its design file, so none can drift. Value, today's move, the forecast
 * range and the ranked action come from the source (Prism's sample), never from here. All of it is illustrative.
 */

/** The files these words are copied from, relative to the repository root. */
export const HOLDINGS_JS = 'docs/design/journeys/src/journeys/holdings.js';
export const SHELL_JS = 'docs/design/journeys/src/shell.js';
export const PRISM_HTML = 'docs/design/prism/index.html';

/** The chip on a row still loading (Prism, skelRow). */
export const SKEL_CHIP = 'Last good 22:15';

/** An evidence label's kind, as the design's ev() draws it. */
export type EvKind = 'ok' | 'part' | 'none' | 'amb' | 'old' | 'bad';
export type Ev = readonly [EvKind, string];

/** A rule's label beside a line: a pick that settles it, or the record that leaves it open. */
export type Rule = readonly ['settled' | 'proposed', string];

/** The ledger behind the shared figures (holdings.js, const L): where it is held, the units, gain, return and evidence. */
export interface Ledger {
  at: string;
  units: string;
  gain: string;
  ret: string;
  ev: Ev;
  /** The status the desktop table shows in its Evidence column. */
  s: Ev;
}
export const LEDGER: Record<string, Ledger> = {
  AAPL: { at: '2 accounts', units: '88 units', gain: '+£3,288.10', ret: '+14.2% a year', ev: ['ok', 'Part analytical'], s: ['ok', 'Available'] },
  NVDA: { at: 'General account', units: '60 units', gain: '+£4,902.10', ret: '+31.6% a year', ev: ['ok', 'Available'], s: ['ok', 'Available'] },
  SPY: { at: 'General account', units: '40 units', gain: '+£3,160.00', ret: '+9.8% a year', ev: ['ok', 'Available'], s: ['ok', 'Available'] },
  AZN: { at: 'Stocks ISA', units: '85 units', gain: '+£1,015.75', ret: 'No rate stated', ev: ['amb', 'Nonconvergent'], s: ['amb', 'Nonconvergent'] },
  HSBA: { at: 'Stocks ISA', units: '700 units', gain: '+£804.20', ret: '+8.1% a year', ev: ['old', 'Price 14:10'], s: ['old', 'Late'] },
  RELIANCE: { at: 'India demat', units: '120 units', gain: '+£1,240.30', ret: 'No single rate', ev: ['amb', 'Ambiguous'], s: ['amb', 'Ambiguous'] },
  NIFTYBEES: { at: 'India demat', units: '4,200 units', gain: 'Unavailable', ret: 'Unavailable', ev: ['none', 'Snapshot only'], s: ['none', 'Unavailable'] }
};

/** One measure of a holding: name, figure, status, why, and the rule the why rests on. The design draws five holdings. */
export interface Measure {
  k: string;
  v: string;
  s: Ev;
  n: string;
  rule?: Rule;
}
export const MEASURES: Record<string, Measure[]> = {
  AAPL: [
    { k: 'Value', v: '£14,820.50', s: ['ok', 'Available'], n: 'Priced 21:00, Twelve Data. FX 20:58.' },
    { k: 'Cost basis', v: '£11,532.40', s: ['ok', 'Available'], n: 'Broker figure for the ISA; analytical FIFO for the General account, not tax basis.' },
    { k: 'Gain', v: '+£3,288.10 (+28.5%)', s: ['ok', 'Available'], n: 'Value less the cost basis above.' },
    { k: 'Money-weighted return', v: '+14.2% a year', s: ['ok', 'Available'], n: 'Local +11.9, FX +1.9, interaction +0.4 points. FX estimated from dated reference rates.' }
  ],
  NIFTYBEES: [
    { k: 'Value', v: '£15,169.55', s: ['ok', 'Available'], n: 'From a snapshot of 4,200 units. Priced 10:00, Yahoo.' },
    { k: 'Cost basis', v: 'Unavailable', s: ['none', 'Unavailable'], n: 'No purchase history. Nothing is invented to fill it.' },
    { k: 'Gain', v: 'Unavailable', s: ['none', 'Unavailable'], n: 'Needs a cost basis.' },
    { k: 'Money-weighted return', v: 'Unavailable', s: ['none', 'Unavailable'], n: 'Needs dated cash flows. Never shown as zero.' }
  ],
  HSBA: [
    { k: 'Value', v: '£6,104.20', s: ['old', 'Stale'], n: 'Last price 14:10, Yahoo. Left out of the total until its price returns.', rule: ['settled', 'OWN-07'] },
    { k: 'Cost basis', v: '£5,300.00', s: ['ok', 'Available'], n: 'Broker figure, statement of 30 Sep.' },
    { k: 'Gain', v: '+£804.20 (+15.2%)', s: ['old', 'Stale'], n: 'Uses the 14:10 price.' },
    { k: 'Money-weighted return', v: 'Withheld', s: ['old', 'Stale'], n: 'Its closing value is stale, so the rate is withheld until its price returns.' }
  ],
  RELIANCE: [
    { k: 'Value', v: '£8,940.30', s: ['ok', 'Available'], n: 'Priced 10:00, Yahoo. FX 20:58.' },
    { k: 'Cost basis', v: '£7,700.00', s: ['ok', 'Available'], n: 'Broker figure in INR, dated FX labelled estimated.' },
    { k: 'Gain', v: '+£1,240.30 (+16.1%)', s: ['ok', 'Available'], n: 'Value less the cost basis above.' },
    { k: 'Money-weighted return', v: 'No single rate', s: ['amb', 'Ambiguous'], n: 'These cash flows change direction three times, so more than one rate could fit. The search found +22.3% a year and cannot prove it is the only one, so none is picked. FX estimated from dated reference rates.', rule: ['settled', 'OWN-14'] }
  ],
  AZN: [
    { k: 'Value', v: '£9,215.75', s: ['ok', 'Available'], n: 'Priced 16:35, Yahoo.' },
    { k: 'Cost basis', v: '£8,200.00', s: ['ok', 'Available'], n: 'Broker figure, statement of 30 Sep.' },
    { k: 'Gain', v: '+£1,015.75 (+12.4%)', s: ['ok', 'Available'], n: 'Value less the cost basis above.' },
    { k: 'Money-weighted return', v: 'No rate stated', s: ['amb', 'Nonconvergent'], n: 'These cash flows change direction three times, and the search used its budget before it could separate the possible rates, so none is stated. Same inputs give the same result. Diagnostics kept.', rule: ['proposed', 'FIN-OD-04'] }
  ]
};
/** The return measure in Error: the design's own row, replacing the return. */
export const RETURN_FAILED: Measure = { k: 'Money-weighted return', v: 'Not shown', s: ['bad', 'Integrity failed'], n: 'The cash flows did not balance at 21:16. No partial rate is shown. It is tried again on the next run.' };

/** In your accounts: account, units, value, basis, return (holdings.js, accountsOf). */
export type AccountRow = readonly [string, string, string, string, string];
export const ACCOUNTS: Record<string, AccountRow[]> = {
  AAPL: [['Stocks ISA', '60 units', '£10,104.90', 'Basis £7,920.00, broker', '+13.1% a year'], ['General account', '28 units', '£4,715.60', 'Basis £3,612.40, analytical, not tax basis', '+17.0% a year']],
  NIFTYBEES: [['India demat', '4,200 units', '£15,169.55', 'No basis: snapshot of 30 Sep', 'Unavailable']],
  HSBA: [['Stocks ISA', '700 units', '£6,104.20', 'Basis £5,300.00, broker', 'Withheld · Stale']],
  RELIANCE: [['India demat', '120 units', '£8,940.30', 'Basis £7,700.00, broker', 'No single rate']],
  AZN: [['Stocks ISA', '85 units', '£9,215.75', 'Basis £8,200.00, broker', 'No rate stated']]
};

/** The reasons behind a ranked action, in the same parts as the ranking (holdings.js, WHY). Drawn for two holdings. */
export const WHY: Record<string, readonly [string, string]> = {
  AAPL: ['Protection leads, and no part is weak.', 'Growth 68, Protection 70, Opportunity 65 · score 68 · Policy v1'],
  NIFTYBEES: ['Protection leads, and its growth and opportunity sit close together.', 'Growth 58, Protection 76, Opportunity 56 · score 65 · Policy v1']
};
export const WHY_TAIL = 'Your return is not part of it.';

/** Where each holding's records come from (holdings.js, SRC and sourcesOf): kind, name, status. */
export type Provenance = readonly [string, string, string];
const SRC = {
  gen: ['CSV', 'General account, Q3', 'Committed 24 Oct · R-0212'],
  isa: ['PDF', 'ISA statement, September', 'Committed 6 Oct · R-0210'],
  ind: ['PDF', 'India demat, September', 'Committed 2 Oct · R-0209'],
  gone: ['PDF', 'ISA statement, January 2024', 'Original deleted · its ledger event stays']
} as const satisfies Record<string, Provenance>;
export const SOURCES: Record<string, Provenance[]> = {
  AAPL: [SRC.isa, SRC.gen, SRC.gone],
  NIFTYBEES: [SRC.ind],
  RELIANCE: [SRC.ind],
  AZN: [SRC.isa],
  HSBA: [SRC.isa]
};

/** Each market's run, London time: [as of, data cutoff] (shell.js, CLOCK). */
export const CLOCK: Record<string, readonly [string, string]> = { XNAS: ['22:15', '22:00'], ARCX: ['22:15', '22:00'], XLON: ['17:50', '17:35'], XNSE: ['11:15', '11:00'] };
export const CUTOFFS = 'cutoffs US 22:00, UK 17:35, India 11:00';
export const LASTGOOD_ALL = 'US: last good run Mon 22:15 · cutoff 22:00. UK and India ran today';

/** Words, as the design writes them. */
export const SAY = {
  late: 'HSBC last priced 14:10, before the 16:35 UK close. That is inside the freshness limit, so it stays in the total.',
  staleTitle: 'HSBC is stale.',
  stale: 'Its last price, 14:10, is past the freshness limit, so it leaves the total until its price returns, and its forecast is held.',
  offline: 'Showing holdings from 22:15. Imports and approvals wait until you reconnect.',
  offlineTitle: 'Offline.',
  offlineOneHead: 'Showing ',
  offlineOneTail: ' from 22:15. Nothing updates until you reconnect.',
  browserKept: 'Saved in this browser',
  browserUnverified: 'How a browser protects saved records is unverified.',
  errorTitle: 'The US run did not issue',
  error: 'Twelve Data failed at 21:16. Apple, NVIDIA and SPY are the last good figures, from Monday\'s run, issued 22:15. The UK and India ran today. They may have moved.',
  tryAgain: 'Try again',
  emptyTitle: 'No holdings yet',
  empty: 'Holdings come from records you approve: a statement, a spreadsheet, a screenshot or a typed entry. MyPrediction never connects to a broker.',
  goImports: 'Go to Imports',
  hiddenTitle: 'Amounts hidden.',
  hidden: 'Money and units are masked, and percentages stay, here and in Imports.',
  foot: 'Decision support: each holding gives the reasons for its action, and forecast ranges are 80%. ',
  footTail: 'MyPrediction never places a trade. Illustrative.',
  valueLabel: 'Portfolio value',
  partialLabel: 'Known value, 6 of 7 priced',
  partial: 'Partial',
  partialSubHead: 'HSBC, ',
  partialSubTail: ' at 14:10, in your ISA, is left out until its price returns.',
  today: 'today',
  dayMove: '+£1,236.18 (1.39%)',
  refreshing: 'Last good 22:15 · refreshing',
  illustrative: 'Illustrative',
  ret: '+11.8%',
  retPartial: '+12.9%',
  aYear: ' a year',
  gainOn: 'Gain on ',
  returnOn: 'Return on ',
  coverageTitle: 'What your evidence supports',
  coverageStale: 'HSBC is past the freshness limit, so it leaves the value, gain and return. ',
  coverage: 'Nippon India Nifty 50 BeES is a snapshot with no history. Older statements fill the gaps. No single rate is proved for Reliance. For AstraZeneca the search used its budget before it could separate the possible rates, so none is stated.',
  watchTitle: 'Not held, to watch',
  watchSub: 'A candidate, not a holding. It adds nothing to your value.',
  watch: 'Watch',
  decisionSupport: 'Decision support',
  forecastHeld: 'Forecast held',
  lastPrice: 'Last price ',
  oneFrom: 'From 22:15 · not updating',
  inAccounts: 'In your accounts',
  notShown: 'Not shown',
  whereFrom: 'Where this comes from',
  oneFailedTitle: 'One measure failed',
  oneFailed: 'Value, cost basis and gain are sound. Only the return failed its check, so only the return is held back.',
  snapshotTitle: 'Snapshot only',
  snapshot: 'You have units and a value, with no purchases behind them. Older statements fill the history through a rebuild you approve. Forecasts you have seen stay as they were.',
  heldText: 'HSBC last priced 14:10. Its forecast is held and its action stays Pause until its price returns.',
  heldChip: 'Yahoo · HSBC stale',
  evaluated: 'Evaluated model',
  model: 'R2-HGB v3',
  ranked: 'Ranked action · 6 months',
  median: 'median',
  imports: 'Imports',
  hideAmounts: 'Hide amounts',
  oneTitle: 'One holding'
} as const;

/** The candidate the design draws apart from what you own (holdings.js, watchCard): its 6-month range, per cent. */
export const WATCH = { name: 'Microsoft', ticker: 'MSFT', logo: 'M', color: '--seg-ustech', med: 7, lo: -8.8, hi: 22 } as const;

/** Each provider's freshness, state by state (shell.js, freshRow and fresh()). */
export const FRESH = {
  twelve: 'Twelve Data',
  yahoo: 'Yahoo',
  fresh: 'Fresh',
  late: 'HSBC late',
  stale: 'HSBC stale',
  offline: 'Offline · from 22:15',
  error: 'Twelve Data · error 21:16',
  refreshing: 'Refreshing · last good 22:15'
} as const;

/**
 * A sum of money or a count of units inside a written line: what hiding amounts masks, as the design's mask() finds them
 * (holdings.js, AMT and UNITS). One capture group, for split().
 */
export const FIGURE = /([+−]?£[\d,]+(?:\.\d+)?|\b\d[\d,]*(?: → [\d,]+)? units\b)/;

/** The desktop table (holdings.js, holdTable and retCell). */
export const TABLE = {
  title: 'Holdings',
  scale: 'One forecast scale, −20% to +36%',
  head: ['Holding', 'Value', 'Gain', 'Return', '6-month forecast', 'Evidence'],
  held: 'Held'
} as const;
/** A return as the table's Return column writes it: a rate without "a year", a word for a rate not stated, or nothing. */
export function retCell(r: string): { text: string; muted: boolean } | null {
  if (r.startsWith('+')) return { text: r.replace(' a year', ''), muted: false };
  if (r === 'Unavailable') return null;
  const word: Record<string, string> = { 'No single rate': 'Not proved', 'No rate stated': 'Not stated', Withheld: 'Withheld' };
  return { text: word[r] ?? r, muted: true };
}

/** The way to Imports at the foot of the rail, state by state (holdings.js, IMPORT_NOW, importNow and toImports). */
export const IMPORT_NOW: Record<string, string> = { ready: '1 import is being read', loading: '1 import is uploading', error: '3 files not taken in', stale: '1 import last seen at 21:09', offline: '1 upload stopped at 62%' };
export const DIFF_OPEN = '1 difference open';
export const IMPORT_SUB = 'General account, Q3 · cash differs by £8.15. Nothing here changes until you approve it.';

/** The one control these screens draw whose act is not built yet, and the one sentence it says when pressed. */
export const LATER = {
  record: 'Record decision',
  recordSay: 'Recording a decision comes in a later build step; nothing was recorded.'
} as const;
/** Where a holding's reasons are not in the sample data. */
export const NO_WHY = 'The reasons for this action are not in the sample data yet.';

/** Per cent as the design prints it: a sign, one decimal and a true minus (index.html, pct). */
export function pct(v: number, d = 1): string {
  return (v < 0 ? '−' : '+') + Math.abs(v).toFixed(d) + '%';
}

/** "+£3,288.10" to signed whole pence; null when the figure is not money. */
export function pencePart(s: string): number | null {
  const m = /^([+−-]?)£(\d{1,3}(?:,\d{3})*)\.(\d{2})/.exec(s);
  if (!m) return null;
  const p = Number(m[2]!.replace(/,/g, '')) * 100 + Number(m[3]);
  return m[1] === '−' || m[1] === '-' ? -p : p;
}

/** The return as a data state leaves it: a stale valuation withholds the rate that rests on it (holdings.js, retOf). */
export function returnOf(ticker: string, stale: boolean): string {
  const l = LEDGER[ticker];
  if (!l) return 'Unavailable';
  return stale && ticker === 'HSBA' ? 'Withheld' : l.ret;
}

/**
 * Gain and how far the evidence goes, counted from the ledger rows rather than written down (lesson 37). In the stale
 * state HSBC leaves the value, gain and return; its cost basis stays.
 */
export function coverage(stale: boolean) {
  const rows = Object.entries(LEDGER);
  const out = stale ? new Set(['HSBA']) : new Set<string>();
  const basis = rows.filter(([, l]) => l.gain !== 'Unavailable');
  const gains = basis.filter(([t]) => !out.has(t));
  const rets = rows.filter(([t]) => returnOf(t, stale).startsWith('+'));
  return {
    of: rows.length,
    value: rows.length - out.size,
    basis: basis.length,
    gain: gains.length,
    ret: rets.length,
    gainPence: gains.reduce((a, [, l]) => a + (pencePart(l.gain) ?? 0), 0)
  };
}

const GBP = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 });
const NUM = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** Pence as the design writes a sum inside its own pound sign: "14,820.50". */
export function plain(pence: number): string {
  if (!Number.isSafeInteger(pence)) throw new Error('money must be whole pence');
  return NUM.format(pence / 100);
}

/** Signed pence as the design writes a gain: "+£14,410.45", or a true minus. */
export function signedGbp(pence: number): string {
  return (pence < 0 ? '−' : '+') + GBP.format(Math.abs(pence) / 100);
}

/** One holding's as-of and cutoff, by its market. */
export function asOf(venue: string): string {
  const [a, c] = CLOCK[venue] ?? CLOCK.XNAS!;
  return `As of ${a} London · data cutoff ${c}`;
}
/** In Error the US run failed, so a US holding reads its last good run; the UK and India ran today (holdings.js, lastH). */
export function lastGood(venue: string): string {
  const [a, c] = CLOCK[venue] ?? CLOCK.XNAS!;
  return venue === 'XNAS' || venue === 'ARCX' ? `Last good run Mon ${a} · cutoff ${c}` : asOf(venue);
}
