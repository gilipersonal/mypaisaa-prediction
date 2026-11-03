"""Twelve-month invoice-month cash view for Mypaisaa Prediction (MP-10, MP-29 cost lane).

Reads the repository's costs/model.json (read-only), adds the cost lines MP-36 found missing, and
prints a month-by-month cash table per scenario against the owner's thresholds. No network calls.

Conventions, all taken from the cost specification unless marked otherwise:
- Cash counts in the month an invoice is due; amortisation is never cash (COST-05/06).
- Central scenario: GBP 0.80 per USD, 20% tax, 0% card fee; adverse: 0.85, 20%, 3%.
- Warn/reduce/pause are "reached" at >= the threshold; the GBP 70 plan and GBP 100 ceiling are
  breached at > the limit (the same rule as check_cash_timing.py).
- M1 is the first month in which prod runs with paid live data. No calendar month is chosen.

Usage: python3 -I docs/planning/source-rights-2026-11-02/cost_months.py [path/to/model.json] [--json out.json]
"""
from __future__ import annotations

import argparse
import itertools
import json
from decimal import Decimal as D
from pathlib import Path

REPO_MODEL = Path(__file__).resolve().parents[1] / "foundation-specifications-2026-11-02/costs/model.json"
CHECKED = "checked 2 Nov 2026"
MONTHS = 12
THRESHOLDS = {"warn_60": D(60), "plan_70": D(70), "reduce_75": D(75), "pause_85": D(85), "ceiling_100": D(100)}
REACHED_AT_EQUAL = {"warn_60", "reduce_75", "pause_85"}  # >=; plan and ceiling use >

TELEMETRY_LINES = ("logs_ingested_gb", "logs_stored_gb_month", "logs_scanned_gb", "metric_month",
                   "alarm_month", "trace_recorded", "trace_queried")

# ---- New or corrected cost lines (primary sources, checked 2 Nov 2026) ----------------------------
NEW_LINES = [
    {"id": "github_actions", "usd": "0", "timing": "monthly",
     "basis": "GitHub Free for organisations includes USD 12 of Actions compute a month for the whole org "
              "(MP and MA share it). MP's drafted normal month is about 520 Linux minutes at USD 0.006 = USD 3.12, "
              "inside the allowance, so planned cash is USD 0. Without a payment method usage is blocked at the "
              "allowance; with one, overage is billed (subject to any budget).",
     "sensitivity_usd": "3.12",
     "sensitivity_note": "Worst case: MA already uses the whole allowance and a payment method is on file, so MP's "
                         "520 minutes are billed in full (USD 3.12, GBP 3.00 central).",
     "source": "https://docs.github.com/en/billing/concepts/product-billing/github-actions", "checked": CHECKED,
     "status": "source_verified_price; MP volume is a draft estimate; payment-method state unverified"},
    {"id": "apple_developer_program", "usd": "99", "timing": "annual, due month OPEN",
     "basis": "USD 99 a membership year, shown in local currency at enrolment, tax added for the region. "
              "Auto-renew (website) charges on the expiration date; manual renewal opens 30 days before.",
     "source": "https://developer.apple.com/support/purchase-activation/ ; https://developer.apple.com/support/renewal/",
     "checked": CHECKED,
     "status": "source_verified_usd_price; GBP local price unverified (secondary sources only cite GBP 79); due month OPEN"},
    {"id": "domain_registration", "usd": "16", "timing": "annual, due at registration and each renewal",
     "basis": "The model holds a USD 15 allowance (EST-COST-DOMAIN, no vendor source). Route 53's own TLD price list "
              "raised .com from USD 15 to USD 16 a year from 1 July 2026; .uk and .co.uk stay USD 9. Prices exclude "
              "tax, and AWS promotional credit cannot pay domain fees. TLD and registrar not chosen.",
     "alternatives_usd": {"model_allowance": "15", "route53_com": "16", "route53_uk_or_co_uk": "9"},
     "source": "https://aws.amazon.com/route53/pricing/ (TLD price list PDF linked from it)", "checked": CHECKED,
     "status": "source_verified; TLD not selected"},
    {"id": "telemetry", "usd": "4.9405", "timing": "monthly, already inside the AWS total",
     "basis": "Sum of the model's CloudWatch logs, Logs Insights scans, custom metrics, alarms and X-Ray lines for "
              "prod and dev (Virginia). Not added again.",
     "source": "costs/model.json results[baseline,us-east-1] line items", "checked": CHECKED,
     "status": "verified_in_model; not a new line"},
    {"id": "atlassian_and_lucid", "usd": None, "timing": "out of scope",
     "basis": "Jira, Confluence and Lucid are the owner's existing tools, used for planning, not run by MP. Their "
              "plans and prices were not read; nothing is added unless the owner says a paid seat exists only for MP.",
     "source": None, "checked": CHECKED, "status": "excluded_owner_question"},
]

