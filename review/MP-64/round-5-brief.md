# MP-64 review round 5: the reviewer's brief

You are one of four independent reviewers. You saw none of the making and no earlier round. Read the files as a stranger. You are read-only: never edit,
commit, push, publish, or write to Jira or anything outside your own scratch folder.

Snapshot: branch `MP-64-admin-journeys`, commit `eacda924ea4c470026075344edc16b7cae625671`, in `/Users/arundutta/projects/mypaisaa-prediction`. Nothing is built: this is a design page.

**Scope: only what changed since `1fd5ff6` and its direct joins.** Read your lane's changes with `git diff 1fd5ff6..eacda92 -- <your files>`. Direct joins are the callers and callees of what
changed, the specification a changed file builds to, and the documents that cite it. Do not review what did not change.

## The issue and its acceptance, word for word

**MP-64:** Design every admin journey before the first build. "As the owner, I want every admin journey designed with its states and
permissions before the first build, so that audit, recovery and cost controls are part of MP from the start (ARC-08)."

Positive:

- "Journeys for Files and Imports, Audit, Runs and Health, Agents, Models and Evaluations, Approvals and Configuration, Costs and Budgets, Incidents and Recovery, and Identity and Devices."
- "Each journey covers investigation and comparison, approve and reject, source inspection, reprocessing and correction, configuration changes, cost reconciliation, the stale, conflicting, expired and denied cases, and failure, replay, restore, rollback and deletion."
- "A permission inventory lists every admin action, whether it needs step-up (ARC-07) and what it writes to the audit."
- "Cost monitoring stays reachable from the main app as well as from admin."
- "Options are made locally, synced to private Claude HTML artifacts and recorded; the owner picks one per journey."

Negative:

- "No admin action edits the ledger outside the controlled writer, promotes a model without its evidence, or deletes evidence without a recorded tombstone."
- "No household or multi-user administration is designed; MP has one owner."

Recovery: "A rejected journey gets its own new options round; chosen journeys are kept."

Done when: "The admin design files and their artifact records"; "python3 scripts/design_sync.py check passes"; "The permission inventory, with every action mapped to its step-up and audit record".

## The owner's decisions that apply, 4 November 2026

Recorded in `docs/planning/ma-reconciliation-2026-11-02/decision-log.md` under "Admin journeys" and `docs/design/reviews/MP-64/decision.md`.
Picks: Admin home B, Files A, Audit B, Runs A, Agents A, Models A, Approvals A, Costs A, Incidents A, Identity A. Admin lives under Settings.
"Under Settings, phones read only", and a phone keeps recovery: "Yes, recovery only (Recommended)". Budget changes "In admin, under Settings
(Recommended)". "Keep nine (Recommended)". Admin home and A51 accepted. iPhone passkey: "I'll join the Developer Program", nothing bought, and what lifts the bar: "The purchase (Recommended)". A lapsed approval on one scope: "Only that scope waits (Recommended)", so the owner Approvals journey changed to match. The illustrative 2 November sale in Files: "Keep it, illustrative (Recommended)". Withdrawing paid use while the billing collector has failed: "Allow it (Recommended)". May a phone acknowledge an incident: "Yes, acknowledge only (Recommended)". Does recovery on a phone also cover replay, restore and pause: "Account recovery only (Recommended)".

Review the picked option of each journey in depth. Read the other option too, because it stays on the page, but a finding only in an
unpicked option is at most non-blocking unless it crosses a rule in `AGENTS.md`.

## The rules

`AGENTS.md`, every file in `.claude/rules/`, the lessons in `.claude/rules/independent-review.md` (check every lesson that touches your
files; 25 to 39 above all) and `.codex/rules/review-checklist.md`. `.claude/rules/design-sync.md` says every design starts from Prism.

Check claims against the primary records: `ARCHITECTURE.md`, `TECH-STACK.md`, `docs/planning/story-readiness-2026-11-03/stories/*.json`,
`docs/planning/ma-reconciliation-2026-11-02/` (decision log, gap register), `docs/planning/foundation-specifications-2026-11-02/`,
`docs/planning/foundation-policy-discussion-2026-11-02.md`, and the owner journeys in `docs/design/journeys/src/journeys/`, which the admin
figures must agree with. `docs/design/reviews/MP-64/brief.md`, `fix-round-*.md` and `facts.md` and `review/MP-64/round-1*`, `round-2*`, `round-3*` and `round-4*` are working files: do not read them, and never take
`facts.md` as an authority.

