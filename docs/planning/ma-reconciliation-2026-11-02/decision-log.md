# Owner architecture decisions

**2 November 2026 · MP-19 · Architecture baseline not yet approved**

## ARC-01: preferred sources and verification route

The owner selected option A: **Keep Yahoo/Grow; verify uses and investigate gaps.**

Yahoo Finance and Twelve Data Grow remain preferred candidates. Verify listing coverage/freshness and permission for retained history, training/analysis, derived displays and any selected evidence sent to Anthropic. Investigate alternative sources for a documented gap, without subscribing or automatically increasing spending. Preserve the £100 all-in ceiling, modular adapters and explicit daily/unavailable fallbacks.

This settles the research/design direction only. Actual entitlements, affordability and supported capabilities remain evidence gates under FC-01/03/15, CT-13 and PL-13; none is marked closed. No provider activation, paid source, implementation or complete architecture approval is implied.

Review/publication/PR status: the owner chose to keep drafts and discuss decisions first. Independent review, Confluence publication and PR creation remain pending.

Next: ARC-02, ledger/import persistence and application write ownership.

## ARC-01 dev refinement: Twelve Data Basic/Free

The owner asked to consider the free tier for dev. Record it as the preferred live dev candidate alongside offline synthetic fixtures, not as an activated subscription or a guarantee of the same coverage as Grow. Official pricing/credit documentation checked on 2 November 2026 lists 8 API credits/minute and 800/day, resetting at 00:00 UTC. Credits are weighted by endpoint and symbol; one HTTP request need not equal one credit. See [dev data policy](dev-data-policy.md).
