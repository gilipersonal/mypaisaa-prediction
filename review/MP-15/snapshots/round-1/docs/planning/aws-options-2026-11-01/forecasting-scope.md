# Full forecasting scope and extensible investment intelligence

**Draft requirements baseline · MP-15 · 1 November 2026 · Standalone application · No implementation authorised**

Mypaisaa Prediction is a separate investment-intelligence application with its own authentication, holdings, transaction imports, investment analytics, watchlists, conversations and model history. It combines **rules, XIRR and other quantitative factors with LLM-assisted research and machine-learning forecasts**. It analyses both owned holdings and instruments you do not own.

Mypaisa-agent remains a separate wealth-tracking application with its rules-based analysis and XIRR. The advanced stock Forecaster and related ML research planned there are to be developed here. This is a product-direction decision, not permission to remove source files, close MA issues, delete histories or shut down any existing feature. Any eventual retirement must distinguish advanced ML forecasting from the rules/XIRR functions that stay in mypaisa-agent.

[Architecture and cost comparison](README.md) · [Illustrated review](review.html) · [Browse every captured source story and its acceptance criteria](forecasting-source-register.html) · [Machine-readable source register](forecasting-source-register.json)

## 1. What the inventory covers

The source inventory captures **140 Jira stories with their complete returned descriptions/acceptance criteria**: **70 direct market/forecasting items**, including the share-specific and ETF additions in phase 16, and **70 related investment/platform requirements**. The core spans phases 10–19 of the reference trace, excluding unrelated wealth phases; related items capture holdings/imports, XIRR, settings, chat, guards, evaluation, charts, memory and native capabilities. It also lists **71 additional referenced issues** as reference-only context, not silently added implementation scope.

The source repository snapshot is `387fc38bdc99d77460b6b03d90e2637241e79d1e`. The inventory also records file hashes and live Jira status snapshots. Relevant source architecture sections are 4.8, 5, 6.1–6.5, 7, 8, 9, 10, 11, 19, 20, 21, 22, 23 and 24. Confluence provides the corresponding market-engine, Forecaster, agent-team and India plans. Source descriptions are historical evidence, not instructions to execute old commands, use old accounts or restore superseded permissions.

**Completeness is measured against this named source corpus.** Every captured story has a target capability and a disposition. The complete source acceptance text remains available so detailed thresholds, edge cases and tests can be reviewed instead of lost in a summary. This is not a claim that every prototype button or all future changes elsewhere have been independently audited. Before any MA retirement, the inventory must be refreshed against its then-current requirements, code, designs and operating state.

Source status does not transfer: a Done design/documentation ticket does not make the corresponding feature implemented in Prediction. All target capabilities below are planned. Implementation priorities will be agreed after the complete specification and UX are reviewed.

## 2. Full inherited market and forecasting capability map

