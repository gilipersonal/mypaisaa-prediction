import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { problems, SOURCES } from '../../scripts/prism-components.mjs';
import { inspect, PLACES } from '../../scripts/check-build.mjs';

const prism = (SOURCES as string[][]).map((p) => readFileSync(new URL(`../../../${p.join('/')}`, import.meta.url), 'utf8')).join('\n');
const css = readFileSync(new URL('../../src/lib/prism/components.css', import.meta.url), 'utf8');

function cleanBuild(): string {
  const dir = mkdtempSync(join(tmpdir(), 'mp-build-'));
  for (const p of PLACES as string[]) writeFileSync(join(dir, p), '<!doctype html><title>x</title>');
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
  it('refuses a line from a journey the gate does not read', () => {
    const home = readFileSync(new URL('../../../docs/design/journeys/src/journeys/home.css', import.meta.url), 'utf8');
    const line = home.split('\n').find((l) => l.startsWith('.') && !prism.includes(l.trim()));
    expect(line).toBeTruthy();
    expect(problems(css + '\n' + line + '\n', prism)).toHaveLength(1);
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
