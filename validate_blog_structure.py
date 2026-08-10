#!/usr/bin/env python3
"""
validate_blog_structure.py
===========================
Sitewide Structure Audit — Tier 3 process fix.

Adds a repeatable build-guard to the existing validate_*.py family so the
three per-post content gaps found in the audit can never silently reappear
in new or edited posts:

  1. TABLE DEPTH  — a post's first <table> must not sit past 35% of the way
                     through its `content` HTML. Tables buried deep hurt
                     scan-ability and AEO/GEO table-extraction (Google AI
                     Overviews, Perplexity, ChatGPT search all prefer a
                     comparison table appearing early).
  2. PROSCONS      — every post must populate the `proscons` field
                     (pros[] + cons[] both non-empty).
  3. CTA COVERAGE  — every "best/named tool" ranking post must have a
                     styled CTA button (the site's affiliate button pattern)
                     for each tool it names in `outboundCitations`.

Run AFTER editing/adding a post in blog/*.ts, and again after
`npm run build`, alongside validate_audit_fixes.py etc.

Usage:
    python validate_blog_structure.py          # check all posts
    python validate_blog_structure.py --slug best-ai-coding-agents-2026

Exit code: 0 = all checks pass, 1 = one or more checks failed.
"""

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
BLOG = ROOT / "blog"

PASS = "\033[92m✅\033[0m"
FAIL = "\033[91m❌\033[0m"
WARN = "\033[93m⚠️ \033[0m"

# Files in blog/ that are NOT individual post modules.
NON_POST_FILES = {"index.ts", "types.ts", "loaders.ts", "metadata.ts"}

# ── Tunable thresholds ───────────────────────────────────────────────────────
TABLE_DEPTH_LIMIT_PCT = 35.0

# A "CTA button" = the site's affiliate button pattern used across posts:
# an outbound link, opened in a new tab, styled as an inline-block button
# with a rounded border (background color varies by post/tool).
#   <a href="https://tool.com?via=..." target="_blank" rel="noopener..."
#      style="display:inline-block;...border-radius:...">Try X Free →</a>
CTA_PATTERN = re.compile(
    r'<a\s+href="([^"]+)"\s+target="_blank"[^>]*'
    r'style="[^"]*display:inline-block[^"]*border-radius[^"]*"',
    re.IGNORECASE,
)

# Numbered ranking heading, e.g. "1. Intercom Fin — Best AI-First ..."
TOOL_HEADING_PATTERN = re.compile(
    r'<h[23][^>]*>\s*\d+\.\s+([A-Z][A-Za-z0-9.\'&\s]+?)(?:\s*[:—–-]\s*|\s*<)',
)

# `content` is a template literal that may or may not be the last field in
# the post object, so we can't anchor on `,\n};`. Every post file has exactly
# one backtick-quoted field (content itself contains no literal backticks),
# so a greedy match from the first backtick to the LAST backtick in the file
# reliably captures the full field regardless of field order.
CONTENT_FIELD_PATTERN = re.compile(r"content:\s*`(.*)`", re.S)
PROSCONS_FIELD_PATTERN = re.compile(
    r"proscons:\s*\{\s*pros:\s*\[(.*?)\]\s*,\s*cons:\s*\[(.*?)\]\s*,?\s*\}", re.S
)
OUTBOUND_CITATIONS_PATTERN = re.compile(
    r"outboundCitations:\s*\[(.*?)\n\s*\],", re.S
)
CITATION_URL_PATTERN = re.compile(r"url:\s*'([^']+)'")

# CTA hrefs are no longer hardcoded URLs — they're centralized references
# like ${AFFILIATE_LINKS['grammarly']} (see lib/affiliate-links.ts). To keep
# domain-matching working, resolve each slug back to its real URL/domain by
# reading the same single source of truth the site itself uses, instead of
# duplicating the link list here.
AFFILIATE_LINKS_TEMPLATE_PATTERN = re.compile(r"^\$\{AFFILIATE_LINKS\['([^']+)'\]\}$")


def _domain_from_url(url: str) -> str:
    m = re.search(r"https?://(?:www\.)?([^/?#]+)", url)
    return m.group(1).lower() if m else url.lower()


def _load_affiliate_link_domains() -> dict:
    """Parse constants.ts TOOLS[].{slug,affiliateLink} plus the
    SUPPLEMENTARY_LINKS block in lib/affiliate-links.ts, mirroring what
    AFFILIATE_LINKS resolves to at runtime, so slug → domain stays correct
    even after constants.ts links are edited."""
    domains = {}

    constants_src = (ROOT / "constants.ts").read_text(encoding="utf-8", errors="replace")
    for m in re.finditer(
        r"slug:\s*'([^']+)'.*?affiliateLink:\s*'([^']*)'", constants_src, re.S
    ):
        slug, url = m.group(1), m.group(2)
        if url:
            domains[slug] = _domain_from_url(url)

    lib_path = ROOT / "lib" / "affiliate-links.ts"
    if lib_path.exists():
        lib_src = lib_path.read_text(encoding="utf-8", errors="replace")
        supp_match = re.search(r"SUPPLEMENTARY_LINKS[^{]*\{(.*?)\n\};", lib_src, re.S)
        if supp_match:
            for m in re.finditer(r"['\"]?([\w-]+)['\"]?:\s*'([^']+)'", supp_match.group(1)):
                domains.setdefault(m.group(1), _domain_from_url(m.group(2)))

    return domains


