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
    has(v('expired'), /Taiwan Semiconductor expired at 18:00/); lacks(v('expired'), /passed its time/);
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
  'R2-f1': ({ each, view, must, has }) => {
    each({ journey: 'files', surface: WIDE }, (v, at) => must(acted(v, 'A05') === acted(v, 'A77'), `${JSON.stringify(at)}: the duplicate and the transfer are not both settled here`));
    const t = view('files', 'a', 'a-draft', 'web', 'default');
    has(t.text, /From outside/); has(t.text, /From General/);
    must(!acted(view('files', 'a', 'a-draft', 'web', 'offline'), 'A77'), 'A77 while offline');
  },
  'R2-f2': ({ each, must }) => {
    each({ journey: 'files', surface: ALL }, (v, at) => {
      must(!(/Approve these 2 groups/.test(v.text) && /3 selected/.test(v.text)), `${JSON.stringify(at)}: 3 selected above an approval of 2`);
      must(!(/Approve these 3 groups/.test(v.text) && /2 selected/.test(v.text)), `${JSON.stringify(at)}: 2 selected above an approval of 3`);
    });
  },
  'R2-f3': ({ each, must }) => {
    let n = 0;
    each({ journey: 'files', surface: ALL }, (v, at) => { if (/Approve these 3 groups/.test(v.text)) { n++; must(/£12\.40/.test(v.text), `${JSON.stringify(at)}: approves with no word of the £12.40`); } });
    must(n > 20, `only ${n} views approve 3 groups`);
  },
  'R2-f4': ({ view, has, lacks }) => {
    for (const [o, s] of [['b', 'b-compare'], ['b', 'b-record'], ['a', 'a-record']]) for (const k of ['iphone', 'web']) {
      const t = view('audit', o, s, k, 'expired').text;
      lacks(t, /R-0210|ref_a3c0|ref_a3c1|Ledger revision 21[01]\b|aud_4c17|apr_52be|evt_77d3/, `${o}.${s} ${k}: another record's rows`);
      has(t, /Ledger revision 213/);
    }
  },
  'R2-f5': ({ each, view, has, lacks }) => {
    each({ journey: 'audit', surface: ['iphone', 'web'], state: 'stale' }, (v, at) => {
      lacks(v.text, /may not show yet|say nothing about anything newer/, JSON.stringify(at));
      if (at.screen !== 'b-filter') has(v.text, /complete to ledger revision 213/, `${JSON.stringify(at)}: no contract wording`);
    });
    has(view('audit', 'b', 'b-explore', 'web', 'stale').text, /Export link issued/);
    lacks(view('audit', 'b', 'b-lineage', 'web', 'stale').text, / stale /);
  },
  'R2-f6': ({ view, has, lacks }) => {
    for (const k of ALL) { const t = view('home', 'b', 'b-home', k, 'expired').text; has(t, /3 decisions wait on you/); has(t, /Taiwan Semiconductor expired at 18:00/); lacks(t, /Watch Barclays|4 decisions/); }
  },
  'R2-f7': ({ view, must, has }) => {
    for (const k of PHONES) for (const st of ['default', 'partial', 'stale', 'offline', 'conflict', 'expired', 'denied']) {
      const h = view('home', 'b', 'b-home', k, st).html, top = h.slice(h.indexOf('jbanner'), h.indexOf('ahome-grid'));
      must(h.indexOf('jbanner') >= 0 && h.indexOf('jbanner') < h.indexOf('ahome-grid'), `${k} ${st}: banner below the tiles`);
      has(top, /\d incidents? not resolved/, `${k} ${st}: the first view drops the incident`);
      has(top, /\d decisions wait on you/, `${k} ${st}: the first view drops the count`);
    }
  },
  'R2-f8': ({ view, must, has, lacks }) => {
    const pence = (s) => Math.round(parseFloat(s.replace(/[£,]/g, '')) * 100);
    for (const [o, sc] of [['a', 'a-fix'], ['b', 'b-after']]) {
      const v = view('files', o, sc, 'web', 'conflict');
      lacks(v.text, /combined preview/);
      const box = v.html.slice(v.html.indexOf('Both together'));
      must(box.indexOf('Sold 4 Apple') >= 0 && box.indexOf('After both') > 0 && box.indexOf('data-act="A11"') > box.indexOf('After both'), 'the approval is not beside its rows');
      has(box, /Illustrative/);
      const m = v.text.match(/Cash \+(£[\d,.]+).*ISA cash (£[\d,.]+) → (£[\d,.]+)/);
      must(m, 'no cash figures');
      must(pence(m[2]) === pence('£4,142.83') + pence(m[1]), 'the before does not foot');
      must(pence(m[3]) === pence(m[2]) - (pence('£4,142.83') - pence('£4,012.60')), 'the after does not foot');
    }
  },
  'R2-m10-home': ({ view, has }) => {
    for (const [o, s] of [['a', 'a-home'], ['b', 'b-home']]) for (const k of ALL) { const t = view('home', o, s, k, 'default').text; has(t, /4 decisions wait on you/); has(t, /1 paused scope waits on your restart/); }
  },
  'R3-f1': ({ view, each, must, has }) => {
    each({ journey: 'files', surface: WIDE }, (v, at) => {
      if (/isa-2019-to-2026\.pdf/.test(v.text) && !['offline', 'error'].includes(at.state)) must(acted(v, 'A81') && acted(v, 'A82'), `${JSON.stringify(at)}: held, and nothing can decide it`);
      if (at.state === 'offline') must(!acted(v, 'A81') && !acted(v, 'A82'), `${JSON.stringify(at)}: live offline`);
    });
    has(view('files', 'a', 'a-queue', 'web', 'default').text, /3 files not taken in/);
    has(view('files', 'a', 'a-queue', 'web', 'default').text, /Discard/);
  },
  'R3-f2': ({ each, must, lacks }) => {
    const minutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    for (const journey of ['audit', 'files']) each({ journey, surface: 'web', state: ['stale', 'offline', 'error'] }, (v, at) => {
      const read = minutes(at.state === 'stale' ? '11:12' : '11:20');
      for (const m of v.text.matchAll(/Wed (\d\d:\d\d)/g)) must(minutes(m[1]) <= read, `${JSON.stringify(at)}: a record from ${m[1]} in a list read earlier`);
      lacks(v.text, /link valid 42 min/);
    });
  },
  'R3-f3': ({ view, must, has, lacks }) => {
    const fields = (st) => [...view('audit', 'b', 'b-record', 'web', st).html.matchAll(/<dt>([^<]*)<\/dt>/g)].map((m) => m[1]).filter((x) => !['Sampling', 'Kept for', 'Paging'].includes(x)).join('|');
    must(fields('default') === fields('expired'), `fields differ: ${fields('expired')}`);
    const t = view('audit', 'b', 'b-record', 'web', 'expired').text;
    has(t, /apr_6c03/); has(t, /src_2f7b/); has(t, /You, Writer or Nobody/); lacks(t, /Approved 21:18 ·/);
    has(view('audit', 'b', 'b-explore', 'web', 'expired').text, /aud_5b19/);
  },
  'R3-f4': ({ view, has, lacks }) => {
    const t = view('audit', 'b', 'b-compare', 'web', 'expired').text;
    has(t, /ref_b7e2/); lacks(t, /ref_a3c0/);
    lacks(view('audit', 'b', 'b-compare', 'web', 'empty').text, /An expiry/);
  },
  'R3-f5': ({ view, has, lacks }) => {
    const t = view('audit', 'b', 'b-compare', 'web', 'expired').text;
    has(t, /nothing reached your ledger/); lacks(t, /at your broker/);
  },
  'R3-f6': ({ view, must, lacks }) => {
    for (const [o, s] of [['a', 'a-gaps'], ['b', 'b-gaps']]) {
      const t = view('audit', o, s, 'web', 'error').text;
      must((t.match(/From 11:20, not vouched for/g) || []).length === 3, `${s}: commits, delivery or restore read bare`);
      lacks(t, /commit_completeness|outbox_delivery/);
    }
  },
  'R3-f7': ({ view, has, lacks }) => {
    for (const [o, s] of [['a', 'a-home'], ['b', 'b-home']]) { has(view('home', o, s, 'web', 'expired').text, /Records current · 18:05/); lacks(view('home', o, s, 'web', 'expired').note, /11:40/); }
  },
  'R3-f8': ({ view, has }) => {
    has(view('audit', 'b', 'b-explore', 'web', 'expired').text, /Watch Taiwan Semiconductor/);
    has(view('audit', 'a', 'a-who', 'web', 'expired').text, /Watch Taiwan Semiconductor/);
    has(view('audit', 'b', 'b-explore', 'web', 'expired').text, /Records current · 18:05/);
  },
  'R3-f9': ({ view, must, has }) => {
    const v = view('files', 'a', 'a-draft', 'web', 'partial');
    must(acted(v, 'A56'), 'the blank date cannot be filled'); has(v.text, /Add the date/);
    for (const t of [/£4,012\.60 → £3,070\.82/, /b41d…9e07/, /Commit 2 groups, 6 of 11 rows/, /Left out and still listed: Sold 10 AstraZeneca/]) has(v.text, t);
    must(v.text.indexOf('£3,070.82') < v.text.indexOf('Approve these 2 groups'), 'the approval sits above what it binds');
  },
  'R3-f10': ({ view, must, has, lacks }) => {
    for (const [o, s] of [['a', 'a-fix'], ['b', 'b-after']]) {
      const v = view('files', o, s, 'web', 'conflict');
      for (const t of [/Expected revision 215/, /Payload hash/, /15 minutes after approval/, /Reverse: Sold 4 Apple/, /Replace: Sold 4 Apple/]) has(v.text, t);
      lacks(v.text, /all it binds/); has(v.note, /revision 215/);
      must(v.html.indexOf('Illustrative', v.html.indexOf('This approval binds')) > 0, 'the binds are not marked');
    }
  },
  'R3-m7': ({ view, journeys, has, lacks }) => {
    for (const [o, s] of [['a', 'a-home'], ['b', 'b-home']]) {
      const e = view('home', o, s, 'web', 'error').text, c = view('home', o, s, 'web', 'conflict').text;
      has(e, /US run Tue · failed · from 11:20/); lacks(e, /succeeded/); has(e, /R2-HGB v4 incomplete/); lacks(e, /R2-HGB v4 waits/); has(e, /Query incomplete/);
      has(c, /US run Tue · held/); lacks(c, /succeeded/); has(c, /2 not resolved/); has(e, /2 not resolved/); if (o === 'a') has(e, /Mon 21:15 · cutoff 21:00, last good/);
    }
    if (journeys().includes('runs')) { has(view('runs', 'a', 'a-clock', 'web', 'error').text, /run_8d02/); lacks(view('runs', 'a', 'a-clock', 'web', 'error').text, /succeeded/, 'Runs says otherwise'); }
  },
  'R3-f11': ({ view, has }) => {
    const t = view('files', 'a', 'a-queue', 'web', 'error').text;
    for (const r of [/Unmatched object/, /Open work/, /Kept/]) has(t, r);
  },
  'R3-f12': ({ view, has }) => {
    has(view('files', 'a', 'a-draft', 'web', 'default').text, /deciding a duplicate or a transfer/);
    has(view('files', 'a', 'a-draft', 'web', 'default').text, /your answer makes a new draft revision/);
  },
  'R3-f15': ({ view, has }) => { has(view('home', 'b', 'b-home', 'web', 'empty').text, /Settings v10 · catalogue v15/); },
  'R3-f16': ({ view, has, lacks }) => {
    const e = view('home', 'a', 'a-home', 'web', 'expired').text;
    has(e, /3 decisions wait on you/); lacks(e, /4 decisions|Next: Taiwan Semiconductor/);
    has(view('home', 'a', 'a-home', 'web', 'conflict').text, /3 decisions wait on you/);
  },
  'R4-f1': ({ view, must, has, lacks }) => {
    for (const k of ALL) {
      const v = view('home', 'b', 'b-home', k, 'conflict');
      has(tile(v, 'Incidents and recovery'), /production recorded lost/);
      lacks(tile(v, 'Incidents and recovery'), /last restore passed/);
      has(v.html, /Production is recorded lost/); has(v.text, /Proposed · CT-14/);
    }
    for (const k of PHONES) { const h = view('home', 'b', 'b-home', k, 'conflict').html; must(h.indexOf('Production is recorded lost') < h.indexOf('ahome-grid'), `${k}: below the first view`); }
    lacks(view('home', 'b', 'b-home', 'web', 'default').text, /recorded lost/);
  },
  'R4-f2': ({ view, each, has, lacks }) => {
    const t = view('files', 'a', 'a-queue', 'web', 'partial').text;
    has(t, /2 files refused at the door/); lacks(t, /3 files not taken in|1 more is held apart/);
    each({ journey: 'files', option: 'a', screen: 'a-queue', surface: 'web', state: ['default', 'stale', 'offline', 'conflict', 'expired', 'denied'] }, (v) => has(v.text, /3 files not taken in/));
  },
  'R4-f4': ({ view, lacks, has }) => {
    for (const st of ['stale', 'offline', 'error', 'expired']) lacks(view('files', 'a', 'a-queue', 'web', st).text, /link valid/, `${st}: a countdown from a read it was not made at`);
    has(view('files', 'a', 'a-queue', 'web', 'error').text, /export failed 11:38/);
    has(view('files', 'a', 'a-queue', 'web', 'default').text, /link valid 22 min/);
  },
  'R4-f9': ({ view, must }) => {
    for (const [st, chip, n] of [['error', /From 11:20, not vouched for/g, 3], ['stale', /From 11:12/g, 3]]) {
      const t = view('audit', 'b', 'b-gaps', 'web', st).text.replace(/Index lagging · from 11:12/g, '');
      must((t.match(chip) || []).length >= n, `${st}: a check reads bare`);
    }
  },
  'R5-f1': ({ view, has, lacks }) => {
    for (const [o, s] of [['a', 'a-gaps'], ['b', 'b-gaps']]) {
      const t = view('audit', o, s, 'web', 'partial').text;
      lacks(t, /Each of these reached/); has(t, /Not read: outbox_delivery did not answer/);
      has(view('audit', o, s, 'web', 'default').text, /Each of these reached/);
    }
  },
  'R5-f2': ({ view, each, must, has }) => {
    let n = 0;
    for (const journey of ['files', 'audit']) each({ journey, surface: ['iphone', 'web'], state: 'expired' }, (v, at) => {
      if (!/21:33/.test(v.text)) return;
      n++;
      must(/Tue (at )?21:33/.test(v.text), `${JSON.stringify(at)}: names 21:33 with no day`);
      must(!/expired 21:33/.test(v.text) && !/\b(Approved|approved) 21:18/.test(v.text.replace(/Reason [^·]*/, '')), `${JSON.stringify(at)}: a bare time`);
    });
    must(n >= 12, `only ${n} views name 21:33`);
    for (const [j, o, sc] of [['files', 'a', 'a-approve'], ['files', 'b', 'b-decide'], ['files', 'b', 'b-life'], ['audit', 'b', 'b-lineage'], ['audit', 'a', 'a-answer']]) has(view(j, o, sc, 'web', 'expired').text, /expired on Tue at 21:33/);
  },
  'R1-s7-home': ({ each, has, lacks }) => {
    each({ journey: 'home', surface: ALL }, (v) => { has(v.text, /account recovery works anywhere/); lacks(v.text.replace(/account recovery/g, '').replace(/Incidents and recovery/g, ''), /\brecovery\b/); });
  },
  'R1-s21': ({ view, must }) => {
    for (const st of ['default', 'stale']) { const t = tile(view('home', 'b', 'b-home', 'web', st), 'Incidents and recovery'); must(/1 not resolved/.test(t) && !/1 open/.test(t), `${st}: ${t.slice(0, 80)}`); }
  },
};
