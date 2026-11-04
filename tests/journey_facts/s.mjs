// MP-62 round 1, lane s, the cost and privacy part: what each fix holds, on the rendered screens.
const COST_HOME = [['a', 'cost-a-home'], ['b', 'cost-b-home'], ['b', 'cost-b-sheet']];
const PHONES = ['iphone', 'pwa'];
const OVER_SCREENS = [['a', 'cost-a-warned'], ['a', 'cost-a-reduced'], ['a', 'cost-a-paused'], ['b', 'cost-b-warned'], ['b', 'cost-b-reduced'], ['b', 'cost-b-paused']];
const count = (s, re) => (s.match(re) || []).length;
const here = (at) => `${at.screen} ${at.surface} ${at.state}`;
// money() draws a rolling figure twice and its pence apart, so "£37 £37 .69" in the text is the amount £37.69
const amounts = (t) => t.replace(/£([\d,]+) £\1 \.(\d\d)/g, '£$1.$2');

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
    each({ journey: 'privacy', option: 'b', screen: 'privacy-b-home', state: 'default' }, (v, at) => { has(v.text, /Late: last price 14:10 \(Yahoo\)/, here(at)); lacks(v.text, /Stale: last price/, here(at)); has(v.text, /Proposed · MP40-Q6/, here(at)); });
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
  'R1-s18': ({ each, has, lacks }) => {
    for (const journey of ['cost', 'privacy']) each({ journey, surface: ['web', 'pwa'], state: 'offline' }, (v, at) => {
      lacks(v.text, /This browser keeps nothing/, here(at));
      if (!/privacy-cover/.test(v.html)) has(v.text, /Proposed · MP40-Q12/, `${here(at)}: a browser's offline copy with no label`);
    });
  },

  // A revoked device that has not connected: no promise it cannot keep.
  'R1-s19': ({ each, has, lacks }) => {
    for (const [option, screen] of [['a', 'privacy-a-devices'], ['b', 'privacy-b-devices']]) each({ journey: 'privacy', option, screen, state: 'disagreement' }, (v, at) => { has(v.text, /clears when it next connects/, here(at)); lacks(v.text, /cannot be read/, here(at)); has(v.text, /Proposed · MP40-Q12/, here(at)); });
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
};
