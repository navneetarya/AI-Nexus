#!/usr/bin/env python3
"""
AI Nexus — Week 3 Fix Validator
Python 3.12.4 | Run from the repo root: python validate_week3_fixes.py

Validates all 4 priority tasks:
  P1 — Task 16: Grammarly + Rytr EEAT depth in constants.ts
  P2 — Task 14: Meta description CTR hooks (no "personally tested")
  P3 — Task 13: Internal compare links in blog posts
  P4 — W1 leftover: index.html title + H1 "tested" removal

Exit code 0 = all checks passed. Exit code 1 = failures found.
"""

import sys
import re
from pathlib import Path

# ── Config ─────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent

BLOG_DIR      = ROOT / "blog"
CONSTANTS     = ROOT / "constants.ts"
PRERENDER     = ROOT / "scripts" / "prerender.mjs"
INDEX_HTML    = ROOT / "index.html"
LLMS_TXT      = ROOT / "public" / "llms.txt"

PASS = "\033[92m✅ PASS\033[0m"
FAIL = "\033[91m❌ FAIL\033[0m"
INFO = "\033[94mℹ️ \033[0m"

results: list[tuple[str, bool, str]] = []

def check(label: str, passed: bool, detail: str = "") -> None:
    results.append((label, passed, detail))
    icon = PASS if passed else FAIL
    print(f"  {icon}  {label}")
    if not passed and detail:
        for line in detail.strip().split("\n"):
            print(f"       {line}")

