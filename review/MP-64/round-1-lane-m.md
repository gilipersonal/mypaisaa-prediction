# MP-64 round 1, lane m: Runs and health, Agents, Models and evaluations

Snapshot read: `6705fc1`. HEAD (`49f1c7d`) changes nothing under `docs/design/admin/`, so the line numbers hold for both.
Files: `docs/design/admin/src/journeys/runs.*`, `agents.*`, `models.*`. Picked options read in depth: Runs A, Agents A, Models A. Option B read too.
Paths below are relative to `docs/design/admin/src/journeys/` unless given in full.

## Counts

| Severity | Blocking | Non-blocking | Total |
| --- | --- | --- | --- |
| P0 | 0 | 0 | 0 |
| P1 | 2 | 0 | 2 |
| P2 | 11 | 3 | 14 |
| P3 | 0 | 12 | 12 |
| Total | 13 | 15 | 28 |

No finding crosses a non-negotiable limit in `AGENTS.md`: no trade, order or credential path is drawn, and every promotion stays behind the owner.

## P1

### R1-m1 (P1, blocking) The promotion evidence says calibration was checked, and hides that nothing has matured

- **Anchor:** `models.js:21` (`trial`), used by `evidenceOK` at `:24` and every state of a-evidence.
- **Evidence:** Admin says "For 3, 6 and 12 months these 8 weeks check clean running and calibration." PH04-S18 says they check "clean running and calibration on what has matured". The owner journey (`docs/design/journeys/src/journeys/approvals.js:127`) draws what that means: "Matured, 3 months: 0, first about 30 Nov", 6 months about 28 Feb, 12 months about 31 Aug 2027, and "no 3, 6 or 12-month forecast has matured yet". So the qualifier was dropped from the one screen that carries the trial, and with it the fact that no calibration evidence exists from this trial. PH06-S09 requires the "number of matured outcomes" in proof. The sentence reads stronger than the records, on the screen an owner promotes from. `AGENTS.md` requires transparent uncertainty; lessons 7, 27 and 39 apply.
- **Correction:** Copy the owner journey's "What the 8 weeks checked" rows and sentence into `trial` word for word, restoring "on what has matured". Change `models.js` only. Add a check that a-evidence carries "Matured, 3 months".

### R1-m2 (P1, blocking) The inventory misses owner acts the stories in these journeys name

