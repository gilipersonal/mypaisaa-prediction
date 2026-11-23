// MP-62 rounds 1 to 4, lane s, the cost and privacy part: what each fix holds, on the rendered screens.
const COST_HOME = [['a', 'cost-a-home'], ['b', 'cost-b-home'], ['b', 'cost-b-sheet']];
const PHONES = ['iphone', 'pwa'];
const OVER_SCREENS = [['a', 'cost-a-warned'], ['a', 'cost-a-reduced'], ['a', 'cost-a-paused'], ['b', 'cost-b-warned'], ['b', 'cost-b-reduced'], ['b', 'cost-b-paused']];
const count = (s, re) => (s.match(re) || []).length;
const here = (at) => `${at.screen} ${at.surface} ${at.state}`;
// money() draws a rolling figure twice and its pence apart, so "£37 £37 .69" in the text is the amount £37.69
const amounts = (t) => t.replace(/£([\d,]+) £\1 \.(\d\d)/g, '£$1.$2');
const SURFACES = ['iphone', 'ipad', 'web', 'pwa'];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
const chipsOf = (html) => (html.match(/<div class="jfresh[\s\S]*?<\/div>/) || [''])[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const sorted = (a) => [...new Set(a)].sort().join(' ');
// the holdings a masked screen lists, and every percentage it shows
const rowNames = (html) => [...html.matchAll(/class="nm">([^<]+)</g)].map((m) => m[1]);
const percents = (t) => t.match(/[+−]\d+(?:\.\d+)?%/g) || [];
// the pill as a reader sees it, with the words only a screen reader hears taken out
const pillOf = (html) => (html.match(/<button class="chip glass cost-pill"[\s\S]*?<\/button>/) || [''])[0];
const shown = (pill) => pill.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<span class="sr">[^<]*<\/span>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/ ·/g, ' ·').trim();
const PILL = { default: '£46 of £100', loading: 'Last good £46', empty: '£28 of £100', error: '£38 · collector failed', stale: '£46 · billing 39 h old', offline: '£46 · saved', noModel: '£39 of £100', disagreement: '£46.73 · bill differs', abstention: '£39 · part unknown' };
// the burn-up's own scale, read from its £60 and £100 lines: where the forecast line ends, and the band at day 30
function burnEnd(html, must, where) {
  const svg = (html.match(/<svg class="cx"[^>]*aria-label="Spend by day[\s\S]*?<\/svg>/) || [])[0];
  must(svg, `${where}: no burn-up`);
  const ys = [...svg.matchAll(/<line class="(?:grid|zero)"[^>]*y1="([\d.]+)"/g)].map((m) => +m[1]);
  must(ys.length === 5, `${where}: the lines of the scale are not there`);
  const at = (y) => 60 + ((ys[0] - y) / (ys[0] - ys[3])) * 40;
  const med = svg.match(/<path class="med" d="M[\d.]+ [\d.]+L[\d.]+ ([\d.]+)"/), band = svg.match(/<path class="b80" d="M[\d.]+ [\d.]+L[\d.]+ ([\d.]+)L[\d.]+ ([\d.]+)Z"/);
  return { med: med && at(+med[1]), hi: band && at(+band[1]), lo: band && at(+band[2]) };
}
// what The lines states in each state, which Limits must state too: its own sentence, and how far the first line is
const SAYS = {
  default: /Forecast up to £59\.73\. That is 27p under the £60 warning/, loading: /Last good: £46\.42 committed, forecast up to £59\.73/, empty: /Only the data invoice so far/,
  error: /The AWS collector failed at 06:10 .*the month is at least £44\.40/, stale: /AWS has sent no new bill for 39 hours\. Past 36, optional work waits/, offline: /Nothing updates until you reconnect/,
  noModel: /so every Claude call is refused/, disagreement: /The bill counts, which takes the forecast past £60/, abstention: /stays unknown, never £0\. Its £15 allocation is held/,
};
const FIRST_LINE = {
  default: /£60 Warn 27p away/, loading: /£60 Warn Last good: 27p away/, empty: /£60 Warn Plan: 27p away/, error: /£60 Warn Estimated: 27p away/, stale: /£60 Warn 27p away/, offline: /£60 Warn 27p away/,
  noModel: /£60 Warn £13\.52 away/, disagreement: /£60 Warn Reached/, abstention: /£60 Warn Not known/,
};
// where the page states the late-price rule in its own words, outside the provider chips every frame carries
const PRICE_RULE = /(?:Late|Stale): last price|left out until|inside the freshness limit|past the freshness limit|HSBC price is (?:late|stale)/;
// how old a record is, in minutes, as the offline table writes it at 21:15
function minutesOld(age) {
  const a = age.replace(/^Saved /i, ''), clock = (t) => (21 * 60 + 15) - (+t.slice(0, 2) * 60 + +t.slice(3, 5));
  if (/ days?$/.test(a)) return parseInt(a, 10) * 1440;
  if (/ h$/.test(a)) return parseInt(a, 10) * 60;
  if (/yesterday$/.test(a)) return 1440 + clock(a);
  if (/^\d\d:\d\d$/.test(a)) return clock(a);
  throw new Error(`cannot read the age "${age}"`);
}

export default {
  // Ranked actions carry "Decision support" on every screen that shows one, and the screens named do show one.
  'R1-s1': ({ each, has, must, view }) => {
    for (const journey of ['cost', 'privacy']) each({ journey }, (v, at) => { if (/class="badge/.test(v.html)) has(v.text, /Decision support/, `${here(at)}: a ranked action with no "Decision support"`); });
    for (const [o, s] of COST_HOME) must(/class="badge/.test(view('cost', o, s).html), `${s}: no badge left to label`);
    must(/class="badge/.test(view('privacy', 'a', 'privacy-a-centre').html), 'the privacy centre has no badge left to label');
    must(/class="badge/.test(view('privacy', 'b', 'privacy-b-home').html), 'home with amounts hidden has no badge left to label');
  },

  // Option B draws the degraded modes and the fit, and its log carries the thresholds.
  'R1-s2': ({ each, has }) => {
    each({ journey: 'cost', option: 'b', screen: 'cost-b-paused', state: 'default' }, (v, at) => { has(v.text, /Paused at £85/, here(at)); has(v.text, /passed £85/, `${here(at)}: no reason`); has(v.text, /comes back at the next check/, `${here(at)}: no way back`); });
    each({ journey: 'cost', option: 'b', screen: 'cost-b-reduced', state: 'default' }, (v, at) => { has(v.text, /Reduced at £75/, here(at)); has(v.text, /Backfills/, here(at)); });
    each({ journey: 'cost', option: 'b', screen: 'cost-b-fit', state: 'default' }, (v, at) => { has(v.text, /Top-5 scan at its £5 cap/, here(at)); has(v.text, /Full workload measured on dev/, here(at)); });
    each({ journey: 'cost', option: 'b', screen: 'cost-b-log', state: ['default', 'stale', 'disagreement', 'empty', 'error', 'offline', 'noModel', 'abstention'] }, (v, at) => has(v.text, /£60/, `${here(at)}: the log has no threshold`));
    each({ journey: 'cost', option: 'b', screen: 'cost-b-log', state: 'disagreement' }, (v, at) => has(v.text, /Warned at £60/, here(at)));
  },

  // Option B's checkup opens places that are drawn, and every chevron on it is a real control.
  'R1-s3': ({ each, has, must }) => {
    each({ journey: 'privacy', option: 'b', screen: 'privacy-b-devices', state: 'default' }, (v, at) => { must(count(v.html, />Revoke</g) === 3, `${here(at)}: three other devices can be revoked, found ${count(v.html, />Revoke</g)}`); has(v.text, /Devices and sessions/, here(at)); });
    each({ journey: 'privacy', option: 'b', screen: 'privacy-b-outside', state: 'error' }, (v, at) => { has(v.text, /That change did not save/, here(at)); has(v.text, /private default stays in force/, here(at)); });
    each({ journey: 'privacy', option: 'b', screen: 'privacy-b-outside', state: 'default' }, (v, at) => must(count(v.html, /role="switch"/g) === 3, `${here(at)}: each less private option needs its switch`));
    each({ journey: 'privacy', option: 'b', screen: 'privacy-b-device', state: 'default' }, (v, at) => { has(v.text, /Confirm on a device you trust/, here(at)); has(v.text, /Add a passkey here/, here(at)); });
    each({ journey: 'privacy', option: 'b', screen: 'privacy-b-checkup' }, (v, at) => {
      const rows = count(v.html, /role="button" tabindex="0" class="privacy-li/g), chevrons = count(v.html, /#i-chev-r/g);
      must(rows >= chevrons && (at.state === 'loading' || rows > 0), `${here(at)}: ${chevrons} chevrons and ${rows} real rows`);
    });
  },

  // Locked out sits on the signed-out cover, never inside Settings beside healthy paths.
  'R1-s5': ({ each, has, lacks, must }) => {
    each({ journey: 'privacy', option: 'b', screen: 'privacy-b-lost', state: 'abstention' }, (v, at) => { must(v.na, `${here(at)}: should not apply`); lacks(v.text, /Locked out/, here(at)); });
    each({ journey: 'privacy', option: 'b', screen: 'privacy-b-device', state: 'abstention' }, (v, at) => { has(v.text, /Locked out/, here(at)); lacks(v.text, /3 healthy/, here(at)); must(/privacy-cover/.test(v.html), `${here(at)}: not on the cover`); });
  },

  // With Claude off, a reached line shows no Claude spend.
  'R1-s6': ({ each, lacks, has, must }) => {
    for (const [option, screen] of OVER_SCREENS) each({ journey: 'cost', option, screen, state: 'noModel' }, (v, at) => {
      lacks(v.text, /£14\.62|£12\.58|£8\.28/, `${here(at)}: Claude spend on a Claude-off screen`);
      lacks(v.html, /<i data-mo="barx" style="--c:var\(--seg-ustech\)/, `${here(at)}: a Claude bar on a Claude-off screen`);
      has(v.text, /Claude was already off/, here(at));
    });
    each({ journey: 'cost', option: 'b', screen: 'cost-b-log', state: 'noModel' }, (v, at) => lacks(v.text, /Nightly explanations|Event analysis settled/, `${here(at)}: Claude spend in a Claude-off log`));
    each({ journey: 'cost', option: 'a', screen: 'cost-a-paused', state: 'noModel', surface: 'iphone' }, (v) => must(/£70\.86/.test(amounts(v.text)) && /£43\.02/.test(v.text), `the month and its AWS must add up: ${v.text.slice(0, 200)}`));
  },

  // The collector fails: the last reconciled figure with its age and a stale label, and the sum is a floor.
  'R1-s7': ({ each, has, lacks }) => {
    for (const [option, screen] of [['a', 'cost-a-month'], ['b', 'cost-b-burn']]) each({ journey: 'cost', option, screen, state: 'error' }, (v, at) => { has(amounts(v.text), /£37\.69/, here(at)); has(v.text, /last reconciled/, here(at)); has(v.text, /Stale · 39 h old/, here(at)); lacks(amounts(v.text), /£44\.40 last reconciled/, here(at)); });
    each({ journey: 'cost', option: 'a', screen: 'cost-a-sources', state: 'error' }, (v, at) => { has(v.text, /At least £44\.40/, here(at)); lacks(v.text, /(?<!At least )£44\.40/, `${here(at)}: a flat sum with a part not shown`); });
    each({ journey: 'cost', option: 'a', screen: 'cost-a-home', state: 'error', surface: PHONES }, (v, at) => has(v.text, /Stale · 39 h old/, here(at)));
  },

  // A due original names the right file, Renew is a real control, and renewing has its fresh sign-in.
  'R1-s8': ({ each, has, lacks, must }) => {
    for (const [option, screen] of [['a', 'privacy-a-delete'], ['b', 'privacy-b-delete']]) each({ journey: 'privacy', option, screen, state: 'stale' }, (v, at) => {
      has(v.text, /Indian funds statement, Dec 2024 · version 1/, here(at));
      lacks(v.text, /Broker statement, Sep 2026 · version/, here(at));
      must(/<button[^>]*>(?:(?!<\/button>).)*Renew for 24 months<\/button>/.test(v.html), `${here(at)}: renew is promised and not offered`);
    });
    each({ journey: 'privacy', option: 'a', screen: 'privacy-a-data', state: 'default' }, (v, at) => { must(/<button[^>]*>Renew<\/button>/.test(v.html), `${here(at)}: Renew is not a button`); has(v.text, /due in Dec 2026/, here(at)); });
    for (const [option, screen] of [['a', 'privacy-a-renew'], ['b', 'privacy-b-renew']]) {
      each({ journey: 'privacy', option, screen, state: 'default' }, (v, at) => { has(v.text, /fresh sign-in/, here(at)); has(v.text, /Unlocking the app does not count/, here(at)); has(v.text, /Keeps it to Dec 2028/, here(at)); has(v.text, /Proposed · CT-01/, here(at)); });
      each({ journey: 'privacy', option, screen, state: 'offline' }, (v, at) => must(/<button[^>]*disabled[^>]*>(?:(?!<\/button>).)*Renew<\/button>/.test(v.html), `${here(at)}: offline must refuse it`));
    }
  },

  // Every memory note can be forgotten, the tainted one too, and it keeps its chip.
  'R1-s9': ({ each, has, must }) => {
    for (const [option, screen] of [['a', 'privacy-a-data'], ['b', 'privacy-b-checkup']]) each({ journey: 'privacy', option, screen, state: 'default' }, (v, at) => {
      must(count(v.html, />Forget</g) === 2, `${here(at)}: ${count(v.html, />Forget</g)} of 2 notes can be forgotten`);
      has(v.text, /Untrusted source/, here(at));
      must(count(v.html, /<summary>Correct this note<\/summary>/g) === 2, `${here(at)}: each note can be corrected`);
    });
  },

  // A day-one owner can reach the empty inbox and the unasked permission.
  'R1-s10': ({ each, has, must }) => {
    each({ journey: 'privacy', option: 'a', screen: 'privacy-a-centre', state: 'empty' }, (v, at) => { must(!v.na, `${here(at)}: marked not applicable`); has(v.text, /No notices yet/, here(at)); has(v.text, /Not asked yet/, here(at)); });
  },

  // A screen with prices never hides a price fault, and its body follows the shared story.
  'R1-s11': ({ each, has, lacks }) => {
    each({ journey: 'privacy', option: 'b', screen: 'privacy-b-home', state: 'stale' }, (v, at) => { has(v.text, /Yahoo · HSBC stale/, here(at)); lacks(v.text, /Yahoo · Fresh/, here(at)); has(v.text, /Known value, 6 of 7 priced/, here(at)); has(v.text, /until its price returns/, here(at)); lacks(v.text, /16:35/, here(at)); });
    each({ journey: 'privacy', option: 'b', screen: 'privacy-b-home', state: 'error' }, (v, at) => { has(v.text, /Twelve Data · error 21:14/, here(at)); lacks(v.text, /Twelve Data · Fresh/, here(at)); has(v.text, /Last good run Mon 21:15 · cutoff 21:00/, here(at)); lacks(v.text, /today/, `${here(at)}: the last good run is not today`); });
    each({ journey: 'privacy', option: 'b', screen: 'privacy-b-home', state: 'default' }, (v, at) => { has(v.text, /Late: last price 14:10 \(Yahoo\)/, here(at)); lacks(v.text, /Stale: last price/, here(at)); has(v.text, /Proposed · DATA-DEC-02/, here(at)); });
    for (const [option, screen] of COST_HOME) {
      each({ journey: 'cost', option, screen, state: 'stale' }, (v, at) => { has(v.text, /Yahoo · HSBC stale/, here(at)); has(v.text, /Known value, 6 of 7 priced/, here(at)); has(v.text, /£78,508/, here(at)); lacks(v.text, /£84,612/, here(at)); });
      each({ journey: 'cost', option, screen, state: 'error' }, (v, at) => { has(v.text, /Twelve Data · error 21:14/, here(at)); has(v.text, /Last good run Mon 21:15 · cutoff 21:00/, here(at)); lacks(v.text, /As of 21:15 London/, here(at)); lacks(v.text, /\) today/, `${here(at)}: the last good run is not today`); });
    }
  },

  // Holdings first on a phone: the meter comes after the holdings, in every state.
  'R1-s12': ({ each, must }) => {
    each({ journey: 'cost', option: 'a', screen: 'cost-a-home', surface: PHONES }, (v, at) => {
      const meter = v.html.indexOf('cost-strip'), rows = v.html.lastIndexOf('class="hrow');
      must(meter > 0, `${here(at)}: no meter`);
      must(rows > 0 && meter > rows, `${here(at)}: the meter sits before the holdings`);
    });
    for (const surface of ['ipad', 'web']) each({ journey: 'cost', option: 'a', screen: 'cost-a-home', surface, state: 'default' }, (v, at) => must(v.html.indexOf('class="hrow') < v.html.indexOf('November · day 18'), `${here(at)}: holdings stay in the main column`));
  },

  // A warned month and a reduced month are drawn, with what changes, why, and how it ends.
  'R1-s13': ({ each, has, lacks }) => {
    each({ journey: 'cost', option: 'a', screen: 'cost-a-warned', state: 'default' }, (v, at) => { has(v.text, /Warned at £60/, here(at)); has(v.text, /Nothing stops/, here(at)); has(v.text, /Next line: reduce at £75/, here(at)); has(v.text, /day 20 of 30/, here(at)); });
    each({ journey: 'cost', option: 'a', screen: 'cost-a-reduced', state: 'default' }, (v, at) => { has(v.text, /Reduced at £75/, here(at)); has(v.text, /passed £75/, `${here(at)}: no reason`); for (const w of [/Backfills/, /Challenger models/, /Claude jobs/]) has(v.text, w, here(at)); has(v.text, /comes back at the next check/, `${here(at)}: no way back`); lacks(v.text, /Paused at £85/, here(at)); });
    each({ journey: 'cost', option: 'a', screen: 'cost-a-reduced', state: 'noModel' }, (v, at) => has(v.text, /Already off, so nothing to reduce/, here(at)));
  },

  // The meter's name carries its figure, its word and its forecast, in every state.
  'R1-s15': ({ each, must, has }) => {
    each({ journey: 'cost', option: 'a', screen: 'cost-a-home', surface: PHONES }, (v, at) => {
      const name = (v.html.match(/class="card cost-strip[^>]*aria-label="([^"]*)"/) || [])[1] || '';
      has(name, /Cost this month/, `${here(at)}: no name`);
      has(name, /£\d+\.\d\d/, `${here(at)}: no amount in "${name}"`);
      has(name, /Opens the month/, here(at));
      if (at.state !== 'loading') { has(name, /Forecast /, `${here(at)}: no forecast in "${name}"`); has(name, /committed so far|last reconciled|with the bill|known so far/, `${here(at)}: no word in "${name}"`); }
      must(!/class="cost-lad" role="img"/.test(v.html.slice(v.html.indexOf('cost-strip'))), `${here(at)}: an image nested in a button`);
    });
  },

  // A browser's offline copy is labelled, on every framed screen.
  // Narrowed in MP-189: the owner pressed "Both keep the five" (MP40-Q12c), so the label says it is saved in this browser and that its protection is unverified, not that the question is open.
  'R1-s18': ({ each, has, lacks }) => {
    for (const journey of ['cost', 'privacy']) each({ journey, surface: ['web', 'pwa'], state: 'offline' }, (v, at) => {
      lacks(v.text, /This browser keeps nothing|Proposed · MP40-Q12/, here(at));
      if (!/privacy-cover/.test(v.html)) has(v.text, /Saved in this browser How a browser protects saved records is unverified\./, `${here(at)}: a browser's offline copy with no label`);
    });
  },

  // A revoked device that has not connected: no promise it cannot keep.
  // Narrowed in MP-189: the owner pressed "Saved copy also times out" (OWN-37), so the Proposed label comes off and the time-out, whose value is still the owner's to set, is said instead.
  'R1-s19': ({ each, has, lacks }) => {
    for (const [option, screen] of [['a', 'privacy-a-devices'], ['b', 'privacy-b-devices']]) each({ journey: 'privacy', option, screen, state: 'disagreement' }, (v, at) => { has(v.text, /clears when it next connects/, here(at)); lacks(v.text, /cannot be read/, here(at)); has(v.text, /stops showing after the offline time-out/, here(at)); has(v.text, /Time-out not set · OWN-37/, here(at)); lacks(v.text, /Proposed · MP40-Q12/, here(at)); });
  },

  // The fit is conditional in Ready, and the 27p margin says what it leaves out.
  'R1-s22': ({ each, has }) => {
    for (const [option, screen] of [['a', 'cost-a-fit'], ['b', 'cost-b-fit']]) each({ journey: 'cost', option, screen, state: 'default' }, (v, at) => { has(v.text, /conditional on the Grow 55 checkout price, listing rights and the measured workload/, here(at)); has(v.text, /27p under the warning/, here(at)); has(v.text, /£0\.15 of data transfer/, here(at)); });
    each({ journey: 'cost', option: 'a', screen: 'cost-a-month', state: 'default' }, (v, at) => has(v.text, /about £0\.15 of transfer/, here(at)));
  },

  // The day and the figures travel with the state.
  'R1-s24': ({ each, has, lacks }) => {
    each({ journey: 'cost', option: 'a', screen: 'cost-a-month', state: 'empty' }, (v, at) => { has(v.text, /day 1 of 30/, here(at)); lacks(v.text, /day 18 of 30/, here(at)); });
    each({ journey: 'cost', option: 'b', screen: 'cost-b-burn', state: 'empty' }, (v, at) => { has(v.text, /day 1 of 30/, here(at)); lacks(v.text, /Day 18/, here(at)); });
    each({ journey: 'cost', option: 'a', screen: 'cost-a-paused', state: 'loading' }, (v, at) => { has(v.text, /day 24 of 30/, here(at)); has(v.text, /£71\.20/, here(at)); lacks(v.text, /£46\.42/, here(at)); lacks(v.text, /day 18/, here(at)); });
    each({ journey: 'cost', option: 'a', screen: 'cost-a-paused', state: 'empty' }, (v, at) => { has(v.text, /Committed £27\.84/, here(at)); lacks(v.text, /£46\.42/, here(at)); });
  },

  // Figures that agree across a state.
  'R1-s26': ({ each, has, lacks }) => {
    each({ journey: 'cost', option: 'a', screen: 'cost-a-month', state: 'disagreement' }, (v, at) => { has(v.text, /Forecast £18\.95/, here(at)); lacks(v.text, /Forecast £18\.64/, here(at)); });
    each({ journey: 'cost', option: 'a', screen: 'cost-a-limits', state: 'abstention' }, (v, at) => { lacks(v.text, /Not reached/, here(at)); has(v.text, /Not known/, here(at)); });
    each({ journey: 'privacy', option: 'a', screen: 'privacy-a-centre', state: 'default' }, (v, at) => { lacks(v.text, /Forecast passed £60/, here(at)); has(v.text, /Forecast up to £59\.73/, here(at)); });
  },

  // The meter does not reuse the US and UK colours of the allocation bar.
  'R1-s28': ({ each, lacks }) => {
    each({ journey: 'cost', option: 'a', screen: 'cost-a-home', surface: PHONES }, (v, at) => lacks(v.html.slice(v.html.indexOf('cost-strip')), /--mark-(us|uk)/, `${here(at)}: market colours on the meter`));
  },

  // Copy and cues.
  'R1-s29': ({ each, view, has, lacks, must }) => {
    const device = { iphone: 'iPhone', ipad: 'iPad', web: 'Mac, Safari', pwa: 'Phone web' };
    for (const surface of Object.keys(device)) {
      const t = view('privacy', 'a', 'privacy-a-devices', surface, 'default').text;
      has(t, new RegExp(`${device[surface]} Active now This device`), `${surface}: the wrong device is this device: ${t.slice(0, 240)}`);
      must(count(t, /This device/g) <= 2, `${surface}: more than one device is this device`);
    }
    lacks(view('privacy', 'a', 'privacy-a-devices', 'iphone', 'default').text, /iPad Active 2 h ago · Passkey/, 'no iPad passkey is listed');
    lacks(view('privacy', 'b', 'privacy-b-checkup', 'iphone', 'default').text, /newest 2 days ago/, 'the checkup against active now');
    lacks(view('privacy', 'a', 'privacy-a-device', 'iphone', 'default').text, /Nothing changes until the last step/, 'a revoke sits before the last step');
    lacks(view('privacy', 'a', 'privacy-a-device', 'iphone', 'empty').text, /Use a passkey on your iPhone or Mac/, 'no device to confirm on, and a passkey on one');
    must(/aria-current="step"/.test(view('privacy', 'a', 'privacy-a-device', 'iphone', 'default').html), 'the current step has no cue');
    has(view('privacy', 'b', 'privacy-b-notices', 'iphone', 'default').text, /Unread:/, 'unread has no text');
  },

  // The shared story, on every cost and privacy screen.
  'R1-s-story': ({ each, has, lacks }) => {
    for (const journey of ['cost', 'privacy']) each({ journey }, (v, at) => {
      lacks(v.text, /Stale: last price 16:35|20:45|ranked weight/, here(at));
      if (at.state !== 'stale') lacks(v.text, /Yahoo · HSBC stale/, here(at));
      if (/16:35/.test(v.text)) has(v.text, /16:35 UK close/, `${here(at)}: 16:35 means only the UK close`);
    });
    each({ journey: 'privacy', option: 'a', screen: 'privacy-a-data', state: 'default' }, (v, at) => { has(v.text, /Revision 213/, here(at)); lacks(v.text, /Revision 12\b/, here(at)); has(v.text, /Broker statement, Oct 2026 PDF · kept to Oct 2028/, here(at)); });
    each({ journey: 'privacy', option: 'a', screen: 'privacy-a-data', state: 'disagreement' }, (v, at) => has(v.text, /Revision 214 published/, here(at)));
    each({ journey: 'cost', option: 'a', screen: 'cost-a-limits', state: 'noModel' }, (v, at) => has(v.text, /Claude stays off until credit is verified or you approve paid use, in Settings, with a fresh sign-in\./, here(at)));
    for (const [option, screen] of [['a', 'privacy-a-notice'], ['b', 'privacy-b-notice']]) each({ journey: 'privacy', option, screen, state: 'default' }, (v, at) => { has(v.text, /HSBC price is late/, here(at)); has(v.text, /performs no action/, here(at)); });
  },

  // A screen that shows or quotes a price takes the state as it stands: Privacy reads as Home with amounts hidden does, and a notice about a price agrees with its chip.
  'R2-s4': ({ view, each, must, has, lacks }) => {
    for (const surface of SURFACES) for (const state of STATES) {
      const a = chipsOf(view('privacy', 'a', 'privacy-a-centre', surface, state).html), b = chipsOf(view('privacy', 'b', 'privacy-b-home', surface, state).html);
      must(a && a === b, `${surface} ${state}: the centre shows "${a}" and Home "${b}"`);
    }
    each({ journey: 'privacy', option: 'a', screen: 'privacy-a-centre', state: 'stale' }, (v, at) => { has(v.text, /Yahoo · HSBC stale/, here(at)); lacks(v.text, /HSBC late|Portfolio value/, here(at)); has(v.text, /Known value, 6 of 7 priced/, here(at)); has(v.text, /until its price returns/, here(at)); });
    each({ journey: 'privacy', option: 'a', screen: 'privacy-a-centre', state: 'error' }, (v, at) => { has(v.text, /Twelve Data · error 21:14/, here(at)); lacks(v.text, /Twelve Data · Fresh/, here(at)); has(v.text, /Last good run Mon 21:15 · cutoff 21:00/, here(at)); has(v.text, /\+1\.39% last good run/, here(at)); lacks(v.text, /\+1\.39% today/, here(at)); });
    for (const [option, screen] of [['a', 'privacy-a-notice'], ['b', 'privacy-b-notice']]) each({ journey: 'privacy', option, screen, state: 'stale' }, (v, at) => { has(v.text, /Yahoo · HSBC stale/, here(at)); has(v.text, /HSBC price is stale/, here(at)); lacks(v.text, /HSBC late/, here(at)); });
  },

  // Privacy and Home with amounts hidden show the same holdings, the same percentages and the same state, money masked on both. So do the two sides of Your data.
  'R2-s5': ({ view, must, has, lacks }) => {
    for (const surface of SURFACES) for (const state of STATES) {
      const a = view('privacy', 'a', 'privacy-a-centre', surface, state), b = view('privacy', 'b', 'privacy-b-home', surface, state), at = `${surface} ${state}`;
      must(sorted(rowNames(a.html)) === sorted(rowNames(b.html)), `${at}: the centre lists ${rowNames(a.html)} and Home ${rowNames(b.html)}`);
      must(sorted(percents(a.text)) === sorted(percents(b.text)), `${at}: the centre shows ${sorted(percents(a.text))} and Home ${sorted(percents(b.text))}`);
      for (const v of [a, b]) {
        lacks(v.text, /£90,155|£84,051|£84,612|£78,508|£5,542|£6,104|£\d[\d,]*\.\d\d (?:today|known)/, `${at}: an amount shows`);
        for (const m of v.html.matchAll(/class="val">([\s\S]*?)<\/div>/g)) has(m[1], /£••••/, `${at}: a row's value is not masked`);
        if (!['loading', 'empty'].includes(state)) { must(rowNames(v.html).length === 3, `${at}: ${rowNames(v.html).length} rows`); has(v.html, /class="amt priv"/, `${at}: the total is not masked`); has(v.text, /[+−]\d+\.\d+%/, `${at}: the percentages went too`); }
        lacks(v.text, /abstained on Reliance|Models disagree on Reliance/, `${at}: not the shared story`);
        if (state === 'disagreement') { has(v.text, /Rules and models disagree on Reliance/, at); has(v.text, /Baseline/, at); has(v.text, /R2-HGB v3/, at); has(v.text, /−2\.4%/, at); has(v.text, /\+7\.4%/, at); }
        if (state === 'abstention') { has(v.text, /The model abstained on AstraZeneca at 6 months/, at); has(v.text, /Abstained · no range shown/, at); }
        if (state === 'noModel') { has(v.text, /No approved model covers India yet/, at); has(v.text, /Reliance .*No approved model · no action/, at); }
        if (state === 'error') has(v.text, /Today's run failed/, at);
      }
      if (state !== 'noModel') {
        const x = view('privacy', 'a', 'privacy-a-data', surface, state).text, y = view('privacy', 'b', 'privacy-b-checkup', surface, state).text, card = (t) => (t.match(/Export your data .*?(?:Pinned to|Request an export|Download|Building)/) || [''])[0], notes = (t) => (t.match(/Memory notes (?:\d+ notes|No notes yet)/) || [''])[0];
        must(card(x) && card(x) === card(y), `${at}: Your data says "${card(x)}" and the checkup "${card(y)}"`);
        if (state !== 'loading') must(notes(x) && notes(x) === notes(y), `${at}: "${notes(x)}" against "${notes(y)}"`);
      }
    }
  },

  // The pill keeps its figure beside its status, and that figure is the month's own, in every state, on Home and behind the sheet.
  'R2-s6': ({ view, must, has, lacks }) => {
    for (const surface of SURFACES) for (const state of STATES) {
      const month = amounts(view('cost', 'a', 'cost-a-month', surface, state).text).match(/£(\d+\.\d\d) (?:committed so far|last reconciled|with the bill|known so far)/);
      if (state !== 'loading') must(month, `${surface} ${state}: the month shows no figure to compare`);
      for (const screen of ['cost-b-home', 'cost-b-sheet']) {
        const v = view('cost', 'b', screen, surface, state), pill = pillOf(v.html), at = `${screen} ${surface} ${state}`;
        must(pill, `${at}: no pill`);
        must(shown(pill) === PILL[state], `${at}: the pill reads "${shown(pill)}", not "${PILL[state]}"`);
        lacks(shown(pill), /^Cost:/, `${at}: a status with no figure`);
        if (month) { const fig = shown(pill).match(/£(\d+(?:\.\d\d)?)/)[1]; must(fig === month[1] || +fig === Math.round(+month[1]), `${at}: the pill says £${fig} and the month £${month[1]}`); has(v.text, new RegExp(`£${month[1].replace('.', '\\.')} `), `${at}: the exact figure is not in the pill's name`); }
        has(v.text, /Opens the month/, `${at}: the pill does not say where it goes`);
      }
    }
  },

  // Past a line, the chart's forecast line ends on the forecast the page states, inside its band.
  'R2-s11': ({ each, must, lacks }) => {
    for (const screen of ['cost-b-warned', 'cost-b-reduced', 'cost-b-paused']) {
      each({ journey: 'cost', option: 'b', screen, state: ['default', 'error', 'stale', 'offline', 'noModel', 'disagreement'] }, (v, at) => {
        const fc = v.html.match(/Forecast for the month<\/span><b>£([\d.]+)/);
        must(fc, `${here(at)}: no forecast stated`);
        const e = burnEnd(v.html, must, here(at)), want = parseFloat(fc[1]);
        must(e.med !== null && Math.abs(e.med - want) < 0.15, `${here(at)}: the forecast line ends at £${e.med && e.med.toFixed(2)}, the page says £${want}`);
        must(e.lo !== null && e.lo < want && want < e.hi, `${here(at)}: the band £${e.lo} to £${e.hi} is not around £${want}`);
      });
      each({ journey: 'cost', option: 'b', screen, state: 'abstention' }, (v, at) => lacks(v.html, /<path class="med"/, `${here(at)}: an unknown forecast drew a line`));
    }
  },

  // Gross and cash follow the state, and the features add up to the gross beside them.
  'R2-s12': ({ each, must, has, lacks }) => {
    const features = (t) => [...t.matchAll(/(?:Top-5 explanations|Chat and research|Event analysis|Evaluations|Morning brief) £(\d+\.\d\d)/g)].reduce((a, m) => a + +m[1], 0);
    for (const [option, screen] of [['a', 'cost-a-sources'], ['b', 'cost-b-log']]) {
      each({ journey: 'cost', option, screen, state: 'empty' }, (v, at) => { has(v.text, /Claude gross usage What the calls cost £0\.00/, here(at)); has(v.text, /Counted in full until a bill proves credit £0\.00/, here(at)); lacks(v.text, /£7\.06/, here(at)); });
      each({ journey: 'cost', option, screen, state: 'error' }, (v, at) => { has(v.text, /Claude gross usage What the calls cost, to 18:00 £6\.71/, here(at)); has(v.text, /Counted in full until a bill proves credit Up to £6\.71/, here(at)); lacks(v.text, /£7\.06/, here(at)); must(Math.abs(features(v.text) - 6.71) < 0.005, `${here(at)}: the features add up to £${features(v.text).toFixed(2)}`); });
      each({ journey: 'cost', option, screen, state: 'default' }, (v, at) => { has(v.text, /Claude gross usage What the calls cost £7\.06/, here(at)); has(v.text, /Up to £7\.06/, here(at)); must(Math.abs(features(v.text) - 7.06) < 0.005, `${here(at)}: the features add up to £${features(v.text).toFixed(2)}`); });
    }
  },

  // The checkup is built from the state: what is failing is under Needs you and not under Looks good, and it agrees with Your data.
  'R2-s13': ({ view, must, has, lacks }) => {
    for (const surface of SURFACES) for (const state of STATES.filter((s) => !['loading', 'noModel'].includes(s))) {
      const v = view('privacy', 'b', 'privacy-b-checkup', surface, state), d = view('privacy', 'a', 'privacy-a-data', surface, state), t = v.text, at = `${surface} ${state}`;
      const from = t.indexOf('Looks good'), to = t.indexOf('Export your data');
      must(from >= 0 && to > from, `${at}: no Looks good list`);
      const good = t.slice(from, to), need = t.includes('Needs you') ? t.slice(t.indexOf('Needs you'), from) : '';
      const hFrom = v.html.indexOf('>Needs you<'), hTo = v.html.indexOf('>Looks good<');
      if (need) { const n = +(need.match(/Needs you (\d+) items?/) || [])[1]; must(n === count(v.html.slice(hFrom, hTo), /role="button"/g), `${at}: it says ${n} items and lists ${count(v.html.slice(hFrom, hTo), /role="button"/g)}`); }
      // the oldest age is the oldest in the table it stands for
      const ages = [...d.html.matchAll(/<tr data-mo="rise"><td>[^<]+<\/td><td class="r">([^<]+)</g)].map((m) => m[1]);
      if (state === 'empty') { lacks(t, /oldest record/i, at); has(good, /Nothing saved on this device yet/, at); } else {
        must(ages.length === 5, `${at}: no age table on Your data`);
        const old = ages.reduce((a, b) => (minutesOld(b) > minutesOld(a) ? b : a));
        has(t, new RegExp(`oldest record ${old}`, 'i'), `${at}: the oldest record is ${old}: ${(t.match(/oldest record [^.]*/i) || [''])[0]}`);
      }
      // the same facts as Your data
      must(/>Renew</.test(d.html) === /Renew an original/.test(need), `${at}: Your data and the checkup differ on the renewal`);
      must(/Originals did not load/.test(d.text) === /Originals did not load/.test(need), `${at}: Your data and the checkup differ on the originals`);
      must(/Older than usual/.test(d.text) === /older than usual/.test(need), `${at}: Your data and the checkup differ on the copy's age`);
      if (state === 'error') { has(need, /Phone notifications stopped/, at); has(need, /A revoke did not finish/, at); has(need, /A privacy change did not save/, at); lacks(good, /Web Push on|Devices|Lock screen/, at); has(good, /rebuilt 21:14/, at); }
      if (state === 'empty') { has(need, /Add a second sign-in path/, at); lacks(good, /4 signed in|Sign-in paths|One left|Web Push on/, at); has(good, /Not asked yet/, at); }
      if (state === 'stale') { has(good, /Checked 14:10/, at); lacks(good, /Checked 21:15|oldest record/i, at); has(need, /Check this list again/, at); }
      if (state === 'disagreement') { has(need, /A device has not checked in/, at); has(need, /Phone notifications are blocked/, at); lacks(good, /4 signed in|Web Push on|Nothing confidential shows/, at); has(good, /on from your Mac/, at); }
      if (state === 'abstention') { lacks(t, /Renew an original/, at); has(good, /held for quiet hours/, at); }
      if (state === 'default') { has(good, /Checked 21:15/, at); has(need, /Renew an original/, at); }
    }
  },

  // A lost device is never the one in your hand, and the path in is one this frame has.
  'R2-s18': ({ view, must, has, lacks }) => {
    const want = { iphone: ['Your iPhone passkey', 'iPad, last active 2 h ago', 'iPad', 'iPhone, last active'], ipad: ['Google', 'iPhone, last active 40 min ago', 'iPhone', 'iPad, last active'], web: ['Your Mac passkey', 'iPad, last active 2 h ago', 'iPad', 'iPhone, last active'], pwa: ['Google', 'iPad, last active 2 h ago', 'iPad', 'iPhone, last active'] };
    for (const [surface, [path, seen, gone, wrong]] of Object.entries(want)) {
      const t = view('privacy', 'b', 'privacy-b-lost', surface, 'default').text;
      has(t, new RegExp(`${path}, just now`), `${surface}: the path in: ${t.slice(0, 200)}`); has(t, new RegExp(seen), surface); lacks(t, new RegExp(wrong), surface); has(t, new RegExp(`On the new ${gone},`), surface);
      has(view('privacy', 'b', 'privacy-b-lost', surface, 'stale').text, new RegExp(`so the ${gone} is not yet revoked`), `${surface} stale`);
      has(view('privacy', 'b', 'privacy-b-lost', surface, 'error').text, new RegExp(`The ${gone} is still signed in`), `${surface} error`);
    }
  },

  // The export and the originals count the same deleted original.
  'R2-s21': ({ each, must, has, lacks }) => {
    each({ journey: 'privacy', option: 'a', screen: 'privacy-a-data', state: 'abstention' }, (v, at) => { must(count(v.text, /Deleted original/g) === 1, `${here(at)}: ${count(v.text, /Deleted original/g)} deleted rows`); has(v.text, /One deleted original is left out/, here(at)); });
    each({ journey: 'privacy', option: 'b', screen: 'privacy-b-checkup', state: 'abstention' }, (v, at) => { has(v.text, /One deleted original is left out/, here(at)); lacks(v.text, /Two deleted/, here(at)); });
  },

  // Both options of the lines state the same risk, in every state, on every device: the state's own sentence and how far the first line is.
  'R3-s3': ({ view, must, has }) => {
    for (const surface of SURFACES) for (const state of STATES) {
      const a = view('cost', 'a', 'cost-a-limits', surface, state), b = view('cost', 'b', 'cost-b-limits', surface, state), at = `${surface} ${state}`, where = b.text.split('Where you are')[1];
      must(where, `${at}: Limits has no Where you are`);
      has(a.text, SAYS[state], `${at}: The lines does not say ${SAYS[state]}`);
      has(where, SAYS[state], `${at}: Where you are does not say ${SAYS[state]}`);
      has(a.text, FIRST_LINE[state], `${at}: The lines does not show ${FIRST_LINE[state]}`);
      has(where, FIRST_LINE[state], `${at}: Where you are does not show ${FIRST_LINE[state]}`);
      must(/class="chip stale">Reached</.test(a.html) === /class="chip stale">Reached</.test(b.html), `${at}: only one side marks the line reached`);
      if (state !== 'loading') { const chip = (t) => (t.match(/Where you are (.*?) £60 £75/) || [])[1]; must(chip(a.text) && chip(a.text) === chip(b.text), `${at}: "${chip(a.text)}" and "${chip(b.text)}"`); }
    }
  },

  // No model is about India: HSBC keeps its forecast, held, and the notice says so, as Privacy and Home do in that state.
  'R3-s8': ({ each, must, has, lacks }) => {
    for (const [option, screen] of [['a', 'privacy-a-notice'], ['b', 'privacy-b-notice']]) each({ journey: 'privacy', option, screen, state: 'noModel' }, (v, at) => {
      must(!v.na, `${here(at)}: No model can occur on a notice, so it is drawn, not marked not applicable`);
      has(v.text, /Forecast held Its action is Pause until its price returns/, `${here(at)}: the forecast is not held`);
      lacks(v.text, /No forecast to hold|No approved model covers/, `${here(at)}: the notice says HSBC has no model`);
    });
    each({ journey: 'privacy', state: 'noModel' }, (v, at) => lacks(v.text, /covers HSBC/, here(at)));
    each({ journey: 'privacy', option: 'a', screen: 'privacy-a-centre', state: 'noModel' }, (v, at) => { has(v.text, /No approved model covers India yet/, here(at)); has(v.text, /HSBC HSBA .*\+2\.1% · 6M Pause/, `${here(at)}: HSBC lost its forecast`); });
  },

  // The log dates a figure by where it stops, as the burn-up does.
  'R3-s14': ({ each, has, lacks }) => {
    each({ journey: 'cost', option: 'b', screen: 'cost-b-log', state: 'error' }, (v, at) => { has(v.text, /Last reconciled November · day 16 of 30 £37\.69/, here(at)); lacks(v.text, /day 18 of 30/, here(at)); });
    each({ journey: 'cost', option: 'b', screen: 'cost-b-burn', state: 'error' }, (v, at) => has(v.text, /Figures stop at 16 Nov/, here(at)));
    each({ journey: 'cost', option: 'b', screen: 'cost-b-log', state: 'default' }, (v, at) => has(v.text, /Committed so far November · day 18 of 30 £46\.42/, here(at)));
  },

  // The late-price rule cites DATA-DEC-02 wherever a screen states it, Stale and both sides of a flip included. MP40-Q6 stays on billing data and cost freshness.
  'R3-s-label': ({ each, must, has, lacks }) => {
    let seen = 0;
    for (const journey of ['cost', 'privacy']) each({ journey }, (v, at) => {
      lacks(v.html, /(?:last price 14:10 \(Yahoo\)|price is (?:late|stale)|freshness limit)(?:(?!class="card|class="privacy-box).)*Proposed · MP40-Q6/s, `${here(at)}: a price under a billing question`);
      if (!PRICE_RULE.test(v.text)) return;
      seen++;
      has(v.text, /Proposed · DATA-DEC-02/, `${here(at)}: the rule is stated and not labelled`);
    });
    must(seen >= 180, `only ${seen} views state the rule, so the check has lost what it reads`);
    for (const [option, screen] of COST_HOME) {
      each({ journey: 'cost', option, screen, state: 'stale' }, (v, at) => has(v.text, /is left out until its price returns\. Proposed · DATA-DEC-02/, here(at)));
      each({ journey: 'cost', option, screen, state: 'default', surface: ['ipad', 'web'] }, (v, at) => { if (screen !== 'cost-b-sheet') has(v.text, /Late: last price 14:10 \(Yahoo\) Proposed · DATA-DEC-02/, here(at)); });
    }
    for (const [option, screen] of [['a', 'privacy-a-centre'], ['b', 'privacy-b-home']]) {
      each({ journey: 'privacy', option, screen, state: 'stale' }, (v, at) => has(v.text, /HSBC is left out until its price returns Proposed · DATA-DEC-02/, here(at)));
      each({ journey: 'privacy', option, screen, state: 'default' }, (v, at) => has(v.text, /Late: last price 14:10 \(Yahoo\) Proposed · DATA-DEC-02/, here(at)));
    }
    for (const [option, screen] of [['a', 'privacy-a-notice'], ['b', 'privacy-b-notice']]) for (const state of ['default', 'stale']) each({ journey: 'privacy', option, screen, state }, (v, at) => has(v.text, /(?:stays in|is out of) the total\. Proposed · DATA-DEC-02/, here(at)));
    each({ journey: 'privacy', option: 'b', screen: 'privacy-b-notices', state: ['default', 'stale'] }, (v, at) => has(v.text, /HSBC price is (?:late|stale) Last price 14:10 · 16:50 Proposed · DATA-DEC-02/, here(at)));
    each({ journey: 'privacy' }, (v, at) => lacks(v.text, /MP40-Q6/, `${here(at)}: Privacy has no billing data`));
    for (const [option, screen, state] of [['a', 'cost-a-month', 'stale'], ['a', 'cost-a-warned', 'stale'], ['a', 'cost-a-limits', 'default'], ['b', 'cost-b-limits', 'default'], ['a', 'cost-a-sources', 'default'], ['b', 'cost-b-log', 'default']]) each({ journey: 'cost', option, screen, state }, (v, at) => has(v.text, /Proposed · MP40-Q6/, `${here(at)}: billing lost its label`));
  },

  // A flip that lands on the same facts shows them another way, on every surface, so it never changes nothing.
  'R3-s-pairs': ({ view, must, has }) => {
    const part = (t, x, y) => { const i = t.indexOf(x), j = t.indexOf(y, i); must(i >= 0 && j > i, `no "${x}" to "${y}" in: ${t.slice(0, 120)}`); return t.slice(i, j); };
    const figures = (t) => (t.match(/£\d+\.\d\d/g) || []).sort().join(' ');
    for (const surface of SURFACES) for (const state of STATES) {
      const at = `${surface} ${state}`;
      if (state !== 'loading') {
        const a = part(view('cost', 'a', 'cost-a-fit', surface, state).text, 'Planned months', 'The fit stays conditional'), b = part(view('cost', 'b', 'cost-b-fit', surface, state).text, 'Planned months', 'The fit stays conditional');
        must(a !== b, `${at}: the two sides of the fit read the same`);
        must(figures(a) && figures(a) === figures(b), `${at}: the fit shows "${figures(a)}" and "${figures(b)}"`);
      }
      if (['default', 'stale', 'offline', 'disagreement', 'abstention', 'noModel'].includes(state)) {
        const a = part(view('privacy', 'a', 'privacy-a-notice', surface, state).text, 'HSBC price is', 'This notice performs no action'), b = part(view('privacy', 'b', 'privacy-b-notice', surface, state).text, 'HSBC price is', 'This notice performs no action');
        must(a !== b, `${at}: the two sides of the notice read the same`);
        for (const w of [/Last price 14:10/, /Detected 16:50/, /Forecast held/]) { has(a, w, at); has(b, w, at); }
        has(a, /Decision support Last price 14:10/, `${at}: the centre leads with the evidence`);
        has(b, /Decision support Forecast held/, `${at}: in place leads with what changes`);
      }
    }
  },

  // Limits leads with where the month stands, as The lines does: the state's sentence and how far the first line is come before the table.
  'R4-s1': ({ view, must, has }) => {
    for (const surface of SURFACES) for (const state of STATES) {
      const t = view('cost', 'b', 'cost-b-limits', surface, state).text, at = `${surface} ${state}`, from = t.indexOf('Where you are'), to = t.indexOf('Every limit');
      must(from >= 0, `${at}: Limits has no Where you are`);
      must(to > from, `${at}: Where you are comes at ${from} and Every limit at ${to}`);
      const first = t.slice(from, to);
      has(first, SAYS[state], `${at}: the risk is not above the table: ${first}`);
      has(first, FIRST_LINE[state], `${at}: the first line is not above the table: ${first}`);
    }
  },

  // No model can occur on a notice: it is drawn with its own line, and the row keeps HSBC's forecast, held.
  'R4-s7': ({ view, must, has }) => {
    for (const [option, screen] of [['a', 'privacy-a-notice'], ['b', 'privacy-b-notice']]) for (const surface of SURFACES) {
      const v = view('privacy', option, screen, surface, 'noModel'), at = `${screen} ${surface}`;
      must(!v.na, `${at}: marked not applicable: ${v.na}`);
      has(v.text, /India has no approved model yet\. HSBC keeps its forecast, held\./, `${at}: the state is not drawn`);
      must(v.html !== view('privacy', option, screen, surface, 'default').html, `${at}: it draws what Ready draws`);
    }
  },

  // A proposed rule carries its label in the card that states it, on every screen that states it. Where you are holds it on both sides of the lines.
  'R4-s8': ({ each, view, must, has, lacks }) => {
    const RULES = {
      stale: [/Past 36, optional work waits|holds until AWS billing is reconciled|Optional work held/, /Proposed · MP40-Q6/, ['cost-a-limits', 'cost-b-limits', 'cost-b-log', 'cost-a-month', 'cost-b-burn', 'cost-b-sheet', 'cost-a-warned', 'cost-b-paused']],
      abstention: [/Its £15 allocation is held|stopped being collected|Stays unknown, never £0|Unavailable until an admin key is adopted/, /Proposed · MP40-Q5/, ['cost-a-limits', 'cost-b-limits', 'cost-b-log', 'cost-a-sources', 'cost-a-month', 'cost-b-burn', 'cost-b-sheet', 'cost-a-warned', 'cost-b-paused']],
    };
    for (const [state, [rule, label, screens]] of Object.entries(RULES)) {
      const seen = new Set();
      each({ journey: 'cost', state }, (v, at) => {
        for (const card of v.html.split(/(?=<div class="card)/)) if (rule.test(card)) { seen.add(at.screen); has(card, label, `${here(at)}: ${card.match(rule)[0]} has no ${label} in its card`); }
      });
      for (const screen of screens) must(seen.has(screen), `${state}: ${screen} no longer states the rule, so the check has lost what it reads`);
    }
    const inCard = (t, end) => { const i = t.indexOf('Where you are'), j = t.indexOf(end, i); must(i >= 0 && j > i, `no "Where you are" before "${end}"`); return t.slice(i, j); };
    for (const surface of SURFACES) for (const state of STATES) for (const [option, screen, end] of [['a', 'cost-a-limits', 'Each line is judged'], ['b', 'cost-b-limits', 'Every limit']]) {
      if (option === 'a' && state === 'loading') continue;   // A leads with the month's own card while it loads, and that carries its status
      const card = inCard(view('cost', option, screen, surface, state).text, end), at = `${screen} ${surface} ${state}`;
      if (state === 'stale') has(card, /optional work waits until it is reconciled\. Proposed · MP40-Q6/, at);
      else if (state === 'abstention') has(card, /Its £15 allocation is held\. Proposed · MP40-Q5/, at);
      else lacks(card, /Proposed/, `${at}: a label this state does not raise`);
    }
  },

  // Both sides of the sources and the log show how old each figure is, the same in every state.
  'R4-s9': ({ view, must }) => {
    const ages = (t, at) => { const m = t.match(/How old each figure is (?:Last good 21:15|.*?The view reads saved figures)/); must(m, `${at}: no ages`); return m[0]; };
    for (const surface of SURFACES) for (const state of STATES) {
      const at = `${surface} ${state}`, a = ages(view('cost', 'a', 'cost-a-sources', surface, state).text, at), b = ages(view('cost', 'b', 'cost-b-log', surface, state).text, at);
      must(a === b, `${at}: the sources read "${a}" and the log "${b}"`);
    }
  },

  // The late-price label sits on the late price. "Never performs an action" is settled, so nothing proposed follows it.
  'R4-s16': ({ each, has, lacks }) => {
    for (const [option, screen] of [['a', 'privacy-a-centre'], ['b', 'privacy-b-notices']]) each({ journey: 'privacy', option, screen }, (v, at) => {
      lacks(v.text, /performs? (?:an|no) action\. Proposed/, `${here(at)}: a settled negative reads as proposed`);
      if (!['loading', 'empty', 'error'].includes(at.state)) has(v.text, /HSBC price is (?:late|stale) Last price 14:10 · 16:50 Proposed · DATA-DEC-02/, `${here(at)}: the late price has no label`);
    });
    for (const [option, screen] of [['a', 'privacy-a-notice'], ['b', 'privacy-b-notice']]) each({ journey: 'privacy', option, screen }, (v, at) => lacks(v.text, /performs no action\. Proposed/, `${here(at)}: a settled negative reads as proposed`));
  },

  // With HSBC out of the total, the shares are of the known total, on Cost's Home as on Home.
  'R3-s-shares': ({ each, has, lacks }) => {
    for (const [option, screen] of COST_HOME) {
      each({ journey: 'cost', option, screen, state: 'stale' }, (v, at) => { has(v.text, /US 53\.8%/, here(at)); has(v.text, /India 28\.7%/, here(at)); has(v.text, /UK 11\.0%/, here(at)); has(v.text, /Cash 6\.6%/, here(at)); lacks(v.text, /50\.1%|26\.7%|17\.0%/, `${here(at)}: the shares still count HSBC`); });
      each({ journey: 'cost', option, screen, state: 'default' }, (v, at) => has(v.text, /US 50\.1%/, here(at)));
    }
  },
};
