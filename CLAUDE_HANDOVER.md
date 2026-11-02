# Mypaisaa Prediction — Claude handover

**Prepared 2 November 2026 · Documentation/knowledge transfer · Unreviewed**

This is the starting point for taking over MP from Codex. It describes the work,
sources, decisions, workflow modifications and remaining gates so Claude can build
its own project-scoped operating knowledge. It is not a new approved architecture
or an instruction to implement the product.

## Start here

The canonical repository is `/Users/arundutta/projects/mypaisaa-prediction`, remote
`https://github.com/gilipersonal/mypaisaa-prediction.git`. The delivered source
baseline is **`2e6439858de7b5e4209adab91491c5846e215cb4`** (PR #11 merged).
This handover is authored on **`MP-20-claude-handover`**. Inspect current Git state
before switching: do not reset, stash, delete branches or overwrite newer work.
The ChatGPT project mirror under `.codex/.chatgpt-projects/` is not the project repo.

Read in this order:

| Order | Handover chapter | What Claude learns |
| --- | --- | --- |
| 1 | [Codex workflows and Claude adaptation](docs/handover/claude-2026-11-02/01-codex-workflows-and-claude-adaptation.md) | All six project skills; rules/hooks/runner/CI; change history; what to carry into Claude and what requires a native adapter |
| 2 | [Product, architecture and decisions](docs/handover/claude-2026-11-02/02-product-architecture-and-decisions.md) | Whole-product intent, twelve ARC directions, two horizon decisions, twelve later policies and current evidence boundaries |
| 3 | [Roadmap, evidence and open work](docs/handover/claude-2026-11-02/03-roadmap-evidence-and-open-work.md) | PH-00–PH-09, dependencies, source coverage, story readiness, review state and the next planning sequence |
| 4 | [Jira, Confluence, Git and assets](docs/handover/claude-2026-11-02/04-jira-confluence-and-assets.md) | All current MP issue/page links and statuses/versions, publication boundaries, PRs, diagrams, Site identity and connector caveats |
| 5 | [Curated memory and scratchpad](docs/handover/claude-2026-11-02/05-memory-scratchpad-and-pitfalls.md) | Useful owner preferences, stale-memory corrections, operational lessons and an actionable continuation scratchpad |
| 6 | [Claude takeover playbook](docs/handover/claude-2026-11-02/06-claude-takeover-playbook.md) | Intake steps, proposed Claude-native mapping, adaptation acceptance and copy-paste prompts |

Start with this pack and the six skill sources. Load detailed primary sources by
the current task; the manifest is an index, not an instruction to load every raw
MA capture, publication body and review snapshot into one context window.

## The essential state in one page

- **Purpose:** personal, standalone stock/share/ETF intelligence, its own holdings
  ledger, rules/XIRR, quantitative ML and grounded Claude research/chat. No trading.
  Protect holdings and improve contribution/rebalancing, growth and benchmark
  decisions; measure outcomes instead of promising accuracy.
- **Selected direction:** SvelteKit 3 static PWA; SwiftUI with RN shell; ordinary
  FastAPI API Lambdas; Python Lambda Durable Functions for background orchestration;
  separate task-route Lambda workers using Anthropic's **client SDK**, with models
  hosted by Anthropic; DynamoDB/private S3; selective CPU SageMaker qualification
  and portable approved Lambda inference; Cognito; Inspect AI; separate dev/prod
  workload accounts. Full contracts, runtime and cost evidence are not complete.
- **Current implementation:** health/sample SSE API, offline synthetic and
  documentation tools, static concept/architecture presentation. Product auth,
  ledger, live providers/agents/ML, SvelteKit/native apps and cloud infrastructure
  are not implemented/deployed according to the source records. No cloud account
  inspection was performed for this handover.
- **Authority:** researched architecture/contracts and actual phase/story baseline
  before UX; complete user/admin UX approval and explicit build permission before
  application implementation. The current handover authorises notes, not migration
  of global/Claude settings, paid calls, cloud changes or external publication.
- **Costs:** £100 total monthly cash ceiling across dev/prod AWS, data and Claude,
  with £70 operation/£30 reserve. Budget fit and shared $200 credit remain unproven;
  no automatic uncovered paid fallback. Read the invoice-month scenarios.
- **Continuity:** the twelve later policy answers are saved and supersede older
  pending wording only within their scope. Do not restart those questions or
  mistake them for complete architecture approval.
- **Review:** Foundation round 1 found five issues, then maker fixes were applied.
  Further independent review was declined. Later README/logo deliveries were
  merged without independent review by explicit owner choice. No global “reviewed
  clean” claim is justified. Ask before each future round and named real-ledger run.
- **Live inventory:** this handover read summaries for **30 MP Jira issues and
  27 MP Confluence pages**. MP-19/MP-20 are In Review, even though PRs #9–#11 are
  merged. Thirteen MP-19 Confluence drafts exist; five newer foundation pages remain
  a local proposal. Summary inventory is not a full body/macro parity audit.

## Decision precedence and conflicts

Use current owner instructions and applicable active runtime instructions first,
then explicit later owner receipts, then selected direction records, then detailed
drafts and their historical sources. Read [AGENTS.md](AGENTS.md), existing
`.claude` project files, the [current policy journal](docs/planning/foundation-policy-discussion-2026-11-02.md)
and the [selected directions](docs/planning/ma-reconciliation-2026-11-02/direction-summary.md).

Do not silently inherit older £50 AWS-only, local-PostgreSQL, Agent-SDK,
Step-Functions-primary, unresolved-horizon or one-consent-for-all-review-rounds
wording. The owner's current requirement is approval before **every** review round.
Some old files remain intentionally preserved; the handover calls out their status
instead of pretending every source has already been rewritten.

## Evidence and portability

- [Live source inventory](docs/handover/claude-2026-11-02/live-source-inventory.json):
  trimmed issue/page metadata from read-only connected tools; no credentials.
- [Source manifest](docs/handover/claude-2026-11-02/source-manifest.json):
  relative paths and hashes of the source files used, with the Git baseline.
- [Capability map](docs/handover/claude-2026-11-02/capability-map.json): 22 relevant
  local skill entry points, verified for file presence only; Claude installation
  and authentication are not implied.
- [Git delivery inventory](docs/handover/claude-2026-11-02/git-delivery-inventory.json):
  live readback of PRs #1–#11 and their merged states/commits.
- [Verification record](docs/handover/claude-2026-11-02/verification.json):
  maker checks actually run and limitations. No independent review or real
  fixed-findings ledger was run for this handover.

The source files live in the repository; do not copy this single page alone if
Claude will work on another machine. Give it this branch/repository plus its own
authorised access to the MP Jira and Confluence space. The curated memory chapter
is self-contained; original global Codex memory paths are optional historical
references. Existing MCP sessions, secrets, global configuration and unrelated
project memory are not transferable evidence and were not exported.

For a single upload, use [TRANSFER_PACK.md](docs/handover/claude-2026-11-02/TRANSFER_PACK.md).
It combines this entry point, all six chapters and verbatim source appendices for
the six project skills, five Codex rules, AGENTS.md and hook/review-policy files.
Its links point back to the handover branch. It is a generated convenience copy;
the separate chapters and original repository sources remain easier to maintain.

## Message to paste into Claude

```text
Take over the Mypaisaa Prediction planning project at
/Users/arundutta/projects/mypaisaa-prediction.

Read CLAUDE_HANDOVER.md, then its six linked chapters and primary source files.
Inspect current Git state and applicable project/Claude instructions. Use your
own connected tools to read the MP Jira and Confluence sources where available;
the handover inventories are dated evidence, not live truth.

First explain what is implemented, selected, proposed and still unproven.
Identify stale/conflicting instructions using the latest owner receipts.
Propose how to adapt the six Codex workflows into your own project-scoped rules,
skills and supported hooks, preserving per-round review consent and shipping gates.
Do not overwrite configuration just by copying Codex syntax or restart settled
questions. Finish with the next concrete planning steps.

This first intake is read-only: no independent review, real regression-ledger
execution, external writes, paid calls, UX or application implementation.
```

An optional later prompt for actually applying the agreed Claude-native workflow
mapping is in [the takeover playbook](docs/handover/claude-2026-11-02/06-claude-takeover-playbook.md).
It is separate from this first intake and from product implementation permission.
