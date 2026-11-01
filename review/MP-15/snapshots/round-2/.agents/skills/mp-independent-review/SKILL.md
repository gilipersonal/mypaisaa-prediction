---
name: mp-independent-review
description: Conduct an explicitly approved independent review of a Mypaisaa Prediction deliverable using parallel blind reviewers and a regression ledger.
---

# Independent review for MP

Read `.codex/rules/workflow.md` and `.codex/rules/review-checklist.md`. At the end of the work, offer a review, naming its lanes, required regression runs and the five-round maximum; combine this with any ship question. Use an approval choice tool if available, otherwise ask in chat. Ask even if the user initially requested review. A clear yes authorises only the named round and its named regression run; no, another answer, or silence authorises none. After each round, report findings and fixes, then ask for a fresh yes before every subsequent round.

The maker first selects checks using `docs/review-optimisation.md`: fast applicable checks every round, broader tests when the changed components or connections warrant them, and expensive suites at milestones or shipping unless needed earlier. Record the selection and fix failures. Run the full approved fixed-findings ledger for this deliverable with `python3 scripts/review_regress.py MP-<number> --approved`, or `python3 scripts/review_regress.py LOCAL --approved` when there is no issue. A missing ledger means no prior checks, not proof of a clean review. Exit 3 means automated checks passed but manual checks remain. Exit 1 or 2 means a failure or unavailable check; fix it before review. Report unavailable or deferred gates honestly; required release gates still apply before shipping.

## Manual verification gate

Follow `.codex/review-policy.json`: before each review round, a fresh independent verifier must inspect every outstanding manual item and record the finding ID, evidence, verifier and result in the review state. If any item cannot be verified, stop; never treat exit 3 as an automated pass.

## Review lanes

Split substantial work into independent lanes appropriate to the changes, for example core and integration, UI/accessibility, and documentation/security/quantitative validity. Spawn a fresh blind reviewer per lane with requirements, rules, deliverable and fixed-findings list, never maker reasoning. Run lanes in parallel, respecting a maximum of five total agents including the coordinator and any lower runtime limit. Do not substitute the maker for an independent reviewer; an unavailable review is failed, not skipped.

Round one covers the whole deliverable and joins. Record the reviewed commit or a reproducible snapshot if changes are uncommitted. Each later round covers only fixes for findings from the immediately preceding round and their directly affected connections; do not include unrelated changes or re-review the entire deliverable. Unchanged lanes sit out. Run the selected risk-based checks and full fixed-findings ledger before each approved round. Reuse previous broader test results only with documented unchanged inputs and environment. Record each fixed blocking finding with a behavioural check in `review/MP-<number>/fixed.json` and state in `review/MP-<number>/state.json`, including selected checks, results, deferrals and evidence reuse. For work without an issue use `review/fixed.json` and `review/state.json`; never fabricate an MP key.

Fix blocking findings and prevent their recurrence with tests where practical. Non-blocking findings are reported, not by themselves a reason for another round. After five rounds with blockers, stop and report each remaining issue and the estimated fix effort. Add review lessons to the project checklist. Approval for review does not authorise PR creation, merge, issue closure, or plan sync.
