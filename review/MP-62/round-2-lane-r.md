# Lane r, round 2: 22 findings (7 P1, 11 P2, 4 P3; 16 blocking)

Short names in the findings:
- `approvals.js`, `research.js`, `holdings.js`, `home.js`, `cost.js`: `/Users/arundutta/projects/mypaisaa-prediction/docs/design/journeys/src/journeys/<name>`
- `shell.js`: `/Users/arundutta/projects/mypaisaa-prediction/docs/design/journeys/src/shell.js`
- `r.mjs`, `flip.mjs`: `/Users/arundutta/projects/mypaisaa-prediction/tests/journey_facts/<name>`

**R2-r1 · P1 · blocking · `approvals.js:27`, `:392`, `:444`. Queue and Home flip show different provider status.**
- Evidence, `aa-queue` then `ab-home`, rendered on web:
  - Error: "Twelve Data · Fresh, Yahoo · HSBC late" against "Twelve Data · error 21:14, Yahoo · Fresh".
  - Stale: "HSBC late" against "HSBC stale".
  - The desktop data row also differs in Error: "As of 21:15" against "Last good run Mon 21:15".
  - The cause is `fr` forcing `fresh: 'default'` on A while `ab-home` passes `undefined`. MP-178: "the same freshness and the same provider status".
- Correction: pass `fresh: undefined` on `aa-queue` (and `ab-notices`, `:448`), so both sides follow the state. R1-r14 stays held. Add the pair to `SAME` (see R2-r16).

**R2-r2 · P1 · blocking · `approvals.js:396-397`, `:452-458`, `shell.js:240`. A flip changes how the same listing is approved.**
- Evidence:
  - B has `ab-step` with `STEP_TSM`: Environment Production, Payload hash `2d7a…b310`.
  - A has no listing step-up. `aa-step` uses `STEP_MODEL` only, so A's Confirm goes straight to `aa-after`.
  - `HIST` on B records "fresh sign-in". The OPEN row admits it: "on the new listing in Approvals B".
  - The confirm foot on both sides says only "Bound to catalogue v14 · expires 18:00". MP-74 requires the PH-02 authentication for a configuration change.
- Correction: draw the same step-up on A with `STEP_TSM`, and add "needs a fresh sign-in" to the listing foot on both sides, labelled Proposed · CT-01. Update the OPEN row and the README.

**R2-r3 · P1 · blocking · `approvals.js:226-229`, `:245-251`. Switch forward and restart bind almost nothing.**
- Evidence:
  - Both heads show "No expiry". The feet read "Bound to R1-LGB v2" and "Bound to this scope".
  - "This approval is bound to" appears in 0 of 9 states on either side.
  - Restart's own row says "This yes gives it a fresh approval" for R2-HGB v3, yet no artefact, calibrator, evidence hash, version or expiry is shown.
  - MP-78: an approval binds "payload sha256, expected record or configuration version and expiry". MP-156 binds artefact, calibrator, tasks, scope, evidence hash, limits, expiry and previous safe version. Nothing exempts these two.
- Correction: add a bound card to both with an expiry. If the proposal waits but the approval has a window, say so and label it Proposed · SCI-D07. Name the model in the restart foot.

**R2-r4 · P1 · blocking · `approvals.js:86-87`, `:453`, `:467`. B's proposals lose what A's show.**
- Evidence:
  - `ab-chat` offline renders no expiry at all and no "Bound to" line. `aa-listing` offline shows "Expires 18:00".
  - `ab-chat` drops the header in every state, so "Taiwan Semiconductor" and "watch-only" never appear. TSM is only named in the checks list, after the change card.
  - It also drops the who-did-what chain, which the code comment calls "the same on every proposal".
  - "Cannot widen authority" shows on A's listing and promotion in 9 of 9 states, and in 0 of 9 on `ab-chat` and `ab-model`.
- Correction: keep a compact header with the expiry chip inside the chat card, and add `listingLimits(ctx)` and `limits(...)` to the two B rails.

**R2-r5 · P1 · blocking · `research.js:322`, `:276`, `:145`. The Research card flip hides missing, stale and abstained states.**
- Evidence on web:
  - Error: A "Valuation Input missing: forward earnings not supplied", B "Valuation 31×".
  - Stale: A "Stale: benchmark last updated 14:10", B "+11.2% … Cutoff 21:00".
  - Cause: `rb-card` calls `minis()` with no `miss`. MP-129: such a card "shows that state and is never filled".
  - Abstaining: `rb-card` never says the model abstained or that no range is shown. It says only "the cited evidence is too thin to weigh".
- Correction: share the `miss` map between both rails and add an abstained banner to `threadCard`.

