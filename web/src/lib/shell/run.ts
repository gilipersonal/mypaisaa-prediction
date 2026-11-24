/**
 * The page frame's fixed words, as the Journeys design draws them (docs/design/journeys/src/shell.js: CUTOFFS, ASOF_ALL,
 * LASTGOOD_ALL, freshRow). Synthetic: the run clock is the designs' own.
 */
import type { DataState } from '#lib/data/state.ts';

export const CUTOFFS = 'cutoffs US 22:00, UK 17:35, India 11:00';
export const ASOF_ALL = `As of 22:15 London · ${CUTOFFS}`;
export const LASTGOOD_ALL = 'US: last good run Mon 22:15 · cutoff 22:00. UK and India ran today';

/** A freshness mode a screen may pin (shell.js freshRow's `mode`): 'default' keeps the price chips as they are. */
export type FreshMode = DataState | 'default' | undefined;

export interface Chip { cls: 'fresh' | 'stale' | 'offline' | 'error'; icon?: 'clock' | 'wifi-off' | 'alert'; text: string }

/** shell.js freshRow(ctx, mode): the chips for a state, with a screen's pinned mode where it has one. */
export function freshChips(state: DataState, mode?: FreshMode): Chip[] {
  const st = mode && !['offline', 'loading'].includes(state) ? mode : state;
  const twelve: Chip = { cls: 'fresh', text: 'Twelve Data · Fresh' };
  if (st === 'offline') return [{ cls: 'offline', icon: 'wifi-off', text: 'Offline · from 22:15' }];
  if (st === 'error') return [{ cls: 'error', icon: 'alert', text: 'Twelve Data · error 21:16' }, { cls: 'fresh', text: 'Yahoo · Fresh' }];
  if (st === 'stale') return [twelve, { cls: 'stale', icon: 'clock', text: 'Yahoo · HSBC stale' }];
  if (st === 'empty') return [twelve, { cls: 'fresh', text: 'Yahoo · Fresh' }];
  if (st === 'loading') return [{ cls: 'fresh', text: 'Refreshing · last good 22:15' }, twelve, { cls: 'stale', icon: 'clock', text: 'Yahoo · HSBC late' }];
  return [twelve, { cls: 'stale', icon: 'clock', text: 'Yahoo · HSBC late' }];
}

/** The sidebar's Data line (shell.js dataRow). */
export const dataLine = (state: DataState, mode?: FreshMode): string => (state === 'error' && !mode ? LASTGOOD_ALL : ASOF_ALL);
