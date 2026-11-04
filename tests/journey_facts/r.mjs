// Lane r of MP-62 review rounds 1 and 2: Research and Approvals, proved on the rendered screens.
const CLAUDE_OFF = /Claude stays off until credit is verified or you approve paid use, in Settings, with a fresh sign-in\./;
const R = 'research', A = 'approvals';
const SURFACES = ['iphone', 'ipad', 'web', 'pwa'];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
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
const dataLine = (text) => (text.match(/(Last good run Mon 21:15 · cutoff 21:00|As of 21:15 · cutoff 21:00)/) || [''])[0];
// the inbox as a screen draws it
const NOTICE_ROW = /US tech is [\d.]+% of (?:the portfolio|the known total)(?= Material risk)|US tech, 12 months paused|HSBC price is (?:late|stale)|R1-LGB v2 reverted by itself/g;
const inbox = (text) => text.match(NOTICE_ROW) || [];
const unread = (text) => (text.match(/detected \w+ \d\d:\d\d Unread\b/g) || []).length;
const waits = (text) => (text.match(/(\d) decisions? wait on you/) || [])[1];
// a promise that Claude returns, which only Cost's condition may make
const CLAUDE_BACK = /\b(back|return|returns|returning|resume|resumes|again|next month|this month|by itself|automatically|lifts?|resets?|once the)\b/i;
const sentences = (t) => t.split(/(?<=[.!?])\s+/);
const RAISE = [/\b(raise|raising|lift|lifting|increase|increasing|expand|expanding|top up|bump|double|extend)\b[^.·]{0,40}\b(cap|budget|ceiling|allowance|limit)\b/i, /\b(cap|budget|ceiling|allowance)\b[^.·]{0,30}\b(raised|lifted|increased|expanded|to £\d+)/i];

