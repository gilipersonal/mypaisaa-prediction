<script lang="ts">
  import Roll from './Roll.svelte';
  import type { Horizon, Window } from './sample.ts';
  import { metrics } from './track.ts';
  /** The design's metrics(): hit rate only beside coverage, calibration, error, the baseline and turnover. */
  let { x, h, wide }: { x: Window; h: Horizon; wide: boolean } = $props();
</script>

<div class="track-met{wide ? ' w3' : ''}" role="list">{#each metrics(x, h) as [l, v, u] (l)}<div role="listitem"><span class="label">{l}</span><b><Roll {v} /></b><span class="u">{u}</span></div>{/each}</div>
