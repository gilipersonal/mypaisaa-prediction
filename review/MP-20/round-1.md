# MP-20 independent review — round 1

Reviewed snapshot: `0ddf55eb66c58641883c5d7534524768872b3861`. Owner approval: `call_8649f5e68cfb4fc2886c5abc498e6cd3`, “Run review round 1 (Recommended)”. Scope: the complete Foundation Specification Pack 1 and its direct interfaces, with three fresh parallel lanes. The later maker fixes require a separately approved review round.

The document/schema/math validator, Ruff F and full branch whitespace gate passed before reviewers started. The approved full MP-20 regression runner returned zero prior checks, zero failures and zero outstanding manual items. Live provider, model, cloud and application acceptance remained outside scope. The 73 acceptance definitions at that snapshot were planned cases, not executed application tests.

| ID | Lane / fresh reviewer | Severity | Confirmed issue in reviewed snapshot | Required correction |
| --- | --- | --- | --- | --- |
| R1-C1 | Data and cost / `/root/mp20_r1_data_cost` | P2 blocking | A $15 annual domain fee became $1.25/month inside cash-ceiling calculations. The central Virginia Grow79 blocked-Claude invoice month needs £108.88 rather than the displayed £95.68 amortised run rate. | Separate amortised run rate from ordinary/invoice-month cash; evaluate actual due commitments and alerts. |
| R1-F1 | Financial / `/root/mp20_r1_financial` | P2 blocking | Immutable event intents require their enclosing manifest digest, while that digest depends on the intents. Own-digest exclusions are undefined. | Versioned acyclic leaf/chunk/page/root projections, stable intent IDs and an actual computed synthetic proof. |
| R1-F2 | Financial / `/root/mp20_r1_financial` | P2 blocking | Mutable dispatch status/attempt fields sit in immutable event-intent content covered by sealed hashes. | Separate immutable intents from delivery state and attempts; preserve sealed hashes across dispatch/retry. |
| R1-S1 | Forecasting and integration / `/root/mp20_r1_forecasting` | P2 blocking | Daily acquisition starts at close+60m, the same instant as the proposed information deadline. Positive latency makes timely data arrive after cutoff. | Separate acquisition, retry, cutoff and issuance clocks; test positive latency and late rejection. |
| R1-S2 | Forecasting and integration / `/root/mp20_r1_forecasting` | P2 blocking | A prior-close event origin requires release features that become known only later, allowing earnings leakage or an unusable module. | Separate pre-release inputs, subsequent-origin post-release prediction and descriptive prior-close event studies. |

All three reviewers reported no additional nonblocking findings. The explicit pending rights, policy and live-performance proofs remain pending; they were not misclassified as defects merely because they need later evidence.

After delivering their independent findings, the same three agents switched to maker roles for their bounded fixes. They are not independent reviewers of those fixes. A future round must use new fresh reviewers, review only these fixes and their direct joins, and run the full updated fixed-findings ledger with separate owner approval.

The review does not approve the architecture baseline, UX, implementation, publication, a PR, merging or issue closure. The cost figures remain illustrative under unverified price, FX, tax, rights and workload assumptions.
