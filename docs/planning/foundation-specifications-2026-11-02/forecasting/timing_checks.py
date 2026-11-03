"""Offline synthetic specification proofs; no application runtime or live acquisition.

Run with python3 <this file> [--check daily|event|policy|selftest|all]. Explicit
exceptions keep the refusal checks active with python -O. The daily clocks remain
owner-pending; policy checks hold the owner's 3 Nov 2026 numbers and the SCI-D09
answers (ETF lists one per market; ranking horizons per component, daily cadence and
Nasdaq-100 tech, MP-177; SCI-D09 closed with its tie-break a stated proposal) against the records
and run synthetic band, overlay, trial-count and slip cases whose readings are
proposed (SCI-D03, SCI-D07, SCI-D10). The selftest mutates copies and proves the
policy gate refuses each fault.
"""

import argparse
import copy
import hashlib
import json
import re
from datetime import datetime, timedelta
from decimal import Decimal
from pathlib import Path

BASE = Path(__file__).resolve().parent
DECISION_LOG = BASE.parents[1] / "ma-reconciliation-2026-11-02" / "decision-log.md"


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


# ---------------------------------------------------------------------------
# Owner policy numbers (decision log, 3 Nov 2026) and their synthetic cases.

OWNER = {
    "probability_points_per_week": 5,
    "signal_weight_fraction_per_month": Decimal("0.10"),
    "trial_weeks": 8,
    "trial_comparators": ["base_rate", "current_rules"],
    "unscoreable_reasons": ["data_outage", "holiday_week"],
    "unscoreable_phrase": ("A week that cannot be scored (a data outage, a holiday week) pauses the 8-week trial count; "
                           "the trial still needs 8 scored weeks."),
    "probation_weeks": 4,
    "probation_bad_weeks": 2,
    "slip_bad_weeks": 4,
    "similar_days_since": "2015",
    "event_kind_ids": {"EV-RATE", "EV-INFL", "EV-TARIFF", "EV-CONFLICT", "EV-EARN", "EV-OPEC", "EV-ELECT"},
    "event_markets": ["US", "UK", "India"],
    "top_n": 5,
    "ranking_weights": {"growth": Decimal("0.35"), "protection": Decimal("0.40"), "opportunity": Decimal("0.25")},
    "discovery_universe_about": 150,
    "etf_owner_words": "ETFs (US, UK and India)",
    "etf_markets": ["India", "UK", "US"],
    "etf_fixed_lists": ["US ETFs", "UK ETFs", "India ETFs"],
    # SCI-D09, owner 3 Nov 2026 (MP-177): one phrase each, copied word for word into every record.
    "ranking_horizon_words": "3 to 12 months (Recommended)",
    "ranking_horizon_phrase": ("Growth and protection come from the 3, 6 and 12-month forecasts; "
                               "short horizons feed only the opportunity part"),
    "ranking_long_horizons": ["H-M03", "H-M06", "H-M12"],
    "ranking_short_horizons": ["H-S01", "H-S05", "H-S10", "H-S20"],
    "ranking_cadence_words": "Daily, Nasdaq-100 tech (Recommended)",
    "ranking_cadence_phrase": "The lists are re-ranked after each daily forecast run",
    "us_tech_membership": "the technology names in the Nasdaq-100",
    "us_tech_phrase": "US tech means the technology names in the Nasdaq-100",
    "d09_status": "closed_owner_answered_2026-11-03",
}
# Each number above is anchored to the owner's own words; whitespace is normalised so a
# phrase split over a line break still matches.
DECISION_LOG_PHRASES = (
    "Event kinds in the first event wave: all of them",
    "Similar-days history: since 2015",
    "may shift at most 5 percentage points a week",
    "may change at most 10% a month",
    "8 weeks in shadow, beating both the base rate and the rules",
    "worse than the previous approved one for 4 weeks running",
    "(a data outage, a holiday week) pauses the 8-week trial count; the trial still needs 8 scored weeks",
    "on probation for its first 4 live weeks and reverts after 2 bad weeks instead of 4",
    "a curated list of about 150 names",
    "ETFs (US, UK and India)",
    "\"One list per market (Recommended)\". A top 5 for US ETFs, one for UK ETFs and one for India ETFs",
    "\"3 to 12 months (Recommended)\". Growth and protection come from the 3, 6 and 12-month forecasts; short horizons feed only the opportunity part",
    "\"Daily, Nasdaq-100 tech (Recommended)\". The lists are re-ranked after each daily forecast run, and US tech means the technology names in the Nasdaq-100",
)
PREDICATES = {
    # Every reason form the gate can read. The owner names only the first two; the third is the
    # maker phrase removed in MP-20 round 2 (R2-S1), kept readable so its return is refused.
    "data_outage": lambda week: at(week, "data_outage") is True,
    "holiday_week": lambda week: at(week, "holiday_week") is True,
    "no_matured_shadow_forecasts": lambda week: at(week, "matured_paired") == 0,
}


def at(doc, *path):
    """Fail-closed lookup: a missing key is a refusal, never a skip."""
    for key in path:
        if not isinstance(doc, dict) or key not in doc:
            raise ValueError("missing record field: " + "/".join(str(p) for p in path))
        doc = doc[key]
    return doc


def load_docs() -> dict:
    pack = BASE.parent
    return {
        "model": json.loads((BASE / "model-catalogue.json").read_text()),
        "protocol": json.loads((BASE / "evaluation-protocol.json").read_text()),
        "tasks": json.loads((BASE / "task-catalogue.json").read_text()),
        "examples": json.loads((BASE / "timing-examples.json").read_text()),
        "decisions": json.loads((BASE / "open-decisions.json").read_text()),
        "fixed": json.loads((pack / "fixed-policies.json").read_text()),
        "spec": (BASE / "forecasting-specification.md").read_text(),
        "log": " ".join(DECISION_LOG.read_text().split()),
    }


