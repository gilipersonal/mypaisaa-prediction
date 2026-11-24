<script lang="ts">
  import Ico from './Ico.svelte';
  /** The shell's banner(kind, title, text, icon): a state said in one bold title and one sentence. */
  let { kind = '', title, text, icon = 'info' }: { kind?: '' | 'warn' | 'fall'; title: string; text: string; icon?: string } = $props();
</script>

<div class="jbanner {kind}" role="status"><Ico id={icon} size="s18" /><div><b>{title}</b> {text}</div></div>
