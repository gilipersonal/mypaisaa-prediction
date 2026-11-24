import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLACES, TABS, childrenOf, pageTitle, placeOf, tabOf } from '../../src/lib/places';

const prism = readFileSync(new URL('../../../docs/design/prism/index.html', import.meta.url), 'utf8');
const icons = readFileSync(new URL('../../../docs/design/prism/icons.svg', import.meta.url), 'utf8');
const pairs = (src: string) => [...src.matchAll(/\['([a-z-]+)', '([^']+)'/g)].map((m) => [m[1], m[2]]);

describe('places follow Prism', () => {
  it('the sidebar is Prism\'s nine, in order, with its icons and labels', () => {
    const line = prism.split('\n').find((l: string) => l.startsWith('const SIDE_ITEMS = '));
    expect(line, 'Prism lost SIDE_ITEMS').toBeTruthy();
    expect(PLACES.map((p) => [p.icon, p.label])).toEqual(pairs(line!));
  });

  it('the phone keeps Prism\'s five tabs, in order', () => {
    const line = prism.split('\n').find((l: string) => l.startsWith('const tabs = '));
    expect(line, 'Prism lost its tab bar').toBeTruthy();
    const drawn = pairs(line!.slice(line!.indexOf('[[')));
    expect(TABS.map((t) => [t.icon, t.tabLabel ?? t.label])).toEqual(drawn);
  });

  it('every icon used is in Prism\'s sprite', () => {
    for (const p of PLACES) expect(icons, p.icon).toContain(`id="i-${p.icon}"`);
    for (const i of ['chev-r', 'clock', 'info']) expect(icons).toContain(`id="i-${i}"`);
  });

  it('paths are unique and every non-tab place hangs off a tab', () => {
    expect(new Set(PLACES.map((p) => p.path)).size).toBe(PLACES.length);
    for (const p of PLACES.filter((x) => !x.tab)) expect(TABS.map((t) => t.id)).toContain(p.under);
  });

  it('Research hangs off Portfolio; Approvals, Imports and Data sources sit under Settings (OWN-02)', () => {
    expect(childrenOf('portfolio').map((p) => p.id)).toEqual(['research']);
    expect(childrenOf('settings').map((p) => p.id)).toEqual(['approvals', 'imports', 'sources']);
  });

  it('a path lights its place, and on a phone its tab', () => {
    expect(placeOf('/').id).toBe('portfolio');
    expect(placeOf('/research/').id).toBe('research');
    expect(tabOf(placeOf('/research')).id).toBe('portfolio');
    expect(tabOf(placeOf('/imports')).id).toBe('settings');
    expect(placeOf('/nowhere').id).toBe('portfolio');
    expect(placeOf('/settings/privacy').id).toBe('settings');
    expect(placeOf('/holdings/AAPL').id).toBe('portfolio');
    expect(placeOf('/settingsx').id).toBe('portfolio');
    expect(placeOf('/settings///').id).toBe('settings');
    expect(placeOf('///').id).toBe('portfolio');
  });

  it('trims a very long run of slashes quickly', () => {
    const start = performance.now();
    // a path under Settings lights Settings since MP-205; the timing is what this case guards (CodeQL)
    expect(placeOf('/settings' + '/'.repeat(200_000) + 'x').id).toBe('settings');
    expect(placeOf('/settings' + '/'.repeat(200_000)).id).toBe('settings');
    expect(performance.now() - start).toBeLessThan(200);
  });
});

describe('page titles', () => {
  it('names the page, not only its place (MP-205)', () => {
    expect(pageTitle('/')).toBe('Portfolio');
    expect(pageTitle('/record')).toBe('Journal');
    expect(pageTitle('/record/track')).toBe('Track record');
    expect(pageTitle('/holdings')).toBe('Holdings');
    expect(pageTitle('/holdings/')).toBe('Holdings');
    expect(pageTitle('/holdings/nvda')).toBe('NVDA');
    expect(pageTitle('/holdings/%E0')).toBe('%E0');
    expect(pageTitle('/settings')).toBe('Settings');
    expect(pageTitle('/settings/privacy')).toBe('Privacy');
    expect(pageTitle('/sources')).toBe('Data sources');
  });
});
