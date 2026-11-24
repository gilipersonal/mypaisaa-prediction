<script lang="ts">
  /**
   * A page in the design's frame (docs/design/journeys/src/shell.js, frame()), drawn as the Journeys page draws it:
   * from 1024 wide the desktop pane (the top bar with the title, the freshness chips and the actions, then the body and the
   * rail in two columns); below it the phone web frame (a glass bar with the title, the freshness row, then the body and the
   * rail in one column). Every class and inline style here is the design's own; app.css only switches between the two.
   */
  import type { Snippet } from 'svelte';
  import Icon from '#lib/components/Icon.svelte';
  import type { DataState } from '#lib/data/state.ts';
  import FreshRow from './FreshRow.svelte';
  import { frameInfo } from './frame.svelte.ts';
  import type { FreshMode } from './run.ts';

  let {
    title, state, fresh, back, actions, phoneActions, body, rail, accessory
  }: {
    title: string;
    state: DataState;
    fresh?: FreshMode;
    back?: { label: string; href: string };
    /** the desktop top bar's actions (the design's webActions, or its actions) */
    actions?: Snippet;
    /** the phone web bar's actions, where the design draws them differently */
    phoneActions?: Snippet;
    body: Snippet;
    rail?: Snippet;
    accessory?: Snippet;
  } = $props();

  $effect(() => { frameInfo.fresh = fresh; return () => { frameInfo.fresh = undefined; }; });
</script>

<div class="jtop d-only">
  {#if back}<a class="jback" href={back.href} aria-label="Back to {back.label}" style="font:400 15px/20px var(--font-text);text-decoration:none"><Icon name="chev-l" size="s18" /><span>{back.label}</span></a>{/if}
  <h1 class="ttl">{title}</h1>
  <div class="acts"><FreshRow {state} mode={fresh} />{@render actions?.()}</div>
</div>

<div class="glass p-only" style="position:fixed;top:0;left:0;right:0;z-index:20;display:flex;align-items:center;gap:10px;padding:8px 12px">
  {#if back}<a class="jback" href={back.href} aria-label="Back to {back.label}" style="text-decoration:none"><Icon name="chev-l" size="s24" /></a>{:else}<span class="brand-mark" aria-hidden="true"></span>{/if}
  <h1 style="font:600 17px/22px var(--font-text);letter-spacing:-.01em">{title}</h1>
  <span style="margin-left:auto;display:flex;gap:6px;align-items:center">{#if phoneActions}{@render phoneActions()}{:else}{@render actions?.()}{/if}</span>
</div>
<div class="p-only" style="padding:0 12px 10px"><FreshRow {state} mode={fresh} /></div>

<div class="jcols" class:one={!rail}>
  <div>{@render body()}</div>
  {#if rail}<div>{@render rail()}</div>{/if}
</div>

{#if accessory}
  <div class="glass p-only" style="position:fixed;left:12px;right:12px;bottom:90px;z-index:19;border-radius:18px;padding:8px">{@render accessory()}</div>
{/if}
<div class="jspace p-only" class:tall={!!accessory}></div>