- **Anchor:** `docs/design/admin/permissions.json` (51 actions, A25 at `:297`), `agents.js:170`, `models.js:171`.
- **Evidence:** MP-64 asks for an inventory of "every admin action". These owner acts have no row, and a search of `permissions.json` for "factor", "rules" and "feature" finds none:
  - PH05-S04 (MP-97, listed in Agents' own `stories`): "Only the owner promotes a factor out of shadow", state "admitted (owner-approved)". Nothing in Agents draws it.
  - PH04-S05: "Only the owner approves a rules version", and PH04-S18: "A rules change takes the same trial". A25 says "Promote a model", and the pipeline shows models only.
  - PH04-S07 and PH04-S14: "Only the owner approves a new feature block", and the owner decides "which blocks enter a candidate".
  - PH05-S12: "The owner decides which failures block a release". PH05-S05: the owner decides "any refusal-fallback".
  - Also unlisted, for the lanes that hold them: task versions and thresholds (PH04-S01, S10), an event kind's qualification (PH04-S12), a detector's use (PH04-S15), the F7 policy (PH04-S16, PH06-S07), a new source (PH05-S01), and the 30-minute listing choice (PH03-S10).
- **Correction:** Add a row per act with step-up (`open`, CT-01, where no record decides), audit and source. Say in A25, or a new row, whether a rules version goes through it. Draw factor admission and a rules candidate in Models, or record why each is outside admin. Update the counts in `decision.md` and `design_admin_facts`, and ask the owner where any act not drawn should live.

## P2, blocking

### R1-m3 (P2, blocking) Most picked Agents screens and two Models screens have no way in

- **Anchor:** `agents.js:33` and `:32` (roster), `:52` (a-route), `models.js:129-143` (a-pipe), `:25` (a-evidence), `runs.js:72` (a-run).
- **Evidence:** Each frame's only navigation is the Admin sidebar, and rows and buttons are the only doors.
  - a-roster has rows to routes and workers, and no row or control for a-memory, a-cost or a-work.
  - a-route has no control to a-versions, though its stale state says "A newer version would show in Versions".
  - a-pipe has no row or control for a-bands or a-evals.
  - a-evidence has no control to a-decide, though a-decide's back label is "R2-HGB v4". So the promotion decision is not reachable as drawn.
  - a-run shows job_3e9a as plain text, and a-job's back label is "run_8d02".
  - All 5 code-worker rows carry a chevron (`agents.js:22`, `:25`) with no worker screen behind them, for either Option.
  PH05-S15 needs the owner to list, correct and forget notes, and the page gives no route to them. Lesson 28 applies, and "The owner can see" fails in practice.
- **Correction:** Add the doors: rows for Memory notes, Route costs and Work and failures on a-roster; "Versions" on a-route; rows for Bands and Evaluations on a-pipe; a primary "Promote or reject" on a-evidence (hidden in the states that cannot approve); a tappable job row on a-run. Remove the worker chevrons, or draw one worker screen. Add a press check that each screen is reached from its parent.

### R1-m4 (P2, blocking) The picked promote screen approves away from its proof

- **Anchor:** `models.js:44`, `:188`.
- **Evidence:** `decideOK` draws head, chain, changes, the two buttons and R5. There is no trial and no score, and the evidence appears only as a hash in the rail. PH05-S14 says a proposed change "shows its expected impact, evidence, cost and how to roll it back". The comment at `models.js:165` concedes the point for Option B: "evidence first, so nothing is approved away from its proof". The owner journey puts the evidence on the decision screen. MP-64's negative is "promotes a model without its evidence": code still refuses a bad promotion, but the owner's yes is given without the figures in view.
- **Correction:** Add a compact evidence block to `decideOK`, above the buttons: 8 of 8 scored weeks, matured counts from R1-m1, and the v4, rules and base-rate scores. `models.js` only.

### R1-m5 (P2, blocking) The clock is per market, and a run is still one portfolio-wide night

- **Anchor:** `runs.js:33-37`, `:42`, `:65-66`, `:114`; `home.js:11` (lane f join).
- **Evidence:** PH03-S09 says "The US, UK and India run separately". a-clock draws that, yet:
  - run_8d02 is labelled "US close" and shows "7 of 7 priced", "HSBC last price 14:10" and models for India midcap. a-compare diffs India midcap and HSBC on US runs.
  - India shows "Issued 11:15" today, while "What ran" lists no Wednesday run, and the health row says "Last run Tue 21:15". Home says "Last run Tue 21:15 · succeeded".
  - The two other market runs exist only in unpicked Option B: run_8d6e and run_8cf7 (`runs.js:159-160`).
  - The job record says "collect · US · Tue 3 Nov" with "about 180 end-of-day listings", which PH03-S09 gives as the whole daily universe.
  The page's open questions cover the cutoff only, so this disagreement is a guess, which `plan-sync.md` rule 3 forbids. Lesson 27 applies.
- **Correction:** Add a row to `OPEN` in `shell.js`: is a forecast run per market or portfolio-wide? Meanwhile, put run_8d6e and run_8cf7 in "What ran", read the health row and Home tile per market, and drop the listing count from the US job or mark it as the daily total.

### R1-m6 (P2, blocking) Failed records missed_origin before the clock has reached it

- **Anchor:** `runs.js:79`, `:91`, `:139`, note at `:269`.
- **Evidence:** a-run in Failed shows "21:14 Twelve Data failed" then, at the same 21:14, "No input set · Recorded as missed_origin". On the same journey collection starts at 21:15 (+15), the missing-close retry is 21:40 (+40), and the cutoff freezes at 22:00 (+60). PH03-S09: "When required data is missing at the cutoff the origin publishes waiting_data or abstained". So an origin cannot be missed 46 minutes before its cutoff, and no +40 retry appears. The note calls this the "same question" as the cutoff row, and it is not: that row asks whether the cutoff is 21:00 or 22:00, and no answer places a +15 job at 21:14.
- **Correction:** Keep the owner's "Twelve Data failed at 21:14" wording, and add the failed 21:40 retry and "Frozen at 22:00: no input set, missed_origin" as later moments in `runs.js` and `failTL`. Add the 21:14 versus +15 question to `OPEN`. Check `incidents.js` for the same order.

### R1-m7 (P2, blocking) Failed says Twelve Data has been down since Tuesday while India collected on Wednesday

- **Anchor:** `runs.js:46`, `:57`, `:258`.
- **Evidence:** In the same frame, the alarm reads "Stale collector: Twelve Data, since 21:14", and the check reads "Twelve Data is failing". India shows Wed 10:15 last success and "Issued 11:15" with all four clocks done. TECH-STACK gives Twelve Data as prices "across US, UK and India", and a-job names it as the collection source. One of the two is false at this moment. Lesson 27 applies.
- **Correction:** Either draw India as failed too, or close the alarm: "Twelve Data recovered, India collected Wed 10:15", with the alarm on the missed US run only. Align `CHECKS.error`.

### R1-m8 (P2, blocking) Failed counts one dead-letter item in Runs and a second in Agents

- **Anchor:** `agents.js:141`, `runs.js:46`, `runs.js:169`.
- **Evidence:** a-work in Failed says the Explanations worker failed at 21:14 and "its item went to the dead-letter queue". Runs in Failed says "Dead-letter queues: job_3e9a · 1 item", and Option B's queues say Claude routes "0 dead-lettered". Incidents says "One outage, one incident" (`incidents.js:70`), and a-work's button opens a place holding no such incident. Lesson 27 applies.
- **Correction:** Count two items in Runs and name a second incident, or redraw a-work's Failed so nothing is dead-lettered: the item waits on the failed run. The second is the smaller change.

### R1-m9 (P2, blocking) Conflicting names three different faults for one job

- **Anchor:** `runs.js:49`, `:82`, `:106`, `:70`, `:261`.
- **Evidence:**
  - a-clock's banner says "India's run ... and its job says reconcile_required", while the alarm in the same frame names job_3e9a, which is "collect · US · Tue 3 Nov". The Tue row in that frame still reads Succeeded, though a-run and a-compare hold run_8d02 as `reconcile_required`.
  - a-run says a provider usage report "shows a call its job does not". a-job says attempt 1 has a charge and no response, and those are opposite faults.
  - a-job's ambiguous call is Twelve Data, while a-run's held cost is Claude: "Nightly explanations, Held £0.34, ambiguous".
  Lessons 27 and 31 apply.
- **Correction:** Pick one fault for the state: a Twelve Data attempt with no response on job_3e9a, held in credits per PH03-S08's ambiguous timeout. Use it on all three screens, put the US row in conflict, and drop the India banner or give India its own job id.

### R1-m10 (P2, blocking) "Exploratory" is used for a failed read

- **Anchor:** `models.js:29`, `:157` (Option B).
- **Evidence:** a-evidence in Partial says "Under 20 non-overlapping blocks answered, so this evidence is labelled exploratory until the rest reads." In PH04-S09, exploratory is a statistical property of the evidence, and "A failed or partial evaluation is reported incomplete, never green". This calls a read problem a verdict on the evidence, and still draws all the figures with no chip. Lessons 36 and 39 apply.
- **Correction:** Use "incomplete", naming what was not read, and mark the scores unread. Draw "exploratory" only if a true under-20 fixture is wanted, and say it is a property of the evidence.

### R1-m11 (P2, blocking) Seven state views reuse text the state makes false

- **Anchor and evidence (lesson 29):**
  - `models.js:81`, `:88`: a-bands Empty says "no overlay", and `bandLimits` beneath it says "Overlay: overlay active".
  - `models.js:135`, `:124`: a-pipe Partial says scores did not answer, and v4 still says "8 of 8 scored weeks" and "Ready for you".
  - `models.js:136`, `:139`, `:184`: a-pipe Failed and Conflicting keep v4 under "Waiting on you". a-evidence keeps "ready for the owner" in Failed, Conflicting and Expired, where its banner says nothing can be approved.
  - `agents.js:122`, `:113`: a-cost Partial says what is settled "shows unknown, never zero", and `HOLDS` shows "Settled ... £0.22".
  - `agents.js:36`, `:28`: a-roster Empty says no manifest is active, and the rail says "admitted · Claude is on".
  - `models.js:69`: a-live Partial says US tech "shows unknown here", and no row is drawn.
  - `agents.js:140`, `:135`: a-work Partial says code workers' work "shows unknown", and no code worker row exists in that list.
- **Correction:** Parametrise each helper by state, and draw the promised unknown row. `models.js` and `agents.js` only.

### R1-m12 (P2, blocking) The Route manifest leaves out what a manifest must name

- **Anchor:** `agents.js:47`, note at `:183`.
- **Evidence:** PH05-S06: each manifest names "model id, effort, live or batch mode, queue, tools, outbound context boundary, budget caps and forbidden operations". Tools, outbound boundary and budget caps have no row. a-route is the journey's source inspection, and its note says it "is what code enforces". For this route the records already answer tools: PH05-S03, "The route has no tools inside the batch". Outbound context: DATA-DEC-12 in PH05-S02's negative sets derived values only for triage, and event analysis still needs its own entry or an open label.
- **Correction:** Add rows Tools ("None inside the batch"), Outbound context (open label if unanswered) and Budget caps, tagged with their ids.

### R1-m13 (P2, blocking) A30 is two acts, and one writes the wrong audit record

- **Anchor:** `docs/design/admin/permissions.json:358`, `models.js:103`.
- **Evidence:** A30 is "Label calibration samples, approve release thresholds", audit "EvalLabel". A release threshold is not a label: PH05-S13 lists separately "The owner labels calibration samples and approves release thresholds", and its evidence names "The release-threshold record the owner approved". The inventory must state what each action writes. Both buttons also share one id, so `data-act` cannot tell them apart.
- **Correction:** Split A30. The threshold approval gets its own id, audit "release-threshold record; class open (CT-03)", step-up open. Update the count in `decision.md` and the second button in `models.js:103`.

## P2, non-blocking

### R1-m14 (P2, non-blocking) "uncovered" contradicts the versions compare and the route's own record

- **Anchor:** `agents.js:60`, `:68`.
- **Evidence:** a-route Conflicting says "A tool in v3 has no mapped case". a-versions shows Tools "Unchanged" from v2 to v3, and PH05-S03 gives this route no tools inside the batch. If tools are unchanged, v2 would be uncovered too.
- **Correction:** Use a fixture with a real change, or move the banner to a route that has tools, such as Chat. Add a Tools difference row on a-versions if a tool truly changes.

### R1-m15 (P2, non-blocking) a-cost Expired releases a batch the same screen says was refused

- **Anchor:** `agents.js:127`, `:113`.
- **Evidence:** Expired shows "Top-5 batch: Released", and Ready says Top-5 batch was refused, with "Refused calls reserve nothing". The state's wording also releases "the reservation", while PH02-S09 releases "only confirmed unspent liability", and Costs' Expired keeps £0.34 until reconciled (`costs.js:32`). Lesson 27 applies.
- **Correction:** Use a batch that held a reservation, and write "unused reservation released, per PH05-S02". Say how it differs from Costs' expired hold, or draw the same item.

### R1-m16 (P2, non-blocking) The ARC-06b-O3 label misnames its question, and a-cost gives two reasons

- **Anchor:** `agents.js:49`, `:112`, `:115`.
- **Evidence:** O3 is "Per-route daily caps on chat turns, tokens and tool calls" (`docs/planning/baseline-signoff-2026-11-03/README.md:131`). The label says "No per-route daily cost cap is approved". a-cost says the month is "not split by route, because no per-route cap is approved", while the rail says the split needs the Anthropic admin key (MP40-Q5). A cap does not stop a split, and PH02-S09 scopes reservations by route. Lesson 36 applies.
- **Correction:** Reword to "No per-route daily cap on turns, tokens or tool calls is approved". Give the MP40-Q5 reason only.

## P3, non-blocking

| Id | Anchor | Evidence | Correction |
| --- | --- | --- | --- |
| R1-m17 | `runs.js:250`, `:269`, `:295`; `agents.js:187`; `models.js:187` | Notes say "the question is in the report" or "named in the report". The page has no report, and its questions sit under State inventory (lesson 28). | Point to "What these screens wait on". |
| R1-m18 | `runs.js:130` | "Open a row to see the run it came from", and compare rows are plain, with no control (lesson 32). | Remove the sentence, or make the rows open. |
| R1-m19 | `agents.js:113`, `:130`; `runs.js:68` | Settled lines dated 14 and 17 Nov sit on a page dated Wed 4 Nov (lesson 26). The rail says "This page's runs are dated Wed 4 Nov", though the runs are Mon and Tue. `decision.md` lists the calendar as the maker's choice to accept. | Fix the sentence, and confirm the two calendars with the owner. |
| R1-m20 | `agents.js:28` | Ready says "Claude is on" with credit zero and unknown, and never says why, while the page says Claude stays off until credit is verified or paid use is approved. | Add "because you approved paid use", as Costs does. |
| R1-m21 | `runs.js:49-50` | Error rate drops out of the four alarms in Conflicting and Expired, unexplained. PH02-S13 names four alarms. | Keep it, and add the extra row beside it. |
| R1-m22 | `models.js:60` | "2 bad weeks" with a Brier table states the bad-week measure, which SCI-D07 still has as proposed. `changes` carries the tag and this card does not (lesson 36). | Add `Proposed · SCI-D07`. |
| R1-m23 | `models.js:61` | The restart card omits the evidence hash the owner journey binds (`d52a…08c3`), and the switch-forward card has one. A paused scope's act should show what it binds (lesson 31). | Add the row. |
| R1-m24 | `models.js:126`, `runs.js:66`, `:116` | "R1-LGB": records define R1 as ridge and logistic (`ARCHITECTURE.md:160`, PH04-S13), and LightGBM is in no record. Inherited from the owner journeys (lesson 26). | Put it to the owner, and rename everywhere together. |
| R1-m25 | `agents.js:78`, `:87` | Empty says "Route v2 is the only version", while the route's numbering and rail imply v1 and rollback. | Say "v1" or "No newer version". |
| R1-m26 | `models.js:55`, `:95` | On phones Denied says "A fresh sign-in is needed" above "on iPad or desktop", so the card names the wrong thing to do. | On a phone, lead with where to do it. |
| R1-m27 | `models.js:112`, `:103` | a-evals Stale keeps both A30 controls live under "Index lagging · from 11:12", and every other Stale in this lane withdraws its controls. | Withdraw them, or say why they differ. |
| R1-m28 | `runs.js:66`, `:68`; `costs.js:244`; `agents.js:104` | Run evidence omits Release rel_0031 and Costs omits R1-LGB, so two views of run_8d02 differ (lesson 31). "Reserved · 45 credits a minute of 55" states the cap as a reservation. A note past expiry loses its `tainted` chip at `agents.js:104`, against PH05-S15. | Align the rows, relabel it "Cap", and keep the taint chip. |

## Checked and clean

- Clock times against POLICY-002 and the exchange closes for 4 Nov 2026 (UK and US both on winter time), and weekdays for every date.
- 7 routes, their models, and the 5 code workers against PH05-S06.
- Replay ladder against PH08-S06, and retention against PH02-S13.
- Scores, 80% range, artefact and evidence hashes, expiries and calibrators against the owner journey.
- The 1.2-point, £7.06 and 192/12 sums.
- `Settings v9/v10` and the 09:01 write against Approvals.
- "Stays open · waits for your yes" comes from the owner journey (`approvals.js:257`), so I raise no finding on it.
- Step-up marks on A22 to A30 follow `permissions.json`.

An early capture showed blank frames, and they filled in after scrolling: that was lazy reveal in my screenshot, not a fault.
No fixed list exists yet. Clipboard copy is outside this lane.
