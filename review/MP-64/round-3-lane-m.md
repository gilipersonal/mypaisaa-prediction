# MP-64 review round 3, lane m (Runs, Agents, Models)

Reviewed at `af66cc0`, delta `0d1ab4e..af66cc0`, read-only. Files: `docs/design/admin/src/journeys/runs.*`, `agents.*`, `models.*` and their direct joins.
Picks read in depth: Runs A, Agents A, Models A. Option B read too, and capped at non-blocking.
Evidence commands use `node scripts/design_admin_text.mjs <journey> <option> <screen> <state> <device>`.

**Counts: 16 findings. P0 0, P1 1, P2 8, P3 7. Blocking 7, non-blocking 9.**

---

### R3-m1 · P1 · blocking · docs/design/admin/src/journeys/models.js:40

**The approval binds "Scope All segments", and the same screen says two scopes are outside it.**

Evidence:
- `models a a-decide default`: rail "Scope All segments", head "3, 6 and 12 months · all segments".
- The same screen: "Two scopes this does not settle: US tech, 12 months Stays paused; India midcap, 3 months Stays on R1-LGB v1", and "Active model v3 to v4, where v3 issues".
- `a-pipe` already scopes v3 honestly: "R2-HGB v3 active · 3, 6 and 12 months, except below".
- PH04-S18: "The owner's approval binds the exact artefact, calibrator, tasks, scope, evidence hash, limits, expiry and previous safe version". The owner, 4 November: "Only that scope waits (Recommended)".
- As drawn, the payload the owner signs is wider than the change the page describes. Read literally, execution would move a paused scope and a scope the page says stays on R1-LGB v1.
- The `Previous safe` row was narrowed in this delta ("R2-HGB v3, where eligible"). The `Scope` row beside it was not.

Correction:
- `models.js:40`: `['Scope', 'All segments, except US tech, 12 months and India midcap, 3 months']`.
- `models.js:43`: the same exception in `promoteHead`'s subtitle.
- Join for lane a: owner `docs/design/journeys/src/journeys/approvals.js:125`, `:129` and `:176` in the `noModel` state only, where the banner says "The others can still be promoted" and the head still says "all segments". The `R1-r20` pin at `tests/journey_facts/r.mjs:325` covers the `default` state, so it stands.
- Add a check that A25 never renders beside "Stays paused" with a bare "Scope All segments".

### R3-m2 · P2 · blocking · docs/design/admin/src/journeys/models.js:31

**The Failed world tells three different stories about the same mapping and the same base rate (lessons 27, 31).**

Evidence:
- `a-pipe error` and `a-rules error`: only v6 failed, "no rules mapping qualified for v6". Everywhere else: "R0-RULEMAP, qualified for v5".
- `a-evidence error`: v4's comparator is v5, yet it reads "Rules Not scoreable. No rules mapping qualified". That names no version, and v5's own mapping is not the one that failed.
- `a-rules error` prints "Rules v5 Not scoreable". `evaluation-protocol.json`, `rules_changes`: "the proposed and the current rules each get their own frozen mapping". So v6 failing does not unscore v5.
- Base rate in one moment: `a-evidence error` "Not read", `a-rules error` "0.203". In `b-board error` both appear in one frame.

Correction, keeping every string R2-m1 holds (`Rules Not scoreable`, `Rules v6 Not scoreable`, `Mapping R0-RULEMAP · not qualified`):
- Make the Failed world say one thing: no mapping qualified for v5 or v6. That means `a-pipe` banner, `a-rules` banner and the `Not scoreable` sentence in `scores` (`models.js:23`) all name both versions.
- Under PH04-S06 ("leaves the rules unscored and that task's trial waiting for the owner"), R2-HGB v4's trial then waits too, so `a-evidence error` and `a-decide error` say so.
- Pick one base-rate value for Failed and use it on `a-evidence`, `a-rules` and `b-board`.

### R3-m3 · P2 · blocking · docs/design/admin/src/journeys/models.js:23

**`scores` prints v4's range with v4 unread (lessons 29, 39).**

