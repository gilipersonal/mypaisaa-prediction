# README artwork

Local documentation artwork for the repository guide. The MA README supplies the
structural reference: a recognisable opening, coloured stack badges, contents,
architecture, model/evaluation responsibilities and practical development links.
The assets here are original MP documentation drawings, not imported MA artwork
or an approved application brand/design system.

Run `python3 docs/readme/generate_assets.py` from the repository root to reproduce
all SVGs without a provider, paid API, external font or network request. The navy,
coral, teal, amber and purple accents identify documentation topics; text carries
the meaning independently of colour. Badges describe selected direction and
navigation, not live health or deployment.

Run `python3 docs/readme/check_readme.py` to verify the actual root README's local
paths, contents anchors and SVG structure without network or extra dependencies.
The same check is included in the existing Codex tooling CI job.

`mark.svg` and `mark-dark.svg` animate one line reveal once over 1.6 seconds.
Reduced-motion media settings disable it where the SVG renderer supports them.
`mark-static.svg` and `mark-static-dark.svg` are motion-free alternatives. The
compass, evidence points and band are illustration, not observed market data.

AWS/system architecture remains in the existing native Lucid source and its dated
exports. This artwork does not create a new architecture drawing, change the
Site or select product UX. No model IDs, account names or example figures were
copied from MA.
