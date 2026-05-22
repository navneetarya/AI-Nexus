#!/usr/bin/env python3
"""
AI Nexus — Audit Fix Validator (May 22 2026)
=============================================
Validates every fix applied in the May 22 2026 audit session (4 subagents):

  S1  : HomePage trust bar + trending section fixes          (Subagent 1)
  S2  : SharedNav "Best Lists" dropdown                      (Subagent 1)
  S3  : Sitemap additions (glossary, heygen, compare, chatbot blog)
  S4  : Tool data enrichment — realOutputExample + HeyGen   (Subagent 2)
  S5  : EEAT signals — AboutPage bio + compare article      (Subagent 3)
  S6  : lastTestedISO present on all 25 tools               (Subagent 3)
  S7  : India pricing on 8 tools + indiaPricing type        (Subagent 4)
  S8  : Research Transparency badge in ToolPage sidebar     (Subagent 4)
  S9  : Blog post best-ai-chatbot-2026 created + registered (Subagent 4)

  [PRESERVED] W1-T5 through W2-T5 — previous session checks

Run from project root:
    python validate_today_fixes.py

Exit codes:
    0 — all checks passed
    1 — one or more CRITICAL failures
"""

import re
import sys
import pathlib
from typing import Any

ROOT         = pathlib.Path(__file__).parent.resolve()
TOOLPAGE     = ROOT / "pages" / "ToolPage.tsx"
HOMEPAGE     = ROOT / "pages" / "HomePage.tsx"
SHAREDNAV    = ROOT / "pages" / "SharedNav.tsx"
ABOUTPAGE    = ROOT / "pages" / "AboutPage.tsx"
CONSTANTS    = ROOT / "constants.ts"
TYPES        = ROOT / "types.ts"
SITEMAP      = ROOT / "public" / "sitemap.xml"
COMPARE_DATA = ROOT / "pages" / "compare-data.ts"
BLOG_INDEX   = ROOT / "blog" / "index.ts"
CHATBOT_POST = ROOT / "blog" / "best-ai-chatbot-2026.ts"

# ── ANSI colours ─────────────────────────────────────────────────────────────
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
    tag  = f"{GREEN}[PASS]{RESET}" if ok else f"{sev_col}[{severity}]{RESET}"
    line = f"  {icon}  {label}"
    if detail:
        line += f"\n       {YELLOW}→ {detail}{RESET}" if not ok else f"\n       {CYAN}{detail}{RESET}"
    print(f"{tag} {line}")
    return ok


def section(title: str):
    print(f"\n{BOLD}{CYAN}{'─' * 70}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'─' * 70}{RESET}")


def get_tool_block(src: str, slug: str) -> str | None:
    """
    Return the substring of src that contains only the TOOL_CONTENT entry
    for `slug`.  Works for both  'murf-ai': {  and  grammarly: {  forms.
    Used for ToolPage.tsx TOOL_CONTENT lookups.
    """
    escaped = re.escape(slug)
    pattern = rf"\n  (?:'{escaped}'|{escaped}):\s*\{{"
    m = re.search(pattern, src)
    if not m:
        return None
    start = m.start()
    next_key = re.search(r"\n  (?:'[\w-]+'|[a-z][a-zA-Z-]*):\s*\{", src[start + 1:])
    if next_key:
        end = start + 1 + next_key.start()
    else:
        end = src.find("\n};\n", start)
        end = end if end != -1 else start + 12000
    return src[start:end]


def get_const_tool_block(const_src: str, slug: str) -> str | None:
    """
    Extract a tool entry block from constants.ts TOOLS array.
    Finds `slug: 'slug-value'` then uses brace counting to return the full
    containing object.
    """
    pattern = rf"slug:\s*['\"]({re.escape(slug)})['\"]"
    m = re.search(pattern, const_src)
    if not m:
        return None
    # Scan back to find the opening `  {` of this tool object
    before = const_src[: m.start()]
    open_brace_pos = before.rfind("\n  {")
    if open_brace_pos == -1:
        # Fallback: wide window around the slug line
        return const_src[max(0, m.start() - 300): m.start() + 5000]
    start = open_brace_pos
    depth = 0
    i = start
    limit = min(len(const_src), start + 9000)
    while i < limit:
        if const_src[i] == "{":
            depth += 1
        elif const_src[i] == "}":
            depth -= 1
            if depth == 0:
                return const_src[start : i + 1]
        i += 1
    # Fallback if brace counting fails
    return const_src[start : start + 6000]


