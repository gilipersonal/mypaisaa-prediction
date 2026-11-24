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

Session/cookie/CSRF/native PKCE boundaries, cache/service-worker privacy and logout clearing, reconnect/expiry/replay, app updates/push, bridge/device/Duo compatibility and accessibility remain open. (Duo answered 5 November 2026, MP-184: "Any window width", MP40-Q12b; the devices: "Your own devices only", MP40-Q12a. See the question pack below.) This choice starts no UI implementation, hosting setup, runtime installation or cloud deployment and does not approve the complete baseline.

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
  control policies are not adopted. (5 November 2026, MP-184: the owner picked "Add all three" for MP-29's three further
  policies, MP40-Q4. See the question pack below.)
- **Domain:** the owner's existing domain, mypaisapp.com, renewed outside MP, so the cost model's domain line comes out.
- **Network: N0.** No VPC for any Lambda; SageMaker training runs with network isolation; no NAT, interface endpoint,
  proxy or VPN. The optional lockdown is decided at PH-08. (5 November 2026, MP-184: for launch the owner picked "Stay
  with no private network", MP40-Q7. See the question pack below.)
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

- **Owner requirement: holdings plus the top 5 per market segment.** The apps show the owner's holdings and, for each
  market segment, the five highest-ranked listings, ranked by MP's combined score (growth 35, protection 40,
  opportunity 25, ranked only when all three are eligible). They come with their ranges and uncertainty, as decision
  support, not advice. Proposed segments: US large caps, US tech (Nasdaq-100), UK FTSE 100, UK mid caps (FTSE 250),
  India Nifty 50, India mid caps and ETFs. Open: the exact segments, the size of the discovery universe scanned on
  end-of-day data, and its effect on data credits and cost. The screens themselves wait for UX design after the
  architecture sign-off.

The foundation forecasting specification is hash-pinned as reviewed evidence, so it takes these answers on at the MP-20
consolidation rather than being edited in place. These answers do not change the qualification order (ARC-05) or approve
any data source.

## Owner answers in the 3 November 2026 decision round (MP-39)

1. **Top-5 segments:** US large caps and US tech; India Nifty 50 and midcap; ETFs (US, UK and India); and commodities
   (gold and silver, quoted as XAU/USD and XAG/USD). There is no UK FTSE top-5 segment; UK holdings are still covered.
2. **Adding markets, segments and watch-only listings from chat:** Claude proposes; code checks coverage with the data
   provider (Twelve Data or Yahoo) and the credit cost; the owner taps confirm in the app before anything is added. A
   watch-only listing is tracked and forecast without being held.
3. **Discovery universe:** a curated list of about 150 names, scanned on end-of-day data.
4. **Bounded self-correction limits:** moderate. A forecast's probabilities may shift at most 5 percentage points a
   week, and how much a signal counts may change at most 10% a month. Anything larger waits for the owner, and an
   adjustment rolls back automatically if scores worsen.
5. **Live trial:** 8 weeks in shadow, beating both the base rate and the rules, before a model can be promoted with
   the owner's yes.
6. **A slipping promoted model:** reverts by itself to the previous approved model and notifies the owner; switching
   forward again needs the owner's yes.
7. **Production releases:** a release workflow only the owner can start (GitHub Free). This settles PL-11's release
   route. **Superseded on 24 November 2026 by MP203-08** ("An environment replaces route A", MP-203): a merge to main
   starts the release, which waits in the GitHub production environment for the owner's approval. Route A is kept here as
   history, chosen 3 November 2026 and replaced 24 November 2026.
8. **UK fund prices:** test Grow 55 by API in its first month; if they are not covered, value UK funds from the
   owner's statements.
9. **Indian funds:** the owner supplies the holdings statements; all other market data comes from Twelve Data.
10. **Apple:** no paid Apple Developer Program for now; the owner will say when. The iPhone and iPad app runs as free
    local builds that expire after seven days. Free builds cannot use Apple push notifications, TestFlight or Sign in
    with Apple, so phone notifications come through the web app's Web Push until then.
