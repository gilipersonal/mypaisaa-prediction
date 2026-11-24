<script lang="ts">
  import Ic from './Ic.svelte';
  import { ACT_ICON } from './home.ts';
  /** Prism's badge(a): a ranked action, decision support only. It is a label, never a control. */
  let { a }: { a: string } = $props();
  const icon = $derived(ACT_ICON[a]);
</script>

<span class="badge b-{a.toLowerCase()}">{#if icon}<Ic id={icon} cls="s16" />{/if}{a}</span>
