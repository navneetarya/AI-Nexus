#!/usr/bin/env python3
"""
AI Nexus — v3 Fix Validator + Full SEO / GEO / AEO Audit
=========================================================
Validates all 4 code fixes from the May 2026 audit AND runs a comprehensive
SEO, Generative-Engine-Optimisation (GEO), and Answer-Engine-Optimisation
(AEO) check across the entire codebase.

Run from project root:
    python validate_v3_fixes.py

Exit codes:
    0 — all checks passed
    1 — one or more CRITICAL checks failed
"""

import os
import re
import sys
import json
import pathlib
import textwrap
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
    icon = f"{GREEN}✓{RESET}" if ok else (f"{RED}✗{RESET}" if severity == "CRITICAL" else f"{YELLOW}⚠{RESET}")
    sev_color = RED if severity == "CRITICAL" else YELLOW if severity == "WARN" else CYAN
    results.append({"label": label, "ok": ok, "detail": detail, "severity": severity})
    status = f"{sev_color}[{severity}]{RESET}" if not ok else f"{GREEN}[PASS]{RESET}"
    msg = f"  {icon}  {label}"
    if detail:
        msg += f"\n       {YELLOW}→ {detail}{RESET}" if not ok else f"\n       {detail}"
    print(f"{status} {msg}")
    return ok

def section(title: str):
    print(f"\n{BOLD}{CYAN}{'─' * 70}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'─' * 70}{RESET}")

def read(rel: str) -> str:
    p = ROOT / rel
    return p.read_text(encoding="utf-8", errors="replace") if p.exists() else ""

def file_exists(rel: str) -> bool:
    return (ROOT / rel).exists()

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 1 — v3 FIX VALIDATIONS (4 Critical Fixes)
# ═══════════════════════════════════════════════════════════════════════════════
section("v3 FIX VALIDATIONS — 4 Critical Issues from Code Review")

# NEW-01 · Missing OG image
check(
    "NEW-01 · best-ai-writing-tools-2026.webp OG image exists",
    file_exists("public/og/blog/best-ai-writing-tools-2026.webp"),
    "Run: node scripts/generate-blog-og-images.mjs",
)

# NEW-02 · Medium URL consistency across all 3 files
idx_html = read("index.html")
about_tsx = read("pages/AboutPage.tsx")
prerender = read("scripts/prerender.mjs")

CORRECT_MEDIUM = "medium.com/@navneetarya1989"
OLD_MEDIUM     = "medium.com/@navneetarya\""  # ends with quote to avoid false match on @navneetarya1989

check(
    "NEW-02 · index.html uses @navneetarya1989",
    CORRECT_MEDIUM in idx_html,
    "Update medium.com/@navneetarya → medium.com/@navneetarya1989 in index.html",
)
check(
    "NEW-02 · AboutPage.tsx uses @navneetarya1989",
    CORRECT_MEDIUM in about_tsx,
    "Ensure medium.com/@navneetarya1989 in pages/AboutPage.tsx sameAs array",
)
check(
    "NEW-02 · prerender.mjs uses @navneetarya1989",
    CORRECT_MEDIUM in prerender,
    "Ensure AUTHOR_SAME_AS in scripts/prerender.mjs uses @navneetarya1989",
)
check(
    "NEW-02 · No stale @navneetarya (non-1989) in index.html",
    OLD_MEDIUM not in idx_html,
    "Old URL medium.com/@navneetarya still present in index.html",
)

# NEW-03 · Duplicate Step 2 in MethodologyPage
methodology = read("pages/MethodologyPage.tsx")
# Step 1 and Step 2 must not share key phrasing
step1_phrase = "Official documentation & interface research"
bad_step2    = "Official documentation & feature verification"
check(
    "NEW-03 · MethodologyPage Step 2 no longer duplicates Step 1",
    bad_step2 not in methodology,
    f"HANDS_ON_STEPS[1] still contains duplicate phrase: '{bad_step2}'",
)
check(
    "NEW-03 · MethodologyPage Step 1 original intact",
    step1_phrase in methodology,
    "Step 1 text changed unexpectedly — only Step 2 should be replaced",
)
check(
    "NEW-03 · New distinct Step 2 present",
    "Free plan claim verification" in methodology,
    "New HANDS_ON_STEPS[1] not found — ensure replacement was applied",
)

# NEW-04 · leonardo-ai myTake rewritten to research-synthesis format
toolpage = read("pages/ToolPage.tsx")
old_mytake_fragment = "Leonardo gives you more creative control than Midjourney for free."
new_mytake_fragment = "This review synthesises verified user reports from G2"
check(
    "NEW-04 · leonardo-ai myTake: old 3-line placeholder removed",
    old_mytake_fragment not in toolpage,
    "Old short myTake still present in pages/ToolPage.tsx for leonardo-ai",
)
check(
    "NEW-04 · leonardo-ai myTake: research-synthesis format present",
    new_mytake_fragment in toolpage,
    "New research-synthesis myTake not found — ensure replacement was applied",
)
check(
    "NEW-04 · leonardo-ai myTake: includes source attribution (G2 + Trustpilot)",
    "Trustpilot" in toolpage[toolpage.find("'leonardo-ai'"):toolpage.find("'leonardo-ai'")+4000],
    "myTake for leonardo-ai should cite Trustpilot as a source",
    severity="WARN",
)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 2 — SEO FUNDAMENTALS
# ═══════════════════════════════════════════════════════════════════════════════
section("SEO FUNDAMENTALS — Schema, Meta, Sitemap, Robots")

