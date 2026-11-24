# Prism Admin (MP-64)

Every admin journey of MyPrediction, drawn in [Prism](../prism/README.md): two options each, every screen in every state, on
iPhone, iPad, desktop and phone web, in light and dark, with the permission inventory. `index.html` is one interactive page,
synced to a private Claude artifact. The owner picks one option per journey (PH00-S06), so there is no flip here.
Nothing here is product code: UX is not approved and nothing may be built.

| File | What |
| --- | --- |
| `permissions.json` | Every admin action, whether it needs a fresh sign-in (ARC-07), what it writes to the audit, whether it works on a phone, and the acts refused outright. Every control that changes something is drawn with `act()`, and `scripts/design_admin_facts.mjs` refuses a button that reads like a write outside it. Plain `btn` and `bs` are for moving around |
| `src/journeys/<id>.js` | One journey, registered with `J.add()`. Ids and order: home, files, audit, runs, agents, models, approvals, costs, incidents, identity |
| `src/shell.*` | The page around the screens, adapted from Prism Journeys: admin's states, freshness, sidebar and inventories |
| `build.py` | Takes tokens, components, icons, helpers and frames from `docs/design/prism/` as they stand, and writes `index.html` |

`python3 docs/design/admin/build.py` builds it. `node scripts/design_admin_facts.mjs` proves what MP-64 asks of the page with no
browser: all ten journeys, one recommended option each, every action drawn, the coverage matrix, the refusals and the barred
words. `node scripts/design_journeys_check.mjs docs/design/admin/index.html` walks every journey, option, device, state and theme.

Compare and pick shows one card per screen, option by option, and copies the owner's picks as text. `node scripts/design_prism_press.mjs` presses the theme, the selectors and Compare's rows, and `node scripts/design_admin_press.mjs` presses it.

Admin home's places, the sidebar and every **Back to Admin** open their journeys on this page, on the picked option, by
pointer or key, and every control is marked as working, an illustration or not allowed here, with **Mark what works** to
outline them (MP-193, `../reviews/MP-193/README.md`).

How a journey is written is in `../journeys/README.md`, and the makers' brief, with the shared story, is in
`../reviews/MP-64/brief.md`.
