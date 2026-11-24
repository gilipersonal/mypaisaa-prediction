/**
 * The decision journal's sample: the seven illustrative entries the Journal design draws (docs/design/journeys/src/journeys/
 * journal.js, option A "Timeline", const D and the one-decision screen), with the design's "today" of 3 Nov 2026 (MP-158).
 * Synthetic: nothing here is the owner's, and every figure is illustrative. An entry records what the owner did and why,
 * at the broker, outside the app; MyPrediction places no trades and an entry never changes a holding.
 *
 * Holdings are named by ticker only; their names, logos and colours are read from Prism's sample (source.portfolio()).
 * A number of units is written in braces, "{60}", so it can be masked when amounts are hidden (OWN-18).
 * tests/unit/journal.test.ts finds every text and figure here in the rendered design, so none can drift.
 */
export const synthetic = true;

/** The outcome state of an entry, as MP-130 and MP-154 name it: waiting for its horizon, scored inside or outside its 80% range, or unresolved. */
export type OutcomeState = 'wait' | 'in' | 'out' | 'open';
export type Ranked = 'Add' | 'Hold' | 'Pause' | 'Trim';

/** A forecast as it stood when the decision was made, in per cent. */
export interface FrozenForecast {
  when: string;
  med: number;
  lo: number;
  hi: number;
  lo50: number;
  hi50: number;
}

export type Result =
  | {
      kind: 'scored';
      title: string;
      sub: string;
      chip: string;
      forecast: FrozenForecast;
      outcome: number;
      lines: [string, string][];
      happened: { passed: string; text: string };
    }
  | { kind: 'pending'; title: string; text: string }
  | { kind: 'unresolved'; title: string; text: string };

/** What one decision shows when it is opened: the result, what was recorded, and the evidence as it was seen, frozen. */
export interface EntryDetail {
  title: string;
  seenOn: string;
  recorded: string;
  seen: [string, string][];
  model: string;
  policy: string;
  cutoff: string;
  said: string;
  result: Result;
}

export interface JournalEntry {
  id: string;
  ticker: string;
  on: string;
  horizon: string;
  ranked: Ranked;
  you: string;
  differed: boolean;
  outcome: OutcomeState;
  /** For a waiting entry, how long is left. */
  left?: string;
  line: string;
  /** Only the decisions the design draws opened have a detail; the others do not open. */
  detail?: EntryDetail;
}

const NVDA_THEN: FrozenForecast = { med: 7.8, lo: -16.2, hi: 30.1, lo50: -4.8, hi50: 19.5, when: '28 April' };
const AZN_THEN: FrozenForecast = { med: 2.4, lo: -9.8, hi: 12.6, lo50: -4, hi50: 7.8, when: '3 March' };

/** Newest first, append-only, as the journal lists them. */
export const ENTRIES: readonly JournalEntry[] = [
  { id: 'nvda-today', ticker: 'NVDA', on: 'Today', horizon: '6 months', ranked: 'Trim', you: 'You chose not to', differed: true, outcome: 'wait', left: 'Due 3 May', line: 'Nothing is scored before 3 May 2027.' },
  { id: 'spy', ticker: 'SPY', on: '21 Aug 2026', horizon: '3 months', ranked: 'Add', you: 'You added {6} units', differed: false, outcome: 'wait', left: '17 days', line: 'Outcome due 20 Nov 2026.' },
  { id: 'reliance', ticker: 'RELIANCE', on: '2 Jun 2026', horizon: '3 months', ranked: 'Add', you: 'You chose not to', differed: true, outcome: 'in', line: 'Rose 5.1%, inside its 80% range.' },
  {
    id: 'aapl', ticker: 'AAPL', on: '12 May 2026', horizon: '6 months', ranked: 'Hold', you: 'You held', differed: false, outcome: 'wait', left: '9 days', line: 'Outcome due 12 Nov 2026.',
    detail: {
      title: 'Apple · 12 May', seenOn: '12 May', recorded: '12 May 2026',
      seen: [['6-month median', '+5.4%'], ['80% range', '−8.9% to +19.7%']], model: 'R2-HGB v2', policy: 'Policy v1', cutoff: '12 May 22:00',
      said: 'I acted. Held all {88} units. Nothing in the range changed my view.',
      result: { kind: 'pending', title: 'Outcome due 12 Nov 2026', text: 'Apple, Hold, recorded 12 May. Nothing is scored before its horizon passes, so this has no score yet.' }
    }
  },
  {
    id: 'nvda', ticker: 'NVDA', on: '28 Apr 2026', horizon: '6 months', ranked: 'Trim', you: 'You chose not to', differed: true, outcome: 'in', line: 'Rose 12.4%, inside its 80% range.',
    detail: {
      title: 'NVIDIA · 28 Apr', seenOn: '28 Apr', recorded: '28 Apr 2026',
      seen: [['6-month median', '+7.8%'], ['80% range', '−16.2% to +30.1%']], model: 'R2-HGB v2', policy: 'Policy v1', cutoff: '28 Apr 22:00',
      said: 'I chose not to. Kept all {60} units. Long-term position. I accept the wider range for now.',
      result: {
        kind: 'scored', title: 'Scored on 28 Oct 2026', sub: 'Horizon passed, every input in', chip: 'Inside its range', forecast: NVDA_THEN, outcome: 12.4,
        lines: [['80% range', 'Held'], ['Direction', 'As forecast'], ['Error against the median', '4.6 points']],
        happened: { passed: 'Horizon passed 28 Oct 2026', text: 'NVIDIA rose 12.4% in the 6 months.' }
      }
    }
  },
  {
    id: 'hsba', ticker: 'HSBA', on: '14 Apr 2026', horizon: '6 months', ranked: 'Pause', you: 'You paused new money', differed: false, outcome: 'open', line: 'A dividend is disputed, so nothing is scored yet. It is never a zero.',
    detail: {
      title: 'HSBC · 14 Apr', seenOn: '14 Apr', recorded: '14 Apr 2026',
      seen: [['6-month median', '+1.6%'], ['80% range', '−9.4% to +11.8%']], model: 'R2-HGB v2', policy: 'Policy v1', cutoff: '14 Apr 17:35',
      said: 'I acted. Paused new money until the next statement.',
      result: { kind: 'unresolved', title: 'Horizon passed 14 Oct, one input missing', text: 'A dividend is disputed, so this outcome is not known yet. A missing input is never scored as a zero return. It moves the date the outcome becomes known, not the horizon.' }
    }
  },
  {
    id: 'azn', ticker: 'AZN', on: '3 Mar 2026', horizon: '6 months', ranked: 'Hold', you: 'You added {5} units', differed: true, outcome: 'out', line: 'Fell 11.6%, outside its 80% range.',
    detail: {
      title: 'AstraZeneca · 3 Mar', seenOn: '3 Mar', recorded: '3 Mar 2026',
      seen: [['6-month median', '+2.4%'], ['80% range', '−9.8% to +12.6%']], model: 'R2-HGB v2', policy: 'Policy v1', cutoff: '3 Mar 17:35',
      said: 'I acted. Added {5} units. I wanted more of it before results.',
      result: {
        kind: 'scored', title: 'Scored on 3 Sep 2026', sub: 'Horizon passed, every input in', chip: 'Outside its range', forecast: AZN_THEN, outcome: -11.6,
        lines: [['80% range', 'Missed'], ['Direction', 'Against the forecast'], ['Error against the median', '14.0 points']],
        happened: { passed: 'Horizon passed 3 Sep 2026', text: 'AstraZeneca fell 11.6% in the 6 months.' }
      }
    }
  }
];

