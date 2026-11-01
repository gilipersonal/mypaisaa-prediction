# Layer 1: portfolio, imports and the investment ledger

**MP / Mypaisaa Prediction · PH-01 · Draft 0.1 for review · 1 November 2026**  
**Not implemented. End-to-end requirements, UX and architecture selection remain unapproved.**

[Planning index](README.md) · [Phased plan](phased-delivery-plan.md) · [Architecture](architecture-blueprint.md) · [Technology matrix](tech-stack-matrix.md) · [Story contracts](portfolio-import-stories.json) · [Entity contracts](portfolio-import-contracts.json) · [Worked examples](portfolio-import-examples.json)

## 1. Outcome, authority and boundaries

Give the owner a trustworthy investment record: what is held, in which account and listing, what happened, where each fact came from, which figures can be computed, and what remains unknown. Imports must be reviewable, reproducible, idempotent and reversible through an auditable correction process. A statement becoming available is not the same as a financial change being applied.

DEC-001–041 in the [decision register](../aws-options-2026-11-01/product-decisions.json) are the current owner decisions. This layer expands them into proposed contracts and acceptance criteria; it does not approve the unasked defaults. DEC-041 makes synthetic local/dev work the current phase. Actual holdings and broker screenshots/PDFs will arrive progressively later and are not a prerequisite for this specification.

The application is independent of mypaisa-agent. It owns its own investment accounts, source documents, ledger, observations and conversations. No shared production ledger or migration is assumed. It records historical investment events and suggestions; it never executes a trade or requests broker trading credentials.

Initial analysis covers UK/US/India equities and ETFs, with versioned extension points for further markets and instruments. Account/wrapper context and the captured Indian CAS/fund-import requirements are retained as planned contracts; supported institution/layout families must be agreed and tested. A new unsupported instrument type, accounting action or jurisdiction policy requires a compatible implementation and evidence, not arbitrary unvalidated configuration.

**Present evidence:** health/sample SSE starter; validated synthetic market/ledger packs for 30 real instrument IDs; generic synthetic PDF/raster companions and expected extraction records. **Absent:** a production import API, parser/OCR service, financial repository, transaction commit engine, Cognito implementation or portfolio UI. Planning/story status cannot certify those features.

## 2. Journeys and first-version input coverage

The same durable workflow serves PWA, native Apple clients and contextual chat. A chat attachment is an entry point to the import process, not a separate financial authority. Human confirmation occurs through an authenticated owner flow; the document, model and research agent cannot confirm on the owner's behalf.

| Journey | Proposed behaviour | Evidence needed before release |
| --- | --- | --- |
| Structured history | CSV and a versioned Excel workbook map accounts, holdings, transactions and valuations; preview row-level results before applying | Generic templates, field/date/currency errors, duplicate/reprocess and large-history tests |
| PDF statement | Supported text layouts use code extraction; unsupported layouts enter a bounded assisted draft/review flow | Generic synthetic foundation plus qualified target broker/CAS families; incomplete/rotated/encrypted/malformed tests |
| Screenshot | Extract visible facts with page/image regions, source timestamp and uncertainty; distinguish snapshot from dated history | Current clean raster fixtures plus later cropped/blurred/photographed and actual sample qualification |
| Manual/guided entry | Ask only missing fields, preserve user wording, validate units/dates, then show the same review card | Resume/cancel/expired/stale/error/privacy/accessibility flows |
| Factsheet/research document | Resolve an instrument or research candidate; ask for owner quantity/history separately | A factsheet never becomes evidence of owner quantity or acquisition cost |
| Later history/backfill | Compare new events with existing observations/history and propose a rebase/correction | No double application of an opening position and its historical transactions |
| Correct or reverse | Show dependent effects, changed totals and affected evidence before a separately approved correction | Original events/approval and issued forecast versions remain inspectable |

All five input methods are required in the first version (DEC-005/039). This is not universal broker-format support. A supported-layout register records format/version, expected fields, known limitations and test evidence; an unqualified layout is labelled unsupported or review-required. Existing PDF/PNG companions do not constitute an OCR evaluation, and Excel-layout fixtures remain work to plan. Actual sample collection is deferred, not silently removed from later real-import qualification.