## How to read a screen

The page is `docs/design/admin/index.html`, built from `docs/design/admin/src/`. It has ten states, four devices, two themes. `node scripts/design_admin_text.mjs`
lists every screen; `node scripts/design_admin_text.mjs files a a-queue conflict iphone` prints what one says. To see one, open the page in a
browser at `#files.a.iphone.conflict`, or use playwright-core at `/Users/arundutta/projects/mypaisa-agent/scripts/node_modules/playwright-core`
with `channel: 'chrome'`. Every browser command gets a hard time limit: `perl -e 'alarm shift; exec @ARGV' 60 <command>`. Compare and pick is at `#compare`,
the permission inventory at `#permissions`, the coverage matrix at `#coverage`, the states at `#inventory`.

## Your lane

| Lane | Files |
| --- | --- |
| f | `docs/design/admin/src/journeys/home.*`, `files.*`, `audit.*` |
| m | `docs/design/admin/src/journeys/runs.*`, `agents.*`, `models.*` |
| a | `docs/design/admin/src/journeys/approvals.*`, `costs.*`; `docs/design/journeys/src/journeys/approvals.js` and the changes in `tests/journey_facts/r.mjs` |
| s | `docs/design/admin/src/journeys/incidents.*`, `identity.*`; `docs/design/admin/src/shell.*`, `tests/admin_facts/*`, `review/MP-64/fixed.json`, `build.py`, `README.md`, `permissions.json`; the Compare and pick view; `scripts/design_admin_facts.mjs`, `design_admin_press.mjs`, `design_admin_text.mjs`, and the admin changes in `scripts/design_gates.py`, `design_journeys_check.mjs`, `design_journeys_facts.mjs`, `design_runtime.mjs`, `review_checks.py`, `.github/workflows/verify.yml`; `docs/design/reviews/MP-64/decision.md`; the MP-64 entries in the decision log, `gap-register.json` and `docs/planning/trace.json` |

Each lane also reports the joins into its part: a figure, id, name or promise that crosses to another journey or to an owner journey (lessons 27, 28, 31).

## The fixed list

`review/MP-64/fixed.json` holds 148 fixed findings, each with a check. These are fixed and held by a check. Never propose undoing any of it.

## The gates, so you do not repeat them

- `review_checks --base 1fd5ff6 --run`: results in `review/MP-64/round-5-checks.json`.
- `node scripts/design_journeys_check.mjs docs/design/admin/index.html`: 1,600 combinations walked, 0 problems. It measures contrast, overflow, clipped text, tap sizes, labels on badges, trade words, a back label on the iPhone title, a chip leaving the sidebar. Selftest 33 of 33.
- `node scripts/design_admin_facts.mjs`, 0 problems, `--facts`, 173 of 173 checks hold, selftest 14 of 14: ten journeys, one recommended option each, every action drawn, the coverage matrix, refusals, barred words, phone rules, a button outside `act()` that reads like a write, a named act that is drawn, an act drawn in a journey its row does not list, audit cells naming a record, Proposed ids existing in the records.
- `node scripts/design_admin_press.mjs`: Compare and pick pressed on desktop and phone widths, 0 problems.
- `node scripts/design_runtime.mjs` on mains power: admin 8 of 8.
- `review_regress --every`: 459 run, 2 retired, 0 failed. MP-64's ledger: 148 of 148.
- Journeys page: facts 251 of 251, Approvals walked, presses 163 of 163.

This is the last round the rule allows. Report what truly must not merge as blocking; polish stays P3 and non-blocking.

## What to return

Report only what no gate measures. For each finding: id (R5-<lane letter><n>), severity P0-P3, blocking yes/no, file:line, evidence, the correction.

P0 breaks the product, loses or leaks data, or crosses a non-negotiable limit in `AGENTS.md`. P1 breaks the issue's acceptance or a rule. P2 is wrong but contained. P3 is polish.
Blocking is your call: yes when the work must not merge with it. A finding with no evidence is not a finding. The correction is the smallest change that fixes it, with every record that must change with it.

Write the report to the file you are given, as `### R5-x1 · P1 · blocking · file:line` sections, then reply with its path and your counts.
