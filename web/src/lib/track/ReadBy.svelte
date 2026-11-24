<script lang="ts">
  import Icon from '#lib/components/Icon.svelte';
  /** The design's readBy(): the scorecard read by holding, model or regime, each one tap away. */
  let { hrefs }: { hrefs: { holding: string; model: string; regime: string } } = $props();
  const ROWS = [['holding', 'layers', 'Holding', 'Seven holdings, at 3 and 6 months'], ['model', 'cube', 'Model', 'R2-HGB v2, v3 and the baseline'], ['regime', 'split', 'Regime', 'Four regimes at origin']] as const;
</script>

<div class="card track-by"><div class="track-sec in"><h3>Read it by</h3></div>{#each ROWS as [k, i, t, s] (k)}<a class="track-row" href={hrefs[k]} id="track-open-{k}" style="text-decoration:none"><Icon name={i} size="s18" /><span><b>{t}</b><small>{s}</small></span><Icon name="chev-r" size="s18" /></a>{/each}</div>
