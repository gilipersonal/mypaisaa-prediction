# MP-20 review round 2: the reviewer brief

Filled in from `.claude/skills/autoship/review-brief.md`. Every lane gets this brief plus its own lane section. You are
a fresh, read-only reviewer: read the files as a stranger, change nothing, and report findings only.

## 1. The issue and its acceptance

**MP-20: Freeze the researched architecture and phase/story baseline.** No PR yet. Branch
`MP-20-baseline-consolidation`, reviewed commit `0cca844` (run `git log -1` to confirm).

The acceptance criteria, word for word from Jira:

> Planning outcome: Freeze the researched architecture and phase/story baseline.
>
> Research and specification only. MA concepts are reference; current MP owner decisions control. No
> application/infrastructure implementation, paid calls or automatic promotion.
>
> ### PL-01 - Remove conflicting current architecture authority
>
> Make one versioned MP baseline the authority; preserve dated evidence as historical and replace conflicting current
> instructions. Add a decision precedence table and a source-to-phase-to-story crosswalk. Do not turn all ten layers
> into separately approved architectures.
> Owner decision: Approve baseline structure, decision owner and handling of superseded ADRs.
>
> * Every current instruction resolves to the same £100 all-in/direct Anthropic/DynamoDB-preferred direction.
> * Every unselected option is marked open with an owner and deciding evidence.
> * One current phase map has explicit historical epic crosswalk.
>
> ### CD-01 - Freeze the canonical MP baseline and detailed story trace
>
> Keep PH identifiers, assign one current authority and explicitly supersede bootstrap conflicts. Decompose every
> relevant acceptance into MP contracts/tests and actual Jira stories before UX starts; retain MA provenance without
> copying dates or permissions.
> Owner decision: Approve architecture baseline structure, epic crosswalk and story readiness protocol.
>
> * Record versioned requirements, ADRs, contracts, phase/story links and source dispositions; no local draft ID is
>   presented as Jira.
> * All implementation stories have specific positive/negative acceptance, data/authority contracts, state inventory
>   and dependency evidence before the UX gate.
> * Architecture, complete UX and explicit build permission have separate owner approvals.
>
> ### CD-02 - Track rich-source limitations and MP visual evidence
>
> Maintain a separate evidence state for source text, board semantics and actual visual inspection. Reuse MP native
> diagrams as proposed, update only for selected architecture and preserve exact versions/hashes. Create MP UX after
> baseline approval, not copied MA boards.
> Owner decision: Approve required architecture/phase visual set and source-review boundaries.
>
> * Every significant component and interface has a readable technical view with native AWS components and trust
>   boundaries.
> * Each visual records source, version, export hash and current/proposed status; reduced-motion/static alternatives
>   retained.
> * Uninspected referenced material remains visible as a limitation; no complete visual-parity claim.
>
> ## Evidence and completion
>
> * Record the exact decision, contracts, positive/negative/recovery acceptance and owner answer; remain open if
>   unresolved.
> * Link MP-19 reconciliation, phase/story map and planned Confluence pages. No claim that a proposal is accepted or
>   implemented.
> * Architecture and detailed phase/story baseline precede UX; full UX and separate owner permission precede build.

**The owner decisions that apply** are the owner's own words in
`docs/planning/ma-reconciliation-2026-11-02/decision-log.md`, from the section "Owner answers after the MP-10
source-rights research (2 November 2026)" to the end (the MP-29 answers, the event and analog research answers, and
the 3 November decision round, items 1 to 21). The decision log is the authority: every other record must agree with
it. The owner's choice for this deliverable (item 21) is one consolidation pass of every decision since 2 November
into the foundation pack, then one sign-off of the whole baseline.

## 2. The rules

Check against `AGENTS.md`, every file in `.claude/rules/`, the numbered lessons at the end of
`.claude/rules/independent-review.md`, and `.codex/rules/review-checklist.md`. Check every lesson that touches your
files. In particular: lesson 1 (a wording change searched across line breaks and every page that repeats it), lesson
4 (an owner decision changes every record at once), lesson 7 (one rule, one phrase), lesson 8 (a gate fails closed
and its selftest proves it bites), lesson 16 (every cost against the £100 ceiling).

## 3. Your files

See your lane section. This is round 2: round 1 reviewed commit `0ddf55eb66c58641883c5d7534524768872b3861` on 2
November. Your scope is what changed since then in MP-20's deliverable, plus its direct joins (the callers and
callees of a changed function, the specification a changed file builds to, and the documents that cite it). Do not
re-review unchanged material for its own sake.

## 4. The fixed list

These are fixed and held by a check. Never propose undoing any of it.

- **R1-C1** Annual domain invoice cash is distinguished from amortised run rate and threshold admission uses full due commitments. Check: `python3 docs/planning/foundation-specifications-2026-11-02/costs/check_cash_timing.py --self-test`
- **R1-F1** Versioned acyclic canonical projections construct and verify actual leaf/chunk/page/root hashes. Check: `python3 docs/planning/foundation-specifications-2026-11-02/financial/verify_hash_contract.py`
- **R1-F2** Delivery failure/retry/success updates separate state and attempts without changing sealed intent/root hashes. Check: `python3 docs/planning/foundation-specifications-2026-11-02/financial/verify_hash_contract.py`
- **R1-S1** Positive-latency ordinary and retry acquisition fit frozen cutoff; late inputs and unsupported next-open schedules abstain. Check: `python3 docs/planning/foundation-specifications-2026-11-02/forecasting/timing_checks.py --check daily`
- **R1-S2** Pre/postrelease predictive inputs obey own cutoff and later origin, while retrospective event studies cannot qualify predictors. Check: `python3 docs/planning/foundation-specifications-2026-11-02/forecasting/timing_checks.py --check event`

R1-C1's domain invoice month was later retired because the owner's domain is renewed outside MP; its check now
proves the same invoice-month rule on the conditional Apple fee month. Judge the rule, not the example.

## 5. The gate results (at `0cca844`)

Passed, so do not repeat them: Python errors (ruff F), review-checks tests, agent configuration, plan sync (`check`,
`selftest`, `pr-files`), the sign-off pack check and its tests, PR policy, the README check, the reconciliation pack
validator, the foundation pack validator, `costs/validate_specifications.py`, `check_cash_timing.py --self-test` (25
mutations rejected), `timing_checks.py` daily and event, `verify_hash_contract.py`, design sync, the MP-20 ledger (5
of 5) and every ledger (26 of 26), the state file check, workflow lint (actionlint 1.7.12), backend pytest, whitespace.

Deferred: the Confluence check fails only because eight attachments and four page bodies changed since they were
published; republishing needs the owner's separate yes. Unavailable locally: the synthetic data and import-sample
tests (they need pandas and pdftoppm; this branch does not touch them).

## 6. What to return

Report only what no gate measures. For each finding: id (R2-<lane letter><n>), severity P0-P3, blocking yes/no,
file:line, evidence, the correction.

- **Severity:** P0 breaks the product, loses or leaks data, or crosses a non-negotiable limit in `AGENTS.md`; P1
  breaks the issue's acceptance or a rule; P2 is wrong but contained; P3 is polish.
- **Blocking** is your call: yes when the work must not merge with it.
- **Evidence** is what you read or ran and what it showed: the quoted line, the command and its output. A finding
  with no evidence is not a finding.
- **The correction** is the smallest change that fixes it, with every record that must change with it.

Keep your report to the findings, then one line saying what you read. Never edit, commit or publish anything.
