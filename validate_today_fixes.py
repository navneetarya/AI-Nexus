#!/usr/bin/env python3
"""
AI Nexus — Today's Fix Validator (May 21 2026)
===============================================
Validates every fix applied in today's session:
  W1-T5 : "How We Review" callout on all tool pages  (pages/ToolPage.tsx)
  W2-T1 : handsOnTesting added to 8 thin tool pages  (pages/ToolPage.tsx)
  W2-T2 : handsOnTesting on affiliate pages already done (rytr/podcastle/ocoya)
  W2-T3 : pricingSection + faqs added to leonardo-ai, replit, taskade
  W2-T4 : lastTestedISO added to all 11 tools that were missing it
  W2-T5 : Semantic <time dateTime> in hero "Last Tested" badge

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

ROOT       = pathlib.Path(__file__).parent.resolve()
TOOLPAGE   = ROOT / "pages" / "ToolPage.tsx"

# ── ANSI colours ─────────────────────────────────────────────────────────────
RED    = "\033[91m"
GREEN  = "\033[92m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

results: list[dict[str, Any]] = []

def check(label: str, ok: bool, detail: str = "", severity: str = "CRITICAL") -> bool:
    icon   = f"{GREEN}✓{RESET}" if ok else (f"{RED}✗{RESET}" if severity == "CRITICAL" else f"{YELLOW}⚠{RESET}")
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
    """
    escaped = re.escape(slug)
    # Match '  slug: {' or "  'slug': {" preceded by a newline
    pattern = rf"\n  (?:'{escaped}'|{escaped}):\s*\{{"
    m = re.search(pattern, src)
    if not m:
        return None
    start = m.start()
    # Find where the next top-level TOOL_CONTENT key starts
    next_key = re.search(r"\n  (?:'[\w-]+'|[a-z][a-zA-Z-]*):\s*\{", src[start + 1:])
    if next_key:
        end = start + 1 + next_key.start()
    else:
        # Fall back to the closing of TOOL_CONTENT
        end = src.find("\n};\n", start)
        end = end if end != -1 else start + 12000
    return src[start:end]


# ── Load source file ──────────────────────────────────────────────────────────
if not TOOLPAGE.exists():
    print(f"{RED}ERROR: {TOOLPAGE} not found — run from project root.{RESET}")
    sys.exit(1)

src = TOOLPAGE.read_text(encoding="utf-8")


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
    print(f"\n  {GREEN}{BOLD}All Week 1 Task 5 + Week 2 fixes verified successfully.{RESET}")
elif failed == 0:
    print(f"\n  {YELLOW}No critical failures. Review warnings above.{RESET}")
else:
    print(f"\n  {RED}Fix critical failures before deploying.{RESET}")

print()
sys.exit(0 if failed == 0 else 1)
