# MyPrediction design system: options round 1 (MP-62)

**3 November 2026 · MP-62 (PH00-S05) · Options for the owner to choose · Not approved UX · No build**

## The request, in the owner's words

> "I want you to draw inspiration and come up with best design system, this will be used for web, desktop, mobile as
> a PWA and then as iOS/iPadOS too. I need best looking UI/UX experience which looks really professional trading app
> like with finances. Light and Dark mode. Use all the design skills you have to the best use."
>
> "I need a hybrid with Apple + Monzo... and it has look original and eye catching Design System"

References the owner gave: Apple's Human Interface Guidelines; the Figma "Monzo App Concept (Community)"; the Figma
"Monzo Free UI Kit, by Marvilo (Community)". Inspiration only: no Monzo brand, logo, coral, fonts, illustrations or
copy is reused, and nothing from the community files is copied (licence and brand rights are unverified).

## What to take from each reference

- **Apple (HIG):** clear hierarchy, large titles, a tab bar on iPhone and a sidebar on iPad and desktop, grouped lists,
  sheets for confirmation, 44-point targets, Dynamic Type, semantic colours that adapt to light and dark, materials
  (translucency) only in the control layers (bars, sheets), never under financial figures.
- **Monzo:** modular, friendly and bold: big confident amounts with smaller pence, generously rounded cards, colourful
  pots and tiles used as a system, plain list rows with round logos, heavy display type, warm tone, purposeful motion,
  semantic tokens and reusable content blocks composed the same way everywhere.
- **Professional trading:** dense, scannable figures with tabular numerals, clear up/down that never relies on colour
  alone, charts with labelled values, provider and freshness always visible, a multi-pane desktop.

## Three options, each an Apple + Monzo hybrid with its own original signature

| Option | Signature | Light and dark |
| --- | --- | --- |
| **A · Fan (Recommended)** | Built from MP's own mark: the forecast fan becomes the system's recurring motif (range ribbons on every forecast, fan-shaped horizon selector). Ink navy and warm paper with saffron for forecasts and mint for scored outcomes. Monzo's bold rounded modules on Apple's structure. | Paper light; deep ink dark |
| **B · Prism** | Apple's translucent materials over vivid, original colour fields: each market segment gets its own luminous tile colour (Monzo's colourful pots, reimagined as segment tiles). Glass bars and sheets, saturated but disciplined. | Bright frosted light; luminous dark |
| **C · Signal** | Monzo website boldness meets Apple precision: oversized typographic numerals, high-contrast monochrome with one electric accent, editorial layout on desktop, a pro-trading density. | Crisp white light; true-black OLED dark |

Option A is recommended: it is the only one whose look comes from what MP is (show the uncertainty, score every
forecast), so the identity and the product's promise are the same thing; it costs some of B's spectacle.

## Every option delivers the same things, so they compare like for like

One self-contained HTML page per option, `docs/design/reviews/MP-62/option-<a|b|c>/index.html`, with a light/dark toggle
that follows the system by default:

1. **Foundations:** colour tokens (semantic names, light and dark values, contrast ratios against their real
   background), type scale (web and its SwiftUI text style), numerals (tabular), spacing (4-point), radii, elevation,
   materials, iconography, motion (durations, easing, reduced-motion behaviour).
2. **Components**, each with its states: buttons, segmented control and horizon selector, chips (status labels:
   Proposed, Owner-selected, Implemented; freshness and provider status), holding row, top-5 card, forecast range
   (the 50% and 80% bands, median, as-of, horizon), price chart with forecast and scored outcome, ranked-action badge
   (add, hold, pause, trim, rebalance: decision support), approval sheet, toast, tab bar, sidebar, search, empty,
   loading (skeleton that still shows freshness), stale, partial, error, offline, no model, abstaining, disagreement.