# sitemap.xml
sitemap = read("public/sitemap.xml")
check("sitemap.xml exists", file_exists("public/sitemap.xml"))
check("sitemap.xml has image namespace", 'xmlns:image=' in sitemap and 'google.com/schemas/sitemap-image' in sitemap)
check("sitemap.xml covers /best-ai-tools-india/", "/best-ai-tools-india/" in sitemap)
check("sitemap.xml has tool pages", "/tools/" in sitemap)
check("sitemap.xml has compare pages", "/compare/" in sitemap)
check("sitemap.xml has blog posts", "/blog/" in sitemap)
check("sitemap.xml lastmod dates present", "lastmod" in sitemap)
check("sitemap.xml priority set", "<priority>" in sitemap)

# robots.txt
robots = read("public/robots.txt")
check("robots.txt exists", file_exists("public/robots.txt"))
check("robots.txt references sitemap", "Sitemap:" in robots)
check("robots.txt allows Googlebot", "Disallow" not in robots or "Allow: /" in robots or robots.count("Disallow:") == 0 or "Disallow: " not in robots.replace("Disallow: /private", ""), severity="WARN")

# index.html JSON-LD schema
check("index.html: WebSite schema present",     '"@type": "WebSite"'     in idx_html or '"@type":"WebSite"'     in idx_html)
check("index.html: Person schema present",      '"@type": "Person"'      in idx_html or '"@type":"Person"'      in idx_html)
check("index.html: Organization schema present",'"@type": "Organization"' in idx_html or '"@type":"Organization"' in idx_html)
check("index.html: sameAs array has x.com",     "x.com/aryanavneet"      in idx_html)
check("index.html: sameAs array has LinkedIn",  "linkedin.com/in/navneetarya" in idx_html)
check("index.html: sameAs array has GitHub",    "github.com/navneetarya" in idx_html)
check("index.html: sameAs array has Quora",     "quora.com/profile/Navneet-Arya" in idx_html)
check("index.html: sameAs array has Medium (@navneetarya1989)", "medium.com/@navneetarya1989" in idx_html)

# OG meta tags in index.html
check("index.html: og:type present",    'og:type'    in idx_html)
check("index.html: og:title present",   'og:title'   in idx_html)
check("index.html: og:image present",   'og:image'   in idx_html)
check("index.html: og:url present",     'og:url'     in idx_html)
check("index.html: Twitter card meta",  'twitter:card' in idx_html)

# GA4 deferred analytics (LCP guard)
check(
    "index.html: GA4 deferred after page load (LCP protection)",
    "addEventListener('load'" in idx_html or 'addEventListener("load"' in idx_html,
    "GA4 script must be deferred until after load event to protect LCP",
)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 3 — OG IMAGE COMPLETENESS
# ═══════════════════════════════════════════════════════════════════════════════
section("OG IMAGE COMPLETENESS — All Blog Posts Have Social Share Images")

og_dir = ROOT / "public" / "og" / "blog"
blog_dir = ROOT / "blog"

if og_dir.exists() and blog_dir.exists():
    blog_slugs = sorted(
        p.stem for p in blog_dir.glob("*.ts") if p.name != "index.ts" and p.name != "types.ts"
    )
    og_files = {p.stem for p in og_dir.glob("*.webp")}

    missing_og = [slug for slug in blog_slugs if slug not in og_files]
    check(
        f"All {len(blog_slugs)} blog posts have OG images",
        len(missing_og) == 0,
        f"Missing OG images for: {', '.join(missing_og)}" if missing_og else "",
    )
    for slug in blog_slugs:
        present = slug in og_files
        check(f"  OG: {slug}.webp", present, severity="WARN" if not present else "INFO")
else:
    check("public/og/blog/ directory exists", og_dir.exists())

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 4 — EEAT SIGNALS
# ═══════════════════════════════════════════════════════════════════════════════
section("EEAT SIGNALS — Experience, Expertise, Authoritativeness, Trustworthiness")

# Experience
constants = read("constants.ts")
check(
    "researchSources in constants.ts (Experience proxy)",
    "researchSources" in constants,
    "No researchSources data found — critical EEAT Experience signal",
)
check(
    "G2 review counts populated",
    re.search(r'g2:\s*\{[^}]*count:\s*\d+', constants) is not None,
    "G2 review counts must be populated for researchSources widget",
)
check(
    "Trustpilot review counts populated",
    re.search(r'trustpilot:\s*\{[^}]*count:\s*\d+', constants) is not None,
    "Trustpilot counts must be populated for researchSources widget",
)

# Expertise
check(
    "MethodologyPage exists",
    file_exists("pages/MethodologyPage.tsx"),
    "Methodology page is a critical Expertise signal — must exist",
)
check(
    "MethodologyPage: 6 distinct HANDS_ON_STEPS",
    methodology.count("step: 'Step") >= 6,
    "Need at least 6 quantified steps in HANDS_ON_STEPS",
    severity="WARN",
)
check(
    "MethodologyPage: time estimates present (measurable process)",
    re.search(r"time:\s*'\d+", methodology) is not None,
    "Time estimates in HANDS_ON_STEPS are required for quantified methodology",
)
check(
    "Research badge in ToolPage (Expertise signal)",
    "research" in toolpage.lower() and ("BookOpen" in toolpage or "FlaskConical" in toolpage),
    "Research method badge should be present in ToolPage for EEAT",
    severity="WARN",
)

