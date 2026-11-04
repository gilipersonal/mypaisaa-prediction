#!/usr/bin/env node
// What each fixed finding in review/MP-62/fixed.json holds, proved on the real rendered screens (MP-62 round 1).
//
//   node scripts/design_journeys_facts.mjs R1-h1                 # one check; exit 0 if it holds, 1 if it fails, 2 if it cannot run
//   node scripts/design_journeys_facts.mjs --all [--only h,j]    # every check
//   node scripts/design_journeys_facts.mjs --all --page PATH     # against another build, to prove a check fails without its fix
//   node scripts/design_journeys_facts.mjs --selftest            # the harness refuses what it should
//
// It runs the page's own script with no browser, so CI can run it: J.start() is held back and every screen's render(ctx)
// is called directly. The checks live in tests/journey_facts/<lane>.mjs. Each exports an object of id -> function(api):
//
//   api.view(journey, option, screen, surface, state, scheme)  -> { html, text }   // throws if the screen does not exist
//   api.screens(journey, option) -> ids;  api.options(journey) -> ids;  api.journeys() -> ids
//   api.each({ journey, option, surface, state, screen }, fn)  // every matching view, fn(view, { journey, option, screen, surface, state, na })
//   api.must(cond, message), api.has(text, regex, message), api.lacks(text, regex, message)
//
// A check tests what the screen shows, never the source's text (lesson 2). A failing check says what it found.
import { existsSync, readFileSync, readdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import vm from 'vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = join(ROOT, 'docs/design/journeys/index.html');
const FACTS = join(ROOT, 'tests/journey_facts');
const SURFACES = ['iphone', 'ipad', 'web', 'pwa'];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];

const stub = () => new Proxy(function () {}, {
  get: (_, k) => (k === Symbol.iterator ? function* () {} : k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : k === 'matches' ? false : stub()),
  apply: () => stub(), construct: () => stub(), set: () => true, has: () => true,
});

export function load(page) {
  if (!existsSync(page)) throw new Error(`no page at ${page}`);
  const html = readFileSync(page, 'utf8');
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((m) => m[1]).filter((s) => s.includes('J.start();'));
  if (scripts.length !== 1) throw new Error(`expected one journeys script in ${page}, found ${scripts.length}`);
  const src = scripts[0].replace('J.start();', 'globalThis.__J = J;');
  const sandbox = { console, setTimeout: () => 0, clearTimeout: () => 0, setInterval: () => 0, requestAnimationFrame: () => 0, cancelAnimationFrame: () => 0 };
  for (const k of ['document', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage', 'performance', 'getComputedStyle', 'matchMedia', 'addEventListener', 'removeEventListener', 'scrollTo', 'CSS', 'PerformanceObserver']) sandbox[k] = stub();
  sandbox.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
  sandbox.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  sandbox.ResizeObserver = sandbox.IntersectionObserver;
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'journeys-page.js', timeout: 20000 });
  if (!sandbox.__J) throw new Error('the page script did not reach J.start()');
  return sandbox.__J.all();
}