def verify_owner_numbers(docs: dict) -> int:
    log = docs["log"]
    for phrase in DECISION_LOG_PHRASES:
        require(phrase in log, "decision log no longer says: " + phrase)
    model, protocol, tasks = docs["model"], docs["protocol"], docs["tasks"]
    fixed = at(docs["fixed"], "forecasts", "owner_answers_2026_11_03")
    bsc = at(model, "bounded_self_correction")
    bands = at(bsc, "bands")
    points = OWNER["probability_points_per_week"]
    require(at(bands, "probability_shift_max_percentage_points_per_week") == points
            and at(fixed, "self_correction", "max_probability_shift_points_per_week") == points,
            "probability band differs from the owner's 5 points a week")
    fraction = OWNER["signal_weight_fraction_per_month"]
    require(Decimal(str(at(bands, "signal_weight_change_max_fraction_per_month"))) == fraction
            and Decimal(str(at(fixed, "self_correction", "max_signal_weight_change_per_month"))) == fraction,
            "signal weight band differs from the owner's 10% a month")
    require("combined-score weights (FIN-OD-07)" in at(bsc, "may_not_adjust"),
            "self-correction may touch the combined-score weights")
    require(sorted(at(bsc, "adjustment_targets_allowed")) == ["calibration_overlay", "signal_weight"],
            "self-correction targets widened")
    require({"overlay_version", "data_cutoff", "fitted_outcome_set_hash"} <= set(at(bsc, "overlay_provenance_fields")),
            "overlay provenance lacks its version, data cutoff or outcome-set hash")
    trial = at(protocol, "live_trial")
    require(at(trial, "scored_weeks_required") == OWNER["trial_weeks"] and at(fixed, "shadow_trial_weeks") == OWNER["trial_weeks"],
            "trial weeks differ from the owner's 8")
    require(at(trial, "must_beat") == OWNER["trial_comparators"], "trial comparators differ from base rate and current rules")
    require(at(trial, "unscoreable_week_reasons") == OWNER["unscoreable_reasons"],
            "unscoreable reasons differ from the owner's (a data outage, a holiday week)")
    phrase = OWNER["unscoreable_phrase"]
    require(at(trial, "unscoreable_week") == phrase and at(fixed, "unscoreable_week") == phrase
            and phrase in " ".join(docs["spec"].split()),
            "unscoreable-week rule is not one phrase across spec, protocol and fixed policies")
    for name, text in (("spec", " ".join(docs["spec"].split())), ("protocol", json.dumps(protocol))):
        require("no matured shadow forecasts" not in text, "trial count still pauses for unmatured forecasts: " + name)
    slip = at(protocol, "probation_and_slip")
    require(at(slip, "probation_live_weeks") == OWNER["probation_weeks"] and at(fixed, "probation_weeks") == OWNER["probation_weeks"],
            "probation weeks differ from the owner's 4")
    require(at(slip, "bad_weeks_to_revert_on_probation") == OWNER["probation_bad_weeks"]
            and at(fixed, "probation_revert_after_bad_weeks") == OWNER["probation_bad_weeks"],
            "probation bad weeks differ from the owner's 2")
    require(at(slip, "slip_bad_weeks_running") == OWNER["slip_bad_weeks"] and "4 weeks running" in at(fixed, "slipping"),
            "slip weeks differ from the owner's 4 running")
    window = at(model, "analogs_proposed", "candidate_origin_window")
    since = OWNER["similar_days_since"]
    require(since + "-01-01" in at(window, "start") and at(fixed, "similar_days_since") == since,
            "similar-days start differs from the owner's 2015")
    events = at(model, "event_module_proposed")
    kinds = at(events, "first_wave_event_kinds")
    require(len(kinds) == 7 and {at(k, "id") for k in kinds} == OWNER["event_kind_ids"] and len(at(fixed, "event_wave_one")) == 7,
            "event kinds differ from the owner's seven")
    modes = at(events, "modes")
    for kind in kinds:
        require(at(kind, "markets") == OWNER["event_markets"], "event markets differ from US, UK and India: " + kind["id"])
        schedule = at(kind, "schedule")
        require(isinstance(schedule, str) and schedule.startswith(("scheduled", "unscheduled")),
                "event kind schedule unreadable: " + kind["id"])
        applicable = at(kind, "applicable_modes")
        require(applicable and all(mode in modes for mode in applicable), "unknown event mode: " + kind["id"])
        if schedule.startswith("unscheduled"):
            require("prerelease_daily_prediction" not in applicable, "unscheduled kind has prerelease mode: " + kind["id"])
    ranking = at(tasks, "forecast_universe_and_ranking")
    require(at(ranking, "top_n_per_segment") == OWNER["top_n"], "top-5 count differs from the owner's 5")
    weights = {k: Decimal(str(v)) for k, v in at(ranking, "ranking_weights").items()}
    require(weights == OWNER["ranking_weights"] and sum(weights.values()) == 1, "ranking weights differ from 35/40/25")
    require(at(ranking, "discovery_universe_size_about") == OWNER["discovery_universe_about"]
            and "about 150" in at(docs["fixed"], "ranking", "owner_answers_2026_11_03", "discovery_universe"),
            "discovery universe differs from about 150 names")
    names = [at(s, "name") for s in at(ranking, "segments")]
    require(not any("FTSE" in n for n in names), "a UK FTSE top-5 segment was added")
    require("US tech" in names, "US tech segment is not named as the owner named it")
    verify_etf_lists(docs, ranking)
    ranking_checks = verify_ranking_answers(docs, ranking)
    return len(DECISION_LOG_PHRASES) + len(kinds) + 23 + ranking_checks + verify_open_questions_held(docs)


