**MP-62 and MP-178, round 2, lane s: 22 findings, 16 blocking (6 P1, 12 P2, 4 P3).** Most severe first.

**R2-s1 · P1 · blocking · `docs/design/journeys/src/shell.js:24`, `shell.js:20`, `shell.js:198`**
- **Evidence:** the flip sits behind an open modal on Delete an original and Renew an original (both options, all four devices) and on `ra-source` (iPhone, phone web).
  - `elementFromPoint` at the flip's centre returns `.scrim`, so a pointer cannot reach it.
  - The keyboard can reach it. After Enter on `privacy-a-delete`: active `Flip to Centre`, `dialog: true`, `dialogHasFocus: false`.
  - Focus therefore lands outside an `aria-modal="true"` sheet holding Not now and Delete. This breaks WCAG 2.4.3 and MP-178's acceptance line on WCAG.
- **Correction:** remove the delete and renew pairs and `ra-source` from `FLIPS`, or draw no flip when `spec.sheet` is set. Add these screens to `MP-178-never`.

**R2-s2 · P1 · blocking · `shell.js:18`, `shell.js:23`, `shell.js:24`**
- **Evidence:** the flip is drawn on live approvals and drafts, against the rule in `README.md:59`, Prism, `decision.md` and the title of `MP-178-never`.
  - Refuse plus Approve or Confirm, with "Bound to": `aa-listing`, `ab-chat`, `aa-model`, `ab-model`, `aa-setting`, `ab-setting`.
  - Drafts in progress: `a-manual`, `b-manual`, `a-edit`, `b-edit`, `a-preview`, `b-check`.
  - `b-check` has a flip while `b-check-2` and `b-check-3` do not. `MP-178-never` lists 14 screens and none of these.
- **Correction:** drop these pairs from `FLIPS` and add them to `MP-178-never`, or put the exception to the owner as a change to the proposal. If they stay, every record must name which approval screens may flip.

**R2-s3 · P1 · blocking · `shell.js:196`, `shell.js:189`**
- **Evidence:** a state that does not apply on the other side is handled silently.
  - Pressing A centre in No model gives Checkup, drawn as Ready. Its note is "Settings, then Checkup…", the State chip stays No model, and no model text is on screen.
  - The reason is also lost when both sides are not applicable. Devices in Abstaining reads "This state does not apply here: A locked-out owner…" before the press and "From the checkup…" after.
  - 232 of 4,572 presses lost a shown reason (every flip, state and device, animation stubbed; no page errors and focus always landed). The same-both-ways case is on top of that.
- **Correction:** in the handler, set the note to the `This state does not apply here:` line when `sc.na[state]` is set, as `boardFor` does. Add a check that presses the flip.

**R2-s4 · P1 · blocking · `docs/design/journeys/src/journeys/privacy.js:347`, `approvals.js` `aa-queue`**
- **Evidence:** flipping changes freshness and provider status, against acceptance line 4. Rendered chips, every pair, every device:
  - `privacy-b-home` to `privacy-a-centre`, Error: "Twelve Data · error 21:14, Yahoo · Fresh" against "Twelve Data · Fresh, Yahoo · HSBC late".
  - The same pair in Stale: "HSBC stale" against "HSBC late".
  - `ab-home` and `aa-queue` show the same two mismatches.
  - A centre also keeps "Portfolio value … today" while B reads "Known value, 6 of 7 priced" and "last good run".
- **Correction:** A centre shows prices, so give it the state as it stands (no `fresh: 'default'`) with `maskValue(s)`. Apply the same to `aa-queue`. This is R1-s11's rule, applied to the other screen.

**R2-s5 · P1 · blocking · `shell.js:24`, `shell.js:29`**
- **Evidence:** A centre and B checkup do not show the same facts.
  - In Disagreement and Abstaining, A says "Models disagree on Reliance." and "The model abstained on Reliance." B Checkup has no Reliance text, so the uncertainty leaves view.
  - In Disagreement, B shows a device that has not checked in instead.
  - Nine directions do not return. B Home goes to A centre then B Checkup. A data goes to B Checkup then A centre. B Notices and B Outside go to A centre then B Checkup. `a-3m`, `a-12m`, `a-short`, `b-forecast` and `ab-notices` also do not return.
  - B Home and B Notices are Portfolio-tab screens, and they land in Settings.
- **Correction:** pair `privacy-a-centre` with `privacy-b-home`, which is the masked view. Make the second press return to the frame's origin. Test the round trip.

**R2-s6 · P1 · blocking · `docs/design/journeys/src/journeys/cost.js:266`**
- **Evidence:** B Home drops the month's figure in four states.
  - The pill reads "Cost: collector failed", "Cost: billing late", "Cost: bill differs" and "Cost: part unknown", with no amount and no age.
  - A in the same states shows £37.69 with "Stale · 39 h old", £46.42 with "Billing 39 h old", £46.73 and £39.36.
  - This breaks "same figures" and MP-142's recovery line, "the last reconciled figures with their age and a stale label".
