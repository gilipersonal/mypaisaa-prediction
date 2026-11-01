# MP Confluence publication map

**Prepared 1 November 2026. Local publication proposal; nothing in this pack has been published.** Target: the existing **mypaisaa-prediction** knowledge base, space key `mypaisaapr`, space ID `5145174`. No MA page is a destination. The completed approved read-only comparison was reported in chat and made zero changes; this file is prepared separately under the later local-authoring permission. No external sync correction is applied. Round 1 found the blocking notice-composition issue; the author fix is prepared and round 2 remains unrun/not clean-certified.

The [structured map](confluence-page-map.json) carries the same target inventory and proposed mutations. Its local draft IDs identify pages to create later; they are not Confluence page IDs or Jira issue keys.

## Verified target and published baseline

The Atlassian connector read the current MP pages, space metadata and ancestors on **2026-11-01**, completing this inventory by **20:35 UTC**. Every knowledge page below is currently a direct child of the homepage. The space lookup returned no configured space instructions, consistent with `metadata.hasSpaceInstructions=false` on all six page reads. The space is a current knowledge base; its two template pages are outside this change.

| Existing page | ID | Published version | Version timestamp UTC | Proposed treatment |
| --- | --- | --- | --- | --- |
| [mypaisaa-prediction home](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/overview?homepageId=5145345) | 5145345 | 2 | 2026-11-01 13:56:44.179 | Reuse; bounded current-planning notice and navigation update |
| [Product brief and knowledge base](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/4981241) | 4981241 | 3 | 2026-11-01 14:09:40.749 | Reuse; current requirement digest and child-spec link |
| [Architecture and decision records](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5145394) | 5145394 | 4 | 2026-11-01 14:06:08.693 | Reuse; historical/current separation and two child links |
| [Roadmap and current implementation status](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5112476) | 5112476 | 2 | 2026-11-01 13:54:40.961 | Reuse; link new planning index and qualify older phase snapshot |
| [Development, CI and Codex workflows](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5014127) | 5014127 | 5 | 2026-11-01 14:09:37.929 | Reuse; add current pack/approval/evidence links |
| [Security, cost and operations](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5112525) | 5112525 | 3 | 2026-11-01 14:06:13.461 | Reuse; current cost/retention/auth digest, preserve older evidence |

These versions describe **already published older snapshots**, mostly marked `d0e0c14` on `main`. They do not certify the new local pack. The local preparation branch was `MP-15-requirements-decisions`, with HEAD `082972bf25fccf03ff72563257d5f7dd07f39c95`; the new documents were being drafted locally and are not asserted to exist at that commit or on GitHub. Publication must record the eventual approved source revision and hashes.

## Proposed page tree

Existing pages keep their IDs, names and parents. Five new, bounded children carry the substantial new documents. This avoids replacing the knowledge base with a second copy or putting every document into one long page.

```text
mypaisaa-prediction [5145345, existing]
├── Product brief and knowledge base [4981241, existing]
│   └── MP | Portfolio and import specification [NEW, page ID not allocated]
├── Architecture and decision records [5145394, existing]
│   ├── MP | Architecture blueprint [NEW, page ID not allocated]
│   └── MP | Technology stack and decision matrix [NEW, page ID not allocated]
├── Roadmap and current implementation status [5112476, existing]
│   └── MP | Layered development planning - 1 November 2026 [NEW]
│       └── MP | Phased delivery plan and story map [NEW]
├── Development, CI and Codex workflows [5014127, existing]
└── Security, cost and operations [5112525, existing]
```

The planning index links all five new pages and the five existing knowledge hubs; semantic placement and cross-links give readers one entry point without duplicating the detailed content. No page moves, renames, deletions, template edits, ownership transfers or permission changes are proposed.

## Proposed creates and local source mapping

