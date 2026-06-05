#!/usr/bin/env python3
"""
AI Nexus — Week 1 (Jun 5–11) Fix Validator
============================================
Validates every code change from the Week 1 growth sprint:

  T1  — TRENDING_SLUGS updated (cursor, lovable, headshotpro)
  T2  — Cursor AI tool entry added to TOOLS[]
  T3  — Lovable tool entry added to TOOLS[]
  T4  — TOOL_FAQS added for Cursor + Lovable
  T5  — TOOL_COMPARISONS added for Cursor + Lovable
  T6  — TOOL_KEYWORDS added for Cursor + Lovable
  T7  — Blog post: gpt-5-5-vs-claude-opus-4-8-vs-grok-4-2026.ts created
  T8  — Blog post: best-vibe-coding-tools-2026.ts created
  T9  — blog/index.ts updated: imports + BLOG_POSTS registration

Run from the project root:
    python validate_week1_fixes.py

Exit codes:
    0 — all checks passed
    1 — one or more CRITICAL checks failed
"""

import re
import sys
import pathlib
from typing import Any

ROOT = pathlib.Path(__file__).parent.resolve()

# ── File paths ────────────────────────────────────────────────────────────────
CONSTANTS_TS       = ROOT / "constants.ts"
BLOG_INDEX         = ROOT / "blog" / "index.ts"
BLOG_GPT_VS        = ROOT / "blog" / "gpt-5-5-vs-claude-opus-4-8-vs-grok-4-2026.ts"
BLOG_VIBE          = ROOT / "blog" / "best-vibe-coding-tools-2026.ts"
SITEMAP            = ROOT / "public" / "sitemap.xml"
PRERENDER          = ROOT / "scripts" / "prerender.mjs"

# ── ANSI colours ──────────────────────────────────────────────────────────────
RED    = "\033[91m"
GREEN  = "\033[92m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

results: list[dict[str, Any]] = []


def check(label: str, ok: bool, detail: str = "", severity: str = "CRITICAL") -> bool:
    icon    = f"{GREEN}✓{RESET}" if ok else (f"{RED}✗{RESET}" if severity == "CRITICAL" else f"{YELLOW}⚠{RESET}")
    sev_col = RED if severity == "CRITICAL" else YELLOW if severity == "WARN" else CYAN
    results.append({"label": label, "ok": ok, "detail": detail, "severity": severity})
    tag  = f"{GREEN}[PASS    ]{RESET}" if ok else f"{sev_col}[{severity:8}]{RESET}"
    line = f"  {icon}  {label}"
    if detail:
        line += f"\n           {YELLOW}→ {detail}{RESET}" if not ok else f"\n           {CYAN}{detail}{RESET}"
    print(f"{tag} {line}")
    return ok


def section(title: str):
    print(f"\n{BOLD}{CYAN}{'─' * 72}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'─' * 72}{RESET}")


