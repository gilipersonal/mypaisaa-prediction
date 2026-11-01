# Round 1: independent audit, privacy and observability review

Reviewer: `/root/mp15_audit_review_r1` (fresh context, read-only).
Scope: the operational requirements update and direct document/source joins.
Snapshot: `snapshots/round-1/manifest.json`.

**Result: no blocking findings; two optional P3 acceptance refinements.**

The reviewer confirmed coverage of failed/rejected uploads, immutable source/change lineage, transactional audit coupling, owner authorization, expiring telemetry versus durable audit, crash reconciliation, asynchronous/replay links, sensitive-content separation, environment cost attribution and delayed billing. Pending retention values, identity details and portal UX are explicitly unresolved requirements.

## MP15-R1-A1: deletion across restoration (P3, nonblocking)

Location: `docs/planning/aws-options-2026-11-01/audit-observability-requirements.md:131`.

The release gate tests deletion and restore separately. Section 2 already includes backups in deletion semantics. Add a combined synthetic acceptance case: restore a backup containing an owner-deleted document and prove deletion is reapplied before access. This prevents restoration from resurrecting sensitive content without selecting a retention duration now.

Disposition: recorded for the next requirements refinement; not applied or independently verified as fixed in this round.

## MP15-R1-A2: audit-chain tampering acceptance (P3, nonblocking)

Location: `docs/planning/aws-options-2026-11-01/audit-observability-requirements.md:99`, connected release gates at lines 124–132.

Audit-chain health is required, but the acceptance list lacks an explicit missing/altered-event case. Add a synthetic deletion/modification case that is detected and surfaced. MA architecture §4.6 describes detecting such tampering; the final mechanism can remain open.

Disposition: recorded for the next requirements refinement; not applied or independently verified as fixed in this round.

## Evidence and limits

The reviewer read the round-1 snapshot, direct document joins and permitted MA architecture sections. Public primary documentation checked:

- [AWS Cost Explorer](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html): freshness and API charges.
- [S3 versioned-object deletion](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjectVersions.html): deletion semantics.
- [Anthropic analytics](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api): reporting dimensions and delayed reconciliation.

The reviewer made no changes, ran no regression ledger and performed no account access. This review does not certify runtime behaviour.