/** The design's own words for the journal's cards and states, quoted as drawn. */
export const COPY = {
  supportFoot: 'Decision support, not advice. MyPrediction places no trades. Illustrative.',
  week: ['This week', '1 entry recorded. 1 outcome matured last week: NVIDIA, inside its range. Next outcome: Apple, 12 Nov.'],
  sideTitle: 'You and the ranking',
  sideLink: 'See where you differed',
  tooFew: 'Too few scored decisions to show a rate. A scored outcome grades the forecast, not you.',
  howDidTitle: 'How the forecasts did',
  empty: ['No decisions yet', 'Open any ranked action and record what you did, or chose not to do. The outcome joins your entry once its horizon passes.', 'See ranked actions'],
  loadFailed: ['The journal did not load', 'The read failed at 21:16. These are your entries as of 21:05 today. Nothing you saved is lost.'],
  behind: ['Outcomes and rankings are behind.', 'Last joined 14:10. Your entries are complete; the newest scores may be missing. HSBC last priced 14:10, past the freshness limit, so its action holds at Pause until its price returns.'],
  settled: 'Settled · OWN-07',
  offline: 'Showing your journal from 22:15. New entries stay as drafts until you reconnect.',
  offlineOne: 'Showing this entry and its score from 22:15.',
  browserKept: ['Saved in this browser', 'How a browser protects saved records is unverified.'],
  correction: 'A correction is a new entry linked to this one. This one stays.',
  frozen: 'Frozen. It never changes.',
  happenedNote: 'One outcome says little about a decision.',
  joining: ['Joining the outcome', 'Your entry and what you saw are safe. The outcome is being joined to them.'],
  noScore: ['The score did not arrive', 'The scoring job failed at 21:16. It reruns by itself and cannot write twice. Your entry is safe.', 'Check again'],
  differTitle: 'Where you differed',
  differEmpty: ['You have followed every ranked action', 'There is nothing to compare yet. If you decide differently, it appears here with what happened.'],
  differFailed: ['This comparison did not load', 'The read failed at 21:16. These are your entries as of 21:05 today, and they are safe.'],
  differBehind: ['Outcomes are behind.', 'Last joined 14:10, so a newer score may be missing here.'],
  differOffline: 'Showing this comparison from 22:15.',
  fresh: { loading: 'Refreshing · last good 22:15', offline: 'Offline · from 22:15', twelve: 'Twelve Data · Fresh', yahoo: 'Yahoo · Fresh', late: 'Yahoo · HSBC late', stale: 'Yahoo · HSBC stale' },
  lastGood: 'Last good 22:15',
  proof: { label: 'Proof · 6-month task · illustrative', held: 'of 80% ranges held, over 52 scored forecasts', observed: 'Observed 79%', target: 'Target 80%', model: 'Model R2-HGB v3', approved: 'Approved 1 Oct 2026' }
} as const;
