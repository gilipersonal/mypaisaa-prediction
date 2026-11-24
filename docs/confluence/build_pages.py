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
    python3 docs/confluence/build_pages.py check      # fail on a page or attachment not yet published, or not read back
    python3 docs/confluence/build_pages.py set-readback SLUG FILE [--version N]  # record a read-back receipt
    python3 docs/confluence/build_pages.py selftest   # prove the receipt passes and refuses what it should

A page sent by hand can arrive cut short (MA-300), so every published page is read back
(getConfluenceContent, detail full, html) and compared with the file sent; the receipt lands in
docs/confluence/receipts/<slug>.json (MP-35, from MA-303).

Facts come from ARCHITECTURE.md, TECH-STACK.md, the owner decisions in docs/planning/ and the
phase baseline. Anything not decided is shown as PROPOSED; nothing here approves architecture,
UX, spending or implementation.
"""

from __future__ import annotations

import datetime
import difflib
import hashlib
import html
import json
import re
import sys
import tempfile
import unicodedata
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = HERE / "pages"
MANIFEST = HERE / "confluence.json"
RECEIPTS = HERE / "receipts"
LUCID = ROOT / "docs/diagrams/mp-architecture-2026-11-02/manifest.json"
LUCID_QUALITY = ROOT / "docs/diagrams/mp-quality-2026-11-02/manifest.json"  # MP-36
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
    """A bullet list, or nothing: Confluence drops an empty list, so one would never read back as sent (MP-40)."""
    return "<ul>" + "".join(f"<li><p>{i}</p></li>" for i in items) + "</ul>" if items else ""


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


def lucid_doc(path: Path = LUCID) -> dict:
    return json.loads(path.read_text()) if path.exists() else {"pages": [], "document_url": "#"}


def lucid(slug: str, number: int, caption: str, pack: Path = LUCID) -> str:
    doc = lucid_doc(pack)
    page = next((p for p in doc["pages"] if p.get("page_number") == number), None)
    if not page:
        return panel("hourglass", "#F4F5F7", f"<p><em>Lucid page {number} to export.</em></p>")
    # MP-36's pack is one Lucid document per drawing, so a page may carry its own document_url.
    where = page.get("document_url")
    open_link = (f'<p style="font-size: 14px"><a href="{where}">Open it in Lucid</a>.</p>' if where else
                 f'<p style="font-size: 14px"><a href="{doc["document_url"]}">Open it in Lucid</a> (page {number}).</p>')
    return media(slug, f"{pack.parent.relative_to(ROOT)}/{page['filename']}", caption) + open_link


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


READY = ROOT / "docs/planning/story-readiness-2026-11-03/stories"


def ready(pid: str) -> dict | None:
    """The phase's ready stories (MP-40), or None while the phase is still drafted only."""
    path = READY / f"{pid}.json"
    return json.loads(path.read_text()) if path.exists() else None


def jira(key: str | None) -> str:
    return f'<a href="https://duttaarun2015.atlassian.net/browse/{esc(key)}">{esc(key)}</a>' if key else "not in Jira yet"


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
            + cols(card("compass", "#EAE6FF", "Planning", "The architecture baseline was signed off on 3 November 2026 (MP-20); the story readiness, the UX and "
                        "permission to build are still ahead. Nothing is deployed."),
                   card("white_check_mark", "#E3FCEF", f"{len(b['phases'])} phases", stories_line(b)),
                   card("moneybag", "#FFFAE6", "£100 a month", "All-in: dev and prod AWS, market data, Claude and evals. "
                        "With Grow 55, every month fits except the one allowed Apple fee month, if the owner joins."))
            + "<h2>🎬 One forecast, from cutoff to score</h2>" + gif(s, "forecast-lifecycle", "Freeze the inputs, forecast a distribution, wait for the horizon, score the outcome. Illustrative values.")
            + "<h2>🧭 Where to look</h2>"
            + cols(card("blue_book", "#DEEBFF", link("record"), "The architecture area by area: the rules, the system on AWS, data, the ledger, forecasting, Claude, identity, admin, guardrails, the doors, delivery, cost."),
                   card("compass", "#E3FCEF", link("journeys"), "Opening the app, importing a statement, the daily forecast, asking why, and the learning loop, animated."),
                   card("world_map", "#EAE6FF", link("roadmap"), "Ten phases and the four owner gates before anything is built."))
            + cols(card("books", "#FFFAE6", link("phases"), "One page per phase: outcome, gate, dependencies, rollback and the story drafts."),
                   card("art", "#FFEBE6", link("screens"), "PROPOSED. Screens wait for ready Jira stories after the architecture sign-off of 3 November 2026; this page holds their place."),
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
            + "<ol start=\"1\"><li><p><strong>Architecture sign-off</strong> of the baseline at an exact revision (MP-20): given by the owner on 3 November 2026 at commit 98ba348. Its open items stay open, and UX waits until every story meets the readiness protocol. " + lozenge("selected") + "</p></li>"
            + "<li><p><strong>Full UX design</strong>, user and admin journeys end to end, designed locally first. " + lozenge("proposed") + "</p></li>"
            + "<li><p><strong>UX approval</strong> by the owner. " + lozenge("proposed") + "</p></li>"
            + "<li><p><strong>Permission to build.</strong> Only then does application code start. " + lozenge("proposed") + "</p></li></ol>"
            + "<h2>🗺️ The phases</h2>" + lucid(s, 9, "The road: PH-00 to PH-09 with their dependencies and the owner gates.")
            + table(["Phase", "Outcome", "Plans after", "Builds after", "Exit gate"], rows)
            + footer())


def phases(s: str) -> str:
    b = baseline()
    return (banner("proposed", "Planning only. Each phase page shows its outcome, gate, dependencies, rollback and its ready stories (MP-40), or its drafts until they are ready.",
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
                + (stories_section(pid, stories) if ready(pid) else
                   f"<h2>📋 Story drafts ({len(stories)})</h2>"
                   + panel("information_source", "#E6FCFF", "<p>Local drafts, not yet Jira stories; MP-40 turns them into ready stories.</p>")
                   + table(["Draft", "Title", "Shape", "Jira"], story_rows)
                   + "<h3>Proposed acceptance</h3>" + acceptance)
                + (f"<h2>❓ Gaps it carries</h2><p>{esc(', '.join(p.get('gap_ids', [])))}. See {link('rec-decisions')}.</p>" if p.get("gap_ids") else "")
                + footer())
    return render


def stories_line(b: dict) -> str:
    phases = [ready(p["id"]) for p in b["phases"]]
    if all(phases):
        n = sum(len(r["stories"]) for r in phases)
        keyed = sum(1 for r in phases for x in r["stories"] if x.get("jira_key"))
        return f"PH-00 to PH-09, with {n} ready stories ({keyed} in Jira) from the {b['story_count']} drafts (MP-40)."
    return f"PH-00 to PH-09, with {b['story_count']} story drafts that are not yet Jira stories."


def stories_section(pid: str, drafts: list) -> str:
    """The phase's ready stories (MP-40): each with its Jira key, its source drafts and whether it waits on the owner."""
    r = ready(pid)
    rows = [[f"<code>{esc(x['id'])}</code>", jira(x.get("jira_key")), esc(x["title"]),
             esc(", ".join(x.get("from_drafts", [])) or "new"),
             (lozenge("open") + " " + esc(", ".join(x["depends_on"].get("owner_questions", [])))) if x.get("blocked_on_owner") else "no"]
            for x in r["stories"]]
    disp = [[f"<code>{esc(d)}</code>", esc(v["disposition"]),
             esc(", ".join(v.get("stories", [])) or v.get("reason", ""))] for d, v in r["drafts"].items()]
    detail = "".join(expand(f"{x['id']} · {x['title']}",
                            "<p><strong>Positive</strong></p>" + ul([esc(a) for a in x["acceptance"]["positive"]])
                            + "<p><strong>Negative</strong></p>" + ul([esc(a) for a in x["acceptance"]["negative"]])
                            + "<p><strong>Recovery</strong></p>"
                            + (ul([esc(a) for a in x["acceptance"].get("recovery") or []])
                               or f"<p>Not applicable: {esc(x['acceptance'].get('recovery_not_applicable', ''))}</p>"))
                     for x in r["stories"])
    return (f"<h2>📋 Ready stories ({len(r['stories'])})</h2>"
            + panel("information_source", "#E6FCFF", "<p>Ready stories (MP-40, 3 November 2026): each has positive, negative and "
                    "recovery acceptance, its contracts, who may do what, a state inventory and its dependencies. The Jira "
                    "description is generated from the repo. No story is authorised to build until the UX is approved and the "
                    "owner gives permission.</p>")
            + table(["Story", "Jira", "Title", "From drafts", "Waits on the owner"], rows)
            + f"<h3>What happened to the {len(drafts)} drafts</h3>" + table(["Draft", "Disposition", "Stories or reason"], disp)
            + "<h3>Acceptance</h3>" + detail)


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
                ["Edge and identity", "API Gateway (HTTPS and SSE); Cognito with Google and passkeys; Sign in with Apple waits for the paid Apple Developer Program (owner, 3 November 2026)", lozenge("selected")],
                ["API", "FastAPI on ordinary Lambda, <code>/api/v1</code>", lozenge("implemented") + " starter, locally"],
                ["Work", "EventBridge Scheduler, SQS with dead-letter queues, Lambda Durable Functions in Python", lozenge("selected")],
                ["Claude", "One Lambda worker per task route, Anthropic Python SDK", lozenge("selected")],
                ["Models", "Capped SageMaker CPU training; approved artefacts served from a Lambda", lozenge("selected")],
                ["Records", "DynamoDB and private, encrypted S3", lozenge("selected")],
                ["Operations", "CloudWatch, X-Ray, CloudTrail; secrets in SSM Parameter Store (owner-selected)", lozenge("proposed")]])
            + panel("no_entry_sign", "#FFEBE6", "<p>Not in the plan without a costed ADR: NAT Gateway, load balancers, RDS, GPUs, always-on endpoints.</p>")
            + "<h2>🎬 Four journeys through it</h2>" + gif(s, "system-flow", "Open the app, import a statement, the daily forecast, ask why.")
            + footer())


def rec_data(s: str) -> str:
    return (banner("selected", "ARC-01 keeps Yahoo Finance and Twelve Data Grow, confirmed by the owner on 2 November 2026 for personal hobby use. "
                   "On published terms Yahoo forbids automated collection and Grow is labelled view-only; the owner accepts that risk. The tier is Grow 55 at $29.",
                   ["docs/planning/source-rights-2026-11-02/README.md", "docs/planning/ma-reconciliation-2026-11-02/decision-log.md",
                    "docs/planning/foundation-specifications-2026-11-02/README.md"])
            + table(["Topic", "Decision", "Status"], [
                ["Sources", "Yahoo Finance plus Twelve Data Grow; Twelve Data Basic ($0) for dev", lozenge("selected")],
                ["Grow tier", "Grow 55 at $29 a month (about £27.84), the only tier that keeps every month under £100. Yahoo stays for delayed intraday UK and India prices and a cross-check; Pro 610 ($99) breaks £100 every month", lozenge("selected")],
                ["Rights", "Published terms checked 2 November 2026 (MP-10). The owner accepts the risk for personal hobby use; no vendor is asked", lozenge("selected")],
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
                  "An affected scope pauses itself on an approved trigger and restarts only with the owner's approval (POLICY-003).",
                  "Bounded self-correction (owner, 3 November 2026): code, never an agent, makes small calibration and weighting adjustments inside bands the owner approved on 3 November 2026 (at most 5 percentage points a week on a probability, 10% a month on a signal\'s weight), and rolls back automatically if scores worsen. New models need 8 weeks in shadow and the owner\'s yes; a promoted model that slips reverts by itself and notifies the owner."])
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
                ["Sign-in", "Cognito with Google and passkeys; Sign in with Apple waits for the paid Apple Developer Program (owner, 3 November 2026)", lozenge("selected")],
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
            + cols(card("globe_with_meridians", "#DEEBFF", "Web", "A prebuilt, static SvelteKit 3 PWA on S3 and CloudFront. Holdings first, with the top 5 per segment below (owner, 3 November 2026), chat to explain."),
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
                ["Review tooling", "Review runner tests and self-test; every fixed finding still holds", lozenge("implemented")],
                ["Agent config", "Claude skills, rules and Jira flow, Codex JSON, protection names, the hooks", lozenge("implemented")],
                ["Plan sync", "Jira mirror, root documents, phases and Confluence pages agree; PR files belong to their issue", lozenge("implemented")],
                ["Confluence receipts", "Every page rendered from the repo, published and read back whole", lozenge("implemented")],
                ["Static preview", "The concept site build and checks", lozenge("implemented")],
                ["Workflow lint", "actionlint on every workflow", lozenge("implemented")],
                ["Jira traceability", "MP key on the branch, the title and every commit", lozenge("implemented")],
                ["CodeQL", "GitHub code scanning: Python, JavaScript and TypeScript, GitHub Actions", lozenge("implemented")]])
            + ul(["Every change is on an <code>MP-&lt;n&gt;-&lt;slug&gt;</code> branch, merged to main through a PR.",
                  "Infrastructure as code is plan-only; nothing is applied without an explicit request.",
                  "The <code>main</code> ruleset enforces a pull request and the ten checks, with no bypass (MP-198); the intended settings are also versioned."])
            + footer())


