# MP-205: Tap to show, options round

While the read-only screens were built to their design (MP-205, design parity), the privacy centre and the hidden Home
said "Tap to show for 30 seconds." with nothing behind it. The design did not say what is tapped, what shows, or how the
30 seconds end. The owner, 24 November 2026, picked "Design tap-to-show" over dropping the sentence.

Design only. Nothing is built until the owner picks.

## Where it is

- Drawn in Prism Journeys, `docs/design/journeys/index.html`, as a tenth journey, **Tap to show** (`src/journeys/peek.js`).
  Open the page and choose Tap to show, or go to `#peek.a.iphone.default`.
- Each option is drawn on iPhone, iPad, desktop web and phone web, in light and dark, in every state. A flip turns any
  frame to the other option.
- It is drawn on the hidden Home that Privacy option B already draws (`privacy.js` lends its helpers through
  `J.kit.privacy`), with Home's own figures: £90,155.25, and £84,051.05 known when HSBC is stale (OWN-07).
- The private artifact is `ds-journeys` in `docs/design/artifacts.json`.

## The options

| | A. The whole screen (Recommended) | B. One figure |
| --- | --- | --- |
| A tap on a masked amount | shows every amount on the screen, the cost pill's pounds included | shows only that amount |
| While showing | the eye becomes **Hide now · 24 s**; a status line says when they hide | a status line says when it hides; the rest stay masked |
| It hides again | after 30 seconds, on Hide now, on leaving the screen, or when the app goes to the background | after its own 30 seconds, on leaving the screen, or in the background |
| Why | one tap answers "how much"; the total and its rows always agree | the least is ever on screen |
| Cost | shows more than the one figure wanted | a shown total beside masked rows; two figures take two taps |

## What both options keep

- **Privacy mode stays on.** Showing is for this device, for 30 seconds, and nothing is stored. The eye stays the setting.
- **Every masked amount is a button**: tap, click, or Enter. A screen reader hears what a press does, then one announcement
  when amounts show and one when they hide, never a count each second. With reduced motion the seconds change with no animation.
- **Percentages and ranges never hide**, as before (OWN-18).
- **Not while loading, and nothing to tap when empty**: those states are marked not applicable on the showing screens.

## Gates

`node scripts/design_journeys_check.mjs docs/design/journeys/index.html --only peek`: 144 combinations walked, 72 flips
pressed, 0 problems. `node scripts/design_journeys_facts.mjs --all`: 302 of 302 hold (the journey count fact now names ten
journeys). `python3 scripts/design_gates.py check` and `selftest` pass with Tap to show as the tenth journey.

## Decision

Waiting for the owner's pick.
