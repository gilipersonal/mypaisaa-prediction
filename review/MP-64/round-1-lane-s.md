# MP-64 round 1, lane s: findings

Snapshot reviewed: commit 6705fc1 (HEAD 49f1c7d changes only review records). Read-only: nothing edited. Paths are under `docs/design/admin/` unless they start otherwise.
Counts: P0 0, P1 6, P2 13, P3 4. Blocking 11, non-blocking 12.

## Blocking

### R1-s1 · P1 · blocking · `src/journeys/identity.js:156`, `:160`, `:35`; `permissions.json:574`; `docs/design/reviews/MP-64/decision.md:20`
**The owner's "phone keeps recovery" cannot finish on any phone, and the inventory says it can.**
Evidence:
- The owner was asked whether a phone may still run recovery when other devices are gone: "Yes, recovery only (Recommended)".
- `permissions.json` marks A48 Enrol a passkey `phone: live`, the inventory prints "Yes", and decision.md says enrolling stays live. A walk of every phone screen in every state finds A48 live on none. `a-enrol` says "Drawn as a control on the Mac only".
- `a-lost` step 3 on iPhone, iPad and phone web reads "Enrol the replacement from your Mac. This device cannot hold one yet."
- `gone()` returns only iPad or Phone web, so the Mac is never the lost device, though it holds the only countable passkey and is where every enrolment happens. If the Mac is gone, step 3 points at it anyway (lesson 28).
- The state that matches the owner's question, `a-lost` empty ("No trusted device is left"), draws no revoke, no enrol and no cancel on the phone, only "Follow your written steps". The lost devices stay signed in. PH02-S02 needs the owner to revoke them from another path.
Correction: set A48 to `phone: off` until MP-179 and PL-09 settle it, or draw it live, and make permissions.json, decision.md, the inventory and `a-enrol` agree. Draw a lost-Mac case. Keep revoke and cancel live in the empty state. Add a question to the page's open list: what does recovery end with on a phone while MP-164 holds? Add a gate: every `phone: live` action is live on at least one phone screen.

### R1-s2 · P1 · blocking · `src/journeys/incidents.js:174-176`, `:25`; picked screen `a-replay`
**Replay offers Approve with nothing to approve, including on an expired request.**
Evidence:
- `can()` holds a control only in loading, offline, stale, conflict, denied and partial. `empty`, `default` and `expired` fall through to live buttons (`node scripts/design_admin_text.mjs incidents a a-replay <state> web`).
- Empty: "Nothing to replay. No request is open and nothing is awaiting you", then "Approve this replay" and "Approve reprocessing".
- Default: the request says "Your approval: Not needed, inside the allowlist" and Items 1, then both Approve buttons, with "You approve the exact scope above".
- Expired: "Your approval ran out ... It needs a new request and a new approval", then both Approve buttons. PH02-S03: an expired approval "is refused and needs a fresh approval".
- Approve reprocessing (A13) reaches the ledger, and no state shows the exact change, payload hash, expected version or expiry that PH02-S03 binds. Files and Agents both draw that binding. "only the exact change you approved" has no change on screen.
- Only `error` is a real "awaiting the owner" state. The story's "replayed" outcome is drawn nowhere in this journey, so an approved replay has no end state (CT-16: observable states for each sensitive action).
Correction: draw each Approve only on a request awaiting the owner. Elsewhere say why not, with one reason per state. Add the binding card before A41 and A13. Draw "replayed". Add a gate that no `A13`, `A41` control appears in empty, or in expired for the same request.

### R1-s3 · P1 · blocking · `src/journeys/incidents.js:205`; picked screen `a-recovery`
**"Approve this switch" is live when production is fine and when the copy is known to be behind.**
Evidence:
- Default: production is healthy, the only copy mentioned is exercise rx_0007 from Sun 1 Nov, and "Approve this switch" is live. The held line "No reconciled copy waits" appears only in error and empty, so default implies one does.
- Expired: "rx_0007 no longer covers what is stored now", and the button stays live.
- The control names no target: no copy id, as-of point, what would be lost, or expected version. PH08-S03 says only that the owner approves a switch after reconciliation passes. PH02-S03 says an approval binds the exact target.
- This act moves authority over the ledger, and it is one press with step-up still `open`.
Correction: hold A42 unless production is recorded lost and a reconciled copy exists. Add one state or sheet that names the copy, its as-of time and the gap, and shows the binding. In default say "Production is not lost, so there is nothing to switch."

