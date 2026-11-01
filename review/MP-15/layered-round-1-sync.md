# Layered planning/sync pack - round 1 sync lane

Reviewer: `/root/mp_sync_review_r1`, fresh and read-only.
Snapshot: `snapshots/round-4/manifest.json`.

**One P2 blocker and one P3 documentation gap.**

**LAYERED-R1-01 (P2): unsafe Confluence notice retries.** `confluence-publish-payloads.json:559` defines six existing-hub updates as unconditional prepends, and preflight at line 696 has no owned markers or identical-content no-op. A successful publish with an ambiguous response can therefore be repeated, duplicating notices; a later corrected retry cannot identify its owned range. Give each block stable begin/end identifiers; absent means insert, one valid pair means replace/no-op, ambiguous means stop. Reread the full current draft after ambiguous outcomes. Add synthetic composition tests proving repeat application is unchanged and surrounding rich markup preserved.

**LAYERED-R1-02 (P3): missing hub evidence footers.** `confluence-page-map.md:65` promises source/revision/hash, decisions, actual review status and phase/story evidence on every update block, but the six insertions lack that footer. Add the required bounded provenance to each and refresh metadata before application.

Otherwise, ten phases/separate dependency DAGs, 48+16 draft stories, null keys, honest 41/19/140 coverage, DEC-041, approval boundaries, MP parents/attachments, Jira description-only scope and rich-preservation safeguards align.

Limits: file inspection only; no external refresh/write or regression runner. Actual connector roundtrip and fresh versions/tokens remain required at apply time.