def rec_cost(s: str) -> str:
    return (banner("selected", "The £100 all-in ceiling and its split are owner-selected. With Grow 55 (owner, 2 November 2026) every month fits £100 except the one allowed Apple fee month, if the owner joins.",
                   ["docs/planning/foundation-specifications-2026-11-02/costs/specification.md", "TECH-STACK.md"])
            + gif(s, "budget", "The ceiling, the £70 plan and the selected months.")
            + table(["Part of the £70 plan", "Up to"], [["Market data", "£30"], ["AWS, both accounts", "£22"], ["Claude and evaluations", "£15"], ["Forecast and price uncertainty", "£3"]])
            + table(["Month, Virginia, Grow 55 (cost specification)", "Cash in the month"], [
                ["An ordinary month, Claude off", "£46.48"], ["An ordinary month, Claude option A", "£54.73"],
                ["Either, with the top-5 scan at its £5 cap", "£51.48 or £59.73"],
                ["The Apple fee month, only if the owner joins (the one allowed exception)", "about £141.52 or £149.77, over the ceiling"]])
            + ul(["Warn at £60, reduce optional work at £75, pause it at £85.",
                  "Cash is counted in the month an invoice is due. No paid fallback switches on by itself.",
                  "The shared $200 Claude credit is owner-reported and unverified; admissible credit is zero.",
                  "The domain is the owner's existing mypaisapp.com, renewed outside MP, so no month carries a domain renewal (owner, 3 November 2026).",
                  "The Apple Developer Program fee (99 USD a year) has one exception month a year above £100, for this fee only (owner, 2 November 2026). The owner has not joined for now (3 November 2026).",
                  "Region: Virginia (us-east-1), owner-selected on 2 November 2026."])
            + f"<p>Month by month: {repo('docs/planning/source-rights-2026-11-02/README.md', 'the MP-10 cost fit')}. The owner chose Grow 55, the only tier that keeps every month under £100.</p>"
            + footer())


def rec_observability(s: str) -> str:
    return (banner("proposed", "Proposed. Nothing is instrumented or deployed; the starter only logs on a laptop. The retention periods and the billing cadence are owner-selected.",
                   ["ARCHITECTURE.md", "docs/planning/aws-options-2026-11-01/audit-observability-requirements.md",
                    "docs/planning/foundation-specifications-2026-11-02/costs/specification.md"])
            + gif(s, "trace-journey", "One request, one trace, and where a new trace links on. Illustrative ids and values.")
            + "<h2>🗺️ The drawing</h2>" + lucid(s, 2, "One trace from the door to the model, and where a linked trace takes over.", LUCID_QUALITY)
            + panel("telescope", "#DEEBFF",
                    "<p><strong>Three readers, one rule.</strong> You read Activity, Audit and Costs in the app. Whoever operates MP reads CloudWatch logs, metrics and traces. "
                    "Alarms reach a person. The rule: <strong>durable business records are the truth; telemetry is sampled, short-lived and allowed to be missing.</strong> "
                    f"The stack it watches is on {link('rec-stack')}.</p>")
            + "<h2>🧾 The run record</h2>"
            + "<p>Every Lambda run, not only Claude's, leaves one record in DynamoDB. It is written when the run is accepted, not only when it ends, so a crash leaves a trace of its own (CT-05).</p>"
            + table(["Part", "What it holds"], [
                ["Lifecycle", "Accepted, started, heartbeats, then one end state: succeeded, failed, timed out, cancelled, partial, or an unknown outcome at an outside provider. A reconciler finds runs that stopped talking"],
                ["Who and why", "Trigger, <code>run_id</code>, <code>job_id</code>, <code>trace_id</code>, environment, build, and the config, model and prompt versions"],
                ["Each Claude call", "Route, model, input, output and cache tokens, batch or live, cost estimate, latency, stop reason, refusal"],
                ["Each tool call", "Tool name and version, the policy decision, outcome, duration, input and output sizes"],
                ["Money", "The cost reservation it held and what it actually spent"]])
            + "<p>Tool inputs and outputs are protected evidence for the owner, never sent to CloudWatch.</p>"
            + "<h2>🧵 One trace, and where it cannot join</h2>"
            + "<p>The placeholder promised one trace from the door to the model. That holds for the hops a person waits on. Where work is queued, resumed or batched, "
              "the trace ends and stable business IDs carry the join, with an OpenTelemetry span link where one helps (PL-12, CT-06).</p>"
            + table(["Hop", "How it joins", "One trace?"], [
                ["Door → API Gateway → FastAPI", "The door sends a W3C <code>traceparent</code>; FastAPI checks its format and returns <code>trace_id</code> and <code>request_id</code> on every response", "Yes"],
                ["FastAPI → SQS → worker", "Trace context rides the message; the worker continues it", "Yes, once propagation is proved"],
                ["A durable workflow resumes, say after your approval", "A new trace, linked to the first; <code>job_id</code> and <code>import_id</code> join them", "No: linked"],
                ["Scheduler tick → the daily forecast", "The run's first step starts the trace; <code>job_id</code> names the tick", "A new root"],
                ["Worker → Anthropic API, live", "One client span with model, tokens, cost and the response id. Anthropic's internals are not visible", "To the edge only"],
                ["Message Batches", "Submitting is one span. Results come back hours later in another run, matched by batch id and <code>custom_id</code>", "No: joined by IDs"],
                ["SSE notice or push → the door's re-read", "The notice carries <code>run_id</code>; the re-read is a new request with its own trace", "No: joined by <code>run_id</code>"],
                ["A replay", "A new run and a new trace, linked to the original, which is never rewritten", "No: linked"]])
            + expand("The correlation keys",
                     "<p><code>trace_id</code>, <code>span_id</code>, <code>request_id</code>, <code>run_id</code>, <code>job_id</code>, <code>client_message_id</code>, "
                     "<code>conversation_id</code>, <code>document_id</code>, <code>import_id</code>, <code>prediction_id</code>, <code>model_version</code>, "
                     "<code>config_version</code>, environment, build and app version. Activity stays complete when a span is missing, and the joins survive after traces expire.</p>")
            + "<h2>🛠️ Instrumentation</h2>"
            + table(["Piece", "Proposed", "Status"], [
                ["Traces", "OpenTelemetry for Python through the AWS Distro (ADOT) Lambda layer, exporting to X-Ray, with parent-based sampling", lozenge("proposed")],
                ["Logs and metrics", "Powertools for AWS Lambda (Python): Logger for JSON lines carrying the keys above, Metrics in the embedded metric format", lozenge("proposed")],
                ["Not used", "Powertools Tracer: it wraps the X-Ray SDK, which reaches end of support on 25 February 2027", lozenge("proposed")],
                ["Claude spans", "One span per call in the OpenTelemetry GenAI conventions (model, tokens including cache) plus MP's route, batch flag, refusal and cost estimate; the convention version pinned, as it is still in development", lozenge("proposed")],
                ["The doors", "No tracing SDK. Each action mints a <code>traceparent</code>; errors and timings go to an authenticated telemetry route", lozenge("open") + " with PL-14"]])
            + "<h2>📈 Metrics: few on purpose</h2>"
            + "<p>Lambda, API Gateway, SQS and DynamoDB publish their own metrics at no extra charge. MP's own metrics cost $0.30 each a month, so there are eight in prod and four in dev, "
              "with no dimensions. Everything finer, the route, the listing, the model, lives in the log line beside the metric and is queried when needed.</p>"
            + table(["Metric", "Tells you", "Prod", "Dev"], [
                ["<code>ScheduleLateness</code>", "The daily window or a 30-minute check started late", "✓", "✓"],
                ["<code>RunsUnfinished</code>", "The reconciler found runs stuck, timed out or in a dead-letter queue", "✓", "✓"],
                ["<code>DataFreshnessMinutes</code>", "Age of the oldest eligible listing's price", "✓", "✓"],
                ["<code>ClaudeSpendEstimateUSD</code>", "Today's Claude spend from the run records", "✓", "✓"],
                ["<code>ForecastsMissing</code>", "Origins expected by +75 minutes that were not issued", "✓", ""],
                ["<code>ClaudeFailures</code>", "Refusals, expired batch requests and tool errors", "✓", ""],
                ["<code>AdmissionRefusals</code>", "Jobs the cost check refused", "✓", ""],
                ["<code>WriterRejections</code>", "Commits the controlled writer refused or found conflicting", "✓", ""]])
            + "<h2>🚨 Alarms, and who hears them</h2>"
            + cols(card("rotating_light", "#FFEBE6", "System incidents",
                        "An SNS topic per environment to the owner's email (proposed), a run record with trigger <em>alarm</em>, and an incident in Admin. "
                        "A downstream outage is one incident with its symptoms linked, not ten messages. An OK closes it without erasing it."),
                   card("chart_with_upwards_trend", "#E3FCEF", "Investment alerts",
                        "Material risk and opportunity alerts go through the product: push to the app and the PWA, the 07:30 briefing, quiet hours 22:00 to 07:00. "
                        "They never use the operations topic, and a failed provider can never send a confident all-clear (CT-18)."))
            + table(["Alarm (proposed)", "Prod", "Dev"], [
                ["Any Lambda error, from the account-wide metric", "✓", "✓"],
                ["<code>ClaudeSpendEstimateUSD</code> past the day's guard", "✓", "✓"],
                ["<code>RunsUnfinished</code> above zero for 30 minutes", "✓", ""],
                ["<code>ScheduleLateness</code> over 10 minutes; missing data counts as late", "✓", ""],
                ["<code>ForecastsMissing</code> above zero at +75 minutes", "✓", ""],
                ["<code>DataFreshnessMinutes</code> past the listing's limit", "✓", ""]])
            + "<p>The budget ladder (warn at £60, reduce at £75, pause at £85) runs in the app from the cost ledger, not from CloudWatch.</p>"
            + "<h2>💷 The cost dashboard</h2>"
            + ul(["Every run records its trigger, model calls, tokens, cost, tools and outcome.",
                  "One trace from the door to the model, for the hops a person waits on; queued, batched and resumed work joins by its IDs.",
                  "Internal estimates live, Anthropic usage every six hours, AWS billing daily, with the lag shown.",
                  "Dev and prod shown apart; estimates, credits and reconciled billing kept separate.",
                  "The dashboard reads cached figures; opening it never calls a billing API. AWS collection is capped at 120 Cost Explorer pages a month ($1.20).",
                  "Shared and unallocated costs are shown as such, and a missing or stale report is never a fresh zero. An AWS report older than 36 hours blocks optional work (proposed)."])
            + f"<p>The ceiling and the ladder: {link('rec-cost')}. The Costs screen itself belongs to {link('rec-admin')}.</p>"
            + "<h2>🔒 Redaction</h2>"
            + ul(["Never in a log, span or metric: secrets, tokens, prompts, replies, holdings amounts, names, account numbers, file names, signed URLs or tool arguments.",
                  "Prompt and reply capture is off by default. Only dev may switch it on, only for data proved synthetic, behind a setting prod refuses.",
                  "Client baggage is ignored and a malformed <code>traceparent</code> is replaced, so a door cannot inject an identity.",
                  "A leak test replays synthetic runs carrying marker strings and fails CI if a marker reaches a log, span or metric."])
            + "<h2>🗄️ How long each signal is kept</h2>"
            + table(["Signal", "Kept for", "Status"], [
                ["Operational logs", "14 days", lozenge("selected")],
                ["Rich traces", "30 days", lozenge("selected")],
                ["Run summaries", "90 days", lozenge("selected")],
                ["Audit, approvals, predictions and outcomes", "The life of the account, subject to deletion", lozenge("selected")],
                ["CloudWatch metrics", "CloudWatch's own 15-month roll-up", lozenge("proposed")],
                ["AWS API activity", "CloudTrail's 90-day event history, at no charge; a trail to S3 is a later choice", lozenge("proposed") + " trail " + lozenge("open")],
                ["Batch results at Anthropic", "29 days there, so MP copies them into its own records as soon as they arrive", lozenge("proposed")]])
            + "<h2>🎯 Sampling</h2>"
            + ul(["Never sampled: run records, audit, approvals, predictions, outcomes and the cost ledger.",
                  "Always traced: owner commands, imports, approvals, chat, every Claude call and the daily forecast run.",
                  "Sampled: read-only API calls, the 30-minute checks and the data collectors, tuned in dev to fit the costed 15,000 prod and 5,000 dev traces a month. Errors are always logged with their <code>trace_id</code>."])
            + "<h2>💰 What watching costs</h2>"
            + "<p>Official AWS prices, checked 2 November 2026, in Virginia (us-east-1, owner-selected), with no free tier deducted, at the cost specification's central £0.80 to the dollar and 20% tax. "
              "The quantities are the cost model's.</p>"
            + table(["Line", "Price", "Prod", "Dev", "A month"], [
                ["Logs ingested", "$0.50 per GB", "0.5 GB", "0.25 GB", "$0.375"],
                ["Logs kept", "$0.03 per GB-month", "0.25 GB", "0.10 GB", "$0.011"],
                ["Logs Insights queries", "$0.005 per GB scanned (the cost model's evidence)", "5 GB", "2 GB", "$0.035"],
                ["Custom metrics", "$0.30 each", "8", "4", "$3.600"],
                ["Alarms", "$0.10 each", "6", "2", "$0.800"],
                ["X-Ray traces recorded", "$5 per million", "15,000", "5,000", "$0.100"],
                ["X-Ray traces read", "$0.50 per million", "30,000", "10,000", "$0.020"],
                ["<strong>Total</strong>", "", "", "", "<strong>$4.94, about £4.74</strong>"]])
            + cols(card("bar_chart", "#DEEBFF", "Against the £22",
                        "About a fifth of the £22 AWS share. It is already counted inside the cost model's AWS total of $19.42 (£18.64), which leaves £3.36. "
                        "Custom metrics are three quarters of it: dropping dev's four saves about £1.15."),
                   card("gift", "#E3FCEF", "What is free",
                        "Powertools, OpenTelemetry and the ADOT layer are free; they add a few cents of Lambda time by estimate. A CloudWatch free tier would lower the total, but is not counted."))
            + expand("Options outside the baseline, priced",
                     table(["Option", "Price, checked 2 November 2026", "Estimate"], [
                         ["Every span kept through CloudWatch Transaction Search", "$0.35 per GB of spans; 1% indexing free", "About 0.9 GB a month, about $0.31; my estimate, unmeasured"],
                         ["CloudWatch Application Signals", "$1.50 per million signals after a 3-month trial", "Off at launch"],
                         ["A composite alarm", "$0.50 a month", "Off at launch; the app groups incidents"],
                         ["A custom CloudWatch dashboard", "Unverified: the official page did not show it", "None at launch; the app's screens come first"]]))
            + panel("question", "#FFFAE6", "<h3>To decide</h3>" + ul([
                "Sampled X-Ray, or every span through Transaction Search, and the per-environment telemetry envelope (PL-12, MP-27).",
                "The run record schema, the stuck-run thresholds, and what is content versus metadata (CT-05, MP-27).",
                "The minimum launch signals: the eight metrics, six alarms and sampling rates above (CT-06, MP-27).",
                "Whether email is the operations emergency channel; which investment conditions are critical, the cooldowns and weekends (CT-18, MP-30).",
                "Whether Application Signals, a CloudWatch dashboard or a composite alarm earns its cost after a measured month in dev."]))
            + f"<p><strong>Phases:</strong> {link('ph-02', 'PH-02')} builds the run record, traces, logs, metrics and cost collection; {link('ph-05', 'PH-05')} adds the Claude spans and evaluation evidence; "
            + f"{link('ph-07', 'PH-07')} routes investment alerts to push; {link('ph-08', 'PH-08')} accepts the whole as operational.</p>"
            + footer())


