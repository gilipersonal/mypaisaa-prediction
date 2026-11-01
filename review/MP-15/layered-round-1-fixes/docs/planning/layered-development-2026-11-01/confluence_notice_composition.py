"""Offline composition checks for the six proposed MP Confluence notices.

This module never reads or writes Confluence. Its inputs must come from a new
full-draft HTML read by the authorised writer. Markers are visible paragraph/code
text supported by the connector, not comments, storage XML or custom attributes.
"""

from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
from html import unescape
from html.parser import HTMLParser
import re


PAGE_IDS = frozenset({"5145345", "4981241", "5145394", "5112476", "5014127", "5112525"})
MARKER_PATTERN = re.compile(r"MP15-NOTICE-(?:BEGIN|END):[A-Za-z0-9:_.-]+")
VOID = frozenset({"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"})
FORMATTING_CONTAINERS = frozenset({"div", "section", "table", "thead", "tbody", "tfoot", "tr", "ul", "ol"})


class NoticeError(ValueError):
    """Refuse composition instead of guessing an owned range or fresh state."""


@dataclass(frozen=True)
class DraftSnapshot:
    page_id: str
    space_key: str
    html: str
    snapshot_token: str
    read_id: str
    is_full_draft_html: bool = True


@dataclass(frozen=True)
class PriorAttempt:
    read_id: str
    outcome_ambiguous: bool


@dataclass(frozen=True)
class Composition:
    operation: str
    html: str
    owned_start: int
    owned_end: int
    outside_before: str
    outside_after: str
    owned_root_local_ids: tuple[str, ...]
    desired_content_sha256: str


def marker(page_id: str, boundary: str) -> str:
    if page_id not in PAGE_IDS or boundary not in {"BEGIN", "END"}:
        raise NoticeError("Unknown page or notice boundary scope")
    return f"MP15-NOTICE-{boundary}:{page_id}:v1"


def marker_html(page_id: str, boundary: str) -> str:
    return f"<p><code>{marker(page_id, boundary)}</code></p>"


class _Document(HTMLParser):
    def __init__(self, source: str):
        super().__init__(convert_charrefs=True)
        self.source = source
        self.lines = [0] + [m.end() for m in re.finditer("\n", source)]
        self.stack: list[tuple[str, int, dict[str, str | None]]] = []
        self.paragraphs: list[dict] = []
        self.open_paragraph: dict | None = None
        self.roots: list[dict] = []
        self.open_root: dict | None = None
        self.feed(source)
        self.close()
        if self.stack or self.open_paragraph is not None:
            raise NoticeError("Incomplete HTML; do not repair or guess an owned range")

    def absolute_offset(self) -> int:
        line, column = self.getpos()
        return self.lines[line - 1] + column

    def handle_starttag(self, tag, attrs):
        start = self.absolute_offset()
        if tag in {"html", "head", "body"}:
            raise NoticeError("Expected the connector's body HTML fragment, not a document wrapper")
        root = not self.stack
        if root:
            self.open_root = {"start": start, "local_id": dict(attrs).get("data-local-id")}
        if tag == "p":
            if self.open_paragraph is not None:
                raise NoticeError("Nested paragraph makes the notice boundary ambiguous")
            self.open_paragraph = {"start": start, "root": root, "text": ""}
        if tag not in VOID:
            self.stack.append((tag, start, dict(attrs)))
        elif root:
            self.open_root["end"] = start + len(self.get_starttag_text())
            self.roots.append(self.open_root)
            self.open_root = None

    def handle_startendtag(self, tag, attrs):
        if tag not in VOID:
            raise NoticeError("Non-void self-closing HTML needs canonical conversion first")
        self.handle_starttag(tag, attrs)

    def handle_data(self, data):
        if self.open_paragraph is not None:
            self.open_paragraph["text"] += data

    def handle_endtag(self, tag):
        if tag in VOID or not self.stack or self.stack[-1][0] != tag:
            raise NoticeError("Unbalanced HTML; refuse composition")
        self.stack.pop()
        closing = re.match(r"</\s*" + re.escape(tag) + r"\s*>", self.source[self.absolute_offset():], re.I)
        if closing is None:
            raise NoticeError("Cannot identify an exact closing-node boundary")
        end = self.absolute_offset() + len(closing.group(0))
        if tag == "p":
            self.open_paragraph["end"] = end
            self.paragraphs.append(self.open_paragraph)
            self.open_paragraph = None
        if not self.stack:
            self.open_root["end"] = end
            self.roots.append(self.open_root)
            self.open_root = None