11. **The rules-versus-models contribution split:** shown live from launch, labelled experimental.
12. **Yahoo stays for India too:** delayed intraday prices for the 30-minute checks and a cross-check, beside Twelve
    Data's end-of-day prices.
13. **The live trial for long horizons:** the 8 weeks check that a model runs cleanly and is calibrated on what has
    matured; years of walk-forward history carry the accuracy evidence for the 3, 6 and 12-month horizons. The owner
    still approves.
14. **What counts as slipping:** the live model scores worse than the previous approved one for 4 weeks running, on
    matured forecasts. That triggers the automatic revert.
15. **Restart after a pause:** reverting to the previous approved model is automatic; restarting a paused forecast or
    switching forward still needs the owner's yes (POLICY-003 stands).
16. **A week that cannot be scored** (a data outage, a holiday week) pauses the 8-week trial count; the trial still
    needs 8 scored weeks.
17. **Rules changes** (indicators, pillars, thresholds) need the same 8-week shadow trial, beating the current rules,
    before the owner approves them.
18. **Probation:** a newly promoted model is on probation for its first 4 live weeks and reverts after 2 bad weeks
    instead of 4.
19. **The ~150-name scan** may add up to £5 a month (Claude explanations for the top-5 names, batched where possible).
20. **An F7 contribution policy** is shown live, labelled experimental, only after it beats simple rules for 8 weeks in
    replay and shadow, and with the owner's yes.
21. **The MP-20 consolidation** runs as one pass with one sign-off, and an independent review round 1 runs before the
    owner signs.

## Owner sign-off of the baseline and three cost answers (3 November 2026, MP-20)

Asked in Claude after review round 2, with the sign-off pack at commit
`98ba348e6af6c8c1f716e521660287887fe909aa` ([sign-off pack](../baseline-signoff-2026-11-03/README.md)):

