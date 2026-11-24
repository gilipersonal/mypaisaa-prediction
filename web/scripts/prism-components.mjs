// The app's component styles are lines copied word for word from the designs: Prism (docs/design/prism/index.html)
// and, for screens Prism does not draw on its own page, the Journeys design's shell and journey styles.
// With --check, every rule line in every src/lib/prism/*.css must appear exactly in one of those sources, so a
// component is changed in the design first and never redrawn in the app (.claude/rules/design-sync.md). Fails closed:
// an unreadable source, an empty folder or a file with no rules is a failure.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const J = ['docs', 'design', 'journeys', 'src'];
export const SOURCES = [
  ['docs', 'design', 'prism', 'index.html'],
  ['docs', 'design', 'reviews', 'MP-62', 'shared', 'claude.html'],
  [...J, 'shell.css'],
  ...['home', 'holdings', 'forecast', 'journal', 'track', 'cost', 'privacy'].map((n) => [...J, 'journeys', `${n}.css`])
];
/** @param {string} componentsCss @param {string} prismHtml @param {string} [name] @returns {string[]} */
export function problems(componentsCss, prismHtml, name = 'components.css') {
  const prism = new Set(prismHtml.split('\n').map((/** @type {string} */ l) => l.trim()));
  const out = [];
  let rules = 0;
  for (const [i, raw] of componentsCss.split('\n').entries()) {
    const line = raw.trim();
    if (!line || line.startsWith('/*')) continue;
    rules += 1;
    if (!prism.has(line)) out.push(`${name}:${i + 1} is not a design line: ${line.slice(0, 90)}`);
  }
  if (rules === 0) out.push(`${name} holds no rules`);
  return out;
}

/** Every .svelte file's <style> block under a folder, as [relative path, css]. @param {string} dir @returns {[string, string][]} */
export function svelteStyles(dir) {
  /** @type {[string, string][]} */
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...svelteStyles(p));
    else if (name.endsWith('.svelte')) {
      const m = /<style[^>]*>([\s\S]*?)<\/style>/.exec(readFileSync(p, 'utf8'));
      if (m && m[1] !== undefined) out.push([p.slice(p.indexOf('src')), m[1]]);
    }
  }
  return out;
}

if (process.argv.includes('--check')) {
  const dir = join(web, 'src', 'lib', 'prism');
  let files, html;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.css')).sort();
    html = SOURCES.map((p) => readFileSync(join(web, '..', ...p), 'utf8')).join('\n');
  } catch (e) {
    console.error(`prism-components: cannot read a source: ${e instanceof Error ? e.message : e}`);
    process.exit(2);
  }
  if (!files.length) {
    console.error('prism-components: no style file in src/lib/prism');
    process.exit(2);
  }
  // every component's own <style> block is held to the same rule: a style line the design does not have is drawn by hand
  const blocks = svelteStyles(join(web, 'src'));
  const p = [...files.flatMap((f) => problems(readFileSync(join(dir, f), 'utf8'), html, f)),
    ...blocks.flatMap(([f, css]) => problems(css, html, f).filter((x) => !x.endsWith('holds no rules')))];
  if (p.length) {
    console.error(p.join('\n'));
    process.exit(1);
  }
  console.log(`prism-components: every rule in ${files.join(', ')} and in ${blocks.length} component style block(s) is the design's own`);
}
