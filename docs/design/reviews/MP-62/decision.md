# MP-62 design system, round 1: decision

**Status: round 1 closed (C rejected); round 2, Hybrid A and Hybrid B, awaiting the owner's pick.** The briefs are
[brief.md](brief.md) and [brief-r2.md](brief-r2.md).

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

## The owner's pick

Not yet made. When it is: the owner's exact words, the date, the hybrid and its scope go here, and the picked hybrid
becomes the spec for the remaining journeys and states (MP-62).