1. **Sign-off:** "Yes, I sign off (Recommended)". This approves the baseline's structure, the twelve directions as
   refined by the owner's later answers, the precedence order and the phase-to-story map, exactly as the pack at that
   commit states them. Its open items stay open, UX starts only after every story meets the readiness protocol, and
   build needs the complete UX and its own permission. The owner chose to skip a third review round ("Skip to
   sign-off"), so round 2's fixes were not reviewed by a fresh reviewer.
2. **COST-Q1, where the top-5 scan sits:** "Raise Claude to £15 (Recommended)". The £70 plan becomes market data £30,
   AWS £22, Claude and evaluations £15, forecast and price uncertainty £3; a scan overrun stops at the Claude cap.
3. **COST-Q2, the $1.50 of AWS build minutes:** "Keep it", as a small margin in case some builds run in AWS CodeBuild.
4. **COST-Q4, optional work in the Apple fee month:** "Judge the month without the fee (Recommended)". If the owner
   ever buys the Developer Program, optional work runs while the rest of that month stays under £60, £75 and £85; the
   fee is the one allowed exception.

## Owner answers on next steps (3 November 2026, MP-20)

1. **DATA-DEC-12, provider values in Claude prompts:** "Derived values only (Recommended)". Claude sees returns,
   ranges, scores and the fewest raw prices a route needs; never bulk raw feeds from Twelve Data or Yahoo.
2. **SCI-D09, the ETF top 5:** "One list per market (Recommended)". A top 5 for US ETFs, one for UK ETFs and one for
   India ETFs, fairer across currencies and sessions.
3. **The next piece of work after MP-20:** "Story readiness (Recommended)". The 64 story drafts become Jira stories
   under PH-00 to PH-09, each with positive and negative acceptance, contracts, a state inventory and dependencies:
   the last gate before UX.

## Owner answers that unblock the UX design (3 November 2026, MP-177)

1. **MP40-Q14, the home screen order:** "Holdings first (Recommended)". The owner's holdings with their ranges come
   first, with the top 5 per segment below. This replaces ARCHITECTURE.md's "market discovery first, holdings a tap
   away".
2. **MP40-Q3, the accessibility standard:** "WCAG 2.2 AA (Recommended)", for web, iPhone and iPad, checked by axe on
   the web and Xcode's accessibility audit on Apple.
3. **SCI-D09, the top-5 ranking horizon:** "3 to 12 months (Recommended)". Growth and protection come from the 3, 6
   and 12-month forecasts; short horizons feed only the opportunity part.
4. **SCI-D09, refresh and US tech:** "Daily, Nasdaq-100 tech (Recommended)". The lists are re-ranked after each daily
   forecast run, and US tech means the technology names in the Nasdaq-100.
5. **The two readings that close SCI-D09:** "Yes, keep both (Recommended)". A Nasdaq-100 name counts as technology by
   the industry classification recorded with each versioned membership snapshot, and how growth and protection
   blend the 3, 6 and 12-month forecasts is settled under FIN-OD-07 (normalisation).

## 4 November 2026: both options, with a flip (MP-178)

The owner, on the two options drawn for each journey (MP-62): "Can I have both A and B implemented , user should have an option to
flip it for more engaging experience." Asked which journeys should flip: "Flip all eight". The maker had recommended flipping three, and
said what a flip costs: each flipped journey means both layouts are built and kept up to date in every state. So MP-62's "the owner picks
one per journey" becomes both options kept on all eight journeys. UX approval (MP-66) and permission to build still come first.

The owner's answers on how the flip behaves, 4 November 2026: "A, kept per device (Recommended)": each journey starts in A, keeps the choice on that device and flips on its own. "Keep the strict rule (Recommended)": no flip while
signed out, during a step-up, behind an open sheet, or on a proposal, an approval or a record being written. "Yes, one side may show more (Recommended)": the figures both sides show stay the same, and one side may show more.

## Admin journeys: the owner's picks and answers, 4 November 2026 (MP-64)

Asked one by one, with the options on screen. Picks: Admin home "B Nine places". Files and imports "A Status queue (Recommended)". Audit "B Explorer". Runs and health "A Tonight's clock (Recommended)". Agents "A Roster (Recommended)". Models and evaluations "A Pipeline (Recommended)". Approvals and configuration "A Settings by version (Recommended)". Costs and budgets "A Side by side (Recommended)". Incidents and recovery "A Incident timeline (Recommended)". Identity and devices "A Paths first (Recommended)".

CT-16, where admin lives: "Under Settings, phones read only". Asked whether a phone may still run recovery when other devices are gone: "Yes, recovery only (Recommended)". Budget changes: "In admin, under Settings (Recommended)". Number of journeys: "Keep nine (Recommended)", so Agents is its own journey. The owner accepted Admin home and action A51, Refuse a proposal. These picks are not UX approval (MP-66) and not permission to build.

iPhone passkey against MP-164: "I'll join the Developer Program". Nothing is bought and no date is set, so the records that say the programme is not bought stay true. MP-164 says "until the owner says to join the Developer Program"; asked what lifts the bar: "The purchase (Recommended)". May a phone acknowledge an incident: "Yes, acknowledge only (Recommended)". Does recovery on a phone also cover replay, restore and pause: "Account recovery only (Recommended)". Does one scope's lapsed approval hold a whole promotion: "Only that scope waits (Recommended)", so the owner Approvals journey changes to match. The 2 November sale behind a refused reversal: "Keep it, illustrative (Recommended)"; Holdings gets the same sale when it is next opened. MP-164 and Confluence PH-07 synced from the repo: "Sync both (Recommended)", and the same for MP-163. Withdrawing paid use while the billing collector has failed: "Allow it (Recommended)". The $99 fee already has its exception month. MP-179 tracks it.

The owner's question pack, 5 November 2026 (MP-184): 64 open questions answered. 23 were pressed on the page, and 41 by the owner's words in chat, "for the remaining pick up recommended options", so those carry the Recommended option. 61 are the Recommended option; the owner chose otherwise on: MP40-Q12c, "Both keep the five"; MP40-Q2, "Local unlock step"; OWN-35, "Code may draft one". Each answer is in [the pack's answers](../owner-question-pack-2026-11-05/answers.json), and what each changes is in [its scope](../owner-question-pack-2026-11-05/scope.md). A pick's option text is not the owner's own reasoning (lesson 42), and none is applied yet.

On the question those picks left open, whether daily forecasts may spend inside the £15 kept above £85, the owner answered "Yes, add them", 5 November 2026. The list of what the £15 covers now also holds daily forecasts, and that too is not applied yet.

Applied to the written records on 24 November 2026 (MP-192): the story pack (55 stories, and the 12 questions MP40-Q1, Q2 and Q4 to Q13 marked answered), the foundation specifications' open decisions (SCI-D07, SCI-D08 and FIN-OD-04 now partly answered; SCI-D03, SCI-D06, FIN-OD-03 and FIN-OD-07 record the picks and keep what stays open), the gap register, the root documents and the Confluence generator. A pick that chooses a rule and leaves a value open (the price grace, the reconciliation limit, the alert lines, the upload limits, the offline time-out, the fresh sign-in and revocation times, a replay's wait) is recorded with the value still open. The daily forecasts inside the £15 are recorded too. The screens' open lists and Proposed labels are not part of this change, and Jira descriptions and Confluence pages follow only with the owner's yes for each.

## 24 November 2026: the whole UX approved with named conditions (MP-66, MP-180, MP-193)

Asked four questions on one card, the owner pressed:

- MP-180, the device check: "Accept without checking". The option read: "You accept the designs without a device check; I record that in your words and it stays an open item." So the iPhone check at 20% brightness and the VoiceOver pass on iPhone and iPad are not done, and stay open. The maker's half of MP-180 passed: the Journeys long frame is fixed (0 ms against 55 to 64 ms on Chrome at 4x CPU) and a keyboard-only pass reached every control on both pages.
- MP-66, the UX: "Approve, with conditions (Recommended)". The option read: "Approved with named conditions: every open item stays labelled and decided later." The question named Prism, Journeys and Prism Admin at their recorded hashes, with the open items in the MP-66 record still labelled and the owner's to decide. The record, with the option kept on each journey, every open item and who decides it, is `docs/design/reviews/MP-66/README.md`.
- MP-193, its three proposals: "Accept all three (Recommended)". The option read: "Each Proposed · MP-193 label becomes settled with your words." So: every condition that stops a write keeps stopping it, whichever banner shows first; Approve waits while amounts are hidden, and Refuse stays open; every drawn control is marked as working, an illustration or not allowed here, with Mark what works off by default.
- Permission to build: "Keep the four steps (Recommended)". The option read: "Finish step 3 (read-only screens) and step 4 (local read API) on synthetic data, then decide again." The permission of 24 November stands as it was: no new phase starts, and the phase-story baseline's `implementation_authorised` flags stay false.

Applied the same day: the design pages' status words now read "UX approved with conditions · MP-66" where they read "Proposed" and "Not approved UX"; the combined-conditions rule and the hidden-amounts hold read Settled · MP-66. A pick's option text is not the owner's own reasoning (lesson 42). UX approval is not permission to build, to apply Terraform or to spend.

## 24 November 2026: the build starts in small steps, before whole-product UX approval (MP-66, MP-134)

The owner, 24 November 2026, after hearing that the web and phone folders were empty and that building waits on UX approval and a separate permission to build: "I want to get the build started, taking baby steps start with the easy screens and login, we can always revisit... Phasewise tell me what to start". Offered a four-step plan and asked "Record your words under MP-66 and start step 1?", the owner pressed "Yes, record and start".

What this permits, as the plan the owner said yes to put it: four steps, each its own branch and pull request. Step 1 is the web app shell (MP-134): a static SvelteKit app in `web/` built on Prism, with the sidebar, the phone's tab bar and placeholder pages over a fake data layer. Step 2 is the sign-in screens (MP-73) against a pretend sign-in service shaped like Cognito's. Step 3 is the screens that only show data: Home with the cost pill (MP-153, MP-100), Holdings and one holding (MP-84, the viewing part), Settings and privacy, and the decision journal (MP-158, viewing only). Step 4 is FastAPI read routes under `/api/v1` over the sample portfolio (MP-76, MP-83), run locally. Every step runs locally on synthetic data: no AWS resource, Terraform apply, paid call, real document or real holding.

What it does not settle. The owner has not approved the whole-product UX in words: MP-66's UX approval stays open, and the owner accepted the rework the open design work may bring ("we can always revisit"). Still open at this start: MP-193 (the audit's dead controls and combined states), MP-180 (a real phone at 20% brightness, assistive technology, the Journeys long frame) and MP-183 (the burn-up chart's labels on phones). Real Cognito sign-in needs MP-71 and MP-197, each with its own yes. Imports and approvals that change data, forecasts, the admin screens and the Apple apps are not part of this permission. The phase-story baseline's `implementation_authorised` flags are unchanged: this permission names slices of stories, not whole stories, and the plan pack changes only through `mp-plan-sync` with its own yes.

## 24 November 2026: the read-only screens follow their design to the measure, and Tap to show is A (MP-205)

The owner, 24 November 2026, showing the design's Track record beside the built Journal: "follow design pixel by pixel, everything should be byte identical in terms of measurement and everything". The build now draws with the design's own stylesheet, in the design's frame, and `web/scripts/design-parity.mjs` measures every built screen against its design screen, element by element, on desktop and phone web, in six states and both themes; it runs in the web gate. The one part measured without is the flip to option B, a later slice (MP-178). Track record option A (picked under MP-187) is built with the read-only screens.

The measure found the privacy centre's "Tap to show for 30 seconds." with nothing behind it. Asked "How should the 'Tap to show for 30 seconds' gap close?", the owner pressed "Design tap-to-show". Two options were drawn as the Tap to show journey (`docs/design/journeys/src/journeys/peek.js`, `docs/design/reviews/MP-205/README.md`). Asked "Which tap-to-show option should the app follow?", the owner pressed "A, whole screen". The option read: a tap on any masked amount shows every amount on the screen for 30 seconds, the cost pill included; where the screen has the eye it becomes Hide now with the seconds left; the amounts hide again after 30 seconds, on Hide now, on leaving the screen, or when the app goes to the background; privacy mode stays on and nothing is stored. A pick's option text is not the owner's own reasoning (lesson 42). Option B, one figure, stays drawn, labelled not picked.

## 24 November 2026: the questions the 5 November picks left open (MP-203)

Round 2 of the owner's question pack, on the same page as round 1: eleven questions MP-192 and MP-199 left open. Nine were pressed on the page; MP203-02 and MP203-03 were picked on a question card in chat. Nine are the Recommended option; the owner chose otherwise on MP203-07, "Widen three existing stories", and MP203-08, "An environment replaces route A". Each answer and what its option read is in [round 2's answers](../owner-question-pack-2026-11-24/answers.json). A pick's option text is not the owner's own reasoning (lesson 42). All eleven are applied to the written records (below).

