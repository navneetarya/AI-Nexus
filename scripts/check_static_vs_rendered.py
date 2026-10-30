#!/usr/bin/env python3
"""
scripts/check_static_vs_rendered.py  (T0.1)

Compares what crawlers get (the prerendered static HTML in dist/) with what a
browser shows after React renders, for a list of routes.

Per route it prints:
  - H2 list in the static HTML
  - H2 list after JavaScript render (needs Playwright + Chromium)
  - sections present only in static (MISSING from rendered) and only in rendered (EXTRA)

Usage:
  python3 scripts/check_static_vs_rendered.py                       # homepage only
  python3 scripts/check_static_vs_rendered.py / /best-ai-writing-tools/
  python3 scripts/check_static_vs_rendered.py --static-only         # no browser needed
  python3 scripts/check_static_vs_rendered.py --json out.json       # save for baseline
  python3 scripts/check_static_vs_rendered.py --allow start-here,compare-tools,ai-blog-guides

Exit code: 0 always by default (it is a measurement tool).
           1 if --strict is given and any non-allowed static H2 is missing from the render.

One-time setup for the rendered side:
  pip install playwright && python3 -m playwright install chromium
"""
import argparse, http.server, json, re, socketserver, sys, threading, functools
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_ROUTES = ["/"]


def norm(text: str) -> str:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", "", text))).strip()


def static_sections(html: str):
    """Return [(section_id_or_None, h2_text)] from static HTML."""
    out = []
    # Find each <h2> and the nearest enclosing section id that opened before it.
    for m in re.finditer(r"<h2\b[^>]*>(.*?)</h2>", html, re.S | re.I):
        before = html[: m.start()]
        sec = None
        for sm in re.finditer(r'<section\b[^>]*\bid="([^"]+)"', before):
            sec = sm.group(1)
        # only attribute the id if no </section> closes after that section opened
        if sec is not None:
            last_open = before.rfind(f'id="{sec}"')
            if before.rfind("</section>") > last_open:
                sec = None
        out.append((sec, norm(m.group(1))))
    return out


def route_file(dist: Path, route: str) -> Path:
    r = route.strip("/")
    return dist / "index.html" if not r else dist / r / "index.html"


def start_server(dist: Path):
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(dist))
    handler.log_message = lambda *a, **k: None  # silence
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    h = functools.partial(Quiet, directory=str(dist))
    srv = socketserver.TCPServer(("127.0.0.1", 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("routes", nargs="*", default=DEFAULT_ROUTES)
    ap.add_argument("--dist", default=str(ROOT / "dist"))
    ap.add_argument("--static-only", action="store_true")
    ap.add_argument("--json", dest="json_out")
    ap.add_argument("--allow", default="", help="comma list of static section ids allowed to be missing")
    ap.add_argument("--strict", action="store_true")
    args = ap.parse_args()

    dist = Path(args.dist)
    if not dist.is_dir():
        sys.exit(f"dist/ not found at {dist}. Run `npm run build` first.")
    allow = {s.strip() for s in args.allow.split(",") if s.strip()}

    rendered = {}
    if not args.static_only:
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            sys.exit("Playwright missing. pip install playwright && python3 -m playwright install chromium  (or use --static-only)")
        srv = start_server(dist)
        base = f"http://127.0.0.1:{srv.server_address[1]}"
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={"width": 1280, "height": 900})
            for r in args.routes:
                page.goto(base + r, wait_until="networkidle")
                page.wait_for_timeout(1500)  # let lazy React routes settle
                rendered[r] = [norm(t) for t in page.eval_on_selector_all("h2", "els => els.map(e => e.textContent)")]
            browser.close()
        srv.shutdown()

    report, missing_total = {}, 0
    for r in args.routes:
        f = route_file(dist, r)
        if not f.exists():
            print(f"\n{r}: NOT FOUND in dist ({f})"); continue
        st = static_sections(f.read_text(encoding="utf8"))
        st_h2 = [t for _, t in st]
        print(f"\n=== {r} ===")
        print(f"static H2s: {len(st_h2)}", end="")
        if r in rendered:
            rd = rendered[r]
            print(f"   rendered H2s: {len(rd)}")
            rd_set = set(rd)
            missing = [(i, t) for i, t in st if t not in rd_set]
            extra = [t for t in rd if t not in set(st_h2)]
        else:
            rd, missing, extra = [], [], []
            print()
        for i, t in st:
            mark = ""
            if r in rendered:
                mark = "  ok" if t in set(rd) else "  MISSING in render"
                if t not in set(rd) and i in allow: mark += " (allowed)"
            print(f"  [static] {t}" + (f"  (#{i})" if i else "") + mark)
        for t in extra:
            print(f"  [rendered only] {t}")
        blocking = [(i, t) for i, t in missing if i not in allow]
        missing_total += len(blocking)
        if r in rendered:
            print(f"  -> missing from render: {len(missing)}  (blocking: {len(blocking)})   extra in render: {len(extra)}")
        report[r] = {"static_h2": st_h2, "static_ids": [i for i, _ in st],
                     "rendered_h2": rd if r in rendered else None,
                     "missing": [t for _, t in missing], "extra": extra}

    if args.json_out:
        Path(args.json_out).write_text(json.dumps(report, indent=2), encoding="utf8")
        print(f"\nSaved {args.json_out}")
    if args.strict and missing_total:
        sys.exit(1)

if __name__ == "__main__":
    main()
