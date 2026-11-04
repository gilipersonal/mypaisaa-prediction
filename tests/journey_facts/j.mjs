// What each fixed finding of lane j holds, proved on the rendered Holdings and Journal screens (MP-62 round 1).
const WIDE = ['ipad', 'web'], PHONES = ['iphone', 'pwa'];
const backTo = (v, name) => v.html.includes(`aria-label="Back to ${name}"`);
const countOf = (s, re) => (s.match(re) || []).length;

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
      has(v.text, /Proposed · MP40-Q6/, `${at.surface}: the freshness limit is not labelled proposed`);
      has(v.text, /84,612/, `${at.surface}: HSBC should stay in the total`);
      lacks(v.text, /Stale|16:35 ·|Price 16:35/, `${at.surface}: Ready calls HSBC stale`);
    });
    each({ journey: 'holdings', screen: 'b-accounts', state: 'default' }, (v, at) => { has(v.text, /Late · 14:10/, `${at.surface}: HSBC is not late`); has(v.text, /Proposed · MP40-Q6/, `${at.surface}: no label`); });
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
      each({ journey: 'holdings', screen: m, state: 'default' }, (v, at) => { has(v.text, /Send to preview/, `${at.surface}: no way into preview`); must(/<input/.test(v.html), `${at.surface}: no fields`); });
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
    each({ journey: 'holdings', screen: 'a-list', state: 'default' }, (v, at) => has(v.html, /Return: 4 of 7 holdings/, `${at.surface}: wrong coverage`));
    each({ journey: 'holdings', screen: 'a-list', state: 'stale' }, (v, at) => has(v.html, /Return: 3 of 7 holdings/, `${at.surface}: wrong stale coverage`));
  },
  'R1-j8': ({ each, has, lacks, must }) => {
    for (const s of ['a-one', 'b-one']) {
      each({ journey: 'holdings', screen: s, state: 'disagreement' }, (v, at) => { lacks(v.text, /General account, Q3|ISA statement/, `${s} ${at.surface}: Reliance is held only in India demat`); has(v.text, /India demat, September/, `${s} ${at.surface}: no source`); });
      for (const st of ['stale', 'abstention']) each({ journey: 'holdings', screen: s, state: st }, (v, at) => { lacks(v.text, /General account, Q3/, `${s} ${st} ${at.surface}: held only in the ISA`); has(v.text, /ISA statement, September/, `${s} ${at.surface}: no source`); });
    }
    each({ journey: 'holdings', screen: 'b-one', state: 'disagreement' }, (v, at) => { has(v.text, /Sold 80/, `${at.surface}: two rates need flows both ways`); lacks(v.text, /Opening position/, `${at.surface}: one event`); });
    each({ journey: 'holdings', screen: 'b-one', state: 'stale' }, (v, at) => must(countOf(v.text, /Bought \d+/g) >= 2, `${at.surface}: one event behind a rate`));
    each({ journey: 'holdings', screen: 'b-one', state: 'default' }, (v, at) => {
      const units = [...v.text.matchAll(/Bought (\d+)/g)].reduce((a, m) => a + Number(m[1]), 0);
      must(units === 88, `${at.surface}: Apple's events add to ${units} of 88 units`);
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
    each({ journey: 'holdings', screen: 'a-list', surface: WIDE, state: 'disagreement' }, (v, at) => { has(v.text, /Baseline −1\.5%/, `${at.surface}: no baseline`); has(v.text, /R2-HGB v3 \+2\.8%/, `${at.surface}: no model`); });
    for (const s of ['a-record', 'b-decide']) each({ journey: 'journal', screen: s, state: 'disagreement' }, (v, at) => must(v.html.includes('journal-split'), `${s} ${at.surface}: both are not drawn`));
    each({ journey: 'journal', screen: 'b-board', state: 'disagreement' }, (v, at) => { lacks(v.text, /next page/, `${at.surface}: two places`); has(v.text, /baseline −1\.5%, R2-HGB v3 \+2\.8%/, `${at.surface}: the card has no figures`); });
  },
  'R1-j14': ({ each, has, lacks }) => {
    each({ journey: 'holdings', screen: 'b-done', state: 'disagreement' }, (v, at) => { has(v.text, /Reversal refused/, `${at.surface}: no refusal`); lacks(v.text, /Review and approve/, `${at.surface}: approve under a refusal`); has(v.text, /Review both together/, `${at.surface}: no joint review`); });
    for (const s of ['a-done', 'b-done']) each({ journey: 'holdings', screen: s, state: 'stale' }, (v, at) => { has(v.html, /disabled>Review and approve/, `${s} ${at.surface}: approve stays live`); has(v.text, /Refresh/, `${s} ${at.surface}: no refresh`); });
  },
  'R1-j15': ({ each, has }) => {
    each({ journey: 'holdings', screen: 'a-preview', state: 'disagreement' }, (v, at) => { has(v.text, /£4,630\.43/, `${at.surface}: wrong statement figure`); has(v.text, /£4,642\.83/, `${at.surface}: wrong rows figure`); });
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
  },
  'R1-j17': ({ each, has, lacks }) => {
    for (const s of ['a-imports', 'a-preview', 'a-approve', 'a-done', 'a-manual', 'a-edit', 'b-imports', 'b-add', 'b-check', 'b-approve', 'b-done']) each({ journey: 'holdings', screen: s, state: ['error', 'stale'] }, (v, at) => lacks(v.text, /Twelve Data · error|HSBC stale/, `${s} ${at.surface} ${at.state}: a price chip on a screen not about prices`));
    each({ journey: 'journal', state: 'error' }, (v, at) => lacks(v.text, /Twelve Data · error/, `${at.screen} ${at.surface}: a price chip on a read or save failure`));
    each({ journey: 'holdings', screen: 'a-list', state: 'error' }, (v, at) => has(v.text, /Twelve Data · error/, `${at.surface}: a screen of prices lost its error chip`));
  },
  'R1-j18': ({ each, has }) => {
    for (const journey of ['holdings', 'journal']) each({ journey, surface: ['web', 'pwa'], state: 'offline' }, (v, at) => has(v.text, /Proposed · MP40-Q12/, `${journey} ${at.option} ${at.screen} ${at.surface}: an offline copy with no label`));
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
    }
  },
  'R1-j20': ({ each, has, lacks }) => {
    for (const s of ['a-one', 'b-one']) each({ journey: 'holdings', screen: s, state: ['default', 'empty'] }, (v, at) => { has(v.text, /Protection leads/, `${s} ${at.surface}: a badge with no reason`); has(v.text, /Policy v1/, `${s} ${at.surface}: no policy`); });
    for (const s of ['a-list', 'b-accounts']) each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => { has(v.text, /Not held, to watch/, `${s} ${at.surface}: no candidate`); has(v.text, /Watch/, `${s} ${at.surface}: no action`); });
    each({ journey: 'holdings', screen: 'a-list', state: 'noModel' }, (v, at) => lacks(v.text, /Not held, to watch/, `${at.surface}: a candidate range with no model`));
  },
  'R1-j22': ({ each, has, screens, must }) => {
    each({ journey: 'journal', screen: 'a-record', state: 'default' }, (v, at) => { has(v.text, /What you did, at your broker/, `${at.surface}: no field`); has(v.text, /Kept all 60 units/, `${at.surface}: no figure`); });
    each({ journey: 'journal', screen: 'b-decide', state: 'default' }, (v, at) => {
      has(v.text, /How much, in your words/, `${at.surface}: no field`);
      must(/aria-pressed="true"[^>]*>(?:<[^>]+>)*I chose not to/.test(v.html), `${at.surface}: B records the case as I acted`);
      must(!/journal-pick[^]*aria-pressed="true"/.test(v.html.split('How much')[0].split('What you did, at your broker')[1] || ''), `${at.surface}: B marks an action it did not take`);
    });
    must(screens('journal', 'a').includes('a-pick'), 'Record a decision leads nowhere');
    each({ journey: 'journal', screen: 'a-pick', state: 'default' }, (v, at) => has(v.text, /NVIDIA/, `${at.surface}: no open action`));
    each({ journey: 'journal', screen: 'a-pick', state: 'empty' }, (v, at) => has(v.text, /No ranked action is open/, `${at.surface}: no empty path`));
    each({ journey: 'journal', screen: 'a-pick', surface: PHONES, state: 'default' }, (v, at) => must(v.html.includes('role="button"'), `${at.surface}: the rows are not controls`));
  },
  'R1-j25': ({ each, has, lacks }) => {
    for (const s of ['a-imports', 'b-imports']) each({ journey: 'holdings', screen: s, state: 'default' }, (v, at) => { has(v.text, /as of revision 213/, `${s} ${at.surface}: wrong export revision`); has(v.text, /Dec 2024 statement, in Dec 2026/, `${s} ${at.surface}: wrong renewal`); lacks(v.text, /12 Sep 2028/, `${s} ${at.surface}: old date`); });
    each({ journey: 'holdings', screen: 'a-done', state: 'default' }, (v, at) => has(v.text, /213 → 214/, `${at.surface}: wrong revision`));
    each({ journey: 'holdings', screen: 'a-approve', state: 'default' }, (v, at) => has(v.text, /Ledger revision 213/, `${at.surface}: wrong bound revision`));
    each({ journey: 'holdings', screen: 'a-done', state: 'default' }, (v, at) => has(v.text, /Original kept to Oct 2028/, `${at.surface}: wrong retention`));
  },
};
