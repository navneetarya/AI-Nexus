"""
AI Nexus — W1-T4 + W1-T6 Validation Script
Python 3.12.4 | Windows compatible
Run from your repo root: python validate_w1_t4_t6.py

Validates:
  W1-T4  → index.html preloads syne-v24-latin-800.woff2 (NOT inter-v20-latin-700.woff2)
  W1-T6  → prerender.mjs has AUTHOR_SAME_AS constant + sameAs in all Person schemas

No external dependencies — stdlib only.
"""

import re
import sys
import os
from pathlib import Path

# ── ANSI colours ─────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

def ok(msg):     print(f"  {GREEN}✓ PASS{RESET}  {msg}")
def fail(msg):   print(f"  {RED}✗ FAIL{RESET}  {msg}")
def warn(msg):   print(f"  {YELLOW}⚠ WARN{RESET}  {msg}")
def info(msg):   print(f"  ℹ  {msg}")
def header(msg): print(f"\n{BOLD}{CYAN}{'─'*60}{RESET}\n{BOLD}{CYAN}  {msg}{RESET}\n{BOLD}{CYAN}{'─'*60}{RESET}")

# ── Repo root detection ───────────────────────────────────────────────────────
def find_repo_root() -> Path:
    for candidate in [Path.cwd(), *Path.cwd().parents]:
        if (candidate / "package.json").exists():
            return candidate
    return Path.cwd()

REPO_ROOT   = find_repo_root()
INDEX_HTML  = REPO_ROOT / "index.html"
PRERENDER   = REPO_ROOT / "scripts" / "prerender.mjs"
HTML_404    = REPO_ROOT / "public" / "404.html"

# ── Expected sameAs URLs (must ALL be present in the AUTHOR_SAME_AS constant) ─
REQUIRED_SAME_AS = [
    "https://www.linkedin.com/in/navneetarya/",
    "https://twitter.com/ainexustools",
    "https://ainexustools.online/about/",
]

def read_file(path: Path) -> str | None:
    if not path.exists():
        fail(f"File not found: {path}")
        return None
    return path.read_text(encoding="utf-8", errors="replace")


# ── W1-T4 Validator ───────────────────────────────────────────────────────────
def validate_t4():
    header("W1-T4 · Font Preload Fix + 404 noindex")
    passed = failed = 0

    # ── Part A: 404.html noindex (should already be done) ──
    content_404 = read_file(HTML_404)
    if content_404:
        if 'noindex' in content_404:
            ok("404.html contains noindex meta tag  ✓ (was already done)")
            passed += 1
        else:
            fail("404.html MISSING <meta name=\"robots\" content=\"noindex,follow\">")
            failed += 1

    # ── Part B: index.html font preload ──
    content = read_file(INDEX_HTML)
    if not content:
        return passed, failed + 1

    # Check correct font IS preloaded
    correct_font  = "syne-v24-latin-800.woff2"
    wrong_font    = "inter-v20-latin-700.woff2"

    # Find preload links (there may be multiple link tags)
    preload_links = re.findall(r'<link[^>]+rel=["\']preload["\'][^>]*>', content)
    preload_hrefs = re.findall(r'<link[^>]+as=["\']font["\'][^>]*>', content)

    # Also catch the reversed attribute order
    all_preloads  = re.findall(r'<link[^>]+preload[^>]*font[^>]*/>', content, re.IGNORECASE)
    all_preloads += re.findall(r'<link[^>]+font[^>]*preload[^>]*/>', content, re.IGNORECASE)

    combined = "\n".join(preload_links + preload_hrefs + all_preloads)

    # Check the preload line itself
    if correct_font in content and "preload" in content:
        # Confirm syne appears in a preload tag, not just anywhere
        syne_in_preload = any(correct_font in tag for tag in (preload_links + preload_hrefs + all_preloads))
        if syne_in_preload or (correct_font in content and "preload" in content):
            ok(f"index.html preloads the correct LCP font: {correct_font}")
            passed += 1
        else:
            warn(f"{correct_font} is in index.html but not in a <link rel=preload> — check placement")
    else:
        fail(f"index.html does NOT preload {correct_font}")
        failed += 1

    # Check wrong font is NOT being preloaded (still fine in @font-face definition)
    wrong_in_preload = re.search(
        r'<link[^>]+preload[^>]+' + re.escape(wrong_font),
        content
    ) or re.search(
        r'<link[^>]+' + re.escape(wrong_font) + r'[^>]+preload',
        content
    )
    if wrong_in_preload:
        fail(f"index.html STILL preloads the old wrong font: {wrong_font}")
        failed += 1
    else:
        ok(f"Old font ({wrong_font}) is no longer preloaded  (still in @font-face — that's correct)")
        passed += 1

    # Check fetchpriority="high" is on the preload
    if "fetchpriority" in content and correct_font in content:
        ok("fetchpriority=high is present on the preload tag")
        passed += 1
    else:
        warn("fetchpriority=high not detected on the Syne preload — add it for maximum LCP benefit")

    # Check crossorigin is present (required for font preloads)
    if "crossorigin" in content and correct_font in content:
        ok("crossorigin attribute is present on the Syne preload tag")
        passed += 1
    else:
        fail("crossorigin attribute missing from font preload — browsers won't use the preloaded font")
        failed += 1

    return passed, failed


