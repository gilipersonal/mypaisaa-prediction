## Round 2, lane (s): findings

I ran everything on `1484e7d`. All mutations were on copies in `$TMPDIR/mp182-s`, and the snapshot is untouched. The worktree shows only the two untracked files `round-2-brief.md` and `round-2-checks.json`, and my browsers are closed. The real pages pass everything below. Each finding is a gate that would pass a fault, not a fault on a page today.

**R2-s1 | P1 | blocking: yes | `scripts/design_runtime.mjs:153-159`**
- **Fault:** the rewritten scale measure lost a refusal the old one made (lessons 10, 58). It reads `transform` and `zoom` but not the CSS `scale` property, which computed `transform` leaves out.
- **Evidence:** I ran `.jctl { scale: .8 }` on an Admin copy with `--engine chrome --theme light --width 1440`.
  - The old form (`46b631b`) refuses it: `"Option" (span.label) renders at 9.6 px`.
  - The new form says `ok`.
  - `transform: scale(.8)` and `zoom: .8` are still refused at 9.6 and 10.4 px.
- **Correction:** also multiply by the computed `scale` when it is not `none`. Add this as a selftest case (R2-s2).

**R2-s2 | P1 | blocking: yes | `scripts/design_runtime.mjs` (no selftest), `review/MP-182/fixed.json` R1-c1**
- **Fault:** the changed measure and `sizeFloor` have no proof that they fail when undone. That breaks the acceptance line "proved to fail when the fix is undone" and lessons 8, 34 and 58 ("prove the check still refuses a page really scaled").
- **Evidence:**
  - `grep selftest` on the file finds nothing.
  - The only test reference is the path map in `tests/test_review_checks.py:55`.
  - R1-c1's ledger pattern is `const sizeFloor = `, which still passes with the floor back at 10.95 (lesson 2).
  - R2-s1 escaped for this reason.
- **Correction:** add `--selftest` to `design_runtime` with cases for 11 px, transform, zoom, `scale` and a page outside reviews, and wire it into `design-walk`. Pin `: 11.95` in R1-c1.

**R2-s3 | P1 | blocking: yes | `scripts/design_prism_press.mjs:346-351`**
- **Fault:** `narrow` now loads each page at 1000 px and shrinks it. The old form loaded at each width, as a phone does (lesson 10).
- **Evidence:** I added an at-load script, `if (innerWidth < 400) documentElement.style.minWidth = "420px"`, to the owner page.
  - The old script says `FAIL narrow: owner at 320: the page is 420 wide`.
  - The new script says `narrow hold`.
  - The real pages are clean on a fresh load at 320 and 360. That covers Prism, all three default pages, the iPad, web and PWA surfaces, and Compare, Inventory, Permissions and Coverage.
- **Correction:** keep a fresh context at 320, 360 and 390 for the overflow measure, and use resize only for the bar sweep.

**R2-s4 | P2 | blocking: yes | `scripts/design_runtime.mjs:245`**
- **Fault:** the regex `/docs\/design\/reviews\//` gives 11 px to every page under reviews. `design_gates` gives it to two named pages (lesson 52), and `mp-design-first` puts all new boards in `docs/design/reviews/MP-<n>/`.
- **Evidence:** a copy at `docs/design/reviews/MP-999/new/index.html` with `.jctl button, .jctl .label { font-size: 11px !important }` gave zero `renders at` lines. `design_gates.py:112` says "Every other page has 12".
- **Correction:** match only `reviews/MP-62/hybrid-[ab]/`, and fix the "historical option pages" wording in the header.

**R2-s5 | P2 | blocking: yes | `scripts/design_prism_press.mjs:55-75`**
- **Fault:** the acceptance says a theme switch "keeps flips, state and scroll", and the check never leaves the `default` state. Two parts of `held` prove nothing:
  - `data` has no detail in it, because no detail is pressed.
  - `row` stays 0: `#jrow` measured scrollWidth equal to clientWidth, and `scrollLeft = 60` read back 0.
- **Evidence:** a copy whose `retheme` resets the state and deletes `dataset.t` gives `theme hold`, exit 0. On that copy I loaded `#home.a.iphone.stale`, pressed Dark, and the hash became `.default`, with the state chip going from Stale to Ready.
- **Correction:** run the theme press on a non-default state with a detail open, assert the state chip and hash hold, and add the undo case. Drop the `row` arm or give it a width where the row scrolls.

