<script lang="ts">
  import type { DataState } from '#lib/data/state.ts';
  import Ico from './Ico.svelte';
  import { FRESH } from './design.ts';
  /**
   * Each provider's freshness, always in view, in every state (shell.js, freshRow). The late HSBC price is marked on
   * Yahoo whenever holdings show; an empty portfolio has nothing to be late.
   */
  let { state }: { state: DataState } = $props();
</script>

<div class="jfresh" role="group" aria-label="Data providers">
  {#if state === 'offline'}
    <span class="chip offline"><Ico id="wifi-off" size="s14" />{FRESH.offline}</span>
  {:else if state === 'error'}
    <span class="chip error"><Ico id="alert" size="s14" />{FRESH.error}</span>
    <span class="chip fresh"><span class="dot"></span>{FRESH.yahoo} · {FRESH.fresh}</span>
  {:else}
    {#if state === 'loading'}<span class="chip fresh"><span class="dot"></span>{FRESH.refreshing}</span>{/if}
    <span class="chip fresh"><span class="dot"></span>{FRESH.twelve} · {FRESH.fresh}</span>
    {#if state === 'empty'}
      <span class="chip fresh"><span class="dot"></span>{FRESH.yahoo} · {FRESH.fresh}</span>
    {:else}
      <span class="chip stale" data-testid="yahoo-hsbc"><Ico id="clock" size="s14" />{FRESH.yahoo} · {state === 'stale' ? FRESH.stale : FRESH.late}</span>
    {/if}
  {/if}
</div>
