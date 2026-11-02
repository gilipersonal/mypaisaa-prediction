# Foundation Specification Pack 1

**2 November 2026 · MP-20 · Proposed specifications · Round 1 findings fixed; verification pending · Architecture/UX/build unapproved**

This pack turns the selected architecture directions into precise data, financial and forecast contracts with worked examples, planned acceptance and quantitative cost assumptions. It is a local specification draft. The first independent review found five blocking issues; the changes addressing them await separate verification approval. It implements no application feature and runs no live acquisition, model, training, backtest, AWS account or deployment operation.

## Read the specification

| Read next | What it defines |
| --- | --- |
| [Integration specification](integration-specification.md) | Producer/consumer handoffs, units, clocks, price bases, financial truth, eligibility and funding boundaries |
| [Data/source specification](data/specification.md) | Real listing identities, source capabilities, per-use rights, timestamps/revisions, quotas and acquisition lifecycle |
| [Financial specification](financial/specification.md) | Controlled ledger/import publication, financial formulas, corrections, FX, benchmark, risk and ranking semantics |
| [Forecasting specification](forecasting/forecasting-specification.md) | Tasks/labels, seven horizons, model/feature ladder, chronology, calibration, evidence and promotion |
| [Cost specification](costs/specification.md) | Per-unit public prices, workload assumptions, regional scenarios, shared credits and the budget feasibility gate |
| [Policy and evidence register](policy-evidence-register.md) | Confirmed answers, proposed policy bundles and external/live evidence that remain open |
| [Coverage and deliverables](coverage.json) | Source-gap/task joins, artifact roles and actual-versus-planned verification |

Every area has structured JSON contracts/catalogues, synthetic examples, acceptance definitions, primary-source research and maker-check receipts. JSON Schema shape validation is not evidence that a future backend enforces the full cross-record policy.

[Fixed owner-policy snapshot](fixed-policies.json) resolves later decisions over earlier embedded pending values, including **AWS billing daily and Anthropic billing every six hours**. These are collection schedules; delayed billing is not credit-allocation proof.

## Owner-confirmed horizon detail

[Owner receipts](owner-decisions.json) add two decisions to the twelve source directions:

- **FND-DEC-001:** next day plus **5, 10 and 20 trading-day** formal points; retain 3/6/12-month forecasts and separate 3–5-year scenarios.
- **FND-DEC-002:** **calendar-month anniversaries**, rolled to the preceding valid local session/valuation date if closed. Score only once the canonical target-date value is available.

Exact daily cutoff/finality tolerances, calendar invalid-day conventions, financial precision, model/event thresholds, qualification policies and scenario assumptions remain explicit proposals. The confirmed 30-minute monitoring cadence is distinct from daily formal forecasts.

## Budget feasibility remains conditional

The [model](costs/model.json) includes both AWS environments with no free-tier deductions and separates allowable blocked-Claude mode from counterfactual cash-funded full functionality. Under its **assumed £0.80/USD and 20% tax** central scenario, the displayed Grow $79 option plus the Virginia AWS candidate is an amortised **£95.68 monthly run rate with Claude calls blocked**, above the £70 planned-operation allowance. Cash timing is different: the annual domain invoice month would require approximately **£108.88**, above the £100 cash ceiling. Full cash-funded Claude is an unauthorised counterfactual and also needs explicit invoice-month accounting.

A support-reported $29/55-credit Grow candidate produces an amortised £47.68 run rate and approximately £60.88 in the annual domain invoice month in the same blocked-Claude scenario, but current purchase terms, rights and coverage are unverified. Neither is an approved bill, regional selection or proven complete-system fit. The global £100 cash ceiling and £30 reserve remain unchanged. [Scenario source/evidence](costs/research.json).

No credit is assumed available. Model calls require separately verified coverage and approved policy. The earlier cost-scenario chart was removed in MP-34 and remains in git history.

## Source and branch boundary

The source decisions were pinned from PR #9 at `34b03900837428b51ddffcd637d92c1cd2a6fb1e`. That historical hash remains the provenance reference, not a claim about the current PR head. Its twelve decisions and published planning-draft pages do not authorise UX/build. [Source pins](source-pins.json) and [selected-direction snapshot](selected-directions.json) identify exactly what this work used.

This `MP-20-foundation-specifications` branch originally started at `origin/main` commit `68ad1bf`, without changing the source checkpoint. In the later owner-requested README/PR consolidation, the MP-19 branch and saved future-design note were merged into this delivery branch, and root navigation was updated. The [later policy journal](../foundation-policy-discussion-2026-11-02.md) records twelve further selections awaiting detailed contract integration. The [original navigation proposal](navigation-change-proposal.md) remains decision history. Current owner instructions and selected directions supersede historical £50/local-PostgreSQL/Agent-SDK assumptions; delivery does not approve the complete architecture.

MP-20 coordinates the pack. Existing MP-10/12/21/22/24/29 are reused and In Progress; this pack does not close their full acceptance or the 52 source gaps. Actual owner holdings and PDFs/screenshots remain deferred; examples use real instrument identities with explicitly simulated observations and fictional accounts.

## Verification and authority

Run:

```
uv run --no-project --with jsonschema==4.25.1 python docs/planning/foundation-specifications-2026-11-02/validate.py
```

The offline command requires the pinned PR #9 Git object from the reference history; a fresh shallow checkout must obtain that authorised reference separately. The checker itself performs no network fetch.

The [validation receipt](validation.json) records document/schema/math/provenance checks. It covers 37 positive wire records, strict negative format/scalar cases, 15 financial plus 15 scientific worked examples, 108 amortised run-rate variants and 216 invoice-timing cash variants and source/reference consistency. The area acceptance cases are **planned backend/live tests**, not executed integration tests. [Maker verification](MAKER-CHECKS.md).

Independent review round 1 ran in three fresh parallel lanes after the document gates and the full MP-20 regression gate (zero prior checks, zero manual items). It found five blocking specification issues: invoice-month cash timing; acyclic content hashing; immutable intents versus delivery state; acquisition/cutoff timing; and pre/post-release feature availability. The fixes have focused document checks, but independent verification of those fixes has not run. A second round requires separate approval and covers only these fixes and their direct connections. See the [review state](../../../review/MP-20/state.json) and [fixed-findings ledger](../../../review/MP-20/fixed.json). Git PR creation and merge are now separately requested for the README/planning delivery. No new Confluence page, Site or Lucid document is published by it. The five-page Confluence publication proposal prepared earlier was removed in MP-34 and remains in git history. Full architecture/phase/story sign-off precedes UX; complete end-to-end/admin UX and explicit permission precede implementation.
