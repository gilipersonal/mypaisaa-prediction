/* Admin home: where admin starts, and what needs the owner (MP-64, ARC-08, CT-16). Every figure is illustrative. */
{
  const QUIET = { default: 'Nothing here is urgent', loading: 'Reading the records', empty: 'Nothing waits on you', partial: '3 of 4 sources answered', error: 'Records failed at 11:38', stale: 'From 11:12', offline: 'From 11:20', conflict: 'A record changed while you read', expired: 'One request ran out of time', denied: 'A fresh sign-in is needed' };
  const NEEDS = [
    ['check', '', '4 decisions wait on you', 'Next: Taiwan Semiconductor, 18:00', 'approvals'],
    ['pause', 'warn', '1 paused scope waits on your restart', 'US tech, 12 months', 'models'],
    ['alert', 'warn', '1 incident acknowledged, not resolved', 'HSBC price late · detected Tue 16:50', 'incidents'],
    ['layers', 'warn', '1 original due for renewal', 'Indian funds statement, due in Dec 2026', 'files']
  ];
  const PLACE_LINE = {
    files: '8 originals kept · 1 draft waiting', audit: 'Lineage complete · digest only', runs: 'US run Tue 21:15 · succeeded', agents: '7 routes · 5 code workers',
    models: 'R2-HGB v4 waits on you · US tech 12 months paused', approvals: 'Settings v9 · catalogue v14', costs: '£46.42 committed · day 18 of 30', incidents: '1 not resolved · last restore passed', identity: '2 usable paths · passkey waits on the Developer Program'
  };
  /* each state changes what a place can say, so no line claims more than the records know */
  const suffix = t => Object.fromEntries(Object.entries(PLACE_LINE).map(([k, v]) => [k, `${v} · ${t}`]));
  const LINES = {
    loading: Object.fromEntries(Object.keys(PLACE_LINE).map(k => [k, 'Reading · last good 11:20'])),
    empty: { files: '8 originals kept · nothing waiting', models: 'No candidate waits · no scope paused', incidents: 'None open · last restore passed', approvals: 'Settings v10 · catalogue v15' },
    partial: { costs: 'Not read: billing did not answer' },
    error: { ...suffix('from 11:20'), runs: 'US run Tue · failed · from 11:20', models: 'R2-HGB v4 incomplete · US tech 12 months paused · from 11:20', audit: 'Query incomplete · from 11:20', incidents: '2 not resolved · last restore passed · from 11:20' }, stale: suffix('from 11:12'), offline: suffix('from 11:20'),
    conflict: { approvals: 'Settings v10 was written at 09:01', runs: 'US run Tue · held', models: 'R2-HGB v4 evidence changed · US tech 12 months paused', incidents: '2 not resolved · production recorded lost' },
    expired: { approvals: 'Taiwan Semiconductor expired at 18:00' }
  };
  const lineOf = (ctx, k) => (LINES[ctx.state] || {})[k] ?? PLACE_LINE[k];
  const hot = ctx => ctx.state !== 'empty';   // an incident is open in every world but Empty
  const FIRST = { expired: { 0: ['3 decisions wait on you', 'Next: Promote R2-HGB v4, Fri 18:00'] }, conflict: { 0: ['3 decisions wait on you', 'Next: Taiwan Semiconductor, 18:00'], 2: ['2 incidents not resolved', 'Production recorded lost · HSBC price late, reopened'] }, error: { 2: ['2 incidents not resolved', 'Forecast run failed · HSBC price late'] } };
  const needs = ctx => list(NEEDS.map(([i, t, a, b], n) => { const [x, y] = (FIRST[ctx.state] || {})[n] || [a, b]; return item(lead(i, t), x, y, ic('chev-r', 's18'), '', false, true); }).join(''));
  const places = (ctx, n = PLACES.length) => list(PLACES.slice(0, n).map(([k, name, i]) => item(lead(i), name, lineOf(ctx, k), ic('chev-r', 's18'), '', false, true).replace('role="button"', `role="button" data-go="${k}"`)).join(''));
  const tiles = ctx => `<div class="ahome-grid">${PLACES.map(([k, name, i]) => `<div class="card ahome-tile" role="button" tabindex="0" data-go="${k}" aria-label="${name}. ${lineOf(ctx, k)}" data-mo="card">${lead(i, k === 'incidents' && hot(ctx) ? 'warn' : '')}<b>${name}</b><span class="small">${lineOf(ctx, k)}</span></div>`).join('')}</div>`;
  const WAITS = (n, inc = '1 incident') => `${n} decisions wait on you. 1 paused scope waits on your restart. ${inc} not resolved.`;
  const WAIT = WAITS(4);
  /* what "Anything that writes or widens" (OWN-39) leaves open: how recent the fresh sign-in must be (CT-01) */
  const RECENT = 'How recent a sign-in must be is still open.';
  /* follows the owner Approvals strip: what it says changes with what is known */
  const topOf = ctx => ({
    default: banner('warn', WAIT, 'Next: Taiwan Semiconductor, 18:00. HSBC price late, detected Tue 16:50.', 'alert'),
    loading: banner('', 'Checking what waits on you.', 'Last good 11:20.', 'clock'),
    empty: banner('', 'Nothing waits on you.', 'Runs, audit and costs stay here to read. Silence is not a sign that nothing is wrong, so the last run and the last restore always show.', 'check'),
    partial: banner('warn', '3 of 4 sources answered.', `Costs and budgets did not answer, so its line is unknown, not zero. ${WAIT}`, 'clock'),
    error: banner('fall', 'Could not check what waits.', 'Records failed at 11:38. Open proposals keep their expiry, and each place shows its line from 11:20.', 'alert'),
    stale: banner('warn', WAIT, 'From 11:12 · each rechecks itself when opened.', 'clock'),
    offline: banner('', WAIT, 'From 11:20. Reading only. No financial write offline.', 'wifi-off'),
    conflict: `${banner('warn', 'Settings changed while you read.', `Settings v10 was written at 09:01, so a proposal built on v9 needs a new look. Nothing was applied. ${WAITS(3, '2 incidents')} Production is recorded lost. You recorded it at 11:31, and the switch waits in Recovery.`, 'split')}<div>${settled('ADM-05')}</div>`,
    expired: banner('warn', WAITS(3), 'Taiwan Semiconductor expired at 18:00. It changed nothing.', 'clock'),
    denied: `${banner('warn', 'Reading needs no fresh sign-in. Every change that writes or widens does.', `Most stops need none, such as revoking an approval. Revoking a device still does, because it removes a passkey. Each control says what it needs before you press it. ${RECENT} ${WAIT}`, 'lock')}<div>${settled('OWN-39')}${settled('OWN-16')}${proposed('CT-01')}</div>`
  }[ctx.state]);
  const bBody = ctx => `${wide(ctx) && ctx.state !== 'empty' ? '' : topOf(ctx)}${ctx.state === 'error' ? `<div>${bs('Try again', 'tinted', 'refresh')}</div>` : ''}${tiles(ctx)}`;
  const note = () => `<p class="small">Admin sits under Settings. Phones read and acknowledge; changes happen on iPad or desktop, and account recovery works anywhere.</p>`;
  const state = (ctx, ok, what) => region(ctx, {
    what, rows: 5, ok,
    empty: () => banner('', 'Nothing waits on you.', 'Runs, audit and costs stay here to read. Silence is not a sign that nothing is wrong, so the last run and the last restore always show.', 'check') + places(ctx),
    denied: () => banner('warn', 'Reading needs no fresh sign-in. Every change that writes or widens does.', `Most stops need none, such as revoking an approval. Revoking a device still does, because it removes a passkey. Each control says what it needs before you press it, and nothing is pre-approved. ${RECENT}`, 'lock') + `<div>${settled('OWN-39')}${settled('OWN-16')}${proposed('CT-01')}</div>` + ok()
  });
  J.add({
    id: 'home', title: 'Admin home', stories: ['MP-64'],
    summary: 'Where admin starts: nine places of equal size, each with one line of status, and what waits on you beside them or, on a phone, above them. Cost stays one tap from the main app as well (MP-142).',
    options: [{
      id: 'a', name: 'What needs you', rec: true,
      why: 'Admin is opened when something is wrong or waiting, so the first thing on screen is what needs you. The nine places follow, each with one line of status.',
      cost: 'A long list on a phone. The places sit below the fold when much is waiting.',
      screens: [{
        id: 'a-home', title: 'Admin home', note: 'Rules v6, a switch forward, a factor, a route change and the release thresholds stay open with no date, so they sit outside the count.',
        render: ctx => frame(ctx, {
          title: 'Admin', back: 'Settings',
          body: state(ctx, () => `${sec('Needs you')}${needs(ctx)}${sec('Places')}${places(ctx)}`, 'Admin'),
          rail: `${box(`${lbl('Last run')}<p class="small" style="margin-top:6px">${QUIET[ctx.state]}</p>${kv([['Forecast run', ctx.state === 'error' ? 'Mon 21:15 · cutoff 22:00 · issued 22:15, last good' : 'Tue 21:15 · cutoff 22:00 · issued 22:15'], ['Restore exercise', 'Passed · Sun 1 Nov'], ['Environment', 'Prod']])}`)}${note()}`
        })
      }]
    }, {
      id: 'b', name: 'Nine places',
      why: 'A plain directory. Every place is the same size, so nothing is pushed out of reach, and the shape never changes with what is waiting.',
      cost: 'What needs you is one line among nine, so an open incident is easier to miss.',
      screens: [{
        id: 'b-home', title: 'Admin home', note: 'Rules v6, a switch forward, a factor, a route change and the release thresholds stay open with no date, so they sit outside the count.',
        render: ctx => frame(ctx, {
          title: 'Admin', back: 'Settings',
          body: bBody(ctx),
          rail: `${wide(ctx) && ctx.state !== 'empty' ? topOf(ctx) : ''}${note()}`
        })
      }]
    }]
  });
}