# ---- Conclusions drawn from the printed tables (central FX/tax, Virginia unless stated) ----------
CONCLUSIONS = {
    "fits": [
        "Grow 55 at USD 29 monthly (conditional price), Basic in dev, Claude blocked, no Apple fee: every month under "
        "GBP 100 and under GBP 70. Virginia: M1 GBP 61.84 with a .com domain (GBP 55.12 with .uk), M2-M12 GBP 46.48. "
        "M1 reaches the GBP 60 warning with .com.",
        "Grow 55 monthly with Claude option A at the ARC-06b planned volume (USD 8.59): every month under GBP 100; "
        "M2-M12 GBP 54.73 (London GBP 55.19), under GBP 70 and the GBP 60 warning.",
        "Grow 55 monthly, Claude A, .uk domain (USD 9): every month under GBP 70 (M1 GBP 63.37, past the warning). "
        "This is the cheapest combination that keeps Claude A and every month under GBP 70.",
        "Grow 55 monthly, Claude A-lite (Sonnet event analysis, USD 6.09), .com domain: M1 GBP 67.69, under GBP 70.",
        "Grow 79 monthly (or the 17%-off annual price if it could be paid monthly), Claude blocked: M2-M12 under GBP 100 "
        "(GBP 94.48 and GBP 81.59), but always past the GBP 85 pause or GBP 75 reduce line and over the GBP 70 plan.",
    ],
    "does_not_fit": [
        "The Apple Developer Program fee (USD 99, GBP 95.04 with 20% tax) breaches GBP 100 in whatever month it is paid, "
        "with every data tier, even Basic only (GBP 113.68 Virginia), and even in a dev-only month before paid data "
        "(GBP 101.36). No month has GBP 95 of headroom, so deferring it to 'a month with headroom' cannot work under "
        "the current rule. It fits a dev-only month only if the UK local price is GBP 79 including tax (unverified): "
        "GBP 85.32, still past the GBP 85 pause line.",
        "Grow 79 monthly with Claude A planned: every month over GBP 100 (GBP 102.73; GBP 118.09 in the .com domain month).",
        "Grow 79 monthly with Claude blocked: M1 (domain month) GBP 109.84 over GBP 100; every month over GBP 70 and at "
        "the GBP 85 pause line.",
        "Any annual data plan paid upfront: M1 GBP 789.37 (Grow 79) or GBP 311.29 (Grow 55), far over GBP 100.",
        "Grow 55 with Claude A and a .com domain: M1 GBP 70.09, over the GBP 70 plan by 9p (the 1 July 2026 .com rise "
        "from USD 15 to 16 causes it).",
        "The busy-month Claude stress (USD 74.88) breaks GBP 100 every month even with Grow 55 (GBP 118.36): the chat "
        "caps, not the model choice, decide this.",
        "Grow 144: price unknown. It keeps ordinary months under GBP 100 only at or below USD 84.75 (Claude blocked) or "
        "USD 76.16 (Claude A), and under GBP 70 only at or below USD 53.50 or USD 44.91.",
    ],
    "levers": [
        "Biggest: the data tier. Grow 79 to Grow 55 cuts USD 50, GBP 48.00 a month, every month.",
        "Basic for dev: keeps one paid subscription; a second paid key for dev would add the full tier price again.",
        "Annual data billing saves 17% but only helps cash if it can be paid monthly; paid upfront it is the largest "
        "single breach in the year. The page does not say which.",
        "Claude: option A adds GBP 8.24 a month; A-lite GBP 5.84; blocked GBP 0. Daily chat caps bound the busy month.",
        "Domain: .uk at USD 9 instead of .com at USD 16 saves GBP 6.72 in the purchase month and brings Grow 55 plus "
        "Claude A under GBP 70 in M1.",
        "Apple: needs an owner rule, not a month. Either (a) hold it outside the MP envelope, (b) a one-off approved "
        "exception month, (c) a sinking fund (COST-06 forbids this today), or (d) confirm a lower local GBP price and pay "
        "it in a dev-only month before paid data starts.",
        "Region: London costs GBP 0.46 a month more than Virginia; not a lever for fit.",
    ],
    "owner_questions": [
        "Is the Apple Developer Program fee inside the GBP 100 MP envelope? If yes, which rule lets a GBP 95 one-off "
        "charge in through admission: a one-off exception month, a sinking fund (which COST-06 currently forbids), or "
        "paying in a dev-only month before paid data, if the local price proves to be about GBP 79?",
        "Which TLD: .com (USD 16 on Route 53 since 1 July 2026, the model still holds USD 15) or .uk/.co.uk (USD 9)? "
        "And which month is the domain bought, relative to the first paid data month?",
        "Is there a payment method on the GitHub organisation? If not, Actions stop at the USD 12 shared allowance; if "
        "yes, should a budget of USD 0 be set so MP never pays overage?",
        "How many Actions minutes does MA use a month on the shared allowance?",
        "Should the model's AWS build_minute lines (USD 1.50 a month, CodeBuild-style) stay if CI and deploys run on "
        "GitHub Actions, or are they a double count?",
        "Are any Jira, Confluence or Lucid seats paid only because of MP? If so, they belong in the envelope.",
        "When credits are bought for the Anthropic API, is the cash month the purchase month (prepaid) rather than the "
        "usage month? This changes when Claude cash lands.",
    ],
    "vendor_questions": [
        "Twelve Data: is Grow 55 currently sold at USD 29 a month for a personal account, and what is the Grow 144 price?",
        "Twelve Data: is the 17% annual saving charged upfront for the year, or can it be paid monthly? Does it apply to "
        "Grow 55 and 144 as well as 377? What is the refund rule on cancellation?",
        "Twelve Data: can one person hold a free Basic key for dev alongside a paid Grow key for prod?",
        "Apple: what is the UK enrolment price in GBP for an individual, including VAT, and on what date would "
        "auto-renewal charge?",
        "GitHub: is the USD 12 included compute shared across all private repositories in the organisation, and what is "
        "the default budget when a payment method is added?",
    ],
}

