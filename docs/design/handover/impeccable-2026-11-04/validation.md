# Validation record

Date: 4 November 2026. Baseline: `bf2ed3033cc5b8a320118e66b2b1dc8678366740`.
Scope: documentation-only audit; no prototype or application source edits.

## Completed checks

| Check | Result | Evidence |
| --- | --- | --- |
| Impeccable context, `--target docs/design` | Existing system; no PRODUCT.md/DESIGN.md/surface brief | Report method section records the context findings |
| `python3 scripts/design_tokens.py check` | PASS: 77 tokens, 98 measurements; CSS/Swift current | [static-checks.log](evidence/static-checks.log) |
| `python3 scripts/design_gates.py check` | PASS: current Prism/owner/admin pages and historical hybrids covered by the script | [static-checks.log](evidence/static-checks.log) |
| `python3 docs/design/journeys/build.py --check` | PASS | [static-checks.log](evidence/static-checks.log) |
| `python3 docs/design/admin/build.py --check` | PASS | [static-checks.log](evidence/static-checks.log) |
| `perl -e 'alarm shift; exec @ARGV' 580 node scripts/design_journeys_check.mjs docs/design/journeys/index.html` | PASS: 1,152 combinations, 1,176 flips, 0 reported problems | [owner-matrix.log](evidence/owner-matrix.log) |
| Same matrix command for `docs/design/admin/index.html` | PASS: 1,600 combinations, 0 flips, 0 reported problems | [admin-matrix.log](evidence/admin-matrix.log) |
| Impeccable `detect --json docs/design/prism/index.html docs/design/journeys docs/design/admin` | Completed, exit 2: 114 warnings; not a clean detector pass | [detector JSON](evidence/impeccable-detector.json) |
| `perl -e 'alarm shift; exec @ARGV' 300 node scripts/design_runtime.mjs docs/design/prism/index.html --out /tmp/mp-impeccable-audit/runtime.json` | FAIL overall, exit 1: seven cases pass; Chrome/dark/1440 has one 50.7ms long animation frame above 50ms | [runtime log](evidence/runtime.log), [runtime JSON](evidence/runtime.json) |

The runtime sweep covers Chrome and WebKit, light/dark, 390/1440px. Chrome is throttled fourfold by this script. Each configuration passes its text-contrast checks; reported worst simulated-dim ratios are 3.00:1 light and 3.03:1 dark. The Chrome frame-pass percentages are 96.0–99.0%; WebKit 96.0–99.2%. WebKit cannot measure LoAF/CLS in this harness: those fields are unmeasured, not zero.

## Targeted performance repeat

A single repeat of the failed configuration was selected because a 0.7ms excess may be sensitive to scheduling. The original failure is retained and is not overwritten by a successful repeat.

Command:

```sh
perl -e 'alarm shift; exec @ARGV' 90 node scripts/design_runtime.mjs docs/design/prism/index.html --engine chrome --theme dark --width 1440 --out /tmp/mp-impeccable-audit/runtime-repeat.json
```

**Repeat passed (exit 0).** Exact output:

```text
ok   docs/design/prism/index.html chrome dark 1440px: texts 3585, worst 3.03:1 at 20%, frames 97.5% ok (p95 16.8 ms), LoAF 0, CLS 0, tapped 12
```

Evidence: [repeat log](evidence/runtime-repeat.log), [repeat JSON](evidence/runtime-repeat.json). The original over-budget frame did not reproduce in this one repeat. Treat smoothness as a narrow measured pass with a retained intermittent warning, not proof of all-device performance.

## Evidence boundaries

The journey checker runs Chrome with reduced motion for its matrix and a limited normal-motion flip check. It walks defined journey/option/surface/state/theme combinations, not every task transition, native screen or arbitrary viewport. A passing combination can contain multiple screens. The count must not be described as that many independently usability-tested screens.

The interactive browser host was unavailable. No screenshots were visually inspected during this run, no overlay was injected and no physical-device, touch gesture, VoiceOver or native SwiftUI validation is claimed. Existing test scripts launch and close their own test browsers; no audit web server was started.

The following were not run: independent review, real fixed-findings regression ledger (including `design_journeys_facts.mjs --all`), standalone regression operations, plan sync, publishing/sync to Claude artifacts or Sites, backend/application/native tests. Those would either require separate approval or would not validate the changed documentation. No production or paid provider call was made.

## Reproducibility and report checks

[source-manifest.json](evidence/source-manifest.json) records SHA-256 hashes for 76 design/source/check files so Claude can establish whether a finding still refers to the same bytes. Historical local evidence remains historical; the current-turn logs above are the fresh checks.

The final report check verifies local Markdown file destinations, the 14 unique finding IDs and severity counts, JSON validity, unchanged source hashes, and whitespace. Results are recorded in [report-check.json](evidence/report-check.json). It checks report consistency, not the substantive correctness of each recommendation.

The report's 11/20 audit score is a provisional author judgement, not an automated or independent reviewer score. The five P1 items include explicit decision and validation gaps. Only source-confirmed findings and actual test output should be treated as observed evidence; touch/focus/reflow risks without interactive verification remain hypotheses or untested contracts as labelled.
