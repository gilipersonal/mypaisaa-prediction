// What each fixed finding of round 1, lane h (home and forecast), holds on the rendered screens (MP-62).
import { readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const ALL = ['iphone', 'ipad', 'web', 'pwa'], PHONES = ['iphone', 'pwa'], WIDE = ['ipad', 'web'];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
const count = (t, re) => (t.match(re) || []).length;
const SEGS = ['a-segment', 'a-seg-uslarge', 'a-seg-n50', 'a-seg-midcap', 'a-seg-usetf', 'a-seg-uketf', 'a-seg-inetf'];
/* the CSS is not in a rendered view, so this one reads the page the run was given */
const pageCss = () => {
  const i = process.argv.indexOf('--page');
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  return readFileSync(i >= 0 ? resolve(process.argv[i + 1]) : join(root, 'docs/design/journeys/index.html'), 'utf8');
};

export default {
  'R1-h1': ({ each, has, lacks }) => {
    for (const screen of ['a-portfolio', 'a-board']) each({ journey: 'home', option: 'a', screen, state: 'noModel' }, (v, at) => {
      lacks(v.text, /\b(ICICIBANK|HDFCBANK|TCS|INFY|SBIN) ?\d\d\b/, `${screen} ${at.surface}: an India score with no model`);
      has(v.text, /Nifty 50, India midcap and India ETF lists wait/, `${screen} ${at.surface}: the banner does not widen to all of India`);
    });
    each({ journey: 'home', screen: 'a-search', state: 'noModel' }, (v, at) => lacks(v.text, /XNSE Universe \d\d/, `${at.surface}: search keeps an India score`));
    each({ journey: 'home', screen: 'b-search', state: 'noModel' }, (v, at) => lacks(v.text, /XNSE Universe \d\d/, `${at.surface}: search keeps an India score`));
    each({ journey: 'home', screen: 'a-brief', state: 'noModel' }, (v, at) => lacks(v.text, /leads Nifty 50 at 72/, `${at.surface}: the brief quotes an India score`));
    each({ journey: 'home', screen: 'b-top5-n50', state: 'noModel' }, (v, at) => lacks(v.text, /ICICIBANK|Score \d\d of 100.*SBIN/, `${at.surface}: Nifty 50 is ranked with no model`));
  },
  'R1-h2': ({ each, has, lacks, must }) => {
    each({ journey: 'forecast', option: 'b', screen: 'b-ladder', state: 'abstention' }, (v, at) => {
      for (const fig of ['+33.9%', '−10.2%', '+12.4%']) must(!v.html.includes(fig), `${at.surface}: the abstained 12 months still shows ${fig}`);
      has(v.html, /12 months abstained<\/text>/, `${at.surface}: the fan does not end on "12 months abstained"`);
      has(v.text, /12 months: abstained, no range/, `${at.surface}: the text alternative keeps the 12-month figures`);
    });
    each({ journey: 'forecast', option: 'b', screen: 'b-ladder', state: 'disagreement' }, (v, at) => {
      has(v.html, />Split<\/text>/, `${at.surface}: the 3-month point is not marked split`);
      lacks(v.text, /3 months: median/, `${at.surface}: the split 3 months keeps its median`);
    });
  },
  'R1-h3': ({ each, has }) => {
    each({ journey: 'forecast', option: 'b', screen: 'b-proof', state: 'default', surface: ALL }, (v, at) => {
      for (const re of [/ds-2026-10-30/, /Hit rate/, /Benchmark/, /Model sheet/, /Analog sheet/, /22 since 2015/]) has(v.text, re, `${at.surface}: the dossier's proof lacks ${re}`);
      has(v.html, /aria-label="Dossier"[^]*?<button type="button" aria-pressed="false">Forecast<\/button><button type="button" aria-pressed="true">Proof/, `${at.surface}: the Proof tab is not the one selected`);
    });
  },
  'R1-h4': ({ each, has, must }) => {
    for (const screen of SEGS) each({ journey: 'home', option: 'a', screen, state: 'default', surface: ['iphone', 'web'] }, (v, at) => {
      must(count(v.text, /[+−]\d+\.\d% to [+−]\d+\.\d%/g) >= 4, `${screen} ${at.surface}: not every name has its 80% range`);
      has(v.text, /Ranked 3 Nov · policy v1 · decision support/, `${screen} ${at.surface}: no ranking date and version`);
      has(v.text, /(Twelve Data|Yahoo) \d\d:\d\d/, `${screen} ${at.surface}: no freshness`);
    });
    each({ journey: 'home', option: 'a', screen: 'a-seg-metals', state: 'default' }, (v, at) => has(v.text, /Forecast unavailable/, `${at.surface}: gold's drill-down`));
    each({ journey: 'home', option: 'a', screen: 'a-board', state: 'default' }, (v, at) => {
      has(v.text, /Ranked 3 Nov · policy v1 · decision support/, `${at.surface}: the board has no ranking date`);
      has(v.text, /Twelve Data 21:00/, `${at.surface}: the tile has no freshness`);
      has(v.text, /Yahoo 10:00/, `${at.surface}: India's tile has no freshness`);
    });
    for (const screen of ['b-top5', 'b-top5-uslarge', 'b-top5-n50', 'b-top5-midcap', 'b-top5-usetf', 'b-top5-uketf', 'b-top5-inetf']) each({ journey: 'home', option: 'b', screen, state: 'default', surface: ['iphone', 'web'] }, (v, at) => {
      must(count(v.text, /· 80% range [+−]\d+\.\d% to [+−]\d+\.\d% · 6M/g) >= 4, `${screen} ${at.surface}: a row has no median and range`);
      has(v.text, /Ranked 3 Nov · policy v1 · decision support/, `${screen} ${at.surface}: no ranking date`);
    });
  },
  'R1-h5': ({ each, has, must }) => {
    each({ journey: 'home', screen: 'a-portfolio', state: 'loading' }, (v, at) => {
      has(v.html, /home-dim/, `${at.surface}: the rows are not drawn dimmed`);
      has(v.text, /80% range −18\.5% to \+34\.0%/, `${at.surface}: a holding's range is hidden`);
      has(v.text, /Late/, `${at.surface}: HSBC's flag is hidden`);
      must(!/<div class="hrow"><span class="logo sk"/.test(v.html), `${at.surface}: a skeleton row`);
    });
    each({ journey: 'home', screen: 'b-ledger', state: 'loading' }, (v, at) => {
      has(v.html, /home-dim/, `${at.surface}: the ledger is not dimmed`);
      has(v.text, /Late|late/, `${at.surface}: HSBC's flag is hidden`);
    });
    for (const [journey, screen] of [['forecast', 'a-instrument'], ['forecast', 'b-ladder'], ['forecast', 'a-3m'], ['forecast', 'a-12m'], ['forecast', 'b-forecast']]) each({ journey, screen, state: 'loading' }, (v, at) => {
      has(v.html, /fc-dim/, `${screen} ${at.surface}: the forecast is not dimmed`);
      has(v.text, /80% range/, `${screen} ${at.surface}: the range is hidden`);
      has(v.text, /Data cutoff 21:00/, `${screen} ${at.surface}: the cutoff is hidden`);
    });
  },
  'R1-h6': ({ each, has, lacks }) => {
    for (const journey of ['home', 'forecast']) each({ journey, state: 'error' }, (v, at) => lacks(v.text, /20:45/, `${at.screen} ${at.surface}: a second version, 20:45`));
    for (const [journey, screen] of [['home', 'a-portfolio'], ['home', 'b-ledger'], ['forecast', 'a-instrument'], ['forecast', 'b-ladder'], ['forecast', 'a-short'], ['forecast', 'a-forecasts']]) each({ journey, screen, state: 'error' }, (v, at) => {
      has(v.text, /Last good run Mon 21:15 · cutoff 21:00/, `${screen} ${at.surface}: not the last good run`);
      lacks(v.text, /As of 21:15 London/, `${screen} ${at.surface}: today's as-of on Monday's run`);
    });
    each({ journey: 'home', screen: 'a-portfolio', state: 'error', surface: WIDE }, (v, at) => {
      has(v.text, /Mon 21:00 Twelve Data/, `${at.surface}: the Data column is not on Monday`);
      lacks(v.text, /\s21:15 (Twelve Data|Yahoo)/, `${at.surface}: the Data column mixes versions`);
    });
  },
  'R1-h7': ({ must }) => {
    must(/\.home-tile li b\s*\{[^}]*color:\s*inherit/.test(pageCss()), 'a tile score does not inherit the tile\'s ink');
  },
  'R1-h8': ({ each, has }) => {
    for (const screen of ['a-brief', 'b-brief']) each({ journey: 'home', screen, state: 'loading' }, (v, at) => {
      has(v.text, /Yesterday, 07:30 · decision support/, `${at.surface}: the brief is not labelled decision support`);
      has(v.text, /Reliance: median \+7\.4% at 6 months, 80% range −12\.0% to \+24\.9%/, `${at.surface}: the Add has no range`);
    });
  },
  'R1-h9': ({ each, must }) => {
    each({ journey: 'home', option: 'a', screen: 'a-brief', state: 'default' }, (v, at) => {
      const at_ = ['Actions · decision support', 'Risks', 'Changes', 'Upcoming'].map(w => v.text.indexOf(w));
      must(at_.every((n, i) => n >= 0 && (i === 0 || n > at_[i - 1])), `${at.surface}: the brief reads ${at_}`);
    });
  },
  'R1-h10': ({ each, has, lacks }) => {
    each({ journey: 'home', screen: 'a-portfolio', state: 'disagreement' }, (v, at) => { has(v.text, /3 actions · 1 conflict shown/, `${at.surface}: the pill miscounts`); lacks(v.text, /2 actions/, `${at.surface}: 2 actions over three`); });
    each({ journey: 'home', screen: 'a-portfolio', state: 'abstention' }, (v, at) => { has(v.text, /3 actions · 1 abstention/, `${at.surface}: the pill miscounts`); lacks(v.text, /2 actions/, `${at.surface}: 2 actions over three`); });
  },
  'R1-h12': ({ each, has, lacks, must }) => {
    for (const screen of ['a-forecasts', 'b-forecasts']) each({ journey: 'forecast', screen, state: 'default' }, (v, at) => {
      must(!v.html.includes('class="jback"'), `${screen} ${at.surface}: a root has no back`);
      for (const t of ['AAPL', 'NVDA', 'SPY', 'AZN', 'HSBA', 'RELIANCE', 'NIFTYBEES', 'MSFT', 'JPM', 'ICICIBANK', 'XAU/USD']) has(v.text, new RegExp(t.replace('/', '\\/')), `${screen} ${at.surface}: ${t} is missing`);
      has(v.text, /Watch-only/, `${screen} ${at.surface}: watch-only is not apart`);
      has(v.text, /Evaluated/, `${screen} ${at.surface}: no horizon state`);
      if (screen === 'b-forecasts') has(v.text, /Exploratory/, `${screen} ${at.surface}: no exploratory state`);
    });
    each({ journey: 'forecast', screen: 'a-instrument', state: 'default' }, (v, at) => has(v.html, /aria-label="Back to Forecasts"/, `${at.surface}: back does not lead to the root`));
    each({ journey: 'forecast', screen: 'b-ladder', state: 'default' }, (v, at) => has(v.html, /aria-label="Back to Forecasts"/, `${at.surface}: back does not lead to the root`));
    each({ journey: 'home', screen: 'a-board', state: 'default', surface: PHONES }, (v, at) => {
      has(v.html, /aria-current="page">[^]{0,200}?Segments/, `${at.surface}: Segments is not the lit tab`);
      must(!v.html.includes('class="jback"'), `${at.surface}: a root has no back`);
    });
    each({ journey: 'home', screen: 'a-segment', state: 'default' }, (v, at) => has(v.html, /aria-label="Back to Segments"/, `${at.surface}: a list does not lead back to its root`));
    for (const screen of ['b-explore', 'b-search']) each({ journey: 'home', screen, state: 'default' }, (v, at) => lacks(v.text, /Explore/, `${screen} ${at.surface}: the tab is called Segments`));
  },
  'R1-h13': ({ each, has, lacks }) => {
    each({ journey: 'forecast', screen: 'a-3m', state: 'default' }, (v, at) => { has(v.text, /3-month forecast · AAPL/, `${at.surface}: no 3-month forecast`); has(v.text, /Horizon 3 Feb 2027/, `${at.surface}: no 3-month date`); has(v.text, /\+3\.1%/, `${at.surface}: no 3-month median`); has(v.html, /aria-pressed="true"[^>]*>3/, `${at.surface}: the switch is not on 3 months`); });
    each({ journey: 'forecast', screen: 'a-12m', state: 'default' }, (v, at) => { has(v.text, /12-month forecast · AAPL/, `${at.surface}: no 12-month forecast`); has(v.text, /Horizon 3 Nov 2027/, `${at.surface}: no 12-month date`); has(v.text, /Exploratory/, `${at.surface}: 12 months is not exploratory`); has(v.text, /\+12\.4%/, `${at.surface}: no 12-month median`); });
    each({ journey: 'forecast', screen: 'a-12m', state: 'abstention' }, (v, at) => { has(v.text, /calibrated 12-month range/, `${at.surface}: 12 months does not abstain`); lacks(v.text, /\+33\.9%/, `${at.surface}: an abstained range`); });
    each({ journey: 'home', screen: 'a-12m', state: 'default', surface: 'iphone' }, v => { has(v.text, /· 12M/, 'the rows do not read 12M'); lacks(v.text, /· 6M/, 'a row stays on 6M'); has(v.text, /Exploratory/, '12 months is not exploratory'); });
    each({ journey: 'home', screen: 'a-12m', state: 'default', surface: 'web' }, v => { has(v.text, /12-month forecast/, 'the column does not read 12-month'); lacks(v.text, /6-month forecast/, 'the column stays on 6 months'); });
    each({ journey: 'home', screen: 'b-12m', state: 'default', surface: PHONES }, (v, at) => { lacks(v.text, />6M</, `${at.surface}: the ledger stays on 6M`); has(v.text, /\+12\.4%/, `${at.surface}: Apple's 12-month median`); });
  },
  'R1-h14': ({ each, has }) => {
    for (const screen of ['a-technical', 'b-technical']) each({ journey: 'forecast', screen, state: 'default' }, (v, at) => {
      has(v.html, /aria-label="Detail"/, `${screen} ${at.surface}: no mode control`);
      has(v.html, /aria-pressed="true">Technical/, `${screen} ${at.surface}: not in technical mode`);
      has(v.text, /Simple Technical/, `${screen} ${at.surface}: both modes are not offered`);
      has(v.text, /80% range/, `${screen} ${at.surface}: technical drops the range`);
      has(v.text, /Both keep its range and its uncertainty/, `${screen} ${at.surface}: the uncertainty is not kept`);
    });
    for (const screen of ['a-instrument', 'b-ladder']) each({ journey: 'forecast', screen, state: 'default' }, (v, at) => has(v.html, /aria-pressed="true">Simple/, `${screen} ${at.surface}: no simple mode`));
    for (const screen of ['a-hzstates', 'b-hzstates']) each({ journey: 'forecast', screen, state: 'default' }, (v, at) => {
      for (const w of ['Evaluated model', 'Rules only', 'In practice', 'No clear view', 'Abstained', 'Stale input', 'Model paused', 'Cost paused', 'Unavailable']) has(v.text, new RegExp(w), `${screen} ${at.surface}: ${w} is not drawn`);
    });
  },
  'R1-h15': ({ each, has, lacks }) => {
    each({ journey: 'forecast', screen: 'a-instrument', state: 'default' }, (v, at) => {
      has(v.text, /held 79% of the time over 52 scored forecasts in walk-forward testing/, `${at.surface}: the calibration line`);
      has(v.html, /Walk-forward: inside/, `${at.surface}: the chart's case is not walk-forward`);
      lacks(v.html, /Scored: inside/, `${at.surface}: the chart reads as a live record`);
      has(v.text, /Walk-forward case/, `${at.surface}: the legend`);
    });
    each({ journey: 'forecast', screen: 'b-ladder', state: 'default' }, (v, at) => {
      has(v.text, /Held 77% of 26 in walk-forward testing · Exploratory/, `${at.surface}: the 12-month row`);
      has(v.text, /Held 79% of 52 in walk-forward testing/, `${at.surface}: the 6-month row`);
      has(v.text, /12 months: Exploratory/, `${at.surface}: the fan's chip`);
    });
    each({ journey: 'forecast', screen: 'a-short', state: 'default' }, (v, at) => has(v.text, /held 80% of 412 in walk-forward testing/, `${at.surface}: the short-term row`));
    each({ journey: 'forecast', screen: 'a-views', state: 'default' }, (v, at) => has(v.text, /Held 79% of 52 scored in walk-forward testing/, `${at.surface}: the model view`));
    each({ journey: 'home', screen: 'b-ledger', state: 'default', surface: WIDE }, (v, at) => has(v.text, /12 months Exploratory/, `${at.surface}: the 12-month column`));
  },
  'R1-h16': ({ each, has, lacks }) => {
    each({ journey: 'home', screen: 'a-portfolio', state: 'default', surface: WIDE }, (v, at) => {
      for (const re of [/21:00 Twelve Data/, /16:35 Yahoo/, /14:10 Yahoo · late/, /10:00 Yahoo/]) has(v.text, re, `${at.surface}: ${re}`);
      lacks(v.text, /\s21:15 (Twelve Data|Yahoo)/, `${at.surface}: a row's price time is the run's`);
    });
    each({ journey: 'home', screen: 'a-portfolio', state: 'default', surface: 'iphone' }, v => { has(v.text, /Late: last price 14:10 \(Yahoo\)/, 'HSBC is not late'); has(v.text, /Proposed · MP40-Q6/, 'the limit is not labelled'); has(v.text, /7 of 7 priced/, 'Ready is not fully priced'); has(v.text, /84,612/, 'the total'); });
    each({ journey: 'home', screen: 'a-portfolio', state: 'stale' }, (v, at) => {
      has(v.text, /78,508/, `${at.surface}: HSBC stays in the total`);
      has(v.text, /6 of 7 priced/, `${at.surface}: the count`);
      has(v.text, /1 of 7 rows is stale/, `${at.surface}: more than HSBC is stale`);
      has(v.text, /until its price returns/, `${at.surface}: the recovery sentence`);
      lacks(v.text, /Stale[^.]{0,30}16:35|stopped at 16:35|84,612/, `${at.surface}: 16:35 or the old total`);
    });
    for (const journey of ['forecast']) each({ journey, state: 'stale' }, (v, at) => lacks(v.text, /16:35/, `${at.screen} ${at.surface}: 16:35 means only the UK close`));
    each({ journey: 'forecast', screen: 'a-instrument', state: 'stale' }, (v, at) => { has(v.text, /HSBC/, `${at.surface}: stale is not drawn on HSBC`); has(v.text, /until its price returns/, `${at.surface}: the recovery sentence`); });
    each({ journey: 'home', screen: 'a-action', state: 'stale' }, (v, at) => { has(v.text, /This action is stale/, `${at.surface}: the sheet`); lacks(v.text, /at 16:35/, `${at.surface}: the old stale time`); });
  },
  'R1-h17': ({ each, has }) => {
    each({ journey: 'home', screen: 'a-portfolio', state: 'default', surface: 'iphone' }, v => { for (const re of [/AAPL · USD · Twelve Data 21:00/, /AZN · GBP · Yahoo 16:35/, /HSBA · GBP · Yahoo 14:10/, /RELIANCE · INR · Yahoo 10:00/]) has(v.text, re, `the row lacks ${re}`); });
    for (const [screen, surface] of [['a-portfolio', 'pwa'], ['b-ledger', 'iphone'], ['b-ledger', 'pwa']]) each({ journey: 'home', screen, state: 'default', surface }, v => { for (const re of [/USD · Twelve Data 21:00/, /GBP · Yahoo 16:35/, /GBP · Yahoo 14:10/, /INR · Yahoo 10:00/]) has(v.text, re, `${screen} ${surface}: ${re}`); });
  },
  'R1-h18': ({ each, has, lacks }) => {
    for (const screen of ['a-evidence', 'b-evidence']) each({ journey: 'forecast', screen, state: 'default' }, (v, at) => {
      lacks(v.text, /close 3 Nov|at 21:11/, `${screen} ${at.surface}: an input after the cutoff`);
      has(v.text, /close 2 Nov/, `${screen} ${at.surface}: not the previous close`);
      has(v.text, /FX quote received 20:52/, `${screen} ${at.surface}: the FX quote is not before the cutoff`);
    });
  },
  'R1-h20': ({ each, has, lacks, must }) => {
    each({ journey: 'forecast', screen: 'a-short', state: 'noModel' }, (v, at) => {
      must(count(v.text, /Model paused \(POLICY-003\)/g) === 3, `${at.surface}: the paused rows have no wording of their own`);
      has(v.text, /all four rows show the rules/, `${at.surface}: the banner`);
      lacks(v.text, /Shadow trial/, `${at.surface}: a paused row reads in practice`);
    });
  },
  'R1-h21': ({ each, has }) => {
    each({ journey: 'home', screen: 'a-portfolio', state: 'default', surface: PHONES }, (v, at) => has(v.html, /class="jspace tall"/, `${at.surface}: the last card can run under the floating bar`));
    each({ journey: 'forecast', screen: 'a-instrument', state: 'default', surface: PHONES }, (v, at) => has(v.html, /class="jspace tall"/, `${at.surface}: the last card can run under the floating bar`));
  },
  /* owner's request on this round: the home cost row reads the month, and every state reads as the cost journey does */
  'R1-h-cost': ({ each, has, lacks, journeys, view, must }) => {
    const want = { default: /£46\.42 so far, up to £59\.73 of the £100 ceiling/, loading: /Last good: £46\.42 so far, up to £59\.73 of the £100 ceiling/, empty: /£27\.84 so far, up to £59\.73/, error: /£44\.40 last reconciled, up to £59\.73 estimated/, stale: /Billing 39 h old/, offline: /Offline · from 21:15/, noModel: /£39\.02 so far, forecast £46\.48 of the £100 ceiling/, disagreement: /£46\.73 with the bill, up to £60\.04/, abstention: /£39\.36 known so far/ };
    for (const state of STATES) for (const screen of ['a-portfolio', 'b-ledger']) each({ journey: 'home', screen, state }, (v, at) => has(v.text, want[state], `${screen} ${at.surface} ${state}: the cost row`));
    each({ journey: 'home', screen: 'a-portfolio', state: 'noModel' }, (v, at) => { has(v.text, /Claude off/, `${at.surface}: Claude off`); lacks(v.text, /£46\.42/, `${at.surface}: Claude spend on a Claude-off row`); });
    each({ journey: 'home', screen: 'a-portfolio', state: 'default', surface: 'iphone' }, v => must(v.text.indexOf('Running cost') > v.text.indexOf('NIFTYBEES ·'), 'the cost row is not after the holdings'));
    if (journeys().includes('cost')) for (const [state, l, p] of [['default', 46, 42], ['empty', 27, 84], ['error', 44, 40], ['noModel', 39, '02'], ['disagreement', 46, 73], ['abstention', 39, 36]]) {
      must(new RegExp(`£${l}\\b[^]{0,20}\\.${p}`).test(view('cost', 'a', 'cost-a-month', 'iphone', state).text), `the cost journey's ${state} no longer reads £${l}.${p}`);
    }
  },
};