Evidence:
- `a-evidence error`: "v4 Not read ... Portfolio 80% range: 24.7 points on v3, 23.5 on v4, so 1.2 points narrower."
- The banner in that frame: "The evaluation failed at 21:14". This box was added to Error in this delta, so the figure is new there. `a-evidence partial` shows the same sentence under "the score table did not".
- A figure from the failed evaluation stands beside "Not read", with a computed advantage for the candidate.

Correction: print the "Portfolio 80% range" sentence only when `v4` is a score, not when it is `Not read`. Add a fact check: no `23.5` on `a-evidence` in Partial or Error.

### R3-m4 · P2 · blocking · docs/design/admin/src/journeys/models.js:141

**A78 "Decide what happens next" draws no choice, no outcome and no open-question id (lessons 28, 36).**

Evidence:
- `a-rules error` ends: "Decide what happens next · Proposed · CT-01 · There is no default, so nothing moves until you decide."
- Pressed in Chrome at `#models.a.web.error`: nothing changes (hash and text length unchanged). Other acts on the page are also static, but each of them says what it approves. This one names no choice.
- Lesson 28: "an option the owner may pick alone must draw every outcome itself". The only tag is CT-01, which is about step-up. The `SCI-D03` chip on the box above is about the score, not about the choices.
- The records leave this open: `evaluation-protocol.json` says "the trial cannot complete for it until the owner decides", and no record lists what he can decide.

Correction:
- Do not invent outcomes. Add under the control: `Proposed · SCI-D03`, "No record lists the choices yet, so none is drawn."
- Add a line saying what holds meanwhile: Rules v6 stays in shadow, v5 stays current.
- Add the open id to A78's `step_up_note` or `source` in `permissions.json`, and keep the R2-m1 check that A78 is live here.

### R3-m5 · P2 · blocking · docs/design/admin/src/journeys/models.js:171

**R2-m7's fault is back in different case, and the banner gives the mapping a false cause.**

Evidence:
- `a-pipe error`: heading "Not ready for you", row "Rules v6 shadow · not scoreable · waits for you". This row does wait on him, and it sits under a heading that says it does not.
- The R2-m7 check looks for the exact string `Waits for your yes`, so lower-case "waits for you" passes it.
- The banner: "It failed at 21:14, so R2-HGB v4 is incomplete, never green, and no rules mapping qualified for v6." PH04-S06 and the protocol fit and qualify the mapping on the pre-trial block, "before the trial starts". A failed evaluation run on Tuesday night cannot be why it did not qualify.

Correction:
- Keep the row text R2-m1 holds. Give Rules v6 its own group: "Waiting on you" above, "Not ready for you" holding only R2-HGB v4.
- Split the banner into two sentences with no "so" between the two facts.
- Widen the R2-m7 check to `/waits (for|on) you/i` under "Not ready".

### R3-m6 · P2 · blocking · docs/design/admin/src/journeys/models.js:72

**"4 decisions wait on you" applies its reason to the restart and to nothing else with the same property (lessons 27, 31).**

Evidence:
- The screen note added in this delta: "The count stays 4 dated decisions. A restart has no expiry, so it is named beside them."
- These also have no date and also read "Stays open · waits for your yes", in the same words Approvals gives the restart: Rules v6 (`rulesBind`), Admit this factor (`factBind`), the route change (`a-versions`), release thresholds (`THRESH`).
- `a-live`'s own screen also offers "Switch forward to R1-LGB v2", an undated owner decision directly under the sentence that omits it.
- `a-pipe default` lists Rules v6 under "Waiting on you" with "Waits for your yes". `grep` finds no "Rules v6" in `approvals.js` or `home.js`, so Home and Approvals never name it.
- Result: "what waits on you" is not exhausted by 4 plus 1, and the design's stated rule does not explain why.

Correction:
- Keep the held sentence and add one beside it on `a-live`, Home and Approvals: "Rules v6, a switch forward, a factor, a route change and the release thresholds stay open with no date."
- Or redefine the count on all three as "dated" and link the undated ones. Either way, update both `a-live` notes, `b-live`'s too, and `home.js:29`.

