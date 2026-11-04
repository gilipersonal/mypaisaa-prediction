# MP-64 round 2, lane m: Runs, Agents, Models

Snapshot `0d1ab4e`, delta `6705fc1..0d1ab4e`. Read: the three journeys, their diff, `shell.js` helpers, `permissions.json`, PH02-S06, S12, S13; PH03-S09, S10; PH04-S05, S06, S09, S17 to S20; PH05-S03 to S08, S12 to S15; PH08-S05, S06; `policy-evidence-register.md`; the owner journeys' `approvals.js`; the joining screens in `home.js`, `approvals.js`, `incidents.js`, `costs.js`. Screens read with `scripts/design_admin_text.mjs`. Nothing edited. No finding proposes undoing a fixed entry.

Counts: 18 findings. P0 0, P1 2, P2 10, P3 6. Blocking 12, non-blocking 6. Every screen finding is in a picked option; R2-m6 is in the inventory.

---

### R2-m1 · P1 · blocking · docs/design/admin/src/journeys/models.js:127

**The picked a-rules scores rules as a probability, with no qualified mapping anywhere on the page.**

Evidence:
- PH04-S05 negative: "Rule strength is never shown or scored as a probability without a qualified mapping (PH04-S06)."
- PH04-S06 positive: the mapping is "qualified per rules version; without a qualified mapping the rules comparison is reported as not scoreable." Recovery: "A failed mapping qualification leaves the rules unscored and that task's trial waiting for the owner." Its states include "mapping not qualified".
- `rulesScore` prints "Against both comparators · Brier score", Rules v6 0.194 and Rules v5 0.197, then in the same box "Rule strength is a heuristic, never a probability." A Brier score needs a probability, so the box contradicts itself.
- `grep -i 'mapping\|not scoreable\|RULEMAP'` finds nothing in `runs.js`, `agents.js`, `models.js` or `permissions.json`. A rules version's mapping is never named, and no state of a-rules, a-pipe or a-evidence draws "mapping not qualified".
- The only words that admit this are "How rules get a proper score is not settled", at `models.js:182`, in unpicked Option B. a-rules has a bare `Proposed · SCI-D03` chip with no sentence. SCI-D03 proposes scoring "through a frozen, qualified rules-to-probability mapping (R0-RULEMAP)".

Correction:
- Replace the foot sentence in `rulesScore` with one saying these scores come through the frozen rules-to-probability mapping (R0-RULEMAP), and that rule strength itself stays a heuristic. Tag it `Proposed · SCI-D03` beside that sentence.
- Add a row "Mapping: R0-RULEMAP · qualified for v6" to the score box and to the `rulesBind` evidence.
- Draw "mapping not qualified" in a-rules (Partial or Failed): rules comparison "not scoreable", no A62, "waits for you".
- Carry the same state to `RULES` in a-pipe and to the Rules column of a-evidence.
- Add the owner's decision to `permissions.json` (see R2-m6) and a row to `OPEN` in `shell.js`.

### R2-m2 · P1 · blocking · docs/design/admin/src/journeys/models.js:47

**A25 is live in the same world that makes it unpromotable in the owner journey, and its consequences are false for two of its scopes.**

Evidence:
- Owner journey `docs/design/journeys/src/journeys/approvals.js:145`, noModel: "R2-HGB v3 can no longer be the safe fallback, because its approval has expired. Until you approve a safe version, this cannot be promoted."
- Admin draws that condition and the live button together. `pauseCard` (`models.js:66`) reads "Its approval expired, so the scope paused rather than reverted" and "Previous safe: None eligible". a-pipe Expired (`models.js:169`) reads "R2-HGB v3's approval ran out there". `home.js:11` shows "R2-HGB v4 waits on you · US tech 12 months paused". The owner journey keeps these apart: its default has no paused scope.
- `BIND` (`models.js:40`) says Scope "All segments", Previous safe "R2-HGB v3". `changes` (`models.js:42`) says "If it slips: Back to v3 by itself". For US tech, 12 months that is false: PH04-S19 says an ineligible previous model pauses the scope instead.
- "Active model: v3 to v4" is false for India midcap, 3 months, which a-pipe shows on R1-LGB v1. a-live still offers A27 on that same scope.
- Nothing says whether A25 on "All segments" restarts the paused scope, though PH04-S19 needs the owner's own yes for that, or supersedes the switch forward. `OVERLAP` names only the band.

