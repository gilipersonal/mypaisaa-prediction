/* Files and imports (MP-64, PH00-S06): what came in, what it became and how long it is kept. The worked file is the owner journeys' ISA statement. Every figure is illustrative. */
{
  const NO_TRADE = 'This records what already happened at your broker. It places no trade.';
  const FRESH = 'Opening the app with Face ID, or an open session, is not enough. The server checks a fresh sign-in.';
  const DRAFT = 'ISA statement, Oct 2026', SCAN = 'isa-oct-2026-scan.pdf · Scan · 4 pages';
  const good = t => `<span class="chip fresh"><span class="dot"></span>${t}</span>`;
  const mine = t => `<span class="chip owner"><span class="dot"></span>${t}</span>`;
  const hold = (t, i = 'clock') => `<span class="chip stale">${ic(i, 's14')}${t}</span>`;
  const fail = (t, i = 'alert') => `<span class="chip error">${ic(i, 's14')}${t}</span>`;
  const note = t => `<span class="chip illus">${t}</span>`;
  const part = t => `<span class="chip partial"><span class="dot"></span>${t}</span>`;
  const chipset = (...c) => `<div class="afiles-chips">${c.filter(Boolean).join('')}</div>`;
  const acts = (...b) => `<div class="afiles-acts">${b.filter(Boolean).join('')}</div>`;
  const text = t => `<p class="small muted afiles-p">${t}</p>`;
  const rowGo = (i, t, s, x = '', tone = '') => item(lead(i, tone), t, s, ic('chev-r', 's18'), x, false, true);
  const rowAt = (i, t, s, x = '', tone = '') => item(lead(i, tone), t, s, '', x);
  const off = (ctx, t) => banner('', 'Offline.', `${t} No financial write offline.`, 'wifi-off') + (browser(ctx) ? `<div class="afiles-chips">${proposed('MP40-Q12')}<span class="small muted">What a browser keeps offline is open.</span></div>` : '');
  const sign = t => banner('warn', t, FRESH, 'lock');
  const trying = () => bs('Try again', 'tinted', 'refresh');
  const safe = t => box(`${lbl('Why this is safe')}${text(t)}`);
  const fr = (ctx, spec) => frame(ctx, { ...spec, body: `<p class="small muted afiles-line" data-mo="rise">${NO_TRADE}</p>${spec.body}` });
  const chainFor = ctx => ({ loading: 'Reading now, with no tools', partial: 'Read by Claude, no tools · 1 date not read', error: 'Reply refused, no rows made', denied: 'Not read yet: paused for credit' }[ctx.state]);

  /* ---------- the queue ---------- */
  const qNeed = (o = {}) => sec('Needs you') + list(rowGo('layers', DRAFT, o.s || 'Draft revision 6 · 9 of 11 rows · ledger revision 213', chipset(o.c || mine('Ready for you'), note('Draft, not in your holdings'))) + rowGo('clock', 'Indian funds statement, Dec 2024', 'Due in Dec 2026 · nothing deletes by itself', chipset(hold('Due for owner renewal')), 'warn'));
  const qWork = (o = {}) => sec('Open work') + list(rowGo('split', 'General account, Q3', 'R-0212 · cash differs by £8.15 · stays open across sessions', chipset(hold('Difference open', 'split'))) + rowGo('layers', 'Nippon India Nifty 50 BeES', o.r || 'From 3 older statements', chipset(o.rc || mine('Rebuild proposal ready'))));
  const orphan = (go = true) => rowAt('lock', 'Unmatched object', 'No receipt · quarantined · nothing reads it', `${text('It has no effect on your ledger while it sits here. Who records what happens to it is still open.')}${go ? `<div class="afiles-gap">${act('A15', 'Record what happens to it')}</div>` : ''}`);
  const qHeld = (go = true) => sec('Held apart') + list(orphan(go) + heldFile(go));
  const qKept = (s = '8 originals kept · export ready, link valid 22 min') => sec('Kept') + list(rowGo('shield', 'Originals and exports', s));
  const qBar = () => `<div data-mo="rise">${seg(['All', 'Needs you', 'Held', 'Kept'], 0, 'Show files', 'full')}</div>`;
  const qAll = (o = {}) => qNeed(o) + qWork(o) + qHeld(o.act !== false) + refusedFiles() + qKept(o.kept);
  const heldFile = (go = true) => rowAt('clock', 'isa-2019-to-2026.pdf', 'Oversized file. Held apart and not read until you decide.', `${chipset(proposed('MP40-Q1'))}${go ? `${acts(act('A81', 'Split and resend'), act('A82', 'Discard'))}${text('Discarding removes the stored file and records a tombstone.')}` : ''}`);
  const refusedFiles = (held = true) => (held ? sec('3 files not taken in', '<span class="small muted">1 more is held apart</span>') : sec('2 files refused at the door', '<span class="small muted">Quarantine not read</span>')) + list(rowAt('ban', 'isa-scan-copy.pdf', 'Unreadable file. Its contents do not match a PDF, so it was refused at the door and nothing read it.') + rowAt('lock', 'demat-oct-locked.pdf', 'Password-protected PDF, so nothing read it. You unlock it on your own device, and only the unlocked copy is sent. The password never leaves that device, and it is never stored, logged or sent to a model.'));
  const qBody = ctx => region(ctx, {
    what: 'The queue', rows: 6, ok: () => qBar() + qAll(),
    loading: () => banner('', 'Reading receipts and drafts.', 'The last good list is from 11:20. Nothing changes while this loads.', 'clock') + skel(5),
    empty: () => stateCard('layers', 'No files yet', 'Bring in a statement to start your ledger. Every row waits for your review, and nothing changes until you approve it.', act('A04', 'Upload a file', 'primary', 'plus')),
    partial: () => banner('warn', '3 of 4 sources answered.', 'The quarantine list did not answer, so what is held apart is unknown. It is not shown as nothing held.', 'clock') + qBar() + qNeed() + qWork() + sec('Held apart') + list(rowAt('info', 'Quarantine not read', 'Unknown, not zero')) + refusedFiles(false) + qKept(),
    error: () => stateCard('alert', 'The queue did not refresh', 'It failed at 11:38, so this is the list from 11:20. Nothing is deleted or changed.', trying()) + refusedFiles() + qHeld(false) + qNeed() + qWork() + qKept('8 originals kept · export failed 11:38'),
    stale: () => banner('warn', 'From 11:12.', 'The index behind this list is lagging, so a file may have moved on. Open a file to read its own record.', 'clock') + qAll({ c: hold('Last known 11:12'), r: 'Last known 11:12 · from 3 older statements', rc: hold('May be out of date'), kept: '8 originals kept · export ready as of 11:12' }),
    offline: () => off(ctx, 'Showing the queue from 11:20. Uploads need a connection.') + qAll({ act: false, kept: '8 originals kept · export ready as of 11:20' }),
    conflict: () => banner('warn', 'Your ledger moved to revision 214.', 'This draft was built against 213, so any approval for it can never commit. Refresh the preview to approve it again.', 'split') + qAll({ s: 'Draft revision 6 · 9 of 11 rows · against revision 213, not 214', c: fail('Needs a refreshed preview', 'split'), r: 'Against revision 213 · refresh it and approve it again', rc: hold('Rebuild proposal out of date') }),
    expired: () => banner('warn', 'An approval ran out.', 'It expired at 21:33 with no commit started, so nothing was committed. The rows have not changed, so a fresh approval is enough.', 'clock') + qAll({ s: 'Draft revision 6 · 9 of 11 rows · ledger revision 213', c: hold('Approval expired Tue 21:33'), kept: '8 originals kept · export link expired' }),
    denied: () => banner('warn', 'Reading needs no fresh sign-in. Changing something does.', FRESH, 'lock') + qAll()
  });
  const qRail = ctx => `${ctx.state === 'empty' ? '' : box(`${lbl('Add a file')}${text('CSV, Excel, PDF or a screenshot. It is held apart and checked before anything reads it.')}${ctx.state === 'offline' ? text('Uploads need a connection. A stopped upload keeps no part of the file.') : `<div class="afiles-gap">${act('A04', 'Upload a file', 'primary', 'plus')}</div>`}${chipset(proposed('MP40-Q1'))}`)}${ctx.state === 'empty' ? '' : box(`${lbl('Right now')}<div class="afiles-gap">${kv([['Environment', 'Prod'], ['Originals kept', ctx.state === 'loading' ? 'Reading' : '8'], ['Drafts waiting', ctx.state === 'loading' ? 'Reading' : '1'], ['Due for renewal', ctx.state === 'loading' ? 'Reading' : '1'], ['Held apart', ctx.state === 'partial' ? 'Unknown' : ctx.state === 'loading' ? 'Reading' : '2']])}</div>`)}`;

  /* ---------- the draft ---------- */
  const head = (o = {}) => box(`<div class="afiles-stack"><div><div class="afiles-name">${o.t || DRAFT}</div><div class="small muted">${o.s || `${SCAN} · 11 rows in 5 groups`}</div></div>${chipset(o.c === undefined ? mine('Ready for you') : o.c, note(o.d || 'Draft revision 6'), note('Illustrative'))}</div>`);
  const chain = (c = 'Read by Claude, no tools · 1 field flagged') => box(`${lbl('Who did what')}<div class="afiles-gap afiles-kv">${kv([['Code checked', 'Size, type and pages, before anything read it'], ['Claude drafted', c], ['You decide', 'Nothing changes until you approve']])}</div>`);
  const costBox = (t = 'Reservation settled') => box(`${lbl('What this read cost')}${text('The amount sits in Costs and budgets, on the cost month’s own calendar, so it is not repeated here.')}${chipset(note(t))}<div class="afiles-gap">${bs('Open in Costs and budgets', 'tinted', 'target')}</div>`);
  const G = {
    a: ['Bought 4 Apple', '6 Oct · 3 rows · Fee £3.99 · Cash <span class="afiles-nw">−£676.79</span>', 'Selected'],
    b: ['Bought 30 HSBC', '13 Oct · 3 rows · HSBA · XLON · Fee £3.99 · Cash <span class="afiles-nw">−£264.99</span>', 'HSBA chosen'],
    c: ['Sold 10 AstraZeneca', '22 Oct · 3 rows · Fee £3.99 · Cash <span class="afiles-nw">+£1,072.01</span>', 'Confirmed']
  };
  const gRow = (k, c) => rowAt('check', G[k][0], G[k][1], chipset(c || good(G[k][2])));
  const gDup = (go = true) => rowAt('split', 'AstraZeneca dividend', '20 Oct · 1 row · Cash +£41.16', `${chipset(hold('Possible duplicate', 'split'))}${text('Same date, amount and account as the entry you typed on 21 Oct, receipt R-0211. Left out, still listed.')}${go ? `<div class="afiles-gap">${act('A05', 'Decide this duplicate')}</div>` : ''}`);
  const gPend = (go = true) => rowAt('clock', 'Transfer in', '28 Oct · 1 row · Cash +£500.00', `${chipset(part('Stays pending'))}${text('Money from outside, or a transfer from your General account? It is not income until you say. It stays pending and visible, and your answer makes a new draft revision.')}${go ? acts(act('A77', 'From outside'), act('A77', 'From General')) : ''}`);
  const groups = (o = {}) => `${sec('5 groups', `<span class="small muted">${o.noC ? '2 selected · 6 of 11 rows' : '3 selected · 9 of 11 rows'}</span>`)}${list(gRow('a') + gRow('b') + (o.noC ? rowAt('ban', 'Sold 10 AstraZeneca', 'Date not read · 3 rows · Cash <span class="afiles-nw">+£1,072.01</span>', `${chipset(note('Left out'))}${text('Its date could not be read, so it is blank, not guessed. Type it from your statement.')}${o.go === false ? '' : `<div class="afiles-gap">${act('A56', 'Add the date')}</div>`}`) : gRow('c')) + gDup(o.go !== false) + gPend(o.go !== false))}`;
  const draftActs = () => box(`${lbl('What you can do')}${acts(act('A08', 'Approve these 3 groups', 'primary'), act('A56', 'Edit, exclude or remap rows'), act('A02', 'Open the original'), act('A14', 'Reprocess into a new revision'), act('A06', 'Cancel this draft'))}${text('Editing, excluding, remapping, deciding a duplicate or a transfer, or reprocessing makes a new revision and voids any pending approval. Reprocessing never replaces the file, and it cannot bypass economic dedup.')}${text(ALL_LATER)}`);
  const ALL_LATER = 'Approving all 5 groups comes once the 2 left out are settled.';
  const openDiff = () => banner('warn', 'A £12.40 cash difference stays open.', 'Approving does not clear it. It stays visible on the receipt until you fix it or resolve it with a reason.', 'split');
  const steps = at => `<ol class="afiles-steps" aria-label="Extraction progress">${['Received', 'Checked', 'Reading', 'Ready'].map((t, i) => `<li class="${i < at ? 'done' : i === at ? 'now' : ''}"${i === at ? ' aria-current="step"' : ''}><span>${i < at ? ic('check', 's14') : ''}${t}</span></li>`).join('')}</ol>`;
  const draftBody = ctx => region(ctx, {
    what: 'This draft', rows: 4, ok: () => head() + openDiff() + chain() + groups() + draftActs() + costBox(),
    loading: () => head({ s: SCAN, c: hold('Extracting'), d: 'No draft yet' }) + box(`${lbl('Extracting')}${steps(2)}${text('Claude is reading page 3 of 4. It was checked and held apart before anything read it. Claude has no tools here and can change nothing.')}`) + costBox('Reservation held'),
    empty: () => stateCard('x', 'Draft cancelled', 'Nothing was committed, and your ledger stays at revision 213. The original stays, so you can start again.', bs('Back to the queue')) + head({ c: note('Cancelled'), d: 'Draft revision 6' }),
    partial: () => banner('warn', 'Extracted, with low-confidence fields flagged.', '6 of 11 rows are ready. Claude could not read one date, so that group waits and the date stays blank until you add it.', 'clock') + head({ c: part('needs_resolution'), d: 'Draft revision 5' }) + chain('Read by Claude, no tools · 1 date not read') + groups({ noC: true }) + box(`${lbl('Commit 2 groups, 6 of 11 rows, to Stocks ISA')}<div class="afiles-gap">${kv([['Apple', '60 → 64 units'], ['HSBC, HSBA · XLON', '700 → 730 units'], ['ISA cash', '£4,012.60 → £3,070.82']])}</div>${text('Left out and still listed: Sold 10 AstraZeneca, date not read. AstraZeneca dividend, duplicate. Transfer in £500.00, pending.')}<div class="afiles-gap">${kv([['Draft revision', '5'], ['Selected rows hash', 'b41d…9e07'], ['Expected revision', '213']])}</div>`) + box(`${lbl('What you can do')}${acts(act('A08', 'Approve these 2 groups', 'primary'), act('A02', 'Open the original'), act('A14', 'Reprocess into a new revision'), act('A06', 'Cancel this draft'))}${text('Sold 10 AstraZeneca waits for its date.')}`),
    error: () => stateCard('alert', 'Schema validation failed', 'Claude’s reply failed validation, so it was refused and no rows were made. Your original is safe and nothing reached your ledger. A retry stays inside the same budget, and stops with a reason if it fails again.', `<div>${act('A14', 'Reprocess into a new revision', 'primary')}</div>`) + head({ s: SCAN, c: fail('validation_failed'), d: 'No rows' }) + text('Reprocessing needs a new source-processing revision. The file itself is never replaced.'),
    stale: () => banner('warn', 'Superseded by a newer model or prompt version.', 'Revision 6 stands and stays for comparison. Reprocessing makes a new revision, and any changed fact becomes a correction proposal.', 'clock') + head({ c: hold('Superseded') }) + chain() + groups({ go: false }) + box(acts(act('A14', 'Reprocess into a new revision', 'primary'), act('A02', 'Open the original'))),
    offline: () => off(ctx, 'Showing this draft from 11:20.') + head() + chain() + groups({ go: false }) + refused('R16', 'Approving, deciding a duplicate and cancelling all wait for a connection. Your selection is safe on revision 6.'),
    conflict: () => banner('warn', 'Statement and rows differ by £12.40.', 'Closing cash on the statement is £4,630.43. These rows, with the £500.00 transfer, reach £4,642.83. Nothing is plugged or overwritten.', 'split') + head({ c: hold('Difference open', 'split') }) + box(`${text('Fix a row, add the missing one, or keep the difference open, in plain sight, with your reason.')}${acts(bs('Find the row', 'tinted', 'search'), act('A56', 'Edit, exclude or remap rows'), act('A55', 'Keep it open, with a reason'))}`) + chain() + groups() + box(acts(act('A08', 'Approve these 3 groups', 'primary'), act('A14', 'Reprocess into a new revision'))),
    expired: () => banner('warn', 'This approval expired.', 'It expired at 21:33 with no commit started, so nothing was committed. The rows have not changed, so a fresh approval is enough.', 'clock') + head({ c: hold('Approval expired Tue 21:33') }) + openDiff() + chain() + groups() + box(acts(act('A08', 'Approve these 3 groups', 'primary'), act('A06', 'Cancel this draft'))),
    denied: () => sign('You can read all of this draft.') + head() + openDiff() + chain() + groups() + draftActs()
  });

  /* ---------- comparing revisions ---------- */
  const CMP = [['Selected rows', '6 of 11', '9 of 11'], ['Groups', '2 of 5', '3 of 5'], ['Selected rows hash', 'b41d…9e07', '7f3a…c21e'], ['Sold 10 AstraZeneca', 'Date not read, left out', '22 Oct, added by you'], ['AstraZeneca', 'Stays 85 units', '85 → 75 units'], ['ISA cash after', '£3,070.82', '£4,142.83']];
  const cmp = (ctx, rows = CMP, a = 'Revision 5', b = 'Revision 6') => (wide(ctx)
    ? `<div class="card afiles-cmp" data-mo="card"><div class="h"></div><div class="h">${a}</div><div class="h">${b}</div>${rows.map(([k, x, y]) => `<div class="k">${k}</div><div>${x}</div><div>${y}</div>`).join('')}</div>`
    : list(rows.map(([k, x, y]) => `<div class="afiles-cmpm" data-mo="rise"><b>${k}</b><span><i>${a}</i>${x}</span><span><i>${b}</i>${y}</span></div>`).join('')));
  const earlier = () => box(`${lbl('Every revision stays')}<div class="afiles-gap">${kv([['Revision 6', '7f3a…c21e'], ['Revision 5', 'b41d…9e07'], ['Revision 4', '3c9e…01ab']])}</div>${text('An edit, a reprocess, a remap, an exclusion or an answer on a duplicate or a transfer makes a new revision and voids any pending approval. The old revision stays for comparison.')}`);
  const cmpBody = ctx => region(ctx, {
    what: 'This comparison', rows: 5, ok: () => cmp(ctx),
    loading: () => banner('', 'Reading revisions 5 and 6.', 'Both stay as they are while this loads.', 'clock') + skel(5),
    empty: () => stateCard('layers', 'Only one revision', 'Revision 1 has nothing to compare with yet. An edit, a reprocess, a remap, an exclusion or an answer on a duplicate or a transfer makes the next one.', bs('Back to the draft')),
    partial: () => banner('warn', '3 of 4 sources answered.', 'The figures for revision 5 did not answer. What is missing says so, and is never counted as zero.', 'clock') + cmp(ctx, CMP.map(([k, x, y], i) => [k, i === 2 ? x : 'Not read', y])),
    error: () => stateCard('alert', 'Revision 6 did not load', 'It failed at 11:38. Nothing is compared against a guess, so only revision 5 shows.', trying()) + cmp(ctx, CMP.map(([k, x]) => [k, x, 'Did not load'])),
    stale: () => banner('warn', 'Superseded by a newer model or prompt version.', 'A reprocess would make revision 7. It cannot bypass economic dedup, and a changed fact becomes a correction proposal.', 'clock') + cmp(ctx) + box(act('A14', 'Reprocess into a new revision', 'primary')),
    offline: () => off(ctx, 'Showing these revisions from 11:20.') + cmp(ctx),
    conflict: () => banner('warn', 'Correction proposed for a changed fact.', 'Reprocessing read 8 units where revision 6 has 10. Neither is overwritten. Your reading decides, through a correction you approve.', 'split') + cmp(ctx, [['Units sold, AstraZeneca', '10', '8'], ['Trade value', '£1,076.00', '£860.80'], ['Cash, after the £3.99 fee', '+£1,072.01', '+£856.81']], 'Revision 6', 'Reprocessed'),
    expired: () => banner('warn', 'The approval on revision 5 no longer stands.', 'Making revision 6 voided it, so it can never commit. Revision 6 needs its own approval.', 'clock') + cmp(ctx),
    denied: () => sign('These figures stay open to read.') + cmp(ctx) + box(`${lbl('The extracted text')}<div class="afiles-gap">${act('A02', 'Open the extracted text')}</div>`)
  });

  /* ---------- approving: bound to one exact selection ---------- */
  const change = () => box(`${lbl('Commit 3 groups, 9 of 11 rows, to Stocks ISA')}<div class="afiles-gap">${kv([['Apple', '60 → 64 units'], ['HSBC, HSBA · XLON', '700 → 730 units'], ['AstraZeneca', '85 → 75 units'], ['ISA cash', '£4,012.60 → £4,142.83']])}</div>${text('Left out and still listed: AstraZeneca dividend, duplicate. Transfer in £500.00, pending.')}`);
  const bound = (more = []) => box(`${lbl('This approval binds')}<div class="afiles-gap">${kv([['Draft revision', '6'], ['Selected rows hash', '7f3a…c21e'], ['Expected revision', '213'], ...more])}</div>`);
  const forceNo = () => refused('R15', 'A commit appears all at once or not at all, so a partial publish cannot be forced. Choosing 3 of 5 whole groups is its own approval, with its own hash.');
  /* the same outcomes in both options: A shows them over the draft, B inline on the Approval stage */
  const approveOf = ctx => ({
    default: ['Approve exactly this', () => `${change()}${openDiff()}${bound()}${text('Approving needs a fresh sign-in, and the commit must start within 15 minutes. Any change needs a new approval.')}${text(FRESH)}${acts(act('A08', 'Approve these 3 groups', 'primary'), bs('Not now'))}${forceNo()}`],
    loading: ['Waiting for your sign-in', () => `${change()}${bound()}${text('Checking your sign-in with the server. A Face ID unlock alone does not count. Nothing has been approved yet.')}`],
    empty: ['Nothing selected', () => `${text('Select at least one complete group. Each keeps its cash, fee and linked rows together, so a part of a group cannot be committed.')}${bs('Back to the draft')}`],
    partial: ['Outcome unknown', () => `${banner('warn', 'The commit’s outcome is not known yet.', 'Nothing is shown as committed until it is proved. Your ledger reads revision 213, and a retry can never commit twice.', 'clock')}${bound([['Approved', '21:18'], ['Commit started', '21:22']])}${bs('Check again', 'tinted', 'refresh')}`],
    error: ['The commit did not finish', () => `${banner('fall', 'Nothing is visible and your ledger stays at revision 213.', 'Retrying repeats the same operation, so it can never commit twice.', 'alert')}${bound([['Approved', '21:18'], ['Expires', '21:33']])}${act('A52', 'Retry safely', 'primary', 'refresh')}`],
    stale: ['This change is out of date', () => `${banner('warn', 'A newer change reached the ledger first, at revision 215.', 'Refresh it before you approve. Only one change can win.', 'clock')}${change()}${act('A53', 'Refresh preview', 'primary', 'refresh')}`],
    offline: ['You are offline', () => `${off(ctx, 'Your selection is safe on revision 6, and nothing was approved.')}${change()}${refused('R16', 'The server has to check your sign-in, so approving waits for a connection.')}${bs('Not now')}`],
    conflict: ['Refused for a stale revision', () => `${banner('fall', 'Your ledger moved to revision 214, so this approval for 213 can never commit.', 'Nothing was committed.', 'split')}${bound()}${act('A53', 'Refresh preview', 'primary', 'refresh')}`],
    expired: ['This approval expired', () => `${banner('warn', 'It expired on Tue at 21:33 with no commit started.', 'Nothing was committed. The rows have not changed, so a fresh approval is enough.', 'clock')}${openDiff()}${bound([['Approved', 'Tue 21:18'], ['Expires', 'Tue 21:33']])}${text('The commit must start within 15 minutes of a new approval too.')}${acts(act('A08', 'Approve these 3 groups', 'primary'))}`],
    denied: ['A fresh sign-in is needed', () => `${banner('warn', 'Your sign-in is too old for this step.', FRESH, 'lock')}${change()}${wide(ctx) ? bs('Sign in again', 'primary', 'lock') : `${text('Approving happens on iPad or desktop.')}${bs('Not now')}`}`]
  }[ctx.state]);
  const approveSheet = ctx => { const [t, inner] = approveOf(ctx); return `<div class="sheet afiles-sheet" role="dialog" aria-modal="true" aria-labelledby="afiles-sh-${ctx.option}" data-mo="sheet">${wide(ctx) ? '' : '<div class="grabber"></div>'}<h4 id="afiles-sh-${ctx.option}">${t}</h4>${text(NO_TRADE)}${inner()}</div>`; };

  /* ---------- after the commit: nothing here edits a row ---------- */
  const receipt = (o = {}) => box(`<div class="afiles-stack"><div><div class="afiles-name">${o.t || 'Committed'}</div><div class="small muted">${o.s || 'All 9 rows, all at once, at 21:22'}</div></div>${kv([['Ledger revision', '213 → 214'], ['Receipt', 'R-0213'], ['ISA cash', '£4,142.83']])}${text('2 rows stay in the draft and remain visible: the duplicate and the pending transfer.')}${chipset(note('After the commit'), note('Illustrative'))}</div>`);
  const diffs = (o = {}) => box(`${lbl('Open differences')}<div class="afiles-gap">${kv([['This statement, cash', '£12.40'], ['General account, Q3: statement £1,522.10, ledger £1,530.25', '£8.15']])}</div>${text('Each stays open across sessions until you fix it or resolve it with a reason. Nothing is plugged. A change to the facts goes through a correction.')}${o.go === false ? '' : `<div class="afiles-gap">${act('A55', 'Resolve, with a reason')}</div>${text('Resolving records your reason and its source.')}`}`);
  const resolved = () => stateCard('check', 'Nothing open', 'Your last difference was resolved by you on 24 Oct, with your reason: “Broker confirmed a print error on the statement; the ledger figure stands.” The reason stays on the receipt.', '', good('Resolved by you, with your reason'));
  /* the records name no figures for the 2 Nov sale, so these are this page's own, marked. Sold 4 Apple at £170.00; the cash is computed from them (R2-f8) */
  const bothBox = () => box(`${lbl('Both together, one approval')}<div class="afiles-gap">${kv([['The sale on 2 Nov', 'Sold 4 Apple · Trade £680.00 · Fee £3.99 · Cash <span class="afiles-nw">+£676.01</span>'], ['Reverse: Sold 4 Apple', '+4 · <span class="afiles-nw">−£676.01</span>'], ['Replace: Sold 4 Apple, from the 60 held before this import', '−4 · <span class="afiles-nw">+£676.01</span>'], ['This reversal', 'All 9 rows of R-0213']])}</div><div class="afiles-gap">${lbl('After both')}</div><div class="afiles-gap">${kv([['Apple', '60 → 56 units'], ['HSBC', '730 → 700 units'], ['AstraZeneca', '75 → 85 units'], ['ISA cash', '£4,818.84 → £4,688.61']])}</div><div class="afiles-gap">${lbl('This approval binds')}</div><div class="afiles-gap">${kv([['Expected revision', '215'], ['Payload hash', 'e2c4…7a10'], ['Expires', '15 minutes after approval']])}</div>${chipset(note('Illustrative'))}${text('The starting figures include the sale, recorded after this receipt. Both reach the writer as one approval, or neither does.')}<div class="afiles-gap">${act('A11', 'Approve both together', 'primary')}</div>`);
  const correctBox = (o = {}) => box(`${lbl('Correct a row')}${text('Sold 8, not 10? A correction reverses every leg of the original and commits its replacement together. The original stays on record.')}<div class="afiles-gap">${kv([['Reverse: Sold 10 AstraZeneca', '+10 · −£1,072.01'], ['Replace: Sold 8 AstraZeneca', '−8 · +£856.81'], ['AstraZeneca after', '77 units'], ['ISA cash after', '£3,927.63']])}</div>${o.go === false ? '' : `<div class="afiles-gap">${act('A10', 'Approve this correction', o.kind || 'tinted')}</div>`}`);
  const reverseBox = (o = {}) => box(`${lbl('Reverse this import')}${text('A reversal has its own preview and approval. Later events are checked first, and the original rows stay on record.')}<div class="afiles-gap">${kv([['Apple', '64 → 60 units'], ['HSBC', '730 → 700 units'], ['AstraZeneca', '75 → 85 units'], ['ISA cash', '£4,142.83 → £4,012.60']])}</div>${text(o.check || 'Checked: no later event depends on these rows.')}${o.go === false ? '' : `<div class="afiles-gap">${act('A11', 'Approve this reversal')}</div>`}`);
  const rebuildBox = (o = {}) => box(`${lbl(`Rebuild history · Nippon India Nifty 50 BeES`)}${text(`India demat · proposal ${o.v || 2}, against revision ${o.rev || 214} · from 3 older statements`)}<div class="afiles-gap">${kv(o.kv || [['Opening baseline, 30 Sep 2026', '4,200 units, retired'], ['Purchases found', '4,200 units, 9 events'], ['Units after the cutover', '4,200, not 8,400'], ['Generation', '1 → 2']])}</div>${text('Older statements fill the history behind a snapshot. Approval must start its commit within 15 minutes, as any import.')}${o.go === false ? '' : `<div class="afiles-gap">${act('A12', 'Approve this rebuild')}</div>`}`);
  const redoBox = () => box(`${lbl('Reprocess committed rows')}${text('A replay keeps the original ids and adds a new attempt, so it can never commit twice. A changed fact becomes a correction proposal.')}<div class="afiles-gap">${act('A13', 'Reprocess these rows')}</div>`);
  const noEdit = () => refused('R1', 'Nothing here edits the ledger. Only the controlled writer commits, and only an exact change you approved.');
  const fixBody = ctx => region(ctx, {
    what: 'Putting this right', rows: 4, ok: () => receipt() + diffs() + correctBox() + reverseBox() + rebuildBox() + redoBox() + noEdit(),
    loading: () => banner('', 'Awaiting approval.', 'A correction draft is being checked against the ledger. Nothing is visible until it commits.', 'clock') + receipt() + skel(3),
    empty: () => resolved() + noEdit(),
    partial: () => banner('warn', 'The history is only part there.', 'The statements reach back to June 2025 and cover 2,600 of the 4,200 units, so the return stays unavailable. How a part history rebases is still open, and it cannot be approved yet.', 'clock') + chipset(proposed('FIN-OD-03')) + receipt() + correctBox() + rebuildBox({ go: false, kv: [['Baseline', '1,600 units kept'], ['Purchases found', '2,600 units'], ['Return', 'Unavailable']] }) + noEdit(),
    error: () => stateCard('alert', 'The correction did not finish', 'Nothing is visible and your ledger stays at revision 214. Retrying repeats the same operation, so it can never commit twice.', act('A52', 'Retry safely', 'primary', 'refresh')) + receipt() + noEdit(),
    stale: () => banner('warn', 'Your ledger moved to revision 215.', 'Proposal 2 is superseded, and this correction was not checked against 215. Refresh them before you approve. Only one change can win.', 'clock') + acts(act('A53', 'Refresh', 'primary', 'refresh')) + receipt() + correctBox({ go: false }) + reverseBox({ go: false, check: 'Not checked against revision 215.' }) + rebuildBox({ go: false }),
    offline: () => off(ctx, 'Showing this receipt from 11:20.') + receipt() + diffs({ go: false }) + correctBox({ go: false }) + reverseBox({ go: false }) + rebuildBox({ go: false }) + refused('R16', 'Corrections, reversals and rebuilds wait for a connection.'),
    conflict: () => banner('fall', 'Reversal refused.', 'A sale on 2 Nov depends on these units. Approve its correction together with this reversal, or leave both as they are.', 'ban') + receipt() + bothBox() + noEdit(),
    expired: () => banner('warn', 'This correction’s approval expired.', 'No commit started, so nothing changed. The rows have not changed, so a fresh approval is enough.', 'clock') + receipt() + correctBox({ kind: 'primary' }) + noEdit(),
    denied: () => sign('You can read every figure here.') + receipt() + diffs() + correctBox() + reverseBox() + rebuildBox() + redoBox() + noEdit()
  });

  /* ---------- originals and exports ---------- */
  const ORIG = [[DRAFT, 'PDF · kept to Oct 2028'], ['Broker statement, Sep 2026', 'PDF · kept to Sep 2028'], ['Holdings screenshot, Aug 2026', 'PNG · kept to Aug 2028'], ['ISA statement, September', 'PDF · kept to Oct 2028 · R-0210'], ['General account, Q3', 'CSV · within its 24 months · R-0212'], ['India demat, September', 'PDF · within its 24 months · R-0209'], ['Apple screenshot', 'PNG · within its 24 months · R-0204, reversed']];
  const gone = () => rowAt('ban', 'ISA statement, January 2024', 'Original deleted · tombstone tomb_61a4', `${chipset(note('Deleted, with tombstone'))}${text('Its ledger event stays, marked evidence unavailable. A restored backup cannot bring the file back.')}`);
  const renewRow = (go = true, c = hold('Due for owner renewal')) => rowAt('clock', 'Indian funds statement, Dec 2024', 'PDF · due in Dec 2026', `${chipset(c)}${text('Nothing deletes by itself. Renew it for another 24 months, or delete it.')}${go ? `<div class="afiles-gap">${act('A17', 'Renew for 24 months')}</div>` : ''}`, 'warn');
  const origList = (o = {}) => `${sec('8 originals', '<span class="small muted">Kept 24 months, renewable</span>')}${list((o.first || '') + renewRow(o.go !== false) + ORIG.filter(([t]) => t !== o.omit).map(([t, s]) => rowAt('layers', t, s)).join('') + gone())}`;
  const delBox = (o = {}) => box(`${lbl(`Delete an original · Broker statement, Sep 2026 · version ${o.v || 3}`)}<div class="afiles-gap">${kv([['Removes', 'The file and the text read from it'], ['Stays', 'A deletion record and the audit trail']])}</div>${text('The two ledger events it supported stay, marked evidence unavailable.')}${o.go === false ? '' : `<div class="afiles-gap">${act('A16', o.label || 'Delete this original')}</div>`}${chipset(proposed('CT-04'))}`);
  const noBare = () => refused('R6', 'Nothing is deleted without a recorded tombstone. Deletion removes content only, never ledger history or audit records.') + refused('R18', 'An original stays private. There is no public link to one.');
  const expBox = (o = {}) => box(`${lbl('Export your data')}${chipset(o.c || good('Ready · link valid 22 min'))}${text(o.t || 'Your ledger, holdings and evidence, as of one published revision. The link is private and starts a download for one hour.')}${o.pin === false ? '' : `<div class="afiles-gap">${kv([['Pinned to', 'Revision 213 · root 9f3a…c21']])}</div>`}${o.acts === undefined ? acts(act('A19', 'Download', 'primary'), `<span class="afiles-cm">${act('A21', 'Revoke this link early')}${proposed('FIN-OD-08')}</span>`, `<span class="afiles-cm">${act('A20', 'Delete this stored export')}${proposed('FIN-OD-08')}</span>`, act('A18', 'Request a new export')) : o.acts}`);
  const ruleBox = () => box(`${lbl('Rules, read only')}<div class="afiles-gap">${kv([['Originals', '24 months, renewable'], ['Automatic deletion', 'None'], ['Export link', 'One hour to start']])}</div>${text('Retention and lifecycle rules change only through Terraform, so there is no setting here. Reaching 24 months raises a renewal prompt, never a delete.')}`);
  const keepBody = ctx => region(ctx, {
    what: 'Originals and exports', rows: 5, ok: () => origList() + delBox() + expBox() + noBare(),
    loading: () => banner('', 'Deleting.', 'If this stops, it resumes from its deletion record.', 'clock') + delBox({ go: false }) + expBox({ c: good('Building'), t: 'Building from revision 213. A revision published meanwhile does not change it.', acts: '' }) + skel(3),
    empty: () => stateCard('shield', 'No originals yet', 'A statement or screenshot you import is kept here privately for 24 months, and you can renew it.') + expBox({ c: note('No export yet'), pin: false, t: 'Your ledger, holdings and evidence, as of one published revision. Asking needs a fresh sign-in.', acts: act('A18', 'Request an export', 'primary') }),
    partial: () => banner('warn', 'One copy is left.', 'The deletion stopped part-way, as partially_failed. It resumes by itself and reports what it could not yet remove.', 'alert') + chipset(proposed('CT-04')) + origList({ omit: 'Broker statement, Sep 2026', first: rowAt('ban', 'Broker statement, Sep 2026', 'Version 3 · deletion in progress', chipset(hold('partially_failed', 'alert'))) }) + noBare(),
    error: () => stateCard('alert', 'The export failed', 'It failed at 11:38 and stopped part-way, so no partial file exists. Trying again resumes it without making a duplicate.', act('A54', 'Try again', 'primary', 'refresh')) + origList() + expBox({ c: fail('Failed 11:38'), acts: '' }),
    stale: () => banner('warn', 'From 11:12.', 'The index behind this list is lagging, so each row shows its last known date. Nothing deletes by itself.', 'clock') + origList({ go: false }) + expBox({ c: hold('Last known 11:12'), acts: '' }),
    offline: () => off(ctx, 'Showing originals from 11:20. Exports are built and kept on the server.') + origList({ go: false }) + delBox({ go: false }) + expBox({ c: `<span class="chip offline">${ic('wifi-off', 's14')}Needs a connection</span>`, acts: '' }) + noBare(),
    conflict: () => banner('fall', 'This file changed.', 'It moved to version 4 after you opened it, so that approval is refused. Check it, then approve again.', 'split') + delBox({ v: 4, label: 'Approve again' }) + expBox({ t: 'Revision 214 published while this was building. This export stays on revision 213, whole, and never mixes the two.' }) + origList(),
    expired: () => banner('warn', 'The link expired.', 'The one-hour link ended. A new request needs a fresh sign-in, and an expired link starts nothing.', 'clock') + expBox({ c: hold('Link expired'), acts: act('A18', 'Request a new link', 'primary') }) + origList(),
    denied: () => sign('The list stays open to read.') + box(`${lbl('Unreadable for now')}${text('A restored backup holds a deleted copy until its deletion record is applied again. Tombstones are applied before restored content is readable.')}${chipset(hold('Restored copy awaiting tombstone', 'lock'))}`) + origList() + delBox() + expBox()
  });

  /* ---------- option B: one file's life ---------- */
  const STAGES = ['Original', 'Extraction', 'Revisions', 'Approval', 'Commit', 'Retention'];
  const strip = (ctx, at) => `<div class="afiles-strip${wide(ctx) ? '' : ' ph'}" role="group" aria-label="Stages of this file" data-mo="rise">${STAGES.map((t, i) => `<button type="button" class="afiles-st${i === at ? ' on' : ''}"${i === at ? ' aria-current="step"' : ''}>${t}</button>`).join('')}</div>`;
  const NODE = { done: 'check', now: 'target', wait: '', warn: 'clock', bad: 'alert', stop: 'x' };
  const lifeOf = rows => `<ol class="afiles-life card" data-mo="card" aria-label="Life of this file">${rows.map(([k, s, x = '', i], n) => `<li class="afiles-lf ${k}"><span class="nd" aria-hidden="true">${NODE[k] ? ic(NODE[k], 's14') : ''}</span><div role="button" tabindex="0" class="tx" aria-label="${STAGES[n]}. ${plain(s)}. ${plain(x)}"><div class="afiles-lfh"><b>${STAGES[n]}</b>${ic('chev-r', 's18')}</div><span class="small muted">${s}</span>${x}</div></li>`).join('')}</ol>`;
  const LIFE = [['done', 'Received and checked · private · ' + SCAN], ['done', 'Read by Claude, no tools · 1 field flagged', chipset(note('Extracted, with low-confidence fields flagged'))], ['done', 'Revision 6 · 9 of 11 rows · earlier revisions stay for comparison'], ['now', 'Waits on you · the commit must start within 15 minutes once approved', chipset(mine('Ready for you'))], ['wait', 'Not started · your ledger stays at revision 213'], ['done', 'Kept to Oct 2028 · renewable']];
  const lifeWith = (over = {}) => LIFE.map((r, i) => over[i] || r);
  const notYet = t => ['wait', t];
  const lifeBody = ctx => region(ctx, {
    what: 'This file', rows: 6, ok: () => lifeOf(LIFE),
    loading: () => lifeOf(lifeWith({ 1: ['now', 'Claude is reading page 3 of 4 · it has no tools here', chipset(hold('Extracting'))], 2: notYet('Not reached'), 3: notYet('Not reached'), 4: notYet('Not reached') })),
    empty: () => stateCard('x', 'Draft cancelled', 'Nothing was committed, and your ledger stays at revision 213. The original stays, so you can start again.') + lifeOf(lifeWith({ 3: ['stop', 'Cancelled before any approval', chipset(note('Cancelled'))], 4: ['stop', 'Never started'] })),
    partial: () => banner('warn', 'Extracted, with low-confidence fields flagged.', 'A date could not be read, so it is blank, not guessed.', 'clock') + lifeOf(lifeWith({ 1: ['warn', 'Read by Claude, no tools · 1 date not read', chipset(part('needs_resolution'))], 2: ['done', 'Revision 5 · 6 of 11 rows'], 3: ['now', 'Waits on one group · 2 groups could be approved now'] })),
    error: () => banner('fall', 'Schema validation failed.', 'No rows were made, and your original is safe. Nothing reached your ledger.', 'alert') + lifeOf(lifeWith({ 1: ['bad', 'Claude’s reply was refused · stops with a reason if it fails again', chipset(fail('validation_failed'))], 2: notYet('Not reached'), 3: notYet('Not reached'), 4: notYet('Not reached') })),
    stale: () => banner('warn', 'Superseded by a newer model or prompt version.', 'Revision 6 stands and stays for comparison.', 'clock') + lifeOf(lifeWith({ 1: ['warn', 'Read by an older version', chipset(hold('Superseded'))] })),
    offline: () => off(ctx, 'Showing this life from 11:20.') + lifeOf(LIFE),
    conflict: () => banner('warn', 'Your ledger moved to revision 214.', 'This approval for 213 can never commit. Nothing was committed.', 'split') + lifeOf(lifeWith({ 3: ['bad', 'Refused for a stale revision', chipset(fail('Refresh the preview', 'split'))], 4: ['stop', 'Never started'] })),
    expired: () => banner('warn', 'This approval expired.', 'A fresh approval is enough, because the rows have not changed.', 'clock') + lifeOf(lifeWith({ 3: ['warn', 'It expired on Tue at 21:33 with no commit started', chipset(hold('Expired'))], 4: ['stop', 'Never started'] })),
    denied: () => sign('You can read this whole life.') + lifeOf(LIFE)
  });
  const mini = at => `<span class="afiles-mini" role="img" aria-label="Reached ${STAGES[at]}, stage ${at + 1} of 6">${STAGES.map((_, i) => `<i class="${i < at ? 'd' : i === at ? 'n' : ''}"></i>`).join('')}</span>`;
  const bFiles = (ctx, o = {}) => `${sec('Newest first')}${list(rowGo('layers', DRAFT, o.s || 'Draft revision 6 · waits on you', `${mini(3)}${chipset(o.c || mine('Ready for you'))}`) + rowGo('layers', 'General account, Q3', 'R-0212 · committed 24 Oct · cash differs by £8.15', `${mini(5)}${chipset(hold('Difference open', 'split'))}`) + rowGo('layers', 'ISA statement, September', 'R-0210 · committed 6 Oct', mini(5)) + rowGo('layers', 'Broker statement, Sep 2026', 'Kept to Sep 2028', mini(5)) + rowGo('layers', 'India demat, September', 'R-0209 · committed 2 Oct', mini(5)) + rowGo('layers', 'Holdings screenshot, Aug 2026', 'Kept to Aug 2028', mini(5)) + rowGo('layers', 'Apple screenshot', 'R-0204 · reversed 12 Sep', mini(5)) + rowGo('clock', 'Indian funds statement, Dec 2024', 'Due in Dec 2026', `${mini(5)}${chipset(hold('Due for owner renewal'))}`, 'warn') + gone() + (o.noOrphan ? '' : orphan(o.act !== false) + heldFile(o.act !== false)))}`;
  const bFilesBody = ctx => region(ctx, {
    what: 'Your files', rows: 6, ok: () => bFiles(ctx),
    loading: () => banner('', 'Reading receipts and drafts.', 'The last good list is from 11:20.', 'clock') + skel(6),
    empty: () => stateCard('layers', 'No files yet', 'Bring in a statement to start your ledger. Every row waits for your review, and nothing changes until you approve it.', act('A04', 'Upload a file', 'primary', 'plus')),
    partial: () => banner('warn', '3 of 4 sources answered.', 'The quarantine list did not answer, so what is held apart is unknown, not nothing.', 'clock') + bFiles(ctx, { noOrphan: true }),
    error: () => stateCard('alert', 'The list did not refresh', 'It failed at 11:38, so this is the list from 11:20. Nothing is deleted or changed.', trying()) + refusedFiles() + bFiles(ctx, { act: false }),
    stale: () => banner('warn', 'From 11:12.', 'The index is lagging, so a file may be further along than it looks.', 'clock') + bFiles(ctx, { c: hold('Last known 11:12') }),
    offline: () => off(ctx, 'Showing your files from 11:20. Uploads need a connection.') + bFiles(ctx, { act: false }),
    conflict: () => banner('warn', 'Your ledger moved to revision 214.', 'This draft was built against 213, so it needs a refreshed preview.', 'split') + bFiles(ctx, { s: 'Draft revision 6 · against revision 213, not 214', c: fail('Needs a refreshed preview', 'split') }),
    expired: () => banner('warn', 'An upload link expired.', 'A new link is made for you when you send the file again. No part of the file was kept.', 'clock') + bFiles(ctx, { s: 'Draft revision 6 · approval expired Tue 21:33', c: hold('Approval expired Tue 21:33') }),
    denied: () => banner('warn', 'Reading needs no fresh sign-in. Changing something does.', FRESH, 'lock') + bFiles(ctx)
  });
  const bSide = ctx => `${ctx.state === 'empty' ? '' : box(`${lbl('Add a file')}${text('It starts its own life here, held apart and checked before anything reads it.')}${ctx.state === 'offline' ? text('Uploads need a connection.') : `<div class="afiles-gap">${act('A04', 'Upload a file', 'primary', 'plus')}</div>`}${chipset(proposed('MP40-Q1'))}`)}`;

  const scanBox = (blank = false) => `<div class="afiles-scan card" role="img" aria-label="Page 2 of the scanned statement. The row for AstraZeneca reads 10 at 107.60, value 1,076.00." data-mo="card"><div class="hd"><span>Your scan, page 2, row 6</span><span>GBP</span></div><div class="ln dim"><span>20/10</span><span>ASTRAZENECA DIV</span><span></span><span>41.16</span></div><div class="ln"><span>${blank ? '?' : '22/10'}</span><span>ASTRAZENECA 10 @ 107.60</span><span></span><span>1,076.00</span></div><div class="ln dim"><span>28/10</span><span>TRANSFER IN</span><span></span><span>500.00</span></div></div>`;
  const readBox = () => box(`${lbl('What was read')}<div class="afiles-gap">${kv([['Row', 'Sold 10 AstraZeneca'], ['Date', '22 Oct'], ['Price', '£107.60, low confidence, you confirmed it'], ['Value', '£1,076.00']])}</div>`);
  const revRows = () => list(rowAt('check', 'Revision 6', '3 groups · 9 of 11 rows · 7f3a…c21e', chipset(mine('Current'))) + rowAt('layers', 'Revision 5', '2 groups · 6 of 11 rows · b41d…9e07', chipset(note('Stays for comparison'))) + rowAt('layers', 'Revision 4', '1 group · 3 rows · 3c9e…01ab', chipset(note('Stays for comparison'))));
  const srcActs = () => box(acts(act('A02', 'Open the original', 'primary'), act('A14', 'Reprocess into a new revision')));
  const srcBody = ctx => region(ctx, {
    what: 'This source', rows: 4, ok: () => strip(ctx, 1) + scanBox() + readBox() + list(gDup() + gPend()) + sec('Revisions') + revRows() + cmp(ctx) + srcActs(),
    loading: () => strip(ctx, 1) + box(`${lbl('Extracting')}${steps(2)}${text('Claude is reading page 3 of 4.')}`) + skel(2),
    empty: () => strip(ctx, 0) + stateCard('layers', 'No extraction', 'This file stopped at Original, because the draft was cancelled. The original stays.'),
    partial: () => banner('warn', 'Low-confidence fields flagged.', 'One date could not be read, so it is blank, not guessed.', 'clock') + strip(ctx, 1) + scanBox(true) + sec('Revisions') + revRows() + srcActs(),
    error: () => strip(ctx, 1) + stateCard('alert', 'Extraction failed', 'Claude’s reply failed validation, so no rows were made. Reprocessing needs a new source-processing revision. The file itself is never replaced.', `<div>${act('A14', 'Reprocess into a new revision', 'primary')}</div>`),
    stale: () => banner('warn', 'Superseded by a newer model or prompt version.', 'The old revision stays for comparison.', 'clock') + strip(ctx, 1) + scanBox() + sec('Revisions') + revRows() + box(act('A14', 'Reprocess into a new revision', 'primary')),
    offline: () => off(ctx, 'Showing what was read at 11:20. The original itself is not on this device.') + strip(ctx, 1) + readBox() + list(gDup(false) + gPend(false)) + sec('Revisions') + revRows(),
    conflict: () => banner('warn', 'Correction proposed for a changed fact.', 'Reprocessing read 8 units where revision 6 has 10. Neither is overwritten.', 'split') + strip(ctx, 2) + cmp(ctx, [['Units sold, AstraZeneca', '10', '8'], ['Trade value', '£1,076.00', '£860.80'], ['Cash, after the £3.99 fee', '+£1,072.01', '+£856.81']], 'Revision 6', 'Reprocessed') + scanBox(),
    expired: () => banner('warn', 'The approval on revision 5 no longer stands.', 'Making revision 6 voided it.', 'clock') + strip(ctx, 2) + sec('Revisions') + revRows() + cmp(ctx),
    denied: () => banner('warn', 'Paused for credit.', 'This scan is queued and no model has read it. Claude stays off until credit is verified or you approve paid use, in Settings, with a fresh sign-in.', 'lock') + strip(ctx, 1) + box(`${lbl('Opening an earlier original')}${text(FRESH)}<div class="afiles-gap">${act('A02', 'Open the original')}</div>`) + costBox('Reservation refused')
  });
  const dBody = ctx => {
    const [t, inner] = approveOf(ctx), st = ctx.state;
    return `${strip(ctx, st === 'partial' || st === 'error' ? 4 : 3)}${st === 'default' ? groups() : ''}${box(`<div class="afiles-stack"><div class="afiles-name">${t}</div>${inner()}</div>`)}${st === 'default' ? box(`${acts(act('A56', 'Edit, exclude or remap rows'), act('A06', 'Cancel this draft'))}${text(ALL_LATER)}`) : ''}`;
  };
  const LATER = () => list(rowAt('check', 'Committed', 'R-0213 · ledger revision 213 → 214', '', '') + rowAt('clock', 'Open', 'Correction, reversal and rebuild each add to this life. None rewrites it.'));

  J.add({
    id: 'files', title: 'Files and imports', stories: ['MP-64', 'MP-45', 'MP-46', 'MP-47', 'MP-48', 'MP-49', 'MP-52', 'MP-53', 'MP-55', 'MP-60', 'MP-68', 'MP-169', 'MP-42', 'MP-98', 'MP-149', 'MP-116'],
    summary: 'Every file you brought in, what it became, and how long it is kept. Nothing here edits the ledger: a row reaches it only through an exact change you approve.',
    options: [{
      id: 'a', name: 'Status queue', rec: true,
      why: 'You open Files because something waits, so every file is sorted by what it needs. Each one opens to the same detail, and the original, the draft and the approval stay one step apart.',
      cost: 'One file’s whole history is spread across several screens. Following a file from upload to retention takes more steps.',
      covers: { compare: 'a-compare', decide: 'a-approve', source: 'a-draft', correct: 'a-fix', config: 'n/a: retention and lifecycle rules change only through Terraform, so no setting belongs here. They show read-only on Originals and exports.', cost: 'n/a: a read’s amount is reconciled in Costs and budgets, not here. One draft shows its reservation and opens Costs and budgets.', recover: 'a-keep' },
      screens: [{
        id: 'a-queue', title: 'Files by what they need', note: 'Admin home counts neither held row. Who records the unmatched object’s disposition is still open, and leaving the held file out of the count is this drawing’s choice, for you to correct.',
        render: ctx => fr(ctx, { title: 'Files and imports', back: 'Admin', body: qBody(ctx), rail: qRail(ctx) })
      }, {
        id: 'a-draft', title: 'One draft', note: 'Drawn as the ISA statement, the import the owner journeys use.',
        render: ctx => fr(ctx, { title: 'ISA statement', back: 'Files', body: draftBody(ctx), rail: safe('Edits, reprocessing, remapping, exclusions and your answers on a duplicate or a transfer make a new immutable revision and void the pending approval.') })
      }, {
        id: 'a-compare', title: 'Compare revisions',
        render: ctx => fr(ctx, { title: 'Compare revisions', back: 'ISA statement', body: cmpBody(ctx), rail: earlier() })
      }, {
        id: 'a-approve', title: 'Approve exactly this', note: 'The approval binds these rows, this hash and this ledger revision. Its times, 21:18 to 21:33, are the evening the owner journeys draw: Tue in Expired. Partial and Failed read as a later evening, not the 11:38 of the chip.',
        render: ctx => fr(ctx, { title: 'ISA statement', back: 'Files', body: head({ s: 'Stocks ISA · 3 groups · against ledger revision 213', c: ctx.state === 'default' ? undefined : '' }), sheet: approveSheet(ctx) })
      }, {
        id: 'a-fix', title: 'Put it right', note: 'Drawn after the commit you approve on the last screen, so the ledger reads revision 214 here. Proposal 2 is the rebuild refreshed against it. The records name no figures for the 2 Nov sale, so Conflicting draws its own, marked illustrative, and reads revision 215.',
        render: ctx => fr(ctx, { title: 'Put it right', back: 'Files', body: fixBody(ctx), rail: safe('A correction, a reversal or a rebuild is a new event. The original rows stay on record.') })
      }, {
        id: 'a-keep', title: 'Originals and exports', note: 'Originals follow the receipts and the Privacy journey, so 8 are listed where Holdings says 6. Whether the ISA and Broker statements for October are one file is still open. The link’s 22 minutes are admin’s 11:40; Privacy’s 42 are the owner journeys’ own clock.',
        render: ctx => fr(ctx, { title: 'Originals and exports', back: 'Files', body: keepBody(ctx), rail: ruleBox() })
      }]
    }, {
      id: 'b', name: 'One file’s life',
      why: 'Every file reads as one line, from original to retention, so you always see where it stands and what came before. It suits investigating one file, and each stage opens in place.',
      cost: 'What waits on you is a mark on each file, not a queue. With many files, the one that needs you takes longer to find.',
      covers: { compare: 'b-source', decide: 'b-decide', source: 'b-source', correct: 'b-after', config: 'n/a: retention and lifecycle rules change only through Terraform, so no setting belongs here. They show read-only on the Retention stage.', cost: 'n/a: a read’s amount is reconciled in Costs and budgets, not here. One file’s life shows its reservation and opens Costs and budgets.', recover: 'b-keep' },
      screens: [{
        id: 'b-files', title: 'Every file, by stage', note: 'Each row shows how far along its six stages a file has come.',
        render: ctx => fr(ctx, { title: 'Files and imports', back: 'Admin', actions: tb('search', 'Search files'), body: bFilesBody(ctx), rail: bSide(ctx) })
      }, {
        id: 'b-life', title: 'One file’s life', note: 'Six stages, always in this order. A stage it never reached says so.',
        render: ctx => fr(ctx, { title: 'ISA statement', back: 'Files', body: head({ s: SCAN }) + lifeBody(ctx), rail: chain(chainFor(ctx)) + (ctx.state === 'error' || ctx.state === 'loading' ? '' : costBox()) })
      }, {
        id: 'b-source', title: 'Original, extraction, revisions',
        render: ctx => fr(ctx, { title: 'Source', back: 'ISA statement', body: srcBody(ctx), rail: chain(chainFor(ctx)) + safe('The old revision stays for comparison, and the file itself is never replaced.') })
      }, {
        id: 'b-decide', title: 'Approval stage', note: 'The same approval as option A, in place on its stage. Its times are the evening the owner journeys draw: Tue in Expired. Partial and Failed read as a later evening, not the 11:38 of the chip.',
        render: ctx => fr(ctx, { title: 'Approval', back: 'ISA statement', body: dBody(ctx) })
      }, {
        id: 'b-after', title: 'After the commit', note: 'Drawn after the commit, so the ledger reads revision 214 here. Proposal 2 is the rebuild refreshed against it. The records name no figures for the 2 Nov sale, so Conflicting draws its own, marked illustrative, and reads revision 215.',
        render: ctx => fr(ctx, { title: 'After the commit', back: 'ISA statement', body: strip(ctx, 4) + (ctx.state === 'default' ? LATER() : '') + fixBody(ctx), rail: safe('A correction, a reversal or a rebuild is a new event. The original rows stay on record.') })
      }, {
        id: 'b-keep', title: 'Retention stage',
        render: ctx => fr(ctx, { title: 'Retention', back: 'ISA statement', body: strip(ctx, 5) + keepBody(ctx), rail: ruleBox() })
      }]
    }]
  });
}
