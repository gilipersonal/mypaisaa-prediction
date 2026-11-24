<script lang="ts">
  import Ico from './Ico.svelte';
  /**
   * A control the design draws whose act is not built in this step. It writes nothing: pressed, it says so directly after
   * itself, in one sentence; at rest nothing extra is drawn.
   */
  let { label, say, cls = 'btn btn-tinted sm' }: { label: string; say: string; cls?: string } = $props();
  let told = $state(false);
</script>

<button class={cls} type="button" onclick={() => (told = true)}>{label}</button>{#if told}<div class="jbanner" role="status"><Ico id="info" size="s18" /><div>{say}</div></div>{/if}
