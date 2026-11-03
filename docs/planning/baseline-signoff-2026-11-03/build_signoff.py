#!/usr/bin/env python3
"""Build MP-20's baseline sign-off pack from the records it summarises.

    python3 docs/planning/baseline-signoff-2026-11-03/build_signoff.py          # write README.md and signoff.json
    python3 docs/planning/baseline-signoff-2026-11-03/build_signoff.py --check  # fail if either is stale

Nothing here is typed by hand: every table comes from a record named in INPUTS, and signoff.json pins each input's
sha256 so a sign-off names exactly what it approved. A missing input or a missing field is a failure, never a skip.

When the owner signs, signoff.json gains `"signed_off": {"commit": ..., "owner_words": ..., "date": ...}`. From then
on the pack is a record: it is never rebuilt, and --check compares each pin with the input at that commit.
"""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
PACK = "docs/planning/foundation-specifications-2026-11-02"
REC = "docs/planning/ma-reconciliation-2026-11-02"
INPUTS = {
    "decision_log": f"{REC}/decision-log.md",
    "phases": f"{REC}/phase-story-baseline.json",
    "gaps": f"{REC}/gap-register.json",
    "directions_summary": f"{REC}/direction-summary.md",
    "directions": f"{PACK}/selected-directions.json",
    "owner_decisions": f"{PACK}/owner-decisions.json",
    "fixed_policies": f"{PACK}/fixed-policies.json",
    "coverage": f"{PACK}/coverage.json",
    "validation": f"{PACK}/validation.json",
    "sci_open": f"{PACK}/forecasting/open-decisions.json",
    "fin_open": f"{PACK}/financial/open-decisions.json",
    "data_catalogue": f"{PACK}/data/catalogue.json",
    "cost_model": f"{PACK}/costs/model.json",
    "cost_spec": f"{PACK}/costs/specification.md",
    "lucid_architecture": "docs/diagrams/mp-architecture-2026-11-02/manifest.json",
    "lucid_quality": "docs/diagrams/mp-quality-2026-11-02/manifest.json",
    "artifacts": "docs/design/artifacts.json",
    "confluence": "docs/confluence/confluence.json",
    "trace": "docs/planning/trace.json",
    "readme": "README.md",
    "architecture": "ARCHITECTURE.md",
    "tech_stack": "TECH-STACK.md",
}
# The cost questions live in prose (costs/specification.md and the model's uncosted list); they are named here with
# the record that holds each, and the check below fails if that record stops mentioning it.
COST_QUESTIONS = [
    ("COST-Q1", "Claude option A plus the top-5 scan is £13.24 a month, above the proposed £10 Claude allocation. "
                "Does the scan sit in the £8 uncertainty allocation, or does the Claude allocation rise?",
     "The total stays under £70 either way; the choice changes which allocation a scan overrun stops first.",
     "cost_model", "GBP5 scan allowance"),
    ("COST-Q2", "Keep or drop the $1.50 a month of AWS build minutes, which may double-count GitHub Actions?",
     "Dropping it lowers every month by about £1.44; £46.48 and £54.73 include it today.",
     "cost_model", "Possible double count"),
    ("COST-Q3", "How much AWS compute and storage the ~150-name end-of-day scan needs.",
     "Measured on the first dev runs; the model's reference workload is still 20 listings.",
     "cost_model", "not separately quantified"),
]
PRECEDENCE = [
    ("1", "The owner's recorded answers", f"[decision log]({'../ma-reconciliation-2026-11-02/decision-log.md'})",
     "The owner's own words, dated. Every other record follows them."),
    ("2", "Root documents", "[README](../../../README.md), [ARCHITECTURE](../../../ARCHITECTURE.md), "
     "[TECH-STACK](../../../TECH-STACK.md)", "The current architecture in brief. They win over everything below "
     "(`.claude/rules/plan-sync.md`)."),
    ("3", "Foundation contracts", "[foundation pack](../foundation-specifications-2026-11-02/README.md)",
     "Data, cost, financial and forecasting contracts, schemas and acceptance cases, hash-pinned."),
    ("4", "Planning pack", "[phases, stories, gaps](../ma-reconciliation-2026-11-02/README.md), "
     "[ARC directions](../ma-reconciliation-2026-11-02/direction-summary.md), dated decision packs",
     "PH-00 to PH-09, the 64 local story drafts and the 52 open contracts."),
    ("5", "Rendered views", "Confluence `mypaisaapr`, the Lucid documents, the motion, the Claude artifacts",
     "Built from 1 to 4. A view that disagrees is stale and is rebuilt; it never decides."),
    ("6", "Dated research and history", "Packs named by date, git history, MA",
     "Evidence of how a choice was reached. Never current instruction."),
]


