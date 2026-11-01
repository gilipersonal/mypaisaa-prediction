export const LINKS = {
  hub: "https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/4981438",
  architecture:
    "https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5014267",
  imports:
    "https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/4981454",
  phases:
    "https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5014255",
  stack:
    "https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5014301",
  lucid:
    "https://lucid.app/lucidchart/02218133-613a-4b78-aea4-e0dba26db386/edit",
  repo: "https://github.com/gilipersonal/mypaisaa-prediction",
};

export const NODES = [
  {
    id: "clients",
    name: "Your screens",
    tech: "SvelteKit · SwiftUI / RN",
    group: "experience",
    x: 128,
    y: 95,
    plain: "One personal workspace, across the web and Apple devices.",
    input:
      "Owner interactions, approved local cache and authenticated responses.",
    output:
      "Versioned HTTPS commands/queries; resumable subscriptions. Swift owns native UI; the React Native shell owns navigation and typed bridges.",
    trust:
      "The client cannot hold provider secrets, approve its own authority or overwrite the server ledger.",
    failure:
      "Show offline/stale state; reconnect and fetch an authorised snapshot. Private cache and logout rules remain to be agreed.",
  },
  {
    id: "identity",
    name: "Prove it is you",
    tech: "Amazon Cognito",
    group: "platform",
    x: 368,
    y: 95,
    plain:
      "Apple, Google and passkeys open the same protected personal workspace.",
    input: "A verified sign-in and proof of control for account linking.",
    output:
      "Owner/session claims used by the API. Two independent passkey recovery paths are planned.",
    trust:
      "Matching email addresses do not prove the accounts belong together. Sensitive actions require server-verified authority.",
    failure:
      "Lost-device recovery, revocation, account linking and reauthentication must be tested before launch.",
  },
  {
    id: "edge",
    name: "The front door",
    tech: "Route 53 · CloudFront",
    group: "platform",
    x: 608,
    y: 95,
    plain: "A stable address delivers the web experience and routes requests.",
    input: "HTTPS requests from your browser or app.",
    output:
      "A proposed static SvelteKit shell from private S3; API requests route to the authenticated API path.",
    trust:
      "Private holdings must never be baked into a static build or shared cache. Static versus SSR is an open ADR.",
    failure:
      "Cache invalidation, TLS, headers, origin restrictions and API routing need explicit implementation evidence.",
  },
  {
    id: "api",
    name: "Check each request",
    tech: "API Gateway · FastAPI / Lambda",
    group: "platform",
    x: 848,
    y: 95,
    plain:
      "The application checks who you are, what you asked for and whether the work is allowed.",
    input:
      "Versioned commands, queries, approvals and a client request identity.",
    output:
      "Validated read models or a durable accepted-job reference. Planned /api/v1 contracts are separate from the starter health route.",
    trust:
      "Check owner, environment, schema, permission, idempotency and budget before work is admitted.",
    failure:
      "A retry must not create a second import, approval or paid call. Reject unauthorised and unbounded requests.",
  },
  {
    id: "live",
    name: "Follow the progress",
    tech: "Authenticated, bounded SSE",
    group: "experience",
    x: 1088,
    y: 95,
    plain:
      "The screen gets progress and chat updates without repeatedly asking.",
    input:
      "Durable event references, a scoped cursor and selected provisional chat deltas.",
    output:
      "Heartbeats and resumable event delivery. Expired cursors fall back to an authenticated snapshot.",
    trust:
      "SSE is a window onto work, not the job runner or the authoritative record. Do not put long-lived tokens in URLs.",
    failure:
      "Reconnect with backoff; the accepted job continues after a disconnect. The Python/REST streaming path needs a compatibility proof.",
  },
  {
    id: "imports",
    name: "Understand the files",
    tech: "Import pipeline · owner preview",
    group: "records",
    x: 128,
    y: 265,
    plain:
      "Statements become proposed records you can inspect before they affect your holdings.",
    input:
      "CSV, Excel, PDF, screenshots or manual entries, within explicitly supported layouts/templates.",
    output:
      "Matched real instrument IDs, extracted candidates, uncertainty and a proposed reconciliation preview.",
    trust:
      "Source text is untrusted. An LLM may propose an extraction; deterministic checks and your explicit confirmation gate the commit.",
    failure:
      "Quarantine rejected files, flag missing history or ambiguous matches and preserve the source for correction.",
  },
  {
    id: "evidence",
    name: "Keep the evidence",
    tech: "Private encrypted Amazon S3",
    group: "records",
    x: 368,
    y: 265,
    plain:
      "The original file stays linked to the records, factors and models it helped create.",
    input:
      "Approved originals, provider snapshots, extraction artefacts, feature datasets and model/evaluation files.",
    output:
      "Protected object references, versions and hashes; configurable owner-controlled archive policy.",
    trust:
      "Originals are not public. The 24-month renewable archive is a policy input, not permission to auto-delete. Provider retention is separate.",
    failure:
      "Deletion must address derived copies, versions and restore behaviour; monthly recovery exercises need agreed RPO/RTO.",
  },
  {
    id: "ledger",
    name: "Your financial record",
    tech: "DynamoDB preferred · fit gate open",
    group: "records",
    x: 608,
    y: 265,
    plain: "A consistent history of what you own and how you got there.",
    input:
      "Confirmed imports, manual events, corrections, cash flows and source/approval references.",
    output:
      "Versioned events and committed portfolio views. Staged imports become visible together under an agreed commit contract.",
    trust:
      "Corrections append a reversal/superseding event. They do not erase history. A relational alternative remains possible if the fit proof fails.",
    failure:
      "Detect duplicates and partial imports; reconcile totals, currency units and provenance. Precision and transaction limits need proof.",
  },
  {
    id: "jobs",
    name: "Keep work moving",
    tech: "Scheduler · durable workflow / queue",
    group: "platform",
    x: 848,
    y: 265,
    plain: "Slow work can finish safely even when you close the app.",
    input: "Durably admitted jobs, schedules, budgets and typed stage inputs.",
    output:
      "Retry-aware stages, checkpoints, completion records and outbox events.",
    trust:
      "Step Functions versus Lambda Durable Functions and the exact queue design remain open. Bound time, concurrency and retry cost.",
    failure:
      "Recover from timeout, ambiguous provider responses and repeated delivery; quarantine exhausted jobs and alert on age or backlog.",
  },
  {
    id: "outbox",
    name: "Record before delivery",
    tech: "Durable events · idempotency",
    group: "platform",
    x: 1088,
    y: 265,
    plain:
      "A finished action is recorded before the system tries to tell you about it.",
    input:
      "Committed import, forecast, chat or alert events with business/run identities.",
    output:
      "Replay-safe references for the screen, read models and notification workers.",
    trust:
      "The business commit and delivery intent need a consistent contract. Replaying an event must not replay a financial mutation.",
    failure:
      "Retry delivery with deduplication; reconcile unpublished events and failed notifications rather than claiming success.",
  },
  {
    id: "feeds",
    name: "Check the outside world",
    tech: "Yahoo Finance · Twelve Data Grow",
    group: "data",
    x: 128,
    y: 435,
    plain: "Market prices and history are checked before being used.",
    input:
      "Approved real listings, calendars, permitted price/history/FX data and source metadata.",
    output:
      "Canonical timestamped snapshots with provider, units, mapping, quality and freshness.",
    trust:
      "Coverage, tier/quota and personal-use rights remain unverified per listing. Future markets use the same versioned adapter contracts.",
    failure:
      "Where intraday evidence is insufficient, use labelled daily analysis and suppress unsupported intraday alerts. Ask before another paid source.",
  },
  {
    id: "rules",
    name: "Do the financial maths",
    tech: "Rules · XIRR · risk / FX",
    group: "science",
    x: 368,
    y: 435,
    plain: "Code calculates the numbers that research must be able to explain.",
    input:
      "Eligible ledger cash flows, price snapshots, FX, benchmarks and approved calculation policies.",
    output:
      "Supported performance, drawdown, exposure, growth/risk/opportunity scores and clear eligibility flags.",
    trust:
      "A language model does not invent balances or returns. Missing history can withhold XIRR; ambiguous roots require an explicit policy.",
    failure:
      "Keep local-currency detail beside the GBP view; flag stale/partial inputs, invalid totals or unsupported calculations.",
  },
  {
    id: "features",
    name: "Build point-in-time inputs",
    tech: "Versioned factors · training folds",
    group: "science",
    x: 608,
    y: 435,
    plain: "Every model sees only what could have been known at the time.",
    input:
      "Source snapshots, numerical features and structured, versioned LLM-derived factors.",
    output:
      "Dataset/feature hashes, cutoffs and fold-specific fitted transformations.",
    trust:
      "Fit imputation, scaling, feature selection and calibration within training folds. Revised data and future knowledge cannot leak backwards.",
    failure:
      "Refuse leakage and missing provenance; retain evidence of the actual universe, calendars and corporate-action assumptions.",
  },
  {
    id: "models",
    name: "Test before trusting",
    tech: "ML jobs · A/B execution open",
    group: "science",
    x: 848,
    y: 435,
    plain: "Challengers must earn their place against simple baselines.",
    input:
      "Versioned datasets, declared targets/horizons, purged chronological splits and experiment configuration.",
    output:
      "Walk-forward/ablation/calibration evidence, shadow results and an owner promotion request.",
    trust:
      "Portable jobs versus selective SageMaker training is unselected. No always-on endpoint is assumed; no automatic live promotion.",
    failure:
      "Fail poor or unstable candidates, compare benchmark/coverage/calibration and retain the approved previous model for rollback.",
  },
  {
    id: "forecasts",
    name: "Make a forecast accountable",
    tech: "Immutable predictions · mature outcomes",
    group: "science",
    x: 1088,
    y: 435,
    plain:
      "Record the forecast first. Judge it when its horizon has actually elapsed.",
    input:
      "The owner-approved model, data cutoff, horizon, calibrated probability/range and evidence.",
    output:
      "A preserved forecast version, eventual outcome and score, separated by backtest, shadow and prospective evidence.",
    trust:
      "Next-day, 5–20 trading-day and 3/6/12-month forecasts are distinct from 3–5-year scenarios. Never fabricate mature long-horizon outcomes.",
    failure:
      "Append corrections with links; show abstention and uncertainty instead of replacing the original forecast or overstating accuracy.",
  },
  {
    id: "claude",
    name: "Reason with Claude",
    tech: "Models hosted by Anthropic",
    group: "research",
    x: 128,
    y: 605,
    plain:
      "Claude helps extract, compare and explain evidence outside the AWS boundary.",
    input:
      "Minimised permitted context, a bounded prompt and declared tool schemas.",
    output:
      "Proposed tool requests, structured factors and cited explanations returned to your application.",
    trust:
      "The official Anthropic client SDK calls Anthropic directly. This is not Bedrock, AgentCore or the Claude Agent SDK. Selected inputs leave AWS.",
    failure:
      "Meter tokens, stop on budget/iteration/time limits and refuse uncovered calls when verifiable credit is unavailable. No automatic paid fallback.",
  },
  {
    id: "research",
    name: "Ask the specialist team",
    tech: "Server-controlled SDK tool loop",
    group: "research",
    x: 368,
    y: 605,
    plain:
      "Chat can explain a holding, challenge a recommendation and show where its reasoning came from.",
    input:
      "Conversation context plus approved read-only tools for evidence, holdings, risk and predictions.",
    output:
      "Specialist research, bull/bear views, briefings and contextual answers linked to actual evidence/config versions.",
    trust:
      "Server code validates tools; document text cannot become an instruction. Agents cannot trade, change the ledger, promote models or bypass confirmations.",
    failure:
      "Show disagreements and abstain where evidence is weak. Separate guardrails, answer-quality evaluations and numerical predictive evaluation.",
  },
  {
    id: "ops",
    name: "See cost and system health",
    tech: "Usage estimates · billing · audit",
    group: "operations",
    x: 608,
    y: 605,
    plain:
      "Every environment, agent and significant action leaves an attributable trail.",
    input:
      "Run/trace/business IDs, usage reservations, token/service estimates, delayed billing and collector health.",
    output:
      "Local/dev/prod/shared costs, gross usage, verifiable credit and cash exposure; audit and recovery evidence.",
    trust:
      "£100 all-in planning ceiling: £70 operation + £30 reserve. Warn/reduce/pause policy is £60/£75/£85, not an instantaneous universal AWS cap.",
    failure:
      "Retain ambiguous-call liability; reconcile billing against estimates without double counting; flag stale collectors, leaks and missing audit events.",
  },
  {
    id: "push",
    name: "Tell you what matters",
    tech: "Native push · PWA push · in-app",
    group: "experience",
    x: 848,
    y: 605,
    plain:
      "A short daily briefing and material-risk alerts bring you back to the evidence.",
    input:
      "Approved alert conditions, material changes, quiet hours and committed event references.",
    output:
      "App/chat history plus planned native and PWA push. Summary: 07:30 Europe/London, configurable.",
    trust:
      "22:00–07:00 quiet hours with only explicitly approved critical exceptions. Delivery credentials and platform transport remain design choices.",
    failure:
      "Dedupe and track delivery outcomes; a notification opens durable evidence. It never submits an order or overrides the owner.",
  },
];

