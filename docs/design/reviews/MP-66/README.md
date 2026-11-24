# MP-66: whole-product UX approval, and the separate permission to build

**Status: approved with named conditions, 24 November 2026.** The owner's words are below. UX approval is never read
as permission to build, to apply Terraform or to spend (MP-66, negative acceptance); the permission to build is its own
record, further down.

## What is being approved

The complete UX of MyPrediction: every owner and admin journey, in every state, on iPhone, iPad, desktop and phone web, in
light and dark, as drawn in three designs. The owner approved the pages as shown at commit `847da9c` (the first hash
column). Applying the same answers then changed only status words on the pages: "Proposed" and "Not approved UX" became
"UX approved with conditions · MP-66", and the combined-conditions rule and the hidden-amounts hold became Settled · MP-66.
The second column is the pages after that, as republished; it is the version the approval covers from now on. Any later
change to a design marks the approval stale for the journeys it touches.

| Design | Source | Artifact | sha256 shown at approval (`847da9c`) |
| --- | --- | --- | --- |
| Prism, the design system (MP-62) | `docs/design/prism/index.html` | https://claude.ai/artifact/JNjSL7QearPap1zGHBTPGu | `d1bd4a2b20a75a99ad2750ade6b71e0f9d18a478b8782446f5442932a291fad1` |
| Prism Journeys, the owner journeys (MP-62, MP-178, MP-187, MP-193, MP-183, MP-204, MP-180) | `docs/design/journeys/index.html` | https://claude.ai/artifact/UXvLXTKyH9zd1r7CtXG2Kq | `7557200f43067f910eedbc7cd7ab4159a671bac9d1958c6e1207e296887268bb` |
| Prism Admin, the admin journeys (MP-64, MP-193, MP-204) | `docs/design/admin/index.html` | https://claude.ai/artifact/TSrmRb5RpjhGE1iqrZkejf | `a456fc68f02d37c5bbd0678d8a7fffca1233c1bf430f2e77c4fa9556517d9026` |

After the answers were applied: Prism `27a6b86206814d3a3d729a970ff05217281e0c28977acf3d7ba6354e46f016f0`, Journeys `5f4d7fb279a66bbb360bc6a51b9bdce0d31744378eed20ca4b5add8a3d7d3533`, Admin `829163788db625584805e78cb7b863a5d1a7dacc2a8045c5b530b94e42769355`, in the commit that records this file.

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
| Values a pick chose a rule for and left open: the price grace (OWN-07), the reconciliation limit (OWN-31), the alert lines (MP40-Q11a), the upload limits (MP40-Q1), the offline time-out (OWN-37), the fresh sign-in and revocation times (OWN-39), a replay's wait (OWN-08) | Labelled open or Proposed where drawn | Owner, from measured proof where the pick says so |
| Proposals no pick settles yet: ARC-06b-O2, O3, O4; CT-01 (how recent a sign-in), CT-02 (day counts), CT-03, CT-04, CT-05, CT-13 (how far a cut goes), CT-14, CT-17, CT-18 (line values, the four critical faults), DATA-DEC-04, DATA-DEC-15, FIN-OD-02, FIN-OD-04, FIN-OD-07, FIN-OD-08, MP-145, MP40-Q11 (weekend landing), MP40-Q12, PL-04, PL-09, SCI-D03 (the 30-pair rule), SCI-D04 (regimes), SCI-D10 | Each labelled Proposed · id on the pages | Owner, each through its record |
| Unverified: passkeys in a phone browser and removal on revoke (MP-197); how a browser protects its offline copy (an architecture answer before build); widgets and sharing on free 7-day builds | Labelled Unverified | MP-197 test with the owner's yes; architecture with the owner |
| The real-phone check at 20% brightness and VoiceOver (MP-180): accepted without checking ("Accept without checking"), so not done | `docs/design/reviews/MP-180/README.md` | Owner, on the device, at a time the owner chooses |
| Prism names the sidebar place "Track record" and the phone tab "Record", while Record holds the Journal and the Track record | Prism, the web app | Owner |
| The brand mark, Proposed for the app | Prism, the web app | Owner |

## Permission to build (a separate record)

The owner, asked how far the build may go now, pressed "Keep the four steps (Recommended)". The option read: "Finish step 3
(read-only screens) and step 4 (local read API) on synthetic data, then decide again." So the go-ahead of 24 November
2026 stands as it was: the web shell (done, MP-134), the sign-in screens on a pretend sign-in (done, MP-73), the screens
that only show data, and a local read API, all on synthetic data, with no AWS, no paid call and no real data. No phase
starts in full, and every story stays `implementation_authorised` false.

## The owner's words

24 November 2026, four questions on one card, each answer the label the owner pressed (lesson 42):

| Question | Pressed | The option read |
| --- | --- | --- |
| MP-180: the iPhone check at 20% and VoiceOver | "Accept without checking" | "You accept the designs without a device check; I record that in your words and it stays an open item." |
| MP-66: approve the whole UX as drawn, with the open items still labelled and yours to decide | "Approve, with conditions (Recommended)" | "Approved with named conditions: every open item stays labelled and decided later." |
| MP-193: the three proposals | "Accept all three (Recommended)" | "Each Proposed · MP-193 label becomes settled with your words." |
| Permission to build | "Keep the four steps (Recommended)" | "Finish step 3 (read-only screens) and step 4 (local read API) on synthetic data, then decide again." |

The three MP-193 proposals, now the owner's: every condition that stops a write keeps stopping it, whichever banner
shows first; Approve waits while amounts are hidden, and Refuse stays open; every drawn control is marked as working,
an illustration or not allowed here, with Mark what works off by default.