| Draft page ID / destination | Exact local source payload | Bounded page contents and joins |
| --- | --- | --- |
| `NEW-PLANNING-INDEX`; parent 5112476 | [README.md](README.md), [index.html](index.html), this map and [JSON map](confluence-page-map.json) | One navigation/status digest of the pack: layer overview, local approved-versus-proposed status, unresolved decisions, links to four detailed child/peer pages, existing MP hubs and MP-15. Use README as the prose source; index.html is a local reading view, not a separate Confluence page or Sites publication. |
| `NEW-PORTFOLIO-IMPORT`; parent 4981241 | [portfolio-import-spec.md](portfolio-import-spec.md), [portfolio-import-stories.json](portfolio-import-stories.json), [portfolio-import-contracts.json](portfolio-import-contracts.json), [portfolio-import-examples.json](portfolio-import-examples.json), [local reading view](portfolio-import-spec.html) | Portfolio/import contracts, user workflow, data sufficiency, all five import methods, preview/confirmation/reversal, acceptance and open decisions. Render `L1-S01`–`L1-S16` as a table with their own IDs and evidence links, not fabricated MP issue links. Reference contracts and worked examples as companions on this same page; the HTML reading view creates no additional page. Join requirements/DEC links, fixture evidence, architecture interfaces and the phase plan. |
| `NEW-PHASED-PLAN`; parent `NEW-PLANNING-INDEX` | [phased-delivery-plan.md](phased-delivery-plan.md), [phase-story-map.json](phase-story-map.json) | Ordered phases, dependencies, entry/exit evidence, cross-cutting cost/security/science/UX controls, local story map and approval gates. Distinguish the new proposed sequence from existing Phase 0–5 epics; preserve actual MP issue mappings only when verified. |
| `NEW-ARCHITECTURE`; parent 5145394 | [architecture-blueprint.md](architecture-blueprint.md), [network appendix](network-topology-options.md) | Planned component/layer contracts, import and evidence boundaries, request/batch/research flows, storage trade-offs, failure/authorization/cost constraints, open ADRs. Keep the current health/sample-SSE implementation separate from proposed product components. Inline N0/N1/N1-E network options and their native export on this same page; no extra child page. Link the stack matrix, portfolio contracts, phase gates and current visual inventory. |
| `NEW-TECH-STACK`; parent 5145394 | [tech-stack-matrix.md](tech-stack-matrix.md) | Requested versus installed/verified/proposed choices; service responsibilities and interfaces, deployment/cost consequences, alternatives, compatibility evidence and decisions still needed. Link the architecture, current manifests, canonical decisions and sources rather than repeating contracts. |

These are proposed payload mappings, not assertions that draft files are final or already uploaded. Local JSON remains the machine-readable companion; its tables may be rendered on the destination page. Eight named image attachment upserts are proposed under the new planning index as listed below; JSON companions are inline content, not attachments. New pages start as **Draft planning - owner approval pending; implementation not authorised**, even when an individual source decision is confirmed.

## Exact bounded updates to existing pages

Preserve existing content, links, rich macros and attachments. At publication, re-read the **full current draft as HTML**, inspect differences, and obtain a fresh draft snapshot token. The published versions above are evidence, not tokens to reuse for a write. Apply the following named blocks and link additions, not a whole-body replacement.

1. **Homepage 5145345:** prepend `Current requirements and layered planning - 1 November 2026`; link the planning index and show the requirements/UX approval boundary. Add the planning-index link in a bounded current-navigation block while preserving the existing navigation table. State MP-3 Done as historical sync, MP-15 In Progress as current planning, and MP-16 Done as fixture-tooling evidence only. Label the older £50 AWS-only line as a historical baseline and give the current £100 all-in planning envelope beside it.
2. **Product KB 4981241:** prepend `Current requirements baseline`; link canonical [product requirements](../aws-options-2026-11-01/product-requirements.md) and [DEC-001–041 register](../aws-options-2026-11-01/product-decisions.json), then the portfolio/import child and planning index. Summarise all five first-version import methods, long-term horizons, synthetic local/dev now, actual screenshots/PDFs later, discovery-first UX and cost dashboard at launch. Clearly identify the older CSV-only, pending-auth and Agent-SDK descriptions as historical where contradicted; retain the original snapshot as evidence.
3. **Architecture 5145394:** prepend `Current architecture direction and open decisions`; link both new children and the canonical decisions. State direct Anthropic Python **client-SDK** loop on Lambda, with models on Anthropic; Lambda/S3/DynamoDB is the AWS preference, with final storage/compute/service contracts and costing still proposed. Label the current single-host/PostgreSQL/Agent-SDK material, ADR-0005/0006 and old diagrams as the previous baseline requiring explicit reconciliation. Do not relabel them as a freshly approved Lambda deployment. Add the actual native page-5 network options and N0/N1/N1-E choice as proposed/unselected; no physical infrastructure is implied.
4. **Roadmap 5112476:** prepend `Current layered plan - proposed`; link the index and phase-plan page. Retain the existing implementation-status block and original phase/MP-4–MP-9 mapping as a dated snapshot. Do not infer current epic statuses from those older links. Explain that the new local story IDs are draft planning items; a later approved Jira write will allocate actual keys. No phase exit is declared complete by this pack. The approved check read MP-4–MP-13 as To Do, MP-15 In Progress, MP-16 Done and MP-3/MP-14 Done; preserve historical snapshots below rather than implying the old MP-3 In Progress wording is current.
5. **Workflow 5014127:** add `Layered planning publication and evidence`; link the index, page map, requirements/decision sources and MP-15. State precise-scope plan-sync approval before any later sync, explicit external-write approval, independent review only when approved, and current-prompt PR/merge/closure permissions. Preserve the existing workflow diagrams, commands and history; do not report their dated CI observations as new verification.
6. **Security/cost 5112525:** prepend `Current requirements delta - proposed implementation`; link canonical [audit/observability/cost requirements](../aws-options-2026-11-01/audit-observability-requirements.md), decisions, stack and plan. Summarise £100 all-in cash ceiling (£70 operation/£30 reserve), £60/£75/£85 forecast-cash actions, reported shared $200 Anthropic credit **unverified**, no automatic paid fallback, internal live estimates with Claude billing every six hours/AWS daily, priority cost dashboard, renewable 24-month originals, separate 14d/30d/90d telemetry, monthly recovery/audit exercises and Cognito/verified linking. Keep original £50 AWS-only allowances, single-host diagram and quarterly-drill text as visibly historical; do not imply an approved service allocation, current pricing, configured collectors, deletion job or provisioned auth. Add conditional NAT/interface-endpoint fixed-floor and reachability/policy/recovery gates; Region prices and any network selection remain open.

