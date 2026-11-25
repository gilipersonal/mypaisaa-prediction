# Handover: where MP stands, 24 November 2026

**Written 24 November 2026 under MP-206 · read from git, Jira and the repo that evening · grants nothing**

This note is for the next session, Claude or Codex, picking up Mypaisaa Prediction (MP). It replaces the state
described in `CLAUDE_HANDOVER.md` (2 November, planning stage), which stays as the history of how MP got here. Each
line below points at the record that holds it. Where this note and a record disagree, the record wins, and the root
documents (`README.md`, `ARCHITECTURE.md`, `TECH-STACK.md`) win over every other record (`.claude/rules/plan-sync.md`).

## The state in one paragraph

The architecture and phase/story baseline are signed off (MP-20, 3 November). The whole UX is approved with named
conditions (MP-66, 24 November). The owner allowed a small build in four steps, local and on synthetic data only. Steps
1 to 3 are merged to `main`: the web shell, the sign-in screens on a pretend sign-in, and the read-only screens drawn to
the design's measure. **Step 4, a local FastAPI read API, is next and starts only when the owner asks.** Nothing is
deployed, no AWS resource exists, no live data is fetched and no model is called.

## Where the code is

`main` is at `44ecd67` (merge of PR #59, MP-205). No pull request is open. Repository:
`gilipersonal/mypaisaa-prediction`, public since 23 November by the owner's choice.

| Step | Issue | Merged | What it is |
| --- | --- | --- | --- |
| 1. Web shell | MP-134 | PR #53, `3edb229` | SvelteKit app in `web/` on Prism: sidebar, phone tab bar, placeholder pages over a fake data layer |
| 2. Sign-in screens | MP-73 | PR #54, `a39b668` | A pretend Cognito-shaped provider in `web/src/lib/auth/`; `(app)` routes guarded; `?pretend=<scenario>` shows each state |
| 3. Read-only screens | MP-205 | PR #59, `44ecd67` | Home with the cost pill, Holdings and one holding, the Journal, the privacy centre, Settings, and Track record option A with its four sub-pages; Tap to show option A |
| 4. Local read API | MP-76, MP-83 | not started | FastAPI read routes under `/api/v1` over the sample portfolio, run locally |

MP-134 and MP-73 stay In Progress on purpose: each step built a slice of the story, not the whole story.

**How the web app draws.** It uses the design's own stylesheet: `web/scripts/design-css.mjs` writes
`web/src/lib/prism/design.generated.css` (git-ignored, built by `npm run assets`). Components carry no hand-written
style blocks; `web/scripts/prism-components.mjs` refuses them. `web/src/lib/shell/Frame.svelte` reproduces the design's
frame. Fonts (Inter, Nunito) are self-hosted. `web/scripts/design-parity.mjs` measures every built screen against its
design screen, element by element, across desktop and phone web, six states and both themes (pairs in
`web/tests/parity/*.json`); it last passed 288 of 288. One design quirk is copied on purpose: Prism's `.win` rule leaks
into desktop frames (letter-spacing 0, bold at 600).

**SvelteKit specifics** (version in `web/package.json`): there is no `svelte.config.js`, options go in
`sveltekit({...})` in `vite.config.ts`; imports use `#lib/...` subpath imports, not `$lib`; the service worker has its
own tsconfig in `src/service-worker/`. The guarded shell draws only after mount, so an end-to-end test waits for the
`h1` before pressing keys.

**The backend** is still the starter: a health route and a sample SSE route (`backend/app/`), two tests.

### Run it

```bash
cd web && npm ci && npm run dev
```

```bash
cd web && npm run check && npm test && npm run e2e
```

```bash
uv run --project backend --frozen --extra dev pytest backend/tests
```

## The gates

| When | Run |
| --- | --- |
| Any change | `python3 scripts/review_checks.py --base origin/main --run` (maps changed paths to checks; design parity runs inside its `web` check, never as a separate check, because two `npm ci` in `web/` clash) |
| Commit or PR | `python3 scripts/review_checks.py --base origin/main --run --all --skip design-walk`, `python3 scripts/review_regress.py --every --jobs 4`, `python3 scripts/check_agent_config.py`. The whole-page browser walk is left out at commit and PR time (owner, 23 November, MP-195) |
| Any Jira change, and before every PR | `python3 scripts/plan_sync.py check` and `pr-files` (`.claude/rules/plan-sync.md`) |
| Any design | `python3 scripts/design_sync.py check`, `python3 scripts/design_gates.py check`, `python3 scripts/design_tokens.py check` |

`main` is protected by a ruleset: a PR, resolved threads, merge commits only, and ten required checks (the nine in
`.github/main-protection.json` plus CodeQL). A changed head means asking again before a merge. Locally, actionlint and
pdftoppm are missing, so their checks report UNAVAILABLE, which is not a pass.

CI's Static preview job type-checks, unit-tests and builds the web app; since 25 November 2026 it no longer runs the
Playwright browser tests or their axe WCAG 2.2 checks (owner: "no need to do AXE WCAG 2.2 test now... normal unit tests
is fine", MP-206). They still run locally in the `web` check and with `npm run e2e`. The owner plans to add Argo CI later.

## Open work in Jira (read 24 November 2026)

| Issue | Status | What is left |
| --- | --- | --- |
| MP-206 | In Progress | This note |
| MP-134 | In Progress | The rest of the PWA shell story: authenticated data and private caching |
| MP-73 | In Progress | Real Cognito sign-in, which needs MP-71 (Terraform foundation) and MP-197 (phone passkey test), each with its own yes |
| MP-76, MP-83 | To Do | Build step 4, when asked |
| MP-12, MP-21, MP-22, MP-24 | In Progress | Older specification stories from before sign-off; check each against the signed baseline before touching it |
| MP-19 | In Review | The MA reconciliation; never auto-closed |
| MP-197 | To Do | Do Cognito passkeys work in a phone browser, and does a revoke remove one |
| MP-201 | To Do | The admin facts selftest sometimes segfaults in the PR hook; a rerun passes |

Done on 24 November: MP-66, MP-180, MP-183, MP-187, MP-192, MP-193, MP-194, MP-202, MP-203, MP-204, MP-205. The other
To Do stories are the signed baseline's 136 stories; none is authorised to build (`implementation_authorised` stays
false in the phase-story baseline).

## What the owner still has to decide

From the MP-66 approval record, `docs/design/reviews/MP-66/README.md`, which lists every item and who decides it:

- Values a pick chose a rule for and left open: the price grace (OWN-07), the reconciliation limit (OWN-31), the alert
  lines (MP40-Q11a), the upload limits (MP40-Q1), the offline time-out (OWN-37), the fresh sign-in and revocation times
  (OWN-39), a replay's wait (OWN-08).
- Proposals no pick settles yet, each labelled "Proposed · id" on the design pages (the record lists all of them).
- Unverified: passkeys in a phone browser (MP-197); how a browser protects its offline copy, an architecture answer
  needed before that part is built; widgets and sharing on free 7-day Apple builds.
- The real-phone check at 20% brightness and VoiceOver (MP-180): the owner pressed "Accept without checking", so it is
  not done and stays open.
- The sidebar says "Track record" where the phone tab says "Record"; the brand mark is Proposed.

And the next permission: after step 4, the owner "decide[s] again" how far the build goes (MP-66, "Keep the four steps").

## Rules that bind the next session

These are in the repo; read them rather than this summary.

- **Order of authority:** owner's answers, then root docs, then everything else (`docs/planning/baseline-signoff-2026-11-03/README.md`).
- **Ship gate:** never raise a PR, merge, or move an issue to Done unless the owner asks in the running prompt. Branch,
  commit, push, create and comment on issues freely (`.claude/rules/jira-flow.md`).
- **Review:** offer the independent review at the end of the work, in the same question as the ship question; a yes
  covers one round only (`.claude/rules/independent-review.md`, with 64 lessons).
- **Build scope:** only the four steps, locally, on synthetic data. No AWS change except through Terraform in
  `infra/terraform/`, and no apply, deploy or paid call without the owner asking (`.claude/rules/aws-changes.md`).
- **Cost:** £100 a month all-in (£70 operating, £30 reserve) (`AGENTS.md`).
- **Designs:** start from Prism, made in the repo, synced one way to private Claude artifacts and recorded in
  `docs/design/artifacts.json` (`.claude/rules/design-sync.md`).
- **Records move together:** a Jira change refreshes `docs/planning/trace.json` in the same PR (`.claude/rules/plan-sync.md`).
- **Product limits:** no trading, no broker credentials, no personalised financial advice (`AGENTS.md`).
- **Retired facts** are barred by `scripts/check_retired_facts.py`; add a newly retired fact to `docs/planning/retired-facts.json` the same day.

## Things that trip people up

- Codex agents (Astra, Sol) work in this repo too, sometimes in the main checkout. Check `git status` and the branch
  before editing; prefer a worktree under `../mypaisaa-prediction-worktrees/`. Codex keeps its own config in `.codex/`
  and `.agents/`; Claude does not edit those files, two of which tests pin by digest.
- Use the `gh` CLI for GitHub; the GitHub MCP is not wanted.
- An artifact republish is refused unless the live copy was read in full. The service wraps a page in a doctype line and
  closing tags, so strip those before comparing hashes.
- The Lucid connector cannot edit existing documents: recreate a page as a new document and record the old one as
  superseded in its manifest.
- After a Confluence write, read the page back and record it (`docs/confluence/build_pages.py set-readback`), or CI's
  Confluence receipts check fails.
- CodeQL alerts on a PR's merge ref show only alerts new to the PR; confirm on `main`'s own analysis after a merge.
- Old worktrees from merged branches are still on disk (MP-182, MP-184, MP-185, MP-191, MP-198, MP-199, MP-20, MP-200,
  and several under `.claude/worktrees/`). Nothing depends on them; removing them needs the owner's yes.

## Starting prompt

```text
Pick up Mypaisaa Prediction at /Users/arundutta/projects/mypaisaa-prediction.
Read docs/handover/claude-2026-11-24/README.md, then AGENTS.md and .claude/rules/.
Check git status, the branch and the open PRs, and read the live MP Jira board:
this note is dated 24 November 2026 and the records may have moved since.
Say what is built, what is open and what the next step is. Start nothing beyond
that until I ask: build step 4 (MP-76, MP-83) waits for my word.
```