# ── Load source files ─────────────────────────────────────────────────────────
_required = [TOOLPAGE, HOMEPAGE, SHAREDNAV, ABOUTPAGE, CONSTANTS, TYPES,
             SITEMAP, COMPARE_DATA, BLOG_INDEX]
_missing  = [str(f) for f in _required if not f.exists()]
if _missing:
    print(f"{RED}ERROR: Missing required files:{RESET}")
    for f in _missing:
        print(f"  {RED}✗ {f}{RESET}")
    sys.exit(1)

src         = TOOLPAGE.read_text(encoding="utf-8")
home_src    = HOMEPAGE.read_text(encoding="utf-8")
nav_src     = SHAREDNAV.read_text(encoding="utf-8")
about_src   = ABOUTPAGE.read_text(encoding="utf-8")
const_src   = CONSTANTS.read_text(encoding="utf-8")
types_src   = TYPES.read_text(encoding="utf-8")
sitemap_src = SITEMAP.read_text(encoding="utf-8")
compare_src = COMPARE_DATA.read_text(encoding="utf-8")
blog_idx    = BLOG_INDEX.read_text(encoding="utf-8")
chatbot_src = CHATBOT_POST.read_text(encoding="utf-8") if CHATBOT_POST.exists() else ""


# ══════════════════════════════════════════════════════════════════════════════
# S1 — HomePage Trust Bar & Trending Section (Subagent 1)
# ══════════════════════════════════════════════════════════════════════════════
section("S1 — HomePage Trust Bar & Trending Section")

check(
    "TRENDING_SLUGS imported in HomePage.tsx",
    "TRENDING_SLUGS" in home_src,
    "Expected: import { TOOLS, SITE_CONFIG, TRENDING_SLUGS } from '../constants';",
)
check(
    "Stat counter shows '24' AI tools reviewed",
    bool(re.search(r"n:\s*['\"]24['\"]", home_src)),
    "Expected: { n: '24', label: 'AI tools reviewed' }",
)
check(
    "Stat counter shows '31' blog posts published",
    bool(re.search(r"n:\s*['\"]31['\"]", home_src)),
    "Expected: { n: '31', label: 'blog posts published' }",
)
check(
    "Old inaccurate stat '17' guides/blog posts removed",
    not bool(re.search(r"n:\s*['\"]17['\"]", home_src)),
    "The old '17' stat still appears — should have been replaced with '31'",
)
check(
    "Teal trust bar updated: 'Free plan status shown on every card'",
    "Free plan status shown on every card" in home_src,
    "Expected: text: 'Free plan status shown on every card'",
)
check(
    "Trending section heading: 'Most Researched This Month'",
    "Most Researched This Month" in home_src,
    "Old heading 'Trending This Week' should be replaced",
)
check(
    "Trending section filters tools via TRENDING_SLUGS.includes(t.slug)",
    "TRENDING_SLUGS.includes(t.slug)" in home_src,
    "Expected: TOOLS.filter(t => TRENDING_SLUGS.includes(t.slug))",
)
# Strip JSX comments {/* ... */} before checking — the old name may survive in a code comment
_home_no_comments = re.sub(r'\{/\*[\s\S]*?\*/\}', '', home_src)
check(
    "Old hardcoded 'Trending This Week' heading removed (outside JSX comments)",
    "Trending This Week" not in _home_no_comments,
    "Old heading 'Trending This Week' still present in rendered JSX — should be 'Most Researched This Month'",
)


# ══════════════════════════════════════════════════════════════════════════════
# S2 — SharedNav Best Lists Dropdown (Subagent 1)
# ══════════════════════════════════════════════════════════════════════════════
section("S2 — SharedNav 'Best Lists' Dropdown")

