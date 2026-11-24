"""Write the Lucid Standard Import JSON for "Mypaisaa Prediction: stack, quality, security and testing (MP-36)".

    python3 docs/diagrams/mp-quality-2026-11-02/lucid_spec.py > docs/diagrams/mp-quality-2026-11-02/spec.json
    python3 docs/diagrams/mp-quality-2026-11-02/lucid_spec.py --page 3      # one page on its own
    python3 docs/diagrams/mp-quality-2026-11-02/lucid_spec.py --title       # the document title

Six pages, placed by coordinates (no assisted layout), on native AWS 2024 shapes where AWS services appear:

1 The stack end to end          3 From a merge to prod                  5 The perimeter, and the optional lockdown
2 One trace from the door       4 Apple testing and the private beta    6 Web quality on every screen
  to the model

Every element carries its status in words: IMPLEMENTED, OWNER-SELECTED, PROPOSED or OPEN, with a status key on every
page. Nothing on any page is deployed: only the FastAPI health/SSE starter and CI exist. The palette, helpers and
placement follow the MP-34 generator (docs/diagrams/mp-architecture-2026-11-02/lucid_spec.py); they are copied, not
imported, so this document does not change when that one does. Sources: README.md, ARCHITECTURE.md, TECH-STACK.md
and the MP-36 page drafts (rec-stack, rec-observability, rec-testing, rec-apple-testing, rec-perimeter,
rec-web-quality), all 2 November 2026. Prices are the drafts' own, checked 2 November 2026 at the cost
specification's £0.80 to the dollar and 20% tax.
Drawings 2 to 5 carry the owner's 2 and 3 November 2026 decisions (decision log): Terraform only, the owner-started
release (route A), SSM Parameter Store, Organizations with the cost-guard SCP, N0 in Virginia and free Apple builds
(MP-20 refresh).
"""

from __future__ import annotations

import json
import math
import re

DOC_TITLE = "Mypaisaa Prediction: stack, quality, security and testing (MP-36)"

INK, MUTED = "#17243C", "#526078"
BLUE, AMBER, TEAL, PURPLE, ROSE = "#2459B8", "#966012", "#087D78", "#6840B1", "#B23C67"
TINT = {"blue": "#E6EEFF", "amber": "#FFF1D6", "rose": "#FDE7EE", "teal": "#DCF5EF", "purple": "#EFE7FD", "plain": "#FFFFFF", "grey": "#F5F7FC"}
STROKE = {"blue": BLUE, "amber": AMBER, "rose": ROSE, "teal": TEAL, "purple": PURPLE, "plain": INK, "grey": "#A9B7CD"}
ICON = 72

# status key: word and colour. The same colours fill the chips in each page's status key.
STATUS = {"impl": ("IMPLEMENTED", TEAL), "sel": ("OWNER-SELECTED", BLUE), "prop": ("PROPOSED", AMBER), "open": ("OPEN", ROSE)}


# --------------------------------------------------------------------------------------------- helpers (as MP-34)


def text(id_: str, x: float, y: float, w: float, h: float, html: str) -> dict:
    return {"id": id_, "type": "text", "boundingBox": {"x": x, "y": y, "w": w, "h": h}, "text": html}


def tag(status: str | None, extra: str = "") -> str:
    """The status word in its colour, for use inside any text."""
    if not status:
        return ""
    word, colour = STATUS[status]
    return f'<span style="font-size:11px;color:{colour}"><b>{word}</b>{extra}</span>'


def box(id_: str, x: float, y: float, w: float, h: float, title: str, detail: str, tone: str, status: str | None = None,
        dashed: bool = False, size: int = 14, width: int = 2, extra: str = "", align: str = "center") -> dict:
    body = f'<b>{title}</b>' + (f'<br><span style="font-size:{size - 2}px;color:{MUTED}">{detail}</span>' if detail else "")
    if status:
        body += "<br>" + tag(status, extra)
    return {
        "id": id_, "type": "rectangle", "boundingBox": {"x": x, "y": y, "w": w, "h": h},
        "style": {"fill": {"type": "color", "color": TINT[tone]},
                  "stroke": {"color": STROKE[tone], "width": width, "style": "dashed" if dashed else "solid"}},
        "text": f'<p style="font-size:{size}px;text-align:{align}">{body}</p>',
    }


def label_html(name: str, role: str, status: str | None, align: str = "center", extra: str = "") -> str:
    out = f'<p style="font-size:13px;text-align:{align}"><b>{name}</b>'
    if role:
        out += f'<br><span style="font-size:11px;color:{MUTED}">{role}</span>'
    if status:
        out += "<br>" + tag(status, extra)
    return out + "</p>"


def icon(shapes: list, id_: str, cls: str, x: float, y: float, name: str, role: str, status: str | None, side: str = "below",
         w: float = ICON, h: float = ICON, lw: float = 200, extra: str = "", gap: float = 6) -> None:
    """A native AWS shape with a blank text (no catalogue name) and its own label: name, role, status, `gap` px away."""
    shapes.append({"id": id_, "type": "namedShape", "className": cls, "boundingBox": {"x": x, "y": y, "w": w, "h": h}, "text": " "})
    eff = (lw if side in ("below", "above") else lw - 10) - 14  # usable width, as the fit check counts it
    name_lines = math.ceil(len(name) * 13 * 0.6 / eff)
    role_lines = math.ceil(len(role) * 11 * 0.56 / eff) if role else 0
    lh = 20 + 18 * name_lines + 16 * (role_lines + (1 if status else 0))  # 12 px spare: the fit budget is generous on purpose
    cx = x + w / 2
    if side == "below":
        shapes.append(text(f"{id_}_t", cx - lw / 2, y + h + gap, lw, lh, label_html(name, role, status, extra=extra)))
    elif side == "above":
        shapes.append(text(f"{id_}_t", cx - lw / 2, y - lh - gap, lw, lh, label_html(name, role, status, extra=extra)))
    elif side == "right":
        shapes.append(text(f"{id_}_t", x + w + 14, y + h / 2 - lh / 2, lw - 10, lh, label_html(name, role, status, "left", extra)))
    elif side == "left":
        shapes.append(text(f"{id_}_t", x - lw - 4, y + h / 2 - lh / 2, lw - 10, lh, label_html(name, role, status, "right", extra)))


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
        text(f"{prefix}_sub", 60, 88, right - 560, 50, f'<p style="font-size:14px;color:{MUTED}">{subtitle}</p>'),
        {"id": f"{prefix}_status", "type": "rectangle", "boundingBox": {"x": right - 440, "y": 40, "w": 440, "h": 72},
         "style": {"fill": {"type": "color", "color": "#FFF8E8"}, "stroke": {"color": AMBER, "width": 2, "style": "solid"}},
         "text": f'<p style="font-size:14px;text-align:center"><b>STATUS</b><br>{status}</p>'},
    ]


def band(id_: str, x: float, y: float, w: float, h: float, tone: str, dashed: bool = True) -> dict:
    return {"id": id_, "type": "rectangleContainer", "boundingBox": {"x": x, "y": y, "w": w, "h": h},
            "style": {"fill": {"type": "color", "color": TINT[tone] + "80"},
                      "stroke": {"color": STROKE[tone], "width": 1 if dashed else 2, "style": "dashed" if dashed else "solid"}}}


def panel(id_: str, x: float, y: float, w: float, h: float, title: str) -> dict:
    return {"id": id_, "type": "rectangleContainer", "boundingBox": {"x": x, "y": y, "w": w, "h": h},
            "containerTitle": {"text": title},
            "style": {"fill": {"type": "color", "color": "#FAFBFE"}, "stroke": {"color": "#A9B7CD", "width": 1, "style": "solid"}}}


def note(id_: str, x: float, y: float, w: float, h: float, html: str, size: int = 13) -> dict:
    return {"id": id_, "type": "rectangle", "boundingBox": {"x": x, "y": y, "w": w, "h": h},
            "style": {"fill": {"type": "color", "color": "#F5F7FC"}, "stroke": {"color": "#A9B7CD", "width": 1, "style": "solid"}},
            "text": f'<p style="font-size:{size}px;text-align:left">{html}</p>'}


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


def heading(id_: str, x: float, y: float, w: float, words: str, colour: str = MUTED, size: int = 13) -> dict:
    return text(id_, x, y, w, size + 16, f'<p style="font-size:{size}px;color:{colour}"><b>{words}</b></p>')


def legend(prefix: str, x: float, y: float, w: float, extra: str) -> list:
    """The status key: four filled chips, then what the colours of the boxes mean on this page."""
    out = [text(f"{prefix}_key", x, y + 4, 130, 40, '<p style="font-size:13px"><b>STATUS KEY</b></p>')]
    for i, key in enumerate(("impl", "sel", "prop", "open")):
        word, colour = STATUS[key]
        out.append({"id": f"{prefix}_k{i}", "type": "rectangle", "boundingBox": {"x": x + 140 + i * 196, "y": y, "w": 180, "h": 40},
                    "style": {"fill": {"type": "color", "color": colour}, "stroke": {"color": colour, "width": 1, "style": "solid"}},
                    "text": f'<p style="font-size:13px;text-align:center;color:#FFFFFF"><b>{word}</b></p>'})
    nx = x + 140 + 4 * 196 + 10
    out.append(text(f"{prefix}_keyn", nx, y - 8, w - (nx - x), 60, f'<p style="font-size:12px;color:{MUTED}">{extra}</p>'))
    return out


# --------------------------------------------------------------------------------------------- page 1: the stack