Correction, one of:
- Hold A25 in Ready with the owner journey's words, until A28 is decided.
- Or narrow the proposal's scope to the segments R2-HGB v3 actually issues, excluding US tech 12 months and India midcap 3 months, in `BIND`, `promoteHead`, `V4`, `approvals.js` `Q` and Home.

If the owner's noModel reading is meant whole-model only, put that question in `OPEN` and state on a-decide what A25 does to each of those two scopes. The record it needs is an owner answer, so raise it as an open question (`.claude/rules/plan-sync.md` rule 3).

### R2-m3 · P2 · blocking · docs/design/admin/src/journeys/models.js:59

**The R1-m4 evidence and the new overlap sentence reach only Ready. Two states keep A25 live without them.**

Evidence:
- a-decide Expired renders banner, R5, `promoteHead`, then a live "Sign in and approve again" (A25). There is no trial, no score and no `changes()`. The rail labels the binding "What this proposed", and only a hash stands for the evidence.
- The owner re-approves the highest-stakes act here from a screen with no proof. MP-64's negative is "No admin action... promotes a model without its evidence" (lesson 25).
- a-decide Denied (`models.js:60`) has `proof()` and `changes()` but no `OVERLAP()`, with A25 live. R1-a6 holds that sentence on Approvals' Denied and Partial states, so one act warns in one place and not in the other (lesson 27).

Correction:
- Add `proof() + changes() + OVERLAP()` to Expired before the control.
- Add `OVERLAP()` to Denied.
- Extend `R1-m4`'s check to every a-decide state that draws A25.

### R2-m4 · P2 · blocking · docs/design/admin/src/journeys/models.js:89

**A29 in Models is a bare version of the same act in Approvals: no overlap, no impact, no evidence, no cost, no rollback.**

Evidence:
- `bandOK` is `bandHead + bandLimits + bandBind + bandYes`, with A29 live in Ready, Partial and Denied.
- PH05-S14: "a proposed change shows its expected impact, evidence, cost and how to roll it back". Approvals draws all four (`approvals.js:40`, `SET_WHY`) and, under R1-a6, "approving one sends the other back to its check".
- a-bands says none of it, so pressing A29 here silently sends R2-HGB v4 back to its check. `models.js:46` states that rule only on the promotion side.
- `bandBind` also omits the environment and the owner that PH05-S14 binds: "exact owner, environment, setting, value, current version and expiry".

Correction, either:
- Make a-bands read only, with a door to Approvals' `aa-band`, so one act has one decision surface. Keep A29's listing and move `journeys` accordingly.
- Or draw `SET_WHY`'s four rows, the overlap sentence and Environment in `bandOK`.

Extend the R1-a6 check to `a-bands` either way.

### R2-m5 · P2 · blocking · docs/design/admin/src/journeys/models.js:108

**A72 and A30 are buttons and nothing else, and A72 stays live when nothing can support it (lessons 28, 32; same fault as R1-a3).**

Evidence:
- `JUDGE` draws "Label calibration samples" and "Approve release thresholds". No threshold, version, evidence, expiry or binding appears on any screen, and no labelling surface exists. Every other approval in this lane draws a "This approval is bound to" box.
- PH05-S13's evidence is "The release-threshold record the owner approved"; the page never shows what such a record holds.
- A72 stays live in Empty (`:114`, "No evaluation has run"), Failed (`:116`, "T0 failed"), Expired (`:120`, "this qualification no longer stands") and Denied (`:121`, "T1 and T2 cannot run").

Correction:
- Keep both controls in Ready, as R1-m13's check needs.
- Add a "Release thresholds" card with what would be approved. No number is approved (ARC-09), so show "not approved yet" rows tagged with the question that owns them, plus the evidence run and a bind box with `Proposed · CT-02`.
- Draw where a label is given, or say what opens.
- Pass `live = false` in Empty, Failed, Expired and Denied, with a sentence saying why.

### R2-m6 · P2 · blocking · docs/design/admin/permissions.json

**The inventory still misses owner acts these journeys name, so "every admin action" is not met (lesson 20).**