Suggested workbook sheets follow the captured reference intent: Accounts, Holdings, Transactions and Valuations. The exact template columns, type bounds and supported CAS families remain a specification choice. Ten thousand transaction rows are a useful proposed scale benchmark from the captured source; runtime, cost and response-time targets require a measured resource model rather than a promise inherited from another app.

## 3. Domain contracts and identity

The [structured contracts](portfolio-import-contracts.json) describe field families and invariants; they are draft design material, not deployed API schemas or migrations.

A security/share class, a listing and a provider symbol are different identities. A security can have multiple venue/currency listings. ISIN alone is not permission to combine them. The fixture key `XLON:CNX1` is a real public listing example and does not identify the owner's still-unconfirmed ETF. Provider aliases and ticker changes are effective-dated; a mapping revision never silently renames old events.

Accounts carry owner, environment, institution alias, country, kind and settlement currency context. US brokerage, UK wrapper and Indian demat/folio information is source-backed metadata. No legal/tax treatment is inferred from a label. Multi-currency accounts and later asset types fit versioned contracts; there is no household/member-sharing requirement in this owner-only app.

Every record belongs to the server-authorized owner/environment namespace. Client strings and a PDF's text cannot select a production dataset or bypass authorization. Records may store minimized protected account-reference tokens; full sensitive originals, where necessary, remain in private encrypted evidence storage. This does not mean retained PDFs contain no personal information.

| Entity | Purpose | Selected invariant |
| --- | --- | --- |
| ScopeEnvelope | Authoritative namespace and version metadata | Every account/document/draft/event/read is scoped and authorized server-side. |
| Money | A signed decimal amount with an explicit ISO currency | No binary float, NaN, infinity or implicit currency. |
| InstrumentListing | Security/share-class identity and venue-specific quote contract | ISIN alone does not uniquely identify a listing or trading currency. |
| InvestmentAccount | An owner-scoped investment account and context | No broker trading credentials or execution authority. |
| SourceDocument | Original bytes and lifecycle/provenance | Private encrypted originals precede extraction; failed/rejected uploads remain observable. |
| ExtractionCandidate | Untrusted, non-authoritative proposed values | No tools or financial writes in document extraction. |
| ImportDraft | An immutable reviewable import revision | Any edit, mapping change, subset choice or reprocess changes the review hash. |
| OwnerApproval | A narrow server-verified approval intent | Approval binds the exact payload/scope/version; a chat yes is not an unscoped reusable credential. |
| LedgerEvent | A recorded economic event, never a trade instruction | Events are append-only; corrections produce linked new events. |
| CommitReceipt | A durable idempotent visibility decision | Exactly one logical application under retries, not exactly-once message delivery. |
| PositionObservation | A dated holding/valuation report with explicit sufficiency | A holdings snapshot is not evidence of a purchase date or external cash flow. |
| ReconciliationResult | Differences and owner disposition | No unexplained plug event or silent source-value replacement. |
| MetricResult | A value with eligibility, scope and method | Zero return and unavailable return are different. |
| AuditEvidence | Durable change/source/approval lineage | No sampling of required business audit/forecast lineage. |
| DomainNotification | Resumable progress about durable state | SSE/notifications are advisory; durable authenticated reads establish the truth. |

Identifiers are opaque application IDs except explicitly typed external identifiers. Money, quantities, dates, source locations and versions are explicit. Missing data is represented independently per field; a row does not become complete because some fields were extracted confidently.

## 4. Financial semantics: no invented history or unit conversions

Use decimal strings at contract boundaries and deterministic decimal arithmetic in code. Reject non-finite values, malformed literals, ambiguous currencies and unsupported precision; retain the raw literal for review. Preserve source-booked net cash amounts separately from calculated gross/fee components. A missing fee is not automatically zero. Precision, rounding and reconciliation tolerances remain L1-Q01. Python's Decimal supports exact decimal representation and configurable arithmetic/rounding; that capability does not choose our policy automatically. [Python Decimal](https://docs.python.org/3/library/decimal.html)

