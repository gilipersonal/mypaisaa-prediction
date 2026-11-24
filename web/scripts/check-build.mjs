// Build inspection (MP-134): the static output holds no secret, no environment file and no owner data, every place is
// prerendered, and the manifest and service worker exist. Fails closed: an unreadable build is a failure.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const build = join(web, 'build');

/** @type {Array<[RegExp, string]>} */
export const FORBIDDEN = [
  [/AKIA[0-9A-Z]{16}/, 'an AWS access key id'],
  [/sk-ant-[A-Za-z0-9_-]{8,}/, 'an Anthropic API key'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'a private key'],
  [/aws_secret_access_key/i, 'an AWS secret key name'],
  [/MP_[A-Z_]*(SECRET|TOKEN|PASSWORD)/, 'a private environment variable name'],
  [/"synthetic"\s*:\s*false|synthetic:\s*!1|synthetic:\s*false/, 'data that is not marked synthetic']
];
export const PLACES = ['index.html', 'forecasts.html', 'segments.html', 'record.html', 'research.html', 'approvals.html', 'imports.html', 'sources.html', 'settings.html', 'signin.html'];

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

/** @param {string} root @returns {string[]} */
export function inspect(root) {
  const out = [];
  if (!existsSync(root)) return [`no build at ${root}`];
  const files = walk(root);
  for (const f of files) {
    const rel = relative(root, f);
    if (/(^|\/)\.env/.test(rel)) out.push(`${rel}: an environment file is in the build`);
    if (!/\.(html|js|css|json|webmanifest|svg|txt|map)$/.test(f)) continue;
    const text = readFileSync(f, 'utf8');
    for (const [re, what] of FORBIDDEN) if (re.test(text)) out.push(`${rel}: holds ${what}`);
  }
  for (const p of PLACES) if (!existsSync(join(root, p))) out.push(`${p} was not prerendered`);
  if (!existsSync(join(root, 'manifest.webmanifest'))) out.push('manifest.webmanifest is missing');
  if (!existsSync(join(root, 'service-worker.js'))) out.push('service-worker.js is missing');
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const p = inspect(build);
  if (p.length) {
    console.error(`check-build: ${p.length} problem(s)\n${p.join('\n')}`);
    process.exit(1);
  }
  console.log('check-build: no secret, environment file or unmarked data in the build; every place prerendered');
}
