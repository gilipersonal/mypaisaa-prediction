# MP-64 round 1, lane f: Admin home, Files and imports, Audit

Reviewed at `6705fc1` (HEAD `49f1c7d` changes nothing under `docs/design/`). Picked options read in depth: Home B, Files A, Audit B. Paths are short forms: `home.js`, `files.js`, `audit.js` are in `docs/design/admin/src/journeys/`; `holdings.js`, `privacy.js` and owner `approvals.js` are in `docs/design/journeys/src/journeys/`.

**Counts: 24 findings. P0 0, P1 3, P2 14, P3 7. Blocking 16, non-blocking 8.**

## Blocking

### R1-f1 · P1 · blocking · `audit.js:168`, `audit.js:252`
**The picked Audit's lineage stops at the forecast, so the prediction-to-outcome trail is gone.**
Evidence: `PANE` has seven steps: Source, Draft, Approval, Before and after, Correction, Dependencies, Forecast. Risk, Action, Outcome and Audit are not among them. MP-151 (a story this journey claims, `audit.js:213`) says "From any figure the owner can open the chain source, ledger, risk, forecast, action, outcome and audit." `AGENTS.md`'s mission requires "a complete prediction-to-outcome audit trail". That chain is drawn only in option A's `a-follow` (`audit.js:77-85`), which the owner did not pick. "Full lineage" (`b-lineage`) is the same seven steps.
Correction: carry `FOLLOW`'s Risk, Action, Outcome and Audit steps into `b-lineage`, in `PANE` or as a second part under it. Every `paneFor` state then covers them, with Outcome's "Not scored: its horizon has not passed".

### R1-f2 · P1 · blocking · `files.js:104`, `files.js:105`, `files.js:107`, `files.js:126`, `files.js:127`, `files.js:147`; `shell.js:7`
**On a phone, controls that change the ledger or a draft stay live, outside the inventory.**
Evidence: `node scripts/design_admin_text.mjs files a a-approve error iphone` prints an enabled primary "Retry safely" on a commit. The same goes for "Refresh preview" (a-approve stale and conflict), "Retry safely" and "Refresh" on a-fix, and "Try again" on the export. All are `bs()`, not `act()`, so they skip `permissions.json`. No `data-phone-off` is emitted, so the frame's "Changes happen on iPad or desktop" line does not show either. The owner said "Under Settings, phones read only". `shell.js:7` promises "Every control that changes something comes from the permission inventory". `scripts/design_admin_facts.mjs:56` reads only `data-act`, so it cannot see these. "Sign in again" (`files.js:109`) on a phone leads to an approval that the phone refuses.
Correction: add inventory rows (retry a commit on the same approval; refresh a stale preview into a new revision; retry an export), each with step-up, phone and audit. Draw them through `act()`. Extend `design_admin_facts.mjs` to fail a `bs()` whose label retries or refreshes a write. Check the other lanes for the same pattern.

### R1-f3 · P1 · blocking · `files.js:115`, `files.js:80`, `files.js:226`; `docs/design/admin/permissions.json`
**The inventory misses acts that Files names, so it does not list "every admin action".**
Evidence: `files.js:115` says a difference stays open "until you fix it or resolve it with a reason", and no control follows. PH01-S17: "An owner resolution records its reason and source", and its authority line says the owner resolves differences. `holdings.js:460` draws Resolve, and `holdings.js:198` draws "Keep it open, with a reason". A search of `permissions.json` for resolve, difference, edit, exclude, mapping, select, retry and refresh finds only A35 and A40, neither of them related. `files.js:80` and `:226` also name "An edit, a reprocess, a remap or an exclusion", and the screens never draw selecting a group, editing, remapping or excluding, though the approval binds "one exact selection". PH01-S13 audits each as a new revision.
Correction: add rows for resolving a difference (reason and source, audit record) and for edit, exclude, remap and select, with step-up, phone and audit. Draw "Resolve, with a reason" on `a-fix`, or state in the row and on the screen that it happens in Holdings and link there. Include the "Resolved by the owner, with reason" state from PH01-S17.

### R1-f4 · P2 · blocking · `audit.js:196`, `audit.js:248`
**Explorer's filter offers 4 of AuditQuery's 9 kinds, while its note says it holds AuditQuery's fields.**
Evidence: the segment is `['Changes', 'Lineage', 'Commits', 'Exports']`. `financial/contracts.schema.json:2262-2274` has nine kinds. `metric_inputs`, `supersession`, `outbox_delivery` and `source_orphans` have no way in, and `economic_history` is reachable only if the clock toggle is meant to stand for it. Option A's list of nine questions (`audit.js:24-34`) is not on the picked option, so "Which inputs made this figure?" cannot be asked. The `b-filter` note reads "The fields are AuditQuery’s".
Correction: make the kind control a list of all nine, using the plain question wording from `Q`, or say which kinds are left out and why.

