# What the owner's picks change (MP-184)

All 64 questions are answered: 23 pressed on the page, and 41 by the owner's words in chat, "for the remaining pick up recommended options". The 41 are recorded as the Recommended option because that is what those words chose. 61 of the 64 are the Recommended option. `answers.json` holds each one.

Answering is not applying. Each pick is recorded here and in the decision log; an issue's section says when its picks are drawn. MP-185's, MP-191's, MP-186's, MP-188's, MP-189's and MP-190's are drawn; the rest are not yet. UX approval (MP-66) waits on the first seven issues. Permission to build is separate.

## Answered after the pack

**Do daily forecasts run inside the £15 kept above £85?** The owner, 5 November 2026: "Yes, add them". Two picks met here and neither answered it: "Daily forecasts keep running" (OWN-25) has them carry on past £85, and "Approve all three" (MP40-Q6) kept the £15 above £85 for sign-in, ledger reads, audit and recovery. The list of what the £15 covers now also holds daily forecasts. MP-190 carries it.

## What the picks need

| Effect | Decisions |
| --- | ---: |
| Screens redrawn | 20 |
| Words on screens change | 12 |
| A Proposed label comes off | 19 |
| Records only | 11 |
| Nothing changes | 2 |

Also a redraw that needs no owner choice: the owner journeys' clock wording contradicts the daily window and the per-market runs (ADM-10, ADM-11, ADM-22), carried by MP-186.

| Issue | Work | Decisions |
| --- | --- | ---: |
| MP-185 | Put cash in the portfolio total across every journey | 1 |
| MP-186 | Redraw navigation, the Home cost pill and the run clock wording | 2 |
| MP-187 | Design the Track record view in Record | 1 |
| MP-188 | Redraw passkeys and recovery to match the owner's picks | 5 |
| MP-189 | Draw the local PDF unlock and settle the offline screens | 3 |
| MP-190 | Redraw the control screens to match the owner's picks | 14 |
| MP-191 | Apply the decision rules to rows, the journal and hidden amounts | 6 |
| MP-192 | Bring labels, stories and specifications into line with the owner's picks | 32 |

## Order

1. **MP-185 first.** Cash in the total changes the shared figures every other redraw draws on. Fixed-finding checks pinned to the old total are narrowed or retired with a reason, never deleted.
2. **MP-191**, because the row rules change what the same frames show.
3. **MP-186, MP-188, MP-189 and MP-190** can run side by side once the figures hold.
4. **MP-187** goes through an options round: two options drawn, one Recommended, the owner picks.
5. **MP-192** runs last on the design records. Jira descriptions and Confluence need their own yes through `mp-plan-sync`.
6. **MP-180** then runs on the final pages: a real iPhone, VoiceOver and the long frame.
7. **MP-66**, whole-product UX approval, and separately permission to build.

## What the picks leave unproved

- **Browser passkeys.** "Allowed in the browser" and "Finish in the phone browser" rest on a test that has not run: whether Cognito passkeys work in a phone browser without Apple's paid programme. If it fails, recovery falls back to ending on one path, and MP-188 draws that too. The test needs real infrastructure and its own yes. MP-197 runs it.
- **Removing a passkey on revoke.** Whether Cognito can do it, and what happens to a synced passkey, are unverified. MP-197 tests it too.
- **Browser storage of holdings.** "Both keep the five" has no record of how a browser would protect them. That needs an architecture answer before build.
- **The Anthropic admin key.** No price is on record, and whether the account can have one is unverified. Any charge counts against £100.
- **Paid Claude at launch.** Picking it does not turn it on: paid calls still need the owner's explicit word when the time comes. The record puts an ordinary month at £54.73, inside the £70 plan and 27p under the £60 warning with the scan at its cap.
- **Values still to set.** Several picks choose a rule and leave a number open: the price grace (OWN-07), the reconciliation limit (OWN-31), the alert lines (MP40-Q11a), the upload limits (MP40-Q1), the offline time-out (OWN-37), the fresh sign-in and revocation times (OWN-39), and a replay's wait (OWN-08).

## The picks, by issue

### MP-185: Put cash in the portfolio total across every journey

| Id | The pick | How | Effect |
| --- | --- | --- | --- |
| OWN-05 | Cash in the total | pressed | Screens redrawn |

