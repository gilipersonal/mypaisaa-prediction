<script lang="ts">
  import { privacy, shownUnits } from '#lib/privacy.svelte.ts';
  import { FIGURE } from './design.ts';
  /**
   * A line the design writes with money or units in it. With amounts hidden, each sum of money and each count of units is
   * masked and every percentage stays (OWN-18).
   */
  let { text }: { text: string } = $props();
  const parts = $derived(text.split(FIGURE));
</script>

{#each parts as part, i (i)}{#if i % 2 === 0}{part}{:else if !privacy.hidden}{part}{:else if part.endsWith(' units')}<span role="img" aria-label="Units hidden">{shownUnits(part, true)}</span> units{:else}<span role="img" aria-label="Amount hidden">£••</span>{/if}{/each}