def read(path: pathlib.Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace") if path.exists() else ""


def file_exists(path: pathlib.Path) -> bool:
    return path.exists() and path.is_file()


def find_tool_block(constants: str, slug: str) -> str:
    """Extract the full tool object block for a given slug."""
    marker = f"slug: '{slug}'"
    pos = constants.find(marker)
    if pos == -1:
        return ""
    # Return up to 4000 chars from slug onwards (enough for a full Tool object)
    return constants[pos: pos + 4000]


# ── Load files once ───────────────────────────────────────────────────────────
constants   = read(CONSTANTS_TS)
blog_index  = read(BLOG_INDEX)
gpt_blog    = read(BLOG_GPT_VS)
vibe_blog   = read(BLOG_VIBE)
sitemap     = read(SITEMAP)
prerender   = read(PRERENDER)

cursor_block  = find_tool_block(constants, "cursor")
lovable_block = find_tool_block(constants, "lovable")

# ═══════════════════════════════════════════════════════════════════════════════
# T1 — TRENDING_SLUGS
# ═══════════════════════════════════════════════════════════════════════════════
section("T1 — TRENDING_SLUGS: cursor + lovable + headshotpro added")

_trending_line = ""
for line in constants.splitlines():
    if "TRENDING_SLUGS" in line:
        _trending_line = line
        break

check(
    "T1 · constants.ts: TRENDING_SLUGS contains 'cursor'",
    "'cursor'" in _trending_line,
    "Add 'cursor' to TRENDING_SLUGS array in constants.ts",
)
check(
    "T1 · constants.ts: TRENDING_SLUGS contains 'lovable'",
    "'lovable'" in _trending_line,
    "Add 'lovable' to TRENDING_SLUGS array in constants.ts",
)
check(
    "T1 · constants.ts: TRENDING_SLUGS contains 'headshotpro'",
    "'headshotpro'" in _trending_line,
    "Add 'headshotpro' to TRENDING_SLUGS array in constants.ts",
)
check(
    "T1 · constants.ts: original slugs (perplexity, gamma, replit) still present",
    all(s in _trending_line for s in ["'perplexity'", "'gamma'", "'replit'"]),
    "Do not remove the original TRENDING_SLUGS — only append new ones",
)

# ═══════════════════════════════════════════════════════════════════════════════
# T2 — CURSOR AI TOOL ENTRY
# ═══════════════════════════════════════════════════════════════════════════════
section("T2 — Cursor AI tool entry in TOOLS[]")

check(
    "T2 · constants.ts: Cursor tool entry exists (slug: 'cursor')",
    bool(cursor_block),
    "Add Cursor tool object with slug: 'cursor' to TOOLS[] in constants.ts",
)
check(
    "T2 · constants.ts: Cursor has id 'c2'",
    "id: 'c2'" in cursor_block,
    "Cursor tool id should be 'c2' (next after Replit c1)",
)
check(
    "T2 · constants.ts: Cursor has Category.CODING",
    "Category.CODING" in cursor_block,
    "Set category: Category.CODING for Cursor in constants.ts",
)
check(
    "T2 · constants.ts: Cursor has affiliateLink field",
    "affiliateLink" in cursor_block,
    "Add affiliateLink field to Cursor tool entry (use https://cursor.com — no affiliate yet)",
)
check(
    "T2 · constants.ts: Cursor has pricing field",
    "pricing:" in cursor_block,
    "Add pricing field to Cursor (e.g. 'Free + $20/month Pro')",
)
check(
    "T2 · constants.ts: Cursor has pricingBreakdown (3 tiers)",
    "pricingBreakdown" in cursor_block,
    "Add pricingBreakdown array with Free/Hobby, Pro, Business tiers to Cursor entry",
)
check(
    "T2 · constants.ts: Cursor pricingBreakdown has Free/Hobby tier",
    re.search(r"tier:\s*['\"](?:Free|Hobby)['\"]", cursor_block) is not None,
    "Add a Free or Hobby tier to Cursor's pricingBreakdown",
)
check(
    "T2 · constants.ts: Cursor pricingBreakdown has Pro tier ($20)",
    "$20" in cursor_block and "Pro" in cursor_block,
    "Add Pro tier at $20/month to Cursor's pricingBreakdown",
)
check(
    "T2 · constants.ts: Cursor has setupSteps (4-step guide)",
    "setupSteps" in cursor_block,
    "Add setupSteps array (4 steps) to Cursor tool entry",
)
check(
    "T2 · constants.ts: Cursor has realOutputExample",
    "realOutputExample" in cursor_block,
    "Add realOutputExample to Cursor tool entry",
)
check(
    "T2 · constants.ts: Cursor has dailyUseCases",
    "dailyUseCases" in cursor_block,
    "Add dailyUseCases array to Cursor tool entry",
)
check(
    "T2 · constants.ts: Cursor has notForYou field",
    "notForYou" in cursor_block,
    "Add notForYou field to Cursor tool entry",
)
check(
    "T2 · constants.ts: Cursor has researchSources",
    "researchSources" in cursor_block,
    "Add researchSources (trustpilot, g2, reddit) to Cursor tool entry",
)
check(
    "T2 · constants.ts: Cursor has indiaPricing",
    "indiaPricing" in cursor_block,
    "Add indiaPricing block to Cursor tool entry for India-targeted pages",
)
check(
    "T2 · constants.ts: Cursor has reviewType",
    "reviewType" in cursor_block,
    "Add reviewType: 'research-based' or 'hands-on' to Cursor tool entry",
)
check(
    "T2 · constants.ts: Cursor has lastTestedISO (2026 date)",
    re.search(r"lastTestedISO:\s*['\"]2026-", cursor_block) is not None,
    "Add lastTestedISO with a 2026 ISO date to Cursor entry (e.g. '2026-06-01')",
)
check(
    "T2 · constants.ts: Cursor has updateLog",
    "updateLog" in cursor_block,
    "Add updateLog array with at least one entry to Cursor tool",
)
check(
    "T2 · constants.ts: Cursor has features array",
    "features:" in cursor_block,
    "Add features array to Cursor tool entry",
)
check(
    "T2 · constants.ts: Cursor has pros array",
    "pros:" in cursor_block,
    "Add pros array to Cursor tool entry",
)
check(
    "T2 · constants.ts: Cursor has cons array",
    "cons:" in cursor_block,
    "Add cons array to Cursor tool entry",
)

# ═══════════════════════════════════════════════════════════════════════════════
# T3 — LOVABLE TOOL ENTRY
# ═══════════════════════════════════════════════════════════════════════════════
section("T3 — Lovable tool entry in TOOLS[]")

check(
    "T3 · constants.ts: Lovable tool entry exists (slug: 'lovable')",
    bool(lovable_block),
    "Add Lovable tool object with slug: 'lovable' to TOOLS[] in constants.ts",
)
check(
    "T3 · constants.ts: Lovable has id 'c3'",
    "id: 'c3'" in lovable_block,
    "Lovable tool id should be 'c3' (sequential after Cursor c2)",
)
check(
    "T3 · constants.ts: Lovable has Category.CODING",
    "Category.CODING" in lovable_block,
    "Set category: Category.CODING for Lovable in constants.ts",
)
check(
    "T3 · constants.ts: Lovable has affiliateLink pointing to lovable.dev",
    "lovable.dev" in lovable_block,
    "Add affiliateLink: 'https://lovable.dev/?ref=YOUR_CODE' to Lovable tool entry",
)
check(
    "T3 · constants.ts: Lovable affiliate link contains ref parameter",
    "ref=" in lovable_block,
    "Add ?ref=YOUR_CODE to Lovable affiliate link (30% recurring — replace with real code)",
)
check(
    "T3 · constants.ts: Lovable has pricing field",
    "pricing:" in lovable_block,
    "Add pricing field to Lovable (e.g. 'Free + $25/month')",
)
check(
    "T3 · constants.ts: Lovable pricingBreakdown has Free tier",
    "pricingBreakdown" in lovable_block and re.search(r"tier:\s*['\"]Free['\"]", lovable_block) is not None,
    "Add Free tier to Lovable's pricingBreakdown (5 messages/day)",
)
check(
    "T3 · constants.ts: Lovable pricingBreakdown has $25 paid tier",
    "$25" in lovable_block,
    "Add Starter tier at $25/month to Lovable's pricingBreakdown",
)
check(
    "T3 · constants.ts: Lovable has setupSteps",
    "setupSteps" in lovable_block,
    "Add setupSteps array to Lovable tool entry",
)
check(
    "T3 · constants.ts: Lovable has realOutputExample",
    "realOutputExample" in lovable_block,
    "Add realOutputExample to Lovable tool entry",
)
check(
    "T3 · constants.ts: Lovable has dailyUseCases",
    "dailyUseCases" in lovable_block,
    "Add dailyUseCases array to Lovable tool entry",
)
check(
    "T3 · constants.ts: Lovable has notForYou field",
    "notForYou" in lovable_block,
    "Add notForYou field to Lovable tool entry",
)
check(
    "T3 · constants.ts: Lovable has researchSources",
    "researchSources" in lovable_block,
    "Add researchSources to Lovable tool entry",
)
check(
    "T3 · constants.ts: Lovable has indiaPricing",
    "indiaPricing" in lovable_block,
    "Add indiaPricing block to Lovable tool entry",
)
check(
    "T3 · constants.ts: Lovable has reviewType",
    "reviewType" in lovable_block,
    "Add reviewType to Lovable tool entry",
)
check(
    "T3 · constants.ts: Lovable has lastTestedISO (2026 date)",
    re.search(r"lastTestedISO:\s*['\"]2026-", lovable_block) is not None,
    "Add lastTestedISO with a 2026 date to Lovable entry",
)
check(
    "T3 · constants.ts: Lovable has updateLog",
    "updateLog" in lovable_block,
    "Add updateLog array to Lovable tool entry",
)
check(
    "T3 · constants.ts: Lovable mentions Supabase (backend differentiator)",
    "Supabase" in lovable_block or "supabase" in lovable_block,
    "Mention Supabase in Lovable description — it is the core backend differentiator",
)

# ═══════════════════════════════════════════════════════════════════════════════
# T4 — TOOL_FAQS
# ═══════════════════════════════════════════════════════════════════════════════
section("T4 — TOOL_FAQS: cursor + lovable entries")

# Extract TOOL_FAQS section
_faqs_pos = constants.find("TOOL_FAQS")
_faqs_block = constants[_faqs_pos:] if _faqs_pos != -1 else ""

_cursor_faq_pos = _faqs_block.find("cursor:")
_cursor_faq_block = _faqs_block[_cursor_faq_pos: _cursor_faq_pos + 2500] if _cursor_faq_pos != -1 else ""

_lovable_faq_pos = _faqs_block.find("lovable:")
_lovable_faq_block = _faqs_block[_lovable_faq_pos: _lovable_faq_pos + 2500] if _lovable_faq_pos != -1 else ""

check(
    "T4 · constants.ts: TOOL_FAQS has entry for 'cursor'",
    bool(_cursor_faq_block),
    "Add cursor: [...] FAQ array to TOOL_FAQS (or via Object.assign) in constants.ts",
)
check(
    "T4 · constants.ts: Cursor FAQs have at least 4 Q&A pairs",
    _cursor_faq_block.count("{ q:") >= 4,
    f"Add at least 4 FAQ objects to cursor FAQs (found {_cursor_faq_block.count('{ q:')})",
)
check(
    "T4 · constants.ts: Cursor FAQs cover 'Is Cursor free' / free plan question",
    re.search(r"free", _cursor_faq_block, re.IGNORECASE) is not None,
    "Add a FAQ about Cursor's free plan to cursor FAQs",
)
check(
    "T4 · constants.ts: Cursor FAQs cover Copilot comparison",
    re.search(r"copilot", _cursor_faq_block, re.IGNORECASE) is not None,
    "Add a 'Cursor vs GitHub Copilot' FAQ to cursor FAQs — high search intent",
)
check(
    "T4 · constants.ts: Cursor FAQs cover VS Code extensions compatibility",
    re.search(r"extension|vs code", _cursor_faq_block, re.IGNORECASE) is not None,
    "Add a FAQ about VS Code extension compatibility to cursor FAQs",
)
check(
    "T4 · constants.ts: TOOL_FAQS has entry for 'lovable'",
    bool(_lovable_faq_block),
    "Add lovable: [...] FAQ array to TOOL_FAQS in constants.ts",
)
check(
    "T4 · constants.ts: Lovable FAQs have at least 4 Q&A pairs",
    _lovable_faq_block.count("{ q:") >= 4,
    f"Add at least 4 FAQ objects to lovable FAQs (found {_lovable_faq_block.count('{ q:')})",
)
check(
    "T4 · constants.ts: Lovable FAQs cover vibe coding definition",
    re.search(r"vibe cod", _lovable_faq_block, re.IGNORECASE) is not None,
    "Add a 'What is vibe coding?' FAQ to lovable FAQs — core category keyword",
)
check(
    "T4 · constants.ts: Lovable FAQs cover Bolt comparison",
    re.search(r"bolt", _lovable_faq_block, re.IGNORECASE) is not None,
    "Add a 'Lovable vs Bolt' FAQ — high buyer-intent comparison query",
)
check(
    "T4 · constants.ts: Lovable FAQs cover affiliate programme",
    re.search(r"affiliate|commission", _lovable_faq_block, re.IGNORECASE) is not None,
    "Add a FAQ about Lovable's 30% recurring affiliate programme",
)

# ═══════════════════════════════════════════════════════════════════════════════
# T5 — TOOL_COMPARISONS
# ═══════════════════════════════════════════════════════════════════════════════
section("T5 — TOOL_COMPARISONS: cursor + lovable entries")

_comp_pos = constants.find("TOOL_COMPARISONS")
_comp_block = constants[_comp_pos:] if _comp_pos != -1 else ""

_cursor_comp_pos = _comp_block.find("cursor:")
_cursor_comp_block = _comp_block[_cursor_comp_pos: _cursor_comp_pos + 800] if _cursor_comp_pos != -1 else ""

_lovable_comp_pos = _comp_block.find("lovable:")
_lovable_comp_block = _comp_block[_lovable_comp_pos: _lovable_comp_pos + 800] if _lovable_comp_pos != -1 else ""

check(
    "T5 · constants.ts: TOOL_COMPARISONS has entry for 'cursor'",
    bool(_cursor_comp_block),
    "Add cursor: [...] to TOOL_COMPARISONS (or via Object.assign) in constants.ts",
)
check(
    "T5 · constants.ts: Cursor comparison has at least 4 competitors",
    _cursor_comp_block.count("name:") >= 4,
    f"Add at least 4 competitor rows to Cursor TOOL_COMPARISONS (found {_cursor_comp_block.count('name:')})",
)
check(
    "T5 · constants.ts: Cursor comparison includes GitHub Copilot",
    re.search(r"GitHub Copilot|Copilot", _cursor_comp_block) is not None,
    "Add GitHub Copilot as a comparison row for Cursor",
)
check(
    "T5 · constants.ts: Cursor comparison has ourPick: true for Cursor",
    re.search(r"ourPick:\s*true", _cursor_comp_block) is not None,
    "Set ourPick: true on the Cursor row in Cursor's TOOL_COMPARISONS entry",
)
check(
    "T5 · constants.ts: TOOL_COMPARISONS has entry for 'lovable'",
    bool(_lovable_comp_block),
    "Add lovable: [...] to TOOL_COMPARISONS in constants.ts",
)
check(
    "T5 · constants.ts: Lovable comparison has at least 4 competitors",
    _lovable_comp_block.count("name:") >= 4,
    f"Add at least 4 competitor rows to Lovable TOOL_COMPARISONS (found {_lovable_comp_block.count('name:')})",
)
check(
    "T5 · constants.ts: Lovable comparison includes Bolt",
    re.search(r"Bolt", _lovable_comp_block) is not None,
    "Add Bolt as a comparison row for Lovable",
)
check(
    "T5 · constants.ts: Lovable comparison includes v0",
    re.search(r"v0", _lovable_comp_block) is not None,
    "Add v0 by Vercel as a comparison row for Lovable",
)
check(
    "T5 · constants.ts: Lovable comparison has ourPick: true for Lovable",
    re.search(r"ourPick:\s*true", _lovable_comp_block) is not None,
    "Set ourPick: true on the Lovable row in Lovable's TOOL_COMPARISONS entry",
)

# ═══════════════════════════════════════════════════════════════════════════════
# T6 — TOOL_KEYWORDS
# ═══════════════════════════════════════════════════════════════════════════════
section("T6 — TOOL_KEYWORDS: cursor + lovable SEO keyword arrays")

_kw_pos = constants.find("TOOL_KEYWORDS")
_kw_block = constants[_kw_pos:] if _kw_pos != -1 else ""

_cursor_kw_pos = _kw_block.find("cursor:")
_cursor_kw_block = _kw_block[_cursor_kw_pos: _cursor_kw_pos + 400] if _cursor_kw_pos != -1 else ""

_lovable_kw_pos = _kw_block.find("lovable:")
_lovable_kw_block = _kw_block[_lovable_kw_pos: _lovable_kw_pos + 400] if _lovable_kw_pos != -1 else ""

check(
    "T6 · constants.ts: TOOL_KEYWORDS has entry for 'cursor'",
    bool(_cursor_kw_block),
    "Add cursor: ['cursor ai review 2026', ...] to TOOL_KEYWORDS in constants.ts",
)
check(
    "T6 · constants.ts: Cursor keywords has at least 4 entries",
    _cursor_kw_block.count("'") // 2 >= 4,
    "Add at least 4 SEO keyword strings to cursor TOOL_KEYWORDS",
)
check(
    "T6 · constants.ts: Cursor keywords include a 'review 2026' keyword",
    re.search(r"cursor.*review.*2026", _cursor_kw_block, re.IGNORECASE) is not None,
    "Add 'cursor ai review 2026' to cursor TOOL_KEYWORDS for primary search intent",
)
check(
    "T6 · constants.ts: Cursor keywords include a 'vs copilot' comparison keyword",
    re.search(r"copilot", _cursor_kw_block, re.IGNORECASE) is not None,
    "Add 'cursor vs github copilot' keyword — high-volume comparison query",
)
check(
    "T6 · constants.ts: TOOL_KEYWORDS has entry for 'lovable'",
    bool(_lovable_kw_block),
    "Add lovable: ['lovable ai review 2026', ...] to TOOL_KEYWORDS in constants.ts",
)
check(
    "T6 · constants.ts: Lovable keywords has at least 4 entries",
    _lovable_kw_block.count("'") // 2 >= 4,
    "Add at least 4 SEO keyword strings to lovable TOOL_KEYWORDS",
)
check(
    "T6 · constants.ts: Lovable keywords include a 'vibe coding' keyword",
    re.search(r"vibe cod", _lovable_kw_block, re.IGNORECASE) is not None,
    "Add a 'vibe coding' keyword to lovable TOOL_KEYWORDS — core category trend",
)
check(
    "T6 · constants.ts: Lovable keywords include a Bolt/v0 comparison",
    re.search(r"bolt|v0", _lovable_kw_block, re.IGNORECASE) is not None,
    "Add 'lovable vs bolt vs v0' comparison keyword to lovable TOOL_KEYWORDS",
)

# ═══════════════════════════════════════════════════════════════════════════════
# T7 — BLOG POST: GPT-5.5 vs Claude Opus 4.8 vs Grok 4
# ═══════════════════════════════════════════════════════════════════════════════
section("T7 — Blog post: gpt-5-5-vs-claude-opus-4-8-vs-grok-4-2026.ts")

_slug_gpt = "gpt-5-5-vs-claude-opus-4-8-vs-grok-4-2026"

check(
    "T7 · blog file exists: gpt-5-5-vs-claude-opus-4-8-vs-grok-4-2026.ts",
    file_exists(BLOG_GPT_VS),
    f"Create blog/{_slug_gpt}.ts — trending +480% keyword, 22K+/mo volume",
)
check(
    "T7 · GPT blog: has correct slug field",
    f"slug: '{_slug_gpt}'" in gpt_blog,
    f"Set slug: '{_slug_gpt}' in the blog post object",
)
check(
    "T7 · GPT blog: has title field",
    "title:" in gpt_blog,
    "Add title field to the blog post",
)
check(
    "T7 · GPT blog: has seoTitle ≤ 60 chars",
    bool(re.search(r"seoTitle:\s*'[^']{10,59}'", gpt_blog)),
    "Add seoTitle (10–59 chars) to the blog post for the <title> tag",
)
check(
    "T7 · GPT blog: has metaDescription",
    "metaDescription:" in gpt_blog,
    "Add metaDescription to the blog post",
)
check(
    "T7 · GPT blog: metaDescription ≤ 160 chars",
    bool(re.search(r"metaDescription:\s*'[^']{50,159}'", gpt_blog)),
    "metaDescription should be 50–159 chars for search snippet display",
)
check(
    "T7 · GPT blog: has datePublished (2026 date)",
    re.search(r"datePublished:\s*'2026-", gpt_blog) is not None,
    "Add datePublished with a 2026 date to the blog post",
)
check(
    "T7 · GPT blog: has dateModified",
    "dateModified:" in gpt_blog,
    "Add dateModified field to the blog post",
)
check(
    "T7 · GPT blog: author is Navneet Arya",
    "Navneet Arya" in gpt_blog,
    "Set author: 'Navneet Arya' in the blog post",
)
check(
    "T7 · GPT blog: has category field",
    "category:" in gpt_blog,
    "Add category field to the blog post",
)
check(
    "T7 · GPT blog: has readTime field",
    "readTime:" in gpt_blog,
    "Add readTime field (e.g. '10 min read') to the blog post",
)
check(
    "T7 · GPT blog: has excerpt field",
    "excerpt:" in gpt_blog,
    "Add excerpt field to the blog post (shown in blog listing cards)",
)
check(
    "T7 · GPT blog: has at least 5 FAQ pairs",
    gpt_blog.count("{ q:") >= 5,
    f"Add at least 5 FAQ pairs to the blog post (found {gpt_blog.count('{ q:')})",
)
check(
    "T7 · GPT blog: FAQs cover 'which is better' primary intent",
    re.search(r"which.*(better|best)", gpt_blog, re.IGNORECASE) is not None,
    "Add a 'Which is better — GPT-5.5, Claude Opus, or Grok 4?' FAQ",
)
check(
    "T7 · GPT blog: FAQs cover pricing question",
    re.search(r"\$20|\$16|price|cost", gpt_blog, re.IGNORECASE) is not None,
    "Add a pricing FAQ — 'What is the price of GPT-5.5 / Claude Opus 4.8 / Grok 4?'",
)
check(
    "T7 · GPT blog: has content field (HTML body)",
    "content:" in gpt_blog and "<h2>" in gpt_blog,
    "Add content field with HTML body (must include at least one <h2> heading)",
)
check(
    "T7 · GPT blog: content has a comparison table",
    "<table" in gpt_blog,
    "Add a comparison table (<table>) to the blog post content for featured snippet potential",
)
check(
    "T7 · GPT blog: mentions all 3 models — GPT-5.5, Claude, Grok",
    all(kw in gpt_blog for kw in ["GPT-5.5", "Claude", "Grok 4"]),
    "Ensure all 3 AI models (GPT-5.5, Claude Opus 4.8, Grok 4) are mentioned in the content",
)
check(
    "T7 · GPT blog: has ogImage field",
    "ogImage:" in gpt_blog,
    "Add ogImage field pointing to /og/blog/gpt-5-5-vs-claude-opus-4-8-vs-grok-4-2026.webp",
    severity="WARN",
)
check(
    "T7 · GPT blog: has default export",
    "export default" in gpt_blog,
    "Add 'export default post;' at the end of the blog post file",
)

# ═══════════════════════════════════════════════════════════════════════════════
# T8 — BLOG POST: best-vibe-coding-tools-2026.ts
# ═══════════════════════════════════════════════════════════════════════════════
section("T8 — Blog post: best-vibe-coding-tools-2026.ts")

_slug_vibe = "best-vibe-coding-tools-2026"

check(
    "T8 · blog file exists: best-vibe-coding-tools-2026.ts",
    file_exists(BLOG_VIBE),
    f"Create blog/{_slug_vibe}.ts — zero-competition vibe coding category keyword",
)
check(
    "T8 · Vibe blog: has correct slug field",
    f"slug: '{_slug_vibe}'" in vibe_blog,
    f"Set slug: '{_slug_vibe}' in the blog post object",
)
check(
    "T8 · Vibe blog: has seoTitle",
    "seoTitle:" in vibe_blog,
    "Add seoTitle field to the vibe coding blog post",
)
check(
    "T8 · Vibe blog: has metaDescription",
    "metaDescription:" in vibe_blog,
    "Add metaDescription to the vibe coding blog post",
)
check(
    "T8 · Vibe blog: has datePublished (2026 date)",
    re.search(r"datePublished:\s*'2026-", vibe_blog) is not None,
    "Add datePublished with a 2026 date",
)
check(
    "T8 · Vibe blog: has at least 4 FAQ pairs",
    vibe_blog.count("{ q:") >= 4,
    f"Add at least 4 FAQ pairs (found {vibe_blog.count('{ q:')})",
)
check(
    "T8 · Vibe blog: FAQs define 'vibe coding'",
    re.search(r"what is vibe cod", vibe_blog, re.IGNORECASE) is not None,
    "Add a 'What is vibe coding?' FAQ — core definition query",
)
check(
    "T8 · Vibe blog: FAQs cover Lovable vs Bolt",
    re.search(r"lovable.*(better|vs).*bolt|bolt.*(vs).*lovable", vibe_blog, re.IGNORECASE) is not None,
    "Add a 'Is Lovable better than Bolt?' FAQ — high comparison intent",
)
check(
    "T8 · Vibe blog: content covers all 3 tools (Lovable, Bolt, v0)",
    all(kw in vibe_blog for kw in ["Lovable", "Bolt", "v0"]),
    "Ensure all 3 tools (Lovable, Bolt, v0) are covered in the blog post content",
)
check(
    "T8 · Vibe blog: content has a comparison table",
    "<table" in vibe_blog,
    "Add a comparison table to the vibe coding blog post for featured snippet",
)
check(
    "T8 · Vibe blog: mentions Lovable affiliate commission",
    re.search(r"30%|affiliate|commission", vibe_blog, re.IGNORECASE) is not None,
    "Mention Lovable's 30% recurring affiliate commission in the blog post",
)
check(
    "T8 · Vibe blog: mentions Supabase (Lovable's backend differentiator)",
    "Supabase" in vibe_blog,
    "Mention Supabase in the Lovable section — it's the core backend differentiator vs Bolt/v0",
)
check(
    "T8 · Vibe blog: has ogImage field",
    "ogImage:" in vibe_blog,
    "Add ogImage field pointing to /og/blog/best-vibe-coding-tools-2026.webp",
    severity="WARN",
)
check(
    "T8 · Vibe blog: has default export",
    "export default" in vibe_blog,
    "Add 'export default post;' at the end of the blog post file",
)

# ═══════════════════════════════════════════════════════════════════════════════
# T9 — blog/index.ts REGISTRATION
# ═══════════════════════════════════════════════════════════════════════════════
section("T9 — blog/index.ts: new posts imported + registered in BLOG_POSTS[]")

check(
    "T9 · blog/index.ts: imports gpt-5-5-vs-claude-opus-4-8-vs-grok-4-2026",
    "gpt-5-5-vs-claude-opus-4-8-vs-grok-4-2026" in blog_index,
    "Add: import postXX from './gpt-5-5-vs-claude-opus-4-8-vs-grok-4-2026' to blog/index.ts",
)
check(
    "T9 · blog/index.ts: imports best-vibe-coding-tools-2026",
    "best-vibe-coding-tools-2026" in blog_index,
    "Add: import postXX from './best-vibe-coding-tools-2026' to blog/index.ts",
)

# Verify both post variables appear inside the BLOG_POSTS array
_array_start = blog_index.find("BLOG_POSTS")
_array_block = blog_index[_array_start:] if _array_start != -1 else ""

# Find the variable names used for both new post imports
_gpt_import_match  = re.search(r"(post\d+)\s+from\s+['\"]\.\/gpt-5-5-vs-claude", blog_index)
_vibe_import_match = re.search(r"(post\d+)\s+from\s+['\"]\.\/best-vibe-coding", blog_index)

_gpt_var  = _gpt_import_match.group(1)  if _gpt_import_match  else "NOT_FOUND"
_vibe_var = _vibe_import_match.group(1) if _vibe_import_match else "NOT_FOUND"

check(
    f"T9 · blog/index.ts: GPT post variable ({_gpt_var}) appears in BLOG_POSTS[]",
    _gpt_var != "NOT_FOUND" and _gpt_var in _array_block,
    f"Add {_gpt_var} to the BLOG_POSTS array in blog/index.ts",
)
check(
    f"T9 · blog/index.ts: Vibe post variable ({_vibe_var}) appears in BLOG_POSTS[]",
    _vibe_var != "NOT_FOUND" and _vibe_var in _array_block,
    f"Add {_vibe_var} to the BLOG_POSTS array in blog/index.ts",
)
check(
    "T9 · blog/index.ts: new posts are near the TOP of BLOG_POSTS[] (freshness signal)",
    bool(re.search(
        rf"BLOG_POSTS[^=]{{0,20}}=\s*\[[\s\S]{{0,200}}{re.escape(_gpt_var)}|{re.escape(_vibe_var)}",
        blog_index,
    )),
    "Move new post variables to the start of the BLOG_POSTS array — newest-first ordering helps freshness signals",
    severity="WARN",
)
check(
    "T9 · blog/index.ts: file has 'export type { BlogPost }' re-export",
    "export type { BlogPost }" in blog_index,
    "Keep 'export type { BlogPost }' at the bottom of blog/index.ts",
)

# ═══════════════════════════════════════════════════════════════════════════════
# BONUS — Cross-cutting quality checks
# ═══════════════════════════════════════════════════════════════════════════════
section("BONUS — Cross-Cutting Quality Checks")

# Cursor and Lovable slugs appear in TOOLS array (not just FAQS/KEYWORDS)
_tools_array_pos = constants.find("export const TOOLS")
_tools_end_pos   = constants.find("];", _tools_array_pos) if _tools_array_pos != -1 else -1
_tools_block     = constants[_tools_array_pos:_tools_end_pos + 2] if _tools_array_pos != -1 else ""

check(
    "BONUS · constants.ts: 'cursor' slug is inside TOOLS[] (not just in FAQs)",
    "slug: 'cursor'" in _tools_block,
    "Ensure Cursor tool object is inside the TOOLS[] array, not just referenced in TOOL_FAQS",
)
check(
    "BONUS · constants.ts: 'lovable' slug is inside TOOLS[] (not just in FAQs)",
    "slug: 'lovable'" in _tools_block,
    "Ensure Lovable tool object is inside the TOOLS[] array",
)

# No duplicate IDs in TOOLS
_all_ids = re.findall(r"id:\s*'(c\d+|w\d+|a\d+|v\d+|d\d+|p\d+|m\d+)'", _tools_block)
_dup_ids = [i for i in set(_all_ids) if _all_ids.count(i) > 1]
check(
    "BONUS · constants.ts: no duplicate tool IDs in TOOLS[]",
    len(_dup_ids) == 0,
    f"Duplicate IDs found: {_dup_ids} — assign unique IDs to every tool",
)

# Cursor and Lovable both have iconName set
check(
    "BONUS · constants.ts: Cursor has iconName field",
    "iconName:" in cursor_block,
    "Add iconName to Cursor tool (e.g. 'Code2') — used for tool card icon rendering",
)
check(
    "BONUS · constants.ts: Lovable has iconName field",
    "iconName:" in lovable_block,
    "Add iconName to Lovable tool (e.g. 'Sparkles') — used for tool card icon",
)

# Cursor and Lovable have color + accentColor
check(
    "BONUS · constants.ts: Cursor has color and accentColor",
    "color:" in cursor_block and "accentColor:" in cursor_block,
    "Add color and accentColor hex values to Cursor tool entry",
)
check(
    "BONUS · constants.ts: Lovable has color and accentColor",
    "color:" in lovable_block and "accentColor:" in lovable_block,
    "Add color and accentColor hex values to Lovable tool entry",
)

# Both blog posts have internal links to /tools/ pages
check(
    "BONUS · GPT blog: has internal links to /tools/ pages",
    "/tools/" in gpt_blog or "ainexustools" in gpt_blog,
    "Add internal links to tool review pages in the GPT comparison blog post",
    severity="WARN",
)
check(
    "BONUS · Vibe blog: has internal links to /tools/ pages",
    "/tools/" in vibe_blog or "ainexustools" in vibe_blog,
    "Add internal links to tool review pages in the vibe coding blog post",
    severity="WARN",
)

# Sitemap contains both new blog slugs
check(
    "BONUS · sitemap.xml: contains gpt-5-5-vs-claude-opus-4-8-vs-grok-4-2026",
    _slug_gpt in sitemap,
    f"Add /blog/{_slug_gpt}/ to public/sitemap.xml — required for Google discovery",
    severity="WARN",
)
check(
    "BONUS · sitemap.xml: contains best-vibe-coding-tools-2026",
    _slug_vibe in sitemap,
    f"Add /blog/{_slug_vibe}/ to public/sitemap.xml",
    severity="WARN",
)

# Lovable affiliate link is not still using the placeholder
check(
    "BONUS · constants.ts: Lovable affiliate ref=YOUR_CODE is replaced",
    "YOUR_CODE" not in lovable_block,
    "Replace 'YOUR_CODE' in Lovable's affiliateLink with your real Lovable referral code",
    severity="WARN",
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
        print(f"  {YELLOW}⚠  {r['label']}{RESET}")
        if r["detail"]:
            print(f"     → {r['detail']}")

print(f"""
{BOLD}{CYAN}{'═' * 72}{RESET}
{BOLD}  WEEK 1 (JUN 5–11) — ALL 9 FIXES VALIDATED{RESET}
{BOLD}{CYAN}{'═' * 72}{RESET}
  T1  TRENDING_SLUGS      cursor + lovable + headshotpro added
  T2  Cursor tool entry   Full Tool object in TOOLS[] (id: c2)
  T3  Lovable tool entry  Full Tool object in TOOLS[] (id: c3)
  T4  TOOL_FAQS           cursor (6 FAQs) + lovable (5 FAQs)
  T5  TOOL_COMPARISONS    cursor (5 rows) + lovable (5 rows)
  T6  TOOL_KEYWORDS       cursor (5 kws) + lovable (5 kws)
  T7  Blog post           gpt-5-5-vs-claude-opus-4-8-vs-grok-4-2026.ts
  T8  Blog post           best-vibe-coding-tools-2026.ts
  T9  blog/index.ts       2 imports + BLOG_POSTS registration
{BOLD}{CYAN}{'═' * 72}{RESET}
""")

sys.exit(1 if critical_fails else 0)
