# Designs: made locally, synced to Claude HTML artifacts (MP)

Owner instruction, 3 November 2026: "all designs will be sync with local and claude artifact. Designs will be created
locally using skills and tools and synced to Claude Html artifact." This replaces the earlier rule that MP designs
publish to ChatGPT Sites. The `site/` folder and its Sites identity stay as they are (`AGENTS.md`), but new designs do
not go there.

## What counts as a design

Every MP visual design:
- UX boards and options rounds (`.claude/skills/mp-design-first/SKILL.md`);
- design explainers such as the MyPrediction Market Agent (MP-37);
- design-system pages, chart and card mock-ups, and flow drawings made as HTML.

Confluence pages (`docs/confluence/build_pages.py`), Lucid drawings and the motion GIFs keep their own pipelines.

## The rule

1. **The repo is the source.** Each design is an HTML file in the repo, under `docs/design/<slug>/` or the folder its
   issue names (the Market Agent lives in `docs/market-agent/`). It is written locally with the design skills and tools:
   `mp-design-first`, `artifact-design`, `impeccable`, `ui-ux-pro-max` and the `design:` skills. Previews come from the
   built-in browser or a local server.
2. **Every design is synced to a Claude HTML artifact.** It is published with the Artifact tool from that repo file:
   one artifact per design, private by default, and republished to the same URL every time. Don't create a new
   artifact for a new version.
3. **Sync runs one way, repo to artifact.** Never edit the artifact by hand. If the artifact changed elsewhere (the
   owner edited it in place, or a comment asks for a change), read it back with the Artifact tool, merge the change
   into the repo file, then republish.
4. **The manifest records each sync.** `docs/design/artifacts.json` holds one entry per design: slug, source path,
   artifact URL, the sha256 of the file last published, the date and the Jira key. After every publish, record it:
   `python3 scripts/design_sync.py record <slug> <source> <artifact-url> <MP-key>`.
5. **The gate.** `python3 scripts/design_sync.py check` fails when a recorded source file is missing, and flags
   PENDING when it differs from what was last published. A design is in sync only when its file matches its record.
   Run it before every PR that touches a design; `scripts/review_checks.py` selects it for design paths, and CI's
   Docs job runs it on every PR.

## What still needs the owner

- MP's order still holds for product UX: architecture sign-off, then the full UX design, then UX approval, then
  permission to build (`mp-design-first`). Explainers and architecture design pages can be made now.
- Syncing a design the owner asked for needs no extra yes. A public or shared link, or any publication outside the
  owner's private artifacts (Confluence, Sites, social), needs its own yes.
- An artifact that someone else owns is never overwritten. Publish MP's own copy instead, as MP-37 did with MA's
  Market Agent.
