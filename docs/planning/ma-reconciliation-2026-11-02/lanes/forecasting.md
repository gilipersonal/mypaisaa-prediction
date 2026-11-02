# Forecasting, holdings and data reconciliation

**MP-19 · 2 November 2026 · Maker planning, unreviewed · No implementation**

MA provides concepts and a structured source record. It does not choose MP algorithms, providers, thresholds, screen designs or spending. The MP owner discussions control conflicts. This lane read 16 assigned MA pages in full HTML and the corresponding repository sections; the source snapshot and versions are in `forecasting.json` and `forecasting-evidence/`. Embedded media and linked boards were not fully visually inspected.

## What is already present in MP

The existing forecasting scope preserves F1–F8, rules/ML side-by-side, investment ledger/XIRR, exposure-based news, controlled learning and UK/US/India extensions. It already rejects MA’s fixed eight-week gate as proof for every horizon, daily autonomous live calibration, heuristic confidence as a calibrated probability, and inherited provider/budget assumptions. These are retained corrections, not newly discovered omissions. The remaining gaps below concern contracts, evidence and choices, rather than absent headline capabilities.

## Decisions that block architecture freeze

1. **Data rights and cost feasibility:** the selected source combination must legally and technically support storage, scheduled analysis, model training and permitted LLM processing. Twelve Data’s current page distinguishes internal display from non-display; Grow cannot be assumed to authorise all ML uses. Seek clarification. This is an unresolved entitlement question, not a conclusion that Grow is unusable.
2. **Forecast task catalogue:** approve targets and maturity conventions for next day, 5–20 trading days, 3/6/12 months, plus distinct 3–5-year scenarios.
3. **Scientific protocol:** approve bounded model families, baselines, folds, purging, calibration, effective-evidence criteria and model/promotion policy.
4. **Portfolio decision policy:** settle cash-flow/FX/benchmark semantics, risk and exposure eligibility, score composition and abstention.
5. **Information contracts:** settle the evidence and state payloads before UX begins; MA screenshots remain reference material.

## Research-based MP recommendations

