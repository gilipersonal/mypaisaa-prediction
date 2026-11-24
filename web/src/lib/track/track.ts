/**
 * The Track record's words and figures, computed from the sample as the design computes them (track.js), so a rate always
 * matches the counts beside it (lessons 37 and 63). A rate shows only beside its sample, only from MIN scored, and every rate
 * here is exploratory: no horizon has the FLOOR non-overlapping blocks a claim needs. Pending, censored and abstained are
 * counted apart and never as misses: a rate is inside over scored, and scored is inside plus outside.
 */
import type { DataState } from '#lib/data/state.ts';
import { FLOOR, MIN, type Horizon, type Window } from './sample.ts';

export const n0 = (v: number): string => v.toLocaleString('en-GB');
export const rate = (a: number, b: number): number => Math.round((a / b) * 100);
export const pts = (v: number): string => `${v.toFixed(1)} pts`;

/** Every rate carries its sample: scored, censored, abstained. */
export const sampleText = (x: Window): string => `${n0(x.scored)} scored · ${x.censored} censored · ${x.abstained} abstained`;
/** And its blocks, under the floor a claim needs. */
export const blocksText = (x: Window): string => `${x.blocks} non-overlapping ${x.blocks === 1 ? 'block' : 'blocks'}, under the ${FLOOR} a claim needs.`;
/** Whether a rate may show: only from MIN scored. */
export const showsRate = (scored: number): boolean => scored >= MIN;

/** Hit rate never stands alone: coverage, calibration, error and the baseline sit beside it, and turnover where an action can follow. */
export function metrics(x: Window, h: Horizon): [label: string, value: string, sub: string][] {
  return [
    ['Coverage', `${rate(x.inside, x.scored)}%`, `80% ranges held, ${n0(x.inside)} of ${n0(x.scored)}`],
    ['Calibration', x.cal, 'Slope, 1.00 is exact'],
    ['Error', pts(x.err), 'Median absolute'],
    ['Hit rate', `${rate(x.dir, x.scored)}%`, `Direction right, ${n0(x.dir)} of ${n0(x.scored)}`],
    ['Benchmark', `${(x.base - x.err).toFixed(1)} pts`, `Less error than the baseline’s ${pts(x.base)}`],
    ['Turnover', h.turn || 'None', h.turn ? 'Action changes a year' : 'Short horizons rank no action']
  ];
}

/** The screens of the Track record, and their addresses under /record/track. */
export type TrackView = 'record' | 'slice' | 'holding' | 'model' | 'regime';
export const PATHS: Record<TrackView, string> = {
  record: '/record/track', slice: '/record/track/slice', holding: '/record/track/holding', model: '/record/track/model', regime: '/record/track/regime'
};
/** Each screen's title, as the design's frame titles it. */
export const TITLES: Record<TrackView, string> = { record: 'Track record', slice: '6 months', holding: 'By holding', model: 'By model', regime: 'By regime' };
/** The top bar's info button, as the design labels it on each screen. */
export const ABOUT: Record<TrackView, string> = {
  record: 'About the track record', slice: 'About this horizon', holding: 'About this view', model: 'About this view', regime: 'About this view'
};

/** An address with the page's data state carried along, so a state chosen in the address follows the links and back. */
export function withState(path: string, search: string): string {
  const v = new URLSearchParams(search).get('data');
  return v ? `${path}?data=${encodeURIComponent(v)}` : path;
}

/** The frame's freshness mode: a failed read of the record is not a failed price, so error keeps the price chips as they are. */
export const freshFor = (st: DataState): 'default' | undefined => (st === 'error' ? 'default' : undefined);