GBP is the default portfolio presentation with local-currency detail (DEC-029). A native GBX quote must be converted exactly once to GBP before a GBP ledger value is computed; a source price already denominated in GBP is not converted again. Preserve trading currency, quote unit and factor with the dated listing contract. Use instrument units and currency units rather than a naked number.

Store effective/trade date, settlement date, source observation/availability time and recorded time separately when known. A date-only record retains its precision and relevant calendar context; do not invent a precise time. Same-day economic ordering comes from declared source sequence/action links or is reviewed when it affects replay. A timezone conversion does not change the original economic date.

Execution FX belongs to the booked transaction. Valuation FX belongs to a dated permitted reference series. Neither can silently replace the other. Retain original amount/currency, received amount/currency, fees, rate direction and provenance. A reference estimate may be offered in a preview, labelled as estimated; it is not evidence of the amount credited. Do not automatically add ECB or another provider merely because the source app used it. Current selected provider rights/coverage must be verified before live use.

| Recorded event | Position/cash treatment | Flow boundary and caveat |
| --- | --- | --- |
| External deposit/withdrawal | Signed cash in its currency; no invented units | External at the chosen account/portfolio boundary when verified |
| Buy/sell record | Signed units and booked net cash; gross/fees retained separately | Internal portfolio investment activity, not a broker order |
| Dividend/interest/withholding | Source-supported gross, net and deductions | Retained portfolio income is internal; instrument-level performance has its own defined cash-flow boundary |
| Reinvestment | Linked income and purchase legs/events | Avoid a duplicated external contribution or duplicated dividend return |
| Transfer | Matched linked outgoing/incoming legs and in-transit state | Internal at whole-portfolio scope, potentially external at account scope; an unmatched side remains unresolved |
| FX conversion | Distinct signed legs in each currency, rate and fee evidence | Do not add GBP and USD amounts as though their units matched |
| Split/reverse split | Quantity ratio and linked action/date; preserve economic cost basis | Fractional entitlement/cash-in-lieu needs explicit evidence; no fictitious gain |
| Opening observation | Dated units/value/cost fields that are actually known | Not an inferred purchase, deposit or complete transaction history |
| Correction/reversal | New linked events and a new projection revision | Never rewrite the original transaction, source or earlier forecast input |

Proposed first-account profiles are non-margin/long-only unless the owner approves another supported contract. A negative position/cash figure is not silently discarded or rounded into validity: preserve it as an exception, determine settled/unsettled semantics and block unsupported dependent calculations. Settlement timing and supported account behaviour remain L1-Q06; do not hardcode market settlement assumptions.

## 5. Sources, extraction and normalization

The source lifecycle is received → quarantined → validated or validation_failed → extracting → extracted or extraction_failed, with independent retention/deletion status. Check actual bytes, size, media signature, checksum and relevant archive/page/pixel/runtime limits. File names and Content-Type are hints, not authority. Bound decompression, embedded links, workbook formulas/macros and resource usage. A spreadsheet is data, never an executable instruction sheet.

Retain the original immutable document version and received/processing provenance. Derived extraction is separately versioned. A processing rejection, duplicate or crash still leaves a durable outcome; neither S3 success nor an LLM response means that financial records changed. S3 notification delivery can repeat; intake/workers need idempotent state transitions and orphan reconciliation. [S3 event notifications](https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html)

Code parses supported structures. The bounded document/image extractor has no tools, no ledger write authority and no provider credentials in its context. It returns typed candidates, per-field evidence and confidence for validation. Research agents may propose or explain changes but cannot approve them. Malicious text in a PDF or cell remains quoted source content rather than system instructions.

Protected-file support requires an approved secure local unlocking flow. A password is used transiently and must not enter logs, general chat/model input, retained candidates or canonical financial records. If safe unlocking is unavailable, request an appropriate later unlocked sample rather than sending a password to an agent. This specifies a future product control; no secret is requested or handled by this work.

