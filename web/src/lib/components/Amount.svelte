<script lang="ts">
  import type { Money } from '#lib/data/types.ts';
  import { privacy, shownMoney } from '#lib/privacy.svelte.ts';
  /** An amount of money, masked when amounts are hidden; a screen reader hears "hidden" rather than the dots. */
  let { m }: { m: Money } = $props();
  const text = $derived(shownMoney(m, privacy.hidden));
</script>

{#if privacy.hidden}<span aria-label="Amount hidden">{text}</span>{:else}{text}{/if}
