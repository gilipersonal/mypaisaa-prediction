// MP-64 round 1, lane f: Admin home, Files and imports, Audit. Each check tests what its fix does, in the states and devices it applies to.
const WIDE = ['ipad', 'web'], PHONES = ['iphone', 'pwa'], ALL = ['iphone', 'ipad', 'web', 'pwa'];
const STATES = ['default', 'loading', 'empty', 'partial', 'error', 'stale', 'offline', 'conflict', 'expired', 'denied'];
const STEPS = /Risk[\s\S]*Forecast[\s\S]*Action[\s\S]*Outcome[\s\S]*Audit/;
const KINDS = ['event_lineage', 'recorded_changes', 'economic_history', 'commit_completeness', 'outbox_delivery', 'source_orphans', 'metric_inputs', 'supersession', 'export_access'];
const acted = (v, id) => new RegExp(`data-act="${id}"`).test(v.html);
const selected = (v) => { const m = v.html.match(/class="hrow sel"[\s\S]*?class="nm"[^>]*>([^<]*)/); return m ? m[1] : ''; };
const tile = (v, name) => { const m = v.html.match(new RegExp(`aria-label="${name}\\. [^"]*"[\\s\\S]*?<\\/div>`)); return m ? m[0] : ''; };

export default {
  'R1-f1': ({ view, must, has }) => {
    for (const s of ['b-lineage', 'b-explore']) for (const st of STATES.filter((x) => !['loading', 'empty'].includes(x))) has(view('audit', 'b', s, 'web', st).text, STEPS, `${s} ${st}: the trail stops short`);
    has(view('audit', 'b', 'b-lineage', 'iphone', 'default').text, /Not scored: its horizon has not passed/);
    must(!/>None</.test(view('audit', 'b', 'b-lineage', 'web', 'default').html.match(/Outcome[\s\S]*?<\/li>/)[0]), 'Outcome reads None on a committed record');
  },
  'R1-f2': ({ view, must, lacks }) => {
    for (const [s, st, id] of [['a-approve', 'error', 'A52'], ['a-approve', 'stale', 'A53'], ['a-approve', 'conflict', 'A53'], ['a-fix', 'error', 'A52'], ['a-fix', 'stale', 'A53'], ['a-keep', 'error', 'A54']]) {
      must(acted(view('files', 'a', s, 'web', st), id), `${s} ${st}: no ${id}`);
      must(/data-phone-off/.test(view('files', 'a', s, 'iphone', st).html), `${s} ${st}: live on a phone`);
    }
    for (const k of PHONES) lacks(view('files', 'a', 'a-approve', k, 'denied').text, /Sign in again/);
  },
  'R1-f3': ({ view, must, has }) => {
    must(acted(view('files', 'a', 'a-fix', 'web', 'default'), 'A55'), 'a-fix has no resolve');
    must(acted(view('files', 'a', 'a-draft', 'web', 'default'), 'A56'), 'a-draft has no row edits');
    must(acted(view('files', 'a', 'a-draft', 'web', 'conflict'), 'A55'), 'the difference has no way to stay open');
    must(acted(view('files', 'b', 'b-decide', 'web', 'default'), 'A56'), 'b-decide has no row edits');
    has(view('files', 'a', 'a-fix', 'web', 'empty').text, /Resolved by you, with your reason/);
    has(view('files', 'a', 'a-fix', 'web', 'default').text, /records your reason and its source/);
  },
  'R1-f4': ({ each, has }) => {
    each({ journey: 'audit', option: 'b', screen: 'b-filter', surface: ['iphone', 'web'] }, (v, at) => { for (const k of KINDS) has(v.text, new RegExp(k), `${JSON.stringify(at)}: no ${k}`); });
  },
  'R1-f5': ({ each, has }) => {
    each({ journey: 'audit', option: 'b', screen: 'b-explore', surface: ALL, state: STATES.filter((x) => x !== 'empty') }, (v) => { for (const t of [/Gaps and integrity/, /Before and after/, /Open full lineage/]) has(v.text, t); });
  },
  'R1-f6': ({ view, must, has }) => {
    for (const st of STATES.filter((x) => !['loading', 'empty'].includes(x))) {
      const v = view('audit', 'b', 'b-explore', 'web', st), mine = /Lineage of R-0210/.test(v.text);
      must(mine ? /R-0210/.test(selected(v)) : /expired/i.test(selected(v)), `${st}: "${selected(v)}" is selected beside another record's lineage`);
    }
    has(view('audit', 'b', 'b-explore', 'web', 'expired').text, /Lineage of this expired approval/);
  },
  'R1-f7': ({ view, must, has, lacks }) => {
    const err = view('audit', 'b', 'b-lineage', 'web', 'error');
    has(err.text, /28 Oct to 30 Oct/); has(err.text, /INTEGRITY_INCOMPLETE/); has(err.html, /Try again/); lacks(err.text, /\bresolved\b/); lacks(err.html, />None<\/span>|>Not yet<\/span>/);
    const exp = view('audit', 'b', 'b-lineage', 'web', 'expired').text;
    lacks(exp, /R-0210|as you approved them|src_1e08/); has(exp, /No commit started/);
    const ready = view('audit', 'b', 'b-lineage', 'web', 'default').html;
    for (const st of ['partial', 'stale', 'offline', 'conflict', 'expired', 'denied']) { const h = view('audit', 'b', 'b-lineage', 'web', st).html; must(/jbanner/.test(h) && !/jbanner/.test(ready), `${st}: no reason on the screen`); }
  },
  'R1-f8': ({ view, must, lacks }) => {
    for (const k of ALL) {
      const v = view('home', 'b', 'b-home', k, 'empty');
      lacks(v.text, /4 decisions|1 draft waiting|R2-HGB v4 waits|1 not resolved|1 open/);
      must((v.html.match(/ahome-tile/g) || []).length === 9, 'Empty changes the shape');
    }
  },
  'R1-f9': ({ view, has, lacks }) => {
    const v = (st) => view('home', 'b', 'b-home', 'web', st).text;
    has(v('loading'), /Checking what waits on you/);
    has(v('partial'), /Not read: billing did not answer/); lacks(v('partial'), /What is missing is named/);
    has(v('error'), /Could not check what waits/); has(v('error'), /Settings v9 · catalogue v14 · from 11:20/);
    has(v('stale'), /each rechecks itself when opened/); has(v('stale'), /· from 11:12/);
    has(v('offline'), /No financial write offline/);
    has(v('conflict'), /Settings v10 was written at 09:01/); lacks(v('conflict'), /Admin changed while you were reading/);
    has(v('expired'), /Watch Barclays/); lacks(v('expired'), /passed its time/);
  },
  'R1-f10': ({ view, must, has }) => {
    for (const k of PHONES) {
      const v = view('home', 'b', 'b-home', k, 'default');
      must(v.html.indexOf('jbanner') >= 0 && v.html.indexOf('jbanner') < v.html.indexOf('ahome-grid'), `${k}: the banner is below the tiles`);
      has(v.text, /1 incident not resolved/);
    }
    must(/--warn/.test(tile(view('home', 'b', 'b-home', 'iphone', 'default'), 'Incidents and recovery')), 'the Incidents tile is not marked');
    must(!/--warn/.test(tile(view('home', 'b', 'b-home', 'iphone', 'empty'), 'Incidents and recovery')), 'marked with nothing open');
  },
  'R1-f11': ({ view, must, has, lacks }) => {
    for (const [o, s] of [['a', 'a-fix'], ['b', 'b-after']]) {
      const v = view('files', o, s, 'web', 'conflict');
      must(acted(v, 'A11'), 'no combined approval'); has(v.text, /Approve both together/); has(v.text, /The sale on 2 Nov/); lacks(v.text, /Approve this correction/);
    }
  },
  'R1-f12': ({ view, each, must, has }) => {
    each({ journey: 'files', surface: WIDE }, (v, at) => must(!acted(v, 'A07'), `${JSON.stringify(at)}: A07 while groups are unsettled`));
    for (const st of ['default', 'partial', 'conflict', 'expired', 'denied']) must(acted(view('files', 'a', 'a-draft', 'web', st), 'A08'), `a-draft ${st}: no A08`);
    must(acted(view('files', 'a', 'a-approve', 'web', 'expired'), 'A08'), 'a-approve expired: no A08');
    has(view('files', 'a', 'a-draft', 'web', 'partial').text, /Approve these 2 groups/);
  },
  'R1-f13': ({ view, has }) => {
    const t = /A £12\.40 cash difference stays open/;
    has(view('files', 'a', 'a-draft', 'web', 'default').text, t);
    for (const k of ALL) has(view('files', 'a', 'a-approve', k, 'default').text, t);
    has(view('files', 'b', 'b-decide', 'web', 'default').text, t);
    has(view('files', 'a', 'a-draft', 'web', 'conflict').text, /Keep it open, with a reason/);
    has(view('files', 'a', 'a-draft', 'web', 'conflict').text, /Find the row/);
  },
  'R1-f14': ({ view, each, has, lacks }) => {
    for (const [o, s] of [['a', 'a-keep'], ['b', 'b-files']]) { const t = view('files', o, s, 'web', 'default').text; has(t, /ISA statement, September/); has(t, /Apple screenshot/); }
    has(view('files', 'a', 'a-queue', 'web', 'default').text, /8 originals kept/);
    has(view('home', 'b', 'b-home', 'web', 'default').text, /8 originals kept/);
    each({ journey: 'files', surface: 'web' }, (v) => lacks(v.text, /\b6 originals\b/));
  },
  'R1-f15': ({ each, must, has }) => {
    let n = 0;
    each({ journey: 'files', option: 'a', screen: 'a-keep', surface: ['iphone', 'web'] }, (v) => { if (/8 originals/.test(v.text)) { n++; has(v.text, /Deleted, with tombstone/); has(v.text, /tomb_61a4/); has(v.text, /evidence unavailable/); } });
    must(n >= 6, `only ${n} states list originals`);
  },
  'R1-f16': ({ view, has }) => {
    has(view('files', 'a', 'a-draft', 'web', 'default').html, /<button[^>]*>[\s\S]{0,400}Open in Costs and budgets/);
    has(view('files', 'b', 'b-life', 'web', 'default').text, /Open in Costs and budgets/);
  },
  'R1-s7-home': ({ each, has, lacks }) => {
    each({ journey: 'home', surface: ALL }, (v) => { has(v.text, /account recovery works anywhere/); lacks(v.text.replace(/account recovery/g, '').replace(/Incidents and recovery/g, ''), /\brecovery\b/); });
  },
  'R1-s21': ({ view, must }) => {
    for (const st of ['default', 'stale']) { const t = tile(view('home', 'b', 'b-home', 'web', st), 'Incidents and recovery'); must(/1 not resolved/.test(t) && !/1 open/.test(t), `${st}: ${t.slice(0, 80)}`); }
  },
};
