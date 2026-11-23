/* Identity and Devices (MP-64, PH02, PH07). One owner. Only you link, unlink, revoke or enrol, each with a fresh sign-in, and no
   route recovers this account for you. MP-164 bars on-device passkeys until the Developer Program is bought (MP-179), so the iPhone
   passkey row waits on the purchase, as Privacy draws it too, and every flow stands on Passkey, Mac and Google (facts.md 6B item 1,
   CT-17, PL-09). The owner's picks of 5 Nov 2026 (MP-184, drawn in MP-188): "Allowed in the browser" (ADM-04) and "Finish in the
   phone browser" (ADM-15), so Phone web enrols a passkey and a phone's recovery ends there; "Revoke removes it too" (ADM-02); "Any
   healthy path" (ADM-03) for a revoke's fresh sign-in. The browser passkey and the removal are unverified until MP-197, and the
   one-path fallback is drawn beside them. Revocation time is open (CT-17). Stories MP-73, MP-87, MP-78, MP-83, MP-94, MP-134,
   MP-168, MP-164, MP-165, MP-166. Every figure is illustrative. */
{
  const LINE = 'Opening the app with Face ID, or an open session, is not enough. The server checks a fresh sign-in.';
  const chip = (k, t, i = '') => `<span class="chip ${k}">${i ? ic(i, 's14') : '<span class="dot"></span>'}${t}</span>`;
  const tags = (...c) => `<div class="aidentity-tags">${c.filter(Boolean).join('')}</div>`;
  const note = t => `<p class="small muted">${t}</p>`;
  const card = inner => box(inner, 'display:grid;gap:10px;align-content:start;min-width:0');
  const head = (t, r = '') => `<div class="aidentity-head"><h3>${t}</h3>${r}</div>`;
  const opens = (i, t, s, x = '', tone = '') => item(lead(i, tone), t, s, ic('chev-r', 's18'), x, false, true);
  const row = (i, t, s, x = '', tone = '') => item(lead(i, tone), t, s, '', x);
  const held = t => `<span class="small muted aidentity-held">${ic('pause', 's16')}${t}</span>`;
  const signAgain = () => `<div class="aidentity-go">${btn('Sign in again', 'primary', 'lock')}</div>`;
  const signNote = txt => `${banner('warn', 'A fresh sign-in is needed.', `${LINE} ${txt}`, 'lock')}${signAgain()}`;
  const WAIT = {
    loading: 'Waiting for the records.', offline: 'This needs a connection. Nothing can be changed offline.',
    stale: 'Held. This is from 11:12, so refresh before you act.', conflict: 'Refused for a stale revision. Refresh, then decide.',
    denied: 'Needs a fresh sign-in first.'
  };
  const can = (ctx, html, why = {}) => (why[ctx.state] ? held(why[ctx.state]) : WAIT[ctx.state] ? held(WAIT[ctx.state]) : html);
  const NOEMAIL = { conflict: 'Refused. A matching email never links two identities, and refreshing will not change that.' };
  const NOEMAILBACK = { conflict: 'Refused. A matching email never recovers this account. Use a path you can prove.' };
  const PATHSHELD = { conflict: 'Held. A matching email is not proof, and your paths are unchanged.' };
  const KEYS = ['empty', 'partial', 'error', 'stale', 'offline', 'conflict', 'expired', 'denied'];
  const view = (ctx, T, ok) => {
    const o = { what: T.what, ok, loading: () => `${note(T.loading)}${skel(T.rows || 3)}` };
    KEYS.forEach(k => { o[k] = () => { const top = typeof T[k] === 'function' ? T[k](ctx) : T[k]; return (T.alone || []).includes(k) ? top : top + ok(); }; });
    return region(ctx, o);
  };

  /* ---------- who is signed in, by device ---------- */
  /* the iPhone app signs in with Google in the system browser until the purchase, as Privacy now draws it ("Redraw Privacy now", ADM-13) */
  const DEVICES = [['iPhone', 'Active 40 min ago · Google'], ['iPad', 'Active 2 h ago · Google'], ['Mac, Safari', 'Active yesterday · Passkey'], ['Phone web', 'Active 3 days ago · Google']];
  const HERE = { iphone: 'iPhone', ipad: 'iPad', web: 'Mac, Safari', pwa: 'Phone web' };
  /* a flow's first target, as Privacy picks it: never the device in your hand. Any other device can be revoked, the iPhone too: revoking needs no iPhone passkey */
  const gone = ctx => (ctx.kind !== 'ipad' ? 'iPad' : ctx.state === 'expired' ? 'Phone web' : 'iPhone');
  const lineOf = n => DEVICES.find(d => d[0] === n)[1];
  const isApp = n => n === 'iPad' || n === 'iPhone';
  const IPHONE = 'Waits on the purchase. MP-164 bars on-device passkeys until the Developer Program is bought (MP-179), so nothing here builds on this row. Privacy draws it the same way.';
  const WAITING = () => chip('stale', 'Waiting on MP-179', 'clock');
  /* the owner's picks that rest on a test not yet run carry the issue that runs it (lesson 36) */
  const UNV = () => chip('unverified', 'Unverified · MP-197', 'info');
  /* "Revoke removes it too" (ADM-02), in the owner's words, and what is not yet known */
  const RV = 'Revoking also removes any passkey held on that device. Where it held one, your path count drops by one. Whether Cognito can remove it, and whether a synced copy ends too, is not tested yet.';
  /* "Any healthy path" (ADM-03) */
  const ANY = 'A fresh sign-in on any healthy path, passkey or Google.';
  const phoneBrowser = ctx => (ctx.kind === 'iphone' ? 'this phone\'s browser' : 'your phone\'s browser');
  const quiet = ctx => (ctx.kind === 'pwa' ? 'Mac, Safari' : 'Phone web');
  const devRows = (ctx, flat) => {
    const s = ctx.state, here = HERE[ctx.kind], g = gone(ctx), go = flat ? row : opens;
    const rv = (n, l = `Revoke ${n}`) => (flat && !WAIT[s] ? act('A49', l, 'tinted') : '');
    const rows = DEVICES.filter(([n]) => n !== here).map(([n, sub]) => {
      if (s === 'conflict' && n === g) return row('ban', n, 'Revoked 21:02 · has not checked in yet', tags(chip('stale', 'Ended', 'split')), 'warn');
      if (s === 'error' && n === g) return go('alert', n, 'Revoke did not finish. Still signed in', `${tags(chip('error', 'Still signed in', 'alert'))}${rv(n, 'Try again')}`, 'fall');
      if (s === 'expired' && n === 'Phone web') return go('clock', n, 'Session expired · needs a new sign-in', `${tags(chip('stale', 'Expired', 'clock'))}${rv(n)}`, 'warn');
      if (s === 'expired' && n === 'iPad') return go('clock', n, 'Build expired · reinstall from your Mac', `${tags(chip('stale', 'Build expired', 'clock'))}${rv(n)}`, 'warn');
      if (s === 'partial' && n === quiet(ctx)) return go('clock', n, 'Did not report · last activity unknown', `${tags(chip('stale', 'Unknown', 'clock'))}${rv(n)}`, 'warn');
      const x = s === 'stale' ? tags(chip('stale', 'Last known', 'clock')) : '';
      return go('person', n, sub, `${x}${rv(n)}`);
    });
    return list([row('person', here, 'Active now', tags(chip('owner', 'This device'), here === 'iPhone' ? proposed('CT-17') : '')), ...rows].join(''));
  };

  /* ---------- paths: how you get back in ---------- */
  const healthy = ctx => ({ stale: chip('stale', 'Last known', 'clock'), offline: chip('', 'From 11:20', 'wifi-off') }[ctx.state] || chip('fresh', 'Healthy'));
  const macSub = ctx => (ctx.kind === 'web' ? 'This device' : 'Last used yesterday');
  const pathRows = (ctx, o = {}) => {
    const s = ctx.state;
    if (s === 'empty') return list((o.flat ? row : opens)('person', 'Google', 'Linked on proof of both · the only path', tags(chip('stale', 'Last path', 'alert')), 'warn'));
    const google = { partial: chip('stale', 'Unknown', 'clock'), error: chip('stale', 'Unavailable', 'clock') }[s] || healthy(ctx);
    return list([
      row('lock', 'Passkey, iPhone', 'Cannot be set up yet', `${note(IPHONE)}${tags(WAITING(), proposed('CT-17'), proposed('PL-09'))}`),
      row('lock', 'Passkey, Mac', macSub(ctx), tags(healthy(ctx))),
      (o.flat ? row : opens)('person', 'Google', 'Linked on proof of both', tags(google))
    ].join(''));
  };
  const countCard = ctx => {
    const s = ctx.state, one = s === 'empty', low = s === 'partial' || s === 'error';
    const t = { empty: 'One path left', partial: '1 usable, Google unknown, 1 waiting on MP-179', error: '1 usable, Google unavailable, 1 waiting on MP-179', stale: '2 usable at 11:12, 1 waiting on MP-179', offline: '2 usable at 11:20, 1 waiting on MP-179' }[s] || '2 usable, 1 waiting on MP-179';
    const sub = one ? 'MP asks for at least two independent paths.' : 'At least two independent paths are needed: Passkey, Mac and Google.';
    return `<div class="card fcard aidentity-count" data-mo="card"><span class="amt" style="font-size:44px">${roll(one || low ? '1' : '2')}</span><div><b>${t}</b>${note(sub)}</div></div>`;
  };
  const NEVER = () => `${refused('R9', 'Removing or unlinking your last usable path is refused.')}${refused('R10', 'Email, SMS and support never recover this account. Only your own proof does.')}${refused('R8', 'MP has one owner. Nobody else can be added, and nobody signs in for you.')}`;
  const notPaths = () => card(`${head('Not a way back in')}${list(row('lock', 'Sign in with Apple', 'Not set up. It waits for the Developer Program.'))}`);
  const lostRow = ctx => list(opens('alert', 'Lost a device?', 'Sign in another way, revoke it, add a replacement', '', 'warn'));
  const allLost = () => card(`${head('If every device is lost', proposed('CT-17'))}${note('A written procedure, rehearsed on dev, recovers through the provider path that remains. Its steps are not settled yet.')}`);
  const T_PATHS = {
    what: 'Your sign-in paths', rows: 3, loading: 'Reading your sign-in paths.',
    empty: banner('warn', 'One path left.', 'Only Google can sign you in. Add a second path, so losing it does not lock you out.', 'alert'),
    partial: banner('warn', 'Google did not answer.', 'Its health is unknown, not healthy. Passkey sign-in still works.', 'clock'),
    error: `${banner('fall', 'Google is unavailable.', 'Passkey sign-in still works, and your paths stay as they are. Nothing was unlinked.', 'alert')}`,
    stale: banner('warn', 'From 11:12.', 'A path may look healthy after it has changed. This refreshes when it can.', 'clock'),
    offline: banner('', 'Offline.', 'Showing your paths from 11:20. Nothing can be changed until you reconnect.', 'wifi-off'),
    conflict: banner('warn', 'The email matches, the account does not.', 'A matching email never links two identities, so both stay unlinked and your paths are unchanged.', 'split'),
    expired: banner('warn', 'Your session expired.', 'You can read this list. Changing a path needs a new sign-in, and any open request has lapsed with nothing changed.', 'clock'),
    denied: ctx => signNote('Your paths stay readable.')
  };

  /* ---------- one path: Google ---------- */
  const compare = ctx => card(`${head('Google and your Mac passkey')}<div class="aidentity-two"><div>${lbl('Google')}${kv([['Proof', 'Provider sign-in'], ['Identified by', 'Stable subject, not email'], ['Used by', 'iPad, Phone web'], ['If it fails', 'Passkey sign-in still works']])}</div><div>${lbl('Passkey, Mac')}${kv([['Proof', 'Passkey on the Mac'], ['Held on', 'Your Mac'], ['Used by', 'Mac, Safari'], ['If it is lost', 'Google still works']])}</div></div>`);
  const auditCard = (ctx, t = 'On your audit trail') => card(`${head(t)}${note('Every link, unlink, revoke and enrol is recorded with opaque references only. No identity token, refresh token or authorisation code is ever stored there.')}${list(opens('shield', 'Open in Audit', 'Sign-in and link events'))}`);
  const unlink = ctx => {
    const s = ctx.state;
    if (s === 'empty') return refused('R9', 'Unlinking your last usable path is refused. Add another path first.');
    return card(`${head('Unlink Google')}${note('This leaves Passkey, Mac, and the iPhone row, which cannot count until the Developer Program is bought (MP-179). So you would be on one path, and MP warns you.')}${can(ctx, act('A47', 'Unlink Google'))}${note(LINE)}`);
  };
  const T_PATH = {
    what: 'This path', rows: 4, loading: 'Reading this path.',
    empty: banner('warn', 'This is your last path.', 'Google is the only way in today, so it cannot be unlinked.', 'alert'),
    partial: banner('warn', 'Google did not answer.', 'The link is on record. Whether it works right now is unknown. Passkey sign-in still works.', 'clock'),
    error: banner('fall', 'Google is unavailable.', 'Passkey sign-in still works. Nothing has been unlinked.', 'alert'),
    stale: banner('warn', 'From 11:12.', 'The link may have changed since. Unlinking is held until this refreshes.', 'clock'),
    offline: banner('', 'Offline.', 'This path is from 11:20. Unlinking needs a connection.', 'wifi-off'),
    conflict: banner('warn', 'Your paths changed while you read.', 'This view stays at the version you opened, so unlinking from it is refused.', 'split'),
    expired: banner('warn', 'Your fresh sign-in ran out.', 'Nothing was unlinked. Start again with a new fresh sign-in.', 'clock'),
    denied: ctx => signNote('This path stays readable.')
  };

  /* ---------- link and enrol ---------- */
  const st = (n, stt, t, s, x = '') => `<li class="${stt}"${stt === 'now' ? ' aria-current="step"' : ''}><span class="n">${stt === 'done' ? `<span class="sr">Done, step ${n}</span>${ic('check', 's16')}` : n}</span><div style="min-width:0"><b>${t}</b><p>${s}</p>${x ? `<div class="x">${x}</div>` : ''}</div></li>`;
  const steps = (name, rows) => `<ol class="aidentity-steps" aria-label="${name}">${rows.join('')}</ol>`;
  const linkSteps = ctx => {
    const s = ctx.state, one = s === 'partial' ? 'done' : 'now', two = s === 'partial' ? 'now' : '';
    return card(`${head('Link Google', s === 'partial' ? chip('stale', 'Link pending verification', 'clock') : '')}${steps('Link Google', [
      st(1, one, 'Sign in with Google', 'A fresh sign-in, just now.'),
      st(2, two, 'Prove the other side', 'A fresh sign-in with your Mac passkey. Both identities are needed.'),
      st(3, '', 'MP links the stable subject', 'The provider\'s stable subject, never the email.')
    ])}${ctx.kind === 'ipad' ? held('Link Google from your Mac. The proof needs your Mac passkey.') : can(ctx, act('A46', 'Link Google', 'primary'), NOEMAIL)}${note(LINE)}`);
  };
  const T_LINK = {
    what: 'This link', rows: 3, loading: 'Waiting for Google, in the system browser.',
    empty: banner('', 'Nothing is linked in this view.', 'Google is not linked, so this starts a new link. Your passkeys stay as they are.', 'info'),
    partial: banner('warn', 'Link pending verification.', 'Google answered. Nothing is linked until the other side proves itself too.', 'clock'),
    error: banner('fall', 'This link failed midway.', 'Both identities stay unlinked, and the attempt is on your audit trail. Try again, or leave it.', 'alert'),
    stale: banner('warn', 'That request is from 11:12.', 'Start the link again, so both proofs are fresh.', 'clock'),
    offline: banner('', 'Offline.', 'Linking needs a connection. Your sign-in paths stay as they are.', 'wifi-off'),
    conflict: banner('fall', 'The email matches, the account does not.', 'A matching email never links two identities. Both stay unlinked.', 'split'),
    expired: banner('warn', 'That request expired.', 'Nothing changed. Start this link again.', 'clock'),
    denied: ctx => `${banner('fall', 'This sign-in was refused.', 'Prod takes only its own environment and only the owner. Repeated tries are rate-limited, and the answer never says whether an account exists.', 'ban')}${signAgain()}`
  };
  const enrolHere = (ctx, why = {}) => {
    if (ctx.kind === 'web') return card(`${head('Enrol a passkey on this Mac')}${note('A second passkey on a device you control. It is scoped to prod, and dev has its own user pool.')}${can(ctx, act('A48', 'Enrol a passkey', 'primary'), why)}${note(LINE)}${tags(proposed('CT-17'))}`);
    /* "Allowed in the browser" (ADM-04): the bar covers the Apple app only, so Phone web enrols, once MP-197's test proves it works */
    if (ctx.kind === 'pwa') return card(`${head('Enrol a passkey in this browser')}${note('A passkey held in this phone\'s browser, not in the iPhone app. The bar covers the Apple app only. This rests on a test that has not run: if it fails, the bar stands and this control goes.')}${can(ctx, act('A48', 'Enrol a passkey in this browser', 'primary'), why)}${note(LINE)}${tags(UNV(), proposed('CT-17'))}`);
    return card(`${head('Enrol in a phone\'s browser or on your Mac')}${note(`Not from this app. MP-164 bars on-device passkeys until the Developer Program is bought (MP-179), and sign-in here is Google through the system browser. A passkey in ${phoneBrowser(ctx)} counts.`)}${tags(UNV(), proposed('CT-17'), proposed('PL-09'))}`);
  };
  const T_ENROL = {
    what: 'This passkey', rows: 2, loading: 'Waiting for your passkey.',
    empty: banner('warn', 'You have no passkey in this view.', 'Google is your only path, so a passkey is the quickest second path.', 'alert'),
    partial: banner('warn', 'The new passkey is not confirmed yet.', 'Your old paths stay as they are until it is. It is resumed or cancelled, never half-applied.', 'clock'),
    error: banner('fall', 'This enrolment did not finish.', 'Nothing was added, and the attempt is on your audit trail. Try again.', 'alert'),
    stale: banner('warn', 'That request is from 11:12.', 'Start again, so the sign-in is fresh.', 'clock'),
    offline: banner('', 'Offline.', 'Enrolling needs a connection. Your sign-in paths stay as they are.', 'wifi-off'),
    conflict: banner('warn', 'Your paths changed while you read.', 'This view stays at the version you opened, so enrolling from it is refused.', 'split'),
    expired: banner('warn', 'That request expired.', 'Nothing changed. Start this step again.', 'clock'),
    denied: ctx => signNote('Your paths stay readable.')
  };
  const sessionsNote = ctx => (browser(ctx) ? `${note('What a browser keeps offline is open.')}${tags(proposed('MP40-Q12'))}` : note('The offline copy on this device is encrypted, and it clears on sign-out or revoke.'));

  /* ---------- lost a device: the same recovery from either door ---------- */
  const rvNote = () => `${note(RV)}${tags(UNV(), proposed('CT-17'))}`;
  const lostTargets = ctx => ['Mac, Safari', 'iPhone', 'iPad', 'Phone web'].filter(n => n !== HERE[ctx.kind]);
  /* "Finish in the phone browser" (ADM-15): with the Mac lost, the replacement goes in a phone's browser and you end on two paths. The iPhone app cannot hold one, so it sends you there. */
  const fallbackLine = () => note('If the browser test fails, recovery ends after the revoke on one path, Google, and MP warns you until you reach a Mac.');
  const phoneEnd = ctx => (ctx.kind === 'pwa'
    ? st(3, '', 'Enrol a replacement passkey', 'In this browser, once the lost devices are revoked. You end on two paths: Google and this passkey.', `${act('A48', 'Enrol in this browser')}${tags(UNV())}${fallbackLine()}`)
    : st(3, '', 'Finish in a phone\'s browser', `This app cannot hold a passkey until the Developer Program is bought (MP-179). Open MyPrediction in ${phoneBrowser(ctx)} and enrol the replacement there, so you end on two paths.`, `${tags(UNV())}${fallbackLine()}`));
  /* the fallback the owner was offered, "End on one path, warned", drawn beside the browser step until MP-197 has run */
  const fallbackCard = ctx => (ctx.kind === 'web' || ctx.state === 'loading' ? '' : card(`${head('If the browser test fails', UNV())}${list(row('person', 'Google', 'The one path left after the revoke', tags(chip('stale', 'Last path', 'alert')), 'warn'))}${note('Enrolling in a phone\'s browser is off, so recovery ends on one path and MP warns you until you reach a Mac.')}`));
  const lostSteps = ctx => {
    const s = ctx.state, g = gone(ctx);
    const revoke = can(ctx, act('A49', `Revoke ${g}`, 'primary'), NOEMAILBACK);
    const replace = ctx.kind === 'web' ? can(ctx, act('A48', 'Enrol a replacement passkey'), NOEMAILBACK)
      : ctx.kind === 'pwa' ? `${can(ctx, act('A48', 'Enrol in this browser'), NOEMAILBACK)}${note('Or on your Mac.')}${tags(UNV())}`
      : `${held(`Enrol the replacement on your Mac, or in ${phoneBrowser(ctx)}. This app cannot hold one until the Developer Program is bought (MP-179).`)}${tags(UNV())}`;
    const first = st(1, 'done', 'Sign in from another path', ANY);
    if (s === 'partial') return [first, st(2, 'done', `Revoke ${g}`, 'Its sessions ended.', rvNote()), st(3, 'now', 'Enrol a replacement passkey', 'Not confirmed yet. Your old paths stay as they are until it is.', replace)];
    if (s === 'error') return [first, st(2, 'warn', `Revoke ${g}`, `This step stopped. ${g} is still signed in.`, `${act('A59', 'Resume this recovery', 'primary')}${rvNote()}`), st(3, '', 'Enrol a replacement passkey', 'Waiting for step 2.')];
    if (s === 'empty') {
      const end = ctx.kind === 'web' ? st(3, '', 'Enrol a replacement passkey', 'On this Mac, once the lost devices are revoked.', act('A48', 'Enrol a replacement passkey')) : phoneEnd(ctx);
      return [st(1, 'done', 'Sign in with what is left', 'Google, with a fresh sign-in. It is the path that remains.'), st(2, 'now', 'Revoke what is lost', 'Ends their sessions and closes their live streams, in a time you approve.', `${lostTargets(ctx).map(n => act('A49', `Revoke ${n}`, 'primary')).join('')}${rvNote()}`), end];
    }
    return [first, st(2, 'now', `Revoke ${g}`, 'Ends its sessions and closes its live streams, in a time you approve.', `${revoke}${rvNote()}`), st(3, '', 'Enrol a replacement passkey', 'On a device you control. Each step is on your audit trail.', replace)];
  };
  const lostChip = ctx => ({ error: chip('error', 'Stopped midway', 'alert'), empty: chip('stale', 'One path left', 'alert'), expired: chip('stale', 'Lapsed', 'clock') }[ctx.state] || chip('stale', 'Recovery in progress', 'clock'));
  const lostTools = ctx => {
    if (ctx.state === 'loading') return '';
    return `${ctx.state === 'empty' ? act('A59', 'Resume this recovery') : ''}${can(ctx, act('A50', 'Cancel this recovery', 'plain'), NOEMAILBACK)}`;
  };
  const lostBody = ctx => card(`${head('This recovery', lostChip(ctx))}${steps('Lost device recovery', lostSteps(ctx))}${note('If you stop before the end, your old paths stay as they are. It is resumed or cancelled, never half-applied.')}${lostTools(ctx)}${note(LINE)}`);
  /* the Mac holds the only passkey that counts today, so losing it has its own card wherever the Mac is not in your hand */
  const macCard = ctx => (ctx.kind === 'web' || ['loading', 'empty'].includes(ctx.state) ? '' : card(`${head('If your Mac is the lost device')}${note('It holds the only passkey that counts today. Sign in with Google and revoke it here. Revoking removes that passkey too, so you drop to one path, Google.')}${can(ctx, act('A49', 'Revoke Mac, Safari'), NOEMAILBACK)}${note(ctx.kind === 'pwa' ? 'Then enrol the replacement in this browser, in the steps here, and you are back on two paths.' : `Then finish in ${phoneBrowser(ctx)}: enrol the replacement there, and you are back on two paths. This app cannot hold one until the Developer Program is bought (MP-179).`)}${tags(UNV())}`));
  const T_LOST = {
    what: 'This recovery', rows: 3, alone: ['denied'], loading: 'Waiting for your fresh sign-in.',
    empty: ctx => (ctx.kind === 'web' ? banner('warn', 'No other device to confirm on.', 'Your Google sign-in is the path that remains. Revoke what is lost from here.', 'alert') : banner('warn', 'Your Mac is lost, and no other device can confirm.', 'Your Google sign-in is the path that remains. Revoke what is lost here, then add the replacement in a phone\'s browser.', 'alert')),
    partial: banner('warn', 'Part of this recovery is done.', 'The lost device is revoked and the new passkey is not confirmed yet.', 'clock'),
    error: banner('fall', 'This recovery stopped midway.', 'Your old paths are intact and the new one is unconfirmed. Resume it or cancel it.', 'alert'),
    stale: banner('warn', 'From 11:12.', 'A device may look active after it has been revoked. Refresh before the next step.', 'clock'),
    offline: banner('', 'Offline.', 'This needs a connection. Your sign-in paths stay as they are.', 'wifi-off'),
    conflict: banner('warn', 'The email matches, the account does not.', 'A matching email never recovers this account, so this step was refused.', 'split'),
    expired: banner('warn', 'That request expired.', 'Nothing changed. Start this step again.', 'clock'),
    denied: ''
  };

  const lostRail = ctx => (ctx.state === 'denied' ? allLost() : `${macCard(ctx)}${fallbackCard(ctx)}${allLost()}${card(`${head('On this device')}${sessionsNote(ctx)}`)}${refused('R10', 'Email, SMS and support never recover this account. Only your own proof does.')}`);

  /* locked out is seen signed out: no records, no tabs, nothing to go back to */
  const lockedFrame = ctx => {
    const web = ctx.kind === 'web', wideOne = wide(ctx);
    const inner = `<div class="aidentity-brand"><span class="brand-mark" aria-hidden="true"></span><h2>MyPrediction</h2><p>Private forecasts for one owner.</p></div>${stateCard('lock', 'Locked out', 'No path is left, so only your written procedure applies. No admin, support route, email or SMS can recover this account for you.')}${tags(proposed('CT-17'))}`;
    const top = web ? `<div class="glass" style="position:absolute;inset:0 0 auto;height:38px;z-index:5;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:0;font:500 12px/16px var(--font-text);color:var(--ink)">${ic('lock', 's14')}MyPrediction · Sign in</div>` : wideOne ? '' : `<div data-contrast-exempt style="position:absolute;inset:0 0 auto;height:54px;z-index:25">${sbar()}</div>`;
    return `${top}<div class="aidentity-cover${web ? ' web' : ''}${wideOne ? ' wide' : ''}"><div class="dfield"></div><div class="aidentity-in">${inner}</div></div>${wideOne ? '' : homeInd}`;
  };
  const lostFrame = ctx => (ctx.state === 'denied' ? lockedFrame(ctx) : null);

  /* ---------- one device ---------- */
  const buildRow = (ctx, n) => {
    if (!isApp(n)) return ['App shell', ctx.state === 'expired' ? 'Session expired' : 'Ready'];
    return ['App build', ctx.state === 'expired' ? 'Expired · reinstall from your Mac' : ctx.state === 'partial' ? 'Expiring soon' : 'Installed · 7-day build'];
  };
  const offlineRow = (ctx, n) => ['Offline copy', isApp(n) ? (ctx.state === 'conflict' ? 'Clears when it next connects' : ctx.state === 'error' ? 'Rebuilt from the server' : 'Encrypted · cached and aged') : 'Open'];
  const deviceCard = (ctx, ended) => {
    const n = gone(ctx);
    return card(`${head(n, ended ? chip('stale', 'Ended', 'split') : { error: chip('error', 'Still signed in', 'alert'), conflict: chip('stale', 'Ended', 'split'), expired: chip('stale', 'Expired', 'clock') }[ctx.state] || chip('', 'Signed in'))}${kv([['Last active', ctx.state === 'conflict' ? 'Revoked 21:02' : lineOf(n).split(' · ')[0]], ['Signed in with', isApp(n) ? 'Google, in the system browser' : 'Google'], offlineRow(ctx, n), buildRow(ctx, n), ['Updates', 'Polling for now']])}${tags(proposed('PL-04'), isApp(n) ? '' : proposed('MP40-Q12'))}`);
  };
  const sideBySide = ctx => {
    const n = gone(ctx), h = HERE[ctx.kind], side = (x, status) => kv([['Status', status], offlineRow(ctx, x), buildRow(ctx, x)]);
    return card(`${head('This device and that one')}<div class="aidentity-two"><div>${lbl(h)}${kv([['Status', 'Active now'], ['Offline copy', isApp(h) ? 'Encrypted · fresh' : 'Open'], [isApp(h) ? 'App build' : 'App shell', isApp(h) ? 'Installed · 7-day build' : 'Ready']])}</div><div>${lbl(n)}${side(n, ctx.state === 'conflict' ? 'Ended on the server' : lineOf(n).split(' · ')[0])}</div></div>`);
  };
  const T_DEV = {
    what: 'This device', rows: 4, loading: 'Reading this device.',
    empty: banner('', 'Nothing else is signed in.', 'This is the last device that was. There is nothing to revoke today.', 'info'),
    partial: banner('warn', 'The app build is expiring soon.', 'The app warns before a build expires. Reinstalling from your Mac restores it, with the server as the source of truth.', 'clock'),
    error: banner('fall', 'This revoke did not finish.', 'It failed at 21:16 and the device is still signed in. Try again.', 'alert'),
    stale: banner('warn', 'From 11:12.', 'A device may look active after it has been revoked.', 'clock'),
    offline: banner('', 'Offline.', 'Revoking needs a connection. Nothing has changed.', 'wifi-off'),
    conflict: banner('warn', 'This device still shows as signed in on itself.', 'The server has ended it. Its offline copy clears when it next connects.', 'split'),
    expired: banner('warn', 'This device has run out.', 'A new sign-in or a reinstall from your Mac brings it back, with the server as the source of truth.', 'clock'),
    denied: ctx => signNote('This device stays readable.')
  };
  const T_DEVS = {
    what: 'Your devices', rows: 4, loading: 'Reading what is signed in now.',
    empty: banner('', 'Only this device is signed in.', 'There is nothing else to revoke. Check your ways back in, so losing it does not lock you out.', 'info'),
    partial: ctx => banner('warn', `${quiet(ctx)} did not report.`, 'Its last activity is unknown, which is not the same as idle.', 'clock'),
    error: ctx => banner('fall', `${gone(ctx)} was not revoked.`, 'It failed at 21:16 and is still signed in. Try again.', 'alert'),
    stale: banner('warn', 'From 11:12.', 'A device may look active after it has been revoked. This list refreshes when it can.', 'clock'),
    offline: banner('', 'Offline.', 'Revoking needs a connection. Nothing has changed.', 'wifi-off'),
    conflict: ctx => banner('', `${gone(ctx)} still shows as signed in on the device itself.`, 'The server has ended it. Its offline copy clears when it next connects.', 'split'),
    expired: ctx => (ctx.kind === 'ipad' ? banner('warn', 'Phone web needs you.', 'Its session expired, so it needs a new sign-in.', 'clock') : ctx.kind === 'pwa' ? banner('warn', 'The iPad needs you.', 'Its build expired, and reinstalling from your Mac restores it.', 'clock') : banner('warn', 'Two devices need you.', 'Phone web\'s session expired. The iPad build expired, and reinstalling from your Mac restores it.', 'clock')),
    denied: ctx => signNote('This list stays readable.')
  };
  const revokeNote = ctx => (ctx.state === 'empty' ? '' : card(`${head('Revoking')}${note(`${ANY} It ends the device's sessions and closes its live streams, in a time you approve. Revoking needs no iPhone passkey.`)}${WAIT[ctx.state] ? held(WAIT[ctx.state]) : ''}${note(LINE)}${rvNote()}`));
  const devList = ctx => (ctx.state === 'empty' ? list(row('person', HERE[ctx.kind], 'Active now', tags(chip('owner', 'This device')))) : devRows(ctx));
  const revokeTool = ctx => (ctx.state === 'empty' || ctx.state === 'conflict' ? '' : card(`${head('Revoke this device')}${note(`${ANY} It ends its sessions and closes its live streams, in a time you approve.`)}${can(ctx, ctx.state === 'error' ? act('A49', 'Try again', 'primary') : act('A49', `Revoke ${gone(ctx)}`, 'primary'))}${note(LINE)}${rvNote()}`));

  /* ---------- the revoke sheet: a fresh sign-in, one exact device ---------- */
  const SHEET = {
    loading: ['Waiting for your fresh sign-in', 'Nothing has changed yet.'],
    empty: ['Nothing to revoke', 'Only this device is signed in.'],
    partial: ['Revoked, one thing left', 'Its sessions ended. Its offline copy clears when it next connects.'],
    error: ['This did not finish', 'It failed at 21:16 and the device is still signed in.'],
    stale: ['Refresh first', 'This list is from 11:12, and the device may already be revoked.'],
    offline: ['You are offline', 'A fresh sign-in has to reach the server, so nothing can be revoked offline.'],
    conflict: ['Already ended', 'The server ended this device at 21:02. There is nothing left to revoke.'],
    expired: ['Your fresh sign-in ran out', 'Nothing was revoked. Start again.'],
    denied: ['A fresh sign-in is needed', LINE]
  };
  const revokeSheet = ctx => {
    const s = ctx.state, n = gone(ctx), mine = SHEET[s];
    const title = mine ? mine[0] : `Revoke ${n}`;
    const facts = box(kv([['Device', n], ['Environment', 'Production'], ['Sign in with', 'Any healthy path, passkey or Google'], ['Ends', 'Its sessions and refresh tokens'], ['Closes', 'Its live streams, in a time you approve'], ['Removes', 'Any passkey held on it'], ['Keeps', 'Your ledger, audit and every other device']]));
    const go = s === 'default' ? act('A49', `Revoke ${n}`, 'primary') : s === 'error' ? act('A49', 'Try again', 'primary') : s === 'expired' || s === 'denied' ? btn('Sign in again', 'primary', 'lock') : '';
    return `<div class="sheet" role="dialog" aria-modal="true" aria-label="${title}" data-mo="sheet">${wide(ctx) ? '' : '<div class="grabber"></div>'}<h4>${title}</h4><div class="aidentity-sheet">${note(mine ? mine[1] : 'You revoke exactly this device. Sign-out and revoke both clear its offline copy.')}${s === 'empty' || s === 'conflict' ? '' : `${facts}${rvNote()}`}${s === 'default' || s === 'error' ? note(LINE) : ''}${go}<button class="btn sm btn-plain" type="button">Not now</button></div></div>`;
  };

  /* ---------- the second door, on each option ---------- */
  const COVER_CONFIG = 'n/a: Identity has no settings of its own. The user pool, its providers and the revocation time change through Terraform and CT-17, not on a screen here.';
  const COVER_COST = 'n/a: Identity has no spend of its own. Cognito sits in the AWS line, in Costs and budgets, and the Apple Developer Program is your separate decision.';
  const COVER_DECIDE = 'n/a: Identity has no request to approve or reject. Link, unlink, revoke and enrol are your own acts, so leaving one undone is the whole of declining, and an unfinished link leaves both sides unlinked.';
  const pathsRail = ctx => `${lostRow(ctx)}${notPaths()}${allLost()}${NEVER()}`;

  J.add({
    id: 'identity', title: 'Identity and devices',
    stories: ['MP-64', 'MP-73', 'MP-87', 'MP-78', 'MP-83', 'MP-94', 'MP-134', 'MP-168', 'MP-164', 'MP-165', 'MP-166'],
    summary: 'How you get back in, and what is signed in now. Only you link, unlink, revoke or enrol, and no route recovers this account for you.',
    options: [{
      id: 'a', name: 'Paths first', rec: true,
      why: 'A lockout is the one failure MP cannot repair for you, so this opens on how many ways back in you have. Every act hangs off the path it changes.',
      cost: 'What is signed in now sits one step down, so a lost device is a row to press, not the first thing on screen.',
      covers: { compare: 'a-path', decide: COVER_DECIDE, source: 'a-path', correct: 'a-lost', config: COVER_CONFIG, cost: COVER_COST, recover: 'a-lost' },
      screens: [{
        id: 'a-paths', title: 'Ways back in', note: 'The iPhone passkey row waits on the purchase (MP-179), as Privacy now draws it too ("Redraw Privacy now", ADM-13). Nothing depends on it.',
        render: ctx => frame(ctx, {
          title: 'Ways back in', back: 'Admin',
          body: view(ctx, T_PATHS, () => `${countCard(ctx)}${pathRows(ctx)}${list(`${opens('plus', 'Enrol a passkey', 'A second path you control')}${opens('person', 'Signed in now', `${ctx.state === 'empty' ? '1 device' : '4 devices'} · ${HERE[ctx.kind]} is this one`)}`)}`),
          rail: pathsRail(ctx)
        })
      }, {
        id: 'a-path', title: 'One path', note: 'Compared with the path that would be left, so you can see what an unlink costs.',
        render: ctx => frame(ctx, {
          title: 'Google', back: 'Ways back in',
          body: view(ctx, T_PATH, () => `${card(`${head('Google', ctx.state === 'empty' ? chip('stale', 'Last path', 'alert') : ctx.state === 'partial' ? chip('stale', 'Unknown', 'clock') : ctx.state === 'error' ? chip('stale', 'Unavailable', 'clock') : healthy(ctx))}${kv([['Link', 'Linked on proof of both'], ['Identified by', 'Stable subject, never email'], ['Environment', 'Production']])}`)}${ctx.state === 'empty' ? '' : compare(ctx)}${unlink(ctx)}`),
          rail: auditCard(ctx)
        })
      }, {
        id: 'a-link', title: 'Link Google', note: 'Reached after an unlink, or when a link never finished. Ready has Google linked, so this view is the world where it is not.',
        render: ctx => frame(ctx, {
          title: 'Link Google', back: 'Ways back in',
          body: view(ctx, T_LINK, () => linkSteps(ctx)),
          rail: `${card(`${head('What a link never does')}${note('A matching email never links or merges two identities. A link that fails midway leaves both unlinked, and the attempt is audited.')}`)}${refused('R10', 'Email, SMS and support never recover this account. Only your own proof does.')}`
        })
      }, {
        id: 'a-enrol', title: 'Enrol a passkey', note: 'A control on the Mac and in a phone\'s browser. iPhone and iPad say why not until the Developer Program is bought (MP-179), with CT-17 and PL-09 still open. Phone web enrols in the browser, as you picked ("Allowed in the browser", ADM-04), unverified until MP-197.',
        render: ctx => frame(ctx, {
          title: 'Enrol a passkey', back: 'Ways back in',
          body: view(ctx, T_ENROL, () => enrolHere(ctx)),
          rail: `${card(`${head('Where this works')}${note('Trusted origins and passkey scope are not settled yet, per environment.')}${tags(proposed('CT-17'))}`)}${notPaths()}`
        })
      }, {
        id: 'a-devices', title: 'Signed in now', note: 'One step down from your paths. Any device but the one in your hand can be revoked, with a fresh sign-in on any healthy path ("Any healthy path", ADM-03), and a revoke removes any passkey on it ("Revoke removes it too", ADM-02).',
        render: ctx => frame(ctx, {
          title: 'Signed in now', back: 'Ways back in',
          body: view(ctx, T_DEVS, () => `${ctx.state === 'empty' ? list(row('person', HERE[ctx.kind], 'Active now', tags(chip('owner', 'This device')))) : devRows(ctx, true)}${revokeNote(ctx)}`),
          rail: `${card(`${head('On this device')}${sessionsNote(ctx)}`)}${lostRow(ctx)}`
        })
      }, {
        id: 'a-lost', title: 'Lost a device', note: 'Recovery never leans on the iPhone passkey: step 1 is any healthy path, passkey or Google (ADM-03). The replacement goes on the Mac, as Privacy draws it (ADM-13). Empty draws the lost Mac: a phone finishes in its browser ("Finish in the phone browser", ADM-15), unverified until MP-197, with the one-path fallback beside it.',
        render: ctx => lostFrame(ctx) || frame(ctx, {
          title: 'Lost a device', back: 'Ways back in',
          body: view(ctx, T_LOST, () => lostBody(ctx)),
          rail: lostRail(ctx)
        })
      }]
    }, {
      id: 'b', name: 'Devices first',
      why: 'The usual reason to come here is a device: a lost phone, an odd session, a build that ran out. This opens on what is signed in now, and revoking is one press from it.',
      cost: 'How many ways back in you have is a row, not the headline, so running down to one path is easier to miss.',
      covers: { compare: 'b-device', decide: COVER_DECIDE, source: 'b-device', correct: 'b-lost', config: COVER_CONFIG, cost: COVER_COST, recover: 'b-lost' },
      screens: [{
        id: 'b-devices', title: 'Signed in now', note: 'Any device but the one in your hand opens and can be revoked, with a fresh sign-in on any healthy path (ADM-03). A revoke removes any passkey on it (ADM-02).',
        render: ctx => frame(ctx, {
          title: 'Signed in now', back: 'Admin',
          body: view(ctx, T_DEVS, () => `${devList(ctx)}${ctx.state === 'error' ? rvNote() : ''}${lostRow(ctx)}`),
          rail: `${card(`${head('On this device')}${sessionsNote(ctx)}`)}${list(opens('lock', 'Ways back in', ctx.state === 'empty' ? 'Check you have two' : '2 usable, 1 waiting on MP-179'))}${refused('R8', 'MP has one owner. Nobody else can be added, and nobody signs in for you.')}`
        })
      }, {
        id: 'b-device', title: 'One device', note: 'A build, an offline copy and a session each say what is known about them.',
        render: ctx => frame(ctx, {
          title: gone(ctx), back: 'Signed in now',
          body: view(ctx, T_DEV, () => `${ctx.state === 'empty' ? '' : deviceCard(ctx)}${ctx.state === 'empty' ? '' : sideBySide(ctx)}${revokeTool(ctx)}`),
          rail: auditCard(ctx)
        })
      }, {
        id: 'b-revoke', title: 'Revoke', note: 'A fresh sign-in, bound to one device. Offline and stale say why not, and offer no control.',
        render: ctx => frame(ctx, {
          title: gone(ctx), back: 'Signed in now',
          body: ctx.state === 'empty' ? '' : deviceCard(ctx, ctx.state === 'partial'), rail: '', sheet: revokeSheet(ctx)
        })
      }, {
        id: 'b-lost', title: 'Lost a device', note: 'The same recovery as Paths first, entered from the device. The replacement goes on the Mac, as Privacy draws it (ADM-13). Empty draws the lost Mac: a phone finishes in its browser (ADM-15), unverified until MP-197, with the one-path fallback beside it.',
        render: ctx => lostFrame(ctx) || frame(ctx, {
          title: 'Lost a device', back: 'Signed in now',
          body: view(ctx, T_LOST, () => lostBody(ctx)),
          rail: lostRail(ctx)
        })
      }, {
        id: 'b-paths', title: 'Ways back in', note: 'The iPhone passkey row waits on the purchase (MP-179), as Privacy now draws it too ("Redraw Privacy now", ADM-13). Nothing depends on it.',
        render: ctx => frame(ctx, {
          title: 'Ways back in', back: 'Signed in now',
          body: view(ctx, T_PATHS, () => `${pathRows(ctx, { flat: true })}${ctx.state === 'empty' ? note('Google cannot be unlinked while it is your last path. Add another path first.') : card(`${head('Unlink Google')}${note('This leaves Passkey, Mac, and the iPhone row, which cannot count until the Developer Program is bought (MP-179). So you would be on one path, and MP warns you.')}${can(ctx, act('A47', 'Unlink Google'), PATHSHELD)}${note(LINE)}`)}`),
          rail: `${list(opens('plus', 'Add a path', 'Link Google, or enrol a passkey'))}${notPaths()}${allLost()}${NEVER()}`
        })
      }, {
        id: 'b-add', title: 'Add a path', note: 'Link is reached after an unlink, because Ready has Google linked. Enrol is a control on the Mac and in a phone\'s browser (ADM-04), unverified until MP-197.',
        render: ctx => frame(ctx, {
          title: 'Add a path', back: 'Ways back in',
          body: view(ctx, T_LINK, () => `${linkSteps(ctx)}${enrolHere(ctx, NOEMAIL)}`),
          rail: card(`${head('What a link never does')}${note('A matching email never links or merges two identities. A link that fails midway leaves both unlinked, and the attempt is audited.')}`)
        })
      }]
    }]
  });
}
