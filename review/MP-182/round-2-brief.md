# MP-182 review round 2: the reviewer's brief

You are one of three independent reviewers. You saw none of the making and no earlier round. Read the files as a stranger. You are read-only: never edit, commit, push,
publish, or write to Jira, Confluence, an artifact or anything outside your own scratch folder under `$TMPDIR`. Do not read `review/MP-182/state.json` or any `review/MP-182/round-1*` file: they are the maker's records.

Snapshot: branch `MP-182-prototype-fixes`, commit `1484e7d635e9a43a91da469d9b9e9d84a59dcc14`, in
`/Users/arundutta/projects/mypaisaa-prediction-worktrees/MP-182-prototype-fixes`. Read and run from there, never from the main checkout. Nothing is built:
these are design prototype pages and the gates that hold them. No application code exists to review.

**Scope: only what changed since `46b631b` and its direct joins.** Read your lane's changes with `git diff 46b631b..1484e7d -- <your files>`. Direct joins are the callers and
callees of a changed function, the specification a changed file builds to, and the documents that cite it. Do not review what did not change.

## The issue and its acceptance, word for word

**MP-182:** Fix the prototype defects the Impeccable audit confirmed on the Prism pages. Bug, under epic MP-4.

Acceptance:

- "UX-15: switching theme updates every frame already drawn on Prism Journeys and Prism Admin without a reload, including frames still being drawn, and keeps flips, state and scroll."
- "UX-08: pressing a control in the option, device or state selectors keeps keyboard focus on that selector's chosen control, on both pages."
- "UX-01: the live Prism sheet takes focus when it opens, keeps Tab inside, makes the background inert, and returns focus when it closes. A closed sheet and a hidden toast take no focus."
- "UX-07: a flip survives a reload on that device, each journey on its own, and storage that is unavailable breaks nothing."
- "UX-10: no owner or admin frame text is below 12 px, and the gate refuses 11 px."
- "UX-05: the review pages do not overflow at 320 CSS px, and the header does not collide."
- "Each fix has a press check in a gate, proved to fail when the fix is undone."

Out of scope: "Owner decisions (UX-03, UX-04), the wider dead-control contract (UX-02), real-device checks (MP-180), and any change to Prism's look, the owner's picks or a safe flip rule."

## The owner decisions that apply

On how the flip behaves, 4 November 2026, in `docs/planning/ma-reconciliation-2026-11-02/decision-log.md`: "A, kept per device (Recommended)": each journey starts
in A, keeps the choice on that device and flips on its own. "Keep the strict rule (Recommended)": no flip while signed out, during a step-up, behind an open sheet,
or on a proposal, an approval or a record being written. "Yes, one side may show more (Recommended)": the figures both sides show stay the same, and one side may show more.

Designs: `.claude/rules/design-sync.md`.

## The rules

`AGENTS.md`, every file in `.claude/rules/`, the lessons in `.claude/rules/independent-review.md` (check every lesson that touches your files), and `.codex/rules/review-checklist.md`.

## The fixed list

`review/MP-182/fixed.json`, `review/MP-62/fixed.json` and `review/MP-64/fixed.json`.
These are fixed and held by a check. Never propose undoing any of it.

## Already recorded, so do not report these again

CI has no browser, so a ledger entry there can only read the source, and nothing presses these fixes in CI; `design-walk` is deferred by default. The 20% preview's taller bar covers the journey strip at narrow widths. A selector pressed during a flip can be overwritten in `#jlive`. `.jhead` is `aria-live`, so a device press may be said more than once. A quick second Enter on Record lands on Undo. MP-182 has no Jira link to MP-181. MP-181's `no_code` goes false when its PR merges. Whether a kept flip covers a screen or a journey, what "per device" means for a drawn frame, and the size of Prism's horizon demos at 400 px and under are all open questions for the owner.

## The gate results, so you do not repeat them

On `1484e7d`: `review_checks --base 46b631b --run`: python-errors, claude-workflow, agent-config, plan-sync, design-sync, design-gates, baseline-signoff, story-readiness and whitespace pass. `review_regress MP-182 --approved`: 10 of 10. `review_regress --every`: 485 run, 0 failed, 2 retired, 0 manual. `design_prism_press` holds; `design_journeys_press` 163 cases.

On `a4a72e0`, whose pages are byte for byte those of `1484e7d`: owner walk 1,152 combinations and 1,176 flips, 0 problems; admin walk 1,600 combinations, 0 problems; `design_admin_press` 0 problems; journey facts 251 of 251. On later commits: walker selftest 35 faults, `design_prism_press --selftest` 44 faults, `design_runtime` 8 of 8 on Admin and Prism.

Fails: `design_runtime` on Journeys, Chrome desktop light and dark, a long frame of about 56 ms against 50, with an open issue, MP-180.
Unavailable here: `actionlint`, `pdftoppm`. The `site` check cannot run in this worktree, which has no `node_modules`.
Not run by anyone: a real iPhone, VoiceOver, 200% text, the artifact viewer.

## Running things

Playwright is at `/Users/arundutta/projects/mypaisa-agent/scripts/node_modules/playwright-core`, launched with `channel: 'chrome'`. This Mac has no `timeout`, so every browser or long command gets a hard limit: `perl -e 'alarm shift; exec @ARGV' 120 node <script>`. Close every browser you open. Serve no public port. Keep any script you write in your scratch folder.

## What to return

Report only what no gate measures. For each finding: id (R2-<lane letter><n>), severity P0-P3, blocking yes/no, file:line, evidence, the correction.

- Severity: P0 breaks the product, loses or leaks data, or crosses a non-negotiable limit in `AGENTS.md`; P1 breaks the issue's acceptance or a rule; P2 is wrong but contained; P3 is polish.
- Blocking is your call: yes when the work must not merge with it.
- Evidence is what you read or ran and what it showed: the quoted line, the command and its output. A finding with no evidence is not a finding.
- The correction is the smallest change that fixes it, with every record that must change with it.

If you find nothing in an area, say what you checked. Do not pad.

## The lanes

| Lane | Your files |
| --- | --- |
| (f) Frames and pages | `docs/design/prism/index.html`, `docs/design/journeys/src/shell.js`, `docs/design/journeys/src/journeys/cost.js`, `docs/design/journeys/src/journeys/research.js`, `docs/design/admin/src/shell.js`, `docs/design/journeys/README.md`, `docs/design/prism/README.md`, `docs/design/admin/README.md`, and the generated `docs/design/journeys/index.html` and `docs/design/admin/index.html` |
| (s) Scripts and gates | `scripts/design_prism_press.mjs`, `scripts/design_gates.py`, `scripts/design_journeys_check.mjs`, `scripts/design_runtime.mjs`, `tests/test_design_gates.py` |
| (c) Rules and records | `.claude/rules/independent-review.md` (the lessons changed), `docs/planning/trace.json`, `docs/design/artifacts.json`, `review/MP-182/fixed.json`, and whether every record these changes touch moved with them |
