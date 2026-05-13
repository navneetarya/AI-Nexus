#!/usr/bin/env python3
"""
AI Nexus — Week 1 Fix Validator
Python 3.12.4 | Run from the repo root: python validate_week1_fixes.py

Validates every change made in W1-T1 and W1-T3:

  W1-T1 — Remove ALL "Personally Tested" Language (EEAT +16 pts)
    ├─ AboutPage.tsx   — 11 false-claim removals / replacements
    ├─ MethodologyPage.tsx — 7 false-claim removals / replacements + STEPS rewrite
    └─ index.html      — 4 meta / schema false-claim fixes

  W1-T3 — Privacy Policy Visible Site-Wide (Trust signal)
    ├─ SharedNav.tsx   — Privacy link in mobile menu + footer strip
    ├─ PrivacyPage.tsx — New file exists with required sections
    └─ App.tsx         — /privacy route registered

Exit code 0 = all checks passed. Exit code 1 = one or more failures.
"""

import sys
import re
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────
ROOT             = Path(__file__).parent
ABOUT_PAGE       = ROOT / "pages" / "AboutPage.tsx"
METHODOLOGY_PAGE = ROOT / "pages" / "MethodologyPage.tsx"
INDEX_HTML       = ROOT / "index.html"
SHARED_NAV       = ROOT / "pages" / "SharedNav.tsx"
PRIVACY_PAGE     = ROOT / "pages" / "PrivacyPage.tsx"
APP_TSX          = ROOT / "App.tsx"

# ── Terminal colours ───────────────────────────────────────────────────────
PASS  = "\033[92m✅ PASS\033[0m"
FAIL  = "\033[91m❌ FAIL\033[0m"
SKIP  = "\033[93m⚠️  SKIP\033[0m"
BOLD  = "\033[1m"
RESET = "\033[0m"

results: list[tuple[str, bool, str]] = []


def check(label: str, passed: bool, detail: str = "") -> None:
    results.append((label, passed, detail))
    icon = PASS if passed else FAIL
    print(f"  {icon}  {label}")
    if not passed and detail:
        for line in detail.strip().split("\n"):
            print(f"         {FAIL_HINT}{line}{RESET}")


FAIL_HINT = "\033[91m"


def read(path: Path) -> str:
    """Return file contents as a string, or empty string if missing."""
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def section(title: str) -> None:
    width = 64
    print(f"\n{'─' * width}")
    print(f"  {BOLD}{title}{RESET}")
    print(f"{'─' * width}")


def absent(text: str, pattern: str) -> bool:
    """Return True if the regex pattern is NOT found in text (i.e. the bad string was removed)."""
    return not bool(re.search(pattern, text, re.IGNORECASE))


def present(text: str, pattern: str) -> bool:
    """Return True if the regex pattern IS found in text."""
    return bool(re.search(pattern, text, re.IGNORECASE))


# ══════════════════════════════════════════════════════════════════════════════
#  W1-T1 ── AboutPage.tsx
# ══════════════════════════════════════════════════════════════════════════════

