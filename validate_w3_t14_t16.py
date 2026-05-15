"""
AI Nexus — Week 3 Task 14 & Task 16 Validation Script
======================================================
Run from the root of your cloned repo:
    python validate_w3_t14_t16.py

Exit code 0 = all checks passed.
Exit code 1 = one or more checks failed (details printed).
"""

import re
import sys
import os

# ── File paths (relative to repo root) ────────────────────────────────────────
TOOLPAGE      = os.path.join("pages", "ToolPage.tsx")
BLOGPOSTPAGE  = os.path.join("pages", "BlogPostPage.tsx")
PRERENDER     = os.path.join("scripts", "prerender.mjs")

# ── Helpers ───────────────────────────────────────────────────────────────────
PASS  = "\033[92m  ✓\033[0m"
FAIL  = "\033[91m  ✗\033[0m"
HEAD  = "\033[1;94m{}\033[0m"

failures = []

def check(label: str, condition: bool, fix_hint: str = ""):
    if condition:
        print(f"{PASS}  {label}")
    else:
        msg = f"{label}" + (f"\n       → {fix_hint}" if fix_hint else "")
        print(f"{FAIL}  {msg}")
        failures.append(label)

def section(title: str):
    print(f"\n{HEAD.format(title)}")
    print("─" * 55)

def read(path: str) -> str:
    if not os.path.exists(path):
        print(f"\033[91mERROR: File not found — {path}\033[0m")
        sys.exit(1)
    with open(path, encoding="utf-8") as f:
        return f.read()

def tool_slice(content: str, start_key: str, end_key: str) -> str:
    """Return the content of a TOOL_CONTENT entry between start_key and end_key."""
    start = content.find(start_key)
    end   = content.find(end_key, start) if end_key else len(content)
    if start == -1:
        return ""
    return content[start:end]


# ── Load files ────────────────────────────────────────────────────────────────
print("\n" + "=" * 55)
print("  AI Nexus — Week 3 T14 & T16 Validation")
print("=" * 55)

toolpage     = read(TOOLPAGE)
blogpostpage = read(BLOGPOSTPAGE)
prerender    = read(PRERENDER)


# ══════════════════════════════════════════════════════════════════════════════
# TASK 14 — TOOL_CONTENT EXPANSION (ToolPage.tsx)
# ══════════════════════════════════════════════════════════════════════════════

TOOL_CONTENT_TOOLS = [
    # (start_key,             end_key,         display_name)
    ("'photoroom': {",        "  'opus-clip': {", "photoroom"),
    ("'opus-clip': {",        "  looka:",          "opus-clip"),
    ("'beautiful-ai': {",     "  ocoya:",           "beautiful-ai"),
]

REQUIRED_FIELDS = [
    "whatIs", "whoIsItFor", "whoShouldSkip",
    "myTake", "useCases", "pricingSection",
    "faqs:", "verdict:",
]

