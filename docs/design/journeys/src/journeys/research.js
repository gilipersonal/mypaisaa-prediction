/* Research: the 07:30 brief, research cards, asking why, a figure's source, memory notes and risk alerts (MP-62).
   Stories MP-127, MP-129, MP-125, MP-148, MP-138, MP-115, MP-81. Numbers come from code and models; Claude writes only the
   words, and every figure it quotes carries a source. All journeys share one script, so this block keeps its helpers. */
{
  const wide = ctx => ctx.kind === 'ipad' || ctx.kind === 'web';
  const N = byT.NVDA;

  /* ---------- Prism rows and small parts, composed the same way on every screen ---------- */
  const bs = (label, kind = 'tinted', icon = '') => `<button class="btn sm btn-${kind}" type="button">${icon ? ic(icon, 's16') : ''}${label}</button>`;
  const lead = (i, tone = '') => { const [bg, fg] = tone === 'warn' ? ['--warn-tint', '--warn'] : tone === 'fall' ? ['--fall-tint', '--fall'] : tone === 'sel' ? ['--surface', '--ink'] : ['--surface-2', '--ink']; return `<span class="logo" style="--c:var(${bg});color:var(${fg});--ic2:var(--link)" aria-hidden="true">${ic(i, 's18')}</span>`; };
  const item = (l, t, s, r = '', x = '', sel = false) => `<div class="hrow${sel ? ' sel' : ''}" data-mo="rise">${l}<div style="min-width:0"><div class="nm" style="white-space:normal">${t}</div><div class="tk" style="white-space:normal">${s}</div></div><div class="vv" style="justify-self:end;text-align:right">${r}</div>${x ? `<div class="fl" style="display:block">${x}</div>` : ''}</div>`;
  const list = rows => `<div class="list card" style="margin:0" data-mo="card">${rows}</div>`;
  const sec = (t, r = '') => `<div class="sech" style="padding:8px 4px 0" data-mo="rise"><h3 style="font:600 17px/22px var(--font-text);letter-spacing:-.01em">${t}</h3>${r}</div>`;
  const kv = rows => `<dl class="kv">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  const box = (inner, st = '') => `<div class="card fcard" data-mo="card" style="${st}">${inner}</div>`;
  const lbl = t => `<div class="label">${t}</div>`;
  const pad = ctx => (wide(ctx) ? '' : '<div style="height:44px" aria-hidden="true"></div>');
  const info = (label, icon = 'info') => `<button class="tbtn" type="button" aria-label="${label}">${ic(icon, 's24')}</button>`;

  /* ---------- Claude's own component, from Prism's Claude section. Its logo is never drawn: the mark is three facets ---------- */
  const mark = (cls = '') => `<span class="cl-mark${cls}" aria-hidden="true"><i></i><i></i><i></i></span>`;
  const TICK = `<svg class="cl-tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13 10 19 20 6"/></svg>`;
  const ref = n => `<span class="cl-ref">${n}</span>`;
  const fig = t => `<span class="cl-fig">${t}</span>`;
  const step = (t, st = 'done') => `<li class="cl-step">${st === 'done' ? TICK : st === 'now' ? '<span class="spin" style="margin:2px;color:var(--link)" aria-hidden="true"></span>' : `<span style="display:grid;place-items:center;color:var(--fall)" aria-hidden="true">${ic('x', 's16')}</span>`}<span>${t}</span></li>`;
  const steps = (...s) => `<ol class="cl-steps">${s.join('')}</ol>`;
  const sources = (...s) => `<ul class="cl-src" aria-label="Sources">${s.map(x => `<li>${x}</li>`).join('')}</ul>`;
  const clBtn = (t, q = true) => `<button class="cl-btn${q ? ' q' : ''}" type="button">${t}</button>`;
  const act = (...b) => `<div class="cl-act">${b.join('')}</div>`;
  const cl = (status, inner, run = '', label = 'Claude') => `<article class="cl"${run ? ` data-run="${run}"` : ''} data-mo="card" style="max-width:none" aria-label="${label}"><header class="cl-head">${mark()}<span class="cl-who">Claude</span><span class="cl-status" role="status">${status}</span></header>${inner}</article>`;
  const ask = t => `<p class="cl-q" data-mo="rise">${t}</p>`;
  const SAY = t => `<p class="cl-a">${t}</p>`;
  const NOTE = `<p class="cl-note">Figures come from code and models; Claude explains them. Decision support, not advice. Every figure is illustrative.</p>`;
  const WHY_Q = 'Why is NVIDIA ranked Trim?';
  const STEPS = steps(step('Read your holdings'), step('Checked the 6-month forecast'), step('Read a filing and a stored event analysis'));
  const SRC4 = sources('1 · Ledger, 21:15', '2 · Model R2-HGB v3', '3 · Filing, illustrative', '4 · Event analysis, 2 Nov');
  const ANSWER = SAY(`NVIDIA is ${fig('13.5%')} of the portfolio.${ref(1)} Its 6-month median is ${fig('+9.1%')}, but the 80% range runs from ${fig('−18.5%')} to ${fig('+34.0%')},${ref(2)} the widest of your holdings. Last week's filing raised guidance by ${fig('6%')},${ref(3)} which the stored event analysis reads as the main bull point.${ref(4)} Trimming would narrow the portfolio's range.`);
  const answered = (status = 'Done · 4 sources', extra = '') => cl(status, STEPS + ANSWER + SRC4 + NOTE + extra, '', 'Claude explains the ranked action and cites every figure');
  const composer = (ctx, hint) => {
    const off = ctx.state === 'offline' ? 'Asking needs a connection' : ctx.state === 'noModel' ? 'Claude is off this month' : '';
    return `<div style="display:flex;align-items:center;gap:8px"><div class="search" style="flex:1;min-width:0">${off ? ic(ctx.state === 'offline' ? 'wifi-off' : 'ban', 's18') : mark(' s')}<span style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${off || hint}</span></div><button class="iconbtn" type="button" aria-label="Send"${off ? ' disabled style="opacity:.5"' : ' style="background:var(--btn);color:var(--btn-ink)"'}>${ic('up', 'fill s16')}</button></div>`;
  };
  const askCard = (ctx, hint) => (wide(ctx) ? `<div class="card" style="padding:10px 12px;box-shadow:var(--shadow-1)" data-mo="card">${composer(ctx, hint)}</div>` : '');
  const askBar = (ctx, hint) => (wide(ctx) ? '' : composer(ctx, hint));

  /* ---------- the brief (MP-148, MP-125): actions, then risks, changes and what is coming up ---------- */
  const MARKETS = [['India', '--mark-in', 'Tue 10:00'], ['UK', '--mark-uk', 'Tue 16:35'], ['US', '--mark-us', 'Tue 21:00']];
  const markets = () => `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px">${MARKETS.map(([n, c, t]) => `<div style="padding:8px 10px;border-radius:var(--r-sm);background:var(--surface-2);min-width:0"><div class="label" style="display:flex;align-items:center;gap:6px;color:var(--ink)"><i style="width:8px;height:8px;border-radius:2px;background:var(${c});flex:none"></i>${n}</div><div style="font:600 13px/18px var(--font-text);letter-spacing:0;margin-top:2px;white-space:nowrap">${t}</div></div>`).join('')}</div><p class="small muted" style="margin-top:6px">Last close for each market, in London time.</p>`;
  const briefTag = ctx => (ctx.state === 'noModel' ? `<span class="chip">${ic('layers', 's14')}Template · figures by code</span>` : `<span class="cl-chip">${mark(' s')}Words by Claude · figures by code</span>`);
  const hero = (ctx, title, text, when = 'Wed 4 Nov · issued 07:30 London') => box(`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap"><span class="label">${when}</span>${briefTag(ctx)}</div><p style="margin-top:8px;font:700 22px/28px var(--font-text);letter-spacing:-.015em;text-wrap:balance">${title}</p><p class="small muted" style="margin-top:6px">${text}</p>${markets()}`);
  const WHY = {
    NVDA: `${fig('13.5%')} of the portfolio,${ref(1)} with the widest 80% range of your holdings.${ref(2)}`,
    SPY: `The narrowest range of your US holdings,${ref(2)} and it spreads single-name risk.`,
    RELIANCE: `The second-highest median of your holdings,${ref(2)} with a wide range.`,
    HSBA: `Paused: the last price is from 16:35,${ref(3)} so its forecast is held.`
  };
  const TEMPLATE = { NVDA: 'Portfolio share 13.5%. Widest 80% range.', SPY: 'Portfolio share 22.4%. Narrowest US range.', RELIANCE: 'Portfolio share 10.6%. Second-highest median.', HSBA: 'Last price 16:35. Forecast held.' };
  const uncert = h => `<div style="display:flex;align-items:center;gap:10px;margin-top:6px"><div style="flex:1;min-width:0">${range(h)}</div><span class="fcv">${pct(h.med)} · 6M</span></div><p class="small muted" style="margin-top:2px">80% range ${pct(h.lo)} to ${pct(h.hi)}</p>`;
  const actionRow = (h, why) => item(logo(h.c, h.lg), h.n, `${h.t} · ${h.v}`, badge(h.act), `<p class="small muted">${why}</p>${uncert(h)}`);
  const actionRows = (ctx, o = {}) => ['NVDA', 'SPY', 'RELIANCE', 'HSBA'].map(t => {
    const h = byT[t], why = ctx.state === 'noModel' ? TEMPLATE[t] : WHY[t];
    if (t === 'RELIANCE' && o.split) return item(logo(h.c, h.lg), h.n, `${h.t} · ${h.v}`, `<span class="chip">${ic('split', 's14')}No action ranked</span>`, `<p class="small muted">Two models differ on direction at 3 months.${ref(2)}</p><div style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 10px;align-items:center;margin-top:6px;font:600 12px/16px var(--font-text);letter-spacing:0;color:var(--ink-2)"><span>Baseline</span>${range({ ...h, med: -1.5, lo: -14, hi: 11, lo50: -7.5, hi50: 4 })}<span>R2-HGB v3</span>${range({ ...h, med: 2.8, lo: -6.5, hi: 12.4, lo50: -1.6, hi50: 7.6 })}</div>`);
    if (t === 'HSBA' && o.abstain) return actionRow(h, why) + item(logo(byT.AZN.c, byT.AZN.lg), byT.AZN.n, 'AZN · XLON', `<span class="chip">${ic('ban', 's14')}Abstained</span>`, `<p class="small muted">Too little comparable history at 12 months, so no range is shown and nothing is ranked.${ref(2)}</p>`);
    return actionRow(h, why);
  }).join('');
  const riskRow = () => item(lead('alert', 'warn'), 'US tech is 31.0% of the portfolio', 'Material · detected Tue 22:15 · held by quiet hours', ic('chev-r', 's18'));
  const changes = () => list(item(lead('up'), 'Portfolio up £1,236.18 (1.48%)', 'Tuesday, by code from the ledger') + item(lead('fan'), 'SPY median rose from +4.1% to +4.3%', '6 months · run Tue 21:15 · R2-HGB v3') + item(lead('clock', 'warn'), 'HSBC last priced 16:35', 'Yahoo delayed, so its action is paused'));
  const soon = () => box(`${lbl('Coming up')}<div style="margin-top:8px">${kv([['Thu 5 Nov', 'Bank of England rate decision'], ['Wed 18 Nov', 'NVIDIA results'], ['Fri 4 Dec', 'RBI rate decision']])}</div>`);
  const briefSrc = () => sources('1 · Ledger, 21:15', '2 · Model R2-HGB v3', '3 · Yahoo, 16:35');
  const briefBody = ctx => {
    const head = (o = {}) => hero(ctx, o.title || 'Four ranked actions and one risk held overnight.', o.text || 'Issued once. Nothing here acts: you read, you decide.', o.when);
    const main = (o = {}) => head(o) + sec('Actions', illus('Decision support')) + list(actionRows(ctx, o)) + sec('Risks') + list(riskRow());
    return region(ctx, {
      what: 'The brief', rows: 4, ok: () => main(),
      loading: () => box(`${lbl('Tue 3 Nov · last brief, until today\'s loads')}<span class="sk" style="height:22px;width:86%;margin-top:10px"></span><span class="sk" style="height:14px;width:60%;margin-top:8px"></span>`) + skel(4),
      empty: () => stateCard('clock', 'The next brief comes at 07:30', 'It leads with ranked actions, then risks, changes and what is coming up. Alerts held overnight arrive with it.', bs('Read Tuesday\'s brief'), `<span class="chip">Scheduled · 07:30 London</span>`) + box(`${lbl('Moves with daylight saving')}<p class="small muted" style="margin-top:4px">Always 07:30 in London, with India, UK and US shown on their own clocks.</p>`),
      error: () => banner('warn', 'Late.', 'MP was down at 07:30. This brief was issued on recovery at 08:12, once.', 'clock') + main({ when: 'Wed 4 Nov · issued late, 08:12 London', text: 'Alerts found during the outage carry their detection time.' }),
      stale: () => banner('warn', 'Some evidence is pending.', 'Yahoo has been delayed since 16:35, so UK prices are held. The brief never waits on this morning\'s batch: it quotes the last valid evidence, dated.', 'clock') + main({ title: 'Three ranked actions, one paused, one risk held overnight.' }),
      offline: () => banner('', 'Offline.', 'This is the 07:30 brief, saved on this device. Asking and sources wait until you reconnect.', 'wifi-off') + main(),
      noModel: () => banner('', 'Written by template.', 'Claude is off this month to stay inside the budget. Every figure is the same; the explanations return with Claude.', 'ban') + main({ text: 'A plain template, labelled so. Issued on time.' }),
      disagreement: () => banner('', 'Models disagree on Reliance.', 'Both ranges show, and no action is ranked for it.', 'split') + main({ title: 'Three ranked actions and one risk held overnight.', split: true }),
      abstention: () => banner('', 'One model abstained.', 'AstraZeneca has no 12-month range this morning, and the brief says so rather than filling the gap.', 'ban') + main({ abstain: true })
    });
  };
  const briefRail = ctx => (ctx.state === 'loading' || ctx.state === 'empty' ? soon() : `${askCard(ctx, 'Ask about this brief')}${sec('Changes')}${changes()}${soon()}${box(`${lbl('Sources')}<div style="margin-top:8px">${briefSrc()}</div>`)}`);

  /* ---------- research cards (MP-129): typed cards from code, a bounded bull and bear case ---------- */
  const listing = h => `<div class="card" style="padding:14px 16px;display:flex;gap:12px;align-items:center" data-mo="card">${logo(h.c, h.lg)}<div style="flex:1;min-width:0"><div style="font:700 22px/28px var(--font-text);letter-spacing:-.015em">${h.n}</div><div class="small muted">${h.t} · ${h.v} · US tech</div></div><div style="display:grid;justify-items:end;gap:4px">${money(h.val, 24)}${chg(h.day)}</div></div>`;
  const stance = (o = {}) => box(`<div style="display:flex;align-items:center;gap:8px">${o.noBadge ? `<span class="chip">${ic(o.noBadge[0], 's14')}${o.noBadge[1]}</span>` : badge('Trim')}<span style="font:600 15px/20px var(--font-text);letter-spacing:-.01em">Stance</span><span class="chip illus" style="margin-left:auto">Decision support</span></div>${o.body || `<div style="display:flex;align-items:baseline;gap:8px;margin-top:10px"><span class="amt" style="font-size:30px;color:var(--fc-ink)">${roll('+9.1')}<span class="p">%</span></span><span class="small muted">6-month median</span></div><div style="margin-top:8px">${range(N, 300, 18)}</div><div class="rng"><span>80% range</span><b>−18.5% to +34.0%</b><span>Ranges held</span><b>79% of 52 scored</b></div>`}${fcMeta()}`);
  const BULL = [`Last week's filing raised guidance by ${fig('6%')}.${ref(3)}`, `The 6-month median of ${fig('+9.1%')} is the highest of your holdings.${ref(2)}`];
  const BEAR = [`The 80% range reaches ${fig('−18.5%')}, the widest of your holdings.${ref(2)}`, `At ${fig('13.5%')} of the portfolio, NVIDIA helps lift US tech to ${fig('31.0%')}.${ref(1)}`];
  const side2 = (kind, args) => `<div style="min-width:0"><div style="display:flex;align-items:center;gap:6px;font:600 13px/18px var(--font-text);letter-spacing:0;color:var(${kind === 'Bull' ? '--rise' : '--fall'})">${ic(kind === 'Bull' ? 'up' : 'down', 'fill s14')}${kind} case</div><ol style="display:grid;gap:8px;margin-top:6px">${args.map(a => `<li style="font:400 15px/20px var(--font-text);letter-spacing:-.005em">${a}</li>`).join('')}</ol></div>`;
  const ADJ = `Both sides hold. They differ on size rather than direction: the wide range weighs more at ${fig('13.5%')} of the portfolio than it would at a smaller share.${ref(1)}`;
  const bullBear = (ctx, o = {}) => {
    const cols = wide(ctx) ? 'grid-template-columns:repeat(2,minmax(0,1fr));gap:16px' : 'gap:12px';
    return box(`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><span style="font:600 17px/22px var(--font-text);letter-spacing:-.01em">Bull and bear</span>${o.chip || '<span class="chip">Version 3 · 21:15</span>'}</div>
      <div style="display:grid;${cols};margin-top:10px">${side2('Bull', o.bull || BULL)}${side2('Bear', o.bear || BEAR)}</div>
      <div style="margin-top:12px;padding:10px 12px;border-radius:var(--r-md);background:var(--surface-2)">${lbl('Adjudication')}<p style="margin-top:4px;font:400 15px/20px var(--font-text);letter-spacing:-.005em">${o.adj || ADJ}</p></div>
      <div style="margin-top:10px">${sources('1 · Ledger, 21:15', '2 · Model R2-HGB v3', '3 · Filing, illustrative')}</div>`);
  };
  const MINIS = [
    ['Overlap', 'layers', '15.0%', 'NVIDIA look-through share, with about 7% of SPY.', 'Code v2 · 21:15'],
    ['Benchmark', 'target', '+11.2%', 'Past 12 months against the S&P 500. History.', 'Cutoff 21:00'],
    ['Valuation', 'db', '31×', 'Forward earnings. Five-year median 38×.', 'Code v3 · Tue close'],
    ['Earnings', 'clock', '18 Nov', 'Next results. Known at 30 Oct.', 'Calendar'],
    ['Profile', 'info', 'Held', 'Semiconductors. In your portfolio since 2024.', 'Ledger'],
    ['Scenario', 'scenario', '−14%', 'If US rates rise 1 point. Conditional: it claims no likelihood.', 'Scenario v1', true]
  ];
  const mini = ([t, i, v, s, f, cond], miss) => `<div class="${cond ? '' : 'card '}" data-mo="card" style="padding:12px 14px;border-radius:var(--r-card);min-width:0;display:grid;gap:2px;align-content:start;${cond ? 'border:1.5px dashed var(--hairline-2);' : ''}"><div class="label" style="display:flex;align-items:center;gap:6px">${ic(i, 's14')}${t}</div>${miss ? `<p class="small muted">${miss}</p>` : `<div style="font:800 22px/28px var(--font-figure);letter-spacing:-.03em">${v}</div><p class="small muted">${s}</p>`}<p style="font:400 12px/16px var(--font-text);letter-spacing:0;color:var(--ink-2);margin-top:2px">${f}</p></div>`;
  const minis = (o = {}) => `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${MINIS.map(m => mini(m, (o.miss || {})[m[0]])).join('')}</div>`;
  const cardBody = ctx => {
    const top = (on = 1) => listing(N) + `<div data-mo="rise">${H36(on, 'full')}</div>`;
    return region(ctx, {
      what: 'The research card', rows: 3, ok: () => top() + stance() + bullBear(ctx),
      loading: () => listing(N) + box(`${lbl('Building from stored inputs · last good 21:15')}<span class="sk" style="height:18px;width:70%;margin-top:10px"></span><span class="sk" style="height:60px;margin-top:10px"></span>`) + skel(2),
      empty: () => listing(N) + stateCard('grid', 'No research card yet', 'Cards build after a listing\'s first close with MP. Prices and the forecast already show.', bs('Open the forecast')),
      error: () => top() + stance() + stateCard('alert', 'The bull and bear card did not build', 'It failed at 21:14. No model fills the gap: it rebuilds from stored inputs next time you open this.', bs('Try again', 'tinted', 'refresh')),
      stale: () => banner('warn', 'Superseded.', 'The evidence changed, so version 4 is ready. Version 3 stays for the conversation that cited it.', 'clock') + top() + stance() + bullBear(ctx, { chip: '<span class="chip stale">Version 3 · superseded</span>' }),
      offline: () => banner('', 'Offline.', 'Showing the cards saved at 21:15. They rebuild when you reconnect.', 'wifi-off') + top() + stance() + bullBear(ctx),
      noModel: () => top(2) + stance({ noBadge: ['cube', 'No forecast'], body: `<p class="small muted" style="margin-top:8px">No approved model for 12 months yet, so nothing is ranked at this horizon. 3 and 6 months are available.</p>` }) + bullBear(ctx, { bull: [BULL[0]], bear: [BEAR[1]], adj: `The forecast arguments are left out. Only arguments with stored evidence at this horizon appear.${ref(1)}` }),
      disagreement: () => top() + stance({ noBadge: ['split', 'No action ranked'], body: `<p class="small muted" style="margin-top:8px">R2-HGB v3 and the baseline differ on direction at 3 months. Both ranges show on the forecast.</p>` }) + bullBear(ctx, { adj: `The models disagree on direction, so this card does not settle it.${ref(2)} The evidence on either side stands.` }),
      abstention: () => top() + stance({ noBadge: ['ban', 'Abstained'], body: `<p class="small muted" style="margin-top:8px">Too little comparable history for a calibrated range, so no range is shown.</p>` }) + bullBear(ctx, { bull: [BULL[0]], bear: [BEAR[1]], adj: `No adjudication this time: with no calibrated range, the cited evidence is too thin to weigh.` })
    });
  };
  const cardRail = ctx => {
    if (ctx.state === 'loading' || ctx.state === 'empty') return skel(2);
    const miss = ctx.state === 'error' ? { Valuation: 'Input missing: forward earnings not supplied. Nothing is filled in.' } : ctx.state === 'stale' ? { Benchmark: 'Stale: benchmark last updated 16:35.' } : {};
    return askCard(ctx, 'Ask about NVIDIA') + (wide(ctx) ? sec('More cards') : '') + minis({ miss });
  };

  /* ---------- asking why (MP-127): every turn from read-only tools, every figure with its source ---------- */
  const askThread = ctx => {
    const q = ask(WHY_Q);
    return region(ctx, {
      what: 'This conversation',
      ok: () => `<span class="chip" data-mo="chip" style="justify-self:start">${ic('clock', 's14')}Continued from ${ctx.kind === 'web' || ctx.kind === 'pwa' ? 'your iPhone' : 'the web app'}, 07:48</span>${q}${cl('Writing…', `${STEPS}${SAY(`NVIDIA is ${fig('13.5%')} of the portfolio.${ref(1)} Its 6-month median is ${fig('+9.1%')}, but the 80% range runs from ${fig('−18.5%')} to ${fig('+34.0%')},${ref(2)} the widest of`)}${sources('1 · Ledger, 21:15', '2 · Model R2-HGB v3')}${act(clBtn('Stop'))}`, 'writing', 'Claude is writing a cited answer')}`,
      loading: () => `${q}${cl('Stopped', `${SAY('Stopped. Nothing was changed, and no answer was saved.')}`, '', 'Claude stopped')}${q}${cl('Reading…', `${steps(step('Read your holdings'), step('Checking the 6-month forecast', 'now'))}${act(clBtn('Stop'))}`, 'reading', 'Claude is reading')}`,
      empty: () => cl('Ready', `${SAY('Ask why about any forecast, ranked action or holding. Answers start short, and every figure carries its source.')}<div class="cl-opts">${[WHY_Q, 'What changed since yesterday?', 'Explain the 80% range'].map(t => `<button class="cl-opt" type="button">${t}</button>`).join('')}</div>${`<p class="cl-note">Claude can read, not change. It has read-only tools and no way to trade.</p>`}`),
      error: () => `${q}${cl('A tool failed', `${steps(step('Read your holdings'), step('Forecast tool failed at 21:14', 'fail'))}${SAY(`I couldn't read the forecast, so I won't quote one. NVIDIA is ${fig('13.5%')} of the portfolio.${ref(1)}`)}${sources('1 · Ledger, 21:15')}${act(clBtn('Try again', false), clBtn('See the stored explanation'))}`, '', 'A tool failed')}<p class="cl-note" style="padding:0 4px">A failed turn is retried once at most, and never appears twice.</p>`,
      stale: () => `${banner('warn', 'Evidence changed.', 'This answer was written at 07:48. The forecast has moved since, so it stays as written and labelled.', 'clock')}${q}${answered('Answered 07:48 · 4 sources', act(clBtn('Ask again with new evidence', false)))}`,
      offline: () => `${banner('', 'Offline.', 'This stored conversation is readable. A new question waits until you reconnect.', 'wifi-off')}${q}${answered('Stored · 4 sources')}`,
      noModel: () => cl('Off', `${SAY('Claude is off this month to stay inside the budget. Forecasts, ranges and scores all still work; only the written explanations wait.')}<p class="cl-note">Numbers never depend on Claude. Asking returns when the budget hold lifts.</p>${act(clBtn('See stored explanations', false), clBtn('See the cost'))}`, '', 'Claude is off'),
      disagreement: () => `${ask('Which way does Reliance go at 3 months?')}${cl('Done · 1 source', `${SAY(`The two models disagree, so I can't give one direction. The baseline median is ${fig('−1.5%')}; R2-HGB v3 is ${fig('+2.8%')}.${ref(1)} No action is ranked.`)}${sources('1 · Models, 3 Nov 21:15')}${NOTE}`, '', 'Models disagree')}`,
      abstention: () => `${ask('Sell my NVIDIA now.')}${cl('Refused', `${SAY(`MyPrediction cannot place trades, and I can't either. I can show the forecast, its range and the proof, so you can decide.`)}${act(clBtn('Show the forecast'))}`, '', 'Claude refused')}${ask('Will NVIDIA beat earnings next week?')}${cl('No cited answer', `${SAY(`I can't answer that from cited evidence. No model scores that question and no source covers it yet, so I won't guess.`)}${act(clBtn('See what the models cover'))}`, '', 'No cited answer')}`
    });
  };
  const askRail = ctx => `${box(fcard(N, { w: 340, h: 168, seed: 23 }))}${box(`${lbl('What Claude may read')}<p class="small muted" style="margin-top:4px">Forecasts, prices with their freshness, holdings, rankings and stored event analyses. Read-only. A stored analysis is quoted, not redone.</p>`)}`;

  /* ---------- a figure's source (MP-81): citation, hash, times and rights, always read as untrusted data ---------- */
  const soft = 'box-shadow:inset 0 0 0 1px var(--hairline)';
  const srcFig = (o = {}) => box(`${lbl('Figure in the answer')}<div style="display:flex;align-items:baseline;gap:8px;margin-top:6px"><span class="amt" style="font-size:30px">${roll('6')}<span class="p">%</span></span><span class="small muted">guidance raise, source 3</span></div><p style="margin-top:8px;font:400 15px/20px var(--font-text);letter-spacing:-.005em">${o.quote || 'The company raised its outlook for the next quarter, stated in the results section of the filing.'}</p><p class="small muted" style="margin-top:4px">A short summary, not the publisher's text. Illustrative.</p>`, soft);
  const srcFacts = (o = {}) => box(`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${o.chip || `<span class="chip fresh"><span class="dot"></span>Eligible</span>`}<span class="chip">${ic('shield', 's14')}Read as untrusted data</span></div>${kv([['Publisher', 'SEC EDGAR'], ['Filing', '10-Q, illustrative'], ['Published', '28 Oct, 21:20'], ['Retrieved', '28 Oct, 21:31'], ['Ingested', '28 Oct, 21:33'], ['Known at', '28 Oct, 21:33'], ['Content hash', '8f3a…c21e'], ['Rights', 'Storage allowed'], ['Entity match', '0.98']])}`, soft);
  const srcUsed = () => box(`${lbl('Used by')}<div style="margin-top:6px">${sources('This answer', 'Bull case, version 3', 'Event analysis, 2 Nov')}</div>`, soft);
  const srcTitle = (t = 'Source 3 · Filing') => `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><h4 style="font:600 20px/25px var(--font-text);letter-spacing:-.01em">${t}</h4><button class="tbtn" type="button" aria-label="Close">${ic('x', 's18')}</button></div>`;
  const srcDetail = ctx => region(ctx, {
    what: 'This source', rows: 2, ok: () => srcTitle() + srcFig() + srcFacts() + srcUsed(),
    loading: () => srcTitle() + box(`${lbl('Reading the stored record · citation 3 stays')}<span class="sk" style="height:30px;width:40%;margin-top:10px"></span><span class="sk" style="height:48px;margin-top:10px"></span>`, soft) + skel(2),
    empty: () => srcTitle('Source 1 · Ledger') + stateCard('db', 'Calculated, not sourced', `This figure has no document behind it. Code works it out from the ledger: ${fig('£11,402.10')} of ${fig('£84,612.40')} is 13.5%.`, '', `<span class="chip">Formula v2 · 21:15</span>`),
    error: () => srcTitle() + stateCard('alert', 'This source did not open', 'The record failed to load at 21:14. Citation 3 stays in the answer with its hash and times.', bs('Try again', 'tinted', 'refresh')) + srcFacts({ chip: '<span class="chip error">Text not loaded</span>' }),
    stale: () => srcTitle() + banner('warn', 'A revision exists.', 'The publisher updated this item on 2 Nov. It is a new revision linked to this one, and this answer keeps the version it read.', 'clock') + srcFig() + srcFacts({ chip: `<span class="chip stale">${ic('clock', 's14')}Older revision</span>` }),
    offline: () => srcTitle() + banner('', 'Offline.', 'The citation and times are saved here. The summary loads when you reconnect.', 'wifi-off') + srcFacts(),
    disagreement: () => srcTitle('Sources disagree') + banner('', 'Two items differ.', 'The filing says 6%; a news item says 7%. Both are kept, and the answer quotes the filing, the primary record.', 'split') + srcFig() + srcFacts(),
    abstention: () => srcTitle('News item · not used') + `<div class="card state" data-mo="card" style="${soft}"><div class="sh"><span class="ic">${ic('shield', 's18')}</span>Held in quarantine</div><p>This item arrived at 06:12 and has not passed validation, so no tools touch it and Claude cannot quote it. Text in it reads as an instruction. That text is stored as data and changed nothing.</p><div class="foot"><span class="chip stale">Quarantined</span><span class="chip">Known at 06:12</span></div></div>` + kvCard()
  });
  const kvCard = () => box(`${lbl('What is recorded')}<div style="margin-top:8px">${kv([['Publisher', 'Unknown blog'], ['Rights', 'No record yet'], ['Content hash', 'c07d…91b2'], ['Used by', 'Nothing']])}</div>`, soft);

  /* ---------- memory notes (MP-115): seen, corrected, forgotten; never evidence ---------- */
  const chipFor = st => ({ Active: '<span class="chip fresh"><span class="dot"></span>Active</span>', Corrected: '<span class="chip">Corrected</span>', Tainted: `<span class="chip stale">${ic('alert', 's14')}Tainted</span>`, Expired: `<span class="chip illus">Expired</span>`, Hidden: `<span class="chip stale">${ic('clock', 's14')}Forgetting</span>` })[st];
  const NOTES = [
    ['person', 'Explain in 6-month terms first', 'Preference · from chat, 12 Oct', 'Active'],
    ['person', 'Keep answers short, detail on request', 'Preference · corrected by you, 2 Oct · v2', 'Corrected'],
    ['layers', 'NVIDIA guidance reviewed after the filing', 'Past research · Filing, 28 Oct', 'Active'],
    ['alert', 'Analyst note says chip demand is cooling', 'Built from an untrusted news item', 'Tainted'],
    ['clock', 'Compare India midcaps weekly', 'Preference · expired 1 Nov', 'Expired']
  ];
  const noteRows = (o = {}) => list((o.only ? NOTES.filter(o.only) : NOTES).map((n, i) => item(lead(n[0], n[3] === 'Tainted' ? 'warn' : ''), n[1], n[2], chipFor(o.state && o.state[n[1]] || n[3]), '', wide(o.ctx || {}) && n[3] === 'Tainted')).join(''));
  const memTop = () => banner('', 'Notes help Claude remember.', 'A note is never evidence for a figure and cannot change a setting. The ledger and your settings always win.', 'shield');
  const memBody = ctx => region(ctx, {
    what: 'Memory notes', rows: 4, ok: () => memTop() + noteRows({ ctx }),
    loading: () => memTop() + skel(4),
    empty: () => stateCard('layers', 'No notes yet', 'Claude can propose a note about how you like answers. Every note shows here first, and you can correct or forget it.', '', '<span class="chip">Production · only you</span>'),
    error: () => banner('fall', 'A forget did not finish.', 'A summary built from one note is still being cleared. The note stays hidden and is not used while MP retries.', 'alert') + noteRows({ ctx, state: { 'Compare India midcaps weekly': 'Hidden' } }),
    stale: () => banner('warn', 'One note has expired.', 'Expired notes are not used. Renew it, or leave it to clear.', 'clock') + noteRows({ ctx, only: n => n[3] === 'Expired' }) + sec('Still in use') + noteRows({ ctx, only: n => n[3] !== 'Expired' }),
    offline: () => banner('', 'Offline.', 'You can read your notes. Correct and forget wait until you reconnect, because they must clear every copy.', 'wifi-off') + noteRows({ ctx }),
    noModel: () => banner('', 'Claude is off this month.', 'No new notes are proposed. You can still read, correct and forget these.', 'ban') + noteRows({ ctx }),
    disagreement: () => banner('', 'A note disagrees with your ledger.', 'The ledger wins, and the note is left out until you correct or forget it.', 'split') + list(item(lead('split'), 'NVIDIA is under 10% of my portfolio', 'Note from chat, 3 Sep · ledger says 13.5% at 21:15', '<span class="chip">Left out</span>')) + sec('Other notes') + noteRows({ ctx, only: n => n[3] === 'Active' }),
    abstention: () => banner('', 'One note was left out of an answer.', 'It is tainted, so Claude did not use it as evidence and said so in the answer.', 'ban') + noteRows({ ctx, only: n => n[3] === 'Tainted' }) + sec('Other notes') + noteRows({ ctx, only: n => n[3] === 'Active' })
  });
  const noteDetail = ctx => {
    if (ctx.state === 'loading' || ctx.state === 'empty') return ctx.state === 'loading' ? skel(2) : '';
    const off = ctx.state === 'offline';
    return box(`${lbl('Note')}<p style="margin-top:4px;font:600 17px/22px var(--font-text);letter-spacing:-.01em">Analyst note says chip demand is cooling</p><div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 10px">${chipFor('Tainted')}<span class="chip">Version 1</span></div>${kv([['Scope', 'You · production'], ['Source', 'News item, 1 Nov'], ['Written by', 'Chat route'], ['Created', '1 Nov, 09:20'], ['Expires', '1 Feb 2027'], ['Taint', 'Carries to anything built from it']])}<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px"><button class="btn sm btn-tinted" type="button"${off ? ' disabled' : ''}>Correct</button><button class="btn sm btn-primary" type="button"${off ? ' disabled' : ''}>Forget</button></div><p class="small muted" style="margin-top:8px">Forgetting removes the note and anything built from it from future use. A tombstone records that it happened, and a restore never brings it back.</p>`);
  };

  /* ---------- a material risk alert (MP-138): one alert, held overnight, never an order ---------- */
  const alertCard = (ctx, o = {}) => box(`<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><span class="chip stale">${ic('alert', 's14')}Material</span><span class="chip">Investment risk</span>${illus()}</div>
    <p style="margin-top:10px;font:700 22px/28px var(--font-text);letter-spacing:-.015em;text-wrap:balance">US tech is 31.0% of the portfolio</p>
    <div class="calbar" role="img" aria-label="US tech 31.0% against your material line of 30%"><i data-mo="barx" style="width:62%;background:var(--warn)"></i><b style="left:60%"></b></div>
    <div class="small muted" style="display:flex;justify-content:space-between;margin-top:6px"><span>Now 31.0%</span><span>Your line 30%</span></div>
    <p style="margin-top:10px;font:400 15px/20px var(--font-text);letter-spacing:-.005em">${o.text || `Apple is ${fig('17.5%')} and NVIDIA ${fig('13.5%')} of the portfolio.${ref(1)} Code found this on eligible data as of 21:15.`}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">${bs('See the evidence')}${ctx.state === 'offline' ? '<button class="btn sm btn-tinted" type="button" disabled>Ask why</button>' : bs('Ask why', 'primary')}</div>
    <p class="small muted" style="margin-top:8px">Decision support. This alert acts on nothing.</p>`);
  const alertBody = ctx => region(ctx, {
    what: 'This alert', rows: 2, ok: () => alertCard(ctx),
    loading: () => box(`${lbl('Detected Tue 22:15 · loading its evidence')}<span class="sk" style="height:22px;width:80%;margin-top:10px"></span><span class="sk" style="height:8px;margin-top:12px"></span><span class="sk" style="height:40px;margin-top:12px"></span>`),
    empty: () => stateCard('shield', 'No risk alerts', 'No material risk found on eligible data as of 21:15, across 7 of 7 holdings. This says what was checked, not that nothing can go wrong.', '', fresh('Checked', 'fresh', '21:15')),
    error: () => stateCard('alert', 'Some checks could not run', 'Yahoo has been unavailable since 16:35, so AstraZeneca and HSBC were not checked. This is not an all-clear.', bs('See what was checked'), `<span class="chip error">Source unavailable</span>`) + alertCard(ctx),
    stale: () => banner('warn', 'Based on older data.', 'UK prices are from 16:35. The alert stands, labelled with that time, until prices return.', 'clock') + alertCard(ctx),
    offline: () => banner('', 'Offline.', 'This alert was saved at 08:02. Its evidence opens when you reconnect.', 'wifi-off') + alertCard(ctx),
    disagreement: () => banner('', 'Sources differ on the close.', 'On Yahoo\'s NVIDIA price US tech is 30.9%; on Twelve Data\'s it is 31.0%. Both are above your line.', 'split') + alertCard(ctx)
  });
  const LOG = [['Detected Tue 22:15', 'Daily run, on data as of 21:15'], ['Held by quiet hours', '22:00 to 07:00 London'], ['Arrived with the 07:30 brief', 'Push attempted, which is not proof you read it'], ['Opened Wed 08:02', 'In the app, and in the inbox on every device']];
  const alertLog = ctx => {
    const log = ctx.state === 'empty' ? '' : box(`${lbl('What happened')}<ol class="cl-steps" style="margin-top:8px;gap:8px">${LOG.map(([a, b]) => `<li class="cl-step" style="align-items:start">${TICK}<span><b style="font-weight:600;color:var(--ink)">${a}</b><br>${b}</span></li>`).join('')}</ol><p class="small muted" style="margin-top:8px">2 repeats were grouped into this one alert. Cooldown runs to Thu 07:30.</p>`);
    return `${log}${box(`${lbl('On the lock screen')}<p style="margin-top:4px;font:600 15px/20px var(--font-text);letter-spacing:-.01em">MyPrediction: you have a new notice</p><p class="small muted" style="margin-top:2px">No value and no holding, ever.</p>`)}`;
  };

  /* ---------- Option B: the same evidence, posted into one running thread ---------- */
  const post = (who, when, inner, label) => `<article class="card fcard" data-mo="card" aria-label="${label || who}"><header style="display:flex;align-items:center;gap:8px"><span class="brand-mark" style="width:22px;height:22px;border-radius:7px" aria-hidden="true"></span><span style="font:600 15px/20px var(--font-text);letter-spacing:-.01em">${who}</span><span class="small muted" style="margin-left:auto">${when}</span></header>${inner}</article>`;
  const dayline = t => `<div class="label" style="text-align:center;padding:2px 0" data-mo="fade">${t}</div>`;
  const quick = (...t) => `<div class="cl-opts" data-mo="fade">${t.map(x => `<button class="cl-opt" type="button" style="background:var(--surface);box-shadow:var(--shadow-1)">${x}</button>`).join('')}</div>`;
  const miniAct = (t, a) => `<span class="badge b-${a.toLowerCase()}">${ic({ Add: 'plus', Trim: 'trim', Pause: 'pause' }[a], 's16')}${t} · ${a}</span>`;
  const threadBrief = (ctx, o = {}) => post('MyPrediction', o.when || 'Daily brief · 07:30', `<p style="margin-top:8px;font:700 20px/25px var(--font-text);letter-spacing:-.01em;text-wrap:balance">${o.title || 'Four ranked actions and one risk held overnight.'}</p>
    <div style="margin-top:10px">${lbl('Actions · decision support')}<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">${o.acts || miniAct('NVDA', 'Trim') + miniAct('SPY', 'Add') + miniAct('RELIANCE', 'Add') + miniAct('HSBA', 'Pause')}</div></div>
    <div style="margin-top:10px">${lbl('Risks')}<p class="small" style="margin-top:2px">US tech is 31.0% of the portfolio, above your 30% line.</p></div>
    <div style="margin-top:10px">${lbl('Changes')}<p class="small" style="margin-top:2px">Up £1,236.18 (1.48%) on Tuesday. HSBC last priced 16:35.</p></div>
    <div style="margin-top:10px">${lbl('Coming up')}<p class="small" style="margin-top:2px">Thu 5 Nov Bank of England. Wed 18 Nov NVIDIA results.</p></div>
    <p class="small muted" style="margin-top:10px">Last closes: India Tue 10:00, UK Tue 16:35, US Tue 21:00, London time. Illustrative.</p>${o.foot || ''}`, 'Daily brief');
  const threadRisk = () => post('MyPrediction', 'Risk alert · with the brief', `<p style="margin-top:6px;font:600 15px/20px var(--font-text);letter-spacing:-.01em">US tech reached 31.0%, above your 30% line.</p><p class="small muted" style="margin-top:2px">Detected Tue 22:15, held by quiet hours. Investment risk, not an incident. It acts on nothing.</p>`, 'Risk alert');
  const todayBody = ctx => {
    const opener = quick('Why is NVIDIA ranked Trim?', 'Bull and bear', 'What changed?');
    return dayline('Wed 4 Nov') + region(ctx, {
      what: 'Today\'s thread', rows: 3, ok: () => threadBrief(ctx) + threadRisk() + opener,
      loading: () => post('MyPrediction', 'Loading today', `<span class="sk" style="height:20px;width:84%;margin-top:10px"></span><span class="sk" style="height:14px;width:62%;margin-top:8px"></span><p class="small muted" style="margin-top:8px">Tuesday's thread stays readable above.</p>`, 'Loading') + skel(2),
      empty: () => stateCard('clock', 'Nothing in today\'s thread yet', 'The brief is the first post, at 07:30 London. Ask anything before then and it starts the thread.', bs('Read Tuesday\'s thread'), '<span class="chip">Scheduled · 07:30 London</span>'),
      error: () => banner('warn', 'Late.', 'MP was down at 07:30. The brief was posted on recovery at 08:12, once.', 'clock') + threadBrief(ctx, { when: 'Daily brief · late, 08:12' }) + threadRisk(),
      stale: () => banner('warn', 'Some evidence is pending.', 'Yahoo has been delayed since 16:35. The brief quotes the last valid evidence, dated.', 'clock') + threadBrief(ctx, { title: 'Three ranked actions, one paused, one risk held overnight.' }) + threadRisk(),
      offline: () => banner('', 'Offline.', 'The thread is saved up to 08:02. New questions wait until you reconnect.', 'wifi-off') + threadBrief(ctx) + threadRisk(),
      noModel: () => banner('', 'Claude is off this month.', 'The brief was posted from a template and is labelled so. The thread takes no questions until the hold lifts.', 'ban') + threadBrief(ctx, { when: 'Template brief · 07:30' }),
      disagreement: () => banner('', 'Models disagree on Reliance.', 'No action is ranked for it.', 'split') + threadBrief(ctx, { title: 'Three ranked actions and one risk held overnight.', acts: miniAct('NVDA', 'Trim') + miniAct('SPY', 'Add') + miniAct('HSBA', 'Pause') + `<span class="chip">${ic('split', 's14')}RELIANCE · not ranked</span>` }) + threadRisk(),
      abstention: () => banner('', 'One model abstained.', 'AstraZeneca has no 12-month range this morning.', 'ban') + threadBrief(ctx, { acts: miniAct('NVDA', 'Trim') + miniAct('SPY', 'Add') + miniAct('RELIANCE', 'Add') + miniAct('HSBA', 'Pause') + `<span class="chip">${ic('ban', 's14')}AZN · abstained</span>` }) + threadRisk()
    });
  };
  const pinned = ctx => `${box(`${lbl('Pinned · last closes')}${markets()}`)}${box(`${lbl('Pinned · coming up')}<div style="margin-top:8px">${kv([['Thu 5 Nov', 'Bank of England'], ['Wed 18 Nov', 'NVIDIA results'], ['Fri 4 Dec', 'RBI']])}</div>`)}${list(item(lead('layers'), 'Notes Claude holds', '5 notes · 1 tainted', ic('chev-r', 's18')))}${askCard(ctx, 'Add to today\'s thread')}`;
  const threadCard = ctx => {
    const q = ask('Show the bull and bear case for NVIDIA');
    return region(ctx, {
      what: 'The research card', rows: 3, ok: () => q + bullBear(ctx) + quick('Overlap', 'Valuation', 'Earnings', 'Scenario'),
      loading: () => q + post('MyPrediction', 'Building from stored inputs', `<span class="sk" style="height:64px;margin-top:10px"></span><p class="small muted" style="margin-top:8px">Last good version 21:15.</p>`, 'Loading'),
      empty: () => q + stateCard('grid', 'No research card yet', 'Cards build after a listing\'s first close with MP. Prices and the forecast already show.', bs('Open the forecast')),
      error: () => q + stateCard('alert', 'The card did not build', 'It failed at 21:14. No model fills the gap: it rebuilds from stored inputs when you ask again.', bs('Try again', 'tinted', 'refresh')),
      stale: () => q + banner('warn', 'Superseded.', 'Version 4 is ready. Version 3 stays in the thread because it was cited.', 'clock') + bullBear(ctx, { chip: '<span class="chip stale">Version 3 · superseded</span>' }),
      offline: () => banner('', 'Offline.', 'Showing the card saved at 21:15.', 'wifi-off') + q + bullBear(ctx),
      noModel: () => q + bullBear(ctx, { bull: [BULL[0]], bear: [BEAR[1]], adj: `No approved model for 12 months yet, so forecast arguments are left out.${ref(1)}` }),
      disagreement: () => q + banner('', 'Models disagree.', 'No action is ranked at 3 months.', 'split') + bullBear(ctx, { adj: `The models disagree on direction, so this card does not settle it.${ref(2)}` }),
      abstention: () => q + bullBear(ctx, { bull: [BULL[0]], bear: [BEAR[1]], adj: 'No adjudication this time: the cited evidence is too thin to weigh.' })
    });
  };
  const threadAlert = ctx => dayline('Wed 4 Nov · 07:30') + alertBody(ctx);

  J.add({
    id: 'research', title: 'Research',
    stories: ['MP-127', 'MP-129', 'MP-125', 'MP-148', 'MP-138', 'MP-115', 'MP-81'],
    summary: 'The 07:30 brief, the evidence for and against, and a cited answer to why. Code keeps the numbers; Claude explains them.',
    options: [{
      id: 'a', name: 'Brief first', rec: true,
      why: 'The brief opens the day and every item leads to its evidence, so you read what code found before you ask anything. It keeps working when Claude is off, and reading stored answers first keeps chat, the largest Claude cost, low.',
      cost: 'Asking why is one step from the brief, and each question starts beside its listing rather than in one running conversation.',
      screens: [{
        id: 'ra-brief', title: 'Daily brief', note: 'Error shows a late brief; No model shows the labelled template when Claude is off.',
        render: ctx => frame(ctx, { tab: 0, back: 'Portfolio', title: 'Daily brief', actions: info('About this brief'), body: briefBody(ctx), rail: briefRail(ctx) + pad(ctx), accessory: ctx.state === 'loading' || ctx.state === 'empty' ? '' : askBar(ctx, 'Ask about this brief') })
      }, {
        id: 'ra-card', title: 'Research card', note: 'At most two arguments a side. The adjudication never gives a probability or an instruction.',
        render: ctx => frame(ctx, { tab: 1, back: 'Brief', title: 'NVIDIA', actions: info('About these cards'), body: cardBody(ctx), rail: cardRail(ctx) + pad(ctx), accessory: askBar(ctx, 'Ask about NVIDIA') })
      }, {
        id: 'ra-ask', title: 'Ask why', note: 'Ready shows Claude writing. Loading shows a stopped turn, asked again. Abstaining shows a refusal and no cited answer. No model shows Claude off. Error shows a failed tool.',
        render: ctx => frame(ctx, { tab: 1, back: 'NVIDIA', title: 'Ask why', actions: info('What Claude may read'), body: askThread(ctx) + askCard(ctx, 'Ask a follow-up') + pad(ctx), rail: wide(ctx) ? askRail(ctx) : '', accessory: askBar(ctx, 'Ask a follow-up') })
      }, {
        id: 'ra-source', title: 'Source opened', note: 'A citation opens beside the answer on iPad and desktop, and as a sheet on a phone. Abstaining shows a quarantined item; Disagreement shows two sources that differ.',
        na: { noModel: 'A stored source is a document, not a forecast, so no model is involved in opening it.' },
        render: ctx => {
          const detail = srcDetail(ctx);
          return frame(ctx, { tab: 1, back: 'NVIDIA', title: 'Ask why', body: ask(WHY_Q) + answered(), rail: wide(ctx) ? detail : '', sheet: wide(ctx) ? '' : `<div class="sheet" role="dialog" aria-modal="true" aria-label="Source" data-mo="sheet" style="max-height:70%"><div class="grabber"></div><div style="display:grid;gap:10px">${detail}</div></div>` });
        }
      }, {
        id: 'ra-memory', title: 'Memory notes', note: 'Reached from Settings. Disagreement shows a note against the ledger; the ledger wins.',
        render: ctx => frame(ctx, { tab: wide(ctx) ? 5 : 4, back: 'Settings', title: 'Memory notes', body: memBody(ctx), rail: noteDetail(ctx) })
      }, {
        id: 'ra-alert', title: 'Risk alert', note: 'The line is illustrative: the owner approves the material and critical thresholds. Empty never reads as an all-clear.',
        na: { noModel: 'This alert is worked out from the ledger and prices, so no forecast is on it.', abstention: 'A risk alert is a rule run by code, so no model can abstain on it.' },
        render: ctx => frame(ctx, { tab: 0, back: 'Brief', title: 'Risk alert', body: alertBody(ctx), rail: alertLog(ctx) })
      }]
    }, {
      id: 'b', name: 'One thread',
      why: 'The day runs as one conversation: the brief, alerts, cards and answers all arrive in it, so there is one place to scroll and follow-ups keep their context.',
      cost: 'The thread leans on Claude: when it is off or the daily cap is reached, the place you live in stops answering. Evidence sits further from its listing, chat use rises, and a busy day is a long scroll.',
      screens: [{
        id: 'rb-today', title: 'Today', note: 'The brief is the first post of the day. On iPad and desktop the rail pins what should not scroll away.',
        render: ctx => frame(ctx, { tab: 0, title: 'Today', actions: tb('search', 'Search the thread') + tb('layers', 'Notes Claude holds'), body: todayBody(ctx) + pad(ctx), rail: wide(ctx) ? pinned(ctx) : '', accessory: askBar(ctx, 'Add to today\'s thread') })
      }, {
        id: 'rb-card', title: 'Card in the thread', note: 'Cards arrive as posts, one at a time, when asked for.',
        render: ctx => frame(ctx, { tab: 0, back: 'Today', title: 'NVIDIA', body: threadCard(ctx) + pad(ctx), rail: wide(ctx) ? (ctx.state === 'loading' || ctx.state === 'empty' ? skel(2) : minis() + askCard(ctx, 'Add to today\'s thread')) : '', accessory: askBar(ctx, 'Add to today\'s thread') })
      }, {
        id: 'rb-ask', title: 'Ask why', note: 'The same answer, inside the day\'s thread. Loading shows a stopped turn; Abstaining shows a refusal and no cited answer; No model shows Claude off.',
        render: ctx => frame(ctx, { tab: 0, back: 'Today', title: 'Today', body: dayline('Brief · 07:30 · Risk alert · Bull and bear') + askThread(ctx) + pad(ctx), rail: wide(ctx) ? pinned(ctx) : '', accessory: askBar(ctx, 'Add to today\'s thread') })
      }, {
        id: 'rb-source', title: 'Source opened', note: 'A citation opens in place under the answer on a phone, and in the rail on iPad and desktop.',
        na: { noModel: 'A stored source is a document, not a forecast, so no model is involved in opening it.' },
        render: ctx => frame(ctx, { tab: 0, back: 'Today', title: 'Today', body: ask(WHY_Q) + answered() + (wide(ctx) ? '' : srcDetail(ctx)), rail: wide(ctx) ? srcDetail(ctx) : '' })
      }, {
        id: 'rb-memory', title: 'Memory in the thread', note: 'You ask what Claude holds, and the notes come back as a post you can correct or forget.',
        render: ctx => frame(ctx, { tab: 0, back: 'Today', title: 'Today', body: ask('What do you remember about me?') + memBody(ctx), rail: noteDetail(ctx) })
      }, {
        id: 'rb-alert', title: 'Risk alert', note: 'Posted with the brief, then expanded in place. The line is illustrative: the owner approves the thresholds.',
        na: { noModel: 'This alert is worked out from the ledger and prices, so no forecast is on it.', abstention: 'A risk alert is a rule run by code, so no model can abstain on it.' },
        render: ctx => frame(ctx, { tab: 0, back: 'Today', title: 'Today', body: threadAlert(ctx), rail: alertLog(ctx) })
      }]
    }]
  });
}
