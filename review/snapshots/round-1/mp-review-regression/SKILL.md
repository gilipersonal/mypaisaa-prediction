---
name: mp-review-regression
description: Run previously recorded Mypaisaa Prediction review regression checks after explicit user approval.
---

# Review regression for MP

Read `.codex/rules/workflow.md`. Ask the user to approve the specific MP issue ledger, offering `Run checks` and `Not now` via an available choice tool, even if the user initially requested the run. The only exception is when the user has approved an enclosing independent review and its named regression runs in the review question. Do not run on a default, silence, or unrelated approval.

Inspect `review/MP-<number>/fixed.json` and explain the checks, especially commands, before execution. Run `python3 scripts/review_regress.py MP-<number> --approved`. The flag is an operator acknowledgement, not proof of user consent. Commands execute locally with the user's permissions: inspect them and do not run unsafe commands or commands outside the agreed scope. Fix failures before the next review round. Report manual checks as outstanding until a reviewer verifies them; missing ledgers mean no recorded checks, not a passed review.
