/* Journal: what you decided and did elsewhere, against the exact evidence you saw, joined to what happened (MP-62).
   MP never places a trade, and an entry never changes a holding. A block, so these helpers stay private to this journey. */
{
  const phone = ctx => ctx.kind === 'iphone' || ctx.kind === 'pwa';
  const acts = (...b) => `<div class="journal-acts">${b.filter(Boolean).join('')}</div>`;
  const chipMark = (mark, t, c = '') => `<span class="chip${c ? ' ' + c : ''}" data-mo="chip">${mark}${t}</span>`;
  const support = `<span class="chip illus" data-mo="chip">Decision support</span>`;
  const supportFoot = `<div class="t5foot">Decision support, not advice. MyPrediction places no trades. Illustrative.</div>`;
  const proposed = ref => `<span class="chip proposed" data-mo="chip"><span class="dot"></span>Proposed · ${ref}</span>`;
  /* with no action ranked, an entry can still be saved against the evidence on screen, and it records why none was
     (the owner, "Any time evidence shows", OWN-15). A disagreement, an abstention, no model and no label all stay recordable. */
  /* how old a price may be is DATA-DEC-02, when a price may be used as current, so every use of the late-price rule says so */
  const limit = `<div class="journal-acts">${proposed('DATA-DEC-02')}</div>`;
  /* what the app keeps offline is an open owner question, so any offline copy says so, on every surface */
  const kept = `<div class="journal-acts">${proposed('MP40-Q12')}</div>`;
  const off = (ctx, t) => banner('', 'Offline.', t, 'wifi-off') + kept;
  /* a failed read or save is not a failed price, so the price chips stay as they are */
  const notPrices = ctx => (ctx.state === 'error' ? 'default' : undefined);
  const waiting = t => chipMark(ic('clock', 's14'), t);
  const differed = chipMark(ic('split', 's14'), 'Differed');

  /* the journal: seven illustrative entries, today being 3 Nov 2026. 'st' is the outcome state from MP-130 and MP-154 */
  const D = {
    fresh: { h: byT.NVDA, on: 'Today', hz: '6 months', ranked: 'Trim', you: 'You chose not to', differ: true, st: 'wait', left: 'Due 3 May', line: 'Nothing is scored before 3 May 2027.' },
    spy: { h: byT.SPY, on: '21 Aug 2026', hz: '3 months', ranked: 'Add', you: 'You added 6 units', st: 'wait', left: '17 days', line: 'Outcome due 20 Nov 2026.' },
    rel: { h: byT.RELIANCE, on: '2 Jun 2026', hz: '3 months', ranked: 'Add', you: 'You chose not to', differ: true, st: 'in', line: 'Rose 5.1%, inside its 80% range.' },
    aapl: { h: byT.AAPL, on: '12 May 2026', hz: '6 months', ranked: 'Hold', you: 'You held', st: 'wait', left: '9 days', line: 'Outcome due 12 Nov 2026.' },
    nvda: { h: byT.NVDA, on: '28 Apr 2026', hz: '6 months', ranked: 'Trim', you: 'You chose not to', differ: true, st: 'in', line: 'Rose 12.4%, inside its 80% range.' },
    hsba: { h: byT.HSBA, on: '14 Apr 2026', hz: '6 months', ranked: 'Pause', you: 'You paused new money', st: 'open', line: 'A dividend is disputed, so nothing is scored yet. It is never a zero.' },
    azn: { h: byT.AZN, on: '3 Mar 2026', hz: '6 months', ranked: 'Hold', you: 'You added 5 units', differ: true, st: 'out', line: 'Fell 11.6%, outside its 80% range.' }
  };
  const ALL = ['fresh', 'spy', 'rel', 'aapl', 'nvda', 'hsba', 'azn'];
  /* one journal: both options read these lists, these counts and these state facts. NVIDIA today is recorded, so it is waiting, not open */
  const WAITING = ['aapl', 'spy', 'fresh', 'hsba'], SCORED = ['nvda', 'rel', 'azn'], DIFFERED = ['fresh', 'rel', 'nvda', 'azn'];
  const AMENDED = { over: { nvda: 'Corrected to +11.9%, inside its 80% range. The first figure, +12.4%, stays.' }, marks: { nvda: chipMark('<i class="lg-sc" aria-hidden="true"></i>', 'Amended') } };
  const ABSTAINED = { over: { azn: 'Recorded against a ranked action on 3 Mar. Fell 11.6%, outside its 80% range.' } };
  const overs = st => ({ disagreement: AMENDED, abstention: ABSTAINED }[st] || {});
  const sayAmended = () => banner('', '1 outcome was amended.', 'NVIDIA’s close was corrected on 30 Oct, from +12.4% to +11.9%. The first and corrected scores both stay.', 'split');
  const sayRanking = () => banner('', 'Rules and models differ on Reliance.', `At 6 months the baseline shows ${pct(BASE.med)} and R2-HGB v3 ${pct(byT.RELIANCE.med)}. They differ at 3 and 12 months too, so no action is ranked. You can still record a decision against the evidence.`, 'split');
  const sayBehind = () => banner('warn', 'Outcomes and rankings are behind.', 'Last joined 14:10. Your entries are complete; the newest scores may be missing. HSBC last priced 14:10, past the freshness limit, so its action holds at Pause until its price returns.', 'clock') + limit;
  const sayAbstain = () => banner('', 'The model abstains on AstraZeneca today.', 'No action is ranked. You can still record a decision against the evidence, and the entry says why none was. Your entry of 3 Mar stands.', 'ban');
  const sayNoModel = () => banner('', 'No approved model for new actions.', 'Your entries keep the model they cited, and outcomes are still scored by code. No action waits for you until one is approved.', 'cube');
  const SAY_OFF = 'Showing your journal from 21:15. New entries stay as drafts until you reconnect.';
  const sayLoadFailed = () => stateCard('alert', 'The journal did not load', 'The read failed at 21:14. These are your entries as of 21:05 today. Nothing you saved is lost.', btn('Try again', 'tinted sm', 'refresh'));
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
  const listCard = (keys, o = {}) => `<div class="card" style="padding:2px 0" data-mo="card">${o.head || ''}${keys.map(k => entry(k, o)).join('')}${supportFoot}</div>`;
  const wrapUp = () => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('clock', 's18')}</span><span style="flex:1;min-width:0">This week</span>${illus()}</div><p>1 entry recorded. 1 outcome matured last week: NVIDIA, inside its range. Next outcome: Apple, 12 Nov.</p></div>`;
  const tally = () => `<div class="journal-ba"><div data-mo="card"><span class="k">You followed</span><span class="v">${roll('3')}</span><span class="n">0 scored · 2 waiting · 1 unresolved</span></div><div data-mo="card"><span class="k">You differed</span><span class="v">${roll('4')}</span><span class="n">3 scored · 1 waiting</span></div></div>`;
  const tooFew = `<p class="small muted">Too few scored decisions to show a rate. A scored outcome grades the forecast, not you.</p>`;
  const counts = () => tally() + tooFew;
  const howDid = () => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('fan', 's18')}</span><span style="flex:1;min-width:0">How the forecasts did</span></div><p>Of the 3 scored, 2 landed inside their 80% range and 1 outside. Unresolved and waiting entries are counted apart, never as misses.</p></div>`;
  const sayLeftOut = () => banner('', 'No action is ranked on Reliance today.', 'Rules and models differ on it, so there is nothing to differ from until one is ranked.', 'split');
  const SAY_THIN = 'Last joined 14:10, so a newer score may be missing here.';
  const sideCard = () => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('split', 's18')}</span><span style="flex:1;min-width:0">You and the ranking</span></div><p>You differed from the ranked action 4 times in 7 decisions. 3 have scored so far, too few to show a rate.</p><button class="btn btn-plain sm" type="button" style="justify-self:start">See where you differed${ic('chev-r', 's14')}</button></div>`;
  const never = `<p class="small muted">Saved with the action, evidence and policy version you saw. No trade is placed and your holdings do not change.</p>`;
  const neverSplit = `<p class="small muted">Saved with both sides, the evidence and the policy version you saw, and why no action was ranked: rules and models differ at 3, 6 and 12 months. No trade is placed and your holdings do not change.</p>`;
  /* an entry with no action ranked records why none was; an abstained horizon has no forecast to score, so its entry may never get an outcome */
  const WHYNONE = {
    empty: ['NVIDIA · No label', '6 months · thresholds not approved · median +9.1% · 80% range −18.5% to +34.0% · illustrative', 'no label: the thresholds that turn a score into an action are not approved', ''],
    noModel: ['NVIDIA · No action ranked', 'No approved model · price and rules only · illustrative', 'no approved model covered it', ''],
    abstention: ['AstraZeneca · No action ranked', '6 months · the model abstained · no range · illustrative', 'the model abstained at 6 months, so there was no range', ' With no forecast at 6 months, this entry may never get an outcome.']
  };
  const neverNone = st => `<p class="small muted">Saved against the evidence you saw, with why no action was ranked: ${WHYNONE[st][2]}.${WHYNONE[st][3]} No trade is placed and your holdings do not change.</p>`;

  /* ---------- a ranked action, with its reasons, uncertainty, impact and horizon (MP-144) ---------- */
  const reasons = (h) => `<ul class="journal-why">
    <li>${ic('fan', 's16')}<div>Widest range of your 7 holdings. <span>R2-HGB v3</span></div></li>
    <li>${ic('layers', 's16')}<div>12.6% of your portfolio. <span>Ledger revision 214</span></div></li>
    <li>${ic('shield', 's16')}<div>Protection trails growth and opportunity. <span>Policy v1</span></div></li></ul>`;
  const components = () => `<div class="journal-comp" role="img" aria-label="Score 71 of 100: growth 88, protection 52, opportunity 78">${[['Growth', 88], ['Protection', 52], ['Opportunity', 78]].map(([k, v]) => `<div><span>${k}</span><b>${roll(String(v))}</b></div>`).join('')}</div>`;
  const impact = () => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('layers', 's18')}</span>If it were 10% smaller</div>
    <div class="journal-kv"><span>NVIDIA in your portfolio</span><b>12.6% → 11.4%</b><span>US tech in your portfolio</span><b>29.1% → 27.8%</b><span>Width of the portfolio’s 80% range, 6 months</span><b>23.2 → 22.5 pts</b></div><p>Computed by code, for illustration. It assumes no tax rule and no costs, and it moves nothing.</p></div>`;
  const actionCard = (h, ctx) => `<div class="card fcard" style="display:grid;gap:10px" data-mo="card"><div class="journal-bar">${badge('Trim')}<div class="w"><b>Ranked action</b>${h.n} · score 71 · 6 months</div>${support}</div>
    ${reasons(h)}${components()}<div>${range(h)}</div><div class="rng" style="margin-top:0"><span>Median</span><b>${pct(h.med)}</b><span>80% range</span><b>${pct(h.lo)} to ${pct(h.hi)}</b></div>${fcMeta()}</div>`;
  const whyText = 'Long-term position. I accept the wider range for now.';
  const held = (title, text, icon = 'ban') => stateCard(icon, title, text);
  const field = (l, t, rows = 2) => `<label style="display:grid;gap:6px"><span class="label">${l}</span><textarea class="journal-field" rows="${rows}">${t}</textarea></label>`;
  /* Reliance at 6 months, as Forecast draws it: the rules point down and the model points up, so each side shows and no one median stands */
  const BASE = { med: -2.4, lo: -15.5, hi: 11.2, lo50: -8.9, hi50: 4.2 };
  const dual = () => `<div class="journal-split" role="img" aria-label="At 6 months the baseline shows a median of minus 2.4% and R2-HGB v3 plus 7.4%, so no action is ranked"><span>Baseline</span>${range({ ...byT.RELIANCE, ...BASE })}<span>R2-HGB v3</span>${range(byT.RELIANCE)}</div>`;
  const sheetTop = (t = 'Record your decision') => `<div class="grabber"></div><div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><h4 id="journal-rec">${t}</h4><button class="iconbtn sm" type="button" aria-label="Close">${ic('x', 's16')}</button></div>`;
  const sheetSolid = (h, l, s) => `<div class="card" style="margin-top:12px;padding:12px 14px;display:flex;gap:10px;align-items:center" data-mo="card">${logo(h.c, h.lg)}<div style="flex:1;min-width:0"><div style="font:600 15px/20px var(--font-text);letter-spacing:-.01em">${l}</div><div class="small muted">${s}</div></div></div>`;
  const choose = (on = 1) => `<div style="margin-top:12px">${seg(['I acted', 'I chose not to'], on, 'What you did', 'lg full')}</div>`;
  const sheetDid = (t = 'Kept all 60 units.') => `<div style="margin-top:10px">${field('What you did, at your broker', t, 1)}</div>`;
  const sheetWhy = (t = whyText) => `<div style="margin-top:10px">${field('Why, in your words', t)}</div>`;
  const sheetFoot = (right, saved = never) => `<div style="margin-top:10px">${saved}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">${btn('Not now', 'tinted sm')}${right}</div>`;
  const pickState = st => ({ stale: byT.HSBA, disagreement: byT.RELIANCE, abstention: byT.AZN }[st] || byT.NVDA);
  const pastOn = st => {
    /* in Empty no action label exists, so today's entry cannot have been made */
    const keys = st === 'abstention' ? ['azn'] : st === 'noModel' ? ['fresh', 'nvda'] : ['nvda'], h = D[keys[0]].h;
    return listCard(keys, { head: `<div class="journal-head"><h3>Your entries on ${h.n}</h3></div>` });
  };
  const recordBody = (ctx) => {
    const st = ctx.state, h = pickState(st);
    if (st === 'loading') return actionCard(h, ctx).replace('Ranked action', 'Ranked action · last good 21:15');
    if (st === 'empty') return `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('sliders', 's18')}</span>No action label yet</div><p>The thresholds that turn a score into an action are not approved, so this shows its evidence and no label. A guessed action is worse than none. You can still record a decision against this evidence, and the entry says there was no label.</p>${components()}<p>Score 71 · growth 35%, protection 40%, opportunity 25%. Illustrative.</p></div>`;
    if (st === 'noModel') return held('No approved model', 'No approved model covers NVIDIA now, so no action is ranked. You can still record a decision against its price and the rules, and the entry says why no action was ranked. Your entries, today’s included, keep what they cited.', 'cube');
    if (st === 'abstention') return held('The model abstained on AstraZeneca', 'Too little comparable history for a calibrated range, so no action is ranked. You can still record a decision against the evidence shown, and the entry says why none was. With no 6-month forecast, it may never get an outcome.');
    if (st === 'disagreement') return `<div class="card fcard" style="display:grid;gap:10px" data-mo="card"><div class="journal-bar"><div class="w"><b>No action ranked</b>Reliance · 6 months</div>${chipMark(ic('split', 's14'), 'Rules and models differ')}</div><p class="small muted">The rules point down and the model points up, at 3, 6 and 12 months. Both show, and neither is picked for you.</p>${dual()}${fcMeta()}</div>`;
    if (st === 'stale') return banner('warn', 'This action is stale.', 'HSBC last priced 14:10, past the freshness limit, so its action holds at Pause until its price returns.', 'clock') + limit + `<div class="card fcard" style="display:grid;gap:10px" data-mo="card"><div class="journal-bar">${badge('Pause')}<div class="w"><b>Ranked action, stale</b>HSBC · 6 months</div>${support}</div><p class="small muted">Your entry will record that the action was stale when you decided.</p>${fcMeta()}</div>`;
    return actionCard(h, ctx);
  };
  const recordSheet = (ctx) => {
    const st = ctx.state, h = pickState(st), wrap = inner => `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="journal-rec" data-mo="sheet">${inner}</div>`;
    const nv = sheetSolid(h, 'NVIDIA · Trim', '6 months · median +9.1% · 80% range −18.5% to +34.0% · illustrative');
    const go = btn('Record decision', 'primary sm');
    switch (st) {
      case 'empty': case 'noModel': case 'abstention': return wrap(sheetTop() + sheetSolid(h, WHYNONE[st][0], WHYNONE[st][1]) + choose(1) + sheetDid() + sheetWhy(st === 'abstention' ? 'No range to go on, so on my own reading.' : 'No action to go on, so on my own reading.') + sheetFoot(go, neverNone(st)));
      case 'loading': return wrap(sheetTop('Saving your decision') + nv + choose() + sheetDid() + sheetWhy() + sheetFoot(`<button class="btn sm btn-tinted" type="button" disabled><span class="spin" aria-hidden="true"></span>Saving</button>`));
      case 'error': return wrap(sheetTop('Not saved yet') + `<div style="margin-top:10px">${banner('fall', 'That did not save.', 'Your draft is kept. Trying again cannot save it twice.', 'alert')}</div>` + nv + sheetWhy() + sheetFoot(btn('Try again', 'primary sm', 'refresh')));
      case 'offline': return wrap(sheetTop() + `<div style="margin-top:10px">${off(ctx, 'Your draft stays here and saves when you reconnect.')}</div>` + nv + choose() + sheetDid() + sheetWhy() + sheetFoot(btn('Keep draft', 'primary sm')));
      case 'stale': return wrap(sheetTop() + sheetSolid(h, 'HSBC · Pause, stale', '6 months · last price 14:10 · illustrative') + choose(0) + sheetDid('Paused new money.') + sheetWhy('Waiting until its price returns.') + sheetFoot(go));
      case 'disagreement': return wrap(sheetTop() + sheetSolid(h, 'Reliance · No action ranked', '6 months · rules and models differ at 3, 6 and 12 months · illustrative') + choose(0) + sheetDid('Paused new money.') + sheetWhy('On the rules alone, for now.') + sheetFoot(go, neverSplit));
      default: return wrap(sheetTop() + nv + choose() + sheetDid() + sheetWhy() + sheetFoot(go));
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
  const thenAzn = { med: 2.4, lo: -9.8, hi: 12.6, lo50: -4, hi50: 7.8, when: '3 March' };
  const thenHsba = { med: 1.6, lo: -9.4, hi: 11.8 };
  const scoreLines = () => `<div class="journal-kv"><span>80% range</span><b>Held</b><span>Direction</span><b>As forecast</b><span>Error against the median</span><b>4.6 points</b></div>`;
  const legendNow = () => `<div class="legend"><span><i class="lg-50"></i>50% range</span><span><i class="lg-80"></i>80% range</span><span><i class="lg-med"></i>Median</span><span><i class="lg-sc"></i>Outcome</span></div>`;
  const outcomeCard = (ctx, o = {}) => `<div class="card fcard" data-mo="card"><div class="journal-bar"><div class="w"><b>${o.t || 'Scored on 28 Oct 2026'}</b>${o.s || 'Horizon passed, every input in'}</div>${chipMark(`<i class="${o.mark || 'lg-sc'}" aria-hidden="true"></i>`, o.c || 'Inside its range')}</div>
    <div style="margin-top:6px">${landed(o.then || then, o.out ?? 12.4, { w: ctx.kind === 'web' ? 460 : 326 })}</div>${legendNow()}<div style="margin-top:10px">${o.lines || scoreLines()}</div></div>`;
  /* the decision a state is about: Empty is one still waiting, Stale is the HSBC entry the list shows as unresolved, Abstaining is the AstraZeneca entry, recorded against a ranked action before the model abstained. Entries before 1 Oct 2026 cite the version approved then */
  const seen = st => st === 'empty'
    ? { title: 'Apple · 12 May', on: '12 May', year: '12 May 2026', differ: false, act: 'Hold', rows: [['6-month median', '+5.4%'], ['80% range', '−8.9% to +19.7%']], model: 'R2-HGB v2', policy: 'Policy v1', cut: '12 May 21:00', said: 'I acted. Held all 88 units. Nothing in the range changed my view.' }
    : st === 'stale'
      ? { title: 'HSBC · 14 Apr', on: '14 Apr', year: '14 Apr 2026', differ: false, act: 'Pause', rows: [['6-month median', pct(thenHsba.med)], ['80% range', `${pct(thenHsba.lo)} to ${pct(thenHsba.hi)}`]], model: 'R2-HGB v2', policy: 'Policy v1', cut: '14 Apr 21:00', said: 'I acted. Paused new money until the next statement.' }
      : st === 'abstention'
      ? { title: 'AstraZeneca · 3 Mar', on: '3 Mar', year: '3 Mar 2026', differ: true, act: 'Hold', rows: [['6-month median', pct(thenAzn.med)], ['80% range', `${pct(thenAzn.lo)} to ${pct(thenAzn.hi)}`]], model: 'R2-HGB v2', policy: 'Policy v1', cut: '3 Mar 21:00', said: 'I acted. Added 5 units. I wanted more of it before results.' }
      : { title: 'NVIDIA · 28 Apr', on: '28 Apr', year: '28 Apr 2026', differ: true, act: 'Trim', rows: [['6-month median', pct(then.med)], ['80% range', `${pct(then.lo)} to ${pct(then.hi)}`]], model: 'R2-HGB v2', policy: 'Policy v1', cut: '28 Apr 21:00', said: `I chose not to. Kept all 60 units. ${whyText}` };
  const kvs = s => `<div class="journal-kv">${s.rows.map(([k, v]) => `<span>${k}</span><b>${v}</b>`).join('')}<span>Model</span><b>${s.model}</b><span>Ranking policy</span><b>${s.policy}</b><span>Data cutoff</span><b>${s.cut}</b></div>`;
  const frozen = s => `<div class="card state" data-mo="card"><div class="journal-bar"><div class="w"><b>What you saw on ${s.on}</b>Frozen. It never changes.</div>${chipMark(ic('lock', 's14'), 'Exact')}</div>${s.act ? `<div class="journal-bar">${badge(s.act)}${support}</div>` : ''}${kvs(s)}</div>`;
  /* the proof beside a past entry is today's model, not the version that entry cites, and it is not drawn at all when no model is approved */
  const proofCard = (ctx, cites) => (ctx.state === 'noModel'
    ? stateCard('cube', 'No model to prove', 'No model is approved now, so no proof of one shows. Forecasts already scored stay on record.')
    : `<div class="card fcard" data-mo="card">${proof(true)}${cites ? `<p class="small muted" style="margin-top:8px">The model today. This entry cites ${cites}, the version you saw.</p>` : ''}</div>`);
  const yourEntry = s => `<div class="card state" data-mo="card"><div class="journal-bar"><div class="w"><b>What you recorded</b>${s.year} · saved, append-only</div>${s.differ ? differed : ''}</div><p style="color:var(--ink)">${s.said}</p>${acts(btn('Add a correction', 'tinted sm'))}<p>A correction is a new entry linked to this one. This one stays.</p></div>`;
  const whatHappened = st => (st === 'abstention'
    ? `<div class="card state" style="height:100%" data-mo="card"><div class="journal-bar"><div class="w"><b>What happened</b>Horizon passed 3 Sep 2026</div></div><p style="color:var(--ink)">AstraZeneca fell 11.6% in the 6 months.</p><p>One outcome says little about a decision.</p></div>`
    : `<div class="card state" style="height:100%" data-mo="card"><div class="journal-bar"><div class="w"><b>What happened</b>Horizon passed 28 Oct 2026</div></div><p style="color:var(--ink)">NVIDIA rose ${st === 'disagreement' ? '11.9%' : '12.4%'} in the 6 months.</p><p>One outcome says little about a decision.</p></div>`);
  const pendingOutcome = () => stateCard('clock', 'Outcome due 12 Nov 2026', 'Apple, Hold, recorded 12 May. Nothing is scored before its horizon passes, so this has no score yet.', '', waiting('9 days'));
  const oneBody = (ctx, o = {}) => {
    const st = ctx.state;
    return region(ctx, {
      ok: () => outcomeCard(ctx),
      loading: () => stateCard('clock', 'Joining the outcome', 'Your entry and what you saw are safe. The outcome is being joined to them.') + skel(1),
      empty: () => pendingOutcome(),
      error: () => stateCard('alert', 'The score did not arrive', 'The scoring job failed at 21:14. It reruns by itself and cannot write twice. Your entry is safe.', btn('Check again', 'tinted sm', 'refresh')),
      stale: () => stateCard('clock', 'Horizon passed 14 Oct, one input missing', 'A dividend is disputed, so this outcome is not known yet. A missing input is never scored as a zero return. It moves the date the outcome becomes known, not the horizon.', '', status(D.hsba)),
      offline: () => off(ctx, 'Showing this entry and its score from 21:15.') + outcomeCard(ctx),
      noModel: () => banner('', 'No model is approved now.', 'The score stands against the version you saw. Later models never rewrite it.', 'cube') + outcomeCard(ctx),
      disagreement: () => outcomeCard(ctx, { t: 'Amended on 30 Oct 2026', s: 'A corrected close replaced the first one', c: 'Inside its range', out: 11.9, lines: `<div class="journal-kv"><span>First outcome</span><b>+12.4%, kept</b><span>Corrected outcome</span><b>+11.9%, current</b><span>Error against the median</span><b>4.1 points</b></div>` }),
      abstention: () => banner('', 'The model abstains on AstraZeneca today.', 'This entry was recorded against a ranked action on 3 Mar, so it and its outcome stand. A new entry today records the evidence and why no action was ranked. With no forecast at 6 months, it may never get an outcome.', 'ban') + outcomeCard(ctx, { t: 'Scored on 3 Sep 2026', then: thenAzn, out: -11.6, mark: 'lg-miss', c: 'Outside its range', lines: `<div class="journal-kv"><span>80% range</span><b>Missed</b><span>Direction</span><b>Against the forecast</b><span>Error against the median</span><b>14.0 points</b></div>` })
    });
  };
  const naDiffer = { noModel: 'This view reads past entries and matured outcomes. A model missing today changes none of them.' };

  /* ---------- Option B: three lanes ---------- */
  const toDecide = (t, ctx) => {
    const h = byT[t], split = ctx.state === 'disagreement' && t === 'RELIANCE';
    return `<div class="journal-e lane" role="button" tabindex="0" data-mo="rise">${logo(h.c, h.lg, true)}<div class="m"><b>${h.n}</b><span>${split ? 'Not ranked today' : 'Ranked today'} · 6 months</span></div><div class="l">${split ? chipMark(ic('split', 's14'), 'No action ranked') : `${badge(h.act)}${support}`}</div><div class="o">${split ? `Rules and models differ: baseline ${pct(BASE.med)}, R2-HGB v3 ${pct(h.med)}.` : `${pct(h.lo)} to ${pct(h.hi)}, 80% range · median ${pct(h.med)}`}</div></div>`;
  };
  const lane = (t, n, items) => `<section class="journal-lane"><h3>${t}<span>${n}</span></h3><div class="card" style="padding:2px 0" data-mo="card">${items}</div></section>`;
  const toNone = (t, line) => { const h = byT[t]; return `<div class="journal-e lane" role="button" tabindex="0" data-mo="rise">${logo(h.c, h.lg, true)}<div class="m"><b>${h.n}</b><span>Not ranked today · 6 months</span></div><div class="l">${chipMark(ic('ban', 's14'), 'No action ranked')}</div><div class="o">${line}</div></div>`; };
  const laneA = ctx => ({
    empty: () => toNone('RELIANCE', 'No label yet: the thresholds are not approved. Record against the evidence.'),
    noModel: () => toNone('RELIANCE', 'No approved model covers India. Record against its price and the rules.'),
    abstention: () => toDecide('RELIANCE', ctx) + toNone('AZN', 'The model abstained at 6 months, so there is no range. Record against the evidence.')
  }[ctx.state] || (() => toDecide('RELIANCE', ctx)))();
  const laneB = () => WAITING.map(k => entry(k, { lane: true })).join('') + supportFoot;
  const laneC = ctx => SCORED.map(k => entry(k, { lane: true, ...overs(ctx.state) })).join('') + supportFoot;
  /* every lane stays drawn on a phone, stacked, so a flip keeps each entry, its status and the disputed HSBC outcome (MP-178) */
  const boardOk = ctx => `<div class="journal-lanes${phone(ctx) ? ' stack' : ''}">${lane('To decide', { noModel: '1, none ranked', disagreement: '1, none ranked', abstention: '2, 1 ranked' }[ctx.state] || '1 ranked', laneA(ctx))}${lane('Waiting', '3 for a horizon, 1 unresolved', laneB())}${lane('Scored', `${SCORED.length} of ${ALL.length}`, laneC(ctx))}</div>`;
  const decideForm = (ctx, o = {}) => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('target', 's18')}</span>Your decision</div>${seg(['I acted', 'I chose not to'], o.on ?? 1, 'What you did', 'lg full')}
    <div style="display:grid;gap:6px"><span class="label">What you did, at your broker</span><div class="journal-pick">${['Add', 'Hold', 'Pause', 'Trim', 'Rebalance'].map(a => `<button type="button" aria-pressed="${a === o.did}">${ic({ Add: 'plus', Hold: 'equal', Pause: 'pause', Trim: 'trim', Rebalance: 'rebalance' }[a], 's16')}${a}</button>`).join('')}</div></div>
    ${field('How much, in your words', o.size || 'Kept all 60 units.', 1)}${field('Why, in your words', o.why || whyText)}${o.saved || never}</div>`;


  J.add({
    id: 'journal', title: 'Journal', stories: ['MP-158', 'MP-144', 'MP-130', 'MP-154'],
    summary: 'What you decided and did at your broker, and why, against the exact evidence you saw, then what happened once its horizon passed.',
    options: [{
      id: 'a', name: 'Timeline', rec: true,
      why: 'One log in time order, which is what makes a journal honest: entries only ever add up. Recording is a short sheet over the ranked action, so it takes seconds and sits where you read the reasons.',
      cost: 'Nothing lines up what still needs a decision, so an action you skip stays unrecorded unless you go back to it.',
      screens: [{
        id: 'a-record', title: 'Record from a ranked action',
        note: 'Drawn at the moment before it saves: NVIDIA then joins the journal as today’s entry, and stops being open. MP-158 names two answers, I acted and I chose not to, and a line for what you did. Empty shows launch: evidence and no label, until evaluation supports the thresholds and the owner approves a ranking policy ("Evidence first", OWN-09). With no action ranked, as in Empty, No model, Disagreement and Abstaining, an entry is still saved against the evidence and records why none was ("Any time evidence shows", OWN-15).',
        render: ctx => {
          const st = ctx.state, h = pickState(st), none = ['empty', 'noModel', 'abstention'].includes(st);
          return frame(ctx, { tab: 1, title: h.t, back: 'Forecasts', fresh: notPrices(ctx), actions: tb('info', 'About this action'), body: recordBody(ctx), rail: none ? `${pastOn(st)}${phone(ctx) ? '' : proofCard(ctx)}` : `${st === 'default' || st === 'error' || st === 'offline' || st === 'loading' ? impact() : ''}${proofCard(ctx)}`, sheet: recordSheet(ctx) });
        }
      }, {
        id: 'a-pick', title: 'Record a decision',
        note: 'Where Record a decision leads: what is open to decide, ranked or not. The owner picked "Any time evidence shows" (OWN-15): with no action ranked, an entry is saved against the evidence on screen and records why none was. An entry on an abstained horizon has no forecast to score, so it may never get an outcome.',
        render: ctx => {
          const open = () => `<div class="card" style="padding:2px 0" data-mo="card">${laneA(ctx)}${supportFoot}</div>`;
          const body = region(ctx, {
            ok: open,
            loading: () => skel(2),
            empty: () => banner('', 'No action label yet.', 'The thresholds are not approved, so no action is ranked. You can still record a decision against the evidence, and the entry says why none was.', 'sliders') + open(),
            error: () => stateCard('alert', 'Ranked actions did not load', 'The read failed at 21:14. Your saved entries are safe.', btn('Try again', 'tinted sm', 'refresh')),
            stale: () => banner('warn', 'HSBC is stale.', 'Its last price, 14:10, is past the freshness limit. Its action holds at Pause until its price returns, so it is not listed.', 'clock') + limit + open(),
            offline: () => off(ctx, 'Showing ranked actions from 21:15. New entries stay as drafts until you reconnect.') + open(),
            noModel: () => banner('', 'No approved model.', 'No action is ranked. You can still record a decision against the evidence, and the entry says why none was.', 'cube') + open(),
            disagreement: () => banner('', 'Rules and models differ on Reliance.', 'Both show on its row, at 3, 6 and 12 months, and no action is ranked. It stays open to record.', 'split') + open(),
            abstention: () => banner('', 'The model abstained on AstraZeneca.', 'It has no ranked action. It is listed, so you can record against the evidence, and the entry says why none was.', 'ban') + open()
          });
          return frame(ctx, { tab: 3, title: 'Record a decision', back: 'Journal', fresh: notPrices(ctx), actions: tb('info', 'About this list'), body });
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
            error: () => sayLoadFailed() + list(),
            stale: () => sayBehind() + list(),
            offline: () => off(ctx, SAY_OFF) + list(),
            noModel: () => sayNoModel() + list(),
            disagreement: () => sayAmended() + sayRanking() + list(AMENDED),
            abstention: () => sayAbstain() + list(ABSTAINED)
          });
          const empty = ctx.state === 'empty' || ctx.state === 'loading';
          return frame(ctx, { tab: 3, title: 'Journal', fresh: notPrices(ctx), actions: `${tb('search', 'Search')}${tb('plus', 'Record a decision')}`, webActions: ctx.kind === 'pwa' ? tb('plus', 'Record a decision') : btn('Record a decision', 'tinted sm', 'plus'), body, rail: p ? (empty ? '' : `${ctx.state === 'default' ? '' : wrapUp()}${sideCard()}`) : empty ? proofCard(ctx) : `${wrapUp()}${sideCard()}${proofCard(ctx)}` });
        }
      }, {
        id: 'a-one', title: 'One decision, scored',
        note: 'The outcome lands on the range you saw. Empty is a decision still waiting for its horizon. Stale is the HSBC entry the journal shows as unresolved: a missing input, which never counts as zero. Abstaining is a past entry on a holding the model abstains on today: the entry stands, and no new one can be recorded. The track record beside it pairs coverage with its sample; a hit rate never stands alone.',
        render: ctx => { const st = ctx.state, s = seen(st); return frame(ctx, { tab: 3, title: s.title, back: 'Journal', fresh: notPrices(ctx), actions: tb('info', 'About this score'), body: oneBody(ctx) + yourEntry(s), rail: `${frozen(s)}${['default', 'offline', 'noModel', 'disagreement', 'abstention'].includes(st) ? whatHappened(st) : ''}${proofCard(ctx, s.model)}` }); }
      }, {
        id: 'a-differ', title: 'Where you differed', na: naDiffer,
        note: 'Counts, not a rate, until enough have scored. How many is enough is not set. A scored outcome grades the forecast, never the owner, so this view makes no claim that you or the ranking was right.',
        render: ctx => {
          const list = () => listCard(DIFFERED, { noDiffer: true, ...overs(ctx.state), head: `<div class="journal-head"><h3>${DIFFERED.length} entries</h3>${illus()}</div>` });
          const body = region(ctx, {
            ok: () => counts() + list(),
            loading: () => tally() + skel(3),
            empty: () => stateCard('check', 'You have followed every ranked action', 'There is nothing to compare yet. If you decide differently, it appears here with what happened.'),
            error: () => stateCard('alert', 'This comparison did not load', 'The read failed at 21:14. These are your entries as of 21:05 today, and they are safe.', btn('Try again', 'tinted sm', 'refresh')) + counts() + list(),
            stale: () => banner('warn', 'Outcomes are behind.', SAY_THIN, 'clock') + counts() + list(),
            offline: () => off(ctx, 'Showing this comparison from 21:15.') + counts() + list(),
            disagreement: () => sayAmended() + sayLeftOut() + counts() + list(),
            abstention: () => stateCard('ban', 'Too few to compare', 'Only 3 of your 7 decisions have scored. Any rate would mislead, so none shows until more horizons pass.') + tally() + list()
          });
          return frame(ctx, { tab: 3, title: 'Where you differed', back: 'Journal', fresh: notPrices(ctx), actions: tb('info', 'About this view'), body, rail: ctx.state === 'empty' ? '' : howDid() });
        }
      }]
    }, {
      id: 'b', name: 'Three lanes',
      why: 'The journal opens on what needs you: ranked actions to decide, decisions waiting for their horizon, and outcomes scored. Recording is a full page, with room to compare before you commit to words.',
      cost: 'It reads like a to-do list, which can press a long-term investor to act when doing nothing is fine. Time order, the honest shape of a journal, sits one step away.',
      screens: [{
        id: 'b-board', title: 'Three lanes',
        note: 'Three columns from iPad up; stacked on a phone, so every entry and its status stay in view. Deciding to do nothing still clears a card, so an empty lane is never a target.',
        render: ctx => {
          const p = phone(ctx), proved = () => (p ? '' : proofCard(ctx));
          const board = () => `${p ? '' : wrapUp()}${boardOk(ctx)}${p ? '' : `<div class="journal-low"><div>${sideCard()}</div>${proofCard(ctx)}</div>`}`;
          const body = region(ctx, {
            ok: () => board(),
            loading: () => (p ? skel(3) : `<div class="journal-lanes">${skel(2)}${skel(3)}${skel(3)}</div>`) + proved(),
            empty: () => stateCard('target', 'Nothing in any lane', 'A holding appears here once its first forecast is published, with or without a ranked action. You can leave it as long as you like; MyPrediction never places a trade.') + proved(),
            error: () => sayLoadFailed() + board(),
            stale: () => sayBehind() + board(),
            offline: () => off(ctx, SAY_OFF) + board(),
            noModel: () => sayNoModel() + board(),
            disagreement: () => sayAmended() + sayRanking() + board(),
            abstention: () => sayAbstain() + board()
          });
          return frame(ctx, { tab: 3, title: 'Journal', fresh: notPrices(ctx), actions: `${tb('search', 'Search')}`, body, rail: p && !['empty', 'loading'].includes(ctx.state) ? `${wrapUp()}${sideCard()}` : '' });
        }
      }, {
        id: 'b-decide', title: 'Decide, on a full page',
        note: 'Drawn at the moment before it saves: NVIDIA then joins the Waiting lane as today’s entry. Record decision then raises Prism’s sheet to confirm, as everywhere. This page records what you did at your broker. It offers no way to do it. MP-158 names two answers; which action you took and how much sit inside them.',
        render: ctx => {
          const st = ctx.state, h = pickState(st), p = phone(ctx), none = ['empty', 'noModel', 'abstention'].includes(st);
          const form = none ? decideForm(ctx, { on: 1, why: st === 'abstention' ? 'No range to go on, so on my own reading.' : 'No action to go on, so on my own reading.', saved: neverNone(st) }) : st === 'stale' ? decideForm(ctx, { on: 0, did: 'Pause', size: 'Paused new money.', why: 'Waiting until its price returns.' }) : st === 'disagreement' ? decideForm(ctx, { on: 0, did: 'Pause', size: 'Paused new money.', why: 'On the rules alone, for now.', saved: neverSplit }) : decideForm(ctx);
          const notes = { error: banner('fall', 'That did not save.', 'Your draft is kept. Trying again cannot save it twice.', 'alert'), offline: off(ctx, 'Your draft stays here and saves when you reconnect.') }[st] || '';
          const label = st === 'error' ? 'Try again' : st === 'offline' ? 'Keep draft' : st === 'loading' ? 'Saving' : 'Record decision';
          const go = `<button class="btn sm btn-primary" type="button" style="width:100%"${st === 'loading' ? ' disabled' : ''}>${st === 'loading' ? '<span class="spin" aria-hidden="true"></span>' : ''}${label}</button>`;
          return frame(ctx, { tab: 3, title: 'Decide', back: 'Journal', fresh: notPrices(ctx), actions: tb('x', 'Close'), body: `${notes}${recordBody(ctx)}${form}`, rail: none ? `${pastOn(st)}${p ? '<div class="journal-pad"></div>' : `${proofCard(ctx)}${go}`}` : `${['default', 'error', 'offline', 'loading'].includes(st) ? impact() : ''}${p ? '<div class="journal-pad"></div>' : `${proofCard(ctx)}${go}`}`, accessory: p ? go : '' });
        }
      }, {
        id: 'b-one', title: 'One decision, side by side',
        note: 'Three parts, read left to right from iPad up: what the ranking said, what you did, what happened. It stays a side-by-side of facts, with no verdict on who was right.',
        render: ctx => {
          const st = ctx.state, p = phone(ctx);
          const s = seen(st);
          const said = `<div class="card state" style="height:100%" data-mo="card"><div class="journal-bar"><div class="w"><b>The ranking said</b>${s.year}, frozen</div>${s.act ? badge(s.act) : ''}${s.act ? support : ''}</div>${kvs(s)}</div>`;
          const did = `<div class="card state" style="height:100%" data-mo="card"><div class="journal-bar"><div class="w"><b>You did</b>Recorded ${s.on}</div>${s.differ ? differed : ''}</div><p style="color:var(--ink)">${s.said}</p>${acts(btn('Add a correction', 'tinted sm'))}</div>`;
          const end = oneBody(ctx), scored = ['default', 'offline', 'noModel', 'disagreement', 'abstention'].includes(st);
          const happened = scored ? whatHappened(st) : '';
          const body = p ? `${said}${did}${end}${happened}${proofCard(ctx, s.model)}` : `<div class="journal-trow"><div class="journal-tri${scored ? '' : ' two'}"><div>${said}</div><div>${did}</div>${scored ? `<div>${happened}</div>` : ''}</div><div class="journal-low"><div>${end}</div>${proofCard(ctx, s.model)}</div></div>`;
          return frame(ctx, { tab: 3, title: s.title, back: 'Journal', fresh: notPrices(ctx), actions: tb('info', 'About this score'), body });
        }
      }, {
        id: 'b-differ', title: 'Every decision, compared', na: naDiffer,
        note: 'The whole journal as one comparison, filtered to where you differed. Counts stand in for a rate until enough have scored; how many is enough is not set.',
        render: ctx => {
          const p = phone(ctx), none = ctx.state === 'empty', { over = {}, marks = {} } = overs(ctx.state);
          const filter = `<div data-mo="rise">${seg(none ? ['All 3', 'Differed 0', 'Followed 3'] : [`All ${ALL.length}`, `Differed ${DIFFERED.length}`, 'Followed 3'], 1, 'Show', 'full')}</div>`;
          const table = () => p ? listCard(DIFFERED, { noDiffer: true, ...overs(ctx.state) }) : `<div class="card journal-wide" data-mo="card"><table class="ht"><thead><tr><th>Holding</th><th>Decided</th><th>Ranked</th><th>You</th><th>What happened</th></tr></thead><tbody>${DIFFERED.map(k => { const d = D[k]; return `<tr data-mo="rise"><td><div class="inst">${logo(d.h.c, d.h.lg, true)}<div style="min-width:0"><b style="max-width:none;white-space:normal">${d.h.n}</b><span>${d.hz}</span></div></div></td><td>${d.on}</td><td>${badge(d.ranked)}</td><td style="white-space:normal">${d.you}</td><td style="white-space:normal"><div>${marks[k] || status(d)}</div><div style="margin-top:4px">${over[k] || d.line}</div></td></tr>`; }).join('')}</tbody></table>${supportFoot}</div>`;
          const body = filter + region(ctx, {
            ok: () => table(),
            loading: () => skel(3),
            empty: () => stateCard('check', 'No differences yet', 'You have followed every ranked action so far, so there is nothing to compare.'),
            error: () => stateCard('alert', 'This comparison did not load', 'The read failed at 21:14. These are your entries as of 21:05 today, and they are safe.', btn('Try again', 'tinted sm', 'refresh')) + table(),
            stale: () => banner('warn', 'Outcomes are behind.', SAY_THIN, 'clock') + table(),
            offline: () => off(ctx, 'Showing this comparison from 21:15.') + table(),
            disagreement: () => sayAmended() + sayLeftOut() + table(),
            abstention: () => stateCard('ban', 'Too few to compare', 'Only 3 of your 7 decisions have scored. Any rate would mislead, so none shows until more horizons pass.') + table()
          });
          return frame(ctx, { tab: 3, title: 'Compared', back: 'Journal', fresh: notPrices(ctx), actions: tb('info', 'About this view'), body, rail: none ? '' : `${counts()}${howDid()}` });
        }
      }]
    }]
  });
}
