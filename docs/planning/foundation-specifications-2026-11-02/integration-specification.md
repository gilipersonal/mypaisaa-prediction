# Foundation interfaces and acceptance boundaries

**MP-20 · 2 November 2026 · Maker specification draft · Architecture/UX/build unapproved**

This pack defines data and financial/scientific meaning before UI design. It depends semantically on the twelve selected directions in PR #9 at `34b0390`; that PR and its checkout remain unchanged. This branch starts from `origin/main` and adds planning artifacts only. The selected-direction receipt overrides historical £50/PostgreSQL/Agent-SDK assumptions still present in that base.

## The three handoffs

| Producer | Consumer | Contract obligations |
| --- | --- | --- |
| Source adapter and capability registry | Financial ledger/valuation and forecast feature builder | Canonical listing, ISO currency plus quote units, source/schema/revision/hash, economic/publication/ingestion/availability times, adjustment basis, per-use entitlement and quality |
| Published portfolio ledger | Performance/risk facts and research context | Owner/environment, pinned financial revision, committed manifest/receipt, complete event/cash-flow boundary, dated valuation/FX references and correction lineage |
| Qualified forecast/model/outcome registry | Portfolio decision policy, agents and future proof views | Exact task/horizon/origin/cutoff/maturity, price/currency/benchmark/calibration/model versions, immutable evidence, eligibility/state and limitations |

No consumer treats an uploaded byte, staged row, stream event, search index or newly trained artifact as published financial truth. Consumers see a pinned published revision. Numerical outputs and LLM explanations reference that same evidence version.

## Units, prices and clocks

Money, quantity, price and FX fields use finite decimal strings and named units. `GBX` is a quote unit normalised into GBP, not a silently interchangeable accounting currency. FX orientation is GBP per one unit of local currency: GBP value equals local amount times that dated rate. Historical comparison never substitutes a future or unlabelled latest FX rate.

For financial performance use raw normalised prices plus explicit cash income/fees under the ledger boundary. A separately specified adjusted/total-return model series has different semantics; adding the same dividends again would double count them. A forecast target must name its price/return basis. ETF market close, ETF fund NAV and an NAV-only fund valuation are not interchangeable outcome truths. Missing OHLC does not create candles or change an ETF into an OEIC.

A record's economic/effective date, evidenced publication time and actual MP ingestion time differ. Prospective `known_at` is conservative MP availability, at least actual ingestion and evidenced publication when both exist. Historical reconstruction uses a separately named evidenced replay-availability field/policy; it cannot rewrite the actual ingestion log or turn an assumed timestamp into vintage proof. Today’s retrospective LLM extraction has its own extraction/version/hindsight gate.

The owner confirmed formal horizons of next day plus 5/10/20 trading sessions, and 3/6/12 calendar months. Month anniversaries roll to the preceding eligible local session/valuation date when closed. Publication delay changes when an outcome can be scored, not which economic date it measures. Exact origin/finality tolerances and calendar invalid-day rules remain explicit engineering proposals. These forecast rules do not shift actual ledger cash-flow dates or change XIRR's declared year-fraction convention.

The proposed daily schedule separates acquisition start, retry, frozen information cutoff and issuance deadline. Collection and validation must complete before the cutoff, leaving positive processing time; an after-cutoff retry never backdates availability. Earnings release content is eligible only at a subsequent daily origin whose cutoff admits it. A prior-close event study using the realised release is descriptive evidence, excluded from predictive-feature qualification.

## Distinct meanings of loss and probability

Keep terminal return/loss, within-horizon running-peak maximum drawdown, origin-relative adverse excursion, realised cost-basis loss and portfolio drawdown separate. A portfolio withdrawal is not a market loss. Flow-adjusted drawdown needs adequate valuations around external flows; otherwise report it unavailable with a reason.

