<script lang="ts">
  import Calbar from './Calbar.svelte';
  import Roll from './Roll.svelte';
  import { WINDOWS, type Horizon } from './sample.ts';
  import { n0, rate, showsRate } from './track.ts';
  /** The design's trio(): coverage of the 80% range over 30, 90 and 365 days, each with its sample. */
  let { h }: { h: Horizon } = $props();
</script>

<div class="track-trio">{#each h.w as x, i (i)}<div><span class="label">{WINDOWS[i]}</span>{#if x.due === 0}<b>None</b><span class="u">nothing matured</span>{:else if !showsRate(x.scored)}<b>Too few</b><span class="u">{x.scored} scored</span>{:else}<b><Roll v="{rate(x.inside, x.scored)}%" /></b><span class="u">of {n0(x.scored)} scored</span><Calbar r={rate(x.inside, x.scored)} label="{h.n}, {WINDOWS[i]}" />{/if}</div>{/each}</div>