**R2-r6 · P1 · blocking · `approvals.js:297-301`, `shell.js:23`. The inbox loses notices on A, and the Notices flip lands on different facts.**
- Evidence, flips pressed in the browser on iPhone from `ab-notices`:
  - Stale, No model, Disagreement and Abstaining land on `aa-queue` with no notices. Those four states never call `notices()` on any device, and A has no other inbox. MP-162: the inbox "never omits an alert".
  - The reverse fails too. Empty says "No notices yet" and flips to three notices. Error says "Notices did not load" and flips to three notices.
- Correction: use one notice body on `aa-queue` in every state, so the two sides read the same source.

**R2-r7 · P1 · blocking · `shell.js:23`, `approvals.js:178-185`, `:358-363`. Record and History are not one place.**
- Evidence:
  - `aa-record` lists six decisions across models, listings and imports, with an evidence hash and Roll back.
  - `ab-history` lists four events of one listing, with back "TSM".
  - Only the 09:02 TSM entry overlaps. The promotion, the block, the automatic revert and the revoke all vanish on flip.
- Correction: smallest is to drop this pair from `FLIPS`, which also fits the "record" rule. Otherwise give B the same six entries.

**R2-r8 · P2 · blocking · `approvals.js:318`, `research.js:83`, `:218`, `:227`, `:246`. Stale keeps numbers from the full total beside the reduced total.**
- Evidence:
  - `ab-home` stale shows "£78,508.20" with "US 53.4% India 28.5% UK 18.1%". `home.js:145` gives 57.6, 30.7 and 11.7 for the same state.
  - Research stale says HSBC "left the total", yet keeps "Now 31.0%" and "NVIDIA 13.5%". On the known total, US tech is 26,222.60 / 78,508.20 = 33.4%.
  - The brief keeps "up £1,236.18 (1.48%)", a line `ab-home` removes.
- Correction: reuse Home's stale allocation. In Research, either compute on the known total (33.4%, Apple 18.9%, NVIDIA 14.5%, bar moved to match) or say which total the share uses. Drop or label the day move.

**R2-r9 · P2 · blocking · `approvals.js:254-267`, `:270-275`, `holdings.js:191`, `:221`, `:446-452`. Revoke cannot be reached and contradicts Holdings.**
- Evidence:
  - No queue, home, notices or history row in any state leads to `aa-revoke` or `ab-revoke`.
  - Approvals: "11 rows", expires 09:35. Holdings, for the same import: "3 groups, 9 of 11 rows", until 21:33. MP-55 ties approval to exactly the rows seen.
  - Stale dead-ends in Approvals. Holdings offers "Sign in and approve".
  - Abstaining is n/a in Approvals, while Holdings draws "Fresh sign-in needed" on its own Abstaining. Disagreement also differs: "Already revoked" against "Refused for a stale revision".
- Correction: keep one drawing, linking to Holdings' live screens or adding an "Approved, not started" row, and align rows, times and the renewal path.

**R2-r10 · P2 · blocking · `approvals.js:403`, `:410`, `:467`, `:482`. "This approval is bound to" shows when no approval can happen.**
- Evidence:
  - `aa-setting` Empty: "No settings change waits", then Value 4 points, Expires Mon 9 Nov.
  - `aa-model` Empty: "Nothing to decide yet", then an expiry.
  - `aa-model` No model: "R2-HGB v3 can no longer be the safe fallback", then "Previous safe R2-HGB v3".
  - Error shows the mismatched evidence hash as bound. Both options, because the rail ignores `y`.
- Correction: draw the bound card only where a proposal is open, and retitle it "What this proposed" on refused or expired states. Apply the same gate to the promotion `limits()` rail.

**R2-r11 · P2 · blocking · `approvals.js:219-222`, `:245-250`. Settings, switch forward and restart stop at the button.**
- Evidence: `stepFor` is only used with `STEP_MODEL` and `STEP_TSM`, and only the promotion and listing have outcome screens. Pressing Approve, Switch forward or Restart leads nowhere drawn, on either option, although the feet and offline copy demand a fresh sign-in. MP-114 lists `awaiting_step_up` and `applied`.
- Correction: draw the three step-up sheets and outcomes, or list the gap in the inventory's OPEN table.

**R2-r12 · P2 · blocking · `approvals.js:447`, `:281-285`. `ab-notices` n/a for No model is false.**
- Evidence: the reason reads "Notices come from code, so no forecast is on this list." But a paused scope "notifies the owner" (MP-159), and MP-162 says every intent appears. No paused-scope notice exists on any screen, and `aa-queue` No model has no notices.
- Correction: remove the n/a and draw the "US tech, 12 months paused" notice.

