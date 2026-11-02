# Roadmap, evidence and remaining work

**Handover snapshot: 2 November 2026.** Architecture/contracts/phase/story agreement precedes UX. Complete end-to-end/admin UX approval and explicit implementation permission precede application construction. Planning delivery crosses neither gate.

## Read the source layers without flattening their history

| Source | Use and limitation |
| --- | --- |
| [Root README](../../../README.md), [architecture](../../architecture.md), [stack](../../tech-stack.md) | Current navigation and status overlays; lower sections retain historical snapshots. |
| [DEC-001–041](../../planning/aws-options-2026-11-01/product-decisions.json) | Product scope and owner choices, including synthetic-first work. Later choices refine earlier pending fields. |
| [Layered pack](../../planning/layered-development-2026-11-01/README.md) | Initial PH-00–09 structure, detailed import draft and architecture/network proposals. |
| [MA reconciliation](../../planning/ma-reconciliation-2026-11-02/README.md) | Twelve selected ARC directions, researched differences, source coverage, 52 gaps and phase/story baseline. |
| [Foundation Pack 1](../../planning/foundation-specifications-2026-11-02/README.md) | Integration/data/financial/forecast/cost contracts, synthetic worked examples, proposed acceptance and two horizon receipts. |
| [Later policy journal](../../planning/foundation-policy-discussion-2026-11-02.md) | Twelve subsequent selections awaiting coordinated contract integration; later decision to decline round 2. |
| [Future visual direction](../../planning/future-architecture-sites-ux-direction-2026-11-02.md) | Requirements for later authorised Lucid, Sites and UX work; not approval to begin it. |

Foundation source evidence is pinned at **`34b03900837428b51ddffcd637d92c1cd2a6fb1e`**, from PR #9. Preserve that historical reference after PR #9's merge; it is neither the current branch head nor a still-open-PR claim. Foundation validation expects that Git object and does not fetch it automatically. The handover delivery begins from `2e64398`; the [handover index](../../../CLAUDE_HANDOVER.md) records checkout evidence, and [workflow adaptation](01-codex-workflows-and-claude-adaptation.md) explains the operating rules.

The reconciliation [coverage register](../../planning/ma-reconciliation-2026-11-02/source-coverage.json) captures 83 MA pages; the source inventory includes 299 issues. These are concept dispositions, without certified native-visual or clause-level story parity. Older 21-page/140-story/21-observability-story captures remain dated provenance. MA's household scope, accounts, budgets, topology, model IDs, permissions and delivery dates do not transfer to MP.

## PH-00–PH-09 and dependencies

The [current phase/story baseline](../../planning/ma-reconciliation-2026-11-02/phase-story-baseline.json) preserves ten stable phase identifiers and crosswalks them to the six existing MP epics. Phase number is not executable order: **PH-02 must precede PH-01 implementation**. All phases remain drafts behind the global approval gates.

| Phase | Intended result | Implementation dependency after global approval |
| --- | --- | --- |
| PH-00 | Whole-product requirements, architecture, contracts and story readiness | No prior phase; governs all subsequent work. |
| PH-01 | Standalone ledger, all import methods, reconciliation and source lineage | PH-02. Planning can proceed earlier. |
| PH-02 | Identity, private runtime, audit, jobs, retention and launch cost controls | PH-00. Safeguards precede real documents and paid jobs. |
| PH-03 | Eligible market data, performance, benchmarks and portfolio risk | PH-01, PH-02. |
| PH-04 | Scientific baseline, complete Forecaster modules and controlled learning | PH-03. |
| PH-05 | Grounded agents, chat, evidence/memory and evaluations | PH-02, PH-03. |
| PH-06 | Discovery-first PWA, ranked suggestions, proof, briefings and alerts | PH-01–PH-05. |
| PH-07 | SwiftUI/RN bridge, Apple journeys, offline privacy and push | PH-02, PH-06. |
| PH-08 | Operational acceptance, recovery and controlled personal launch | PH-01–PH-07; release/deployment/spend authority remain separate. |
| PH-09 | Versioned market/theme/model/agent extensions and conditional future transfer | PH-08; no automatic MA migration or retirement. |

There are **64 local story drafts: 16 detailed import drafts and 48 umbrellas**. Local IDs are not Jira keys or completion evidence. Decompose umbrellas before UX readiness; preserve existing epics and stable phase IDs. Each actual story needs parent/phase, source trace, schemas/examples, positive/negative acceptance, dependencies, recovery, security/privacy/audit/cost effects, tests and future UX/platform states. Verify returned Jira keys by readback.

## Complete the baseline in dependency order

The [completion plan](../../planning/ma-reconciliation-2026-11-02/baseline-completion-plan.md) and [52-gap register](../../planning/ma-reconciliation-2026-11-02/gap-register.json) are the working map. Foundation drafting does not close the gaps or their Jira acceptance.

