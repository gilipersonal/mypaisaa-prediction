<script lang="ts">
  import Icon from '#lib/components/Icon.svelte';
  import Chip from './Chip.svelte';
  import Metrics from './Metrics.svelte';
  import Trio from './Trio.svelte';
  import { ISSUED, START, type Horizon } from './sample.ts';
  import { blocksText, n0, sampleText } from './track.ts';
  /**
   * One horizon's card. 'long' is the design's hzCard (a long horizon on the scorecard, with the way into it in full where
   * `open` is given), 'short' its shortCard, and 'slice' the opened 6 months (windowsA). A horizon with nothing matured says
   * so and shows no rate.
   */
  let { h, wide, variant, open, openId }: { h: Horizon; wide: boolean; variant: 'long' | 'short' | 'slice'; open?: string; openId?: string } = $props();
  const y = $derived(h.w[2]);
</script>

<div class="card track-card"><div class="track-vh"><h4>{h.n}</h4>{#if variant !== 'long' || y.due}<Chip text="Exploratory" kind="proposed" />{/if}{#if variant !== 'slice'}<Chip text="{n0(h.pending)} pending" icon="clock" />{/if}</div>{#if variant === 'long' && !y.due}<div class="track-few"><b>Nothing has matured</b><span>First due {h.first}.</span></div><p class="track-sub">All {n0(ISSUED)} forecasts since {START} are pending. Nothing is scored before its horizon passes.</p>{:else}{#if variant === 'long'}<p class="track-sub">Coverage of the 80% range, by when the horizon passed</p>{:else if variant === 'slice'}<p class="track-sub">Coverage of the 80% range, by when the horizon passed. The target is 80%.</p>{/if}<Trio {h} />{#if variant !== 'short'}<div class="track-rule"></div>{/if}<p class="track-sub"><b>365 days</b> · {sampleText(y)}. {blocksText(y)}</p><Metrics x={y} {h} {wide} />{#if open}<a class="btn btn-plain sm" href={open} id={openId} style="justify-self:start;text-decoration:none">{h.n} in full<Icon name="chev-r" size="s14" /></a>{/if}{/if}</div>