def sha(rel: str) -> str:
    return hashlib.sha256((ROOT / rel).read_bytes()).hexdigest()


def load(rel: str):
    path = ROOT / rel
    if not path.is_file():
        sys.exit(f"build_signoff: input {rel} is missing")
    return json.loads(path.read_text()) if rel.endswith(".json") else path.read_text()


def need(record: dict, key: str, where: str):
    if key not in record:
        sys.exit(f"build_signoff: {where} has no `{key}`")
    return record[key]


def cell(text) -> str:
    return " ".join(str(text).split()).replace("|", "/")


def table(head: list[str], rows: list[list]) -> list[str]:
    out = ["| " + " | ".join(head) + " |", "| " + " | ".join("---" for _ in head) + " |"]
    return out + ["| " + " | ".join(cell(c) for c in r) + " |" for r in rows]


def refined(direction: dict) -> str:
    """The dates of the owner's later answers that refine a direction, wherever the record keeps them."""
    later = direction["answer"].get("later_owner_answers") or direction.get("later_owner_answers")
    if not later:
        return "no"
    dates = later.get("recorded_on")
    if not dates:
        sys.exit(f"build_signoff: {direction['id']} has later answers with no `recorded_on`")
    return ", ".join([dates] if isinstance(dates, str) else dates)