def verify_etf_lists(docs: dict, ranking: dict) -> None:
    """SCI-D09, owner 3 Nov 2026: ETFs (US, UK and India) are one top-5 list per market."""
    etfs = [s for s in at(ranking, "segments") if "ETF" in at(s, "id") + at(s, "name")]
    require(len(etfs) == 3 and sorted(at(s, "market") for s in etfs) == OWNER["etf_markets"],
            "ETF segments are not one list per market (US, UK, India)")
    require(at(ranking, "etf_segments", "owner_words") == OWNER["etf_owner_words"]
            and sorted(at(ranking, "etf_segments", "ids")) == sorted(at(s, "id") for s in etfs),
            "ETF segments lose the owner's words or their ids")
    fixed = at(docs["fixed"], "ranking", "owner_answers_2026_11_03")
    require([n for n in at(fixed, "top5_per_segment") if "ETF" in n] == OWNER["etf_fixed_lists"]
            and OWNER["etf_owner_words"] in at(fixed, "etf_segments"),
            "fixed policies' ETF lists are not one per market")


# Every phrasing that presented SCI-D09's answered items as open or proposed (lesson 3), read in
# every live record; superseded notes keep the old wording on purpose and are left out.
STALE_RANKING_PHRASINGS = (
    re.compile(r"D09[^.;\"]{0,20}partly answered", re.IGNORECASE),
    re.compile(r"Nasdaq-100[^.;\"]{0,30}proposed|proposed[^.;\"]{0,30}Nasdaq-100", re.IGNORECASE),
    re.compile(r"membership_proposed"),
    re.compile(r"horizons FIN-OD-07 names", re.IGNORECASE),
)


def without_superseded(value):
    if isinstance(value, dict):
        return {k: without_superseded(v) for k, v in value.items() if not k.startswith("superseded")}
    if isinstance(value, list):
        return [without_superseded(v) for v in value]
    return value


def verify_ranking_answers(docs: dict, ranking: dict) -> int:
    """SCI-D09, owner 3 Nov 2026 (MP-177): horizons per component, daily cadence after issuance, Nasdaq-100 tech."""
    known = {at(h, "id") for h in at(docs["tasks"], "horizons")}
    long_horizons, short_horizons = OWNER["ranking_long_horizons"], OWNER["ranking_short_horizons"]
    require(set(long_horizons + short_horizons) <= known, "ranking horizon ids are not catalogue horizons")
    horizons = at(ranking, "ranking_horizons")
    require(at(horizons, "owner_words") == OWNER["ranking_horizon_words"] and str(at(horizons, "status")).startswith("owner_selected"),
            "ranking horizons lose the owner's words or owner-selected status")
    for component in ("growth", "protection"):
        require(at(horizons, component) == long_horizons,
                "ranking horizons differ from the owner's 3, 6 and 12 months: " + component)
    require(at(horizons, "short_horizons") == short_horizons and at(horizons, "short_horizons_feed_only") == ["opportunity"],
            "short horizons feed more than the opportunity part")
    cadence = at(ranking, "ranking_cadence")
    require(at(cadence, "cadence") == "daily" and at(cadence, "runs_after") == "each daily forecast run's issuance"
            and at(cadence, "owner_words") == OWNER["ranking_cadence_words"] and str(at(cadence, "status")).startswith("owner_selected"),
            "ranking cadence differs from the owner's daily re-rank after each forecast run")
    tech = [s for s in at(ranking, "segments") if at(s, "id") == "SEG-US-TECH"]
    require(len(tech) == 1 and at(tech[0], "membership") == OWNER["us_tech_membership"]
            and str(at(tech[0], "membership_status")).startswith("owner_selected"),
            "US tech membership differs from the technology names in the Nasdaq-100")
    tie = at(ranking, "tie_break")
    require(at(tie, "status") == "proposed_not_put_to_owner" and "listing identifier" in at(tie, "rule"),
            "tie-break presented as the owner's answer or lost")
    require(not any("SCI-D09" in item for item in at(ranking, "open")), "ranking still lists SCI-D09 as open")
    d09 = next(c for c in at(docs["decisions"], "material_choices") if at(c, "id") == "SCI-D09")
    fixed = at(docs["fixed"], "ranking", "owner_answers_2026_11_03")
    records = {
        "spec": " ".join(docs["spec"].split()),
        "task-catalogue": json.dumps(ranking),
        "fixed-policies": json.dumps([at(fixed, "ranking_horizons"), at(fixed, "ranking_cadence"), at(fixed, "us_tech_membership")]),
        "SCI-D09": at(d09, "recommendation"),
    }
    for name, text in records.items():
        for key in ("ranking_horizon_phrase", "ranking_cadence_phrase", "us_tech_phrase"):
            require(OWNER[key] in text, "owner's ranking answer is not one phrase across records: " + key + " in " + name)
    live = {
        "spec": records["spec"],
        "task-catalogue": json.dumps(docs["tasks"]),
        "fixed-policies": json.dumps(at(docs["fixed"], "ranking")),
        "open-decisions": json.dumps(without_superseded(docs["decisions"])),
    }
    for name, text in live.items():
        for pattern in STALE_RANKING_PHRASINGS:
            require(not pattern.search(text), "SCI-D09 answer still presented as open or proposed in " + name + ": " + pattern.pattern)
    return 9 + len(records) * 3 + len(live) * len(STALE_RANKING_PHRASINGS)


