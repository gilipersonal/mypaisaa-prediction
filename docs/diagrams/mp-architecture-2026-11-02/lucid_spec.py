"""Write the Lucid Standard Import JSON for "Mypaisaa Prediction: architecture and design (MP-34)".

    python3 docs/diagrams/mp-architecture-2026-11-02/lucid_spec.py > docs/diagrams/mp-architecture-2026-11-02/spec.json

Nine pages, placed by coordinates (no assisted layout), on native AWS 2024 shapes where AWS services appear:

1 The system on AWS          4 Claude routes and batching   7 Environments and delivery
2 Who may do what            5 Importing a statement        8 Records
3 The forecast pipeline      6 Identity and step-up         9 The road

Pages 1 and 2 are the two pages of the MP-31 document (the MP-31 generator, removed in MP-34 and kept in git history; was docs/diagrams/mp-system-2026-11-02/lucid_spec.py),
regenerated with a status line. Every page states its status. Nothing on any page is deployed: only the
FastAPI health/SSE starter and CI exist. Sources: ARCHITECTURE.md, TECH-STACK.md, the ARC-06b card, the twelve
policy answers, direction-summary.md and phase-story-baseline.json (all 2 November 2026).
"""

from __future__ import annotations

import json
import re

INK, MUTED = "#17243C", "#526078"
BLUE, AMBER, TEAL, PURPLE, ROSE = "#2459B8", "#966012", "#087D78", "#6840B1", "#B23C67"
TINT = {"blue": "#E6EEFF", "amber": "#FFF1D6", "rose": "#FDE7EE", "teal": "#DCF5EF", "purple": "#EFE7FD", "plain": "#FFFFFF", "grey": "#F5F7FC"}
STROKE = {"blue": BLUE, "amber": AMBER, "rose": ROSE, "teal": TEAL, "purple": PURPLE, "plain": INK, "grey": "#A9B7CD"}
ICON = 72

OWNER_SELECTED = "Owner-selected, not deployed"


# --------------------------------------------------------------------------------------------- helpers


def text(id_: str, x: float, y: float, w: float, h: float, html: str) -> dict:
    return {"id": id_, "type": "text", "boundingBox": {"x": x, "y": y, "w": w, "h": h}, "text": html}


def label_html(name: str, role: str, align: str = "center") -> str:
    return (
        f'<p style="font-size:13px;text-align:{align}"><b>{name}</b><br>'
        f'<span style="font-size:11px;color:{MUTED}">{role}</span></p>'
    )


def box(id_: str, x: float, y: float, w: float, h: float, title: str, detail: str, tone: str,
        dashed: bool = False, size: int = 14, width: int = 2) -> dict:
    body = f'<b>{title}</b>' + (f'<br><span style="font-size:{size - 2}px;color:{MUTED}">{detail}</span>' if detail else "")
    return {
        "id": id_, "type": "rectangle", "boundingBox": {"x": x, "y": y, "w": w, "h": h},
        "style": {"fill": {"type": "color", "color": TINT[tone]},
                  "stroke": {"color": STROKE[tone], "width": width, "style": "dashed" if dashed else "solid"}},
        "text": f'<p style="font-size:{size}px;text-align:center">{body}</p>',
    }


def icon(shapes: list, id_: str, cls: str, x: float, y: float, name: str, role: str, side: str = "below",
         w: float = ICON, h: float = ICON) -> None:
    """A native AWS shape with a blank text (no catalogue name) and its own two-line label."""
    shapes.append({"id": id_, "type": "namedShape", "className": cls, "boundingBox": {"x": x, "y": y, "w": w, "h": h}, "text": " "})
    cx = x + w / 2
    if side == "below":
        shapes.append(text(f"{id_}_t", cx - 100, y + h + 6, 200, 48, label_html(name, role)))
    elif side == "above":
        shapes.append(text(f"{id_}_t", cx - 100, y - 54, 200, 48, label_html(name, role)))
    elif side == "right":
        shapes.append(text(f"{id_}_t", x + w + 14, y + h / 2 - 24, 190, 48, label_html(name, role, "left")))
    elif side == "left":
        shapes.append(text(f"{id_}_t", x - 204, y + h / 2 - 24, 190, 48, label_html(name, role, "right")))
    elif side == "name":  # a single short name under the icon
        shapes.append(text(f"{id_}_t", cx - 70, y + h + 4, 140, 26, f'<p style="font-size:12px;text-align:center"><b>{name}</b></p>'))


def nudge(shapes: list, id_: str, **bb) -> None:
    """Adjust one shape's bounding box in place (geometry fixes found by the Lucid preflight)."""
    for sh in shapes:
        if sh["id"] == id_:
            sh["boundingBox"].update(bb)
            return
    raise KeyError(id_)


def line(id_: str, a: str, pa: tuple, b: str, pb: tuple, label: str, colour: str, pos: float = 0.5,
         side: str = "top", dashed: bool = False, ends: tuple = ("none", "arrow"), width: int = 2) -> dict:
    out = {
        "id": id_, "lineType": "straight",
        "endpoint1": {"type": "shapeEndpoint", "style": ends[0], "shapeId": a, "position": {"x": pa[0], "y": pa[1]}},
        "endpoint2": {"type": "shapeEndpoint", "style": ends[1], "shapeId": b, "position": {"x": pb[0], "y": pb[1]}},
        "stroke": {"color": colour, "width": width, "style": "dashed" if dashed else "solid"},
    }
    if label:
        out["text"] = [{"text": f'<span style="font-size:11px;color:{colour}"><b>{label}</b></span>', "position": pos, "side": side}]
    return out


def header(prefix: str, right: float, title: str, subtitle: str, status: str) -> list:
    """Title, subtitle and a status pill in the top-right corner. `right` is the page's right edge."""
    return [
        text(f"{prefix}_title", 60, 34, right - 560, 48, f'<p style="font-size:28px"><b>{title}</b></p>'),
        text(f"{prefix}_sub", 60, 88, right - 560, 40, f'<p style="font-size:14px;color:{MUTED}">{subtitle}</p>'),
        {"id": f"{prefix}_status", "type": "rectangle", "boundingBox": {"x": right - 440, "y": 40, "w": 440, "h": 64},
         "style": {"fill": {"type": "color", "color": "#FFF8E8"}, "stroke": {"color": AMBER, "width": 2, "style": "solid"}},
         "text": f'<p style="font-size:14px;text-align:center"><b>STATUS</b><br>{status}</p>'},
    ]


def band(id_: str, x: float, y: float, w: float, h: float, tone: str) -> dict:
    return {"id": id_, "type": "rectangleContainer", "boundingBox": {"x": x, "y": y, "w": w, "h": h},
            "style": {"fill": {"type": "color", "color": TINT[tone] + "80"}, "stroke": {"color": STROKE[tone], "width": 1, "style": "dashed"}}}


def panel(id_: str, x: float, y: float, w: float, h: float, title: str) -> dict:
    return {"id": id_, "type": "rectangleContainer", "boundingBox": {"x": x, "y": y, "w": w, "h": h},
            "containerTitle": {"text": title},
            "style": {"fill": {"type": "color", "color": "#FAFBFE"}, "stroke": {"color": "#A9B7CD", "width": 1, "style": "solid"}}}


