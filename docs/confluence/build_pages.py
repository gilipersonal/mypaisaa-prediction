#!/usr/bin/env python3
"""Render the mypaisaapr Confluence space from the repo (MP-34).

Every page is written to docs/confluence/pages/<slug>.html in Atlassian's HTML format. The
manifest docs/confluence/confluence.json records each page's id, the version published, the
hash of the HTML sent, and each attachment's media id, so links between pages, the Lucid
exports and the GIFs resolve once the pages exist. Publishing goes through the Atlassian MCP:
create the pages, upload the attachments, then send the rendered bodies.

    python3 docs/confluence/build_pages.py write      # render every page
    python3 docs/confluence/build_pages.py tree       # print the page tree with statuses
    python3 docs/confluence/build_pages.py media      # list the attachments each page needs
    python3 docs/confluence/build_pages.py check      # fail on a page or attachment not yet published

Facts come from ARCHITECTURE.md, TECH-STACK.md, the owner decisions in docs/planning/ and the
phase baseline. Anything not decided is shown as PROPOSED; nothing here approves architecture,
UX, spending or implementation.
"""

from __future__ import annotations

import hashlib
import html
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = HERE / "pages"
MANIFEST = HERE / "confluence.json"
LUCID = ROOT / "docs/diagrams/mp-architecture-2026-11-02/manifest.json"
BASELINE = ROOT / "docs/planning/ma-reconciliation-2026-11-02/phase-story-baseline.json"
SITE = "https://duttaarun2015.atlassian.net"
SPACE = "mypaisaapr"
GITHUB = "https://github.com/gilipersonal/mypaisaa-prediction/blob/main/"
JIRA_BOARD = f"{SITE}/jira/software/projects/MP/boards/167/backlog"

# Status lozenges, in the owner's order: only evidence moves a label forward.
STATUS = {
    "implemented": ("IMPLEMENTED", "green"),
    "selected": ("OWNER-SELECTED", "blue"),
    "proposed": ("PROPOSED", "yellow"),
    "open": ("OPEN", "red"),
    "record": ("RECORD", "purple"),
}


def manifest() -> dict:
    return json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {"pages": {}, "media": {}}


M = manifest()


def esc(text: str) -> str:
    return html.escape(text, quote=False)


def url(slug: str) -> str:
    page = M["pages"].get(slug, {})
    if slug == "home":
        return f"{SITE}/wiki/spaces/{SPACE}/overview"
    return f"{SITE}/wiki/spaces/{SPACE}/pages/{page['id']}" if page.get("id") else "#"


def link(slug: str, text: str | None = None) -> str:
    return f'<a href="{url(slug)}">{esc(text or PAGES_BY_SLUG[slug]["title"])}</a>'


def repo(path: str, text: str | None = None) -> str:
    return f'<a href="{GITHUB}{path}">{esc(text or path)}</a>'


def lozenge(key: str) -> str:
    label, colour = STATUS[key]
    return f'<span data-type="status" data-color="{colour}" data-status-style="bold">{label}</span>'


def panel(icon: str, colour: str, inner: str) -> str:
    return f'<div data-type="panel-custom" data-icon=":{icon}:" data-color="{colour}">{inner}</div>'


def cols(*columns: str) -> str:
    kind = {2: "layout-two-equal", 3: "layout-three-equal"}[len(columns)]
    return f'<section data-type="{kind}">' + "".join(f'<div data-type="column">{c}</div>' for c in columns) + "</section>"


def card(icon: str, colour: str, title: str, text: str) -> str:
    return panel(icon, colour, f"<h3>{title}</h3><p>{text}</p>")


def table(head: list[str], rows: list[list[str]]) -> str:
    th = "".join(f"<th>{h}</th>" for h in head)
    body = "".join("<tr>" + "".join(f"<td><p>{c}</p></td>" for c in row) + "</tr>" for row in rows)
    return f"<table><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table>"


def ul(items: list[str]) -> str:
    return "<ul>" + "".join(f"<li><p>{i}</p></li>" for i in items) + "</ul>"


def expand(title: str, inner: str) -> str:
    return f"<details><summary>{esc(title)}</summary>{inner}</details>"


def tabs(items: list[tuple[str, str]]) -> str:
    params = json.dumps({"tabs": [{"id": f"tab{i}", "title": t} for i, (t, _) in enumerate(items, 1)]})
    frames = "".join(f'<div data-type="extension-frame">{body}</div>' for _, body in items)
    return (f'<div data-type="multi-bodied-extension" data-extension-key="native-tabs" '
            f"data-extension-type=\"com.atlassian.confluence.native\" data-parameters='{params}'>{frames}</div>")


def macro(key: str, params: dict, inline: bool = False) -> str:
    data = json.dumps({"macroParams": {k: {"value": v} for k, v in params.items()},
                       "macroMetadata": {"schemaVersion": {"value": "1"}}})
    tag = "span" if inline else "div"
    kind = "inline-extension" if inline else "extension"
    return (f'<{tag} data-type="{kind}" data-extension-key="{key}" '
            f"data-extension-type=\"com.atlassian.confluence.macro.core\" data-parameters='{data}'></{tag}>")


def media(slug: str, path: str, caption: str, width: int = 100) -> str:
    """An attachment of this page: a Lucid export or a GIF, resolved through the manifest."""
    MEDIA_NEEDED.setdefault(slug, []).append(path)
    item = M["media"].get(slug, {}).get(path)
    name = Path(path).name
    if not item:
        return panel("hourglass", "#F4F5F7", f"<p><em>Image to attach: {esc(name)}</em></p>")
    return (f'<figure data-type="media-single" data-layout="center" data-width="{width}" data-width-type="percentage">'
            f'<div data-type="media" data-media-type="file" data-id="{item["id"]}" data-collection="{item["collection"]}" '
            f'data-alt="{esc(name)}"></div><figcaption>{esc(caption)}</figcaption></figure>')


