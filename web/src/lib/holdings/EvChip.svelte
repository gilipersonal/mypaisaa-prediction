<script lang="ts">
  import Ico from './Ico.svelte';
  import type { Ev } from './design.ts';
  /** An evidence or status label, as the design's ev() draws it. */
  let { ev }: { ev: Ev } = $props();
  const kind = $derived(ev[0]);
  const text = $derived(ev[1]);
</script>

{#if kind === 'ok'}<span class="chip holdings-ok"><Ico id="check" size="s14" />{text}</span>
{:else if kind === 'part'}<span class="chip partial"><span class="dot"></span>{text}</span>
{:else if kind === 'none'}<span class="chip illus"><Ico id="ban" size="s14" />{text}</span>
{:else if kind === 'amb'}<span class="chip"><Ico id="split" size="s14" />{text}</span>
{:else if kind === 'old'}<span class="chip stale"><Ico id="clock" size="s14" />{text}</span>
{:else}<span class="chip error"><Ico id="alert" size="s14" />{text}</span>{/if}
