# ADR 0001: Modular FastAPI monolith with SSE

- **Status:** Accepted
- **Date:** 2026-11-01

## Context

This is a personal product with low concurrent use and a strict AWS budget. It needs streaming status updates but not collaborative, bidirectional realtime editing.

## Decision

Use one FastAPI codebase with clearly separated API, ingestion, research, quantitative, and ledger modules. Expose short-lived server-sent events for durable-record notifications and job progress. Use normal HTTPS reads/writes for all persistent state.

## Consequences

The initial operational footprint is small and easy to debug. Events are simple to consume from web and mobile clients. Long-running work still runs outside request handlers. Future extraction is possible at module boundaries, but premature worker/microservice separation is avoided.
