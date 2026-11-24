import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyTheme, readTheme } from '../../src/lib/theme';

function fakeStorage() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
}

describe('theme', () => {
  beforeEach(() => vi.stubGlobal('localStorage', fakeStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it('applies to the page at once and is read back', () => {
    const root = { dataset: {} as Record<string, string> } as unknown as HTMLElement;
    applyTheme('dark', root);
    expect(root.dataset.theme).toBe('dark');
    expect(readTheme()).toBe('dark');
    applyTheme('system', root);
    expect(root.dataset.theme).toBeUndefined();
    expect(readTheme()).toBe('system');
  });

  it('ignores a stored value it does not know', () => {
    localStorage.setItem('mp-theme', '"><script>');
    expect(readTheme()).toBe('system');
  });

  it('still changes the page when storage is blocked', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => { throw new Error('blocked'); } });
    const root = { dataset: {} as Record<string, string> } as unknown as HTMLElement;
    applyTheme('light', root);
    expect(root.dataset.theme).toBe('light');
    expect(readTheme()).toBe('system');
  });
});
