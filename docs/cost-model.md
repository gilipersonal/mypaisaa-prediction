# Production cost model

## Target

Keep recurring **AWS** production spend below **£50/month**, excluding Twelve Data and Claude API charges. This is a personal, low-concurrency system; the target is not compatible with redundant multi-AZ managed infrastructure or GPU training.

## Initial AWS shape

See the [editable Lucidchart AWS architecture](https://lucid.app/lucidchart/f9a80493-7f58-44c1-b201-e97034a1398c/edit) and [diagram index](diagrams/README.md). All services shown are proposed, not deployed; the diagram does not verify current regional prices or enforce the spending target.

| Item | Purpose | Planning allowance |
| --- | --- | --- |
| Lightsail Linux instance, 2 GB tier | Dockerised FastAPI, worker, PostgreSQL, reverse proxy | £10–£18 |
| S3 Standard/Glacier backup bucket | encrypted database dumps, model metadata, export backups | £1–£5 |
| CloudWatch logs/alarms | small, retained operational logs and alerts | £1–£6 |
| Route 53 hosted zone/DNS | optional domain DNS | £1–£2 |
| transfer, snapshots, contingency | headroom for normal personal use | £8–£15 |
| **Estimated total** | **monthly AWS baseline** | **£21–£46** |

Actual regional prices, transfer, snapshot use, tax, and currency conversion vary. Confirm current pricing in the chosen AWS region before provisioning and set an AWS Budget alert at £30 plus a hard investigation threshold at £40. Neither threshold automatically authorises further spend.

## Why this stays small

- Run a modular monolith and scheduled jobs on one instance.
- Serve the PWA as static assets through the existing reverse proxy or low-volume object storage/CDN only if needed.
- Use PostgreSQL in the same host for this phase; back up and test restore rather than paying for RDS.
- Use SSE rather than a managed real-time platform.
- Run model training in constrained CPU jobs; do not add GPUs or always-on notebooks.
- Avoid an ALB, NAT Gateway, EKS, ECS control plane, managed Redis, and multi-AZ database during personal-use phase.

## Cost controls

1. Tag all resources with Project=mypaisaa-prediction and Environment=production.
2. Enable AWS Budgets email alerts at forecasted £30 and £40 monthly spend.
3. Bound CloudWatch retention and S3 lifecycle rules. Keep only required raw data and model artefacts.
4. Set worker concurrency, request rate limits, and agent task token caps.
5. Review a monthly cost report before enabling another provider, universe, or compute-heavy model.
6. Shut down unused test instances/snapshots after a documented restore exercise.

## External-cost controls

Twelve Data and Claude API are intentionally outside the AWS ceiling, but they still need controls:

- Set provider quota/usage alerts and cache market data.
- Let Claude agents run only on explicit or scheduled bounded tasks, with source limits and token ceilings.
- Persist concise structured results; do not repeatedly re-summarise identical content.
- Do not use an LLM to generate numeric forecasts or bypass the validation pipeline.

## Upgrade triggers

Move beyond this shape only when evidence shows it is needed: routine memory pressure, unacceptable restore/recovery target, independently verified need for isolation, or sustained concurrent use. A proposed RDS, load balancer, NAT gateway, GPU, or managed streaming service requires an ADR and a new cost model because it can breach the £50 target quickly.
