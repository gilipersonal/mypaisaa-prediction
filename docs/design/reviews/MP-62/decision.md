# MP-62 design system, round 1: decision

**Status: the owner picked Prism on 3 November 2026.** The briefs are [brief.md](brief.md), [brief-r2.md](brief-r2.md),
[brief-r3.md](brief-r3.md) and [brief-r4.md](brief-r4.md).

| Option | Local file | Private Claude artifact |
| --- | --- | --- |
| A · Fan (Recommended) | [option-a/index.html](option-a/index.html) | https://claude.ai/artifact/WpjRPNZRvfa6VKA9V5W57c |
| B · Prism | [option-b/index.html](option-b/index.html) | https://claude.ai/artifact/JNjSL7QearPap1zGHBTPGu |
| C · Signal | [option-c/index.html](option-c/index.html) | https://claude.ai/artifact/C1DHfEaanhnQktZUoqwoUf |

Each option was drawn by its own designer from the same brief and checked at 390, 768 and 1440 px in light and dark
(contrast measured on the real backgrounds, no page-level horizontal scroll, no console errors), then looked at by the
coordinator. Not reviewed by an independent reviewer. Open the artifacts rather than the local files: the pages rely on
the artifact's UTF-8 skeleton.

Known, to finish in whichever option is picked: the design hook flagged tight padding inside segmented controls and
tables (two places in A, three in B); several figures beyond the brief (50% bands, price paths, scored history) are
the designers' own and labelled illustrative.

## Round 1 outcome (3 November 2026)

The owner's words:

> "I am stuck between A and B, but the fonts and styling and animation effects I like the MA app better, check that.
> And create a hybrid A and Hybrid B. Reject C"
>
> "The apps should be colour contrasted in such way so that it is even visible at 20% mobile screen brightness level.
> Check all these features really careful. Smoothness is priority. Think hard and come up with the best UX design
> system"

- **C · Signal: rejected.** Its file and artifact stay as the record.
- **A and B: neither picked.** Each is rebuilt as a hybrid on MA's fonts, styling and motion (MyPaisa DS v1, "Warm
  ledger"), held to a 20% brightness contrast rule and a smoothness budget. The brief is [brief-r2.md](brief-r2.md).

## Round 2: the hybrids

| Hybrid | Local file | Private Claude artifact |
| --- | --- | --- |
| A · Fan | [hybrid-a/index.html](hybrid-a/index.html) | https://claude.ai/artifact/VQpqwidcqYQsA55WkPpyvL |
| B · Prism | [hybrid-b/index.html](hybrid-b/index.html) | https://claude.ai/artifact/BqFU9xdCb6rjsj43y67BzE |

Both share one UX system on MA's fonts, styling and motion and differ only in identity. Each was drawn by its own
designer from [brief-r2.md](brief-r2.md), then measured by the coordinator:

- `python3 scripts/design_gates.py check`: every contract pair and every declared pair passes at full brightness and
  at 20%, in light and dark (A 190 measurements, B 458), and every motion rule holds;
- `node scripts/design_runtime.mjs`: in Chrome (CPU slowed four times) and WebKit, light and dark, 390 and 1440 px,
  every visible text reaches 4.5:1 and 3:1 at 20% (worst: A 3.03:1, B 3.08:1), no text under 11 px, no animation of
  anything but transform and opacity, 98 to 99% of frames within 20 ms, no long animation frame and no layout shift in
  Chrome (WebKit cannot measure those two); no sideways scroll and no console errors.

Not reviewed by an independent reviewer. Known, from the designers: the 20% rule pushes glass to 94 to 97% opaque
(the blur barely shows) and makes the action colour near black by day and near white by night; device screens follow
the page's theme, so light and dark are compared with the page toggle; figures beyond the shared set (50% bands, the
3- and 12-month fans, segment totals) are the designers' own and labelled illustrative; the ranked-action labels
(Add, Hold, Trim, Pause) on example holdings are decision support with reasons, to be worded carefully in the picked
hybrid.

## Round 3 asked for (3 November 2026)

The owner did not pick; they asked for both hybrids to be refined:

> "Ok I need you refine the background of the light and dark a bit more. For think more about Apple human centere
> designed and Monzo App for light mode background, the current one looks like Claude's/Anthropic own theme. see
> https://monzo.com/ https://www.klarna.com/uk/ For Dark mode, think about Klarna Mobile App . The font colour contrasts
> can be made more better. https://appinventiv.com/blog/cost-to-develop-an-app-like-klarna/ Take special care of the
> icons, and the edges, they need to be sharp. Have some motion animations for claude added. Remember this is financial
> app. Draw inspiration from Karna and Monzo and think of something special and sharp. The design system should be
> impeccable."
>
> "https://oh-my-design.kr/design-systems/monzo This is another reference, learn from it"

The brief is [brief-r3.md](brief-r3.md). The maker read "motion animations for claude" as motion for the moments Claude
works in the app; that reading is a proposal until the owner confirms it.

Round 3 refined both hybrids in place, on the same files and the same artifact links. Both now carry
[shared/](shared/) word for word: the tokens (cold daylight in light mode, violet-black ink in dark mode), 117 sharp
SVG icons and the Claude component. Measured by the coordinator on the finished files:

- `python3 scripts/design_gates.py check`: every pair at full and 20% brightness in both themes (A 242 measurements,
  B 764), the raised text tier of 7:1 and 3.5:1, every motion rule, every sharpness rule, and the shared files unchanged;
- `node scripts/design_runtime.mjs`: Chrome (CPU slowed four times) and WebKit, light and dark, 390 and 1440 px: every
  visible text reaches 7:1 and 3.5:1 at 20% (worst A 3.50:1, B 3.50:1), at least 97% of frames within 20 ms (Chrome 98.2
  to 99.3%), no long animation frame and layout shift under 0.001 in Chrome (WebKit cannot measure those two), whole-pixel
  icons, no sideways scroll and no console errors.

Not reviewed by an independent reviewer, and not seen on a real phone at 20% brightness. Known, from the designers:
glass is painted flat on the web pages, because at 94 to 97% opacity it only ghosted the text behind it (SwiftUI's
`.glassEffect()` stays the native mapping); `--mp-line` and `--mp-chart-grid` sit below the presence tier by design, as
separators; the SF Symbol names in the mapping are from memory, unchecked against the SF Symbols app; B saw a one-off
103 to 118 ms frame in `chrome light 390` during two runs while A's work was running too, which did not recur in the
coordinator's run.

## The owner's pick (3 November 2026)

> "ok I will go with https://claude.ai/artifact/JNjSL7QearPap1zGHBTPGu. the first Prism design back
>
> But the fonts and ink should be like it is in here on MA
> https://claude.ai/artifact/G6Dzu3QYtNPVkqyH4q9d6g#ios-iphone-v4-home."

> "Also add motion animation effects like you did in last design, whole app should have subtle motion animations
> effects."
>
> "And the icons can be made a little better and sharper more viusally appealing..think hard,"
>
> "I need structured like this [the section index of Hybrid A]. follow the best practices to create a robust design
> systems for Desktop, mobile, PwA and it needs to be used on iOS/iPADOS too"

- **Picked:** round 1's Option B · Prism, the design on that link, in place of both hybrids. Hybrid A and Hybrid B stay
  as the record, and `option-b/index.html` stays unchanged as the first version.
- **Changed by the same words:** its fonts and ink become those of MA's iPhone v4 Home board; subtle motion across the
  whole app; a new icon set; the twelve-section structure; a system robust across desktop, mobile, PWA, iOS and iPadOS.
- **Scope:** the look of the design system. It becomes the spec for the remaining journeys and states (MP-62). It does
  not approve the UX or give permission to build.

The brief is [brief-r4.md](brief-r4.md). The system lives in [docs/design/prism/](../../prism/README.md), and the owner's
link now shows it. `tokens.json` is the one source; `tokens.css` and `PrismTokens.swift` are generated from it.

Measured by the coordinator on the final file:

- `python3 scripts/design_gates.py check`: MA's exact ink and fonts, the generated tokens, the icon set and the Claude
  component unchanged in the page, the twelve sections in the owner's order, every motion rule (89 selftest faults refused);
