# Foundation Specification Pack 1

**2 November 2026 · MP-20 · Proposed specifications · Round 1 fixes verified and round 2 findings fixed (3 November 2026) · Architecture/UX/build unapproved**

**Consolidated 3 November 2026 (MP-20):** the owner's answers of 2 and 3 November are folded in ([below](#owner-decisions-since-this-pack-was-written)); the owner approved one review round for the consolidation, which ran as MP-20's round 2 on 3 November 2026 ([findings](../../../review/MP-20/round-2.md)).

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

## Owner decisions since this pack was written

The [decision log](../ma-reconciliation-2026-11-02/decision-log.md) is the authority. The MP-20 consolidation (3 November 2026) records these answers in [owner receipts](owner-decisions.json) (`later_owner_answers`), [selected directions](selected-directions.json) (`later_owner_answers` per direction) and the [fixed-policy snapshot](fixed-policies.json), and folds them into the area files. None approves the architecture baseline, UX or implementation.

- **Data (ARC-01, confirmed 2 Nov):** Yahoo Finance plus Twelve Data Grow 55 ($29 a month) in prod, Twelve Data Basic in dev, for the owner's personal hobby use. The owner accepted the published-terms risk (Yahoo forbids automated collection; Grow is labelled view-only) and contacts no vendor, so every vendor-right cell stays unknown and production rests on the recorded acceptance, never a grant. On 3 Nov: Yahoo kept for India too; UK funds tested on Grow 55 in its first month, else valued from the owner's statements; Indian funds from the owner's statements; gold and silver as XAU/USD and XAG/USD; a curated discovery universe of about 150 names on end-of-day data; watch-only listings and new markets added from chat after a coverage and credit check and the owner's confirm. DATA-07 is corrected: dividends and splits cost 20 credits per symbol and need Grow. [Data specification](data/specification.md).
- **Cost:** the £100 ceiling stands. Virginia; the existing domain renewed outside MP, so no domain line; no Apple Developer fee for now (free 7-day builds; if bought later, its month is the one allowed exception); GitHub Actions inside the free allowance; secrets in SSM Parameter Store. The MP-10 month-by-month view puts a month at about £46.48 with Claude blocked and £54.73 with Claude option A, plus up to £5 for the top-5 scan.
- **Infrastructure (MP-29):** us-east-1, Terraform only, network N0, AWS Organizations with all features and the cost-guard SCP, SSM SecureString, a read-only management-account role for the cost collector, global Claude inference. Production releases were to run through a workflow only the owner can start (3 November); the owner replaced that route on 24 November 2026 (MP203-08): a merge to main starts the release, which waits in the GitHub production environment for the owner's approval. Administrators can bypass environment rules by default (recorded 24 November 2026).
- **Forecasting:** all seven event kinds in the first event wave; similar days since 2015; bounded self-correction by code (5 points a week, 10% a month, automatic rollback); an 8-week shadow trial before promotion, with unscoreable weeks pausing the count; 4-week probation; automatic revert after 4 slipping weeks; restart after a pause stays with the owner; top 5 per segment by the 35/40/25 score; the contribution split live from launch, labelled experimental.
- **Claude (ARC-06b):** Haiku for triage, inputs and extraction; Opus for at most three event analyses a day, batched; Sonnet for chat, explanations, the briefing and judges.
- **Owner picks of 5 November 2026 (MP-184, recorded by MP-192):** the owner answered the [MP-184 question pack](../owner-question-pack-2026-11-05/answers.json). In this pack: paid Claude approved for launch (OWN-04), but picking it does not turn it on, and paid calls still need the owner's explicit word when the time comes; the Anthropic admin key adopted (MP40-Q5), its price and availability unverified; all three cost freshness rules (MP40-Q6: 36 hours, 30 minutes, the £15 kept above £85), with daily forecasts added to the £15 by the owner's "Yes, add them"; daily forecasts keep running past £85 (OWN-25); cuts at £75 in a set order (OWN-36); code may draft a budget raise (OWN-35); the proposed price freshness limits approved, the close grace still without a figure (OWN-07); a late price stays a data quality incident (ADM-06); Yahoo values already sent to Claude recorded and the outputs kept (ADM-07); trial, probation, restart, withdrawal and scenario answers (OWN-33, ADM-09, OWN-27, OWN-28, OWN-21, ADM-08, OWN-10); gold and silver from the provider's daily bar once cover is proven (OWN-26); and the financial display and ranking answers (OWN-14, OWN-19, OWN-31, OWN-09, OWN-15, OWN-17, OWN-20, OWN-32, OWN-18, ADM-20, MP40-Q8). SCI-D07, SCI-D08 and FIN-OD-04 are now partly answered; each area file says what stays open. The [policy register](policy-evidence-register.md) lists them.
- **Owner picks of 24 November 2026 (MP-203):** the owner answered the [MP-203 question pack](../owner-question-pack-2026-11-24/answers.json). In this pack: a browser's saved copy follows the same rule and time-out as the Apple app, the value still the owner's to set (MP203-01); no investment alert breaks quiet hours, and only a critical fault on a short named list may (MP203-02, MP203-03); a 3-month model on probation is judged on any pairs that mature in its 4 weeks, with clean running only when there are none (MP203-04); on range targets the strongest simple range baseline stands in for the rules under one standing approval, and every promotion is still the owner's (MP203-05); no 2% hurdle and no 95% interval in the trial, confirmed (MP203-06); a merge to main starts the production release, which waits in the GitHub production environment for the owner's approval, replacing the 3 November route (MP203-08); all seven event kinds stay the target, a kind no checked source covers shown as no source yet (MP203-09); the calendar of valuation days is the provider's bar days for gold and silver, a missing bar recorded as missing (MP203-10); and the Apple app's build and unit tests run in CI, with Maestro journeys and real-device builds staying on the owner's Mac (MP203-11). SCI-D03, SCI-D07 and SCI-D08 stay partly answered; each area file says what stays open.

