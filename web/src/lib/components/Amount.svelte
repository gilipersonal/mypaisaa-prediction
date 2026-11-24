<script lang="ts">
  import { peek } from '#lib/peek.ts';
  import type { Money } from '#lib/data/types.ts';
  import { privacy, shownMoney } from '#lib/privacy.svelte.ts';
  /** An amount of money, masked when amounts are hidden; a screen reader hears "hidden" rather than the dots. */
  let { m }: { m: Money } = $props();
  const text = $derived(shownMoney(m, privacy.masked));
</script>

{#if privacy.masked}<span aria-label="Amount hidden" use:peek>{text}</span>{:else}{text}{/if}