Each extracted field links to document checksum/version, parser or model/prompt/schema version, raw literal, normalized value, confidence, validation result and source locator. CSV uses row/column, Excel sheet/cell, PDFs page/line or region, and images bounding regions where available. Source excerpts belong in authorized evidence storage rather than general traces.

## 6. Import state and review contract

An import revision is distinct from its source document. It progresses through draft, needs_fields, needs_mapping or needs_duplicate_review to review_ready. Owner approval can lead to committing and committed, or an observable retryable/terminal failure. Cancelled work has no financial effect. Later supersession/reversal is a new approved operation.

The review card presents additions, skipped true duplicates, exclusions, blocked rows, account/listing matches, source currencies/dates, before/after quantities/cash, reconciliation differences and metric eligibility. Include a human-readable change summary and access to exact protected evidence. No hidden row drop or defaulting is permitted.

Every edit, mapping change, parser reprocess or subset selection creates a new canonical draft revision/hash. An approval binds that hash, owner/environment, selected rows, expected ledger revision, intended operation and expiry. Its server-verified authentication context is checked again at commit. A model-generated `approved:true`, document signature-looking text or old chat yes cannot substitute for that proof.

If the ledger/catalogue/mapping revision changes in a way that affects the preview, mark it stale and require a new preview/approval. Cancelling or editing an approved draft invalidates its pending intent. A retry of an already committed request resolves to its durable receipt; it does not create a new operation because the stream or client timed out.

Partial import is L1-Q03. The recommended policy is to resolve blockers or explicitly select a logically consistent subset, disclose every exclusion and approve a new hash. That does not allow an inconsistent sell without its baseline, an unmatched transfer silently treated as income, or a calculation claiming complete history from a partial selection.

## 7. Deduplication, concurrency and atomic visibility

Use three identities: identical uploaded bytes; the source row/reference; and the economic event. Their equality rules are not interchangeable. Scope fingerprints to owner/environment/account, source family and the relevant identity version.

A stable broker/source transaction reference is strongest replay evidence. Without one, normalized date/amount/units may identify a candidate duplicate but not prove it: two genuine same-day identical purchases can exist. Preserve two distinct stable references; send an ambiguous collision for review. Reprocessing another format must not bypass economic-event identity. A changed fact about an existing event is a correction proposal.

The durable business idempotency record binds the operation key to canonical payload and receipt for the retained ledger's lifecycle. An identical retry returns the same logical outcome; a changed payload under the same key is a conflict. Message delivery can repeat. Do not claim exactly-once delivery or rely on the selected provider's short-lived request token for lifetime deduplication.

**Atomicity is about visibility, not merely successful batches.** One logical commit must couple authoritative financial effects, required audit and outbox/publication obligations. For a small commit the selected store may provide a native transaction. For a large import, never independently publish each successful chunk as if the whole approved import completed.

The proposed scalable pattern is immutable staging under a fenced commit identity, bounded batches, a verified completeness/content digest, and one conditional activation decision against the expected ledger revision. Readers, projections, agents and outbox delivery must all honor the same committed visibility marker or approved versioned-generation mechanism. Failed/unfinished staging remains invisible; a reconciler can safely resume or retire it. A lock/lease design must prove that an expired or superseded worker cannot activate old work.

The physical schema, staging/replay proof and write/read cost are L1-Q08 and require an ADR/spike. DynamoDB's current transaction ceiling is 100 actions/4 MB; audit, dedup and metadata consume actions too. Its client request token lasts 10 minutes, so it is not our durable business receipt. S3 upload and the application database are separate boundaries. These constraints inform the design; they do not establish that a candidate store/algorithm is already approved. [DynamoDB TransactWriteItems](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TransactWriteItems.html)

## 8. Replay, snapshots and reconciliation

Authoritative events are append-only. Derived views can be rebuilt and cached, with their ledger generation, algorithm/policy and source revisions visible. Replaying the same committed history produces identical cash/units; a mutable cached balance is not an alternative ledger.

