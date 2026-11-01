# MP-15 operational requirements update - round 1

**Result: passed with no blockers and two nonblocking P3 follow-ups.**

The user approved round 1 with two parallel fresh reviewers, then explicitly approved its fixed-findings regression gate. This approval does not cover another round, PR creation, merge, issue closure, plan sync, publication, deployment or account access.

## Reviewed scope

The S3 evidence, upload/update audit, whole-system observability and priority per-environment Claude/AWS cost-dashboard requirements; DEC-018–022 and their direct PRD, decision-register, architecture-reading and cost-model connections. This is requirements review, not a review/certification of a deployed collector, dashboard, budget control or the entire historical architecture.

Base commit: `082972bf25fccf03ff72563257d5f7dd07f39c95`.
Uncommitted deliverable: reproducible SHA-256 manifest and copies in `snapshots/round-1/`.

## Gates before reviewers started

- `python3 review/MP-15/check_documents.py`: passed planning JSON parsing, 22 ordered decision IDs, 21 unique complete source issues, local Markdown links, HTML links/anchors, allowance arithmetic and approval metadata.
- That gate first caught a stale pending-horizon label in cost-model metadata. It was corrected to DEC-001's confirmed horizons before reviewer start; the pre-fix copy is retained and the reviewed snapshot hash was refreshed.
- `python3 scripts/review_regress.py MP-15 --approved`: exit 0, no MP-15 ledger existed, **zero earlier fixes checked**. This is not evidence of a clean independent review. No outstanding manual items existed.
- `git diff --check`: passed; explicit document checks covered untracked planning files.
- Manifest verification: all 19 snapshot and corresponding worktree files matched at reviewer start.

Application, browser/device/end-to-end, live billing and release/deployment gates were not applicable to this local documentation update. No runtime source or infrastructure changed, and no shipping was requested.

## Independent lanes

| Lane | Reviewer | Result |
| --- | --- | --- |
| Cost accounting, environment dashboard and billing assumptions | `/root/mp15_cost_review_r1` | No blocking or actionable nonblocking findings; [report](round-1-cost-review.md) |
| Audit, privacy, retention and end-to-end observability | `/root/mp15_audit_review_r1` | No blockers; two P3 refinements; [report](round-1-audit-review.md) |

## Nonblocking follow-ups

- **MP15-R1-A1:** add a combined backup-restore/deletion acceptance case proving deleted sensitive content remains inaccessible after restoration.
- **MP15-R1-A2:** add an explicit missing/altered-audit-event detection acceptance case.

These are recorded, not claimed fixed. They do not start another round by themselves. Review lessons were added to the project checklist after this round; that bookkeeping does not change the reviewed planning deliverable.

## Limits and next permission boundary

The requirements remain a working draft. Full-scope affordability, account credit eligibility/balance, numeric defaults, detailed admin UX and actual runtime controls are not verified by this review. No AWS change, paid call, Confluence/Sites publication, PR or Jira transition occurred. No round 2 was started; it would need fresh permission and cover only fixes for findings from this round and their directly affected connections, with the applicable gates and complete MP-15 regression ledger.
