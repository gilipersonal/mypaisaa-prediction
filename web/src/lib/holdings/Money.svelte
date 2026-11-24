<script lang="ts">
  import { privacy } from '#lib/privacy.svelte.ts';
  import Hidden from './Hidden.svelte';
  /** A large sum, as Prism's money(s, size) draws it: the pounds rolled, the pence smaller. Masked when amounts are hidden. */
  let { v, size }: { v: string; size?: number } = $props();
  const pounds = $derived(`£${v.split('.')[0]}`);
  const pence = $derived(v.split('.')[1] ?? '00');
</script>

<span class="amt" style={size ? `font-size:${size}px` : undefined}>{#if privacy.masked}<Hidden button />{:else}<span class="roll" data-roll={pounds}><span class="roll-ghost" aria-hidden="true">{pounds}</span><span class="roll-live">{pounds}</span></span><span class="p">.{pence}</span>{/if}</span>