A snapshot can establish that five units were reported on a date while acquisition cost, date and prior cash flows remain unknown. Show supported valuation and identity facts, flag gaps and withhold unsupported measures. Do not invent a purchase at the snapshot price/date merely to make the ledger balance.

When complete history arrives, reconcile it against the observation and propose a baseline/window rebase. Owner-approved activation replaces the relevant projection basis without deleting evidence or counting opening units plus their full purchase history. Reconcile account-level completeness separately from selected-position completeness; absence of a holding from a cropped screenshot is not proof it was sold.

Reconciliation compares cash, units, fees, quote units, FX, action/date ordering, reported value and source coverage separately. Preserve both reported and derived values. Differences outside approved tolerances become explicit issues and require a source-backed resolution. No unexplained plug event, hidden basis reset or silent overwrite is allowed.

Correcting history creates linked replacement/reversal events and a new view revision, with downstream dependencies assessed first. A reversal cannot leave later events impossible. Already-issued predictions retain their original ledger/data cutoff and evidence; a restated portfolio is labelled restated and does not retroactively improve a forecast's input state.

## 9. Valuation and performance eligibility

Each metric returns value/unit, scope, as-of, method and source versions plus status/reasons. Quantity known does not imply cost basis known; cost basis known does not imply dated cash-flow history known. A valid quoted value can be shown while XIRR is unavailable. Zero return is a result, not an unavailable-data marker.

A complete portfolio valuation includes eligible positions, cash and approved unsettled receivable/payable treatment, converted using explicit dated FX. Market-price and FX freshness follow source/session calendars. A missing price/FX yields a visible partial-known value and a list of uncovered holdings/currencies; it is never a complete total with missing components filled as zero.

For investor-scope XIRR, externally contributed capital is negative, externally received/distributed cash positive, and an eligible terminal portfolio value supplies the closing value. Internal portfolio buys/sells, retained dividends, transfers and FX conversions do not become duplicate external contributions. Account and single-holding calculations use their own explicitly documented boundaries; a transfer can be external to an account while internal to the portfolio.

The proposed compatibility convention is the dated present-value root:

`sum(C_i / (1 + r)^((date_i - date_0).days / 365)) = 0`

Validate signs, dates, complete relevant history, common-currency conversion and terminal valuation. Missing, same-day-only, nonconvergent or ambiguous cases return unavailable/ambiguous with a reason rather than an arbitrary root or zero. Non-conventional cash flows can admit multiple roots; record the solver domain/method and do not treat the first Newton result as authoritative. Validate rate error separately from monetary present-value residual—an IRR is not measured “to the penny.” The 365-day compatibility definition and sign requirements follow Excel's documented XIRR; exact tolerances/solver policy remain to agree. [Microsoft XIRR](https://support.microsoft.com/en-us/excel/functions/xirr-function)

The synthetic -10,000/+11,000 over 365 days case gives 10%; the worked ambiguity case has more than one valid rate. These are numerical acceptance examples, not predictive performance. See E12. Realised gains, lot-selection and tax measures are not inferred from a generic average-cost rule; source-supported basis can be displayed, with unapproved methods unavailable (L1-Q05).

## 10. Privacy, audit, retention and agent costs

Every authoritative mutation links source, draft, owner approval, actor, commit, economic event and before/after evidence. Required business/forecast/approval lineage is durable and unsampled. Operational logs/traces/run summaries use DEC-036's 14/30/90-day retention subject to measured cost; those TTLs cannot delete the only reference needed by retained financial evidence.

Originals use the confirmed renewable 24-month archive with owner extension/deletion controls. No automatic expiry/deletion or irreversible retention lock is authorized by that duration choice. The record-class retention/deletion matrix remains L1-Q07. When content is deleted, retain only the agreed minimal tombstone/audit evidence, disclose missing source availability and ensure any backup restoration reapplies deletion before access. Do not retain sensitive content inside a supposed minimal tombstone.

