"""
validate_geo_fixes.py
GEO Section 05 — Validation for G2, G4, G5 fixes
Python 3.12.4 | Windows compatible | No external dependencies

Usage (from your project root):
    python validate_geo_fixes.py
"""

import os
import re
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

# ── Colour output (works on Windows 10+ with ANSI support) ──────────────────
RESET  = "\033[0m"
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BLUE   = "\033[94m"
GRAY   = "\033[90m"

# Enable ANSI on Windows
if sys.platform == "win32":
    import ctypes
    kernel32 = ctypes.windll.kernel32
    kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)

pass_count  = 0
fail_count  = 0
warn_count  = 0

def head(msg: str):
    print(f"\n{CYAN}{msg}{RESET}")

def ok(msg: str):
    global pass_count
    pass_count += 1
    print(f"  {GREEN}[PASS]{RESET} {msg}")

def fail(msg: str):
    global fail_count
    fail_count += 1
    print(f"  {RED}[FAIL]{RESET} {msg}")

def warn(msg: str):
    global warn_count
    warn_count += 1
    print(f"  {YELLOW}[WARN]{RESET} {msg}")

def info(msg: str):
    print(f"  {GRAY}{msg}{RESET}")

# ── Helper ───────────────────────────────────────────────────────────────────

def read_file(path: str) -> str | None:
    try:
        return Path(path).read_text(encoding="utf-8")
    except FileNotFoundError:
        return None
    except Exception as e:
        fail(f"Could not read {path}: {e}")
        return None

def check(condition: bool, pass_msg: str, fail_msg: str):
    if condition:
        ok(pass_msg)
    else:
        fail(fail_msg)

# ════════════════════════════════════════════════════════════════════════════
# PRE-CHECK: project root
# ════════════════════════════════════════════════════════════════════════════
head("=" * 60)
head("  GEO Section 05 — Fix Validator  (G2 · G4 · G5)")
head("=" * 60)

head("PRE-CHECK: Project Root")

if not Path("package.json").exists():
    print(f"{RED}[ERROR] Run this script from your project root (where package.json lives).{RESET}")
    sys.exit(1)

ok("package.json found — correct directory")

# ════════════════════════════════════════════════════════════════════════════
# G2: llms-full.txt
# ════════════════════════════════════════════════════════════════════════════
head("G2: llms-full.txt")

LLMS_FULL_PATH = Path("public") / "llms-full.txt"
content_llms = read_file(str(LLMS_FULL_PATH))

if content_llms:
    ok(f"File exists: {LLMS_FULL_PATH}")

    size_kb = round(LLMS_FULL_PATH.stat().st_size / 1024, 1)
    if 5 < size_kb < 100:
        ok(f"File size {size_kb} KB — within 5–100 KB target")
    elif size_kb <= 5:
        fail(f"File too small ({size_kb} KB) — content may be missing")
    else:
        warn(f"File is {size_kb} KB — approaching 100 KB LLM context limit")

    checks_llms = [
        ("## TOOL REVIEW:",     "Contains TOOL REVIEW sections",         "Missing '## TOOL REVIEW:' markers"),
        ("Quick Verdict",       "Contains 'Quick Verdict' headings",      "Missing 'Quick Verdict' headings"),
        ("Who Should Use",      "Contains 'Who Should Use' headings",     "Missing 'Who Should Use' headings"),
        ("Who Should NOT Use",  "Contains 'Who Should NOT Use' headings", "Missing 'Who Should NOT Use' headings"),
        ("Pricing 2026",        "Contains 'Pricing 2026' headings",       "Missing 'Pricing 2026' headings"),
        ("Navneet Arya",        "Author attribution present",             "Missing author attribution"),
        ("ainexustools.online", "Site URL present",                       "Missing site URL"),
    ]
    for pattern, pass_msg, fail_msg in checks_llms:
        check(pattern in content_llms, pass_msg, fail_msg)

    has_blog = "BLOG POSTS" in content_llms or "GUIDES" in content_llms
    check(has_blog, "Contains blog/guides section", "Missing blog posts section")

    tool_count = len(re.findall(r"## TOOL REVIEW:", content_llms))
    if tool_count >= 5:
        ok(f"Contains {tool_count} tool reviews (minimum 5 required)")
    else:
        fail(f"Only {tool_count} tool review(s) found — add more content")

