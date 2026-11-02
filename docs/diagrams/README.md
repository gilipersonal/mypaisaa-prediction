# Diagrams

Two Lucid packs live here. Each folder holds the script that writes the Lucid import, the PNG exports and a
`manifest.json`. The Lucid document id, version and export hashes are in the manifest. The exports are manual
snapshots: a change made in Lucid reaches the repo only when it is exported again.

| Pack | What it shows | Folder | Manifest |
| --- | --- | --- | --- |
| Architecture and design (MP-34) | Nine pages: the system on AWS, who may do what, the forecast pipeline, Claude routes and batching, importing a statement, identity and step-up, environments and delivery, records, and the road | [`mp-architecture-2026-11-02/`](mp-architecture-2026-11-02/) | [manifest](mp-architecture-2026-11-02/manifest.json) |
| Stack, quality, security and testing (MP-36) | Six drawings, one Lucid document each: the stack end to end, one trace from the door to the model, from a merge to prod, Apple testing and the private beta, the perimeter and the optional lockdown, and web quality on every screen. PROPOSED | [`mp-quality-2026-11-02/`](mp-quality-2026-11-02/) | [manifest](mp-quality-2026-11-02/manifest.json) |

Nothing drawn here is deployed. [ARCHITECTURE.md](../../ARCHITECTURE.md) explains the views, and the
animations are built in [`docs/motion/`](../motion/README.md).

The earlier Codex diagrams, animations and their generator, and the two-page MP-31 pack this one replaces, were removed in MP-34; they remain in git history.
