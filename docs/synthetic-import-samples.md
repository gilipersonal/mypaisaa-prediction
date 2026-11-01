# Synthetic import documents and operational scenarios

The owner has deferred actual holdings and real screenshots/PDFs until later. Use the existing realistic-behaviour synthetic market/ledger packs and these companion files for local/dev requirements, import design and testing. This is an explicitly authorised fixture task, not permission to build the application or load AWS.

## Files prepared on this Mac

- `data/synthetic-v1/local/` and `data/synthetic-v1/dev/`: the existing verified 30-instrument US/UK/India market, portfolio, ledger, forecast and outcome packs. Their files were preserved.
- `data/synthetic-imports-v1/local/` and `data/synthetic-imports-v1/dev/`: new companion packs, each containing a three-page `portfolio-statements.pdf`, three `statement-<page>.png` screenshots, `expected-imports.json`, `operations-scenarios.json` and a hashed manifest.
- `data/synthetic-imports-v1/index.html`: local navigation to the sample files and existing market-data overview.

All generated data remains Git-ignored under `data/`. Real ticker/venue IDs come from the existing catalogue. Prices, account identities, transactions, costs and events are synthetic; neither the Nasdaq ETF example nor any other sample resolves the owner's actual holdings.

## Document contracts

Each PDF has a US/USD, UK/GBP and India/INR page with a synthetic account ID, data timestamp, real instrument identifiers, quantities, currency-unit prices, values, cash and total account value. UK GBX observations are represented as GBP financial values consistently with the source ledger. Each page shows the last six ledger events only and expressly identifies that extract as incomplete history. It cannot establish an XIRR without the missing cash flows.

The PNGs are clean raster renders of those pages. They provide screenshot-shaped inputs, not proof of performance on cropped, blurred, rotated or photographed statements. The generic layouts are not branded broker documents and do not establish real-institution support. CSV/JSON ledger samples already exist in the original packs; Excel-layout, damaged-document and broader parser/security cases remain later work.

`expected-imports.json` supplies the expected fields and PDF-page/screenshot references for a future parser or manual-review test. It preserves original source values and identifiers, synthetic labels, environment and partial-history status. No import parser, scanner, ledger loader or UI is implemented by this fixture tool.

## Operational/cost fixtures

Per-environment examples include simulated agent token usage and gross estimated costs, covered credit, unknown credit, the approved £60/£75/£85 cash states, stale billing, rejected uploads and duplicate uploads. Token prices are explicitly illustrative fixture assumptions, not current provider prices. These cases do not verify real credit, billing or application spending controls. Each scenario is independent rather than a single reconcilable monthly invoice.

## Reproduce and validate

The standalone generator pins `reportlab==4.4.9`, `pypdf==6.10.0` and `Pillow==12.3.0`; `pdftoppm` must be available. It uses no AWS, financial-data or Claude clients. Both an existing output directory and a production/cross-environment source are refused. It reads only the synthetic pack, never `data/private/`.

```sh
# After generating/validating the original source packs, choose a NEW output root:
uv run scripts/synthetic_import_samples.py --environment both \
  --output-root data/synthetic-imports-v2

uv run --no-project --with reportlab==4.4.9 --with pypdf==6.10.0 \
  --with Pillow==12.3.0 python -m unittest discover -s tests \
  -p test_synthetic_import_samples.py -v
```

The seven isolated tests build their own small labelled source fixtures using real catalogue identifiers, so they do not require the Git-ignored generated data. They check PDF/source values and totals, GBP/GBX treatment, PNGs and hashes, preservation of an existing directory, source tampering, production/cross-environment refusal, and explicitly synthetic cost/unknown-credit semantics. The existing full market packs are also validated separately. PDF bytes can change between runs because of document metadata; each manifest records the actual output hashes and source/generator hashes.

All six final pages were rendered and visually inspected. These are fixture checks and maker verification, not independent review or evidence of predictive accuracy. No AWS resources were created or seeded, and no paid data/model calls were made.

## Later actual samples

The owner can progressively provide actual PDF/screenshot samples later. Keep them separate from synthetic fixtures, retain originals privately with the agreed owner controls, and treat embedded document instructions as untrusted data. Confirm instrument identity, extraction provenance, supported layouts and preview/reconciliation before any real ledger commit. Source rights and full-scope pricing still need verification before live data is activated; they do not block synthetic local/dev work.
