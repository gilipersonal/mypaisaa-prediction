"""Write the Lucid Standard Import JSON for "MP: the system on AWS" (two pages).

    python3 docs/diagrams/mp-system-2026-11-02/lucid_spec.py > spec.json

Page 1 draws the owner-selected directions (ARC-01 to ARC-12) on native AWS 2024 shapes with
numbered flows. Page 2 is the authority matrix: who may read, propose, write, publish, promote
and trade. Nothing on either page is deployed.
"""

from __future__ import annotations

import json

INK, MUTED = "#17243C", "#526078"
BLUE, AMBER, TEAL, PURPLE, ROSE = "#2459B8", "#966012", "#087D78", "#6840B1", "#B23C67"
TINT = {"blue": "#E6EEFF", "amber": "#FFF1D6", "rose": "#FDE7EE", "teal": "#DCF5EF"}
ICON = 72
LABEL_AT = {"l3": 0.65, "l17": 0.25, "l10": 0.6}

# id: (AWS 2024 class, x, y, name, role, label side)
ICONS = {
    "cf": ("ArchAmazonCloudFrontAWS2024", 460, 240, "CloudFront", "serves the PWA", "below"),
    "s3w": ("ArchAmazonSimpleStorageServiceAWS2024", 700, 240, "S3 (web)", "static app files", "below"),
    "cw": ("ArchAmazonCloudWatchAWS2024", 1000, 240, "CloudWatch + X-Ray", "logs, metrics, traces", "below"),
    "ct": ("ArchAWSCloudTrailAWS2024", 1260, 240, "CloudTrail", "every AWS API call", "below"),
    "sec": ("ArchAWSSecretsManagerAWS2024", 1500, 240, "Secrets Manager", "provider and Claude keys", "below"),
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

BOXES = {  # id: (x, y, w, h, title, detail, tint, stroke, dashed)
    "web": (60, 240, 220, 90, "Web app", "SvelteKit PWA", "blue", BLUE, False),
    "app": (60, 560, 220, 90, "iPhone and iPad", "SwiftUI + React Native shell", "blue", BLUE, False),
    "mkt": (60, 1050, 220, 90, "Market data", "Yahoo + Twelve Data Grow", "amber", AMBER, True),
    "anth": (1980, 820, 220, 90, "Anthropic API", "Claude models (not Bedrock)", "rose", ROSE, True),
}

# (id, from, from position, to, to position, label, colour, line type)
LINES = [
    ("l1", "web", (1, 0.3), "cf", (0, 0.5), "1 load", BLUE, "straight"),
    ("l2", "cf", (1, 0.5), "s3w", (0, 0.5), "origin", BLUE, "straight"),
    ("l3", "web", (1, 0.8), "cog", (0, 0.5), "2 sign in", ROSE, "straight"),
    ("l4", "app", (1, 0.5), "apigw", (0, 0.5), "3 HTTPS, SSE", BLUE, "straight"),
    ("l5", "apigw", (1, 0.5), "api", (0, 0.5), "4 invoke", BLUE, "straight"),
    ("l6", "api", (1, 0.5), "ddb", (0, 0.5), "5 read the published ledger", TEAL, "straight"),
    ("l7", "sched", (1, 0.5), "sqs", (0, 0.5), "6 enqueue", AMBER, "straight"),
    ("l8", "sqs", (1, 0.5), "dur", (0, 0.5), "7 start", AMBER, "straight"),
    ("l9", "dur", (1, 0.5), "claude", (0, 0.5), "8 extract, explain", ROSE, "straight"),
    ("l10", "claude", (1, 0.5), "anth", (0, 0.5), "9 bounded calls, capped spend", ROSE, "straight"),
    ("l11", "sqs", (0.5, 1), "work", (0.5, 0), "10 fetch", AMBER, "straight"),
    ("l12", "work", (0, 0.5), "mkt", (1, 0.5), "rights-checked pulls", AMBER, "straight"),
    ("l13", "work", (1, 0.5), "s3p", (0, 0.5), "prices", AMBER, "straight"),
    ("l14", "dur", (0.5, 1), "s3p", (0.5, 0), "11 evidence", AMBER, "straight"),
    ("l15", "dur", (1, 1), "sm", (0, 0), "12 train", PURPLE, "straight"),
    ("l16", "sm", (1, 0.5), "inf", (0, 0.5), "approved", PURPLE, "straight"),
    ("l17", "inf", (0.5, 0), "ddb", (0.5, 1), "13 store forecasts", PURPLE, "straight"),
    ("l18", "dur", (1, 0.25), "ddb", (0, 1), "14 commit after approval", TEAL, "straight"),
]


def text(id_: str, x: float, y: float, w: float, h: float, html: str) -> dict:
    return {"id": id_, "type": "text", "boundingBox": {"x": x, "y": y, "w": w, "h": h}, "text": html}


def label_html(name: str, role: str, align: str = "center") -> str:
    return (
        f'<p style="font-size:13px;text-align:{align};color:{INK}"><b>{name}</b><br>'
        f'<span style="font-size:11px;color:{MUTED}">{role}</span></p>'
    )


def page_system() -> dict:
    shapes: list[dict] = [
        text("title", 60, 40, 1700, 48, f'<p style="font-size:28px;color:{INK}"><b>Mypaisaa Prediction: the system on AWS</b></p>'),
        text("subtitle", 60, 92, 1700, 30, f'<p style="font-size:14px;color:{MUTED}">Owner-selected directions ARC-01 to ARC-12, 2 November 2026. Proposed topology: nothing here is deployed. Numbers follow the flows.</p>'),
        {"id": "cloud", "type": "namedContainer", "className": "AWSCloudAWS2024", "boundingBox": {"x": 340, "y": 150, "w": 1580, "h": 1150}, "text": "AWS Cloud"},
        {"id": "acct", "type": "namedContainer", "className": "AWSAccountAWS2024", "boundingBox": {"x": 370, "y": 190, "w": 1520, "h": 1090},
         "text": "Workload account: prod. Dev is a separate account of the same shape (ARC-11)"},
    ]
    for id_, (x, y, w, h, title, detail, tint, stroke, dashed) in BOXES.items():
        shapes.append({
            "id": id_, "type": "rectangle", "boundingBox": {"x": x, "y": y, "w": w, "h": h},
            "style": {"fill": {"type": "color", "color": TINT[tint]}, "stroke": {"color": stroke, "width": 2, "style": "dashed" if dashed else "solid"}},
            "text": f'<p style="font-size:15px;text-align:center;color:{INK}"><b>{title}</b><br><span style="font-size:12px;color:{MUTED}">{detail}</span></p>',
        })
    shapes.append(text("outside", 60, 196, 220, 30, f'<p style="font-size:12px;color:{MUTED}"><b>OUTSIDE AWS</b></p>'))
    for id_, (cls, x, y, name, role, side) in ICONS.items():
        # A blank text stops the AWS shape printing its catalogue name under the icon.
        shapes.append({"id": id_, "type": "namedShape", "className": cls, "boundingBox": {"x": x, "y": y, "w": ICON, "h": ICON}, "text": " "})
        if side == "below":
            shapes.append(text(f"{id_}_t", x + ICON / 2 - 100, y + ICON + 6, 200, 48, label_html(name, role)))
        elif side == "above":
            shapes.append(text(f"{id_}_t", x + ICON / 2 - 100, y - 54, 200, 48, label_html(name, role)))
        else:
            shapes.append(text(f"{id_}_t", x + ICON + 14, y + 12, 190, 44, label_html(name, role, "left")))
    shapes.append({
        "id": "legend", "type": "rectangle", "boundingBox": {"x": 340, "y": 1330, "w": 1580, "h": 96},
        "style": {"fill": {"type": "color", "color": "#F5F7FC"}, "stroke": {"color": "#A9B7CD", "width": 1, "style": "solid"}},
        "text": (f'<p style="font-size:13px;text-align:left;color:{INK}"><b>Status.</b> Every service is Owner-selected, not built or deployed; '
                 'only the FastAPI health and SSE starter runs, on a laptop. <b>Guardrails.</b> Claude workers read through allowlisted tools and '
                 'cannot write the ledger, publish a forecast, promote a model or trade. One controlled writer commits to DynamoDB, and only after '
                 'the owner approves the exact change. Forecasts are frozen at the data cutoff and scored only after their horizon. '
                 '<b>Colours:</b> blue serve and ask, amber data and work, rose Claude, purple models, teal records.</p>'),
    })
    lines = []
    for id_, a, pa, b, pb, label, colour, kind in LINES:
        lines.append({
            "id": id_, "lineType": kind,
            "endpoint1": {"type": "shapeEndpoint", "style": "none", "shapeId": a, "position": {"x": pa[0], "y": pa[1]}},
            "endpoint2": {"type": "shapeEndpoint", "style": "arrow", "shapeId": b, "position": {"x": pb[0], "y": pb[1]}},
            "stroke": {"color": colour, "width": 2, "style": "solid"},
            "text": [{"text": f'<span style="font-size:11px;color:{colour}">{label}</span>', "position": LABEL_AT.get(id_, 0.5), "side": "top"}],
        })
    return {"id": "system", "title": "1 The system on AWS", "shapes": shapes, "lines": lines}


AUTHORITY = [
    ["", "Read evidence", "Propose", "Write the ledger", "Publish a forecast", "Promote a model", "Trade"],
    ["Claude route workers", "allowlisted, read-only tools", "drafts, extractions, explanations", "no", "no", "no", "no"],
    ["Forecast models", "point-in-time data only", "forecasts and challengers", "no", "only through the workflow, frozen at cutoff", "no", "no"],
    ["Durable workflows", "yes", "import proposals", "through the controlled writer, after approval", "issue the daily forecast", "no", "no"],
    ["Controlled writer", "the approved change", "no", "yes: the only writer", "no", "no", "no"],
    ["Owner (you)", "everything", "corrections", "approves each exact commit", "no", "approves, with evidence", "no: MP has no broker access"],
]


def page_authority() -> dict:
    rows, cols = len(AUTHORITY), len(AUTHORITY[0])
    cells = []
    for r, row in enumerate(AUTHORITY):
        for c, value in enumerate(row):
            fill = "#DCE4F2" if r == 0 else ("#EEF2F8" if c == 0 else ("#FDE7EE" if value.startswith("no") else "#FFFFFF"))
            cells.append({"xPosition": c, "yPosition": r, "text": value, "style": {"fill": {"type": "color", "color": fill}}})
    return {
        "id": "authority", "title": "2 Who may do what",
        "shapes": [
            text("a_title", 60, 40, 1700, 48, f'<p style="font-size:28px;color:{INK}"><b>Who may do what</b></p>'),
            text("a_sub", 60, 92, 1700, 30, f'<p style="font-size:14px;color:{MUTED}">Authority is enforced in code, not asked of a prompt. Rose cells are refusals. Proposed, from AGENTS.md and ARC-02, ARC-05, ARC-06 and ARC-08.</p>'),
            {"id": "matrix", "type": "table", "boundingBox": {"x": 60, "y": 150, "w": 1820, "h": 480}, "rowCount": rows, "colCount": cols, "cells": cells},
        ],
        "lines": [],
    }


if __name__ == "__main__":
    print(json.dumps({"version": 1, "pages": [page_system(), page_authority()]}, separators=(",", ":")))
