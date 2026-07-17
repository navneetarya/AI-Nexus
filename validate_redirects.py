#!/usr/bin/env python3
"""
validate_redirects.py — AI Nexus redirect / trailing-slash validator

What it does
------------
1. Downloads your live sitemap.xml and treats every <loc> as the canonical
   URL for that page.
2. For each canonical URL, requests it directly and confirms it returns a
   plain 200 (no redirect, no chain).
3. For each canonical URL that ends in "/", also requests the same URL
   WITHOUT the trailing slash (the way a stray internal link or an old
   backlink would hit it) and reports whether that hits a redirect, a 404,
   or (correctly) resolves straight to 200.
4. Crawls every internal href it finds on each fetched page and flags any
   internal link that does NOT match its target page's canonical form
   (e.g. a link pointing to "/tools/windsurf" when the canonical is
   "/tools/windsurf/"). This is what actually causes Search Console's
   "Page with redirect" / "Redirect error" reports, so this check is the
   most important one.
5. Prints a clear pass/fail report and writes a JSON report to disk.

Usage
-----
    pip install requests beautifulsoup4 --break-system-packages
    python3 validate_redirects.py --site https://ainexustools.online

Options
-------
    --site URL          Base site URL (default: https://ainexustools.online)
    --sitemap URL        Override sitemap URL (default: <site>/sitemap.xml)
    --max-workers N       Parallel requests (default: 8)
    --timeout N           Per-request timeout in seconds (default: 15)
    --out FILE            JSON report path (default: redirect_report.json)
    --crawl-links / --no-crawl-links   Toggle step 4 (default: on)
"""

import argparse
import concurrent.futures as cf
import json
import sys
from urllib.parse import urljoin, urlparse
from xml.etree import ElementTree as ET

try:
    import requests
except ImportError:
    sys.exit("Missing dependency. Run:\n  pip install requests beautifulsoup4 --break-system-packages")

try:
    from bs4 import BeautifulSoup
    HAVE_BS4 = True
except ImportError:
    HAVE_BS4 = False

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; RedirectValidator/1.0; +https://ainexustools.online)"
}


def fetch(url, timeout, allow_redirects=True):
    """GET a URL, return (status_code, final_url, history_urls, text_or_None, error_or_None)."""
    try:
        resp = requests.get(
            url, headers=HEADERS, timeout=timeout,
            allow_redirects=allow_redirects,
        )
        history = [h.url for h in resp.history]
        return resp.status_code, resp.url, history, resp.text, None
    except requests.RequestException as e:
        return None, None, [], None, str(e)


def load_sitemap_urls(sitemap_url, timeout):
    status, final_url, history, text, err = fetch(sitemap_url, timeout)
    if err or status != 200 or not text:
        sys.exit(f"❌ Could not load sitemap at {sitemap_url}: {err or status}")

    urls = []
    try:
        root = ET.fromstring(text)
    except ET.ParseError as e:
        sys.exit(f"❌ Sitemap XML did not parse: {e}")

    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    for url_el in root.findall("sm:url", ns):
        loc_el = url_el.find("sm:loc", ns)
        if loc_el is not None and loc_el.text:
            urls.append(loc_el.text.strip())
    return urls


def check_canonical_url(url, timeout):
    """Check the exact sitemap URL loads clean (single hop, 200)."""
    status, final_url, history, text, err = fetch(url, timeout)
    issue = None
    if err:
        issue = f"request failed: {err}"
    elif status != 200:
        issue = f"unexpected status {status}"
    elif history:
        chain = " -> ".join([url] + [h for h in history[1:]] + [final_url]) if len(history) > 1 else f"{url} -> {final_url}"
        issue = f"redirected ({len(history)} hop(s)): {chain}"
    return {
        "url": url,
        "status": status,
        "final_url": final_url,
        "redirect_hops": len(history),
        "ok": issue is None,
        "issue": issue,
    }


def check_slash_variant(url, timeout):
    """For a canonical URL ending in '/', check the no-slash variant."""
    if not url.endswith("/"):
        return None
    bare = url[:-1]
    status, final_url, history, text, err = fetch(bare, timeout)

    result = {
        "canonical_url": url,
        "tested_url": bare,
        "status": status,
        "final_url": final_url,
        "redirect_hops": len(history),
    }

    if err:
        result["verdict"] = "ERROR"
        result["detail"] = err
    elif history:
        result["verdict"] = "REDIRECTS"
        result["detail"] = f"{len(history)} hop(s) before landing on {final_url}"
    elif status == 200 and final_url.rstrip("/") == bare.rstrip("/"):
        # Served directly with no redirect — fine, but note it explicitly
        result["verdict"] = "OK_NO_REDIRECT"
        result["detail"] = "served directly at the bare URL, no redirect needed"
    elif status == 404:
        result["verdict"] = "404"
        result["detail"] = "bare URL 404s outright (no fallback at all)"
    else:
        result["verdict"] = "UNEXPECTED"
        result["detail"] = f"status {status}"

    return result


def extract_internal_links(base_site, page_url, html):
    if not HAVE_BS4:
        return []
    soup = BeautifulSoup(html, "html.parser")
    parsed_site = urlparse(base_site)
    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if href.startswith("#") or href.startswith("mailto:") or href.startswith("tel:") or href.startswith("javascript:"):
            continue
        absolute = urljoin(page_url, href)
        parsed = urlparse(absolute)
        if parsed.netloc and parsed.netloc != parsed_site.netloc:
            continue  # external link
        # Strip query/fragment for the structural check
        clean = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
        links.append(clean)
    return links


