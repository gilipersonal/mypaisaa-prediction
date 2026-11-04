/* Approvals: what waits on the owner, exactly what would change, the step-up, the outcome and the record (MP-62).
   Stories MP-55, MP-78, MP-131, MP-74, MP-114, MP-156, MP-159, MP-162. Claude proposes, code checks, the owner decides. An
   approval is bound to one exact change, can never widen authority, and an expired one cannot be approved. All journeys
   share one script, so this block keeps its helpers. Every figure is illustrative. */
{
  const wide = ctx => ctx.kind === 'ipad' || ctx.kind === 'web';

  /* ---------- Prism rows and small parts, composed the same way on every screen ---------- */
  const bs = (label, kind = 'tinted', icon = '') => `<button class="btn sm btn-${kind}" type="button">${icon ? ic(icon, 's16') : ''}${label}</button>`;
  const lead = (i, tone = '') => { const [bg, fg] = tone === 'warn' ? ['--warn-tint', '--warn'] : tone === 'fall' ? ['--fall-tint', '--fall'] : tone === 'rise' ? ['--rise-tint', '--rise'] : tone === 'sel' ? ['--surface', '--ink'] : ['--surface-2', '--ink']; return `<span class="logo" style="--c:var(${bg});color:var(${fg});--ic2:var(--link)" aria-hidden="true">${ic(i, 's18')}</span>`; };
  const item = (l, t, s, r = '', x = '', sel = false) => `<div class="hrow${sel ? ' sel' : ''}" data-mo="rise">${l}<div style="min-width:0"><div class="nm" style="white-space:normal">${t}</div><div class="tk" style="white-space:normal">${s}</div></div><div class="vv" style="justify-self:end;text-align:right">${r}</div>${x ? `<div class="fl" style="display:block">${x}</div>` : ''}</div>`;
  const list = rows => `<div class="list card" style="margin:0" data-mo="card">${rows}</div>`;
  const sec = (t, r = '') => `<div class="sech" style="padding:8px 4px 0" data-mo="rise"><h3 style="font:600 17px/22px var(--font-text);letter-spacing:-.01em">${t}</h3>${r}</div>`;
  const kv = rows => `<dl class="kv">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  const box = (inner, st = '') => `<div class="card fcard" data-mo="card" style="${st}">${inner}</div>`;
  const lbl = t => `<div class="label">${t}</div>`;
  const pad = ctx => (wide(ctx) ? '' : '<div style="height:64px" aria-hidden="true"></div>');
  /* the sidebar has a sixth item, Data sources, so Settings is 5 there and 4 on the tab bar */
  const SET = ctx => (wide(ctx) ? 5 : 4);

  /* ---------- Claude's component and the marks of who did what ---------- */
  const mark = (cls = '') => `<span class="cl-mark${cls}" aria-hidden="true"><i></i><i></i><i></i></span>`;
  const TICK = `<svg class="cl-tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13 10 19 20 6"/></svg>`;
  const step = (t, sub = '', st = 'done') => `<li class="cl-step" style="align-items:start">${st === 'done' ? TICK : st === 'now' ? '<span class="spin" style="margin:2px;color:var(--link)" aria-hidden="true"></span>' : `<span style="display:grid;place-items:center;color:var(--fall)" aria-hidden="true">${ic('x', 's16')}</span>`}<span><b style="font-weight:600;color:var(--ink)">${t}</b>${sub ? `<br>${sub}` : ''}</span></li>`;
  const steps = (...s) => `<ol class="cl-steps" style="gap:8px">${s.join('')}</ol>`;
  const cl = (status, inner, label = 'Claude') => `<article class="cl" data-mo="card" style="max-width:none" aria-label="${label}"><header class="cl-head">${mark()}<span class="cl-who">Claude</span><span class="cl-status" role="status">${status}</span></header>${inner}</article>`;
  const ask = t => `<p class="cl-q" data-mo="rise">${t}</p>`;
  const SAY = t => `<p class="cl-a">${t}</p>`;
  /* one line that says who did what, the same on every proposal */
  const chain = (a = 'Claude drafted', b = 'Code checked', c = 'You decide') => `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px" data-mo="rise" role="list" aria-label="Who did what">${[[mark(' s'), a], [ic('check', 's16'), b], [ic('person', 's16'), c, true]].map(([i, t, on]) => `<div role="listitem" style="display:flex;gap:6px;align-items:center;min-height:40px;padding:6px 8px;border-radius:var(--r-sm);min-width:0;font:600 12px/16px var(--font-text);letter-spacing:0;${on ? 'background:var(--btn);color:var(--btn-ink)' : 'background:var(--surface);color:var(--ink);box-shadow:var(--shadow-1)'}">${i}<span>${t}</span></div>`).join('')}</div>`;
  const limits = t => banner('', 'Cannot widen authority.', `${t} It grants no tool, source, budget or permission, and code refuses any change that would.`, 'shield');
  const expiry = (t, cls = 'stale') => `<span class="chip ${cls}">${ic('clock', 's14')}${t}</span>`;
  const status = {
    approved: '<span class="chip fresh"><span class="dot"></span>Approved</span>', refused: `<span class="chip error">${ic('x', 's14')}Refused</span>`, expired: expiry('Expired'),
    blocked: `<span class="chip error">${ic('ban', 's14')}Blocked</span>`, auto: `<span class="chip">${ic('refresh', 's14')}Automatic</span>`
  };
  /* what would change, line by line: before, after, and why */
  const change = rows => rows.map(([k, a, b, s], i) => `<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:0 12px;padding:9px 0;align-items:baseline;${i ? 'border-top:1px solid var(--hairline);' : ''}"><span class="small muted">${k}</span><span style="display:inline-flex;align-items:center;gap:6px;font:600 15px/20px var(--font-text);letter-spacing:-.01em;white-space:nowrap">${a ? `<span style="font-weight:400;color:var(--ink-2)">${a}</span>${ic('chev-r', 's14')}` : ''}${b}</span>${s ? `<span class="small muted" style="grid-column:1/-1">${s}</span>` : ''}</div>`).join('');
  const changeCard = (rows, title = 'Exactly what would change') => box(`${lbl(title)}<div style="margin-top:4px">${change(rows)}</div>`);
  /* the decision: above the dock on a phone, in reach; first in the rail on iPad and desktop */
  const buttons = (yes, o = {}) => (o.only ? `<div style="display:grid;gap:8px">${o.only}</div>` : `<div style="display:grid;grid-template-columns:1fr 1.5fr;gap:8px"><button class="btn sm btn-tinted" type="button"${o.off ? ' disabled' : ''}>${o.no || 'Refuse'}</button><button class="btn sm btn-primary" type="button"${o.off ? ' disabled' : ''}>${yes}</button></div>`);
  const decideBar = (ctx, yes, foot, o = {}) => (wide(ctx) ? '' : `<div style="display:grid;gap:6px;padding:2px"><p class="small" style="text-align:center;color:var(--ink)">${foot}</p>${buttons(yes, o)}</div>`);
  const decideCard = (ctx, yes, foot, o = {}) => (wide(ctx) ? box(`${lbl('Your decision')}<p class="small muted" style="margin:4px 0 10px">${foot}</p>${buttons(yes, o)}`) : '');

  /* ---------- the listing Claude proposed (MP-131, MP-74) ---------- */
  const TSM = { n: 'Taiwan Semiconductor', c: '--seg-ustech', lg: 'TS' };
  const headCard = (l, t, s, chip) => `<div class="card" style="padding:14px 16px;display:flex;gap:12px;align-items:flex-start" data-mo="card">${l}<div style="flex:1;min-width:0"><div style="font:700 20px/25px var(--font-text);letter-spacing:-.01em">${t}</div><div class="small muted">${s}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${chip}</div></div></div>`;
  const listingHead = (chip = expiry('Expires 18:00')) => headCard(logo(TSM.c, TSM.lg), TSM.n, 'TSM · XNYS · watch-only', chip);
  const TSM_ROWS = [
    ['Catalogue version', 'v14', 'v15'],
    ['Watch-only listings', '3', '4', 'Tracked and forecast, not held.'],
    ['Credits a month', '1,760', '1,855', 'Bar and retry 44, actions 7, new venue XNYS 44.'],
    ['Credits once', '', '42', 'One backfill.'],
    ['Cash a month', '', '£0', 'Stays inside Grow 55. The £100 ceiling is untouched.'],
    ['Joins from', '', 'The next close']
  ];
  const checks = () => box(`${lbl('What code checked')}<div style="margin-top:8px">${steps(step('Identity', 'TSM on XNYS, the US listing'), step('Coverage', 'Twelve Data end of day, Yahoo delayed'), step('Busiest minute', '31 of the 45-credit cap'), step('Rights and budget', 'Recorded, and no tier change needed'))}</div>`);
  const fromChat = () => `${ask('Watch TSMC for me')}${cl('Proposed 08:41', SAY(`I can't add a listing myself. I've drafted this one, and code has checked its coverage and cost. It joins only if you confirm it in the app.`), 'Claude proposed a listing')}`;
  /* the whole proposal in every state. o.chat drops the header when it sits inside a chat */
  const listingCore = (ctx, o = {}) => {
    const head = (c) => (o.chat ? '' : listingHead(c));
    const trail = (o.chat ? '' : chain());
    return region(ctx, {
      what: 'This proposal', rows: 3, ok: () => head() + trail + changeCard(TSM_ROWS) + (o.chat ? '' : checks()),
      loading: () => head(`<span class="chip"><span class="spin" aria-hidden="true"></span>Checking</span>`) + (o.chat ? '' : chain('Claude drafted', 'Code checking', 'You decide')) + box(`${lbl('Checking coverage with Twelve Data')}<p class="small muted" style="margin-top:4px">8 credits reserved first. Nothing can be confirmed until this finishes.</p><div style="margin-top:8px">${steps(step('Identity', 'TSM on XNYS, the US listing'), step('Coverage', 'Asking Twelve Data and Yahoo', 'now'))}</div>`),
      empty: () => stateCard('check', 'Already decided', 'You confirmed this on your iPad at 09:12, so there is nothing left to do here. One approval record was made.', bs('See the record')),
      error: () => head(`<span class="chip error">Not yet checked</span>`) + stateCard('alert', 'The check timed out', 'The coverage probe stopped at 09:14. Its 8 credits stay reserved until they reconcile, and nothing can be confirmed until a check finishes.', bs('Run the check again', 'tinted', 'refresh')),
      stale: () => banner('warn', 'Expired at 18:00.', 'An expired proposal cannot be approved. The catalogue may have moved, so the check must run again.', 'clock') + head(expiry('Expired')) + changeCard(TSM_ROWS, 'What this proposed'),
      offline: () => banner('', 'Offline.', 'You can read this proposal. Confirming needs a connection, because the server rechecks it first.', 'wifi-off') + head() + trail + changeCard(TSM_ROWS),
      noModel: () => banner('', 'No forecast on day one.', 'No approved model covers XNYS yet. The price is tracked from the next close, and a forecast appears only once a model qualifies.', 'cube') + head() + trail + changeCard(TSM_ROWS.map(r => (r[0] === 'Watch-only listings' ? [r[0], r[1], r[2], 'Tracked, with no forecast yet.'] : r))),
      disagreement: () => banner('', 'Two listings match.', 'Claude drafted TSM on XNYS, and code also found 2330 on XTAI. XTAI needs new calendars and rights work, so it goes to the extension checklist and cannot be added here.', 'split') + head() + trail + changeCard(TSM_ROWS),
      abstention: () => head(status.refused) + stateCard('ban', 'Code refused this proposal', 'Adding it would need a higher Twelve Data tier. MP never upgrades a plan to fit an addition, so nothing is added. A tier change is a separate decision with its own costing.', bs('See the cost'), '<span class="chip">Needs a higher tier</span>')
    });
  };
  const listingYes = (ctx, foot, yes = 'Confirm') => {
    const st = ctx.state;
    if (st === 'stale') return { yes, foot: 'An expired proposal cannot be approved', o: { only: bs('Run the check again', 'primary', 'refresh') } };
    if (st === 'offline') return { yes, foot: 'Confirming needs a connection', o: { off: true } };
    if (st === 'loading' || st === 'error') return { yes, foot: 'Nothing can be confirmed until the check finishes', o: { off: true } };
    if (st === 'empty' || st === 'abstention') return null;
    return { yes, foot, o: {} };
  };

  /* ---------- the model promotion (MP-156, MP-159) ---------- */
  const WEEKS = ['31 Aug', '7 Sep', '14 Sep', '21 Sep', '28 Sep', '5 Oct', '12 Oct', '19 Oct', '26 Oct'];
  const trial = (o = {}) => {
    const stop = o.stop == null ? 9 : o.stop;
    return `<div style="display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:5px;margin-top:10px" role="img" aria-label="${o.label || 'Nine weeks in shadow: eight scored, and the week of 12 October paused by a data outage'}">${WEEKS.map((w, i) => { const off = i >= stop, p = i === 6 && !off; return `<i data-mo="chip" style="display:grid;place-items:center;height:30px;border-radius:9px;color:var(--surface);${off ? 'box-shadow:inset 0 0 0 1.5px var(--hairline-2)' : p ? 'box-shadow:inset 0 0 0 1.5px var(--ink-2);color:var(--ink-2)' : 'background:var(--scored)'}">${off ? '' : ic(p ? 'pause' : 'check', 's14')}</i>`; }).join('')}</div><div class="small muted" style="display:flex;justify-content:space-between;margin-top:6px"><span>w/c 31 Aug</span><span>w/c 26 Oct</span></div>`;
  };
  const modelHead = (chip = expiry('Expires Fri 18:00')) => headCard(lead('cube'), 'Promote R2-HGB v4', '3, 6 and 12 months · all segments', chip);
  const evidence = (o = {}) => box(`<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px">${lbl('Shadow trial')}<span class="small muted">${o.count || '8 of 8 scored weeks'}</span></div>${trial(o)}<p class="small muted" style="margin-top:8px">${o.text || 'The week of 12 Oct could not be scored after a data outage, so the count paused. No forecast from this trial reached you.'}</p>`);
  const scoreTable = (o = {}) => box(`${lbl('Against both comparators · Brier score, lower is better')}<div style="overflow-x:auto"><table class="ht" style="margin-top:6px"><thead><tr><th>Evidence</th><th class="r">v4</th><th class="r">Rules</th><th class="r">Base rate</th></tr></thead><tbody><tr><td>1 to 20 sessions, live shadow</td><td class="r"><b>${o.live || '0.201'}</b></td><td class="r">${o.rule || '0.209'}</td><td class="r">0.214</td></tr><tr><td>3, 6, 12 months, walk-forward</td><td class="r"><b>0.188</b></td><td class="r">0.197</td><td class="r">0.203</td></tr></tbody></table></div><p class="small muted" style="margin-top:8px">No 3, 6 or 12-month forecast has matured in these 8 weeks. They prove clean running and calibration so far; walk-forward history carries the accuracy evidence, and 8 weeks alone never validate 12 months.</p>`);
  const MODEL_ROWS = [['Active model', 'v3', 'v4'], ['Calibrator', 'c7', 'c8'], ['Typical 80% range', '', '1.2 points narrower'], ['Cost a month', '', '£0'], ['If it slips', '', 'Back to v3 by itself', 'On probation for 4 live weeks, it reverts after 2 bad weeks. After that, after 4.']];
  const bound = () => box(`${lbl('This approval is bound to')}<div style="margin-top:8px">${kv([['Artefact', '4be1…09fa'], ['Calibrator', 'c8'], ['Tasks', '3, 6, 12 months'], ['Scope', 'All segments'], ['Evidence hash', '9c1e…44ab'], ['Limits', '5 points, 10%'], ['Previous safe', 'R2-HGB v3'], ['Expires', 'Fri 6 Nov, 18:00']])}</div>`);
  const modelCore = (ctx, o = {}) => {
    const head = (c) => (o.noHead ? '' : modelHead(c)), trail = o.noHead ? '' : chain('Tuner built', 'Code trialled', 'You decide');
    return region(ctx, {
      what: 'This promotion', rows: 3, ok: () => head() + trail + evidence() + scoreTable() + changeCard(MODEL_ROWS),
      loading: () => head(`<span class="chip"><span class="spin" aria-hidden="true"></span>Loading</span>`) + box(`${lbl('Reading the stored evidence')}<span class="sk" style="height:30px;margin-top:10px"></span><span class="sk" style="height:60px;margin-top:10px"></span>`),
      empty: () => head(`<span class="chip">In shadow</span>`) + evidence({ count: 'Week 5 of 8', stop: 5, label: 'Five of eight weeks scored so far', text: 'Nothing to decide yet. A candidate needs 8 scored weeks and must beat both comparators before it can reach you.' }),
      error: () => head(status.refused) + stateCard('alert', 'The evidence changed', 'The evidence hash no longer matches what this proposal was built on, so it cannot be approved. The trial stays readable, and code rebuilds the proposal.', bs('See what changed'), `<span class="chip error">Evidence hash mismatch</span>`),
      stale: () => head(`<span class="chip stale">Count paused</span>`) + evidence({ count: '5 of 8 scored weeks', stop: 7, label: 'Count paused after a week that could not be scored', text: 'The week of 12 Oct could not be scored, so the count is paused at 5. The trial still needs 8 scored weeks.' }),
      offline: () => banner('', 'Offline.', 'You can read the evidence. Approving needs a connection and a fresh sign-in.', 'wifi-off') + head() + trail + evidence() + scoreTable(),
      noModel: () => banner('fall', 'Previous model not eligible.', 'R2-HGB v3 can no longer be the safe fallback, because its approval has expired. Until you approve a safe version, this cannot be promoted.', 'cube') + head(status.blocked) + evidence(),
      disagreement: () => head(status.blocked) + stateCard('split', 'It beat one comparator, not both', 'R2-HGB v4 beat the base rate but not the current rules on live shadow, so it cannot be promoted. A rejected candidate stays readable with its evidence.', '', `<span class="chip">Beats base rate</span><span class="chip error">Behind the rules</span>`) + scoreTable({ live: '0.211' }),
      abstention: () => head(`<span class="chip">Awaiting maturity</span>`) + stateCard('ban', 'Not enough has matured yet', 'The 8 weeks are scored, but too few short-term forecasts have matured to calibrate. It waits rather than guess, and nothing can be approved until then.', '', '<span class="chip">Calibration withheld</span>') + evidence()
    });
  };
  const modelYes = ctx => {
    const st = ctx.state;
    if (st === 'offline') return { yes: 'Approve', foot: 'Approving needs a connection', o: { off: true } };
    if (st === 'default') return { yes: 'Approve', foot: 'Bound to evidence 9c1e…44ab · expires Fri 18:00', o: {} };
    return null;
  };

  /* ---------- the step-up (MP-78, MP-55): a fresh sign-in, checked by the server, bound to one exact change ---------- */
  const sheetWrap = (title, inner) => `<div class="sheet" role="dialog" aria-modal="true" aria-label="${title}" data-mo="sheet"><div class="grabber"></div><h4>${title}</h4>${inner}</div>`;
  const stepFor = (ctx, what) => {
    const rows = `<div class="card fcard" style="margin-top:10px;box-shadow:inset 0 0 0 1px var(--hairline)">${kv(what)}</div>`;
    const go = (a, b = 'Not now') => `<div style="display:grid;gap:8px;margin-top:12px">${a}<button class="btn sm btn-plain" type="button">${b}</button></div>`;
    const NOT = `<p class="small" style="margin-top:8px;color:var(--ink)">Opening the app with Face ID, or an open session, is not enough. The server checks a fresh sign-in.</p>`;
    const p = t => `<p class="small" style="margin-top:6px;color:var(--ink)">${t}</p>`;
    switch (ctx.state) {
      case 'loading': return sheetWrap('Checking your sign-in', p('The server is checking it now. Nothing is approved until it answers.') + rows + `<div style="display:flex;align-items:center;gap:8px;margin-top:12px"><span class="spin" aria-hidden="true"></span><span class="small" style="color:var(--ink)">Checking</span></div>`);
      case 'empty': return sheetWrap('Your sign-in is fresh', p('No new sign-in is needed for this one. You are still approving exactly this.') + rows + go(bs('Approve this', 'primary')));
      case 'error': return sheetWrap('Sign-in failed', p('Nothing was approved, and nothing changed. The proposal keeps its expiry.') + rows + go(bs('Try again', 'primary', 'refresh')));
      case 'stale': return sheetWrap('Sign in again', p('Your last sign-in is too old for this action. You approve exactly this:') + rows + NOT + go(bs('Continue with passkey', 'primary', 'lock')));
      case 'offline': return sheetWrap('You are offline', p('A fresh sign-in has to reach the server, so nothing can be approved offline. The proposal keeps its expiry.') + rows + go(`<button class="btn sm btn-primary" type="button" disabled>Continue with passkey</button>`));
      case 'disagreement': return sheetWrap('This changed', p('The record moved while you were signing in, so this approval is refused. Review the new version and approve that, if you want it.') + rows + go(bs('Review the new version', 'primary')));
      case 'abstention': return sheetWrap('Fresh sign-in not proved', p('MP could not prove how fresh your sign-in is, so it will not approve. A protected action stays closed until it can.') + rows + go(bs('Try another way', 'primary')));
      default: return sheetWrap('Approve with a fresh sign-in', p('You approve exactly this. If any line changes, it needs a new approval.') + rows + NOT + go(bs('Continue with passkey', 'primary', 'lock')));
    }
  };
  const STEP_MODEL = [['Action', 'Promote a model'], ['Change', 'R2-HGB v3 to v4'], ['Environment', 'Production'], ['Evidence hash', '9c1e…44ab'], ['Expected version', 'Models v22'], ['Expires', 'Fri 6 Nov, 18:00']];
  const STEP_TSM = [['Action', 'Add a watch-only listing'], ['Change', 'Catalogue v14 to v15'], ['Listing', 'TSM · XNYS'], ['Environment', 'Production'], ['Payload hash', '2d7a…b310'], ['Expires', 'Today, 18:00']];

  /* ---------- after the decision (MP-55, MP-114, MP-159) ---------- */
  const outcome = (i, tone, title, text, extra = '') => `<div class="card fcard" data-mo="card"><span class="logo" style="--c:var(--${tone}-tint);color:var(--${tone});margin-bottom:10px" aria-hidden="true">${ic(i, 's24')}</span><p style="font:700 22px/28px var(--font-text);letter-spacing:-.015em;text-wrap:balance">${title}</p><p class="small muted" style="margin-top:6px">${text}</p>${extra}</div>`;
  const resultCore = ctx => region(ctx, {
    what: 'This decision', ok: () => outcome('check', 'rise', 'Approved. R2-HGB v4 is on probation.', 'Applied at 09:14 with your fresh sign-in. It writes forecasts from tonight\'s run.', `<div style="margin-top:10px">${status.approved}</div>`) + changeCard(MODEL_ROWS.slice(0, 2), 'What changed'),
    loading: () => box(`${lbl('Applying · approved at 09:14')}<p class="small muted" style="margin-top:4px">The previous version stays current until this finishes, and an interrupted promotion completes once or not at all.</p><div style="margin-top:8px">${steps(step('Recheck', 'Your approval, the expiry and the version'), step('Promote', 'Writing the promotion record', 'now'))}</div>`),
    empty: () => outcome('x', 'fall', 'You refused. Nothing changed.', 'R2-HGB v3 stays active. The candidate stays readable with its evidence, and a repeat proposal backs off with a visible reason.', `<div style="margin-top:10px">${status.refused}</div>`),
    error: () => outcome('x', 'fall', 'Refused by MP. Nothing changed.', 'The recheck found a new evidence hash after you approved, and an approval never moves to a different change. Review the new version.', `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${status.refused}<span class="chip">Evidence hash mismatch</span></div>`) + bs('Review the new version', 'primary'),
    stale: () => outcome('clock', 'warn', 'Expired. It cannot be approved.', 'The window closed on Fri 6 Nov at 18:00, before a decision. Run the check again for a fresh proposal, with fresh evidence and a new expiry.', `<div style="margin-top:10px">${status.expired}</div>`) + bs('Run the check again', 'primary', 'refresh'),
    offline: () => banner('', 'Offline.', 'Your approval reached MP at 09:14. Applying runs on the server, and the result shows when you reconnect.', 'wifi-off') + outcome('clock', 'warn', 'Approved, result not seen yet.', 'Nothing is sent twice: the same approval cannot apply again.'),
    disagreement: () => outcome('check', 'rise', 'Already decided on your iPad.', 'You approved this at 09:12, and your tap here made no second approval. One record, one change.', `<div style="margin-top:10px">${status.approved}</div>`)
  });
  const NEXT = () => box(`${lbl('What happens next')}<div style="margin-top:8px">${steps(step('Tonight 22:15', 'First forecasts from v4, labelled with their version'), step('Each week', 'Scored against v3, which keeps running in shadow'), step('After 2 bad weeks', 'Reverts to v3 by itself, and tells you'), step('After 4 good weeks', 'Probation ends, and it stays active'))}</div><p class="small muted" style="margin-top:8px">Switching forward again after a revert needs your yes.</p>`);

  /* ---------- the record (MP-114): every decision, by whoever made it ---------- */
  const REC = [
    ['cube', 'R2-HGB v4 promoted', 'You · Wed 09:14 · on probation', status.approved],
    ['plus', 'Taiwan Semiconductor added', 'You · Wed 09:02 · catalogue v15', status.approved],
    ['clock', 'Watch Barclays', 'Nobody · expired Wed 08:14', status.expired],
    ['ban', 'Let the chat route add listings', 'Code · Tue 17:20 · would widen authority', status.blocked],
    ['refresh', 'R1-LGB v2 reverted to v1', 'Code · Mon 22:20 · 2 bad weeks on probation', status.auto],
    ['x', 'Raise the Claude cap to £20', 'You · Fri 30 Oct', status.refused]
  ];
  const recRows = (ctx, rows = REC) => list(rows.map((r, i) => item(lead(r[0], wide(ctx) && i === 0 ? 'sel' : ''), r[1], r[2], r[3], '', wide(ctx) && i === 0)).join(''));
  const recFilter = () => `<div data-mo="rise">${seg(['All', 'Approved', 'Refused', 'Expired'], 0, 'Show decisions', 'full')}</div>`;
  const recCore = ctx => region(ctx, {
    what: 'The record', rows: 5, ok: () => recFilter() + recRows(ctx),
    empty: () => stateCard('target', 'No decisions yet', 'Every approval, refusal, expiry and automatic revert lands here, with who made it and the evidence it was bound to.'),
    error: () => stateCard('alert', 'The record did not load', 'It failed at 21:14. Nothing in it can change or be lost: records are only ever added to.', bs('Try again', 'tinted', 'refresh')) + recFilter() + recRows(ctx, REC.slice(0, 3)),
    stale: () => banner('warn', 'Showing the record from 16:35.', 'Newer decisions are safe on the server and appear once it refreshes.', 'clock') + recFilter() + recRows(ctx, REC.slice(2)),
    offline: () => banner('', 'Offline.', 'Showing the record saved at 21:15. A rollback waits until you reconnect.', 'wifi-off') + recFilter() + recRows(ctx)
  });
  const recDetail = ctx => {
    if (ctx.state === 'empty') return '';
    if (ctx.state === 'loading') return skel(2);
    return box(`${lbl('Record')}<p style="margin-top:4px;font:600 17px/22px var(--font-text);letter-spacing:-.01em">R2-HGB v4 promoted</p><div style="margin:8px 0 10px">${status.approved}</div>${kv([['Decided by', 'You, fresh sign-in'], ['Environment', 'Production'], ['Evidence hash', '9c1e…44ab'], ['Approval', 'apr_7f3c, reference only'], ['Previous', 'R2-HGB v3'], ['Decided', 'Wed 4 Nov, 09:14']])}<div style="margin-top:12px">${ctx.state === 'offline' ? '<button class="btn sm btn-tinted" type="button" disabled>Roll back</button>' : bs('Roll back')}</div><p class="small muted" style="margin-top:8px">A rollback makes a new version equal to the old one, with its own approval and its own record. Nothing is overwritten.</p>`);
  };

  /* ---------- Option A: one queue ---------- */
  const Q = [
    ['plus', 'Watch Taiwan Semiconductor', 'TSM · XNYS · Claude proposed in chat', 'Expires today 18:00'],
    ['cube', 'Promote R2-HGB v4', 'Passed its shadow trial, 8 of 8 weeks', 'Expires Fri 18:00'],
    ['sliders', 'Narrow a self-correction band', 'Probabilities: 5 to 4 points a week', 'Expires Mon 18:00'],
    ['layers', 'Confirm a statement import', '12 rows · ledger revision 214', '15 min once approved']
  ];
  const qRow = (q, i, ctx) => item(lead(q[0], wide(ctx) && i === 0 ? 'sel' : ''), q[1], q[2], ic('chev-r', 's18'), `<span style="display:flex;gap:6px;flex-wrap:wrap">${expiry(q[3])}</span>`, wide(ctx) && i === 0);
  const queue = (ctx, rows = Q) => list(rows.map((q, i) => qRow(q, i, ctx)).join(''));
  const queueHero = (n = 4, sub = 'Soonest first. Nothing happens until you decide.') => `<div class="card fcard" style="display:flex;align-items:center;gap:14px" data-mo="card"><span class="amt" style="font-size:44px">${roll(String(n))}</span><div style="min-width:0"><div style="font:600 17px/22px var(--font-text);letter-spacing:-.01em">${n === 1 ? 'decision waits' : 'decisions wait'} on you</div><p class="small muted">${sub}</p></div></div>`;
  const closed = () => sec('Cannot be approved') + list(item(lead('clock', 'warn'), 'Watch Barclays', 'BARC · XLON · expired 08:14', bs('Run again'), '') + item(lead('ban', 'fall'), 'Let the chat route add listings', 'Would widen authority, so code refused it', status.blocked));
  const notices = () => sec('Notices', illus('Read only')) + list(item(lead('refresh'), 'R1-LGB v2 reverted by itself', 'India midcap, 3 months · switching forward needs your yes', ic('chev-r', 's18')) + item(lead('alert', 'warn'), 'US tech is 31.0% of the portfolio', 'Material risk · arrived with the 07:30 brief', ic('chev-r', 's18'))) + `<p class="small muted" style="padding:0 4px">Every notice stays here, whether or not its push arrived. Opening one changes nothing.</p>`;
  const inboxBody = ctx => region(ctx, {
    what: 'What waits on you', rows: 4, ok: () => queueHero() + queue(ctx) + closed() + notices(),
    loading: () => `<div class="card fcard" data-mo="card"><span class="label">Last good 21:15 · expiry times come from the server</span><span class="sk" style="height:44px;width:60%;margin-top:10px"></span></div>` + skel(4),
    empty: () => stateCard('check', 'Nothing waits on you', 'Claude and code have no open proposals. This says nothing about risk: risk alerts arrive on their own.', bs('See the record')) + notices(),
    error: () => stateCard('alert', 'This list did not load', 'Nothing can be approved until it does. Open proposals keep their expiry on the server, and nothing is lost.', bs('Try again', 'tinted', 'refresh')) + notices(),
    stale: () => banner('warn', 'Showing this list from 16:35.', 'Expiry times may have passed. Each proposal rechecks itself before you can approve it.', 'clock') + queueHero() + queue(ctx),
    offline: () => banner('', 'Offline.', 'You can read what waits. Approving needs a connection. Notices are saved here and sync when you return.', 'wifi-off') + queueHero() + queue(ctx) + notices(),
    noModel: () => banner('fall', 'A forecast scope is paused.', 'US tech, 12 months has no eligible model, so forecasts are withheld. Restarting needs your yes.', 'cube') + queueHero(5) + list(item(lead('pause', 'warn'), 'Restart US tech, 12 months', 'Previous model not eligible, so it paused rather than reverted', ic('chev-r', 's18'), `<span style="display:flex;gap:6px;flex-wrap:wrap">${expiry('No expiry', 'illus')}</span>`)) + queue(ctx),
    disagreement: () => banner('', 'Two proposals touch the catalogue.', 'Approving either one moves the version, so the other must run its check again.', 'split') + queueHero() + queue(ctx),
    abstention: () => banner('', 'One proposal is not yet checked.', 'Code could not finish the check on Barclays, so it cannot be confirmed yet.', 'ban') + queueHero(5) + list(item(lead('ban'), 'Watch Barclays', 'BARC · XLON · not yet checked', bs('Run again'))) + queue(ctx)
  });
  const peek = ctx => {
    if (['loading', 'empty', 'error'].includes(ctx.state)) return '';
    return `<div style="display:grid;gap:12px">${listingHead()}${chain()}${changeCard(TSM_ROWS.slice(0, 3))}${bs('Open this proposal', 'primary')}</div>`;
  };

  /* ---------- Option B: where each thing lives ---------- */
  const strip = (ctx, st = ctx.state) => {
    const one = { default: ['2 decisions wait on you', 'Next: Taiwan Semiconductor, 18:00'], loading: ['Checking what waits on you', 'Last good 21:15'], error: ['Could not check what waits', 'Open proposals keep their expiry'], stale: ['2 decisions, from 16:35', 'Each rechecks itself when opened'], offline: ['2 decisions wait on you', 'Reading only: approving needs a connection'], noModel: ['A forecast scope is paused', 'Restarting US tech, 12 months needs your yes'], disagreement: ['2 proposals touch the catalogue', 'Approving one sends the other back to its check'], abstention: ['1 proposal not yet checked', 'Barclays cannot be confirmed yet'] }[st];
    if (st === 'empty') return '';
    return `<div style="display:flex;align-items:center;gap:10px;min-height:48px;padding:2px 4px" role="group" aria-label="What waits on you">${lead(st === 'noModel' ? 'pause' : st === 'error' ? 'alert' : 'person', st === 'noModel' ? 'warn' : st === 'error' ? 'fall' : '')}<div style="flex:1;min-width:0"><div style="font:600 15px/20px var(--font-text);letter-spacing:-.01em;color:var(--ink)">${one[0]}</div><div class="small" style="color:var(--ink)">${one[1]}</div></div>${ic('chev-r', 's18')}</div>`;
  };
  const stripCard = ctx => (ctx.state === 'empty' ? '' : `<div class="card" style="padding:6px 8px" data-mo="card">${strip(ctx)}</div>`);
  const homeBody = ctx => region(ctx, {
    what: 'Holdings', rows: 3, ok: () => valcard(wide(ctx) ? 40 : 44) + list0(ctx),
    loading: () => valcard(wide(ctx) ? 40 : 44) + skel(3),
    empty: () => valcard(wide(ctx) ? 40 : 44) + banner('', 'Nothing waits on you.', 'A strip appears here the moment a proposal needs your decision.', 'check') + list0(ctx),
    error: () => banner('fall', 'Proposals did not load.', 'Nothing can be approved until they do. Your holdings are unaffected.', 'alert') + valcard(wide(ctx) ? 40 : 44) + list0(ctx),
    stale: () => banner('warn', 'Stale.', 'Proposals last updated 16:35. Each one rechecks itself before you can approve it.', 'clock') + valcard(wide(ctx) ? 40 : 44) + list0(ctx),
    offline: () => banner('', 'Offline.', 'Showing figures from 21:15. Approving waits until you reconnect.', 'wifi-off') + valcard(wide(ctx) ? 40 : 44) + list0(ctx),
    noModel: () => banner('fall', 'A forecast scope is paused.', 'US tech, 12 months has no eligible model. Prices and holdings still work.', 'cube') + valcard(wide(ctx) ? 40 : 44) + list0(ctx),
    disagreement: () => banner('', 'Two proposals overlap.', 'They touch the same catalogue version, so only one can land first.', 'split') + valcard(wide(ctx) ? 40 : 44) + list0(ctx),
    abstention: () => banner('', 'One proposal is not yet checked.', 'Code could not finish its check, so it cannot be confirmed yet.', 'ban') + valcard(wide(ctx) ? 40 : 44) + list0(ctx)
  });
  const list0 = ctx => `<div class="list card" style="margin:0" data-mo="card">${H.slice(0, 4).map(h => hrow(h)).join('')}</div>`;
  const homeRail = ctx => (ctx.state === 'loading' ? skel(2) : `${stripCard(ctx)}${notices()}`);
  const afterCore = ctx => {
    const row = (s, chip) => list(item(logo(TSM.c, TSM.lg), TSM.n, s, chip));
    return region(ctx, {
      what: 'This listing', ok: () => outcome('check', 'rise', 'Confirmed. It joins from the next close.', 'Catalogue v15 was made with your approval record. Its data capability starts as a candidate until the first close confirms it.', `<div style="margin-top:10px">${status.approved}</div>`) + row('TSM · XNYS · watch-only', `<span class="chip">Next close</span>`),
      loading: () => box(`${lbl('Applying your confirmation')}<p class="small muted" style="margin-top:4px">Catalogue v14 stays current until v15 is written. There is never a half-added listing.</p><div style="margin-top:8px">${steps(step('Recheck', 'Your approval and the catalogue version'), step('Write', 'Catalogue v15', 'now'))}</div>`),
      empty: () => outcome('x', 'fall', 'You refused. Nothing was added.', 'Catalogue v14 stays current. The chat keeps this proposal, marked refused, and a repeat backs off with a visible reason.', `<div style="margin-top:10px">${status.refused}</div>`),
      error: () => outcome('alert', 'fall', 'Confirmed, not applied.', 'The catalogue write failed, so v14 stays current and nothing was half-added. Your confirmation holds, for one retry inside its window.', `<div style="margin-top:10px">${status.refused}</div>`) + bs('Try again', 'primary', 'refresh'),
      stale: () => outcome('clock', 'warn', 'Expired. It cannot be approved.', 'Confirming after 18:00 is refused, and nothing is added. Code runs the check again for a fresh proposal, in this same chat.', `<div style="margin-top:10px">${status.expired}</div>`) + bs('Run the check again', 'primary', 'refresh'),
      offline: () => banner('', 'Offline.', 'Your confirmation reached MP. The result shows when you reconnect.', 'wifi-off') + row('TSM · XNYS · waiting for the result', `<span class="chip">Unknown</span>`),
      noModel: () => outcome('check', 'rise', 'Added, with no forecast yet.', 'Prices are tracked from the next close. No approved model covers XNYS, so no forecast shows until one qualifies.', `<div style="margin-top:10px">${status.approved}</div>`) + row('TSM · XNYS · prices only', `<span class="chip">${ic('cube', 's14')}No model</span>`),
      disagreement: () => outcome('split', 'warn', 'The catalogue moved first.', 'Another confirmation landed at 09:01, so this one is refused against v15. The check runs again on the new version.', `<div style="margin-top:10px">${status.refused}</div>`) + bs('Run the check again', 'primary', 'refresh'),
      abstention: () => outcome('ban', 'warn', 'Not added: coverage changed.', 'Code could no longer confirm coverage when it rechecked, so it refused rather than guess. Nothing was added.', `<div style="margin-top:10px">${status.refused}</div>`)
    });
  };
  const HIST = [
    ['check', 'Confirmed by you', 'Wed 09:02 · catalogue v15 · fresh sign-in', status.approved],
    ['check', 'Code check passed', 'Wed 08:44 · 8 credits used', '<span class="chip">Code</span>'],
    ['plus', 'Claude drafted it', 'Wed 08:41 · from your chat', '<span class="chip">Claude</span>'],
    ['clock', 'Earlier proposal', 'Thu 22 Oct · nobody acted', status.expired]
  ];
  const histCore = ctx => {
    const rows = (r = HIST) => list(r.map(h => item(lead(h[0]), h[1], h[2], h[3])).join(''));
    return region(ctx, {
      what: 'This history', rows: 4, ok: () => rows(),
      empty: () => stateCard('clock', 'No history yet', 'Each thing keeps its own history here, from the first proposal to the last change.'),
      error: () => stateCard('alert', 'History did not load', 'It failed at 21:14. Nothing in it can change or be lost.', bs('Try again', 'tinted', 'refresh')) + rows(HIST.slice(0, 1)),
      stale: () => banner('warn', 'Showing history from 16:35.', 'Newer entries appear once it refreshes.', 'clock') + rows(HIST.slice(1)),
      offline: () => banner('', 'Offline.', 'Showing history saved at 21:15.', 'wifi-off') + rows()
    });
  };
  const histRail = () => box(`${lbl('Where the full record is')}<p class="small muted" style="margin-top:4px">Each listing, model and setting keeps its history where it lives. The full audit sits in the admin area, for search across all of them.</p>`);

  const naStep = { noModel: 'Signing in involves no forecast, so no model can be missing here.' };
  const naResult = { noModel: 'This screen reports a decision, not a forecast. A missing model shows on the proposal.', abstention: 'A decision is yours, so nothing can abstain on it.' };
  const naRecord = { noModel: 'The record lists past decisions, so no forecast is on it.', disagreement: 'A record states what happened once. Nothing here can disagree: a conflict shows on the proposal.', abstention: 'A record states what happened, so nothing can abstain on it.' };

  J.add({
    id: 'approvals', title: 'Approvals',
    stories: ['MP-55', 'MP-78', 'MP-131', 'MP-74', 'MP-114', 'MP-156', 'MP-159', 'MP-162'],
    summary: 'Claude proposes, code checks, you decide. Each approval binds one exact change, can never widen authority, and an expired one cannot be approved.',
    options: [{
      id: 'a', name: 'One queue', rec: true,
      why: 'Everything that waits on you sits in one list, soonest expiry first, and every proposal reads the same way: who did what, exactly what changes, what it cannot do. Decisions are rare and heavy, so one place that cannot be missed beats speed.',
      cost: 'A listing proposed in chat is confirmed one step away from the chat, and each decision leaves the place it concerns.',
      screens: [{
        id: 'aa-queue', title: 'Waiting on you', note: 'Notices share the place but never act. No model shows a paused scope that needs a restart.',
        render: ctx => frame(ctx, { tab: SET(ctx), title: 'Waiting on you', actions: tb('search', 'Search') + tb('clock', 'The record'), body: inboxBody(ctx), rail: wide(ctx) ? peek(ctx) : '' })
      }, {
        id: 'aa-listing', title: 'New listing', note: 'Proposed in chat. Stale shows it expired; Abstaining shows code refusing it; Error shows a check that timed out.',
        render: ctx => {
          const y = listingYes(ctx, 'Bound to catalogue v14 · expires 18:00');
          return frame(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Proposal', body: listingCore(ctx), rail: `${y ? decideCard(ctx, y.yes, y.foot, y.o) : ''}${fromChat()}${limits('This adds one watch-only listing.')}${pad(ctx)}`, accessory: y ? decideBar(ctx, y.yes, y.foot, y.o) : '' });
        }
      }, {
        id: 'aa-model', title: 'Model promotion', note: 'After its shadow trial. Empty shows a trial still running; Stale shows the count paused; Disagreement shows it beating only one comparator.',
        render: ctx => {
          const y = modelYes(ctx);
          return frame(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Proposal', body: modelCore(ctx), rail: `${y ? decideCard(ctx, y.yes, y.foot, y.o) : ''}${bound()}${limits('This changes which approved artefact issues forecasts.')}${pad(ctx)}`, accessory: y ? decideBar(ctx, y.yes, y.foot, y.o) : '' });
        }
      }, {
        id: 'aa-step', title: 'Step-up', note: 'Every line is bound to the approval. Disagreement shows the record moving mid-way; Abstaining shows it failing closed.',
        na: naStep,
        render: ctx => frame(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Proposal', body: modelHead() + chain('Tuner built', 'Code trialled', 'You decide') + evidence(), rail: wide(ctx) ? bound() : '', sheet: stepFor(ctx, STEP_MODEL) })
      }, {
        id: 'aa-result', title: 'Outcome', note: 'Ready is approved. Empty is you refusing. Error is MP refusing at execution. Stale is expired.',
        na: naResult,
        render: ctx => frame(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Decision', body: resultCore(ctx), rail: ctx.state === 'default' || ctx.state === 'disagreement' ? NEXT() : box(`${lbl('Why this is safe')}<p class="small muted" style="margin-top:4px">An approval covers one exact change and cannot be replayed. A failed step leaves the previous version current.</p>`) })
      }, {
        id: 'aa-record', title: 'The record', note: 'Reverts by code are marked Automatic, and never read as your decision.',
        na: naRecord,
        render: ctx => frame(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Decisions', body: recCore(ctx), rail: recDetail(ctx) })
      }]
    }, {
      id: 'b', name: 'In place',
      why: 'Each decision happens where the thing lives: a listing in the chat that proposed it, a model on its forecast page. A strip above the holdings says what waits and takes you to the next one, so context is never lost.',
      cost: 'Proposals are spread across the app, so one can sit unseen behind the strip. Each place needs its own care for expiry and step-up, and there is no one list to scan.',
      screens: [{
        id: 'ab-home', title: 'What waits', note: 'A strip above the dock, in reach. It shows one next decision, never a list.',
        render: ctx => frame(ctx, { tab: 0, title: 'Portfolio', body: homeBody(ctx) + pad(ctx), rail: wide(ctx) ? homeRail(ctx) : '', accessory: wide(ctx) ? '' : strip(ctx), webActions: '' })
      }, {
        id: 'ab-chat', title: 'Confirm in chat', note: 'The confirm card sits in the conversation that asked for it. Stale shows it expired; Abstaining shows code refusing it.',
        render: ctx => {
          const y = listingYes(ctx, 'Bound to catalogue v14 · expires 18:00');
          return frame(ctx, { tab: 0, back: 'Portfolio', title: 'Ask', body: fromChat() + listingCore(ctx, { chat: true }), rail: `${y ? decideCard(ctx, y.yes, y.foot, y.o) : ''}${checks()}${pad(ctx)}`, accessory: y ? decideBar(ctx, y.yes, y.foot, y.o) : '' });
        }
      }, {
        id: 'ab-step', title: 'Step-up', note: 'The same sheet everywhere, over the place you are. Disagreement shows the record moving mid-way.',
        na: naStep,
        render: ctx => frame(ctx, { tab: 0, back: 'Portfolio', title: 'Ask', body: fromChat() + changeCard(TSM_ROWS.slice(0, 3)), rail: wide(ctx) ? checks() : '', sheet: stepFor(ctx, STEP_TSM) })
      }, {
        id: 'ab-after', title: 'Outcome', note: 'The listing\'s own page tells you what happened. Empty is you refusing. Stale is expired. Error is applied late.',
        render: ctx => frame(ctx, { tab: 1, back: 'Ask', title: TSM.n, body: afterCore(ctx), rail: box(`${lbl('Why this is safe')}<p class="small muted" style="margin-top:4px">Claude can propose and cannot add. A confirmation covers this exact listing and this catalogue version, and nothing else.</p>`) })
      }, {
        id: 'ab-model', title: 'Promotion in place', note: 'On the models page, beside the model it would replace. Empty shows a trial still running; Stale shows the count paused.',
        render: ctx => {
          const y = modelYes(ctx);
          const current = ctx.state === 'loading' ? '' : box(`<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span class="chip owner"><span class="dot"></span>Active</span><span style="font:600 15px/20px var(--font-text);letter-spacing:-.01em">R2-HGB v3</span></div>${proof(true)}`);
          return frame(ctx, { tab: 1, back: 'Forecasts', title: 'Models', body: current + modelCore(ctx), rail: `${y ? decideCard(ctx, y.yes, y.foot, y.o) : ''}${bound()}${pad(ctx)}`, accessory: y ? decideBar(ctx, y.yes, y.foot, y.o) : '' });
        }
      }, {
        id: 'ab-history', title: 'History', note: 'Each listing, model and setting keeps its own history. Nothing is deleted.',
        na: naRecord,
        render: ctx => frame(ctx, { tab: 1, back: 'TSM', title: 'History', body: histCore(ctx), rail: histRail() })
      }]
    }]
  });
}
