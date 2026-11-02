# Platform architecture reconciliation and researched recommendations

**MP-19 | 2 November 2026 | Maker research draft, not independent review | Planning only**

This lane carries MA concepts into a separate MP architecture. MA is not an approved template for MP resource topology, versions, permissions, budgets or product scope. The owner's current MP decisions and eventual baseline ADRs take precedence. No application, infrastructure, authentication or agent implementation is authorised by this document.

## Evidence and limits

Seventeen assigned MA Confluence pages were fetched as full HTML with version/hash evidence, and relevant MA architecture prose was compared with MP's current blueprint/stack/deep dive. The source repository snapshot is `387fc38bdc99d77460b6b03d90e2637241e79d1e`. [Machine-readable evidence](platform.json) and [source manifest](platform-evidence/source-manifest.json) preserve source identities and research URLs. Embedded visual states were not rendered. Full fetch does not certify that every table row, external design board or acceptance clause has been individually verified. Raw HTML is a temporary local cache, not copied into MP's source-of-truth docs.

## Proposed structure to settle before UX

The target should have six explicit boundaries: clients and identity; commands/queries and resumable delivery; durable domain records and evidence; scheduled/queued numerical work; the bounded Anthropic research/explanation loop; and operations/approvals/budgets. Data, features, model families and research routes plug into typed contracts, rather than new markets requiring new bespoke end-to-end architectures.

The initial deployment inventory is provisional: static PWA origin; Cognito; one Regional REST API; separate API and stream Lambda packaging; owner/portfolio/import/job/forecast/outcome/approval/cost storage; private S3 evidence; ingestion/forecast/research-notification work queues with explicit consumers; Scheduler; one selected workflow mechanism; capped SageMaker jobs where justified; CloudWatch/OTel with durable run evidence. This is a boundary catalogue, not a claim that every row requires its own Lambda/table/account.

One code-controlled Anthropic runner can serve several task routes. Nine responsibilities do not imply nine always-running LLMs. Haiku-class nonurgent enrichment and Sonnet-class interactive reasoning are candidates; exact IDs, effort, tools, tokens and safety/eval versions belong in an approved manifest. The initial numerical design should compare pooled task/horizon artifacts and stored daily forecast results before multiplying endpoints.

## Findings and required decisions

### PL-01 — Remove conflicting current architecture authority

**MA concept:** MA has a central architecture, area pages, a plan and an explicit decisions/open-questions map.

**MP position:** MP current deep dive and ten-layer pack coexist with six-phase implementation-plan, bootstrap ADRs and contributor rules mentioning older storage, runtime and budget choices.

**Recommendation:** Make one versioned MP baseline the authority; preserve dated evidence as historical and replace conflicting current instructions. Add a decision precedence table and a source-to-phase-to-story crosswalk. Do not turn all ten layers into separately approved architectures.

**Owner decision:** Approve baseline structure, decision owner and handling of superseded ADRs.

Planning acceptance evidence:

- Every current instruction resolves to the same £100 all-in/direct Anthropic/DynamoDB-preferred direction.
- Every unselected option is marked open with an owner and deciding evidence.
- One current phase map has explicit historical epic crosswalk.

Phase: **PH-00**.

### PL-02 — Settle agent roles, SDK loop and memory authority

**MA concept:** MA separates deterministic responsibilities from LLM work and centralises tools, cache and scoped memory in a thin client runner.

**MP position:** MP proposes nine logical responsibilities but only four Claude task routes plus one code coordinator; production manifest is not agreed.

**Recommendation:** Retain one controlled Anthropic client runner; specify deterministic work separately from Claude routes, with role/tool/context/budget/eval contracts. Keep Haiku/Sonnet classes as candidates and pin evaluated IDs later. Memory notes must have source, expiry, taint and correction/deletion semantics and may never replace ledger facts or approved settings.

**Owner decision:** Approve role-to-route catalogue, memory authority and per-route tool/budget limits; no automatic Opus route.

Planning acceptance evidence:

