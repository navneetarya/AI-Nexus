#!/usr/bin/env python3
"""
scripts/check_schema_visible.py  (T4.1)

Checks that the homepage's JSON-LD describes content a visitor can actually see AFTER React renders.
For each JSON-LD type in dist/index.html it prints "visible: yes/no" plus the reason:
  - FAQPage: every question appears in the rendered page text
  - ItemList (tools): every item name appears in the rendered page text
  - ItemList (site navigation): every destination has a visible header nav control
  - Person / Organization: the name (and the Person's job title) appears in the rendered page text
  - Speakable: every cssSelector matches at least one element in the rendered DOM
  - HowTo / SearchAction: must not be present at all

Usage:
  python3 scripts/check_schema_visible.py            # prints the table, exit 0
  python3 scripts/check_schema_visible.py --strict   # exit 1 if any row is "no"

Needs: a built dist/ (npm run build) and  pip install playwright && python3 -m playwright install chromium
"""
import argparse, functools, http.server, json, re, socketserver, sys, threading
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
norm = lambda s: re.sub(r"\s+", " ", str(s)).strip().lower()
NAV_KEYWORD = {"/": "tools", "/compare": "compare", "/blog": "blog", "/about": "about", "/glossary": "glossary"}


def flat(o):
    if isinstance(o, list):
        for x in o:
            yield from flat(x)
    elif isinstance(o, dict):
        if "@graph" in o:
            yield from flat(o["@graph"])
        else:
            yield o


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dist", default=str(ROOT / "dist"))
    ap.add_argument("--strict", action="store_true")
    args = ap.parse_args()
    dist = Path(args.dist)
    html = (dist / "index.html").read_text(encoding="utf8")
    nodes = [n for m in re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S)
             for n in flat(json.loads(m))]

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("Playwright missing. pip install playwright && python3 -m playwright install chromium")

    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    srv = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(dist)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}"

    rows = []  # (type, what, visible, note)
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1280, "height": 900})
        pg.goto(base + "/", wait_until="networkidle")
        pg.wait_for_timeout(2500)
        text = norm(pg.evaluate("document.body.innerText"))
        nav_text = norm(pg.evaluate("[...document.querySelectorAll('#shared-desktop-nav, header, nav')].map(e => e.textContent).join(' ')"))

        for n in nodes:
            t = n.get("@type")
            if t == "FAQPage":
                qs = [q["name"] for q in n.get("mainEntity", [])]
                miss = [q for q in qs if norm(q) not in text]
                rows.append(("FAQPage", f"{len(qs)} questions", not miss, "all questions on page" if not miss else f"missing: {miss[0][:50]}"))
            elif t == "ItemList":
                items = n.get("itemListElement", [])
                if n.get("name") == "Site Navigation":
                    miss = []
                    for i in items:
                        path = re.sub(r"^https?://[^/]+", "", i.get("url") or "").rstrip("/") or "/"
                        if NAV_KEYWORD.get(path, "\0") not in nav_text:
                            miss.append(i.get("name"))
                    rows.append(("ItemList (site navigation)", f"{len(items)} links", not miss, "nav controls present" if not miss else f"no nav control for: {miss}"))
                else:
                    names = [(i.get("name") or (i.get("item") or {}).get("name") or "") for i in items]
                    miss = [x for x in names if x and norm(x) not in text]
                    rows.append(("ItemList (tools)", f"{len(items)} items", not miss, "all names on page" if not miss else f"{len(miss)} not on page, e.g. {miss[0]}"))
            elif t == "Person":
                ok = norm(n.get("name", "")) in text and norm(n.get("jobTitle") or "") in text
                rows.append(("Person", n.get("name", ""), ok, "name and job title on page" if ok else "name or title not on page"))
            elif t == "Organization":
                ok = norm(n.get("name", "")) in text
                rows.append(("Organization", n.get("name", ""), ok, "name on page" if ok else "name not on page"))
            elif t in ("HowTo",):
                rows.append((t, "must not exist", False, "HowTo is deprecated; remove it"))
            if n.get("speakable"):
                for sel in n["speakable"].get("cssSelector", []):
                    cnt = pg.evaluate("s => document.querySelectorAll(s).length", sel)
                    rows.append(("Speakable", sel, cnt > 0, f"{cnt} match(es) in rendered DOM"))
        b.close()
    srv.shutdown()

    if "SearchAction" in html:
        rows.append(("WebSite", "SearchAction", False, "SearchAction must not exist (no site search page)"))

    w = max(len(r[0]) for r in rows)
    print(f"{'JSON-LD type'.ljust(w)}  visible  what / note")
    for t, what, ok, note in rows:
        print(f"{t.ljust(w)}  {'yes    ' if ok else 'NO     '}  {what} - {note}")
    bad = [r for r in rows if not r[2]]
    print(f"\n{len(rows) - len(bad)}/{len(rows)} rows visible")
    if args.strict and bad:
        sys.exit(1)


if __name__ == "__main__":
    main()
