---
name: mp-independent-review
description: Run an approved independent review round of a Mypaisaa Prediction deliverable with fresh blind reviewers in parallel lanes, selected fast checks and the fixed-findings ledger. Use only after the owner has said yes to that specific round.
---

# Independent review for MP (Claude)

Claude's version of `.agents/skills/mp-independent-review/SKILL.md`. Consent follows `.claude/rules/independent-review.md`: **one yes covers one round** and its named regression run. Ask again before every later round, up to five. A no or any other answer stops the review; report the work as unreviewed and list the gates that ran. Consent here never covers a PR, merge, issue closure, plan sync or publication.

## Offer (end of the work, with any ship question)

Name the round number, its lanes, the checks that will run (from `python3 scripts/review_checks.py --base <base>`) and the ledger run (`python3 scripts/review_regress.py MP-<n> --approved`, or `LOCAL` with no issue). Never invent an MP key.

## Run an approved round, fast

1. **Freeze the snapshot.** Commit the deliverable first and record the commit as `reviewed_commit` in `review/MP-<n>/state.json`. For round 2 and later, the base is the previous round's `reviewed_commit`.
2. **Start all the gates in one message, as parallel Bash calls:**
   - `python3 scripts/review_checks.py --base <base> --run --record review/MP-<n>/round-<N>-checks.json`. Add `--reuse review/MP-<n>/round-<N-1>-checks.json` from round 2 on; this reuses a pass only where its inputs are byte-identical. Add `--broader` when the risk table in `docs/review-optimisation.md` calls for it (security, schema/import, ledger, model targets or cutoffs, shared components).
   - `python3 scripts/review_regress.py MP-<n> --approved`. The whole ledger runs every round, whatever the delta.
   - If the ledger has outstanding manual items: one fresh verifier agent per `.codex/review-policy.json`. It records finding ID, evidence, verifier and result in the state file. Any unverified item stops the round.

   Fix any failure before reviewers start. Deal with every `UNMAPPED` path by choosing its checks; unknown impact means expand, not assume isolation. Report `DEFERRED` and `UNAVAILABLE` checks as exactly that, never as passes.
3. **Choose lanes from what changed** (`git diff --name-only <base>..HEAD`). Use only the lanes the delta touches; unchanged lanes sit out. At most four reviewers, so five agents including you.

   | Lane | Covers |
   | --- | --- |
   | Code and tooling | `backend/`, `scripts/`, `tests/`, `.github/`, `.codex/hooks/` |
   | Data, rights and cost | `foundation-specifications-*/data/`, `costs/`, MP-10/27/29 material |
   | Financial contracts | `foundation-specifications-*/financial/`, ledger, import, XIRR and hash material |
   | Forecasting and integration | `forecasting/`, `integration-specification.md`, timing and science material |
   | Docs and governance | `README.md`, `docs/*.md`, planning packs, `.claude/`, `.agents/`, `.codex/rules/`, publication bodies |
   | Site, UX and accessibility | `site/`, `docs/readme/` artwork, any screen or chart |

   Merge or split lanes when a deliverable doesn't fit the table, and say how in the state file.
4. **Launch every lane in a single message**, one `Agent` call each (`general-purpose`), so they run at once. Each brief is self-contained so the reviewer doesn't have to explore:
   - the requirements: the MP issue and its acceptance criteria, plus the owner decisions that apply;
   - the rules to check against: `AGENTS.md`, the relevant `.claude/rules/` files, and `.codex/rules/review-checklist.md` lessons;
   - its exact file list, and from round 2 on the diff `git diff <base>..HEAD -- <files>` with its direct joins (callers and callees, linked specs, and the documents citing them);
   - the fixed-findings list, with the instruction never to propose undoing any of it;
   - "Report only what no gate measures. For each finding give: id, severity (P0-P3), blocking yes/no, file:line anchor, evidence, required correction."

   Never pass maker notes or reasoning. Reviewers are read-only; you make the fixes.
5. **Record and fix.** Write `review/MP-<n>/round-<N>.md` (snapshot, gates and ledger results, a findings table and lanes). Update `state.json`: `round_count`, `rounds[]`, `gate_results`, `deferred_gates`, `manual_verification`, `findings`, `next_round`. For every fixed blocker, add a behavioural check to `review/MP-<n>/fixed.json`, following `.codex/rules/review-ledger.md` (argv arrays and no shell; `command_fails` needs explicit exit codes and a reason test). Prove each check passes now and would fail without the fix. Add the lesson to `.codex/rules/review-checklist.md`. A fault a command could have caught becomes a check in `scripts/review_checks.py` or a test.
6. **Report and ask.** Give the findings, the fixes, and the ledger and check results. Non-blocking findings are listed but don't start a round on their own. If blockers remain, ask for the next round, naming its delta scope. After round five, stop and report what is left and what each fix would cost.

A review that can't run is a failed review, not a skipped one. Agents that made fixes are never reviewers of those fixes; every round uses new agents.
