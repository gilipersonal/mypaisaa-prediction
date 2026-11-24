<script lang="ts">
  import type { Money } from '#lib/data/types.ts';
  import { privacy, shownMoney } from '#lib/privacy.svelte.ts';
  /**
   * Money as the design draws it: a large figure with smaller pence (money()), or a row's value with grey pence (pp).
   * Masked when amounts are hidden (OWN-18); a screen reader hears "Amount hidden".
   */
  let { m, size = 0, pp = false }: { m: Money; size?: number; pp?: boolean } = $props();
  const text = $derived(shownMoney(m, privacy.hidden));
  const parts = $derived(text.split('.'));
</script>

{#if privacy.hidden}<span role="img" aria-label="Amount hidden">{text}</span>{:else if pp}{parts[0]}<span class="pp">.{parts[1]}</span>{:else}<span class="amt" style={size ? `font-size:${size}px` : undefined}>{parts[0]}<span class="p">.{parts[1]}</span></span>{/if}
