# MP-64 round 4, lane s

Snapshot `1fd5ff6`, delta `af66cc0..1fd5ff6` and its direct joins. Read only. Nothing in the repository, Jira or Confluence was changed; mutation runs were made on a `git archive` copy in my scratch folder.

Files with no change in the delta, so not reviewed beyond their joins: `docs/design/admin/README.md`, `build.py`, `scripts/design_gates.py`, `design_journeys_check.mjs`, `design_journeys_facts.mjs`, `design_runtime.mjs`, `review_checks.py`, `.github/workflows/verify.yml`, `docs/planning/trace.json`, `gap-register.json`.

Checked and clean:

- `index.html` rebuilds byte for byte from `src/` at `1fd5ff6` (scratch copy).
- Counts in `decision.md`: 110 screens, 82 actions, 19 refused.
- A81 and A82 are drawn, and A82's tombstone and PH02-S03 deletion row stand up.
- SCI-D03 exists.
- Jira MP-163 carries the new acceptance sentence, read back through the Atlassian connector.
- The PH-07 receipt says match on version 6.
- Selftest cases added to `design_admin_facts.mjs` name the rule they expect.

### R4-s1 · P1 · blocking · docs/design/admin/src/journeys/incidents.js:35

**inc_0014, the worst incident on the page, is the only one that cannot be opened, acknowledged or resolved.**

Evidence:

- `I14` is used only by `statusOf`, `incRows` and `nowBand` (:40, :42, :306). `inc(ctx)` (:36) returns I13 or I12, so `a-detail` and `b-escalate` in Conflicting show inc_0012.
- `a-list` conflict draws "Production recorded lost inc_0014 · A restored copy waits in Recovery Open" through `opens()`, a chevron and `role="button"`, on every device. Nothing is drawn behind it: lesson 28.
- The status is Open, and no A40 Acknowledge, A75 Resolve or recorded resolution exists for it anywhere. inc_0013, also Open, gets `ackTool` and "waits for you to acknowledge it".
- PH08-S05: "The owner acknowledges and resolves them" and "An incident closes only with a recorded resolution". The states are open, acknowledged, mitigated, resolved, reopened. The line under the row repeats "You acknowledge and resolve them".
- The owner's answer "Yes, acknowledge only (Recommended)" gives a phone this act. A phone in this state has nothing to press for the incident that matters most.
- After A42 Approve this switch, nothing says how inc_0014 ends: lesson 45.
- R3-s5 proved the row, the id and the chip are present, not that the row leads anywhere.

Correction: draw inc_0014's own record in Conflicting. `a-detail`, and `b-escalate` for the unpicked option, take a heading with id, class Not classed and Proposed CT-14, then a timeline of Detected, Acknowledge (A40, live on a phone), Switch in Recovery (A42), Resolve (A75 with recorded resolution). The row's sub line and rail link point to it. Keep inc_0012's Reopened screen as a second row, or make it the view reached from the second row. Add a press or fact check that the row's destination names inc_0014.

### R4-s2 · P2 · blocking · docs/design/admin/src/journeys/runs.js:38

**Runs tells a different story of inc_0012 from Incidents in Conflicting and Partial (lessons 27, 31, 46).** R3-s3 fixed the link from Incidents into Runs. The way back is still wrong.

Evidence, same state chip on both sides:

- Conflicting status, three answers for one record. `incidents a-list` and `a-detail`: "Reopened". `runs a-clock` (`hsbc()` default, :38, called by `ranOK` :41): "HSBC price late inc_0012 · detected Tue 16:50 Acknowledged". `runs a-recover` (:157): chip "Disagreement", which is not a PH08-S05 state, with "a quality incident stays open".
- Partial, what did not answer. `incidents a-list` and `a-evidence`: "The UK run record did not answer ... Alerts and sources answered." `runs a-clock`: "The UK record did not". `runs a-recover` (:153): "The incident answered and the source receipt did not". That screen then prints the unread run's story as read: "Collect found no newer price", "Retried at +40 Still none".

Correction:

- `a-clock` conflict passes `hsbc(WARN('Reopened', 'refresh'))`.
- `a-recover` conflict uses `lateHead(WARN('Reopened', 'refresh'))` and keeps the disagreement in its banner.
- `a-recover` partial reads "The incident answered and the UK run record did not, so the cause below may be incomplete", with the collect, retry and freeze rows shown as not read.
- Add a check that compares the status in Runs and Incidents across every state by following the id (lesson 31).

Reported here because it joins into Incidents. The file is lane m's.

### R4-s3 · P2 · blocking · docs/design/admin/src/journeys/home.js:21

**The picked Admin home never says production is recorded lost (AGENTS.md "Never hide risk", lessons 27, 38).**

Evidence:

- Round 3 added "Production recorded lost · HSBC price late, reopened" to `FIRST.conflict` (:26), which only Option A draws.
- The owner picked B. `b-home` conflict reads "Incidents and recovery 2 not resolved · last restore passed". Its banner leads with "Settings changed while you read" and ends "2 incidents not resolved". The word production does not appear.
- The tile's "last restore passed" is the only recovery fact in view, and it reads as reassurance in the one state where the restored copy waits for a switch.
- On iPad and desktop `bBody` drops `topOf` from the body, so the tile is the first thing read there.

