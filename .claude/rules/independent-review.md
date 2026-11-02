# Independent review for MP (Claude)

This file specialises the owner's global independent-review rule for Mypaisaa Prediction and wins where the two differ (owner instruction, 2 November 2026: "Ask every round").

**When.** Offer the review at the end of the work, in the same question as any ship question. Name the lanes, the fixed-findings regression run (`python3 scripts/review_regress.py MP-<number> --approved`, or `LOCAL`) and the five-round maximum. A clear yes authorises **round 1 and its named regression run only**. After each round, report its findings and fixes, then ask again before the next round. No, silence, a default or any other answer means no further round: report the work as unreviewed from that point and list the gates that ran.

**How** (unchanged from the global rule and `.agents/skills/mp-independent-review/SKILL.md`):

- Gates first. Fix what they catch before any reviewer starts. Run the deliverable's full fixed-findings ledger before every round, and have a fresh independent verifier check every outstanding manual item (`.codex/review-policy.json`).
- Fresh, blind reviewers in parallel lanes, one agent per lane in a single message. Give them the requirements, rules, deliverable and fixed list, never the maker's reasoning. At most five agents at once, coordinator included.
- Round 1 covers the whole deliverable. Later rounds cover only the previous round's fixes and their direct joins; unchanged lanes sit out.
- Record fixed blockers with behavioural checks in `review/MP-<number>/fixed.json` (or `review/fixed.json`) and the round state in `state.json` beside it, following `.codex/rules/review-ledger.md`. Add lessons to `.codex/rules/review-checklist.md`.
- Stop after five rounds if blockers remain, and report what is left and what each fix would cost. An unavailable review is a failed review, not a skipped one.

Review consent never covers a PR, merge, issue closure, plan sync or external publication.
