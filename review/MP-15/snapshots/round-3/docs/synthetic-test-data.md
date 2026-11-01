# Synthetic local and dev test data

Prepared under **MP-16**, during requirements work. This is an isolated fixture tool, not an application data pipeline or a validated prediction model.

## Identity and data boundary

The catalogue uses **30 real ticker/exchange identifiers**, ten in each of US, UK and India. ISINs are included only where issuer references were checked. The generated prices, portfolio quantities, cash flows, corporate actions, FX, news and forecasts are **simulated**, not downloaded market history and not the owner's actual holdings.

Every observation identifies itself as synthetic. The selected `XLON:CNX1` fixture is a public instrument example; it does not resolve the owner's still-unconfirmed Nasdaq ETF listing. Names and current identifiers are used over a simulated historical path; historical renamings, restructurings and all historical listing memberships are not represented.

## Location and regeneration

Generated data is local and ignored by Git:

- `data/synthetic-v1/local/`
- `data/synthetic-v1/dev/`
- `data/synthetic-v1/overview.html` is the generated visual index.

The versioned catalogue is [instruments.json](../fixtures/synthetic/instruments.json). Run from the repository:

```sh
uv run scripts/synthetic_data.py
```

The standalone script declares its pinned simulation dependencies. It accepts only `local`, `dev` or `both`. It refuses to replace an existing directory by default. To regenerate an owned fixture pack deliberately:

```sh
uv run scripts/synthetic_data.py --environment both --replace-generated
```

Replacement requires a matching dataset marker. New packs are built in staging before replacing the old generated directory. The script has no AWS/data-provider/Claude client or network-loading functionality. AWS inspection was read-only; the user explicitly deferred AWS dev loading. No AWS resources were created or seeded.

## Contents per environment

| Dataset | Size/scope |
| --- | --- |
| Real instrument catalogue | 30 listings, including equities and ETFs; growth/technology, banks, healthcare, consumer, energy, utilities, solar and clean-energy examples |
| Daily observations | **80,722 bars**, 2016-01-01 through 2026-10-30, subject to sessions and the configured inception |
| Intraday observations | **25,800 bars**, last 60 sessions per instrument, nominal 30-minute intervals; final short session intervals retained |
| Session schedules | **8,133 sessions** across NYSE-family, LSE and NSE calendars |
| Simulated portfolios | **3 accounts, 30 positions, 392 ledger events**, with decimal cash, buys/partial sales, a test split and test cash dividends |
| FX | Simulated GBP/USD/INR conversion series with explicit direction |
| Forecast fixtures | **14,400** toy forecasts at 1/5/20/63/126/252-session horizons |
| Mature outcome fixtures | **11,640** linked outcomes; no outcome is emitted before the horizon is available |
| Import | A transaction CSV and equivalent JSON ledger |
| Scenarios | Stale data, invalid OHLC, duplicate import, GBX/GBP conversion, cross-environment denial and unresolved instrument input |
| Agent evaluation inputs | Grounded explanation, injected source instruction, budget exhaustion, future label and no-execution cases |
| Golden fixture | Known-answer annual XIRR cash flows: -10,000 then +11,000 over 365 days |
| Manifest | Dataset/environment/seed/date range, counts, hashes, source-code/catalogue hashes and limitations |

Local and dev share identical market observations for comparable tests; account, owner and event namespaces differ. Generated names/amounts describe synthetic accounts only. Negative fixtures are kept separate from the clean market datasets. An invalid identifier in a negative test is intentionally an error input, not a fictional catalogue instrument.

## Realism and limitations

The simulator includes shared market/regional factors, heterogeneous volatility, persistent stress periods, overnight gaps, OHLC bounds, lognormal volume and currency movement. It uses configurable synthetic starting-price, volatility and yield assumptions. **Those parameters were not estimated from downloaded issuer price histories.** Realistic behaviour does not mean the actual historical return path has been recreated.

Calendar schedules come from pinned `pandas-market-calendars` and its exchange-calendar dependency, including timezone/daylight-saving and short-session behaviour. They are useful test schedules, not an exchange-certified historical calendar. Check official exchange notices before using calendar behaviour in production. Intraday bars reconcile exactly to the generated daily open/high/low/close and volume; session-final partial bars are not padded beyond the close.

The test split and cash dividends are deliberately labelled simulation assumptions, not claims about the named issuers' actual events. The synthetic total-return index is a simplified daily yield-accrual path; it is not a fully reconstructed tax/reinvestment/dividend-pay-date engine. Negative cases are not a complete parser/security test suite. [Companion synthetic PDFs, screenshots and operational scenarios](synthetic-import-samples.md) now provide generic document samples derived from these packs. Actual broker layouts, Excel-layout fixtures and broader extraction/security cases are still needed before claiming every planned import method is validated.

Toy forecasts use trailing simulated returns without training or calibration. They exist to test schemas, provenance, maturity and UI states; they **must not be used as evidence of predictive accuracy, live calibration or real-market strategy performance**. The application schemas are still being designed, so a future loader must explicitly map these fixture contracts into approved API/storage schemas.

## Verification

```sh
python3 scripts/validate_synthetic_data.py data/synthetic-v1/local
python3 scripts/validate_synthetic_data.py data/synthetic-v1/dev

uv run --no-project --with numpy==2.5.4 --with pandas==3.1.0 \
  --with pandas-market-calendars==5.6.0 --with exchange-calendars==4.13.2 \
  python -m unittest discover -s tests -p test_synthetic_data.py -v
```

Validation checks file hashes; unique real catalogue keys; OHLC/volume constraints; GBX normalization; full daily-session membership/close/chronology and intraday/session/daily reconciliation; nonnegative account cash; position/ledger/value reconciliation; probability/quantile ordering; and horizon-correct outcome timing/returns. Nine isolated tests also check same-seed market reproducibility with distinct environment identities, future-outcome independence of earlier forecasts, corruption detection, production refusal, the XIRR known answer, CNX1 pence conversion, old daily-session mutation and corruption refusal under optimized Python. These are fixture checks, not a production readiness claim.

## Public reference basis

- [NYSE regular sessions and holidays](https://www.nyse.com/markets/hours-calendars)
- [LSE investor information](https://www.londonstockexchange.com/en/resources/faqs/personal-investing)
- [NSE market timings](https://www.nseindia.com/static/market-data/market-timings)
- [Exchange-calendar library](https://github.com/gerrymanoim/exchange_calendars)
- [iShares Nasdaq 100 UCITS ETF listings](https://www.ishares.com/uk/individual/en/products/253741/ishares-nasdaq-100-ucits-etf_1)
- [Invesco QQQ](https://www.invesco.com/us/en/financial-products/etfs/invesco-qqq-trust-series-1.html)
- [SPY listing](https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-sp-500-etf-trust-spy)
- [Nippon India Nifty BeES identifier](https://etf.nipponindiaim.com/Funds/details/14)
- [NSE instrument screener](https://marketlens.nseindia.com/screener)
- [First Solar identifier](https://investor.firstsolar.com/stock-info/default.aspx)

No market-data subscription or paid model invocation was used to generate these packs.
