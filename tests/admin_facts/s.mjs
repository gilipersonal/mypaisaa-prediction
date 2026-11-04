// Lane s, MP-64 round 1: Incidents and Identity. Each check tests what its fix does, on every device and state it applies to.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from '../../scripts/design_journeys_facts.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const page = () => { const i = process.argv.indexOf('--page'); return i >= 0 ? resolve(process.argv[i + 1]) : resolve(ROOT, 'docs/design/admin/index.html'); };
const option = (j, o) => load(page()).find((x) => x.id === j).options.find((x) => x.id === o);
const PHONES = ['iphone', 'pwa'], BIG = ['ipad', 'web'], ALL = ['iphone', 'ipad', 'web', 'pwa'];
const STATES = ['default', 'loading', 'empty', 'partial', 'error', 'stale', 'offline', 'conflict', 'expired', 'denied'];
const live = (html, id) => new RegExp(`data-act="${id}"(?! data-phone-off)`).test(html);
const REPLAY = [['a', 'a-replay'], ['b', 'b-replay']], SWITCH = [['a', 'a-recovery'], ['b', 'b-restore']], LOST = [['a', 'a-lost'], ['b', 'b-lost']];

export default {
  'R1-s1': ({ view, each, must, has, lacks }) => {
    each({ journey: 'identity', surface: PHONES }, (v, at) => must(!live(v.html, 'A48'), `A48 is live on a phone at ${JSON.stringify(at)}`));
    for (const [o, s] of LOST) for (const kind of PHONES) {
      const e = view('identity', o, s, kind, 'empty');
      for (const id of ['A49', 'A50', 'A59']) must(live(e.html, id), `${id} is not live on ${kind} in ${s} empty`);
      has(e.text, /Your Mac is lost/);
      has(e.text, /Revoke Mac, Safari/);
      has(e.text, /No record says how recovery ends/);
      has(e.text, /Proposed · CT-17/);
      must(live(view('identity', o, s, kind, 'error').html, 'A59'), `${s} error has no live resume on ${kind}`);
    }
    for (const [o, s] of LOST) for (const kind of ['iphone', 'ipad', 'pwa']) {
      const d = view('identity', o, s, kind, 'default');
      has(d.text, /If your Mac is the lost device/);
      must(live(d.html, 'A49') && /Revoke Mac, Safari/.test(d.text), `no way to revoke the Mac on ${kind}`);
      lacks(d.text.split('If your Mac is the lost device')[1], /Enrol a replacement passkey/);
    }
  },
  'R1-s2': ({ view, must, has, lacks }) => {
    for (const [o, s] of REPLAY) {
      for (const st of STATES.filter((x) => x !== 'error')) for (const kind of ALL) {
        const v = view('incidents', o, s, kind, st);
        for (const id of ['A13', 'A41']) must(!v.html.includes(`data-act="${id}"`), `${id} is drawn in ${s} ${st} ${kind}, with nothing awaiting you`);
        if (st !== 'loading') lacks(v.text, /Approve this replay|Approve reprocessing/);
      }
      has(view('incidents', o, s, 'web', 'empty').text, /Replayed/);
      has(view('incidents', o, s, 'web', 'expired').text, /Refused\. This approval ran out/);
      for (const kind of BIG) {
        const h = view('incidents', o, s, kind, 'error').html;
        must(live(h, 'A41') && live(h, 'A13'), `no approve on a request awaiting you, ${s} ${kind}`);
        for (const [word, id] of [['Payload', 'A41'], ['Expected config', 'A41'], ['Selected rows hash', 'A13'], ['Expected ledger', 'A13']]) must(h.indexOf(word) >= 0 && h.indexOf(word) < h.indexOf(`data-act="${id}"`), `${word} does not sit before ${id} in ${s} ${kind}`);
      }
      has(view('incidents', o, s, 'web', 'error').text, /It places no trade/);
    }
  },
  'R1-s3': ({ view, must, has }) => {
    for (const [o, s] of SWITCH) {
      for (const st of STATES) for (const kind of ALL) {
        const v = view('incidents', o, s, kind, st);
        if (st !== 'conflict') must(!v.html.includes('data-act="A42"'), `A42 is drawn in ${s} ${st} ${kind}`);
      }
      has(view('incidents', o, s, 'web', 'default').text, /Production is not lost, so there is nothing to switch/);
      has(view('incidents', o, s, 'web', 'expired').text, /no longer covers what is stored now, so it is no target/);
      for (const kind of BIG) {
        const v = view('incidents', o, s, kind, 'conflict');
        must(live(v.html, 'A42'), `no live switch in ${s} ${kind} with production lost`);
        has(v.text, /Production is recorded lost/);
        for (const re of [/rx_0007/, /As of\s*Sun 1 Nov/, /Gap/, /Payload/, /Ledger in the copy/]) has(v.text, re);
        must(v.html.indexOf('Payload') < v.html.indexOf('data-act="A42"'), `the binding does not sit before A42 in ${s}`);
      }
    }
  },
  'R1-s5': ({ view, must, has }) => {
    const said = (o) => option('incidents', o).covers.decide;
    for (const o of ['a', 'b']) {
      const s = said(o);
      must(!s.startsWith('n/a'), 'Incidents has something to approve or reject');
      must(live(view('incidents', o, s, 'web', 'error').html, 'A41') && live(view('incidents', o, s, 'web', 'error').html, 'A60'), `${s} cannot both approve and decline`);
      has(view('incidents', o, s, 'web', 'error').text, /Decline this replay/);
      has(view('incidents', o, s, 'web', 'error').text, /Decline reprocessing/);
      for (const [oo, sc] of SWITCH.filter((x) => x[0] === o)) { const v = view('incidents', oo, sc, 'web', 'conflict'); must(live(v.html, 'A60'), `${sc} cannot decline a switch`); has(v.text, /Decline this switch/); }
      has(view('incidents', o, s, 'web', 'error').text, /closes the request as declined/);
      const id = option('identity', o).covers.decide;
      must(id.startsWith('n/a: '), 'Identity draws no decline, so its decide cell must be n/a with its reason');
    }
  },
  'R1-s10': ({ view, each, has, lacks }) => {
    each({ journey: 'incidents', state: 'error' }, (v) => lacks(v.text, /Started\s*Tue 21:15/));
    has(view('incidents', 'a', 'a-evidence', 'web', 'error').text, /Failed at 21:14/);
    has(view('incidents', 'a', 'a-evidence', 'web', 'error').text, /Due\s*Tue 21:15/);
  },
  'R1-s11': ({ must }) => {
    for (const o of ['a', 'b']) { const c = option('incidents', o).covers.cost; must(/^n\/a: /.test(c) && /Costs and budgets/.test(c) && /Line by line/.test(c), `covers.cost does not hand over to Costs: ${c}`); }
  },
  'R1-s12': ({ view, each, has, lacks }) => {
    for (const [o, s] of [['a', 'a-link'], ['b', 'b-add']]) { const t = view('identity', o, s, 'web', 'conflict').text; lacks(t, /Refresh, then decide/); has(t, /refreshing will not change that/); }
    for (const [o, s] of LOST) { const t = view('identity', o, s, 'ipad', 'conflict').text; lacks(t, /Refresh, then decide/); has(t, /Use a path you can prove/); }
    for (const [o, s] of [...SWITCH, ['a', 'a-pause'], ['b', 'b-pause'], ...REPLAY]) lacks(view('incidents', o, s, 'web', 'conflict').text, /Refresh, then decide/);
    each({ journey: 'identity', option: 'b', screen: 'b-paths', state: 'conflict' }, (v) => lacks(v.text, /Refresh, then decide/));
  },
  'R1-s14': ({ view, must, has, lacks }) => {
    for (const [o, s] of LOST) for (const kind of ALL) {
      const v = view('identity', o, s, kind, 'denied');
      has(v.text, /Locked out/);
      has(v.text, /written procedure/);
      lacks(v.text, /Records current|Portfolio|Wed 4 Nov|Admin home/);
      must(!/class="jback"|aria-label="Tabs"/.test(v.html), `${s} ${kind} locked out still has app chrome`);
    }
  },
  'R1-s16': ({ view, must, has, lacks }) => {
    for (const kind of ALL) {
      const t = view('identity', 'a', 'a-paths', kind, 'default').text;
      has(t, /2 usable, 1 waiting on MP-179/);
      lacks(t, /3 healthy/);
      const row = t.slice(t.indexOf('Passkey, iPhone'), t.indexOf('Passkey, Mac', t.indexOf('Passkey, iPhone') + 20));
      must(/Waiting on MP-179/.test(row) && !/Healthy/.test(row), 'the iPhone row still reads healthy');
      lacks(view('identity', 'b', 'b-devices', kind, 'default').text, /3 healthy/);
    }
    has(view('identity', 'a', 'a-lost', 'iphone', 'default').note, /Privacy says a replacement lands on the new device/);
  },
  'R2-s1': ({ view, each, must, lacks }) => {
    const says = (v) => /Revoke iPhone/.test(v.text) && live(v.html, 'A49');
    for (const kind of ['web', 'ipad', 'pwa']) must(says(view('identity', 'a', 'a-devices', kind, 'default')), `no live Revoke iPhone on a-devices ${kind}`);
    for (const [o, s] of LOST) for (const kind of ['web', 'ipad', 'pwa']) must(says(view('identity', o, s, kind, 'empty')), `no live Revoke iPhone on ${s} empty ${kind}`);
    must(says(view('identity', 'a', 'a-lost', 'ipad', 'default')), 'an iPad cannot revoke a lost iPhone');
    must(/role="button"[^>]*aria-label="iPhone/.test(view('identity', 'b', 'b-devices', 'web', 'default').html), 'the iPhone row does not open on b-devices');
    each({ journey: 'identity', surface: 'iphone' }, (v) => lacks(v.text, /Revoke iPhone/));
    each({ journey: 'identity', state: 'default' }, (v) => lacks(`${v.text} ${v.note}`, /never the iPhone/));
  },
  'R2-s2': ({ view, each, has, lacks }) => {
    for (const [o, s] of [['a', 'a-evidence'], ['b', 'b-escalate']]) {
      const ok = STATES.filter((x) => !['error', 'loading'].includes(x));
      each({ journey: 'incidents', option: o, screen: s, state: ok }, (v, at) => { lacks(v.text, /Twelve Data/, `Twelve Data names the HSBC source at ${at.state}`); lacks(v.text, /job_3e9a|tr_51c2/); });
      has(view('incidents', o, s, 'web', 'default').text, /Run\s*run_8cf7 · UK · Tue 16:50/);
      has(view('incidents', o, s, 'web', 'default').text, /Yahoo · HSBA · XLON/);
      has(view('incidents', o, s, 'web', 'error').text, /run_8d02/);
      has(view('incidents', o, s, 'web', 'error').text, /Twelve Data/);
    }
    for (const [o, s] of [['a', 'a-detail'], ['b', 'b-escalate']]) has(view('incidents', o, s, 'web', 'empty').text, /back from Yahoo/);
    each({ journey: 'incidents' }, (v) => lacks(v.text, /back from Twelve Data/));
    for (const [o, s] of REPLAY) for (const st of STATES.filter((x) => x !== 'error')) lacks(view('incidents', o, s, 'web', st).text, /job_3e9a/);
  },
  'R2-s4': ({ view, has, lacks }) => {
    for (const kind of ALL) { has(view('incidents', 'a', 'a-evidence', kind, 'denied').text, /Audit\s*Permission denied, not empty\s*Denied/); lacks(view('incidents', 'a', 'a-evidence', kind, 'default').text, /Permission denied/); }
  },
  'R2-s5': ({ view, must, has }) => {
    for (const [o, s] of REPLAY) for (const kind of ALL) for (const st of STATES) {
      const t = view('incidents', o, s, kind, st).text;
      if (/Awaiting you/.test(t)) must(!/Nothing waits on you/.test(t), `${s} ${st} ${kind} awaits you and says nothing does`);
      if (/\bheld\b|Held/.test(t)) must(!/Not needed|Nothing waits on you/.test(t), `${s} ${st} ${kind} is held and says not needed`);
    }
    has(view('incidents', 'a', 'a-replay', 'web', 'denied').text, /Held until you sign in/);
    for (const st of ['denied', 'partial', 'stale', 'offline', 'expired']) must(!/aria-current="step"[^>]*>\s*<span class="n">3/.test(view('incidents', 'b', 'b-replay', 'web', st).html), `b-replay ${st} shows step 3 running`);
    must(/aria-current="step"[^>]*>\s*<span class="n">4/.test(view('incidents', 'b', 'b-replay', 'web', 'denied').html), 'b-replay denied does not stop at step 4');
  },
  'R2-s6': ({ view, each, has, lacks }) => {
    each({ journey: 'identity' }, (v) => lacks(`${v.text} ${v.note}`, /waits on your answer|until (MP-179|that) is answered|Until it is bought|until you join/));
    has(view('identity', 'a', 'a-path', 'web', 'default').text, /until the Developer Program is bought \(MP-179\)/);
    has(view('identity', 'a', 'a-paths', 'web', 'default').text, /until the Developer Program is bought \(MP-179\)/);
    has(view('identity', 'a', 'a-enrol', 'iphone', 'default').text, /until the Developer Program is bought \(MP-179\)/);
    has(view('identity', 'a', 'a-enrol', 'pwa', 'default').text, /until you answer/);
  },
  'R2-s10': ({ view, must, has }) => {
    for (const [o, s] of [['a', 'a-link'], ['b', 'b-add']]) {
      for (const st of ['default', 'empty', 'partial', 'error', 'expired']) { const v = view('identity', o, s, 'ipad', st); must(!live(v.html, 'A46'), `A46 is live on iPad in ${s} ${st}`); has(v.text, /Link Google from your Mac/); }
      must(live(view('identity', o, s, 'web', 'default').html, 'A46'), `A46 is not live on the Mac in ${s}`);
    }
  },
  'R2-s11': ({ view, each, has, lacks }) => {
    for (const [o, s] of [['a', 'a-detail'], ['b', 'b-escalate']]) {
      each({ journey: 'incidents', option: o, screen: s, surface: PHONES, state: 'expired' }, (v) => { lacks(v.text, /stay in the box/); has(v.text, /Resolving happens on iPad or desktop/); });
      has(view('incidents', o, s, 'web', 'expired').text, /stay in the box/);
    }
  },
  'R2-s13': ({ view, has, lacks }) => {
    const t = view('incidents', 'a', 'a-recovery', 'web', 'conflict').text;
    has(t, /the gap below/); has(t, /Separately, infrastructure drift/); lacks(t, /after\. Drift/);
  },
  'R2-s14': ({ view, each, has, lacks }) => {
    each({ journey: 'incidents', state: 'empty' }, (v) => lacks(v.text, /No exercise has finished/));
    for (const [o, s] of SWITCH) has(view('incidents', o, s, 'web', 'empty').text, /rx_0007, Sun 1 Nov, (stays|is still) the last pass/);
  },
  'R3-s1': ({ view, each, must, has, lacks }) => {
    each({ journey: 'identity' }, (v) => lacks(`${v.text} ${v.note}`, /touches no passkey/));
    const LINE = /What a revoke does to a passkey held on that device is not recorded\./;
    for (const kind of ALL) { const t = view('identity', 'a', 'a-devices', kind, 'default').text; has(t, LINE); has(t, /Proposed · CT-17/); }
    for (const kind of ['iphone', 'ipad', 'pwa']) has(view('identity', 'a', 'a-lost', kind, 'default').text, LINE);
    has(view('identity', 'b', 'b-revoke', 'web', 'default').text, LINE);
    has(view('identity', 'b', 'b-device', 'web', 'default').text, LINE);
    must(/What does a revoke do to a passkey/.test(readFileSync(page(), 'utf8')), 'the page lost the open question on what a revoke does to a passkey');
    must(/Revoke iPhone/.test(view('identity', 'a', 'a-devices', 'web', 'default').text), 'the iPhone stopped being revocable');
  },
  'R3-s2': ({ view, each, has, lacks }) => {
    for (const [o, s] of [['a', 'a-evidence'], ['b', 'b-escalate']]) {
      const t = view('incidents', o, s, 'web', 'default').text;
      has(t, /run_8bf3/); has(t, /HSBC\s*Priced to the 16:35 close/); has(t, /HSBC\s*Late · last price 14:10/);
      each({ journey: 'incidents', option: o, screen: s, state: STATES.filter((x) => x !== 'error') }, (v) => lacks(v.text, /7 of 7|run_8d02 ·/));
    }
    has(view('incidents', 'a', 'a-evidence', 'web', 'default').note, /the change is a row/);
  },
  'R3-s3': ({ view, has, lacks }) => {
    for (const [o, s] of [['a', 'a-evidence'], ['b', 'b-escalate']]) {
      const t = view('incidents', o, s, 'web', 'partial').text;
      has(t, /run_8cf7 · UK · not read/); has(t, /Result\s*Unknown/); has(t, /HSBC\s*Not read/); lacks(t, /Late · last price 14:10/);
    }
    has(view('incidents', 'a', 'a-list', 'web', 'partial').text, /The UK run record did not answer/);
    lacks(view('incidents', 'a', 'a-list', 'web', 'partial').text, /Runs, sources and alerts answered/);
    for (const [o, s] of [['a', 'a-list'], ['b', 'b-runbook']]) { const t = view('incidents', o, s, 'web', 'conflict').text; has(t, /reconcile_required, counted as neither/); lacks(t, /run_8d02 · succeeded/); lacks(view('incidents', o, s, 'web', 'partial').text, /job link unavailable/i); }
  },
  'R3-s4': ({ each, must }) => {
    each({ journey: 'incidents', state: 'expired' }, (v, at) => must(!/are back|access expired|No new HSBC price/.test(v.text), `Expired tells two stories at ${at.screen}`));
  },
  'R3-s5': ({ view, each, must, has, lacks }) => {
    for (const [o, s] of [['a', 'a-list'], ['b', 'b-runbook']]) for (const kind of ALL) { const t = view('incidents', o, s, kind, 'conflict').text; has(t, /Production recorded lost/); has(t, /inc_0014/); has(t, /Proposed · CT-14/); }
    has(view('incidents', 'a', 'a-list', 'web', 'conflict').text, /Not classed\s*1 open · inc_0014/);
    for (const [o, s] of [['a', 'a-list'], ['b', 'b-runbook']]) has(view('incidents', o, s, 'web', 'conflict').text, /Production\s*Recorded lost · inc_0014/);
    has(view('incidents', 'b', 'b-runbook', 'web', 'conflict').text, /Production is also recorded lost/);
    must(live(view('incidents', 'a', 'a-recovery', 'web', 'conflict').html, 'A42'), 'the switch left the state production is lost');
    each({ journey: 'incidents', state: STATES.filter((x) => x !== 'conflict') }, (v) => lacks(v.text, /inc_0014/));
  },
  'R3-s7': ({ view, must, has, perms }) => {
    must(/^Mac only/.test(perms.actions.find((p) => p.id === 'A46').phone_note), 'A46 has no Mac note');
    for (const [o, s] of [['a', 'a-link'], ['b', 'b-add']]) {
      for (const kind of PHONES) has(view('identity', o, s, kind, 'default').text, /Link Google: on your Mac/);
      has(view('identity', o, s, 'ipad', 'default').text, /Link Google from your Mac/);
    }
  },
  'R3-s10': ({ view, each, has, lacks }) => {
    each({ journey: 'identity' }, (v) => lacks(v.text, /if the lost one held a passkey/));
    for (const [o, s] of LOST) for (const kind of ALL) has(view('identity', o, s, kind, 'default').text, /On a device you control\. Each step is on your audit trail/);
  },
  'R3-s11': ({ view, has, lacks }) => {
    for (const s of ['b-device', 'b-revoke']) { const v = view('identity', 'b', s, 'ipad', 'expired'); has(v.text, /Phone web/); lacks(v.text, /iPhone[\s\S]{0,40}Expired/); }
    has(view('identity', 'a', 'a-lost', 'ipad', 'default').text, /Revoke iPhone/);
  },
  'R3-s12': ({ view, must }) => {
    for (const [o, s] of [['a', 'a-devices'], ['b', 'b-devices']]) for (const kind of ['ipad', 'web', 'pwa']) { const t = view('identity', o, s, kind, 'default').text; const row = t.slice(t.indexOf('iPhone Active'), t.indexOf('iPhone Active') + 140); must(/Waiting on MP-179/.test(row), `the iPhone row on ${s} ${kind} has no MP-179 label`); }
  },
  'R3-s15': ({ view, has }) => {
    const n = view('identity', 'a', 'a-enrol', 'web', 'default').note;
    has(n, /iPhone and iPad say why not until the Developer Program is bought \(MP-179\), with CT-17 and PL-09 still open/);
    has(n, /until you answer whether a browser passkey counts/);
  },
  'R3-s16': ({ view, must, lacks }) => {
    for (const [o, s] of REPLAY) for (const st of STATES.filter((x) => !['error', 'loading'].includes(x))) lacks(view('incidents', o, s, 'web', st).text, /inc_0012 · missed collection/);
    for (const o of ['a', 'b']) must(/Twelve Data listing spends credits/.test(option('incidents', o).covers.cost) && /Yahoo listing spends none/.test(option('incidents', o).covers.cost), 'covers.cost lost the split between listings');
  },
  'R4-s1': ({ view, must, has, lacks }) => {
    for (const [o, s] of [['a', 'a-detail'], ['b', 'b-escalate']]) {
      for (const kind of ALL) {
        const v = view('incidents', o, s, kind, 'conflict');
        has(v.text, /Production recorded lost[\s\S]*Incident\s*inc_0014\s*Class\s*Not classed/);
        has(v.text, /Proposed · CT-14/);
        must(live(v.html, 'A40'), `no live acknowledge for inc_0014 on ${s} ${kind}`);
        has(v.text, /Switch in Recovery/);
        has(v.text, /inc_0012/);
        has(v.text, /Reopened/);
      }
      for (const kind of BIG) { const v = view('incidents', o, s, kind, 'conflict'); must(live(v.html, 'A75'), `no live resolve for inc_0014 on ${s} ${kind}`); has(v.text, /closes only with a recorded resolution/); must(/textarea/.test(v.html), 'no recorded resolution box'); }
      for (const kind of PHONES) must(!/textarea/.test(view('incidents', o, s, kind, 'conflict').html), `a text box on a phone, ${s}`);
    }
    has(view('incidents', 'a', 'a-detail', 'web', 'conflict').text, /Evidence for inc_0012/);
    for (const st of STATES.filter((x) => x !== 'conflict')) lacks(view('incidents', 'a', 'a-detail', 'web', st).text, /inc_0014/);
  },
  'R4-s2': ({ view, journeys, must, has, lacks }) => {
    for (const s of ['a-list', 'a-evidence']) has(view('incidents', 'a', s, 'web', 'partial').text, /The UK run record did not answer/);
    const status = { conflict: 'Reopened', default: 'Acknowledged' };
    has(view('incidents', 'a', 'a-list', 'web', 'conflict').text, /HSBC price late[\s\S]*Reopened/);
    has(view('incidents', 'a', 'a-list', 'web', 'default').text, /HSBC price late[\s\S]*Acknowledged/);
    if (!journeys().includes('runs')) return;
    for (const [st, word] of Object.entries(status)) for (const s of ['a-clock', 'a-recover']) { const t = view('runs', 'a', s, 'web', st).text; if (/inc_0012/.test(t)) must(new RegExp(`inc_0012[\\s\\S]{0,120}${word}`).test(t), `Runs ${s} ${st} does not read ${word} for inc_0012`); }
    has(view('runs', 'a', 'a-recover', 'web', 'partial').text, /UK run record did not/);
    lacks(view('runs', 'a', 'a-recover', 'web', 'conflict').text, /Disagreement/);
  },
  'R4-s4': ({ view, each, must, has }) => {
    const LINE = /What a revoke does to a passkey held on that device is not recorded\./;
    each({ journey: 'identity' }, (v, at) => { if (live(v.html, 'A49')) must(LINE.test(v.text), `live A49 with no sentence at ${JSON.stringify(at)}`); });
    for (const [o, s] of LOST) for (const kind of ALL) for (const st of STATES.filter((x) => !['loading', 'denied'].includes(x))) has(view('identity', o, s, kind, st).text, LINE);
    for (const kind of ALL) has(view('identity', 'b', 'b-devices', kind, 'error').text, LINE);
  },
  'R4-s6': ({ view, each, must, has, lacks }) => {
    const NOTE = /Whether a late price counts as a missed collection is open/;
    for (const [o, s] of REPLAY) for (const kind of ALL) for (const st of STATES.filter((x) => !['error', 'loading'].includes(x))) { const t = view('incidents', o, s, kind, st).text; has(t, NOTE); has(t, /Proposed · CT-14/); }
    each({ journey: 'incidents' }, (v, at) => { if (at.state !== 'error') lacks(v.text, /Not needed, inside the allowlist|is inside the allowlist/); lacks(v.text, /Auto-retrying/); });
    for (const [o, s] of REPLAY) { has(view('incidents', o, s, 'web', 'default').text, /Not needed if a late price counts as a missed collection/); }
    has(view('incidents', 'a', 'a-replay', 'web', 'default').text, /Nothing waits on you if CT-14 says so/);
    has(view('incidents', 'a', 'a-detail', 'web', 'default').text, /if a late price counts as a missed collection/);
    has(view('incidents', 'b', 'b-escalate', 'web', 'default').text, /if a late price counts as a missed collection/);
    has(view('incidents', 'b', 'b-replay', 'web', 'default').text, /Inside the allowlist only if a late price counts as a missed collection/);
  },
  'R4-s10': ({ view, has }) => { const t = view('incidents', 'a', 'a-evidence', 'web', 'partial').text; has(t, /Trace\s*Not read, it links from run_8cf7/); has(t, /its trace are not read/); },
  'R5-s3': ({ view, each, has, lacks }) => {
    for (const [o, s] of LOST) {
      each({ journey: 'identity', option: o, screen: s, surface: 'pwa' }, (v) => lacks(v.text, /Developer Program is bought|MP-179/));
      has(view('identity', o, s, 'pwa', 'empty').text, /No record says how recovery ends on this device until you answer whether a browser passkey counts\./);
      has(view('identity', o, s, 'pwa', 'default').text, /until you answer whether a browser passkey counts/);
      for (const kind of ['iphone', 'ipad']) has(view('identity', o, s, kind, 'empty').text, /ends on this device until the Developer Program is bought \(MP-179\)/);
    }
  },
  'R5-s4': ({ view, must, has, lacks }) => {
    has(view('incidents', 'a', 'a-replay', 'web', 'default').text, /Auto-retry if CT-14 allows/);
    has(view('incidents', 'a', 'a-detail', 'web', 'default').text, /Replay\s*Auto-retry if CT-14 allows/);
    for (const [o, s] of REPLAY) { const t = view('incidents', o, s, 'web', 'empty').text; has(t, /Your approval\s*None asked\. Drawn as if CT-14 counts this/); has(t, /Proposed · CT-14/); lacks(t, /Not needed if/); }
    has(view('incidents', 'b', 'b-runbook', 'web', 'default').text, /step 3 of 5, Auto-retry if CT-14 allows/);
    has(view('incidents', 'b', 'b-escalate', 'web', 'default').text, /Replay\s*Auto-retry if CT-14 allows/);
    has(view('incidents', 'b', 'b-escalate', 'web', 'conflict').text, /Replay\s*Refused/);
    must(!/code is recovering/.test(view('incidents', 'b', 'b-runbook', 'web', 'default').text), 'the runbook still states recovery as a fact');
  },
  'R5-s5': ({ view, each, has, lacks }) => {
    each({ journey: 'incidents', option: 'a', screen: 'a-evidence', state: 'partial' }, (v) => {
      has(v.text, /run_8cf7, its collect job and its trace are not read, and neither is Monday's run_8bf3, which is unknown, not clear\. The alert, the source and the model link opened\./);
      has(v.text, /Result\s*Unknown/);
      lacks(v.text, /The other links opened/);
    });
    has(view('incidents', 'b', 'b-escalate', 'web', 'default').text, /run_8bf3/);
  },
};
