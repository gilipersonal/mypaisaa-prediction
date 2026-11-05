# Lane (c) Rules and records: round 1 findings

Snapshot `46b631b`. Three findings are blocking (R1-c1 to R1-c3). All are record or one-line fixes. Nothing was edited, published or written to Jira.

## Blocking findings

### R1-c1 · P2 · blocking · `scripts/design_runtime.mjs:249`, `:13`
**The 11 px floor survives in a live gate.** Lessons 3, 49 and new 52 all apply.
- **Evidence:** line 249 reads `if (t.size < 10.95) issues.push(... (at least 11))`, and the header at line 13 says "text smaller than 11 px". `git grep "10\.95|at least 11"` finds only this file.
- **Why it matters:**
  - The script runs on all three pages, and `docs/design/prism/README.md` step 5 names it as Prism's gate.
  - The walker reads only frames. The static gate cannot read the relative sizes in `RELATIVE_OK`, so 11 px text outside a frame set in em passes every gate.
  - This is the mismatch UX-10 describes, and the one lesson 52 says was closed.
- **Nothing is hidden today:** my Chrome sweep of the three pages at 390 and 1440 found no text under 11.95 px, in their default states only.
- **Correction:** use the path test line 238 already has: 11.95 for `docs/design/(prism|journeys|admin)/`, 10.95 for the historical pages. Update the message and the header. Add a case that undoes it.

### R1-c2 · P2 · blocking · `docs/planning/trace.json:2`, row at `:606`, row at `:1788`
**`as_of` was moved to 2026-11-05, but two rows disagree with Jira.**
- **MP-180:** the trace has `"parent": null`; Jira has parent MP-4.
- **MP-39:** the trace has `In Progress`; Jira has Done, resolved 2026-11-03. The stale value predates this branch, but `as_of` now vouches for it.
- **Aggregate reads back the rest:**

| Count | Jira | Trace |
| --- | --- | --- |
| Non-epic issues with no parent | 12 | 13 |
| Done | 25 | 24 |
| In Progress and In Review | 7 | 8 |

  Both gaps close once these two rows are fixed. I did not read back every row's summary.
- **Correction:** set both rows and rerun `plan_sync check`.

### R1-c3 · P2 · blocking · `docs/design/journeys/README.md:66` against `docs/design/journeys/src/shell.js:261` (built: `index.html:2247`)
**Two records state opposite behaviour for what a flip covers.** Rules: lessons 7, 23, 47 and plan-sync rule 3.
- **Evidence:**
  - README, new text: "In the app the choice would cover the whole journey."
  - shell.js, unchanged comment: "The flip turns this one frame, as the app would."
  - The storage key is per frame: `${j.id}|${o.id}|${s.id}`, line 216. My run stored `forecast|a|a-forecasts`.
  - The owner's words only say each journey "keeps the choice on that device and flips on its own". They do not settle frame against whole journey.
  - The reason "so the two views can be compared" is the maker's and is not marked proposed.
  - The MP-182 Jira comment lists "Whole-journey flip memory" as out of scope; the issue's Out of scope list does not.
- **Correction:** make the comment and README agree. Mark the app-level sentence as proposed. Put the question to the owner on MP-182 and in the PR. Leave the behaviour as it is until he answers.

## Non-blocking findings

