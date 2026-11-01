# ADR 0002: Append-only prediction and outcome ledger

- **Status:** Accepted
- **Date:** 2026-11-01

## Context

Predictive systems are vulnerable to hindsight bias, silent revisions, and unverifiable performance claims.

## Decision

Create immutable, versioned records for model runs, feature/data cutoffs, published predictions, corrections, and realised outcomes. A correction supersedes a record but never rewrites it. Mature forecasts are scored against canonical outcomes after their declared horizon.

## Consequences

The product can show a trustworthy historical audit trail and calibration dashboard. Storage and schema complexity rise modestly, but the alternative cannot credibly support claims of accuracy.
