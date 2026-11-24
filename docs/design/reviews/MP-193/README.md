# MP-193: the audit's dead controls and combined states

The Impeccable audit (MP-181, [handover](../../handover/impeccable-2026-11-04/README.md)) left two findings open before UX
approval. UX-02: most drawn controls announce themselves as buttons and do nothing, with no word of which are working,
illustrated or unavailable by policy. UX-12: every screen shows one state at a time, so risky pairs of conditions are not
designed. This change settles both on the owner page (Prism Journeys) and Prism Admin. Design only: nothing is built.

## What changed

### 1. Every drawn control says what kind it is

Each control on a screen is now one of three kinds, marked as the screen is drawn on the page (`markControls` in both shells):

| Kind | What it means | How it shows |
| --- | --- | --- |
| Works here | It does something on this page: a flip, the horizon, detail and dossier switches that redraw, a ladder row that opens, a place that opens its journey | Solid outline |
| Illustration | A control the product will have, drawn, that does nothing on this page | Dashed outline |
| Not allowed here | Drawn disabled, and the screen says why | Dotted outline |

A switch under State, **Mark what works**, turns the outlines on and off; it is off by default, so the screens show as
designed. A screen reader hears the kind on every illustration and every disabled control ("Illustration: drawn, and does
nothing on this page"; "Not allowed here; the screen says why"). The screens' own drawings do not change.

### 2. Prism Admin's nine places link to their journeys and back

Admin home's tiles (B) and rows (A), and every sidebar place on iPad and desktop, open their journey on this page on its
picked option (Audit B, the rest A), keeping the device and state. Every journey's **Back to Admin** returns to Admin home.
Pointer and keyboard (Enter, Space) both work, focus moves to the journey's title, and the change is announced.
**Back to Settings** on Admin home stays an illustration: Settings lives on the owner page.

### 3. Combined conditions on the approval path

A view in the owner page's journey list, **Combined conditions**, draws three risky pairs on the real Approvals screens, on
iPhone and desktop, each with both conditions showing, and names when it happens, what stays, what you can do, what is held,
how it recovers and what the record keeps:

| Pair | Built on | Rests on |
| --- | --- | --- |
| Offline, and the proposal expired meanwhile | Settings proposal, Stale (expired), with the offline banner | OWN-08 (a repeat backs off) |
| Amounts hidden, with a budget raise to approve | Budget raise, Ready, amounts masked, with the hidden banner | OWN-18 (mask units too), OWN-35 (code may draft a raise) |
| The month cannot be known, and you are offline | Budget raise, Abstaining, with the offline banner | MP40-Q5 (the prod collector fills the month) |

## Settled by the owner

On 24 November 2026 the owner pressed "Accept all three (Recommended)" for these (MP-66); the option read "Each Proposed ·
MP-193 label becomes settled with your words." The page now labels them **Settled · MP-66**.

- **The rule for any pair:** "Every condition that stops a write keeps stopping it, whichever banner shows first. A screen with
  two conditions shows both banners, each in its own words. Reading, going back and showing what is hidden stay open;
  approving, refusing and anything else that writes waits until every condition has cleared."
- **Amounts hidden holds Approve:** an approval about an amount waits until amounts show, so the owner never approves a figure
  they cannot see. Refuse stays open. Showing amounts needs only a press, on that device, and writes nothing.
- **The three-kind contract itself,** and the switch being off by default.

## Not in this change

- The audit's other routes (UX-02's Portfolio to Research, Imports, Approvals, Privacy and Admin across the two pages) are not
  wired: the owner page and Admin are separate pages, and those places are marked as illustrations.
- Other pairs the audit lists (partial market data with abstention; billing unknown with consent withdrawal) are not drawn;
  the second rests on an admin answer ("Allow it", MP-64) that the owner page does not draw.
- Opening the page from a local server without the artifact's wrapper shows "Â·" for "·", because the page carries no
  character set of its own; the published artifact is not affected.

## How it is proved

| Gate | What it proves |
| --- | --- |
| `node scripts/design_journeys_facts.mjs --all` | `tests/journey_facts/m193.mjs`: every control on every screen, device and state carries its kind, a working hook is always marked working, the legend and screen-reader sentences are on the page. `m193c.mjs`: each pair shows both conditions, no write is live unless the pair allows it, hidden amounts never show a figure, moving about is never held, and the rule is on the page, labelled proposed |
| `node scripts/design_admin_facts.mjs --facts` | `tests/admin_facts/m193.mjs`: every admin control carries its kind, Admin home links all nine places on every device, every Back to Admin goes home, and the sidebar opens all ten places and marks one current |
| `node scripts/design_admin_press.mjs` | Pressing a tile, Back to Admin, Enter and Space, and a tile again after a change of state; the switch on and off |
| `node scripts/design_combos_press.mjs` | The view opens from the journey list, draws every pair on both devices with no write live, fits each frame, survives a theme change and a round trip |
| `node scripts/design_journeys_check.mjs` | Both pages walked in every device, state and theme |

Each check was proved by breaking a copy of the page: an illustration with no screen-reader sentence, dossier rows marked
illustrative, an extra switch marked working, the tile, back and sidebar links removed, the write hold, the amount mask and
the second banner removed. Every one was refused for its reason.
