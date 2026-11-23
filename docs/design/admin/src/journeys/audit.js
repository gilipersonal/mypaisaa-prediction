/* Audit (MP-64, PH00-S06): read-only. It holds references, never document content, prompts, tokens or holding values, so no amount appears here. The worked question is PH01-S04's. Every figure is illustrative. */
{
  const FRESH = 'Opening the app with Face ID, or an open session, is not enough. The server checks a fresh sign-in.';
  const TARGET = 'A fee in ISA statement, September · R-0210';
  const good = t => `<span class="chip fresh"><span class="dot"></span>${t}</span>`;
  const hold = (t, i = 'clock') => `<span class="chip stale">${ic(i, 's14')}${t}</span>`;
  const fail = (t, i = 'alert') => `<span class="chip error">${ic(i, 's14')}${t}</span>`;
  const note = t => `<span class="chip illus">${t}</span>`;
  const part = t => `<span class="chip partial"><span class="dot"></span>${t}</span>`;
  const mine = t => `<span class="chip owner"><span class="dot"></span>${t}</span>`;
  const mono = t => `<code class="aaudit-id">${t}</code>`;
  const chipset = (...c) => `<div class="aaudit-chips">${c.filter(Boolean).join('')}</div>`;
  const text = t => `<p class="small muted aaudit-p">${t}</p>`;
  const rowGo = (i, t, s, x = '', tone = '', sel = false) => item(lead(i, tone), t, s, ic('chev-r', 's18'), x, sel, true);
  const rowAt = (i, t, s, x = '', tone = '') => item(lead(i, tone), t, s, '', x);
  const off = (ctx, t) => banner('', 'Offline.', `${t} Audit is read-only, so nothing here waits to be sent. No financial write offline.`, 'wifi-off') + (browser(ctx) ? `<div class="aaudit-chips">${proposed('MP40-Q12')}<span class="small muted">What a browser keeps offline is open.</span></div>` : '');
  const refs = () => box(`${lbl('What audit holds')}${text('References only, never document content, prompts, tokens or holding values. The amount itself is in your ledger.')}${text('Unsampled, for the lifetime of your account.')}${chipset(proposed('CT-03'))}`);
  const claim = () => chipset(`<span class="chip">${mono('digest_only')}</span>`, proposed('FIN-OD-08'));
  /* PH01-S04: a lagging index falls back to the manifests and returns the complete lineage, so a lag is not a doubtful answer. One phrase everywhere (lesson 7) */
  const LAG = 'Read from the manifests at 11:12, so this is complete to ledger revision 213. Anything after that pin is not part of this question.';
  const lagged = () => banner('warn', 'Index lagging, with fallback to manifests.', LAG, 'clock');
  const trying = () => bs('Try again', 'tinted', 'refresh');
  const inFiles = (t = 'Open in Files') => bs(t, 'tinted', 'layers');
  const noEdit = () => refused('R7', 'An audit record cannot be edited or deleted here. Only the controlled writer and the protected approval and deletion paths add to it.');

  /* ---------- what you can ask ---------- */
  const Q = [
    ['shield', 'Who changed this, from which document, what did I approve, and which forecasts used it?', 'event_lineage'],
    ['search', 'What changed, who did it, and what was denied?', 'recorded_changes'],
    ['clock', 'What did the record say on a past date?', 'economic_history'],
    ['check', 'Did this commit finish whole?', 'commit_completeness'],
    ['refresh', 'Did this change reach everything that follows it?', 'outbox_delivery'],
    ['lock', 'Which uploads have no receipt?', 'source_orphans'],
    ['target', 'Which inputs made this figure?', 'metric_inputs'],
    ['layers', 'What replaced this?', 'supersession'],
    ['eye-off', 'What was exported or opened?', 'export_access']
  ];
  const qList = (o = {}) => list(Q.map(([i, t, k], n) => item(lead(i, n === 0 ? 'sel' : ''), t, `${o.mark && o.mark[k] ? o.mark[k] : mono(k)}`, ic('chev-r', 's18'), '', n === 0, true)).join(''));
  const askBox = (o = {}) => box(`${lbl('About')}<div class="aaudit-gap">${kv([['This', o.t || TARGET], ['Pinned to', o.pin || 'Ledger revision 213'], ['Range', 'Account lifetime'], ['Environment', 'Prod']])}</div>${o.go === false ? '' : `<div class="aaudit-gap">${act('A01', 'Ask', 'primary', 'search')}</div>`}`);
  const askBody = ctx => region(ctx, {
    what: 'Audit', rows: 6, ok: () => sec('Ask') + qList() + askBox(),
    loading: () => banner('', 'Reading the index.', 'The last good answer is from 11:20.', 'clock') + skel(6),
    empty: () => stateCard('shield', 'Nothing recorded yet', 'Audit starts with your first import or approval. Until then there is nothing to ask, and that is not proof nothing happened elsewhere.') + refs(),
    partial: () => banner('warn', '3 of 4 sources answered.', 'Outbox delivery did not answer, so that question is held. An answer that needs it says what is missing.', 'clock') + sec('Ask') + qList({ mark: { outbox_delivery: 'Held, source not answering' } }) + askBox(),
    error: () => stateCard('alert', 'Query incomplete', `${mono('INTEGRITY_INCOMPLETE')} The records failed at 11:38. Answers from 11:20 stay, labelled with their time.`, trying()) + sec('Ask') + qList() + askBox({ go: false }),
    stale: () => lagged() + sec('Ask') + qList() + askBox(),
    offline: () => off(ctx, 'Asking needs a connection. Your last answer, from 11:20, is saved.') + rowsBox(rowGo('shield', 'Your last answer', `${TARGET} · saved 11:20`, chipset(hold('offline_cached', 'wifi-off')))) + sec('Ask') + qList(),
    conflict: () => banner('warn', 'Your ledger moved to revision 214.', 'Your question stays pinned to 213, so its answer cannot shift while you read. Change the pin to ask about 214.', 'split') + sec('Ask') + qList() + askBox({ pin: 'Ledger revision 213, not the latest' }),
    expired: () => banner('warn', 'Logs and traces run out. Audit does not.', 'Logs last 14 days, traces 30 and run summaries 90. Audit lasts your account’s lifetime, so an answer from an old run shows what it no longer has.', 'clock') + sec('Ask') + qList() + askBox(),
    denied: () => banner('warn', 'Asking needs no fresh sign-in.', `Opening a source may. ${FRESH}`, 'lock') + sec('Ask') + qList() + askBox()
  });
  const rowsBox = r => list(r);

  /* ---------- the answer, in the question's four parts ---------- */
  const ANS = {
    who: () => [`You approved it, and the controlled writer committed it`, `Recorded 6 Oct · no later change`, chipset(note('Code checked'), note('Claude drafted'), mine('You decided'))],
    doc: () => [`ISA statement, September`, `PDF · 12 rows · source ${mono('src_1e08')}`, `<div class="aaudit-gap">${inFiles()}</div>`],
    app: () => [`Approval ${mono('apr_52be')}`, `R-0210 · ledger revision 210 → 211 · 6 Oct`, ''],
    fc: () => [`${mono('run_8d02')} and ${mono('run_8c41')}`, `Tue 21:15 and Mon 21:15, and each run back to 6 Oct`, text('A forecast is never rewritten. A correction would show in the next run.')]
  };
  const ansCard = (t, [a, b, x]) => box(`${lbl(t)}<div class="aaudit-a">${a}</div><div class="small muted">${b}</div>${x}`);
  const answer = (o = {}) => `${ansCard('Who changed it', o.who || ANS.who())}${ansCard('From which document', o.doc || ANS.doc())}${ansCard('What you approved', o.app || ANS.app())}${ansCard('Which forecasts used it', o.fc || ANS.fc())}`;
  const verdict = (o = {}) => `<div class="aaudit-v" data-mo="rise">${chipset(o.c || good('Complete lineage'), note('Illustrative'))}<p class="small">${o.t || TARGET}</p></div>`;
  const ansBody = ctx => region(ctx, {
    what: 'This answer', rows: 4, ok: () => verdict() + answer() + ansLinks(),
    loading: () => verdict({ c: note('Reading') }) + skel(4),
    empty: () => stateCard('search', 'No recorded change', 'No record matches this in the range you asked. Silence is not a sign that nothing is wrong, so check the range, or the pin.', bs('Change the question')),
    partial: () => banner('warn', 'Lineage with an unavailable source.', 'The original was deleted with a tombstone. Its ledger events stay, marked evidence unavailable.', 'clock') + verdict({ c: part('Source unavailable') }) + answer({ doc: ['Evidence unavailable', `Tombstone recorded · source ${mono('src_1e08')}`, ''] }) + ansLinks(),
    error: () => banner('fall', 'Integrity check failed.', 'Records from 28 Oct to 30 Oct do not match their digests. This names the range, not a cause or an actor.', 'alert') + verdict({ c: fail('Query incomplete') }) + answer({ fc: ['Not answered', `${mono('INTEGRITY_INCOMPLETE')} · the forecasts part reads the affected range`, ''] }) + `<div class=\"aaudit-row\">${bs('See the affected range', 'tinted', 'shield')}</div>`,
    stale: () => lagged() + verdict({ c: hold('From manifests, 11:12') }) + answer(),
    offline: () => off(ctx, 'Showing the answer saved at 11:20.') + verdict({ c: hold('offline_cached', 'wifi-off') }) + answer({ doc: ['ISA statement, September', `PDF · 12 rows · source ${mono('src_1e08')}`, text('Opening it needs a connection.')] }),
    conflict: () => banner('warn', 'Superseded.', 'A newer record replaced this one after you opened it. You are reading the version you opened, pinned to revision 213.', 'split') + verdict({ c: hold('superseded', 'split') }) + answer({ who: ['You approved it, and the controlled writer committed it', 'Recorded 6 Oct · a later correction exists', chipset(note('Code checked'), note('Claude drafted'), mine('You decided'))] }) + `<div class=\"aaudit-row\">${bs('Read the newer record', 'tinted', 'layers')}</div>`,
    expired: () => banner('warn', 'This approval expired, and the record says so.', 'It expired on Tue at 21:33 with no commit started, so nothing was committed and no forecast used it.', 'clock') + verdict({ c: hold('Expired approval'), t: 'Statement import, ISA statement, Oct 2026' }) + answer({ who: ['Nobody changed it', 'No commit started', ''], doc: ['ISA statement, Oct 2026', 'Scan · draft revision 6', ''], app: ['Your approval, then nothing', 'Approved Tue 21:18 · expired Tue 21:33', ''], fc: ['None', 'Nothing reached the ledger, so no forecast could use it', ''] }),
    denied: () => banner('warn', 'You can read all of this.', `Opening the original is the part that may ask. ${FRESH}`, 'lock') + verdict({ c: hold('permission_denied on the source', 'lock') }) + answer({ doc: ['ISA statement, September', `PDF · 12 rows · source ${mono('src_1e08')}`, chipset(proposed('CT-01'))] })
  });
  const ansLinks = () => list(rowGo('split', 'Follow the chain', 'Source, ledger, risk, forecast, action, outcome, audit') + rowGo('shield', 'Read the full record', mono('aud_4c17')));
  const ansRail = () => `${box(`${lbl('Who did what')}<div class="aaudit-gap">${kv([['Code checked', 'The file, before anything read it'], ['Claude drafted', 'The rows, with no tools'], ['You decide', 'You approved 12 rows']])}</div>`)}${refs()}`;

  /* ---------- following the chain (MP-151) ---------- */
  const FOLLOW = [
    ['Source', `ISA statement, September · ${mono('src_1e08')}`, 'resolved'],
    ['Ledger', `R-0210 · event ${mono('evt_77d3')}`, 'resolved'],
    ['Risk', 'Read from this ledger at Tue 22:15 · cutoff 22:00', 'resolved'],
    ['Forecast', `${mono('run_8d02')} · job ${mono('job_3e9a')} · trace ${mono('tr_51c2')}`, 'resolved'],
    ['Action', 'Ranked action, decision support · run_8d02', 'resolved'],
    ['Outcome', 'Not scored: its horizon has not passed', 'Not yet'],
    ['Audit', `${mono('aud_4c17')}`, 'resolved']
  ];
  const fChip = s => (s === 'resolved' ? good('resolved') : s === 'Not yet' || s === 'None' ? note(s) : s.startsWith('!') ? fail(s.slice(1)) : hold(s));
  /* a saved or unvouched chain says so on every step */
  const allAs = (rows, label, more = []) => Object.fromEntries(rows.filter(r => ['resolved', ...more].includes(r[2])).map(r => [r[0], [r[1], label]]));
  const chainOf = (rows = FOLLOW, over = {}) => `<ol class="aaudit-chain card" data-mo="card" aria-label="The chain, step by step">${rows.map(([t, s, c], i) => { const r = over[t] || [s, c]; return `<li><span class="n" aria-hidden="true">${i + 1}</span><div><b>${t}</b><span class="small muted">${r[0]}</span>${chipset(fChip(r[1]))}</div></li>`; }).join('')}</ol>`;
  const follow = ctx => region(ctx, {
    what: 'This chain', rows: 7, ok: () => chainOf() + `<div class="aaudit-row">${inFiles('Open the source in Files')}</div>`,
    loading: () => chainOf(FOLLOW.slice(0, 2)) + skel(4),
    empty: () => stateCard('search', 'not_found', 'This link points at nothing MP has recorded. No step is guessed.', bs('Back to the answer')),
    partial: () => banner('warn', 'Lineage with an unavailable source.', 'The chain carries on from the ledger. The step it cannot show says why.', 'clock') + chainOf(FOLLOW, { Source: ['Evidence unavailable · tombstone recorded', 'Source unavailable'] }),
    error: () => banner('fall', 'Twelve Data failed at 21:16.', `Last good run Mon 22:15 · cutoff 22:00. Run ${mono('run_8d02')} failed, with incident ${mono('inc_0013')} and request ${mono('req_a90f')}.`, 'alert') + chainOf(FOLLOW, { Forecast: [`${mono('run_8c41')} · Mon 21:15, the last good run`, 'Held from Mon 21:15'], Action: ['Held from Mon 21:15', 'Held from Mon 21:15'] }),
    stale: () => lagged() + chainOf(FOLLOW, { Forecast: [`${mono('run_8d02')} · from manifests, 11:12`, 'resolved'] }),
    offline: () => off(ctx, 'Showing the chain saved at 11:20.') + chainOf(FOLLOW, { ...allAs(FOLLOW, 'offline_cached'), Forecast: [`${mono('run_8d02')} · saved 11:20`, 'offline_cached'] }),
    conflict: () => banner('warn', 'A step was superseded.', 'A newer ledger event replaced this one. Each forecast keeps the inputs it was made with, and none is rewritten.', 'split') + chainOf(FOLLOW, { Ledger: [`R-0210 · event ${mono('evt_77d3')} · a newer event exists`, 'superseded'] }),
    expired: () => banner('warn', 'Logs for the first run are gone.', 'The first run to use this fee was on 6 Oct, and logs last 14 days. Its run summary and its audit record stay.', 'clock') + chainOf(FOLLOW, { Forecast: [`${mono('run_8d02')} · the 6 Oct run keeps its summary, not its logs`, 'Logs expired'] }),
    denied: () => banner('warn', 'One step needs a fresh sign-in.', FRESH, 'lock') + chainOf(FOLLOW, { Source: [`ISA statement, September · ${mono('src_1e08')}`, 'permission_denied'] }) + chipset(proposed('CT-01'))
  });

  /* ---------- one record ---------- */
  const RECORD = [['Audit id', mono('aud_4c17')], ['Scope', 'Prod'], ['Actor', 'Writer'], ['Operation', mono('publish_owner_confirmed_import')], ['Target', `${mono('evt_77d3')} and 11 more`], ['Commit', mono('cmt_2a61')], ['Source', mono('src_1e08')], ['Approval', mono('apr_52be')], ['Before', 'Ledger revision 210'], ['After', 'Ledger revision 211'], ['Reason', 'You approved this import'], ['Recorded', '6 Oct'], ['Economic date', 'Sep 2026'], ['Previous digest', mono('e4b0…91c2')], ['This digest', mono('5d2a…7f10')], ['Integrity anchor', 'None'], ['Retention', 'Account lifetime · POLICY-010']];
  const RECORD_X = [['Audit id', mono('aud_5b19')], ['Scope', 'Prod'], ['Actor', 'Nobody'], ['Operation', 'Not named'], ['Target', 'Statement import approval · draft revision 6'], ['Commit', 'None, no commit started'], ['Source', mono('src_2f7b')], ['Approval', mono('apr_6c03')], ['Before', 'Ledger revision 213'], ['After', 'None'], ['Reason', 'Approved 21:18, no commit started in its 15 minutes'], ['Recorded', 'Tue 21:33'], ['Economic date', 'None'], ['Previous digest', mono('e7a2…44d0')], ['This digest', mono('c19e…03ad')], ['Integrity anchor', 'None'], ['Retention', 'Account lifetime · POLICY-010']];
  const recBox = (rows = RECORD) => `<div class="aaudit-kv">${box(kv(rows))}</div>${claim()}`;
  const recBody = ctx => region(ctx, {
    what: 'This record', rows: 6, ok: () => recBox() + noEdit(),
    loading: () => skel(6),
    empty: () => stateCard('search', 'not_found', 'No record has this id in this environment. A record from dev never shows in prod.', bs('Back to the answer')),
    partial: () => banner('warn', 'Part of this record is unavailable.', 'The source reference resolves to a tombstone. Every other field stands.', 'clock') + recBox(RECORD.map(r => (r[0] === 'Source' ? ['Source', 'Evidence unavailable, tombstone recorded'] : r))) + noEdit(),
    error: () => banner('fall', 'Integrity check failed.', 'This record’s own digest still matches: it was written before the affected range, 28 Oct to 30 Oct. A lineage that includes it stays incomplete, because later steps read that range.', 'alert') + recBox() + noEdit(),
    stale: () => lagged() + recBox(),
    offline: () => off(ctx, 'Showing this record from 11:20.') + recBox(),
    conflict: () => banner('warn', 'Superseded, not changed.', 'A newer record points back at this one. This record stays exactly as it was written.', 'split') + recBox([['Superseded by', mono('aud_5a02')], ...RECORD]) + noEdit(),
    expired: () => banner('warn', 'This record is of an expiry.', 'The approval ran out on Tue at 21:33 with no commit started, so nothing changed. The record itself stays for your account’s lifetime.', 'clock') + recBox(RECORD_X) + chipset(proposed('CT-03')) + noEdit(),
    denied: () => banner('warn', 'You can read this whole record.', `Refused requests are recorded too, by reference. ${FRESH}`, 'lock') + recBox() + noEdit()
  });
  const recRail = () => `${box(`${lbl('Open questions on this record')}${text('Which actor an owner’s act records is open. It is drawn as You, Writer or Nobody here, and the actor list is not approved.')}${chipset(proposed('CT-03'))}`)}${refs()}`;

  /* ---------- who did what: the recorded changes ---------- */
  const CH = [
    ['eye-off', 'Export link issued', 'You · Wed 11:02 · revision 213', note('Export access')],
    ['clock', 'Watch Barclays', 'Nobody · expired Wed 08:14', hold('Expired'), proposed('MP40-Q9')],
    ['pause', 'US tech, 12 months paused', 'Code · Tue 21:20 · previous model not eligible', note('Automatic')],
    ['ban', 'Let the chat route add listings', 'Code · Tue 17:20 · would widen authority', fail('Refused', 'ban')],
    ['refresh', 'R1-LGB v2 reverted to v1', 'Code · Mon 22:20 · 2 bad weeks on probation', note('Automatic')],
    ['ban', 'Statement import approval revoked', 'You · Fri 30 Oct · before the commit started', note('Revoked')],
    ['check', 'R-0212 General account, Q3', 'Writer · 24 Oct · 18 rows · you approved', good('Committed')],
    ['check', 'R-0211 AstraZeneca dividend, typed', 'Writer · 21 Oct · 1 row · you approved', good('Committed')],
    ['check', 'R-0210 ISA statement, September', 'Writer · 6 Oct · 12 rows · you approved', good('Committed')]
  ];
  const chErr = () => CH.map((r, i) => [r[0], r[1], r[2], i === 5 ? fail('In the affected range') : hold('From 11:20, not vouched for')]);
  const chRows = (sel = -1, rows = CH) => list(rows.map((r, i) => rowGo(r[0], r[1], r[2], chipset(r[3], r[4]), '', i === sel)).join(''));
  const clocks = () => box(`${lbl('Two clocks')}${text('The economic date is when a thing happened. The recorded time is when MP learned it. They are asked separately.')}<div class="aaudit-gap">${kv([['R-0210, economic date', 'Sep 2026'], ['R-0210, recorded', '6 Oct']])}</div>`);
  const clockBar = (on = 0) => `<div data-mo="rise">${seg(['Recorded time', 'Economic date'], on, 'Which clock', 'full')}</div>`;
  const whoBody = ctx => region(ctx, {
    what: 'Recorded changes', rows: 7, ok: () => clockBar() + chRows() + text('Reverts by code are marked Automatic, and never read as your decision.'),
    loading: () => clockBar() + skel(7),
    empty: () => stateCard('shield', 'No recorded changes', 'Nothing has been recorded in this range. Silence is not a sign that nothing is wrong.'),
    partial: () => banner('warn', '3 of 4 sources answered.', 'Export access did not answer, so that row is missing from this page and shows as unknown.', 'clock') + clockBar() + chRows(-1, [['info', 'Export access', 'Unknown, not none', note('Not read')], ...CH.slice(1)]),
    error: () => stateCard('alert', 'Query incomplete', `${mono('INTEGRITY_INCOMPLETE')} Records from 28 Oct to 30 Oct cannot be vouched for, so that range is marked.`, trying()) + clockBar() + chRows(-1, chErr()),
    stale: () => lagged() + clockBar() + chRows(),
    offline: () => off(ctx, 'Showing recorded changes from 11:20.') + clockBar() + chRows(),
    conflict: () => banner('warn', 'New records arrived while you read.', 'This page stays at the place you opened, and a bounded page never reshuffles. Refresh to see them.', 'split') + clockBar() + chRows() + `<div class=\"aaudit-row\">${bs('Show the newer records', 'tinted', 'refresh')}</div>`,
    expired: () => banner('warn', 'Taiwan Semiconductor expired at 18:00.', 'Nobody acted, so it changed nothing. A proposal that expires ends here.', 'clock') + clockBar() + chRows(0, CH_X),
    denied: () => banner('warn', 'Refused and denied acts stay on the record.', `You can read them all. Acting on one needs a fresh sign-in where it lives. ${FRESH}`, 'lock') + clockBar() + chRows(3)
  });

  /* ---------- what this can prove, and what is missing ---------- */
  const claimBox = () => box(`${lbl('What the digests show')}${claim()}${text('Each record carries a digest of the one before it, so a check can show whether the chain still matches. No outside anchor exists yet, so it cannot show that nobody with deep access rewrote the chain.')}`);
  const CHECKS = (o = {}) => list((o.range ? rowAt('alert', 'Records from 28 Oct to 30 Oct', 'They do not match their digests', chipset(fail('Not vouched for')), 'fall') : '') + rowAt('check', 'Commits', 'R-0212, R-0211 and R-0210 finished whole', chipset(o.c || note('commit_completeness'))) + rowAt('refresh', 'Delivery', o.ds || 'Each of these reached what follows it', chipset(o.d || note('outbox_delivery'))) + rowAt('target', 'Restore', `Exercise ${mono('rx_0007')} passed, Sun 1 Nov`, chipset(o.r || note('Tombstones reapplied first'))));
  const orphanRow = (go = true) => rowAt('lock', 'Unmatched object', 'No receipt · quarantined · source_orphans', `${text('Audit only reads. What happens to this object is recorded in Files.')}${go ? `<div class="aaudit-gap">${inFiles()}</div>` : ''}`);
  const delNote = () => text('Deletion removes content only. Tombstones and audit records stay, and tombstones are applied before restored content is readable.');
  const gaps = ctx => region(ctx, {
    what: 'These checks', rows: 4, ok: () => claimBox() + sec('Is anything missing?') + CHECKS() + list(orphanRow()) + delNote() + noEdit(),
    loading: () => claimBox() + skel(3),
    empty: () => claimBox() + stateCard('check', 'No gaps found in what was checked', 'That covers only what the query read. Silence is not a sign that nothing is wrong.', bs('Check again', 'tinted', 'refresh')),
    partial: () => banner('warn', '3 of 4 sources answered.', 'Outbox delivery did not answer, so delivery is unknown, not fine.', 'clock') + claimBox() + CHECKS({ d: part('Unknown'), ds: 'Not read: outbox_delivery did not answer' }) + list(orphanRow()),
    error: () => banner('fall', 'Integrity check failed.', 'Records from 28 Oct to 30 Oct do not match their digests. This names the range, not a cause or an actor. Nothing here repairs a record.', 'alert') + claimBox() + CHECKS({ range: true, c: hold('From 11:20, not vouched for'), d: hold('From 11:20, not vouched for'), r: hold('From 11:20, not vouched for') }) + noEdit(),
    stale: () => lagged() + claimBox() + CHECKS({ c: hold('From 11:12'), d: hold('From 11:12'), r: hold('From 11:12') }) + list(orphanRow()),
    offline: () => off(ctx, 'Showing the checks from 11:20.') + claimBox() + CHECKS() + list(orphanRow(false)),
    conflict: () => banner('warn', 'Two records disagree.', 'A manifest and the index read differently for R-0212. Both stay as written. The manifest is the one used until the index catches up.', 'split') + claimBox() + CHECKS({ c: hold('R-0212 differs', 'split') }) + noEdit(),
    expired: () => banner('warn', 'Logs and traces run out. Audit does not.', 'Logs last 14 days, traces 30 and run summaries 90. These checks read audit records, so none has expired, and an answer that leans on an old log says so.', 'clock') + claimBox() + CHECKS(),
    denied: () => banner('warn', 'You can read every check.', `Opening a source behind one may ask. ${FRESH}`, 'lock') + claimBox() + CHECKS() + list(orphanRow()) + noEdit()
  });
  const gapRail = () => `${box(`${lbl('Rules, read only')}<div class="aaudit-gap">${kv([['Sampling', 'None'], ['Kept for', 'Account lifetime'], ['Paging', 'Bounded, no general scan']])}</div>${text('Which records are classed how, and how integrity is anchored, are not decided.')}${chipset(proposed('CT-03'), proposed('FIN-OD-08'))}`)}${refs()}`;

  /* ---------- option B: the explorer, with a lineage pane ---------- */
  const PANE = [['Source', `ISA statement, September · ${mono('src_1e08')}`, 'resolved'], ['Draft', '12 rows, as you approved them', 'resolved'], ['Approval', `${mono('apr_52be')} · you, 6 Oct`, 'resolved'], ['Before and after', 'Ledger revision 210 → 211', 'resolved'], ['Correction', 'None recorded', 'None'], ['Dependencies', '0 later events depend on these rows', 'None'], ['Risk', 'Read from this ledger at Tue 22:15 · cutoff 22:00', 'resolved'], ['Forecast', `${mono('run_8d02')}, ${mono('run_8c41')} and each run back to 6 Oct`, 'resolved'], ['Action', `Ranked action, decision support · ${mono('run_8d02')}`, 'resolved'], ['Outcome', 'Not scored: its horizon has not passed', 'Not yet'], ['Audit', mono('aud_4c17'), 'resolved']];
  /* an expired approval has its own short trail: it never reached the ledger, so nothing after it happened */
  const PANE_X = [['Source', `ISA statement, Oct 2026 · ${mono('src_2f7b')}`, 'resolved'], ['Draft', 'Revision 6 · 9 of 11 rows', 'resolved'], ['Approval', `${mono('apr_6c03')} · approved Tue 21:18, expired Tue 21:33`, 'Expired'], ['Before and after', 'No commit started', 'None'], ['Correction', 'None', 'None'], ['Dependencies', 'None', 'None'], ['Risk', 'Unchanged: nothing reached the ledger', 'None'], ['Forecast', 'None used it', 'None'], ['Action', 'None', 'None'], ['Outcome', 'None', 'None'], ['Audit', mono('aud_5b19'), 'resolved']];
  const pane = (over = {}, rows = PANE) => `${sec(over.t || 'Lineage of R-0210')}${chipset(over.c || good('Complete lineage'))}${chainOf(rows, over)}`;
  const CH_X = [['clock', 'Watch Taiwan Semiconductor', 'Nobody · expired Wed 18:00', hold('Expired'), proposed('MP40-Q9')], ...CH.slice(0, 2), ['clock', 'Statement import approval expired', 'Nobody · Tue 21:33 · no commit started', hold('Expired')], ...CH.slice(2)];
  const bar = () => `<div class="aaudit-bar" data-mo="rise"><span class="chip illus">${mono('recorded_changes')}</span><span class="chip illus">Account lifetime</span><span class="chip illus">Revision 213</span>${bs('Filter', 'tinted', 'sliders')}</div>`;
  const expBody = ctx => region(ctx, {
    what: 'Recorded changes', rows: 7, ok: () => bar() + chRows(8),
    loading: () => bar() + skel(7),
    empty: () => bar() + stateCard('shield', 'No records match', 'Nothing was recorded for these filters. Widen them. Silence is not a sign that nothing is wrong.', bs('Clear filters')),
    partial: () => banner('warn', '3 of 4 sources answered.', 'Export access did not answer, so it shows as unknown.', 'clock') + bar() + chRows(8, [['info', 'Export access', 'Unknown, not none', note('Not read')], ...CH.slice(1)]),
    error: () => stateCard('alert', 'Query incomplete', `${mono('INTEGRITY_INCOMPLETE')} Records from 28 Oct to 30 Oct cannot be vouched for, so the query gives no partial answer. The last good list stays, marked.`, trying()) + sec('Last good list, 11:20') + bar() + chRows(8, chErr()),
    stale: () => lagged() + bar() + chRows(8),
    offline: () => off(ctx, 'Showing recorded changes from 11:20.') + bar() + chRows(8),
    conflict: () => banner('warn', 'New records arrived while you read.', 'This page stays where you opened it, and a bounded page never reshuffles.', 'split') + bar() + chRows(8) + `<div class=\"aaudit-row\">${bs('Show the newer records', 'tinted', 'refresh')}</div>`,
    expired: () => banner('warn', 'An approval ran out.', 'It expired at 21:33 with no commit started, so nothing was committed. Its own short lineage sits with it.', 'clock') + bar() + chRows(3, CH_X),
    denied: () => banner('warn', 'Refused and denied acts stay on the record.', `You can read them all. ${FRESH}`, 'lock') + bar() + chRows(8)
  });
  const paneFor = ctx => region(ctx, {
    what: 'Lineage', rows: 7, ok: () => pane(),
    loading: () => skel(5),
    empty: () => text('Choose a record to see its lineage.'),
    partial: () => pane({ c: part('Source unavailable'), Source: ['Evidence unavailable · tombstone recorded', 'Source unavailable'] }),
    error: () => pane({ c: fail('Query incomplete'), ...allAs(PANE, 'Not vouched for', ['None', 'Not yet']), Forecast: [`${mono('INTEGRITY_INCOMPLETE')} · not answered`, '!Not answered'] }),
    stale: () => pane({ c: hold('From manifests, 11:12') }),
    offline: () => pane({ c: hold('offline_cached', 'wifi-off'), ...allAs(PANE, 'offline_cached') }),
    conflict: () => pane({ c: hold('superseded', 'split'), Correction: [`Superseded by ${mono('aud_5a02')}`, 'superseded'] }),
    expired: () => pane({ t: 'Lineage of this expired approval', c: hold('Expired approval') }, PANE_X),
    denied: () => pane({ c: hold('permission_denied on the source', 'lock'), Source: [`ISA statement, September · ${mono('src_1e08')}`, 'permission_denied'] }) + chipset(proposed('CT-01'))
  });
  /* a full screen says why: the pane beside the list leans on the list's own banner */
  const linWhy = ctx => ({
    empty: stateCard('search', 'not_found', 'This link points at nothing MP has recorded. No step is guessed.', bs('Back to Audit')),
    loading: banner('', 'Reading this lineage.', 'The last good copy is from 11:20.', 'clock'),
    partial: banner('warn', 'Lineage with an unavailable source.', 'The original was deleted with a tombstone. Its ledger events stay, marked evidence unavailable.', 'clock'),
    error: stateCard('alert', 'Query incomplete', `${mono('INTEGRITY_INCOMPLETE')} Records from 28 Oct to 30 Oct do not match their digests, so this gives no partial answer. No step below is vouched for. This names the range, not a cause or an actor.`, trying()),
    stale: lagged(),
    offline: off(ctx, 'Showing the lineage saved at 11:20.'),
    conflict: banner('warn', 'Superseded.', 'A newer record replaced this one after you opened it. You are reading the version you opened, pinned to revision 213.', 'split'),
    expired: banner('warn', 'This approval expired.', 'It expired on Tue at 21:33 with no commit started, so nothing was committed and no forecast used it.', 'clock'),
    denied: banner('warn', 'You can read this lineage.', `Opening the original is the part that may need more. ${FRESH}`, 'lock')
  }[ctx.state] || '');
  const paneLinks = ctx => (ctx.state === 'empty' ? '' : list(rowGo('split', 'Before and after', 'Opens Before and after') + rowGo('layers', 'Open full lineage', 'Opens Full lineage') + rowGo('shield', 'Read the record', 'Opens One record')));
  const gapLink = ctx => (ctx.state === 'empty' ? '' : list(rowGo('shield', 'Gaps and integrity', 'Commits, delivery, orphans and restore · opens Gaps and integrity')));
  const phoneJump = ctx => (wide(ctx) || ctx.state === 'empty' ? '' : list(rowGo('split', ctx.state === 'expired' ? 'Lineage of this expired approval' : 'Lineage of R-0210', 'Opens Full lineage · the steps follow the list')));
  const KINDS = Q.map(([, t, k], i) => [i === 0 ? 'Who changed this, from which document, what you approved, which forecasts used it' : t, k]);
  const kinds = () => `<div class="aaudit-kinds" role="radiogroup" aria-label="Kind of question">${KINDS.map(([t, k], i) => `<button type="button" role="radio" aria-checked="${i === 1}" class="aaudit-k${i === 1 ? ' on' : ''}"><span>${t}</span>${mono(k)}</button>`).join('')}</div>`;
  const field = (l, v) => `<div class="aaudit-f"><span class="label">${l}</span><span class="v">${v}</span></div>`;
  const filterSheet = ctx => { const s = ctx.state, go = s === 'offline' ? text('Filtering needs a connection. These are the saved filters.') : `<div class="aaudit-gap">${act('A01', 'Show these records', 'primary', 'search')}</div>`; return `<div class="sheet aaudit-sheet" role="dialog" aria-modal="true" aria-labelledby="aaudit-fl" data-mo="sheet">${wide(ctx) ? '' : '<div class="grabber"></div>'}<h4 id="aaudit-fl">Filter records</h4>${{ loading: banner('', 'Reading the list of kinds.', 'The saved filters stay.', 'clock'), empty: banner('', 'No filters set.', 'That reads the whole account lifetime, page by bounded page.', 'info'), partial: banner('warn', 'Export access is not answering.', 'You can still filter on the rest.', 'clock'), error: banner('fall', 'Filters did not load.', 'The saved filters stay. Query incomplete at 11:38.', 'alert'), stale: banner('warn', 'Index lagging.', 'Filters run on manifests until it catches up.', 'clock'), conflict: banner('warn', 'Your ledger moved to revision 214.', 'The pin stays on 213 until you change it.', 'split'), expired: banner('warn', 'A range this old has no logs or traces.', 'Audit records stay. Logs last 14 days and traces 30.', 'clock'), denied: banner('warn', 'Filtering needs no fresh sign-in.', FRESH, 'lock') }[s] || ''}${off2(ctx)}<div>${lbl('Kind of question')}<div class="aaudit-gap">${kinds()}</div></div>${field('From', 'Account start')}${field('To', 'Wed 4 Nov')}${field('This thing', 'Any')}${field('Pinned to', 'Ledger revision 213')}${text('Each page is bounded, so a wide range reads page by page. There is no general scan.')}${go}</div>`; };
  const off2 = ctx => (ctx.state === 'offline' ? off(ctx, 'Showing saved filters.') : '');
  const beforeAfter = (o = {}) => box(`${lbl('Before and after')}<div class="aaudit-gap">${kv([['Before', o.b || 'Ledger revision 210'], ['After', o.a || 'Ledger revision 211'], ['Before reference', mono(o.ref || 'ref_a3c0')], ...(o.noAfter ? [] : [['After reference', mono('ref_a3c1')]])])}</div>${text('References, not values. The figures themselves are in your ledger, so this never shows an amount.')}`);
  const cmpBody = ctx => region(ctx, {
    what: 'This change', rows: 4, ok: () => beforeAfter() + clocks() + `<div class="aaudit-row">${inFiles('Compare the revisions in Files')}</div>`,
    loading: () => skel(4),
    empty: () => stateCard('search', 'Nothing to compare', 'This record changed nothing, so it has no before and after. A refusal is like that.'),
    partial: () => banner('warn', 'Part of this is unavailable.', 'The after reference did not answer. It is unknown, not unchanged.', 'clock') + beforeAfter({ a: 'Unknown' }) + clocks(),
    error: () => banner('fall', 'Integrity check failed.', 'This record’s own digest still matches: it was written before the affected range, 28 Oct to 30 Oct. A lineage that includes it stays incomplete, because later steps read that range.', 'alert') + beforeAfter() + clocks(),
    stale: () => lagged() + beforeAfter() + clocks(),
    offline: () => off(ctx, 'Showing this comparison from 11:20.') + beforeAfter() + clocks(),
    conflict: () => banner('warn', 'Superseded.', 'A correction now follows this change. Each stays as it was written, and the newer one points back here.', 'split') + beforeAfter() + box(`${lbl('Correction')}${text('Recorded after this change. Open it to compare it in turn.')}<div class="aaudit-gap">${bs('Open the newer record', 'tinted', 'layers')}</div>`) + clocks(),
    expired: () => banner('warn', 'This approval expired.', 'It expired at 21:33 with no commit started, so there is no after.', 'clock') + beforeAfter({ b: 'Ledger revision 213', a: 'None, no commit started', noAfter: true, ref: 'ref_b7e2' }) + box(`${lbl('Two clocks')}<div class="aaudit-gap">${kv([['Recorded', 'Tue 21:33'], ['Economic date', 'None: nothing reached your ledger']])}</div>`),
    denied: () => banner('warn', 'You can read this comparison.', FRESH, 'lock') + beforeAfter() + clocks()
  });

  J.add({
    id: 'audit', title: 'Audit', stories: ['MP-64', 'MP-44', 'MP-76', 'MP-151', 'MP-96'],
    summary: 'Who changed what, from which document, what you approved and what used it. Audit only reads. It holds references, never holding values, and it stays open at every cost threshold.',
    options: [{
      id: 'a', name: 'Ask a question', rec: true,
      why: 'You come to audit with a question, so it starts from one and answers in the question’s own parts. You need no knowledge of how records are stored.',
      cost: 'A question you did not expect means reading the recorded changes instead. Browsing is one screen, not the main view.',
      covers: { compare: 'a-who', decide: 'n/a: audit is read-only. Approve and reject live in Approvals and configuration and in Files and imports, and each decision lands here as a record.', source: 'a-follow', correct: 'n/a: a record is never corrected here. A correction is a new record, made in Files and imports, and it points back at this one.', config: 'n/a: audit reads configuration changes and makes none. They are made in Approvals and configuration, and show in recorded changes.', cost: 'n/a: audit holds references, never amounts. Cost is reconciled in Costs and budgets.', recover: 'a-gaps' },
      screens: [{
        id: 'a-ask', title: 'Ask the record', note: 'Denied acts sit under recorded_changes by inference from FIN-AP-04.',
        render: ctx => frame(ctx, { title: 'Audit', back: 'Admin', body: askBody(ctx), rail: refs() })
      }, {
        id: 'a-answer', title: 'The answer', note: 'An amount never appears: audit holds references only. The ids aud_, src_, evt_, cmt_, apr_52be and apr_6c03 are minted for this drawing.',
        render: ctx => frame(ctx, { title: 'Answer', back: 'Audit', body: ansBody(ctx), rail: ansRail() })
      }, {
        id: 'a-follow', title: 'Follow the chain',
        render: ctx => frame(ctx, { title: 'The chain', back: 'Answer', body: follow(ctx), rail: refs() })
      }, {
        id: 'a-record', title: 'One record', note: 'The fields of AuditEvidence, in plain names. The operation name is the only one the examples give, and no list of them is approved.',
        render: ctx => frame(ctx, { title: 'Record', back: 'Answer', body: recBody(ctx), rail: recRail() })
      }, {
        id: 'a-who', title: 'What changed', note: 'Rows are the owner journeys’ record. Taiwan Semiconductor added and R2-HGB v4 promoted are left out, because admin home still shows both waiting.',
        render: ctx => frame(ctx, { title: 'What changed', back: 'Audit', body: whoBody(ctx), rail: clocks() + refs() })
      }, {
        id: 'a-gaps', title: 'What this can prove',
        render: ctx => frame(ctx, { title: 'What it can prove', back: 'Audit', body: gaps(ctx), rail: gapRail() })
      }]
    }, {
      id: 'b', name: 'Explorer',
      why: 'Every recorded change is one filterable list, with the lineage of the chosen record beside it. It suits a question you cannot yet put into words, and a sweep across a period.',
      cost: 'You build the question yourself from filters and record names. A phone shows the list and the lineage one above the other.',
      covers: { compare: 'b-compare', decide: 'n/a: audit is read-only. Approve and reject live in Approvals and configuration and in Files and imports, and each decision lands here as a record.', source: 'b-lineage', correct: 'n/a: a record is never corrected here. A correction is a new record, made in Files and imports, and it points back at this one.', config: 'n/a: audit reads configuration changes and makes none. They are made in Approvals and configuration, and show in this list.', cost: 'n/a: audit holds references, never amounts. Cost is reconciled in Costs and budgets.', recover: 'b-gaps' },
      screens: [{
        id: 'b-explore', title: 'Recorded changes and lineage', note: 'The Approvals journey’s promise, "the full audit sits in the admin area, for search across all of them", lands here. On iPad and desktop the lineage sits beside the list.',
        render: ctx => frame(ctx, { title: 'Audit', back: 'Admin', body: expBody(ctx) + gapLink(ctx) + phoneJump(ctx), rail: paneFor(ctx) + paneLinks(ctx) })
      }, {
        id: 'b-filter', title: 'Filter records', note: 'The fields are AuditQuery’s: kind, dates, the thing asked about, the pinned revision.',
        render: ctx => frame(ctx, { title: 'Audit', back: 'Admin', body: bar() + chRows(8), sheet: filterSheet(ctx) })
      }, {
        id: 'b-lineage', title: 'Full lineage', note: 'Partial assumes this record’s original was deleted. Files’ own deleted example is the ISA statement of January 2024.',
        render: ctx => frame(ctx, { title: 'Lineage', back: 'Audit', body: linWhy(ctx) + (ctx.state === 'empty' ? '' : paneFor(ctx)) + (['empty', 'partial', 'expired'].includes(ctx.state) ? '' : `<div class="aaudit-row">${inFiles('Open the source in Files')}</div>`) + (ctx.state === 'conflict' ? `<div class="aaudit-row">${bs('Read the newer record', 'tinted', 'layers')}</div>` : ''), rail: refs() })
      }, {
        id: 'b-compare', title: 'Before and after', note: 'An explorer keeps the two clocks side by side, because the same record reads differently on each.',
        render: ctx => frame(ctx, { title: 'Before and after', back: 'Audit', body: cmpBody(ctx), rail: refs() })
      }, {
        id: 'b-record', title: 'One record', note: 'The fields of AuditEvidence, in plain names. No list of operations is approved. The ids aud_, src_, cmt_, apr_52be and apr_6c03 are minted for this drawing.',
        render: ctx => frame(ctx, { title: 'Record', back: 'Audit', body: recBody(ctx), rail: recRail() })
      }, {
        id: 'b-gaps', title: 'Gaps and integrity',
        render: ctx => frame(ctx, { title: 'Gaps and integrity', back: 'Audit', body: gaps(ctx), rail: gapRail() })
      }]
    }]
  });
}
