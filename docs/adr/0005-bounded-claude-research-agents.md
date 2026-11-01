# ADR 0005: Claude agents are bounded research assistants

- **Status:** Accepted
- **Date:** 2026-11-01

## Context

LLM agents can organise research but can hallucinate, follow hostile instructions in source text, incur variable costs, or act outside their remit.

## Decision

Use the Claude Agent SDK/API only through narrowly scoped, allowlisted read-only tools. Require structured, cited outputs with task/token/time limits. Persist agent provenance and review state. Agents cannot access secrets, alter models, publish predictions unreviewed, or initiate transactions.

## Consequences

Agent output is useful evidence rather than an opaque decision-maker. Some tasks need human review and source retrieval/cost controls, which is appropriate for a financial-research product.
