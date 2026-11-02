# Jira, Confluence, Git and visual-source map

Snapshot date: **2 November 2026, Europe/London**. This chapter is a read-only handover inventory. It does not constitute a formal plan-sync, page-body/macro parity audit or permission to publish changes. The [machine-readable inventory](live-source-inventory.json) contains all 30 Jira issue summaries and all 27 visible MP Confluence page summaries, including versions. No pagination remained in these queries. External state can change; refresh it in Claude before acting.

## Connect to the correct project

- Repository: [gilipersonal/mypaisaa-prediction](https://github.com/gilipersonal/mypaisaa-prediction). Canonical local root: `/Users/arundutta/projects/mypaisaa-prediction`.
- Jira: [MP backlog, board 167](https://duttaarun2015.atlassian.net/jira/software/projects/MP/boards/167/backlog). Cloud ID `81c51173-bbea-4905-bbc5-1a880fa348bb` is an identifier, not a credential.
- Confluence: [MP space mypaisaapr](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/overview?homepageId=5145345); space ID `5145174`.
- MA reference: [mypaisaaag](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/overview), local `/Users/arundutta/projects/mypaisa-agent`. Read concepts and evidence; MP writes belong in MP. Do not inherit MA's credentials, resources, permissions or product scope.

## Jira work inventory

Statuses below are live read results, not inferred from branch names. Read each issue's full description, acceptance, comments and links before working it. In particular MP-19 and MP-20 remain **In Review despite their delivered PRs being merged**: the owner explicitly left them open, and MP-20's wider baseline acceptance is unfinished. Do not auto-close them during takeover.

| Key | Type | Status | Scope |
| --- | --- | --- |
| [MP-1](https://duttaarun2015.atlassian.net/browse/MP-1) | Task | Done | Configure Codex workflows and GitHub CI |
| [MP-2](https://duttaarun2015.atlassian.net/browse/MP-2) | Task | Done | Close the linked Jira issue after an approved PR merge |
| [MP-3](https://duttaarun2015.atlassian.net/browse/MP-3) | Task | Done | Synchronise product plans, Jira roadmap and Confluence knowledge base |
| [MP-4](https://duttaarun2015.atlassian.net/browse/MP-4) | Epic | To Do | Foundation and guardrails |
| [MP-5](https://duttaarun2015.atlassian.net/browse/MP-5) | Epic | To Do | Trusted data and portfolio ledger |
| [MP-6](https://duttaarun2015.atlassian.net/browse/MP-6) | Epic | To Do | Prediction baseline and scientific controls |
| [MP-7](https://duttaarun2015.atlassian.net/browse/MP-7) | Epic | To Do | Research and decision support |
| [MP-8](https://duttaarun2015.atlassian.net/browse/MP-8) | Epic | To Do | Native Apple experience |
| [MP-9](https://duttaarun2015.atlassian.net/browse/MP-9) | Epic | To Do | Production hardening |
| [MP-10](https://duttaarun2015.atlassian.net/browse/MP-10) | Task | In Progress | Confirm personal-use data licences and instrument policies |
| [MP-11](https://duttaarun2015.atlassian.net/browse/MP-11) | Task | To Do | Design personal authentication and API access controls |
| [MP-12](https://duttaarun2015.atlassian.net/browse/MP-12) | Task | In Progress | Define portfolio and prediction persistence schemas |
| [MP-13](https://duttaarun2015.atlassian.net/browse/MP-13) | Task | To Do | Plan encrypted backups and restore verification |
| [MP-14](https://duttaarun2015.atlassian.net/browse/MP-14) | Task | Done | Record requirements-first development and local design decisions |
| [MP-15](https://duttaarun2015.atlassian.net/browse/MP-15) | Task | Done | Compare AWS architecture and ML plans within the all-in monthly budget |
| [MP-16](https://duttaarun2015.atlassian.net/browse/MP-16) | Task | Done | Create realistic synthetic US UK India local and dev test data |
| [MP-17](https://duttaarun2015.atlassian.net/browse/MP-17) | Task | Done | Create cinematic end-to-end architecture atlas on the private Site |
| [MP-18](https://duttaarun2015.atlassian.net/browse/MP-18) | Task | Done | Document the complete AWS, SageMaker and Anthropic architecture |
| [MP-19](https://duttaarun2015.atlassian.net/browse/MP-19) | Task | In Review | Reconcile MA concepts and research MP architecture before UX |
| [MP-20](https://duttaarun2015.atlassian.net/browse/MP-20) | Task | In Review | Freeze the researched architecture and phase/story baseline |
| [MP-21](https://duttaarun2015.atlassian.net/browse/MP-21) | Task | In Progress | Specify forecast tasks, scientific evaluation and model eligibility |
| [MP-22](https://duttaarun2015.atlassian.net/browse/MP-22) | Task | In Progress | Specify performance, exposure and ranked investment decisions |
| [MP-23](https://duttaarun2015.atlassian.net/browse/MP-23) | Task | To Do | Choose durable workflows and define API queue replay semantics |
| [MP-24](https://duttaarun2015.atlassian.net/browse/MP-24) | Task | In Progress | Select bounded AWS ML training and forecast serving architecture |
| [MP-25](https://duttaarun2015.atlassian.net/browse/MP-25) | Task | To Do | Specify bounded Anthropic research tools batches and memory |
| [MP-26](https://duttaarun2015.atlassian.net/browse/MP-26) | Task | To Do | Specify offline online and human-calibrated agent evaluations |
| [MP-27](https://duttaarun2015.atlassian.net/browse/MP-27) | Task | To Do | Specify run evidence telemetry and conservative cost admission |
| [MP-28](https://duttaarun2015.atlassian.net/browse/MP-28) | Task | To Do | Specify owner admin approvals audit and launch controls |
| [MP-29](https://duttaarun2015.atlassian.net/browse/MP-29) | Task | In Progress | Choose MP environment region network and all-in cloud envelope |
| [MP-30](https://duttaarun2015.atlassian.net/browse/MP-30) | Task | To Do | Specify client compatibility release regression and alert delivery |

The six epics MP-4–MP-9 are the historical organisation. PH-00–PH-09 is the later ten-phase planning map; do not assume equal numbering. The [phase/story baseline](../../planning/ma-reconciliation-2026-11-02/phase-story-baseline.json), [gap register](../../planning/ma-reconciliation-2026-11-02/gap-register.json) and [saved Jira write receipt](../../planning/ma-reconciliation-2026-11-02/jira-receipt.json) connect source gaps to planning tasks. The 64 local story IDs are not 64 created Jira stories. Parent relations in old receipts are historical write evidence; this slim live inventory does not certify every current hierarchy edge.

Recommended intake order: MP-20 baseline; MP-10 data rights; MP-12 financial/prediction contracts; MP-21/22 science and performance; MP-23/24/25/26 workflows/ML/agents/evals; MP-27/28/29/30 operations/admin/cloud/clients; then the relevant epic and older evidence issues. Reuse existing work instead of creating duplicate stories.

## Confluence page inventory

All pages below were discovered in MP and their **summary plus version** was read. A page with status `current` is a Confluence current version, not an approved product architecture. A successful summary read does not mean every body, attachment, macro or visual was inspected. Start with the 13 `DRAFT | MP` pages and their local publication receipts; earlier hubs may carry older assumptions.

| Page | ID | Version at capture |
| --- | --- | --- |
| [Architecture and decision records](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5145394) | 5145394 | 5 |
| [Development, CI and Codex workflows](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5014127) | 5014127 | 6 |
| [DRAFT / MP / Architecture areas and phase documentation contract](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5832705) | 5832705 | 2 |
| [DRAFT / MP / Architecture finalisation and sign-off](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5799937) | 5799937 | 2 |
| [DRAFT / MP / MA concept reconciliation and researched gaps](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/4981720) | 4981720 | 2 |
| [DRAFT / MP / PH-00 / Complete baseline and contract decisions](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5865473) | 5865473 | 2 |
| [DRAFT / MP / PH-01 / Standalone portfolio, all-method imports and source lineage](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5668883) | 5668883 | 2 |
| [DRAFT / MP / PH-02 / Identity, private runtime, audit and launch cost controls](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5865504) | 5865504 | 2 |
| [DRAFT / MP / PH-03 / Market data, performance and portfolio risk](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5668914) | 5668914 | 2 |
| [DRAFT / MP / PH-04 / Scientific baseline, full Forecaster and controlled learning](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/4981787) | 4981787 | 2 |
| [DRAFT / MP / PH-05 / Evidence research, agents, chat and evaluations](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5832730) | 5832730 | 2 |
| [DRAFT / MP / PH-06 / Web discovery, ranked actions, proof and briefings](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5799960) | 5799960 | 2 |
| [DRAFT / MP / PH-07 / Native Apple, offline and push](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5898241) | 5898241 | 2 |
| [DRAFT / MP / PH-08 / Operational acceptance and controlled personal launch](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5832761) | 5832761 | 2 |
| [DRAFT / MP / PH-09 / Versioned extensions and conditional future transfer](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5701634) | 5701634 | 2 |
| [MP / Architecture blueprint](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5014267) | 5014267 | 2 |
| [MP / AWS, Anthropic and SageMaker forecasting deep dive](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/4981639) | 4981639 | 3 |
| [MP / Layered development planning - 1 November 2026](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/4981438) | 4981438 | 3 |
| [MP / Phased delivery plan and story map](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5014255) | 5014255 | 1 |
| [MP / Portfolio and import specification](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/4981454) | 4981454 | 1 |
| [MP / Technology stack and decision matrix](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5014301) | 5014301 | 2 |
| [mypaisaa-prediction](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5145345) | 5145345 | 3 |
| [Product brief and knowledge base](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/4981241) | 4981241 | 4 |
| [Roadmap and current implementation status](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5112476) | 5112476 | 3 |
| [Security, cost and operations](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5112525) | 5112525 | 4 |
| [Template - How-to guide](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5145359) | 5145359 | 1 |
| [Template - Troubleshooting article](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5145372) | 5145372 | 1 |

## What was published, and what remains local

- MP-15 published the layered-planning material and bounded updates to earlier hubs. Preserve markers, existing content and attachments when updating them.
- MP-18 published the AWS/Anthropic/SageMaker deep dive with three native Lucid exports. Its original component/model counts and proposal labels are a dated design, not final runtime quantities.
- MP-19 published **13 draft pages**, all version 2 at this handover: reconciliation, finalisation, documentation structure and PH-00–PH-09. [Exact local page map](../../planning/ma-reconciliation-2026-11-02/confluence-page-ids.json), [publication receipt](../../planning/ma-reconciliation-2026-11-02/confluence-publication-receipt.json) and [readback validation](../../planning/ma-reconciliation-2026-11-02/confluence-publication-validation.json) preserve versions/hashes.
- Foundation Pack 1 prepared **five further page bodies plus one cost-chart attachment** locally. [Publication proposal](../../planning/foundation-specifications-2026-11-02/publication-proposal.json) has no published content IDs. These were not uploaded.
- The [twelve later policy receipts](../../planning/foundation-policy-discussion-2026-11-02.md), future visual-direction note and current README/logo updates are in Git main at the source baseline. Do not claim Confluence automatically contains them. The recorded proposal/page set and this inventory show no foundation publication; this is not a semantic search of every possible external location.

Any future write needs the approved exact scope, fresh target reads/versions, collision and owned-marker checks, attachment identity handling and readback verification. Keep page IDs stable where appropriate. The MP publisher's retry/marker lessons matter; do not rebuild the space by blindly re-uploading every file.

## Git delivery history and worktrees

The [Git delivery inventory](git-delivery-inventory.json) freshly confirms PRs #1–#11 are merged. This is distinct from Jira acceptance or architecture approval.

| PR | Delivered work | State at source baseline |
| --- | --- | --- |
| [#1](https://github.com/gilipersonal/mypaisaa-prediction/pull/1) / [#2](https://github.com/gilipersonal/mypaisaa-prediction/pull/2) | Codex workflow/CI, then approved merge-to-Jira convention | Merged history; current explicit permission and acceptance rules still govern |
| [#3](https://github.com/gilipersonal/mypaisaa-prediction/pull/3) / [#4](https://github.com/gilipersonal/mypaisaa-prediction/pull/4) | Visual planning sync; requirements-first records | Merged history |
| [#5](https://github.com/gilipersonal/mypaisaa-prediction/pull/5) / [#6](https://github.com/gilipersonal/mypaisaa-prediction/pull/6) | Synthetic foundations; expanded requirements/plans/import samples and MP publication | Merged history; approval is scoped to those deliverables |
| [#7](https://github.com/gilipersonal/mypaisaa-prediction/pull/7) / [#8](https://github.com/gilipersonal/mypaisaa-prediction/pull/8) | Private architecture atlas; technical Lucid deep dive | Merged; independent review skipped for those delivery choices |
| [#9](https://github.com/gilipersonal/mypaisaa-prediction/pull/9) | MA reconciliation and future visual-direction note | Merged as `b962a74`; MP-19 remains open |
| [#10](https://github.com/gilipersonal/mypaisaa-prediction/pull/10) | Foundation Pack 1, five maker fixes, policy journal and structured README | Merged as `79fea2d`; further review declined; MP-20 remains open |
| [#11](https://github.com/gilipersonal/mypaisaa-prediction/pull/11) | Compact logo-bearing badges and animated Forecast Coin | Merged as `2e64398`; five PR checks passed; independent review waived |

The source baseline for this handover is `2e6439858de7b5e4209adab91491c5846e215cb4`. This handover itself is authored on `MP-20-claude-handover`. Two retained sibling worktrees contain earlier delivered source branches: `../mypaisaa-prediction-worktrees/MP-20-foundation-specifications` at `ee77ece`, and `../mypaisaa-prediction-worktrees/MP-20-readme-logo-badges` at `8605576`. They are not current main and must not replace newer receipts. No reset, cleanup or branch deletion is needed to take over. Inspect current status before any checkout.

## Diagrams, Site and current visual identity

- [Lucid technical source](https://lucid.app/lucidchart/02218133-613a-4b78-aea4-e0dba26db386/edit): pages 6–8 cover request topology, events/batching and forecasting. [Local manifest](../../diagrams/aws-e2e-2026-11-01/manifest.json) records version 9587 and saved hashes. Live Lucid state was not refreshed for this handover.
- [Diagram catalogue](../../diagrams/README.md) retains earlier bootstrap/system sources, supporting Draw.io, animations and static alternatives. Do not promote the historical single-host/PostgreSQL or Step Functions diagrams into current selected topology.
- [Future architecture/Sites/UX direction](../../planning/future-architecture-sites-ux-direction-2026-11-02.md) explains the later MA/Apple/Monzo quality reference and inspection limits. The old cinematic Site was not visually accepted.
- The MP presentation destination remains **ChatGPT Sites**, even when Claude becomes the working assistant. Keep local sources first. [Site identity](../../../site/.openai/hosting.json) is `appgprj_6ae70bec3f6c8191947480b6423b4bb1`; source is [site/](../../../site/), with React/Vite/Motion/Remotion documentation components and tracked `dist/`. This is not the SvelteKit product implementation.
- [Current logo/badge source](../../readme/README.md), [motion study](../../readme/logo-preview.html), [Shields source manifest](../../readme/shields-badges.json) and [maker evidence](../../readme/verification.json) preserve the owner-requested correction. Native product UX is still gated separately.

## Connector reality for Claude

At this handover, Codex exposed Atlassian, GitHub, Lucid, Draw.io, Playwright, Maestro, Postgres and Sites tool families. Only the stated Atlassian inventory reads and local Git reads were exercised here. Tool presence does not prove the same connector exists or is authenticated in Claude. No AWS MCP tool family was exposed in this session's discovered catalog; an earlier AWS CLI/MCP login discussion is historical, not a current connection test. Claude should discover its own tools and make a narrow authorised read to verify each needed connection. Do not migrate tokens, OAuth caches, API keys or environment-secret values.
