# MP layered requirements and architecture pack

**Mypaisaa Prediction · 1 November 2026 · Local drafts for review · Not published or implemented**

This pack expands the owner's confirmed direction into a detailed portfolio/import specification, product-wide phased plan, architecture and technology choices, and a concrete MP Confluence publication proposal. Current authority is the [41-decision register](../aws-options-2026-11-01/product-decisions.json). The initial 18 choices are answered; detailed contracts, scientific thresholds, UX and the full-scope cost model still need agreement.

**Current phase:** synthetic local/dev data, real instrument identifiers, actual screenshots/PDFs progressively later (DEC-041). Dev is a locally prepared fixture pack; no AWS environment has been provisioned by this work. No application implementation, paid calls or deployment follows from these documents.

[Open the reading hub](index.html) · [Initial decisions](../aws-options-2026-11-01/requirements-decision-pack.html) · [Synthetic fixture index](../../../data/synthetic-imports-v1/index.html)

## Read in this order

| Document | What it answers | Status |
| --- | --- | --- |
| [Portfolio/import specification](portfolio-import-spec.md) | Identity, source evidence, event semantics, preview/approval, deduplication, atomic visibility, replay, reconciliation and eligible metrics | Proposed detailed Layer 1 contracts |
| [Layer 1 story map](portfolio-import-stories.json) | 16 local stories with 64 acceptance criteria and decision/contract/example references | Draft IDs L1-S01–16; no Jira issues created |
| [Domain contracts](portfolio-import-contracts.json) | 15 entity contracts, 13 candidate API routes, 10 unresolved detailed choices | Design material, not deployed schemas |
| [Worked examples](portfolio-import-examples.json) | 12 synthetic financial/fault cases, including incomplete-history and ambiguous-XIRR cases | Acceptance inputs, not an implemented importer test run |
| [Phased delivery plan](phased-delivery-plan.md) | 10 phases, planning versus implementation dependencies, gates, cost/science/privacy evidence and rollback | No fixed delivery dates or implementation approval |
| [Product story/trace map](phase-story-map.json) | 48 umbrella stories plus 16 L1 stories, 41 decisions, 19 capabilities and 140 captured source references | Phase-level coverage; detailed source-clause decomposition remains open |
| [Architecture blueprint](architecture-blueprint.md) | Boundaries, data/agent/ML/live-delivery flows, environment/cost controls, alternatives and ADR readiness | Serverless direction proposed; A/B training choice unselected |
| [Technology matrix](tech-stack-matrix.md) | Requested/current/installed status, responsibilities, versions, alternatives and verification sources | No packages/services installed by this pack |
| [MP Confluence page map](confluence-page-map.md) | Exact MP destination and proposed page/parent/version changes | Five page creates, six bounded updates and eight proposed image upserts; write approval pending |

## Illustrative workflow and native architecture references

The reading hub contains an explicit-play import-process companion, with a static accessible alternative. It illustrates intended behaviour, not a running import or approved product-screen design. The supporting editable process source is [draw.io XML](visuals/import-workflow.drawio), with [SVG](visuals/import-workflow.svg), [PNG](visuals/import-workflow.png) and [GIF](visuals/import-workflow.gif) exports and a [manifest](visuals/manifest.json).

