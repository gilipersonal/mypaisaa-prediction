# ADR 0004: Swift-native iOS/iPadOS surfaces in a React Native shell

- **Status:** Accepted
- **Date:** 2026-11-01

## Context

The product needs strong iPhone/iPad integration and also benefits from shared cross-platform navigation/bridge contracts.

## Decision

Use a React Native shell for app-level navigation and typed bridging. Implement investment-facing iOS/iPadOS screens, offline cache, device security, widgets, and accessibility in Swift/SwiftUI.

## Consequences

The user receives native Apple behaviour where it matters, while a future cross-platform client has a stable integration point. Build/release tooling is more complex than a single-stack mobile app and bridge contracts require tests.