These are proposed choices for owner review, not accepted ADRs. Start with transparent baselines and bounded CPU challenger families; do not equate adding models with increasing accuracy. Return predictability is empirically contested: [Goyal/Welch](https://www.nber.org/papers/w10483) found poor results for the examined predictors, while [Campbell/Thompson](https://www.nber.org/papers/w11468) found small useful gains under restrictions. MP therefore needs an honest baseline comparison and usable abstention, without an accuracy promise.

Use [rolling-origin evaluation](https://otexts.com/fpp3/toolbox.html), an explicit label-overlap policy beyond a generic [time-series split](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html), independent chronological [calibration data](https://scikit-learn.org/stable/modules/calibration.html), and all-trials experiment records informed by [backtest-overfitting research](https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf). Conformal intervals need procedure-specific coverage tests under drift, not a generic guarantee; see [Gibbs/Candes](https://jmlr.org/papers/v25/22-1218.html).

A [FRED vintage](https://fred.stlouisfed.org/docs/api/fred/series_observations.html) can help reconstruct historical macro availability. Current constituent files, revised macro, adjusted prices and retrospective LLM extraction require their own contamination assessment. Unknown historical provenance is a limitation to expose, not a field name that makes data point-in-time.

The [Twelve Data pricing](https://twelvedata.com/pricing) and [terms](https://twelvedata.com/terms) require per-use confirmation; [yfinance](https://github.com/ranaroussi/yfinance) directs users to Yahoo data terms. The owner’s Yahoo/Grow direction remains intact pending verification. No new feed or subscription is approved here.

## Gap packages and acceptance criteria

### FC-01 · Resolve provider use rights and actual data coverage

**Source concept:** Free-first per-kind chains, optional paid fallback and ten-year history.

**MP evidence:** MP-10; docs/planning/aws-options-2026-11-01/forecasting-scope.md CAP-01; L3-S01; exact Grow tier and rights unresolved.

**Recommendation:** Keep Yahoo plus requested Grow as candidate sources. Require a per-listing/per-use rights matrix and fallback-to-daily/unavailable. Grow pricing/terms do not establish non-display ML rights for this use; request provider clarification. No paid upgrade or LLM transmission assumed.

**Owner decision:** Approve verified source/tier/rights and taxed GBP recurring envelope, or choose reduced coverage before architecture freeze.

**Phase:** PH-03 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- Record quote/NAV/history/actions/exposures/news capability, delay, cadence, credit weight and storage/training/derived-data/Anthropic-sharing permission per source.
- Expose unsupported/stale states; no automatic provider upgrade.
- Verify UK/US/India examples and compare full monthly costs against £70 operating allowance and £100 total ceiling.

Source pages: [1147045](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1147045), [1704037](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704037), [1671250](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1671250), [197313](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/197313).

### FC-02 · Define every forecast target and maturity contract

**Source concept:** One principal four-week horizon plus analog 5/20/60-day outcomes.

**MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md ForecastTask/Horizon; L4-S01; selected horizons exist without fully agreed target formulas.

**Recommendation:** Define daily as-of origins for next-day, 5-20 trading-day and 3/6/12-calendar-month tasks. Specify terminal total return versus within-horizon drawdown as separate targets; 3-5-year outputs are conditional scenarios. Thirty-minute monitoring never creates a fresh formal forecast by implication.

**Owner decision:** Approve target catalogue, horizon list, origin cutoff, calendars, total-return convention and event thresholds.

**Phase:** PH-04 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- Each task pins target equation/unit, origin/cutoff, calendar roll, maturity, canonical source, baseline and metrics.
- Distinguish terminal loss from maximum drawdown, cost-basis loss and portfolio peak drawdown.
- Fixtures cover holidays, split/dividend, delayed NAV, FX and stale origins.

Source pages: [1704037](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704037), [328039](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/328039), [1147045](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1147045).

### FC-03 · Make historical datasets genuinely point in time

**Source concept:** F1 ten-year Parquet lake with known-at data and exposure maps.

**MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md F1; L3-S02; source vintage availability unproven.

**Recommendation:** Require three times for observations (economic, known-at/publication, ingestion), revision lineage and versioned universe/exposures. Current adjusted prices, macro revisions, constituents and LLM extraction cannot be silently projected into past origins.

**Owner decision:** Approve first feature/data catalogue and classify sources as vintage-backed, lag-conservative, prospective-only or unavailable.

**Phase:** PH-03 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- Dataset manifest records source/query/cutoff/content hashes, actions and universe/exposure versions.
- Delisted/merged instruments and discontinued funds are addressed; missing history is explicit.
- Contaminated or reconstructable-only features excluded from claimed historical edge; prospective evidence separate.

Source pages: [1704037](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704037), [1769493](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1769493), [1147045](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1147045).

### FC-04 · Specify a bounded experiment and leakage-control protocol

**Source concept:** F2 walk-forward and last-two-year holdout.

**MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md F2; L4-S03; exact folds/search/selection limits open.

**Recommendation:** Choose rolling/expanding chronological origins with label-interval purging and training-only transformations. Group instruments by common time boundaries, account for serial/cross-asset dependence, record all trials and limit search. Final holdout is untouched until a frozen candidate comparison.

**Owner decision:** Approve fold schedule per horizon, search budget, selection loss, uncertainty method and final-test reuse policy.

**Phase:** PH-04 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- Leakage challenge cases fail for revised macro, future constituents, overlapping labels and extraction hindsight.
- All transforms/features/calibrators fit within permissible training data.
- Report paired baseline deltas, effective sample limits, subgroup performance and experiment count, not a best backtest alone.

Source pages: [1704037](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704037), [328039](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/328039), [66125](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/66125).

### FC-05 · Fix the initial model catalogue without inventing model counts

**Source concept:** F3-F5 mood/risk/analogs/direction described as several conceptual models.

**MP evidence:** docs/architecture-deep-dive.md proposes two CPU trainable families; no approved per-task model registry.

**Recommendation:** Retain deterministic rules/statistical benchmarks and propose two CPU trainable families: regularised linear/logistic baselines and gradient-boosted/quantile challengers. Regime definitions and analog/event engines are explicit modules. Exact class/task/horizon artefacts follow evidence, not one model per ticker. SageMaker selection is separate infrastructure decision.

**Owner decision:** Approve candidate families, supported tasks, training cadence and bounded experiment count before final cost model.

**Phase:** PH-04 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- Catalogue separates rules, statistics, learned estimators, calibration and explanations.
- Each artefact has task/horizon/kind/eligible-universe/features/schema/dependencies/resource cap.
- Do not claim one trained object serves every market/horizon or that two families equal only two artefacts.

Source pages: [1704037](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704037), [328039](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/328039), [197273](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/197273).

### FC-06 · Make analog and event evidence horizon-aware

**Source concept:** Thirty nearest neighbours excluding last20days; low-evidence label below8events.

**MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md explicitly flags horizon-aware exclusion and sparse event caveat; L4-S04.

**Recommendation:** Retain analog explanations but exclude candidates whose target outcome was not known at the origin; overlap/effective sample and distances must be visible. Event windows and confounding need predeclared definitions; eight events is not proof of an edge.

**Owner decision:** Approve analog feature/distance/window, weighting, de-overlap and sparse-evidence rules.

**Phase:** PH-04 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- Separate descriptive historical associations from causal claims.
- Report sample dates/count/effective dependence, similarity, outcomes/interval and coverage.
- Events known after the prediction origin cannot select the study cohort.

Source pages: [1704037](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704037), [1769493](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1769493).

### FC-07 · Separate rule strength from calibrated forecast probability

**Source concept:** Heuristic confidence formula shown as percentage and daily map tuning.

**MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md already separates rule strength and owner-approved calibration; L4-S02/L4-S05/L4-S08.

**Recommendation:** Keep rule strength as a labelled heuristic until its event definition and calibration evidence are approved. Calibrators train on held-out chronological predictions; evaluate proper scores, reliability and interval coverage/width by horizon and important subgroup. No daily live recalibration without owner permission.

**Owner decision:** Approve calibration methods, loss functions, reliability bins/minimum evidence and rollback policy.

**Phase:** PH-04 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- No rule percentage silently displayed as P(up).
- Report Brier/log loss versus event base rates and range coverage plus sharpness; abstain where unsupported.
- Calibration version and approval bind every released forecast; model and calibrator cannot silently diverge.

Source pages: [1147045](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1147045), [1704037](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704037), [66125](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/66125).

### FC-08 · Design long-horizon investment inference independently of the four-week model

**Source concept:** MA emphasises four-week risk-first forecasting.

**MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md adds3/6/12months and3-5year scenarios; target-specific evidence not complete.

**Recommendation:** Use horizon-specific targets, data sufficiency and benchmarks. For long horizons consider simple valuation/fundamental/macro summaries only where licensed and truly known at time; compare against historical/constant-return and risk baselines. Scenarios use explicit contribution/return/inflation/FX assumptions, not fabricated confidence.

**Owner decision:** Approve scope/inputs/benchmarks for each long horizon and what may remain unavailable pending evidence.

**Phase:** PH-04 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- Keep all agreed horizons in requirements; do not replace them with20-day outputs.
- Display evaluated forecasts versus conditional scenarios with different labels and provenance.
- Account for few independent12-month outcomes and avoid claiming10years means thousands of independent yearly examples.

Source pages: [1704037](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704037), [328039](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/328039), [1409199](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1409199).

### FC-09 · Replace calendar-only practice gates with evidence and approval

**Source concept:** Eight live weeks above base rate/rules, automatic switch-off after four weak weeks.

**MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md explicitly supersedes eight-week proof and automatic promotion; L4-S08.

**Recommendation:** Define task-specific shadow minimums using mature outcomes, effective independence, baseline deltas and confidence, plus owner promotion. Preapprove a narrow safety-disable route; distinguish data outage/model-ineligible from statistical deterioration.

**Owner decision:** Approve entry/promotion/monitoring/pause/rollback criteria and evidence minimums by horizon.

**Phase:** PH-04 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- Eight weeks cannot validate a12-month forecast.
- Promotion references immutable data/model/calibration/evaluation evidence and previous safe version.
- Safety disable preserves immutable forecasts and marks affected displays; return to live follows approved policy.

Source pages: [1704037](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704037), [197253](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/197253), [328039](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/328039), [66125](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/66125).

### FC-10 · Close realised-performance and benchmark accounting decisions

**Source concept:** Dated-flow XIRR from MA wealth maths.

**MP evidence:** docs/planning/layered-development-2026-11-01/portfolio-import-spec.md L1-Q01/Q05/Q06/Q10 and L3-S03 already capture unresolved semantics.

**Recommendation:** Reuse MP ledger boundary decisions; define portfolio/account/holding XIRR separately and benchmark contributions with matched dates/currencies. Retained dividends, reinvestment and transfers are not duplicate external flows. Add time-weighted comparison only when valuation evidence supports it; no extrapolated missing history.

**Owner decision:** Approve rounding/residual tolerances, FX timing, terminal valuation, root ambiguity, benchmark and supported performance methods.

**Phase:** PH-03 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- Golden cases include same-day, missing history, multiple roots, internal transfer, fees/dividends and FX.
- Reconcile booked cash/cost basis separately from quote-adjusted total-return series.
- State unavailable per metric and preserve working/provenance; XIRR never serves as predictive probability.

Source pages: [1409199](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1409199), [1442042](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1442042), [327979](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/327979), [1671250](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1671250).

### FC-11 · Specify portfolio exposure and risk without false precision

**Source concept:** Look-through, HHI, overlap, currency and kind-specific driver maps.

**MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md CAP-08; L3-S04 and L6-S02 are broad drafts.

**Recommendation:** Define portfolio snapshots, weight basis, partial coverage, cash and cross-listed exposure before ranking. Separate instrument trading currency from underlying economic exposure and hedging. Estimate correlations/covariance on aligned eligible data with declared shrinkage/missingness and stress alternatives.

**Owner decision:** Approve exposure completeness thresholds, risk windows and benchmark/weight conventions.

**Phase:** PH-03 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- Double-listed securities and fund overlap do not double-count underlying economic risk.
- Coverage residual and source age visible; absent exposure is not zero.
- Show investment versus FX return effects and use partial-data abstention for unsupported portfolio-risk estimates.

Source pages: [1147045](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1147045), [1442042](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1442042), [1769493](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1769493).

### FC-12 · Make ranked actions a deterministic versioned decision policy

**Source concept:** Stance cascade, protected positions and contribution steering.

**MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md CAP-03/CAP-09; owner weights growth35/protection40/opportunity25; detailed mapping open.

**Recommendation:** Define component eligibility/scaling and action semantics before combining scores. Growth/risk/benchmark evidence must be comparable or explicitly unavailable. Distinguish forecast probability, preference-weighted ranking and portfolio constraint; explain conflicts and ask owner for any change.

**Owner decision:** Approve score normalisation, abstention/conflict policy, concentration/contribution constraints and recommendation wording.

**Phase:** PH-06 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- Show component scores/weights/source/version and counterfactual portfolio impact.
- Missing component does not silently earn neutral/full score; disclose approved renormalisation policy.
- No trade execution, universal sell-everything instruction, tax-rule assumptions or autonomous contribution changes.

Source pages: [1147045](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1147045), [197253](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/197253), [1769493](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1769493).

### FC-13 · Evaluate LLM-derived news factors separately from narrative quality

**Source concept:** Haiku batches tag stories and exposure code scores relevance.

**MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md R0/M1/M2/M3 ablation ladder; L5-S01; exact schemas/datasets/usage rights open.

**Recommendation:** Freeze extraction schema/entity links/source rights, publication/extraction times and model/prompt versions. Test extraction accuracy and downstream incremental predictive value separately. Historical extraction by a newer LLM is potentially hindsight-contaminated; prospective shadow is the default when contamination cannot be bounded.

**Owner decision:** Approve factor catalogue, labelled extraction sample, provenance requirements, relevance floor and ablation criteria.

**Phase:** PH-05 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- No live-risk dependency on a batch not guaranteed complete by deadline.
- Every financial number and relevance weight computed from authorised typed inputs.
- LLM judge cannot manufacture price ground truth or override promotion/admission controls.

Source pages: [1704037](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704037), [328019](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/328019), [1769493](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1769493).

### FC-14 · Treat patterns as tested features rather than asserted alpha

**Source concept:** F8 candles/charts/technical features with per-holding event studies.

**MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md F8; L4-S06; full detector/confirmation specification pending.

**Recommendation:** Preserve pattern research concept but predefine detector, lag, confirmation, parameter grid and eligible kinds. Compare incremental effect against simple trend/risk baseline after multiple-testing controls and costs. NAV-only funds get only compatible line patterns.

**Owner decision:** Approve initial bounded pattern set and promotion/retirement evidence; wider catalogue remains planned.

**Phase:** PH-04 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- No look-ahead extrema or chart labelling using future bars.
- Hand-marked detector cases separate from out-of-sample value tests.
- Source-adjustment/corporate-action artefacts and thin trading do not create fake pattern signals.

Source pages: [1704037](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704037), [328039](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/328039), [1147045](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1147045).

### FC-15 · Validate each market and instrument family before extension

**Source concept:** India market basket, free NAV and CAS; new kinds plugged into registry.

**MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md initialUS/UK/India and futureAsia/Europe contracts; PH-09 broad.

**Recommendation:** Make exchange/session/calendar, corporate-action/unit/price semantics, entitlements, historical universe and test evidence explicit capabilities. India is part of initial requirements rather than a copied final phase. Each future market/theme/model follows approved extension checklist with separate source/cost validity.

**Owner decision:** Approve v1 supported kinds, India NAV scope, exchange calendars and per-market readiness tests; defer unsupported families explicitly.

**Phase:** PH-03 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- US/UK/India each has source/identity/FX/action/calendar/forecast evidence examples.
- GBX versus GBP, NSE/BSE linkage, accumulation/distribution and direct/regular mutual-fund plans are distinct.
- Future China/Taiwan/HK/Europe configuration cannot bypass rights or scientific gates.

Source pages: [1671250](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1671250), [197313](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/197313), [197273](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/197273).

### FC-16 · Fix the forecast information contract before drawing screens

**Source concept:** Risk-first forecasts, proof page, model sheets and unavailable/in-practice states.

**MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md CAP-10/CAP-16 and L6-S03; MA board choices not MP-approved.

**Recommendation:** Agree content/state and provenance contracts before UX. Preserve forecast/proof/track record plus disagreement, stale, insufficient history, no-clear-view, disabled, corrected-outcome and cost-paused states. Actual layout/style/options come later.

**Owner decision:** Approve information hierarchy, action labels and required proof/state payloads; do not approve MA branding or mock values.

**Phase:** PH-06 · **Disposition:** adapt_and_specify

Acceptance to capture in the detailed MP stories:

- Each displayed number identifies task/as-of/source/model and whether evaluated, illustrative or scenario.
- Proof contains dataset/fold/baseline/mature outcomes/eligibility and limitations, with accessible text alternatives.
- Chat deep-links exact evidence context; offline/stale data cannot masquerade as fresh analysis.

Source pages: [1704037](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704037), [328039](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/328039), [327999](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/327999), [197233](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/197233).

## Source coverage and limits

| MA page | Version | Concepts | Read depth |
| --- | --- | --- | --- |
| [🔮 §19 · The Forecaster](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704037) | 13 | F1 known-at data; F2 walk-forward lab; F3 regime and downside; F4 analogs/events; F5 distributions; F6 proof; F7 contribution experiments; F8 technical patterns; practice/promotion/off-switch | Full HTML plus relevant repository text; media visual coverage unverified |
| [📈 The Market Agent, end to end](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1769493) | 7 | integrated market path; source chain; exposure-weighted news; two engines; learning and portfolio experiments; India adaptation | Full HTML plus relevant repository text; media visual coverage unverified |
| [📡 §5 to §7 · Prices, FX and the rules engine](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1147045) | 12 | per-kind provider adapters; look-through; FX/calendar contracts; deterministic indicators/pillars; stance cascade; heuristic strength; bootstrap distribution; research cards | Full HTML plus relevant repository text; media visual coverage unverified |
| [🗂️ §4 · The holdings registry and the data model](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1442042) | 15 | listing/record/event identities; audited imports; typed instrument kinds; source provenance; dated FX and scoped ledger | Full HTML plus relevant repository text; media visual coverage unverified |
| [🇮🇳 §22 · Indian markets](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1671250) | 6 | India instrument/account identities; CAS/broker import; NAV versus candles; local calendar and macro basket; INR/GBP | Full HTML plus relevant repository text; media visual coverage unverified |
| [🧮 §6.6 · The wealth maths](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1409199) | 10 | dated-flow XIRR; missing-history refusal; portfolio/account scopes; wealth functions not all relevant to MP | Full HTML plus relevant repository text; media visual coverage unverified |
| [Phase 10 · Prices and the engine](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/294982) | 16 | price quality and source chains; known-answer rules tests; phase dependencies | Full HTML plus relevant repository text; media visual coverage unverified |
| [Phase 11 · Briefs, alerts, charts, technical mode](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/327999) | 20 | brief/alert/chart contracts; technical mode; delivery evidence | Full HTML plus relevant repository text; media visual coverage unverified |
| [Phase 12 · Ask anything: research cards and scenarios](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/197233) | 22 | source-grounded research cards; scenario versus forecast distinction; portfolio comparison | Full HTML plus relevant repository text; media visual coverage unverified |
| [Phase 13 · Track record and calibration](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/66125) | 20 | immutable calls; mature outcomes; reliability and calibration; review scorecards | Full HTML plus relevant repository text; media visual coverage unverified |
| [Phase 14 · News, events, sentiment (shadow)](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/328019) | 17 | deduplicated news; sentiment shadow; tag quality sampling; no unsupported alert | Full HTML plus relevant repository text; media visual coverage unverified |
| [Phase 15 · Stances go live](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/197253) | 19 | eligibility gate; protected positions; bounded suggestions; safe unavailable state | Full HTML plus relevant repository text; media visual coverage unverified |
| [Phase 16 · New kinds of holding (when you add one)](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/197273) | 5 | extensible instrument kind; fundamental/valuation capability; source costs not inherited | Full HTML plus relevant repository text; media visual coverage unverified |
| [Phase 17 · The Forecaster: a second engine beside the rules engine](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/328039) | 24 | complete F1-F8 phase decomposition; model/strategy evidence; forecast proof and absent/stale states | Full HTML plus relevant repository text; media visual coverage unverified |
| [Phase 19 · Indian markets and the existing Indian portfolio](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/197313) | 20 | Indian identities and imports; source/calendar/FX validation; market-specific gates | Full HTML plus relevant repository text; media visual coverage unverified |
| [Phase 5 · Investments, priced](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/327979) | 16 | investment records and imports; dated cash flows; daily valuation; incomplete history; XIRR/holding evidence | Full HTML plus relevant repository text; media visual coverage unverified |

The structured lane register contains **72 concept clauses** linked to **16 gap packages**. This count describes the lane’s explicit concepts, not every sentence or acceptance criterion in the source. The pre-existing 140-source-story register remains the complete captured original story wording. Cross-lane reconciliation, owner decisions, actual MP story keys and Confluence publication are coordinator responsibilities.

No MA file/page/issue changed. No application code, empirical fitting, paid-provider call, deployment or independent review ran.
