## Lane (s) findings, round 1, snapshot `46b631b`

The gate lane has 9 findings: 3 blocking (P1), 5 P2 and 1 P3. I mutated copies only, under `$TMPDIR/mp182-lane-s`, and changed nothing in the worktree. Every browser I opened was closed.

### R1-s1, P1, blocking: the header still collides at widths the gate skips
- **Anchor:** `scripts/design_prism_press.mjs:248`, with the breakpoints at `docs/design/prism/index.html:270` and `:272`.
- **Evidence:**
  - The `narrow` check tests only `[320, 360, 390]`.
  - I swept 320 to 820 in 5 px steps with the gate's own measure, then confirmed with fresh contexts and a 2D overlap test.

| Page | Width | Name right edge vs switch left edge | Overlap |
| --- | --- | --- | --- |
| Owner | 381 | 128 vs 119 | yes |
| Owner | 385 | 128 vs 123 | yes |
| Owner | 389 | 128 vs 127 | yes |
| Owner | 395 | not applicable | no |
| Owner | 600 | 247 vs 199 | yes |
| Prism | 600 | 219 vs 199 | yes |
| Admin | 600 | 225 vs 199 | yes |

  - The sweep's collision ranges are Prism 565 to 615, Admin 565 to 620 and Owner 565 to 645.
  - Screenshots show "Journeys20%" run together at 385, and "Preview at 20%" printed over "Journeys" at 600 (`shots/bar-owner-385.png`, `shots/bar-owner-600.png`).
  - The fixed list passes at 390, about 1 px above the owner collision.
- **Correction:**
  - Raise the name-hiding breakpoint above 389.
  - Hide the long switch label or the name up to about 650 px, not 560 px.
  - Change `narrow` to sweep widths instead of three samples, and add an UNDO case for each breakpoint.

### R1-s2, P1, blocking: parts of the fixes pass with the fix undone, so "proved to fail" does not hold
- **Anchor:** the `UNDO` list at `scripts/design_prism_press.mjs:291`, plus the checks named below.
- **Evidence:** each mutation below ran through `--only <check> --root <copy>`.

| Change on the copy | Check | Exit |
| --- | --- | --- |
| Delete the `#sheetClose` click handler | sheet | 0 |
| Drop `toast.inert = true` from the Undo handler | sheet | 0 |
| Drop `toast.inert = true` from `open(true)` | sheet | 0 |
| Delete admin's `matchMedia(...)` listener | theme | 0 |
| Delete the `aria-pressed` rule on both shells | narrow | 0 |
| Revert `extra = { hz: undefined, ... }` to `{ ...was.from[2] }` | flip | 0 |

  - **Not now:** line 154 says "Not now returns", but the check never presses it. The Prism spec names it.
  - **Undo mutant:** a press showed `{focused:true, inert:false, opacity:'0'}`, so a hidden toast takes focus. Line 134 tests this only before the first open. That breaks lesson 35 and the UX-01 acceptance wording.
  - **System theme:** line 93 tests the system change on the owner page only.
  - **Pressed look at 480 px and below:** with the rule deleted, `.lens` is hidden, so nothing marks the chosen control.
  - **JSON clearing:** the visible effect is narrow. It only matters for `t` set on a turned frame after a reload. The check reads `data-at` only.
  - **Checks that do bite but have no UNDO case:** mid-draw theme, `#jlive` and the `flipsLoad` catch (all three proved by my mutations), plus focus landing after Record and Undo (read only, no mutation run).
- **Correction:**
  - Press Not now.
  - Repeat the closed-focus loop after Undo and after Record then reopen.
  - Run the system-theme step on admin.
  - At 320, assert the pressed control's background differs from its sibling's.
  - Assert the frame's dataset after a reload and a turn back.
  - Add an UNDO case for each of these.

### R1-s3, P1, blocking: UX-10 fails on drawn SVG text, and the gates read only the computed size
- **Anchor:** `scripts/design_journeys_check.mjs:62` and the `text` check in `scripts/design_prism_press.mjs`.
- **Evidence:**
  - I multiplied computed font size by `getScreenCTM()` for all owner journeys, options and surfaces in the default state, under `__prismNoFit`.
  - 60 of the 642 SVG text nodes are under 12 px, all on iPad.
    - `ra-ask` and `rb-ask` (viewBox 0 0 340 168, 14 each): 11.7 px.
    - `cost-b-burn`, `-warned`, `-reduced` and `-paused` (viewBox 0 0 460 250, 8 each): 11.49 px.
  - Admin has no SVG text. Computed size reads 12 px, so the 1,152-combination walk reports 0 problems.
- **Correction:**
  - Measure SVG text as drawn in the walker and in `text`, and add a selftest fault with a scaled viewBox.
  - Fix those charts by drawing them at their rendered width or raising the label size.