- `python3 scripts/design_tokens.py check`: 77 tokens, 98 pair measurements at full and 20% brightness in both themes;
- `node scripts/design_runtime.mjs`: 8 of 8 in the final run, Chrome (CPU slowed four times) and WebKit, light and dark,
  390 and 1440 px: every visible text at least 4.5:1 and 3:1 at 20% (worst 3.00:1), at least 97% of frames within 20 ms,
  no layout shift in Chrome. One earlier run showed a single 51 ms frame in `chrome light 390` against the 50 ms limit; it did not recur in the next four runs of that case and its cause was not found;
- real Mobile Safari on an iPhone 17 Pro simulator: the page renders, figures in SF Pro Rounded, glass frosts what passes
  under it. Headless WebKit does not blur, so its ghost text was the test tool, not the page.

Not reviewed by an independent reviewer, and not seen on a real phone at 20% brightness. MA's ink is measured against
the 20% rule as first set (body 7:1 and 4.5:1, text 4.5:1 and 3:1), because it cannot reach round 3's raised text tier.
To hold it, the light ground rose to `#F4F6FB`, the dark card deepened to `#0E142A` and glass went from 56% to 72%. The
tightest pairs have no margin (`fall` on `fall-tint` in light at 3.00:1, white on UK ETFs at 3.03:1). At 390 px about 1,600
text nodes sit in side-scrolling boards or below a device's fold and were not swept there; at 1440 px all but 55 to 72
were. The versioning, deprecation and per-surface pattern details are the maker's proposals, marked so. SF Symbol names
are from memory, unchecked against Apple's app. Whether "motion animations for claude" means motion inside the app is still
to be confirmed by the owner.

## The journeys, 4 November 2026

The owner, answering "Shall I draw the remaining journeys and states in Prism next?": "Yes, draw them".

[docs/design/journeys/](../../journeys/README.md) draws MP-62's eight owner journeys in Prism: home, holdings and imports,
forecast and proof, research and chat, the action journal, cost, owner approvals, privacy and recovery. Each has two
options that differ in structure, with one recommended; every screen is drawn in every state on iPhone, iPad, desktop and
phone web, in light and dark. Admin journeys are MP-64. The owner later chose to keep both options on all eight, with a flip (below),
which supersedes picking one per journey.

| Journey | A (recommended) | B |
| --- | --- | --- |
| Home | Tile board | Ledger |
| Holdings and imports | Review desk | One question at a time |
| Forecast and proof | One horizon | Ladder |
| Research and chat | Brief first | One thread |
| Action journal | Timeline | Three lanes |
| Cost | Meter and ladder | Pill and burn-up |
| Owner approvals | One queue | In place |
| Privacy and recovery | One privacy centre | In place, with a checkup |

The state inventory is on the page, generated from the screens: every screen against every state, with the reason wherever
a state cannot occur. Marking a state not applicable where it truly cannot occur is the maker's reading of "every screen
shows", put to the owner.

Two Prism facts were corrected from the records while drawing: the top 5 reads "3 to 12 months" (SCI-D09, the owner's
answer), not "6 months", and gold and silver are both unavailable for formal tasks (MP-135), not gold alone.

Checked on 4 November 2026 and nothing is installed: SvelteKit 3.1.1 with Svelte 5.57.3 on npm, matching SvelteKit 3 in
`TECH-STACK.md`; simulators list iPhone 17, 17 Pro, 17 Pro Max and 17e, the iPhone 16 family, iPad, iPad Air and iPad Pro
(M4 and M5). Supported devices stay open (MP40-Q12), so the frames are drawing sizes, not a device promise.

The owner's open questions the screens wait on are listed on the page under the inventory, each with how it is drawn today.

Text exempt from the 20% measure: the status bars, which the operating system draws, and disabled controls. Behind an open
sheet's scrim the iPhone status bar reads 5.46:1 at full brightness and 2.01:1 at 20%. Both must still reach 3:1 at full
brightness. `scripts/design_journeys_check.mjs` measures every other text on every screen in every state, including
text on gradients, at 4.5:1 and 3:1.