def validate_about_page() -> None:
    section("W1-T1 · AboutPage.tsx — False claim removals")

    src = read(ABOUT_PAGE)
    if not src:
        check("File exists: pages/AboutPage.tsx", False, "File not found — skipping all sub-checks.")
        return

    check("File exists: pages/AboutPage.tsx", True)

    # ── Removed: false claims ───────────────────────────────────────────────
    check(
        "REMOVED: 'every tool personally tested before publication' (schema)",
        absent(src, r"every tool personally tested before publication"),
        "Schema worksFor description still contains false claim.",
    )
    check(
        "REMOVED: 'personally tested 20+' (author img alt text)",
        absent(src, r"personally tested 20\+"),
        "Author <img> alt attribute still claims personal testing.",
    )
    check(
        "REMOVED: 'signed up for, tested on real work tasks' (paragraph)",
        absent(src, r"signed up for,?\s*tested on real work tasks"),
        "Paragraph still claims tools were personally tested on real work tasks.",
    )
    check(
        "REMOVED: 'used for at least 2.4 weeks before I write' (paragraph)",
        absent(src, r"used for at least 2.{1,4}4 weeks before I write"),
        "Paragraph still references 2–4 weeks of personal use.",
    )
    check(
        "REMOVED: 'What I\\'ve actually tested' (section heading)",
        absent(src, r"What I.ve actually tested"),
        "Section heading still reads 'What I've actually tested'.",
    )
    check(
        "REMOVED: 'Testing environment' (card label)",
        absent(src, r">Testing environment<"),
        "Card label still reads 'Testing environment'.",
    )
    check(
        "REMOVED: 'Testing methodology' (section heading)",
        absent(src, r"Testing methodology"),
        "Section heading still reads 'Testing methodology'.",
    )
    check(
        "REMOVED: 'I test every tool personally for at least 30 days' (highlight box)",
        absent(src, r"I test every tool personally for at least 30 days"),
        "Highlight box still claims 30-day personal testing.",
    )
    check(
        "REMOVED: 'Sign up on the free plan' (step 1 of old testing list)",
        absent(src, r"Sign up on the free plan"),
        "Old testing step 1 still present.",
    )
    check(
        "REMOVED: 'Use it for real tasks' (step 2 of old testing list)",
        absent(src, r"Use it for real tasks"),
        "Old testing step 2 still present.",
    )
    check(
        "REMOVED: 'Test for at least 2.4 weeks' (step 3 of old testing list)",
        absent(src, r"Test for at least 2.{1,3}4 weeks"),
        "Old testing step 3 still present.",
    )
    check(
        "REMOVED: 'personally tested and would recommend' (affiliate section)",
        absent(src, r"personally tested and would recommend"),
        "Affiliate section still claims personal testing.",
    )

    # ── Added: replacement research language ────────────────────────────────
    check(
        "ADDED: 'independently researched before publication' (schema)",
        present(src, r"independently researched before publication"),
        "Schema worksFor description missing updated research language.",
    )
    check(
        "ADDED: research-based img alt text for author photo",
        present(src, r"independent AI tools researcher"),
        "Author <img> alt attribute missing 'independent AI tools researcher'.",
    )
    check(
        "ADDED: '100\u002b verified user reviews' research language (paragraph)",
        present(src, r"100\+\s*verified user reviews"),
        "Replacement paragraph missing '100+ verified user reviews' research language.",
    )
    check(
        "ADDED: 'What I\\'ve researched' (section heading)",
        present(src, r"What I.ve researched"),
        "Updated section heading 'What I've researched' not found.",
    )
    check(
        "ADDED: 'Research environment' (card label)",
        present(src, r">Research environment<"),
        "Updated card label 'Research environment' not found.",
    )
    check(
        "ADDED: 'Research methodology' (section heading)",
        present(src, r"Research methodology"),
        "Updated section heading 'Research methodology' not found.",
    )
    check(
        "ADDED: 5-step research process — step 1 (Official documentation review)",
        present(src, r"Official documentation review"),
        "5-step research step 1 'Official documentation review' not found.",
    )
    check(
        "ADDED: 5-step research process — step 2 (Verified user review aggregation)",
        present(src, r"Verified user review aggregation"),
        "5-step research step 2 'Verified user review aggregation' not found.",
    )
    check(
        "ADDED: 5-step research process — step 3 (Pricing verification)",
        present(src, r"Pricing verification"),
        "5-step research step 3 'Pricing verification' not found.",
    )
    check(
        "ADDED: 5-step research process — step 4 (Competitor benchmarking)",
        present(src, r"Competitor benchmarking"),
        "5-step research step 4 'Competitor benchmarking' not found.",
    )
    check(
        "ADDED: 5-step research process — step 5 (Review freshness)",
        present(src, r"Review freshness"),
        "5-step research step 5 'Review freshness' not found.",
    )
    check(
        "ADDED: 'independently researched and would recommend' (affiliate section)",
        present(src, r"independently researched and would recommend"),
        "Affiliate section missing updated 'independently researched' language.",
    )


# ══════════════════════════════════════════════════════════════════════════════
#  W1-T1 ── MethodologyPage.tsx
# ══════════════════════════════════════════════════════════════════════════════

