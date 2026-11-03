#!/usr/bin/env python3
"""Build MP-20's baseline sign-off pack from the records it summarises.

    python3 docs/planning/baseline-signoff-2026-11-03/build_signoff.py          # write README.md and signoff.json
    python3 docs/planning/baseline-signoff-2026-11-03/build_signoff.py --check  # fail if either is stale

Every table comes from a record named in INPUTS, and signoff.json pins each input's sha256 so a sign-off names exactly
what it approved. The cost questions are the one exception: they are worded here, and each is checked against the
cost record that raises it. A missing input, field or piece of evidence is a failure, never a skip.

When the owner signs, signoff.json gains `"signed_off": {"commit": <40-hex sha>, "owner_words": ..., "date": ...}`.
From then on the pack is a record: it is never rebuilt, and --check proves that the signed commit is in this branch's
history and that README.md, signoff.json and every pinned input are as they were at that commit. A signed commit must
reach main through a merge commit; a squash merge would orphan it, and the check would then fail closed.
"""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
PACK = "docs/planning/foundation-specifications-2026-11-02"
REC = "docs/planning/ma-reconciliation-2026-11-02"
INPUTS = {
    "decision_log": f"{REC}/decision-log.md",
    "policy_journal": "docs/planning/foundation-policy-discussion-2026-11-02.md",
    "claude_card": "docs/planning/claude-models-and-batching-2026-11-02.md",
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
    "plan_sync_rule": ".claude/rules/plan-sync.md",
    "readme": "README.md",
    "architecture": "ARCHITECTURE.md",
    "tech_stack": "TECH-STACK.md",
}
# Each cost question names the record that raises it and a phrase that record must still carry.
COST_QUESTIONS = [
    ("COST-Q1", "Claude option A plus the top-5 scan is £13.24 a month, above the proposed £10 Claude allocation. "
                "Does the scan sit in the £8 uncertainty allocation, or does the Claude allocation rise?",
     "The total stays under £70 either way; the choice changes which allocation a scan overrun stops first.",
     "tech_stack", "COST-Q1"),
    ("COST-Q2", "Keep or drop the $1.50 a month of AWS build minutes, which may double-count GitHub Actions?",
     "Dropping it lowers every month by about £1.44; £46.48 and £54.73 include it today.",
     "cost_model", "Possible double count"),
    ("COST-Q3", "How much AWS compute and storage the ~150-name end-of-day scan needs.",
     "Measured on the first dev runs; the model's reference workload is still 20 listings.",
     "cost_model", "not separately quantified"),
    ("COST-Q4", "In the Apple fee month, if the owner buys it, do optional jobs reduce and pause on the full-month total "
                "(past £85 in every case), or run while the remainder sits under £60, £75 and £85?",
     "Until the owner answers, the full-month flags stand and optional work pauses for that whole month; the "
     "remainder reaches no threshold at central FX.", "cost_spec", "COST-Q4"),
]
# One phrase, word for word, in every record that ranks precedence (lesson 7).
PRECEDENCE_PHRASE = ("The owner's recorded answers come first; the root documents follow them and win over every "
                     "other record.")