### R1-f5 · P2 · blocking · `audit.js:170`, `audit.js:172`, `audit.js:243`, `audit.js:260`
**Nothing on the picked Audit leads to Gaps and integrity, Before and after, or Full lineage.**
Evidence: `b-explore` holds a Filter button, record rows and a static lineage pane. No control names those three screens, and each only has `back: 'Audit'`. The coverage matrix cites `b-gaps` for "Failure, replay, restore, rollback, delete" and `b-compare` for comparison. The integrity claim and the orphan row live only on `b-gaps`. Lessons 28 and 31.
Correction: add two rows under the pane, "Before and after" and "Open full lineage", and one on the list, "Gaps and integrity". Say which screen a row opens.

### R1-f6 · P2 · blocking · `audit.js:180-181`, `audit.js:192-193`
**In two Explorer states the lineage beside the list belongs to a different record.**
Evidence: expired selects row 1, "Watch Barclays · Nobody · expired Wed 08:14", while the pane shows the ISA statement with "Approved 21:18 · expired 21:33". Denied selects row 3, "Let the chat route add listings", while the pane shows `permission_denied` on the ISA statement's source. Lesson 27.
Correction: keep row 8 selected in both, or give the pane the selected record's own lineage. Watch Barclays and the refused route each have no source to deny.

### R1-f7 · P2 · blocking · `audit.js:183-194`, `audit.js:252`
**`b-lineage` reuses the pane, so its failure states give no reason and read as mostly fine.**
Evidence: `paneFor` has no banners, which works beside `b-explore` but not as a full screen. `audit b b-lineage error web` prints "Query incomplete" and six steps with green `resolved`, with no affected range and no retry. PH01-S04: an integrity failure names "the affected range", and the query "reports INTEGRITY_INCOMPLETE rather than a partial answer". PH01-S21: "not a partial success". The expired state shows "No commit started" and "Forecast: None" on a lineage still reading "Draft: 12 rows, as you approved them", "Dependencies: Later events on these rows" and resolved, for the source of committed receipt R-0210. Denied gives no reason on this screen.
Correction: add a `b-lineage` state banner per state, reusing `recBody`'s and `gaps`'s wording. In error, withhold the steps or mark them not vouched for, not `resolved`. Draw expired on its own uncommitted approval, not R-0210. Decide on one rule for `partial` too: `b-explore` shows a partial query as a partial list, and the story says INTEGRITY_INCOMPLETE.

### R1-f8 · P2 · blocking · `home.js:19`, `home.js:39`, `home.js:46`
**Home B's Empty state contradicts itself and the option's own promise.**
Evidence: `home b b-home empty web` shows "Nothing waits on you." with the rail still saying "4 decisions wait on you." The lines beneath still read "1 draft waiting", "R2-HGB v4 waits on you · US tech 12 months paused" and "1 open". Tiles change to option A's rows, though `why` says "the shape never changes with what is waiting".
Correction: make `b` draw `tiles` in empty, drop the rail banner there, and give `PLACE_LINE` empty values for Files, Models and Incidents.

### R1-f9 · P2 · blocking · `home.js:45-46`; `shell.js:86`
**Home B ignores its state.**
Evidence: `QUIET` is used only by option A. The rail banner is one fixed string in Loading, Failed, Stale and Offline, where owner `approvals.js:393` changes it per state ("Checking what waits on you", "Could not check what waits", and so on). In Partial, `home b b-home partial web` says "What is missing is named" and no tile names anything. Place lines stay unchanged in Failed and Stale. Conflicting says "Admin changed while you were reading" and Expired says "the request passed its time", with no request. Lessons 28 and 39.
Correction: give `b` its own `partial`, `error`, `stale`, `conflict` and `expired`, naming the missing source on its tile and following owner `approvals.js:393` for the banner.

### R1-f10 · P2 · blocking · `home.js:15`, `home.js:46`
**On a phone, the only signal of what needs the owner sits far below the first view, and it omits the incident.**
Evidence: measured on iPhone at `#home.b.iphone.default`: Incidents tile top at 1,054 px, banner at 1,314 px, in an 844 px frame. The banner names only decisions. The incident tile has the same neutral tone as the rest. The owner accepted "an open incident is easier to miss", but lesson 38 and `AGENTS.md` ("Never hide risk") still apply, and the banner's place on a phone follows from `rail` going last, not from the pick.
Correction: on phones, put the banner first in `body`, add "1 incident open", and give the Incidents tile `lead(i, 'warn')` while one is open. The nine tiles stay equal in size.