- MP203-01 (OWN-37), "Same rule, same time": a browser's saved copy clears on its next connection and stops showing after the same time-out as the Apple app.
- MP203-02 (MP40-Q11a), "Never for investment alerts": an approved quiet-hour exception can only be a critical security or service fault.
- MP203-03 (MP40-Q11a), "A short named list": the option read "Proposed: a sign-in, passkey or recovery you did not start; a device revoke that fails; production lost (ADM-05); and a failed backup or ledger write", so critical means a short named list and the four faults on it are proposed.
- MP203-04 (OWN-27), "Pairs when there are any": a 3-month model on probation is judged on any pairs that mature in its 4 weeks, and checked for clean running.
- MP203-05 (ADM-09), "Once, as a standing rule": for range tasks the strongest simple range baseline stands in for the rules by one approval; the owner still approves every promotion.
- MP203-06 (OWN-33), "Confirm: no hurdle, no interval": the 2% hurdle and the 95% interval stay in the walk-forward test only.
- MP203-07, "Widen three existing stories": MP-47 gains the local unlock step, MP-107 the factsheet reader and MP-163 the widget and share-sheet builds.
- MP203-08 (MP-199), "An environment replaces route A": a merge to main starts the release, which waits in the production environment for the owner's approval. This replaces the 3 November route A (item 7 above).
- MP203-09 (MP40-Q10), "All seven, gaps shown": a kind no checked source covers shows as no source yet.
- MP203-10 (OWN-26), "The provider's bar days": each day the provider publishes a daily bar is a gold and silver valuation day.
- MP203-11 (MP-199), "Build and unit tests in CI": pull requests that touch the Apple app build it and run XCTest on a free macOS runner; Maestro journeys and real-device builds stay on the owner's Mac.

