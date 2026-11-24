/* Agents (MP-64, PH05-S02 to S07, S15). Seven Claude routes and five code workers. Manifests change only through a reviewed code change, and
   a model, tool or budget change also needs the owner. Ready is Claude on, as in Costs and the owner journeys. Denied is Claude off, so
   no Claude spend shows there (lesson 29). Manifest versions are illustrative. */
{
  const chip = (cls, t, i = '') => `<span class="chip ${cls}">${i ? ic(i, 's14') : '<span class="dot"></span>'}${t}</span>`;
  const OWN = t => chip('owner', t), OK = t => chip('fresh', t), WARN = (t, i = 'clock') => chip('stale', t, i), BAD = (t, i = 'alert') => chip('error', t, i), PLAIN = t => chip('', t);
  const para = t => `<p class="small muted">${t}</p>`;
  const tagged = (tag, t) => `<div class="aagents-tag">${tag}<span class="small muted">${t}</span></div>`;
  const OFF_WORDS = 'Claude stays off until credit is verified or you approve paid use, in Settings, with a fresh sign-in.';
  const OFF_REFUSED = 'No verified credit and no paid approval, so every Claude call is refused.';
  const NOT_PROOF = 'A reported credit is not proof, so admissible credit stays at zero.';
  const FORBID = 'No Claude route may trade, write the ledger, publish or change a forecast, promote a model, change model weights or read secrets.';
  const STEP = 'Opening the app with Face ID, or an open session, is not enough. The server checks a fresh sign-in.';
  const OFFLINE_NOTE = 'Nothing can be changed until you reconnect. No financial write offline.';
  const kept = ctx => (browser(ctx) ? tagged(proposed('MP40-Q12'), 'What a browser keeps offline is open.') : '');
  const offline = (ctx, what) => banner('', 'Offline.', `Showing ${what} from 11:20. ${OFFLINE_NOTE}`, 'wifi-off') + kept(ctx);
  const phone = ctx => ctx.kind === 'iphone' || ctx.kind === 'pwa';
  const mayNeed = ctx => (phone(ctx) ? banner('warn', 'Change this on iPad or desktop.', 'A phone reads only, so this waits for a larger screen.', 'lock') : banner('warn', 'A fresh sign-in is needed.', `${STEP} This act writes or widens, so it needs one (OWN-39). How recent a sign-in must be is still open.`, 'lock'));
  const claudeOff = () => banner('warn', 'Claude off.', OFF_WORDS, 'lock');

  /* ---------- the roster ---------- */
  const ROUTES = [['Triage', 'Haiku 5.5 · v2'], ['Event analysis', 'Opus 5.5 · v2'], ['Structured factors', 'Haiku 5.5 · v1'], ['Statement extraction', 'Haiku 5.5 · v1'], ['Explanations and the briefing', 'Sonnet 5.5 · v2'], ['Chat', 'Sonnet 5.5 · v3'], ['Evaluation judges', 'Sonnet 5.5 · v1']];
  const WORKERS = [['Grader', 'No model · grades matured forecasts'], ['Bounded calibrator', 'No model · inside the bands you approve'], ['Challenger trainer', 'No model · capped campaigns'], ['Data steward', 'No model · collection and checks'], ['Ops warden', 'No model · watches runs and queues']];
  const nameRow = (i, n, s, c) => item(lead(i), n, s, `<span class="aagents-end">${c}${ic('chev-r', 's18')}</span>`, '', false, true);
  const qual = n => (n === 'Evaluation judges' ? PLAIN('advisory_only') : OK('qualified'));
  const routeRows = (f = qual) => list(ROUTES.map(([n, s], i) => nameRow('cube', n, s, f(n, i))).join(''));
  const workerRows = (f = n => PLAIN(n === 'Data steward' ? 'running' : 'idle')) => list(WORKERS.map(([n, s]) => item(lead('sliders'), n, s, f(n))).join(''));
  const door = (n, s, i = 'layers') => item(lead(i), n, s, ic('chev-r', 's18'), '', false, true);
  const placesA = () => `${sec('Also here')}${list(door('Factors in shadow', 'Only you admit a factor', 'split') + door('Memory notes', 'What agents keep, with its source', 'layers') + door('Route costs', 'Reservations and limits', 'target') + door('Work and failures', 'What each worker is doing', 'refresh'))}`;
  const placesB = () => list(door('Versions', 'Compare, approve, roll back', 'layers') + door('Runs', 'What this route did', 'refresh') + door('Cost', 'Reservations and limits', 'target') + door('Notes', 'What this route keeps', 'layers') + door('Factors in shadow', 'Only you admit a factor', 'split'));
  const roster = (r, w) => `${sec('7 Claude routes')}${routeRows(r)}${sec('5 code workers')}${workerRows(w)}${placesA()}`;
  const runnerBox = (ctx) => {
    const line = { empty: [PLAIN('No manifest'), 'With no valid manifest, no call can start.'], error: [BAD('Failed closed', 'ban'), 'The policy store did not answer, so every tool call fails closed.'], denied: [PLAIN('credit_unverified'), `${OFF_REFUSED} ${NOT_PROOF}`], loading: [PLAIN('Reading'), 'Last good 11:20.'], stale: [WARN('From 11:12'), 'The runner state may be newer than this.'], offline: [WARN('From 11:20', 'wifi-off'), 'The runner state may be newer than this.'] }[ctx.state] || [OK('admitted'), `Claude is on because you approved paid use. Every call reserves its maximum cost first. ${NOT_PROOF}`];
    return box(`${lbl('The shared runner')}<div style="margin-top:8px">${line[0]}</div><p class="small muted" style="margin-top:8px">${line[1]}</p><div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">${proposed('CT-13')}<span class="small">Credit unknown</span></div>`);
  };
  const authority = () => box(`${lbl('What no agent can do')}<p class="small muted" style="margin-top:6px">${FORBID}</p>`) + refused('R1', 'An agent cannot write the ledger. Only the controlled writer commits, and only an exact change you approved.');
  const railRoster = ctx => `${runnerBox(ctx)}${authority()}${refused('R14', 'No setting can grant a route a tool, source, budget, infrastructure permission or approval authority.')}`;
  const rosterRegion = ctx => region(ctx, {
    what: 'The roster', rows: 7, ok: () => roster(),
    loading: () => `<div class="small muted">Last good 11:20</div>${skel(7)}`,
    empty: () => stateCard('cube', 'No manifest is active yet', 'A route with no valid manifest cannot run. Each of the 7 routes and 5 workers lands here once its manifest validates.') + routeRows(() => PLAIN('draft')),
    partial: () => banner('warn', 'Partial.', 'Routes answered. Code workers did not, so their state shows unknown, never idle.', 'clock') + roster(undefined, () => WARN('Unknown')),
    error: () => banner('fall', 'The policy store is unavailable.', 'It failed at 11:38, so every tool call fails closed. Routes keep their last valid manifest, and no call runs.', 'alert') + roster(() => BAD('Failed closed', 'ban')),
    stale: () => banner('warn', 'Stale.', 'This roster is from 11:12. A worker\'s state moves by the minute, so any of these may be older than it looks.', 'clock') + roster(() => WARN('From 11:12'), () => WARN('From 11:12')),
    offline: () => offline(ctx, 'the roster') + roster(),
    conflict: () => banner('warn', 'A manifest failed validation.', 'Chat v4 is invalid (fails closed), so the route stays on its last valid version, v3.', 'split') + roster(n => (n === 'Chat' ? BAD('invalid', 'ban') : qual(n))),
    expired: () => banner('warn', 'A qualification expired.', 'A changed model or rubric resets a route, so Evaluation judges must qualify again. It was never green past that change.', 'clock') + roster(n => (n === 'Evaluation judges' ? WARN('expired') : qual(n))),
    denied: () => claudeOff() + banner('', 'Every Claude call is refused.', `${OFF_REFUSED} Forecasts and figures run as usual, because Claude only explains.`, 'ban') + refused('R14', 'A chat message asked to widen a route. No message, memory note or setting can do that.') + roster(() => chip('illus', 'Refused'))
  });

  /* ---------- one manifest: what a route may do, as code enforces it ---------- */
  const MANIFEST = [['Model', 'Opus 5.5 · <code>claude-opus-5-5</code>'], ['Effort', 'medium, to start'], ['Mode', 'Batch'], ['Queue', 'Its own, with a dead-letter queue'], ['Tools', 'None inside the batch'], ['Outbound context', 'Derived values only'], ['Budget caps', 'Reserves its maximum first'], ['Role and key', 'Its own, in Terraform'], ['Daily limit', 'At most three analyses'], ['Prompt cache', '5 minutes · no cache-warming'], ['Batch expiry', '24 hours']];
  const manifestBox = (title = 'Event analysis · manifest v2', c = OK('active'), rows = MANIFEST) => box(`<div class="aagents-head"><b>${title}</b>${c}</div><div style="margin-top:8px">${kv(rows)}</div>`);
  const openBits = () => `${tagged(proposed('ARC-06b-O4'), 'Its prompt, its outbound context entry and its qualifying cases are not approved. Derived values only is the triage route\'s rule, DATA-DEC-12.')}${tagged(proposed('ARC-06b-O3'), 'No per-route daily cap on turns, tokens or tool calls is approved.')}${tagged(proposed('ARC-06b-O2'), 'What happens on a refusal is not approved.')}`;
  const forbidBox = () => box(`${lbl('Forbidden operations')}<div class="aagents-chips">${['Trade', 'Write the ledger', 'Publish or change a forecast', 'Promote a model', 'Change model weights', 'Read secrets'].map(t => chip('illus', t, 'ban')).join('')}</div><p class="small muted" style="margin-top:8px">The runtime checks each call against this manifest. A prompt cannot ask its way past it.</p>`);
  const qualBox = (c = OK('qualified'), t = 'Passed its suite on this model and effort. A changed model, prompt or tool runs it again, with its cost reserved first.') => box(`${lbl('Qualification')}<div style="margin-top:8px">${c}</div><p class="small muted" style="margin-top:8px">${t}</p>`);
  const manifestState = ctx => region(ctx, {
    what: 'This manifest', rows: 4, ok: () => manifestBox() + forbidBox() + openBits(),
    loading: () => manifestBox('Event analysis · manifest v2', chip('', 'Loading'), [['Last good', '11:20']]) + skel(2),
    empty: () => stateCard('cube', 'This route has no manifest', 'With no valid manifest it cannot run. Its version arrives through a reviewed code change, never from a setting.'),
    partial: () => banner('warn', 'Partial.', 'The manifest answered. Its coverage report did not, so readiness shows unknown.', 'clock') + manifestBox() + forbidBox() + openBits(),
    error: () => banner('fall', 'The policy store is unavailable.', 'It failed at 11:38, so every tool call fails closed. This is the last manifest read, at 11:20.', 'alert') + manifestBox('Event analysis · manifest v2', BAD('Failed closed', 'ban')) + forbidBox() + openBits(),
    stale: () => banner('warn', 'Stale.', 'This manifest is from 11:12. A newer version would show in Versions.', 'clock') + manifestBox() + forbidBox() + openBits(),
    offline: () => offline(ctx, 'this manifest') + manifestBox() + forbidBox() + openBits(),
    conflict: () => banner('warn', 'uncovered.', 'v3 changes the model and has no mapped case, which blocks readiness. The route stays on v2 until one exists.', 'split') + manifestBox('Event analysis · manifest v2', WARN('v3 uncovered', 'split')) + forbidBox() + openBits(),
    expired: () => banner('warn', 'Qualification expired.', 'A changed model or rubric resets it, so the route needs its suite again before any switch-on.', 'clock') + manifestBox() + forbidBox() + openBits(),
    denied: () => banner('warn', 'That read was refused.', 'A route reads only its own key parameter, and nobody reads it here. The manifest itself stays open.', 'lock') + manifestBox() + forbidBox() + openBits()
  });
  const railManifest = ctx => `${qualBox(ctx.state === 'expired' ? WARN('expired') : ctx.state === 'loading' ? PLAIN('Reading') : undefined)}${box(`${lbl('Where code decides')}<p class="small muted" style="margin-top:6px">Code picks which items reach this route, not Claude, and its output is a cited, structured record.</p>`)}`;

  /* ---------- versions: compare, approve, roll back ---------- */
  const cmpRow = (k, a, b) => `<div class="aagents-cmp${a === b ? '' : ' diff'}"><span class="small muted">${k}</span><span class="small">${a}</span><span class="small">${b}</span></div>`;
  const CMP = [['Model', 'Opus 5.5', 'Sonnet 5.5'], ['Effort', 'medium', 'medium'], ['Mode', 'Batch', 'Batch'], ['Tools', 'Unchanged', 'Unchanged'], ['Forbidden operations', 'Unchanged', 'Unchanged'], ['Qualification', 'qualified', 'not_qualified']];
  const cmpBox = (rows = CMP) => box(`<div class="aagents-cmp head"><span class="label">Event analysis</span><span class="label">v2 · active</span><span class="label">v3 · validated</span></div>${rows.map(r => cmpRow(...r)).join('')}`);
  const chain = () => `<div class="aagents-chain" role="list" aria-label="Who did what">${[['Reviewed', 'A reviewed code change'], ['Code checked', 'It validates'], ['You decide', 'Model, tool or budget']].map(([a, b]) => `<div role="listitem"><b>${a}</b><span class="small muted">${b}</span></div>`).join('')}</div>`;
  const WAIT = 'Stays open · waits for your yes';
  const bind = (hash = 'c04e…91b7', ver = 'v2') => box(`${lbl('This approval is bound to')}<div style="margin-top:8px">${kv([['Route', 'Event analysis'], ['Change', 'Opus 5.5 to Sonnet 5.5'], ['Expected version', ver], ['Payload hash', hash], ['Environment', 'Production'], ['Expires', WAIT]])}</div><div style="margin-top:8px">${proposed('CT-02')}</div>`);
  const decide = () => `<div class="aagents-acts">${act('A24', 'Approve this route change', 'primary')}</div>${para('Leaving it unapproved changes nothing. The route stays on v2. Your yes does not switch it on: a changed model resets eligibility, so v3 passes its suite first.')}`;
  const LADDER = (a = OK('active'), b = PLAIN('superseded')) => box(`${lbl('Every version')}<div class="aagents-vers"><div><b>v3</b><span class="small muted">Validated · waits for you</span>${PLAIN('validated')}</div><div><b>v2</b><span class="small muted">The previous version stays for rollback</span>${a}</div><div><b>v1</b><span class="small muted">Available for rollback</span>${b}</div></div>`);
  const versionsState = (ctx, body = () => cmpBox() + chain() + bind() + decide()) => region(ctx, {
    what: 'These versions', rows: 4, ok: body,
    loading: () => box(`${lbl('Comparing v2 and v3')}<span class="sk" style="height:96px;margin-top:10px"></span>`),
    empty: () => stateCard('check', 'No change waits on you', 'No newer version exists, and v2 stays active. A change arrives as a reviewed code change, and any model, tool or budget change then waits here.'),
    partial: () => banner('warn', 'Partial.', 'The comparison answered and the coverage report did not, so this cannot be approved yet. It stays open.', 'clock') + cmpBox() + chain() + bind(),
    error: () => banner('fall', 'v3 failed validation.', 'invalid (fails closed): the route stays on v2, its last valid version. Nothing needs you, and nothing changed.', 'alert') + cmpBox(CMP.slice(0, 4).concat([['Qualification', 'qualified', 'invalid']])),
    stale: () => banner('warn', 'Stale.', 'This comparison is from 11:12. It rechecks itself before you can approve, so approval waits for a fresh read.', 'clock') + cmpBox() + chain() + bind(),
    offline: () => offline(ctx, 'this comparison') + cmpBox() + chain() + bind(),
    conflict: () => banner('warn', 'The route moved to v4 while you read.', 'This approval expected v2, so it is refused for a stale revision. Nothing was applied, and v4 needs its own decision.', 'split') + cmpBox() + bind('c04e…91b7', 'v2, now v4'),
    expired: () => banner('warn', 'This proposal lapsed.', 'It passed its time, so nothing ran. A new reviewed change brings it back. No expiry for a route change is approved.', 'clock') + cmpBox() + tagged(proposed('CT-02'), 'Any expiry here is illustrative.'),
    denied: () => mayNeed(ctx) + cmpBox() + chain() + bind() + decide()
  });
  const railVersions = ctx => `${box(`${lbl('Rollback')}<p class="small muted" style="margin-top:6px">A manifest change is a new version, and the previous one stays available. A route whose new manifest fails validation stays on its last valid version.</p>`)}${refused('R14', 'No setting can grant a route a tool, source, budget, infrastructure permission or approval authority. Only a reviewed code change and your yes can change a manifest.')}`;

  /* ---------- memory: visible, sourced, correctable ---------- */
  const SIX = ['Show the 6-month view first', 'From chat · expires Feb 2027', PLAIN('active')];
  const FEES = ['Watch India midcap fees', 'From a filing summary · expires Jan 2027', WARN('tainted', 'alert')];
  const noteRow = ([a, b, c], x = `${act('A22', 'Correct this note')}${act('A23', 'Forget this note')}`) => `<div class="aagents-note"><div class="aagents-head"><b>${a}</b>${c}</div><span class="small muted">${b}</span>${x ? `<div class="aagents-acts">${x}</div>` : ''}</div>`;
  const notes = (rows, x) => box(rows.map(r => noteRow(r, x)).join(''));
  const NOTE_FOOT = 'A note is never a figure. It cannot replace a ledger value, an outcome, a threshold or an approved setting, and it is never evidence.';
  const memState = (ctx, rows = [SIX, FEES], who = 'Memory notes') => region(ctx, {
    what: who, rows: 3, ok: () => notes(rows) + para(NOTE_FOOT),
    loading: () => skel(2),
    empty: () => stateCard('cube', 'No memory notes', 'Anything an agent keeps about your preferences shows here first, with its source. Routes may propose notes inside their own scope.'),
    partial: () => banner('warn', 'forget_pending.', 'A forget stopped part way: the note is gone from use and stays hidden, while it retries until every derivative is cleared.', 'clock') + notes(rows.slice(0, 1)) + box(noteRow(['A note you forgot', 'Hidden · derivatives still clearing', WARN('forget_pending')], '')),
    error: () => stateCard('alert', 'Notes did not load', 'They failed at 11:38. Your notes are safe on the server, and none is used as evidence meanwhile.', bs('Try again', 'tinted', 'refresh')),
    stale: () => banner('warn', 'Stale.', 'These notes are from 11:12, so a correction may not show yet.', 'clock') + notes(rows, ''),
    offline: () => offline(ctx, 'these notes') + notes(rows, ''),
    conflict: () => banner('warn', 'corrected.', 'This note was corrected on your iPad, so it stays at the version you opened and nothing was applied. Reopen it to correct the newest.', 'split') + notes(rows.map(r => [r[0], r[1], r === rows[0] ? WARN('corrected', 'split') : r[2]]), ''),
    expired: () => banner('warn', 'Expired.', 'A note past its expiry is no longer used. It stays listed, so you can see what was kept.', 'clock') + notes(rows.map(r => [r[0], r[1].replace(/expires .*/, 'expired Oct 2026'), (r === FEES ? r[2] : '') + PLAIN('expired')])),
    denied: () => banner('warn', 'That note was refused.', 'A dev note cannot be opened in prod, because a note never crosses owner or environment scope. Your prod notes stay open.', 'lock') + notes(rows)
  });
  const railMem = () => `${box(`${lbl('Each note records')}<div style="margin-top:8px">${kv([['Scope', 'Owner and environment'], ['Author', 'Its route'], ['Taint', 'Carried into what is built from it'], ['Version', 'A correction is a new one']])}</div>`)}${refused('R6', 'Forgetting records a tombstone, and evidence is never deleted without one. Required financial audit evidence stays.')}${refused('R8', 'Multi-user administration does not exist. MP has one owner, so a note has one owner scope.')}`;

  /* ---------- cost: what is reserved, refused and known ---------- */
  const rRow = (a, b, c) => item(lead(c === 'Refused' ? 'ban' : c === '£0.22' ? 'check' : 'clock'), a, b, chip(c === 'Refused' ? 'illus' : '', c));
  const REFUSED_ROWS = () => list(rRow('Nightly explanations', 'No verified credit, Claude is off', 'Refused') + rRow('Top-5 batch', 'No verified credit, Claude is off', 'Refused') + rRow('Event analysis', 'No verified credit, Claude is off', 'Refused'));
  const MONTH = () => box(`${lbl('Cost month, day 18 of 30')}<div style="margin-top:8px">${kv([['Claude so far', '£7.06'], ['Dev', '£1.20'], ['Prod', '£5.46'], ['Local', '£0.40'], ['Top-5 scan', '£2.12 of £5']])}</div><p class="small muted" style="margin-top:8px">Gross usage, by environment. It is not split by route, because that split needs the Anthropic admin key. These dates are the cost month's, not a run's.</p>`);
  const HOLDS = () => list(rRow('Nightly explanations', 'Reserved at its worst case', '£0.34') + rRow('Event analysis, 17 Nov', 'Settled. The bill replaced the hold', '£0.22') + rRow('Top-5 batch, 14 Nov', 'Refused: £3.20 could cross the £5 cap', 'Refused'));
  const HOLDS_UNREAD = () => list(rRow('Nightly explanations', 'Reserved at its worst case', '£0.34') + rRow('Event analysis, 17 Nov', 'Settled figure not read', 'Unknown') + rRow('Top-5 batch, 14 Nov', 'Refused: £3.20 could cross the £5 cap', 'Refused'));
  const CAPS = () => box(`${lbl('Limits')}<div style="margin-top:8px">${kv([['Claude and evaluations', '£15 a month, shared across routes'], ['Admissible credit', 'Zero · credit unknown'], ['Opus', 'At most three analyses a day']])}</div><div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">${proposed('ARC-06b-O3')}${proposed('CT-13')}</div>`);
  const USAGE = () => tagged(settled('MP40-Q5: Anthropic admin key'), 'Usage by route needs this key. Without it, that split shows unavailable, never zero.');
  const STATES = () => box(`${lbl('A reservation is one of')}<div class="aagents-chips">${['reserved', 'dispatched', 'ambiguous', 'settled', 'cancel_pending', 'released', 'refused'].map(PLAIN).join('')}</div><p class="small muted" style="margin-top:8px">Every call reserves its maximum cost before it starts, and reconciles once.</p>`);
  const toCost = () => `<div>${bs('Open Costs and budgets', 'tinted', 'target')}</div>`;
  const costState = ctx => region(ctx, {
    what: 'Route costs', rows: 3, ok: () => MONTH() + HOLDS() + CAPS() + toCost(),
    loading: () => `<div class="small muted">Last good 11:20</div>${skel(3)}`,
    empty: () => stateCard('target', 'No call has been attempted', 'No reservation is on record, so there is nothing to reconcile. That is no evidence of what a route costs.') + CAPS(),
    partial: () => banner('warn', 'Partial.', 'Reservations answered. Anthropic usage did not, so what is settled shows unknown, never zero.', 'clock') + USAGE() + HOLDS_UNREAD() + CAPS(),
    error: () => banner('fall', 'Reservations did not load.', 'They failed at 11:38, so what is held right now is not on screen.', 'alert') + stateCard('alert', 'Unknown', 'An unknown or unreconciled amount is shown as unknown, never as zero.', bs('Try again', 'tinted', 'refresh')) + CAPS(),
    stale: () => banner('warn', 'Stale.', 'Reservations are from 11:12. The server admits a call, never this copy.', 'clock') + MONTH() + HOLDS() + CAPS(),
    offline: () => offline(ctx, 'route costs') + MONTH() + HOLDS() + CAPS(),
    conflict: () => banner('warn', 'A call was sent and no answer came.', 'An ambiguous call keeps its reservation until the provider\'s usage report settles it.', 'split') + box(`${lbl('Cost month, day 18 of 30')}<div style="margin-top:8px">${kv([['Nightly explanations', 'Held £0.34 · ambiguous'], ['Event analysis, 17 Nov', 'Settled £0.22'], ['Top-5 batch, 14 Nov', 'Refused']])}</div><p class="small muted" style="margin-top:8px">These dates are the cost month's, not the run's.</p>`) + toCost(),
    expired: () => banner('warn', 'A batch expired.', 'Its 24 hours passed, so its unused reservation was released and the last dated evidence stayed. It never falls back to a paid live call.', 'clock') + box(`${lbl('Cost month, day 18 of 30')}<div style="margin-top:8px">${kv([['Triage batch', 'Unused reservation released'], ['Nightly explanations', 'Held £0.34 until it reconciles']])}</div>`) + toCost(),
    denied: () => claudeOff() + REFUSED_ROWS() + para('No Claude spend shows, because none is admitted. Refused calls reserve nothing. Paid use is decided in Costs and budgets.') + CAPS() + toCost()
  });
  const railCost = () => `${STATES()}${USAGE()}${box(`${lbl('Calendars')}<p class="small muted" style="margin-top:6px">Runs on this page are dated Mon 2 to Wed 4 Nov. Cost lines are the cost month's, and say so.</p>`)}`;

  /* ---------- work and failures ---------- */
  const STATEWORDS = ['idle', 'queued', 'running', 'awaiting_owner', 'cancelled', 'dead_lettered', 'failed'];
  const workRow = (a, b, c) => nameRow('refresh', a, b, c);
  const workOK = () => list(workRow('Nightly explanations', 'Explanations and the briefing · finished', PLAIN('idle')) + workRow('Statement extraction', 'isa-oct-2026-scan.pdf · draft waits for you', OWN('awaiting_owner')) + workRow('Event analysis', 'Batch · next items picked by code', PLAIN('queued'))) + para('A route that needs you exits its worker and resumes later from a typed pending action. It never waits inside a function.');
  const workState = ctx => region(ctx, {
    what: 'Worker state', rows: 3, ok: workOK,
    loading: () => skel(3),
    empty: () => stateCard('refresh', 'No work on record', 'No route or worker has been asked to do anything yet. That is no evidence that they work.'),
    partial: () => banner('warn', 'Partial.', 'Route workers answered. Code workers did not, so their work shows unknown.', 'clock') + workOK() + list(item(lead('sliders'), 'Code workers', 'Not read', WARN('Unknown'))),
    error: () => banner('fall', 'Nothing to explain yet.', 'run_8d02 failed at 21:16, so Nightly explanations waits on it. Nothing here is dead-lettered: the one item is job_3e9a, in Runs and health.', 'alert') + list(workRow('Nightly explanations', 'Waits on run_8d02', PLAIN('queued')) + workRow('Event analysis', 'Batch · next items picked by code', PLAIN('queued'))) + `<div>${bs('Open inc_0013', 'primary', 'alert')}</div>`,
    stale: () => banner('warn', 'Stale.', 'Worker state is from 11:12, and a worker may have finished since.', 'clock') + workOK(),
    offline: () => offline(ctx, 'worker state') + workOK(),
    conflict: () => banner('warn', 'A restart met a finished result.', 'The worker resumed from its checkpoint, and one result per request id stands.', 'split') + list(workRow('Nightly explanations', 'Two attempts · one result', WARN('reconciled', 'split'))),
    expired: () => banner('warn', 'Cancelled at a step boundary.', 'The run stopped, released its unused reservation and kept its partial result as cancelled. Nothing is left waiting.', 'clock') + list(workRow('Nightly explanations', 'Partial result kept', PLAIN('cancelled'))),
    denied: () => claudeOff() + list(workRow('Nightly explanations', 'Refused before it started', chip('illus', 'Refused')) + workRow('Event analysis', 'Refused before it started', chip('illus', 'Refused')) + workRow('Statement extraction', 'isa-oct-2026-scan.pdf · This scan is queued and no model has read it.', PLAIN('queued')))
  });
  const railWork = () => `${box(`${lbl('Worker states')}<div class="aagents-chips">${STATEWORDS.map(PLAIN).join('')}</div><p class="small muted" style="margin-top:8px">A dead-lettered message is never replayed automatically beyond the ops policy.</p><div style="margin-top:8px">${proposed('CT-14')}</div>`)}${box(`${lbl('Runner states')}<div class="aagents-chips">${['credit_unverified', 'admitted', 'running', 'interrupted', 'refused_budget', 'reconciled', 'cache_cold'].map(PLAIN).join('')}</div>`)}`;

  /* ---------- factors: in shadow until they add accuracy and you say yes (MP-97) ---------- */
  const factHead = (c = OWN('Waits for your yes')) => box(`<div class="aagents-head"><b>Earnings surprise factor, v2</b>${c}</div><span class="small muted">Structured factors · Haiku 5.5, batched · shadow</span>`);
  const factEv = (abl = 'Adds accuracy over the baseline', hind = 'Prospective only') => box(`${lbl('Why it could be admitted')}<div style="margin-top:8px">${kv([['Ablation', abl], ['Compared on', 'The same dates and folds'], ['Hindsight', hind], ['Evidence hash', 'e3a9…51c0']])}</div><p class="small muted" style="margin-top:8px">No factor is admitted on extraction quality alone.</p><div class="aagents-tag" style="margin-top:8px">${proposed('SCI-D04')}<span class="small muted">The remaining feature catalogue and the staging order of campaigns are open.</span></div>`);
  const factBind = () => box(`${lbl('This approval is bound to')}<div style="margin-top:8px">${kv([['Factor', 'Earnings surprise, v2'], ['Evidence hash', 'e3a9…51c0'], ['Payload hash', '5d18…a3f2'], ['Environment', 'Production'], ['Expires', WAIT]])}</div><div style="margin-top:8px">${proposed('CT-02')}</div>`);
  const factYes = () => `<div class="aagents-acts">${act('A61', 'Admit this factor', 'primary')}</div>${para('Leaving it unadmitted changes nothing: it stays in shadow, and no forecast uses it.')}`;
  const factState = ctx => region(ctx, {
    what: 'This factor', rows: 3, ok: () => factHead() + factEv() + factBind() + factYes(),
    loading: () => factHead(chip('', 'Loading')) + skel(2),
    empty: () => stateCard('split', 'No factor has finished shadow', 'Every factor stays in shadow until the ablation shows it adds accuracy. Nothing waits on you here.'),
    partial: () => banner('warn', 'incomplete.', 'The factor answered and the ablation did not, so nothing can be admitted yet. It stays in shadow.', 'clock') + factHead(WARN('Unknown')) + factEv('Not read'),
    error: () => banner('fall', 'The ablation failed.', 'It failed at 21:16, so it is incomplete, never green. The factor stays in shadow.', 'alert') + factHead(BAD('incomplete')) + factEv('Not read'),
    stale: () => banner('warn', 'Stale.', 'This is from 11:12. It rechecks itself before you can admit it, so the control returns after that.', 'clock') + factHead() + factEv() + factBind(),
    offline: () => offline(ctx, 'this factor') + factHead() + factEv() + factBind(),
    conflict: () => banner('warn', 'hindsight_flagged.', 'A batch reached back past its cutoff. Where contamination cannot be bounded, only prospectively extracted factors count, so this evidence no longer stands.', 'split') + factHead(WARN('hindsight_flagged', 'split')) + factEv('Being rerun', 'Flagged, being rerun'),
    expired: () => banner('warn', 'late (missed the cutoff).', 'The last batch missed the +60 freeze, so the forecast used the previous frozen set, labelled with its age. A late factor is kept for the next origin, never backdated.', 'clock') + factHead(WARN('late')) + factEv(),
    denied: () => mayNeed(ctx) + factHead() + factEv() + factBind() + factYes()
  });
  const railFact = () => `${box(`${lbl('A factor is one of')}<div class="aagents-chips">${['shadow', 'frozen', 'late', 'hindsight_flagged', 'admitted', 'withdrawn'].map(PLAIN).join('')}</div><p class="small muted" style="margin-top:8px">A withdrawn factor leaves future origins. Past predictions keep their original input references. Code withdraws one by itself only on a trigger you approved in advance, and tells you, and you can withdraw an admitted one by hand with a fresh sign-in (ADM-08). None is admitted and no trigger is listed yet, so no control is drawn.</p>`)}${box(`${lbl('What a route returns')}<p class="small muted" style="margin-top:6px">Claude returns categories and cited spans only. Any number used as a model input is computed by code.</p>`)}`;

  /* ---------- Option B: one route, whole ---------- */
  const SHORT = ['Triage', 'Event analysis', 'Factors', 'Extraction', 'Explanations', 'Chat', 'Judges'];
  const picker = (on = 'Event analysis') => `<div class="aagents-pick" role="group" aria-label="Route">${SHORT.map(t => `<button type="button" class="chip${t === on ? ' owner' : ''}" aria-pressed="${t === on}">${t}</button>`).join('')}</div>`;
  const RUNS_ON = () => list(workRow('Wed 4 Nov', 'Picked by code · batch waiting', PLAIN('queued')) + workRow('Tue 3 Nov', 'Cited, structured, stored', OK('reconciled')) + workRow('Mon 2 Nov', 'Cited, structured, stored', OK('reconciled'))) + para('At most three analyses a day, picked by code. Each run links its manifest, guard decisions and reservation. Cost lines are the cost month\'s, so they sit on Cost.');
  const RUNS_OFF = () => list(workRow('Tue 3 Nov', 'Picked by code · refused before it started', chip('illus', 'Refused')) + workRow('Mon 2 Nov', 'Picked by code · refused before it started', chip('illus', 'Refused'))) + para('No call was made, so no reservation, cache or batch shows.');
  const runsState = ctx => region(ctx, {
    what: 'This route\'s runs', rows: 3, ok: RUNS_ON,
    loading: () => skel(3),
    empty: () => stateCard('refresh', 'No run yet', 'Event analysis has not been asked to read anything. Code picks the items, at most three a day.'),
    partial: () => banner('warn', 'Partial.', 'Run records answered and usage did not, so token and cache figures stay unknown. None is assumed.', 'clock') + RUNS_ON(),
    error: () => banner('fall', 'interrupted.', 'A timeout stopped the worker mid-loop with its spent cost recorded. A continuation resumes from the last stored step, rather than repeating paid calls.', 'alert') + list(workRow('Tue 3 Nov', 'Stopped mid-loop · spent cost recorded', BAD('interrupted')) + workRow('Mon 2 Nov', 'Cited, structured, stored', OK('reconciled'))) + `<div>${bs('Open Incidents and recovery', 'primary', 'alert')}</div>`,
    stale: () => banner('warn', 'Stale.', 'These runs are from 11:12.', 'clock') + RUNS_ON(),
    offline: () => offline(ctx, 'this route\'s runs') + RUNS_ON(),
    conflict: () => banner('warn', 'Sent, with no answer on record.', 'The call keeps its reservation until it is reconciled from the provider\'s usage report.', 'split') + list(workRow('Tue 3 Nov', 'ambiguous · never repeated', WARN('reconcile_required', 'split')) + workRow('Mon 2 Nov', 'Cited, structured, stored', OK('reconciled'))),
    expired: () => banner('warn', 'This batch request expired.', 'After 24 hours it left the last dated evidence in place and marked the update pending. No paid live call replaced it.', 'clock') + list(workRow('Tue 3 Nov', 'Batch · update pending', WARN('Expired'))),
    denied: () => claudeOff() + RUNS_OFF() + para('refused_budget is the same stop for a reservation that would cross the £15 allocation.')
  });
  const railRuns = () => `${box(`${lbl('Each run links')}<div style="margin-top:8px">${kv([['Manifest', 'v2'], ['Model', 'Opus 5.5'], ['Guard decisions', 'Credit, budget, tools'], ['Reservation', 'Its own hold']])}</div>`)}${refused('R1', 'A route cannot write the ledger, publish a forecast or invoke another worker. Agents never call each other.')}`;

  J.add({
    id: 'agents', title: 'Agents', stories: ['MP-101', 'MP-104', 'MP-109', 'MP-115', 'MP-85', 'MP-93', 'MP-97'],
    summary: 'What each Claude route and code worker may do, as code enforces it, and what the notes they keep say. Denied shows Claude off.',
    options: [{
      id: 'a', name: 'Roster', rec: true,
      why: 'Twelve things are drawn the same way, so an invalid manifest or a worker in trouble stands out in one look. With Claude off, every row says so at once.',
      cost: 'A route\'s manifest, versions and cost sit on separate screens. Following one route means moving between them.',
      covers: { compare: 'a-versions', decide: 'a-versions', source: 'a-route', correct: 'a-memory', config: 'a-versions', cost: 'a-cost', recover: 'a-work' },
      screens: [{
        id: 'a-roster', title: 'Roster',
        note: 'Ready is Claude on, as in Costs and the owner journeys. Denied shows Claude off: every call refused, and no Claude spend.',
        render: ctx => frame(ctx, { title: 'Agents', back: 'Admin', body: rosterRegion(ctx), rail: railRoster(ctx) })
      }, {
        id: 'a-route', title: 'Event analysis',
        note: 'Reading a manifest is the source inspection: it is what code enforces, not what a prompt asks.',
        render: ctx => frame(ctx, { title: 'Event analysis', back: 'Agents', body: manifestState(ctx) + (ctx.state === 'empty' ? '' : `<div class="aagents-acts">${bs('Versions', 'tinted', 'layers')}</div>`), rail: railManifest(ctx) })
      }, {
        id: 'a-versions', title: 'Compare versions',
        note: 'Manifest v2 to v3 and its payload hash are illustrative.',
        render: ctx => frame(ctx, { title: 'Versions', back: 'Event analysis', body: versionsState(ctx), rail: railVersions(ctx) })
      }, {
        id: 'a-factors', title: 'Factors in shadow',
        note: 'The factor, its hashes and its standing proposal are illustrative. It has no expiry of its own, so it sits outside the dated queue, as switching forward does.',
        render: ctx => frame(ctx, { title: 'Factors', back: 'Agents', body: factState(ctx), rail: railFact() })
      }, {
        id: 'a-memory', title: 'Memory notes',
        render: ctx => frame(ctx, { title: 'Memory notes', back: 'Agents', body: memState(ctx), rail: railMem() })
      }, {
        id: 'a-cost', title: 'Route costs',
        render: ctx => frame(ctx, { title: 'Route costs', back: 'Agents', body: costState(ctx), rail: railCost() })
      }, {
        id: 'a-work', title: 'Work and failures',
        render: ctx => frame(ctx, { title: 'Work and failures', back: 'Agents', body: workState(ctx), rail: railWork() })
      }]
    }, {
      id: 'b', name: 'Route by route',
      why: 'Pick one route and read its manifest, versions, runs and cost in that order. This suits working out why one route behaves as it does.',
      cost: 'There is no single view of all twelve. Code workers sit behind the same picker as a separate step, and a fault in another route does not show here.',
      covers: { compare: 'b-versions', decide: 'b-versions', source: 'b-route', correct: 'b-memory', config: 'b-versions', cost: 'b-cost', recover: 'b-runs' },
      screens: [{
        id: 'b-route', title: 'One route',
        note: 'The route picker holds all seven. Code workers have no model, so they appear as a list under it.',
        render: ctx => frame(ctx, { title: 'Agents', back: 'Admin', body: picker() + manifestState(ctx) + placesB(), rail: `${railManifest(ctx)}${sec('5 code workers')}${workerRows(ctx.state === 'partial' ? () => WARN('Unknown') : undefined)}${refused('R14', 'No setting can grant a route a tool, source, budget, infrastructure permission or approval authority.')}` })
      }, {
        id: 'b-versions', title: 'This route\'s versions',
        note: 'Manifest v2 to v3 and its payload hash are illustrative.',
        render: ctx => frame(ctx, { title: 'Versions', back: 'Event analysis', body: versionsState(ctx, () => LADDER() + cmpBox() + chain() + bind() + decide()), rail: railVersions(ctx) })
      }, {
        id: 'b-runs', title: 'This route\'s runs',
        render: ctx => frame(ctx, { title: 'Runs', back: 'Event analysis', body: runsState(ctx), rail: railRuns() })
      }, {
        id: 'b-cost', title: 'This route\'s cost',
        render: ctx => frame(ctx, { title: 'Cost', back: 'Event analysis', body: costState(ctx), rail: railCost() })
      }, {
        id: 'b-factors', title: 'Factors in shadow',
        note: 'The factor, its hashes and its standing proposal are illustrative. It has no expiry of its own, so it sits outside the dated queue, as switching forward does.',
        render: ctx => frame(ctx, { title: 'Factors', back: 'Agents', body: factState(ctx), rail: railFact() })
      }, {
        id: 'b-memory', title: 'Notes from this route',
        note: 'A note sits under the route that wrote it. "Show the 6-month view first" sits under Chat.',
        render: ctx => frame(ctx, { title: 'Notes', back: 'Event analysis', body: memState(ctx, [FEES], 'Notes from this route'), rail: railMem() })
      }]
    }]
  });
}