### R1-f11 · P2 · blocking · `files.js:129`
**The refused reversal's only way forward is missing, and the button offered is for another correction.**
Evidence: the banner says "A sale on 2 Nov depends on these units. Approve its correction together with this reversal". The screen's primary is `correctBox`, "Approve this correction", which is "Sold 8, not 10?" on the 22 Oct sale, not the 2 Nov sale. The reversal has `go: false`, so nothing combines them. `holdings.js:277` has "Review both together". PH01-S18: "refused unless its dependent corrections are approved together".
Correction: draw the 2 Nov sale's correction and one combined approval, as the owner journey does. Add the act to `permissions.json`, or extend A10 and A11 to say so.

### R1-f12 · P2 · blocking · `files.js:60`, `files.js:66`, `files.js:70`, `files.js:71`, `files.js:108`
**Files A's draft offers the wrong approval.**
Evidence: A07 "Approve this import" is the draft's primary with 3 of 5 groups selected, and it leads to A08's sheet, "Approve these 3 groups". `files.js:209` says A07 "takes in all 5 groups, once the 2 left out are settled", so it should not be live at all yet. The inventory records A07 and A08 as different hashes. The a-approve expired state also offers A07 for a 3-group approval. a-draft's partial has no approve control, while `files.js:167` says "2 groups could be approved now" and Holdings allows it.
Correction: use A08 on a-draft wherever a subset is selected, and in the expired and conflict states. Add A08 to partial for 2 groups, 6 of 11 rows. Show A07 only once every group is settled.

### R1-f13 · P2 · blocking · `files.js:70`, `files.js:95-100`, `files.js:115`
**The £12.40 difference is invisible when approving.**
Evidence: `a-fix` in Ready lists "This statement, cash £12.40" as open, so the Ready path carries it. Ready a-draft and a-approve never mention it, and no state of the approve sheet does. Conflicting a-draft shows it, then sends the owner to a sheet that says nothing. `holdings.js:263` warns on the sheet: "A £12.40 cash difference stays open. Approving does not clear it." PH01-S13 requires errors in the preview. Lessons 27 and 31.
Correction: add the Holdings banner to `approveOf`'s default sheet and to a-draft Ready, with the same words. Keep `holdings.js:198`'s three ways on Conflicting a-draft.

### R1-f14 · P2 · blocking · `files.js:135`, `audit.js:54`, `audit.js:252`
**Audit's worked source does not exist in Files.**
Evidence: Audit's "Open in Files" and "Open the source in Files" go to "ISA statement, September", `src_1e08`, R-0210, a PDF committed 6 Oct (`holdings.js:219`). The six originals have no such file. "Broker statement, Sep 2026" is another: `privacy.js:450` gives it 2 ledger events, imported 3 Oct. "Apple screenshot", R-0204, is missing too. The open-questions list covers only the October file (`shell.js:305`). "6 originals" appears on Home, the queue and the rail.
Correction: add "ISA statement, September" (PDF, kept to Oct 2028) and the Apple screenshot to `ORIG`, and update the count everywhere: `home.js` `PLACE_LINE`, `qKept`, `qRail`, `origList`.

### R1-f15 · P2 · blocking · `files.js:137-152`
**Files never shows a deleted original with its tombstone.**
Evidence: PH01-S05 lists "Deleted, with tombstone" as a state and says evidence joins "show the source as deleted". a-keep draws deleting, partly failed and restored-awaiting-tombstone, and never the outcome. `holdings.js:307` has "ISA statement, January 2024", "Original deleted", and `privacy.js` has "Already deleted". Files has no row for it, though the negative criterion rests on a recorded tombstone.
Correction: add the deleted row to `origList` with its tombstone reference and "its ledger event stays, evidence unavailable", in every state that lists originals.

### R1-f16 · P2 · blocking · `files.js:50`, `files.js:220`
**The cost promise has no destination.**
Evidence: "The amount sits in Costs and budgets" has no link, and `costs.js` has no import or statement line (search: only reservations for runs and the top-5 scan). PH01-S02: import activity appears in the main cost view "linked by import id". The coverage matrix gives `a-draft` for "Reconcile cost", where no amount or reconciliation is drawn. Lesson 28. Join to lane a.
Correction: add an extraction line to Costs linked by import, and "Open in Costs and budgets" on `costBox`. If the amount stays out of Files, say so in the matrix cell.

## Non-blocking

