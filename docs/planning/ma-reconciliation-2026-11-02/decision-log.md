# Owner architecture decisions

**2 November 2026 · MP-19 · Architecture baseline not yet approved**

## ARC-01: preferred sources and verification route

The owner selected option A: **Keep Yahoo/Grow; verify uses and investigate gaps.**

Yahoo Finance and Twelve Data Grow remain preferred candidates. Verify listing coverage/freshness and permission for retained history, training/analysis, derived displays and any selected evidence sent to Anthropic. Investigate alternative sources for a documented gap, without subscribing or automatically increasing spending. Preserve the £100 all-in ceiling, modular adapters and explicit daily/unavailable fallbacks.

This settles the research/design direction only. Actual entitlements, affordability and supported capabilities remain evidence gates under FC-01/03/15, CT-13 and PL-13; none is marked closed. No provider activation, paid source, implementation or complete architecture approval is implied.

Review/publication/PR status: the owner chose to keep drafts and discuss decisions first. Independent review, Confluence publication and PR creation remain pending.

Next: complete detailed area contracts and phase/story evidence, then present the exact architecture baseline for separate sign-off.

## ARC-01 dev refinement: Twelve Data Basic/Free

The owner asked to consider the free tier for dev. Record it as the preferred live dev candidate alongside offline synthetic fixtures, not as an activated subscription or a guarantee of the same coverage as Grow. Official pricing/credit documentation checked on 2 November 2026 lists 8 API credits/minute and 800/day, resetting at 00:00 UTC. Credits are weighted by endpoint and symbol; one HTTP request need not equal one credit. See [dev data policy](dev-data-policy.md).

## ARC-02: operational ledger and write ownership

The owner selected option A: **DynamoDB + S3, with one controlled write service.**

DynamoDB is the selected direction for operational records; originals remain encrypted/private in S3. A backend application write service owns financial ledger commits/corrections and their audit/outbox evidence. Research/import agents prepare typed drafts; owner confirmation authorises the backend to validate and apply the exact proposed financial change. Automated market-data/job writes have separately scoped authority and are not silently treated as owner-confirmed ledger edits.

Before final sign-off, specify access patterns, financial precision and XIRR/FX conventions, duplicate identity, concurrent corrections, large-import staging/visibility, required audit queries, recovery/reconciliation and owner exports. S3 and DynamoDB do not form one atomic transaction. Keep PL-08, CT-02/03, FC-10 and IR-02 open until their own evidence/decisions are complete. Existing PostgreSQL ADRs remain historical pending explicit reconciliation.

This records the chosen storage/write direction, not completed schemas, passed integrity tests, provisioning, or approval of the whole architecture.

## ARC-03: Python durable workflow orchestration

The owner selected option B: **Lambda Durable Functions with Python workflows**. This is the primary orchestration direction and supersedes the maker's original Step Functions Standard recommendation. A later Step Functions exception needs its own requirement, cost and owner decision.

SQS remains responsible for buffering/backpressure and EventBridge Scheduler for timed triggers. DynamoDB business/approval/audit records remain authoritative for product state; durable checkpoints and execution history do not replace long-term business evidence. Keep external I/O in controlled steps and reconcile ambiguous paid calls or started training jobs instead of blindly repeating them after a crash.

Before build, prove runtime/container/SDK and regional compatibility; step naming/versioning and deterministic replay; owner approval expiry/version binding; idempotency beyond provider token windows; retries, cancellation, leases and cross-environment replay denial; redacted history retention, async API handoff, telemetry and complete cost. The existing Python 3.12 starter is not certified by this direction, but OCI support means it is not rejected solely from a managed-runtime table. No SDK, runtime or application code is changed now.