class _Signature(HTMLParser):
    """Conservative comparison, never a renderer or a content-hash assertion.

    Ignore only connector-assigned local IDs, attribute order and whitespace
    between block nodes. Keep other attributes, text, inline spacing and code.
    Unrecognised normalisation therefore causes a bounded replacement, not a
    claimed no-op. The returned document always retains untouched source bytes.
    """

    def __init__(self, source: str):
        super().__init__(convert_charrefs=True)
        self.tokens = []
        self.stack = []
        self.feed(source)
        self.close()

    def handle_starttag(self, tag, attrs):
        self.tokens.append(("start", tag, tuple(sorted((k, v or "") for k, v in attrs if k != "data-local-id"))))
        if tag not in VOID:
            self.stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        self.tokens.append(("end", tag))
        if self.stack:
            self.stack.pop()

    def handle_data(self, data):
        if data.isspace() and (not self.stack or self.stack[-1] in FORMATTING_CONTAINERS):
            return
        self.tokens.append(("text", data))

    def handle_comment(self, data):
        self.tokens.append(("comment", data))


def compose_notice(
    snapshot: DraftSnapshot,
    desired_inner_html: str,
    *,
    expected_snapshot_token: str,
    prior_attempt: PriorAttempt | None = None,
) -> Composition:
    """Insert, no-op, or replace exactly one owned notice in a fresh snapshot.

    An adapter supplies the current token/read identity from the actual full
    draft read, not values invented by this helper. After an ambiguous write it
    must perform another full read before calling again, even if the returned
    token happens to be unchanged. No response or token authorises publication.
    """
    if snapshot.page_id not in PAGE_IDS or snapshot.space_key != "mypaisaapr":
        raise NoticeError("Unknown MP page/space scope")
    if not snapshot.is_full_draft_html or not snapshot.read_id or not snapshot.snapshot_token:
        raise NoticeError("A full current draft HTML read with its token/read identity is required")
    if snapshot.snapshot_token != expected_snapshot_token:
        raise NoticeError("Stale snapshot token; re-read the full current draft")
    if prior_attempt and prior_attempt.outcome_ambiguous and prior_attempt.read_id == snapshot.read_id:
        raise NoticeError("Ambiguous outcome requires a new full draft read before any retry")
    if not desired_inner_html.strip() or "MP15-NOTICE-" in unescape(desired_inner_html):
        raise NoticeError("Empty content or a nested/reserved notice scope")
    if re.search(r"<\s*/?\s*(?:ac|ri):", desired_inner_html, re.I):
        raise NoticeError("Confluence storage XML is not supported connector HTML")
    _Document(desired_inner_html)
    doc = _Document(snapshot.html)
    begin, end = marker(snapshot.page_id, "BEGIN"), marker(snapshot.page_id, "END")
    decoded = unescape(snapshot.html)
    all_markers = MARKER_PATTERN.findall(decoded)
    if "MP15-NOTICE-" in MARKER_PATTERN.sub("", decoded):
        raise NoticeError("Malformed reserved marker; stop instead of inserting another range")
    if any(value not in {begin, end} for value in all_markers):
        raise NoticeError("Unknown notice scope in the current page")
    starts = [x for x in doc.paragraphs if x["text"].strip() == begin]
    ends = [x for x in doc.paragraphs if x["text"].strip() == end]
    fragment = marker_html(snapshot.page_id, "BEGIN") + "\n" + desired_inner_html + "\n" + marker_html(snapshot.page_id, "END")
    digest = sha256(desired_inner_html.encode()).hexdigest()
    if not all_markers:
        return Composition("insert_owned_notice", fragment + snapshot.html, 0, 0, "", snapshot.html, (), digest)
    if len(starts) != 1 or len(ends) != 1 or all_markers.count(begin) != 1 or all_markers.count(end) != 1:
        raise NoticeError("Missing, duplicate or unobservable marker pair; stop instead of appending")
    first, last = starts[0], ends[0]
    if not first["root"] or not last["root"] or first["end"] > last["start"]:
        raise NoticeError("Reversed or nested marker range; stop instead of guessing")
    start, stop = first["start"], last["end"]
    before, after = snapshot.html[:start], snapshot.html[stop:]
    local_ids = tuple(x["local_id"] for x in doc.roots if start <= x["start"] and x["end"] <= stop and x["local_id"])
    current_inner = snapshot.html[first["end"]:last["start"]]
    identical = current_inner == desired_inner_html or _Signature(current_inner).tokens == _Signature(desired_inner_html).tokens
    if identical:
        return Composition("no_op", snapshot.html, start, stop, before, after, local_ids, digest)
    return Composition("replace_owned_notice", before + fragment + after, start, stop, before, after, local_ids, digest)
