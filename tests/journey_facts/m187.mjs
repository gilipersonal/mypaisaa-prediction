// MP-187: the Track record view in Record ("A view in Record", OWN-24), an options round for MP-154's track records.
// Each fact reads the rendered screens: figures are recomputed from the counts beside them (lessons 37 and 63), every rate keeps its sample,
// a summary with too few matured forecasts says so, pending and censored are counted apart, and hit rate never stands alone.
const SURFACES = ['iphone', 'ipad', 'web', 'pwa'];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
const MIN = 30;
const num = (s) => Number(String(s).replace(/,/g, ''));
const rate = (a, b) => Math.round((a / b) * 100);
// one card's words: the html split at each Prism card, so a check reads what sits together
const cards = (html, textOf) => html.split(/<div class="card\b/).slice(1).map((c) => textOf(`<div class="card${c}`));
const tx = (html) => html.replace(/<svg[\s\S]*?<\/svg>/g, (m) => (m.match(/aria-label="([^"]*)"/) || [, ' '])[1] + ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();
const segOn = (html) => { const m = html.match(/<div class="segctl[^"]*" role="group" aria-label="Record"[\s\S]*?<\/div>/); return m ? [...m[0].matchAll(/aria-pressed="(true|false)">([^<]+)</g)].map((x) => [x[2], x[1] === 'true']) : null; };

export default {
  // Hit rate never appears without coverage, calibration and error beside it, and on the track record nor without the baseline and turnover
  // (AGENTS.md); on every journey's screens, card by card.
  'MP187-hitrate': ({ each, must }) => {
    let n = 0;
    each({}, (v, at) => {
      for (const c of cards(v.html, tx)) {
        if (!/Hit rate/.test(c)) continue;
        n++;
        for (const re of [/Coverage/, /Calibration/, /Error/]) must(re.test(c), `${at.journey}.${at.screen} ${at.surface} ${at.state}: hit rate without ${re} in "${c.slice(0, 160)}"`);
        if (at.journey === 'track') must(/[Bb]aseline/.test(c) && /[Tt]urnover/.test(c), `track.${at.screen} ${at.surface} ${at.state}: hit rate without the baseline or turnover`);
      }
    });
    must(n > 200, `only ${n} cards with a hit rate were read`);
  },

  // A rate shows only from 30 scored. Every "N% of S" and "of S scored" on the track record has S at 30 or more, and the one summary
  // below it, R2-HGB v3 at 20 sessions, says too few instead, on every device.
  'MP187-toofew': ({ each, has, lacks, must }) => {
    let rates = 0, few = 0;
    each({ journey: 'track' }, (v, at) => {
      const w = `track.${at.screen} ${at.surface} ${at.state}`;
      for (const m of v.text.matchAll(/(\d+)% of ([\d,]+)/g)) { rates++; must(num(m[2]) >= MIN, `${w}: a rate of ${m[0]}, under ${MIN} scored`); }
      for (const m of v.text.matchAll(/(\d+)% of ([\d,]+) scored/g)) must(num(m[2]) >= MIN, `${w}: ${m[0]}`);
      if (/Too few/.test(v.text)) { few++; lacks(v.text, /Too few[^.]{0,20}\d+%/, `${w}: a rate beside "Too few"`); }
      if (at.state !== 'empty' && ['a-model', 'b-table'].includes(at.screen)) {
        has(v.text, /Too few/, `${w}: v3 at 20 sessions does not say too few`);
        has(v.text, /27 scored|Too few, 27|20 sessions 27 Too few/, `${w}: the 27 scored are not shown`);
        has(v.text, new RegExp(`from ${MIN}`), `${w}: does not say when a rate shows`);
      }
    });
    must(rates > 500 && few > 50, `read ${rates} rates and ${few} too-few summaries`);
  },

  // 12 months has nothing matured: it says so, shows its first date and its pending, and draws no rate.
  'MP187-nothing': ({ each, has, must }) => {
    let n = 0;
    for (const screen of ['a-record', 'b-table']) each({ journey: 'track', screen, state: STATES.filter((s) => s !== 'empty') }, (v, at) => {
      n++;
      const w = `track.${screen} ${at.surface} ${at.state}`;
      has(v.text, /Nothing has matured/, `${w}: 12 months does not say nothing has matured`);
      has(v.text, /First due 2 Feb 2027/, `${w}: no first date for 12 months`);
      has(v.text, /1,344 pending/, `${w}: 12 months' pending is not shown`);
      const i = v.text.indexOf('12 months'), at12 = v.text.slice(i, v.text.indexOf('1,344 pending', i));
      must(!/\d+%/.test(at12), `${w}: a rate near 12 months: "${at12}"`);
    });
    must(n === 2 * SURFACES.length * 8, `walked ${n}`);
  },

  // Each horizon keeps its pending count in view, and every 30, 90 and 365-day rate on the scorecard is computed from the counts beside it.
  'MP187-computed': ({ each, must }) => {
    let n = 0;
    const kinds = { cov: 0, hit: 0, bench: 0 };
    each({ journey: 'track', state: STATES.filter((s) => s !== 'empty') }, (v, at) => {
      const w = `track.${at.screen} ${at.surface} ${at.state}`;
      // a rolling figure reads twice in text, its resting value and its live one, and the two must agree
      for (const m of v.text.matchAll(/Coverage (\d+)% (\d+)% 80% ranges held, ([\d,]+) of ([\d,]+)/g)) { n++; kinds.cov++; must(m[1] === m[2] && rate(num(m[3]), num(m[4])) === +m[1], `${w}: coverage ${m[1]}% from ${m[3]} of ${m[4]}`); }
      for (const m of v.text.matchAll(/Hit rate (\d+)% (\d+)% Direction right, ([\d,]+) of ([\d,]+)/g)) { n++; kinds.hit++; must(m[1] === m[2] && rate(num(m[3]), num(m[4])) === +m[1], `${w}: hit rate ${m[1]}% from ${m[3]} of ${m[4]}`); }
      for (const m of v.text.matchAll(/Error ([\d.]+) pts [\d.]+ pts Median absolute .{0,80}?Benchmark ([\d.]+) pts [\d.]+ pts Less error than the baseline’s ([\d.]+) pts/g)) { n++; kinds.bench++; must(Math.abs(+m[3] - +m[1] - +m[2]) < 0.05, `${w}: benchmark ${m[2]} is not ${m[3]} less ${m[1]}`); }
      // the scorecard's windows: each rate with the scored beside it, and the 365-day window is the one its measures read
      for (const m of v.text.matchAll(/(\d+)% (\d+)% of ([\d,]+) scored/g)) { n++; must(m[1] === m[2], `${w}: ${m[0]}`); }
      for (const m of v.text.matchAll(/365 days · ([\d,]+) scored · (\d+) censored · (\d+) abstained/g)) { n++; must(num(m[1]) >= MIN, `${w}: ${m[0]}`); }
    });
    must(n >= 800 && kinds.cov > 100 && kinds.hit > 100 && kinds.bench > 100, `only ${n} figures were recomputed: ${JSON.stringify(kinds)}`);
  },

  // The opened horizon accounts for every forecast: issued is pending plus matured, and matured is scored, censored and abstained.
  'MP187-flow': ({ each, must }) => {
    let n = 0;
    for (const screen of ['a-slice', 'b-slice']) each({ journey: 'track', screen, state: STATES.filter((s) => s !== 'empty') }, (v, at) => {
      const w = `track.${screen} ${at.surface} ${at.state}`, g = (re) => { const m = v.text.match(re); must(m, `${w}: no ${re}`); return num(m[1]); };
      const issued = g(/Issued ([\d,]+)/), pending = g(/Pending, horizon not passed ([\d,]+)/), matured = g(/Matured ([\d,]+) · Scored/), scored = g(/· Scored ([\d,]+)/), cens = g(/· Censored ([\d,]+)/), abst = g(/· Abstained ([\d,]+)/);
      must(issued === pending + matured, `${w}: ${issued} issued is not ${pending} pending and ${matured} matured`);
      must(matured === scored + cens + abst, `${w}: ${matured} matured is not ${scored} + ${cens} + ${abst}`);
      must(/NVIDIA · 28 Apr Inside/.test(v.text) && /AstraZeneca · 3 Mar Outside, −11\.6%/.test(v.text), `${w}: the journal's two 6-month entries do not agree with the journal`);
      if (at.state === 'disagreement') must(/\+11\.9%, amended/.test(v.text), `${w}: the amended NVIDIA outcome`);
      n++;
    });
    must(n === 2 * SURFACES.length * 8, `walked ${n}`);
  },

  // The breakdowns add up to the horizon: by holding and by regime, the scored sum to 834 at 3 months and 413 at 6, on both options.
  'MP187-sums': ({ view, must, has }) => {
    for (const surface of SURFACES) {
      const a = view('track', 'a', 'a-holding', surface).text;
      for (const [hz, total, due] of [['3 months', 834, 127], ['6 months', 413, 63]]) {
        const part = a.slice(a.indexOf(`${hz} Exploratory`), hz === '3 months' ? a.indexOf('6 months Exploratory') : undefined);
        const scored = [...part.matchAll(/\d+% of (\d+)/g)].map((m) => +m[1]);
        must(scored.length === 7 && scored.reduce((x, y) => x + y, 0) === total, `a-holding ${surface} ${hz}: ${scored.join('+')} is not ${total}`);
        const matured = [...part.matchAll(/· (\d+) matured/g)].map((m) => +m[1]);
        must(matured.length === 7 && matured.every((x) => x === due), `a-holding ${surface} ${hz}: matured ${matured.join(', ')}`);
        has(part, new RegExp(`${total} scored across 7 holdings`), `a-holding ${surface} ${hz}: the total`);
      }
      const r = view('track', 'a', 'a-regime', surface).text;
      for (const [hz, total] of [['3 months', 834], ['6 months', 413]]) {
        const part = r.slice(r.indexOf(`${hz} Exploratory`), hz === '3 months' ? r.indexOf('6 months Exploratory') : undefined);
        const scored = [...part.matchAll(/\d+% of (\d+)/g)].map((m) => +m[1]);
        must(scored.length === 4 && scored.reduce((x, y) => x + y, 0) === total, `a-regime ${surface} ${hz}: ${scored.join('+')} is not ${total}`);
      }
    }
    for (const surface of ['ipad', 'web']) has(view('track', 'b', 'b-table', surface).text, /All 7 79% 834 77% 413 30 53/, `b-table ${surface}: the holdings' total row`);
    for (const surface of ['iphone', 'pwa']) has(view('track', 'b', 'b-table', surface).text, /All 7: 79% of 834 at 3 months, 77% of 413 at 6\./, `b-table ${surface}: the holdings' total`);
  },

  // Both options read the same record: the figures each side of a flip shows agree.
  'MP187-agree': ({ view, must }) => {
    const same = [[/834\b/, /413\b/, /455 pending/, /903 pending/, /1,344 pending/, /First due 2 Feb 2027/, /79%/, /77%/], [/Issued 1,344/, /903\b/, /441\b/, /413\b/]];
    for (const surface of SURFACES) for (const state of STATES.filter((s) => s !== 'empty')) {
      for (const [k, [x, y]] of [[0, ['a-record', 'b-table']], [1, ['a-slice', 'b-slice']]]) {
        const a = view('track', 'a', x, surface, state).text, b = view('track', 'b', y, surface, state).text;
        for (const re of same[k]) must(re.test(a) && re.test(b), `${x} and ${y} ${surface} ${state}: ${re} on ${re.test(a) ? y : x} is missing`);
      }
    }
  },

  // Record holds the Journal and the Track record, and the top of each carries the switch with its own place pressed.
  'MP187-switch': ({ view, must }) => {
    for (const surface of SURFACES) for (const state of STATES) {
      for (const [j, o, s, on] of [['journal', 'a', 'a-list', 'Journal'], ['journal', 'b', 'b-board', 'Journal'], ['track', 'a', 'a-record', 'Track record'], ['track', 'b', 'b-table', 'Track record']]) {
        const sw = segOn(view(j, o, s, surface, state).html);
        must(sw && sw.map((x) => x[0]).join('|') === 'Journal|Track record' && sw.find((x) => x[1])[0] === on, `${j}.${s} ${surface} ${state}: the Record switch reads ${JSON.stringify(sw)}`);
      }
    }
  },

  // What the scorecard promises has somewhere to go: Read it by leads to holding, model and regime, and 6 months opens on both options.
  'MP187-destinations': ({ screens, view, has, must }) => {
    must(['a-record', 'a-slice', 'a-holding', 'a-model', 'a-regime'].every((s) => screens('track', 'a').includes(s)), `option A draws ${screens('track', 'a').join(', ')}`);
    must(['b-table', 'b-slice'].every((s) => screens('track', 'b').includes(s)), `option B draws ${screens('track', 'b').join(', ')}`);
    for (const surface of SURFACES) {
      const a = view('track', 'a', 'a-record', surface).text, b = view('track', 'b', 'b-table', surface).text;
      for (const re of [/Read it by Holding/, /Model R2-HGB v2, v3 and the baseline/, /Regime Four regimes at origin/, /6 months in full/]) has(a, re, `a-record ${surface}: ${re}`);
      has(b, /Open 6 months/, `b-table ${surface}: no way into the opened row`);
      has(view('track', 'a', 'a-slice', surface).text, /6 months/, `a-slice ${surface}`);
    }
  },

  // Labels stay in view: freshness and provider status on every frame, every rate marked exploratory, live kept apart from walk-forward,
  // short term labelled apart, the proposed rules labelled, and no trading word.
  'MP187-labels': ({ each, has, lacks, must }) => {
    let n = 0;
    each({ journey: 'track' }, (v, at) => {
      const w = `track.${at.screen} ${at.surface} ${at.state}`;
      n++;
      must(/class="jfresh/.test(v.html), `${w}: no freshness or provider status`);
      lacks(v.text, /\b(buy|sell|order|trade now|you should)\b/i, `${w}: trading or advice words`);
      if (at.state === 'empty') return has(v.text, /No forecast has been issued/, `${w}: Empty does not say why`);
      if (/\d+% of [\d,]+/.test(v.text) || /Coverage \d+%/.test(v.text)) has(v.text, /Exploratory/, `${w}: a rate not marked exploratory`);
      if (['a-record', 'b-table'].includes(at.screen)) {
        has(v.text, /Live forecasts only/, `${w}: live is not kept apart from walk-forward`);
        has(v.text, /Short term · not long-term guidance|Short term Not long-term guidance/, `${w}: short term is not labelled apart`);
        has(v.text, /Proposed · SCI-D03/, `${w}: the minimum of ${MIN} is not labelled proposed`);
      }
      if (['a-regime', 'b-table'].includes(at.screen)) has(v.text, /Proposed · SCI-D04/, `${w}: the regime rule is not labelled proposed`);
      if (at.state === 'stale') has(v.text, /a late price is never scored as a miss/, `${w}: Stale does not say a late price is never a miss`);
      if (at.state === 'loading') must(/aria-busy="true"/.test(v.html) && /last good figures, from 22:15/.test(v.text), `${w}: Loading hides the record`);
    });
    must(n === 7 * SURFACES.length * STATES.length, `walked ${n}`);
  },
};
