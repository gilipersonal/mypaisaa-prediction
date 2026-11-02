"""Offline cash-timing regression: independent Decimal recomputation, no services.

Callable API: check_model(model) and check_cash_admission(reservation).
CLI: python costs/check_cash_timing.py --self-test
"""
from __future__ import annotations

import argparse
import copy
import json
from decimal import Decimal as D
from pathlib import Path

BASE = Path(__file__).resolve().parent
TIMINGS = ("ordinary_month", "annual_domain_invoice_month")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def check_cash_admission(reservation: dict) -> None:
    policy = reservation["cash_admission"]
    require(policy["basis"] == "invoice_month_cash", "Cash admission must use invoice-month cash")
    require(policy["amortisation_is_cash"] is False, "Amortisation cannot satisfy cash admission")
    require(policy["reserve_full_due_fixed_commitments"] is True, "Full due fixed commitments must be reserved")
    require(policy["release_only_after_confirmed_settlement_or_cancellation"] is True, "Due commitments cannot disappear on forecast expiry")
    require(policy["unknown_due_date_or_invoice_blocks_new_commitment"] is True, "Unknown invoice timing requires a conservative bound before admission")


def check_model(model: dict) -> dict:
    """Verify all run-rate and cash timing records from line quantities/rates.

    Threshold flags use unrounded Decimal totals. The two-decimal cash string is
    presentation, so rounding cannot turn an over-ceiling liability into a pass.
    """
    require(model["cash_timing_policy"]["amortisation_is_cash"] is False, "Run rate is not cash")
    require(model["cash_timing_policy"]["scenario_only_not_purchase"] is True, "No purchase or due month is established")
    domain = next(a for a in model["estimate_assumptions"] if a["id"] == "EST-COST-DOMAIN")
    annual = D(domain["annual_usd"])
    require(annual == D("15"), "The proposed annual domain allowance changed; review its cash scenarios")
    data_prices = {a["id"]: D(a["monthly_usd"]) for a in model["data_options"] if a["monthly_usd"] is not None}
    data_prices["synthetic_only_no_prod_live"] = D(0)
    fx_inputs = {a["id"]: a for a in model["fx_tax_scenarios"]}
    workloads = {a["scenario"]: a for a in model["claude_workloads"]}
    owner = model["owner_confirmed"]
    counts = {"run_rate_variants": 0, "cash_variants": 0}
    results = {}
    for result in model["results"]:
        require("all_in_variants" not in result, "Ambiguous legacy variant name remains")
        lines = [line for env in result["environment_costs"].values() for line in env["line_items"]]
        aws_run_rate = sum((D(line["quantity"]) * D(line["usd_rate"]) for line in lines), D(0))
        amortised = sum((D(line["quantity"]) * D(line["usd_rate"]) for line in lines if line["name"] == "domain_registration_allowance"), D(0))
        require(amortised == annual / 12, "Domain amortisation must equal annual allowance / 12")
        require(aws_run_rate == D(result["aws_usd_total"]), "AWS run-rate subtotal mismatch")
        central = fx_inputs["central"]
        central_factor = D(central["gbp_per_usd"]) * (1 + D(central["tax_fraction"])) * (1 + D(central["card_fx_fraction"]))
        require(D(result["aws_monthly_run_rate_gbp_central"]) == aws_run_rate * central_factor, "AWS run rate mislabeled or incorrect")
        model_gross = D(workloads[result["scenario"]]["gross_usd"])
        for variant in result["all_in_run_rate_variants"]:
            require("cash_gbp" not in variant, "Amortised run rate must not be called cash")
            fx = fx_inputs[variant["fx_scenario"]]
            factor = D(fx["gbp_per_usd"]) * (1 + D(fx["tax_fraction"])) * (1 + D(fx["card_fx_fraction"]))
            claude_cash = model_gross if variant["credit_scenario"] == "counterfactual_gross_no_credit_paid_not_authorised" else D(0)
            data = data_prices[variant["data_option"]]
            run_rate = (aws_run_rate + data + claude_cash) * factor
            require(D(variant["monthly_run_rate_gbp"]) == run_rate.quantize(D(".01")), "Monthly run-rate mismatch")
            require(variant["run_rate_within_70_operating"] == (run_rate <= D(owner["operating_gbp"])), "Run-rate operation comparison mismatch")
            require(variant["run_rate_within_100_reference"] == (run_rate <= D(owner["aggregate_cash_gbp"])), "Run-rate reference comparison mismatch")
            counts["run_rate_variants"] += 1
            timing_rows = variant["cash_timing_variants"]
            require(len(timing_rows) == 2 and {v["timing"] for v in timing_rows} == set(TIMINGS), "Both distinct cash timing variants are required")
            for cash in timing_rows:
                due = annual if cash["timing"] == "annual_domain_invoice_month" else D(0)
                cash_usd = aws_run_rate - amortised + due + data + claude_cash
                amount = cash_usd * factor
                require(D(cash["due_domain_usd"]) == due, "Invoice month must carry full annual domain commitment, ordinary month zero")
                require(D(cash["cash_usd_before_tax_card_fx"]) == cash_usd, "Cash USD must remove amortisation and add full due invoice")
                require(D(cash["cash_gbp"]) == amount.quantize(D(".01")), "Cash GBP timing mismatch")
                require(cash["within_70_operating"] == (amount <= D(owner["operating_gbp"])), "Cash operating flag mismatch")
                require(cash["within_100_ceiling"] == (amount <= D(owner["aggregate_cash_gbp"])), "Cash ceiling flag mismatch")
                for label in ("warn", "reduce", "pause"):
                    require(cash["thresholds_reached"][label] == (amount >= D(owner[label + "_gbp"])), "Cash alert threshold mismatch: " + label)
                require(cash["scenario_only_not_purchase"] is True, "Cash example cannot imply a purchase")
                key = (result["scenario"], result["region"], variant["data_option"], variant["credit_scenario"], variant["fx_scenario"], cash["timing"])
                require(key not in results, "Duplicate cash variant")
                results[key] = cash
                counts["cash_variants"] += 1
    require(counts == {"run_rate_variants": 108, "cash_variants": 216}, "Run-rate/cash coverage changed")
    base = ("baseline", "us-east-1")
    tail = ("no_verified_credit_optional_claude_blocked", "central", "annual_domain_invoice_month")
    for data, expected, within100 in (("Grow377_displayed", "108.88", False), ("Grow55_support_candidate", "60.88", True)):
        cash = results[base + (data,) + tail]
        require(cash["cash_gbp"] == expected and cash["within_100_ceiling"] is within100, "Independent Virginia annual-invoice known answer mismatch")
    return counts


