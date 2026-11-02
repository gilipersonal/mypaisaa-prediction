"""Offline FIN-HASH-1 document proof; no application or service implementation.

Run directly, or import check() for the foundation document gate. Requires jsonschema.
"""
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker, ValidationError

BASE = Path(__file__).resolve().parent
VERSION = "FIN-HASH-1"
PROJECTIONS = (
    "LedgerEvent", "AuditEvidence", "EventIntent", "ChunkContent",
    "ManifestPage", "CommitManifest",
)
EXCLUSIONS = {
    "AuditEvidence": ["content_sha256"],
    "ManifestPage": ["page_sha256"],
    "CommitManifest": ["manifest_sha256", "state", "resulting_revision", "published_at"],
}
IDENTITIES = {"LedgerEvent": "event_id", "AuditEvidence": "audit_id", "EventIntent": "message_id"}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def read(name: str) -> dict:
    return json.loads((BASE / name).read_text())


def scalar_check(value: object) -> None:
    if isinstance(value, float):
        raise ValueError("binary floats are outside FIN-HASH-1")
    if isinstance(value, str):
        require(not any(0xD800 <= ord(char) <= 0xDFFF for char in value), "lone surrogate")
    elif isinstance(value, list):
        for item in value:
            scalar_check(item)
    elif isinstance(value, dict):
        for key, item in value.items():
            require(isinstance(key, str), "JSON object keys must be strings")
            scalar_check(key)
            scalar_check(item)


