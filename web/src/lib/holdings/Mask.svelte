<script lang="ts">
  import { privacy } from '#lib/privacy.svelte.ts';
  import Hidden from './Hidden.svelte';
  import { FIGURE } from './design.ts';
  /**
   * A line the design writes with money or units in it. With amounts hidden, each sum of money and each count of units is
   * masked as the design's mask() masks it, and every percentage stays (OWN-18). Shown, the line is one run of text.
   */
  let { text }: { text: string } = $props();
  const parts = $derived(text.split(FIGURE));
  const dots = (u: string) => u.replace(/[\d,]+/g, '••••');
</script>

{#if !privacy.hidden}{text}{:else}{#each parts as part, i (i)}{#if i % 2 === 0}{part}{:else if part.endsWith(' units')}<span class="sr">Units hidden</span><span aria-hidden="true">{dots(part)}</span>{:else}<Hidden />{/if}{/each}{/if}