check(
    "BookOpen imported from lucide-react in SharedNav.tsx",
    "BookOpen" in nav_src,
    "Expected: import { ..., BookOpen } from 'lucide-react';",
)
check(
    "bestListsOpen state declared",
    "bestListsOpen" in nav_src,
    "Expected: const [bestListsOpen, setBestListsOpen] = useState(false);",
)
check(
    "bestListsRef ref declared",
    "bestListsRef" in nav_src,
    "Expected: const bestListsRef = useRef<HTMLDivElement>(null);",
)
check(
    ".bestlists-wrap CSS class defined",
    ".bestlists-wrap" in nav_src,
    "Expected: .bestlists-wrap { position: relative; } in NAV_CSS",
)
check(
    "'Best Lists' label rendered in desktop nav",
    "Best Lists" in nav_src,
    "Expected: <BookOpen .../> Best Lists <ChevronDown .../> inside nav button",
)
check(
    "Best Lists dropdown contains link to /best-free-ai-tools",
    "/best-free-ai-tools" in nav_src,
    "Expected: best-free-ai-tools path in dropdown links",
)
check(
    "Best Lists dropdown contains link to /best-ai-tools-india",
    "/best-ai-tools-india" in nav_src,
    "Expected: best-ai-tools-india path in dropdown links",
)
check(
    "Best Lists dropdown contains link to /best-ai-writing-tools",
    "/best-ai-writing-tools" in nav_src,
    "Expected: best-ai-writing-tools path in dropdown links",
)
check(
    "Best Lists dropdown contains link to /best-ai-coding-tools",
    "/best-ai-coding-tools" in nav_src,
    "Expected: best-ai-coding-tools path in dropdown links",
    severity="WARN",
)
check(
    "Best Lists dropdown contains link to /best-ai-logo-makers",
    "/best-ai-logo-makers" in nav_src,
    "Expected: best-ai-logo-makers path in dropdown links",
    severity="WARN",
)


# ══════════════════════════════════════════════════════════════════════════════
# S3 — Sitemap Additions
# ══════════════════════════════════════════════════════════════════════════════
section("S3 — Sitemap Additions")

check(
    "Sitemap: /glossary/ URL present",
    "ainexustools.online/glossary/" in sitemap_src,
    "Expected: <url><loc>https://ainexustools.online/glossary/</loc>...</url>",
)
check(
    "Sitemap: /tools/heygen/ URL present",
    "ainexustools.online/tools/heygen/" in sitemap_src,
    "Expected: <url><loc>https://ainexustools.online/tools/heygen/</loc>...</url>",
)
check(
    "Sitemap: /compare/claude-code-vs-github-copilot-vs-replit/ URL present",
    "ainexustools.online/compare/claude-code-vs-github-copilot-vs-replit/" in sitemap_src,
    "Expected: compare article URL in sitemap",
)
check(
    "Sitemap: /blog/best-ai-chatbot-2026/ URL present",
    "ainexustools.online/blog/best-ai-chatbot-2026/" in sitemap_src,
    "Expected: blog post URL in sitemap",
)
check(
    "Sitemap is well-formed (ends with </urlset>)",
    sitemap_src.strip().endswith("</urlset>"),
    "XML closing tag </urlset> missing — sitemap may be malformed",
)
check(
    "HeyGen sitemap entry has image tag",
    bool(re.search(r"tools/heygen/.*?image:loc", sitemap_src, re.DOTALL)),
    "Expected: <image:image><image:loc>...heygen.png</image:loc>...</image:image>",
    severity="WARN",
)


# ══════════════════════════════════════════════════════════════════════════════
# S4 — Tool Data Enrichment: realOutputExample + HeyGen (Subagent 2)
# ══════════════════════════════════════════════════════════════════════════════
section("S4 — Tool Data Enrichment: realOutputExample + HeyGen")

check(
    "TRENDING_SLUGS exported from constants.ts",
    "export const TRENDING_SLUGS" in const_src,
    "Expected: export const TRENDING_SLUGS: string[] = ['perplexity', 'gamma', 'replit', 'canva-ai'];",
)
check(
    "TRENDING_SLUGS contains expected 4 slugs",
    all(s in const_src for s in ["'perplexity'", "'gamma'", "'replit'", "'canva-ai'"]),
    "Expected all 4 slugs: perplexity, gamma, replit, canva-ai",
)