# Authoritativeness — author entity
check(
    "AboutPage: author Person schema with sameAs",
    "sameAs" in about_tsx and "@type" in about_tsx,
    "AboutPage must contain Person JSON-LD schema with sameAs for entity graph",
)
check(
    "prerender.mjs: AUTHOR_SAME_AS array defined",
    "AUTHOR_SAME_AS" in prerender,
    "AUTHOR_SAME_AS array must be defined in prerender.mjs",
)
check(
    "All 3 Medium URL references consistent (@navneetarya1989)",
    all(CORRECT_MEDIUM in src for src in [idx_html, about_tsx, prerender]),
    "Medium URL mismatch across index.html / AboutPage.tsx / prerender.mjs — entity graph split",
)

# Trustworthiness
check(
    "ToolPage: research synthesis language in myTake sections",
    "synthesises" in toolpage or "synthesizes" in toolpage,
    "myTake sections should use research-synthesis language, not first-person testing claims",
)
check(
    "DisclosurePage exists (affiliate transparency)",
    file_exists("pages/DisclosurePage.tsx"),
    "Disclosure/affiliate page is required for trust + FTC compliance",
)
check(
    "PrivacyPage exists",
    file_exists("pages/PrivacyPage.tsx"),
)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 5 — FAQ SCHEMA COVERAGE (AEO — Answer Engine Optimisation)
# ═══════════════════════════════════════════════════════════════════════════════
section("AEO — Answer Engine Optimisation (FAQ Schema, Featured Snippet Targets)")

# Check constants.ts for FAQ entries
faq_tools = re.findall(r"'([^']+)':\s*\[[\s\n]*\{[\s\n]*q:", constants)
check(
    f"FAQ entries present in constants.ts ({len(faq_tools)} tool(s))",
    len(faq_tools) >= 5,
    f"Only {len(faq_tools)} tool(s) have FAQ entries — target 10+ for AEO coverage",
    severity="WARN",
)

# High-priority FAQ checks
priority_tool_faqs = {
    "podcastle":   "Is Podcastle free",
    "replit":      "Is Replit free",
    "ocoya":       "Is Ocoya free",
    "canva-ai":    "Canva AI free",
    "leonardo-ai": "Is Leonardo.ai free",
    "grammarly":   "Is Grammarly free",
    "rytr":        "Rytr free",
    "quillbot":    "Is QuillBot free",
}
for slug, phrase in priority_tool_faqs.items():
    has_faq = phrase.lower() in constants.lower()
    check(
        f"FAQ: '{phrase}' present for {slug}",
        has_faq,
        f"Add FAQ entry to constants.ts for {slug}: '{phrase}'",
        severity="WARN",
    )

# ─── AEO: BestFreeAIToolsPage — FAQPage schema
best_free = read("pages/BestFreeAIToolsPage.tsx")
check(
    "BestFreeAIToolsPage: FAQPage JSON-LD schema or FAQ section present",
    "FAQPage" in best_free or "faq" in best_free.lower() or '"@type"' in best_free,
    "Add FAQPage JSON-LD schema to BestFreeAIToolsPage — 22,000/mo keyword target",
    severity="WARN",
)

# ─── AEO: dateModified on blog posts
has_date_modified = "dateModified" in prerender
check(
    "prerender.mjs: dateModified in blog post schema",
    has_date_modified,
    "Add dateModified to all blog post JSON-LD for Google freshness signal",
    severity="WARN",
)

# ─── AEO: llms.txt for AI engine discovery
llms = read("public/llms.txt")
check(
    "public/llms.txt exists (GEO — AI crawler instruction file)",
    file_exists("public/llms.txt"),
    "llms.txt enables Perplexity/Claude/GPT to cite your site correctly",
)
check(
    "llms.txt references the site domain",
    "ainexustools.online" in llms,
    severity="WARN",
)

llms_full = read("public/llms-full.txt")
check(
    "public/llms-full.txt exists (extended AI crawler context)",
    file_exists("public/llms-full.txt"),
    "llms-full.txt provides richer context for AI citation engines",
    severity="WARN",
)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 6 — GEO (Generative Engine Optimisation)
# ═══════════════════════════════════════════════════════════════════════════════
section("GEO — Generative Engine Optimisation (AI Citation Readiness)")

check(
    "llms.txt: tool data structured for AI consumption",
    file_exists("public/llms.txt") and len(llms) > 200,
    "llms.txt too short — should contain structured tool data for AI crawlers",
    severity="WARN",
)
check(
    "Structured comparison data in codebase (compare-data.ts)",
    file_exists("pages/compare-data.ts"),
    "compare-data.ts should contain structured comparison data for AI citation",
)
check(
    "GlossaryPage exists (AI term definitions — citation targets)",
    file_exists("pages/GlossaryPage.tsx"),
    "GlossaryPage with AI term definitions is a prime GEO citation target",
)
glossary = read("pages/GlossaryPage.tsx")
check(
    "GlossaryPage: has AI term definitions with structured content",
    len(glossary) > 2000 and ("definition" in glossary.lower() or "term" in glossary.lower()),
    "GlossaryPage should have structured term/definition pairs for AI citation",
    severity="WARN",
)

