---
name: mp-architecture-diagrams
description: Create or update Mypaisaa Prediction architecture documentation in Lucidchart, with colourful technology components, animated companions and traceable local exports.
---

# Architecture documentation for MP

Read `.codex/rules/architecture-diagrams.md` and the relevant architecture, ADRs
and implementation status before drawing. This skill is project-local to Codex.

Use Lucidchart for AWS and other significant architecture. Discover its MCP import
format, component libraries and validation tools before creating or updating a
document. Reuse the document IDs in `docs/diagrams/` when present; do not create a
new copy on every sync. Read an existing document before editing it. If an operation
has an ambiguous outcome, search/read back before retrying creation.

For AWS deployment diagrams, use relevant native AWS service shapes and their
recognisable colours, with explicit boundaries and labelled connections. Use the
actual library identifiers returned by Lucid. When a required shape is unavailable,
label the fallback and explain that limitation. Do not install another tool, enable
a paid feature, or replace Lucidchart without the user's agreement.

Preserve the current budget-first design: one proposed small host for API, worker,
reverse proxy and PostgreSQL, encrypted S3 backups, bounded monitoring and budget
alerts; below £50/month AWS excluding Twelve Data and Claude. Use a service icon
only for a service actually proposed. Do not infer an AWS account, region, deployed
resource or price verification from a diagram. Keep credentials and account details
out of documents, labels, exports and animation metadata.

Use a consistent, accessible palette for clients, data, API, quant, research and
operations. Labels, shapes and legends must convey meaning without colour alone.
Distinguish current starter capabilities from planned components. Clearly show that
research agents cannot trade, mutate models or publish forecasts. Show data cutoffs,
train-fold-only processing and immutable forecasts in relevant scientific flows.

Use animated connectors to explain direction or sequence, with no flashing. Supply
a static PNG alternative and an accessible SVG where practical. Respect reduced
motion in formats that support it. Draw.io may provide editable process diagrams
and animation companions; retain the Lucidchart document as the architecture source.
Explain whether an export is native or generated from the saved model. Record source
document ID/URL, export date, model/source revision and any manual-sync limitation in
`docs/diagrams/README.md` or its manifest. Never claim live synchronisation that does
not exist.

Verify import validation, labels, service choices, edge endpoints, readable exports
and actual multiple-frame animation before reporting completion. Link diagrams from
the relevant local docs and approved Confluence pages. Publication, attachments and
updates remain limited to the user's stated scope; public sharing, invitations,
deployment, review, PR creation, merge and Jira closure retain their existing gates.
