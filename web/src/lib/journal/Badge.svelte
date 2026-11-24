<script lang="ts">
  import Ico from './Ico.svelte';
  import type { JournalIcon } from './journal.ts';
  import type { Ranked } from './sample.ts';
  /** The ranked action as Prism draws it: decision support, never an order. */
  let { action }: { action: Ranked } = $props();
  const ICON: Record<Ranked, JournalIcon> = { Add: 'plus', Hold: 'equal', Pause: 'pause', Trim: 'trim' };
</script>

<span class="badge b-{action.toLowerCase()}"><Ico name={ICON[action]} size="s16" />{action}</span>