Evidence, from reading each PH04 and PH05 `authority` against the 76 rows:
- PH04-S06: "The owner decides what happens when no mapping qualifies." No row.
- PH05-S04 and `agents.js:171`: the state "withdrawn", "A withdrawn factor leaves future origins". A61 only admits; no row withdraws, and the page does not say who does.
- PH04-S05 and `models.js:129`: "A faulty version is withdrawn by returning to the previous approved one". No row and no actor.
- PH05-S08: "the owner approves the deterministic templates". `grep template permissions.json` finds nothing.
- PH05-S03: "Only the owner can raise the cap or change the model". A24 covers the model. Whether A73 "route budget" covers the three-a-day cap is unstated, and `agents.js:50` shows that cap.

Correction:
- Add the rows, each with step_up, audit, source and phone `off`, as `control: named` where no screen draws them.
- Where the actor is unknown (withdrawing a factor or a rules version), add a row to `OPEN` rather than assign one.
- Say on a-factors and a-rules who withdraws.
- Update `README.md` and the facts count.

### R2-m7 · P2 · blocking · docs/design/admin/src/journeys/models.js:165

**In Failed and Conflicting, a-pipe puts "Waits for your yes" under the heading "Not ready for you", and it disagrees with a-rules (lessons 27, 31).**

Evidence:
- `node scripts/design_admin_text.mjs models a a-pipe error web` reads: "Not ready for you R2-HGB v4 ... incomplete Rules v6 shadow · 8 of 8 scored weeks ... Waits for your yes". Conflicting (`:168`) is the same.
- Following that row in the same state: a-rules Failed (`:135`) says "incomplete... The evaluation failed at 21:14", and a-rules Conflicting (`:138`) says "Refused... this approval could never apply".
- The `RULES` row is new in this delta, and `stages` overrides only `v4`.

Correction: pass `rules:` in both overrides, matching a-rules: `BAD('incomplete')` and `WARN('Refused', 'ban')`. Add a check that follows the row into its screen per state (lesson 31).

### R2-m8 · P2 · blocking · docs/design/admin/src/journeys/runs.js:47

**a-clock Partial says the UK record did not answer, then reports on the UK (lesson 39).**

Evidence:
- The banner (`:261`) reads "The UK record did not, so it shows unknown and never on time". The UK card reads Not read.
- In the same frame `ALARM.partial` says "Missed daily run: India Wed 10:15 · UK and US Tue · No alarm".
- `ranOK()` lists "run_8cf7 · UK · HSBC late · Succeeded".
- `RULE`, on the same card, promises a health check "never reports OK while... a daily run was missed", yet a run nobody read is reported as not missed.

Correction:
- Make the Partial row read "India Wed 10:15 · US Tue · UK not read" with `WARN('Unknown')`.
- Add an `ranOK({ noUK: true })` the way `noIndia` works, or mark the row Unknown.

### R2-m9 · P2 · blocking · docs/design/admin/src/journeys/runs.js:265

**a-clock Conflicting says the US night "counts as neither", and the card counts it as a success (lesson 39).**

Evidence:
- Banner: "It counts as neither until the reconciler settles it."
- `us(WARN('reconcile_required · Tue', 'split'))` keeps the default rows: "Watermark Tue close", "Last success Tue 21:15".
- `ALARM.conflict` (`:51`) keeps "UK and US Tue · No alarm".

Correction:
- Pass rows to `us()`: Watermark "Mon close · Tue held", Last success "Mon 21:15 · Tue held by the reconciler".
- Change the alarm to "India Wed 10:15 · UK Tue · US Tue held" with a `WARN`.

The exact watermark rule is CT-05's, so tag it as that open question.

### R2-m10 · P2 · blocking · docs/design/admin/src/journeys/home.js:5 (join from models.js:66, 158)

**Home and Approvals count 4 decisions while a scope is paused. The owner journey counts 5 (lessons 27, 31).**

Evidence:
- Owner journey `approvals.js:382`, noModel: `queueHero(5)` plus a row "Restart US tech, 12 months", and `:393`, "5 decisions".
- Admin has that pause in every state: a-pipe's "Off the path", a-live's A28, Home's "US tech 12 months paused". Yet Home says "4 decisions wait on you", and `approvals.js:218` `Q` holds 4 with no Restart row.
- The notes on a-factors and a-rules explain why those two sit outside the dated queue, and say switching forward does. No note covers Restart, which the owner journey puts inside.

Correction: add Restart to `Q`, Home and every count (5, soonest first unchanged, `expiry(WAITS)`), or record the difference in `OPEN` for the owner. Lanes f and a hold the files.

### R2-m11 · P2 · blocking · docs/design/admin/src/journeys/agents.js:59