**R2-r13 · P2 · not blocking · `approvals.js:300`, `:310`, `:329`. The Disagreement copy has no second proposal.**
- Evidence: "Two proposals touch the catalogue" sits above four rows, and only TSM touches it. The others are a model, a setting and the ledger.
- Correction: draw the second catalogue proposal. Or use the overlap that does exist: the promotion binds "Limits 5 points" while the setting moves 5 to 4.

**R2-r14 · P2 · blocking · `research.js:96`, `:160`. R1-r11's fault survives as "this month".**
- Evidence:
  - `ra-brief` and `ra-ask` say "Claude is off this month to stay inside the budget". Cost says it stays off until credit is verified (`cost.js:108`).
  - `ra-brief` No model never gives that condition, while `rb-today` does, so a flip changes the reason.
  - `ra-brief` is outside the R1-r11 screen list.
- Correction: use the Cost sentence on `ra-brief` and `ra-ask`, drop "this month", and add `ra-brief` to the check.

**R2-r15 · P2 · blocking · `shell.js:20`, `:79`, `research.js:303`. The flip on `ra-source` cannot be pressed on a phone.**
- Evidence: `elementFromPoint` at the flip's centre returns `.scrim` in 8 of 8 drawn states on iPhone and phone web. The control sits behind an `aria-modal` sheet.
- Correction: omit the flip when `spec.sheet` is set, and have the checker hit-test it.

**R2-r16 · P2 · blocking · `flip.mjs:9-15`, `:37`. No gate holds a flip in these two journeys.** This overlaps lane s.
- Evidence: `SAME` has no Research or Approvals pair, which is why R2-r1, R2-r4 and R2-r5 pass 88 of 88. `MP-178-never` omits `aa-after`, `ab-after`, `ab-model-result`, `aa-revoke` and `ab-revoke`, and nothing compares bound values or expiry across a pair.
- Correction: add all pairs to `SAME`, add those five screens, and add a check that each proposal pair shows the same "Bound to" line and expiry in every state.

**R2-r17 · P2 · blocking · `r.mjs:115`, `:216`, `:142`, `:73`, `:54`. Five checks pass with their fix undone.** Run with `--page` on mutated copies of the page, in my scratch folder:

| Check | Mutation | Result | Why |
| --- | --- | --- | --- |
| R1-r8 | `stop` back to 6, text unchanged | exit 0 | Reads text, not ticks; the fault was text against ticks |
| R1-r19 | "Lift the Claude budget to £20" | exit 0 | Phrase-locked (lesson 3) |
| R1-r11 | "Claude comes back next month by itself" | exit 0 | Phrase-locked |
| R1-r5 | Notices label on a bare `span` | exit 0 | Tests the label, not a control |
| R1-r3 | Revoke disabled in Ready | exit 0 | Tests the words only |

R1-r22 and R1-r20 did fail when mutated, as they should.
- Correction: count the drawn ticks, refuse any budget raise in the record and any promised return without Cost's condition, and require a real enabled control.

**R2-r18 · P2 · not blocking · `shell.js:12-13`, `:220`, `/Users/arundutta/projects/mypaisaa-prediction/docs/design/journeys/README.md`. Open question for the owner on the proposed rule.**
- Evidence: the rule says no flip "on an approval or record in progress", yet four proposal screens with a live Confirm or Approve button flip. Holdings' approval screens do not. "In progress" is undefined in the MP-178 text waiting on the owner.
- Correction: put it to the owner as a question: does the rule start at the proposal or at the press? Record the answer in all three places.

**R2-r19 · P3 · not blocking · `research.js:259`.** `rb-today` No model is the only state without `threadRisk()`, so "detected Tue 22:15, held by quiet hours" disappears on flip. Correction: add it.

**R2-r20 · P3 · not blocking · `research.js:268`.** On a phone, `rb-card` offers four quick chips, with no route to Benchmark, Profile or Stance (MP-129). Correction: add the chips.

**R2-r21 · P3 · not blocking · `research.js:332`, `:259`.** `rb-memory` No model shows "What do you remember about me?" while Today says the thread takes no questions. Correction: drop the question in that state.

**R2-r22 · P3 · not blocking · `research.js:254`.** "Tuesday's thread stays readable above", with nothing drawn above it. Correction: draw it or cut the line.

**Covered:** the delta in both journeys and `r.mjs`, plus `FLIPS`, `frame()` and ARC-06b, against owner answers 13 to 16 and all 15 stories. All 13 flip pairs were diffed on iPhone and desktop in nine states (`/private/tmp/claude-501/-Users-arundutta-projects-mypaisaa-prediction/45ba900b-058a-4437-b30a-d55697f4dbd3/scratchpad/review2/r/pairs.out`).

**Not checked:** iPad and phone web in that diff (they share the same branches), dark mode, and any assistive-technology pass. I did not read the round 1 lane files.
