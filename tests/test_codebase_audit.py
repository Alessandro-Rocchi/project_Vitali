import os
import re
import sys
import json
from html.parser import HTMLParser

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def assert_test(condition, message):
    if not condition:
        print(f"[FAIL] {message}")
        sys.exit(1)
    else:
        print(f"[PASS] {message}")

class SimpleHTMLValidator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.favicons = []
        self.css_links = []
        self.scripts = []
        self.has_comments = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if tag == "link":
            rel = attr_dict.get("rel", "")
            href = attr_dict.get("href", "")
            if "icon" in rel:
                self.favicons.append(href)
            if "stylesheet" in rel:
                self.css_links.append(href)
        elif tag == "script":
            src = attr_dict.get("src")
            if src:
                self.scripts.append(src)

    def handle_comment(self, data):
        self.has_comments.append(data.strip())

def test_css_files():
    print("\n--- Testing CSS Themes Integrity & Cleanliness ---")
    styles_dir = os.path.join(ROOT_DIR, "styles")
    css_files = [
        "eighties_theme.css",
        "futurism_theme.css",
        "mechanicum_theme.css",
        "nouvelle_vague_theme.css",
        "rococo_theme.css",
        "solarpunk_theme.css"
    ]

    for fname in css_files:
        fpath = os.path.join(styles_dir, fname)
        assert_test(os.path.exists(fpath), f"{fname} exists")
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # Check balanced curly braces
        open_braces = content.count("{")
        close_braces = content.count("}")
        assert_test(open_braces == close_braces, f"{fname} has balanced braces ({open_braces} open, {close_braces} close)")

    # 1. eighties_theme.css specific checks
    eighties = open(os.path.join(styles_dir, "eighties_theme.css"), "r", encoding="utf-8").read()
    assert_test("url('img/saint_sulpiere.png')" not in eighties, "eighties_theme.css: no broken un-prefixed 'url(img/saint_sulpiere.png)'")
    assert_test("#A92325" not in eighties, "eighties_theme.css: no residual red '#A92325'")
    assert_test(eighties.count(".btn-desktop-toggle #arrow_forward_ios") == 1, "eighties_theme.css: single .btn-desktop-toggle #arrow_forward_ios declaration")
    assert_test(eighties.count(".btn-desktop-toggle.is-open #arrow_forward_ios") == 1, "eighties_theme.css: single .btn-desktop-toggle.is-open #arrow_forward_ios declaration")

    # 2. nouvelle_vague_theme.css specific checks
    nv = open(os.path.join(styles_dir, "nouvelle_vague_theme.css"), "r", encoding="utf-8").read()
    assert_test(nv.count("h1, h2, h3{") == 1, "nouvelle_vague_theme.css: single 'h1, h2, h3{' definition")
    assert_test("#info-panel #btn-film{" not in nv, "nouvelle_vague_theme.css: dead #btn-film blue text rule removed")
    assert_test(nv.count("#info-panel #btn-film {") == 1, "nouvelle_vague_theme.css: button #info-panel #btn-film definition retained")
    assert_test(nv.count("#info-panel #btn-film:hover {") == 1, "nouvelle_vague_theme.css: button #info-panel #btn-film:hover definition retained")

    # 3. futurism_theme.css specific checks
    futurism = open(os.path.join(styles_dir, "futurism_theme.css"), "r", encoding="utf-8").read()
    assert_test(futurism.count("\n.material-symbols-outlined {") == 1, "futurism_theme.css: single standalone .material-symbols-outlined block")
    assert_test("INIZIO CSS TOUR" not in futurism, "futurism_theme.css: noise comment 'INIZIO CSS TOUR' removed")

    # 4. mechanicum_theme.css specific checks
    mech = open(os.path.join(styles_dir, "mechanicum_theme.css"), "r", encoding="utf-8").read()
    assert_test(mech.count(".catchphrase h1, .catchphrase h1 span, header > .row h1") == 1, "mechanicum_theme.css: duplicate catchphrase block removed")

    # 5. rococo_theme.css specific checks
    rococo = open(os.path.join(styles_dir, "rococo_theme.css"), "r", encoding="utf-8").read()
    assert_test(rococo.count("#info-panel #btn-film{") == 0, "rococo_theme.css: dead inline #info-panel #btn-film rules removed")
    assert_test(rococo.count("#info-panel #btn-film {") == 1, "rococo_theme.css: button block preserved")
    assert_test(rococo.count("#info-panel #btn-film:hover {") == 1, "rococo_theme.css: button hover preserved")

    # 6. solarpunk_theme.css specific checks
    solarpunk = open(os.path.join(styles_dir, "solarpunk_theme.css"), "r", encoding="utf-8").read()
    assert_test(solarpunk.count("\naside.bookmarks {") == 1, "solarpunk_theme.css: consolidated single main aside.bookmarks rule")