def note(id_: str, x: float, y: float, w: float, h: float, html: str) -> dict:
    return {"id": id_, "type": "rectangle", "boundingBox": {"x": x, "y": y, "w": w, "h": h},
            "style": {"fill": {"type": "color", "color": "#F5F7FC"}, "stroke": {"color": "#A9B7CD", "width": 1, "style": "solid"}},
            "text": f'<p style="font-size:13px;text-align:left">{html}</p>'}


def table(id_: str, x: float, y: float, w: float, h: float, rows: list, header_fill: str = "#DCE4F2",
          first_col_fill: str = "#EEF2F8", fills: dict | None = None) -> dict:
    cells = []
    for r, row in enumerate(rows):
        for c, value in enumerate(row):
            fill = header_fill if r == 0 else (first_col_fill if c == 0 else "#FFFFFF")
            if fills and (r, c) in fills:
                fill = fills[(r, c)]
            cell = {"xPosition": c, "yPosition": r, "text": value}
            if fill != "#FFFFFF":
                cell["style"] = {"fill": {"type": "color", "color": fill}}
            cells.append(cell)
    return {"id": id_, "type": "table", "boundingBox": {"x": x, "y": y, "w": w, "h": h},
            "rowCount": len(rows), "colCount": len(rows[0]), "cells": cells}


# --------------------------------------------------------------------------------------------- page 1

ICONS1 = {
    "cf": ("ArchAmazonCloudFrontAWS2024", 460, 240, "CloudFront", "serves the PWA", "below"),
    "s3w": ("ArchAmazonSimpleStorageServiceAWS2024", 700, 240, "S3 (web)", "static app files", "below"),
    "cw": ("ArchAmazonCloudWatchAWS2024", 1000, 240, "CloudWatch + X-Ray", "logs, metrics, traces", "below"),
    "ct": ("ArchAWSCloudTrailAWS2024", 1260, 240, "CloudTrail", "every AWS API call", "below"),
    "sec": ("ResAWSSystemsManagerParameterStoreAWS2024", 1500, 240, "SSM Parameter Store", "provider and Claude keys", "below"),
    "cog": ("ArchAmazonCognitoAWS2024", 460, 420, "Cognito", "Apple, Google, passkeys", "below"),
    "apigw": ("ArchAmazonAPIGatewayAWS2024", 460, 600, "API Gateway", "HTTPS and SSE", "below"),
    "api": ("ArchAWSLambdaAWS2024", 760, 600, "FastAPI on Lambda", "/api/v1 (starter runs locally)", "below"),
    "ddb": ("ArchAmazonDynamoDBAWS2024", 1460, 600, "DynamoDB", "ledger, forecasts, audit", "right"),
    "sched": ("ResAmazonEventBridgeSchedulerAWS2024", 460, 830, "EventBridge Scheduler", "daily and 30-minute jobs", "above"),
    "sqs": ("ArchAmazonSimpleQueueServiceAWS2024", 700, 830, "SQS + DLQs", "buffered, retried work", "above"),
    "dur": ("ArchAWSLambdaAWS2024", 960, 830, "Durable workflows", "Lambda Durable Functions", "above"),
    "claude": ("ArchAWSLambdaAWS2024", 1260, 830, "Claude route workers", "one Lambda per task route", "below"),
    "work": ("ArchAWSLambdaAWS2024", 700, 1060, "Data workers", "one adapter per provider", "below"),
    "s3p": ("ArchAmazonSimpleStorageServiceAWS2024", 960, 1060, "S3 (private)", "sources, artefacts, evidence", "below"),
    "sm": ("ArchAmazonSageMakerAWS2024", 1260, 1060, "SageMaker", "capped CPU training", "below"),
    "inf": ("ArchAWSLambdaAWS2024", 1460, 1060, "Inference Lambda", "approved artefacts only", "below"),
}

BOXES1 = {  # id: (x, y, w, h, title, detail, tone, dashed)
    "web": (60, 240, 220, 90, "Web app", "SvelteKit PWA", "blue", False),
    "app": (60, 560, 220, 90, "iPhone and iPad", "SwiftUI + React Native shell", "blue", False),
    "mkt": (60, 1050, 220, 90, "Market data", "Yahoo + Twelve Data Grow", "amber", True),
    "anth": (1980, 820, 220, 90, "Anthropic API", "Claude models (not Bedrock)", "rose", True),
}

LABEL_AT1 = {"l1": 0.72, "l3": 0.75, "l4": 0.75, "l17": 0.25, "l10": 0.6}  # l1/l3/l4 clear of the account border
LABEL_SIDE1 = {"l3": "middle", "l4": "middle"}  # on the line: a side label is pushed back onto the border
LINES1 = [
    ("l1", "web", (1, 0.3), "cf", (0, 0.5), "1 load", BLUE),
    ("l2", "cf", (1, 0.5), "s3w", (0, 0.5), "origin", BLUE),
    ("l3", "web", (1, 0.8), "cog", (0, 0.5), "2 sign in", ROSE),
    ("l4", "app", (1, 0.5), "apigw", (0, 0.5), "3 HTTPS, SSE", BLUE),
    ("l5", "apigw", (1, 0.5), "api", (0, 0.5), "4 invoke", BLUE),
    ("l6", "api", (1, 0.5), "ddb", (0, 0.5), "5 read the published ledger", TEAL),
    ("l7", "sched", (1, 0.5), "sqs", (0, 0.5), "6 enqueue", AMBER),
    ("l8", "sqs", (1, 0.5), "dur", (0, 0.5), "7 start", AMBER),
    ("l9", "dur", (1, 0.5), "claude", (0, 0.5), "8 extract, explain", ROSE),
    ("l10", "claude", (1, 0.5), "anth", (0, 0.5), "9 bounded calls, capped spend", ROSE),
    ("l11", "sqs", (0.5, 1), "work", (0.5, 0), "10 fetch", AMBER),
    ("l12", "work", (0, 0.5), "mkt", (1, 0.5), "rights-checked pulls", AMBER),
    ("l13", "work", (1, 0.5), "s3p", (0, 0.5), "prices", AMBER),
    ("l14", "dur", (0.5, 1), "s3p", (0.5, 0), "11 evidence", AMBER),
    ("l15", "dur", (1, 1), "sm", (0, 0), "12 train", PURPLE),
    ("l16", "sm", (1, 0.5), "inf", (0, 0.5), "approved", PURPLE),
    ("l17", "inf", (0.5, 0), "ddb", (0.5, 1), "13 store forecasts", PURPLE),
    ("l18", "dur", (1, 0.25), "ddb", (0, 1), "14 commit after approval", TEAL),
]