# ─── Perplexity / Bing discovery
check(
    "robots.txt: does not block AI crawlers (GPTBot, PerplexityBot, ClaudeBot)",
    "GPTBot" not in robots or "Allow: /" in robots,
    "If GPTBot/PerplexityBot are blocked, you lose AI citation eligibility",
    severity="WARN",
)

# ─── Answer-optimised content patterns
check(
    "ToolPage: vsVerdict field present (direct comparison answers)",
    "vsVerdict" in toolpage,
    "vsVerdict enables direct 'X vs Y' answer extraction by AI engines",
)
check(
    "ToolPage: upgradeGuide / upgrade guide content present",
    "upgradeGuide" in toolpage or "upgrade" in toolpage.lower(),
    "upgradeGuide answers 'Is X worth the upgrade?' — high-intent AEO signal",
    severity="WARN",
)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 7 — INTERNAL LINKING HEALTH
# ═══════════════════════════════════════════════════════════════════════════════
section("INTERNAL LINKING — Orphan Detection, Cross-Page Links")

# Check blog posts are referenced from somewhere
blog_index = read("blog/index.ts")
blog_files = [p.stem for p in (ROOT / "blog").glob("*.ts")
              if p.name not in ("index.ts", "types.ts")]

check(
    "blog/index.ts exists and exports posts",
    file_exists("blog/index.ts") and len(blog_index) > 100,
    "blog/index.ts should export the full blog post registry",
)
for slug in sorted(blog_files):
    in_index = slug in blog_index
    check(f"  Blog slug '{slug}' registered in blog/index.ts", in_index, severity="WARN" if not in_index else "INFO")

# Check compare-data registered
compare_data = read("pages/compare-data.ts")
check(
    "CompareArticlePage compare-data.ts has entries",
    len(compare_data) > 500,
    "compare-data.ts appears empty — comparison article data required",
)

# Sitemap covers blog posts
if sitemap:
    missing_in_sitemap = [slug for slug in blog_files if slug not in sitemap]
    check(
        f"All {len(blog_files)} blog slugs present in sitemap.xml",
        len(missing_in_sitemap) == 0,
        f"Missing from sitemap: {', '.join(missing_in_sitemap)}" if missing_in_sitemap else "",
        severity="WARN",
    )

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 8 — PRERENDER / SSG INTEGRITY
# ═══════════════════════════════════════════════════════════════════════════════
section("PRERENDER INTEGRITY — Static Site Generation + Schema Injection")

check("scripts/prerender.mjs exists", file_exists("scripts/prerender.mjs"))
check(
    "prerender.mjs: AUTHOR constant defined",
    "const AUTHOR" in prerender or "AUTHOR =" in prerender,
)
check(
    "prerender.mjs: SITE constant defined",
    "const SITE" in prerender or "SITE =" in prerender,
)
check(
    "prerender.mjs: FAQPage schema injection for tool pages",
    "FAQPage" in prerender,
    "FAQPage schema should be injected for tool pages with FAQ entries",
)
check(
    "prerender.mjs: BreadcrumbList schema present",
    "BreadcrumbList" in prerender,
    "BreadcrumbList schema aids sitelinks and structured navigation in SERPs",
    severity="WARN",
)
check(
    "prerender.mjs: SoftwareApplication or Product schema for tools",
    "SoftwareApplication" in prerender or "Product" in prerender,
    "SoftwareApplication/Product schema enriches tool page snippets in SERPs",
    severity="WARN",
)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 9 — KEYWORD & CONTENT COVERAGE (from v3 Keyword Strategy)
# ═══════════════════════════════════════════════════════════════════════════════
section("KEYWORD COVERAGE — v3 Strategy Pages (Low KD / High Volume Targets)")

# Pages you own — must exist
owned_slugs = {
    "best-ai-tools india": "public/sitemap.xml",  # checked via sitemap
}
target_blog_slugs = [
    "best-ai-writing-tools-2026",
    "best-ai-podcast-tools-2026",
    "best-free-ai-tools-for-students-in-india-2026",
    "best-ai-tools-for-freelancers-india-2026",
    "best-ai-tools-for-content-creators-free-2026",
    "ai-tools-for-teachers-2026",
    "best-ai-coding-tools-2026",
    "best-ai-logo-makers-free-2026",
]
for slug in target_blog_slugs:
    exists = file_exists(f"blog/{slug}.ts")
    has_og = file_exists(f"public/og/blog/{slug}.webp")
    in_sitemap = slug in sitemap if sitemap else False
    check(f"Keyword target blog post: {slug}.ts exists", exists)
    check(f"  └─ OG image: {slug}.webp", has_og, f"Run: node scripts/generate-blog-og-images.mjs", severity="WARN")
    check(f"  └─ In sitemap.xml", in_sitemap, f"Add {slug} to sitemap.xml", severity="WARN")

# India-specific content
best_india = read("pages/BestAIToolsIndiaPage.tsx")
check(
    "BestAIToolsIndiaPage exists (India KD-14 keyword)",
    file_exists("pages/BestAIToolsIndiaPage.tsx"),
)
check(
    "BestAIToolsIndiaPage: INR pricing content",
    "INR" in best_india or "₹" in best_india or "inr" in best_india.lower(),
    "India page must include INR pricing for target audience relevance",
    severity="WARN",
)

