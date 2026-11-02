# Codex workflows and Claude adaptation

This chapter records repository behaviour at `2e6439858de7b5e4209adab91491c5846e215cb4` on 2 November 2026. It is a handover, not an independent review, permission to run one, or evidence that Claude has been reconfigured. It describes the files and history inspected; installed global hooks, plugin availability and live service enforcement were not reverified.

The immediate boundary is requirements-first: agree researched architecture, shared contracts and the complete phase/story baseline, then approve end-to-end UX, then obtain explicit application implementation authority. Read [AGENTS.md](../../../AGENTS.md) and the [current reconciliation pack](../../planning/ma-reconciliation-2026-11-02/README.md). Documentation delivery and knowledge transfer do not clear those gates. MA provides comparison material, not inherited MP decisions or permissions.

## What Codex added, and why

The six repository-local skills are procedures, not autonomous services. Their routing authority is [workflow.md](../../../.codex/rules/workflow.md). They make user choices, evidence and product status explicit, while reducing repeated broad tests and preventing earlier review fixes from disappearing.

| Procedure and source | Trigger and Codex behaviour | Recommended Claude-native equivalent |
| --- | --- | --- |
| [autoship](../../../.agents/skills/autoship/SKILL.md) | Finishing an MP issue: identify its acceptance criteria, preserve unrelated work, run gates, prepare issue branch/commit/push, then obtain missing review/shipping permission. | A Claude project command or skill using the same issue/commit evidence and separate PR, merge and closure authority. Keep remote merge, Jira closure and local return as separately verified outcomes. |
| [mp-independent-review](../../../.agents/skills/mp-independent-review/SKILL.md) | A ready deliverable: offer lanes, named regression checks and five-round ceiling; fresh approval before each round. | A coordinator skill delegating to fresh blind Claude reviewers, retaining snapshots, fixed findings, manual evidence and delta scope. Apply the owner's current per-round consent instruction when adapting the older Claude wording. |
| [mp-review-regression](../../../.agents/skills/mp-review-regression/SKILL.md) | Rechecking recorded fixes: approve the named ledger, inspect commands, then run every entry. An enclosing review approval can include its named regression run. | A guarded project command around the existing Python runner; do not silently execute it on chat startup or confuse the flag with consent. |
| [mp-plan-sync](../../../.agents/skills/mp-plan-sync/SKILL.md) | Comparing local plans, Jira, Confluence, designs and implementation: approve a precise scope, begin with check-only evidence, propose corrections before approved writes. | A Claude reconciliation skill with distinct read comparison, write proposal, approved application and readback stages. No continuous sync is implemented. |
| [mp-design-first](../../../.agents/skills/mp-design-first/SKILL.md) | Once UX work is authorised: material new directions receive two or three representative options and an owner selection before implementation. Small approved-system changes need no manufactured alternatives. | A Claude design workflow using available capabilities, clearly synthetic examples, accessible charts and full loading/stale/error/offline states. The prerequisite architecture and UX gates still apply. |
| [mp-architecture-diagrams](../../../.agents/skills/mp-architecture-diagrams/SKILL.md) | Significant architecture or AWS diagrams: inspect current decisions and existing Lucid documents, use native service shapes, preserve source/export evidence and distinguish proposed from implemented. | A Claude skill using its available Lucid connector and local manifests, with separately scoped external updates. Retain static alternatives, reduced motion and explicit manual-sync limits. |

Do not copy `.codex/hooks.json` into Claude. Translate the intended procedure into supported Claude mechanisms after inspecting that runtime's actual project/global configuration and tool contracts. Reading these notes and sources is preparation; configuration changes need their own authorised scope.

## Approval boundaries and review mechanics

Independent review, regression and plan sync answer different questions. Review asks whether the deliverable satisfies its requirements beyond what gates measure. Regression asks whether every recorded fix still holds. Plan sync compares source-of-truth records and may prepare authorised updates. Approval for one does not authorise either of the others, external publication or shipping.

The Codex workflow requires a specific choice before each distinct plan-sync operation, standalone regression run and review round, even when initially requested. Silence, defaults and unrelated agreement grant nothing. A review offer belongs at the end of making, alongside any shipping question; it names lanes and its regression scope. A refusal means report “unreviewed” and the gates actually run. An unavailable approved review is failed/unavailable, not a substitute maker review.

The existing [Claude Jira rule](../../../.claude/rules/jira-flow.md) still describes the older initial-yes process, allowing up to five rounds without another instruction, and shared autoship retains other runtimes' existing global rule. Codex explicitly requires permission before every round. **The owner's current project instruction requires approval before every review round and should govern Claude's adaptation too.** This resolves the desired policy; the remaining work is to express it correctly in Claude's active instructions. Existing Claude files are legacy evidence, not proof that this update has been configured.

