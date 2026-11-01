# MP write-scope proposal after the read-only check

**Draft · 1 November 2026 · Unreviewed · Ready for owner scope review · Not applied**

**Current draft requirements, not implementation approval.** This is a separate local authoring task after the completed read-only check. It changes none of the records checked. No external account reads, page/issue writes, uploads, review or sync apply was performed by this authoring lane. The exact proposed Jira insertion strings and lossless-compose instructions are in [the structured proposal](mp-sync-write-proposal.json).

## Concrete scope for approval

| Destination | Proposed operation | Count | Limits |
| --- | --- | --- | --- |
| Confluence `mypaisaapr` | New planning/portfolio/phases/architecture/stack pages | 5 | Canonical existing-parent tree; new numeric IDs unknown until actual returned results. |
| Six existing MP hubs | Bounded current-baseline/navigation updates | 6 | Preserve fresh drafts, unrelated rich nodes/macros, attachments and dated history. |
| Planning index attachments | Exact-name image upserts | 8 | Reuse matching files; preserve all ten observed existing attachments; no delete/recreate workaround. |
| Jira MP | Existing description-only insertions | 11 | Only MP-4–MP-13 and MP-15; all statuses and other fields unchanged. |
| Jira/MA/other | New issues, transitions, closures or MA changes | 0 | MP-3, MP-14 and MP-16 remain Done/closed. No 64-new-issue creation. |

The Confluence scope is governed by [the canonical page map](confluence-page-map.json), [its reading version](confluence-page-map.md) and [prepared native payload sources](confluence-publish-payloads.json). This proposal links those sources; it does not copy or establish a second authority for native page payloads. The planning index is under roadmap **5112476**, the phase plan under that new index, portfolio under product **4981241**, and architecture/stack under architecture **5145394**. Reuse existing homepage **5145345**, product **4981241**, architecture **5145394**, roadmap **5112476**, workflows **5014127** and security/cost **5112525**. No extra child tree or new network child page is proposed.

The eight image names are `import-workflow.png`, `import-workflow.gif`, `option-a-lucid.png`, `option-b-lucid.png`, `mp-system-architecture-native.png`, `phase-dependencies.png`, `budget-envelope.png` and `mp-network-options-native.png`. All are proposed for the resolved planning-index page; other bodies reuse those attachments. Static alternatives remain the default and the illustrative GIF is opt-in. Attachment upsert does not mean eight uploads are inevitable: identical existing content is a no-op; a supported existing-version update must be verified before changing an existing binary.

## Evidence and its limits

The coordinator’s completed read-only check ran **21:22–21:25 UTC on 1 November 2026**. This proposal carries its dated statuses and published-page observations; it does not repeat those account reads or assert a comprehensive live drift gate. The **21:34 UTC** network appendix/native diagram delta is later authoring evidence, not a retroactive change to that check. Current local hashes in the JSON are captured during this separate authoring task and are not represented as the earlier check’s hashes.

Observed page versions were homepage **2**, product **3**, architecture **4**, roadmap **2**, workflows **5** and security/cost **3**. These are provenance, never write tokens. Fresh full draft content, macros, attachment inventory and current version/snapshot tokens must be read before a bounded update. Preserve the ten observed existing attachments and any new ones found on the fresh read. No existing attachment IDs, issue updated-at values or new child-page IDs are invented.

The baseline retains all 41 confirmed individual decisions while full end-to-end requirements and UX remain unapproved. Synthetic local/dev real-ID inputs are used now; actual holdings/screenshots/PDFs arrive progressively later and do not gate current planning. Direct Anthropic Python client SDK on Lambda with Anthropic-hosted models, £100 all-in cash/£70 operation/£30 reserve, £60/£75/£85 forecast-cash actions, launch cost visibility and all first-version import methods are repeated in each current-baseline insertion. Detailed unapproved defaults stay open.

## Jira correction map

Each row is an insertion into the existing description, not an issue replacement, transition or completion claim. Earlier contradictory runtime/budget/import/topology wording is explicitly dated history; original valid acceptance criteria and rich nodes remain preserved.

| Existing issue | Phase join | Exact intended delta |
| --- | --- | --- |
| MP-4 | PH-00/PH-02 + foundation PH-08 | Full baseline/UX gate; identity, environment, audit and cost safeguards; unselected N0/N1/N1-E and required network evidence. |
| MP-5 | PH-01/PH-03/PH-06 | All five input methods; sample-backed layouts; immutable preview/approval hash; idempotency/atomic financial visibility, replay/correction/sufficiency and web/cost joins. |
| MP-6 | PH-04 + science joins | All short/long horizons and separate scenarios; complete F1–F8, point-in-time validation, ablations, shadow/owner promotion; numerical evidence thresholds remain open. |
| MP-7 | PH-05/PH-06/PH-02 | Replace intended Agent SDK runtime with direct client SDK; Lambda chat/memory/tool/eval/cost controls, disagreement/abstention and durable jobs/SSE. |
| MP-8 | PH-07 + shared clients | SwiftUI/RN ownership, native/PWA push, L1 journeys and costs; device/Duo/offline/accessibility and advanced-native release choices remain open. |
| MP-9 | PH-02/PH-08 | Historical single-host/PostgreSQL/£50 labels; unselected serverless/network choices, all-in cost, monthly/change recovery, topology failures and open RPO/RTO. |
| MP-10 | PH-03 + input evidence | Yahoo/Grow exact tier/rights/coverage/history; calendars, identifiers, quote units/FX; actual private inputs deferred and supported-cadence fallback. |
| MP-11 | PH-02/PH-07 | Managed Cognito Apple/Google/passkeys, verified linking/two passkey paths; open tier/session/recovery/reauth; API invocation differs from ENI ingress and SG differs from domain firewall. |
| MP-12 | PH-01/PH-02 | Store-fit ADR, 15 L1 contracts, approval hash, staged financial visibility, durable receipts/outbox/corrections/sufficiency; path-specific resource/endpoint policies rather than blanket `SourceVpce`. |
| MP-13 | PH-08 + storage/topology | Record-class retention, monthly/change recovery, isolated restore/bootstrap/DNS/endpoint/NAT failures, open RPO/RTO and preserved recovery access. |
| MP-15 | PH-00–PH-09 pack | Current local pack; N0/N1/N1-E and ML A/B unselected, C retired; unverified shared credit; synthetic now/actual later; exact publication approval pending and no app-build authority. |