### R1-s4 · P1 · blocking · `README.md:10`; `permissions.json`; `src/shell.js:7`; `scripts/design_admin_facts.mjs:48`
**The inventory does not list every admin action, the README's guarantee is false, and phones can press changes.**
Evidence: README says "Screens draw controls from it, so a screen cannot grow an action it does not list". Journeys also draw `btn()` and `bs()`, which no gate reads. Walking every screen found these, none in `permissions.json`:
- "Retry safely" (`files.js:104`, `:126`): repeats an approved ledger commit, with no step-up word. Live on iPhone and phone web although A07 and A10 are off there.
- "Run the check", "Run the check again", "Run again" (`approvals.js:97`, `:100`, `:101`, `:167`, `:218`, `:223`): a coverage probe whose 8 credits are reserved (`approvals.js:97`). Live on phones. `approvals a aa-listing conflict iphone` shows it under "Read and acknowledge here. Changes happen on iPad or desktop."
- "Resume" (`identity.js:159`): PH02-S02 says a recovery "is resumed or cancelled"; A50 lists cancel only.
- "Refresh preview" and "Check again" may be reads, but the inventory should say so.
This breaks "A permission inventory lists every admin action" and "phones read only". The phone gate reads `data-act` only, so it passes.
Correction: add these as actions with step-up, audit and phone values, or mark them as reads, and draw them through `act()`. Add a marker for plain navigation and a gate refusing any other button outside `act()`. Correct the README line. The owner should hear of "Retry safely" and "Run the check" on a phone as a choice.

### R1-s5 · P1 · blocking · `src/journeys/incidents.js:346`; `src/journeys/identity.js` covers of option a; `src/shell.js` showCoverage
**"Approve and reject" is claimed for Incidents, and nothing can be rejected.**
Evidence: `covers.decide` is `a-replay`, and the Coverage page prints it under "Approve and reject". `incidents.js` holds no reject, decline or "not now" control, on any screen in either option. The inventory has no such act: A41, A13 and A42 are approvals only, and "refused" in PH08-S06 is code's outcome. Identity A names `a-link`, which has Link Google only. The facts gate proves a cell names a screen, not that the screen does the thing.
Correction: add a decline act for a replay and a switch, with step-up and audit values and a recorded outcome. In Identity, draw a decline or make the cell an n/a with its reason. Add both to the inventory.

### R1-s6 · P1 · blocking · `docs/planning/ma-reconciliation-2026-11-02/gap-register.json:1820`; `permissions.json:2`; `src/journeys/home.js:16`; `src/shell.js:99`
**The maker's reading is recorded as the owner's words (lesson 23).**
Evidence: the owner said "Under Settings, phones read only" and "Yes, recovery only (Recommended)". Both `owner_answer` in CT-16 and the `about` of permissions.json state, as "Owner, 4 November 2026", that phones "read and acknowledge". decision.md:20 does say the line is the maker's reading, but these two records do not, and they are the ones later work will cite. A40 also makes "resolve", a write, live on a phone, and the incident screens tell the owner "Read and acknowledge here".
Correction: put the owner's exact words in both records. Mark acknowledge and resolve on a phone as proposed, with a question to the owner, as `decision.md` already implies. Say the same on the page.

### R1-s7 · P2 · blocking · `src/journeys/home.js:16`; `src/shell.js:99`; `permissions.json:502-514`
**"Recovery" has two meanings, and one was chosen without saying so.**
Evidence: Home says "recovery works anywhere". On a phone, the journey named Incidents and recovery has a Recovery screen where restore switch, replay, reprocessing and pause are all "on iPad or desktop" (`incidents a a-recovery default iphone`). The owner's question was about a phone "when other devices are gone". If he meant service recovery too, A13, A41, A42 and A43 are wrong on phones. decision.md's caveat does not name this, and it is not in the page's open list.
Correction: add the question to `OPEN` and the issue, as plan-sync rule 3 asks, and reword Home to "account recovery" until answered.

### R1-s8 · P2 · blocking · `permissions.json:502`, `:514`, `:249`, A03, A06, A09
**Six rows do not map to an audit record, which is a Done-when of MP-64.**
Evidence:
- A42 reads "RecoveryExercise; AuditEvidence read". That copies PH08-S03's contract roles: the exercise writes RecoveryExercise and reads AuditEvidence. So the inventory names no record of the owner's switch, the highest-consequence act here.
- A43 and A21 say "Open", and A06 "Open (CT-03)". A09 is "Open (records revoked_at)", though `revoked_at` is a schema field. A03 says "None named". CT-03's acceptance already requires evidence for "administrative changes".
Correction: A42 becomes OwnerApproval and AuditEvidence, class open (CT-03). The others follow the form of A05 and A14: a named record, with class open.

