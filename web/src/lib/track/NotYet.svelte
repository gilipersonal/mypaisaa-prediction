<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from '#lib/components/Icon.svelte';
  /**
   * A control the design draws whose act is not built yet. It is drawn exactly as designed and never writes anything; pressed,
   * it says directly after itself that it comes in a later build step. Nothing extra shows at rest.
   */
  let { cls, label, what, children }: { cls: string; label?: string; what: string; children: Snippet } = $props();
  let said = $state(false);
</script>

<button class={cls} type="button" aria-label={label} onclick={() => (said = true)}>{@render children()}</button>{#if said}<div class="jbanner" role="status"><Icon name="info" size="s18" /><div>{what} comes in a later build step.</div></div>{/if}
