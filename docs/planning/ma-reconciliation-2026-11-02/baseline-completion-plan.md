# Detailed baseline completion after direction selection

**2 November 2026 · MP-19 · Twelve directions recorded; architecture/UX/build unapproved**

The questionnaire selected broad directions. It did not finish the 52 detailed contracts/evidence items or turn the 64 local story drafts into ready implementation stories. This plan specifies the remaining work and exit evidence; no task is executed merely because it appears here.

## 1. Complete the reusable architecture areas

Use A01–A12 in [documentation structure](documentation-structure.md). Each specification must define requirements and exclusions; producer/consumer/write ownership; chosen versus conditional decisions; data/API/event/action/model schemas and examples; normal/failure/retry/recovery paths; security/guardrails; audit/telemetry/cost; acceptance tests; phase/story joins; source/visual provenance and unresolved choices.

Carry concepts from MA with MP-specific acceptance. Preserve the user's decisions, including separate workers and Durable Functions even where earlier maker recommendations differ. Actual holdings and documents remain deferred; use real-ID synthetic examples for these specifications.

## 2. Close contracts in dependency order

| Package | Existing planning issues | Required specification/decision evidence |
| --- | --- | --- |
| Source feasibility and budget | MP-10, MP-29, MP-27 | Per-listing/use rights and delays, dev Basic credit accounting, production provider capabilities, dated pricing/FX/tax assumptions and baseline/stress envelope across all costs |
| Financial truth and data contracts | MP-12, MP-22 | Exact money/FX/XIRR/benchmark/risk semantics; import preview/commit/reversal; identity, atomic visibility/audit/outbox, large-import staging, queries, exports and worked cases |
| Workflow and execution | MP-23, MP-24 | Durable steps/replay/external ambiguity, queue/scheduler/DLQ boundaries, cancellation/recovery, SageMaker job caps/identity, portable artifact/runtime fit and stored forecasts |
| Scientific protocol | MP-21 | Target/horizon/maturity equations; baselines/challengers; point-in-time data, folds/purging/holdout, experiment limits, calibration/ablation/uncertainty, eligibility/abstention and owner promotion |
| Agents and evaluations | MP-25, MP-26 | Per-route worker/IAM/tool/context/memory manifests, model/prompt policy, cache/batch/privacy, claim grounding, Inspect adapters/cases/scorers, offline/live triggers, judge calibration and budgets |
| Identity, admin and recovery | MP-11, MP-13, MP-28 | Verified linking/recovery, protected-action/approval policies, full admin information/actions/states, record/provider/backup retention/deletion, audit claims, restore objectives and replay/rollback authority |
| Clients, release and operations | MP-30, MP-27, MP-29 | Static PWA/FastAPI/session/SSE/offline/push contracts; web/Apple device/Duo scope; secure caches/updates; observability signals, billing reconciliation, runtime/region/IaC/CI/CD and release/recovery evidence |
| Consolidated baseline and trace | MP-20 | All area/phase/story/contract/test links, owner answers, explicit gap dispositions, visuals/provenance, exact baseline revision and separate sign-off |

These are planning issues, not implementation-completion evidence. Do not create duplicates. Source-policy or compatibility questions requiring provider confirmation remain visibly unresolved; propose explicit consequences and return material choices to the owner. Do not contact providers or make paid/live service calls without the required authority.

Three maker lanes plus the coordinator can draft independent areas within the runtime's four-thread limit and the owner's maximum of five. Shared contracts and conflicting choices must be reconciled before publication, not resolved differently by each lane. This proposed division does not start independent review.

## 3. Finish the phase and story catalogue

Retain stable PH-00–PH-09 IDs and distinguish planning order from implementation dependencies. PH-02 foundation evidence precedes PH-01 implementation. Admin, guardrails, audit and cost controls are designed from foundations; later operations phases verify them rather than introduce them for the first time.

There are 64 current local drafts: 16 detailed import stories and 48 umbrella stories. Decompose the umbrellas and relevant MA acceptance concepts into MP-specific implementation stories before UX readiness. Each actual Jira story needs a parent/phase, user outcome, requirements/source disposition, precise positive/negative criteria, schemas/examples, dependencies, security/privacy/cost/audit effects, planned tests, failure/recovery, future UX state/platform links and a readiness label. Record returned Jira keys and read back their fields; local IDs are not real keys. Existing source-to-phase coverage alone does not satisfy that decomposition.

Complete one detailed phase page with scope, architecture areas, contracts, stories, dependencies, acceptance demo, failure/recovery evidence and exit gate. Estimates follow decomposition and compatibility evidence; MA dates/estimates are not copied.

## 4. Classify evidence honestly

For every item in the 52-gap register, record what remains and who decides. Distinguish:

- **Before UX:** resolve choices that shape user-visible scope, information, actions, financial/scientific meaning and policy; approve complete contracts and phase/story structure. Do not hide a material unresolved choice as an implementation detail.
- **Before implementation:** settle exact supported versions, packaging, parameters and acceptance/recovery cases; obtain separate scope approval for any hands-on compatibility spike that would require code or live execution.
- **Before activation:** execute the later authorised tests against real permitted inputs and actual cloud/provider limits, demonstrate restore/replay/cost/quality, and obtain release/spend/model-promotion authority.

A designed fallback or conditional activation gate is not a successful proof. Selecting one direction does not close every gap linked to its card. The owner must approve any conditional baseline with its explicit scope and consequences; this document grants no such approval.

## 5. Reconcile documentation and publication

Update accepted/draft/superseded ADRs explicitly, including older PostgreSQL, Agent SDK, £50-only, A/B runtime and single-account proposals. Preserve their history; use the selected decision log as current direction.

Refresh the existing native Lucid technical views after detailed boundaries settle, with actual versions/hashes and unchanged historical pages preserved. Maintain colourful static/optional-motion companions and accessibility. Native visual inspection is distinct from an HTML text read.

Prepare exact bounded MP Confluence changes for the area specifications, phase pages and index. The 13 planning-draft pages have now been published and verified; see the [publication receipt](confluence-publication-receipt.json). The complete detailed area structure may require an explicitly approved revised publication scope. Recheck collisions, current rich content and parent IDs, then obtain the exact publication approval before writing. Record actual versions/attachments/readback. Update Jira and local source evidence together; no automatic two-way synchronization is claimed.

## 6. Separate the approvals

1. Present the completed architecture/contract/phase/story pack and its unresolved conditional activation items for owner sign-off at an exact revision.
2. Only after that sign-off, design the complete web/Apple/admin UX and end-to-end prototype locally, with separately authorised design sharing/publication.
3. Obtain complete end-to-end UX approval, then explicit implementation permission.
4. Obtain later environment/deployment/spend and individual model-promotion permissions as required.

Independent review is still declined for now. The authorised 13-page Confluence planning-draft publication is complete; further publication and PR creation remain pending their own scope/consent. Offer the applicable review/ship choice when the full deliverable is ready, preserving separate consent for each round. These architecture decisions do not authorise review, merge or issue closure.
