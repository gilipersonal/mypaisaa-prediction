"""Behavioural offline checks; no connector calls or real page writes."""

from dataclasses import replace
from hashlib import sha256
import json
from pathlib import Path
import unittest

from confluence_notice_composition import DraftSnapshot, NoticeError, PriorAttempt, compose_notice, marker_html


PAGE = "5145345"
RICH = '<div data-local-id="macro-1" data-type="extension" data-extension-key="recently-updated" data-parameters=\'{"keep":"α &amp; £"}\'>Keep rich macro</div><p data-local-id="p-1">Outside <strong>unchanged</strong>.</p><div data-local-id="media-1" data-type="media-single"><img src="https://example.invalid/private.png" alt="Keep" /></div>'
INNER = '<h2>Current planning</h2><p>Draft <strong>not clean-certified</strong>.</p>'


def snap(html=RICH, **kwargs):
    return DraftSnapshot(page_id=PAGE, space_key="mypaisaapr", html=html, snapshot_token="draft-token-1", read_id="read-1", **kwargs)


def compose(snapshot, content=INNER, **kwargs):
    return compose_notice(snapshot, content, expected_snapshot_token=snapshot.snapshot_token, **kwargs)


class NoticeCompositionTests(unittest.TestCase):
    def test_actual_six_action_configs_use_scoped_upsert_and_compose_twice(self):
        payload = json.loads(Path(__file__).with_name("confluence-publish-payloads.json").read_text())
        self.assertEqual(len(payload["update_actions"]), 6)
        for action in payload["update_actions"]:
            with self.subTest(page=action["page_id"]):
                self.assertEqual(action["operation"], "upsert_owned_notice_proposed")
                self.assertEqual(action["owned_notice"]["begin_marker_html"], marker_html(action["page_id"], "BEGIN"))
                self.assertEqual(action["owned_notice"]["end_marker_html"], marker_html(action["page_id"], "END"))
                current = replace(snap(), page_id=action["page_id"])
                first = compose(current)
                second = compose(replace(current, html=first.html, read_id="fresh-config-read"))
                self.assertEqual(second.operation, "no_op")
                self.assertEqual(second.html, first.html)
                self.assertEqual(second.outside_after.encode(), RICH.encode())

    def test_actual_six_evidence_footers_have_current_nonself_sources_and_honest_review(self):
        payload = json.loads(Path(__file__).with_name("confluence-publish-payloads.json").read_text())
        root = Path(__file__).resolve().parents[3]
        for action in payload["update_actions"]:
            evidence = action["evidence_footer"]
            self.assertIn("Evidence and readiness footer", action["insertion"]["value"])
            self.assertTrue(evidence["local_story_refs"])
            review = evidence["review_status"]
            if not review["next_round_run"]:
                self.assertFalse(review["clean_certified"])
            for source, digest in evidence["source_sha256"].items():
                self.assertNotIn("confluence-publish-payloads", source)
                self.assertNotIn("confluence-page-map", source)
                self.assertEqual(sha256((root / source).read_bytes()).hexdigest(), digest)

    def test_absent_inserts_and_preserves_all_outside_utf8_bytes(self):
        result = compose(snap())
        self.assertEqual(result.operation, "insert_owned_notice")
        self.assertTrue(result.html.endswith(RICH))
        self.assertEqual(result.outside_after.encode(), RICH.encode())

    def test_compose_twice_is_exact_noop(self):
        first = compose(snap())
        second = compose(replace(snap(first.html), read_id="read-2", snapshot_token="draft-token-2"))
        self.assertEqual(second.operation, "no_op")
        self.assertEqual(second.html, first.html)
        self.assertEqual(second.html.count("MP15-NOTICE-BEGIN:"), 1)
        self.assertEqual(second.html.count("MP15-NOTICE-END:"), 1)

    def test_changed_notice_replaces_only_owned_range(self):
        middle = marker_html(PAGE, "BEGIN") + INNER + marker_html(PAGE, "END")
        original = RICH + middle + RICH
        result = compose(snap(original), '<p>Changed approved draft.</p>')
        self.assertEqual(result.operation, "replace_owned_notice")
        self.assertEqual(result.outside_before.encode(), RICH.encode())
        self.assertEqual(result.outside_after.encode(), RICH.encode())
        self.assertTrue(result.html.startswith(RICH))
        self.assertTrue(result.html.endswith(RICH))
        self.assertEqual(result.html.count("MP15-NOTICE-BEGIN:"), 1)

    def test_server_local_ids_attribute_order_and_block_whitespace_can_noop(self):
        current = '<p data-local-id="b"><span><code>MP15-NOTICE-BEGIN:5145345:v1</code></span></p>\n <h2 data-local-id="h">Current planning</h2>\n<p data-local-id="p">Draft <strong data-local-id="s">not clean-certified</strong>.</p>\n<p data-local-id="e"><code>MP15-NOTICE-END:5145345:v1</code></p>' + RICH
        result = compose(snap(current))
        self.assertEqual(result.operation, "no_op")
        self.assertEqual(result.html, current)
        self.assertEqual(result.owned_root_local_ids, ("b", "h", "p", "e"))

    def test_unproven_wrapper_normalisation_is_bounded_replace_not_duplicate(self):
        current = marker_html(PAGE, "BEGIN") + '<div>' + INNER + '</div>' + marker_html(PAGE, "END") + RICH
        result = compose(snap(current))
        self.assertEqual(result.operation, "replace_owned_notice")
        self.assertEqual(result.outside_after, RICH)
        self.assertEqual(result.html.count("MP15-NOTICE-BEGIN:"), 1)

    def test_changed_body_is_not_trusted_because_a_declared_hash_stays_same(self):
        desired = '<p>Declared hash abc; actual approved body.</p>'
        current = marker_html(PAGE, "BEGIN") + '<p>Declared hash abc; TAMPERED body.</p>' + marker_html(PAGE, "END") + RICH
        self.assertEqual(compose(snap(current), desired).operation, "replace_owned_notice")

    def test_missing_start_or_end_refuses(self):
        for html in [marker_html(PAGE, "BEGIN") + RICH, RICH + marker_html(PAGE, "END")]:
            with self.subTest(html=html), self.assertRaises(NoticeError):
                compose(snap(html))

    def test_duplicate_pair_refuses(self):
        pair = marker_html(PAGE, "BEGIN") + INNER + marker_html(PAGE, "END")
        with self.assertRaises(NoticeError):
            compose(snap(pair + RICH + pair))

    def test_reversed_pair_refuses(self):
        with self.assertRaises(NoticeError):
            compose(snap(marker_html(PAGE, "END") + RICH + marker_html(PAGE, "BEGIN")))

    def test_marker_hidden_only_in_comment_is_not_supported(self):
        with self.assertRaises(NoticeError):
            compose(snap('<!-- MP15-NOTICE-BEGIN:5145345:v1 -->' + INNER + '<!-- MP15-NOTICE-END:5145345:v1 -->' + RICH))

    def test_malformed_reserved_marker_refuses(self):
        with self.assertRaises(NoticeError):
            compose(snap('<p><code>MP15-NOTICE-BEGIN:</code></p>' + RICH))

    def test_valid_pair_plus_malformed_extra_marker_also_refuses(self):
        pair = marker_html(PAGE, "BEGIN") + INNER + marker_html(PAGE, "END")
        with self.assertRaises(NoticeError):
            compose(snap(pair + '<p>MP15-NOTICE-BEGIN:</p>' + RICH))

    def test_nested_marker_range_refuses(self):
        with self.assertRaises(NoticeError):
            compose(snap('<div>' + marker_html(PAGE, "BEGIN") + INNER + marker_html(PAGE, "END") + '</div>' + RICH))

    def test_unknown_page_space_or_marker_scope_refuses(self):
        for current in [replace(snap(), page_id="999"), replace(snap(), space_key="MA"), snap(marker_html("4981241", "BEGIN") + INNER + marker_html("4981241", "END"))]:
            with self.subTest(snapshot=current), self.assertRaises(NoticeError):
                compose(current)

    def test_stale_snapshot_token_refuses(self):
        with self.assertRaises(NoticeError):
            compose_notice(snap(), INNER, expected_snapshot_token="old-draft-token")

    def test_non_full_draft_or_missing_read_identity_refuses(self):
        for current in [snap(is_full_draft_html=False), replace(snap(), read_id=""), replace(snap(), snapshot_token="")]:
            with self.subTest(snapshot=current), self.assertRaises(NoticeError):
                compose(current)

    def test_ambiguous_outcome_requires_new_full_read(self):
        with self.assertRaises(NoticeError):
            compose(snap(), prior_attempt=PriorAttempt("read-1", True))

    def test_ambiguous_but_already_applied_fresh_read_noops(self):
        first = compose(snap())
        fresh = replace(snap(first.html), read_id="fresh-read", snapshot_token="new-token")
        result = compose(fresh, prior_attempt=PriorAttempt("read-1", True))
        self.assertEqual(result.operation, "no_op")
        self.assertEqual(result.html.count("MP15-NOTICE-BEGIN:"), 1)

    def test_ambiguous_not_applied_fresh_read_may_insert_once(self):
        fresh = replace(snap(), read_id="fresh-read")
        result = compose(fresh, prior_attempt=PriorAttempt("read-1", True))
        self.assertEqual(result.operation, "insert_owned_notice")
        self.assertEqual(result.html.count("MP15-NOTICE-BEGIN:"), 1)

    def test_storage_xml_or_nested_reserved_marker_in_new_content_refuses(self):
        for text in ['<ac:structured-macro />', marker_html(PAGE, "BEGIN")]:
            with self.subTest(text=text), self.assertRaises(NoticeError):
                compose(snap(), text)

    def test_incomplete_html_refuses_instead_of_repairing(self):
        with self.assertRaises(NoticeError):
            compose(snap('<div><p>Incomplete'))


