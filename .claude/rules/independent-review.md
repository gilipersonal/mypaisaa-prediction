# Independent review for MP (Claude)

The owner's global rule (`~/.claude/CLAUDE.md`, "Independent review before anything is shown") sets how every review runs: gates first, fresh and blind reviewers in parallel lanes, round 1 on everything and later rounds on the delta, a fixed list with a regression runner, at most five rounds. This file specialises it for Mypaisaa Prediction and wins where the two differ (owner instruction, 2 November 2026: "Ask every round"). It was expanded from mypaisa-agent's rule in MP-35; MA's opt-in-at-merge exception and its ship autopilot do not apply here.

## When a review runs

**Offer it at the end of the work, in the same question as any ship question** (the PR, the merge, the issue closure; `.claude/skills/autoship/SKILL.md`). Name the lanes the work touches, the fixed-findings regression run (`python3 scripts/review_regress.py MP-<number> --approved`, or `LOCAL` for work with no issue) and the five-round maximum. Never ask in the middle of the work.

A clear yes authorises **round 1 and its named regression run only**. After each round, report its findings and fixes, then ask again before the next round, naming that round's delta scope. No, silence, a default selection or any other answer means no further round: report the work as unreviewed from that point, plainly, and list the gates that ran. The owner can also ask for a reviewer at any other time; that request covers one round too.

Review consent never covers a PR, merge, issue closure, plan sync or external publication. Each of those is named and asked for separately (`.claude/rules/jira-flow.md`).

## How it runs

The procedure is `.claude/skills/mp-independent-review/SKILL.md`; Codex's is `.agents/skills/mp-independent-review/SKILL.md`. The how is the same for both.

- **Gates first, all started in one message.** The checks `python3 scripts/review_checks.py --base <base> --run` selects for the changed paths; the deliverable's whole ledger, `python3 scripts/review_regress.py MP-<n> --approved`; every ledger, `python3 scripts/review_regress.py --every --jobs 4` (CI runs this on every PR, so a regression anywhere stops the round); and `python3 scripts/review_regress.py --state MP-<n>`. A failure is fixed before any reviewer starts. Reviewers spend their time only on what no gate measures.
- **The runner's exits.** 0: every automated check passed (or no ledger exists, which means no checks ran, not a clean review). 1: a check failed; fix it first. 2: a malformed ledger, or a check that could not complete (it timed out, could not start, or its file is missing); never a pass. 3: nothing failed but `manual` checks remain. Before each round, one fresh verifier sub-agent, blind to the making, inspects every outstanding manual item and records the finding ID, evidence, verifier and result in the state file (`.codex/review-policy.json`). An item it cannot verify stops the round.
- **Fresh, blind reviewers in parallel lanes**, one `Agent` call per lane, all in a single message. At most five agents run at once, the coordinator included, so at most four reviewers. Agents that made fixes never review those fixes; every round uses new agents.
- **Round 1 covers the whole deliverable.** Every later round covers only the fixes made since the previous round's reviewed commit (`git diff <reviewed_commit>..HEAD`) and their direct joins: callers and callees of a changed function, the specification a changed file builds to, and the documents that cite it. A lane with nothing changed sits the round out. One reviewer re-reading the whole deliverable every round is not allowed.
- **Five rounds at most** for the same deliverable. If blocking findings remain after the fifth, stop and report what is left and what each fix would cost. A sixth round runs only when the owner asks for it, and the state file records his words for that round.
- **A review that cannot run is a failed review**, not a skipped one; say so. Non-blocking findings are listed for the owner and do not start a round on their own.

## The lanes

Choose lanes from what the round's files touch; merge or split them when a deliverable doesn't fit, and say how in the state file. If all five are touched in one round, merge the two smallest so no more than four reviewers run.

| Lane | Covers |
| --- | --- |
| (p) Planning and specifications | `docs/planning/`, `docs/adr/`, `docs/*.md` specifications, cost and source registers |
| (s) Scripts and tests | `scripts/`, `tests/`, `.github/`, review ledgers and runners |
| (c) Agent configuration | `.claude/` rules, skills, hooks and settings, `AGENTS.md`; Codex's `.codex/` and `.agents/` only when the change touches them |
| (d) Confluence, diagrams and motion | `docs/confluence/`, `docs/diagrams/`, `docs/motion/`, `docs/readme/`, `site/`, Lucid and published bodies |
| (b) Backend | `backend/` (code, schemas, tests), once a story has code |

Lane letters stay fixed so finding ids stay stable across rounds.

## The ledger and the state file

