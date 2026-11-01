# Architecture diagrams for Codex

Applies only to Codex in Mypaisaa Prediction. Do not change Claude configuration,
global skills, or another project to implement this rule.

Use **Lucidchart** for AWS architecture and other significant architecture diagrams:
system boundaries, deployment topology, security boundaries and major data/component
relationships. Follow `.agents/skills/mp-architecture-diagrams/SKILL.md`.
Use relevant native AWS or technology components with consistent colours and labels.
Do not substitute generic boxes for available service shapes or invent unavailable
shape identifiers. Draw.io remains suitable for supporting process/workflow diagrams
and animation companions; it does not replace the Lucidchart architecture source.

When AWS architecture includes network decisions, provide a detailed technical
Lucid view of the alternatives: customer-VPC-unattached roles versus justified
VPC attachment; AZs, public/private subnet roles, route tables, ENIs, security
groups, gateway/interface endpoints and conditional IGW/NAT egress. Show managed
services outside customer subnets and explain actual control-plane/network paths.
Do not imply a public subnet gives Lambda internet access, a security group filters
DNS hostnames, or a gateway endpoint reaches arbitrary external APIs. Label
unselected options, cost/failure trade-offs and unprovisioned CIDRs/Regions plainly.

Keep editable document links, local exports and the corresponding requirements/ADRs
together. Mark planned components and starter implementations explicitly. Animation
illustrates direction or sequence; it must not imply live telemetry or deployment.
Provide a readable static alternative and honour reduced-motion settings where the
format supports them. The current tool selection is a documentation preference,
not an approved app-screen design or permission to deploy, enable public sharing,
invite collaborators, or spend money.

MP Confluence documentation should retain the colourful native architecture
exports, supporting draw.io workflows, illustrative animations and meaningful
data-derived charts. Provide static defaults, opt-in animation/reduced-motion
support where available, legends and source/version/hash evidence. Apply current
owner decisions rather than copying obsolete source-project defaults. These are
MP Codex rules and do not modify Claude or another project.