### MP-186: Redraw navigation, the Home cost pill and the run clock wording

Drawn on branch `MP-186-nav-cost-pill-clock` (23 November 2026), in the Journeys, Admin and Prism designs. The run clock now reads per market in the owner and admin pages alike: each market's cutoff at +60 and its forecasts by +75 (US 22:00 and 22:15, UK 17:35 and 17:50, India 11:00 and 11:15), and Twelve Data fails at 21:16, after the US run starts (ADM-10, ADM-11, ADM-22). Proposed: the order and icons of the three new sidebar places, and the pill's pounds masked when amounts are hidden.

| Id | The pick | How | Effect |
| --- | --- | --- | --- |
| OWN-02 | Add them to the sidebar | pressed | Screens redrawn |
| OWN-06 | Pill on every Home | pressed | Screens redrawn |

### MP-187: Design the Track record view in Record

Drawn on branch `MP-187-track-record` (24 November 2026), as an options round in the Journeys design: a ninth journey, Track record, with Scorecard (A, Recommended) and One table (B), a flip between them, and the Journal / Track record switch at the top of Record. Live forecasts only, by horizon, holding, model and regime, over 30, 90 and 365 days. The owner picked "A · Scorecard" on 24 November 2026 (`docs/design/reviews/MP-187/README.md`); One table (B) stays drawn, labelled not picked. Proposed: a rate shows once 30 forecasts have scored (SCI-D03), and the regime rule (SCI-D04).

| Id | The pick | How | Effect |
| --- | --- | --- | --- |
| OWN-24 | A view in Record | pressed | Screens redrawn |

### MP-188: Redraw passkeys and recovery to match the owner's picks

Drawn on branch `MP-188-passkeys-recovery` (23 November 2026), in the Privacy journey, the admin Identity journey, the admin permission inventory and Prism, which gains an Unverified label. The browser passkey and the removal on revoke are labelled Unverified · MP-197, and the one-path fallback is drawn beside the browser finish.

| Id | The pick | How | Effect |
| --- | --- | --- | --- |
| ADM-04 | Allowed in the browser | pressed | Screens redrawn |
| ADM-15 | Finish in the phone browser | pressed | Screens redrawn |
| ADM-13 | Redraw Privacy now | pressed | Screens redrawn |
| ADM-02 | Revoke removes it too | pressed | Words on screens change |
| ADM-03 | Any healthy path | pressed | Words on screens change |

### MP-189: Draw the local PDF unlock and settle the offline screens

Drawn on branch `MP-189-pdf-unlock-offline` (23 November 2026), in the Holdings and Privacy journeys, the browser offline frames of every owner journey, and the admin Files and Identity journeys. A locked PDF opens in a new Unlock a PDF step on the device. A browser's offline copy says how a browser protects it is unverified, and the offline time-out shows as not set yet: no number is drawn.

| Id | The pick | How | Effect |
| --- | --- | --- | --- |
| MP40-Q12c | Both keep the five (not the Recommended option) | pressed | Words on screens change |
| OWN-37 | Saved copy also times out | pressed | Words on screens change |
| MP40-Q2 | Local unlock step (not the Recommended option) | pressed | Screens redrawn |

### MP-190: Redraw the control screens to match the owner's picks

Drawn on branch `MP-190-control-screens` (23 November 2026), in the Journeys and Admin designs and the admin permission inventory, with the owner's later "Yes, add them" for daily forecasts inside the £15. One act the rule leaves unclear, acknowledging an incident under OWN-39, stays open for the owner. Stories that word the old rules (MP-114, MP-103, MP-145) are MP-192's.

| Id | The pick | How | Effect |
| --- | --- | --- | --- |
| OWN-35 | Code may draft one (not the Recommended option) | pressed | Screens redrawn |
| ADM-23 | Code marks it | pressed | Screens redrawn |
| OWN-25 | Daily forecasts keep running | in chat | Words on screens change |
| ADM-08 | Code on trigger, or you | in chat | Screens redrawn |
| ADM-09 | Use the best simple baseline | in chat | Words on screens change |
| OWN-16 | An open session is enough | in chat | Screens redrawn |
| OWN-39 | Anything that writes or widens | in chat | Words on screens change |
| OWN-34 | Once in 24 hours | in chat | Words on screens change |
| OWN-36 | Cut in a set order | in chat | Words on screens change |
| ADM-06 | No, keep it apart | in chat | Words on screens change |
| ADM-07 | Record it, keep the outputs | in chat | Screens redrawn |
| ADM-24 | Tie to month and release | in chat | Words on screens change |
| MP40-Q11a | Your lines, no investment wake-ups | in chat | Words on screens change |
| MP40-Q11b | Weekdays only | in chat | Screens redrawn |