class Proof:
    def __init__(self) -> None:
        self.schema = read("contracts.schema.json")
        self.contract = read("hash-contract.json")
        require(self.contract["version"] == VERSION, "unsupported hash version")
        require(set(self.contract["projections"]) == set(PROJECTIONS), "projection set changed")
        for name in PROJECTIONS:
            rule = self.contract["projections"][name]
            properties = list(self.schema["$defs"][name]["properties"])
            excluded = EXCLUSIONS.get(name, [])
            require(set(excluded) <= set(properties), f"excluded field absent from schema: {name}")
            require(rule["excluded_fields"] == excluded, f"unexpected exclusions: {name}")
            require(rule["included_fields"] == [p for p in properties if p not in excluded],
                    f"projection does not cover exact named schema: {name}")
        intent_fields = set(self.schema["$defs"]["EventIntent"]["properties"])
        require(intent_fields == {"record_type", "scope", "message_id", "commit_id", "payload_ref",
                                  "consumer_dedup_key"}, "intent must be immutable and root independent")
        require(self.contract["excluded_mutable_records"] ==
                ["DeliveryState", "DeliveryAttempt", "PublicationPointer"], "delivery hash boundary changed")
        self.validators = {}

    def validate(self, name: str, value: dict) -> None:
        if name not in self.validators:
            self.validators[name] = Draft202012Validator(
                {"$defs": self.schema["$defs"], "$ref": "#/$defs/" + name},
                format_checker=FormatChecker(),
            )
        self.validators[name].validate(value)
        scalar_check(value)

    def digest(self, name: str, value: dict) -> str:
        self.validate(name, value)
        fields = self.contract["projections"][name]["included_fields"]
        envelope = {"hash_policy_version": VERSION, "record_type": name,
                    "content": {field: value[field] for field in fields}}
        encoded = json.dumps(envelope, ensure_ascii=True, sort_keys=True,
                             separators=(",", ":"), allow_nan=False).encode("utf-8")
        return hashlib.sha256(encoded).hexdigest()

    def refresh_fixture_hashes(self, graph: dict) -> None:
        """Maker fixture construction only; verify() never repairs its input."""
        leaves = {}
        for leaf in graph["leaves"]:
            leaf["sha256"] = self.digest(leaf["record_type"], leaf["value"])
            if leaf["record_type"] == "AuditEvidence":
                leaf["value"]["content_sha256"] = leaf["sha256"]
            leaves[leaf["record_id"]] = leaf
        receipts = {r["chunk_id"]: r for r in graph["chunk_receipts"]}
        for content in graph["chunk_contents"]:
            for item in content["ordered_leaf_refs"]:
                item["sha256"] = leaves[item["record_id"]]["sha256"]
            receipts[content["chunk_id"]]["content_sha256"] = self.digest("ChunkContent", content)
        for page in graph["pages"]:
            page["chunks"] = [copy.deepcopy(receipts[r["chunk_id"]]) for r in page["chunks"]]
            page["page_sha256"] = self.digest("ManifestPage", page)
        manifest = graph["manifest"]
        if manifest["chunk_inventory_mode"] == "paged":
            manifest["chunk_page_refs"] = [
                {"page_id": p["page_id"], "page_sha256": p["page_sha256"]} for p in graph["pages"]
            ]
        else:
            manifest["chunks"] = copy.deepcopy(graph["chunk_receipts"])
        manifest["manifest_sha256"] = self.digest("CommitManifest", manifest)
        graph["publication_pointer"]["manifest_sha256"] = manifest["manifest_sha256"]

    def verify(self, graph: dict) -> str:
        require(graph["hash_policy_version"] == VERSION, "unsupported fixture hash version")
        manifest = graph["manifest"]
        self.validate("CommitManifest", manifest)
        scope, commit = manifest["scope"], manifest["commit_id"]
        require(manifest["hash_policy_version"] == VERSION, "manifest version")
        leaves = {}
        for leaf in graph["leaves"]:
            kind, value = leaf["record_type"], leaf["value"]
            require(kind in IDENTITIES, "unsupported graph leaf")
            require(value[IDENTITIES[kind]] == leaf["record_id"], "leaf identity")
            require(leaf["record_id"] not in leaves, "duplicate leaf ID")
            require(value["scope"] == scope and value["commit_id"] == commit, "leaf scope/commit")
            require(self.digest(kind, value) == leaf["sha256"], "leaf digest mismatch")
            if kind == "AuditEvidence":
                require(value["content_sha256"] == leaf["sha256"], "audit own digest mismatch")
            leaves[leaf["record_id"]] = leaf
        receipts = graph["chunk_receipts"]
        receipt_by_id = {r["chunk_id"]: r for r in receipts}
        require(len(receipt_by_id) == len(receipts), "duplicate chunk ID")
        seen = []
        for content in graph["chunk_contents"]:
            self.validate("ChunkContent", content)
            require(content["scope"] == scope and content["commit_id"] == commit, "chunk scope/commit")
            receipt = receipt_by_id[content["chunk_id"]]
            self.validate("ChunkReceipt", receipt)
            ids = [item["record_id"] for item in content["ordered_leaf_refs"]]
            require(ids == receipt["storage_refs"], "receipt order/reference mismatch")
            counts = {kind: 0 for kind in IDENTITIES}
            for item in content["ordered_leaf_refs"]:
                leaf = leaves[item["record_id"]]
                require(item["record_type"] == leaf["record_type"] and
                        item["sha256"] == leaf["sha256"], "leaf reference mismatch")
                counts[item["record_type"]] += 1
            require((receipt["event_count"], receipt["audit_count"], receipt["intent_count"], receipt["item_count"]) ==
                    (counts["LedgerEvent"], counts["AuditEvidence"], counts["EventIntent"], len(ids)), "chunk counts")
            require(receipt["fence"] == manifest["fence"], "chunk fence")
            require(receipt["content_sha256"] == self.digest("ChunkContent", content), "chunk digest mismatch")
            seen.extend(ids)
        require(len(graph["chunk_contents"]) == len(receipts), "chunk content count")
        require(len(seen) == len(set(seen)) and set(seen) == set(leaves), "leaf inventory completeness")
        pages = graph["pages"]
        if manifest["chunk_inventory_mode"] == "paged":
            require(not manifest["chunks"] and len(pages) > 0, "paged/inline exclusivity")
            require([p["page_index"] for p in pages] == list(range(len(pages))), "page ordering")
            require(len({p["page_id"] for p in pages}) == len(pages), "duplicate page ID")
            for page in pages:
                require(page["commit_id"] == commit, "page commit")
                require(page["page_sha256"] == self.digest("ManifestPage", page), "page digest mismatch")
            require([r for p in pages for r in p["chunks"]] == receipts, "page chunk inventory")
            require(manifest["chunk_page_refs"] == [
                {"page_id": p["page_id"], "page_sha256": p["page_sha256"]} for p in pages
            ], "page digest reference mismatch")
        else:
            require(not pages and not manifest["chunk_page_refs"] and manifest["chunks"] == receipts,
                    "inline inventory")
        require(manifest["expected_page_count"] == len(pages), "manifest page count")
        require(manifest["expected_chunk_count"] == len(receipts), "manifest chunk count")
        for field in ("event", "audit", "intent"):
            require(manifest[f"expected_{field}_count"] == sum(r[f"{field}_count"] for r in receipts),
                    "manifest record counts")
        root = self.digest("CommitManifest", manifest)
        require(root == manifest["manifest_sha256"], "manifest digest mismatch")
        require(manifest["state"] == "published" and
                manifest["resulting_revision"] == manifest["expected_revision"] + 1 and
                manifest["published_at"] is not None, "fixture publication envelope")
        pointer = graph["publication_pointer"]
        self.validate("PublicationPointer", pointer)
        require(pointer["scope"] == scope and pointer["commit_id"] == commit and
                pointer["manifest_sha256"] == root, "publication pointer join")
        messages = {leaf["record_id"] for leaf in leaves.values() if leaf["record_type"] == "EventIntent"}
        messages.add(pointer["message_id"])
        for name, key in (("DeliveryState", "delivery_states"), ("DeliveryAttempt", "delivery_attempts")):
            for record in graph[key]:
                self.validate(name, record)
                require(record["scope"] == scope and record["commit_id"] == commit and
                        record["message_id"] in messages, "delivery record join")
        return root


