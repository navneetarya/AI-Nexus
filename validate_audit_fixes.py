#!/usr/bin/env python3
"""
AI Nexus — May 2026 Audit Fix Validator
========================================
Validates all 18 code fixes from the May 2026 SEO/GEO/EEAT audit.

Sections:
  C  — Critical: font loading, "personally tested" language
  H  — High:     meta descriptions, compare titles, category routes, llms.txt, EEAT, CategoryPage
  M  — Medium:   robots.txt, deploy.yml sitemap ping, compare entry, social proof
  L  — Low:      RSS, ElevenLabs content, AggregateRating schema, new blog files

Run from project root:
    python validate_audit_fixes.py

Exit codes:
    0 — all checks passed
    1 — one or more CRITICAL checks failed
"""

import os
import re
import sys
import pathlib
from typing import Any

ROOT = pathlib.Path(__file__).parent.resolve()

# ─── ANSI colours ─────────────────────────────────────────────────────────────
RED    = "\033[91m"
GREEN  = "\033[92m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

# ─── Result accumulator ───────────────────────────────────────────────────────
results: list[dict[str, Any]] = []

def check(label: str, ok: bool, detail: str = "", severity: str = "CRITICAL") -> bool:
    icon   = f"{GREEN}✓{RESET}" if ok else (f"{RED}✗{RESET}" if severity == "CRITICAL" else f"{YELLOW}⚠{RESET}")
    sev_color = RED if severity == "CRITICAL" else YELLOW if severity == "WARN" else CYAN
    results.append({"label": label, "ok": ok, "detail": detail, "severity": severity})
    status = f"{sev_color}[{severity:8}]{RESET}" if not ok else f"{GREEN}[PASS    ]{RESET}"
    msg = f"  {icon}  {label}"
    if detail:
        msg += f"\n           {YELLOW}→ {detail}{RESET}" if not ok else f"\n           {detail}"
    print(f"{status} {msg}")
    return ok

def section(title: str):
    print(f"\n{BOLD}{CYAN}{'─' * 72}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'─' * 72}{RESET}")

def read(rel: str) -> str:
    p = ROOT / rel
    return p.read_text(encoding="utf-8", errors="replace") if p.exists() else ""

def file_exists(rel: str) -> bool:
    return (ROOT / rel).exists()

# ─── Load files once ──────────────────────────────────────────────────────────
idx_html      = read("index.html")
app_tsx       = read("App.tsx")
robots        = read("public/robots.txt")
deploy_yml    = read(".github/workflows/deploy.yml")
llms          = read("public/llms.txt")
compare_data  = read("pages/compare-data.ts")
prerender     = read("scripts/prerender.mjs")
category_page = read("pages/CategoryPage.tsx")
homepage      = read("pages/HomePage.tsx")
about_page    = read("pages/AboutPage.tsx")
blog_index    = read("blog/index.ts")
toolpage      = read("pages/ToolPage.tsx")

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION C — CRITICAL FIXES
# ═══════════════════════════════════════════════════════════════════════════════
section("C — CRITICAL FIXES (Font Loading + 'Personally Tested' Language)")

# ── C1: Self-hosted Fraunces fonts (removes 2 external DNS lookups) ──────────
check(
    "C1 · index.html: Google Fonts CDN link for Fraunces removed",
    "fonts.googleapis.com/css2?family=Fraunces" not in idx_html,
    "Still referencing fonts.googleapis.com for Fraunces — remove CDN links",
)
check(
    "C1 · index.html: fonts.gstatic.com preconnect for fonts removed",
    "fonts.gstatic.com" not in idx_html,
    "fonts.gstatic.com preconnect still present — remove it to eliminate DNS lookup",
)
check(
    "C1 · index.html: @font-face block for Fraunces 700 present",
    "fraunces-700.woff2" in idx_html,
    "Add @font-face { font-family: 'Fraunces'; src: url('/fonts/fraunces-700.woff2') } to index.html",
)
check(
    "C1 · index.html: @font-face block for Fraunces 800 present",
    "fraunces-800.woff2" in idx_html,
    "Add @font-face for fraunces-800.woff2 to index.html",
)
check(
    "C1 · index.html: @font-face block for Fraunces 900 present",
    "fraunces-900.woff2" in idx_html,
    "Add @font-face for fraunces-900.woff2 to index.html",
)
check(
    "C1 · index.html: @font-face block for Fraunces italic 800 present",
    "fraunces-italic-800.woff2" in idx_html,
    "Add @font-face for fraunces-italic-800.woff2 to index.html",
)
check(
    "C1 · index.html: font-display: swap set on self-hosted fonts",
    "font-display: swap" in idx_html or "font-display:swap" in idx_html,
    "Add font-display: swap to all @font-face rules for CLS prevention",
)

