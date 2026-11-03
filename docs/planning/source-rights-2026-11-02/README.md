# Source rights, data tiers and the cost fit (MP-10)

Research for Jira MP-10, checked on 2 November 2026 from primary sources only: providers' pricing pages, terms of
service, support articles and robots.txt, plus exchange and AMFI pages. Nothing was bought, no trial was started, no
vendor was contacted and no paid API was called. Money is at £0.80 to the dollar and 20% tax, and cash counts in the
month an invoice is due (COST-04, COST-06). The Region, account and network findings for MP-29 come from the same
research. They are summarised here and taken forward on their own branch.

**Status: findings, then the owner's answers** (below). ARC-01 is confirmed. Every live use in
`data/catalogue.json` stays `unknown`: no vendor has confirmed it in writing, and the owner has chosen not to ask.

## The headline

**On published terms, ARC-01's mix does not give MP the rights it needs.**

| Source | What the published terms say | Effect on MP |
| --- | --- | --- |
| Yahoo Finance | The Terms of Service (updated 1 Nov 2026) forbid collecting data "using any automated means" without express permission (s2(d)(ix)). `query1` and `query2.finance.yahoo.com` disallow every path in robots.txt. The only product an individual can buy, Gold at $479.40 a year, gives manual CSV downloads for offline use, with no storage or training grant. | Every one of DATA-02's six uses is forbidden for automated collection. The adapter stays disabled, as MP-10's acceptance criteria require. |
| Twelve Data Grow | The pricing page labels Grow as view-only: its data "cannot be programmatically processed, stored, transformed, or redistributed". The Terms of Use (1 Jan 2026) allow internal storage only as far as the tier permits. Ultra 2,584, at $329 a month (£315.84), is the cheapest individual plan labelled for programmatic, non-display use. | Storage, model training and automated monitoring are forbidden on Grow as labelled. Ultra breaks the ceiling on its own. |

Twelve Data Grow is still the closest fit on coverage. It has US, LSE, NSE and BSE end-of-day data, splits and
dividends, and real-time FX. The rights question is a vendor answer, not a coverage gap, so the first step is a
written question to Twelve Data (below). It needs the owner's yes before it is sent.

## Twelve Data, as published

| Plan | Credits a minute | Monthly | Yearly, per month (paid in advance) | £ a month |
| --- | --- | --- | --- | --- |
| Basic | 8 (800 a day) | $0 | n/a | 0, for development and testing only |
| Grow | 55 / 144 / 377 | $29 / $49 / $79 | $24 / $41 / $66 | 27.84 / 47.04 / 75.84 |
| Pro | 610 / 987 / 1,597 | $99 / $149 / $229 | $82 / $124 / $191 | 95.04 / 143.04 / 219.84 |
| Ultra | 2,584 and up | $329 and up | $274 and up | 315.84 and up |

- **Grow 55 at $29 is now on the official pricing page**, as the 55-credit choice in the Grow dropdown. COST-04 no
  longer rests on the support article alone, and the 144-credit price ($49) is now known. The default card shows $79
  because 377 credits is preselected.
- **Coverage on Grow:** US real-time with daily history from 1980. LSE, NSE and BSE at end of day, with history depth
  not stated. LSE prices come in GBp, so MP reads the unit per listing (DATA-04). Fund NAVs need Pro or Ultra: the
  public pages contradict each other.
- **Credit weights:** daily bars, EOD, quotes and FX cost 1 credit per symbol. Dividends and splits cost 20 per
  symbol and need Grow. `/last_change` costs 1 per request. A design that checks only changed listings uses about
  1,500 to 2,000 credits a month for 20 to 30 listings, far inside Grow 55. **DATA-07 needs correcting:** it counts
  action checks at 1 credit each and assumes Basic can make them.
- **Its NSE page lists trading days as Sunday to Thursday, which is wrong.** MP's own calendars stay the authority
  (DATA-06).

Detail, sources and the per-use table are in [evidence/twelvedata.json](evidence/twelvedata.json).

## Lawful alternatives for the gaps

