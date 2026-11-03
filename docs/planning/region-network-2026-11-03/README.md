# Region, network, accounts and the all-in envelope (MP-29)

Jira MP-29 (gap PL-10): choose MP's environment, Region, network and accounts, and state the all-in cloud envelope.
The research was checked on 2 November 2026 from AWS's public pages and price-list files, and from the ICO's guidance.
No AWS account was read: the AWS MCP server did not connect, and nothing was provisioned. Money is at £0.80 to the
dollar and 20% tax, and cash counts in the month an invoice is due.

**Status:**
- **Owner-selected:** the Region, the Grow tier, Terraform, SSM Parameter Store, Organizations with a cost-guard SCP,
  the owner's existing domain, N0, the cost collector's role and global Claude inference, below.
- **Proposed:** the boundary matrix and the policy details on this page. That needs the owner's answers to the questions at the end, and none of
  it is built. IaC stays plan-only (AGENTS.md, `.claude/rules/aws-changes.md`).

## What the owner has decided (2 and 3 November 2026)

| Decision | Answer | Where it is recorded |
| --- | --- | --- |
| Region | **Virginia (us-east-1)**, the cheapest of the three candidates in the cost model | [Decision log](../ma-reconciliation-2026-11-02/decision-log.md) |
| Data tier | **Twelve Data Grow 55** ($29) for prod and Basic ($0) for dev, with Yahoo Finance alongside | Decision log; [MP-10 findings](../source-rights-2026-11-02/README.md) |
| The Apple Developer fee | One exception month a year above £100, for this fee only | Decision log |
| Accounts | Separate dev and prod AWS accounts (ARC-11) | [Direction summary](../ma-reconciliation-2026-11-02/direction-summary.md) |
| IaC (3 Nov) | **Terraform only**, from day one: every AWS change goes through Terraform | Decision log; `.claude/rules/aws-changes.md` |
| Secrets (3 Nov) | SSM Parameter Store SecureString, with no per-secret fee | Decision log |
| Guard rails (3 Nov) | Organizations with all features, and the cost-guard SCP. The Region allowlist SCP and the RCPs are not adopted | Decision log |
| Domain (3 Nov) | The owner's existing domain, **mypaisapp.com**, renewed outside MP, so the cost model's domain line comes out | Decision log |
| Network (3 Nov) | **N0**: no VPC for any Lambda, SageMaker training with network isolation, no NAT, endpoint, proxy or VPN; the lockdown is decided at PH-08 | Decision log |
| Cost collector (3 Nov) | A read-only Cost Explorer role in the management account, assumed by the prod collector | Decision log |
| Claude inference (3 Nov) | Global, at the standard price | Decision log |

## Virginia: every service MP needs is there

| Need | In Virginia | Note |
| --- | --- | --- |
| Lambda Durable Functions, Python | Yes, since December 2025 | Only `python3.13` and `python3.14`; any other version needs a container image. Virginia has the higher default durable quotas. |
| Response streaming through API Gateway REST | Yes | The Python managed runtime cannot stream natively, so the API needs the Lambda Web Adapter (or a custom runtime). Streams are limited to 15 minutes, with a 5-minute idle timeout. |
| Cognito passkeys | Yes | Needs the Essentials or Plus tier; Lite has none. |
| SageMaker CPU training | Yes, `ml.m5.large` at $0.115 an hour | The account quota is unverified. |
| Scheduler, SQS, DynamoDB, S3, CloudFront, KMS, Secrets Manager, X-Ray, CloudTrail, Organizations | Yes | From AWS's Regional services list. |
| ADOT Python layer | `AWSOpenTelemetryDistroPython` version 32 | |

**What Virginia means:**
- **Location and latency:** AWS-held data and same-Region backups sit in the US. The median latency from the owner's
  Mac was about 106 ms, against about 19 ms for London.
- **Anthropic:** prompts are processed in the US or globally whatever the Region, so choosing London would not have
  changed this.
- **UK GDPR:** the ICO treats purely personal or household processing as outside UK GDPR. MP holds the owner's own
  holdings for the owner's own decisions, so that carve-out most likely applies. It would stop applying if MP held anyone
  else's data or were offered to others.

## Network: N0, with an empty N1 scope

**The facts PL-10 asked to state, from AWS's own pages:**
- A Lambda that is not attached to a VPC has internet access by default.
- Attaching a Lambda to a public subnet gives it **no public IP and no internet access**. Internet access needs a
  private subnet routed through a NAT.
- Gateway endpoints exist only for S3 and DynamoDB in the same Region. They cost nothing, and **are not an internet or
  Anthropic path**.
