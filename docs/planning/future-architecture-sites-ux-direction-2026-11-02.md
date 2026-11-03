# Future architecture, Sites and UX direction

Recorded: 2 November 2026, Europe/London.

Status: owner-requested future-work direction. Record only; no diagram redesign,
Sites publication, UX design or application implementation is authorised now.

**Superseded in two places by later owner decisions (3 November 2026):** (1) designs are made locally and synced to
private Claude HTML artifacts, not published to ChatGPT Sites (`.claude/rules/design-sync.md`); (2) the home screen
puts holdings first, with the top 5 per segment below, replacing the "market/discovery-first landing choice" (MP40-Q14,
decision log). The rest of this note stands: Apple's HIG and Monzo's modular system as the references, the MA quality
bar, light and dark boards, every state designed.

## Owner direction and quality bar

Arun asked Codex to study the MA Lucid authoring approach and the two linked Claude
artifacts, and to use their standard of presentation for future MP architecture
Sites. The existing MP Site did not meet his quality expectations. Its previous
green/lime cinematic direction is not a reason to preserve that treatment when it
conflicts with this newer reference direction. Do not report the existing Site as
visually accepted.

Future MP architecture Sites and the later product design system must use the
principles demonstrated by MA, Apple's Human Interface Guidelines, Monzo's modular
design-system article and the linked Monzo community kit. Adapt those principles to
MP's requirements; do not import MA's product scope, architectural choices,
permissions, dates, scientific claims or illustrative figures as MP facts.

The workflow remains local first. Keep editable designs, tokens, diagrams and
content in the MP repository, then publish authorised review/presentation versions
to ChatGPT Sites. Claude artifacts are references, not the MP publication target.
Do not revive Claude Design syncing or change Claude configuration.

## References actually inspected