def page_system() -> dict:
    shapes = header("p1", 2220, "Mypaisaa Prediction: the system on AWS",
                    "Owner-selected directions ARC-01 to ARC-12, 2 November 2026. Proposed topology: only the FastAPI health "
                    "and SSE starter runs, on a laptop. Numbers follow the flows.", OWNER_SELECTED)
    shapes += [
        {"id": "cloud", "type": "namedContainer", "className": "AWSCloudAWS2024", "boundingBox": {"x": 340, "y": 150, "w": 1580, "h": 1150}, "text": "AWS Cloud"},
        {"id": "acct", "type": "namedContainer", "className": "AWSAccountAWS2024", "boundingBox": {"x": 370, "y": 190, "w": 1520, "h": 1090},
         "text": "Workload account: prod. Dev is a separate account of the same shape (ARC-11)"},
    ]
    for id_, (x, y, w, h, title, detail, tone, dashed) in BOXES1.items():
        shapes.append(box(id_, x, y, w, h, title, detail, tone, dashed, size=15))
    shapes.append(text("outside", 60, 180, 220, 30, f'<p style="font-size:12px;color:{MUTED}"><b>OUTSIDE AWS</b></p>'))
    for id_, (cls, x, y, name, role, side) in ICONS1.items():
        icon(shapes, id_, cls, x, y, name, role, side)
    shapes.append(note("legend", 340, 1330, 1580, 96,
                       '<b>Status.</b> Every service is Owner-selected, not built or deployed; only the FastAPI health and SSE starter '
                       'runs, on a laptop. <b>Guardrails.</b> Claude workers read through allowlisted tools and cannot write the ledger, '
                       'publish a forecast, promote a model or trade. One controlled writer commits to DynamoDB, and only after the owner '
                       'approves the exact change. Forecasts are frozen at the data cutoff and scored only after their horizon. '
                       '<b>Colours:</b> blue serve and ask, amber data and work, rose Claude, purple models, teal records.'))
    lines = [line(i, a, pa, b, pb, lab, col, LABEL_AT1.get(i, 0.5), LABEL_SIDE1.get(i, "top")) for i, a, pa, b, pb, lab, col in LINES1]
    return {"id": "system", "title": "1 The system on AWS", "shapes": shapes, "lines": lines}


# --------------------------------------------------------------------------------------------- page 2

AUTHORITY = [
    ["", "Read evidence", "Propose", "Write the ledger", "Publish a forecast", "Promote a model", "Trade"],
    ["Claude route workers", "allowlisted, read-only tools", "drafts, extractions, explanations", "no", "no", "no", "no"],
    ["Forecast models", "point-in-time data only", "forecasts and challengers", "no", "only through the workflow, frozen at cutoff", "no", "no"],
    ["Durable workflows", "yes", "import proposals", "through the controlled writer, after approval", "issue the daily forecast", "no", "no"],
    ["Controlled writer", "the approved change", "no", "yes: the only writer", "no", "no", "no"],
    ["Owner (you)", "everything", "corrections", "approves each exact commit", "no", "approves, with evidence", "no: MP has no broker access"],
]


def page_authority() -> dict:
    fills = {(r, c): "#FDE7EE" for r, row in enumerate(AUTHORITY) for c, v in enumerate(row) if r and c and v.startswith("no")}
    shapes = header("p2", 1880, "Who may do what",
                    "Authority is enforced in code, not asked of a prompt. Rose cells are refusals. "
                    "From AGENTS.md and ARC-02, ARC-05, ARC-06 and ARC-08.", "PROPOSED, enforced in code once built")
    shapes.append(table("matrix", 60, 170, 1820, 480, AUTHORITY, fills=fills))
    return {"id": "authority", "title": "2 Who may do what", "shapes": shapes, "lines": []}


# --------------------------------------------------------------------------------------------- page 3

C3 = {1: 450, 2: 730, 3: 1010, 4: 1290, 5: 1570, 6: 1850, 7: 2130}