XIRR measures money-weighted realised performance; a rule score is a deterministic heuristic; an evaluated probability concerns a named future event; a preference-weighted rank combines eligible components; a long-range scenario is conditional on assumptions. None is automatically converted into another. Keep the confirmed 35% growth/40% protection/25% opportunity weights, with exact normalisation/missingness/eligibility still proposed.

A forecast issued after a market close may use only information permitted by its declared information cutoff. Its closed-market reference price is not an executable price at that later issue time. Contribution/strategy experiments must use the separately declared next feasible pricing/dealing convention and costs; they cannot assume a fill at an earlier close after observing later news. Cross-market inputs obey each task cutoff rather than a shared civil-date shortcut.

## Authority and eligibility

`observation_mode`, data quality, rights, model eligibility and approval state are independent dimensions. Synthetic observations may be excellent test fixtures but prove no live entitlement, quality, accuracy or cost. An unknown value is not a zero or neutral score.

Unverified rights block the specific live use. A conditional capability or pricing assumption must remain visible rather than masquerade as a live feature. Agents can prepare explanations and typed proposals; the financial write service and owner-bound confirmation own ledger changes. Training produces candidates; mature evidence and owner approval govern promotion. New workers and accounts do not create additional provider-credit pools.

Immutable financial event intents are sealed by stable IDs and acyclic content digests. Delivery state and delivery attempts remain outside sealed content. A publication pointer may reference the completed root; no leaf intent requires its enclosing root to be known before its own digest can be constructed. Exact projections and a computed synthetic proof are defined in the financial contract pack.

## Funding and resource accounting

Cost the aggregate dev/prod system with explicit endpoint/symbol credits, API/stream use, compute, training jobs, storage/backup, telemetry, builds, DNS and billing collection. Price SageMaker by actual allocated instance hours; a process working-set target does not reduce the price of the instance. Count every inner/outer/calibrator/final fit, target head, seed and ablation under explicit campaign/month caps. Resource caps are proposed bounds, not evidence a training workload fits them.

The £100 ceiling and £70 planned-operation/£30 reserve split are owner-confirmed. A full-functionality no-credit funding estimate is a counterfactual requirement if the policy refuses uncovered Claude calls. In the allowed no-verified-credit mode, those calls are blocked and features degrade explicitly. Paid Claude was approved for launch on 5 November 2026 (OWN-04, "Approve paid Claude at launch"), but picking it does not turn it on: paid calls still need the owner's explicit word when the time comes (AGENTS.md), and until then this blocked mode applies. Do not label blocked calls as actual paid cash usage or assume a shared credit balance is available. Price/tax/FX scenarios, vendor-rights evidence and public-service prices remain distinct.

**Confirmed collector cadence (DEC-025):** AWS billing daily; Anthropic usage/cost collection every six hours; internal usage estimates remain live. Credit allocation/freshness is separate evidence and cannot be inferred from those delayed reports. Credit counts only with proof under 30 minutes old, and an AWS report older than 36 hours holds relevant optional work (MP40-Q6, "Approve all three", 5 November 2026). MP-local reservations cannot prevent unrelated applications consuming a shared organisation pool; without trustworthy allocation/control evidence the dispatcher refuses credit-dependent calls. No change to other projects is authorised.

An amortised monthly run rate is not a monthly cash bill. Domain setup/renewal and other annual or upfront commitments enter the full cash forecast for their due month. Ordinary-month and invoice-month scenarios have separate cash admission and alert flags; the £30 reserve cannot silently finance a month above the £100 ceiling. Current domain and vendor terms remain assumptions, not purchase approvals.

## Before the architecture handoff

The coordinator reconciles disagreements in these handoffs, validates JSON/schema and hand-worked examples, maps cases/contracts to the existing MP tasks and gap IDs, and classifies unresolved owner decisions versus later live proofs. A source-to-phase map alone is not detailed acceptance parity. Independent review round 1 ran with separate approval and found five blocking specification issues; fixes and their document checks are recorded in the review state, and another review requires separate permission. No live acquisition, fitting, backtest execution, architecture proof in AWS, UX, application implementation or external publication is included.