**R2-s6 | P2 | blocking: no | `scripts/design_prism_press.mjs:80`**
- **Fault:** the System theme control is never pressed (lesson 32). Only Dark and Light are.
- **Evidence:** a copy whose observer repaints only when `data-theme` is present gives `theme hold`, exit 0. The real pages are fine: Dark then System goes 14/14 to 0/14 on owner, and 6/6 to 0/6 on admin.
- **Correction:** add Dark then System, with an undo case.

**R2-s7 | P2 | blocking: no | `scripts/design_prism_press.mjs:345,347,366`**
- **Fault:** the comment says "Every width for the bar", but the loop steps by 3. The overflow measure still samples six widths (lesson 55).
- **Evidence:**
  - A collision at 384-385 only (name right edge 128, switch left edge 122) gives `narrow hold`.
  - A rule making the page 700 px wide at 395-470 (scrollWidth 700 at 420) also gives `narrow hold`.
  - My 1 px sweep of 320-1100 on all three real pages found no bar collision and no overflow.
- **Correction:** use `w++`, and read `scrollWidth` inside the sweep loop.

**R2-s8 | P2 | blocking: no | `scripts/design_runtime.mjs:152-160`**
- **Fault:** `design_runtime` still ignores viewBox scale (lessons 56, 52), and the walker does not walk Prism.
- **Evidence:** a Prism copy with `svg.cx { width: 45% !important }` drew 127 labels at 5.9 px, 49 of them outside `.board`. `design_runtime` gave no `renders at` line, only frame-time issues. The real pages have 0 labels under 12 px: owner and admin across all rows and surfaces, Prism at 390 and 1440.
- **Correction:** for text inside `<text>`, measure from `getScreenCTM()` and do not count the transform loop twice.

**R2-s9 | P3 | blocking: no | `scripts/design_prism_press.mjs:312`, join `docs/design/journeys/src/shell.js:18`**
- **Fault:** "nothing can be kept for it" is a comment, not a check. `flipOK` tests only the shape of the record.
- **Evidence:** a stored record pointing `privacy-a-centre` at `privacy-b-delete` drew that frame with B's delete sheet, which the normal flip route never reaches. It needs hand-edited or stale storage. The owner's "Keep the strict rule" decision bars a flip behind an open sheet.
- **Correction:** validate the record against `flipTarget` on read, and add a case.

**R2-s10 | P3 | blocking: no | `scripts/design_prism_press.mjs:439,408`**
- **Fault:** `'unreadable storage throws'` accepts `could not finish`, so it passes without reaching its own entry (lesson 9).
- **Evidence:** on that mutation, `--only flip` printed one line, `flip: could not finish: TimeoutError`. The loop stops at the first entry (`refused storage`), before `not json`.
- **Correction:** undo only the parse path, and expect `/unreadable storage/`.

**R2-s11 | P3 | blocking: no | `scripts/design_gates.py:868`**
- **Fault:** `rel in GATED` misses an absolute path, while the branches beside it also compare `p == ROOT / …` (lesson 11).
- **Evidence:** `dg.check([str(ROOT/dg.GATED[0])])` returns 1, and the relative form of `GATED[0]` returns 0. It fails closed and I saw no caller use an absolute path, so the cost is a false failure.
- **Correction:** compare resolved paths.

## Checked and found sound
- **`tests/test_design_gates.py`:** the new test bites when the old form is restored. The copy fails for its 11 px rules, because with those replaced it passes.
- **Theme press on Admin:** a mutation resetting frame scroll on a press is refused, and so is one making frames arriving mid-draw read an old theme ("left 4 of 6 frames light"). So the Admin mid-draw case is real, even though it reloads the same view.
- **Walker change:** the `as drawn` selftest case and its third-argument plumbing are sound. Reading `.a` alone is safe today: reading both matrix axes also gave 0 under 12 px, and the two `preserveAspectRatio="none"` charts draw no `<text>`.
- **Plain gate run:** 68 s under parallel load, inside the documented 120 s limit. `design-walk`'s 1800 s limit is per step.
- **Old refusals in `sheet`, `flip` and `text`:** I read the removed lines against the new forms and none was lost. The rewritten sheet asserts are stronger.
- **Not re-run:** the 44-case press selftest and the 35-case walker selftest. I read the cases and took the counts from the brief.
