<script lang="ts">
  import Chip from './Chip.svelte';
  import { FLOOR, MIN } from './sample.ts';
  /** The design's counted(): how the record is counted. Pending, censored and abstained are counted apart, never as misses. */
</script>

<div class="card track-card"><h4>How it is counted</h4><div class="track-kv"><span>Pending</span><b>Horizon not passed yet</b><span>Censored</span><b>Horizon passed, an input missing</b><span>Abstained</span><b>No range was given</b><span>Scored</span><b>Inside or outside its 80% range</b></div><p class="track-sub">Pending, censored and abstained are counted apart, never as misses. A window holds the forecasts whose horizon passed inside it. Summaries are rebuilt from stored scores and reproduce exactly; a corrected outcome keeps its first score beside the new one.</p><p class="track-sub">A rate shows once {MIN} have scored. Below {FLOOR} non-overlapping blocks it is exploratory.</p><div class="track-acts"><Chip text="Proposed · SCI-D03" kind="proposed" /></div></div>
