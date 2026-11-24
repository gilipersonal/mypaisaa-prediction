import type { Money } from './data/types';

/**
 * Hide amounts (MP-84, OWN-18 "Mask units too"): money and units are masked and percentages stay, on every screen.
 * The choice is kept on this device only. A per-device convenience, so localStorage; storage that is blocked means the
 * choice lasts for this page only.
 */
const KEY = 'mp-hide-amounts';
const MASK = '£••';

class Privacy {
  hidden: boolean = $state(false);

  load(): void {
    try {
      this.hidden = localStorage.getItem(KEY) === '1';
    } catch {
      this.hidden = false;
    }
  }

  set(on: boolean): void {
    this.hidden = on;
    try {
      if (on) localStorage.setItem(KEY, '1');
      else localStorage.removeItem(KEY);
    } catch {
      /* the page still changes */
    }
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
