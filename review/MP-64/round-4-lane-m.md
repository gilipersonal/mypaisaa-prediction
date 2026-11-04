# MP-64 round 4, lane m: Runs, Agents, Models

Reviewed `git diff af66cc0..1fd5ff6` of `runs.*`, `agents.*`, `models.*` and its joins, at `1fd5ff6`. The CSS files did not change. Text was read with `scripts/design_admin_text.mjs`, and the A72 control was read in a real browser. Line numbers are at `1fd5ff6`.

Counts: 9 findings. P1: 2. P2: 3. P3: 4. Blocking: 4. Non-blocking: 5.

## Blocking

### R4-m1 · P1 · blocking · docs/design/admin/src/journeys/models.js:115

**The picked a-evals says the thresholds control opens only once the values arrive, and then draws it open with no values.**

Evidence, Models A, a-evals, Ready, in page order:

- "Proposed value: Arrives with the proposal."
- "Each row carries its proposed value here before you approve it, and the control opens only then."
- "This approval is bound to: Record: Release thresholds, first version. Payload hash: b6e2…04d9."
- A live "Approve release thresholds" button. In the browser at `#models.a.web.default`: `disabled: false`, width 248px. The Conflicting state draws the same thing (`:126`).

So one screen says the proposal has not arrived and also shows a hash of it and a working approve. An owner pressing it approves numbers nobody has seen, which is what the binding exists to prevent (PH05-S13: "The owner labels calibration samples and approves release thresholds before activation"; CT-02: "Pin the exact proposal"). `home.js:60`, `approvals.js:220` and `models.js:73` also say the thresholds "stay open", so the page has not decided whether a proposal exists. Lessons 28, 32 and 39.

Second fault in the same line: "No number is approved (ARC-09)". ARC-09 is the decided harness ("Inspect AI with deterministic checks"). The open questions are CT-10 ("which unresolved failures block a release") and CT-11 (judge error tolerance). Lesson 36.

Correction:

- Keep `data-act="A72"`, which R2-m5 holds in Ready and Conflicting.
- Draw its button disabled, with one line: "Opens when a proposal carries its values".
- Replace the Payload hash row with "Arrives with the proposal". Nothing exists to hash yet.
- Change the label to `(CT-10, CT-11)`.
- Add a ledger check that no enabled A72 button stands beside "Arrives with the proposal", proved by undoing the fix (lesson 34). A press check suits lesson 32.
- The "stay open" line in home, Approvals and a-live can stand, because the decision is still open.

### R4-m2 · P1 · blocking · docs/design/admin/src/journeys/runs.js:49

**Partial turned the dead-letter alarm from Unknown to a green "0 items", while the same state says the queue was not read.**

Evidence, from the diff:

- `:49` was `'This source did not answer', WARN('Unknown')`. It is now `'Read at 11:40', OK('0 items')`.
- The same round moved the unread queue to Collection (`:176`, "UK not read", Unknown).
- `:216`: "The UK record did not answer, so Collection shows unknown, never none."
- `:233`: "so an item may be there that this does not show."
- `:315` note: "Unknown is never zero."

`ALARM.partial` feeds the picked a-clock rail and the b-list rail. So in one state the picked health panel prints a green zero, and directly under it the rule about never reporting OK while a dead-letter queue holds items. The Queues and Dead-letter screens say it cannot be known. This is an unread figure shown as zero, which AGENTS.md forbids ("Never hide risk, staleness, or data-provider status") and lessons 27 and 39 cover. The fixed list does not hold the green row: no check names it.

Correction:

- `:49` becomes `['Dead-letter queues', 'UK collection not read', WARN('Unknown')]`.
- Judge `['Stale collector', ...]` in the same row set the same way, since the UK collector is unread too.
- Add a fact that in Partial the a-clock alarm, the b-queues Collection row and the b-dead banner agree, using the lesson 31 method.
- `deadOK` (`:228`) says "None is held now" and is drawn under that banner in Partial (`:233`) and under "A newer dead-letter item may exist" in Stale (`:235`). Give `deadOK` a parameter that drops the sentence in those two states. Those states are in the unpicked option, so on its own that part would be non-blocking.

### R4-m3 · P2 · blocking · docs/design/admin/src/journeys/runs.js:265

**The new `ukMon` row brings back R2-m8's fault in a phrasing its check does not search.**

Evidence, a-clock Partial, in order:

- "India and the US answered. The UK record did not, so it shows unknown and never on time."
- UK card: "Watermark Not read. Last success Not read. Next due Not read."
- Then, under What ran: "Forecast run, Mon 2 Nov 16:50 · run_8bf3 · UK · Succeeded".

So a UK success is on screen beside "Last success Not read". R2-m8's check only forbids `run_8cf7 ... Succeeded`, so it passes (lesson 3). `incidents.js:150` and `:155` show the intended reading: only Tuesday's `run_8cf7` is unread, and `run_8bf3` reads Succeeded.

Correction: narrow the claim to what is unread, and keep the row.

- Banner: "India and the US answered. The UK's Tuesday record did not."
- UK card: "Watermark Mon close · Tue not read" and "Last success Mon 16:50 · Tue not read". "Next due" may stay Not read.
- Reword `:186`, `:216` and `:233` the same way (lesson 7).
- Extend R2-m8's check to any UK `Succeeded` while the card reads a bare "Last success Not read".

### R4-m4 · P2 · blocking · docs/design/admin/src/journeys/models.js:66