def lucid_doc() -> dict:
    return json.loads(LUCID.read_text()) if LUCID.exists() else {"pages": [], "document_url": "#"}


def lucid(slug: str, number: int, caption: str) -> str:
    doc = lucid_doc()
    page = next((p for p in doc["pages"] if p.get("page_number") == number), None)
    if not page:
        return panel("hourglass", "#F4F5F7", f"<p><em>Lucid page {number} to export.</em></p>")
    open_link = f'<p style="font-size: 14px"><a href="{doc["document_url"]}">Open it in Lucid</a> (page {number}).</p>'
    return media(slug, f"docs/diagrams/mp-architecture-2026-11-02/{page['filename']}", caption) + open_link


def gif(slug: str, name: str, caption: str) -> str:
    return media(slug, f"docs/motion/{name}.gif", caption, width=90)


def banner(status: str, text: str, sources: list[str]) -> str:
    src = ", ".join(repo(s, Path(s).name) for s in sources)
    return panel("pushpin", "#F4F5F7", f"<p>{lozenge(status)} {text}</p><p style=\"font-size: 14px\">Source in the repo: {src}.</p>")


def footer() -> str:
    return ('<hr><p style="font-size: 14px"><em>Generated from the repo by docs/confluence/build_pages.py (MP-34). '
            "Change the repo, not this page: the next publish overwrites edits made here.</em></p>")


MEDIA_NEEDED: dict[str, list[str]] = {}


def baseline() -> dict:
    return json.loads(BASELINE.read_text())


# ------------------------------------------------------------------------------------------- pages

def home(s: str) -> str:
    return (panel("crystal_ball", "#DEEBFF",
                  "<p><strong>Mypaisaa Prediction</strong> is a private research tool for long-term investing in US, UK "
                  "and Indian shares and ETFs. It keeps its own record of what you own, forecasts with honest ranges, "
                  "freezes every forecast and grades it after its horizon, and has Claude explain the evidence. "
                  "It never trades.</p>"
                  f"<p>Start at {link('hub')}, or go straight to {link('record')}, {link('roadmap')} or {link('journeys')}.</p>")
            + "<h2>Search this space</h2><p>" + macro("livesearch", {"spaceKey": "currentSpace()"}, inline=True) + "</p>"
            + "<h2>Recently updated</h2>" + macro("recently-updated", {"max": "10", "theme": "concise", "hideHeading": "true"})
            + footer())


def hub(s: str) -> str:
    b = baseline()
    return (panel("crystal_ball", "#DEEBFF",
                  "<p><strong>Show the uncertainty. Score every forecast.</strong> Mypaisaa Prediction (MP) helps one owner "
                  "understand their holdings and judge where to add, hold, pause or trim. Code does the maths, models "
                  "forecast in ranges, Claude explains, and the owner decides. It holds no broker login and cannot trade.</p>")
            + cols(card("compass", "#EAE6FF", "Planning", "The architecture directions are chosen; the full baseline, the UX and "
                        "permission to build are still ahead. Nothing is deployed."),
                   card("white_check_mark", "#E3FCEF", f"{len(b['phases'])} phases", f"PH-00 to PH-09, with {b['story_count']} story "
                        "drafts that are not yet Jira stories."),
                   card("moneybag", "#FFFAE6", "£100 a month", "All-in: dev and prod AWS, market data, Claude and evals. "
                        "The draft costs do not yet show it fits."))
            + "<h2>🎬 One forecast, from cutoff to score</h2>" + gif(s, "forecast-lifecycle", "Freeze the inputs, forecast a distribution, wait for the horizon, score the outcome. Illustrative values.")
            + "<h2>🧭 Where to look</h2>"
            + cols(card("blue_book", "#DEEBFF", link("record"), "The architecture area by area: the rules, the system on AWS, data, the ledger, forecasting, Claude, identity, admin, guardrails, the doors, delivery, cost."),
                   card("compass", "#E3FCEF", link("journeys"), "Opening the app, importing a statement, the daily forecast, asking why, and the learning loop, animated."),
                   card("world_map", "#EAE6FF", link("roadmap"), "Ten phases and the four owner gates before anything is built."))
            + cols(card("books", "#FFFAE6", link("phases"), "One page per phase: outcome, gate, dependencies, rollback and the story drafts."),
                   card("art", "#FFEBE6", link("screens"), "PROPOSED. Screens wait for the architecture sign-off; this page holds their place."),
                   card("building_construction", "#E6FCFF", link("drawings"), "The Lucid drawings and the motion, and how each is rebuilt from the repo."))
            + panel("link", "#F4F5F7", f"<h3>{link('sync')}</h3><p>How the repo, Jira, Lucid and this space are kept the same.</p>")
            + "<h2>🚦 Status labels</h2>"
            + table(["Label", "Meaning"], [
                [lozenge("implemented"), "Code in the repo that runs: the FastAPI health route and sample SSE stream, the synthetic data tools, CI."],
                [lozenge("selected"), "Chosen by the owner (ARC-01 to ARC-12, ARC-06b, the twelve policy answers). Not built, not deployed."],
                [lozenge("proposed"), "A draft or a placeholder. Needs a decision, evidence or the owner's approval."],
                [lozenge("open"), "A question with no answer yet."]])
            + "<h2>🔗 Elsewhere</h2>"
            + ul([f'<a href="{JIRA_BOARD}">The MP board in Jira</a>', repo("README.md", "The README"),
                  repo("ARCHITECTURE.md", "ARCHITECTURE.md"), repo("TECH-STACK.md", "TECH-STACK.md"),
                  f'<a href="{lucid_doc()["document_url"]}">The architecture in Lucid</a>'])
            + footer())


