<script lang="ts">
  import { privacy } from '#lib/privacy.svelte.ts';
  import Ico from './Ico.svelte';
  import { SAY } from './design.ts';
  /**
   * A holdings screen's top, as the design frames it: the way back, the title, and Hide amounts. With amounts hidden the
   * screen says so in one line (holdings.js, the private screen). Hiding amounts is kept on this device only.
   */
  let { title, back, backTo }: { title: string; back: string; backTo: string } = $props();
</script>

<header class="hh">
  <a class="back" href={backTo} aria-label="Back to {back}"><Ico id="chev-l" size="s18" />{back}</a>
  <div class="row">
    <h1 class="ltitle">{title}</h1>
    <button class="iconbtn" type="button" aria-label="Hide amounts" aria-pressed={privacy.hidden} onclick={() => privacy.set(!privacy.hidden)}><Ico id="eye-off" size="s18" /></button>
  </div>
</header>
{#if privacy.hidden}
  <div class="jbanner" role="status"><Ico id="eye-off" size="s18" /><div><b>{SAY.hiddenTitle}</b> {SAY.hidden}</div></div>
{/if}

<style>
  .hh { padding: 12px 0 8px; display: grid; gap: 4px; }
  .back { display: inline-flex; align-items: center; gap: 2px; min-height: var(--tap); margin-left: -6px; padding: 0 6px; justify-self: start; color: var(--link); font: 600 15px/20px var(--font-text); text-decoration: none; border-radius: var(--r-sm); }
  .row { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0; }
  .row h1 { padding: 0; min-width: 0; overflow-wrap: anywhere; }
  .iconbtn { cursor: pointer; flex: none; }
  .iconbtn[aria-pressed='true'] { background: var(--btn); color: var(--btn-ink); }
</style>