| Capability | Requirements retained here | Principal source stories |
| --- | --- | --- |
| **CAP-01 Data and instruments** | Pluggable feed contract; per-kind/per-instrument source chains; source/interval entitlements; idempotent refresh; provider disagreements; stale/provisional labels; quality circuit breaker; canonical identifiers, currency units, exchange calendars and timezones | MA-41–47, MA-119, MA-131, MA-151 |
| **CAP-02 Transparent rules engine** | Indicators, trend/momentum/macro/risk pillars, partial-data flags, exhaustion/rebound/death-cross flags, known-answer tests and auditable rule versions | MA-48, MA-49, MA-51, MA-53 |
| **CAP-03 Stances and decision support** | Holding versus candidate distinction; Buy/ADD, HOLD, PAUSE, TRIM, REBALANCE, BUY/WATCH meanings; protected positions, contribution caps, threshold explanations, confidence and “no clear view”; suggestions only | MA-50, MA-64, MA-89–92, MA-125 |
| **CAP-04 Statistical baseline ranges** | Volatility-scaled block bootstrap, return quantiles and downside-event probability; reproducible seeded evaluation; baseline independent from ML | MA-52, MA-81 |
| **CAP-05 ML Forecaster F1–F8** | Point-in-time lake, backtest lab, regime/risk models, similar days and event studies, calibrated direction/distribution ensemble, explanation/proof UI, contribution/rebalancing strategy experiments, candle/chart patterns and expanded technical features | MA-118–126, MA-280 |
| **CAP-06 News, events and exposures** | Deduplicated feeds, entity/event tags, sentiment index, earnings/macro calendar, exposure-weighted relevance, historical event impact and shadow-only sentiment influence until validated | MA-86–89, MA-119, MA-122, MA-154 |
| **CAP-07 Research and conversation** | Ask about a holding/candidate/result; holding profile, stance, overlap, benchmark, bull/bear, scenario, valuation and earnings cards; sourced answers, glossary and simple/technical modes; bounded two-sided debate | MA-54, MA-62–69, MA-99, MA-183 |
| **CAP-08 Independent investment ledger and performance** | Own investment accounts, holdings and transactions; CSV/Excel/CAS import preview, matching, deduplication, confirmation, reversals and audit; XIRR and supporting performance analytics; four-currency views | MA-27, MA-28, MA-36–40, MA-44, MA-111, MA-152, MA-153, MA-156, MA-206, MA-207, MA-212 |
| **CAP-09 Outcome tracking and learning** | Immutable stances/forecasts/decisions, mature outcomes and corrections, per-model/holding/regime scorecards, calibration proposals, challengers, shadow evidence, promotion, probation and rollback | MA-60, MA-81–85, MA-90, MA-132–134 |
| **CAP-10 Forecast experience and proof** | Rules and ML side by side, explicit disagreement, risk-first answer hierarchy, chart fan, mood/analog/event/driver sheets, pattern overlays, proof page and track record, “in practice”/disabled/no-view states | MA-56, MA-58, MA-78, MA-124, MA-183, MA-279, MA-281, MA-295 |
| **CAP-11 Briefings and alerts** | Morning brief, evening wrap, weekly reflection, tiered alerts, quiet hours, cooldowns, deduplication, interruption budgets, privacy-aware push and decision journal | MA-55, MA-57, MA-59–61, MA-85, MA-88, MA-91, MA-170, MA-200 |
| **CAP-12 Resilience and observability** | Bounded queues/DLQs/replay, per-conversation ordering, durable SSE resume, run and trace IDs, heartbeat/missed-job detection, incident records, safe catch-up and replay evidence | MA-30, MA-31, MA-61, MA-138–140, MA-146, MA-195, MA-232–235 |
| **CAP-13 Settings, agents and owner approvals** | Versioned settings with schemas/ranges, per-agent authority and quotas, owner change requests showing impact/evidence/cost/rollback, questions with options, rejected-request cooldown and audited approvals | MA-114, MA-116, MA-128–137, MA-256 |
| **CAP-14 Guardrails and evaluations** | Scoped tools; no trading; protected records; typed numerical grounding; quarantined source extraction; safety/regression/capability suites; T0/T1/T2; online checks, sampled judging, owner calibration and incident cases | MA-92, MA-246–256, MA-271 |
| **CAP-15 Agent memory and caching** | Stable-prefix caching, measured cache economics; bounded conversation context; owner-visible scoped notes; agent lessons; correction/forgetting; taint and audit; notes cannot become financial truth or settings | MA-115, MA-285–289 |
| **CAP-16 Cross-device UX and native capabilities** | Web/iPhone/iPad/adaptive “Duo” layouts; local design and prototype; accessible charts and reduced motion; privacy/offline/error states; deep links, search, widgets, share sheet, Siri/App Intents and long-job Live Activities | MA-70, MA-71, MA-76, MA-79, MA-80, MA-171–182, MA-174, MA-291, MA-295 |
| **CAP-17 Discovery, segments and themes — extension** | Analyse instruments not held; saved screens, peer/benchmark comparison, themed baskets, watchlists, evidence-based candidates, overlap with current holdings and long-term thesis monitoring | New request; extends MA-50, MA-62–67, MA-98, MA-99 |
| **CAP-18 Markets and model plug-ins — extension** | Versioned market, instrument, data, feature, model, horizon, strategy, theme and agent contracts; compatibility and per-market validation; bounded onboarding | New request; extends MA-41, MA-51, MA-119, MA-129, MA-134, MA-151–154, MA-254 |
| **CAP-19 Standalone ownership and retirement — extension** | Own ledger and imports; optional explicit file interchange; no required connection to MA; eventual advanced-forecasting retirement only after parity/ownership/recovery decisions | New request and standalone-app clarification |