def verify_open_questions_held(docs: dict) -> int:
    """Maker proposals that need an owner choice stay marked proposed and recorded as open questions."""
    trial = at(docs["protocol"], "live_trial")
    require(at(trial, "rules_proper_score", "status") == "proposed_open_in_SCI-D03" and at(trial, "beat_meaning").startswith("proposed"),
            "rules proper score presented as settled")
    require(at(trial, "scored_week_by_horizon", "status") == "proposed_open_in_SCI-D03"
            and "SCI-D03" in at(trial, "long_horizon_calibration_check"),
            "scored week or long-horizon calibration presented as settled")
    bsc = at(docs["model"], "bounded_self_correction")
    for key in ("point_in_time_rule", "walk_forward_replay"):
        require("cutoff" in at(bsc, key), "overlay point-in-time rule missing: " + key)
    require("SCI-D10" in at(bsc, "promotion_and_revert") and at(bsc, "rollback_detection_by_horizon", "status") == "proposed_open_in_SCI-D10"
            and "SCI-D10" in at(bsc, "bands", "reading"), "self-correction readings presented as settled")
    choices = {at(c, "id"): c for c in at(docs["decisions"], "material_choices")}
    require(set(choices) == {"SCI-D%02d" % n for n in range(1, 11)}, "material choices are not SCI-D01 to SCI-D10")
    for choice in choices.values():
        if at(choice, "status") == "partly_answered":
            require(at(choice, "answered_by") and at(choice, "still_open"), "partly answered without answered_by or still_open: " + choice["id"])
    d05 = choices["SCI-D05"]
    require("live calibration" not in at(d05, "recommendation") and "automatic learning" not in at(d05, "why_owner_material")
            and at(d05, "superseded_2026_11_03", "superseded") and at(d05, "superseded_2026_11_03", "kept"),
            "SCI-D05 still recommends against the owner's self-correction or revert")
    require(at(choices["SCI-D10"], "status") == "owner_pending", "SCI-D10 is not an open owner question")
    d09 = choices["SCI-D09"]
    answered = at(d09, "answered_by")
    require(at(d09, "status") == OWNER["d09_status"] and "SCI-OA-10" in answered,
            "SCI-D09 does not record the owner's ETF answer and is not closed")
    require("SCI-OA-11" in answered and any("MP-177" in str(a) for a in answered),
            "SCI-D09 does not record the owner's ranking answers (SCI-OA-11, MP-177)")
    answers = {at(a, "id"): a for a in at(docs["decisions"], "owner_answers_2026_11_03")}
    require("SCI-OA-11" in answers and at(answers["SCI-OA-11"], "decides") == ["SCI-D09"], "SCI-OA-11 does not hold the owner's ranking answers")
    oa11 = answers["SCI-OA-11"]
    require(OWNER["ranking_horizon_words"] in at(oa11, "scope") and OWNER["ranking_cadence_words"] in at(oa11, "scope")
            and "MP-177" in at(oa11, "source"), "SCI-OA-11 does not hold the owner's ranking answers")
    still_open = at(d09, "still_open")
    require(still_open.startswith("Nothing the owner must decide.") and "Stated proposal, not put to the owner:" in still_open,
            "SCI-D09 is closed but does not say nothing is left for the owner")
    settled, proposal = still_open.split("Stated proposal, not put to the owner:", 1)
    for key in ("ranking inputs and horizons", "cadence", "US tech membership"):
        require(key in settled, "SCI-D09 does not account for the ranking question: " + key)
    require("tie-break" in proposal and "tie-break" not in settled, "SCI-D09 does not account for the ranking question: tie-break")
    mp177 = at(d09, "superseded_2026_11_03_mp177")
    require(at(mp177, "recommendation_was") and at(mp177, "superseded") and at(mp177, "kept") and at(mp177, "date") == "2026-11-03",
            "SCI-D09's superseded proposal is not kept under a dated note naming what it supersedes")
    for key in ("rules get a proper score", "scored week is for each horizon", "calibrated on what has matured"):
        require(key in at(choices["SCI-D03"], "still_open"), "SCI-D03 does not hold the open trial question: " + key)
    return 10


def trial_result(trial: dict, case: dict) -> str:
    """Count trial weeks: only the owner's reasons pause; maturity delays the verdict, not the count."""
    reasons = at(trial, "unscoreable_week_reasons")
    for reason in reasons:
        require(reason in PREDICATES, "unreadable unscoreable reason: " + str(reason))
    required = at(trial, "scored_weeks_required")
    counted, elapsed = [], 0
    for week in at(case, "weeks"):
        elapsed += 1
        if any(PREDICATES[reason](week) for reason in reasons):
            continue
        if at(week, "clean") is not True:
            return "failed_not_clean@" + str(elapsed)
        counted.append(week)
        if len(counted) == required:
            break
    if len(counted) < required:
        return "incomplete@" + str(elapsed)
    if at(case, "horizon_unit") == "calendar_month":
        return "complete_walk_forward_and_owner@" + str(elapsed)
    require(at(case, "horizon_unit") == "valuation_session", "unknown horizon unit")
    if not all(at(week, "origins_matured") is True for week in counted):
        return "awaiting_maturity@" + str(elapsed)
    return "complete_score_comparators@" + str(elapsed)


def slip_result(slip: dict, case: dict) -> str:
    """Bad weeks running; an unscoreable week neither counts nor breaks the run (proposed)."""
    probation, probation_bad, slip_bad = (at(slip, "probation_live_weeks"), at(slip, "bad_weeks_to_revert_on_probation"),
                                          at(slip, "slip_bad_weeks_running"))
    run, live_week = 0, at(case, "first_live_week") - 1
    for index, week in enumerate(at(case, "weeks"), 1):
        live_week += 1
        require(week in ("bad", "good", "unscoreable"), "unknown week verdict: " + str(week))
        if week == "unscoreable":
            continue
        if week == "good":
            run = 0
            continue
        run += 1
        if run >= (probation_bad if live_week <= probation else slip_bad):
            return ("revert" if at(case, "previous_eligible") is True else "pause_policy_003") + "@" + str(index)
    return "no_revert"


