# ADR 0003: Purged walk-forward validation

- **Status:** Accepted
- **Date:** 2026-11-01

## Context

Random train/test splits leak temporal information in market data. Overlapping horizons can leak labels near fold boundaries.

## Decision

Evaluate every candidate with chronological rolling or expanding windows. Apply a purge and embargo sized to the prediction horizon and feature availability. Fit all preprocessing and calibration inside each training fold only.

## Consequences

Reported performance is more conservative, slower to generate, and more credible. Every model run must retain its split configuration, input cutoff, baseline metrics, and confidence/calibration evidence.