Audit integrity needs an explicit threat model and protected verification/anchor policy; a hash chain alone is not tamper-proof against an actor able to rewrite the chain and its head. Acceptance includes synthetic missing/altered-event detection and distinguishes authorized appended corrections from unexplained tampering.

Recheck owner/environment on upload, extraction context, preview, commit, read, source access and worker continuation. Generic telemetry/push previews exclude raw imports, portfolio values, personal account identifiers, prompts/replies, passwords and signed links. Protected UI/evidence APIs are separate from general operator logs.

Parsing/extraction is budgeted activity. Record agent/model/token/latency/cache/retry/run attribution and estimate/reservation/final usage without double counting. Unknown or uncovered credit prevents new chargeable calls; optional work follows the £60/£75/£85 cash policy and £70-operation/£30-reserve planning envelope. A failed or budget-stopped import is observable, not reported as applied. The main app dashboard surfaces costs per environment/agent; provider billing collection stays scheduled/cached (Anthropic 6h, AWS daily), rather than a paid query per UI refresh.

## 11. Draft read/API and client contracts

These routes are candidates only. They do not exist in the starter and are not an API implementation approval. Stable scope/version/error semantics matter more than route spelling at this stage.

| Method | Candidate path | Purpose |
| --- | --- | --- |
| POST | `/api/v1/documents/upload-intents` | Scoped upload intent; no ledger mutation |
| POST | `/api/v1/documents/{document_id}/received` | Confirm byte/checksum receipt; idempotent and reconciled |
| POST | `/api/v1/imports` | Create draft from a validated source or manual input |
| GET | `/api/v1/imports/{import_id}` | Read durable draft/status/field evidence |
| POST | `/api/v1/imports/{import_id}/revisions` | Create a new revision; never edit an approved hash in place |
| POST | `/api/v1/imports/{import_id}/approvals` | Bind fresh owner approval to payload and ledger revision |
| POST | `/api/v1/imports/{import_id}/commits` | Request recorded-data commit; not trade execution |
| GET | `/api/v1/commits/{commit_id}` | Resolve ambiguous timeout to the same receipt |
| POST | `/api/v1/imports/{import_id}/reversal-proposals` | Preview a linked reversal, then require its own approval |
| GET | `/api/v1/portfolios/{portfolio_id}/positions` | Read versioned projections with quality/missing-data flags |
| GET | `/api/v1/accounts/{account_id}/events` | Paginated dated history, scoped and versioned |
| GET | `/api/v1/documents/{document_id}/access` | Short-lived authorized original access and access audit |
| GET | `/api/v1/portfolio-events` | Resumable safe SSE progress; durable reads recover state |

Successful mutations return a durable receipt and resulting revision. Proposed errors distinguish invalid fields, ambiguity, stale preview/revision, duplicate-versus-conflicting idempotency, unavailable/budget-stopped dependencies and forbidden scope. Exact HTTP/error-code policy remains part of the contract review; errors must not reveal another owner's document existence.

SSE reports safe progress/cursors and links to authenticated durable reads. A reconnect or missed event cannot lose commit truth or repeat a financial operation. The current sample SSE has volatile unauthenticated in-process state and is not this production contract. Pagination, stable cursors and owner/account/instrument/date/status access patterns must be specified with bounded query costs; an unbounded table scan is not the default.

Proposed local design states include empty/synthetic badge, upload/quarantine, extracting, mapping uncertainty, duplicate review, editable preview, partial-history metric warning, fresh approval, committing, retry/timeout receipt lookup, cancelled/failed, committed, corrected and deleted-source evidence. Specify phone/desktop/iPad layouts, light/dark, keyboard/VoiceOver, privacy mode, offline/stale state and deep links before implementation. These state requirements do not select a visual design.

## 12. Worked acceptance examples and current fixture evidence

Every example is synthetic. Real IDs are catalogue identities, not the owner's holdings or observed prices. E01 uses the existing local source values; the other mathematical/fault examples are proposed acceptance inputs. They do not claim an importer already passes them.

