import type { Session } from './types';

/** A session is usable only before it expires and only in the environment it was issued for. */
export function sessionState(s: Session | null, now: number, environment: string): 'none' | 'valid' | 'expired' | 'foreign' {
  if (!s) return 'none';
  if (s.environment !== environment) return 'foreign';
  return now < s.expiresAt ? 'valid' : 'expired';
}

/**
 * Where to go after signing in. Only a path inside this app is accepted: nothing that leaves the site, no scheme,
 * no protocol-relative "//", no backslash, and never back to the sign-in screen. Anything else goes home.
 */
export function safeNext(raw: string | null | undefined): string {
  if (!raw || raw.length > 200) return '/';
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\') || raw.includes(':')) return '/';
  for (let i = 0; i < raw.length; i += 1) {
    const c = raw.charCodeAt(i);
    if (c < 0x20 || c === 0x7f) return '/';
  }
  const path = raw.split(/[?#]/, 1)[0] ?? '/';
  if (path === '/signin' || path.startsWith('/signin/')) return '/';
  return raw;
}