export const EDGES = [
  ["clients", "identity", "Sign in"],
  ["clients", "edge", "HTTPS"],
  ["edge", "api", "API route"],
  ["api", "identity", "Verify claims"],
  ["api", "live", "Subscribe"],
  ["api", "imports", "Upload command"],
  ["imports", "evidence", "Original + extraction"],
  ["imports", "jobs", "Validate / stage"],
  ["jobs", "ledger", "Confirmed commit"],
  ["ledger", "outbox", "Commit event"],
  ["outbox", "live", "Progress / snapshot"],
  ["feeds", "jobs", "Scheduled ingestion"],
  ["feeds", "rules", "Canonical quotes"],
  ["jobs", "evidence", "Versioned snapshots"],
  ["evidence", "features", "Point-in-time data"],
  ["ledger", "rules", "Eligible cash flows"],
  ["rules", "features", "Deterministic factors"],
  ["features", "models", "Fold-specific inputs"],
  ["models", "forecasts", "Owner-approved model"],
  ["forecasts", "outbox", "Forecast / outcome event"],
  ["api", "research", "Contextual question"],
  ["research", "claude", "Client SDK / HTTPS"],
  ["research", "rules", "Read-only maths tool"],
  ["research", "evidence", "Evidence references"],
  ["research", "forecasts", "Prediction context"],
  ["research", "outbox", "Durable final answer"],
  ["rules", "outbox", "Approved risk event via worker"],
  ["outbox", "push", "Delivery intent"],
  ["push", "clients", "Briefing / risk alert"],
  ["jobs", "ops", "Runs / cost / audit"],
  ["research", "ops", "Tokens / reservations"],
  ["ops", "api", "Cached dashboard aggregates"],
].map(([from, to, label]) => ({ from, to, label }));