| Gap | First choice | Second choice | Note |
| --- | --- | --- | --- |
| A rights-clean daily source for LSE (and NSE/BSE if confirmed) | EODHD personal plan, £19.99 a month: the clearest storage grant found for private use; UK funds by ISIN | Alpha Vantage: the clearest personal research grant; free at 25 calls a day, $49.99 premium; BSE but not NSE | Neither names AI providers; sending data to Anthropic needs a written answer |
| India mutual fund NAVs | AMFI's official files, **with AMFI's written permission**: its terms forbid storing "any significant portion" | The owner's own consolidated account statements (CAS), for funds already held | Mirrors of AMFI data inherit AMFI's terms |
| UK fund NAVs | EODHD's EUFUND listings | Twelve Data Pro (over budget) | No central official UK NAV source; each fund manager publishes its own |
| NSE and BSE exchange files | Not used | n/a | NSE forbids automated collection and "simulation" use; BSE forbids reproduction and transmission |

**Not suitable:**
- Financial Modeling Prep forbids storage and any tool third parties can reach.
- Tiingo and Massive cover the US (and China) only.
- Marketstack's coverage of these exchanges is unconfirmed.
- Stooq's terms could not be read.

**The only rule found that names AI is Nasdaq's Data AI Policy** (v1.0, 5 Feb 2025). It applies to Nasdaq data
whatever the vendor: models trained on it "may be fee-liable", and using a third-party AI tool needs a licence.

Detail and sources: [evidence/yahoo-and-alternatives.json](evidence/yahoo-and-alternatives.json).

## The cost fit, month by month

[cost_months.py](cost_months.py) reads the foundation pack's `costs/model.json` read-only, adds the lines MP-36 found
missing, and writes [evidence/cost-months.json](evidence/cost-months.json): 504 combinations over 12 months.

| Choices (Virginia, Basic in dev, no Apple fee) | Month 1 (domain renews) | Months 2 to 12 | Result |
| --- | ---: | ---: | --- |
| Grow 55, Claude blocked | £61.84 (.com) or £55.12 (.uk) | £46.48 | Under £70 every month |
| Grow 55, Claude option A at ARC-06b volume | £70.09 (.com) or £63.37 (.uk) | £54.73 | Under £100; with .com, month 1 is 9p over £70 |
| Grow 79, Claude blocked | £109.84 | £94.48 | Month 1 over £100; past the £85 pause line all year |
| Grow 79, Claude option A | £118.09 | £102.73 | Over £100 every month |
| Any annual data plan paid up front | £311 to £789 | | Month 1 far over £100 |

- **The biggest lever is the data tier.** Grow 79 to Grow 55 saves £48 a month, more than all of AWS (£18.64) and
  Claude option A (£8.24) together.
- **The Apple Developer Program fee cannot fit any month as things stand.** It is $99, or £95.04 with tax, and the
  month it is paid breaches £100 even with only dev running (£101.36). No month has room for it. It needs an owner
  rule, not a different month (question 4 below).
- **A rights-clean second source fits the ceiling only with Grow 55.** EODHD at £19.99 to £23.99 (VAT unconfirmed) plus Grow 55
  and Claude option A peaks at about £83 to £94 in the domain month.
- **New lines found:**
  - GitHub Actions: inside the organisation's $12 free allowance at MP's drafted 520 Linux minutes; the worst case
    is about £3 a month.
  - Telemetry: confirmed already inside the AWS total.
  - The domain: Route 53's price list puts .com at $16 from 1 July 2026, and .uk at $9.
  - Secrets Manager: $0.40 a secret a month, with no named line yet.
  - Internet data transfer out: about $0.16 a month.
- **A possible double count:** the model has $1.50 a month of AWS build minutes alongside GitHub Actions.
- **A slip in the Claude models card:** it gives Sonnet 5.5 cache reads as $0.20, but Anthropic's page says $0.10. No
  total changes, because no caching saving is counted.

## Region (for MP-29)

The research recommends **London (eu-west-2)**, with Ireland as the fallback. Every service MP needs is in all three
candidate Regions. London costs about £0.46 a month more than Virginia in the model (£20.31 against £19.84), keeps
the AWS copy of the owner's holdings and backups in the UK, and had the lowest measured latency from the owner's Mac.

In every Region:
- Python has no native Lambda response streaming, so the API needs the Lambda Web Adapter.
- Anthropic processes prompts in the US or globally: there is no UK or EU option.
- Global services sit in us-east-1.

