<script lang="ts">
  import Ico from './Ico.svelte';
  import type { JournalIcon } from './journal.ts';
  /** The Journeys banner (shell.js banner()): a state said in one bold title and one sentence. */
  let { kind = '', title, text, icon = 'info' }: { kind?: '' | 'warn' | 'fall'; title: string; text: string; icon?: JournalIcon } = $props();
</script>

<div class="jbanner {kind}" role="status"><Ico name={icon} size="s18" /><div><b>{title}</b> {text}</div></div>
