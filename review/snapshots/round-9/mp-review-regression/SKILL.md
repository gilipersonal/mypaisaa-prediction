---
name: mp-review-regression
description: Run previously recorded Mypaisaa Prediction review regression checks after explicit user approval.
---

# Review regression for MP

Read `.codex/rules/workflow.md`. Ask the user to approve the specific MP issue ledger, offering `Run checks` and `Not now` via an available choice tool, even if the user initially requested the run. The only exception is when the user has approved an enclosing independent review and its named regression runs in the review question. Do not run on a default, silence, or unrelated approval.

Inspect `review/MP-<number>/fixed.json` (or `review/fixed.json` for LOCAL work) and explain the checks, especially commands, before execution. Run `python3 scripts/review_regress.py MP-<number> --approved` or use `LOCAL`. The flag is an operator acknowledgement, not proof of user consent. Commands execute locally with the user's permissions: inspect them and do not run unsafe commands or commands outside the agreed scope. Fix failures before the next review round. Exit 3 means manual verification remains: follow `.codex/rules/review-ledger.md` and record evidence before the next round. Missing ledgers mean no recorded checks, not a passed review.

Follow `docs/review-optimisation.md`: run every recorded check for the deliverable, independently of the latest delta. Keep each check focused on the behaviour it protects; do not add unrelated whole-codebase suites to individual entries. A slow or unsafe entry is not silently skipped: report it and ask for an explicit decision; without its required evidence the regression run is incomplete. The current runner executes every entry sequentially. Do not manually skip duplicate entries; deduplication and parallel scheduling are future implementation options, not current capabilities.