def build() -> tuple[str, str]:
    r = {k: load(v) for k, v in INPUTS.items()}
    phases, stories = need(r["phases"], "phases", "phase baseline"), need(r["phases"], "stories", "phase baseline")
    gaps = need(r["gaps"], "gaps", "gap register")
    directions = need(r["directions"], "directions", "selected directions")
    later = need(need(r["owner_decisions"], "later_owner_answers", "owner decisions"), "answers", "later answers")
    sci = need(r["sci_open"], "material_choices", "forecasting open decisions")
    fin = need(r["fin_open"], "decisions", "financial open decisions")
    data = need(r["data_catalogue"], "owner_decisions", "data catalogue")
    counts = need(r["coverage"], "counts", "coverage")
    trace = {i["key"]: i for i in need(r["trace"], "issues", "trace")}
    model_text = json.dumps(r["cost_model"])
    for qid, _, _, src, phrase in COST_QUESTIONS:
        if phrase not in model_text:
            sys.exit(f"build_signoff: {qid}'s record {INPUTS[src]} no longer mentions {phrase!r}")
    if len(directions) != 12 or len(phases) != 10:
        sys.exit("build_signoff: expected 12 directions and 10 phases")
    story_ids = {s["id"] for s in stories}
    for p in phases:
        missing = set(p["story_ids"]) - story_ids
        if missing:
            sys.exit(f"build_signoff: {p['id']} names stories that do not exist: {sorted(missing)}")
    if any(s.get("jira_key") for s in stories):
        sys.exit("build_signoff: a local story draft now carries a Jira key; update the readiness wording")

    open_rows = []
    for d in sci:
        if not str(d["status"]).startswith("closed"):
            open_rows.append([d["id"], d["topic"], d["status"].replace("_", " "), d["recommendation"],
                              d.get("why_owner_material", "")])
    for d in fin:
        open_rows.append([d["id"], d["topic"], d["status"].replace("_", " "), d["proposal"],
                          d.get("evidence_needed", "")])
    for d in data:
        if d["status"] != "owner_confirmed":
            open_rows.append([d["id"], "Data", d["status"].replace("_", " "), d["decision"], d.get("note", "")])
    for qid, q, why, _, _ in COST_QUESTIONS:
        open_rows.append([qid, "Cost", "owner pending", q, why])

    gap_jira = {}
    for g in need(r["gaps"], "planning_groups", "gap register"):
        for gid in g["gap_ids"]:
            gap_jira[gid] = g["jira_key"]
    unmapped = [g["id"] for g in gaps if g["id"] not in gap_jira]
    if unmapped:
        sys.exit(f"build_signoff: gaps with no planning issue: {unmapped}")

    visuals = []
    for key in ("lucid_architecture", "lucid_quality"):
        m = r[key]
        folder = Path(INPUTS[key]).parent
        if m.get("spec_sha256") != sha(str(folder / "spec.json")):
            sys.exit(f"build_signoff: {folder}/spec.json differs from its manifest's spec_sha256; re-import and re-record it")
        for p in need(m, "pages", key):
            png = p.get("filename")
            if not png or not (ROOT / folder / png).is_file():
                sys.exit(f"build_signoff: {key} page {p.get('page_number')} has no export on disk")
            if p.get("sha256") != sha(str(folder / png)):
                sys.exit(f"build_signoff: {folder / png} does not match its manifest's sha256; re-record it")
            visuals.append([m["document_title"], f"{p.get('page_number')}. {p.get('title')}",
                            p.get("document_url") or m.get("document_url"),
                            p.get("document_version") or m.get("document_version") or "see manifest",
                            sha(str(folder / png))[:12]])
    for d in need(r["artifacts"], "designs", "artifacts"):
        visuals.append(["Claude artifact", d["slug"], d["artifact_url"], d["published_at"],
                        d["published_sha256"][:12]])
    motion = sorted((ROOT / "docs/motion").glob("*.gif"))
    if not motion:
        sys.exit("build_signoff: no motion GIFs found")

    v = r["validation"]
    lines = [
        "# MP baseline sign-off pack",
        "",
        "**3 November 2026 · MP-20 · For the owner's sign-off · Architecture baseline not yet approved · "
        "UX not started · Build not authorised**",
        "",
        "This is the one place to read before signing off MP's architecture and phase/story baseline. It gathers "
        "every owner decision since 2 November, the contracts they now sit in, what is still open and who decides "
        "it, and how each phase maps to its stories and Jira issues. It is generated by "
        "[`build_signoff.py`](build_signoff.py) from the records it names; "
        "[`signoff.json`](signoff.json) pins the sha256 of every one of them, so a sign-off names exactly what it "
        "approved.",
        "",
        "## What a sign-off approves, and what it does not",
        "",
        "- **Approves:** the baseline's structure; the twelve selected directions as refined by the owner's later "
        "answers; the precedence table below; the phase-to-story crosswalk and the readiness protocol (no local "
        "story draft is a Jira issue, and each becomes one only with specific positive and negative acceptance, "
        "contracts, a state inventory and dependency evidence, before the UX gate).",
        "- **Does not approve:** any item in the open list below, which stays open with its owner and deciding "
        "evidence; UX, which starts only after this sign-off; build, which needs the complete UX and its own "
        "explicit permission; any AWS apply, paid call or publication.",
        "- **Status labels used:** Proposed, Owner-selected, Approved architecture, Implemented, Deployed and "
        "verified. Today nothing is deployed; only the FastAPI health/SSE starter and CI are implemented.",
        "",
        "## Precedence: which record wins (PL-01)",
        "",
        *table(["Rank", "Record", "Where", "Role"], [list(p) for p in PRECEDENCE]),
        "",
        "A disagreement the root documents do not settle is a question for the owner, written down in the PR and "
        "on the issue; both records stay as they are until it is answered.",
        "",
        "## The twelve directions, as refined",
        "",
        *table(["ARC", "Owner-selected direction", "Selected", "Refined by later answers"], [
            [d["id"], d["answer"]["label"], d["answer"]["recorded_on"], refined(d)] for d in directions]),
        "",
        "Full meanings: [direction summary](../ma-reconciliation-2026-11-02/direction-summary.md) and "
        "[selected-directions.json](../foundation-specifications-2026-11-02/selected-directions.json).",
        "",
        "## Owner answers since 2 November",
        "",
        *[f"- **{a['date']}:** {cell(a['summary'])}" for a in later],
        "",
        "Each answer's exact words are in the [decision log](../ma-reconciliation-2026-11-02/decision-log.md).",
        "",
        "## Contracts in the foundation pack",
        "",
        *table(["Area", "Planned acceptance cases", "Schema definitions"], [
            ["Data", counts["data_acceptance"], v["schema_definitions"]["data"]],
            ["Cost", counts["cost_acceptance"], "model and validators"],
            ["Financial", counts["financial_acceptance"], v["schema_definitions"]["financial"]],
            ["Forecasting", counts["scientific_acceptance"], v["schema_definitions"]["forecasting"]],
        ]),
        "",
        f"{sum(c for k, c in counts.items() if 'acceptance' in k)} planned acceptance cases in all. They are "
        f"written, not run: the pack's validator checks shape, arithmetic and provenance "
        f"({v['validated_positive_wire_records']} wire records, {v['cost_run_rate_variants']} cost run-rate "
        "variants), and no backend, live data, model fit or cloud proof exists yet. The budget verdict is "
        f"**{r['cost_model']['budget_verdict']['verdict']}**: "
        f"{cell(r['cost_model']['budget_verdict']['meaning'])}",
        "",
        "## Open items: each stays open until its owner answers",
        "",
        "The owner decides every item. The last column is the evidence or consequence that decides it.",
        "",
        *table(["Id", "Topic", "State", "Proposal or question", "Deciding evidence"], open_rows),
        "",
        f"Also open: all {len(gaps)} contracts in the [gap register](../ma-reconciliation-2026-11-02/"
        "gap-register.json) remain `open_planning_contract`. The decisions above settle direction; the gaps close "
        "only with their contract and evidence, through the planning issue named in the crosswalk.",
        "",
        "## Phase, story and Jira crosswalk (CD-01)",
        "",
        *table(["Phase", "Title", "Local story drafts", "Open contracts", "Jira epic", "Readiness"], [
            [p["id"], p["title"], ", ".join(p["story_ids"]), ", ".join(p["gap_ids"]) or "none",
             ", ".join(p["existing_epic_crosswalk"]) or "none", p["readiness"].replace("_", " ")]
            for p in phases]),
        "",
        f"{len(stories)} local story drafts ({r['phases']['counts']['detailed_import_drafts']} detailed, "
        f"{r['phases']['counts']['umbrella_drafts']} umbrella). None is a Jira issue yet; their ids "
        "(L0-S01 and so on) are local.",
        "",
        "### Open contract to planning issue",
        "",
        *table(["Planning issue", "Status in the trace", "Open contracts"], [
            [k, trace.get(k, {}).get("status", "not in trace"),
             ", ".join(sorted(g for g, j in gap_jira.items() if j == k))]
            for k in sorted(set(gap_jira.values()), key=lambda x: int(x.split("-")[1]))]),
        "",
        "## Visual set (CD-02)",
        "",
        *table(["Set", "View", "Link", "Lucid document version, or artifact date", "Export sha256 (first 12)"], visuals),
        "",
        f"Motion: {len(motion)} animations in [`docs/motion/`](../../motion/README.md), each with a static PNG "
        "for reduced motion. Confluence: "
        f"{len(r['confluence']['pages'])} pages in space `{r['confluence']['space']['key']}`, ids and versions "
        "in [`confluence.json`](../../confluence/confluence.json). Every view is PROPOSED design; uninspected MA "
        "boards stay a recorded limitation, and no visual-parity claim is made.",
        "",
        "## Pinned inputs",
        "",
        *table(["Input", "Path", "sha256 (first 12)"],
               [[k, f"`{p}`", sha(p)[:12]] for k, p in INPUTS.items()]),
        "",
        "Rebuild with `python3 docs/planning/baseline-signoff-2026-11-03/build_signoff.py`; CI's "
        "`--check` fails when this page or `signoff.json` no longer matches its inputs.",
        "",
    ]
    pins = {
        "issue": "MP-20",
        "status": "awaiting_owner_signoff",
        "architecture_baseline_approved": False,
        "UX_authorised": False,
        "implementation_authorised": False,
        "inputs": {k: {"path": p, "sha256": sha(p)} for k, p in INPUTS.items()},
        "open_items": [row[0] for row in open_rows],
        "open_contracts": len(gaps),
        "phases": len(phases),
        "story_drafts": len(stories),
    }
    return "\n".join(lines), json.dumps(pins, indent=1, ensure_ascii=False) + "\n"