### R3-m7 · P2 · blocking · docs/design/admin/src/journeys/home.js:20

**Join: Home contradicts Runs and Models in the picked Admin home (lessons 27, 31).**

Evidence:
- `home b b-home error`: "Runs and health: US run Tue 21:15 · succeeded · from 11:20". `runs a a-clock error`: header "last good 11:20", "Last good run Mon 21:15", run_8d02 Failed. `a-run error`: "These records are from 11:20, the last good read." That is the same read with opposite results. The `suffix` helper only appends a time.
- `home b b-home conflict`: the same "succeeded" line (`home.js:11`, and `:21` overrides only Approvals). `a-clock conflict` was changed in this delta to say it "counts as neither until the reconciler settles it".
- `home b b-home error`: "R2-HGB v4 waits on you". `a-pipe error`: "Not ready for you".

Correction: add `LINES.error.runs` ("US run Tue failed at 21:14 · from 11:20"), `LINES.conflict.runs` ("US run Tue · reconcile_required") and `LINES.error.models` ("R2-HGB v4 incomplete · US tech 12 months paused · from 11:20"). Add a check that follows the Runs row from Home into `a-clock` in each state. This is lane f's file, reported as a join.

### R3-m8 · P2 · non-blocking · docs/design/admin/src/journeys/models.js:113

**A72 is live while the page says there is nothing to see yet.**

Evidence:
- `a-evals default`: "Judge agreement Not approved yet · Failures that block a release Not approved yet", then "Each row carries its proposed value here before you approve it", then a live "Approve release thresholds" with "Payload b6e2…04d9".
- So the box promises a value and the button does not wait for one.
- "Evidence run: The latest T2 run" is a moving reference inside the block before "This approval is bound to". PH05-S14 asks for an approval bound to the exact value and version.

Correction, keeping R2-m5's held strings and its live states:
- Add a "Proposed value" column or row reading "Arrives with the proposal", and say the drawn button opens only then.
- Name the T2 run by id.

### R3-m9 · P2 · non-blocking · docs/design/admin/src/journeys/agents.js:158

**The new `SCI-D04` label names things that record does not hold open (lesson 36).**

Evidence:
- `a-factors default`: "Proposed · SCI-D04 Whether a factor counts when hindsight cannot be bounded, and the ablation capacity, are open."
- `open-decisions.json`, SCI-D04 `still_open`: "the remaining model and feature catalogue, per-kind event windows and comparators, and the staging order of qualification campaigns". Campaign ceilings are "settled" (POLICY-008). Hindsight is not listed.
- PH05-S04 positive states it flat: "only prospectively extracted factors count as evidence".
- `a-factors conflict` contradicts the label in the same frame: banner "only prospectively extracted factors count, so this evidence no longer stands", tag "Whether a factor counts ... are open".
- Same frame: the row "Hindsight Prospective only" stays beside chip `hindsight_flagged`.

Correction:
- Change the tag to the record's own words: "The remaining feature catalogue and the staging order of campaigns are open."
- In Conflict, pass a "Flagged, being rerun" value to the Hindsight row.

### R3-m10 · P3 · non-blocking · docs/design/admin/src/journeys/models.js:141

**Three a-rules states reuse a line that state leaves untrue (lesson 29).**

Evidence:
- Error: head "8 of 8 scored weeks" beside "Rules v6 Not scoreable".
- Partial: "Mapping R0-RULEMAP · qualified for v6" and "These scores come through ..." with all three scores "Not read". `scores` on a-evidence already drops its sentence in that case.
- Empty: rail "Rules v6 changes one pillar's threshold" beside "No rules version is on trial" (`railRules`, `:148`, takes no `ctx`).

Correction: give `rulesHead` a subtitle argument for Error, make the `rulesScore` sentence conditional on a score being present, and pass `ctx` to `railRules` so Empty drops "What changed".

### R3-m11 · P3 · non-blocking · docs/design/admin/src/journeys/models.js:125

**`a-evals expired` keeps green and a stale reason.**

