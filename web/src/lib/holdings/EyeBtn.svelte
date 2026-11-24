<script lang="ts">
  import { privacy } from '#lib/privacy.svelte.ts';
  import Ico from './Ico.svelte';
  import { SAY } from './design.ts';
  /* The design's eyeBtn(), tb('eye-off', 'Hide amounts'): hides money and units, kept on this device only (OWN-18). */
</script>

{#if privacy.left > 0}
  <!-- Tap to show, option A (MP-205): while amounts show, the eye is Hide now with the seconds left (peek.js hideNow) -->
  <button class="btn sm btn-primary d-only" type="button" onclick={() => privacy.hideNow()}><Ico id="eye-off" size="s18" />Hide now · {privacy.left} s</button>
  <button class="tbtn glass p-only" type="button" aria-label="Hide now, {privacy.left} seconds left" style="background:var(--btn);color:var(--btn-ink)" onclick={() => privacy.hideNow()}><Ico id="eye-off" size="s18" /></button>
{:else}
  <button class="tbtn glass" type="button" aria-label={SAY.hideAmounts} aria-pressed={privacy.hidden} onclick={() => privacy.set(!privacy.hidden)}><Ico id="eye-off" size="s18" /></button>
{/if}
