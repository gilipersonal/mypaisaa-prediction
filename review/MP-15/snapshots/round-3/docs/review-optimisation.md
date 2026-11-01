# How Codex reviews are kept proportionate

This policy applies to Codex in Mypaisaa Prediction. It changes test selection during development and review rounds. It does not change Claude configuration, CI definitions, required release gates, or the user's approval boundaries.

## Why we are changing the process

Repeatedly running every suite in a large codebase can spend more time on unchanged areas than on the fix under review. Our setup review also showed that repeated checks and broad review scopes can become disproportionate. We now select broader tests based on what changed and what could be affected, while retaining checks for earlier fixed findings.

## When checks run

| Layer | When | Examples and scope |
| --- | --- | --- |
| Fast applicable checks | Before every approved review round | Syntax, format/type/config validation and focused unit tests for changed components. Documentation-only edits need document/config/link checks, not unrelated application tests. |
| Fixed-findings regressions | Before every approved review round; separately only with approval | Every recorded check in this deliverable's ledger, including required manual verification. The latest diff does not narrow this ledger. |
| Broader affected tests | When change risk requires them | Tests for callers/consumers of shared components, related API/SSE contracts, imports and ledger behaviour, authentication or persistence. |
| Expensive browser/device/end-to-end suites | At relevant milestones and before shipping; earlier when risk requires | Representative complete user journeys and supported platform/device coverage. A UI, platform or integration change can require these before a review rather than deferring them. |
| Release gates | Before shipping | All gates required by the repository and CI for that release. Earlier review success is not a release-gate waiver. |

Security/authentication changes, schema or migration changes, portfolio import/ledger changes, model targets/features/data cutoffs, and prediction/outcome scoring deserve broader evidence early. A change to a shared stylesheet or component needs checks across affected consumers. Unknown impact is a reason to expand checks, not to assume isolation.

## What reviewers inspect

Round one reviews the whole deliverable and its connections. Later rounds review only the immediately preceding round's fixes and directly affected connections. Unchanged lanes sit out. Independent lanes may run in parallel, with at most five agents total including the coordinator and subject to any lower session limit. Checks that mutate shared data, use the same simulator, or share other exclusive resources run sequentially or in isolated environments.

Every round still needs its own explicit approval. The question names its scope and regression run. Plan sync and standalone regression runs retain their own approval gates. This optimisation does not authorise external writes, PR creation, merging or issue closure.

## Avoiding duplicate work

Reuse a successful broader-suite result only when the relevant source, dependencies, test/configuration inputs and environment are unchanged. Record the prior revision or snapshot, command, result and why it still applies. A shared-component or environment change invalidates evidence for affected consumers. Fast applicable checks and the deliverable's fixed-findings ledger still run before each approved round.

Keep fixed-finding checks small and behavioural. A future runner could use one identical check result for several findings within the same approved run if it records the mapping and verifies identical inputs. The current runner executes every entry sequentially; automatic deduplication, caching and parallel test scheduling have not been implemented. Do not claim otherwise or manually skip ledger entries.

If a ledger check is inherently expensive, explain the cost and ask for an explicit decision. Do not silently drop it or report a complete regression pass without its evidence. A check that is unavailable, failed or deferred stays labelled that way.

## Evidence in the review record

Before reviewers start, record the changed components, risk assessment, selected commands and results, and any broader suites deferred with reasons and a milestone for running them. Record reused evidence with its unchanged-input justification. Gate failures are fixed first. At shipping, reconcile all required deferred release checks and their results.

This is an instruction-based workflow for Codex; no automatic risk classifier or test selector has been added. Future automation can use measured suite duration and dependency information, but must preserve this evidence and approval model.
