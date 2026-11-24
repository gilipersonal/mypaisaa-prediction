<script lang="ts">
  /** shell.js freshRow: each provider's freshness, always on screen, never behind a loading state (AGENTS.md). */
  import Icon from '#lib/components/Icon.svelte';
  import type { DataState } from '#lib/data/state.ts';
  import { freshChips, type FreshMode } from './run.ts';
  let { state, mode }: { state: DataState; mode?: FreshMode } = $props();
  const chips = $derived(freshChips(state, mode));
</script>

<div class="jfresh on-glass" role="group" aria-label="Data freshness">
  {#each chips as c (c.text)}<span class="chip {c.cls}">{#if c.icon}<Icon name={c.icon} size="s14" />{:else}<span class="dot"></span>{/if}{c.text}</span>{/each}
</div>