def test_html_files():
    print("\n--- Testing HTML Files Integrity & Favicons ---")
    html_files = [
        "about.html",
        "about_nouvelle_vague.html",
        "about_our_team.html",
        "catalogue.html",
        "documentation.html",
        "index.html",
        "map.html",
        "tour.html"
    ]

    for hname in html_files:
        hpath = os.path.join(ROOT_DIR, hname)
        assert_test(os.path.exists(hpath), f"{hname} exists")
        with open(hpath, "r", encoding="utf-8") as f:
            html_content = f.read()

        assert_test("images/S.png" not in html_content, f"{hname}: no 'images/S.png' references")

        parser = SimpleHTMLValidator()
        parser.feed(html_content)

        assert_test("img/S.svg" in parser.favicons, f"{hname}: uses 'img/S.svg' favicon")
        assert_test(len(parser.favicons) == 1, f"{hname}: exactly 1 favicon declared")

        # Verify local CSS stylesheets exist
        for css in parser.css_links:
            if not css.startswith("http") and not css.startswith("//"):
                local_css = os.path.join(ROOT_DIR, css.replace("/", os.sep))
                assert_test(os.path.exists(local_css), f"{hname}: referenced CSS '{css}' exists on disk")

        # Verify local scripts exist
        for sc in parser.scripts:
            if not sc.startswith("http") and not sc.startswith("//"):
                local_sc = os.path.join(ROOT_DIR, sc.replace("/", os.sep))
                assert_test(os.path.exists(local_sc), f"{hname}: referenced script '{sc}' exists on disk")

    # Check catalogue.html comments removed
    catalogue_content = open(os.path.join(ROOT_DIR, "catalogue.html"), "r", encoding="utf-8").read()
    assert_test("ZONA FILTRI" not in catalogue_content, "catalogue.html: 'ZONA FILTRI' comment removed")
    assert_test("BOTTONE DESKTOP" not in catalogue_content, "catalogue.html: 'BOTTONE DESKTOP' comment removed")

def test_javascript_and_data():
    print("\n--- Testing JavaScript and Data Files ---")
    scripts_path = os.path.join(ROOT_DIR, "script", "scripts.js")
    map_scripts_path = os.path.join(ROOT_DIR, "script", "map_scripts.js")

    with open(scripts_path, "r", encoding="utf-8") as f:
        scripts_js = f.read()
    with open(map_scripts_path, "r", encoding="utf-8") as f:
        map_scripts_js = f.read()

    assert_test("typeof loadJson !== 'function'" in scripts_js, "scripts.js: idempotent loadJson pattern present")
    assert_test("typeof loadJson !== 'function'" in map_scripts_js, "map_scripts.js: idempotent loadJson pattern present")
    assert_test("var targetLayer = null;" in map_scripts_js, "map_scripts.js: local scoping of targetLayer in focusLocation")

    # Check JSON files
    for data_file in ["paris_metadata.json", "paris.geojson", "tour_data.json"]:
        dpath = os.path.join(ROOT_DIR, "data", data_file)
        assert_test(os.path.exists(dpath), f"data/{data_file} exists")
        with open(dpath, "r", encoding="utf-8") as f:
            data = json.load(f)
            assert_test(len(data) > 0, f"data/{data_file} is valid non-empty JSON")

if __name__ == "__main__":
    test_css_files()
    test_html_files()
    test_javascript_and_data()
    print("==========================================")
    print("ALL AUDIT VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("==========================================")
