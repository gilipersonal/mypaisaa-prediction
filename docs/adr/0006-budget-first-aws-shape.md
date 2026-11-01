# ADR 0006: Budget-first single-host AWS production

- **Status:** Accepted
- **Date:** 2026-11-01

## Context

AWS spending must remain below £50/month excluding market-data and Claude costs.

## Decision

Start with a small Lightsail instance hosting containerised API, worker, PostgreSQL, and reverse proxy. Encrypt and lifecycle-manage S3 backups. Use budget alarms, logs, restore drills, and explicit upgrade gates. Do not use RDS, ALB, NAT Gateway, GPU instances, or managed realtime services initially.

## Consequences

The system accepts a single-host availability profile during personal use but remains affordable. Backup quality and restoration exercises are mandatory. Any scale/reliability upgrade needs a costed ADR.