def page_forecast() -> dict:
    s = header("p3", 2400, "The forecast pipeline",
               "ARC-04 and ARC-05 with policies 002, 003 and 008. Each target, horizon, currency and market kind is its own task. "
               "Never a random split. Numbers follow the flow.", OWNER_SELECTED)
    ay, by, cy = 160, 490, 820  # band tops
    s += [band("bandA", 60, ay, 2340, 300, "amber"), band("bandB", 60, by, 2340, 300, "purple"), band("bandC", 60, cy, 2340, 280, "teal")]
    s += [
        text("bandA_t", 80, ay + 20, 210, 110, f'<p style="font-size:16px;color:{AMBER}"><b>Every trading day</b><br><span style="font-size:12px;color:{MUTED}">the daily path, from the market close</span></p>'),
        text("bandB_t", 80, by + 20, 210, 130, f'<p style="font-size:16px;color:{PURPLE}"><b>Training</b><br><span style="font-size:12px;color:{MUTED}">at most two campaigns a month; 96 fits and 6 instance-hours each</span></p>'),
        text("bandC_t", 80, cy + 20, 210, 110, f'<p style="font-size:16px;color:{TEAL}"><b>After the horizon</b><br><span style="font-size:12px;color:{MUTED}">grade, never rewrite</span></p>'),
    ]
    a_iy, b_iy, c_iy = ay + 100, by + 100, cy + 100
    # row A
    s.append(box("mkt", C3[1] - 100, a_iy - 10, 200, 92, "Market data", "Yahoo + Twelve Data Grow, outside AWS", "amber", dashed=True, size=14))
    icon(s, "work", "ArchAWSLambdaAWS2024", C3[2] - 36, a_iy, "Data workers", "rights and freshness checks", "below")
    icon(s, "s3", "ArchAmazonSimpleStorageServiceAWS2024", C3[3] - 36, a_iy, "S3 (private)", "stamped observations, history", "above")
    icon(s, "dur", "ArchAWSLambdaAWS2024", C3[4] - 36, a_iy, "Durable workflow", "freezes the data cutoff", "below")
    s.append(box("feat", C3[5] - 100, a_iy - 10, 200, 92, "Feature set", "versioned, point-in-time, data cutoff stamped", "amber", size=14))
    icon(s, "inf", "ArchAWSLambdaAWS2024", C3[6] - 36, a_iy, "Inference Lambda", "approved artefact only", "above")
    icon(s, "ddb", "ArchAmazonDynamoDBAWS2024", C3[7] - 36, a_iy, "DynamoDB", "forecasts, append-only", "right")
    nudge(s, "s3_t", y=a_iy - 68)   # lift clear of the f2/f3 labels
    nudge(s, "inf_t", y=a_iy - 68)  # lift clear of the f5/f6 labels
    # row B
    s.append({"id": "train", "type": "namedShape", "className": "ResAmazonSageMakerTrainAWS2024",
              "boundingBox": {"x": C3[3] - 36, "y": b_iy + 6, "w": 72, "h": 60}, "text": " "})
    s.append(text("train_t", C3[3] - 130, b_iy + 72, 260, 86, label_html("SageMaker training", "walk-forward folds, purge and embargo; capped CPU jobs")))
    s.append(box("reg", C3[4] - 100, b_iy - 10, 200, 92, "Model registry", "artefact hash, folds, metrics, calibration", "purple", size=14))
    s.append(box("shadow", C3[5] - 100, b_iy - 10, 200, 92, "Shadow", "runs beside the live model; never published", "purple", size=14))
    s.append(box("promote", C3[6] - 100, b_iy - 10, 200, 92, "Owner promotion", "you approve, with the evidence", "blue", size=14, width=3))
    # row C
    icon(s, "score", "ArchAWSLambdaAWS2024", C3[7] - 36, c_iy, "Outcome scoring", "a new outcome record", "below")
    s.append(box("calib", C3[6] - 100, c_iy - 10, 200, 92, "Calibration and scores", "hit rate, calibration, error, coverage, turnover, benchmark", "purple", size=13))
    s.append(box("pause", C3[4] - 100, c_iy - 10, 200, 92, "Safety pause", "pauses the affected scope and tells you; restart needs your yes", "plain", size=13))

    # bottom panels
    py = 1170
    s.append(panel("ladder", 60, py, 920, 540, "The model ladder: each rung must pass before the next"))
    rungs = [("r0", "R0 baselines", "rules, zero return, trailing events, empirical distributions"),
             ("r1", "R1 regularised", "ridge for returns, logistic for events; fold-local transforms, matured labels"),
             ("r2", "R2 challengers", "histogram gradient boosting: return, quantile, event; must beat the baseline")]
    for i, (rid, title, detail) in enumerate(rungs):
        s.append(box(rid, 90 + i * 300, py + 120, 240, 140, title, detail, "purple", size=14))
    s.append(text("ladder_n", 90, py + 430, 860, 60, f'<p style="font-size:12px;color:{MUTED}">Walk-forward folds with a purge and embargo sized to the horizon. Every transform, imputer and calibrator is fitted inside its training fold. A challenger goes to shadow, then to you.</p>'))
    s.append(panel("hor", 1020, py, 640, 540, "Horizons: each its own task"))
    s.append(table("hor_t", 1040, py + 30, 600, 490, [  # rows tall enough for the 4-line scenarios cell
        ["Task", "Horizon"],
        ["Next day", "1 trading day"],
        ["Short", "5, 10 and 20 trading days"],
        ["Months", "3, 6 and 12 calendar months"],
        ["Scenarios (separate)", "3 and 5 years: downside, central, upside templates with editable assumptions; no likelihood claimed"],
    ], header_fill="#EFE7FD"))
    s.append(panel("win", 1700, py, 700, 540, "The daily window (policy 002, to be proven on real sources)"))
    marks = [("Close", "market close", "plain"), ("+15", "collection starts", "amber"),
             ("+40", "retry for missing data starts", "amber"), ("+60", "cutoff freezes", "purple"),
             ("+75", "forecasts issued by now", "teal")]
    for i, (mark, words, tone) in enumerate(marks):
        cx = 1760 + i * 140
        s.append({"id": f"w{i}", "type": "circle", "boundingBox": {"x": cx - 40, "y": py + 120, "w": 80, "h": 80},
                  "style": {"fill": {"type": "color", "color": TINT[tone]}, "stroke": {"color": STROKE[tone], "width": 2, "style": "solid"}},
                  "text": f'<p style="font-size:16px;text-align:center"><b>{mark}</b></p>'})
        s.append(text(f"w{i}_t", cx - 48, py + 208, 96, 70, f'<p style="font-size:12px;text-align:center">{words}</p>'))
    s.append(text("win_n", 1720, py + 426, 660, 80, f'<p style="font-size:12px;color:{MUTED}">Minutes after each eligible exchange close, issued strictly before the next session opens. If data or processing misses the cutoff, abstain: never move the cutoff or backdate ingestion. Quote and risk checks every 30 minutes are separate and never issue a forecast.</p>'))

    L = [
        line("f1", "mkt", (1, 0.5), "work", (0, 0.5), "1 pull", AMBER),
        line("f2", "work", (1, 0.5), "s3", (0, 0.5), "2 stamp, check", AMBER),
        line("f3", "s3", (1, 0.5), "dur", (0, 0.5), "3 freeze at +60", AMBER),
        line("f4", "dur", (1, 0.5), "feat", (0, 0.5), "4 build", AMBER),
        line("f5", "feat", (1, 0.5), "inf", (0, 0.5), "5 inputs", PURPLE),
        line("f6", "inf", (1, 0.5), "ddb", (0, 0.5), "6 issue by +75", PURPLE),
        line("f7", "s3", (0.5, 1), "train", (0.5, 0), "7 history, matured labels", PURPLE, pos=0.35),
        line("f8", "train", (1, 0.5), "reg", (0, 0.5), "8 runs", PURPLE),
        line("f9", "reg", (1, 0.5), "shadow", (0, 0.5), "9", PURPLE),
        line("f10", "shadow", (1, 0.5), "promote", (0, 0.5), "10", BLUE),
        line("f11", "promote", (0.5, 0), "inf", (0.5, 1), "11 approved artefact", BLUE, pos=0.2),
        line("f12", "ddb", (0.5, 1), "score", (0.5, 0), "12 horizon elapsed", TEAL, pos=0.55),
        line("f13", "calib", (1, 0.5), "score", (0, 0.5), "13 score", TEAL, ends=("arrow", "none")),  # drawn left to right so the label sits above
        line("f14", "calib", (0.5, 0), "promote", (0.5, 1), "14 evidence", BLUE, pos=0.25),
        line("f15", "calib", (0, 0.5), "pause", (1, 0.5), "15 approved trigger fires", INK),
        line("lr1", "r0", (1, 0.5), "r1", (0, 0.5), "", PURPLE),
        line("lr2", "r1", (1, 0.5), "r2", (0, 0.5), "", PURPLE),
    ]
    L += [line(f"wl{i}", f"w{i}", (1, 0.5), f"w{i + 1}", (0, 0.5), "", MUTED) for i in range(4)]
    return {"id": "forecast", "title": "3 The forecast pipeline", "shapes": s, "lines": L}


# --------------------------------------------------------------------------------------------- page 4


