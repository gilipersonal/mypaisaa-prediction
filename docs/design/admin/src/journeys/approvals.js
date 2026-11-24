/* Approvals and configuration (MP-64, ARC-08). What is current, what waits, what changed and how it is undone. Claude drafts, code
   checks, you decide: an approval binds one exact change, is rechecked when it applies, and can never widen authority (MP-78, MP-114).
   Ready is the morning of Wed 4 Nov with 4 decisions waiting, so settings are at v9 and the catalogue at v14: nothing is approved
   yet. Every non-financial expiry is illustrative (CT-02). Every figure is illustrative. */
{
  /* ---------- small parts ---------- */
  const chip = (cls, t, i) => `<span class="chip ${cls}">${i ? ic(i, 's14') : '<span class="dot"></span>'}${t}</span>`;
  const tags = (...c) => `<div class="aappr-tags">${c.join('')}</div>`;
  const p = t => `<p class="small muted">${t}</p>`;
  const off = h => h.replace(/type="button"/g, 'type="button" disabled');
  const no = (label = 'Refuse') => act('A51', label, 'tinted');
  const STEP = 'Opening the app with Face ID, or an open session, is not enough. The server checks a fresh sign-in.';
  const NOTRADE = 'This records what already happened at your broker. It places no trade.';
  const OFFLINE = 'No financial write offline. Nothing can be changed until you reconnect.';
  const OLD = 'Reading needs no fresh sign-in. Changing something does, and yours is too old for this action.';
  /* the owner's picks of 5 Nov 2026 (MP-184), applied in MP-192: a chat-proposed listing expires the same day ("Same day, as drawn", MP40-Q9),
     every other kind keeps its own wait ("By kind, as drawn", OWN-08) and how many days is open (CT-02), and a scope you keep paused stays,
     undated ("It stays, undated", OWN-29). An approval window on a change is still open (CT-02) */
  const Q9 = settled('MP40-Q9'), CT2 = proposed('CT-02'), KIND = settled('OWN-08') + proposed('CT-02'), KEPT_PAUSED = settled('OWN-29');
  const expiry = (t, cls = 'stale') => chip(cls, t, 'clock');
  const ST = {
    waits: expiry('Waits on you'), refused: chip('error', 'Refused', 'x'), expired: expiry('Expired'), blocked: chip('error', 'Blocked', 'ban'),
    auto: chip('', 'Automatic', 'refresh'), revoked: chip('error', 'Revoked', 'ban'), loading: '<span class="chip"><span class="spin" aria-hidden="true"></span>Loading</span>', checking: '<span class="chip"><span class="spin" aria-hidden="true"></span>Checking</span>'
  };
  const head = (i, t, s, c = '') => `<div class="card aappr-head" data-mo="card">${lead(i)}<div class="aappr-min"><div class="aappr-t">${t}</div><div class="small muted">${s}</div>${c ? tags(c) : ''}</div></div>`;
  /* the same line on every proposal: who did what */
  const chain = (a = 'Claude drafted', b = 'Code checked', c = 'You decide') => `<div class="aappr-chain" role="list" aria-label="Who did what" data-mo="rise"><div role="listitem">${ic('fan', 's16')}<span>${a}</span></div><div role="listitem">${ic('check', 's16')}<span>${b}</span></div><div role="listitem" class="me">${ic('person', 's16')}<span>${c}</span></div></div>`;
  const change = r => r.map(([k, a, b, s]) => `<div class="aappr-ch"><span class="small muted">${k}</span><span class="aappr-to">${a ? `<span class="was">${a}</span>${ic('chev-r', 's14')}` : ''}${b}</span>${s ? `<span class="small muted aappr-full">${s}</span>` : ''}</div>`).join('');
  const changeCard = (r, title = 'Exactly what would change') => box(`${lbl(title)}<div class="aappr-gap">${change(r)}</div>`);
  const bindCard = (title, r, tag = '') => box(`${lbl(title)}<div class="aappr-gap">${kv(r)}</div>${tag ? tags(tag) : ''}`);
  /* OWN-35, "Code may draft one": word for word with the owner journeys' Approvals */
  const BUDGET = 'A budget changes only when you change a line in Settings, or approve a raise code drafted with its cost and rollback, and it stays under £100.';
  const limits = t => banner('', 'Cannot widen authority.', `${t} It grants no tool, source or permission, and code refuses any change that would. ${BUDGET}`, 'shield');
  /* the decision, in the state on screen. Offline and denied keep the control in view and say why it is shut */
  const decision = (ctx, o) => {
    const s = ctx.state, live = o.live ?? (s === 'default' || s === 'stale');
    const y = live ? o.yes : off(o.yes), n = o.nay ? (live ? o.nay : off(o.nay)) : '';
    return box(`${lbl(o.title || 'Your decision')}<p class="small muted aappr-gap">${o.foot}</p>${o.tag ? tags(o.tag) : ''}<div class="aappr-acts aappr-gap">${y}${n}</div>${s === 'offline' ? `<div class="aappr-gap">${refused('R16', OFFLINE)}</div>` : ''}${s === 'denied' && wide(ctx) ? `<p class="small aappr-gap">${STEP}</p><div class="aappr-gap">${btn('Sign in again', 'primary', 'lock')}</div>` : ''}`);
  };
  /* every ending of a decision, so a screen never stops at the button (lesson 28) */
  const ends = rows => box(`${lbl('How this can end')}${rows.map(([t, x]) => `<div class="aappr-end"><b>${t}</b><span class="small muted">${x}</span></div>`).join('')}`);

  /* ---------- the band: settings v9 to v10 (MP-114) ---------- */
  const SET_ROWS = [['Weekly band', '5 points', '4 points', 'A forecast\'s probabilities may shift at most 4 points a week.'], ['Settings version', 'v9', 'v10']];
  const SET_WHY = [['Expected impact', '', 'Slower correction', 'After a miss, a forecast takes longer to adjust.'], ['Evidence', '', '26 weeks of replay', 'Evidence hash e40b…7d12.'], ['Cost a month', '', '£0'], ['How to roll it back', '', 'A new version', 'A rollback makes v11 equal to v9, with its own record. Nothing is overwritten.'], ['Also moves', '', 'Promote R2-HGB v4', 'The promotion binds the 5-point band and the settings change moves it to 4, so approving one sends the other back to its check.']];
  const BAND_END = [['Approved', 'Applied with your fresh sign-in. Settings v10 keeps v9 as its previous version.'], ['You refused', 'Nothing changed. Settings v9 stays current. A repeat proposal backs off with a visible reason.'], ['Approved, not applied', 'The write failed part way, so settings v9 stays current and nothing was half-changed. Your approval holds, for a retry inside its window.'], ['Rolled back', 'Rolling back to v8 makes a new version equal to it, with its own audit record. A waiting proposal is refused and rebuilt on that version.']];
  const SET_BIND = [['Owner', 'You'], ['Environment', 'Production'], ['Setting', 'Weekly band'], ['Value', '4 points'], ['Current version', 'v9'], ['Payload hash', '1b7c…d3e4'], ['Expires', 'Mon 9 Nov, 18:00']];
  const setHead = (c = expiry('Expires Mon 18:00') + KIND) => head('sliders', 'Narrow a self-correction band', 'Probabilities · 5 to 4 points a week', c);
  const setOk = extra => () => setHead() + chain() + extra() + changeCard(SET_ROWS) + changeCard(SET_WHY, 'Impact, evidence, cost and rollback');
  const bandCore = (ctx, extra = () => '') => region(ctx, {
    what: 'This proposal', rows: 3, ok: setOk(extra),
    loading: () => setHead(ST.loading) + `<div class="card fcard" data-mo="card">${lbl('Reading the stored evidence')}<span class="sk" style="height:60px;margin-top:10px"></span></div>`,
    empty: () => stateCard('check', 'No settings change waits', 'Every setting stays as you approved it. A proposal lands here with its impact, evidence, cost and how to roll it back.') + extra(),
    partial: () => banner('warn', 'Partly checked.', 'The replay store did not answer, so the evidence is not shown and this cannot be approved yet. Nothing here counts as passed.', 'clock') + setHead() + chain('Claude drafted', 'Code checking', 'You decide') + extra() + changeCard(SET_ROWS) + changeCard([SET_WHY[0], ['Evidence', '', 'Not read', 'A missing check is never a pass.'], ...SET_WHY.slice(2)], 'Impact, evidence, cost and rollback'),
    error: () => setHead(ST.refused) + stateCard('alert', 'The evidence changed', 'The evidence hash no longer matches what this proposal was built on, so it cannot be approved. Code rebuilds the proposal.', '', chip('error', 'Evidence hash mismatch', 'x')) + extra() + changeCard(SET_ROWS, 'What this proposed'),
    stale: () => banner('warn', 'Index lagging.', 'This is from 11:12. The proposal rechecks itself against the current version before you can approve it.', 'clock') + setOk(extra)(),
    offline: () => banner('', 'Offline.', 'You can read this proposal. Approving needs a connection and a fresh sign-in.', 'wifi-off') + setOk(extra)(),
    conflict: () => banner('warn', 'Refused for a stale revision.', 'Settings v10 was written at 09:01, so this proposal is refused against v9. Code rebuilds it on the new version.', 'split') + setHead(ST.refused) + extra() + changeCard(SET_ROWS, 'What this proposed'),
    expired: () => banner('warn', 'Expired. It did not apply.', 'Your approval closed before this applied, so nothing changed, and the 5-point band stays. Approve again for a new window.', 'clock') + tags(CT2) + setOk(extra)(),
    denied: () => banner('warn', 'A fresh sign-in is needed.', OLD, 'lock') + setOk(extra)()
  });
  const bandRail = (ctx, top = '') => {
    const s = ctx.state;
    if (s === 'loading') return top + skel(2);
    if (s === 'empty') return top + ends(BAND_END);
    const open = ['default', 'stale', 'offline', 'denied', 'partial', 'expired'].includes(s);
    return top + (open ? decision(ctx, { foot: 'Bound to settings v9 · expires Mon 18:00. A stale, replayed or expired approval is refused.', yes: act('A29', 'Approve this band', 'primary'), nay: no(), tag: KIND, live: ['default', 'stale', 'expired'].includes(s) }) : box(`${lbl('Your decision')}<p class="small muted aappr-gap">Nothing to decide on this version. Code rebuilds the proposal, and it returns to In force when it is ready.</p><div class="aappr-acts aappr-gap">${off(act('A29', 'Approve this band', 'primary'))}</div>`)) + bindCard(open ? 'This approval is bound to' : 'What this proposed', SET_BIND, KIND) + ends(BAND_END) + limits('This changes one setting, inside the band you approved.');
  };
  /* Option A reads the band as versions, option B as a request's life */
  const proposeBtn = ctx => { const b = act('A58', 'Propose a change', 'tinted', 'plus'); return `<div class="aappr-acts">${ctx.state === 'offline' ? off(b) : b}</div>`; };
  const versions = ctx => {
    const s = ctx.state, shutRb = ['offline', 'denied', 'error', 'partial'].includes(s), propose = proposeBtn(ctx);
    const tail = t => `${p(t)}${propose}`;
    if (s === 'empty') return `${sec('Versions')}${list(item(lead('check', 'rise'), 'v10 · current', 'Weekly band 4 points · 10% a month · approved at 09:16', chip('fresh', 'Current')) + item(lead('layers'), 'v9 · previous', 'Weekly band 5 points · 10% a month · kept with its own record', chip('', 'Kept'), act('A32', 'Roll back to v9')))}${tail('A rollback makes v11 equal to v9, with its own record. Nothing is overwritten.')}`;
    if (s === 'conflict') return `${sec('Versions')}${list(item(lead('check', 'rise'), 'v10 · current', 'Written at 09:01 · weekly band 5 points · 10% a month · another setting moved', chip('fresh', 'Current')) + item(lead('layers'), 'v9 · previous', 'Weekly band 5 points · 10% a month · kept with its own record', chip('', 'Kept'), act('A32', 'Roll back to v9')))}${sec('Refused')}${list(item(lead('ban', 'fall'), 'Weekly band 4 points', 'Proposed against v9, so refused', ST.refused))}${tail('A rollback makes v11 equal to v9, with its own record. Nothing is overwritten.')}`;
    const rb = act('A32', 'Roll back to v8');
    return `${sec('Versions')}${list(item(lead('plus'), 'v10 · proposed', 'Weekly band 4 points · not current', chip('proposed', 'Proposed')) + item(lead('check', 'rise'), 'v9 · current', 'Weekly band 5 points · 10% a month', chip('fresh', 'Current')) + item(lead('layers'), 'v8 · previous', 'Weekly band 5 points · 10% a month · another setting differs', chip('', 'Kept'), shutRb ? off(rb) : rb))}${tail('A rollback makes a new version equal to the old one, with its own audit record. A change that fails part way leaves the previous version current. Rolling back moves the version, so a waiting proposal is refused and rebuilt.')}`;
  };
  const LIFE = ['draft', 'validated', 'awaiting_owner', 'approved', 'executing', 'succeeded'];
  const lifeOf = { default: 2, stale: 2, offline: 2, denied: 2, partial: 1, loading: 1, empty: -1 };
  const life = ctx => {
    if (ctx.state === 'empty') return '';
    const at = lifeOf[ctx.state] ?? 2, end = { error: ['failed', 'error'], conflict: ['refused', 'error'] }[ctx.state];
    return box(`${lbl('Where this request is')}${tags(...LIFE.map((t, i) => (i === at && !end ? chip('owner', t, 'chev-r') : i < at ? chip('', t, 'check') : chip('illus', t, 'clock'))), ...(end ? [chip(end[1], end[0], 'x')] : []))}<div class="aappr-gap">${p('Rejected, expired or cancelled requests end here with nothing run.')}</div>${tags(CT2)}`);
  };

  /* ---------- the listing Claude proposed (MP-131, MP-74) ---------- */
  const TSM_ROWS = [
    ['Catalogue version', 'v14', 'v15'], ['Watch-only listings', '3', '4', 'Tracked and forecast, not held.'],
    ['Credits a month', '18,360', '18,411', 'Bar and retry 44, actions 7. XNYS is already polled, and TSM is not on 30-minute checks.'],
    ['Credits once', '', '42', 'One backfill.'], ['Cash a month', '', '£0', 'Stays inside Grow 55. The £100 ceiling is untouched.'], ['Joins from', '', 'The next close']
  ];
  const TSM_BIND = [['Action', 'Add a watch-only listing'], ['Change', 'Catalogue v14 to v15'], ['Listing', 'TSM · XNYS'], ['Environment', 'Production'], ['Payload hash', '2d7a…b310'], ['Expires', 'Today, 18:00']];
  const lstHead = (c = expiry('Expires 18:00') + Q9) => head('plus', 'Watch Taiwan Semiconductor', 'TSM · XNYS · watch-only · Claude proposed in chat', c);
  const LIST_END = [['Confirmed', 'It joins from the next close, and catalogue v15 is made with your approval record.'], ['You refused', 'Nothing was added. Catalogue v14 stays current, and a repeat backs off with a visible reason.'], ['Confirmed, not applied', 'The catalogue write failed, so v14 stays current and nothing was half-added. Your confirmation holds, for a retry inside its window.']];
  const catVersions = ctx => {
    const s = ctx.state;
    if (s === 'empty' || s === 'conflict') return `${sec('Versions')}${list(item(lead('check', 'rise'), 'v15 · current', s === 'empty' ? '4 watch-only listings · confirmed at 09:02' : 'Written at 09:01 · another confirmation', chip('fresh', 'Current')) + item(lead('layers'), 'v14 · previous', '3 watch-only listings · kept with its own record', chip('', 'Kept')))}`;
    return `${sec('Versions')}${list(item(lead('plus'), 'v15 · proposed', s === 'expired' ? 'Expired 18:00 · never current' : '4 watch-only listings · not current', chip(s === 'expired' ? 'stale' : 'proposed', s === 'expired' ? 'Expired' : 'Proposed')) + item(lead('check', 'rise'), 'v14 · current', '3 watch-only listings', chip('fresh', 'Current')))}`;
  };
  const lstOk = ctx => lstHead() + chain() + changeCard(TSM_ROWS) + catVersions(ctx);
  /* what code has finished, as far as this state got: done, partial (rights open) or stopped (the probe timed out) */
  const checks = (at = 'done') => box(`${lbl(at === 'stopped' ? 'What code checked before it stopped' : 'What code checked')}<div class="aappr-gap">${kv([['Identity', 'TSM on XNYS, the US listing'], ['Coverage', at === 'stopped' ? 'Timed out, no result' : 'Twelve Data end of day, Yahoo delayed'], ['Busiest minute', at === 'stopped' ? 'Not finished' : '30 of the 45-credit cap, unchanged'], ['Rights and budget', at === 'done' ? 'Recorded, no tier change needed' : 'Not finished']])}</div>`);
  const others = () => `${sec('Cannot be approved')}${list(item(lead('clock', 'warn'), 'Watch Barclays', 'BARC · XLON · expired 08:14', ST.expired, Q9) + item(lead('ban', 'fall'), '2330 on XTAI', 'Needs new calendars and rights work, so it goes to the extension checklist', chip('', 'Not here')))}`;
  const listingCore = ctx => region(ctx, {
    what: 'This proposal', rows: 3, ok: () => lstOk(ctx) + others(),
    loading: () => lstHead(ST.checking) + chain('Claude drafted', 'Code checking', 'You decide') + box(`${lbl('Checking coverage with Twelve Data')}<p class="small muted aappr-gap">8 credits reserved first. Nothing can be confirmed until this finishes.</p>`),
    empty: () => stateCard('check', 'Already decided', 'You confirmed this on your iPad at 09:02, so there is nothing left to do here. Catalogue v15 is current, and one approval record was made.') + catVersions(ctx) + others(),
    partial: () => banner('warn', 'Not yet checked.', 'Identity, coverage and the busiest minute are in. Rights and budget are not, so this cannot be confirmed. A missing check is never a pass.', 'clock') + lstHead() + chain('Claude drafted', 'Code checking', 'You decide') + changeCard(TSM_ROWS),
    error: () => lstHead(chip('error', 'Not yet checked', 'x')) + stateCard('alert', 'The check timed out', 'The coverage probe stopped at 09:14. Its 8 credits stay reserved until they reconcile, and nothing can be confirmed until a check finishes.', act('A57', 'Run the check again', 'tinted', 'refresh')),
    stale: () => banner('warn', 'Index lagging.', 'From 11:12. Confirming rechecks the probe and the catalogue version, and a stale proposal is refused.', 'clock') + lstOk(ctx) + others(),
    offline: () => banner('', 'Offline.', 'You can read this proposal. Confirming needs a connection, because the server rechecks it first.', 'wifi-off') + lstOk(ctx),
    conflict: () => banner('warn', 'The catalogue moved first.', 'Another confirmation landed at 09:01, so this one is refused against v15. The check runs again on the new version.', 'split') + lstHead(ST.refused) + changeCard(TSM_ROWS, 'What this proposed') + catVersions(ctx) + act('A57', 'Run the check again', 'primary', 'refresh'),
    expired: () => banner('warn', 'Expired at 18:00.', 'An expired proposal cannot be approved, and nothing was added. The catalogue may have moved, so the check must run again.', 'clock') + lstHead(expiry('Expired') + Q9) + changeCard(TSM_ROWS, 'What this proposed') + catVersions(ctx) + act('A57', 'Run the check again', 'primary', 'refresh'),
    denied: () => banner('warn', 'Your sign-in needs checking.', 'Reading needs no fresh sign-in. How strong a sign-in a catalogue change needs is open, so this is drawn as asking for one.', 'lock') + lstHead() + tags(proposed('CT-01')) + chain() + changeCard(TSM_ROWS) + catVersions(ctx)
  });
  const listingRail = ctx => {
    const s = ctx.state;
    if (s === 'loading') return skel(2);
    const tail = limits('This adds one watch-only listing.') + refused('R14', 'Letting the chat route add listings would widen authority, so code refused it on Tue at 17:20.');
    if (s === 'empty' || s === 'error' || s === 'conflict' || s === 'expired') return (s === 'error' ? checks('stopped') : '') + box(`${lbl('Your decision')}<p class="small muted aappr-gap">${s === 'empty' ? 'Already decided.' : 'Nothing can be confirmed on this proposal.'}</p><div class="aappr-acts aappr-gap">${off(act('A36', 'Confirm this listing', 'primary'))}</div>`) + ends(LIST_END) + tail;
    return decision(ctx, { foot: 'Bound to catalogue v14 · expires 18:00. A confirmed listing joins from its next close.', yes: act('A36', 'Confirm this listing', 'primary'), nay: no(), tag: Q9, live: s === 'default' || s === 'stale' }) + checks(s === 'partial' ? 'partial' : 'done') + bindCard('This approval is bound to', TSM_BIND) + ends(LIST_END) + tail;
  };

  /* ---------- the import: approve, then revoke until the commit starts (MP-55, MP-78). The same import as Holdings ---------- */
  const impHead = (c = expiry('15 min once approved')) => head('layers', 'Confirm a statement import', '11 rows · ledger revision 213', c);
  const IMP_ROWS = [['Apple', '60', '64 units'], ['HSBC, HSBA · XLON', '700', '730 units'], ['AstraZeneca', '85', '75 units'], ['ISA cash', '£4,012.60', '£4,142.83']];
  const IMP_BIND = [['Draft revision', '6'], ['Selected rows hash', '7f3a…c21e'], ['Expected revision', '213']];
  const noTrade = () => banner('', 'No trade.', NOTRADE, 'ban');
  const impSource = () => box(`${lbl('Where it came from')}<div class="aappr-gap">${kv([['File', 'isa-oct-2026-scan.pdf'], ['Kind', 'Scan, 4 pages'], ['Read as', '11 rows in 5 groups']])}</div><div class="aappr-gap">${bs('Open in Files and imports', 'tinted', 'layers')}</div>`);
  const leftOut = () => box(`${lbl('Selected: 9 of 11 rows, 3 groups')}<div class="aappr-gap">${kv([['Left out', 'AstraZeneca dividend, duplicate'], ['Left out', 'Transfer in £500.00, pending']])}</div>`);
  const impOk = () => impHead() + chain() + changeCard(IMP_ROWS) + leftOut() + impSource();
  const outcome = (i, tone, t, s, x = '') => `<div class="card fcard aappr-out" data-mo="card">${lead(i, tone)}<p class="aappr-big">${t}</p>${p(s)}${x}</div>`;
  const importCore = ctx => noTrade() + region(ctx, {
    what: 'This import', rows: 3, ok: impOk,
    empty: () => outcome('ban', 'fall', 'Revoked. Nothing changed.', 'You revoked this at 21:19, before the commit started, so it can never activate. The ledger stays at revision 213, and the draft stays at revision 6, ready for a new approval.', tags(ST.revoked)) + bs('Open in Files and imports', 'tinted', 'layers'),
    partial: () => banner('warn', 'Part of the statement.', '2 of the 11 rows are left out, and a differing cash amount of £12.40 stays open on this statement. You approve the 9 selected rows and nothing else.', 'clock') + impOk(),
    error: () => outcome('alert', 'warn', 'Too late to revoke.', 'The commit started at 21:22, before your revoke reached MP, so it finishes whole or not at all. To undo it, reverse the import in Files and imports.', tags(chip('fresh', 'Approved'))) + bs('Open in Files and imports', 'tinted', 'layers'),
    stale: () => banner('warn', 'Index lagging.', 'This preview is from 11:12. Approving rechecks the ledger revision, and a moved revision is refused.', 'clock') + impOk(),
    offline: () => banner('', 'Offline.', 'You can read this import. Approving and revoking need a connection.', 'wifi-off') + impOk(),
    conflict: () => outcome('split', 'warn', 'Refused for a stale revision.', 'Your ledger moved to revision 214, so this approval for 213 can never commit. Nothing was committed. Refresh the preview to approve it again.', tags(ST.refused)) + act('A53', 'Refresh preview', 'primary', 'refresh'),
    expired: () => outcome('clock', 'warn', 'Expired. Nothing was committed.', 'It expired Tue 21:33 with no commit started. The rows have not changed, so a fresh approval is enough.', tags(ST.expired)) + changeCard(IMP_ROWS, 'What this proposed'),
    denied: () => banner('warn', 'A fresh sign-in is needed.', OLD, 'lock') + impOk()
  });
  const importRail = ctx => {
    const s = ctx.state;
    if (s === 'loading') return skel(2);
    const fin = refused('R1', 'Nothing here edits the ledger. One controlled writer commits, and only the exact change you approved.');
    if (['empty', 'error', 'conflict'].includes(s)) return fin;
    const rev = s === 'expired' ? '' : box(`${lbl('After you approve')}<p class="small muted aappr-gap">It waits here until its commit starts, and you can revoke it until then. Once it starts, it finishes once or not at all. At 21:18 it would read: approved, expires 21:33.</p>${tags(proposed('FIN-OD-02'))}<div class="aappr-acts aappr-gap">${off(act('A09', 'Revoke this approval'))}</div>`);
    return decision(ctx, { foot: 'Bound to the 9 selected rows. Once you approve, the commit must start within 15 minutes.', yes: act('A08', 'Approve these 3 groups', 'primary'), live: s === 'default' || s === 'stale' || s === 'partial' || s === 'expired' }) + `<div class="aappr-acts">${bs('To cancel the draft, open Files', 'tinted', 'layers')}</div>` + bindCard('This approval is bound to', IMP_BIND) + rev + fin;
  };

  /* ---------- ranking, alerts, scopes and markets: each versioned, each with its own open question ---------- */
  const pol = (i, t, st, rows, text, control, x = '') => box(`<div class="aappr-rowh">${lead(i)}<b>${t}</b>${st}</div><div class="aappr-gap">${kv(rows)}</div><div class="aappr-gap">${p(text)}</div>${x ? tags(x) : ''}${control ? `<div class="aappr-acts aappr-gap">${control}</div>` : ''}`);
  const policies = (ctx, o = {}) => {
    /* a withdrawal only stops a use, so it needs no fresh sign-in (OWN-39). In Denied the scope's state is unknown, so it still waits (R1-a13) */
    const stop = ['offline', 'denied', 'error', 'partial', 'conflict'].includes(ctx.state), a = h => (stop ? off(h) : h);
    return pol('grid', 'Ranking policy', chip('illus', 'draft_policy', 'clock'), [['Growth', '35'], ['Protection', '40'], ['Opportunity', '25']], 'A combined score exists only when all three are eligible. No action band classifies a listing until normalisation, ties and thresholds are approved, so this cannot be approved yet.', off(act('A33', 'Approve this policy version', 'primary')), proposed('FIN-OD-07'))
      + pol('alert', 'Alerts and quiet hours', chip('illus', 'No values proposed', 'clock'), [['Material', 'A line you set, crossed: exposure, price move, volatility or an event flag'], ['Critical', 'Security and service faults only'], ['Quiet hours', '22:00 to 07:00 London'], ['Held alerts arrive', 'With the 07:30 brief on weekdays. In your inbox at 07:30 at the weekend'], ['Repeat push', 'Once in 24 hours per holding, rule and severity, sooner if it worsens or the cause is new']], 'You picked "Your lines, no investment wake-ups", so an investment alert waits for 07:30, and "Once in 24 hours" for repeats. Each line still needs a value from you, and no record sets one yet, so nothing is here to approve. The weekend landing is proposed in "Weekdays only" itself.', off(act('A39', 'Approve these thresholds')), proposed('CT-18') + proposed('MP40-Q11'))
      + pol('shield', 'Risk-acceptance scopes', o.scope || chip('fresh', 'risk_accepted'), [['Scopes', 'S1 to S10'], ['Claude routes', 'S9 Grow 55, S10 Yahoo, prod'], ['Basis', 'owner_risk_acceptance']], 'Your accepted risk, never a licence. Gate code checks every use and cannot widen a scope. Withdrawing one stops that use.', a(act('A37', 'Withdraw S10, Yahoo to Claude')), proposed('DATA-DEC-04') + proposed('DATA-DEC-15'))
      + pol('layers', 'Market extensions', chip('illus', 'proposed', 'clock'), [['Taiwan, XTAI', 'Not eligible in the first release'], ['Contract tests', 'Not yet'], ['Point-in-time replay', 'Not yet'], ['Shadow evidence', 'Not yet'], ['Credits and cash against £100', 'Not yet']], 'An extension needs its own evidence and your activation before any listing in it becomes eligible. Deactivating rolls its version pointer back and keeps its history.', off(act('A38', 'Activate this extension')));
  };
  /* S10 covers one use: sending Yahoo values already inside S6 or S7 to Claude routes (catalogue.json). S6 and S7 are scopes of their own */
  /* ADM-07, "Record it, keep the outputs": MP records what was sent and says it cannot recall it; Claude text built on it stays, labelled */
  const SCOPE_ROWS = [['Yahoo values to Claude routes', 'risk_accepted', 'Stops at once'], ['Yahoo values already sent to Claude', '', 'Recorded, not recalled', 'MP records what was sent and cannot recall it. They stay wherever Anthropic holds them, for a time not verified.'], ['Claude text built on them', '', 'Stays, labelled', 'Explanations and notes keep their words, marked as built on values sent before you withdrew.'], ['Yahoo prices, S6 and S7', '', 'Unchanged', 'They have their own scopes, so collection, storage and display carry on.'], ['Cached projections and affected derivations', '', 'Unavailable for that use'], ['Stored data, backups and models', '', 'Disposition pending', `They follow the treatment you approve, which is still open.${tags(proposed('DATA-DEC-04'))}`]];
  const SCOPE_END = [['Withdrawn', 'Use stopped, disposition pending. The record keeps who withdrew it and when, and what had already been sent.'], ['Gate unavailable', 'Every use it covers fails closed, so nothing widens while it is down.']];
  const scopeEffect = () => changeCard(SCOPE_ROWS, 'If you withdraw S10') + ends(SCOPE_END);
  const policiesCore = ctx => region(ctx, {
    what: 'These policies', rows: 4, ok: () => policies(ctx),
    empty: () => stateCard('check', 'Nothing here waits on you', 'Nothing here is waiting for a decision. Each proposed card says what it waits on.') + policies(ctx),
    partial: () => banner('warn', 'Scope gate did not answer.', 'The gate is unavailable, so every use it covers fails closed until it returns. The other three policies answered.', 'clock') + policies(ctx, { scope: chip('error', 'gate unavailable (fail closed)', 'ban') }),
    error: () => stateCard('alert', 'These policies did not load', 'They failed at 11:38. Rankings, alerts and scopes keep running on the versions in force, and nothing can be approved until this loads.', btn('Try again', 'tinted', 'refresh')) + policies(ctx),
    stale: () => banner('warn', 'Capability proof is old.', 'S10\'s proof is past its review date, so its use is marked stale proof, not passed. Index from 11:12.', 'clock') + policies(ctx, { scope: chip('stale', 'stale proof', 'clock') }),
    conflict: () => banner('warn', 'Version moved.', 'A scope was withdrawn on another device while you read, so this page stays at the version you opened and nothing applied here.', 'split') + policies(ctx, { scope: chip('stale', 'withdrawn, disposition pending', 'clock') }),
    expired: () => banner('warn', 'A proposal here passed its time.', 'Nothing applied, and nothing waits here now. A repeat backs off with a visible reason.', 'clock') + tags(KIND) + policies(ctx),
    denied: () => banner('warn', 'A fresh sign-in is needed to change these.', 'Reading needs none. Approving or setting writes or widens, so it does, and withdrawing only stops, so it does not. Here the scope\'s state is unknown, so its use is blocked and the withdrawal waits until it is known.', 'lock') + tags(proposed('CT-01')) + policies(ctx, { scope: chip('error', 'unknown (use blocked)', 'ban') }),
    offline: () => banner('', 'Offline.', 'You can read these policies. Nothing can be changed until you reconnect.', 'wifi-off') + refused('R16', OFFLINE) + policies(ctx)
  });
  const policiesRail = ctx => (ctx.state === 'loading' ? '' : `${scopeEffect()}${limits('A policy change stays inside what you approved.')}${refused('R14', 'No settings change can grant a route a new tool, source, budget, infrastructure permission or approval authority.')}`);

  /* ---------- propose a change: you write it, code checks it, then you decide ---------- */
  const field = (ctx, l, ph, v = '', dead = false) => `<label class="aappr-field"><span class="small">${l}</span><input type="text" placeholder="${ph}" value="${v}" aria-label="${l}"${dead || !wide(ctx) ? ' disabled' : ''}></label>`;
  const SETTINGS = ['Signal weight band', 'Weekly band', 'Risk settings', 'Ranking settings', 'Agent settings'];
  const WAIT = 'Waits for a value', NOT = 'Not checked';
  const CHECKS = (o = {}) => kv([['Allowed range', o.range || WAIT], ['Expected impact', o.impact || WAIT], ['Evidence', o.evid || WAIT], ['Cost', o.cost || WAIT], ['How to roll it back', 'A new version, with its own record']]);
  const proposeBase = (ctx, o = {}) => head('sliders', 'Signal weight band', `${o.ver || 'Settings v9'} · at most 10% a month · code only`, tags(proposed('SCI-D10'))) + box(`${lbl('Your change')}<div class="aappr-form"><label class="aappr-field"><span class="small">Setting</span><select aria-label="Setting"${o.dead || !wide(ctx) ? ' disabled' : ''}>${SETTINGS.map((t, i) => `<option${i === 0 ? ' selected' : ''}>${t}</option>`).join('')}</select></label>${field(ctx, 'New value', 'Enter a value inside the allowed range', o.val || '', o.dead)}${field(ctx, 'Why', 'Say why, for the record', o.why || '', o.dead)}</div><p class="small muted aappr-gap">Only the signal weight band is worked here.</p>${tags(CT2)}<div class="aappr-acts aappr-gap">${o.run || act('A58', 'Run the check', 'primary', 'refresh')}</div>`) + box(`${lbl(o.t || 'What code checks before you can approve')}<div class="aappr-gap">${CHECKS(o.rows)}</div>`);
  const DRAFT = { val: '8%', why: 'Steadier signals' };
  /* Ready is your draft, checked: every row answered, and A31 live. Empty is before there is a draft */
  const CHECKED = { ...DRAFT, t: 'What code checked', rows: { range: 'Inside the 10% limit', impact: 'Signals move less', evid: '26 weeks of replay', cost: '£0' } };
  const ALLNOT = t => ({ range: t, impact: t, evid: t, cost: t });
  const yours = () => chain('You drafted', 'Code checked', 'You decide');
  const PROP_BIND = [['Owner', 'You'], ['Environment', 'Production'], ['Setting', 'Signal weight band'], ['Value', '8% a month'], ['Current version', 'v9'], ['Payload hash', 'c3a8…60f2'], ['Expires', 'Tue 10 Nov, 18:00']];
  /* the endings follow the version in force. Conflicting has no endings until the draft restarts on v10 */
  const propEnd = st => { const [cur, next] = st === 'empty' ? ['v10', 'v11'] : ['v9', 'v10']; return [['Approved', `Applied with your fresh sign-in. Settings ${next} keeps ${cur} as its previous version.`], ['You refused', `Nothing changed. Settings ${cur} stays current.`], ['Approved, not applied', `The write failed part way, so settings ${cur} stays current. Your approval holds, for a retry inside its window.`], ...(st === 'empty' ? [] : [['Also moves', 'Narrow a self-correction band is refused and rebuilt on v10, and Promote R2-HGB v4 binds the 10% limit, so it goes back to its check.']])]; };
  const proposeCore = ctx => region(ctx, {
    what: 'This draft', rows: 3, ok: () => yours() + proposeBase(ctx, CHECKED),
    loading: () => head('sliders', 'Signal weight band', 'Reading the setting', tags(ST.loading)) + skel(2),
    empty: () => stateCard('sliders', 'No draft yet', 'Pick a setting below. It shows its version, its allowed range and what code checks before you can approve.') + proposeBase(ctx, { ver: 'Settings v10' }),
    partial: () => banner('warn', 'Partly checked.', 'Range and cost answered. Impact and evidence did not, so this cannot go further yet.', 'clock') + proposeBase(ctx, { ...DRAFT, t: 'What code has checked so far', rows: { range: 'Inside the 10% limit', cost: '£0', impact: NOT, evid: NOT } }),
    error: () => stateCard('alert', 'The check failed', 'It stopped at 11:38. Your draft is kept below, nothing is proposed and settings v9 stays current.', btn('Try again', 'tinted', 'refresh')) + proposeBase(ctx, { ...DRAFT, rows: ALLNOT(NOT) }),
    stale: () => banner('warn', 'Index lagging.', 'Settings v9 is from 11:12. If the version has moved, your draft is rebuilt before you can approve it.', 'clock') + yours() + proposeBase(ctx, CHECKED),
    offline: () => banner('', 'Offline.', 'You can read this draft. It waits until you reconnect, and nothing is saved as a proposal.', 'wifi-off') + proposeBase(ctx, { ...CHECKED, dead: true, run: off(act('A58', 'Run the check', 'primary', 'refresh')) }),
    conflict: () => banner('warn', 'The setting moved.', 'Settings v10 was written at 09:01, so your draft against v9 stops here. Nothing was applied.', 'split') + proposeBase(ctx, { ...DRAFT, rows: ALLNOT(NOT), ver: 'Settings v10', dead: true, run: `${off(act('A58', 'Run the check', 'primary', 'refresh'))}${act('A58', 'Start again from v10', 'primary')}` }),
    expired: () => banner('warn', 'This check expired.', 'Its result passed its time, so it must run again. Nothing was applied.', 'clock') + tags(CT2) + proposeBase(ctx, { ...DRAFT, rows: ALLNOT('Expired') }),
    denied: () => banner('warn', 'A fresh sign-in is needed to approve.', OLD, 'lock') + yours() + proposeBase(ctx, CHECKED)
  });
  const proposeRail = ctx => {
    const s = ctx.state, tail = refused('R14', 'A memory note, chat message or agent proposal can draft a change but never apply one. No change can widen what a route may do.');
    if (s === 'loading') return skel(1);
    if (['default', 'stale', 'offline', 'denied'].includes(s)) return decision(ctx, { foot: 'Bound to settings v9 · expires Tue 18:00. It is rechecked when it applies.', yes: act('A31', 'Approve this change', 'primary'), nay: no(), tag: KIND }) + (s === 'denied' || !wide(ctx) ? '' : `<p class="small">${STEP}</p>`) + bindCard('This approval is bound to', PROP_BIND, KIND) + ends(propEnd(s)) + tail;
    return `${box(`${lbl('Your decision')}<p class="small muted aappr-gap">This stays shut until code has checked a value. Then it binds you, the environment, the setting, the value, the current version and an expiry, and it is rechecked when it applies.</p><div class="aappr-acts aappr-gap">${off(act('A31', 'Approve this change', 'primary'))}</div>${tags(KIND)}`)}${s === 'conflict' ? '' : ends(propEnd(s))}${tail}`;
  };

  /* ---------- what is current (A) and what is asked (B) ---------- */
  const FAM = (o = {}) => [
    ['sliders', 'Self-correction bands', o.band || 'Settings v9 · 5 points a week, 10% a month', o.bandC ?? chip('stale', '1 waits', 'clock')],
    ['plus', 'Listings and catalogue', o.cat || 'Catalogue v14 · 3 watch-only listings', o.catC ?? chip('stale', '1 waits', 'clock')],
    ['grid', 'Ranking policy', o.rank || 'Draft · growth 35, protection 40, opportunity 25', proposed('FIN-OD-07')],
    ['alert', 'Alerts and quiet hours', 'Quiet hours 22:00 to 07:00 London', proposed('CT-18')],
    ['shield', 'Risk-acceptance scopes', 'S1 to S10 · your accepted risk, never a licence', ''],
    ['layers', 'Market extensions', 'None active · US, UK and India only', ''],
    ['target', 'Budgets', 'Changed in Costs and budgets', '']
  ];
  const famRows = o => `${sec('Where each stands')}${list(FAM(o).map(([i, t, s, x]) => item(lead(i), t, s, ic('chev-r', 's18'), x, false, true)).join(''))}`;
  /* each of the 4 opens where it is decided: two have a family here, the import its own screen, the promotion Models and evaluations */
  const PAUSED = '1 paused scope waits on your restart. Rules v6, a switch forward, a factor, a route change and the release thresholds stay open with no date.';
  /* The count stays the 4 dated decisions. The paused scope has no expiry, so it sits beside them, not inside the count (R2-m10) */
  const restart = () => `${list(item(lead('pause', 'warn'), 'Restart US tech, 12 months', 'Previous model not eligible. Decided in Models and evaluations', ic('chev-r', 's18'), tags(chip('illus', 'Stays open · waits for your yes', 'clock'), KEPT_PAUSED), false, true))}${p('It has no expiry, so it sits outside the dated count.')}`;
  const waiting = (n, s, r = Q) => `${sec(`${n} decisions wait on you`)}${p(`${PAUSED} ${s}`)}${list(r.map(q => item(lead(q[0]), q[1], q[2], ic('chev-r', 's18'), tags(expiry(q[3]), q[4] || ''), false, true)).join(''))}${restart()}`;
  const nowCore = ctx => region(ctx, {
    what: 'Settings', rows: 6, ok: () => waiting(4, 'Next: Taiwan Semiconductor, 18:00') + famRows(),
    empty: () => banner('', 'Nothing waits on you.', 'Every proposal is decided. Silence is not a sign that nothing is wrong, so what is in force always shows.', 'check') + famRows({ band: 'Settings v10 · 4 points a week, 10% a month', bandC: '', cat: 'Catalogue v15 · 4 watch-only listings', catC: '' }),
    partial: () => banner('warn', 'Partial.', '3 of 4 sources answered. The ranking policy did not, so its state is unknown, not unchanged.', 'clock') + waiting(4, 'Next: Taiwan Semiconductor, 18:00') + famRows({ rank: 'Unknown · did not answer' }),
    error: () => stateCard('alert', 'Settings did not load', 'They failed at 11:38. What is in force keeps running, and nothing can be approved until this loads. These rows are from 11:20.', btn('Try again', 'tinted', 'refresh')) + famRows(),
    stale: () => banner('warn', 'Index lagging.', 'From 11:12. Each proposal rechecks itself before you can approve it, and expiry times may have passed.', 'clock') + waiting(4, 'Next: Taiwan Semiconductor, 18:00') + famRows(),
    offline: () => banner('', 'Offline.', 'Showing settings from 11:20. You can read what is in force and what waits.', 'wifi-off') + refused('R16', OFFLINE) + waiting(4, 'Reading only until you reconnect') + famRows(),
    conflict: () => banner('warn', 'A version moved while you read.', 'Settings v10 was written at 09:01, so the proposal against v9 is refused and rebuilt.', 'split') + waiting(3, 'Next: Taiwan Semiconductor, 18:00', Q.filter(q => q[0] !== 'sliders')) + famRows({ band: 'Settings v10 · written at 09:01', bandC: chip('error', 'Refused, being rebuilt', 'x') }),
    expired: () => banner('warn', 'Taiwan Semiconductor expired at 18:00.', 'An expired proposal cannot be approved, and nothing was added. Catalogue v14 stays current.', 'clock') + waiting(3, 'Next: Promote R2-HGB v4, Fri 18:00', Q.slice(1)) + famRows({ catC: chip('stale', 'Expired', 'clock') }),
    denied: () => banner('warn', 'Reading needs no fresh sign-in.', 'Each change says what it needs before you press it, and nothing is pre-approved.', 'lock') + waiting(4, 'Next: Taiwan Semiconductor, 18:00') + famRows()
  });
  const authority = () => box(`${lbl('Who can do what')}<div class="aappr-gap">${chain()}</div><div class="aappr-gap">${kv([['Environment', 'Production'], ['Approvals bind', 'One exact change'], ['Rechecked', 'When it applies']])}</div>`) + refused('R14', 'No settings change can grant a route a new tool, source, budget, infrastructure permission or approval authority.') + refused('R8', 'MP has one owner, you. Nobody can approve on your behalf, and there are no accounts to grant this to.');
  const Q = [
    ['plus', 'Watch Taiwan Semiconductor', 'TSM · XNYS · Claude proposed in chat', 'Expires today 18:00', Q9],
    ['cube', 'Promote R2-HGB v4', 'All segments, except US tech, 12 months and India midcap, 3 months. Passed its shadow trial, 8 of 8 weeks. Decided in Models and evaluations', 'Expires Fri 18:00', KIND],
    ['sliders', 'Narrow a self-correction band', 'Probabilities: 5 to 4 points a week', 'Expires Mon 18:00', KIND],
    ['layers', 'Confirm a statement import', '11 rows · ledger revision 213', '15 min once approved']
  ];
  const qRows = (ctx, r = Q) => list(r.map((q, i) => item(lead(q[0], wide(ctx) && i === 0 ? 'sel' : ''), q[1], q[2], ic('chev-r', 's18'), tags(expiry(q[3]), q[4] || ''), wide(ctx) && i === 0, true)).join(''));
  const count = (n, s) => `<div class="card fcard aappr-count" data-mo="card"><span class="amt" style="font-size:44px">${n}</span><div class="aappr-min"><b>${n === 1 ? 'decision waits' : 'decisions wait'} on you</b>${p(`${PAUSED} ${s}`)}</div></div>`;
  const shut = () => `${sec('Cannot be approved')}${list(item(lead('clock', 'warn'), 'Watch Barclays', 'BARC · XLON · expired 08:14', ST.expired, tags(Q9, act('A57', 'Run again'))) + item(lead('ban', 'fall'), 'Let the chat route add listings', 'Would widen authority, so code refused it', ST.blocked))}`;
  const filt = (on = 0) => `<div data-mo="rise">${seg(['Open', 'Applied', 'Refused', 'Expired'], on, 'Show requests', 'full')}</div>`;
  const queueCore = ctx => region(ctx, {
    what: 'Change requests', rows: 4, ok: () => filt() + count(4, 'Soonest first. Nothing happens until you decide.') + qRows(ctx) + restart() + shut(),
    empty: () => filt() + stateCard('check', 'Nothing waits on you', 'Claude and code have no open requests. This says nothing about risk: risk alerts arrive on their own.', bs('See the outcomes')),
    partial: () => banner('warn', '1 request is not yet checked.', 'Code could not finish the check on Barclays, so it cannot be confirmed yet. A missing check is never a pass.', 'clock') + filt() + count(5, 'Soonest first. One cannot be confirmed yet.') + list(item(lead('ban'), 'Watch Barclays', 'BARC · XLON · not yet checked', chip('', 'Not yet checked'), act('A57', 'Run again'))) + qRows(ctx) + restart(),
    error: () => stateCard('alert', 'This list did not load', 'It failed at 11:38. Nothing can be approved until it does. Open requests keep their expiry on the server, and nothing is lost.', btn('Try again', 'tinted', 'refresh')) + filt() + qRows(ctx),
    stale: () => banner('warn', 'Index lagging.', 'From 11:12. Expiry times may have passed, and each request rechecks itself before you can approve it.', 'clock') + filt() + count(4, 'Soonest first. From 11:12.') + qRows(ctx) + restart(),
    offline: () => banner('', 'Offline.', 'Showing requests from 11:20. You can read what waits.', 'wifi-off') + refused('R16', OFFLINE) + filt() + count(4, 'Reading only until you reconnect.') + qRows(ctx) + restart(),
    conflict: () => banner('warn', 'Two requests overlap.', 'The promotion binds the 5-point band and the settings change moves it to 4, so approving one sends the other back to its check.', 'split') + filt() + count(4, 'Soonest first. 2 overlap.') + qRows(ctx) + restart(),
    expired: () => banner('warn', 'Taiwan Semiconductor expired at 18:00.', 'An expired request cannot be approved. It moved to Expired, and nothing was added.', 'clock') + filt() + count(3, 'Soonest first. Nothing happens until you decide.') + qRows(ctx, Q.slice(1)) + restart(),
    denied: () => banner('warn', 'Reading needs no fresh sign-in.', 'Each request says what it needs before you press it. Nothing is pre-approved.', 'lock') + filt() + count(4, 'Soonest first. Nothing happens until you decide.') + qRows(ctx) + restart()
  });
  const peek = ctx => (['loading', 'empty', 'error'].includes(ctx.state) ? authority() : `${box(`${lbl('Next to expire')}<p class="aappr-t aappr-gap">Watch Taiwan Semiconductor</p><div class="aappr-gap">${change(TSM_ROWS.slice(0, 3))}</div>${tags(Q9)}<div class="aappr-gap">${bs('Open this request', 'primary')}</div>`)}${authority()}`);

  /* ---------- outcomes: every request's end, by whoever ended it. Ready has decided nothing today, so these are the earlier ones ---------- */
  const REC = [
    ['clock', 'Watch Barclays', 'Nobody · expired Wed 08:14', ST.expired, Q9],
    ['ban', 'Let the chat route add listings', 'Code · Tue 17:20 · would widen authority', ST.blocked],
    ['refresh', 'R1-LGB v2 reverted to v1', 'Code · Mon 22:20 · 2 bad weeks on probation', ST.auto],
    ['ban', 'Statement import approval revoked', 'You · Fri 30 Oct · before the commit started', ST.revoked],
    ['clock', 'Watch Taiwan Semiconductor', 'Nobody · Thu 22 Oct · an earlier proposal', ST.expired, Q9]
  ];
  const recRows = (ctx, r = REC) => list(r.map(x => item(lead(x[0]), x[1], x[2], x[3], x[4] || '', false, true)).join(''));
  const undo = ctx => {
    if (ctx.state === 'empty') return '';
    const shutIt = ['offline', 'denied', 'error', 'partial', 'loading'].includes(ctx.state), rb = act('A32', 'Roll back to v8');
    const c = ctx.state === 'conflict', r = c ? act('A32', 'Roll back to v9') : rb;
    return box(`${lbl('In force now')}<p class="aappr-t aappr-gap">Settings ${c ? 'v10' : 'v9'}</p><div class="aappr-gap">${kv([['Decided by', 'You'], ['Environment', 'Production'], ['Previous', c ? 'v9, kept' : 'v8, kept'], ['Weekly band', c ? '4 points' : '5 points']])}</div><div class="aappr-acts aappr-gap">${shutIt ? off(r) : r}</div><p class="small muted aappr-gap">A rollback makes a new version equal to the old one, with its own audit record. Nothing is overwritten.</p>`);
  };
  const ofilt = (on = 0) => `<div data-mo="rise">${seg(['All', 'Applied', 'Refused', 'Expired'], on, 'Show outcomes', 'full')}</div>`;
  const outcomesCore = ctx => region(ctx, {
    what: 'Outcomes', rows: 5, ok: () => ofilt() + recRows(ctx) + p('Reverts by code are marked Automatic, and never read as your decision.'),
    empty: () => ofilt() + stateCard('target', 'No outcomes yet', 'Every approval, refusal, expiry and automatic revert lands here, with who made it and the evidence it was bound to.'),
    partial: () => banner('warn', 'Partial.', '3 of 4 sources answered, so model reverts are missing here, not absent. Models and evaluations holds them.', 'clock') + ofilt() + recRows(ctx, REC.filter(r => r[3] !== ST.auto)),
    error: () => stateCard('alert', 'Outcomes did not load', 'They failed at 11:38. Nothing in them can change or be lost: records are only ever added to.', btn('Try again', 'tinted', 'refresh')) + ofilt() + recRows(ctx, REC.slice(0, 3)),
    stale: () => banner('warn', 'Index lagging.', 'Showing outcomes from 11:12. Newer ones are safe on the server and appear once it refreshes.', 'clock') + ofilt() + recRows(ctx),
    offline: () => banner('', 'Offline.', 'Showing outcomes from 11:20. A rollback waits until you reconnect.', 'wifi-off') + ofilt() + recRows(ctx),
    conflict: () => banner('warn', 'Already decided on your iPad.', 'You approved this at 09:16, and your tap here made no second approval. One record, one change.', 'split') + ofilt() + recRows(ctx),
    expired: () => ofilt(3) + banner('', 'Expired, shown alone.', 'Each ended with nothing run. A repeat backs off with a visible reason.', 'clock') + recRows(ctx, REC.filter(r => r[3] === ST.expired)),
    denied: () => banner('warn', 'Reading needs no fresh sign-in.', 'Rolling back is a change, so how strong a sign-in it needs is open.', 'lock') + ofilt() + recRows(ctx)
  });

    const COVER_COST = 'n/a: Cost is reconciled in Costs and budgets. A proposal only states its own cost here, in credits and cash.';
  J.add({
    id: 'approvals', title: 'Approvals and configuration',
    stories: ['MP-78', 'MP-114', 'MP-131', 'MP-74', 'MP-63', 'MP-135', 'MP-138', 'MP-55', 'MP-171'],
    summary: 'What is in force, what waits, and how a change is undone. Claude drafts, code checks, you decide, and no change can widen what the system may do.',
    options: [{
      id: 'a', name: 'Settings by version', rec: true,
      why: 'The owner journey already has a queue, so admin answers what it cannot: what is in force, what it was before, and how to go back. Bands and the catalogue read by version, and policies say what they wait on.',
      cost: 'A decision opens where it belongs, so deciding several means several screens.',
      covers: { compare: 'aa-band', decide: 'aa-band', source: 'aa-import', correct: 'aa-band', config: 'aa-propose', cost: COVER_COST, recover: 'aa-band' },
      screens: [{
        id: 'aa-now', title: 'In force now', note: 'Where the Approvals journey\'s "the full audit sits in the admin area" lands for settings. The full audit itself is in Audit.',
        render: ctx => frame(ctx, { title: 'Approvals', back: 'Admin', body: nowCore(ctx), rail: `${proposeBtn(ctx)}${authority()}` })
      }, {
        id: 'aa-band', title: 'One family, by version', note: 'A family opens to its versions, then to what would change. Rollback sits with the versions.',
        render: ctx => frame(ctx, { title: 'Self-correction', back: 'In force', body: bandCore(ctx, () => versions(ctx)), rail: bandRail(ctx) })
      }, {
        id: 'aa-propose', title: 'Propose a change', note: 'You can draft a change yourself. It takes the same path as Claude\'s: code checks it, then you decide.',
        render: ctx => frame(ctx, { title: 'Propose', back: 'In force', body: proposeCore(ctx), rail: proposeRail(ctx) })
      }, {
        id: 'aa-listing', title: 'Listings and catalogue', note: 'Catalogue v14 stays current until v15 is written. There is never a half-added listing.',
        render: ctx => frame(ctx, { title: 'Catalogue', back: 'In force', body: listingCore(ctx), rail: listingRail(ctx) })
      }, {
        id: 'aa-policies', title: 'Ranking, alerts, scopes, markets', note: 'Each shut control says what it waits on. No record sets these values, so the screen gives none.',
        render: ctx => frame(ctx, { title: 'Policies', back: 'In force', body: policiesCore(ctx), rail: policiesRail(ctx) })
      }, {
        id: 'aa-import', title: 'An import to approve', note: 'The same import as Holdings. Its 21:18 and 21:33 are Tue 3 Nov, as Files and Audit record them.',
        render: ctx => frame(ctx, { title: 'Import', back: 'In force', body: importCore(ctx), rail: importRail(ctx) })
      }]
    }, {
      id: 'b', name: 'Change requests',
      why: 'One queue of everything asked for, with where each request is and how it ended. It reads like the owner journey\'s queue, so there is one habit to learn.',
      cost: 'It repeats the owner queue. What is in force today, and what a setting was before, is two steps away, through a request.',
      covers: { compare: 'ab-request', decide: 'ab-request', source: 'ab-import', correct: 'ab-outcomes', config: 'ab-new', cost: COVER_COST, recover: 'ab-outcomes' },
      screens: [{
        id: 'ab-queue', title: 'Change requests', note: 'The same 4 decisions as the owner queue. A promotion opens in Models and evaluations, which holds its evidence.',
        render: ctx => frame(ctx, { title: 'Requests', back: 'Admin', body: queueCore(ctx), rail: peek(ctx) })
      }, {
        id: 'ab-request', title: 'One request', note: 'Its place in the proposed lifecycle, then what would change, then the decision.',
        render: ctx => frame(ctx, { title: 'Request', back: 'Requests', body: bandCore(ctx, () => life(ctx)), rail: bandRail(ctx) })
      }, {
        id: 'ab-listing', title: 'A listing request', note: 'Claude can propose and cannot add. A confirmation covers this listing and this catalogue version only.',
        render: ctx => frame(ctx, { title: 'Listing', back: 'Requests', body: listingCore(ctx), rail: listingRail(ctx) })
      }, {
        id: 'ab-import', title: 'An import request', note: 'The same import as Holdings. Its 21:18 and 21:33 are Tue 3 Nov, as Files and Audit record them.',
        render: ctx => frame(ctx, { title: 'Import', back: 'Requests', body: importCore(ctx), rail: importRail(ctx) })
      }, {
        id: 'ab-new', title: 'Raise a request', note: 'A request you write goes the same way as one Claude drafts. The other kinds wait on their open questions. Withdrawing S10 shows what it stops and what was already sent, as in option A ("Record it, keep the outputs", ADM-07).',
        render: ctx => frame(ctx, { title: 'New request', back: 'Requests', body: proposeCore(ctx) + (ctx.state === 'loading' ? '' : sec('Other kinds of request') + policies(ctx) + scopeEffect()), rail: proposeRail(ctx) })
      }, {
        id: 'ab-outcomes', title: 'Outcomes', note: 'Ready has decided nothing today, so these are the earlier ones. Today\'s appear here once you decide.',
        render: ctx => frame(ctx, { title: 'Outcomes', back: 'Requests', body: outcomesCore(ctx), rail: `${undo(ctx)}${refused('R7', 'An outcome cannot be edited or deleted. A correction is a new version, with its own record.')}` })
      }]
    }]
  });
}
