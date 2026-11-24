import { describe, expect, it } from 'vitest';
import { isApi, isShell, shellPaths } from '../../src/lib/sw-policy';

describe('the service worker caches the shell only', () => {
  const shell = shellPaths(['_app/immutable/a.js', '/forecasts', 'manifest.webmanifest', 'api/v1/portfolio', '/api']);

  it('makes every path absolute and drops anything under /api', () => {
    expect([...shell].sort()).toEqual(['/_app/immutable/a.js', '/forecasts', '/manifest.webmanifest']);
  });

  it('never treats /api as shell, even when listed', () => {
    expect(isApi('/api')).toBe(true);
    expect(isApi('/api/v1/portfolio')).toBe(true);
    expect(isApi('/apiary')).toBe(false);
    expect(isShell('/api/v1/portfolio', new Set(['/api/v1/portfolio']))).toBe(false);
  });

  it('caches only what the build lists', () => {
    expect(isShell('/forecasts', shell)).toBe(true);
    expect(isShell('/private.json', shell)).toBe(false);
  });
});