export const PATHS = [
  {
    id: "all",
    name: "Whole system",
    nodes: NODES.map((n) => n.id),
    description:
      "Explore the proposed components. Select any component to inspect its contract.",
  },
  {
    id: "import",
    name: "A statement arrives",
    nodes: [
      "clients",
      "edge",
      "api",
      "imports",
      "evidence",
      "jobs",
      "ledger",
      "outbox",
      "live",
    ],
    description:
      "A source file becomes a reviewed, approved and traceable financial record.",
  },
  {
    id: "prediction",
    name: "A forecast is tested",
    nodes: [
      "feeds",
      "jobs",
      "evidence",
      "ledger",
      "rules",
      "features",
      "models",
      "forecasts",
      "outbox",
    ],
    description:
      "Point-in-time data becomes an evaluated, owner-approved forecast with a future outcome.",
  },
  {
    id: "chat",
    name: "You ask “why?”",
    nodes: [
      "clients",
      "edge",
      "api",
      "research",
      "claude",
      "rules",
      "evidence",
      "forecasts",
      "outbox",
      "live",
      "ops",
    ],
    description:
      "The server gives Claude bounded read-only tools, then records a cited answer and its cost.",
  },
  {
    id: "alert",
    name: "Risk changes",
    nodes: [
      "feeds",
      "jobs",
      "ledger",
      "rules",
      "outbox",
      "push",
      "clients",
      "ops",
    ],
    description:
      "Supported fresh inputs trigger approved materiality rules, durable alert evidence and deduplicated delivery.",
  },
];