C1 = {1: 420, 2: 640, 3: 860, 4: 1080, 5: 1300, 6: 1570}
BY0, BH, BSTEP = 170, 220, 260

LAYERS = [  # (title, refs, tone, libraries html)
    ("Doors", "ARC-10: two doors, one API", "blue",
     "<b>Web:</b> SvelteKit 3 with the static adapter, TypeScript, a service worker for the PWA and Web Push " + tag("sel")
     + ". Client types generated from FastAPI's OpenAPI document " + tag("prop") + ". UI kit, charts and state library wait for the UX work " + tag("open")
     + ".<br><b>Apple:</b> Swift and SwiftUI own the screens, persistence, widgets, Keychain and notifications; a React Native shell owns navigation and "
     "typed bridge messages, never a secret " + tag("sel") + ". Swift types from an OpenAPI generator " + tag("prop") + ". Device matrix " + tag("open", " (PL-14)") + "."),
    ("Edge", "ARC-07, ARC-10", "blue",
     "<b>CloudFront</b> serves the built PWA from private S3 through origin access control. <b>Cognito</b> signs in with Apple, Google and passkeys. "
     "<b>API Gateway</b> checks the Cognito token before any Lambda runs " + tag("sel")
     + ".<br>SSE runs through API Gateway in response streaming mode; the streaming proof is still to run " + tag("open", " (PL-04)") + "."),
    ("API", "FastAPI, routes under /api/v1", "blue",
     "<b>FastAPI</b> with <b>Pydantic v2</b> models at every boundary; Uvicorn locally. The health route and a sample SSE route run on a laptop " + tag("impl")
     + ".<br>On Lambda through the <b>AWS Lambda Web Adapter</b>, buffered for the API and streaming for SSE; Mangum the alternative " + tag("prop")
     + ".<br><b>Powertools for AWS Lambda</b>: Logger, Metrics, Idempotency, Parameters " + tag("prop")
     + ". One error shape on every failure, with request_id and trace_id " + tag("prop") + "."),
    ("Work", "ARC-03", "amber",
     "<b>EventBridge Scheduler</b> for the daily window and the 30-minute checks, <b>SQS</b> with a dead-letter queue, and "
     "<b>Lambda Durable Functions</b> written in Python, not Step Functions " + tag("sel")
     + ".<br>Every step is idempotent by key; a replay is a new attempt, never an edit of the old one. Live chat through SQS or a direct invoke " + tag("open", " (PL-05)") + "."),
    ("Claude route workers", "ARC-06, ARC-06b", "rose",
     "The official <b>anthropic</b> Python SDK in an explicit loop: the server decides every step. One Lambda per task route, sharing one bounded runner "
     "with budgets for time, tokens and steps " + tag("sel")
     + ".<br>Tools are allowlisted, typed and read-only by default; extraction runs with no tools. <b>Message Batches</b> for work no one waits for. "
     "Evaluations in <b>Inspect AI</b> with pytest " + tag("sel", " (ARC-09)") + "."),
    ("Models", "ARC-04, ARC-05", "purple",
     "<b>scikit-learn</b> style pipelines on <b>NumPy</b> and <b>pandas</b>; <b>pandas-market-calendars</b> and <b>exchange-calendars</b> for sessions " + tag("sel", ", family")
     + ".<br>Capped <b>SageMaker</b> CPU training jobs with walk-forward folds; only an approved artefact, found by its hash, runs in the inference Lambda " + tag("sel")
     + ". Artefact format and where inference runs " + tag("open", " (PL-07)") + "."),
    ("Records", "ARC-02", "teal",
     "<b>DynamoDB</b> and private, encrypted <b>S3</b> " + tag("sel") + ", through a thin typed repository on <b>boto3</b> with <b>boto3-stubs</b>, no ORM " + tag("prop")
     + ".<br>One controlled writer commits to the ledger. Predictions, model runs and outcomes are append-only. Money is a decimal, never a float " + tag("prop")
     + ". One table or a few, and the keys " + tag("open", " (PL-08)") + "."),
]


def page_stack() -> dict:
    W = 2420
    s = header("p1", W, "The stack end to end",
               "One level below the system page: each layer, what it is built with, and the libraries under it. The layers are owner-selected "
               "(ARC-02 to ARC-10); most library picks are proposed. Only the FastAPI starter runs, on a laptop. Numbers follow one request.",
               "Layers OWNER-SELECTED; libraries PROPOSED")
    by = [BY0 + i * BSTEP for i in range(len(LAYERS))]
    for i, (title, refs, tone, libs) in enumerate(LAYERS):
        s.append(band(f"band{i}", 60, by[i], W - 60, BH, tone))
        colour = STROKE[tone]
        s.append(text(f"band{i}_t", 76, by[i] + 16, 230, 90,
                      f'<p style="font-size:17px;color:{colour}"><b>{title}</b><br><span style="font-size:12px;color:{MUTED}">{refs}</span></p>'))
        s.append({"id": f"lib{i}", "type": "rectangle", "boundingBox": {"x": 1720, "y": by[i] + 14, "w": W - 1740, "h": BH - 28},
                  "style": {"fill": {"type": "color", "color": "#FFFFFF"}, "stroke": {"color": colour, "width": 1, "style": "solid"}},
                  "text": f'<p style="font-size:13px;text-align:left">{libs}</p>'})
    iy = [b + 50 for b in by]
    # doors
    s.append(box("web", C1[1] - 100, by[0] + 50, 200, 110, "Web app", "SvelteKit 3 PWA, prebuilt and static", "blue", "sel", size=14))
    s.append(box("apple", C1[3] - 100, by[0] + 50, 200, 110, "iPhone and iPad", "SwiftUI app in a React Native shell", "blue", "sel", size=14))
    # edge
    icon(s, "cf", "ArchAmazonCloudFrontAWS2024", C1[1] - 36, iy[1], "CloudFront", "serves the PWA", "sel")
    icon(s, "cog", "ArchAmazonCognitoAWS2024", C1[2] - 36, iy[1], "Cognito", "Apple, Google, passkeys", "sel")
    icon(s, "apigw", "ArchAmazonAPIGatewayAWS2024", C1[3] - 36, iy[1], "API Gateway", "checks the Cognito token", "sel", "right")
    # api
    s.append(box("starter", C1[1] - 100, by[2] + 45, 200, 130, "FastAPI starter", "health route and a sample SSE route, on a laptop today", "blue", "impl", size=14, width=3))
    icon(s, "api", "ArchAWSLambdaAWS2024", C1[3] - 36, iy[2], "FastAPI on Lambda", "Pydantic v2 at every boundary", "sel", "right")
    s.append(box("adapter", C1[5] - 110, by[2] + 45, 220, 130, "Lambda Web Adapter", "the same Uvicorn app on a laptop and on Lambda; streaming for SSE", "blue", "prop", dashed=True, size=14))
    # work
    icon(s, "sched", "ResAmazonEventBridgeSchedulerAWS2024", C1[2] - 36, iy[3], "EventBridge Scheduler", "daily, every 30 minutes", "sel")
    icon(s, "sqs", "ArchAmazonSimpleQueueServiceAWS2024", C1[3] - 36, iy[3], "SQS + DLQ", "buffered, retried jobs", "sel")
    icon(s, "dur", "ArchAWSLambdaAWS2024", C1[4] - 36, iy[3], "Durable Functions", "Python, survive restarts", "sel", "right", lw=210)
    # claude
    s.append(box("haiku", C1[1] - 100, by[4] + 40, 200, 140, "Haiku 5.5", "triage of news and filings, model inputs, extraction", "rose", "sel", size=14))
    s.append(box("sonnet", C1[2] - 100, by[4] + 40, 200, 140, "Sonnet 5.5", "chat, explanations, the 07:30 briefing, eval grading", "rose", "sel", size=14))
    s.append(box("opus", C1[3] - 100, by[4] + 40, 200, 140, "Opus 5.5", "at most three event analyses a day, batched overnight", "rose", "sel", size=14))
    icon(s, "worker", "ArchAWSLambdaAWS2024", C1[5] - 36, iy[4], "Route workers", "one Lambda per route", "sel", lw=210)
    s.append(box("anth", C1[6] - 110, by[4] + 40, 220, 140, "Anthropic API", "outside AWS: Messages live, Message Batches at half price", "rose", "sel", dashed=True, size=14))
    # models
    s.append({"id": "train", "type": "namedShape", "className": "ResAmazonSageMakerTrainAWS2024",
              "boundingBox": {"x": C1[4] - 36, "y": iy[5] + 6, "w": 72, "h": 60}, "text": " "})
    s.append(text("train_t", C1[4] - 250, iy[5] + 4, 196, 64, label_html("SageMaker training", "capped CPU jobs", "sel", "right")))
    icon(s, "inf", "ArchAWSLambdaAWS2024", C1[5] - 36, iy[5], "Inference Lambda", "approved artefacts only", "sel", "right", lw=210)
    # records
    icon(s, "s3", "ArchAmazonSimpleStorageServiceAWS2024", C1[4] - 36, iy[6], "S3 (private)", "evidence and artefacts", "sel")
    icon(s, "ddb", "ArchAmazonDynamoDBAWS2024", C1[5] - 36, iy[6], "DynamoDB", "ledger, forecasts, runs", "sel")

    bottom = BY0 + len(LAYERS) * BSTEP
    s += legend("leg", 60, bottom + 6, W - 60,
                "Band colours: blue serve and ask, amber work, rose Claude, purple models, teal records. Dashed boxes sit outside AWS or are not yet chosen.")
    s.append(note("rules", 60, bottom + 66, W - 60, 74,
                  "<b>Reading it.</b> Both doors call <b>/api/v1</b> through API Gateway; the web's API line is left out to keep the page clear. "
                  "Every library is free and open source; versions are pinned in backend/uv.lock when a story builds the layer, not here. "
                  "Left over and not to be installed for new work: the <b>data</b> extra (SQLAlchemy, asyncpg, Alembic) and the <b>agents</b> extra (claude-agent-sdk)."))
    P = 0.63  # puts a label on a band-to-band line in the 40 px gap between bands
    L = [
        line("l1", "web", (0.5, 1), "cf", (0.5, 0), "1 load", BLUE, 0.53, "middle"),
        line("l2", "web", (0.9, 1), "cog", (0.5, 0), "2 sign in", ROSE, 0.53, "middle"),
        line("l3", "apple", (0.5, 1), "apigw", (0.5, 0), "3 HTTPS, SSE", BLUE, 0.53, "middle"),
        line("l4", "apigw", (0.5, 1), "api", (0.5, 0), "4 invoke", BLUE, P, "middle"),
        line("l5", "api", (0.5, 1), "sqs", (0.5, 0), "5 long work becomes a job", AMBER, P, "middle"),
        line("l6", "sched", (1, 0.5), "sqs", (0, 0.5), "6 tick", AMBER),
        line("l7", "sqs", (1, 0.5), "dur", (0, 0.5), "7 start", AMBER),
        line("l8", "dur", (1, 1), "worker", (0, 0), "8 route", ROSE, 0.6, "middle"),
        line("l9", "worker", (1, 0.5), "anth", (0, 0.5), "9 calls", ROSE),
        line("l10", "dur", (0.5, 1), "train", (0.5, 0), "10 train", PURPLE, 0.5, "middle"),
        line("l11", "train", (0.5, 1), "s3", (0.5, 0), "11 artefacts", PURPLE, P, "middle"),
        line("l12", "train", (1, 0.5), "inf", (0, 0.5), "12 approved", PURPLE),
        line("l13", "inf", (0.5, 1), "ddb", (0.5, 0), "13 store forecasts", TEAL, P, "middle"),
    ]
    return {"id": "stack", "title": "1 The stack end to end", "shapes": s, "lines": L}


