<script lang="ts">
  import { later } from './later.svelte.ts';
  /** The sentence a not-built control shows after itself once pressed; nothing at rest. */
  let { id, say }: { id: string; say: string } = $props();
</script>

{#if later.open[id]}<div class="jbanner" role="status">{say}</div>{/if}