def page_claude() -> dict:
    s = header("p4", 2240, "Claude routes and the batch lane (ARC-06b)",
               "Owner-selected 2 November 2026: option A, all routes. Haiku 5.5 reads everything, Opus 5.5 reads the few events "
               "that matter, Sonnet 5.5 answers. The worker split shown is Proposed.", "Owner-selected, not deployed; zero calls today")
    s.append({"id": "cloud", "type": "namedContainer", "className": "AWSCloudAWS2024", "boundingBox": {"x": 330, "y": 170, "w": 1470, "h": 1010},
              "text": "AWS Cloud: prod account (dev has the same shape)"})
    c1, c2, c5 = 460, 740, 1620
    icon(s, "sched", "ResAmazonEventBridgeSchedulerAWS2024", c2 - 36, 220, "EventBridge Scheduler", "starts the overnight batch", "right")
    icon(s, "s3", "ArchAmazonSimpleStorageServiceAWS2024", c1 - 36, 400, "S3 (private)", "news, filings, calendar items", "below")
    icon(s, "submit", "ArchAWSLambdaAWS2024", c2 - 36, 400, "Batch submit worker", "reserves the batch's maximum cost", "below")
    s.append(box("runner", 940, 360, 200, 540, "Shared bounded runner",
                 "CREDIT GATE: zero calls until the shared credit is verified; no paid fallback.<br><br>Per-call budgets for time, "
                 "tokens and steps. Allowlisted, read-only tools. 5-minute prompt caching. Model IDs pinned per environment.", "rose", size=14, width=3))
    icon(s, "api", "ArchAWSLambdaAWS2024", c1 - 36, 804, "FastAPI on Lambda", "behind API Gateway", "below")
    icon(s, "live", "ArchAWSLambdaAWS2024", c2 - 36, 804, "Live route workers", "chat, explanations, briefing, extraction", "above")
    icon(s, "ddb", "ArchAmazonDynamoDBAWS2024", c2 - 36, 1000, "DynamoDB", "versioned tool results, analyses", "below")
    icon(s, "collect", "ArchAWSLambdaAWS2024", c5 - 36, 1000, "Batch results worker", "matches results by custom_id", "below")
    nudge(s, "sched_t", w=230)
    nudge(s, "submit_t", x=c2 - 120, w=240)
    nudge(s, "live_t", x=c2 - 130, y=740, w=260)  # wider, and lifted clear of the c8/c10 labels
    nudge(s, "collect_t", x=c5 - 120, w=240)
    s.append(box("you", 60, 795, 200, 90, "You", "web, iPhone or iPad", "blue", size=15))
    s.append(text("anth_t", 1900, 250, 300, 50, f'<p style="font-size:12px;color:{MUTED}"><b>OUTSIDE AWS</b><br>Anthropic API, not Bedrock</p>'))
    s.append(box("batch", 1900, 360, 300, 160, "Message Batches API", "half price on every token; most finish within an hour, 24 hours at most; results kept 29 days", "rose", dashed=True, size=14))
    s.append(box("msgs", 1900, 770, 300, 140, "Messages API (live)", "for anything a person is waiting for", "rose", dashed=True, size=14))

    s.append(table("routes", 60, 1230, 2180, 640, [  # 80 px rows: the Rule cells wrap to two lines
        ["Route", "Model", "Lane", "Rule"],
        ["Triage of news, filings and calendar items", "Haiku 5.5", "Batch, overnight", "Hundreds of items a day; code scores relevance"],
        ["Event analysis", "Opus 5.5", "Batch, overnight", "At most 3 a day in prod, 10 a month in dev, picked by code; stays only if it beats Sonnet"],
        ["Structured factors (model inputs)", "Haiku 5.5", "Batch", "Frozen by the last batch before +75; enter a forecast only if they add accuracy"],
        ["Statement and screenshot extraction", "Haiku 5.5", "Live", "No tools, no write authority; the result is only a draft"],
        ["Explanations and the 07:30 briefing", "Sonnet 5.5", "Live", "Never depends on a newly submitted batch"],
        ["Chat: ask why", "Sonnet 5.5", "Live", "Read-only tools; quotes a stored event analysis instead of redoing it"],
        ["Evaluation grading", "Sonnet 5.5", "Batch", "Inspect AI; each route passes its suite before it is switched on"],
    ], fills={(2, 1): "#FDE7EE", (2, 2): "#FFF1D6", (1, 2): "#FFF1D6", (3, 2): "#FFF1D6", (7, 2): "#FFF1D6",
              (4, 2): "#E6EEFF", (5, 2): "#E6EEFF", (6, 2): "#E6EEFF"}))
    s.append(note("rules", 60, 1920, 2180, 100,
                  '<b>Rules.</b> Every figure Claude uses comes from a versioned tool result. Claude never produces a forecast number, '
                  'writes the ledger, promotes a model or trades. An expired or failed batch request leaves the last dated evidence in '
                  'place, marks the update pending and never falls back to a paid live call. <b>Lanes:</b> amber cells batch '
                  '(can wait), blue cells live (someone is waiting).'))
    rp = lambda y: (y - 360) / 540  # noqa: E731  runner attachment height
    L = [
        line("c1", "sched", (0.5, 1), "submit", (0.5, 0), "1 overnight", AMBER),
        line("c2", "s3", (1, 0.5), "submit", (0, 0.5), "2 items, inputs", AMBER),
        line("c3", "submit", (1, 0.5), "runner", (0, rp(436)), "3 batch", AMBER),
        line("c4", "runner", (1, rp(440)), "batch", (0, 0.5), "4 submit at half price", ROSE),
        line("c5", "batch", (0.2, 1), "collect", (0.5, 0), "5 results by custom_id", ROSE, pos=0.8),
        line("c6", "collect", (0, 0.5), "ddb", (1, 0.5), "6 store analyses and factors, versioned", TEAL),
        line("c7", "you", (1, 0.5), "api", (0, 0.5), "7 ask why", BLUE, pos=0.72),
        line("c8", "api", (1, 0.5), "live", (0, 0.5), "8 route", BLUE),
        line("c9", "live", (0.5, 1), "ddb", (0.5, 0), "9 read-only tools", TEAL),
        line("c10", "live", (1, 0.5), "runner", (0, rp(840)), "10 live call", BLUE),
        line("c11", "runner", (1, rp(840)), "msgs", (0, 0.5), "11 Sonnet or Haiku, live", ROSE, pos=0.3),
    ]
    return {"id": "claude", "title": "4 Claude routes and batching", "shapes": s, "lines": L}


# --------------------------------------------------------------------------------------------- page 5

LANES5 = [("Owner (you)", "blue"), ("App", "blue"), ("API", "blue"), ("S3 quarantine (private)", "amber"),
          ("Durable workflow", "amber"), ("Claude extraction, no tools", "rose"), ("Controlled writer", "teal"), ("DynamoDB", "teal")]
STEPS5 = [  # (lane, title, detail)
    (0, "1 Choose a statement", "CSV, Excel, PDF, screenshot or manual"),
    (1, "2 Upload", "signed-in session"),
    (2, "3 Admit", "owner, size and type checked"),
    (3, "4 Quarantine", "versioned object and hash; untrusted"),
    (4, "5 Start the import", "durable; survives restarts"),
    (5, "6 Extract", "Haiku 5.5; draft rows with page and row evidence"),
    (4, "7 Validate and propose", "reconcile, find duplicates, form complete groups"),
    (1, "8 Preview", "exact proposal: included and excluded entries"),
    (0, "9 Approve groups", "fresh sign-in; exact content and hash"),
    (6, "10 Start the commit", "within 15 min; rechecks hash, version, expiry"),
    (7, "11 Commit and audit", "new ledger version; idempotent; approval kept"),
    (1, "12 Re-read", "SSE notice, then a fresh read"),
]


def page_import() -> dict:
    W = 2760
    s = header("p5", W, "Importing a statement",
               "ARC-02 and ARC-03 with policies 001, 005 and 007. An extraction is a draft until you approve the exact change; "
               "one controlled writer commits it. Steps are numbered in time order.", OWNER_SELECTED)
    lane_h, head, top, bw, bh, step = 150, 210, 270, 150, 104, 195
    x0 = 60 + head + 30
    s.append({"id": "pool", "type": "swimLanes", "boundingBox": {"x": 60, "y": top, "w": W - 60, "h": lane_h * len(LANES5)},
              "vertical": False, "titleBar": {"height": head, "verticalText": False},
              "lanes": [{"title": t, "width": lane_h, "headerFill": TINT[tone], "laneFill": "#FBFCFE"} for t, tone in LANES5]})
    for i, (lane, title, detail) in enumerate(STEPS5):
        tone = LANES5[lane][1]
        s.append(box(f"s{i + 1}", x0 + i * step, top + lane * lane_h + (lane_h - bh) / 2, bw, bh, title, detail, tone, size=13,
                     width=3 if i in (8, 9) else 2))
    # unresolved entries: in the workflow lane, column 8
    s.append(box("pending", x0 + 7 * step, top + 4 * lane_h + (lane_h - bh) / 2, bw, bh, "Unresolved entries",
                 "stay pending and visible; never dropped", "amber", dashed=True, size=13))
    # the 15-minute window, above the pool, from step 9 to step 10
    wx = x0 + 8 * step
    s.append({"id": "window", "type": "rectangle", "boundingBox": {"x": wx, "y": 170, "w": step + bw, "h": 70},
              "style": {"fill": {"type": "color", "color": "#FFF8E8"}, "stroke": {"color": AMBER, "width": 3, "style": "solid"}},
              "text": f'<p style="font-size:15px;text-align:center"><b>15-minute window</b><br><span style="font-size:12px;color:{MUTED}">from approval to the start of the commit</span></p>'})
    s.append(text("window_n", 60, 1500, W - 60, 60,
                  '<p style="font-size:13px"><b>Rules.</b> A changed subset or changed content needs a fresh proposal and a fresh approval; an expired '
                  'approval must be renewed before the commit starts. Dependent entries (cash, fees) stay together in their group. Holdings count from the trade date, '
                  'with settlement tracked separately. S3 and DynamoDB share no transaction, so the commit is idempotent and resumable.</p>'))
    colour = {0: BLUE, 1: BLUE, 2: BLUE, 3: AMBER, 4: AMBER, 5: ROSE, 6: TEAL, 7: TEAL}
    L = []
    for i in range(len(STEPS5) - 1):
        L.append(line(f"q{i + 1}", f"s{i + 1}", (1, 0.5), f"s{i + 2}", (0, 0.5), "", colour[STEPS5[i + 1][0]]))
    L.append(line("qp", "s7", (1, 0.5), "pending", (0, 0.5), "", AMBER, dashed=True))
    return {"id": "import", "title": "5 Importing a statement", "shapes": s, "lines": L}


