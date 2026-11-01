import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

SITE = Path(__file__).resolve().parents[1] / "site/dist"


class PreviewParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []
        self.has_language = False
        self.has_title = False
        self.has_viewport = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        self.links.extend(attrs[key] for key in ("href", "src") if attrs.get(key))
        self.has_language |= tag == "html" and bool(attrs.get("lang"))
        self.has_title |= tag == "title"
        self.has_viewport |= tag == "meta" and attrs.get("name") == "viewport"


class StaticPreviewTests(unittest.TestCase):
    def test_preview_metadata_and_local_links(self):
        parser = PreviewParser()
        parser.feed((SITE / "index.html").read_text())
        self.assertTrue(parser.has_language and parser.has_title and parser.has_viewport)
        for link in parser.links:
            with self.subTest(link=link):
                url = urlsplit(link)
                if url.scheme or url.netloc:
                    continue
                if url.path:
                    target = (SITE / unquote(url.path).lstrip("/")).resolve()
                    self.assertTrue(target.is_relative_to(SITE.resolve()))
                    self.assertTrue(target.is_file(), f"Missing local resource: {link}")
                elif url.fragment:
                    self.assertIn(unquote(url.fragment), parser.ids)


if __name__ == "__main__":
    unittest.main()