All 140 individual mappings and the full original wording are in the source register. A group-level source list above is illustrative; it does not replace that item-by-item register.

## 3. Quantitative detail that must not be lost

### Rules, XIRR and factors have different meanings

XIRR explains the money-weighted performance of your dated cash flows; it is not itself a future-return probability. Retain separate ledger/performance, transparent rule-signal and predictive-model outputs. Recommendations may consider all three, but must identify whether a figure is realised performance, a rule score, a calibrated forecast or a hypothetical scenario. Include benchmark-relative performance, drawdown, volatility, concentration and FX attribution where their data is valid; agree each formula and cash-flow convention before implementation.

The reference indicator set is retained: EMA 20/50/200 with specified seeds; Wilder RSI-14; MACD 12/26/9 and histogram slope; TRIX-15 with EMA-9 signal; Bollinger 20/2 and %B; five-bar slopes; bars since price was below EMA20; ATR-14; realised/EWMA volatility and historical percentile; one-year drawdown; 12–1 momentum; proxy-versus-NAV gap. F8 adds ADX, stochastic oscillator, on-balance volume/volume trends, Ichimoku, Donchian and Keltner channels. Every applicable indicator has a versioned definition, sufficient-history rule and golden fixture.

Retain trend, momentum, macro and risk pillars and the stock valuation extension. Macro baskets remain configurable and exposure-weighted: the reference US ratios/correlations, UK/EU equivalents, commodity real-yield/dollar drivers and the India basket are captured. A partial basket is labelled; unavailable macro data must not be fabricated or silently treated as neutral.

Retain the stance cascade and the underlying ADD versus BUY distinction while permitting the UI label “Buy” for both. Holdings can produce HOLD/PAUSE/TRIM/REBALANCE proposals; independent candidates can produce BUY/WATCH, with the trigger that would change the view. Protected holdings, top-up/rebalancing bounds and user preferences constrain suggestions. These are research/decision-support outputs, never executable orders. Formal wording, suitability boundaries and thresholds remain requirements to agree.

The reference heuristic confidence formula and 55% “no clear view” threshold are preserved in source text as design inputs. An agreement/persistence/quality score is **not automatically a calibrated probability**. The target UI must label an uncalibrated rule score separately from `P(up)` or `P(drawdown)`. Any mapping to probabilities must earn that interpretation from outcome evidence.

### The complete F1–F8 Forecaster

| Module | Retained scope and explicit validation |
| --- | --- |
| **F1 — historical and point-in-time data** | Aim for ten years or available inception history; prices/NAV, corporate actions, constituents/benchmarks, macro vintages, stress, news/events and calendars. Store known-at and observation times and append revisions. Missing point-in-time history remains a data gap. |
| **F2 — backtest lab** | Replay each day without future information, starting with the rules engine. Compare buy-and-hold with contributions and a simple trend baseline; include fees/spreads, asset pricing timing, income/FX and permitted account assumptions. Report growth, drawdown, worst year, time underwater, volatility, calibration and sample counts. Deliberate leakage fixtures must fail. |
| **F3 — mood and risk** | Regime probabilities with stable transitions; volatility and downside-risk forecasts, calibrated and benchmarked. Risk thresholds and horizons are configuration. Regime smoothing must use only available past information. |
| **F4 — analogs and events** | Similar-day search with the reference 30-neighbour concept; outcomes after 5/20/60 days. Event studies for monetary/inflation surprises, elections, conflict, tariffs/sanctions, pandemic, earnings and commodity events; code computes mean/spread/count/interval. Sparse events are marked low evidence. |
| **F5 — directional/distribution ensemble** | Gradient-boosted challenger, regime/risk/analog features, calibration and interpretable drivers. Quantile forecasts and interval calibration are specified separately; conformal methods do not automatically produce valid time-series coverage or a probability for every event. Preserve held-out comparisons and model disablement. |
| **F6 — side-by-side explanation and proof** | Rules call plus ML risk/range/direction, explicit disagreement, mood and driver detail, forecast/track-record tabs, source trace and proof of eligibility. A research chat cannot bypass the “in practice”/disabled gate. |
| **F7 — contribution and rebalancing experiments** | Simulate user-selected contribution schedules, risk-aware tilts, trend filters, target bands and drawdown budget. Compare downside reduction against any lost growth under the user's chosen trade-off. User decisions and subsequent outcomes are journalled; no order execution. |
| **F8 — patterns and wider technical features** | Engulfing, hammer/shooting star, doji, morning/evening star, inside bars; support/resistance, breakouts, double tops/bottoms, head-and-shoulders and trend channels. Test detectors against hand-marked examples, include confirmation lag and only score data available at detection time. Measure per-instrument/subgroup event effects and false discoveries before display or model inclusion. |