# --------------------------------------------------------------------------------------------- page 6


def page_identity() -> dict:
    W = 2120
    s = header("p6", W, "Identity and step-up (ARC-07)",
               "Cognito with Apple, Google and passkeys, verified owner linking and two recovery paths. Sensitive actions need a "
               "fresh, strong sign-in. No exact time window or assurance level is approved yet.", OWNER_SELECTED)
    s.append(box("you", 60, 255, 200, 90, "You", "the owner", "blue", size=15))
    s.append(box("app", 370, 255, 220, 90, "Web app or iPhone, iPad", "keeps the session", "blue", size=14))
    icon(s, "cog", "ArchAmazonCognitoAWS2024", 784, 264, "Cognito user pool", "Apple, Google, passkeys; verified linking", "below")
    nudge(s, "cog_t", x=722, y=346, w=220, h=60)  # clear of the i3 label
    s.append(panel("rec", 1000, 200, 1060, 200, "Recovery: two independent paths"))
    s.append(box("p1", 1040, 255, 260, 90, "Path 1", "a passkey", "blue", size=14))
    s.append(box("p2", 1380, 255, 260, 90, "Path 2", "an independent second passkey", "blue", size=14))
    s.append(text("p3", 1720, 262, 300, 76, '<p style="font-size:13px">plus verified Apple and Google links to the same owner</p>'))
    icon(s, "apigw", "ArchAmazonAPIGatewayAWS2024", 444, 584, "API Gateway", "authorizer checks the session", "below")
    icon(s, "fast", "ArchAWSLambdaAWS2024", 784, 584, "FastAPI on Lambda", "checks strength and freshness", "above")
    icon(s, "ddb", "ArchAmazonDynamoDBAWS2024", 1464, 584, "DynamoDB", "ledger and audit", "right")
    nudge(s, "fast_t", y=520)  # lifted clear of the i5 label
    s.append({"id": "dec", "type": "diamond", "boundingBox": {"x": 720, "y": 850, "w": 200, "h": 140},
              "style": {"fill": {"type": "color", "color": "#FFF8E8"}, "stroke": {"color": AMBER, "width": 2, "style": "solid"}},
              "text": '<p style="font-size:13px;text-align:center"><b>Strong and fresh enough for this action?</b></p>'})
    s.append(box("step", 60, 875, 200, 90, "Fresh, strong sign-in", "Face ID unlock or an open app is not enough", "rose", size=14))
    s.append(box("appr", 1040, 875, 240, 90, "Approval bound to the action", "owner, environment, action, payload, version, expiry", "teal", size=14))
    icon(s, "writer", "ArchAWSLambdaAWS2024", 1464, 884, "Controlled writer", "rechecks at execution", "below")
    s.append(box("refuse", 720, 1100, 200, 90, "Refused", "no proof possible: fails closed", "plain", size=14))
    s.append(note("keep", 1700, 860, 380, 130,
                  '<b>Kept in workflow and audit state:</b> opaque evidence references only, never live tokens. Authority is rechecked '
                  'at execution, even after a durable wait.'))
    L = [
        line("i1", "you", (1, 0.5), "app", (0, 0.5), "1 open", BLUE),
        line("i2", "app", (1, 0.3), "cog", (0, 0.3), "2 sign in", ROSE, pos=0.35, side="bottom"),  # above the line
        line("i3", "app", (1, 0.75), "cog", (0, 0.75), "3 session", ROSE, pos=0.35, side="top", ends=("arrow", "none")),  # below the line
        line("i4", "app", (0.5, 1), "apigw", (0.5, 0), "4 request + session", BLUE),
        line("i5", "apigw", (1, 0.5), "fast", (0, 0.5), "5 authorised", BLUE),
        line("i6", "fast", (1, 0.5), "ddb", (0, 0.5), "6 ordinary reads", TEAL),
        line("i7", "fast", (0.5, 1), "dec", (0.5, 0), "7 sensitive action", AMBER),
        line("i8", "dec", (0, 0.5), "step", (1, 0.5), "8 no: step up", ROSE),
        line("i9", "step", (0.5, 0), "you", (0.5, 1), "9 sign in again", ROSE),
        line("i10", "dec", (1, 0.5), "appr", (0, 0.5), "10 yes", TEAL),
        line("i11", "appr", (1, 0.5), "writer", (0, 0.5), "11 approved", TEAL),
        line("i12", "writer", (0.5, 0), "ddb", (0.5, 1), "12 recheck, commit", TEAL),
        line("i13", "dec", (0.5, 1), "refuse", (0.5, 0), "", INK),
        line("ir", "cog", (1, 0.5), "p1", (0, 0.5), "if access is lost", BLUE, dashed=True),
    ]
    return {"id": "identity", "title": "6 Identity and step-up", "shapes": s, "lines": L}


# --------------------------------------------------------------------------------------------- page 7

ACCOUNT_ICONS = [("ArchAmazonCloudFrontAWS2024", "CloudFront"), ("ArchAmazonCognitoAWS2024", "Cognito"),
                 ("ArchAmazonAPIGatewayAWS2024", "API Gateway"), ("ArchAWSLambdaAWS2024", "Lambda"),
                 ("ArchAmazonDynamoDBAWS2024", "DynamoDB"), ("ArchAmazonSimpleStorageServiceAWS2024", "S3"),
                 ("ArchAmazonSageMakerAWS2024", "SageMaker"), ("ResAmazonEventBridgeSchedulerAWS2024", "Scheduler")]