### R1-s9 · P2 · blocking · `permissions.json:237`, `:273`, `:285`; `src/shell.js:345`
**Step-up marks contradict the page's own definition.**
Evidence: the page says "Open means no record says". PH02-S03's matrix names "deletion", and so does CT-01's recommendation, yet A20 Delete a stored export and A23 Forget a memory note (which writes a DeletionTombstone) are `open`. A16 is Yes. A24 "Approve a route model, tool or budget change" is `open` on the page, while the step-up for budget sits only in `step_up_note` ("Yes under 34"), which the page does not print; PH02-S03 names budget expansion. Its label also reads against R14, "Any settings change granting a route a tool, source, budget". The Agents screen treats it as a reviewed manifest change, not a setting, but the inventory row does not say so.
Correction: A20 and A23 become Yes, or "named by PH02-S03, level open". Split A24 so budget is Yes, and state on its row how it differs from R14.

### R1-s10 · P2 · blocking · `src/journeys/incidents.js:144`; joins `runs.js:79`, `:91`, `costs.js:243`, `:249`
**A run fails before it starts (lessons 26, 37).**
Evidence: `a-evidence` in error shows run_8d02 "Started Tue 21:15", "Failed at 21:14". Incident and Twelve Data failure are at 21:14. Runs draws "Collect started 21:15" for the same job, and Costs prints Started 21:15 with Failed at 21:14. The owner journeys say "Twelve Data failed at 21:14" but do not give that run a 21:15 start, so the clash is admin's.
Correction: keep the owner wording. Drop "Started" for the failed run or give it a start before 21:14, wherever that run appears, and add a fact check.

### R1-s11 · P2 · blocking · `src/journeys/incidents.js:178`, `:346`
**Cost reconciliation is claimed where the screen disclaims it.**
Evidence: `covers.cost` is `a-replay`. Its card says "no spend is joined to this request here", and shows only the credit rate plus a link. Nothing reconciles a replay's estimate, usage and bill. Option B does the same. MP-64 asks each journey for cost reconciliation.
Correction: draw one replay's reservation against its usage, or make the cell an n/a with a reason, naming the screen in Costs that does it.

## Non-blocking

### R1-s12 · P2 · `src/journeys/identity.js:23`, `:130`, `:172`; `src/journeys/incidents.js:19-23`
One sentence covers every conflict, so a screen gives two reasons. `a-link` and `a-lost` conflict say "The email matches, the account does not", then "Refused for a stale revision. Refresh, then decide." Refreshing cannot fix an email mismatch. `a-recovery` conflict is about Terraform drift and says the same. Correction: let each topic give its own held line.

### R1-s13 · P2 · `src/shell.js:68`
The freshness chip has no conflict case, so it reads "Records current · 11:40" on screens saying "Your view stays at that version" and "A newer record says Reopened". This overclaims (lesson 39; AGENTS.md on staleness). Correction: add a conflict chip, such as "Older version · a newer record exists".

### R1-s14 · P2 · `src/journeys/identity.js` T_LOST denied
The story's "locked out" state is drawn inside the signed-in app, with back button, tab bar and "Records current · 11:40" (screenshot taken). Someone with no path cannot see this frame. Correction: draw it signed out, as Privacy's sign-in frame does, with no records and no tabs.

### R1-s15 · P2 · `src/journeys/identity.js:39`; `src/shell.js:295`; `docs/design/reviews/MP-64/decision.md:18`; decision-log line 291
MP-164 says "until the owner says to join the Developer Program". The owner said "I'll join the Developer Program". The page, decision.md and the decision log restate the bar as lasting until it is bought. That may well be right, since on-device passkeys need the paid team, but it is a reading of the story, not its words (lesson 23; plan-sync rule 3). Correction: quote MP-164, and ask whether his answer lifts the bar or the purchase does. Update PH07-S03's wording to match the answer.

### R1-s16 · P2 · `src/journeys/identity.js:57`, `:69`; `home.js:11`; joins `docs/design/journeys/src/journeys/privacy.js:59`, `:171`, `:321`
Joins to Privacy and Home (lessons 25, 31, 39):
- Replacement passkey: Privacy step 4 says "On the new ${gone}, when you have it". Admin says from your Mac only.
- One path left: Privacy says "Only this device can sign in", on a passkey row. Admin says only Google.
- Home B's tile says "3 healthy sign-in paths" with no label, and the iPhone row carries a "Healthy" chip, while MP-164 bars that path. Identity's own count carries a note; the tile does not.
Correction: list the Privacy differences in `OPEN` for the owner, and on Home say "2 usable, 1 waiting on MP-179" or carry the label.