for start_key, end_key, name in TOOL_CONTENT_TOOLS:
    section(f"T14 · TOOL_CONTENT · {name}")
    snippet = tool_slice(toolpage, start_key, end_key)

    check(
        f"Entry found in TOOL_CONTENT",
        bool(snippet),
        f"Add '{name}' key to TOOL_CONTENT in ToolPage.tsx"
    )

    for field in REQUIRED_FIELDS:
        check(
            f"Field present: {field}",
            field in snippet,
            f"Add '{field}' to TOOL_CONTENT['{name}']"
        )

    faq_count = snippet.count("{ q:")
    check(
        f"At least 3 FAQ entries (found {faq_count})",
        faq_count >= 3,
        f"Add more {{ q: '...', a: '...' }} entries to TOOL_CONTENT['{name}'].faqs"
    )

    # Extract the actual pricingSection string value and measure its length
    pricing_value_len = 0
    pi = snippet.find("pricingSection:")
    if pi >= 0:
        # Find the opening quote and closing quote of the value
        q_start = snippet.find('"', pi)
        if q_start == -1:
            q_start = snippet.find("'", pi)
        if q_start >= 0:
            # Walk to the closing quote, skipping escaped quotes
            q_char = snippet[q_start]
            pos = q_start + 1
            while pos < len(snippet):
                if snippet[pos] == '\\':
                    pos += 2
                    continue
                if snippet[pos] == q_char:
                    pricing_value_len = pos - q_start
                    break
                pos += 1
    check(
        f"pricingSection has meaningful content (>150 chars)",
        pricing_value_len > 150,
        f"Expand pricingSection in TOOL_CONTENT['{name}'] — current length: {pricing_value_len}"
    )

    my_take_start = snippet.find("myTake:")
    my_take_len   = len(snippet[my_take_start:my_take_start+2000]) if my_take_start >= 0 else 0
    check(
        f"myTake is substantive (>300 chars)",
        my_take_start >= 0 and my_take_len > 300,
        f"Expand myTake in TOOL_CONTENT['{name}'] with specific test findings"
    )


# ══════════════════════════════════════════════════════════════════════════════
# TASK 14 — reviewBody in prerender.mjs
# ══════════════════════════════════════════════════════════════════════════════

section("T14 · prerender.mjs · reviewBody")

PRERENDER_TOOLS = ["photoroom", "opus-clip", "beautiful-ai"]

for slug in PRERENDER_TOOLS:
    idx     = prerender.find(f"slug: '{slug}'")
    snippet = prerender[idx:idx + 1500] if idx >= 0 else ""
    has_rb  = "reviewBody" in snippet

    check(
        f"{slug}: reviewBody present",
        has_rb,
        f"Add reviewBody field to the '{slug}' entry in prerender.mjs"
    )

    if has_rb:
        rb_start = snippet.find("reviewBody")
        rb_text  = snippet[rb_start:rb_start + 800]
        check(
            f"{slug}: reviewBody has >200 chars",
            len(rb_text) > 200,
            f"reviewBody for '{slug}' is too short — expand it for Review schema"
        )


# ══════════════════════════════════════════════════════════════════════════════
# TASK 16 — vsVerdict entries (ToolPage.tsx)
# ══════════════════════════════════════════════════════════════════════════════

section("T16 · vsVerdict entries · ToolPage.tsx")

VS_VERDICT_TOOLS = [
    # (tool_key,       expected_compareSlug,        display_name)
    ("  grammarly: {", "grammarly-vs-quillbot",      "grammarly"),
    ("  rytr: {",      "rytr-vs-writesonic",          "rytr"),
    ("  podcastle: {", "podcastle-vs-descript",       "podcastle"),
    ("  taskade: {",   "taskade-vs-notion",           "taskade"),
]

for tool_key, expected_slug, name in VS_VERDICT_TOOLS:
    idx     = toolpage.find(tool_key)
    snippet = toolpage[idx:idx + 14000] if idx >= 0 else ""

    check(
        f"{name}: vsVerdict block present",
        "vsVerdict:" in snippet,
        f"Add vsVerdict to TOOL_CONTENT['{name}'] in ToolPage.tsx"
    )
    check(
        f"{name}: compareSlug = '{expected_slug}'",
        f'compareSlug: "{expected_slug}"' in snippet,
        f"Set compareSlug to '{expected_slug}' in TOOL_CONTENT['{name}'].vsVerdict"
    )
    check(
        f"{name}: vsVerdict summary is substantive (>100 chars)",
        bool(re.search(r'summary:\s*"(.{100,})"', snippet, re.DOTALL)),
        f"Expand the summary field in TOOL_CONTENT['{name}'].vsVerdict"
    )


# ── vsVerdict rendering bug ────────────────────────────────────────────────────
section("T16 · vsVerdict render · hardcoded name bug")

