# Prism Admin (MP-64)

Every admin journey of MyPrediction, drawn in [Prism](../prism/README.md): two options each, every screen in every state, on
iPhone, iPad, desktop and phone web, in light and dark, with the permission inventory. `index.html` is one interactive page,
synced to a private Claude artifact. The owner picks one option per journey (PH00-S06), so there is no flip here.
Nothing here is product code: UX is not approved and nothing may be built.

| File | What |
| --- | --- |
| `permissions.json` | Every admin action, whether it needs a fresh sign-in (ARC-07), what it writes to the audit, and the acts refused outright. Screens draw controls from it, so a screen cannot grow an action it does not list |
| `src/journeys/<id>.js` | One journey, registered with `J.add()`. Ids and order: home, files, audit, runs, agents, models, approvals, costs, incidents, identity |
| `src/shell.*` | The page around the screens, adapted from Prism Journeys: admin's states, freshness, sidebar and inventories |
| `build.py` | Takes tokens, components, icons, helpers and frames from `docs/design/prism/` as they stand, and writes `index.html` |

`python3 docs/design/admin/build.py` builds it. `node scripts/design_admin_facts.mjs` proves what MP-64 asks of the page with no
browser: all ten journeys, one recommended option each, every action drawn, the coverage matrix, the refusals and the barred
words. `node scripts/design_journeys_check.mjs docs/design/admin/index.html` walks every journey, option, device, state and theme.

Compare and pick shows one card per screen, both options side by side, and copies the owner's picks as text. `node scripts/design_admin_press.mjs` presses it.

How a journey is written is in `../journeys/README.md`, and the makers' brief, with the shared story, is in
`../reviews/MP-64/brief.md`.
