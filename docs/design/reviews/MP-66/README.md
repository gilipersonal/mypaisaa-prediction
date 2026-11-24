# MP-66: whole-product UX approval, and the separate permission to build

**Status: awaiting the owner.** This file states exactly what an approval would cover, so the owner approves a known
thing at a known commit. Nothing here is approval until the owner's own words are recorded below. UX approval is never
read as permission to build, to apply Terraform or to spend (MP-66, negative acceptance).

## What is being approved

The complete UX of MyPrediction: every owner and admin journey, in every state, on iPhone, iPad, desktop and phone web, in
light and dark, as drawn in three designs. The commit and the hashes below are the ones the owner approves; any later change
to a design marks the approval stale for the journeys it touches.

| Design | Source | Artifact | sha256 at approval |
| --- | --- | --- | --- |
| Prism, the design system (MP-62) | `docs/design/prism/index.html` | https://claude.ai/artifact/JNjSL7QearPap1zGHBTPGu | `d1bd4a2b20a75a99ad2750ade6b71e0f9d18a478b8782446f5442932a291fad1` |
| Prism Journeys, the owner journeys (MP-62, MP-178, MP-187, MP-193, MP-183, MP-204, MP-180) | `docs/design/journeys/index.html` | https://claude.ai/artifact/UXvLXTKyH9zd1r7CtXG2Kq | `7557200f43067f910eedbc7cd7ab4159a671bac9d1958c6e1207e296887268bb` |
| Prism Admin, the admin journeys (MP-64, MP-193, MP-204) | `docs/design/admin/index.html` | https://claude.ai/artifact/TSrmRb5RpjhGE1iqrZkejf | `a456fc68f02d37c5bbd0678d8a7fffca1233c1bf430f2e77c4fa9556517d9026` |

Commit: `COMMIT` (recorded when the owner answers).

The early option boards (MP-62 options A to C and the two hybrids), the question pack, the architecture explainer and
the Market Agent page are history or explainers, not part of the UX approved.

### The option kept, journey by journey

| Page | Journey | Kept | Record |
| --- | --- | --- | --- |
| Journeys | Home, Holdings, Forecast, Research, Journal, Cost, Approvals, Privacy | Both options, with a flip between them | "Flip all eight", MP-178 |
| Journeys | Track record | A, Scorecard (B drawn, labelled not picked) | "A · Scorecard", MP-187 |
| Admin | Admin home | B, Nine places | MP-64 decision |
| Admin | Audit | B, Explorer | MP-64 decision |
| Admin | Files, Runs, Agents, Models, Approvals, Costs, Incidents, Identity | A | MP-64 decision |

## Open at approval, and who decides

An approval with these open is "approved with named conditions" (MP-66 states). Each stays visibly labelled on the pages.

| Open item | Where it shows | Who decides |
| --- | --- | --- |
| The rule for combined conditions: every condition that stops a write keeps stopping it, whichever banner shows first | Journeys, Combined conditions (Proposed · MP-193) | Owner |
| Approve waits while amounts are hidden; Refuse stays open | Journeys, Combined conditions (Proposed · MP-193) | Owner |
| The three kinds of control and Mark what works, off by default | Both pages (Proposed · MP-193) | Owner |
| Values a pick chose a rule for and left open: the price grace (OWN-07), the reconciliation limit (OWN-31), the alert lines (MP40-Q11a), the upload limits (MP40-Q1), the offline time-out (OWN-37), the fresh sign-in and revocation times (OWN-39), a replay's wait (OWN-08) | Labelled open or Proposed where drawn | Owner, from measured proof where the pick says so |
| Proposals no pick settles yet: ARC-06b-O2, O3, O4; CT-01 (how recent a sign-in), CT-02 (day counts), CT-03, CT-04, CT-05, CT-13 (how far a cut goes), CT-14, CT-17, CT-18 (line values, the four critical faults), DATA-DEC-04, DATA-DEC-15, FIN-OD-02, FIN-OD-04, FIN-OD-07, FIN-OD-08, MP-145, MP40-Q11 (weekend landing), MP40-Q12, PL-04, PL-09, SCI-D03 (the 30-pair rule), SCI-D04 (regimes), SCI-D10 | Each labelled Proposed · id on the pages | Owner, each through its record |
| Unverified: passkeys in a phone browser and removal on revoke (MP-197); how a browser protects its offline copy (an architecture answer before build); widgets and sharing on free 7-day builds | Labelled Unverified | MP-197 test with the owner's yes; architecture with the owner |
| The real-phone check at 20% brightness and VoiceOver (MP-180) | `docs/design/reviews/MP-180/README.md` | Owner, on the device |
| Prism names the sidebar place "Track record" and the phone tab "Record", while Record holds the Journal and the Track record | Prism, the web app | Owner |
| The brand mark, Proposed for the app | Prism, the web app | Owner |

## Permission to build (a separate record)

Today: the owner's go-ahead of 24 November 2026 covers four small steps only (decision log): the web shell (done), the
sign-in screens on a pretend sign-in (done), the screens that only show data, and a local read API, all on synthetic data.
A wider permission names the phases that may start; without it, every story stays `implementation_authorised` false.

## The owner's words

*Not yet given.*
