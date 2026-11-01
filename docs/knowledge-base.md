# Mypaisaa Prediction — knowledge base

**Last consolidated:** 1 November 2026

**Purpose:** the single starting point for future Codex work. It records product intent and working decisions; it is not a deployment plan or financial advice.

## 1. Product vision

Build a private, high-quality investment-intelligence and prediction platform for one person. It should help research global multi-asset investments and make recommendations based on transparent, measured evidence.

It is explicitly **not** a trading platform:

- No broker connections, order placement, or trade execution.
- No storage of brokerage execution credentials.
- No promises of returns or unqualified personalised investment advice.
- Every prediction must carry uncertainty, provenance, a clear time horizon, and later outcome tracking.

## 2. Target experiences

| Experience | Technology decision | Intended role |
| --- | --- | --- |
| Web | SvelteKit 3 progressive web app | Primary research, portfolio, model, and audit experience |
| Streaming | Server-sent events | Job progress and durable-record notifications |
| Apple native | Swift and SwiftUI for iPhone/iPadOS | Native data-rich screens, device security, cache, widgets, accessibility |
| Shared mobile shell | React Native | Navigation, bridge contracts, release coordination, future cross-platform option |
| Backend | Python FastAPI | Authenticated API, data pipelines, research agents, prediction/outcome registry |

The recommended division is Swift for meaningful Apple product screens and React Native only as the shell/bridge. It avoids compromising the iPad/iPhone experience while retaining a cross-platform integration seam.

## 3. Product capabilities to build

### Market and portfolio intelligence

- Global multi-asset coverage where legally/licensed data is available: equities, ETFs, indices, FX, commodities, and crypto.
- Canonical instrument catalogue and mapping between internal and provider symbols.
- Market-data history, freshness status, missing-data warnings, and provenance.
- Portfolio transaction ledger, CSV/import preview, deduplication, reconciliation, holdings, cash, and exposure.

### Quantitative prediction system

- Explicit forecast targets/horizons, for example 1, 5, and 20 trading days.
- Explainable baseline models before more complex ensembles.
- Feature definitions and data cutoffs that prevent future information leakage.
- Reproducible model runs, artefact hashes, dataset hashes, fold definitions, metrics, calibration, and benchmark comparison.
- Immutable prediction ledger: as-of time, model version, target, horizon, distribution/probability, confidence, uncertainty, and explanation.
- Automatic outcome collection once a prediction matures, then calibration and error analysis.

### Research intelligence

- Specialist agents for market context, company research, risk review, and evaluation explanation.
- Claude Agent SDK and Claude API key, used with strict cost/token/time limits.
- Approved source retrieval, structured output, citations, source/cost provenance, and human review state.
- Agents are research assistants only: they cannot trade, access secrets, mutate models, or silently publish predictions.

## 4. Data providers and licence assumptions

- **Twelve Data:** expected primary licensed market-data provider. Its cost is excluded from the AWS £50/month target.
- **Yahoo Finance:** may be considered as a supplemental/fallback source only after confirming its current terms permit the intended personal use. Do not redistribute data and do not treat it as an unrestricted production data source.
- **Claude API:** excluded from the AWS target, but requires its own usage controls, task limits, and review.

All provider payloads must record provider name, provider symbol, source timestamp, received timestamp, data interval, quality flags, and mapping to the internal instrument identifier.

## 5. Prediction integrity rules

These are non-negotiable because the goal is accuracy that can be independently assessed:

1. Never use random train/test splits for time-series prediction.
2. Use chronological rolling or expanding walk-forward validation.
3. Purge/embargo observations around each fold boundary according to the label horizon.
4. Fit imputation, scaling, feature selection, and calibration only on each training fold.
5. Compare every model with declared naïve/benchmark strategies and include turnover/cost assumptions where relevant.
6. Do not publish a forecast without an immutable as-of time, known data cutoff, model version, horizon, confidence/uncertainty, and explanation.
7. Score only after the original horizon has elapsed. Never rewrite an original prediction; create a superseding version when correction is required.
8. Report calibration, error, coverage, benchmark comparison, and uncertainty — not only directional hit rate.

## 6. Architecture decisions