### R1-s17 · P2 · `src/shell.js:175`, `:364`, `:373`
Compare and pick loses state (pressed, lesson 35):
- Clearing an owner's pick survives only until reload, when it returns, because `{...PICKS, ...picksLoad()}` cannot record a cleared key.
- With storage blocked, a changed pick is gone after pressing Open and returning (a false, b true), though the comment says picks "still show on this page".
- The journey list always opens option A, so Audit shows Ask a question under the chip "You picked B · Explorer", and Home likewise.
Correction: keep picks in `sum` across views, store cleared keys, and open a journey on its picked option. Press these in `design_admin_press.mjs`.

### R1-s18 · P2 · `review/MP-64/state.json:28`; `review/MP-64/round-1-checks.json:48`
The round record hides a deferred gate. `round-1-checks.json` lists `design-walk` as deferred, and `state.json` has `deferred_gates: []`. The admin parts were run by hand, but the group also holds the walker's `--selftest` and the journeys page's walk and press, and `design_journeys_check.mjs` changed. None is in `gate_results`. Correction: record each with its result or its reason. I ran the walker's selftest: it passes, 31 faults refused. The journeys page's walk and press were not rerun by me.

### R1-s19 · P2 · `scripts/design_journeys_check.mjs:89-90`; `scripts/design_admin_facts.mjs:22`, `:25`, `:69`; `scripts/review_checks.py:88-97`
Gates that do not prove themselves (lessons 8, 34):
- The walker's two new checks, back label and sidebar chip, have no selftest case.
- The facts selftest has no case for an undrawn action or a missing needed refusal.
- `PROPOSED` tests the shape of an id, so `Proposed · CT-99` passes. All 32 ids used today do exist.
- `design_runtime.mjs` for the admin page is reported as a gate but is not in `design-walk`.
Correction: add one mutated case each and the mapping.

## Polish

### R1-s20 · P3 · `src/shell.js` showPermissions; `permissions.json`
The owner-facing table prints working notation: "Audit `[inferred: ...]`", "tagged `Proposed · POLICY-003`", "as 7", "As 10", and sources such as `AOR:61`, `FP:53-83`, `J:shell:285`. The key is only in `facts.md`, a working file. Bare "Audit" appears on A35, A47, A48 and A49. Correction: strip the notation, use A-ids, and print the key.

### R1-s21 · P3 · `src/journeys/home.js:11`
Home's Incidents tile says "1 open". Incidents shows inc_0012 as Acknowledged, where Open is a separate status, and By class says "1 acknowledged". Correction: "1 not resolved".

### R1-s22 · P3 · Jira MP-179; `docs/planning/trace.json`
MP-179 has no issue links, though jira-flow habit 4 asks to link follow-ups to the current issue, here MP-64 and MP-164. `trace.json` rows changed on 4 Nov while `as_of` stays 2026-11-02. Trace status matches Jira for both.

### R1-s23 · P3 · `scripts/design_admin_press.mjs:8`; `README.md:19`
The press script hard-codes the playwright path, where its siblings honour `PLAYWRIGHT_CORE`. README says "side by side", and the options are stacked rows.

## Checked, no finding

- Copy my picks pressed in Chrome on file://: "Copied", and the clipboard text is right. The fallback path is not pressed.
- 105 screens, per-journey counts, 51 actions and 19 refusals match decision.md. The picks match the brief.
- `permissions.json` `journeys` matches where each act is drawn. A44 and A45 draw no control. R1, R5, R6 and R8 are drawn in picked options. The inventory's "Where drawn" column is right.
- `ds-admin` artifact hash matches the file. MP-64 is In Progress and MP-179 To Do in Jira, as in the trace.
- Checked against stories: "Agents cannot close an incident" (PH08-S05 authority), the four allowlist items, the four rollback kinds, the record classes, the at-every-threshold line, 55/45/10 credits, the POLICY-003 line and the Apple exception month.
- `__prismFlipless` is refused on the journeys page by `design_gates.py`, with a selftest case.
- `node scripts/design_journeys_check.mjs --selftest`: the good page passes, 31 of 31 faults refused.
- Not run: the journey screens' controls are drawings, so none was pressed beyond Compare.
