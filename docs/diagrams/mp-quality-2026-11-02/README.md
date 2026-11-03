# Stack, quality, security and testing (MP-36)

Six Lucid pages for the MP-36 Confluence pages: `rec-stack`, `rec-observability`, `rec-testing`, `rec-apple-testing`,
`rec-perimeter` and `rec-web-quality`. Lucid document title: **Mypaisaa Prediction: stack, quality, security and
testing (MP-36)**. This is a new document; the MP-34 document in
[`../mp-architecture-2026-11-02/`](../mp-architecture-2026-11-02/) stays as it is.

**Status: PROPOSED.** Nothing drawn here is deployed. Only the FastAPI health and SSE starter and the nine CI checks
exist. Every element carries one of four status words, and every page has a status key:

| Status | Means |
| --- | --- |
| IMPLEMENTED | Exists in this repository and runs today (the starter, the nine checks, hooks, the review ledger) |
| OWNER-SELECTED | Chosen by the owner (ARC-01 to ARC-12, ARC-06b, the retention periods), not built |
| PROPOSED | Put forward by the MP-36 pages; needs the owner's yes |
| OPEN | Needs an owner decision, named with its gap id where there is one |

## Regenerate

```sh
python3 docs/diagrams/mp-quality-2026-11-02/lucid_spec.py > docs/diagrams/mp-quality-2026-11-02/spec.json
python3 docs/diagrams/mp-quality-2026-11-02/lucid_spec.py --page 3   # one page, for validating in pieces
python3 docs/diagrams/mp-quality-2026-11-02/lucid_spec.py --title    # the document title
```

`spec.json` is Lucid Standard Import, placed by coordinates: import it with assisted layout off. The script copies
the MP-34 generator's palette and helpers rather than importing them, so this document does not move when that one
changes. AWS services use native AWS 2024 shapes; classes not used by MP-34 were checked against Lucid's AWS 2024
catalogue (Organizations, KMS, IAM, Access Analyzer, STS, IAM role, permissions, X-Ray, Distro for OpenTelemetry,
CloudWatch logs and alarm, SNS, VPC, subnets, NAT gateway, VPC endpoints).

## The pages

| Page | Shows | Status |
| --- | --- | --- |
| 1 The stack end to end | Seven layers (doors, edge, API, work, Claude route workers, models, records) with their AWS services, Haiku, Sonnet and Opus 5.5 per ARC-06b, and the libraries under each layer; one request numbered 1 to 13 | Layers OWNER-SELECTED; most libraries PROPOSED |
| 2 One trace from the door to the model | Spans across API Gateway, FastAPI, SQS, the durable workflow, the Claude worker and DynamoDB; a bar showing where the trace holds, may break (SQS) or ends and is joined by IDs (durable resume, Message Batches, the SSE re-read); correlation keys; logs, metrics, OpenTelemetry and X-Ray; alarms to the owner kept apart from investment alerts; redaction | PROPOSED; retention OWNER-SELECTED |
| 3 From a merge to prod | The nine implemented checks, the proposed scan gate (with terraform fmt and validate, TFLint and Checkov), build once with sha256, Terraform only, GitHub OIDC into dev, dev smoke, a release workflow only the owner can start (route A; B to D not chosen), prod deploy, prod smoke and alias rollback | Checks IMPLEMENTED; Terraform and the release route OWNER-SELECTED (3 Nov 2026); the rest PROPOSED |
| 4 Apple testing and the private beta | The shared `mpp.*` test IDs, Maestro, Xcode and a local stub on the owner's Mac, iPhone and iPad widths and rotation, VoiceOver and Dynamic Type, free local builds on the owner's devices with their 7-day clock, TestFlight only later if the owner pays, and the costs | PROPOSED; no paid Developer Program for now (OWNER-SELECTED 3 Nov 2026): no TestFlight, Apple push or Sign in with Apple until the owner decides; the fee month is the allowed exception if it is bought |
| 5 The perimeter, and the optional lockdown | The N0 baseline in Virginia (Organizations with the cost-guard SCP, RCPs and the Region allowlist not adopted, two accounts, IAM, resource policies, KMS, SSM Parameter Store, S3 Block Public Access, CloudTrail, Access Analyzer, data perimeter conditions) beside the dashed optional VPC (private subnets, gateway and interface endpoints including SSM, NAT), with the costed steps L1 to L4 | N0, Organizations and the cost-guard SCP OWNER-SELECTED (3 Nov 2026); controls PROPOSED; lockdown steps OPEN |
| 6 Web quality on every screen | One Playwright session running journeys, ARIA snapshots, axe-core against WCAG 2.2 AA and screenshot comparison; the spinner rule as a test; when it runs (after the four owner gates, at PH-06) | WCAG 2.2 AA OWNER-SELECTED (3 Nov 2026); checks PROPOSED |

Facts come from README.md, ARCHITECTURE.md and TECH-STACK.md, which win, and from the MP-36 page drafts. Drawings 2 to 5
were refreshed in MP-20 (3 November 2026) for the owner's decisions of 2 and 3 November in the
[decision log](../../planning/ma-reconciliation-2026-11-02/decision-log.md); the replaced documents are listed in the
manifest's `superseded_drafts`. Prices are
the drafts' own, checked 2 November 2026 at the cost specification's £0.80 to the dollar and 20% tax.