def page_delivery() -> dict:
    W = 2010
    s = header("p7", W, "Environments and delivery (ARC-11)",
               "Work moves on MP-&lt;n&gt; branches through pull requests to main. Infrastructure as code is plan-only here. "
               "Two AWS accounts of the same shape; nothing is deployed in either.", "CI implemented; AWS Owner-selected, nothing deployed")
    s.append(text("outside", 60, 150, 600, 30, f'<p style="font-size:12px;color:{MUTED}"><b>OUTSIDE AWS: Jira and GitHub</b> (implemented)</p>'))
    s.append(box("jira", 60, 280, 210, 100, "Jira MP-&lt;n&gt;", "story with acceptance criteria", "blue", size=14))
    s.append(box("branch", 390, 280, 210, 100, "Branch", "MP-&lt;n&gt;-slug; commits MP-&lt;n&gt;: subject", "blue", size=14))
    s.append(box("pr", 720, 280, 210, 100, "Pull request to main", "[MP-&lt;n&gt;] title", "blue", size=14))
    s.append(table("ci", 1140, 190, 480, 380, [
        ["GitHub Actions check", "Workflow"],
        ["Backend", "CI"], ["Docs", "CI"], ["Review tooling", "CI"], ["Agent config", "CI"],
        ["Static preview", "CI"], ["Workflow lint", "CI"], ["Jira traceability", "Jira key"],
    ], header_fill="#DCF5EF", first_col_fill="#FFFFFF"))
    s.append(box("main", 1770, 280, 210, 100, "main", "merged only when the owner asks", "teal", size=15, width=3))
    s.append(box("iac", 1770, 640, 210, 130, "Infrastructure as code", "Terraform only (owner, 3 Nov 2026); plan only; never applied from here", "amber", dashed=True, size=13))
    s.append({"id": "cloud", "type": "namedContainer", "className": "AWSCloudAWS2024", "boundingBox": {"x": 60, "y": 850, "w": 1950, "h": 580},
              "text": "AWS: two workload accounts under consolidated billing (Owner-selected; accounts not yet inspected)"})
    for acct, ax, words in (("dev", 100, "dev account: synthetic data, tests and CI. Nothing deployed"),
                            ("prod", 1090, "prod account: your data. Nothing deployed")):
        s.append({"id": acct, "type": "namedContainer", "className": "AWSAccountAWS2024", "boundingBox": {"x": ax, "y": 910, "w": 880, "h": 480}, "text": words})
        for k, (cls, name) in enumerate(ACCOUNT_ICONS):
            row, col = divmod(k, 4)
            icon(s, f"{acct}{k}", cls, ax + 140 + col * 200 - 36, 1000 + row * 200, name, "", "name")
    s.append(note("rules", 60, 1470, 1950, 110,
                  '<b>Separation.</b> Dev agents, synthetic imports, tests and CI have no routine write access to prod; each account has its '
                  'own identities, deployment roles and write authority. <b>Cost.</b> £100 a month all-in across both accounts, market data '
                  'and Claude: £70 of operation and a £30 reserve; warn at £60, reduce optional work at £75, pause it at £85. '
                  '<b>Region.</b> Virginia (us-east-1), owner-selected 2 November 2026.'))
    L = [
        line("d1", "jira", (1, 0.5), "branch", (0, 0.5), "1 branch", BLUE),
        line("d2", "branch", (1, 0.5), "pr", (0, 0.5), "2 push", BLUE),
        line("d3", "pr", (1, 0.5), "ci", (0, (330 - 190) / 380), "3 run 7 checks", TEAL),
        line("d4", "ci", (1, (330 - 190) / 380), "main", (0, 0.5), "4 merge", TEAL),
        line("d5", "main", (0.5, 1), "iac", (0.5, 0), "5 plan", AMBER),
        line("d6", "iac", (0.2, 1), "dev", (0.95, 0), "6 plan only (dev)", AMBER, pos=0.3, dashed=True),
        line("d7", "iac", (0.6, 1), "prod", (0.7, 0), "7 plan only (prod)", AMBER, dashed=True),
    ]
    return {"id": "delivery", "title": "7 Environments and delivery", "shapes": s, "lines": L}


# --------------------------------------------------------------------------------------------- page 8

ENTITIES = {  # id: (title, tone, fields, col, row)
    "imp": ("Import", "teal", ["PK import_id", "object_version, object_hash", "row or page evidence", "extractor_version",
                                "preview_hash", "FK approval_id", "commit or reversal"], 0, 0),
    "txn": ("Transaction", "teal", ["PK transaction_id (immutable)", "account", "FK import_id", "FK instrument_id",
                                     "quantity, price, fees, currency", "trade_date, settlement_date", "source"], 1, 0),
    "ins": ("Instrument", "amber", ["PK instrument_id", "asset_class", "provider_symbols", "exchange, currency", "active"], 2, 0),
    "obs": ("Market observation", "amber", ["PK observation_id", "FK instrument_id", "provider", "source_time, received_time",
                                             "interval, values", "quality_flags"], 3, 0),
    "job": ("Job, audit and approval", "plain", ["PK run_id", "owner, environment", "attempts, terminal_state", "versions",
                                                  "approval_evidence (opaque refs)"], 0, 1),
    "out": ("Outcome", "purple", ["PK outcome_id", "FK prediction_id", "realised_value, realised_time", "scoring_method",
                                  "metrics", "version"], 1, 1),
    "pred": ("Prediction", "purple", ["PK prediction_id", "FK model_run_id", "FK instrument_id", "as_of, data_cutoff",
                                      "target, horizon", "distribution or probability", "calibration", "explanation_refs", "version"], 2, 1),
    "feat": ("Feature set", "purple", ["PK feature_set_id", "version", "data_cutoff", "definition_hash", "universe", "storage_ref (S3)"], 3, 1),
    "cost": ("Cost record", "plain", ["PK request_id", "FK run_id", "environment, feature, model", "reserved, actual spend",
                                      "price and FX version", "reconciliation"], 0, 2),
    "res": ("Research item", "rose", ["PK research_id", "source, publisher, date", "retrieval_time", "claims, citations", "FK agent_run_id"], 1, 2),
    "evt": ("Event analysis", "rose", ["PK analysis_id", "event, instrument_ids", "what changed vs prior evidence", "likely effect and horizon",
                                       "uncertainty, invalidation", "citations, model, version"], 2, 2),
    "run": ("Model run", "purple", ["PK model_run_id", "FK feature_set_id", "training_cutoff, folds", "parameters, metrics",
                                    "calibration", "artefact_hash"], 3, 2),
}


