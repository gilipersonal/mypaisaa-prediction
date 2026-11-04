// What each fixed finding of lane j holds, proved on the rendered Holdings and Journal screens (MP-62 rounds 1 to 3).
const WIDE = ['ipad', 'web'], PHONES = ['iphone', 'pwa'], ALL_SURFACES = [...WIDE, ...PHONES];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
const backTo = (v, name) => v.html.includes(`aria-label="Back to ${name}"`);
const countOf = (s, re) => (s.match(re) || []).length;
const num = (t) => Number(String(t).replace(/,/g, ''));
const pounds = (a, b) => Math.round((a - b) * 100) / 100;
// every button a screen draws, with whether it can be pressed
const buttons = (html) => [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map((m) => ({ off: /\bdisabled\b/.test(m[1]), attrs: m[1], text: m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() }));
const liveBtn = (html, label) => buttons(html).some((b) => !b.off && b.text.includes(label));
const drawnBtn = (html, label) => buttons(html).some((b) => b.text.includes(label));
// a screen of holdings or prices; every other Holdings screen is an import screen, so a new one is covered by default
const PRICED = ['a-list', 'a-private', 'a-one', 'b-accounts', 'b-private', 'b-one'];
const importScreens = (screens) => ['a', 'b'].flatMap((o) => screens('holdings', o).filter((s) => !PRICED.includes(s)).map((s) => [o, s]));
const SENTENCE = /This records what already happened at your broker\. It places no trade\./;
// the top bar's actions on phone web
const barOf = (html) => (html.match(/margin-left:auto;display:flex;gap:6px;align-items:center">([\s\S]*?)<\/span><\/div>/) || [])[1];
const STAGES = ['default', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
// the entries a journal screen draws, in order: name, date, status, ranked action and what you did, line. Timeline rows, lane cards and the wide table all read the same way.
const clean = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const markOf = (h) => (h.match(/lg-(?:sc|miss)/) || [''])[0];
const entriesOf = (html) => [...html.matchAll(/<div class="journal-e( lane)?" data-mo="rise">([\s\S]*?)(?=<div class="journal-e|<div class="t5foot|<\/section>)/g)].map((m) => {
  const head = m[2].match(/<div class="m"><b>([^<]*)<\/b><span>([^<]*)<\/span>/) || [], act = m[2].match(/<div class="l">([\s\S]*?)<\/div><div class="o">/) || [], o = [...m[2].matchAll(/<div class="o">([\s\S]*?)<\/div>/g)].map((x) => x[1]);
  const status = m[1] ? o[1] : (m[2].match(/<\/span><\/div><div>([\s\S]*?)<\/div>\s*<div class="l">/) || [])[1];
  return { name: head[1], when: head[2], status: clean(status || ''), mark: markOf(status || ''), act: clean(act[1] || ''), line: clean(o[0] || '') };
});
const rowsOf = (html) => [...html.matchAll(/<tr data-mo="rise"><td>([\s\S]*?)<\/td><td>([^<]*)<\/td><td>([\s\S]*?)<\/td><td[^>]*>([\s\S]*?)<\/td><td[^>]*><div>([\s\S]*?)<\/div><div[^>]*>([\s\S]*?)<\/div><\/td><\/tr>/g)].map((m) => {
  const head = m[1].match(/<b[^>]*>([^<]*)<\/b><span>([^<]*)<\/span>/) || [];
  return { name: head[1], when: `${m[2]} · ${head[2]}`, status: clean(m[5]), mark: markOf(m[5]), act: clean(`${m[3]} ${m[4]}`), line: clean(m[6]) };
});
const laneOf = (html, title) => html.split('<section class="journal-lane">').find((x) => x.startsWith(`<h3>${title}<`)) || '';
const TIMELINE = ['Today', '21 Aug 2026', '2 Jun 2026', '12 May 2026', '28 Apr 2026', '14 Apr 2026', '3 Mar 2026'], WAIT = ['12 May 2026', '21 Aug 2026', 'Today', '14 Apr 2026'], SCORE = ['28 Apr 2026', '2 Jun 2026', '3 Mar 2026'];
const dated = (e) => e.when.split(' · ')[0];
// XNPV as FIN-14 sets it: actual days over 365 from the first flow, contributions negative, the value on 3 Nov 2026 as the last flow.
const utc = (t) => Date.parse(`${t} UTC`);
const flowsOf = (text, close, account) => {
  const f = [...text.matchAll(/(Bought|Sold) \d+ (\d{1,2} \w{3} \d{4}) ·(?: ([^£·]+?) ·)? £([\d,.]+)/g)].filter((m) => !account || m[3] === account).map((m) => ({ at: utc(m[2]), v: (m[1] === 'Bought' ? -1 : 1) * num(m[4]) })).sort((a, b) => a.at - b.at);
  return f.concat([{ at: utc('3 Nov 2026'), v: close }]);
};
const xnpv = (f, r) => f.reduce((a, x) => a + x.v / (1 + r) ** ((x.at - f[0].at) / 864e5 / 365), 0);
const turns = (f) => f.filter((x, i) => i && Math.sign(x.v) !== Math.sign(f[i - 1].v)).length;
const rootCount = (f) => { let n = 0, last = xnpv(f, -0.9); for (let r = -0.899; r < 5; r += 0.001) { const y = xnpv(f, r); if (y * last < 0) n++; last = y; } return n; };
// a rate stated to one decimal holds when the schedule's XNPV changes sign across that decimal
const holds = (f, pct) => xnpv(f, (pct - 0.05) / 100) * xnpv(f, (pct + 0.05) / 100) <= 0;
const rateOf = (t) => Number(t.replace('−', '-').replace('+', ''));
const returnRow = (t) => (t.match(/Money-weighted return([^]*?)(?:In your accounts|What built this position)/) || [])[1];
// A date Claude could not read is absent on the three steps too, and Ready still shows it.
const unreadSteps = ({ each, has, lacks }) => {
  for (const s of ['b-check-2', 'b-check-3', 'b-duplicate']) {
    each({ journey: 'holdings', screen: s, state: 'abstention' }, (v, at) => { lacks(v.text, /22 Oct|Sold 10 AstraZeneca[^]{0,80}Confirmed/, `${s} ${at.surface}: a date that was not read`); has(v.text, /Sold 10 AstraZeneca Date not read/, `${s} ${at.surface}: not said`); });
    each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => has(v.text, /Sold 10 AstraZeneca 22 Oct[^]{0,80}Confirmed/, `${s} ${at.surface}: Ready lost the confirmed group`));
  }
};
// Offline and out of date, no group on the three steps can be pressed, and the groups answered so far stay ticked.
const stepTicks = ({ each, must }) => {
  for (const [s, n] of [['b-check-2', 2], ['b-check-3', 3], ['b-duplicate', 3]]) {
    each({ journey: 'holdings', screen: s, state: ['stale', 'offline'] }, (v, at) => {
      const ticks = buttons(v.html).filter((b) => /role="checkbox"/.test(b.attrs));
      must(ticks.length === 5 && ticks.every((b) => b.off), `${s} ${at.surface} ${at.state}: a tick stays live`);
      must(ticks.filter((b) => /aria-checked="true"/.test(b.attrs)).length === n, `${s} ${at.surface} ${at.state}: ${n} groups should be ticked`);
    });
    each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => must(buttons(v.html).some((b) => /role="checkbox"/.test(b.attrs) && /aria-checked="true"/.test(b.attrs) && !b.off), `${s} ${at.surface}: Ready lost its live tick`));
  }
};
// The masked views draw the import card, so the sentence sits on that card.
const maskedTrade = ({ each, has }) => {
  for (const s of ['a-private', 'b-private']) each({ journey: 'holdings', screen: s, state: ['default', 'loading', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'] }, (v, at) => has(v.html.slice(v.html.lastIndexOf('What will change')), SENTENCE, `${s} ${at.surface} ${at.state}: the import card has no sentence`));
};
// Each flip pair draws the same entries in the same order: name, date, status, action and line.
const entriesAgree = ({ view, must }) => {
  const same = (a, b, at) => {
    must(a.length && a.length === b.length, `${at}: ${a.length} entries against ${b.length}`);
    a.forEach((e, i) => { for (const k of ['name', 'when', 'status', 'mark', 'act', 'line']) must(e[k] === b[i][k], `${at}: entry ${i + 1}, ${k}: "${e[k]}" against "${b[i][k]}"`); });
  };
  for (const surface of ALL_SURFACES) for (const state of STAGES) {
    const at = `${surface} ${state}`, line = entriesOf(view('journal', 'a', 'a-list', surface, state).html), b = view('journal', 'b', 'b-board', surface, state).html;
    must(line.map(dated).join() === TIMELINE.join(), `${at}: the timeline reads ${line.map(dated).join(', ')}`);
    const pick = (ds) => ds.map((d) => line.find((e) => dated(e) === d));
    same(pick(WAIT), entriesOf(laneOf(b, 'Waiting')), `${at} Waiting`);
    same(pick(SCORE), entriesOf(laneOf(b, 'Scored')), `${at} Scored`);
    const a2 = entriesOf(view('journal', 'a', 'a-differ', surface, state).html), b2 = view('journal', 'b', 'b-differ', surface, state).html;
    same(a2, PHONES.includes(surface) ? entriesOf(b2) : rowsOf(b2), `${at} differed`);
  }
};

export default {
  'R1-j1': ({ view, each, screens, must, has }) => {
    must(screens('holdings', 'b').includes('b-imports'), 'Option B has no Imports place');
    each({ journey: 'holdings', option: 'b', screen: 'b-imports', state: 'default' }, (v, at) => {
      for (const t of [/Earlier imports/, /Open work/, /Open the difference/, /Your records/, /Stocks ISA/, /General account/, /India demat/]) has(v.text, t, `${at.surface}: no ${t} in Imports`);
      must(backTo(v, 'Settings'), `${at.surface}: Imports does not lead back to Settings`);
    });
    for (const s of ['b-add', 'b-manual', 'b-check', 'b-approve', 'b-live', 'b-done']) each({ journey: 'holdings', option: 'b', screen: s, state: 'default' }, (v, at) => must(backTo(v, 'Imports'), `${s} on ${at.surface} does not lead back to Imports`));
    each({ journey: 'holdings', option: 'b', screen: 'b-accounts', state: 'default' }, (v, at) => must(v.html.includes('holdings-link') && /Imports/.test(v.text), `${at.surface}: no way into Imports from the accounts`));
    each({ journey: 'holdings', option: 'a', screen: 'a-imports', state: 'default' }, (v, at) => must(backTo(v, 'Settings'), `${at.surface}: Imports must read back Settings`));
  },
  'R1-j2': ({ each, has, lacks, must }) => {
    each({ journey: 'holdings', screen: 'a-list', state: 'default' }, (v, at) => {
      has(v.text, /HSBC last priced 14:10/, `${at.surface}: Ready does not say how HSBC is treated`);
      has(v.text, /Proposed · FIN-OD-06/, `${at.surface}: the freshness limit is not labelled proposed`);
      has(v.text, /84,612/, `${at.surface}: HSBC should stay in the total`);
      lacks(v.text, /Stale|16:35 ·|Price 16:35/, `${at.surface}: Ready calls HSBC stale`);
    });
    each({ journey: 'holdings', screen: 'b-accounts', state: 'default' }, (v, at) => { has(v.text, /Late · 14:10/, `${at.surface}: HSBC is not late`); has(v.text, /Proposed · FIN-OD-06/, `${at.surface}: no label`); });
    for (const s of ['a-list', 'b-accounts']) each({ journey: 'holdings', screen: s, state: 'stale' }, (v, at) => {
      has(v.text, /78,508/, `${s} ${at.surface}: no known subtotal`);
      has(v.text, /6 of 7 priced/, `${s} ${at.surface}: no count`);
      has(v.text, /until its price returns/, `${s} ${at.surface}: wrong recovery`);
      lacks(v.text, /AstraZeneca[^.]{0,30}stale|Yahoo is delayed/, `${s} ${at.surface}: more than HSBC is stale`);
    });
    each({ journey: 'holdings', screen: 'a-one', state: 'stale' }, (v, at) => { lacks(v.text, /16:35/, `${at.surface}: 16:35 must mean only the UK close`); has(v.text, /Last price 14:10/, `${at.surface}: wrong stale time`); });
    each({ journey: 'holdings', screen: 'a-one', state: 'abstention' }, (v, at) => { lacks(v.text, /Priced [\d:]+, Twelve Data/, `${at.surface}: AstraZeneca is a Yahoo listing`); has(v.text, /Priced 16:35, Yahoo/, `${at.surface}: wrong price time`); });
    each({ journey: 'holdings', screen: 'a-one', state: 'disagreement' }, (v, at) => has(v.text, /Priced 10:00, Yahoo/, `${at.surface}: Reliance closes at 10:00`));
    each({ journey: 'holdings', state: 'error' }, (v, at) => lacks(v.text, /20:45/, `${at.screen} ${at.surface}: 20:45 in Error`));
    for (const s of ['a-one', 'b-one']) each({ journey: 'holdings', screen: s, state: 'error' }, (v, at) => { has(v.text, /Last good run Mon 21:15/, `${s} ${at.surface}: no last good run`); lacks(v.text, /As of 21:15 London/, `${s} ${at.surface}: two versions on one screen`); });
    each({ journey: 'journal', state: 'error' }, (v, at) => lacks(v.text, /20:45/, `${at.screen} ${at.surface}: 20:45 in Error`));
    must(true);
  },
  'R1-j3': ({ each, has }) => {
    for (const journey of ['holdings', 'journal']) each({ journey }, (v, at) => { if (/class="badge b-/.test(v.html)) has(v.text, /Decision support/, `${journey} ${at.option} ${at.screen} ${at.surface} ${at.state}: a ranked action with no "Decision support"`); });
  },
  'R1-j4': ({ each, has, lacks, must, view }) => {
    each({ journey: 'journal' }, (v, at) => {
      lacks(v.text, /ranked weight|ranked trim|10\.0%|P-3|P-2/, `${at.screen} ${at.surface} ${at.state}: a target size or a second policy`);
      lacks(v.html, /growth 87/, `${at.screen} ${at.surface}: Growth 87`);
    });
    each({ journey: 'journal', screen: 'a-record', state: 'default' }, (v, at) => {
      has(v.text, /If it were 10% smaller/, `${at.surface}: no shared counterfactual`);
      has(v.text, /13\.5% → 12\.1%/, `${at.surface}: wrong NVIDIA share`);
      has(v.text, /31\.0% → 29\.6%/, `${at.surface}: wrong US tech share`);
      has(v.text, /24\.7 → 24\.0 pts/, `${at.surface}: wrong range width`);
      has(v.text, /Policy v1/, `${at.surface}: wrong policy`);
      has(v.text, /score 71/, `${at.surface}: no score`);
      must(/growth 88, protection 52, opportunity 78/.test(v.html), `${at.surface}: wrong parts`);
    });
    must(/Policy v1/.test(view('journal', 'a', 'a-one', 'web', 'default').text), 'the frozen entry names another policy');
  },
  'R1-j5': ({ screens, each, must, has, lacks }) => {
    const need = { a: ['a-manual', 'a-edit', 'a-rebuild'], b: ['b-manual', 'b-edit', 'b-rebuild'] };
    for (const [o, ids] of Object.entries(need)) for (const s of ids) {
      must(screens('holdings', o).includes(s), `no ${s}`);
      each({ journey: 'holdings', screen: s, state: 'noModel' }, (v, at) => has(v.text, /Claude stays off until credit is verified or you approve paid use, in Settings, with a fresh sign-in\./, `${s} ${at.surface}: No model is not drawn`));
    }
    for (const m of ['a-manual', 'b-manual']) {
      each({ journey: 'holdings', screen: m, state: 'default' }, (v, at) => { has(v.text, /Add to preview/, `${at.surface}: no way into preview`); must(/<input/.test(v.html), `${at.surface}: no fields`); });
      each({ journey: 'holdings', screen: m, state: 'error' }, (v, at) => { has(v.text, /Refused: the currency is missing/, `${at.surface}: no named refusal`); must(v.html.includes('aria-invalid="true"'), `${at.surface}: the field is not marked`); });
      each({ journey: 'holdings', screen: m, state: 'stale' }, (v, at) => has(v.text, /Resumed, and out of date/, `${at.surface}: no resume`));
      each({ journey: 'holdings', screen: m, state: 'abstention' }, (v, at) => has(v.text, /No purchase is invented/, `${at.surface}: no snapshot`));
    }
    for (const m of ['a-edit', 'b-edit']) {
      each({ journey: 'holdings', screen: m, state: 'default' }, (v, at) => { has(v.text, /Exclude group/, `${at.surface}: no exclude`); has(v.text, /Save as revision 5/, `${at.surface}: no save`); });
      each({ journey: 'holdings', screen: m, state: 'empty' }, (v, at) => has(v.text, /Group excluded, at revision 5/, `${at.surface}: no excluded result`));
      each({ journey: 'holdings', screen: m, state: 'error' }, (v, at) => has(v.text, /Refused: a group goes whole/, `${at.surface}: no refusal`));
    }
    each({ journey: 'holdings', screen: 'a-preview', state: 'default' }, (v, at) => has(v.text, /Exclude group/, `${at.surface}: the preview has no exclude`));
    for (const m of ['a-rebuild', 'b-rebuild']) each({ journey: 'holdings', screen: m, state: 'disagreement' }, (v, at) => { has(v.text, /4,200 units, kept/, `${m} ${at.surface}: the baseline retires while it cannot`); lacks(v.text, /1 → 2/, `${m} ${at.surface}: a new generation with a difference open`); });
    for (const m of ['a-rebuild', 'b-rebuild']) each({ journey: 'holdings', screen: m, state: 'default' }, (v, at) => {
      for (const t of [/Rebuild proposal ready/, /4,200, not 8,400/, /Reconciliation/, /Cost basis/, /Return/, /keep their original inputs/]) has(v.text, t, `${m} ${at.surface}: no ${t}`);
    });
  },
  'R1-j6': ({ screens, each, has, lacks, must, view }) => {
    for (const s of ['b-check-2', 'b-check-3', 'b-duplicate', 'b-rows']) must(screens('holdings', 'b').includes(s), `no ${s}`);
    each({ journey: 'holdings', screen: 'b-check-2', state: 'default' }, (v, at) => { must(v.html.includes('role="radiogroup"') && v.html.includes('role="radio"'), `${at.surface}: the listing is not a choice`); has(v.text, /question 2 of 3/, `${at.surface}: wrong step`); });
    each({ journey: 'holdings', screen: 'b-check-3', state: 'default' }, (v, at) => { has(v.text, /question 3 of 3/, `${at.surface}: wrong step`); has(v.text, /From outside/, `${at.surface}: no answer`); has(v.text, /Leave it pending/, `${at.surface}: no way to wait`); });
    each({ journey: 'holdings', screen: 'b-duplicate', state: 'default' }, (v, at) => has(v.text, /Keep it anyway/, `${at.surface}: no decision`));
    each({ journey: 'holdings', screen: 'b-rows', state: 'default' }, (v, at) => must(countOf(v.html, /<span>(Trade|Fee|Cash|Dividend|Transfer in)<\/span>/g) === 11, `${at.surface}: not every row`));
    lacks(view('holdings', 'b', 'b-check').note, /duplicate or unclear listing becomes one question/, 'the note still counts a duplicate as a question');
    has(view('holdings', 'b', 'b-approve').note, /transfer is left pending/, 'the approval note says all three were answered');
  },
  'R1-j7': ({ each, has, lacks }) => {
    each({ journey: 'holdings', screen: 'a-list', state: 'abstention' }, (v, at) => { lacks(v.text, /value and return stand|\+6\.4%/, `${at.surface}: AstraZeneca still has a return`); has(v.text, /Nonconvergent/, `${at.surface}: no status`); });
    each({ journey: 'holdings', screen: 'a-list', surface: WIDE, state: 'abstention' }, (v, at) => { lacks(v.text, /AstraZeneca[^]{0,60}Two rates/, `${at.surface}: the table calls it two rates`); has(v.text, /No rate/, `${at.surface}: the table has no status`); });
    for (const s of ['a-list', 'b-accounts']) {
      each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => { for (const t of ['Value: 7 of 7', 'Cost basis: 6 of 7', 'Gain: 6 of 7', 'Return: 4 of 7']) has(v.html, new RegExp(`${t} holdings`), `${s} ${at.surface}: wrong coverage, no ${t}`); });
      each({ journey: 'holdings', screen: s, state: 'stale' }, (v, at) => { for (const t of ['Value: 6 of 7', 'Cost basis: 6 of 7', 'Gain: 5 of 7', 'Return: 3 of 7']) has(v.html, new RegExp(`${t} holdings`), `${s} ${at.surface}: wrong stale coverage, no ${t}`); });
    }
  },
  'R1-j8': ({ each, has, lacks, must }) => {
    for (const s of ['a-one', 'b-one']) {
      each({ journey: 'holdings', screen: s, state: 'disagreement' }, (v, at) => { lacks(v.text, /General account, Q3|ISA statement/, `${s} ${at.surface}: Reliance is held only in India demat`); has(v.text, /India demat, September/, `${s} ${at.surface}: no source`); });
      for (const st of ['stale', 'abstention']) each({ journey: 'holdings', screen: s, state: st }, (v, at) => { lacks(v.text, /General account, Q3/, `${s} ${st} ${at.surface}: held only in the ISA`); has(v.text, /ISA statement, September/, `${s} ${at.surface}: no source`); });
    }
    each({ journey: 'holdings', screen: 'b-one', state: 'disagreement' }, (v, at) => { has(v.text, /Sold 80/, `${at.surface}: an ambiguous rate needs flows both ways`); lacks(v.text, /Opening position/, `${at.surface}: one event`); });
    each({ journey: 'holdings', screen: 'b-one', state: 'stale' }, (v, at) => must(countOf(v.text, /Bought \d+/g) >= 2, `${at.surface}: one event behind a rate`));
    // default Apple, stale HSBC, disagreement Reliance, abstaining AstraZeneca: the units and cost of what built each one add to what it shows
    for (const state of ['default', 'stale', 'disagreement', 'abstention']) each({ journey: 'holdings', screen: 'b-one', state }, (v, at) => {
      const ev = [...v.text.matchAll(/(Bought|Sold) (\d+) (\d{1,2} \w{3} \d{4}) ·(?: [^£·]+ ·)? £([\d,.]+)/g)].map((m) => ({ buy: m[1] === 'Bought', u: Number(m[2]), at: Date.parse(m[3]), v: num(m[4]) })).sort((a, b) => a.at - b.at);
      const units = (v.text.match(/· ([\d,]+) units/) || [])[1], basis = (v.text.match(/Cost basis £([\d,.]+)/) || [])[1];
      must(ev.length >= 2 && units && basis, `${state} ${at.surface}: no events, units or basis to add up`);
      const lots = [];
      for (const e of ev) {
        if (e.buy) { lots.push({ u: e.u, each: e.v / e.u }); continue; }
        let left = e.u;
        while (left > 0) { must(lots.length, `${state} ${at.surface}: sold more than was bought`); const l = lots[0], t = Math.min(l.u, left); l.u -= t; left -= t; if (!l.u) lots.shift(); }
      }
      const held = lots.reduce((a, l) => a + l.u, 0), cost = pounds(lots.reduce((a, l) => a + l.u * l.each, 0), 0);
      must(held === num(units), `${state} ${at.surface}: events add to ${held} of ${units} units`);
      must(cost === num(basis), `${state} ${at.surface}: events cost ${cost}, against a basis of ${basis}`);
    });
  },
  'R1-j9': ({ each, has, lacks }) => {
    for (const s of ['a-one', 'b-one']) each({ journey: 'journal', screen: s, state: 'default' }, (v, at) => { has(v.text, /R2-HGB v2/, `${s} ${at.surface}: the entry cites today's model`); has(v.text, /The model today/, `${s} ${at.surface}: the proof is not labelled`); });
    for (const s of ['a-record', 'a-pick', 'a-list', 'a-one', 'b-decide', 'b-one']) each({ journey: 'journal', screen: s, state: 'noModel' }, (v, at) => lacks(v.text, /Approved 1 Oct 2026/, `${s} ${at.surface}: proof of an approved model under No model`));
  },
  'R1-j10': ({ each, has, lacks }) => {
    each({ journey: 'journal', screen: 'a-record', state: 'abstention' }, (v, at) => { has(v.text, /nothing to record against/, `${at.surface}: wrong rule`); has(v.text, /Proposed · MP-158/, `${at.surface}: not named`); });
    each({ journey: 'journal', screen: 'a-list', state: 'abstention' }, (v, at) => { has(v.text, /abstains on AstraZeneca/, `${at.surface}: wrong holding`); lacks(v.text, /abstained on Apple|No range to score/, `${at.surface}: an entry against an abstention`); has(v.text, /Proposed · MP-158/, `${at.surface}: not named`); });
    for (const s of ['a-one', 'b-one']) each({ journey: 'journal', screen: s, state: 'abstention' }, (v, at) => { has(v.text, /abstains on AstraZeneca today/, `${s} ${at.surface}: wrong holding`); lacks(v.text, /NVIDIA|No range to score/, `${s} ${at.surface}: another entry`); has(v.text, /Proposed · MP-158/, `${s} ${at.surface}: not named`); has(v.text, /14\.0 points/, `${s} ${at.surface}: no outcome`); });
  },
  'R1-j11': ({ each, has, lacks }) => {
    for (const s of ['a-imports', 'a-preview', 'b-add', 'b-check', 'b-imports']) each({ journey: 'holdings', screen: s, state: 'noModel' }, (v, at) => {
      lacks(v.text, /new budget|renews|budget renews/, `${s} ${at.surface}: the old promise`);
      has(v.text, /Claude stays off until credit is verified or you approve paid use, in Settings, with a fresh sign-in\./, `${s} ${at.surface}: not the one sentence`);
    });
  },
  'R1-j12': ({ each, has, lacks }) => {
    for (const s of ['a-imports', 'b-imports', 'b-add']) each({ journey: 'holdings', screen: s, state: 'abstention' }, (v, at) => { lacks(v.text, /2 fields/, `${s} ${at.surface}: a second count`); has(v.text, /1 field/, `${s} ${at.surface}: no count`); });
  },
  'R1-j13': ({ each, has, lacks, must }) => {
    each({ journey: 'holdings', screen: 'a-list', state: 'disagreement' }, (v, at) => has(v.text, /Baseline/, `${at.surface}: "both show" with one figure`));
    each({ journey: 'holdings', screen: 'a-list', surface: WIDE, state: 'disagreement' }, (v, at) => { has(v.text, /Baseline −2\.4%/, `${at.surface}: no baseline`); has(v.text, /R2-HGB v3 \+7\.4%/, `${at.surface}: no model`); has(v.text, /Differ · 6M/, `${at.surface}: not at 6 months`); });
    each({ journey: 'holdings', screen: 'b-accounts', state: 'disagreement' }, (v, at) => { has(v.text, /Baseline −2\.4%/, `${at.surface}: no baseline`); has(v.text, /R2-HGB v3 \+7\.4%/, `${at.surface}: no model`); });
    for (const s of ['a-one', 'b-one']) each({ journey: 'holdings', screen: s, state: 'disagreement' }, (v, at) => { has(v.text, /6-month forecast · RELIANCE/, `${s} ${at.surface}: not at 6 months`); has(v.text, /Pause · moderate/, `${s} ${at.surface}: the rules' side is missing`); });
    for (const [journey, ids] of [['holdings', ['a-list', 'b-accounts', 'a-one', 'b-one']], ['journal', ['a-record', 'a-pick', 'b-board', 'b-decide']]]) for (const s of ids) each({ journey, screen: s, state: 'disagreement' }, (v, at) => lacks(v.text, /Differ · 3M|3-month forecast · RELIANCE|Reliance · 3 months|At 3 months|Ranked today · 3 months|−1\.5%|\+2\.8%/, `${s} ${at.surface}: Reliance splits at 6 months, not 3`));
    for (const s of ['a-record', 'b-decide']) each({ journey: 'journal', screen: s, state: 'disagreement' }, (v, at) => must(v.html.includes('journal-split'), `${s} ${at.surface}: both are not drawn`));
    each({ journey: 'journal', screen: 'b-board', state: 'disagreement' }, (v, at) => { lacks(v.text, /next page/, `${at.surface}: two places`); has(v.text, /baseline −2\.4%, R2-HGB v3 \+7\.4%/, `${at.surface}: the card has no figures`); });
  },
  'R1-j14': ({ each, has, lacks }) => {
    each({ journey: 'holdings', screen: 'b-done', state: 'disagreement' }, (v, at) => { has(v.text, /Reversal refused/, `${at.surface}: no refusal`); lacks(v.text, /Review and approve/, `${at.surface}: approve under a refusal`); has(v.text, /Review both together/, `${at.surface}: no joint review`); });
    for (const s of ['a-done', 'b-done']) each({ journey: 'holdings', screen: s, state: 'stale' }, (v, at) => { has(v.html, /disabled>Review and approve/, `${s} ${at.surface}: approve stays live`); has(v.text, /Refresh/, `${s} ${at.surface}: no refresh`); });
  },
  'R1-j15': ({ each, must }) => {
    for (const s of ['a-preview', 'b-check', 'b-rows', 'a-done', 'b-done']) each({ journey: 'holdings', screen: s, state: 'disagreement' }, (v, at) => {
      const stmt = (v.text.match(/Closing cash on the statement £([\d,.]+)/) || [])[1], rows = (v.text.match(/with the £500\.00 transfer £([\d,.]+)/) || [])[1], gap = (v.text.match(/Difference, cash £([\d,.]+)/) || [])[1], head = (v.text.match(/Statement and rows differ by £([\d,.]+)/) || [])[1];
      must(stmt === '4,630.43', `${s} ${at.surface}: wrong statement figure ${stmt}`);
      must(rows === '4,642.83', `${s} ${at.surface}: wrong rows figure ${rows}`);
      must(gap === head && num(gap) === pounds(num(rows), num(stmt)), `${s} ${at.surface}: the heading ${head}, the row ${gap} and the two figures disagree`);
    });
  },
  'R1-j16': ({ screens, each, has, must }) => {
    for (const [o, ids] of Object.entries({ a: ['a-difference', 'a-live'], b: ['b-difference', 'b-live'] })) for (const s of ids) must(screens('holdings', o).includes(s), `no ${s}`);
    for (const s of ['a-difference', 'b-difference']) {
      each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => { has(v.text, /Resolve it, with a reason/, `${at.surface}: no control`); must(/Your reason/.test(v.text) && /Source/.test(v.text), `${at.surface}: no reason and source`); has(v.text, /Keep it open/, `${at.surface}: nowhere to keep it open`); });
      each({ journey: 'holdings', screen: s, state: 'empty' }, (v, at) => has(v.text, /Resolved by you/, `${at.surface}: no resolved state`));
    }
    for (const s of ['a-live', 'b-live']) {
      each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => has(v.text, /Revoke approval/, `${at.surface}: no control`));
      each({ journey: 'holdings', screen: s, state: 'empty' }, (v, at) => has(v.text, /Approval revoked/, `${at.surface}: no revoked state`));
    }
    for (const s of ['a-preview', 'b-check', 'b-rows', 'a-done', 'b-done']) each({ journey: 'holdings', screen: s, state: 'disagreement' }, (v, at) => must(drawnBtn(v.html, 'Keep it open, with a reason'), `${s} ${at.surface}: the difference stays open with no reason`));
  },
  'R1-j17': ({ each, has, lacks, screens, must }) => {
    const ids = importScreens(screens);
    must(ids.length >= 20, `only ${ids.length} import screens`);
    for (const [option, s] of ids) each({ journey: 'holdings', option, screen: s, state: ['error', 'stale'] }, (v, at) => lacks(v.text, /Twelve Data · error|HSBC stale/, `${s} ${at.surface} ${at.state}: a price chip on a screen not about prices`));
    each({ journey: 'journal', state: 'error' }, (v, at) => lacks(v.text, /Twelve Data · error/, `${at.screen} ${at.surface}: a price chip on a read or save failure`));
    each({ journey: 'holdings', screen: 'a-list', state: 'error' }, (v, at) => has(v.text, /Twelve Data · error/, `${at.surface}: a screen of prices lost its error chip`));
  },
  'R1-j18': ({ each, has }) => {
    for (const journey of ['holdings', 'journal']) each({ journey, surface: ALL_SURFACES, state: 'offline' }, (v, at) => has(v.text, /Proposed · MP40-Q12/, `${journey} ${at.option} ${at.screen} ${at.surface}: an offline copy with no label`));
  },
  'R1-j19': ({ each, has, lacks, screens, must }) => {
    each({ journey: 'holdings', screen: 'a-list', surface: 'pwa', state: 'default' }, (v) => must(v.html.includes('Hide amounts'), 'phone web has no Hide amounts'));
    for (const s of ['a-imports', 'a-preview', 'a-done', 'b-imports', 'b-check', 'b-done']) each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => must(v.html.includes('aria-label="Hide amounts"'), `${s} ${at.surface}: no eye`));
    must(screens('holdings', 'a').includes('a-private') && screens('holdings', 'b').includes('b-private'), 'no masked view');
    for (const s of ['a-private', 'b-private']) {
      each({ journey: 'holdings', screen: s, state: ['default', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'] }, (v, at) => {
        lacks(v.text, /£\d/, `${s} ${at.surface} ${at.state}: money shows`);
        has(v.text, /••••/, `${s} ${at.surface}: nothing is masked`);
        has(v.text, /\d%/, `${s} ${at.surface}: percentages must stay`);
      });
      each({ journey: 'holdings', screen: s, state: 'default', surface: WIDE }, (v, at) => has(v.text, /Imports ·/, `${s} ${at.surface}: the import view is not masked`));
      each({ journey: 'holdings', screen: s, state: 'error' }, (v, at) => { has(v.text, /Permission denied/, `${s} ${at.surface}: no denied state`); lacks(v.text, /£\d|••••/, `${s} ${at.surface}: a figure from a refused read`); });
      each({ journey: 'holdings', screen: s, state: ['loading', 'empty'] }, (v, at) => lacks(v.text, /£\d/, `${s} ${at.surface} ${at.state}: money shows`));
    }
  },
  'R1-j20': ({ each, has, lacks }) => {
    for (const s of ['a-one', 'b-one']) each({ journey: 'holdings', screen: s, state: ['default', 'empty'] }, (v, at) => { has(v.text, /Protection leads/, `${s} ${at.surface}: a badge with no reason`); has(v.text, /Policy v1/, `${s} ${at.surface}: no policy`); });
    for (const s of ['a-list', 'b-accounts']) each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => { has(v.text, /Not held, to watch/, `${s} ${at.surface}: no candidate`); has(v.text, /Watch/, `${s} ${at.surface}: no action`); });
    for (const s of ['a-list', 'b-accounts', 'a-private', 'b-private']) each({ journey: 'holdings', screen: s, state: 'noModel' }, (v, at) => lacks(v.text, /Not held, to watch|MSFT/, `${s} ${at.surface}: a candidate range with no model`));
  },
  'R1-j22': ({ each, has, screens, must }) => {
    each({ journey: 'journal', screen: 'a-record', state: 'default' }, (v, at) => { has(v.text, /What you did, at your broker/, `${at.surface}: no field`); has(v.text, /Kept all 60 units/, `${at.surface}: no figure`); });
    each({ journey: 'journal', screen: 'b-decide', state: 'default' }, (v, at) => {
      has(v.text, /How much, in your words/, `${at.surface}: no field`);
      must(/aria-pressed="true"[^>]*>(?:<[^>]+>)*I chose not to/.test(v.html), `${at.surface}: B records the case as I acted`);
      const did = v.html.split('How much')[0].split('What you did, at your broker')[1];
      must(did && did.includes('journal-pick'), `${at.surface}: the picks are not where this check looks`);
      must(!/journal-pick[^]*aria-pressed="true"/.test(did), `${at.surface}: B marks an action it did not take`);
    });
    must(screens('journal', 'a').includes('a-pick'), 'Record a decision leads nowhere');
    each({ journey: 'journal', screen: 'a-pick', state: 'default' }, (v, at) => has(v.text, /Reliance/, `${at.surface}: no open action`));
    each({ journey: 'journal', screen: 'a-pick', state: 'empty' }, (v, at) => has(v.text, /No ranked action is open/, `${at.surface}: no empty path`));
    each({ journey: 'journal', screen: 'a-pick', surface: PHONES, state: 'default' }, (v, at) => must(v.html.includes('role="button"'), `${at.surface}: the rows are not controls`));
  },
  'R1-j25': ({ each, has, lacks }) => {
    for (const s of ['a-imports', 'b-imports']) each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => { has(v.text, /as of revision 213/, `${s} ${at.surface}: wrong export revision`); has(v.text, /Dec 2024 statement, in Dec 2026/, `${s} ${at.surface}: wrong renewal`); lacks(v.text, /12 Sep 2028/, `${s} ${at.surface}: old date`); });
    each({ journey: 'holdings', screen: 'a-done', state: 'default' }, (v, at) => has(v.text, /213 → 214/, `${at.surface}: wrong revision`));
    each({ journey: 'holdings', screen: 'a-approve', state: 'default' }, (v, at) => has(v.text, /Ledger revision 213/, `${at.surface}: wrong bound revision`));
    each({ journey: 'holdings', screen: 'a-done', state: 'default' }, (v, at) => has(v.text, /Original kept to Oct 2028/, `${at.surface}: wrong retention`));
  },

  // ---------- round 2 ----------
  // R2-j1 itself is in flip.mjs. This walks every import screen, so a new one is covered, and proves the receipt and the masked view still flip.
  'R2-j1-screens': ({ each, must, screens }) => {
    const turn = (v) => /data-flip=/.test(v.html);
    const keep = ['a-imports', 'b-imports', 'a-done', 'b-done'];
    for (const [option, s] of importScreens(screens).filter(([, id]) => !keep.includes(id))) each({ journey: 'holdings', option, screen: s }, (v, at) => must(!turn(v), `${s} ${at.surface} ${at.state}: a flip on a record, a draft, a proposal or an approval`));
    for (const s of ['a-done', 'b-done']) {
      each({ journey: 'holdings', screen: s, state: ['loading', 'error', 'offline'] }, (v, at) => must(!turn(v), `${s} ${at.surface} ${at.state}: a flip while a commit is in flight or unknown`));
      each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => must(turn(v), `${s} ${at.surface}: the receipt lost its flip`));
    }
    for (const s of ['a-private', 'b-private']) {
      each({ journey: 'holdings', screen: s, state: 'error' }, (v, at) => must(!turn(v), `${s} ${at.surface}: a flip on a refused read`));
      each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => must(turn(v), `${s} ${at.surface}: the masked view lost its flip`));
    }
  },
  // One journal: the same entries, counts and tallies on both sides of every flip, in every state, on phones too. NVIDIA today is recorded, so it is not open.
  'R2-j2': (api) => {
    const { each, view, must, has, lacks } = api;
    entriesAgree(api);
    for (const surface of ALL_SURFACES) for (const state of STAGES) {
      const a = view('journal', 'a', 'a-list', surface, state), b = view('journal', 'b', 'b-board', surface, state), at = `${surface} ${state}`;
      must(countOf(a.html, /class="journal-e"/g) === 7, `${at}: the timeline holds ${countOf(a.html, /class="journal-e"/g)} of 7`);
      must(countOf(b.html, /class="journal-e lane" data-mo="rise"/g) === 7, `${at}: the lanes hold ${countOf(b.html, /class="journal-e lane" data-mo="rise"/g)} of 7`);
      has(b.text, /3 for a horizon, 1 unresolved/, `${at}: the Waiting lane`); has(b.text, /Scored 3 of 7/, `${at}: the Scored lane`);
      has(b.text, state === 'noModel' ? /To decide None ranked/ : /To decide 1/, `${at}: the To decide count`);
      for (const v of [a, b]) {
        has(v.text, /1 entry recorded\. 1 outcome matured last week: NVIDIA, inside its range\. Next outcome: Apple, 12 Nov\./, `${at}: the wrap-up differs`);
        has(v.text, /4 times in 7 decisions\. 3 have scored so far/, `${at}: the count of differences`);
      }
      lacks(b.html, /<b>NVIDIA<\/b><span>Ranked today/, `${at}: NVIDIA is recorded, not open`);
      lacks(view('journal', 'a', 'a-pick', surface, state).text, /NVIDIA/, `${at}: NVIDIA is recorded, not open`);
      if (state !== 'noModel') must(countOf(b.html, /[Rr]anked today/g) === 1, `${at}: To decide holds ${countOf(b.html, /[Rr]anked today/g)}`);
    }
    for (const surface of ALL_SURFACES) for (const state of ['default', 'loading', 'stale', 'offline', 'disagreement', 'abstention', 'error']) {
      const a = view('journal', 'a', 'a-differ', surface, state), b = view('journal', 'b', 'b-differ', surface, state), at = `${surface} ${state}`;
      for (const v of [a, b]) { has(v.text, /You followed 3/, `${at}: followed`); has(v.text, /You differed 4/, `${at}: differed`); has(v.text, /3 scored · 1 waiting/, `${at}: the tally`); lacks(v.text, /of 6|All 6|Differed 3|of your 6/, `${at}: a journal of six`); }
      has(b.text, /All 7/, `${at}: B's filter`); has(b.text, /Differed 4/, `${at}: B's filter`);
      if (state !== 'loading') { for (const v of [a, b]) { has(v.text, /NVIDIA|NVDA/, `${at}: an entry is missing`); has(v.text, /Today/, `${at}: today's entry is missing`); } }
      for (const v of [a, b]) has(v.text, /Of the 3 scored, 2 landed inside their 80% range and 1 outside/, `${at}: how the forecasts did`);
    }
    for (const s of ['a-differ', 'b-differ']) each({ journey: 'journal', screen: s, state: 'abstention' }, (v, at) => has(v.text, /Only 3 of your 7 decisions/, `${s} ${at.surface}: the count`));
  },
  // The one sentence on every import screen and import card, in every state, on every surface. The form no longer sends anything.
  'R2-j3': (api) => {
    const { each, has, lacks, screens, must } = api;
    maskedTrade(api);
    const ids = importScreens(screens);
    must(ids.length >= 20, `only ${ids.length} import screens`);
    for (const [option, s] of ids) each({ journey: 'holdings', option, screen: s }, (v, at) => { has(v.text, SENTENCE, `${s} ${at.surface} ${at.state}: not the one sentence`); lacks(v.text, /Send to preview/, `${s} ${at.surface}: reads as an order`); });
    for (const s of ['a-manual', 'b-manual']) each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => must(liveBtn(v.html, 'Add to preview'), `${s} ${at.surface}: no way on`));
    for (const s of ['a-approve', 'b-approve']) each({ journey: 'holdings', screen: s }, (v, at) => has(v.html.slice(Math.max(0, v.html.indexOf('class="sheet"'))), SENTENCE, `${s} ${at.surface} ${at.state}: the sheet does not carry it`));
  },
  // No "Reconciled" beside an open difference, anywhere it can be drawn.
  'R2-j4': ({ each, has, lacks }) => {
    each({ journey: 'holdings' }, (v, at) => lacks(v.text, /\breconciled\b(?! again)/i, `${at.screen} ${at.surface} ${at.state}: reconciled, with a difference open`));
    each({ journey: 'holdings', screen: 'b-accounts', state: 'default' }, (v, at) => has(v.text, /Difference open, £8\.15/, `${at.surface}: the account hides it`));
    each({ journey: 'holdings', screen: 'b-private', state: 'default' }, (v, at) => has(v.text, /Difference open/, `${at.surface}: the masked account hides it`));
    each({ journey: 'holdings', screen: 'b-imports', state: 'default' }, (v, at) => has(v.text, /Difference open, £8\.15/, `${at.surface}: the account row hides it`));
    each({ journey: 'holdings', screen: 'a-list', state: 'default' }, (v, at) => { has(v.text, /1 difference open/, `${at.surface}: the other side of the flip hides it`); has(v.text, /cash differs by £8\.15/, `${at.surface}: no figure`); });
  },
  // A date Claude could not read is absent everywhere, not only on the preview.
  'R2-j5': (api) => {
    const { each, has, lacks } = api;
    unreadSteps(api);
    for (const s of ['a-preview', 'a-edit', 'b-edit', 'b-check', 'b-rows', 'a-approve', 'b-approve']) each({ journey: 'holdings', screen: s, state: 'abstention' }, (v, at) => { lacks(v.text, /22 Oct/, `${s} ${at.surface}: a date that was not read`); has(v.text, /Date not read/, `${s} ${at.surface}: not said`); });
    for (const s of ['a-edit', 'b-edit']) each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => has(v.text, /22 Oct/, `${s} ${at.surface}: the read date is gone`));
  },
  // Offline and out of date, nothing can be pressed, and the tick matches the rail.
  'R2-j6': (api) => {
    const { each, must, has } = api;
    stepTicks(api);
    const labels = ['Confirm £107.60', 'Edit', 'Exclude group', 'Keep it anyway', 'From outside', 'From General'];
    each({ journey: 'holdings', screen: 'a-preview', state: ['stale', 'offline'] }, (v, at) => {
      for (const t of labels) { must(drawnBtn(v.html, t), `${at.surface} ${at.state}: ${t} is gone`); must(!liveBtn(v.html, t), `${at.surface} ${at.state}: ${t} stays live`); }
      must(/role="radio"/.test(v.html) && !buttons(v.html).some((b) => /role="radio"/.test(b.attrs) && !b.off), `${at.surface} ${at.state}: a listing stays live`);
    });
    each({ journey: 'holdings', screen: 'a-preview', state: 'default' }, (v, at) => { for (const t of labels) must(liveBtn(v.html, t), `${at.surface}: ${t} is not live in Ready`); });
    for (const s of ['a-preview', 'b-check']) each({ journey: 'holdings', screen: s, state: ['stale', 'offline'] }, (v, at) => {
      const ticks = buttons(v.html).filter((b) => /role="checkbox"/.test(b.attrs));
      must(ticks.length === 5 && ticks.every((b) => b.off), `${s} ${at.surface} ${at.state}: a tick stays live`);
      must(ticks.filter((b) => /aria-checked="true"/.test(b.attrs)).length === 1, `${s} ${at.surface} ${at.state}: the ticks do not match "1 group selected"`);
      must(ticks.some((b) => /aria-checked="true"/.test(b.attrs) && /Bought 4 Apple/.test(b.attrs)), `${s} ${at.surface} ${at.state}: Apple is not the group selected`);
    });
    each({ journey: 'holdings', screen: 'b-check', state: ['stale', 'offline'] }, (v, at) => has(v.text, /1 group selected · 3 rows of 11/, `${at.surface}: no rail`));
  },
  // Uncertainty stays in view on both sides of the flip, on every device.
  'R2-j7': ({ each, has }) => {
    for (const s of ['a-list', 'b-accounts']) {
      each({ journey: 'holdings', screen: s, state: ['default', 'error', 'offline', 'noModel', 'disagreement', 'abstention', 'loading'] }, (v, at) => {
        has(v.text, /Gain on 6 of 7/, `${s} ${at.surface} ${at.state}: no gain count`);
        has(v.text, /Return on 4 of 7/, `${s} ${at.surface} ${at.state}: no return count`);
        has(v.text, /What your evidence supports/, `${s} ${at.surface} ${at.state}: no evidence card`);
        has(v.text, /No single rate is proved for Reliance, and no rate was found for AstraZeneca/, `${s} ${at.surface} ${at.state}: the gaps are hidden`);
      });
      each({ journey: 'holdings', screen: s, state: 'stale' }, (v, at) => { has(v.text, /Gain on 5 of 7/, `${s} ${at.surface}: no gain count`); has(v.text, /Return on 3 of 7/, `${s} ${at.surface}: no return count`); });
    }
  },
  // The amended outcome and both state facts on both sides; one banner, not two stories.
  'R2-j8': ({ each, has, lacks }) => {
    for (const s of ['a-list', 'b-board', 'a-differ', 'b-differ']) each({ journey: 'journal', screen: s, state: 'disagreement' }, (v, at) => {
      has(v.text, /1 outcome was amended/, `${s} ${at.surface}: no amendment`);
      has(v.text, /from \+12\.4% to \+11\.9%/, `${s} ${at.surface}: both scores must stay visible`);
      lacks(v.text, /Rose 12\.4%/, `${s} ${at.surface}: the first figure stands alone`);
    });
    for (const s of ['a-list', 'b-board']) {
      each({ journey: 'journal', screen: s, state: 'disagreement' }, (v, at) => has(v.text, /Rules and models differ on Reliance/, `${s} ${at.surface}: Reliance is not named`));
      each({ journey: 'journal', screen: s, state: 'stale' }, (v, at) => { has(v.text, /Last joined 14:10/, `${s} ${at.surface}: outcomes`); has(v.text, /HSBC last priced 14:10/, `${s} ${at.surface}: rankings`); has(v.text, /Proposed · FIN-OD-06/, `${s} ${at.surface}: no label`); });
    }
    each({ journey: 'journal', screen: 'b-board', state: 'disagreement' }, (v, at) => { has(v.text, /Amended/, `${at.surface}: no mark`); has(v.text, /Corrected to \+11\.9%/, `${at.surface}: no corrected line`); });
    each({ journey: 'journal', screen: 'b-board', state: 'abstention' }, (v, at) => has(v.text, /Recorded against a ranked action on 3 Mar/, `${at.surface}: the entry reads differently from A`));
  },
  // One stale sentence, and the refusal on both sides.
  'R2-j9': ({ each, has, lacks, must }) => {
    for (const s of ['a-done', 'b-done']) {
      each({ journey: 'holdings', screen: s, state: 'stale' }, (v, at) => { has(v.text, /A newer change reached the ledger first, at revision 215/, `${s} ${at.surface}: not the one sentence`); lacks(v.text, /This (correction|reversal) is out of date|Another change/, `${s} ${at.surface}: the flip changes which act is stale`); });
      each({ journey: 'holdings', screen: s, state: 'disagreement' }, (v, at) => { has(v.text, /Reversal refused\. A sale on 2 Nov depends on these units/, `${s} ${at.surface}: no refusal`); must(!liveBtn(v.html, 'Reverse the import'), `${s} ${at.surface}: Reverse stays live`); must(liveBtn(v.html, 'Review both together'), `${s} ${at.surface}: no joint review`); });
    }
    each({ journey: 'holdings', screen: 'a-done', state: 'default' }, (v, at) => must(liveBtn(v.html, 'Reverse the import'), `${at.surface}: Reverse is gone in Ready`));
  },
  // A commit that failed has started, so it cannot be revoked.
  'R2-j10': ({ each, has, lacks, must }) => {
    for (const s of ['a-done', 'b-done']) each({ journey: 'holdings', screen: s, state: 'error' }, (v, at) => {
      lacks(v.text, /Revoke approval/, `${s} ${at.surface}: revoke after the commit started`);
      must(liveBtn(v.html, 'Retry safely'), `${s} ${at.surface}: no retry`);
      has(v.text, /60 → 64 units/, `${s} ${at.surface}: the bound rows are gone`);
    });
  },
  // No forecast is held when no forecast exists.
  'R2-j11': ({ each, has, lacks }) => {
    for (const s of ['b-accounts', 'b-private']) each({ journey: 'holdings', screen: s, state: 'noModel' }, (v, at) => { has(v.text, /Late · 14:10 · No forecast/, `${s} ${at.surface}: wrong line`); lacks(v.text, /forecast held/, `${s} ${at.surface}: a held forecast with no model`); });
    each({ journey: 'holdings', screen: 'b-accounts', state: 'default' }, (v, at) => has(v.text, /Late · 14:10 · forecast held/, `${at.surface}: Ready lost the held forecast`));
  },
  // No partial return is shown as complete: the ISA leaves AstraZeneca out, and Stale leaves HSBC out too.
  'R2-j12': ({ each, has, lacks }) => {
    for (const s of ['b-accounts', 'b-private']) {
      each({ journey: 'holdings', screen: s, state: ['default', 'offline', 'noModel', 'disagreement', 'abstention'].concat(s === 'b-accounts' ? ['error'] : []) }, (v, at) => { has(v.text, /Partial, on 2 of 3/, `${s} ${at.surface} ${at.state}: the ISA reads as complete`); lacks(v.text, /\+11\.2% a year/, `${s} ${at.surface} ${at.state}: a whole rate on part of the account`); });
      each({ journey: 'holdings', screen: s, state: 'stale' }, (v, at) => { has(v.text, /Partial, on 1 of 3/, `${s} ${at.surface}: HSBC left the return in Stale`); lacks(v.text, /\+11\.2% a year/, `${s} ${at.surface}: a whole rate`); });
      each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => has(v.text, /Unavailable, 0 of 2/, `${s} ${at.surface}: India has no rate on either holding`));
    }
  },
  // One record: the one-decision view in Stale is the entry the list shows as not scored, and it names itself on every device.
  'R2-j13': ({ each, has, lacks, view }) => {
    for (const s of ['a-one', 'b-one']) {
      each({ journey: 'journal', screen: s, state: 'stale' }, (v, at) => { has(v.text, /HSBC · 14 Apr/, `${s} ${at.surface}: the record is not named`); has(v.text, /Unresolved/, `${s} ${at.surface}: not the list's status`); has(v.text, /A dividend is disputed/, `${s} ${at.surface}: not the list's reason`); lacks(v.text, /NVIDIA|Waiting on FX/, `${s} ${at.surface}: a record the list shows as scored`); });
      each({ journey: 'journal', screen: s, state: 'default', surface: 'web' }, (v) => has(v.text, /MyPrediction · NVIDIA · 28 Apr/, `${s}: web does not title the record`));
    }
    for (const surface of ALL_SURFACES) { const t = view('journal', 'a', 'a-list', surface, 'stale').text; has(t, /HSBC 14 Apr 2026 · 6 months Unresolved/, `${surface}: the list shows another status`); has(t, /A dividend is disputed, so nothing is scored yet/, `${surface}: the list shows another reason`); }
  },
  // A rebuild has a way in, in each state that can show one.
  'R2-j14': ({ each, has, must }) => {
    const row = { default: /Rebuild proposal ready/, noModel: /Rebuild proposal ready/, stale: /Rebuild proposal out of date/, disagreement: /Rebuild proposal held/, abstention: /Rebuild proposal, part history/ };
    for (const s of ['a-imports', 'b-imports']) for (const [state, re] of Object.entries(row)) each({ journey: 'holdings', screen: s, state }, (v, at) => {
      has(v.text, re, `${s} ${at.surface} ${state}: no way into the rebuild`);
      must(buttons(v.html).some((b) => re.test(b.text) && /Nippon India Nifty 50 BeES/.test(b.text)), `${s} ${at.surface} ${state}: the row is not a control`);
    });
  },
  // No root the flows cannot produce. The sale is what changes direction, and AstraZeneca already has no rate.
  'R2-j15': ({ each, has, lacks }) => {
    for (const s of ['a-done', 'b-done']) each({ journey: 'holdings', screen: s, state: 'abstention' }, (v, at) => {
      lacks(v.text, /third change of direction|Two rates now fit|two rates now fit|12% and 19%|Apple has no single return/, `${s} ${at.surface}: a root the flows cannot produce`);
      has(v.text, /AstraZeneca still has no rate/, `${s} ${at.surface}: wrong holding`);
      has(v.text, /Nonconvergent/, `${s} ${at.surface}: no status`);
    });
  },
  // The figures beside an edit and a part-closed difference add up.
  'R2-j16': ({ each, has, lacks, must }) => {
    for (const s of ['a-edit', 'b-edit']) {
      each({ journey: 'holdings', screen: s, state: 'disagreement' }, (v, at) => { has(v.text, /Cash, Stocks ISA \+£1,063\.01/, `${s} ${at.surface}: the rail ignores your figure`); lacks(v.text, /\+£1,072\.01/, `${s} ${at.surface}: the scan's cash beside your price`); });
      each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => has(v.text, /Cash, Stocks ISA \+£1,072\.01/, `${s} ${at.surface}: Ready lost its cash`));
    }
    const gap = (t) => [(t.match(/Cash on the statement £([\d,.]+)/) || [])[1], (t.match(/Cash in the ledger £([\d,.]+)/) || [])[1], (t.match(/Difference £([\d,.]+)/) || [])[1]];
    for (const s of ['a-difference', 'b-difference']) for (const state of ['default', 'disagreement']) each({ journey: 'holdings', screen: s, state }, (v, at) => {
      const [a, b, d] = gap(v.text);
      must(a && b && d, `${s} ${at.surface} ${state}: the figures are not all there`);
      must(pounds(num(b), num(a)) === num(d), `${s} ${at.surface} ${state}: £${b} less £${a} is not £${d}`);
    });
  },
  // A part-history rebase is not in the records, so it is labelled and cannot be approved; nothing approved the older statements.
  'R2-j17': ({ each, has, lacks, must }) => {
    for (const s of ['a-rebuild', 'b-rebuild']) {
      each({ journey: 'holdings', screen: s, state: 'abstention' }, (v, at) => { has(v.text, /Proposed · FIN-OD-03/, `${s} ${at.surface}: not labelled`); must(!liveBtn(v.html, 'Review and approve'), `${s} ${at.surface}: live approval of an open question`); lacks(v.text, /1 → 2/, `${s} ${at.surface}: a new generation on an open question`); });
      each({ journey: 'holdings', screen: s, state: 'noModel' }, (v, at) => lacks(v.text, /rows you already approved/, `${s} ${at.surface}: nothing approved the older statements`));
      each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => must(liveBtn(v.html, 'Review and approve'), `${s} ${at.surface}: Ready lost its approval`));
    }
  },
  // On phone web the top bar holds the flip and the privacy control: no long button sits beside them.
  'R2-j18': ({ each, must, screens }) => {
    const room = 390 - 24;
    for (const [journey, options] of [['holdings', ['a', 'b']], ['journal', ['a', 'b']]]) for (const option of options) for (const s of screens(journey, option)) each({ journey, option, screen: s, surface: 'pwa' }, (v, at) => {
      const bar = barOf(v.html);
      must(bar !== undefined, `${s} ${at.state}: no top bar to measure`);
      const wide = buttons(bar).filter((b) => !/tbtn|flipbtn/.test(b.attrs));
      const title = (v.html.match(/font:600 17px\/22px var\(--font-text\);letter-spacing:-\.01em">([^<]*)<\/span>/) || [])[1];
      must(title !== undefined, `${s} ${at.state}: no title to measure`);
      const used = 34 + 10 + title.length * 8.6 + 10 + buttons(bar).reduce((a, b) => a + 6 + (wide.includes(b) ? b.text.length * 7.6 + 46 : 44), 0);
      must(used <= room, `${s} ${at.state}: the bar needs about ${Math.round(used)} of ${room}`);
    });
    each({ journey: 'holdings', screen: 'b-accounts', surface: 'pwa', state: 'default' }, (v) => {
      must(/aria-label="Add statement"/.test(barOf(v.html)), 'Add statement is not in the bar as an icon');
      must(!buttons(barOf(v.html)).some((b) => b.text.includes('Add statement')), 'Add statement is still a long button');
      must(/aria-label="Hide amounts"/.test(barOf(v.html)), 'Hide amounts left the bar');
    });
  },
  // Open, not decided: whether units count as amounts.
  'R2-j19': ({ each, has }) => {
    for (const s of ['a-private', 'b-private']) each({ journey: 'holdings', screen: s, state: ['default', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'] }, (v, at) => has(v.text, /Proposed · MP-84/, `${s} ${at.surface} ${at.state}: not labelled`));
  },
  // A hidden amount has a name, and masking leaves the markup whole.
  'R2-j20': ({ each, must, lacks }) => {
    for (const s of ['a-private', 'b-private']) each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => {
      must(v.html.includes('<span class="sr">Amount hidden</span><span aria-hidden="true">••••</span>'), `${s} ${at.surface}: a mask with no name`);
      lacks(v.html, /aria-label="[^"]*<span|data-roll="[^"]*£/, `${s} ${at.surface}: masking broke an attribute, or left money in one`);
    });
  },
  // The journal's "Added 5 units" on 3 Mar 2026 is an event that built the position.
  'R2-j22': ({ each, has }) => {
    each({ journey: 'holdings', screen: 'b-one', state: 'abstention' }, (v, at) => has(v.text, /Bought 5 3 Mar 2026 · £500\.00/, `${at.surface}: the journal's purchase is not an event`));
  },
  'R2-j23': ({ each, has, lacks, must }) => {
    each({ journey: 'holdings', screen: 'a-edit', state: 'empty', surface: WIDE }, (v, at) => { has(v.text, /stay as they are/, `${at.surface}: no note`); lacks(v.text, /Changes value/, `${at.surface}: changes, on a group left out`); });
    for (const s of ['a-done', 'b-done']) each({ journey: 'holdings', screen: s, state: 'disagreement' }, (v, at) => has(v.text, /add the missing one, or keep the difference open/, `${s} ${at.surface}: no "or"`));
    each({ journey: 'holdings', screen: 'a-preview', state: 'default' }, (v, at) => has(v.text, /the entry you typed on 21 Oct/, `${at.surface}: "same date" beside two dates`));
    each({ journey: 'holdings', screen: 'b-duplicate', state: 'default' }, (v, at) => has(v.text, /entered on 21 Oct/, `${at.surface}: "same date" beside two dates`));
    for (const s of ['a-manual', 'b-manual']) each({ journey: 'holdings', screen: s, state: 'disagreement' }, (v, at) => must(v.html.includes('value="25 Sep 2026"') && !v.html.includes('value="2 Nov 2026"'), `${s} ${at.surface}: a November row cannot match a Q3 receipt`));
  },
  'R2-j24': ({ each, lacks, has }) => {
    for (const s of ['a-differ', 'b-differ']) each({ journey: 'journal', screen: s, state: 'disagreement' }, (v, at) => { lacks(v.text, /9 Oct|1 entry is left out/, `${s} ${at.surface}: an entry the journal does not list`); has(v.text, /No action is ranked on Reliance today/, `${s} ${at.surface}: Reliance is not named`); });
  },
  'R2-j25': ({ each, has, lacks }) => {
    each({ journey: 'holdings', screen: 'a-list', state: 'noModel' }, (v, at) => lacks(v.text, /reasons for its action|forecast ranges are 80%/, `${at.surface}: a claim about forecasts with no model`));
    each({ journey: 'holdings', screen: 'a-list', state: 'default' }, (v, at) => has(v.text, /forecast ranges are 80%/, `${at.surface}: Ready lost its foot`));
  },
  'R2-j26': ({ each, must }) => {
    for (const s of ['a-done', 'b-done']) {
      each({ journey: 'holdings', screen: s, state: ['offline', 'loading'] }, (v, at) => { for (const t of ['Renew', 'Delete original']) { must(drawnBtn(v.html, t), `${s} ${at.surface} ${at.state}: ${t} is gone`); must(!liveBtn(v.html, t), `${s} ${at.surface} ${at.state}: ${t} stays live`); } });
      each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => must(liveBtn(v.html, 'Renew'), `${s} ${at.surface}: Ready lost Renew`));
    }
  },

  // ---------- round 3 ----------
  // Lanes on a phone keep what Timeline shows, including the disputed HSBC outcome, and no control pretends to switch.
  'R3-j1': ({ each, has, lacks }) => {
    each({ journey: 'journal', screen: 'b-board', surface: PHONES, state: STAGES }, (v, at) => {
      for (const t of [/Unresolved/, /A dividend is disputed/, /Rose 5\.1%/, /Fell 11\.6%/, /Outcome due 21 Nov 2026/, /Nothing is scored before 3 May 2027/, /3 for a horizon, 1 unresolved/]) has(v.text, t, `${at.surface} ${at.state}: no ${t}`);
      has(v.text, at.state === 'disagreement' ? /Corrected to \+11\.9%/ : /Rose 12\.4%/, `${at.surface} ${at.state}: NVIDIA's outcome`);
      lacks(v.html, /aria-label="Lane"/, `${at.surface} ${at.state}: a lane switch that changes nothing`);
    });
  },
  // Every stated rate is one the drawn schedule produces, and a status is one its flows can produce.
  'R3-j2': ({ each, view, must, has, lacks }) => {
    const close = (t) => num((t.match(/Value £([\d,.]+)/) || [])[1] || 'x');
    for (const [state, name, rate] of [['default', 'Apple', '+14.2'], ['stale', 'HSBC', '+8.1']]) each({ journey: 'holdings', screen: 'b-one', state }, (v, at) => {
      const f = flowsOf(v.text, close(v.text)), row = returnRow(v.text);
      must(f.length >= 3 && row, `${name} ${at.surface}: no schedule to compute`);
      must(turns(f) === 1 && rootCount(f) === 1, `${name} ${at.surface}: not a plain schedule`);
      has(row, new RegExp(`\\${rate}% a year`), `${name} ${at.surface}: not the stated rate`);
      must(holds(f, rateOf(rate)), `${name} ${at.surface}: XNPV at ${rate}% is ${xnpv(f, rateOf(rate) / 100).toFixed(2)}, not zero`);
    });
    // Apple account by account: the rates A states against the flows B draws
    each({ journey: 'holdings', screen: 'a-one', state: 'default' }, (v, at) => {
      const b = view('holdings', 'b', 'b-one', at.surface, 'default').text;
      for (const account of ['Stocks ISA', 'General account']) {
        const m = v.text.match(new RegExp(`${account} · [\\d,]+ units £([\\d,.]+) ([+−][\\d.]+)% a year`));
        must(m, `${account} ${at.surface}: no stated rate`);
        const f = flowsOf(b, num(m[1]), account);
        must(f.length >= 2 && holds(f, rateOf(m[2])), `${account} ${at.surface}: XNPV at ${m[2]}% is ${xnpv(f, rateOf(m[2]) / 100).toFixed(2)}, not zero`);
      }
    });
    // Reliance: three turns, so no proved single rate, and any rate named is a root of these flows
    for (const s of ['a-one', 'b-one']) each({ journey: 'holdings', screen: s, state: 'disagreement' }, (v, at) => {
      const f = flowsOf(view('holdings', 'b', 'b-one', at.surface, 'disagreement').text, close(v.text)), row = returnRow(v.text) || (v.text.match(/Money-weighted return([^]*?)$/) || [])[1];
      must(turns(f) === 3, `Reliance ${s} ${at.surface}: Ambiguous needs flows that change direction, found ${turns(f)} turns`);
      has(row, /No single rate/, `Reliance ${s} ${at.surface}: a headline rate`); has(row, /Ambiguous/, `Reliance ${s} ${at.surface}: no status`); has(row, /Proposed · FIN-OD-04/, `Reliance ${s} ${at.surface}: the rule is open`);
      const named = [...row.matchAll(/([+−]?\d+(?:\.\d+)?)% a year/g)].map((m) => m[1]);
      must(named.length >= 1, `Reliance ${s} ${at.surface}: its true rate is not shown`);
      for (const r of named) must(holds(f, rateOf(r)), `Reliance ${s} ${at.surface}: ${r}% is not a rate these flows produce (XNPV ${xnpv(f, rateOf(r) / 100).toFixed(2)})`);
      lacks(v.text, /Two rates|Not proved a year/, `Reliance ${s} ${at.surface}: two rates these flows cannot produce`);
    });
    // AstraZeneca: no rate is claimed, and no-root is not claimed either
    for (const s of ['a-one', 'b-one']) each({ journey: 'holdings', screen: s, state: 'abstention' }, (v, at) => {
      const row = returnRow(v.text) || (v.text.match(/Money-weighted return([^]*?)$/) || [])[1];
      has(row, /No rate found/, `AstraZeneca ${s} ${at.surface}: wrong status`); has(row, /does not prove there is none/, `AstraZeneca ${s} ${at.surface}: a missing rate is not proof of none (FIN-AC-20)`); has(row, /Proposed · FIN-OD-04/, `AstraZeneca ${s} ${at.surface}: the rule is open`);
      lacks(row, /\d% a year/, `AstraZeneca ${s} ${at.surface}: a rate beside No rate found`);
    });
    // the same open rule on both sides of the flip, and on the receipt that repeats it
    for (const s of ['a-list', 'b-accounts']) each({ journey: 'holdings', screen: s, state: ['default', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'] }, (v, at) => has(v.text, /Older statements fill the gaps\. Proposed · FIN-OD-04/, `${s} ${at.surface} ${at.state}: the rule is open`));
    for (const s of ['a-done', 'b-done']) each({ journey: 'holdings', screen: s, state: 'abstention' }, (v, at) => has(v.text, /Proposed · FIN-OD-04/, `${s} ${at.surface}: the rule is open`));
  },
  // The late-price rule cites FIN-OD-06, on every screen that states it, on both sides of each flip.
  'R3-j3': ({ each, has, lacks }) => {
    const rule = /freshness limit|left out of the total|left out until its price returns/i;
    for (const journey of ['holdings', 'journal']) each({ journey }, (v, at) => { lacks(v.text, /Proposed · MP40-Q6/, `${journey} ${at.screen} ${at.surface} ${at.state}: a price cites the billing question`); if (rule.test(v.text)) has(v.text, /Proposed · FIN-OD-06/, `${journey} ${at.screen} ${at.surface} ${at.state}: the rule has no label`); });
    for (const [journey, ids] of [['holdings', ['a-list', 'b-accounts', 'a-private', 'b-private', 'a-one', 'b-one']], ['journal', ['a-list', 'b-board', 'a-record', 'b-decide', 'a-pick']]]) for (const s of ids) each({ journey, screen: s, state: 'stale' }, (v, at) => has(v.text, /Proposed · FIN-OD-06/, `${journey} ${s} ${at.surface}: no label`));
  },
  'R3-j4': unreadSteps,
  'R3-j5': stepTicks,
  // Both sides of the flip give Reliance's two figures, not "both sides show" with neither.
  'R3-j6': ({ each, has }) => {
    for (const s of ['a-list', 'b-board']) each({ journey: 'journal', screen: s, state: 'disagreement' }, (v, at) => has(v.text, /At 6 months the baseline shows −2\.4% and R2-HGB v3 \+7\.4%, and no action is ranked/, `${s} ${at.surface}: no figures`));
  },
  // Recording a disagreement is open, so each screen that offers it says so, and nothing claims an action that does not exist.
  'R3-j7': ({ each, has, lacks }) => {
    for (const s of ['a-record', 'a-pick', 'a-list', 'b-board', 'b-decide']) each({ journey: 'journal', screen: s, state: 'disagreement' }, (v, at) => has(v.text, /Proposed · MP-158/, `${s} ${at.surface}: not labelled`));
    each({ journey: 'journal', screen: 'a-record', state: 'disagreement' }, (v, at) => {
      const sheet = v.html.slice(v.html.indexOf('class="sheet"'));
      has(sheet, /Proposed · MP-158/, `${at.surface}: the sheet is not labelled`); has(sheet, /Saved with both sides/, `${at.surface}: the wrong saved line`); lacks(sheet, /Saved with the action/, `${at.surface}: saved with an action that does not exist`);
    });
    each({ journey: 'journal', screen: 'b-decide', state: 'disagreement' }, (v, at) => { has(v.text, /Saved with both sides/, `${at.surface}: the wrong saved line`); lacks(v.text, /Saved with the action/, `${at.surface}: saved with an action that does not exist`); });
    each({ journey: 'journal', screen: 'a-record', state: 'default' }, (v, at) => has(v.text, /Saved with the action/, `${at.surface}: Ready lost its line`));
  },
  'R3-j8': ({ each, has }) => {
    for (const s of ['a-one', 'b-one']) each({ journey: 'holdings', screen: s, state: 'stale' }, (v, at) => has(v.text, /Left out of the total until its price returns\. Proposed · FIN-OD-06/, `${s} ${at.surface}: the rule has no label beside it`));
  },
  'R3-j9': maskedTrade,
  // The two tightened checks catch what they claim: entries compared in order, and any "Reconciled" beside an open difference.
  'R3-j10': (api) => {
    entriesAgree(api);
    api.each({ journey: 'holdings' }, (v, at) => api.lacks(v.text, /\breconciled\b(?! again)/i, `${at.screen} ${at.surface} ${at.state}: reconciled, with a difference open`));
  },
  'R3-j11': ({ each, has, lacks }) => {
    each({ journey: 'holdings', screen: 'a-one', state: 'error' }, (v, at) => { lacks(v.text, /\+13\.1%|\+17\.0%/, `${at.surface}: a rate under a failed check`); has(v.text, /Not shown/, `${at.surface}: not said`); });
    each({ journey: 'holdings', screen: 'a-one', state: 'default' }, (v, at) => has(v.text, /\+13\.1% a year/, `${at.surface}: Ready lost its rate`));
  },
  'R3-j12': ({ each, has, lacks }) => {
    each({ journey: 'holdings', screen: 'b-check-2', state: ['disagreement', 'abstention'] }, (v, at) => lacks(v.text, /Claude suggests this/, `${at.surface} ${at.state}: a suggestion beside "suggests nothing"`));
    each({ journey: 'holdings', screen: 'b-check-2', state: 'default' }, (v, at) => has(v.text, /Claude suggests this/, `${at.surface}: Ready lost its suggestion`));
  },
  'R3-j13': ({ each, has }) => {
    each({ journey: 'journal', screen: 'b-board', state: 'disagreement' }, (v, at) => has(v.text, /Reliance Not ranked today · 6 months/, `${at.surface}: ranked, with no action ranked`));
    each({ journey: 'journal', screen: 'b-board', state: 'default' }, (v, at) => has(v.text, /Reliance Ranked today · 6 months/, `${at.surface}: Ready lost its line`));
  },
  'R3-j14': ({ each, has, lacks }) => {
    each({ journey: 'holdings', screen: 'b-done', state: 'stale' }, (v, at) => { has(v.text, /Not checked against revision 215/, `${at.surface}: not said`); lacks(v.text, /Checked: no later event/, `${at.surface}: checked, against a ledger that moved`); });
    each({ journey: 'holdings', screen: 'b-done', state: 'default' }, (v, at) => has(v.text, /Checked: no later event/, `${at.surface}: Ready lost its line`));
  },
  'R3-j15': ({ each, has, lacks }) => {
    for (const s of ['a-list', 'b-board', 'a-differ', 'b-differ']) each({ journey: 'journal', screen: s, state: 'error' }, (v, at) => { lacks(v.text, /as of Mon/, `${s} ${at.surface}: Monday's read beside today's entry`); has(v.text, /as of 21:05 today/, `${s} ${at.surface}: no time`); });
    each({ journey: 'journal', screen: 'a-record', state: 'noModel' }, (v, at) => { has(v.text, /today’s included/, `${at.surface}: today's entry is not explained`); has(v.text, /Your entries on NVIDIA/, `${at.surface}: no entries`); has(v.text, /NVIDIA Today/, `${at.surface}: one of two entries`); has(v.text, /NVIDIA 28 Apr 2026/, `${at.surface}: one of two entries`); });
  },
  'R3-j16': ({ each, has, lacks }) => {
    for (const [state, t] of [['noModel', /queued, not read/], ['offline', /stopped at 62%/], ['error', /3 files not taken in/], ['abstention', /ready for you/]]) each({ journey: 'holdings', screen: 'a-list', state }, (v, at) => { has(v.text, t, `${at.surface} ${state}: not what Imports shows`); lacks(v.text, /is being read/, `${at.surface} ${state}: not what Imports shows`); });
    each({ journey: 'holdings', screen: 'a-list', state: 'default' }, (v, at) => has(v.text, /1 import is being read/, `${at.surface}: Ready lost its line`));
  },
  'R3-j17': ({ each, has }) => {
    for (const s of ['a-imports', 'b-imports']) each({ journey: 'holdings', screen: s, state: ['loading', 'error', 'offline'] }, (v, at) => has(v.text, /cash differs by £8\.15|£8\.15 away from the ledger/, `${s} ${at.surface} ${at.state}: the open difference is hidden`));
    each({ journey: 'holdings', screen: 'b-accounts', state: 'loading' }, (v, at) => has(v.text, /cash differs by £8\.15/, `${at.surface}: the open difference is hidden`));
    for (const s of ['a-one', 'b-one']) each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => has(v.text, /Original deleted/, `${s} ${at.surface}: the evidence gap is hidden`));
  },
  // Trades fall on trading days, and what is written beside them can be true.
  'R3-j18': ({ each, must, has, lacks }) => {
    const weekday = (t) => { const d = new Date(utc(t)).getUTCDay(); return d > 0 && d < 6; };
    for (const state of ['default', 'stale', 'disagreement', 'abstention']) each({ journey: 'holdings', screen: 'b-one', state }, (v, at) => {
      const ds = [...v.text.matchAll(/(?:Bought|Sold) \d+ (\d{1,2} \w{3} \d{4})/g)].map((m) => m[1]);
      must(ds.length >= 2, `${state} ${at.surface}: no events to read`);
      for (const d of ds) must(weekday(d), `${state} ${at.surface}: ${d} is not a trading day`);
    });
    for (const s of ['a-manual', 'b-manual']) each({ journey: 'holdings', screen: s, state: 'disagreement' }, (v, at) => must(weekday((v.html.match(/value="(\d{1,2} \w{3} \d{4})"/) || [])[1]), `${s} ${at.surface}: not a trading day`));
    for (const s of ['a-done', 'b-done']) each({ journey: 'holdings', screen: s, state: 'disagreement' }, (v, at) => has(v.text, /A sale on 2 Nov/, `${s} ${at.surface}: a Sunday sale`));
    for (const s of ['a-difference', 'b-difference']) each({ journey: 'holdings', screen: s, state: ['default', 'empty'] }, (v, at) => lacks(v.html, /taken after the statement closed/, `${s} ${at.surface}: a later fee cannot put the statement below the ledger`));
    for (const s of ['a-record', 'b-decide']) each({ journey: 'journal', screen: s, state: 'disagreement' }, (v, at) => { lacks(v.html, /Added 10 units/, `${s} ${at.surface}: adding, on rules that point down`); has(v.html, /Paused new money/, `${s} ${at.surface}: no entry`); });
  },
};