- **Correction:** keep the amount in the pill, for example "£38 · collector failed" and "£46 · billing 39 h old". Extend `MP-178-same` to these states.

**R2-s7 · P2 · blocking · `tests/journey_facts/flip.mjs:9`, `flip.mjs:27`, `flip.mjs:41`, `scripts/design_journeys_check.mjs:140`**
- **Evidence:** the flip checks do not test the flip.
  - `--all --only flip --page` on the pre-flip page `c1fa817`: `MP-178-targets` and `MP-178-same` both hold, on a page with no flip.
  - `MP-178-same` uses a hand list of 5 pairs, Ready figures, web chips. It never follows `data-flip`, and R2-s4 sits outside it.
  - `MP-178-targets` passes with zero flips and tests "a flip exists" rather than "it comes back".
  - The walker only counts `[data-flip]`, so no gate presses one.
  - This breaks lessons 2, 8 and 9.
- **Correction:**
  - Iterate every rendered `data-flip`, on every surface and state.
  - Compare chips and an agreed figure set.
  - Fail when no flips are found.
  - Add a press pass to the walker covering caption, note, group name and focus inside any dialog.

**R2-s8 · P2 · blocking · `shell.js:167`, `shell.js:173`, `shell.js:184`**
- **Evidence:** the page's Option switch stays false after a flip.
  - After flipping Cost Home: `opt: ["A · Meter and ladder (starts here):true", …]`, why-text "Why it starts here…", hash `#cost.a.iphone.default`, while the frame is B.
  - Pairs with the same title (A notice, Devices and sessions, Warned at £60) show no sign of which side is up.
  - Pressing Stale silently returns the frame: `Home with the pill` becomes `Home with the meter`. Comparing the sides across states needs a re-flip each time.
  - The comment says the frame turns "as the app would", but the proposal is per journey.
- **Correction:** add a caption tag naming the flipped option. Keep flipped frames across state and device changes for that row, or make the flip set the row's option.

**R2-s9 · P2 · blocking · `shell.js:195`**
- **Evidence:** after a flip, `.scr` keeps its old group name: `scrLabel: "Home with the meter, light theme"` with caption "Home with the pill". This fails WCAG 4.1.2 on every flip.
- **Correction:** set `aria-label` on `scr` in the handler, as the caption is set. Add this to the press pass.

**R2-s10 · P2 · blocking · `shell.js:88`**
- **Evidence:** the flip pushes Holdings B phone web's Hide amounts off the frame in all nine states: `l: 367, r: -13, w: 36`, seen in a capture. This undoes part of fixed finding R1-j19, the Hide amounts control on phone web. The R1-j19 check and the walker both miss it, because the header sits outside `.jscroll`.
- **Correction:** make Add statement icon-only on phone web. Have the walker check that top-bar controls stay inside `.scr`.

**R2-s11 · P2 · blocking · `cost.js:280`, `cost.js:191`**
- **Evidence:** on B's over-the-line screens, the legend's "Forecast" line ends at `m.lo`, which is `fc - 6`. On Warned it finishes at £55.20 under the £60 line, while the text says "Forecast £61.20 passed £60" and the note says "the forecast past the first line". Reduced ends at £70.10 and Paused at £80.40, each under the line it passed (capture taken).
- **Correction:** when `m.lo` is set, end `.med` at `m.to`, with the band around it. Check that the end point matches `m.fc`.

**R2-s12 · P2 · blocking · `cost.js:162`**
- **Evidence:** `creditCard` ignores Empty and Error (lesson 29).
  - Empty shows "Claude gross usage £7.06" on day 1, beside "Nothing collected yet £0.00" on `cost-a-sources` and "Nothing spent yet this month." on `cost-b-log`.
  - Error shows £7.06 on the same screen as "Claude usage to 18:00 £6.71".
- **Correction:** show £0.00 in Empty and £6.71 in Error, with the matching Cash line. Hold both with a check.

**R2-s13 · P2 · blocking · `privacy.js:286-293`**
- **Evidence:** Checkup's "Looks good" list is fixed, so it contradicts "Needs you" above it.
  - Error: "Phone notifications stopped" against "Web Push on".
  - Empty: "Only this device can sign in" against "Devices 4 signed in".
  - Stale: "Last checked 14:10" against "Checked 21:15".
  - Disagreement: a revoked device against "4 signed in".
  - Every state: "oldest record 3 h", while its flip partner A data lists Cost 6 h and Forecasts 21:30 yesterday.
- **Correction:** build those rows from the state. Move a failing item out of Looks good. Use the real oldest age.

**R2-s14 · P2 · blocking · `docs/design/journeys/README.md:59-60`, `docs/design/prism/index.html:1906`, `index.html:1908`**
- **Evidence:** the maker's proposals are folded into rules (lesson 23).
  - The README states "No flip while signed out…" flat and marks only two of the four items as proposed.
  - Prism labels the Flip component `status: OWNER` (Owner-selected) and says "Each journey has its own flip" and "It is absent while…" unmarked. A `PROPOSED` constant exists and the owner has not seen this control.
  - The page's "(starts here)" and "Why it starts here" treat a proposal as settled.
