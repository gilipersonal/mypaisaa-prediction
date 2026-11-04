# MP-64 round 2, lane a: Approvals and Costs

Files: `docs/design/admin/src/journeys/approvals.*`, `costs.*`, against `6705fc1..0d1ab4e`. The branch head `8bd2b0a` changes nothing under `docs/design/admin/`, so line numbers hold for both.

**Counts: 21 findings. P0 0, P1 2, P2 10, P3 9. Blocking 11, non-blocking 10.** All 11 blocking findings are on a picked option's screens. Code shared with an unpicked option repeats there.

How it was read: source of all four files, every state's text through `design_admin_text.mjs`, and a scratch walk of every `act()` per screen, state and device (`acts.mjs` in this folder). A full-page capture left most frames unrevealed by the page's animation, so **no visual judgement was made**; layout findings are absent because they were not assessed, not because they passed.

Checked and clean: every sum on the Costs screens recomputes in all states (bill, usage, estimate, held, the conflict month, the lower bound, the ten and nine lines of option B, the AWS and Claude splits). The owner-journey figures agree: `MONTH`, the lanes, `£54.73`, `£46.48`, TSM's `18,360` to `18,411`, `2d7a…b310`, `7f3a…c21e`, `1b7c…d3e4`, 21:18, 21:33, 21:22. `MP40-Q5`, `Q6`, `Q9`, `Q11` each cite the right question. Models' A29 band agrees with `aa-band`, and the 5-point overlap reads the same on both.

---

### R2-a1 · P1 · blocking · docs/design/admin/src/journeys/costs.js:174

**A live write sits directly under the sentence that says it cannot happen.** In `ca-credit` Offline the banner reads "Paid use cannot be changed until you reconnect" and the rail prints R16, "No financial write offline. Nothing can be changed until you reconnect." The next control, `act('A76', 'Withdraw paid use')`, is not gated. The walk gives A76 live in default, empty, partial, error, stale, offline, conflict, expired, on iPad and desktop. Same on `cb-credit`, through the shared rail.

Rule: R16, and `.claude/rules/independent-review.md` lesson 32. R1-a13 fixed this class for A37 in Approvals; A76 is new since then.

Correction: `const stop = ['offline', 'error'].includes(s)` and `${stop ? off(act('A76', ...)) : act('A76', ...)}`. Add a ledger check that presses the state, not the text: A76 must carry `disabled` in Offline and Failed.

### R2-a2 · P1 · blocking · docs/design/admin/src/journeys/costs.js:209

**A budget change does not show what MP-114 requires of a setting.** MP-142 says "budget changes are settings (PH05-S14)". MP-114 positive: "Each setting has a versioned schema with allowed ranges; a proposed change shows its expected impact, evidence, cost and how to roll it back". `CH_WHY` has impact, cost and rollback. It has no evidence and no allowed range, and its card is titled "Impact, cost and rollback" (`:212`). The comment at `:207` claims "The same shape as a settings proposal", but `SET_WHY` (`approvals.js:40`) has an Evidence row and `aa-propose` has an Allowed range row. The "Who did what" chain is also absent.

Correction: add `['Evidence', '', 'This month's forecast', 'Up to £59.73, from the saved figures to 21:15.']` and `['Allowed range', '', 'Inside the £100 ceiling, below £75', ...]`, marked `proposed('CT-13')` because no record sets a range. Retitle the card "Impact, evidence, cost and rollback" at `:212` and `:217`. Partial must also show Evidence as "Not checked".

### R2-a3 · P2 · blocking · docs/design/admin/src/journeys/costs.js:204

**There is nowhere to say which line, or what value.** `budgetRail` offers A58 "Change a line", and the next screen, `ca-change`, opens at "£60 to £55 · you drafted this". `changeCore` has no field, no choice of line and no "Run the check". `aa-propose`, the same A58 act, has a value field, a reason field and a check. Allocations have no way in at all, though A34 is "Change a threshold or allocation" and MP-103 lets the owner change either. The note "An example, labelled so" explains the £55, not the missing step. This is what R1-a3 asked for, half met (lesson 28).

