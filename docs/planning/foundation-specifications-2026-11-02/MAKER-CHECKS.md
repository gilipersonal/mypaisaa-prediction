# Foundation maker verification

**MP-20 · 2 November 2026 · Unreviewed specification draft**

The checks cover documentation, schemas, synthetic wire examples, hand-worked arithmetic, provenance and the proposed cost model. They do not execute a financial backend, scientific evaluator, training job, identity service, cloud stack or real ledger.

## Passed document checks

- Parse the structured artifacts and validate the three schema containers/internal references. There are six data definitions, 28 financial definitions including nested types (18 primary FIN contracts), and 15 scientific definitions including nested types (seven primary wire records).
- Validate 34 complete positive records: nine data/listing/capability/action records, 18 financial records and seven scientific records.
- Reject malformed scalar/record examples. Date/time checks explicitly reject malformed strings, impossible calendar dates and missing timezones. JSON Schema's optional format support alone was insufficient; the checker registers a strict timezone-aware ISO subset. Nullable fields retain JSON Schema format semantics.
- Recompute known-answer financial cases with exact Fraction arithmetic, including 10% unique XIRR, 10%/20% multiple roots, cash/NAV, GBX, FX, TWR/drawdown, benchmark, exposure and ranking.
- Recompute eight scientific numerical cases with Decimal, including return versus MDD/MAE, GBP FX effect, splits/dividends, GBX, Brier corrections and benchmark excess. The 15 scientific examples also carry explicit synthetic/not-holdings status.
- Recompute all line products, environment/region totals and 108 cash variants across six proposed region/workload cases. Check project-wide fit/CPU/instance caps and dimensions; no arbitrary memory proration or free-tier deduction.
- Verify owner-confirmed horizons, source Git object hashes, contract/example/acceptance references, companion artifact hashes and local Markdown links. Thirty financial acceptance definitions reference the 16 earlier L1 story drafts; this is not actual implementation Jira readiness.
- Inspect the generated cost illustration as maker output for labels, budget lines, conditional lower-price and unauthorised counterfactual distinctions. The figure is a document artifact, not a product UX design or live cost dashboard.

A maker schema check caught an over-escaped SCI decimal expression; positive/negative scalar and full wire checks now cover it. Exact arithmetic corrected an intermediate weighted-score draft to 71. The coordinator reconciled fit-count and actual allocated SageMaker-memory units across the scientific/cost documents. These are maker fixes, not independent-review findings.

## Not executed or proven

The 73 area acceptance definitions remain planned; no app integration/live acceptance pass is claimed. No XIRR solver, model estimator, backtest engine, OCR/provider agent or cost collector was implemented. No actual source rights, purchased plan price, account quota, tax/FX invoice treatment, credit balance, region/runtime resource fit, training duration, restore, production atomicity or empirical predictive skill is established by these document checks.

Backend, browser, native, deployment and provider suites were not rerun: those components are untouched in this branch, and this package has no executable product component. Before a separately requested PR, run its applicable configured checks and report that CI independently.

Independent review and the real MP-20 regression ledger have not run. No new Confluence/Site/Lucid publication or PR is authorised. Existing source PR #9 remains the pinned checkpoint. Root navigation integration and the five-page reading/attachment scope are proposals only.

Reproduce the main check with:

```
uv run --no-project --with jsonschema==4.25.1 python docs/planning/foundation-specifications-2026-11-02/validate.py
```

The report-only stray sweep found no strays or suspects; it stopped nothing. A server belonging to another live project was left untouched.
