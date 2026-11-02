# Selected architecture directions

**2 November 2026 · All twelve owner answers recorded · Detailed architecture baseline unapproved**

These choices fix broad directions. They do not certify rights, cost, compatibility, scientific validity, complete contracts, phase/story readiness or UX. [Owner decision log](decision-log.md) holds scope and provenance.

| Card | Area | Selected direction |
| --- | --- | --- |
| ARC-01 | Source rights and full-budget feasibility | Keep Yahoo/Grow; verify uses and investigate gaps |
| ARC-02 | Ledger, imports and write ownership | DynamoDB + S3, with one controlled write service |
| ARC-03 | Durable workflow orchestration | Lambda Durable Functions with Python workflows |
| ARC-04 | ML training and serving execution | Selective SageMaker training + portable Lambda inference |
| ARC-05 | Forecast experiments, probability calibration and recommendations | Baselines first, then bounded challengers |
| ARC-06 | Anthropic route, memory, cache and batch boundaries | Separate Lambda workers for each task route |
| ARC-07 | Identity, session recovery and action-bound step-up | Cognito assurance and freshness checks |
| ARC-08 | Admin scope, audit integrity, retention and recovery | Full admin journeys before first build |
| ARC-09 | Guardrails and evaluation harness | Inspect AI + deterministic checks |
| ARC-10 | Client rendering and shared contracts | Static SvelteKit PWA + authenticated FastAPI |
| ARC-11 | Environment isolation, region, compatibility and whole-system recost | Separate dev/prod AWS accounts |
| ARC-12 | Architecture and phase-document freeze | Architecture-area specs + linked phases/stories |

## Important boundaries

- Frontend: a prebuilt interactive SvelteKit PWA; private data/commands use authenticated FastAPI on ordinary API Lambdas.
- Background orchestration: Python Lambda Durable Functions, with SQS and Scheduler retaining distinct responsibilities. No Step Functions in the initial direction.
- ML: capped SageMaker CPU training/evaluation, approved portable Lambda inference where compatible and stored daily forecasts.
- Claude: separate task-route Lambda workers share a bounded client-SDK runner; Claude models run on Anthropic.
- Money: £100 all-in aggregate for dev/prod AWS, data and Claude/evals; £70 operation and £30 reserve. Shared credits/quotas are not multiplied.
- Governance: architecture/contracts/phase/story agreement before UX; full admin/end-to-end UX and explicit permission before implementation.

## Remaining work

The [52-gap register](gap-register.json) remains open. The source reconciliation covers 83 pages and 299 issues at concept/acceptance-concept level; native visual and detailed target-story parity are not certified. Ten phase drafts and 64 local story drafts are preparation, not implementation-ready acceptance. [Baseline completion plan](baseline-completion-plan.md) gives dependencies and evidence.

No UX, product implementation, live data/model call, cloud account/resource setup, Confluence publication, independent review or PR creation is authorised by this summary. Existing prepared publication bodies and diagrams retain their explicit draft/historical status.