## Lossless and idempotent application protocol

Every insertion has a unique visible begin/end marker, such as `[[MP-CURRENT-BASELINE-2026-11-01-MP-4-BEGIN]]` and its matching `END`. The JSON contains the exact dated Markdown strings. Do not send unresolved `{{MP_PAGE_URL:NEW-*}}` references. First resolve each page key to the actual MP create/reuse result, then render only the new insertion to supported native description nodes.

Before each issue write, verify the fresh site/project/key, status, `updated_at` and complete native description/hash. Snapshot the lossless source. If there is no marker, prepend the new bounded block and retain every existing native node in order. If there is exactly one valid marker pair, replace only that block; identical resolved content is a no-op. Stop on ambiguous markers, unsupported rich-node preservation, identity/version drift or concurrency. Never convert the entire prior rich description from rendered Markdown/HTML as a shortcut. Use native conditional/version checks where supported. A full-description replacement alone cannot guarantee atomic protection against concurrent edits; re-read immediately before writing and stop/escalate if safe lossless preservation cannot be established.

Send only `description`. Do not send transitions, statuses, summaries, labels, assignees, comments or attachment changes. Preserve comments, attachments and existing changelog; a successful description update naturally appends normal platform history. On readback, verify one resolved block, unchanged status and unchanged original nodes outside the block. Record actual results/partial failures separately. MP-4–MP-13 remain **To Do**, MP-15 remains **In Progress**, and MP-3/MP-14/MP-16 remain **Done/closed**.

The 16 L1 plus 48 other local stories are references from existing files, not proposed Jira creations. Draft source-to-phase coverage does not establish detailed story readiness, scientific validity or completed phase exits.

## Proposed order, permission and readiness

If later explicitly approved: freeze/revalidate the exact local source hashes and canonical 5/6/8 scope; perform fresh lossless preflight; create/reuse the five pages and resolve actual IDs; upsert only the eight approved images as needed; apply six bounded hub updates; resolve actual page URLs and compose the eleven description-only Jira updates; then read back every result. Stop rather than guess any unsupported attachment-update path or rich-description roundtrip. No new account, access, cost, network or implementation authority is implied.

This draft is ready for owner review of the concrete scope, **not ready to apply**. The final canonical map and payload now match five creates, six bounded updates and eight real image upserts; their frozen source hashes are verified in the JSON. Fresh-read/version/link resolution, exact scope consent and any separately chosen independent review must precede a later apply. No review has run here. Source hashes/targets/counts changing after consent require resolving the concrete delta before proceeding.

Proposed consent wording for the coordinator: “Shall I apply only the proposed MP Confluence five page creates, six bounded hub updates and eight image upserts, and the eleven named Jira description-only insertions, with every status and closed issue unchanged?” The wording is a prepared question, not a request or approval issued by this authoring lane. Independent review and its regression/round scope remain a separate explicit project choice.

## Exact proposed Jira insertions

The following blocks are the proposed new content only. They are not full issue descriptions and have not been written to Jira.

### MP-4 — description-only proposed insertion

```markdown
[[MP-CURRENT-BASELINE-2026-11-01-MP-4-BEGIN]]

### Current draft requirements, not implementation approval

**Current draft requirements, not implementation approval**
**Current-baseline insertion dated 1 November 2026; includes the 21:34 UTC network-document delta.**

DEC-001–041 are the individual decision authority; full end-to-end requirements and UX remain unapproved. Use realistic synthetic local/dev fixtures with real instrument IDs now. Actual holdings, screenshots and PDFs are deferred and may arrive progressively; they do not gate this planning work. Live identity, source rights/coverage and full-scope pricing still gate the relevant later activation.

Shared current constraints: standalone personal decision support with its own ledger and no trading; CSV/Excel/PDF/screenshots/manual methods in the first version with named sample-backed coverage; direct Anthropic Python **client-SDK** loop on Lambda, with Claude models hosted on Anthropic; £100/month aggregate cash ceiling, £70 planned operation plus £30 reserve, forecast-cash warn/reduce/pause at £60/£75/£85; main-dashboard cost visibility at launch. The reported shared $200 Anthropic credit is unverified and counted once; no automatic paid fallback. Detailed formulas, suballocations and controls are not approved by these headline decisions.

**Current phase crosswalk:** PH-00, PH-02 and foundation portions of PH-08.

- Treat this existing foundation epic as the historical six-phase entry point for PH-00 baseline/contracts, PH-02 identity/private platform/cost controls and foundation acceptance in PH-08. All ten PH-00–PH-09 layers remain planned; no phase exit is certified.

- Complete every layer’s requirements, contracts, stories, UX states and evidence plan, then seek full end-to-end baseline/UX approval before any application implementation. Existing health/sample SSE/static preview are starter evidence only.

- Include Cognito managed Apple/Google/passkey sign-in, verified linking and two independent passkey paths; isolate owner/environment permissions; preserve private originals, durable financial/forecast/approval audit and redacted operational telemetry.

- Establish launch cost attribution/admission before paid work: per environment/provider/agent/model/feature/service, estimated versus provider-reported charges, gross/credit/cash and unknown allocation/source age.

- Keep network N0 customer-VPC-unattached Lambda versus optional N1 split private scope, and conditional N1-E egress, unselected. Require the service-path/policy matrix, regional cost, endpoint/bootstrap, SSE and recovery-access evidence before selection. A VPC icon or diagram is not security or connectivity proof.

**Planning references — resolve only after actual MP child-page IDs are returned:** {{MP_PAGE_URL:NEW-PLANNING-INDEX}}, {{MP_PAGE_URL:NEW-PHASED-PLAN}}, {{MP_PAGE_URL:NEW-ARCHITECTURE}}, {{MP_PAGE_URL:NEW-TECH-STACK}}.

**Historical context preserved:** Earlier contradictory scope, runtime, budget or topology wording retained below is dated historical context as of 1 November 2026; this current-baseline section identifies the intended draft delta. Preserve valid prior acceptance criteria and all original rich description nodes, comments, attachments and changelog. No task is marked implemented or Done by this insertion.

[[MP-CURRENT-BASELINE-2026-11-01-MP-4-END]]
```

