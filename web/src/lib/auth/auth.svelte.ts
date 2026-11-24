import { pretendProvider, scenarioOf } from './pretend';
import { sessionState } from './policy';
import type { IdentityProvider, Method, Session, SignInFailure } from './types';

export type Status = 'unknown' | 'signed_out' | 'signed_in' | 'expired';

/** The one place the app keeps who is signed in. The screens read it; only sign-in and sign-out change it. */
class Auth {
  status: Status = $state('unknown');
  session: Session | null = $state(null);
  provider: IdentityProvider | null = null;

  /** Called in the browser only. The address may carry a pretend scenario (local work only). */
  init(search: string): void {
    if (!this.provider) {
      let store: Storage | { getItem(): null; setItem(): void; removeItem(): void };
      try {
        store = sessionStorage;
      } catch {
        store = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
      }
      this.provider = pretendProvider({ scenario: scenarioOf(search), store, online: () => navigator.onLine });
    }
    this.refresh();
  }

  refresh(now = Date.now()): void {
    const p = this.provider;
    if (!p) return;
    const s = p.restore();
    const state = sessionState(s, now, p.environment);
    if (state === 'valid') {
      this.session = s;
      this.status = 'signed_in';
    } else if (state === 'expired') {
      this.session = null;
      this.status = 'expired';
    } else {
      if (state === 'foreign') p.signOut();
      this.session = null;
      this.status = 'signed_out';
    }
  }

  async signIn(method: Method): Promise<SignInFailure | null> {
    const p = this.provider;
    if (!p) return 'cancelled';
    const r = await p.signIn(method);
    if (!r.ok) return r.reason;
    this.session = r.session;
    this.status = 'signed_in';
    return null;
  }

  /** Ends the session and clears anything private the browser kept. The shell's own cache stays. */
  async signOut(): Promise<void> {
    this.provider?.signOut();
    this.session = null;
    this.status = 'signed_out';
    await clearPrivate();
  }
}

export async function clearPrivate(): Promise<void> {
  try {
    if (typeof caches === 'undefined') return;
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !k.startsWith('mp-shell-')).map((k) => caches.delete(k)));
  } catch {
    /* nothing to clear */
  }
}

export const auth = new Auth();
