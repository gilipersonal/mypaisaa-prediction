"""Offline cash-timing regression: independent Decimal recomputation, no services.

Callable API: check_model(model) and check_cash_admission(reservation).
CLI: python costs/check_cash_timing.py --self-test

MP-20 consolidation (owner, 3 Nov 2026): the domain line is gone (mypaisapp.com is renewed outside MP), so the
conditional annual line now checked in its due month is the Apple Developer Program fee, whose month is the one
allowed exception above GBP100. The expected months for the owner's selection are recomputed here too.

MP-20 review, round 2: every Apple-month row keeps its threshold flags on the full month including the fee (fixed
finding R1-C1) and also carries the remainder (every other line) with its own flags; both are recomputed here.
"""
from __future__ import annotations

import argparse
import copy
import json
from decimal import Decimal as D
from pathlib import Path

BASE = Path(__file__).resolve().parent
TIMINGS = ("ordinary_month", "apple_fee_exception_month")
APPLE_USD = D("99")
SCAN_CAP_GBP = D("5")
TELEMETRY_LINES = ("logs_ingested_gb", "logs_stored_gb_month", "logs_scanned_gb", "metric_month", "alarm_month",
                   "trace_recorded", "trace_queried")


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
    exception = policy["exception_month"]
    require(exception["fee"] == "apple_developer_program" and exception["months_per_year"] == 1,
            "Only the Apple fee month may exceed the ceiling, once a year")
    require(exception["other_lines_must_fit"] is True, "The exception month covers the Apple fee only")
    require(policy["scan_allowance_max_gbp"] == "5", "Scan allowance must stay a GBP5 reserved cap")


def factor(fx: dict) -> D:
    return D(fx["gbp_per_usd"]) * (1 + D(fx["tax_fraction"])) * (1 + D(fx["card_fx_fraction"]))


def flags(amount: D, owner: dict) -> dict:
    return {
        "within_70_operating": amount <= D(owner["operating_gbp"]),
        "within_100_ceiling": amount <= D(owner["aggregate_cash_gbp"]),
        "thresholds_reached": {label: amount >= D(owner[label + "_gbp"]) for label in ("warn", "reduce", "pause")},
    }


REMAINDER_KEYS = ("exception_fee_gbp", "remaining_cash_gbp_excluding_exception_fee", "remaining_within_70_operating",
                  "remaining_within_100_ceiling", "remaining_thresholds_reached")


def check_remainder(row: dict, fee: D, rest: D, owner: dict) -> None:
    """The Apple-month remainder is shown separately; it never replaces the full-month flags (R1-C1)."""
    require(all(key in row for key in REMAINDER_KEYS), "Exception month remainder fields missing")
    require(D(row["exception_fee_gbp"]) == fee.quantize(D(".01")), "Exception fee GBP mismatch")
    require(D(row["remaining_cash_gbp_excluding_exception_fee"]) == rest.quantize(D(".01")), "Exception month remainder mismatch")
    expected = flags(rest, owner)
    require(row["remaining_within_100_ceiling"] == expected["within_100_ceiling"], "Exception month remainder flag mismatch")
    require(row["remaining_within_70_operating"] == expected["within_70_operating"], "Exception month remainder flag mismatch")
    require(row["remaining_thresholds_reached"] == expected["thresholds_reached"], "Exception month remainder threshold mismatch")


def option_a_gross(model: dict) -> D:
    """ARC-06b option A over the baseline token volumes plus the event-analysis allowance."""
    spec = model["claude_option_a"]
    price = {k: (D(v["input"]), D(v["output"])) for k, v in spec["usd_per_mtok"].items()}
    route = spec["routing"]
    require(route == {"economy": "haiku_batch", "standard": "sonnet_live", "eval_standard": "sonnet_batch",
                      "event_analysis": "opus_batch"}, "Claude option A routing changed")
    tokens = next(w for w in model["claude_workloads"] if w["scenario"] == "baseline")["environment_tokens_millions"]
    total = D(0)
    for env in tokens.values():
        for kind in ("economy", "standard", "eval_standard"):
            rate_in, rate_out = price[route[kind]]
            total += D(env[kind + "_input_mtok"]) * rate_in + D(env[kind + "_output_mtok"]) * rate_out
    events = spec["event_analysis_allowance"]
    rate_in, rate_out = price[route["event_analysis"]]
    n = D(events["events_per_month"])
    total += n * D(events["input_mtok_each"]) * rate_in + n * D(events["output_mtok_each"]) * rate_out
    return total