N0 (no VPC) with SageMaker network isolation, two accounts under AWS Organizations, and CDK in Python as the IaC
proposal are taken forward in MP-29.

## The owner's answers (2 November 2026)

- **Data mix:** keep ARC-01: Yahoo Finance and Twelve Data Grow, with Twelve Data Basic (free) for development. MP
  is personal hobby use, not commercial, and the owner accepts the published-terms risk recorded above. The Grow tier
  is Grow 55 at $29 (owner, 2 November 2026), the only tier that fits £100 every month.
- **Grow tier (settled later the same day):** Grow 55 at $29, with Yahoo kept alongside for delayed intraday UK and
  India prices and a cross-check. Pro 610 ($99) was compared and not chosen: it breaks £100 every month.
- **Vendors:** none is contacted. The questions below stay unsent.
- **The Apple Developer fee:** one exception month a year above £100, for this fee only.
- **Region:** Virginia (us-east-1), taken forward in MP-29.

The answers are also in the [decision log](../ma-reconciliation-2026-11-02/decision-log.md).

## Decision card for the owner (as asked)

Each question has a recommended option first. Nothing is decided until the owner answers.

1. **ARC-01, the data mix.**
   - **(Recommended)** Drop Yahoo for good. Ask Twelve Data in writing whether Grow 55 allows MP's private storage,
     training, automated monitoring and Anthropic use. If it does, use Grow 55. If not, use EODHD's personal plan
     for daily data, with Alpha Vantage as the cross-check.
   - Keep ARC-01 as it is and wait.
2. **Contacting vendors.**
   - **(Recommended)** Send the written questions below to Twelve Data, EODHD and AMFI, from the owner's own email.
     MP never contacts anyone without this yes.
   - Don't contact them yet.
3. **India mutual fund NAVs at first release.**
   - **(Recommended)** Use the owner's own CAS statements for funds held, and ask AMFI for permission before storing
     NAV history.
   - Leave Indian funds out of the first release.
4. **The Apple Developer fee and the ceiling.**
   - **(Recommended)** Leave it out of the first release (web PWA first). Decide it in PH-07 against the measured
     run rate.
   - A one-off exception month.
   - Raise the ceiling in that month.
5. **The domain.** **(Recommended)** .uk at $9 a year, or .com at $16 a year.

## Questions for vendors (unsent: the owner chose not to contact vendors)

**Twelve Data:**
1. Does Grow's "view-only" label forbid one private individual from storing daily bars in their own private cloud and
   backups? Which is the cheapest individual tier that allows it?
2. May they train and evaluate their own forecasting models on Grow or Pro data, and keep the models after cancelling?
3. Is automated use with no one viewing allowed on Grow or Pro?
4. May raw or derived prices be sent to Anthropic inside prompts?
5. How many years of daily history do Grow and Pro give for LSE, NSE and BSE? Are every LSE investment trust and ETF
   included, and quoted in GBp?
6. Which plan returns UK and Indian fund NAVs?
7. Do LSE, NSE or BSE prices on Grow carry exchange fees or need a non-professional declaration?
8. Does the 30-day deletion after cancelling cover models and forecasts derived from the data, and audit records that
   quote the closing prices used?

**EODHD:**
1. Does the personal plan include LSE, NSE and BSE end-of-day data now?
2. Which plan includes the EUFUND UK NAVs, and how much history?
3. May derived values and short raw extracts be sent to Anthropic?
4. Is VAT added for a UK buyer?

**AMFI:**
1. May one person fetch NAVAll.txt and NAV history by script, store it, train private models, and show derived
   results to themselves, including through an AI processor?
2. On what terms, and with what attribution?

## Files

- [cost_months.py](cost_months.py): the 12-month cash view. Run it as
  `python3 -I docs/planning/source-rights-2026-11-02/cost_months.py --json docs/planning/source-rights-2026-11-02/evidence/cost-months.json`.
- [evidence/twelvedata.json](evidence/twelvedata.json): plans, the six uses, coverage, credit estimate and questions.
- [evidence/yahoo-and-alternatives.json](evidence/yahoo-and-alternatives.json): Yahoo's terms per use, and the
  alternatives with their terms.
- [evidence/cost-months.json](evidence/cost-months.json): every scenario, month by month.
