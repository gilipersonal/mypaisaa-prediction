<script lang="ts">
  import type { Snippet } from 'svelte';
  /**
   * A control the design draws whose act is not built in this step. It is drawn exactly as designed and never writes anything.
   * Pressed, it says so in one sentence directly after itself; nothing extra is drawn at rest.
   */
  let { text, children }: { text: string; children: Snippet<[() => void]> } = $props();
  let said = $state(false);
</script>

{@render children(() => { said = true; })}{#if said}<div class="jbanner" role="status">{text}</div>{/if}