def main() -> int:
    current = HERE / "signoff.json"
    signed = json.loads(current.read_text()).get("signed_off") if current.is_file() else None
    if signed:
        # Once signed, the pack is a record: it is never rebuilt, and each pin must match the input as it was at
        # the signed commit, so later work on an input does not reopen what the owner approved.
        if "--check" not in sys.argv[1:]:
            sys.exit("build_signoff: this pack is signed off; start a new dated pack instead of rebuilding it")
        pins = json.loads(current.read_text())["inputs"]
        bad = []
        for name, pin in pins.items():
            shown = subprocess.run(["git", "show", f"{signed['commit']}:{pin['path']}"], cwd=ROOT,
                                   capture_output=True)
            if shown.returncode != 0 or hashlib.sha256(shown.stdout).hexdigest() != pin["sha256"]:
                bad.append(name)
        if bad:
            print(f"build_signoff: pins that do not match signed commit {signed['commit']}: {', '.join(bad)}")
            return 1
        print(f"build_signoff: signed-off pack matches commit {signed['commit']}")
        return 0
    readme, pins = build()
    targets = {HERE / "README.md": readme, current: pins}
    if "--check" in sys.argv[1:]:
        stale = [p.name for p, text in targets.items() if not p.is_file() or p.read_text() != text]
        if stale:
            print(f"build_signoff: stale {', '.join(stale)}; rebuild it")
            return 1
        print("build_signoff: sign-off pack matches its inputs")
        return 0
    for path, text in targets.items():
        path.write_text(text)
    print(f"build_signoff: wrote README.md and signoff.json ({len(json.loads(pins)['open_items'])} open items)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