Evidence: banner "this qualification no longer stands", and the rows beside it still read "T2 full qualification ... qualified" and "Too few of your labels, so judges stay advisory". The state's actual reason is a changed judge, model or rubric.

Correction: use a tier row saying what expired, and give `JUDGE` a reason argument for Expired.

### R3-m12 · P3 · non-blocking · docs/design/admin/src/journeys/models.js:65

**`a-decide expired` titles the rail "What this proposed" over a live A25.** This delta made Expired carry the proof and a live "Sign in and approve again". `a-rules expired` says "This approval is bound to", and the two siblings disagree.

Correction: remove `expired` from the list on `:65`.

### R3-m13 · P3 · non-blocking · docs/design/admin/src/journeys/models.js:220

**The wording change stopped short, and one approval has two binds (lessons 1, 7).**

Evidence:
- `a-evidence`'s rail still reads "Previous safe R2-HGB v3". The bind now says "where eligible".
- A29's bind in Models reads "Environment Prod · Value 5 to 4 points a week · Expected version Settings v9 · Payload". The same approval in Approvals (`approvals.js:42`) and the owner journey reads "Production · 4 points · Current version v9 · Payload hash". PH05-S14 says "current version".

Correction: use "R2-HGB v3, where eligible" at `:220`, and one bind vocabulary for A29. R2-m4's check pins "Environment Prod", so change the pinned word with the bind. The check keeps its purpose.

### R3-m14 · P3 · non-blocking · docs/design/admin/src/journeys/models.js:47

**Words attributed to the owner are not his (lessons 7, 23).** `SCOPES` says "One scope's lapse leaves the others free (the owner, 4 November 2026)". The log records "Only that scope waits (Recommended)".

Correction: quote those words.

### R3-m15 · P3 · non-blocking · docs/design/admin/src/journeys/runs.js:60

**`a-clock partial` now reports more than "3 of 4 sources" allows, and more than the system knows (lesson 39).**

Evidence:
- Header "Partial · 3 of 4 sources", so one missing. The frame names three: the UK record, the dead-letter source, and the new "Yahoo did not answer for UK listings".
- Nothing else in the frame supports a Yahoo outage: "Stale collector ... No alarm". DATA-DEC-06 also has Yahoo serving India, which reads as answered.
- `ukUnread` (`:35`) still prints an id and a time for a record the banner says did not answer.

Correction: "UK checks not read", with `PLAIN('Not read')`, so nothing is claimed about Yahoo, and "UK · run not read" without `run_8cf7`. R2-m8's check forbids only "Succeeded" on that row, so it stands.

### R3-m16 · P3 · non-blocking · docs/design/admin/src/journeys/models.js:204

**Option B's rail ignores the state (lesson 29). Unpicked, so non-blocking.**

Evidence: `models b b-board error` keeps `railBoard`'s "Rules v6 Approve, if you choose" and "R2-HGB v4 Promote or reject · expires Fri 18:00" beside "mapping not qualified" and "incomplete". Its four rows are also not the four counted on Home.

Correction: read `ctx.state` in `railBoard` and match the rows to `a-pipe`'s for that state.

---

## Joins

- Lane a: R3-m1 reaches owner `approvals.js` in `noModel`.
- Lane f: R3-m7 is in `home.js`. R3-m6 reaches `home.js:29` and `approvals.js:220`, `:240`.
- Lane s: R3-m4 touches A78 in `permissions.json`. R3-m2, m3, m5 want new or widened checks in `tests/admin_facts/m.mjs`.

## Checked and found sound

The rest of the delta held against its records:
- `a-clock` Stale step states, including the 11:15 step still Due at 11:12.
- `a-clock` Conflict watermark, tagged CT-05.
- `DUE_TO` in `a-run` and `b-detail` Failed.
- "market data credits reserved" in Guard decisions.
- `openBits` in all six states.
- `mayNeed` on phones.
- A29's impact, evidence, cost and rollback figures against Approvals.
- The figures 24.7 less 23.5 and 96 × 2, 6 × 2.
- ARC-09 as the source for "no number is approved".