# --------------------------------------------------------------------------------------------- page 2: one trace

def page_trace() -> dict:
    W = 2370
    D = 70  # everything right of the door sits 70 px further right, so "1 traceparent" fits before the AWS Cloud border
    s = header("p2", W, "One trace from the door to the model",
               "One question from the owner (why did this forecast fall?) followed hop by hop. It is one trace where a person waits; where work is queued, resumed or "
               "batched the trace ends and stable IDs carry the join (PL-12, CT-06). Nothing is instrumented yet.",
               "PROPOSED; retention periods OWNER-SELECTED")
    s.append({"id": "cloud", "type": "namedContainer", "className": "AWSCloudAWS2024", "boundingBox": {"x": 320 + D, "y": 160, "w": 1260, "h": 560},
              "text": "AWS Cloud: prod account (dev has the same shape)"})
    s.append(box("door", 60, 276, 180, 120, "The door", "PWA or Apple app mints a W3C traceparent and a client_message_id", "blue", "prop", size=14))
    xs = {k: v + D for k, v in {"apigw": 440, "api": 680, "sqs": 920, "dur": 1160, "worker": 1400}.items()}
    iy, g = 300, 16  # 16 px between each icon and its label above, so the hop labels on top of the lines clear both
    icon(s, "apigw", "ArchAmazonAPIGatewayAWS2024", xs["apigw"] - 36, iy, "API Gateway", "adds its request_id", "prop", "above", gap=g)
    icon(s, "api", "ArchAWSLambdaAWS2024", xs["api"] - 36, iy, "FastAPI on Lambda", "checks traceparent, returns trace_id", "prop", "above", gap=g)
    icon(s, "sqs", "ArchAmazonSimpleQueueServiceAWS2024", xs["sqs"] - 36, iy, "SQS", "trace context rides the message", "prop", "above", gap=g)
    icon(s, "dur", "ArchAWSLambdaAWS2024", xs["dur"] - 36, iy, "Durable workflow", "run_id and job_id on every span", "prop", "above", gap=g)
    icon(s, "worker", "ArchAWSLambdaAWS2024", xs["worker"] - 36, iy, "Chat route worker", "one span per Claude call", "prop", "above", gap=g)
    icon(s, "ddb", "ArchAmazonDynamoDBAWS2024", 1040 + D - 36, 540, "DynamoDB", "run record: accepted, started, closed", "prop", lw=230)
    s.append(heading("anth_h", 1640 + D, 200, 320, "OUTSIDE AWS: ANTHROPIC API"))
    s.append(box("msgs", 1640 + D, 240, 260, 130, "Messages API, live", "a client span to the edge: model, tokens, cost; Anthropic's inside is not visible", "rose", "sel", dashed=True, size=14))
    # Batches sits low, so the SSE notice (8) passes between it and the live call
    s.append(box("batch", 1640 + D, 530, 260, 160, "Message Batches", "submitting is one span; results come hours later in another run, matched by batch id and custom_id", "rose", "sel", dashed=True, size=14))
    s.append(box("sse", 2010 + D, 440, 230, 160, "8 SSE notice, then a re-read", "the notice carries run_id; the re-read is a new request with its own trace", "blue", "prop", size=14))

    # the continuity bar
    s.append(heading("bar_h", 60, 744, 900, "IS IT ONE TRACE? READ THE BAR UNDER EACH HOP", INK))
    segs = [
        ("seg1", 60, 800 + D, "ONE TRACE", "door, API Gateway, FastAPI: traceparent in; trace_id and request_id out on every response", "teal", False),
        ("seg2", 800 + D, 1040 + D, "MAY BREAK AT SQS", "context rides the message; propagation still to prove", "amber", True),
        ("seg3", 1040 + D, 1280 + D, "A NEW TRACE, LINKED", "a durable resume after a wait is a new trace, linked; job_id joins them", "rose", False),
        ("seg4", 1280 + D, 1580 + D, "CONTINUES", "worker spans carry run_id and no prompt text", "teal", False),
        ("seg5", 1640 + D, 1900 + D, "JOINED BY IDS", "live: a span to the edge only. Batches: batch id and custom_id", "rose", True),
        ("seg6", 2010 + D, 2240 + D, "A NEW REQUEST", "the re-read after an SSE notice, joined by run_id", "rose", False),
    ]
    for id_, x0, x1, title, detail, tone, dashed in segs:
        s.append(box(id_, x0, 780, x1 - x0, 130, title, detail, tone, "prop", dashed=dashed, size=14, width=3))
    s.append(note("keys", 60, 930, W - 60, 56,
                  "<b>Correlation keys</b>, on every log line and span: trace_id, span_id, request_id, run_id, job_id, client_message_id, conversation_id, "
                  "import_id, prediction_id, model_version, config_version, environment, build. A replay is a new run and a new trace, linked to the original, "
                  "which is never rewritten. The joins outlive the traces."))

    # where the signals go: 60 px below the keys, so the panel title tabs clear them
    py = 1050
    s.append(panel("where", 60, py, 760, 470, "Where the signals go"))
    for i, (id_, cls, w, h, name, role) in enumerate([
        ("logs", "ResAmazonCloudWatchLogsAWS2024", 72, 54, "CloudWatch Logs", "Powertools JSON lines"),
        ("metrics", "ArchAmazonCloudWatchAWS2024", 72, 72, "CloudWatch metrics", "8 in prod, 4 in dev"),
        ("adot", "ArchAWSDistroforOpenTelemetryAWS2024", 72, 72, "OpenTelemetry", "the ADOT Lambda layer"),
        ("xray", "ArchAWSXRayAWS2024", 72, 72, "X-Ray", "sampled traces"),
    ]):
        icon(s, id_, cls, 150 + i * 180 - 36, py + 70 + (72 - h) / 2, name, role, "prop", w=w, h=h, lw=170)
    s.append(text("where_n", 80, py + 230, 720, 220,
                  f'<p style="font-size:12px;text-align:left">Kept for: operational logs 14 days, rich traces 30 days, run summaries 90 days {tag("sel")}. '
                  f'Audit, approvals, predictions and outcomes for the life of the account {tag("sel")}.<br>'
                  f'Never sampled: run records, audit, approvals, predictions, outcomes, the cost ledger. Always traced: owner commands, imports, chat, '
                  f'every Claude call, the daily forecast run.<br>Powertools Tracer is not used: it wraps the X-Ray SDK, which reaches end of support on '
                  f'25 February 2027. Watching costs about $4.94 a month (about £4.74), already inside the cost model\'s AWS total {tag("prop")}.</p>'))

    # who hears what
    s.append(panel("hear", 860, py, 740, 470, "Who hears what: two channels, never mixed"))
    icon(s, "alarm", "ResAmazonCloudWatchAlarmAWS2024", 960 - 36, py + 70, "Alarms", "6 in prod, 2 in dev", "prop", lw=170)
    icon(s, "sns", "ArchAmazonSimpleNotificationServiceAWS2024", 1170 - 36, py + 70, "SNS topic", "one per environment", "prop", lw=170)
    s.append(box("owner", 1340, py + 60, 230, 120, "The owner's email", "system incidents; an OK closes one without erasing it", "blue", "open", size=14, extra=" (CT-18)"))
    s.append({"id": "wall", "type": "rectangle", "boundingBox": {"x": 890, "y": py + 262, "w": 680, "h": 8},
              "style": {"fill": {"type": "color", "color": ROSE}, "stroke": {"color": ROSE, "width": 1, "style": "solid"}}, "text": " "})
    s.append(box("invest", 890, py + 300, 680, 140, "Investment alerts go through the product",
                 "Web Push through the PWA (no Apple push on free builds), the 07:30 briefing, quiet hours 22:00 to 07:00. They never use the "
                 "operations topic, and a failed provider can never send a confident all-clear.", "teal", "prop", size=14, extra=" (CT-18)"))

    # redaction
    s.append(panel("red", 1640, py, W - 1700, 470, "Redaction"))
    s.append(text("red_n", 1660, py + 30, W - 1740, 270,  # sized to its text, so it sits at the top
                  f'<p style="font-size:13px;text-align:left"><b>Never in a log, span or metric:</b> secrets, tokens, prompts, replies, holdings amounts, names, '
                  f'account numbers, file names, signed URLs or tool arguments.<br><br>Prompt and reply capture is off. Only dev may switch it on, only for data '
                  f'proved synthetic, behind a setting prod refuses.<br><br>Client baggage is ignored and a malformed traceparent is replaced, so a door cannot '
                  f'inject an identity.<br><br>A leak test replays synthetic runs carrying marker strings and fails CI if a marker reaches a log, span or metric.<br><br>'
                  f'{tag("prop")}</p>'))
    s += legend("leg", 60, py + 500, W - 60, "Bar colours: teal one trace, amber a join still to prove, rose a new trace joined by IDs. Dashed boxes sit outside AWS or are unproved.")
    L = [
        # hop labels sit above their lines; 1 sits left of the AWS Cloud border, 6 and 7 inside it
        line("t1", "door", (1, 0.5), "apigw", (0, 0.5), "1 traceparent", BLUE, 0.33),
        line("t2", "apigw", (1, 0.5), "api", (0, 0.5), "2 request_id", BLUE),
        line("t3", "api", (1, 0.5), "sqs", (0, 0.5), "3 job + context", AMBER),
        line("t4", "sqs", (1, 0.5), "dur", (0, 0.5), "4 start", AMBER),
        line("t5", "dur", (1, 0.5), "worker", (0, 0.5), "5 route", ROSE),
        line("t6", "worker", (1, 0.25), "msgs", (0, 0.55), "6 live call", ROSE, 0.34, "bottom"),
        line("t7", "worker", (1, 0.85), "batch", (0, 0.3), "7 batch", ROSE, 0.25, "middle", dashed=True),
        # the API's SSE route sends the notice (page 1: SSE through API Gateway to FastAPI, streaming)
        line("t10", "api", (0.8, 1), "sse", (0, 0.4875), "8 SSE notice", BLUE, 0.26),
        line("t8", "api", (0.5, 1), "ddb", (0, 0.5), "run record", TEAL, 0.45, "middle"),
        line("t9", "worker", (0.5, 1), "ddb", (1, 0.5), "turn stored, run closed", TEAL, 0.45, "middle"),
        line("w1", "logs", (1, 0.5), "metrics", (0, 0.5), "", MUTED),
        line("w2", "adot", (1, 0.5), "xray", (0, 0.5), "export", MUTED),
        line("h1", "alarm", (1, 0.5), "sns", (0, 0.5), "notify", ROSE),
        line("h2", "sns", (1, 0.5), "owner", (0, 0.5), "email", ROSE),
    ]
    return {"id": "trace", "title": "2 One trace from the door to the model", "shapes": s, "lines": L}


