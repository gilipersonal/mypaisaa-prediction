<script lang="ts">
  import Ico from './Ico.svelte';
  import { COPY } from './sample.ts';
  /**
   * Prism's compact proof of today's model (proof(true)), beside a past entry. Prism draws a chevron on the model line; it is left
   * out here because the model's page is not built yet, so nothing promises a page that is not there (lesson 28).
   */
  let { cites = '' }: { cites?: string } = $props();
  const P = COPY.proof;
</script>

<div class="card fcard">
  <div class="label">{P.label}</div>
  <div class="held"><span class="amt">79<span class="p">%</span></span><span class="small muted">{P.held}</span></div>
  <div class="calbar" role="img" aria-label="Observed 79% against a target of 80%"><i></i><b></b></div>
  <div class="small muted ends"><span>{P.observed}</span><span>{P.target}</span></div>
  <div class="proofmodel"><Ico name="cube" /><div class="who"><b>{P.model}</b><div class="small muted">{P.approved}</div></div></div>
  {#if cites}<p class="small muted cites">The model today. This entry cites {cites}, the version you saw.</p>{/if}
</div>

<style>
  .held { display: flex; align-items: baseline; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
  .held .amt { font-size: 30px; }
  .ends { display: flex; justify-content: space-between; margin-top: 6px; }
  .who { flex: 1; }
  .cites { margin-top: 8px; }
</style>
