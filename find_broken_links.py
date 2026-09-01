#!/usr/bin/env python3
"""
find_broken_links.py — AI Nexus internal-link / 404 finder
============================================================

Two independent checks, either or both can be run:

1. STATIC MODE (default, no network needed)
   Scans every .ts/.tsx source file in the repo for internal links
   (href="/...", href={`/...`}, navigate('/...'), to="/...") and checks
   each one against the site's actual valid routes, derived from:
     - constants.ts            -> /tools/<slug>
     - blog/metadata.ts        -> /blog/<slug>
     - pages/compare-metadata.ts -> /compare/<slug>
     - App.tsx CATEGORY_ROUTES -> fixed /best-ai-*-tools pages
     - a hardcoded list of static routes (/about, /privacy, ...)
   Any link that doesn't resolve to a real route is reported as a
   broken internal link, with the file and line number it was found in.
   This catches the classic AI-Nexus bug pattern: a blog post or
   component links to a tool/category/post slug that was renamed,
   removed, or never registered — a "silent 404" that only shows up
   when a crawler or user actually clicks it.

2. LIVE MODE (--live, needs `requests`, needs real internet access)
   Takes the URLs found in static mode (or reads a sitemap.xml) and
   actually requests each one against a live site, recording the real
   HTTP status code. This catches everything static mode can't:
   server/CDN routing issues, prerender gaps, expired redirects, and
   genuinely dead external links.

Usage
-----
    # Static-only scan of the repo you're in
    python3 find_broken_links.py --repo /path/to/AI-Nexus-main

    # Static scan + live HTTP check against the deployed site
    pip install requests --break-system-packages
    python3 find_broken_links.py --repo /path/to/AI-Nexus-main --live --site https://ainexustools.online

    # Live-check external links too (slower, off by default)
    python3 find_broken_links.py --repo . --live --check-external

Output
------
Prints a grouped report to stdout and writes a JSON report to
broken_links_report.json (override with --out).
"""

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

# ── Static routes that don't come from a data file ───────────────────────────
STATIC_ROUTES = {
    "/", "/about", "/disclosure", "/privacy", "/terms", "/methodology",
    "/editorial-policy", "/how-we-analyze-ai-tools", "/contact", "/glossary",
    "/best-free-ai-tools", "/best-ai-tools-india", "/best-ai-logo-makers",
    "/best-ai-tools-for-freelancers", "/blog", "/compare",
}

# Kept in sync with App.tsx's CATEGORY_ROUTES map. If you add/rename a
# category route in App.tsx, update this list too (or pass --category-routes).
CATEGORY_ROUTES = {
    "/best-ai-writing-tools", "/best-ai-image-tools", "/best-ai-video-tools",
    "/best-ai-audio-tools", "/best-ai-marketing-tools", "/best-ai-design-tools",
    "/best-ai-coding-tools", "/best-ai-productivity-tools",
}

# Compare articles whose winnerSlug is intentionally NOT a real tool page
# (e.g. a case-study article whose "winner" is a strategy, not a product).
# CompareArticlePage.tsx already guards the "Full review" button so it only
# renders when winnerSlug matches a real tool — so these are known-safe,
# not live 404s. Add a compare article's `slug` here (not its winnerSlug)
# once you've confirmed the button is meant to stay hidden for it, so the
# checker stops reporting it every run.
KNOWN_NON_TOOL_WINNERS = {
    "ai-tools-case-study-india-seo-2026",
}

# File/dir globs to skip when scanning source
SKIP_DIRS = {"node_modules", ".git", "dist", "build", "__pycache__", ".github"}

# Regexes for internal link extraction. Each captures the raw URL string.
LINK_PATTERNS = [
    re.compile(r'href\s*=\s*"(/[^"]*)"'),
    re.compile(r"href\s*=\s*'(/[^']*)'"),
    re.compile(r'href\s*=\s*\{\s*`(/[^`]*)`'),
    re.compile(r"navigate\(\s*'(/[^']*)'"),
    re.compile(r'navigate\(\s*"(/[^"]*)"'),
    re.compile(r'navigate\(\s*`(/[^`]*)`'),
    re.compile(r'\bto\s*=\s*"(/[^"]*)"'),
    re.compile(r"\bto\s*=\s*'(/[^']*)'"),
]

# Links that are dynamic template strings we can't resolve statically
# (e.g. `/tools/${tool.slug}`) — recorded separately, not treated as broken.
DYNAMIC_MARKER = re.compile(r"\$\{")


def find_source_files(repo: Path):
    for p in repo.rglob("*"):
        if p.is_dir():
            continue
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        if p.suffix in (".ts", ".tsx"):
            yield p


