# Mypaisaa Prediction Site

Private static product-preview site for the Mypaisaa Prediction concept.

The original concept entry point is `dist/index.html`. The owner-approved cinematic architecture surface is at `dist/architecture/index.html`, served at `/architecture/`. The original preview and Site identity are preserved.

The atlas is a static React presentation using Motion (Framer Motion) and a lazy-loaded, captioned 72-second Remotion Player. It does not implement the planned SvelteKit investment app. Native Lucid system/network PNGs and source hashes accompany the presentation. All libraries/fonts are bundled locally. It uses no live market data, model calls, credentials or tracking.

Run `npm ci`, `npm run build` and `npm run check` from `site/`. The build only replaces `dist/architecture/`, preserving the original concept preview. Sources are in `architecture/`; built output remains tracked for the Sites static workflow. The approved Site audience remains owner-private. The separate source checkout used by Sites is reconciled from this directory for packaging; GitHub is the project source of record.

Motion starts off, responds to the system reduced-motion preference and can be paused globally. The optional Remotion player never autoplays and has a complete transcript. Story/technical views, a seven-step journey, a component/interface explorer, evidence scenarios, network options and native diagrams explain planned behaviour. Source-document pending labels describe historical preparation; the MP-15 sync completion record captures actual document publication.