def band_result(bsc: dict, case: dict) -> str:
    """Cumulative change against the value at the start of any rolling window (reading proposed, SCI-D10)."""
    if at(case, "target") not in at(bsc, "adjustment_targets_allowed"):
        return "outside_scope_waits_for_owner"
    bands, kind = at(bsc, "bands"), at(case, "kind")
    require(kind in ("probability", "weight"), "unknown band kind")
    days = at(bands, "probability_window_days" if kind == "probability" else "weight_window_days")
    window = timedelta(days=days)
    series = [(instant(at(p, "at")), Decimal(at(p, "value"))) for p in at(case, "series")]
    require(all(a[0] < b[0] for a, b in zip(series, series[1:])), "band series must be in time order")
    for j in range(1, len(series)):
        when, value = series[j]
        earlier = series[:j]
        in_force = [v for t, v in earlier if t <= when - window]
        starts = in_force[-1:] + [v for t, v in earlier if when - window < t]
        for start in starts:
            if kind == "probability":
                limit = Decimal(at(bands, "probability_shift_max_percentage_points_per_week")) / 100
            else:
                limit = Decimal(str(at(bands, "signal_weight_change_max_fraction_per_month"))) * abs(start)
            if abs(value - start) > limit:
                return "out_of_band_waits_for_owner@" + str(j)
    return "within_band"


def outcome_set_hash(outcomes: list) -> str:
    lines = sorted(str(at(o, "record_id")) + "@" + str(at(o, "revision")) for o in outcomes)
    return hashlib.sha256("\n".join(lines).encode("utf-8")).hexdigest()


def overlay_result(bsc: dict, case: dict) -> str:
    """An overlay used at an origin is fitted only on outcomes known by that origin's cutoff."""
    overlay, cutoff = at(case, "overlay"), instant(at(case, "origin_cutoff"))
    if any(field not in overlay for field in at(bsc, "overlay_provenance_fields")):
        return "overlay_provenance_incomplete"
    outcomes = at(overlay, "fitted_outcomes")
    require(isinstance(outcomes, list) and outcomes, "overlay must list its fitted outcomes")
    if outcome_set_hash(outcomes) != at(overlay, "fitted_outcome_set_hash") or len(outcomes) != at(overlay, "fitted_outcome_count"):
        return "overlay_outcome_set_mismatch"
    latest = max(instant(at(o, "outcome_known_at")) for o in outcomes)
    if instant(at(overlay, "data_cutoff")) != latest:
        return "overlay_cutoff_misstated"
    if latest > cutoff:
        return "overlay_future_outcome_rejected"
    return "overlay_admissible"


POLICY_CASE_IDS = {
    "trial_cases": {"trial_long_horizon_eight_clean_weeks", "trial_long_horizon_holiday_week", "trial_short_horizon_outage_awaiting_maturity",
                    "trial_short_horizon_complete", "trial_six_scored_weeks", "trial_unclean_week_fails"},
    "slip_cases": {"slip_three_bad_then_good", "slip_four_bad_running", "slip_unscoreable_neither_counts_nor_breaks",
                   "probation_two_bad_running", "probation_two_bad_not_running", "slip_previous_ineligible_pauses"},
    "band_cases": {"band_probability_separate_weeks_within", "band_probability_two_steps_in_seven_days", "band_weight_repeated_current_steps",
                   "band_weight_calendar_month_boundary", "band_weight_within", "band_combined_score_weights_refused"},
    "overlay_cases": {"overlay_admissible", "overlay_future_outcome", "overlay_missing_outcome_set_hash", "overlay_cutoff_understated",
                      "overlay_set_hash_mismatch"},
}


def verify_policy_cases(docs: dict) -> int:
    bsc = at(docs["model"], "bounded_self_correction")
    runners = {
        "trial_cases": lambda c: trial_result(at(docs["protocol"], "live_trial"), c),
        "slip_cases": lambda c: slip_result(at(docs["protocol"], "probation_and_slip"), c),
        "band_cases": lambda c: band_result(bsc, c),
        "overlay_cases": lambda c: overlay_result(bsc, c),
    }
    total = 0
    for group, run in runners.items():
        cases = at(docs["examples"], group)
        require({at(c, "id") for c in cases} == POLICY_CASE_IDS[group] and len(cases) == len(POLICY_CASE_IDS[group]),
                "required policy cases missing: " + group)
        for case in cases:
            require(run(case) == at(case, "expected"), "policy case mismatch: " + case["id"])
        total += len(cases)
    return total


def verify_policy_contracts(docs: dict = None) -> dict:
    docs = docs if docs is not None else load_docs()
    return {"owner_number_checks": verify_owner_numbers(docs), "policy_cases": verify_policy_cases(docs)}


def _kind(docs: dict, kind_id: str) -> dict:
    return next(k for k in docs["model"]["event_module_proposed"]["first_wave_event_kinds"] if k["id"] == kind_id)


def _choice(docs: dict, choice_id: str) -> dict:
    return next(c for c in docs["decisions"]["material_choices"] if c["id"] == choice_id)


def _fixed(docs: dict) -> dict:
    return docs["fixed"]["forecasts"]["owner_answers_2026_11_03"]


