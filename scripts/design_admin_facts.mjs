#!/usr/bin/env node
// What MP-64 asks of the admin page, proved with no browser, so CI can run it (docs/design/admin/README.md).
//
//   node scripts/design_admin_facts.mjs              # every check on docs/design/admin/index.html
//   node scripts/design_admin_facts.mjs --page PATH  # against another build, such as a designer's partial page
//   node scripts/design_admin_facts.mjs --selftest   # mutated copies must each be refused for their reason
//
// Exit 0 when all hold, 1 when one fails, 2 when it cannot run. A partial page (--page) skips only the checks that
// need the whole page, and says so.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load, textOf } from './design_journeys_facts.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = join(ROOT, 'docs/design/admin/index.html');
const PERMS = JSON.parse(readFileSync(join(ROOT, 'docs/design/admin/permissions.json'), 'utf8'));
const IDS = ['home', 'files', 'audit', 'runs', 'agents', 'models', 'approvals', 'costs', 'incidents', 'identity'];
const STATES = ['default', 'loading', 'empty', 'partial', 'error', 'stale', 'offline', 'conflict', 'expired', 'denied'];
const SURFACES = ['iphone', 'ipad', 'web', 'pwa'];
const COVER = ['compare', 'decide', 'source', 'correct', 'config', 'cost', 'recover'];
const PROPOSED = /^(CT-\d+|PL-\d+|FC-\d+|FIN-OD-\d+|MP40-Q\d+|SCI-D\d+|DATA-DEC-\d+|POLICY-\d+|COST-Q\d+|ARC-06b-O\d)$/;
// One owner, no household; no over-claimed integrity; no word the records do not use for a pause (lesson 21).
const BARRED = [[/\b(household|team member|invite a user|add a user|admin role|other users?)\b/i, 'a multi-user word'], [/tamper[- ]?proof/i, 'an integrity claim'], [/kill switch/i, '"kill switch", which no record uses'], [/—/, 'an em dash'], [/\b(buy|sell|place an order|submit an order)\b/i, 'a trade word']];
const NEEDED = ['R1', 'R5', 'R6', 'R8'];   // the story's negative acceptance is drawn as a refusal

function walk(journeys, fn) {
  for (const j of journeys) for (const o of j.options) for (const s of o.screens) for (const kind of SURFACES) for (const state of STATES) {
    if ((s.na || {})[state]) continue;
    fn(s.render({ kind, state, scheme: 'light', journey: j.id, option: o.id, screen: s.id }), `${j.id}.${o.id}.${s.id} ${kind} ${state}`, { j, o, s, kind, state });
  }
}

export function problems(journeys, whole = true) {
  const out = [], acts = new Set(), refused = new Set();
  const heads = journeys.map((j) => j.id);
  if (whole && heads.join() !== IDS.join()) out.push(`the page holds ${heads}; it needs ${IDS}`);
  for (const j of journeys) {
    if (j.options.length < 2) out.push(`${j.id}: ${j.options.length} option(s), at least two are needed`);
    if (j.options.filter((o) => o.rec).length !== 1) out.push(`${j.id}: exactly one option is recommended`);
    for (const o of j.options) {
      const seen = new Set();
      for (const s of o.screens) { if (seen.has(s.id)) out.push(`${j.id}.${o.id}: screen ${s.id} twice`); seen.add(s.id); for (const [k, r] of Object.entries(s.na || {})) { if (!STATES.includes(k)) out.push(`${j.id}.${o.id}.${s.id}: na names ${k}, not a state`); if (String(r).length < 8) out.push(`${j.id}.${o.id}.${s.id}: ${k} is n/a with no reason`); } }
      if (j.id === 'home') continue;
      for (const k of COVER) {
        const v = (o.covers || {})[k];
        if (typeof v !== 'string') out.push(`${j.id}.${o.id}: covers has no ${k}`);
        else if (v.startsWith('n/a: ')) { if (v.length < 20) out.push(`${j.id}.${o.id}: ${k} is n/a with no reason`); }
        else if (!seen.has(v)) out.push(`${j.id}.${o.id}: covers.${k} names ${v}, which is not a screen of this option`);
      }
    }
  }
  walk(journeys, (html, at) => {
    for (const m of html.matchAll(/data-act="(A\d+)"/g)) acts.add(m[1]);
    for (const m of html.matchAll(/data-refuse="(R\d+)"/g)) refused.add(m[1]);
    const text = textOf(html);
    if (!text) out.push(`${at}: nothing drawn`);
    for (const [re, why] of BARRED) if (re.test(text)) out.push(`${at}: ${why}: "${text.match(re)[0]}"`);
    for (const m of text.matchAll(/Proposed · ([A-Za-z0-9-]+)/g)) if (!PROPOSED.test(m[1])) out.push(`${at}: Proposed names ${m[1]}, which is not a record id`);
  });
  if (whole) {
    for (const p of PERMS.actions) if (p.step_up !== 'outside' && !acts.has(p.id)) out.push(`${p.id} (${p.action}) has no control on any screen`);
    for (const r of NEEDED) if (!refused.has(r)) out.push(`refusal ${r} is drawn nowhere`);
  }
  return [...new Set(out)];
}

function selftest() {
  const cases = [
    ['a missing cover', (js) => { delete js[1].options[0].covers.cost; }, 'covers has no cost'],
    ['a cover naming no screen', (js) => { js[1].options[0].covers.cost = 'nowhere'; }, 'not a screen of this option'],
    ['two recommended', (js) => { js[1].options[1].rec = true; }, 'exactly one option'],
    ['a state with no reason', (js) => { js[1].options[0].screens[0].na = { stale: 'no' }; }, 'n/a with no reason'],
    ['a barred word', (js) => { const r = js[1].options[0].screens[0].render; js[1].options[0].screens[0].render = (c) => r(c) + '<p>Hit the kill switch</p>'; }, 'kill switch'],
    ['an unknown proposal', (js) => { const r = js[1].options[0].screens[0].render; js[1].options[0].screens[0].render = (c) => r(c) + '<p>Proposed · SOON</p>'; }, 'not a record id'],
    ['a journey removed', (js) => { js.splice(2, 1); }, 'it needs'],
  ];
  let bad = 0;
  for (const [name, mutate, reason] of cases) {
    const js = load(PAGE);
    mutate(js);
    const got = problems(js);
    if (!got.some((p) => p.includes(reason))) { bad++; console.log(`FAIL selftest ${name}: not refused for "${reason}"`); }
  }
  console.log(`design-admin-facts selftest: ${cases.length - bad} of ${cases.length} faults refused`);
  return bad ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), i = args.indexOf('--page');
    if (args.includes('--selftest')) process.exit(selftest());
    const page = i >= 0 ? resolve(args[i + 1]) : PAGE;
    const got = problems(load(page), i < 0);
    for (const p of got.slice(0, 60)) console.log(`FAIL ${p}`);
    console.log(`design-admin-facts: ${got.length} problem(s)${i >= 0 ? ' on a partial page; whole-page checks skipped' : ''}`);
    process.exit(got.length ? 1 : 0);
  } catch (e) {
    console.log(`CANNOT RUN: ${e.message}`);
    process.exit(2);
  }
}
