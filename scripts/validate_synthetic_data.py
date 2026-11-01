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


def validate(pack: Path) -> dict:
    manifest = json.loads((pack / "manifest.json").read_text())
    assert manifest["environment"] in {"local", "dev"}
    assert manifest["observations_are_synthetic"] is True
    for filename, expected in manifest["sha256"].items():
        assert hashlib.sha256((pack / filename).read_bytes()).hexdigest() == expected, filename
    instruments = json.loads((pack / "instruments.json").read_text())
    ids = {x["instrument_id"] for x in instruments}
    assert len(ids) == len(instruments) == 30
    assert {x["market"] for x in instruments} == {"US", "UK", "IN"}
    for instrument in instruments:
        assert instrument["instrument_id"] == instrument["venue"] + ":" + instrument["ticker"]
        assert not instrument["instrument_id"].startswith(("SYN", "TEST"))
    daily = read_jsonl(pack / "daily_prices.jsonl.gz")
    prices = {}
    histories = defaultdict(list)
    for row in daily:
        key = (row["instrument_id"], row["session"])
        assert key not in prices
        assert row["instrument_id"] in ids and row["is_synthetic"]
        assert 0 < row["low"] <= min(row["open"], row["close"])
        assert row["high"] >= max(row["open"], row["close"])
        assert row["volume"] > 0
        assert row["observed_at"] < row["available_at"]
        expected = row["close"] / (100 if row["quote_unit"] == "GBX" else 1)
        assert abs(expected - row["currency_close"]) < 0.000001
        prices[key] = row
        histories[row["instrument_id"]].append(row)
    intraday = read_jsonl(pack / "intraday_30m.jsonl.gz")
    grouped = defaultdict(list)
    session_map = {(r["market"], r["session"]): r for r in read_jsonl(pack / "sessions.jsonl.gz")}
    market = {x["instrument_id"]: x["market"] for x in instruments}
    for row in intraday:
        session = session_map[(market[row["instrument_id"]], row["session"])]
        assert datetime.fromisoformat(session["open"]) <= datetime.fromisoformat(row["start"])
        assert datetime.fromisoformat(row["start"]) < datetime.fromisoformat(row["end"])
        assert datetime.fromisoformat(row["end"]) <= datetime.fromisoformat(session["close"])
        assert 0 < row["low"] <= min(row["open"], row["close"])
        assert row["high"] >= max(row["open"], row["close"])
        grouped[(row["instrument_id"], row["session"])].append(row)
    for key, bars in grouped.items():
        day = prices[key]
        assert bars[0]["open"] == day["open"] and bars[-1]["close"] == day["close"]
        assert min(x["low"] for x in bars) == day["low"]
        assert max(x["high"] for x in bars) == day["high"]
        assert sum(x["volume"] for x in bars) == day["volume"]
        assert all(a["end"] == b["start"] for a, b in zip(bars, bars[1:]))
    with (pack / "transactions.csv").open() as stream:
        ledger = list(csv.DictReader(stream))
    cash, quantity, seen = defaultdict(Decimal), defaultdict(Decimal), set()
    for event in ledger:
        assert event["event_id"] not in seen
        seen.add(event["event_id"])
        assert event["account_id"].startswith("synthetic-" + manifest["environment"] + "-")
        cash[event["account_id"]] += Decimal(event["cash_delta"])
        quantity[event["instrument_id"]] += Decimal(event["quantity_delta"])
        assert cash[event["account_id"]] >= 0
    for account in json.loads((pack / "accounts.json").read_text()):
        assert cash[account["account_id"]] == Decimal(account["cash"])
    for position in json.loads((pack / "positions.json").read_text()):
        assert quantity[position["instrument_id"]] == Decimal(position["quantity"])
        value = (Decimal(position["quantity"]) * Decimal(position["price"])).quantize(
            Decimal(".01")
        )
        assert value == Decimal(position["value"])
    forecasts = read_jsonl(pack / "forecasts.jsonl.gz")
    outcomes = {r["prediction_id"]: r for r in read_jsonl(pack / "outcomes.jsonl.gz")}
    assert len(outcomes) == manifest["counts"]["mature_outcomes"]
    for prediction in forecasts:
        assert 0 <= prediction["probability_up"] <= 1
        assert prediction["return_q10"] <= prediction["return_q50"] <= prediction["return_q90"]
        assert prediction["data_cutoff"] <= prediction["as_of"]
        history = histories[prediction["instrument_id"]]
        source = next(
            i for i, row in enumerate(history) if row["available_at"] == prediction["data_cutoff"]
        )
        target = source + prediction["horizon_sessions"]
        if target >= len(history):
            assert prediction["prediction_id"] not in outcomes
        else:
            outcome = outcomes[prediction["prediction_id"]]
            expected = (
                history[target]["total_return_index"] / history[source]["total_return_index"] - 1
            )
            assert abs(outcome["realised_return"] - expected) < 0.00000001
            assert outcome["scored_at"] == history[target]["available_at"]
            assert outcome["scored_at"] > prediction["as_of"]
    assert len(daily) == manifest["counts"]["daily_bars"]
    assert len(intraday) == manifest["counts"]["intraday_bars"]
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