Correction: add the draft to `ca-change` before the preview: a choice of line or allocation, a value field, a reason, each shut on a phone as `aa-propose` does, using `field()` semantics. Or route "Change a line" through `aa-propose` with a Budgets head. Update the `ca-change` note and `cb-change`, which shares the code.

### R2-a4 · P2 · blocking · docs/design/admin/src/journeys/costs.js:216

**A budget change can be rolled back only from the moment it was applied.** A32 appears once in `costs.js`, in `ca-change` Empty. `ca-budget` (`:178-205`) names no current version, no previous version and no rollback, though it says "each change writes a new version". `covers.recover` points at `ca-change`, whose Ready is a pending change. Once the owner leaves that screen there is no route back. MP-114 recovery: "Every applied change keeps the previous version; a rollback creates a new version equal to the old one".

Correction: add a Versions block to `ca-budget`, in the shape of `versions()` at `approvals.js:65`: current, previous kept, rollback control shut offline and denied. Move `covers.recover` for both options to `ca-budget`.

### R2-a5 · P2 · blocking · docs/design/admin/src/journeys/costs.js:216

**Rolling back a budget is drawn as a change with no required step-up.** MP-103: "Only the owner changes a threshold or an allocation, with step-up." A rollback from £55 to £60 moves a threshold. It is drawn with A32, whose `step_up` is `open`, so the screen shows `Proposed · CT-01`. The forward change, A34, shows "Asks for a fresh sign-in". The same line therefore needs less to move back than forward.

Correction: draw it as `act('A34', 'Roll back to v1')`, which carries step-up yes and the right audit row. Then A32 leaves `costs.js`, which also closes half of R2-a20. Keep A32 `open` for other settings; the band case is an open question for CT-01, not this finding.

### R2-a6 · P2 · blocking · docs/design/admin/src/journeys/costs.js:159

**Costs' Failed and Stale tell two different stories on one journey (lesson 27), and Failed reports a normal condition as a fault.** `ca-credit` Failed says "Claude usage stops at 18:00. The figures after that did not arrive." But usage "to 18:00" is Ready (`LANES.default`, "Every six hours · to 18:00", Age 3 h, fresh), and `LANES.error` (`:89`) keeps Anthropic fresh in Failed. The month's failure is the AWS collector, and the chip above the card says so: "Collector failed 06:10". The card then offers `btn('Try again')`, while `ca-line` Failed says "Nothing here is retried by hand" (`:120`) and MP-89 says a failed run "is retried at the next window".

`ca-credit` Stale (`:160`) does the same: the chip reads "Billing 39 h old" (`:22`), the banner reads "Anthropic usage is older than one window", and `LANES.stale` shows Anthropic Age 3 h, fresh.

Correction: Failed becomes a banner, "The AWS collector failed at 06:10. Claude usage still reads, to 18:00, and the next report comes at its window. Cash stays counted in full.", with no Try again. Stale becomes "AWS billing is 39 hours old, so optional work waits. Anthropic usage is on time, and credit stays unknown.", tagged `MP40-Q6`.

### R2-a7 · P2 · blocking · docs/design/admin/src/journeys/approvals.js:103

**`aa-listing` Failed shows the check that failed as done.** The card: "The coverage probe stopped at 09:14 ... nothing can be confirmed until a check finishes." The rail on the same screen, under "What code checked": "Coverage: Twelve Data end of day, Yahoo delayed", "Busiest minute: 30 of the 45-credit cap, unchanged". `checks(false)` (`:96`) changes only the Rights row. MP-74: "the proposal shows as not yet checked". Lessons 29 and 39. Partial is true to this rail; Failed is not.

Correction: `checks` takes which rows finished. In Failed, Coverage reads "Timed out, no result" and Busiest minute and Rights read "Not finished". Keep Identity only if the head still resolves it.

### R2-a8 · P2 · blocking · docs/design/admin/src/journeys/approvals.js:190

