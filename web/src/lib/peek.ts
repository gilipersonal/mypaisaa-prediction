import { privacy } from './privacy.svelte.ts';

/**
 * A masked amount you can press to show every amount on the screen for 30 seconds (Tap to show, option A, the owner's
 * pick of 24 Nov 2026, MP-205; docs/design/journeys/src/journeys/peek.js). A tap or a click on any masked amount shows
 * them all. The screen's headline value is also a button (`{ button: true }`: Enter or Space, and a screen reader hears
 * "Show amounts for 30 seconds"); under option A one press shows everything, so the keyboard needs only that one, and the
 * small amounts in rows and sentences add no control (none nests in a row's link). It adds no box and no style of its own,
 * so the screen still measures as its design.
 */
export function peek(node: HTMLElement, opts: { button?: boolean } = {}): { destroy(): void } {
  const button = !!opts.button && !node.parentElement?.closest('a, button, [role="button"]');
  if (button) {
    node.setAttribute('role', 'button');
    node.tabIndex = 0;
    node.setAttribute('aria-label', 'Amount hidden. Show amounts for 30 seconds');
  }
  const press = (e: Event): void => {
    e.preventDefault();
    e.stopPropagation();
    privacy.show();
  };
  const key = (e: KeyboardEvent): void => {
    if (button && (e.key === 'Enter' || e.key === ' ')) press(e);
  };
  node.addEventListener('click', press);
  node.addEventListener('keydown', key);
  return {
    destroy() {
      node.removeEventListener('click', press);
      node.removeEventListener('keydown', key);
    }
  };
}