### MP-5 — description-only proposed insertion

```markdown
[[MP-CURRENT-BASELINE-2026-11-01-MP-5-BEGIN]]

### Current draft requirements, not implementation approval

**Current draft requirements, not implementation approval**
**Current-baseline insertion dated 1 November 2026; includes the 21:34 UTC network-document delta.**

DEC-001–041 are the individual decision authority; full end-to-end requirements and UX remain unapproved. Use realistic synthetic local/dev fixtures with real instrument IDs now. Actual holdings, screenshots and PDFs are deferred and may arrive progressively; they do not gate this planning work. Live identity, source rights/coverage and full-scope pricing still gate the relevant later activation.

Shared current constraints: standalone personal decision support with its own ledger and no trading; CSV/Excel/PDF/screenshots/manual methods in the first version with named sample-backed coverage; direct Anthropic Python **client-SDK** loop on Lambda, with Claude models hosted on Anthropic; £100/month aggregate cash ceiling, £70 planned operation plus £30 reserve, forecast-cash warn/reduce/pause at £60/£75/£85; main-dashboard cost visibility at launch. The reported shared $200 Anthropic credit is unverified and counted once; no automatic paid fallback. Detailed formulas, suballocations and controls are not approved by these headline decisions.

**Current phase crosswalk:** PH-01, PH-03 and portfolio/web joins in PH-06.

- Retain the standalone investment ledger and extend historical CSV-only import wording to CSV, Excel, PDF/statements, screenshots and manual entry/correction in the first version. Supported institution/layout coverage is sample-backed; generic synthetic fixtures do not prove arbitrary broker compatibility.

- Use immutable reviewable draft revisions with exact source/field provenance, account/listing/unit normalization, duplicate/reconciliation choices and owner approval bound to draft hash, selected rows, environment and expected ledger revision. Any material edit invalidates that approval.

- Require persistent idempotency and one logical financial application under retries, with staged/failed/cancelled work excluded from holdings, agents, totals and outbox consumers. Prove atomic financial visibility within selected store limits; storage upload is not a committed import.

- Retain replayable projections, durable receipts, financial/audit/outbox obligations, explicit reconciliation and append-only correction/reversal. Snapshot history must not create invented purchases or be double-counted when older transactions arrive.

- Allow incomplete holdings/history, disclose sufficiency and withhold unsupported XIRR/cost measures. Join detailed L1-S01–L1-S16 to authenticated web/native/chat review/read/SSE journeys and launch cost/privacy controls. Keep the 48 other local stories as references, not newly created MP issues.

**Planning references — resolve only after actual MP child-page IDs are returned:** {{MP_PAGE_URL:NEW-PORTFOLIO-IMPORT}}, {{MP_PAGE_URL:NEW-PHASED-PLAN}}, {{MP_PAGE_URL:NEW-ARCHITECTURE}}.

**Historical context preserved:** Earlier contradictory scope, runtime, budget or topology wording retained below is dated historical context as of 1 November 2026; this current-baseline section identifies the intended draft delta. Preserve valid prior acceptance criteria and all original rich description nodes, comments, attachments and changelog. No task is marked implemented or Done by this insertion.

[[MP-CURRENT-BASELINE-2026-11-01-MP-5-END]]
```

### MP-6 — description-only proposed insertion

