# Mypaisaa Prediction product requirements

**Working draft · 1 November 2026 · Requirements elicitation in progress**

This document consolidates the agreed product direction and answers to the requirements questions. Individual decisions below are confirmed; the end-to-end specification, architecture selection, UX and implementation readiness are not yet approved. No implementation follows automatically from this draft.

[Decision register](product-decisions.json) · [Full forecasting scope](forecasting-scope.md) · [Source acceptance register](forecasting-source-register.html) · [Architecture options](README.md) · [Audit, observability and costs](audit-observability-requirements.md) · [Proposed decision pack](requirements-decision-pack.html)

## Product and ownership

Build a standalone personal investment-intelligence application with its own investment ledger, holdings/imports, watchlists, conversations, rules, XIRR/performance analysis and ML forecasting with LLM-assisted evidence and factor development. It must support analysis of both owned holdings and independently researched candidates. It does not execute trades or submit orders.

Mypaisa-agent remains separate and retains wealth tracking, rules-based analysis and XIRR. Advanced stock Forecaster/ML work planned there is represented here. Retirement of any named MA feature is a later, explicit decision with a verified scope and recovery plan.

## Confirmed answers from the current question rounds

| ID | Decision | Requirement and acceptance implications |
| --- | --- | --- |
| DEC-001 | Long-term horizons | Cover **3, 6 and 12 months**, plus **3–5-year scenarios**, alongside the previously agreed next-day and 5–20-trading-day forecasts. Forecast horizon and refresh frequency remain separate. Label assumption-based scenarios distinctly from statistically evaluated forecasts. |
| DEC-002 | Combined investment objectives | Evaluate **long-term growth/downside protection, benchmark-relative opportunities, and protection of existing holdings with improved contributions/rebalancing**. None is silently dropped. Objective weights, benchmarks, trade-offs, metrics and evidence thresholds remain open. |
| DEC-003 | Initial instrument universe | Combine **the user's holdings** with **a proposed balanced research watchlist for user approval**. The first active universe remains approximately 20–30 instruments across UK/US/India, subject to the user's holdings and coverage checks. One holding name has been supplied privately; its precise instrument identity, the complete holdings list, candidate list and allocation of the 20–30 slots are pending. |
| DEC-004 | Recommendation detail | Present **ranked add, hold, pause, trim or rebalance suggestions**, with reasons, uncertainty and portfolio impact. Distinguish holdings from unowned candidates and show relevant evidence and horizon. Recommendation thresholds and ranking methodology remain open. |
| DEC-005 | First-version import methods | Include **CSV/Excel, statements/PDFs, screenshots and manual entry/corrections from the first version**. Define supported document families and formats with samples; import preview, validation, matching, duplicate detection, user confirmation, audit and reversal are acceptance requirements. “All methods” is not a promise to parse every institution's arbitrary document. |
| DEC-006 | Insufficient intraday data | Use **daily analysis for that holding** and **ask before adding any paid source**. Disclose the data timestamp/cadence and suppress alerts or claims requiring unavailable fresher observations. Source fallback must not invent an intraday signal. |
| DEC-007 | Risk loss measures | Assess **both decline from a previous peak and loss versus cost basis**, giving **portfolio risk greater weight** than individual-holding risk. Numeric weights, measurement windows and thresholds remain to be agreed. |
| DEC-008 | Summary and alerts | Provide a **daily summary plus immediate alerts for material risk changes**. “Immediate” means after a qualifying change is detected from available data; it does not remove provider or polling delay. UK-morning scheduling and app/chat/native/PWA push are confirmed below; exact time, materiality, quiet hours and cooldowns remain open. |
| DEC-009 | Sign-in methods | Design **Apple and Google sign-in plus passkeys using AWS Cognito**. Account linking, recovery, device/session controls and server-verified sensitive-action approval must be specified and validated before implementation. |
| DEC-010 | Initial thresholds | Propose **configurable risk/alert defaults for owner approval**, with **per-portfolio and per-holding overrides**. The initial balanced warning/severe profile is now confirmed in DEC-027; measurement and override details remain to specify. |
| DEC-011 | Benchmarks | Compare each holding with a suitable benchmark, the portfolio with a blended benchmark, **and both with a broad global equity benchmark**. Exact indices, weights, currency and total-return/cash-flow conventions remain to be specified. |
| DEC-012 | Notification channels | Support **app/chat plus native and PWA push** in the first version. Define permission denial, device/presence handling and supported-platform fallback; sensitive notification content follows the privacy policy still to be specified. |
| DEC-013 | Daily summary schedule | Deliver the daily summary in the **UK morning at a configurable time**, with **each market’s data timestamp shown separately**. Default time and quiet hours are now confirmed in DEC-032/033; weekend delivery and critical exceptions remain to specify. |
| DEC-014 | Incomplete holding history | Allow holdings with incomplete history, show supported analysis, **flag gaps and ask for missing history**. Withhold XIRR/cost-based measures or other results when required inputs are absent; never invent purchase history or imply unavailable calculations are complete. |
| DEC-015 | Briefing depth | Use a **short action-first briefing** covering priorities, changes, risks and upcoming events, with expandable evidence/technical detail. The compact summary must still disclose material uncertainty, staleness and eligibility. |
| DEC-016 | Conflicting signals | **Show the rules, ML and LLM-assisted views separately**, explain disagreements and **abstain where evidence is insufficient**. A combined ranking must not hide conflicting evidence or convert an ineligible forecast into a confident action. |
| DEC-017 | Ranking structure | Provide a **combined recommendation ranking** with visible growth, downside-risk and benchmark-relative opportunity scores. Weights are configurable and require owner approval; the initial 35%/40%/25% mix is confirmed in DEC-028. Normalization, eligibility and tie-breaking remain to specify. |
| DEC-018 | Landing experience | Open on the **market/discovery dashboard**, with holdings in a separate section and contextual chat accessible. This is a confirmed screen priority; visual designs still require selection. |
| DEC-019 | Forecast cadence | Publish **daily formal forecasts**. Refresh quotes and risk monitoring **every 30 minutes where supported**; disclose each source's age and fall back to daily analysis where required. Refresh cadence does not change the forecast horizon. |
| DEC-020 | Original documents | Keep originals in an **encrypted private S3 archive**, with **configurable retention and owner deletion controls**. Preserve version/source lineage. Define deletion of versions and derivatives explicitly; do not inherit permanent undeletable retention from MA. |
| DEC-021 | Audit, admin and observability | Preserve MA-style **upload/update audit, agent/model/tool activity and whole-system traceability, observability and monitoring**. Capture the admin portal requirements now; the user will design it later. Detailed controls and acceptance cases are in the linked operational requirements. |
| DEC-022 | Priority cost dashboard | Show **Claude API usage/cost and AWS cost for each environment directly on the main app dashboard**, with agent/model/feature/service breakdowns and a combined view. Show budgets, burn rate, alerts, source age and shared/unallocated costs. Separate estimated usage from provider-reported billing and gross usage from credits/cash. This is a launch requirement, not an admin-only follow-up. |
| DEC-023 | Cash planning envelope | **£70 planned operation plus £30 reserve within £100/month**. This is a planning limit awaiting full-scope costing; service/environment suballocations remain proposed. |
| DEC-024 | Credit fallback | **Pause optional Claude calls when credit is low and refuse uncovered/unverifiable calls; no automatic paid fallback**. Detailed gross-credit allocations and alert thresholds remain proposed. |
| DEC-025 | Cost collection cadence | **Live internal usage estimates, Anthropic billing collection every 6 hours and AWS billing collection daily**. Provider reporting delays still apply; the 60-second display target, query cap and stale-warning threshold remain proposed. |
| DEC-026 | Cash alerts | **Warn at £60 forecast monthly spend, reduce optional work at £75, pause new optional paid jobs at £85**. This is a planned application policy, not a universal instant stop on AWS billing; credit-percentage and environment thresholds remain proposed. |
| DEC-027 | Initial risk alerts | **Balanced profile: portfolio warning/severe at 10%/20%; individual holding at 15%/25%**. Configurable settings to test; alerts do not automatically trigger investment actions. Measurement windows and risk-score mixing remain unresolved. |
| DEC-028 | Ranking weights | **35% growth, 40% downside protection, 25% benchmark-relative opportunity**. Eligibility and abstention still apply; scoring formulas, normalization and action bands remain to specify. |
| DEC-029 | Performance currency view | **GBP portfolio overview with local-currency detail**. Exact benchmark indices and numerical return/FX conventions still need selection. |
| DEC-030 | Forecast presentation | **Balanced horizon-by-horizon sections**, retaining every agreed horizon and separating evaluated forecasts from **3–5-year scenarios**. Scientific targets and calendar rules still need specification. |
| DEC-031 | First ML rollout | **Evaluate challengers against baselines and mature outcomes → observe in shadow → seek owner approval before promotion**. Exact scientific gates and shadow duration remain unresolved; this does not authorise running training or deployment. |
| DEC-032 | Briefing time | **07:30 Europe/London**, following daylight-saving changes. Weekend delivery remains undecided; no scheduler is configured. |
| DEC-033 | Quiet hours | **22:00–07:00 Europe/London**, with exceptions only for critical conditions explicitly defined and approved. Alerts remain in app; critical definitions and cooldown details are still pending. |
| DEC-034 | Original archive duration | **Renewable 24-month archive** with owner extension/deletion controls. This does not set ledger/forecast retention or authorise automatic deletion; detailed expiry, backup and deletion mechanics remain to specify. |
| DEC-035 | Recovery/audit exercises | **Monthly focused exercises plus checks on relevant storage/import/audit releases**. Recovery targets and detailed scenarios still need specification; no cloud jobs are authorised now. |
| DEC-036 | Operational telemetry | **14-day logs, 30-day rich traces, 90-day run summaries**, subject to measured cost. Financial audit/forecast/approval evidence has separate retention; sampling remains proposed. |
| DEC-037 | Sign-in approach | **Cognito managed sign-in with verified account linking**, retaining Apple/Google/passkeys. Pool tier, sessions, reauthentication and recovery details remain to validate; no auth service is configured. |
| DEC-038 | Recovery redundancy | **Two independent passkey paths plus verified Apple/Google links**. Exact proof/recovery/session controls remain to design; this does not purchase or register anything. |
| DEC-039 | Initial import approach | **Sample-backed layouts plus generic templates**, retaining CSV/Excel/PDF/screenshots/manual and review of uncertain extraction. Specific broker layouts and sample coverage remain to agree. |
| DEC-040 | Evidence priority | **Resolve actual holdings/listings and permitted source coverage first, then propose the research watchlist**, before final architecture costing. Instrument names/identifiers are sufficient at this stage. |
| DEC-041 | Current synthetic-first phase | **Use realistic synthetic data for local/dev now**, retaining real instrument IDs. Actual holdings/samples will arrive progressively as screenshots/PDFs later; do not require them for current fixture work. This defers the immediate DEC-040 input step, while preserving live-data identity/rights/pricing prerequisites. Offline fixture generation is authorised; app implementation, AWS loading and deployment remain unauthorised. |

