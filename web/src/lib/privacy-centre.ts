/**
 * The privacy centre's words (MP-205), Privacy option A, "One privacy centre" (Recommended): the screen
 * privacy-a-centre, "Settings, then Privacy". Every phrase here is copied from the design source named beside it, and
 * tests/unit/privacy.test.ts finds each one there, so a change starts in the design.
 *
 * Only Hide amounts works in this step. It is a setting on this device, kept like the theme, and writes nothing to any
 * server. Every other control the design draws here (the less private options, phone notifications, a notice) is drawn as
 * designed, never writes anything, and says when pressed that its act comes in a later build step (LATER).
 */
import type { DataState } from './data/state';

/** docs/design/journeys/src/journeys/privacy.js */
export const PRIVACY_JS = 'docs/design/journeys/src/journeys/privacy.js';
/** docs/design/journeys/src/journeys/holdings.js */
export const HOLDINGS_JS = 'docs/design/journeys/src/journeys/holdings.js';
/** docs/design/journeys/src/shell.js */
export const SHELL_JS = 'docs/design/journeys/src/shell.js';

export const COPY = {
  /** the page's back control and title: `back: 'Settings', title: 'Privacy'` */
  back: 'Settings',
  title: 'Privacy',
  /** modeCard: `head('Privacy mode', sw('Hide amounts', true))` */
  mode: 'Privacy mode',
  hide: 'Hide amounts',
  /** maskCopy is `Amounts hidden. ${maskSay}`. The app keeps maskSay's first two sentences and leaves out "Tap to show
   *  for 30 seconds.", because no amount in this step can be shown for a while by a tap. */
  hiddenLead: 'Amounts hidden.',
  hiddenSay: 'Money and units are masked. Percentages and ranges stay visible.',
  /** with amounts shown: the design's own reading of OWN-18 (holdings.js, the "Amounts hidden" screen's note) */
  shownSay: 'Hide amounts masks money and units, and percentages stay.',
  /** outside(ctx): `head('Outside the app', chipOf(['fresh', 'Private default']))` */
  outside: 'Outside the app',
  privateDefault: 'Private default',
  /** lessCard: the sentence about a fresh sign-in */
  fresh: 'Each stays off until you turn it on, and turning one on asks for a fresh sign-in, because it widens what MP may do. Unlocking the app does not count.',
  /** modeCard in Empty */
  noHoldings: 'No holdings yet, so nothing is hidden. It stays on for the first one you add.',
  /** maskValue */
  value: 'Portfolio value',
  leftOut: 'is left out until its price returns',
  holdingsLabel: 'Holdings',
  support: 'Decision support',
  /** skCard */
  lastGood: 'Last good 22:15',
  /** pushCard */
  notifications: 'Notifications',
  phone: 'Phone notifications',
  quiet: 'Quiet hours',
  quietSay: '22:00 to 07:00 London. Held notices arrive with the 07:30 brief on weekdays, and in your inbox at 07:30 at the weekend, when there is no brief (MP40-Q11b)',
  says: 'What a notice says',
  saysSay: 'Neutral text only. A tap opens it after sign-in',
  delivery: 'Delivery is never promised, so silence never means no risk. The inbox keeps every notice either way. On iPhone and iPad this needs the web app on your Home Screen.',
  /** outside(ctx): the last row */
  shared: 'Shared content',
  sharedSay: 'Leaves out holdings values. Nothing is attached without you',
  notSaved: 'Not saved',
  /** inbox(ctx, 3) */
  notices: 'Notices',
  unread: '2 unread',
  noNotices: 'No notices yet. Silence is not a sign that nothing is wrong: check your record and data status.',
  opening: 'Opening a notice shows its evidence. It never performs an action.',
  /** homeSay('error') */
  usFailed: 'The US run failed',
  usFailedSay: 'It failed at 21:16, so the US holdings show Monday\'s run, with their percentages. The UK and India ran today.',
  /** shell.js LASTGOOD_ALL */
  lastGoodAll: 'US: last good run Mon 22:15 · cutoff 22:00. UK and India ran today',
  /** offline rows */
  saved: 'Saved 22:15'
} as const;

/** The design's LESS rows: each less private option and what Off means. */
export const LESS: ReadonlyArray<readonly [string, string]> = [
  ['Holding names on the lock screen', 'Off shows neutral text only'],
  ['Holdings in widgets', 'Off shows no holdings'],
  ['Values in shared content', 'Off leaves out holdings values']
];

/** The design's NOTICES, the three the centre lists: [icon, title, detail, unread, settled by]. */
export const NOTICES: ReadonlyArray<readonly [string, string, string, boolean, string]> = [
  ['alert', 'Cost close to the £60 warning', 'Forecast up to £59.73 · 08:12', true, ''],
  ['clock', 'HSBC price is late', 'Last price 14:10 · 16:50', true, 'OWN-07'],
  ['fan', 'Morning brief', '3 items · 07:30', false, '']
];

/** The rows privacy mode hides on this screen: Apple, the holding the state is about (NVIDIA here), and HSBC (maskedRows). */
export const MASKED = ['AAPL', 'NVDA', 'HSBA'] as const;

/**
 * The portfolio's move today as Prism's sample draws it beside its value ("+£1,236.18 (1.39%)"). The data source carries no
 * day change for the whole portfolio yet, so this one figure is the design's own, and the card says Illustrative.
 */
