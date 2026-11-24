# MP-180: the designs on a device, with assistive technology, and the long frame

MP-62, MP-178 and MP-64 closed with four checks not done, because a browser gate cannot prove them on a device. This
records each: two done here by the maker, two that only the owner can do on a real iPhone and iPad.

| Check | Who | Status |
| --- | --- | --- |
| Journeys runtime: no long animation frame over 50 ms on Chrome desktop, light and dark | Maker | **Passes** (below) |
| Keyboard-only pass on the web, across the picked options | Maker | **Passes** (below) |
| Prism, Journeys and Prism Admin on a real iPhone at 20% brightness, light and dark | Owner | Waiting on the owner |
| VoiceOver on iPhone and iPad, across the picked options | Owner | Waiting on the owner |

## The long frame (fixed)

**Cause.** The Journeys page forced every frame on the page to render (`.jrow .board { content-visibility: visible }`),
overriding Prism's own `content-visibility: auto`. A theme switch then repainted every frame at once: one frame of 51 to
64 ms on Chrome with the CPU slowed four times, with no script time in it. Profiled by replaying the runtime check's own
sequence with long-animation-frame attribution: the long frame came from pressing Dark, on the page before MP-193 too.

**Fix.** Off-screen frames skip rendering, as Prism's boards do; each board already carried its `contain-intrinsic-size`,
so the page keeps its length. A walker that measures every frame at its true size (`window.__prismNoFit`) still has
every frame rendered, through a `jall` class the page sets for it; without that, the walker read off-screen frames as
empty (19,793 "nothing drawn").

**Measured alone, on mains power** (lesson 43; earlier runs that shared the CPU with other checks were discarded):

| Page | Chrome light 390 | light 1440 | dark 390 | dark 1440 |
| --- | --- | --- | --- | --- |
| `main` before the fix | 55 ms | 61 ms | 55 ms | 64 ms |
| Fixed | 0 ms | 0 ms | 0 ms | 0 ms |

Held by `tests/journey_facts/m180.mjs`, which pins both halves and refuses `main`'s page; the behaviour is proved by
`node scripts/design_runtime.mjs docs/design/journeys/index.html --engine chrome` (local only).

## The keyboard-only pass (passes)

`node scripts/design_keyboard_pass.mjs` (new, in the design-walk gate) tabs through every journey on the Journeys page
(both options, with the flip; Track record on its pick, A) and on Prism Admin (the owner's picks: Home B, Audit B, the
rest A), at desktop size. Tab reached **every** control the screens draw, each with a visible focus ring, never
stopping on anything hidden or inert and never stuck: 2,151 controls in all. Controls inside a closed disclosure ("Correct
this note", "Other ways in") are left out until it is opened; its summary is reached. The pass refuses a copy with the focus
ring removed (452 controls with no ring) and one with back buttons hidden (11 unreached). Prism's own page is covered by
`node scripts/design_prism_press.mjs`, which holds.

## What the owner checks on the device

Open each artifact signed in to claude.ai on the iPhone (and the Journeys and Admin pages on the iPad):

- Prism: https://claude.ai/artifact/JNjSL7QearPap1zGHBTPGu
- Journeys: https://claude.ai/artifact/UXvLXTKyH9zd1r7CtXG2Kq
- Prism Admin: https://claude.ai/artifact/TSrmRb5RpjhGE1iqrZkejf

**At 20% brightness, indoors, light then dark:** can every figure, label, chip and banner be read without effort; does
any grey text, chart label or dashed outline fade out; is the difference between Ready, Stale, Offline and Error clear
without colour alone.

**With VoiceOver on (Settings, Accessibility, VoiceOver), on the picked options:** swipe through one frame of Home,
Holdings, Forecast, Approvals and Privacy on the Journeys page, and of Admin home and Incidents on Admin. Does each
control say what it is and what it does; is an illustration announced as one ("Illustration: drawn, and does nothing on
this page"); do figures read with their units and time; does anything read twice or not at all.

Report what you found in words, or that nothing was found. A fault found becomes a fix on the design first and a check
where a command can catch it.