# --------------------------------------------------------------------------------------------- page 3: merge to prod

CHECKS = ["Backend", "Docs", "Review tooling", "Agent config", "Plan sync", "Confluence receipts", "Static preview", "Workflow lint", "Jira traceability", "CodeQL"]
SCANS = [
    ("Dependabot", "alerts and security updates, on", "impl"),
    ("GitHub secret scanning", "with push protection; free on a public repo", "impl"),
    ("OSV-Scanner", "on backend/uv.lock and the site's package-lock.json", "prop"),
    ("pip-audit", "a second source for Python advisories", "prop"),
    ("gitleaks", "secrets in commits; checksum-verified", "prop"),
    ("Ruff S rules", "Bandit's patterns; Ruff already runs", "prop"),
    ("Terraform checks", "terraform fmt and validate, TFLint and Checkov on the Terraform", "prop"),
]
ROUTES_NOT = [  # the routes the owner did not choose (3 November 2026)
    ("B: GitHub Team", "$4 a user a month (about £3.84); still no required reviewers on a private repo"),
    ("C: GitHub Enterprise", "$21 a user a month (about £20.16): required reviewers"),
    ("D: CodePipeline approval", "a new managed service in the prod account, needing a costed ADR"),
]


def page_delivery() -> dict:
    W = 2440
    s = header("p3", W, "From a merge to prod",
               "One artefact is built once, tested in dev, and the same bytes go to prod. CI deploys; no laptop and no Claude session does. "
               "Today's ten checks are implemented. The release route and Terraform are owner-selected (3 Nov 2026); the rest after the merge is proposed. "
               "Steps are numbered in order.",
               "Checks IMPLEMENTED; release route OWNER-SELECTED; rest PROPOSED")
    s.append(heading("gh_h", 60, 146, 600, "GITHUB, OUTSIDE AWS"))
    rowy = 385  # the row's centre line
    s.append(box("pr", 60, rowy - 55, 200, 110, "1 Pull request", "to main: [MP-&lt;n&gt;] title, Jira key", "blue", "impl", size=14))
    ph = 510  # the notes sit straight under the boxes; ten checks and seven scans each take a fourth row (MP-199)
    s.append(panel("checks", 310, 180, 580, ph, "2 Ten checks on every PR"))
    for k, name in enumerate(CHECKS):
        r, c = divmod(k, 3)
        s.append(box(f"ck{k}", 330 + c * 190, 230 + r * 74, 170, 60, name, "", "teal", "impl", size=13))
    s.append(text("checks_n", 330, 536, 540, 124,
                  f'<p style="font-size:12px;text-align:left">Also {tag("impl")}: Claude hooks run the selected checks before a PR is raised; the fixed-findings '
                  f'ledger re-runs on every PR; every action is pinned to a commit SHA.<br>The main ruleset {tag("impl")} requires a pull request and the ten '
                  f'checks, with no bypass (MP-198).</p>'))
    s.append(panel("scan", 940, 180, 580, ph, "3 Scan gate, free and open source"))
    for k, (name, detail, st) in enumerate(SCANS):
        r, c = divmod(k, 2)
        s.append(box(f"sc{k}", 960 + c * 280, 230 + r * 86, 260, 76, name, detail, "amber", st, size=13))
    s.append(text("scan_n", 960, 576, 540, 104,
                  f'<p style="font-size:12px;text-align:left">A High or Critical finding with a fix blocks the merge; an exception names its owner, reason and '
                  f'expiry; a weekly sweep catches later advisories {tag("prop")}.<br>CodeQL and GitHub secret scanning are free on a public repo and run today '
                  f'{tag("impl")}.</p>'))
    s.append(box("merge", 1570, rowy - 55, 200, 110, "4 Merge to main", "only when the owner asks", "teal", "impl", size=14, width=3))
    s.append(box("build", 1830, rowy - 65, 260, 130, "5 Build once", "Lambda packages and the PWA bundle, each with a recorded sha256 and an SBOM", "amber", "prop", size=14))
    s.append(box("iac", 2150, rowy - 65, 270, 130, "IaC: Terraform only", "every AWS change; plan only until an apply is asked for. Zip or image: still open", "amber", "sel", size=13, extra=" (MP-29)"))

    # AWS
    s.append({"id": "cloud", "type": "namedContainer", "className": "AWSCloudAWS2024", "boundingBox": {"x": 60, "y": 700, "w": W - 60, "h": 590},
              "text": "AWS: two accounts of the same shape (ARC-11). Nothing deployed in either"})
    s.append({"id": "oidc", "type": "namedShape", "className": "ResAWSIdentityAccessManagementAWSSTSAWS2024",
              "boundingBox": {"x": 1924, "y": 828, "w": 72, "h": 47}, "text": " "})
    s.append(text("oidc_t", 2010, 812, 200, 80, label_html("6 GitHub OIDC", "short-lived role; no stored AWS keys", "prop", "left")))
    s.append({"id": "dev", "type": "namedContainer", "className": "AWSAccountAWS2024", "boundingBox": {"x": 1150, "y": 760, "w": 730, "h": 490},
              "text": "dev account: synthetic data only"})
    s.append({"id": "role", "type": "namedShape", "className": "ResAWSIdentityAccessManagementRoleAWS2024",
              "boundingBox": {"x": 1700, "y": 830, "w": 72, "h": 42}, "text": " "})
    s.append(text("role_t", 1636, 898, 200, 80, label_html("Dev deploy role", "trusts main and the release workflow", "prop")))
    # 70 px below the account's top edge, so its title stays readable
    s.append(box("devdeploy", 1330, 830, 250, 110, "7 Deploy to dev", "Lambda versions behind a live alias; the PWA bundle to private S3", "amber", "prop", size=13))
    s.append(box("devsmoke", 1180, 980, 320, 240, "8 Dev smoke, synthetic",
                 "health returns the deployed sha<br>protected routes refuse a call with no token<br>the PWA loads with its security headers<br>"
                 "a synthetic user gets an SSE heartbeat<br>a synthetic import runs through the queue and the workflow<br>no paid calls", "teal", "prop", size=13))
    s.append({"id": "approve", "type": "diamond", "boundingBox": {"x": 880, "y": 920, "w": 220, "h": 170},
              "style": {"fill": {"type": "color", "color": "#FFF8E8"}, "stroke": {"color": BLUE, "width": 3, "style": "solid"}},
              "text": f'<p style="font-size:13px;text-align:center"><b>9 The owner starts the release with this sha256</b><br>{tag("sel")}</p>'})
    s.append({"id": "prod", "type": "namedContainer", "className": "AWSAccountAWS2024", "boundingBox": {"x": 100, "y": 760, "w": 720, "h": 490},
              "text": "prod account: your data"})
    s.append(box("proddeploy", 560, 790, 240, 120, "10 Deploy to prod", "the owner's release workflow, from main, into a separate prod role", "blue", "sel", size=13, extra=" (ARC-11)"))
    s.append(box("prodsmoke", 130, 830, 330, 150, "11 Prod smoke, read-only",
                 "health and the deployed sha; no-token refusals; the PWA's headers; an unauthenticated stream refused. No writes, no Claude, no market-data quota",
                 "teal", "prop", size=13))
    s.append(box("rollback", 130, 1050, 380, 180, "12 Keep, or roll back",
                 "a failure points the live alias back to the previous version; the previous PWA build is kept. Code rolls back, data does not: schema changes go in two steps",
                 "rose", "prop", size=13))
    icon(s, "alias", "ArchAWSLambdaAWS2024", 640, 1080, "Lambda live alias", "v(n) back to v(n-1)", "prop", lw=180)

    # right of the diamond's centre line, so the "route A" connector does not cross it
    s.append(heading("routes_h", 1020, 1320, W - 1020, "PROD RELEASES: A RELEASE WORKFLOW ONLY THE OWNER CAN START, ROUTE A (OWNER-SELECTED 3 NOV 2026, PL-11)", BLUE))
    s.append(note("enforce", 60, 1360, 640, 130,
                  "<b>How it holds on GitHub Free.</b> While the repo was private, GitHub Free could not hold a protected environment, so the check lives in AWS: "
                  "only the owner can start the workflow, and the prod role trusts only main and that workflow file. The repo is public since "
                  "24 Nov 2026; " + "whether route A stands, or a protected environment replaces or joins it, is open for the owner (MP-199).", 12))
    s.append(box("routeA", 740, 1360, 560, 130, "Route A, chosen: an owner-started release",
                 "free; the owner starts it with the sha256 as its input", "blue", "sel", size=14, width=3))
    for i, (title, detail) in enumerate(ROUTES_NOT):
        s.append(box(f"route{i}", 1340 + i * 370, 1360, 350, 130, title,
                     detail + f'<br><span style="font-size:11px;color:{MUTED}"><b>NOT CHOSEN</b></span>', "grey", None, size=13))
    s += legend("leg", 60, 1520, W - 60, "Box colours: blue the PR, the release route and prod, teal checks and smoke, amber build and deploy, rose rollback, grey routes not chosen.")
    yfrac = (rowy - 180) / ph
    L = [
        line("d1", "pr", (1, 0.5), "checks", (0, yfrac), "", BLUE),
        line("d2", "checks", (1, yfrac), "scan", (0, yfrac), "", TEAL),
        line("d3", "scan", (1, yfrac), "merge", (0, 0.5), "", AMBER),
        line("d4", "merge", (1, 0.5), "build", (0, 0.5), "", TEAL),
        line("d5", "build", (0.5, 1), "oidc", (0.5, 0), "on merge", AMBER, 0.45, "middle"),
        line("d6", "oidc", (0, 0.5), "role", (1, 0.5), "assume", AMBER),
        line("d7", "role", (0, 0.5), "devdeploy", (1, (851 - 830) / 110), "deploy", AMBER),
        line("d8", "devdeploy", (0.5, 1), "devsmoke", ((1455 - 1180) / 320, 0), "", TEAL),
        line("d9", "devsmoke", (0, 0.4), "approve", (1, 0.5), "", BLUE),
        line("d10", "approve", (0.5, 0), "proddeploy", (1, 0.5), "promote", BLUE, 0.5, "middle"),
        line("d11", "proddeploy", (0, 0.5), "prodsmoke", (1, 0.3), "", TEAL),
        line("d12", "prodsmoke", (0.5, 1), "rollback", ((295 - 130) / 380, 0), "if it fails", ROSE, 0.5, "middle"),
        line("d13", "rollback", (1, 0.5), "alias", (0, 0.5), "", ROSE),
        line("d14", "approve", (0.5, 1), "routeA", ((990 - 740) / 560, 0), "route A", BLUE, 0.55, "middle"),
    ]
    return {"id": "delivery", "title": "3 From a merge to prod", "shapes": s, "lines": L}