```markdown
[[MP-CURRENT-BASELINE-2026-11-01-MP-6-BEGIN]]

### Current draft requirements, not implementation approval

**Current draft requirements, not implementation approval**
**Current-baseline insertion dated 1 November 2026; includes the 21:34 UTC network-document delta.**

DEC-001–041 are the individual decision authority; full end-to-end requirements and UX remain unapproved. Use realistic synthetic local/dev fixtures with real instrument IDs now. Actual holdings, screenshots and PDFs are deferred and may arrive progressively; they do not gate this planning work. Live identity, source rights/coverage and full-scope pricing still gate the relevant later activation.

Shared current constraints: standalone personal decision support with its own ledger and no trading; CSV/Excel/PDF/screenshots/manual methods in the first version with named sample-backed coverage; direct Anthropic Python **client-SDK** loop on Lambda, with Claude models hosted on Anthropic; £100/month aggregate cash ceiling, £70 planned operation plus £30 reserve, forecast-cash warn/reduce/pause at £60/£75/£85; main-dashboard cost visibility at launch. The reported shared $200 Anthropic credit is unverified and counted once; no automatic paid fallback. Detailed formulas, suballocations and controls are not approved by these headline decisions.

**Current phase crosswalk:** PH-04 and scientific/data/research joins in PH-03/PH-05/PH-06.

- Retain daily formal forecasts for next trading day, 5/20 trading days and 3/6/12 months; show 3–5-year assumption-based scenarios separately. Define target, currency/return convention, exchange calendar, cutoff, maturity and correction policy per horizon before implementation.

- Preserve transparent rules/statistical baselines and all F1–F8: point-in-time data; leakage-safe backtest lab; regime/risk; analogs/events; direction/distribution challengers; explanation/proof; contribution/rebalance experiments; and chart/pattern features with applicable instrument-kind controls.

- Use temporal walk-forward validation with horizon-aware purge/embargo and train-only transformations/calibration. Version datasets/features/models/prompts, known-at timestamps, revisions, splits, benchmarks and uncertainty/sample evidence; never claim synthetic outcomes prove live accuracy.

- Evaluate the ablation ladder from rules/statistical to numerical ML to LLM-structured features and approved additional families. Separate answer-quality judges from predictive evidence and score only mature outcomes.

- Require challenger-versus-baseline evidence, shadow observation and explicit owner approval before any live model/calibration/strategy promotion; keep compatible rollback pointers. Numerical metric thresholds, effective sample sufficiency and shadow duration remain pending, especially for long horizons. ML execution A versus B remains unselected.

**Planning references — resolve only after actual MP child-page IDs are returned:** {{MP_PAGE_URL:NEW-PHASED-PLAN}}, {{MP_PAGE_URL:NEW-ARCHITECTURE}}, {{MP_PAGE_URL:NEW-TECH-STACK}}.

**Historical context preserved:** Earlier contradictory scope, runtime, budget or topology wording retained below is dated historical context as of 1 November 2026; this current-baseline section identifies the intended draft delta. Preserve valid prior acceptance criteria and all original rich description nodes, comments, attachments and changelog. No task is marked implemented or Done by this insertion.

[[MP-CURRENT-BASELINE-2026-11-01-MP-6-END]]
```

### MP-7 — description-only proposed insertion

```markdown
[[MP-CURRENT-BASELINE-2026-11-01-MP-7-BEGIN]]

### Current draft requirements, not implementation approval

**Current draft requirements, not implementation approval**
**Current-baseline insertion dated 1 November 2026; includes the 21:34 UTC network-document delta.**

DEC-001–041 are the individual decision authority; full end-to-end requirements and UX remain unapproved. Use realistic synthetic local/dev fixtures with real instrument IDs now. Actual holdings, screenshots and PDFs are deferred and may arrive progressively; they do not gate this planning work. Live identity, source rights/coverage and full-scope pricing still gate the relevant later activation.

Shared current constraints: standalone personal decision support with its own ledger and no trading; CSV/Excel/PDF/screenshots/manual methods in the first version with named sample-backed coverage; direct Anthropic Python **client-SDK** loop on Lambda, with Claude models hosted on Anthropic; £100/month aggregate cash ceiling, £70 planned operation plus £30 reserve, forecast-cash warn/reduce/pause at £60/£75/£85; main-dashboard cost visibility at launch. The reported shared $200 Anthropic credit is unverified and counted once; no automatic paid fallback. Detailed formulas, suballocations and controls are not approved by these headline decisions.

**Current phase crosswalk:** PH-05, PH-06 and PH-02 durable job/SSE joins.

- Current intended research runtime is an explicit bounded official Anthropic Python client-SDK loop on Lambda calling Claude hosted on Anthropic. Earlier Agent SDK/subprocess/AgentCore runtime wording below is historical and does not select that implementation.

- Define typed allowlisted read-only tools, verified owner/environment context, source-taint quarantine, numerical/citation grounding and token/turn/time/cost admission. Agents cannot trade, fetch secrets, alter ledger truth or promote model/calibration/settings authority.

- Retain contextual holdings/candidate/forecast chat, sourced research cards, shared conversation state and scoped owner-visible memory/caching with correction/forget controls. Notes do not replace financial truth, approved settings or primary evidence.

- Specify T0/T1/T2, online checks and human-calibrated judges with bounded evaluation spend. Expose rules/ML/LLM disagreement and abstain when evidence is insufficient; chat cannot bypass disabled/in-practice forecast eligibility.

- Use bounded durable jobs, idempotent continuation/cancellation and authenticated heartbeat/resume-aware SSE with durable refetch after gaps. The local unauthenticated volatile sample stream is not production evidence. N0/N1/N1-E reachability and optional private-job endpoint/bootstrap requirements remain unselected and evidence-gated.

**Planning references — resolve only after actual MP child-page IDs are returned:** {{MP_PAGE_URL:NEW-ARCHITECTURE}}, {{MP_PAGE_URL:NEW-TECH-STACK}}, {{MP_PAGE_URL:NEW-PHASED-PLAN}}.

**Historical context preserved:** Earlier contradictory scope, runtime, budget or topology wording retained below is dated historical context as of 1 November 2026; this current-baseline section identifies the intended draft delta. Preserve valid prior acceptance criteria and all original rich description nodes, comments, attachments and changelog. No task is marked implemented or Done by this insertion.

[[MP-CURRENT-BASELINE-2026-11-01-MP-7-END]]
```

### MP-8 — description-only proposed insertion

