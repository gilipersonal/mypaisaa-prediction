<script lang="ts">
  import Ico from './Ico.svelte';
  import { COPY } from './sample.ts';
  import type { DataState } from '#lib/data/state.ts';
  /**
   * The providers' freshness, always on screen, never hidden behind a loading state (AGENTS.md). A failed read of the journal
   * is not a failed price, so in Error the price chips stay as they are, as the design draws it.
   */
  let { state }: { state: DataState } = $props();
  const F = COPY.fresh;
</script>

<div class="jfresh" aria-label="Data freshness" role="group">
  {#if state === 'offline'}
    <span class="chip offline"><Ico name="wifi-off" size="s14" />{F.offline}</span>
  {:else}
    {#if state === 'loading'}<span class="chip fresh"><span class="dot"></span>{F.loading}</span>{/if}
    <span class="chip fresh"><span class="dot"></span>{F.twelve}</span>
    {#if state === 'empty'}<span class="chip fresh"><span class="dot"></span>{F.yahoo}</span>
    {:else}<span class="chip stale"><Ico name="clock" size="s14" />{state === 'stale' ? F.stale : F.late}</span>{/if}
  {/if}
</div>
