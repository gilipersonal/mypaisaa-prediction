# Layered requirements/architecture and MP sync - round 1

**Review found one P2 blocker and two grouped P3 gaps. All author fixes are applied; independent delta verification is pending. External sync remains unapplied.**

This is the first review of the new layered pack (MP-15 history entry 4). The user approved three parallel lanes and the full MP-15 regression gate, followed by the exact proposed sync only if no blockers remain. Further rounds require a fresh yes. The original reviewed files remain in `snapshots/round-4/`; fix-only copies and hashes are in `layered-round-1-fixes/`.

## Gate evidence before reviewers

Planning trace/DAG, Decimal arithmetic, source/contract/story/example links and hashes passed for 10 phases, 64 local stories, 16 L1 stories/64 criteria, 15 entities, 12 examples and 140 phase-level source mappings. Two modified skills validated. Whitespace and Claude isolation passed. All 64 snapshot/worktree hashes matched.

The full approved MP-15 fixed ledger returned exit 0 with 0 checks, 0 failures and 0 manual items; it had no earlier fixed findings. This empty result was not a clean independent-review claim.

## Three independent lanes

- `/root/mp_l1_finance_review_r1`: clean, no blockers or actionable P3s; [financial report](layered-round-1-finance.md).
- `/root/mp_cloud_review_r1`: no blockers; stale authoring wording in two locations; [cloud report](layered-round-1-cloud.md).
- `/root/mp_sync_review_r1`: one P2 retry issue and one P3 footer gap; [sync report](layered-round-1-sync.md).

## Fixes and focused evidence

1. **LAYERED-R1-01, P2:** six Confluence updates now have stable observable owned boundaries; missing inserts, identical content is a no-op, changed owned content is bounded replacement, and ambiguous/malformed/stale/wrong-scope cases stop. Ambiguous write responses require a new full-draft read/token before retry. A new offline helper and 23 behavioural/config tests cover repeated composition, server-style normalization, outside rich-content preservation and safe refusal. The blocking finding is recorded in `fixed.json` with that focused command.
2. **LAYERED-R1-02, P3:** all six hub notices carry the promised source/revision/hash, decisions, phase/story and honest round-1-fix/round-2-pending evidence footers.
3. **LAYERED-R1-03, P3:** root tech-stack wording now acknowledges explicit Lucid authoring of new pages 4/5 while preserving A/B/C; the blueprint no longer calls the updated diagram skill an obsolete-target instruction.

Dependent publication bodies/source hashes, local proposal provenance and reading formats were refreshed. Eleven Jira insertion strings, financial contracts/examples, phases and native diagrams remain unchanged.

Post-fix maker checks: **23 tests passed**; planning/content/link/graph/arithmetic/source/asset/proposal gates and whitespace checks passed. The regression ledger has gained one check and will be run in full before the next approved round; it was not silently executed as a standalone run.

## Next boundary

Round 2 requires explicit approval and covers only these fixes plus their direct publication/provenance/permission joins. Financial and unchanged cloud architecture lanes sit out. The proposed 5 Confluence creates, 6 bounded updates, 8 images and 11 description-only Jira edits remain authorised conditionally on clean verification, not yet applied. No statuses, new issues, PRs, deployment or paid calls are part of this sync.

No additional independent round has run. No Jira or Confluence mutation occurred. This documentation review does not certify an implemented product or owner acceptance of remaining detailed requirements.
