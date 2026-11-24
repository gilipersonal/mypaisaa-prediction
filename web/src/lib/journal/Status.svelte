<script lang="ts">
  import Ico from './Ico.svelte';
  import type { OutcomeState } from './sample.ts';
  /** An entry's outcome, as the journal marks it (journal.js status()): waiting with its time left, scored inside or outside its range, or unresolved. */
  let { outcome, left = '' }: { outcome: OutcomeState; left?: string } = $props();
</script>

{#if outcome === 'wait'}<span class="chip" data-mo="chip"><Ico name="clock" size="s14" />{left}</span>
{:else if outcome === 'in'}<span class="chip" data-mo="chip"><i class="lg-sc" aria-hidden="true"></i>Scored</span>
{:else if outcome === 'out'}<span class="chip" data-mo="chip"><i class="lg-miss" aria-hidden="true"></i>Scored</span>
{:else}<span class="chip partial" data-mo="chip"><span class="dot"></span>Unresolved</span>{/if}
