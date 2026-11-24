<script lang="ts">
  /** A sum of money with amounts hidden, as the design's mask draws it (holdings.js, MASK; OWN-18). A tap shows every amount
   * for 30 seconds (Tap to show, option A); the headline value is also a button. */
  import { peek } from '#lib/peek.ts';
  let { button = false }: { button?: boolean } = $props();
</script>

<span use:peek={{ button }}><span class="sr">Amount hidden</span><span aria-hidden="true">••••</span></span>
