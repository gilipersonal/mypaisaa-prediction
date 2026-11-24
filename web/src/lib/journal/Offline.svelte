<script lang="ts">
  import Banner from './Banner.svelte';
  import Kept from './Kept.svelte';
  /** Offline, as the design draws it in a browser (journal.js off()): the banner, then what this browser keeps and that how it protects it is unverified (MP40-Q12c). */
  let { text }: { text: string } = $props();
</script>

<Banner title="Offline." {text} icon="wifi-off" /><Kept />
