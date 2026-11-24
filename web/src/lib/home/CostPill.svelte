<script lang="ts">
  import Ic from './Ic.svelte';
  import Later from './Later.svelte';
  import { LATER, type Pill } from './home.ts';
  import { later } from './later.svelte.ts';
  /**
   * Prism's cost pill, the month in a few words, in the top bar of every Home ("Pill on every Home", OWN-06), drawn as the
   * design draws it: a button. Cost's month is not built in this step, so a press opens nothing and says so after it.
   */
  let { pill }: { pill: Pill } = $props();
</script>

<button class="chip glass cost-pill" type="button" data-testid="cost-pill" onclick={() => later.press('cost')}>{#if pill.icon}<Ic id={pill.icon} cls="s14" />{:else}<span class="cost-pillbar"><i style="width:{pill.fill}%"></i></span>{/if}<span><span class="sr">{'Cost this month: '}</span>{#each pill.parts as p, i (i)}{#if p.sr}<span class="sr">{p.t}</span>{:else}{p.t}{/if}{/each}<span class="sr">. {pill.more}</span></span></button><Later id="cost" say={LATER.cost} />