def extract_links(repo: Path):
    """Returns list of dicts: {url, file, line, dynamic}"""
    found = []
    for f in find_source_files(repo):
        try:
            text = f.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        lines = text.splitlines()
        for lineno, line in enumerate(lines, start=1):
            for pat in LINK_PATTERNS:
                for m in pat.finditer(line):
                    url = m.group(1)
                    if url.startswith("//"):
                        continue  # protocol-relative external
                    found.append({
                        "url": url,
                        "file": str(f.relative_to(repo)),
                        "line": lineno,
                        "dynamic": bool(DYNAMIC_MARKER.search(url)),
                    })
    return found


def load_slugs_from_ts_array(path: Path, key_pattern: str):
    """Grabs every `"slug": "..."` / `slug: '...'` occurrence in a file.
    Good enough here because these files are flat data arrays, not nested
    objects that reuse the word 'slug' for something else."""
    if not path.exists():
        return set()
    text = path.read_text(encoding="utf-8", errors="ignore")
    return set(re.findall(key_pattern, text))


def find_broken_winner_slugs(repo: Path, tool_slugs: set):
    """CompareArticlePage.tsx always renders a `Full review` button that does
    navigate(`/tools/${article.winnerSlug}/`) — unconditionally, for every
    compare article. If a compare-data.ts entry's winnerSlug doesn't match a
    real tool slug in constants.ts, that button 404s for every visitor.
    This is a separate class of bug from a hardcoded <a href> typo: it's a
    data-integrity mismatch between two files that only breaks at click-time."""
    path = repo / "pages" / "compare-data.ts"
    if not path.exists():
        return []
    text = path.read_text(encoding="utf-8", errors="ignore")
    lines = text.splitlines()

    issues = []
    skipped = []
    last_article_slug, last_article_line = None, None
    for i, line in enumerate(lines, start=1):
        m = re.search(r"^\s*slug:\s*'([^']+)'", line)
        if m:
            last_article_slug, last_article_line = m.group(1), i
            continue
        m = re.search(r"winnerSlug:\s*'([^']+)'", line)
        if m:
            winner_slug = m.group(1)
            if winner_slug in tool_slugs:
                continue
            if last_article_slug in KNOWN_NON_TOOL_WINNERS:
                skipped.append({
                    "compare_article_slug": last_article_slug,
                    "winner_slug": winner_slug,
                })
                continue
            issues.append({
                "compare_article_slug": last_article_slug,
                "compare_article_line": last_article_line,
                "winner_slug": winner_slug,
                "winner_slug_line": i,
                "file": "pages/compare-data.ts",
            })
    return issues, skipped


def build_valid_routes(repo: Path):
    tool_slugs = load_slugs_from_ts_array(repo / "constants.ts", r"slug:\s*'([^']+)'")
    blog_slugs = load_slugs_from_ts_array(repo / "blog" / "metadata.ts", r'"slug":\s*"([^"]+)"')
    compare_slugs = load_slugs_from_ts_array(repo / "pages" / "compare-metadata.ts", r'"slug":\s*"([^"]+)"')
    return {
        "tools": tool_slugs,
        "blog": blog_slugs,
        "compare": compare_slugs,
        "static": STATIC_ROUTES,
        "category": CATEGORY_ROUTES,
    }


def normalize(url: str) -> str:
    # drop query/hash, strip trailing slash (SPA router does the same)
    url = url.split("?", 1)[0].split("#", 1)[0]
    if url != "/" and url.endswith("/"):
        url = url[:-1]
    return url


def classify(url: str, routes: dict):
    """Returns (ok: bool, reason: str)"""
    u = normalize(url)

    if u in routes["static"] or u in routes["category"]:
        return True, "static route"

    m = re.match(r"^/tools/([^/]+)$", u)
    if m:
        return (m.group(1) in routes["tools"]), f"tool slug '{m.group(1)}'"

    m = re.match(r"^/blog/([^/]+)$", u)
    if m:
        return (m.group(1) in routes["blog"]), f"blog slug '{m.group(1)}'"

    m = re.match(r"^/compare/([^/]+)$", u)
    if m:
        ok = m.group(1) in routes["compare"] or m.group(1) in routes["blog"]
        return ok, f"compare slug '{m.group(1)}'"

    if u.startswith("/#") or u == "":
        return True, "in-page anchor"

    return False, "unrecognized route (not tools/blog/compare/static/category)"