export const DAY = { pct: '+1.39%' } as const;

/** A banner: [kind, title, text, icon]. */
export type Say = readonly ['' | 'warn' | 'fall', string, string, string];

/** homeSay: what the state says about the holdings, above privacy mode. Error is a state card (see COPY.usFailed). */
export const HOME_SAY: Partial<Record<DataState, Say>> = {
  stale: ['warn', 'Stale.', 'HSBC last priced 14:10. Its forecast is held and its action paused until its price returns.', 'clock'],
  offline: ['', 'Offline.', 'Saved copies. Each row shows its age, and nothing updates until you reconnect.', 'wifi-off']
};

/** lessNote: a change that did not save, or has not reached this device, shows with the less private options. */
export const LESS_NOTE: Partial<Record<DataState, Say>> = {
  empty: ['', 'Private defaults.', 'You have not changed anything here, so nothing confidential shows.', 'shield'],
  error: ['fall', 'That change did not save.', 'The private default stays in force. Try again.', 'alert'],
  stale: ['warn', 'Last synced 14:10.', 'The private defaults stay in force until the next sync.', 'clock'],
  offline: ['', 'Offline.', 'Anything less private waits until you reconnect.', 'wifi-off']
};

/** inbox: what heads the notices in each state. */
export const INBOX_TOP: Partial<Record<DataState, Say>> = {
  error: ['fall', 'Notices did not load.', 'They failed at 21:16. Nothing is lost: every notice stays on the server.', 'alert'],
  stale: ['warn', 'From 14:10.', 'Newer notices appear once this refreshes.', 'clock'],
  offline: ['', 'Offline.', 'Notices saved at 22:15. Each rebuilds from the server when you reconnect.', 'wifi-off']
};

/** pushCard's first row in each state: [icon, detail, control], the control being the switch on or off, or a button. */
export const PUSH: Record<DataState, readonly [string, string, 'on' | 'off' | 'turn-on' | 'turn-back-on']> = {
  ready: ['shield', 'On, through the web app\'s Web Push', 'on'],
  loading: ['shield', 'On, through the web app\'s Web Push', 'on'],
  stale: ['shield', 'On, through the web app\'s Web Push', 'on'],
  empty: ['shield', 'Not asked yet. MyPrediction asks only when you tap', 'turn-on'],
  error: ['alert', 'This subscription expired. Your inbox still has everything', 'turn-back-on'],
  offline: ['wifi-off', 'On. Changes wait until you reconnect', 'on']
};
export const PUSH_BUTTON = { 'turn-on': 'Turn on', 'turn-back-on': 'Turn back on' } as const;

/**
 * The app's own sentences, not the design's: what a drawn control whose act is not built in this step says when pressed.
 * Each says only that the act comes later; none promises when.
 */
export const LATER = {
  less: 'Turning this on comes in a later build step.',
  push: 'Changing phone notifications comes in a later build step.',
  notice: 'Opening a notice comes in a later build step.',
  retry: 'Running it again comes in a later build step.'
} as const;

/** Where each phrase comes from. */
export const SOURCE_OF: Record<keyof typeof COPY, string> = {
  back: PRIVACY_JS, title: PRIVACY_JS, mode: PRIVACY_JS, hide: PRIVACY_JS, hiddenLead: PRIVACY_JS, hiddenSay: PRIVACY_JS,
  shownSay: HOLDINGS_JS, outside: PRIVACY_JS, privateDefault: PRIVACY_JS, fresh: PRIVACY_JS, noHoldings: PRIVACY_JS,
  value: PRIVACY_JS, leftOut: PRIVACY_JS, holdingsLabel: PRIVACY_JS, support: PRIVACY_JS, lastGood: PRIVACY_JS,
  notifications: PRIVACY_JS, phone: PRIVACY_JS, quiet: PRIVACY_JS, quietSay: PRIVACY_JS,
  says: PRIVACY_JS, saysSay: PRIVACY_JS, delivery: PRIVACY_JS, shared: PRIVACY_JS, sharedSay: PRIVACY_JS, notSaved: PRIVACY_JS,
  notices: PRIVACY_JS, unread: PRIVACY_JS, noNotices: PRIVACY_JS, opening: PRIVACY_JS, usFailed: PRIVACY_JS,
  usFailedSay: PRIVACY_JS, lastGoodAll: SHELL_JS, saved: PRIVACY_JS
};

/** privacy.js proposed(q): a value the owner has not settled, naming the question. */
export const proposed = (q: string): string => `Proposed · ${q}`;

/** shell.js settled(id): a rule the owner's pick settles, quoting the pick. */
export const settled = (id: string): string => `Settled · ${id}`;

/** What Hide amounts says beside its switch. */
export function modeSay(hidden: boolean): string {
  return hidden ? `${COPY.hiddenLead} ${COPY.hiddenSay}` : COPY.shownSay;
}

/** The value's label: with a price past its limit, the value is what is known, and says how many holdings are priced. */
export function valueLabel(priced: number, count: number): string {
  return priced < count ? `Known value, ${priced} of ${count} priced` : COPY.value;
}

/** The design's percentage: a sign always, a true minus, one decimal. Percentages stay when amounts are hidden (OWN-18). */
export function pct(v: number, d = 1): string {
  return (v < 0 ? '−' : '+') + Math.abs(v).toFixed(d) + '%';
}