Primary documentation checked on 2 November 2026: [durable execution](https://docs.aws.amazon.com/lambda/latest/dg/durable-functions.html) and [runtime/OCI support](https://docs.aws.amazon.com/lambda/latest/dg/durable-supported-runtimes.html). The records and gaps PL-05/06 and CT-02/14 remain open until their contracts and evidence are complete.

## ARC-04: selective SageMaker training and portable forecast inference

The owner selected option A: **Selective SageMaker training + portable Lambda inference.** Use capped on-demand CPU jobs for candidate training/evaluation, approved versioned artefacts in S3 and Lambda inference only where the model/runtime/resource fit is demonstrated. Store formal daily forecast results for clients to read; do not train or refit on each app request. No always-on inference endpoint is assumed.

Lambda Durable Functions with Python coordinates job submission, completion, evaluation, shadow evidence and owner approvals. It must reconcile job identity after interruption/replay. Claude models remain hosted on Anthropic, under the separately bounded research loop.

Exact model families/tasks/horizon artefacts, job/training caps and cadence, dependency/serialisation safety, resource limits, region, serving latency, cancellation, restore and complete dev/prod cost remain open. If a model cannot fit the Lambda envelope, present a costed serving alternative for a separate owner decision. Keep PL-07 and FC-05/09 open until their own specifications and evidence pass. Model promotion still requires owner approval; selecting an execution service does not establish predictive quality or authorise a paid job.

## ARC-03 reaffirmation after FastAPI/hybrid clarification

The owner reaffirmed **Keep Durable Functions primary** on 2 November 2026. FastAPI runs on ordinary API Lambdas; Python Durable Functions runs background workflows. Step Functions is not included in the initial direction. A later ML-specific hybrid requires a demonstrated benefit, ownership/integration/cost evidence and another owner decision. This does not change the four selected direction cards or satisfy their open proof gates. ARC-05 was subsequently selected below; next is now detailed baseline completion.

## ARC-05: baselines first, then bounded challengers

The owner selected option A: **Baselines first, then bounded challengers.** First freeze task/horizon, source-known-at and outcome contracts. Establish transparent rules/statistical/simple numerical benchmarks, then compare bounded stronger candidates and individually justified news, pattern, analog/event and LLM-derived factors. Preserve every agreed horizon and F1–F8 capability; this is qualification sequencing, not feature removal.

The evidence ladder remains rules/statistics, numerical ML, then separately evaluated structured LLM/news/pattern factors. Training/evaluation must remain chronological with horizon-aware overlap controls, training-fold-only transformations, untouched candidate evaluation, bounded predeclared experiment/search limits, calibration/coverage/subgroup evidence and baseline/ablation comparisons. Retrospective LLM extraction needs contamination controls or prospective evidence. Rules/XIRR, calibrated forecasts and long-range scenarios retain distinct meanings.

Mature outcomes and shadow evidence are required; refreshing daily does not mature a 12-month outcome. Owner approval precedes promotion. Exact candidate catalogue, formulas, fold schedules, search caps, sample/uncertainty/eligibility/abstention criteria and rollback authority still need specifications; associated FC/CT gaps stay open. No accuracy guarantee, training job, paid call, automatic live recalibration or implementation is approved. (On 3 November 2026 the owner later chose bounded self-correction: automatic calibration and weighting adjustments inside owner-approved bands only; see the owner answers on event and analog research below.)

## ARC-06: separate Claude task workers with a shared runner library

The owner selected option B: **Separate Lambda workers for each task route.** Each evaluated Claude route gets an independently deployable Lambda worker with its own execution permissions and route-specific queue, context/tool, concurrency/retry and evaluation policy. All reuse a versioned typed Anthropic client-SDK runner library for common grounding, schema validation, cost reservations/reconciliation, redaction, cache and batch controls. This supersedes the maker consolidation recommendation.

Lambda runs the client loop; Claude model inference remains on Anthropic. The task catalogue may cover portfolio analysis, forecast explanation, source research and long-term thesis, but exact worker/route/model counts are not fixed by this choice. Deterministic analyst/grader/budget/operations responsibilities do not automatically become LLM calls.

Untrusted-file extraction remains isolated and tool-free; public research and private portfolio context have explicit outbound boundaries. Memory is scoped, sourced and revisable and cannot become financial truth or policy. Cache eligibility/economics and nonurgent batch deadlines/privacy must be measured. Immediate alerts and fresh briefings cannot depend on a just-submitted batch.

Separate workers share one project budget and the actual provider allowances; each worker does not gain a separate credit pool. Global cost admission/rate coordination must prevent parallel overspend. Agents have no direct financial commit or model-promotion authority. Exact IAM/queue design, manifest, model IDs, limits, memory retention, eval coverage and full operating cost remain open. No deployment, paid call or complete architecture approval is implied.

## ARC-07: Cognito authentication assurance and freshness

The owner selected option A: **Cognito assurance and freshness checks**. The backend evaluates authentication strength/freshness for each sensitive action and requests step-up when existing evidence is insufficient. If actual Cognito assurance support is unavailable, an explicitly verified fresh-sign-in path must meet the same action policy; protected actions fail closed if adequate proof cannot be obtained.

Retain managed Apple/Google/passkey sign-in, verified identity linking and the agreed recovery redundancy. Bind each approval to the exact owner/environment/action/payload/current record or configuration version/expiry. Recheck authority and applicability at execution, including after a durable wait. Local Face ID unlock, a refreshed token or an open app alone is not fresh server authorisation. Persist opaque evidence references, never live authentication tokens, in workflow/audit state.

Cognito tier/region/rollout and Apple/Google/passkey behaviour, pricing, sensitive-action classes, assurance/freshness policy, session/device revocation, lost-device recovery, cookie/CSRF and native PKCE/storage still need specification/proof. No exact time window or assurance level is approved by this direction. PL-09 and CT-01/02/17 remain open. No account/user-pool/client setup, purchase or application implementation is authorised.

## ARC-08: full admin journeys before first build

The owner selected option B: **Full admin journeys before first build.** Specify all identified admin policies/contracts and state semantics during architecture preparation; after architecture agreement, design the complete admin journeys within the end-to-end UX baseline before any application implementation. Implementation can be phased after the full baseline and UX are approved.

Include Files/Imports, Audit, Runs/Health, Agents/Models/Evals, Approvals/Configuration, Costs/Budgets, Incidents/Recovery and Identity/Devices. Cover normal investigation and comparison; approvals/rejections; source inspection/reprocessing/correction; configuration changes; cost reconciliation; stale/conflicting/expired/denied actions; failures, replay, restore/rollback and deletion. Cost monitoring remains directly accessible from the main app, not solely in admin.

Retain the renewable 24-month original archive with owner extension/deletion, operational logs 14 days/traces 30 days/run summaries 90 days and monthly/change-triggered exercises. Detailed record/provider/backup retention and deletion semantics, audit-integrity claims, recovery objectives, action/notification classes and replay/rollback authority remain open. This choice does not perform UX design, delete data, run recovery jobs, or approve the whole architecture/build. Associated CT/PL gaps stay open until their own decisions and evidence are complete.

## ARC-09: Inspect AI and typed deterministic agent evaluation

The owner selected option A: **Inspect AI + deterministic checks.** Use Inspect AI to organise tagged scenarios, replay/transcript records, deterministic and calibrated model scoring, rescoring and reports. MP supplies its own typed cases/adapters/scorers and versioned agent/tool manifests. Application policy code enforces runtime permissions, grounding and financial authority; pytest remains for unit/integration/offline tests. Chronological numerical ML validation remains separate.

Specify no-network T0, change-triggered bounded affected-route T1, model/release qualification T2, online code checks, budgeted sampled judges, held-out human calibration and permanent incident regression cases. Choose trials, thresholds, sample/uncertainty rules and judge eligibility from MP risk and cost evidence, not MA defaults. Missing evidence, failed runs or exhausted budget are incomplete, never green. Reuse stored outputs for rescoring only when inputs/semantics/privacy permit.

Exact harness/version, adapters, coverage, scoring/eligibility/abstention rules, retention/redaction, local/CI execution permissions, approved live-call spend and admin evidence remain open. Selecting the harness does not install it, run any evaluations, make model calls, authorise independent review or implement a feature. CT/FC/PL proof gaps remain open until their own specifications/evidence are complete.

## ARC-10: static SvelteKit PWA and authenticated FastAPI

The owner selected option A: **Static SvelteKit PWA + authenticated FastAPI.** Serve prebuilt interactive shell/assets through CloudFront from a private S3 origin. Fetch private data and submit commands through authenticated FastAPI on ordinary API Lambdas; there is no separate SvelteKit SSR runtime in the selected direction. Keep financial records and secrets out of the public build. Origin access control protects S3, while Cognito and API authorisation protect owner data/actions.

Retain adaptive web, native Swift/SwiftUI within RN, shared typed API/event/action/error/proof contracts, live updates and bounded SSE. The architecture Site is a documentation artifact, not the product PWA. Static hosting does not prove private-cache behaviour or fast startup; measure first paint/interactive budgets, choose suitable non-sensitive prerendering and specify loading/stale/unauthorised/offline states.

Session/cookie/CSRF/native PKCE boundaries, cache/service-worker privacy and logout clearing, reconnect/expiry/replay, app updates/push, bridge/device/Duo compatibility and accessibility remain open. This choice starts no UI implementation, hosting setup, runtime installation or cloud deployment and does not approve the complete baseline.

## ARC-11: separate dev and production AWS workload accounts

The owner selected option B: **Separate dev/prod AWS accounts** under consolidated billing. Keep environment-specific resources, identities, deployment roles and write authority. Development agents, synthetic imports, tests and CI must not have routine production write access. Central MP cost visibility uses scoped account/resource attribution and read-only collection rather than broad operational authority. Actual account identities and any existing management account remain to inspect only when separately authorised.

The £100 monthly all-in cash ceiling remains one combined MP envelope across dev/prod AWS, data and Claude/evaluations: £70 planned operation plus £30 reserve. Organizations itself has no additional service fee; actual services, duplication, builds, telemetry, backups and collectors are still billed. Do not multiply AWS free-tier benefits or provider credit pools by account/environment. Account separation does not create a universal instant spend cap.

Choose the cheapest suitable region only after confirming selected service/runtime availability, supported networking and actual complete prices. Exact account/organisation/roles, OIDC/IaC promotion, N0/N1/N1-E network choices, runtime/SDK/adapter matrix, quotas, recovery and cost/stress evidence remain open. No account creation, billing/organisation change, secret work, provisioning, paid call or full architecture approval follows from this selection.

## ARC-12: architecture areas linked to phases and stories

The owner selected option A: **Architecture-area specs + linked phases/stories.** Keep one system map, central architecture-area specifications/technical journeys and shared decision/contract registers. Link one page per stable MP phase and individual Jira stories to source concepts, requirements, producer/consumer contracts, positive/negative acceptance tests and later UX states. MA supplies structural precedent, not approved MP design or architecture choices.

All twelve broad direction cards now have answers. The complete architecture baseline is still unapproved: detailed contract/evidence gaps, story decomposition/readiness, source visual verification, exact formulas/security/recovery/runtime/region/network/cost and optional scope decisions remain open. Complete and present the exact architecture/plan revision for owner sign-off before UX; complete full end-to-end/admin UX and obtain explicit permission before implementation. Nothing here publishes pages, creates a PR, runs review, closes issues or starts UX/build/cloud work.

## Owner answers after the MP-10 source-rights research (2 November 2026)

The owner answered the decision card in [the MP-10 findings](../source-rights-2026-11-02/README.md):

- **ARC-01 is confirmed as selected:** Yahoo Finance and Twelve Data Grow, with Twelve Data's free Basic tier for
  development. MP is the owner's personal hobby use, not commercial. The owner accepts the risk the research
  recorded: on published terms, Yahoo forbids automated collection and Twelve Data labels Grow view-only. The Grow
  tier was settled later the same day as Grow 55 (below).
- **No vendor is contacted.** The drafted questions to Twelve Data, EODHD and AMFI stay unsent, and the rights matrix
  keeps those uses unresolved.
- **The Apple Developer Program fee** ($99 a membership year) is allowed one exception month a year above the £100
  ceiling, for this fee only. Every other month stays inside the ceiling and the £60/£75/£85 thresholds.
- **Region: Virginia (us-east-1)**, the cheapest of the three candidates in the cost model. AWS-held data and
  same-Region backups sit in the US; Anthropic processes prompts in the US or globally whatever the Region. MP-29
  takes the Region forward with the network, accounts and IaC choices.

**Later the same day, the Grow tier:** Twelve Data **Grow 55** ($29 a month, about £27.84), with Yahoo Finance kept
alongside it. Yahoo supplies the delayed intraday UK and India prices and a second source to cross-check, which Grow
55 does not (Grow is end-of-day on LSE, NSE and BSE). Pro 610 ($99) was compared and not chosen: it breaks £100
every month.

These answers settle the questions asked. They do not approve the complete architecture baseline, UX or
implementation.

## Owner answers for MP-29 (3 November 2026)

The owner answered the questions in [the MP-29 pack](../region-network-2026-11-03/README.md):

- **IaC: Terraform only**, from day one. Every AWS change, from the first resource, goes through Terraform. For MP this
  overrides the owner's general preference for CDK or CloudFormation.
- **Secrets:** SSM Parameter Store SecureString.
- **Guard rails:** AWS Organizations with all features, and the cost-guard SCP. That SCP denies NAT, interface endpoints,
  VPNs, load balancers, SageMaker endpoints and GPUs until an ADR lifts it. The Region allowlist SCP and the resource
  control policies are not adopted.
- **Domain:** the owner's existing domain, mypaisapp.com, renewed outside MP, so the cost model's domain line comes out.
- **Network: N0.** No VPC for any Lambda; SageMaker training runs with network isolation; no NAT, interface endpoint,
  proxy or VPN. The optional lockdown is decided at PH-08.
- **Cost collector:** a read-only Cost Explorer role in the management account, assumed by the prod collector.
- **Claude inference:** global, at the standard price.

These answers do not approve an apply, an account or any spending.

## Owner answers on event and analog research (3 November 2026)

Asked while adopting the Market Agent explainer (MP-37):

- **Event kinds in the first event wave: all of them.** Rate surprises, inflation surprises, tariffs, conflict,
  earnings, OPEC+ decisions and elections, for the US, UK and India. Each event is dated by when it became known, each
  kind qualifies on its own evidence before it informs a forecast, and each source's rights are checked. This replaces
  the foundation forecasting specification's proposal that scheduled earnings come first.
- **Similar-days history: since 2015, about ten years.** This replaces the specification's proposed 756-session
  lookback. Where a listing's history is shorter, the search uses what there is and says so.

- **Self-correction: bounded.** Code, never a Claude agent, grades every matured forecast daily and applies small
  calibration and weighting adjustments by itself, inside bands the owner approves in advance, with automatic rollback
  if scores worsen. New models, new features, new rules and anything outside a band still need the owner's approval, and
  the automatic safety pause (POLICY-003) stays. The band sizes are open until the owner approves them before go-live.
  Research agents still cannot change model weights (AGENTS.md); the calibrator is deterministic code.

The foundation forecasting specification is hash-pinned as reviewed evidence, so it takes these answers on at the MP-20
consolidation rather than being edited in place. These answers do not change the qualification order (ARC-05) or approve
any data source.

Read [direction summary](direction-summary.md) and [baseline completion plan](baseline-completion-plan.md) for the consolidated choices and remaining work.
