/**
 * The data states a screen draws, as the designs draw them (docs/design/journeys, the State menu). On sample data a state
 * is chosen in the address, `?data=<state>`, so each one can be seen and tested; with no choice the data is ready.
 * Loading is held until the page is pressed on, so a test can read it; every other state resolves at once.
 */
export type DataState = 'ready' | 'loading' | 'empty' | 'error' | 'stale' | 'offline';
export const DATA_STATES: readonly DataState[] = ['ready', 'loading', 'empty', 'error', 'stale', 'offline'];

/** The state the address asks for; anything else is ready. */
export function dataStateOf(search: string): DataState {
  const v = new URLSearchParams(search).get('data');
  return (DATA_STATES as readonly string[]).includes(v ?? '') ? (v as DataState) : 'ready';
}

/** Offline overrides the address when the browser really is offline. */
export function currentDataState(): DataState {
  if (typeof location === 'undefined') return 'loading';
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline';
  return dataStateOf(location.search);
}
