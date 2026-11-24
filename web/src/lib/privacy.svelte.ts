import type { Money } from './data/types';

/**
 * Hide amounts (MP-84, OWN-18 "Mask units too"): money and units are masked and percentages stay, on every screen.
 * The choice is kept on this device only. A per-device convenience, so localStorage; storage that is blocked means the
 * choice lasts for this page only.
 */
const KEY = 'mp-hide-amounts';
const MASK = '£••';

/** How long a tap shows amounts (Tap to show, option A, the owner's pick of 24 Nov 2026, MP-205). */
export const SHOW_FOR_S = 30;

class Privacy {
  /** The setting: Hide amounts is on. Only the privacy switch and the eye change it. */
  hidden: boolean = $state(false);
  /** Seconds left while a tap shows every amount; 0 when nothing is showing. Never stored. */
  left: number = $state(0);
  /** What a screen reader hears once when amounts show and once when they hide, never each second. */
  said: string = $state('');
  #until = 0;
  #tick: ReturnType<typeof setInterval> | undefined;

  /** Whether amounts are masked now: the setting is on and no tap is showing them. */
  get masked(): boolean {
    return this.hidden && this.left <= 0;
  }

  load(): void {
    try {
      this.hidden = localStorage.getItem(KEY) === '1';
    } catch {
      this.hidden = false;
    }
  }

  set(on: boolean): void {
    this.#stop();
    this.hidden = on;
    try {
      if (on) localStorage.setItem(KEY, '1');
      else localStorage.removeItem(KEY);
    } catch {
      /* the page still changes */
    }
  }

  /** A tap on a masked amount: every amount on the screen shows for 30 seconds. The setting stays on; nothing is stored. */
  show(now: number = Date.now()): void {
    if (!this.hidden) return;
    this.#until = now + SHOW_FOR_S * 1000;
    this.left = SHOW_FOR_S;
    this.said = `Amounts showing for ${SHOW_FOR_S} seconds`;
    clearInterval(this.#tick);
    this.#tick = setInterval(() => this.#count(), 250);
  }

  /** Hide now, leaving the screen, or the app going to the background: every amount masks again at once. */
  hideNow(): void {
    if (this.left > 0) this.said = 'Amounts hidden again';
    this.#stop();
  }

  #count(now: number = Date.now()): void {
    const left = Math.ceil((this.#until - now) / 1000);
    if (left <= 0) this.hideNow();
    else this.left = left;
  }

  #stop(): void {
    clearInterval(this.#tick);
    this.#tick = undefined;
    this.left = 0;
  }
}

export const privacy = new Privacy();

const GBP = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 });

/** Money as the owner sees it: masked when amounts are hidden. */
export function shownMoney(m: Money, hidden: boolean): string {
  if (!Number.isSafeInteger(m.pence)) throw new Error('money must be whole pence');
  return hidden ? MASK : GBP.format(m.pence / 100);
}

/** Units as the owner sees them: masked too (OWN-18). */
export function shownUnits(units: string, hidden: boolean): string {
  return hidden ? '••' : units;
}