| Decision | Why |
| --- | --- |
| Modular FastAPI monolith | Lowest operational complexity for a private, low-concurrency app; modules can be extracted later if necessary |
| SSE for notifications | Simple one-way updates for job/progress events; persistent data remains normal API reads |
| PostgreSQL as system of record | Suitable for portfolio ledger, event/prediction audit records, and relational data |
| Append-only prediction/outcome tracking | Prevents hindsight bias and enables a credible performance history |
| Small single-host AWS deployment | Meets initial personal-use budget when combined with S3 backups and budget alarms |
| Swift-native Apple surfaces inside RN shell | Preserves strong iOS/iPadOS experience without giving up a shared shell |
| Bounded Claude research agents | Gains research synthesis while limiting hallucination, prompt injection, cost, and authority |

The detailed records are in docs/adr. New architecture changes should add an ADR rather than silently changing these decisions.

## 7. API and streaming contract

The API uses versioned routes under /api/v1.

| Area | Planned responsibility |
| --- | --- |
| health | non-sensitive liveness/dependency status |
| instruments | searchable canonical asset catalogue |
| prices | timestamped history and freshness |
| portfolio | import preview/commit, transaction ledger, positions, reconciliation |
| research | cited briefings and agent retrieval status |
| predictions | current and historical forecasts, model provenance, outcomes |
| stream | authenticated SSE notifications |

SSE is not the source of truth. Events should be small and contain only event ID, type, timestamp, and resource reference. Clients reconnect and re-fetch durable state. Keep secrets, holdings, raw provider data, and model artefacts out of events.

## 8. Security and privacy baseline

- Authenticate every API endpoint except health.
- Use secure credential storage; never commit API keys, data files, or portfolio details.
- On Apple devices, use Keychain for secrets and clearly label cached data staleness.
- Encrypt server storage/backups and keep administrative access private.
- Validate imports in a quarantine/preview flow before committing them.
- Redact secrets and financial details from logs and errors.
- Treat retrieved web content and all agent tool output as untrusted input.
- Add rate limits for authentication, expensive research, ingestion, and model actions.

## 9. AWS budget constraint

**Target:** AWS production spend below £50/month, excluding Twelve Data and Claude API.

Initial cost-conscious shape:

- Small Lightsail Linux instance: API, scheduled worker, reverse proxy, and PostgreSQL.
- Encrypted S3 database/model/export backups with lifecycle rules.
- Small, bounded log retention and alarm use.
- Optional domain DNS and a clear AWS Budget alert.

Avoid during the first personal-production phase: RDS, ALB, NAT Gateway, EKS, GPU instances, managed Redis, managed real-time services, and multi-AZ designs. These may be appropriate later but require a revised cost model and ADR.

Set a forecast alert at £30/month and investigate before £40/month. Actual AWS pricing varies by region, usage, tax, and exchange rate, so confirm it before provisioning.

## 10. Delivery order

1. **Foundation:** secrets, schema conventions, test/CI baseline, licence review, personal authentication design, backup/restore plan.
2. **Trusted data and portfolio:** provider adapter, canonical instruments, idempotent ingestion, CSV import/reconciliation, initial PWA dashboard.
3. **Scientific prediction baseline:** targets, baseline models, walk-forward evaluator, feature/model registry, immutable forecasts and outcome scoring.
4. **Research and streaming:** constrained cited agents, evidence views, SSE status/notification flow.
5. **Native Apple app:** SwiftUI dashboard/prediction/portfolio flows, offline cache, iPad layouts, secure notifications.
6. **Production hardening:** container deployment, TLS, backups, restore drill, freshness alerts, cost review.

## 11. Deferred until explicitly reconsidered

- Trading and broker integration
- Multi-user accounts and social features
- High-frequency/tick data
- Automated investment decisions
- GPU model training
- Android-native product UI
- Expensive managed AWS architecture

## 12. Open questions for the next session

1. Which initial assets/exchanges and exact forecast horizons are most useful?
2. What is the first portfolio-import format and broker/export source?
3. Which region should host personal production, considering data location and AWS pricing?
4. What personal authentication method should be used for web and mobile?
5. Is Twelve Data Grow the confirmed plan, and which Yahoo Finance uses are permitted after terms review?
6. What is the practical success definition for the first model: calibration, benchmark-adjusted performance, risk-adjusted return proxy, or another metric?
7. Which public/reliable research sources should agents be allowed to retrieve?
8. Should the first release focus on the PWA before the native iOS/iPadOS app?

## 13. How to resume

Start with the README, then this document. Choose one phase from the delivery order, update the relevant architecture/ADR if a decision changes, and implement the smallest tested vertical slice. Follow AGENTS.md for guardrails.