| ID | Severity | Location | Evidence | Correction |
| --- | --- | --- | --- | --- |
| R1-c4 | P2 | `scripts/design_gates.py:23`, `:112`, `:868`, `:65` | Docstring says "Text is at least 12 px". The `else` branch gives 11 to every page that is not Prism, Journeys or Admin, including a new `docs/design/<slug>/` page, though the comment says "historical option pages". `check <path>` does the same. The `font-11` selftest case runs at the 12 floor, which those pages never get. Line 65 still says pence "are half the figure", now `max(.5em, 12px)`. | Key the old floor to a named list of historical paths, so new pages get 12. State both floors in the docstring. Fix line 65. |
| R1-c5 | P3 | `docs/design/prism/index.html:1949`, `:2026` | The spec still says only "Focus moves in and returns", while the code comment calls the code "the whole contract": Tab stays in and the page behind is inert. Record sends focus to Undo at line 2056, not back to the trigger, and no record says so. | Put the full contract and the Record path in the spec, then republish. |
| R1-c6 | P3 | `.claude/rules/independent-review.md:106`, `:105`, `:103-107` | Lesson 53 names no source, and neither the branch nor the Jira comment says which claim failed. The likely one is UX-06: "No `touch-action`… appears in that file", false at Prism `index.html:528`. That sentence still stands in open PR #32 (inferred; please confirm). Lesson 52's heading "A count of a gate" does not parse. All five lessons cite only "MP-182", though earlier lessons cite finding ids. | Cite UX-15, UX-01, UX-10 and UX-06. Reword 52's heading. Note the refutation on MP-181. |
| R1-c7 | P3 | `docs/design/journeys/README.md:65`, `shell.js:12` | Text says it keeps "only which view a frame is on". The record also carries `got` and `from`, holding `hz`, `mode` and `t` when set (line 269). No figure, draft or approval is kept, but the audit warned against persisting holdings. My default-flip run stored them empty; I did not capture a populated record. | Say what is kept, or drop `t`. |
| R1-c8 | P3 | Jira MP-180, MP-182 comment | MP-180 records the long frame as "51 to 53 ms". The brief says 56 to 57; the comment says main 55 to 60, branch 57 to 64. | Add the current figures to MP-180, noting whether they ran on mains power (lesson 43). |
| R1-c9 | P3 | Jira MP-182 | `issuelinks` is empty, though the issue came from MP-181's audit (jira-flow habit 4). | Link it to MP-181. |
| R1-c10 | P3 | `docs/design/prism/README.md` step 5, `docs/design/admin/README.md:19` | `design_prism_press.mjs` is named only in the Journeys README, the trace and `review_checks.py`. It holds the Prism sheet and Admin's selectors and theme. Lesson 5. | Name it in both READMEs. |
| R1-c11 | P3 | `docs/planning/trace.json:1796` | MP-181's `no_code` says "none is on this branch yet", but plan-sync rule 4 reserves `no_code` for issues that changed no files. PR #32 does not touch the trace, so the sentence goes false on merge and no gate will notice. | Add MP-181's paths to its row when PR #32 merges. |

## Checked and found sound

- **Lessons 50, 51, 54:**
  - 50 is true: the walker opens a new context per theme, `design_journeys_check.mjs:174-175`.
  - 51 is true: `sheetOpen`, `sheetDemo` and `#sheetClose` appear nowhere in `scripts/` or `tests/` on `origin/main`.
  - 54 is true: the "Tab can leave the sheet" case has to remove the inert fix as well.
  - Lesson 52's body matches the audit; its claim fails only on R1-c1.
- **Lesson numbering:** 1 to 54 with no gaps, and no other file repeats the list. The audit's "no localStorage" claim for the journeys shell is true on `origin/main`.
- **12 px elsewhere:** Journeys README line 91, the walker and the static gate all say 12. The 11 px statements in `docs/design/reviews/MP-62/` are historical. Tokens hold no 11 px size.
- **Flip wording:** the decision log, README line 61, Prism line 1908 and the page's inventory text say the same thing. The only conflict is R1-c3.
- **Trace rows:**
  - MP-182's `code` matches the 16 changed files exactly.
  - MP-180's summary, type and status match Jira. MP-181's summary, type, status and parent match, and PR #32 is open.
  - MP-182's summary, type, status and parent match.
  - MP-62, MP-64 and MP-178 are Done in Jira.
- **`artifacts.json`:**
  - All 9 hashes match their sources.
  - The three artifacts read back at their current versions contain the repo file byte for byte, inside the host's skeleton.
  - Same URLs as before. Moving `market-agent` is only entry order; its record is unchanged.

Browsers I opened are closed. My probe scripts are in `/private/tmp/claude-501/-Users-arundutta-projects-mypaisaa-prediction/45ba900b-058a-4437-b30a-d55697f4dbd3/scratchpad/lane-c`.
