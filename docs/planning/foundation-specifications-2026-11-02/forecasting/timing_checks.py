"""Offline synthetic specification proofs; no application runtime or live acquisition.

Run with python3 <this file> [--check daily|event|all]. Explicit exceptions keep
the refusal checks active with python -O. Policy numbers remain owner-pending.
"""

import argparse
import json
from datetime import datetime, timedelta
from pathlib import Path

BASE = Path(__file__).resolve().parent


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def instant(value: str) -> datetime:
    result = datetime.fromisoformat(value.replace("Z", "+00:00"))
    require(result.tzinfo is not None, "timestamp must be timezone aware")
    return result


def daily_result(policy: dict, case: dict) -> str:
    """Apply the four frozen clocks to one artificial acquisition attempt."""
    close = instant(case["close"])
    start = close + timedelta(minutes=policy[case["attempt"] + "_minutes_after_close"])
    cutoff = close + timedelta(minutes=policy["information_cutoff_minutes_after_close"])
    deadline = close + timedelta(minutes=policy["issuance_deadline_minutes_after_close"])
    next_open = instant(case["next_open"])
    if deadline >= next_open:
        return "unsupported_schedule_abstain"
    known = max(instant(case["published_at"]), instant(case["ingested_at"]))
    require(instant(case["ingested_at"]) > start, "fixture must exercise positive collection latency")
    if known > cutoff:
        return "late_input_abstain"
    issued = instant(case["issued_at"])
    if not cutoff <= issued <= deadline or issued >= next_open:
        return "missed_origin"
    return "issued"


def event_result(modes: dict, case: dict) -> str:
    """Classify release content against a daily prediction or descriptive study."""
    mode = modes[case["mode"]]
    cutoff = instant(case["cutoff"])
    if case["mode"] == "retrospective_event_study":
        require(mode["predictive_qualification_eligible"] is False, "event studies cannot qualify predictive features")
        return "descriptive_only"
    if case["input_kind"] not in mode["allowed_input_kinds"]:
        return "forbidden_feature"
    if instant(case["input_known_at"]) > cutoff:
        return "future_input_rejected"
    if case["mode"] == "prerelease_daily_prediction" and cutoff >= instant(case["release_known_at"]):
        return "not_prerelease_cutoff"
    if case["mode"] == "postrelease_daily_prediction":
        require(mode["requires_subsequent_daily_origin"] is True, "postrelease mode must wait for later daily origin")
        if instant(case["origin_at"]) <= instant(case["release_known_at"]):
            return "earlier_origin_rejected"
        require(case["target_start_at"] == case["origin_at"], "postrelease target cannot retain earlier-close start")
    return "predictive_input_eligible"


def verify_daily_origin_clock_contract() -> int:
    policy = json.loads((BASE / "task-catalogue.json").read_text())["origin_policy"]["daily_clocks_proposed"]
    require(policy["status"] == "owner_pending", "four-clock timings cannot imply owner approval")
    values = [policy[k] for k in ("collection_start_minutes_after_close", "retry_start_minutes_after_close", "information_cutoff_minutes_after_close", "issuance_deadline_minutes_after_close")]
    require(values == [15, 40, 60, 75], "reviewed four-clock proposal changed; revise proof explicitly")
    require(policy["known_at_rule"] == "max_evidenced_publication_actual_ingestion", "ingestion availability must remain conservative")
    data_text = (BASE.parent / "data/specification.md").read_text()
    science_text = (BASE / "forecasting-specification.md").read_text()
    require(policy["id"] in data_text and policy["id"] in science_text, "data/science must name the same four-clock contract")
    for phrase in ("collection starts at +15 minutes", "retry starts at +40 minutes", "cutoff freezes at +60 minutes", "complete by +75 minutes"):
        require(phrase in data_text, "data four-clock policy drift: " + phrase)
    cases = json.loads((BASE / "timing-examples.json").read_text())["daily_cases"]
    require({c["id"] for c in cases} == {"ordinary_positive_latency", "retry_positive_latency", "late_ingestion", "late_publication", "late_issue", "next_open_conflict"}, "required daily timing cases missing")
    for case in cases:
        require(daily_result(policy, case) == case["expected"], "daily timing mismatch: " + case["id"])
    return len(cases)


def verify_event_availability_contract() -> int:
    module = json.loads((BASE / "model-catalogue.json").read_text())["event_module_proposed"]
    modes = module["modes"]
    require(modes["prerelease_daily_prediction"]["allowed_input_kinds"] == ["public_schedule"], "prerelease content leakage")
    require(modes["postrelease_daily_prediction"]["allowed_input_kinds"] == ["public_release_fields"], "postrelease input contract changed")
    require(module["new_intraday_forecast_or_acquisition_authorised"] is False, "event capability cannot implicitly authorise intraday work")
    cases = json.loads((BASE / "timing-examples.json").read_text())["event_cases"]
    required = {"prerelease_schedule", "schedule_published_later", "cutoff_after_release", "before_open_content_at_prior_close", "late_after_close_content_at_prior_close", "postrelease_earlier_origin", "postrelease_next_daily_origin", "retrospective_prior_close"}
    require({c["id"] for c in cases} == required, "required event timing cases missing")
    for case in cases:
        require(event_result(modes, case) == case["expected"], "event timing mismatch: " + case["id"])
    # Negative target-join proof: even otherwise eligible postrelease content
    # cannot keep the earlier close as its outcome starting valuation.
    bad = dict(next(c for c in cases if c["id"] == "postrelease_next_daily_origin"))
    bad["target_start_at"] = "2026-11-02T21:00:00Z"
    try:
        event_result(modes, bad)
    except ValueError as exc:
        require("target cannot retain earlier-close" in str(exc), "wrong target refusal")
    else:
        raise ValueError("earlier-close postrelease target accepted")
    return len(cases) + 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", choices=("daily", "event", "all"), default="all")
    selected = parser.parse_args().check
    result = {}
    if selected in ("daily", "all"):
        result["daily_cases"] = verify_daily_origin_clock_contract()
    if selected in ("event", "all"):
        result["event_cases_including_negative_target"] = verify_event_availability_contract()
    print(json.dumps({"status": "offline_specification_proofs_passed", **result}))
