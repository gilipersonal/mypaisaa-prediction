import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { privacy, SHOW_FOR_S } from '../../src/lib/privacy.svelte';

/* Tap to show, option A (the owner's pick of 24 Nov 2026, MP-205): a tap shows every amount for 30 seconds. */
describe('tap to show', () => {
  beforeEach(() => { vi.useFakeTimers(); privacy.set(true); });
  afterEach(() => { privacy.set(false); vi.useRealTimers(); });

  it('shows every amount for 30 seconds, counting down, with the setting left on', () => {
    expect(privacy.masked).toBe(true);
    privacy.show();
    expect(SHOW_FOR_S).toBe(30);
    expect(privacy.masked).toBe(false);
    expect(privacy.hidden).toBe(true);
    expect(privacy.left).toBe(30);
    expect(privacy.said).toBe('Amounts showing for 30 seconds');
    vi.advanceTimersByTime(6_000);
    expect(privacy.left).toBe(24);
    vi.advanceTimersByTime(24_000);
    expect(privacy.left).toBe(0);
    expect(privacy.masked).toBe(true);
    expect(privacy.said).toBe('Amounts hidden again');
  });

  it('hides at once on Hide now, and a press after that starts a fresh 30 seconds', () => {
    privacy.show();
    vi.advanceTimersByTime(10_000);
    privacy.hideNow();
    expect(privacy.masked).toBe(true);
    privacy.show();
    expect(privacy.left).toBe(30);
  });

  it('does nothing while amounts are not hidden, and turning the setting off ends a showing', () => {
    privacy.show();
    privacy.set(false);
    expect(privacy.left).toBe(0);
    privacy.show();
    expect(privacy.left).toBe(0);
    expect(privacy.masked).toBe(false);
  });

  it('stores nothing: only the setting is kept on the device', () => {
    const kept = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => kept.get(k) ?? null, setItem: (k: string, v: string) => void kept.set(k, v), removeItem: (k: string) => void kept.delete(k) });
    privacy.set(true);
    const before = [...kept.entries()];
    privacy.show();
    vi.advanceTimersByTime(5_000);
    privacy.hideNow();
    expect([...kept.entries()]).toEqual(before);
    expect(before).toEqual([['mp-hide-amounts', '1']]);
    vi.unstubAllGlobals();
  });
});