The reference's fixed 20-day exclusion for analogs must become **horizon-aware** when measuring 60-day or longer outcomes. The “fewer than eight examples” low-confidence label is retained as a warning, not proof that eight examples establish an edge. Repeated pattern searches need multiple-comparison/out-of-sample controls. A ten-year target does not guarantee all sources deliver ten usable, unrevised years.

### Asset-specific behaviour and research cards

Carry equities, ETFs, UK OEIC/fund and commodity ETC semantics, plus the Indian mutual-fund/listed-instrument extension. NAV-only funds receive line histories and line patterns, not invented OHLC candles. Proxy baskets are explicitly provisional, with measured proxy/NAV gaps; they cannot replace the realised NAV used to grade a forecast.

Retain exposure maps for ETF/fund holdings, country/sector/currency mix, share business/supplier/rival exposure where evidenced, and commodity drivers. Use them for HHI/effective positions, fund overlap, currency/risk attribution, fee/tracking-difference comparisons, scenario shocks and news relevance. Historical studies require historical exposure versions, not today's constituents projected backwards.

Cards retain structured verdict, summary, evidence, raw-data/Technical section, per-source status/fetched time and generated time. Include stance, holding-profile, overlap-review, fund-vs-benchmark, bull-versus-bear, scenario, valuation-snapshot and earnings-analysis. The bull/bear pattern remains bounded to two arguments plus an adjudication round; its language judge cannot override numerical rules or promotion gates. Every screen can open chat with its exact evidence context.

## 4. LLM and ML working together

Your requested tandem design goes beyond using an LLM only to paraphrase. It permits an LLM to extract structured evidence from filings/news, classify event/theme exposure, propose new factors or model experiments, identify contradictions, and explain why an existing signal may be unreliable. These contributions are versioned and testable.

**The calibration reference is realised outcomes.** A confident LLM judgement is not the ground truth for a price forecast. Numerical calibration is fitted on held-out, mature labels; the LLM can propose a calibration/model change and critique its evidence. Promotion remains yours. LLM answer-quality evaluation and ML predictive evaluation are separate, and both must pass where a combined feature uses both.

Use an ablation ladder: **R0 rules/statistical baseline → M1 numerical ML → M2 ML plus LLM-derived structured features → M3 additional approved model family/ensemble**. Each candidate must demonstrate incremental value against its predecessor after data delay, cost and leakage controls. Record extraction-model/prompt version, source publication time, extraction time, schema and confidence. An LLM extracted feature computed now for an old article can carry hindsight; validate prospectively or explicitly document the historical contamination controls.

A later independent LLM forecast/critic can be tested as a challenger, not silently blended into production probability. Any blending function, weighting, calibration and fallback must be deterministic, versioned and evaluated. No agent can rewrite outcomes, add itself a model/tool, change its budget or move a model from shadow to live.

## 5. Product expansion by market, segment and theme

**Initial markets:** US, UK and India, with an initial 20–30 instrument active watchlist refreshed every 30 minutes where the selected source supports it. **Future market coverage:** mainland China, Taiwan, Hong Kong and broader continental Europe. UK remains distinct from continental Europe in the registry; Europe is a region grouping with individual venue/country profiles, not one exchange.

