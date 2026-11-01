"""Offline fixture integrity checks; no application or AWS integration is implied."""

from __future__ import annotations

import argparse
import csv
import gzip
import hashlib
import json
from collections import defaultdict
from datetime import datetime
from decimal import Decimal
from pathlib import Path


def read_jsonl(path: Path) -> list[dict]:
    with gzip.open(path, "rt", encoding="utf-8") as stream:
        return [json.loads(line) for line in stream]


def require(condition: bool, detail: object) -> None:
    if not condition:
        raise ValueError(str(detail))


def validate(pack: Path) -> dict:
    manifest = json.loads((pack / "manifest.json").read_text())
    require(
        manifest["environment"] in {"local", "dev"},
        'Invalid fixture: manifest["environment"] in {"local", "dev"}',
    )
    require(
        manifest["observations_are_synthetic"] is True,
        'Invalid fixture: manifest["observations_are_synthetic"] is True',
    )
    for filename, expected in manifest["sha256"].items():
        require(hashlib.sha256((pack / filename).read_bytes()).hexdigest() == expected, filename)
    instruments = json.loads((pack / "instruments.json").read_text())
    ids = {x["instrument_id"] for x in instruments}
    require(
        len(ids) == len(instruments) == 30, "Invalid fixture: len(ids) == len(instruments) == 30"
    )
    require(
        {x["market"] for x in instruments} == {"US", "UK", "IN"},
        'Invalid fixture: {x["market"] for x in instruments} == {"US", "UK", "IN"}',
    )
    for instrument in instruments:
        require(
            instrument["instrument_id"] == instrument["venue"] + ":" + instrument["ticker"],
            'Invalid fixture: instrument["instrument_id"] == instrument["venue...',
        )
        require(
            not instrument["instrument_id"].startswith(("SYN", "TEST")),
            'Invalid fixture: not instrument["instrument_id"].startswith(("SYN", "TEST"))',
        )
    session_map = {(r["market"], r["session"]): r for r in read_jsonl(pack / "sessions.jsonl.gz")}
    market = {x["instrument_id"]: x["market"] for x in instruments}
    daily = read_jsonl(pack / "daily_prices.jsonl.gz")
    prices = {}
    histories = defaultdict(list)
    for row in daily:
        key = (row["instrument_id"], row["session"])
        require(row["instrument_id"] in market, "Unknown daily instrument")
        session_key = (market[row["instrument_id"]], row["session"])
        require(session_key in session_map, "Daily row is not a recorded market session")
        require(
            row["observed_at"] == session_map[session_key]["close"],
            "Daily observed_at does not match recorded session close",
        )
        previous = histories[row["instrument_id"]]
        require(
            not previous or previous[-1]["session"] < row["session"],
            "Daily history must be strictly chronological",
        )
        require(key not in prices, "Invalid fixture: key not in prices")
        require(
            row["instrument_id"] in ids and row["is_synthetic"],
            'Invalid fixture: row["instrument_id"] in ids and row["is_synthetic"]',
        )
        require(
            0 < row["low"] <= min(row["open"], row["close"]),
            'Invalid fixture: 0 < row["low"] <= min(row["open"], row["close"])',
        )
        require(
            row["high"] >= max(row["open"], row["close"]),
            'Invalid fixture: row["high"] >= max(row["open"], row["close"])',
        )
        require(row["volume"] > 0, 'Invalid fixture: row["volume"] > 0')
        require(
            row["observed_at"] < row["available_at"],
            'Invalid fixture: row["observed_at"] < row["available_at"]',
        )
        expected = row["close"] / (100 if row["quote_unit"] == "GBX" else 1)
        require(
            abs(expected - row["currency_close"]) < 1e-06,
            'Invalid fixture: abs(expected - row["currency_close"]) < 0.000001',
        )
        prices[key] = row
        histories[row["instrument_id"]].append(row)
    intraday = read_jsonl(pack / "intraday_30m.jsonl.gz")
    grouped = defaultdict(list)
    for row in intraday:
        session = session_map[market[row["instrument_id"]], row["session"]]
        require(
            datetime.fromisoformat(session["open"]) <= datetime.fromisoformat(row["start"]),
            'Invalid fixture: datetime.fromisoformat(session["open"]) <= datet...',
        )
        require(
            datetime.fromisoformat(row["start"]) < datetime.fromisoformat(row["end"]),
            'Invalid fixture: datetime.fromisoformat(row["start"]) < datetime....',
        )
        require(
            datetime.fromisoformat(row["end"]) <= datetime.fromisoformat(session["close"]),
            'Invalid fixture: datetime.fromisoformat(row["end"]) <= datetime.f...',
        )
        require(
            0 < row["low"] <= min(row["open"], row["close"]),
            'Invalid fixture: 0 < row["low"] <= min(row["open"], row["close"])',
        )
        require(
            row["high"] >= max(row["open"], row["close"]),
            'Invalid fixture: row["high"] >= max(row["open"], row["close"])',
        )
        grouped[row["instrument_id"], row["session"]].append(row)
    for key, bars in grouped.items():
        day = prices[key]
        require(
            bars[0]["open"] == day["open"] and bars[-1]["close"] == day["close"],
            'Invalid fixture: bars[0]["open"] == day["open"] and bars[-1]["close"] == day["close"]',
        )
        require(
            min(x["low"] for x in bars) == day["low"],
            'Invalid fixture: min(x["low"] for x in bars) == day["low"]',
        )
        require(
            max(x["high"] for x in bars) == day["high"],
            'Invalid fixture: max(x["high"] for x in bars) == day["high"]',
        )
        require(
            sum(x["volume"] for x in bars) == day["volume"],
            'Invalid fixture: sum(x["volume"] for x in bars) == day["volume"]',
        )
        require(
            all((a["end"] == b["start"] for a, b in zip(bars, bars[1:]))),
            'Invalid fixture: all(a["end"] == b["start"] for a, b in zip(bars, bars[1:]))',
        )
    with (pack / "transactions.csv").open() as stream:
        ledger = list(csv.DictReader(stream))
    cash, quantity, seen = (defaultdict(Decimal), defaultdict(Decimal), set())
    for event in ledger:
        require(event["event_id"] not in seen, 'Invalid fixture: event["event_id"] not in seen')
        seen.add(event["event_id"])
        require(
            event["account_id"].startswith("synthetic-" + manifest["environment"] + "-"),
            'Invalid fixture: event["account_id"].startswith("synthetic-" + ma...',
        )
        cash[event["account_id"]] += Decimal(event["cash_delta"])
        quantity[event["instrument_id"]] += Decimal(event["quantity_delta"])
        require(cash[event["account_id"]] >= 0, 'Invalid fixture: cash[event["account_id"]] >= 0')
    for account in json.loads((pack / "accounts.json").read_text()):
        require(
            cash[account["account_id"]] == Decimal(account["cash"]),
            'Invalid fixture: cash[account["account_id"]] == Decimal(account["cash"])',
        )
    for position in json.loads((pack / "positions.json").read_text()):
        require(
            quantity[position["instrument_id"]] == Decimal(position["quantity"]),
            'Invalid fixture: quantity[position["instrument_id"]] == Decimal(position["quantity"])',
        )
        value = (Decimal(position["quantity"]) * Decimal(position["price"])).quantize(
            Decimal(".01")
        )
        require(
            value == Decimal(position["value"]),
            'Invalid fixture: value == Decimal(position["value"])',
        )
    forecasts = read_jsonl(pack / "forecasts.jsonl.gz")
    outcomes = {r["prediction_id"]: r for r in read_jsonl(pack / "outcomes.jsonl.gz")}
    require(
        len(outcomes) == manifest["counts"]["mature_outcomes"],
        'Invalid fixture: len(outcomes) == manifest["counts"]["mature_outcomes"]',
    )
    for prediction in forecasts:
        require(
            0 <= prediction["probability_up"] <= 1,
            'Invalid fixture: 0 <= prediction["probability_up"] <= 1',
        )
        require(
            prediction["return_q10"] <= prediction["return_q50"] <= prediction["return_q90"],
            'Invalid fixture: prediction["return_q10"] <= prediction["return_q...',
        )
        require(
            prediction["data_cutoff"] <= prediction["as_of"],
            'Invalid fixture: prediction["data_cutoff"] <= prediction["as_of"]',
        )
        history = histories[prediction["instrument_id"]]
        source = next(
            (i for i, row in enumerate(history) if row["available_at"] == prediction["data_cutoff"])
        )
        target = source + prediction["horizon_sessions"]
        if target >= len(history):
            require(
                prediction["prediction_id"] not in outcomes,
                'Invalid fixture: prediction["prediction_id"] not in outcomes',
            )
        else:
            outcome = outcomes[prediction["prediction_id"]]
            expected = (
                history[target]["total_return_index"] / history[source]["total_return_index"] - 1
            )
            require(
                abs(outcome["realised_return"] - expected) < 1e-08,
                'Invalid fixture: abs(outcome["realised_return"] - expected) < 0.00000001',
            )
            require(
                outcome["scored_at"] == history[target]["available_at"],
                'Invalid fixture: outcome["scored_at"] == history[target]["available_at"]',
            )
            require(
                outcome["scored_at"] > prediction["as_of"],
                'Invalid fixture: outcome["scored_at"] > prediction["as_of"]',
            )
    require(
        len(daily) == manifest["counts"]["daily_bars"],
        'Invalid fixture: len(daily) == manifest["counts"]["daily_bars"]',
    )
    require(
        len(intraday) == manifest["counts"]["intraday_bars"],
        'Invalid fixture: len(intraday) == manifest["counts"]["intraday_bars"]',
    )
    return {
        "environment": manifest["environment"],
        "checked": manifest["counts"],
        "status": "passed",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pack", type=Path)
    args = parser.parse_args()
    print(json.dumps(validate(args.pack)))


if __name__ == "__main__":
    main()
