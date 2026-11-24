<script lang="ts">
  import Ico from './Ico.svelte';
  /** A ranked action: decision support, never an order (Prism, badge()). */
  let { act }: { act: string } = $props();
  const ICON: Record<string, string> = { Add: 'plus', Hold: 'equal', Pause: 'pause', Trim: 'trim', Rebalance: 'rebalance' };
</script>

<span class="badge b-{act.toLowerCase()}"><Ico id={ICON[act] ?? 'equal'} size="s16" />{act}</span>
