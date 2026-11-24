<script lang="ts">
  import '#lib/prism/privacy.css';
  import { privacy } from '#lib/privacy.svelte.ts';
  import { COPY, LESS, modeSay } from '#lib/privacy-centre.ts';

  // Privacy option A, "One privacy centre": Settings, then Privacy. Hide amounts is the one control that works here. It
  // is kept on this device, like the theme, and writes nothing to any server. The page already drawn changes at once.
  const on = $derived(privacy.hidden);
</script>

<header class="ph">
  <a class="jback back" href="/settings" aria-label="Back to {COPY.back}">
    <svg class="ico s18" aria-hidden="true"><use href="#i-chev-l" /></svg><span>{COPY.back}</span>
  </a>
  <h1 class="ltitle">{COPY.title}</h1>
</header>

<div class="cols">
  <section class="card fcard privacy-box" aria-labelledby="mode-h">
    <div class="privacy-head">
      <h2 id="mode-h">{COPY.mode}</h2>
      <button class="dimctl privacy-switch" type="button" role="switch" aria-checked={on} aria-label={COPY.hide} aria-describedby="mode-say" onclick={() => privacy.set(!privacy.hidden)}>
        <span aria-hidden="true">{on ? 'On' : 'Off'}</span><span class="sw2" aria-hidden="true"><i></i></span>
      </button>
    </div>
    <p id="mode-say" class="small muted">{modeSay(on)}</p>
    <p class="small muted">Kept on this device only.</p>
  </section>

  <section class="card fcard privacy-box" aria-labelledby="out-h">
    <div class="privacy-head">
      <h2 id="out-h">{COPY.outside}</h2>
      <span class="chip fresh"><span class="dot"></span>{COPY.privateDefault}</span>
    </div>
    <div class="privacy-list">
      {#each LESS as [t, s] (t)}
        <div class="privacy-li plain">
          <div class="txt"><div class="t">{t}</div><div class="s">{s}</div></div>
          <div class="e">
            <button class="dimctl privacy-switch" type="button" role="switch" aria-checked="false" aria-label={t} disabled>
              <span aria-hidden="true">Off</span><span class="sw2" aria-hidden="true"><i></i></span>
            </button>
          </div>
        </div>
      {/each}
    </div>
    <p class="small muted">{COPY.fresh}</p>
  </section>
</div>

<style>
  .ph { padding: 12px 0 8px; display: grid; justify-items: start; gap: 4px; }
  .ph h1 { padding: 0; }
  .back { gap: 2px; margin-left: -4px; font: 400 15px/20px var(--font-text); text-decoration: none; }
  .privacy-head h2 { font: 600 17px/22px var(--font-text); letter-spacing: -0.01em; }
  .txt { min-width: 0; }
  .privacy-switch:disabled { cursor: not-allowed; }
  .cols { display: grid; gap: 16px; align-items: start; }
  @media (min-width: 1024px) { .cols { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); } }
</style>