# ---- Claude, ARC-06b option A and A-lite (prices verified on the pricing page) ----------------
# Batch = half price. Haiku 5.5 <=100K prompts: 0.10/0.50, batch 0.05/0.25. Sonnet 5.5: 2/10, batch 1/5.
# Opus 5.5: 4/20, batch 2/10. Source: https://platform.claude.com/docs/en/about-claude/pricing
PRICE = {"haiku_batch": (D("0.05"), D("0.25")), "sonnet_live": (D("2"), D("10")), "sonnet_batch": (D("1"), D("5")),
         "opus_batch": (D("2"), D("10"))}
EVENT_ALLOWANCE = {"events": D(100), "in_mtok_each": D("0.015"), "out_mtok_each": D("0.002")}  # card's assumption


def claude_option(tokens: dict, event_model: str) -> D:
    """ARC-06b option A routing over the model's token volumes plus the card's event allowance."""
    total = D(0)
    for env in tokens.values():
        hi, ho = PRICE["haiku_batch"]
        si, so = PRICE["sonnet_live"]
        bi, bo = PRICE["sonnet_batch"]
        total += D(env["economy_input_mtok"]) * hi + D(env["economy_output_mtok"]) * ho
        total += D(env["standard_input_mtok"]) * si + D(env["standard_output_mtok"]) * so
        total += D(env["eval_standard_input_mtok"]) * bi + D(env["eval_standard_output_mtok"]) * bo
    ei, eo = PRICE[event_model]
    n = EVENT_ALLOWANCE["events"]
    total += n * EVENT_ALLOWANCE["in_mtok_each"] * ei + n * EVENT_ALLOWANCE["out_mtok_each"] * eo
    return total