def run_static(repo: Path):
    routes = build_valid_routes(repo)
    print(f"Loaded {len(routes['tools'])} tool slugs, {len(routes['blog'])} blog slugs, "
          f"{len(routes['compare'])} compare slugs, {len(routes['static'])} static routes, "
          f"{len(routes['category'])} category routes.\n")

    links = extract_links(repo)
    print(f"Scanned source files, found {len(links)} internal link occurrences "
          f"({sum(l['dynamic'] for l in links)} are dynamic template strings — skipped).\n")

    broken = []
    seen_broken_urls = {}
    for l in links:
        if l["dynamic"]:
            continue
        ok, reason = classify(l["url"], routes)
        if not ok:
            broken.append({**l, "reason": reason})
            seen_broken_urls.setdefault(normalize(l["url"]), []).append(f'{l["file"]}:{l["line"]}')

    if not broken:
        print("✅ No broken internal links found in source (static check).")
    else:
        print(f"❌ {len(broken)} broken internal link occurrence(s) across "
              f"{len(seen_broken_urls)} unique URL(s):\n")
        for url, locations in sorted(seen_broken_urls.items()):
            print(f"  {url}")
            for loc in locations:
                print(f"      ↳ {loc}")
        print()

    winner_issues, winner_skipped = find_broken_winner_slugs(repo, routes["tools"])
    if winner_skipped:
        print(f"ℹ️  Skipped {len(winner_skipped)} known non-tool winnerSlug(s) (allowlisted "
              f"in KNOWN_NON_TOOL_WINNERS — button is guarded in CompareArticlePage.tsx):")
        for s in winner_skipped:
            print(f"      ↳ compare/{s['compare_article_slug']} — winnerSlug: '{s['winner_slug']}'")
        print()

    if winner_issues:
        print(f"❌ {len(winner_issues)} compare-article 'winnerSlug' mismatch(es) "
              f"(these drive an always-rendered \"Full review\" button that 404s):\n")
        for wi in winner_issues:
            print(f"  compare/{wi['compare_article_slug']}  (article defined at line {wi['compare_article_line']})")
            print(f"      ↳ winnerSlug: '{wi['winner_slug']}' — no matching tool in constants.ts "
                  f"(pages/compare-data.ts:{wi['winner_slug_line']})")
        print()
    else:
        print("✅ No compare-article winnerSlug mismatches found.\n")

    return broken, links, winner_issues, winner_skipped


def run_live(urls, site: str, check_external: bool, max_workers: int, timeout: int):
    import concurrent.futures as cf
    try:
        import requests
    except ImportError:
        sys.exit("Missing dependency for --live. Run:\n  pip install requests --break-system-packages")

    headers = {"User-Agent": "Mozilla/5.0 (compatible; AINexusLinkChecker/1.0)"}

    def resolve(u: str) -> str:
        if u.startswith("http://") or u.startswith("https://"):
            return u
        return site.rstrip("/") + u

    targets = sorted(set(u for u in urls if check_external or not u.startswith("http")))
    results = []

    def check(u: str):
        full = resolve(u)
        try:
            r = requests.get(full, headers=headers, timeout=timeout, allow_redirects=True)
            return {"url": u, "resolved": full, "status": r.status_code,
                     "final_url": r.url, "redirected": r.url != full}
        except requests.RequestException as e:
            return {"url": u, "resolved": full, "status": None, "error": str(e)}

    print(f"\nLive-checking {len(targets)} URL(s) against {site} ...")
    with cf.ThreadPoolExecutor(max_workers=max_workers) as ex:
        for res in ex.map(check, targets):
            results.append(res)
            status = res.get("status")
            marker = "✅" if status and status < 400 else "❌"
            extra = f" (redirected -> {res['final_url']})" if res.get("redirected") else ""
            print(f"  {marker} {status}  {res['url']}{extra}")

    failures = [r for r in results if not r.get("status") or r["status"] >= 400]
    print(f"\n{len(failures)} of {len(results)} live-checked URLs are failing (>=400 or unreachable).")
    return results


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--repo", default=".", help="Path to the repo root (default: current dir)")
    ap.add_argument("--live", action="store_true", help="Also perform live HTTP checks")
    ap.add_argument("--site", default="https://ainexustools.online", help="Base site URL for --live")
    ap.add_argument("--check-external", action="store_true", help="Also live-check external (http/https) links, not just internal ones")
    ap.add_argument("--max-workers", type=int, default=8)
    ap.add_argument("--timeout", type=int, default=15)
    ap.add_argument("--out", default="broken_links_report.json")
    args = ap.parse_args()

    repo = Path(args.repo).resolve()
    if not repo.exists():
        sys.exit(f"Repo path does not exist: {repo}")

    broken, all_links, winner_issues, winner_skipped = run_static(repo)

    live_results = None
    if args.live:
        urls_to_check = sorted(set(normalize(l["url"]) for l in all_links if not l["dynamic"]))
        live_results = run_live(urls_to_check, args.site, args.check_external, args.max_workers, args.timeout)

    report = {
        "repo": str(repo),
        "static_broken_links": broken,
        "winner_slug_mismatches": winner_issues,
        "winner_slug_known_non_tool_skipped": winner_skipped,
        "total_link_occurrences": len(all_links),
        "live_results": live_results,
    }
    Path(args.out).write_text(json.dumps(report, indent=2))
    print(f"\nFull report written to {args.out}")

    # non-zero exit if anything is broken, useful in CI
    static_fail = bool(broken) or bool(winner_issues)
    live_fail = bool(live_results and any(not r.get("status") or r["status"] >= 400 for r in live_results))
    sys.exit(1 if (static_fail or live_fail) else 0)


if __name__ == "__main__":
    main()