- **Correction:** mark all four items proposed in the README and Prism, with `status: PROPOSED` on the flip behaviour and "Proposed" on the start-in-A copy.

**R2-s15 · P2 · blocking · `docs/planning/story-readiness-2026-11-03/stories/PH-00.json:455`, `PH-00.json:294`, `docs/design/journeys/src/shell.html:3`, `docs/design/reviews/MP-62/decision.md:147`**
- **Evidence:** the owner's decision did not reach every record (lessons 4 and 6).
  - MP-66, in the repo and on Jira, still requires "the chosen option per journey", which cannot now be recorded. The decision log names MP-66 as the next step.
  - MP-62's story still reads "so that I can choose a design".
  - The page's meta description still says "Options for the owner to pick".
  - `decision.md:147` still says "the owner picks one per journey" with no superseded note. `home.js:56` still says "until the owner picks a Cost option".
- **Correction:** change MP-66 to "the option kept, or both with a flip, per journey", and regenerate the Jira description. That write needs its own scope. Fix the meta line and the comment, and mark the `decision.md` line superseded.

**R2-s16 · P2 · blocking · `scripts/design_gates.py:776`**
- **Evidence:** the stray-token gate skips any rule whose selector is a token selector. Mutations of the real page, `check_journeys`:
  - `:root { --ink: #BBBBBB; }`, not refused.
  - `:root, .scheme-light { … }`, not refused.
  - `:root[data-theme="dark"], .scheme-dark { --ink: #333333; }`, not refused.
  - `html { --ink: … }`, refused.
  - This is lesson 11's "a second block".
- **Correction:** allow only the blocks inside the exact `tokens.css` text, and refuse a second one. Add a selftest mutation.

**R2-s17 · P2 · not blocking · `scripts/design_journeys_check.mjs:48`**
- **Evidence:** the trade check reads `textContent` only. On a mutated page, walked with `--only privacy --themes light --surfaces iphone`, two cases reported 0 problems:
  - an icon button with `aria-label="Buy Apple"` plus `<input type="button" value="Buy">`;
  - a `button.btn` reading "Execute order".
  - The selftest has no trade case, and also none for sideways scroll, identical state or clipping, which the header claims.
- **Correction:** read `aria-label` and `value`, and widen the words. Add selftest cases.

**R2-s18 · P2 · not blocking · `privacy.js:298`, `privacy.js:154`**
- **Evidence:** on the iPhone frame, `privacy-b-lost` reads "Your Mac passkey, just now", then "iPhone, last active 40 min ago", beside "Passkey, iPhone · This device". The code comment says the revoked device is never the one in your hand, and `lostSteps` ignores `target(ctx)`.
- **Correction:** use `target(ctx)` and a path that matches the frame.

**R2-s19 · P3 · not blocking · `design_gates.py` `markup()`**
- **Evidence:** the `${` skip passes `style="animation: spin ${d}s linear infinite"`, while the plain form is refused (lesson 8).
- **Correction:** test `infinite` before the skip.

**R2-s20 · P3 · not blocking · `scripts/design_tokens.py:264`**
- **Evidence:** the stale-file cases assert `check() != 1` with stdout discarded and no named failure, so any failure passes them (lesson 9).
- **Correction:** capture the output and require the stale message.

**R2-s21 · P3 · not blocking · `shell.js:14`, `privacy.js:194`, `privacy.js:214`**
- **Evidence:** "Flip to Burn-up" on Home lands on a pill, with no burn-up in view. Export in Abstaining says "Two deleted originals" while Originals shows one deleted row.
- **Correction:** name the flip "Pill" on Home. Make the two counts agree.

**R2-s22 · P3 · not blocking · `shell.js:254`, `shell.js:257`**
- **Evidence:** the state inventory never says what a flip changes or which screens have none. `cost-b-sheet`, `a-action`, `b-open`, `aa-revoke`, `ab-revoke` and others have no flip and fit no stated exception.
- **Correction:** add one line on what stays and what turns, and a flip column.

**Passed:** the owner's words match in `decision.md`, the decision log, the brief and Jira. `decision.md`'s counts hold: 120 findings, 70 blocking, 89 to 156 screens. The six new lessons cite real ids. All lane s fixed checks fail on `c1fa817`.

**Coverage:** read all three parts; rendered every pair in every state; pressed the flip by mouse, Enter and Space on all four devices in light, dark and reduced motion, on Cost only, plus a stubbed-animation press of every flip in light; mutated the gates on scratch copies; read MP-62, MP-178 and MP-66 in Jira; made no writes. **Not checked:** a real screen reader (names were read from the DOM), WebKit presses, a real device, Confluence.
