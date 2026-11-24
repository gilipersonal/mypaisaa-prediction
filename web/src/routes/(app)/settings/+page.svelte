<script lang="ts">
  import { onMount } from 'svelte';
  import PlaceHeader from '#lib/components/PlaceHeader.svelte';
  import PlaceLinks from '#lib/components/PlaceLinks.svelte';
  import Icon from '#lib/components/Icon.svelte';
  import { privacy } from '#lib/privacy.svelte.ts';
  import { placeById, childrenOf } from '#lib/places.ts';
  import { applyTheme, readTheme, THEMES, type Theme } from '#lib/theme.ts';
  import { goto } from '$app/navigation';
  import { auth } from '#lib/auth/auth.svelte.ts';

  const how = $derived(auth.session?.method === 'google' ? 'Google' : 'a passkey');
  let leaving = $state(false);

  async function signOut() {
    leaving = true;
    await auth.signOut();
    await goto('/signin', { replaceState: true });
  }

  let theme: Theme = $state('system');
  onMount(() => { theme = readTheme(); });

  function choose(t: Theme) {
    theme = t;
    applyTheme(t);
  }
</script>

<PlaceHeader place={placeById('settings')} />

<section class="card pane" aria-labelledby="look-h">
  <h2 id="look-h">Appearance</h2>
  <div class="seg" role="group" aria-labelledby="look-h">
    {#each THEMES as t (t.id)}
      <button type="button" class="btn sm" class:btn-primary={theme === t.id} class:btn-tinted={theme !== t.id} aria-pressed={theme === t.id} onclick={() => choose(t.id)}>{t.label}</button>
    {/each}
  </div>
  <p class="small muted">Kept on this device only.</p>
</section>

<!-- Privacy option A, "One privacy centre": Settings, then Privacy, with its status showing. -->
<div class="card privacy-link">
  <a href="/settings/privacy">
    <Icon name="lock" />
    <span class="txt">Privacy<span class="small muted">Hide amounts: {privacy.hidden ? 'On' : 'Off'}</span></span>
    <Icon name="chev-r" size="s18" />
  </a>
</div>

<section class="card pane" aria-labelledby="account-h">
  <h2 id="account-h">Account</h2>
  <p class="small muted">Signed in with {how}. {auth.provider?.label ?? ''}: no real account is used.</p>
  <div><button type="button" class="btn sm btn-tinted" disabled={leaving} onclick={signOut}>Sign out</button></div>
</section>

<PlaceLinks places={childrenOf('settings')} label="More in Settings" />

<style>
  .pane { padding: 16px; display: grid; gap: 12px; }
  .pane h2 { font: 600 17px/22px var(--font-text); letter-spacing: -0.01em; }
  .seg { display: flex; gap: 8px; flex-wrap: wrap; }
  .small { margin: 0; }
  .privacy-link { margin: 16px 0; }
  .privacy-link a { display: flex; align-items: center; gap: 12px; min-height: var(--tap); padding: 10px 16px; color: var(--ink); text-decoration: none; font: 400 17px/22px var(--font-text); letter-spacing: -0.01em; --ic2: var(--link); }
  .privacy-link .txt { flex: 1; display: grid; min-width: 0; }
</style>