def validate_methodology_page() -> None:
    section("W1-T1 · MethodologyPage.tsx — False claim removals + STEPS rewrite")

    src = read(METHODOLOGY_PAGE)
    if not src:
        check("File exists: pages/MethodologyPage.tsx", False, "File not found — skipping all sub-checks.")
        return

    check("File exists: pages/MethodologyPage.tsx", True)

    # ── Removed ─────────────────────────────────────────────────────────────
    check(
        "REMOVED: 'test every AI tool' from schema description",
        absent(src, r"uses to test every AI tool"),
        "Schema description still says 'uses to test every AI tool'.",
    )
    check(
        "REMOVED: '7-step testing process' section heading",
        absent(src, r"7-step testing process"),
        "Section heading still reads '7-step testing process'.",
    )
    check(
        "REMOVED: 'I start on the free plan — always' (old step 1)",
        absent(src, r"I start on the free plan"),
        "Old personal-testing step 1 still present.",
    )
    check(
        "REMOVED: 'Minimum 2.4 weeks of real use' (old step 2)",
        absent(src, r"Minimum 2.{1,3}4 weeks of real use"),
        "Old personal-testing step 2 still present.",
    )
    check(
        "REMOVED: 'Real tasks only — not demo prompts' (old step 3)",
        absent(src, r"Real tasks only"),
        "Old personal-testing step 3 still present.",
    )
    check(
        "REMOVED: 'I upgrade to a paid plan and test' (old step 5)",
        absent(src, r"I upgrade to a paid plan and test"),
        "Old personal-testing step 5 still present.",
    )
    check(
        "REMOVED: 'personally tested' from affiliate section",
        absent(src, r"I.ve personally tested"),
        "Affiliate section still contains 'I've personally tested'.",
    )
    check(
        "REMOVED: 'direct, simultaneous testing' from comparison tables section",
        absent(src, r"direct,?\s*simultaneous testing"),
        "Comparison tables section still claims 'direct, simultaneous testing'.",
    )
    check(
        "REMOVED: 'haven't used' from standards section (no round-up rule)",
        absent(src, r"tools I haven.t used"),
        "Standards section still references 'tools I haven't used'.",
    )
    check(
        "REMOVED: 'personally tested and would recommend' from affiliate section",
        absent(src, r"personally tested and would recommend"),
        "Affiliate section still contains 'personally tested and would recommend'.",
    )
    check(
        "REMOVED: 'it.s the process I actually follow' (false personal claim)",
        absent(src, r"it.s the process I actually follow"),
        "'it's the process I actually follow' still present in hero text.",
    )
    check(
        "REMOVED: 'how a tool was tested' from hero section",
        absent(src, r"how a tool was tested"),
        "Hero paragraph still says 'how a tool was tested' instead of 'researched'.",
    )
    check(
        "REMOVED: 'personally tested' from schema headline/description",
        absent(src, r"personally tested"),
        "Schema still contains 'personally tested'.",
    )

    # ── Added ────────────────────────────────────────────────────────────────
    check(
        "ADDED: 'independently research every AI tool' in schema description",
        present(src, r"independently research every AI tool"),
        "Schema description missing 'independently research every AI tool'.",
    )
    check(
        "ADDED: '5-step research process' section heading",
        present(src, r"5-step research process"),
        "Updated heading '5-step research process' not found.",
    )
    check(
        "ADDED: 'How I Research AI Tools' page title",
        present(src, r"How I Research AI Tools"),
        "Page H1 title still reads 'How I Review AI Tools' instead of 'Research'.",
    )
    check(
        "ADDED: 'Official documentation review' (new step 1)",
        present(src, r"Official documentation review"),
        "New research step 1 'Official documentation review' not found.",
    )
    check(
        "ADDED: 'Verified user review aggregation' (new step 2)",
        present(src, r"Verified user review aggregation"),
        "New research step 2 'Verified user review aggregation' not found.",
    )
    check(
        "ADDED: 'Pricing verification' (new step 3)",
        present(src, r"Pricing verification"),
        "New research step 3 'Pricing verification' not found.",
    )
    check(
        "ADDED: 'Competitor benchmarking' (new step 4)",
        present(src, r"Competitor benchmarking"),
        "New research step 4 'Competitor benchmarking' not found.",
    )
    check(
        "ADDED: 'Review freshness' (new step 5)",
        present(src, r"Review freshness"),
        "New research step 5 'Review freshness' not found.",
    )
    check(
        "ADDED: 'independently researched' in affiliate section",
        present(src, r"independently researched"),
        "Affiliate section missing 'independently researched' language.",
    )
    check(
        "ADDED: 'how a tool was researched' in hero section",
        present(src, r"a tool was researched"),
        "Hero section still uses 'tested' not 'researched'.",
    )


# ══════════════════════════════════════════════════════════════════════════════
#  W1-T1 ── index.html
# ══════════════════════════════════════════════════════════════════════════════

