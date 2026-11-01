# Requirements decision pack - round 1 investment/data lane

Reviewer: `/root/mp15_pack_investment_data_r1`, fresh context and read-only.
Snapshot: `snapshots/round-2/manifest.json` (pack round 1, MP-15 history entry 2).

**Result: no P1/P2 blockers; one P3 nonblocking finding.**

Reviewed I01–I05, D01–D02 and their cost/alert connections. The pack preserves confirmed investment/import scope, separates XIRR from comparable benchmark returns, requires forecast maturity and leakage controls, and distinguishes synthetic mechanics from predictive evidence. Deferred formulas, scientific thresholds, entitlements and action rules remain explicit readiness dependencies.

## MP15-PACK-R1-D1: D02 option ordering (P3)

Location: `docs/planning/aws-options-2026-11-01/requirements-decision-pack.md:444`, compared with option B at line 439. Also represented in JSON at lines 729/739 and HTML at lines 793/805 in the reviewed snapshot.

Option B offers to plan the research universe first, but shared details say to gather holdings and then propose the watchlist. If the owner selects B, this leaves an ambiguous next step. Make the shared detail order-neutral, or state that holdings-first ordering applies only to A.

Disposition: recorded, not applied in this round. This does not block the first C01–C03 cost choices. No further round is started solely for a nonblocking finding.

Limits: document review only. No empirical validation, private account/entitlement verification, regression execution or service access. Supplied gate results were accepted as prerequisites, not independently rerun.