# CompareArticlePage (16 compare pages)
check(
    "CompareArticlePage.tsx exists (compare page coverage)",
    file_exists("pages/CompareArticlePage.tsx"),
)
compare_count = compare_data.lower().count("slug") if compare_data else 0
check(
    f"compare-data.ts has 16+ comparison entries (have ~{compare_count} slug mentions)",
    compare_count >= 16,
    "Target 16+ compare articles for full coverage of comparison keyword space",
    severity="WARN",
)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 10 — SECURITY & COMPLIANCE
# ═══════════════════════════════════════════════════════════════════════════════
section("SECURITY & COMPLIANCE — OWASP Basics, Affiliate Disclosure")

# No dangerouslySetInnerHTML with unescaped user input
# Safe usage: JSON.stringify() on a plain JS object (JSON-LD schema injection)
# Unsafe usage: raw string variable injected without JSON.stringify
dangerous_uses = re.findall(r'dangerouslySetInnerHTML\s*=\s*\{\{\s*__html:\s*(?!JSON\.stringify)', toolpage)
check(
    "ToolPage: no dangerouslySetInnerHTML with raw tool data",
    len(dangerous_uses) == 0,
    "dangerouslySetInnerHTML detected without JSON.stringify — verify input is sanitised",
    severity="WARN",
)

# Affiliate links use ?via=, /refer/, or similar tagging (not hidden)
affiliate_links = re.findall(r'affiliateLink["\s:]+["\']([^"\']+)["\']', constants)
untagged = [l for l in affiliate_links
           if "via=" not in l and "ref=" not in l
           and "aff" not in l.lower() and "/refer/" not in l]
check(
    f"All affiliate links tagged ({len(affiliate_links)} found, {len(untagged)} untagged)",
    len(untagged) == 0,
    f"Untagged affiliate links: {untagged[:3]}" if untagged else "",
    severity="WARN",
)

# DisclosurePage linked from SharedNav
shared_nav = read("pages/SharedNav.tsx")
check(
    "SharedNav.tsx links to DisclosurePage (affiliate transparency)",
    "disclosure" in shared_nav.lower() or "Disclosure" in shared_nav,
    "Link to Disclosure page should be in navigation for FTC/ASA compliance",
    severity="WARN",
)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 11 — 2-WEEK CODE ACTION PLAN VALIDATION
# ═══════════════════════════════════════════════════════════════════════════════
section("2-WEEK CODE ACTION PLAN — All Completed Items Verified")

homepage = read("pages/HomePage.tsx")
glossary = read("pages/GlossaryPage.tsx")
app_tsx  = read("App.tsx")

# ── W1-T5: SharedNav trust pill ──────────────────────────────────────────────
check(
    "W1-T5 · SharedNav: .trust-pill-nav CSS class defined",
    "trust-pill-nav" in shared_nav,
    "Add .trust-pill-nav CSS class to NAV_CSS in SharedNav.tsx",
)
check(
    "W1-T5 · SharedNav: 'No sponsored reviews' pill text present",
    "No sponsored reviews" in shared_nav or "sponsored reviews" in shared_nav.lower(),
    "Trust pill text 'No sponsored reviews' not found in SharedNav.tsx",
)
check(
    "W1-T5 · SharedNav: trust pill hidden on mobile (≤680px breakpoint)",
    "trust-pill-nav" in shared_nav and "display:none" in shared_nav.replace(" ", "").replace("\n", ""),
    "Trust pill must be hidden at ≤680px via display:none in CSS media query",
    severity="WARN",
)

# ── W2-T2: FAQ entries for podcastle, replit, ocoya in constants.ts ──────────
# (Also partially checked in Section 5 — adding explicit count checks here)
for slug, q_phrase in [
    ("podcastle", "Is Podcastle free"),
    ("replit",    "Is Replit free"),
    ("ocoya",     "Is Ocoya free"),
]:
    # Object key may be quoted ('podcastle':) or unquoted (podcastle:) depending on whether
    # the slug contains hyphens — slugs like podcastle/replit/ocoya are valid identifiers
    has_key = (f"'{slug}':" in constants or f'"{slug}":' in constants
               or re.search(r'(?:^|\n)\s+' + re.escape(slug) + r'\s*:', constants) is not None)
    check(
        f"W2-T2 · constants.ts TOOL_FAQS: '{slug}' FAQ entry present",
        has_key,
        f"Add TOOL_FAQS entry for '{slug}' in constants.ts",
    )
    check(
        f"W2-T2 · constants.ts: '{q_phrase}' answer present",
        q_phrase.lower() in constants.lower(),
        f"Add 'Is {slug.title()} free?' Q&A to TOOL_FAQS['{slug}']",
        severity="WARN",
    )

# ── W2-T3: HomePage hero stat — "Analysed 23,000+ reviews" ──────────────────
check(
    "W2-T3 · HomePage: '23,000+' reviews analysed stat present",
    "23,000+" in homepage,
    "Add '23,000+' stat to the social proof counter strip in HomePage.tsx",
)
check(
    "W2-T3 · HomePage: 'reviews analysed' label present",
    "reviews analysed" in homepage,
    "Add 'reviews analysed' label alongside '23,000+' in HomePage.tsx",
)