export const JOURNEY = [
  {
    title: "Start with the paper trail.",
    short: "Import",
    text: "Drop in a statement, spreadsheet or screenshot, or add an entry yourself. The system preserves the original and proposes what it found. You see the matches, gaps and totals before anything changes.",
    technical:
      "S3 original → extraction candidate → instrument/listing resolution → deterministic validation → owner-confirmed, idempotent commit. Generic templates and sample-backed layouts bound v1 coverage; arbitrary broker formats are not promised.",
    nodes: ["imports", "evidence", "ledger"],
    proof:
      "Source file → extraction version → preview → approval → committed event",
  },
  {
    title: "Know what you actually own.",
    short: "Reconcile",
    text: "Build a coherent record of holdings and cash flows. Missing history stays visible. The app can still help, but it withholds calculations that need information you have not supplied.",
    technical:
      "Versioned ledger events, source lineage, staged atomic visibility and reconciliation. Rules define currency units, FX, cost basis, reversal and XIRR eligibility. Exact precision, settlement and ambiguous-root policies remain open.",
    nodes: ["ledger", "rules"],
    proof:
      "Every financial value has a calculation policy and an eligible input trail",
  },
  {
    title: "Bring the outside world into focus.",
    short: "Observe",
    text: "Match each real listing to permitted market data. Track the US, UK and India first. Daily forecasts are separate from the 30-minute quote and risk checks that supported instruments can receive.",
    technical:
      "Yahoo Finance + Twelve Data Grow adapters → canonical instruments/calendars/FX → timestamped source snapshots. Entitlements, tier and history remain listing-specific gates. Fall back to daily analysis when intraday evidence is insufficient.",
    nodes: ["feeds", "jobs", "evidence"],
    proof:
      "Provider + listing + source timestamp + ingestion time + quality flags",
  },
  {
    title: "Let models earn your trust.",
    short: "Evaluate",
    text: "Test simple rules and statistical baselines before adding more complex ML or LLM-derived factors. A new model runs in shadow and shows its evidence before you decide whether to promote it.",
    technical:
      "Point-in-time datasets → purged walk-forward folds → train-fold-only transformations → calibration/benchmark and ablation tests → shadow → owner approval. Portable jobs and selective SageMaker are still alternatives.",
    nodes: ["features", "models", "forecasts"],
    proof:
      "Dataset / feature / model versions + split dates + benchmarks + approval",
  },
  {
    title: "Question the recommendation.",
    short: "Discuss",
    text: "Ask why an ETF is ranked highly, what changed in a holding, or which evidence disagrees. Specialist research explains the numbers, cites its sources and can say it does not know.",
    technical:
      "FastAPI/Lambda controls the official Anthropic client-SDK loop. Typed read-only tools expose eligible maths and evidence. Server budgets, guardrails, tool validation and T0/T1/T2 answer-quality evaluations are distinct from numerical forecast evaluation.",
    nodes: ["research", "claude", "rules"],
    proof:
      "Conversation + tool inputs + cited evidence + model/prompt versions + usage",
  },
  {
    title: "Make a considered decision.",
    short: "Decide",
    text: "Compare add, hold, pause, trim or rebalance suggestions with growth, downside and benchmark-relative scores. See the portfolio impact and uncertainty. Every investment decision remains yours.",
    technical:
      "Approved ranking inputs: growth 35%, protection 40%, opportunity 25%. Eligibility and abstention run before ranking; detailed formulas and overrides are still to agree. No broker execution, order route or trading credential exists.",
    nodes: ["rules", "forecasts", "clients"],
    proof:
      "Evidence and uncertainty remain attached to every ranked suggestion",
  },
  {
    title: "Keep the score. Learn carefully.",
    short: "Learn",
    text: "Preserve what was predicted, then compare it with what actually happened when that horizon matures. Use the results to propose better models. Learning is automatic evidence gathering; changing the live model still needs your approval.",
    technical:
      "Immutable forecast → declared maturity → canonical outcome → calibration/error/coverage/benchmark scoring → new experiment. Backtests, shadow and genuine prospective records stay separate; 3–5-year scenarios are not treated as mature evaluated forecasts.",
    nodes: ["forecasts", "models", "ops"],
    proof:
      "An unbroken prediction → outcome → score → experiment → promotion trail",
  },
];