def self_test(model: dict, reservation: dict) -> int:
    """Mutations are in-memory only and must fail for their specific invariant."""
    rejected = 0
    for mutation, expected in (
        ("amortised_invoice", "Invoice month must carry full annual"),
        ("old_cash_amount", "Cash GBP timing mismatch"),
        ("wrong_ceiling_flag", "Cash ceiling flag mismatch"),
        ("wrong_threshold", "Cash alert threshold mismatch"),
        ("missing_invoice", "Both distinct cash timing variants"),
        ("legacy_cash_label", "Amortised run rate must not be called cash"),
    ):
        changed = copy.deepcopy(model)
        variant = next(v for v in changed["results"][0]["all_in_run_rate_variants"] if v["data_option"] == "Grow377_displayed" and v["credit_scenario"] == "no_verified_credit_optional_claude_blocked" and v["fx_scenario"] == "central")
        annual = next(c for c in variant["cash_timing_variants"] if c["timing"] == "annual_domain_invoice_month")
        if mutation == "amortised_invoice":
            annual["due_domain_usd"] = "1.25"
        elif mutation == "old_cash_amount":
            annual["cash_gbp"] = variant["monthly_run_rate_gbp"]
        elif mutation == "wrong_ceiling_flag":
            annual["within_100_ceiling"] = True
        elif mutation == "wrong_threshold":
            annual["thresholds_reached"]["pause"] = False
        elif mutation == "missing_invoice":
            variant["cash_timing_variants"].remove(annual)
        else:
            variant["cash_gbp"] = variant["monthly_run_rate_gbp"]
        try:
            check_model(changed)
        except ValueError as error:
            require(expected in str(error), "Mutation refused for wrong reason: " + mutation)
            rejected += 1
        else:
            raise ValueError("Mutation incorrectly passed: " + mutation)
    for key, value in (("basis", "amortised_run_rate"), ("amortisation_is_cash", True), ("reserve_full_due_fixed_commitments", False), ("unknown_due_date_or_invoice_blocks_new_commitment", False)):
        changed = copy.deepcopy(reservation)
        changed["cash_admission"][key] = value
        try:
            check_cash_admission(changed)
        except ValueError:
            rejected += 1
        else:
            raise ValueError("Cash admission mutation incorrectly passed: " + key)
    return rejected


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    model = json.loads((BASE / "model.json").read_text())
    reservation = json.loads((BASE / "reservation-contract.json").read_text())
    result = check_model(model)
    check_cash_admission(reservation)
    if args.self_test:
        result["mutations_rejected"] = self_test(model, reservation)
    print(json.dumps({"status": "passed", **result, "network_or_service_calls": False}))


if __name__ == "__main__":
    main()
