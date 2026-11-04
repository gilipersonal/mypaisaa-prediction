/* Approvals: what waits on the owner, exactly what would change, the step-up, the outcome and the record (MP-62).
   Stories MP-55, MP-78, MP-131, MP-74, MP-114, MP-156, MP-159, MP-162. Claude proposes, code checks, the owner decides. An
   approval is bound to one exact change, can never widen authority, and an expired one cannot be approved. All journeys
   share one script, so this block keeps its helpers. Every figure is illustrative. */
{
  const wide = ctx => ctx.kind === 'ipad' || ctx.kind === 'web';
  const browser = ctx => ctx.kind === 'web' || ctx.kind === 'pwa';
  const plain = t => String(t).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  /* ---------- Prism rows and small parts, composed the same way on every screen ---------- */
  const bs = (label, kind = 'tinted', icon = '') => `<button class="btn sm btn-${kind}" type="button">${icon ? ic(icon, 's16') : ''}${label}</button>`;
  const lead = (i, tone = '') => { const [bg, fg] = tone === 'warn' ? ['--warn-tint', '--warn'] : tone === 'fall' ? ['--fall-tint', '--fall'] : tone === 'rise' ? ['--rise-tint', '--rise'] : tone === 'sel' ? ['--surface', '--ink'] : ['--surface-2', '--ink']; return `<span class="logo" style="--c:var(${bg});color:var(${fg});--ic2:var(--link)" aria-hidden="true">${ic(i, 's18')}</span>`; };
  /* open marks a row that opens something: a real control, named by all its visible words, its status too */
  const item = (l, t, s, r = '', x = '', sel = false, open = false) => `<div class="hrow${sel ? ' sel' : ''}" data-mo="rise"${open ? ` role="button" tabindex="0" aria-label="${[t, s, r, x].map(plain).filter(Boolean).join(', ')}"` : ''}>${l}<div style="min-width:0"><div class="nm" style="white-space:normal">${t}</div><div class="tk" style="white-space:normal">${s}</div></div><div class="vv" style="justify-self:end;text-align:right">${r}</div>${x ? `<div class="fl" style="display:block">${x}</div>` : ''}</div>`;
  const list = rows => `<div class="list card" style="margin:0" data-mo="card">${rows}</div>`;
  const sec = (t, r = '') => `<div class="sech" style="padding:8px 4px 0" data-mo="rise"><h3 style="font:600 17px/22px var(--font-text);letter-spacing:-.01em">${t}</h3>${r}</div>`;
  const kv = rows => `<dl class="kv">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  const box = (inner, st = '') => `<div class="card fcard" data-mo="card" style="${st}">${inner}</div>`;
  const lbl = t => `<div class="label">${t}</div>`;
  const pad = ctx => (wide(ctx) ? '' : '<div style="height:64px" aria-hidden="true"></div>');
  /* the sidebar has a sixth item, Data sources, so Settings is 5 there and 4 on the tab bar */
  const SET = ctx => (wide(ctx) ? 5 : 4);
  const proposed = q => `<span class="chip proposed" data-mo="chip"><span class="dot"></span>Proposed · ${q}</span>`;
  /* what a browser keeps offline is open (MP40-Q12), so any offline copy on web and phone web says so */
  const kept = ctx => (ctx.state === 'offline' && browser(ctx) ? `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap" data-mo="rise">${proposed('MP40-Q12')}<span class="small muted">What a browser keeps offline is open.</span></div>` : '');
  /* a proposal's state is not about market data, so the price chips stay as they are. The queue, its Home flip and the notices pass fresh: undefined, so both sides follow the state */
  const fr = (ctx, spec) => frame(ctx, { fresh: 'default', ...spec, body: (spec.noKept ? '' : kept(ctx)) + (spec.body || '') });

  /* ---------- Claude's component and the marks of who did what ---------- */
  const mark = (cls = '') => `<span class="cl-mark${cls}" aria-hidden="true"><i></i><i></i><i></i></span>`;
  const TICK = `<svg class="cl-tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13 10 19 20 6"/></svg>`;
  const step = (t, sub = '', st = 'done') => `<li class="cl-step" style="align-items:start">${st === 'done' ? TICK : st === 'now' ? '<span class="spin" style="margin:2px;color:var(--link)" aria-hidden="true"></span>' : st === 'next' ? `<span style="display:grid;place-items:center;color:var(--ink-2)" aria-hidden="true">${ic('clock', 's16')}</span>` : `<span style="display:grid;place-items:center;color:var(--fall)" aria-hidden="true">${ic('x', 's16')}</span>`}<span><b style="font-weight:600;color:var(--ink)">${t}</b>${sub ? `<br>${sub}` : ''}</span></li>`;
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
    blocked: `<span class="chip error">${ic('ban', 's14')}Blocked</span>`, auto: `<span class="chip">${ic('refresh', 's14')}Automatic</span>`,
    revoked: `<span class="chip error">${ic('ban', 's14')}Revoked</span>`, notApplied: `<span class="chip stale">${ic('clock', 's14')}Not applied</span>`, paused: `<span class="chip stale">${ic('pause', 's14')}Still paused</span>`
  };
  /* what would change, line by line: before, after, and why */
  const change = rows => rows.map(([k, a, b, s], i) => `<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:0 12px;padding:9px 0;align-items:baseline;${i ? 'border-top:1px solid var(--hairline);' : ''}"><span class="small muted">${k}</span><span style="display:inline-flex;align-items:center;gap:6px;font:600 15px/20px var(--font-text);letter-spacing:-.01em;white-space:nowrap">${a ? `<span style="font-weight:400;color:var(--ink-2)">${a}</span>${ic('chev-r', 's14')}` : ''}${b}</span>${s ? `<span class="small muted" style="grid-column:1/-1">${s}</span>` : ''}</div>`).join('');
  const changeCard = (rows, title = 'Exactly what would change') => box(`${lbl(title)}<div style="margin-top:4px">${change(rows)}</div>`);
  /* the decision: above the dock on a phone, in reach; first in the rail on iPad and desktop */
  const buttons = (yes, o = {}) => (o.only ? `<div style="display:grid;gap:8px">${o.only}</div>` : `<div style="display:grid;grid-template-columns:1fr 1.5fr;gap:8px"><button class="btn sm btn-tinted" type="button"${o.off ? ' disabled' : ''}>${o.no || 'Refuse'}</button><button class="btn sm btn-primary" type="button"${o.off ? ' disabled' : ''}>${yes}</button></div>`);
  const decideBar = (ctx, yes, foot, o = {}) => (wide(ctx) ? '' : `<div style="display:grid;gap:6px;padding:2px"><p class="small" style="text-align:center;color:var(--ink)">${foot}</p>${o.tag ? `<div style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap">${o.tag}</div>` : ''}${buttons(yes, o)}</div>`);
  const decideCard = (ctx, yes, foot, o = {}) => (wide(ctx) ? box(`${lbl('Your decision')}<p class="small muted" style="margin:4px 0 10px">${foot}</p>${o.tag ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${o.tag}</div>` : ''}${buttons(yes, o)}`) : '');
  /* which acts need a fresh sign-in is open (CT-01), so the ones the records do not name say so */
  const CT = proposed('CT-01');
  /* how long a chat-proposed listing waits is open (MP40-Q9), and so are every other proposal's expiry and the 15-minute window on switching forward or restarting (CT-02). POLICY-001's 15 minutes covers financial writes only */
  const Q9 = proposed('MP40-Q9'), CT2 = proposed('CT-02');
  /* only your yes restarts a paused scope (POLICY-003). What evidence a restart needs, and so what the yes gives the model, is left open by POLICY-003 itself */
  const RESTARTS = proposed('POLICY-003');
  /* a price past the limit leaves the total and the reason shows (MP-65). The limit itself is open (DATA-DEC-02) */
  const LATE = proposed('DATA-DEC-02');
  /* chips set under an outcome, or anywhere two sit together */
  const tags = (...c) => `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${c.join('')}</div>`;

  /* ---------- the listing Claude proposed (MP-131, MP-74) ---------- */
  const TSM = { n: 'Taiwan Semiconductor', c: '--seg-ustech', lg: 'TS' };
  const headCard = (l, t, s, chip) => `<div class="card" style="padding:14px 16px;display:flex;gap:12px;align-items:flex-start" data-mo="card">${l}<div style="flex:1;min-width:0"><div style="font:700 20px/25px var(--font-text);letter-spacing:-.01em">${t}</div><div class="small muted">${s}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${chip}</div></div></div>`;
  const listingHead = (chip = expiry('Expires 18:00') + Q9, compact = false) => (compact ? `<div class="card" style="padding:10px 12px;display:flex;gap:10px;align-items:center" data-mo="card">${logo(TSM.c, TSM.lg, true)}<div style="flex:1;min-width:0"><div style="font:600 15px/20px var(--font-text);letter-spacing:-.01em">${TSM.n}</div><div class="small muted">TSM · XNYS · watch-only</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${chip}</div></div></div>` : headCard(logo(TSM.c, TSM.lg), TSM.n, 'TSM · XNYS · watch-only', chip));
  const TSM_ROWS = [
    ['Catalogue version', 'v14', 'v15'],
    ['Watch-only listings', '3', '4', 'Tracked and forecast, not held.'],
    ['Credits a month', '18,360', '18,411', 'Bar and retry 44, actions 7. XNYS is already polled, and TSM is not on 30-minute checks.'],
    ['Credits once', '', '42', 'One backfill.'],
    ['Cash a month', '', '£0', 'Stays inside Grow 55. The £100 ceiling is untouched.'],
    ['Joins from', '', 'The next close']
  ];
  /* what code checked, as far as this state has got */
  const checks = ctx => {
    const st = ctx.state;
    if (st === 'empty') return '';
    const id = step('Identity', st === 'disagreement' ? 'TSM on XNYS, and 2330 on XTAI also matches' : 'TSM on XNYS, the US listing');
    const cov = step('Coverage', 'Twelve Data end of day, Yahoo delayed'), min = step('Busiest minute', '30 of the 45-credit cap, unchanged');
    const [title, rows] = st === 'loading' ? ['What code is checking', [id, step('Coverage', 'Asking Twelve Data and Yahoo', 'now')]]
      : st === 'error' ? ['What code checked before it stopped', [id, step('Coverage', 'Timed out at 09:14', 'fail')]]
        : st === 'abstention' ? ['What code checked', [id, cov, min, step('Rights and budget', 'Needs a higher Twelve Data tier', 'fail')]]
          : [st === 'stale' ? 'What code checked at 08:44' : 'What code checked', [id, cov, min, step('Rights and budget', 'Recorded, and no tier change needed')]];
    return box(`${lbl(title)}<div style="margin-top:8px">${steps(...rows)}</div>`);
  };
  /* at 08:41 Claude has drafted and code is still checking: the check passes at 08:44 */
  const fromChat = ctx => {
    const [when, say] = { abstention: ['Refused 08:44', 'I drafted this one, and code refused it, so nothing will be added.'], stale: ['Expired 18:00', 'I drafted this one, and it expired before you confirmed it, so nothing was added.'], empty: ['Confirmed 09:02', 'I drafted this one, and you have already confirmed it.'], error: ['Not yet checked', `I drafted this one, but code's check timed out, so it can't be confirmed yet.`] }[ctx.state] || ['Proposed 08:41', `I can't add a listing myself. I've drafted this one, and code is checking its coverage and cost. It joins only if you confirm it in the app.`];
    return `${ask('Watch TSMC for me')}${cl(when, SAY(say), 'Claude proposed a listing')}`;
  };
  const listingLimits = ctx => limits({ abstention: 'This proposal was refused, so it adds nothing.', stale: 'This proposal expired, so it adds nothing.', empty: 'This proposal is already decided.' }[ctx.state] || 'This adds one watch-only listing.');
  /* the whole proposal in every state. o.chat keeps a compact header inside a chat. Code's checks sit in the rail in both options */
  const listingCore = (ctx, o = {}) => {
    const head = c => listingHead(c, o.chat);
    const trail = chain();
    return region(ctx, {
      what: 'This proposal', rows: 3, ok: () => head() + trail + changeCard(TSM_ROWS),
      loading: () => head(`<span class="chip"><span class="spin" aria-hidden="true"></span>Checking</span>`) + chain('Claude drafted', 'Code checking', 'You decide') + box(`${lbl('Checking coverage with Twelve Data')}<p class="small muted" style="margin-top:4px">8 credits reserved first. Nothing can be confirmed until this finishes.</p>`),
      empty: () => stateCard('check', 'Already decided', 'You confirmed this on your iPad at 09:02, so there is nothing left to do here. One approval record was made.', bs(o.chat ? 'See the history' : 'See the record')),
      error: () => head(`<span class="chip error">Not yet checked</span>`) + stateCard('alert', 'The check timed out', 'The coverage probe stopped at 09:14. Its 8 credits stay reserved until they reconcile, and nothing can be confirmed until a check finishes.', bs('Run the check again', 'tinted', 'refresh')),
      stale: () => banner('warn', 'Expired at 18:00.', 'An expired proposal cannot be approved. The catalogue may have moved, so the check must run again.', 'clock') + head(expiry('Expired') + Q9) + changeCard(TSM_ROWS, 'What this proposed'),
      offline: () => banner('', 'Offline.', 'You can read this proposal. Confirming needs a connection, because the server rechecks it first.', 'wifi-off') + head() + trail + changeCard(TSM_ROWS),
      noModel: () => banner('', 'No forecast on day one.', 'No approved model covers TSM yet. The price is tracked from the next close, and a forecast appears only once a model qualifies.', 'cube') + head() + trail + changeCard(TSM_ROWS.map(r => (r[0] === 'Watch-only listings' ? [r[0], r[1], r[2], 'Tracked, with no forecast yet.'] : r))),
      disagreement: () => banner('', 'Two listings match.', 'Claude drafted TSM on XNYS, and code also found 2330 on XTAI. XTAI needs new calendars and rights work, so it goes to the extension checklist and cannot be added here.', 'split') + head() + trail + changeCard(TSM_ROWS),
      abstention: () => head(status.refused) + stateCard('ban', 'Code refused this proposal', 'Adding it would need a higher Twelve Data tier. MP never upgrades a plan to fit an addition, so nothing is added. A tier change is a separate decision with its own costing.', bs('See the cost'), '<span class="chip">Needs a higher tier</span>')
    });
  };
  const listingYes = (ctx, foot, yes = 'Confirm') => {
    const st = ctx.state;
    if (st === 'stale') return { yes, foot: 'An expired proposal cannot be approved', o: { only: bs('Run the check again', 'primary', 'refresh') } };
    if (st === 'offline') return { yes, foot: `${foot} · confirming needs a connection and a fresh sign-in`, o: { off: true, tag: CT + Q9 } };
    if (st === 'loading' || st === 'error') return { yes, foot: 'Nothing can be confirmed until the check finishes', o: { off: true } };
    if (st === 'empty' || st === 'abstention') return null;
    return { yes, foot: `${foot} · needs a fresh sign-in`, o: { tag: CT + Q9 } };
  };

  /* ---------- the model promotion (MP-156, MP-159) ---------- */
  const WEEKS = ['31 Aug', '7 Sep', '14 Sep', '21 Sep', '28 Sep', '5 Oct', '12 Oct', '19 Oct', '26 Oct'];
  const trial = (o = {}) => {
    const stop = o.stop == null ? 9 : o.stop;
    return `<div style="display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:5px;margin-top:10px" role="img" aria-label="${o.label || 'Nine weeks in shadow: eight scored, and the week of 12 October paused by a data outage'}">${WEEKS.map((w, i) => { const off = i >= stop, p = i === 6 && !off; return `<i data-mo="chip" style="display:grid;place-items:center;height:30px;border-radius:9px;color:var(--surface);${off ? 'box-shadow:inset 0 0 0 1.5px var(--hairline-2)' : p ? 'box-shadow:inset 0 0 0 1.5px var(--ink-2);color:var(--ink-2)' : 'background:var(--scored)'}">${off ? '' : ic(p ? 'pause' : 'check', 's14')}</i>`; }).join('')}</div><div class="small muted" style="display:flex;justify-content:space-between;margin-top:6px"><span>w/c 31 Aug</span><span>w/c 26 Oct</span></div>`;
  };
  const modelHead = (chip = expiry('Expires Fri 18:00') + CT2) => headCard(lead('cube'), 'Promote R2-HGB v4', '3, 6 and 12 months · all segments', chip);
  const evidence = (o = {}) => box(`<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px">${lbl('Shadow trial')}<span class="small muted">${o.count || '8 of 8 scored weeks'}</span></div>${trial(o)}<p class="small muted" style="margin-top:8px">${o.text || 'The week of 12 Oct could not be scored after a data outage, so the count paused. No forecast from this trial reached you.'}</p>`);
  const scoreTable = (o = {}) => box(`${lbl('Against both comparators · Brier score, lower is better')}<div style="overflow-x:auto"><table class="ht" style="margin-top:6px"><thead><tr><th>Walk-forward</th><th class="r">v4</th><th class="r">Rules</th><th class="r">Base rate</th></tr></thead><tbody><tr><td>3, 6, 12 months</td><td class="r"><b>${o.v4 || '0.188'}</b></td><td class="r">0.197</td><td class="r">0.203</td></tr></tbody></table></div><div style="margin-top:8px">${proposed('SCI-D03')}</div><div style="margin-top:12px">${lbl('What the 8 weeks checked')}<div style="margin-top:8px">${kv([['Clean running', '8 of 8 scored weeks'], ['Matured, 3 months', '0, first about 30 Nov'], ['Matured, 6 months', '0, first about 28 Feb'], ['Matured, 12 months', '0, first about 31 Aug 2027']])}</div></div><p class="small muted" style="margin-top:8px">The 8 weeks check that it runs cleanly and is calibrated on what has matured, and no 3, 6 or 12-month forecast has matured yet. Years of walk-forward history carry the accuracy evidence for these horizons, and 8 weeks alone never validate 12 months.</p>`);
  const MODEL_ROWS = [['Active model', 'v3', 'v4'], ['Calibrator', 'c7', 'c8'], ['Width of the portfolio\'s 80% range', '24.7 pts', '23.5 pts', '1.2 points narrower.'], ['Cost a month', '', '£0'], ['If it slips', '', 'Back to v3 by itself', 'On probation for its first 4 live weeks, it reverts after 2 bad weeks. After that, 4 weeks running worse than v3 on matured forecasts reverts it.']];
  const bound = (title = 'This approval is bound to', prev = 'R2-HGB v3') => box(`${lbl(title)}<div style="margin-top:8px">${kv([['Artefact', '4be1…09fa'], ['Calibrator', 'c8'], ['Tasks', '3, 6, 12 months'], ['Scope', 'All segments'], ['Evidence hash', '9c1e…44ab'], ['Limits', '5 points, 10%'], ['Previous safe', prev], ['Expires', 'Fri 6 Nov, 18:00']])}</div><div style="margin-top:8px">${CT2}</div>`);
  /* no proposal is open while a trial runs, pauses or waits to mature, so nothing is bound then. A blocked or refused one shows what it proposed */
  const modelRail = ctx => {
    if (ctx.state === 'default' || ctx.state === 'offline') return bound() + limits('This changes which approved artefact issues forecasts.');
    if (ctx.state === 'noModel') return bound('This approval is bound to', 'None on US tech, 12 months; R2-HGB v3 elsewhere') + limits('This changes which approved artefact issues forecasts. US tech, 12 months stays paused.');
    if (['error', 'disagreement'].includes(ctx.state)) return bound('What this proposed', 'R2-HGB v3') + limits('This proposal cannot go ahead, so it changes nothing.');
    return '';
  };
  const modelCore = (ctx, o = {}) => {
    const head = (c) => (o.noHead ? '' : modelHead(c)), trail = o.noHead ? '' : chain('Tuner built', 'Code trialled', 'You decide');
    return region(ctx, {
      what: 'This promotion', rows: 3, ok: () => head() + trail + evidence() + scoreTable() + changeCard(MODEL_ROWS),
      loading: () => head(`<span class="chip"><span class="spin" aria-hidden="true"></span>Loading</span>`) + box(`${lbl('Reading the stored evidence')}<span class="sk" style="height:30px;margin-top:10px"></span><span class="sk" style="height:60px;margin-top:10px"></span>`),
      empty: () => head(`<span class="chip">In shadow</span>`) + evidence({ count: 'Week 5 of 8', stop: 5, label: 'Five of eight weeks scored so far', text: 'Nothing to decide yet. A candidate needs 8 scored weeks and must beat both comparators before it can reach you.' }),
      error: () => head(status.refused) + stateCard('alert', 'The evidence changed', 'The evidence hash no longer matches what this proposal was built on, so it cannot be approved. The trial stays readable, and code rebuilds the proposal.', '', `<span class="chip error">Evidence hash mismatch</span>`),
      stale: () => head(`<span class="chip stale">Count paused</span>`) + evidence({ count: '6 of 8 scored weeks', stop: 7, label: 'Count paused after six scored weeks and a week that could not be scored', text: 'The week of 12 Oct could not be scored, so the count is paused at 6. The trial still needs 8 scored weeks.' }),
      offline: () => banner('', 'Offline.', 'You can read the evidence. Approving needs a connection and a fresh sign-in.', 'wifi-off') + head() + trail + evidence() + scoreTable(),
      noModel: () => banner('warn', 'One scope waits.', 'R2-HGB v3 can no longer be the safe fallback on US tech, 12 months, because its approval has expired. That scope stays paused until you restart it. The others can still be promoted.', 'cube') + head() + trail + evidence() + scoreTable() + changeCard(MODEL_ROWS.map(r => (r[0] === 'If it slips' ? [r[0], r[1], 'Back to v3, except US tech, 12 months', r[3]] : r))),
      disagreement: () => head(status.blocked) + stateCard('split', 'It beat one comparator, not both', 'R2-HGB v4 beat the base rate but not the current rules on walk-forward history, so it cannot be promoted. A rejected candidate stays readable with its evidence.', '', `<span class="chip">Beats base rate</span><span class="chip error">Behind the rules</span>`) + scoreTable({ v4: '0.199' }),
      abstention: () => head(`<span class="chip">Awaiting maturity</span>`) + stateCard('ban', 'Not enough has matured yet', 'The 8 weeks ran cleanly, but too little walk-forward history has matured at 12 months to calibrate c8. It waits rather than guess, and nothing can be approved until then.', '', '<span class="chip">Calibration withheld</span>') + evidence()
    });
  };
  const modelYes = ctx => {
    const st = ctx.state;
    if (st === 'offline') return { yes: 'Approve', foot: 'Bound to evidence 9c1e…44ab · expires Fri 18:00 · approving needs a connection and a fresh sign-in', o: { off: true, tag: CT2 } };
    if (st === 'default' || st === 'noModel') return { yes: 'Approve', foot: 'Bound to evidence 9c1e…44ab · expires Fri 18:00 · needs a fresh sign-in', o: { tag: CT2 } };
    return null;
  };

  /* ---------- the step-up (MP-78, MP-55): a fresh sign-in, checked by the server, bound to one exact change ---------- */
  const sheetWrap = (title, inner) => `<div class="sheet" role="dialog" aria-modal="true" aria-label="${title}" data-mo="sheet"><div class="grabber"></div><h4>${title}</h4>${inner}</div>`;
  const stepFor = (ctx, what, tag = '', keeps = 'The proposal keeps its expiry.') => {
    const rows = `<div class="card fcard" style="margin-top:10px;box-shadow:inset 0 0 0 1px var(--hairline)">${kv(what)}</div>${tag ? `<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">${tag}</div>` : ''}`;
    const go = (a, b = 'Not now') => `<div style="display:grid;gap:8px;margin-top:12px">${a}<button class="btn sm btn-plain" type="button">${b}</button></div>`;
    const NOT = `<p class="small" style="margin-top:8px;color:var(--ink)">Opening the app with Face ID, or an open session, is not enough. The server checks a fresh sign-in.</p>`;
    const p = t => `<p class="small" style="margin-top:6px;color:var(--ink)">${t}</p>`;
    switch (ctx.state) {
      case 'loading': return sheetWrap('Checking your sign-in', p('The server is checking it now. Nothing is approved until it answers.') + rows + `<div style="display:flex;align-items:center;gap:8px;margin-top:12px"><span class="spin" aria-hidden="true"></span><span class="small" style="color:var(--ink)">Checking</span></div>`);
      case 'empty': return sheetWrap('Your sign-in is fresh', p('No new sign-in is needed for this one. You are still approving exactly this.') + rows + go(bs('Approve this', 'primary')));
      case 'error': return sheetWrap('Sign-in failed', p(`Nothing was approved, and nothing changed. ${keeps}`) + rows + go(bs('Try again', 'primary', 'refresh')));
      case 'stale': return sheetWrap('Sign in again', p('Your last sign-in is too old for this action. You approve exactly this:') + rows + NOT + go(bs('Continue with passkey', 'primary', 'lock')));
      case 'offline': return sheetWrap('You are offline', p(`A fresh sign-in has to reach the server, so nothing can be approved offline. ${keeps}`) + rows + (kept(ctx) ? `<div style="margin-top:8px">${kept(ctx)}</div>` : '') + go(`<button class="btn sm btn-primary" type="button" disabled>Continue with passkey</button>`));
      case 'disagreement': return sheetWrap('This changed', p('The record moved while you were signing in, so this approval is refused. Review the new version and approve that, if you want it.') + rows + go(bs('Review the new version', 'primary')));
      case 'abstention': return sheetWrap('Fresh sign-in not proved', p('MP could not prove how fresh your sign-in is, so it will not approve. A protected action stays closed until it can.') + rows + go(bs('Try another way', 'primary')));
      default: return sheetWrap('Approve with a fresh sign-in', p('You approve exactly this. If any line changes, it needs a new approval.') + rows + NOT + go(bs('Continue with passkey', 'primary', 'lock')));
    }
  };
  const STEP_MODEL = [['Action', 'Promote a model'], ['Change', 'R2-HGB v3 to v4'], ['Artefact', '4be1…09fa'], ['Calibrator', 'c8'], ['Tasks', '3, 6, 12 months'], ['Scope', 'All segments'], ['Environment', 'Production'], ['Evidence hash', '9c1e…44ab'], ['Payload hash', 'a81f…60de'], ['Limits', '5 points, 10%'], ['Previous safe', 'R2-HGB v3'], ['Expected version', 'Models v22'], ['Expires', 'Fri 6 Nov, 18:00']];
  const STEP_TSM = [['Action', 'Add a watch-only listing'], ['Change', 'Catalogue v14 to v15'], ['Listing', 'TSM · XNYS'], ['Environment', 'Production'], ['Payload hash', '2d7a…b310'], ['Expires', 'Today, 18:00']];
  const STEP_SET = [['Action', 'Change a setting'], ['Owner', 'You'], ['Environment', 'Production'], ['Setting', 'Weekly band'], ['Value', '4 points'], ['Current version', 'v9'], ['Payload hash', '1b7c…d3e4'], ['Expires', 'Mon 9 Nov, 18:00']];
  /* on a refused step the rail shows what was proposed, not what is bound */
  const stepBound = ctx => bound(ctx.state === 'disagreement' ? 'What this proposed' : undefined);

  /* ---------- after the decision (MP-55, MP-114, MP-159) ---------- */
  const outcome = (i, tone, title, text, extra = '') => `<div class="card fcard" data-mo="card"><span class="logo" style="--c:var(--${tone}-tint);color:var(--${tone});margin-bottom:10px" aria-hidden="true">${ic(i, 's24')}</span><p style="font:700 22px/28px var(--font-text);letter-spacing:-.015em;text-wrap:balance">${title}</p><p class="small muted" style="margin-top:6px">${text}</p>${extra}</div>`;
  const resultCore = ctx => region(ctx, {
    what: 'This decision', ok: () => outcome('check', 'rise', 'Approved. R2-HGB v4 is on probation.', 'Applied at 09:14 with your fresh sign-in. It writes forecasts from tonight\'s run.', `<div style="margin-top:10px">${status.approved}</div>`) + changeCard(MODEL_ROWS.slice(0, 2), 'What changed'),
    loading: () => box(`${lbl('Applying · approved at 09:14')}<p class="small muted" style="margin-top:4px">The previous version stays current until this finishes, and an interrupted promotion completes once or not at all.</p><div style="margin-top:8px">${steps(step('Recheck', 'Your approval, the expiry and the version'), step('Promote', 'Writing the promotion record', 'now'))}</div>`),
    empty: () => outcome('x', 'fall', 'You refused. Nothing changed.', 'R2-HGB v3 stays active. The candidate stays readable with its evidence, and a repeat proposal backs off with a visible reason.', `<div style="margin-top:10px">${status.refused}</div>`),
    error: () => outcome('x', 'fall', 'Refused by MP. Nothing changed.', 'The recheck found a new evidence hash after you approved, and an approval never moves to a different change. Review the new version.', `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${status.refused}<span class="chip">Evidence hash mismatch</span></div>`) + bs('Review the new version', 'primary'),
    stale: () => outcome('clock', 'warn', 'Expired. It cannot be approved.', 'The window closed on Fri 6 Nov at 18:00, before a decision. Run the check again for a fresh proposal, with fresh evidence and a new expiry.', tags(status.expired, CT2)) + bs('Run the check again', 'primary', 'refresh'),
    offline: () => banner('', 'Offline.', 'Your approval reached MP at 09:14. Applying runs on the server, and the result shows when you reconnect.', 'wifi-off') + outcome('clock', 'warn', 'Approved, result not seen yet.', 'Nothing is sent twice: the same approval cannot apply again.'),
    disagreement: () => outcome('check', 'rise', 'Already decided on your iPad.', 'You approved this at 09:14, and your tap here made no second approval. One record, one change.', `<div style="margin-top:10px">${status.approved}</div>`)
  });
  const NEXT = () => box(`${lbl('What happens next')}<div style="margin-top:8px">${steps(step('Tonight 21:15', 'First forecasts from v4, labelled with their version', 'next'), step('Each week', 'v3 keeps running in shadow, and scoring runs on matured paired forecasts only. A week with no matured paired forecasts neither counts toward nor breaks a run.', 'next'), step('First 4 live weeks', 'On probation. After 2 bad weeks it reverts to v3 by itself, and tells you.', 'next'), step('After that', '4 weeks running worse than v3 on matured forecasts reverts it, and tells you.', 'next'))}</div><p class="small muted" style="margin-top:8px">The first 3-month pair matures about 30 Nov. No 6 or 12-month pair matures in the first 4 live weeks, so for 6 and 12 months probation ends with no score.</p><div style="margin-top:8px">${proposed('SCI-D07')}</div><p class="small muted" style="margin-top:8px">Switching forward again after a revert needs your yes.</p>`);
  const safeBox = t => box(`${lbl('Why this is safe')}<p class="small muted" style="margin-top:4px">${t}</p>`);
  const resultRail = ctx => (ctx.state === 'default' || ctx.state === 'disagreement' ? NEXT() : safeBox('An approval covers one exact change and cannot be replayed. A failed step leaves the previous version current.'));

  /* ---------- the record (MP-114): every decision, by whoever made it ---------- */
  const REC = [
    ['cube', 'R2-HGB v4 promoted', 'You · Wed 09:14 · on probation', status.approved],
    ['plus', 'Taiwan Semiconductor added', 'You · Wed 09:02 · catalogue v15 · fresh sign-in', status.approved, CT],
    ['clock', 'Watch Barclays', 'Nobody · expired Wed 08:14', status.expired, Q9],
    ['ban', 'Let the chat route add listings', 'Code · Tue 17:20 · would widen authority', status.blocked],
    ['refresh', 'R1-LGB v2 reverted to v1', 'Code · Mon 22:20 · 2 bad weeks on probation', status.auto],
    ['ban', 'Statement import approval revoked', 'You · Fri 30 Oct · before the commit started', status.revoked]
  ];
  const recRows = (ctx, rows = REC) => list(rows.map((r, i) => item(lead(r[0], wide(ctx) && i === 0 ? 'sel' : ''), r[1], r[2], r[3], r[4] || '', wide(ctx) && i === 0, true)).join(''));
  const recFilter = () => `<div data-mo="rise">${seg(['All', 'Approved', 'Refused', 'Expired'], 0, 'Show decisions', 'full')}</div>`;
  const recCore = ctx => region(ctx, {
    what: 'The record', rows: 5, ok: () => recFilter() + recRows(ctx),
    empty: () => stateCard('target', 'No decisions yet', 'Every approval, refusal, expiry and automatic revert lands here, with who made it and the evidence it was bound to.'),
    error: () => stateCard('alert', 'The record did not load', 'It failed at 21:14. Nothing in it can change or be lost: records are only ever added to.', bs('Try again', 'tinted', 'refresh')) + recFilter() + recRows(ctx, REC.slice(0, 3)),
    stale: () => banner('warn', 'Showing the record from 14:10.', 'Newer decisions are safe on the server and appear once it refreshes.', 'clock') + recFilter() + recRows(ctx),
    offline: () => banner('', 'Offline.', 'Showing the record saved at 21:15. A rollback waits until you reconnect.', 'wifi-off') + recFilter() + recRows(ctx)
  });
  const recDetail = ctx => {
    if (ctx.state === 'empty') return '';
    if (ctx.state === 'loading') return skel(2);
    return box(`${lbl('Record')}<p style="margin-top:4px;font:600 17px/22px var(--font-text);letter-spacing:-.01em">R2-HGB v4 promoted</p><div style="margin:8px 0 10px">${status.approved}</div>${kv([['Decided by', 'You, fresh sign-in'], ['Environment', 'Production'], ['Evidence hash', '9c1e…44ab'], ['Approval', 'apr_7f3c, reference only'], ['Previous', 'R2-HGB v3'], ['Decided', 'Wed 4 Nov, 09:14']])}<div style="margin-top:12px">${ctx.state === 'offline' ? '<button class="btn sm btn-tinted" type="button" disabled>Roll back</button>' : bs('Roll back')}</div><p class="small muted" style="margin-top:8px">A rollback makes a new version equal to the old one, with its own approval and its own record. Nothing is overwritten.</p>`);
  };

  /* ---------- a settings change (MP-114): its impact, evidence, cost and how to roll it back, before you approve ---------- */
  const setHead = (chip = expiry('Expires Mon 18:00') + CT2) => headCard(lead('sliders'), 'Narrow a self-correction band', 'Probabilities · 5 to 4 points a week', chip);
  const SET_ROWS = [['Weekly band', '5 points', '4 points', 'A forecast\'s probabilities may shift at most 4 points a week.'], ['Settings version', 'v9', 'v10']];
  const SET_WHY = [['Expected impact', '', 'Slower correction', 'After a miss, a forecast takes longer to adjust.'], ['Evidence', '', '26 weeks of replay', 'Evidence hash e40b…7d12.'], ['Cost a month', '', '£0'], ['How to roll it back', '', 'A new version', 'A rollback makes v11 equal to v9, with its own record. Nothing is overwritten.']];
  const setBound = (title = 'This approval is bound to') => box(`${lbl(title)}<div style="margin-top:8px">${kv([['Owner', 'You'], ['Environment', 'Production'], ['Setting', 'Weekly band'], ['Value', '4 points'], ['Current version', 'v9'], ['Expires', 'Mon 9 Nov, 18:00']])}</div><div style="margin-top:8px">${CT2}</div>`);
  const setRail = ctx => (ctx.state === 'default' || ctx.state === 'offline' ? setBound() : ['error', 'stale', 'disagreement'].includes(ctx.state) ? setBound('What this proposed') : '');
  const settingCore = ctx => {
    const trail = chain();
    return region(ctx, {
      what: 'This proposal', rows: 3, ok: () => setHead() + trail + changeCard(SET_ROWS) + changeCard(SET_WHY, 'Impact, evidence, cost and rollback'),
      loading: () => setHead(`<span class="chip"><span class="spin" aria-hidden="true"></span>Loading</span>`) + box(`${lbl('Reading the stored evidence')}<span class="sk" style="height:60px;margin-top:10px"></span>`),
      empty: () => stateCard('check', 'No settings change waits', 'Every setting stays as you approved it. A proposal lands here with its impact, evidence, cost and how to roll it back.'),
      error: () => setHead(status.refused) + stateCard('alert', 'The evidence changed', 'The evidence hash no longer matches what this proposal was built on, so it cannot be approved. Code rebuilds the proposal.', '', `<span class="chip error">Evidence hash mismatch</span>`),
      stale: () => banner('warn', 'Expired Mon 18:00.', 'An expired proposal cannot be approved, and nothing changed. A repeat backs off with a visible reason.', 'clock') + setHead(expiry('Expired') + CT2) + changeCard(SET_ROWS, 'What this proposed'),
      offline: () => banner('', 'Offline.', 'You can read this proposal. Approving needs a connection and a fresh sign-in.', 'wifi-off') + setHead() + trail + changeCard(SET_ROWS) + changeCard(SET_WHY, 'Impact, evidence, cost and rollback'),
      disagreement: () => banner('', 'The setting moved.', 'Settings v10 was written at 09:01, so this proposal is refused against v9. Code rebuilds it on the new version.', 'split') + setHead(status.refused) + changeCard(SET_ROWS, 'What this proposed'),
      abstention: () => setHead(`<span class="chip">Impact not shown</span>`) + stateCard('ban', 'Not enough replay to show the impact', 'Code has too few replay weeks to state what this would do. It waits rather than guess, and nothing can be approved until then.', '', '<span class="chip">Impact withheld</span>')
    });
  };
  const settingYes = ctx => {
    if (ctx.state === 'offline') return { yes: 'Approve', foot: 'Bound to settings v9 · expires Mon 18:00 · approving needs a connection and a fresh sign-in', o: { off: true, tag: CT2 } };
    return ctx.state === 'default' ? { yes: 'Approve', foot: 'Bound to settings v9 · expires Mon 18:00 · needs a fresh sign-in', o: { tag: CT2 } } : null;
  };
  const settingRail = ctx => (['loading', 'offline', 'default'].includes(ctx.state) ? limits('This changes one setting, inside the band you approved.') : '');
  const setResult = ctx => region(ctx, {
    what: 'This decision', ok: () => outcome('check', 'rise', 'Approved. The weekly band is 4 points.', 'Applied at 09:16 with your fresh sign-in. Settings v10 keeps v9 as its previous version.', `<div style="margin-top:10px">${status.approved}</div>`) + changeCard(SET_ROWS, 'What changed'),
    loading: () => box(`${lbl('Applying · approved at 09:16')}<p class="small muted" style="margin-top:4px">Settings v9 stays current until this finishes. A change that fails part way leaves v9 in place.</p><div style="margin-top:8px">${steps(step('Recheck', 'Your approval, the expiry and settings v9'), step('Write', 'Settings v10', 'now'))}</div>`),
    empty: () => outcome('x', 'fall', 'You refused. Nothing changed.', 'Settings v9 stays current. A repeat proposal backs off with a visible reason.', `<div style="margin-top:10px">${status.refused}</div>`),
    error: () => outcome('alert', 'fall', 'Approved, not applied.', 'The write failed part way, so settings v9 stays current and nothing was half-changed. Your approval holds, for a retry inside its window.', tags(status.notApplied, CT2)) + bs('Try again', 'primary', 'refresh'),
    stale: () => outcome('clock', 'warn', 'Expired. It cannot be approved.', 'The window closed on Mon 9 Nov at 18:00, before a decision. Nothing changed, and a repeat backs off with a visible reason.', tags(status.expired, CT2)),
    offline: () => banner('', 'Offline.', 'Your approval reached MP at 09:16. Applying runs on the server, and the result shows when you reconnect.', 'wifi-off') + outcome('clock', 'warn', 'Approved, result not seen yet.', 'Nothing is sent twice: the same approval cannot apply again.'),
    disagreement: () => outcome('check', 'rise', 'Already decided on your iPad.', 'You approved this at 09:16, and your tap here made no second approval. One record, one change.', `<div style="margin-top:10px">${status.approved}</div>`)
  });
  const setResultRail = ctx => (ctx.state === 'default' ? changeCard(SET_WHY.slice(3), 'If you change your mind') : safeBox('An approval covers one exact change and cannot be replayed. A failed step leaves the previous version current.'));

  /* ---------- switching forward and restarting (MP-159, owner answers 6 and 15): only your yes does either ---------- */
  /* that it waits for your yes is settled (MP-159, owner answers 6 and 15). That the proposal stays open, with no expiry of its own, is what CT-02 leaves open */
  const WAITS = 'Stays open · waits for your yes';
  const fwdHead = (chip = expiry(WAITS, 'illus') + CT2) => headCard(lead('refresh'), 'Switch forward to R1-LGB v2', 'India midcap, 3 months · reverted by code Mon 22:20', chip);
  const pauseHead = () => headCard(lead('pause', 'warn'), 'Restart US tech, 12 months', 'Paused by code · previous model not eligible', expiry(WAITS, 'illus') + CT2);
  const FWD_ROWS = [['Active model', 'v1', 'v2'], ['Scope', '', 'India midcap, 3 months'], ['Cost a month', '', '£0'], ['If it slips', '', 'Back to v1 by itself']];
  const RESTART_ROWS = [['Scope', 'Paused', 'Issuing'], ['Model', '', 'R2-HGB v3', 'Its approval expired, so the scope paused rather than reverted. This yes gives it a fresh approval.'], ['Forecasts from', '', 'The next run'], ['Cost a month', '', '£0']];
  /* the proposal waits for the owner, and the approval has a window of its own (open: CT-02). Each binds what MP-156 and MP-78 name */
  const FWD_BIND = [['Artefact', 'R1-LGB v2 · 7e20…c4d1'], ['Calibrator', 'c5'], ['Tasks', '3 months'], ['Scope', 'India midcap'], ['Evidence hash', 'b3f6…2a90'], ['Limits', '5 points, 10%'], ['Previous safe', 'R1-LGB v1'], ['Expected version', 'Models v22'], ['Expires', '15 minutes after you approve']];
  const RESTART_BIND = [['Artefact', 'R2-HGB v3 · 91d4…e7b2'], ['Calibrator', 'c7'], ['Tasks', '12 months'], ['Scope', 'US tech'], ['Evidence hash', 'd52a…08c3'], ['Limits', '5 points, 10%'], ['Previous safe', 'None eligible'], ['Expected version', 'Models v22'], ['Expires', '15 minutes after you approve']];
  const bindCard = (title, rows, open = true) => box(`${lbl(title)}<div style="margin-top:8px">${kv(rows)}</div>${open ? '<p class="small muted" style="margin-top:8px">The proposal waits for your yes. Your approval then has 15 minutes to apply.</p>' : ''}<div style="margin-top:8px">${CT2}</div>`);
  const restartBound = ctx => (ctx.state === 'noModel' ? bindCard('This approval is bound to', RESTART_BIND) : ['default', 'offline', 'disagreement', 'abstention'].includes(ctx.state) ? bindCard('This approval is bound to', FWD_BIND) : ctx.state === 'stale' ? bindCard('What this proposes', FWD_BIND) : '');
  /* a step-up is bound to its change until the record moves: only then does its rail show what was proposed */
  const restartStepBound = ctx => (ctx.state === 'disagreement' ? bindCard('What this proposed', FWD_BIND, false) : bindCard('This approval is bound to', ctx.state === 'noModel' ? RESTART_BIND : FWD_BIND));
  const WAITING = 'The proposal still waits for your yes.';
  const STEP_FWD = [['Action', 'Switch forward'], ['Change', 'R1-LGB v1 to v2'], ...FWD_BIND.slice(0, 8), ['Environment', 'Production'], ['Payload hash', 'e19c…7a45'], FWD_BIND[8]];
  const STEP_RESTART = [['Action', 'Restart a paused scope'], ['Change', 'Paused to issuing'], ...RESTART_BIND.slice(0, 8), ['Environment', 'Production'], ['Payload hash', '40fb…c6e8'], RESTART_BIND[8]];
  const whyBack = () => box(`${lbl('Why it reverted')}<div style="overflow-x:auto"><table class="ht" style="margin-top:6px"><thead><tr><th>Matured paired forecasts</th><th class="r">v2</th><th class="r">v1</th></tr></thead><tbody><tr><td>Week of 19 Oct</td><td class="r"><b>0.231</b></td><td class="r">0.219</td></tr><tr><td>Week of 26 Oct</td><td class="r"><b>0.228</b></td><td class="r">0.217</td></tr></tbody></table></div><p class="small muted" style="margin-top:8px">2 bad weeks on probation, so code reverted it and told you. Nothing switches forward without your yes.</p><div style="margin-top:8px">${proposed('SCI-D07')}</div>`);
  const restartCore = ctx => {
    const trail = chain('Code reverted', 'Code scored', 'You decide');
    return region(ctx, {
      what: 'This proposal', rows: 3, ok: () => fwdHead() + trail + whyBack() + changeCard(FWD_ROWS),
      loading: () => fwdHead(`<span class="chip"><span class="spin" aria-hidden="true"></span>Loading</span>`) + box(`${lbl('Reading the stored scores')}<span class="sk" style="height:60px;margin-top:10px"></span>`),
      empty: () => stateCard('check', 'Nothing to restart', 'No scope is paused, and no reverted model waits for you. A revert or a pause lands here with its reason.'),
      error: () => fwdHead(`<span class="chip error">Not loaded</span>`) + stateCard('alert', 'The scores did not load', 'They failed at 21:14. Nothing can be approved until they load, and v1 stays active.', bs('Try again', 'tinted', 'refresh')),
      stale: () => banner('warn', 'Showing scores from 14:10.', 'A newer scored week may exist. This proposal rechecks itself before you can approve it.', 'clock') + fwdHead() + whyBack() + changeCard(FWD_ROWS, 'What this proposes'),
      offline: () => banner('', 'Offline.', 'You can read the scores. Approving needs a connection and a fresh sign-in.', 'wifi-off') + fwdHead() + trail + whyBack() + changeCard(FWD_ROWS),
      noModel: () => banner('fall', 'A forecast scope is paused.', 'US tech, 12 months has no eligible model, so forecasts are withheld. Restarting needs your yes, and nothing restarts itself.', 'cube') + pauseHead() + chain('Code paused', 'Code checked', 'You decide') + changeCard(RESTART_ROWS) + `<div>${RESTARTS}</div>`,
      disagreement: () => banner('', 'The evidence splits.', 'v2 trails v1 on matured forecasts and leads on walk-forward history. Neither settles it, so the decision stays yours.', 'split') + fwdHead() + trail + whyBack() + changeCard(FWD_ROWS),
      abstention: () => banner('', 'Nothing new has matured.', 'No paired forecast has matured since the revert, so code has no new score to show. The scores below still stand, and the decision stays yours.', 'clock') + fwdHead() + trail + whyBack() + changeCard(FWD_ROWS)
    });
  };
  const restartYes = ctx => {
    const st = ctx.state, tag = CT + CT2, o = { no: 'Stay on v1', tag }, foot = 'Bound to R1-LGB v2 · 15 min once approved';
    if (st === 'offline') return { yes: 'Switch forward', foot: `${foot} · switching forward needs a connection and a fresh sign-in`, o: { ...o, off: true } };
    if (st === 'default' || st === 'disagreement' || st === 'abstention') return { yes: 'Switch forward', foot: `${foot} · needs a fresh sign-in`, o };
    return st === 'noModel' ? { yes: 'Restart', foot: 'Bound to R2-HGB v3 on US tech, 12 months · 15 min once approved · needs a fresh sign-in', o: { no: 'Keep paused', tag } } : null;
  };
  const restartRail = ctx => (['default', 'loading', 'offline', 'noModel', 'disagreement', 'abstention'].includes(ctx.state) ? limits(ctx.state === 'noModel' ? 'This restarts one paused scope.' : 'This changes which approved artefact issues forecasts.') : '');
  const restartStep = ctx => (ctx.state === 'noModel' ? pauseHead() + chain('Code paused', 'Code checked', 'You decide') + changeCard(RESTART_ROWS) + `<div>${RESTARTS}</div>` : fwdHead() + chain('Code reverted', 'Code scored', 'You decide') + changeCard(FWD_ROWS));
  const restartResult = ctx => region(ctx, {
    what: 'This decision', ok: () => outcome('check', 'rise', 'Switched forward. R1-LGB v2 is active.', 'Applied at 09:18 with your fresh sign-in. It writes forecasts for India midcap, 3 months, from tonight\'s run.', tags(status.approved, CT)) + changeCard(FWD_ROWS.slice(0, 1), 'What changed'),
    loading: () => box(`${lbl('Applying · approved at 09:18')}<p class="small muted" style="margin-top:4px">R1-LGB v1 stays active until this finishes, and it completes once or not at all.</p><div style="margin-top:8px">${steps(step('Recheck', 'Your approval, the expiry and the version'), step('Switch', 'Writing the new record', 'now'))}</div>`),
    empty: () => outcome('x', 'fall', 'You stayed on v1. Nothing changed.', 'R1-LGB v1 keeps issuing. Nothing switches forward without your yes.', `<div style="margin-top:10px">${status.refused}</div>`),
    error: () => outcome('x', 'fall', 'Refused by MP. Nothing changed.', 'The recheck found a new evidence hash after you approved, and an approval never moves to a different change. Review the new version.', `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${status.refused}<span class="chip">Evidence hash mismatch</span></div>`) + bs('Review the new version', 'primary'),
    stale: () => outcome('clock', 'warn', 'Expired. It did not apply.', 'The 15 minutes closed before this applied, so nothing changed. Approve again for a new window.', tags(status.expired, CT2, CT)) + bs('Sign in and approve', 'primary', 'lock'),
    offline: () => banner('', 'Offline.', 'Your approval reached MP at 09:18. Applying runs on the server, and the result shows when you reconnect.', 'wifi-off') + outcome('clock', 'warn', 'Approved, result not seen yet.', 'Nothing is sent twice: the same approval cannot apply again.'),
    noModel: () => outcome('check', 'rise', 'Restarted. US tech, 12 months is issuing.', 'Applied at 09:18 with your fresh sign-in. R2-HGB v3 has a fresh approval, and forecasts return from the next run.', tags(status.approved, CT)) + changeCard(RESTART_ROWS.slice(0, 2), 'What changed') + `<div>${RESTARTS}</div>`,
    abstention: () => outcome('pause', 'warn', 'You kept it paused. Nothing changed.', 'US tech, 12 months stays paused, so its forecasts stay withheld. The proposal stays with what waits on you, and nothing restarts without your yes.', tags(status.paused, CT2)),
    disagreement: () => outcome('check', 'rise', 'Already decided on your iPad.', 'You approved this at 09:18, and your tap here made no second approval. One record, one change.', `<div style="margin-top:10px">${status.approved}</div>`)
  });
  const restartResultRail = ctx => (ctx.state === 'abstention' ? safeBox('A pause holds back this one scope. Prices, holdings and other forecasts still work.') : ctx.state === 'default' ? box(`${lbl('What happens next')}<p class="small muted" style="margin-top:4px">If it slips, it goes back to v1 by itself and tells you. Switching forward again needs your yes.</p><div style="margin-top:8px">${proposed('SCI-D07')}</div>`) : safeBox('An approval covers one exact change and cannot be replayed. A failed step leaves the previous version current.'));

  /* ---------- revoking before the commit starts (MP-55, MP-78): an approved change that has not started can still be stopped ---------- */
  /* the same import as Holdings' a-live and b-live: its rows, hash, times and recovery */
  const LIVE = 'Live until 21:33';
  const impHead = (chip = expiry(LIVE)) => headCard(lead('layers'), 'Statement import, 9 of 11 rows', 'ISA statement · 3 groups · against ledger revision 213', chip);
  const impBound = () => kv([['Draft revision', '6'], ['Selected rows hash', '7f3a…c21e'], ['Expected revision', '213'], ['Approved', '21:18'], ['Expires', '21:33']]);
  const impRows = () => `<div style="margin-top:10px">${kv([['Apple', '60 → 64 units'], ['HSBC, HSBA · XLON', '700 → 730 units'], ['AstraZeneca', '85 → 75 units'], ['ISA cash', '£4,012.60 → £4,142.83']])}</div>`;
  const revokeBtn = (off = false) => (off ? '<button class="btn sm btn-primary" type="button" disabled>Revoke this approval</button>' : bs('Revoke this approval', 'primary', 'ban'));
  const revokeCore = ctx => region(ctx, {
    what: 'This approval', rows: 2, ok: () => impHead() + box(`${lbl('Approved, not started')}<p class="small muted" style="margin:4px 0 10px">The commit has not started, so you can still stop it. Once it starts, it finishes once or not at all.</p>${impBound()}${impRows()}<div style="display:grid;margin-top:12px">${revokeBtn()}</div>`),
    loading: () => impHead() + box(`${lbl('Revoking')}<p class="small muted" style="margin-top:4px">Nothing can start while this runs. A second tap does nothing more.</p><div style="margin-top:8px">${steps(step('Recheck', 'The commit has not started'), step('Revoke', 'Writing the revocation', 'now'))}</div>`),
    empty: () => outcome('ban', 'fall', 'Revoked. Nothing changed.', 'You revoked this at 21:19, before the commit started, so it can never activate. The ledger stays at revision 213, and the draft stays at revision 6, ready for a new approval.', `<div style="margin-top:10px">${status.revoked}</div>`) + bs('Back to Imports'),
    error: () => outcome('alert', 'warn', 'Too late to revoke.', 'The commit started at 21:22, before your revoke reached MP, so it finishes whole or not at all. To undo it, reverse the import.', `<div style="margin-top:10px">${status.approved}</div>`) + bs('Back to Imports'),
    stale: () => outcome('clock', 'warn', 'Expired. There is nothing to revoke.', 'It expired at 21:33 with no commit started, so nothing was committed. The rows have not changed, so a fresh approval is enough.', `<div style="margin-top:10px">${status.expired}</div>`) + bs('Sign in and approve', 'primary', 'lock'),
    offline: () => banner('', 'Offline.', 'You can read this approval. Revoking needs a connection. If no commit starts by 21:33, this approval expires by itself.', 'wifi-off') + impHead() + box(`${lbl('Approved, not started')}<div style="margin-top:8px">${impBound()}${impRows()}</div><div style="display:grid;margin-top:12px">${revokeBtn(true)}</div>`),
    disagreement: () => outcome('alert', 'warn', 'Refused for a stale revision.', 'Your ledger moved to revision 214, so this approval for 213 can never commit. Nothing was committed. Refresh the preview to approve it again.', `<div style="margin-top:10px">${status.refused}</div>`) + bs('Refresh preview', 'primary', 'refresh'),
    abstention: () => impHead(`<span class="chip stale">${ic('lock', 's14')}Sign-in too old</span>`) + stateCard('lock', 'Fresh sign-in needed', 'Your sign-in is too old for this step, and a Face ID unlock alone does not count. Nothing has changed.', bs('Sign in again', 'primary'), CT)
  });
  const revokeRail = () => safeBox('This records what already happened at your broker. It places no trade. Revoking stops one approval from activating. It changes nothing else, and it is kept on the record.');
  const naRevoke = { noModel: 'Revoking an approval involves no forecast, so no model can be missing here.' };
  /* once approved, an import leaves the decisions and waits here until its commit starts. Ready still has it awaiting your approval, so this row shows when nothing else waits */
  const liveRow = () => sec('Approved, not started') + list(item(lead('layers'), 'Statement import, 9 of 11 rows', 'ISA statement · ledger revision 213', ic('chev-r', 's18'), `<span style="display:flex;gap:6px;flex-wrap:wrap">${expiry(LIVE)}</span>`, false, true));
  const liveNote = () => `<p class="small muted" style="padding:0 4px">An import you approve moves to Approved, not started, and you can revoke it until its commit starts.</p>`;

  /* ---------- Option A: one queue ---------- */
  const Q = [
    ['plus', 'Watch Taiwan Semiconductor', 'TSM · XNYS · Claude proposed in chat', 'Expires today 18:00', Q9],
    ['cube', 'Promote R2-HGB v4', 'Passed its shadow trial, 8 of 8 weeks', 'Expires Fri 18:00', CT2],
    ['sliders', 'Narrow a self-correction band', 'Probabilities: 5 to 4 points a week', 'Expires Mon 18:00', CT2],
    ['layers', 'Confirm a statement import', '11 rows · ledger revision 213', '15 min once approved']
  ];
  const qRow = (q, i, ctx) => item(lead(q[0], wide(ctx) && i === 0 ? 'sel' : ''), q[1], q[2], ic('chev-r', 's18'), `<span style="display:flex;gap:6px;flex-wrap:wrap">${expiry(q[3])}${q[4] || ''}</span>`, wide(ctx) && i === 0, true);
  const queue = (ctx, rows = Q) => list(rows.map((q, i) => qRow(q, i, ctx)).join(''));
  const queueHero = (n = 4, sub = 'Soonest first. Nothing happens until you decide.') => `<div class="card fcard" style="display:flex;align-items:center;gap:14px" data-mo="card"><span class="amt" style="font-size:44px">${roll(String(n))}</span><div style="min-width:0"><div style="font:600 17px/22px var(--font-text);letter-spacing:-.01em">${n === 1 ? 'decision waits' : 'decisions wait'} on you</div><p class="small muted">${sub}</p></div></div>`;
  const closed = () => sec('Cannot be approved') + list(item(lead('clock', 'warn'), 'Watch Barclays', 'BARC · XLON · expired 08:14', bs('Run again'), Q9) + item(lead('ban', 'fall'), 'Let the chat route add listings', 'Would widen authority, so code refused it', status.blocked));
  /* the inbox (MP-162): by time detected, with read state synced across devices, and each entry opens its evidence */
  const NOTICE = [
    ['alert', 'warn', 'US tech is 31.0% of the portfolio', 'Material risk · detected Tue 22:15', 'Unread'],
    ['clock', '', 'HSBC price is late', 'Last price 14:10 · detected Tue 16:50', 'Dismissed'],
    ['refresh', '', 'R1-LGB v2 reverted by itself', 'India midcap, 3 months · detected Mon 22:20', 'Read']
  ];
  const nBtn = (t, off) => (off ? `<button class="btn sm btn-tinted" type="button" disabled>${t}</button>` : bs(t));
  const noticeRow = (n, ctx, o) => {
    const off = ctx.state === 'offline', st = o.read && n[4] === 'Unread' ? 'Read' : n[4];
    return item(lead(n[0], n[1]), ctx.state === 'stale' ? n[2].replace('is late', 'is stale').replace('31.0% of the portfolio', '33.4% of the known total') : n[2], n[3], `<span class="chip${st === 'Unread' ? ' fresh' : ''}">${st === 'Unread' ? '<span class="dot"></span>' : ''}${st}</span>`, `<span style="display:flex;gap:6px;flex-wrap:wrap">${nBtn('See the evidence', off)}${st === 'Dismissed' ? '' : nBtn('Dismiss', off)}</span>`);
  };
  /* a paused scope notifies the owner (MP-159), and every intent appears here (MP-162) */
  const PAUSED = ['pause', 'warn', 'US tech, 12 months paused', 'Previous model not eligible · detected Tue 21:20', 'Unread'];
  const noticeList = ctx => (ctx.state === 'noModel' ? [NOTICE[0], PAUSED, ...NOTICE.slice(1)] : NOTICE);
  const notices = (ctx, o = {}) => sec('Notices', '<span class="small muted">By time detected</span>') + list(noticeList(ctx).map(n => noticeRow(n, ctx, o)).join('')) + `<p class="small muted" style="padding:0 4px">Every notice stays here, whether or not its push arrived. Opening one shows its evidence and never performs an action. Read state syncs across your devices.</p>`;
  /* one body for the inbox, in every state: the queue, Home's rail and Notices all read it */
  const noticeBody = ctx => region(ctx, {
    what: 'Notices', rows: 3, ok: () => notices(ctx),
    loading: () => sec('Notices', '<span class="small muted">Checking for new notices</span>') + skel(3),
    empty: () => stateCard('check', 'No notices yet', 'Silence is not a sign that nothing is wrong: check your forecasts and data status.'),
    error: () => banner('fall', 'Notices did not load.', 'They failed at 21:14. Nothing is lost: every notice stays on the server.', 'alert') + `<div>${bs('Try again', 'tinted', 'refresh')}</div>`,
    stale: () => banner('warn', 'From 14:10.', 'Newer notices appear once this refreshes.', 'clock') + notices(ctx),
    offline: () => banner('', 'Offline.', 'Notices saved at 21:15. Each rebuilds from the server when you reconnect.', 'wifi-off') + notices(ctx),
    noModel: () => notices(ctx),
    disagreement: () => banner('', 'Read on your iPad.', 'Unread here, read there. A conflict always resolves to read.', 'split') + notices(ctx, { read: true }),
    abstention: () => banner('', '1 notice held.', 'Quiet hours are 22:00 to 07:00. It arrives with the 07:30 brief, and it is already in this inbox.', 'clock') + notices(ctx)
  });
  const NOTICE_LINE = { loading: 'Checking for new notices', empty: 'No notices yet', error: 'Notices did not load', noModel: '2 unread · newest detected Tue 22:15', disagreement: 'None unread · newest detected Tue 22:15' };
  /* the same facts on both sides of the flip */
  const OVERLAP = ['Two proposals overlap.', 'The promotion binds the 5-point band and the settings change moves it to 4, so approving one sends the other back to its check.'];
  const UNCHECKED = ['One proposal is not yet checked.', 'Code could not finish the check on Barclays, so it cannot be confirmed yet.'];
  const PAUSE_TEXT = 'US tech, 12 months has no eligible model, so forecasts are withheld. Restarting needs your yes. Prices and holdings still work.';
  const STALE_TEXT = `Each proposal rechecks itself before you can approve it. HSBC is past the freshness limit, so it leaves the total until its price returns: £78,508.20 known, 6 of 7 priced. ${LATE}`;
  const inboxBody = ctx => region(ctx, {
    what: 'What waits on you', rows: 4, ok: () => queueHero() + queue(ctx) + closed() + liveNote(),
    loading: () => `<div class="card fcard" data-mo="card"><span class="label">Last good 21:15 · expiry times come from the server</span><span class="sk" style="height:44px;width:60%;margin-top:10px"></span></div>` + skel(4),
    empty: () => stateCard('check', 'Nothing waits on you', 'Claude and code have no open proposals. This says nothing about risk: risk alerts arrive on their own.', bs('See the record')) + liveRow(),
    error: () => stateCard('alert', 'This list did not load', 'Nothing can be approved until it does. Open proposals keep their expiry on the server, and nothing is lost.', bs('Try again', 'tinted', 'refresh')),
    stale: () => banner('warn', 'Showing this list from 14:10.', `Expiry times may have passed. ${STALE_TEXT}`, 'clock') + queueHero() + queue(ctx),
    offline: () => banner('', 'Offline.', 'You can read what waits. Approving needs a connection.', 'wifi-off') + queueHero() + queue(ctx),
    noModel: () => banner('fall', 'A forecast scope is paused.', PAUSE_TEXT, 'cube') + queueHero(5) + list(item(lead('pause', 'warn'), 'Restart US tech, 12 months', 'Previous model not eligible, so it paused rather than reverted', ic('chev-r', 's18'), `<span style="display:flex;gap:6px;flex-wrap:wrap">${expiry(WAITS, 'illus')}${CT2}</span>`, false, true)) + queue(ctx),
    disagreement: () => banner('', ...OVERLAP, 'split') + queueHero() + queue(ctx),
    abstention: () => banner('', ...UNCHECKED, 'ban') + queueHero(5) + list(item(lead('ban'), 'Watch Barclays', 'BARC · XLON · not yet checked', bs('Run again'))) + queue(ctx)
  }) + noticeBody(ctx);
  const peek = ctx => {
    if (['loading', 'empty', 'error'].includes(ctx.state)) return '';
    return `<div style="display:grid;gap:12px">${listingHead()}${chain()}${changeCard(TSM_ROWS.slice(0, 3))}${bs('Open this proposal', 'primary')}</div>`;
  };

  /* ---------- Option B: where each thing lives ---------- */
  const strip = (ctx, st = ctx.state) => {
    const one = { default: ['4 decisions wait on you', 'Next: Taiwan Semiconductor, 18:00'], loading: ['Checking what waits on you', 'Last good 21:15'], error: ['Could not check what waits', 'Open proposals keep their expiry'], stale: ['4 decisions wait on you', 'From 14:10 · each rechecks itself when opened'], offline: ['4 decisions wait on you', 'Reading only: approving needs a connection'], noModel: ['5 decisions wait on you', 'One is a paused scope: restarting US tech, 12 months'], disagreement: ['4 decisions wait on you', '2 overlap: approving one sends the other back to its check'], abstention: ['5 decisions wait on you', 'One is not yet checked: Barclays cannot be confirmed yet'] }[st];
    if (st === 'empty') return '';
    return `<div style="display:flex;align-items:center;gap:10px;min-height:48px;padding:2px 4px;cursor:pointer" role="button" tabindex="0" aria-label="${one[0]}. ${one[1]}">${lead(st === 'noModel' ? 'pause' : st === 'error' ? 'alert' : 'person', st === 'noModel' ? 'warn' : st === 'error' ? 'fall' : '')}<div style="flex:1;min-width:0"><div style="font:600 15px/20px var(--font-text);letter-spacing:-.01em;color:var(--ink)">${one[0]}</div><div class="small" style="color:var(--ink)">${one[1]}</div></div>${ic('chev-r', 's18')}</div>${st === 'default' ? `<div style="padding:0 4px 2px 54px">${Q9}</div>` : ''}`;
  };
  const stripCard = ctx => (ctx.state === 'empty' ? '' : `<div class="card" style="padding:6px 8px" data-mo="card">${strip(ctx)}</div>`);
  const vc = ctx => {
    const size = wide(ctx) ? 40 : 44, v = valcard(size);
    if (ctx.state === 'error') return v.replace('As of 21:15 London · data cutoff 21:00', 'Last good run Mon 21:15 · cutoff 21:00');
    if (ctx.state === 'stale') return v.replace('Portfolio value', 'Known value, 6 of 7 priced').replace(money('84,612.40', size), money('78,508.20', size)).replace(/<div class="d">[\s\S]*?<\/div>/, '<div class="d" style="font-size:13px;line-height:18px;letter-spacing:0"><span class="muted">HSBC, £6,104.20 at 14:10, is left out until its price returns.</span></div>').replace(/53\.4/g, '57.6').replace(/28\.5/g, '30.7').replace(/18\.1/g, '11.7');
    return v;
  };
  const homeBody = ctx => region(ctx, {
    what: 'Holdings', rows: 3, ok: () => vc(ctx) + list0(ctx),
    loading: () => vc(ctx) + skel(3),
    empty: () => vc(ctx) + banner('', 'Nothing waits on you.', 'A strip appears here the moment a proposal needs your decision.', 'check') + liveRow() + list0(ctx),
    error: () => banner('fall', 'Proposals did not load.', 'Nothing can be approved until they do. Twelve Data failed at 21:14, so your holdings show the last good run.', 'alert') + vc(ctx) + list0(ctx),
    stale: () => banner('warn', 'Stale.', `Proposals last updated 14:10. ${STALE_TEXT}`, 'clock') + vc(ctx) + list0(ctx),
    offline: () => banner('', 'Offline.', 'Showing figures from 21:15. Approving waits until you reconnect.', 'wifi-off') + vc(ctx) + list0(ctx),
    noModel: () => banner('fall', 'A forecast scope is paused.', PAUSE_TEXT, 'cube') + vc(ctx) + list0(ctx),
    disagreement: () => banner('', ...OVERLAP, 'split') + vc(ctx) + list0(ctx),
    abstention: () => banner('', ...UNCHECKED, 'ban') + vc(ctx) + list0(ctx)
  });
  /* the model abstained on AstraZeneca at 6 months, so its row shows no range, no median and no action */
  const noRange = h => hrow(h).replace(/<div class="fl">[\s\S]*<\/div>\s*<div class="act">[\s\S]*?<\/div>/, `<div class="fl"><span class="chip">${ic('ban', 's14')}Abstained · no range shown</span></div><div class="act"><span class="small muted">None</span></div>`);
  const list0 = ctx => `${sec('Holdings', illus('Decision support'))}<div class="list card" style="margin:0" data-mo="card">${H.slice(0, 4).map(h => (ctx.state === 'abstention' && h.t === 'AZN' ? noRange(h) : hrow(h))).join('')}</div>`;
  const noticeLink = ctx => list(item(lead('alert', 'warn'), 'Notices', NOTICE_LINE[ctx.state] || '1 unread · newest detected Tue 22:15', ic('chev-r', 's18'), '', false, true));
  const homeRail = ctx => `${stripCard(ctx)}${noticeBody(ctx)}`;
  const afterCore = ctx => {
    const row = (s, chip) => list(item(logo(TSM.c, TSM.lg), TSM.n, s, chip));
    return region(ctx, {
      what: 'This listing', ok: () => outcome('check', 'rise', 'Confirmed. It joins from the next close.', 'Catalogue v15 was made with your approval record. Its data capability starts as a candidate until the first close confirms it.', `<div style="margin-top:10px">${status.approved}</div>`) + row('TSM · XNYS · watch-only', `<span class="chip">Next close</span>`),
      loading: () => box(`${lbl('Applying your confirmation')}<p class="small muted" style="margin-top:4px">Catalogue v14 stays current until v15 is written. There is never a half-added listing.</p><div style="margin-top:8px">${steps(step('Recheck', 'Your approval and the catalogue version'), step('Write', 'Catalogue v15', 'now'))}</div>`),
      empty: () => outcome('x', 'fall', 'You refused. Nothing was added.', 'Catalogue v14 stays current. The chat keeps this proposal, marked refused, and a repeat backs off with a visible reason.', `<div style="margin-top:10px">${status.refused}</div>`),
      error: () => outcome('alert', 'fall', 'Confirmed, not applied.', 'The catalogue write failed, so v14 stays current and nothing was half-added. Your confirmation holds, for a retry inside its window.', tags(status.notApplied, Q9)) + bs('Try again', 'primary', 'refresh'),
      stale: () => outcome('clock', 'warn', 'Expired. It cannot be approved.', 'Confirming after 18:00 is refused, and nothing is added. Code runs the check again for a fresh proposal, in this same chat.', tags(status.expired, Q9)) + bs('Run the check again', 'primary', 'refresh'),
      offline: () => banner('', 'Offline.', 'Your confirmation reached MP. The result shows when you reconnect.', 'wifi-off') + row('TSM · XNYS · waiting for the result', `<span class="chip">Unknown</span>`),
      noModel: () => outcome('check', 'rise', 'Added, with no forecast yet.', 'Prices are tracked from the next close. No approved model covers TSM, so no forecast shows until one qualifies.', `<div style="margin-top:10px">${status.approved}</div>`) + row('TSM · XNYS · prices only', `<span class="chip">${ic('cube', 's14')}No model</span>`),
      disagreement: () => outcome('split', 'warn', 'The catalogue moved first.', 'Another confirmation landed at 09:01, so this one is refused against v15. The check runs again on the new version.', `<div style="margin-top:10px">${status.refused}</div>`) + bs('Run the check again', 'primary', 'refresh'),
      abstention: () => outcome('ban', 'warn', 'Not added: coverage changed.', 'Code could no longer confirm coverage when it rechecked, so it refused rather than guess. Nothing was added.', `<div style="margin-top:10px">${status.refused}</div>`)
    });
  };
  const HIST = [
    ['check', 'Confirmed by you', 'Wed 09:02 · catalogue v15 · fresh sign-in', status.approved, CT],
    ['check', 'Code check passed', 'Wed 08:44 · 8 credits used', '<span class="chip">Code</span>'],
    ['plus', 'Claude drafted it', 'Wed 08:41 · from your chat', '<span class="chip">Claude</span>'],
    ['clock', 'Earlier proposal', 'Thu 22 Oct · nobody acted', status.expired, Q9]
  ];
  const histCore = ctx => {
    const rows = (r = HIST) => list(r.map(h => item(lead(h[0]), h[1], h[2], h[3], h[4] || '')).join(''));
    return region(ctx, {
      what: 'This history', rows: 4, ok: () => rows(),
      empty: () => stateCard('clock', 'No history yet', 'Each thing keeps its own history here, from the first proposal to the last change.'),
      error: () => stateCard('alert', 'History did not load', 'It failed at 21:14. Nothing in it can change or be lost.', bs('Try again', 'tinted', 'refresh')) + rows(HIST.slice(0, 1)),
      stale: () => banner('warn', 'Showing history from 14:10.', 'Newer entries appear once it refreshes.', 'clock') + rows(),
      offline: () => banner('', 'Offline.', 'Showing history saved at 21:15.', 'wifi-off') + rows()
    });
  };
  const histRail = () => box(`${lbl('Where the full record is')}<p class="small muted" style="margin-top:4px">Each listing, model and setting keeps its history where it lives. The full audit sits in the admin area, for search across all of them.</p>`);

  const naStep = { noModel: 'Signing in involves no forecast, so no model can be missing here.' };
  const naResult = { noModel: 'This screen reports a decision, not a forecast. A missing model shows on the proposal.', abstention: 'A decision is yours, so nothing can abstain on it.' };
  const naSetting = { noModel: 'A band is a setting the calibrator reads, so no model can be missing from this proposal.' };
  const afterRail = () => safeBox('Claude can propose and cannot add. A confirmation covers this exact listing and this catalogue version, and nothing else.');
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
        id: 'aa-queue', title: 'Waiting on you', note: 'Notices share the place but never act. No model shows a paused scope that needs a restart. Empty shows an approved import you can still revoke.',
        render: ctx => fr(ctx, { fresh: undefined, tab: SET(ctx), title: 'Waiting on you', actions: tb('search', 'Search') + tb('clock', 'The record'), body: inboxBody(ctx), rail: wide(ctx) ? peek(ctx) : '' })
      }, {
        id: 'aa-listing', title: 'New listing', note: 'Proposed in chat. Confirm opens the step-up. Stale shows it expired; Abstaining shows code refusing it; Error shows a check that timed out.',
        render: ctx => {
          const y = listingYes(ctx, 'Bound to catalogue v14 · expires 18:00');
          return fr(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Proposal', body: listingCore(ctx), rail: `${y ? decideCard(ctx, y.yes, y.foot, y.o) : ''}${checks(ctx)}${fromChat(ctx)}${listingLimits(ctx)}${pad(ctx)}`, accessory: y ? decideBar(ctx, y.yes, y.foot, y.o) : '' });
        }
      }, {
        id: 'aa-listing-step', title: 'Step-up for a listing', note: 'The same sheet as the chat\'s. Every line is bound to the approval. Disagreement shows the record moving mid-way.',
        na: naStep,
        render: ctx => fr(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Proposal', noKept: true, body: listingHead() + chain() + changeCard(TSM_ROWS.slice(0, 3)), rail: wide(ctx) ? checks({ state: 'default' }) : '', sheet: stepFor(ctx, STEP_TSM, CT + Q9) })
      }, {
        id: 'aa-model', title: 'Model promotion', note: 'After its shadow trial. Empty shows a trial still running; Stale shows the count paused; Disagreement shows it beating only one comparator.',
        render: ctx => {
          const y = modelYes(ctx);
          return fr(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Proposal', body: modelCore(ctx), rail: `${y ? decideCard(ctx, y.yes, y.foot, y.o) : ''}${modelRail(ctx)}${pad(ctx)}`, accessory: y ? decideBar(ctx, y.yes, y.foot, y.o) : '' });
        }
      }, {
        id: 'aa-setting', title: 'Settings change', note: 'Impact, evidence, cost and rollback, before you approve. Stale shows it expired; Disagreement shows the setting moving first.',
        na: naSetting,
        render: ctx => {
          const y = settingYes(ctx);
          return fr(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Proposal', body: settingCore(ctx), rail: `${y ? decideCard(ctx, y.yes, y.foot, y.o) : ''}${setRail(ctx)}${settingRail(ctx)}${pad(ctx)}`, accessory: y ? decideBar(ctx, y.yes, y.foot, y.o) : '' });
        }
      }, {
        id: 'aa-setting-step', title: 'Step-up for a setting', note: 'Bound to the exact owner, environment, setting, value, current version and expiry.',
        na: naStep,
        render: ctx => fr(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Proposal', noKept: true, body: setHead() + chain() + changeCard(SET_ROWS), rail: wide(ctx) ? setBound(ctx.state === 'disagreement' ? 'What this proposed' : undefined) : '', sheet: stepFor(ctx, STEP_SET, CT2) })
      }, {
        id: 'aa-setting-result', title: 'Settings outcome', note: 'Ready is applied. Empty is you refusing. Error is a write that failed, approved but not applied. Stale is expired.',
        na: naResult,
        render: ctx => fr(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Decision', body: setResult(ctx), rail: setResultRail(ctx) })
      }, {
        id: 'aa-restart', title: 'Switch forward or restart', note: 'Ready switches a reverted model forward. No model restarts a paused scope. Abstaining has no new score, and the decision stays yours. Nothing does either without your yes.',
        render: ctx => {
          const y = restartYes(ctx);
          return fr(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Proposal', body: restartCore(ctx), rail: `${y ? decideCard(ctx, y.yes, y.foot, y.o) : ''}${restartBound(ctx)}${restartRail(ctx)}${pad(ctx)}`, accessory: y ? decideBar(ctx, y.yes, y.foot, y.o) : '' });
        }
      }, {
        id: 'aa-restart-step', title: 'Step-up to switch or restart', note: 'Ready is the sheet for switching forward. No model is the sheet for restarting. Every line is bound to the approval.',
        render: ctx => fr(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Proposal', noKept: true, body: restartStep(ctx), rail: wide(ctx) ? restartStepBound(ctx) : '', sheet: stepFor(ctx, ctx.state === 'noModel' ? STEP_RESTART : STEP_FWD, CT + CT2, WAITING) })
      }, {
        id: 'aa-restart-result', title: 'Switch or restart outcome', note: 'Ready is switched forward. No model is restarted. Empty is you staying on v1. Abstaining is you keeping a paused scope paused. Error is MP refusing at execution. Stale is a window that closed.',
        render: ctx => fr(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Decision', body: restartResult(ctx), rail: restartResultRail(ctx) })
      }, {
        id: 'aa-step', title: 'Step-up', note: 'Every line is bound to the approval. Disagreement shows the record moving mid-way; Abstaining shows it failing closed.',
        na: naStep,
        render: ctx => fr(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Proposal', noKept: true, body: modelHead() + chain('Tuner built', 'Code trialled', 'You decide') + evidence(), rail: wide(ctx) ? stepBound(ctx) : '', sheet: stepFor(ctx, STEP_MODEL, CT2) })
      }, {
        id: 'aa-result', title: 'Outcome', note: 'Ready is approved. Empty is you refusing. Error is MP refusing at execution. Stale is expired.',
        na: naResult,
        render: ctx => fr(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Decision', body: resultCore(ctx), rail: resultRail(ctx) })
      }, {
        id: 'aa-after', title: 'Listing outcome', note: 'Ready joins from the next close. Empty is you refusing. Stale is expired. Error is a write that failed, confirmed but not applied.',
        render: ctx => fr(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Decision', body: afterCore(ctx), rail: afterRail() })
      }, {
        id: 'aa-revoke', title: 'Revoke an approval', note: 'The same import as Holdings. Ready is approved and not started. Empty is revoked. Error is a commit that started first. Stale is expired, with a fresh approval. Disagreement is refused for a stale revision. Abstaining is a step-up.',
        na: naRevoke,
        render: ctx => fr(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Approved', body: revokeCore(ctx), rail: revokeRail() })
      }, {
        id: 'aa-record', title: 'The record', note: 'Reverts by code are marked Automatic, and never read as your decision.',
        na: naRecord,
        render: ctx => fr(ctx, { tab: SET(ctx), back: 'Waiting', title: 'Decisions', body: recCore(ctx), rail: recDetail(ctx) })
      }]
    }, {
      id: 'b', name: 'In place',
      why: 'Each decision happens where the thing lives: a listing in the chat that proposed it, a model on its forecast page. A strip above the holdings says what waits and takes you to the next one, so context is never lost.',
      cost: 'Proposals are spread across the app, so one can sit unseen behind the strip. Each place needs its own care for expiry and step-up, and there is no one list to scan.',
      screens: [{
        id: 'ab-home', title: 'What waits', note: 'A strip above the dock, in reach. It shows one next decision, never a list. Notices has its own control on every device. Empty shows an approved import you can still revoke.',
        render: ctx => fr(ctx, { fresh: undefined, tab: 0, title: 'Portfolio', actions: tb('alert', 'Notices') + tb('search', 'Search') + tb('eye-off', 'Hide amounts'), webActions: tb('alert', 'Notices'), body: homeBody(ctx) + (wide(ctx) ? '' : noticeLink(ctx)) + pad(ctx), rail: wide(ctx) ? homeRail(ctx) : '', accessory: wide(ctx) ? '' : strip(ctx) })
      }, {
        id: 'ab-notices', title: 'Notices', note: 'The inbox, in the order code detected each notice. No model shows a paused scope, which notifies you. Disagreement shows a read-state conflict resolving to read.',
        render: ctx => fr(ctx, { fresh: undefined, tab: 0, back: 'Portfolio', title: 'Notices', body: noticeBody(ctx) })
      }, {
        id: 'ab-chat', title: 'Confirm in chat', note: 'The confirm card sits in the conversation that asked for it. Confirm opens the step-up. Stale shows it expired; Abstaining shows code refusing it.',
        render: ctx => {
          const y = listingYes(ctx, 'Bound to catalogue v14 · expires 18:00');
          return fr(ctx, { tab: 0, back: 'Portfolio', title: 'Ask', body: fromChat(ctx) + listingCore(ctx, { chat: true }), rail: `${y ? decideCard(ctx, y.yes, y.foot, y.o) : ''}${checks(ctx)}${listingLimits(ctx)}${pad(ctx)}`, accessory: y ? decideBar(ctx, y.yes, y.foot, y.o) : '' });
        }
      }, {
        id: 'ab-step', title: 'Step-up', note: 'The same sheet everywhere, over the place you are. Disagreement shows the record moving mid-way.',
        na: naStep,
        render: ctx => fr(ctx, { tab: 0, back: 'Portfolio', title: 'Ask', noKept: true, body: fromChat({ state: 'default' }) + changeCard(TSM_ROWS.slice(0, 3)), rail: wide(ctx) ? checks({ state: 'default' }) : '', sheet: stepFor(ctx, STEP_TSM, CT + Q9) })
      }, {
        id: 'ab-after', title: 'Outcome', note: 'The listing\'s own page tells you what happened. Empty is you refusing. Stale is expired. Error is a write that failed, confirmed but not applied.',
        render: ctx => fr(ctx, { tab: 1, back: 'Ask', title: TSM.n, body: afterCore(ctx), rail: afterRail() })
      }, {
        id: 'ab-model', title: 'Promotion in place', note: 'On the models page, beside the model it would replace. Empty shows a trial still running; Stale shows the count paused.',
        render: ctx => {
          const y = modelYes(ctx);
          const current = ctx.state === 'loading' ? '' : ctx.state === 'noModel' ? box(`<div style="display:flex;align-items:center;gap:8px"><span class="chip error">${ic('cube', 's14')}Approval expired</span><span style="font:600 15px/20px var(--font-text);letter-spacing:-.01em">R2-HGB v3</span></div>`) : box(`<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span class="chip owner"><span class="dot"></span>Active</span><span style="font:600 15px/20px var(--font-text);letter-spacing:-.01em">R2-HGB v3</span></div>${proof(true)}`);
          return fr(ctx, { tab: 1, back: 'Forecasts', title: 'Models', body: current + modelCore(ctx), rail: `${y ? decideCard(ctx, y.yes, y.foot, y.o) : ''}${modelRail(ctx)}${pad(ctx)}`, accessory: y ? decideBar(ctx, y.yes, y.foot, y.o) : '' });
        }
      }, {
        id: 'ab-model-step', title: 'Step-up for a promotion', note: 'The same sheet, over the models page. Every line is bound to the approval.',
        na: naStep,
        render: ctx => fr(ctx, { tab: 1, back: 'Forecasts', title: 'Models', noKept: true, body: modelHead() + chain('Tuner built', 'Code trialled', 'You decide') + evidence(), rail: wide(ctx) ? stepBound(ctx) : '', sheet: stepFor(ctx, STEP_MODEL, CT2) })
      }, {
        id: 'ab-model-result', title: 'Promotion outcome', note: 'On the models page. Ready is approved and on probation. Empty is you refusing. Error is MP refusing at execution. Stale is expired.',
        na: naResult,
        render: ctx => fr(ctx, { tab: 1, back: 'Models', title: 'Decision', body: resultCore(ctx), rail: resultRail(ctx) })
      }, {
        id: 'ab-setting', title: 'Settings change', note: 'In Settings, beside the setting it would change, with its impact, evidence, cost and rollback.',
        na: naSetting,
        render: ctx => {
          const y = settingYes(ctx);
          return fr(ctx, { tab: SET(ctx), back: 'Settings', title: 'Proposal', body: settingCore(ctx), rail: `${y ? decideCard(ctx, y.yes, y.foot, y.o) : ''}${setRail(ctx)}${settingRail(ctx)}${pad(ctx)}`, accessory: y ? decideBar(ctx, y.yes, y.foot, y.o) : '' });
        }
      }, {
        id: 'ab-setting-step', title: 'Step-up for a setting', note: 'The same sheet, in Settings. Bound to the exact owner, environment, setting, value, current version and expiry.',
        na: naStep,
        render: ctx => fr(ctx, { tab: SET(ctx), back: 'Settings', title: 'Proposal', noKept: true, body: setHead() + chain() + changeCard(SET_ROWS), rail: wide(ctx) ? setBound(ctx.state === 'disagreement' ? 'What this proposed' : undefined) : '', sheet: stepFor(ctx, STEP_SET, CT2) })
      }, {
        id: 'ab-setting-result', title: 'Settings outcome', note: 'In Settings. Ready is applied. Empty is you refusing. Error is a write that failed, approved but not applied. Stale is expired.',
        na: naResult,
        render: ctx => fr(ctx, { tab: SET(ctx), back: 'Settings', title: 'Decision', body: setResult(ctx), rail: setResultRail(ctx) })
      }, {
        id: 'ab-restart', title: 'Switch forward or restart', note: 'On the models page. Ready switches a reverted model forward. No model restarts a paused scope. Abstaining has no new score, and the decision stays yours.',
        render: ctx => {
          const y = restartYes(ctx);
          return fr(ctx, { tab: 1, back: 'Forecasts', title: 'Models', body: restartCore(ctx), rail: `${y ? decideCard(ctx, y.yes, y.foot, y.o) : ''}${restartBound(ctx)}${restartRail(ctx)}${pad(ctx)}`, accessory: y ? decideBar(ctx, y.yes, y.foot, y.o) : '' });
        }
      }, {
        id: 'ab-restart-step', title: 'Step-up to switch or restart', note: 'The same sheet, over the models page. Ready is switching forward. No model is restarting.',
        render: ctx => fr(ctx, { tab: 1, back: 'Forecasts', title: 'Models', noKept: true, body: restartStep(ctx), rail: wide(ctx) ? restartStepBound(ctx) : '', sheet: stepFor(ctx, ctx.state === 'noModel' ? STEP_RESTART : STEP_FWD, CT + CT2, WAITING) })
      }, {
        id: 'ab-restart-result', title: 'Switch or restart outcome', note: 'On the models page. Ready is switched forward. No model is restarted. Empty is you staying on v1. Abstaining is you keeping a paused scope paused. Stale is a window that closed.',
        render: ctx => fr(ctx, { tab: 1, back: 'Models', title: 'Decision', body: restartResult(ctx), rail: restartResultRail(ctx) })
      }, {
        id: 'ab-revoke', title: 'Revoke an approval', note: 'The same import as Holdings. Ready is approved and not started. Empty is revoked. Error is a commit that started first. Disagreement is refused for a stale revision. Abstaining is a step-up.',
        na: naRevoke,
        render: ctx => fr(ctx, { tab: 0, back: 'Portfolio', title: 'Approved', body: revokeCore(ctx), rail: revokeRail() })
      }, {
        id: 'ab-history', title: 'History', note: 'Each listing, model and setting keeps its own history. Nothing is deleted.',
        na: naRecord,
        render: ctx => fr(ctx, { tab: 1, back: 'TSM', title: 'History', body: histCore(ctx), rail: histRail() })
      }]
    }]
  });
}
