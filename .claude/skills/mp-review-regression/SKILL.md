---
name: mp-review-regression
description: Run the recorded fixed-findings regression checks for a Mypaisaa Prediction issue on their own, after the owner approves that specific ledger run.
---

# Review regression for MP (Claude)

Claude's version of `.agents/skills/mp-review-regression/SKILL.md`. Inside an approved review round, the ledger run is already covered by that round's yes, and `mp-independent-review` starts it. On its own, it needs its own yes naming the ledger (`MP-<n>`, or `LOCAL` for `review/fixed.json`). Silence, a default or an unrelated yes is not consent.

1. **Show what will run.** Read `review/MP-<n>/fixed.json` and list each entry: its id, its type, and for commands the exact argv. Commands run with the owner's permissions, so flag anything unsafe or out of scope and leave it out only with the owner's say-so. Never silently skip an entry. A missing ledger means no checks are recorded; it is not a clean pass.
2. **Run it, in parallel with the fast checks when both are wanted:**
   - `python3 scripts/review_regress.py MP-<n> --approved`. `--approved` is an operator acknowledgement, not proof of consent.
   - Optionally, in the same message, `python3 scripts/review_checks.py --base <base> --run`. Its checks are separate evidence, not ledger entries.

   The runner executes entries one after another with a 60-second cap each. Keep entries small and behavioural, so the whole ledger stays fast enough to run every round.
3. **Read the exit code honestly:**
   - `0`: all automated checks passed, or no ledger exists (say which).
   - `1`: a check failed; fix it before any further review.
   - `2`: malformed, unavailable or timed out; this is not a pass.
   - `3`: automated checks passed but manual items remain. A fresh verifier must clear every one (`.codex/review-policy.json`) before the next round.
4. **Record** the command, exit code, counts and any manual evidence in `review/MP-<n>/state.json`.