for slug in ["quillbot", "writesonic", "canva-ai", "perplexity"]:
    block = get_const_tool_block(const_src, slug)
    if block is None:
        check(f"'{slug}' entry found in constants.ts", False, "slug not found")
        continue
    check(
        f"'{slug}' has realOutputExample field",
        "realOutputExample" in block,
        "Field realOutputExample missing from this tool's constants.ts entry",
    )

check(
    "HeyGen tool entry exists in constants.ts (slug: 'heygen')",
    bool(get_const_tool_block(const_src, "heygen")),
    "Expected: { id: 'v4', slug: 'heygen', name: 'HeyGen', ... } in TOOLS array",
)
heygen_block = get_const_tool_block(const_src, "heygen")
if heygen_block:
    check(
        "HeyGen has affiliateLink field",
        "affiliateLink" in heygen_block,
        "Expected: affiliateLink: 'https://heygen.com?via=ainexus'",
    )
    check(
        "HeyGen has category VIDEO",
        "VIDEO" in heygen_block,
        "Expected: category: Category.VIDEO",
    )
    check(
        "HeyGen has researchSources field",
        "researchSources" in heygen_block,
        "Expected: researchSources: { trustpilot: {...}, g2: {...}, ... }",
        severity="WARN",
    )

perplexity_block = get_const_tool_block(const_src, "perplexity")
if perplexity_block:
    check(
        "Perplexity has titleTemplate field",
        "titleTemplate" in perplexity_block,
        "Expected: titleTemplate: 'Perplexity AI Review 2026...' for SEO <title> override",
    )


# ══════════════════════════════════════════════════════════════════════════════
# S5 — EEAT Signals: AboutPage + Compare Article (Subagent 3)
# ══════════════════════════════════════════════════════════════════════════════
section("S5 — EEAT Signals: AboutPage Bio + Compare Article")

check(
    "AboutPage: professional bio mentions 'automation and performance testing pipelines'",
    "automation and performance testing pipelines" in about_src,
    "Expected: 'I evaluate and implement AI tools for automation and performance testing pipelines'",
)
check(
    "AboutPage: bio mentions '24+' tools",
    "24+" in about_src,
    "Expected: '24+ tools across writing, audio, video, design...'",
)
check(
    "AboutPage: authorSchema.sameAs includes Medium URL",
    "medium.com/@navneetarya1989" in about_src,
    "Expected: 'https://medium.com/@navneetarya1989' in authorSchema.sameAs array",
)
check(
    "compare-data.ts: claude-code-vs-github-copilot-vs-replit article added",
    "claude-code-vs-github-copilot-vs-replit" in compare_src,
    "Expected: slug: 'claude-code-vs-github-copilot-vs-replit' in compare-data.ts",
)
check(
    "compare-data.ts: compare article has quickAnswer field",
    bool(re.search(
        r"claude-code-vs-github-copilot-vs-replit[\s\S]{0,2000}quickAnswer",
        compare_src,
    )),
    "Expected: quickAnswer field in the claude-code compare article",
    severity="WARN",
)
check(
    "compare-data.ts: compare article has faqs array",
    bool(re.search(
        r"claude-code-vs-github-copilot-vs-replit[\s\S]{0,50000}faqs",
        compare_src,
    )),
    "Expected: faqs array in the claude-code compare article",
    severity="WARN",
)


# ══════════════════════════════════════════════════════════════════════════════
# S6 — lastTestedISO Present on All 25 Tools (Subagent 3)
# ══════════════════════════════════════════════════════════════════════════════
section("S6 — lastTestedISO Present on All 25 Tools in constants.ts")

ALL_25_SLUGS = [
    # WRITING (8)
    "grammarly", "rytr", "writesonic", "quillbot", "frase", "jasper", "notion-ai",
    # DESIGN (4)
    "canva-ai", "leonardo-ai", "photoroom", "looka",
    # PRODUCTIVITY (2)
    "taskade", "gamma",
    # PRESENTATIONS (1)
    "beautiful-ai",
    # AI SEARCH (1)
    "perplexity",
    # AUDIO (4)
    "murf-ai", "elevenlabs", "podcastle", "descript",
    # VIDEO (4)
    "opus-clip", "pictory", "invideo", "heygen",
    # SOCIAL (1)
    "ocoya",
    # CODING (1)
    "replit",
]