**A change the owner drafts never reaches a decision.** A31 "Approve this change" is shut in every state on every device (walk: live in none). No state of `aa-propose` shows a value with all four checks passed: `CHECKS` is "Waits for a value", "Not checked", or two of four in Partial. So "Run the check" leads to nothing drawn. `covers.config` for Option A is this screen, and the note promises "It takes the same path as Claude's: code checks it, then you decide." Unlike `aa-band`, it has no "How this can end" (lesson 28). The inventory's "drawn" column lists A31 only because a disabled button counts.

Correction: add one state or screen that draws the checked draft, with all rows answered, the bound card and A31 live, plus `ends()` for it. A new screen, `aa-checked`, is the smallest way, since all ten states of `aa-propose` are in use. Strengthen the gate: an inventory action live in no state on no device is reported unless the page says what it waits on, as `aa-policies` does.

### R2-a9 · P2 · blocking · docs/design/admin/src/journeys/approvals.js:66

**One action, one state, two answers.** `shutRb` covers Offline and Denied only, so A32 is live in `aa-band` Failed, with the chip "Records failed 11:38 · last good 11:20", and in Partial. `ab-outcomes` (`:252`) shuts the same A32 in Failed. `aa-policies` (`:150`) shuts A37 in Failed and Partial, which is R1-a13's fix. The picked option is the loose one: a rollback is offered against versions the screen cannot vouch for.

Correction: `shutRb = ['offline', 'denied', 'error', 'partial'].includes(s)`.

### R2-a10 · P2 · blocking · docs/design/admin/src/journeys/approvals.js:183

**A live primary button on a read-only phone.** `aa-propose` Conflicting on iPhone reads "Changes happen on iPad or desktop", "Run the check: on iPad or desktop", then `bs('Start again from v10', 'primary')`, live. It starts a draft (A58, phone off) and leads to a screen with every field shut. Owner: "Under Settings, phones read only". The gate's "reads like a write" list misses "Start again". `bs('Choose a setting')` (`:178`) has the same fault in Empty.

Correction: draw both through `act('A58', ...)`. Add "start again" and "choose" to the gate's word list in `scripts/design_admin_facts.mjs`, with a selftest case.

### R2-a11 · P2 · blocking · docs/design/admin/src/journeys/costs.js:174

**Two withdrawals are a bare button (lesson 28).** "An option the owner may pick alone must draw every outcome itself."

- A76 "Withdraw paid use": no screen says Claude turns off, chat and research show as unavailable, the forecast falls to £46.48, or what happens to work already reserved. No ending and no bound card. Compare A35 beside it, which has "Exactly what would change".
- A37 "Withdraw S10, Yahoo" (`approvals.js:153`): the only text is "Withdrawing one stops that use". MP-63 recovery: "new use stops at once, cached projections and affected derivations become unavailable for that use, and stored data, backups and models follow the treatment the owner approves under DATA-DEC-04".

MP-114: "a proposed change shows its expected impact, evidence, cost and how to roll it back before I approve it".

Correction: give each an "Exactly what would change" and a "How this can end" card, reusing `deltaCard` and `ends()`. A76: Claude on to off, £54.73 to £46.48, open reservations settle, and reversing it is A35. A37: what stops, what becomes unavailable, disposition pending under DATA-DEC-04.

### R2-a12 · P2 · non-blocking · docs/design/admin/src/journeys/costs.js:210

**Ready's approval has expired by the clock its own screen declares.** `ca-change` says "This screen shows the cost month, day 18 of 30" with "Estimates to 21:15", and usage "to 18:00" is 3 hours old. The change "Expires today 18:00", and A34 is live. `PAID_BIND` (`:169`) has the same "Today, 18:00" under the same clock. Costs' opening comment makes clocks a rule, and lesson 27 applies.

Correction: "Tomorrow, 18:00" in `CH_BIND`, `chHead`, `changeRail`, `PAID_BIND`. "Expired at 18:00" then reads as a later moment, so the `ca-change` note should say so, as `aa-band`'s does.

### R2-a13 · P3 · non-blocking · docs/design/admin/src/journeys/approvals.js:158