### R1-s4, P2, not blocking: `narrow` accepts clipping, so UX-05's exact defect can hide
- **Anchor:** `scripts/design_prism_press.mjs:258`.
- **Evidence:** I undid the wrap on the owner page and added `.jctl { overflow: hidden; }`, and the check exited 0. Any ancestor with `overflow-x` other than visible excuses a spill, so the cut-off Phone web button would pass.
- **Correction:** assert every `.jctl` and `.pbar` control sits inside the viewport, and limit the clipping excuse to a named list of real scrollers (`#jrow`, `.toc`).

### R1-s5, P2, not blocking: `theme` does not prove "keeps state and scroll"
- **Anchor:** `scripts/design_prism_press.mjs:71-73`.
- **Evidence:**
  - Two mutations inside `retheme` passed with exit 0: resetting `.jscroll` scrollTop and `#jrow` scrollLeft, and deleting `scr.dataset.hz` and `.mode`.
  - The check reads only `data-at` and `window.scrollY`, and only in the default state.
- **Correction:** scroll a frame and the row, set a detail and a non-default state, press Dark, and compare all of them.

### R1-s6, P2, not blocking: the "historical" 11 px floor applies to every other page, and its selftest tests a floor the real run does not use
- **Anchor:** `scripts/design_gates.py:868` and `:1005`.
- **Evidence:**
  - The `else` branch lowers the floor for anything that is not Prism, Journeys or Admin, not just `GATED`. That includes any new page `rglob` finds.
  - `.cap { font-size: 11px }` on a new page gives `design_gates.py check <file>` exit 0 ("132 pair measurements pass").
  - The selftest's `font-11` case runs `check_page` at floor 12 and passes, which breaks lesson 9.
  - A copy of the Journeys page passed by file argument also lands in this branch, not `check_journeys`.
- **Correction:** apply the old floor only when `rel in GATED`, and give the selftest a case that goes through `check()`.

### R1-s7, P2, not blocking: no default run or CI step presses anything
- **Anchor:** `scripts/review_checks.py:101`, and `.github/workflows/verify.yml`, which mentions none of the walker or press scripts.
- **Evidence:**
  - `review_checks --base origin/main` prints `DEFER design-walk (broader)`. Only `--broader` or `--all` runs it.
  - The brief's `--run` list has no design-walk entry. A shell change can pass CI with UX-01, 07, 08 and 15 unpressed.
  - MP-180's runtime failure sits in the same check, so `--all` shows design-walk red until that is closed.
- **Correction:** add a CI job with Chrome, or record the deferral. Consider splitting the press steps from `design_runtime`, so a timing failure does not share a verdict with them.

### R1-s8, P2, not blocking: with 20% on, the bar covers the journey strip, and `narrow` never presses it
- **Anchor:** `scripts/design_prism_press.mjs:247`, and `docs/design/prism/index.html:267-268`.
- **Evidence:**
  - With the 20% preview on, the owner bar is 170 px tall at 320 and 152 px at 390, and Prism's is 116 px at 700. `--bar` stays at 106 px (88 px at 700).
  - After scrolling at 320 the strip sits at 106 to 158, under a bar ending at 170. The strip is gone (`shots/dim-owner-320-s.png`).
  - This breaks lesson 35.
- **Correction:** set `--bar` from the bar's measured height, and repeat `narrow` with the 20% preview on.

### R1-s9, P3, not blocking: checks that cannot fail
- **Anchor:** `scripts/design_prism_press.mjs:143`, `:159`, `:321`.
- **Evidence:**
  - Line 143 uses `?.closest(...) !== null`. A missing element gives `undefined !== null`, which is true.
  - Line 159's "nothing under the demo" can only fail if `elementFromPoint` returns null.
  - `--selftest --case 'no such case'` prints "0 faults, all refused" and exits 0.
- **Correction:** require the element to exist, delete line 159, and exit 2 when no case matches.

### Checked and sound
- **11 px forms:** all of these are refused by `check_journeys`:
  - px and `.6875rem`
  - shorthand
  - uppercase
  - `!important`
  - inline style
  - SVG attribute
  - a CSS variable
  - `max()` outside `RELATIVE_OK`
- **Forms that pass static:** JS-set sizes and the two `.amt .p` forms inside `RELATIVE_OK`. The walker's runtime check is what stands behind them (not separately tested here).
- **Mid-draw theme:** the check bites on both pages (9 of 11 and 4 of 6 frames left light).
- **Focus:** it holds 2.5 s after a press, while frames finish drawing.
- **Sheet:** it works with motion on, not only under reduced motion. Compare's 12 frames follow Dark.
- **Overflow at 320:** there is none in the 144 owner and admin journey views (default state), inventory, permissions, compare or coverage.
- **Selftest:** 23 of 23 faults refused in 160 s, inside its stated 280 s limit.
- **`design_journeys_press` init script:** it hides nothing. The walker's persistence is not contaminated, because it stays on one page and uses new contexts.

Everything in my mutation runs is under `/var/folders/7v/76z_49bd75d052d1w83w19880000gn/T/mp182-lane-s`, with screenshots in its `shots/` folder.