_iso_pattern = re.compile(r"lastTestedISO\s*:\s*['\"](\d{4}-\d{2}-\d{2})['\"]")

for slug in ALL_25_SLUGS:
    block = get_const_tool_block(const_src, slug)
    if block is None:
        check(f"'{slug}' entry found in constants.ts", False, "slug not found in TOOLS array")
        continue
    has_iso = "lastTestedISO" in block
    check(
        f"'{slug}' has lastTestedISO",
        has_iso,
        "lastTestedISO field missing — add it with a YYYY-MM-DD date string",
    )
    if has_iso:
        iso_match = _iso_pattern.search(block)
        check(
            f"'{slug}' lastTestedISO is valid YYYY-MM-DD",
            iso_match is not None,
            f"lastTestedISO value does not match YYYY-MM-DD format",
            severity="WARN",
        )

total_iso = len(_iso_pattern.findall(const_src))
check(
    f"constants.ts has lastTestedISO on all 25 tools (found {total_iso})",
    total_iso >= 25,
    f"Found {total_iso} lastTestedISO entries; expected ≥25",
)


# ══════════════════════════════════════════════════════════════════════════════
# S7 — India Pricing: indiaPricing Type + 8 Tools (Subagent 4)
# ══════════════════════════════════════════════════════════════════════════════
section("S7 — India Pricing: indiaPricing Type + 8 Tools in constants.ts")

check(
    "types.ts: indiaPricing optional field declared in Tool interface",
    "indiaPricing?" in types_src,
    "Expected: indiaPricing?: { free: string; paid: string; note: string; } in Tool interface",
)

INDIA_PRICING_TOOLS = [
    "grammarly", "rytr", "writesonic", "canva-ai",
    "notion-ai", "taskade", "replit", "ocoya",
]

for slug in INDIA_PRICING_TOOLS:
    block = get_const_tool_block(const_src, slug)
    if block is None:
        check(f"'{slug}' has indiaPricing", False, "slug not found in constants.ts")
        continue
    has_india = "indiaPricing" in block
    check(
        f"'{slug}' has indiaPricing field",
        has_india,
        "indiaPricing block missing — should have free, paid, note sub-fields",
    )
    if has_india:
        # Check it has all 3 sub-fields within the tool block
        has_note = bool(re.search(r"indiaPricing[\s\S]{0,500}note\s*:", block))
        check(
            f"'{slug}' indiaPricing has 'note' field",
            has_note,
            "indiaPricing should include free, paid, and note keys",
            severity="WARN",
        )

total_india = const_src.count("indiaPricing:")
check(
    f"constants.ts has indiaPricing on exactly 8 tools (found {total_india})",
    total_india == 8,
    f"Found {total_india} indiaPricing entries; expected exactly 8",
    severity="WARN",
)


# ══════════════════════════════════════════════════════════════════════════════
# S8 — Research Transparency Badge in ToolPage Sidebar (Subagent 4)
# ══════════════════════════════════════════════════════════════════════════════
section("S8 — Research Transparency Badge in ToolPage.tsx")

check(
    "ToolPage.tsx: 'Research Transparency' heading rendered",
    "Research Transparency" in src,
    "Expected: a card with heading 'Research Transparency' in the sidebar",
)
check(
    "ToolPage.tsx: badge conditionally renders on tool.researchSources",
    bool(re.search(r"tool\.researchSources\s*&&[\s\S]{0,600}Research Transparency", src)),
    "Expected: {tool.researchSources && ( ... Research Transparency ... )} conditional",
)
check(
    "ToolPage.tsx: badge shows Trustpilot review count",
    bool(re.search(r"Research Transparency[\s\S]{0,800}trustpilot[\s\S]{0,400}count", src)),
    "Expected: Trustpilot count inside the Research Transparency card",
    severity="WARN",
)
check(
    "ToolPage.tsx: badge shows G2 review count",
    bool(re.search(r"Research Transparency[\s\S]{0,1000}g2[\s\S]{0,400}count", src)),
    "Expected: G2 count inside the Research Transparency card",
    severity="WARN",
)
check(
    "ToolPage.tsx: badge shows lastVerified date",
    bool(re.search(r"researchSources\.lastVerified", src)),
    "Expected: {tool.researchSources.lastVerified} displayed in the badge",
)


