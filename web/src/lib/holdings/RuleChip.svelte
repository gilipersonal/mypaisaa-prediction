<script lang="ts">
  import type { Rule } from './design.ts';
  /** The rule a line rests on: Settled (the owner's pick) or Proposed (still open), as the design's settled() and proposed() draw them. */
  let { rule }: { rule: Rule } = $props();
</script>

<span class="chip {rule[0] === 'settled' ? 'owner' : 'proposed'}"><span class="dot"></span>{rule[0] === 'settled' ? 'Settled' : 'Proposed'} · {rule[1]}</span>