const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
export const textOf = (html) => html
  .replace(/<svg[\s\S]*?<\/svg>/g, (m) => (m.match(/aria-label="([^"]*)"/) || [, ' '])[1] + ' ')
  .replace(/<(style|script)[\s\S]*?<\/\1>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z#0-9]+;/g, (e) => ENT[e] ?? ' ')
  .replace(/\s+/g, ' ').trim();

export function api(journeys) {
  const J = (id) => { const j = journeys.find((x) => x.id === id); if (!j) throw new Error(`no journey ${id}`); return j; };
  const O = (j, o) => { const x = J(j).options.find((y) => y.id === o); if (!x) throw new Error(`no option ${j}.${o}`); return x; };
  const S = (j, o, s) => { const x = O(j, o).screens.find((y) => y.id === s); if (!x) throw new Error(`no screen ${j}.${o}.${s}; there are ${O(j, o).screens.map((y) => y.id).join(', ')}`); return x; };
  const view = (j, o, s, surface = 'iphone', state = 'default', scheme = 'light') => {
    const sc = S(j, o, s);
    const html = sc.render({ kind: surface, state: (sc.na || {})[state] ? 'default' : state, scheme, journey: j, option: o, screen: s });
    return { html, text: textOf(html), note: sc.note || '', na: (sc.na || {})[state] };
  };
  const must = (c, m) => { if (!c) throw new Error(m); };
  return {
    view, must,
    journeys: () => journeys.map((j) => j.id),
    options: (j) => J(j).options.map((o) => o.id),
    screens: (j, o) => O(j, o).screens.map((s) => s.id),
    has: (t, re, m) => must(re.test(t), m || `expected ${re} in: ${t.slice(0, 200)}`),
    lacks: (t, re, m) => { const x = t.match(re); must(!x, m || `found "${x && x[0]}" against ${re}`); },
    each(f, fn) {
      let n = 0;
      for (const j of journeys) {
        if (f.journey && f.journey !== j.id) continue;
        for (const o of j.options) {
          if (f.option && f.option !== o.id) continue;
          for (const s of o.screens) {
            if (f.screen && f.screen !== s.id) continue;
            for (const surface of f.surface ? [].concat(f.surface) : SURFACES) for (const state of f.state ? [].concat(f.state) : STATES) { n++; fn(view(j.id, o.id, s.id, surface, state), { journey: j.id, option: o.id, screen: s.id, surface, state }); }
          }
        }
      }
      must(n > 0, `the filter ${JSON.stringify(f)} matched no view`);
    },
  };
}

async function factFiles(only) {
  const out = {};
  if (!existsSync(FACTS)) return out;
  for (const name of readdirSync(FACTS).filter((n) => n.endsWith('.mjs')).sort()) {
    if (only && !only.includes(name.replace('.mjs', ''))) continue;
    const mod = await import(pathToFileURL(join(FACTS, name)));
    for (const [k, v] of Object.entries(mod.default)) { if (out[k]) throw new Error(`${k} is defined twice`); out[k] = v; }
  }
  return out;
}

function selftest() {
  let bad = 0;
  const fail = (m) => { console.log(`selftest: FAIL ${m}`); bad++; };
  const shot = (fn, want) => { try { fn(); fail(`expected a refusal containing "${want}"`); } catch (e) { if (!String(e.message).includes(want)) fail(`expected "${want}", got "${e.message}"`); } };
  const screen = { id: 's', render: (c) => `<b>${c.state}</b>`, na: { noModel: 'no forecast is on it' } };
  const a = api([{ id: 'x', options: [{ id: 'a', screens: [screen] }] }]);
  shot(() => a.view('x', 'a', 'gone'), 'no screen');
  shot(() => a.view('nope', 'a', 's'), 'no journey');
  shot(() => a.each({ journey: 'nope' }, () => {}), 'matched no view');
  shot(() => a.has('abc', /z/), 'expected');
  shot(() => a.lacks('abc', /b/), 'found');
  shot(() => a.must(false, 'said so'), 'said so');
  if (a.view('x', 'a', 's', 'iphone', 'noModel').text !== 'default') fail('a state that does not apply should draw the ready view, and say why');
  if (textOf('<p>a &amp; b</p><svg aria-label="range"><path/></svg>') !== 'a & b range') fail('text reading');
  shot(() => load('/no/such/page.html'), 'no page');
  if (!bad) console.log('selftest: the harness refuses all 7 faults and reads text and not-applicable states correctly');
  return bad ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
const args = process.argv.slice(2);
const take = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args.splice(i, 2)[1] : null; };
const pageArg = take('--page'), only = take('--only');
try {
  if (args.includes('--selftest')) process.exit(selftest());
  const facts = await factFiles(only ? only.split(',') : null);
  const ids = args.includes('--all') ? Object.keys(facts) : args.filter((a) => !a.startsWith('--'));
  if (!ids.length) { console.error('usage: design_journeys_facts.mjs ID... | --all [--only h,j] [--page PATH] | --selftest'); process.exit(2); }
  const a = api(load(pageArg ? resolve(pageArg) : PAGE));
  let failed = 0;
  for (const id of ids) {
    if (!facts[id]) { console.log(`CANNOT RUN ${id}: no such check`); process.exit(2); }
    try { facts[id](a); if (ids.length > 1) console.log(`ok   ${id}`); } catch (e) { failed++; console.log(`FAIL ${id}: ${String(e.message).slice(0, 240)}`); }
  }
  console.log(`design-journeys-facts: ${ids.length - failed} of ${ids.length} hold`);
  process.exit(failed ? 1 : 0);
} catch (e) {
  console.log(`CANNOT RUN: ${e.message}`);
  process.exit(2);
}
}