def must_refuse(action, label: str) -> None:
    try:
        action()
    except (ValueError, ValidationError) as exc:
        require(bool(str(exc)), "refusal must have a diagnostic")
        return
    raise ValueError("mutation accepted: " + label)


def check() -> dict:
    proof = Proof()
    graph = read("hash-graph-example.json")
    root = proof.verify(graph)
    changed = copy.deepcopy(graph)
    changed["leaves"][0]["value"]["cash_legs"][0]["money"]["amount"] = "-202"
    must_refuse(lambda: proof.verify(changed), "edited leaf under old hashes")
    proof.refresh_fixture_hashes(changed)
    require(proof.verify(changed) != root, "leaf mutation did not reach root")
    delivery = copy.deepcopy(graph)
    state = delivery["delivery_states"][0]
    state.update(status="delivery_failed", attempt_count=1, last_attempt_at="2026-11-02T10:02:00Z")
    attempt = {"record_type": "FIN-ATTEMPT-1.0", "scope": state["scope"],
               "message_id": state["message_id"], "commit_id": state["commit_id"],
               "attempt_id": "hash-proof-attempt1", "attempt_number": 1,
               "attempted_at": state["last_attempt_at"], "outcome": "delivery_failed", "error_code": "timeout"}
    delivery["delivery_attempts"].append(attempt)
    require(proof.verify(delivery) == root, "failure changed root")
    state["status"] = "pending"
    require(proof.verify(delivery) == root, "retry scheduling changed root")
    state.update(status="delivered", attempt_count=2, last_attempt_at="2026-11-02T10:03:00Z")
    second = dict(attempt, attempt_id="hash-proof-attempt2", attempt_number=2,
                  attempted_at=state["last_attempt_at"], outcome="delivered", error_code=None)
    delivery["delivery_attempts"].append(second)
    require(proof.verify(delivery) == root, "success changed root")
    intent = next(leaf["value"] for leaf in graph["leaves"] if leaf["record_type"] == "EventIntent")
    for field, value in (("manifest_sha256", root), ("status", "delivered"), ("unexpected", "x")):
        bad = dict(intent, **{field: value})
        must_refuse(lambda: proof.digest("EventIntent", bad), "extra intent field " + field)
    bad = copy.deepcopy(graph)
    bad["hash_policy_version"] = "FIN-HASH-unknown"
    must_refuse(lambda: proof.verify(bad), "unknown hash version")
    bad = copy.deepcopy(graph)
    bad["manifest"]["chunk_page_refs"][0]["page_sha256"] = "0" * 64
    must_refuse(lambda: proof.verify(bad), "wrong page digest reference")
    for name, value in (("EventIntent", dict(intent, payload_ref=1.25)),):
        must_refuse(lambda: proof.digest(name, value), "binary float")
    inline = copy.deepcopy(graph)
    inline["pages"] = []
    inline["manifest"].update(chunk_inventory_mode="inline", chunk_page_refs=[], expected_page_count=0)
    proof.refresh_fixture_hashes(inline)
    proof.verify(inline)
    return {"status": "passed", "hash_policy_version": VERSION, "fixture_root": root,
            "computed_leaf_count": len(graph["leaves"]), "inventory_modes_verified": ["paged", "inline"],
            "leaf_mutation_changes_root": True, "delivery_failure_retry_success_preserve_root": True,
            "extra_fields_unknown_version_wrong_page_ref_refused": True,
            "scope": "offline synthetic document proof only; no cloud/application evidence"}


if __name__ == "__main__":
    print(json.dumps(check(), sort_keys=True))