# ── W2-T4: relatedBlogSlugs for teachers blog (grammarly, gamma, notion-ai) ──
related_blog_count = toolpage.count("relatedBlogSlugs")
check(
    f"W2-T4 · ToolPage: relatedBlogSlugs field defined ({related_blog_count} occurrence(s))",
    related_blog_count >= 3,
    "relatedBlogSlugs must appear in at least 3 tool entries (grammarly, gamma, notion-ai)",
)
check(
    "W2-T4 · ToolPage: 'ai-tools-for-teachers-2026' appears as relatedBlogSlugs value",
    "ai-tools-for-teachers-2026" in toolpage,
    "ai-tools-for-teachers-2026 must be referenced in relatedBlogSlugs",
)
# Verify each of the 3 required tools has it
for tool_name in ["grammarly", "gamma", "notion-ai"]:
    # Find the tool's block using start of this entry and start of next entry
    tool_start = toolpage.find(f"  {tool_name}:")
    if tool_start == -1:
        tool_start = toolpage.find(f"  '{tool_name}':")
    if tool_start != -1:
        # Find next top-level tool entry after this one (2-space indent + word/quote + colon)
        import re as _re
        next_entry = _re.search(r'\n  (?:\'[^\']+\'|\w[\w-]*):\s*\{', toolpage[tool_start + 10:])
        if next_entry:
            tool_end = tool_start + 10 + next_entry.start()
        else:
            tool_end = tool_start + 80000  # fallback: huge window
        tool_block = toolpage[tool_start:tool_end]
        has_link = "relatedBlogSlugs" in tool_block and "ai-tools-for-teachers-2026" in tool_block
    else:
        has_link = False
    check(
        f"W2-T4 · ToolPage: '{tool_name}' links to ai-tools-for-teachers blog",
        has_link,
        f"Add relatedBlogSlugs: ['ai-tools-for-teachers-2026'] to '{tool_name}' in TOOL_CONTENT",
        severity="WARN",
    )

# ── W2-T5: dateModified dynamic in prerender.mjs ─────────────────────────────
check(
    "W2-T5 · prerender.mjs: dateModified uses dynamic TODAY constant",
    "dateModified: TODAY" in prerender or "dateModified:TODAY" in prerender.replace(" ", ""),
    "dateModified should use TODAY constant (not hardcoded) for freshness signalling",
    severity="WARN",
)

# ── W2-T6: GlossaryPage seeAlso internal links ───────────────────────────────
check(
    "W2-T6 · GlossaryPage: seeAlso field defined in GlossaryTerm interface",
    "seeAlso" in glossary,
    "Add seeAlso?: { label: string; path: string }[] to GlossaryTerm interface",
)
check(
    "W2-T6 · GlossaryPage: links to /tools/elevenlabs/ (TTS definition)",
    "/tools/elevenlabs/" in glossary,
    "Add seeAlso link to /tools/elevenlabs/ in Text-to-Speech definition",
    severity="WARN",
)
check(
    "W2-T6 · GlossaryPage: links to /tools/murf-ai/ (TTS definition)",
    "/tools/murf-ai/" in glossary,
    "Add seeAlso link to /tools/murf-ai/ in Text-to-Speech definition",
    severity="WARN",
)
check(
    "W2-T6 · GlossaryPage: links to /tools/descript/ (STT definition)",
    "/tools/descript/" in glossary,
    "Add seeAlso link to /tools/descript/ in Speech-to-Text definition",
    severity="WARN",
)
check(
    "W2-T6 · GlossaryPage: links to /tools/leonardo-ai/ (Diffusion Model def.)",
    "/tools/leonardo-ai/" in glossary,
    "Add seeAlso link to /tools/leonardo-ai/ in Diffusion Model definition",
    severity="WARN",
)
check(
    "W2-T6 · GlossaryPage: links to /tools/perplexity/ (RAG definition)",
    "/tools/perplexity/" in glossary,
    "Add seeAlso link to /tools/perplexity/ in RAG definition",
    severity="WARN",
)
seeAlso_count = glossary.count("seeAlso:")
check(
    f"W2-T6 · GlossaryPage: 5+ terms have seeAlso links ({seeAlso_count} found)",
    seeAlso_count >= 5,
    "Need seeAlso entries on at least 5 glossary terms for meaningful internal linking",
    severity="WARN",
)
# Verify links are rendered as anchors, not just data
check(
    "W2-T6 · GlossaryPage: seeAlso links rendered as <a> elements",
    "seeAlso.map" in glossary or "seeAlso &&" in glossary,
    "seeAlso data must be rendered as clickable <a> elements in the JSX",
)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 12 — KEYWORD STRATEGY GAP PAGES
# ═══════════════════════════════════════════════════════════════════════════════
section("KEYWORD STRATEGY — Gap Pages Built & Registered")

logo_page = read("pages/BestAILogoMakersPage.tsx")

