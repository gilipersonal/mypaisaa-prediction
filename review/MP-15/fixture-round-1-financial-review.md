# Synthetic import/operations fixtures - round 1 financial/document lane

Reviewer: `/root/mp15_fixture_financial_r1`, fresh context, read-only.
Snapshot: `snapshots/round-3/manifest.json` (fixture deliverable round 1, MP-15 history entry 3).

**Result: no actionable P1/P2/P3 findings.**

The reviewer independently reconciled both environments' PDF fields, expected extraction records, source positions/accounts/ledger, Decimal totals, quantity multiplied by currency-unit price, and recent-event extracts. Reviewed-file hashes matched the snapshot. All six PNG pages were visually inspected.

GBP/GBX treatment, partial-history/XIRR warnings, environment identities, token-rate arithmetic, unknown credit, billing staleness and the £60/£75/£85 scenarios are consistent and explicitly synthetic.

Limits: fixture consistency only. This does not validate real broker layouts, OCR/parser performance, actual billing/credit, historical prices, predictive accuracy or production affordability. No repository changes or paid/account operations were performed.