def read(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")

def section(title: str) -> None:
    print(f"\n{'─'*60}")
    print(f"  {title}")
    print(f"{'─'*60}")

# ══════════════════════════════════════════════════════════════════
# PRIORITY 1 — Task 16: Grammarly + Rytr EEAT depth in constants.ts
# ══════════════════════════════════════════════════════════════════
section("P1 · Task 16 — Grammarly + Rytr EEAT depth (constants.ts)")

ct = read(CONSTANTS)

# P1-A: Grammarly must have pricingBreakdown
check(
    "Grammarly has pricingBreakdown array",
    bool(re.search(r"slug:\s*'grammarly'.*?pricingBreakdown", ct, re.DOTALL)),
    "pricingBreakdown not found after grammarly slug in constants.ts",
)

# P1-B: Grammarly must have setupSteps
check(
    "Grammarly has setupSteps array",
    bool(re.search(r"slug:\s*'grammarly'.*?setupSteps", ct, re.DOTALL)),
    "setupSteps not found after grammarly slug",
)

# P1-C: Grammarly must have realOutputExample
check(
    "Grammarly has realOutputExample with editorialNote",
    bool(re.search(r"slug:\s*'grammarly'.*?editorialNote", ct, re.DOTALL)),
    "editorialNote not found in Grammarly block",
)

# P1-D: Grammarly must have dailyUseCases (min 3 items)
match = re.search(r"slug:\s*'grammarly'.*?dailyUseCases\s*:\s*\[(.*?)\]", ct, re.DOTALL)
daily_count = len(re.findall(r"'[^']{40,}", match.group(1))) if match else 0
check(
    f"Grammarly dailyUseCases has ≥3 items (found {daily_count})",
    daily_count >= 3,
    "dailyUseCases missing or has fewer than 3 entries",
)

# P1-E: Grammarly must have notForYou
check(
    "Grammarly has notForYou field",
    bool(re.search(r"slug:\s*'grammarly'.*?notForYou", ct, re.DOTALL)),
    "notForYou field not found in Grammarly block",
)

# P1-F: Grammarly lastTestedISO must be 2026
match = re.search(r"slug:\s*'grammarly'.*?lastTestedISO\s*:\s*'([\d\-]+)'", ct, re.DOTALL)
iso = match.group(1) if match else "NOT FOUND"
check(
    f"Grammarly lastTestedISO is 2026-xx-xx (found: {iso})",
    iso.startswith("2026"),
    f"Expected 2026-xx-xx, got '{iso}'",
)

# P1-G: Rytr must have reviewBody in prerender.mjs
pr = read(PRERENDER)
match_rytr = re.search(r"slug:\s*'rytr'.*?reviewBody\s*:", pr, re.DOTALL)
check(
    "Rytr has reviewBody in prerender.mjs TOOLS array",
    bool(match_rytr),
    "reviewBody not found after rytr slug in prerender.mjs",
)

# P1-H: Rytr reviewBody must be substantial (>200 chars)
rytr_body_match = re.search(r"slug:\s*'rytr'.*?reviewBody\s*:\s*'([^']{200,})", pr, re.DOTALL)
check(
    "Rytr reviewBody is ≥200 characters",
    bool(rytr_body_match),
    "Rytr reviewBody is too short or not found",
)

# P1-I: Grammarly metaDescription must be a CTR hook (contains question or number)
g_meta = re.search(r"slug:\s*'grammarly'.*?metaDescription\s*:\s*'([^']+)'", pr, re.DOTALL)
g_meta_text = g_meta.group(1) if g_meta else ""
has_hook = bool(re.search(r'\?|£|\$|\d+|vs\.|wins|honest', g_meta_text, re.IGNORECASE))
check(
    f"Grammarly meta in prerender.mjs has CTR hook",
    bool(g_meta_text) and has_hook,
    f"Meta found: '{g_meta_text[:80]}...'" if g_meta_text else "metaDescription not found",
)

# P1-J: SITE_CONFIG bio in constants.ts must not say "test every AI tool personally"
check(
    "SITE_CONFIG.bio does not say 'test every AI tool personally'",
    "test every AI tool personally" not in ct,
    "Still contains 'test every AI tool personally' in SITE_CONFIG.bio",
)

# P1-K: authorBio must say "researching" not "testing"
author_bio_match = re.search(r"authorBio\s*:\s*\"([^\"]+)\"", ct)
author_bio = author_bio_match.group(1) if author_bio_match else ""
check(
    "SITE_CONFIG.authorBio uses 'researching' not 'testing'",
    "research" in author_bio.lower() and "testing" not in author_bio.lower(),
    f"authorBio: '{author_bio[:100]}'",
)

# ══════════════════════════════════════════════════════════════════
# PRIORITY 2 — Task 14: Meta descriptions (no "personally tested")
# ══════════════════════════════════════════════════════════════════
section("P2 · Task 14 — Meta description CTR hooks + EEAT language")

FORBIDDEN = [
    "personally tested",
    "I tested",
    "I've tested",
    "I test AI",
    "Personally Tested",
    "I manage social",
]

# Check all blog .ts files
blog_files = sorted(BLOG_DIR.glob("*.ts"))
violations: dict[str, list[str]] = {}

for bf in blog_files:
    content = bf.read_text(encoding="utf-8")
    hits = []
    for term in FORBIDDEN:
        if term.lower() in content.lower():
            # find the actual line
            for i, line in enumerate(content.split("\n"), 1):
                if term.lower() in line.lower():
                    hits.append(f"L{i}: {line.strip()[:100]}")
    if hits:
        violations[bf.name] = hits

check(
    f"No 'personally tested / I tested' in any blog .ts file ({len(blog_files)} files checked)",
    len(violations) == 0,
    "\n".join(f"  {fn}: {hits[0]}" for fn, hits in violations.items()),
)

# Check prerender.mjs meta descriptions
pr_lines = pr.split("\n")
pr_violations = []
META_KEYS = {"metaDescription", "title", "description", "excerpt"}
for i, line in enumerate(pr_lines, 1):
    for term in FORBIDDEN:
        if term.lower() in line.lower():
            # Check if this line is a meta/title/description/excerpt field
            if any(key in line for key in META_KEYS):
                pr_violations.append(f"L{i}: {line.strip()[:100]}")
            break

check(
    "No 'personally tested / I tested' in prerender.mjs meta/title/description lines",
    len(pr_violations) == 0,
    "\n".join(pr_violations[:5]),
)

# Check llms.txt
llms = read(LLMS_TXT)
llms_violations = [
    f"  {line.strip()[:120]}"
    for line in llms.split("\n")
    for term in FORBIDDEN
    if term.lower() in line.lower()
]
check(
    "No 'personally tested / I tested' in llms.txt",
    len(llms_violations) == 0,
    "\n".join(llms_violations),
)

# Check dateModified is 2026-05-10 on at least 5 blog files (freshness signal)
fresh_count = sum(
    1 for bf in blog_files
    if "2026-05-10" in bf.read_text(encoding="utf-8")
)
check(
    f"At least 5 blog files have dateModified 2026-05-10 (found {fresh_count})",
    fresh_count >= 5,
    "Update dateModified to 2026-05-10 on more blog files for freshness",
)

# ══════════════════════════════════════════════════════════════════
# PRIORITY 3 — Task 13: Internal compare links in blog posts
# ══════════════════════════════════════════════════════════════════
section("P3 · Task 13 — Internal compare links (blog → compare pages)")

REQUIRED_LINKS = {
    "best-grammarly-alternatives.ts": [
        "compare/grammarly-vs-quillbot",
        "compare/grammarly-vs-writesonic",
        "compare/grammarly-vs-prowritingaid",
    ],
    "best-ai-tools-for-freelancers-2026.ts": [
        "compare/rytr-vs-writesonic",
        "compare/taskade-vs-notion",
    ],
    "best-ai-writing-tools-for-beginners-2026.ts": [
        "compare/grammarly-vs-quillbot",
    ],
}

for filename, expected_links in REQUIRED_LINKS.items():
    bf = BLOG_DIR / filename
    content = bf.read_text(encoding="utf-8") if bf.exists() else ""
    for link in expected_links:
        found = link in content
        check(
            f"{filename.replace('best-ai-tools-for-','').replace('-2026.ts','').replace('.ts','')[:20]} → /{link}",
            found,
            f"Missing internal link href=\"/{link}\" in {filename}",
        )

# Count total compare links across all blog files
total_compare_links = sum(
    len(re.findall(r'/compare/[\w-]+', bf.read_text(encoding="utf-8")))
    for bf in blog_files
    if bf.exists()
)
check(
    f"Total compare links across all blog posts ≥ 6 (found {total_compare_links})",
    total_compare_links >= 6,
    "Add more /compare/ internal links to blog posts",
)

# ══════════════════════════════════════════════════════════════════
# PRIORITY 4 — W1 leftover: index.html title + hero H1
# ══════════════════════════════════════════════════════════════════
section("P4 · W1 Leftover — index.html title tag + hero H1 + OG tags")

html = read(INDEX_HTML)

# P4-A: <title> must not say "Personally Tested"
title_match = re.search(r"<title>([^<]+)</title>", html)
title_text = title_match.group(1) if title_match else ""
check(
    "<title> does not contain 'Personally Tested'",
    "Personally Tested" not in title_text and "personally tested" not in title_text,
    f"Current title: '{title_text}'",
)

# P4-B: <title> must contain positive EEAT signal
has_eeat_signal = any(
    kw in title_text
    for kw in ["Researched", "Reviewed", "Ranked", "Independent", "Honest"]
)
check(
    f"<title> contains EEAT signal word (found: '{title_text[:60]}')",
    has_eeat_signal,
    "Add 'Researched', 'Reviewed', or 'Ranked' to the <title>",
)

# P4-C: Hero H1 must not say "I Test" or "30+ Days"
h1_match = re.search(r"<h1[^>]*>([^<]+(?:<[^/][^>]*>[^<]*</[^>]+>)?[^<]*)</h1>", html, re.DOTALL)
h1_text = re.sub(r"<[^>]+>", "", h1_match.group(0)) if h1_match else ""
check(
    "Hero H1 does not say 'I Test' or '30+ Days'",
    "I Test" not in h1_text and "30+ Days" not in h1_text and "30+ days" not in h1_text,
    f"H1 content: '{h1_text[:120]}'",
)

# P4-D: OG title must not say "Personally Tested"
og_title_match = re.search(r'property="og:title"\s+content="([^"]+)"', html)
og_title = og_title_match.group(1) if og_title_match else ""
check(
    "og:title does not say 'Personally Tested'",
    "Personally Tested" not in og_title,
    f"og:title: '{og_title}'",
)

# P4-E: Twitter title must not say "Personally Tested"
tw_title_match = re.search(r'name="twitter:title"\s+content="([^"]+)"', html)
tw_title = tw_title_match.group(1) if tw_title_match else ""
check(
    "twitter:title does not say 'Personally Tested'",
    "Personally Tested" not in tw_title,
    f"twitter:title: '{tw_title}'",
)

# P4-F: constants.ts must not say "test every AI tool personally"
check(
    "constants.ts has no 'test every AI tool personally'",
    "test every AI tool personally" not in ct,
    "Still found in SITE_CONFIG.bio",
)

# P4-G: prerender.mjs RSS title must say "Independently Researched" not "Personally Tested"
rss_title_match = re.search(r"<title>AI Nexus[^<]+</title>", pr)
rss_title = rss_title_match.group(0) if rss_title_match else ""
check(
    "RSS <title> says 'Independently Researched' not 'Personally Tested'",
    "Personally Tested" not in rss_title and "Independently" in rss_title,
    f"RSS title: '{rss_title}'",
)

# P4-H: ItemList schema name must not say "Personally Tested"
itemlist_match = re.search(r"name:\s*'Best AI Tools 2026[^']*'", pr)
itemlist_name = itemlist_match.group(0) if itemlist_match else ""
check(
    "ItemList schema name does not say 'Personally Tested'",
    "Personally Tested" not in itemlist_name,
    f"Found: '{itemlist_name}'",
)

# ══════════════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════════════
print(f"\n{'═'*60}")
passed = sum(1 for _, ok, _ in results if ok)
failed = sum(1 for _, ok, _ in results if not ok)
total = len(results)

print(f"  RESULT: {passed}/{total} checks passed")

if failed == 0:
    print(f"\n  \033[92m🎉 ALL {total} CHECKS PASSED — Safe to deploy.\033[0m")
else:
    print(f"\n  \033[91m⚠️  {failed} CHECK(S) FAILED — Fix before deploying.\033[0m")
    print("\n  Failed checks:")
    for label, ok, detail in results:
        if not ok:
            print(f"    ❌  {label}")

print(f"{'═'*60}\n")
sys.exit(0 if failed == 0 else 1)