PRECEDENCE = [
    ("1", "The owner's recorded answers", "[decision log](../ma-reconciliation-2026-11-02/decision-log.md), "
     "[policy answers of 2 Nov](../foundation-policy-discussion-2026-11-02.md), "
     "[ARC-06b card](../claude-models-and-batching-2026-11-02.md), "
     "[FND-DEC receipts](../foundation-specifications-2026-11-02/owner-decisions.json)",
     "The owner's own words, dated. Every other record follows them."),
    ("2", "Root documents", "[README](../../../README.md), [ARCHITECTURE](../../../ARCHITECTURE.md), "
     "[TECH-STACK](../../../TECH-STACK.md)", "The current architecture in brief. They win over everything below."),
    ("3", "Foundation contracts", "[foundation pack](../foundation-specifications-2026-11-02/README.md)",
     "Data, cost, financial and forecasting contracts, schemas and acceptance cases, hash-pinned."),
    ("4", "Planning and topic packs", "[phases, stories, gaps](../ma-reconciliation-2026-11-02/README.md), "
     "[ARC directions](../ma-reconciliation-2026-11-02/direction-summary.md), "
     "[source rights](../source-rights-2026-11-02/README.md), [region and network](../region-network-2026-11-03/README.md)",
     "PH-00 to PH-09, the local story drafts, the open contracts and the research behind each choice."),
    ("5", "Jira", "Project MP, mirrored in [trace.json](../trace.json)",
     "Records the work, its status and the files each issue changed. It never decides architecture."),
    ("6", "Rendered views", "Confluence `mypaisaapr`, the Lucid documents, the motion, the Claude artifacts",
     "Built from 1 to 4. A view that disagrees is stale and is rebuilt; it never decides."),
    ("7", "Superseded history", "[aws-options-2026-11-01](../aws-options-2026-11-01/), "
     "[layered-development-2026-11-01](../layered-development-2026-11-01/), git history, MA",
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
    """A field that must be present and non-empty; a missing or blank one stops the build."""
    value = record.get(key) if isinstance(record, dict) else None
    if value is None or (isinstance(value, (str, list, dict)) and not value):
        sys.exit(f"build_signoff: {where} has no `{key}`")
    return value


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
    dates = need(later, "recorded_on", f"{direction['id']}'s later answers")
    return ", ".join([dates] if isinstance(dates, str) else dates)


def section(text: str, heading: str, where: str) -> str:
    """The body of a markdown section, from its heading to the next heading of the same or higher level."""
    m = re.search(rf"^(#+) {re.escape(heading)}\s*$", text, re.M)
    if not m:
        sys.exit(f"build_signoff: {where} has no section `{heading}`")
    rest = text[m.end():]
    end = re.search(rf"^#{{1,{len(m.group(1))}}} ", rest, re.M)
    return rest[: end.start()] if end else rest


def bullets(body: str, where: str) -> list[tuple[str, str]]:
    """Top-level bullets, `- **Title:** text` or plain `- text`, with their wrapped lines joined."""
    items, current = [], None
    for line in body.splitlines():
        m = re.match(r"^- (?:\*\*(.+?)\*\*:?\s*)?(.*)$", line)
        if m:
            current = [(m.group(1) or "").rstrip(":"), m.group(2)]
            items.append(current)
        elif current and line.startswith("  ") and line.strip():
            current[1] += " " + line.strip()
        elif not line.strip():
            current = None
    if not items:
        sys.exit(f"build_signoff: {where} lists no open items")
    return [(t, cell(x)) for t, x in items]


def rebase(text: str) -> str:
    """Links copied from a root document point from the repo root; make them work from this folder."""
    return re.sub(r"\]\((?!https?:|#|\.\./)([^)]+)\)", r"](../../../\1)", text)


def open_row(d: dict, topic: str, proposal_key: str, evidence_key: str, where: str) -> list:
    """One open item. A partly answered item shows what is answered and what is still open."""
    status = need(d, "status", where)
    text = need(d, proposal_key, where)
    if status == "partly_answered":
        answered = need(d, "answered_by", where)
        still = need(d, "still_open", where)
        answered = ", ".join(answered) if isinstance(answered, list) else answered
        still = "; ".join(still) if isinstance(still, list) else still
        text = f"Answered: {answered}. {still}" if "Still open:" in still else f"Answered: {answered}. Still open: {still}"
    return [d["id"], topic, status.replace("_", " "), text, need(d, evidence_key, where)]


def build() -> tuple[str, str]:
    r = {k: load(v) for k, v in INPUTS.items()}
    phases, stories = need(r["phases"], "phases", "phase baseline"), need(r["phases"], "stories", "phase baseline")
    gaps = need(r["gaps"], "gaps", "gap register")
    directions = need(r["directions"], "directions", "selected directions")
    fnd = need(r["owner_decisions"], "decisions", "owner decisions")
    later = need(need(r["owner_decisions"], "later_owner_answers", "owner decisions"), "answers", "later answers")
    sci = need(r["sci_open"], "material_choices", "forecasting open decisions")
    fin = need(r["fin_open"], "decisions", "financial open decisions")
    data = need(r["data_catalogue"], "owner_decisions", "data catalogue")
    counts = need(r["coverage"], "counts", "coverage")
    trace = {i["key"]: i for i in need(r["trace"], "issues", "trace")}
    for qid, _, _, src, phrase in COST_QUESTIONS:
        if phrase not in (json.dumps(r[src]) if isinstance(r[src], dict) else r[src]):
            sys.exit(f"build_signoff: {qid}'s record {INPUTS[src]} no longer mentions {phrase!r}")
    for key in ("plan_sync_rule", "fixed_policies"):
        if PRECEDENCE_PHRASE not in (json.dumps(r[key], ensure_ascii=False) if isinstance(r[key], dict) else r[key]):
            sys.exit(f"build_signoff: {INPUTS[key]} does not carry the precedence phrase word for word")
    if len(directions) != 12 or len(phases) != 10:
        sys.exit("build_signoff: expected 12 directions and 10 phases")
    story_ids, gap_ids = {s["id"] for s in stories}, {g["id"] for g in gaps}
    for p in phases:
        if set(p["story_ids"]) - story_ids:
            sys.exit(f"build_signoff: {p['id']} names stories that do not exist: {sorted(set(p['story_ids']) - story_ids)}")
        if set(p["gap_ids"]) - gap_ids:
            sys.exit(f"build_signoff: {p['id']} names contracts that do not exist: {sorted(set(p['gap_ids']) - gap_ids)}")
    if any(s.get("jira_key") for s in stories):
        sys.exit("build_signoff: a local story draft now carries a Jira key; update the readiness wording")
    policies = re.findall(r"^\| (\d{3}) \| ([^|]+?) \| ([^|]+?) \|$", r["policy_journal"], re.M)
    if len(policies) != 12:
        sys.exit(f"build_signoff: the policy journal's table lists {len(policies)} policies, not 12")

    closed = ("closed", "owner_confirmed")
    open_rows = []
    for d in sci:
        if not str(d["status"]).startswith(closed):
            open_rows.append(open_row(d, d["topic"], "recommendation", "why_owner_material", d["id"]))
    for d in fin:
        if not str(d["status"]).startswith(closed):
            open_rows.append(open_row(d, d["topic"], "proposal", "evidence_needed", d["id"]))
    for d in data:
        if d["status"] != "owner_confirmed":
            open_rows.append(open_row(d, "Data", "decision", "note", d["id"]))
    for qid, q, why, _, _ in COST_QUESTIONS:
        open_rows.append([qid, "Cost", "owner pending", q, why])
    claude_open = bullets(section(r["claude_card"], "Still open after this card", INPUTS["claude_card"]),
                          INPUTS["claude_card"])
    for i, (title, text) in enumerate(claude_open, 1):
        open_rows.append([f"ARC-06b-O{i}", "Claude", "open", f"{title}: {text}" if title else text,
                          "The ARC-06b card's own list; each needs its own owner answer or evidence"])
    arch_open = bullets(section(r["architecture"], "13. What is still open", "ARCHITECTURE.md"), "ARCHITECTURE.md §13")
    open_rows.append(["STORIES", "Story readiness", "open", need(r["phases"], "readiness_limit", "phase baseline"),
                      "CD-01: every story needs positive and negative acceptance, contracts, a state inventory and "
                      "dependency evidence, and a Jira key, before the UX gate"])

    gap_jira = {}
    for g in need(r["gaps"], "planning_groups", "gap register"):
        for gid in g["gap_ids"]:
            gap_jira[gid] = g["jira_key"]
    unmapped = [g["id"] for g in gaps if g["id"] not in gap_jira]
    if unmapped:
        sys.exit(f"build_signoff: gaps with no planning issue: {unmapped}")
    untraced = sorted(set(gap_jira.values()) - set(trace))
    if untraced:
        sys.exit(f"build_signoff: planning issues not in the trace: {untraced}")

    visuals = []
    for key in ("lucid_architecture", "lucid_quality"):
        m = r[key]
        folder = Path(INPUTS[key]).parent
        if m.get("spec_sha256") != sha(str(folder / "spec.json")):
            sys.exit(f"build_signoff: {folder}/spec.json differs from its manifest's spec_sha256; re-import and re-record it")
        for p in need(m, "pages", key):
            where = f"{key} page {p.get('page_number')}"
            png = need(p, "filename", where)
            if not (ROOT / folder / png).is_file():
                sys.exit(f"build_signoff: {where} has no export on disk")
            if p.get("sha256") != sha(str(folder / png)):
                sys.exit(f"build_signoff: {folder / png} does not match its manifest's sha256; re-record it")
            url = p.get("document_url") or need(m, "document_url", key)
            version = p.get("document_version") or need(m, "document_version", key)
            visuals.append([m["document_title"], f"{p['page_number']}. {need(p, 'title', where)}", url, version,
                            need(p, "status", where), sha(str(folder / png))[:12]])
    for d in need(r["artifacts"], "designs", "artifacts"):
        visuals.append(["Claude artifact", d["slug"], d["artifact_url"], d["published_at"],
                        "Design explainer, illustrative", d["published_sha256"][:12]])
    motion = sorted((ROOT / "docs/motion").glob("*.gif"))
    if not motion:
        sys.exit("build_signoff: no motion GIFs found")
    stills = [g.name for g in motion if not g.with_suffix(".png").is_file()]
    if stills:
        sys.exit(f"build_signoff: motion with no static PNG for reduced motion: {stills}")

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
        "contracts, a state inventory and dependency evidence).",
        "- **Does not approve:** any item in the open list below, which stays open with its owner and deciding "
        "evidence; UX, which starts only after this sign-off and after every story meets the readiness protocol; "
        "build, which needs the complete UX and its own explicit permission; any AWS apply, paid call or "
        "publication.",
        "- **CD-01 stays open at sign-off:** the story drafts still have to become Jira stories that meet the "
        "readiness protocol (the STORIES row below).",
        "- **Status labels used:** Proposed, Owner-selected, Approved architecture, Implemented, Deployed and "
        "verified. Today nothing is deployed; only the FastAPI health/SSE starter and CI are implemented.",
        "",
        "## Precedence: which record wins (PL-01)",
        "",
        PRECEDENCE_PHRASE,
        "",
        *table(["Rank", "Record", "Where", "Role"], [list(p) for p in PRECEDENCE]),
        "",
        "A disagreement the owner's answers and the root documents do not settle is a question for the owner, "
        "written down in the PR and on the issue; both records stay as they are until it is answered.",
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
        "**The foundation horizon replies:**",
        "",
        *[f"- **{need(d, 'id', 'FND-DEC')}:** {cell(need(d, 'answer', d['id']))}" for d in fnd],
        "",
        "**The twelve policies selected on 2 November** ([policy journal](../foundation-policy-discussion-2026-11-02.md)):",
        "",
        *table(["Policy", "Owner-selected direction", "Boundary"], [[f"POLICY-{n}", a, b] for n, a, b in policies]),
        "",
        "**Later answers, 2 and 3 November:**",
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
        "**Also open in [ARCHITECTURE.md §13](../../../ARCHITECTURE.md#13-what-is-still-open),** which the "
        "sign-off does not approve either:",
        "",
        *[f"- **{t}:** {rebase(x)}" for t, x in arch_open],
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
            [k, trace[k]["status"], ", ".join(sorted(g for g, j in gap_jira.items() if j == k))]
            for k in sorted(set(gap_jira.values()), key=lambda x: int(x.split("-")[1]))]),
        "",
        "## Visual set (CD-02)",
        "",
        *table(["Set", "View", "Link", "Lucid document version, or artifact date", "Status",
                "Export sha256 (first 12)"], visuals),
        "",
        f"Motion: {len(motion)} animations in [`docs/motion/`](../../motion/README.md), each with a static PNG "
        "for reduced motion. Confluence: "
        f"{len(r['confluence']['pages'])} pages in space `{r['confluence']['space']['key']}`, ids and versions "
        "in [`confluence.json`](../../confluence/confluence.json). Uninspected MA boards stay a recorded "
        "limitation, and no visual-parity claim is made.",
        "",
        "## Pinned inputs",
        "",
        *table(["Input", "Path", "sha256 (first 12)"],
               [[k, f"`{p}`", sha(p)[:12]] for k, p in INPUTS.items()]),
        "",
        "Rebuild with `python3 docs/planning/baseline-signoff-2026-11-03/build_signoff.py`. Until the owner signs, "
        "CI's `--check` fails when this page or `signoff.json` no longer matches its inputs; once signed, it "
        "checks the pack against the signed commit instead.",
        "",
    ]
    broken = [link for link in re.findall(r"\]\(([^)]+)\)", "\n".join(lines))
              if not link.startswith(("http", "#")) and not (HERE / link.split("#")[0]).exists()]
    if broken:
        sys.exit(f"build_signoff: links that resolve to nothing from this folder: {broken}")
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