Not seen on a real phone at 20% brightness, and no owner has walked the journeys.

## Review round 1, 4 November 2026

The owner: "Review round 1 - yes". Four reviewers, journeys in pairs with the scripts joined to one pair, on `c1fa817`. They
found 120 issues, 70 blocking. All 70 are fixed and held by `review/MP-62/fixed.json`. The record is
[round-1.md](../../../../review/MP-62/round-1.md). The fixes took the page from 89 screens to 156: dead ends now lead somewhere, and each
option draws its own outcomes, because the owner may pick one option alone. `docs/design/prism/` was the spec in this round, not
reviewed as a deliverable. The fixes are not independently reviewed; that is round 2, if the owner asks for it.

What HSBC's price means changed so the journeys agree. Its stale time was 16:35, which is the UK close. It is now 14:10: in Ready it is
late but inside the freshness limit and stays in the total; in Stale it is past the limit and leaves the total, which reads £78,508.20,
6 of 7 priced. The limit is proposed (DATA-DEC-02).

## Both options, with a flip: the owner's question, 4 November 2026

The owner, on seeing the options: "Can I have both A and B implemented , user should have an option to flip it for more
engaging experience." Asked which journeys should flip, the owner answered: "Flip all eight". The maker had recommended three.

So both options stay on all eight journeys, and no single option is picked. MP-178 draws the flip, and MP-62's acceptance now says
so. The flip control went into Prism first (the `Flip` component, the `flip` icon and `flipTurn()`). `FLIPS` in
`docs/design/journeys/src/shell.js` says which screen turns to which.

Proposed by the maker, for the owner to accept or refuse: each journey starts in A, the choice is kept per device, each journey
flips on its own, and there is no flip while signed out, during a step-up, behind an open sheet, or on a proposal, an approval or a
record being written. That last rule is what keeps a flip from changing what an approval binds (MP-55).

## Review round 2, 4 November 2026

The owner: "Yes, run round 2". Four new reviewers on `e5dbc07`, the delta since round 1's snapshot and its joins. They found 95 issues, 68
blocking, no P0. All 68 are fixed and held by `review/MP-62/fixed.json`. The record is [round-2.md](../../../../review/MP-62/round-2.md).

The flip changed most. It had been drawn on live proposals, drafts and behind open sheets, against the proposed rule, so it now shows only where
the owner reads. Approvals flips at the queue, not on a proposal.

## Review round 3, 4 November 2026

The owner: "Yes, run round 3". Four new reviewers on `fc1303d`, the delta since round 2's snapshot and its joins. They found 66 issues, 38 blocking, no P0. All 38 are fixed
and held by `review/MP-62/fixed.json`. The record is [round-3.md](../../../../review/MP-62/round-3.md).

Round 2 had claimed a turned frame comes back to where it started and that a pair shows the same facts in every state. Round 3 found both untrue in places, and they now hold as far as
the checks reach: a press takes its target from the control, a second press returns to what the frame showed, and a turned frame takes its partner for the state it is in. The freshness, provider status and risk stay the same across a flip. Proposed, for the owner to accept: the figures both sides show stay the same, and a side may hold more. The checks compare freshness on every pair,
and agreed key figures on six of the eight journeys, not every figure on every screen.

## Review round 4, 4 November 2026

The owner: "Yes, run round 4". Four new reviewers on `b58ae49`, the delta since round 3's snapshot and its joins. They found 54 issues, 25 blocking, no P0, 3 P1. All 25 are fixed and held by
`review/MP-62/fixed.json`. The record is [round-4.md](../../../../review/MP-62/round-4.md). Across the four rounds the blocking findings ran 70, 68, 38, 25, and the P1 findings 23, 24, 9, 3.

The late-price limit is now labelled DATA-DEC-02, the data catalogue's decision on when a price may be used as current. MP-65 settles that a price past the limit leaves the total and the reason shows; the limit itself is open.

MP-178's line, "Flipping shows the same figures", stands as the owner wrote it. An earlier round narrowed it in these records without the owner's word. That narrowing is now marked proposed and put to the owner.

The fixes in round 4 are not independently reviewed. Round 5 would be the last the rule allows.
