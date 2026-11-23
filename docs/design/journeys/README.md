# Prism Journeys (MP-62)

Every owner journey of MyPrediction, drawn in [Prism](../prism/README.md): two options each, kept with a flip, every
screen in every state, on iPhone, iPad, desktop and phone web, in light and dark. `index.html` is one interactive page,
synced to a private Claude artifact. The owner keeps both options on all eight journeys, with a flip between them (MP-178,
`docs/design/reviews/MP-62/decision.md`).
Admin journeys are MP-64, not here. Nothing here is product code: UX is not approved and nothing may be built.

## How it is made

| File | What |
| --- | --- |
| `src/journeys/<id>.js` | One journey, registered with `J.add()`. Ids and order: home, holdings, forecast, research, journal, cost, approvals, privacy |
| `src/journeys/<id>.css` | Layout only that journey needs, classes prefixed with its id. Prefer Prism's components. A component a picked option keeps goes into Prism first, under `.claude/rules/design-sync.md`, before anything is built |
| `src/shell.*` | The page around the screens, the device chrome and the state helpers |
| `build.py` | Takes tokens, components, icons, helpers and frames from `docs/design/prism/` as they stand, and writes `index.html` |

`node scripts/design_journeys_facts.mjs --all` renders every screen with no browser and proves each fixed review finding still holds; the checks are in `tests/journey_facts/`. `node scripts/design_journeys_press.mjs PAGE` presses the horizon, detail and dossier switches.

`python3 docs/design/journeys/build.py` builds everything. `python3 docs/design/journeys/build.py --only home,forecast --out /tmp/x.html`
builds a partial page for one designer's preview. `node scripts/design_journeys_check.mjs PAGE [--only home]` walks every
journey, option, device, state and theme.

## A journey

```js
J.add({
  id: 'home', title: 'Home', stories: ['MP-153'], summary: 'One plain sentence.',
  options: [{
    id: 'a', name: 'Short name', rec: true,
    why: 'Why this is recommended, in two sentences at most.', cost: 'What it gives up.',
    screens: [{
      id: 'home-top', title: 'Home', note: 'Optional line under the frame.',
      na: { noModel: 'Why this state does not apply to this screen' },
      render: ctx => frame(ctx, { tab: 0, title: 'Portfolio', body: region(ctx, { ok: () => '...', what: 'Holdings' }) })
    }]
  }, { id: 'b', name: '...', why: '...', screens: [...] }]
});
```

`ctx` is `{ kind: 'iphone' | 'ipad' | 'web' | 'pwa', state, scheme, journey, option }`. Everything in Prism's script is in
scope: `H`, `byT`, `SEG`, `T5`, `ic`, `pct`, `money`, `chg`, `logo`, `badge`, `fresh`, `illus`, `seg`, `H36`, `range`,
`hrow`, `skelRow`, `tile`, `top5`, `alloc`, `valcard`, `fcChart`, `fcard`, `proof`, `legend`, `tb`.

`frame(ctx, spec)` draws the device: `spec` takes `tab` (0 Portfolio, 1 Forecasts, 2 Segments, 3 Record, 4 Settings; 4 lights
Settings in the iPad and desktop sidebar too), `side` (a sidebar place to light on iPad and desktop: `research`, `approvals` or
`imports`, the three the owner put there, "Add them to the sidebar", OWN-02; `placed(ctx, place, spec, from)` sets it and drops a
first screen's way back to the phone's tab `from`),
`title`, `back`, `actions`, `webActions`, `body`, `rail` (the second column on iPad and desktop; follows the body on a
phone), `accessory` (above the iPhone dock), `sheet` (a `.sheet` element, shown over the screen), `field: false`.

`region(ctx, { ok, what, rows, loading, empty, error, stale, offline, noModel, disagreement, abstention })` draws one part
of a screen in the selected state. Give only what differs. Also `banner(kind, title, text, icon)`,
`stateCard(icon, title, text, action, foot)`, `btn(label, kind, icon)`, `skel(n)`, `freshRow(ctx)`.

