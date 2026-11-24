# The owner's question pack, round 2 (MP-203)

The questions the owner's 5 November picks (MP-184) left open, found while MP-192 brought the records into line with
those picks, and the two MP-199 left open. As of `4df40d6`, 24 November 2026. **All 11 are answered**, on 24 November
2026, in `answers.json`: nine pressed on the page and two (MP203-02, MP203-03) picked on a question card in chat. Nine
are the Recommended option; MP203-07 "Widen three existing stories" and MP203-08 "An environment replaces route A" are
not. None is applied yet.

| File | What it holds |
| --- | --- |
| `answers.json` | The owner's answer to each question, how it was given, and what the option read |
| `pack.json` | Every entry: its status, tier, what it decides, its cost against the £100 ceiling, the owner's earlier words, options, evidence, and the question as MP-203 or the records put it |
| `docs/design/question-pack/index.html` | The page the owner picks on, the same page and artifact as round 1, built from this pack; round 1's answers are kept under their own tab |
| `scripts/question_pack.py` | The gate: every question MP-203 names and both MP-199 questions are carried, no id repeats round 1's, and each entry has real options, one reasoned recommendation, what it decides, its cost and the owner's earlier words |

## What is in it

Twelve entries for the eleven questions given: MP-138's question holds two.

| Id | Question | Tier | Decides |
| --- | --- | --- | --- |
| MP203-01 | Does a browser's saved copy also time out? (OWN-37) | Before approval | MP-165; Privacy's Offline copy card, Journeys page |
| MP203-04 | Is a 3-month model on probation judged like the 6 and 12-month ones? (OWN-27) | Before approval | MP-159, SCI-D07; the Reverted card in Admin's Models and evaluations |
| MP203-02 | May an investment alert ever break quiet hours? (MP40-Q11a) | Before build | MP-138 |
| MP203-03 | Which faults are critical enough to break quiet hours? (MP40-Q11a) | Before build | MP-138, MP-110; the Critical row on Admin's Alerts and quiet hours |
| MP203-05 | For range forecasts, does the baseline stand in for the rules without a yes each time? (ADM-09) | Before build | MP-124, SCI-D03 |
| MP203-06 | Does a model's live trial need no 2% lead and no 95% interval? (OWN-33) | Before build | MP-124, SCI-D03 |
| MP203-07 | How should the three builds the picks added be carried in the stories? (MP40-Q2, Q8, Q13) | Before build | The baseline in PH-01, PH-03 and PH-07 |
| MP203-08 | Does route A stand for production releases now the repository is public? (MP-199) | Before build | PL-11, the release workflow and the AWS rule's wording |
| MP203-09 | Must the first event wave cover all seven kinds? (MP40-Q10) | Later | MP-81 |
| MP203-10 | Which days are valuation days for gold and silver? (OWN-26) | Later | SCI-D08 |
| MP203-11 | Should Apple builds and simulator runs move to free macOS runners? (MP-199) | Later | TECH-STACK, Apple testing, the PH-07 CI |

**Already answered, so not asked again:** MP40-Q7. It was asked as "At PH-08, keep N0 (no VPC) or take a lockdown step
(L1 to L4), each costed on the perimeter page?" PH-08 is the launch phase, "Operational acceptance and controlled
personal launch", so the pick "Stay with no private network" answered PH-08 itself, and MP-123 already records it.

A question is before approval only if picking another option would make the drawn screens wrong. MP203-01's Recommended
option is what Privacy already draws. MP203-04's Recommended option keeps Admin's drawn revert of a 3-month model on
probation; the other two options would redraw it.

## How it was made

Each question was read against the decision log, round 1's picks and `scope.md`, the root documents, the stories, the
foundation specifications and the drawings, including MP-192's changes (lessons 20, 24 and 36). Every option is a
proposal: a pick's option text is not the owner's reasoning (lesson 42), and anything added beyond the owner's words is
marked proposed (lesson 23). The owner's earlier words are quoted exactly, with how they were given.

## Picks

The page saves each pick to the artifact's database, under `picks/<entry id>`, beside round 1's picks, whose ids no
round 2 id repeats; it also keeps a text copy the owner can paste. Applying the answers is a later step: each changes
the stories, specifications, gap register, root documents and Confluence through `mp-plan-sync`, with a yes for each
external write.

Rebuild after editing `pack.json`:

```bash
python3 docs/design/question-pack/build.py
```