# --------------------------------------------------------------------------------------------- page 4: Apple testing

DEVICES = [  # id, x, y, w, h, label
    ("d_php", 120, 690, 70, 140, "iPhone portrait"),
    ("d_phl", 260, 725, 140, 70, "iPhone landscape"),
    ("d_pdp", 440, 680, 110, 150, "iPad portrait"),
    ("d_pdl", 600, 700, 160, 115, "iPad landscape"),
    ("d_split", 810, 700, 160, 115, "Split View width"),
    ("d_stage", 1010, 700, 160, 115, "Stage Manager window"),
]
A11Y = [
    ("Dynamic Type", "smallest to the largest accessibility size, set by xcrun simctl ui before a run"),
    ("Light, dark, Increase Contrast", "set per run; figures and the Confirm button stay whole"),
    ("Reduce Motion", "flows launch with motion stilled, so figures are not read mid-animation"),
    ("VoiceOver, by hand", "on a real device, on a free local build; a test runner cannot listen"),
]


def page_apple() -> dict:
    W = 2400
    s = header("p4", W, "Apple testing and the private beta",
               "Test on simulators on the owner's Mac for nothing. For now (owner, 3 Nov 2026) no paid Developer Program: free local builds that expire "
               "after 7 days, and no TestFlight, Apple push or Sign in with Apple until the Developer Program is bought (MP-179). No Apple app exists yet (PL-14). Phase PH-07.",
               "PROPOSED; no paid Developer Program for now")
    s.append(panel("mac", 60, 170, 1140, 980, "The owner's Mac: every simulator run costs £0"))
    s.append(box("ids", 90, 220, 550, 150, "Shared test IDs: mpp.*",
                 "one dictionary kept with the shared contracts; it generates data-testid for the PWA and Swift constants for .accessibilityIdentifier and the "
                 "shell's testID. IDs name the job, never a value: mpp.forecast.freshness, mpp.import.approve", "purple", "prop", size=14, width=3))
    s.append(box("webids", 780, 220, 390, 150, "Web: Playwright finds getByTestId", "the same journey reads the same on both doors (page 6)", "blue", "prop", dashed=True, size=14))
    s.append(box("stub", 90, 450, 270, 140, "Local FastAPI stub", "synthetic data; no live mode until the dev account exists", "amber", "prop", size=14))
    s.append(box("maestro", 450, 450, 340, 140, "Maestro CLI and Studio", "journeys end to end on simulators, by the id selector; free and open source", "teal", "prop", size=14, width=3))
    s.append(box("xcode", 850, 450, 320, 140, "Xcode", "XCTest and XCUITest; an accessibility audit on each main screen", "teal", "prop", size=14))
    s.append(heading("sim_h", 720, 640, 460, "SIMULATORS: LAYOUT FOLLOWS THE WIDTH", BLUE))
    for id_, x, y, w, h, lab in DEVICES:
        s.append({"id": id_, "type": "rectangle", "boundingBox": {"x": x, "y": y, "w": w, "h": h},
                  "style": {"fill": {"type": "color", "color": TINT["blue"]}, "stroke": {"color": INK, "width": 3, "style": "solid"}}, "text": " "})
        s.append(text(f"{id_}_t", x + w / 2 - 80, 840, 160, 50, f'<p style="font-size:12px;text-align:center"><b>{lab}</b><br>{tag("prop")}</p>'))
    s.append(text("sim_n", 90, 896, 1080, 50,
                  f'<p style="font-size:12px;text-align:left">Rotation in the middle of a journey: a half-typed question or an open import approval survives with no '
                  f'lost input {tag("prop")}. Which devices and versions are in the matrix, and the width bands: {tag("open", " (PL-14)")}.</p>'))
    for i, (title, detail) in enumerate(A11Y):
        s.append(box(f"a{i}", 90 + i * 272, 966, 256, 160, title, detail, "purple", "prop", size=14))

    s.append(box("every", 1280, 200, 330, 150, "Every pull request", "GitHub's Linux runner, in seconds: Maestro's flow syntax check and the test-ID check", "teal", "prop", size=14))
    s.append(box("fornow", 1650, 200, 690, 150, "For now: no paid Apple Developer Program",
                 "the owner's free Apple Account signs the builds. No TestFlight, Apple push or Sign in with Apple until the Developer Program is bought (MP-179); "
                 "phone notifications come through the web app's Web Push", "blue", "sel", size=14, width=3, extra=" (3 Nov 2026)"))
    s.append(box("local", 1280, 440, 300, 160, "Free local build from Xcode",
                 "installed on the owner's own devices over a cable or Wi-Fi; no App Store Connect key in GitHub, no Mac CI minutes", "amber", "sel", size=13))
    s.append(box("devices", 2010, 440, 330, 160, "The owner's iPhone and iPad", "real hardware: Face ID and VoiceOver, by hand; no Apple push on a free build", "blue", "sel", size=14))
    s.append(box("tf", 1280, 690, 300, 160, "TestFlight, later", "only once the owner pays: an owner-only internal group; each build lasts 90 days",
                 "rose", "open", dashed=True, size=13, extra=" (once the Developer Program is bought, MP-179)"))
    s.append(heading("clock_h", 1650, 640, 520, "EACH FREE BUILD'S CLOCK", ROSE))
    for i, (id_, mark, words, tone) in enumerate([("c0", "Day 0", "installed from Xcode; a reinstall restarts it", "amber"),
                                                  ("c7", "Day 7", "expired: rebuild and reinstall to open it", "rose")]):
        cx = 1720 + i * 260
        s.append({"id": id_, "type": "circle", "boundingBox": {"x": cx - 45, "y": 690, "w": 90, "h": 90},
                  "style": {"fill": {"type": "color", "color": TINT[tone]}, "stroke": {"color": STROKE[tone], "width": 2, "style": "solid"}},
                  "text": f'<p style="font-size:15px;text-align:center"><b>{mark}</b></p>'})
        s.append(text(f"{id_}_t", cx - 115, 786, 230, 70, f'<p style="font-size:12px;text-align:center">{words}<br>{tag("sel")}</p>'))
    icon(s, "cog", "ArchAmazonCognitoAWS2024", 2232, 690, "Cognito, dev account", "still decides who gets in", "open", lw=180, extra=" (PH-02)")
    # 13 px like the page, in 64 px rows: the longest cell wraps to two lines
    # Lucid table cells take plain text only; markup here renders literally.
    s.append(table("costs", 1280, 900, 1060, 384, [
        ["Item", "Price, checked 2 Nov 2026", "In MP's money", "Status"],
        ["Free local builds", "Free with an Apple Account", "£0", "OWNER-SELECTED"],
        ["Maestro CLI and Studio", "Free", "£0", "PROPOSED"],
        ["Apple Developer Program", "99 USD a membership year", "£95.04 in the month it is paid", "Not for now"],
        ["Maestro Cloud", "250 USD per device a month", "£240.00 a month", "Not proposed"],
        ["GitHub macOS runner", "0.062 USD a minute", "20 runs of 15 minutes: £17.86 a month", "Not proposed"],
    ], header_fill="#EFE7FD", fills={(1, 3): "#E6EEFF", (2, 3): "#FFF1D6", (3, 3): "#F5F7FC", (4, 3): "#F5F7FC", (5, 3): "#F5F7FC"}))
    s.append(note("warn", 1280, 1304, 1060, 96,
                  f'<b>Against the £100 ceiling</b> {tag("sel")}: nothing is paid for now. If the owner ever buys the membership, its fee month is the one '
                  f'month a year allowed above £100, for this fee only (owner, 2 Nov 2026): about £141.52 with Grow 55. TestFlight, Apple push and Sign in '
                  f'with Apple wait for it.'))
    s += legend("leg", 60, 1440, W - 60, "Box colours: purple shared IDs and accessibility, teal test runners, amber builds, rose Apple's paid service, blue the owner's choice and devices.")
    for sh in s[3:]:  # everything under the header 30 px lower, so the Mac panel's title tab clears the subtitle
        sh["boundingBox"]["y"] += 30
    L = [
        line("f1", "ids", (1, 0.5), "webids", (0, 0.5), "data-testid", PURPLE),
        line("f2", "ids", ((620 - 90) / 550, 1), "maestro", (0.5, 0), "Swift constants", PURPLE, 0.5, "middle"),
        line("f3", "maestro", (0, 0.5), "stub", (1, 0.5), "API", AMBER),
        line("f4", "maestro", (0.5, 1), "d_pdl", ((620 - 600) / 160, 0), "drives", TEAL, 0.45, "middle"),
        line("f5", "xcode", (1, 0.5), "local", (0, 0.5), "build", AMBER),
        line("f7", "local", (1, 0.5), "devices", (0, 0.5), "install", AMBER),
        line("f6", "local", (0.5, 1), "tf", (0.5, 0), "if the owner pays", ROSE, 0.5, "middle", dashed=True),
        line("f8", "devices", ((2268 - 2010) / 330, 1), "cog", (0.5, 0), "dev only", BLUE, 0.5, "middle"),
        line("c1", "c0", (1, 0.5), "c7", (0, 0.5), "", ROSE),
    ]
    return {"id": "apple", "title": "4 Apple testing and the private beta", "shapes": s, "lines": L}


