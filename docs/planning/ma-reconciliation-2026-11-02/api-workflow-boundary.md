# FastAPI hosting and durable orchestration boundary

**2 November 2026 · MP-19 · Architecture discussion, not implementation**

The owner asked whether FastAPI implies a hybrid of Lambda Durable Functions and Step Functions, and where the Python API backend runs. FastAPI is the backend HTTP framework serving SvelteKit and Apple clients. The planned API runs on ordinary Lambda functions behind API Gateway through a verified Python web/ASGI adapter. The frontend remains SvelteKit; FastAPI is not the frontend framework.

## Proposed responsibility boundary

| Component | Responsibility |
| --- | --- |
| Ordinary FastAPI Lambda | Authentication/authorisation, request validation, reads, controlled commands, durable job admission and status |
| Bounded streaming Lambda | Authenticated SSE/short chat response delivery; durable jobs survive disconnects |
| Python Lambda Durable Functions | Multi-step background coordination, checkpoints, waits, bounded retries and approval continuations |
| SQS/Scheduler | Buffering/backpressure and timed starts, respectively |
| DynamoDB/S3 | Authoritative business records, approval/audit state and evidence/artefacts |
| SageMaker/Lambda inference | Selected candidate CPU training/evaluation and compatible approved inference |

A long request should validate/admit a job and return an accepted response with a job reference rather than hold an HTTP connection until training/import finishes. The UI observes bounded status/stream updates and fetches durable results. Durable submission requires business job/outbox reconciliation; the HTTP response alone is not proof a worker ran. The owner-confirmed financial write boundary remains intact.

AWS's Python durable SDK uses synchronous methods and does not support `await`. Keep the durable workflow handler separate from FastAPI's async route machinery; share typed domain modules through explicit boundaries. Packaging/runtime/SDK/streaming compatibility still needs an approved proof before build/activation. Lambda is the deployment direction, not a claim that the current starter is deployed.

## Is hybrid orchestration better?

The maker recommendation for the initial workload is ordinary FastAPI Lambdas plus Durable Functions as the primary orchestrator. This preserves ARC-03 and avoids introducing a second orchestration framework for API hosting.

A bounded hybrid remains a credible alternative: Durable Functions owns Python application workflows; Step Functions Standard owns a separately defined SageMaker training/evaluation pipeline where native managed job integrations and visual operational history justify it. Its scope, single owner for each retry/cancel/approval, invocation/result contract, correlation IDs, retention, IAM and cost require an explicit decision. Avoid two orchestrators both retrying or claiming ownership of the same external action.

Step Functions supports SageMaker training/processing/transform `.sync` job integration. A hybrid is technically supported, but it is not automatically cheaper or required by FastAPI. Compare measured workflow volumes, transitions versus durable operations/checkpoint storage, polling, retries and support effort. No budget fit is certified here.

The owner's recorded ARC-03 choice remains Lambda Durable Functions. Asking about hybrid is discussion, not consent to replace that choice or deploy both. ARC-05 experiment breadth discussion can resume once the owner is comfortable with this boundary.

## Primary sources checked

- [AWS-maintained FastAPI adapter example](https://github.com/awslabs/aws-lambda-web-adapter/tree/main/examples/fastapi): FastAPI packaging on Lambda. Example versions are not adopted as current MP pins.
- [Python durable SDK](https://docs.aws.amazon.com/durable-execution/sdk-reference/languages/python/): synchronous SDK boundary.
- [Durable invocation](https://docs.aws.amazon.com/lambda/latest/dg/durable-invoking.html): asynchronous invocation and execution lifecycle.
- [AWS comparison and hybrid guidance](https://docs.aws.amazon.com/lambda/latest/dg/durable-step-functions.html): application logic versus cross-service orchestration.
- [SageMaker job integration](https://docs.aws.amazon.com/step-functions/latest/dg/connect-sagemaker.html): native job management and supported patterns.
- [Lambda pricing](https://aws.amazon.com/lambda/pricing/): compute/requests, durable operations, written state and retained state. Wait suspension is not zero total workflow cost.

No product code, runtime configuration, paid service, infrastructure, diagram, Confluence page or review operation changed. This note is maker research and remains unreviewed.