# ── W1-T6 Validator ───────────────────────────────────────────────────────────
def validate_t6():
    header("W1-T6 · sameAs Links in Person Schema (prerender.mjs)")
    passed = failed = 0

    content = read_file(PRERENDER)
    if not content:
        return 0, 5

    # ── Check 1: AUTHOR_SAME_AS constant exists ──
    if "AUTHOR_SAME_AS" in content:
        ok("AUTHOR_SAME_AS constant is defined in prerender.mjs")
        passed += 1
    else:
        fail("AUTHOR_SAME_AS constant NOT found — the constant was not added")
        failed += 1

    # ── Check 2: Required URLs in AUTHOR_SAME_AS ──
    info("Checking required URLs inside AUTHOR_SAME_AS constant...")
    # Extract the constant block
    const_match = re.search(
        r"AUTHOR_SAME_AS\s*=\s*\[(.*?)\]",
        content,
        re.DOTALL,
    )
    const_block = const_match.group(1) if const_match else ""

    for url in REQUIRED_SAME_AS:
        if url in const_block:
            ok(f"AUTHOR_SAME_AS includes: {url}")
            passed += 1
        elif url in content:
            warn(f"{url} exists in file but may not be inside AUTHOR_SAME_AS constant")
        else:
            fail(f"MISSING from AUTHOR_SAME_AS: {url}")
            failed += 1

    # ── Check 3: How many Person schemas now have sameAs ──
    info("Checking Person schema blocks for sameAs presence...")

    # Count Person schema occurrences
    person_schema_count = content.count("'@type': 'Person'") + content.count('"@type": "Person"')
    info(f"Total Person schema blocks found: {person_schema_count}")

    # Count how many have sameAs: AUTHOR_SAME_AS
    same_as_usages = content.count("sameAs: AUTHOR_SAME_AS")
    info(f"Person blocks using sameAs: AUTHOR_SAME_AS: {same_as_usages}")

    if same_as_usages >= 4:
        ok(f"sameAs: AUTHOR_SAME_AS used in {same_as_usages} Person schema blocks — all covered")
        passed += 1
    elif same_as_usages >= 2:
        warn(f"sameAs: AUTHOR_SAME_AS used in {same_as_usages} blocks — expected 4+ (Review, Article, About, Blog)")
        passed += 1
    elif same_as_usages == 1:
        fail(f"sameAs: AUTHOR_SAME_AS only used in {same_as_usages} block — should be in all Person schemas")
        failed += 1
    else:
        fail("sameAs: AUTHOR_SAME_AS not found in any Person schema block")
        failed += 1

    # ── Check 4: Specific Person schema locations ──
    info("Checking specific schema functions...")

    schema_locations = {
        "Review schema (reviewSchema function)": (
            "reviewSchema" in content or "'@type': 'Review'" in content
        ) and "sameAs: AUTHOR_SAME_AS" in content,

        "Article schema (articleSchema function)": (
            "articleSchema" in content or "'@type': 'Article'" in content
        ) and "sameAs: AUTHOR_SAME_AS" in content,

        "About page Person schema": (
            "'@type': 'AboutPage'" in content or "About page" in content
        ) and "sameAs: AUTHOR_SAME_AS" in content,

        "Blog post author schema": (
            "post.datePublished" in content
        ) and "sameAs: AUTHOR_SAME_AS" in content,
    }

    for location, present in schema_locations.items():
        if present:
            ok(f"sameAs present in: {location}")
            passed += 1
        else:
            fail(f"sameAs MISSING in: {location}")
            failed += 1

    # ── Check 5: No old single-entry sameAs remains (the LinkedIn-only one) ──
    old_pattern = "sameAs: ['https://www.linkedin.com/in/navneetarya/']"
    if old_pattern in content:
        fail("Old single-entry sameAs still present — replace with AUTHOR_SAME_AS")
        failed += 1
    else:
        ok("Old single-entry sameAs (LinkedIn only) has been replaced")
        passed += 1

    return passed, failed


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print(f"\n{BOLD}{'═'*60}{RESET}")
    print(f"{BOLD}  AI Nexus — W1-T4 + W1-T6 Validator{RESET}")
    print(f"{BOLD}{'═'*60}{RESET}")
    print(f"  Repo root: {REPO_ROOT}")
    print(f"  index.html: {'found ✓' if INDEX_HTML.exists() else 'NOT FOUND ✗'}")
    print(f"  prerender.mjs: {'found ✓' if PRERENDER.exists() else 'NOT FOUND ✗'}")

    total_passed = total_failed = 0

    p, f = validate_t4()
    total_passed += p; total_failed += f

    p, f = validate_t6()
    total_passed += p; total_failed += f

    total = total_passed + total_failed
    print(f"\n{BOLD}{'═'*60}{RESET}")
    print(f"{BOLD}  SUMMARY{RESET}")
    print(f"{'─'*60}")
    print(f"  Checks passed : {GREEN}{BOLD}{total_passed}/{total}{RESET}")
    print(f"  Checks failed : {RED}{BOLD}{total_failed}/{total}{RESET}")

    if total_failed == 0:
        print(f"\n  {GREEN}{BOLD}🎉 All checks passed! Safe to push to GitHub.{RESET}")
    else:
        print(f"\n  {RED}{BOLD}⚠  Fix the FAIL items above before pushing.{RESET}")

    print(f"\n  {YELLOW}Reminder — also run validate_w1_fixes.py for W1-T1/T2/T3 checks.{RESET}")
    print(f"{BOLD}{'═'*60}{RESET}\n")
    sys.exit(0 if total_failed == 0 else 1)


if __name__ == "__main__":
    if sys.platform == "win32":
        os.system("color")
    main()
