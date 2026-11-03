# AWS changes for MP (Claude): read through the MCP, change only through IaC

Adapted from mypaisa-agent's `aws-changes` rule (MA-106) for MP's stage (MP-35). MP takes MA's principles, not its
account, Region, domains, parameter paths or Terraform layout.

## Where MP stands (2 Nov 2026)

- **Nothing is deployed.** No MP AWS account, resource, parameter or pipeline exists. The only code that runs is the
  FastAPI starter, locally.
- **IaC is plan-only in this repository** (`AGENTS.md`, Infrastructure rules). Never apply, deploy or make a paid-service
  call unless the owner explicitly asks in the prompt that is running.
- **The IaC tool is Terraform, and only Terraform** (owner, 3 November 2026): every AWS change, from the first
  resource, goes through Terraform in `infra/terraform/`. This overrides the owner's general preference for CDK or
  CloudFormation for MP only. The ADR records the state backend and how its bootstrap is itself written in Terraform.
- **Accounts:** separate dev and prod AWS accounts are owner-selected (ARC-11, `ARCHITECTURE.md`); neither is
  provisioned. Region, network boundaries and naming are open (gap PL-10).

Rows marked **later** apply once `infra/` holds real IaC and the accounts exist. Until then they are the rule the IaC
and the pipeline must be built to.

## What to do, and what never to do

| Act | Rule | Applies |
| --- | --- | --- |
| Read anything in AWS (describe, list, logs, metrics, costs, stack state) | Only through the AWS MCP server, read-only calls. If it is unavailable, say so; a read-only AWS CLI call is the fallback, never a write | now |
| Create, change or delete any AWS resource | **Only through IaC in `infra/`**: never the console, the CLI, the MCP, the SDK or a script | now (so: nothing, until the tool is chosen and the owner asks) |
| Write or change IaC | Allowed on an MP issue branch; reviewed like code; plan-only | now |
| Plan (`terraform plan`, never `apply`) | Do it when asked, read the whole plan, and report what it would change and cost | **later** |
| Apply to dev | Only when the owner asks in the running prompt, from the reviewed plan, after saying what it changes and what it costs | **later** |
| Apply to prod | **Never from a laptop or a Claude session.** Only through CI from `main`, after the owner approves in a protected environment | **later**, once the pipeline exists |
| Deploy code to prod | Only the release workflow from `main`; never a hand update of a function or a bucket | **later** |
| Read a secret value | Never. Code reads it at run time; nothing prints, logs or commits it. Follow the owner's global secret rule: load the `aws-secrets-manager` skill first, never call `get-secret-value` or `batch-get-secret-value`, and pass secrets as `{{resolve:secretsmanager:...}}` references through `asm-exec`. MP keeps its secrets in SSM Parameter Store (owner, 3 November 2026): never run `get-parameter` or `get-parameters` with `--with-decryption` either | now |
| Put a secret value | The owner, by hand, after Terraform has made the SSM parameter with a placeholder and `ignore_changes` on its value. Terraform state never holds the real value | **later** |
| Anything that costs money (a new service, a bigger size, a paid tier, a data or model subscription) | Ask first, with the monthly price, against the £100 all-in ceiling in `AGENTS.md`. NAT Gateway, load balancers, RDS, GPUs and new paid managed services also need a revised cost model and an ADR | now |
| Prod data resources (tables, buckets, user pools, keys) | Deletion protection on, and the IaC refuses to replace or delete them (`lifecycle { prevent_destroy = true }` in Terraform, plus each service's own deletion protection). Claude never deletes one | **later** |
| Write data into dev | Only synthetic data, through seed scripts or the app; dev never reads or writes prod | **later** |
| Write data into prod | Only through the app's own approved flows; no script, console edit or MCP call | **later** |

## Drift

When a plan, a drift detection run or a read shows a difference nobody made in IaC, do not fix it in AWS. Say what
changed, then bring it back through IaC as the owner chooses: import the resource, change the code to match, or let
the next approved apply put it right. Never import a secret's value into a template or state. A prod release waits
while a prod resource has drifted. Until infrastructure exists, there is nothing to drift; this applies **later**.

## Names, tags and text

- No em dashes in AWS resource names, tags or descriptions; use hyphens.
- Every resource will carry an environment tag (`dev` or `prod`) and its cost-allocation tags, so the cost views in
  the plan can split dev from prod. The naming scheme is chosen with the Region and accounts (PL-10).
- Prefer infrastructure as code that follows the AWS Well-Architected Framework, and check AWS details (limits,
  parameters, permissions, prices) against documentation or the AWS skills rather than memory; say so when unsure.

## Who decides

The owner chooses the IaC tool, the Region, the accounts' setup, every apply and every paid change. Consent for a
plan, a review or a PR is not consent to apply or spend.