# --------------------------------------------------------------------------------------------- page 5: perimeter

CONTROLS = [  # className, w, h, name
    ("ArchAWSIdentityandAccessManagementAWS2024", 64, 64, "IAM roles"),
    ("ResAWSIdentityAccessManagementPermissionsAWS2024", 52, 64, "Resource policies"),
    ("ArchAWSKeyManagementServiceAWS2024", 64, 64, "KMS key"),
    ("ArchAmazonSimpleStorageServiceAWS2024", 64, 64, "S3 Block Public Access"),
    ("ArchAWSCloudTrailAWS2024", 64, 64, "CloudTrail"),
    ("ResAWSIdentityAccessManagementIAMAccessAnalyzerAWS2024", 64, 64, "Access Analyzer"),
]


def page_perimeter() -> dict:
    W = 2400
    s = header("p5", W, "The perimeter, and the optional lockdown",
               "The perimeter is built from who may act on what, not from where traffic flows, and almost all of it is free. The owner chose N0, "
               "no VPC, in Virginia (us-east-1) (MP-29). A VPC lockdown is optional, off by default and decided late, at PH-08.",
               "N0 OWNER-SELECTED; controls PROPOSED; lockdown OPEN")
    s.append(band("base", 60, 160, 1130, 900, "teal", dashed=False))
    s.append(heading("base_h", 80, 172, 900, "THE BASELINE: N0, NO VPC, ALMOST ALL FREE", TEAL, 15))
    s.append(box("scp", 90, 220, 340, 130, "Cost-guard SCP", "denies NAT, interface endpoints, VPNs, load balancers, SageMaker endpoints and GPUs until an ADR lifts it",
                 "teal", "sel", size=13, width=3))
    icon(s, "org", "ArchAWSOrganizationsAWS2024", 625 - 36, 230, "AWS Organizations", "all features, with the cost-guard SCP", "sel", lw=230)
    # no tag nested in the detail: Lucid shrinks a span that holds another sized span
    s.append(box("rcp", 820, 220, 340, 76, "Not adopted (owner, 3 Nov 2026)",
                 "resource control policies and the Region allowlist SCP", "grey", dashed=True, size=13))
    # its own box, so nothing proposed reads as not adopted (MP-20 round 2, R2-d9); teal, as part of the baseline
    s.append(box("scp2", 820, 310, 340, 92, "Proposed alongside the cost guard",
                 "two more SCPs: never stop CloudTrail, never leave the organisation", "teal", "prop", dashed=True, size=13))
    for acct, ax, words, st in (("dev", 90, "dev account (ARC-11)", "sel"), ("prod", 640, "prod account (ARC-11)", "sel")):
        s.append({"id": acct, "type": "namedContainer", "className": "AWSAccountAWS2024", "boundingBox": {"x": ax, "y": 420, "w": 520, "h": 430},
                  "text": f"{words}: OWNER-SELECTED, nothing deployed"})
        for k, (cls, w, h, name) in enumerate(CONTROLS):
            r, c = divmod(k, 3)
            cx, top = ax + 95 + c * 165, 505 + r * 185  # below the account title, which wraps to two lines
            st_k = "prop"
            s.append({"id": f"{acct}{k}", "type": "namedShape", "className": cls, "boundingBox": {"x": cx - w / 2, "y": top + (64 - h) / 2, "w": w, "h": h}, "text": " "})
            s.append(text(f"{acct}{k}_t", cx - 78, top + 70, 156, 56, f'<p style="font-size:12px;text-align:center"><b>{name}</b><br>{tag(st_k)}</p>'))
    s.append(note("perim", 90, 880, 1070, 160,
                  f'<b>Data perimeter policies</b> {tag("prop")}: aws:PrincipalOrgID and aws:ResourceOrgID conditions in each bucket, key and queue policy build the '
                  f'identity wall (only our people) and the resource wall (only our things); with no RCPs, each resource policy carries them itself. The network '
                  f'wall, aws:SourceVpce, needs a VPC: it is the main thing a lockdown adds.<br>One role per Lambda, each Claude route worker included; secrets in SSM '
                  f'Parameter Store SecureString {tag("sel")}; one customer managed KMS key per account; S3 Block Public Access on at account level; one CloudTrail '
                  f'trail per account to encrypted S3; only the external access analyzer, which is free.'))

    s.append(band("lock", 1230, 160, W - 1250, 900, "amber"))
    s.append(heading("lock_h", 1250, 172, 1000, "THE OPTIONAL LOCKDOWN: OFF BY DEFAULT, DECIDED AT PH-08", AMBER, 15))
    s.append({"id": "vpc", "type": "namedContainer", "className": "VirtualPrivateCloudVPCAWS2024", "boundingBox": {"x": 1260, "y": 220, "w": 620, "h": 810},
              "text": "VPC: optional, not selected"})
    s.append({"id": "subA", "type": "namedContainer", "className": "PrivateSubnetAWS2024", "boundingBox": {"x": 1290, "y": 280, "w": 300, "h": 240}, "text": "Private subnet, zone A"})
    s.append({"id": "subB", "type": "namedContainer", "className": "PrivateSubnetAWS2024", "boundingBox": {"x": 1290, "y": 560, "w": 345, "h": 240}, "text": "Private subnet, zone B (prod)"})
    s.append({"id": "pub", "type": "namedContainer", "className": "PublicSubnetAWS2024", "boundingBox": {"x": 1640, "y": 280, "w": 220, "h": 240}, "text": "Public subnet"})
    icon(s, "lamA", "ArchAWSLambdaAWS2024", 1440 - 36, 340, "Lambdas", "every one, from L2", "open", lw=200)
    icon(s, "lamB", "ArchAWSLambdaAWS2024", 1440 - 36, 700, "Lambdas", "a private job only, at L1", "open", "above", lw=200)
    icon(s, "nat", "ResAmazonVPCNATGatewayAWS2024", 1750 - 36, 340, "NAT", "instance at L2; gateway at L3, L4", "open", lw=200)
    icon(s, "gwep", "ResAmazonVPCEndpointsAWS2024", 1750 - 36, 600, "Gateway endpoints", "S3 and DynamoDB, free", "open", lw=200)
    icon(s, "ifep", "ResAmazonVPCEndpointsAWS2024", 1750 - 36, 830, "Interface endpoints", "SSM, SQS, STS, KMS: L4", "open", lw=220)
    # 110 px clear of the public subnet, so the Claude and prices labels sit between the two
    s.append(heading("out_h", 1970, 220, 350, "OUTSIDE ANY VPC"))
    s.append(box("anth", 1970, 260, 350, 90, "Anthropic API", "no VPC endpoint reaches it", "rose", "sel", dashed=True, size=14))
    s.append(box("mkt", 1970, 380, 350, 90, "Market data: Yahoo, Twelve Data", "no endpoint either, so a NAT", "amber", "sel", dashed=True, size=14))
    icon(s, "s3", "ArchAmazonSimpleStorageServiceAWS2024", 1990, 510, "S3", "regional service", "sel", "right", lw=200)
    icon(s, "ddb", "ArchAmazonDynamoDBAWS2024", 1990, 630, "DynamoDB", "regional service", "sel", "right", lw=200)
    s.append(note("never", 1970, 830, 350, 180,
                  "<b>Never inside a customer VPC,</b> whatever the Lambdas do: API Gateway, Cognito, CloudFront, DynamoDB and S3.<br><b>A VPN is not a sign-in:</b> "
                  "every request is still signed in through Cognito and checked by the API (PL-10).", 12))

    s.append(table("opts", 60, 1100, W - 60, 400, [  # 80 px rows: "What it adds" wraps to three lines
        ["Step", "What it adds", "Option", "Dev 1 zone + prod 2 zones, Virginia", "London, not chosen", "Status"],
        ["L1 Private jobs only", "Two private subnets, free S3 and DynamoDB gateway endpoints, no internet route", "N1", "$0 (£0)", "$0 (£0)", "OPEN: no N1 scope today"],
        ["L2 Lean lockdown", "Every Lambda in the VPC; a t4g.nano NAT instance per zone, run and patched by us", "N1-E", "$22.07 (£21.19)", "$23.47 (£22.53)", "OPEN"],
        ["L3 Managed lockdown", "As L2, with a managed NAT Gateway per zone", "N1-E", "$109.77 (£105.38)", "$120.75 (£115.92)", "OPEN"],
        ["L4 Strict lockdown", "As L3, plus four interface endpoints: SSM, SQS, STS, KMS", "N1-E", "$197.43 (£189.53)", "$217.17 (£208.48)", "OPEN"],
    ], header_fill="#FFF1D6", fills={(1, 5): "#FDE7EE", (2, 5): "#FDE7EE", (3, 5): "#FDE7EE", (4, 5): "#FDE7EE"}))
    s.append(note("budget", 60, 1520, 1130, 110,
                  "<b>Against the budget.</b> The baseline AWS run rate for both accounts is £18.64 ($19.42) in Virginia, leaving £3.36 of the £22 AWS share, so every paid "
                  "step overruns it, and the cost-guard SCP denies NAT and interface endpoints until an ADR lifts it. L3 and L4 alone pass the £100 ceiling. "
                  "Extra cost a month, from AWS price lists checked 2 Nov 2026, at £0.80 to the dollar and 20% tax; 5 GB a month through the NAT in prod, 1 GB in dev."))
    s.append(box("rec", 1230, 1520, W - 1230, 110, "Chosen: the baseline, with no VPC (N0)",
                 "no VPC for any Lambda; SageMaker training with network isolation; no NAT, interface endpoint, proxy or VPN. The lockdown is decided at PH-08; any paid step needs a revised cost model and an ADR",
                 "teal", "sel", size=14, width=3, extra=" (3 Nov 2026)"))
    s += legend("leg", 60, 1670, W - 60, "Teal: the baseline. Amber, dashed: the optional lockdown. Rose: outside AWS. Nothing on this page is deployed.")
    L = [
        line("n1", "lamA", (1, 0.5), "nat", (0, 0.5), "L2+", ROSE),
        line("n2", "nat", (1, 0.3), "anth", (0, 0.5), "Claude", ROSE, 0.7),
        line("n3", "nat", (1, 0.7), "mkt", (0, 0.5), "prices", AMBER, 0.7),
        line("n4", "lamB", (1, 0.5), "gwep", (0, 0.5), "L1", TEAL),
        line("n5", "gwep", (1, 0.3), "s3", (0, 0.5), "", TEAL),
        line("n6", "gwep", (1, 0.7), "ddb", (0, 0.5), "", TEAL),
        line("n7", "lamB", (1, 1), "ifep", (0, 0.5), "L4", AMBER, 0.5, dashed=True),
        line("o1", "org", (0, 0.5), "scp", (1, 0.5), "", TEAL),
    ]
    return {"id": "perimeter", "title": "5 The perimeter, and the optional lockdown", "shapes": s, "lines": L}