**Themes:** solar energy, clean energy and later any other approved theme. Themes are many-to-many classifications across markets and sectors. Solar can be a child/subtheme of clean energy, while an instrument can also belong to utilities, semiconductors or industrials. Store dated membership, source/evidence, methodology, confidence and exposure weight where justified. A fund's marketing label alone does not prove its economic exposure.

Separate issuer, security/share class and listing identities. Preserve listing venue, local currency, economic exposure and domicile independently. Mainland versus Hong Kong listings and depositary/dual listings must be linked without counting the same underlying company twice. No assumption is made here about available licences, investability or provider delay in those future markets.

The discovery experience covers instruments you do not hold: filter by market, sector, theme, instrument type, liquidity/data sufficiency and horizon; compare candidates with peers and benchmarks; show how a candidate changes concentration/overlap; save watchlists and investment theses; track recommendations and outcomes even when you take no action. Rankings expose eligibility, missing data and reasons. An uncovered instrument is shown as unavailable rather than assigned a made-up score.

Broad-universe screening should use batched quantitative calculations, with LLM research on a bounded shortlist or explicit request. Avoid an LLM call for every ticker at every refresh. Theme constituents and screen definitions are point-in-time versions, so evaluating a historical solar basket does not silently use today's winners.

## 6. Plug-in and configuration contracts

“Dynamic” means adding supported markets, instruments and themes through validated configuration, and adding genuinely new computation through tested plug-ins. It does not mean downloading arbitrary code at runtime or letting an LLM deploy a new model on its own.

| Extension contract | Versioned content | What can be added without changing core workflows |
| --- | --- | --- |
| **MarketProfile** | Region/country/venue IDs, calendar/timezone/session and auction rules, currencies/units, benchmarks, corporate-action rules, data capabilities and entitlement references | A market using existing calendar/provider capabilities; unsupported behaviour requires an adapter/test update |
| **InstrumentKind** | Equity/ETF/ETC/NAV-fund capability, required fields, price semantics, valid patterns, performance and valuation handlers, display schema | A type composed from supported handlers; no candle model on NAV-only data |
| **DataSource adapter** | `supports`, instruments, quotes, bars/NAV, FX, actions, fundamentals/news/exposures as separately advertised capabilities; quota and provenance | A provider producing the same canonical schemas after contract tests; missing capabilities are explicit |
| **Universe/ThemeDefinition** | Membership rules, evidence, effective dates, benchmark, filters and refresh cadence | A solar/clean-energy universe across existing markets, without new endpoints or a new neural network |
| **FeatureSet** | Typed inputs, lookback, known-at logic, transformations, missing-value policy, valid kinds/markets, output schema | A feature bundle with dependency and leakage tests; LLM-derived fields include extraction provenance |
| **ForecastTask/Horizon** | Target, units, return convention, horizon/calendar, maturity rule, losses, benchmarks and evidence gate | Another horizon when sufficient data/labels and compute exist; it is not just changing a label on the same model |
| **ModelAdapter** | Fit/predict/evaluate, supported tasks/kinds, feature schema hash, artefact format, resource limits and calibration interface | A new model family behind the same orchestration/serving contract, after trusted code and compatibility tests |
| **Strategy/RuleSet** | Indicator/pillar definitions, stance mapping, protected positions, contribution bands, scenario assumptions and explanations | A versioned strategy experiment with invariant tests and owner approval before live changes |
| **AgentManifest** | Role, prompt/model route, allowlisted tools, context scopes, budgets, stop conditions, evaluation tags and memory policy | Another specialist using already approved contracts; it cannot grant itself broader authority |
| **Presentation schema** | Versioned cards/charts/table fields, units, horizon/state labels and accessible alternatives | New supported instruments/themes rendered by generic web/SwiftUI components; novel interactions still need UX work |
| **EvaluationPack** | Required safety/regression/capability cases, numerical benchmarks, market/asset coverage, drift and rollout criteria | Every extension arrives with its own evidence, rather than escaping tests because it is “only config” |

