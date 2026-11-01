# Mypaisaa Prediction product requirements

**Working draft · 1 November 2026 · Requirements elicitation in progress**

This document consolidates the agreed product direction and answers to the requirements questions. Individual decisions below are confirmed; the end-to-end specification, architecture selection, UX and implementation readiness are not yet approved. No implementation follows automatically from this draft.

[Decision register](product-decisions.json) · [Full forecasting scope](forecasting-scope.md) · [Source acceptance register](forecasting-source-register.html) · [Architecture options](README.md) · [Audit, observability and costs](audit-observability-requirements.md)

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
| DEC-010 | Initial thresholds | Propose **configurable risk/alert defaults for owner approval**, with **per-portfolio and per-holding overrides**. Exact values have not yet been proposed or approved. |
| DEC-011 | Benchmarks | Compare each holding with a suitable benchmark, the portfolio with a blended benchmark, **and both with a broad global equity benchmark**. Exact indices, weights, currency and total-return/cash-flow conventions remain to be specified. |
| DEC-012 | Notification channels | Support **app/chat plus native and PWA push** in the first version. Define permission denial, device/presence handling and supported-platform fallback; sensitive notification content follows the privacy policy still to be specified. |
| DEC-013 | Daily summary schedule | Deliver the daily summary in the **UK morning at a configurable time**, with **each market’s data timestamp shown separately**. Exact default time, timezone/DST handling and quiet hours remain to be specified. |
| DEC-014 | Incomplete holding history | Allow holdings with incomplete history, show supported analysis, **flag gaps and ask for missing history**. Withhold XIRR/cost-based measures or other results when required inputs are absent; never invent purchase history or imply unavailable calculations are complete. |
| DEC-015 | Briefing depth | Use a **short action-first briefing** covering priorities, changes, risks and upcoming events, with expandable evidence/technical detail. The compact summary must still disclose material uncertainty, staleness and eligibility. |
| DEC-016 | Conflicting signals | **Show the rules, ML and LLM-assisted views separately**, explain disagreements and **abstain where evidence is insufficient**. A combined ranking must not hide conflicting evidence or convert an ineligible forecast into a confident action. |
| DEC-017 | Ranking structure | Provide a **combined recommendation ranking** with visible growth, downside-risk and benchmark-relative opportunity scores. Weights are configurable and require owner approval; exact defaults, normalization, eligibility and tie-breaking remain to be specified. |
| DEC-018 | Landing experience | Open on the **market/discovery dashboard**, with holdings in a separate section and contextual chat accessible. This is a confirmed screen priority; visual designs still require selection. |
| DEC-019 | Forecast cadence | Publish **daily formal forecasts**. Refresh quotes and risk monitoring **every 30 minutes where supported**; disclose each source's age and fall back to daily analysis where required. Refresh cadence does not change the forecast horizon. |
| DEC-020 | Original documents | Keep originals in an **encrypted private S3 archive**, with **configurable retention and owner deletion controls**. Preserve version/source lineage. Define deletion of versions and derivatives explicitly; do not inherit permanent undeletable retention from MA. |
| DEC-021 | Audit, admin and observability | Preserve MA-style **upload/update audit, agent/model/tool activity and whole-system traceability, observability and monitoring**. Capture the admin portal requirements now; the user will design it later. Detailed controls and acceptance cases are in the linked operational requirements. |
| DEC-022 | Priority cost dashboard | Show **Claude API usage/cost and AWS cost for each environment directly on the main app dashboard**, with agent/model/feature/service breakdowns and a combined view. Show budgets, burn rate, alerts, source age and shared/unallocated costs. Separate estimated usage from provider-reported billing and gross usage from credits/cash. This is a launch requirement, not an admin-only follow-up. |

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
| Portfolio risk | Numeric portfolio/holding weighting, measurement windows, thresholds and protected positions; both loss measures are confirmed |
| Recommendations | Score definitions/normalization, proposed weights, eligibility/abstention thresholds, tie-breaking, rebalancing bands and contribution context; combined transparent ranking and explicit disagreement are confirmed |
| Success criteria | Exact holding/blended/global benchmark definitions, objective weights, acceptable growth/downside trade-off, calibration/error/alert metrics and minimum mature evidence |
| Alerts | Exact UK-morning summary time, material/critical definitions, push permissions/fallback, quiet hours and duplicate/cooldown policy; daily summary/material-risk alerts and app/chat/native/PWA push are confirmed |
| Identity | Account linking and recovery, session/device security and owner-sensitive actions; Cognito with Apple/Google/passkeys is confirmed |
| Instruments | User-supplied holdings, identifiers/exchanges/currencies and proposed candidate list for approval |
| Imports | Supported institutions/document layouts, protected-file handling, reconciliation and field-specific sufficiency checks; incomplete holdings are allowed with flagged gaps |
| Data | Grow tier and permitted Yahoo access, per-listing coverage/freshness, historical fundamentals/exposures and missing-data policy |
| Model/LLM design | Exact targets, factor and horizon contracts, model families, calibration/promotion/rollback tests and live evaluation budget |
| UX and delivery | Local design/prototype acceptance, offline behaviour and release sequence; discovery-first, daily formal forecasts and configurable S3 retention/deletion are confirmed |
| Audit and operations | Admin UX, upload/update lineage, retention/deletion matrix, signal/alert thresholds, trace propagation and redaction; full relevant MA capability coverage is required |
| Cost visibility and control | Environment/agent attribution, shared organization credit, collector cadence/access, source freshness, budget allocations and thresholds; direct dashboard visibility is a priority launch requirement |

## Operational requirements and remaining defaults

The [S3, audit, observability and cost requirements](audit-observability-requirements.md) capture the required investigations and acceptance cases, supported by a separate [21-story MA source register](audit-observability-sources.json). The portal is planned, not implemented. Private financial evidence stays separate from redacted operational telemetry; sampled or expiring traces do not replace durable source/decision lineage.

The next requirements step is a consolidated proposal for owner review: risk windows/thresholds, ranking weights and benchmark conventions; summary time, quiet hours and alert cooldowns; import layouts and retention/deletion classes; cost allocations/alerts and monitoring retention; and security/recovery defaults. These are pending choices, not approved numbers. Actual holdings and data entitlements are separate onboarding/evidence inputs.

Re-cost the complete initial scope, including monitoring and its own collection/storage costs, before architecture approval. The earlier £60/£65 examples are initial-workload allowances and do not establish that all expanded capabilities fit the £100 all-in ceiling.

## Personal onboarding inputs

The actual ticker/share class/listing, additional holdings and available cash-flow history remain pending onboarding inputs. Synthetic packs with real instrument identifiers can support requirements and UX walkthroughs meanwhile; they are not the user’s reconciled holdings. These inputs must be resolved before validating a real import or enabling its dependent personal calculations.

## Readiness gate

The PRD remains a working draft until the open decisions are resolved or explicitly deferred with consequences, requirements map to phased stories and tests, the data/cost assumptions are checked, and the user approves the end-to-end requirements and UX. No benchmark superiority or forecast accuracy is claimed by the plan itself.
