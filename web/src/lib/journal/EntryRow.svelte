<script lang="ts">
  import Badge from './Badge.svelte';
  import Ico from './Ico.svelte';
  import Status from './Status.svelte';
  import Units from './Units.svelte';
  import type { ShownEntry } from './journal.ts';
  /**
   * One journal entry: the holding, when and over what horizon, the ranked action beside what you did, and what happened.
   * An entry the design draws opened is a link to it; the others are not links, so nothing promises a page that is not there.
   */
  let { entry, href, showDiffer = true }: { entry: ShownEntry; href?: string; showDiffer?: boolean } = $props();
</script>

{#snippet inner()}
  <span class="logo" style="--c: var({entry.segColor})" aria-hidden="true">{entry.logo}</span>
  <div class="m"><b>{entry.name}</b><span>{entry.on} · {entry.horizon}</span></div>
  <div><Status outcome={entry.outcome} left={entry.left} /></div>
  <div class="l"><Badge action={entry.ranked} /><span><Units text={entry.you} /></span>{#if entry.differed && showDiffer}<span class="chip"><Ico name="split" size="s14" />Differed</span>{/if}</div>
  <div class="o">{entry.line}</div>
{/snippet}

{#if href}
  <a class="journal-e opens" {href} id="entry-{entry.id}">{@render inner()}</a>
{:else}
  <div class="journal-e">{@render inner()}</div>
{/if}

<style>
  .opens { color: inherit; text-decoration: none; }
  .opens:focus-visible { outline-offset: -2px; }
  @media (hover: hover) and (pointer: fine) {
    .opens:hover { background: var(--surface-2); }
  }
</style>