Correction: `conflict.incidents` becomes "Production recorded lost · 2 not resolved", with its Proposed · CT-14 label, and the conflict banner names it first. Extend R3-s5 to `home b b-home` on all four devices.

### R4-s4 · P2 · blocking · docs/design/admin/src/journeys/identity.js:167

**The revoke sentence is missing where a passkey is actually at stake, because R3-s1 checks a hand list of screens (lessons 7, 31, 44).**

Evidence, a scan of every Identity view with a Revoke step or control and without "What a revoke does to a passkey held on that device is not recorded.":

- `a-lost` empty on iPhone, iPad and phone web: "Your Mac is lost" with "Revoke Mac, Safari" as a primary button. The Mac holds the only passkey that counts, and `macCard` is skipped for `empty` (:178), so the line is absent exactly here.
- `a-lost` on desktop in 8 states: default, empty, partial, error, stale, offline, conflict, expired. `macCard` returns nothing on `web`, and `lostSteps` has no line.
- `b-lost` has the same pattern, 11 views. `b-devices` error has it on 4 devices. Both are unpicked.
- R3-s1 lists `a-lost` on three kinds in default only, and `b-*` on web only. It passes on all of the above.

Correction: put the sentence in `lostSteps` beside the revoke step, all branches, so it travels with the act, and drop it from `macCard`. Change the check to walk every Identity view holding a live A49 and require the sentence.

### R4-s5 · P2 · blocking · docs/planning/story-readiness-2026-11-03/stories/PH-07.json:147

**The phrasing R2-s7 and R3-s9 removed survives in another form in the same stories, and the check cannot see it (lessons 1, 3, 4).**

Evidence:

- `PH-07.json` lines 11, 147, 217, 482, 616: "no TestFlight, Apple push or Sign in with Apple until the owner says." That is the authority text of MP-168, MP-164, MP-167 and MP-163, plus a draft.
- It is live in Jira. MP-163's "Who may do what", read back today, says it, directly under the sentence fixed to "until the Developer Program is bought (MP-179)". MP-164's own negative acceptance says "until the Developer Program is bought".
- `docs/confluence/build_pages.py:967` and the published `pages/rec-apple-testing.html`: "until the owner says when".
- The owner's question was exactly this one. "I'll join the Developer Program" has been said, so read literally the bar is lifted, and "The purchase (Recommended)" says it is not.
- R3-s9's and R2-s7's check is `lacks(t, /says to join/)`, one phrasing.

Correction:

- Replace the sentence with "until the Developer Program is bought (MP-179)" in all five places and in the generator.
- Add a check for `/until the owner says/`, or add it to `retired-facts.json`.
- Re-sync Jira MP-163, MP-164, MP-167 and MP-168 and Confluence `rec-apple-testing`, each with read-back and each with the owner's yes (`jira-flow.md`).

### R4-s6 · P2 · blocking · docs/design/admin/src/journeys/incidents.js:168

**The Replay screen says the request is inside the allowlist and, in the same card, that nobody knows whether it is (lessons 36, 47).**

Evidence, `a-replay` default: "Reason inc_0012 · late price, no newer price found", "Your approval Not needed, inside the allowlist", then the new "Whether a late price counts as a missed collection is open. Proposed · CT-14", then "Nothing waits on you" and "Not needed. This request is inside the allowlist, so code runs it and nothing waits on you."

- PH08-S06 allows "re-run a missed collection", and "Code acts only within the allowlist. The owner approves anything else". The note itself names that act as the one in question, and the screen does not rest the request on any other allowlist act.
- So round 3's note is true, and it makes the rows around it unsupported. The screen hands code an authority it says is undecided.
- `a-detail` still says "Code re-runs the collection, within its bound" (:116).
- `b-replay` (unpicked) has neither the note nor any doubt: step 1 "inside the allowlist" is Done (:336).
- Removing the note fails no check: see R4-s13.

Correction:

- `REQ.default`, `.empty`, `WHYNOT.default` and the `a-detail` Mitigate line state it conditionally, for example "Your approval: Not needed if a late price counts as a missed collection (CT-14)", and "Nothing waits on you" becomes "Nothing waits on you if CT-14 says so". The alternative is to redraw inc_0012 as a genuinely missed collection.
- Repeat in `b-replay`.
- Add a check that the note and the conditional hold in every non-error state.

### R4-s7 · P2 · non-blocking · docs/design/admin/src/journeys/identity.js:238

**"Revoking needs no iPhone passkey" disagrees with the owner Privacy journey, and the disagreement is not on the page's list (lessons 31, 47; `plan-sync.md` rule 3).**

Evidence: `docs/design/journeys/src/journeys/privacy.js:328` draws the lost-device button "Revoke with a passkey" on every device, and :316 has the iPhone arriving by "Your iPhone passkey". Identity draws the same act as "Revoke iPad, Asks for a fresh sign-in" and says no iPhone passkey is needed. `OPEN` in `shell.js` records only the replacement difference ("Privacy lands a replacement passkey on the new device").