# ══════════════════════════════════════════════════════════════════════════════
# S9 — Blog Post: best-ai-chatbot-2026 + Index Registration (Subagent 4)
# ══════════════════════════════════════════════════════════════════════════════
section("S9 — Blog Post: best-ai-chatbot-2026.ts Created & Registered")

check(
    "blog/best-ai-chatbot-2026.ts file exists",
    CHATBOT_POST.exists(),
    f"Expected file: {CHATBOT_POST}",
)
if chatbot_src:
    check(
        "best-ai-chatbot-2026.ts: faqs array present",
        "faqs:" in chatbot_src,
        "Expected: faqs: [ { q: '...', a: '...' }, ... ] in the post object",
    )
    faq_count = len(re.findall(r"\{\s*q\s*:", chatbot_src))
    check(
        f"best-ai-chatbot-2026.ts: has ≥3 FAQ entries (found {faq_count})",
        faq_count >= 3,
        f"Found {faq_count} FAQ item(s); recommend ≥3 for FAQPage schema",
    )
    check(
        "best-ai-chatbot-2026.ts: slug is 'best-ai-chatbot-2026'",
        "slug: 'best-ai-chatbot-2026'" in chatbot_src or 'slug: "best-ai-chatbot-2026"' in chatbot_src,
        "Expected: slug: 'best-ai-chatbot-2026' in post object",
    )
    check(
        "best-ai-chatbot-2026.ts: metaDescription field present",
        "metaDescription" in chatbot_src,
        "Expected: metaDescription field for SEO",
    )
    check(
        "best-ai-chatbot-2026.ts: content field present",
        "content:" in chatbot_src,
        "Expected: content field with markdown/HTML post body",
    )

check(
    "blog/index.ts: post32 imported from './best-ai-chatbot-2026'",
    "post32" in blog_idx and "best-ai-chatbot-2026" in blog_idx,
    "Expected: import post32 from './best-ai-chatbot-2026'; in blog/index.ts",
)
check(
    "blog/index.ts: post32 included in BLOG_POSTS export array",
    bool(re.search(r"BLOG_POSTS[\s\S]{0,500}post32", blog_idx)),
    "Expected: post32 added to the BLOG_POSTS export array",
)
total_posts = len(re.findall(r"\bpost\d+\b", blog_idx.split("BLOG_POSTS")[0]))
check(
    f"blog/index.ts: 32 post imports present (found {total_posts})",
    total_posts >= 32,
    f"Expected 32 post imports (post1–post32); found {total_posts}",
    severity="WARN",
)


# ═══════════════════════════════════════════════════════════════════════════════
# W1-T5  "How We Review" callout card
# ═══════════════════════════════════════════════════════════════════════════════
section("W1-T5 — 'How We Review' Callout on Every Tool Page")

check(
    "Callout text 'How this review was made:' present in ToolPage.tsx",
    "How this review was made:" in src,
)
check(
    "Callout uses C.a1card CSS variable for background",
    "background: C.a1card" in src and "How this review was made:" in src,
    "Expected: background: C.a1card near the callout block",
)
check(
    "Callout uses C.a1brd CSS variable for border",
    "C.a1brd" in src and "How this review was made:" in src,
    "Expected: border: `1px solid ${C.a1brd}` near the callout block",
)
check(
    "Callout links to /methodology/ with 'See full methodology' text",
    bool(re.search(r'href="/methodology/"[^>]*>[\s\S]{0,60}See full methodology', src)),
    "Expected: <a href='/methodology/'>See full methodology →</a>",
)
check(
    "Callout is conditional on content?.whatIs (only shows when tool has a definition)",
    bool(re.search(
        r'content\?\.whatIs[\s\S]{0,2000}How this review was made',
        src,
    )),
    "Expected: {content?.whatIs && ( ... How this review was made: ... )} block",
)
check(
    "Callout is placed BEFORE the Quick Verdict section",
    src.index("How this review was made:") < src.index('aria-label="Quick Verdict"'),
    "Callout must appear before Quick Verdict in the JSX render order",
)


