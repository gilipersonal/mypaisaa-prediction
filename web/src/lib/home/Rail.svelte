<script lang="ts">
  import Badge from './Badge.svelte';
  import Ic from './Ic.svelte';
  import Later from './Later.svelte';
  import { ACTS_LEAD, BRIEF, BRIEF_FIRST, LATE_RULE, LATER, STAMPS, type Act, type DesignState } from './home.ts';
  import { later } from './later.svelte.ts';
  /**
   * The rail from 1024 wide (home.js homeA rail): the brief as it surfaces on Home, then the ranked actions. The brief and an
   * action's reasons are not built in this step, so their controls say so after themselves when pressed.
   */
  let { st, acts }: { st: DesignState; acts: Act[] } = $props();
  const b = $derived(BRIEF[st]);
</script>

<div class="card home-card"><div style="display:flex;align-items:center;gap:8px"><Ic id="clock" cls="s18" /><h4 style="flex:1">{b[0]}</h4></div><p class="home-sub">{b[1]}</p>{#if st === 'empty'}<p class="home-sub">{BRIEF_FIRST}</p>{:else}<div class="home-stamps">{#each STAMPS as s (s)}<span class="chip">{s}</span>{/each}</div><button class="btn sm btn-tinted" type="button" onclick={() => later.press('brief-card')}>Open the brief</button><Later id="brief-card" say={LATER.brief} />{/if}</div>
<div class="card home-card"><h4>Ranked actions</h4><p class="home-sub">{ACTS_LEAD}</p>{#if st === 'empty'}<p class="home-sub">None yet.</p>{:else}{#each acts as a (a.ticker)}<div class="home-act" role="button" tabindex="0" onclick={() => later.press(`act-${a.ticker}`)} onkeydown={(e) => later.key(`act-${a.ticker}`, e)}><Badge a={a.action} /><b>{a.name}</b><span class="home-sub">{a.why}{#if a.settled}{' '}<span class="chip owner"><span class="dot"></span>{LATE_RULE}</span>{/if}</span></div><Later id="act-{a.ticker}" say={LATER.act} />{/each}{/if}</div>