3. **Screens**, light and dark: iPhone home (holdings first, the top 5 per segment below); iPhone instrument detail
   (forecast for a chosen horizon with its proof: calibration, track record, model version); iPad split view
   (holdings list and detail); desktop web dashboard (multi-pane); PWA at 390 px.
4. **Mapping:** each token and component named once, with its CSS custom property and its SwiftUI equivalent, so web
   and Apple build from one system.

## Product rules that hold in every option

- MP cannot trade: no buy, sell or order control anywhere, and no copy that reads as personalised advice. Ranked
  actions are decision support with reasons and uncertainty.
- A forecast is never a bare number: horizon, as-of time, data cutoff, range or probability, calibration and track
  record, model version one tap away.
- Historical data, evaluated forecasts and conditional scenarios (3 to 5 years, no likelihood) look different.
- Freshness and provider status are always visible; stale and partial data is labelled; nothing hides behind a
  spinner.
- Long-term investing is the product: the 3, 6 and 12-month horizons lead; 1 to 20 sessions are short-term and
  labelled so.
- Holdings first on the home screen, then the top 5 per segment: US large caps, US tech (Nasdaq-100 technology
  names), India Nifty 50, India midcap, ETFs as three lists (US, UK, India), gold and silver.
- WCAG 2.2 AA: contrast measured on the real background, visible focus, colour never the only signal, every chart
  with labelled values and a text alternative, reduced motion respected, layouts by width not device name, no
  horizontal scroll at 390 px.
- Every figure is illustrative and labelled so. Use the real instrument identities in
  `fixtures/synthetic/instruments.json` with the shared example figures below; never real holdings.

## Shared illustrative figures (use these exactly, so the options compare)

Portfolio value £84,612.40, up £1,236.18 (1.48%) today; as of 21:15 London, data cutoff 21:00, provider Twelve Data
(fresh), Yahoo (fresh, UK and India intraday).

| Holding | Venue | Value (GBP) | Today | 6-month forecast, median (80% range) | Action (decision support) |
| --- | --- | ---: | ---: | --- | --- |
| Apple (AAPL) | XNAS | £14,820.50 | +1.9% | +6.2% (-9.8% to +21.4%) | Hold |
| NVIDIA (NVDA) | XNAS | £11,402.10 | +3.4% | +9.1% (-18.5% to +34.0%) | Trim |
| SPDR S&P 500 ETF Trust (SPY) | ARCX | £18,960.00 | +0.8% | +4.3% (-7.1% to +15.2%) | Add |
| AstraZeneca (AZN) | XLON | £9,215.75 | -0.6% | +3.0% (-8.4% to +13.9%) | Hold |
| HSBC (HSBA) | XLON | £6,104.20 | +0.3% | +2.1% (-10.2% to +12.6%) | Pause (late: last price 14:10, before the 16:35 UK close) |
| Reliance (RELIANCE) | XNSE | £8,940.30 | +1.1% | +7.4% (-12.0% to +24.9%) | Add |
| Nippon India Nifty 50 BeES (NIFTYBEES) | XNSE | £15,169.55 | +0.5% | +5.0% (-6.9% to +16.2%) | Hold |

Top 5, US tech: MSFT 74, NVDA 71, AAPL 68, AMZN 66, (fifth withheld: no other eligible listing). Top 5, India Nifty 50:
ICICIBANK 72, HDFCBANK 69, TCS 66, INFY 64, SBIN 61. Score = growth 35% + protection 40% + opportunity 25%, shown only
when all three are eligible. Calibration for the 6-month task: 80% ranges held 79% of the time over 52 scored
forecasts; model R2-HGB v3, approved 1 Oct 2026. Gold XAU/USD: forecast unavailable (valuation convention open,
SCI-D08) — show that state.

## How the round is shown

Local first (`docs/design/reviews/MP-62/`), then each option synced to its own private Claude artifact and recorded in
`docs/design/artifacts.json` (`.claude/rules/design-sync.md`). The owner picks one; the pick, in the owner's words, goes
in `decision.md` here and becomes the spec. Nothing is built.
