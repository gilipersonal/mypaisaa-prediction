/**
 * The privacy centre's words (MP-205), Privacy option A, "One privacy centre" (Recommended): the screen
 * privacy-a-centre, "Settings, then Privacy". Every phrase here is copied from the design source named beside it, and
 * tests/unit/privacy.test.ts finds each one there, so a change starts in the design.
 *
 * Only Hide amounts works in this step. It is a setting on this device, kept like the theme, and writes nothing to any
 * server. The less private options are drawn as the design draws them, Off, and cannot be pressed: this web step cannot
 * show anything on a lock screen, in a widget or in shared content.
 */

/** docs/design/journeys/src/journeys/privacy.js */
export const PRIVACY_JS = 'docs/design/journeys/src/journeys/privacy.js';
/** docs/design/journeys/src/journeys/holdings.js */
export const HOLDINGS_JS = 'docs/design/journeys/src/journeys/holdings.js';

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
  fresh: 'Each stays off until you turn it on, and turning one on asks for a fresh sign-in, because it widens what MP may do. Unlocking the app does not count.'
} as const;

/** The design's LESS rows: each less private option and what Off means. */
export const LESS: ReadonlyArray<readonly [string, string]> = [
  ['Holding names on the lock screen', 'Off shows neutral text only'],
  ['Holdings in widgets', 'Off shows no holdings'],
  ['Values in shared content', 'Off leaves out holdings values']
];

/** Where each phrase comes from. */
export const SOURCE_OF: Record<keyof typeof COPY, string> = {
  back: PRIVACY_JS, title: PRIVACY_JS, mode: PRIVACY_JS, hide: PRIVACY_JS, hiddenLead: PRIVACY_JS, hiddenSay: PRIVACY_JS,
  shownSay: HOLDINGS_JS, outside: PRIVACY_JS, privateDefault: PRIVACY_JS, fresh: PRIVACY_JS
};

/** What Hide amounts says beside its switch. */
export function modeSay(hidden: boolean): string {
  return hidden ? `${COPY.hiddenLead} ${COPY.hiddenSay}` : COPY.shownSay;
}