def roadmap(s: str) -> str:
    b = baseline()
    rows = [[f"<strong>{p['id']}</strong>", esc(p["title"]), esc(", ".join(p["planning_dependencies"]) or "none"),
             esc(", ".join(p["implementation_dependencies"]) or "none"), esc(p["exit_gate"])] for p in b["phases"]]
    return (banner("proposed", "The phases are planning layers, not dates. Nothing is approved to build.",
                   ["docs/planning/ma-reconciliation-2026-11-02/phase-story-baseline.json"])
            + "<h2>🎬 The road and the four gates</h2>" + gif(s, "roadmap", "Ten phases; four owner gates come before any build.")
            + "<h2>🚦 The four gates, in order</h2>"
            + "<ol start=\"1\"><li><p><strong>Architecture sign-off</strong> of the contracts and the phase and story baseline at an exact revision (MP-20). " + lozenge("open") + "</p></li>"
            + "<li><p><strong>Full UX design</strong>, user and admin journeys end to end, designed locally first. " + lozenge("proposed") + "</p></li>"
            + "<li><p><strong>UX approval</strong> by the owner. " + lozenge("proposed") + "</p></li>"
            + "<li><p><strong>Permission to build.</strong> Only then does application code start. " + lozenge("proposed") + "</p></li></ol>"
            + "<h2>🗺️ The phases</h2>" + lucid(s, 9, "The road: PH-00 to PH-09 with their dependencies and the owner gates.")
            + table(["Phase", "Outcome", "Plans after", "Builds after", "Exit gate"], rows)
            + footer())


def phases(s: str) -> str:
    b = baseline()
    return (banner("proposed", "Draft planning only. Each phase page shows its outcome, gate, dependencies, rollback and story drafts.",
                   ["docs/planning/ma-reconciliation-2026-11-02/phase-story-baseline.json"])
            + panel("warning", "#FFFAE6", f"<p>{esc(b['readiness_limit'])}</p>")
            + macro("children", {"all": "true", "depth": "1"}) + footer())


def phase_page(pid: str):
    def render(s: str) -> str:
        b = baseline()
        p = next(x for x in b["phases"] if x["id"] == pid)
        stories = [x for x in b["stories"] if x["phase_id"] == pid]
        story_rows = [[f"<code>{x['id']}</code>", esc(x["title"]),
                       esc("detailed draft" if x.get("granularity") != "umbrella_requires_decomposition" else "umbrella, to split"),
                       esc(x.get("jira_key") or "not in Jira")] for x in stories]
        acceptance = "".join(expand(f"{x['id']} · {x['title']}", ul([esc(a) for a in x.get("acceptance", [])]) or "<p>None recorded.</p>")
                             for x in stories)
        return (banner("proposed", f"{esc(p['id'])} is draft planning. Implementation is not authorised; readiness: "
                                   f"{esc(p.get('readiness', 'blocked').replace('_', ' '))}.",
                       ["docs/planning/ma-reconciliation-2026-11-02/phase-story-baseline.json"])
                + cols(card("dart", "#DEEBFF", "Exit gate", esc(p["exit_gate"])),
                       card("rewind", "#FFEBE6", "If it goes wrong", esc(p["failure_or_rollback"])))
                + "<h2>🔗 Depends on</h2>"
                + table(["Kind", "Phases"], [["Planning", esc(", ".join(p["planning_dependencies"]) or "none")],
                                             ["Building", esc(", ".join(p["implementation_dependencies"]) or "none")]])
                + "<h2>🚪 To start</h2>" + ul([esc(x) for x in p["entry_requirements"]])
                + "<h2>📦 It delivers</h2>" + ul([esc(x) for x in p["deliverables"]])
                + (f"<h2>🧾 Contracts</h2><p>{esc(', '.join(p.get('contract_catalogue', [])))}</p>" if p.get("contract_catalogue") else "")
                + f"<h2>📋 Story drafts ({len(stories)})</h2>"
                + panel("information_source", "#E6FCFF", "<p>Local drafts. None is a Jira story yet; each is split and filed only after the architecture sign-off.</p>")
                + table(["Draft", "Title", "Shape", "Jira"], story_rows)
                + "<h3>Proposed acceptance</h3>" + acceptance
                + (f"<h2>❓ Gaps it carries</h2><p>{esc(', '.join(p.get('gap_ids', [])))}. See {link('rec-decisions')}.</p>" if p.get("gap_ids") else "")
                + footer())
    return render


def record(s: str) -> str:
    return (banner("record", "The whole architecture, one area per page. Each page says what is owner-selected and what is still proposed.",
                   ["ARCHITECTURE.md", "TECH-STACK.md"])
            + lucid(s, 1, "The system on AWS: two doors, the edge, the API, the work, Claude, the models and the records.")
            + "<h2>🏛️ Area by area</h2>" + macro("children", {"all": "true", "depth": "1"}) + footer())


def rec_rules(s: str) -> str:
    return (banner("selected", "The four rules hold for every part of MP.", ["ARCHITECTURE.md", "AGENTS.md"])
            + cols(card("1234", "#DEEBFF", "Numbers from code and models", "Ledger figures, returns, XIRR and risk are Python. Forecasts come from evaluated numerical models. Claude explains, and every figure it quotes comes from a versioned tool result."),
                   card("snowflake", "#E6FCFF", "Frozen, then graded", "Every forecast records its cutoff, model, horizon and distribution. It is scored only after the horizon and never rewritten."))
            + cols(card("raised_hand", "#E3FCEF", "Nothing changes without you", "One controlled writer commits only the exact change the owner approved. A better model goes live only with the owner's approval and its evidence."),
                   card("no_entry", "#FFEBE6", "It cannot trade", "No broker credentials, no order path, no personalised financial advice. Decision support with its uncertainty on show."))
            + "<h2>🌍 What MP does</h2>"
            + table(["", "What", "How"], [
                ["Holdings", "One record of what you own, in GBP, USD and INR", "CSV, Excel, PDFs, screenshots and manual entry; uncertain values stay drafts"],
                ["Coverage", "20 to 30 shares and ETFs across the US, UK and India", "Yahoo Finance and Twelve Data Grow, each listing checked for rights"],
                ["Forecasts", "Ranges for 1 day, 5, 10, 20 trading days, 3, 6, 12 months", "Baselines first, then bounded challengers, qualified per task"],
                ["Scenarios", "3 and 5-year downside, central and upside", "Editable assumptions that need approval; no implied likelihood"],
                ["Monitoring", "Quote and risk checks every 30 minutes; a 07:30 briefing", "Push to the app and the PWA; quiet hours 22:00 to 07:00"],
                ["Recommendations", "Add, hold, pause, trim, rebalance", "With reasons and uncertainty; MP abstains when the evidence is thin"]])
            + "<h2>⚖️ Which decision wins</h2><p>Current owner instructions, then the twelve policy answers, then the selected directions, then the drafts, then history.</p>"
            + footer())