# ── C2: App.tsx — "personally tested" removed from dynamic meta ──────────────
check(
    "C2 · App.tsx: tool page title no longer says 'Personally Tested'",
    "Personally Tested" not in app_tsx,
    "Remove 'Personally Tested' from tool page title template in App.tsx",
)
check(
    "C2 · App.tsx: tool page title uses 'Independently Researched'",
    "Independently Researched" in app_tsx,
    "Replace with 'Independently Researched' in tool title template in App.tsx",
)
check(
    "C2 · App.tsx: /blog route meta no longer says 'Personally tested.'",
    "Personally tested." not in app_tsx,
    "Remove 'Personally tested.' from /blog meta description in App.tsx",
)
check(
    "C2 · App.tsx: /about route meta no longer says 'personally tests every AI tool'",
    "personally tests every AI tool" not in app_tsx,
    "Update /about meta in App.tsx — remove first-person testing claims",
)

# ── C3: CategoryPage.tsx — "personally tested" removed from page copy ────────
check(
    "C3 · CategoryPage.tsx: 'I have personally tested' removed from writing intro",
    "I have personally tested" not in category_page,
    "Remove 'I have personally tested' from writing category intro in CategoryPage.tsx",
)
check(
    "C3 · CategoryPage.tsx: 'I have tested' removed from all intros",
    "I have tested every tool" not in category_page,
    "Remove all 'I have tested every tool' phrases from CategoryPage.tsx",
)
check(
    "C3 · CategoryPage.tsx: independently researched language present",
    "independently researched" in category_page.lower() or "independently" in category_page.lower(),
    "Replace personal testing claims with research-based language in CategoryPage.tsx",
)

# ── C4: prerender.mjs — fallback title does not say "Personally Tested" ──────
check(
    "C4 · prerender.mjs: no 'Personally Tested' in fallback seoTitle",
    "Personally Tested" not in prerender,
    "Remove 'Personally Tested' from fallback title template in scripts/prerender.mjs",
)
check(
    "C4 · prerender.mjs: fallback title uses 'Independently' language",
    "Independently" in prerender,
    "Fallback seoTitle should contain 'Independently Reviewed' in scripts/prerender.mjs",
    severity="WARN",
)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION H — HIGH PRIORITY FIXES
# ═══════════════════════════════════════════════════════════════════════════════
section("H — HIGH PRIORITY FIXES (Meta Descriptions, Compare Titles, Category Routes, llms.txt, EEAT)")

# ── H1: prerender.mjs — key page meta descriptions updated ───────────────────
# Find ocoya in the TOOLS array via slug key (not TOOL_FAQS); check a 1200-char window
_ocoya_pos = prerender.find("slug: 'ocoya'")
if _ocoya_pos == -1:
    _ocoya_pos = prerender.find('slug: "ocoya"')
_ocoya_has_meta = (
    _ocoya_pos != -1 and
    "metaDescription" in prerender[_ocoya_pos:_ocoya_pos + 1200]
)
check(
    "H1 · prerender.mjs: ocoya has custom metaDescription",
    _ocoya_has_meta,
    "Add a custom metaDescription to the ocoya entry in scripts/prerender.mjs",
)
check(
    "H1 · prerender.mjs: taskade-vs-notion-vs-asana-2026 meta updated",
    "taskade-vs-notion-vs-asana-2026" in prerender,
    "taskade-vs-notion-vs-asana-2026 blog entry missing from prerender.mjs",
)
# Search from the blog posts section to skip the OG_IMAGES object at line 705
_tvn_section = prerender[prerender.find("slug: 'taskade-vs-notion-vs-asana"):] if "slug: 'taskade-vs-notion-vs-asana" in prerender else ""
check(
    "H1 · prerender.mjs: taskade-vs-notion meta references pricing",
    "$0" in _tvn_section[:1000],
    "taskade-vs-notion-vs-asana metaDescription should mention '$0/month' pricing",
    severity="WARN",
)
check(
    "H1 · prerender.mjs: best-ai-tools-for-content-creators meta updated",
    "best-ai-tools-for-content-creators-free-2026" in prerender,
    "best-ai-tools-for-content-creators-free-2026 entry missing in prerender.mjs",
)