# --------------------------------------------------------------------------------------------- page 6: web quality

STATES = [
    ("Loading", "while a reply is held, the as-of time, staleness label and provider status of every figure already shown stay visible and in the ARIA tree"),
    ("Stale", "the stale label is text in the ARIA snapshot, not only a colour"),
    ("Provider down", "the page says which provider and since when; a forecast shows as unavailable, never as a blank or a spinner"),
    ("Forecast states", "disagreement, insufficient history, no clear view, disabled, corrected outcome and cost-paused each render with their reason (FC-16)"),
    ("Busy regions", "aria-busy is never set on a region that holds a risk or a freshness label"),
]
ROAD6 = [
    ("Today", "web/ does not exist and no screen is designed", "grey", None),
    ("Architecture sign-off", "owner gate 1", "rose", "open"),
    ("UX design and approval", "owner gates 2 and 3", "rose", "open"),
    ("Permission to build", "owner gate 4", "rose", "open"),
    ("PH-06 builds web/", "lint, type checks and unit tests on every PR touching web/", "blue", "prop"),
    ("The browser suite", "locally first; in CI on PRs touching web/, or only on request", "amber", "open"),
    ("Before a release", "keyboard-only, VoiceOver and real Safari, by hand", "teal", "prop"),
]


def page_web() -> dict:
    W = 2400
    s = header("p6", W, "Web quality on every screen",
               "Four checks in one Playwright session, and a test for MP's own rule: never hide risk, staleness or a provider's status behind a loading "
               "state. web/ does not exist yet, so all of this waits for PH-06. WCAG 2.2 Level AA is the owner-selected standard for web, iPhone and iPad (3 Nov 2026).",
               "WCAG 2.2 AA OWNER-SELECTED; checks PROPOSED, once web/ exists (PH-06)")
    # 240 wide, so the "pages" and "replies" labels clear both ends of their 120 px connectors
    s.append(box("app", 60, 250, 240, 130, "The built SvelteKit app", "static, from web/; not built yet", "blue", "prop", size=14))
    s.append(box("stub", 60, 450, 240, 160, "Local stub API", "synthetic data; Playwright holds or replaces its replies to make each state", "amber", "prop", size=14))
    s.append(box("pw", 420, 220, 360, 460, "One Playwright session",
                 "Chromium and WebKit. Playwright's WebKit is close to Safari, not the same, so Safari is checked by hand.<br><br>A phone and a laptop width, "
                 "plus the 320 CSS pixel reflow check; the real breakpoints come with the design.<br><br>Elements found by the shared mpp.* test IDs, the same "
                 "dictionary the Apple app uses.", "purple", "prop", size=15, width=3))
    checks = [
        ("Journeys", "a broken flow, a dead link, a lost state", "teal", "prop"),
        ("ARIA snapshots", "toMatchAriaSnapshot against .aria.yml files in the repo: a button losing its name, a heading changing level", "teal", "prop"),
        ("axe-core rules", "@axe-core/playwright with the WCAG 2.0, 2.1 and 2.2 A and AA tags; any violation fails the test", "teal", "prop"),
        ("Screenshot comparison", "toHaveScreenshot, baselines made and checked in one pinned Linux image; the tool is still to choose", "rose", "open"),
    ]
    cy = [220, 340, 460, 580]
    for i, (title, detail, tone, st) in enumerate(checks):
        s.append(box(f"ck{i}", 860, cy[i], 440, 100, title, detail, tone, st, size=14))
    # the standard is the owner's (decision log, 3 Nov 2026, MP-177): its status word in the status key's blue, colour only
    s.append(heading("wcag_h", 1380, 186, 960, f'WCAG 2.2 LEVEL AA, <span style="color:{BLUE}">OWNER-SELECTED</span>: WHAT IT ADDS THAT MATTERS TO MP', PURPLE))
    s.append(table("wcag", 1380, 220, 960, 480, [  # 80 px rows: the longest "Where MP meets it" cells wrap to three lines
        ["Criterion", "Where MP meets it", "Checked by"],
        ["2.4.11 Focus Not Obscured (Minimum)", "a sticky header, the chat panel or the cost bar never covers the focused control", "a Playwright test per main screen"],
        ["2.5.7 Dragging Movements", "scrubbing a forecast fan has a non-drag way in: buttons or a table", "a Playwright test, then by hand"],
        ["2.5.8 Target Size (Minimum)", "approve, reject and the horizon tabs are at least 24 by 24 CSS pixels", "a Playwright size check"],
        ["3.3.7 Redundant Entry", "an import correction never asks again for what was already given", "by hand, per journey"],
        ["3.3.8 Accessible Authentication (Minimum)", "passkeys and Apple or Google sign-in, and step-up, with no memory or puzzle test", "by hand, per journey"],
    ], header_fill="#EFE7FD"))
    s.append(text("axe_n", 1380, 706, 960, 50,
                  f'<p style="font-size:12px;color:{MUTED}">An ARIA snapshot is a diff against the last approved tree, not a WCAG test. axe finds on average 57% '
                  f'of WCAG issues by its makers\' count; the rest need people.</p>'))

    # the spinner rule
    s.append(heading("spin_h", 60, 716, W - 60, "THE SPINNER RULE, AS A TEST (AGENTS.md): A TEST FAILS WHEN A SPINNER IS THE ONLY THING WHERE A RISK, A FRESHNESS LABEL OR A PROVIDER STATUS SHOULD BE", INK))
    for pid, x, verdict, tone in (("pass", 60, "PASS: the reply is held, the labels stay", "teal"), ("fail", 560, "FAIL: a spinner is all there is", "rose")):
        s.append({"id": pid, "type": "rectangleContainer", "boundingBox": {"x": x, "y": 760, "w": 460, "h": 300},
                  "style": {"fill": {"type": "color", "color": "#FFFFFF"}, "stroke": {"color": STROKE[tone], "width": 3, "style": "solid"}}})
        s.append(text(f"{pid}_v", x + 16, 768, 428, 30, f'<p style="font-size:14px;color:{STROKE[tone]}"><b>{verdict}</b></p>'))
        s.append({"id": f"{pid}_spin", "type": "circle", "boundingBox": {"x": x + 30, "y": 830, "w": 90, "h": 90},
                  "style": {"fill": {"type": "color", "color": "#F5F7FC"}, "stroke": {"color": "#A9B7CD", "width": 4, "style": "dashed"}},
                  "text": '<p style="font-size:12px;text-align:center">loading</p>'})
    for k, (words, tone) in enumerate((("As of: the last good time", "blue"), ("STALE, in words", "amber"), ("Provider down: which, since when", "rose"))):
        s.append(box(f"pass_c{k}", 200, 820 + k * 72, 300, 58, words, "", tone, None, size=13))
    s.append(text("fail_x", 700, 840, 300, 120, f'<p style="font-size:13px;text-align:left;color:{MUTED}">No as-of time, no stale label, no provider status: '
                                                f'the owner cannot tell an old figure from a fresh one.</p>'))
    s.append(text("mock_n", 60, 1066, 960, 30, f'<p style="font-size:11px;color:{MUTED}">Sketches of the rule, not screen designs: no screen is designed yet.</p>'))
    for i, (title, detail) in enumerate(STATES):
        s.append(box(f"st{i}", 1100 + i * 250, 760, 236, 300, title, detail, ("blue", "amber", "rose", "purple", "teal")[i], "prop", size=14))

    # when it runs
    s.append(heading("road_h", 60, 1116, W - 60, "WHEN IT RUNS: NOTHING BEFORE THE OWNER'S FOUR GATES AND PH-06", INK))
    for i, (title, detail, tone, st) in enumerate(ROAD6):
        s.append(box(f"r{i}", 60 + i * 335, 1156, 285, 130, title, detail, tone, st, size=14, width=3 if i == 0 else 2))
    s.append(table("shots", 60, 1320, 1400, 264, [  # 66 px rows: the Argos Pro price needs two clear lines
        ["Screenshot option", "Price, checked 2 Nov 2026", "Status"],
        ["Playwright's own toHaveScreenshot", "Free; baselines live in the repo", "PROPOSED, recommended"],
        ["Argos Hobby", "Free for 5,000 captures a month; screenshots leave for a third party, so synthetic data only", "OPEN"],
        ["Argos Pro", "100 USD a month for 35,000 captures: £96.00, nearly the whole ceiling", "Not proposed"],
    ], header_fill="#EFE7FD", fills={(1, 2): "#FFF1D6", (2, 2): "#FDE7EE", (3, 2): "#F5F7FC"}))
    s.append(note("ci", 1500, 1320, W - 1500, 264,
                  "<b>Running it in CI.</b> On GitHub's Linux runner at 0.006 USD a minute, a 5-minute run costs £0.03 and 40 runs £1.15 a month, inside the "
                  "12 USD of compute GitHub Free includes, which the nine existing checks share. Each release also gets a keyboard-only pass and a VoiceOver "
                  "pass in Safari, by hand."))
    s += legend("leg", 60, 1624, W - 60, "Grey: today's fact. Teal: checks. Purple: the session and WCAG. Rose: owner gates and open choices.")
    for sh in s:  # everything from the spinner rule down sits 60 px lower, under the taller WCAG table
        if sh["boundingBox"]["y"] >= 710:
            sh["boundingBox"]["y"] += 60
    L = [
        line("w1", "app", (1, 0.5), "pw", (0, (315 - 220) / 460), "pages", BLUE),
        line("w2", "stub", (1, 0.5), "pw", (0, (525 - 220) / 460), "replies", AMBER),
    ]
    for i in range(4):
        L.append(line(f"wc{i}", "pw", (1, (cy[i] + 50 - 220) / 460), f"ck{i}", (0, 0.5), "", PURPLE))
    for i in range(len(ROAD6) - 1):
        L.append(line(f"wr{i}", f"r{i}", (1, 0.5), f"r{i + 1}", (0, 0.5), "", MUTED))
    return {"id": "web", "title": "6 Web quality on every screen", "shapes": s, "lines": L}