The review method itself remains consistent:

1. The maker runs applicable gates and fixes their failures before reviewers begin. Record changed components, selected commands/results, reasons for broader-test deferrals and any reused evidence.
2. Run the full approved fixed-findings ledger for this deliverable before every round, regardless of the current delta. Verify every outstanding manual item with a fresh independent verifier before reviewers start.
3. Supply fresh blind reviewers with requirements, applicable rules, the deliverable and fixed list, never maker reasoning. Substantial work uses parallel lanes covering their joins. Maximum concurrency is five total agents, coordinator included, subject to a lower runtime limit. This handover's authoring agents are not reviewers.
4. Round one covers everything. Later rounds cover only the immediately preceding round's fixes and directly affected connections; unchanged lanes sit out. Preserve the reviewed commit or reproducible snapshot and exclude unrelated changes.
5. Record fixed blockers with behavioural checks, state, gate evidence and review lessons. Stop after five rounds if blockers remain, giving remaining work and estimated effort. Non-blocking findings alone do not initiate another round.

[Review optimisation](../../review-optimisation.md) is an instruction-based policy, not an automatic test selector. Fast applicable checks run each round; broader suites follow affected contracts and risk; expensive browser/device/end-to-end checks run at milestones or sooner when needed. Shipping still requires release gates. Broader successful evidence can be reused only with recorded unchanged source, dependencies, configuration and environment. Ledger entries cannot be silently skipped, deduplicated or cached: the current runner executes sequentially.

## What the hook and regression tooling actually enforce

[hooks.json](../../../.codex/hooks.json) registers a five-second `UserPromptSubmit` command invoking [workflow_reminder.py](../../../.codex/hooks/workflow_reminder.py). Its case-insensitive expression recognises `review`, `regression`, `plan-sync`/`plan sync`/`plansync`, `drift`, and `synchronise`/`synchronize`. Matching prompts receive additional workflow context. It neither runs a review nor intercepts a tool action, presents a mandatory approval dialog, stores consent or checks subsequent actions. The workflow says Codex hook definitions must be trusted through `/hooks`; a file's existence does not establish trust or activation. The written rules apply even when it is inactive.

The reusable implementation is [review_regress.py](../../../scripts/review_regress.py), documented by [review-ledger.md](../../../.codex/rules/review-ledger.md). For future approved use, `python3 scripts/review_regress.py MP-<number> --approved` selects `review/MP-<number>/fixed.json`; `LOCAL` selects `review/fixed.json`. These commands are recorded here, not executed by this handover. Never fabricate an issue key.

Entries support file-pattern checks, argument-array commands, expected non-zero failures and manual items. Commands run without a shell from the project root, with separate process groups and a maximum 60-second timeout; timeout cleanup kills and reaps that group. Detached children are outside that guarantee. File references must resolve within the repository, including symlinks. Argument arrays are not a security sandbox: commands retain the user's permissions and must be inspected before approval and execution.

Exit `0` means automated checks passed **or no ledger existed**; absence must be reported as no checks run. Exit `1` means failed checks, `2` malformed/unavailable execution, and `3` outstanding manual verification. A matching failure code alone does not prove the intended refusal. `--approved` is an operator acknowledgement, not evidence of actual user consent.

[review-policy.json](../../../.codex/review-policy.json) requires manual verification every round, for all outstanding items, by a fresh independent verifier, stopping if unverified. Evidence includes finding ID, evidence, verifier and result. The runner reports manual work; it does not perform that verification or enforce the complete review state machine.

[review-document-baseline.json](../../../.codex/review-document-baseline.json) pins full skill/ledger-document digests. [Runner tests](../../../tests/test_review_regress.py) cover synthetic ledgers, path/symlink/permission failures, timeout descendants, policy mutations and setup review history. They read the checked-in setup policy/history, but do not execute its real ledger. Digest/history checks detect certain edits; coordinated edits are not tamper-proof and a digest does not establish meaning. Intentional edits to pinned documents require policy scrutiny and matching baseline maintenance. Carry forward the concrete lessons in [review-checklist.md](../../../.codex/rules/review-checklist.md), not just the original setup checklist.

## Plan, architecture and publication adaptation

[plan-sync.md](../../../.codex/rules/plan-sync.md) requires relevant status changes to reconcile README, architecture and tech-stack documents together, then the active decision/phase/story pack, Jira descriptions as well as comments/status, and Confluence drafts versus published content. Read current root links to find active manifests; bootstrap diagrams may be historical. Smart Clearance is a documentation-style reference only. Draft story IDs are not Jira keys, phase coverage is not full source-clause decomposition, and dependency availability is not product implementation.