Each new page and update block carries a source/evidence footer: source path, eventual source revision/hash, decisions referenced, status, preparation/publish date, actual reviewer status, relevant phase/local story IDs and external page/issue links. Mark source URLs as pending until reachable. Do not construct GitHub links to uncommitted files or invent anchors/issue keys. When publishing, resolve local document links to the actual created/reused MP page IDs and use verified section links or source paths for JSON decision/story references.

## Source and evidence navigation

- **Authority:** [product-requirements.md](../aws-options-2026-11-01/product-requirements.md), [product-decisions.json](../aws-options-2026-11-01/product-decisions.json), DEC-001–041. An approved decision does not approve its unasked implementation defaults. DEC-041 postpones actual input collection for the current synthetic phase; it does not remove live identity, rights or pricing prerequisites.
- **Synthetic evidence:** [synthetic-test-data.md](../../synthetic-test-data.md) and [synthetic-import-samples.md](../../synthetic-import-samples.md). Link validated sample manifests/acceptance evidence from the portfolio and phase pages. Synthetic observations/accounts must never look like actual owner holdings. No private originals, account details or source data are copied to Confluence by this proposal.
- **Operational requirements:** [audit-observability-requirements.md](../aws-options-2026-11-01/audit-observability-requirements.md) and its existing source register. Reuse captured evidence; do not import MA accounts, policies, naming, permissions or ownership.
- **Visual sources:** [historical diagram guide](../../diagrams/README.md) and [historical manifest](../../diagrams/manifest.json) retain older system/deployment snapshot identities and versions. The current detailed native [MP system PNG](visuals/mp-system-architecture-native.png) is a byte-for-byte Lucid export from existing comparison document `02218133-613a-4b78-aea4-e0dba26db386`, new page `jvMISWi7AU3v` (page 4), document version **2703**. Its [native source snapshot](visuals/mp-system-architecture-source.json) and [export/validation manifest](visuals/architecture-lucid-manifest.json) record actual provenance; original A/B/C pages are unchanged. Supporting [workflow manifest](visuals/manifest.json) and [chart manifest](visuals/planning-chart-manifest.json) record exact source values and rendering checks. Confluence publication adds the eight listed image upserts only; it performs no further Lucid source edit or architecture deployment.
- **Work tracking:** [MP-15](https://duttaarun2015.atlassian.net/browse/MP-15) was read as **In Progress**, parent MP-4, updated **2026-11-01T17:29:58.940Z**. It currently describes Claude Agent SDK and local brainstorming with no publication. Its historical text is not authority for the newer client-SDK direction or a publication permission. The DEC register identifies MP-16 for existing synthetic-fixture work; this map has not checked MP-16's live status and does not claim it is complete.

## Publication preparation gaps and owner boundaries

This is a narrow publication-preparation inventory. It does not run plan-sync or mutate Confluence/Jira. Other authorised maker lanes added the detailed native Lucid page and local diagram references; these remain proposed and independently unreviewed.

| Gap | Consequence before publication or implementation |
| --- | --- |
| New local drafts versus old published `d0e0c14` baseline | Approve the five creates and six bounded updates together so navigation never presents incompatible snapshots as one current baseline. Re-read full drafts immediately before writing and preserve unrelated edits/macros. |
| Root AGENTS/workflow/ADR-0006 still describe £50 AWS and single-host storage | Current owner decisions give the £100 all-in envelope and Lambda/S3/Dynamo preference, while final architecture is open. Record supersession explicitly; propose any root/ADR correction separately. This map does not silently rewrite an accepted ADR or treat the preference as final deployment approval. |
| MP-15 and old ADR-0005 say Claude Agent SDK | Current pack follows the explicit Anthropic Python client-SDK Lambda decision. Any later tracker/ADR correction is a separately stated write scope. |
| SvelteKit 3 requested; versions/compatibility still to verify | Use a requested-version label and the stack matrix's actual verification evidence. Do not call a requested major version installed or supported. |
| £100 full scope and shared $200 promotional credit not account/cost verified | Preserve gross usage, credit and cash separately; proposed allocations are not funded facts. No paid fallback, provider subscription, AWS load or deployment is approved here. |
| Actual broker/layout and listing evidence deferred | Publish synthetic-first requirements and sample-backed/generic templates. Actual holdings/PDF/screenshots can be added progressively; they are not prerequisites for this local pack, and are not included in the publication payload. |
| Detailed requirements, numerical defaults, UX and phase exit evidence open | Pages remain draft planning. Approval to publish documentation is distinct from approval of architecture, end-to-end requirements/UX, implementation, live data or model promotion. |
| Independent review not yet run | Offer it once at the end of the coordinated work, specifying lanes/rounds and required regressions. No reviewer or regression ledger is started by preparing this map. |

The recommended destination/tree is concrete and needs no extra page-location choice. The remaining owner decision is **whether to approve five MP page creates, six bounded updates and eight named private MP image attachment upserts after the local drafts and gates are ready**. It authorises neither a formal plan-sync nor Jira changes, Sites/Artifacts publication, diagram source edits, attachments beyond the eight named images, paid calls, AWS mutations, application implementation, PR creation, merge or issue closure. If a later task also asks for plan-sync, ask for its precise scope using the project procedure. Review consent follows the project-specific per-round rule.

The subsequent bounded-correction proposal incorporates the approved check’s observations: all six published page versions are unchanged; MP-3 is Done; MP-15 remains In Progress; MP-16’s completed synthetic-tooling work does not certify product importers; ten MP-4–13 records remain To Do. Homepage macros and ten existing diagram attachments must be preserved. Eleven MP Jira description-only changes are prepared separately in the local sync proposal; that proposal is neither a Confluence-body source nor an applied change.

## Eight proposed private MP image attachment upserts

The new planning index owns these eight exact files. After approved page allocation/reuse, inspect current owner attachments by exact filename and reuse actual IDs/versions when appropriate. No page or attachment IDs are invented. No upload has run.

| Key | Filename | Pixels | Bytes | SHA-256 |
| --- | --- | --- | --- | --- |
| IMPORT-WORKFLOW-STATIC | `import-workflow.png` | 1600×880 | 113892 | `f6265042c96a51b12e7f48646bf5949486c8296f2234d8c5c190fd76052acacf` |
| IMPORT-WORKFLOW-ANIMATED | `import-workflow.gif` | 1600×880 | 555995 | `edba2c4c25a1cb9ae07c66920093e7a52651ad0656e8949196c3179aca3fea02` |
| LUCID-OPTION-A | `option-a-lucid.png` | 2280×2900 | 151563 | `536af178b55ee856e7399ef8fb847abcdb4f913fcf14704edf188385722f33b3` |
| LUCID-OPTION-B | `option-b-lucid.png` | 2280×2900 | 153105 | `54fd0f47fbe3d80a7083e8624085a9df7805dcb337f56715dc937442368478c5` |
| MP-SYSTEM-ARCHITECTURE | `mp-system-architecture-native.png` | 2565×4932 | 1339989 | `2ea51f99a487f18af9e6a4284f4c3d2c6427a8d04f7ca4e84e75291bec448fd4` |
| PHASE-DEPENDENCIES | `phase-dependencies.png` | 1600×1280 | 104324 | `edf1f949e5addad9e9875ecab5b10a1b7ef5753d1a37f2379c99c74c8d059f98` |
| BUDGET-ENVELOPE | `budget-envelope.png` | 1600×720 | 60557 | `fe56fac7fda3bf713879a82bd5943ccdad83d7635a5667aff15a6d793c7451b5` |
| MP-NETWORK-OPTIONS | `mp-network-options-native.png` | 2416×4714 | 1010128 | `89acd7f59f8eb209f9362db8cfb71b413355262aec23bce85b8820ee83c22e1d` |

The architecture child contains the actual detailed-system native export, preserved A/B comparisons and full network appendix/native page-5 export. The phased page contains the exact dependency chart. Index/security-cost show the £70/£30 planning chart. The index uses the workflow PNG by default and an explicit optional GIF link; no autoplay. Reuse the eight attachments by reference from the index owner. No extra child page is introduced.

Network export provenance is [network-lucid-manifest.json](visuals/network-lucid-manifest.json): document `02218133-613a-4b78-aea4-e0dba26db386`, page `VNMISlFqoQy9` (page 5), saved version **4333**. N0/N1/N1-E are unselected candidates, not deployed VPCs/subnets/routes/SGs/endpoints/NATs. Endpoint reachability, policy paths and network fixed cost require evidence and owner selection. The page-4 export remains its historical saved version **2703**. These are manual source/export snapshots; neither image publishes or deploys anything.

No PDF, private original, data fixture, workbook, JSON/source/manifest, SVG/draw.io or ninth image is in upload scope. Eight upserts are additional to five creates/six bounded updates; identical existing files may need no binary upload. Verify the supported binary-version route before updating a different existing attachment.

## Owned notice composition and retry contract

The six per-page content descriptions are **owned notice upserts**, not instructions to prepend again on retry. Each page has stable visible HTML paragraph/code begin/end identifiers `MP15-NOTICE-BEGIN:<page-id>:v1` and `MP15-NOTICE-END:<page-id>:v1`. They survive through observable supported paragraph text; no HTML comments, storage XML, custom attributes or fabricated local IDs are used for ownership.

- Absent range: insert exactly one wrapped notice before existing content.
- Exactly one valid pair: compare the actual inner HTML. Proven equivalent content is a no-op; changed content replaces only that range. A declared content/source hash alone never proves equality.
- Missing, duplicate, reversed, nested, malformed, unknown-scope or unobservable range: stop. Do not guess, repair or append.
- A stale token or ambiguous response requires another full current draft HTML read and fresh token/read identity before any retry. Recompose from that read; never replay an old prepend.

Prefer granular supported MCP edits with fresh local IDs for the complete contiguous owned root nodes. If a safe edit cannot be expressed, stop unless an HTML-only exact splice can demonstrably preserve all outside rich nodes/bytes/IDs. Never downgrade the full existing body to Markdown. Dry-run and read back the actual range and outside macros/media/IDs before reporting success. Conservative comparison tolerates assigned local IDs/attribute order/between-block whitespace; other normalisation triggers bounded replacement rather than a false no-op claim.

The focused [composer](confluence_notice_composition.py) and [behavioural tests](test_confluence_notice_composition.py) run offline; they never access Confluence. They prove double composition does not duplicate, rich outside markup remains byte-identical, and invalid scopes/stale/ambiguous state refuses unsafe retries. These are maker checks for a round-1 fix, not an independent review or live ADF round-trip certification. Every bounded notice now includes decision/phase/story references, working-tree source hashes/Git base and the honest round-1-fix/round-2-pending status.

## Checks for the local map

Run JSON parsing, unique local draft IDs, existing-page/version completeness, only-MP destination and parent checks, local source-path checks once the coordinated pack is complete, and cross-check the mutation counts against this document. These are document-integrity checks, not independent review, a review-regression run, a formal plan-sync or proof of product readiness. Publication still requires current-page rereads, content-format guidance, approved source versions and explicit owner write consent.

Final local reference check: all mapped source/reading-view paths exist. Eight named image source files were inspected for type/dimensions/bytes/hash; the workflow GIF is an optional seven-frame companion with a static default. Source paths and generated payload links passed maker document-integrity checks. This remains unpublished and not clean-certified: round-1 fixes await separately approved round 2.
