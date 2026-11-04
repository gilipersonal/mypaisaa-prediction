# MP-64 review round 5, lane m

Snapshot `eacda92`. Delta `1fd5ff6..eacda92`. `runs.js` and `models.js` changed. No `agents.*` or lane CSS file changed, so Agents sits this round out.

Counts: 11 findings. 5 blocking (1 P1, 4 P2). 6 non-blocking (2 P2, 4 P3).

### R5-m1 · P1 · blocking · docs/design/admin/src/journeys/models.js:105

**One band proposal, one page state, two answers: Models offers a live approve on what Approvals says cannot be approved (lessons 27, 31).**

Evidence, both at Expired, both under "Records current · 18:05 Wed 4 Nov":

- Models `a-bands` (changed this round): "Expired. It did not apply. Your approval closed before this applied... Approve again for a new window." Chip "Expires Mon 18:00". A29 is rendered live (checked in the HTML: `<button>` with no `disabled`).
- Approvals `aa-band` (`approvals.js:54`, `:62`): "Expired Mon 18:00. An expired proposal cannot be approved, and nothing changed." Chip "Expired". Version row "v10 · proposed · Expired Mon 18:00 · never current". A29 is rendered `disabled`. Same payload hash, `1b7c…d3e4`.
- Owner journey, `aa-setting` stale and its result (`docs/design/journeys/src/journeys/approvals.js:242`, `:258`): "Expired. It cannot be approved. The window closed on Mon 9 Nov at 18:00, before a decision."
- Approvals `aa-now` in the same state still lists the band as "Expires Mon 18:00", and Mon 9 Nov has not arrived at Wed 18:05. So `aa-band` is the outlier in time, and `a-bands` is the outlier against the owner journey.

Before this round `a-bands` said "It needs a new proposal" and drew no control, so it matched. The change split them. A29 is listed under both journeys in `permissions.json`, so the same act is open on one screen and refused on the other.

No check catches it: `R2-m4` only asks that A29 carries its evidence rows.

Correction: draw one event for this proposal at Expired. The page clock and the queue already say the proposal is open, so make `aa-band` Expired tell the approval-window story: the same banner as `a-bands`, chip "Expires Mon 18:00", version row "v10 · proposed", A29 live. Update `approvals.js:54`, `:62`, the Expired branch of its rail, and `tests/admin_facts/a.mjs:57`. Add a fact that follows A29 across both screens in each state and fails if one is live and the other disabled. Together with R5-m2, drop the old hash and date from the `a-bands` bind.

### R5-m2 · P2 · blocking · docs/design/admin/src/journeys/models.js:66, :63, :92

**a-decide Expired says the proposal stays open and, on the same screen, that it is a new proposal. R4-m4's fix did not reach the two sibling screens (lessons 3, 27).**

Evidence:

- Banner, `:63`: "The proposal stays open to Fri 18:00." The head still reads "Expires Fri 18:00".
- Rail, same state, `:66`: "Payload hash: A new one, on the new proposal". The owner has no new proposal to look at: the button is "Sign in and approve again" on the open one.
- CT-02 reserves "a new proposal" for changed inputs or a stale version. Neither happened here.
- `a-bands` Expired, drawn with a live A29 this round, keeps "Payload hash 1b7c…d3e4" and "Expires Mon 9 Nov, 18:00" under "This approval is bound to". That is exactly what R4-m4 removed from a-decide.
- `a-rules` Expired keeps "Payload hash 7ac3…e015" beside "Approve again for a new window".

So three screens answer the same question three ways: a new hash on a new proposal, the old hash and the old date, and the old hash.

Correction: change the a-decide rail value to "A new one, when you approve again" and keep the R4-m4 check as it stands. Reuse the same override for `bandBind` and `rulesBind` at Expired, so all three read alike. Extend the R4-m4 check to `a-bands`, `b-bands`, `a-rules` and `b-rules`.

### R5-m3 · P2 · blocking · docs/design/admin/src/journeys/models.js:36

**"15 minutes" reaches a promotion with no Proposed tag on the picked a-evidence, and no earlier screen tells the owner about it (lesson 36).**

Evidence:

- a-evidence Expired, web and iPhone: "The 15 minutes after you approved closed." The only tag on the screen is `Proposed · SCI-D03`, which is about scores. There is no CT-02.
- POLICY-001's 15 minutes is "an exact approved holdings import or financial correction" (`foundation-policy-discussion-2026-11-02.md:32`; `ARCHITECTURE.md:253`: "a financial approval").
- The owner journey says so outright (`docs/design/journeys/src/journeys/approvals.js:55`): every other proposal's expiry and the 15-minute window on switching forward or restarting are open under CT-02, and "POLICY-001's 15 minutes covers financial writes only".
- The owner journey draws 15 minutes only on switch forward and restart. Its promotion binds "Expires Fri 6 Nov, 18:00" and nothing else (`STEP_MODEL`, `:181`).
- `a-rules` and `a-live` Expired carry the tag under the banner: "This window is drawn as proposed." a-decide has it only in the rail.
- a-decide and a-rules in Ready never mention a window. The owner first meets the number on the failure. The owner journey says it before the yes: "Your approval then has 15 minutes to apply" (`:274`).

Correction: add `tagged(proposed('CT-02'), 'This window is drawn as proposed.')` under the banners at `:36` and `:63`. On a-decide and a-rules in Ready, add the owner journey's sentence under the bind, tagged CT-02. Add a fact: any Models screen whose text says 15 minutes also prints `Proposed · CT-02`.

### R5-m4 · P2 · blocking · docs/design/admin/src/journeys/runs.js:272

**The new 18:05 clock has the UK run succeeding on Wednesday with no HSBC caveat, while a-recover in the same state says that source cannot deliver (lessons 27, 31).**

Evidence, both at Expired, one press apart ("When it goes wrong"):

- a-clock (changed this round): UK "Issued 17:50", all four steps Done, "Watermark Wed close", `run_8dc4 · UK · issued 17:50 · Succeeded`. In Ready the UK watermark reads "Tue close · HSBC last price 14:10", and the Tuesday row says "HSBC late". The new Wednesday row and watermark say nothing about HSBC.
- The same list still shows "HSBC price late · Acknowledged", so the price has not been declared back.
- a-recover, `:159`: "Source access expired. That is why collection found nothing newer after 14:10." HSBC's source there is Yahoo, and UK listings read Yahoo.

A UK collection fully Done at 16:50 and a source too expired to read HSBC cannot both stand unless HSBC is carried as late.

Correction: at `:272`, set the UK watermark to "Wed close · HSBC last price Tue 14:10" and the row to `run_8dc4 · UK · HSBC late · issued 17:50`. Add a fact that a UK run after inc_0012 was opened names HSBC while the incident is not resolved.

### R5-m5 · P2 · blocking · docs/design/admin/src/journeys/runs.js:41-42, :175

**"What ran" leaves India out of Tuesday and Monday, and on this page a missing row means a market did not run.**

Evidence:

- `ranOK` lists India Wed, US Tue, UK Tue, US Mon, UK Mon, with no India Tue or India Mon row. "Recent runs" was added this round and does not explain two holes inside the range it shows.
- The picked option's own promise, `:249`: "A missed run shows as a gap in a place you already look."
- Option B's cost, `:295`: "A market that did not run leaves no row."
- Stale, `:269`, uses exactly this signal: `noIndia: true` drops India's row, and the banner says it has no record.
- But India did run: Stale gives "Last success Tue 10:15", and Ready shows the Missed daily run alarm clear.
- `b-list` is titled "Every run", says "Newest first", and has the same two holes. This round added UK Mon to it, so the omission now reads as deliberate.

Correction: add India rows for Tue 3 Nov 10:15 and Mon 2 Nov 10:15 to `ranOK`, `ranFailed` and `LIST`, in time order, with illustrative ids named in both screen notes. `noIndia` must drop only Wednesday's row, so Stale keeps Tue 10:15. Add a fact that each market appears once per listed day.

### R5-m6 · P2 · non-blocking · docs/design/admin/src/journeys/runs.js:55, :193, :175

**Option B, unpicked. b-list Expired says a UK run happened that its own list does not show (lessons 27, 29).**

Evidence: `ALARM.expired`, moved to 18:05 this round, also feeds the `b-list` rail: "Missed daily run: India and UK Wed", "Last collect Wed 16:50". The list beside it, `listOK()`, is newest first and starts at `run_8d6e · Wed 10:15`, with no `run_8dc4`. Only a-clock received that row.