Correction: extend that `OPEN` row, for example "Privacy revokes with a passkey, and on iPhone its way in is the iPhone passkey. Identity asks for a fresh sign-in by Google or the Mac passkey." with "Drawn as Identity says, while MP-164 holds". The owner journey stays as it is.

### R4-s8 · P2 · non-blocking · docs/design/admin/src/journeys/identity.js:139

**Three new open questions sit on screens with no question recorded, and one tells the owner "until you answer" (lesson 36; `plan-sync.md` rule 3).**

Evidence:

- `a-enrol` on phone web: "Whether a browser passkey on a phone counts is not recorded, so enrolling is drawn on the Mac alone until you answer." The screen note repeats it.
- No such question exists in `OPEN` or `docs/planning/`, and neither CT-17 nor PL-09 names it, so the owner has nowhere to answer.
- A48's `phone_note` (`permissions.json:576`) and `decision.md` ("Enrolling a passkey stays off while MP-164 holds") still give MP-164 as the only reason, which a-enrol now says is not the reason on phone web.
- "Whether a late price counts as a missed collection is open" and "How production comes to be recorded lost is not recorded" are also missing from `OPEN`. Only the revoke question was added.

Correction:

- Add the three rows to `OPEN`.
- Change A48's note to "Mac only: MP-164 on the app, an open question on phone web".
- Change the `decision.md` sentence to match.

### R4-s9 · P3 · non-blocking · docs/design/admin/src/shell.js:16

**R3-s7's fix leaves the phone's Link Google screen pointing two ways.**

Evidence, `a-link` on iPhone, top of the body: "Account recovery works here. Other changes happen on iPad or desktop." Below it: "Link Google: on your Mac: the proof needs your Mac passkey". The iPad says the iPad cannot do it. The two colons come from the `replace` in `act()`.

Correction: in `act()`, render `${label} on your Mac: ...`. In `frame()`, name the Mac in `offNote` when the screen's only off act has a `phone_note`.

### R4-s10 · P3 · non-blocking · docs/design/admin/src/journeys/incidents.js:126

**Partial still claims a link through the record that did not answer.**

Evidence: `a-evidence` partial shows "Run run_8cf7 · UK · not read" and directly below it "Trace Linked from run_8cf7", under a banner saying "The other links opened".

Correction: add `trace: ['search', 'Trace', 'Not read, it links from run_8cf7']` to the partial override, with the warn tone.

### R4-s11 · P3 · non-blocking · docs/design/admin/src/journeys/incidents.js:399

**The note "run_8bf3 is minted here." is out of date and reads as a maker's aside.**

Evidence: `runs.js:40` draws the same run, "Forecast run, Mon 2 Nov 16:50 run_8bf3 · UK", in `a-clock`. The note shows on the Compare and pick card the owner reads.

Correction: delete the sentence, or say "run_8bf3 is illustrative".

### R4-s12 · P3 · non-blocking · Jira MP-64, comment 12354

**The issue's last word is out of date (`jira-flow.md` habit 3).**

Evidence: read today, the latest comment, 21:09, says "Jira MP-163 and Confluence PH-07 need the owner's yes, so the confluence-receipts check shows ph-07 pending". MP-163 changed at 21:12 and PH-07 v6 was read back at 21:13. The owner's "Allow it (Recommended)" and commit `1831d7d` appear on no comment.

Correction: the round 4 comment records them. Comment before the round closes.

### R4-s13 · P2 · non-blocking · tests/admin_facts/s.mjs:177

**Round 3's fixes are held only in part. Undoing several of them fails no check (lessons 2, 34).**

Evidence: I reversed 14 of the delta's changes one at a time in a scratch copy, rebuilt, and ran `design_admin_facts.mjs --facts`.

Caught:

- Dropping `Not classed` or the `nowBand` row: R3-s5.
- Reverting `act()`'s phone note: R3-s7.
- Dropping the Mac card sentence: R3-s1.

These show the method bites. Nothing failed for:

- `gone()` reverted.
- The Waiting on MP-179 chip dropped from `devRows`.
- The `a-replay` open note removed.
- `WHY12` back to "missed collection".
- A `still` partial row back to "job link unavailable".
- `still` Production row dropped.
- The `T_BOOK` conflict sentence reduced.
- The new `OPEN` revoke row dropped.
- The `covers.cost` wording reverted.
- The `a-enrol` note reverted, the screen note that says phone web waits on a different question.

That is 4 caught and 10 not.

I could not map each one to a ledger entry, because `fixed.json` holds only the start of each finding and the fix records are off limits to me. So some may be tidying rather than a blocking fix, which is why this is non-blocking.

Correction: for each change that closes a blocking finding, add the assertion to that finding's fact. The `a-replay` note, `WHY12` and `still` Production come first, because they carry the open question in Replay and the risk in Conflicting.

## Counts

13 findings: 0 P0, 1 P1, 8 P2, 4 P3. Blocking 6: R4-s1, s2, s3, s4, s5, s6.
