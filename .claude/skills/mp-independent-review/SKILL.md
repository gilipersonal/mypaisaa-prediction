---
name: mp-independent-review
description: Run an approved independent review round of a Mypaisaa Prediction deliverable with fresh blind reviewers in parallel lanes, selected fast checks and the fixed-findings ledger. Use only after the owner has said yes to that specific round.
---

# Independent review for MP (Claude)

Claude's version of `.agents/skills/mp-independent-review/SKILL.md`. Consent follows `.claude/rules/independent-review.md`: **one yes covers one round** and its named regression run. Each reviewer's brief is `.claude/skills/autoship/review-brief.md`. Ask again before every later round, up to five. A no or any other answer stops the review; report the work as unreviewed and list the gates that ran. Consent here never covers a PR, merge, issue closure, plan sync or publication.

## Offer (end of the work, with any ship question)

Name the round number, its lanes, the checks that will run (from `python3 scripts/review_checks.py --base <base>`) and the ledger run (`python3 scripts/review_regress.py MP-<n> --approved`, or `LOCAL` with no issue), and the five-round maximum. Never invent an MP key.

## Run an approved round, fast

1. **Freeze the snapshot.** Commit the deliverable first and record the commit as `reviewed_commit` in `review/MP-<n>/state.json`. For round 2 and later, the base is the previous round's `reviewed_commit`.
2. **Start all the gates in one message, as parallel Bash calls:**
   - `python3 scripts/review_checks.py --base <base> --run --record review/MP-<n>/round-<N>-checks.json`. Add `--reuse review/MP-<n>/round-<N-1>-checks.json` from round 2 on; this reuses a pass only where its inputs are byte-identical. Add `--broader` when the risk table in `docs/review-optimisation.md` calls for it (security, schema/import, ledger, model targets or cutoffs, shared components).
   - `python3 scripts/review_regress.py MP-<n> --approved --jobs 4`. The whole ledger runs every round, whatever the delta.
   - `python3 scripts/review_regress.py --every --jobs 4`: every ledger under `review/`, as CI runs it on every PR. Exit 0 or 3 only; a regression in another issue's ledger is fixed first too.
   - `python3 scripts/review_regress.py --state MP-<n>`: the state file must validate before the round starts (no state file means no rounds yet).
   - If the ledger has outstanding manual items: one fresh verifier agent per `.codex/review-policy.json`. It records finding ID, evidence, verifier and result in the state file. Any unverified item stops the round.

   Fix any failure before reviewers start. Deal with every `UNMAPPED` path by choosing its checks; unknown impact means expand, not assume isolation. Report `DEFERRED` and `UNAVAILABLE` checks as exactly that, never as passes.
3. **Choose lanes from what changed** (`git diff --name-only <base>..HEAD`). Use only the lanes the delta touches; unchanged lanes sit out. At most four reviewers, so five agents including you.

   | Lane | Covers |
   | --- | --- |
   | (p) Planning and specifications | `docs/planning/`, `docs/adr/`, `docs/*.md` specifications; split into data/cost, financial and forecasting lanes for a large foundation pack |
   | (s) Scripts and tests | `scripts/`, `tests/`, `.github/`, review ledgers and runners |
   | (c) Agent configuration | `.claude/`, `AGENTS.md`; `.codex/` and `.agents/` only when the change touches them |
   | (d) Confluence, diagrams and motion | `docs/confluence/`, `docs/diagrams/`, `docs/motion/`, `docs/readme/`, `site/`, published bodies |
   | (b) Backend | `backend/` |

   The rule `.claude/rules/independent-review.md` holds the same table. Merge or split lanes when a deliverable doesn't fit it, and say how in the state file. Finding ids carry the lane letter: `R<round>-<lane letter><n>`.
4. **Launch every lane in a single message**, one `Agent` call each (`general-purpose`), so they run at once. Fill in `.claude/skills/autoship/review-brief.md` for each; the brief is self-contained so the reviewer doesn't have to explore:
   - the requirements: the MP issue and its acceptance criteria, plus the owner decisions that apply;
   - the rules to check against: `AGENTS.md`, the relevant `.claude/rules/` files, the lessons in `.claude/rules/independent-review.md`, and `.codex/rules/review-checklist.md`;
   - its exact file list, and from round 2 on the diff `git diff <base>..HEAD -- <files>` with its direct joins (callers and callees, linked specs, and the documents citing them);
   - the fixed-findings list, with the instruction never to propose undoing any of it;
   - "Report only what no gate measures. For each finding give: id, severity (P0-P3), blocking yes/no, file:line anchor, evidence, required correction."

   Never pass maker notes or reasoning. Reviewers are read-only; you make the fixes.
5. **Record and fix.** Write `review/MP-<n>/round-<N>.md` (snapshot, gates and ledger results, a findings table and lanes). Update `state.json`: `round_count`, `rounds[]` (each round with `reviewed_commit`, `review_approval`, `gate_results`, `deferred_gates`, `manual_verification`, `findings`, `next_round`), then run `python3 scripts/review_regress.py --state MP-<n>`. For every fixed blocker, add a behavioural check to `review/MP-<n>/fixed.json`, following `.codex/rules/review-ledger.md` (argv arrays and no shell; `command_fails` needs explicit exit codes and a reason test), with an `id` and a `finding`. Prove each check passes now and would fail without the fix. A check whose target is gone is marked `"retired": "<reason, issue>"`, never deleted. Add the lesson to the checklist in `.claude/rules/independent-review.md` (Codex keeps its own in `.codex/rules/review-checklist.md`). A fault a command could have caught becomes a check in `scripts/review_checks.py` or a test.
6. **Report and ask.** Give the findings, the fixes, and the ledger and check results. Non-blocking findings are listed but don't start a round on their own. If blockers remain, ask for the next round, naming its delta scope. After round five, stop and report what is left and what each fix would cost.

A review that can't run is a failed review, not a skipped one. Agents that made fixes are never reviewers of those fixes; every round uses new agents.