[architecture-diagrams.md](../../../.codex/rules/architecture-diagrams.md) requires Lucid for significant architecture, colourful native components, labelled flows and implementation state. Requested network views include justified VPC attachment, subnet/AZ/route/endpoint/security-group roles and external egress options. Managed services must not be drawn inside customer subnets incorrectly. Draw.io supports process companions. Never infer deployment, account, region, price or permission from an icon.

Before writes, read existing documents and preserve rich macros/media. Reuse actual page/document IDs, propose exact changes, and stay within approved external scope. Afterwards record actual versions, IDs, hashes, resolved links and partial failures. Saved links and hashes establish a traceable snapshot, not automatic bidirectional synchronisation. The [future visual direction](../../planning/future-architecture-sites-ux-direction-2026-11-02.md) adds the current local-first Sites/UX quality reference; do not revive Claude Design syncing.

## Delivery, existing Claude configuration and external dependencies

[jira-flow.json](../../../.claude/jira-flow.json) and [taxonomy.md](../../../.claude/jira/taxonomy.md) are existing shared/legacy MP configuration from bootstrap. Transition IDs are empty and must be discovered on the specific issue. Setup-era statements about absent issues, epics or labels are historical. The [Claude autoship entry](../../../.claude/skills/autoship/SKILL.md) delegates to the shared skill; it is not a completed Claude workflow migration.

[GitHub workflow documentation](../../github-workflow.md) specifies `main`, actual `MP-<number>-<slug>` branches, keyed commit subjects and PR titles. [check_pr.py](../../../scripts/check_pr.py) checks branch/title key agreement, destination and keyed commit syntax; it does not verify Jira existence, acceptance completion or consent. [PR-policy tests](../../../tests/test_pr_policy.py) exercise those metadata checks.

Preparing an authorised issue branch is distinct from raising a PR, merging and closing an issue: those acts require the current prompt's explicit authority. A merge decision names the exact PR/head, issue closure if intended, and safe return to local `main`. Verify five checks on that head and no blockers; use an expected-head guard. Merge success precedes named-issue closure; discover its Done transition. A failed Jira closure must not cause a second merge. Preserve branches and dirty work; return to main only by safe checkout and fast-forward, without reset, stash or forced discard.

The executable CI is [verify.yml](../../../.github/workflows/verify.yml) plus [jira-key.yml](../../../.github/workflows/jira-key.yml): Backend, Codex tooling, Static preview, Workflow lint and Jira traceability. The prose Static preview description is older: current YAML also runs `site` installation/build/check; tooling includes the README checker. These checks do not grant independent-review consent or run real ledgers. The documented 1 November branch-protection API refusal means [.github/main-protection.json](../../../.github/main-protection.json) is desired policy, not verified active enforcement; live protection was not rechecked here.

Global/plugin facilities are separate: user-supplied instructions describe jira-flow's shipping hook, stray-sweep, AWS/secret-handling skills and capability discovery through aitmpl. Atlassian, Lucid, GitHub, Sites and design tools are external capabilities, not installed by these six skills. Their global installation, authentication, hook activation and Claude equivalents remain to be inspected. Do not transplant Codex schemas or assume those tools exist in Claude.

## Change trail and adaptation checklist

Relevant Git commits are `da3dd94` (bootstrap/shared Jira files), `5c6f08e` (Codex skills, reminder, regression safeguards and proportionate reviews), `37985ae` (main/CI/traceability), `d44857c` (merge consent and safe main return), `c315261` (explicit linked closure), `d4b9e0f` (Lucid and plan-sync contracts), `754a4bc` (technical networking and phasewise publication evidence), and `6391656`/`f2a9113` (requirements-first reconciliation and budget boundary updates). Use `git show <commit> -- <path>` for precise provenance.

Before Claude adapts itself:

- Read these notes, current owner decisions, the named MP issue and its acceptance criteria, relevant Confluence content and all six skill sources.
- Inventory Claude's actual project/global rules, hooks, tools and permissions; identify conflicts, especially per-round consent, without changing them during discovery.
- Propose Claude-native instruction/skill entry points and any supported hook separately. Preserve approval semantics; label reminders as advisory.
- Retain the existing Python runner and evidence formats where suitable. Test any future adapter with isolated fixtures, not real ledgers without approval.
- Record which changes were proposed, approved, configured and verified. Keep application/UX implementation and external publication behind their own gates.
