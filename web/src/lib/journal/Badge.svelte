<script lang="ts">
  import Ico from './Ico.svelte';
  import type { JournalIcon } from './journal.ts';
  /** Prism's badge(a): the ranked action, decision support, never an order. */
  let { action }: { action: string } = $props();
  const ICON: Record<string, JournalIcon> = { Add: 'plus', Hold: 'equal', Pause: 'pause', Trim: 'trim', Rebalance: 'rebalance' };
</script>

<span class="badge b-{action.toLowerCase()}"><Ico name={ICON[action] ?? 'equal'} size="s16" />{action}</span>
