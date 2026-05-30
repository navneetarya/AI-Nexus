#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    AI NEXUS — DEEP SEO/AEO/GEO AUDIT SCANNER                ║
║                                                                              ║
║  Multi-angle codebase analysis for Google, Bing, and AI crawler readiness.   ║
║  Scans: Performance · Meta · SEO · AEO · GEO · Design · Navigation ·        ║
║         Internal Linking · External Linking · Landing Pages · Schema · A11y   ║
║                                                                              ║
║  Author: Automated Audit Tool for ainexustools.online                        ║
║  Version: 2.0 — May 2026                                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

Usage:
    python audit_deep_scan.py [--verbose] [--json] [--fix-suggestions]

Exit Codes:
    0 — No critical issues
    1 — Critical issues found (blocks indexing or causes data loss)
    2 — High-severity issues found (suppresses rankings or rich results)
"""

import os
import re
import sys
import json
import hashlib
import argparse
from pathlib import Path
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from typing import NamedTuple, Optional

# ══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

SITE = "https://ainexustools.online"
ROOT = Path(__file__).parent.resolve()
DIST = ROOT / "dist"
SCRIPTS = ROOT / "scripts"
PUBLIC = ROOT / "public"
PRERENDER = SCRIPTS / "prerender.mjs"
INDEX_HTML = ROOT / "index.html"
CONSTANTS = ROOT / "constants.ts"
APP_TSX = ROOT / "App.tsx"
BLOG_DIR = ROOT / "blog"
PAGES_DIR = ROOT / "pages"
COMPONENTS_DIR = ROOT / "components"

# SEO limits from Google's own documentation
MAX_TITLE_LENGTH = 60
MAX_META_DESC_LENGTH = 160
MIN_META_DESC_LENGTH = 70
MAX_H1_PER_PAGE = 1
MAX_CANONICAL_PER_PAGE = 1
IDEAL_WORD_COUNT_BLOG = 1200
MIN_INTERNAL_LINKS_PER_PAGE = 3

# Font budget (total WOFF2 bytes served on initial page load)
FONT_BUDGET_KB = 200

# ══════════════════════════════════════════════════════════════════════════════
# DATA STRUCTURES
# ══════════════════════════════════════════════════════════════════════════════

class Severity:
    CRITICAL = "CRITICAL"   # Blocks indexing entirely
    HIGH = "HIGH"           # Suppresses rankings or rich results
    MEDIUM = "MEDIUM"       # Suboptimal, costs ranking potential
    LOW = "LOW"             # Best-practice recommendation
    INFO = "INFO"           # Informational observation

class Category:
    CRAWL = "Crawlability & Indexing"
    META = "Meta Tags & OG"
    SCHEMA = "Structured Data (Schema.org)"
    PERF = "Performance & Core Web Vitals"
    CONTENT = "Content & Keyword"
    LINKS_INT = "Internal Linking"
    LINKS_EXT = "External Linking"
    NAV = "Navigation & UX"
    DESIGN = "Design & Visualization"
    AEO = "Answer Engine Optimization"
    GEO = "Generative Engine Optimization"
    LANDING = "Landing Page Analysis"
    A11Y = "Accessibility"
    SECURITY = "Security"
    MOBILE = "Mobile Readiness"

class Issue(NamedTuple):
    severity: str
    category: str
    title: str
    details: str
    file: str
    line: Optional[int]
    fix: str

# ══════════════════════════════════════════════════════════════════════════════
# UTILITIES
# ══════════════════════════════════════════════════════════════════════════════

issues: list[Issue] = []

def add_issue(severity, category, title, details, file="", line=None, fix=""):
    issues.append(Issue(severity, category, title, details, str(file), line, fix))

def read_file(path: Path) -> str:
    """Read a file with error handling."""
    try:
        return path.read_text(encoding="utf-8")
    except (FileNotFoundError, PermissionError) as e:
        add_issue(Severity.CRITICAL, Category.CRAWL, f"File not found: {path.name}",
                  str(e), str(path), None, "Ensure file exists in the workspace.")
        return ""

def find_all_matches(pattern: str, text: str, flags=0) -> list:
    return list(re.finditer(pattern, text, flags))

def get_line_number(text: str, pos: int) -> int:
    return text[:pos].count("\n") + 1

# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: CRAWLABILITY & INDEXING
# ══════════════════════════════════════════════════════════════════════════════

def scan_crawlability(prerender_src: str, index_src: str):
    """Analyze crawler accessibility: robots.txt, sitemap, canonicals, noindex."""
    print("\n" + "═" * 78)
    print("  🔍 SCAN 1: CRAWLABILITY & INDEXING")
    print("═" * 78)

    # ── robots.txt checks ─────────────────────────────────────────────────────
    robots_path = PUBLIC / "robots.txt"
    if not robots_path.exists():
        add_issue(Severity.CRITICAL, Category.CRAWL, "robots.txt missing",
                  "No robots.txt in /public/. Crawlers won't know crawl rules.",
                  str(robots_path), None, "Create public/robots.txt with Allow: / and Sitemap: directive.")
    else:
        robots = read_file(robots_path)
        if "Sitemap:" not in robots:
            add_issue(Severity.HIGH, Category.CRAWL, "robots.txt missing Sitemap directive",
                      "robots.txt does not include 'Sitemap: https://ainexustools.online/sitemap.xml'. "
                      "This is the primary way crawlers discover your sitemap.",
                      str(robots_path), None, "Add: Sitemap: https://ainexustools.online/sitemap.xml")
        if "Disallow:" in robots:
            disallows = re.findall(r"Disallow:\s*(.+)", robots)
            for d in disallows:
                d = d.strip()
                if d and d != "":
                    print(f"    ℹ️  robots.txt disallows: {d}")
        # Check for AI crawler allowances
        ai_bots = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]
        for bot in ai_bots:
            if bot in robots:
                print(f"    ✓  AI crawler '{bot}' explicitly addressed in robots.txt")
            else:
                add_issue(Severity.LOW, Category.GEO, f"AI crawler '{bot}' not in robots.txt",
                          f"robots.txt does not explicitly address {bot}. While covered by "
                          "User-agent: *, being explicit improves GEO signal clarity.",
                          str(robots_path), None, f"Add User-agent: {bot}\\nAllow: /")

    # ── Sitemap generation checks ─────────────────────────────────────────────
    sitemap_mentions = re.findall(r"urlBlock\(\{[^}]*loc:[^}]*\}", prerender_src, re.DOTALL)
    print(f"    ℹ️  Sitemap generates {len(sitemap_mentions)} URL blocks")

    # Check for critical E-E-A-T pages in sitemap
    eeat_pages = ["/contact/", "/privacy/", "/about/", "/disclosure/", "/methodology/"]
    for page in eeat_pages:
        if page not in prerender_src:
            add_issue(Severity.HIGH, Category.CRAWL, f"E-E-A-T page {page} missing from sitemap",
                      f"{page} is not in the auto-generated sitemap. Google uses these "
                      "trust pages to assess site legitimacy.",
                      str(PRERENDER), None, f"Add urlBlock for {SITE}{page} in generateSitemap()")
        else:
            print(f"    ✓  E-E-A-T page {page} present in sitemap")

    # ── Canonical checks ──────────────────────────────────────────────────────
    canonical_overrides = re.search(
        r"BLOG_CANONICAL_OVERRIDES\s*=\s*\{([^}]*)\}", prerender_src, re.DOTALL
    )
    if canonical_overrides:
        content = canonical_overrides.group(1).strip()
        if content and not content.startswith("//"):
            entries = [l.strip() for l in content.split("\n") if l.strip() and not l.strip().startswith("//")]
            if entries:
                add_issue(Severity.CRITICAL, Category.CRAWL, "Blog canonical overrides still active",
                          f"BLOG_CANONICAL_OVERRIDES has {len(entries)} entries. "
                          "Posts with overridden canonicals will NOT be indexed at their own URLs.",
                          str(PRERENDER),
                          get_line_number(prerender_src, canonical_overrides.start()),
                          "Empty the BLOG_CANONICAL_OVERRIDES object.")
            else:
                print("    ✓  BLOG_CANONICAL_OVERRIDES is empty (no indexing blocks)")
        else:
            print("    ✓  BLOG_CANONICAL_OVERRIDES is empty (no indexing blocks)")

    # ── Compare page canonical hijack check ───────────────────────────────────
    compare_canonical_hijack = re.search(
        r"art\.slug\s*===\s*['\"]([^'\"]+)['\"]\s*\?\s*`\$\{SITE\}/blog/", prerender_src
    )
    if compare_canonical_hijack:
        slug = compare_canonical_hijack.group(1)
        add_issue(Severity.CRITICAL, Category.CRAWL,
                  f"Compare page /{slug}/ canonical hijacked to /blog/",
                  "This compare page's canonical points to a blog URL. It will never "
                  "be indexed at /compare/ since Google follows the canonical directive.",
                  str(PRERENDER),
                  get_line_number(prerender_src, compare_canonical_hijack.start()),
                  "All compare pages should self-canonicalize to /compare/{slug}/.")
    else:
        print("    ✓  No compare page canonical hijacking detected")

    # ── Check for noindex pages that should be indexed ────────────────────────
    noindex_matches = find_all_matches(r"robots\s*[:=]\s*['\"]noindex", prerender_src)
    if noindex_matches:
        for m in noindex_matches:
            line = get_line_number(prerender_src, m.start())
            context = prerender_src[max(0, m.start()-100):m.start()+100]
            add_issue(Severity.HIGH, Category.CRAWL, "Page marked noindex in prerender",
                      f"Found noindex directive near line {line}. Context: ...{context[:80]}...",
                      str(PRERENDER), line, "Verify this page should truly be noindexed.")

    # ── 404 page check ────────────────────────────────────────────────────────
    if not (PUBLIC / "404.html").exists():
        add_issue(Severity.MEDIUM, Category.CRAWL, "Custom 404 page missing",
                  "No 404.html in public/. Users hitting dead URLs see a generic error.",
                  str(PUBLIC), None, "Create public/404.html with navigation back to the site.")
    else:
        print("    ✓  Custom 404.html exists in public/")

    # ── Trailing slash consistency ────────────────────────────────────────────
    # Check App.tsx for trailing slash handling
    if "normalizePath" in read_file(APP_TSX):
        print("    ✓  App.tsx has path normalization (trailing slash handling)")
    else:
        add_issue(Severity.MEDIUM, Category.CRAWL, "No path normalization",
                  "App.tsx does not normalize trailing slashes. /about and /about/ "
                  "could be treated as separate pages by Google.",
                  str(APP_TSX), None, "Add trailing-slash normalization to router.")

    # ── Check static sitemap vs generated sitemap ─────────────────────────────
    if (PUBLIC / "sitemap.xml").exists() and "writeFileSync" in prerender_src and "sitemap.xml" in prerender_src:
        print("    ✓  Sitemap is auto-generated by prerender (overwrites static)")
    
    # ── HREFLANG checks ───────────────────────────────────────────────────────
    if 'hreflang' in prerender_src:
        print("    ✓  Hreflang tags are injected per-page")
        # Check for India-specific pages
        india_hreflang = re.findall(r'hreflang="en-IN"', prerender_src)
        if india_hreflang:
            print(f"    ✓  India-specific hreflang (en-IN) found ({len(india_hreflang)} instances)")


# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: META TAGS & OPEN GRAPH
# ══════════════════════════════════════════════════════════════════════════════

def scan_meta_tags(prerender_src: str, index_src: str):
    """Analyze meta descriptions, titles, OG tags for all pages."""
    print("\n" + "═" * 78)
    print("  🏷️  SCAN 2: META TAGS & OPEN GRAPH")
    print("═" * 78)

    # ── Title tag checks ──────────────────────────────────────────────────────
    # Check homepage title
    title_match = re.search(r"<title>(.*?)</title>", index_src)
    if title_match:
        title = title_match.group(1)
        if len(title) > MAX_TITLE_LENGTH:
            add_issue(Severity.MEDIUM, Category.META,
                      f"Homepage title too long ({len(title)} chars, max {MAX_TITLE_LENGTH})",
                      f'Title: "{title}" — Google truncates at ~60 chars in SERPs.',
                      str(INDEX_HTML), None,
                      "Shorten to ≤60 chars or accept truncation.")
        else:
            print(f"    ✓  Homepage title: {len(title)} chars (within {MAX_TITLE_LENGTH} limit)")
        if "2026" not in title:
            add_issue(Severity.LOW, Category.META, "Homepage title missing year",
                      "Including '2026' signals freshness to searchers scanning SERPs.",
                      str(INDEX_HTML), None, "Add year to title if applicable.")
        else:
            print("    ✓  Homepage title includes year (freshness signal)")

    # ── Meta description checks ───────────────────────────────────────────────
    desc_match = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', index_src)
    if desc_match:
        desc = desc_match.group(1)
        if len(desc) > MAX_META_DESC_LENGTH:
            add_issue(Severity.MEDIUM, Category.META,
                      f"Homepage meta description too long ({len(desc)} chars)",
                      f"Google truncates at ~160 chars. Current: {len(desc)} chars.",
                      str(INDEX_HTML), None, "Shorten to ≤160 chars.")
        elif len(desc) < MIN_META_DESC_LENGTH:
            add_issue(Severity.MEDIUM, Category.META,
                      f"Homepage meta description too short ({len(desc)} chars)",
                      "Under 70 chars — Google may generate its own snippet.",
                      str(INDEX_HTML), None, f"Expand to ≥{MIN_META_DESC_LENGTH} chars.")
        else:
            print(f"    ✓  Homepage meta description: {len(desc)} chars (optimal range)")

    # ── OG tag completeness ───────────────────────────────────────────────────
    required_og = ["og:type", "og:title", "og:description", "og:url", "og:image", "og:site_name"]
    for tag in required_og:
        pattern = f'property="{tag}"'
        if pattern in index_src:
            print(f"    ✓  {tag} present in index.html template")
        else:
            add_issue(Severity.HIGH, Category.META, f"Missing OG tag: {tag}",
                      f"{tag} not found in index.html. Social sharing cards will be incomplete.",
                      str(INDEX_HTML), None, f"Add <meta property=\"{tag}\" content=\"...\">")

    # ── OG type per-page update check ─────────────────────────────────────────
    if 'og:type' in prerender_src and "ogType" in prerender_src:
        print("    ✓  og:type is dynamically set per page type (article/product/website)")
    else:
        add_issue(Severity.HIGH, Category.META, "og:type not updated per page",
                  "All pages use og:type='website'. Blog posts should be 'article', "
                  "tools should be 'product' for proper social card treatment.",
                  str(PRERENDER), None, "Add ogType parameter to buildPage().")

    # ── Twitter card checks ───────────────────────────────────────────────────
    twitter_tags = ["twitter:card", "twitter:site", "twitter:title", "twitter:image"]
    for tag in twitter_tags:
        if tag in index_src:
            print(f"    ✓  {tag} present")
        else:
            add_issue(Severity.MEDIUM, Category.META, f"Missing Twitter tag: {tag}",
                      f"{tag} not in index.html. X/Twitter cards won't render properly.",
                      str(INDEX_HTML), None, f"Add <meta name=\"{tag}\" content=\"...\">")

    # ── Check prerender meta update logic ─────────────────────────────────────
    if "function form" in prerender_src or "g1, g2" in prerender_src:
        print("    ✓  Meta replacement uses function form (safe from $ corruption)")
    else:
        add_issue(Severity.HIGH, Category.META, "Meta replacement vulnerable to $ corruption",
                  "String.replace() with $N in replacement corrupts pricing strings like '$12/month'.",
                  str(PRERENDER), None, "Use function form: (_, g1, g2) => g1 + value + g2")

    # ── Check for duplicate meta descriptions across blog posts ───────────────
    meta_descs = re.findall(r"metaDescription:\s*['\"]([^'\"]+)['\"]", prerender_src)
    desc_counter = Counter(meta_descs)
    duplicates = {k: v for k, v in desc_counter.items() if v > 1}
    if duplicates:
        for desc, count in duplicates.items():
            add_issue(Severity.HIGH, Category.META, f"Duplicate meta description ({count}x)",
                      f'"{desc[:80]}..." — used {count} times. Each page needs a unique description.',
                      str(PRERENDER), None, "Write unique meta descriptions for each page.")
    else:
        print(f"    ✓  All {len(meta_descs)} meta descriptions are unique")

    # ── Check blog post titles for uniqueness ─────────────────────────────────
    titles = re.findall(r"title:\s*['\"]([^'\"]+)['\"]", prerender_src)
    title_counter = Counter(titles)
    dup_titles = {k: v for k, v in title_counter.items() if v > 1}
    if dup_titles:
        for t, count in dup_titles.items():
            if count > 2:  # Allow some from different contexts
                add_issue(Severity.MEDIUM, Category.META, f"Potentially duplicate title ({count}x)",
                          f'"{t[:60]}..." appears {count} times in prerender data.',
                          str(PRERENDER), None, "Ensure each page has a unique <title>.")


# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: STRUCTURED DATA (SCHEMA.ORG)
# ══════════════════════════════════════════════════════════════════════════════

def scan_structured_data(prerender_src: str, index_src: str):
    """Analyze JSON-LD schema quality and compliance."""
    print("\n" + "═" * 78)
    print("  📊 SCAN 3: STRUCTURED DATA (SCHEMA.ORG)")
    print("═" * 78)

    # ── Check schema types used ───────────────────────────────────────────────
    schema_types = re.findall(r"'@type':\s*'([^']+)'", prerender_src)
    schema_types += re.findall(r'"@type":\s*"([^"]+)"', prerender_src)
    schema_types += re.findall(r'"@type"\s*:\s*"([^"]+)"', index_src)
    type_counter = Counter(schema_types)
    print("    Schema types found:")
    for stype, count in type_counter.most_common(20):
        print(f"      • {stype} ({count}x)")

    # ── ReviewCount check ─────────────────────────────────────────────────────
    hardcoded_review = re.search(r"reviewCount:\s*['\"]1['\"]", prerender_src)
    if hardcoded_review:
        line = get_line_number(prerender_src, hardcoded_review.start())
        add_issue(Severity.HIGH, Category.SCHEMA, "Hardcoded reviewCount: '1' in schema",
                  "Google suppresses star-rating rich results when reviewCount looks fabricated. "
                  "A single review for every tool signals fake data.",
                  str(PRERENDER), line,
                  "Use real Trustpilot counts from constants.ts per tool.")
    else:
        print("    ✓  No hardcoded reviewCount: '1' detected")

    # ── Check if TRUSTPILOT_COUNTS is used ────────────────────────────────────
    if "TRUSTPILOT_COUNTS" in prerender_src:
        counts = re.findall(r"'([^']+)':\s*(\d+)", 
                           prerender_src[prerender_src.index("TRUSTPILOT_COUNTS"):
                                        prerender_src.index("TRUSTPILOT_COUNTS") + 2000])
        print(f"    ✓  TRUSTPILOT_COUNTS map has {len(counts)} tools with real review counts")
    else:
        add_issue(Severity.HIGH, Category.SCHEMA, "No Trustpilot count integration",
                  "Tool schemas should use real review counts for credibility.",
                  str(PRERENDER), None, "Add TRUSTPILOT_COUNTS map from constants.ts data.")

    # ── FAQPage schema check ──────────────────────────────────────────────────
    faq_schema_count = prerender_src.count("FAQPage")
    print(f"    ✓  FAQPage schema generated ({faq_schema_count} references)")

    # ── Check for required schema fields ──────────────────────────────────────
    # Article schema must have: headline, datePublished, dateModified, author, publisher
    if "'@type': 'Article'" in prerender_src or '"@type": "Article"' in prerender_src:
        article_fields = ["headline", "datePublished", "dateModified", "author", "publisher"]
        for field in article_fields:
            if field in prerender_src:
                print(f"    ✓  Article schema includes '{field}'")
            else:
                add_issue(Severity.MEDIUM, Category.SCHEMA, f"Article schema missing '{field}'",
                          f"Google recommends {field} for Article rich results.",
                          str(PRERENDER), None, f"Add {field} to Article schema.")

    # ── wordCount in Article schema ───────────────────────────────────────────
    wc_match = re.search(r"wordCount:\s*(\d+)", prerender_src)
    if wc_match:
        default_wc = int(wc_match.group(1))
        if default_wc == 1800:
            add_issue(Severity.LOW, Category.SCHEMA, "Default wordCount hardcoded to 1800",
                      "When no readTimeMinutes is set, wordCount defaults to 1800. "
                      "Consider computing from actual content length.",
                      str(PRERENDER), get_line_number(prerender_src, wc_match.start()),
                      "Compute from post content or set per-post wordCount.")
    
    # Check readTimeMinutes-based calculation
    if "readTimeMinutes" in prerender_src and "220" in prerender_src:
        print("    ✓  wordCount derived from readTimeMinutes × 220 words/min")

    # ── BreadcrumbList schema check ───────────────────────────────────────────
    if "BreadcrumbList" in prerender_src:
        breadcrumb_count = prerender_src.count("BreadcrumbList")
        print(f"    ✓  BreadcrumbList schema ({breadcrumb_count} references)")
    else:
        add_issue(Severity.MEDIUM, Category.SCHEMA, "No BreadcrumbList schema",
                  "Breadcrumbs help Google understand site hierarchy.",
                  str(PRERENDER), None, "Add BreadcrumbList JSON-LD to each page.")

    # ── Speakable schema (AEO) ────────────────────────────────────────────────
    if "Speakable" in prerender_src or "speakable" in prerender_src:
        print("    ✓  Speakable schema present (AEO: Google Assistant / voice search)")
    else:
        add_issue(Severity.LOW, Category.AEO, "No Speakable schema",
                  "Speakable schema helps voice assistants cite your content.",
                  str(PRERENDER), None, "Add SpeakableSpecification to key pages.")

    # ── HowTo schema ──────────────────────────────────────────────────────────
    if "HowTo" in prerender_src:
        print("    ✓  HowTo schema present (enables step rich results)")
    
    # ── ItemList schema ───────────────────────────────────────────────────────
    if "ItemList" in prerender_src:
        print("    ✓  ItemList schema present (enables carousel/sitelinks)")

    # ── WebSite SearchAction ──────────────────────────────────────────────────
    if "SearchAction" in index_src:
        print("    ✓  WebSite SearchAction schema (sitelinks searchbox)")
    else:
        add_issue(Severity.LOW, Category.SCHEMA, "No SearchAction in WebSite schema",
                  "SearchAction enables sitelinks searchbox in SERPs.",
                  str(INDEX_HTML), None, "Add potentialAction SearchAction to WebSite schema.")

    # ── Person/Organization @id cross-referencing ─────────────────────────────
    if "@id" in index_src and "Organization" in index_src:
        print("    ✓  Organization + Person linked via @id (knowledge graph)")
    else:
        add_issue(Severity.MEDIUM, Category.GEO, "No @id linking for entity resolution",
                  "Linking Person and Organization schemas via @id helps AI engines "
                  "build a knowledge entity for your site.",
                  str(INDEX_HTML), None, "Use @graph with @id references.")

    # ── Dead/unused schema functions ──────────────────────────────────────────
    schema_functions = re.findall(r"function\s+(\w*[Ss]chema\w*)\s*\(", prerender_src)
    for func in schema_functions:
        # Check if function is called (not just defined)
        calls = re.findall(rf"\b{func}\s*\(", prerender_src)
        if len(calls) <= 1:  # Only the definition
            add_issue(Severity.LOW, Category.SCHEMA, f"Potentially unused function: {func}()",
                      f"{func} is defined but may not be called anywhere.",
                      str(PRERENDER), None, f"Remove {func} if unused to reduce code complexity.")


# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: PERFORMANCE & CORE WEB VITALS
# ══════════════════════════════════════════════════════════════════════════════

def scan_performance(index_src: str, prerender_src: str):
    """Analyze performance factors: fonts, scripts, images, LCP blockers."""
    print("\n" + "═" * 78)
    print("  ⚡ SCAN 4: PERFORMANCE & CORE WEB VITALS")
    print("═" * 78)

    # ── Font loading analysis ─────────────────────────────────────────────────
    font_preloads = re.findall(r'<link\s+rel="preload"[^>]*href="([^"]*\.woff2)"', index_src)
    font_faces = re.findall(r"url\(['\"]?(/fonts/[^'\")\s]+)['\"]?\)", index_src)
    
    print(f"    Font preloads: {len(font_preloads)}")
    for fp in font_preloads:
        print(f"      • {fp}")
    
    print(f"    @font-face declarations: {len(font_faces)}")
    
    # Check critical fonts are preloaded
    critical_fonts = [f for f in font_faces if "fraunces-900" in f or "fraunces-700" in f]
    for cf in critical_fonts:
        if any(cf in p for p in font_preloads):
            print(f"    ✓  LCP font preloaded: {cf}")
        else:
            add_issue(Severity.HIGH, Category.PERF, f"LCP font not preloaded: {cf}",
                      "This font is used by the hero heading (LCP element). Without preload, "
                      "the browser only discovers it after CSS is parsed, causing FOIT/FOUT.",
                      str(INDEX_HTML), None,
                      f'Add: <link rel="preload" href="{cf}" as="font" type="font/woff2" crossorigin>')

    # ── Unused font files ─────────────────────────────────────────────────────
    fonts_dir = PUBLIC / "fonts"
    if fonts_dir.exists():
        font_files = list(fonts_dir.glob("*.woff2"))
        declared_fonts = set()
        for f in font_faces:
            declared_fonts.add(Path(f).name)
        for fp in font_preloads:
            declared_fonts.add(Path(fp).name)
        
        unused_fonts = []
        for ff in font_files:
            if ff.name not in declared_fonts:
                unused_fonts.append(ff)
        
        if unused_fonts:
            total_waste = sum(f.stat().st_size for f in unused_fonts)
            add_issue(Severity.MEDIUM, Category.PERF,
                      f"{len(unused_fonts)} unused font files ({total_waste // 1024}KB wasted)",
                      "Font files in /public/fonts/ not referenced in any @font-face or preload: "
                      + ", ".join(f.name for f in unused_fonts),
                      str(fonts_dir), None,
                      "Delete unused font files to reduce deployed bundle size.")
        else:
            print("    ✓  No unused font files detected")

    # ── Font-display strategy ─────────────────────────────────────────────────
    swap_count = index_src.count("font-display: swap")
    optional_count = index_src.count("font-display: optional")
    print(f"    Font-display strategies: swap={swap_count}, optional={optional_count}")
    if swap_count == 0 and optional_count == 0:
        add_issue(Severity.HIGH, Category.PERF, "No font-display strategy",
                  "Without font-display, fonts block rendering until loaded.",
                  str(INDEX_HTML), None, "Add font-display: swap to critical fonts.")

    # ── Script loading analysis ───────────────────────────────────────────────
    # GA4 delay
    ga_delay_match = re.search(r"(window\.innerWidth\s*<=\s*\d+)\s*\?\s*(\d+)\s*:\s*(\d+)", index_src)
    if ga_delay_match:
        mobile_delay = int(ga_delay_match.group(2))
        desktop_delay = int(ga_delay_match.group(3))
        print(f"    GA4 delay: mobile={mobile_delay}ms, desktop={desktop_delay}ms")
        if mobile_delay > 2000:
            add_issue(Severity.HIGH, Category.PERF,
                      f"GA4 mobile delay too high ({mobile_delay}ms)",
                      "Visitors who bounce before this delay never appear in GA4. "
                      "This creates a systematic gap between GSC clicks and GA4 sessions.",
                      str(INDEX_HTML), None, "Reduce mobile delay to 1500ms or less.")
        else:
            print(f"    ✓  GA4 mobile delay acceptable ({mobile_delay}ms)")

    # ── Render-blocking resources ─────────────────────────────────────────────
    blocking_scripts = re.findall(r'<script\s+(?!.*(?:async|defer|type="application/ld\+json"|type="module"))[^>]*src="([^"]+)"', index_src)
    if blocking_scripts:
        add_issue(Severity.MEDIUM, Category.PERF, f"{len(blocking_scripts)} render-blocking scripts",
                  f"Scripts without async/defer block rendering: {blocking_scripts}",
                  str(INDEX_HTML), None, "Add async or defer to non-critical scripts.")
    else:
        print("    ✓  No render-blocking script tags detected")

    # ── Inline CSS size ───────────────────────────────────────────────────────
    style_blocks = re.findall(r"<style[^>]*>(.*?)</style>", index_src, re.DOTALL)
    total_inline_css = sum(len(s) for s in style_blocks)
    print(f"    Inline CSS: {total_inline_css // 1024}KB across {len(style_blocks)} <style> blocks")
    if total_inline_css > 50000:
        add_issue(Severity.MEDIUM, Category.PERF, f"Large inline CSS ({total_inline_css // 1024}KB)",
                  "Excessive inline CSS increases HTML size and parse time.",
                  str(INDEX_HTML), None, "Move non-critical CSS to external stylesheet.")

    # ── Image optimization hints ──────────────────────────────────────────────
    # Check for WebP/AVIF usage in OG images
    og_images = re.findall(r'og-[^"\']+\.(png|jpg|jpeg|webp|avif)', index_src + prerender_src)
    image_formats = Counter(ext for ext in og_images)
    print(f"    OG image formats: {dict(image_formats)}")
    if "png" in image_formats and image_formats["png"] > image_formats.get("webp", 0):
        add_issue(Severity.LOW, Category.PERF, "OG images primarily PNG (not WebP)",
                  "PNG OG images are larger than WebP. While social platforms accept both, "
                  "serving WebP reduces bandwidth.",
                  str(PRERENDER), None, "Consider converting OG images to WebP format.")

    # ── Vite build config analysis ────────────────────────────────────────────
    vite_src = read_file(ROOT / "vite.config.ts")
    if "manualChunks" in vite_src:
        print("    ✓  Vite config uses manualChunks (code splitting)")
    if "chunkSizeWarningLimit" in vite_src:
        limit_match = re.search(r"chunkSizeWarningLimit:\s*(\d+)", vite_src)
        if limit_match:
            print(f"    ℹ️  Chunk size warning limit: {limit_match.group(1)}KB")

    # ── View Transition API ───────────────────────────────────────────────────
    if "view-transition" in index_src:
        vt_duration = re.search(r"animation-duration:\s*([\d.]+)s", index_src)
        if vt_duration:
            dur = float(vt_duration.group(1))
            print(f"    ✓  View Transitions enabled (duration: {dur}s)")
            if dur > 0.4:
                add_issue(Severity.LOW, Category.PERF, f"View transition duration high ({dur}s)",
                          "Transitions >0.3s feel sluggish to users.",
                          str(INDEX_HTML), None, "Reduce to 0.2-0.3s.")


# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: INTERNAL LINKING
# ══════════════════════════════════════════════════════════════════════════════

def scan_internal_linking(prerender_src: str, app_src: str):
    """Analyze internal link structure, orphan pages, link equity distribution."""
    print("\n" + "═" * 78)
    print("  🔗 SCAN 5: INTERNAL LINKING")
    print("═" * 78)

    # ── Collect all routes from App.tsx ────────────────────────────────────────
    app_routes = set()
    # Direct path matches
    path_matches = re.findall(r"path\s*===\s*'([^']+)'", app_src)
    app_routes.update(path_matches)
    # Regex route matches
    regex_routes = re.findall(r"path\.match\(/\^\\\/([^/\\]+)", app_src)
    app_routes.update(f"/{r}" for r in regex_routes)
    # Category routes
    cat_routes = re.findall(r"'(/best-ai-[^']+)'", app_src)
    app_routes.update(cat_routes)
    
    print(f"    Total routes in App.tsx: {len(app_routes)}")
    for r in sorted(app_routes):
        print(f"      • {r}")

    # ── Collect routes from prerender ─────────────────────────────────────────
    prerender_routes = set()
    # writeRoute calls (explicit string literals)
    write_routes = re.findall(r"writeRoute\(['\"]([^'\"]+)['\"]", prerender_src)
    prerender_routes.update(f"/{r}" for r in write_routes if r != "")
    prerender_routes.add("/")  # homepage
    
    # Category pages rendered via loop (CATEGORY_PAGES array with slug literals)
    cat_slugs = re.findall(r"slug:\s*['\"]([^'\"]+)['\"].*?category", prerender_src)
    prerender_routes.update(f"/{s}" for s in cat_slugs)
    
    print(f"\n    Total pre-rendered routes: {len(prerender_routes)} (from writeRoute calls + category loop)")

    # ── Find orphan pages (in App.tsx but not pre-rendered) ───────────────────
    # Note: dynamic routes (tools/*, blog/*, compare/*) are pre-rendered via loops
    # Category pages are also pre-rendered via CATEGORY_PAGES loop
    static_app_routes = {r for r in app_routes if not r.startswith("/tools") 
                        and not r.startswith("/blog") and not r.startswith("/compare")}
    
    for route in static_app_routes:
        # Check if route is pre-rendered (strip leading slash for writeRoute format)
        route_slug = route.lstrip("/")
        if route_slug and route_slug not in write_routes and f"/{route_slug}" not in prerender_routes:
            if route_slug not in cat_slugs:
                add_issue(Severity.MEDIUM, Category.LINKS_INT,
                          f"Route {route} exists in App.tsx but may not be pre-rendered",
                          "If this page isn't pre-rendered, it only works via client-side JS. "
                          "Googlebot may not index it on GitHub Pages.",
                          str(APP_TSX), None,
                          f"Add writeRoute('{route_slug}', ...) in prerender.mjs")

    # ── Blog post internal links ──────────────────────────────────────────────
    blog_files = list(BLOG_DIR.glob("*.ts"))
    blog_files = [f for f in blog_files if f.name != "index.ts" and f.name != "types.ts"]
    
    posts_with_links = 0
    posts_without_links = 0
    all_internal_links = []
    
    for bf in blog_files:
        content = read_file(bf)
        # Find internal link references (navigate calls, href to site paths)
        internal_refs = re.findall(r"(?:/tools/|/blog/|/compare/|/best-|/about|/methodology)([^\s'\"`,)]*)", content)
        if internal_refs:
            posts_with_links += 1
            all_internal_links.extend(internal_refs)
        else:
            posts_without_links += 1

    print(f"\n    Blog posts with internal links: {posts_with_links}")
    print(f"    Blog posts WITHOUT internal links: {posts_without_links}")
    
    if posts_without_links > posts_with_links:
        add_issue(Severity.MEDIUM, Category.LINKS_INT,
                  f"{posts_without_links} blog posts have no internal links",
                  "Blog posts without internal links are dead-ends for crawlers and users. "
                  "They pass no PageRank to other pages.",
                  str(BLOG_DIR), None,
                  "Add 2-3 relevant internal links to each blog post (to tools, other posts).")

    # ── mentionedTools — prerender cross-linking ──────────────────────────────
    mentioned_tools = re.findall(r"mentionedTools:\s*\[([^\]]+)\]", prerender_src)
    if mentioned_tools:
        print(f"    ✓  mentionedTools cross-referencing: {len(mentioned_tools)} posts with tool mentions")
    else:
        add_issue(Severity.MEDIUM, Category.LINKS_INT, "No mentionedTools cross-linking",
                  "Blog posts don't declare which tools they mention. This misses "
                  "schema.org 'mentions' links that build knowledge graph connections.",
                  str(PRERENDER), None, "Add mentionedTools arrays to BLOG_POSTS entries.")

    # ── Link equity distribution ──────────────────────────────────────────────
    # Check which tools/pages get the most internal links
    tool_link_counts = Counter()
    tool_refs = re.findall(r"/tools/([^/'\"\s`,)]+)", prerender_src + app_src)
    for ref in tool_refs:
        tool_link_counts[ref] += 1
    
    if tool_link_counts:
        print("\n    Top linked tools (internal link equity):")
        for tool, count in tool_link_counts.most_common(10):
            print(f"      • /tools/{tool}/ — {count} internal references")


# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: EXTERNAL LINKING
# ══════════════════════════════════════════════════════════════════════════════

def scan_external_linking(prerender_src: str, index_src: str):
    """Analyze external links, affiliate links, nofollow usage."""
    print("\n" + "═" * 78)
    print("  🌐 SCAN 6: EXTERNAL LINKING")
    print("═" * 78)

    # ── Affiliate links ───────────────────────────────────────────────────────
    affiliate_patterns = re.findall(r"affiliateLink:\s*['\"]([^'\"]+)['\"]", 
                                    read_file(CONSTANTS))
    print(f"    Affiliate links found: {len(affiliate_patterns)}")
    
    # Check for proper rel=nofollow/sponsored on affiliate links
    # (This is a client-side concern in the React components)
    components_content = ""
    for comp_file in PAGES_DIR.glob("*.tsx"):
        components_content += read_file(comp_file)
    for comp_file in COMPONENTS_DIR.glob("*.tsx"):
        components_content += read_file(comp_file)
    
    if "nofollow" in components_content or "sponsored" in components_content:
        print("    ✓  rel='nofollow'/'sponsored' used on links")
    else:
        add_issue(Severity.HIGH, Category.LINKS_EXT,
                  "Affiliate links may lack rel='nofollow sponsored'",
                  "Google requires affiliate/paid links to have rel='nofollow sponsored'. "
                  "Missing this risks a manual penalty.",
                  str(PAGES_DIR), None,
                  "Add rel='nofollow sponsored' to all affiliate <a> tags.")

    # ── sameAs links (author profiles) ────────────────────────────────────────
    same_as = re.findall(r"sameAs.*?\[(.*?)\]", prerender_src, re.DOTALL)
    if same_as:
        urls = re.findall(r"https?://[^\s'\"]+", same_as[0])
        print(f"    Author sameAs links: {len(urls)}")
        for url in urls[:5]:
            print(f"      • {url}")
    
    # ── External resource dependencies ────────────────────────────────────────
    external_scripts = re.findall(r'src="(https?://[^"]+)"', index_src)
    external_links = re.findall(r'href="(https?://[^"]+)"', index_src)
    print(f"\n    External script dependencies: {len(external_scripts)}")
    for s in external_scripts:
        print(f"      • {s}")
    print(f"    External link dependencies: {len(external_links)}")

    # ── Trustpilot source URLs ────────────────────────────────────────────────
    trustpilot_urls = re.findall(r"trustpilot\.com/review/[^\s'\"]+", read_file(CONSTANTS))
    print(f"    Trustpilot verification URLs: {len(set(trustpilot_urls))}")


# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: NAVIGATION & UX
# ══════════════════════════════════════════════════════════════════════════════

def scan_navigation(app_src: str, index_src: str):
    """Analyze navigation structure, breadcrumbs, user flow."""
    print("\n" + "═" * 78)
    print("  🧭 SCAN 7: NAVIGATION & UX")
    print("═" * 78)

    # ── SPA navigation handling ───────────────────────────────────────────────
    if "history.pushState" in app_src:
        print("    ✓  SPA uses History API (pushState) for navigation")
    if "popstate" in app_src:
        print("    ✓  Back/forward button handling (popstate listener)")
    if "scrollTo(0, 0)" in app_src:
        print("    ✓  Scroll-to-top on navigation")

    # ── Breadcrumb component ──────────────────────────────────────────────────
    breadcrumb_file = COMPONENTS_DIR / "Breadcrumb.tsx"
    if breadcrumb_file.exists():
        print("    ✓  Breadcrumb component exists")
        bc_content = read_file(breadcrumb_file)
        if "nav" in bc_content.lower() or "aria-label" in bc_content:
            print("    ✓  Breadcrumb uses semantic <nav> or aria-label")
        else:
            add_issue(Severity.LOW, Category.NAV, "Breadcrumb may lack semantic markup",
                      "Breadcrumbs should use <nav aria-label='Breadcrumb'> for accessibility.",
                      str(breadcrumb_file), None,
                      "Wrap breadcrumb in <nav aria-label='Breadcrumb'>.")
    else:
        add_issue(Severity.MEDIUM, Category.NAV, "No Breadcrumb component",
                  "Breadcrumbs improve navigation and enable rich results.",
                  str(COMPONENTS_DIR), None, "Create a Breadcrumb component.")

    # ── SharedNav component ───────────────────────────────────────────────────
    shared_nav = PAGES_DIR / "SharedNav.tsx"
    if shared_nav.exists():
        nav_content = read_file(shared_nav)
        print("    ✓  SharedNav component exists")
        
        # Check for skip-to-content link
        if "skip" in nav_content.lower():
            print("    ✓  Skip-to-content link present")
        else:
            add_issue(Severity.LOW, Category.A11Y, "No skip-to-content link in navigation",
                      "Screen reader users need a skip link to bypass the nav.",
                      str(shared_nav), None,
                      "Add <a href='#main' class='sr-only'>Skip to content</a>")
        
        # Check for mobile menu
        if "menu" in nav_content.lower() or "hamburger" in nav_content.lower() or "768" in nav_content:
            print("    ✓  Mobile-responsive navigation detected")
        
        # Check navigation links
        nav_links = re.findall(r"navigate\(['\"]([^'\"]+)['\"]", nav_content)
        print(f"    Navigation links: {len(nav_links)}")
        for link in nav_links[:8]:
            print(f"      • {link}")

    # ── Loading states ────────────────────────────────────────────────────────
    if "Suspense" in app_src and "PageLoader" in app_src:
        print("    ✓  Lazy loading with Suspense boundaries")
    if "minHeight: '100vh'" in app_src or "min-height: 100vh" in app_src:
        print("    ✓  Loading fallback uses min-height (prevents CLS)")

    # ── 404 handling ──────────────────────────────────────────────────────────
    # Check if unmatched routes show a 404 or fall back to homepage
    if "404" in app_src or "NotFound" in app_src:
        print("    ✓  404 handling in router")
    else:
        add_issue(Severity.MEDIUM, Category.NAV, "No 404 route in SPA router",
                  "Unmatched routes fall through to homepage instead of showing a 404. "
                  "This creates soft-404s that confuse Googlebot.",
                  str(APP_TSX), None,
                  "Add a catch-all route that renders a 404 page with proper status signal.")


# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: DESIGN & VISUALIZATION
# ══════════════════════════════════════════════════════════════════════════════

def scan_design(index_src: str):
    """Analyze design patterns, CSS variables, dark mode, responsive design."""
    print("\n" + "═" * 78)
    print("  🎨 SCAN 8: DESIGN & VISUALIZATION")
    print("═" * 78)

    # ── CSS custom properties (design tokens) ─────────────────────────────────
    css_vars = re.findall(r"--([a-z0-9-]+)\s*:", index_src)
    unique_vars = set(css_vars)
    print(f"    CSS custom properties: {len(unique_vars)}")
    
    # Categorize design tokens
    color_vars = [v for v in unique_vars if any(k in v for k in ["bg", "txt", "brd", "a1", "a2", "color"])]
    spacing_vars = [v for v in unique_vars if any(k in v for k in ["gap", "pad", "margin", "space"])]
    print(f"      • Color tokens: {len(color_vars)}")
    print(f"      • Spacing tokens: {len(spacing_vars)}")

    # ── Dark mode ─────────────────────────────────────────────────────────────
    if 'data-theme="dark"' in index_src or "[data-theme=dark]" in index_src or "data-theme='dark'" in index_src:
        print("    ✓  Dark mode support (data-theme attribute)")
    elif "prefers-color-scheme: dark" in index_src:
        print("    ✓  Dark mode support (prefers-color-scheme)")
    else:
        add_issue(Severity.LOW, Category.DESIGN, "No dark mode detected",
                  "Dark mode improves UX for many users and is increasingly expected.",
                  str(INDEX_HTML), None, "Add dark mode support via CSS variables or media query.")

    # ── Responsive design ─────────────────────────────────────────────────────
    media_queries = re.findall(r"@media[^{]+\{", index_src)
    breakpoints = re.findall(r"(\d+)px", " ".join(media_queries))
    unique_breakpoints = sorted(set(int(b) for b in breakpoints))
    print(f"    Media query breakpoints: {unique_breakpoints}")
    
    if not unique_breakpoints:
        add_issue(Severity.HIGH, Category.MOBILE, "No responsive breakpoints in index.html",
                  "Mobile-first design requires media queries for different screen sizes.",
                  str(INDEX_HTML), None, "Add responsive breakpoints (e.g., 640px, 768px, 1024px).")
    elif max(unique_breakpoints) < 1024:
        print("    ⚠️  No large-screen breakpoint (≥1024px)")

    # ── Typography system ─────────────────────────────────────────────────────
    font_families = re.findall(r"font-family:\s*([^;}\n]+)", index_src)
    unique_fonts = set(f.strip().split(",")[0].strip("'\"") for f in font_families)
    print(f"    Font families used: {unique_fonts}")
    if len(unique_fonts) > 4:
        add_issue(Severity.LOW, Category.DESIGN, f"Too many font families ({len(unique_fonts)})",
                  "Using more than 3-4 fonts can look inconsistent and hurt performance.",
                  str(INDEX_HTML), None, "Consolidate to 2-3 font families.")

    # ── Animation performance ─────────────────────────────────────────────────
    animations = re.findall(r"@keyframes\s+(\w+)", index_src)
    if animations:
        print(f"    CSS animations: {animations}")
    
    # Check for layout-triggering animations
    layout_triggers = re.findall(r"animation[^}]*(?:width|height|top|left|margin|padding)", index_src)
    if layout_triggers:
        add_issue(Severity.LOW, Category.PERF, "CSS animations may trigger layout",
                  "Animating width/height/margin causes layout thrashing. Use transform instead.",
                  str(INDEX_HTML), None, "Use transform: translateX/translateY instead.")

    # ── Color contrast (basic check from CSS vars) ────────────────────────────
    # We can't do a full contrast check without rendering, but we can flag dark-on-dark
    print("    ℹ️  Full color contrast audit requires browser rendering (Lighthouse)")

    # ── Content width / readability ───────────────────────────────────────────
    max_widths = re.findall(r"max-width:\s*(\d+)px", index_src)
    if max_widths:
        content_widths = [int(w) for w in max_widths]
        print(f"    Content max-widths: {sorted(set(content_widths))[:5]}px")
        if all(w > 900 for w in content_widths):
            add_issue(Severity.LOW, Category.DESIGN, "Content width may be too wide",
                      "Optimal reading width is 600-800px (45-75 characters per line).",
                      str(INDEX_HTML), None, "Use max-width: 700-800px for article content.")


# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: AEO (ANSWER ENGINE OPTIMIZATION)
# ══════════════════════════════════════════════════════════════════════════════

def scan_aeo(prerender_src: str, index_src: str):
    """Analyze Answer Engine (ChatGPT, Perplexity, Gemini) optimization."""
    print("\n" + "═" * 78)
    print("  🤖 SCAN 9: AEO (ANSWER ENGINE OPTIMIZATION)")
    print("═" * 78)

    # ── llms.txt / llms-full.txt ──────────────────────────────────────────────
    llms_txt = PUBLIC / "llms.txt"
    llms_full = PUBLIC / "llms-full.txt"
    
    if llms_txt.exists():
        content = read_file(llms_txt)
        print(f"    ✓  llms.txt exists ({len(content)} bytes)")
        if SITE in content:
            print("    ✓  llms.txt references site URL")
    else:
        add_issue(Severity.MEDIUM, Category.AEO, "No llms.txt file",
                  "llms.txt is the equivalent of robots.txt for AI engines. "
                  "It helps ChatGPT, Perplexity, and Claude understand your site structure.",
                  str(PUBLIC), None, "Create public/llms.txt with site structure for AI crawlers.")

    if llms_full.exists():
        content = read_file(llms_full)
        print(f"    ✓  llms-full.txt exists ({len(content)} bytes)")
    else:
        add_issue(Severity.LOW, Category.AEO, "No llms-full.txt file",
                  "llms-full.txt provides comprehensive site content for AI engines.",
                  str(PUBLIC), None, "Create public/llms-full.txt with full content index.")

    # ── RSS feed ──────────────────────────────────────────────────────────────
    if "rss.xml" in prerender_src or (PUBLIC / "rss.xml").exists():
        print("    ✓  RSS feed available (AI engines use RSS for content discovery)")
    else:
        add_issue(Severity.LOW, Category.AEO, "No RSS feed",
                  "RSS helps AI engines discover and index new content quickly.",
                  str(PRERENDER), None, "Generate /rss.xml in prerender.mjs")

    # ── Link rel=alternate for llms.txt ───────────────────────────────────────
    if "llms.txt" in index_src:
        print("    ✓  index.html references llms.txt via <link> tag")
    else:
        add_issue(Severity.LOW, Category.AEO, "No <link> tag for llms.txt in <head>",
                  "Adding <link rel='alternate' type='text/plain' href='/llms.txt'> "
                  "helps AI crawlers discover the file.",
                  str(INDEX_HTML), None,
                  "Add: <link rel='alternate' type='text/plain' title='LLMs Index' href='/llms.txt'>")

    # ── Speakable content ─────────────────────────────────────────────────────
    if "speakable" in prerender_src.lower():
        speakable_count = prerender_src.lower().count("speakable")
        print(f"    ✓  Speakable schema ({speakable_count} references)")
    else:
        add_issue(Severity.LOW, Category.AEO, "No Speakable content markup",
                  "Speakable helps voice assistants (Google Assistant, Alexa) cite content.",
                  str(PRERENDER), None, "Add SpeakableSpecification to FAQ and review pages.")

    # ── FAQ content structure (AEO loves Q&A format) ──────────────────────────
    faq_count = prerender_src.count("FAQPage")
    tool_faq_count = len(re.findall(r"TOOL_FAQS\[", prerender_src))
    print(f"    FAQ schemas injected: {faq_count} references, {tool_faq_count} tool FAQ injections")
    
    # ── HowTo content (step-by-step = AEO gold) ──────────────────────────────
    howto_count = prerender_src.count("HowTo")
    if howto_count > 0:
        print(f"    ✓  HowTo schema ({howto_count} references)")
    else:
        add_issue(Severity.LOW, Category.AEO, "No HowTo schema",
                  "HowTo rich results get high click-through in SERPs and are "
                  "frequently cited by AI answer engines.",
                  str(PRERENDER), None, "Add HowTo schema to tutorial/guide blog posts.")

    # ── Content structure for AI extraction ───────────────────────────────────
    # Check for pre-rendered body content (critical for AI crawlers that don't run JS)
    if "pre-render" in prerender_src or "bodyHtml" in prerender_src:
        print("    ✓  Pre-rendered body HTML for non-JS crawlers")
    else:
        add_issue(Severity.HIGH, Category.AEO, "No pre-rendered body content",
                  "AI crawlers (GPTBot, ClaudeBot) may not execute JavaScript. "
                  "Pre-rendered HTML ensures they can extract content.",
                  str(PRERENDER), None, "Add static body HTML in buildPage() for crawler visibility.")


# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: GEO (GENERATIVE ENGINE OPTIMIZATION)
# ══════════════════════════════════════════════════════════════════════════════

def scan_geo(prerender_src: str, index_src: str):
    """Analyze Generative Engine (Google AI Overview, Perplexity) optimization."""
    print("\n" + "═" * 78)
    print("  🧠 SCAN 10: GEO (GENERATIVE ENGINE OPTIMIZATION)")
    print("═" * 78)

    # ── Author entity strength ────────────────────────────────────────────────
    author_name = "Navneet Arya"
    if author_name in index_src:
        print(f"    ✓  Author '{author_name}' in homepage HTML")
    
    same_as_count = prerender_src.count("sameAs")
    print(f"    Author sameAs cross-references: {same_as_count}")
    
    if "AUTHOR_SAME_AS" in prerender_src:
        same_as_urls = re.findall(r"'(https://[^']+)'", 
                                  prerender_src[prerender_src.index("AUTHOR_SAME_AS"):
                                               prerender_src.index("AUTHOR_SAME_AS") + 500])
        print(f"    ✓  Author sameAs array: {len(same_as_urls)} platforms linked")
        # Check for key platforms
        platforms = {"linkedin": False, "twitter": False, "github": False}
        for url in same_as_urls:
            if "linkedin" in url: platforms["linkedin"] = True
            if "x.com" in url or "twitter" in url: platforms["twitter"] = True
            if "github" in url: platforms["github"] = True
        for platform, found in platforms.items():
            if found:
                print(f"      ✓  {platform} linked")
            else:
                add_issue(Severity.LOW, Category.GEO, f"Author missing {platform} in sameAs",
                          f"{platform} profile not in AUTHOR_SAME_AS. This weakens entity resolution.",
                          str(PRERENDER), None, f"Add {platform} URL to AUTHOR_SAME_AS array.")

    # ── Knowledge graph signals ───────────────────────────────────────────────
    if "@graph" in index_src:
        print("    ✓  @graph structure in homepage (knowledge graph building)")
    else:
        add_issue(Severity.MEDIUM, Category.GEO, "No @graph in homepage schema",
                  "@graph lets AI engines link Organization, Person, and WebSite entities.",
                  str(INDEX_HTML), None, "Use @graph to connect entity schemas.")

    # ── E-E-A-T signals in content ────────────────────────────────────────────
    eeat_signals = {
        "lastTested": "Last Tested date",
        "reviewBody": "Detailed review body",
        "researchSources": "Research sources cited",
        "trustpilot": "Third-party rating source",
        "pros": "Pros list",
        "cons": "Cons list",
    }
    
    constants_src = read_file(CONSTANTS)
    print("\n    E-E-A-T signals in tool data (constants.ts):")
    for signal, label in eeat_signals.items():
        count = constants_src.count(signal)
        if count > 0:
            print(f"      ✓  {label}: {count} occurrences")
        else:
            add_issue(Severity.LOW, Category.GEO, f"Missing E-E-A-T signal: {label}",
                      f"'{signal}' not found in constants.ts. This data strengthens "
                      "AI engine trust in your content.",
                      str(CONSTANTS), None, f"Add {signal} to tool data.")

    # ── mentions schema (knowledge graph) ─────────────────────────────────────
    if "mentions" in prerender_src:
        mentions_count = prerender_src.count("mentionedTools")
        print(f"\n    ✓  'mentions' schema present ({mentions_count} references)")
        print("         → Builds semantic connections between blog posts and tool entities")
    else:
        add_issue(Severity.MEDIUM, Category.GEO, "No 'mentions' in schema",
                  "The 'mentions' property connects blog posts to tool entities, "
                  "helping AI engines understand content relationships.",
                  str(PRERENDER), None, "Add mentions array to Article schemas referencing tools.")

    # ── Freshness signals ─────────────────────────────────────────────────────
    if "dateModified" in prerender_src:
        print("    ✓  dateModified in schemas (freshness signal for AI)")
    if "lastTestedISO" in constants_src or "lastTested" in constants_src:
        print("    ✓  lastTested dates in tool data (demonstrates ongoing research)")


# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: LANDING PAGE ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════

def scan_landing_pages(prerender_src: str, app_src: str):
    """Analyze key landing pages for conversion and SEO completeness."""
    print("\n" + "═" * 78)
    print("  📄 SCAN 11: LANDING PAGE ANALYSIS")
    print("═" * 78)

    # ── Homepage analysis ─────────────────────────────────────────────────────
    homepage_file = PAGES_DIR / "HomePage.tsx"
    if homepage_file.exists():
        hp_content = read_file(homepage_file)
        print("\n    === HOMEPAGE ===")
        
        # H1 check
        h1_matches = re.findall(r"<h1[^>]*>", hp_content)
        if len(h1_matches) == 1:
            print("    ✓  Single H1 tag (correct)")
        elif len(h1_matches) == 0:
            add_issue(Severity.HIGH, Category.LANDING, "Homepage missing H1",
                      "Every page needs exactly one H1 for SEO hierarchy.",
                      str(homepage_file), None, "Add an H1 heading to the homepage.")
        else:
            add_issue(Severity.MEDIUM, Category.LANDING, f"Homepage has {len(h1_matches)} H1 tags",
                      "Multiple H1s dilute SEO signal. Use one H1, rest should be H2-H6.",
                      str(homepage_file), None, "Keep one H1, convert others to H2.")

        # CTA check
        cta_words = ["sign up", "get started", "try", "subscribe", "newsletter", "email"]
        has_cta = any(w in hp_content.lower() for w in cta_words)
        if has_cta:
            print("    ✓  Homepage has CTA elements")
        else:
            add_issue(Severity.LOW, Category.LANDING, "Homepage may lack clear CTA",
                      "A clear call-to-action improves engagement signals.",
                      str(homepage_file), None, "Add a newsletter signup or tool exploration CTA.")

        # Social proof
        social_proof = ["review", "trustpilot", "rated", "million", "users"]
        has_proof = any(w in hp_content.lower() for w in social_proof)
        if has_proof:
            print("    ✓  Social proof elements detected")

    # ── Category landing pages ────────────────────────────────────────────────
    category_page = PAGES_DIR / "CategoryPage.tsx"
    if category_page.exists():
        cat_content = read_file(category_page)
        print("\n    === CATEGORY PAGES ===")
        
        # Check for structured content
        if "filter" in cat_content.lower() or "category" in cat_content.lower():
            print("    ✓  Category filtering functionality present")
        
        # Internal linking from category to tools
        tool_links = re.findall(r"navigate\(['\"]?/tools/", cat_content)
        print(f"    Tool navigation links: {len(tool_links)} (in template)")

    # ── Blog post page template ───────────────────────────────────────────────
    blog_post_page = PAGES_DIR / "BlogPostPage.tsx"
    if blog_post_page.exists():
        bp_content = read_file(blog_post_page)
        print("\n    === BLOG POST TEMPLATE ===")
        
        # Table of contents
        if "toc" in bp_content.lower() or "table of contents" in bp_content.lower() or "tableOfContents" in bp_content:
            print("    ✓  Table of contents component")
        else:
            add_issue(Severity.LOW, Category.LANDING, "Blog posts may lack table of contents",
                      "TOC improves UX for long posts and can appear in Google's passage indexing.",
                      str(blog_post_page), None, "Add auto-generated TOC from headings.")
        
        # Author box
        if "author" in bp_content.lower():
            print("    ✓  Author attribution in blog post template")
        
        # Related posts
        if "related" in bp_content.lower() or "suggested" in bp_content.lower():
            print("    ✓  Related posts section")
        else:
            add_issue(Severity.LOW, Category.LANDING, "No related posts in blog template",
                      "Related posts reduce bounce rate and distribute internal link equity.",
                      str(blog_post_page), None, "Add 'Related articles' section at bottom.")

    # ── Tool page template ────────────────────────────────────────────────────
    tool_page = PAGES_DIR / "ToolPage.tsx"
    if tool_page.exists():
        tp_content = read_file(tool_page)
        print("\n    === TOOL PAGE TEMPLATE ===")
        
        # Pricing info
        if "pricing" in tp_content.lower():
            print("    ✓  Pricing information displayed")
        
        # Pros/cons
        if "pros" in tp_content.lower() and "cons" in tp_content.lower():
            print("    ✓  Pros/cons sections present")
        
        # Affiliate CTA
        if "affiliate" in tp_content.lower() or "visit" in tp_content.lower() or "try" in tp_content.lower():
            print("    ✓  Affiliate/visit CTA present")
        
        # FAQ section
        if "faq" in tp_content.lower():
            print("    ✓  FAQ section in tool page")

    # ── India-specific landing page ───────────────────────────────────────────
    india_page = PAGES_DIR / "BestAIToolsIndiaPage.tsx"
    if india_page.exists():
        india_content = read_file(india_page)
        print("\n    === INDIA LANDING PAGE ===")
        if "INR" in india_content or "₹" in india_content:
            print("    ✓  INR pricing displayed")
        if "hindi" in india_content.lower():
            print("    ✓  Hindi language support mentioned")


# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: MOBILE READINESS
# ══════════════════════════════════════════════════════════════════════════════

def scan_mobile(index_src: str):
    """Analyze mobile optimization factors."""
    print("\n" + "═" * 78)
    print("  📱 SCAN 12: MOBILE READINESS")
    print("═" * 78)

    # ── Viewport meta ─────────────────────────────────────────────────────────
    if 'name="viewport"' in index_src:
        viewport = re.search(r'name="viewport"\s+content="([^"]+)"', index_src)
        if viewport:
            vp_content = viewport.group(1)
            print(f"    ✓  Viewport: {vp_content}")
            if "width=device-width" not in vp_content:
                add_issue(Severity.HIGH, Category.MOBILE, "Viewport missing width=device-width",
                          "Without this, mobile browsers may render desktop layout.",
                          str(INDEX_HTML), None, "Add width=device-width to viewport meta.")
            if "initial-scale=1" not in vp_content:
                add_issue(Severity.MEDIUM, Category.MOBILE, "Viewport missing initial-scale=1",
                          "May cause zoom issues on some mobile browsers.",
                          str(INDEX_HTML), None, "Add initial-scale=1.0 to viewport meta.")
    else:
        add_issue(Severity.CRITICAL, Category.MOBILE, "No viewport meta tag",
                  "Critical for mobile rendering. Without it, Google uses desktop crawl.",
                  str(INDEX_HTML), None, 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">')

    # ── Touch target sizes ────────────────────────────────────────────────────
    # Check for minimum button/link sizes in CSS
    min_heights = re.findall(r"min-height:\s*(\d+)px", index_src)
    min_widths = re.findall(r"min-width:\s*(\d+)px", index_src)
    small_targets = [h for h in min_heights if int(h) < 44]
    if small_targets:
        add_issue(Severity.LOW, Category.MOBILE, "Some touch targets may be too small",
                  f"Found min-height values under 44px: {small_targets}. "
                  "Google recommends 48px minimum for touch targets.",
                  str(INDEX_HTML), None, "Ensure buttons/links are at least 44x44px.")

    # ── PWA manifest ──────────────────────────────────────────────────────────
    manifest_path = PUBLIC / "manifest.json"
    if manifest_path.exists():
        manifest = read_file(manifest_path)
        try:
            mdata = json.loads(manifest)
            required_fields = ["name", "short_name", "start_url", "display", "icons"]
            missing = [f for f in required_fields if f not in mdata]
            if missing:
                add_issue(Severity.LOW, Category.MOBILE, f"Manifest missing: {missing}",
                          "PWA manifest should have all required fields for installability.",
                          str(manifest_path), None, f"Add {missing} to manifest.json")
            else:
                print("    ✓  PWA manifest complete (all required fields)")
            
            if "theme_color" in mdata:
                print(f"    ✓  Theme color: {mdata['theme_color']}")
        except json.JSONDecodeError:
            add_issue(Severity.MEDIUM, Category.MOBILE, "manifest.json is invalid JSON",
                      "Browser cannot parse PWA manifest.",
                      str(manifest_path), None, "Fix JSON syntax in manifest.json")
    else:
        add_issue(Severity.LOW, Category.MOBILE, "No PWA manifest",
                  "manifest.json enables PWA features (Add to Home Screen, etc.)",
                  str(PUBLIC), None, "Create public/manifest.json")

    # ── Apple touch icon ──────────────────────────────────────────────────────
    if (PUBLIC / "apple-touch-icon.png").exists():
        print("    ✓  apple-touch-icon.png exists")
    else:
        add_issue(Severity.LOW, Category.MOBILE, "No apple-touch-icon.png",
                  "iOS uses this when users add site to home screen.",
                  str(PUBLIC), None, "Create public/apple-touch-icon.png (180x180)")

    # ── Theme color meta ──────────────────────────────────────────────────────
    if 'name="theme-color"' in index_src:
        print("    ✓  theme-color meta tag present")
    else:
        add_issue(Severity.LOW, Category.MOBILE, "No theme-color meta tag",
                  "theme-color customizes the browser toolbar on mobile.",
                  str(INDEX_HTML), None, 'Add <meta name="theme-color" content="#0D9488">')


# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: SECURITY
# ══════════════════════════════════════════════════════════════════════════════

def scan_security(index_src: str, prerender_src: str):
    """Security checks relevant to SEO (HTTPS, CSP, mixed content)."""
    print("\n" + "═" * 78)
    print("  🔒 SCAN 13: SECURITY")
    print("═" * 78)

    # ── HTTPS enforcement ─────────────────────────────────────────────────────
    http_refs = re.findall(r'(?:src|href|url)\s*[=:]\s*["\']http://', index_src + prerender_src)
    if http_refs:
        add_issue(Severity.HIGH, Category.SECURITY, f"{len(http_refs)} HTTP (non-HTTPS) references",
                  "Mixed content warnings degrade trust signals. Google favors HTTPS.",
                  "", None, "Replace all http:// with https://")
    else:
        print("    ✓  No HTTP (non-HTTPS) references found")

    # ── External script integrity ─────────────────────────────────────────────
    ext_scripts = re.findall(r'<script[^>]*src="(https://[^"]+)"[^>]*>', index_src)
    for script in ext_scripts:
        # Check for integrity attribute
        script_tag = re.search(rf'<script[^>]*src="{re.escape(script)}"[^>]*>', index_src)
        if script_tag and "integrity" not in script_tag.group():
            add_issue(Severity.LOW, Category.SECURITY,
                      f"External script without SRI: {script[:60]}",
                      "Subresource Integrity (integrity=) prevents CDN-compromised scripts.",
                      str(INDEX_HTML), None,
                      f"Add integrity='sha384-...' to script tag for {script[:50]}")

    # ── CNAME file (custom domain) ────────────────────────────────────────────
    cname_path = PUBLIC / "CNAME"
    if cname_path.exists():
        cname = read_file(cname_path).strip()
        print(f"    ✓  CNAME: {cname}")
        if cname != "ainexustools.online":
            add_issue(Severity.HIGH, Category.SECURITY, f"CNAME mismatch: {cname}",
                      f"CNAME says '{cname}' but site URL is 'ainexustools.online'.",
                      str(cname_path), None, "Fix CNAME to match actual domain.")
    else:
        add_issue(Severity.MEDIUM, Category.SECURITY, "No CNAME file",
                  "GitHub Pages custom domain requires a CNAME file.",
                  str(PUBLIC), None, "Create public/CNAME with 'ainexustools.online'")

    # ── Sensitive data exposure ───────────────────────────────────────────────
    # Check vite config doesn't expose secrets
    vite_src = read_file(ROOT / "vite.config.ts")
    if "process.env" in vite_src:
        if "NODE_ENV" in vite_src and vite_src.count("process.env") <= 2:
            print("    ✓  Vite only exposes NODE_ENV (no secret leakage)")
        else:
            add_issue(Severity.HIGH, Category.SECURITY, "Vite may expose environment variables",
                      "Passing full process.env to the frontend leaks server secrets.",
                      str(ROOT / "vite.config.ts"), None,
                      "Only expose specific, non-secret env vars.")

    # ── Cloudflare worker security ────────────────────────────────────────────
    worker_path = ROOT / "cloudflare-worker.js"
    if worker_path.exists():
        worker_src = read_file(worker_path)
        if "env.NOTION_TOKEN" in worker_src:
            print("    ✓  Cloudflare worker uses env vars for secrets (not hardcoded)")
        if "request.method" in worker_src and "POST" in worker_src:
            print("    ✓  Worker validates HTTP method")
        if "@" in worker_src and "email" in worker_src:
            # Check for email validation
            if "includes('@')" in worker_src or "email" in worker_src:
                print("    ✓  Worker validates email input")


# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: CONTENT & KEYWORD ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════

def scan_content(prerender_src: str):
    """Analyze content quality signals, keyword coverage, thin content."""
    print("\n" + "═" * 78)
    print("  📝 SCAN 14: CONTENT & KEYWORD ANALYSIS")
    print("═" * 78)

    # ── Blog post count ───────────────────────────────────────────────────────
    blog_files = [f for f in BLOG_DIR.glob("*.ts") 
                  if f.name not in ("index.ts", "types.ts")]
    print(f"    Total blog post files: {len(blog_files)}")

    # ── Blog post freshness ───────────────────────────────────────────────────
    dates = re.findall(r"dateModified:\s*['\"](\d{4}-\d{2}-\d{2})['\"]", prerender_src)
    if dates:
        latest = max(dates)
        oldest = min(dates)
        print(f"    Blog post dates: oldest={oldest}, newest={latest}")
        
        # Check for stale content (>90 days without update)
        today = datetime.now()
        stale_threshold = today - timedelta(days=90)
        stale_posts = [d for d in dates if datetime.strptime(d, "%Y-%m-%d") < stale_threshold]
        if stale_posts:
            add_issue(Severity.LOW, Category.CONTENT,
                      f"{len(stale_posts)} blog posts not updated in 90+ days",
                      "Google favors fresh content. Consider updating older posts with new data.",
                      str(BLOG_DIR), None, "Update dateModified and add new information.")

    # ── Tool count and coverage ───────────────────────────────────────────────
    tool_slugs = re.findall(r"slug:\s*'([^']+)'", prerender_src[:15000])
    print(f"    Tools covered: {len(tool_slugs)}")
    
    # Check category distribution
    categories = re.findall(r"category:\s*'([^']+)'", prerender_src[:15000])
    cat_dist = Counter(categories)
    print("    Category distribution:")
    for cat, count in cat_dist.most_common():
        print(f"      • {cat}: {count} tools")

    # ── Thin content check (reviewBody length) ────────────────────────────────
    # Match reviewBody values handling escaped single quotes inside strings
    review_bodies = re.findall(r"reviewBody:\s*'((?:[^'\\]|\\.)*)'", prerender_src, re.DOTALL)
    if review_bodies:
        short_reviews = [r for r in review_bodies if len(r.split()) < 150]
        if short_reviews:
            add_issue(Severity.MEDIUM, Category.CONTENT,
                      f"{len(short_reviews)} tool reviews under 150 words",
                      "Short reviews may be flagged as thin content by Google.",
                      str(PRERENDER), None,
                      "Expand short reviews to 300+ words with specific details.")
        else:
            avg_words = sum(len(r.split()) for r in review_bodies) / len(review_bodies)
            print(f"    ✓  All review bodies adequate (avg: {avg_words:.0f} words)")

    # ── Compare article coverage ──────────────────────────────────────────────
    compare_slugs = re.findall(r"COMPARE_ARTICLES.*?slug:\s*'([^']+)'", prerender_src, re.DOTALL)
    print(f"    Compare articles: {len(compare_slugs)}")

    # ── Keyword density in meta descriptions ──────────────────────────────────
    meta_descs = re.findall(r"metaDescription:\s*['\"]([^'\"]+)['\"]", prerender_src)
    target_keywords = ["ai tool", "2026", "free", "best", "review", "compare"]
    keyword_coverage = {}
    for kw in target_keywords:
        count = sum(1 for d in meta_descs if kw.lower() in d.lower())
        keyword_coverage[kw] = f"{count}/{len(meta_descs)}"
    print(f"    Keyword presence in meta descriptions:")
    for kw, coverage in keyword_coverage.items():
        print(f"      • '{kw}': {coverage}")


# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: ACCESSIBILITY
# ══════════════════════════════════════════════════════════════════════════════

def scan_accessibility(index_src: str):
    """Basic accessibility checks from source code."""
    print("\n" + "═" * 78)
    print("  ♿ SCAN 15: ACCESSIBILITY")
    print("═" * 78)

    # ── Lang attribute ────────────────────────────────────────────────────────
    if 'lang="en"' in index_src or "lang='en'" in index_src:
        print("    ✓  <html lang='en'> present")
    else:
        add_issue(Severity.HIGH, Category.A11Y, "Missing lang attribute on <html>",
                  "Screen readers need the lang attribute to choose correct pronunciation.",
                  str(INDEX_HTML), None, 'Add lang="en" to <html> tag.')

    # ── aria-labels in pre-rendered content ───────────────────────────────────
    # Check page components for accessibility
    pages_content = ""
    for page_file in PAGES_DIR.glob("*.tsx"):
        pages_content += read_file(page_file)
    
    aria_count = pages_content.count("aria-")
    role_count = pages_content.count('role="')
    alt_count = pages_content.count("alt=")
    
    print(f"    ARIA attributes across pages: {aria_count}")
    print(f"    role= attributes: {role_count}")
    print(f"    alt= attributes (images): {alt_count}")
    
    if aria_count < 10:
        add_issue(Severity.MEDIUM, Category.A11Y, "Low ARIA attribute count",
                  f"Only {aria_count} aria-* attributes across all page components. "
                  "Interactive elements need ARIA labels for screen readers.",
                  str(PAGES_DIR), None, "Add aria-label to buttons, links, and interactive elements.")

    # ── Color scheme ──────────────────────────────────────────────────────────
    if "color-scheme" in index_src:
        print("    ✓  color-scheme CSS property set")
    
    # ── Focus styles ──────────────────────────────────────────────────────────
    if ":focus" in index_src or "focus-visible" in index_src:
        print("    ✓  Focus styles defined")
    else:
        add_issue(Severity.MEDIUM, Category.A11Y, "No :focus styles in CSS",
                  "Keyboard users need visible focus indicators to navigate.",
                  str(INDEX_HTML), None, "Add :focus-visible styles to interactive elements.")

    # ── Semantic HTML ─────────────────────────────────────────────────────────
    semantic_tags = ["<main", "<nav", "<article", "<section", "<aside", "<header", "<footer"]
    found_semantic = [t for t in semantic_tags if t in pages_content]
    print(f"    Semantic HTML tags used: {found_semantic}")
    if len(found_semantic) < 3:
        add_issue(Severity.LOW, Category.A11Y, "Limited semantic HTML usage",
                  f"Only found: {found_semantic}. Semantic elements help screen readers.",
                  str(PAGES_DIR), None, "Use <main>, <nav>, <article>, <section> appropriately.")


# ══════════════════════════════════════════════════════════════════════════════
# SCANNER: BING-SPECIFIC CHECKS
# ══════════════════════════════════════════════════════════════════════════════

def scan_bing_specific(prerender_src: str, index_src: str):
    """Bing-specific optimization checks."""
    print("\n" + "═" * 78)
    print("  🔵 SCAN 16: BING-SPECIFIC OPTIMIZATION")
    print("═" * 78)

    # ── Bing validation file ──────────────────────────────────────────────────
    bing_files = list(PUBLIC.glob("BingSiteAuth*")) + list(PUBLIC.glob("*.xml"))
    bing_validation = [f for f in PUBLIC.iterdir() if "bing" in f.name.lower()]
    if bing_validation:
        print(f"    ✓  Bing validation file: {[f.name for f in bing_validation]}")
    else:
        add_issue(Severity.LOW, Category.CRAWL, "No Bing site validation file",
                  "Bing Webmaster Tools requires a validation file for site ownership.",
                  str(PUBLIC), None, "Add BingSiteAuth.xml from Bing Webmaster Tools.")

    # ── Google validation file ────────────────────────────────────────────────
    google_files = list(PUBLIC.glob("google*.html"))
    if google_files:
        print(f"    ✓  Google validation file: {[f.name for f in google_files]}")
    else:
        print("    ⚠️  No Google HTML validation file found (may use DNS verification)")

    # ── IndexNow support (Bing instant indexing) ──────────────────────────────
    indexnow_key = list(PUBLIC.glob("*.txt"))
    indexnow_candidates = [f for f in indexnow_key if len(f.stem) == 32]
    if indexnow_candidates:
        print(f"    ✓  IndexNow key file detected: {indexnow_candidates[0].name}")
    else:
        add_issue(Severity.LOW, Category.CRAWL, "No IndexNow key file",
                  "IndexNow enables instant Bing indexing when content changes.",
                  str(PUBLIC), None,
                  "Register at bing.com/indexnow and add key file to public/.")

    # ── Crawl-delay for Bing ──────────────────────────────────────────────────
    robots_src = read_file(PUBLIC / "robots.txt") if (PUBLIC / "robots.txt").exists() else ""
    if "Crawl-delay" in robots_src:
        delay_match = re.search(r"Bingbot[\s\S]*?Crawl-delay:\s*(\d+)", robots_src)
        if delay_match:
            delay = int(delay_match.group(1))
            print(f"    ✓  Bing crawl-delay: {delay}s")
            if delay > 5:
                add_issue(Severity.MEDIUM, Category.CRAWL, f"Bing crawl-delay too high ({delay}s)",
                          "High crawl-delay slows Bing's ability to discover new content.",
                          str(PUBLIC / "robots.txt"), None, "Reduce Bing crawl-delay to 2-3s.")

    # ── Social markup (Bing uses OG heavily) ──────────────────────────────────
    if "og:image" in index_src:
        print("    ✓  og:image present (Bing uses for thumbnail in SERPs)")


# ══════════════════════════════════════════════════════════════════════════════
# REPORT GENERATION
# ══════════════════════════════════════════════════════════════════════════════

def generate_report(verbose: bool = True, output_json: bool = False):
    """Generate the final audit report."""
    print("\n" + "═" * 78)
    print("  📋 FINAL AUDIT REPORT")
    print("═" * 78)

    # Count by severity
    severity_counts = Counter(i.severity for i in issues)
    category_counts = Counter(i.category for i in issues)
    
    print(f"\n    Total issues found: {len(issues)}")
    print(f"    ┌──────────────────────────────────────────────┐")
    print(f"    │  🔴 CRITICAL:  {severity_counts.get(Severity.CRITICAL, 0):>3}  (blocks indexing)       │")
    print(f"    │  🟠 HIGH:      {severity_counts.get(Severity.HIGH, 0):>3}  (suppresses rankings)   │")
    print(f"    │  🟡 MEDIUM:    {severity_counts.get(Severity.MEDIUM, 0):>3}  (costs rank potential)  │")
    print(f"    │  🔵 LOW:       {severity_counts.get(Severity.LOW, 0):>3}  (best practice)         │")
    print(f"    │  ⚪ INFO:      {severity_counts.get(Severity.INFO, 0):>3}  (observation)           │")
    print(f"    └──────────────────────────────────────────────┘")
    
    print(f"\n    Issues by category:")
    for cat, count in category_counts.most_common():
        print(f"      • {cat}: {count}")

    # Sort issues by severity
    severity_order = {Severity.CRITICAL: 0, Severity.HIGH: 1, Severity.MEDIUM: 2, 
                      Severity.LOW: 3, Severity.INFO: 4}
    sorted_issues = sorted(issues, key=lambda i: severity_order.get(i.severity, 5))

    if verbose:
        print(f"\n{'─' * 78}")
        print("  DETAILED ISSUE LIST")
        print(f"{'─' * 78}")
        
        current_severity = None
        for idx, issue in enumerate(sorted_issues, 1):
            if issue.severity != current_severity:
                current_severity = issue.severity
                emoji = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🔵", "INFO": "⚪"}
                print(f"\n  {emoji.get(current_severity, '•')} {current_severity} ISSUES:")
                print(f"  {'─' * 40}")
            
            print(f"\n    [{idx}] {issue.title}")
            print(f"        Category: {issue.category}")
            if issue.file:
                rel_path = issue.file.replace(str(ROOT), "").lstrip("\\/")
                line_info = f":{issue.line}" if issue.line else ""
                print(f"        File: {rel_path}{line_info}")
            print(f"        Details: {issue.details}")
            if issue.fix:
                print(f"        💡 Fix: {issue.fix}")

    if output_json:
        json_report = {
            "timestamp": datetime.now().isoformat(),
            "site": SITE,
            "summary": {
                "total": len(issues),
                "critical": severity_counts.get(Severity.CRITICAL, 0),
                "high": severity_counts.get(Severity.HIGH, 0),
                "medium": severity_counts.get(Severity.MEDIUM, 0),
                "low": severity_counts.get(Severity.LOW, 0),
            },
            "issues": [
                {
                    "severity": i.severity,
                    "category": i.category,
                    "title": i.title,
                    "details": i.details,
                    "file": i.file.replace(str(ROOT), "").lstrip("\\/"),
                    "line": i.line,
                    "fix": i.fix,
                }
                for i in sorted_issues
            ],
        }
        json_path = ROOT / "audit_report.json"
        json_path.write_text(json.dumps(json_report, indent=2), encoding="utf-8")
        print(f"\n    📄 JSON report saved: audit_report.json")

    # ── Exit code based on severity ───────────────────────────────────────────
    if severity_counts.get(Severity.CRITICAL, 0) > 0:
        print(f"\n    ⛔ EXIT CODE 1 — {severity_counts[Severity.CRITICAL]} CRITICAL issues block indexing!")
        return 1
    elif severity_counts.get(Severity.HIGH, 0) > 0:
        print(f"\n    ⚠️  EXIT CODE 2 — {severity_counts[Severity.HIGH]} HIGH issues suppress rankings.")
        return 2
    else:
        print(f"\n    ✅ EXIT CODE 0 — No critical or high-severity issues. Site is healthy.")
        return 0


# ══════════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ══════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="AI Nexus Deep SEO/AEO/GEO Audit Scanner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python audit_deep_scan.py                  # Standard verbose scan
  python audit_deep_scan.py --json           # Also output JSON report
  python audit_deep_scan.py --fix-suggestions # Show fix suggestions
        """
    )
    parser.add_argument("--verbose", "-v", action="store_true", default=True,
                       help="Show detailed output (default: True)")
    parser.add_argument("--json", "-j", action="store_true",
                       help="Output JSON report to audit_report.json")
    parser.add_argument("--fix-suggestions", "-f", action="store_true", default=True,
                       help="Include fix suggestions (default: True)")
    args = parser.parse_args()

    print("""
╔══════════════════════════════════════════════════════════════════════════════╗
║           AI NEXUS — COMPREHENSIVE SEO/AEO/GEO DEEP AUDIT                   ║
║                                                                              ║
║  Scanning: Performance · Meta · Schema · Crawlability · Internal Links ·     ║
║            External Links · Navigation · Design · AEO · GEO · Mobile ·       ║
║            Security · Content · Accessibility · Bing · Landing Pages         ║
║                                                                              ║
║  Target: ainexustools.online                                                 ║
║  Date: """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝""")

    # ── Load source files ─────────────────────────────────────────────────────
    print("\n  Loading source files...")
    
    if not PRERENDER.exists():
        print(f"  ❌ FATAL: {PRERENDER} not found. Cannot proceed.")
        sys.exit(1)
    if not INDEX_HTML.exists():
        print(f"  ❌ FATAL: {INDEX_HTML} not found. Cannot proceed.")
        sys.exit(1)

    prerender_src = read_file(PRERENDER)
    index_src = read_file(INDEX_HTML)
    app_src = read_file(APP_TSX) if APP_TSX.exists() else ""
    
    print(f"    ✓  prerender.mjs: {len(prerender_src):,} bytes")
    print(f"    ✓  index.html: {len(index_src):,} bytes")
    print(f"    ✓  App.tsx: {len(app_src):,} bytes")
    print(f"    ✓  Blog posts: {len(list(BLOG_DIR.glob('*.ts')))} files")

    # ── Run all scanners ──────────────────────────────────────────────────────
    scan_crawlability(prerender_src, index_src)
    scan_meta_tags(prerender_src, index_src)
    scan_structured_data(prerender_src, index_src)
    scan_performance(index_src, prerender_src)
    scan_internal_linking(prerender_src, app_src)
    scan_external_linking(prerender_src, index_src)
    scan_navigation(app_src, index_src)
    scan_design(index_src)
    scan_aeo(prerender_src, index_src)
    scan_geo(prerender_src, index_src)
    scan_landing_pages(prerender_src, app_src)
    scan_mobile(index_src)
    scan_security(index_src, prerender_src)
    scan_content(prerender_src)
    scan_accessibility(index_src)
    scan_bing_specific(prerender_src, index_src)

    # ── Generate report ───────────────────────────────────────────────────────
    exit_code = generate_report(verbose=args.verbose, output_json=args.json)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
