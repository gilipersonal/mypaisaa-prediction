<script lang="ts">
  import type { Snippet } from 'svelte';
  import Ic from './Ic.svelte';
  import { pct } from './home.ts';
  /** Prism's chg(v, txt): a move up or down, with its arrow. A percentage stays when amounts are hidden (OWN-18). */
  let { v, children }: { v: number; children?: Snippet } = $props();
</script>

<span class="chg {v < 0 ? 'down' : 'up'}"><Ic id={v < 0 ? 'down' : 'up'} cls="fill" />{#if children}{@render children()}{:else}{pct(v)}{/if}</span>