### MP-191: Apply the decision rules to rows, the journal and hidden amounts

Drawn on branch `MP-191-decision-rules` (23 November 2026), in the Journeys and Prism designs. Stories and specifications that word the old rule (MP-158, MP-135, MP-144, MP-84) are MP-192's.

| Id | The pick | How | Effect |
| --- | --- | --- | --- |
| OWN-15 | Any time evidence shows | pressed | Screens redrawn |
| OWN-09 | Evidence first | pressed | Screens redrawn |
| OWN-17 | Both parts go | in chat | Screens redrawn |
| OWN-18 | Mask units too | in chat | Screens redrawn |
| OWN-20 | No score, no action | in chat | Screens redrawn |
| OWN-32 | Conflict at every long horizon | in chat | Screens redrawn |

### MP-192: Bring labels, stories and specifications into line with the owner's picks

Recorded on branch `MP-192-records-follow-picks` (24 November 2026), in the written records: the story pack, the foundation specifications, the gap register and planning pack, the root documents and the Confluence generator. The records also follow the picks MP-188, MP-189, MP-190 and MP-191 drew (MP-114, MP-103, MP-145, MP-158, MP-135, MP-144, MP-84 among them). Values a pick leaves open are recorded as open. Not yet done: the open lists and Proposed labels on the Journeys and Admin pages, the Jira descriptions of the changed stories, and the Confluence pages; each waits on its own yes.

| Id | The pick | How | Effect |
| --- | --- | --- | --- |
| OWN-22 | One tap in, reword MP-153 | pressed | Records only |
| OWN-03 | Watch only | pressed | Records only |
| MP40-Q12b | Any window width | pressed | Records only |
| MP40-Q5 | Adopt the key | pressed | A Proposed label comes off |
| OWN-28 | Cause cleared, fresh approval | pressed | A Proposed label comes off |
| ADM-19 | All three, as drawn | pressed | A Proposed label comes off |
| OWN-04 | Approve paid Claude at launch | pressed | A Proposed label comes off |
| OWN-07 | Approve the proposed limits now | in chat | A Proposed label comes off |
| OWN-10 | Sourced proposal, then approve | in chat | Records only |
| OWN-14 | Show it, not picked | in chat | A Proposed label comes off |
| OWN-19 | Whole history only | in chat | A Proposed label comes off |
| OWN-26 | Use the provider's daily bar | in chat | A Proposed label comes off |
| OWN-27 | As proposed | in chat | A Proposed label comes off |
| OWN-31 | Withhold only if material | in chat | A Proposed label comes off |
| OWN-33 | A lower score is enough | in chat | Records only |
| MP40-Q8 | Factsheets you supply | in chat | Records only |
| MP40-Q10 | Official sources first | in chat | Records only |
| OWN-01a | Whole journey | in chat | Records only |
| OWN-01b | Your real devices only | in chat | Nothing changes |
| MP40-Q1 | Set from your real statements | in chat | A Proposed label comes off |
| MP40-Q4 | Add all three | in chat | Records only |
| MP40-Q7 | Stay with no private network | in chat | Records only |
| MP40-Q12a | Your own devices only | in chat | Records only |
| MP40-Q13 | Widgets and share first | in chat | A Proposed label comes off |
| MP182-3 | Accept the shrink | in chat | Nothing changes |
| OWN-08 | By kind, as drawn | in chat | A Proposed label comes off |
| OWN-21 | 15 minutes, as drawn | in chat | A Proposed label comes off |
| OWN-29 | It stays, undated | in chat | A Proposed label comes off |
| ADM-05 | Code flags, you confirm | in chat | A Proposed label comes off |
| ADM-20 | Code cancels, orphans yours | in chat | A Proposed label comes off |
| MP40-Q6 | Approve all three | in chat | A Proposed label comes off |
| MP40-Q9 | Same day, as drawn | in chat | A Proposed label comes off |