DOCUMENT_MUTATIONS = (
    ("prerelease mode on EV-TARIFF", lambda d: _kind(d, "EV-TARIFF")["applicable_modes"].insert(0, "prerelease_daily_prediction"),
     "unscheduled kind has prerelease mode: EV-TARIFF"),
    ("prerelease mode on EV-CONFLICT", lambda d: _kind(d, "EV-CONFLICT")["applicable_modes"].insert(0, "prerelease_daily_prediction"),
     "unscheduled kind has prerelease mode: EV-CONFLICT"),
    ("schedule field removed", lambda d: _kind(d, "EV-TARIFF").pop("schedule"), "missing record field: schedule"),
    ("probability band 6", lambda d: d["model"]["bounded_self_correction"]["bands"].update(
        probability_shift_max_percentage_points_per_week=6), "probability band differs"),
    ("fixed-policies probability band 6", lambda d: _fixed(d)["self_correction"].update(max_probability_shift_points_per_week=6),
     "probability band differs"),
    ("weight band 0.15", lambda d: d["model"]["bounded_self_correction"]["bands"].update(
        signal_weight_change_max_fraction_per_month="0.15"), "signal weight band differs"),
    ("combined-score weights adjustable", lambda d: d["model"]["bounded_self_correction"]["may_not_adjust"].remove(
        "combined-score weights (FIN-OD-07)"), "may touch the combined-score weights"),
    ("trial 6 weeks", lambda d: d["protocol"]["live_trial"].update(scored_weeks_required=6), "trial weeks differ"),
    ("unmatured week pauses the count", lambda d: d["protocol"]["live_trial"]["unscoreable_week_reasons"].append(
        "no_matured_shadow_forecasts"), "unscoreable reasons differ"),
    ("maker phrase back in spec", lambda d: d.update(spec=d["spec"] + " pauses the count (data outage, holiday week, no matured shadow forecasts)"),
     "still pauses for unmatured forecasts"),
    ("fixed-policies phrase drift", lambda d: _fixed(d).update(unscoreable_week="pauses the count; 8 scored weeks still needed"),
     "not one phrase"),
    ("probation 3 weeks", lambda d: d["protocol"]["probation_and_slip"].update(probation_live_weeks=3), "probation weeks differ"),
    ("probation 3 bad weeks", lambda d: d["protocol"]["probation_and_slip"].update(bad_weeks_to_revert_on_probation=3),
     "probation bad weeks differ"),
    ("slip 3 weeks", lambda d: d["protocol"]["probation_and_slip"].update(slip_bad_weeks_running=3), "slip weeks differ"),
    ("similar days since 2016", lambda d: d["model"]["analogs_proposed"]["candidate_origin_window"].update(
        start="first eligible session on or after 2016-01-01"), "similar-days start differs"),
    ("six event kinds", lambda d: d["model"]["event_module_proposed"]["first_wave_event_kinds"].pop(), "event kinds differ"),
    ("top 4", lambda d: d["tasks"]["forecast_universe_and_ranking"].update(top_n_per_segment=4), "top-5 count differs"),
    ("ranking weights 40/35/25", lambda d: d["tasks"]["forecast_universe_and_ranking"]["ranking_weights"].update(
        growth="0.40", protection="0.35"), "ranking weights differ"),
    ("UK FTSE segment", lambda d: d["tasks"]["forecast_universe_and_ranking"]["segments"].append(
        {"id": "SEG-UK-FTSE", "name": "UK FTSE 100", "market": "UK"}), "UK FTSE"),
    ("decision log reworded", lambda d: d.update(log=d["log"].replace("since 2015", "since 2016")), "decision log no longer says"),
    ("ETF lists merged into one", lambda d: d["tasks"]["forecast_universe_and_ranking"].update(segments=[
        s for s in d["tasks"]["forecast_universe_and_ranking"]["segments"] if "ETF" not in s["id"]] + [
        {"id": "SEG-ETF", "name": "ETFs (US, UK and India)", "market": "US, UK, India"}]), "not one list per market"),
    ("UK ETF list dropped", lambda d: d["tasks"]["forecast_universe_and_ranking"]["segments"].remove(
        next(s for s in d["tasks"]["forecast_universe_and_ranking"]["segments"] if s["id"] == "SEG-ETF-UK")), "not one list per market"),
    ("ETF owner words dropped", lambda d: d["tasks"]["forecast_universe_and_ranking"]["etf_segments"].update(owner_words="ETFs"),
     "lose the owner's words"),
    ("fixed-policies ETF lists merged", lambda d: d["fixed"]["ranking"]["owner_answers_2026_11_03"].update(top5_per_segment=[
        n for n in d["fixed"]["ranking"]["owner_answers_2026_11_03"]["top5_per_segment"] if "ETF" not in n] + ["ETFs (US, UK and India)"]),
     "fixed policies' ETF lists"),
    ("decision log ETF answer reworded", lambda d: d.update(log=d["log"].replace("One list per market", "One list")),
     "decision log no longer says"),
    ("SCI-D09 back to owner_pending", lambda d: _choice(d, "SCI-D09").update(status="owner_pending"),
     "SCI-D09 does not record the owner's ETF answer"),
    # MP-177: the two cases below now drop the item from the closed record's account (settled or stated proposal).
    ("SCI-D09 loses the tie-break question", lambda d: _choice(d, "SCI-D09").update(
        still_open=_choice(d, "SCI-D09")["still_open"].replace("the tie-break, ", "")), "SCI-D09 does not account for the ranking question: tie-break"),
    ("SCI-D09 loses US tech membership", lambda d: _choice(d, "SCI-D09").update(
        still_open=_choice(d, "SCI-D09")["still_open"].replace("US tech membership", "US tech")),
     "SCI-D09 does not account for the ranking question: US tech membership"),
    ("SCI-D09 back to partly_answered", lambda d: _choice(d, "SCI-D09").update(status="partly_answered"),
     "SCI-D09 does not record the owner's ETF answer and is not closed"),
    ("SCI-D09 ETF answer dropped", lambda d: _choice(d, "SCI-D09")["answered_by"].remove("SCI-OA-10"),
     "SCI-D09 does not record the owner's ETF answer"),
    ("SCI-D09 ranking answer dropped", lambda d: _choice(d, "SCI-D09")["answered_by"].remove("SCI-OA-11"),
     "SCI-D09 does not record the owner's ranking answers"),
    ("SCI-OA-11 record dropped", lambda d: d["decisions"]["owner_answers_2026_11_03"].remove(
        next(a for a in d["decisions"]["owner_answers_2026_11_03"] if a["id"] == "SCI-OA-11")), "SCI-OA-11 does not hold"),
    ("SCI-OA-11 loses the cadence answer", lambda d: next(a for a in d["decisions"]["owner_answers_2026_11_03"] if a["id"] == "SCI-OA-11").update(
        scope="Top-5 ranking horizon \"3 to 12 months (Recommended)\"."), "SCI-OA-11 does not hold"),
    ("SCI-D09 loses the cadence question", lambda d: _choice(d, "SCI-D09").update(
        still_open=_choice(d, "SCI-D09")["still_open"].replace("the ranking cadence", "the ranking")),
     "SCI-D09 does not account for the ranking question: cadence"),
    ("tie-break claimed as the owner's", lambda d: _choice(d, "SCI-D09").update(
        still_open=_choice(d, "SCI-D09")["still_open"].replace("Settled by the owner:", "Settled by the owner: the tie-break;")),
     "SCI-D09 does not account for the ranking question: tie-break"),
    ("SCI-D09 closed with an owner question left", lambda d: _choice(d, "SCI-D09").update(
        still_open=_choice(d, "SCI-D09")["still_open"].replace("Nothing the owner must decide.", "Still open: the tie-break.")),
     "does not say nothing is left for the owner"),
    ("SCI-D09 superseded note emptied", lambda d: _choice(d, "SCI-D09")["superseded_2026_11_03_mp177"].update(superseded=[]),
     "not kept under a dated note"),
    ("SCI-D09 superseded note dropped", lambda d: _choice(d, "SCI-D09").pop("superseded_2026_11_03_mp177"),
     "missing record field: superseded_2026_11_03_mp177"),
    ("old SCI-D09 recommendation restored", lambda d: _choice(d, "SCI-D09").update(
        recommendation=_choice(d, "SCI-D09")["superseded_2026_11_03_mp177"]["recommendation_was"]), "not one phrase across records"),
    ("growth fed by a short horizon", lambda d: d["tasks"]["forecast_universe_and_ranking"]["ranking_horizons"]["growth"].append("H-S20"),
     "ranking horizons differ from the owner's 3, 6 and 12 months: growth"),
    ("protection loses 12 months", lambda d: d["tasks"]["forecast_universe_and_ranking"]["ranking_horizons"]["protection"].remove("H-M12"),
     "ranking horizons differ from the owner's 3, 6 and 12 months: protection"),
    ("short horizons feed growth too", lambda d: d["tasks"]["forecast_universe_and_ranking"]["ranking_horizons"][
        "short_horizons_feed_only"].append("growth"), "short horizons feed more than the opportunity part"),
    ("ranking horizon owner words dropped", lambda d: d["tasks"]["forecast_universe_and_ranking"]["ranking_horizons"].update(
        owner_words="3 to 12 months"), "ranking horizons lose the owner's words"),
    ("ranking cadence weekly", lambda d: d["tasks"]["forecast_universe_and_ranking"]["ranking_cadence"].update(cadence="weekly"),
     "ranking cadence differs"),
    ("ranking before issuance", lambda d: d["tasks"]["forecast_universe_and_ranking"]["ranking_cadence"].update(runs_after="each daily close"),
     "ranking cadence differs"),
    ("ranking cadence back to proposed", lambda d: d["tasks"]["forecast_universe_and_ranking"]["ranking_cadence"].update(status="proposed"),
     "ranking cadence differs"),
    ("US tech is the whole Nasdaq-100", lambda d: next(s for s in d["tasks"]["forecast_universe_and_ranking"]["segments"]
                                                       if s["id"] == "SEG-US-TECH").update(membership="the Nasdaq-100"),
     "US tech membership differs"),
    ("US tech membership back to proposed", lambda d: next(s for s in d["tasks"]["forecast_universe_and_ranking"]["segments"]
                                                           if s["id"] == "SEG-US-TECH").update(membership_status="proposed"),
     "US tech membership differs"),
    ("membership_proposed key restored", lambda d: next(s for s in d["tasks"]["forecast_universe_and_ranking"]["segments"]
                                                        if s["id"] == "SEG-US-TECH").update(membership_proposed="Nasdaq-100 (proposed, SCI-D09)"),
     "still presented as open or proposed in task-catalogue"),
    ("tie-break presented as owner-selected", lambda d: d["tasks"]["forecast_universe_and_ranking"]["tie_break"].update(
        status="owner_selected_2026-11-03"), "tie-break presented as the owner's answer"),
    ("SCI-D09 back in the ranking open list", lambda d: d["tasks"]["forecast_universe_and_ranking"]["open"].append(
        "SCI-D09: ranking cadence"), "ranking still lists SCI-D09 as open"),
    ("spec says Nasdaq-100 proposed", lambda d: d.update(spec=d["spec"].replace(
        "US tech (the technology names in the Nasdaq-100, owner, 3 Nov 2026, SCI-D09)", "US tech (Nasdaq-100 proposed as its membership, SCI-D09)")),
     "still presented as open or proposed in spec"),
    ("spec says SCI-D09 partly answered", lambda d: d.update(spec=d["spec"] + " The cadence stays open (SCI-D09, partly answered)."),
     "still presented as open or proposed in spec"),
    ("spec loses the horizon phrase", lambda d: d.update(spec=d["spec"].replace("short horizons feed only the opportunity part", "short horizons feed the opportunity part")),
     "not one phrase across records: ranking_horizon_phrase in spec"),
    ("fixed-policies cadence phrase drift", lambda d: d["fixed"]["ranking"]["owner_answers_2026_11_03"].update(
        ranking_cadence="Ranked daily"), "not one phrase across records: ranking_cadence_phrase in fixed-policies"),
    ("fixed-policies US tech dropped", lambda d: d["fixed"]["ranking"]["owner_answers_2026_11_03"].pop("us_tech_membership"),
     "missing record field: us_tech_membership"),
    ("fixed-policies calls Nasdaq-100 proposed", lambda d: d["fixed"]["ranking"].update(us_tech="Nasdaq-100 membership proposed"),
     "still presented as open or proposed in fixed-policies"),
    ("open-decisions status lists D09 partly answered", lambda d: d["decisions"].update(
        status="consolidated_2026-11-03: SCI-D05 closed; SCI-D01/D03/D04/D06/D09 partly answered"),
     "still presented as open or proposed in open-decisions"),
    ("decision log ranking horizon reworded", lambda d: d.update(log=d["log"].replace("3 to 12 months", "1 to 12 months")),
     "decision log no longer says"),
    ("decision log US tech reworded", lambda d: d.update(log=d["log"].replace("technology names in the Nasdaq-100", "Nasdaq-100")),
     "decision log no longer says"),
    ("rules proper score settled", lambda d: d["protocol"]["live_trial"]["rules_proper_score"].update(status="settled"),
     "rules proper score presented as settled"),
    ("old SCI-D05 recommendation restored", lambda d: _choice(d, "SCI-D05").update(
        recommendation=_choice(d, "SCI-D05")["superseded_2026_11_03"]["recommendation_was"]), "SCI-D05 still recommends"),
    ("SCI-D10 dropped", lambda d: d["decisions"]["material_choices"].pop(), "not SCI-D01 to SCI-D10"),
    ("SCI-D03 loses the long-horizon calibration question", lambda d: _choice(d, "SCI-D03").update(still_open="Folds only."),
     "SCI-D03 does not hold the open trial question"),
    ("overlay point-in-time rule dropped", lambda d: d["model"]["bounded_self_correction"].pop("point_in_time_rule"),
     "missing record field: point_in_time_rule"),
    ("overlay data cutoff not persisted", lambda d: d["model"]["bounded_self_correction"]["overlay_provenance_fields"].remove(
        "data_cutoff"), "overlay provenance lacks"),
)

