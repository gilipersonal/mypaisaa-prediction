# Plan-sync documentation contract for Codex

Use `.agents/skills/mp-plan-sync/SKILL.md` for the operation and its approval scope.
This rule applies only to Mypaisaa Prediction in Codex; it changes no Claude or
global configuration. A check-only approval remains read-only.

Compare `README.md`, `docs/architecture.md` and `docs/tech-stack.md` together when
the relevant product, architecture, stack or implementation status changes. Keep
their navigation, implemented/planned labels, versions and component boundaries
consistent with code/manifests, accepted ADRs, MP Jira and the published Confluence
snapshot. Distinguish requested technology versions from installed/verified ones.
Do not mark a product feature complete because its dependency or diagram exists.

These three documents should combine colourful, labelled animated-flow companions
with native Lucidchart architecture exports and links to the editable originals.
Use `.codex/rules/architecture-diagrams.md`: AWS and significant architecture belong
in Lucidchart, with relevant native service components. Supporting process diagrams
may use draw.io. Preserve readable static alternatives and accessible descriptions;
animation describes a flow, not live activity.

Check `docs/diagrams/manifest.json` and its guide for document IDs, versions, source
models, export dates/hashes and manual-sync limitations. Reconcile the actual Lucid
source, local companions and approved Confluence attachments when they change.
Do not infer automatic or bidirectional synchronisation from saved links/hashes.
Use existing document/page IDs rather than generating duplicate diagrams or pages.

Smart Clearance is the user's documentation-style reference:
https://github.com/aibuilder2026/smart-clearance (inspected at
`55676ab4b088713749020678afa1df40cd303f00`). Adapt clear status/navigation,
component/layer tables, inline visuals, source inventories and known-gap sections.
Its architecture, cloud accounts, policies and implementation claims are not MP
requirements. Revisit its documentation only when needed for the current change;
do not rescan or import the whole repository on every sync.

In check-only mode, report inconsistencies and exact proposed corrections. Before
writing, follow the existing approved scope for local files, Jira, Confluence and
diagram documents. Diagram updates do not authorise public sharing, paid features,
deployment, independent review, PR creation, merge or issue closure.
