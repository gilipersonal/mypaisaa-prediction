<script lang="ts">
  import { peek } from '#lib/peek.ts';
  import { privacy, shownUnits } from '#lib/privacy.svelte.ts';
  import { unitParts } from './journal.ts';
  /** A sentence whose units, written in braces, are masked when amounts are hidden (OWN-18 "Mask units too"); a screen reader hears "hidden". */
  let { text }: { text: string } = $props();
  const parts = $derived(unitParts(text));
</script>

{#each parts as p, i (i)}{#if p.units && privacy.masked}<span use:peek><span aria-hidden="true">{shownUnits(p.text, true)}</span><span class="sr">hidden</span></span>{:else}{p.text}{/if}{/each}