Correction: add the `run_8dc4` row to the `b-list` Expired list, and name it in the `b-list` note.

### R5-m7 · P2 · non-blocking · docs/design/admin/src/journeys/models.js:36, tests/admin_facts/m.mjs:44

**Option A, picked. a-evidence Expired promises "approving again" with no way there (lesson 28). The fix collides with a fixed check, so it needs a decision.**

Evidence: the banner, reworded this round, reads "approving again opens a new window". The only door from a-evidence to a-decide is "Go to the decision", drawn in Ready and Denied. `R1-m3` (`m.mjs:44`) requires it to be absent at Expired. That check was written when Expired meant the evidence could "approve nothing". This round's text makes the proposal open, so the check and the banner now pull apart.

I am not proposing to undo R1-m3. Correction within it: reword the banner so it promises nothing on this screen: "The 15 minutes after you approved closed. These scores stand." If the owner wants the door, that is a decision to retire the `expired` entry from that check, with a recorded reason.

### R5-m8 · P3 · non-blocking · docs/design/admin/src/journeys/models.js:152

**The "Expired" chip survives on a-evidence after it was removed from the three sibling heads (lesson 39).**

Evidence: this round dropped `WARN('Expired')` from `promoteHead`, `rulesHead` and `bandHead`, because the proposal stays open. `EV_HEAD.expired` keeps it. So R2-HGB v4 reads "Expired" on a-evidence, "Expires Fri 18:00" on a-decide, and "Ready for you · expires Fri 18:00" on a-pipe, all at Expired.

Correction: make the chip `WARN('Approval closed')` and keep the subtitle.

### R5-m9 · P3 · non-blocking · docs/design/admin/src/journeys/runs.js:158, :271

**One status, two tones.**

Evidence: Runs draws "Reopened" through `WARN`, an amber `stale` chip. Incidents draws the same word for the same incident as `chip('error', 'Reopened', 'refresh')` (`incidents.js:38`). The `R4-s2-runs` check compares only the word.

Correction: use `BAD('Reopened', 'refresh')` in both Runs places, and compare the chip class in the check.

### R5-m10 · P3 · non-blocking · docs/design/admin/src/journeys/runs.js:238

**Option B, unpicked. b-dead Offline still says "None is held now" (lesson 39).**

Evidence: this round passed `deadOK(false)` for Partial and Stale so the screen stops claiming the present. Offline, `:238`, still calls `deadOK()`: "Showing this item from 11:20", then "None is held now". `b-queues` Offline marks every queue "Not current".

Correction: `deadOK(false)` at `:238`.

### R5-m11 · P3 · non-blocking · docs/design/admin/src/journeys/models.js:115, runs.js:260, home.js:64

**Three small joins.**

- `THRESH`: "Expires: Stays open · waits for your yes" sits directly above a disabled button and "Opens when a proposal carries its values". With no proposal there is no yes to give. Change the row to "Arrives with the proposal".
- The `a-clock` note opens "At 11:40 India has issued and the UK and US wait for their close". The note follows the screen into Expired, where the page reads 18:05 and the UK has issued. Prefix it "In Ready,".
- Home's "Last run" shows "Forecast run Tue 21:15" at Expired. Runs shows `run_8dc4`, Wed 16:50, as the newest (lane f's file). Ready has the same gap with India's Wed 10:15. Name the market, "US forecast run", which also matches the tile.

## Checked and found sound

- Clock arithmetic on all three markets, and the Nov London closes.
- 30-minute check sources at 18:05 (PH-03: Twelve Data for the US, Yahoo for the UK and India).
- Run ids run in time order.
- "The fault came back" against Incidents' "the fault recurred" and "Two sources disagree".
- CT-10 and CT-11 are the right open records for thresholds.
- BIND's Calibrator, Environment and Expected version against `STEP_MODEL`.
- The A72 disabled render on web, and its phone form.
- `lateTL(false)` and the UK-unread states.

## Counts

Total 11: P1 1, P2 6, P3 4. Blocking 5 (R5-m1 to R5-m5). Non-blocking 6 (R5-m6 to R5-m11).