else:
    fail(f"MISSING: {LLMS_FULL_PATH} — run:  node scripts/generate-llms-full.mjs")

check(
    Path("scripts/generate-llms-full.mjs").exists(),
    "Generator script exists: scripts/generate-llms-full.mjs",
    "MISSING generator script: scripts/generate-llms-full.mjs"
)

pkg_raw = read_file("package.json") or ""
check("generate:llms"      in pkg_raw, "package.json has 'generate:llms' npm script",  "package.json missing 'generate:llms' script")
check("generate-llms-full" in pkg_raw, "Build pipeline includes llms-full generation", "Build script does not call generate-llms-full.mjs")

# ════════════════════════════════════════════════════════════════════════════
# G4: @graph Organization + Person schema in index.html
# ════════════════════════════════════════════════════════════════════════════
head("G4: @graph Organization + Person Schema in index.html")

html = read_file("index.html")

if html:
    ok("index.html found")

    checks_g4 = [
        ('"@graph"',                                           "@graph array present",                       "MISSING @graph — Organization and Person must be linked"),
        ('"@type": "Organization"',                            "Organization @type present",                 "Missing Organization @type"),
        ('"@id": "https://ainexustools.online/#organization"', "Organization @id correctly set",             "Missing/wrong Organization @id"),
        ('"foundingDate"',                                     "foundingDate present on Organization",       "MISSING foundingDate on Organization"),
        ('"founder"',                                          "founder property present",                   "MISSING founder property"),
        ('"@type": "Person"',                                  "Person @type present",                       "Missing Person @type"),
        ('"@id": "https://ainexustools.online/about#author"',  "Person @id correctly set",                   "Missing/wrong Person @id"),
        ('"knowsAbout"',                                       "knowsAbout present (entity context for AI)", "MISSING knowsAbout"),
        ('"jobTitle"',                                         "jobTitle present on Person",                 "MISSING jobTitle on Person schema"),
    ]
    for pattern, pass_msg, fail_msg in checks_g4:
        check(pattern in html, pass_msg, fail_msg)

    cross_linked = bool(re.search(r'"worksFor"[^}]*"@id"', html, re.DOTALL))
    if cross_linked:
        ok("Person.worksFor references Organization via @id (cross-link present)")
    else:
        warn("Person.worksFor may not reference Organization via @id — verify cross-linking")

    if "Schema: Person (EEAT author identity)" not in html:
        ok("Old disconnected Person-only schema comment removed")
    else:
        warn("Old schema comment still present — confirm it was replaced, not duplicated")

else:
    fail("MISSING index.html at project root")

# ════════════════════════════════════════════════════════════════════════════
# G5: Semantic <section> elements in ToolPage.tsx
# ════════════════════════════════════════════════════════════════════════════
head("G5: Semantic <section> Elements in pages/ToolPage.tsx")

TOOL_PAGE_PATH = os.path.join("pages", "ToolPage.tsx")
tsx = read_file(TOOL_PAGE_PATH)

