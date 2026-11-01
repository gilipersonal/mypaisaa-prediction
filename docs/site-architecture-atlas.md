# Cinematic architecture atlas

The owner selected the cinematic systems atlas on 1 November 2026: deep green/lime, editorial headings, guided chapters and animated explanatory paths. Jira: [MP-17](https://duttaarun2015.atlassian.net/browse/MP-17). This is an architecture presentation, not approval or implementation of the investment application.

## Source and hosting

The project owns `site/architecture/` (React content, styles, graph and checks), `site/package.json` / lock and the tracked output in `site/dist/architecture/`. The original `site/dist/index.html` remains the concept preview and links to the atlas. Existing Site identity `appgprj_6ae70bec3f6c8191947480b6423b4bb1` and its owner-private audience are preserved. The atlas is published at `/architecture/` on that Site; no separate Site was created.

The Sites source repository is a publication mirror of the same `site/` directory. Its opening source was compared with the GitHub preview before editing and matched. The helper stages source and creates the static archive; a separate native Sites deployment applies it. No automatic publication-on-push was requested or accepted. The owner subsequently chose private publication and PR creation without independent review. The native Sites deployment succeeded on 1 November 2026; see `review/MP-17/site-publication.json` for the exact deployment/version/source/archive evidence. The owner-private audience was rechecked after publication.

## Experience

- A seven-step holding-to-outcome journey, from import approval through evaluated forecasts, research, the owner's decision and mature outcome scoring.
- A logical explorer with 19 components, 32 labelled joins and five highlighted paths. Each component exposes received/produced records, authority boundaries and failures. The mobile layout uses selectable rows with the same contracts.
- Separate rules, numerical ML and bounded LLM roles; interactive disagreement and insufficient-evidence examples with no live holding, fabricated confidence or investment performance.
- Direct Anthropic client-SDK tool loop, guardrail/answer-quality/predictive evaluation separation, durable jobs/SSE and notification contracts.
- Native Lucid page-4 system and page-5 VPC-option exports, full-resolution links and dated hashes. The interactive process companion does not replace canonical Lucid architecture. Network, data-store, workflow, training and region alternatives remain explicitly unresolved.
- Daily experience, cost admission/billing reconciliation, cross-environment attribution, audit retention/deletion/recovery and ten-phase delivery/open decisions.
- Framer Motion connections and selections with static-first, globally stoppable motion. A lazy-loaded captioned 72-second Remotion Player with explicit controls and a complete transcript. No audio service, media render API or autoplay.

## Build and validation

From `site/`, run `npm ci`, `npm run build`, `npm run check`. The build only replaces the atlas subdirectory. Node 24 and exact package versions are locked. The existing Static preview CI check now installs the lock, builds/checks the atlas and runs the original preview test. No investment-app PWA/Swift build is claimed.

The source checker verifies graph endpoints/contracts, narrative references, unique phases, Site identity, native/source hashes, built resource paths, no live data client in the presentation, static-first motion and no story autoplay. Browser checks cover actual controls and playback, responsive widths 360/390/768/1024/1440, keyboard journey navigation, live changes to reduced-motion preference, global pause, native-image loading and absence of external service requests. See `site/architecture/qa-results.json` for observations and limits.

The current Motion package snapshots its reduced-motion hook at mount despite its documentation describing updates. The atlas subscribes directly to the browser media query so changes immediately disable motion and remove the Player. This behaviour was tested in the browser rather than inferred from the library API.

## Status and limits

Maker checks are recorded. The owner explicitly declined independent review and approved private publication plus PR creation. No MP-17 independent review or real fixed-findings-ledger run occurred. `qa-results.json` preserves the pre-publication maker snapshot; the actual deployment is recorded separately in the publication receipt.

No AWS resources, market-data/Claude calls, changes to MA or Confluence, app implementation, merge or tracker closure are included. PR creation was separately authorised in the publication choice. Source links open separately authenticated services. The presentation is a manual dated snapshot, not continuous/bidirectional sync. The reported Anthropic credit remains unverified and full-scope cost viability remains unproved.
