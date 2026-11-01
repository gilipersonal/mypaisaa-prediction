# Layered planning and MP sync - fixes-only round 3

**One P2 mixed-marker guard issue and one grouped P3 status-copy issue were found. Author fixes pass 35 focused tests and planning gates; independent round-4 verification is pending. External sync remains unapplied.**

Reviewed only the six-file delta in `snapshots/round-6/` against `round-5`, with two fresh read-only reviewers. Before review, both blocking-ledger checks passed the then-current 30-case suite, with zero failures/manual items. Planning/source/proposal/whitespace gates and 66 snapshot hashes passed. Unchanged financial/cloud architecture remained outside scope.

- `/root/mp_marker_delta_review_r3` reproduced **LAYERED-R3-01, P2**: with a canonical pair already present, extra zero-width/split visible pairs or unknown/malformed scopes bypassed an absence-only guard, permitting no-op/replacement on ambiguous ownership. The guard now checks normalized visible occurrence counts and raw/text-node agreement on every path. New regressions cover mixed pairs, both no-op/replacement inputs, split unknown/malformed scopes and attribute-only raw matches.
- `/root/mp_metadata_delta_review_r3` found no blocker but **LAYERED-R3-02, P3**: current status copies on create actions, global/prewrite/maker metadata and the sync proposal still contradicted newer footers. Those current copies now consistently record round-3 fixes prepared/round-4 verification pending, with a consistency test and no clean certification.

Both earlier marker fixes, fresh-read/stale-token checks and outside-rich-content preservation remain protected. The full three-entry ledger will run before the next approved round, not as an unapproved standalone run.

Post-fix maker checks: 35 focused tests passed; publication/source/proposal hashes, local content/link/DAG/arithmetic and whitespace gates passed. Jira insertion text, phases, financial contracts and native diagrams remain unchanged. Review lessons were updated. No actual Confluence/Jira operation, status change, deployment or paid call occurred.

Next round must be separately approved and limited to these fixes and direct joins. Existing conditional sync approval remains in place for 5 new pages, 6 bounded updates, 8 visuals and 11 description-only issue updates after clean verification.