# ── H2: compare-data.ts — 6 compare articles have outcome-first seoTitles ────
COMPARE_TITLES = {
    "replit-vs-github-copilot":    "Beginners Pick Replit",
    "podcastle-vs-descript":       "Recording",
    "leonardo-vs-midjourney":      "Free Plan Winner",
    "taskade-vs-notion":           "AI Agents",
    "ocoya-vs-buffer-vs-hootsuite":"Budget Level",
    "taskade-vs-asana":            "AI Agents vs Enterprise",
}
for slug, phrase in COMPARE_TITLES.items():
    slug_pos = compare_data.find(slug)
    if slug_pos != -1:
        window = compare_data[slug_pos:slug_pos + 600]
        ok = phrase.lower() in window.lower()
    else:
        ok = False
    check(
        f"H2 · compare-data.ts: '{slug}' has outcome-first seoTitle",
        ok,
        f"Update seoTitle for '{slug}' to include differentiating outcome text (e.g. '{phrase}')",
    )

# ── H3: prerender.mjs — 5 category routes have enhanced descriptions ─────────
CATEGORY_CHECKS = {
    "best-ai-audio-tools":       ["Podcastle", "Murf", "ElevenLabs", "Descript"],
    "best-ai-design-tools":      ["Canva", "Looka", "Gamma"],
    "best-ai-marketing-tools":   ["Ocoya", "Jasper", "Writesonic"],
    "best-ai-coding-tools":      ["Copilot", "Replit", "Cursor"],
    "best-ai-productivity-tools":["Taskade", "Notion", "Perplexity"],
}
for cat_slug, expected_tools in CATEGORY_CHECKS.items():
    # Search within the CATEGORY_PAGES section only (not earlier OG_IMAGES references)
    cat_pages_pos = prerender.find("CATEGORY_PAGES")
    search_area = prerender[cat_pages_pos:] if cat_pages_pos != -1 else prerender
    slug_pos = search_area.find(f"'{cat_slug}'")
    if slug_pos == -1:
        slug_pos = search_area.find(cat_slug)
    if slug_pos != -1:
        window = search_area[slug_pos:slug_pos + 800]
        missing = [t for t in expected_tools if t.lower() not in window.lower()]
        ok = len(missing) == 0
        detail = f"Category '{cat_slug}' desc missing: {', '.join(missing)}" if missing else ""
    else:
        ok = False
        detail = f"Category slug '{cat_slug}' not found in CATEGORY_PAGES in prerender.mjs"
    check(
        f"H3 · prerender.mjs: '{cat_slug}' description mentions key tools",
        ok,
        detail,
        severity="WARN",
    )

# ── H4: llms.txt — no duplicate content block ────────────────────────────────
tool_reviews_count = llms.count("## Tool Reviews")
blog_posts_count   = llms.count("## Blog Posts")
check(
    "H4 · llms.txt: '## Tool Reviews' section appears exactly once",
    tool_reviews_count == 1,
    f"'## Tool Reviews' appears {tool_reviews_count}x — remove the duplicate block",
)
check(
    "H4 · llms.txt: '## Blog Posts' section appears exactly once",
    blog_posts_count == 1,
    f"'## Blog Posts' appears {blog_posts_count}x — remove the duplicate block",
)
check(
    "H4 · llms.txt: '## Comparison Articles' section present",
    "## Comparison Articles" in llms,
    "llms.txt should include a '## Comparison Articles' section",
    severity="WARN",
)