`aa-policies` Empty says "No ranking version, threshold, scope change or extension is proposed", above a card chipped `draft_policy` and a card chipped `proposed`. `FAM` (`:197`) also lists a draft under the heading "In force". Correction: Empty reads "Nothing here can be decided yet. Each card says what it waits on."; rename the section "Where each stands", or mark the ranking row "Not in force · draft".

### R2-a14 · P3 · non-blocking · docs/design/admin/src/journeys/approvals.js:184

`aa-propose` Expired says "Its result passed its time" and Conflicting keeps a typed value, yet both pass no `rows`, so 8% sits beside "Waits for a value" in all four rows (lesson 39). Correction: pass `rows` of "Expired" and "Not checked".

### R2-a15 · P3 · non-blocking · docs/design/admin/src/journeys/costs.js:22

The cost clock keys on the state's word, not the screen's moment. `ca-change` Empty draws the change just applied, on day 18's proposal, under "New month ... day 1 of 30". `ca-change` Failed is a write that failed, under "Collector failed 06:10". Correction: `cp` takes an override, and `ca-change` keeps "Estimates to 21:15" in both.

### R2-a16 · P3 · non-blocking · docs/design/admin/src/journeys/approvals.js:62

`bs('See the rebuilt proposal')` in `aa-band` Failed and Conflicting promises a proposal the state says is still being rebuilt ("Code rebuilds the proposal"), and nothing is drawn behind it (lesson 28). Correction: remove the button, and say "It returns to In force when it is ready."

### R2-a17 · P3 · non-blocking · docs/design/admin/src/journeys/costs.js:230

`bs('Not now', 'plain')` has no ending: nothing says whether the draft stays until 18:00 or goes. It is also the screen's only "reject", which `covers.decide` counts. `ca-change` Conflicting says "Draft it again on the new version" with no control for it, where `aa-propose` has "Start again from v10" (`:221`, Expired likewise). Correction: one line in the rail, "Not now keeps your draft until it expires. Nothing changes.", and a draft-again control through A58.

### R2-a18 · P3 · non-blocking · docs/design/admin/src/journeys/costs.js:203

`ca-budget` Denied shuts A58 "Change a line". The inventory says A58 needs no step-up ("a draft changes nothing"), and `aa-propose` Denied keeps the same A58 live. Correction: `live` depends on offline only; "Sign in again" stays.

### R2-a19 · P3 · non-blocking · docs/design/admin/src/journeys/agents.js:116

Join. The same row, Event analysis on 17 Nov, reads "Settled. Usage replaced the hold" in `costs.js:130` and "Settled. The bill replaced the hold" in `agents.js:116`. The owner journey `cost.js:182, 331` also says bill. Costs' own screens say Claude has "No bill yet" (`:263`), so the word in Costs is the true one and the others are wrong. Correction: change `agents.js:116`. The owner journey is outside MP-64, so raise the same word change there as a follow-up issue rather than editing it here. `tests/admin_facts/m.mjs:118` only bars the old wording in Partial and stays valid.

### R2-a20 · P3 · non-blocking · docs/design/admin/permissions.json

Each action's `journeys` field disagrees with where it is drawn: A08 is listed for `files` and drawn in `approvals`; A58 is listed for `approvals` and drawn in `costs`; A32 likewise. The page's Permission inventory is right, because it uses `drawnWhere()`, so only the JSON is stale. A command catches this. Correction: fix the three rows, then make it a check in `scripts/design_admin_facts.mjs`, comparing `act()` ids by journey with `journeys`.

### R2-a21 · P3 · non-blocking · docs/design/admin/src/journeys/costs.js:88

MP-89: Anthropic collection runs "through an Anthropic admin key only if the owner adopts one ... until then that collection shows as unavailable". MP40-Q5 is open, so that is today's truth. The owner cost journey draws it (`abstention`, "Claude unknown"). Costs carries only the `MP40-Q5` tag, and no admin state draws reconciling a month with Claude unknown. Correction: draw it in `ca-lines` Partial or `ca-credit` Partial, as owner `MONTH.abstention`, or list it on the State inventory as a question MP40-Q5 closes.