def check_model(model: dict) -> dict:
    """Verify all run-rate and cash timing records from line quantities/rates.

    Threshold flags use unrounded Decimal totals. The two-decimal cash string is
    presentation, so rounding cannot turn an over-ceiling liability into a pass.
    """
    require(model["cash_timing_policy"]["amortisation_is_cash"] is False, "Run rate is not cash")
    require(model["cash_timing_policy"]["scenario_only_not_purchase"] is True, "No purchase or due month is established")
    assumptions = {a["id"]: a for a in model["estimate_assumptions"]}
    domain = assumptions["EST-COST-DOMAIN"]
    require(domain["status"] == "retired_owner_2026-11-03" and D(domain["mp_cash_usd"]) == 0,
            "Domain is renewed outside MP: the domain allowance must stay retired at zero")
    apple = assumptions["EST-COST-APPLE"]
    require(D(apple["annual_usd"]) == APPLE_USD and apple["status"] == "conditional_not_bought",
            "Apple fee changed; review its exception-month cash scenarios")
    github = assumptions["EST-COST-GITHUB"]
    require(D(github["monthly_usd"]) == 0, "GitHub Actions is planned inside the free allowance at USD0")
    scan = assumptions["EST-COST-SCAN"]
    require(D(scan["max_gbp_per_month"]) == SCAN_CAP_GBP, "Scan allowance must stay at most GBP5 a month")
    decisions = model["owner_cost_decisions"]
    require(decisions["region"]["value"] == "us-east-1", "Owner-selected Region is Virginia")
    require(decisions["prod_data"]["value"] == "Grow55_support_candidate" and decisions["dev_data"]["value"] == "Basic_dev",
            "Owner-selected data is Grow 55 in prod and Basic in dev")
    require(D(decisions["secrets"]["per_secret_usd"]) == 0, "SSM secrets carry no per-secret fee")
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
        domain_cost = sum((D(line["quantity"]) * D(line["usd_rate"]) for line in lines if line["name"] == "domain_registration_allowance"), D(0))
        require(domain_cost == 0, "Domain is renewed outside MP: no domain line may carry cost")
        require(aws_run_rate == D(result["aws_usd_total"]), "AWS run-rate subtotal mismatch")
        require(D(result["aws_monthly_run_rate_gbp_central"]) == aws_run_rate * factor(fx_inputs["central"]), "AWS run rate mislabeled or incorrect")
        model_gross = D(workloads[result["scenario"]]["gross_usd"])
        for variant in result["all_in_run_rate_variants"]:
            require("cash_gbp" not in variant, "Amortised run rate must not be called cash")
            f = factor(fx_inputs[variant["fx_scenario"]])
            claude_cash = model_gross if variant["credit_scenario"] == "counterfactual_gross_no_credit_paid_not_authorised" else D(0)
            data = data_prices[variant["data_option"]]
            run_rate = (aws_run_rate + data + claude_cash) * f
            require(D(variant["monthly_run_rate_gbp"]) == run_rate.quantize(D(".01")), "Monthly run-rate mismatch")
            require(variant["run_rate_within_70_operating"] == (run_rate <= D(owner["operating_gbp"])), "Run-rate operation comparison mismatch")
            require(variant["run_rate_within_100_reference"] == (run_rate <= D(owner["aggregate_cash_gbp"])), "Run-rate reference comparison mismatch")
            counts["run_rate_variants"] += 1
            timing_rows = variant["cash_timing_variants"]
            require(len(timing_rows) == 2 and {v["timing"] for v in timing_rows} == set(TIMINGS), "Both distinct cash timing variants are required")
            for cash in timing_rows:
                exception = cash["timing"] == "apple_fee_exception_month"
                due = APPLE_USD if exception else D(0)
                cash_usd = aws_run_rate + due + data + claude_cash
                amount = cash_usd * f
                require(D(cash["due_domain_usd"]) == 0, "Domain is renewed outside MP: no domain cash in any month")
                require(D(cash["due_annual_usd"]) == due, "Exception month must carry the full annual Apple fee, ordinary month zero")
                require(cash["due_annual_line"] == ("apple_developer_program" if exception else None), "Due annual line mislabeled")
                require(cash["owner_exception_month"] is exception and cash["conditional_fee_not_bought"] is exception,
                        "Only the Apple fee month is the owner's exception month")
                require(D(cash["cash_usd_before_tax_card_fx"]) == cash_usd, "Cash USD must add the full due invoice and no amortisation")
                require(D(cash["cash_gbp"]) == amount.quantize(D(".01")), "Cash GBP timing mismatch")
                expected = flags(amount, owner)
                require(cash["within_70_operating"] == expected["within_70_operating"], "Cash operating flag mismatch")
                require(cash["within_100_ceiling"] == expected["within_100_ceiling"], "Cash ceiling flag mismatch")
                for label in ("warn", "reduce", "pause"):
                    require(cash["thresholds_reached"][label] == expected["thresholds_reached"][label], "Cash alert threshold mismatch: " + label)
                if exception:
                    check_remainder(cash, due * f, (cash_usd - due) * f, owner)
                require(cash["scenario_only_not_purchase"] is True, "Cash example cannot imply a purchase")
                key = (result["scenario"], result["region"], variant["data_option"], variant["credit_scenario"], variant["fx_scenario"], cash["timing"])
                require(key not in results, "Duplicate cash variant")
                results[key] = cash
                counts["cash_variants"] += 1
    require(counts == {"run_rate_variants": 108, "cash_variants": 216}, "Run-rate/cash coverage changed")
    base = ("baseline", "us-east-1")
    tail = ("no_verified_credit_optional_claude_blocked", "central")
    for data, timing, expected, within70, within100 in (
        ("Grow377_displayed", "ordinary_month", "94.48", False, True),
        ("Grow377_displayed", "apple_fee_exception_month", "189.52", False, False),
        ("Grow55_support_candidate", "ordinary_month", "46.48", True, True),
        ("Grow55_support_candidate", "apple_fee_exception_month", "141.52", False, False),
    ):
        cash = results[base + (data,) + tail + (timing,)]
        require(cash["cash_gbp"] == expected and cash["within_70_operating"] is within70 and cash["within_100_ceiling"] is within100,
                "Independent Virginia known answer mismatch")

    # Telemetry is confirmed inside the AWS total, never added again.
    virginia = next(r for r in model["results"] if r["scenario"] == "baseline" and r["region"] == "us-east-1")
    telemetry = sum((D(line["quantity"]) * D(line["usd_rate"]) for env in virginia["environment_costs"].values()
                     for line in env["line_items"] if line["name"] in TELEMETRY_LINES), D(0))
    require(decisions["telemetry"]["added_again"] is False and D(decisions["telemetry"]["virginia_usd"]) == telemetry.quantize(D(".0001")),
            "Telemetry must be the AWS total's own lines, not a second line")

    # Expected months for the owner's selection: Virginia, Grow 55, Claude off or option A, scan cap, Apple month.
    gross_a = option_a_gross(model)
    require(gross_a == D(model["claude_option_a"]["gross_usd"]) == D("8.5875"), "Claude option A gross mismatch")
    expected_months = model["expected_months_owner_selection"]
    require(D(expected_months["aws_usd"]) == D(virginia["aws_usd_total"]) and D(expected_months["scan_allowance_max_gbp"]) == SCAN_CAP_GBP,
            "Expected-month inputs mismatch")
    seen = set()
    for month in expected_months["months"]:
        claude = gross_a if month["claude"] == "claude_option_a" else D(0)
        due = APPLE_USD if month["timing"] == "apple_fee_exception_month" else D(0)
        scan_gbp = SCAN_CAP_GBP if month["scan"] == "with_scan_allowance_cap" else D(0)
        amount = (D(virginia["aws_usd_total"]) + data_prices["Grow55_support_candidate"] + claude + due) * factor(fx_inputs[month["fx_scenario"]]) + scan_gbp
        require(D(month["cash_gbp"]) == amount.quantize(D(".01")), "Expected month mismatch")
        require({k: month[k] for k in ("within_70_operating", "within_100_ceiling", "thresholds_reached")} == flags(amount, owner),
                "Expected month flag mismatch")
        if due:
            check_remainder(month, due * factor(fx_inputs[month["fx_scenario"]]),
                            amount - due * factor(fx_inputs[month["fx_scenario"]]), owner)
        seen.add((month["fx_scenario"], month["claude"], month["timing"], month["scan"]))
    require(len(seen) == len(expected_months["months"]) == 16, "Expected-month coverage changed")
    by_key = {(m["fx_scenario"], m["claude"], m["timing"], m["scan"]): m["cash_gbp"] for m in expected_months["months"]}
    for claude, scan_label, value in (("claude_off", "without_scan", "46.48"), ("claude_off", "with_scan_allowance_cap", "51.48"),
                                      ("claude_option_a", "without_scan", "54.73"), ("claude_option_a", "with_scan_allowance_cap", "59.73")):
        require(by_key[("central", claude, "ordinary_month", scan_label)] == value, "Expected month known answer mismatch")
    return counts