export const FILM_SCENES = JOURNEY.map((j, i) => ({
  title: j.title,
  caption: j.text,
  technical: j.proof,
  number: i + 1,
}));

export const INTEGRATIONS = [
  [
    "Web and Apple clients",
    "Cognito + API",
    "HTTPS, verified identity, versioned schemas",
    "Owner/session checks; secure caches; native bridge compatibility",
  ],
  [
    "Route 53 / CloudFront",
    "S3 web shell + API Gateway",
    "DNS, TLS, static origin, explicit API routing",
    "No private data in builds or shared caches; static/SSR decision open",
  ],
  [
    "FastAPI / Lambda",
    "Durable state + jobs",
    "Commands, idempotency, budget admission, job references",
    "Owner/environment isolation; no synchronous dependency on a long-lived screen",
  ],
  [
    "Import pipeline",
    "S3 + ledger",
    "Object versions, hashes, typed candidate/preview/commit",
    "Source text untrusted; explicit owner confirmation; atomic visibility proof",
  ],
  [
    "Yahoo / Twelve Data",
    "Canonical market snapshots",
    "Listing adapters, calendars, units, FX and quality",
    "Rights, quota and freshness verified before activation; daily fallback",
  ],
  [
    "Rules / performance",
    "Ledger + snapshots",
    "Deterministic calculations with eligible inputs",
    "No invented XIRR, no confidence generated from fluent prose",
  ],
  [
    "Training / evaluation",
    "S3 artefacts + forecast records",
    "Fold/data/model versions, shadow and promotion",
    "Point-in-time validation; owner promotion; mature outcome scoring",
  ],
  [
    "Research loop",
    "Anthropic HTTPS API",
    "Official client SDK, typed tool requests/results",
    "AWS-to-Anthropic boundary; allowlists; time/token/iteration limits",
  ],
  [
    "Tools and memory",
    "Approved read models + evidence",
    "Scoped context, correctable versioned memory",
    "No ledger mutation, trade execution or promotion authority for agents",
  ],
  [
    "Durable outbox",
    "SSE + notification workers",
    "Replayable references, cursors, retries and deduplication",
    "Delivery does not execute business actions; reconnect via authorised snapshot",
  ],
  [
    "Native / PWA push",
    "Owner devices",
    "Platform delivery provider and subscriptions",
    "Exact transport/permission flow open; delivery receipts and quiet-hour policy",
  ],
  [
    "Cost collectors",
    "Anthropic reports + AWS billing",
    "Six-hourly Claude reports; daily AWS collection",
    "Delayed reconciliation; scoped billing permissions; cached app aggregates",
  ],
  [
    "Every service and job",
    "Audit / observability",
    "Business IDs, traces, build/config/model versions",
    "Redact sensitive payloads; durable business evidence outlives short trace TTL",
  ],
  [
    "GitHub delivery",
    "Future separate dev/prod targets",
    "Checks, issue-linked PRs, IaC plans and approvals",
    "No deployment from this atlas; protection enforcement limitations stay explicit",
  ],
];