```markdown
[[MP-CURRENT-BASELINE-2026-11-01-MP-8-BEGIN]]

### Current draft requirements, not implementation approval

**Current draft requirements, not implementation approval**
**Current-baseline insertion dated 1 November 2026; includes the 21:34 UTC network-document delta.**

DEC-001–041 are the individual decision authority; full end-to-end requirements and UX remain unapproved. Use realistic synthetic local/dev fixtures with real instrument IDs now. Actual holdings, screenshots and PDFs are deferred and may arrive progressively; they do not gate this planning work. Live identity, source rights/coverage and full-scope pricing still gate the relevant later activation.

Shared current constraints: standalone personal decision support with its own ledger and no trading; CSV/Excel/PDF/screenshots/manual methods in the first version with named sample-backed coverage; direct Anthropic Python **client-SDK** loop on Lambda, with Claude models hosted on Anthropic; £100/month aggregate cash ceiling, £70 planned operation plus £30 reserve, forecast-cash warn/reduce/pause at £60/£75/£85; main-dashboard cost visibility at launch. The reported shared $200 Anthropic credit is unverified and counted once; no automatic paid fallback. Detailed formulas, suballocations and controls are not approved by these headline decisions.

**Current phase crosswalk:** PH-07 with shared PH-00/PH-01/PH-02/PH-06 contracts.

- Swift/SwiftUI owns native iPhone/iPad views, persistence, widgets and secure-device integrations; the React Native shell owns navigation and bridge contracts. This does not create an Android product-screen commitment.

- Retain the approved native and PWA push requirement alongside in-app/chat delivery, permission-denied/background-limited fallback, neutral payloads, durable outbox/deep links and quiet-hour/dedup rules. Do not promise instantaneous OS delivery.

- Carry complete L1 import/preview/confirmation/correction/sufficiency journeys, discovery-first experience, separate holdings, horizon proof/chat and launch cost dashboard across clients using the same financial/privacy contracts.

- Agree supported device/OS/iPad/adaptive Duo matrix, offline cache/session revocation and accessibility (VoiceOver, Dynamic Type, reduced motion and chart alternatives) before implementation. Requested web SvelteKit 3 availability is still to verify, not an installed dependency claim.

- Explicitly classify advanced widgets/search/share/Siri/App Intents/Live Activities as launch or later activation without silently dropping inherited scope. Native design selection and full end-to-end UX/baseline approval remain pending.

**Planning references — resolve only after actual MP child-page IDs are returned:** {{MP_PAGE_URL:NEW-PLANNING-INDEX}}, {{MP_PAGE_URL:NEW-PORTFOLIO-IMPORT}}, {{MP_PAGE_URL:NEW-TECH-STACK}}, {{MP_PAGE_URL:NEW-PHASED-PLAN}}.

**Historical context preserved:** Earlier contradictory scope, runtime, budget or topology wording retained below is dated historical context as of 1 November 2026; this current-baseline section identifies the intended draft delta. Preserve valid prior acceptance criteria and all original rich description nodes, comments, attachments and changelog. No task is marked implemented or Done by this insertion.

[[MP-CURRENT-BASELINE-2026-11-01-MP-8-END]]
```

### MP-9 — description-only proposed insertion

```markdown
[[MP-CURRENT-BASELINE-2026-11-01-MP-9-BEGIN]]

### Current draft requirements, not implementation approval

**Current draft requirements, not implementation approval**
**Current-baseline insertion dated 1 November 2026; includes the 21:34 UTC network-document delta.**

DEC-001–041 are the individual decision authority; full end-to-end requirements and UX remain unapproved. Use realistic synthetic local/dev fixtures with real instrument IDs now. Actual holdings, screenshots and PDFs are deferred and may arrive progressively; they do not gate this planning work. Live identity, source rights/coverage and full-scope pricing still gate the relevant later activation.

Shared current constraints: standalone personal decision support with its own ledger and no trading; CSV/Excel/PDF/screenshots/manual methods in the first version with named sample-backed coverage; direct Anthropic Python **client-SDK** loop on Lambda, with Claude models hosted on Anthropic; £100/month aggregate cash ceiling, £70 planned operation plus £30 reserve, forecast-cash warn/reduce/pause at £60/£75/£85; main-dashboard cost visibility at launch. The reported shared $200 Anthropic credit is unverified and counted once; no automatic paid fallback. Detailed formulas, suballocations and controls are not approved by these headline decisions.

**Current phase crosswalk:** PH-02 safeguards and PH-08 personal-launch acceptance.

- Earlier always-on/single-host/PostgreSQL and £50 AWS-only descriptions below are historical architecture/budget assumptions. Current Lambda/S3/DynamoDB preference and £100 all-in cash envelope do not silently supersede accepted ADRs: final store-fit, network and ML A/B choices require explicit reconciliation.

- Evaluate N0 unattached Lambda as cost-baseline candidate, optional N1 split private jobs and conditional N1-E egress; none is selected or deployed. Keep API service invocation distinct from ENI ingress, route/endpoint policy distinct from IAM permission, and SG egress distinct from domain firewall controls.

- Price total dev/prod/data/Claude/evals/edge/identity/telemetry/backups/SSE/build/network overhead and credit uncertainty. Enforce current cash alerts and launch cost attribution; no paid fallback or new optional paid work when admission denies it.

- Require monthly focused recovery/audit exercises plus relevant storage/import/audit/topology changes, replacing historical quarterly-only planning. Preserve original renewable 24-month archive and 14/30/90-day operational telemetry as separate from durable financial/forecast/approval audit.

- Exercise topology failures, service/endpoint/NAT/DNS/bootstrap/replay and owner recovery, isolated restore and model/schema rollback. RPO/RTO, account/region/IaC choices and detailed retention/deletion mechanics remain open; no automatic expiry deletion or deploy follows from this insertion.

**Planning references — resolve only after actual MP child-page IDs are returned:** {{MP_PAGE_URL:NEW-ARCHITECTURE}}, {{MP_PAGE_URL:NEW-TECH-STACK}}, {{MP_PAGE_URL:NEW-PHASED-PLAN}}.

**Historical context preserved:** Earlier contradictory scope, runtime, budget or topology wording retained below is dated historical context as of 1 November 2026; this current-baseline section identifies the intended draft delta. Preserve valid prior acceptance criteria and all original rich description nodes, comments, attachments and changelog. No task is marked implemented or Done by this insertion.

[[MP-CURRENT-BASELINE-2026-11-01-MP-9-END]]
```

