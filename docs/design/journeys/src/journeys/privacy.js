/* Privacy: sign in, a new or lost device, privacy mode, what shows outside the app, sessions and revocation, notices, the
   offline copy, export, deleting an original and memory notes (MP-73, MP-87, MP-78, MP-166, MP-165, MP-167, MP-162, MP-169,
   MP-45, MP-115). Google and passkeys only: no passwords, and no Sign in with Apple until the owner buys the Developer
   Program. Revocation time and assurance levels are open (CT-01, CT-17), so no exact window is promised. */
{
  const wide = ctx => ctx.kind === 'web' || ctx.kind === 'ipad';
  /* frame()'s freshness row speaks for prices. A failed export is not a failed price, so only loading and offline pass through. */
  const fx = ctx => (ctx.state === 'loading' || ctx.state === 'offline' ? ctx : { ...ctx, state: 'default' });
  const chipOf = ([kind, text, icon]) => `<span class="chip ${kind}" data-mo="chip">${icon ? ic(icon, 's14') : '<span class="dot"></span>'}${text}</span>`;
  const proposed = q => chipOf(['proposed', `Proposed · ${q}`]);
  const box = inner => `<div class="card fcard privacy-box" data-mo="card">${inner}</div>`;
  const head = (t, right = '') => `<div class="privacy-head"><h3>${t}</h3>${right}</div>`;
  const li = (icon, t, s, e = '', cls = '') => `<div class="privacy-li${icon ? '' : ' plain'}${cls ? ' ' + cls : ''}" data-mo="rise">${icon ? `<span class="privacy-ic">${ic(icon, 's18')}</span>` : ''}<div style="min-width:0"><div class="t">${t}</div>${s ? `<div class="s">${s}</div>` : ''}</div><div class="e">${e}</div></div>`;
  const list = rows => `<div class="privacy-list">${rows.join('')}</div>`;
  const wbtn = (label, kind = 'primary', icon = '', dis = false) => `<button class="btn btn-${kind}" type="button"${dis ? ' disabled' : ''}>${icon === 'spin' ? '<span class="spin" aria-hidden="true"></span>' : icon ? ic(icon, 's18') : ''}${label}</button>`;
  const smbtn = (label, kind = 'tinted', dis = false) => `<button class="btn sm btn-${kind}" type="button"${dis ? ' disabled' : ''}>${label}</button>`;
  const sw = (label, on, dis = false) => `<button class="dimctl privacy-switch" type="button" role="switch" aria-checked="${on}" aria-label="${label}"${dis ? ' disabled' : ''}><span>${on ? 'On' : 'Off'}</span><span class="sw2"><i></i></span></button>`;
  const go = `<span class="muted" style="display:inline-grid">${ic('chev-r', 's16')}</span>`;
  const sk = (w, h = 14) => `<span class="sk" style="height:${h}px;width:${w}"></span>`;
  const skCard = (t, n = 3) => box(`${head(t, chipOf(['fresh', 'Last good 21:15']))}<div style="display:grid;gap:10px">${Array.from({ length: n }, (_, i) => sk(`${92 - i * 12}%`)).join('')}</div>`);
  /* the dock has five tabs and the sidebar six, so Settings is 4 on a phone and 5 on iPad and desktop */
  const settings = ctx => (wide(ctx) ? 5 : 4);
  const NA_MODEL = 'No forecast is on this screen, so a missing model cannot arise';

  /* ---------- signed out: a cover, so no tabs and no data sit behind it ---------- */
  const cover = (ctx, inner, bare = false) => `<div class="privacy-cover${ctx.kind === 'web' ? ' web' : ''}${wide(ctx) ? ' wide' : ''}${bare ? ' bare' : ''}"><div class="dfield"></div><div class="privacy-in">${inner}</div></div>`;
  const brand = (p = 'Private forecasts for one owner.') => `<div class="privacy-brand" data-mo="rise"><span class="brand-mark" aria-hidden="true"></span><h2>MyPrediction</h2><p>${p}</p></div>`;
  const SIGN = {
    loading: banner('', 'Waiting for Google.', 'Finish in the window it opened. Nothing is signed in yet.', 'clock'),
    empty: banner('', 'New device.', 'No passkey here yet. Use Google, then confirm on a device you trust.', 'shield'),
    error: banner('warn', 'Google cannot be reached.', 'Your passkey still works. Google comes back when the provider does.', 'alert'),
    stale: banner('warn', 'Your session expired.', 'Sign in to carry on. An approval you had not finished needs a fresh yes.', 'clock'),
    offline: banner('', 'Offline.', 'Sign-in needs a connection. Try again when you are back online.', 'wifi-off'),
    disagreement: banner('fall', 'That sign-in did not work here.', 'Use the account and environment you set up. A matching email is never enough.', 'split'),
    abstention: banner('warn', 'Sign-in is paused.', 'Too many tries. Wait a few minutes, then try again.', 'ban')
  };
  function signButtons(ctx) {
    const s = ctx.state, off = ['loading', 'offline', 'abstention'].includes(s);
    return `${s === 'empty' ? wbtn('Continue with Google', 'primary', 'person') + wbtn('Continue with a passkey', 'tinted', 'lock') : wbtn('Continue with a passkey', 'primary', 'lock', off) + wbtn(s === 'loading' ? 'Waiting for Google' : s === 'error' ? 'Google unavailable' : 'Continue with Google', 'tinted', s === 'loading' ? 'spin' : 'person', off || s === 'error')}`;
  }
  const signIn = ctx => `${brand()}${SIGN[ctx.state] || ''}<div class="privacy-acts" data-mo="rise">${signButtons(ctx)}${wbtn('Lost a device?', 'plain')}<div class="privacy-chips" style="justify-content:center">${illus('No passwords')}${illus('Production')}</div></div>`;
  const signSheet = ctx => `<div class="sheet privacy-sheet" role="dialog" aria-modal="true" aria-label="Sign in" data-mo="sheet">${wide(ctx) ? '' : '<div class="grabber"></div>'}<h4>Welcome back</h4>${SIGN[ctx.state] || '<p class="small muted">Your passkey is ready on this device.</p>'}${ctx.state === 'empty' ? wbtn('Continue with Google', 'primary', 'person') : wbtn('Continue with a passkey', 'primary', 'lock', ['loading', 'offline', 'abstention'].includes(ctx.state))}<details><summary>Other ways in</summary><div class="privacy-sheet" style="padding-bottom:6px">${ctx.state === 'empty' ? wbtn('Continue with a passkey', 'tinted', 'lock') : wbtn(ctx.state === 'error' ? 'Google unavailable' : 'Continue with Google', 'tinted', 'person', ['loading', 'offline', 'abstention', 'error'].includes(ctx.state))}</div></details>${wbtn('Lost a device?', 'plain')}</div>`;

  /* ---------- a new device, or a lost one ---------- */
  const step = (n, t, s, st = '') => `<li class="privacy-step ${st}" data-mo="rise"><span class="n">${st === 'done' ? ic('check', 's16') : n}</span><div style="min-width:0"><b>${t}</b><p>${s}</p></div></li>`;
  function deviceSteps(ctx) {
    const s = ctx.state;
    const stale = s === 'stale', two = {
      loading: ['Confirm on a device you trust', 'Waiting for your passkey. Keep this screen open.'],
      stale: ['Confirm on a device you trust', 'That request expired, so nothing changed. Start this step again.'],
      error: ['Confirm on a device you trust', 'That did not finish. Nothing is linked and the attempt is on your audit trail.']
    }[s] || ['Confirm on a device you trust', 'Use a passkey on your iPhone or Mac. An open app does not count.'];
    return `<ol class="privacy-steps">${step(1, 'Signed in with Google', stale ? 'Earlier today, on this device' : 'Just now, on this device', 'done')}${step(2, two[0], two[1], 'now')}${step(3, 'Lost a device? Revoke it', 'Optional. Ends its sessions and closes its live streams.')}${step(4, 'Add a passkey here', 'So this device can sign in by itself.')}</ol>`;
  }
  function deviceFlow(ctx) {
    const s = ctx.state;
    const top = `<div class="privacy-brand" data-mo="rise"><h2 style="margin:0;font-size:28px;line-height:34px">Set up this device</h2><p style="font-size:15px;line-height:20px">Also the way back after a lost device.</p></div>`;
    if (s === 'empty') return `${top}${banner('warn', 'No other device to confirm on.', 'Follow your written recovery steps. Your Google sign-in is the path that remains.', 'alert')}${deviceSteps(ctx)}<div class="privacy-acts">${wbtn('Open the recovery steps')}${wbtn('Cancel', 'plain')}</div>`;
    if (s === 'abstention') return `${top}${stateCard('lock', 'Locked out', 'No path is left, so only your written procedure applies. No admin, support route, email or SMS can recover this account for you.', wbtn('Open the written procedure', 'tinted'))}`;
    const note = {
      offline: banner('', 'Offline.', 'This needs a connection. Your sign-in paths stay as they are.', 'wifi-off'),
      disagreement: banner('fall', 'The email matches, the account does not.', 'A matching email never links two identities. Both stay unlinked.', 'split'),
      error: banner('fall', 'This step did not finish.', 'Both identities stay unlinked. Try again, or cancel.', 'alert')
    }[s] || '';
    const dis = s === 'offline' || s === 'disagreement' || s === 'loading';
    return `${top}${note}${deviceSteps(ctx)}<div class="privacy-acts" data-mo="rise">${wbtn(s === 'loading' ? 'Waiting for your passkey' : s === 'error' || s === 'stale' ? 'Try again' : 'Confirm with a passkey', 'primary', s === 'loading' ? 'spin' : 'lock', dis)}${wbtn('Cancel', 'plain')}<p class="small muted" style="text-align:center">Nothing changes until the last step. Your old paths stay as they are.</p></div>`;
  }

  /* ---------- privacy mode: money masked, percentages kept ---------- */
  const maskRow = (h, mid) => `<div class="hrow" data-mo="rise">${logo(h.c, h.lg)}<div style="min-width:0"><div class="nm">${h.n}</div><div class="tk">${h.t} · ${h.v}</div></div><div class="vv"><div class="val"><span class="priv">£••••</span></div>${chg(h.day)}</div><div class="fl">${mid}</div></div>`;
  function masked(ctx, h) {
    const s = ctx.state;
    if (s === 'noModel') return maskRow(h, `<span class="chip">${ic('cube', 's14')}No approved model</span>`);
    if (s === 'abstention' && h.t === 'RELIANCE') return maskRow(h, `<span class="chip">${ic('ban', 's14')}Abstained · no range shown</span>`);
    if (s === 'disagreement' && h.t === 'RELIANCE') return maskRow(h, `<div style="flex:1;min-width:0;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:4px 8px;align-items:center;font:600 12px/16px var(--font-text);letter-spacing:0;color:var(--ink-2)"><span>Baseline</span>${range({ ...h, med: -1.5, lo: -14, hi: 11, lo50: -7.5, hi50: 4 })}<span>${pct(-1.5)}</span><span>R2-HGB v3</span>${range({ ...h, med: 2.8, lo: -6.5, hi: 12.4, lo50: -1.6, hi50: 7.6 })}<span>${pct(2.8)}</span></div>`);
    if (s === 'offline') return maskRow(h, `<div class="rangewrap">${range(h)}</div><span class="fcv">${pct(h.med)} · 6M</span><span class="chip offline">${ic('clock', 's14')}Saved 21:15</span>`);
    return hrow(h, { priv: true });
  }
  const maskValue = () => `<div class="privacy-row"><span class="label">Portfolio value</span>${illus()}</div><div><span class="amt priv" style="font-size:30px">£•••••</span></div><div class="privacy-row" style="justify-content:flex-start;font-size:15px;line-height:20px">${chg(1, '+1.48%')}<span class="small muted">today</span></div>`;
  const maskCopy = 'Amounts hidden. Percentages and ranges stay visible. Tap to show for 30 seconds.';
  function modeCard(ctx) {
    if (ctx.state === 'loading') return skCard('Privacy mode', 3);
    return box(`${head('Privacy mode', sw('Hide amounts', true))}<p class="small muted">${maskCopy}</p><div class="privacy-list">${maskValue()}</div><div class="card" style="box-shadow:inset 0 0 0 1px var(--hairline)">${[byT.AAPL, byT.RELIANCE].map(h => masked(ctx, h)).join('')}</div>`);
  }

  /* ---------- what shows outside the app ---------- */
  const glances = () => `<div class="privacy-glances">
    <figure><div class="privacy-g lock" role="img" aria-label="Lock screen: the time and one neutral notice, no amounts or names"><span class="time">9:41</span><span class="privacy-n"><b>MyPrediction</b>You have a new notice</span></div><figcaption>Lock screen<span>Neutral text</span></figcaption></figure>
    <figure><div class="privacy-g" role="img" aria-label="App switcher: a covered snapshot"><span class="brand-mark" aria-hidden="true"></span><span>Covered</span></div><figcaption>App switcher<span>Snapshot covered</span></figcaption></figure>
    <figure><div class="privacy-g wid" role="img" aria-label="Widget: no holdings shown"><span class="brand-mark" aria-hidden="true"></span><span>Open to view</span></div><figcaption>Widget<span>No holdings</span></figcaption></figure></div>`;
  function outside(ctx) {
    if (ctx.state === 'loading') return skCard('Outside the app', 2);
    return box(`${head('Outside the app', chipOf(['fresh', 'Private default']))}${glances()}${list([li('eye-off', 'Less private options', 'Each one is a setting you approve', ctx.state === 'error' ? chipOf(['error', 'Not saved', 'alert']) : `<span class="small muted">All off</span>`), li('shield', 'Shared content', 'Leaves out holdings values. Nothing is attached without you', '')])}`);
  }

  /* ---------- notices ---------- */
  const NOTICES = [
    ['alert', 'Cost warning reached', 'Forecast passed £60 · 08:12', 1],
    ['clock', 'HSBC price is stale', 'Last price 16:35 · 16:50', 1],
    ['fan', 'Morning brief', '3 items · 07:30', 0],
    ['check', 'Forecast run finished', '21 runs · yesterday 21:30', 0]
  ];
  const noticeRows = (n, chip = '') => list(NOTICES.slice(0, n).map(([i, t, s, u]) => li(i, t, s, chip || go, u ? 'unread' : '')));
  function inbox(ctx, n = 3) {
    const s = ctx.state;
    if (s === 'loading') return skCard('Notices', 3);
    if (s === 'empty') return box(`${head('Notices')}<p class="small muted">No notices yet. Silence is not a sign that nothing is wrong: check your record and data status.</p>`);
    const top = { error: banner('fall', 'Notices did not load.', 'They failed at 21:14. Nothing is lost: every notice stays on the server.', 'alert'), stale: banner('warn', 'From 16:35.', 'Newer notices appear once this refreshes.', 'clock'), offline: banner('', 'Offline.', 'Notices saved at 21:15. Each rebuilds from the server when you reconnect.', 'wifi-off'), disagreement: banner('', 'Read on your iPad.', 'Unread here, read there. A conflict always resolves to read.', 'split'), abstention: banner('', '2 notices held.', 'Quiet hours are 22:00 to 07:00. They arrive with the 07:30 brief, and they are already in this inbox.', 'clock') }[s] || '';
    return box(`${head('Notices', `<span class="small muted">${n === 4 ? 'By time detected' : '2 unread'}</span>`)}${top}${s === 'error' ? '' : noticeRows(n)}<p class="small muted">Opening a notice shows its evidence. It never performs an action.</p>`);
  }
  function pushCard(ctx) {
    const s = ctx.state;
    if (s === 'loading') return skCard('Phone notifications', 3);
    const status = {
      empty: li('shield', 'Phone notifications', 'Not asked yet. MyPrediction asks only when you tap', smbtn('Turn on', 'primary')),
      error: li('alert', 'Phone notifications', 'This subscription expired. Your inbox still has everything', smbtn('Turn back on', 'primary')),
      offline: li('wifi-off', 'Phone notifications', 'On. Changes wait until you reconnect', sw('Phone notifications', true, true)),
      abstention: li('clock', 'Phone notifications', 'On. Held for quiet hours until 07:30', sw('Phone notifications', true)),
      disagreement: li('ban', 'Phone notifications', 'On here, denied in this device\'s settings. Your inbox still has everything', sw('Phone notifications', false))
    }[s] || li('shield', 'Phone notifications', 'On, through the web app\'s Web Push', sw('Phone notifications', true));
    return box(`${head('Notifications')}${list([status, li('clock', 'Quiet hours', '22:00 to 07:00 London. Held notices arrive with the 07:30 brief', ''), li('lock', 'What a notice says', 'Neutral text only. A tap opens it after sign-in', '')])}<p class="small muted">Delivery is never promised, so silence never means no risk. The inbox keeps every notice either way. On iPhone and iPad this needs the web app on your Home Screen.</p>`);
  }

  /* ---------- devices and sessions ---------- */
  const DEVICES = [['iPad', 'Active 2 h ago · Passkey'], ['Mac, Safari', 'Active yesterday · Passkey'], ['Phone web', 'Active 3 days ago · Google']];
  function devicesCard(ctx) {
    const s = ctx.state;
    if (s === 'loading') return skCard('Devices and sessions', 4);
    if (s === 'empty') return `${banner('warn', 'One path left.', 'Only this device can sign in. Add a second path, so losing it does not lock you out.', 'alert')}${box(`${head('Devices and sessions', '<span class="small muted">1 device</span>')}${list([li('', 'iPhone', 'This device · active now', `<span class="small muted">This device</span>`)])}${smbtn('Add a passkey', 'primary')}`)}`;
    const dis = s === 'offline';
    const rows = DEVICES.map(([n, sub], i) => {
      if (s === 'disagreement' && i === 0) return li('', n, 'Revoked 21:02 · has not checked in yet', chipOf(['stale', 'Ended', 'split']));
      if (s === 'error' && i === 0) return li('', n, 'Revoke did not finish. Still signed in', smbtn('Try again', 'primary'));
      return li('', n, sub, smbtn('Revoke', 'tinted', dis));
    });
    const top = {
      error: banner('fall', 'iPad was not revoked.', 'It failed at 21:14 and is still signed in. Try again.', 'alert'),
      stale: banner('warn', 'From 16:35.', 'A device may look active after it has been revoked. This list refreshes when it can.', 'clock'),
      offline: banner('', 'Offline.', 'Revoking needs a connection. Nothing has changed.', 'wifi-off'),
      disagreement: banner('', 'iPad shows as signed in on the iPad itself.', 'The server has ended it. Its offline copy clears when it next connects, and it cannot be read before then.', 'split')
    }[s] || '';
    return `${top}${box(`${head('Devices and sessions', '<span class="small muted">4 devices</span>')}${list([li('', 'iPhone', 'This device · active now', `<span class="small muted">This device</span>`), ...rows])}<p class="small muted">Revoking asks for a fresh sign-in, ends the device's sessions and closes its live streams, in a time you approve.</p><div class="privacy-chips">${proposed('CT-17')}</div>`)}`;
  }
  function pathsCard(ctx) {
    const s = ctx.state;
    if (s === 'loading') return skCard('Sign-in paths', 3);
    const one = s === 'empty';
    const rows = one ? [li('lock', 'Passkey, iPhone', 'This device', chipOf(['stale', 'Last path', 'alert']))] : [li('lock', 'Passkey, iPhone', 'This device', chipOf(['fresh', 'Healthy'])), li('lock', 'Passkey, Mac', 'Last used yesterday', chipOf(['fresh', 'Healthy'])), li('person', 'Google', 'Linked on proof of both', chipOf(['fresh', 'Healthy']))];
    return box(`${head('Sign-in paths', one ? '' : '<span class="small muted">3 healthy</span>')}${list(rows)}<p class="small muted">Removing your last path is refused. Email and SMS never recover this account. Sign in with Apple waits for the Developer Program.</p>`);
  }
  const lostCard = ctx => box(`${head('Lost a device?')}<p class="small muted">Sign in from another path, revoke the lost device, then add a passkey on its replacement. Each step is on your audit trail.</p>${smbtn('Start recovery', 'primary', ctx.state === 'offline')}`);

  /* ---------- your data ---------- */
  function exportCard(ctx) {
    const s = ctx.state;
    const rev = `<div class="privacy-row"><span class="small muted">Pinned to</span><span class="small" style="font-weight:600">Revision 12 · root 9f3a…c21</span></div>`;
    const v = {
      default: [chipOf(['fresh', 'Ready · link valid 42 min']), 'Your ledger, holdings and evidence, as of one published revision. The link is private and starts a download for one hour.', smbtn('Download', 'primary')],
      loading: [chipOf(['fresh', 'Building']), 'Building from revision 12. A revision published meanwhile does not change it.', smbtn('Building', 'tinted', true)],
      empty: [chipOf(['', 'No export yet', 'clock']), 'Your ledger, holdings and evidence, as of one published revision. Asking needs a fresh sign-in.', smbtn('Request an export', 'primary')],
      error: [chipOf(['error', 'Failed 21:14', 'alert']), 'It stopped part-way, so no partial file exists. Trying again resumes it without making a duplicate.', smbtn('Try again', 'primary')],
      stale: [chipOf(['stale', 'Link expired', 'clock']), 'The one-hour link ended. A new request needs a fresh sign-in, and an expired link starts nothing.', smbtn('Request a new link', 'primary')],
      offline: [chipOf(['offline', 'Needs a connection', 'wifi-off']), 'Exports are built and kept on the server. Nothing is requested until you reconnect.', smbtn('Request an export', 'tinted', true)],
      disagreement: [chipOf(['fresh', 'Ready · link valid 42 min']), 'Revision 13 published while this was building. This export stays on revision 12, whole, and never mixes the two.', smbtn('Download', 'primary')],
      abstention: [chipOf(['fresh', 'Ready · link valid 42 min']), 'Two deleted originals are left out and stay out. Their ledger events show as evidence unavailable.', smbtn('Download', 'primary')]
    }[s] || [];
    return box(`${head('Export your data', v[0])}<p class="small muted">${v[1]}</p>${s === 'empty' ? '' : rev}${v[2]}`);
  }
  function offlineCopy(ctx) {
    const s = ctx.state;
    if (s === 'loading') return skCard('Offline copy', 4);
    if (s === 'empty') return box(`${head('Offline copy')}<p class="small muted">Nothing saved on this device yet. It fills in the next time the app is open and connected.</p>`);
    const ages = s === 'stale' ? ['3 days', '3 days', '3 days', '3 days', '4 days'] : s === 'offline' ? ['Saved 21:15', 'Saved 21:15', 'Saved 21:30 yesterday', 'Saved 19:02', 'Saved 15:10'] : ['2 h', '21:15', '21:30 yesterday', '3 h', '6 h'];
    const rows = ['Holdings', 'Prices', 'Forecasts', 'Notices', 'Cost'].map((n, i) => `<tr data-mo="rise"><td>${n}</td><td class="r">${ages[i]}</td></tr>`).join('');
    const top = { error: banner('warn', 'Copy rebuilt.', 'A damaged copy was thrown away and rebuilt from the server at 21:14.', 'refresh'), stale: banner('warn', 'Older than usual.', 'Each record keeps its own age and is never shown as fresh.', 'clock') }[s] || '';
    const where = ctx.kind === 'web' || ctx.kind === 'pwa' ? 'This is what the Apple app keeps. This browser keeps nothing to read offline.' : 'Encrypted on this device. Sign-out or a revoke clears it, and approvals, imports and settings never run offline.';
    return box(`${head('Offline copy', proposed('MP40-Q12'))}${top}<table class="ht"><thead><tr><th>Record</th><th class="r">Age</th></tr></thead><tbody>${rows}</tbody></table><p class="small muted">${where}</p>`);
  }
  const ORIGINALS = [['Broker statement, Sep 2026', 'PDF · kept to Sep 2028'], ['Holdings screenshot, Aug 2026', 'PNG · kept to Aug 2028'], ['Indian funds statement, Dec 2024', 'PDF · due for renewal']];
  function originals(ctx) {
    const s = ctx.state;
    if (s === 'loading') return skCard('Originals', 3);
    if (s === 'empty') return box(`${head('Originals')}<p class="small muted">No originals yet. A statement or screenshot you import is kept here privately for 24 months, and you can renew it.</p>`);
    if (s === 'error') return stateCard('alert', 'Originals did not load', 'They failed at 21:14. Nothing is deleted or changed.', smbtn('Try again'));
    const rows = ORIGINALS.map(([t, d], i) => (s === 'abstention' && i === 2 ? li('ban', 'Deleted original', 'Removed 2 Oct · evidence unavailable', '') : li('layers', t, d, i === 2 ? chipOf(['stale', 'Renew', 'clock']) : go)));
    return box(`${head('Originals', '<span class="small muted">Kept 24 months, renewable</span>')}${list(rows)}`);
  }
  function memory(ctx) {
    const s = ctx.state;
    if (s === 'loading') return skCard('Memory notes', 3);
    if (s === 'empty') return box(`${head('Memory notes')}<p class="small muted">No notes yet. Anything an agent keeps about your preferences shows here first, with its source.</p>`);
    const rows = [
      li('', 'Show the 6-month view first', 'From chat · expires Feb 2027', smbtn('Forget')),
      li('', 'Watch India midcap fees', 'From a filing summary · expires Jan 2027', chipOf(['stale', 'Untrusted source', 'alert']))
    ];
    return box(`${head('Memory notes', '<span class="small muted">2 notes</span>')}${list(rows)}<p class="small muted">Tap a note to correct it. A note is never a figure: it cannot replace a ledger value, an outcome, a threshold or a setting. Forgetting removes the note and what was built from it.</p>`);
  }

  /* ---------- deleting an original ---------- */
  function deleteSheet(ctx) {
    const s = ctx.state, keep = 'The two ledger events it supported stay, marked evidence unavailable. A deletion record and the audit trail stay.';
    const note = {
      loading: banner('', 'Deleting.', 'If this stops, it resumes from its deletion record.', 'clock'),
      error: banner('warn', 'One copy is left.', 'The deletion stopped at 21:14. It resumes by itself and reports what it could not yet remove.', 'alert'),
      stale: banner('warn', 'Due for renewal.', 'Its 24 months end soon. Nothing deletes by itself: renew it or delete it here.', 'clock'),
      offline: banner('', 'Offline.', 'Deleting needs a connection and a fresh sign-in. Nothing has changed.', 'wifi-off'),
      disagreement: banner('fall', 'This file changed.', 'It moved to version 4 after you opened it, so that approval is refused. Check it, then approve again.', 'split'),
      abstention: banner('', 'Unreadable for now.', 'A restored backup holds this copy until its deletion record is applied again.', 'lock')
    }[s] || '';
    const dis = ['loading', 'offline', 'abstention'].includes(s);
    return `<div class="sheet privacy-sheet" role="dialog" aria-modal="true" aria-labelledby="privacy-del" data-mo="sheet">${wide(ctx) ? '' : '<div class="grabber"></div>'}<h4 id="privacy-del">${s === 'empty' ? 'Already deleted' : 'Delete this original?'}</h4><p class="small muted">Broker statement, Sep 2026 · version 3 · production</p>
      ${s === 'empty' ? `<p class="small">This file and its text are gone. Its deletion record stays, and a restored backup cannot bring it back.</p>${wbtn('Done', 'tinted')}` : `${note}${list([li('x', 'Removes', 'The file and the text read from it. A restored backup cannot bring them back.', ''), li('check', 'Stays', keep, '')])}<p class="small muted">This approval covers this file at this version, and asks for a fresh sign-in. Unlocking the app does not count.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${wbtn('Not now', 'tinted')}${wbtn(s === 'disagreement' ? 'Approve again' : s === 'loading' ? 'Deleting' : 'Delete', 'primary', s === 'loading' ? 'spin' : 'lock', dis)}</div>`}</div>`;
  }

  /* ---------- the checkup, and notices in place ---------- */
  function checkup(ctx) {
    const s = ctx.state;
    if (s === 'loading') return skCard('Privacy checkup', 6);
    const need = {
      default: li('clock', 'Renew an original', 'Indian funds statement, Dec 2024, is due for renewal', go),
      empty: li('alert', 'Add a second sign-in path', 'Only this device can sign in. Losing it would lock you out', go),
      error: li('alert', 'Phone notifications stopped', 'The subscription expired. Your inbox still has everything', go),
      stale: li('clock', 'Check this list again', 'Last checked 16:35. Devices may have changed since', go),
      disagreement: li('split', 'A device has not checked in', 'iPad is revoked but shows signed in on the iPad itself', go)
    }[s];
    const good = [
      ['lock', 'Sign-in paths', s === 'empty' ? 'One left' : '3 healthy · 2 passkeys and Google'],
      ['person', 'Devices', '4 signed in · newest 2 days ago'],
      ['eye-off', 'Lock screen and widgets', 'Nothing confidential shows'],
      ['shield', 'Notifications', 'Web Push on · quiet 22:00 to 07:00'],
      ['db', 'Offline copy', ctx.kind === 'web' || ctx.kind === 'pwa' ? 'Apple app only · oldest record 3 h' : 'Encrypted · oldest record 3 h']
    ];
    return `${s === 'offline' ? banner('', 'Offline.', 'Showing the checkup from 21:15. Anything that changes a setting waits until you reconnect.', 'wifi-off') : ''}${need ? box(`${head('Needs you', '<span class="small muted">1 item</span>')}${list([need])}`) : ''}${box(`${head('Looks good', '<span class="small muted">Checked 21:15</span>')}${list(good.map(([i, t, d]) => li(i, t, d, go)))}`)}`;
  }
  function lostSteps(ctx) {
    const s = ctx.state;
    const three = s === 'stale' ? 'That approval expired, so the iPhone is not yet revoked. Approve it again.' : 'Ends its sessions, closes its live streams and clears its offline copy when it next connects.';
    return `<ol class="privacy-steps">${step(1, 'Signed in from another path', 'Your Mac passkey, just now', 'done')}${step(2, 'Which device?', 'iPhone, last active 40 min ago', 'done')}${step(3, 'Revoke it', three, 'now')}${step(4, 'Add a replacement passkey', 'On the new phone, when you have it.')}</ol>`;
  }
  function lostFlow(ctx) {
    const s = ctx.state;
    if (s === 'loading') return skCard('Recover a lost device', 4);
    if (s === 'empty') return stateCard('check', 'No device is marked lost', 'If you lose one, start here from any other path. Your sign-in paths stay as they are until the last step.', smbtn('A device is lost', 'primary'));
    if (s === 'abstention') return stateCard('lock', 'Locked out', 'With no path left, only your written procedure applies. No admin can recover this account for you.', smbtn('Open the written procedure'));
    const top = { error: banner('fall', 'The revoke did not finish.', 'The iPhone is still signed in. Your other paths are unchanged. Try again.', 'alert'), offline: banner('', 'Offline.', 'Revoking needs a connection. Nothing has changed.', 'wifi-off'), disagreement: banner('fall', 'That approval no longer matches.', 'The device list changed after you confirmed, so it is refused. Check it and approve again.', 'split') }[s] || '';
    return `${top}${box(`${head('Recover a lost device', chipOf(['', 'In progress', 'clock']))}${lostSteps(ctx)}<div class="privacy-chips">${smbtn(s === 'stale' || s === 'disagreement' ? 'Approve again' : s === 'error' ? 'Try again' : 'Revoke with a passkey', 'primary', s === 'offline')}${smbtn('Stop for now', 'plain')}</div>`)}`;
  }
  const lostAfter = () => box(`${head('If you stop here')}<p class="small muted">Your old paths stay, and the new one stays unconfirmed. You can resume or cancel: it is never half-applied.</p><div class="privacy-chips">${chipOf(['fresh', 'On your audit trail'])}${proposed('CT-17')}</div>`);

  /* ---------- screens ---------- */
  const signFrame = (ctx, sheet) => frame(fx(ctx), { tab: 0, title: 'Sign in', body: '', sheet });
  J.add({
    id: 'privacy', title: 'Privacy and recovery', stories: ['MP-73', 'MP-87', 'MP-78', 'MP-166', 'MP-165', 'MP-167', 'MP-162', 'MP-169', 'MP-45', 'MP-115'],
    summary: 'Getting in, staying private on a shared glance, getting back after a lost device, and holding or removing your own data.',
    options: [{
      id: 'a', name: 'One privacy centre', rec: true,
      why: 'Everything lives on one page in Settings, with its status showing, so you never have to remember where a rare task sits. Privacy mode stays on the top bar as well.',
      cost: 'A long page on iPhone, and a task such as deleting an original is reached from Settings, not from the record it belongs to.',
      screens: [{
        id: 'privacy-a-signin', title: 'Sign in',
        note: 'Passkey first, reachable with one thumb. No passwords, and no data behind this screen.',
        na: { noModel: NA_MODEL },
        render: ctx => signFrame(ctx, cover(ctx, signIn(ctx)))
      }, {
        id: 'privacy-a-device', title: 'A new or lost device',
        note: 'One path for both: sign in another way, confirm, revoke what was lost, add a passkey.',
        na: { noModel: NA_MODEL },
        render: ctx => signFrame(ctx, cover(ctx, deviceFlow(ctx)))
      }, {
        id: 'privacy-a-centre', title: 'Privacy centre',
        note: 'Settings, then Privacy. Money is masked and percentages stay; nothing confidential shows outside the app.',
        na: { empty: 'The private defaults always exist, so this page is never empty' },
        render: ctx => frame(fx(ctx), {
          tab: settings(ctx), back: 'Settings', title: 'Privacy',
          body: ({ error: banner('fall', 'That change did not save.', 'The private default stays in force. Try again.', 'alert'), stale: banner('warn', 'Last synced 16:35.', 'The private defaults stay in force until the next sync.', 'clock'), offline: banner('', 'Offline.', 'Hiding amounts still works. Anything less private waits until you reconnect.', 'wifi-off'), noModel: banner('', 'No approved model.', 'Today\'s move stays. There is no forecast percentage to keep, and none is made up.', 'cube'), disagreement: banner('', 'Models disagree on Reliance.', 'Both ranges stay visible. Only money is hidden.', 'split'), abstention: banner('', 'The model abstained on Reliance.', 'No range is shown, and hiding amounts does not change that.', 'ban') }[ctx.state] || '') + modeCard(ctx) + (wide(ctx) ? '' : outside(ctx)) + pushCard(ctx),
          rail: (wide(ctx) ? outside(ctx) : '') + inbox(ctx, 3)
        })
      }, {
        id: 'privacy-a-devices', title: 'Devices and sessions',
        note: 'Revoke any device with a fresh sign-in. The last sign-in path can never be removed.',
        na: { noModel: NA_MODEL, abstention: 'A locked-out owner cannot reach this page. That state is on A new or lost device' },
        render: ctx => frame(fx(ctx), { tab: settings(ctx), back: 'Privacy', title: 'Devices', body: devicesCard(ctx) + lostCard(ctx), rail: pathsCard(ctx) })
      }, {
        id: 'privacy-a-data', title: 'Your data',
        note: 'Export, the offline copy with the age of every record, originals and memory notes.',
        na: { noModel: NA_MODEL },
        render: ctx => frame(fx(ctx), { tab: settings(ctx), back: 'Privacy', title: 'Your data', body: exportCard(ctx) + offlineCopy(ctx), rail: originals(ctx) + memory(ctx) })
      }, {
        id: 'privacy-a-delete', title: 'Delete an original',
        note: 'Says what goes and what stays before anything happens. It removes content, never history.',
        na: { noModel: NA_MODEL },
        render: ctx => frame(fx(ctx), { tab: settings(ctx), back: 'Privacy', title: 'Your data', body: originals({ ...ctx, state: 'default' }), rail: memory({ ...ctx, state: 'default' }), sheet: deleteSheet(ctx) })
      }]
    }, {
      id: 'b', name: 'In place, with a checkup',
      why: 'Each control sits where the thing it changes lives: privacy mode on home, notice permission in the inbox, delete on the record. A checkup then lists only what needs you.',
      cost: 'There is no single page to scan, so a rare task takes more remembering, and the list of what is private is shown as a summary, not as the controls themselves.',
      screens: [{
        id: 'privacy-b-signin', title: 'Sign in',
        note: 'Returning first: one button, with other ways folded away. Fastest daily, but Google is one tap deeper.',
        na: { noModel: NA_MODEL },
        render: ctx => signFrame(ctx, cover(ctx, brand(), true) + signSheet(ctx))
      }, {
        id: 'privacy-b-home', title: 'Home, amounts hidden',
        note: 'The eye on the top bar. Money masks, percentages stay, and offline each row shows its age.',
        render: ctx => frame(fx(ctx), {
          tab: 0, title: 'Portfolio', actions: tb('search', 'Search') + `<button class="tbtn glass" type="button" aria-pressed="true" aria-label="Amounts hidden" style="background:var(--btn);color:var(--btn-ink)">${ic('eye-off', 's18')}</button>`, webActions: wide(ctx) ? `<button class="btn sm btn-primary" type="button" aria-pressed="true">${ic('eye-off', 's18')}Amounts hidden</button>` : `<button class="tbtn glass" type="button" aria-pressed="true" aria-label="Amounts hidden" style="background:var(--btn);color:var(--btn-ink)">${ic('eye-off', 's18')}</button>`,
          body: (ctx.state === 'loading' ? skel(3) : ctx.state === 'empty' ? stateCard('grid', 'No holdings yet', 'Add what you hold and MyPrediction starts watching it. It never connects to a broker. Amounts stay hidden when you do.', btn('Add a holding')) : `${box(maskValue())}${({ error: stateCard('alert', 'This did not load', 'Holdings failed at 21:14. The last good percentages stay on screen, labelled with their time.', btn('Try again', 'tinted', 'refresh')), stale: banner('warn', 'Stale.', 'HSBC last priced 16:35. Its forecast is held and its action paused until prices return.', 'clock'), offline: banner('', 'Offline.', 'Saved copies. Each row shows its age, and nothing updates until you reconnect.', 'wifi-off'), noModel: banner('', 'No approved model.', 'Today\'s moves stay. No forecast percentage is made up.', 'cube'), disagreement: banner('', 'Models disagree on Reliance.', 'Both ranges stay visible, and no action is ranked.', 'split'), abstention: banner('', 'The model abstained on Reliance.', 'Too little comparable history for a calibrated range.', 'ban') }[ctx.state] || banner('', 'Amounts hidden.', 'Percentages and ranges stay visible. Tap to show for 30 seconds.', 'eye-off'))}<div class="list card" style="margin:0">${[byT.AAPL, ['disagreement', 'abstention'].includes(ctx.state) ? byT.RELIANCE : byT.NVDA, byT.HSBA].map(h => masked(ctx, h)).join('')}</div>`),
          rail: box(`${head('Outside the app', chipOf(['fresh', 'Private default']))}${glances()}`)
        })
      }, {
        id: 'privacy-b-checkup', title: 'Privacy checkup',
        note: 'Settings, then Checkup. Only what needs you comes first; each row opens the place that thing lives.',
        na: { noModel: NA_MODEL },
        render: ctx => frame(fx(ctx), { tab: settings(ctx), back: 'Settings', title: 'Checkup', body: checkup(ctx), rail: exportCard(ctx) + memory(ctx) })
      }, {
        id: 'privacy-b-lost', title: 'Recover a lost device',
        note: 'A guided path from any other sign-in, with one step showing at a time.',
        na: { noModel: NA_MODEL },
        render: ctx => frame(fx(ctx), { tab: settings(ctx), back: 'Checkup', title: 'Lost device', body: lostFlow(ctx), rail: lostAfter() + pathsCard(ctx) })
      }, {
        id: 'privacy-b-notices', title: 'Notices',
        note: 'Permission is asked here, after you tap. Every notice stays in the inbox whatever push does.',
        na: { noModel: NA_MODEL },
        render: ctx => frame(fx(ctx), { tab: 0, back: 'Portfolio', title: 'Notices', body: inbox(ctx, 4), rail: pushCard(ctx) + (ctx.state === 'loading' ? '' : offlineCopy(ctx)) })
      }, {
        id: 'privacy-b-delete', title: 'Delete an original',
        note: 'Record, then the file. The confirmation sits on the record it changes.',
        na: { noModel: NA_MODEL },
        render: ctx => frame(fx(ctx), { tab: 3, back: 'Record', title: 'Original', body: box(`${head('Broker statement, Sep 2026', illus())}${list([li('layers', 'Kept to Sep 2028', '24 months, and you can renew it', ''), li('split', 'Supports 2 ledger events', 'Imported 3 Oct 2026', go)])}`), rail: originals({ ...ctx, state: 'default' }), sheet: deleteSheet(ctx) })
      }]
    }]
  });
}