Frames on iPad and desktop scale to fit the page down to 70%, then scroll; the checker measures them at their true size.

## The flip

`FLIPS` in `src/shell.js` says which screen turns to which. `frame()` draws the control from it, so a journey adds nothing. A pair must
show the same freshness, provider status and risk in every state. The figures both sides show stay the same, and a side may hold more (the owner, 4 November 2026). In some states a screen has another partner (`FLIP_TO`), or does not flip (`FLIP_OFF`).

The owner's rules, 4 November 2026 (MP-178): each journey starts in A, the choice is kept per device, each journey flips on its
own, and there is no flip while signed out, during a step-up, behind an open sheet, or on a proposal, an approval or a record being written.

The page keeps each flip in this browser (`mp178-flips`), journey by journey, so a reload shows the frame on the view you left it on. It keeps the ids of
that view and the one it came from, and nothing else: no figure, instrument, horizon, draft or approval, so a horizon pressed inside a frame goes back to its
default on a reload. If storage is refused the flip still turns, for that page only. The strip turns one frame at a time, and the rest of it stays where it is.

Open, for the owner (MP-182, listed on the page): does a kept flip cover one screen or the whole journey, and is "per device" the phone in your hand or the
frame drawn here? A flip kept in this browser shows on every drawn device. Proposed, not decided: the app's choice covers the whole journey.

The page's selectors keep focus on the control pressed, and a theme press repaints the frames already drawn, without a reload. Both hold on Prism Admin too.
`scripts/design_prism_press.mjs` presses all of this, with its `--selftest` undoing each fix on a copy.

## States

Every screen shows loading, empty, error, stale, offline, no model, disagreement and abstention. Write the state for what
this screen is; the generic fallback is a floor, not a design. A state may be marked `na` only when it truly cannot occur
on that screen (no forecast is on it, so no model cannot arise), with the reason, which the inventory shows to the owner.
Never hide risk, staleness or a provider's status behind a spinner: freshness stays in view in every state.

## Rules

- MP cannot trade. No buy, sell or order control, and no wording that reads as personalised advice. Ranked actions (add,
  hold, pause, trim, rebalance) are labelled decision support, with a reason and the uncertainty.
- A forecast is never a bare number: horizon, as-of time, data cutoff, range or probability, calibration and track record,
  model version one tap away. Long-term (3, 6, 12 months) leads; 1 to 20 sessions sit apart, labelled short-term.
- Historical data, evaluated forecasts and conditional scenarios (which claim no likelihood) look different.
- A combined score appears only when growth, protection and opportunity are all eligible (POLICY-006). A missing one
  means no score, said in words.
- Numbers come from code and models; Claude only explains, and every figure it quotes carries a source.
- Holdings first on home. Holdings and imports are separate places.
- Privacy mode masks money and units, and percentages stay ("Mask units too", OWN-18). Lock screens, widgets and
  snapshots show no holdings.
- Each market runs on its own clock (POLICY-002): cutoff at +60 and forecasts by +75 after its close, US 22:00 and 22:15, UK
  17:35 and 17:50, India 11:00 and 11:15. Use `CLOCK`, `clockOf(h)`, `ASOF_ALL` and `LASTGOOD_ALL` from `src/shell.js`, never one
  nightly run across the portfolio (ADM-10, ADM-22). A failure comes after its run starts: Twelve Data fails at 21:16 (ADM-11).
- Every Home carries the cost pill in its top bar, `costPillOf(ctx)`, from the cost journey's own month ("Pill on every Home",
  OWN-06). No cost row or card sits on the holdings.
- Every figure is illustrative and labelled. Use the shared figures in `docs/design/reviews/MP-62/brief.md`.
- Prism's tokens, type, icons, motion and 44-point targets. Add `data-mo` roles so screens arrive subtly. Text at least 12 px.
- Prefer short, active, plain copy.
