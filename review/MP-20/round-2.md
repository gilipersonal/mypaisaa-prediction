# MP-20 independent review, round 2

**Reviewed commit:** `0cca844f1d45bece55fcf12f40c37289b3e42cee`, 3 November 2026.
**Owner approval:** "Yes, review round 1", for the consolidated baseline before sign-off (decision item 21). MP-20
already held Codex's round 1 of 2 November, so this is round 2 of the deliverable.
**Scope:** the consolidation (`git diff main..0cca844`) plus round 1's fixes to the foundation pack
(`git diff 0ddf55e..main -- docs/planning/foundation-specifications-2026-11-02`), never independently verified until
now, with their direct joins.
**Brief:** [round-2-brief.md](round-2-brief.md), the same for every lane. Gate results: [round-2-checks.json](round-2-checks.json).

## Lanes

Four fresh, read-only reviewers ran at once.

| Lane | Covers | Blocking | Non-blocking |
| --- | --- | ---: | ---: |
| S | Forecasting and financial specifications (lane p split, keeping round 1's letter) | 4 | 7 |
| C | Data and cost specifications (lane p split, keeping round 1's letter) | 2 | 6 |
| p | Planning records, root documents, the sign-off pack, its scripts, tests and CI (lanes p and s merged) | 3 | 7 |
| d | Confluence generator, Lucid drawings and motion | 5 | 4 |

Three findings that two lanes reported at the same place were merged: R2-C1's drawing and page anchors into R2-d1 and
R2-d2, R2-C8's generator anchors into R2-d5, and R2-d7 into R2-p8.

## What round 1's fixes showed

All four of round 1's fixes that lane S examined hold: reverting each one makes its check fail. Lane C confirmed that
R1-C1's invoice-month rule survives the removal of the domain line.

## Blocking findings, all fixed

| Id | Severity | What was wrong | Fix | Held by |
| --- | --- | --- | --- | --- |
| R2-S1 | P2 | The trial count paused on "no matured shadow forecasts", so long horizons never started | The owner's two reasons only, one phrase in three records; long horizons count clean-running weeks | `timing_checks.py --check policy` |
| R2-S2 | P2 | Rules had no proper score, yet "beat the rules" read as settled | Proposed rule-to-probability mapping; open in SCI-D03 | same |
| R2-S3 | P2 | Closed SCI-D05 still argued against self-correction and automatic revert | Answered position; superseded wording named | same |
| R2-S4 | P2 | Self-correction had no cutoff, replay or provenance rule | Cutoff rule, point-in-time replay, provenance fields, a negative case; the rest open in SCI-D10 | same |
| R2-C1 | P2 | The Market Agent page quoted £19.84 | £18.64, leaving £3.36; artifact republished | `check_retired_facts.py` |
| R2-C2 | P2 | Root docs left out the £5 scan and called cost fit settled | Scan added; fit described as conditional | same |
| R2-p1 | P1 | The 2 Nov policy answers never reached the financial open decisions | Five items partly answered, with what is still open | ledger `-c` check |
| R2-p2 | P1 | The open list lacked ARC-06b and ARCHITECTURE §13 items; blank evidence | Read from the records; a blank is refused | `test_an_open_item_with_no_deciding_evidence_fails` |
| R2-p4 | P2 | The signed mode did not protect what is signed | Full sha, ancestry, pack and pins compared with the signed commit | `test_the_signed_mode` |
| R2-d1 | P1 | Drawing 5 quoted £19.84 and £2.16 | Corrected and re-imported | `check_retired_facts.py` |
| R2-d2 | P2 | The perimeter page quoted $20.67 and $21.15 | $19.42 and $19.90 | same |
| R2-d3 | P1 | The Apple testing page and animation described TestFlight as the plan | Free local builds; TestFlight later | same |
| R2-d4 | P2 | The delivery animation said the IaC tool is not chosen | Terraform only; owner-started release | same |
| R2-d5 | P2 | The cost page, hub and budget animation showed the $79 and domain-month drafts | The selected months | same |

The 24 non-blocking findings are in [state.json](state.json); all are fixed except the drawing labels for Apple
sign-in (R2-p8), deferred to the next Lucid refresh because ARC-07 keeps Apple sign-in as the target design.

## New gates, so the same mistake is not shown twice

- `scripts/check_retired_facts.py` and `docs/planning/retired-facts.json`: a retired fact in a current document or
  generator fails the check. Run on the reviewed commit it reports every stale fact this round found.
- `timing_checks.py --check policy` and `--check selftest`: the owner's numbers and the open questions, with 26
  record mutations and 6 checker mutations that must be caught.
- `verify_hash_contract.py --mutation-selftest`, the attachment sha256 in `docs/confluence/`, the Lucid spec hash
  in the sign-off builder, and the builder's own refusals.

## New open questions for the owner

SCI-D10 (self-correction windows, starting state and rollback detection), DATA-DEC-15 (no training on Yahoo history
for now) and COST-Q4 (whether optional work pauses in the Apple fee month).
