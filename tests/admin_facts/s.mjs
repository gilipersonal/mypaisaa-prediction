// Lane s, MP-64 round 1: Incidents and Identity. Each check tests what its fix does, on every device and state it applies to.
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
      if (/\bheld\b|Held/.test(t)) must(!/Not needed, inside the allowlist|Nothing waits on you/.test(t), `${s} ${st} ${kind} is held and says not needed`);
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
};
