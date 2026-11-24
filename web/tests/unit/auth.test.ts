import { describe, expect, it } from 'vitest';
import { safeNext, sessionState } from '../../src/lib/auth/policy';
import { ENVIRONMENT, SESSION_MINUTES, pretendProvider, scenarioOf, type Scenario } from '../../src/lib/auth/pretend';
import type { Session } from '../../src/lib/auth/types';

function store() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m };
}
const T = 1_800_000_000_000;
const make = (scenario: Scenario, extra: Partial<Parameters<typeof pretendProvider>[0]> = {}) => {
  const s = store();
  return { s, p: pretendProvider({ scenario, store: s, now: () => T, delayMs: 0, ...extra }) };
};
const session = (over: Partial<Session> = {}): Session => ({ subject: 'x', method: 'passkey', signedInAt: T - 1, expiresAt: T + 1000, environment: 'local', ...over });

describe('sessionState', () => {
  it('is valid only before it expires and only in its own environment', () => {
    expect(sessionState(null, T, 'local')).toBe('none');
    expect(sessionState(session(), T, 'local')).toBe('valid');
    expect(sessionState(session({ expiresAt: T }), T, 'local')).toBe('expired');
    expect(sessionState(session({ environment: 'prod' }), T, 'local')).toBe('foreign');
  });
});

describe('safeNext refuses anything that leaves the app', () => {
  it.each([
    [null, '/'], ['', '/'], ['/forecasts', '/forecasts'], ['/settings?x=1', '/settings?x=1'],
    ['//evil.example', '/'], ['https://evil.example', '/'], ['/\\evil.example', '/'], ['javascript:alert(1)', '/'],
    ['forecasts', '/'], ['/signin', '/'], ['/signin?next=/x', '/'], ['/a\u0000b', '/'], ['/' + 'a'.repeat(300), '/'],
    ['/x:y', '/']
  ])('%s goes to %s', (raw, want) => expect(safeNext(raw as string | null)).toBe(want));
});

describe('the pretend provider', () => {
  it('reads only known scenarios from the address', () => {
    expect(scenarioOf('?pretend=google-down')).toBe('google-down');
    expect(scenarioOf('?pretend=<script>')).toBe('none');
    expect(scenarioOf('')).toBe('none');
  });

  it('signs in with a passkey, keeps an opaque session for its own environment, and signs out', async () => {
    const { s, p } = make('none');
    const r = await p.signIn('passkey');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.session.environment).toBe(ENVIRONMENT);
    expect(r.session.expiresAt - r.session.signedInAt).toBe(SESSION_MINUTES * 60_000);
    expect(r.session.subject).not.toContain('@');
    expect(p.restore()).toEqual(r.session);
    expect([...s.m.values()].join()).not.toMatch(/token|secret|@/i);
    p.signOut();
    expect(p.restore()).toBeNull();
  });

  it('Google down: Google refused, the passkey still works', async () => {
    const { p } = make('google-down');
    expect(p.googleAvailable()).toBe(false);
    expect(await p.signIn('google')).toEqual({ ok: false, reason: 'provider_unavailable' });
    expect((await p.signIn('passkey')).ok).toBe(true);
  });

  it('a new device has no passkey and signs in with Google', async () => {
    const { p } = make('new-device');
    expect(p.hasPasskeyHere()).toBe(false);
    expect((await p.signIn('passkey')).ok).toBe(false);
    expect((await p.signIn('google')).ok).toBe(true);
  });

  it('wrong account and too many tries refuse both ways, and keep nothing', async () => {
    for (const sc of ['wrong-account', 'paused'] as const) {
      const { s, p } = make(sc);
      for (const m of ['passkey', 'google'] as const) expect((await p.signIn(m)).ok).toBe(false);
      expect(s.m.size).toBe(0);
    }
    expect(await make('paused').p.signIn('passkey')).toEqual({ ok: false, reason: 'rate_limited' });
    expect(await make('wrong-account').p.signIn('passkey')).toEqual({ ok: false, reason: 'denied' });
  });

  it('offline refuses before anything else', async () => {
    const { p } = make('none', { online: () => false });
    expect(await p.signIn('passkey')).toEqual({ ok: false, reason: 'offline' });
  });

  it('the expired scenario leaves a session that has run out', () => {
    const { p } = make('expired');
    expect(sessionState(p.restore(), T, ENVIRONMENT)).toBe('expired');
  });

  it('a damaged kept session is ignored', () => {
    const { s, p } = make('none');
    s.setItem('mp-pretend-session', '{"subject":1}');
    expect(p.restore()).toBeNull();
    s.setItem('mp-pretend-session', 'not json');
    expect(p.restore()).toBeNull();
  });
});