def rec_decisions(s: str) -> str:
    gaps = json.loads((ROOT / "docs/planning/ma-reconciliation-2026-11-02/gap-register.json").read_text())
    gaps = gaps.get("gaps", gaps) if isinstance(gaps, dict) else gaps
    arc = [("ARC-01", "Source rights and budget", "Keep Yahoo and Twelve Data Grow; Basic for dev; confirmed 2 November 2026"),
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
    return (banner("proposed", "A placeholder. No screen is designed yet: the architecture was signed off on 3 November 2026, UX starts once every story meets the readiness protocol, and building only after UX approval.",
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
                ["The repo", "Decisions, contracts, ARCHITECTURE.md, TECH-STACK.md, the generators", "The ten required checks on every PR: nine CI jobs and CodeQL"],
                [f'<a href="{JIRA_BOARD}">Jira MP</a>', "Work and its status", "Branch, title and commits carry the MP key"],
                ["Lucid", "The architecture drawings", "Generated from the repo; exported with hashes"],
                ["This space", "The readable plan", "Rendered from the repo; the next publish overwrites edits made here"],
                ["The code", "What runs", "Tests and the review ledger"]])
            + footer())


def rec_testing(s: str) -> str:
    return (banner("proposed", "Today's ten required checks (nine CI jobs and CodeQL code scanning), secret scanning, the Claude hooks and the fixed-findings ledger are implemented. "
                   "Everything else on this page is proposed: nothing is deployed and no account exists. The IaC tool is Terraform, owner-selected on 3 November 2026.",
                   [".github/workflows/verify.yml", "docs/github-workflow.md", ".claude/rules/aws-changes.md",
                    "docs/planning/ma-reconciliation-2026-11-02/gap-register.json"])
            + gif(s, "delivery-pipeline", "Ten checks today, then the proposed road to prod with a rollback.")
            + "<h2>🗺️ The drawing</h2>" + lucid(s, 3, "From a merge to prod: today's checks, the scan gate, dev, approval, prod and rollback.", LUCID_QUALITY)
            + f"<p>{link('rec-delivery', 'Environments, CI and delivery')} stays the summary of today's checks. This page is the plan for "
              "what comes next: the road to dev and prod, scanning, smoke, rollback and the regression layers. It answers "
              "PL-11 (MP-30).</p>"

            + "<h2>✅ What runs today</h2>"
            + table(["Piece", "What it does", "Status"], [
                ["Ten required checks", "Backend, Docs, Review tooling, Agent config, Plan sync, Confluence receipts, Static preview, "
                 "Workflow lint and Jira traceability, on every PR to <code>main</code> and every push to it, and CodeQL code scanning "
                 "(Python, JavaScript and TypeScript, GitHub Actions)", lozenge("implemented")],
                ["Claude hooks", "<code>.claude/hooks/mp_hook.py</code>: before a PR is raised it runs the selected checks, plan sync and "
                 "the Confluence check and refuses the PR on a failure; after an edit it reports drift; a new-work prompt gets a Jira reminder",
                 lozenge("implemented")],
                ["Fixed stays fixed", "<code>scripts/review_regress.py --every</code> re-runs every fixed review finding on every PR",
                 lozenge("implemented")],
                ["Pinned actions", "Every action pinned to a commit SHA; actionlint checked against its checksum", lozenge("implemented")],
                ["The <code>main</code> ruleset", "A pull request, resolved conversations, merge commits only and the ten checks on an up-to-date "
                 "branch, with no bypass; no deletion or force push (MP-198). The same policy is versioned in "
                 "<code>.github/main-protection.json</code>", lozenge("implemented")],
                ["Code and secret scanning", "CodeQL code scanning, GitHub secret scanning with push protection, and Dependabot alerts, "
                 "free on a public repository", lozenge("implemented")],
                ["Deploys, smoke", "None yet", lozenge("proposed")]])

            + "<h2>🚚 From a merge to prod</h2>"
            + "<p>One artefact is built once, tested in dev, and the same bytes go to prod. CI deploys; no laptop and no Claude session does.</p>"
            + table(["Step", "What happens", "Status"], [
                ["1. PR gates", "Today's checks, plus the scans and contract tests below", lozenge("proposed")],
                ["2. Build once", "On a merge to <code>main</code>: the Lambda packages and the static PWA bundle, each with a recorded "
                 "sha256 and an SBOM from GitHub's dependency graph", lozenge("proposed")],
                ["3. Deploy to dev", "GitHub OIDC into a dev-only role that trusts <code>main</code> and the release workflow, nothing else; "
                 "no stored AWS keys", lozenge("proposed")],
                ["4. Dev smoke", "The full synthetic profile below", lozenge("proposed")],
                ["5. Owner approves", "The owner promotes that exact sha256 by starting a release workflow only the owner can start "
                 "(route A below, owner-selected 3 November 2026)", lozenge("selected")],
                ["6. Deploy to prod", "From CI on <code>main</code> only, into a separate prod role (ARC-11)", lozenge("selected")],
                ["7. Prod smoke, then keep or roll back", "Read-only checks; a failure moves the alias back", lozenge("proposed")],
                ["IaC", "Terraform only, from day one: every AWS change goes through Terraform (owner, 3 November 2026). Plan-only until an apply is asked for", lozenge("selected")],
                ["How the code is packaged", "Zip or container image is not decided. Durable Functions list managed Python 3.13 and 3.14; "
                 "MP targets 3.12 or later, so this choice matters", lozenge("open")]])
            + panel("warning", "#FFFAE6",
                    "<p><strong>The Free plan could not hold the prod gate while the repository was private.</strong> On a private repo, GitHub's "
                    "required reviewers and wait timers need Enterprise, and environment secrets need Pro or Team. So the rule's &quot;owner "
                    "approves in a protected environment&quot; could not be built on that plan. The owner chose A on 3 November 2026; B to D are recorded as not chosen.</p>"
                    + ul(["<strong>A, free, owner-selected:</strong> a release workflow only the owner dispatches, with the sha256 as input, and a prod role "
                          "that trusts only <code>main</code> and that workflow file. The org has one member today.",
                          "<strong>B:</strong> GitHub Team, $4 a user a month (about £3.84): branch protection and environment secrets, still no "
                          "required reviewers on a private repo.",
                          "<strong>C:</strong> GitHub Enterprise, $21 a user a month (about £20.16): required reviewers.",
                          "<strong>D:</strong> an AWS CodePipeline manual approval in the prod account. Approvals are not charged, but it is a new "
                          "managed service, so it needs a costed ADR."])
                    + "<p><strong>Since 24 November 2026 the repository is public</strong> (owner: &quot;Make the repo public, that is fine&quot;). "
                      "On a public repository GitHub Free offers environments with required reviewers, wait timers and deployment branch rules, "
                      "and environment secrets; administrators can bypass them by default. Whether route A stands, or a protected environment replaces or joins it, is open for the owner (MP-199).</p>")

            + "<h2>🛡️ Vulnerability scanning</h2>"
            + "<p>Free and open-source first. GitHub's code scanning and secret scanning, paid add-ons on a private repo, are free on a public one "
              "and run today (MP-198).</p>"
            + table(["Gate", "Tool", "Free for MP?", "Status"], [
                ["Dependency alerts", "Dependabot alerts and security updates, on (read 24 November 2026)", "Yes, every plan",
                 lozenge("implemented")],
                ["Lockfile audit in CI", "OSV-Scanner on <code>backend/uv.lock</code> and <code>site/package-lock.json</code>; "
                 "pip-audit as a second source", "Yes, Apache-2.0", lozenge("proposed")],
                ["Secrets in commits", "gitleaks CLI, checksum-verified like actionlint", "Yes, MIT", lozenge("proposed")],
                ["Code patterns", "Ruff's <code>S</code> (Bandit) rules, as Ruff already runs; Semgrep CE if it earns its place",
                 "Yes", lozenge("proposed")],
                ["Infrastructure code", "terraform fmt and validate, TFLint and Checkov on the Terraform",
                 "Yes", lozenge("proposed")],
                ["Container images", "Trivy or Grype, only if images are chosen", "Yes", lozenge("open")],
                ["GitHub secret scanning", "Secret scanning with push protection (MP-198)", "Yes, on a public repo",
                 lozenge("implemented")],
                ["CodeQL", "Code scanning, default setup: Python, JavaScript and TypeScript, GitHub Actions; a required check (MP-198)", "Yes, on a public repo", lozenge("implemented")]])
            + ul(["A High or Critical finding with a fix blocks the merge. An exception names its owner, its reason and its expiry.",
                  "A weekly scheduled sweep catches advisories published after the merge.",
                  "Actions stay pinned to SHAs. In March 2026 nearly every trivy-action tag was repointed to credential-stealing code "
                  "(CVE-2026-33634). Pinning is why that would not have reached MP."])

            + "<h2>💨 Smoke, per environment</h2>"
            + table(["Check", "Dev (synthetic)", "Prod (read-only)"], [
                ["Health", "<code>/api/v1/health</code> returns the deployed sha", "The same"],
                ["Who gets in", "Every protected route refuses a call with no token", "The same; no user is created or signed in"],
                ["Web door", "The PWA loads with its security headers", "The same"],
                ["SSE", "A synthetic user opens the stream and gets a heartbeat", "An unauthenticated stream is refused"],
                ["Work", "A synthetic import runs through the queue and the workflow", "Skipped: nothing is written"],
                ["Paid calls", "None by default", "None: no Claude, no market-data quota, no writes"]])

            + "<h2>⏪ Rollback</h2>"
            + ul(["Each Lambda runs behind a <code>live</code> alias. Rolling back points the alias at the previous version.",
                  "The previous PWA build is kept, so the site can switch back to it.",
                  "Code rolls back; data does not. Schema changes go in two steps (add, then remove later) so the old code still reads them.",
                  "A model is rolled back through its approved pointer, separately from the app " + f"({link('rec-forecast', 'controlled learning')}).",
                  "To verify: what a rollback does to a durable workflow already running. No speed is claimed until it is measured."])

            + "<h2>🧱 Regression layers</h2>"
            + table(["Layer", "What it proves", "When", "Status"], [
                ["Unit", "pytest and Ruff", "Every PR", lozenge("implemented") + " starter only"],
                ["Contracts, both sides", "API and PWA types, API and Swift models, the RN-Swift bridge, SSE events, queue messages, "
                 "provider payloads checked before storage", "Every PR", lozenge("proposed")],
                ["Integration, offline", "FastAPI with local stand-ins and synthetic data", "Every PR", lozenge("proposed")],
                ["Scientific evidence", "Walk-forward folds, purge and embargo, calibration, golden maths. Kept as separate evidence, "
                 "not a CI tick", "Fixtures every PR; full runs capped", lozenge("proposed")],
                ["Agent evaluations", "Inspect AI (ARC-09). Deterministic replays offline in CI; paid runs capped and approved, never green "
                 "if incomplete or out of budget", "Replays every PR", lozenge("selected") + " tool; cases proposed"],
                ["Web and Apple", f"{link('rec-web-quality', 'Web quality')} and {link('rec-apple-testing', 'Apple testing')}",
                 "By path", lozenge("proposed")],
                ["Fixed stays fixed", "The review ledger", "Every PR", lozenge("implemented")]])

            + "<h2>💷 What CI costs</h2>"
            + cols(card("bar_chart", "#DEEBFF", "Free on a public repo",
                        "The standard GitHub-hosted runners, macOS included, are free and unlimited on a public repository (GitHub docs, checked 24 November 2026). GitHub Free limits concurrency instead: "
                        "20 jobs at once, 5 of them macOS. Until 24 November MP was private and drew on the org's $12 a month."),
                   card("stopwatch", "#E3FCEF", "MP's CI today",
                        "A PR run bills about 9 minutes (each job rounds up to a minute); a merge about 8. On 1 and 2 November MP used "
                        "219 Linux minutes and MA 58: setup days, not a normal month."))
            + ul(["A proposed normal month, 40 PR pushes and 20 merges, is about 520 Linux minutes. On a public repository that costs nothing.",
                  "Only if the repository went private again would minutes be billed, past a $12 shared allowance: 100 Linux minutes about £0.58, 100 macOS minutes about £5.95.",
                  "Apple builds run on the owner's Mac " + f"({link('rec-apple-testing', 'Apple testing')}). macOS runner minutes are now free too; "
                  "whether any Apple build moves to CI is open for the owner (MP-199).",
                  "GitHub is not yet in the cost model; it needs a line, planned at £0 with a cap " + f"({link('rec-cost', 'Cost and the £100 ceiling')})."])
            + expand("How these figures were reached",
                     ul(["Public-repository billing and limits: docs.github.com, checked 24 November 2026: standard runners free and unlimited, concurrency limits apply.",
                         "Prices: docs.github.com, GitHub Actions billing and Actions runner pricing, checked 2 November 2026.",
                         "Usage: the org's billing usage report for October and November 2026, read 2 November 2026.",
                         "Pounds use the cost specification's central £0.80 per dollar and 20% tax.",
                         "While the repository was private: without a payment method GitHub stops runs at the allowance; whether one is on file is not verified."]))

            + "<h2>❓ To decide</h2>"
            + panel("hourglass", "#FFFAE6", ul([
                "The wording of the AWS rule for route A, the release workflow only the owner can start (owner-selected 3 November 2026). PL-11 (MP-30)",
                                "Zip or container images, and the Python version for durable workflows. PL-11 (MP-30)",
                "The vulnerability policy: threshold, exception expiry, the weekly sweep. PL-11 (MP-30)",
                "The CI budget: minutes are free while the repository is public; a hard stop or budget matters only if it goes private again. PL-11 (MP-30)",
                "Whether to switch on OSV-Scanner and gitleaks now, under their own MP issue. Dependabot alerts, CodeQL and secret scanning already run.",
                "The prod gate on a public repository: whether route A stands, or a protected environment replaces or joins it, is open for the owner (MP-199)."]))
            + f"<p><strong>Phases:</strong> {link('ph-00', 'PH-00')} writes the Terraform ADR and sets up the accounts; "
              f"{link('ph-02', 'PH-02')} brings the first deployed runtime, so the dev pipeline and dev smoke; "
              f"{link('ph-08', 'PH-08')} holds prod promotion, the rollback exercises and the whole-release gates (L8-S02, L8-S04).</p>"
            + footer())


