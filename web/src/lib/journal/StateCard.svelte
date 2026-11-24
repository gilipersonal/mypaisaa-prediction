<script lang="ts">
  import type { Snippet } from 'svelte';
  import Ico from './Ico.svelte';
  import type { JournalIcon } from './journal.ts';
  /**
   * Prism's state card, as the Journeys design's stateCard() draws it: an icon, a title, one sentence, then an action or a foot.
   * With grow, the title sits in its own growing span, as the journal's own cards draw it (wrapUp, sideCard, howDid), with an optional chip.
   */
  let { icon, title, text, grow = false, chip, children, foot }: { icon: JournalIcon; title: string; text: string; grow?: boolean; chip?: Snippet; children?: Snippet; foot?: Snippet } = $props();
</script>

<div class="card state" data-mo="card"><div class="sh"><span class="ic"><Ico name={icon} size="s18" /></span>{#if grow}<span style="flex:1;min-width:0">{title}</span>{@render chip?.()}{:else}{title}{/if}</div><p>{text}</p>{@render children?.()}{#if foot}<div class="foot">{@render foot()}</div>{/if}</div>
