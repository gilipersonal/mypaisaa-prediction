# MP-64 admin journeys: the makers' brief

Draw every admin journey of MyPrediction in Prism, on one page, two options each, in every state, on iPhone, iPad, desktop
and phone web, in light and dark. Nothing here is product code. UX is not approved and nothing may be built.

Read first, in this order: this brief; [facts.md](facts.md), the fact sheet, which is your source for every state, limit,
name and figure; `docs/design/journeys/README.md` for how a journey is written; `docs/design/admin/src/journeys/home.js`, a
finished example; the lessons in `.claude/rules/independent-review.md` (25 to 39 above all). Read the owner journey your
journey touches: `docs/design/journeys/src/journeys/{approvals,cost,privacy,holdings}.js`.

## The story

PH00-S06 (MP-64), acceptance in facts.md section 2. Each journey covers investigation and comparison, approve and reject,
source inspection, reprocessing and correction, configuration changes, cost reconciliation, the stale, conflicting, expired
and denied cases, and failure, replay, restore, rollback and deletion. The owner picks one option per journey, so there is
no flip here. MP has one owner: no roles, no household, no other users.

## Who draws what

| Maker | Journeys (id) |
| --- | --- |
| 1 | Files and Imports (`files`), Audit (`audit`) |
| 2 | Runs and Health (`runs`), Agents (`agents`), Models and Evaluations (`models`) |
| 3 | Approvals and Configuration (`approvals`), Costs and Budgets (`costs`) |
| 4 | Incidents and Recovery (`incidents`), Identity and Devices (`identity`) |

Edit only `docs/design/admin/src/journeys/<id>.js` and `<id>.css` for your own ids. Never edit the shell, Prism, the
permissions file, a script or another maker's journey. If you need something from them, say so in your report. Do not commit,
push or touch Jira.

## Two options, each a complete answer

Starting directions. Change one only if you can say why it is better. The options must differ in structure or flow, never in
colour. Mark exactly one `rec: true`, and write `why` and `cost` in two sentences at most each. Four to six screens an option.

| Journey | A | B |
| --- | --- | --- |
| files | Status queue: every file by what it needs, then its detail | One file's life: original, extraction, revisions, approval, commit, retention, on a timeline |
| audit | Ask a question: "who changed this fee, from which document, what did I approve, which forecasts used it" | Explorer: filter recorded changes, with a lineage pane |
| runs | Tonight's clock: +15, +40, +60, +75 by market, then what ran | Run list: every run and queue, with attempts and evidence |
| agents | Roster: 7 Claude routes and 5 code workers | Route by route: one route's manifest, versions, runs, cost |
| models | Pipeline: candidate to active, by stage | Scoreboard: each scope against base rate and rules |
| approvals | Settings by version: what is current, its history, propose a change | Change requests: a queue of proposals and their outcomes |
| costs | Estimate, usage and bill side by side, line by line | From a spike: drill to the runs and jobs behind it |
| incidents | Incident timeline: detect, acknowledge, mitigate, resolve | Runbook first: the procedure, with restore, replay and rollback as steps |
| identity | Paths first: how you get back in | Devices first: what is signed in now |

## How to write it

- A journey is a block `{ ... }` with its own helpers, calling `J.add({ id, title, stories: [...], summary, options })`, as
  `home.js` does. Stories are the Jira keys from facts.md section 2.
- `frame(ctx, { title, back: 'Admin', body, rail, sheet })`. The admin sidebar and the tab bar come from `frame`; do not pass
  `tab`. A screen deeper in the journey sets `back` to the screen it came from.
- Each option needs `covers: { compare, decide, source, correct, config, cost, recover }`. Each value is the id of a screen in
  that option, or `'n/a: <why this does not belong in this journey>'`. Audit is read-only, so its `decide` is n/a, with the
  reason. Say where the thing lives instead.
- Helpers in scope from the shell: `region`, `banner`, `stateCard`, `btn`, `bs`, `skel`, `lead`, `item`, `list`, `sec`, `kv`,
  `box`, `lbl`, `wide`, `browser`, `plain`, `act`, `refused`, `proposed`, `freshRow`, `PLACES`, and everything in Prism's
  script: `ic`, `seg`, `money`, `chg`, `badge`, `illus`, `tb`. Icons: home fan grid target sliders search sidebar person chev-r
  chev-l chev-d clock wifi-off alert info check x ban lock shield eye-off refresh plus equal pause trim rebalance cube split
  flip db layers scenario up down. There are no others.