def git(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True)


def check_signed(current: Path, record: dict) -> int:
    """A signed pack must be exactly what was at the signed commit, and that commit must be in this history."""
    signed = record["signed_off"]
    problems = []
    if not isinstance(signed, dict):
        signed = {}
    commit = signed.get("commit", "")
    if not re.fullmatch(r"[0-9a-f]{40}", str(commit)):
        problems.append("`commit` must be a full 40-character sha, not a branch, a tag or a short id")
    for field in ("owner_words", "date"):
        if not str(signed.get(field, "")).strip():
            problems.append(f"`{field}` is empty")
    if not problems and git("merge-base", "--is-ancestor", commit, "HEAD").returncode != 0:
        problems.append(f"{commit} is not in this branch's history")
    if not problems:
        then = git("show", f"{commit}:{(HERE / 'signoff.json').relative_to(ROOT)}")
        unsigned = {k: v for k, v in record.items() if k != "signed_off"}
        if then.returncode != 0 or json.loads(then.stdout) != unsigned:
            problems.append("signoff.json differs from the signed commit's")
        readme = git("show", f"{commit}:{(HERE / 'README.md').relative_to(ROOT)}")
        if readme.returncode != 0 or readme.stdout != (HERE / "README.md").read_bytes():
            problems.append("README.md differs from the signed commit's")
        for name, pin in record.get("inputs", {}).items():
            shown = git("show", f"{commit}:{pin['path']}")
            if shown.returncode != 0 or hashlib.sha256(shown.stdout).hexdigest() != pin["sha256"]:
                problems.append(f"the pin for {name} does not match the signed commit")
    if problems:
        print("build_signoff: the signed-off pack fails: " + "; ".join(problems))
        return 1
    print(f"build_signoff: signed-off pack matches commit {commit}")
    return 0


def main() -> int:
    current = HERE / "signoff.json"
    record = json.loads(current.read_text()) if current.is_file() else {}
    if "signed_off" in record:
        # Once signed, the pack is a record: it is never rebuilt, so later work on an input does not reopen what the
        # owner approved.
        if "--check" not in sys.argv[1:]:
            sys.exit("build_signoff: this pack is signed off; start a new dated pack instead of rebuilding it")
        return check_signed(current, record)
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
