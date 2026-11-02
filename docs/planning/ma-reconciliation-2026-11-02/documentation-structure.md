# Canonical MP documentation and story structure

**Proposed structure · MP-19 · Owner approval required before UX**

Use one readable hierarchy inspired by MA's area-by-area architecture and phase pages. Keep MP's existing Confluence identities and historical snapshots. New structure does not mean a new application scope, copied UI, automatic two-way sync or implemented trace checker.

## The records and their owners

| Record | Authority | Required joins |
| --- | --- | --- |
| Product/decision register | Owner-confirmed MP decisions; proposals labelled separately | Requirement ID, answer/date, superseded text, scope and consequence |
| Architecture areas and ADRs | Component boundaries, ownership, selected alternatives and rationale | Requirement, contract, risk, research, cost and phase |
| Contracts and examples | Data/API/event/action/model semantics | Producer, consumer, validation, units, errors, idempotency, security, version and golden example |
| Phase plan | Dependencies, scope and measurable entry/exit | Stories, decisions, contracts, planned tests and user demo |
| Jira | Actual work items and workflow state | Stable local ID, phase, requirement, source disposition, acceptance and evidence |
| UX/design record | Later owner-selected local boards and complete state flows | Story, payload contract, platform, accessibility, privacy and design decision |
| Confluence | A published reading snapshot of the above | Actual page/version, source revision/hash, publication receipt and preserved rich content |
| Git | Version history and eventual reviewed implementation | Issue, commit/PR, gate evidence and release state |

Jira Done does not establish model eligibility or phase acceptance. A local Lx-Sxx identifier is not a Jira key. A Confluence link is not evidence of a successful publication. Store explicit statuses for each join.

## Area-by-area architecture

The existing MP architecture hub remains the parent. Organise its specifications into these twelve stable areas; use the existing blueprint and technical deep dive as overview/navigation rather than duplicate authorities.

| Area | Specification scope | Important evidence before UX |
| --- | --- | --- |
| A01 Product and system context | Owner-only investment intelligence, horizons, initial/future markets, exclusions and capability catalogue | Agreed scope and vocabulary; no trading or household wealth expansion |
| A02 Identity and actions | Cognito, verified linking, sessions, recovery, owner step-up and sensitive-action catalogue | Authentication/state/action contracts across web and native |
| A03 Portfolio and evidence | Listing identities, ledger/imports/corrections, S3 lineage and data ownership | Atomic financial writes, duplicate handling, retention/deletion |
| A04 Data and performance | Source rights/capabilities, calendars/FX, XIRR, exposures and benchmarks | Provider matrix, formulas and incomplete/stale states |
| A05 Forecasting science | F1–F8, task/horizon definitions, baselines, evaluation, calibration and eligibility | Reproducible protocol and honestly unavailable outputs |
| A06 Anthropic research | Typed client-SDK loop, specialist routes, source grounding, batching, caching and memory | Manifest, tool authority, context provenance and spend limits |
| A07 Workflow and delivery | API/SSE, Scheduler, SQS, durable jobs/outbox, replay and notifications | Normal and failure/reconnect paths with owning components |
| A08 Guardrails and evals | Deterministic policy/figure checks, quarantine, T0/T1/T2, online/human evaluation | Release criteria, datasets, privacy, incomplete/blocked semantics |
| A09 Admin and approvals | Files, Activity/Audit, costs, candidates, settings and incident desk | Action-bound approval, concurrency/version conflicts and audit events |
| A10 Observability and money | Logs/metrics/traces versus business records, billing attribution/reservations and alarms | Signal catalogue, dashboard payloads, delayed reports and budget policies |
| A11 Security and recovery | Threats, IAM/egress, environment isolation, secrets, backups and restore/deletion | Retention matrix, recovery objectives and owner controls |
| A12 Clients and delivery quality | Adaptive PWA, SwiftUI/RN boundary, API types, offline/push, CI/CD and tests | Supported versions/platforms, compatibility and release evidence plan |

Each area page uses the same template: purpose; current versus proposed status; requirements; concepts adapted/rejected; selected/proposed decisions; components and ownership; input/output contracts; normal sequence; error/retry/recovery sequence; security/guardrails; audit/telemetry/cost; tests and examples; phase/story links; open decisions; primary sources; source/publication version.

## Phase pages

Keep PH-00–PH-09 stable. PH-01 can be planned before PH-02, but ledger implementation depends on PH-02 foundations. Later PH-08 verifies already-designed operational protections; launch-critical audit, cost admission and guardrails are not postponed until then. Native requirements and contract states are specified for every relevant phase; PH-07 is the current native build grouping, not permission to ignore native UX until release.

Every phase page must contain: user outcome, in/out scope, dependencies, architecture areas, requirements/decisions, shared contracts, story catalogue, synthetic examples, acceptance tests, UX states to design later, observable/auditable events, cost/security/privacy consequences, failure/recovery demo, measurable exit and explicit open blockers. Estimates and dates follow scope/compatibility evidence; MA estimates are not imported.

The [phase specifications](phases) compile the existing 64 local story drafts with new gap links. Detailed acceptance is retained; stories remain unready where decisions or UX are missing. The existing six epics MP-4–MP-9 are crosswalk containers. A future epic-per-phase reorganisation needs an explicit agreed mapping and should preserve issue history, not create a second competing roadmap.

**ARC-08 owner direction:** all identified admin investigation/configuration/approval/audit/cost/identity/recovery journeys receive complete UX before first application build. Their policies/contracts must be specified before that UX; final operations phases verify controls already planned from foundations. This does not start UX now.

## Story readiness contract

Every implementation story needs an actual Jira key and local stable ID; parent/phase; user outcome; sources and MP-specific adaptation; precise positive/negative acceptance; producer/consumer contracts; units and error semantics; code ownership; data/privacy/authority boundaries; UX states/platforms; test fixtures and expected results; failure/recovery; telemetry/audit/cost events; dependencies; estimate/uncertainty; rollback and release evidence. Port work is explicit when shared contracts cannot supply the client implementation.

Use four readiness states: **draft**, **blocked on architecture**, **blocked on UX**, and **ready for an explicitly authorised build**. Current implementation stories are draft/blocked. A checklist is not automatically satisfied when a ticket is created.

Each MA concept receives an explicit disposition: retained, adapted, rejected/superseded, reference-only or out of scope. Preserve the original source reference while writing MP acceptance in MP terms. The source-to-phase crosswalk alone does not complete sentence-level acceptance decomposition.

## Publication and change control

Prepare exact Confluence payloads locally first, including existing native Lucid/editable links and readable static/motion companions. Keep pages colourful through supported panels, tables and diagrams; animation must explain a flow and retain a static alternative. Significant architecture revisions use native Lucid AWS components and actual export provenance.

Before publishing, read current page and draft versions and preserve rich content. Update existing hubs by bounded insertions; create only missing agreed area/phase pages. Record returned IDs/versions and read back links, media and unchanged content. The new publication proposal is local, not applied. Future changes update the requirement, ADR/contract, phase/story, UX and Confluence receipt together. A future automated drift checker must be built and tested before calling this automatic synchronisation.

## Baseline version and approval

Baseline `MP-ARCH-1` is a proposed name, not an approved version. Its approval record must list exact document hashes/commit, selected ADRs, phase/story map and every conditional live-activation prerequisite. Architecture sign-off permits the next UX planning step only; later complete UX approval and explicit implementation permission are separate.
