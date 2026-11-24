<script lang="ts">
  /**
   * The desktop sidebar, as the Journeys design draws it (shell.js frame(), web): the brand row, the nine places with
   * Prism's counts (SIDE_ITEMS: 7 holdings, 8 segments; no holdings count when there are none), then the Data block with
   * each provider's freshness and the run clock. Classes and inline styles are the design's own.
   */
  import Icon from './Icon.svelte';
  import FreshRow from '#lib/shell/FreshRow.svelte';
  import { dataLine } from '#lib/shell/run.ts';
  import { frameInfo } from '#lib/shell/frame.svelte.ts';
  import { PLACES, type Place } from '#lib/places.ts';
  import type { DataState } from '#lib/data/state.ts';
  let { current, state, counts }: { current: Place; state: DataState; counts: Record<string, number | undefined> } = $props();
</script>

<nav class="glass jside side-nav" style="border-radius:0" aria-label="Places">
  <a href="/" style="display:flex;align-items:center;gap:10px;padding:16px 18px 6px;font:600 17px/22px var(--font-text);letter-spacing:-.01em;color:inherit;text-decoration:none"><span class="brand-mark" aria-hidden="true"></span>MyPrediction</a>
  <ul class="side" style="flex:1">
    {#each PLACES as p (p.id)}
      <li style="display:contents">
        <a class="si" class:on={p.id === current.id} href={p.path} style="text-decoration:none" aria-current={p.id === current.id ? 'page' : undefined}>
          <Icon name={p.icon} size="s18" />{p.label}{#if counts[p.id] !== undefined}<span class="n">{counts[p.id]}</span>{/if}
        </a>
      </li>
    {/each}
  </ul>
  <div style="margin:12px;padding:12px;border-radius:16px;background:var(--glass-thin);display:grid;gap:6px;justify-items:start" class="on-glass">
    <span class="label" style="color:var(--ink)">Data</span>
    <FreshRow {state} mode={frameInfo.fresh} />
    <span class="small">{dataLine(state, frameInfo.fresh)}</span>
  </div>
</nav>