def validate_index_html() -> None:
    section("W1-T1 · index.html — Meta description + schema fixes")

    src = read(INDEX_HTML)
    if not src:
        check("File exists: index.html", False, "File not found — skipping all sub-checks.")
        return

    check("File exists: index.html", True)

    # ── Removed ─────────────────────────────────────────────────────────────
    check(
        "REMOVED: 'Honest pros, cons' from meta description",
        absent(src, r"Honest pros, cons"),
        "Meta description still contains 'Honest pros, cons' — audit says to remove this.",
    )
    check(
        "REMOVED: 'Honest pros, cons' from OG description",
        absent(src, r'og:description.*Honest pros'),
        "OG meta description still contains 'Honest pros'.",
    )
    check(
        "REMOVED: 'Honest pros, cons' from Twitter description",
        absent(src, r'twitter:description.*Honest pros'),
        "Twitter meta description still contains 'Honest pros'.",
    )
    check(
        "REMOVED: 'Testing AI tools since 2022' from Person schema",
        absent(src, r"Testing AI tools since 2022"),
        "Person schema still reads 'Testing AI tools since 2022'.",
    )

    # ── Added ────────────────────────────────────────────────────────────────
    check(
        "ADDED: 'Research-backed' in meta description",
        present(src, r"Research-backed"),
        "Meta description missing 'Research-backed' replacement language.",
    )
    check(
        "ADDED: 'Researching AI tools since 2022' in Person schema",
        present(src, r"Researching AI tools since 2022"),
        "Person schema missing updated 'Researching AI tools since 2022'.",
    )


# ══════════════════════════════════════════════════════════════════════════════
#  W1-T3 ── SharedNav.tsx
# ══════════════════════════════════════════════════════════════════════════════

def validate_shared_nav() -> None:
    section("W1-T3 · SharedNav.tsx — Privacy link + footer strip")

    src = read(SHARED_NAV)
    if not src:
        check("File exists: pages/SharedNav.tsx", False, "File not found — skipping all sub-checks.")
        return

    check("File exists: pages/SharedNav.tsx", True)

    # ── Privacy in mobile dropdown ───────────────────────────────────────────
    check(
        "ADDED: 'Privacy Policy' label in mobile dropdown",
        present(src, r"label:\s*['\"]Privacy Policy['\"]"),
        "Mobile dropdown array missing { label: 'Privacy Policy' } entry.",
    )
    check(
        "ADDED: navigate('/privacy') called from mobile dropdown",
        present(src, r"navigate\(['\"]\/privacy['\"]"),
        "Mobile dropdown missing navigate('/privacy') call.",
    )

    # ── Site-wide footer strip ───────────────────────────────────────────────
    check(
        "ADDED: <footer> element in SharedNav",
        present(src, r"<footer"),
        "No <footer> element found — site-wide footer strip not added.",
    )
    check(
        "ADDED: '/privacy' link in footer strip",
        present(src, r"path:\s*['\"]\/privacy['\"]"),
        "Footer strip missing { path: '/privacy' } entry.",
    )
    check(
        "ADDED: '/disclosure' link in footer strip",
        present(src, r"path:\s*['\"]\/disclosure['\"]"),
        "Footer strip missing { path: '/disclosure' } entry.",
    )
    check(
        "ADDED: '/methodology' link in footer strip",
        present(src, r"path:\s*['\"]\/methodology['\"]"),
        "Footer strip missing { path: '/methodology' } entry.",
    )
    check(
        "ADDED: '/about' link in footer strip",
        present(src, r"path:\s*['\"]\/about['\"]"),
        "Footer strip missing { path: '/about' } entry.",
    )
    check(
        "ADDED: copyright line with current year in footer",
        present(src, r"new Date\(\)\.getFullYear\(\)"),
        "Footer strip missing dynamic copyright year.",
    )


# ══════════════════════════════════════════════════════════════════════════════
#  W1-T3 ── PrivacyPage.tsx (new file)
# ══════════════════════════════════════════════════════════════════════════════