# Gate mutants: each removes one refusal from this file; the selftest must then fail with the named case.
GATE_MUTANTS = (
    ("unscheduled prerelease guard removed",
     '            require("prerelease_daily_prediction" not in applicable, "unscheduled kind has prerelease mode: " + kind["id"])\n',
     "            pass\n", "selftest mutation accepted: prerelease mode on EV-TARIFF"),
    ("probability band check removed",
     '            "probability band differs from the owner\'s 5 points a week")\n',
     '            "probability band differs from the owner\'s 5 points a week") if False else None\n',
     "selftest mutation accepted: probability band 6"),
    ("overlay future-outcome refusal removed", "    if latest > cutoff:\n", "    if False:\n",
     "policy case mismatch: overlay_future_outcome"),
    ("slip run no longer resets on a good week", "            run = 0\n", "            pass\n",
     "policy case mismatch: slip_three_bad_then_good"),
    ("band read step by step", "        starts = in_force[-1:] + [v for t, v in earlier if when - window < t]\n",
     "        starts = earlier[-1:] and [earlier[-1][1]]\n", "policy case mismatch: band_probability_two_steps_in_seven_days"),
    ("unmatured weeks pause the trial", '    reasons = at(trial, "unscoreable_week_reasons")\n',
     '    reasons = at(trial, "unscoreable_week_reasons") + ["no_matured_shadow_forecasts"]\n',
     "policy case mismatch: trial_long_horizon_eight_clean_weeks"),
    ("ETF one-list-per-market check removed", "    verify_etf_lists(docs, ranking)\n", "    pass\n",
     "selftest mutation accepted: ETF lists merged into one"),
    ("SCI-D09 open-question check removed",
     '    require("tie-break" in proposal and "tie-break" not in settled, "SCI-D09 does not account for the ranking question: tie-break")\n',
     "    pass\n", "selftest mutation accepted: SCI-D09 loses the tie-break question"),
    ("SCI-D09 closed-status check removed",
     '    require(at(d09, "status") == OWNER["d09_status"] and "SCI-OA-10" in answered,\n',
     "    require(True or answered,\n", "selftest mutation accepted: SCI-D09 back to owner_pending"),
    ("ranking-answer check removed", "    ranking_checks = verify_ranking_answers(docs, ranking)\n", "    ranking_checks = 0\n",
     "selftest mutation accepted: old SCI-D09 recommendation restored"),
    ("stale-phrasing sweep removed",
     '            require(not pattern.search(text), "SCI-D09 answer still presented as open or proposed in " + name + ": " + pattern.pattern)\n',
     "            pass\n", "selftest mutation accepted: membership_proposed key restored"),
    ("short horizons allowed into growth", '    for component in ("growth", "protection"):\n', '    for component in ("protection",):\n',
     "selftest mutation accepted: growth fed by a short horizon"),
)


