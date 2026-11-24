<script lang="ts">
  import type { Money } from '#lib/data/types.ts';
  import { privacy } from '#lib/privacy.svelte.ts';
  import { peek } from '#lib/peek.ts';
  import { moneyParts } from './home.ts';
  /** Prism's money(s, size): the whole pounds in a roll, then the pence. With amounts hidden, the mask and no pence. */
  let { m, size }: { m: Money; size: number } = $props();
  const parts = $derived(moneyParts(m));
</script>

<span class="amt" style="font-size:{size}px" data-testid="total">{#if privacy.masked}<span class="roll"><span class="roll-ghost" aria-hidden="true">£••</span><span class="roll-live" aria-label="Amount hidden" use:peek={{ button: true }}>£••</span></span>{:else}<span class="roll"><span class="roll-ghost" aria-hidden="true">{parts.whole}</span><span class="roll-live">{parts.whole}</span></span><span class="p">.{parts.pence}</span>{/if}</span>