def validate_privacy_page() -> None:
    section("W1-T3 · PrivacyPage.tsx — New file structure and required sections")

    src = read(PRIVACY_PAGE)
    if not src:
        check("File exists: pages/PrivacyPage.tsx", False,
              "PrivacyPage.tsx does not exist — create it at pages/PrivacyPage.tsx.")
        return

    check("File exists: pages/PrivacyPage.tsx", True)

    # ── Export and structure ──────────────────────────────────────────────────
    check(
        "STRUCTURE: exports 'PrivacyPage' function",
        present(src, r"export\s+function\s+PrivacyPage"),
        "PrivacyPage.tsx must export a named function 'PrivacyPage'.",
    )
    check(
        "STRUCTURE: accepts navigate, isDark, toggleTheme props",
        present(src, r"navigate.*isDark.*toggleTheme"),
        "PrivacyPage props signature missing navigate / isDark / toggleTheme.",
    )
    check(
        "STRUCTURE: renders SharedNav",
        present(src, r"<SharedNav"),
        "PrivacyPage must render <SharedNav> for consistent navigation.",
    )
    check(
        "STRUCTURE: imports SITE_CONFIG",
        present(src, r"import.*SITE_CONFIG"),
        "PrivacyPage must import SITE_CONFIG to reference site URL and email.",
    )

    # ── Required policy sections ──────────────────────────────────────────────
    required_sections = [
        ("What information we collect",  r"What information we collect"),
        ("How we use your information",  r"How we use your information"),
        ("Google Analytics",             r"Google Analytics"),
        ("Cookies",                      r"Cookies"),
        ("Affiliate links",              r"Affiliate links"),
        ("Data retention",               r"Data retention"),
        ("Your rights",                  r"Your rights"),
        ("Contact",                      r"Contact"),
    ]
    for label, pattern in required_sections:
        check(
            f"CONTENT: section '{label}' present",
            present(src, pattern),
            f"Required privacy policy section '{label}' not found.",
        )

    # ── Key legal references ──────────────────────────────────────────────────
    check(
        "CONTENT: references Google Analytics / GA4",
        present(src, r"Google Analytics\s*4|GA4"),
        "Privacy policy must mention Google Analytics 4 (GA4) since site uses it.",
    )
    check(
        "CONTENT: references GDPR or CCPA",
        present(src, r"GDPR|CCPA"),
        "Privacy policy should reference GDPR and/or CCPA for user rights section.",
    )
    check(
        "CONTENT: 'Last updated' date present",
        present(src, r"[Ll]ast\s+updated"),
        "Privacy policy must include a 'Last updated' date.",
    )
    check(
        "CONTENT: contact email referenced",
        present(src, r"SITE_CONFIG\.email|hello@ainexustools"),
        "Privacy policy must include a contact email address.",
    )
    check(
        "CONTENT: navigate('/disclosure') link back to disclosure page",
        present(src, r"disclosure"),
        "Privacy page should link to the Affiliate Disclosure page.",
    )


# ══════════════════════════════════════════════════════════════════════════════
#  W1-T3 ── App.tsx
# ══════════════════════════════════════════════════════════════════════════════

def validate_app_tsx() -> None:
    section("W1-T3 · App.tsx — /privacy route registration")

    src = read(APP_TSX)
    if not src:
        check("File exists: App.tsx", False, "File not found — skipping all sub-checks.")
        return

    check("File exists: App.tsx", True)

    check(
        "ADDED: PrivacyPage lazy import",
        present(src, r"import\s*\(.*PrivacyPage.*\)"),
        "App.tsx missing React.lazy import for PrivacyPage.",
    )
    check(
        "ADDED: path === '/privacy' route handler",
        present(src, r"path\s*===\s*['\"]\/privacy['\"]"),
        "App.tsx missing route handler for '/privacy'.",
    )
    check(
        "ADDED: <PrivacyPage> rendered inside Suspense",
        present(src, r"<PrivacyPage"),
        "App.tsx missing <PrivacyPage> JSX inside the /privacy route.",
    )
    check(
        "ADDED: Privacy Policy meta title in /privacy route",
        present(src, r"Privacy Policy.*AI Nexus"),
        "Route meta title for /privacy should include 'Privacy Policy | AI Nexus'.",
    )
    check(
        "ADDED: siteUrl/privacy/ in updateMeta call",
        present(src, r"siteUrl.*privacy"),
        "updateMeta call for /privacy route missing canonical URL.",
    )
    check(
        "UNCHANGED: /disclosure route still present",
        present(src, r"path\s*===\s*['\"]\/disclosure['\"]"),
        "/disclosure route was removed — it must be kept.",
    )
    check(
        "UNCHANGED: /methodology route still present",
        present(src, r"path\s*===\s*['\"]\/methodology['\"]"),
        "/methodology route was removed — it must be kept.",
    )