def load(model_path: Path) -> dict:
    m = json.loads(model_path.read_text())
    fx = {f["id"]: D(f["gbp_per_usd"]) * (1 + D(f["tax_fraction"])) * (1 + D(f["card_fx_fraction"]))
          for f in m["fx_tax_scenarios"]}
    aws = {}
    for r in m["results"]:
        if r["scenario"] != "baseline":
            continue
        lines = [li for env in r["environment_costs"].values() for li in env["line_items"]]
        total = sum((D(li["quantity"]) * D(li["usd_rate"]) for li in lines), D(0))
        assert total == D(r["aws_usd_total"]), "AWS subtotal mismatch"
        amort = sum((D(li["quantity"]) * D(li["usd_rate"]) for li in lines
                     if li["name"] == "domain_registration_allowance"), D(0))
        dev_only = sum((D(li["quantity"]) * D(li["usd_rate"]) for li in r["environment_costs"]["dev"]["line_items"]), D(0))
        telem = sum((D(li["quantity"]) * D(li["usd_rate"]) for li in lines if li["name"] in TELEMETRY_LINES), D(0))
        build = sum((D(li["quantity"]) * D(li["usd_rate"]) for li in lines if li["name"] == "build_minute"), D(0))
        aws[r["region"]] = {"run_rate": total, "amortised_domain": amort, "cash_ex_domain": total - amort,
                            "dev_only": dev_only, "telemetry": telem, "build_minutes": build}
    data = {d["id"]: (None if d["monthly_usd"] is None else D(d["monthly_usd"])) for d in m["data_options"]}
    tokens = {w["scenario"]: w["environment_tokens_millions"] for w in m["claude_workloads"]}
    gross = {w["scenario"]: D(w["gross_usd"]) for w in m["claude_workloads"]}
    domain_allowance = next(D(a["annual_usd"]) for a in m["estimate_assumptions"] if a["id"] == "EST-COST-DOMAIN")
    return {"fx": fx, "aws": aws, "data": data, "tokens": tokens, "gross": gross,
            "domain_allowance": domain_allowance, "owner": m["owner_confirmed"]}


def data_plans(model: dict) -> dict:
    """Prod data billing plans. Annual = 17% off ('Save 17%' on the pricing card); whether it is paid
    upfront or monthly is not stated, so both are shown. Grow 55 annual is derived, not displayed."""
    g79, g55 = model["data"]["Grow377_displayed"], model["data"]["Grow55_support_candidate"]
    disc = D("0.83")
    return {
        "Grow79_monthly": {"monthly": g79, "upfront_m1": D(0), "status": "displayed price, source_verified"},
        "Grow79_annual_upfront": {"monthly": D(0), "upfront_m1": g79 * 12 * disc,
                                  "status": "derived from 'Save 17%'; upfront payment assumed, unverified"},
        "Grow79_annual_paid_monthly": {"monthly": g79 * disc, "upfront_m1": D(0),
                                       "status": "derived; the page does not say whether an annual plan can be paid in monthly instalments"},
        "Grow55_monthly": {"monthly": g55, "upfront_m1": D(0), "status": "conditional: support article and page structured data; checkout unverified"},
        "Grow55_annual_upfront": {"monthly": D(0), "upfront_m1": g55 * 12 * disc,
                                  "status": "derived; 17% assumed to apply to Grow 55; unverified"},
        "Grow144_monthly": {"monthly": None, "upfront_m1": D(0), "status": "price unknown"},
        "Basic_only": {"monthly": D(0), "upfront_m1": D(0),
                       "status": "Basic is dev only; prod would have no licensed live data. Floor reference, not a live plan"},
    }


