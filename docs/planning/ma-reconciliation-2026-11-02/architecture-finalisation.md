# Architecture finalisation before UX

**MP-19 · Proposed decision sequence · Owner sign-off outstanding**

The goal is an agreed architecture baseline with explicit interfaces, scientific objectives, operating limits and a phase backlog. A diagram is explanatory evidence; it does not select the architecture. The sequence below closes important choices in dependency order. Research recommendations are labelled recommendations and do not change the confirmed MP choices.

## 1. Close feasibility and scope first

Keep all confirmed product outcomes and forecast horizons in the requirements. Define precisely what each output means: realised performance/XIRR, rule score, evaluated probability, predictive interval and long-range scenario. Availability and confidence must be represented independently. A 3–5-year scenario is not an evaluated five-year promise merely because the UI draws a fan.

Produce a per-use source matrix: listing identity, exchange, instrument kind, quote delay, history, corporate actions, point-in-time fundamentals, retention, training/non-display rights, derived displays and any permitted transfer to Anthropic. A library licence is not a market-data licence. Actual holdings can arrive later; synthetic real-ID fixtures support planning, but cannot validate feed rights or live coverage.

Rebuild the all-in cost model including Twelve Data, AWS dev/prod, Anthropic usage/evals, telemetry, backups, builds, DNS and tax/FX assumptions. Treat the reported credit as shared and unverified. Resolve the data tier before selecting architecture capacity. If the full scope cannot fit £70 planned operation plus £30 reserve, present the scope/freshness/cost choice; do not silently remove markets or use an unlicensed source.

**Recommended:** conditional source capabilities with labelled daily fallback and explicit unavailable states; retain the £100 ceiling. **Alternative:** owner-approved narrower live coverage while retaining the agreed broader daily/scenario scope. Neither authorises a paid upgrade.

## 2. Freeze system and data boundaries

Create the component catalogue and trust-boundary map: clients, identity, API, durable business records, object evidence, asynchronous work, source adapters, quantitative science, Claude research, approvals, notification delivery and operations. Specify one owning component for each write and one durable source of truth per record class.

Resolve DynamoDB ledger suitability with a paper access-pattern/transaction design: commit+audit+outbox atomicity, revisions, duplicate imports, corrections, queries and restore. S3 and DynamoDB are not one transaction. Define immutable IDs, decimal/currency units, event versioning, business time versus recorded time, error states and idempotency scope before interface designs.

**Recommended:** DynamoDB operational records and private S3 evidence/Parquet, subject to a concrete ledger-fit decision. **Alternative:** a relational ledger if its access/integrity requirements fail that design and its complete cost is accepted. Preserve existing ADR history and explicitly supersede incompatible decisions.

## 3. Select execution and request flows

Settle static PWA versus SSR, session/token boundaries, FastAPI Lambda packaging, Regional REST streaming compatibility and bounded reconnect/refetch. API acceptance, durable job completion and stream delivery are different events. Every long operation must recover from client disconnect.

Choose clocks, routing and execution deliberately: EventBridge Scheduler for time, SQS for buffering/backpressure and bounded workers, optional EventBridge bus for justified multi-consumer events, and one documented orchestration approach for multi-step workflows. Separate scheduler delivery DLQs from worker exhaustion. State who retries, who may replay, how a completed external call is reconciled, and what happens to an ambiguous call.

**Recommended:** a lean event/queue core with explicit durable job/outbox records; use a state-machine service only for workflows that need it and pass compatibility/cost review. **Alternative:** one supported durable workflow runtime after its packaging, checkpoint, replay, observability and billing semantics are proven. Do not introduce both frameworks without a distinct requirement.

**Owner direction recorded on 2 November 2026 (ARC-03): Lambda Durable Functions with Python workflows is selected.** The alternatives above retain the decision-time comparison; the owner selection now controls. Runtime, replay, failure and cost proofs remain open.

## 4. Agree the ML and Anthropic contracts