MP40-Q7 was not asked again: it was asked "At PH-08, keep N0 (no VPC) or take a lockdown step", and PH-08 is the launch phase.

Applied to the written records on 24 November 2026 (MP-203): the root documents, the AWS rule (`.claude/rules/aws-changes.md`: the prod apply and deploy rows name the GitHub production environment), this log (item 7 above), the decision cards, the gap register (PL-11, CT-18 and the other rows each answer settles), the phase pages and the phase-story baseline, the owner decisions, the direction summary, the MP-10 recheck and the Confluence generator, with its pages regenerated locally and not published. Each answer is recorded in one sentence form, copied word for word: "MP203-NN, 24 November 2026 (MP-203): the owner picked ... The option read: ...". MP203-07 keeps the baseline at 136 stories. Proposed, not the owner's words: the prod role trusts only the production environment, checked against GitHub's documentation before build. Administrators can bypass environment rules by default (recorded 24 November 2026). The Lucid drawings and the motion GIFs still state route A until the owner approves their re-import and render, and Jira descriptions and Confluence pages follow only with the owner's yes for each.

## 23 November 2026: Twelve Data and Yahoo kept after a second look (MP-196)

The owner asked whether to use EODHD, its API and its MCP server, for all trade and market data, then what Twelve Data's Pro 610 plan with 500 WebSocket credits would allow. After the research the owner said: "ok lets stick to Twelve Data + YahooFinance combination", and asked for it to be recorded: "Yes, record it". ARC-01 stands as confirmed on 2 November: Yahoo Finance plus Twelve Data Grow 55 for production, and Basic for development. Nothing is bought, no vendor is contacted, and no cost figure changes.