def months_for(model, region, plan, claude_usd, apple_month, domain_usd, github_usd, fx_id, apple_usd=D(99)):
    aws = model["aws"][region]["cash_ex_domain"]
    factor = model["fx"][fx_id]
    out = []
    for m in range(1, MONTHS + 1):
        usd = aws + github_usd + claude_usd
        usd += plan["monthly"] if plan["monthly"] is not None else D("NaN")
        if m == 1:
            usd += domain_usd + plan["upfront_m1"]
        if apple_month == m:
            usd += apple_usd
        out.append(usd * factor)
    return out


def breaches(months):
    res = {}
    for name, limit in THRESHOLDS.items():
        if any(x.is_nan() for x in months):
            res[name] = "unknown"
            continue
        hit = [i + 1 for i, x in enumerate(months) if (x >= limit if name in REACHED_AT_EQUAL else x > limit)]
        res[name] = ["M%d" % i for i in hit]
    return res


def gbp(x: D):
    return None if x.is_nan() else float(x.quantize(D(".01")))


def max_data_price(model, region, claude_usd, extra_usd, limit, fx_id="central"):
    """Highest monthly data price (USD) that keeps a month at or under `limit`."""
    return (D(limit) / model["fx"][fx_id]) - model["aws"][region]["cash_ex_domain"] - claude_usd - extra_usd


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("model", nargs="?", default=str(REPO_MODEL))
    ap.add_argument("--json", default=None)
    args = ap.parse_args()
    model = load(Path(args.model))
    plans = data_plans(model)
    regions = {"Virginia": "us-east-1", "London": "eu-west-2"}

    # Known-answer check against the spec: Virginia Grow79, Claude blocked, USD15 domain month = GBP108.88.
    k = months_for(model, "us-east-1", plans["Grow79_monthly"], D(0), None, model["domain_allowance"], D(0), "central")
    assert gbp(k[0]) == 108.88 and gbp(k[1]) == 94.48, (k[0], k[1])
    k = months_for(model, "us-east-1", plans["Grow55_monthly"], D(0), None, model["domain_allowance"], D(0), "central")
    assert gbp(k[0]) == 60.88 and gbp(k[1]) == 46.48

    claude = {
        "blocked": D(0),
        "A_planned": claude_option(model["tokens"]["baseline"], "opus_batch"),
        "A_lite_planned": claude_option(model["tokens"]["baseline"], "sonnet_batch"),
        "A_busy_stress": claude_option(model["tokens"]["stress_uncontrolled"], "opus_batch"),
    }
    assert claude["A_planned"].quantize(D(".01")) == D("8.59"), claude["A_planned"]
    assert claude["A_lite_planned"].quantize(D(".01")) == D("6.09")
    assert claude["A_busy_stress"].quantize(D(".01")) == D("74.88")

    domain = {"com16": D(16), "uk9": D(9)}
    apple_options = {"none": None, "M1": 1, "M7": 7}

    grid = []
    for (rname, region), (pname, plan), (cname, cusd), (aname, amonth), (dname, dusd), gh in itertools.product(
            regions.items(), plans.items(), claude.items(), apple_options.items(), domain.items(), ("planned_0", "worst_3.12")):
        if cname == "A_busy_stress":
            continue  # shown separately below; stress breaks the admission caps by design
        months = months_for(model, region, plan, cusd, amonth, dusd, D(0) if gh == "planned_0" else D("3.12"), "central")
        grid.append({"name": f"{rname} | {pname} | Claude {cname} | Apple {aname} | domain {dname} | GitHub {gh}",
                     "region": rname, "data": pname, "claude": cname, "apple": aname, "domain": dname, "github": gh,
                     "fx": "central", "months": [gbp(x) for x in months], "breaches": breaches(months),
                     "max_month": None if any(x.is_nan() for x in months) else gbp(max(months))})

    def pick(region, data, cl, apple, dom="com16", gh="planned_0"):
        return next(g for g in grid if g["region"] == region and g["data"] == data and g["claude"] == cl
                    and g["apple"] == apple and g["domain"] == dom and g["github"] == gh)

    headline = []
    for region in ("Virginia", "London"):
        for data in ("Basic_only", "Grow55_monthly", "Grow55_annual_upfront", "Grow144_monthly", "Grow79_monthly",
                     "Grow79_annual_paid_monthly", "Grow79_annual_upfront"):
            for cl in ("blocked", "A_planned"):
                for apple in ("none", "M7"):
                    headline.append(pick(region, data, cl, apple))
    # Stress / sensitivity rows
    extra = []
    for data in ("Grow55_monthly", "Grow79_monthly"):
        months = months_for(model, "us-east-1", plans[data], claude["A_busy_stress"], None, D(16), D(0), "central")
        extra.append({"name": f"Virginia | {data} | Claude A_busy_stress | Apple none | domain com16 | GitHub planned_0",
                      "months": [gbp(x) for x in months], "breaches": breaches(months)})
    for data in ("Grow55_monthly",):
        for cl in ("blocked", "A_planned"):
            for dname, gh in (("com16", D("3.12")), ("uk9", D(0))):
                months = months_for(model, "us-east-1", plans[data], claude[cl], None, domain[dname], gh, "adverse")
                extra.append({"name": f"Virginia | {data} | Claude {cl} | Apple none | domain {dname} | GitHub {'worst_3.12' if gh else 'planned_0'} | FX adverse",
                              "months": [gbp(x) for x in months], "breaches": breaches(months)})
    for cl in ("A_lite_planned",):
        months = months_for(model, "us-east-1", plans["Grow55_monthly"], claude[cl], None, D(16), D(0), "central")
        extra.append({"name": f"Virginia | Grow55_monthly | Claude {cl} | Apple none | domain com16 | GitHub planned_0",
                      "months": [gbp(x) for x in months], "breaches": breaches(months)})
    # Apple in a dev-only month before paid data starts (M0): dev AWS only, Basic data, Claude blocked.
    dev_only = {}
    for region, code in regions.items():
        dev = model["aws"][code]["dev_only"]
        dev_only[region] = {
            "dev_only_month_gbp": gbp(dev * model["fx"]["central"]),
            "with_apple_usd99_gbp": gbp((dev + D(99)) * model["fx"]["central"]),
            "with_apple_gbp79_local_unverified": gbp(dev * model["fx"]["central"] + D(79)),
        }

    # Break-even data prices (USD a month), Claude blocked vs A, ordinary and domain month.
    breakeven = {}
    for region, code in regions.items():
        for cl in ("blocked", "A_planned"):
            for label, extra_usd in (("ordinary", D(0)), ("domain_com16_month", D(16)), ("apple_month", D(99))):
                for lim in (60, 70, 85, 100):
                    breakeven[f"{region}|{cl}|{label}|{lim}"] = float(
                        max_data_price(model, code, claude[cl], extra_usd, lim).quantize(D(".01")))

    # Cheapest combinations, central FX, GitHub planned, over the whole grid.
    known = [g for g in grid if g["max_month"] is not None and g["data"] != "Basic_only"]

    def total(g):
        return sum(g["months"])

    under100 = sorted([g for g in known if not g["breaches"]["ceiling_100"]], key=total)
    under70 = sorted([g for g in known if not g["breaches"]["plan_70"]], key=total)
    under70_claudeA = [g for g in under70 if g["claude"] == "A_planned"]
    apple_fits_100 = [g for g in known if g["apple"] != "none" and not g["breaches"]["ceiling_100"]]

    a = model["aws"]["us-east-1"]
    summary = {
        "inputs": {
            "fx_factor_central": str(model["fx"]["central"]), "fx_factor_adverse": str(model["fx"]["adverse"]),
            "aws_usd": {r: {k: str(v.quantize(D('.0001'))) for k, v in model["aws"][c].items()} for r, c in regions.items()},
            "telemetry_usd_virginia": str(a["telemetry"].quantize(D(".0001"))),
            "claude_usd": {k: str(v.quantize(D(".0001"))) for k, v in claude.items()},
            "data_plans_usd": {k: {"monthly": None if v["monthly"] is None else str(v["monthly"]),
                                   "upfront_m1": str(v["upfront_m1"]), "status": v["status"]} for k, v in plans.items()},
        },
        "headline": headline, "extra": extra, "dev_only_apple": dev_only, "breakeven_data_usd": breakeven,
        "cheapest_under_100": under100[:3], "cheapest_under_70": under70[:3],
        "cheapest_under_70_with_claude_A": under70_claudeA[:3],
        "apple_scenarios_under_100": len(apple_fits_100),
        "grid_count": len(grid),
    }

    for g in headline:
        b = g["breaches"]
        months = g["months"]
        if b["ceiling_100"] == "unknown":
            print(f"{g['name']}: unknown (price not published)")
            continue
        print(f"{g['name']}\n   M1 {months[0]:7.2f}  M2-6 {months[1]:7.2f}  M7 {months[6]:7.2f}  "
              f"| >100 {b['ceiling_100'] or '-'} >70 {b['plan_70'] or '-'} warn {len(b['warn_60'])} pause {len(b['pause_85'])}")
    print("\nextra:")
    for e in extra:
        print(" ", e["name"], e["months"][:2], e["breaches"]["ceiling_100"], e["breaches"]["plan_70"])
    print("\ndev-only Apple month:", dev_only)
    print("\ncheapest <100:", [(g["name"], g["max_month"]) for g in under100[:3]])
    print("cheapest <70:", [(g["name"], g["max_month"]) for g in under70[:3]])
    print("cheapest <70 with Claude A:", [(g["name"], g["max_month"]) for g in under70_claudeA[:3]])
    print("Apple scenarios under 100:", len(apple_fits_100))
    print("breakeven:", json.dumps(breakeven, indent=0))
    print("inputs:", json.dumps(summary["inputs"], indent=1))
    if args.json:
        slim = lambda g: {"name": g["name"], "months": g["months"], "breaches": g["breaches"]}
        out = {"new_lines": NEW_LINES,
               "scenarios": [slim(g) for g in headline] + extra,
               **CONCLUSIONS,
               "inputs": summary["inputs"], "breakeven_data_usd": breakeven, "dev_only_apple": dev_only,
               "cheapest_under_100": [slim(g) for g in under100[:3]],
               "cheapest_under_70": [slim(g) for g in under70[:3]],
               "cheapest_under_70_with_claude_A": [slim(g) for g in under70_claudeA[:3]],
               "apple_scenarios_under_100_in_grid": len(apple_fits_100),
               "conventions": {"fx": "central GBP0.80/USD, 20% tax, 0% card; adverse 0.85, 20%, 3%",
                               "thresholds": "warn/reduce/pause reached at >=; plan 70 and ceiling 100 breached at >",
                               "M1": "first month prod runs with paid live data; domain bought in M1; renewal falls in M13",
                               "source_of_aws": "costs/model.json baseline results, domain amortisation removed"},
               "grid_all_combinations": [slim(g) for g in grid]}
        Path(args.json).write_text(json.dumps(out, indent=1))


if __name__ == "__main__":
    main()
