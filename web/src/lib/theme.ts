/** Light, dark or the device's own. The choice is a per-device convenience, kept in localStorage, never private. */
export type Theme = 'system' | 'light' | 'dark';
export const THEMES: readonly { id: Theme; label: string }[] = [
  { id: 'system', label: 'Device' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' }
];
const KEY = 'mp-theme';

export function readTheme(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : 'system';
  } catch {
    return 'system';
  }
}

/** Applies at once to the page already drawn, and remembers it. */
export function applyTheme(t: Theme, root: HTMLElement = document.documentElement): void {
  if (t === 'system') delete root.dataset.theme;
  else root.dataset.theme = t;
  try {
    if (t === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, t);
  } catch {
    /* storage can be blocked; the page still changes */
  }
}