The initial answers that prioritised protection alone and holdings alone were superseded when the user reopened the questions: DEC-002 now combines all three objectives; DEC-003 now combines holdings and a proposed research list.

## Previously agreed constraints carried into the PRD

- UK, US and India initially; future mainland China, Taiwan, Hong Kong and continental Europe. Solar, clean energy and later themes are independent, dated classifications across markets.
- Start with 20–30 active stocks/ETFs, daily formal forecasts and 30-minute quote/risk monitoring where supported, with a broader daily research universe. Data availability controls actual cadence per holding.
- Adaptive SvelteKit 3 PWA plus native Swift/SwiftUI in a React Native shell for iPhone/iPad and the adaptive “Duo” experience. Exact device/OS matrix remains to be specified.
- Python FastAPI; explicit Anthropic Python **client-SDK loop on Lambda**, with Claude models hosted directly on Anthropic's platform.
- Yahoo Finance and Twelve Data Grow are the selected financial-data mix. The exact Grow tier, symbol coverage, delay, history and analysis/storage rights require verification.
- £100/month combined cash target for dev/prod, data and model use; the user reports $200/month Anthropic promotional credit. Track gross usage, applied credit and cash separately, including development and all evaluations. Actual eligibility/balance is not account-verified.
- Prefer AWS Lambda, S3 and DynamoDB; CloudFront, Route 53, API Gateway and AWS authentication. VPN is optional. SageMaker training remains a proposed architecture choice, not a user-selected final decision.
- Automated data collection, outcome scoring, candidate training and evaluation; owner approval before replacing live models or calibration. Rules, numerical ML and LLM-derived factors are compared through ablations against realised outcomes.
- Contextual holdings/recommendation chat, code-enforced tool/data/numerical/privacy safeguards, T0/T1/T2 evaluations, online checks and human-calibrated judging are core requirements.
- Preserve the full captured stock-forecasting scope: rules/statistical baseline and F1–F8, chart patterns, news/event/exposure analysis, research cards, contributions/rebalancing experiments, track record/proof, alerts, owner controls, memory, recovery and accessible clients.
- Versioned market, instrument, provider, universe/theme, feature, task/horizon, model, strategy, agent and evaluation contracts support later expansion. New unsupported computation requires tested code and deployment, not arbitrary runtime configuration.
- Prepare requirements, documentation, stories, plans and UX layer by layer before implementation. Author designs/prototype locally, then sync to ChatGPT Sites when authorised.