### MP-10 — description-only proposed insertion

```markdown
[[MP-CURRENT-BASELINE-2026-11-01-MP-10-BEGIN]]

### Current draft requirements, not implementation approval

**Current draft requirements, not implementation approval**
**Current-baseline insertion dated 1 November 2026; includes the 21:34 UTC network-document delta.**

DEC-001–041 are the individual decision authority; full end-to-end requirements and UX remain unapproved. Use realistic synthetic local/dev fixtures with real instrument IDs now. Actual holdings, screenshots and PDFs are deferred and may arrive progressively; they do not gate this planning work. Live identity, source rights/coverage and full-scope pricing still gate the relevant later activation.

Shared current constraints: standalone personal decision support with its own ledger and no trading; CSV/Excel/PDF/screenshots/manual methods in the first version with named sample-backed coverage; direct Anthropic Python **client-SDK** loop on Lambda, with Claude models hosted on Anthropic; £100/month aggregate cash ceiling, £70 planned operation plus £30 reserve, forecast-cash warn/reduce/pause at £60/£75/£85; main-dashboard cost visibility at launch. The reported shared $200 Anthropic credit is unverified and counted once; no automatic paid fallback. Detailed formulas, suballocations and controls are not approved by these headline decisions.

**Current phase crosswalk:** PH-03 source/instrument contracts and PH-00/PH-01 evidence joins.

- Current selected data mix is Yahoo Finance plus Twelve Data Grow. Verify exact Grow tier, permitted access/analysis/storage/history/retention, UK/US/India listing coverage and actual delay; no licence, subscription or live coverage is inferred from a key, fixture or past source wording.

- Start current local/dev design with 20–30 real-ID synthetic instruments. Actual owner holdings/listings and PDF/screenshots are deferred; progressively resolve them later, then check permitted source coverage before proposing the balanced research watchlist for owner approval and final live costing.

- Separate issuer/security/share class/listing/venue identities, effective-dated aliases, currencies and quote units including GBX/GBP. Specify exchange calendars/DST/holidays, FX timestamps/conventions, corporate actions, NAV versus OHLC and source known-at/revision semantics.

- Formal forecasts are daily; supported quote/risk refresh is 30 minutes per actual capability. Fall back to daily analysis per holding with timestamps and suppression of unsupported intraday alerts; ask before any new paid source.

- Preserve provenance/quality/disagreement/gap/entitlement matrices and fail safe under quota, rights or freshness failure. No real private inputs are required to complete the current local planning/fixture phase.

**Planning references — resolve only after actual MP child-page IDs are returned:** {{MP_PAGE_URL:NEW-PORTFOLIO-IMPORT}}, {{MP_PAGE_URL:NEW-ARCHITECTURE}}, {{MP_PAGE_URL:NEW-TECH-STACK}}.

**Historical context preserved:** Earlier contradictory scope, runtime, budget or topology wording retained below is dated historical context as of 1 November 2026; this current-baseline section identifies the intended draft delta. Preserve valid prior acceptance criteria and all original rich description nodes, comments, attachments and changelog. No task is marked implemented or Done by this insertion.

[[MP-CURRENT-BASELINE-2026-11-01-MP-10-END]]
```

### MP-11 — description-only proposed insertion

```markdown
[[MP-CURRENT-BASELINE-2026-11-01-MP-11-BEGIN]]

### Current draft requirements, not implementation approval

**Current draft requirements, not implementation approval**
**Current-baseline insertion dated 1 November 2026; includes the 21:34 UTC network-document delta.**

DEC-001–041 are the individual decision authority; full end-to-end requirements and UX remain unapproved. Use realistic synthetic local/dev fixtures with real instrument IDs now. Actual holdings, screenshots and PDFs are deferred and may arrive progressively; they do not gate this planning work. Live identity, source rights/coverage and full-scope pricing still gate the relevant later activation.

Shared current constraints: standalone personal decision support with its own ledger and no trading; CSV/Excel/PDF/screenshots/manual methods in the first version with named sample-backed coverage; direct Anthropic Python **client-SDK** loop on Lambda, with Claude models hosted on Anthropic; £100/month aggregate cash ceiling, £70 planned operation plus £30 reserve, forecast-cash warn/reduce/pause at £60/£75/£85; main-dashboard cost visibility at launch. The reported shared $200 Anthropic credit is unverified and counted once; no automatic paid fallback. Detailed formulas, suballocations and controls are not approved by these headline decisions.

**Current phase crosswalk:** PH-02 identity and PH-07 cross-client recovery.

- Confirmed sign-in direction is Cognito managed sign-in with Apple, Google and passkeys, verified account linking and two independent passkey paths. Similar email text alone must not merge identities or establish recovery authority.

- Specify pool/tier/current capability compatibility, sessions/devices/token revocation, lost-device and provider-link recovery proof, sensitive-action reauthentication/freshness and approval replay protection. These details remain pending and no Cognito service is configured by this proposal.

- Use server-verified owner/environment scope for every read/write and approval; test denied cross-environment/cross-owner access, expired/wrong-scope approval and session/cache revocation across web/native.

- Keep public authenticated API invocation separate from private-network reachability: API Gateway invokes Lambda through its authorised service integration, not an inbound socket to a Lambda ENI.

- N0/N1/N1-E remain unselected. Workload security-group ingress/egress is role-specific; SG rules are not DNS-name/domain firewall controls. Policy, authentication, application validation and optional DNS/firewall controls need separate evidence and cost.

**Planning references — resolve only after actual MP child-page IDs are returned:** {{MP_PAGE_URL:NEW-ARCHITECTURE}}, {{MP_PAGE_URL:NEW-TECH-STACK}}, {{MP_PAGE_URL:NEW-PORTFOLIO-IMPORT}}.

**Historical context preserved:** Earlier contradictory scope, runtime, budget or topology wording retained below is dated historical context as of 1 November 2026; this current-baseline section identifies the intended draft delta. Preserve valid prior acceptance criteria and all original rich description nodes, comments, attachments and changelog. No task is marked implemented or Done by this insertion.

[[MP-CURRENT-BASELINE-2026-11-01-MP-11-END]]
```

