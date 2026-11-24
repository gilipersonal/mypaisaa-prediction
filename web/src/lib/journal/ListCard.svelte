<script lang="ts">
  import type { Snippet } from 'svelte';
  import EntryRow from './EntryRow.svelte';
  import { COPY } from './sample.ts';
  import { hrefOf, type ShownEntry } from './journal.ts';
  /** A card of entries, newest first, closed by the design's line that this is decision support and places no trades. */
  let { entries, search, showDiffer = true, head }: { entries: ShownEntry[]; search: string; showDiffer?: boolean; head?: Snippet } = $props();
</script>

<div class="card entries">
  {@render head?.()}
  {#each entries as e (e.id)}
    <EntryRow entry={e} {showDiffer} href={e.detail ? hrefOf({ kind: 'entry', id: e.id }, search) : undefined} />
  {/each}
  <div class="t5foot">{COPY.supportFoot}</div>
</div>

<style>
  .entries { padding: 2px 0; }
</style>