def rec_web_quality(s: str) -> str:
    checked = "checked 2 Nov 2026"
    return (banner("proposed", "A proposal. <code>web/</code> does not exist and no screen is designed: these checks run once the PWA is built, "
                   "after the architecture sign-off and UX approval. WCAG 2.2 Level AA is the owner-selected standard (3 November 2026, MP-177).",
                   ["ARCHITECTURE.md", "AGENTS.md", "docs/planning/ma-reconciliation-2026-11-02/phase-story-baseline.json"])
            + gif(s, "a11y-pipeline", "One screen through ARIA snapshots, axe-core, a screenshot diff and the staleness rule.")
            + "<h2>🗺️ The drawing</h2>" + lucid(s, 6, "Web quality on every screen: ARIA snapshots, axe-core, screenshots and the staleness rule.", LUCID_QUALITY)
            + cols(card("white_check_mark", "#E3FCEF", "Already the rule",
                        "Accessible, responsive PWA views. Never hide risk, staleness or a data provider's status behind a loading state (AGENTS.md, ARC-10)."),
                   card("bulb", "#FFFAE6", "The standard: owner-selected",
                        "WCAG 2.2 Level AA, the W3C Recommendation (current version 12 December 2024), for web, iPhone and iPad (owner, 3 November 2026, MP-177). It adds nine success criteria to 2.1 and drops 4.1.1 Parsing."))
            + "<h2>🧪 Four checks in one browser session</h2>"
            + table(["Check", "Tool", "Catches", "Status"], [
                ["Journeys", "Playwright on the built static SvelteKit app, against a local stub API with synthetic data", "A broken flow, a dead link, a lost state", lozenge("proposed")],
                ["Structure", "Playwright's <code>toMatchAriaSnapshot</code>, kept as <code>.aria.yml</code> files in the repo", "A button losing its name, a heading changing level, a live region vanishing", lozenge("proposed")],
                ["Rules", "<code>@axe-core/playwright</code> with the WCAG 2.0, 2.1 and 2.2 A and AA tags; any violation fails the test", "The faults a machine can find", lozenge("proposed")],
                ["Looks", "A screenshot comparison (three options below)", "An unintended visual change", lozenge("open")]])
            + ul(["An ARIA snapshot is a diff against the last approved tree, not a WCAG test. axe is the rule check, and it finds on average 57% of WCAG issues by its makers' count; the rest need people.",
                  "Each release gets a keyboard-only pass and a VoiceOver pass in Safari, by hand.",
                  "Browsers: Chromium and WebKit. The PWA on an iPad runs in Safari's engine; Playwright's WebKit is close to it, not the same, so Safari itself is checked by hand.",
                  "Widths: a phone and a laptop to start, plus the 320 CSS pixel reflow check. The real breakpoints come with the design.",
                  "Elements are found by the shared test-ID dictionary, the same one the Apple app uses (" + link('rec-apple-testing', 'iOS and iPadOS testing') + ")."])
            + "<h2>♿ What WCAG 2.2 adds that matters to MP</h2>"
            + table(["Criterion", "Where MP meets it", "Checked by"], [
                ["2.4.11 Focus Not Obscured (Minimum)", "A sticky header, the chat panel or the cost bar never covers the focused control", "A Playwright test per main screen"],
                ["2.5.7 Dragging Movements", "Scrubbing a forecast fan has a non-drag way in: buttons or a table", "A Playwright test, then by hand"],
                ["2.5.8 Target Size (Minimum)", "Approve, reject and the horizon tabs are at least 24 by 24 CSS pixels", "A Playwright size check"],
                ["3.3.7 Redundant Entry", "An import correction never asks again for what was already given", "By hand, per journey"],
                ["3.3.8 Accessible Authentication (Minimum)", "Passkeys and Apple or Google sign-in, and step-up, with no memory or puzzle test", "By hand, per journey"]])
            + "<h2>⏳ The spinner rule, as a test</h2>"
            + "<p>AGENTS.md says MP never hides risk, staleness or a provider's status behind a loading state. "
            + "Each state gets a fixture, and Playwright holds or replaces the API's reply to test it.</p>"
            + table(["State", "The test asserts", "Status"], [
                ["Loading", "While a reply is held, the as-of time, staleness label and provider status of every figure already shown stay visible and in the ARIA tree", lozenge("proposed")],
                ["Stale", "The stale label is text in the ARIA snapshot, not only a colour", lozenge("proposed")],
                ["Provider down", "The page says which provider and since when; a forecast shows as unavailable, never as a blank or a spinner", lozenge("proposed")],
                ["Forecast states", "Disagreement, insufficient history, no clear view, disabled, corrected outcome and cost-paused each render with their reason (FC-16)", lozenge("proposed")],
                ["Busy regions", "<code>aria-busy</code> is never set on a region that holds a risk or a freshness label", lozenge("proposed")]])
            + "<p>A test fails when a spinner is the only thing where a risk, a freshness label or a provider status should be.</p>"
            + "<h2>📸 Screenshot comparison: the options</h2>"
            + f"<p>Prices {checked}, in pounds at the cost specification's £0.80 to the dollar plus 20% tax.</p>"
            + table(["Option", "Price", "Trade-off", "Status"], [
                ["Playwright's own <code>toHaveScreenshot</code>", "Free", "Baselines live in the repo. Rendering varies by operating system, so baselines are made and checked in one pinned Linux image, locally and in CI", lozenge("proposed") + " recommended"],
                ["Argos Hobby", "Free, 5,000 captures a month; uploads pause at the limit; every capture, image or not, counts", "A review dashboard, but screenshots leave for a third party: synthetic data only. Terms for a private repo are unverified", lozenge("open")],
                ["Argos Pro", "100 USD a month for 35,000 captures, then 0.004 USD each", "£96.00 a month: nearly the whole £100 ceiling", lozenge("open") + " not proposed"],
                ["Other hosted services (Percy, Chromatic and the like)", "Not priced here; unverified", "Same trade-off as Argos", lozenge("open") + " not proposed"]])
            + ul(["Volume if Argos were chosen: about 12 screen areas, 2 widths and 2 themes make 48 captures a run, so about 100 runs a month before the Hobby limit.",
                  "Running the suite in CI on GitHub's Linux runner costs nothing: standard GitHub-hosted runners, macOS included, are free and unlimited on a public repository (GitHub docs, checked 24 November 2026)."])
            + "<h2>🗓️ When it runs</h2>"
            + table(["Step", "When", "Status"], [
                ["Lint, type checks, unit tests", "Every pull request that touches <code>web/</code>", lozenge("proposed")],
                ["Playwright, ARIA snapshots, axe, screenshots", "Locally first; in CI on pull requests touching <code>web/</code>, or only on request", lozenge("open")],
                ["Keyboard, VoiceOver and real Safari", "By hand before a release", lozenge("proposed")]])
            + panel("hourglass", "#FFFAE6", "<p><strong>To decide</strong></p>" + ul([
                "The screenshot tool: Playwright's own (proposed) or Argos Hobby: PL-11 (MP-30).",
                "Whether the browser suite runs on every web pull request or only on request: PL-11 (MP-30).",
                "Browsers, widths and themes, with the screens: PL-14 (MP-30).",
                "The list of states that may never hide behind loading: FC-16 (MP-21)."]))
            + f"<p>Phase: {link('ph-06', 'PH-06 · Web discovery, ranked actions, proof and briefings')}, whose deliverables include the web journey and accessibility acceptance pack. "
            + "The tooling waits for <code>web/</code>.</p>"
            + f"<p>Related: {link('rec-clients', 'The two doors: web and Apple')} · {link('rec-testing', 'Testing')} · "
            + f"{link('rec-apple-testing', 'iOS and iPadOS testing')} · {link('screens', 'Screens and UX')}.</p>"
            + footer())