check(
    "No hardcoded 'Rytr vs' in vsVerdict render block",
    "Rytr vs ${vs.tool}" not in toolpage and "Rytr vs ${" not in toolpage,
    "Replace hardcoded 'Rytr' with `${tool.name}` in the vsVerdict section render"
)
check(
    "Dynamic tool.name used in vsVerdict title",
    "${tool.name} vs ${vs.tool}" in toolpage or "tool.name} vs" in toolpage,
    "Use `${tool.name} vs ${vs.tool}` in sectionTitle() inside vsVerdict render"
)
check(
    "Dynamic tool.name used in vsVerdict link label",
    "tool.name} vs {vs.tool}" in toolpage or "{tool.name} vs {vs" in toolpage,
    "Replace hardcoded 'Rytr' in the 'Read the full ... breakdown' span"
)

# ── compareSlug articles actually exist ───────────────────────────────────────
section("T16 · vsVerdict compare slugs exist in compare-data.ts")

COMPARE_DATA_PATH = os.path.join("pages", "compare-data.ts")
if os.path.exists(COMPARE_DATA_PATH):
    with open(COMPARE_DATA_PATH, encoding="utf-8") as f:
        compare_data = f.read()

    EXPECTED_SLUGS = [
        "grammarly-vs-quillbot",
        "rytr-vs-writesonic",
        "podcastle-vs-descript",
        "taskade-vs-notion",
        "gamma-vs-beautiful-ai",
    ]
    for slug in EXPECTED_SLUGS:
        check(
            f"Compare article exists: {slug}",
            f"slug: '{slug}'" in compare_data,
            f"Add compare article for '{slug}' in pages/compare-data.ts"
        )
else:
    print(f"  ⚠  compare-data.ts not found at '{COMPARE_DATA_PATH}' — skipping slug checks")


# ══════════════════════════════════════════════════════════════════════════════
# TASK 16 — Related Reviews in BlogPostPage.tsx
# ══════════════════════════════════════════════════════════════════════════════

section("T16 · Related Reviews · BlogPostPage.tsx")

check(
    "BLOG_RELATED_TOOLS map defined",
    "BLOG_RELATED_TOOLS" in blogpostpage,
    "Add `const BLOG_RELATED_TOOLS: Record<string, string[]> = { ... }` near the top of BlogPostPage.tsx"
)
check(
    "Map has at least 10 blog slug entries",
    blogpostpage.count("'best-") + blogpostpage.count("'how-to-") + blogpostpage.count("'ai-tools-") >= 5,
    "Populate BLOG_RELATED_TOOLS with blog slugs → tool slug arrays"
)
check(
    "Related Reviews section heading present",
    "Related Reviews" in blogpostpage,
    "Add <h2>Related Reviews</h2> section in the BlogPostPage render"
)
check(
    "Section navigates to /tools/ routes",
    "/tools/" in blogpostpage,
    "Each related tool card should call navigate(`/tools/${t.slug}`)"
)
check(
    "Tool cards use TOOLS array for data",
    "TOOLS.find" in blogpostpage,
    "Use TOOLS.find(t => t.slug === slug) to resolve tool card data"
)
check(
    "Section renders only when related tools exist",
    "relatedTools.length === 0" in blogpostpage or "relatedSlugs.length" in blogpostpage,
    "Guard the Related Reviews section: if no tools mapped, return null"
)


# ══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════════════════════════

total   = len(failures) + sum(1 for line in open(__file__, encoding="utf-8") if line.strip().startswith("check("))
passed  = total - len(failures)

print("\n" + "=" * 55)
if not failures:
    print(f"\033[92m  ALL CHECKS PASSED — Tasks 14 & 16 fully validated ✓\033[0m")
else:
    print(f"\033[91m  {len(failures)} CHECK(S) FAILED:\033[0m")
    for f in failures:
        print(f"    • {f}")
print("=" * 55 + "\n")

sys.exit(0 if not failures else 1)