| Example | What must hold |
| --- | --- |
| L1-E01 | Source-backed three-market document/ledger fields, totals, labels and explicit partial recent-history extract |
| L1-E02 | Native GBX quote normalized once; GBP price/gross/fee/net cash retain correct units |
| L1-E03 | Snapshot with missing purchase flows permits supported valuation but withholds XIRR |
| L1-E04 | Repeated file/confirmation yields one logical application and the same receipt |
| L1-E05 | Distinct stable transaction references preserve two genuine identical-looking trades; missing references trigger review |
| L1-E06 | Deposit then purchase/fee reconciles cash/NAV without treating the buy as an external portfolio flow |
| L1-E07 | FX conversion and fee reconcile two currency legs/base-currency NAV without summing unlike units |
| L1-E08 | Missing FX/price produces incomplete coverage, not a false zero or complete total |
| L1-E09 | Stale approval/revision cannot mutate the ledger |
| L1-E10 | Crash during large staged import exposes no partial financial state; retry resolves the same commit |
| L1-E11 | Fee correction appends lineage and restates the view without rewriting the original forecast input |
| L1-E12 | Golden XIRR, incomplete-history refusal and ambiguous-root behaviour are distinguished |

[Market/ledger fixtures](../../synthetic-test-data.md) and [document/operations companions](../../synthetic-import-samples.md) are the current foundation. Seven document-tool and nine market-fixture tests were checked in the earlier fixture task; that evidence is not proof of an application contract, supported real broker, OCR robustness or model accuracy. No test is reported run against a nonexistent importer here.

## 13. Story map and sequencing

PH-01 planning produces this specification, contracts, examples, story map and local UX requirements. It can be written before cloud foundations. Implementation remains blocked by the full requirements/UX approval and PH-02 foundation evidence. The planning and implementation dependency graphs are intentionally separate in the [phased plan](phased-delivery-plan.md).

All IDs below are **local draft IDs**, not created MP Jira issues. The existing roadmap's portfolio epic is a reference, not a verified current implementation state. Detailed source-clause decomposition and issue creation follow the approved planning/publication scope.

| Local story | Outcome | Implementation prerequisites within L1 |
| --- | --- | --- |
| L1-S01 | Owner-scoped accounts and listing identities | L1-S15 |
| L1-S02 | Private validated upload intake | L1-S13, L1-S15 |
| L1-S03 | Versioned extraction for every agreed method | L1-S02 |
| L1-S04 | Instrument and account matching | L1-S01, L1-S03 |
| L1-S05 | Exact normalization of money, dates and events | L1-S04 |
| L1-S06 | Preview, guided edits and explicit subset selection | L1-S05, L1-S07 |
| L1-S07 | Business deduplication and replay-safe identity | L1-S05 |
| L1-S08 | Owner approval and atomic visible commit | L1-S06, L1-S13, L1-S15 |
| L1-S09 | Deterministic ledger replay and versioned projections | L1-S08 |
| L1-S10 | Cash, units and valuation reconciliation | L1-S09 |
| L1-S11 | Corrections, reversal and baseline rebase | L1-S08, L1-S09 |
| L1-S12 | Incomplete holdings and eligible performance measures | L1-S09, L1-S10 |
| L1-S13 | Originals, audit, retention and recovery lineage | L1-S15, L1-S01 |
| L1-S14 | Scoped portfolio reads, progress and accessible clients | L1-S09, L1-S12, L1-S15 |
| L1-S15 | Owner/environment isolation and bounded processing costs | PH-02 foundation / no internal L1 prerequisite |
| L1-S16 | Layer acceptance and later real-sample qualification | L1-S01, L1-S02, L1-S03, L1-S04, L1-S05, L1-S06, L1-S07, L1-S08, L1-S09, L1-S10, L1-S11, L1-S12, L1-S13, L1-S14, L1-S15 |

The [structured story file](portfolio-import-stories.json) contains 64 explicit acceptance criteria plus per-story contract/example/decision/source references and readiness/done conditions. Planning can proceed in parallel by contract/extraction/ledger/client/evidence lanes within the approved total concurrency cap. Shared ledger tests/commit resources need isolation or sequential execution; an agent limit is not permission for competing writers.

