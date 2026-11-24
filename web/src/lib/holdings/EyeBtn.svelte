<script lang="ts">
  import { privacy } from '#lib/privacy.svelte.ts';
  import Ico from './Ico.svelte';
  import { SAY } from './design.ts';
  /* The design's eyeBtn(), tb('eye-off', 'Hide amounts'): hides money and units, kept on this device only (OWN-18). */
</script>

<button class="tbtn glass" type="button" aria-label={SAY.hideAmounts} aria-pressed={privacy.hidden} onclick={() => privacy.set(!privacy.hidden)}><Ico id="eye-off" size="s18" /></button>