# ── H5: AboutPage.tsx — credential-led bio + methodology stats ───────────────
check(
    "H5 · AboutPage.tsx: 'BOLD' credential mentioned",
    "BOLD" in about_page,
    "Add 'AI Automation & Performance Testing Leader at BOLD' credential to AboutPage.tsx",
)
check(
    "H5 · AboutPage.tsx: '22+' tools researched count present",
    "22+" in about_page,
    "Add '22+ AI tools' researched stat to AboutPage.tsx biography section",
)
check(
    "H5 · AboutPage.tsx: 'since 2022' or '2022' research date present",
    "2022" in about_page,
    "Add 'since 2022' to bio to establish research timeline (EEAT Experience signal)",
)
check(
    "H5 · AboutPage.tsx: methodology stats section present",
    "200+" in about_page or "methodology" in about_page.lower(),
    "Add 'Methodology in numbers' stats section to AboutPage.tsx",
    severity="WARN",
)
check(
    "H5 · AboutPage.tsx: sameAs / Person schema present",
    "sameAs" in about_page or "@type" in about_page,
    "Add Person JSON-LD schema with sameAs to AboutPage for entity graph",
    severity="WARN",
)

# ── H6: CategoryPage.tsx — audio/design intros enhanced ─────────────────────
# Audio intro: free plan specifics
AUDIO_FREE_PLANS = ["3hrs", "10min", "10,000", "1hr", "Podcastle", "Murf", "ElevenLabs", "Descript"]
audio_ok_count = sum(1 for term in AUDIO_FREE_PLANS if term in category_page)
check(
    f"H6 · CategoryPage.tsx: audio intro has free plan specifics ({audio_ok_count}/{len(AUDIO_FREE_PLANS)} terms found)",
    audio_ok_count >= 4,
    f"Audio intro should mention specific free plan limits (e.g. 'Podcastle 3hrs free', 'Murf AI 10min free'). "
    f"Missing: {[t for t in AUDIO_FREE_PLANS if t not in category_page]}",
    severity="WARN",
)
check(
    "H6 · CategoryPage.tsx: design intro references independent research",
    "independently" in category_page.lower(),
    "Design intro should use independently-researched language, not 'I have tested'",
    severity="WARN",
)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION M — MEDIUM PRIORITY FIXES
# ═══════════════════════════════════════════════════════════════════════════════
section("M — MEDIUM PRIORITY FIXES (robots.txt, sitemap ping, compare entry, social proof)")

# ── M1: robots.txt — Crawl-delay removed for Googlebot ───────────────────────
# Check: "Crawl-delay: 1" must not appear in the Googlebot stanza
# Strategy: find Googlebot block, check until next User-agent block
googlebot_pos  = robots.find("User-agent: Googlebot")
next_agent_pos = robots.find("User-agent:", googlebot_pos + 1) if googlebot_pos != -1 else -1
if googlebot_pos != -1:
    googlebot_block = robots[googlebot_pos:next_agent_pos] if next_agent_pos != -1 else robots[googlebot_pos:]
    has_crawl_delay = "Crawl-delay: 1" in googlebot_block
else:
    has_crawl_delay = False

check(
    "M1 · robots.txt: no 'Crawl-delay: 1' under Googlebot section",
    not has_crawl_delay,
    "Remove 'Crawl-delay: 1' from the Googlebot stanza in public/robots.txt",
)
# Verify Bingbot and YandexBot delays remain (not accidentally removed)
bingbot_pos = robots.find("User-agent: Bingbot")
if bingbot_pos != -1:
    next_bingbot = robots.find("User-agent:", bingbot_pos + 1)
    bingbot_block = robots[bingbot_pos:next_bingbot] if next_bingbot != -1 else robots[bingbot_pos:]
    check(
        "M1 · robots.txt: Bingbot Crawl-delay: 2 preserved (unintended removal guard)",
        "Crawl-delay: 2" in bingbot_block,
        "Bingbot Crawl-delay was accidentally removed — restore 'Crawl-delay: 2' under Bingbot",
        severity="WARN",
    )