def expect_refusal(label: str, action, expected: str) -> None:
    try:
        action()
    except ValueError as exc:
        require(expected in str(exc), "selftest " + label + ": wrong refusal: " + str(exc))
        return
    raise ValueError("selftest mutation accepted: " + label)


def selftest_documents() -> int:
    base = load_docs()
    verify_policy_contracts(copy.deepcopy(base))  # the harness starts from a passing record set
    for label, mutate, expected in DOCUMENT_MUTATIONS:
        docs = copy.deepcopy(base)
        mutate(docs)
        expect_refusal(label, lambda docs=docs: verify_policy_contracts(docs), expected)
    return len(DOCUMENT_MUTATIONS)


def selftest_gate_mutants() -> int:
    source = Path(__file__).read_text()
    for label, old, new, expected in GATE_MUTANTS:
        require(source.count(old) == 1, "gate mutant anchor not found exactly once: " + label)
        namespace = {"__name__": "timing_checks_mutant", "__file__": __file__}
        exec(compile(source.replace(old, new), __file__ + "#" + label, "exec"), namespace)

        def run_mutant(ns=namespace):
            ns["verify_policy_contracts"]()
            ns["selftest_documents"]()
        expect_refusal("gate mutant survived: " + label, run_mutant, expected)
    return len(GATE_MUTANTS)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", choices=("daily", "event", "policy", "selftest", "all"), default="all")
    selected = parser.parse_args().check
    result = {}
    if selected in ("daily", "all"):
        result["daily_cases"] = verify_daily_origin_clock_contract()
    if selected in ("event", "all"):
        result["event_cases_including_negative_target"] = verify_event_availability_contract()
    if selected in ("policy", "all"):
        result.update(verify_policy_contracts())
    if selected in ("selftest", "all"):
        result["selftest_document_mutations_refused"] = selftest_documents()
        result["selftest_gate_mutants_killed"] = selftest_gate_mutants()
    print(json.dumps({"status": "offline_specification_proofs_passed", **result}))