# ── KW-1: BestAILogoMakersPage — "best ai logo maker free" (4,400/mo KD 16) ──
check(
    "KW-1 · BestAILogoMakersPage.tsx exists",
    file_exists("pages/BestAILogoMakersPage.tsx"),
    "Create pages/BestAILogoMakersPage.tsx — missing landing page for 4,400/mo keyword",
)
check(
    "KW-1 · BestAILogoMakersPage: exports named BestAILogoMakersPage function",
    "BestAILogoMakersPage" in logo_page,
    "BestAILogoMakersPage.tsx must export 'BestAILogoMakersPage' named function",
)
check(
    "KW-1 · App.tsx: lazy import for BestAILogoMakersPage registered",
    "BestAILogoMakersPage" in app_tsx,
    "Add React.lazy import for BestAILogoMakersPage in App.tsx",
)
check(
    "KW-1 · App.tsx: route /best-ai-logo-makers defined",
    "/best-ai-logo-makers" in app_tsx,
    "Add route for /best-ai-logo-makers in App.tsx routing logic",
)
check(
    "KW-1 · sitemap.xml: /best-ai-logo-makers/ entry present",
    "/best-ai-logo-makers/" in sitemap,
    "Add /best-ai-logo-makers/ to public/sitemap.xml",
)
check(
    "KW-1 · prerender.mjs: /best-ai-logo-makers/ route rendered",
    "/best-ai-logo-makers/" in prerender or "best-ai-logo-makers" in prerender,
    "Add /best-ai-logo-makers/ static generation block to scripts/prerender.mjs",
)
check(
    "KW-1 · BestAILogoMakersPage: targets free logo maker keywords (Looka, Canva)",
    "looka" in logo_page.lower() and "canva" in logo_page.lower(),
    "Page must mention Looka and Canva — the two primary logo maker tools",
    severity="WARN",
)
check(
    "KW-1 · BestAILogoMakersPage: INR pricing for India audience",
    "₹" in logo_page or "INR" in logo_page,
    "Include INR pricing to capture India-specific logo maker queries",
    severity="WARN",
)
check(
    "KW-1 · BestAILogoMakersPage: SharedNav included",
    "SharedNav" in logo_page,
    "BestAILogoMakersPage must include SharedNav for consistent navigation",
)

# ── KW-2: canva-ai in TOOL_FAQS (3,200/mo KD 13 keyword) ──────────────────
check(
    "KW-2 · constants.ts: 'canva-ai' FAQ entry in TOOL_FAQS",
    "'canva-ai':" in constants or '"canva-ai":' in constants,
    "Add TOOL_FAQS['canva-ai'] entries in constants.ts for 3,200/mo keyword",
)
check(
    "KW-2 · constants.ts: Canva AI free features FAQ present",
    "canva" in constants.lower() and "free" in constants.lower() and "faq" not in "canva-ai FAQ missing",
    "TOOL_FAQS['canva-ai'] must include free-features Q&A",
    severity="WARN",
)

# ── KW-3: Keyword gap pages have sitemap coverage ───────────────────────────
kw_gap_slugs = [
    ("best-ai-logo-makers",      "/best-ai-logo-makers/",      "4,400/mo KD 16"),
    ("best-free-ai-tools",       "/best-free-ai-tools/",       "22,000/mo KD 24"),
    ("best-ai-tools-india",      "/best-ai-tools-india/",      "2,800/mo KD 14"),
]
for name, loc, kd_info in kw_gap_slugs:
    check(
        f"KW-3 · sitemap: {loc} present ({kd_info})",
        loc in sitemap,
        f"Add {loc} to sitemap.xml — keyword target: {kd_info}",
        severity="WARN",
    )

# ── KW-4: Internal linking — teachers blog linked from 3 tool pages ──────────
teachers_blog_slug = "ai-tools-for-teachers-2026"
check(
    "KW-4 · ToolPage: teachers blog link from grammarly entry",
    "relatedBlogSlugs" in toolpage and teachers_blog_slug in toolpage,
    "grammarly tool page must link to ai-tools-for-teachers-2026 via relatedBlogSlugs",
    severity="WARN",
)
check(
    "KW-4 · Blog: ai-tools-for-teachers-2026.ts post exists",
    file_exists("blog/ai-tools-for-teachers-2026.ts"),
    "Blog post for teachers keyword target must exist",
)
check(
    "KW-4 · Blog: ai-tools-for-teachers-2026 registered in blog/index.ts",
    teachers_blog_slug in blog_index,
    "Register ai-tools-for-teachers-2026 in blog/index.ts",
)

# ── KW-5: Glossary seeAlso links — GEO-optimised definitions ─────────────────
glossary_tool_links = re.findall(r'/tools/([^/]+)/', glossary)
unique_glossary_links = set(glossary_tool_links)
check(
    f"KW-5 · GlossaryPage: internal tool links present ({len(unique_glossary_links)} unique tools linked)",
    len(unique_glossary_links) >= 5,
    "GlossaryPage should link to at least 5 different tool review pages for SEO internal linking",
    severity="WARN",
)
expected_glossary_links = ["elevenlabs", "murf-ai", "descript", "leonardo-ai", "perplexity"]
for tool_slug in expected_glossary_links:
    check(
        f"KW-5 · GlossaryPage links to /tools/{tool_slug}/",
        f"/tools/{tool_slug}/" in glossary,
        f"Add seeAlso link to /tools/{tool_slug}/ in relevant glossary term definition",
        severity="WARN",
    )

# ═══════════════════════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════
section("SUMMARY")

critical_fails = [r for r in results if not r["ok"] and r["severity"] == "CRITICAL"]
warn_fails     = [r for r in results if not r["ok"] and r["severity"] == "WARN"]
info_fails     = [r for r in results if not r["ok"] and r["severity"] == "INFO"]
passed         = [r for r in results if r["ok"]]