What the second look found, 23 November 2026:

1. **EODHD lists no Indian exchange.** Its live exchange list, read with the owner's free key, and its public [exchange list](https://eodhd.com/list-of-stock-markets) name neither NSE nor BSE. Its ticker list returns "Exchange Not Found" for NSE while it works for a small exchange on the same key, so this is not a free-plan limit. It has no Indian mutual fund NAVs either. For the other markets it is strong, and its personal-use terms allow storing the data and keeping derived outputs; the plan that adds events and fundamentals, All-In-One, is £99.99 a month.
2. **Twelve Data Pro 610 does not fit.** It is $99 a month, about £95.04 counted as the cost model counts Grow 55, so every month breaks the £100 ceiling. On Pro, NSE, BSE and the LSE are still end of day, and the pricing table still labels Pro "internal display" access, as it does Grow.
3. **Yahoo's own table** ([exchanges and data providers](https://help.yahoo.com/kb/finance-for-web/sln2310.html)) lists NSE (.NS) as real-time, BSE (.BO) as 15 minutes and the LSE (.L) as 20 minutes, all from ICE Data Services, for its own site. What its unofficial feed returns to a server is not proven; the 30-minute checks need neither.

Read [direction summary](direction-summary.md) and [baseline completion plan](baseline-completion-plan.md) for the consolidated choices and remaining work.