def page_records() -> dict:
    W = 2020
    s = header("p8", W, "Records: the core data model",
               "Every record carries its source, timestamps and a version. Append-only: a correction is a new version and an outcome "
               "is a new record. DynamoDB keys and indexes are not chosen; these are logical records.", "PROPOSED")
    cw, gap_x, gap_y, top = 380, 150, 130, 190
    row_h = [0, 0, 0]
    for title, tone, fields, col, row in ENTITIES.values():
        row_h[row] = max(row_h[row], 140 + 22 * len(fields))  # Lucid renders about this tall
    row_y = [top, top + row_h[0] + gap_y, top + row_h[0] + row_h[1] + 2 * gap_y]
    for id_, (title, tone, fields, col, row) in ENTITIES.items():
        s.append({"id": id_, "type": "umlClass", "boundingBox": {"x": 60 + col * (cw + gap_x), "y": row_y[row], "w": cw, "h": row_h[row]},
                  "title": title, "properties": fields, "methods": [], "propertiesHeight": 1,
                  "style": {"fill": {"type": "color", "color": TINT[tone]}, "stroke": {"color": STROKE[tone], "width": 2, "style": "solid"}}})
    bottom = row_y[2] + row_h[2]
    s.append(note("legend", 60, bottom + 50, W - 60, 70,
                  '<b>Reading it.</b> PK is the record\'s key, FK points at another record. Crow\'s feet mark the many side. '
                  '<b>Colours:</b> teal ledger, amber market data, purple forecasting, rose research, grey operations. An event '
                  'analysis reaches a forecast only as a structured, point-in-time input, and only after it has shown it adds accuracy.'))
    many, one = "zeroOrMore", "exactlyOne"

    def rel(id_, a, pa, b, pb, label, ea=many, eb=one, pos=0.5):
        return line(id_, a, pa, b, pb, label, MUTED, pos=pos, ends=(ea, eb))

    L = [
        rel("r1", "txn", (0, 0.4), "imp", (1, 0.4), "from"),
        rel("r2", "txn", (1, 0.4), "ins", (0, 0.4), "of"),
        rel("r3", "obs", (0, 0.4), "ins", (1, 0.4), "of"),
        rel("r4", "imp", (0.5, 1), "job", (0.5, 0), "approved by", eb="zeroOrOne"),
        rel("r5", "pred", (0.5, 0), "ins", (0.5, 1), "for"),
        rel("r6", "out", (1, 0.5), "pred", (0, 0.5), "scores"),
        rel("r7", "feat", (0.5, 0), "obs", (0.5, 1), "built from", eb=many),
        rel("r8", "run", (0.5, 0), "feat", (0.5, 1), "trained on"),
        rel("r9", "pred", (1, 0.85), "run", (0, 0.15), "made by"),
        rel("r10", "cost", (0.5, 0), "job", (0.5, 1), "spent by"),
        rel("r11", "res", (0, 0.15), "job", (1, 0.85), "found by"),
        rel("r12", "evt", (0, 0.5), "res", (1, 0.5), "cites", eb=many),
    ]
    return {"id": "records", "title": "8 Records", "shapes": s, "lines": L}


# --------------------------------------------------------------------------------------------- page 9

PHASES = {  # id: (title, stories, x column, y)
    "PH-02": ("Identity, private runtime, audit and launch cost controls", 6, 0, 1),
    "PH-01": ("Standalone portfolio, all-method imports and source lineage", 16, 1, 1),
    "PH-03": ("Market data, performance and portfolio risk", 5, 2, 1),
    "PH-04": ("Scientific baseline, full Forecaster and controlled learning", 8, 3, 0),
    "PH-05": ("Evidence research, agents, chat and evaluations", 6, 3, 2),
    "PH-06": ("Web discovery, ranked actions, proof and briefings", 5, 4, 1),
    "PH-07": ("Native Apple, offline and push", 4, 5, 1),
    "PH-08": ("Operational acceptance and controlled personal launch", 5, 6, 1),
    "PH-09": ("Versioned extensions and conditional future transfer", 4, 7, 1),
}
BUILD_EDGES = [("PH-00", "PH-02"), ("PH-02", "PH-01"), ("PH-01", "PH-03"), ("PH-03", "PH-04"), ("PH-03", "PH-05"),
               ("PH-04", "PH-06"), ("PH-05", "PH-06"), ("PH-06", "PH-07"), ("PH-07", "PH-08"), ("PH-08", "PH-09")]
GATES = ["Architecture sign-off", "Full UX design", "UX approval", "Permission to build"]


def page_road() -> dict:
    W = 2140
    s = header("p9", W, "The road: PH-00 to PH-09",
               "Ten draft phases and 64 local story drafts (phase-story-baseline.json, 2 November 2026). Nothing is built until the "
               "four owner gates have passed, in order.", "PROPOSED: planning only")
    s.append({"id": "here", "type": "rectangle", "boundingBox": {"x": 60, "y": 170, "w": 300, "h": 44},
              "style": {"fill": {"type": "color", "color": BLUE}, "stroke": {"color": BLUE, "width": 2, "style": "solid"}},
              "text": '<p style="font-size:15px;text-align:center;color:#FFFFFF"><b>WE ARE HERE: PH-00, planning</b></p>'})
    s.append(box("PH-00", 60, 274, 300, 130, "PH-00", "Complete baseline and contract decisions<br>5 story drafts", "blue", size=16, width=4))
    for i, gate in enumerate(GATES):
        s.append(box(f"g{i + 1}", 480 + i * 360, 289, 240, 100, f"Owner gate {i + 1}", gate, "amber", size=15, width=3))
    ys = {0: 620, 1: 760, 2: 900}
    for pid, (title, n, col, row) in PHASES.items():
        s.append(box(pid, 60 + col * 260, ys[row], 200, 120, pid, f"{title}<br><i>{n} story drafts</i>",
                     "teal" if pid in ("PH-01", "PH-02") else "plain", size=14))
    s.append(note("legend", 60, 1120, W - 60, 90,
                  '<b>Reading it.</b> Arrows in the lower row show build order: the implementation dependencies, reduced to direct links '
                  '(PH-08 needs PH-01 to PH-07). Every phase depends on PH-00 for planning. All phases are drafts for planning only; the '
                  '16 import stories are detailed drafts and the other 48 are umbrellas still to be broken into Jira stories.'))
    L = [line("gl0", "PH-00", (1, 0.5), "g1", (0, 0.5), "then", BLUE)]
    L += [line(f"gl{i}", f"g{i}", (1, 0.5), f"g{i + 1}", (0, 0.5), "then", AMBER) for i in range(1, 4)]
    L.append(line("gb", "g4", (0.5, 1), "PH-02", (0.5, 0), "then build, in this order", AMBER, pos=0.5, side="middle"))
    for a, b in BUILD_EDGES[1:]:
        L.append(line(f"e_{a}_{b}", a, (1, 0.5), b, (0, 0.5), "", TEAL))
    return {"id": "road", "title": "9 The road", "shapes": s, "lines": L}


def compact(o):
    """Single-quote HTML attributes (no JSON escapes) and drop .0 from whole numbers, to keep the payload small."""
    if isinstance(o, str):
        return re.sub(r'style="([^"]*)"', r"style='\1'", o)
    if isinstance(o, float):
        return int(o) if o.is_integer() else round(o, 4)
    if isinstance(o, dict):
        return {k: compact(v) for k, v in o.items()}
    if isinstance(o, list):
        return [compact(v) for v in o]
    return o


def scoped(page: dict, n: int) -> dict:
    """Prefix every shape and line id with its page number: Lucid needs ids unique across the whole document."""
    pre = f"p{n}_"
    fix = lambda i: i if i.startswith(pre) else pre + i  # noqa: E731
    for sh in page["shapes"]:
        sh["id"] = fix(sh["id"])
    for ln in page["lines"]:
        ln["id"] = fix(ln["id"])
        for end in ("endpoint1", "endpoint2"):
            if "shapeId" in ln[end]:
                ln[end]["shapeId"] = fix(ln[end]["shapeId"])
    return page


PAGES = [page_system, page_authority, page_forecast, page_claude, page_import, page_identity, page_delivery, page_records, page_road]

if __name__ == "__main__":
    import sys

    chosen = list(enumerate(PAGES, 1))
    if len(sys.argv) > 2 and sys.argv[1] == "--page":  # one page on its own, for validating in small pieces
        chosen = [chosen[int(sys.argv[2]) - 1]]
    doc = {"version": 1, "pages": [scoped(p(), n) for n, p in chosen]}
    print(json.dumps(compact(doc), separators=(",", ":"), ensure_ascii=False))
