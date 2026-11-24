import type { IdentityProvider, Method, Session, SignInResult } from './types';

/**
 * A pretend identity provider for local work only (step 2 of the build, 24 November 2026). It calls no service,
 * holds no token and signs in one sample owner. Real Cognito replaces it behind the same contract once MP-71 and
 * MP-197 have run, each with the owner's yes.
 *
 * A scenario in the address (?pretend=...) shows each drawn state of the sign-in screen, so the states can be
 * pressed and tested: new-device, google-down, wrong-account, paused, expired.
 */
export const ENVIRONMENT = 'local';
const KEY = 'mp-pretend-session';
const SUBJECT = 'owner-sample';
/** Placeholder: the fresh sign-in and revocation times are values the owner still sets (OWN-39). */
export const SESSION_MINUTES = 60;

export type Scenario = 'none' | 'new-device' | 'google-down' | 'wrong-account' | 'paused' | 'expired';
const SCENARIOS: readonly Scenario[] = ['new-device', 'google-down', 'wrong-account', 'paused', 'expired'];

export function scenarioOf(search: string): Scenario {
  const v = new URLSearchParams(search).get('pretend');
  return (SCENARIOS as readonly string[]).includes(v ?? '') ? (v as Scenario) : 'none';
}

interface Store {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

function read(store: Store): Session | null {
  try {
    const raw = store.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<Session>;
    const ok = typeof s.subject === 'string' && (s.method === 'passkey' || s.method === 'google')
      && typeof s.signedInAt === 'number' && typeof s.expiresAt === 'number' && typeof s.environment === 'string';
    return ok ? (s as Session) : null;
  } catch {
    return null;
  }
}

export function pretendProvider(opts: {
  scenario: Scenario;
  store: Store;
  now?: () => number;
  online?: () => boolean;
  delayMs?: number;
}): IdentityProvider {
  const now = opts.now ?? Date.now;
  const online = opts.online ?? (() => true);
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  if (opts.scenario === 'expired' && !read(opts.store)) {
    const t = now();
    opts.store.setItem(KEY, JSON.stringify({ subject: SUBJECT, method: 'passkey', signedInAt: t - 2 * 3600_000, expiresAt: t - 3600_000, environment: ENVIRONMENT }));
  }

  return {
    label: 'Pretend sign-in · local',
    environment: ENVIRONMENT,
    hasPasskeyHere: () => opts.scenario !== 'new-device',
    googleAvailable: () => opts.scenario !== 'google-down',
    async signIn(method: Method): Promise<SignInResult> {
      if (!online()) return { ok: false, reason: 'offline' };
      if (opts.scenario === 'paused') return { ok: false, reason: 'rate_limited' };
      if (method === 'google' && opts.scenario === 'google-down') return { ok: false, reason: 'provider_unavailable' };
      if (method === 'passkey' && opts.scenario === 'new-device') return { ok: false, reason: 'cancelled' };
      await wait(opts.delayMs ?? (method === 'google' ? 700 : 250));
      if (opts.scenario === 'wrong-account') return { ok: false, reason: 'denied' };
      const t = now();
      const session: Session = { subject: SUBJECT, method, signedInAt: t, expiresAt: t + SESSION_MINUTES * 60_000, environment: ENVIRONMENT };
      try {
        opts.store.setItem(KEY, JSON.stringify(session));
      } catch {
        /* storage blocked: the session lasts for this page only */
      }
      return { ok: true, session };
    },
    restore: () => read(opts.store),
    signOut() {
      try {
        opts.store.removeItem(KEY);
      } catch {
        /* nothing kept */
      }
    }
  };
}
