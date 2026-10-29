#!/usr/bin/env python3
"""
check_sitemap_urls.py  (T9a + T9b)

Fetches a sitemap, then requests every <loc> WITHOUT following redirects and reports:
  - non-200 responses (404, 5xx, timeouts)
  - redirects (301/302/...), with the Location target
  - duplicate <loc> entries
  - <url> entries missing <lastmod>
  - a count of URLs per section (tools, blog, compare, ...) for T9b

No third-party packages. Python 3.8+.

Usage
  python check_sitemap_urls.py
  python check_sitemap_urls.py https://ainexustools.online/sitemap.xml
  python check_sitemap_urls.py --expect-tools 81 --expect-blog 120
  python check_sitemap_urls.py --workers 4 --delay 0.2          # gentler on the host
  python check_sitemap_urls.py --json report.json

Test against a local build:
  (cd dist && python -m http.server 8000) &
  python check_sitemap_urls.py dist/sitemap.xml --rewrite-origin http://localhost:8000

Exit code: 0 = all URLs returned 200 with no redirects and no expectation failed; 1 otherwise.
"""
import argparse
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed

DEFAULT_SITEMAP = "https://ainexustools.online/sitemap.xml"
UA = "ai-nexus-sitemap-check/1.0 (+own-site audit)"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    """Return redirects as responses instead of following them."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


OPENER = urllib.request.build_opener(NoRedirect)


def read_sitemap(src):
    if src.startswith(("http://", "https://")):
        req = urllib.request.Request(src, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read()
    with open(src, "rb") as f:
        return f.read()


def parse_sitemap(xml_bytes):
    root = ET.fromstring(xml_bytes)
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    tag = root.tag.split("}")[-1]
    if tag == "sitemapindex":
        sys.exit("This is a sitemap index. Run the script once per child sitemap.")
    entries = []
    for u in root.findall("s:url", ns):
        loc = (u.findtext("s:loc", default="", namespaces=ns) or "").strip()
        lastmod = (u.findtext("s:lastmod", default="", namespaces=ns) or "").strip()
        entries.append({"loc": loc, "lastmod": lastmod})
    return entries


def section_of(url):
    path = urllib.parse.urlparse(url).path.strip("/")
    if not path:
        return "home"
    return path.split("/")[0]


def check(url, retries=2, timeout=20):
    last = None
    for attempt in range(retries + 1):
        req = urllib.request.Request(url, headers={"User-Agent": UA}, method="GET")
        try:
            with OPENER.open(req, timeout=timeout) as r:
                r.read(1024)  # touch the body, don't download it all
                return {"url": url, "status": r.status, "location": ""}
        except urllib.error.HTTPError as e:
            loc = e.headers.get("Location", "") if e.headers else ""
            if e.code in (429, 502, 503, 504) and attempt < retries:
                time.sleep(1.5 * (attempt + 1))
                last = {"url": url, "status": e.code, "location": loc}
                continue
            return {"url": url, "status": e.code, "location": loc}
        except Exception as e:  # timeout, DNS, TLS ...
            last = {"url": url, "status": 0, "location": "", "error": str(e)[:120]}
            if attempt < retries:
                time.sleep(1.0 * (attempt + 1))
    return last


def main():
    ap = argparse.ArgumentParser(description="Check every URL in a sitemap.")
    ap.add_argument("sitemap", nargs="?", default=DEFAULT_SITEMAP, help="URL or local file")
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--delay", type=float, default=0.0, help="seconds to sleep before each request")
    ap.add_argument("--rewrite-origin", help="replace scheme+host of every <loc> (for local testing)")
    ap.add_argument("--expect-tools", type=int, help="expected number of /tools/<slug>/ URLs")
    ap.add_argument("--expect-blog", type=int, help="expected number of /blog/<slug>/ URLs")
    ap.add_argument("--expect-compare", type=int, help="expected number of /compare/<slug>/ URLs")
    ap.add_argument("--json", help="write full results to this file")
    args = ap.parse_args()

    entries = parse_sitemap(read_sitemap(args.sitemap))
    if not entries:
        sys.exit("No <url> entries found.")

    dupes = [u for u, n in Counter(e["loc"] for e in entries).items() if n > 1]
    no_lastmod = [e["loc"] for e in entries if not e["lastmod"]]

    # T9b: counts per section. /tools/<slug>/ and /blog/<slug>/ exclude the index pages.
    sections = Counter()
    for e in entries:
        parts = urllib.parse.urlparse(e["loc"]).path.strip("/").split("/")
        if len(parts) >= 2:
            sections[parts[0]] += 1
        else:
            sections["(top-level pages)" if parts[0] else "(home)"] += 1

    urls = [e["loc"] for e in entries]
    if args.rewrite_origin:
        o = urllib.parse.urlparse(args.rewrite_origin)
        urls = [urllib.parse.urlparse(u)._replace(scheme=o.scheme, netloc=o.netloc).geturl() for u in urls]

    print(f"Sitemap: {args.sitemap}\n{len(urls)} URLs, checking with {args.workers} workers ...\n")

    def job(u):
        if args.delay:
            time.sleep(args.delay)
        return check(u)

    results = []
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = [ex.submit(job, u) for u in urls]
        for i, f in enumerate(as_completed(futs), 1):
            results.append(f.result())
            if i % 50 == 0 or i == len(urls):
                print(f"  {i}/{len(urls)}", end="\r", flush=True)
    print()

    ok = [r for r in results if r["status"] == 200]
    redirects = [r for r in results if 300 <= r["status"] < 400]
    errors = [r for r in results if r["status"] == 0 or r["status"] >= 400]

    print("=== T9a: status ===")
    print(f"200 OK:    {len(ok)}")
    print(f"Redirects: {len(redirects)}")
    print(f"Errors:    {len(errors)}")
    for r in sorted(redirects, key=lambda r: r["url"]):
        print(f"  REDIRECT {r['status']}  {r['url']}  ->  {r['location']}")
    for r in sorted(errors, key=lambda r: r["url"]):
        print(f"  ERROR    {r['status'] or 'n/a'}  {r['url']}  {r.get('error', '')}")

    print("\n=== T9b: counts per section ===")
    for name, n in sorted(sections.items(), key=lambda kv: (-kv[1], kv[0])):
        print(f"  {name:<22} {n}")

    failed = bool(redirects or errors or dupes)
    for label, key, expected in (
        ("tools", "tools", args.expect_tools),
        ("blog", "blog", args.expect_blog),
        ("compare", "compare", args.expect_compare),
    ):
        if expected is not None:
            actual = sections.get(key, 0)
            flag = "OK" if actual == expected else "MISMATCH"
            print(f"  expected {label}: {expected}, found {actual}  [{flag}]")
            failed = failed or actual != expected

    print("\n=== Other checks ===")
    print(f"Duplicate <loc>: {len(dupes)}" + ("".join(f"\n  {d}" for d in dupes[:10])))
    print(f"<url> without <lastmod>: {len(no_lastmod)}" + ("".join(f"\n  {d}" for d in no_lastmod[:10])))

    if args.json:
        with open(args.json, "w", encoding="utf-8") as f:
            json.dump({"results": results, "sections": dict(sections), "duplicates": dupes,
                       "no_lastmod": no_lastmod}, f, indent=2)
        print(f"\nFull results written to {args.json}")

    print("\nRESULT:", "FAIL" if failed else "PASS")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