- **The ledger** is per issue: `review/MP-<n>/fixed.json`, or `review/fixed.json` for LOCAL work. Each fixed blocking finding gets an entry with a check that passes while the fix holds, so fixed stays fixed. Prefer behavioural checks: MP's `command` (an argv array, no shell, at most 60 s, `expected_exit_codes`), `command_fails` (explicit non-zero codes and a test of the reason) and `file`; the runner also reads mypaisa-agent's `cmd`, `cmd_fails` and `grep`. `.codex/rules/review-ledger.md` documents the format. Every new entry has an `id` and a `finding`.
- **Ledger ids** name their round: `R<round>-<lane letter><n>`, as `R2-s3`, matched in any case. Round 0 holds fixes made before round 1. Every round an id names must be in the state file.
- **A check is never deleted.** When its target is removed or the owner stops it, the entry gains `"retired": "<reason, issue>"`; the runner skips it, prints it and counts it. Retire only the part of a check that no longer applies; a check whose other half still guards a rule is narrowed, not retired.
- **The state file**, `review/MP-<n>/state.json` (or `review/state.json`), holds `round_count` and a `rounds` list numbered 1 to N. Each round records `reviewed_commit` (or a `reviewed_snapshot` directory for uncommitted work), its `review_approval` (the owner's words for that round), `gate_results`, `deferred_gates` with why, `manual_verification`, `findings` (each with `id`, `severity` P0 to P3, `blocking`, `lane`, `anchor` as `file:line`, `evidence` and `status`) and `next_round`. `python3 scripts/review_regress.py --state MP-<n>` validates it, before round 1 too (no state file means no rounds yet), and a round does not start on a state file it refuses.
- **Reviewers get the fixed list** with the line "These are fixed and held by a check. Never propose undoing any of it."

## The reviewer brief

Every reviewer gets the brief in `.claude/skills/autoship/review-brief.md`, filled in by the coordinator, and nothing else: the issue and its acceptance criteria word for word, the rules (`AGENTS.md`, `.claude/rules/`, the lessons below and Codex's `.codex/rules/review-checklist.md`), the lane's exact file list (from round 2, the delta and its direct joins), the fixed list, and never the maker's notes or reasoning. A reviewer reports only what no gate measures, each finding as id, severity, blocking, `file:line`, evidence and the correction. The coordinator merges two lanes' findings at the same `file:line` into one id naming both lanes.

## Lessons from reviews (the checklist)

Reviewers check every lesson that touches their files. Add a lesson the day it is learned, with its source, so the same mistake is never shown twice; keep each number. Codex keeps its own checklist in `.codex/rules/review-checklist.md`, which reviewers also read; Claude does not edit it.

1. **A wording change is searched across line breaks and in every page that repeats it**: the README, the root documents, the planning packs, the Confluence bodies and the site. A phrase split over a line, or a card on another page, is the usual miss (MA PR #32).
2. **A fixed-list check tests what the fix does.** A search of the code's text passes while the fix is broken; mutate a copy and expect the refusal (MA PR #32).
3. **A fix's check searches every phrasing of the fault**, in every record, not only the sentence the reviewer quoted (MA-161).
4. **An owner decision changes every record at once**: the docs, the trace, the Jira descriptions (not only summaries or comments), the diagrams and the published pages, in the same change.
5. **A new precondition is checked in every record that lists steps or prerequisites**: README set-up, the plan's phase exits, Jira's "Depends on", install commands.
6. **"Superseded" names exactly what is superseded.** When the owner keeps part of an old plan, every note that retires the rest says which part stays.
7. **A rule repeated across records is one phrase, copied word for word**; rewording it in each record loses cases.
8. **A gate fails closed, and its selftest proves it bites**: a file it cannot find, a block it cannot parse or a value in a form it does not read is a failure, never a skip; every fault a review finds in it becomes a selftest case that mutates a copy.
9. **A selftest proves the gate, not its harness**: each case names the failure it expects, and the harness makes no failure of its own.
10. **A rewritten check keeps every refusal the old one made**: run the old cases against the new code before narrowing or rebuilding a check.
11. **A check reads every form the thing can take**: a second block, a value in quotes, a different case, a line break inside the match.
12. **A check pinned to a past commit compares only what its fix holds**, never a whole file as it was then, which later work changes on purpose.
13. **A check is retired, never deleted, and only for a recorded reason**; the runner counts retired checks so none vanish unseen (MA-303, MP-35).
14. **A gate that reads the branch must work on CI's checkout**: a pull request is a detached merge commit, so the key comes from `GITHUB_HEAD_REF`, and a missing key fails closed (MA-303).
15. **A guard is checked against where it can act**: a gate in our loop cannot see a tool that runs inside one API request, and untrusted text in a history or summary stays untrusted after the run that read it (MA-245).
16. **A cap is checked against what it must pay for** before it is written down, with what a run stopped by its cap means (MA-245). In MP, every cost is checked against the £100/month ceiling.
17. **A story is checked against what its phase can build**; each later piece is named in the story that brings it (MA-245).
18. **An API combination is checked against the API's documentation**, not assumed (MA-245).
19. **Read back what was published**: a Confluence page, a Jira description or a Lucid document is checked by reading it after the write, and a receipt records that read-back. A publish with no read-back is not done (MA-303).
20. **A closed list is closed only after every record that grants the thing is read**, and an open question is recorded on every story it decides (MA-161).
21. **A fact the owner retires is barred everywhere it can be generated**: the generators, drawings, animations and design pages, not only the documents. Add it to `docs/planning/retired-facts.json` the same day, so `scripts/check_retired_facts.py` refuses it (MP-20 round 2).
22. **A drawing's source and its export are one thing**: editing a Lucid generator without re-importing and re-exporting is not a fix. The manifest's `spec_sha256` and every page hash must match (MP-20 round 2).
23. **An owner's rule keeps the owner's words**: a reason, example or mechanism the maker adds is marked proposed and put to the owner, never folded into the rule (MP-20 R2-S1, R2-S8).
24. **A summary for the owner reads every record that answers a question**: journals, cards and receipts, not only the main log, and shows a partly answered item as answered and still open (MP-20 R2-p1, R2-p2).
25. **A required label is checked on every screen that shows the thing**, not only on the screen designed for it: a ranked action in a cost card, a loading brief or a journal row is still a ranked action (MP-62 R1-s1, R1-j3, R1-h8).
26. **A fixture is read against the world it claims**: a "stale" price stamped with the market's closing time is simply the close (MP-62 R1-h16, R1-r14).
27. **Work split across makers is read together**: one moment shows one set of figures, and one sentence states one rule, in every journey (MP-62 R1-j2, R1-j4, R1-r11, R1-s12).
28. **A promise on a screen has a destination**: a chevron, "opens" or "see" with nothing drawn behind it is a dead end, and an option the owner may pick alone must draw every outcome itself (MP-62 R1-j1, R1-r3, R1-r6, R1-s2, R1-s3).
29. **A state reuses a figure only where that state leaves it true**: an abstained range draws no range, and a Claude-off screen shows no Claude spend (MP-62 R1-h2, R1-s6, R1-r7).
30. **A walker proves it walked**: it counts what it covered against the page's matrix, reports load errors, and judges gradients and opacity rather than skipping them (MP-62 R1-s4, R1-h7).
31. **Two views of one thing are compared by following the link**, on every pair, device and state, never from a hand list of pairs (MP-178 R2-s7, R2-r16).
32. **A control is proved by pressing it**: what it changes, what follows it, where focus lands and whether it comes back. Counting that it exists proves nothing (MP-178 R2-h5, R2-s3, R2-s8, R2-s9).
33. **A form that records a past act says so**, in one sentence, on every screen of the flow; units, price and a primary button read as an order otherwise (MP-178 R2-j3).
34. **A check is proved by undoing its fix**: failing on an old page is not enough, because the old page may fail for another reason (MP-178 R2-h18, R2-r17, R2-j21).
35. **A control that holds state is tested across a change of state**: press it, change the state or the device, then press it again. A check that turns and returns inside one state misses it (MP-178 R3-s1, R3-h2).
36. **A label names the question that settles it**: read the question before citing it. A claim the records leave open carries the id of the record that would close it (MP-178 R3-j3, R3-r1).
37. **A figure stated beside its inputs is computed from them**: a rate, a sum or a count that the page's own rows cannot produce is false, however illustrative (MP-178 R3-j2).
38. **Risk in view means in the first view**: a fix that adds the risk below the fold has not kept it in view on a phone (MP-178 R4-s1).
39. **A status says what the system knows**: "no rate found" claims more than "the search ran out of budget", and the rows beside it can prove it false (MP-178 R4-j1).
40. **A rule is read from what can be pressed, not from the helper that marks it**: a gate that reads `data-act` misses every plain button that writes (MP-64 R1-f2, R1-a2, R1-s4).
41. **A control is drawn only where its act can happen**: approve needs something waiting, in that state, with its binding on screen; an expired or empty request says why not (MP-64 R1-s2, R1-s3).
42. **A question's option text is not the owner's answer**: quote the label they picked, say what the option read, and mark the rest of the reading as proposed (MP-64 R1-s6).
43. **Measure timing on mains power**: on battery WebKit runs at 30 frames a second, so a runtime failure there proves nothing, and a pass elsewhere must be rerun (MP-64).