def rec_system(s: str) -> str:
    return (banner("selected", "Owner-selected directions drawn as a proposed topology. Nothing here is deployed; only the FastAPI starter runs, on a laptop.",
                   ["ARCHITECTURE.md", "docs/diagrams/mp-architecture-2026-11-02/manifest.json"])
            + lucid(s, 1, "Numbered flows follow the four journeys.")
            + "<h2>🧱 The layers</h2>"
            + table(["Layer", "Services", "Status"], [
                ["Doors", "SvelteKit PWA on CloudFront and S3; SwiftUI app in a React Native shell", lozenge("selected")],
                ["Edge and identity", "API Gateway (HTTPS and SSE); Cognito with Apple, Google and passkeys", lozenge("selected")],
                ["API", "FastAPI on ordinary Lambda, <code>/api/v1</code>", lozenge("implemented") + " starter, locally"],
                ["Work", "EventBridge Scheduler, SQS with dead-letter queues, Lambda Durable Functions in Python", lozenge("selected")],
                ["Claude", "One Lambda worker per task route, Anthropic Python SDK", lozenge("selected")],
                ["Models", "Capped SageMaker CPU training; approved artefacts served from a Lambda", lozenge("selected")],
                ["Records", "DynamoDB and private, encrypted S3", lozenge("selected")],
                ["Operations", "CloudWatch, X-Ray, CloudTrail, Secrets Manager", lozenge("proposed")]])
            + panel("no_entry_sign", "#FFEBE6", "<p>Not in the plan without a costed ADR: NAT Gateway, load balancers, RDS, GPUs, always-on endpoints.</p>")
            + "<h2>🎬 Four journeys through it</h2>" + gif(s, "system-flow", "Open the app, import a statement, the daily forecast, ask why.")
            + footer())


def rec_data(s: str) -> str:
    return (banner("selected", "ARC-01 keeps Yahoo Finance and Twelve Data Grow. Their rights per listing and per use are not yet verified.",
                   ["docs/planning/ma-reconciliation-2026-11-02/direction-summary.md", "docs/planning/foundation-specifications-2026-11-02/README.md"])
            + table(["Topic", "Decision", "Status"], [
                ["Sources", "Yahoo Finance plus Twelve Data Grow; Basic ($0) considered for dev", lozenge("selected")],
                ["Rights", "A rights matrix per listing and per use (display, history, training, Claude) before any live data", lozenge("open")],
                ["What every observation keeps", "Provider, symbol mapping, source time, ingestion time, quality flags; validated before it is stored", lozenge("selected")],
                ["Freshness", "Stale or partial data is shown as such, never hidden behind a spinner", lozenge("selected")],
                ["Calendars", "Each listing's real sessions; month horizons roll back to the preceding valid session", lozenge("selected")],
                ["Fallback", "If a source fails, fall back to daily or show unavailable; no silent paid upgrade", lozenge("selected")],
                ["Coverage", "20 to 30 listings first; China, Taiwan, Hong Kong and Europe later through adapters", lozenge("proposed")]])
            + "<h2>🧪 Synthetic data, for now</h2><p>Real instrument identities with simulated prices and sample PDFs and screenshots, so everything can be specified and tested before any live entitlement. "
            + repo("docs/synthetic-test-data.md", "How the fixtures are made") + ".</p>" + footer())


def rec_ledger(s: str) -> str:
    return (banner("selected", "ARC-02: DynamoDB and private S3 with one controlled writer. The policy answers below are owner-selected; the contracts are drafts.",
                   ["docs/planning/foundation-policy-discussion-2026-11-02.md"])
            + "<h2>🎬 Importing a statement</h2>" + gif(s, "import-approval", "Quarantine, extraction with no tools, a proposal, your approval within 15 minutes, one writer.")
            + lucid(s, 5, "Importing a statement, lane by lane.")
            + "<h2>📜 The ledger policies you chose</h2>"
            + table(["Policy", "Decision", "Boundary"], [
                ["POLICY-001", "A 15-minute window to approve an import or correction", "Exact approved content; the trusted writer must start within it"],
                ["POLICY-005", "Explicitly approved complete transaction groups can go in", "Dependent entries stay together; unresolved entries stay pending"],
                ["POLICY-007", "Holdings on trade date, cash settled separately", "Source dates kept; no guessed settlement, no double-counted cash"],
                ["POLICY-009", "A labelled analytical FIFO fallback when the history supports it", "Broker figures kept; separate from tax basis; no invented history"],
                ["POLICY-012", "Versioned rebuild proposals when a later upload fills a gap", "Reconciled and approved before use; earlier predictions unchanged"]])
            + "<h2>🧾 Records</h2>" + lucid(s, 8, "The core records and how they relate. PROPOSED.")
            + panel("warning", "#FFFAE6", "<p>Open: DynamoDB ledger atomicity, completeness and indexes; S3 and DynamoDB share no transaction, so commits must be idempotent and resumable.</p>")
            + footer())


