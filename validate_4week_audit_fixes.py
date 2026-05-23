#!/usr/bin/env python3
"""
AI Nexus — 4-Week Audit Fix Validator (May 23 2026)
====================================================
Validates all 20 code fixes across the 4-week SEO/EEAT audit action plan.

  W1  — Week 1: EEAT Foundation (Tasks 1–5)
  W2  — Week 2: Content Authority + Schema (Tasks 6–10)
  W3  — Week 3: Homepage Trust Architecture (Tasks 11–15)
  W4  — Week 4: Authority + Ranking Push (Tasks 16–20)

Run from project root:
    python validate_4week_audit_fixes.py

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
INDEX_HTML    = ROOT / "index.html"
APP_TSX       = ROOT / "App.tsx"
METHODOLOGY   = ROOT / "pages" / "MethodologyPage.tsx"
CONSTANTS     = ROOT / "constants.ts"
TYPES         = ROOT / "types.ts"
HOMEPAGE      = ROOT / "pages" / "HomePage.tsx"
TOOLPAGE      = ROOT / "pages" / "ToolPage.tsx"
SHAREDNAV     = ROOT / "pages" / "SharedNav.tsx"
ABOUTPAGE     = ROOT / "pages" / "AboutPage.tsx"
COMPARE_IDX   = ROOT / "pages" / "CompareIndexPage.tsx"
COMPARE_DATA  = ROOT / "pages" / "compare-data.ts"
PRERENDER     = ROOT / "scripts" / "prerender.mjs"
VERIFY_SCRIPT = ROOT / "scripts" / "verify-prerender.mjs"
PACKAGE_JSON  = ROOT / "package.json"
LLMS_TXT      = ROOT / "public" / "llms.txt"
BLOG_INDEX    = ROOT / "blog" / "index.ts"
TRENDING_POST = ROOT / "blog" / "perplexity-pro-vs-chatgpt-plus-vs-claude-pro-freelancers-2026.ts"

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


def get_const_tool_block(src: str, slug: str) -> str | None:
    """Extract the full tool entry object from constants.ts TOOLS array by slug."""
    pattern = rf"slug:\s*['\"]({re.escape(slug)})['\"]"
    m = re.search(pattern, src)
    if not m:
        return None
    before = src[: m.start()]
    open_brace_pos = before.rfind("\n  {")
    if open_brace_pos == -1:
        return src[max(0, m.start() - 300): m.start() + 5000]
    start = open_brace_pos
    depth = 0
    i = start
    limit = min(len(src), start + 9000)
    while i < limit:
        if src[i] == "{":
            depth += 1
        elif src[i] == "}":
            depth -= 1
            if depth == 0:
                return src[start: i + 1]
        i += 1
    return src[start: start + 5000]


# =============================================================================
# WEEK 1 — EEAT Foundation (Tasks 1–5)
# =============================================================================
section("WEEK 1 — EEAT Foundation (Tasks 1–5)")

# Task 1a: index.html default theme = light
idx = read(INDEX_HTML)
check(
    "T1a  index.html — fallback theme is 'light' (not 'dark')",
    bool(re.search(r"var theme\s*=.*?:\s*['\"]light['\"]", idx)),
    "Theme init script still defaults to 'dark'. Look for the ternary that sets var theme.",
)

# Task 1b: App.tsx getInitialTheme returns 'light'
app = read(APP_TSX)
check(
    "T1b  App.tsx — getInitialTheme() returns 'light' as default",
    bool(re.search(r"getInitialTheme|return\s+['\"]light['\"]", app))
    and "return 'light'" in app or 'return "light"' in app,
    "App.tsx getInitialTheme() still returns 'dark' as default.",
)

# Task 2: MethodologyPage weasel language removed
meth = read(METHODOLOGY)
has_may     = bool(re.search(r"\bmay be registered\b", meth, re.IGNORECASE))
has_honest  = bool(re.search(r"(sign up|register.*account|free account|free tier.*test)", meth, re.IGNORECASE))
has_list    = all(slug in meth for slug in ["Grammarly", "Rytr", "Looka", "Perplexity"])
check(
    "T2a  MethodologyPage — 'may be registered' weasel phrase removed",
    not has_may,
    "Phrase 'may be registered' still found. Rewrite Step 1 to remove hedging language.",
)
check(
    "T2b  MethodologyPage — honest first-person methodology present",
    has_honest,
    "No direct first-person language about actually testing/signing up found.",
    severity="WARN",
)
check(
    "T2c  MethodologyPage — free-tier tool list includes Grammarly, Rytr, Looka, Perplexity",
    has_list,
    "One or more expected tool names missing from methodology page.",
    severity="WARN",
)

# Task 3: realOutputExample for 5 free-tier tools
const = read(CONSTANTS)
for slug in ["canva-ai", "notion-ai", "gamma", "perplexity", "looka"]:
    block = get_const_tool_block(const, slug)
    has_example = bool(block and "realOutputExample" in block)
    check(
        f"T3   constants.ts — realOutputExample present for '{slug}'",
        has_example,
        f"Tool '{slug}' is missing realOutputExample field.",
    )

# Task 4: heygen removed from constants.ts
heygen_present = bool(re.search(r"slug:\s*['\"]heygen['\"]", const))
check(
    "T4   constants.ts — heygen slug removed",
    not heygen_present,
    "heygen entry still present in constants.ts TOOLS array. Delete or comment it out.",
)

# Task 5: Reviewed-by attribution in HomePage
home = read(HOMEPAGE)
check(
    "T5   HomePage.tsx — 'By Navneet Arya' attribution in ToolCard",
    "By Navneet Arya" in home,
    "Attribution line 'By Navneet Arya · Verified [date]' not found in HomePage ToolCard.",
)


# =============================================================================
# WEEK 2 — Content Authority + Schema (Tasks 6–10)
# =============================================================================
section("WEEK 2 — Content Authority + Schema (Tasks 6–10)")

# Task 6a: Trending blog post file exists
check(
    "T6a  Trending article file created",
    file_exists(TRENDING_POST),
    f"File not found: {TRENDING_POST.name}",
)

# Task 6b: Trending post registered in blog/index.ts
blog_idx = read(BLOG_INDEX)
check(
    "T6b  blog/index.ts — trending post registered",
    "perplexity-pro-vs-chatgpt-plus-vs-claude-pro-freelancers-2026" in blog_idx,
    "New trending post slug not found in blog/index.ts BLOG_POSTS array.",
)

# Task 6c: Article has required sections
if file_exists(TRENDING_POST):
    post = read(TRENDING_POST)
    check(
        "T6c  Trending post — has Quick Verdict section",
        bool(re.search(r"quick.verdict|Quick Verdict", post, re.IGNORECASE)),
        "No 'Quick Verdict' section found in trending blog post.",
        severity="WARN",
    )
    check(
        "T6d  Trending post — has FAQs section",
        bool(re.search(r"faq|FAQ|frequently asked", post, re.IGNORECASE)),
        "No FAQ section found in trending blog post.",
        severity="WARN",
    )
    check(
        "T6e  Trending post — has internal link to /tools/perplexity",
        "/tools/perplexity" in post,
        "Internal link to /tools/perplexity not found in trending post.",
        severity="WARN",
    )
    check(
        "T6f  Trending post — no banned AI filler phrases",
        not bool(re.search(
            r"\b(in today'?s fast-?paced world|game.changer|leverage|robust(?:ly)?|in conclusion|to sum up)\b",
            post, re.IGNORECASE,
        )),
        "Banned AI filler phrase detected in blog post content.",
        severity="WARN",
    )
else:
    for label in ["T6c", "T6d", "T6e", "T6f"]:
        check(f"{label}  Trending post — (skipped, file missing)", False, severity="WARN")

# Task 7: LAST_MODIFIED map in prerender.mjs
prerender = read(PRERENDER)
check(
    "T7a  prerender.mjs — LAST_MODIFIED map defined",
    "LAST_MODIFIED" in prerender,
    "LAST_MODIFIED object not found in prerender.mjs. Dynamic sitemap dates not set.",
)
check(
    "T7b  prerender.mjs — sitemap uses LAST_MODIFIED lookup",
    bool(re.search(r"LAST_MODIFIED\[.*\]\s*\?\?", prerender)),
    "Sitemap generation does not use LAST_MODIFIED[slug] ?? TODAY pattern.",
)

# Task 8: Last reviewed badge in ToolPage
tool = read(TOOLPAGE)
check(
    "T8   ToolPage.tsx — 'Last reviewed' badge present",
    bool(re.search(r"Last reviewed", tool, re.IGNORECASE)),
    "'Last reviewed:' text not found in ToolPage.tsx hero section.",
)

# Task 9: Trustpilot review count on HomePage tool cards
check(
    "T9   HomePage.tsx — Trustpilot review count trust signal present",
    bool(re.search(r"trustpilot.*rating|trustpilot.*count|Trustpilot reviews", home, re.IGNORECASE)),
    "Trustpilot rating/count not found in HomePage ToolCard component.",
)

# Task 10: BlogPosting ItemList schema in prerender.mjs
check(
    "T10  prerender.mjs — ItemList schema for /blog/ page",
    bool(re.search(r"ItemList", prerender)),
    "No ItemList schema found in prerender.mjs for /blog/ page.",
)


# =============================================================================
# WEEK 3 — Homepage Trust Architecture (Tasks 11–15)
# =============================================================================
section("WEEK 3 — Homepage Trust Architecture (Tasks 11–15)")

# Task 11: Author credential bar in HomePage
check(
    "T11a HomePage.tsx — author credential bar present",
    bool(re.search(r"credential.bar|Author.*credential|Navneet Arya.*sticky|sticky.*Navneet", home, re.IGNORECASE))
    or "credential bar" in home.lower()
    or ("sticky" in home and "Navneet Arya" in home and "AI Automation" in home),
    "Sticky author credential bar not found in HomePage. Add a slim bar below <SharedNav>.",
)
check(
    "T11b HomePage.tsx — credential bar shows 'AI Automation Lead'",
    "AI Automation" in home,
    "Author title 'AI Automation Lead' not found in HomePage credential bar.",
    severity="WARN",
)

# Task 12: Compare link in SharedNav
nav = read(SHAREDNAV)
check(
    "T12  SharedNav.tsx — Compare navigation link present",
    bool(re.search(r"navigate.*['\"]\/compare['\"]|href.*['\"]\/compare['\"]|/compare", nav)),
    "Compare nav link not found in SharedNav.tsx. Add it between 'Blog' and the theme toggle.",
)

# Task 13a: CompareIndexPage.tsx exists
check(
    "T13a CompareIndexPage.tsx — file created",
    file_exists(COMPARE_IDX),
    f"CompareIndexPage.tsx not found at {COMPARE_IDX}",
)

# Task 13b: Route registered in App.tsx
check(
    "T13b App.tsx — /compare/ route registered",
    "CompareIndexPage" in app and "/compare" in app,
    "CompareIndexPage import or /compare/ route not found in App.tsx.",
)

# Task 13c: /compare/ added to prerender.mjs
check(
    "T13c prerender.mjs — /compare/ page in prerender list",
    bool(re.search(r"['\"]\/compare\/?['\"]|/compare/", prerender)),
    "/compare/ URL not found in prerender.mjs page list.",
    severity="WARN",
)

# Task 14a: updateLog type in types.ts
types_src = read(TYPES)
check(
    "T14a types.ts — updateLog type defined",
    "updateLog" in types_src,
    "updateLog field not found in types.ts Tool interface.",
)

# Task 14b: updateLog data on required tools
for slug in ["grammarly", "rytr", "writesonic", "perplexity", "taskade"]:
    block = get_const_tool_block(const, slug)
    has_log = bool(block and "updateLog" in block)
    check(
        f"T14b constants.ts — updateLog present for '{slug}'",
        has_log,
        f"Tool '{slug}' is missing updateLog field in constants.ts.",
    )

# Task 14c: updateLog rendered in ToolPage
check(
    "T14c ToolPage.tsx — Review Updates section renders updateLog",
    "updateLog" in tool and "Review Updates" in tool,
    "updateLog not rendered in ToolPage.tsx. Add the Review Updates timeline section.",
)

# Task 15: Font optimization in index.html
# Check that DM Sans/Syne don't load excessive weights globally
dm_sans_weights = re.findall(r"DM Sans.*?font-weight:\s*(\d+)", idx, re.DOTALL)
syne_weights    = re.findall(r"Syne.*?font-weight:\s*(\d+)", idx, re.DOTALL)
excessive_dm    = len(dm_sans_weights) > 2
excessive_syne  = len(syne_weights) > 3
check(
    "T15  index.html — DM Sans loads ≤2 weights globally (unused weights removed)",
    not excessive_dm,
    f"DM Sans still loads {len(dm_sans_weights)} weights globally: {dm_sans_weights}. Remove unused weights.",
    severity="WARN",
)
check(
    "T15b index.html — Syne loads ≤3 weights globally",
    not excessive_syne,
    f"Syne still loads {len(syne_weights)} weights globally: {syne_weights}. Remove unused weights.",
    severity="WARN",
)


# =============================================================================
# WEEK 4 — Authority + Ranking Push (Tasks 16–20)
# =============================================================================
section("WEEK 4 — Authority + Ranking Push (Tasks 16–20)")

# Task 16: SpeakableSpecification in prerender.mjs for top 5 tools
check(
    "T16a prerender.mjs — SpeakableSpecification schema present",
    "SpeakableSpecification" in prerender,
    "No SpeakableSpecification found in prerender.mjs schema generation.",
)
check(
    "T16b prerender.mjs — speakable cssSelector targets correct classes",
    bool(re.search(r"tool-whatIs|tool-verdict|tool-faqs", prerender)),
    "CSS selectors .tool-whatIs / .tool-verdict / .tool-faqs not found in prerender.mjs speakable schema.",
    severity="WARN",
)
check(
    "T16c ToolPage.tsx — tool-whatIs className applied",
    "tool-whatIs" in tool,
    "className='tool-whatIs' not found in ToolPage.tsx intro/description section.",
)
check(
    "T16d ToolPage.tsx — tool-verdict className applied",
    "tool-verdict" in tool,
    "className='tool-verdict' not found in ToolPage.tsx verdict/pros-cons section.",
)
check(
    "T16e ToolPage.tsx — tool-faqs className applied",
    "tool-faqs" in tool,
    "className='tool-faqs' not found in ToolPage.tsx FAQ section.",
)

# Task 17: realOutputExample for 4 additional tools
for slug in ["elevenlabs", "murf-ai", "jasper", "leonardo-ai"]:
    block = get_const_tool_block(const, slug)
    has_example = bool(block and "realOutputExample" in block)
    check(
        f"T17  constants.ts — realOutputExample present for '{slug}'",
        has_example,
        f"Tool '{slug}' is missing realOutputExample field.",
    )

# Task 18: llms.txt updated
llms = read(LLMS_TXT)
check(
    "T18a public/llms.txt — perplexity-ai-review-2026 listed",
    "perplexity-ai-review-2026" in llms,
    "perplexity-ai-review-2026 not found in llms.txt.",
    severity="WARN",
)
check(
    "T18b public/llms.txt — new trending post listed",
    "perplexity-pro-vs-chatgpt-plus-vs-claude-pro-freelancers-2026" in llms,
    "New trending blog post not found in llms.txt.",
    severity="WARN",
)
check(
    "T18c public/llms.txt — Editorial Standards section present",
    "Editorial Standards" in llms,
    "No '## Editorial Standards' section found in llms.txt.",
)

# Task 19: verify-prerender.mjs script exists and is registered in package.json
check(
    "T19a scripts/verify-prerender.mjs — file created",
    file_exists(VERIFY_SCRIPT),
    "scripts/verify-prerender.mjs not found. Create the post-build verification script.",
)
if file_exists(VERIFY_SCRIPT):
    vs = read(VERIFY_SCRIPT)
    check(
        "T19b verify-prerender.mjs — reads sitemap.xml",
        "sitemap.xml" in vs,
        "verify-prerender.mjs does not reference sitemap.xml.",
    )
    check(
        "T19c verify-prerender.mjs — exits with code 1 on missing files",
        "process.exit(1)" in vs,
        "verify-prerender.mjs does not call process.exit(1) on failures.",
    )
    check(
        "T19d verify-prerender.mjs — uses only built-in Node modules",
        not bool(re.search(r"require\(['\"](?!fs|path|url|crypto|os|http|https|child_process)", vs))
        and "import" in vs
        and not bool(re.search(r"from\s+['\"](?!node:|fs|path|url|crypto|os)[\w@]", vs.replace("from 'fs'", "").replace('from "fs"', "").replace("from 'path'", "").replace('from "path"', "").replace("from 'url'", "").replace('from "url"', ""))),
        "verify-prerender.mjs appears to import external (non-built-in) modules.",
        severity="WARN",
    )

pkg = read(PACKAGE_JSON)
check(
    "T19e package.json — verify-prerender script registered",
    "verify-prerender" in pkg,
    "'verify-prerender' not found in package.json scripts section.",
)

# Task 20: AboutPage upgraded
about = read(ABOUTPAGE)
check(
    "T20a AboutPage.tsx — AlternativeTo link present",
    "alternativeto.net" in about,
    "No alternativeto.net link found in AboutPage.tsx.",
)
check(
    "T20b AboutPage.tsx — Medium link present",
    "medium.com" in about,
    "No medium.com link found in AboutPage.tsx.",
)
check(
    "T20c AboutPage.tsx — 'since 2022' or years-of-research mention present",
    bool(re.search(r"since 2022|2022.*research|research.*2022", about, re.IGNORECASE)),
    "No 'since 2022' mention in AboutPage credentials line.",
    severity="WARN",
)
check(
    "T20d AboutPage.tsx — '25+ tools reviewed' or similar count present",
    bool(re.search(r"2[4-9]\+?\s*(?:AI\s*)?tools\s*reviewed|reviewed\s*2[4-9]\+?\s*tools", about, re.IGNORECASE)),
    "No '25+ tools reviewed' (or similar) count found in AboutPage.",
    severity="WARN",
)
# Safety check: ensure fake sites were removed
check(
    "T20e AboutPage.tsx — no fake 'Product Hunt / Hacker News' claims",
    not bool(re.search(r"Product Hunt|Hacker News|IndieHackers", about)),
    "AboutPage still claims 'Product Hunt' or 'Hacker News' mentions — remove these false claims.",
)


# =============================================================================
# SUMMARY
# =============================================================================
total    = len(results)
passed   = sum(1 for r in results if r["ok"])
failed   = [r for r in results if not r["ok"]]
critical = [r for r in failed if r["severity"] == "CRITICAL"]
warnings = [r for r in failed if r["severity"] != "CRITICAL"]

print(f"\n{BOLD}{CYAN}{'═' * 72}{RESET}")
print(f"{BOLD}  SUMMARY{RESET}")
print(f"{BOLD}{CYAN}{'═' * 72}{RESET}")
print(f"  Total checks : {total}")
print(f"  {GREEN}Passed       : {passed}{RESET}")
print(f"  {RED}Critical fail: {len(critical)}{RESET}")
print(f"  {YELLOW}Warnings     : {len(warnings)}{RESET}")

if critical:
    print(f"\n{RED}{BOLD}  CRITICAL FAILURES:{RESET}")
    for r in critical:
        print(f"  {RED}✗  {r['label']}{RESET}")
        if r["detail"]:
            print(f"     {YELLOW}→ {r['detail']}{RESET}")

if warnings:
    print(f"\n{YELLOW}{BOLD}  WARNINGS:{RESET}")
    for r in warnings:
        print(f"  {YELLOW}⚠  {r['label']}{RESET}")
        if r["detail"]:
            print(f"     → {r['detail']}")

if not failed:
    print(f"\n{GREEN}{BOLD}  ✅ All {total} checks passed. Audit fixes fully validated.{RESET}")
elif not critical:
    print(f"\n{YELLOW}{BOLD}  ⚠  All critical checks passed. {len(warnings)} warning(s) to review.{RESET}")
else:
    print(f"\n{RED}{BOLD}  ❌ {len(critical)} critical fix(es) need attention before deploying.{RESET}")

sys.exit(0 if not critical else 1)