AFFILIATE_LINK_DOMAINS = _load_affiliate_link_domains()


def get_domain(url: str) -> str:
    tmpl = AFFILIATE_LINKS_TEMPLATE_PATTERN.match(url.strip())
    if tmpl:
        slug = tmpl.group(1)
        return AFFILIATE_LINK_DOMAINS.get(slug, slug)
    return _domain_from_url(url)


def load_posts(slug_filter: str = None):
    posts = []
    for path in sorted(BLOG.glob("*.ts")):
        if path.name in NON_POST_FILES:
            continue
        slug = path.stem
        if slug_filter and slug != slug_filter:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        posts.append((slug, path, text))
    return posts


def check_table_depth(slug, content_html, failures):
    idx = content_html.find("<table")
    if idx == -1:
        return  # no table in this post — not this check's concern
    pct = (idx / len(content_html)) * 100
    if pct > TABLE_DEPTH_LIMIT_PCT:
        failures.append(
            (
                "TABLE-DEPTH",
                slug,
                f"first <table> sits at {pct:.0f}% of content (limit {TABLE_DEPTH_LIMIT_PCT:.0f}%)",
                "Move the comparison table earlier — ideally right after the intro/Quick Answer, "
                "before the first individual tool write-up.",
            )
        )


def check_proscons(slug, full_text, failures):
    m = PROSCONS_FIELD_PATTERN.search(full_text)
    if not m:
        failures.append(
            (
                "PROSCONS",
                slug,
                "proscons field is missing (or pros/cons arrays empty)",
                "Add a `proscons: { pros: [...], cons: [...] }` field with at least one entry each.",
            )
        )
        return
    pros_body, cons_body = m.group(1).strip(), m.group(2).strip()
    if not pros_body or not cons_body:
        failures.append(
            (
                "PROSCONS",
                slug,
                "proscons field present but pros[] or cons[] is empty",
                "Populate both the pros and cons arrays with at least one item each.",
            )
        )


def check_cta_coverage(slug, content_html, full_text, failures):
    citations_match = OUTBOUND_CITATIONS_PATTERN.search(full_text)
    if not citations_match:
        return  # nothing declared as a promotable tool — not a ranking post

    cited_domains = {
        get_domain(u) for u in CITATION_URL_PATTERN.findall(citations_match.group(1))
    }
    if not cited_domains:
        return

    cta_domains = {get_domain(u) for u in CTA_PATTERN.findall(content_html)}

    # Only enforce for posts that actually use the numbered-ranking format —
    # that's the pattern the site uses for "best X tools" posts.
    tool_headings = TOOL_HEADING_PATTERN.findall(content_html)
    if not tool_headings:
        return

    if not cta_domains:
        failures.append(
            (
                "CTA-COVERAGE",
                slug,
                f"0 CTA buttons found, but {len(tool_headings)} ranked tool(s) are named "
                f"({', '.join(tool_headings[:3])}{'...' if len(tool_headings) > 3 else ''})",
                "Add a styled CTA button (the site's `display:inline-block;...border-radius...` "
                "affiliate-button pattern) at the end of each tool's section.",
            )
        )
        return

    missing_domains = cited_domains - cta_domains
    if missing_domains:
        failures.append(
            (
                "CTA-COVERAGE",
                slug,
                f"{len(missing_domains)} named tool(s) have no matching CTA button: "
                f"{', '.join(sorted(missing_domains))}",
                "Add a CTA button linking to each of these domains near its section.",
            )
        )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug", help="Only check a single post by slug", default=None)
    args = parser.parse_args()

    posts = load_posts(args.slug)
    if not posts:
        print(f"{FAIL} No matching posts found in {BLOG}")
        sys.exit(1)

    print("\n" + "═" * 70)
    print("  AI NEXUS — BLOG STRUCTURE VALIDATION (Tier 3 / audit process fix)")
    print(f"  Checking {len(posts)} post(s) in blog/")
    print("═" * 70 + "\n")

    failures = []
    skipped = []

    for slug, path, full_text in posts:
        content_match = CONTENT_FIELD_PATTERN.search(full_text)
        if not content_match:
            skipped.append(slug)
            continue
        content_html = content_match.group(1)

        check_table_depth(slug, content_html, failures)
        check_proscons(slug, full_text, failures)
        check_cta_coverage(slug, content_html, full_text, failures)

    if skipped:
        print(f"{WARN} Skipped {len(skipped)} file(s) with no parseable `content` field: "
              f"{', '.join(skipped)}\n")

    if not failures:
        print(f"{PASS} All checks passed for {len(posts) - len(skipped)} post(s).\n")
        sys.exit(0)

    by_check = {}
    for check, slug, detail, fix in failures:
        by_check.setdefault(check, []).append((slug, detail, fix))

    for check, items in by_check.items():
        print(f"── {check} ({len(items)} post(s)) " + "─" * max(0, 40 - len(check)))
        for slug, detail, fix in items:
            print(f"  {FAIL} {slug}")
            print(f"         {detail}")
            print(f"         {WARN} FIX: {fix}")
        print()

    print("═" * 70)
    print(f"  {FAIL} {len(failures)} check(s) failed across "
          f"{len(set(f[1] for f in failures))} post(s).")
    print("═" * 70 + "\n")
    sys.exit(1)


if __name__ == "__main__":
    main()
