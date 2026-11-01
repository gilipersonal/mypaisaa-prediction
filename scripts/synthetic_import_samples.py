# /// script
# requires-python = ">=3.12"
# dependencies = ["reportlab==4.4.9", "pypdf==6.10.0", "Pillow==12.3.0"]
# ///
"""Offline import/document and operations fixtures; never reads private holdings."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
from decimal import Decimal
from html import escape
from pathlib import Path

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
LABEL = "SYNTHETIC TEST DATA - NOT A BROKER STATEMENT OR OBSERVED MARKET HISTORY"
SOURCE_FILES = ("accounts.json", "positions.json", "ledger.json", "instruments.json")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def save(path: Path, data: object) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False, allow_nan=False) + "\n")


def load_source(source: Path, environment: str) -> dict:
    require(environment in {"local", "dev"}, "Only local/dev synthetic fixtures are allowed")
    manifest = json.loads((source / "manifest.json").read_text())
    require(manifest["dataset_id"] == "mypaisaa-synthetic-v1", "Unknown source fixture")
    require(manifest["environment"] == environment, "Source/environment mismatch")
    require(manifest["observations_are_synthetic"] is True, "Source is not synthetic")
    data = {}
    for name in SOURCE_FILES:
        require(digest(source / name) == manifest["sha256"][name], f"Changed source: {name}")
        data[name] = json.loads((source / name).read_text())
    ids = {row["instrument_id"] for row in data["instruments.json"]}
    for name in ("accounts.json", "positions.json", "ledger.json"):
        require(all(r.get("is_synthetic") is True for r in data[name]), "Unlabelled record")
    require(all(p["instrument_id"] in ids for p in data["positions.json"]), "Unknown instrument")
    data["manifest"] = manifest
    return data


def expected_statements(data: dict, environment: str) -> list[dict]:
    instruments = {r["instrument_id"]: r for r in data["instruments.json"]}
    statements = []
    for page, account in enumerate(data["accounts.json"], 1):
        positions = [r for r in data["positions.json"] if r["account_id"] == account["account_id"]]
        events = [r for r in data["ledger.json"] if r["account_id"] == account["account_id"]]
        require(bool(positions), "Account has no positions")
        require(
            sum(Decimal(e["cash_delta"]) for e in events) == Decimal(account["cash"]),
            "Source cash/ledger mismatch",
        )
        rows = [dict(p, name=instruments[p["instrument_id"]]["name"]) for p in positions]
        market = instruments[positions[0]["instrument_id"]]["market"]
        require(all(p["currency"] == account["currency"] for p in positions), "Mixed account units")
        position_value = sum(Decimal(p["value"]) for p in positions)
        statements.append(
            {
                "document_id": f"synthetic-{environment}-{market.lower()}-statement",
                "environment": environment,
                "is_synthetic": True,
                "page": page,
                "market": market,
                "account_id": account["account_id"],
                "currency": account["currency"],
                "cash": account["cash"],
                "positions_value": str(position_value.quantize(Decimal("0.01"))),
                "total_value": str(
                    (position_value + Decimal(account["cash"])).quantize(Decimal("0.01"))
                ),
                "positions": rows,
                "recent_events": events[-6:],
                "history_is_complete_in_document": False,
            }
        )
    return statements


def write_pdf(path: Path, statements: list[dict], environment: str) -> None:
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="SmallFixture", fontName="Helvetica", fontSize=8, leading=11))
    styles.add(
        ParagraphStyle(
            name="FixtureTitle",
            fontName="Helvetica-Bold",
            fontSize=19,
            leading=23,
            textColor=colors.HexColor("#174b70"),
        )
    )
    small = styles["SmallFixture"]

    def para(text: object) -> Paragraph:
        return Paragraph(escape(str(text)), small)

    def table(rows: list, widths: list[int]) -> Table:
        result = Table(rows, colWidths=widths, repeatRows=1, hAlign="LEFT")
        result.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e0edf4")),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [colors.white, colors.HexColor("#f4f8fa")],
                    ),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("LEADING", (0, 0), (-1, -1), 11),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("LINEBELOW", (0, 0), (-1, 0), 0.8, colors.HexColor("#5b8297")),
                ]
            )
        )
        return result

    flow = []
    for i, statement in enumerate(statements):
        if i:
            flow.append(PageBreak())
        cur = statement["currency"]
        flow += [
            Paragraph("Simulated portfolio statement", styles["FixtureTitle"]),
            para(
                f"{environment.upper()} / {statement['market']} / {cur} / "
                f"as of {statement['positions'][0]['as_of']}"
            ),
            para(f"Synthetic account: {statement['account_id']}"),
            para(f"Document: {statement['document_id']}"),
            Spacer(1, 12),
        ]
        rows = [
            [
                para(x)
                for x in [
                    "Real instrument ID",
                    "Instrument",
                    "Quantity",
                    f"Unit price ({cur})",
                    f"Value ({cur})",
                ]
            ]
        ]
        for row in statement["positions"]:
            rows.append(
                [
                    para(row["instrument_id"]),
                    para(row["name"]),
                    para(row["quantity"]),
                    para(row["price"]),
                    para(row["value"]),
                ]
            )
        flow += [
            table(rows, [99, 145, 64, 99, 91]),
            Spacer(1, 9),
            para(
                f"Positions: {cur} {statement['positions_value']} | "
                f"Cash: {cur} {statement['cash']} | Total: {cur} {statement['total_value']}"
            ),
            Spacer(1, 9),
        ]
        if statement["market"] == "UK":
            flow += [
                para(
                    "Prices are GBP per unit. Native GBX quotes in the source fixture are "
                    "converted to GBP; a pence quote is not a pound value."
                ),
                Spacer(1, 8),
            ]
        flow += [
            para("Recent ledger events - last six only; not a complete transaction history."),
            Spacer(1, 5),
        ]
        events = [
            [
                para(x)
                for x in ["Date", "Type", "Instrument ID", "Quantity delta", f"Cash delta ({cur})"]
            ]
        ]
        for event in statement["recent_events"]:
            events.append(
                [
                    para(event[key])
                    for key in ["date", "type", "instrument_id", "quantity_delta", "cash_delta"]
                ]
            )
        flow += [
            table(events, [70, 55, 135, 112, 126]),
            Spacer(1, 10),
            para(
                "All prices, amounts, account identities and events are simulated. Real "
                "instrument identifiers do not make this observed data or your actual holdings."
            ),
            para(
                "Import expectation: holdings snapshot plus a partial ledger extract. Do not "
                "invent missing purchase history or calculate XIRR from this document alone."
            ),
        ]

    def stamp(canvas, doc):
        canvas.setFont("Helvetica-Bold", 8)
        canvas.setFillColor(colors.HexColor("#934116"))
        canvas.drawString(36, A4[1] - 25, LABEL)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#405c6b"))
        canvas.drawString(36, 23, f"SYNTHETIC / {environment.upper()} / page {doc.page}")

    SimpleDocTemplate(
        str(path),
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=43,
        bottomMargin=39,
        title=f"Synthetic {environment} import fixtures",
        author="Mypaisaa synthetic fixture generator",
    ).build(flow, onFirstPage=stamp, onLaterPages=stamp)


def operations(environment: str) -> dict:
    runs = []
    for agent, inputs, outputs in [
        ("holdings-research", 24000, 1800),
        ("daily-brief", 9000, 700),
        ("import-extraction", 6000, 500),
    ]:
        usd = (Decimal(inputs) * 3 + Decimal(outputs) * 15) / 1000000
        runs.append(
            {
                "run_id": f"synthetic-{environment}-{agent}",
                "environment": environment,
                "agent": agent,
                "input_tokens": inputs,
                "output_tokens": outputs,
                "gross_estimated_USD": str(usd),
                "is_synthetic": True,
            }
        )
    result = {
        "is_synthetic": True,
        "environment": environment,
        "label": "SIMULATED OPERATIONS - NOT OBSERVED USAGE OR BILLED COSTS",
        "rate_card": {
            "version": "illustrative-fixture-rates-v1",
            "current_provider_price": False,
            "USD_per_million_input": "3",
            "USD_per_million_output": "15",
        },
        "runs": runs,
        "independent_scenarios": [
            {
                "id": "credit-covered",
                "gross_USD": "18.50",
                "credit_applied_USD": "18.50",
                "estimated_cash_USD": "0.00",
                "state": "covered",
            },
            {
                "id": "credit-unknown",
                "credit_remaining_USD": None,
                "state": "pause-uncovered-calls",
            },
            *[
                {"id": f"cash-{n}", "forecast_GBP": str(n), "state": state}
                for n, state in [(60, "warn"), (75, "reduce-optional"), (85, "pause-new-optional")]
            ],
            {"id": "billing-stale", "provider_report_age_hours": 48, "state": "stale-not-zero"},
            {"id": "rejected-upload", "state": "quarantined", "ledger_changed": False},
            {"id": "duplicate-upload", "state": "duplicate", "ledger_changed": False},
        ],
    }
    for scenario in result["independent_scenarios"]:
        scenario.update({"is_synthetic": True, "environment": environment})
    return result


def generate(source: Path, target: Path, environment: str) -> dict:
    data = load_source(source, environment)
    require(not target.resolve().is_relative_to(source.resolve()), "Do not alter a source pack")
    require(not os.path.lexists(target), "Output exists; preserve it and choose a new path")
    renderer = shutil.which("pdftoppm")
    require(renderer is not None, "pdftoppm is required for screenshot fixtures")
    expected = expected_statements(data, environment)
    target.mkdir(parents=True, exist_ok=False)
    pdf = target / "portfolio-statements.pdf"
    write_pdf(pdf, expected, environment)
    pages = PdfReader(pdf).pages
    require(len(pages) == len(expected), "Unexpected statement pagination")
    for page, statement in zip(pages, expected, strict=True):
        text = page.extract_text()
        require(LABEL in text and statement["account_id"] in text, "Missing synthetic labels")
        for position in statement["positions"]:
            require(position["instrument_id"] in text, "Missing statement instrument")
    subprocess.run(
        [renderer, "-scale-to", "1400", "-png", str(pdf), str(target / "statement")],
        check=True,
        capture_output=True,
        timeout=60,
    )
    pngs = sorted(target.glob("statement-*.png"))
    require(len(pngs) == len(expected), "Missing screenshot fixture")
    for statement, png in zip(expected, pngs, strict=True):
        statement["screenshot"] = png.name
    save(
        target / "expected-imports.json",
        {"is_synthetic": True, "environment": environment, "statements": expected},
    )
    save(target / "operations-scenarios.json", operations(environment))
    manifest = {
        "dataset_id": "mypaisaa-synthetic-imports-v1",
        "environment": environment,
        "is_synthetic": True,
        "pdf_pages": len(expected),
        "screenshots": len(pngs),
        "source_dataset": data["manifest"]["dataset_id"],
        "source_hashes": {name: digest(source / name) for name in SOURCE_FILES},
        "source_manifest_sha256": digest(source / "manifest.json"),
        "generator_sha256": digest(Path(__file__)),
        "sha256": {p.name: digest(p) for p in sorted(target.iterdir()) if p.is_file()},
        "limitations": [
            "Generic sample layouts, not a supported real-broker parser",
            "Screenshots are clean PDF rasters, not photographed/OCR stress cases",
            "Partial transaction extracts cannot establish complete XIRR history",
            "Illustrative costs/scenarios, not provider rates or production controls",
            "No AWS load, paid call or app-schema compatibility implied",
        ],
    }
    save(target / "manifest.json", manifest)
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--environment", choices=["local", "dev", "both"], default="both")
    parser.add_argument("--output-root", type=Path, default=ROOT / "data/synthetic-imports-v1")
    args = parser.parse_args()
    for environment in ["local", "dev"] if args.environment == "both" else [args.environment]:
        result = generate(
            ROOT / "data/synthetic-v1" / environment, args.output_root / environment, environment
        )
        print(
            json.dumps(
                {
                    "environment": environment,
                    "pages": result["pdf_pages"],
                    "screenshots": result["screenshots"],
                }
            )
        )


if __name__ == "__main__":
    main()
