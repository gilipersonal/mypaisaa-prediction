# MP architecture reconciliation and baseline preparation

**2 November 2026 · MP-19 · Planning only · Architecture not approved · UX not started · Application implementation not authorised**

The owner authorised reconciliation of all relevant MA planning, with gaps captured in MP documentation and Jira and up to five concurrent threads. The owner then clarified: carry concepts and research them against the MP discussions; do not blindly copy MA. Three specialist maker lanes and the coordinator worked concurrently (four total, the runtime limit). This is authoring and research, not independent review.

## Read in this order

1. [Reconciliation report](reconciliation-report.md): the source boundary, concept dispositions, researched differences and remaining gaps.
2. [Architecture finalisation sequence](architecture-finalisation.md): decisions and evidence required before UX.
3. [Documentation and story structure](documentation-structure.md): the canonical area map, phase tree and readiness contract.
4. [Phase specifications](phases): PH-00–PH-09 with current draft stories, contracts, dependencies and acceptance evidence.
5. [Source coverage](source-coverage.json), [gap register](gap-register.json), [Jira receipt](jira-receipt.json) and [publication proposal](confluence-publication-proposal.json).

[Owner decision log](decision-log.md): ARC-01 option A selected, including [Twelve Data Free for dev](dev-data-policy.md); rights, coverage and cost proof remain open. ARC-02 selects DynamoDB + S3 and one controlled financial write service, with integrity/access/recovery proofs open. ARC-03 selects Lambda Durable Functions with Python workflows; replay, runtime and cost proofs remain open. ARC-04 selects capped SageMaker CPU training/evaluation with portable Lambda inference; resource, scientific and cost proof remains open. ARC-05 selects baselines-first qualification with bounded challengers; detailed scientific contracts and evidence remain open. ARC-06 selects separate Lambda workers for each Claude task route, reusing a shared bounded runner library; role/IAM/model/context/cost detail remains open. ARC-07 selects Cognito assurance/freshness for sensitive actions with verified fresh-sign-in fallback; exact policies and provider/tier/cost proof remain open. ARC-08 requires all identified admin journeys to be specified now and fully designed after architecture agreement, before first build; detailed policy/recovery proofs remain open. Four further architecture decisions are pending.

[FastAPI hosting and workflow boundary](api-workflow-boundary.md) explains ordinary API Lambdas, separate Durable workflows and the optional SageMaker-specific hybrid. ARC-03 remains unchanged while this alternative is discussed.

## Authority and evidence

MA is read-only research. Its existing household features, dates, estimates, feed rights, accounts, model IDs, numeric gates and permissions are not inherited. Current MP decisions take precedence: standalone owner ledger, no trading; US/UK/India; daily formal forecasts plus supported 30-minute monitoring; next-day, 5–20-day and 3/6/12-month horizons with separate 3–5-year scenarios; direct Anthropic client SDK on Lambda; £100 all-in cash envelope and no uncovered automatic paid fallback. ARC-04 now selects selective SageMaker training with portable serving; its detailed proof and network choices remain unresolved.

The prior 21-page/140-story/21-observability-story captures remain dated provenance. The new inventory covers the currently visible 83 MA pages. Retrieval of full HTML establishes accessible source text and references; it does not independently validate every embedded board, animation or external diagram. Clause-level completion and visual evidence have separate states in the register. No page count is an accuracy or implementation claim.

This pack follows MA's useful organisation: architecture areas, technical and user journeys, one phase page per layer, stories with traceable acceptance, decisions and a single change history. It does not copy MA's 21-phase scope or promise its delivery dates. MP retains PH-00–PH-09 as stable identifiers; its older six Jira epics are a documented crosswalk rather than ten invented epics.

## Stop gates

- Research and documentation may proceed; no product code, provisioning, live data import, paid provider call or model promotion is authorised.
- Architecture baseline approval is distinct from UX approval. UX starts only after architecture/contracts/phase structure are agreed. Implementation starts only after the complete UX and end-to-end baseline are approved and the owner explicitly authorises build work.
- These local publication payloads are proposals. Existing Confluence pages, Lucid diagrams and the Site are not silently replaced or auto-synchronised.
- Independent review, PR creation, merge and issue closure keep their separate project consent gates.

## Reproducible checks

Run `python3 docs/planning/ma-reconciliation-2026-11-02/validate.py` to check the pack's source coverage, IDs, cross-references, phase graph and prepared publication bodies. This is a maker consistency check. It cannot establish scientific validity, licence entitlement, cloud cost, owner approval or independent review.