**The R1-m12 "Proposed" labels show only in Ready and Expired. Six states print the same manifest as settled (lesson 25).**

Evidence:
- `openBits()` says "Derived values only is the triage route's rule, DATA-DEC-12" and carries ARC-06b-O4, O3 and O2.
- `manifestState` calls it only in `ok` and `expired`. Partial, Failed, Stale, Offline, Conflicting and Denied (`:59-65`) draw `manifestBox()` with "Outbound context: Derived values only" and no tag.

Correction: render `openBits()` in every state that draws `manifestBox`, or move it inside `manifestBox`. Extend `R1-m12`'s check across states.

### R2-m12 · P2 · blocking · docs/design/admin/src/journeys/models.js:139

**a-rules Expired is a dead end (lesson 28).**

Evidence:
- Banner: "Expired. It did not apply. Your approval ran out". There is no control and no next step.
- `rulesBind` and the screen's note say the proposal itself has no expiry ("Stays open"), so only the approval window closed and the proposal still waits.
- The two sibling screens offer the way on: a-decide Expired draws "Sign in and approve again", and a-live Expired says "Approve again for a new window" with A27.

Correction: add "Approve again for a new window." and `rulesYes()` with the Rules bind, as in a-live. On a phone it falls back to the iPad or desktop line by itself.

### R2-m13 · P3 · non-blocking · docs/design/admin/src/journeys/runs.js:83

**Failed run_8d02 lists models under "Exact versions and guards", and Incidents says none.**

Evidence:
- a-run Failed keeps "Models R2-HGB v3 · R1-LGB v1" and "Sources Twelve Data · Yahoo", beside "Frozen at +60: no input set".
- `incidents.js:135` says "Model: None. No forecast was written by this run". `costs.js:286` agrees with Runs.

Correction: relabel the Failed rows as what the run was set to use ("Due to use"), in Runs and Costs, or align with Incidents.

### R2-m14 · P3 · non-blocking · docs/design/admin/src/journeys/runs.js:59

**`CHECKS.partial` has a closed market failing to answer (lesson 26).**

Evidence: "India checks did not answer, so they show unknown." The screen's clock is 11:40 London and India closes at 10:00 on the same page. PH03-S10: "No check runs on a closed market". Partial's own banner names the UK as the one unread.

Correction: "Yahoo did not answer for UK listings, so they show daily status only", which is PH03-S10's negative.

### R2-m15 · P3 · non-blocking · docs/design/admin/src/journeys/runs.js:263

**a-clock Stale marks +75 Late before it was due (lesson 39).**

Evidence: the screen is "From 11:12", and all four marks are `late`, but Issue is due 11:15.

Correction: `['late', 'late', 'late', 'due']`.

### R2-m16 · P3 · non-blocking · docs/design/admin/src/journeys/agents.js:156

**`factEv` cites the wrong question (lesson 36).**

Evidence:
- The chip is `Proposed · SCI-D03`, with no sentence.
- PH05-S04's `owner_questions` is `["SCI-D04"]`. The register's SCI-D04 holds "prospective-only LLM factors when hindsight cannot be bounded" and the ablation capacity, which are the rows above the chip. SCI-D03 is the trial and qualification policy.

Correction: use `Proposed · SCI-D04` and add a sentence saying what is open.

### R2-m17 · P3 · non-blocking · docs/design/admin/src/journeys/runs.js:69

**a-run Denied (Claude off) reads "credit reserved" and carries a dangling sentence (lesson 29).**

Evidence:
- `EVID` guard row: "Calendar current · credit reserved · cutoff kept". It means market data credits, but it sits above "No verified credit... every Claude call is refused", where credit means Claude's.
- `costOff` (`:72`) ends "This is the run's date, not the cost month's." That box shows no date.

Correction: use "market data credits reserved" and drop the sentence, or print the run's date in the box.

### R2-m18 · P3 · non-blocking · docs/design/admin/src/journeys/models.js:140

**The phone wording `needSignIn` gives A25 and A29 did not reach the other acts (lesson 27).**

Evidence: on iPhone, a-rules Denied, a-live Denied (`models.js:80`), a-versions Denied (`agents.js:88`) and a-factors Denied (`agents.js:169`) open with "A fresh sign-in may be needed" above an inert "on iPad or desktop" line. a-decide and a-bands say "Change this on iPad or desktop".

Correction: route these four through `needSignIn`, or a shared helper in `shell.js`.