export const PHASES = [
  [
    "PH-00",
    "Agree the complete blueprint",
    "Requirements, contracts, UX, risk and cost choices. Application implementation waits.",
  ],
  [
    "PH-01",
    "Design the books and imports",
    "Agree ledger, all v1 import methods, confirmations, corrections and reconciliation. Build depends on PH-02.",
  ],
  [
    "PH-02",
    "Establish the private foundations",
    "Identity, API, durable work, environment boundaries, audit and launch cost controls.",
  ],
  [
    "PH-03",
    "Make the numbers trustworthy",
    "Permitted market data, calendars/FX, performance, rules, risk and freshness.",
  ],
  [
    "PH-04",
    "Prove the science",
    "Baselines, point-in-time evaluation, immutable forecasts and approved promotion.",
  ],
  [
    "PH-05",
    "Add bounded research and chat",
    "Direct Anthropic SDK loop, evidence, memory, guardrails and answer evaluations.",
  ],
  [
    "PH-06",
    "Bring the web experience together",
    "Discovery first, separate holdings, rankings, explanations, briefings and costs.",
  ],
  [
    "PH-07",
    "Extend to Apple and offline",
    "SwiftUI surfaces, React Native bridge, secure cache, push and reconnect.",
  ],
  [
    "PH-08",
    "Prove operational readiness",
    "Security, regression/UI checks, recovery drills and full-scope cost validation.",
  ],
  [
    "PH-09",
    "Expand with evidence",
    "New markets, themes and model families through versioned contracts and approval.",
  ],
];

export const OPEN_CHOICES = [
  "Final AWS Region and dev/prod account boundary",
  "Static SvelteKit versus SSR",
  "DynamoDB ledger-fit proof versus relational alternative",
  "Durable Functions versus Step Functions and queue design",
  "Portable ML jobs versus selective SageMaker training",
  "N0 versus justified N1 / conditional N1-E networking",
  "Exact source tier, permitted history and per-listing entitlements",
  "Precision, return/benchmark definitions and scientific promotion thresholds",
  "Full-scope cost validation and detailed UX/device/recovery contracts",
];