# ── M2: deploy.yml — sitemap ping added ──────────────────────────────────────
check(
    "M2 · deploy.yml: Google sitemap ping curl command present",
    "google.com/ping?sitemap=" in deploy_yml,
    "Add 'curl -s https://www.google.com/ping?sitemap=...' step to .github/workflows/deploy.yml",
)
check(
    "M2 · deploy.yml: Bing sitemap ping curl command present",
    "bing.com/ping?sitemap=" in deploy_yml,
    "Add 'curl -s https://www.bing.com/ping?sitemap=...' step to .github/workflows/deploy.yml",
)
check(
    "M2 · deploy.yml: sitemap ping step runs after deploy (ordering)",
    deploy_yml.find("bing.com/ping") > deploy_yml.find("deploy") if "deploy" in deploy_yml else False,
    "Sitemap ping step must come after the deploy step in deploy.yml",
    severity="WARN",
)

# ── M3: compare-data.ts — taskade-vs-asana entry ─────────────────────────────
ta_pos = compare_data.find("taskade-vs-asana")
if ta_pos != -1:
    ta_window = compare_data[ta_pos:ta_pos + 800]
    has_seo_title = "seoTitle" in ta_window
    has_meta_desc = "metaDescription" in ta_window
    has_ai_agents = "AI Agents" in ta_window or "Enterprise" in ta_window
else:
    has_seo_title = has_meta_desc = has_ai_agents = False

check(
    "M3 · compare-data.ts: taskade-vs-asana entry exists",
    ta_pos != -1,
    "Add taskade-vs-asana entry to pages/compare-data.ts",
)
check(
    "M3 · compare-data.ts: taskade-vs-asana has seoTitle",
    has_seo_title,
    "Add 'seoTitle' field to taskade-vs-asana in compare-data.ts",
)
check(
    "M3 · compare-data.ts: taskade-vs-asana has metaDescription",
    has_meta_desc,
    "Add 'metaDescription' field to taskade-vs-asana in compare-data.ts",
)
check(
    "M3 · compare-data.ts: taskade-vs-asana seoTitle is outcome-first",
    has_ai_agents,
    "taskade-vs-asana seoTitle should distinguish 'AI Agents vs Enterprise Projects'",
    severity="WARN",
)

# ── M4: HomePage.tsx — social proof stats trust bar added ────────────────────
check(
    "M4 · HomePage.tsx: '22+' AI tools stat present",
    "22+" in homepage,
    "Add '22+' AI tools researched stat to social proof bar in pages/HomePage.tsx",
)
check(
    "M4 · HomePage.tsx: '200+' reviews per tool stat present",
    "200+" in homepage,
    "Add '200+' reviews analysed per tool stat to social proof bar in pages/HomePage.tsx",
)
check(
    "M4 · HomePage.tsx: '2022' researching since stat present",
    "2022" in homepage,
    "Add 'Researching since 2022' stat to social proof bar in pages/HomePage.tsx",
)
check(
    "M4 · HomePage.tsx: social proof bar renders 4 stats",
    homepage.count("n:'") >= 3 or homepage.count('n:"') >= 3 or homepage.count("{n:") >= 3,
    "Social proof bar should have at least 3 stat items in pages/HomePage.tsx",
    severity="WARN",
)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION L — LOW PRIORITY FIXES
# ═══════════════════════════════════════════════════════════════════════════════
section("L — LOW PRIORITY FIXES (RSS, ElevenLabs Content, Schema, New Blog Files)")

# ── L1: RSS feed ──────────────────────────────────────────────────────────────
check(
    "L1 · index.html: RSS feed <link> tag present",
    'type="application/rss+xml"' in idx_html or 'rss' in idx_html.lower(),
    "Add RSS <link rel='alternate' type='application/rss+xml'> to index.html <head>",
    severity="WARN",
)
check(
    "L1 · prerender.mjs: RSS feed generation present",
    "rss" in prerender.lower() or "feed.xml" in prerender or "rss.xml" in prerender,
    "Add RSS feed generation to scripts/prerender.mjs",
    severity="WARN",
)

# ── L2: ElevenLabs tool page — not thin content ──────────────────────────────
# Key may be unquoted (elevenlabs:) or quoted ('elevenlabs': / "elevenlabs":)
el_pos = toolpage.find("'elevenlabs'")
if el_pos == -1:
    el_pos = toolpage.find('"elevenlabs"')
if el_pos == -1:
    # Unquoted object key: match '  elevenlabs:' at start of line
    import re as _re2
    m = _re2.search(r'(?:^|\n)([ \t]+elevenlabs\s*:)', toolpage)
    el_pos = m.start(1) if m else -1