# ═══════════════════════════════════════════════════════════════════════════════
# W2-T1  handsOnTesting — 8 thin pages
# ═══════════════════════════════════════════════════════════════════════════════
section("W2-T1 — handsOnTesting Added to 8 Thin Tool Pages")

THIN_PAGES = [
    "murf-ai",
    "frase",
    "notion-ai",
    "photoroom",
    "beautiful-ai",
    "leonardo-ai",
    "replit",
    "taskade",
]

for slug in THIN_PAGES:
    block = get_tool_block(src, slug)
    if block is None:
        check(f"'{slug}' entry found in TOOL_CONTENT", False, "slug key not found in source")
        continue
    has_hot = "handsOnTesting:" in block
    check(
        f"'{slug}' has handsOnTesting field",
        has_hot,
        "Field handsOnTesting missing from this tool's TOOL_CONTENT entry",
    )
    if has_hot:
        # Must start with the standard research provenance header
        ok_header = bool(re.search(
            r'handsOnTesting:\s*`Free (?:plan|trial) test',
            block,
        ))
        check(
            f"'{slug}' handsOnTesting opens with standard provenance header",
            ok_header,
            "Expected: handsOnTesting: `Free plan test — documented from verified user reports…`",
            severity="WARN",
        )
        # Must have at least 2 paragraph breaks (non-trivial content)
        para_count = block.count("\\n\\n") + block.count("\n\n")
        check(
            f"'{slug}' handsOnTesting has 2+ paragraphs of content",
            para_count >= 2,
            f"Found {para_count} paragraph break(s); expected ≥2",
            severity="WARN",
        )


# ═══════════════════════════════════════════════════════════════════════════════
# W2-T2  handsOnTesting — 3 existing affiliate pages (pre-existing, should be intact)
# ═══════════════════════════════════════════════════════════════════════════════
section("W2-T2 — Affiliate Pages handsOnTesting Intact (rytr / podcastle / ocoya)")

for slug in ["rytr", "podcastle", "ocoya"]:
    block = get_tool_block(src, slug)
    check(
        f"'{slug}' handsOnTesting preserved",
        block is not None and "handsOnTesting:" in block,
        "handsOnTesting was present before today and must not have been removed",
    )


# ═══════════════════════════════════════════════════════════════════════════════
# W2-T3  pricingSection + faqs — leonardo-ai, replit, taskade
# ═══════════════════════════════════════════════════════════════════════════════
section("W2-T3 — pricingSection & faqs Added to leonardo-ai / replit / taskade")

NEW_FULL_CONTENT_TOOLS = ["leonardo-ai", "replit", "taskade"]

for slug in NEW_FULL_CONTENT_TOOLS:
    block = get_tool_block(src, slug)
    if block is None:
        check(f"'{slug}' entry found in TOOL_CONTENT", False, "slug key not found")
        continue

    # pricingSection
    check(
        f"'{slug}' has pricingSection field",
        "pricingSection:" in block,
        "pricingSection field missing",
    )

    # faqs — must have ≥3 Q&A objects
    faq_count = len(re.findall(r"\{\s*q:", block))
    check(
        f"'{slug}' has ≥3 FAQ entries",
        faq_count >= 3,
        f"Found {faq_count} FAQ item(s); expected ≥3",
    )

    # Each FAQ must have both q and a keys
    q_count = len(re.findall(r"\bq:", block))
    a_count = len(re.findall(r"\ba:", block))
    check(
        f"'{slug}' FAQ items all have matching q/a pairs",
        q_count == a_count and q_count >= 3,
        f"q count={q_count}, a count={a_count}",
        severity="WARN",
    )


# ═══════════════════════════════════════════════════════════════════════════════
# W2-T4  lastTestedISO — all tools that were missing it
# ═══════════════════════════════════════════════════════════════════════════════
section("W2-T4 — lastTestedISO Added to All Previously Missing Tools")

