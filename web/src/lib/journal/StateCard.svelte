<script lang="ts">
  import type { Snippet } from 'svelte';
  import Ico from './Ico.svelte';
  import type { JournalIcon } from './journal.ts';
  /** Prism's state card, as the Journeys design's stateCard() draws it: an icon, a title, one or two sentences, then an action or a foot. */
  let { icon, title, text, chip, children, foot }: { icon: JournalIcon; title: string; text: string; chip?: Snippet; children?: Snippet; foot?: Snippet } = $props();
</script>

<div class="card state">
  <div class="sh"><span class="ic"><Ico name={icon} size="s18" /></span>{#if chip}<span class="grow">{title}</span>{@render chip()}{:else}{title}{/if}</div>
  <p>{text}</p>
  {@render children?.()}
  {#if foot}<div class="foot">{@render foot()}</div>{/if}
</div>

<style>
  .grow { flex: 1; min-width: 0; }
</style>