def rec_apple_testing(s: str) -> str:
    checked = "checked 2 Nov 2026"
    return (banner("proposed", "A proposal. No Apple app exists, no screen is designed and the supported devices are not agreed (PL-14, MP-30). "
                   "Testing on simulators costs nothing. For now the owner has chosen no paid Apple Developer Program (3 November 2026): the app runs as free local builds that expire after 7 days, so no TestFlight, Apple push or Sign in with Apple until the Developer Program is bought (MP-179).",
                   ["ARCHITECTURE.md", "AGENTS.md", "docs/planning/ma-reconciliation-2026-11-02/gap-register.json"])
            + gif(s, "device-matrix", "A Maestro flow across iPhone and iPad sizes, then a free local build on the owner's devices; TestFlight later, if the owner joins.")
            + "<h2>🗺️ The drawing</h2>" + lucid(s, 4, "Apple testing on the owner's Mac, free local builds for now, and the private TestFlight beta later.", LUCID_QUALITY)
            + "<h2>📲 What is already fixed, and what is not</h2>"
            + table(["Fact", "Source", "Status"], [
                ["SwiftUI owns the iOS and iPadOS screens, persistence, widgets, Keychain and notifications",
                 "ARC-10, AGENTS.md, ARCHITECTURE.md §11", lozenge("selected")],
                ["The React Native shell owns navigation and typed bridge contracts only", "ARC-10, AGENTS.md", lozenge("selected")],
                ["Shared API and event schemas are tested on both sides of every boundary", "AGENTS.md", lozenge("selected")],
                ["Supported iOS and iPadOS versions, devices, and what &quot;Duo&quot; means", "PL-14 (MP-30); TECH-STACK.md §5", lozenge("open")],
                ["Android screens stay out of the release; the shell does not imply an Android app", "L7-S04", lozenge("proposed")]])
            + "<h2>🧪 Three layers, cheapest first</h2>"
            + table(["Layer", "Tool", "Runs on", "Cost", "Status"], [
                ["Views and units", "XCTest and XCUITest in Xcode", "The owner's Mac", "£0", lozenge("proposed")],
                ["Journeys end to end", "Maestro CLI and Studio, free and open source, on iOS simulators", "The owner's Mac", "£0", lozenge("proposed")],
                ["Every pull request", "Maestro's flow syntax check and the test-ID check (below)", "GitHub's Linux runner, seconds", "Inside the free allowance", lozenge("proposed")],
                ["Real hardware", "A free local build from Xcode on the owner's iPhone and iPad; it expires after 7 days and has no Apple push", "Real devices", "£0", lozenge("selected")]])
            + ul(["Maestro drives simulators only; Face ID hardware and a real VoiceOver pass happen on a free local build, by hand. Real Apple push needs the paid Program, so it waits; phone alerts come through Web Push for now.",
                  "Flows run against a local stub of the FastAPI with synthetic data. Nothing is deployed, so there is no live mode until the dev account exists (ARC-11).",
                  "A flow that tests a figure also checks its as-of time and provider status are on screen while it loads: the same never-behind-a-spinner rule as the web."])
            + "<h2>🏷️ One ID scheme for web and Apple</h2>"
            + "<p>One dictionary of test IDs, kept with the shared contracts, generates both sides: <code>data-testid</code> for the SvelteKit PWA, "
            + "which Playwright finds with <code>getByTestId</code>, and Swift constants for <code>.accessibilityIdentifier</code> and the shell's <code>testID</code>, "
            + "which Maestro finds with its <code>id</code> selector. One journey then reads the same on both doors.</p>"
            + ul(["IDs name the job, not the look: <code>mpp.forecast.freshness</code>, <code>mpp.import.approve</code>.",
                  "IDs never carry a value, a holding or anything personal.",
                  "A check fails when a Maestro flow or a Playwright test names an ID the dictionary lacks.",
                  "An ID is for tests; VoiceOver reads the label. Tests check both, so an ID never stands in for a missing label.",
                  "The prefix <code>mpp.</code> is proposed so MP's IDs never mix with MA's <code>mp.</code> dictionary if the two ever exchange data (PH-09).",
                  "That the shell's <code>testID</code> reaches iOS as the accessibility identifier, through SwiftUI views hosted in the shell, is to be proved in the first bridge spike."])
            + "<h2>📐 iPad: widths and rotation</h2>"
            + "<p>Layout follows the window's width, not the device's name. The breakpoints come from the screen design, not from MA's four bands, "
            + f"so they are set when the screens are drawn ({link('screens', 'Screens and UX')}).</p>"
            + table(["Case", "What the flow asserts", "Status"], [
                ["iPhone, portrait and landscape", "The compact layout; nothing clipped", lozenge("proposed")],
                ["iPad portrait, landscape, Split View and Stage Manager widths", "The layout for each agreed width band", lozenge("proposed")],
                ["Rotation in the middle of a journey", "A half-typed question or an open import approval survives with no lost input", lozenge("proposed")],
                ["Which devices and versions are in the matrix", "Set by PL-14 (MP-30)", lozenge("open")]])
            + "<h2>♿ VoiceOver, Dynamic Type and the other settings</h2>"
            + table(["Check", "How", "Status"], [
                ["Dynamic Type, smallest to the largest accessibility size", "<code>xcrun simctl ui</code> sets the size before a Maestro run; figures and the Confirm button stay whole", lozenge("proposed")],
                ["Light, dark, Increase Contrast, Reduce Motion", "Set per run; functional flows launch with motion stilled so figures are not read mid-animation", lozenge("proposed")],
                ["Automated audit", "XCUITest's accessibility audit on each main screen, on the Xcode version chosen", lozenge("proposed")],
                ["VoiceOver", "A walkthrough by hand on a free local build on a real device; a test runner cannot listen", lozenge("proposed")],
                ["Charts", "Each chart has a text alternative and a summary value (L6-S03, L7-S02)", lozenge("proposed")],
                ["Lock screen and app switcher", "A simulated push carries a neutral payload; no holding or amount appears (L7-S02)", lozenge("proposed")]])
            + panel("information_source", "#DEEBFF", "<p><strong>For now: free local builds (owner, 3 November 2026).</strong> Builds install from Xcode on the owner's own iPhone and iPad and expire after 7 days. Free builds cannot use Apple push notifications, TestFlight or Sign in with Apple, so phone notifications come through the web app's Web Push. The TestFlight plan below applies once the owner chooses to pay.</p>")
            + "<h2>✈️ A private TestFlight beta, later</h2>"
            + table(["Apple's rule (" + checked + ")", "What MP proposes", "Status"], [
                ["Up to 100 internal testers, who are App Store Connect users", "One internal group: the owner only", lozenge("proposed")],
                ["A build can be tested for up to 90 days, then becomes unavailable", "A reminder at day 60 of each build; a new upload restarts the clock", lozenge("proposed")],
                ["A build uploaded as TestFlight Internal Only can go only to internal groups", "Every MP build is uploaded that way", lozenge("proposed")],
                ["External testing (up to 10,000 people) goes through App Review", "Not used", lozenge("proposed")],
                ["The Developer Program is 99 USD a membership year", "Needs the owner's yes and a cost model update", lozenge("open")]])
            + ul(["Builds are uploaded by hand from Xcode on the owner's Mac, so no App Store Connect key is stored in GitHub and no Mac CI minutes are spent.",
                  "A beta build talks to the dev account only, which must exist first (PH-02, ARC-11). TestFlight access is not sign-in: Cognito still decides who gets in.",
                  "TestFlight feedback screenshots go to Apple. Send them only from synthetic data or with amounts hidden."])
            + "<h2>💷 What it costs</h2>"
            + f"<p>Prices {checked}, in pounds at the cost specification's £0.80 to the dollar plus 20% tax.</p>"
            + table(["Item", "Price", "In MP's money", "Status"], [
                ["Maestro CLI and Studio", "Free", "£0", lozenge("proposed")],
                ["Maestro Cloud", "250 USD per device a month", "£240.00 a month: 2.4 times the whole £100 ceiling", lozenge("open") + " not proposed"],
                ["GitHub macOS runner", "Free and unlimited on a public repository (GitHub docs, checked 24 November 2026); 0.062 USD a minute on a private one", "£0 while the repository is public; GitHub Free runs at most 5 macOS jobs at once", lozenge("open") + " not proposed"],
                ["Apple Developer Program", "99 USD a membership year, charged in local currency at enrolment", "£95.04 in the month it is paid", lozenge("open")]])
            + panel("warning", "#FFEBE6",
                    "<p>MP counts cash in the month an invoice is due. If the owner joins, the Apple fee on top of an ordinary Grow 55 month "
                    "makes about £141.52 with Claude off, or £149.77 with Claude on: over the £100 ceiling. "
                    "The owner allowed that one month a year above £100, for this fee only (2 November 2026), and has not joined for now (3 November 2026). "
                    "Push, Sign in with Apple and passkeys on a real device most likely need the membership too, so this is a cost of the Apple door itself, not only of TestFlight.</p>")
            + "<p>The repository is public, so GitHub's standard runners, macOS included, cost nothing (GitHub docs, checked 24 November 2026). "
            + "Local first still holds: simulator runs stay on the owner's Mac until the owner chooses otherwise (MP-199).</p>"
            + panel("hourglass", "#FFFAE6", "<p><strong>To decide</strong></p>" + ul([
                "Supported iOS and iPadOS versions, devices and what &quot;Duo&quot; means: PL-14 (MP-30).",
                "Whether and when to join the Apple Developer Program. Its fee month is allowed above £100 as a one-off exception (owner, 2 November 2026): PL-11 (MP-30).",
                "The Mac CI budget: £0 either way now; whether simulator runs stay on the owner's Mac or move to free macOS runners: PL-11 (MP-30), MP-199.",
                "The test-ID prefix and where the shared dictionary lives: PL-14 (MP-30).",
                "The largest Dynamic Type size and the settings every screen must pass: PL-14 (MP-30), L7-S02.",
                "Testers: the owner only, or others too (no gap yet)."]))
            + f"<p>Phase: {link('ph-07', 'PH-07 · Native Apple, offline and push')}, after PH-02 and PH-06. Nothing runs before UX approval and explicit permission to build.</p>"
            + f"<p>Related: {link('rec-clients', 'The two doors: web and Apple')} · {link('rec-testing', 'Testing')} · "
            + f"{link('rec-web-quality', 'Web visual regression, ARIA snapshots and WCAG 2.2 AA')} · {link('screens', 'Screens and UX')}.</p>"
            + footer())


