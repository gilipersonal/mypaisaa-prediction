# Layered planning and MP sync - fixes-only round 2

**One P2 blocker and three P3 metadata joins were found. Author fixes now pass 30 focused tests and planning gates; independent round-3 verification is pending. No external sync has been applied.**

Scope was only round-1 notice composition/evidence-footer fixes, two stale authoring corrections and direct publication/provenance joins. Snapshot: `snapshots/round-5/manifest.json` (66 matching files, 12 delta files from the prior snapshot). Unchanged financial/cloud architecture lanes sat out.

Before review, the full MP-15 regression ledger passed its one recorded check (23 test cases), with zero failures/manual items; planning/content/hash/whitespace/Claude-isolation gates passed. Reviewers were fresh and read-only:

- `/root/mp_sync_fix_review_r2`: one P2 and two P3 observations.
- `/root/mp_doc_fix_review_r2`: no blockers, two P3 observations (one overlaps the other lane).

## Findings and fixes

- **LAYERED-R2-01, P2:** raw HTML regex could report markers absent when both visible identifiers were split across inline tags, causing a second notice insertion. The helper now checks parsed visible text and refuses a noncanonical reserved scope before insertion. New cases cover split pairs, unknown scope, nonparagraph/whitespace/zero-width variants and split reserved markers in desired content. Existing fresh-token/ambiguous-outcome/outside-content protections remain.
- **LAYERED-R2-02, P3:** high-level format guidance still said unconditional prepend. It now references the absent/no-op/owned-replace/invalid-stop helper contract.
- **LAYERED-R2-03, P3:** the workflow notice incorrectly said no independent review or regression had run. It now refers to actual review/fix evidence without claiming live-ledger certification.
- **LAYERED-R2-04, P3:** top-level sync proposal review state still said not_run. It now records round-2 findings/fixes and pending round-3 verification. Six footers and create-body status metadata consistently avoid clean certification.

Post-fix checks: 30 focused tests, source/hash/proposal/content/link/DAG/arithmetic gates and whitespace passed. Dependent source/provenance hashes and HTML were refreshed; Jira insertion strings and technical contracts remain unchanged. A second blocking regression entry was added; the complete two-entry ledger will run before the next approved round, not as an unapproved standalone run.

The existing conditional sync approval remains for 5 Confluence creates, 6 bounded updates, 8 visuals and 11 description-only Jira updates. It cannot be applied while required independent fix verification remains pending. No further round has run; fresh owner approval is required, and its scope must stay on these fixes and directly affected joins.