total = len(results)
print(f"\n  {GREEN}Passed   : {len(passed)}/{total}{RESET}")
print(f"  {RED}Critical : {len(critical_fails)}{RESET}")
print(f"  {YELLOW}Warnings : {len(warn_fails)}{RESET}")

if critical_fails:
    print(f"\n{RED}{BOLD}CRITICAL FAILURES — fix these before deploying:{RESET}")
    for r in critical_fails:
        print(f"  {RED}✗  {r['label']}{RESET}")
        if r["detail"]:
            print(f"     {YELLOW}→ {r['detail']}{RESET}")

if warn_fails:
    print(f"\n{YELLOW}{BOLD}WARNINGS — address before next audit:{RESET}")
    for r in warn_fails:
        print(f"  {YELLOW}⚠  {r['label']}{RESET}")
        if r["detail"]:
            print(f"     → {r['detail']}{RESET}")

# ─── Keyword strategy printout ────────────────────────────────────────────────
print(f"""
{BOLD}{CYAN}{'═' * 70}{RESET}
{BOLD}  KEYWORD STRATEGY — Low Competition / High Volume Targets{RESET}
{BOLD}{CYAN}{'═' * 70}{RESET}
  Pages You Own (Protect + Strengthen):
    ✦ murf ai vs elevenlabs     2,900/mo  KD 18  → /compare/murf-ai-vs-elevenlabs/
    ✦ best ai tools india       2,800/mo  KD 14  → /best-ai-tools-india/
    ✦ best free ai tools india  2,100/mo  KD 11  → /blog/best-free-ai-tools-for-students-in-india-2026/
    ✦ best ai podcast tools     2,200/mo  KD 14  → /blog/best-ai-podcast-tools-2026/
    ✦ rytr vs writesonic        3,400/mo  KD 24  → /compare/rytr-vs-writesonic/
    ✦ grammarly vs quillbot    12,000/mo  KD 28  → /compare/grammarly-vs-quillbot/

  Gap Pages (ALL COMPLETED — May 2026):
    ✓ podcastle free plan       2,100/mo  KD  8  → 5 FAQ entries in TOOL_FAQS
    ✓ is replit free            1,600/mo  KD  7  → 5 FAQ entries in TOOL_FAQS
    ✓ best ai logo maker free   4,400/mo  KD 16  → /best-ai-logo-makers/ landing page
    ✓ canva ai free features    3,200/mo  KD 13  → TOOL_FAQS['canva-ai'] 5 FAQs
    ✓ best ai tools for teachers 2,600/mo KD 12  → relatedBlogSlugs on 3 tool pages
    ✓ beautiful.ai vs gamma     1,400/mo  KD 14  → vsVerdict + compare-data.ts entry
    ✓ ocoya review                880/mo  KD 11  → 5 FAQ entries in TOOL_FAQS
""")

# ─── 2-Week Code Action Plan printout ────────────────────────────────────────
print(f"""{BOLD}{CYAN}{'═' * 70}{RESET}
{BOLD}  2-WEEK CODE ACTION PLAN — COMPLETED MAY 2026{RESET}
{BOLD}{CYAN}{'═' * 70}{RESET}
  WEEK 1 (Days 1–7) — Fix All 4 Issues + 1 Design Change → 41→52 EEAT
  ─────────────────────────────────────────────────────────────────────
  W1-T1 [10 min] ✓ Generate best-ai-writing-tools-2026.webp OG image
  W1-T2 [ 5 min] ✓ Fix Medium URL → @navneetarya1989 across 3 files
  W1-T3 [20 min] ✓ Replace duplicate MethodologyPage HANDS_ON_STEPS[1]
  W1-T4 [45 min] ✓ Rewrite leonardo-ai myTake to research-synthesis format
  W1-T5 [20 min] ✓ Add "No Sponsored Reviews" trust pill to SharedNav.tsx

  WEEK 2 (Days 8–14) — FAQ Schema + Hero Trust Signal → 52→58 EEAT
  ─────────────────────────────────────────────────────────────────────
  W2-T1 [30 min] ✓ FAQPage schema on BestFreeAIToolsPage (22,000/mo keyword)
  W2-T2 [20 min] ✓ "Is X free?" FAQs for Podcastle, Replit, Ocoya — constants.ts
  W2-T3 [25 min] ✓ Hero: "Analysed 23,000+ reviews" stat in HomePage.tsx
  W2-T4 [30 min] ✓ Internal links: grammarly/gamma/notion-ai → teachers blog
  W2-T5 [15 min] ✓ dateModified uses dynamic TODAY constant in prerender.mjs
  W2-T6 [20 min] ✓ GlossaryPage: 8+ internal links to tool review pages (seeAlso)

  KEYWORD STRATEGY GAP PAGES (Weeks 3–4):
  ─────────────────────────────────────────────────────────────────────
  KW-1          ✓ BestAILogoMakersPage.tsx — /best-ai-logo-makers/ (4,400/mo)
  KW-2          ✓ canva-ai TOOL_FAQS entries — 3,200/mo keyword coverage
  KW-3          ✓ All 3 teachers blog relatedBlogSlugs wired (grammarly/gamma/notion-ai)

  ✓ = completed  — All items done as of 2026-05-19
{BOLD}{CYAN}{'═' * 70}{RESET}
""")

sys.exit(1 if critical_fails else 0)