def rec_forecast(s: str) -> str:
    return (banner("selected", "ARC-04 and ARC-05, the horizons and the forecasting policies are owner-selected. Thresholds and model families are proposed.",
                   ["ARCHITECTURE.md", "docs/planning/foundation-policy-discussion-2026-11-02.md"])
            + lucid(s, 3, "The forecast pipeline, from data to a scored outcome.")
            + "<h2>⏱️ What is forecast</h2>"
            + cols(card("calendar", "#DEEBFF", "Horizons", "Next day; 5, 10 and 20 trading days; 3, 6 and 12 calendar months. Each target, horizon, currency and market kind earns eligibility on its own."),
                   card("crystal_ball", "#EAE6FF", "Scenarios", "Separate 3 and 5-year downside, central and upside templates with editable assumptions (POLICY-004). Central claims no likelihood."))
            + "<h2>🎬 The daily window</h2>" + gif(s, "daily-window", "Collection starts at +15, the missing-data retry at +40, the cutoff freezes at +60, forecasts are issued by +75 (POLICY-002).")
            + "<h2>🪜 How models earn trust</h2>"
            + table(["Rung", "Models", "To pass"], [
                ["R0 baselines", "Rules, zero return, trailing events, empirical distributions", "Correct semantics, chronological comparison"],
                ["R1 regularised", "Ridge for returns, logistic for events", "Fold-local transforms, purge and embargo, matured labels"],
                ["R2 challengers", "Histogram gradient-boosted, quantile and event models", "Beat the baseline, then shadow, then owner promotion"]])
            + ul(["Never a random split: walk-forward folds sized to the horizon.",
                  "Two experiment campaigns a month at most across dev and prod, each up to 96 fits and 6 instance-hours (POLICY-008).",
                  "The combined score needs all three of growth, protection and opportunity at 35, 40 and 25 (POLICY-006).",
                  "An affected scope pauses itself on an approved trigger and restarts only with the owner's approval (POLICY-003)."])
            + "<h2>🔁 Controlled learning</h2>" + gif(s, "learning-loop", "Record, wait, score, propose, shadow, and only then your approval.")
            + footer())


def rec_claude(s: str) -> str:
    return (banner("selected", "ARC-06 and ARC-06b, chosen 2 November 2026: option A, all routes. Activation still waits on the credit check and each route's evaluation.",
                   ["docs/planning/claude-models-and-batching-2026-11-02.md"])
            + "<h2>🎬 Two lanes</h2>" + gif(s, "claude-routes", "Haiku triages overnight, Opus analyses a few events, Sonnet answers live.")
            + lucid(s, 4, "Claude routes, the batch lane and the gates around them.")
            + table(["Route", "Model", "Lane"], [
                ["Triage of news, filings and calendar items", "Haiku 5.5", "Batch"],
                ["Event analysis, at most 3 a day", "<strong>Opus 5.5</strong>", "Batch"],
                ["Model inputs from triage and analysis", "Haiku 5.5", "Batch"],
                ["Statement and screenshot extraction", "Haiku 5.5", "Live"],
                ["Explanations and the 07:30 briefing", "Sonnet 5.5", "Live"],
                ["Chat, ask why", "Sonnet 5.5", "Live"],
                ["Grading answers for evaluations", "Sonnet 5.5", "Batch"]])
            + cols(card("money_with_wings", "#FFFAE6", "About £8.24 a month", "A normal month at the cost model's volumes, before caching. Batches are half price and stack with caching."),
                   card("lock", "#FFEBE6", "Zero calls today", "No Claude call until the shared credit is verified. No paid fallback."))
            + "<h2>❓ Still open</h2>" + ul(["The server-side refusal fallback on Sonnet and Opus.", "Daily caps on chat turns, tokens and tools.",
                                            "The measured event-analysis volume, added to the cost model."])
            + footer())


def rec_identity(s: str) -> str:
    return (banner("selected", "ARC-07 selects Cognito with assurance and freshness checks. Tier, session lengths and devices are proposed.",
                   ["ARCHITECTURE.md"])
            + lucid(s, 6, "Sign-in, recovery and step-up for sensitive actions.")
            + table(["Topic", "Decision", "Status"], [
                ["Sign-in", "Cognito with Apple, Google and passkeys", lozenge("selected")],
                ["Owner linking", "Verified linking and two independent recovery paths", lozenge("selected")],
                ["Step-up", "Sensitive actions need a fresh, strong sign-in", lozenge("selected")],
                ["Approval window", "15 minutes to start the exact approved commit (POLICY-001)", lozenge("selected")],
                ["Export links", "New downloads allowed for one hour (POLICY-011)", lozenge("selected")],
                ["Tier, session lengths, device list", "To specify and price", lozenge("proposed")]])
            + footer())


def rec_admin(s: str) -> str:
    return (banner("selected", "ARC-08: every admin journey is specified before the first build. The journeys themselves are placeholders until UX.",
                   ["docs/planning/ma-reconciliation-2026-11-02/direction-summary.md"])
            + "<h2>🛠️ The admin domains</h2>"
            + table(["Domain", "Status"], [[d, lozenge("proposed")] for d in [
                "Files and imports", "Audit", "Runs and health", "Agents, models and evals", "Approvals and configuration",
                "Costs and budgets", "Incidents and recovery", "Identity and devices"]])
            + "<h2>🗄️ Retention you chose</h2>"
            + table(["What", "Kept for"], [
                ["Core financial and decision evidence", "The life of the account, subject to deletion (POLICY-010)"],
                ["Original files", "A renewable 24 months"],
                ["Operational logs, rich traces, run summaries", "14, 30 and 90 days"]])
            + panel("warning", "#FFFAE6", "<p>Open: protected anchors, restore-erasure, deletion semantics and storage cost need proof.</p>")
            + footer())