### MP-12 — description-only proposed insertion

```markdown
[[MP-CURRENT-BASELINE-2026-11-01-MP-12-BEGIN]]

### Current draft requirements, not implementation approval

**Current draft requirements, not implementation approval**
**Current-baseline insertion dated 1 November 2026; includes the 21:34 UTC network-document delta.**

DEC-001–041 are the individual decision authority; full end-to-end requirements and UX remain unapproved. Use realistic synthetic local/dev fixtures with real instrument IDs now. Actual holdings, screenshots and PDFs are deferred and may arrive progressively; they do not gate this planning work. Live identity, source rights/coverage and full-scope pricing still gate the relevant later activation.

Shared current constraints: standalone personal decision support with its own ledger and no trading; CSV/Excel/PDF/screenshots/manual methods in the first version with named sample-backed coverage; direct Anthropic Python **client-SDK** loop on Lambda, with Claude models hosted on Anthropic; £100/month aggregate cash ceiling, £70 planned operation plus £30 reserve, forecast-cash warn/reduce/pause at £60/£75/£85; main-dashboard cost visibility at launch. The reported shared $200 Anthropic credit is unverified and counted once; no automatic paid fallback. Detailed formulas, suballocations and controls are not approved by these headline decisions.

**Current phase crosswalk:** PH-01/PH-02 durable contracts with PH-03/PH-04 consumers.

- Choose persistence through a store-fit/access-pattern/transaction-size ADR; do not treat historical PostgreSQL as prescribed or a DynamoDB preference as proof every import fits. Evaluate operational and analytical storage, conditional concurrency and staged large-import publication explicitly.

- Use the 15 draft L1 contracts: ScopeEnvelope, Money, InstrumentListing, InvestmentAccount, SourceDocument, ExtractionCandidate, ImportDraft, OwnerApproval, LedgerEvent, CommitReceipt, PositionObservation, ReconciliationResult, MetricResult, AuditEvidence and DomainNotification. They are planned contracts, not implemented services.

- Bind owner approval to immutable exact draft/hash/scope/row set and expected ledger revision. Require persistent idempotency, fenced atomic logical financial visibility, durable receipt, audit/outbox obligations and safe retry/replay; S3 objects and database writes are not one transaction.

- Exclude staged/failed/cancelled records from financial views, agents and notifications. Append linked corrections/reversals and reconcile later full history against snapshots. Define field-specific sufficiency and decimal/currency/FX policy; missing cost/cash-flow history never becomes invented XIRR.

- For N0/N1/N1-E, compose resource/role and endpoint policies for each legitimate CloudFront, unattached worker, private-job, owner-upload, CI and recovery path. Do not impose a blanket aws:SourceVpce deny that breaks these paths; endpoint routing/policy does not independently grant IAM access.

**Planning references — resolve only after actual MP child-page IDs are returned:** {{MP_PAGE_URL:NEW-PORTFOLIO-IMPORT}}, {{MP_PAGE_URL:NEW-ARCHITECTURE}}, {{MP_PAGE_URL:NEW-TECH-STACK}}.

**Historical context preserved:** Earlier contradictory scope, runtime, budget or topology wording retained below is dated historical context as of 1 November 2026; this current-baseline section identifies the intended draft delta. Preserve valid prior acceptance criteria and all original rich description nodes, comments, attachments and changelog. No task is marked implemented or Done by this insertion.

[[MP-CURRENT-BASELINE-2026-11-01-MP-12-END]]
```

### MP-13 — description-only proposed insertion