if tsx:
    ok("ToolPage.tsx found")

    checks_g5 = [
        ("geoSection",                               "geoSection() helper function present",                "MISSING geoSection() helper"),
        ('aria-label="Quick Verdict"',               "Quick Verdict has aria-label='Quick Verdict'",        "MISSING aria-label='Quick Verdict' — still a plain <div>"),
        ("Is {tool.name} Worth It? — Quick Verdict", "Quick Verdict h2 uses 'Is [Tool] Worth It?' pattern", "Quick Verdict h2 missing correct text pattern"),
        ('aria-label="Who Should Use This"',         "aria-label='Who Should Use This' present",            "MISSING aria-label='Who Should Use This'"),
        ('aria-label="Who Should NOT Use This"',     "aria-label='Who Should NOT Use This' present",        "MISSING aria-label='Who Should NOT Use This'"),
        ("Who Should Use ${tool.name}",              "Who Should Use heading uses dynamic tool name",       "Who Should Use heading not using dynamic tool.name"),
        ('aria-label="Pricing"',                     "Pricing section has aria-label='Pricing'",            "MISSING aria-label='Pricing' on pricing section"),
        ("{tool.name} Pricing 2026",                 "Pricing h2 uses '[Tool] Pricing 2026' pattern",       "Pricing h2 missing '[Tool] Pricing 2026' pattern"),
    ]
    for pattern, pass_msg, fail_msg in checks_g5:
        check(pattern in tsx, pass_msg, fail_msg)

    if ">Quick verdict</div>" not in tsx:
        ok("Old plain <div>Quick verdict</div> label removed")
    else:
        fail("Old plain <div>Quick verdict</div> still present — verdict block not fully updated")

    aria_count = tsx.count('aria-label=')
    ok(f"Total aria-label attributes in file: {aria_count} (expected >= 4)")

else:
    fail(f"MISSING {TOOL_PAGE_PATH} — check file path")

# ════════════════════════════════════════════════════════════════════════════
# SANITY: G1 + G3 (already fixed — quick check)
# ════════════════════════════════════════════════════════════════════════════
head("SANITY: G1 + G3 (previously confirmed fixed)")

llms_txt = read_file(os.path.join("public", "llms.txt"))
check(llms_txt is not None and len(llms_txt) > 500,
      "G1: public/llms.txt exists and has content",
      "G1: public/llms.txt MISSING or empty")

robots_txt = read_file(os.path.join("public", "robots.txt"))
if robots_txt:
    ok("G3: public/robots.txt exists")
    for bot in ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]:
        check(bot in robots_txt,
              f"G3: {bot} directive present",
              f"G3: MISSING {bot} in robots.txt")
else:
    fail("G3: public/robots.txt MISSING")

# ════════════════════════════════════════════════════════════════════════════
# BONUS: Live URL checks (post-deploy)
# ════════════════════════════════════════════════════════════════════════════
head("BONUS: Live URL Checks (post-deploy only)")
info("These pass only AFTER you push and GitHub Pages rebuilds (~2 min)")

BASE_URL  = "https://ainexustools.online"
live_urls = [
    f"{BASE_URL}/llms.txt",
    f"{BASE_URL}/llms-full.txt",
    f"{BASE_URL}/robots.txt",
]

for url in live_urls:
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=8) as resp:
            ok(f"Live {url} → HTTP {resp.status}")
    except urllib.error.HTTPError as e:
        warn(f"Live {url} → HTTP {e.code}")
    except Exception:
        info(f"Skipped (not deployed yet or no internet): {url}")

print()
info("Google Rich Results Test (open after deploy):")
print(f"  {BLUE}https://search.google.com/test/rich-results?url=https://ainexustools.online{RESET}")

# ════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════════════════
head("=" * 60)
head("  SUMMARY")
head("=" * 60)

total = pass_count + fail_count + warn_count
print()

if fail_count == 0:
    print(f"  {GREEN}ALL CHECKS PASSED  ✓  {pass_count} passed · {warn_count} warnings{RESET}")
    print()
    print(f"  {GREEN}Next step — commit and push:{RESET}")
    print(f'  git add .')
    print(f'  git commit -m "fix: GEO G2+G4+G5 — llms-full.txt, @graph schema, semantic sections"')
    print(f'  git push')
else:
    print(f"  {RED}{fail_count} FAILED{RESET}  ·  {GREEN}{pass_count} passed{RESET}  ·  {YELLOW}{warn_count} warnings{RESET}  (of {total} checks)")
    print()
    print(f"  {YELLOW}Fix the [FAIL] items above then re-run:{RESET}")
    print(f"  python validate_geo_fixes.py")

print()
sys.exit(1 if fail_count > 0 else 0)