export default {
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
    each({ journey: A, option: 'b', screen: 'ab-home', surface: ['iphone', 'pwa'], state: ['default', 'stale', 'offline', 'abstention'] }, (v, at) => has(v.text, /Notices 1 unread · newest detected Tue 22:15/, `${said(at)}: no Notices row on a phone`));
    const rows = (v, at) => {
      has(v.text, /US tech is 31\.0% of the portfolio Material risk · detected Tue 22:15 Unread/, `${said(at)}: no detection time or read state`);
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
      for (const line of sentences(v.text)) if (/\bClaude\b/.test(line) && CLAUDE_BACK.test(line)) must(CLAUDE_OFF.test(line), `${said(at)}: a promised return without Cost's condition: "${line.slice(0, 120)}"`);
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
      has(v.text, /Late but inside the freshness limit.*Proposed · MP40-Q6/, `${said(at)}: the limit is proposed`);
    });
    for (const [option, screen] of [['a', 'ra-brief'], ['b', 'rb-today']]) {
      each({ journey: R, option, screen, state: 'stale' }, (v, at) => {
        has(v.text, /Yahoo · HSBC stale/, `${said(at)}: the chip`);
        has(v.text, /Four ranked actions, one on a stale price/, `${said(at)}: counted differently from Ready`);
        lacks(v.text, /Three ranked actions/, `${said(at)}: counted differently from Ready`);
        has(v.text, /£78,508\.20 known, 6 of 7 priced/, `${said(at)}: HSBC leaves the total`);
        has(v.text, /until its price returns/, `${said(at)}: the recovery`);
      });
    }
    each({ journey: A, option: 'b', screen: 'ab-home', state: 'stale' }, (v, at) => {
      has(v.text, /Known value, 6 of 7 priced/, `${said(at)}: the total`);
      has(v.text, /£78,508/, `${said(at)}: the total`);
      lacks(v.text, /£84,612/, `${said(at)}: HSBC is still in the total`);
      lacks(v.text, /HSBC price is late/, `${said(at)}: late beside a stale chip`);
    });
  },

  'R1-r15': ({ each, has, lacks }) => {
    each({ journey: R }, (v, at) => lacks(v.text, /Trimming would narrow/, `${said(at)}: an unsourced line beside a Trim badge`));
    for (const [option, screen] of [['a', 'ra-source'], ['b', 'rb-source']]) {
      each({ journey: R, option, screen, state: 'default' }, (v, at) => {
        has(v.text, /if it were 10% smaller, the width of the portfolio's 80% range would go from 24\.7 to 24\.0 pts/, `${said(at)}: no computed what-if`);
        has(v.text, /5 · What-if, Policy v1/, `${said(at)}: the what-if has no source`);
      });
    }
  },

  'R1-r19': ({ each, lacks }) => {
    each({ journey: A }, (v, at) => { for (const re of RAISE) lacks(v.text, re, `${said(at)}: MP-114 and MP-78 conflict, so no approval or record may raise a budget`); });
  },

  'R1-r20': ({ each, has }) => {
    for (const [option, screen] of [['a', 'aa-step'], ['b', 'ab-model-step']]) each({ journey: A, option, screen, state: 'default' }, (v, at) => {
      for (const w of ['Artefact', 'Calibrator', 'Tasks 3, 6, 12 months', 'Scope All segments', 'Payload hash', 'Limits 5 points, 10%', 'Previous safe R2-HGB v3']) has(v.text, new RegExp(w), `${said(at)}: the sheet omits "${w}"`);
    });
    each({ journey: A, option: 'a', screen: 'aa-model', state: 'default' }, (v, at) => has(v.text, /24\.7 pts 23\.5 pts/, `${said(at)}: no before value`));
  },

  'R1-r21': ({ each, has, lacks }) => {
    each({ journey: A, option: 'a', screen: 'aa-model', state: 'default' }, (v, at) => has(v.text, /Proposed · SCI-D03/, `${said(at)}: the rules score is open`));
    each({ journey: A, option: 'a', screen: 'aa-result', state: 'default' }, (v, at) => has(v.text, /Proposed · SCI-D07/, `${said(at)}: the bad-week rule is open`));
    each({ journey: R, option: 'a', screen: 'ra-alert', state: 'default' }, (v, at) => {
      lacks(v.text, /Cooldown runs to/, `${said(at)}: a cooldown time on no record`);
      has(v.text, /Proposed · CT-18/, `${said(at)}: cooldowns are open`);
    });
    for (const journey of [R, A]) each({ journey, surface: ['web', 'pwa'], state: 'offline' }, (v, at) => has(v.text, /Proposed · MP40-Q12/, `${said(at)}: an offline copy in a browser`));
  },

  'R1-r22': ({ each, must }) => {
    for (const journey of [R, A]) {
      each({ journey }, (v, at) => {
        for (const part of v.html.split(/(?=<div class="hrow)/).slice(1)) {
          const row = part.slice(0, part.indexOf('<div class="hrow', 10) > 0 ? part.indexOf('<div class="hrow', 10) : undefined);
          if (row.includes('#i-chev-r') && row.indexOf('#i-chev-r') < 1400) must(/^<div class="hrow[^>]*role="button" tabindex="0" aria-label="[^"]+"/.test(row), `${said(at)}: a row with a chevron is not a control: ${row.slice(0, 120)}`);
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
    each({ journey: A, option: 'b', screen: 'ab-model', state: 'noModel' }, (v, at) => lacks(v.text, /Approved 1 Oct 2026|Active/, `${said(at)}: beside an expired approval`));
    each({ journey: R }, (v, at) => lacks(v.text, /beat earnings next week/, `${said(at)}: results are on 18 Nov`));
    for (const [option, screen] of [['a', 'ra-card'], ['b', 'rb-card']]) each({ journey: R, option, screen, state: 'stale' }, (v, at) => has(v.text, /Version 4/, `${said(at)}: no way to version 4`));
    each({ journey: R, option: 'a', screen: 'ra-card', state: 'stale' }, (v, at) => has(v.html, /aria-label="Card version"/, `${said(at)}: no version control`));
    each({ journey: R, option: 'a', screen: 'ra-alert', state: 'default' }, (v, at) => has(v.text, /1 · Ledger, 21:15/, `${said(at)}: a citation with no sources list`));
  },

  // The queue and Home are a flip: the same freshness, on every device, in every state.
  'R2-r1': ({ view, must }) => {
    for (const surface of SURFACES) for (const state of STATES) {
      const a = view(A, 'a', 'aa-queue', surface, state), b = view(A, 'b', 'ab-home', surface, state);
      must(chips(a.html) && chips(a.html) === chips(b.html), `aa-queue and ab-home, ${surface} ${state}: "${chips(a.html)}" against "${chips(b.html)}"`);
      if (surface === 'ipad' || surface === 'web') must(dataLine(a.text) && dataLine(a.text) === dataLine(b.text), `aa-queue and ab-home, ${surface} ${state}: "${dataLine(a.text)}" against "${dataLine(b.text)}"`);
    }
    must(chips(view(A, 'a', 'aa-queue', 'web', 'error').html).includes('error 21:14'), 'aa-queue does not follow the state');
    must(chips(view(A, 'b', 'ab-notices', 'web', 'stale').html).includes('HSBC stale'), 'ab-notices does not follow the state');
  },

  // The same listing is approved the same way in both options.
  'R2-r2': ({ view, each, has, must }) => {
    for (const surface of SURFACES) for (const state of STATES.filter((s) => s !== 'noModel')) {
      const sheet = (o, s) => view(A, o, s, surface, state).html.match(/<div class="sheet"[\s\S]*$/);
      const a = sheet('a', 'aa-listing-step'), b = sheet('b', 'ab-step');
      must(a && b && a[0].replace(/<div class="jhome[\s\S]*/, '') === b[0].replace(/<div class="jhome[\s\S]*/, ''), `the two listing step-ups differ, ${surface} ${state}`);
    }
    each({ journey: A, option: 'a', screen: 'aa-listing-step', state: 'default' }, (v, at) => {
      has(v.text, /Approve with a fresh sign-in/, `${said(at)}: no step-up`);
      has(v.text, /Environment Production/, `${said(at)}: not the listing's sheet`);
      has(v.text, /Payload hash 2d7a…b310/, `${said(at)}: not the listing's sheet`);
      has(v.text, /Proposed · CT-01/, `${said(at)}: the listing's sign-in is open`);
    });
    for (const [option, screen] of [['a', 'aa-listing'], ['b', 'ab-chat']]) {
      each({ journey: A, option, screen, state: ['default', 'noModel', 'disagreement'] }, (v, at) => {
        has(v.text, /Bound to catalogue v14 · expires 18:00 · needs a fresh sign-in/, `${said(at)}: the foot`);
        has(v.text, /Proposed · CT-01/, `${said(at)}: the listing's sign-in is open`);
      });
    }
  },

  // Switching forward and restarting bind what any approval binds, and say how long it lasts.
  'R2-r3': ({ each, has, lacks }) => {
    for (const [option, screen] of [['a', 'aa-restart'], ['b', 'ab-restart']]) {
      each({ journey: A, option, screen }, (v, at) => lacks(v.text, /No expiry/, `${said(at)}: an approval with no expiry`));
      each({ journey: A, option, screen, state: ['default', 'offline', 'disagreement', 'noModel'] }, (v, at) => {
        has(v.text, /This approval is bound to/, `${said(at)}: no bound card`);
        for (const w of ['Artefact', 'Calibrator', 'Tasks', 'Scope', 'Evidence hash', 'Limits', 'Previous safe', 'Expected version', 'Expires 15 minutes after you approve', 'Proposed · SCI-D07']) has(v.text, new RegExp(w), `${said(at)}: no "${w}"`);
      });
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
      for (const re of [/Taiwan Semiconductor/, /watch-only/, /Expires 18:00/, /Bound to catalogue v14/, /Cannot widen authority/]) must(re.test(a) === re.test(b), `aa-listing and ab-chat, ${surface} ${state}: only one shows ${re}`);
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
      for (const w of [/US 57\.6%/, /India 30\.7%/, /UK 11\.7%/]) has(v.text, w, `${said(at)}: not Home's allocation`);
      lacks(v.text, /53\.4|28\.5|18\.1/, `${said(at)}: the full total's allocation`);
    });
    for (const [option, screen] of [['a', 'ra-brief'], ['b', 'rb-today'], ['a', 'ra-alert'], ['b', 'rb-alert']]) {
      each({ journey: R, option, screen, state: 'stale' }, (v, at) => {
        has(v.text, /33\.4% of the known total/, `${said(at)}: US tech on the known total`);
        lacks(v.text, /31\.0%|13\.5%|17\.5%|1,236\.18|1\.48%/, `${said(at)}: a figure from the full total`);
      });
    }
    for (const [option, screen] of [['a', 'ra-alert'], ['b', 'rb-alert']]) each({ journey: R, option, screen, state: 'stale' }, (v, at) => {
      has(v.text, /Apple is 18\.9% and NVIDIA 14\.5% of the known total/, `${said(at)}: the shares`);
      has(v.text, /Now 33\.4%/, `${said(at)}: the bar's label`);
      has(v.html, /calbar[^>]*><i data-mo="barx" style="width:66\.8%/, `${said(at)}: the bar has not moved`);
    });
    for (const [option, screen] of [['a', 'ra-card'], ['b', 'rb-card']]) each({ journey: R, option, screen, state: 'stale' }, (v, at) => lacks(v.text, /13\.5%|31\.0%/, `${said(at)}: a figure from the full total`));
    for (const [option, screen] of [['a', 'ra-ask'], ['b', 'rb-ask']]) each({ journey: R, option, screen, state: 'stale' }, (v, at) => has(v.text, /its shares are of the full total/, `${said(at)}: which total the answer uses`));
    each({ journey: A, option: 'a', screen: 'aa-queue', state: 'stale' }, (v, at) => {
      has(v.text, /£78,508\.20 known, 6 of 7 priced/, `${said(at)}: the known total`);
      has(v.text, /US tech is 33\.4% of the known total/, `${said(at)}: the notice`);
    });
  },

  // Revoking can be reached, and is the same import as Holdings'.
  'R2-r9': ({ each, has, lacks, must }) => {
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
        for (const w of [/Draft revision 6/, /7f3a…c21e/, /Expected revision 213/, /Expires 21:33/, /Apple 60 → 64 units/, /AstraZeneca 85 → 75 units/, /ISA cash £4,012\.60 → £4,142\.83/]) has(v.text, w, `${said(at)}: ${w}`);
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
        must(!v.na, `${said(at)}: not applicable here, and drawn on Holdings`);
        has(v.text, /Fresh sign-in needed/, `${said(at)}: Holdings' reading`);
      });
    }
  },

  // Nothing says an approval is bound where none can happen.
  'R2-r10': ({ each, has, lacks }) => {
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
      each({ journey: A, option, screen: model, state: ['error', 'noModel', 'disagreement'] }, (v, at) => {
        lacks(v.text, /This approval is bound to/, `${said(at)}: bound on a blocked or refused proposal`);
        has(v.text, /What this proposed/, `${said(at)}: not retitled`);
        lacks(v.text, /This changes which approved artefact/, `${said(at)}: a change on a blocked or refused proposal`);
      });
      each({ journey: A, option, screen: model, state: 'noModel' }, (v, at) => lacks(v.text, /Previous safe R2-HGB v3/, `${said(at)}: v3 can no longer be the safe fallback`));
      each({ journey: A, option, screen: model, state: ['default', 'offline'] }, (v, at) => has(v.text, /This approval is bound to/, `${said(at)}: an open proposal`));
    }
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
        for (const w of [/Switch forward/, /R1-LGB v1 to v2/, /Artefact R1-LGB v2/, /Payload hash/, /Expires 15 minutes after you approve/, /Proposed · CT-01/]) has(v.text, w, `${said(at)}: ${w}`);
      });
      each({ journey: A, option, screen: res, state: 'noModel' }, (v, at) => {
        must(v.html.includes('aria-modal="true"') && !v.na, `${said(at)}: no sheet`);
        for (const w of [/Restart a paused scope/, /Artefact R2-HGB v3/, /Previous safe None eligible/, /Expires 15 minutes after you approve/]) has(v.text, w, `${said(at)}: ${w}`);
      });
      each({ journey: A, option, screen: setOut, state: 'default' }, (v, at) => has(v.text, /Approved\. The weekly band is 4 points\./, `${said(at)}: no outcome`));
      each({ journey: A, option, screen: setOut, state: 'error' }, (v, at) => has(v.text, /Approved, not applied\./, `${said(at)}: a failed write`));
      each({ journey: A, option, screen: resOut, state: 'default' }, (v, at) => has(v.text, /Switched forward\. R1-LGB v2 is active\./, `${said(at)}: no outcome`));
      each({ journey: A, option, screen: resOut, state: 'noModel' }, (v, at) => has(v.text, /Restarted\. US tech, 12 months is issuing\./, `${said(at)}: no outcome`));
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
        has(v.text, /Rules and models disagree on Reliance at 6 months/, `${said(at)}: who disagrees`);
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
};