Core records include `MarketProfile`, `Instrument`, `Listing`, `UniverseVersion`, `ThemeMembership`, `SourceCapability`, `FeatureSetVersion`, `ForecastTask`, `ModelVersion`, `CalibrationVersion`, `RuleSetVersion`, `ConfigVersion` and `EvaluationPackVersion`. A prediction pins all relevant versions plus the data manifest. Schema validation at ingestion and run admission prevents incompatible combinations.

Model registry lookup is by task/horizon/kind/eligible universe and approved version, not one global model for every asset. Start with pooled models where defensible; use market-aware tests and calibration. New markets require shadow evidence even if the same trained model technically runs. Feature distributions, calendars, reporting lags, currency units and missingness may differ. Do not promise that adding a country setting automatically yields accurate forecasts.

An extension follows: **propose → check entitlement/capabilities → validate schemas and budget → run recorded contract tests → point-in-time backfill → scientific replay/ablation → shadow → owner approval → activate by version → observe/rollback**. Requests that only add a known ticker/theme may take the lighter validated path; executable handlers, feature logic and new model families require code review/CI and deployment. Infra, IAM and secrets remain outside data configuration.

Example: adding a solar theme across existing UK/US/India listings creates a dated theme definition and source-backed membership; existing discovery, overlap, news relevance and charts consume it. Adding Taiwan requires a venue/calendar/currency profile, source entitlements, instrument mappings and validation; adding a new deep sequence model additionally requires training/serving code, resource costing and new model evidence. Neither action changes the £100 cap automatically.

## 7. Learning, operations, UX and tests carried forward

Keep the reference nine-role team: concierge, data steward, news scout, deterministic analyst, Forecaster, grader/tuner, ops warden, budget keeper and owner/admin desk. These are responsibilities with typed events and least privilege; they do not all require an LLM invocation. Apply the selected Anthropic client-SDK/Lambda runtime to the roles that actually need Claude.

Carry daily grading of mature outcomes, 30/90/365-day summaries, monthly candidate retraining, bounded calibration experiments, model/rule challenger comparison, shadow records, rejection/approval evidence and rollback-ready previous versions. Carry failure backoff, quota/freshness alarms, missed-run detection, heartbeat, safe source failover, gap repair, DLQ replay limits and escalation with trace links. “Self-healing” is restricted to approved recovery actions; no autonomous infrastructure edits or new paid subscriptions.

Retain scheduled brief/wrap/review semantics, simple and Technical modes, glossary, alert priorities, quiet hours, duplicate suppression and the “I acted” decision journal. Exact clock times, notification quotas, model routing and shadow duration are reviewed configuration, not inherited constants that fit every market. The app's own pause switch and cost degradation can fall back to deterministic templates rather than inventing fresh analysis.

The UX inventory includes Forecast, proof/eligibility, model sheets, track record, scorecard, calls, holding market view, exposure/overlap, scenarios, valuation/earnings, investment discovery/theme comparison, chat, owner approvals, Activity/Audit, data health and budget/evals. Retain loading, no model, stale, in-practice, switched-off, no-clear-view, error, long-name, privacy, offline, Dynamic Type and reduced-motion states. MA-281's “answer first” and MA-295's chart treatment are **source design decisions to adapt and review**, not automatically approved MP branding or screens.

Preserve quantitative golden tests, financial/XIRR fixtures, horizon-maturity and correction tests, per-provider schemas, data-quality gates, no-leakage and no-trading cases, context/identity protection, chat numerical/citation checks, T0/T1/T2 and online/human evaluation, browser visual/ARIA/accessibility tests, native snapshots/Maestro, reconnect/offline handling and cost-limit tests. Every future market/theme/model gets a coverage matrix. A shared model's release cannot pass solely because it works on US equities.

Memory/caching is included: scoped owner and agent notes, audit, view/correct/forget controls, budgeted context, source taint and stable-prefix caching. Notes never replace ledger values, prices, model settings or approval. Actual API capabilities/prices are checked when choosing model versions; historical source text is not a compatibility guarantee.

## 8. Explicit differences from the source

