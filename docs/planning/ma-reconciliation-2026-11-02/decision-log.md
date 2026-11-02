# Owner architecture decisions

**2 November 2026 · MP-19 · Architecture baseline not yet approved**

## ARC-01: preferred sources and verification route

The owner selected option A: **Keep Yahoo/Grow; verify uses and investigate gaps.**

Yahoo Finance and Twelve Data Grow remain preferred candidates. Verify listing coverage/freshness and permission for retained history, training/analysis, derived displays and any selected evidence sent to Anthropic. Investigate alternative sources for a documented gap, without subscribing or automatically increasing spending. Preserve the £100 all-in ceiling, modular adapters and explicit daily/unavailable fallbacks.

This settles the research/design direction only. Actual entitlements, affordability and supported capabilities remain evidence gates under FC-01/03/15, CT-13 and PL-13; none is marked closed. No provider activation, paid source, implementation or complete architecture approval is implied.

Review/publication/PR status: the owner chose to keep drafts and discuss decisions first. Independent review, Confluence publication and PR creation remain pending.

Next: ARC-03, durable workflow orchestration.

## ARC-01 dev refinement: Twelve Data Basic/Free

The owner asked to consider the free tier for dev. Record it as the preferred live dev candidate alongside offline synthetic fixtures, not as an activated subscription or a guarantee of the same coverage as Grow. Official pricing/credit documentation checked on 2 November 2026 lists 8 API credits/minute and 800/day, resetting at 00:00 UTC. Credits are weighted by endpoint and symbol; one HTTP request need not equal one credit. See [dev data policy](dev-data-policy.md).

## ARC-02: operational ledger and write ownership

The owner selected option A: **DynamoDB + S3, with one controlled write service.**

DynamoDB is the selected direction for operational records; originals remain encrypted/private in S3. A backend application write service owns financial ledger commits/corrections and their audit/outbox evidence. Research/import agents prepare typed drafts; owner confirmation authorises the backend to validate and apply the exact proposed financial change. Automated market-data/job writes have separately scoped authority and are not silently treated as owner-confirmed ledger edits.

Before final sign-off, specify access patterns, financial precision and XIRR/FX conventions, duplicate identity, concurrent corrections, large-import staging/visibility, required audit queries, recovery/reconciliation and owner exports. S3 and DynamoDB do not form one atomic transaction. Keep PL-08, CT-02/03, FC-10 and IR-02 open until their own evidence/decisions are complete. Existing PostgreSQL ADRs remain historical pending explicit reconciliation.

This records the chosen storage/write direction, not completed schemas, passed integrity tests, provisioning, or approval of the whole architecture.