# --------------------------------------------------------------------------------------------- output (as MP-34)

_TOKEN = re.compile(r"(<[^>]+>)")


def split_paragraphs(html: str) -> str:
    """Turn every <br> inside a <p style="..."> into a new paragraph with the same style.

    Lucid applies text-align (and the paragraph's other styles) per paragraph and treats a <br> as a paragraph
    break, so without this only the first line of a left-aligned block stays left-aligned. Inline tags open at
    the break (a <span>, a <b>) are closed and reopened, so the HTML stays well formed. A run of breaks keeps
    one empty paragraph as the spacer, written as <p ...><br></p>.
    """
    out: list[str] = []
    style = None  # the open <p>'s opening tag
    stack: list[str] = []  # inline tags open inside it
    breaks = 0  # breaks since the last visible text
    for tok in _TOKEN.split(html):
        if not tok:
            continue
        low = tok.lower()
        if low.startswith("<p ") or low == "<p>":
            style, stack, breaks = tok, [], 0
            out.append(tok)
        elif low == "</p>":
            style, stack = None, []
            out.append(tok)
        elif low in ("<br>", "<br/>", "<br />") and style:
            breaks += 1
            if breaks > 2:  # one spacer paragraph is enough
                continue
            out.extend(f"</{t[1:].split()[0].rstrip('>')}>" for t in reversed(stack))
            out.append("</p>" + style)
            out.extend(stack)
        elif tok.startswith("</"):
            if stack:
                stack.pop()
            out.append(tok)
        elif tok.startswith("<"):
            stack.append(tok)
            out.append(tok)
        else:
            if tok.strip():
                breaks = 0
            out.append(tok)
    joined = "".join(out)

    def spacer(m: re.Match) -> str:  # a paragraph with no text keeps its line as <p ...><br></p>
        return m.group(1) + "<br></p>" if not _TOKEN.sub("", m.group(2)).strip() else m.group(0)

    return re.sub(r'(<p style="[^"]*">)(.*?)</p>', spacer, joined)



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

    def fix(i: str) -> str:
        return i if i.startswith(pre) else pre + i

    for sh in page["shapes"]:
        sh["id"] = fix(sh["id"])
        if isinstance(sh.get("text"), str):
            sh["text"] = split_paragraphs(sh["text"])
    for ln in page["lines"]:
        ln["id"] = fix(ln["id"])
        for end in ("endpoint1", "endpoint2"):
            if "shapeId" in ln[end]:
                ln[end]["shapeId"] = fix(ln[end]["shapeId"])
    return page


PAGES = [page_stack, page_trace, page_delivery, page_apple, page_perimeter, page_web]

if __name__ == "__main__":
    import sys

    if sys.argv[1:] == ["--title"]:
        print(DOC_TITLE)
        raise SystemExit
    chosen = list(enumerate(PAGES, 1))
    if len(sys.argv) > 2 and sys.argv[1] == "--page":  # one page on its own, for validating in small pieces
        chosen = [chosen[int(sys.argv[2]) - 1]]
    doc = {"version": 1, "pages": [scoped(p(), n) for n, p in chosen]}
    print(json.dumps(compact(doc), separators=(",", ":"), ensure_ascii=False))