- **Every control that changes something is `act('A07', 'Approve this import', 'primary')`**, by its id in
  `docs/design/admin/permissions.json`. `act` draws the lock and "Asks for a fresh sign-in" for a yes, and `Proposed · CT-01` for
  an open one. Never draw such a control with `btn`. Plain `btn`/`bs` are for moving around: open, filter, back, try again. Your
  journey must draw every action that names it in `permissions.json`. A44 and A45 are outside MP: say where they happen, with no
  button.
- **A refused act is `refused('R5', 'plain sentence saying why not')`**, and offers no control. Facts.md section 3 lists them.
  R1, R5, R6 and R8 must appear somewhere; draw the ones your journey touches.
- `proposed('CT-14')` labels anything the records leave open, with the id that would close it. Facts.md section 6 says which.
  Never state an open value as settled. Never invent a limit, a window, a threshold or a mechanism: if the records give no
  number, the screen gives no number.
- Layout only your journey needs goes in `<id>.css`, classes prefixed `a<id>-`, using Prism's tokens. No raw colours. Tables
  become rows on a phone. Prefer Prism's rows, cards and chips.

## States

The state selector has Ready, Loading, Empty, Partial, Failed, Stale, Offline, Conflicting, Expired, Denied. Write each state
for what this screen is, using the states facts.md names for it: `reconcile_required`, `Index lagging, with fallback to
manifests`, `Refused for a stale revision`. `region`'s fallback is a floor, not a design, and a reviewer will read every state.
Mark a state `na` only when it truly cannot happen on that screen, with the reason.

- Reads stay open in every state. Audit, sign-in, ledger reads and recovery work at every cost threshold.
- Denied means this needs a fresh sign-in or was refused; it never blanks what you may read.
- Offline means nothing can be changed: "No financial write offline."
- Stale, unknown, missing and failed are never shown as zero or as green. "A missing or failed gate is never green."
- A status says what the system knows (lesson 39).

## The shared story

Facts.md section 5 holds the figures. Reuse them word for word, and a sum beside its inputs must be computed from them. Admin
"now" is **Wed 4 Nov, 11:40 London**, prod. The cost month is its own illustrative calendar, day 18 of 30, and a screen that
joins cost to a run says which it shows.

Ready is the same world as the owner journeys: last night's run succeeded, HSBC is late. Other states are other worlds, as they
are there. Admin mints the ids the owner journeys lack. Use these, and no others without saying so:

| Thing | Id |
| --- | --- |
| Forecast run, Mon 2 Nov 21:15 | `run_8c41` |
| Forecast run, Tue 3 Nov 21:15 (succeeded in Ready; failed at 21:14 in Failed) | `run_8d02` |
| Its collect job | `job_3e9a` |
| Trace | `tr_51c2` |
| Request behind a failed call | `req_a90f` |
| Incident, HSBC price late, detected Tue 16:50, acknowledged | `inc_0012` |
| Incident, forecast run failed Tue 21:14 (Failed worlds only) | `inc_0013` |
| Last restore exercise, passed Sun 1 Nov | `rx_0007` |
| Release | `rel_0031` |
| Approval | `apr_7f3c`, as the owner journeys |

## Words

Plain, short and exact, in British English. Say "you" for the owner. No em dashes. No "kill switch": the records say pause
switch. Never call a hash chain tamper-proof: show `digest_only` as what it is. The chain of who did what is "Code checked",
"Claude drafted", "You decide". The fresh sign-in line, word for word: "Opening the app with Face ID, or an open session, is not
enough. The server checks a fresh sign-in." On every import screen: "This records what already happened at your broker. It
places no trade." MP cannot trade: no buy, sell or order control, and no wording that reads as personalised advice.

## Prove it

Use the scratchpad path you are given for builds. Every browser command has a hard time limit.

```bash
python3 docs/design/admin/build.py --only home,files --out PATH
node scripts/design_admin_facts.mjs --page PATH
perl -e 'alarm shift; exec @ARGV' 280 node scripts/design_journeys_check.mjs PATH --only files --themes dark --surfaces iphone,web
```

Finish with the walker on all surfaces in both themes, run in the background, and look at a few screens in light and dark
yourself. The walker measures contrast, overflow, clipped text, tap sizes and trade words. Fix what it finds. Do not change a
gate to pass it.

Report: the screens per option, which `permissions.json` actions you drew, what you labelled proposed, anything the records
contradict, and the last gate output. Keep it short.
