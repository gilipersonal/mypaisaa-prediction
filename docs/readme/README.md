# README badges and checks

The mark moved to [`docs/brand/`](../brand/README.md) and the animations to [`docs/motion/`](../motion/README.md)
(MP-31). This folder keeps two things.

## Badges

The badges in [`badges/`](badges/) are vendored [Shields](https://shields.io/badges/static-badge) snapshots: 20 px
high, flat, with the brand logo embedded, so the README fetches nothing from a remote service. The CI badge names
the checks rather than reporting a live status. [`shields-badges.json`](shields-badges.json) records each badge's
source URL and SHA-256.

## The documentation check

```bash
python3 docs/readme/check_readme.py
```

It runs offline with the standard library and fails on:

- a broken local link or anchor in `README.md`, `ARCHITECTURE.md` or `TECH-STACK.md`;
- a README logo `<picture>` without its reduced-motion and dark-mode fallbacks in the right order;
- an SVG in `docs/brand/` or here that has no title, a script, an event handler or an external resource;
- an animated mark that ignores `prefers-reduced-motion`, or a static mark that animates;
- a GIF in `docs/motion/` with a single frame, no still PNG beside it, or more than 3 MB;
- a vendored badge whose hash no longer matches its record.