def main():
    ap = argparse.ArgumentParser(description="Validate a site for redirect / trailing-slash issues.")
    ap.add_argument("--site", default="https://ainexustools.online")
    ap.add_argument("--sitemap", default=None)
    ap.add_argument("--max-workers", type=int, default=8)
    ap.add_argument("--timeout", type=int, default=15)
    ap.add_argument("--out", default="redirect_report.json")
    ap.add_argument("--crawl-links", dest="crawl_links", action="store_true", default=True)
    ap.add_argument("--no-crawl-links", dest="crawl_links", action="store_false")
    args = ap.parse_args()

    site = args.site.rstrip("/")
    sitemap_url = args.sitemap or f"{site}/sitemap.xml"

    print(f"→ Loading sitemap: {sitemap_url}")
    urls = load_sitemap_urls(sitemap_url, args.timeout)
    print(f"  Found {len(urls)} URLs in sitemap.\n")

    # Step 1: canonical URLs must be clean 200s
    print("→ Checking canonical URLs load with no redirects...")
    canonical_results = []
    with cf.ThreadPoolExecutor(max_workers=args.max_workers) as ex:
        futures = {ex.submit(check_canonical_url, u, args.timeout): u for u in urls}
        for fut in cf.as_completed(futures):
            canonical_results.append(fut.result())

    canonical_bad = [r for r in canonical_results if not r["ok"]]
    print(f"  {len(canonical_results) - len(canonical_bad)}/{len(canonical_results)} canonical URLs OK")
    if canonical_bad:
        print("  ⚠️  Problem canonical URLs:")
        for r in canonical_bad:
            print(f"     - {r['url']}: {r['issue']}")
    print()

    # Step 2: no-slash variants
    print("→ Checking bare (no trailing slash) variants of each URL...")
    slash_results = []
    with cf.ThreadPoolExecutor(max_workers=args.max_workers) as ex:
        futures = {ex.submit(check_slash_variant, u, args.timeout): u for u in urls if u.endswith("/")}
        for fut in cf.as_completed(futures):
            r = fut.result()
            if r:
                slash_results.append(r)

    redirecting = [r for r in slash_results if r["verdict"] == "REDIRECTS"]
    ok_direct = [r for r in slash_results if r["verdict"] == "OK_NO_REDIRECT"]
    not_found = [r for r in slash_results if r["verdict"] == "404"]
    errored = [r for r in slash_results if r["verdict"] == "ERROR"]

    print(f"  {len(ok_direct)} served directly with no redirect (good)")
    print(f"  {len(redirecting)} redirect when the trailing slash is missing (this is what GSC flags)")
    print(f"  {len(not_found)} 404 outright with no slash")
    print(f"  {len(errored)} errored")
    if redirecting:
        print("\n  ⚠️  URLs that redirect when requested without a trailing slash:")
        for r in redirecting[:50]:
            print(f"     - {r['tested_url']}  →  {r['detail']}")
        if len(redirecting) > 50:
            print(f"     ... and {len(redirecting) - 50} more (see {args.out})")
    print()

    # Step 3: crawl internal links on every page and flag mismatched hrefs
    link_issues = []
    if args.crawl_links:
        if not HAVE_BS4:
            print("→ Skipping internal link crawl (install beautifulsoup4 to enable this check).\n")
        else:
            print("→ Crawling internal links on every sitemap page for non-canonical hrefs...")
            canonical_set = set(u.rstrip("/") for u in urls)

            def fetch_and_check(u):
                status, final_url, history, text, err = fetch(u, args.timeout)
                if err or not text:
                    return []
                found = extract_internal_links(site, u, text)
                issues = []
                for link in found:
                    stripped = link.rstrip("/")
                    if stripped == "" or stripped == site:
                        continue
                    # If the stripped (no-slash) form matches a *canonical* sitemap
                    # URL but the link itself lacks the trailing slash that URL's
                    # canonical form uses, flag it.
                    if stripped in canonical_set and not link.endswith("/") and f"{stripped}/" in [x for x in urls]:
                        issues.append({"on_page": u, "bad_link": link, "should_be": f"{link}/"})
                return issues

            with cf.ThreadPoolExecutor(max_workers=args.max_workers) as ex:
                futures = {ex.submit(fetch_and_check, u): u for u in urls}
                for fut in cf.as_completed(futures):
                    link_issues.extend(fut.result())

            print(f"  Found {len(link_issues)} internal link(s) missing a trailing slash.")
            if link_issues:
                print("  ⚠️  Sample (up to 30):")
                for issue in link_issues[:30]:
                    print(f"     - on {issue['on_page']}: link to \"{issue['bad_link']}\" should be \"{issue['should_be']}\"")
                if len(link_issues) > 30:
                    print(f"     ... and {len(link_issues) - 30} more (see {args.out})")
            print()

    # Final report
    report = {
        "site": site,
        "sitemap_url": sitemap_url,
        "total_urls": len(urls),
        "canonical_url_issues": canonical_bad,
        "bare_url_checks": slash_results,
        "bare_url_redirect_count": len(redirecting),
        "internal_link_issues": link_issues,
    }
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    total_problems = len(canonical_bad) + len(redirecting) + len(link_issues)
    print("─" * 60)
    if total_problems == 0:
        print("✅ No redirect issues found.")
    else:
        print(f"❌ {total_problems} total issue(s) found. Full details in {args.out}")
    print("─" * 60)


if __name__ == "__main__":
    main()
