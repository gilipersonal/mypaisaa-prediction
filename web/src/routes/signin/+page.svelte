<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '#lib/auth/auth.svelte.ts';
  import { safeNext } from '#lib/auth/policy.ts';
  import type { Method, SignInFailure } from '#lib/auth/types.ts';
  import Icon from '#lib/components/Icon.svelte';
  import Banner from '#lib/components/Banner.svelte';

  /**
   * The sign-in screen as the Privacy journey draws it (privacy-a-signin): passkey first, Google second, no
   * passwords, nothing behind it. Each state has the journey's own words.
   */
  type View = 'default' | 'loading' | 'empty' | 'error' | 'stale' | 'offline' | 'disagreement' | 'abstention';

  let ready = $state(false);
  let wide = $state(false);
  let online = $state(true);
  let busy: Method | null = $state(null);
  let failure: SignInFailure | null = $state(null);
  let expired = $state(false);
  let newDevice = $state(false);
  let googleUp = $state(true);
  let next = '/';

  const view: View = $derived(
    !online ? 'offline'
    : busy === 'google' ? 'loading'
    : failure === 'rate_limited' ? 'abstention'
    : failure === 'denied' ? 'disagreement'
    : failure === 'offline' ? 'offline'
    : expired ? 'stale'
    : !googleUp ? 'error'
    : newDevice ? 'empty'
    : 'default'
  );
  const locked = $derived(view === 'loading' || view === 'offline' || view === 'abstention' || busy !== null);

  onMount(() => {
    const params = new URLSearchParams(location.search);
    next = safeNext(params.get('next'));
    auth.init(location.search);
    if (auth.status === 'signed_in') {
      goto(next, { replaceState: true });
      return;
    }
    expired = params.get('reason') === 'expired' || auth.status === 'expired';
    newDevice = !(auth.provider?.hasPasskeyHere() ?? true);
    googleUp = auth.provider?.googleAvailable() ?? true;
    online = navigator.onLine;
    const mq = matchMedia('(min-width: 768px)');
    wide = mq.matches;
    const onMq = () => (wide = mq.matches);
    const onLine = () => (online = navigator.onLine);
    mq.addEventListener('change', onMq);
    addEventListener('online', onLine);
    addEventListener('offline', onLine);
    ready = true;
    return () => {
      mq.removeEventListener('change', onMq);
      removeEventListener('online', onLine);
      removeEventListener('offline', onLine);
    };
  });

  async function signIn(method: Method) {
    if (locked) return;
    busy = method;
    failure = null;
    const why = await auth.signIn(method);
    busy = null;
    if (why === null) {
      await goto(next, { replaceState: true });
    } else if (why === 'provider_unavailable') {
      googleUp = false;
    } else if (why !== 'cancelled') {
      failure = why;
    }
  }
</script>

<svelte:head>
  <title>Sign in · MyPrediction</title>
</svelte:head>

<div class="privacy-cover" class:wide>
  <main class="privacy-in" aria-labelledby="signin-h">
    <h1 id="signin-h" class="sr">Sign in</h1>
    <div class="privacy-brand">
      <span class="brand-mark" aria-hidden="true"></span>
      <h2>MyPrediction</h2>
      <p>Private forecasts for one owner.</p>
    </div>

    <div aria-live="polite">
      {#if view === 'loading'}
        <Banner title="Waiting for Google." text="Finish in the window it opened. Nothing is signed in yet." icon="clock" />
      {:else if view === 'empty'}
        <Banner title="New device." text="No passkey here yet. Use Google, then confirm on a device you trust." icon="shield" />
      {:else if view === 'error'}
        <Banner kind="warn" title="Google cannot be reached." text="Your passkey still works. Google comes back when the provider does." icon="alert" />
      {:else if view === 'stale'}
        <Banner kind="warn" title="Your session expired." text="Sign in to carry on. An approval you had not finished needs a fresh yes." icon="clock" />
      {:else if view === 'offline'}
        <Banner title="Offline." text="Sign-in needs a connection. Try again when you are back online." icon="wifi-off" />
      {:else if view === 'disagreement'}
        <Banner kind="fall" title="That sign-in did not work here." text="Use the account and environment you set up. A matching email is never enough." icon="split" />
      {:else if view === 'abstention'}
        <Banner kind="warn" title="Sign-in is paused." text="Too many tries. Wait a few minutes, then try again." icon="ban" />
      {/if}
    </div>

    <div class="privacy-acts">
      {#if view === 'empty'}
        <button class="btn btn-primary" type="button" disabled={!ready || locked} onclick={() => signIn('google')}><Icon name="person" size="s18" />Continue with Google</button>
        <button class="btn btn-tinted" type="button" disabled={!ready || locked} onclick={() => signIn('passkey')}><Icon name="lock" size="s18" />Continue with a passkey</button>
      {:else}
        <button class="btn btn-primary" type="button" disabled={!ready || locked} onclick={() => signIn('passkey')}>
          {#if busy === 'passkey'}<span class="spin" aria-hidden="true"></span>{:else}<Icon name="lock" size="s18" />{/if}Continue with a passkey
        </button>
        <button class="btn btn-tinted" type="button" disabled={!ready || locked || view === 'error'} onclick={() => signIn('google')}>
          {#if view === 'loading'}<span class="spin" aria-hidden="true"></span>Waiting for Google{:else if view === 'error'}<Icon name="person" size="s18" />Google unavailable{:else}<Icon name="person" size="s18" />Continue with Google{/if}
        </button>
      {/if}
      <div class="privacy-chips" style="justify-content: center">
        <span class="chip illus"><span class="dot"></span>No passwords</span>
        <span class="chip unverified"><Icon name="info" size="s14" />{auth.provider?.label ?? 'Pretend sign-in · local'}</span>
      </div>
    </div>
  </main>
</div>