| Reference | Inspection and intended use |
| --- | --- |
| [MA: The Lucid drawings, and how they are made](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1703977/The+Lucid+drawings+and+how+they+are+made) | Read Confluence page 1703977, version 2. Use its generator/editable-document/export/documentation workflow and multiple technical views. |
| [MyPaisa Deep Scan Options](https://claude.ai/artifact/YCuDtgRHdMHtj6Xewte6g5) | Opened the live artifact in Chrome and inspected its visible boards. Reference for recommended options, reasons and trade-offs, light/dark device boards, consistent example figures, compact confirmation patterns and reduced visual nesting. Individual options on that page are not automatically approved MP decisions. |
| [MyPaisa Market Agent](https://claude.ai/artifact/M1yBdJaBe1FmE7sv1V6wLb) | Opened the live artifact in Chrome. Reference for the structured explanatory journey, readable charts, system map, example cards, model explanations and links to the stories/specifications behind each section. Its local catalogue describes this page as a static explainer; do not claim that every reference diagram is animated. |
| [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines) | Opened the live HIG landing page, including its foundation/pattern/component navigation. Use current, relevant detailed guidance when later designing each journey; this recording is not a complete HIG audit. |
| [Monzo: Reimagining monzo.com](https://monzo.com/blog/reimagining-monzo-com-building-a-modular-high-fidelity-web-design-system-that-scales) | Read the article. Carry forward semantic tokens, reusable content blocks, responsive/accessibility foundations, coherent component APIs and purposeful motion. |
| [Monzo Free UI Kit by Marvilo](https://www.figma.com/community/file/1430997965187663709/monzo-free-ui-kit-by-marvilo?after-auth-duplicate-file-id=1430997965187663709) | Inspected the community listing and cover preview in Chrome. Full component internals were not inspected or duplicated. The listing displays CC BY 4.0; verify the actual reused assets, attribution and any separate brand/font rights before reuse. This is a community resource, not an official Monzo specification. |

Additional MA source inspection, read-only, at local commit
`a1f59d1d1608e2d4a37e2d6216e69b60c42b1a0e`:

- `docs/design/README.md`: local boards, explainers and live-reference inventory.
- `docs/design/ds-v1/README.md`: Warm ledger foundations, token and motion sources,
  light/dark boards, native controls, accessibility and summary-first information.
- `docs/design/lucid/gen_aws_architecture.py`: reusable shape/layout helpers,
  semantic connector colours, stable identifiers and native AWS library mappings.
- `docs/design/lucid/06-market-agent.png`: visually inspected native AWS icons,
  directional flows, external-provider boxes and distinct learning-loop grouping.
- `.agents/rules-ref/claude-memory/design-local-then-artifact.md`: local source
  before publication. MP uses ChatGPT Sites for its authorised publication step.

These files belong to MA and were not changed. MA's README and newer option boards
may describe different stages; resolve their current state before any reuse.

## Lucid architecture after architecture finalisation

When Arun separately finalises the architecture, replace unresolved proposal views
with diagrams of the approved MP design. Use native, colourful AWS/technology
components, legible labels, consistent grouping and clearly directed connectors.
Choose enough views for readability rather than compressing the whole application
into an unreadable poster.

The later diagram inventory should cover:

1. System overview and client-to-backend request/response and SSE journeys.
2. Dev/prod accounts, delivery, regions and technical network/VPC boundaries.
3. Identity, authorisation, sensitive-action approval and recovery.
4. Scheduler/event routing, SQS buffering, workers, retries, DLQs and approved replay.
5. Provider ingestion, rights/freshness gates, S3 originals and the controlled ledger writer.
6. Anthropic-hosted model routes, separately deployed task workers, tool/context
   boundaries, nonurgent batching and synchronous chat paths.
7. Numerical forecasting: features, walk-forward validation, SageMaker training,
   approved artefacts, portable inference, outcome grading and promotion decisions.
8. Monitoring, traces, audit evidence, guardrails/evals and per-environment costs.
9. Critical sequences such as upload-to-confirmed-import, recommendation-to-chat
   explanation, and candidate-model-to-owner-approved-promotion.

Use colour semantically: consistent meanings for request/data paths, identity,
external providers, failures and the learning/evaluation loop; include a legend,
line styles and labels so meaning never depends on colour alone. The MA generator's
coral/blue/amber/purple/failure colours are evidence of the approach, not an
instruction to hard-code its palette without checking MP contrast and meaning.

Keep a reproducible editable source, stable live Lucid document links, native
exports and their source/version evidence together. Update an existing Lucid
document in place where appropriate. Use the supported current import/API and
actual returned service-shape identifiers; do not assume MA's older mappings remain
valid. Keep Git architecture/tech-stack/README links, approved MP Confluence pages
and authorised Sites presentations aligned to the same accepted revision.

### What “proposed to actual” means

Do not perform a blanket wording replacement now. Once finalised, mark selected
choices as **Approved architecture**, with the approval date/revision; remove
obsolete alternatives from the primary flow and retain their decision history.
Keep a separate implementation status:

| State | Evidence needed |
| --- | --- |
| Proposed | Unsettled option or pending owner decision. |
| Approved architecture | Explicit owner sign-off on the stated design revision. |
| Implemented | The capability exists in verified code/configuration. |
| Deployed and verified | Environment-specific deployment and verification evidence. |

An approved diagram may describe the exact future system without falsely claiming
that a resource exists in AWS. Optional or future extensions remain labelled.
Animations explain sequence, not live system activity, unless backed by live data.

## Future ChatGPT Sites presentation

Use the artifacts as the visual and explanatory quality benchmark. Aim for a
coherent financial-product identity: confident hierarchy, generous but useful
spacing, disciplined colour, legible numbers, solid content surfaces and clean
cards/rows. Avoid decorative spectacle that makes architecture harder to follow.

Build a chaptered, navigable explanation: the user question or need, the relevant
flow, the services and contracts involved, what can fail, how it is observed, and
where the decision/evidence lives. Offer plain-language explanations with technical
detail available in the same journey. Show traceable integration points, readable
charts and meaningful examples, not only headings describing capabilities.

Use purposeful, controllable motion for request hops, queue hand-offs, document
processing, forecast/outcome feedback and approvals. Provide replay/step/pause as
appropriate, static alternatives and reduced-motion behaviour. Motion tooling is
selected later for the deliverable; mentioning Framer/Motion or Remotion does not
justify using a video renderer for interactive content it cannot serve well.

The architecture Site and the later design-system/prototype presentations should
share foundations and content quality while each retains its own purpose. Keep
illustrative/synthetic values labelled and consistent across screens and charts.

## Later UX and design-system work

Start only after the researched architecture, shared contracts and complete
phase/story baseline have been presented and approved. Then design the complete
end-to-end user and admin journeys before implementation.

Use Apple HIG for native hierarchy, navigation, platform controls, adaptive layouts
and accessibility. Adapt the Monzo/MA warmth and modularity into an MP token system
for colour, type, spacing, radii, charts and motion. Maintain matching component
names, states and behaviour across local specifications and eventual code.

Prepare local light/dark boards across compact and expanded device layouts, with
keyboard, touch, screen-reader, text-size and reduced-motion states. Include
loading, empty, stale, partial-data, disagreement/abstention, error and recovery
states. Keep uncertainty, provenance and cost/approval consequences visible.
Native material effects belong in suitable control layers; financial evidence must
remain readable. Exact palette, fonts, breakpoints and screen layouts are settled
through the later MP design process.

MA's chat-first navigation, household features, four-week-only illustrations,
Step Functions topology, shared-account setup, historical budgets and forever-file
retention are not imported by this visual direction. Preserve MP's selected
decisions and policies. In particular the market/discovery-first landing choice is
not replaced merely because an MA board puts chat first.

## Deferred checklist and boundaries

- At architecture approval: reconcile the selected source documents and Lucid
  views; label the approved design accurately and retain open items explicitly.
- Before the next authorised Sites work: read this note and the live references,
  then apply their quality bar to the local source before publication.
- At UX start: prepare MP design foundations and complete journeys using the
  references above, with owner choices and acceptance evidence.
- When the main workflow incorporates this note: link it from the applicable
  Codex design-first, architecture-diagram and plan-sync guidance, preserving the
  existing permission gates. Those workflow files have not been changed here.

No implementation, architecture approval, resource creation, paid call, external
publication, PR, merge or issue closure is authorised by this note. This side-chat
capture changes only this new planning note and one requested memory update note;
it does not change the main thread's branches or tracked work.

Verification: reference reads and the native local diagram inspection described
above; local note content/link/whitespace checks. No application tests or independent
review were run. Independent reviewers are unavailable in this side conversation.