# Tools that were missing lastTestedISO before today's session
TOOLS_MISSING_ISO_BEFORE = [
    "photoroom",       # added 2026-03-15
    "beautiful-ai",    # added 2026-02-15
    "leonardo-ai",     # added 2026-02-15
    "replit",          # added 2026-04-15
    "taskade",         # added 2026-04-15
    "opus-clip",         # added 2026-03-15
    "gamma",           # added 2026-03-15
    "ocoya",           # added 2026-04-15
    "looka",           # added 2026-01-15
    "pictory",         # added 2026-02-15
    "podcastle",       # added 2026-04-15
    "jasper",          # added 2026-04-15
]

for slug in TOOLS_MISSING_ISO_BEFORE:
    block = get_tool_block(src, slug)
    if block is None:
        check(f"'{slug}' has lastTestedISO", False, "slug not found")
        continue
    has_iso = "lastTestedISO:" in block
    check(
        f"'{slug}' has lastTestedISO",
        has_iso,
        "lastTestedISO field missing from rating line",
    )
    if has_iso:
        # Must be a valid ISO-8601 date string in YYYY-MM-DD format
        iso_match = re.search(r'lastTestedISO:\s*"(\d{4}-\d{2}-\d{2})"', block)
        check(
            f"'{slug}' lastTestedISO is a valid YYYY-MM-DD value",
            iso_match is not None,
            f"Value does not match YYYY-MM-DD: {block[block.find('lastTestedISO:'):block.find('lastTestedISO:')+40]}",
            severity="WARN",
        )

# Tools that already had lastTestedISO — confirm they're still intact
TOOLS_HAD_ISO = [
    "grammarly", "writesonic", "quillbot", "frase",
    "invideo", "murf-ai", "elevenlabs",
    "descript", "notion-ai", "canva-ai", "perplexity",
]

for slug in TOOLS_HAD_ISO:
    block = get_tool_block(src, slug)
    check(
        f"'{slug}' lastTestedISO preserved (pre-existing)",
        block is not None and "lastTestedISO:" in block,
        "lastTestedISO was already present and must not have been removed",
        severity="WARN",
    )


# ═══════════════════════════════════════════════════════════════════════════════
# W2-T5  Semantic <time dateTime> in hero "Last Tested" badge
# ═══════════════════════════════════════════════════════════════════════════════
section("W2-T5 — Semantic <time> Element in 'Last Tested' Hero Badge")

check(
    "Hero badge contains <time dateTime={...}> element",
    "<time dateTime={" in src,
    "Expected: <time dateTime={content?.lastTestedISO ?? ...}>",
)
check(
    "<time> uses lastTestedISO with ISO fallback chain",
    bool(re.search(r"<time\s+dateTime=\{content\?\.lastTestedISO\s*\?\?", src)),
    "Expected: dateTime={content?.lastTestedISO ?? (...fallback...)}",
)
check(
    "<time> displays human-readable lastTested string as children",
    bool(re.search(r"<time[^>]+>\{content\?\.lastTested", src)),
    "Expected: <time dateTime={...}>{content?.lastTested || 'May 2026'}</time>",
)
check(
    "Hero badge <time> is inside the 'Independently reviewed' span",
    bool(re.search(
        r"Independently reviewed.*<time\s+dateTime",
        src,
        re.DOTALL,
    )),
    "Expected the <time> element within the badge span near '🔍 Independently reviewed'",
)


# ═══════════════════════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════════════════════
section("SUMMARY")

passed   = sum(1 for r in results if r["ok"])
failed   = sum(1 for r in results if not r["ok"] and r["severity"] == "CRITICAL")
warnings = sum(1 for r in results if not r["ok"] and r["severity"] == "WARN")
total    = len(results)

print(f"\n  {GREEN}{BOLD}{passed}/{total}{RESET} checks passed", end="")
if failed:
    print(f"  {RED}{BOLD}{failed} critical failure(s){RESET}", end="")
if warnings:
    print(f"  {YELLOW}{warnings} warning(s){RESET}", end="")
print()

if failed == 0 and warnings == 0:
    print(f"\n  {GREEN}{BOLD}All May 22 audit fixes verified successfully — safe to deploy.{RESET}")
elif failed == 0:
    print(f"\n  {YELLOW}No critical failures. Review warnings above before deploying.{RESET}")
else:
    print(f"\n  {RED}Fix critical failures before deploying.{RESET}")

print()
sys.exit(0 if failed == 0 else 1)
