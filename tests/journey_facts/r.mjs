// Lane r of MP-62 review rounds 1 to 4: Research and Approvals, proved on the rendered screens.
const CLAUDE_OFF = /Claude stays off until credit is verified or you approve paid use, in Settings, with a fresh sign-in\./;
const R = 'research', A = 'approvals';
const SURFACES = ['iphone', 'ipad', 'web', 'pwa'], WIDE = ['ipad', 'web'];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
const SHEET_STATES = STATES.filter((s) => s !== 'noModel');
const said = (at) => `${at.journey}.${at.screen} ${at.surface} ${at.state}`;
// a real, enabled control carrying this name: a span, or a disabled button, is not one
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const enabled = (html, name) => new RegExp(`<button\\b(?![^>]*\\bdisabled\\b)[^>]*>(?:\\s*<svg[^>]*>.*?</svg>)?\\s*${esc(name)}\\s*</button>`).test(html);
const opensTo = (html, name) => new RegExp(`role="button" tabindex="0" aria-label="${esc(name)}`).test(html);
// the shadow trial's marks: the nine cells as drawn, not the words beside them
const marks = (html) => {
  const grid = (html.match(/grid-template-columns:repeat\(9,minmax\(0,1fr\)\)[\s\S]*?<\/div>/) || [''])[0];
  return { cells: (grid.match(/<i /g) || []).length, ticks: (grid.match(/#i-check/g) || []).length, paused: (grid.match(/#i-pause/g) || []).length };
};
// the freshness row, which both sides of a flip must show alike
const chips = (html) => (html.match(/<div class="jfresh[\s\S]*?<\/div>/) || [''])[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
// narrowed in MP-186: the sidebar's data line is per market (ADM-10, ADM-22)
const dataLine = (text) => (text.match(/(US: last good run Mon 22:15 · cutoff 22:00\. UK and India ran today|As of 22:15 London · cutoffs US 22:00, UK 17:35, India 11:00)/) || [''])[0];
// the inbox as a screen draws it
const NOTICE_ROW = /US tech is [\d.]+% of (?:the portfolio|the known total)(?= Material risk)|US tech, 12 months paused|HSBC price is (?:late|stale)|R1-LGB v2 reverted by itself/g;
const inbox = (text) => text.match(NOTICE_ROW) || [];
const unread = (text) => (text.match(/detected \w+ \d\d:\d\d Unread\b/g) || []).length;
const waits = (text) => (text.match(/(\d) decisions? wait on you/) || [])[1];
// a promise that Claude returns, which only Cost's condition may make
const CLAUDE_BACK = /\b(back|return|returns|returning|resume|resumes|again|next month|this month|by itself|automatically|lifts?|resets?|once the|until)\b/i;
// the same promise with no Claude in the sentence: a wait that ends by itself
const WAIT = /\b(until|once|when|after)\b[^.]*\b(budget|credit|cap|allowance|hold|spend)\b|\b(budget|credit|cap|allowance|hold)\b[^.]*\b(clears?|lifts?|resets?)\b|\b(waits?|back|returns?|resumes?|reopens?|available)\b[^.]*\b(tomorrow|next (?:month|week|cycle)|this month|in the morning)\b/i;
const sentences = (t) => t.split(/(?<=[.!?])\s+/);
// one element to its own closing tag, so what follows it is not read as part of it
const own = (html) => { let depth = 0; for (const m of html.matchAll(/<(\/?)div\b[^>]*>/g)) { depth += m[1] ? -1 : 1; if (!depth) return html.slice(0, m.index + m[0].length); } return html; };
// what a person sees in a piece of a screen, for a piece the harness's view does not hand over
const words = (html) => html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();
// a sheet and a rail stand side by side on iPad and desktop, so a check on one must not read the other
const sheetOf = (html) => { const at = html.indexOf('<div class="sheet"'); return at < 0 ? '' : own(html.slice(at)); };
const railOf = (html) => {
  const at = html.indexOf('<div class="jcols"');
  if (at < 0) return '';
  const cols = own(html.slice(at)), open = cols.indexOf('>') + 1, body = own(cols.slice(open));
  return cols.slice(open + body.length, -'</div>'.length);
};
// the first banner a screen draws, which is the one its state gives it
const bannerOf = (html) => { const at = html.indexOf('<div class="jbanner'); return at < 0 ? '' : own(html.slice(at)); };
// the status chip an outcome carries
const CHIPS = ['Approved', 'Refused', 'Expired', 'Not applied'];
const chipOf = (html) => CHIPS.filter((n) => html.includes(`>${n}</span>`)).join(', ');
// the import's rows as a screen draws them, Holdings' and Approvals' alike
const importRows = (text) => (text.match(/(?:Apple|HSBC, HSBA · XLON|AstraZeneca) [\d,]+ → [\d,]+ units|ISA cash £[\d,.]+ → £[\d,.]+/g) || []).join(' | ');
const RAISE = [/\b(raise|raising|lift|lifting|increase|increasing|expand|expanding|top up|bump|double|extend)\b[^.·]{0,40}\b(cap|budget|ceiling|allowance|limit)\b/i, /\b(cap|budget|ceiling|allowance)\b[^.·]{0,30}\b(raised|lifted|increased|expanded|to £\d+)/i];

// The decision controls, and the only (screen, state) each may be live in. Any pair not named here has none live, on any surface.
const button = (html) => [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(([, attrs, inner]) => ({ name: words(inner), off: /(?<![-\w])disabled\b/.test(attrs) }));
const STEPS = ['aa-listing-step', 'aa-step', 'aa-setting-step', 'aa-restart-step', 'ab-step', 'ab-model-step', 'ab-setting-step', 'ab-restart-step'];
const LISTINGS = ['aa-listing', 'ab-chat'], MODELS = ['aa-model', 'ab-model'], SETTINGS = ['aa-setting', 'ab-setting'], RESTARTS = ['aa-restart', 'ab-restart'], REVOKES = ['aa-revoke', 'ab-revoke'];
const INBOXES = ['aa-queue', 'ab-notices'], NOTICE_LIVE = ['default', 'stale', 'noModel', 'disagreement', 'abstention'];
const DECISIONS = ['Refuse', 'Confirm', 'Approve', 'Approve this', 'Stay on v1', 'Switch forward', 'Keep paused', 'Restart', 'Continue with passkey', 'Sign in and approve', 'Sign in again', 'Revoke this approval', 'Roll back', 'See the evidence', 'Dismiss'];
const LIVE = [
  [LISTINGS, ['Refuse', 'Confirm'], ['default', 'noModel', 'disagreement']],
  [MODELS, ['Refuse', 'Approve'], ['default', 'noModel']],   // the owner, 4 Nov 2026: only that scope waits
  [SETTINGS, ['Refuse', 'Approve'], ['default']],
  // No new score is no gate on the owner's yes (MP-159, owner answers 6 and 15), so Abstaining keeps the decision his.
  [RESTARTS, ['Stay on v1', 'Switch forward'], ['default', 'disagreement', 'abstention']],
  [RESTARTS, ['Keep paused', 'Restart'], ['noModel']],
  [STEPS, ['Continue with passkey'], ['default', 'stale']],
  [['aa-restart-step', 'ab-restart-step', 'aa-step', 'ab-model-step'], ['Continue with passkey'], ['noModel']],   // only that scope waits, so a promotion still reaches its sheet
  [STEPS, ['Approve this'], ['empty']],
  [['aa-restart-result', 'ab-restart-result'], ['Sign in and approve'], ['stale']],
  [REVOKES, ['Revoke this approval'], ['default']],
  [REVOKES, ['Sign in and approve'], ['stale']],
  // Narrowed for OWN-16, "An open session is enough": revoking asks for no sign-in, so Abstaining is not applicable on a revoke and draws no Sign in again.
  // MP-190 (OWN-35, "Code may draft one"): a raise code drafted is decided like a settings change, and its step-up like any other.
  [['aa-budget', 'ab-budget'], ['Refuse', 'Approve'], ['default']],
  [['aa-budget-step', 'ab-budget-step'], ['Continue with passkey'], ['default', 'stale']],
  [['aa-budget-step', 'ab-budget-step'], ['Approve this'], ['empty']],
  [['aa-record'], ['Roll back'], ['default', 'error', 'stale']],
  [INBOXES, ['See the evidence', 'Dismiss'], NOTICE_LIVE],
  [['ab-home'], ['See the evidence', 'Dismiss'], NOTICE_LIVE, WIDE],
];
// What a state draws and holds off, so a control cannot pass by going missing.
const HELD_OFF = [
  [LISTINGS, ['Refuse', 'Confirm'], ['loading', 'error', 'offline']],
  [MODELS, ['Refuse', 'Approve'], ['offline']],
  [SETTINGS, ['Refuse', 'Approve'], ['offline']],
  [['aa-budget', 'ab-budget'], ['Refuse', 'Approve'], ['offline']],   // MP-190 (OWN-35)
  [['aa-budget-step', 'ab-budget-step'], ['Continue with passkey'], ['offline']],   // MP-190 (OWN-35)
  [RESTARTS, ['Stay on v1', 'Switch forward'], ['offline']],
  [STEPS, ['Continue with passkey'], ['offline']],
  [REVOKES, ['Revoke this approval'], ['offline']],
  [['aa-record'], ['Roll back'], ['offline']],
  [INBOXES, ['See the evidence', 'Dismiss'], ['offline']],
  [['ab-home'], ['See the evidence', 'Dismiss'], ['offline'], WIDE],
];
const rowsFor = (table, at) => table.filter(([screens, , states, surfaces]) => screens.includes(at.screen) && states.includes(at.state) && (!surfaces || surfaces.includes(at.surface))).flatMap(([, names]) => names);
// The lines each step-up binds, read in the sheet alone: a phone has no rail to cover a line the sheet drops.
const BOUND_LINES = {
  listing: ['Action Add a watch-only listing', 'Change Catalogue v14 to v15', 'Listing TSM · XNYS', 'Environment Production', 'Payload hash 2d7a…b310', 'Expires Today, 18:00'],
  model: ['Action Promote a model', 'Change R2-HGB v3 to v4', 'Artefact 4be1…09fa', 'Calibrator c8', 'Tasks 3, 6, 12 months', 'Scope All segments', 'Environment Production', 'Evidence hash 9c1e…44ab', 'Payload hash a81f…60de', 'Limits 5 points, 10%', 'Previous safe R2-HGB v3', 'Expected version Models v22', 'Expires Fri 6 Nov, 18:00'],
  setting: ['Action Change a setting', 'Owner You', 'Environment Production', 'Setting Weekly band', 'Value 4 points', 'Current version v9', 'Payload hash 1b7c…d3e4', 'Expires Mon 9 Nov, 18:00'],
  forward: ['Action Switch forward', 'Change R1-LGB v1 to v2', 'Artefact R1-LGB v2 · 7e20…c4d1', 'Calibrator c5', 'Tasks 3 months', 'Scope India midcap', 'Evidence hash b3f6…2a90', 'Limits 5 points, 10%', 'Previous safe R1-LGB v1', 'Expected version Models v22', 'Environment Production', 'Payload hash e19c…7a45', 'Expires 15 minutes after you approve'],
  restart: ['Action Restart a paused scope', 'Change Paused to issuing', 'Artefact R2-HGB v3 · 91d4…e7b2', 'Calibrator c7', 'Tasks 12 months', 'Scope US tech', 'Evidence hash d52a…08c3', 'Limits 5 points, 10%', 'Previous safe None eligible', 'Expected version Models v22', 'Environment Production', 'Payload hash 40fb…c6e8', 'Expires 15 minutes after you approve'],
};

const FACTS = {
  'R1-r1': ({ each, has, lacks }) => {
    for (const [option, screen] of [['a', 'aa-result'], ['b', 'ab-model-result']]) {
      each({ journey: A, option, screen, state: 'default' }, (v, at) => {
        lacks(v.text, /4 good weeks/, `${said(at)}: "4 good weeks" is not the owner's rule`);
        has(v.text, /First 4 live weeks/, `${said(at)}: no first 4 live weeks`);
        has(v.text, /scoring runs on matured paired forecasts only/, `${said(at)}: scoring is not tied to matured paired forecasts`);
        has(v.text, /A week with no matured paired forecasts neither counts toward nor breaks a run/, `${said(at)}: no rule for a week with none`);
        has(v.text, /for 6 and 12 months probation ends with no score/, `${said(at)}: 6 and 12 months`);
      });
    }
    for (const [option, screen] of [['a', 'aa-model'], ['b', 'ab-model']]) {
      each({ journey: A, option, screen, state: 'default' }, (v, at) => {
        has(v.text, /On probation for its first 4 live weeks, it reverts after 2 bad weeks\. After that, 4 weeks running worse than v3 on matured forecasts reverts it\./, `${said(at)}: the slip rule is not the owner's`);
      });
    }
  },

  'R1-r2': ({ each, has, lacks }) => {
    for (const [option, screen] of [['a', 'aa-model'], ['b', 'ab-model']]) {
      each({ journey: A, option, screen }, (v, at) => {
        lacks(v.text, /1 to 20 sessions/, `${said(at)}: evidence for a task this approval does not bind`);
        lacks(v.text, /short-term forecasts/, `${said(at)}: short-term evidence on a 3 to 12-month approval`);
        lacks(v.text, /live shadow/, `${said(at)}: the live-shadow comparison`);
      });
      each({ journey: A, option, screen, state: 'default' }, (v, at) => {
        has(v.text, /Walk-forward v4 Rules Base rate 3, 6, 12 months 0\.188 0\.197 0\.203/, `${said(at)}: no walk-forward row`);
        has(v.text, /Clean running 8 of 8 scored weeks/, `${said(at)}: no clean-running count`);
        has(v.text, /Matured, 3 months 0.*Matured, 6 months 0.*Matured, 12 months 0/, `${said(at)}: no matured counts`);
        has(v.text, /Years of walk-forward history carry the accuracy evidence/, `${said(at)}: owner answer 13`);
      });
      each({ journey: A, option, screen, state: 'disagreement' }, (v, at) => has(v.text, /not the current rules on walk-forward history/, `${said(at)}: which comparison it lost`));
    }
  },

  'R1-r3': ({ each, has, must }) => {
    for (const [option, set, res, rev] of [['a', 'aa-setting', 'aa-restart', 'aa-revoke'], ['b', 'ab-setting', 'ab-restart', 'ab-revoke']]) {
      each({ journey: A, option, screen: set, state: 'default' }, (v, at) => {
        for (const w of ['Narrow a self-correction band', 'Expected impact', 'Evidence', 'Cost a month', 'How to roll it back', 'Bound to settings v9']) has(v.text, new RegExp(w), `${said(at)}: no "${w}"`);
      });
      each({ journey: A, option, screen: res, state: 'default' }, (v, at) => {
        has(v.text, /Switch forward to R1-LGB v2/, `${said(at)}: no switch-forward proposal`);
        must(enabled(v.html, 'Switch forward'), `${said(at)}: no switch-forward decision`);
      });
      each({ journey: A, option, screen: res, state: 'noModel' }, (v, at) => {
        has(v.text, /Restart US tech, 12 months/, `${said(at)}: no restart proposal`);
        must(enabled(v.html, 'Keep paused'), `${said(at)}: no way to keep it paused`);
        must(enabled(v.html, 'Restart'), `${said(at)}: no restart decision`);
      });
      each({ journey: A, option, screen: rev, state: 'default' }, (v, at) => must(enabled(v.html, 'Revoke this approval'), `${said(at)}: nothing to revoke with`));
      each({ journey: A, option, screen: rev, state: 'offline' }, (v, at) => must(/<button[^>]*disabled[^>]*>Revoke this approval/.test(v.html), `${said(at)}: revoking needs a connection`));
      each({ journey: A, option, screen: rev, state: 'empty' }, (v, at) => has(v.text, /Revoked\. Nothing changed\./, `${said(at)}: no revoked state`));
      each({ journey: A, option, screen: rev, state: 'error' }, (v, at) => has(v.text, /Too late to revoke/, `${said(at)}: the commit started first`));
    }
  },

  'R1-r4': ({ each, has, lacks, must }) => {
    each({ journey: R, option: 'b', screen: 'rb-today', state: ['default', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'] }, (v, at) => {
      lacks(v.text, /NVDA · Trim|SPY · Add|HSBA · Pause/, `${said(at)}: a bare action chip`);
      has(v.text, /widest 80% range|Widest 80% range/, `${said(at)}: no reason on the NVIDIA action`);
      has(v.text, /80% range −18\.5% to \+34\.0%/, `${said(at)}: no range on the NVIDIA action`);
      must(v.html.includes('aria-label="Sources"'), `${said(at)}: no sources list`);
    });
    each({ journey: R, option: 'b', screen: 'rb-today', state: 'default' }, (v, at) => has(v.text, /Words by Claude · figures by code/, `${said(at)}: not tagged`));
    each({ journey: R, option: 'b', screen: 'rb-today', state: 'noModel' }, (v, at) => has(v.text, /Template · figures by code/, `${said(at)}: the template is not labelled`));
    for (const journey of [R, A]) each({ journey }, (v, at) => { if (/class="badge b-/.test(v.html)) has(v.text, /Decision support/, `${said(at)}: a ranked action with no "Decision support"`); });
  },

  'R1-r5': ({ each, has, lacks, must }) => {
    each({ journey: A, option: 'b', screen: 'ab-home' }, (v, at) => must(/<button\b(?![^>]*\bdisabled\b)[^>]*aria-label="Notices"/.test(v.html), `${said(at)}: Notices is not a real control`));
    each({ journey: A, option: 'b', screen: 'ab-home', surface: ['iphone', 'pwa'] }, (v, at) => must(opensTo(v.html, 'Notices, '), `${said(at)}: no Notices row on a phone`));
    each({ journey: A, option: 'b', screen: 'ab-home', surface: ['iphone', 'pwa'], state: ['default', 'stale', 'offline', 'abstention'] }, (v, at) => has(v.text, /Notices 2 unread · newest detected Tue 22:15/, `${said(at)}: no Notices row on a phone`));   // the owner, 4 Nov 2026, "Draw the pause in Ready (Recommended)": the paused notice is unread in Ready too
    const rows = (v, at) => {
      has(v.text, /US tech is 29\.1% of the portfolio Material risk · detected Tue 22:15 Unread/, `${said(at)}: no detection time or read state`);
      has(v.text, /Dismissed/, `${said(at)}: no dismissed state`);
      has(v.text, /See the evidence/, `${said(at)}: no evidence link`);
      has(v.text, /Dismiss\b/, `${said(at)}: no dismiss`);
      lacks(v.text, /Opening one changes nothing/, `${said(at)}: reads against synced read state`);
    };
    each({ journey: A, option: 'a', screen: 'aa-queue', state: 'default' }, rows);
    each({ journey: A, option: 'b', screen: 'ab-notices', state: 'default' }, rows);
  },

  'R1-r6': ({ each, has }) => {
    const seen = { default: /Confirmed\. It joins from the next close\./, error: /Confirmed, not applied\./, empty: /You refused\. Nothing was added\./, stale: /Expired\. It cannot be approved\./, abstention: /Not added: coverage changed\./ };
    for (const [state, re] of Object.entries(seen)) each({ journey: A, option: 'a', screen: 'aa-after', state }, (v, at) => has(v.text, re, `${said(at)}: no listing outcome`));
    each({ journey: A, option: 'b', screen: 'ab-model-step', state: 'default' }, (v, at) => {
      has(v.text, /Approve with a fresh sign-in/, `${said(at)}: no step-up`);
      has(v.text, /Promote a model/, `${said(at)}: not the promotion`);
    });
    each({ journey: A, option: 'b', screen: 'ab-model-result', state: 'default' }, (v, at) => has(v.text, /Approved\. R2-HGB v4 is on probation\./, `${said(at)}: no probation`));
    each({ journey: A, option: 'b', screen: 'ab-model-result', state: 'stale' }, (v, at) => has(v.text, /Expired\. It cannot be approved\./, `${said(at)}: no expired model proposal`));
  },

  'R1-r7': ({ each, has, lacks }) => {
    for (const [option, screen] of [['a', 'aa-listing'], ['b', 'ab-chat']]) {
      each({ journey: A, option, screen }, (v, at) => lacks(v.text, /code has checked its coverage/, `${said(at)}: Claude says the check is done`));
      each({ journey: A, option, screen, state: 'default' }, (v, at) => has(v.text, /code is checking its coverage and cost/, `${said(at)}: Claude does not say the check is running`));
      each({ journey: A, option, screen, state: 'abstention' }, (v, at) => {
        lacks(v.text, /It joins only if you confirm/, `${said(at)}: a refused proposal says it can join`);
        lacks(v.text, /This adds one watch-only listing/, `${said(at)}: a refused proposal says what it adds`);
        lacks(v.text, /no tier change needed/, `${said(at)}: beside a tier refusal`);
      });
      each({ journey: A, option, screen, state: 'stale' }, (v, at) => lacks(v.text, /It joins only if you confirm/, `${said(at)}: an expired proposal says it can join`));
    }
    each({ journey: A, option: 'b', screen: 'ab-chat', state: ['loading', 'error'] }, (v, at) => {
      lacks(v.text, /Rights and budget/, `${said(at)}: a check that has not run is ticked`);
      lacks(v.text, /Busiest minute/, `${said(at)}: a check that has not run is ticked`);
    });
    each({ journey: A, option: 'b', screen: 'ab-chat', state: 'error' }, (v, at) => has(v.text, /Timed out at 09:14/, `${said(at)}: the coverage check timed out`));
  },

  'R1-r8': ({ each, has, lacks, must }) => {
    for (const [option, screen] of [['a', 'aa-model'], ['b', 'ab-model']]) {
      each({ journey: A, option, screen, state: 'stale' }, (v, at) => {
        has(v.text, /6 of 8 scored weeks/, `${said(at)}: six weeks precede 12 Oct`);
        has(v.text, /paused at 6/, `${said(at)}: six weeks precede 12 Oct`);
        lacks(v.text, /paused at 5|5 of 8 scored/, `${said(at)}: the count disagrees with the ticks`);
        const m = marks(v.html);
        must(m.cells === 9 && m.ticks === 6 && m.paused === 1, `${said(at)}: 6 of 8 reads ${m.ticks} ticks and ${m.paused} paused in ${m.cells} cells, not 6 and 1 in 9`);
      });
      each({ journey: A, option, screen, state: 'default' }, (v, at) => {
        const m = marks(v.html);
        must(m.cells === 9 && m.ticks === 8 && m.paused === 1, `${said(at)}: 8 of 8 reads ${m.ticks} ticks and ${m.paused} paused in ${m.cells} cells, not 8 and 1 in 9`);
      });
    }
  },

  'R1-r9': ({ each, must }) => {
    each({ journey: A, option: 'a', screen: 'aa-queue', state: 'default' }, (v, at) => must(v.html.includes('aria-label="The record"'), `${said(at)}: no path to the record`));
  },

  'R1-r10': ({ each, has, lacks }) => {
    for (const [option, screen] of [['a', 'aa-listing'], ['b', 'ab-chat']]) {
      each({ journey: A, option, screen, state: 'default' }, (v, at) => {
        has(v.text, /18,360 18,411/, `${said(at)}: credits are not DATA-07 plus 51`);
        lacks(v.text, /1,855|1,760|New venue/, `${said(at)}: a charge for a MIC already polled`);
        has(v.text, /30 of the 45-credit cap/, `${said(at)}: busiest minute`);
        lacks(v.text, /31 of the 45/, `${said(at)}: busiest minute`);
      });
      each({ journey: A, option, screen, state: 'noModel' }, (v, at) => lacks(v.text, /covers XNYS/, `${said(at)}: JPM on XNYS has a score`));
    }
    for (const [option, screen] of [['a', 'aa-after'], ['b', 'ab-after']]) each({ journey: A, option, screen, state: 'noModel' }, (v, at) => lacks(v.text, /covers XNYS/, `${said(at)}: JPM on XNYS has a score`));
  },

  'R1-r11': ({ each, has, lacks, must }) => {
    each({ journey: R }, (v, at) => {
      lacks(v.text, /hold lifts/, `${said(at)}: waiting does not bring Claude back`);
      for (const line of sentences(v.text)) if ((/\bClaude\b/.test(line) && CLAUDE_BACK.test(line)) || WAIT.test(line)) must(CLAUDE_OFF.test(line), `${said(at)}: a promised return without Cost's condition: "${line.slice(0, 120)}"`);
    });
    for (const [option, screen] of [['a', 'ra-brief'], ['a', 'ra-ask'], ['b', 'rb-ask'], ['b', 'rb-today'], ['a', 'ra-alert'], ['b', 'rb-alert']]) each({ journey: R, option, screen, state: 'noModel' }, (v, at) => has(v.text, CLAUDE_OFF, `${said(at)}: not Cost's condition`));
  },

  'R1-r12': ({ each, has, must }) => {
    for (const [option, screen] of [['a', 'ra-ask'], ['b', 'rb-ask']]) {
      each({ journey: R, option, screen, state: 'abstention' }, (v, at) => {
        has(v.text, /Today's chat cap is reached/, `${said(at)}: no cap-reached turn`);
        has(v.text, /See stored explanations/, `${said(at)}: no stored explanations on offer`);
      });
    }
    for (const [option, screen] of [['a', 'ra-source'], ['b', 'rb-source']]) {
      each({ journey: R, option, screen, state: 'default' }, (v, at) => {
        must(/<details>\s*<summary[^>]*>Technical detail and glossary/.test(v.html), `${said(at)}: no expand control`);
        has(v.text, /Median: half of outcomes/, `${said(at)}: no glossary`);
      });
    }
  },

  'R1-r13': ({ each, has, lacks, must }) => {
    for (const [option, screen] of [['a', 'ra-card'], ['b', 'rb-card']]) each({ journey: R, option, screen, state: 'noModel' }, (v, at) => lacks(v.text, /Claude is off/, `${said(at)}: a horizon with no model is not Claude off`));
    each({ journey: R, option: 'a', screen: 'ra-card', state: 'noModel' }, (v, at) => {
      lacks(v.text, /Horizon 3 May 2027/, `${said(at)}: a 6-month horizon with 12M selected`);
      has(v.text, /Horizon 3 Nov 2027 No approved model/, `${said(at)}: no 12-month meta`);
      lacks(v.text, /Horizon 3 Nov 2027 R2-HGB/, `${said(at)}: a model named with no model`);
    });
    for (const [option, screen] of [['a', 'ra-alert'], ['b', 'rb-alert']]) {
      each({ journey: R, option, screen, state: 'noModel' }, (v, at) => {
        must(!v.na, `${said(at)}: marked not applicable, but Claude off can occur here`);
        must(/disabled>Ask why<\/button>/.test(v.html), `${said(at)}: Ask why is not unavailable`);
      });
    }
  },

  'R1-r14': ({ each, has, lacks }) => {
    for (const journey of [R, A]) {
      each({ journey }, (v, at) => {
        lacks(v.text.replace(/UK (Tue )?16:35/g, ''), /16:35/, `${said(at)}: 16:35 means only the UK close`);
        lacks(v.text, /delayed since|Yahoo · Fresh.*Yahoo delayed/, `${said(at)}: the old Yahoo story`);
      });
    }
    each({ journey: R, option: 'a', screen: 'ra-brief', state: 'default' }, (v, at) => {
      has(v.text, /Yahoo · HSBC late/, `${said(at)}: the chip`);
      has(v.text, /Late: its last price is 14:10, before the UK close/, `${said(at)}: the HSBC row`);
      has(v.text, /Late but inside the freshness limit.*Proposed · DATA-DEC-02/, `${said(at)}: the limit is proposed`);
    });
    for (const [option, screen] of [['a', 'ra-brief'], ['b', 'rb-today']]) {
      each({ journey: R, option, screen, state: 'stale' }, (v, at) => {
        has(v.text, /Yahoo · HSBC stale/, `${said(at)}: the chip`);
        has(v.text, /Four ranked actions, one on a stale price/, `${said(at)}: counted differently from Ready`);
        lacks(v.text, /Three ranked actions/, `${said(at)}: counted differently from Ready`);
        has(v.text, /£84,051\.05 known, 6 of 7 priced/, `${said(at)}: HSBC leaves the total`);
        has(v.text, /until its price returns/, `${said(at)}: the recovery`);
      });
    }
    each({ journey: A, option: 'b', screen: 'ab-home', state: 'stale' }, (v, at) => {
      has(v.text, /Known value, 6 of 7 priced/, `${said(at)}: the total`);
      has(v.text, /£84,051/, `${said(at)}: the total`);
      lacks(v.text, /£90,155/, `${said(at)}: HSBC is still in the total`);
      lacks(v.text, /HSBC price is late/, `${said(at)}: late beside a stale chip`);
    });
  },

  'R1-r15': ({ each, has, lacks }) => {
    each({ journey: R }, (v, at) => lacks(v.text, /Trimming would narrow/, `${said(at)}: an unsourced line beside a Trim badge`));
    for (const [option, screen] of [['a', 'ra-source'], ['b', 'rb-source']]) {
      each({ journey: R, option, screen, state: 'default' }, (v, at) => {
        has(v.text, /if it were 10% smaller, the width of the portfolio's 80% range would go from 23\.2 to 22\.5 pts/, `${said(at)}: no computed what-if`);
        has(v.text, /5 · What-if, Policy v1/, `${said(at)}: the what-if has no source`);
      });
    }
  },

  'R1-r19': ({ each, lacks }) => {
    // Narrowed for OWN-35, "Code may draft one": the owner settled the MP-114 and MP-78 conflict, so a raise code drafted for your yes is drawn on
    // its own screens. Everywhere else the old refusal holds: no other approval or record may raise a budget.
    const RAISES = /^a[ab]-budget(-step)?$/;
    each({ journey: A }, (v, at) => { if (RAISES.test(at.screen)) return; for (const re of RAISE) lacks(v.text, re, `${said(at)}: MP-114 and MP-78 conflict, so no approval or record may raise a budget`); });
  },

  'R1-r20': ({ each, has }) => {
    for (const [option, screen] of [['a', 'aa-step'], ['b', 'ab-model-step']]) each({ journey: A, option, screen, state: 'default' }, (v, at) => {
      for (const w of ['Artefact', 'Calibrator', 'Tasks 3, 6, 12 months', 'Scope All segments', 'Payload hash', 'Limits 5 points, 10%', 'Previous safe R2-HGB v3']) has(v.text, new RegExp(w), `${said(at)}: the sheet omits "${w}"`);
    });
    each({ journey: A, option: 'a', screen: 'aa-model', state: 'default' }, (v, at) => has(v.text, /23\.2 pts 22\.1 pts/, `${said(at)}: no before value`));
  },

  'R1-r21': ({ each, has, lacks }) => {
    each({ journey: A, option: 'a', screen: 'aa-model', state: 'default' }, (v, at) => has(v.text, /Proposed · SCI-D03/, `${said(at)}: the rules score is open`));
    each({ journey: A, option: 'a', screen: 'aa-result', state: 'default' }, (v, at) => has(v.text, /Proposed · SCI-D07/, `${said(at)}: the bad-week rule is open`));
    each({ journey: R, option: 'a', screen: 'ra-alert', state: 'default' }, (v, at) => {
      lacks(v.text, /Cooldown runs to/, `${said(at)}: a cooldown time on no record`);
      // Narrowed for OWN-34, "Once in 24 hours": the cooldown is settled; CT-18 stays on what is still open, each line's value.
      has(v.text, /It pushes once in 24 hours for this holding, rule and severity/, `${said(at)}: the cooldown the owner picked`);
      has(v.text, /Each line still needs your value before build\. Proposed · CT-18/, `${said(at)}: the line's value is open`);
    });
    // Narrowed in MP-189: the owner pressed "Both keep the five" (MP40-Q12c), so a browser's copy is no longer labelled open. It says it is saved here, and that its protection is unverified.
    for (const journey of [R, A]) each({ journey, surface: ['web', 'pwa'], state: 'offline' }, (v, at) => { has(v.text, /Saved in this browser How a browser protects saved records is unverified\./, `${said(at)}: an offline copy in a browser`); lacks(v.text, /Proposed · MP40-Q12|keeps offline is open/, `${said(at)}: a settled question still labelled open`); });
  },

  'R1-r22': ({ each, must }) => {
    for (const journey of [R, A]) {
      each({ journey }, (v, at) => {
        for (const part of v.html.split(/(?=<div class="hrow)/).slice(1)) {
          const row = own(part);
          if (row.includes('#i-chev-r')) must(/^<div class="hrow[^>]*role="button" tabindex="0" aria-label="[^"]+"/.test(row), `${said(at)}: a row with a chevron is not a control: ${row.slice(0, 120)}`);
        }
      });
    }
    each({ journey: A, option: 'b', screen: 'ab-home', surface: ['iphone', 'ipad', 'web', 'pwa'], state: 'default' }, (v, at) => must(/role="button" tabindex="0" aria-label="4 decisions wait on you\. Next: Taiwan Semiconductor, 18:00"/.test(v.html), `${said(at)}: the strip is not a control`));
  },

  'R1-r23': ({ each, has, lacks }) => {
    each({ journey: A }, (v, at) => lacks(v.text, /09:12|Tonight 22:15|12 rows|ledger revision 214/, `${said(at)}: a slip`));
    each({ journey: A, option: 'b', screen: 'ab-home', state: 'default', surface: ['iphone', 'pwa'] }, (v, at) => has(v.text, /4 decisions wait on you/, `${said(at)}: Option A has 4`));
    for (const [option, screen] of [['a', 'aa-after'], ['b', 'ab-after']]) each({ journey: A, option, screen, state: 'error' }, (v, at) => {
      has(v.text, /Not applied/, `${said(at)}: the chip`);
      lacks(v.text, /Refused/, `${said(at)}: confirmed is not refused`);
    });
    each({ journey: A, option: 'b', screen: 'ab-model', state: 'noModel' }, (v, at) => lacks(v.text, /Approved 1 Oct 2026|Active(?! model)/, `${said(at)}: beside an expired approval`));
    each({ journey: R }, (v, at) => lacks(v.text, /beat earnings next week/, `${said(at)}: results are on 18 Nov`));
    for (const [option, screen] of [['a', 'ra-card'], ['b', 'rb-card']]) each({ journey: R, option, screen, state: 'stale' }, (v, at) => has(v.text, /Version 4/, `${said(at)}: no way to version 4`));
    each({ journey: R, option: 'a', screen: 'ra-card', state: 'stale' }, (v, at) => has(v.html, /aria-label="Card version"/, `${said(at)}: no version control`));
    each({ journey: R, option: 'a', screen: 'ra-alert', state: 'default' }, (v, at) => has(v.text, /1 · Ledger, 22:15/, `${said(at)}: a citation with no sources list`));   // narrowed in MP-186: the ledger as the US run lands (ADM-22)
  },

  // The queue and Home are a flip: the same freshness, on every device, in every state.
  'R2-r1': ({ view, must }) => {
    for (const surface of SURFACES) for (const state of STATES) {
      const a = view(A, 'a', 'aa-queue', surface, state), b = view(A, 'b', 'ab-home', surface, state);
      must(chips(a.html) && chips(a.html) === chips(b.html), `aa-queue and ab-home, ${surface} ${state}: "${chips(a.html)}" against "${chips(b.html)}"`);
      if (surface === 'ipad' || surface === 'web') must(dataLine(a.text) && dataLine(a.text) === dataLine(b.text), `aa-queue and ab-home, ${surface} ${state}: "${dataLine(a.text)}" against "${dataLine(b.text)}"`);
    }
    must(chips(view(A, 'a', 'aa-queue', 'web', 'error').html).includes('error 21:16'), 'aa-queue does not follow the state');   // narrowed in MP-186: after the US run starts (ADM-11)
    must(chips(view(A, 'b', 'ab-notices', 'web', 'stale').html).includes('HSBC stale'), 'ab-notices does not follow the state');
  },

  // The same listing is approved the same way in both options.
  'R2-r2': ({ view, each, has, lacks, must }) => {
    for (const surface of SURFACES) for (const state of STATES.filter((s) => s !== 'noModel')) {
      const sheet = (o, s) => view(A, o, s, surface, state).html.match(/<div class="sheet"[\s\S]*$/);
      const a = sheet('a', 'aa-listing-step'), b = sheet('b', 'ab-step');
      must(a && b && a[0].replace(/<div class="jhome[\s\S]*/, '') === b[0].replace(/<div class="jhome[\s\S]*/, ''), `the two listing step-ups differ, ${surface} ${state}`);
    }
    each({ journey: A, option: 'a', screen: 'aa-listing-step', state: 'default' }, (v, at) => {
      has(v.text, /Approve with a fresh sign-in/, `${said(at)}: no step-up`);
      has(v.text, /Environment Production/, `${said(at)}: not the listing's sheet`);
      has(v.text, /Payload hash 2d7a…b310/, `${said(at)}: not the listing's sheet`);
      // Narrowed for OWN-39, "Anything that writes or widens": confirming a listing widens, so it needs a fresh sign-in by the owner's rule and its CT-01 label is gone. Its expiry stays open.
      has(v.text, /Proposed · MP40-Q9/, `${said(at)}: the listing's expiry is open`); lacks(v.text, /Proposed · CT-01/, `${said(at)}: a sign-in OWN-39 settled, still labelled`);
    });
    for (const [option, screen] of [['a', 'aa-listing'], ['b', 'ab-chat']]) {
      // Narrowed for OWN-39: the foot keeps its fresh sign-in and its expiry label; the CT-01 label is gone.
      each({ journey: A, option, screen, state: ['default', 'noModel', 'disagreement'] }, (v, at) => has(v.text, /Bound to catalogue v14 · expires 18:00 · needs a fresh sign-in Proposed · MP40-Q9/, `${said(at)}: the foot and its labels`));
      each({ journey: A, option, screen, state: 'offline' }, (v, at) => has(v.text, /Bound to catalogue v14 · expires 18:00 · confirming needs a connection and a fresh sign-in Proposed · MP40-Q9/, `${said(at)}: the foot and its labels`));
    }
  },

  // Switching forward and restarting bind what any approval binds, and say how long it lasts.
  'R2-r3': ({ each, has, lacks }) => {
    for (const [option, screen] of [['a', 'aa-restart'], ['b', 'ab-restart']]) {
      each({ journey: A, option, screen }, (v, at) => lacks(v.text, /No expiry/, `${said(at)}: an approval with no expiry`));
      each({ journey: A, option, screen, state: ['default', 'offline', 'disagreement', 'abstention', 'noModel'] }, (v, at) => {
        has(v.text, /This approval is bound to/, `${said(at)}: no bound card`);
        for (const w of ['Artefact', 'Calibrator', 'Tasks', 'Scope', 'Evidence hash', 'Limits', 'Previous safe', 'Expected version', 'Expires 15 minutes after you approve', at.state === 'noModel' ? 'Proposed · POLICY-003' : 'Proposed · SCI-D07']) has(v.text, new RegExp(w), `${said(at)}: no "${w}"`);
        has(v.text, /Your approval then has 15 minutes to apply\. Proposed · CT-02/, `${said(at)}: the window's label is not beside it`);
      });
      // Narrowed for OWN-39, "Anything that writes or widens": switching forward and restarting write, so each needs a fresh sign-in by the owner's rule and loses its CT-01 label. The window's CT-02 label stays.
      each({ journey: A, option, screen, state: ['default', 'disagreement', 'abstention'] }, (v, at) => has(v.text, /Bound to R1-LGB v2 · 15 min once approved · needs a fresh sign-in Proposed · CT-02/, `${said(at)}: the foot and its labels`));
      each({ journey: A, option, screen, state: 'offline' }, (v, at) => has(v.text, /Bound to R1-LGB v2 · 15 min once approved · switching forward needs a connection and a fresh sign-in Proposed · CT-02/, `${said(at)}: the foot and its labels`));
      each({ journey: A, option, screen, state: 'noModel' }, (v, at) => has(v.text, /Bound to R2-HGB v3 on US tech, 12 months · 15 min once approved · needs a fresh sign-in Proposed · CT-02/, `${said(at)}: the foot and its labels`));
      each({ journey: A, option, screen, state: 'noModel' }, (v, at) => {
        has(v.text, /Bound to R2-HGB v3 on US tech, 12 months/, `${said(at)}: the foot does not name the model`);
        has(v.text, /Artefact R2-HGB v3/, `${said(at)}: the card does not name the model`);
      });
      each({ journey: A, option, screen, state: 'default' }, (v, at) => has(v.text, /Artefact R1-LGB v2/, `${said(at)}: the card does not name the model`));
    }
    each({ journey: A, option: 'a', screen: 'aa-queue', state: 'noModel' }, (v, at) => lacks(v.text, /No expiry/, `${said(at)}: an approval with no expiry`));
  },

  // The chat's proposal names what the queue's names.
  'R2-r4': ({ view, each, has, must }) => {
    for (const surface of SURFACES) for (const state of STATES) {
      const a = view(A, 'a', 'aa-listing', surface, state).text, b = view(A, 'b', 'ab-chat', surface, state).text;
      for (const re of [/Taiwan Semiconductor/, /watch-only/, /Expires 18:00/, /Bound to catalogue v14/, /Cannot widen authority/, /Twelve Data end of day/]) must(re.test(a) === re.test(b), `aa-listing and ab-chat, ${surface} ${state}: only one shows ${re}`);
    }
    each({ journey: A, option: 'b', screen: 'ab-chat', state: ['default', 'loading', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'] }, (v, at) => {
      has(v.text, /Taiwan Semiconductor/, `${said(at)}: the proposal is not named`);
      has(v.text, /watch-only/, `${said(at)}: not said to be watch-only`);
    });
    each({ journey: A, option: 'b', screen: 'ab-chat', state: 'offline' }, (v, at) => {
      has(v.text, /Expires 18:00/, `${said(at)}: no expiry`);
      has(v.text, /Bound to catalogue v14/, `${said(at)}: no binding`);
    });
    each({ journey: A, option: 'b', screen: 'ab-chat', state: ['default', 'loading', 'offline', 'noModel', 'disagreement'] }, (v, at) => must(v.html.includes('aria-label="Who did what"'), `${said(at)}: no who-did-what chain`));
    for (const state of STATES) for (const surface of SURFACES) must(/Cannot widen authority/.test(view(A, 'a', 'aa-model', surface, state).text) === /Cannot widen authority/.test(view(A, 'b', 'ab-model', surface, state).text), `aa-model and ab-model, ${surface} ${state}: only one says it cannot widen authority`);
    each({ journey: A, option: 'b', screen: 'ab-model', state: 'default' }, (v, at) => has(v.text, /Cannot widen authority/, `${said(at)}: the limit`));
    each({ journey: A, option: 'b', screen: 'ab-chat', state: 'default' }, (v, at) => has(v.text, /Cannot widen authority/, `${said(at)}: the limit`));
  },

  // The card's flip keeps what is missing, stale or abstained, on every device.
  'R2-r5': ({ each, has, lacks, must }) => {
    for (const [option, screen] of [['a', 'ra-card'], ['b', 'rb-card']]) {
      each({ journey: R, option, screen, state: 'error' }, (v, at) => {
        has(v.text, /Input missing: forward earnings not supplied/, `${said(at)}: the missing input is not shown`);
        lacks(v.text, /31×/, `${said(at)}: a missing input is filled in`);
      });
      each({ journey: R, option, screen, state: 'stale' }, (v, at) => {
        has(v.text, /Stale: benchmark last updated 14:10/, `${said(at)}: the stale input is not shown`);
        lacks(v.text, /\+11\.2%/, `${said(at)}: a stale input is shown as current`);
      });
      each({ journey: R, option, screen, state: 'abstention' }, (v, at) => {
        has(v.text, /AstraZeneca/, `${said(at)}: the model abstained on AstraZeneca`);
        has(v.text, /The model abstained/, `${said(at)}: not said to be abstained`);
        has(v.text, /no range is shown|No range is shown/, `${said(at)}: not said that no range shows`);
        lacks(v.text, /80% range [−+]/, `${said(at)}: a range on an abstained horizon`);
      });
      each({ journey: R, option, screen, state: ['default', 'offline', 'stale'] }, (v, at) => {
        has(v.text, /80% range −18\.5% to \+34\.0%/, `${said(at)}: the uncertainty is not in view`);
        must(/class="badge b-trim"/.test(v.html), `${said(at)}: the action is not in view`);
      });
    }
  },

  // One inbox: the queue, Home and Notices read it alike, and the queue and Home count alike.
  'R2-r6': ({ view, must, has }) => {
    for (const surface of SURFACES) for (const state of STATES) {
      const q = view(A, 'a', 'aa-queue', surface, state).text, h = view(A, 'b', 'ab-home', surface, state).text, n = view(A, 'b', 'ab-notices', surface, state).text;
      must(inbox(q).join('|') === inbox(n).join('|'), `aa-queue and ab-notices, ${surface} ${state}: "${inbox(q)}" against "${inbox(n)}"`);
      for (const re of [/No notices yet/, /Notices did not load/, /From 14:10/, /Read on your iPad/, /1 notice held/]) must(re.test(q) === re.test(n), `aa-queue and ab-notices, ${surface} ${state}: only one says ${re}`);
      must(waits(q) === waits(h), `aa-queue and ab-home, ${surface} ${state}: ${waits(q)} decisions against ${waits(h)}`);
      if (surface === 'ipad' || surface === 'web') must(inbox(q).join('|') === inbox(h).join('|') && unread(q) === unread(h), `aa-queue and ab-home, ${surface} ${state}: the inbox differs`);
      else {
        const line = (h.match(/Notices (\d|None|No notices|Notices did not|Checking)/) || [])[1];
        must(line, `ab-home ${surface} ${state}: no Notices row`);
        if (/^\d$/.test(line)) must(+line === unread(q), `ab-home ${surface} ${state}: ${line} unread against ${unread(q)} on the queue`);
        else must(unread(q) === 0, `ab-home ${surface} ${state}: "${line}" against ${unread(q)} unread on the queue`);
      }
    }
    for (const state of ['stale', 'noModel', 'disagreement', 'abstention']) must(inbox(view(A, 'a', 'aa-queue', 'iphone', state).text).length >= 3, `aa-queue ${state}: the inbox omits its notices`);
    has(view(A, 'a', 'aa-queue', 'iphone', 'empty').text, /No notices yet/, 'aa-queue empty');
    has(view(A, 'a', 'aa-queue', 'iphone', 'error').text, /Notices did not load/, 'aa-queue error');
  },

  // With HSBC out of the total, every share is of the known total, and no day move stands beside it.
  'R2-r8': ({ each, has, lacks }) => {
    each({ journey: A, option: 'b', screen: 'ab-home', state: 'stale' }, (v, at) => {
      for (const w of [/US 53\.8%/, /India 28\.7%/, /UK 11\.0%/, /Cash 6\.6%/]) has(v.text, w, `${said(at)}: not Home's allocation`);
      lacks(v.text, /50\.1|26\.7|17\.0/, `${said(at)}: the full total's allocation`);
    });
    for (const [option, screen] of [['a', 'ra-brief'], ['b', 'rb-today'], ['a', 'ra-alert'], ['b', 'rb-alert']]) {
      each({ journey: R, option, screen, state: 'stale' }, (v, at) => {
        has(v.text, /31\.2% of the known total/, `${said(at)}: US tech on the known total`);
        lacks(v.text, /29\.1%|12\.6% of|share 12\.6%|16\.4%|1,236\.18|1\.39%/, `${said(at)}: a figure from the full total`);   // 12.6% alone is also HSBC's forecast upper range
      });
    }
    for (const [option, screen] of [['a', 'ra-alert'], ['b', 'rb-alert']]) each({ journey: R, option, screen, state: 'stale' }, (v, at) => {
      has(v.text, /Apple is 17\.6% and NVIDIA 13\.6% of the known total/, `${said(at)}: the shares`);
      has(v.text, /Now 31\.2%/, `${said(at)}: the bar's label`);
      has(v.html, /calbar[^>]*><i data-mo="barx" style="width:62\.4%/, `${said(at)}: the bar has not moved`);
    });
    for (const [option, screen] of [['a', 'ra-card'], ['b', 'rb-card']]) each({ journey: R, option, screen, state: 'stale' }, (v, at) => {
      lacks(v.text, /12\.6% of|29\.1%|14\.1%/, `${said(at)}: a figure from the full total`);
      has(v.text, /15\.1% NVIDIA look-through share of the known total/, `${said(at)}: the overlap on the known total`);
    });
    for (const [option, screen] of [['a', 'ra-ask'], ['b', 'rb-ask']]) each({ journey: R, option, screen, state: 'stale' }, (v, at) => has(v.text, /its shares are of the full total/, `${said(at)}: which total the answer uses`));
    each({ journey: A, option: 'a', screen: 'aa-queue', state: 'stale' }, (v, at) => {
      has(v.text, /£84,051\.05 known, 6 of 7 priced/, `${said(at)}: the known total`);
      has(v.text, /US tech is 31\.2% of the known total/, `${said(at)}: the notice`);
    });
  },

  // Revoking can be reached, and is the same import as Holdings'.
  'R2-r9': ({ view, each, has, lacks, must }) => {
    for (const [option, screen] of [['a', 'aa-queue'], ['b', 'ab-home']]) each({ journey: A, option, screen, state: 'empty' }, (v, at) => {
      must(opensTo(v.html, 'Statement import, 9 of 11 rows'), `${said(at)}: nothing leads to the approved import`);
      has(v.text, /Live until 21:33/, `${said(at)}: the window`);
    });
    each({ journey: A, option: 'a', screen: 'aa-queue', state: 'default' }, (v, at) => has(v.text, /moves to Approved, not started/, `${said(at)}: where an approved import goes`));
    for (const [option, screen] of [['a', 'aa-revoke'], ['b', 'ab-revoke']]) {
      each({ journey: A, option, screen }, (v, at) => {
        lacks(v.text, /09:2\d|09:35|6c2e/, `${said(at)}: not Holdings' import`);
        has(v.text, /This records what already happened at your broker\. It places no trade\./, `${said(at)}: the owner's words`);
      });
      each({ journey: A, option, screen, state: ['default', 'offline', 'abstention'] }, (v, at) => {
        has(v.text, /9 of 11 rows/, `${said(at)}: the rows approved`);
        has(v.text, /3 groups/, `${said(at)}: the rows approved`);
        has(v.text, /ledger revision 213/, `${said(at)}: the revision`);
      });
      each({ journey: A, option, screen, state: ['default', 'offline'] }, (v, at) => {
        for (const w of [/Draft revision 6/, /7f3a…c21e/, /Expected revision 213/, /Expires 21:33/, /Apple 60 → 64 units/, /HSBC, HSBA · XLON 700 → 730 units/, /AstraZeneca 85 → 75 units/, /ISA cash £4,012\.60 → £4,142\.83/]) has(v.text, w, `${said(at)}: ${w}`);
        for (const [o, s] of [['a', 'a-live'], ['b', 'b-live']]) {
          const theirs = importRows(view('holdings', o, s, at.surface, at.state).text);
          must(theirs.includes('HSBC') && importRows(v.text) === theirs, `${said(at)}: "${importRows(v.text)}" against Holdings' ${s}, "${theirs}"`);
        }
      });
      each({ journey: A, option, screen, state: 'stale' }, (v, at) => {
        must(enabled(v.html, 'Sign in and approve'), `${said(at)}: an expired approval on an unchanged payload is renewed`);
        has(v.text, /21:33/, `${said(at)}: Holdings' time`);
      });
      each({ journey: A, option, screen, state: 'empty' }, (v, at) => has(v.text, /21:19/, `${said(at)}: Holdings' time`));
      each({ journey: A, option, screen, state: 'error' }, (v, at) => has(v.text, /21:22/, `${said(at)}: Holdings' time`));
      each({ journey: A, option, screen, state: 'disagreement' }, (v, at) => {
        has(v.text, /Refused for a stale revision/, `${said(at)}: Holdings' reading`);
        lacks(v.text, /Already revoked/, `${said(at)}: against Holdings`);
      });
      each({ journey: A, option, screen, state: 'abstention' }, (v, at) => {
        // Narrowed for OWN-16, "An open session is enough": the revoke step-up is gone here and on Holdings, so both read not applicable, for the same reason.
        must(v.na && /OWN-16/.test(v.na), `${said(at)}: not applicable here, and drawn on Holdings`);
        for (const s of ['a-live', 'b-live']) must(/OWN-16/.test(view('holdings', s[0], s, at.surface, 'abstention').na || ''), `${said(at)}: Holdings' ${s} still draws a revoke step-up`);
      });
    }
  },

  // Nothing says an approval is bound where none can happen.
  'R2-r10': ({ each, has, lacks, must }) => {
    for (const [option, set, model] of [['a', 'aa-setting', 'aa-model'], ['b', 'ab-setting', 'ab-model']]) {
      each({ journey: A, option, screen: set, state: ['loading', 'empty', 'abstention'] }, (v, at) => {
        lacks(v.text, /This approval is bound to/, `${said(at)}: bound with no open proposal`);
        lacks(v.text, /Mon 9 Nov/, `${said(at)}: an expiry with no open proposal`);
      });
      each({ journey: A, option, screen: set, state: ['error', 'stale', 'disagreement'] }, (v, at) => {
        lacks(v.text, /This approval is bound to/, `${said(at)}: bound on a refused or expired proposal`);
        has(v.text, /What this proposed/, `${said(at)}: not retitled`);
      });
      each({ journey: A, option, screen: set, state: ['default', 'offline'] }, (v, at) => has(v.text, /This approval is bound to/, `${said(at)}: an open proposal`));
      each({ journey: A, option, screen: model, state: ['loading', 'empty', 'stale', 'abstention'] }, (v, at) => {
        lacks(v.text, /This approval is bound to/, `${said(at)}: bound with no open proposal`);
        lacks(v.text, /Fri 6 Nov/, `${said(at)}: an expiry with no open proposal`);
        lacks(v.text, /This changes which approved artefact/, `${said(at)}: a change with no open proposal`);
      });
      // The owner, 4 Nov 2026 (MP-64): "Only that scope waits (Recommended)", so No model keeps an open proposal, with US tech, 12 months apart.
      each({ journey: A, option, screen: model, state: 'noModel' }, (v, at) => { has(v.text, /This approval is bound to/, `${said(at)}: an open proposal`); has(v.text, /US tech, 12 months stays paused/, `${said(at)}: the scope that waits`); });
      each({ journey: A, option, screen: model, state: ['error', 'disagreement'] }, (v, at) => {
        lacks(v.text, /This approval is bound to/, `${said(at)}: bound on a blocked or refused proposal`);
        has(v.text, /What this proposed/, `${said(at)}: not retitled`);
        lacks(v.text, /This changes which approved artefact/, `${said(at)}: a change on a blocked or refused proposal`);
      });
      each({ journey: A, option, screen: model, state: 'noModel' }, (v, at) => lacks(v.text, /Previous safe R2-HGB v3(?!, where eligible)/, `${said(at)}: v3 can no longer be the safe fallback`));
      each({ journey: A, option, screen: model, state: ['default', 'offline'] }, (v, at) => has(v.text, /This approval is bound to/, `${said(at)}: an open proposal`));
    }
    // A step-up's rail stands beside its sheet on iPad and desktop: bound until the record moves, and only then what was proposed.
    for (const [option, model, set, res] of [['a', 'aa-step', 'aa-setting-step', 'aa-restart-step'], ['b', 'ab-model-step', 'ab-setting-step', 'ab-restart-step']]) {
      for (const screen of [model, set, res]) {
        each({ journey: A, option, screen, surface: WIDE, state: ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'abstention'] }, (v, at) => {
          has(v.text, /This approval is bound to/, `${said(at)}: a sign-in that can still approve`);
          lacks(v.text, /What this propos/, `${said(at)}: a proposal retitled while it can still be approved`);
        });
        each({ journey: A, option, screen, surface: WIDE, state: 'disagreement' }, (v, at) => {
          has(v.text, /this approval is refused/, `${said(at)}: the sheet`);
          lacks(v.text, /This approval is bound to/, `${said(at)}: bound beside a refused approval`);
          has(v.text, /What this proposed/, `${said(at)}: not retitled`);
        });
      }
      // The sheet repeats these rows, so the rail is read on its own: a rail bound to the other model must not pass on the sheet's words.
      each({ journey: A, option, screen: res, surface: WIDE, state: 'noModel' }, (v, at) => {
        const rail = words(railOf(v.html));
        must(sheetOf(v.html).includes('R2-HGB v3'), `${said(at)}: no sheet to tell the rail from`);
        has(rail, /This approval is bound to/, `${said(at)}: the restart's rail reads "${rail.slice(0, 80)}"`);
        has(rail, /Artefact R2-HGB v3 · 91d4/, `${said(at)}: the restart's rail does not name its model`);
        lacks(rail, /R1-LGB/, `${said(at)}: the rail is bound to another model than the sheet`);
      });
      each({ journey: A, option, screen: res, surface: WIDE, state: ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'abstention'] }, (v, at) => {
        const rail = words(railOf(v.html));
        has(rail, /Artefact R1-LGB v2 · 7e20/, `${said(at)}: the switch's rail does not name its model`);
        lacks(rail, /R2-HGB/, `${said(at)}: the rail is bound to another model than the sheet`);
      });
      each({ journey: A, option, screen: res, surface: WIDE, state: 'disagreement' }, (v, at) => lacks(v.text, /The proposal waits for your yes/, `${said(at)}: waits beside a refused approval`));
      // The sheet promises only what the proposal has: a switch forward has no expiry to keep.
      each({ journey: A, option, screen: res, state: ['error', 'offline'] }, (v, at) => {
        lacks(v.text, /keeps its expiry/, `${said(at)}: this proposal has no expiry`);
        has(v.text, /The proposal still waits for your yes\./, `${said(at)}: what it keeps`);
      });
      for (const screen of [model, set]) each({ journey: A, option, screen, state: ['error', 'offline'] }, (v, at) => has(v.text, /The proposal keeps its expiry\./, `${said(at)}: what it keeps`));
    }
    for (const [option, screen] of [['a', 'aa-listing-step'], ['b', 'ab-step']]) each({ journey: A, option, screen, state: ['error', 'offline'] }, (v, at) => has(v.text, /The proposal keeps its expiry\./, `${said(at)}: what it keeps`));
  },

  // Each approve button leads to a drawn step-up and a drawn outcome, on both options.
  'R2-r11': ({ each, has, must }) => {
    for (const [option, set, setOut, res, resOut] of [['a', 'aa-setting-step', 'aa-setting-result', 'aa-restart-step', 'aa-restart-result'], ['b', 'ab-setting-step', 'ab-setting-result', 'ab-restart-step', 'ab-restart-result']]) {
      each({ journey: A, option, screen: set, state: 'default' }, (v, at) => {
        must(v.html.includes('aria-modal="true"'), `${said(at)}: no sheet`);
        has(v.text, /Approve with a fresh sign-in/, `${said(at)}: no step-up`);
        for (const w of [/Owner You/, /Environment Production/, /Setting Weekly band/, /Value 4 points/, /Current version v9/, /Payload hash/, /Expires Mon 9 Nov, 18:00/]) has(v.text, w, `${said(at)}: ${w}`);
      });
      each({ journey: A, option, screen: res, state: 'default' }, (v, at) => {
        must(v.html.includes('aria-modal="true"'), `${said(at)}: no sheet`);
        // Narrowed for OWN-39: switching forward writes, so its fresh sign-in is the owner's rule and the CT-01 label is gone.
        for (const w of [/Switch forward/, /R1-LGB v1 to v2/, /Artefact R1-LGB v2/, /Payload hash/, /Expires 15 minutes after you approve/, /Approve with a fresh sign-in/]) has(v.text, w, `${said(at)}: ${w}`);
      });
      each({ journey: A, option, screen: res, state: 'noModel' }, (v, at) => {
        must(v.html.includes('aria-modal="true"') && !v.na, `${said(at)}: no sheet`);
        for (const w of [/Restart a paused scope/, /Artefact R2-HGB v3/, /Previous safe None eligible/, /Expires 15 minutes after you approve/]) has(v.text, w, `${said(at)}: ${w}`);
      });
      const SET = { default: [/Approved\. The weekly band is 4 points\./, 'Approved'], loading: [/Applying · approved at 09:16/, ''], empty: [/You refused\. Nothing changed\./, 'Refused'], error: [/Approved, not applied\./, 'Not applied'], stale: [/Expired\. It cannot be approved\./, 'Expired'], offline: [/Approved, result not seen yet\./, ''], disagreement: [/Already decided on your iPad\./, 'Approved'] };
      const RES = { default: [/Switched forward\. R1-LGB v2 is active\./, 'Approved'], loading: [/Applying · approved at 09:18/, ''], empty: [/You stayed on v1\. Nothing changed\./, 'Refused'], error: [/Refused by MP\. Nothing changed\./, 'Refused'], stale: [/Expired\. It did not apply\./, 'Expired'], offline: [/Approved, result not seen yet\./, ''], noModel: [/Restarted\. US tech, 12 months is issuing\./, 'Approved'], disagreement: [/Already decided on your iPad\./, 'Approved'] };
      for (const [screen, want] of [[setOut, SET], [resOut, RES]]) for (const [state, [re, chip]] of Object.entries(want)) each({ journey: A, option, screen, state }, (v, at) => {
        has(v.text, re, `${said(at)}: ${re}`);
        must(chipOf(v.html) === chip, `${said(at)}: the chip reads "${chipOf(v.html)}", not "${chip}"`);
      });
    }
  },

  // A paused scope notifies the owner, so the inbox shows it.
  'R2-r12': ({ each, has, must }) => {
    each({ journey: A, option: 'b', screen: 'ab-notices', state: 'noModel' }, (v, at) => must(!v.na, `${said(at)}: marked not applicable`));
    for (const [option, screen] of [['a', 'aa-queue'], ['b', 'ab-notices']]) each({ journey: A, option, screen, state: 'noModel' }, (v, at) => has(v.text, /US tech, 12 months paused Previous model not eligible · detected Tue 21:20 Unread/, `${said(at)}: no paused-scope notice`));
  },

  // The proposals that overlap do overlap.
  'R2-r13': ({ each, has, lacks }) => {
    for (const [option, screen] of [['a', 'aa-queue'], ['b', 'ab-home']]) each({ journey: A, option, screen, state: 'disagreement' }, (v, at) => {
      lacks(v.text, /Two proposals touch the catalogue/, `${said(at)}: only one proposal touches it`);
      has(v.text, /The promotion binds the 5-point band and the settings change moves it to 4/, `${said(at)}: the overlap`);
    });
  },

  // Claude off reads as Cost reads it, on both sides of the flip.
  'R2-r14': ({ each, has, lacks }) => {
    each({ journey: R }, (v, at) => lacks(v.text, /this month/, `${said(at)}: waiting does not bring Claude back`));
    for (const [option, screen] of [['a', 'ra-brief'], ['b', 'rb-today'], ['a', 'ra-ask'], ['b', 'rb-ask']]) each({ journey: R, option, screen, state: 'noModel' }, (v, at) => has(v.text, CLAUDE_OFF, `${said(at)}: not Cost's sentence`));
  },

  // Who abstains and who splits reads the same as Home and Forecast, and no other name does either.
  'R2-r-names': ({ each, has, lacks, must }) => {
    for (const [option, screen] of [['a', 'ra-brief'], ['b', 'rb-today']]) {
      each({ journey: R, option, screen, state: 'abstention' }, (v, at) => {
        has(v.text, /AstraZeneca at 6 months and on Apple at 12 months/, `${said(at)}: who abstained`);
        lacks(v.text, /AstraZeneca has no 12-month|at 12 months, so no range/, `${said(at)}: the wrong horizon`);
      });
      each({ journey: R, option, screen, state: 'disagreement' }, (v, at) => {
        // narrowed in MP-191: Reliance disagrees at every long horizon (OWN-32)
        has(v.text, /Rules and models disagree on Reliance at 3, 6 and 12 months/, `${said(at)}: who disagrees`);
        has(v.text, /split on Apple at 3 months/, `${said(at)}: who splits`);
        has(v.text, /80% range −12\.0% to \+24\.9%, no median/, `${said(at)}: a split shows its range and no median`);
        lacks(v.text, /Two models differ|\+7\.4%/, `${said(at)}: a median on a split`);
        must(!v.html.includes('median +7.4%'), `${said(at)}: a median in the range's label`);
      });
    }
    for (const [option, screen] of [['a', 'ra-card'], ['b', 'rb-card']]) {
      each({ journey: R, option, screen, state: 'disagreement' }, (v, at) => {
        has(v.text, /Reliance/, `${said(at)}: the name that disagrees`);
        lacks(v.text, /NVIDIA|\+7\.4%/, `${said(at)}: no other name, and no median`);
        must(!/median [−+]/.test(v.html), `${said(at)}: a median on a split`);
      });
      each({ journey: R, option, screen, state: 'abstention' }, (v, at) => lacks(v.text, /NVIDIA/, `${said(at)}: no other name abstains`));
    }
    for (const [option, screen] of [['a', 'ra-ask'], ['b', 'rb-ask']]) each({ journey: R, option, screen, state: 'disagreement' }, (v, at) => {
      has(v.text, /Which way does Reliance go at 6 months/, `${said(at)}: the horizon`);
      lacks(v.text, /−1\.5%|\+2\.8%|\+7\.4%/, `${said(at)}: a median on a split`);
    });
    each({ journey: A, option: 'b', screen: 'ab-home', state: 'abstention' }, (v, at) => {
      has(v.text, /AstraZeneca AZN · XLON [^A]*Abstained · no range shown/, `${said(at)}: AstraZeneca abstained`);
      must(!/median \+3\.0%/.test(v.html), `${said(at)}: a range on an abstained horizon`);
    });
  },

  // Small slips: the risk stays on the thread, a phone reaches every card, and no question sits on a closed thread.
  'R2-r19': ({ each, has }) => each({ journey: R, option: 'b', screen: 'rb-today', state: 'noModel' }, (v, at) => has(v.text, /detected Tue 22:15|Detected Tue 22:15/, `${said(at)}: the risk drops off on the flip`)),
  'R2-r20': ({ each, has }) => each({ journey: R, option: 'b', screen: 'rb-card', state: 'default' }, (v, at) => { for (const w of ['Stance', 'Overlap', 'Benchmark', 'Valuation', 'Earnings', 'Profile', 'Scenario']) has(v.text, new RegExp(w), `${said(at)}: no way to ${w}`); }),
  'R2-r21': ({ each, lacks }) => each({ journey: R, option: 'b', screen: 'rb-memory', state: 'noModel' }, (v, at) => lacks(v.text, /What do you remember about me/, `${said(at)}: the thread takes no questions`)),
  'R2-r22': ({ each, lacks }) => each({ journey: R, option: 'b', screen: 'rb-today', state: 'loading' }, (v, at) => lacks(v.text, /stays readable above/, `${said(at)}: nothing is drawn above`)),

  // Round 3. Each listing's expiry says MP40-Q9, every other proposal's expiry and window CT-02, beside the fact and not only on the screen.
  'R3-r1': ({ each, has }) => {
    const LISTING = /[Ee]xpires? (?:today |Today, )?18:00|Expired(?: at)? 18:00|after 18:00|Taiwan Semiconductor, 18:00|Your confirmation holds, for a retry inside its window/;
    const OTHER = /[Ee]xpire[sd]? (?:Fri|Mon)|closed on (?:Fri|Mon)|Expires 15 minutes|The 15 minutes closed|15 min once approved · (?:needs|switching)|[Ww]aits for your yes|Your approval holds, for a retry inside its window|stays with what waits on you/;
    each({ journey: A }, (v, at) => {
      if (LISTING.test(v.text)) has(v.text, /Proposed · MP40-Q9/, `${said(at)}: a listing's expiry with no label`);
      if (OTHER.test(v.text)) has(v.text, /Proposed · CT-02/, `${said(at)}: an expiry with no label`);
    });
    each({ journey: A, option: 'a', screen: 'aa-queue', state: ['default', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'] }, (v, at) => {
      for (const re of [/Expires today 18:00 Proposed · MP40-Q9/, /Expires Fri 18:00 Proposed · CT-02/, /Expires Mon 18:00 Proposed · CT-02/]) has(v.text, re, `${said(at)}: ${re}`);
    });
    each({ journey: A, option: 'a', screen: 'aa-queue', state: 'default' }, (v, at) => has(v.text, /Watch Barclays BARC · XLON · expired 08:14 Run again Proposed · MP40-Q9/, `${said(at)}: a past listing's expiry`));
    each({ journey: A, option: 'a', screen: 'aa-queue', state: 'noModel' }, (v, at) => has(v.text, /Stays open · waits for your yes Proposed · CT-02/, `${said(at)}: the restart's row`));
    each({ journey: A, option: 'a', screen: 'aa-queue', surface: WIDE, state: 'default' }, (v, at) => has(v.text, /Expires 18:00 Proposed · MP40-Q9/, `${said(at)}: the peek`));
    each({ journey: A, option: 'b', screen: 'ab-home', state: 'default' }, (v, at) => has(v.text, /Next: Taiwan Semiconductor, 18:00 Proposed · MP40-Q9/, `${said(at)}: the strip`));
    for (const [option, screen, sheet] of [['a', 'aa-listing', 'aa-listing-step'], ['b', 'ab-chat', 'ab-step']]) {
      each({ journey: A, option, screen, state: ['default', 'offline', 'noModel', 'disagreement'] }, (v, at) => {
        has(v.text, /Expires 18:00 Proposed · MP40-Q9/, `${said(at)}: the head`);
        // Narrowed for OWN-39: the CT-01 label is gone; the expiry keeps MP40-Q9.
        has(v.text, /expires 18:00 · [a-z ]*fresh sign-in Proposed · MP40-Q9/, `${said(at)}: the foot`);
      });
      each({ journey: A, option, screen, state: 'stale' }, (v, at) => has(v.text, /Expired Proposed · MP40-Q9/, `${said(at)}: an expired listing`));
      each({ journey: A, option, screen: sheet, state: ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'disagreement', 'abstention'] }, (v, at) => has(v.text, /Expires Today, 18:00 Proposed · MP40-Q9/, `${said(at)}: the sheet`)); // narrowed for OWN-39: the CT-01 label is gone
    }
    for (const [option, screen] of [['a', 'aa-after'], ['b', 'ab-after']]) each({ journey: A, option, screen, state: 'stale' }, (v, at) => has(v.text, /Expired Proposed · MP40-Q9/, `${said(at)}: an expired listing`));
    for (const [option, model, step, set, setStep] of [['a', 'aa-model', 'aa-step', 'aa-setting', 'aa-setting-step'], ['b', 'ab-model', 'ab-model-step', 'ab-setting', 'ab-setting-step']]) {
      each({ journey: A, option, screen: model, state: 'default' }, (v, at) => {
        for (const re of [/Expires Fri 18:00 Proposed · CT-02/, /Expires Fri 6 Nov, 18:00 Proposed · CT-02/, /expires Fri 18:00 · needs a fresh sign-in Proposed · CT-02/]) has(v.text, re, `${said(at)}: ${re}`);
      });
      each({ journey: A, option, screen: model, state: 'offline' }, (v, at) => {
        for (const re of [/Expires Fri 18:00 Proposed · CT-02/, /expires Fri 18:00 · approving needs a connection and a fresh sign-in Proposed · CT-02/]) has(v.text, re, `${said(at)}: ${re}`);
      });
      each({ journey: A, option, screen: set, state: 'default' }, (v, at) => {
        for (const re of [/Expires Mon 18:00 Proposed · CT-02/, /Expires Mon 9 Nov, 18:00 Proposed · CT-02/, /expires Mon 18:00 · needs a fresh sign-in Proposed · CT-02/]) has(v.text, re, `${said(at)}: ${re}`);
      });
      each({ journey: A, option, screen: set, state: 'offline' }, (v, at) => {
        for (const re of [/Expires Mon 18:00 Proposed · CT-02/, /expires Mon 18:00 · approving needs a connection and a fresh sign-in Proposed · CT-02/]) has(v.text, re, `${said(at)}: ${re}`);
      });
      each({ journey: A, option, screen: set, state: 'stale' }, (v, at) => has(v.text, /Expired Proposed · CT-02/, `${said(at)}: an expired setting`));
      // every state of a sheet draws its rows, so every state keeps the label beside the fact
      each({ journey: A, option, screen: step, state: SHEET_STATES }, (v, at) => has(words(sheetOf(v.html)), /Expires Fri 6 Nov, 18:00 Proposed · CT-02/, `${said(at)}: the sheet`));
      each({ journey: A, option, screen: setStep, state: SHEET_STATES }, (v, at) => has(words(sheetOf(v.html)), /Expires Mon 9 Nov, 18:00 Proposed · CT-02/, `${said(at)}: the sheet`));
    }
    for (const [option, screen] of [['a', 'aa-result'], ['b', 'ab-model-result'], ['a', 'aa-setting-result'], ['b', 'ab-setting-result'], ['a', 'aa-restart-result'], ['b', 'ab-restart-result']]) each({ journey: A, option, screen, state: 'stale' }, (v, at) => has(v.text, /Expired Proposed · CT-02/, `${said(at)}: an expired proposal`));
    for (const [option, screen, sheet] of [['a', 'aa-restart', 'aa-restart-step'], ['b', 'ab-restart', 'ab-restart-step']]) {
      each({ journey: A, option, screen, state: ['default', 'noModel', 'stale', 'offline', 'disagreement', 'abstention'] }, (v, at) => has(v.text, /Stays open · waits for your yes Proposed · CT-02/, `${said(at)}: the head`));
      each({ journey: A, option, screen: sheet }, (v, at) => has(words(sheetOf(v.html)), /Expires 15 minutes after you approve Proposed · CT-02/, `${said(at)}: the sheet`)); // narrowed for OWN-39: the CT-01 label is gone
    }
    each({ journey: A, option: 'a', screen: 'aa-record', state: ['default', 'stale', 'offline', 'error'] }, (v, at) => has(v.text, /Watch Barclays Nobody · expired Wed 08:14 Expired Proposed · MP40-Q9/, `${said(at)}: the record`));
    each({ journey: A, option: 'b', screen: 'ab-history', state: ['default', 'stale', 'offline'] }, (v, at) => has(v.text, /Earlier proposal Thu 22 Oct · nobody acted Expired Proposed · MP40-Q9/, `${said(at)}: the history`));
  },

  // The late-price rule is labelled in the stale banner that states it, and beside the rule in the brief, on both sides of the flip.
  'R3-r2': ({ each, has, must }) => {
    for (const [journey, option, screen] of [[A, 'a', 'aa-queue'], [A, 'b', 'ab-home'], [R, 'a', 'ra-brief'], [R, 'b', 'rb-today'], [R, 'a', 'ra-alert'], [R, 'b', 'rb-alert']]) each({ journey, option, screen, state: 'stale' }, (v, at) => {
      const b = bannerOf(v.html);
      must(/(?:leaves|left) the total until its price returns/.test(b), `${said(at)}: the banner does not state the rule: "${b.slice(0, 120)}"`);
      must(b.includes('Proposed · DATA-DEC-02'), `${said(at)}: the banner states the rule flat`);
    });
    for (const [option, screen] of [['a', 'ra-brief'], ['b', 'rb-today']]) {
      each({ journey: R, option, screen, state: 'stale' }, (v, at) => has(v.text, /it left the total until its price returns\.? Proposed · DATA-DEC-02/i, `${said(at)}: the changes state the rule flat`));
      each({ journey: R, option, screen, state: ['default', 'error', 'offline', 'noModel', 'disagreement', 'abstention'] }, (v, at) => has(v.text, /inside the freshness limit, so its forecast is held\.? Proposed · DATA-DEC-02/, `${said(at)}: the changes state the rule flat`));
    }
  },

  // Option A shows what code checked wherever Option B does, with Confirm live or not.
  'R3-r3': ({ each, has, lacks }) => {
    for (const [option, screen] of [['a', 'aa-listing'], ['b', 'ab-chat']]) {
      each({ journey: A, option, screen, state: ['default', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'] }, (v, at) => {
        has(v.text, /Coverage Twelve Data end of day, Yahoo delayed/, `${said(at)}: no source or delay beside the decision`);
        has(v.text, /Busiest minute 30 of the 45-credit cap/, `${said(at)}: what code checked`);
      });
      each({ journey: A, option, screen, state: 'error' }, (v, at) => has(v.text, /Coverage Timed out at 09:14/, `${said(at)}: where the check stopped`));
      each({ journey: A, option, screen, state: 'loading' }, (v, at) => has(v.text, /Coverage Asking Twelve Data and Yahoo/, `${said(at)}: what is being checked`));
      each({ journey: A, option, screen, state: 'empty' }, (v, at) => lacks(v.text, /What code check/, `${said(at)}: nothing is checked on a decided proposal`));
    }
  },

  // A window that closed says what happened, and offers the way back.
  'R3-r4': ({ each, has, lacks, must }) => {
    for (const [option, screen] of [['a', 'aa-restart-result'], ['b', 'ab-restart-result']]) each({ journey: A, option, screen, state: 'stale' }, (v, at) => {
      has(v.text, /Expired\. It did not apply\./, `${said(at)}: the title`);
      lacks(v.text, /cannot be approved/, `${said(at)}: against "Approve again"`);
      has(v.text, /Approve again for a new window/, `${said(at)}: the way back`);
      must(enabled(v.html, 'Sign in and approve'), `${said(at)}: a dead end`);
    });
  },

  // Each tightened check, and the state no check held: nothing can be approved offline, on any proposal.
  'R3-r5': (a) => {
    for (const id of ['R1-r11', 'R2-r2', 'R2-r3', 'R2-r8', 'R2-r9', 'R2-r10', 'R2-r11', 'R4-r1']) FACTS[id](a);
  },

  'R3-r7': (a) => FACTS['R2-r10'](a),

  // The sign-in label stays with the act after the decision, and on the stop control.
  'R3-r8': ({ each, has, must }) => {
    // Narrowed for OWN-39, "Anything that writes or widens": these acts need a fresh sign-in by the owner's rule, so the CT-01 label is gone.
    // What stays: the record and the outcome still say the act was done with a fresh sign-in, with no label after it.
    const LABEL = '(?!Proposed · CT-01)';
    each({ journey: A, option: 'a', screen: 'aa-record', state: ['default', 'error', 'stale', 'offline'] }, (v, at) => has(v.text, new RegExp(`Taiwan Semiconductor added You · Wed 09:02 · catalogue v15 · fresh sign-in Approved ${LABEL}`), `${said(at)}: the record`));
    each({ journey: A, option: 'b', screen: 'ab-history', state: ['default', 'error', 'stale', 'offline'] }, (v, at) => has(v.text, new RegExp(`Confirmed by you Wed 09:02 · catalogue v15 · fresh sign-in Approved ${LABEL}`), `${said(at)}: the history`));
    for (const [option, res, rev] of [['a', 'aa-restart-result', 'aa-revoke'], ['b', 'ab-restart-result', 'ab-revoke']]) {
      each({ journey: A, option, screen: res, state: ['default', 'noModel'] }, (v, at) => has(v.text, new RegExp(`Applied at 09:18 with your fresh sign-in\\..*? Approved ${LABEL}`), `${said(at)}: the outcome`));
      each({ journey: A, option, screen: res, state: 'stale' }, (v, at) => has(v.text, new RegExp(`Expired Proposed · CT-02 ${LABEL}`), `${said(at)}: signing in again`));
      // Narrowed for OWN-16: revoking needs no fresh sign-in, so no stop control waits behind one.
      each({ journey: A, option, screen: rev, state: 'abstention' }, (v, at) => must(v.na && /OWN-16/.test(v.na), `${said(at)}: a stop control behind a sign-in`));
    }
  },

  'R3-r9': ({ each, lacks }) => {
    for (const [option, screen] of [['a', 'aa-restart'], ['b', 'ab-restart']]) each({ journey: A, option, screen }, (v, at) => lacks(v.text, /15 minutes to apply\. Proposed · SCI-D07/, `${said(at)}: SCI-D07 does not hold the window`));
  },

  // Plain slips: the Reliance turn sits under Reliance, with no median.
  'R3-r10': ({ each, lacks, must }) => {
    each({ journey: R, option: 'a', screen: 'ra-ask', state: 'disagreement' }, (v, at) => must(v.html.includes('aria-label="Back to Reliance"'), `${said(at)}: Back names another holding`));
    each({ journey: R, option: 'a', screen: 'ra-ask', state: 'default' }, (v, at) => must(v.html.includes('aria-label="Back to NVIDIA"'), `${said(at)}: Back`));
    // the thread's pinned calendar still lists NVIDIA's results, which is not a forecast
    for (const [option, screen, other] of [['a', 'ra-ask', /NVIDIA|NVDA|\+9\.1%/], ['b', 'rb-ask', /NVDA|\+9\.1%/]]) each({ journey: R, option, screen, state: 'disagreement' }, (v, at) => {
      lacks(v.text, other, `${said(at)}: another holding beside this answer`);
      must(!/median [−+]/.test(v.html), `${said(at)}: a median on a split`);
    });
  },
  'R3-r11': ({ each, has }) => each({ journey: A, option: 'b', screen: 'ab-home', surface: WIDE, state: 'loading' }, (v, at) => has(v.text, /Checking what waits on you/, `${said(at)}: nothing says proposals are loading`)),
  'R3-r12': ({ each, must }) => {
    for (const [option, screen] of [['a', 'aa-revoke'], ['b', 'ab-revoke']]) each({ journey: A, option, screen, state: ['empty', 'error'] }, (v, at) => must(enabled(v.html, 'Back to Imports'), `${said(at)}: Holdings' way out`));
  },
  'R3-r13': ({ each, has, lacks }) => {
    each({ journey: A }, (v, at) => lacks(v.text, /one retry/, `${said(at)}: MP-78 gives no count`));
    for (const [option, screen] of [['a', 'aa-setting-result'], ['b', 'ab-setting-result'], ['a', 'aa-after'], ['b', 'ab-after']]) each({ journey: A, option, screen, state: 'error' }, (v, at) => has(v.text, /for a retry inside its window/, `${said(at)}: the window`));
  },
  'R3-r14': ({ each, lacks }) => {
    for (const journey of [R, A]) each({ journey }, (v, at) => lacks(v.text, /Proposed · MP40-Q6/, `${said(at)}: MP40-Q6 is about billing data, not a late price`));
  },
  'R3-r15': ({ each, lacks, must }) => {
    for (const [option, screen] of [['a', 'ra-card'], ['b', 'rb-card']]) each({ journey: R, option, screen, state: 'empty' }, (v, at) => {
      lacks(v.text, /[Ll]ast good/, `${said(at)}: a card that was never built has no last good version`);
      must(!/class="sk"|\bsk\b" style/.test(v.html), `${said(at)}: a loading skeleton in Empty`);
    });
  },

  // Round 4. No screen, in any state, offers a decision it may not take: the table above names every live one.
  'R4-r1': ({ each, must }) => {
    each({ journey: A }, (v, at) => {
      if (v.na) return;
      const drawn = button(v.html), live = drawn.filter((b) => !b.off).map((b) => b.name);
      const want = rowsFor(LIVE, at);
      for (const name of DECISIONS) must(live.includes(name) === want.includes(name), `${said(at)}: ${name} is ${live.includes(name) ? 'live, and the table holds it off' : 'not live, and the table has it live'}`);
      for (const name of rowsFor(HELD_OFF, at)) must(drawn.some((b) => b.off && b.name === name), `${said(at)}: no disabled ${name}`);
    });
  },

  // The rail is read apart from the sheet: R2-r10's rail checks, split before they test.
  'R4-r2': (a) => FACTS['R2-r10'](a),

  // A row that opens something is named by everything on it, its status too. Its children are presentational, so the name is all a screen reader gets.
  'R4-r3': ({ each, must, has }) => {
    const same = (t) => words(t).replace(/[.,]/g, '').replace(/\s+/g, ' ');
    let rows = 0;
    for (const journey of [R, A]) each({ journey }, (v, at) => {
      for (const m of v.html.matchAll(/<(\w+)\b[^>]*\brole="button"[^>]*>/g)) {
        rows++;
        must(m[1] === 'div', `${said(at)}: an open ${m[1]} this check cannot read to its end`);
        const name = (m[0].match(/aria-label="([^"]*)"/) || [])[1], seen = same(own(v.html.slice(m.index)));
        must(name, `${said(at)}: a row that opens with no name: "${seen.slice(0, 80)}"`);
        must(seen && same(name).includes(seen), `${said(at)}: the name "${name}" drops what shows: "${seen}"`);
      }
    });
    must(rows > 100, `only ${rows} open rows were read`);
    const name = (html) => [...html.matchAll(/role="button" tabindex="0" aria-label="([^"]*)"/g)].map((m) => m[1]).join(' | ');
    each({ journey: A, option: 'a', screen: 'aa-record', state: 'default' }, (v, at) => {
      for (const re of [/R2-HGB v4 promoted, You · Wed 09:14 · on probation, Approved/, /Taiwan Semiconductor added, You · Wed 09:02 · catalogue v15 · fresh sign-in, Approved(?!, Proposed · CT-01)/, /* narrowed for OWN-39: the CT-01 label is gone */ /Watch Barclays, Nobody · expired Wed 08:14, Expired, Proposed · MP40-Q9/, /Let the chat route add listings, Code · Tue 17:20 · would widen authority, Blocked/, /R1-LGB v2 reverted to v1, Code · Mon 22:20 · 2 bad weeks on probation, Automatic/, /Statement import approval revoked, You · Fri 30 Oct · before the commit started, Revoked/]) has(name(v.html), re, `${said(at)}: ${re}`);
    });
    for (const [option, screen] of [['a', 'ra-memory'], ['b', 'rb-memory']]) {
      each({ journey: R, option, screen, state: 'default' }, (v, at) => {
        for (const re of [/Analyst note says chip demand is cooling, Built from an untrusted news item, Tainted/, /Keep answers short, detail on request, Preference · corrected by you, 2 Oct · v2, Corrected/]) has(name(v.html), re, `${said(at)}: ${re}`);
      });
      each({ journey: R, option, screen, state: 'disagreement' }, (v, at) => has(name(v.html), /NVIDIA is under 10% of my portfolio, Note from chat, 3 Sep · ledger says 12\.6% at 22:15, Left out/, `${said(at)}: the note's status`));   // narrowed in MP-186: the ledger as the US run lands, 22:15 (ADM-22)
    }
  },

  // The late-price limit is DATA-DEC-02 wherever a screen states it, and no other question holds it.
  'R4-r4': ({ each, has, lacks }) => {
    const RULE = /(?:leaves?|left) the total|left out until its price returns|freshness limit/;
    for (const journey of [R, A]) each({ journey }, (v, at) => {
      lacks(v.text, /Proposed · FIN-OD-06/, `${said(at)}: the limit is DATA-DEC-02`);
      if (RULE.test(v.text)) has(v.text, /Proposed · DATA-DEC-02/, `${said(at)}: the limit stated flat`);
    });
  },

  // No new score is not a wait on the owner's yes: the decision stays his, and the screen offers it.
  'R4-r5': ({ each, has, lacks, must }) => {
    for (const [option, screen] of [['a', 'aa-restart'], ['b', 'ab-restart']]) each({ journey: A, option, screen, state: 'abstention' }, (v, at) => {
      lacks(v.text, /[Nn]othing can be approved|waits rather than guess|withheld/, `${said(at)}: a gate no record sets`);
      has(v.text, /code has no new score to show/, `${said(at)}: what is missing`);
      has(v.text, /the decision stays yours/, `${said(at)}: whose decision it is`);
      for (const name of ['Stay on v1', 'Switch forward']) must(enabled(v.html, name), `${said(at)}: ${name} is not live`);
    });
  },

  // Waiting for the yes is settled. What CT-02 leaves open is that the proposal stays open, so that is what the label sits on.
  'R4-r6': ({ each, has, lacks }) => {
    for (const [option, screen] of [['a', 'aa-restart'], ['b', 'ab-restart']]) each({ journey: A, option, screen, state: ['default', 'noModel'] }, (v, at) => {
      has(v.text, /Stays open · waits for your yes Proposed · CT-02/, `${said(at)}: the label is not on what it leaves open`);
      lacks(v.text, /(?<!· )[Ww]aits for your yes Proposed · CT-02/, `${said(at)}: the label sits on a settled fact`);
    });
    each({ journey: A, option: 'a', screen: 'aa-queue', state: 'noModel' }, (v, at) => has(v.text, /Stays open · waits for your yes Proposed · CT-02/, `${said(at)}: the queue's row`));
  },

  // SCI-D07 does not hold restarting: POLICY-003 leaves restart evidence open, so that is what labels it.
  'R4-r7': ({ each, has, lacks }) => {
    each({ journey: A }, (v, at) => { if (/gives it a fresh approval|has a fresh approval/.test(v.text)) has(v.text, /Proposed · POLICY-003/, `${said(at)}: a fresh approval no record gives`); });
    for (const screen of ['aa-restart', 'aa-restart-step', 'aa-restart-result', 'ab-restart', 'ab-restart-step', 'ab-restart-result']) each({ journey: A, option: screen[1], screen, state: 'noModel' }, (v, at) => {
      has(v.text, /Proposed · POLICY-003/, `${said(at)}: restarting is labelled by the wrong question`);
      lacks(v.text, /Proposed · SCI-D07/, `${said(at)}: SCI-D07 does not hold restarting`);
    });
  },

  // The retry window is open, so a failed write says so, under the question that holds each kind.
  'R4-r8': ({ each, has }) => {
    for (const [option, screen, re] of [['a', 'aa-setting-result', /Not applied Proposed · CT-02/], ['b', 'ab-setting-result', /Not applied Proposed · CT-02/], ['a', 'aa-after', /Not applied Proposed · MP40-Q9/], ['b', 'ab-after', /Not applied Proposed · MP40-Q9/]]) each({ journey: A, option, screen, state: 'error' }, (v, at) => has(v.text, re, `${said(at)}: the window stated flat`));
  },

  // Smaller holes: each step-up's lines in the sheet alone, the import's cash, and a wait with no budget word. R3-r1, R1-r11 and R2-r9 hold the rest.
  'R4-r9': (a) => {
    const { each, must } = a;
    const lines = (want) => (v, at) => { const sheet = words(sheetOf(v.html)); for (const line of want) must(sheet.includes(line), `${said(at)}: the sheet drops "${line}"`); };
    for (const [option, listing, model, set, res] of [['a', 'aa-listing-step', 'aa-step', 'aa-setting-step', 'aa-restart-step'], ['b', 'ab-step', 'ab-model-step', 'ab-setting-step', 'ab-restart-step']]) {
      each({ journey: A, option, screen: listing, state: SHEET_STATES }, lines(BOUND_LINES.listing));
      each({ journey: A, option, screen: model, state: SHEET_STATES }, lines(BOUND_LINES.model));
      each({ journey: A, option, screen: set, state: SHEET_STATES }, lines(BOUND_LINES.setting));
      each({ journey: A, option, screen: res, state: SHEET_STATES }, lines(BOUND_LINES.forward));
      each({ journey: A, option, screen: res, state: 'noModel' }, lines(BOUND_LINES.restart));
    }
    for (const id of ['R1-r11', 'R2-r9', 'R3-r1']) FACTS[id](a);
  },

  // Keep paused has an outcome of its own, and it says where the proposal goes.
  'R4-r10': ({ each, has, lacks, must }) => {
    for (const [option, screen] of [['a', 'aa-restart-result'], ['b', 'ab-restart-result']]) each({ journey: A, option, screen, state: 'abstention' }, (v, at) => {
      must(!v.na, `${said(at)}: marked not applicable, so Keep paused has no outcome`);
      has(v.text, /You kept it paused\. Nothing changed\./, `${said(at)}: no outcome for Keep paused`);
      has(v.text, /stays paused, so its forecasts stay withheld/, `${said(at)}: what stays`);
      has(v.text, /The proposal stays with what waits on you/, `${said(at)}: where the proposal goes`);
      has(v.text, /Still paused Proposed · CT-02/, `${said(at)}: the status and its label`);
      lacks(v.text, /Restarted|Switched forward|You stayed on v1/, `${said(at)}: another outcome's words`);
      must(chipOf(v.html) === '', `${said(at)}: the chip reads "${chipOf(v.html)}"`);
    });
  },
};
export default FACTS;