1. **Integrate the twelve later receipts into a traceable next draft.** Update corresponding FIN-OD/SCI-D contracts, examples, acceptance, cost assumptions and phase/story joins together. Retain original receipts and reviewed snapshot. Do not mark a whole policy group approved from one answer.
2. **Close source and cost feasibility** under MP-10/27/29: listing/use matrix, Basic dev limits, Grow terms, full invoices/tax/FX, actual credit-allocation feasibility and runtime workloads. Real holdings are deferred; unresolved entitlement still blocks live activation. Public research is not provider confirmation.
3. **Finish financial/data semantics** under MP-12/22: decimal precision, exact approval/revocation/concurrency, staged publication/access patterns, settlement/backfill cutover, bounded XIRR and ambiguity, lot/fee/action/FX conventions, risk windows, benchmarks, score normalization and deletion/export behaviour.
4. **Specify workflow/runtime joins** under MP-23/24: Durable steps and replay, ambiguous external outcomes, SQS/Scheduler/DLQ ownership, cancellation, SageMaker limits and portable inference. Distinguish a proposed fallback from a verified recovery path.
5. **Complete science and agent contracts** under MP-21/25/26: event targets, initial qualification scopes, justified quality thresholds, folds/calibration/trial budgets, pause/restart triggers, approved scenario values; then per-route worker/tool/IAM/context/memory/cache/batch and Inspect cases/scorers. No fitting or paid evaluation follows from drafting.
6. **Finish identity/admin/client/operations** under MP-11/13/28/30 and MP-27/29: protected-action evidence, recovery, complete admin state inventory, retention/restore erasure, PWA/native contracts, bounded SSE, offline/push, device scope, observability, region/network/runtime/IaC and release evidence.
7. **Consolidate MP-20** with complete architecture-area documents, ten detailed phase pages, actual story acceptance, explicit gap dispositions and an exact revision for owner sign-off. Reconcile historical ADRs explicitly. Only then seek the separate UX authority, followed later by UX approval and implementation authority.

For each gap distinguish what shapes user-visible behaviour **before UX**, what needs packaging/contract evidence **before implementation**, and what needs real permitted inputs/cloud/provider verification **before activation**. Any conditional baseline needs owner acceptance of its exact limitations. Numeric proposals such as solver tolerances, risk event thresholds, effect-size hurdles and freshness limits are not engineering decisions already delegated to Claude.

## Evidence and independent-review state

Foundation maker receipts describe **37 positive wire records**, **15 financial + 15 scientific worked examples**, **108 amortised run-rate variants**, **216 invoice-timing cash variants**, source/reference checks, hash-graph checks and daily/event timing cases. The **75 backend/live acceptance cases are planned, not executed**. These checks establish document shape/arithmetic, not rights, predictive validity, cloud compatibility or backend enforcement.

[MP-20 round 1](../../../review/MP-20/round-1.md) ran three fresh lanes after the then-current gates and found five blocking P2 issues:

| Finding | Correction represented in the current drafts |
| --- | --- |
| R1-C1 | Separate amortised run rate from full annual-domain invoice-month cash. |
| R1-F1 | Construct acyclic, versioned canonical leaf/chunk/page/root hash projections. |
| R1-F2 | Keep mutable delivery status/attempts outside immutable sealed event intents. |
| R1-S1 | Allow positive collection/retry latency before the frozen cutoff; abstain on unsupported windows. |
| R1-S2 | Separate prerelease prediction, postrelease prediction and retrospective event study; no later release content in earlier features. |

The fixes have maker verification, including helper checks in normal and optimized Python, integrated document validation, Ruff F and whitespace checks. **Independent verification of the fixes has not run.** [State JSON](../../../review/MP-20/state.json) still says next-round permission pending; the later policy journal records “Keep drafts; discuss remaining policies first.” The updated five-entry [fixed ledger](../../../review/MP-20/fixed.json) has not had its full next-round regression run. Do not call the pack clean, fully reviewed or approved. No independent review or ledger run is authorised by this handover.

CI comprises Backend, Codex tooling, Static preview, Workflow lint and Jira traceability. Distinguish historical receipts from this handover's fresh checks, recorded in its index; neither constitutes product acceptance.

## Publication and future visual work

The saved MP-19 [publication receipt](../../planning/ma-reconciliation-2026-11-02/confluence-publication-receipt.json) and [readback validation](../../planning/ma-reconciliation-2026-11-02/confluence-publication-validation.json) record **13 published planning-draft pages at version 2**. Foundation's [five-page proposal](../../planning/foundation-specifications-2026-11-02/publication-proposal.json) is a separate local preparation, not five published pages. Fresh metadata, parent pages and assets are catalogued in [chapter 04](04-jira-confluence-and-assets.md); no automatic Git/Confluence/Lucid/Sites synchronization exists.

Later design is local first, followed by separately authorised ChatGPT Sites publication. The existing Site was not visually accepted. Use the inspected Claude artifacts, MA's explanatory design approach, Apple HIG and Monzo modular principles as quality references; do not revive Claude Design syncing or change Claude configuration as a side effect of visual publication. The separately scoped workflow adaptation is described in the takeover playbook. After architecture approval, update Lucid views with native service components, readable flows, source/version evidence and static/reduced-motion alternatives. Distinguish **Proposed → Approved architecture → Implemented → Deployed and verified**; approval never creates a cloud resource. Full end-to-end light/dark web/native/admin UX follows the agreed baseline. See [memory and pitfalls](05-memory-scratchpad-and-pitfalls.md) for additional continuity constraints.
