/* Journal: what you decided and did elsewhere, against the exact evidence you saw, joined to what happened (MP-62).
   MP never places a trade, and an entry never changes a holding. A block, so these helpers stay private to this journey. */
{
  const phone = ctx => ctx.kind === 'iphone' || ctx.kind === 'pwa';
  const acts = (...b) => `<div class="journal-acts">${b.filter(Boolean).join('')}</div>`;
  const chipMark = (mark, t, c = '') => `<span class="chip${c ? ' ' + c : ''}" data-mo="chip">${mark}${t}</span>`;
  const support = `<span class="chip illus" data-mo="chip">Decision support</span>`;
  const waiting = t => chipMark(ic('clock', 's14'), t);
  const differed = chipMark(ic('split', 's14'), 'Differed');

  /* the journal: seven illustrative entries, today being 3 Nov 2026. 'st' is the outcome state from MP-130 and MP-154 */
  const D = {
    fresh: { h: byT.NVDA, on: 'Today', hz: '6 months', ranked: 'Trim', you: 'You chose not to', differ: true, st: 'wait', left: 'Due 3 May', line: 'Nothing is scored before 3 May 2027.' },
    spy: { h: byT.SPY, on: '21 Aug 2026', hz: '3 months', ranked: 'Add', you: 'You added 6 units', st: 'wait', left: '18 days', line: 'Outcome due 21 Nov 2026.' },
    rel: { h: byT.RELIANCE, on: '2 Jun 2026', hz: '3 months', ranked: 'Add', you: 'You chose not to', differ: true, st: 'in', line: 'Rose 5.1%, inside its 80% range.' },
    aapl: { h: byT.AAPL, on: '12 May 2026', hz: '6 months', ranked: 'Hold', you: 'You held', st: 'wait', left: '9 days', line: 'Outcome due 12 Nov 2026.' },
    nvda: { h: byT.NVDA, on: '28 Apr 2026', hz: '6 months', ranked: 'Trim', you: 'You chose not to', differ: true, st: 'in', line: 'Rose 12.4%, inside its 80% range.' },
    hsba: { h: byT.HSBA, on: '14 Apr 2026', hz: '6 months', ranked: 'Pause', you: 'You paused new money', st: 'open', line: 'A dividend is disputed, so nothing is scored yet. It is never a zero.' },
    azn: { h: byT.AZN, on: '3 Mar 2026', hz: '6 months', ranked: 'Hold', you: 'You added 5 units', differ: true, st: 'out', line: 'Fell 11.6%, outside its 80% range.' }
  };
  const ALL = ['fresh', 'spy', 'rel', 'aapl', 'nvda', 'hsba', 'azn'];
  const status = d => ({
    wait: waiting(d.left),
    in: chipMark('<i class="lg-sc" aria-hidden="true"></i>', 'Scored'),
    out: chipMark('<i class="lg-miss" aria-hidden="true"></i>', 'Scored'),
    open: `<span class="chip partial" data-mo="chip"><span class="dot"></span>Unresolved</span>`
  }[d.st]);
  const entry = (k, o = {}) => {
    const d = D[k], mark = (o.marks && o.marks[k]) || status(d);
    return `<div class="journal-e${o.lane ? ' lane' : ''}" data-mo="rise">${logo(d.h.c, d.h.lg, o.lane)}<div class="m"><b>${d.h.n}</b><span>${d.on} · ${d.hz}</span></div>${o.lane ? '' : `<div>${mark}</div>`}
      <div class="l">${badge(d.ranked)}<span>${d.you}</span>${d.differ && !o.noDiffer ? differed : ''}</div><div class="o">${(o.over && o.over[k]) || d.line}</div>${o.lane ? `<div class="o">${mark}</div>` : ''}</div>`;
  };
  const listCard = (keys, o = {}) => `<div class="card" style="padding:2px 0" data-mo="card">${o.head || ''}${keys.map(k => entry(k, o)).join('')}</div>`;
  const wrapUp = (o = {}) => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('clock', 's18')}</span><span style="flex:1;min-width:0">This week</span>${illus()}</div><p>${o.t || '1 entry recorded. 1 outcome matured last week: NVIDIA, inside its range. Next outcome: Apple, 12 Nov.'}</p></div>`;
  const tally = (n = 4) => `<div class="journal-ba"><div data-mo="card"><span class="k">You followed</span><span class="v">${roll('3')}</span><span class="n">0 scored · 2 waiting · 1 unresolved</span></div><div data-mo="card"><span class="k">You differed</span><span class="v">${roll(String(n))}</span><span class="n">3 scored${n > 3 ? ' · 1 waiting' : ''}</span></div></div>`;
  const tooFew = `<p class="small muted">Too few scored decisions to show a rate. A scored outcome grades the forecast, not you.</p>`;
  const sideCard = () => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('split', 's18')}</span><span style="flex:1;min-width:0">You and the ranking</span></div><p>You differed from the ranked action 4 times in 7 decisions. 3 have scored so far, too few to show a rate.</p>${chipMark(ic('chev-r', 's14'), 'See where you differed')}</div>`;
  const never = `<p class="small muted">Saved with the action, evidence and policy version you saw. No trade is placed and your holdings do not change.</p>`;

  /* ---------- a ranked action, with its reasons, uncertainty, impact and horizon (MP-144) ---------- */
  const reasons = (h) => `<ul class="journal-why">
    <li>${ic('fan', 's16')}<div>Widest range of your 7 holdings. <span>R2-HGB v3</span></div></li>
    <li>${ic('layers', 's16')}<div>13.5% of your portfolio. <span>Ledger revision 212</span></div></li>
    <li>${ic('shield', 's16')}<div>Protection trails growth and opportunity. <span>Ranking policy P-3, proposed</span></div></li></ul>`;
  const components = () => `<div class="journal-comp" role="img" aria-label="Score 71 of 100: growth 87, protection 52, opportunity 78">${[['Growth', 87], ['Protection', 52], ['Opportunity', 78]].map(([k, v]) => `<div><span>${k}</span><b>${roll(String(v))}</b></div>`).join('')}</div>`;
  const impact = () => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('layers', 's18')}</span>If you trimmed to the ranked weight</div>
    <div class="journal-kv"><span>NVIDIA in your portfolio</span><b>13.5% → 10.0%</b><span>Portfolio downside, 80% range, 6 months</span><b>−9.4% → −8.7%</b></div><p>Computed by code, for illustration. It assumes no tax rule and no costs, and it moves nothing.</p></div>`;
  const actionCard = (h, ctx) => `<div class="card fcard" style="display:grid;gap:10px" data-mo="card"><div class="journal-bar">${badge('Trim')}<div class="w"><b>Ranked action</b>${h.n} · 6 months</div>${support}</div>
    ${reasons(h)}${components()}<div>${range(h)}</div><div class="rng" style="margin-top:0"><span>Median</span><b>${pct(h.med)}</b><span>80% range</span><b>${pct(h.lo)} to ${pct(h.hi)}</b></div>${fcMeta()}</div>`;
  const whyText = 'Long-term position. I accept the wider range for now.';
  const held = (title, text, icon = 'ban') => stateCard(icon, title, text);
  const sheetTop = (t = 'Record your decision') => `<div class="grabber"></div><div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><h4 id="journal-rec">${t}</h4><button class="iconbtn sm" type="button" aria-label="Close">${ic('x', 's16')}</button></div>`;
  const sheetSolid = (h, l, s) => `<div class="card" style="margin-top:12px;padding:12px 14px;display:flex;gap:10px;align-items:center" data-mo="card">${logo(h.c, h.lg)}<div style="flex:1;min-width:0"><div style="font:600 15px/20px var(--font-text);letter-spacing:-.01em">${l}</div><div class="small muted">${s}</div></div></div>`;
  const choose = (on = 1) => `<div style="margin-top:12px">${seg(['I acted', 'I chose not to'], on, 'What you did', 'lg full')}</div>`;
  const sheetWhy = (t = whyText) => `<div style="margin-top:10px;display:grid;gap:6px"><span class="label">Why, in your words</span><div class="journal-field" role="textbox" aria-label="Why">${t}</div></div>`;
  const sheetFoot = (right) => `<div style="margin-top:10px">${never}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">${btn('Not now', 'tinted sm')}${right}</div>`;
  const pickState = st => ({ stale: byT.HSBA, disagreement: byT.RELIANCE, abstention: byT.AZN }[st] || byT.NVDA);
  const pastOn = st => {
    const k = st === 'abstention' ? 'azn' : 'nvda', h = D[k].h;
    return listCard([k], { head: `<div class="journal-head"><h3>Your entries on ${h.n}</h3></div>` });
  };
  const recordBody = (ctx) => {
    const st = ctx.state, h = pickState(st);
    if (st === 'loading') return actionCard(h, ctx).replace('Ranked action', 'Ranked action · last good 21:15');
    if (st === 'empty') return `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('sliders', 's18')}</span>No action label yet</div><p>The thresholds that turn a score into an action are not approved, so this shows its evidence and no label. A guessed action is worse than none. There is nothing to record against yet.</p>${components()}<p>Score 71 · growth 35%, protection 40%, opportunity 25%. Illustrative.</p></div>`;
    if (st === 'noModel') return held('No approved model', 'No approved model covers NVIDIA now, so no action is ranked and there is nothing to record against. Your earlier entries keep what they cited.', 'cube');
    if (st === 'abstention') return held('The model abstained on AstraZeneca', 'Too little comparable history for a calibrated range, so no action is ranked. There is nothing to record against until it can be ranked.');
    if (st === 'disagreement') return `<div class="card fcard" style="display:grid;gap:10px" data-mo="card"><div class="journal-bar"><div class="w"><b>No action ranked</b>Reliance · 3 months</div>${chipMark(ic('split', 's14'), 'Rules and models differ')}</div><p class="small muted">The rules say Add and R2-HGB v3 leans the other way. Both show, and neither is picked for you.</p>${fcMeta().replace('Horizon 3 May 2027', 'Horizon 3 Feb 2027')}</div>`;
    if (st === 'stale') return banner('warn', 'This action is stale.', 'HSBC last priced 16:35, so its action holds at Pause until the next ranking run.', 'clock') + `<div class="card fcard" style="display:grid;gap:10px" data-mo="card"><div class="journal-bar">${badge('Pause')}<div class="w"><b>Ranked action, stale</b>HSBC · 6 months</div>${support}</div><p class="small muted">Your entry will record that the action was stale when you decided.</p>${fcMeta()}</div>`;
    return actionCard(h, ctx);
  };
  const recordSheet = (ctx) => {
    const st = ctx.state, h = pickState(st), wrap = inner => `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="journal-rec" data-mo="sheet">${inner}</div>`;
    const nv = sheetSolid(h, 'NVIDIA · Trim', '6 months · median +9.1% · 80% range −18.5% to +34.0% · illustrative');
    const go = btn('Record decision', 'primary sm');
    switch (st) {
      case 'empty': case 'noModel': case 'abstention': return '';
      case 'loading': return wrap(sheetTop('Saving your decision') + nv + choose() + sheetWhy() + sheetFoot(`<button class="btn sm btn-tinted" type="button" disabled><span class="spin" aria-hidden="true"></span>Saving</button>`));
      case 'error': return wrap(sheetTop('Not saved yet') + `<div style="margin-top:10px">${banner('fall', 'That did not save.', 'Your draft is kept. Trying again cannot save it twice.', 'alert')}</div>` + nv + sheetWhy() + sheetFoot(btn('Try again', 'primary sm', 'refresh')));
      case 'offline': return wrap(sheetTop() + `<div style="margin-top:10px">${banner('', 'Offline.', 'Your draft stays here and saves when you reconnect.', 'wifi-off')}</div>` + nv + choose() + sheetWhy() + sheetFoot(btn('Keep draft', 'primary sm')));
      case 'stale': return wrap(sheetTop() + sheetSolid(h, 'HSBC · Pause, stale', '6 months · last price 16:35 · illustrative') + choose(0) + sheetWhy('Paused new money until prices return.') + sheetFoot(go));
      case 'disagreement': return wrap(sheetTop() + sheetSolid(h, 'Reliance · No action ranked', '3 months · rules and models differ · illustrative') + choose(0) + sheetWhy('Added 10 units on the rules.') + sheetFoot(go));
      default: return wrap(sheetTop() + nv + choose() + sheetWhy() + sheetFoot(go));
    }
  };

  /* ---------- what was scored: the range you saw, and where the outcome landed ---------- */
  const landed = (t, out, o = {}) => {
    const w = o.w || 326, ht = 74, min = -25, max = 40, x = v => 10 + ((v - min) / (max - min)) * (w - 20), y0 = 30, y1 = 48, inside = out >= t.lo && out <= t.hi;
    return `<svg class="cx" viewBox="0 0 ${w} ${ht}" width="100%" role="img" aria-label="Forecast of ${t.when}: median ${pct(t.med)}, 80% range ${pct(t.lo)} to ${pct(t.hi)}. Outcome ${pct(out)}, ${inside ? 'inside' : 'outside'} the range. Illustrative.">
      <rect x="10" y="38" width="${w - 20}" height="2" rx="1" style="fill:var(--surface-3)"/><rect class="b80" x="${x(t.lo)}" y="${y0}" width="${x(t.hi) - x(t.lo)}" height="${y1 - y0}" rx="6"/><rect class="b50" x="${x(t.lo50)}" y="${y0 + 3}" width="${x(t.hi50) - x(t.lo50)}" height="${y1 - y0 - 6}" rx="4"/>
      <rect x="${x(0) - .5}" y="${y0 - 6}" width="1" height="${y1 - y0 + 12}" style="fill:var(--ink-2)"/><rect x="${x(t.med) - 1.25}" y="${y0 - 2}" width="2.5" height="${y1 - y0 + 4}" rx="1.25" style="fill:var(--fc-line)"/>
      <g data-mo="dot"><circle class="scd" cx="${x(out)}" cy="39" r="5"/><circle class="scr-ring" cx="${x(out)}" cy="39" r="8"/></g>
      <g data-mo="label"><text class="scl" x="${x(out)}" y="20" text-anchor="middle">Outcome ${pct(out)}</text><text x="${x(t.lo)}" y="66" text-anchor="start">${pct(t.lo)}</text><text x="${x(t.hi)}" y="66" text-anchor="end">${pct(t.hi)}</text></g></svg>`;
  };
  const then = { med: 7.8, lo: -16.2, hi: 30.1, lo50: -4.8, hi50: 19.5, when: '28 April' };
  const scoreLines = () => `<div class="journal-kv"><span>80% range</span><b>Held</b><span>Direction</span><b>As forecast</b><span>Error against the median</span><b>4.6 points</b></div>`;
  const legendNow = () => `<div class="legend"><span><i class="lg-50"></i>50% range</span><span><i class="lg-80"></i>80% range</span><span><i class="lg-med"></i>Median</span><span><i class="lg-sc"></i>Outcome</span></div>`;
  const outcomeCard = (ctx, o = {}) => `<div class="card fcard" data-mo="card"><div class="journal-bar"><div class="w"><b>${o.t || 'Scored on 28 Oct 2026'}</b>${o.s || 'Horizon passed, every input in'}</div>${chipMark('<i class="lg-sc" aria-hidden="true"></i>', o.c || 'Inside its range')}</div>
    <div style="margin-top:6px">${landed(then, o.out ?? 12.4, { w: ctx.kind === 'web' ? 460 : 326 })}</div>${legendNow()}<div style="margin-top:10px">${o.lines || scoreLines()}</div></div>`;
  /* the decision a state is about: the empty state is one still waiting, the abstaining one had no range or action to differ from */
  const seen = st => st === 'empty'
    ? { title: 'Apple · 12 May', on: '12 May', year: '12 May 2026', differ: false, act: 'Hold', rows: [['6-month median', '+5.4%'], ['80% range', '−8.9% to +19.7%']], model: 'R2-HGB v3', policy: 'P-2', cut: '12 May 21:00', said: 'I acted. Held all 88 units. Nothing in the range changed my view.' }
    : st === 'abstention'
      ? { title: 'NVIDIA · 28 Apr', on: '28 Apr', year: '28 Apr 2026', differ: false, act: '', rows: [['Ranked action', 'None'], ['Forecast', 'Abstained, no range']], model: 'R2-HGB v3', policy: 'P-2', cut: '28 Apr 21:00', said: `Kept all 60 units. ${whyText}` }
      : { title: 'NVIDIA · 28 Apr', on: '28 Apr', year: '28 Apr 2026', differ: true, act: 'Trim', rows: [['6-month median', pct(then.med)], ['80% range', `${pct(then.lo)} to ${pct(then.hi)}`]], model: 'R2-HGB v3', policy: 'P-2', cut: '28 Apr 21:00', said: `I chose not to. Kept all 60 units. ${whyText}` };
  const kvs = s => `<div class="journal-kv">${s.rows.map(([k, v]) => `<span>${k}</span><b>${v}</b>`).join('')}<span>Model</span><b>${s.model}</b><span>Ranking policy</span><b>${s.policy}</b><span>Data cutoff</span><b>${s.cut}</b></div>`;
  const frozen = s => `<div class="card state" data-mo="card"><div class="journal-bar"><div class="w"><b>What you saw on ${s.on}</b>Frozen. It never changes.</div>${chipMark(ic('lock', 's14'), 'Exact')}</div>${s.act ? `<div>${badge(s.act)}</div>` : ''}${kvs(s)}</div>`;
  const yourEntry = s => `<div class="card state" data-mo="card"><div class="journal-bar"><div class="w"><b>What you recorded</b>${s.year} · saved, append-only</div>${s.differ ? differed : ''}</div><p style="color:var(--ink)">${s.said}</p>${acts(btn('Add a correction', 'tinted sm'))}<p>A correction is a new entry linked to this one. This one stays.</p></div>`;
  const whatHappened = st => `<div class="card state" style="height:100%" data-mo="card"><div class="journal-bar"><div class="w"><b>What happened</b>Horizon passed 28 Oct 2026</div></div><p style="color:var(--ink)">NVIDIA rose ${st === 'disagreement' ? '11.9%' : '12.4%'} in the 6 months. You stayed at 12.9% of the portfolio; the ranked trim would have taken it to 10.0%.</p><p>One outcome says little about a decision.</p></div>`;
  const pendingOutcome = () => stateCard('clock', 'Outcome due 12 Nov 2026', 'Apple, Hold, recorded 12 May. Nothing is scored before its horizon passes, so this has no score yet.', '', waiting('9 days'));
  const oneBody = (ctx, o = {}) => {
    const st = ctx.state;
    return region(ctx, {
      ok: () => outcomeCard(ctx),
      loading: () => stateCard('clock', 'Joining the outcome', 'Your entry and what you saw are safe. The outcome is being joined to them.') + skel(1),
      empty: () => pendingOutcome(),
      error: () => stateCard('alert', 'The score did not arrive', 'The scoring job failed at 21:14. It reruns by itself and cannot write twice. Your entry is safe.', btn('Check again', 'tinted sm', 'refresh')),
      stale: () => stateCard('clock', 'Horizon passed, one input missing', 'The final FX rate has not arrived, so this outcome is not known yet. A missing input is never scored as a zero return. It moves the date the outcome becomes known, not the horizon.', '', waiting('Waiting on FX')),
      offline: () => banner('', 'Offline.', 'Showing this entry and its score from 21:15.', 'wifi-off') + outcomeCard(ctx),
      noModel: () => banner('', 'This model is no longer approved.', 'The score stands against the version you saw. Later models never rewrite it.', 'cube') + outcomeCard(ctx),
      disagreement: () => outcomeCard(ctx, { t: 'Amended on 30 Oct 2026', s: 'A corrected close replaced the first one', c: 'Inside its range', out: 11.9, lines: `<div class="journal-kv"><span>First outcome</span><b>+12.4%, kept</b><span>Corrected outcome</span><b>+11.9%, current</b><span>Error against the median</span><b>4.1 points</b></div>` }),
      abstention: () => stateCard('ban', 'No range to score', 'The model abstained that day, so there was no calibrated range. What you did and what happened stay on record, unscored.', '', chipMark(ic('ban', 's14'), 'Abstained · no range shown'))
    });
  };
  const naDiffer = { noModel: 'This view reads past entries and matured outcomes. A model missing today changes none of them.' };

  /* ---------- Option B: three lanes ---------- */
  const toDecide = (t, ctx) => {
    const h = byT[t], split = ctx.state === 'disagreement' && t === 'RELIANCE';
    return `<div class="journal-e lane" data-mo="rise">${logo(h.c, h.lg, true)}<div class="m"><b>${h.n}</b><span>Ranked today · ${split ? '3 months' : '6 months'}</span></div><div class="l">${split ? chipMark(ic('split', 's14'), 'No action ranked') : `${badge(h.act)}${support}`}</div><div class="o">${split ? 'Rules and models differ. Both show on the next page.' : `${pct(h.lo)} to ${pct(h.hi)}, 80% range · median ${pct(h.med)}`}</div></div>`;
  };
  const lane = (t, n, items) => `<section class="journal-lane"><h3>${t}<span>${n}</span></h3><div class="card" style="padding:2px 0" data-mo="card">${items}</div></section>`;
  const laneA = ctx => ctx.state === 'noModel' ? `<div class="journal-e lane"><div class="o" style="grid-column:1/3">Nothing to decide until a model is approved.</div></div>` : toDecide('NVDA', ctx) + toDecide('RELIANCE', ctx);
  const laneB = () => ['aapl', 'spy', 'hsba'].map(k => entry(k, { lane: true })).join('');
  const laneC = () => ['nvda', 'rel', 'azn'].map(k => entry(k, { lane: true })).join('');
  const boardOk = (ctx, o = {}) => phone(ctx)
    ? `<div data-mo="rise">${seg([`To decide ${ctx.state === 'noModel' ? 0 : 2}`, 'Waiting 3', 'Scored 3'], o.on ?? 0, 'Lane', 'full')}</div>` + `<div class="card" style="padding:2px 0" data-mo="card">${[laneA, laneB, laneC][o.on ?? 0](ctx)}</div>`
    : `<div class="journal-lanes">${lane('To decide', ctx.state === 'noModel' ? 'None ranked' : '2 ranked', laneA(ctx))}${lane('Waiting', '2 for a horizon, 1 unresolved', laneB())}${lane('Scored', '3 of 6', laneC())}</div>`;
  const decideForm = (ctx, o = {}) => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('target', 's18')}</span>Your decision</div>${seg(['I acted', 'I chose not to'], o.on ?? 0, 'What you did', 'lg full')}
    <div style="display:grid;gap:6px"><span class="label">What you did, at your broker</span><div class="journal-pick">${['Add', 'Hold', 'Pause', 'Trim', 'Rebalance'].map(a => `<button type="button" aria-pressed="${a === (o.did || 'Hold')}">${ic({ Add: 'plus', Hold: 'equal', Pause: 'pause', Trim: 'trim', Rebalance: 'rebalance' }[a], 's16')}${a}</button>`).join('')}</div></div>
    <div style="display:grid;gap:6px"><span class="label">Why, in your words</span><div class="journal-field" role="textbox" aria-label="Why">${o.why || whyText}</div></div>${never}</div>`;

  J.add({
    id: 'journal', title: 'Journal', stories: ['MP-158', 'MP-144', 'MP-130', 'MP-154'],
    summary: 'What you decided and did at your broker, and why, against the exact evidence you saw, then what happened once its horizon passed.',
    options: [{
      id: 'a', name: 'Timeline', rec: true,
      why: 'One log in time order, which is what makes a journal honest: entries only ever add up. Recording is a short sheet over the ranked action, so it takes seconds and sits where you read the reasons.',
      cost: 'Nothing lines up what still needs a decision, so an action you skip stays unrecorded unless you go back to it.',
      screens: [{
        id: 'a-record', title: 'Record from a ranked action',
        note: 'MP-158 names two answers, I acted and I chose not to. Empty shows what the story requires while action thresholds are unapproved (FIN-OD-07): evidence, and no label. Every action label here waits on that decision.',
        render: ctx => {
          const st = ctx.state, h = pickState(st), none = ['empty', 'noModel', 'abstention'].includes(st);
          return frame(ctx, { tab: 1, title: h.t, back: 'Forecasts', actions: tb('info', 'About this action'), body: recordBody(ctx), rail: none ? `${pastOn(st)}${phone(ctx) ? '' : `<div class="card fcard" data-mo="card">${proof(true)}</div>`}` : `${st === 'default' || st === 'error' || st === 'offline' || st === 'loading' ? impact() : ''}<div class="card fcard" data-mo="card">${proof(true)}</div>`, sheet: recordSheet(ctx) });
        }
      }, {
        id: 'a-list', title: 'The journal',
        note: 'Newest first, append-only. A mark shows where you differed from the ranking. Disagreement shows an amended outcome: the first and corrected scores both stay.',
        render: ctx => {
          const p = phone(ctx);
          const list = (o) => listCard(ALL, o);
          const body = region(ctx, {
            ok: () => (p ? wrapUp() : '') + list(),
            loading: () => skel(5),
            empty: () => stateCard('target', 'No decisions yet', 'Open any ranked action and record what you did, or chose not to do. The outcome joins your entry once its horizon passes.', btn('See ranked actions', 'tinted sm', 'chev-r')),
            error: () => stateCard('alert', 'The journal did not load', 'The read failed at 21:14. These are your entries as of 20:45. Nothing you saved is lost.', btn('Try again', 'tinted sm', 'refresh')) + list(),
            stale: () => banner('warn', 'Outcomes are behind.', 'Last joined 16:35. Your entries are complete; the newest scores may be missing.', 'clock') + list(),
            offline: () => banner('', 'Offline.', 'Showing your journal from 21:15. New entries stay as drafts until you reconnect.', 'wifi-off') + list(),
            noModel: () => banner('', 'No approved model for new actions.', 'Your entries keep the model they cited, and outcomes are still scored by code.', 'cube') + list(),
            disagreement: () => banner('', '1 outcome was amended.', 'NVIDIA’s close was corrected on 30 Oct. The first and corrected scores both stay.', 'split') + list({ over: { nvda: 'Corrected to +11.9%, inside its 80% range. The first figure, +12.4%, stays.' }, marks: { nvda: chipMark('<i class="lg-sc" aria-hidden="true"></i>', 'Amended') } }),
            abstention: () => banner('', '1 entry has no range to score.', 'The model abstained on Apple that day, so the entry stays on record, unscored.', 'ban') + list({ over: { aapl: 'No range to score. What you did and what happens stay on record.' }, marks: { aapl: chipMark(ic('ban', 's14'), 'Unscored') } })
          });
          const empty = ctx.state === 'empty' || ctx.state === 'loading';
          return frame(ctx, { tab: 3, title: 'Journal', actions: `${tb('search', 'Search')}${tb('plus', 'Record a decision')}`, webActions: btn('Record a decision', 'tinted sm', 'plus'), body, rail: p ? (empty ? '' : sideCard()) : empty ? `<div class="card fcard" data-mo="card">${proof(true)}</div>` : `${wrapUp()}${sideCard()}<div class="card fcard" data-mo="card">${proof(true)}</div>` });
        }
      }, {
        id: 'a-one', title: 'One decision, scored',
        note: 'The outcome lands on the range you saw. Empty is a decision still waiting for its horizon. Stale is a missing input, which never counts as zero. The track record beside it pairs coverage with its sample; a hit rate never stands alone.',
        render: ctx => { const st = ctx.state, s = seen(st); return frame(ctx, { tab: 3, title: s.title, back: 'Journal', actions: tb('info', 'About this score'), body: oneBody(ctx) + yourEntry(s), rail: `${frozen(s)}${['default', 'offline', 'noModel', 'disagreement'].includes(st) ? whatHappened(st) : ''}<div class="card fcard" data-mo="card">${proof(true)}</div>` }); }
      }, {
        id: 'a-differ', title: 'Where you differed', na: naDiffer,
        note: 'Counts, not a rate, until enough have scored. How many is enough is not set. A scored outcome grades the forecast, never the owner, so this view makes no claim that you or the ranking was right.',
        render: ctx => {
          const keys = ['fresh', 'rel', 'nvda', 'azn'];
          const list = () => listCard(keys, { noDiffer: true, head: `<div class="journal-head"><h3>4 entries</h3>${illus()}</div>` });
          const body = region(ctx, {
            ok: () => tally() + tooFew + list(),
            loading: () => tally() + skel(3),
            empty: () => stateCard('check', 'You have followed every ranked action', 'There is nothing to compare yet. If you decide differently, it appears here with what happened.'),
            error: () => stateCard('alert', 'This comparison did not load', 'The read failed at 21:14. Your entries are safe.', btn('Try again', 'tinted sm', 'refresh')) + list(),
            stale: () => banner('warn', 'Outcomes are behind.', 'Last joined 16:35, so a newer score may be missing here.', 'clock') + tally() + list(),
            offline: () => banner('', 'Offline.', 'Showing this comparison from 21:15.', 'wifi-off') + tally() + list(),
            disagreement: () => banner('', '1 entry is left out.', 'Rules and models differed on Reliance on 9 Oct, so no action was ranked to differ from.', 'split') + tally() + list(),
            abstention: () => stateCard('ban', 'Too few to compare', 'Only 3 of your 7 decisions have scored. Any rate would mislead, so none shows until more horizons pass.') + list()
          });
          return frame(ctx, { tab: 3, title: 'Where you differed', back: 'Journal', actions: tb('info', 'About this view'), body, rail: ['empty'].includes(ctx.state) ? (phone(ctx) ? '' : `<div class="card fcard" data-mo="card">${proof(true)}</div>`) : `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('fan', 's18')}</span>How the forecasts did</div><p>Of the 3 scored, 2 landed inside their 80% range and 1 outside. Unresolved and waiting entries are counted apart, never as misses.</p></div><div class="card fcard" data-mo="card">${proof(true)}</div>` });
        }
      }]
    }, {
      id: 'b', name: 'Three lanes',
      why: 'The journal opens on what needs you: ranked actions to decide, decisions waiting for their horizon, and outcomes scored. Recording is a full page, with room to compare before you commit to words.',
      cost: 'It reads like a to-do list, which can press a long-term investor to act when doing nothing is fine. Time order, the honest shape of a journal, sits one step away.',
      screens: [{
        id: 'b-board', title: 'Three lanes',
        note: 'Three columns from iPad up; one lane at a time on a phone. Deciding to do nothing still clears a card, so an empty lane is never a target.',
        render: ctx => {
          const p = phone(ctx);
          const week = () => wrapUp({ t: 'No entries yet. 1 outcome matured last week: NVIDIA, inside its range. Next outcome: Apple, 12 Nov.' }), strip = p ? '' : week();
          const body = region(ctx, {
            ok: () => strip + boardOk(ctx),
            loading: () => p ? skel(3) : `<div class="journal-lanes">${skel(2)}${skel(3)}${skel(3)}</div>`,
            empty: () => stateCard('target', 'Nothing in any lane', 'A ranked action appears here when one is published. You can leave it as long as you like; MyPrediction never places a trade.'),
            error: () => stateCard('alert', 'The lanes did not load', 'The read failed at 21:14. These are as of 20:45. Your saved entries are safe.', btn('Try again', 'tinted sm', 'refresh')) + boardOk(ctx),
            stale: () => banner('warn', 'Rankings are behind.', 'HSBC last priced 16:35, so its action holds at Pause and stays out of To decide.', 'clock') + boardOk(ctx),
            offline: () => banner('', 'Offline.', 'Showing your lanes from 21:15. Drafts wait until you reconnect.', 'wifi-off') + boardOk(ctx),
            noModel: () => banner('', 'No approved model.', 'To decide stays empty until one is approved. Waiting and Scored carry on.', 'cube') + boardOk(ctx, { on: 1 }),
            disagreement: () => banner('', 'Rules and models differ on Reliance.', 'Both show on its card, and no action is ranked.', 'split') + boardOk(ctx),
            abstention: () => banner('', 'The model abstained on AstraZeneca.', 'It has no action to decide, so it stays out of To decide.', 'ban') + boardOk(ctx)
          });
          return frame(ctx, { tab: 3, title: 'Journal', actions: `${tb('search', 'Search')}`, body, rail: p && ctx.state === 'default' ? week() : '' });
        }
      }, {
        id: 'b-decide', title: 'Decide, on a full page',
        note: 'Record decision then raises Prism’s sheet to confirm, as everywhere. This page records what you did at your broker. It offers no way to do it. MP-158 names two answers; which action you took sits inside I acted.',
        render: ctx => {
          const st = ctx.state, h = pickState(st), p = phone(ctx), none = ['empty', 'noModel', 'abstention'].includes(st);
          const form = none ? '' : st === 'stale' ? decideForm(ctx, { did: 'Pause', why: 'Paused new money until prices return.' }) : st === 'disagreement' ? decideForm(ctx, { did: 'Add', why: 'Added 10 units on the rules.' }) : decideForm(ctx);
          const notes = { error: banner('fall', 'That did not save.', 'Your draft is kept. Trying again cannot save it twice.', 'alert'), offline: banner('', 'Offline.', 'Your draft stays here and saves when you reconnect.', 'wifi-off') }[st] || '';
          const label = st === 'error' ? 'Try again' : st === 'offline' ? 'Keep draft' : st === 'loading' ? 'Saving' : 'Record decision';
          const go = `<button class="btn sm btn-primary" type="button" style="width:100%"${st === 'loading' ? ' disabled' : ''}>${st === 'loading' ? '<span class="spin" aria-hidden="true"></span>' : ''}${label}</button>`;
          return frame(ctx, { tab: 3, title: 'Decide', back: 'Journal', actions: tb('x', 'Close'), body: `${notes}${recordBody(ctx)}${form}`, rail: none ? `${pastOn(st)}${p ? '' : `<div class="card fcard" data-mo="card">${proof(true)}</div>`}` : `${['default', 'error', 'offline', 'loading'].includes(st) ? impact() : ''}${p ? '<div class="journal-pad"></div>' : `<div class="card fcard" data-mo="card">${proof(true)}</div>${go}`}`, accessory: p && !none ? go : '' });
        }
      }, {
        id: 'b-one', title: 'One decision, side by side',
        note: 'Three parts, read left to right from iPad up: what the ranking said, what you did, what happened. It stays a side-by-side of facts, with no verdict on who was right.',
        render: ctx => {
          const st = ctx.state, p = phone(ctx);
          const s = seen(st);
          const said = `<div class="card state" style="height:100%" data-mo="card"><div class="journal-bar"><div class="w"><b>The ranking said</b>${s.year}, frozen</div>${s.act ? badge(s.act) : ''}</div>${kvs(s)}</div>`;
          const did = `<div class="card state" style="height:100%" data-mo="card"><div class="journal-bar"><div class="w"><b>You did</b>Recorded ${s.on}</div>${s.differ ? differed : ''}</div><p style="color:var(--ink)">${s.said}</p>${acts(btn('Add a correction', 'tinted sm'))}</div>`;
          const end = oneBody(ctx), scored = ['default', 'offline', 'noModel', 'disagreement'].includes(st);
          const happened = scored ? whatHappened(st) : '';
          const proofCard = `<div class="card fcard" data-mo="card">${proof(true)}</div>`;
          const body = p ? `${said}${did}${end}${happened}${proofCard}` : `<div class="journal-trow"><div class="journal-tri${scored ? '' : ' two'}"><div>${said}</div><div>${did}</div>${scored ? `<div>${happened}</div>` : ''}</div><div class="journal-low"><div>${end}</div>${proofCard}</div></div>`;
          return frame(ctx, { tab: 3, title: s.title, back: 'Journal', actions: tb('info', 'About this score'), body });
        }
      }, {
        id: 'b-differ', title: 'Every decision, compared', na: naDiffer,
        note: 'The whole journal as one comparison, filtered to where you differed. Counts stand in for a rate until enough have scored; how many is enough is not set.',
        render: ctx => {
          const p = phone(ctx), keys = ['rel', 'nvda', 'azn'];
          const filter = `<div data-mo="rise">${seg(['All 6', 'Differed 3', 'Followed 3'], 1, 'Show', 'full')}</div>`;
          const table = () => p ? listCard(keys, { noDiffer: true }) : `<div class="card journal-wide" data-mo="card"><table class="ht"><thead><tr><th>Holding</th><th>Decided</th><th>Ranked</th><th>You</th><th>What happened</th></tr></thead><tbody>${keys.map(k => { const d = D[k]; return `<tr data-mo="rise"><td><div class="inst">${logo(d.h.c, d.h.lg, true)}<div style="min-width:0"><b>${d.h.t}</b><span>${d.hz}</span></div></div></td><td>${d.on}</td><td>${badge(d.ranked)}</td><td style="white-space:normal">${d.you}</td><td style="white-space:normal">${d.line}</td></tr>`; }).join('')}</tbody></table></div>`;
          const body = filter + region(ctx, {
            ok: () => table(),
            loading: () => skel(3),
            empty: () => stateCard('check', 'No differences yet', 'You have followed every ranked action so far, so there is nothing to compare.'),
            error: () => stateCard('alert', 'This comparison did not load', 'The read failed at 21:14. Your entries are safe.', btn('Try again', 'tinted sm', 'refresh')) + table(),
            stale: () => banner('warn', 'Outcomes are behind.', 'Last joined 16:35, so a newer score may be missing.', 'clock') + table(),
            offline: () => banner('', 'Offline.', 'Showing this comparison from 21:15.', 'wifi-off') + table(),
            disagreement: () => banner('', '1 entry is left out.', 'No action was ranked for Reliance on 9 Oct, so there was nothing to differ from.', 'split') + table(),
            abstention: () => stateCard('ban', 'Too few to compare', 'Only 3 of your 6 decisions have scored. Any rate would mislead, so none shows.') + table()
          });
          return frame(ctx, { tab: 3, title: 'Compared', back: 'Journal', actions: tb('info', 'About this view'), body, rail: `${ctx.state === 'empty' ? '' : tally(3)}${ctx.state === 'empty' ? '' : tooFew}${p ? '' : `<div class="card fcard" data-mo="card">${proof(true)}</div>`}` });
        }
      }]
    }]
  });
}