- SageMaker training can run with network isolation and no VPC: the container makes no outbound calls, and SageMaker
  moves its S3 data.

**Proposal:**
- **N0 for every Lambda.** SageMaker training runs with network isolation instead of a VPC.
- **N1 scope: none today.** It would be justified only if the owner wanted bucket policies on the training data that
  require a VPC endpoint.
- **No NAT, interface endpoint, proxy or VPN is enabled.** A NAT Gateway alone costs $33 to $37 a month in hours,
  against at most £2.16 of headroom in the £22 AWS share. Each lockdown step is costed on the perimeter page and
  decided at PH-08.
- **What N0 cannot do:** stop a Lambda's outbound traffic by network rules. Egress is controlled by each worker's host
  allowlist in code and by IAM, so the boundary matrix below is the main control. A VPN does not replace sign-in:
  every request is still authenticated by Cognito and checked by the API.

## Accounts

**Proposal:**
- **Structure:** a management account that runs no workloads, plus dev and prod member accounts under AWS
  Organizations with all features on (ARC-11).
- **Cost:** Organizations and consolidated billing are free, so the difference from one account is about $0.
- **Service control policies (SCPs)** cap what member-account roles may do:
  - allow only Virginia (with the global-service exemptions);
  - forbid leaving the organisation;
  - keep CloudTrail on;
  - deny root actions;
  - a cost guard that denies NAT gateways, interface endpoints, VPNs, load balancers, SageMaker endpoints and GPU
    instances until an ADR lifts it.
- **Resource control policies (RCPs)** stop principals outside the organisation reaching S3, SQS, KMS, Secrets
  Manager, STS, DynamoDB, CloudWatch Logs, Cognito, EventBridge and X-Ray. AWS service principals are excepted.
- **Limits:** SCPs and RCPs do not apply to the management account or to service-linked roles, and both need all
  features on.
- **The management account** holds the IAM Identity Center organisation instance, which must live there, and nothing
  else.
- **The free tier:** an organisation gets free-tier offers in one account only. The cost model already deducts no free
  tier.
- **Open:** a member account's Cost Explorer sees only its own costs. The daily cost collection that covers both
  accounts needs either a read-only role in the management account or a shared billing view.

**The alternative**, one account isolated by naming, tags and permission boundaries, shares quotas, has no SCPs or
RCPs, and lets one policy mistake cross environments.

## IaC: Terraform, and only Terraform (owner, 3 November 2026)

Every AWS change, from the first resource, goes through Terraform in `infra/terraform/`. This overrides the owner's
general preference for CDK or CloudFormation, for MP only. The ADR still to be written records:

- **State:** an S3 bucket per account, versioned and encrypted, with S3's native state locking. The bucket and its
  policy are themselves Terraform: a small bootstrap configuration starts with local state, then migrates into the
  bucket it creates. So nothing is made by hand.
- **Plan-only CI, now:** `terraform fmt -check`, `terraform validate`, TFLint and Checkov need no AWS access.
  `terraform plan` needs read-only credentials later. `apply` runs only when the owner asks (`.claude/rules/aws-changes.md`).
- **Secrets:** Terraform creates each SSM SecureString parameter with a placeholder and ignores later changes to its
  value. The owner sets the real value by hand, so state never holds it.
- **Prod data resources:** `prevent_destroy` on tables, buckets, user pools and keys, plus each service's own deletion
  protection.
- **Versions:** pin the Terraform CLI and the AWS provider in the lock file, as `uv` pins the Python dependencies.
  Terraform's licence (BUSL 1.1) is free for this personal use.

The comparison the research made before the owner chose:

| | CDK in Python | Plain CloudFormation |
| --- | --- | --- |
| Output | CloudFormation templates, so it meets the owner's guidance to prefer either | The templates themselves |
| Plan-only now | `cdk synth` needs no AWS access, so CI can lint the output with cfn-lint and Checkov today | Templates can be linted now; change sets need access later |
| Cost | Free. Bootstrap creates an S3 bucket, an ECR repository, IAM roles and an SSM parameter per account and Region | Free for AWS resource types |
| Risk | Bootstrap's default CloudFormation role is admin-equivalent and must be narrowed | Verbose; every least-privilege policy is written by hand |
| Needs | Node.js for the CLI, in the same language as the app | Nothing extra |

## The boundary matrix

Dev and prod have the same shape. Dev holds only synthetic data, and no dev role trusts or is trusted by a prod role.
Every role writes only its own logs and traces, and may use only its own environment's KMS key.

