<script lang="ts">
  import { onMount } from 'svelte';
  import { source, type PortfolioTotal } from '#lib/data/index.ts';
  import { formatMoney } from '#lib/money.ts';
  import Icon from './Icon.svelte';

  // Read in the browser, never at build time, so no figure is baked into the static pages (MP-134).
  let status: 'loading' | 'ready' | 'error' = $state('loading');
  let total: PortfolioTotal | undefined = $state();

  onMount(() => {
    source.portfolioTotal().then(
      (t: PortfolioTotal) => { total = t; status = 'ready'; },
      () => { status = 'error'; }
    );
  });
</script>

<section class="card total" aria-labelledby="total-h" aria-busy={status === 'loading'}>
  <div class="row">
    <h2 id="total-h" class="label">Portfolio total</h2>
    <span class="chip"><span class="dot"></span>{source.name}</span>
  </div>
  {#if status === 'loading'}
    <p class="fig muted">Loading</p>
  {:else if status === 'error'}
    <p class="fig"><Icon name="info" size="s18" /> The total could not be read.</p>
  {:else if total}
    <p class="fig" data-testid="total">{formatMoney(total.total)}</p>
    <p class="small muted">Holdings {formatMoney(total.holdings)} · cash {formatMoney(total.cash)} · {total.asOf}</p>
  {/if}
</section>

<style>
  .total { padding: 16px; display: grid; gap: 6px; }
  .row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .label { margin: 0; font: 600 15px/20px var(--font-text); letter-spacing: -0.01em; color: var(--ink-2); }
  .fig { margin: 0; display: flex; align-items: center; gap: 8px; font: 700 34px/41px var(--font-figure); letter-spacing: -0.02em; }
  .small { margin: 0; }
</style>