# ══════════════════════════════════════════════════════════════════════════════
#  CROSS-FILE CONSISTENCY
# ══════════════════════════════════════════════════════════════════════════════

def validate_cross_file_consistency() -> None:
    section("CROSS-FILE · Consistency checks")

    about_src       = read(ABOUT_PAGE)
    methodology_src = read(METHODOLOGY_PAGE)
    index_src       = read(INDEX_HTML)
    nav_src         = read(SHARED_NAV)
    app_src         = read(APP_TSX)
    privacy_src     = read(PRIVACY_PAGE)

    # No file should still contain the banned phrases anywhere
    banned: list[tuple[str, str]] = [
        ("personally tested",          r"personally tested"),
        ("I use this daily",           r"I use this daily"),
        ("after weeks of testing",     r"after weeks of testing"),
        ("I.ve been using .+ for .+ years", r"I.ve been using .+ for .+ years"),
        ("signed up for, tested on",   r"signed up for,?\s*tested on"),
        ("2.4 weeks of real use",      r"2.{1,3}4 weeks of real use"),
        ("real tasks, not demo",       r"real tasks, not demo prompts"),
    ]

    all_files = {
        "AboutPage.tsx":       about_src,
        "MethodologyPage.tsx": methodology_src,
        "index.html":          index_src,
    }

    for phrase, pattern in banned:
        hits = [fname for fname, src in all_files.items() if present(src, pattern)]
        check(
            f"GLOBAL: '{phrase}' absent across all W1-T1 files",
            len(hits) == 0,
            f"Still found in: {', '.join(hits)}" if hits else "",
        )

    # Privacy page reachable: SharedNav footer links to /privacy AND App.tsx routes it
    nav_has_privacy  = present(nav_src, r"\/privacy")
    app_has_privacy  = present(app_src, r"\/privacy")
    page_exists      = PRIVACY_PAGE.exists()

    check(
        "CONSISTENCY: /privacy linked in SharedNav, routed in App.tsx, and file exists",
        nav_has_privacy and app_has_privacy and page_exists,
        "\n".join(filter(None, [
            "SharedNav.tsx missing /privacy link."  if not nav_has_privacy else "",
            "App.tsx missing /privacy route."       if not app_has_privacy else "",
            "pages/PrivacyPage.tsx does not exist." if not page_exists     else "",
        ])),
    )

    # Research language present consistently across About + Methodology
    check(
        "CONSISTENCY: 'independent research' language in both AboutPage and MethodologyPage",
        present(about_src, r"independent.{1,10}research") and present(methodology_src, r"independent.{1,10}research"),
        "Research language not consistently applied to both pages.",
    )


# ══════════════════════════════════════════════════════════════════════════════
#  SUMMARY
# ══════════════════════════════════════════════════════════════════════════════

def print_summary() -> None:
    total   = len(results)
    passed  = sum(1 for _, ok, _ in results if ok)
    failed  = total - passed
    pct     = int(passed / total * 100) if total else 0

    print(f"\n{'═' * 64}")
    print(f"  {BOLD}SUMMARY{RESET}")
    print(f"{'═' * 64}")
    print(f"  Total checks : {total}")
    print(f"  Passed       : \033[92m{passed}\033[0m")
    print(f"  Failed       : \033[91m{failed}\033[0m")
    print(f"  Score        : {pct}%")
    print(f"{'═' * 64}")

    if failed:
        print(f"\n  {BOLD}Failed checks:{RESET}")
        for label, ok, detail in results:
            if not ok:
                print(f"    \033[91m✗\033[0m  {label}")
        print()
        print("  Fix the issues above and re-run this script.")
    else:
        print(f"\n  \033[92m{BOLD}All checks passed — W1-T1 and W1-T3 are fully implemented.{RESET}")
        print("  You can now commit and push to GitHub Pages.\n")


# ══════════════════════════════════════════════════════════════════════════════
#  ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print(f"\n{BOLD}AI Nexus — Week 1 Fix Validator{RESET}")
    print(f"Python {sys.version.split()[0]}  |  Repo root: {ROOT.resolve()}")

    validate_about_page()
    validate_methodology_page()
    validate_index_html()
    validate_shared_nav()
    validate_privacy_page()
    validate_app_tsx()
    validate_cross_file_consistency()

    print_summary()

    failed_count = sum(1 for _, ok, _ in results if not ok)
    sys.exit(0 if failed_count == 0 else 1)