Open questions for the owner from the data area are listed in [the data catalogue](data/catalogue.json) (DATA-DEC-13 to DATA-DEC-15; DATA-DEC-12 was answered on 3 November 2026: derived values only go to Claude).

## Budget feasibility remains conditional

*Owner, 2 and 3 Nov 2026:* the figures below are the pack's original scenarios. The owner has since chosen Grow 55 and moved the domain outside MP, so neither the $79 tier nor a domain invoice month applies to the selected options; see [owner decisions](#owner-decisions-since-this-pack-was-written) and the cost area for the current figures. The model's verdict stays as the cost area records it.

The [model](costs/model.json) includes both AWS environments with no free-tier deductions and separates allowable blocked-Claude mode from counterfactual cash-funded full functionality. Under its **assumed £0.80/USD and 20% tax** central scenario, the displayed Grow $79 option plus the Virginia AWS candidate is an amortised **£95.68 monthly run rate with Claude calls blocked**, above the £70 planned-operation allowance. Cash timing is different: the annual domain invoice month would require approximately **£108.88**, above the £100 cash ceiling. Full cash-funded Claude is an unauthorised counterfactual and also needs explicit invoice-month accounting.

A support-reported $29/55-credit Grow candidate produces an amortised £47.68 run rate and approximately £60.88 in the annual domain invoice month in the same blocked-Claude scenario, but current purchase terms, rights and coverage are unverified. Neither is an approved bill, regional selection or proven complete-system fit. The global £100 cash ceiling and £30 reserve remain unchanged. [Scenario source/evidence](costs/research.json).

No credit is assumed available. Model calls require separately verified coverage and approved policy. Paid Claude is approved for launch (OWN-04, 5 November 2026), but no paid call runs until the owner gives the word. The earlier cost-scenario chart was removed in MP-34 and remains in git history.

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
