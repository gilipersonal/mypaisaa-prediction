# README identity and motion

This update follows the owner's supplied MA screenshot: compact two-part badges
with technology logos, together with an animated coin/orbit mark. It replaces the
earlier pastel dot pills and compass. The documentation treatment does not approve
the later product design system or start application UX.

## The Forecast Coin

The mark carries the MA family idea forward: navy coin, recognisable pound symbol,
thin orbit, coral point and separate light/dark treatment. The MP variant uses its
own vector geometry, a quiet coin highlight and a staged motion sequence:

| Element | Motion |
| --- | --- |
| Coin | 760 ms ease-out arrival, with a small settling overshoot |
| Orbit ring | 1,500 ms stroke reveal after 100 ms |
| Pound strokes | 1,000 ms draw-on after 260 ms |
| Coral orbital point and matching mask gap | 1,880 ms sweep after 140 ms |
| Point | A single 500 ms settling pulse after 1,770 ms |

The complete introduction is about 2.27 seconds and plays once. There is no
continuous spinning. `prefers-reduced-motion: reduce` shows the final mark; static
variants contain no animation definitions. SVG CSS makes the animation usable as
a README image without depending on a JavaScript framework at display time.

[Open the local light/dark motion study](logo-preview.html) to replay it at normal
or half speed. Both replay controls disable when reduced motion is active.

- Light: [animated](mark.svg) / [static](mark-static.svg).
- Dark: [animated](mark-dark.svg) / [static](mark-static-dark.svg).

The source reference was read from MA's `docs/mark-animated.svg` and
`docs/mark-animated-dark.svg`: separate element timings, view-box transform origins,
a mask moving with the orbit point, and final-state reduced-motion treatment.
MA's files and configuration were not changed. The currency mark is a visual
identity element; it does not denote a measured forecast or trading capability.

## Compact technology badges

The checked-in SVGs use the same [Shields flat badge format](https://shields.io/badges/static-badge)
as the reference: 20 px high, dark label segment, coloured value segment and the
available embedded brand logo. No custom coloured-dot icon substitutes are used.
Badges preserve MP's Python version, budget and selected stack; MA's model IDs,
region, Terraform choice and historical costs are not copied.

`shields-badges.json` records each source URL, label/value, logo availability and
SHA-256. Logo data is embedded inside the SVG: viewing the README does not fetch
icons or badge values from a remote service. The CI badge describes the five
named checks, not a live status, avoiding the broken private-repository status
response shown in the reference.

## Reproduction and checks

```sh
python3 docs/readme/generate_assets.py
python3 docs/readme/check_readme.py
```

The generator runs offline, verifies the vendored badge snapshots, and reproduces
four mark variants plus the local motion study. Updating badge snapshots requires
an intentional new public Shields fetch and manifest update. The checker verifies
README navigation, SVG structure, compact badge dimensions and snapshot hashes;
embedded logo SVGs are checked recursively without allowing external references,
scripts, event handlers or foreign objects.

The local browser maker check samples multiple actual animation times, normal and
half-speed replay, reduced-motion final state and light/dark/narrow README layouts.
Maker evidence is in [verification.json](verification.json); it is not independent
review or owner visual acceptance. Existing static AWS references remain native
Lucid sources and dated exports.
