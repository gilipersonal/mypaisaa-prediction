<script lang="ts">
  import Ic from './Ic.svelte';
  import type { Pill } from './home.ts';
  /**
   * Prism's cost pill, the month in a few words, in the top bar of every Home ("Pill on every Home", OWN-06). Drawn as
   * status, not a button: Cost's month is not built in this step, so the pill opens nothing (lesson 28).
   */
  let { pill }: { pill: Pill } = $props();
</script>

<span class="chip glass cost-pill" data-testid="cost-pill">{#if pill.icon}<Ic id={pill.icon} cls="s14" />{:else}<span class="cost-pillbar"><i style="width:{pill.fill}%"></i></span>{/if}<span><span class="sr">{'Cost this month: '}</span>{#each pill.parts as p, i (i)}{#if p.sr}<span class="sr">{p.t}</span>{:else}{p.t}{/if}{/each}<span class="sr">. {pill.more}</span></span></span>