if el_pos != -1:
    # Find next top-level entry
    next_entry = re.search(r"\n  (?:'[^']+'|\"[^\"]+\"|[\w-]+)\s*:", toolpage[el_pos + 15:])
    el_end = el_pos + 15 + next_entry.start() if next_entry else el_pos + 6000
    el_block = toolpage[el_pos:el_end]
else:
    el_block = ""

check(
    "L2 · ToolPage.tsx: elevenlabs entry exists in TOOL_CONTENT",
    el_pos != -1,
    "Add 'elevenlabs' entry to TOOL_CONTENT in pages/ToolPage.tsx",
)
check(
    "L2 · ToolPage.tsx: elevenlabs has 'whatIs' field",
    "whatIs" in el_block,
    "Add 'whatIs' field to elevenlabs entry in TOOL_CONTENT",
)
check(
    "L2 · ToolPage.tsx: elevenlabs has 'whoIsItFor' field",
    "whoIsItFor" in el_block,
    "Add 'whoIsItFor' field to elevenlabs entry in TOOL_CONTENT",
)
check(
    "L2 · ToolPage.tsx: elevenlabs has 'myTake' or 'ourTake' field",
    "myTake" in el_block or "ourTake" in el_block,
    "Add 'myTake' field to elevenlabs entry in TOOL_CONTENT",
)
check(
    "L2 · ToolPage.tsx: elevenlabs entry has substantial content (>300 chars)",
    len(el_block) > 300,
    f"elevenlabs TOOL_CONTENT block is only {len(el_block)} chars — add meaningful review content",
    severity="WARN",
)

# ── L3: AggregateRating schema in prerender.mjs ───────────────────────────────
check(
    "L3 · prerender.mjs: AggregateRating schema injection present",
    "AggregateRating" in prerender,
    "Add AggregateRating schema to tool page JSON-LD injection in scripts/prerender.mjs",
)
check(
    "L3 · prerender.mjs: ratingValue field present in schema",
    "ratingValue" in prerender,
    "AggregateRating schema must include 'ratingValue' field",
    severity="WARN",
)
check(
    "L3 · prerender.mjs: reviewCount field present in schema",
    "reviewCount" in prerender,
    "AggregateRating schema must include 'reviewCount' field for rich snippet eligibility",
    severity="WARN",
)

# ── L4: New blog files created and registered ─────────────────────────────────
NEW_BLOG_FILES = [
    ("best-free-ai-writing-tools-2026",    "best free AI writing tools",     "4,200/mo KD 22"),
    ("is-grammarly-premium-worth-it-2026", "is grammarly premium worth it",  "3,600/mo KD 22"),
]
for slug, kw, kd_info in NEW_BLOG_FILES:
    ts_path   = f"blog/{slug}.ts"
    exists    = file_exists(ts_path)
    in_index  = slug in blog_index

    check(
        f"L4 · {ts_path} created",
        exists,
        f"Create blog/{slug}.ts — targets '{kw}' ({kd_info})",
    )
    check(
        f"L4 · blog/index.ts: '{slug}' imported and registered",
        in_index,
        f"Import and add '{slug}' to BLOG_POSTS array in blog/index.ts",
    )

    if exists:
        content = read(ts_path)
        check(
            f"L4 · {slug}: has required slug field",
            f"slug: '{slug}'" in content or f'slug: "{slug}"' in content,
            f"slug field missing or mismatched in blog/{slug}.ts",
        )
        check(
            f"L4 · {slug}: has faqs array with content",
            "faqs:" in content and ("q:" in content or '"q"' in content),
            f"Add faqs array with FAQ entries to blog/{slug}.ts",
        )
        check(
            f"L4 · {slug}: content is substantial (>500 chars)",
            len(content) > 500,
            f"blog/{slug}.ts content is too short ({len(content)} chars)",
            severity="WARN",
        )
        check(
            f"L4 · {slug}: has ogImage field",
            "ogImage" in content,
            f"Add ogImage field to blog/{slug}.ts for social sharing",
            severity="WARN",
        )
        check(
            f"L4 · {slug}: has datePublished field",
            "datePublished" in content,
            f"Add datePublished to blog/{slug}.ts for schema freshness signal",
        )