| Source assumption | Target treatment |
| --- | --- |
| Forecasting embedded in the household wealth app | Standalone Prediction app with its own ledger/imports, watchlists and analysis; no required shared database or live API dependency |
| Household/member-specific wealth functions | Adapt investment-relevant behaviour to personal scope. Salaries, debts, budget forecasts and whole-household net-worth projections remain MA responsibilities unless separately requested. |
| Rules engine replaced by learning model | Never the intended design: retain transparent rules, XIRR/performance and ML side by side, with LLM-derived signals tested in the combined system |
| Free Twelve Data and optional EODHD | Current selected financial mix is Yahoo Finance plus Twelve Data Grow. Other source capabilities are retained as extension requirements, not authorised providers/subscriptions. |
| Eight weeks automatically proves readiness | Preserve the original source gate for traceability; use horizon-aware mature/effectively independent evidence, benchmark criteria and owner approval. No automatic acceptance of a 12-month model after eight weeks. |
| Daily autonomous calibration changes | Retain daily scoring/refit candidates; **live calibration/model changes require owner approval** under the newer MP decision. |
| Heuristic confidence displayed as probability | Distinguish uncalibrated rule strength from statistically calibrated probabilities; preserve original formula for evaluation, not as a validated probability claim. |
| Automatic paid-feed/model expansion | Propose with entitlement, test and incremental cost evidence; owner approves. New markets/themes do not expand spending or permissions by implication. |
| Original £50 budget and old credit splits | Current £100 cash ceiling; stated $200 Anthropic credit, one aggregate meter including evals, and current Yahoo/Grow tier assumptions |
| Fixed source wall-clock schedules | Exchange-calendar-aware schedules and explicit data lags; UK, US and India active initially |
| Telegram/old app workflows | Web PWA and native SwiftUI/RN only for this project; source wording is adapted, not restored |

These changes preserve capabilities while resolving conflicts. Nothing is silently discarded because an older implementation detail is unsuitable.

## 9. Standalone ownership and eventual retirement

Prediction's own investment ledger is authoritative for its imported/entered data. It can work without mypaisa-agent. A manually supplied MA export could be one future import format with source ID, as-of time, schema version, duplicate detection and user confirmation; it is optional and does not grant either app database access to the other. Separate Cognito pools, storage, credentials, logs and runtime settings are the default project boundary.

Mypaisa-agent keeps tracking, its rules-based analysis and XIRR. Before retiring advanced Forecast/ML work there: agree the exact MA features/tickets in scope; inspect whether any are actually running; inventory historic forecasts, outcome records and user decisions; map approved requirements and UI states; prove parity where required; decide any optional export/import and reconcile quantities/cost basis/currencies/performance; verify history/backup/rollback; obtain explicit cutover consent; only then disable named advanced forecasting jobs/routes and close or supersede the appropriate MA work.

Do not automatically move MA Jira issues into MP or mark them Done. The local register supplies provenance. Target MP stories will be created from approved requirements, including deliberate differences and source links. Source dates/versions remain historical facts, not evidence of MP completion.

## 10. Scope, cost and readiness gates

All inherited capabilities are now recorded as target scope, including features that may arrive later. This is broader than the initial 20–30 asset cost example. The earlier £60/£65 cash envelopes are **initial-workload estimates, not a price guarantee for all 140 source stories, all markets and every model running simultaneously**. Re-estimate data entitlement/history, experiment count, model families, horizons, asset universe, LLM research/evals, storage and UI/build needs before approving a release. Keep staged activation and independent per-provider/per-job limits.

Before coding: review this scope and the full source register; settle long-term horizons, exact instruments/data capability and forecast/stance wording; select the training architecture; define market/theme/model contracts; complete layer-by-layer stories, acceptance criteria, test coverage and UX; then obtain the end-to-end requirements/design decision. Planning includes future China/Taiwan/Hong Kong/Europe and theme support without pretending those feeds, models or licences are already available.

Verification of this inventory checks uniqueness, the captured 70-core/70-related counts, complete source descriptions, target-capability mappings, valid local links and complete reference listings. It is a planning coverage check, not independent review, empirical model validation, an application test pass or retirement authorisation.
