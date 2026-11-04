// Lane r of MP-62 review round 1: Research and Approvals, proved on the rendered screens.
const CLAUDE_OFF = /Claude stays off until credit is verified or you approve paid use, in Settings, with a fresh sign-in\./;
const R = 'research', A = 'approvals';
const said = (at) => `${at.journey}.${at.screen} ${at.surface} ${at.state}`;

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
        must(/<button[^>]*>Switch forward<\/button>/.test(v.html), `${said(at)}: no switch-forward decision`);
      });
      each({ journey: A, option, screen: res, state: 'noModel' }, (v, at) => {
        has(v.text, /Restart US tech, 12 months/, `${said(at)}: no restart proposal`);
        has(v.text, /Keep paused/, `${said(at)}: no way to keep it paused`);
      });
      each({ journey: A, option, screen: rev, state: 'default' }, (v, at) => has(v.text, /Revoke this approval/, `${said(at)}: nothing to revoke with`));
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
    each({ journey: A, option: 'b', screen: 'ab-home' }, (v, at) => must(v.html.includes('aria-label="Notices') && /Notices/.test(v.text + v.html), `${said(at)}: no route to Notices`));
    each({ journey: A, option: 'b', screen: 'ab-home', surface: ['iphone', 'pwa'] }, (v, at) => has(v.text, /Notices 1 unread · newest detected Tue 22:15/, `${said(at)}: no Notices row on a phone`));
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

  'R1-r8': ({ each, has, lacks }) => {
    for (const [option, screen] of [['a', 'aa-model'], ['b', 'ab-model']]) {
      each({ journey: A, option, screen, state: 'stale' }, (v, at) => {
        has(v.text, /6 of 8 scored weeks/, `${said(at)}: six weeks precede 12 Oct`);
        has(v.text, /paused at 6/, `${said(at)}: six weeks precede 12 Oct`);
        lacks(v.text, /paused at 5|5 of 8 scored/, `${said(at)}: the count disagrees with the ticks`);
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

  'R1-r11': ({ each, has, lacks }) => {
    each({ journey: R }, (v, at) => lacks(v.text, /hold lifts/, `${said(at)}: waiting does not bring Claude back`));
    for (const [option, screen] of [['a', 'ra-ask'], ['b', 'rb-ask'], ['b', 'rb-today'], ['a', 'ra-alert'], ['b', 'rb-alert']]) each({ journey: R, option, screen, state: 'noModel' }, (v, at) => has(v.text, CLAUDE_OFF, `${said(at)}: not Cost's condition`));
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
    each({ journey: A }, (v, at) => lacks(v.text, /Raise the Claude cap/, `${said(at)}: MP-114 and MP-78 conflict, so the record must not settle it`));
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
};
