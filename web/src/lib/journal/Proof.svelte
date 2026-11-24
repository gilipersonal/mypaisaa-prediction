<script lang="ts">
  import Ico from './Ico.svelte';
  import Roll from './Roll.svelte';
  import { COPY } from './sample.ts';
  /** The journal's proofCard: Prism's compact proof of today's model (proof(true)), and, beside a past entry, the version that entry cites. */
  let { cites = '' }: { cites?: string } = $props();
  const P = COPY.proof;
</script>

<div class="card fcard" data-mo="card"><div class="label">{P.label}</div>
  <div style="display:flex;align-items:baseline;gap:8px;margin-top:6px;flex-wrap:wrap"><span class="amt" style="font-size:30px"><Roll v="79" /><span class="p">%</span></span><span class="small muted">{P.held}</span></div>
  <div class="calbar" role="img" aria-label="Observed 79% against a target of 80%"><i data-mo="barx"></i><b></b></div>
  <div class="small muted" style="display:flex;justify-content:space-between;margin-top:6px"><span>{P.observed}</span><span>{P.target}</span></div>
  <div class="proofmodel"><Ico name="cube" /><div style="flex:1"><b>{P.model}</b><div class="small muted">{P.approved}</div></div><Ico name="chev-r" size="s18" /></div>{#if cites}<p class="small muted" style="margin-top:8px">The model today. This entry cites {cites}, the version you saw.</p>{/if}</div>
