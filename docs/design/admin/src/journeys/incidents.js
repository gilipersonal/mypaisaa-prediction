/* Incidents and Recovery (MP-64, PH08). Code opens an incident, you acknowledge and resolve it, and agents cannot close one.
   Replay stays inside its bounds, a restore lands in an isolated target, and a rollback keeps its history. Limits, RPO and RTO
   are open (CT-14), so no number appears for them. Starting a release and waiving a gate happen outside MP. Stories MP-106,
   MP-108, MP-118, MP-110, MP-119, MP-122, MP-126, MP-159, MP-138, MP-167, MP-162. Every figure is illustrative. */
{
  const LINE = 'Opening the app with Face ID, or an open session, is not enough. The server checks a fresh sign-in.';
  const chip = (k, t, i = '') => `<span class="chip ${k}">${i ? ic(i, 's14') : '<span class="dot"></span>'}${t}</span>`;
  const tags = (...c) => `<div class="aincidents-tags">${c.filter(Boolean).join('')}</div>`;
  const note = t => `<p class="small muted">${t}</p>`;
  const card = inner => box(inner, 'display:grid;gap:10px;align-content:start;min-width:0');
  const head = (t, r = '') => `<div class="aincidents-head"><h3>${t}</h3>${r}</div>`;
  const opens = (i, t, s, x = '', tone = '') => item(lead(i, tone), t, s, ic('chev-r', 's18'), x, false, true);
  const row = (i, t, s, x = '', tone = '') => item(lead(i, tone), t, s, '', x);
  const ask = (t, s, c, x = '') => `<div class="aincidents-ask"><b>${t}</b>${note(s)}${x}${c}</div>`;
  const signAgain = () => `<div class="aincidents-go">${btn('Sign in again', 'primary', 'lock')}</div>`;
  const signNote = txt => `${banner('warn', 'A fresh sign-in is needed.', `${LINE} ${txt}`, 'lock')}${signAgain()}`;

  /* a control is drawn only where it can act; everywhere else the screen says why not, and what you may read stays */
  const WAIT = {
    loading: 'Waiting for the records.', offline: 'No financial write offline. Nothing can be changed until you reconnect.',
    stale: 'Held. This is from 11:12, so refresh before you act.', conflict: 'Refused for a stale revision. Refresh, then decide.',
    denied: 'Needs a fresh sign-in first.'
  };
  const held = t => `<span class="small muted aincidents-held">${ic('pause', 's16')}${t}</span>`;
  const phone = ctx => ctx.kind === 'iphone' || ctx.kind === 'pwa';
  const can = (ctx, html, o = {}) => {
    const s = ctx.state;
    if ((o.why || {})[s]) return held(o.why[s]);
    return WAIT[s] ? held(WAIT[s]) : html;
  };

  /* ---------- the two incidents, by id ---------- */
  const I12 = { id: 'inc_0012', name: 'HSBC price late', cls: 'Data quality', at: 'Tue 16:50', sub: 'Last price 14:10 · detected Tue 16:50', i: 'clock', tone: 'warn' };
  const I13 = { id: 'inc_0013', name: 'Forecast run failed', cls: 'Job failure', at: 'Tue 21:16', sub: 'Twelve Data failed at 21:16 · detected Tue 21:16', i: 'alert', tone: 'fall' };
  const I14 = { id: 'inc_0014', name: 'Production recorded lost', cls: 'Not classed', at: '', sub: 'A restored copy waits in Recovery', i: 'alert', tone: 'fall' };
  const inc = ctx => (ctx.state === 'error' ? I13 : ctx.state === 'conflict' ? I14 : I12);
  const ST = {
    open: chip('error', 'Open', 'alert'), ack: chip('stale', 'Acknowledged', 'clock'), done: chip('', 'Resolved', 'check'), again: chip('error', 'Reopened', 'refresh')
  };
  const statusOf = (ctx, i) => (i === I13 || i === I14 ? ST.open : ctx.state === 'empty' ? ST.done : ctx.state === 'conflict' ? ST.again : ST.ack);
  const incRow = (ctx, i) => opens(i.i, i.name, `${i.id} · ${i.sub}`, `${tags(statusOf(ctx, i), i === I14 ? proposed('CT-14') : '', ctx.state === 'partial' ? chip('stale', 'Run link unavailable', 'clock') : '')}`, i.tone);
  const incRows = ctx => list((ctx.state === 'error' ? [I13, I12] : ctx.state === 'conflict' ? [I14, I12] : [I12]).map(i => incRow(ctx, i)).join(''));
  const incHead = ctx => {
    const i = inc(ctx);
    return card(`${head(i.name, tags(statusOf(ctx, i), i === I14 ? proposed('CT-14') : ''))}${kv([['Incident', i.id], ['Class', i.cls], ['Opened by', i.at ? `Code · ${i.at}` : 'Code'], ['Environment', 'Production']])}`);
  };
  const who = () => note('Code opens incidents. You acknowledge and resolve them. Agents cannot close an incident.');

  /* what stays in view whatever the list says, because a quiet list proves nothing */
  const still = ctx => {
    const s = ctx.state, run = { error: ['Mon 21:15 · cutoff 22:00 · issued 22:15', 'run_8c41 · last good'], stale: ['Tue 21:15 · cutoff 22:00 · issued 22:15', 'run_8d02 · as read at 11:12'], conflict: ['Tue 21:15 · cutoff 22:00 · issued 22:15', 'run_8d02 · reconcile_required, counted as neither'] }[s] || ['Tue 21:15 · cutoff 22:00 · issued 22:15', 'run_8d02 · succeeded'];
    return card(`${head('Still watched')}${kv([['US forecast run', run[0]], ['Its record', run[1]], ...(s === 'conflict' ? [['Production', 'Recorded lost · inc_0014']] : []), ['Restore exercise', 'Passed · Sun 1 Nov'], ['Its record', 'rx_0007'], ['Release', 'rel_0031']])}${note('Silence is not a sign that nothing is wrong, so these always show.')}`);
  };
  const classes = ctx => {
    const s = ctx.state, none = ['stale', 'partial', 'offline'].includes(s) ? 'None seen' : 'None open';
    return card(`${head('By class')}${kv([['Data quality', s === 'empty' ? none : s === 'conflict' ? '1 reopened' : '1 acknowledged'], ['Job failure', s === 'error' ? '1 open' : none], ['Billing', none], ['System security', none], ...(s === 'conflict' ? [['Not classed', '1 open · inc_0014']] : [])])}${note('Financial risk is a separate class. Those alerts sit in your inbox, not here. Material means a line you set is crossed, and each line\'s value is still yours to set.')}${tags(proposed('CT-18'))}`);
  };

  /* every topic has one sentence per state, drawn the same by both options */
  const KEYS = ['empty', 'partial', 'error', 'stale', 'offline', 'conflict', 'expired', 'denied'];
  const view = (ctx, T, ok) => {
    const o = { what: T.what, ok, loading: () => `${note(T.loading)}${skel(T.rows || 3)}` };
    KEYS.forEach(k => { o[k] = () => (typeof T[k] === 'function' ? T[k](ctx) : T[k]) + ok(); });
    return region(ctx, o);
  };

  const T_LIST = {
    what: 'Incidents', rows: 2, loading: 'Reading incidents. The list from 11:20 comes back if this fails.',
    empty: banner('', 'No incident is open.', 'Silence is not a sign that nothing is wrong, so the last run and the last restore stay in view.', 'check'),
    partial: banner('warn', 'The UK run record did not answer.', 'So inc_0012 shows no run link, which is unknown, not clear. Alerts and sources answered.', 'clock'),
    error: banner('fall', 'Twelve Data failed at 21:16.', 'Last good run Mon 22:15 · cutoff 22:00. One outage, one incident, with its symptoms linked. inc_0013 waits for you to acknowledge it.', 'alert'),
    stale: banner('warn', 'From 11:12.', 'The index is lagging, so an incident opened after 11:12 would not show here. A quiet list proves nothing.', 'clock'),
    offline: banner('', 'Offline.', 'Showing incidents from 11:20. No financial write offline, and nothing can be changed until you reconnect.', 'wifi-off'),
    conflict: `${banner('warn', 'Two records changed while you read.', 'Production is recorded lost, so inc_0014 is open and Recovery holds the copy. inc_0012 also reopened, because the fault came back.', 'split')}${tags(proposed('CT-14'))}`,
    expired: `${banner('warn', 'A replay request expired.', 'Its time ran out on inc_0012, so nothing ran. It needs a new request.', 'clock')}${tags(proposed('CT-02'))}`,
    denied: banner('warn', 'Reading stays open.', 'Acknowledging, resolving and replaying each say what they need before they run, and nothing is pre-approved.', 'lock')
  };

  /* ---------- the incident's own record ---------- */
  const T_DET = {
    what: 'This incident', rows: 4, loading: 'Reading this incident. Its id and class stay above.',
    empty: banner('', 'Nothing is open.', 'This is the last incident, resolved with your recorded resolution. It reopens if the fault recurs.', 'check'),
    partial: banner('warn', 'The UK run record did not answer.', 'The timeline below is whole. Its run link is unknown until it does.', 'clock'),
    error: banner('fall', 'This incident waits on you.', 'Twelve Data failed at 21:16. Last good run Mon 22:15 · cutoff 22:00. Reads stay open while it is unresolved.', 'alert'),
    stale: banner('warn', 'From 11:12.', 'The index is lagging, so a later step may have landed. Nothing here is newer than that.', 'clock'),
    offline: banner('', 'Offline.', 'This timeline is from 11:20. No financial write offline, and nothing can be changed until you reconnect.', 'wifi-off'),
    conflict: `${banner('warn', 'Production is recorded lost.', 'inc_0014 waits for you to acknowledge it, and the switch sits in Recovery. inc_0012 also reopened, and shows below.', 'split')}${tags(proposed('CT-14'))}`,
    expired: ctx => `${phone(ctx) ? banner('warn', 'A resolution did not land in time.', 'Nothing was recorded, so inc_0012 stays Acknowledged. Resolving happens on iPad or desktop.', 'clock') : banner('warn', 'Your resolution did not land in time.', 'The request passed its time, so nothing was recorded and inc_0012 stays Acknowledged. Your words stay in the box.', 'clock')}${tags(proposed('CT-02'))}`,
    denied: ctx => `${signNote('This timeline stays readable.')}${tags(proposed('CT-01'))}`
  };
  const field = (ctx) => `<label class="aincidents-fieldl"><span class="label">Recorded resolution</span><textarea class="aincidents-field" rows="2" aria-label="Recorded resolution">${ctx.state === 'expired' ? 'Yahoo holds no newer price. Closing this as a source gap.' : ''}</textarea></label>`;
  const resolveTool = ctx => `${phone(ctx) ? '' : field(ctx)}${can(ctx, act('A75', 'Resolve this incident', 'primary'))}`;
  const ackTool = ctx => can(ctx, act('A40', 'Acknowledge', 'primary'));
  const NOTICE = 'A notice went out through Web Push. That records an attempt, not that you read it, and your inbox keeps it either way.';
  /* ADM-23, "Code marks it": code marks an incident mitigated when its checks show the fault has stopped, so no control is drawn for it */
  const MIT = 'Code marks it mitigated when its checks show the fault has stopped. You still acknowledge and resolve.';
  /* ADM-06, "No, keep it apart": a late price is a data quality incident, not a missed collection. UK close 16:35, so the +40 retry ran at 17:15 */
  const LATE = 'A late price is not a missed collection, so code re-runs nothing. The +40 retry, at 17:15, was the only automatic one and found no newer price, and a newer one arrives at the next check.';
  const pt = (st, t, s, x = '') => `<li class="${st}"${st === 'now' ? ' aria-current="step"' : ''}><span class="pt">${st === 'done' ? ic('check', 's14') : st === 'warn' ? ic('alert', 's14') : ''}</span><div style="min-width:0"><b>${st === 'done' ? '<span class="sr">Done: </span>' : st === 'now' ? '<span class="sr">Now: </span>' : ''}${t}</b><p>${s}</p>${x ? `<div class="x">${x}</div>` : ''}</div></li>`;
  const tl = (name, rows) => `<ol class="aincidents-tl" aria-label="${name}">${rows.join('')}</ol>`;
  const ack14 = () => act('A40', 'Acknowledge', 'primary');
  const close14 = ctx => `${phone(ctx) ? '' : field(ctx)}${act('A75', 'Resolve this incident', 'primary')}`;
  const CLOSE14 = 'A switch does not close this. An incident closes only with a recorded resolution, and only you record it.';
  const again12 = (ctx, inner) => card(`${head('HSBC price late', ST.again)}${kv([['Incident', 'inc_0012'], ['Class', 'Data quality']])}${note('You opened this as Acknowledged, and the fault came back. Your view stays at that version, and nothing was applied.')}${inner}`);
  function timeline(ctx, i = inc(ctx)) {
    const s = ctx.state;
    if (i === I14) return tl('What happened to inc_0014', [
      pt('done', 'Detected', 'How production came to be recorded lost is not recorded.', tags(proposed('CT-14'))),
      pt('now', 'Acknowledge', 'Waiting for you.', ack14()),
      pt('', 'Switch in Recovery', 'Only you approve it, and only with a reconciled copy.', list(opens('db', 'Recovery', 'rx_0007 · as of Sun 1 Nov'))),
      pt('', 'Resolve', CLOSE14, close14(ctx))
    ]);
    if (s === 'error') return tl('What happened to inc_0013', [
      pt('done', 'Detected', `Code opened it · Tue 21:16. ${NOTICE}`),
      pt('now', 'Acknowledge', 'Waiting for you.', ackTool(ctx)),
      pt('', 'Mitigate', `Code re-runs a missed collection, within its bound. ${MIT}`, tags(proposed('CT-14'))),
      pt('', 'Resolve', 'You close it, with a recorded resolution.')
    ]);
    if (s === 'empty') return tl('What happened to inc_0012', [
      pt('done', 'Detected', 'Code opened it · Tue 16:50 · last price 14:10'),
      pt('done', 'Acknowledged', 'You · Tue 17:05'),
      pt('done', 'Mitigated', 'Code · its next check found a newer HSBC price, so it marked this mitigated.'),
      pt('done', 'Resolved', 'You, with a recorded resolution: HSBC prices are back from Yahoo.')
    ]);
    return tl('What happened to inc_0012', [
      pt('done', 'Detected', 'Code opened it · Tue 16:50 · last price 14:10'),
      pt('done', 'Acknowledged', 'You · Tue 17:05'),
      s === 'conflict' ? pt('warn', 'Reopened', 'Code · the fault recurred, so the incident reopened by itself.') : pt('now', 'Mitigate', `${LATE} ${MIT}`),
      pt('', 'Resolve', 'You close it, with a recorded resolution. It reopens if the fault recurs.', resolveTool(ctx))
    ]);
  }

  /* ---------- evidence, linked by id ---------- */
  const EV = {
    alert: ['alert', 'Alert', 'HSBC price is late · Last price 14:10'],
    run: ['refresh', 'Run', 'run_8cf7 · UK · Tue 16:50 · HSBC late'],
    job: ['layers', 'Job', 'UK collect · found no newer price'],
    trace: ['search', 'Trace', 'Linked from run_8cf7'],
    source: ['db', 'Source', 'Yahoo · HSBA · XLON'],
    model: ['cube', 'Model', 'None linked to this incident']
  };
  const evRows = ctx => {
    const s = ctx.state;
    const rows = {
      ...EV,
      ...(s === 'error' ? {
        alert: ['alert', 'Alert', 'Missed forecast run, with the stalled collector linked'], run: ['refresh', 'Run', 'run_8d02 · failed at 21:16'], job: ['layers', 'Job', 'job_3e9a · collect · failed'],
        trace: ['search', 'Trace', 'tr_51c2'], source: ['db', 'Source', 'Twelve Data'], model: ['cube', 'Model', 'None. No forecast was written by this run']
      } : {}),
      ...(s === 'partial' ? { run: ['refresh', 'Run', 'run_8cf7 · UK · not read'], job: ['layers', 'Job', 'UK collect · not read'], trace: ['search', 'Trace', 'Not read, it links from run_8cf7'] } : {}),
      ...(s === 'conflict' ? { source: ['db', 'Source', 'Two sources disagree · both hashes kept'] } : {})
    };
    const out = [...Object.values(rows)].map(([i, t, sub]) => (t === 'Model' ? row(i, t, sub) : opens(i, t, sub, '', s === 'error' || (s === 'partial' && ['Job', 'Run', 'Trace'].includes(t)) ? 'warn' : '')));
    if (s === 'error') out.splice(3, 0, opens('info', 'Request', 'req_a90f · the failed call', '', 'warn'));
    if (s === 'denied') out.push(row('shield', 'Audit', 'Permission denied, not empty', tags(chip('stale', 'Denied', 'lock')), 'warn'));
    return list(out.join(''));
  };
  /* each run is read against the last one on its own market's clock, so the change is a row */
  const twoRuns = ctx => {
    if (ctx.state === 'error') return card(`${head('Monday and Tuesday, US')}<div class="aincidents-two"><div>${lbl('run_8c41')}${kv([['Started', 'Mon 21:15'], ['Cutoff', '22:00'], ['Result', 'Succeeded'], ['Priced', '3 of 3']])}</div><div>${lbl('run_8d02')}${kv([['Due', 'Tue 21:15'], ['Cutoff', 'Held at Mon 22:00'], ['Result', 'Failed at 21:16'], ['Priced', 'Not known']])}</div></div>`);
    const unread = ctx.state === 'partial';
    return card(`${head('Monday and Tuesday, UK')}<div class="aincidents-two"><div>${lbl('run_8bf3')}${kv([['Run', 'Mon 16:50'], ['Close', '16:35'], ['Result', unread ? 'Unknown' : 'Succeeded'], ['HSBC', unread ? 'Not read' : 'Priced to the 16:35 close']])}</div><div>${lbl('run_8cf7')}${kv([['Run', 'Tue 16:50'], ['Close', '16:35'], ['Result', unread ? 'Unknown' : 'Succeeded'], ['HSBC', unread ? 'Not read' : 'Late · last price 14:10']])}</div></div>`);
  };
  const T_EV = {
    what: 'The evidence', rows: 5, loading: 'Reading the linked records.',
    empty: banner('', 'This incident is resolved.', 'Its evidence stays linked, and nothing here was removed when it closed.', 'check'),
    partial: banner('warn', 'The UK run record did not answer.', 'run_8cf7, its collect job and its trace are not read, and neither is Monday\'s run_8bf3, which is unknown, not clear. The alert, the source and the model link opened.', 'clock'),
    error: banner('fall', 'Twelve Data failed at 21:16.', 'The failed call has its own request and trace, so you can follow it. Nothing here shows a secret or a holding.', 'alert'),
    stale: banner('warn', 'From 11:12.', 'The index is lagging, so a link may have moved. Each record opens at its own time.', 'clock'),
    offline: banner('', 'Offline.', 'These links are from 11:20. Following one needs a connection, and the ids stay readable.', 'wifi-off'),
    conflict: banner('warn', 'Two sources disagree.', 'The gap is past tolerance, so this is a data quality fault. Both hashes are kept and neither is dropped.', 'split'),
    expired: `${banner('warn', 'A replay request expired.', 'Its time ran out, so nothing ran, and HSBC stays late. The evidence below stands as it was.', 'clock')}${tags(proposed('CT-02'))}`,
    denied: banner('warn', 'One link was refused.', 'The Audit link came back permission denied, so it shows as denied, not as empty. Everything else here stays readable.', 'lock')
  };
  const evRail = () => `${card(`${head('What this record holds')}${note('Ids and references only. An incident carries no holdings or secrets, and each link opens its own record.')}`)}${refused('R3', 'A stored price cannot be edited, by you or by anyone. A missing price stays missing.')}${refused('R4', 'A frozen cutoff cannot be moved and an origin cannot be backdated, by you or by anyone.')}`;

  /* ---------- replay: what code may do by itself, what needs you, what is refused ---------- */
  const UK = 'HSBC price, Tuesday UK collection', WHY12 = 'inc_0012 · late price, no newer price found', RETRIED = 'Retried at +40, 17:15';
  const REQ = {
    default: [RETRIED, 'stale', UK, WHY12, '1', 'Not needed: the +40 retry is the only automatic one'],
    error: ['Bound reached: escalated', 'error', 'Tuesday collect job', 'inc_0013 · Twelve Data failed at 21:16', 'All of job_3e9a', 'Awaiting you'],
    conflict: ['Refused', 'error', UK, WHY12, '1', 'Refused on recheck'],
    expired: ['Expired', 'stale', 'The whole Tuesday UK collection', WHY12, 'All of it', 'Ran out, so nothing ran'],
    denied: ['Awaiting you', 'stale', 'The whole Tuesday UK collection', WHY12, 'All of it', 'Awaiting you, with a fresh sign-in'],
    empty: [RETRIED, '', UK, WHY12, '1', 'None asked. A newer price came at the next check'],
    partial: ['Held', 'stale', UK, WHY12, '1', 'Not known until the UK run answers'],
    stale: ['As read at 11:12', 'stale', UK, WHY12, '1', 'Not known since 11:12'],
    offline: ['As read at 11:20', 'stale', UK, WHY12, '1', 'Not known since 11:20']
  };
  const reqOf = ctx => REQ[ctx.state] || REQ.default;
  const reqKv = ctx => { const r = reqOf(ctx); return kv([['Scope', r[2]], ['Reason', r[3]], ['Items', r[4]], ['Job', ctx.state === 'error' ? 'job_3e9a' : 'UK collect, Tue 16:50'], ['Environment', 'Production'], ['Your approval', r[5]]]); };
  const reqChip = ctx => { const r = reqOf(ctx); return chip(r[1], r[0], r[1] === 'error' ? 'alert' : r[1] ? 'clock' : 'check'); };
  const KEYSAFE = 'It keeps the original business id, with a new attempt and new trace links, so it cannot commit or notify twice. It rechecks permissions, retention, deletion and the latest config first.';
  const AUTO = ['Retry an idempotent job, within its bounds', 'Replay a dead-letter item, up to a limit', 'Re-run a missed collection', 'Resume a durable workflow'];
  const autoCard = () => card(`${head('Code does these by itself', proposed('CT-14'))}${list(AUTO.map(a => row('refresh', a, 'Its limit is not set yet')).join(''))}${note('A late price is not a missed collection, so it is not re-run.')}${note('A replay that keeps failing stops at its bound and escalates to an incident. Agents have no recovery authority.')}`);
  /* an approve exists only on a request awaiting you, beside the exact thing it binds; everywhere else the screen says why not */
  const AWAITS = ctx => ctx.state === 'error';
  const WHYNOT = {
    default: 'A late price is not a missed collection, so code re-runs nothing and nothing waits on you. A newer price arrives at the next check.',
    empty: 'No request is open, so there is nothing to approve.',
    partial: 'Held. This request cannot be checked against its collect job yet.',
    expired: 'Refused. This approval ran out, and a new request needs a new approval.',
    conflict: 'Refused on recheck. The changed config needs a new request.'
  };
  const bind = rows => `<div class="aincidents-bind">${kv(rows)}</div>`;
  const askBroad = ctx => ask('Broad replay of job_3e9a', 'Beyond the allowlist. You approve exactly this, and any changed line needs a new approval.', `${act('A41', 'Approve this replay', 'primary')}${act('A60', 'Decline this replay')}`, `${bind([['Owner', 'You'], ['Environment', 'Production'], ['Action', 'Broad replay, all of job_3e9a'], ['Payload', '3c9e…a1f4'], ['Expected config', 'Settings v9'], ['Expires', 'Not set yet']])}${tags(proposed('CT-02'))}`);
  const askFin = ctx => ask('Financial reprocessing, ISA statement, Oct 2026', 'Nothing is visible and your ledger stays at revision 213. Only the controlled writer commits this, and only this exact change.', `${act('A13', 'Approve reprocessing')}${act('A60', 'Decline reprocessing')}`, `${bind([['Owner', 'You'], ['Environment', 'Production'], ['Selection', '9 of 11 rows · draft revision 6'], ['Selected rows hash', '7f3a…c21e'], ['Expected ledger', 'Revision 213'], ['Starts', 'Within 15 minutes of your approval']])}${note('This records what already happened at your broker. It places no trade.')}`);
  const declined = () => note('Declining closes the request as declined, on the record. Nothing runs.');
  const whyNot = ctx => `${note('A broad replay, a new paid external call or financial reprocessing needs you. Each shows its exact change here first, and only then asks.')}${ctx.state === 'offline' ? refused('R16', 'No financial write offline. It is refused until you reconnect, with this reason on the record.') : held(WHYNOT[ctx.state] || WAIT[ctx.state])}`;
  const asks = ctx => (AWAITS(ctx) ? `${askBroad(ctx)}${askFin(ctx)}${declined()}${note(LINE)}` : whyNot(ctx));
  const NEEDS = { default: 'Nothing waits on you', error: 'These need you', denied: 'Held until you sign in', partial: 'Held until the UK run answers', stale: 'Held until this refreshes', offline: 'Held until you reconnect', expired: 'Nothing to approve', conflict: 'Nothing to approve' };
  const needsYou = ctx => card(`${head(NEEDS[ctx.state] || 'Nothing waits on you')}${asks(ctx)}`);
  const never = () => `${refused('R12', 'A replay never crosses environments. Prod items stay in prod and dev items stay in dev.')}${refused('R1', 'A replay never edits the ledger. Only the controlled writer commits to it.')}`;
  const costCard = ctx => card(`${head('What this spends')}${kv([['Twelve Data credits', '55 a minute'], ['Normal work', '45 a minute'], ['Kept for incidents and retries', '10 a minute'], ['This request', ctx.state === 'error' ? 'job_3e9a, on Twelve Data' : 'UK listings read Yahoo, not these credits'], ['New paid call', ctx.state === 'error' ? 'Yours to approve' : 'None in this request']])}${note('This shows Wed 4 Nov. The cost month, day 18 of 30, is its own illustrative calendar, so reconciling sits in Costs and budgets.')}${list(opens('target', 'Costs and budgets', 'Estimate, usage and bill, and the runs behind a spike'))}`);
  const T_REP = {
    what: 'This replay', rows: 4, loading: 'Reading the replay request and its allowlist.',
    empty: banner('', 'Nothing to replay.', 'No request is open and nothing is awaiting you. The last was the +40 retry on HSBC, and nothing committed or notified twice.', 'check'),
    partial: banner('warn', 'The UK run record did not answer.', 'This request cannot be checked against its collect job, so it is held.', 'clock'),
    error: banner('fall', 'This replay stopped at its bound.', 'It kept failing, so it stopped and escalated to inc_0013. It will not run again by itself.', 'alert'),
    stale: banner('warn', 'From 11:12.', 'The request may have moved on, so it is held until this refreshes.', 'clock'),
    offline: banner('', 'Offline.', 'This request is from 11:20. No financial write offline, and nothing can be changed until you reconnect.', 'wifi-off'),
    conflict: banner('warn', 'Refused on recheck.', 'The latest config changed after this request was written, so it never ran. Nothing committed or notified twice.', 'split'),
    expired: `${banner('warn', 'Your approval ran out.', 'The time passed before this started, so nothing ran. It needs a new request and a new approval.', 'clock')}${tags(proposed('CT-02'))}`,
    denied: ctx => signNote('This request and its rules stay readable.')
  };

  /* ---------- restore, rehearsal and release ---------- */
  const CLASSES = ['Ledger', 'Audit', 'Approvals', 'Originals', 'Forecasts and outcomes', 'Model pointers'];
  const rxState = ctx => ({ error: chip('error', 'Mismatch', 'alert'), expired: chip('stale', 'Overdue', 'clock'), empty: chip('', 'Scheduled', 'clock'), stale: chip('stale', 'As read at 11:12', 'clock') }[ctx.state] || chip('', 'Reconciled', 'check'));
  const rxRows = ctx => {
    const s = ctx.state, val = s === 'error' ? c => (c === 'Ledger' ? 'Mismatch' : 'Not finished') : s === 'empty' ? () => 'No result yet' : () => 'Reconciled';
    return kv(CLASSES.map(c => [c, val(c)]));
  };
  const rxLine = ctx => ({
    error: 'The exercise after rx_0007 stopped here. rx_0007, Sun 1 Nov, is still the last pass.',
    expired: 'An import change landed after rx_0007, and rel_0031 went out with no exercise since, so it is overdue. Overdue means a month ended with no exercise, or a change has none by the next release.',
    empty: 'rx_0007, Sun 1 Nov, is still the last pass. The next is scheduled, and the rows below are its own.'
  }[ctx.state] || 'rx_0007 · passed Sun 1 Nov · in an isolated target, which took no authority.');
  const restoreCard = ctx => card(`${head('Restore exercise', rxState(ctx))}${note(rxLine(ctx))}${rxRows(ctx)}${note('Reconciled by counts, hashes and financial balances. Tombstones are applied before restored content is readable, so deleted content never comes back.')}${tags(proposed('CT-04'))}`);
  const objectives = () => card(`${head('Recovery point and time')}${note('Agreed per record class, and none is agreed yet, so no figure shows.')}${tags(proposed('CT-14'))}`);
  /* a switch exists only when production is recorded lost and a reconciled copy waits (Conflicting), bound to that copy */
  const NOSWITCH = {
    default: 'Production is not lost, so there is nothing to switch.', partial: 'Production is not lost, so there is nothing to switch.',
    error: 'No reconciled copy waits, so there is nothing to switch to.', empty: 'Production is not lost, so there is nothing to switch.', denied: 'Production is not lost, so there is nothing to switch.',
    expired: 'rx_0007 no longer covers what is stored now, so it is no target. A new exercise comes first.'
  };
  const switchTool = ctx => {
    if (ctx.state !== 'conflict') return held(NOSWITCH[ctx.state] || WAIT[ctx.state]);
    return `${bind([['Copy', 'rx_0007'], ['As of', 'Sun 1 Nov'], ['Ledger in the copy', 'Revision 213'], ['Gap', 'Anything recorded after Sun 1 Nov'], ['Environment', 'Production'], ['Payload', '5d2e…09bc'], ['Expires', 'Not set yet']])}${note('No recovery point is agreed, so the gap has no target. How production comes to be recorded lost is not recorded either.')}${tags(proposed('CT-14'), proposed('CT-02'))}${act('A42', 'Approve this switch', 'primary')}${act('A60', 'Decline this switch')}${declined()}`;
  };
  const switchCard = ctx => card(`${head('Switch to a restored copy')}${note('Only if production is lost. The copy takes no authority until reconciliation passes and you approve the switch.')}${switchTool(ctx)}${refused('R11', 'Nothing restores over production. A destructive restore into prod is refused.')}`);
  const KINDS = [['App, by Lambda alias', 'Passed'], ['Contract, old reader still works', 'Passed'], ['Model and calibration revert', 'Passed'], ['Failed import reversal', 'Passed']];
  const rehearse = ctx => {
    const rows = KINDS.map(([k, v], i) => [k, ctx.state === 'partial' && i === 1 ? 'Unknown' : v]);
    return card(`${head('Rollback rehearsals', ctx.state === 'partial' ? chip('stale', 'Partial', 'clock') : chip('', 'Passed', 'check'))}${kv(rows)}${note('Rehearsed on dev. A rollback never deletes a forecast, an outcome or an audit record.')}${refused('R13', 'A rollback is never rehearsed in prod.')}`);
  };
  const gateChip = ctx => ({ stale: chip('stale', 'Stale', 'clock'), conflict: chip('error', 'Blocked: drift', 'alert'), error: chip('error', 'Blocked: failed exercise', 'alert'), partial: chip('stale', 'Incomplete: evidence missing', 'clock') }[ctx.state] || chip('', 'Green', 'check'));
  const OUTSIDE = 'Starting a prod release happens in GitHub, in a workflow only you can start. Waiving a gate happens in your own words, on the release evidence. Neither happens in MP.';
  const releaseCard = ctx => card(`${head('Release', gateChip(ctx))}${kv([['Current', 'rel_0031'], ['Rollback', 'Lambda alias, to the previous release'], ['Gate report', ctx.state === 'stale' ? 'Older than this release' : ctx.state === 'partial' ? 'Rollback readiness missing' : 'All gates reported'], ['Live model gate', 'Separate, in Models']])}${note('A missing or failed gate is never green.')}${note(OUTSIDE)}`);
  const T_REC = {
    what: 'Recovery', rows: 4, loading: 'Reading exercises, rehearsals and the release.',
    empty: banner('', 'The next exercise is scheduled.', 'rx_0007, Sun 1 Nov, stays the last pass, and the next has no result yet. Restore runs every month, and after any storage, import or audit change.', 'clock'),
    partial: banner('warn', '3 of 4 rehearsals answered.', 'The contract rollback did not answer, so it shows as unknown, never as passed.', 'clock'),
    error: banner('fall', 'A restore exercise stopped with a mismatch.', 'A failed exercise opens an incident and blocks the next release until it is fixed and re-run.', 'alert'),
    stale: banner('warn', 'From 11:12.', 'The gate report is older than this release, so it reads stale, not green.', 'clock'),
    offline: banner('', 'Offline.', 'Showing recovery records from 11:20. Nothing can be changed until you reconnect.', 'wifi-off'),
    conflict: `${banner('warn', 'Production is recorded lost, and a restored copy waits.', 'The copy stops at Sun 1 Nov, and anything recorded after that is the gap below. Separately, infrastructure drift blocks the release until it is resolved through Terraform.', 'split')}${tags(proposed('CT-14'))}`,
    expired: banner('warn', 'A new exercise is overdue.', 'An import change landed after rx_0007, and rel_0031 went out with none since, so rx_0007 no longer covers what is stored now.', 'clock'),
    denied: `${banner('warn', 'Reading stays open.', 'Every exercise and its result stay readable. Nothing here needs a fresh sign-in until production is recorded lost, and then a switch may.', 'lock')}${tags(proposed('CT-01'))}`
  };

  const T_REL = { ...T_REC, conflict: banner('warn', 'The plan and what is deployed disagree.', 'Drift blocks a release until it is resolved through Terraform. Nothing here changes it.', 'split') };

  /* ---------- pause switches: only the POLICY-003 scope pause has a rule ---------- */
  const PAUSES = ctx => {
    const s = ctx.state, scope = s === 'empty' ? 'No scope is paused.' : s === 'conflict' ? 'Code paused US tech, 12 months while you read: Previous model not eligible, Tue 21:20.' : 'US tech, 12 months is paused: Previous model not eligible, Tue 21:20.';
    return [
      ['Optional work', 'Holds optional work and leaves the nightly forecast alone.', 'Pause optional work', proposed('CT-14')],
      ['A forecast scope', `${scope} Code pauses a scope by itself when a trigger you approved fires, and a restart needs your yes.`, 'Pause a scope', proposed('POLICY-003')],
      ['A feature', 'Holds one feature. Nothing else changes.', 'Pause a feature', proposed('CT-16')]
    ];
  };
  const PAUSEWHY = { conflict: 'Held. A scope changed while you read, so read what code did before you press anything.' };
  const keeps = () => card(`${head('What keeps running')}${note('Sign-in, ledger reads, audit, recovery and daily forecasts stay available at every cost threshold.')}${note('A pause is scoped. POLICY-003 is not authority for a blanket application shutdown, so no switch here stops all of MP.')}`);
  const elsewhere = () => list(`${opens('fan', 'Restart a paused scope', 'In Models and evaluations, with its evidence')}${opens('sliders', 'Alert thresholds and quiet hours', 'In Approvals and configuration')}`);
  const T_PAU = {
    what: 'Pause switches', rows: 3, loading: 'Reading what is paused now.',
    empty: banner('', 'Nothing is paused.', 'Every forecast scope is running. The switches stay here for when you need one.', 'check'),
    partial: banner('warn', 'Model pointers did not answer.', 'So whether a scope is paused now is unknown, not no. The last known pause stays below.', 'clock'),
    error: banner('fall', 'Your pause did not land.', 'It failed at 21:16, so optional work is still running. Nothing else changed. Try again.', 'alert'),
    stale: banner('warn', 'From 11:12.', 'A pause set after 11:12 would not show here.', 'clock'),
    offline: banner('', 'Offline.', 'These switches are from 11:20. Nothing can be changed until you reconnect.', 'wifi-off'),
    conflict: banner('warn', 'A scope changed while you read.', 'Code paused it, as POLICY-003 allows. Your view stays at the version you opened and nothing was applied.', 'split'),
    expired: `${banner('warn', 'A pause request ran out.', 'It passed its time, so nothing was paused. It needs a new request.', 'clock')}${tags(proposed('CT-02'))}`,
    denied: ctx => `${signNote('What is paused stays readable.')}${tags(proposed('CT-01'))}`
  };

  /* ---------- B: the runbook, each procedure as steps that say whose they are ---------- */
  const WHO = { code: () => chip('', 'Code'), you: () => chip('owner', 'You'), out: () => chip('illus', 'Outside MP'), ci: () => chip('', 'CI') };
  const st = (n, stt, w, t, s, x = '') => `<li class="${stt}"${stt === 'now' ? ' aria-current="step"' : ''}><span class="n">${stt === 'done' ? `<span class="sr">Done, step ${n}</span>${ic('check', 's16')}` : n}</span><div style="min-width:0"><div class="top"><b>${t}</b>${WHO[w]()}</div><p>${s}</p>${x ? `<div class="x">${x}</div>` : ''}</div></li>`;
  const steps = (name, rows) => `<ol class="aincidents-steps" aria-label="${name}">${rows.join('')}</ol>`;
  const procCard = (t, r, inner) => card(`${head(t, r)}${inner}`);
  const BOOK = ctx => {
    const s = ctx.state, signed = chip('owner', 'Signed off by you'), walked = chip('', 'Walked through'), drafted = chip('illus', 'Drafted');
    const v = { failed: chip('error', 'Failed step', 'alert'), changed: chip('stale', 'Changed since sign-off', 'split') };
    return [
      ['alert', 'Incident escalation', 'Acknowledge, let code recover, ask for more, resolve', s === 'conflict' ? v.changed : signed],
      ['refresh', 'Replay', 'What code may do, what needs you, what is refused', s === 'error' ? v.failed : signed],
      ['db', 'Recovery', 'Restore into an isolated target, reconcile, and only then a switch', signed],
      ['up', 'Release and rollback', 'Gates, the alias, and what happens outside MP', walked],
      ['pause', 'Pause switches', 'Optional work, a forecast scope, a feature', drafted]
    ];
  };
  const bookRows = ctx => list(`${BOOK(ctx).map(([i, t, sub, c]) => opens(i, t, sub, tags(c))).join('')}${row('clock', 'Monthly evidence review', 'What it reads is not recorded yet', tags(chip('illus', 'Drafted'), proposed('CT-14')))}`);
  const nowBand = ctx => {
    const i = inc(ctx);
    if (ctx.state === 'empty') return card(`${head('Right now')}${note('No incident is open, so no procedure is running.')}`);
    if (ctx.state === 'conflict') return `${sec('Right now')}${list(`${opens(I14.i, I14.name, 'inc_0014 · step 2 of 4, Acknowledge', tags(ST.open, proposed('CT-14')), I14.tone)}${opens(I12.i, I12.name, 'inc_0012 · reopened, back to step 3 of 5', tags(ST.again), I12.tone)}`)}`;
    return `${sec('Right now')}${list(opens(i.i, i.name, `${i.id} · ${ctx.state === 'error' ? 'step 2 of 5, Acknowledge' : 'step 3 of 5, waiting for a newer price'}`, tags(statusOf(ctx, i)), i.tone))}`;
  };
  const T_BOOK = {
    ...T_LIST, what: 'The runbook', rows: 5, loading: 'Reading the runbook and what is running.',
    empty: banner('', 'No incident is open.', 'Silence is not a sign that nothing is wrong, so the last run and the last restore stay in view.', 'check'),
    conflict: `${banner('warn', 'A procedure changed after you signed it off.', 'Incident escalation reads Changed since sign-off until you walk it again. Production is also recorded lost, so inc_0014 is open, and inc_0012 reopened.', 'split')}${tags(proposed('CT-14'))}`,
    expired: banner('warn', 'A new restore exercise is overdue.', 'An import change landed after rx_0007, and rel_0031 went out with none since. Recovery says what comes next.', 'clock')
  };
  const bookRail = ctx => `${still(ctx)}${card(`${head('The rule')}${note('Agents have no operational authority. The runbook is written and walked on dev, with synthetic data, and you sign it off.')}`)}${refused('R17', 'No runbook step goes around the controlled writer, a fresh sign-in or the release workflow.')}`;

  function escalate(ctx, i = inc(ctx)) {
    const s = ctx.state;
    if (i === I14) return steps('Incident escalation for inc_0014', [
      st(1, 'done', 'code', 'Code opens one incident', 'inc_0014. How production came to be recorded lost is not recorded.', tags(proposed('CT-14'))),
      st(2, 'now', 'you', 'Acknowledge', 'Waiting for you.', ack14()),
      st(3, '', 'you', 'Switch in Recovery', 'Only you approve it, and only with a reconciled copy.', list(opens('db', 'Recovery', 'rx_0007 · as of Sun 1 Nov'))),
      st(4, '', 'you', 'Resolve', CLOSE14, close14(ctx))
    ]);
    if (s === 'empty') return steps('Incident escalation', [
      st(1, 'done', 'code', 'Code opens one incident', 'inc_0012 · data quality · Tue 16:50'), st(2, 'done', 'you', 'Acknowledge', 'You · Tue 17:05'), st(3, 'done', 'code', 'Code recovers, within its bounds', 'Its next check found a newer HSBC price, so code marked it mitigated.'),
      st(4, 'done', 'you', 'Ask for more', 'Not needed.'), st(5, 'done', 'you', 'Resolve', 'You, with a recorded resolution: HSBC prices are back from Yahoo.')
    ]);
    const first = i === I13 ? 'inc_0013 · job failure · Tue 21:16. One outage, one incident, with its symptoms linked.' : 'inc_0012 · data quality · Tue 16:50 · last price 14:10';
    const moreRow = list(opens('refresh', 'Replay', plain(reqChip(ctx))));
    return steps('Incident escalation', [
      st(1, 'done', 'code', 'Code opens one incident', first),
      i === I13 ? st(2, 'now', 'you', 'Acknowledge', `Waiting for you. ${NOTICE}`, ackTool(ctx)) : st(2, 'done', 'you', 'Acknowledge', 'You · Tue 17:05'),
      s === 'conflict' ? st(3, 'warn', 'code', 'Code recovers, within its bounds', 'The fault recurred, so the incident reopened and this step starts again.') : st(3, i === I13 ? '' : 'now', 'code', 'Code recovers, within its bounds', i === I13 ? `It re-runs a missed collection, within its bound. ${MIT}` : `${LATE} ${MIT}`, i === I13 ? tags(proposed('CT-14')) : ''),
      st(4, '', 'you', 'Ask for more, if it stays', 'A broad replay, a new paid call or financial reprocessing needs your approval.', moreRow),
      st(5, '', 'you', 'Resolve', 'You close it, with a recorded resolution. It reopens if the fault recurs.', i === I13 ? '' : resolveTool(ctx))
    ]);
  }
  function replaySteps(ctx) {
    const s = ctx.state, bad = s === 'error', off = false, refusedNow = s === 'conflict';
    const third = bad ? st(3, 'warn', 'code', 'It stopped at its bound', 'It kept failing, so it escalated. It will not run again by itself.') : refusedNow ? st(3, 'warn', 'code', 'It was refused on recheck', 'The latest config changed after this request was written.') : ['default', 'empty'].includes(s) ? st(3, 'done', 'code', 'The +40 retry ran', `${s === 'empty' ? 'At 17:15. A newer price came at the next check.' : LATE}`) : st(3, '', 'code', 'Run inside its bound', `One of four things code may do alone: ${AUTO.map(a => a.toLowerCase()).join('; ')}.`, tags(proposed('CT-14')));
    return steps('Replay', [
      st(1, off ? '' : 'done', 'code', 'Check it is eligible', bad ? 'Idempotent, in this environment, and inside the allowlist. Agents have no recovery authority.' : 'Idempotent and in this environment. A late price is not a missed collection, so it is outside the allowlist. Agents have no recovery authority.'),
      st(2, off ? '' : 'done', 'code', 'Write the request', off ? 'Scope, reason, items and idempotency keys, with your approval where it is needed.' : '', off ? '' : `${reqKv(ctx)}${tags(reqChip(ctx))}`),
      third,
      st(4, bad || s === 'denied' ? 'now' : '', 'you', 'Approve anything more', 'Beyond the allowlist, the step is yours.', asks(ctx)),
      st(5, s === 'empty' ? 'done' : '', 'code', 'Prove nothing doubled', KEYSAFE)
    ]);
  }
  function restoreSteps(ctx) {
    const s = ctx.state, f = s === 'empty' ? '' : 'done', bad = s === 'error';
    return steps('Recovery', [
      st(1, s === 'empty' ? 'now' : 'done', 'code', 'Restore into an isolated target', s === 'empty' ? 'Scheduled. Every month, and after any storage, import or audit change.' : 'Every month, and after any storage, import or audit change. It takes no authority.'),
      st(2, f, 'code', 'Apply tombstones again', 'Before restored content is readable, so deleted content never comes back.', tags(proposed('CT-04'))),
      bad ? st(3, 'warn', 'code', 'Reconcile', 'Stopped with a mismatch on the ledger. The next release is blocked until it is fixed and re-run.') : st(3, f, 'code', 'Reconcile', 'By counts, hashes and financial balances.'),
      st(4, s === 'empty' || bad ? '' : 'done', 'code', 'Record the exercise', rxLine(ctx)),
      st(5, s === 'conflict' ? 'now' : '', 'you', 'Switch, only if production is lost', 'The copy takes no authority until reconciliation passes and you approve.', switchTool(ctx))
    ]);
  }
  function releaseSteps(ctx) {
    return steps('Release and rollback', [
      st(1, 'done', 'ci', 'Build once, deploy to dev', 'One artefact from main, with its evidence attached. A green dev deploy never starts a prod release.'),
      st(2, ['stale', 'partial', 'conflict', 'error'].includes(ctx.state) ? 'warn' : 'done', 'ci', 'Gate report', `${plain(gateChip(ctx))}. A missing or failed gate is never green, and the live model gate stays separate.`),
      st(3, '', 'out', 'Start the release', 'In GitHub, in a workflow only you can start. Its evidence holds the commit, the artefact hash, the gates, the plan and your start.'),
      st(4, '', 'out', 'Waive a gate, if you must', 'In your own words, on the release evidence. There is no control for this in MP.'),
      st(5, '', 'code', 'Roll back', 'A failed prod deploy rolls back by Lambda alias to the previous release, and history stays.'),
      st(6, '', 'you', 'Switch forward again', 'That needs your yes. For a model, it is in Models and evaluations.', list(opens('fan', 'Models and evaluations', 'R1-LGB v2 reverted to v1, Mon 22:20')))
    ]);
  }
  function pauseSteps(ctx) {
    const rows = PAUSES(ctx).map(([t, s, b, tag]) => ask(t, s, can(ctx, act('A43', b), { why: PAUSEWHY }), tags(tag)));
    return steps('Pause switches', [
      st(1, 'done', 'you', 'Say what is wrong', 'Read the incident first, so the pause fits the fault.'),
      st(2, 'now', 'you', 'Choose the smallest switch', 'Only the forecast scope pause has a rule today. Who may press the other two is open.', rows.join('')),
      st(3, '', 'code', 'Code records it', 'The pause and its reason are recorded. How they are recorded is open.'),
      st(4, '', 'you', 'Restart with your yes', 'Nothing restarts itself.')
    ]);
  }

  /* ---------- the journey ---------- */
  const ADMIN = 'Admin';
  J.add({
    id: 'incidents', title: 'Incidents and recovery',
    stories: ['MP-64', 'MP-106', 'MP-108', 'MP-118', 'MP-110', 'MP-119', 'MP-122', 'MP-126', 'MP-159', 'MP-138', 'MP-167', 'MP-162'],
    summary: 'What went wrong, who has seen it and what brings it back. Code opens incidents, you close them, and restore, replay and rollback stay inside their bounds.',
    options: [{
      id: 'a', name: 'Incident timeline', rec: true,
      why: 'Admin is opened when something went wrong, so it starts from what happened and follows it from detect to resolve. Replay and recovery hang off the record they serve.',
      cost: 'A calm monthly check starts on a list of faults. Restore and rollback sit one step away from it.',
      covers: { compare: 'a-evidence', decide: 'a-replay', source: 'a-evidence', correct: 'a-replay', config: 'a-pause', cost: 'n/a: A replay on a Twelve Data listing spends credits from the 10 a minute kept for incidents and retries, and one on a Yahoo listing spends none. Estimate, usage and bill are reconciled in Costs and budgets, on Line by line and What is held.', recover: 'a-recovery' },
      screens: [{
        id: 'a-list', title: 'Incidents',
        render: ctx => frame(ctx, {
          title: 'Incidents', back: ADMIN,
          body: view(ctx, T_LIST, () => `${sec(ctx.state === 'empty' ? 'Resolved' : 'Not resolved')}${incRows(ctx)}${who()}`),
          rail: `${still(ctx)}${classes(ctx)}${list(`${opens('db', 'Recovery', 'Restore, rehearsals and the release')}${opens('pause', 'Pause switches', 'Optional work, a forecast scope, a feature')}`)}`
        })
      }, {
        id: 'a-detail', title: 'One incident', note: 'The timeline is the record: detect, acknowledge, mitigate, resolve. Failed shows inc_0013, the failed run.',
        render: ctx => frame(ctx, {
          title: inc(ctx).name, back: 'Incidents',
          body: `${ctx.state === 'loading' ? '' : incHead(ctx)}${view(ctx, T_DET, () => `${card(timeline(ctx))}${ctx.state === 'conflict' ? again12(ctx, timeline(ctx, I12)) : ''}`)}`,
          rail: `${list(ctx.state === 'conflict' ? `${opens('db', 'Recovery', 'rx_0007 · as of Sun 1 Nov')}${opens('layers', 'Evidence for inc_0012', 'Alert, run, job, trace, source and model')}${opens('refresh', 'Replay for inc_0012', plain(reqChip(ctx)))}` : `${opens('layers', 'Evidence', 'Alert, run, job, trace, source and model')}${opens('refresh', 'Replay', plain(reqChip(ctx)))}${opens('db', 'Recovery', 'Last restore passed Sun 1 Nov')}`)}${who()}`
        })
      }, {
        id: 'a-evidence', title: 'Evidence', note: 'Each link opens its own record. Two runs on one market clock sit side by side, so the change is a row.',
        render: ctx => frame(ctx, {
          title: 'Evidence', back: 'Incident',
          body: view(ctx, T_EV, () => `${evRows(ctx)}${twoRuns(ctx)}`),
          rail: evRail()
        })
      }, {
        id: 'a-replay', title: 'Replay', note: 'Three bands: what code may do, what needs you, what is refused.',
        render: ctx => frame(ctx, {
          title: 'Replay', back: 'Incident',
          body: view(ctx, T_REP, () => `${card(`${head(ctx.state === 'empty' ? 'The last request' : 'This request', reqChip(ctx))}${reqKv(ctx)}${note(KEYSAFE)}${ctx.state === 'error' ? '' : note(LATE)}`)}${needsYou(ctx)}${never()}`),
          rail: `${autoCard()}${costCard(ctx)}`
        })
      }, {
        id: 'a-recovery', title: 'Recovery', note: 'Restore, rehearse and release in one place. Starting a release and waiving a gate are named, with no control, because they happen outside MP.',
        render: ctx => frame(ctx, {
          title: 'Recovery', back: 'Incidents',
          body: view(ctx, T_REC, () => `${restoreCard(ctx)}${switchCard(ctx)}${refused('R6', 'No recovery step deletes evidence without a recorded tombstone.')}`),
          rail: `${releaseCard(ctx)}${rehearse(ctx)}${objectives()}`
        })
      }, {
        id: 'a-pause', title: 'Pause switches', note: 'The three the runbook names. Only the forecast scope pause has a rule, so the others are labelled.',
        render: ctx => frame(ctx, {
          title: 'Pause switches', back: 'Incidents',
          body: view(ctx, T_PAU, () => card(PAUSES(ctx).map(([t, s, b, tag]) => ask(t, s, can(ctx, act('A43', b), { why: PAUSEWHY }), tags(tag))).join(''))),
          rail: `${keeps()}${elsewhere()}${refused('R17', 'No pause goes around the controlled writer, a fresh sign-in or the release workflow.')}`
        })
      }]
    }, {
      id: 'b', name: 'Runbook first',
      why: 'Recovery is rare, so you read the procedure rather than remember it. Each step says whose it is, and restore, replay and rollback are steps you can see coming.',
      cost: 'What happened tonight is one band above the procedures, and a small incident gets the same steps as a large one.',
      covers: { compare: 'b-escalate', decide: 'b-replay', source: 'b-escalate', correct: 'b-replay', config: 'b-pause', cost: 'n/a: A replay on a Twelve Data listing spends credits from the 10 a minute kept for incidents and retries, and one on a Yahoo listing spends none. Estimate, usage and bill are reconciled in Costs and budgets, on Line by line and What is held.', recover: 'b-restore' },
      screens: [{
        id: 'b-runbook', title: 'Runbook', note: 'The procedures MP-126 names, with what is running now on top. A signed-off procedure is yours, and a drafted one says so.',
        render: ctx => frame(ctx, {
          title: 'Runbook', back: ADMIN,
          body: view(ctx, T_BOOK, () => `${nowBand(ctx)}${sec('Procedures')}${bookRows(ctx)}`),
          rail: bookRail(ctx)
        })
      }, {
        id: 'b-escalate', title: 'Incident escalation', note: 'The open incident runs through the procedure, and its evidence sits beside it.',
        render: ctx => frame(ctx, {
          title: 'Incident escalation', back: 'Runbook',
          body: `${ctx.state === 'loading' ? '' : incHead(ctx)}${view(ctx, T_DET, () => `${card(escalate(ctx))}${ctx.state === 'conflict' ? again12(ctx, escalate(ctx, I12)) : ''}`)}`,
          rail: `${sec(ctx.state === 'conflict' ? 'Evidence for inc_0012' : 'Evidence')}${evRows(ctx)}${twoRuns(ctx)}${refused('R3', 'A stored price cannot be edited, by you or by anyone. A missing price stays missing.')}`
        })
      }, {
        id: 'b-replay', title: 'Replay', note: 'The same bands as a procedure: eligible, written, run, approved, proved.',
        render: ctx => frame(ctx, {
          title: 'Replay', back: 'Escalation',
          body: view(ctx, T_REP, () => `${procCard('Five steps', ctx.state === 'empty' ? '' : reqChip(ctx), replaySteps(ctx))}${never()}`),
          rail: costCard(ctx)
        })
      }, {
        id: 'b-restore', title: 'Recovery', note: 'A restore as steps, so the switch is the last thing you meet, never the first.',
        render: ctx => frame(ctx, {
          title: 'Recovery', back: 'Runbook',
          body: view(ctx, T_REC, () => `${procCard('Five steps', rxState(ctx), restoreSteps(ctx))}${refused('R11', 'Nothing restores over production. A destructive restore into prod is refused.')}${refused('R6', 'No recovery step deletes evidence without a recorded tombstone.')}`),
          rail: `${card(`${head('Record classes')}${rxRows(ctx)}`)}${objectives()}`
        })
      }, {
        id: 'b-release', title: 'Release and rollback', note: 'Two steps here happen outside MP, so they are named and offer no control.',
        render: ctx => frame(ctx, {
          title: 'Release and rollback', back: 'Runbook',
          body: view(ctx, T_REL, () => procCard('rel_0031', gateChip(ctx), releaseSteps(ctx))),
          rail: rehearse(ctx)
        })
      }, {
        id: 'b-pause', title: 'Pause switches', note: 'Only the forecast scope pause has a rule, so the others are labelled.',
        render: ctx => frame(ctx, {
          title: 'Pause switches', back: 'Runbook',
          body: view(ctx, T_PAU, () => procCard('Four steps', '', pauseSteps(ctx))),
          rail: `${keeps()}${elsewhere()}`
        })
      }]
    }]
  });
}