def rec_perimeter(s: str) -> str:
    """🧱 Optional VPC lockdown, data perimeter and costing (PROPOSED). MP-36; adapted from MA's page 3670133."""
    price_list = "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/index.json"
    return (banner("proposed", "Nothing here is deployed. The owner approved N0, a perimeter without a VPC, on 3 November 2026. "
                   "The lockdown is optional, off by default and decided late. The Region is Virginia (us-east-1), owner-selected "
                   "on 2 November 2026 (PL-10, MP-29); London is shown alongside for comparison.",
                   ["ARCHITECTURE.md", "AGENTS.md",
                    "docs/planning/layered-development-2026-11-01/network-topology-options.md",
                    "docs/planning/foundation-specifications-2026-11-02/costs/specification.md"])
            + gif(s, "perimeter-layers", "The layers of the perimeter, and what each lockdown option costs a month.")
            + "<h2>🗺️ The drawing</h2>" + lucid(s, 5, "The baseline perimeter, and the optional lockdown with its costs.", LUCID_QUALITY)
            + cols(card("shield", "#E3FCEF", "The baseline: no VPC",
                        "Two accounts, tight IAM roles, resource policies, encryption, an organisation-wide guard rail and an audit trail. "
                        "Almost all of it is free. This is how MP starts."),
                   card("lock", "#FFFAE6", "The option: a lockdown",
                        "Lambdas inside private subnets, with a controlled way out to Claude and the market data. "
                        "It adds about £14 to £250 a month, against an AWS share of £22 that the baseline already nearly fills."))

            + "<h2>🛡️ The baseline perimeter, without a VPC</h2>"
            + "<p>The perimeter is built from who may act on what, not from where traffic flows.</p>"
            + table(["Control", "What it does in MP", "Cost a month", "Status"], [
                ["Two accounts", "Dev and prod are separate AWS accounts on one bill. A dev mistake or a leaked dev key cannot reach prod by default (ARC-11).",
                 "$0", lozenge("selected")],
                ["AWS Organizations, all features", "Owner-selected 3 November 2026. Needed for the guard rails below; consolidated billing alone cannot hold them. The management account runs nothing, because they do not apply to it.",
                 "$0", lozenge("selected")],
                ["Service control policies", "A cost guard (owner-selected): no NAT, interface endpoints, VPN, load balancers, SageMaker endpoints or GPUs until an ADR lifts it. Proposed alongside: never stop CloudTrail, never leave the organisation. A Region allowlist is not adopted.",
                 "$0", lozenge("selected")],
                ["Resource control policies", "Would cap who can reach MP's S3, KMS, SSM, SQS and STS. Not adopted (owner, 3 November 2026): each bucket, key and queue policy carries the conditions itself.",
                 "$0", lozenge("selected") + " not adopted"],
                ["Least-privilege IAM", "One role per Lambda, each Claude route worker included (ARC-06), scoped to its own table, prefix and secret. Prod deploys come from CI only.",
                 "$0", lozenge("proposed")],
                ["Resource policies", "Bucket, key and queue policies name the exact roles. The PWA bucket is read only by CloudFront through origin access control.",
                 "$0", lozenge("proposed")],
                ["S3 Block Public Access", "On at account level in both accounts, so no bucket policy can make anything public. New buckets block it already.",
                 "$0", lozenge("proposed")],
                ["Encryption", "S3 and DynamoDB encrypt at rest by default, free. One customer managed KMS key per account guards the ledger, evidence and secrets, under a key policy MP controls.",
                 "$1 a key, plus $0.03 per 10,000 requests; already in the cost model", lozenge("proposed")],
                ["IAM Access Analyzer", "The external access analyzer flags anything shared outside the organisation. The unused-access and internal-access analyzers stay off.",
                 "$0 (the paid two: $0.20 per role a month, $9 per resource a month)", lozenge("proposed")],
                ["CloudTrail", "One trail per account delivers one copy of management events to an encrypted S3 bucket. Data events only where audit needs them.",
                 "$0 for the first copy, plus S3 storage; data events $0.10 per 100,000", lozenge("proposed")]])
            + panel("bulb", "#DEEBFF", "<p><strong>What a data perimeter means here.</strong> AWS describes three walls: identity (only our people), "
                    "resource (only our things) and network (only from our networks). Without a VPC, MP builds the first two with "
                    "<code>aws:PrincipalOrgID</code> and <code>aws:ResourceOrgID</code> conditions in each bucket, key and queue policy (no RCPs). "
                    "The third wall, <code>aws:SourceVpce</code>, needs a VPC. It is the main thing a lockdown adds.</p>")

            + "<h2>🌐 Why MP starts without a VPC</h2>"
            + ul(["Lambda has internet access by default. Attached to a VPC, it loses it until a NAT is added; a public subnet gives it no public address.",
                  "The Claude workers call the Anthropic API and the data workers call Yahoo Finance and Twelve Data. No VPC endpoint reaches them, so inside a VPC they need a NAT.",
                  "<code>AGENTS.md</code> rules out a NAT Gateway without a revised cost model and an ADR.",
                  "API Gateway, Cognito, CloudFront, DynamoDB and S3 never sit inside a customer VPC, whatever the Lambdas do.",
                  "Security groups filter by address and port, not host name. A host allowlist needs a DNS firewall or a proxy, each priced separately."])
            + panel("no_entry_sign", "#FFEBE6", "<p><strong>A VPN is not a sign-in.</strong> A VPN may be added later as an extra layer, but it never replaces "
                    "authentication (PL-10). Every request is still signed in through Cognito and checked by the API, on a VPN or off it.</p>")

            + "<h2>🔒 The optional lockdown, in four steps</h2>"
            + "<p>Each step is stricter or dearer than the one before. N1 and N1-E are the options in MP's network appendix.</p>"
            + table(["Step", "What it adds", "Network option", "Status"], [
                ["L1 Private jobs only", "Two private subnets with free S3 and DynamoDB gateway endpoints, for a job that never calls out. No internet route. Everything else stays outside.",
                 "N1", lozenge("proposed") + " only for a proven need"],
                ["L2 Lean lockdown", "Every Lambda in the VPC. One small NAT instance (t4g.nano, run and patched by us) per zone carries calls to Claude, the data providers and AWS APIs.",
                 "N1-E", lozenge("open")],
                ["L3 Managed lockdown", "As L2, with an AWS managed NAT Gateway per zone instead of the instance. Nothing to patch, a much higher floor.",
                 "N1-E", lozenge("open")],
                ["L4 Strict lockdown", "As L3, plus four interface endpoints (SSM, SQS, STS, KMS) so calls to AWS never leave through the NAT.",
                 "N1-E", lozenge("open")]])

            + "<h2>💷 What each step costs a month</h2>"
            + "<p>Extra AWS cost on top of MP's baseline, before data volume beyond the stated assumption. "
              "At the cost specification's central scenario: £0.80 to the dollar and 20% tax.</p>"
            + table(["Step", "Per environment, 1 zone (Virginia)", "Per environment, 2 zones (Virginia)", "MP total: dev 1 zone, prod 2 zones (Virginia)", "Same total (London)"], [
                ["L1 Private jobs only", "$0", "$0", "$0 (£0)", "$0 (£0)"],
                ["L2 Lean lockdown", "$7.36", "$14.71", "$22.07 (£21.19)", "$23.47 (£22.53)"],
                ["L3 Managed lockdown", "$36.73", "$73.23", "$109.77 (£105.38)", "$120.75 (£115.92)"],
                ["L4 Strict lockdown", "$65.98", "$131.68", "$197.43 (£189.53)", "$217.17 (£208.48)"]])
            + table(["Against the budget", "Virginia", "London"], [
                ["Baseline AWS, both accounts (cost specification)", "£18.64", "£19.11"],
                ["Left in the £22 AWS share", "£3.36", "£2.89"],
                ["Cheapest paid step: L2 with one zone in each account", "£14.12", "£15.02"],
                ["The ordinary month (Grow 55, Claude off), plus L2 (dev 1 zone, prod 2 zones)", "£46.48 + £21.19 = £67.67, past the £60 warning", "£46.95 + £22.53 = £69.48, past the warning"]])
            + ul(["The baseline leaves about £3 of the £22 AWS share, so every paid step overruns it. L3 and L4 alone pass the £100 ceiling, whatever data plan is chosen.",
                  "The floor is fixed: a NAT Gateway or an endpoint bills every hour it exists, busy or idle.",
                  "Not priced here: a DNS firewall, AWS WAF, GuardDuty, flow logs and a network firewall. Each is its own costed decision.",
                  "Not offered: IPv6-only egress through a free egress-only gateway. It works only if every destination answers on IPv6, which is unverified."])
            + expand("How the numbers are made", ul([
                f"Rates from the AWS price list offer files for us-east-1 and eu-west-2 (<a href=\"{price_list}\">index</a>), checked 2 Nov 2026, 730 hours a month.",
                "NAT Gateway: $0.045 an hour and $0.045 per GB in Virginia; $0.05 and $0.05 in London. Each NAT also holds a public IPv4 address at $0.005 an hour.",
                "Interface endpoint: $0.01 per zone-hour in Virginia, $0.011 in London, plus $0.01 per GB. Gateway endpoints for S3 and DynamoDB: no charge.",
                "NAT instance: t4g.nano at $0.0042 an hour in Virginia, $0.0047 in London; an 8 GB gp3 disk at $0.08 or $0.0928 per GB-month; one public IPv4 address.",
                "Assumed traffic: 5 GB a month through the NAT in prod and 1 GB in dev; four interface endpoints. More traffic adds per-GB charges.",
                "Baseline AWS run rates are the cost specification's: $19.42 in Virginia and $19.90 in London, with no free tier deducted."]))

            + "<h2>🧭 The recommendation</h2>"
            + panel("white_check_mark", "#E3FCEF", "<p>Build the baseline perimeter, with no VPC (N0). Keep the lockdown <strong>off by default</strong>. "
                    "Use L1 only if a job is shown to need a private network. Decide the lockdown last, at PH-08, from measured traffic and the security "
                    "evidence of that phase. Any paid step needs a revised cost model and an ADR first. None of the steps is selected. "
                    "The owner approved N0, with Organizations on all features and the cost-guard SCP, on 3 November 2026.</p>")
            + panel("question", "#FFFAE6", "<p><strong>To decide</strong></p>" + ul([
                "Whether any job, such as private SageMaker training, needs L1 (PL-10, MP-29; PL-07, MP-24).",
                "One customer managed key per account, or AWS keys only (PL-10, MP-29).",
                "Whether the lockdown is turned on, and which step, as part of release evidence (PL-11, MP-30)."]))
            + "<p><strong>Phases:</strong> PH-00 settles the network option and Region; PH-02 builds the baseline perimeter with the private runtime; "
              "PH-08 decides the lockdown; a deferred lockdown can return as a PH-09 extension.</p>"
            + "<p>See also " + link("rec-system") + ", " + link("rec-cost") + " and " + link("rec-identity") + ".</p>"
            + footer())


