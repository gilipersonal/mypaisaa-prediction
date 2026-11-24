import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { problems, SOURCES, svelteStyles } from '../../scripts/prism-components.mjs';
import { designCss } from '../../scripts/design-css.mjs';
import { inspect, PLACES } from '../../scripts/check-build.mjs';

const prism = (SOURCES as string[][]).map((p) => readFileSync(new URL(`../../../${p.join('/')}`, import.meta.url), 'utf8')).join('\n');
const css = designCss() as string;

function cleanBuild(): string {
  const dir = mkdtempSync(join(tmpdir(), 'mp-build-'));
  for (const p of PLACES as string[]) { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), '<!doctype html><title>x</title>'); }
  writeFileSync(join(dir, 'manifest.webmanifest'), '{}');
  writeFileSync(join(dir, 'service-worker.js'), '');
  return dir;
}

describe('the Prism drift gate bites', () => {
  it('passes the real components', () => expect(problems(css, prism)).toEqual([]));
  it('refuses a changed value', () => {
    const changed = css.replace('border-radius: var(--r-card)', 'border-radius: 9px');
    expect(changed).not.toBe(css);
    expect(problems(changed, prism)).toHaveLength(1);
  });
  it('refuses an added rule', () => expect(problems(css + '\n.new { color: red; }\n', prism)).toHaveLength(1));
  it('refuses a hand-drawn rule in a component\'s own <style> block', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mp-svelte-'));
    mkdirSync(join(dir, 'src', 'x'), { recursive: true });
    writeFileSync(join(dir, 'src', 'x', 'A.svelte'), '<p>a</p>\n<style>\n  .a { padding: 3px; }\n  .card { padding: 16px; }\n</style>\n');
    const blocks = svelteStyles(join(dir, 'src')) as [string, string][];
    expect(blocks).toHaveLength(1);
    expect(blocks.flatMap(([f, c]) => problems(c, prism, f))).toHaveLength(blocks[0]![1].includes('.card { padding: 16px; }') && prism.includes('.card { padding: 16px; }') ? 1 : 2);
    rmSync(dir, { recursive: true, force: true });
  });
  it('draws with the design\'s whole sheet, in the design\'s order', () => {
    const built = readFileSync(new URL('../../src/lib/prism/design.generated.css', import.meta.url), 'utf8');
    expect(built).toBe(css);
    const page = readFileSync(new URL('../../../docs/design/journeys/index.html', import.meta.url), 'utf8');
    // every line of the sheet is on the Journeys page the owner approved
    const lines = new Set(page.split('\n').map((l) => l.trim()));
    expect(css.split('\n').slice(1).filter((l) => l.trim() && !lines.has(l.trim()))).toEqual([]);
  });
  it('refuses an empty file', () => expect(problems('/* nothing */\n', prism)).toEqual(['components.css holds no rules']));
});

describe('the build inspection bites', () => {
  it('passes a clean build', () => expect(inspect(cleanBuild())).toEqual([]));
  it('refuses a missing build', () => expect(inspect(join(tmpdir(), 'mp-no-such-build'))).toHaveLength(1));
  it.each([
    ['an AWS key', 'const k = "AKIA' + 'ABCDEFGHIJKLMNOP";'],
    ['an Anthropic key', 'const k = "sk-ant-' + 'api03-abcdefgh";'],
    ['a private key', '-----BEGIN RSA PRIVATE' + ' KEY-----'],
    ['unmarked data', '{"synthetic": false}']
  ])('refuses %s', (_what, text) => {
    const dir = cleanBuild();
    mkdirSync(join(dir, '_app'), { recursive: true });
    writeFileSync(join(dir, '_app', 'x.js'), text);
    expect(inspect(dir)).toHaveLength(1);
  });
  it('refuses an environment file', () => {
    const dir = cleanBuild();
    writeFileSync(join(dir, '.env'), 'A=1');
    expect(inspect(dir).join()).toContain('environment file');
  });
  it('refuses a place that was not prerendered', () => {
    const dir = cleanBuild();
    rmSync(join(dir, 'settings.html'));
    expect(inspect(dir)).toEqual(['settings.html was not prerendered']);
  });
});
