# MP-64 round 1: how to fix your lane

The reviewers' reports are `review/MP-64/round-1-lane-{f,m,a,s}.md`. Fix every blocking finding in your report, and any non-blocking one that takes
only a few lines. Keep your own files: journeys and CSS as before. Never edit the shell, `permissions.json`, a script or another maker's journey. A join you
cannot fix from your side goes in your report.

The coordinator has already changed:

- `permissions.json` now has 75 actions. New ids: A52 retry a commit, A53 refresh a stale preview into a new revision, A54 retry an export, A55 resolve a difference, A56 edit, exclude,
  remap or select rows, A57 run a coverage check, A58 draft a configuration change, A59 resume a recovery, A60 decline a replay or a switch, A61 admit a factor, A62 approve a rules version, A72
  approve release thresholds (A30 is now labels only), A75 resolve an incident (A40 is now acknowledge only). A63 to A71, A73 and A74 are listed with `control: named`: they need no control, but draw one where it belongs.
- A48 Enrol a passkey is off on a phone. Live on a phone: reads, A40 acknowledge, A49 revoke, A50 cancel, A59 resume a recovery.
- `node scripts/design_admin_facts.mjs` now refuses a button outside `act()` whose label reads like a write. Use `act()` for anything that writes, spends or starts work. Rename a plain
  moving-around button if its label trips the check ("When a run goes wrong" trips it on "run"). A text input on a phone is disabled or left out.
- Every `phone: live` action must be live on at least one phone screen. Every Proposed id must exist in the planning records.
- The freshness chip has a conflict case. The phone line now reads "Changes happen on iPad or desktop." Say "account recovery" where you mean a lost device.

## Hold each fix with a check

Every blocking finding you fix gets a check in `tests/admin_facts/<lane>.mjs`, named by its id:

```js
export default {
  'R1-f1': ({ view, each, must, has, lacks, perms }) => {
    has(view('audit', 'b', 'b-lineage', 'web', 'default').text, /Outcome/);
  },
};
```

`view(journey, option, screen, device, state)` returns `{ html, text }`. `each({ journey, option, screen, surface, state }, (v, at) => ...)` walks them. A check tests what the fix does, in every state and
device it applies to, not a word of source (lessons 2, 3, 11). Prove each one by undoing the fix once: it must fail (lesson 34). A finding that is held by the page-wide gate says so in your report instead.

```bash
node scripts/design_admin_facts.mjs --facts --page PATH
node scripts/design_admin_facts.mjs R1-f1 --page PATH
```

Finish with the walker on your journeys, all surfaces, both themes. Do not commit. Report per finding: fixed, or why not, and any join for another lane.