class SplitVisibleMarkerTests(unittest.TestCase):
    def test_zero_width_marker_formatting_cannot_imply_absence(self):
        html = f'<p>MP15-\u200b<span>NOTICE-BEGIN:{PAGE}:v1</span></p>' + RICH
        with self.assertRaisesRegex(NoticeError, "noncanonical"):
            compose(snap(html))

    def test_split_reserved_marker_in_desired_content_is_refused(self):
        inner = f'<p>MP15-<span>NOTICE-END:{PAGE}:v1</span></p>'
        with self.assertRaisesRegex(NoticeError, "reserved"):
            compose(snap(), inner)

    def test_apply_guidance_and_review_metadata_do_not_restore_obsolete_state(self):
        folder = Path(__file__).parent
        payload = json.loads((folder / "confluence-publish-payloads.json").read_text())
        self.assertIn("compose_notice", payload["format_preparation"]["existing_page_apply_format"])
        self.assertNotIn("prepend to full current HTML", payload["format_preparation"]["existing_page_apply_format"])
        for action in payload["update_actions"]:
            self.assertNotIn("This pack has no independent review or real-ledger regression run.", action["insertion"]["value"])
        proposal = json.loads((folder / "mp-sync-write-proposal.json").read_text())
        self.assertNotEqual(proposal["independent_review"], "not_run")

    def test_both_visible_markers_split_across_spans_are_not_absent(self):
        begin = f'<p><code>MP15-<span>NOTICE-BEGIN:{PAGE}:v1</span></code></p>'
        end = f'<p><code>MP15-<span>NOTICE-END:{PAGE}:v1</span></code></p>'
        with self.assertRaisesRegex(NoticeError, "noncanonical"):
            compose(snap(begin + INNER + end + RICH))

    def test_split_unknown_scope_markers_are_refused(self):
        html = '<p>MP15-<span>NOTICE-BEGIN:other:v1</span></p>' + RICH
        with self.assertRaisesRegex(NoticeError, "noncanonical"):
            compose(snap(html))

    def test_split_marker_in_nonparagraph_is_refused(self):
        html = f'<h2>MP15-<em>NOTICE-BEGIN:{PAGE}:v1</em></h2>' + RICH
        with self.assertRaisesRegex(NoticeError, "noncanonical"):
            compose(snap(html))

    def test_split_marker_with_inline_whitespace_is_refused(self):
        html = f'<p>MP15- <span>NOTICE-BEGIN:{PAGE}:v1</span></p>' + RICH
        with self.assertRaisesRegex(NoticeError, "noncanonical"):
            compose(snap(html))


if __name__ == "__main__":
    unittest.main()