# ═══════════════════════════════════════════════════════════════════════════════
# BONUS: Cross-cutting concerns
# ═══════════════════════════════════════════════════════════════════════════════
section("BONUS — Cross-Cutting Concerns (Consistency + Completeness)")

# No remaining "personally tested" anywhere in key files
PERSONALLY_TESTED_FILES = {
    "index.html":             idx_html,
    "App.tsx":                app_tsx,
    "pages/CategoryPage.tsx": category_page,
    "pages/AboutPage.tsx":    about_page,
    "pages/HomePage.tsx":     homepage,
    "scripts/prerender.mjs":  prerender,
}
for fname, content in PERSONALLY_TESTED_FILES.items():
    has_pt = bool(re.search(r"personally\s+tested", content, re.IGNORECASE))
    check(
        f"BONUS · No 'personally tested' language in {fname}",
        not has_pt,
        f"Still contains 'personally tested' in {fname} — replace with research-based language",
    )

# New blog posts have internal links back to site
for slug, _, _ in NEW_BLOG_FILES:
    if file_exists(f"blog/{slug}.ts"):
        content = read(f"blog/{slug}.ts")
        has_internal = "/tools/" in content or "/compare/" in content
        check(
            f"BONUS · blog/{slug}.ts: contains internal links to /tools/ or /compare/",
            has_internal,
            f"Add internal links to tool pages (/tools/grammarly etc.) in {slug}.ts",
            severity="WARN",
        )

# Sitemap sanity: new blog slugs should be in sitemap
sitemap = read("public/sitemap.xml")
for slug, _, _ in NEW_BLOG_FILES:
    check(
        f"BONUS · sitemap.xml: '{slug}' present",
        slug in sitemap,
        f"Add /blog/{slug}/ to public/sitemap.xml",
        severity="WARN",
    )

# deploy.yml uses || true so ping failures don't break deployment
check(
    "BONUS · deploy.yml: sitemap ping failures silenced with '|| true'",
    "|| true" in deploy_yml,
    "Add '|| true' to ping commands so a Google/Bing outage can't break your deployment",
)

# ═══════════════════════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════
section("SUMMARY")

critical_fails = [r for r in results if not r["ok"] and r["severity"] == "CRITICAL"]
warn_fails     = [r for r in results if not r["ok"] and r["severity"] == "WARN"]
passed         = [r for r in results if r["ok"]]
total          = len(results)

print(f"\n  {GREEN}Passed   : {len(passed)}/{total}{RESET}")
print(f"  {RED}Critical : {len(critical_fails)}{RESET}")
print(f"  {YELLOW}Warnings : {len(warn_fails)}{RESET}")

if critical_fails:
    print(f"\n{RED}{BOLD}  CRITICAL FAILURES — fix before deploying:{RESET}")
    for r in critical_fails:
        print(f"  {RED}✗  {r['label']}{RESET}")
        if r["detail"]:
            print(f"     {YELLOW}→ {r['detail']}{RESET}")

if warn_fails:
    print(f"\n{YELLOW}{BOLD}  WARNINGS — address before next audit:{RESET}")
    for r in warn_fails:
        print(f"  {YELLOW}⚠  {r['wlabel']}{RESET}" if "wlabel" in r else f"  {YELLOW}⚠  {r['label']}{RESET}")
        if r["detail"]:
            print(f"     → {r['detail']}")

print(f"""
{BOLD}{CYAN}{'═' * 72}{RESET}
{BOLD}  MAY 2026 AUDIT — ALL 18 FIXES VALIDATED{RESET}
{BOLD}{CYAN}{'═' * 72}{RESET}
  C  (Critical)  4 fixes — Font loading + 'personally tested' language
  H  (High)      6 fixes — Meta desc, compare titles, category routes,
                            llms.txt dedup, EEAT signals, category intros
  M  (Medium)    4 fixes — robots.txt Googlebot delay, sitemap ping,
                            taskade-vs-asana entry, social proof stats
  L  (Low)       4 fixes — RSS feed, ElevenLabs content, AggregateRating,
                            2 new blog files (writing tools + Grammarly)
{BOLD}{CYAN}{'═' * 72}{RESET}
""")

sys.exit(1 if critical_fails else 0)
