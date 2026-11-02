---
name: mp-architecture-diagrams
description: Create or update Mypaisaa Prediction architecture diagrams in Lucidchart with native colourful AWS shapes, static and animated companions, and a traceable local manifest. Use for AWS or other significant architecture views.
---

# Architecture diagrams for MP (Claude)

Claude's version of `.agents/skills/mp-architecture-diagrams/SKILL.md`, with the rules in `.codex/rules/architecture-diagrams.md`.

## Before drawing

- **Topology:** read the newest owner decisions: `direction-summary.md` (ARC-01 to ARC-12), `foundation-policy-discussion-*.md` and the API/workflow boundary. The single-host, PostgreSQL, Step Functions and £50-only diagrams are history, not current topology.
- **Status labels:** every element is labelled Proposed, Owner-selected, Approved architecture, Implemented, or Deployed and verified. Today nearly everything is Proposed or Owner-selected; only the FastAPI health/SSE starter exists.
- **Lucid connector:** this is a claude.ai connector, so it's only there when Arun's account is signed in. Load its tools with ToolSearch (`lucid`). Per its own instructions, first read `get_mcp_resource` `lucid://skills/readme`. If it's missing, say so, and don't substitute another tool without the owner's agreement.
- **Reuse documents:** use the IDs in `docs/diagrams/README.md` and the manifests. The current technical source is `02218133-613a-4b78-aea4-e0dba26db386`, pages 6-8; page 5 is the VPC view. Read a document before editing it, and if a create result is ambiguous, search and read back before retrying.

## Draw

- Native AWS 2024 service shapes, using the library IDs Lucid actually returns, in their service colours. Show explicit boundaries (accounts, Region, VPC when relevant) and labelled, numbered directional connectors. Keep the MP palette from `docs/diagrams/palette.json` for clients, API/records, data, quant, research and operations, with a legend. Colour never carries meaning alone.
- **Facts to show:** research agents cannot trade, change models or publish forecasts; data cutoffs; training-fold-only processing; immutable forecasts.
- **Network views:** compare running without a VPC against a justified VPC attachment, covering AZs, subnet roles, route tables, ENIs, security groups and endpoints. Show IGW/NAT only as conditional, priced alternatives. Keep managed services outside customer subnets. A public subnet doesn't give Lambda internet access, a gateway endpoint can't reach arbitrary APIs, and security groups don't filter DNS names.
- **Never shown on a diagram:** account numbers, credentials, a Region or price that hasn't been selected, or a deployment that doesn't exist.
- Validate the specification before import (`lucid_validate_diagram_specification`), then check labels, edge endpoints and shape choices on the rendered page.

## Companions and record

- Export a native PNG (`lucid_export_document_as_PNG`) into the dated `docs/diagrams/<pack>/` folder.
- Animated companions are optional and explanatory, not live traffic. Make them with `docs/diagrams/generate_diagrams.py` or hand-written draw.io XML (Claude has no draw.io connector), always with a static PNG alternative and SVG `prefers-reduced-motion` handling. No flashing, and check that real multi-frame motion exists before claiming animation.
- Record the document ID and URL, page, version, export date, image SHA-256, source commit and whether each file is native or generated in that pack's `manifest.json`. Link it from `docs/diagrams/README.md` and the docs the diagram supports. State manual-sync limits; never claim live sync.

Confluence attachments, public sharing, invitations and new documents beyond the stated scope each need their own yes. A diagram never approves architecture, deployment or spend.
