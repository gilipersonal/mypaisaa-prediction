"""Read-only maker checks for proposed data/cost documents; no service or network code."""

from __future__ import annotations

import copy
import datetime as dt
import hashlib
import json
from decimal import Decimal as D
from pathlib import Path

from jsonschema import Draft202012Validator


PACK = Path(__file__).resolve().parents[1]


def read(area: str, name: str) -> dict:
    return json.loads((PACK / area / name).read_text())


def instant(value: str) -> dt.datetime:
    assert isinstance(value, str) and value.endswith("Z"), value
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))


def main() -> None:
    files = [*PACK.joinpath("data").glob("*.json"), *PACK.joinpath("costs").glob("*.json")]
    for file in files:
        json.loads(file.read_text())
    schema = read("data", "contracts.json")
    examples = read("data", "examples.json")
    catalogue = read("data", "catalogue.json")
    Draft202012Validator.check_schema(schema)
    instance_counts = {}
    for name, rows in (
        ("Observation", examples["observations"]),
        ("Listing", catalogue["listings"]),
        ("SourceCapability", examples["capabilities"]),
        ("CorporateAction", examples["corporate_actions"]),
    ):
        validator = Draft202012Validator({"$ref": "#/$defs/" + name, "$defs": schema["$defs"]})
        for row in rows:
            validator.validate(row)
        instance_counts[name] = len(rows)

    validator = Draft202012Validator({"$ref": "#/$defs/Observation", "$defs": schema["$defs"]})
    for mutation in ("float", "missing", "time_type", "nav_shape", "extra"):
        row = copy.deepcopy(examples["observations"][0])
        if mutation == "float":
            row["payload"]["close"] = 201.0
        elif mutation == "missing":
            del row["known_at"]
        elif mutation == "time_type":
            row["known_at"] = 42
        elif mutation == "nav_shape":
            row["data_kind"] = "nav"
        else:
            row["unexpected"] = "value"
        assert not validator.is_valid(row), mutation

    # JSON Schema format support can be optional. Parse times independently.
    try:
        instant("yesterday")
    except (AssertionError, ValueError):
        pass
    else:
        raise AssertionError("Malformed timestamp accepted")
    for row in examples["observations"]:
        assert row["mode"] == "synthetic" and row["environment"] == "ci"
        encoded = json.dumps(row["payload"], sort_keys=True, separators=(",", ":")).encode()
        assert hashlib.sha256(encoded).hexdigest() == row["payload_sha256"]
        assert instant(row["known_at"]) >= instant(row["ingested_at"])
        assert instant(row["known_at"]) >= instant(row["published_at"])
        dt.date.fromisoformat(row["effective_date"])
        payload = row["payload"]
        if row["data_kind"] == "daily_ohlcv":
            assert instant(payload["interval_start"]) < instant(payload["interval_end"])
            assert D(payload["low"]) <= D(payload["open"]) <= D(payload["high"])
            assert D(payload["low"]) <= D(payload["close"]) <= D(payload["high"])
        if payload.get("quote_unit") == "GBX":
            assert payload["currency"] == "GBP" and D(payload["unit_factor"]) == D("0.01")
    for name in ("capability_transitions", "acquisition_transitions"):
        states = schema[name]
        assert all(target in states for targets in states.values() for target in targets)
    assert len(catalogue["entitlement_matrix"]) == 9
    for row in catalogue["entitlement_matrix"]:
        assert set(row["uses"]) == set(catalogue["uses"])
        assert all(item["decision"] == "unknown" for item in row["uses"].values())
    assert D("125.00") * D("0.01") == D("1.2500")
    assert D("201.00") * D("0.80") == D("160.8000")

    model = read("costs", "model.json")
    assert model["assumptions"]["billing_collection_hours"] == {"AWS": 24, "Anthropic": 6}
    assert model["owner_confirmed"]["billing_collector_policy"]["decision_ref"] == "DEC-025"
    assert model["assumptions"]["monthly_cost_explorer_paginated_page_cap"] == 120
    collection = model["assumptions"]["billing_collection"]
    assert collection["reference_month_days"] * collection["max_pages_per_daily_collection_reference"] == 120
    proof = model["assumptions"]["credit_allocation_proof"]
    assert proof["current_admissible_credit_usd"] == 0
    assert proof["org_wide_cooperative_or_enforceable_allocation_required"] is True
    assert proof["mp_local_ledger_controls_unrelated_apps"] is False
    assert proof["usage_cost_analytics_proves_realtime_credit_balance"] is False
    assert proof["credit_balance_api_assumed"] is False
    assert proof["proposed_max_proof_age_minutes"] == 30
    assert proof["proof_age_is_usage_collection_cadence"] is False
    research = read("costs", "research.json")
    evidence_ids = {item["id"] for item in research["sources"] + research["offer_sources"]}
    assumption_ids = {item["id"] for item in model["estimate_assumptions"]}
    variants = 0
    for result in model["results"]:
        subtotals = []
        for record in result["environment_costs"].values():
            for line in record["line_items"]:
                assert D(line["quantity"]) * D(line["usd_rate"]) == D(line["usd_cost"])
                assert line["unit"] and "see " not in line["unit"]
                if "price_evidence_ref" in line:
                    assert line["price_evidence_ref"] in evidence_ids
                else:
                    assert line["assumption_ref"] in assumption_ids
            subtotal = sum(D(line["usd_cost"]) for line in record["line_items"])
            assert subtotal == D(record["usd_subtotal"])
            subtotals.append(subtotal)
        assert sum(subtotals) == D(result["aws_usd_total"])
        claude = next(item for item in model["claude_workloads"] if item["scenario"] == result["scenario"])
        for environment, quantities in claude["environment_tokens_millions"].items():
            total = D(0)
            for kind, quantity in quantities.items():
                rate = D("0.1") if kind == "economy_input_mtok" else D("0.5") if kind == "economy_output_mtok" else D("2") if "input" in kind else D("10")
                total += D(quantity) * rate
            assert total == D(claude["environment_usd"][environment])
        assert sum(D(value) for value in claude["environment_usd"].values()) == D(claude["gross_usd"])
        for variant in result["all_in_variants"]:
            fx = next(item for item in model["fx_tax_scenarios"] if item["id"] == variant["fx_scenario"])
            factor = D(fx["gbp_per_usd"]) * (1 + D(fx["tax_fraction"])) * (1 + D(fx["card_fx_fraction"]))
            data = D("79") if variant["data_option"] == "Grow377_displayed" else D("29") if variant["data_option"] == "Grow55_support_candidate" else D(0)
            claude_cash = D(claude["gross_usd"]) if variant["credit_scenario"] == "counterfactual_gross_no_credit_paid_not_authorised" else D(0)
            cash = (sum(subtotals) + data + claude_cash) * factor
            assert cash.quantize(D("0.01")) == D(variant["cash_gbp"])
            assert (cash <= 70) == variant["within_70_operating"]
            assert (cash <= 100) == variant["within_100_ceiling"]
            variants += 1
        hours = sum(D(line["quantity"]) for record in result["environment_costs"].values() for line in record["line_items"] if line["name"] == "training_instance_hour")
        assert hours == (12 if result["scenario"] == "baseline" else 56)
    reservation = read("costs", "reservation-contract.json")
    boundary = reservation["credit_proof_boundary"]
    assert boundary["current_admissible_credit_usd"] == 0
    assert boundary["mp_local_ledger_controls_other_apps"] is False
    assert boundary["usage_cost_report_is_realtime_credit_balance"] is False
    assert boundary["credit_balance_api_assumed"] is False
    assert boundary["other_projects_changed"] is False
    states = reservation["transitions"]
    assert all(target in states for targets in states.values() for target in targets)
    print(json.dumps({"status": "passed", "json_files": len(files), "schema_instances": instance_counts, "negative_shapes_rejected": 5, "cash_variants": variants, "region_workload_scenarios": len(model["results"]), "independent_review": False, "network_or_service_calls": False}, indent=2))


if __name__ == "__main__":
    main()
