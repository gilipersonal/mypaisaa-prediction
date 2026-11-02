# The reviewer brief

Every reviewer of an MP deliverable gets this brief, filled in by the coordinator, and nothing else (`.claude/rules/independent-review.md`, ported from mypaisa-agent in MP-35). One brief per lane, every lane started in one message, at most four reviewers at once. The same brief, cut to its `manual` items, goes to the one fresh verifier that an exit 3 from `python3 scripts/review_regress.py MP-<n> --approved` calls for.

A round runs only on the owner's yes to that round. This brief is never sent before that yes.

## What the reviewer gets

1. **The issue and its acceptance.** The key (`MP-<n>`), the PR number if there is one, the summary, and the acceptance criteria word for word from the Jira issue, with the owner decisions that apply.
2. **The rules.** `AGENTS.md`, every file in `.claude/rules/`, the lessons in `.claude/rules/independent-review.md`, and Codex's checklist `.codex/rules/review-checklist.md`. The reviewer checks every lesson that touches its files.
3. **The exact file list** for its lane:
   - round 1: every file the deliverable changes in the lane;
   - from round 2: only `git diff <previous reviewed_commit>..HEAD -- <lane files>` (the commit is in `review/MP-<n>/state.json`) and its direct joins: the callers and callees of a changed function, the specification a changed file builds to, and the documents that cite it. Never the whole deliverable again.
4. **The fixed list.** Every entry in `review/MP-<n>/fixed.json` (or `review/fixed.json`), with this line: "These are fixed and held by a check. Never propose undoing any of it." A retired entry is listed as retired, with its reason.
5. **The gate results**, so the reviewer doesn't repeat them: what ran, what passed, and each check that was deferred or unavailable, by name.
6. **Never the maker's notes.** No plan, reasoning, summary of the work, or discussion of an earlier round. The reviewer reads the files as a stranger. Reviewers are read-only; the coordinator makes the fixes.

## The lanes

(p) planning and specifications; (s) scripts and tests; (c) agent configuration; (d) Confluence, diagrams and motion; (b) backend. The table in `.claude/rules/independent-review.md` lists what each covers. A lane with nothing in the round's files sits the round out.

## What the reviewer returns

Give the reviewer this, word for word:

> Report only what no gate measures. For each finding: id (R<round>-<lane letter><n>), severity P0-P3, blocking yes/no, file:line, evidence, the correction.

- **Severity:** P0 breaks the product, loses or leaks data, or crosses a non-negotiable limit in `AGENTS.md` (trading, broker credentials, personalised advice); P1 breaks the issue's acceptance or a rule; P2 is wrong but contained; P3 is polish.
- **Blocking** is the reviewer's call: yes when the work must not merge with it.
- **Evidence** is what was read or run and what it showed: the quoted line, the command and its output. A finding with no evidence is not a finding.
- **The correction** is the smallest change that fixes it, with every record that must change with it (lesson 4).

## What the coordinator does with the findings

- Merges the lanes into one list. Two lanes that report at the same `file:line` become one finding under one id, naming both lanes.
- Records each in `review/MP-<n>/state.json` under the round's `findings` (`id`, `severity`, `blocking`, `lane`, `anchor`, `evidence`, `status`), with the round's `review_approval`, `gate_results`, `deferred_gates`, `manual_verification` and `next_round`, then runs `python3 scripts/review_regress.py --state MP-<n>`.
- Fixes the blocking findings and adds each to `fixed.json` with a check that tests what the fix does (lesson 2): prove it passes now and fails with the fix reverted. A ledger entry's id is the finding's.
- Turns a finding a command could have caught into a check or a test the same day, and a new lesson into `.claude/rules/independent-review.md`.
- Reports the round and asks the owner before the next one.
