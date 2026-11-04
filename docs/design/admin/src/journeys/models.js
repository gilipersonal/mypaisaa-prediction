/* Models and Evaluations (MP-64, PH04-S08, S09, S13, S17 to S20, PH05-S12, S13, PH06-S09). Only the owner promotes, restarts or switches
   forward, and only code reverts. A judge score never stands in for a realised outcome. The figures are the owner journeys', and any score
   the records do not give shows as not scored, never as a number. Every figure is illustrative. */
{
  const chip = (cls, t, i = '') => `<span class="chip ${cls}">${i ? ic(i, 's14') : '<span class="dot"></span>'}${t}</span>`;
  const OK = t => chip('fresh', t), WARN = (t, i = 'clock') => chip('stale', t, i), BAD = (t, i = 'alert') => chip('error', t, i), PLAIN = t => chip('', t), OWN = t => chip('owner', t);
  const para = t => `<p class="small muted">${t}</p>`;
  const tagged = (tag, t) => `<div class="amodels-tag">${tag}<span class="small muted">${t}</span></div>`;
  const STEP = 'Opening the app with Face ID, or an open session, is not enough. The server checks a fresh sign-in.';
  const AUTO = 'Reverts by code are marked Automatic, and never read as your decision.';
  const OFFLINE_NOTE = 'Nothing can be changed until you reconnect. No financial write offline.';
  const kept = ctx => (browser(ctx) ? tagged(proposed('MP40-Q12'), 'What a browser keeps offline is open.') : '');
  const offline = (ctx, what) => banner('', 'Offline.', `Showing ${what} from 11:20. ${OFFLINE_NOTE}`, 'wifi-off') + kept(ctx);
  const R5 = () => refused('R5', 'Code refuses a promotion with fewer than 8 scored weeks, a failed comparator, a different artefact, an expired approval or a changed evidence hash.');
  const head = (ld, t, s, c = '') => box(`<div class="amodels-head">${ld}<div><b>${t}</b><span class="small muted">${s}</span></div>${c}</div>`);
  const chain = (a = 'Code ran the trial', b = 'Code checked', c = 'You decide') => `<div class="amodels-chain" role="list" aria-label="Who did what">${[a, b, c].map(t => `<div role="listitem"><b>${t}</b></div>`).join('')}</div>`;

  /* ---------- the trial and its two comparators ---------- */
  const WEEKS = ['31 Aug', '7 Sep', '14 Sep', '21 Sep', '28 Sep', '5 Oct', '12 Oct', '19 Oct', '26 Oct'];
  const weeks = (stop = 9) => `<div class="amodels-weeks" role="img" aria-label="Nine weeks in shadow: eight scored, and the week of 12 October paused by a data outage">${WEEKS.map((w, i) => { const p = i === 6, off = i >= stop; return `<i class="${off ? 'off' : p ? 'pause' : 'on'}" title="${w}">${off ? '' : ic(p ? 'pause' : 'check', 's14')}</i>`; }).join('')}</div><div class="amodels-wk"><span class="small muted">31 Aug</span><span class="small muted">26 Oct</span></div>`;
  const CHECKED = (run = '8 of 8 scored weeks') => [['Clean running', run], ['Matured, 3 months', '0, first about 30 Nov'], ['Matured, 6 months', '0, first about 28 Feb'], ['Matured, 12 months', '0, first about 31 Aug 2027']];
  const trial = (count = '8 of 8 scored weeks', stop, foot = 'The week of 12 Oct could not be scored after a data outage, so the count paused.') => box(`<div class="amodels-head"><div>${lbl('Shadow trial')}</div><span class="small muted">${count}</span></div>${weeks(stop)}<p class="small muted" style="margin-top:8px">${foot}</p><div style="margin-top:12px">${lbl('What the 8 weeks checked')}<div style="margin-top:8px">${kv(CHECKED(count))}</div></div><p class="small muted" style="margin-top:8px">The 8 weeks check that it runs cleanly and is calibrated on what has matured, and no 3, 6 or 12-month forecast has matured yet. Years of walk-forward history carry the accuracy evidence for these horizons, and 8 weeks alone never validate 12 months.</p>`);
  const scores = (v4 = '0.188', rules = '0.197', base = '0.203') => box(`${lbl('Against both comparators · Brier score, lower is better')}<div class="amodels-score">${[['v4', v4, v4 === '0.188'], ['Rules', rules], ['Base rate', base]].map(([a, b, on]) => `<div class="${on ? 'on' : ''}"><span class="small muted">${a}</span><b>${b}</b></div>`).join('')}</div><p class="small muted" style="margin-top:8px">Walk-forward, 3, 6 and 12 months. ${rules === '0.197' ? 'Rules are scored through their frozen mapping, R0-RULEMAP, qualified for v5. ' : ''}${rules === 'Not scoreable' ? 'No rules mapping qualified, so the rules comparison is not scoreable. ' : ''}Portfolio 80% range: 24.7 points on v3, 23.5 on v4, so 1.2 points narrower.</p><div style="margin-top:8px">${proposed('SCI-D03')}</div>`);
  const correction = () => para('No outcome behind this trial was amended. A rescore adds a new score version beside the old, and nobody edits a past score.');
  const evidenceOK = () => trial() + scores() + correction();
  const evidenceState = (ctx, tail = '') => region(ctx, {
    what: 'This evidence', rows: 4, ok: () => evidenceOK() + tail,
    loading: () => head(lead('cube'), 'R2-HGB v4', 'Reading the stored scores', chip('', 'Loading')) + skel(2),
    empty: () => stateCard('cube', 'No candidate has a trial', 'A candidate reaches you only after 8 scored weeks in shadow. Nothing is waiting, so nothing here can be promoted.'),
    partial: () => banner('warn', 'incomplete.', 'The trial answered and the score table did not. A partial evaluation is reported incomplete, never green.', 'clock') + trial() + scores('Not read', 'Not read', 'Not read'),
    error: () => stateCard('alert', 'incomplete', 'The evaluation failed at 21:14, so it is reported incomplete, never green. Nothing can be approved until it loads, and v3 stays active.', bs('Try again', 'tinted', 'refresh')) + trial() + scores('Not read', 'Not scoreable', 'Not read'),
    stale: () => banner('warn', 'Showing scores from 11:12.', 'A newer scored week may exist. This proposal rechecks itself before you can approve it.', 'clock') + evidenceOK() + tail,
    offline: () => offline(ctx, 'the scores') + evidenceOK() + tail,
    conflict: () => banner('warn', 'A rescore arrived.', 'An outcome amendment made new score versions, so both show. The trial stays at the version you opened, and an evidence hash change is refused at execution.', 'split') + trial() + scores('0.188, was rescored 0.191'),
    expired: () => banner('warn', 'Evidence past its proposal.', 'The approval window ran out, so these scores stand as a record and approve nothing.', 'clock') + evidenceOK(),
    denied: () => banner('warn', 'Reading needs no fresh sign-in.', 'Scores stay open to read. Only promoting asks for one, bound to the exact payload.', 'lock') + evidenceOK() + tail
  });

  /* ---------- promote or reject ---------- */
  const BIND = [['Artefact', '4be1…09fa'], ['Calibrator', 'c7 to c8'], ['Tasks', '3, 6, 12 months'], ['Scope', 'All segments'], ['Evidence hash', '9c1e…44ab'], ['Limits', '5 points, 10%'], ['Previous safe', 'R2-HGB v3, where eligible'], ['Payload', 'a81f…60de'], ['Expires', 'Fri 6 Nov, 18:00']];
  const bound = (t = 'This approval is bound to') => box(`${lbl(t)}<div style="margin-top:8px">${kv(BIND)}</div><div style="margin-top:8px">${proposed('CT-02')}</div>`);
  const changes = () => box(`${lbl('What would change')}<div style="margin-top:8px">${kv([['Active model', 'v3 to v4, where v3 issues'], ['Calibrator', 'c7 to c8'], ['Cost a month', '£0'], ['If it slips', 'Back to v3 by itself, where v3 is eligible']])}</div><p class="small muted" style="margin-top:8px">On probation for its first 4 live weeks, it reverts after 2 bad weeks. After that, 4 weeks running worse than v3 on matured forecasts reverts it. Where v3 is not eligible, the scope pauses instead.</p><div style="margin-top:8px">${proposed('SCI-D07')}</div>`);
  const promoteHead = (c = WARN('Expires Fri 18:00')) => head(lead('cube'), 'Promote R2-HGB v4', '3, 6 and 12 months · all segments', c);
  const yesNo = () => `<div class="amodels-acts">${act('A25', 'Promote R2-HGB v4', 'primary')}${act('A26', 'Reject this candidate')}</div>${para(STEP)}${para('A rejected candidate stays readable with its evidence.')}`;
  const proof = () => box(`${lbl('The evidence')}<div style="margin-top:8px">${kv(CHECKED())}</div><div class="amodels-score">${[['v4', '0.188', true], ['Rules', '0.197'], ['Base rate', '0.203']].map(([a, b, on]) => `<div class="${on ? 'on' : ''}"><span class="small muted">${a}</span><b>${b}</b></div>`).join('')}</div><p class="small muted" style="margin-top:8px">Brier score, lower is better. Rules are scored through R0-RULEMAP, qualified for v5. No 3, 6 or 12-month forecast has matured yet.</p><div style="margin-top:8px">${proposed('SCI-D03')}</div>`);
  const OVERLAP = () => '<p class="small">The promotion binds the 5-point band and the settings change moves it to 4, so approving one sends the other back to its check.</p>';
  const SCOPES = () => box(`${lbl('Two scopes this does not settle')}<div style="margin-top:8px">${kv([['US tech, 12 months', 'Stays paused'], ['India midcap, 3 months', 'Stays on R1-LGB v1']])}</div><p class="small muted" style="margin-top:8px">R2-HGB v3's approval expired on US tech, 12 months, so it cannot be the safe fallback there. The owner journey holds a whole promotion until a safe version is approved. This draws one scope's lapse as leaving the others free: promoting neither restarts that scope nor switches India midcap forward, and each keeps its own yes.</p><div style="margin-top:8px">${proposed('POLICY-003')}</div>`);
  const impact = () => changes() + SCOPES() + OVERLAP();
  const decideOK = () => promoteHead() + chain() + proof() + impact() + yesNo() + R5();
  const phone = ctx => ctx.kind === 'iphone' || ctx.kind === 'pwa';
  const mayNeed = (ctx, t = 'A fresh sign-in may be needed.', x = 'Whether this act needs one is open.') => (phone(ctx) ? banner('warn', 'Change this on iPad or desktop.', 'A phone reads only, so this waits for a larger screen.', 'lock') : banner('warn', t, `${STEP} ${x}`, 'lock'));
  const needSignIn = (ctx, control) => (phone(ctx) ? stateCard('lock', 'Change this on iPad or desktop', `A phone reads only, so this waits for a larger screen, where it asks for a fresh sign-in. ${STEP}`, control) : stateCard('lock', 'A fresh sign-in is needed', STEP, control));
  const decideState = ctx => region(ctx, {
    what: 'This proposal', rows: 4, ok: decideOK,
    loading: () => promoteHead(chip('', 'Loading')) + box(`${lbl('Reading the proposal')}<span class="sk" style="height:60px;margin-top:10px"></span>`),
    empty: () => stateCard('check', 'Nothing waits on you here', 'No candidate is ready for you. A promotion lands here only with its evidence.'),
    partial: () => banner('warn', 'Held until the evidence is whole.', 'The approval binds an evidence hash, so nothing can be promoted while part of it is unread. Rejecting needs no evidence.', 'clock') + promoteHead() + impact() + `<div class="amodels-acts">${act('A26', 'Reject this candidate')}</div>`,
    error: () => stateCard('alert', 'The scores did not load', 'They failed at 21:14. Nothing can be approved until they load, and v3 stays active.', bs('Try again', 'tinted', 'refresh')) + promoteHead(chip('error', 'Not loaded')) + R5(),
    stale: () => banner('warn', 'This needs a fresh read first.', 'This is from 11:12. It rechecks itself before you can approve, so the control returns after that.', 'clock') + promoteHead() + impact(),
    offline: () => offline(ctx, 'this proposal') + promoteHead() + impact(),
    conflict: () => banner('warn', 'The evidence changed.', 'The hash no longer matches 9c1e…44ab, so this approval could never apply. Review the new version.', 'split') + refused('R5', 'A changed evidence hash is refused at execution. An approval never moves to a different change.') + promoteHead(WARN('Refused', 'ban')) + bs('Review the new version', 'primary'),
    expired: () => banner('warn', 'Expired. It did not apply.', 'Your approval ran out before the promotion applied, so v3 stays active and nothing changed.', 'clock') + refused('R5', 'An expired approval is refused at execution. A new one gets a new window.') + promoteHead(WARN('Expired')) + proof() + impact() + `<div class="amodels-acts">${act('A25', 'Sign in and approve again', 'primary')}</div>`,
    denied: () => needSignIn(ctx, `<div class="amodels-acts">${act('A25', 'Promote R2-HGB v4', 'primary')}</div>`) + promoteHead() + proof() + impact()
  });
  const railDecide = ctx => (['empty', 'error'].includes(ctx.state) ? box(`${lbl('Separate gates')}<p class="small muted" style="margin-top:6px">The live model gate stays separate from release approval. A judge score never stands in for a promotion decision.</p>`) : `${bound(['conflict', 'expired', 'partial', 'stale'].includes(ctx.state) ? 'What this proposed' : undefined)}${box(`${lbl('Separate gates')}<p class="small muted" style="margin-top:6px">The live model gate stays separate from release approval. A judge score never stands in for a promotion decision.</p>`)}`);

  /* ---------- reverted and paused: code acts, you restart ---------- */
  const revert = () => box(`<div class="amodels-head">${lead('refresh', 'warn')}<div><b>R1-LGB v2 reverted to v1</b><span class="small muted">India midcap, 3 months · Mon 22:20</span></div>${chip('owner', 'Automatic')}</div><div style="margin-top:8px"><table class="ht"><thead><tr><th>Matured pairs</th><th class="r">v2</th><th class="r">v1</th></tr></thead><tbody><tr><td>Week of 19 Oct</td><td class="r"><b>0.231</b></td><td class="r">0.219</td></tr><tr><td>Week of 26 Oct</td><td class="r"><b>0.228</b></td><td class="r">0.217</td></tr></tbody></table></div><p class="small muted" style="margin-top:8px">2 bad weeks on probation, so code reverted it. ${AUTO}</p><div style="margin-top:8px">${proposed('SCI-D07')}</div><div style="margin-top:8px">${kv([['To switch forward', 'R1-LGB v2 · 7e20…c4d1'], ['Calibrator', 'c5'], ['Evidence hash', 'b3f6…2a90'], ['Expected version', 'Models v22']])}</div>`);
  const pauseCard = (c = chip('owner', 'Automatic')) => box(`<div class="amodels-head">${lead('pause', 'warn')}<div><b>US tech, 12 months paused</b><span class="small muted">Previous model not eligible · Tue 21:20</span></div>${c}</div><div style="margin-top:8px">${kv([['To restart', 'R2-HGB v3 · 91d4…e7b2'], ['Calibrator', 'c7'], ['Evidence hash', 'd52a…08c3'], ['Previous safe', 'None eligible'], ['Expected version', 'Models v22']])}</div><p class="small muted" style="margin-top:8px">Its approval expired, so the scope paused rather than reverted. Other forecasts keep issuing.</p>`);
  const forward = () => `<div class="amodels-acts">${act('A27', 'Switch forward to R1-LGB v2', 'primary')}</div>`;
  const restart = () => `<div class="amodels-acts">${act('A28', 'Restart US tech, 12 months', 'primary')}</div>${tagged(proposed('POLICY-003'), 'What a restart needs as evidence is not specified yet.')}`;
  const liveOK = () => para('4 decisions wait on you. 1 paused scope waits on your restart.') + revert() + forward() + pauseCard() + restart();
  const liveState = ctx => region(ctx, {
    what: 'Live models', rows: 4, ok: liveOK,
    loading: () => `<div class="small muted">Last good 11:20</div>${skel(3)}`,
    empty: () => stateCard('check', 'Nothing is reverted or paused', 'No scope is paused, and no reverted model waits for you. A revert or a pause lands here with its reason.'),
    partial: () => banner('warn', 'Partial.', 'The revert answered and the pause record did not, so US tech, 12 months shows unknown here. Forecast status stays in Forecasts.', 'clock') + revert() + forward() + box(`<div class="amodels-head">${lead('pause')}<div><b>US tech, 12 months</b><span class="small muted">Pause record not read</span></div>${WARN('Unknown')}</div>`),
    error: () => stateCard('alert', 'The scores did not load', 'They failed at 21:14. Nothing can be approved until they load, and v1 stays active.', bs('Try again', 'tinted', 'refresh')) + pauseCard(),
    stale: () => banner('warn', 'Showing scores from 11:12.', 'A newer scored week may exist. Each proposal rechecks itself before you can approve it.', 'clock') + revert() + pauseCard(),
    offline: () => offline(ctx, 'live models') + revert() + pauseCard(),
    conflict: () => banner('', 'The evidence splits.', 'v2 trails v1 on matured forecasts and leads on walk-forward history. Neither settles it, so the decision stays yours.', 'split') + revert() + forward() + pauseCard() + restart(),
    expired: () => banner('warn', 'Expired. It did not apply.', 'The 15 minutes closed before this applied, so nothing changed. Approve again for a new window.', 'clock') + tagged(proposed('CT-02'), 'This window is drawn as proposed.') + revert() + forward() + pauseCard(),
    denied: () => mayNeed(ctx, 'A fresh sign-in is drawn here.', 'Whether these two acts need one is open.') + liveOK()
  });
  const railLive = () => `${box(`${lbl('Who does what')}<div class="amodels-who"><div><b>Code, by itself</b><span class="small muted">Reverts, and pauses a scope on a safety trigger</span></div><div><b>Only you</b><span class="small muted">Switch forward, restart a paused scope</span></div></div><p class="small muted" style="margin-top:8px">A week with no matured pairs neither counts toward a run nor breaks it. A rollback never deletes a forecast, an outcome or an audit record.</p>`)}${box(`${lbl('A live model is one of')}<div class="amodels-chips">${['probation', 'active', 'slipping', 'reverted', 'paused', 'awaiting the owner\'s restart'].map(PLAIN).join('')}</div>`)}`;

  /* ---------- the self-correction bands ---------- */
  const bandHead = (c = WARN('Expires Mon 18:00')) => head(lead('sliders'), 'Narrow a self-correction band', '5 to 4 points a week · settings v9 to v10', c);
  const bandLimits = (overlay = 'overlay active') => box(`${lbl('Today\'s bands, code only')}<div style="margin-top:8px">${kv([['Probabilities', 'At most 5 percentage points a week'], ['A signal\'s weight', 'At most 10% a month'], ['Overlay', overlay]])}</div><div style="margin-top:8px">${proposed('SCI-D10')}</div>`);
  const bandBind = () => box(`${lbl('This approval is bound to')}<div style="margin-top:8px">${kv([['Owner', 'You'], ['Environment', 'Prod'], ['Setting', 'Weekly band'], ['Value', '5 to 4 points a week'], ['Expected version', 'Settings v9'], ['Payload', '1b7c…d3e4'], ['Expires', 'Mon 9 Nov, 18:00']])}</div><div style="margin-top:8px">${proposed('CT-02')}</div>`);
  const bandWhy = () => box(`${lbl('Impact, evidence, cost and rollback')}<div style="margin-top:8px">${kv([['Expected impact', 'Slower correction'], ['Evidence', '26 weeks of replay'], ['Evidence hash', 'e40b…7d12'], ['Cost a month', '£0'], ['How to roll it back', 'A new version']])}</div><p class="small muted" style="margin-top:8px">After a miss, a forecast takes longer to adjust. A rollback makes v11 equal to v9, with its own record. Nothing is overwritten.</p>${OVERLAP()}`);
  const bandYes = () => `<div class="amodels-acts">${act('A29', 'Approve this band', 'primary')}</div>${para(STEP)}`;
  const bandOK = () => bandHead() + bandLimits() + bandWhy() + bandBind() + bandYes();
  const bandState = ctx => region(ctx, {
    what: 'The bands', rows: 3, ok: bandOK,
    loading: () => bandHead(chip('', 'Loading')) + skel(2),
    empty: () => stateCard('sliders', 'no overlay', 'No adjustment is in force, and no change to the bands waits on you.') + bandLimits('no overlay'),
    partial: () => banner('warn', 'step in flight, awaiting matured pairs.', 'One step is out and its pairs have not matured, so whether it helped is unknown.', 'clock') + bandHead() + bandLimits('step in flight, awaiting matured pairs') + bandWhy() + bandBind() + bandYes(),
    error: () => banner('fall', 'A failed overlay step.', 'It failed at 21:14, and the previous overlay stays in force. Nothing was half-applied.', 'alert') + bandHead(chip('error', 'Held')) + bandLimits('previous overlay in force'),
    stale: () => banner('warn', 'Stale.', 'This is from 11:12. It rechecks itself before you can approve.', 'clock') + bandHead() + bandLimits() + bandBind(),
    offline: () => offline(ctx, 'the bands') + bandHead() + bandLimits() + bandBind(),
    conflict: () => banner('warn', 'Refused for a stale revision.', 'Settings v10 was written at 09:01, so this approval for v9 can never apply. Nothing was applied.', 'split') + bandHead(WARN('Refused', 'ban')) + bandLimits(),
    expired: () => banner('warn', 'Expired.', 'It passed its time, so nothing changed, and the 5-point band stays. It needs a new proposal.', 'clock') + bandHead(WARN('Expired')) + bandLimits() + tagged(proposed('CT-02'), 'Any expiry here is illustrative.'),
    denied: () => needSignIn(ctx, `<div class="amodels-acts">${act('A29', 'Approve this band', 'primary')}</div>`) + bandHead() + bandLimits() + bandWhy() + bandBind()
  });
  const railBand = ctx => `${box(`${lbl('What an overlay cannot touch')}<p class="small muted" style="margin-top:6px">Learned parameters, features, rules, task definitions, the bands and the 35/40/25 weights. Anything outside a band waits for you: out of band, awaiting the owner.</p>`)}${ctx.state === 'error' ? '' : para('If scores worsen against the unadjusted version on later matured pairs, the adjustment rolls back by itself.')}${box(`${lbl('An overlay is one of')}<div class="amodels-chips">${['no overlay', 'overlay active', 'step in flight', 'rolled back', 'out of band', 'paused'].map(PLAIN).join('')}</div>`)}`;

  /* ---------- evaluations, labels and campaigns ---------- */
  const T0 = () => item(lead('check'), 'T0 deterministic', 'Offline, in CI · no model call', OK('passed'));
  const TIERS = () => list(T0() + item(lead('check'), 'T1 bounded live', 'On a prompt, tool, model or SDK change', OK('passed')) + item(lead('check'), 'T2 full qualification', 'On a model, routing or release change', OK('qualified')));
  const TIERS_OFF = () => list(T0() + item(lead('clock'), 'T1 bounded live', 'Claude is off, so it cannot run', PLAIN('not run')) + item(lead('clock'), 'T2 full qualification', 'Claude is off, so it cannot run', PLAIN('not run')));
  const JUDGE = (c = PLAIN('advisory_only'), live = true, why = '') => box(`<div class="amodels-head"><div>${lbl('Evaluation judges')}</div>${c}</div><p class="small muted" style="margin-top:8px">Too few of your labels, so judges stay advisory. A judge score never stands in for a realised outcome or a promotion decision.</p><p class="small muted" style="margin-top:8px">Labelling opens one sample at a time: one rubric per failure mode, with an unknown option. Your labels never develop the judge's prompt, and repeated examples do not add to the count.</p>${live ? `<div class="amodels-acts" style="margin-top:10px">${act('A30', 'Label calibration samples')}</div>` : `<p class="small" style="margin-top:8px">${why}</p>`}`);
  const THRESH = () => box(`${lbl('Release thresholds')}<div style="margin-top:8px">${kv([['Judge agreement', 'Not approved yet'], ['Failures that block a release', 'Not approved yet'], ['Evidence run', 'The latest T2 run']])}</div><p class="small muted" style="margin-top:8px">No number is approved (ARC-09), so none is shown. Each row carries its proposed value here before you approve it.</p><div style="margin-top:10px">${lbl('This approval is bound to')}</div><div style="margin-top:8px">${kv([['Record', 'Release thresholds, first version'], ['Environment', 'Prod'], ['Payload', 'b6e2…04d9'], ['Expires', 'Stays open · waits for your yes']])}</div><div style="margin-top:8px">${proposed('CT-02')}</div><div class="amodels-acts" style="margin-top:10px">${act('A72', 'Approve release thresholds')}</div>`);
  const CAMPAIGN = () => box(`${lbl('Training campaigns this month')}<div style="margin-top:8px">${kv([['Used', '1 of 2'], ['Fits', '84 of 96'], ['Instance-hours', '4.6 of 6'], ['State', 'completed']])}</div><p class="small muted" style="margin-top:8px">Two a month, 96 fits and 6 instance-hours each, 192 and 12 combined.</p>`);
  const EVALCOST = (off = false) => box(`${lbl(off ? 'Cost' : 'Cost · cost month, day 18 of 30')}<div style="margin-top:8px">${kv([['Claude and evaluations', '£15 a month, shared'], off ? ['Live evaluations', 'None admitted · Claude is off'] : ['Claude so far', '£7.06'], ['Promotion', '£0 a month']])}</div><p class="small muted" style="margin-top:8px">Every evaluation reserves its cost before calling. Spend lives in Costs and budgets.</p><div style="margin-top:10px">${bs('Open Costs and budgets', 'tinted', 'target')}</div>`);
  const evalsState = ctx => region(ctx, {
    what: 'Evaluations', rows: 4, ok: () => TIERS() + JUDGE() + THRESH() + CAMPAIGN(),
    loading: () => `<div class="small muted">Last good 11:20</div>${skel(4)}`,
    empty: () => stateCard('check', 'No evaluation has run', 'A run that is missing evidence is incomplete, never green. Nothing here is a pass yet.') + JUDGE(undefined, false, 'Labelling and thresholds open once a run exists to label.'),
    partial: () => banner('warn', 'incomplete.', 'A run that is missing evidence is incomplete, never green. T0 answered for 5 of 7 routes.', 'clock') + list(item(lead('clock', 'warn'), 'T0 deterministic', '5 of 7 routes · 2 not read', WARN('incomplete'))) + JUDGE(undefined, false, 'Labelling and thresholds wait until the run is whole.') + CAMPAIGN(),
    error: () => banner('fall', 'T0 failed.', 'A broken guard is caught here, before any paid model call. A failed run re-runs from the same fixture versions.', 'alert') + list(item(lead('x', 'fall'), 'T0 deterministic', 'Failed at 21:14', BAD('failed'))) + JUDGE(undefined, false, 'Labelling and thresholds wait until T0 passes.') + CAMPAIGN(),
    stale: () => banner('warn', 'stale.', 'A case is older than the manifest version it targets, so it no longer counts until it is updated.', 'clock') + list(item(lead('clock', 'warn'), 'T0 deterministic', 'Case older than manifest v3', WARN('stale'))) + JUDGE(undefined, false, 'Labelling and thresholds return after a fresh read.') + CAMPAIGN(),
    offline: () => offline(ctx, 'evaluations') + TIERS() + CAMPAIGN(),
    conflict: () => banner('warn', 'A judge and your label disagree.', 'Both are kept, with their provenance. A late result never overwrites a newer label or decision.', 'split') + TIERS() + JUDGE(WARN('Disagreement', 'split')) + THRESH(),
    expired: () => banner('warn', 'expired.', 'A changed judge, model or rubric resets eligibility, so this qualification no longer stands.', 'clock') + TIERS() + JUDGE(WARN('expired'), false, 'Labelling and thresholds wait until the judge qualifies again.') + CAMPAIGN(),
    denied: () => banner('warn', 'Claude off.', 'No verified credit and no paid approval, so every Claude call is refused, and T1 and T2 cannot run. T0 needs no model.', 'lock') + TIERS_OFF() + JUDGE(undefined, false, 'Labelling and thresholds wait until judges can run.') + CAMPAIGN()
  });
  const railEvals = ctx => `${EVALCOST(ctx.state === 'denied')}${box(`${lbl('A route is one of')}<div class="amodels-chips">${['not_qualified', 'running', 'qualified', 'advisory_only', 'incomplete', 'expired'].map(PLAIN).join('')}</div>`)}${ctx.state === 'denied' ? '' : para('Owner labels used to calibrate a judge are never used to develop its prompt.')}`;

  /* ---------- a rules version: the same trial, against the current rules, and only you approve it (PH04-S05, PH04-S18) ---------- */
  const NOMAP = 'mapping not qualified';
  const rulesHead = (c = OWN('Waits for your yes')) => head(lead('sliders'), 'Rules v6', 'Against the current rules, v5 · 8 of 8 scored weeks', c);
  const rulesScore = (a = '0.194', b = '0.197', c = '0.203', map = 'R0-RULEMAP · qualified for v6') => box(`${lbl('Against both comparators · Brier score, lower is better')}<div class="amodels-score">${[['Rules v6', a, a === '0.194'], ['Rules v5', b], ['Base rate', c]].map(([x, y, on]) => `<div class="${on ? 'on' : ''}"><span class="small muted">${x}</span><b>${y}</b></div>`).join('')}</div><div style="margin-top:8px">${kv([['Mapping', map]])}</div><p class="small muted" style="margin-top:8px">A rules change takes the same trial: 8 scored weeks, beating the current rules.</p><div class="amodels-tag" style="margin-top:8px">${proposed('SCI-D03')}<span class="small muted">${map.endsWith('not qualified') ? 'Without a qualified rules-to-probability mapping, the rules comparison is not scoreable.' : 'These scores come through the frozen rules-to-probability mapping, R0-RULEMAP.'} Rule strength itself stays a heuristic.</span></div>`);
  const rulesBind = () => box(`${lbl('This approval is bound to')}<div style="margin-top:8px">${kv([['Rules version', 'v6'], ['Mapping', 'R0-RULEMAP · qualified for v6'], ['Evidence hash', 'f20b…7d16'], ['Previous safe', 'Rules v5'], ['Expected version', 'Rules v5'], ['Payload', '7ac3…e015'], ['Expires', 'Stays open · waits for your yes']])}</div><div style="margin-top:8px">${proposed('CT-02')}</div>`);
  const rulesYes = () => `<div class="amodels-acts">${act('A62', 'Approve Rules v6', 'primary')}</div>${para('Leaving it unapproved changes nothing: v5 stays current. A faulty version is withdrawn by returning to the previous approved one, with its history kept. No record names who does that, so no control is drawn.')}`;
  const rulesState = ctx => region(ctx, {
    what: 'This rules version', rows: 3, ok: () => rulesHead() + rulesScore() + rulesBind() + rulesYes() + R5(),
    loading: () => rulesHead(chip('', 'Loading')) + skel(2),
    empty: () => stateCard('sliders', 'No rules version is on trial', 'A change to indicators, pillars or thresholds is a new rules version, and it lands here after its 8 scored weeks.'),
    partial: () => banner('warn', 'incomplete.', 'The trial answered and the score table did not, so this cannot be approved yet.', 'clock') + rulesHead(WARN('Unknown')) + rulesScore('Not read', 'Not read', 'Not read'),
    error: () => banner('fall', 'mapping not qualified.', 'No rules-to-probability mapping qualified for v6, so the rules comparison is not scoreable, and this trial waits for you. Rules v5 stays current.', 'alert') + rulesHead(WARN(NOMAP)) + rulesScore('Not scoreable', 'Not scoreable', '0.203', 'R0-RULEMAP · not qualified') + `<div class="amodels-acts">${act('A78', 'Decide what happens next', 'primary')}</div>` + para('There is no default, so nothing moves until you decide.'),
    stale: () => banner('warn', 'This needs a fresh read first.', 'This is from 11:12. It rechecks itself before you can approve, so the control returns after that.', 'clock') + rulesHead() + rulesScore() + rulesBind(),
    offline: () => offline(ctx, 'this rules version') + rulesHead() + rulesScore() + rulesBind(),
    conflict: () => banner('warn', 'The evidence changed.', 'The hash no longer matches f20b…7d16, so this approval could never apply. Review the new version.', 'split') + refused('R5', 'A changed evidence hash is refused at execution. An approval never moves to a different change.') + rulesHead(WARN('Refused', 'ban')) + rulesScore(),
    expired: () => banner('warn', 'Expired. It did not apply.', 'Your approval ran out before this applied, so Rules v5 stays current and nothing changed. Approve again for a new window.', 'clock') + tagged(proposed('CT-02'), 'This window is drawn as proposed.') + rulesHead(WARN('Expired')) + rulesScore() + rulesBind() + rulesYes(),
    denied: () => mayNeed(ctx) + rulesHead() + rulesScore() + rulesBind() + rulesYes()
  });
  const railRules = () => `${box(`${lbl('What changed')}<p class="small muted" style="margin-top:6px">Rules v6 changes one pillar's threshold. Bounded self-correction cannot change rules, and no agent can. No record names who withdraws a rules version.</p>`)}${box(`${lbl('A rule output is one of')}<div class="amodels-chips">${['signal with heuristic strength', 'no_clear_view', 'insufficient_data', 'disabled', 'shadow', 'stale input'].map(PLAIN).join('')}</div>`)}`;

  const EV_HEAD = { partial: ['incomplete', WARN('Unknown')], error: ['incomplete', BAD('incomplete')], conflict: ['evidence hash changed', WARN('Refused', 'ban')], expired: ['approval expired', WARN('Expired')] };
  const evHead = ctx => { if (['empty', 'loading'].includes(ctx.state)) return ''; const [a, c] = EV_HEAD[ctx.state] || ['ready for the owner', OWN('Shadow')]; return head(lead('cube'), 'R2-HGB v4', `${a} · artefact 4be1…09fa`, c); };

  /* ---------- Option A: the pipeline ---------- */
  const STAGES = [['candidate', 0], ['offline_qualified', 0], ['shadow', 2], ['owner_approved', 0], ['probation', 0], ['active', 2]];
  const pipeStrip = (over = {}) => `<ol class="amodels-pipe" aria-label="Stages from candidate to active">${STAGES.map(([s, n]) => { const v = over[s] ?? n; return `<li class="${v ? 'has' : ''}"><span class="small">${s}</span><b>${v}</b></li>`; }).join('')}</ol>`;
  const stageRow = (ld, t, s, c) => item(ld, t, s, `<span class="amodels-end">${c}${ic('chev-r', 's18')}</span>`, '', false, true);
  const V4 = (c = OWN('Ready for you')) => stageRow(lead('cube'), 'R2-HGB v4', 'shadow · 8 of 8 scored weeks · expires Fri 18:00', c);
  const RULES = (c = OWN('Waits for your yes')) => stageRow(lead('sliders'), 'Rules v6', 'shadow · 8 of 8 scored weeks · against the current rules', c);
  const V3 = () => stageRow(lead('fan'), 'R2-HGB v3', 'active · 3, 6 and 12 months, except below', OK('active'));
  const V1 = () => stageRow(lead('fan'), 'R1-LGB v1', 'active · India midcap, 3 months', OK('active'));
  const V2 = () => stageRow(lead('refresh', 'warn'), 'R1-LGB v2', 'rolled_back · Mon 22:20 · Automatic', WARN('reverted'));
  const USP = () => stageRow(lead('pause', 'warn'), 'US tech, 12 months', 'paused · previous model not eligible · Tue 21:20', WARN('paused', 'pause'));
  const doors = () => `${sec('Also here')}${list(stageRow(lead('sliders'), 'Self-correction bands', 'One change waits · expires Mon 18:00', '') + stageRow(lead('check'), 'Evaluations', 'Suites, judges, labels and campaigns', ''))}`;
  const stages = (o = {}) => `${sec(o.wait || 'Waiting on you')}${list((o.v4 ?? V4()) + (o.rules ?? RULES()))}${sec('Live')}${list((o.v3 ?? V3()) + (o.v1 ?? V1()))}${sec('Off the path')}${list((o.v2 ?? V2()) + (o.us ?? USP()))}${doors()}`;
  const pipeOK = () => pipeStrip() + stages() + para('No candidate is in the earlier stages, and none was rejected. A rejected candidate would stay here, readable.');
  const pipeState = ctx => region(ctx, {
    what: 'The pipeline', rows: 5, ok: pipeOK,
    loading: () => pipeStrip(Object.fromEntries(STAGES.map(([s]) => [s, '·']))) + skel(4),
    empty: () => pipeStrip({ shadow: 0, active: 0 }) + stateCard('cube', 'No model has reached a stage', 'No approved model covers anything yet, so no forecast is shown. Prices and holdings still work.'),
    partial: () => banner('warn', 'Partial.', 'Promotion records answered and scores did not, so nothing shows as ready, and no figure is counted as zero.', 'clock') + pipeStrip() + stages({ wait: 'Stage known, scores not read', v4: stageRow(lead('cube'), 'R2-HGB v4', 'shadow · scores not read', WARN('Unknown')), rules: stageRow(lead('sliders'), 'Rules v6', 'shadow · scores not read', WARN('Unknown')), v1: stageRow(lead('fan'), 'R1-LGB v1', 'Score not read', WARN('Unknown')) }),
    error: () => banner('fall', 'The evaluation failed.', 'It failed at 21:14, so R2-HGB v4 is incomplete, never green, and no rules mapping qualified for v6. Nothing moves stage on either.', 'alert') + pipeStrip() + stages({ wait: 'Not ready for you', v4: stageRow(lead('cube'), 'R2-HGB v4', 'shadow · evaluation incomplete', BAD('incomplete')), rules: stageRow(lead('sliders'), 'Rules v6', 'shadow · not scoreable · waits for you', WARN(NOMAP)) }),
    stale: () => banner('warn', 'Stale.', 'From 11:12. A stage may have moved since, and any decision rechecks first.', 'clock') + pipeOK(),
    offline: () => offline(ctx, 'the pipeline') + pipeOK(),
    conflict: () => banner('warn', 'A stage moved while you read.', 'Evidence hashes changed for R2-HGB v4 and Rules v6, so neither proposal can apply. This stays at the version you opened.', 'split') + pipeStrip() + stages({ wait: 'Not ready for you', v4: stageRow(lead('cube'), 'R2-HGB v4', 'shadow · evidence hash changed', WARN('Refused', 'ban')), rules: stageRow(lead('sliders'), 'Rules v6', 'shadow · evidence hash changed', WARN('Refused', 'ban')) }),
    expired: () => banner('warn', 'An approval expired.', 'That is why US tech, 12 months paused: R2-HGB v3\'s approval ran out there, and no earlier model was eligible.', 'clock') + pipeOK(),
    denied: () => banner('warn', 'Reading needs no fresh sign-in.', 'Promoting asks for one, bound to the exact payload. Nothing here is pre-approved.', 'lock') + pipeOK()
  });
  const railPipe = ctx => `${box(`${lbl('The path')}<p class="small muted" style="margin-top:6px">candidate, offline_qualified, shadow, owner_approved, probation, active. Any issuing stage may append paused or rolled_back, and a failed candidate is rejected.</p>`)}${R5()}${box(`${lbl('Trial states')}<div class="amodels-chips">${['shadow (week n of 8)', 'count paused', 'awaiting maturity', 'ready for the owner', 'rejected', 'promoted'].map(PLAIN).join('')}</div>`)}`;

  /* ---------- Option B: the scoreboard, scope by scope ---------- */
  const cell = (a, b, cls = '') => `<div class="${cls}"><span class="small muted">${a}</span><b>${b}</b></div>`;
  const scoreCard = (t, s, c, cells, foot = '') => box(`<div class="amodels-head"><div><b>${t}</b><span class="small muted">${s}</span></div>${c}</div><div class="amodels-score">${cells}</div>${foot ? `<p class="small muted" style="margin-top:8px">${foot}</p>` : ''}`);
  const NS = 'Not scored';
  const scAll = (c = OWN('Beats both')) => scoreCard('All segments, 3, 6 and 12 months', 'R2-HGB v4 in shadow · 8 of 8 scored weeks', c, cell('v4', '0.188', 'on') + cell('Rules', '0.197') + cell('Base rate', '0.203'));
  const scIndia = () => scoreCard('India midcap, 3 months', 'R1-LGB v1 issuing · v2 reverted, Automatic', WARN('reverted'), cell('v2', '0.228') + cell('v1', '0.217', 'on') + cell('Base rate', NS), 'Week of 26 Oct, matured pairs. Rules and base rate have no paired score here.');
  const scUS = () => scoreCard('US tech, 12 months', 'Paused Tue 21:20 · previous model not eligible', WARN('paused', 'pause'), cell('Model', NS) + cell('Rules', NS) + cell('Base rate', NS), 'A paused scope issues nothing, so nothing here can mature yet. Blank is not zero.');
  const scRules = () => scoreCard('Rules, all segments', 'Rules v6 in shadow · 8 of 8 scored weeks', OWN('Beats both'), cell('Rules v6', '0.194', 'on') + cell('Rules v5', '0.197') + cell('Base rate', '0.203'));
  const boardOK = () => scAll() + scRules() + scIndia() + scUS() + `<div class="amodels-tag">${proposed('SCI-D03')}<span class="small muted">Brier score, lower is better. How rules get a proper score is not settled.</span></div>`;
  const boardState = ctx => region(ctx, {
    what: 'The scoreboard', rows: 3, ok: boardOK,
    loading: () => `<div class="small muted">Last good 11:20</div>${skel(3)}`,
    empty: () => stateCard('fan', 'No scope has a score yet', 'Nothing is scored before maturity. A summary with too few matured forecasts says so instead of showing a rate.'),
    partial: () => banner('warn', 'incomplete.', 'The all-segments score table did not answer. A partial evaluation is reported incomplete, never green.', 'clock') + scoreCard('All segments, 3, 6 and 12 months', 'R2-HGB v4 in shadow', WARN('incomplete'), cell('v4', 'Not read') + cell('Rules', 'Not read') + cell('Base rate', 'Not read')) + scIndia() + scUS(),
    error: () => banner('fall', 'incomplete.', 'The evaluation failed at 21:14, so it is reported incomplete, never green.', 'alert') + scoreCard('All segments, 3, 6 and 12 months', 'R2-HGB v4 in shadow', BAD('incomplete'), cell('v4', 'Not read') + cell('Rules', 'Not read') + cell('Base rate', 'Not read')) + scoreCard('Rules, all segments', 'Rules v6 in shadow', WARN(NOMAP), cell('Rules v6', 'Not scoreable') + cell('Rules v5', 'Not scoreable') + cell('Base rate', '0.203'), 'Without a qualified mapping, the rules comparison is not scoreable.') + scIndia() + scUS(),
    stale: () => banner('warn', 'Showing scores from 11:12.', 'A newer scored week may exist.', 'clock') + boardOK(),
    offline: () => offline(ctx, 'the scoreboard') + boardOK(),
    conflict: () => banner('warn', 'corrected.', 'An amended outcome made a new score version, so 0.188 and 0.191 both show. Neither replaced the other.', 'split') + scoreCard('All segments, 3, 6 and 12 months', 'R2-HGB v4 in shadow', WARN('amended', 'split'), cell('v4', '0.188, was rescored 0.191', 'on') + cell('Rules', '0.197') + cell('Base rate', '0.203')) + scIndia() + scUS(),
    expired: () => banner('warn', 'An approval expired.', 'R2-HGB v3\'s approval ran out on US tech, 12 months, which is why that row is blank.', 'clock') + boardOK(),
    denied: () => banner('warn', 'Reading needs no fresh sign-in.', 'Every score stays open. Only promoting asks for one.', 'lock') + boardOK()
  });
  /* evidence first, so nothing is approved away from its proof. A state's own banner shows once, in the decision */
  const oneScope = ctx => (ctx.state === 'default' ? promoteHead() + trial() + scores() + correction() + chain() + impact() + yesNo() + R5() : decideState(ctx) + (['loading', 'empty', 'error'].includes(ctx.state) ? '' : trial() + scores(ctx.state === 'conflict' ? '0.188, was rescored 0.191' : undefined)));
  const stageRowMini = (a, b) => `<div><b>${a}</b><span class="small muted">${b}</span></div>`;
  const railBoard = ctx => `${box(`${lbl('Needs you')}<div class="amodels-stack">${stageRowMini('R2-HGB v4', 'Promote or reject · expires Fri 18:00')}${stageRowMini('Rules v6', 'Approve, if you choose')}${stageRowMini('R1-LGB v2', 'Switch forward, if you choose')}${stageRowMini('US tech, 12 months', 'Restart, if you choose')}</div>`)}${R5()}`;

  J.add({
    id: 'models', title: 'Models and evaluations', stories: ['MP-133', 'MP-136', 'MP-146', 'MP-154', 'MP-156', 'MP-159', 'MP-161', 'MP-111', 'MP-121', 'MP-157'],
    summary: 'Where each model stands, what it beat and what needs your yes. Code reverts by itself. Only you promote, restart or switch forward.',
    options: [{
      id: 'a', name: 'Pipeline', rec: true,
      why: 'Every model sits at one stage on a path that does not change, so what waits on you and what code already did are both in one place. It matches the state machine in the records.',
      cost: 'Comparing a scope against its comparators takes a tap into the model. Scopes with no model in the pipeline are easy to overlook.',
      covers: { compare: 'a-evidence', decide: 'a-decide', source: 'a-evidence', correct: 'a-evidence', config: 'a-bands', cost: 'a-evals', recover: 'a-live' },
      screens: [{
        id: 'a-pipe', title: 'Pipeline',
        render: ctx => frame(ctx, { title: 'Models', back: 'Admin', body: pipeState(ctx), rail: railPipe(ctx) })
      }, {
        id: 'a-evidence', title: 'R2-HGB v4 evidence',
        note: 'One artefact against both comparators. The Brier scores are the owner journey\'s.',
        render: ctx => frame(ctx, { title: 'R2-HGB v4', back: 'Models', body: evHead(ctx) + evidenceState(ctx) + (['default', 'denied'].includes(ctx.state) ? `<div class="amodels-acts">${bs('Go to the decision', 'primary')}</div>` : ''), rail: `${box(`${lbl('The source')}<div style="margin-top:8px">${kv([['Artefact', '4be1…09fa'], ['Calibrator', 'c8'], ['Evidence hash', '9c1e…44ab'], ['Previous safe', 'R2-HGB v3']])}</div>`)}${para('The trial writes immutable predictions with no action authority.')}` })
      }, {
        id: 'a-decide', title: 'Promote or reject',
        note: 'Home keeps v4 waiting at 11:40, so this draws no result. The owner journey\'s 09:14 decision would sit before Admin\'s now.',
        render: ctx => frame(ctx, { title: 'Promote or reject', back: 'R2-HGB v4', body: decideState(ctx), rail: railDecide(ctx) })
      }, {
        id: 'a-rules', title: 'Rules version',
        note: 'Rules v6, its score and its hashes are illustrative. It has no expiry of its own, so it sits outside the dated queue, as switching forward does.',
        render: ctx => frame(ctx, { title: 'Rules v6', back: 'Models', body: rulesState(ctx), rail: railRules() })
      }, {
        id: 'a-live', title: 'Reverted and paused',
        note: 'The count stays 4 dated decisions. A restart has no expiry, so it is named beside them, and the owner journey counts it as a fifth in its No model state.',
        render: ctx => frame(ctx, { title: 'Reverted and paused', back: 'Models', body: liveState(ctx), rail: railLive() })
      }, {
        id: 'a-bands', title: 'Self-correction bands',
        render: ctx => frame(ctx, { title: 'Bands', back: 'Models', body: bandState(ctx), rail: railBand(ctx) })
      }, {
        id: 'a-evals', title: 'Evaluations',
        note: 'Campaign usage is illustrative. The limits are POLICY-008.',
        render: ctx => frame(ctx, { title: 'Evaluations', back: 'Models', body: evalsState(ctx), rail: railEvals(ctx) })
      }]
    }, {
      id: 'b', name: 'Scoreboard',
      why: 'Each scope is read against what it has to beat, so the question is how good it is, not where it is. It suits a monthly look at the whole book of scopes.',
      cost: 'Stages are not visible as a path. Blank cells are common early on, because nothing is scored before maturity.',
      covers: { compare: 'b-board', decide: 'b-scope', source: 'b-scope', correct: 'b-scope', config: 'b-bands', cost: 'b-evals', recover: 'b-live' },
      screens: [{
        id: 'b-board', title: 'Scoreboard',
        note: 'Only scores the records give are drawn. The rest say Not scored.',
        render: ctx => frame(ctx, { title: 'Models', back: 'Admin', body: boardState(ctx), rail: railBoard(ctx) })
      }, {
        id: 'b-scope', title: 'All segments, one scope',
        note: 'Evidence and the decision are on one screen, so nothing is approved away from its proof.',
        render: ctx => frame(ctx, { title: 'One scope', back: 'Models', body: oneScope(ctx), rail: railDecide(ctx) })
      }, {
        id: 'b-rules', title: 'Rules version',
        note: 'Rules v6, its score and its hashes are illustrative. It has no expiry of its own, so it sits outside the dated queue, as switching forward does.',
        render: ctx => frame(ctx, { title: 'Rules v6', back: 'Models', body: rulesState(ctx), rail: railRules() })
      }, {
        id: 'b-live', title: 'Reverted and paused',
        note: 'The count stays 4 dated decisions. A restart has no expiry, so it is named beside them, and the owner journey counts it as a fifth in its No model state.',
        render: ctx => frame(ctx, { title: 'Reverted and paused', back: 'Models', body: liveState(ctx), rail: railLive() })
      }, {
        id: 'b-bands', title: 'Self-correction bands',
        render: ctx => frame(ctx, { title: 'Bands', back: 'Models', body: bandState(ctx), rail: railBand(ctx) })
      }, {
        id: 'b-evals', title: 'Evaluations',
        note: 'Campaign usage is illustrative. The limits are POLICY-008.',
        render: ctx => frame(ctx, { title: 'Evaluations', back: 'Models', body: evalsState(ctx), rail: railEvals(ctx) })
      }]
    }]
  });
}
