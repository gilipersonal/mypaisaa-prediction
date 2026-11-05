# The owner's question pack (MP-184)

Every open question from the review pages and the story pack, put to the owner once, with options, before UX approval (MP-66). As of `7e76154`, 5 November 2026.

**Nothing here is decided.** A recommendation is a proposal, and option text is not an answer (lesson 42). No record changes until the owner picks, and applying a pick is its own change.

| File | What it holds |
| --- | --- |
| `pack.json` | Every entry: its status, tier, options, evidence, and the question as first asked |
| `docs/design/question-pack/index.html` | The page the owner picks on, built from `pack.json` |
| `scripts/question_pack.py` | The gate: every open question has an entry, and every entry can be traced |

## What is in it

77 open items from four sources: 39 on Prism Journeys, 25 on Prism Admin, 12 pending in `docs/planning/story-readiness-2026-11-03/questions.json`, and 1 from MP-182's review. Three items hold more than one question, so there are 81 entries.

| Status | Entries | Meaning |
| --- | ---: | --- |
| To decide | 64 | The owner chooses: 21 before approval, 32 before build, 11 later |
| Already answered | 3 | A record settles it, and the page quotes it |
| Not the owner's to decide | 8 | A specification or a redraw settles it |
| The same question twice | 6 | Carried by another entry |

A question is `before_approval` only if picking the other option would make the approved screens wrong.

## How it was made

Three researchers read each item against the decision log, owner decisions, decision cards, gap register, foundation specifications, stories and design records, and cited what they found. An outside fact no record confirms is marked unverified in the option that depends on it.

## Picks

The page saves each pick to the artifact's database, under `picks/<entry id>`, and also keeps a text copy the owner can paste. Applying them is follow-up work, one change per decision, and each pick is recorded with the label the owner pressed (lesson 42).

Rebuild after editing `pack.json`:

```bash
python3 docs/design/question-pack/build.py
```