**This round took `expired` out of the "What this proposed" list, so a-decide Expired now binds a new approval to the window it just said ran out.**

Evidence, a-decide Expired:

- Banner: "Expired. It did not apply."
- R5: "An expired approval is refused at execution. A new one gets a new window."
- A live "Sign in and approve again" (A25).
- The rail now reads "This approval is bound to ... Expires Fri 6 Nov, 18:00", with payload hash a81f…60de.

The rail is the binding for that button, so it promises the expired window and the same hash, and R5 on the same screen says exactly that gets refused. `oneScope` in Option B shows the same. PH04-S18: an approval binds its expiry, and "an expired approval ... is refused at execution". The owner journey's matching outcome says "An expired proposal cannot be approved" (`docs/design/journeys/src/journeys/approvals.js:103`, `:195`).

Correction:

- Keep A25 live, which R2-m12 and R2-m3 hold.
- Give `bound` an expiry argument. In Expired, draw `['Expires', 'A new window, shown before you approve']` and `['Payload hash', 'A new one, on the new proposal']`, with `proposed('CT-02')` as now.
- Add a check that a-decide Expired does not print "Expires Fri 6 Nov" under "This approval is bound to".

## Non-blocking

### R4-m5 · P2 · non-blocking · docs/design/admin/src/journeys/models.js:177

**In Expired, the a-pipe rows and the screens they open disagree (lesson 31).**

Evidence:

- a-pipe Expired keeps "R2-HGB v4 ... expires Fri 18:00, Ready for you" and "Rules v6, Waits for your yes".
- Following the rows: a-decide and a-evidence say "Expired" and "Your approval ran out". a-rules says "Expired. Your approval ran out before this applied".
- Home Expired (`home.js:26`) says "Next: Promote R2-HGB v4, Fri 18:00", and its note places Expired on that evening, so Friday has not come.

R2-m7's check walks seven states and leaves `expired` out (`tests/admin_facts/m.mjs:207`), so nothing measures this pair. None of the lines above changed this round, which is why it is non-blocking. It joins R4-m4.

Correction: state in a-decide and a-rules which window ran out, such as "the 15 minutes after you approved", the reading a-live Expired already uses with CT-02. Or give the a-pipe rows the Expired chip with the home line to match. Then add `expired` to R2-m7's list.

### R4-m6 · P3 · non-blocking · docs/design/admin/src/journeys/runs.js:41

**`ukMon` makes What ran look exhaustive, and it is not.**

Evidence:

- The list is newest first and now holds Wed India, Tue US, Tue UK, Mon US, Mon UK. India's Tue and Mon runs are absent, though Stale (`:267`) gives India "Last success Tue 10:15". The option's `why` says "A missed run shows as a gap in a place you already look", so the gap reads as a miss while the alarm says No alarm.
- `ranFailed` (`:42`) drops run_8bf3, so the row vanishes in Failed.
- b-list "Every run" (`:173`) has no run_8bf3 either.
- `incidents.js:399` still says "run_8bf3 is minted here".

Correction: add India's Tue and Mon rows, or caption the list as a sample. Add run_8bf3 to `ranFailed` and to `listOK`. Move the minting note to the `a-clock` note.

### R4-m7 · P3 · non-blocking · docs/design/admin/src/journeys/models.js:41

**The same approval, a81f…60de, is bound to different lines in admin and the owner journey (lessons 7, 27).**

Evidence:

- `BIND` has no Environment and no Expected version.
- `STEP_MODEL` (`docs/design/journeys/src/journeys/approvals.js:179`) has "Environment Production" and "Expected version Models v22".
- `BIND` has "Calibrator c7 to c8". The owner bound box and a-evidence's rail have "c8".
- `rulesBind` (`:136`) also has no Environment, though this round normalised that row on the factor, route, band and threshold binds. CT-02's criteria name "target environment".

Correction: add `['Environment', 'Production']` to both, and `['Expected version', 'Models v22']` to `BIND`. Make the calibrator row read "c8".

### R4-m8 · P3 · non-blocking · docs/design/admin/src/journeys/models.js:92

**The Prod to Production fix stops at this lane (lesson 1).**

Evidence: lane m and the owner journey now say "Environment Production", while `['Environment', 'Prod']` remains at `admin/src/journeys/approvals.js:235`, `incidents.js:45` and `identity.js:257`. Those files belong to other lanes. This records the join.

Correction: change those three rows to "Production". Leave the cost split "Prod" and the "Scope Prod" audit values unless the owner wants them changed.

### R4-m9 · P3 · non-blocking · docs/design/admin/src/journeys/models.js:254

**R3-m1's bare scope survives in a label its check does not read (unpicked option).**

Evidence: the b-scope screen title is "All segments, one scope", while its bind says "All segments, except US tech, 12 months and India midcap, 3 months". The check reads only the rendered `Scope` row and head.

Correction: title it "One scope: the promotion".

## Checked and clean

- Agents delta: the factor's `hind` argument, "Production", and the SCI-D04 tag, against `open-decisions.json` still_open and PH05-S04.
- `WAITS_RULES`, A78 and the Failed story, against PH04-S06 and the evaluation protocol's `no_qualified_mapping`.
- Rules partial and error branches, and `railRules` when empty.
- `BOARD_V`.
- Band bind against `SET_BIND` and `STEP_SET`.
- The "fifth in its No model state" note, against the owner's `5 decisions wait on you`.
- The arithmetic: 24.7 - 23.5, £7.06, the 16:35 clock, and the India and US closes in November.