def self_test(model: dict, reservation: dict) -> int:
    """Mutations are in-memory only and must fail for their specific invariant."""
    rejected = 0
    for mutation, expected in (
        ("amortised_invoice", "Exception month must carry the full annual"),
        ("missing_due_fee", "Exception month must carry the full annual"),
        ("old_cash_amount", "Cash GBP timing mismatch"),
        ("wrong_ceiling_flag", "Cash ceiling flag mismatch"),
        ("wrong_threshold", "Cash alert threshold mismatch"),
        ("missing_invoice", "Both distinct cash timing variants"),
        ("legacy_cash_label", "Amortised run rate must not be called cash"),
        ("domain_line_restored", "no domain line may carry cost"),
        ("domain_cash_in_month", "no domain cash in any month"),
        ("domain_assumption_revived", "domain allowance must stay retired"),
        ("exception_on_ordinary_month", "Only the Apple fee month"),
        ("exception_remainder_flag", "Exception month remainder flag mismatch"),
        ("exception_remainder_threshold", "Exception month remainder threshold mismatch"),
        ("exception_remainder_missing", "Exception month remainder fields missing"),
        ("expected_month_remainder_edited", "Exception month remainder mismatch"),
        ("expected_month_full_flags_relaxed_to_remainder", "Expected month flag mismatch"),
        ("apple_fee_changed", "Apple fee changed"),
        ("github_paid", "GitHub Actions is planned inside the free allowance"),
        ("scan_cap_raised", "Scan allowance must stay at most GBP5"),
        ("expected_month_edited", "Expected month mismatch"),
        ("option_a_gross_edited", "Claude option A gross mismatch"),
        ("telemetry_added_again", "Telemetry must be the AWS total's own lines"),
    ):
        changed = copy.deepcopy(model)
        result = changed["results"][0]
        variant = next(v for v in result["all_in_run_rate_variants"] if v["data_option"] == "Grow377_displayed" and v["credit_scenario"] == "no_verified_credit_optional_claude_blocked" and v["fx_scenario"] == "central")
        ordinary = next(c for c in variant["cash_timing_variants"] if c["timing"] == "ordinary_month")
        annual = next(c for c in variant["cash_timing_variants"] if c["timing"] == "apple_fee_exception_month")
        assumptions = {a["id"]: a for a in changed["estimate_assumptions"]}
        if mutation == "amortised_invoice":
            annual["due_annual_usd"] = "8.25"
        elif mutation == "missing_due_fee":
            annual["due_annual_usd"] = "0"
        elif mutation == "old_cash_amount":
            annual["cash_gbp"] = variant["monthly_run_rate_gbp"]
        elif mutation == "wrong_ceiling_flag":
            annual["within_100_ceiling"] = True
        elif mutation == "wrong_threshold":
            annual["thresholds_reached"]["pause"] = False
        elif mutation == "missing_invoice":
            variant["cash_timing_variants"].remove(annual)
        elif mutation == "legacy_cash_label":
            variant["cash_gbp"] = variant["monthly_run_rate_gbp"]
        elif mutation == "domain_line_restored":
            line = next(li for li in result["environment_costs"]["prod"]["line_items"] if li["name"] == "domain_registration_allowance")
            line["quantity"], line["usd_cost"] = "1", "1.25"
        elif mutation == "domain_cash_in_month":
            ordinary["due_domain_usd"] = "15"
        elif mutation == "domain_assumption_revived":
            assumptions["EST-COST-DOMAIN"]["status"] = "proposed"
        elif mutation == "exception_on_ordinary_month":
            ordinary["owner_exception_month"] = True
        elif mutation == "exception_remainder_flag":
            annual["remaining_within_100_ceiling"] = False
        elif mutation == "exception_remainder_threshold":
            annual["remaining_thresholds_reached"]["pause"] = not annual["remaining_thresholds_reached"]["pause"]
        elif mutation == "exception_remainder_missing":
            del annual["remaining_thresholds_reached"]
        elif mutation == "expected_month_remainder_edited":
            apple_month = next(m for m in changed["expected_months_owner_selection"]["months"] if m["timing"] == "apple_fee_exception_month")
            apple_month["remaining_cash_gbp_excluding_exception_fee"] = apple_month["cash_gbp"]
        elif mutation == "expected_month_full_flags_relaxed_to_remainder":
            apple_month = next(m for m in changed["expected_months_owner_selection"]["months"] if m["timing"] == "apple_fee_exception_month")
            apple_month["thresholds_reached"] = dict(apple_month["remaining_thresholds_reached"])
        elif mutation == "apple_fee_changed":
            assumptions["EST-COST-APPLE"]["annual_usd"] = "79"
        elif mutation == "github_paid":
            assumptions["EST-COST-GITHUB"]["monthly_usd"] = "3.12"
        elif mutation == "scan_cap_raised":
            assumptions["EST-COST-SCAN"]["max_gbp_per_month"] = "6"
        elif mutation == "expected_month_edited":
            changed["expected_months_owner_selection"]["months"][1]["cash_gbp"] = "46.48"
        elif mutation == "option_a_gross_edited":
            changed["claude_option_a"]["gross_usd"] = "6.0875"
        else:
            changed["owner_cost_decisions"]["telemetry"]["added_again"] = True
        try:
            check_model(changed)
        except ValueError as error:
            require(expected in str(error), "Mutation refused for wrong reason: " + mutation + ": " + str(error))
            rejected += 1
        else:
            raise ValueError("Mutation incorrectly passed: " + mutation)
    for path, value, expected in (
        (("basis",), "amortised_run_rate", "invoice-month cash"),
        (("amortisation_is_cash",), True, "Amortisation cannot satisfy"),
        (("reserve_full_due_fixed_commitments",), False, "Full due fixed commitments"),
        (("unknown_due_date_or_invoice_blocks_new_commitment",), False, "Unknown invoice timing"),
        (("exception_month", "months_per_year"), 2, "Only the Apple fee month"),
        (("exception_month", "other_lines_must_fit"), False, "Apple fee only"),
        (("scan_allowance_max_gbp",), "10", "Scan allowance"),
    ):
        changed = copy.deepcopy(reservation)
        target = changed["cash_admission"]
        for key in path[:-1]:
            target = target[key]
        target[path[-1]] = value
        try:
            check_cash_admission(changed)
        except ValueError as error:
            require(expected in str(error), "Cash admission mutation refused for wrong reason: " + ".".join(path))
            rejected += 1
        else:
            raise ValueError("Cash admission mutation incorrectly passed: " + ".".join(path))
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