| Function | DynamoDB | S3 | Secrets | Queues and invoke | SageMaker | Internet egress | Never |
| --- | --- | --- | --- | --- | --- | --- | --- |
| API Lambda | Read the ledger, forecasts and audit; append to audit | Presigned upload to `sources/uploads/`; read `evidence/exports/` | None | Send to the work queues; start durable workflows | None | None | Ledger writes, secrets, SageMaker, IAM |
| Ledger writer (the one controlled writer) | Transactional writes to the ledger; append to audit | Read `sources/uploads/` | None | Its own queue | None | None | Ledger deletes, secrets |
| Data workers | Append to the market table | Write `sources/provider/` | The Twelve Data key only | The collector queue and its dead-letter queue | None | Yahoo Finance, Twelve Data | Anthropic keys, the ledger |
| Claude route workers (one role per route) | Read allowlisted records; append to audit; update their own cost reservations | Write `evidence/claude/<route>/` | Their own route's Anthropic key only | Their own queue | None | api.anthropic.com | Ledger writes, other routes' keys, model artefacts |
| Inference Lambda | Read market data; append-only writes to forecasts | Read `artefacts/approved/` | None | Called by the daily run | None | None | Overwriting forecasts, secrets |
| Training orchestrator | Append to audit | None | None | n/a | Start training jobs only on `ml.m5.large`, with network isolation and a runtime cap; pass only the training role | None | Endpoints, notebooks, GPUs, VPC settings |
| Training job | None | Read `training/`; write `artefacts/candidates/` | None | n/a | Network-isolated | None | `artefacts/approved/` (the owner promotes models in the app) |
| Billing collector (prod only) | Write the cost table | None | The Anthropic admin key, if adopted | Daily | None | Anthropic usage endpoints | The data plane |
| Deploy role (GitHub OIDC, one per account) | None | None | Denied | Assume the CDK deploy roles only | None | n/a | Data reads; prod trusts only the release route the owner picks (PL-11) |
| Owner (Identity Center) | Dev: full. Prod: describe only, no ledger reads | Dev: full. Prod: list only | Prod: denied | Prod: read only | Prod: describe | n/a | Prod ledger writes outside the app; break-glass admin needs MFA, lasts an hour and raises an alarm |

The SageMaker, PassRole and KMS condition keys need checking against AWS's Service Authorization Reference when the
policies are written.

## The all-in envelope

Virginia, Grow 55 for prod, Basic in dev. These figures come from the MP-10 12-month cash view
([cost_months.py](../source-rights-2026-11-02/cost_months.py)).

| Month | Claude off | Claude option A (ARC-06b volume) |
| --- | ---: | ---: |
| Every month (the domain is renewed outside MP) | £46.48 | £54.73 |
| The Apple fee month, if the owner joins (the one allowed exception) | about £141.52 | about £149.77 |

- **Under £100 and under the £70 plan:** every month except the Apple fee month.
- **The £22 AWS share:** the AWS run rate is £19.84, leaving £2.16.
- **Secrets:** SSM Parameter Store standard SecureString parameters have no per-secret fee, so they add nothing.
- **The domain line:** the foundation cost model still holds $15 a year for a domain. The owner's existing domain is
  renewed outside MP, so that line comes out at the model's next revision (its check, `check_cash_timing.py`, pins it).
- **Not in the model yet:**
  - Terraform's state buckets, at a few pence a month.
  - Internet data transfer out, at about $0.16 a month.
- **A possible double count:** the model has $1.50 a month of AWS build minutes alongside GitHub Actions.

## Questions for the owner

All answered on 3 November 2026 (above). None is open.

## Questions for AWS (to ask only with the owner's yes)

1. What are the default durable-function quotas and the `ml.m5.large` training quota for a new account in us-east-1?
2. Does API Gateway REST streaming work for a Python function through the Lambda Web Adapter, alongside the ADOT layer?
3. Can a member-account role read organisation-wide Cost Explorer data through a billing view?
4. Which global-service actions must an SCP Region allowlist exempt, for Cognito custom domains, ACM, CloudFront and
   Cost Explorer?

## Sources

All checked on 2 November 2026:
- AWS price-list files (`pricing.us-east-1.amazonaws.com/offers/v1.0/aws/`) and the Regional services list.
- Lambda guides: the durable-functions runtime and quota pages, response streaming, and VPC internet access.
- API Gateway response transfer mode, and the Cognito feature plans.
- SageMaker training without internet access, and VPC gateway endpoints.
- AWS Organizations guides: service control policies, resource control policies and the FAQ. The AWS Free Tier
  terms, and Identity Center organisation instances.
- AWS CloudFormation pricing and CDK bootstrapping.
- The ICO's guidance on exemptions.
- Anthropic's data residency page (`platform.claude.com/docs/en/manage-claude/data-residency`).