- A table enumerates each responsibility, trigger, compute unit, model-if-any, tools, outputs and forbidden operations.
- Ask/approve exits Lambda and resumes from a typed pending action rather than waiting for the owner.
- Model/prompt/tool/memory-version changes identify affected safety suites and require appropriate approval.

Phase: **PH-05**.

Sources: [official documentation 1](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

### PL-03 — Separate batch deadlines from live work and justify caching

**MA concept:** MA uses Haiku batches for news and overnight judging plus stable-prefix caching. Some MA prose also mentions batch-generated briefing narration.

**MP position:** MP correctly makes 07:30 briefing/material risk independent of a newly submitted batch, but exact batch schedule, retry and cache economics are not specified.

**Recommendation:** Use batch only for nonurgent enrichment and bounded evals. Deadline-aware submission/polling and per-item state prevent delayed results from rewriting already-issued evidence. Cache eligible stable prefixes only when expected reuse pays its write premium; no artificial warming or guaranteed hit-rate assumption.

**Owner decision:** Approve batch-eligible workloads, freshness cutoffs, late-result policy and per-route cache policy.

Planning acceptance evidence:

- Pending batch liability is reserved once and reconciled by item/custom ID; unordered, expired and partial results have cases.
- The briefing uses last-valid dated evidence, deterministic prose or pending labels when the batch misses its cutoff.
- Cold-cache, no-cache, best-effort batch-hit and per-model-version cost cases are costed.

Phase: **PH-05**.

Sources: [official documentation 1](https://platform.claude.com/docs/en/build-with-claude/batch-processing), [official documentation 2](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), [official documentation 3](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api).

### PL-04 — Specify the authenticated SSE delivery contract and operating budget

**MA concept:** MA proposes Regional REST streaming through Python Web Adapter, durable event log and frequently polled live buffers.

**MP position:** MP has a local volatile sample stream and proposed separate streaming Lambda; durable contract and open-connection costs are not yet accepted.

**Recommendation:** Keep short commands/queries and durable jobs separate from observation. Recommend Regional REST API streaming with explicit Python Web Adapter compatibility, bounded stream lifetime, per-device/tab connection caps and event IDs. Replace the MA 200ms/1-second polling targets with a measured latency/cost envelope suited to personal use.

**Owner decision:** Approve replay retention, latency target, auth/session approach, refresh/reconnect and polling cadence.

Planning acceptance evidence:

- Specify handshake/auth, event schema, ordering, after-cursor, heartbeat, resync and logout/revocation behaviour.
- Disconnect does not cancel an accepted job or trigger duplicate provider calls.
- Cost scenario counts active device hours, Lambda GB-seconds, DynamoDB reads and reconnect bursts; no all-day stream assumed free.

Phase: **PH-02**.

Sources: [official documentation 1](https://docs.aws.amazon.com/apigateway/latest/developerguide/response-transfer-mode.html), [official documentation 2](https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html).

### PL-05 — Define queue, outbox, replay and external-side-effect semantics

**MA concept:** MA puts handoffs through SQS and describes safe idempotent retries and replay.

**MP position:** MP proposed job/outbox and separate scheduler/worker DLQs are stronger than a blanket exactly-once claim but need a complete message catalogue.

**Recommendation:** Use stable business IDs, durable claims/leases and an atomic application outbox. Standard SQS for independent work; FIFO only for ordering that is actually required, such as a conversation. Distinguish scheduler target failures from worker failures; quarantine permanent invalid inputs without infinite retries.

**Owner decision:** Approve queue topology, ordering partitions, retention/replay authority and ambiguous-provider-call reconciliation.

Planning acceptance evidence:

- Message table defines producer/consumer, schema, key, ordering, lease, visibility, max attempts, concurrency and failure destination.
- Crash cases span before/after provider submission, database commit, outbox dispatch and acknowledgement; ambiguous paid calls are not blindly resubmitted.
- Partial batch failure/FIFO order and stale or expired owner approvals have explicit cases.

Phase: **PH-02**.

Sources: [official documentation 1](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html), [official documentation 2](https://docs.aws.amazon.com/prescriptive-guidance/latest/lambda-event-filtering-partial-batch-responses-for-sqs/best-practices-partial-batch-responses.html), [official documentation 3](https://docs.aws.amazon.com/scheduler/latest/UserGuide/configuring-schedule-dlq.html).

### PL-06 — Choose one orchestration mechanism for cross-service jobs

**MA concept:** MA selects Step Functions plus EventBridge for its later team.

**MP position:** MP leaves Step Functions versus Lambda Durable Functions open, with a starter Python3.12 runtime and optional SageMaker jobs.

**Recommendation:** Recommend Step Functions Standard for the proposed cross-service SageMaker/import/approval workflows because visual state and native service joins match the requested technical/admin evidence. Compare Lambda Durable Functions as the code-first alternative rather than adding both by default. State-machine payloads should carry opaque references, not private documents or credentials.

**Owner decision:** Owner selects Step Functions versus Durable Functions after a representative failure/retry/wait/cost comparison.

Planning acceptance evidence:

- One representative import and train-evaluate-approve journey is specified in both alternatives with equivalent guarantees.
- Runtime/container/SDK/region evidence is explicit: managed durable Python3.13/3.14 are listed, while OCI images support additional versions; Python3.12 is not declared impossible.
- Replay/timeout/cancellation state retention and sensitive-payload redaction are documented.

Phase: **PH-00**.

Sources: [official documentation 1](https://docs.aws.amazon.com/lambda/latest/dg/durable-functions.html), [official documentation 2](https://docs.aws.amazon.com/lambda/latest/dg/durable-supported-runtimes.html), [official documentation 3](https://docs.aws.amazon.com/lambda/latest/dg/with-step-functions.html).

### PL-07 — Separate SageMaker training from inference hosting

**MA concept:** MA plans small Lambda training/inference with container fallback; MP explicitly requested a SageMaker architecture scenario.

**MP position:** MP two-family SageMaker diagram remains a proposal, not a final training or serving ADR.

**Recommendation:** Recommend capped on-demand CPU SageMaker candidate training/evaluation, S3 model/evidence references and owner-approved portable Lambda inference where compatibility permits. Daily scheduled inference can run once per eligible universe/horizon then serve stored results. Keep Batch Transform or on-demand Serverless Inference as measured alternatives, with no always-on endpoint or provisioned concurrency by default.

**Owner decision:** Approve managed training value, job cap/cadence and inference host after representative artifact/resource/cost evidence.

Planning acceptance evidence:

- Model registry records artifact hash, data cutoff, splits, features, calibration and approval; it need not imply a paid always-on tracking server.
- Serving estimates compare stored daily results/Lambda, Batch Transform and Serverless with loading/cold-start/egress/storage included.
- Serverless exclusions are explicit: no VPC configuration, network isolation, data capture or Model Monitor; private-training controls do not automatically transfer.

Phase: **PH-04**.

Sources: [official documentation 1](https://docs.aws.amazon.com/sagemaker/latest/dg/hosting-faqs.html), [official documentation 2](https://docs.aws.amazon.com/sagemaker/latest/dg/serverless-endpoints.html).

### PL-08 — Prove financial visibility and audit atomicity before accepting DynamoDB keys

**MA concept:** MA uses a single-table document registry and transactions with audit history.

**MP position:** MP prefers DynamoDB but already notes large-import staging and a possible relational alternative; implementation-ready access/invariant specification is missing.

**Recommendation:** Keep typed financial entities independent of persistence and approve access patterns first. Recommend DynamoDB only if staged imports, corrections, audit/outbox and concurrent account writes have one consistent commit-visibility rule. Keep queryable Parquet evidence in S3; do not force all history into one growing item.

**Owner decision:** Approve ledger/import atomicity and access pattern contract under existing MP-12, including whether a relational fallback is needed.

Planning acceptance evidence:

- Model large imports beyond100 actions/4MB and persistent idempotency beyond the10-minute service token window.
- Every reader/projection/export/replay honours the import commit marker; failed staging cannot change holdings.
- Before/after audit, commit marker and outbox invariants are explicit and restore/rebuild cases link MP-13.

Phase: **PH-01**. Extend existing **MP-12**; do not create a duplicate.

Sources: [official documentation 1](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TransactWriteItems.html).

### PL-09 — Design verified account linking and protected owner actions

**MA concept:** MA has per-environment Cognito, managed identity, device controls and a fresh second check for sensitive admin actions.

**MP position:** MP owner chose Apple, Google and passkeys with managed sign-in; recovery, federation linking, reauthentication and token/session architecture remain open.

**Recommendation:** Use Cognito managed sign-in and explicit verified linking to an owner identity; never merge users from email equality alone. Keep browser cookie/CSRF and native PKCE/token storage designs separate. Bind a fresh step-up proof to a specific sensitive action and its proposed values, with expiry and server checks.

**Owner decision:** Resolve under MP-11: linking enrolment/recovery, step-up proof, devices, token revocation and two independent passkey recovery paths.

Planning acceptance evidence:

- Document sign-in/link/recovery/revoke sequences for Apple, Google and local passkey identities, including lost-device/account cases.
- Admin approvals bind owner, environment, action, payload hash and expiry; a generic logged-in session is insufficient.
- Cross-environment tokens, stale approval, CSRF, linking takeover and native redirect interception have negative cases.

Phase: **PH-02**. Extend existing **MP-11**; do not create a duplicate.

Sources: [official documentation 1](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html), [official documentation 2](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-federation-consolidate-users.html).

### PL-10 — Select account, region and network boundaries for MP rather than inheriting MA

**MA concept:** MA uses one named account/region and optional sophisticated VPC proxy/perimeter options.

**MP position:** MP still has N0/N1/N1-E alternatives, cheapest-suitable-region preference and no selected accounts/region/IaC.

**Recommendation:** Recommend N0 for external Anthropic/data-facing Lambdas initially and only a justified N1 private job scope. Compare cheapest suitable regions on all required services, data residency and total egress/telemetry charges. Compare separate dev/prod accounts against strict same-account isolation without duplicating MA domains, CIDRs or proxies.

**Owner decision:** Approve accounts, region, IaC and network option; VPN remains optional and does not substitute for auth.

Planning acceptance evidence:

- A boundary matrix identifies IAM principals and permitted resources/actions per env and function.
- Gateway endpoints are not an Anthropic internet path; public-subnet attachment alone gives Lambda neither public IP nor internet access.
- Any NAT/interface endpoint/proxy/VPN has operations/failure/cost justification and does not appear enabled by diagram.

Phase: **PH-00**.

Sources: [official documentation 1](https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html).

### PL-11 — Define MP release evidence and security regression layers

**MA concept:** MA uses one build, dev validation, owner-approved prod promotion, rollback, path filtering and web/native/agent gates.

**MP position:** MP current CI verifies starter/tooling/docs and is not a production web/native/release pipeline.

**Recommendation:** Carry the gates and immutable-promotion concepts, not MA tool/version counts or automatic dev-apply permission. Recommend one IaC stack family, OIDC per environment, pinned builds/SBOM and artifact provenance; local/stub replay tests offline by default, paid evals separately capped and approved.

**Owner decision:** Approve build/test/release matrix, IaC choice, vulnerability policy, browser/device service choice and Mac CI budget.

Planning acceptance evidence:

- Matrix links changes to unit/contract/integration/numeric/security/agent/web/native checks and identifies which are offline versus paid.
- One tested artifact is promoted with explicit prod approval and rollback evidence; source/data/schema/config changes have compatibility plans.
- Scanner findings have severity/exploitability/exception expiry ownership; incomplete or budget-exhausted evals never become green.

Phase: **PH-08**.

Sources: [official documentation 1](https://docs.github.com/en/actions/concepts/security/openid-connect).

### PL-12 — Specify trace joins and telemetry budgets without universal trace claims

**MA concept:** MA plans RunRecord, OTel/GenAI spans, client telemetry and CloudWatch investigations.

**MP position:** MP carries business correlation and short-lived telemetry but exact SDK/exporter/sampling/cardinality contracts are open.

**Recommendation:** Use durable business records as operational truth, with sampled OTel traces and explicit asynchronous links. A user action, a queue batch, a resumed approval and a stream session do not have to form one infinitely long parent-child trace. External provider internals are not observable solely because the SDK call is traced.

**Owner decision:** Approve telemetry backend/sampling/redaction and per-env cost envelope, coordinated with admin/audit lane.

Planning acceptance evidence:

- Define business/run/request/trace/span/message/provider IDs, propagation headers/attributes and link rules at every boundary.
- Test redaction, context injection/forgery, sampled-out requests and multi-message batches; Activity remains complete when a span is absent.
- Estimate dimensions, ingestion/query/retention/custom metrics/alarms rather than copying MA free-tier/£2.50 claims or assuming100% tracing.

Phase: **PH-02**.

Sources: [official documentation 1](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html), [official documentation 2](https://aws.amazon.com/cloudwatch/pricing/).

### PL-13 — Make cost admission conservative across concurrent work and shared credits

**MA concept:** MA has per-agent shares, model degradation and provider token metering.

**MP position:** MP already mandates£100 all-in,£70 operation/£30 reserve,£60/75/85 actions, per-env dashboard and no uncovered fallback; exact liabilities and allocations remain open.

**Recommendation:** Reserve conservative maximum liability before paid submissions, track unknown/retrying/batch commitments and reconcile once. Keep gross, verified credit and cash separate, shared credit counted once across apps. Dashboard reads cached aggregates; bill reports remain delayed even if polled six-hourly/daily.

**Owner decision:** Approve per-feature ceilings, staleness policy, allowed degradation and how shared/unknown credits affect admission.

Planning acceptance evidence:

- Concurrent final-pence requests cannot each independently pass the same remaining budget.
- Unknown credit/report availability refuses uncovered work; deterministic output remains available without silently upgrading paid routes.
- Include source subscription, FX/tax assumptions, telemetry, builds, training, backups and collectors in baseline and stress recosts; no guarantee AWS billing instantly stops.

Phase: **PH-02**.

Sources: [official documentation 1](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api), [official documentation 2](https://aws.amazon.com/cloudwatch/pricing/).

### PL-14 — Fix web/native ownership and offline/privacy contracts before UX

**MA concept:** MA defines an adaptive web app, native SwiftUI core in an RN shell, device integrations and testable static/prototype journeys.

**MP position:** MP retained Swift/SwiftUI plus RN shell but has no approved bridge/runtime/device matrix; requested SvelteKit3 is not the existing React architecture Site.

**Recommendation:** Recommend static SvelteKit PWA shell on S3/CloudFront with authenticated API data; add SSR only for a demonstrated need. Honour MP Swift ownership of native surfaces/cache/secure-device integration while RN owns navigation/bridge contracts. Define privacy-safe offline scope and durable reconnect independently for each platform.

**Owner decision:** Approve supported OS/devices (including what Duo means), cache/offline/push capabilities, bridge ownership and exact compatible stack; defer visual design until these contracts are settled.

Planning acceptance evidence:

- S3 static output does not imply SvelteKit server sessions/actions exist; session architecture is explicit.
- Offline owner/data clearance, logout, expiry, stale results and app/service-worker update cases are specified.
- Web and native have separate implementation stories using shared API/event contracts, not claims that one UI codebase is shared; widgets/Siri/share-sheet/LiveActivities are individually phased.

Phase: **PH-07**.

Sources: [official documentation 1](https://svelte.dev/docs/kit/adapter-static).

## Architecture sign-off sequence

1. Approve the product boundary and authority map, preserving current confirmed choices and historical evidence.
2. Resolve data/ledger/access/approval contracts before selecting exact persistence keys and deployment units.
3. Choose orchestration, SageMaker execution/serving, auth/session and network/account boundaries using the alternatives and deciding evidence above.
4. Agree workload/service/telemetry/eval budgets, deadline and recovery policies. Account/pricing/credit assumptions remain explicit.
5. Pin a compatible stack and approve one phase/dependency/story/contract/test map with every open item either settled or an explicit deferred activation gate.
6. Start UX only after the architecture baseline is approved; map every screen/state to the settled contracts. Start implementation only after UX and the complete requirements baseline are separately approved.

This task can finalise the documentation structure and decision packets. It cannot honestly declare architecture choices settled until the owner has selected them, nor use unknown source entitlements/credits as evidence of a feasible bill. Actual holdings are deferred for planning; synthetic local/dev fixtures continue to support contract examples.

## Research notes that change the MA adaptation

- Current Durable Functions documentation distinguishes managed runtime support from OCI container flexibility. Do not mistake an absent managed Python3.12 row for a blanket inability to use3.12 packaging.
- SageMaker Serverless Inference is a valid intermittent-serving alternative, but its feature exclusions matter; it is not a small private-networked real-time endpoint with all monitoring features.
- The native web/mobile client contract must belong to MP. MA's RN caching and framework version choices are not binding; the existing MP instruction gives Swift the native surfaces and secure-device/cache responsibilities.
- Monitoring and API token counts support estimates and delayed reconciliation. Neither one guarantees the final bill, fully observable external services, perfectly shared trace trees or zero cost because a free tier exists.

## Coverage map

| MA source | Version | Concepts carried |
| --- | --- | --- |
| [Tech stack, FastAPI, DynamoDB, agents and end-to-end observability](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/2622286) | 7 | Layered stack; FastAPI REST versus streaming adapters; DynamoDB repository; Agent client loop; Telemetry cost model |
| [§18 · Environments, domains and delivery](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1540302) | 15 | Environment separation; Identity and domains; Local synthetic mode; IaC and artifact promotion |
| [CI/CD, vulnerability scanning, smoke and regression architecture](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/2589543) | 12 | Path-filtered CI; Security scans; Regression pyramid; Smoke and rollback |
| [Optional AWS VPC enterprise lockdown, data perimeter and costing](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/3670133) | 4 | Optional VPC perimeter; NAT and endpoint alternatives; DNS and egress controls; Network costs |
| [📬 §21 · Queues and live delivery](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1442082) | 8 | Queues; Idempotency; DLQ and replay; SSE order and resumption |
| [🤖 §8 · The agent: one tool loop, its tools and its models](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1671210) | 13 | Direct Anthropic client SDK; Tool loop; Pause/resume; Prompt cache; Numerical grounding |
| [🧠 §24 · Caching and memory for every agent](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/3899472) | 2 | Stable prompt prefixes; Per-route caching; Memory scope and deletion; Context budgets |
| [🧭 §1 to §3 · The rules, what MyPaisa does, and the system around it](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1671190) | 10 | No trading; Deterministic numbers; System components; Account boundaries |
| [🔔 §11 to §13 · Notifications, the road from the wealth tracker, and the stack](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1703997) | 16 | Briefs and notifications; Push channels; Typed stack; Historical migration context |
| [🧩 Architecture v4: every part, the trace, the loop, the agents and the models](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1147085) | 4 | System inspector; Tracing journey; Nine logical roles; Storage; Spend ladder |
| [🛰️ Five journeys through AWS, hop by hop](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1671270) | 4 | Request journeys through AWS; Async joins; Failure and recovery paths |
| [🏗️ The Lucid drawings, and how they are made](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1703977) | 2 | Native AWS Lucid views; Source and exports; Technical diagram governance |
| [Phase 0 · Foundations at every door](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/294942) | 52 | Foundation work ordering; Agent/tool eval gates; Infrastructure and schema preparation |
| [Phase 1 · Talk: sign in and chat with the agent at every door](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/327939) | 22 | Auth and chat phase; Activity first; Streaming; Agent guardrails and evals |
| [Local iOS and iPadOS Maestro testing and private TestFlight beta plan](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/2818197) | 8 | Local Maestro tests; Device coverage; Private TestFlight; Native CI cost |
| [Web visual regression, ARIA snapshot diffing and WCAG 2.2 AA accessibility pipeline with Argos CI](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/4816897) | 4 | Playwright visual regression; ARIA snapshots; WCAG gates; Argos option |
| [Phase 20 · The app beyond the chat: widgets, Siri, the share sheet, Live Activities](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/66145) | 19 | Widgets; Siri/App Intents; Share sheet; Long-job Live Activities |