```markdown
[[MP-CURRENT-BASELINE-2026-11-01-MP-13-BEGIN]]

### Current draft requirements, not implementation approval

**Current draft requirements, not implementation approval**
**Current-baseline insertion dated 1 November 2026; includes the 21:34 UTC network-document delta.**

DEC-001–041 are the individual decision authority; full end-to-end requirements and UX remain unapproved. Use realistic synthetic local/dev fixtures with real instrument IDs now. Actual holdings, screenshots and PDFs are deferred and may arrive progressively; they do not gate this planning work. Live identity, source rights/coverage and full-scope pricing still gate the relevant later activation.

Shared current constraints: standalone personal decision support with its own ledger and no trading; CSV/Excel/PDF/screenshots/manual methods in the first version with named sample-backed coverage; direct Anthropic Python **client-SDK** loop on Lambda, with Claude models hosted on Anthropic; £100/month aggregate cash ceiling, £70 planned operation plus £30 reserve, forecast-cash warn/reduce/pause at £60/£75/£85; main-dashboard cost visibility at launch. The reported shared $200 Anthropic credit is unverified and counted once; no automatic paid fallback. Detailed formulas, suballocations and controls are not approved by these headline decisions.

**Current phase crosswalk:** PH-08 recovery joined to PH-01/PH-02 storage and topology.

- Define recovery by record class and selected store: originals/versions/derivatives, ledger/projections, durable financial/source/forecast/approval audits, model/data pointers and outbox/receipts. Versioning/retention alone is not a tested backup.

- Retain confirmed renewable 24-month original archive with owner extension/deletion controls and no authorised automatic expiry deletion; separate 14-day logs, 30-day rich traces and 90-day run summaries from durable business/forecast audit retention.

- Require monthly focused exercises plus relevant storage/import/audit/topology change checks, with isolated restore targets and financial/count/hash/source-lineage reconciliation before any switch. Agree RPO/RTO and backup/deletion retention details explicitly.

- Exercise restore bootstrap, DNS/service routing, endpoint/resource policy, role/owner access, queue replay and conditional NAT/endpoint failure paths under the selected N0/N1/N1-E topology. Avoid a blanket endpoint-only policy that strands approved recovery tools.

- Include compatible app/schema/model/calibration rollback and import correction/reversal; never rewrite unsuccessful forecasts or silently delete ledger history. No cloud restore, policy change, deletion or scheduled job is authorised by this planning correction.

**Planning references — resolve only after actual MP child-page IDs are returned:** {{MP_PAGE_URL:NEW-ARCHITECTURE}}, {{MP_PAGE_URL:NEW-PHASED-PLAN}}, {{MP_PAGE_URL:NEW-PORTFOLIO-IMPORT}}.

**Historical context preserved:** Earlier contradictory scope, runtime, budget or topology wording retained below is dated historical context as of 1 November 2026; this current-baseline section identifies the intended draft delta. Preserve valid prior acceptance criteria and all original rich description nodes, comments, attachments and changelog. No task is marked implemented or Done by this insertion.

[[MP-CURRENT-BASELINE-2026-11-01-MP-13-END]]
```

### MP-15 — description-only proposed insertion

```markdown
[[MP-CURRENT-BASELINE-2026-11-01-MP-15-BEGIN]]

### Current draft requirements, not implementation approval

**Current draft requirements, not implementation approval**
**Current-baseline insertion dated 1 November 2026; includes the 21:34 UTC network-document delta.**

DEC-001–041 are the individual decision authority; full end-to-end requirements and UX remain unapproved. Use realistic synthetic local/dev fixtures with real instrument IDs now. Actual holdings, screenshots and PDFs are deferred and may arrive progressively; they do not gate this planning work. Live identity, source rights/coverage and full-scope pricing still gate the relevant later activation.

Shared current constraints: standalone personal decision support with its own ledger and no trading; CSV/Excel/PDF/screenshots/manual methods in the first version with named sample-backed coverage; direct Anthropic Python **client-SDK** loop on Lambda, with Claude models hosted on Anthropic; £100/month aggregate cash ceiling, £70 planned operation plus £30 reserve, forecast-cash warn/reduce/pause at £60/£75/£85; main-dashboard cost visibility at launch. The reported shared $200 Anthropic credit is unverified and counted once; no automatic paid fallback. Detailed formulas, suballocations and controls are not approved by these headline decisions.

**Current phase crosswalk:** Whole current pack: PH-00–PH-09; no phase exit certified.

- Current scope is the local layered pack: portfolio/import specification, 16 detailed L1 stories plus 48 other local umbrella stories, 15 L1 contracts, worked examples, phase plan, architecture/stack, colourful static/optional-motion companions and canonical MP publication proposal. These are drafts, not 64 new Jira issues or an implemented app.

- Keep N0 customer-VPC-unattached Lambda, optional N1 split private scope and conditional N1-E egress unselected; the 21:34 UTC network appendix/native Lucid source/export adds technical evidence, not deployment approval. ML A portable jobs versus B selective SageMaker is unselected; retired AgentCore option C stays retired.

- The runtime direction is direct Anthropic Python client SDK on Lambda with Claude hosted by Anthropic. Reported $200 shared monthly credit is unverified, counted once and subject to availability; uncovered/unverifiable calls are refused without automatic paid fallback.

- Synthetic real-ID local/dev data is authorised now; actual holdings/screenshots/PDFs arrive progressively later. No current local planning gate requires them. Live source identity/rights/coverage, full-scope cost, recovery and scientific/UX decisions remain pending before activation.

- Confluence publication is pending exact owner approval for five new pages, six bounded existing-hub updates and eight image upserts in mypaisaapr only, using canonical map/payload sources with new-page IDs unresolved until actually returned. Existing content/macros and ten observed attachments remain preserved; no MA pages change.

- Any approved Jira correction is description-only for MP-4–MP-13 and MP-15. Keep To Do/In Progress statuses unchanged; MP-3/MP-14/MP-16 remain Done/closed. Full baseline/UX approval, application build, AWS loading/deployment, paid calls, model promotion, PR/merge and issue closure are not authorised by documentation or publication consent.

**Planning references — resolve only after actual MP child-page IDs are returned:** {{MP_PAGE_URL:NEW-PLANNING-INDEX}}, {{MP_PAGE_URL:NEW-PORTFOLIO-IMPORT}}, {{MP_PAGE_URL:NEW-PHASED-PLAN}}, {{MP_PAGE_URL:NEW-ARCHITECTURE}}, {{MP_PAGE_URL:NEW-TECH-STACK}}.

**Historical context preserved:** Earlier contradictory scope, runtime, budget or topology wording retained below is dated historical context as of 1 November 2026; this current-baseline section identifies the intended draft delta. Preserve valid prior acceptance criteria and all original rich description nodes, comments, attachments and changelog. No task is marked implemented or Done by this insertion.

[[MP-CURRENT-BASELINE-2026-11-01-MP-15-END]]
```