def rec_guardrails(s: str) -> str:
    return (banner("selected", "ARC-09: Inspect AI with deterministic checks. Cases, budgets and thresholds are proposed.",
                   ["ARCHITECTURE.md"])
            + lucid(s, 2, "Who may do what. Rose cells are refusals.")
            + ul(["Tools are allowlisted and read-only by default, with typed schemas and per-call budgets.",
                  "Files, pages and tool output are untrusted data. Extraction runs with no tools and no write authority.",
                  "Agents cannot write the ledger, publish or change a forecast, promote a model, read secrets or trade.",
                  "Deterministic checks and replays come first; budgeted live checks and human-calibrated judges later.",
                  "Runtime guardrails and numerical forecast validation are separate evidence."])
            + footer())


def rec_clients(s: str) -> str:
    return (banner("selected", "ARC-10: a static SvelteKit PWA and an Apple app, both on the authenticated FastAPI. Screens are not designed yet.",
                   ["ARCHITECTURE.md", "TECH-STACK.md"])
            + cols(card("globe_with_meridians", "#DEEBFF", "Web", "A prebuilt, static SvelteKit 3 PWA on S3 and CloudFront. Market discovery first, holdings a tap away, chat to explain."),
                   card("iphone", "#EAE6FF", "Apple", "SwiftUI owns the iOS and iPadOS screens, persistence, widgets, Keychain and notifications; the React Native shell owns navigation and typed bridges."))
            + ul(["Accessible and responsive; never hide risk, staleness or a provider's status behind a spinner.",
                  "SSE for short notices; durable state is always an authenticated read."])
            + f"<p>The screens themselves: {link('screens')}.</p>" + footer())


def rec_delivery(s: str) -> str:
    return (banner("implemented", "CI is implemented. Separate dev and prod accounts are owner-selected (ARC-11); nothing is provisioned.",
                   [".github/workflows/verify.yml", "docs/github-workflow.md"])
            + lucid(s, 7, "Environments and delivery.")
            + table(["Check", "What it runs", "Status"], [
                ["Backend", "Lock freshness, Ruff, pytest", lozenge("implemented")],
                ["Docs", "README, ARCHITECTURE and TECH-STACK links, the mark, the GIFs", lozenge("implemented")],
                ["Review tooling", "Review runner, PR policy and check selection tests", lozenge("implemented")],
                ["Agent config", "Claude skills, rules and Jira flow, Codex JSON, protection names", lozenge("implemented")],
                ["Static preview", "The concept site build and checks", lozenge("implemented")],
                ["Workflow lint", "actionlint on every workflow", lozenge("implemented")],
                ["Jira traceability", "MP key on the branch, the title and every commit", lozenge("implemented")]])
            + ul(["Every change is on an <code>MP-&lt;n&gt;-&lt;slug&gt;</code> branch, merged to main through a PR.",
                  "Infrastructure as code is plan-only; nothing is applied without an explicit request.",
                  "Branch protection is not enforced on the current GitHub plan; the intended settings are versioned."])
            + footer())


def rec_cost(s: str) -> str:
    return (banner("selected", "The £100 all-in ceiling and its split are owner-selected. The draft costs do not yet show it fits.",
                   ["docs/planning/foundation-specifications-2026-11-02/costs/specification.md", "TECH-STACK.md"])
            + gif(s, "budget", "The ceiling, the £70 plan and three draft scenarios.")
            + table(["Part of the £70 plan", "Up to"], [["Market data", "£30"], ["AWS, both accounts", "£22"], ["Claude and evaluations", "£10"], ["Forecast and price uncertainty", "£8"]])
            + table(["Draft scenario (Claude blocked)", "Cash in the month"], [
                ["Grow $79, an ordinary month", "£94.48"], ["Grow $79, the month the domain renews", "£108.88, over the ceiling"],
                ["Grow $55 if offered, that month", "£60.88"]])
            + ul(["Warn at £60, reduce optional work at £75, pause it at £85.",
                  "Cash is counted in the month an invoice is due. No paid fallback switches on by itself.",
                  "The shared $200 Claude credit is owner-reported and unverified; admissible credit is zero."])
            + footer())


def rec_observability(s: str) -> str:
    return (banner("proposed", "A placeholder. Telemetry, traces, alarms and the cost dashboard are to be specified.",
                   ["ARCHITECTURE.md"])
            + ul(["Every run records its trigger, model calls, tokens, cost, tools and outcome.",
                  "One trace from the door to the model.",
                  "Internal estimates live, Anthropic usage every six hours, AWS billing daily, with the lag shown.",
                  "Dev and prod shown apart; estimates, credits and reconciled billing kept separate."])
            + panel("hourglass", "#FFFAE6", "<p>To decide: the collector, the alarms and who hears them, the dashboard, retention per signal.</p>")
            + footer())