Retain one server-controlled Anthropic client-SDK loop and bounded task routes. Define the logical role catalogue separately from the number of LLM calls, deployed workers or trained models. Pin route/model/prompt/schema/budget/eval versions at release. Code computes financial quantities; LLM extraction is versioned evidence and must earn incremental predictive value through an ablation.

**Recommended:** Haiku-class bounded extraction and eligible nonurgent batches, Sonnet-class interactive evidence explanation, no routine expensive default tier. **Alternative:** a single evaluated model class if simpler routing proves cheaper for the measured workload. No per-ticker LLM loop on every quote refresh.

For ML, decide the first trainable families, task/horizon artefact policy, retraining trigger and cost ceiling. Evaluate pooled simple baselines before more complex challengers. Define point-in-time features, chronological splits, horizon-aware purging, untouched evaluation periods, calibration and uncertainty. Models enter shadow and require owner promotion. Long-horizon labels cannot mature faster because forecasts are refreshed daily.

**Recommended:** selective short-lived SageMaker CPU training/evaluation with portable approved inference when feasible. **Alternative:** bounded AWS job execution without SageMaker if the measured workload/cost justifies it. Always-on endpoints, GPUs and provider-claimed accuracy are not assumed. **ARC-04 owner direction, 2 November 2026:** selective SageMaker CPU training/evaluation with portable Lambda inference is selected. Job limits, artefact/runtime fit and complete cost/scientific evidence remain open.

## 5. Set admin, safety, eval and operating policies

Agree an action catalogue before drawing admin screens: viewing, source access, reprocessing, committing/correcting records, changing configuration/budgets, replay, deletion, promotion and rollback. Each sensitive action needs current server authorisation, an action-bound approval, expiry, version checks, idempotency and durable audit evidence. Face ID alone is not server authorisation.

Separate financial/source evidence from operational logs and sampled traces. Complete retention/deletion/backup/restore matrices, incident severity, recovery objectives, notification routing and safe recovery boundaries. Launch cost visibility, audit and deterministic guardrails start with foundations; the final operations phase verifies them rather than adding them for the first time.

Specify offline T0 replays, change-triggered live T1, model-change T2, online deterministic checks, budgeted sampled judging and human judge calibration. Separate safety blocking criteria from quality/capability indicators and ML prediction scores. MA's trial counts and judge thresholds are inputs to assess, not automatic MP approval.

## 6. Approve the architecture baseline

The sign-off bundle must contain the component/ownership catalogue; decided ADRs with rejected alternatives; API/event/data/agent contracts; source entitlements and cost envelope; threat/action/retention/recovery policies; scientific/eval plan; detailed phase dependencies and stories; technical Lucid diagrams with provenance; and a reconciled gap register.

Classify every open item as **blocks UX**, **blocks implementation**, **blocks live activation**, or **future extension** with a reason. No material UI-shaping boundary may remain undecided when UX begins. Provider proofs that require later live access can be conditional, but the product's fallback and unavailable states must already be fixed. No accepted baseline silently claims those proofs passed.

## 7. Start UX, then obtain separate build permission

After architecture sign-off, create the design system, information architecture, web and Apple adaptive flows, state inventories, accessibility/privacy/reduced-motion behaviour and complete prototype. Include market discovery, holdings/imports, forecasts/proof, chat, costs, activity/audit, admin approvals and incident recovery. User journeys and story acceptance may be specified now; screen design starts after the sign-off.

Review and settle the complete end-to-end UX. Update phase/story/contract mappings and Confluence. Only then ask for an explicit implementation start. The detailed implementation order is not permission to execute it.

## Recommended next decision session

Start with three linked decisions: (1) permitted source uses and affordable coverage, (2) bounded ML runtime/training plan, and (3) durable ledger/job/approval ownership. Present two concise options for each, mark the researched recommendation, explain cost and user-visible consequences, and record the owner's answer. Resolve identity/security, recovery/evals and client compatibility next. Finally approve the compiled architecture baseline and its phase/story structure before UX.
