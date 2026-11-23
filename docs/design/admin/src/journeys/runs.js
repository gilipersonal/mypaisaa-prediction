/* Runs and Health (MP-64, PH02-S06, S12, S13, PH03-S09, S10, PH05-S07, PH08-S05). Reading needs no fresh sign-in. The only owner writes
   here are replay and pause, and they live on the linked incident. Every figure is illustrative. UK close 16:35 is the owner journeys'
   (J:privacy:289); India's and the US's are the exchange closes in London time, and each clock time is close + the POLICY-002 offset. */
{
  const chip = (cls, t, i = '') => `<span class="chip ${cls}">${i ? ic(i, 's14') : '<span class="dot"></span>'}${t}</span>`;
  const OK = t => chip('fresh', t), WARN = (t, i = 'clock') => chip('stale', t, i), BAD = (t, i = 'alert') => chip('error', t, i), PLAIN = t => chip('', t);
  const id = t => `<code>${t}</code>`;
  const para = t => `<p class="small muted">${t}</p>`;
  const tagged = (tag, t) => `<div class="aruns-tag">${tag}<span class="small muted">${t}</span></div>`;
  /* the owner journeys' words for this US run, word for word (MP-186): it collects from 21:15, freezes its cutoff at 22:00 and issues 22:15, and it
     prices the 3 US holdings, Apple, NVIDIA and SPY. The UK and India run apart. Twelve Data fails at 21:16, after the run starts (ADM-10, ADM-11, ADM-22). */
  const NORMAL = 'As of 22:15 London · data cutoff 22:00 · 3 of 3 priced';
  const LAST_GOOD = 'Last good run Mon 22:15 · cutoff 22:00';
  const FAIL_LINE = 'Twelve Data failed at 21:16.';
  const CLAUDE_OFF = 'Forecasts and figures run as usual, because Claude only explains.';
  const OFFLINE_NOTE = 'Nothing can be changed until you reconnect. No financial write offline.';
  const kept = ctx => (browser(ctx) ? tagged(proposed('MP40-Q12'), 'What a browser keeps offline is open.') : '');
  const offline = (ctx, what) => banner('', 'Offline.', `Showing ${what} from 11:20. ${OFFLINE_NOTE}`, 'wifi-off') + kept(ctx);
  const refresh = () => act('A03', 'Read the latest records', 'tinted', 'refresh');

  /* ---------- the clock: four offsets from each market's own close ---------- */
  const STEP = [['+15', 'Collect'], ['+40', 'Retry'], ['+60', 'Freeze'], ['+75', 'Issue']];
  const MARK = { done: ['check', 'Done'], due: ['clock', 'Due'], miss: ['x', 'Missed'], late: ['clock', 'Late'], gap: ['info', 'Not read'] };
  const clock = (times, marks) => `<ol class="aruns-clock" aria-label="The four clocks after the close">${STEP.map(([o, n], i) => { const [k, w] = MARK[marks[i]]; return `<li class="aruns-step ${marks[i]}"><span class="aruns-off">${o}</span><b>${n}</b><span class="small muted">${times[i]}</span><span class="aruns-mark">${ic(k, 's14')}${w}</span></li>`; }).join('')}</ol>`;
  const INDIA = ['10:15', '10:40', '11:00', '11:15'], UK = ['16:50', '17:15', '17:35', '17:50'], US = ['21:15', '21:40', '22:00', '22:15'];
  const DONE = ['done', 'done', 'done', 'done'], DUE = ['due', 'due', 'due', 'due'], GAP = ['gap', 'gap', 'gap', 'gap'];
  const marketCard = (name, sub, status, times, marks, rows, extra = '') => box(`<div class="aruns-mhead"><div><b>${name}</b><span class="small muted">${sub}</span></div>${status}</div>${clock(times, marks)}<div style="margin-top:10px">${kv(rows)}</div>${extra}`);
  const india = (s = OK('Issued 11:15'), m = DONE, r = [['Watermark', 'Wed close'], ['Last success', 'Wed 10:15'], ['Next due', 'Thu 10:15']], x = '') => marketCard('India', 'Close 10:00 London', s, INDIA, m, r, x);
  const uk = (s = PLAIN('Waiting for close'), m = DUE, r = [['Watermark', 'Tue close · HSBC last price 14:10'], ['Last success', 'Tue 16:50'], ['Next due', 'Today 16:50']], x = '') => marketCard('UK', 'Close 16:35 London', s, UK, m, r, x);
  const us = (s = PLAIN('Waiting for close'), m = DUE, r = [['Watermark', 'Tue close'], ['Last success', 'Tue 21:15'], ['Next due', 'Tonight 21:15']], x = '') => marketCard('US', 'Close 21:00 London', s, US, m, r, x);
  const CLOCK_NOTE = () => para('The clock is your choice of 75 minutes after each close, still to be proven. Each market runs on its own versioned calendar, so a holiday or half-day moves these times.');

  /* ---------- what ran ---------- */
  const runRow = (title, sub, status, sel = false) => item(lead('refresh'), title, sub, `<span style="display:inline-flex;align-items:center;gap:4px">${status}${ic('chev-r', 's18')}</span>`, '', sel, true);
  const ind = () => runRow('Forecast run, Wed 4 Nov 10:15', 'run_8d6e · India · issued 11:15', OK('Succeeded'));
  const ukr = () => runRow('Forecast run, Tue 3 Nov 16:50', 'run_8cf7 · UK · HSBC late', OK('Succeeded'));
  const ukUnread = (d = 'Tue') => runRow(`UK, ${d}`, 'Run not read', WARN('Unknown'));
  const tue = (status = OK('Succeeded'), sub = 'run_8d02 · US · 3 of 3 priced · issued 22:15') => runRow('Forecast run, Tue 3 Nov 21:15', sub, status);
  const mon = (status = OK('Succeeded')) => runRow('Forecast run, Mon 2 Nov 21:15', 'run_8c41 · US · 3 of 3 priced', status);
  const hsbc = (status = WARN('Acknowledged')) => item(lead('alert', 'warn'), 'HSBC price late', 'inc_0012 · detected Tue 16:50', `<span style="display:inline-flex;align-items:center;gap:4px">${status}${ic('chev-r', 's18')}</span>`, '', false, true);
  const links = () => `<div class="aruns-acts">${bs('Compare two nights', 'tinted', 'split')}${bs('When it goes wrong', 'tinted', 'alert')}</div>`;
  const indTue = () => runRow('Forecast run, Tue 3 Nov 10:15', 'run_8ce2 · India', OK('Succeeded'));
  const indMon = () => runRow('Forecast run, Mon 2 Nov 10:15', 'run_8bd0 · India', OK('Succeeded'));
  const ukMon = () => runRow('Forecast run, Mon 2 Nov 16:50', 'run_8bf3 · UK', OK('Succeeded'));
  const ranHead = () => sec('What ran', '<span class="small muted">Recent runs</span>');
  const ranOK = (o = {}) => `${ranHead()}${list((o.top || '') + (o.noIndia ? '' : ind()) + (o.tue || tue()) + (o.uk || ukr()) + indTue() + mon() + (o.ukMon || ukMon()) + indMon() + (o.hsbc || hsbc()))}${links()}`;
  const ranFailed = () => `${ranHead()}${list(ind() + tue(BAD('Failed'), 'run_8d02 · US · Twelve Data failed at 21:16') + ukr() + indTue() + mon() + ukMon() + indMon() + item(lead('alert', 'fall'), 'Forecast run failed', 'inc_0013 · Tue 21:16 · open', `<span style="display:inline-flex;align-items:center;gap:4px">${BAD('Open')}${ic('chev-r', 's18')}</span>`, '', false, true) + hsbc())}${links()}`;

  /* ---------- health: four alarms, and what they are not allowed to hide ---------- */
  const ALARM = {
    default: [['Missed daily run', 'India Wed 10:15 · UK and US Tue', OK('No alarm')], ['Stale collector', 'Last collect Wed 10:15', OK('No alarm')], ['Dead-letter queues', 'Read at 11:40', OK('0 items')], ['Error rate', 'Read at 11:40', OK('No alarm')]],
    loading: [['Missed daily run', 'Last good 11:20', PLAIN('Reading')], ['Stale collector', 'Last good 11:20', PLAIN('Reading')], ['Dead-letter queues', 'Last good 11:20', PLAIN('Reading')], ['Error rate', 'Last good 11:20', PLAIN('Reading')]],
    empty: [['Missed daily run', 'No run has been due yet', PLAIN('No evidence yet')], ['Stale collector', 'No collection yet', PLAIN('No evidence yet')], ['Dead-letter queues', 'No job has run', PLAIN('No evidence yet')], ['Error rate', 'Nothing to measure', PLAIN('No evidence yet')]],
    partial: [['Missed daily run', 'India Wed 10:15 · US Tue · UK not read', WARN('Unknown')], ['Stale collector', 'UK collection not read', WARN('Unknown')], ['Dead-letter queues', 'UK collection not read', WARN('Unknown')], ['Error rate', 'Read at 11:40', OK('No alarm')]],
    error: [['Missed daily run', 'US, Tue · inc_0013', BAD('Alarm')], ['Stale collector', 'Twelve Data recovered · India collected Wed 10:15', OK('No alarm')], ['Dead-letter queues', 'job_3e9a · quarantined with its reason', BAD('1 item')], ['Error rate', 'Cleared · read at 11:20', OK('No alarm')]],
    stale: [['Missed daily run', 'From 11:12', WARN('Unknown')], ['Stale collector', 'India: nothing recorded since Tue 10:15', BAD('Alarm')], ['Dead-letter queues', 'From 11:12', WARN('Unknown')], ['Error rate', 'From 11:12', WARN('Unknown')]],
    offline: [['Missed daily run', 'From 11:20', WARN('Not current')], ['Stale collector', 'From 11:20', WARN('Not current')], ['Dead-letter queues', 'From 11:20', WARN('Not current')], ['Error rate', 'From 11:20', WARN('Not current')]],
    conflict: [['Missed daily run', 'India Wed 10:15 · UK Tue · US Tue held', WARN('Held', 'split')], ['Stale collector', 'Last collect Wed 10:15', OK('No alarm')], ['Dead-letter queues', 'Read at 11:40', OK('0 items')], ['Error rate', 'Read at 11:40', OK('No alarm')], ['Reconciler', 'job_3e9a · reconcile_required', WARN('1 open', 'split')]],
    expired: [['Missed daily run', 'India and UK Wed · US Tue', OK('No alarm')], ['Stale collector', 'Last collect Wed 16:50', OK('No alarm')], ['Dead-letter queues', 'Read at 18:05 by polling', OK('0 items')], ['Error rate', 'Read at 18:05 by polling', OK('No alarm')], ['Stream', 'Your session closed it', WARN('Closed')]],
    denied: [['Missed daily run', 'India Wed 10:15 · UK and US Tue', OK('No alarm')], ['Stale collector', 'Last collect Wed 10:15', OK('No alarm')], ['Dead-letter queues', 'Read at 11:40', OK('0 items')], ['Error rate', 'Read at 11:40', OK('No alarm')]]
  };
  const alarmRows = ctx => ALARM[ctx.state].map(([a, b, c]) => `<div class="aruns-alarm"><div><b>${a}</b><span class="small muted">${b}</span></div>${c}</div>`).join('');
  const RULE = 'A health check never reports OK while a dead-letter queue holds items or a daily run was missed.';
  const STREAM = { expired: [WARN('closed: expired or revoked'), 'This status was re-read by polling at 18:05. Sign in again to bring the stream back.'], offline: [WARN('Reconnecting', 'wifi-off'), 'The durable records are the truth, so this re-reads them when it reconnects.'], error: [WARN('gap: full re-read', 'refresh'), 'A missed range re-reads the durable records, not the stream.'], default: [PLAIN('polling fallback'), 'Clients poll until the streaming proof passes.'] };
  const health = ctx => { const [c, t] = STREAM[ctx.state] || STREAM.default; return box(`${lbl('Health')}<div class="aruns-alarms">${alarmRows(ctx)}</div><p class="small muted" style="margin-top:8px">${RULE}</p>`) + box(`${lbl('Live status')}<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">${c}${proposed('PL-04')}</div><p class="small muted" style="margin-top:8px">${t}</p>`); };
  const CHECKS = { expired: [WARN('Delayed quote'), 'The UK has closed. US listings read Twelve Data, labelled with its delay. A delayed quote is never called real-time.'], default: [WARN('Delayed quote'), 'UK listings read Yahoo, labelled with its delay. A delayed quote is never called real-time.'], error: [WARN('Delayed quote'), 'Twelve Data is back, and UK listings read Yahoo, labelled with its delay. A delayed quote is never called real-time.'], stale: [WARN('Daily status only'), 'Past the freshness tolerance, a listing shows daily status only.'], offline: [PLAIN('From 11:20'), 'Checks run on the server whether or not you are online.'], loading: [PLAIN('Reading'), 'Last good 11:20.'], empty: [PLAIN('Market closed'), 'No check runs on a closed market or a holiday.'], partial: [PLAIN('Not read'), 'UK checks not read.'] };
  const checks = ctx => { const [c, t] = CHECKS[ctx.state] || CHECKS.default; return box(`${lbl('30-minute checks, separate from this clock')}<div style="margin-top:8px">${c}</div><p class="small muted" style="margin-top:8px">${t}</p>`); };
  const railClock = ctx => `${ctx.state === 'offline' ? '' : `<div>${refresh()}</div>`}${health(ctx)}${checks(ctx)}`;

  /* ---------- a run: what it used, what it decided, what it cost ---------- */
  const moment = (t, a, b = '') => `<div class="aruns-tl"><span class="aruns-tt">${t}</span><div><b>${a}</b>${b ? `<span class="small muted">${b}</span>` : ''}</div></div>`;
  const runHead = (title, sub, c, line = NORMAL) => box(`<div class="aruns-mhead"><div><b>${title}</b><span class="small muted">${sub}</span></div>${c}</div><p class="small" style="margin-top:8px">${line}</p>`);
  const head8d = (c = OK('Succeeded'), line = NORMAL) => runHead('Forecast run, Tue 3 Nov 21:15', 'run_8d02 · after the US close', c, line);
  const failTL = () => box(`${lbl('The US clock, Tue')}<div class="aruns-tls">${moment('21:16', 'Twelve Data failed', 'req_a90f · 3 attempts · job_3e9a')}${moment('21:40', 'The +40 retry failed', 'Still no close · dead-lettered with its reason')}${moment('22:00', 'Frozen at +60: no input set', 'Recorded as missed_origin, never backfilled')}</div>`);
  const timeline = () => box(`${lbl('What happened')}<div class="aruns-tls">${moment('21:15', 'Collect started', 'job_3e9a · attempt 1 of 3')}${moment('22:00', 'Frozen at +60', '3 of 3 US closes in')}${moment('22:05', 'US tech, 12 months paused by code', 'Previous model not eligible. Other scopes kept issuing')}${moment('22:15', 'Forecasts issued at +75', '3 of 3 priced')}</div>`);
  const EVID = [['Release', 'rel_0031'], ['Settings', 'v9'], ['Catalogue', 'v14'], ['Models', 'R2-HGB v3 · R1-LGB v1'], ['Sources', 'Twelve Data · Yahoo'], ['Collect job', 'job_3e9a'], ['Trace', 'tr_51c2 · linked across a queue or batch'], ['Guard decisions', 'Calendar current · market data credits reserved · cutoff kept']];
  /* a failed run names what it was set to use, and says it wrote nothing */
  const DUE_TO = rows => rows.map(r => (r[0] === 'Models' ? ['Due to use', r[1]] : r[0] === 'Sources' ? ['Due to read', r[1]] : r)).concat([['Forecasts written', 'None']]);
  const evidence = (rows = EVID) => box(`${lbl('Exact versions and guards')}<div style="margin-top:8px">${kv(rows)}</div><p class="small muted" style="margin-top:8px">References only, never document content, prompts, tokens or holding values.</p>`);
  const costOn = () => box(`${lbl('Cost reservation · cost month, day 18 of 30')}<div style="margin-top:8px">${kv([['Market data cap', '45 credits a minute of 55'], ['Nightly explanations', 'Held £0.34']])}</div><p class="small muted" style="margin-top:8px">That date is the cost month's, not this run's. Claude's hold is its worst case, and it settles once.</p><div style="margin-top:10px">${bs('Open Costs and budgets', 'tinted')}</div>`);
  const costOff = () => box(`${lbl('Cost reservation')}<div style="margin-top:8px">${kv([['Market data cap', '45 credits a minute of 55'], ['Claude', 'Refused before it started']])}</div><p class="small muted" style="margin-top:8px">No verified credit and no paid approval, so every Claude call is refused. ${CLAUDE_OFF}</p><div style="margin-top:10px">${bs('Open Costs and budgets', 'tinted')}</div>`);
  const costHeld = () => box(`${lbl('Cost reservation')}<div style="margin-top:8px">${kv([['Twelve Data credits', 'Held · ambiguous']])}</div><p class="small muted" style="margin-top:8px">A timeout keeps its reservation as ambiguous until it is reconciled. It is never repeated.</p>`);
  const jobDoor = (sub = 'job_3e9a · attempt 1 of 3') => list(item(lead('db'), 'Collect job', sub, ic('chev-r', 's18'), '', false, true));
  const open = (extra = '') => `<div class="aruns-acts">${bs('Open in Audit', 'tinted', 'shield')}${extra}</div>`;
  const runOK = (ctx, cost = costOn) => head8d() + timeline() + jobDoor() + evidence() + cost() + open();
  const ranOut = 'The worker\'s lease ran out at 21:17, so the job resumed from its last durable step. The idempotency key held it to one result.';
  const runRegion = ctx => region(ctx, {
    what: 'This run', rows: 4, ok: () => runOK(ctx),
    loading: () => head8d(chip('', 'Loading'), 'Last good 11:20') + skel(3),
    empty: () => stateCard('grid', 'This run has no record yet', 'Tonight\'s run is due 21:15. Nothing starts early, and no record means not run, never passed.', bs('Back to the clock', 'tinted')),
    partial: () => banner('warn', 'Missing span.', 'One span of tr_51c2 did not arrive. The activity stays complete from the durable records.', 'clock') + head8d() + timeline() + jobDoor() + evidence(EVID.map(r => (r[0] === 'Trace' ? ['Trace', 'tr_51c2 · missing span'] : r))) + costOn() + open(),
    error: () => head8d(BAD('Failed'), `${FAIL_LINE} ${LAST_GOOD}`) + failTL() + jobDoor('job_3e9a · 3 attempts, all failed') + evidence(DUE_TO(EVID.filter(r => !['Trace', 'Guard decisions'].includes(r[0]))).concat([['Trace', 'tr_51c2 · complete trace'], ['Incident', 'inc_0013 · open'], ['Request', 'req_a90f']])) + open(bs('Open inc_0013', 'primary')) + para('These records are from 11:20, the last good read.'),
    stale: () => banner('warn', 'Index lagging, with fallback to manifests.', 'This run is as of 11:12. It finished, so its evidence will not change, but a linked incident may be newer.', 'clock') + runOK(ctx),
    offline: () => offline(ctx, 'this run') + head8d() + timeline() + jobDoor() + evidence() + costOn(),
    conflict: () => banner('warn', 'reconcile_required.', 'job_3e9a sent a Twelve Data call and got no answer: ambiguous_external_outcome. Its credits stay held, and nothing is repeated while this stands.', 'split') + head8d(WARN('reconcile_required', 'split')) + timeline() + jobDoor('job_3e9a · reconcile_required') + evidence() + costHeld() + tagged(proposed('CT-05'), 'The reconciler\'s outcomes are not approved yet.') + open(),
    expired: () => banner('warn', 'Lease expired.', ranOut, 'clock') + head8d(OK('Succeeded · resumed')) + box(`${lbl('What happened')}<div class="aruns-tls">${moment('21:15', 'Collect started', 'job_3e9a · attempt 1 of 3')}${moment('21:17', 'Lease expired', 'Resumed from the last durable step')}${moment('22:15', 'Forecasts issued at +75', '3 of 3 priced')}</div>`) + evidence() + open(),
    denied: () => banner('warn', 'That link was refused: permission_denied.', 'It was made in dev, and prod refuses it. This run stays open to read, because reading needs no fresh sign-in.', 'lock') + runOK(ctx, costOff)
  });
  const railRun = ctx => ({ error: box(`${lbl('Next')}<p class="small muted" style="margin-top:6px">Tonight 21:15 runs normally. This origin stays missed, and no replay fills it in.</p>`) + refused('R4', 'A frozen cutoff cannot be moved and an origin cannot be backdated, by anyone, you included.') }[ctx.state] || refused('R3', 'A stored observation cannot be edited, by anyone, you included. A late or wrong value gets a new observation, and both stay.') + refused('R1', 'A run cannot edit the ledger. Only the controlled writer commits, and only an exact change you approved.'));

  /* ---------- a job: attempts, lease, trace, retention ---------- */
  const attempt = (n, b, c) => `<div class="aruns-attempt"><span class="aruns-tt">${n}</span><div class="small muted">${b}</div>${c}</div>`;
  const ATTEMPTS_OK = () => attempt('1', 'Twelve Data · US listings', OK('Succeeded'));
  const ATTEMPTS_BAD = () => attempt('1', 'Twelve Data · failed', BAD('Failed')) + attempt('2', 'After 2 seconds · failed', BAD('Failed')) + attempt('3', 'After 8 seconds · req_a90f failed at 21:16', BAD('Failed')) + attempt('+40', '21:40 · the one missing-close retry · failed', BAD('Failed'));
  const attemptsBox = (rows, foot = 'At most 3 attempts, with 2 and 8-second waits.') => box(`${lbl('Attempts')}<div class="aruns-attempts">${rows}</div><p class="small muted" style="margin-top:8px">${foot}</p>`);
  const jobKV = (state = 'succeeded', lease = 'Released') => box(`${lbl('The durable record')}<div style="margin-top:8px">${kv([['State', state], ['Business id', 'collect · US · Tue 3 Nov'], ['Idempotency key', 'Held · one result per key'], ['Lease', lease], ['Accepted, started, terminal', 'Each has evidence']])}</div>`);
  const traceBox = (t = 'linked across a queue or batch', x = 'Queued, resumed and scheduled work starts a new trace, joined by business ids and span links.') => box(`${lbl('Trace')}<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">${id('tr_51c2')}${PLAIN(t)}</div><p class="small muted" style="margin-top:8px">${x}</p>`);
  const KEPT = () => box(`${lbl('How long each is kept')}<div style="margin-top:8px">${kv([['Logs', '14 days'], ['Traces', '30 days'], ['Run summaries', '90 days']])}</div><p class="small muted" style="margin-top:8px">Retention changes need you and go through Terraform, so there is no control here.</p>`);
  const jobHead = (c = OK('succeeded')) => runHead('Collect job, Tue 21:15', 'job_3e9a · run_8d02', c, '45 credits a minute of 55, leaving 10 for incidents and retries.');
  const jobOK = () => jobHead() + attemptsBox(ATTEMPTS_OK()) + jobKV() + traceBox();
  const jobRegion = ctx => region(ctx, {
    what: 'This job', rows: 4, ok: jobOK,
    loading: () => jobHead(chip('', 'Loading')) + skel(3),
    empty: () => stateCard('grid', 'No job has run for this origin', 'Tonight\'s collect job is accepted at 21:15. No record means not run, never passed.', bs('Back to the clock', 'tinted')),
    partial: () => jobHead() + banner('warn', 'sampled out: durable record only.', 'This trace was sampled out, so spans are missing. Attempts and evidence below come from the job record, which is complete.', 'clock') + attemptsBox(ATTEMPTS_OK()) + jobKV() + traceBox('sampled out: durable record only', 'Telemetry is never the only record of a run.'),
    error: () => jobHead(BAD('dead-lettered')) + attemptsBox(ATTEMPTS_BAD(), 'Past its bound, the item went to its dead-letter queue and quarantine with a reason.') + jobKV('dead-lettered, quarantined') + traceBox('complete trace', 'Follow req_a90f from here. The trace points to access-controlled evidence, not its content.'),
    stale: () => banner('warn', 'Stale.', 'This job record is from 11:12, while the index catches up. A terminal job does not change, so its attempts stand.', 'clock') + jobOK(),
    offline: () => offline(ctx, 'this job') + jobOK(),
    conflict: () => jobHead(WARN('reconcile_required', 'split')) + banner('warn', 'Sent, with no answer on record.', 'Attempt 1 went out and no answer came back, so its credits stay held and it is reconciled, not repeated.', 'split') + attemptsBox(attempt('1', 'Twelve Data · ambiguous_external_outcome', WARN('Unknown', 'split'))) + jobKV('reconcile_required') + tagged(proposed('CT-05'), 'What the reconciler may conclude, and any stuck-run threshold, is open.'),
    expired: () => jobHead(OK('succeeded · resumed')) + banner('warn', 'Lease expired.', ranOut, 'clock') + attemptsBox(ATTEMPTS_OK()) + jobKV('succeeded', 'Expired at 21:17, then taken again') + traceBox(),
    denied: () => banner('warn', 'A span\'s evidence was refused.', 'The trace points to access-controlled evidence, and this session cannot open it. The job record stays readable.', 'lock') + jobOK()
  });
  const railJob = ctx => `${KEPT()}${ctx.state === 'error' ? box(`${lbl('Replay')}<div style="margin-top:8px">${BAD('bound reached: escalated')}</div><p class="small muted" style="margin-top:8px">Automatic retries stopped at their bound, so this is now inc_0013. A replay keeps its business id, and it is never a second commit or a second charge.</p><div style="margin-top:8px">${proposed('CT-14')}</div><div style="margin-top:10px">${bs('Open inc_0013', 'primary')}</div>`) : refused('R12', 'A replay never crosses environments. A dev job cannot be replayed into prod.')}`;

  /* ---------- comparing two nights: only what differs is worth reading ---------- */
  const cmpRow = (k, a, b) => `<div class="aruns-cmp${a === b ? '' : ' diff'}"><span class="small muted">${k}</span><span class="small">${a}</span><span class="small">${b}</span><span class="aruns-same">${ic(a === b ? 'equal' : 'split', 's14')}${a === b ? 'Same' : 'Differs'}</span></div>`;
  const CMP = [['Started', '21:15', '21:15'], ['Priced', '3 of 3', '3 of 3'], ['Collect attempts', '1 of 3', '1 of 3'], ['Settings', 'v9', 'v9'], ['Catalogue', 'v14', 'v14'], ['India midcap, 3 months', 'R1-LGB v1', 'R1-LGB v2'], ['US tech, 12 months', 'Paused 22:05', 'Issuing'], ['Issued', '22:15', '22:15']];
  const cmpTable = (rows = CMP, a = 'run_8d02, Tue', b = 'run_8c41, Mon') => box(`<div class="aruns-cmp head"><span class="label">Compared</span><span class="label">${a}</span><span class="label">${b}</span><span></span></div>${rows.map(r => cmpRow(...r)).join('')}`);
  const WHY = () => box(`${lbl('Why they differ')}<div class="aruns-tls">${moment('Mon 22:20', 'R1-LGB v2 reverted to v1', 'Code · Automatic · 2 bad weeks on probation')}${moment('Tue 14:10', 'Last HSBC price', 'Detected Tue 16:50 · inc_0012')}${moment('Tue 21:20', 'US tech, 12 months paused', 'Code · previous model not eligible')}</div><p class="small muted" style="margin-top:8px">Reverts by code are marked Automatic, and never read as your decision.</p>`);
  const cmpOK = () => cmpTable() + WHY();
  const cmpRegion = ctx => region(ctx, {
    what: 'This comparison', rows: 6, ok: cmpOK,
    loading: () => box(`${lbl('Comparing run_8d02 and run_8c41')}<span class="sk" style="height:96px;margin-top:10px"></span>`),
    empty: () => stateCard('split', 'One run, so nothing to compare', 'A comparison needs two recorded runs. The next one is due tonight 21:15.'),
    partial: () => banner('warn', 'One side is short.', 'The summary for run_8c41 answered and its span links did not. Anything unread shows unknown, and is never counted as the same.', 'clock') + cmpTable(CMP.map(r => (r[0] === 'Collect attempts' ? [r[0], r[1], 'Unknown'] : r))) + WHY(),
    error: () => banner('fall', FAIL_LINE, LAST_GOOD, 'alert') + cmpTable([['Due', '21:15', '21:15'], ['Priced', 'None: no input set', '3 of 3'], ['Collect attempts', '3 of 3, all failed', '1 of 3'], ['Settings', 'v9', 'v9'], ['Catalogue', 'v14', 'v14'], ['Result', 'missed_origin', 'Issued']]) + failTL(),
    stale: () => banner('warn', 'Stale.', 'Both summaries are from 11:12. Each run has finished, so a later change would be a linked incident, not a new figure.', 'clock') + cmpOK(),
    offline: () => offline(ctx, 'this comparison') + cmpOK(),
    conflict: () => banner('warn', 'run_8d02 has an open reconcile.', 'Its Twelve Data credits are unsettled, so this compares versions only. A comparison never settles a reconcile.', 'split') + cmpTable(CMP.concat([['Twelve Data credits', 'ambiguous', 'settled']])) + WHY(),
    expired: () => banner('warn', 'Past retention.', 'You asked to compare against a run older than 90 days. Its summary has gone, so this shows the two you can compare. Its forecasts, scores and audit stay.', 'clock') + cmpOK(),
    denied: () => banner('warn', 'Compare needs no fresh sign-in.', 'A refused link never blanks what you may read, so both runs stay open here.', 'lock') + cmpOK()
  });
  const railCmp = ctx => (ctx.state === 'error' ? `${box(`${lbl('Reads')}<p class="small muted" style="margin-top:6px">The failed run stays beside the good one, so the gap is plain. Nothing is hidden and nothing is rewritten.</p>`)}` : `${box(`${lbl('Reads')}<p class="small muted" style="margin-top:6px">Comparing two runs writes nothing.</p>`)}`);

  /* ---------- when a run goes wrong: what code may do, what needs you, what nobody may do ---------- */
  const ladder = (a, b) => box(`${lbl('Who may do what')}<div class="aruns-who"><div><b>Code, within bounds</b>${a}</div><div><b>Needs you, on the incident</b>${b}</div></div><div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">${proposed('CT-14')}<span class="small muted">The limits on code are not approved yet, so none is shown.</span></div>`);
  const AUTO = '<ul class="aruns-ul"><li>Retry an idempotent job</li><li>Replay a dead-letter item</li><li>Re-run a missed collection</li><li>Resume a durable workflow</li></ul>';
  const YOURS = '<ul class="aruns-ul"><li>A broad replay</li><li>Financial reprocessing</li><li>A new paid external call</li></ul>';
  const lateHead = (c = WARN('Acknowledged')) => runHead('HSBC price late', 'inc_0012 · UK close, Tue 3 Nov', c, 'Late: last price 14:10 (Yahoo)');
  const lateTL = (read = true) => box(`${lbl('The UK clock, Tue')}<div class="aruns-tls">${moment('14:10', 'Last price', 'Before the 16:35 UK close · Yahoo')}${moment('16:50', 'Detected at +15', read ? 'Collect found no newer price' : 'Collect not read')}${moment('17:15', 'Retry at +40', read ? 'Still none' : 'Not read')}${moment('17:35', 'Freeze at +60', read ? 'The cutoff did not move for it' : 'Not read')}</div><div style="margin-top:8px">${proposed('DATA-DEC-02')}</div>`);
  const failHead = () => runHead('Forecast run failed', 'inc_0013 · run_8d02', BAD('Open'), `${FAIL_LINE} ${LAST_GOOD}`);

  const recoverOK = () => lateHead() + lateTL() + ladder(AUTO, YOURS) + `<div>${bs('Open inc_0012', 'primary')}</div>`;
  const recoverRegion = ctx => region(ctx, {
    what: 'This failure', rows: 4, ok: recoverOK,
    loading: () => lateHead(chip('', 'Loading')) + skel(3),
    empty: () => stateCard('check', 'No failed or late run on record', 'Silence is not a sign that nothing is wrong, so the last run and the alarms stay on the clock.', bs('Back to the clock', 'tinted')),
    partial: () => banner('warn', 'Part of this is unread.', 'The incident answered and the UK run record did not, so the cause below may be incomplete.', 'clock') + lateHead() + lateTL(false) + ladder(AUTO, YOURS),
    error: () => failHead() + failTL() + ladder(AUTO, YOURS) + `<div>${bs('Open inc_0013', 'primary')}</div>`,
    stale: () => banner('warn', 'Past the freshness limit.', 'HSBC leaves the total until its price returns: Known value, 6 of 7 priced. This view is from 11:12.', 'clock') + lateHead(WARN('Stale')) + lateTL() + ladder(AUTO, YOURS),
    offline: () => offline(ctx, 'this incident') + lateHead() + lateTL() + ladder(AUTO, YOURS),
    conflict: () => banner('warn', 'The fault came back.', 'Two sources disagree on HSBC, so inc_0012 reopened. Both hashes are kept, and neither is overwritten.', 'split') + lateHead(BAD('Reopened', 'refresh')) + lateTL() + ladder(AUTO, YOURS),
    expired: () => banner('warn', 'Source access expired.', 'That is why collection found nothing newer after 14:10. Reading this history needs no source access.', 'clock') + lateHead() + lateTL() + ladder(AUTO, YOURS),
    denied: () => banner('warn', 'Replay needs a fresh sign-in, on the incident.', 'Opening the app with Face ID, or an open session, is not enough. The server checks a fresh sign-in.', 'lock') + recoverOK()
  });
  const railRecover = () => `${refused('R4', 'A frozen cutoff cannot be moved and an origin cannot be backdated, by anyone, you included.')}${refused('R12', 'A replay never crosses environments. A dev job cannot be replayed into prod.')}${box(`${lbl('Rollback and restore')}<p class="small muted" style="margin-top:6px">These are incident steps. Agents have no recovery authority, and code opens the incident, then you decide.</p><div style="margin-top:10px">${bs('Open Incidents and recovery', 'tinted', 'alert')}</div>`)}`;

  /* ---------- Option B: every run and queue, in one list ---------- */
  const filters = on => `<div class="aruns-filters" role="group" aria-label="Filter runs">${['All', 'Forecast', 'Collection', 'Claude', 'Import', 'Training'].map(t => `<button type="button" class="chip${t === on ? ' owner' : ''}" aria-pressed="${t === on}">${t}</button>`).join('')}</div>`;
  const rowB = (ld, title, sub, c) => item(ld, title, sub, `<span style="display:inline-flex;align-items:center;gap:4px">${c}${ic('chev-r', 's18')}</span>`, '', false, true);
  const LIST = {
    wed: () => rowB(lead('fan'), 'run_8d6e', 'Forecast run, India · Wed 10:15', OK('Succeeded')),
    uk: () => rowB(lead('fan'), 'run_8cf7', 'Forecast run, UK · Tue 16:50 · HSBC late', OK('Succeeded')),
    tue: (c = OK('Succeeded'), s = 'Forecast run, US · Tue 21:15') => rowB(lead('fan'), 'run_8d02', s, c),
    job: (c = OK('Succeeded · 1 of 3'), s = 'Collect, US · Tue 21:15') => rowB(lead('db'), 'job_3e9a', s, c),
    mon: () => rowB(lead('fan'), 'run_8c41', 'Forecast run, US · Mon 21:15', OK('Succeeded')),
    ukm: () => rowB(lead('fan'), 'run_8bf3', 'Forecast run, UK · Mon 16:50', OK('Succeeded')),
    indt: () => rowB(lead('fan'), 'run_8ce2', 'Forecast run, India · Tue 10:15', OK('Succeeded')),
    indm: () => rowB(lead('fan'), 'run_8bd0', 'Forecast run, India · Mon 10:15', OK('Succeeded'))
  };
  const listOK = () => `${list(LIST.wed() + LIST.tue() + LIST.job() + LIST.uk() + LIST.indt() + LIST.mon() + LIST.ukm() + LIST.indm())}`;
  const QUEUES = {
    default: [['Daily forecast', 'Waiting: 0', OK('0 dead-lettered')], ['Collection', 'Waiting: 0', OK('0 dead-lettered')], ['Claude routes, 7 queues', 'Waiting: 0', OK('0 dead-lettered')], ['Imports', 'Waiting: 0', OK('0 dead-lettered')], ['Training', 'Waiting: 0', OK('0 dead-lettered')]],
    partial: [['Daily forecast', 'Waiting: 0', OK('0 dead-lettered')], ['Collection', 'UK not read', WARN('Unknown')], ['Claude routes, 7 queues', 'Waiting: 0', OK('0 dead-lettered')], ['Imports', 'Waiting: 0', OK('0 dead-lettered')], ['Training', 'Waiting: 0', OK('0 dead-lettered')]],
    error: [['Daily forecast', 'Waiting: 0', OK('0 dead-lettered')], ['Collection', 'job_3e9a · quarantined', BAD('1 dead-lettered')], ['Claude routes, 7 queues', 'Waiting: 0', OK('0 dead-lettered')], ['Imports', 'Waiting: 0', OK('0 dead-lettered')], ['Training', 'Waiting: 0', OK('0 dead-lettered')]],
    conflict: [['Daily forecast', 'Waiting: 0', OK('0 dead-lettered')], ['Collection', 'job_3e9a · reconcile_required', WARN('Held', 'split')], ['Claude routes, 7 queues', 'Waiting: 0', OK('0 dead-lettered')], ['Imports', 'Waiting: 0', OK('0 dead-lettered')], ['Training', 'Waiting: 0', OK('0 dead-lettered')]]
  };
  const queueRows = (s = 'default') => list(QUEUES[s].map(([a, b, c]) => rowB(lead('layers'), a, b, c)).join(''));
  const fromTime = (t, s = 'default') => list(QUEUES[s].map(([a]) => rowB(lead('layers'), a, t, WARN('Not current'))).join(''));
  const listRegion = ctx => region(ctx, {
    what: 'The run list', rows: 6, ok: () => listOK() + para('Newest first. Run summaries are kept 90 days, and forecasts, scores and audit stay longer.'),
    loading: () => `<div class="small muted">Last good 11:20</div>` + skel(5),
    empty: () => stateCard('grid', 'No run or job on record yet', 'The first collection starts at +15 after the first eligible close. Silence is not a sign that nothing is wrong, so this never reads as healthy.'),
    partial: () => banner('warn', 'Partial.', 'India and the US answered. The UK run record did not, so its runs show unknown, never none.', 'clock') + list(LIST.wed() + LIST.tue() + LIST.job() + rowB(lead('fan'), 'UK, Tue', 'Run not read', WARN('Unknown')) + LIST.indt() + LIST.mon() + rowB(lead('fan'), 'UK, Mon', 'Run not read', WARN('Unknown')) + LIST.indm()),
    error: () => banner('fall', FAIL_LINE, `${LAST_GOOD}. The list below is from 11:20, the last good read.`, 'alert') + list(LIST.wed() + LIST.tue(BAD('Failed'), 'Forecast run, US · failed at 21:16') + LIST.job(BAD('dead-lettered · 3 of 3')) + LIST.uk() + LIST.indt() + LIST.mon() + LIST.ukm() + LIST.indm()),
    stale: () => banner('warn', 'Stale.', 'From 11:12, and India\'s 10:15 run does not appear. stale: its last success is older than its next due time.', 'clock') + list(LIST.tue() + LIST.job() + LIST.uk() + LIST.indt() + LIST.mon() + LIST.ukm() + LIST.indm()),
    offline: () => offline(ctx, 'the run list') + listOK(),
    conflict: () => banner('warn', 'One record disagrees with another.', 'job_3e9a shows an ambiguous_external_outcome, so run_8d02 waits on the reconciler. It is counted neither as clean nor as failed.', 'split') + list(LIST.wed() + LIST.tue(WARN('Waiting on job', 'split')) + LIST.job(WARN('reconcile_required', 'split')) + LIST.uk() + LIST.indt() + LIST.mon() + LIST.ukm() + LIST.indm()),
    expired: () => banner('warn', 'Older runs have left this list.', 'Run summaries are kept 90 days. An older run shows here only by its id in Audit, and its forecasts and scores stay.', 'clock') + listOK(),
    denied: () => banner('warn', 'Reading needs no fresh sign-in.', 'Nothing on this list can be changed from here, so nothing here asks for one. Replay and pause ask on the incident.', 'lock') + listOK()
  });
  const railList = ctx => `${ctx.state === 'offline' ? '' : `<div>${refresh()}</div>`}${box(`${lbl('Today at a glance')}<div class="aruns-alarms">${alarmRows(ctx)}</div><p class="small muted" style="margin-top:8px">${RULE}</p>`)}<div class="aruns-tag">${proposed('CT-05')}<span class="small muted">A stuck-run threshold is not approved, so no job is called stuck.</span></div><div class="aruns-tag">${proposed('PL-04')}<span class="small muted">Clients poll until the streaming proof passes.</span></div>`;

  const detailBHead = (c, line) => head8d(c, line);
  const detailOK = (cost = costOn) => head8d() + attemptsBox(ATTEMPTS_OK()) + jobKV() + evidence() + cost() + open();
  const detailRegion = ctx => region(ctx, {
    what: 'This run', rows: 4, ok: () => detailOK(),
    loading: () => detailBHead(chip('', 'Loading'), 'Last good 11:20') + skel(4),
    empty: () => stateCard('grid', 'No attempts on record', 'This run is due tonight 21:15. Its job record appears when it is accepted, and until then it is not a pass.', bs('Back to the list', 'tinted')),
    partial: () => banner('warn', 'Missing span.', 'One span of tr_51c2 did not arrive. Attempts and evidence stay complete from the durable records.', 'clock') + head8d() + attemptsBox(ATTEMPTS_OK()) + jobKV() + evidence(EVID.map(r => (r[0] === 'Trace' ? ['Trace', 'tr_51c2 · missing span'] : r))) + costOn() + open(),
    error: () => detailBHead(BAD('Failed'), `${FAIL_LINE} ${LAST_GOOD}`) + attemptsBox(ATTEMPTS_BAD(), 'Past its bound, the item went to its dead-letter queue and quarantine with a reason.') + jobKV('dead-lettered, quarantined') + evidence(DUE_TO(EVID.filter(r => !['Guard decisions'].includes(r[0]))).concat([['Incident', 'inc_0013 · open'], ['Request', 'req_a90f']])) + open(bs('Open inc_0013', 'primary')),
    stale: () => banner('warn', 'Stale.', 'This run is as of 11:12. It finished, so its attempts stand, but a linked incident may be newer.', 'clock') + detailOK(),
    offline: () => offline(ctx, 'this run') + head8d() + attemptsBox(ATTEMPTS_OK()) + jobKV() + evidence() + costOn(),
    conflict: () => detailBHead(WARN('reconcile_required', 'split')) + banner('warn', 'Sent, with no answer on record.', 'Attempt 1 went out and no answer came back, so its credits stay held and it is reconciled, not repeated.', 'split') + attemptsBox(attempt('1', 'Twelve Data · ambiguous_external_outcome', WARN('Unknown', 'split'))) + jobKV('reconcile_required') + costHeld() + tagged(proposed('CT-05'), 'What the reconciler may conclude is open.'),
    expired: () => detailBHead(OK('Succeeded · resumed')) + banner('warn', 'Lease expired.', ranOut, 'clock') + attemptsBox(ATTEMPTS_OK()) + jobKV('succeeded', 'Expired at 21:17, then taken again') + evidence() + open(),
    denied: () => banner('warn', 'That link was refused: permission_denied.', 'It was made in dev, and prod refuses it. This run stays open to read, because reading needs no fresh sign-in.', 'lock') + detailOK(costOff)
  });
  const railDetail = ctx => `${traceBox(ctx.state === 'partial' ? 'missing span' : 'linked across a queue or batch')}${KEPT()}${refused('R3', 'A stored observation cannot be edited, by anyone, you included. A late or wrong value gets a new observation, and both stay.')}${refused('R1', 'A run cannot edit the ledger. Only the controlled writer commits, and only an exact change you approved.')}`;

  const queueRegion = ctx => region(ctx, {
    what: 'The queues', rows: 5, ok: () => queueRows() + para('Past its bound, an item goes to its dead-letter queue and quarantine with a reason. Claude\'s 7 queues are one each, so a fault in one route cannot reach another.'),
    loading: () => `<div class="small muted">Last good 11:20</div>` + skel(5),
    empty: () => stateCard('layers', 'No queue has held work yet', 'An empty queue before the first run is no evidence of health. It says nothing has run.'),
    partial: () => banner('warn', 'Partial.', 'The UK run record did not answer, so Collection shows unknown, never none.', 'clock') + queueRows('partial'),
    error: () => banner('fall', 'A dead-letter queue holds an item.', 'So health cannot read OK, whatever else is passing.', 'alert') + queueRows('error'),
    stale: () => banner('warn', 'Stale.', 'Queue depths are from 11:12, and a queue moves by the minute, so none is shown as zero.', 'clock') + fromTime('From 11:12'),
    offline: () => offline(ctx, 'the queues') + fromTime('From 11:20'),
    conflict: () => banner('warn', 'A held item is not a clean queue.', 'job_3e9a waits on the reconciler, so Collection is neither clear nor dead-lettered.', 'split') + queueRows('conflict'),
    expired: () => banner('warn', 'A batch request expired.', 'Its 24 hours passed in the Claude queue, so it left the last dated evidence in place. It never falls back to a paid live call by itself.', 'clock') + queueRows(),
    denied: () => banner('warn', 'Reading needs no fresh sign-in.', 'Moving an item needs the incident and, for a broad replay, a fresh sign-in there.', 'lock') + queueRows()
  });
  const REPLAY = () => box(`${lbl('Replay states')}<div class="aruns-states">${['eligible', 'auto-retrying', 'bound reached: escalated', 'awaiting the owner', 'replayed', 'refused'].map(PLAIN).join('')}</div><p class="small muted" style="margin-top:8px">A replay keeps its business id, with a new attempt and trace links. It rechecks permissions, retention, deletion and the latest config.</p>`);
  const railQueue = () => REPLAY() + `${refused('R12', 'A replay never crosses environments. A dev job cannot be replayed into prod.')}`;

  const deadHead = () => runHead('job_3e9a, dead-lettered', 'Collection · run_8d02 · quarantined', BAD('bound reached: escalated'), `${FAIL_LINE} ${LAST_GOOD}`);
  const deadOK = (read = true) => box(`${lbl('A dead-letter item opens here')}<p class="small muted" style="margin-top:6px">${read ? 'None is held now. ' : ''}This is where one lands, with its reason and its run. HSBC's late price raised an incident, not a dead-letter item.</p>`) + lateHead() + tagged(proposed('DATA-DEC-02'), 'How late is late is not approved.') + ladder(AUTO, YOURS) + `<div>${bs('Open inc_0012', 'primary')}</div>`;
  const deadRegion = ctx => region(ctx, {
    what: 'This item', rows: 4, ok: deadOK,
    loading: () => skel(4),
    empty: () => stateCard('check', 'No dead-letter item on record', 'Nothing has reached a dead-letter queue, and no job has run yet either, so this proves nothing.', bs('Back to the queues', 'tinted')),
    partial: () => banner('warn', 'Part of this is unread.', 'The UK run record did not answer, so an item may be there that this does not show.', 'clock') + deadOK(false),
    error: () => deadHead() + failTL() + ladder(AUTO, YOURS) + `<div>${bs('Open inc_0013', 'primary')}</div>`,
    stale: () => banner('warn', 'Stale.', 'From 11:12. A newer dead-letter item may exist, so the alarm is unknown, not clear.', 'clock') + deadOK(false),
    offline: () => offline(ctx, 'this item') + deadOK(false),
    conflict: () => runHead('job_3e9a, held', 'Collection · run_8d02', WARN('reconcile_required', 'split'), 'It is not dead-lettered and not clear. An ambiguous call is reconciled, not repeated.') + ladder(AUTO, YOURS) + tagged(proposed('CT-05'), 'What the reconciler may conclude is open.'),
    expired: () => banner('warn', 'This item\'s replay was refused for age.', 'A replay rechecks retention first, and this source access has expired. No window is approved, so none is shown.', 'clock') + ladder(AUTO, YOURS) + tagged(proposed('CT-14'), 'Replay limits are not approved yet.'),
    denied: () => banner('warn', 'Replay needs a fresh sign-in, on the incident.', 'Opening the app with Face ID, or an open session, is not enough. The server checks a fresh sign-in.', 'lock') + deadOK()
  });

  J.add({
    id: 'runs', title: 'Runs and health', stories: ['MP-80', 'MP-94', 'MP-96', 'MP-89', 'MP-91', 'MP-95', 'MP-109', 'MP-110'],
    summary: 'Did tonight\'s clock run, per market, and what did each run use. Reading is open in every state, and a quiet list is never read as healthy.',
    options: [{
      id: 'a', name: 'Tonight\'s clock', rec: true,
      why: 'What matters each day is whether each market made its four clocks, so that comes first and the runs follow. A missed run shows as a gap in a place you already look.',
      cost: 'Imports, Claude calls and training are one tap further away. The list of everything is not on the first screen.',
      covers: {
        compare: 'a-compare',
        decide: 'n/a: Runs approves nothing. A broad replay is approved on the linked incident, in Incidents and recovery.',
        source: 'a-run', correct: 'a-recover',
        config: 'n/a: Changing the clocks is an owner decision and retention goes through Terraform, so neither has a control here.',
        cost: 'a-run', recover: 'a-recover'
      },
      screens: [{
        id: 'a-clock', title: 'Tonight\'s clock',
        note: 'In Ready, at 11:40 India has issued and the UK and US wait for their close. The clock follows POLICY-002, and the owner journeys now say the same: each market freezes its cutoff at +60 and issues by +75 (ADM-22, MP-186). run_8cf7, run_8d6e, run_8bf3, run_8dc4, run_8ce2 and run_8bd0 are illustrative ids.',
        render: ctx => frame(ctx, {
          title: 'Tonight\'s clock', back: 'Admin',
          body: region(ctx, {
            what: 'The clock', rows: 4, ok: () => `${india()}${uk()}${us()}${CLOCK_NOTE()}${ranOK()}`,
            loading: () => `<div class="small muted">Last good 11:20. Clock times come from the versioned calendars.</div>` + skel(3),
            empty: () => stateCard('clock', 'No market has run yet', 'The first collection starts at +15 after the first eligible close. No run means no evidence, and never a pass.') + us(PLAIN('Waiting for close'), DUE, [['Watermark', 'None yet'], ['Last success', 'None yet'], ['Next due', 'Tonight 21:15']]),
            partial: () => banner('warn', 'Partial.', 'India and the US answered. The UK run record did not, so it shows unknown and never on time.', 'clock') + india() + uk(WARN('Unknown'), GAP, [['Watermark', 'Not read'], ['Last success', 'Not read'], ['Next due', 'Not read']]) + us() + ranOK({ uk: ukUnread(), ukMon: ukUnread('Mon') }),
            error: () => banner('fall', FAIL_LINE, `${LAST_GOOD}.`, 'alert') + india() + uk() + us(BAD('missed_origin · Tue'), DUE, [['Watermark', 'Mon close'], ['Last success', 'Mon 21:15'], ['Next due', 'Tonight 21:15']], para('Tuesday stays missed, and is never backfilled. Tonight runs normally.')) + ranFailed(),
            stale: () => banner('warn', 'Stale.', 'From 11:12. India has no record of its 10:15 collection, so it is stale, not on time.', 'clock') + india(WARN('stale'), ['late', 'late', 'late', 'due'], [['Watermark', 'Tue close'], ['Last success', 'Tue 10:15'], ['Next due', 'Today 10:15, past']], para('stale: its last success is older than its next due time.')) + uk() + us() + ranOK({ noIndia: true }),
            offline: () => offline(ctx, 'the clock') + india() + uk() + us() + ranOK(),
            conflict: () => banner('warn', 'Two records disagree.', 'US, Tue: run_8d02 says succeeded, and job_3e9a says reconcile_required, because a Twelve Data call got no answer. It counts as neither until the reconciler settles it.', 'split') + india() + uk() + us(WARN('reconcile_required · Tue', 'split'), DUE, [['Watermark', 'Mon close · Tue held'], ['Last success', 'Mon 21:15 · Tue held by the reconciler'], ['Next due', 'Tonight 21:15']], tagged(proposed('CT-05'), 'What a held night does to the watermark is not approved.')) + ranOK({ tue: tue(WARN('reconcile_required', 'split')), hsbc: hsbc(BAD('Reopened', 'refresh')) }),
            expired: () => banner('warn', 'The live stream closed.', 'Your session ended it, so this is a fresh read at 18:05, not a live view. Reading needs no sign-in here.', 'clock') + india() + uk(OK('Issued 17:50'), DONE, [['Watermark', 'Wed close · HSBC last price Tue 14:10'], ['Last success', 'Wed 16:50'], ['Next due', 'Thu 16:50']]) + us() + ranOK({ top: runRow('Forecast run, Wed 4 Nov 16:50', 'run_8dc4 · UK · HSBC late · issued 17:50', OK('Succeeded')) }),
            denied: () => banner('warn', 'Reading needs no fresh sign-in.', 'Nothing here can be changed, so nothing here asks for one. A refused act says so, and it never blanks what you may read.', 'lock') + refused('R4', 'A frozen cutoff cannot be moved and an origin cannot be backdated, by anyone, you included.') + india() + uk() + us() + ranOK()
          }),
          rail: railClock(ctx)
        })
      }, {
        id: 'a-run', title: 'Run run_8d02',
        note: 'One run shows the exact versions, guards, attempts and reservation behind it. It is the US run, as PH03-S09 runs each market apart: it collects from 21:15, freezes its cutoff at 22:00, issues 22:15 and prices the 3 US holdings, as the owner journeys now say (ADM-10, ADM-22, MP-186). Failed has Twelve Data failing at 21:16, after the 21:15 start, and records missed_origin only at the 22:00 freeze (ADM-11). Denied shows Claude off, with no Claude spend.',
        render: ctx => frame(ctx, { title: 'run_8d02', back: 'Tonight\'s clock', body: runRegion(ctx), rail: railRun(ctx) })
      }, {
        id: 'a-job', title: 'Job job_3e9a',
        render: ctx => frame(ctx, { title: 'job_3e9a', back: 'run_8d02', body: jobRegion(ctx), rail: railJob(ctx) })
      }, {
        id: 'a-compare', title: 'Two nights',
        render: ctx => frame(ctx, { title: 'Two nights', back: 'Tonight\'s clock', body: cmpRegion(ctx), rail: railCmp(ctx) })
      }, {
        id: 'a-recover', title: 'When a run goes wrong',
        note: 'Replay and rollback are decided on the incident, so this screen says who may do what and opens it. There is no cancel control: permissions.json lists no such act.',
        render: ctx => frame(ctx, { title: 'When it goes wrong', back: 'Tonight\'s clock', body: recoverRegion(ctx), rail: railRecover() })
      }]
    }, {
      id: 'b', name: 'Run list',
      why: 'Every run, job and queue sits in one newest-first list with its attempts and evidence. Nothing has to be remembered to be found.',
      cost: 'Whether tonight is on time has to be read across rows. A market that did not run leaves no row, so a gap is easy to miss.',
      covers: {
        compare: 'b-compare',
        decide: 'n/a: Runs approves nothing. A broad replay is approved on the linked incident, in Incidents and recovery.',
        source: 'b-detail', correct: 'b-dead',
        config: 'n/a: Changing the clocks is an owner decision and retention goes through Terraform, so neither has a control here.',
        cost: 'b-detail', recover: 'b-dead'
      },
      screens: [{
        id: 'b-list', title: 'Every run',
        note: 'run_8cf7, run_8d6e, run_8bf3, run_8ce2 and run_8bd0 are illustrative ids.',
        render: ctx => frame(ctx, {
          title: 'Runs', back: 'Admin',
          body: filters('All') + listRegion(ctx),
          rail: railList(ctx)
        })
      }, {
        id: 'b-detail', title: 'Run run_8d02',
        note: 'Attempts and evidence on one screen, with no separate job screen.',
        render: ctx => frame(ctx, { title: 'run_8d02', back: 'Runs', body: detailRegion(ctx), rail: railDetail(ctx) })
      }, {
        id: 'b-queues', title: 'Queues',
        note: 'Depths are shown only where the records were read. Unknown is never zero.',
        render: ctx => frame(ctx, { title: 'Queues', back: 'Runs', body: queueRegion(ctx), rail: railQueue() })
      }, {
        id: 'b-compare', title: 'Compare two runs',
        render: ctx => frame(ctx, { title: 'Compare', back: 'Runs', body: cmpRegion(ctx), rail: railCmp(ctx) })
      }, {
        id: 'b-dead', title: 'Dead-letter item',
        render: ctx => frame(ctx, { title: 'Dead-letter item', back: 'Queues', body: deadRegion(ctx), rail: railRecover() })
      }]
    }]
  });
}