def rec_decisions(s: str) -> str:
    gaps = json.loads((ROOT / "docs/planning/ma-reconciliation-2026-11-02/gap-register.json").read_text())
    gaps = gaps.get("gaps", gaps) if isinstance(gaps, dict) else gaps
    arc = [("ARC-01", "Source rights and budget", "Keep Yahoo and Twelve Data Grow; verify uses"),
           ("ARC-02", "Ledger and imports", "DynamoDB and S3 with one controlled writer"),
           ("ARC-03", "Durable workflows", "Lambda Durable Functions in Python"),
           ("ARC-04", "ML training and serving", "Selective SageMaker training, Lambda inference"),
           ("ARC-05", "Experiments and calibration", "Baselines first, then bounded challengers"),
           ("ARC-06", "Claude routes", "A separate Lambda worker per task route"),
           ("ARC-06b", "Claude models and batching", "Haiku triage, Opus event analysis, Sonnet live"),
           ("ARC-07", "Identity and step-up", "Cognito with assurance and freshness checks"),
           ("ARC-08", "Admin, audit, retention", "Every admin journey specified before the first build"),
           ("ARC-09", "Guardrails and evaluation", "Inspect AI with deterministic checks"),
           ("ARC-10", "Client rendering", "Static SvelteKit PWA with authenticated FastAPI"),
           ("ARC-11", "Environments", "Separate dev and prod AWS accounts"),
           ("ARC-12", "Documentation freeze", "Architecture-area specs linked to phases and stories")]
    decisions = "".join(f'<li data-type="decision-item" data-state="DECIDED"><strong>{a}</strong> {esc(b)}: {esc(c)}</li>' for a, b, c in arc)
    gap_rows = [[f"<code>{g['id']}</code>", esc(g["title"]), esc(g.get("disposition", "").replace("_", " "))] for g in gaps]
    return (banner("record", "Every owner decision so far, and every open gap.",
                   ["docs/planning/ma-reconciliation-2026-11-02/direction-summary.md", "docs/planning/foundation-policy-discussion-2026-11-02.md",
                    "docs/planning/ma-reconciliation-2026-11-02/gap-register.json"])
            + "<h2>✅ The directions</h2>" + f'<ul data-type="decision-list">{decisions}</ul>'
            + "<h2>📜 The twelve policy answers</h2>"
            + table(["Policy", "Selected"], [
                ["001", "15-minute import and correction approval window"], ["002", "Daily forecasts at close +75 minutes"],
                ["003", "Automatic safety pause; owner-approved restart"], ["004", "Editable 3 and 5-year scenario templates"],
                ["005", "Explicitly approved complete groups within an import"], ["006", "All three components for the combined score"],
                ["007", "Trade-date holdings, separate settlement"], ["008", "Shared model-experiment ceilings"],
                ["009", "Labelled analytical FIFO fallback"], ["010", "Account-lifetime core evidence retention"],
                ["011", "One-hour private export download links"], ["012", "Versioned historical rebuild proposals"]])
            + f"<h2>❓ The {len(gap_rows)} open gaps</h2>" + expand("Show every gap", table(["Gap", "What", "Disposition"], gap_rows))
            + footer())


def journeys(s: str) -> str:
    return (banner("proposed", "The journeys as designed so far. Screens come after the architecture sign-off.",
                   ["ARCHITECTURE.md"])
            + tabs([("Open the app", gif(s, "system-flow", "Sign in, read the published ledger, live notices over SSE.")),
                    ("Import a statement", gif(s, "import-approval", "Quarantine, extraction with no tools, your approval, one writer.")),
                    ("The daily forecast", gif(s, "daily-window", "Prices in, frozen at the cutoff, forecasts issued at +75.")),
                    ("Ask why", gif(s, "claude-routes", "Claude answers from stored, cited evidence; it cannot change a forecast.")),
                    ("Learn", gif(s, "learning-loop", "Record, wait, score, propose, shadow, and your approval."))])
            + table(["Journey", "Path", "What holds"], [
                ["Open the app", "Door → CloudFront → Cognito → API Gateway → FastAPI → DynamoDB", "Reads pin one complete published version"],
                ["Import a statement", "Door → API → private S3 → workflow → extraction with no tools → proposal → approval → writer", "Nothing is written until the exact change is approved"],
                ["The daily forecast", "Scheduler → SQS → data workers → S3 → workflow → inference → DynamoDB", "Inputs freeze at the cutoff; only approved artefacts run"],
                ["Ask why", "Door → API → Claude worker → Anthropic → read-only tools → answer", "Every figure from a tool result"]])
            + footer())


def screens(s: str) -> str:
    return (banner("proposed", "A placeholder. No screen is designed yet: UX starts only after the architecture sign-off, and building only after UX approval.",
                   ["docs/planning/future-architecture-sites-ux-direction-2026-11-02.md"])
            + table(["Area", "Doors", "Status"], [[a, "Web and Apple", lozenge("proposed")] for a in [
                "Sign-in and recovery", "Market discovery (the landing view)", "Holdings and one holding", "Imports and approvals",
                "Forecasts by horizon, with their track record", "Scenarios", "Recommendations and ranked actions", "Chat",
                "The 07:30 briefing and alerts", "The admin areas", "Costs", "Settings"]])
            + panel("art", "#FFFAE6", "<p>The quality bar for the UX is Apple's Human Interface Guidelines and Monzo's modular system; options are drawn and the owner picks.</p>")
            + footer())


def drawings(s: str) -> str:
    doc = lucid_doc()
    rows = [[str(p["page_number"]), esc(p["title"]), f"<code>{esc(p['filename'])}</code>"] for p in doc["pages"]]
    return (banner("record", "How every picture in this space is made, and how to change one.",
                   ["docs/diagrams/mp-architecture-2026-11-02/lucid_spec.py", "docs/motion/build_motion.py"])
            + f'<h2>🏗️ The Lucid document</h2><p><a href="{doc["document_url"]}">Open it in Lucid</a>. Native AWS 2024 shapes, numbered flows, a status line on every page. '
            + "Its pages are generated by a script in the repo and exported back with a manifest of hashes; an edit made only in Lucid reaches the repo when it is exported again.</p>"
            + table(["Page", "Title", "Export"], rows)
            + "<h2>🎬 The motion</h2><p>Each animation is an HTML and SVG scene, paused and seeked frame by frame in Chrome and joined by ffmpeg, so it is the same every time it is built. Each has a still image beside it.</p>"
            + gif(s, "logo-intro", "The mark, the Fan: a price line opens into a forecast fan and the outcome lands inside it.")
            + ul([repo("docs/motion/README.md", "The motion catalogue"), repo("docs/brand/README.md", "The mark and its palette")])
            + footer())


