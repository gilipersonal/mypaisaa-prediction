<script lang="ts">
  import { onMount } from 'svelte';
  import { MediaQuery } from 'svelte/reactivity';
  import { goto } from '$app/navigation';
  import { auth } from '#lib/auth/auth.svelte.ts';
  import { currentDataState, type DataState } from '#lib/data/state.ts';
  import Ico from '#lib/journal/Ico.svelte';
  import type { JournalIcon } from '#lib/journal/journal.ts';
  import { childrenOf } from '#lib/places.ts';
  import { privacy } from '#lib/privacy.svelte.ts';
  import Frame from '#lib/shell/Frame.svelte';
  import { applyTheme, readTheme, THEMES, type Theme } from '#lib/theme.ts';

  /*
   * Settings. No design screen draws Settings on its own, so it sits in the shared frame and is drawn with the design's own
   * cards and rows (the privacy centre's privacy-box, privacy-head and privacy-li, Prism's segmented control and buttons),
   * with no style of its own: the theme, the way to Privacy with its status, the account, and, on a phone, the places that
   * hang off Settings (OWN-02); from 1024 wide the sidebar shows those itself.
   */
  const how = $derived(auth.session?.method === 'google' ? 'Google' : 'a passkey');
  const wideQ = new MediaQuery('min-width: 1024px', false);
  const under = childrenOf('settings');
  let leaving = $state(false);
  let theme: Theme = $state('system');
  let st: DataState = $state('ready');

  onMount(() => {
    theme = readTheme();
    st = currentDataState();
  });

  async function signOut() {
    leaving = true;
    await auth.signOut();
    await goto('/signin', { replaceState: true });
  }

  function choose(t: Theme) {
    theme = t;
    applyTheme(t);
  }
</script>

{#snippet body()}
  <div class="card fcard privacy-box" data-mo="card"><div class="privacy-head"><h3 id="look-h">Appearance</h3></div><div class="segctl full" role="group" aria-labelledby="look-h" style="--n:{THEMES.length};--i:{Math.max(0, THEMES.findIndex((t) => t.id === theme))}"><span class="lens" aria-hidden="true"></span>{#each THEMES as t (t.id)}<button type="button" aria-pressed={theme === t.id} onclick={() => choose(t.id)}>{t.label}</button>{/each}</div><p class="small muted">Kept on this device only.</p></div>
  <div class="card fcard privacy-box" data-mo="card"><div class="privacy-list"><a class="privacy-li tap" href="/settings/privacy" style="text-decoration:none;color:inherit"><span class="privacy-ic"><Ico name="lock" size="s18" /></span><div style="min-width:0"><div class="t">Privacy</div><div class="s">Hide amounts: {privacy.hidden ? 'On' : 'Off'}</div></div><div class="e"><span class="muted" style="display:inline-grid"><Ico name="chev-r" size="s16" /></span></div></a>{#if !wideQ.current}{#each under as p (p.id)}<a class="privacy-li tap" href={p.path} style="text-decoration:none;color:inherit"><span class="privacy-ic"><Ico name={p.icon as JournalIcon} size="s18" /></span><div style="min-width:0"><div class="t">{p.label}</div></div><div class="e"><span class="muted" style="display:inline-grid"><Ico name="chev-r" size="s16" /></span></div></a>{/each}{/if}</div></div>
  <div class="card fcard privacy-box" data-mo="card"><div class="privacy-head"><h3>Account</h3></div><p class="small muted">Signed in with {how}. {auth.provider?.label ?? ''}: no real account is used.</p><div><button type="button" class="btn sm btn-tinted" disabled={leaving} onclick={signOut}>Sign out</button></div></div>
{/snippet}

<Frame title="Settings" state={st} fresh="default" {body} />