def rec_stack(s: str) -> str:
    return (banner("proposed", "One level below the system page: the libraries, the contracts and how a request flows. The layers are owner-selected (ARC-02 to ARC-10); the library picks are proposed. Only the FastAPI starter runs, on a laptop.",
                   ["ARCHITECTURE.md", "TECH-STACK.md", "docs/planning/ma-reconciliation-2026-11-02/direction-summary.md",
                    "docs/planning/claude-models-and-batching-2026-11-02.md"])
            + gif(s, "stack-build", "The stack, layer by layer, from the doors to the records.")
            + "<h2>🗺️ The drawing</h2>" + lucid(s, 1, "The stack end to end, each layer with its libraries and status.", LUCID_QUALITY)
            + panel("compass", "#DEEBFF",
                    f"<p>The AWS services are on {link('rec-system')}. This page says what each layer is built with, which contract it keeps, "
                    f"and how one question travels from a tap to Claude and back. How all of it is watched is on {link('rec-observability')}.</p>")
            + "<h2>🧱 The layers, one level down</h2>"
            + table(["Layer", "Built with", "The contract it keeps", "Status"], [
                ["Web (ARC-10)", "SvelteKit 3 with the static adapter, built once and served from private S3 through CloudFront; a service worker for the PWA and Web Push",
                 "No server rendering. Every private read or command is an authenticated call to <code>/api/v1</code>", lozenge("selected")],
                ["Apple", "SwiftUI owns the screens, local persistence, widgets, Keychain and notifications; a React Native shell owns navigation",
                 "The bridge carries typed messages only, never a secret. Swift, not the shell, keeps the offline cache", lozenge("selected") + " device matrix " + lozenge("open")],
                ["API", "FastAPI with Pydantic v2 models at every boundary; Uvicorn locally",
                 "Routes under <code>/api/v1</code>; a schema in and out, never a storage record", lozenge("implemented") + " health route and sample SSE, locally"],
                ["API on AWS", "The same app on ordinary Lambda behind API Gateway, through a Lambda adapter in buffered mode, and in streaming mode for the SSE route",
                 "Commands return quickly; long work becomes a job", lozenge("selected") + " Lambda; adapter " + lozenge("proposed")],
                ["Work (ARC-03)", "EventBridge Scheduler, SQS with a dead-letter queue, and Lambda Durable Functions written in Python",
                 "Every step is idempotent by key; a replay is a new attempt, never an edit of the old one", lozenge("selected")],
                ["Claude workers (ARC-06, ARC-06b)", "The official <code>anthropic</code> Python SDK in an explicit loop; one Lambda per task route sharing one bounded runner; Message Batches for work no one waits for",
                 "Tools are allowlisted, typed and read-only by default. Extraction runs with no tools", lozenge("selected")],
                ["Records (ARC-02)", "DynamoDB and private, encrypted S3, through a thin typed repository on <code>boto3</code>",
                 "One controlled writer commits to the ledger. Predictions, model runs and outcomes are append-only", lozenge("selected") + " repository " + lozenge("proposed")],
                ["Models (ARC-04, ARC-05)", "scikit-learn style pipelines on NumPy and pandas; capped SageMaker CPU training jobs; approved artefacts run in an inference Lambda",
                 "Only an approved artefact, found by its hash, can produce a forecast", lozenge("selected")],
                ["Evals (ARC-09)", "Inspect AI for agent scenarios and replays; pytest for unit and contract tests",
                 "Deterministic checks and replays first; forecast validation stays a separate, walk-forward evidence line", lozenge("selected")]])
            + "<h2>🔀 How one question flows</h2>"
            + "<p>The owner taps <em>Why did this forecast fall?</em> Every hop below is proposed; the step that crosses SQS still needs its propagation proved.</p>"
            + table(["Step", "What happens", "What travels with it"], [
                ["1. The door", "The PWA or the Apple app sends the question to <code>POST /api/v1/conversations/{id}/turns</code> with the Cognito token",
                 "A new W3C <code>traceparent</code> and a <code>client_message_id</code>, which doubles as the idempotency key"],
                ["2. API Gateway", "Checks the token, then hands the request to the API Lambda", "Its own <code>request_id</code>"],
                ["3. FastAPI", "Pydantic validates the body. The cost check reserves the turn's maximum spend. A run record is written as <em>accepted</em>, and the job goes to the chat route worker",
                 "Returns <code>202</code> with the job id, <code>request_id</code> and <code>trace_id</code>"],
                ["4. Chat route worker", "Marks the run <em>started</em> and calls Sonnet 5.5 in a server-controlled loop. Each tool call reads stored forecasts, prices and event analyses from DynamoDB",
                 "<code>run_id</code> on every log line and span; no prompt text"],
                ["5. The answer", "Every figure in it comes from a tool result. The turn is stored append-only with its citations, and the run record closes with tokens, cost, tools and outcome",
                 "Model id, token counts, cost estimate"],
                ["6. Back to the door", "An SSE notice says the turn is ready; the door re-reads it with an authenticated <code>GET</code>",
                 "The notice holds an event id, a type, a time and a resource reference, nothing more"]])
            + "<h2>📜 The contracts every layer keeps</h2>"
            + ul(["<strong>One error shape</strong> on every failure, 401, 403, 422 and 500 alike: a code, a plain message, the <code>request_id</code> and the <code>trace_id</code>. Proposed.",
                  "<strong>Client types come from the API.</strong> FastAPI's OpenAPI document generates the TypeScript types for the web and the Swift types for the app, so a field renamed on the server breaks a build, not a screen. Proposed.",
                  "<strong>SSE stays thin:</strong> one-way, heartbeats, resume from the last event id where it can, and never holdings, credentials, provider payloads or model artefacts.",
                  "<strong>Every command is idempotent.</strong> The same key twice gives the same result and one ledger change.",
                  "<strong>Money is a decimal,</strong> never a float, from the Pydantic model to the DynamoDB number. Proposed.",
                  "<strong>Every market observation</strong> keeps its provider, symbol mapping, source time, ingestion time and quality flags, and is validated before it is stored.",
                  "<strong>Every prediction</strong> carries its as-of time, target, horizon, distribution or probability, calibration, model version, data cutoff and explanation references."])
            + "<h2>📦 The libraries, proposed</h2>"
            + "<p>Every library here is free and open source; none adds a monthly cost. Versions are picked when a story builds the layer and pinned in <code>backend/uv.lock</code>, not here.</p>"
            + table(["Area", "Proposed", "Why", "Status"], [
                ["Lambda adapter", "AWS Lambda Web Adapter, buffered for the API and streaming for SSE", "The same Uvicorn app runs on a laptop and on Lambda; Mangum is the alternative for the buffered routes", lozenge("proposed")],
                ["Logging, metrics, idempotency", "Powertools for AWS Lambda (Python): Logger, Metrics, Idempotency, Parameters", "Structured JSON logs and cheap metrics without extra calls; its Tracer is left out", lozenge("proposed")],
                ["Tracing", "OpenTelemetry for Python through the AWS Distro layer", f"One open standard; the detail is on {link('rec-observability', 'the observability page')}", lozenge("proposed")],
                ["AWS calls", "<code>boto3</code> with <code>boto3-stubs</code> for types; no ORM", "Explicit keys and transactions the controlled writer can reason about", lozenge("proposed")],
                ["Claude", "<code>anthropic</code> Python SDK, explicit loop", "The server decides every step (ARC-06)", lozenge("selected")],
                ["Evaluations", "<code>inspect-ai</code>, with pytest", "ARC-09", lozenge("selected")],
                ["Forecasting", "scikit-learn, NumPy, pandas; pandas-market-calendars and exchange-calendars for sessions", "Strong CPU baselines; versions re-chosen at build time", lozenge("selected") + " family"],
                ["Web", "SvelteKit 3, TypeScript, an OpenAPI type generator", "The UI kit, charts and state library wait for the UX work", lozenge("selected") + " kit " + lozenge("open")],
                ["Apple", "Swift and SwiftUI; an OpenAPI generator for Swift types; a React Native shell", "Swift owns what the device keeps", lozenge("selected") + " generator " + lozenge("proposed")]])
            + panel("no_entry_sign", "#FFEBE6",
                    "<p>Left over from earlier plans and not to be installed for new work: the <code>data</code> extra (SQLAlchemy, asyncpg, Alembic), replaced by DynamoDB, "
                    "and the <code>agents</code> extra (<code>claude-agent-sdk</code>), replaced by the client SDK loop. "
                    + repo("TECH-STACK.md", "TECH-STACK.md") + " lists them.</p>")
            + expand("Where this differs from the sister project",
                     ul(["No UI kit, chart library or framework version is pinned before the UX work; the sister project pinned them all.",
                         "Swift keeps the Apple app's offline cache, as AGENTS.md says; the React Native shell does not.",
                         "Long work runs in Lambda Durable Functions (ARC-03), not Step Functions.",
                         "The ledger has one controlled writer and append-only predictions; no hash-chained audit claim is carried over until it is proved.",
                         "One Lambda adapter for both the API and the stream is proposed, so the code path is the same on a laptop and on AWS."]))
            + panel("question", "#FFFAE6", "<h3>To decide</h3>" + ul([
                                "The Lambda adapter, after the streaming proof through API Gateway (PL-04, MP-23).",
                "Whether a live chat turn goes through SQS or a direct invoke, and the outbox and replay rules (PL-05, MP-23).",
                "One DynamoDB table or a few, and the keys, once ledger atomicity is proved (PL-08, MP-12).",
                "The agent loop, memory and the typed tool manifest (PL-02, CT-07, MP-25).",
                "Who owns which client contract, offline and privacy, before UX (PL-14, MP-30).",
                "The model artefact format and where inference runs (PL-07, MP-24).",
                "The Region and the accounts' set-up (PL-10, MP-29)."]))
            + f"<p><strong>Phases:</strong> {link('ph-00', 'PH-00')} settles the tool and contract choices; {link('ph-01', 'PH-01')} builds the records, "
            + f"{link('ph-02', 'PH-02')} the API runtime and run records, {link('ph-03', 'PH-03')} the data workers, {link('ph-04', 'PH-04')} the models, "
            + f"{link('ph-05', 'PH-05')} the Claude workers and evaluations, {link('ph-06', 'PH-06')} the web and {link('ph-07', 'PH-07')} the Apple app.</p>"
            + footer())


PAGES = [
    {"slug": "home", "title": "mypaisaa-prediction", "parent": None, "status": "record", "body": home},
    {"slug": "hub", "title": "🔮 Mypaisaa Prediction: the plan", "parent": "home", "status": "record", "body": hub},
    {"slug": "record", "title": "📘 The record: the whole architecture", "parent": "hub", "status": "record", "body": record},
    {"slug": "rec-rules", "title": "🧭 The rules, what MP does, and what wins", "parent": "record", "status": "selected", "body": rec_rules},
    {"slug": "rec-system", "title": "🏛️ The system on AWS", "parent": "record", "status": "selected", "body": rec_system},
    {"slug": "rec-stack", "title": "🧱 Tech stack end to end: FastAPI, DynamoDB and agents (PROPOSED)", "parent": "record", "status": "proposed", "body": rec_stack},
    {"slug": "rec-data", "title": "📡 Market data and source rights", "parent": "record", "status": "selected", "body": rec_data},
    {"slug": "rec-ledger", "title": "🗂️ Holdings, imports and the ledger", "parent": "record", "status": "selected", "body": rec_ledger},
    {"slug": "rec-forecast", "title": "🔮 Forecasting: horizons, models and controlled learning", "parent": "record", "status": "selected", "body": rec_forecast},
    {"slug": "rec-claude", "title": "🤖 Claude: routes, models and the batch lane", "parent": "record", "status": "selected", "body": rec_claude},
    {"slug": "rec-identity", "title": "🔐 Identity, sign-in and step-up", "parent": "record", "status": "selected", "body": rec_identity},
    {"slug": "rec-perimeter", "title": "🧱 Optional VPC lockdown, data perimeter and costing (PROPOSED)", "parent": "record", "status": "proposed", "body": rec_perimeter},
    {"slug": "rec-admin", "title": "🛠️ Admin, audit, retention and recovery", "parent": "record", "status": "selected", "body": rec_admin},
    {"slug": "rec-guardrails", "title": "🛡️ Guardrails and evaluations", "parent": "record", "status": "selected", "body": rec_guardrails},
    {"slug": "rec-clients", "title": "📱 The two doors: web and Apple", "parent": "record", "status": "selected", "body": rec_clients},
    {"slug": "rec-web-quality", "title": "♿ Web visual regression, ARIA snapshots and WCAG 2.2 AA (PROPOSED)", "parent": "record", "status": "proposed", "body": rec_web_quality},
    {"slug": "rec-apple-testing", "title": "📲 iOS and iPadOS testing with Maestro and free local builds (PROPOSED)", "parent": "record", "status": "proposed", "body": rec_apple_testing},
    {"slug": "rec-delivery", "title": "🚀 Environments, CI and delivery", "parent": "record", "status": "implemented", "body": rec_delivery},
    {"slug": "rec-testing", "title": "🧪 CI/CD, vulnerability scanning, smoke and regression (PROPOSED)", "parent": "record", "status": "proposed", "body": rec_testing},
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


# ---------- read-back receipts (MP-35, ported from MA-300/MA-303) ----------
# Confluence stores a page in its own document model and returns it in its own words. The reader
# below drops exactly the rewrites seen on the 33 pages read back on 2 Nov 2026 and keeps every
# word, tag, link, status, macro parameter and media node we sent, so a page cut short or changed
# in transit still differs. The cases are in selftest().

RB_DROP = {"data-local-id"}  # Confluence adds an id to every block
RB_DROP_BY_TYPE = {
    "media-single": {"data-width", "data-width-type"},  # 90% becomes a pixel width; full width loses its type
    "media": {"data-width", "data-height"},  # the file's own pixel size, added
    "column": {"data-width"},  # 50 or 33.33, added to each layout column
    "panel-custom": {"data-icon-id", "data-icon-text"},  # the emoji's code point and glyph, added
}
RB_VOID = {"br", "hr", "img", "col", "input", "meta", "link", "wbr", "source", "embed", "area"}
RB_P_WRAPPED = {"th", "td", "li"}  # Confluence wraps a cell's or item's text in a <p>
RB_FONT_SIZE = {"12px": "small", "14px": "small"}  # 14px is stored as 12px


def _rb_text(text: str) -> str:
    text = unicodedata.normalize("NFC", text).replace("️", "").replace("︎", "")
    return " ".join(text.split())


def _rb_style(style: str) -> str:
    decls = []
    for part in style.split(";"):
        if ":" in part:
            k, v = (x.strip().lower() for x in part.split(":", 1))
            decls.append(f"{k}:{RB_FONT_SIZE.get(v, v) if k == 'font-size' else v}")
    return ";".join(sorted(decls))


def _rb_params(raw: str) -> str:
    """A macro's or tab set's parameters without what Confluence adds: macroMetadata and _-prefixed params."""
    try:
        p = json.loads(raw)
    except ValueError:
        return raw
    if isinstance(p, dict):
        p.pop("macroMetadata", None)
        if isinstance(p.get("macroParams"), dict):
            p["macroParams"] = {k: v for k, v in p["macroParams"].items() if not k.startswith("_")}
    return json.dumps(p, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


class _Canon(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)  # entity and numeric encodings read as their characters
        self.out: list[str] = []
        self.buf: list[str] = []
        self.stack: list[tuple[str, bool]] = []  # (tag, emitted)

    def flush(self) -> None:
        text = _rb_text("".join(self.buf))
        self.buf = []
        if text:
            self.out.append(text)

    def handle_starttag(self, tag, attrs):  # noqa: ANN001
        self.flush()
        if tag == "p" and self.stack and self.stack[-1][0] in RB_P_WRAPPED:
            self.stack.append((tag, False))
            return
        a = {k: v or "" for k, v in attrs if k not in RB_DROP}
        for k in RB_DROP_BY_TYPE.get(a.get("data-type", ""), ()):
            a.pop(k, None)
        if a.get("data-layout") == "default":  # Confluence adds the default layout to a macro
            del a["data-layout"]
        if tag == "ol" and a.get("start") == "1":  # and drops a list's default start
            del a["start"]
        if "style" in a:
            a["style"] = _rb_style(a["style"])
        if "data-parameters" in a:
            a["data-parameters"] = _rb_params(a["data-parameters"])
        self.out.append(f"<{tag}" + "".join(f' {k}="{_rb_text(a[k])}"' for k in sorted(a)) + ">")
        if tag not in RB_VOID:
            self.stack.append((tag, True))

    def handle_startendtag(self, tag, attrs):  # noqa: ANN001
        self.handle_starttag(tag, attrs)
        if tag not in RB_VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):  # noqa: ANN001
        if tag in RB_VOID or not any(t == tag for t, _ in self.stack):
            return
        self.flush()
        while self.stack:
            t, emitted = self.stack.pop()
            if emitted:
                self.out.append(f"</{t}>")
            if t == tag:
                break

    def handle_data(self, data):  # noqa: ANN001
        self.buf.append(data)


def canonical(body: str) -> list[str]:
    """A page body as the parts a read-back is compared on: tags with their kept attributes, sorted, and text."""
    c = _Canon()
    c.feed(body)
    c.close()
    c.flush()
    while c.stack:
        t, emitted = c.stack.pop()
        if emitted:
            c.out.append(f"</{t}>")
    return c.out


def readback_body(raw: str, version: int | None = None) -> tuple[str, dict]:
    """The body in a read-back file: getConfluenceContent's whole reply (detail full, html), whose page id and
    version are checked, or a bare HTML body, which must be given its version (--version N)."""
    try:
        d = json.loads(raw)
    except ValueError:
        if version is None:
            raise ValueError("a bare HTML body names no version: pass --version N, or save getConfluenceContent's "
                             "whole reply (detail full, html)") from None
        return raw, {"id": None, "version": version, "envelope": False}
    d = d.get("data", d) if isinstance(d, dict) else {}
    body = d.get("body") if isinstance(d, dict) else None
    if not isinstance(body, dict) or not isinstance(body.get("value"), str):
        raise ValueError("the reply holds no body.value: read the page with detail full and content_format html")
    if body.get("format") not in (None, "html"):
        raise ValueError(f"the body is {body.get('format')}, not html")
    v = ((d.get("metadata") or {}).get("version") or {}).get("number")
    if isinstance(v, bool) or not isinstance(v, int) or not d.get("id"):
        raise ValueError(f"the reply has no page id or version number (id {d.get('id')!r}, version {v!r})")
    return body["value"], {"id": str(d["id"]), "version": v, "envelope": True}


def differences(want: list[str], got: list[str], limit: int = 5) -> list[dict]:
    out = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, want, got, autojunk=False).get_opcodes():
        if op != "equal":
            out.append({"change": op, "part": i1 + 1, "sent": [x[:160] for x in want[i1:i2][:3]],
                        "read_back": [x[:160] for x in got[j1:j2][:3]]})
            if len(out) == limit:
                break
    return out