def sync(s: str) -> str:
    return (banner("record", "Five records describe MP. They agree because each one has an owner and a check.", [".claude/rules/mp-workflow.md"])
            + table(["Record", "Holds", "Kept in step by"], [
                ["The repo", "Decisions, contracts, ARCHITECTURE.md, TECH-STACK.md, the generators", "CI's seven checks on every PR"],
                [f'<a href="{JIRA_BOARD}">Jira MP</a>', "Work and its status", "Branch, title and commits carry the MP key"],
                ["Lucid", "The architecture drawings", "Generated from the repo; exported with hashes"],
                ["This space", "The readable plan", "Rendered from the repo; the next publish overwrites edits made here"],
                ["The code", "What runs", "Tests and the review ledger"]])
            + footer())


PAGES = [
    {"slug": "home", "title": "mypaisaa-prediction", "parent": None, "status": "record", "body": home},
    {"slug": "hub", "title": "🔮 Mypaisaa Prediction: the plan", "parent": "home", "status": "record", "body": hub},
    {"slug": "record", "title": "📘 The record: the whole architecture", "parent": "hub", "status": "record", "body": record},
    {"slug": "rec-rules", "title": "🧭 The rules, what MP does, and what wins", "parent": "record", "status": "selected", "body": rec_rules},
    {"slug": "rec-system", "title": "🏛️ The system on AWS", "parent": "record", "status": "selected", "body": rec_system},
    {"slug": "rec-data", "title": "📡 Market data and source rights", "parent": "record", "status": "selected", "body": rec_data},
    {"slug": "rec-ledger", "title": "🗂️ Holdings, imports and the ledger", "parent": "record", "status": "selected", "body": rec_ledger},
    {"slug": "rec-forecast", "title": "🔮 Forecasting: horizons, models and controlled learning", "parent": "record", "status": "selected", "body": rec_forecast},
    {"slug": "rec-claude", "title": "🤖 Claude: routes, models and the batch lane", "parent": "record", "status": "selected", "body": rec_claude},
    {"slug": "rec-identity", "title": "🔐 Identity, sign-in and step-up", "parent": "record", "status": "selected", "body": rec_identity},
    {"slug": "rec-admin", "title": "🛠️ Admin, audit, retention and recovery", "parent": "record", "status": "selected", "body": rec_admin},
    {"slug": "rec-guardrails", "title": "🛡️ Guardrails and evaluations", "parent": "record", "status": "selected", "body": rec_guardrails},
    {"slug": "rec-clients", "title": "📱 The two doors: web and Apple", "parent": "record", "status": "selected", "body": rec_clients},
    {"slug": "rec-delivery", "title": "🚀 Environments, CI and delivery", "parent": "record", "status": "implemented", "body": rec_delivery},
    {"slug": "rec-cost", "title": "💷 Cost and the £100 ceiling", "parent": "record", "status": "selected", "body": rec_cost},
    {"slug": "rec-observability", "title": "🔭 Observability (PROPOSED)", "parent": "record", "status": "proposed", "body": rec_observability},
    {"slug": "rec-decisions", "title": "📜 Decisions and open questions", "parent": "record", "status": "record", "body": rec_decisions},
    {"slug": "journeys", "title": "🧭 The journeys, end to end (PROPOSED)", "parent": "hub", "status": "proposed", "body": journeys},
    {"slug": "roadmap", "title": "🗺️ The road: ten phases and four gates (PROPOSED)", "parent": "hub", "status": "proposed", "body": roadmap},
    {"slug": "phases", "title": "📚 The phases, one page each (PROPOSED)", "parent": "hub", "status": "proposed", "body": phases},
    {"slug": "screens", "title": "🎨 Screens and UX (PROPOSED)", "parent": "hub", "status": "proposed", "body": screens},
    {"slug": "drawings", "title": "🏗️ The drawings and the motion, and how they are made", "parent": "hub", "status": "record", "body": drawings},
    {"slug": "sync", "title": "🔗 Staying in step: repo, Jira, Lucid and Confluence", "parent": "hub", "status": "record", "body": sync},
]
for _p in baseline()["phases"]:
    PAGES.append({"slug": _p["id"].lower(), "title": f"{_p['id']} · {_p['title']} (PROPOSED)", "parent": "phases",
                  "status": "proposed", "body": phase_page(_p["id"])})
PAGES_BY_SLUG = {p["slug"]: p for p in PAGES}


def write() -> None:
    OUT.mkdir(exist_ok=True)
    MEDIA_NEEDED.clear()
    for page in PAGES:
        body = page["body"](page["slug"])
        (OUT / f"{page['slug']}.html").write_text(body)
    (HERE / "media-needed.json").write_text(json.dumps(MEDIA_NEEDED, indent=1) + "\n")
    print(f"wrote {len(PAGES)} pages to {OUT.relative_to(ROOT)}")


def tree() -> None:
    def walk(parent: str | None, depth: int) -> None:
        for p in PAGES:
            if p["parent"] == parent:
                pid = M["pages"].get(p["slug"], {}).get("id", "-")
                print(f"{'  ' * depth}{p['title']}  [{STATUS[p['status']][0]}]  id={pid}")
                walk(p["slug"], depth + 1)
    walk(None, 0)


def check() -> int:
    write()
    problems = []
    for page in PAGES:
        rec = M["pages"].get(page["slug"], {})
        sent = hashlib.sha256((OUT / f"{page['slug']}.html").read_bytes()).hexdigest()
        if not rec.get("id"):
            problems.append(f"{page['slug']}: not created")
        elif rec.get("sha256") != sent:
            problems.append(f"{page['slug']}: changed since it was published")
    for slug, paths in MEDIA_NEEDED.items():
        for path in paths:
            if path not in M["media"].get(slug, {}):
                problems.append(f"{slug}: {path} not attached")
    for p in problems:
        print("PENDING:", p)
    return 1 if problems else 0


if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else "write"
    if command == "write":
        write()
    elif command == "tree":
        tree()
    elif command == "media":
        write()
        print(json.dumps(MEDIA_NEEDED, indent=1))
    elif command == "check":
        sys.exit(check())
    else:
        sys.exit(f"unknown command {command}")