AWS/significant architecture remains in [the existing editable Lucidchart comparison](https://lucid.app/lucidchart/02218133-613a-4b78-aea4-e0dba26db386/edit). Its [Plan A native export](../aws-options-2026-11-01/option-a-lucid.png) and [Plan B native export](../aws-options-2026-11-01/option-b-lucid.png) are dated planning snapshots, not evidence of deployment or final topology approval. The old AgentCore option is retired. New detailed physical/data/trust-boundary diagrams follow the unresolved architecture decisions; no alternate tool is presented as their canonical replacement.

## Detailed current MP system diagram

A new detailed **proposed** logical system page was authored in the existing Lucidchart document: page 4, `jvMISWi7AU3v`, document version 2703. It includes native AWS components, data/approval/agent boundaries and launch cost visibility while keeping training/workflow choices explicit. [Native PNG](visuals/mp-system-architecture-native.png) · [Actual canvas source](visuals/mp-system-architecture-source.json) · [Export and validation manifest](visuals/architecture-lucid-manifest.json). The original A/B/C pages were preserved; no sharing permissions or AWS resources changed.

## Technical VPC and egress options

The [network appendix](network-topology-options.md) compares N0 without customer-VPC attachment, optional N1 two-AZ private jobs with S3/DynamoDB gateway endpoints, and conditional N1-E NAT/public egress. It covers route tables, ENIs, security-group limits, service/endpoint policies, private-job bootstrap paths, failure cases and cost formulas. None is selected or provisioned. [Native Lucid page-5 PNG](visuals/mp-network-options-native.png) · [Network provenance](visuals/network-lucid-manifest.json).

## Phase and budget charts

The [phase dependency chart](visuals/phase-dependencies.png) distinguishes planning prerequisites from implementation prerequisites directly from the story map. It shows no delivery dates or completion percentages. [Accessible SVG](visuals/phase-dependencies.svg) · [Editable draw.io chart](visuals/phase-dependencies.drawio).

The [planning budget chart](visuals/budget-envelope.png) shows only the owner-confirmed £70 operating envelope and £30 reserve within £100. It is not actual spend or a price quotation. [Accessible SVG](visuals/budget-envelope.svg) · [Editable draw.io chart](visuals/budget-envelope.drawio). Source and validation evidence are in [the chart manifest](visuals/planning-chart-manifest.json).

## Delivery and authority boundaries

- Plan every layer's requirements, contracts, stories and local web/native UX before implementation. Planning order differs from build dependencies: PH-01 ledger specification can be prepared before PH-02 foundations, while its implementation requires those foundations.
- Preserve the standalone non-trading remit and source/approval/forecast lineage. LLMs extract/propose/explain; code validates and computes. No document or agent can approve a financial change or promote a model.
- The main discovery dashboard launches with per-environment Claude/AWS/agent cost visibility. The £70 operation/£30 reserve allocations and £60/£75/£85 policy are planning controls within a £100 all-in ceiling, not proof that the full workload has been priced.
- Current starter code remains health plus sample volatile SSE/static concept preview; imports, auth, durable streaming, training, research and native/PWA clients are planned. SvelteKit 3 availability is verified in the stack matrix; it is not installed in this repository.
- Local IDs are not real MP issue keys. MP Jira work creation and Confluence page status do not certify acceptance. These documents have not run independent review; normal review/ship permissions remain intact.

## MP Confluence publication proposal

Destination is **MP / Mypaisaa Prediction**, space `mypaisaapr`. Existing MP pages and their current versions are recorded in the page map. Preserve history/content, reuse those hubs and create the five named children; no MA page is edited. Proposed private visual attachments are the import PNG/GIF, phase-dependency and budget charts, the detailed native Lucid system and VPC/network-options exports and two existing native Lucid A/B PNG exports. No actual source statement or private holding is uploaded as documentation.

The publish payload is prepared locally in [confluence-publish-payloads.json](confluence-publish-payloads.json). Page keys/asset keys are resolved only after an explicitly approved write; existing versions must be reread before updating, and ambiguous outcomes checked before retrying. No automatic/bidirectional sync is claimed. Public sharing, collaborators, deployment, PRs/merges and tracker closure are separate actions.

## What still needs a decision

The Layer 1 contract file lists L1-Q01–10, including precision/tolerances, snapshot rebase, explicit subset import, file limits, cost-basis/settlement methods, record-class retention, large-import visibility and approval/idempotency lifetimes. Product-wide architecture A/B, orchestration/runtime, identity/device matrix, real-source rights/pricing and scientific quality gates remain unresolved. Actual samples are deferred while synthetic examples support the decisions.

After review and owner choices, complete the detailed trace/story/UX baseline, reconcile the proposed architecture with historical ADRs, re-cost the whole initial scope, and obtain explicit end-to-end approval before application implementation. The next task is not inferred from a green documentation gate.

## Read-only alignment findings and proposed sync

The approved read-only comparison found drift in six MP Confluence hubs and eleven open MP Jira descriptions; it changed no files or external records. MP-3 is Done despite old roadmap wording; MP-16 remains Done for fixture tooling, not an implemented importer. The [separate proposed write scope](mp-sync-write-proposal.md) prepares five new pages, six preserved-content updates, eight image upserts and eleven existing issue-description updates, without issue-status changes or new Jira stories. All external application of that proposal requires explicit owner approval.