def record_readback(slug: str, raw: str, version: int | None = None, manifest_: dict | None = None,
                    pages_dir: Path | None = None, receipts_dir: Path | None = None) -> int:
    """set-readback: compare the page as Confluence returns it with pages/<slug>.html as sent and write the
    receipt. 0 when they agree, 1 when they differ, 2 when there is nothing valid to compare."""
    m = manifest_ if manifest_ is not None else M
    pages_dir, receipts_dir = pages_dir or OUT, receipts_dir or RECEIPTS
    rec = m.get("pages", {}).get(slug, {})
    path = pages_dir / f"{slug}.html"
    if not rec.get("id") or not rec.get("sha256"):
        print(f"set-readback {slug}: not published (no id or sha256 in confluence.json)")
        return 2
    if not path.exists() or hashlib.sha256(path.read_bytes()).hexdigest() != rec["sha256"]:
        print(f"set-readback {slug}: pages/{slug}.html is not the file last published (sha256 differs)")
        return 2
    try:
        body, meta = readback_body(raw, version)
    except ValueError as e:
        print(f"set-readback {slug}: {e}")
        return 2
    if meta["id"] is not None and meta["id"] != str(rec["id"]):
        print(f"set-readback {slug}: the read-back is page {meta['id']}, but {slug} is page {rec['id']}")
        return 2
    if meta["version"] != rec.get("version"):
        print(f"set-readback {slug}: the read-back is version {meta['version']}, but version {rec.get('version')} "
              "is recorded as published")
        return 2
    want, got = canonical(path.read_text()), canonical(body)
    ok = want == got
    receipt = {
        "slug": slug, "page_id": str(rec["id"]), "version": meta["version"], "sent_sha256": rec["sha256"],
        "readback_sha256": hashlib.sha256(body.encode()).hexdigest(),
        "canonical_sha256": hashlib.sha256("\n".join(got).encode()).hexdigest(),
        "parts": len(want), "verdict": "match" if ok else "differs", "differences": differences(want, got),
        "id_checked": meta["id"] is not None,
        "read_at": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    receipts_dir.mkdir(parents=True, exist_ok=True)
    (receipts_dir / f"{slug}.json").write_text(json.dumps(receipt, indent=1, ensure_ascii=False) + "\n")
    if ok:
        print(f"set-readback {slug}: matches what was sent ({len(want)} parts)")
        return 0
    print(f"set-readback {slug}: DIFFERS from what was sent; re-publish it")
    for d in receipt["differences"]:
        print(f"  part {d['part']} {d['change']}: sent {d['sent']} read back {d['read_back']}")
    return 1


def receipt_problems(pages_manifest: dict, slugs: list[str], receipts_dir: Path) -> list[str]:
    """Each published page needs a passing receipt for the file and version last published."""
    problems = []
    for slug in slugs:
        rec = pages_manifest.get(slug, {})
        if not rec.get("id") or not rec.get("sha256"):
            continue
        path = receipts_dir / f"{slug}.json"
        if not path.exists():
            problems.append(f"{slug}: published but not read back (no receipt)")
            continue
        r = json.loads(path.read_text())
        if r.get("sent_sha256") != rec["sha256"] or r.get("version") != rec.get("version"):
            problems.append(f"{slug}: the receipt is for an older publish (version {r.get('version')}); read it back")
        elif r.get("verdict") != "match":
            problems.append(f"{slug}: as read back it differs from what was published")
    return problems


def media_problems(needed: dict, media: dict, root: Path) -> list[str]:
    """Every attachment a page needs is uploaded, and is the file as it is now: a changed export under the same name
    is re-uploaded, so the check fails on a hash that differs or is missing (MP-20)."""
    problems = []
    for slug, paths in needed.items():
        for path in paths:
            rec = media.get(slug, {}).get(path)
            if rec is None:
                problems.append(f"{slug}: {path} not attached")
            elif not (root / path).is_file():
                problems.append(f"{slug}: {path} is attached but missing from the repo")
            elif rec.get("sha256") != hashlib.sha256((root / path).read_bytes()).hexdigest():
                problems.append(f"{slug}: {path} changed since it was attached; re-upload it")
    return problems


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
    problems += media_problems(MEDIA_NEEDED, M["media"], ROOT)
    problems += receipt_problems(M["pages"], [p["slug"] for p in PAGES], RECEIPTS)
    for p in problems:
        print("PENDING:", p)
    return 1 if problems else 0


def _confluence_rewrites(sent: str) -> str:
    """What Confluence does to a page it stores, as seen on 2 Nov 2026: the faithful read-back for selftest."""
    n = iter(range(10**6))
    s = re.sub(r"<(p|h2|h3|table|tr|th|td|ul|ol|li|section|figure|hr|details)(?=[ >])",
               lambda m: f'<{m.group(1)} data-local-id="id{next(n)}"', sent)
    s = s.replace('style="font-size: 14px"', 'style="font-size: 12px"')
    s = s.replace('data-width="90" data-width-type="percentage"', 'data-width="612" data-width-type="pixel"')
    s = s.replace('data-width="100" data-width-type="percentage"', 'data-width="100"')
    s = re.sub(r'(data-type="media" [^>]*?)></div>', r'\1 data-height="540" data-width="960"></div>', s)
    s = re.sub(r"(<th(?=[ >])[^>]*>)(.*?)</th>", r"\1<p>\2</p></th>", s)
    s = s.replace('data-type="column"', 'data-type="column" data-width="50"')
    s = re.sub(r'data-type="panel-custom" (data-icon="[^"]*") (data-color="[^"]*")',
               r'\2 data-type="panel-custom" \1 data-icon-id="1f4cc" data-icon-text="📌"', s)  # reordered too
    s = s.replace("'", "&#39;").replace("🔮", "&#x1f52e;").replace("🗺️", "🗺")
    s = re.sub(r"data-parameters=&#39;(.*?)&#39;",
               lambda m: 'data-parameters="' + html.escape(json.dumps(
                   {**json.loads(m.group(1)), "macroMetadata": {"macroId": {"value": "x"}, "schemaVersion": {"value": "1"}}}
                   if "macroParams" in m.group(1) else json.loads(m.group(1))).replace(
                   '"macroParams": {', '"macroParams": {"_parentId": {"value": "42"}, '), quote=True) + '"', s)
    s = re.sub(r'(<ol[^>]*?) start="1"', r"\1", s.replace("</p><p", "</p>\n  <p"))  # block whitespace; default start
    return s.rstrip("\n")  # the trailing newline is lost


def selftest() -> int:
    """The receipt on a temporary copy: a made-up page, manifest and receipts folder; never the real ones."""
    figure = lambda w: (f'<figure data-type="media-single" data-layout="center" data-width="{w}" data-width-type="percentage">'  # noqa: E731
                        f'<div data-type="media" data-media-type="file" data-id="m{w}" data-collection="contentId-42" '
                        f'data-alt="x{w}.gif"></div><figcaption>The owner&#39;s picture {w}</figcaption></figure>')
    sent = (banner("proposed", "🔮 The road 🗺️ and the owner's gates.", ["ARCHITECTURE.md"])
            + cols(panel("dart", "#DEEBFF", "<h3>Exit gate</h3><p>One</p>"), panel("rewind", "#FFEBE6", "<p>Two</p>"))
            + figure(90) + figure(100)
            + '<ol start="1"><li><p>First gate</p></li><li><p>Second gate</p></li></ol>'
            + table(["Phase", "Outcome"], [["<strong>PH-00</strong>", "Baseline"], ["PH-01", "Imports"], ["PH-02", "Identity"]])
            + tabs([("A", "<p>first tab</p>"), ("B", "<p>second tab</p>")])
            + macro("children", {"all": "true", "depth": "1"}) + footer() + "\n")
    faithful = _confluence_rewrites(sent)
    cases: list[tuple[str, bool, bool]] = []
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / "pages").mkdir()
        (root / "pages" / "p.html").write_text(sent)
        man = {"pages": {"p": {"id": "42", "version": 3, "sha256": hashlib.sha256(sent.encode()).hexdigest()}}}
        rdir = root / "receipts"
        reply = lambda body, v=3, pid="42": json.dumps(  # noqa: E731
            {"data": {"id": pid, "body": {"format": "html", "value": body}, "metadata": {"version": {"number": v}}}})

        def run(name: str, body: str, want: int, **kw) -> None:
            got = record_readback("p", kw.pop("raw", None) or reply(body, **kw), manifest_=man,
                                  pages_dir=root / "pages", receipts_dir=rdir)
            cases.append((name, got == want, got))

        probs = receipt_problems(man["pages"], ["p"], rdir)
        cases.append(("a published page with no receipt fails check", any("not read back" in p for p in probs), probs))
        run("a faithful read-back with every known rewrite passes", faithful, 0)
        cases.append(("... and check then passes", receipt_problems(man["pages"], ["p"], rdir) == [], None))
        run("a bare body without --version is refused", "", 2, raw=faithful)
        run("a read-back of another page is refused", faithful, 2, pid="43")
        run("a read-back of another version is refused", faithful, 2, v=2)
        run("a body cut short fails", faithful[: len(faithful) * 2 // 3], 1)
        cases.append(("... and check then fails", any("differs" in p for p in receipt_problems(man["pages"], ["p"], rdir)), None))
        tr = re.findall(r"<tr data-local-id=\"[^\"]*\"><td.*?</tr>", faithful)
        run("a missing table row fails", faithful.replace(tr[1], "", 1), 1)
        run("a changed word fails", faithful.replace("Imports", "Exports", 1), 1)
        run("a missing media node fails", re.sub(r'<div data-type="media" [^>]*></div>', "", faithful, count=1), 1)
        run("a dropped status lozenge fails", re.sub(r"<span [^>]*data-type=\"status\"[^>]*>PROPOSED</span>", "", faithful), 1)
        run("a changed macro parameter fails", faithful.replace("&quot;depth&quot;: {&quot;value&quot;: &quot;1&quot;}",
                                                                "&quot;depth&quot;: {&quot;value&quot;: &quot;2&quot;}"), 1)
        run("a renumbered list fails", faithful.replace("<ol", '<ol start="2"', 1), 1)
        run("the faithful read-back passes again", faithful, 0)
        man["pages"]["p"]["sha256"] = "0" * 64
        (root / "pages" / "p.html").write_text("changed")
        man["pages"]["p"]["sha256"] = hashlib.sha256(b"changed").hexdigest()
        man["pages"]["p"]["version"] = 4
        probs = receipt_problems(man["pages"], ["p"], rdir)
        cases.append(("a receipt for an older publish fails check", any("older publish" in p for p in probs), probs))
    fails = [c for c in cases if not c[1]]
    for name, ok, detail in cases:
        print(("ok    " if ok else "FAIL  ") + name + ("" if ok else f"  ({detail})"))
    print(f"build_pages selftest: {len(cases) - len(fails)} of {len(cases)} cases pass")
    return 1 if fails else 0


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
    elif command == "selftest":
        sys.exit(selftest())
    elif command == "set-readback" and len(sys.argv) in (4, 6):
        ver = None
        if len(sys.argv) == 6:
            if sys.argv[4] != "--version":
                sys.exit("usage: set-readback SLUG FILE [--version N]")
            ver = int(sys.argv[5])
        sys.exit(record_readback(sys.argv[2], Path(sys.argv[3]).read_text(), ver))
    else:
        sys.exit(f"unknown command {command}; see the module docstring")
