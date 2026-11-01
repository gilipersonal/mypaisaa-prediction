---
name: mp-independent-review
description: Conduct an explicitly approved independent review of a Mypaisaa Prediction deliverable using parallel blind reviewers and a regression ledger.
---

# Independent review for MP

Read `.codex/rules/workflow.md`. At the end of the work, offer a review once, naming its lanes, required regression runs and at most five rounds; combine this with any ship question. Use an approval choice tool if available, otherwise ask in chat. Ask even if the user initially requested review. A clear yes authorises up to five rounds and the named regression runs; no, another answer, or silence authorises none. Do not ask again between those rounds.

The maker first runs all applicable full-deliverable gates and fixes failures. Run the approved regression ledger through `python3 scripts/review_regress.py MP-<number> --approved` when an issue exists. A missing ledger means no prior checks, not proof of a clean review; manual checks remain outstanding until reviewers verify them. If a gate or regression fails, fix it before review. Report unavailable gates honestly.

Split substantial work into independent lanes appropriate to the changes, for example core and integration, UI/accessibility, and documentation/security/quantitative validity. Spawn a fresh blind reviewer per lane with requirements, rules, deliverable and fixed-findings list, never maker reasoning. Run lanes in parallel, respecting a maximum of five total agents including the coordinator and any lower runtime limit. Do not substitute the maker for an independent reviewer; an unavailable review is failed, not skipped.

Round one covers the whole deliverable and joins. Record the reviewed commit or a reproducible snapshot if changes are uncommitted. Later rounds cover the delta since that snapshot and direct joins; unchanged lanes sit out. Re-run full gates and the regression ledger before each round. Record each fixed blocking finding with a behavioural check in `review/MP-<number>/fixed.json`; record round and reviewed revision in `review/MP-<number>/state.json`. Do not fabricate an MP key; use a task-specific review directory agreed with the user for untracked work.

Fix blocking findings and prevent their recurrence with tests where practical. Non-blocking findings are reported, not by themselves a reason for another round. After five rounds with blockers, stop and report each remaining issue and the estimated fix effort. Add review lessons to the project checklist. Approval for review does not authorise PR creation, merge, issue closure, or plan sync.
