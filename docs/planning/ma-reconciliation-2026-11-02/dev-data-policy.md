# Development data: synthetic fixtures and Twelve Data Basic

**Owner-requested planning refinement · 2 November 2026 · No provider setup or live calls**

Keep deterministic synthetic local/dev fixtures as the default for unit, financial, scientific, regression and UI-state tests. Consider Twelve Data Basic/Free as the preferred source for a small, explicitly enabled live dev integration profile. Production retains Yahoo Finance plus Twelve Data Grow as preferred candidates, subject to coverage, rights and the complete budget evidence. This is a source-policy direction, not production/feed activation.

## Verified public allowance

Official sources checked on 2 November 2026:

- [Individual pricing](https://twelvedata.com/pricing): Basic is free and lists 8 API credits per minute and 800 per day. Coverage and endpoint availability differ from paid plans; it is not proof of UK/India parity.
- [Credit accounting](https://support.twelvedata.com/en/articles/5615854-credits): endpoint weight times symbol count determines API credits; Basic's daily quota resets at midnight UTC. Multi-symbol batching does not make every symbol one shared credit.
- [Usage monitoring](https://support.twelvedata.com/en/articles/5713553-control-over-api-usage): response headers can report used/remaining credits; the `/api_usage` polling endpoint itself consumes one credit. Header semantics must not be assumed to establish both daily and minute balances.

Treat the allowance as **800 weighted credits**, not a universal allowance for 800 arbitrary HTTP calls. Verify actual account/endpoint/tier behaviour before later live use. Do not assume keys, environments, CI jobs or tools each receive a separate allowance.

## Proposed dev integration contract

1. Declare `synthetic`, `recorded_permitted` and `live_basic` modes explicitly. Normal unit/CI runs never contact a provider. Recorded source data may be retained/replayed only where its rights permit; otherwise use synthetic schema-compatible responses.
2. Centralise minute/day admission for every dev consumer sharing the actual provider allowance. Account for endpoint/symbol weight, concurrent jobs, manual exploration, history fetches and retries. A small request can be expensive if its endpoint has a high weight.
3. Keep ordinary use below the provider maximum so manual checks and bounded retries have headroom. The exact allocations/soft thresholds remain to specify; choosing Basic does not approve a new fixed budget split.
4. Handle 429 with bounded backoff appropriate to the exhausted minute/day quota; prevent retry storms and pause after daily exhaustion. Persist enough usage state to survive worker restarts. No automatic paid fallback or upgrade.
5. Show mode, source, timestamps, known usage/remaining allowance, throttling/reset and unsupported capabilities in dev health/cost views. Unknown balances remain unknown; a new local clock day in Europe/London does not reset the UTC provider quota.
6. Use only eligible listings/endpoints. UK/India and unsupported error states remain covered by synthetic fixtures until permitted live capabilities are established. Never present simulated prices as live observations.
7. Apply the same schema, precision, lineage, idempotency and security contracts as production. A cheaper data profile must not weaken them. Retention/training/derived-display/Anthropic-sharing permissions remain per-use checks.
8. Keep dev/prod write authority and usage attribution separate. Configuration must name the intended provider profile; no credential creation, purchase, AWS loading or deployment occurs now.

## Illustrative sizing

Assuming an eligible one-credit-per-symbol endpoint, with no other calls:

| Dev workload | Arithmetic | Daily credits |
| --- | --- | ---: |
| 10 instruments, 12 refreshes | 10 × 12 × 1 | 120 |
| 20 instruments, 20 refreshes | 20 × 20 × 1 | 400 |
| 30 instruments, 24 refreshes | 30 × 24 × 1 | 720 |

These examples are arithmetic, not approved schedules or coverage promises. History, metadata, extra endpoints and retries add to the totals. Minute-level limits also apply, so daily headroom alone does not permit an all-at-once 30-symbol burst. Dev does not need the full production refresh schedule to test the adapter.

## Acceptance evidence before live dev activation

A later authorised integration task must prove weighted admission under concurrent workers, UTC reset, restart recovery, minute/day 429 handling, bounded retries, unsupported endpoint/listing states, cancellation, schema parity and no-network default CI. It must verify the account/tier limits and exact data rights. Synthetic fixtures remain available when live quota is exhausted; switching a live response to simulated data must be explicit in the mode/label.
