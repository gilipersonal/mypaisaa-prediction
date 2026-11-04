// Fixed findings of MP-64 round 1, lane m: Runs and health, Agents, Models and evaluations (review/MP-64/round-1-lane-m.md).
// Each check tests what the fix does, in every state and device it applies to (lessons 2, 3, 11).
const OPT = ['a', 'b'];
/* a row or control with this name opens something: role="button" with its name, or a button with these words */
const opens = (html, name) => new RegExp(`role="button"[^>]*aria-label="${name}|<button[^>]*>(?:(?!</button>).)*${name}`, 's').test(html);

export default {
  'R1-m1': ({ view, each, has, lacks }) => {
    for (const st of ['default', 'stale', 'offline', 'denied']) {
      const t = view('models', 'a', 'a-evidence', 'web', st).text;
      has(t, /Matured, 3 months 0, first about 30 Nov/);
      has(t, /Matured, 6 months 0, first about 28 Feb/);
      has(t, /Matured, 12 months 0, first about 31 Aug 2027/);
      has(t, /calibrated on what has matured, and no 3, 6 or 12-month forecast has matured yet/);
    }
    each({ journey: 'models' }, (v) => lacks(v.text, /check clean running and calibration\./));
  },
  'R1-m2': ({ view, must }) => {
    for (const o of OPT) {
      const f = view('agents', o, `${o}-factors`, 'web', 'default'), r = view('models', o, `${o}-rules`, 'web', 'default');
      must(/data-act="A61"[\s\S]*?<button/.test(f.html), `agents.${o}: no live A61`);
      must(/data-act="A62"[\s\S]*?<button/.test(r.html), `models.${o}: no live A62`);
      must(/Rules v5/.test(r.text) && /0\.203/.test(r.text), `models.${o}: a rules version shows no comparators`);
      /* each is refused a live control where it cannot apply */
      for (const st of ['partial', 'error', 'stale', 'offline', 'conflict']) {
        must(!/data-act="A61"/.test(view('agents', o, `${o}-factors`, 'web', st).html), `agents.${o} ${st}: A61 is live`);
      }
      for (const st of ['partial', 'error', 'stale', 'offline', 'conflict', 'expired']) {
        must(!/data-act="A62"/.test(view('models', o, `${o}-rules`, 'web', st).html), `models.${o} ${st}: A62 is live`);
      }
      must(/data-phone-off/.test(view('agents', o, `${o}-factors`, 'iphone', 'default').html), `agents.${o}: A61 is live on a phone`);
    }
  },
  'R1-m3': ({ view, must, each }) => {
    const roster = view('agents', 'a', 'a-roster', 'web', 'default').html;
    for (const n of ['Factors in shadow', 'Memory notes', 'Route costs', 'Work and failures']) must(opens(roster, n), `a-roster has no door to ${n}`);
    const routeB = view('agents', 'b', 'b-route', 'web', 'default').html;
    for (const n of ['Versions', 'Runs', 'Cost', 'Notes', 'Factors in shadow']) must(opens(routeB, n), `b-route has no door to ${n}`);
    must(opens(view('agents', 'a', 'a-route', 'web', 'default').html, 'Versions'), 'a-route has no door to Versions');
    const pipe = view('models', 'a', 'a-pipe', 'web', 'default').html;
    for (const n of ['Self-correction bands', 'Evaluations', 'Rules v6', 'R2-HGB v4']) must(opens(pipe, n), `a-pipe has no door to ${n}`);
    must(opens(view('runs', 'a', 'a-run', 'web', 'default').html, 'Collect job'), 'a-run has no door to its job');
    must(opens(view('models', 'a', 'a-evidence', 'web', 'default').html, 'Go to the decision'), 'a-evidence has no door to the decision');
    for (const st of ['error', 'conflict', 'expired', 'stale', 'offline', 'partial', 'empty', 'loading']) must(!/Go to the decision/.test(view('models', 'a', 'a-evidence', 'web', st).html), `a-evidence ${st}: it offers the decision`);
    /* a code worker has no screen, so its row opens nothing */
    each({ journey: 'agents', option: 'a', screen: 'a-roster', surface: 'web', state: 'default' }, (v) => {
      for (const w of ['Grader', 'Bounded calibrator', 'Challenger trainer', 'Data steward', 'Ops warden']) must(!new RegExp(`role="button"[^>]*aria-label="${w}`).test(v.html), `${w} promises a screen`);
    });
  },
  'R1-m4': ({ view, must, has }) => {
    const h = view('models', 'a', 'a-decide', 'web', 'default');
    has(h.text, /8 of 8 scored weeks/);
    has(h.text, /Matured, 3 months 0, first about 30 Nov/);
    has(h.text, /v4 0\.188 Rules 0\.197 Base rate 0\.203/);
    must(h.html.indexOf('The evidence') < h.html.indexOf('data-act="A25"'), 'the proof comes after the button');
    must(view('models', 'a', 'a-decide', 'iphone', 'default').text.includes('v4 0.188'), 'no proof on a phone');
  },
  'R1-m5': ({ view, must, has, lacks, each }) => {
    for (const st of ['default', 'partial', 'offline', 'error', 'conflict', 'expired', 'denied']) {
      const t = view('runs', 'a', 'a-clock', 'web', st).text;
      has(t, /run_8d6e/); has(t, /run_8cf7/); has(t, /run_8d02/); has(t, /run_8c41/);
    }
    lacks(view('runs', 'a', 'a-clock', 'web', 'stale').text, /run_8d6e/, 'Stale says India has no record and still lists its run');
    has(view('runs', 'a', 'a-clock', 'web', 'default').text, /India Wed 10:15 · UK and US Tue/);
    each({ journey: 'runs' }, (v) => lacks(v.text, /about 180 end-of-day listings/));
    must(/per market|each market apart/i.test(view('runs', 'a', 'a-run', 'web', 'default').note), 'a-run does not say the run question is open');
  },
  'R1-m6': ({ view, must, has }) => {
    for (const [o, sc] of [['a', 'a-run'], ['a', 'a-compare'], ['a', 'a-recover'], ['b', 'b-dead']]) {
      const t = view('runs', o, sc, 'web', 'error').text;
      const a = t.indexOf('21:14 Twelve Data failed'), b = t.indexOf('21:40 The +40 retry failed'), c = t.indexOf('22:00 Frozen at +60');
      must(a >= 0 && a < b && b < c, `${sc}: failure, retry and freeze are out of order: ${a} ${b} ${c}`);
      has(t.slice(c), /missed_origin/);
      must(!/21:14 No input set/.test(t), `${sc}: missed_origin before the freeze`);
    }
  },
  'R1-m7': ({ view, lacks, has }) => {
    for (const o of OPT) {
      const t = view('runs', o, o === 'a' ? 'a-clock' : 'b-list', 'web', 'error').text;
      lacks(t, /Twelve Data, since 21:14|Twelve Data is failing/);
      has(t, /Twelve Data recovered · India collected Wed 10:15/);
      has(t, /Missed daily run US, Tue · inc_0013 Alarm/);
    }
  },
  'R1-m8': ({ view, each, lacks, has }) => {
    const w = view('agents', 'a', 'a-work', 'web', 'error').text;
    has(w, /the one item is job_3e9a/);
    lacks(w, /its item went to the dead-letter queue/i);
    lacks(w, /Nightly explanations [^·]*· [a-z ]* dead_lettered/);
    has(view('runs', 'b', 'b-queues', 'web', 'error').text, /Claude routes, 7 queues Waiting: 0 0 dead-lettered/);
    each({ journey: 'agents', state: 'error', surface: 'web', option: 'a', screen: 'a-work' }, (v) => has(v.text, /inc_0013/));
  },
  'R1-m9': ({ view, must, has, lacks }) => {
    const c = view('runs', 'a', 'a-clock', 'web', 'conflict').text;
    lacks(c, /India's run says issued/);
    has(c, /Tue 21:15.*reconcile_required/);
    must(/reconcile_required · Tue/.test(c), 'the US row is not in conflict');
    for (const [o, sc] of [['a', 'a-run'], ['a', 'a-job'], ['b', 'b-detail']]) {
      const t = view('runs', o, sc, 'web', 'conflict').text;
      has(t, /no answer/);
      lacks(t, /provider charge|shows a call its job does not|£0\.34/);
    }
    has(view('runs', 'a', 'a-run', 'web', 'conflict').text, /Twelve Data credits Held · ambiguous/);
    has(view('runs', 'a', 'a-compare', 'web', 'conflict').text, /Twelve Data credits ambiguous settled/);
  },
  'R1-m10': ({ view, each, has, lacks }) => {
    each({ journey: 'models', state: 'partial', surface: 'web' }, (v) => lacks(v.text, /exploratory/i));
    has(view('models', 'a', 'a-evidence', 'web', 'partial').text, /incomplete.*v4 Not read Rules Not read Base rate Not read/);
    has(view('models', 'b', 'b-board', 'web', 'partial').text, /incomplete.*v4 Not read/);
  },
  'R1-m11': ({ view, each, has, lacks, must }) => {
    has(view('models', 'a', 'a-bands', 'web', 'empty').text, /Overlay no overlay/);
    lacks(view('models', 'a', 'a-bands', 'web', 'empty').text, /Overlay overlay active/);
    const p = view('models', 'a', 'a-pipe', 'web', 'partial').text;
    lacks(p, /Ready for you|8 of 8 scored weeks/);
    for (const st of ['error', 'conflict']) { const t = view('models', 'a', 'a-pipe', 'web', st).text; lacks(t, /Waiting on you|Ready for you/); has(t, /Not ready for you/); }
    for (const st of ['partial', 'error', 'conflict', 'expired']) lacks(view('models', 'a', 'a-evidence', 'web', st).text, /ready for the owner/);
    const cost = view('agents', 'a', 'a-cost', 'web', 'partial').text; lacks(cost, /Settled\. The bill replaced the hold|£0\.22/); has(cost, /Settled figure not read/);
    const r = view('agents', 'a', 'a-roster', 'web', 'empty').text; lacks(r, /admitted|Claude is on/); has(r, /With no valid manifest, no call can start/);
    has(view('models', 'a', 'a-live', 'web', 'partial').text, /US tech, 12 months Pause record not read Unknown/);
    has(view('agents', 'a', 'a-work', 'web', 'partial').text, /Code workers Not read Unknown/);
    each({ journey: 'models', option: 'b', screen: 'b-bands', state: 'empty', surface: 'iphone' }, (v) => must(!/Overlay overlay active/.test(v.text), 'b-bands Empty claims an overlay'));
  },
  'R1-m12': ({ each, has }) => {
    for (const screen of ['a-route', 'b-route']) each({ journey: 'agents', screen, state: ['default', 'stale', 'offline', 'conflict', 'denied', 'partial'], surface: ['web', 'iphone'] }, (v) => {
      has(v.text, /Tools None inside the batch/); has(v.text, /Outbound context Derived values only/); has(v.text, /Budget caps Reserves its maximum first/);
    });
    each({ journey: 'agents', screen: 'a-route', state: 'default' }, (v) => { has(v.text, /Proposed · ARC-06b-O3/); has(v.text, /Proposed · ARC-06b-O4/); });
  },
  'R1-m13': ({ view, must }) => {
    for (const [o, sc] of [['a', 'a-evals'], ['b', 'b-evals']]) {
      const h = view('models', o, sc, 'web', 'default').html;
      must(/data-act="A30"[\s\S]*?Label calibration samples/.test(h), `${sc}: no A30`);
      must(/data-act="A72"[\s\S]*?Approve release thresholds/.test(h), `${sc}: no A72`);
      must(!/data-act="A30"[^>]*>(?:(?!data-act).)*Approve release thresholds/s.test(h), `${sc}: A30 still approves thresholds`);
    }
  },
};