## Requirements still being elicited

| Area | Open decisions |
| --- | --- |
| Portfolio risk | Portfolio/holding risk-score weighting, measurement windows and protected positions; both loss measures and DEC-027 initial warning/severe thresholds are confirmed |
| Recommendations | Score definitions/normalization, eligibility/abstention thresholds, tie-breaking, rebalancing bands and contribution context; combined transparent ranking, explicit disagreement and DEC-028 weights are confirmed |
| Success criteria | Exact holding/blended/global benchmark definitions, acceptable growth/downside trade-off, calibration/error/alert metrics and minimum mature evidence; DEC-028 ranking weights and DEC-029 currency presentation are confirmed |
| Alerts | Weekend briefing policy, material/critical definitions, push permissions/fallback and duplicate/cooldown policy; 07:30 UK time and 22:00–07:00 quiet hours are confirmed in DEC-032/033 |
| Identity | Account-linking proof/recovery procedures, session/device security and owner-sensitive actions; DEC-037/038 managed sign-in, verified linking and two independent passkey paths are confirmed |
| Instruments | User-supplied holdings, identifiers/exchanges/currencies and proposed candidate list for approval |
| Imports | Supported institutions/document layouts, protected-file handling, reconciliation and field-specific sufficiency checks; DEC-039 sample-backed/generic-template approach is confirmed, and incomplete holdings are allowed with flagged gaps |
| Data | Grow tier and permitted Yahoo access, per-listing coverage/freshness, historical fundamentals/exposures and missing-data policy |
| Model/LLM design | Exact targets, factor and horizon contracts, model families, calibration/promotion/rollback tests and live evaluation budget; DEC-031 challenger/shadow/owner-approval rollout is confirmed |
| UX and delivery | Local design/prototype acceptance, offline behaviour and release sequence; discovery-first, daily formal forecasts and configurable S3 retention/deletion are confirmed |
| Audit and operations | Admin UX, upload/update lineage, record-class retention/deletion details, signal/alert thresholds, propagation and redaction; DEC-035/036 exercise cadence and operational retention are confirmed |
| Cost visibility and control | Environment/agent attribution, shared organization credit, collector access, source freshness, detailed budget allocations and credit/environment thresholds; direct dashboard visibility and DEC-023–026 cash/cadence policies are confirmed |

