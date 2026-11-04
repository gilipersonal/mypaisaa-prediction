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
      for (const st of ['partial', 'error', 'stale', 'offline', 'conflict']) {   // Expired offers a new window (R2-m12)
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
    for (const st of ['default', 'offline', 'error', 'conflict', 'expired', 'denied']) {
      const t = view('runs', 'a', 'a-clock', 'web', st).text;
      has(t, /run_8d6e/); has(t, /run_8cf7/); has(t, /run_8d02/); has(t, /run_8c41/);
    }
    /* Partial: the UK record did not answer, so its run has no id or time here (R3-m15) */
    { const t = view('runs', 'a', 'a-clock', 'web', 'partial').text; has(t, /run_8d6e/); has(t, /UK, Tue Run not read Unknown/); lacks(t, /run_8cf7/); }
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
    has(c, /Tue 3 Nov 21:15.*reconcile_required/);
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
    for (const st of ['error', 'conflict']) { const t = view('models', 'a', 'a-pipe', 'web', st).text; lacks(t, /Ready for you/); has(t, /Not ready for you/); }   // Failed keeps Rules v6 under Waiting on you (R3-m5); v4 stays out of it
    lacks(view('models', 'a', 'a-pipe', 'web', 'conflict').text, /Waiting on you/);
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

  // Round 2. Each holds the kind of fault, across every state and sibling screen it can reach.
  'R2-m1': ({ view, each, has, lacks, must }) => {
    for (const o of OPT) {
      const r = view('models', o, `${o}-rules`, 'web', 'default').text;
      has(r, /Mapping R0-RULEMAP · qualified for v6/);
      has(r, /Rule strength itself stays a heuristic/);
      lacks(r, /Rule strength is a heuristic, never a probability/);
      const n = view('models', o, `${o}-rules`, 'web', 'error');
      has(n.text, /mapping not qualified/); has(n.text, /not scoreable/); has(n.text, /Mapping R0-RULEMAP · not qualified/);
      lacks(n.text, /Rules v6 0\.194/);
      lacks(n.text, /These scores come through/);
      must(/data-act="A78"/.test(n.html), `${o}: no A78 where the mapping failed`);
      must(!/data-act="A62"/.test(n.html), `${o}: A62 is live with no mapping`);
    }
    has(view('models', 'a', 'a-pipe', 'web', 'error').text, /Rules v6 shadow · not scoreable · waits for you/);
    has(view('models', 'a', 'a-evidence', 'web', 'error').text, /Rules Not scoreable/);
    has(view('models', 'b', 'b-board', 'web', 'error').text, /Rules v6 Not scoreable/);
    each({ journey: 'models', option: 'a', screen: 'a-evidence', state: 'default' }, (v) => has(v.text, /R0-RULEMAP/));
  },
  'R2-m2': ({ each, has, must }) => {
    for (const [option, screen] of [['a', 'a-decide'], ['b', 'b-scope']]) each({ journey: 'models', option, screen }, (v, at) => {
      if (!/data-act="A25"/.test(v.html)) return;
      must(/US tech, 12 months Stays paused/.test(v.text), `${screen} ${at.state}: A25 with no word on the paused scope`);
      must(/India midcap, 3 months Stays on R1-LGB v1/.test(v.text), `${screen} ${at.state}: A25 with no word on India midcap`);
      has(v.text, /Where v3 is not eligible, the scope pauses instead/);
    });
  },
  'R2-m3': ({ each, must }) => {
    for (const [option, screen] of [['a', 'a-decide'], ['b', 'b-scope']]) each({ journey: 'models', option, screen }, (v, at) => {
      if (!/data-act="A25"/.test(v.html)) return;
      must(/0\.188/.test(v.text) && /0\.197/.test(v.text) && /8 of 8 scored weeks/.test(v.text), `${screen} ${at.state}: A25 away from its proof`);
      must(/approving one sends the other back to its check/.test(v.text), `${screen} ${at.state}: A25 with no overlap`);
      must(/What would change/.test(v.text), `${screen} ${at.state}: A25 with no consequences`);
    });
  },
  'R2-m4': ({ each, must }) => {
    for (const [option, screen] of [['a', 'a-bands'], ['b', 'b-bands']]) each({ journey: 'models', option, screen }, (v, at) => {
      if (!/data-act="A29"/.test(v.html)) return;
      for (const re of [/Expected impact Slower correction/, /Evidence 26 weeks of replay/, /Cost a month £0/, /How to roll it back A new version/, /approving one sends the other back to its check/, /Environment Production/, /Owner You/, /Current version v9/]) must(re.test(v.text), `${screen} ${at.state}: A29 with no ${re}`);
    });
  },
  'R2-m5': ({ view, each, has, must }) => {
    for (const o of OPT) {
      const sc = `${o}-evals`;
      const t = view('models', o, sc, 'web', 'default');
      has(t.text, /Release thresholds Judge agreement Not approved yet/);
      has(t.text, /Labelling opens one sample at a time/);
      must(/This approval is bound to[\s\S]*data-act="A72"/.test(t.html), `${sc}: A72 has no bind`);
      each({ journey: 'models', option: o, screen: sc, surface: 'web' }, (v, at) => {
        const live = ['default', 'conflict'].includes(at.state);
        must(/data-act="A72"/.test(v.html) === live, `${sc} ${at.state}: A72 live is ${!live}`);
      });
      for (const st of ['empty', 'partial', 'error', 'stale', 'expired', 'denied']) has(view('models', o, sc, 'web', st).text, /Labelling and thresholds (open|wait|return)/);
    }
  },
  'R2-m6-screens': ({ view, has }) => {
    for (const o of OPT) {
      has(view('agents', o, `${o}-factors`, 'web', 'default').text, /No record names who withdraws a factor/);
      has(view('models', o, `${o}-rules`, 'web', 'default').text, /No record names who withdraws a rules version/);
    }
  },
  'R2-m7': ({ view, must }) => {
    /* follow the row into its screen, in each state: the chip on one is the chip on the other (lesson 31) */
    const CHIPS = ['Waits for your yes', 'Unknown', 'mapping not qualified', 'Refused', 'Expired', 'Loading'];
    const chipOf = (t) => CHIPS.find((c) => t.includes(c));
    for (const st of ['default', 'partial', 'error', 'stale', 'offline', 'conflict', 'expired', 'denied']) {
      const row = view('models', 'a', 'a-pipe', 'web', st).text.match(/Rules v6 shadow[^,]*?(Waits for your yes|Unknown|mapping not qualified|Refused)/);
      must(row, `a-pipe ${st}: no Rules v6 row`);
      must(view('models', 'a', 'a-rules', 'web', st).text.includes(row[1]), `${st}: the row says ${row[1]}, a-rules says ${chipOf(view('models', 'a', 'a-rules', 'web', st).text)}`);
    }
    for (const st of ['error', 'conflict']) must(!/waits? (for|on) you/i.test(view('models', 'a', 'a-pipe', 'web', st).text.split('Not ready for you')[1].split('Live')[0]), `${st}: a waiting row under Not ready`);
  },
  'R2-m8': ({ view, has, lacks }) => {
    for (const [o, sc] of [['a', 'a-clock'], ['b', 'b-list']]) {
      const t = view('runs', o, sc, 'web', 'partial').text;
      has(t, /Missed daily run India Wed 10:15 · US Tue · UK not read Unknown/);
      lacks(t, /UK and US Tue/);
      lacks(t, /(run_8cf7[^.]{0,40})Succeeded/);
      lacks(t, /(run_8bf3|UK)[^.]{0,30}Succeeded/, `${sc}: a UK success while the UK is unread`);
    }
  },
  'R2-m9': ({ view, has, lacks }) => {
    for (const [o, sc] of [['a', 'a-clock'], ['b', 'b-list']]) {
      const t = view('runs', o, sc, 'web', 'conflict').text;
      has(t, /India Wed 10:15 · UK Tue · US Tue held Held/);
      lacks(t, /UK and US Tue/);
    }
    const t = view('runs', 'a', 'a-clock', 'web', 'conflict').text;
    has(t, /Last success Mon 21:15 · Tue held by the reconciler/);
    has(t, /Watermark Mon close · Tue held/);
    has(t, /Proposed · CT-05/);
  },
  'R2-m10': ({ view, has, must }) => {
    for (const o of OPT) {
      const v = view('models', o, `${o}-live`, 'web', 'default');
      has(v.text, /4 decisions wait on you\. 1 paused scope waits on your restart\./);
      must(/4 dated decisions/.test(v.note), `${o}-live: no note on the count`);
    }
  },
  'R2-m11': ({ each, must }) => {
    for (const screen of ['a-route', 'b-route']) each({ journey: 'agents', screen }, (v, at) => {
      if (!/Outbound context Derived values only/.test(v.text)) return;
      for (const id of ['ARC-06b-O4', 'ARC-06b-O3', 'ARC-06b-O2']) must(v.text.includes(`Proposed · ${id}`), `${screen} ${at.state} ${at.surface}: the manifest has no ${id}`);
    });
  },
  'R2-m12': ({ view, must, each }) => {
    for (const o of OPT) {
      const v = view('models', o, `${o}-rules`, 'web', 'expired');
      must(/Approve again for a new window/.test(v.text), `${o}-rules: Expired is a dead end`);
      must(/data-act="A62"/.test(v.html), `${o}-rules: Expired offers no way on`);
      must(/This approval is bound to/.test(v.text), `${o}-rules: Expired has no bind`);
    }
    /* the kind: an approval that ran out on a proposal that stays open always offers the way on */
    each({ journey: 'models', option: 'a', screen: 'a-live', state: 'expired', surface: 'web' }, (v) => must(/data-act="A27"/.test(v.html), 'a-live Expired: no way on'));
    each({ journey: 'models', option: 'a', screen: 'a-decide', state: 'expired', surface: 'web' }, (v) => must(/data-act="A25"/.test(v.html), 'a-decide Expired: no way on'));
  },

  // Round 3. Hold the kind: every state and sibling screen, and no claim the records do not make.
  'R3-m1': ({ each, must }) => {
    const EXC = 'All segments, except US tech, 12 months and India midcap, 3 months';
    for (const [option, screen] of [['a', 'a-decide'], ['b', 'b-scope']]) each({ journey: 'models', option, screen }, (v, at) => {
      if (!/Stays paused/.test(v.text) && !/data-act="A25"/.test(v.html)) return;
      must(!/Scope All segments(?!, except)/.test(v.text), `${screen} ${at.state} ${at.surface}: a bare Scope All segments`);
      must(!/· all segments(?!, except)/.test(v.text), `${screen} ${at.state} ${at.surface}: a bare all segments in the head`);
      if (at.surface === 'web' && at.state === 'default') must(v.text.includes(`Scope ${EXC}`), `${screen}: the bind names no exact scope`);
    });
  },
  'R3-m2': ({ view, has, lacks, each }) => {
    /* Failed tells one story: no mapping for v5 or v6, one base-rate value */
    for (const [o, sc] of [['a', 'a-rules'], ['b', 'b-rules'], ['a', 'a-pipe']]) has(view('models', o, sc, 'web', 'error').text, /v5 or v6/);
    has(view('models', 'a', 'a-evidence', 'web', 'error').text, /No rules mapping qualified for v5 or v6/);
    for (const [o, sc] of [['a', 'a-evidence'], ['a', 'a-decide']]) has(view('models', o, sc, 'web', 'error').text, /This trial also waits on your decision about the rules mapping/);
    each({ journey: 'models', state: 'error', surface: 'web' }, (v, at) => {
      lacks(v.text, /Base rate 0\.203/, `${at.screen}: a base rate beside a failed evaluation`);
      lacks(v.text, /mapping qualified for v6/, `${at.screen}: v6 alone`);
    });
  },
  'R3-m3': ({ view, lacks }) => {
    for (const [o, sc] of [['a', 'a-evidence'], ['b', 'b-scope']]) for (const st of ['partial', 'error']) lacks(view('models', o, sc, 'web', st).text, /23\.5|1\.2 points narrower/);
  },
  'R3-m4': ({ view, has, must }) => {
    for (const o of OPT) {
      const v = view('models', o, `${o}-rules`, 'web', 'error');
      must(/data-act="A78"/.test(v.html), `${o}-rules: A78 is gone`);
      has(v.text, /No record lists the choices yet, so none is drawn\./);
      has(v.text, /Meanwhile Rules v6 stays in shadow and Rules v5 stays current\./);
      must(/data-act="A78"[\s\S]*Proposed · SCI-D03[\s\S]*No record lists the choices/.test(v.html), `${o}-rules: the open id is not under the control`);
    }
  },
  'R3-m5': ({ view, has, lacks, must }) => {
    const t = view('models', 'a', 'a-pipe', 'web', 'error').text;
    must(t.indexOf('Waiting on you') >= 0 && t.indexOf('Waiting on you') < t.indexOf('Rules v6 shadow') && t.indexOf('Rules v6 shadow') < t.indexOf('Not ready for you'), 'Rules v6 is not under Waiting on you');
    has(t.split('Not ready for you')[1].split('Live')[0], /R2-HGB v4/);
    lacks(t.split('Not ready for you')[1].split('Live')[0], /Rules v6/);
    lacks(t, /incomplete, never green, and no rules mapping/);
  },
  'R3-m6': ({ view, has, must }) => {
    for (const o of OPT) {
      const v = view('models', o, `${o}-live`, 'web', 'default');
      has(v.text, /4 decisions wait on you\. 1 paused scope waits on your restart\. Rules v6, a switch forward, a factor, a route change and the release thresholds stay open with no date\./);
      must(/second line/.test(v.note), `${o}-live: the note leaves the others out`);
    }
  },

  // Round 4.
  'R4-m1': ({ each, must }) => {
    for (const [option, screen] of [['a', 'a-evals'], ['b', 'b-evals']]) each({ journey: 'models', option, screen, surface: ['web', 'ipad'] }, (v, at) => {
      if (!/Arrives with the proposal/.test(v.text)) return;
      must(/data-act="A72"/.test(v.html), `${screen} ${at.state}: A72 is gone`);
      must(/data-act="A72"><button disabled /.test(v.html), `${screen} ${at.state}: A72 is enabled beside a proposal that has not arrived`);
      must(/Opens when a proposal carries its values/.test(v.text), `${screen} ${at.state}: no line says when it opens`);
      must(!/b6e2/.test(v.text), `${screen} ${at.state}: a hash of nothing`);
      must(/\(CT-10, CT-11\)/.test(v.text) && !/ARC-09/.test(v.text), `${screen} ${at.state}: the wrong open question`);
    });
  },
  'R4-m2': ({ view, must, has, lacks }) => {
    /* Partial: the alarm, the queue row and the item all say the UK collection was not read (lesson 31) */
    for (const [o, sc] of [['a', 'a-clock'], ['b', 'b-list']]) {
      const t = view('runs', o, sc, 'web', 'partial').text;
      has(t, /Dead-letter queues UK collection not read Unknown/);
      has(t, /Stale collector UK collection not read Unknown/);
      lacks(t, /Dead-letter queues [^.]{0,30}0 items/);
    }
    has(view('runs', 'b', 'b-queues', 'web', 'partial').text, /Collection UK not read Unknown/);
    for (const st of ['partial', 'stale']) must(!/None is held now/.test(view('runs', 'b', 'b-dead', 'web', st).text), `b-dead ${st}: claims none is held`);
    must(/None is held now/.test(view('runs', 'b', 'b-dead', 'web', 'default').text), 'b-dead Ready lost its sentence');
  },
  'R4-m3': ({ view, has, lacks }) => {
    for (const [o, sc] of [['a', 'a-clock'], ['b', 'b-list']]) {
      const t = view('runs', o, sc, 'web', 'partial').text;
      has(t, /UK, Mon Run not read Unknown/);
      lacks(t, /run_8bf3|run_8cf7/);
      has(t, /The UK run record did not/);
    }
    for (const [o, sc] of [['b', 'b-queues'], ['b', 'b-dead'], ['a', 'a-recover']]) has(view('runs', o, sc, 'web', 'partial').text, /UK run record did not/);
    has(view('runs', 'a', 'a-clock', 'web', 'default').text, /run_8bf3 · UK Succeeded/);
  },
  'R4-m4': ({ view, must }) => {
    for (const [o, sc] of [['a', 'a-decide'], ['b', 'b-scope']]) {
      const v = view('models', o, sc, 'web', 'expired');
      must(/data-act="A25"/.test(v.html), `${sc}: A25 is gone`);
      const bind = v.text.split('This approval is bound to')[1] || '';
      must(bind, `${sc}: no bind`);
      must(!/Fri 6 Nov/.test(bind) && !/a81f/.test(bind), `${sc}: a new approval bound to the old window or hash`);
      must(/A new window, shown before you approve/.test(bind), `${sc}: the bind names no new window`);
    }
  },
  'R4-s2-runs': ({ view, journeys, has, must }) => {
    has(view('runs', 'a', 'a-clock', 'web', 'conflict').text, /inc_0012 · detected Tue 16:50 Reopened/);
    has(view('runs', 'a', 'a-recover', 'web', 'conflict').text, /Reopened/);
    must(!/Disagreement/.test(view('runs', 'a', 'a-recover', 'web', 'conflict').text), 'a state that is not an incident state');
    const p = view('runs', 'a', 'a-recover', 'web', 'partial').text;
    has(p, /The incident answered and the UK run record did not/);
    has(p, /Collect not read/);
    must(!/Collect found no newer price|Still none/.test(p), 'a-recover Partial tells the unread run as read');
    /* follow the id into Incidents wherever that journey is on the page (lesson 31) */
    if (journeys().includes('incidents')) for (const st of ['default', 'stale', 'offline', 'conflict', 'denied']) {
      const word = (t) => (t.match(/inc_0012[^]{0,120}?(Acknowledged|Reopened|Resolved)/) || [])[1];
      const a = word(view('runs', 'a', 'a-clock', 'web', st).text), b = word(view('incidents', 'a', 'a-list', 'web', st).text);
      must(a === b, `${st}: Runs says ${a}, Incidents says ${b}`);
    }
  },
};