### R1-f17 · P2 · non-blocking · `files.js:32`, `files.js:38`, `files.js:182`
Refused uploads appear only in the queue's Failed state, so a failure to refresh is the only time a rejected file's reason shows. PH01-S06 wants a visible reason. The rail still says Held apart 1 while the oversized file is also "Held apart". Correction: add a "Not taken in" section to Ready `qAll`, and count the held file.

### R1-f18 · P3 · non-blocking · `files.js:103-108`, `files.js:114`
Approval times come from the owner journeys' evening clock, on admin's 11:40 clock (lesson 26). a-approve error shows "Records failed 11:38" beside "Expires 21:33" with a live retry: as last night's approval it is expired, and FIN-AC-13 refuses it; as tonight's it has not happened. Correction: re-time these to admin's clock, or label the frame as the later moment, as `a-fix`'s note does.

### R1-f19 · P3 · non-blocking · `home.js:24`, `home.js:30`, `audit.js:221`
Page text still reads as before the picks. Home's summary says "what needs you first, then the nine places", which describes rejected A. The note that the Approvals promise "lands here" sits only on unpicked screens, and names two different destinations. Correction: rewrite the summary, and move one note to `b-explore`, because owner `approvals.js:450` promises "search across all of them".

### R1-f20 · P3 · non-blocking · `audit.js:168-169`, `audit.js:86`
Status words claim more than they know (lesson 39). "Correction: None recorded" carries "Not yet", which implies one is coming. "Dependencies: Later events on these rows · resolved" names none, against option A's "no later change". The pane heading does not name its record, and on desktop the selected row is cut off at the bottom of the first view, with the pane 1,192 px down on iPhone. Correction: use "None" and name the count; title the pane "Lineage of R-0210".

### R1-f21 · P3 · non-blocking · `audit.js:151`
"Audit only reads", yet `b-gaps` draws A15 "Record it in Files", the write act, with its proposed chip. The sentence above calls it opening the file. Correction: use a plain `inFiles()` link there, and drop `audit` from A15's journeys.

### R1-f22 · P3 · non-blocking · `files.js:140`; `permissions.json` A19
A19 Download is live on a phone. `decision.md`'s list of live acts does not name it, unless "Reading" covers saving the whole ledger export to a phone. Correction: ask the owner, as `decision.md` already marks that line the maker's reading. Join to lane s.

### R1-f23 · P3 · non-blocking · `home.js:16`
"Admin sits under Settings" has no door drawn. The owner journeys have no Settings row into admin, and the only mention is `approvals.js:450`, with no link. `decision.md` keeps the owner journeys unchanged. Correction: record it as a follow-up on the Settings design, so MP-66 does not approve a section with no way in.

### R1-f24 · P3 · non-blocking · `docs/design/admin/src/journeys/audit.css:7`
`design-sync.md` says a new value or component goes into Prism first. `.aaudit-id` hard-codes a monospace stack where Prism has `--font-mono`, and differs from it. `.aaudit-chain` and `.afiles-steps` rebuild the numbered steps Prism already has as `.steps`. Correction: use the token, and promote or reuse the steps pattern.

## Checked and clean

- Arithmetic holds and matches Holdings: cash 4,012.60 → 4,142.83, the correction to 3,927.63, revision 5 at 3,070.82, the £12.40 difference, the 11 rows, the 42-minute link, the 24-month dates, the ledger revisions 210 to 214 and the rebuild's 4,200 units.
- Home's figures match the other journeys: 4 decisions, HSBC detected Tue 16:50, £46.42 on day 18, settings v9, catalogue v14, 7 routes and 5 workers, run Tue 21:15, restore Sun 1 Nov.
- `RECORD` matches AuditEvidence, retention figures match PH01-S04 and PH02-S13, `digest_only` matches the schema, and no amount appears in Audit.
- Audit's recorded changes match owner `approvals.js:199-203`, and "stays open at every cost threshold" has its source in MP-103.
- Every Files screen carries the no-trade line (lesson 33). Terraform as the home of lifecycle rules is supported by PH02-S14.
- Unpicked options: nothing crossed a rule in `AGENTS.md`.

## Notes on running this review

- The brief's playwright path misspells the folder: it is `/Users/arundutta/projects/mypaisa-agent/...`, not `mypaisaa-agent`.
- The scratch `full/` folder already held the maker's files. I saw their names in a listing and read none. My own five scratch files landed there briefly. Birth times show none replaced an existing file, and I moved them to the sibling `r1-f/` folder.
- Copy to the clipboard was not pressed, and Compare and pick was not exercised: it is lane s's.