## Operational requirements and remaining defaults

The [S3, audit, observability and cost requirements](audit-observability-requirements.md) capture the required investigations and acceptance cases, supported by a separate [21-story MA source register](audit-observability-sources.json). The portal is planned, not implemented. Private financial evidence stays separate from redacted operational telemetry; sampled or expiring traces do not replace durable source/decision lineage.

The [consolidated decision pack](requirements-decision-pack.html) ([Markdown](requirements-decision-pack.md), [structured choices](requirements-decision-pack.json)) now proposes 18 owner choices: risk windows/thresholds, ranking weights and benchmark conventions; summary time, quiet hours and alert cooldowns; import layouts and retention/deletion classes; cost allocations/alerts and monitoring retention; and security/recovery defaults. All 18 initial choices are confirmed as DEC-023–040. The end-to-end requirements and UX remain unapproved; detailed defaults and evidence dependencies persist. DEC-041 now defers actual input collection: use the verified synthetic packs and [document/operations companions](../../synthetic-import-samples.md) for local/dev work. Actual identities and source entitlements/pricing remain required before live activation. Unasked suballocations, thresholds and detailed defaults are still proposed; the original 22 decisions are preserved. Actual holdings and data entitlements are separate onboarding/evidence inputs.

Re-cost the complete initial scope, including monitoring and its own collection/storage costs, before architecture approval. The earlier £60/£65 examples are initial-workload allowances and do not establish that all expanded capabilities fit the £100 all-in ceiling.

## Personal onboarding inputs

The actual ticker/share class/listing, additional holdings and available cash-flow history remain pending onboarding inputs. Synthetic packs with real instrument identifiers can support requirements and UX walkthroughs meanwhile; they are not the user’s reconciled holdings. The owner has deferred these inputs and will add screenshots/PDFs progressively. They do not block synthetic local/dev work; resolve them before validating a real import or enabling dependent personal calculations.

## Readiness gate

The PRD remains a working draft until the open decisions are resolved or explicitly deferred with consequences, requirements map to phased stories and tests, the data/cost assumptions are checked, and the user approves the end-to-end requirements and UX. No benchmark superiority or forecast accuracy is claimed by the plan itself.