## 14. Owner choices and readiness gates

The following defaults/policies are **proposals** and have not been approved by the 18 high-level option answers. They must be agreed or explicitly deferred with their effects before a dependent implementation is ready.

| Choice | Topic | Proposed direction for approval |
| --- | --- | --- |
| L1-Q01 | Precision, rounding and reconciliation tolerances | Preserve source precision and booked net amounts; deterministic decimal calculations and display rounding. Approve bounds/tolerances per field/asset. |
| L1-Q02 | Incomplete snapshot rebase when history arrives | Versioned owner-confirmed replacement of the baseline/history window; no invented purchase or double counting. |
| L1-Q03 | Partial-file import policy | Resolve blockers or explicitly approve a consistent subset with exclusions visible and a new hash; no silent partial commit. |
| L1-Q04 | File limits, protected files and extraction budget | Bounded, versioned file/page/archive/pixel/runtime limits; the old MA20MB/15-minute values are candidate references, not MP approvals. |
| L1-Q05 | Cost-basis and realised-gain methods | Use source-supported basis; defer unsupported analytical/tax gain measures until method/jurisdiction/wrapper contracts are approved. |
| L1-Q06 | Trade-date versus settlement-date accounting | Explicit economic exposure and settled/unsettled cash state; no hardcoded venue settlement rule without verification. |
| L1-Q07 | Financial/audit retention and deletion matrix | Keep required ledger/forecast/approval joins separate from operational TTLs and renewable raw-original policy; exact durations and deletion consequences need owner approval. |
| L1-Q08 | Large-import storage/visibility design | Fenced staged batches and one validated activation decision; prove no partial visibility, retry safety and bounded read/write costs before selecting the physical design. |
| L1-Q09 | Draft/approval expiry and idempotency retention | Bind approvals to payload/revision with a chosen short lifetime; preserve business idempotency for retained history rather than relying on a provider's short token window. |
| L1-Q10 | Execution FX and valuation FX conventions | Store booked execution cash/rate separately from a permitted reference FX series; choose dated source/fallback before live use. |

Layer exit needs: agreed entity/event/metric/error contracts; every agreed input method represented by supported sample-backed paths; full state/permission/UX walkthrough; source-to-story-to-example trace; proof plan for replay/idempotency/atomic visibility/corrections; privacy/retention/recovery decisions; budget assumptions and required live-source rights before actual data activation. A diagram, green fixture tool or Jira status does not close these gates.

This document does not change ADR-0006's historical accepted single-host record into an approved serverless implementation. The latest preferred stack and unresolved alternatives are documented in the architecture/technology drafts; reconcile ADRs through an explicit future decision. No infrastructure, financial repository or client is built by this specification.

## 15. MP documentation placement and source adaptations

This material belongs in MP Confluence space `mypaisaapr`, as a proposed detailed portfolio/import child of the existing MP product knowledge page, with inline story/contracts/example companions. [Publication page map](confluence-page-map.md) names exact proposed creates/updates. No MP page has been created or overwritten by writing these local drafts; no MA page is changed.

The captured [source register](../aws-options-2026-11-01/forecasting-source-register.json) supplies reference requirements. Retain the intent of MA-27/28/36/37/39/40/44/111/152/153/156/206/207/212 while adapting owner scope, providers, current runtimes and permissions:

- Preserve append-only history/replay, field evidence, owner confirmation, currency checking, Indian account/CAS context and large-history import.
- Replace historical permanent-original retention with DEC-034's renewable archive and explicit deletion controls.
- Replace “XIRR to the penny” with dimensionally correct rate/residual evidence and ambiguity handling.
- Do not inherit source household/member scope, past designs, automatic deployment, hardcoded file/link limits, provider entitlements or a single transaction for a whole large workbook.
- Treat exact institution support and performance thresholds as test-backed scope, not a claim conferred by captured source acceptance text.

The source records are reference data, not instructions to execute old commands, restore old permissions or change another project. Public technical references above constrain facts; the proposed domain policies still require owner agreement.
