import type { Holding, Portfolio } from '../data/types';
import { dataStateOf, type DataState } from '../data/state';
import { ENTRIES, type FrozenForecast, type JournalEntry } from './sample';

/** Prism's icons the journal draws (docs/design/prism/icons.svg). */
export type JournalIcon =
  | 'clock' | 'split' | 'ban' | 'alert' | 'wifi-off' | 'fan' | 'lock' | 'chev-l' | 'target' | 'cube' | 'refresh' | 'chev-r'
  | 'plus' | 'equal' | 'pause' | 'trim' | 'rebalance' | 'check';

/** One journal entry as a screen shows it: the sample entry with its holding's name, logo and colour from Prism's sample. */
export interface ShownEntry extends JournalEntry {
  name: string;
  logo: string;
  segColor: string;
}

/** Joins each entry to its holding. Fails closed: an entry whose holding Prism no longer draws is an error, never a blank row. */
export function joinEntries(portfolio: Pick<Portfolio, 'items'>, entries: readonly JournalEntry[] = ENTRIES): ShownEntry[] {
  const by = new Map<string, Holding>(portfolio.items.map((h) => [h.ticker, h]));
  return entries.map((e) => {
    const h = by.get(e.ticker);
    if (!h) throw new Error(`journal: no holding ${e.ticker} in the sample`);
    return { ...e, name: h.name, logo: h.logo, segColor: h.segColor };
  });
}

/** What a state holds: no entries when the journal is empty, the full journal otherwise (as of 21:05 when the read failed). */
export function entriesFor(state: DataState, all: ShownEntry[]): ShownEntry[] {
  return state === 'empty' ? [] : all;
}

/** Counts, never a rate, until enough have scored (MP-154). Computed from the entries, so the sentences always add up (lesson 37). */
export function counts(entries: readonly JournalEntry[]) {
  const part = (list: readonly JournalEntry[]) => ({
    n: list.length,
    scored: list.filter((e) => e.outcome === 'in' || e.outcome === 'out').length,
    waiting: list.filter((e) => e.outcome === 'wait').length,
    unresolved: list.filter((e) => e.outcome === 'open').length
  });
  const scored = entries.filter((e) => e.outcome === 'in' || e.outcome === 'out');
  return {
    all: entries.length,
    followed: part(entries.filter((e) => !e.differed)),
    differed: part(entries.filter((e) => e.differed)),
    scored: scored.length,
    inside: scored.filter((e) => e.outcome === 'in').length,
    outside: scored.filter((e) => e.outcome === 'out').length
  };
}

type Counts = ReturnType<typeof counts>;

/** "3 scored · 1 waiting", leaving out an empty part, as the design writes it. */
export function partLine(p: Counts['followed'], always: ('scored' | 'waiting' | 'unresolved')[] = []): string {
  const bits: string[] = [];
  if (p.scored || always.includes('scored')) bits.push(`${p.scored} scored`);
  if (p.waiting || always.includes('waiting')) bits.push(`${p.waiting} waiting`);
  if (p.unresolved || always.includes('unresolved')) bits.push(`${p.unresolved} unresolved`);
  return bits.join(' · ');
}

export const sideText = (c: Counts): string =>
  `You differed from the ranked action ${c.differed.n} times in ${c.all} decisions. ${c.differed.scored} have scored so far, too few to show a rate.`;

export const howDidText = (c: Counts): string =>
  `Of the ${c.scored} scored, ${c.inside} landed inside their 80% range and ${c.outside} outside. Unresolved and waiting entries are counted apart, never as misses.`;

/** The design's percentage: a sign always, a true minus, one decimal. Percentages stay when amounts are hidden (OWN-18). */
export function pct(v: number, d = 1): string {
  return (v < 0 ? '−' : '+') + Math.abs(v).toFixed(d) + '%';
}

/** What the outcome drawing says to a screen reader: the range you saw and where the outcome landed. */
export function landedLabel(t: FrozenForecast, out: number): string {
  const inside = out >= t.lo && out <= t.hi;
  return `Forecast of ${t.when}: median ${pct(t.med)}, 80% range ${pct(t.lo)} to ${pct(t.hi)}. Outcome ${pct(out)}, ${inside ? 'inside' : 'outside'} the range. Illustrative.`;
}

/** A text with units in braces, as parts: units are masked when amounts are hidden. */
export function unitParts(text: string): { text: string; units: boolean }[] {
  return text.split(/(\{[^}]*\})/).filter(Boolean).map((p) => (p.startsWith('{') ? { text: p.slice(1, -1), units: true } : { text: p, units: false }));
}

/** The plain text, braces removed. */
export const plain = (text: string): string => text.replace(/[{}]/g, '');

/** Where a view is, in the address: the list, one entry, or where you differed. The data state goes along with it. */
export type JournalView = { kind: 'list' } | { kind: 'entry'; id: string } | { kind: 'differed' };

export function viewOf(search: string, entries: readonly JournalEntry[] = ENTRIES): JournalView {
  const q = new URLSearchParams(search);
  const id = q.get('entry');
  if (id !== null) return entries.some((e) => e.id === id && e.detail) ? { kind: 'entry', id } : { kind: 'list' };
  return q.get('view') === 'differed' ? { kind: 'differed' } : { kind: 'list' };
}

/** A link to a view that keeps the data state, the code's own value only (never the address bar's text). */
export function hrefOf(view: JournalView, search: string): string {
  const data = dataStateOf(search);
  const q = new URLSearchParams();
  if (view.kind === 'entry') q.set('entry', view.id);
  if (view.kind === 'differed') q.set('view', 'differed');
  if (data !== 'ready') q.set('data', data);
  const s = q.toString();
  return `/record${s ? `?${s}` : ''}`;
}
