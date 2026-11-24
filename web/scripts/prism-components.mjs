// The app's component styles are lines copied word for word from the designs: Prism (docs/design/prism/index.html)
// and, for screens Prism does not draw on its own page, the Journeys design's shell and journey styles.
// With --check, every rule line in every src/lib/prism/*.css must appear exactly in one of those sources, so a
// component is changed in the design first and never redrawn in the app (.claude/rules/design-sync.md). Fails closed:
// an unreadable source, an empty folder or a file with no rules is a failure.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const J = ['docs', 'design', 'journeys', 'src'];
export const SOURCES = [
  ['docs', 'design', 'prism', 'index.html'],
  [...J, 'shell.css'],
  ...['privacy', 'home', 'holdings', 'journal', 'cost'].map((n) => [...J, 'journeys', `${n}.css`])
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
  const p = files.flatMap((f) => problems(readFileSync(join(dir, f), 'utf8'), html, f));
  if (p.length) {
    console.error(p.join('\n'));
    process.exit(1);
  }
  console.log(`prism-components: every rule in ${files.join(', ')} is the design's own`);
}
