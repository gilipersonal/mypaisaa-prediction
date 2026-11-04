/* Admin home: where admin starts, and what needs the owner (MP-64, ARC-08, CT-16). Every figure is illustrative. */
{
  const OPEN_ID = () => proposed('CT-16');
  const QUIET = { default: 'Nothing here is urgent', loading: 'Reading the records', empty: 'Nothing waits on you', partial: '3 of 4 sources answered', error: 'Records failed at 11:38', stale: 'From 11:12', offline: 'From 11:20', conflict: 'A record changed while you read', expired: 'One request ran out of time', denied: 'A fresh sign-in is needed' };
  const NEEDS = [
    ['check', '', '4 decisions wait on you', 'Next: Taiwan Semiconductor, 18:00', 'approvals'],
    ['alert', 'warn', '1 incident acknowledged, not resolved', 'HSBC price late · detected Tue 16:50', 'incidents'],
    ['layers', 'warn', '1 original due for renewal', 'Indian funds statement, due in Dec 2026', 'files']
  ];
  const PLACE_LINE = {
    files: '6 originals kept · 1 draft waiting', audit: 'Lineage complete · digest only', runs: 'Last run Tue 21:15 · succeeded', agents: 'Claude off until credit is verified',
    models: 'R2-HGB v4 waits on you · US tech 12 months paused', approvals: 'Settings v10 · catalogue v15', costs: '£46.42 committed · day 18 of 30', incidents: '1 open · last restore passed', identity: '3 healthy sign-in paths'
  };
  const needs = ctx => list(NEEDS.map(([i, t, a, b]) => item(lead(i, t), a, b, ic('chev-r', 's18'), '', false, true)).join(''));
  const places = (ctx, n = PLACES.length) => list(PLACES.slice(0, n).map(([k, name, i]) => item(lead(i), name, PLACE_LINE[k], ic('chev-r', 's18'), '', false, true)).join(''));
  const tiles = ctx => `<div class="ahome-grid">${PLACES.map(([k, name, i]) => `<div class="card ahome-tile" role="button" tabindex="0" aria-label="${name}. ${PLACE_LINE[k]}" data-mo="card">${lead(i)}<b>${name}</b><span class="small">${PLACE_LINE[k]}</span></div>`).join('')}</div>`;
  const note = () => `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${OPEN_ID()}<span class="small">Where admin lives is open. Drawn under Settings.</span></div>`;
  const state = (ctx, ok, what) => region(ctx, {
    what, rows: 5, ok,
    empty: () => banner('', 'Nothing waits on you.', 'Runs, audit and costs stay here to read. Silence is not a sign that nothing is wrong, so the last run and the last restore always show.', 'check') + places(ctx),
    denied: () => banner('warn', 'Reading needs no fresh sign-in. Changing something does.', 'Each action says so before you press it, and nothing is pre-approved.', 'lock') + ok()
  });
  J.add({
    id: 'home', title: 'Admin home', stories: ['MP-64'],
    summary: 'Where admin starts: what needs you first, then the nine places. Cost stays one tap from the main app as well (MP-142).',
    options: [{
      id: 'a', name: 'What needs you', rec: true,
      why: 'Admin is opened when something is wrong or waiting, so the first thing on screen is what needs you. The nine places follow, each with one line of status.',
      cost: 'A long list on a phone. The places sit below the fold when much is waiting.',
      screens: [{
        id: 'a-home', title: 'Admin home', note: 'The promise on the Approvals journey, "the full audit sits in the admin area", lands here.',
        render: ctx => frame(ctx, {
          title: 'Admin', back: 'Settings',
          body: state(ctx, () => `${sec('Needs you')}${needs(ctx)}${sec('Places')}${places(ctx)}`, 'Admin'),
          rail: `${box(`${lbl('Last run')}<p class="small" style="margin-top:6px">${QUIET[ctx.state]}</p>${kv([['Forecast run', 'Tue 21:15 · cutoff 21:00'], ['Restore exercise', 'Passed · Sun 1 Nov'], ['Environment', 'Prod']])}`)}${note()}`
        })
      }]
    }, {
      id: 'b', name: 'Nine places',
      why: 'A plain directory. Every place is the same size, so nothing is pushed out of reach, and the shape never changes with what is waiting.',
      cost: 'What needs you is one line among nine, so an open incident is easier to miss.',
      screens: [{
        id: 'b-home', title: 'Admin home',
        render: ctx => frame(ctx, {
          title: 'Admin', back: 'Settings',
          body: state(ctx, () => tiles(ctx), 'Admin'),
          rail: `${banner('', '4 decisions wait on you.', 'Next: Taiwan Semiconductor, 18:00.', 'check')}${note()}`
        })
      }]
    }]
  });
}
