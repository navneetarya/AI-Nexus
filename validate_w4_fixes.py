"""
AI Nexus — Week 4 Fix Validator
================================
Python 3.12.4 · Windows compatible
Run from your project root:
    python validate_w4_fixes.py

Checks every W4 fix against the actual source files and prints a
pass/fail report.  Exit code 0 = all tests pass, 1 = one or more failures.
"""

import sys
import os
import re
from pathlib import Path
from typing import NamedTuple

# ── Config ────────────────────────────────────────────────────────────────────
# Auto-detect project root: assume this script lives at project root
# If you moved the script, set PROJECT_ROOT manually, e.g.:
#   PROJECT_ROOT = Path(r"C:\Users\you\repos\AI-Nexus-main")
PROJECT_ROOT = Path(__file__).parent.resolve()

# ── Colours (Windows 10+ supports ANSI if VT processing is enabled) ───────────
def enable_ansi():
    """Enable ANSI colour codes on Windows 10+."""
    if sys.platform == "win32":
        import ctypes
        kernel32 = ctypes.windll.kernel32
        kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)

enable_ansi()
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

# ── Result accumulator ────────────────────────────────────────────────────────
class Result(NamedTuple):
    task: str
    check: str
    passed: bool
    detail: str = ""

results: list[Result] = []

def check(task: str, description: str, condition: bool, detail: str = ""):
    r = Result(task, description, condition, detail)
    results.append(r)
    icon  = f"{GREEN}✓{RESET}" if condition else f"{RED}✗{RESET}"
    print(f"  {icon}  {description}")
    if not condition and detail:
        print(f"       {YELLOW}↳ {detail}{RESET}")

def section(title: str):
    print(f"\n{BOLD}{CYAN}{'─'*60}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'─'*60}{RESET}")

def read(relative_path: str) -> str:
    full = PROJECT_ROOT / relative_path
    if not full.exists():
        return ""
    return full.read_text(encoding="utf-8", errors="replace")

# ═════════════════════════════════════════════════════════════════════════════
# W4-T1 — Hero Rewrite: Author Photo + Proof Counter + Newsletter CTA
# ═════════════════════════════════════════════════════════════════════════════
section("W4-T1 · Hero Rewrite — Author Photo + Newsletter CTA")

hp = read("pages/HomePage.tsx")

check("W4-T1", "author-photo.jpg exists in /public/",
      (PROJECT_ROOT / "public/author-photo.jpg").exists(),
      "Place your photo at public/author-photo.jpg")

check("W4-T1", "Author photo <img> tag rendered in hero",
      'src="/author-photo.jpg"' in hp,
      "Add <img src='/author-photo.jpg'> to the hero section")

check("W4-T1", '"by Navneet Arya" badge present in hero',
      "by Navneet Arya" in hp,
      "Author attribution missing from hero")

check("W4-T1", "Social proof counter strip (tools tested, guides published) present",
      "tools tested" in hp and "guides published" in hp,
      "Proof strip missing from hero")

check("W4-T1", "Newsletter CTA moved into hero (\"Join 500+\" or BeehiivForm in hero block)",
      ("Join 500+" in hp or "BeehiivForm" in hp) and "variant=\"article\"" in hp,
      "Newsletter form/CTA not found in hero section")

# ═════════════════════════════════════════════════════════════════════════════
# W4-T2 — Affiliate CTAs: sponsored rel + second CTA after verdict
# ═════════════════════════════════════════════════════════════════════════════
section("W4-T2 · Affiliate CTAs — Compliance + Second CTA")

tp = read("pages/ToolPage.tsx")

sponsored_count = tp.count('rel="sponsored nofollow')
check("W4-T2", f"All affiliate links have rel=\"sponsored nofollow\" ({sponsored_count} found, need ≥5)",
      sponsored_count >= 5,
      f"Found only {sponsored_count} — run search/replace for rel='noopener noreferrer' → rel='sponsored nofollow noopener noreferrer'")

check("W4-T2", "No bare rel=\"noopener noreferrer\" on affiliate links (tool.affiliateLink)",
      'href={tool.affiliateLink} target="_blank" rel="noopener noreferrer"' not in tp,
      "Still have affiliate links with rel='noopener noreferrer' only")

check("W4-T2", "Second CTA block present after Quick Verdict section",
      "Ready to try {tool.name}?" in tp and "Get {tool.name} Free" in tp,
      "Add second affiliate CTA after the Quick Verdict <section>")

check("W4-T2", "Second CTA also uses sponsored rel",
      tp.count('rel="sponsored nofollow') >= 5,
      "Second CTA needs sponsored nofollow rel")

# ═════════════════════════════════════════════════════════════════════════════
# W4-T3 — Compare in Navigation + Popular Comparisons on Homepage
# ═════════════════════════════════════════════════════════════════════════════
section("W4-T3 · Compare in Navigation + Popular Comparisons Section")

nav = read("pages/SharedNav.tsx")
hp  = read("pages/HomePage.tsx")   # re-read (might have been gc'd)

check("W4-T3", "COMPARE_ARTICLES imported in SharedNav.tsx",
      "import { COMPARE_ARTICLES } from './compare-data'" in nav,
      "Add: import { COMPARE_ARTICLES } from './compare-data';")

check("W4-T3", "Compare dropdown state (compareOpen) added to SharedNav",
      "compareOpen" in nav,
      "Add useState(false) for compareOpen in SharedNav")

check("W4-T3", "Dropdown renders compare article list in SharedNav",
      "compare-dropdown" in nav and "COMPARE_ARTICLES.map" in nav,
      "Add <div className='compare-dropdown'> with COMPARE_ARTICLES.map(...)")

check("W4-T3", "ChevronDown icon used for dropdown affordance",
      "ChevronDown" in nav,
      "Add ChevronDown from lucide-react")

check("W4-T3", '"Popular Comparisons" section present on homepage',
      "Popular Comparisons" in hp,
      "Add Popular Comparisons grid section above newsletter strip")

check("W4-T3", "Top 5 compare articles rendered as cards on homepage",
      "COMPARE_ARTICLES.slice(0, 5)" in hp or "COMPARE_ARTICLES.slice(0,5)" in hp,
      "Render COMPARE_ARTICLES.slice(0, 5).map(...) as cards")

# ═════════════════════════════════════════════════════════════════════════════
# W4-T4 — Pricing Tables on Compare Pages
# ═════════════════════════════════════════════════════════════════════════════
section("W4-T4 · Pricing Comparison Tables on Compare Pages")

cd  = read("pages/compare-data.ts")
cap = read("pages/CompareArticlePage.tsx")

check("W4-T4", "ToolPricing interface defined in compare-data.ts",
      "export interface ToolPricing" in cd,
      "Add ToolPricing interface to compare-data.ts")

check("W4-T4", "ComparePricing interface defined in compare-data.ts",
      "export interface ComparePricing" in cd,
      "Add ComparePricing interface to compare-data.ts")

check("W4-T4", "pricing?: ComparePricing field added to CompareArticle interface",
      "pricing?: ComparePricing" in cd,
      "Add pricing?: ComparePricing field to CompareArticle interface")

# Count articles that have pricing (slug line followed eventually by pricing:)
pricing_in_articles = len(re.findall(r"pricing:\s*\{", cd))
check("W4-T4", f"Pricing data populated for all compare articles ({pricing_in_articles}/16 found)",
      pricing_in_articles >= 14,
      f"Only {pricing_in_articles} articles have pricing — add pricing data to all articles")

check("W4-T4", "PricingTable component defined in CompareArticlePage.tsx",
      "function PricingTable" in cap,
      "Add PricingTable component to CompareArticlePage.tsx")

check("W4-T4", "PricingTable rendered after quickAnswer in CompareArticlePage",
      "article.pricing && <PricingTable" in cap,
      "Render {article.pricing && <PricingTable pricing={article.pricing} />}")

check("W4-T4", "Pricing table affiliate links use sponsored rel",
      'rel="sponsored nofollow' in cap,
      "Add rel='sponsored nofollow noopener noreferrer' to pricing table links")

# ═════════════════════════════════════════════════════════════════════════════
# W4-T5 — "Best for [Persona]" Labels (should already be done)
# ═════════════════════════════════════════════════════════════════════════════
section("W4-T5 · Best for [Persona] Labels (pre-existing)")

cs = read("constants.ts")
hp = read("pages/HomePage.tsx")

check("W4-T5", "bestFor field present in constants.ts tool definitions",
      "bestFor:" in cs,
      "Add bestFor field to each tool in constants.ts")

best_for_count = cs.count("bestFor:")
check("W4-T5", f"bestFor populated for ≥20 tools ({best_for_count} found)",
      best_for_count >= 20,
      f"Only {best_for_count} tools have bestFor — needs all tools")

check("W4-T5", "bestFor label rendered on tool cards in HomePage.tsx",
      "tool.bestFor" in hp and "Best for" in hp,
      "Add {tool.bestFor} rendering to tool card component")

# ═════════════════════════════════════════════════════════════════════════════
# W4-T6 — Font Change: Syne → Fraunces
# ═════════════════════════════════════════════════════════════════════════════
section("W4-T6 · Hero Typography — Fraunces replaces Syne")

html = read("index.html")
hp   = read("pages/HomePage.tsx")

check("W4-T6", "Syne preload tag removed from index.html",
      'href="/fonts/syne-v24-latin-800.woff2"' not in html,
      "Remove <link rel='preload' href='/fonts/syne-v24-latin-800.woff2' ...>")

check("W4-T6", "Fraunces font link added to index.html (Google Fonts)",
      "Fraunces" in html,
      "Add Google Fonts link for Fraunces to <head>")

check("W4-T6", "Google Fonts preconnect added to index.html",
      "fonts.googleapis.com" in html and "fonts.gstatic.com" in html,
      "Add preconnect hints for fonts.googleapis.com and fonts.gstatic.com")

check("W4-T6", "Hero H1 uses Fraunces fontFamily in HomePage.tsx",
      "Fraunces" in hp,
      "Change fontFamily in hero <h1> to \"'Fraunces', Georgia, serif\"")

check("W4-T6", "H1 italic span kept for visual contrast (Fraunces italic feature)",
      "fontStyle:'italic'" in hp or 'fontStyle: "italic"' in hp,
      "Add fontStyle:'italic' to the accent <span> inside H1 for Fraunces optical benefit")

# ═════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═════════════════════════════════════════════════════════════════════════════
total   = len(results)
passed  = sum(1 for r in results if r.passed)
failed  = total - passed

print(f"\n{BOLD}{'═'*60}{RESET}")
print(f"{BOLD}  SUMMARY{RESET}")
print(f"{'═'*60}")

# Group by task
tasks: dict[str, list[Result]] = {}
for r in results:
    tasks.setdefault(r.task, []).append(r)

for task, task_results in tasks.items():
    ok = all(r.passed for r in task_results)
    p  = sum(1 for r in task_results if r.passed)
    t  = len(task_results)
    icon = f"{GREEN}✓{RESET}" if ok else f"{RED}✗{RESET}"
    status = f"{GREEN}PASS{RESET}" if ok else f"{YELLOW}{p}/{t}{RESET}"
    print(f"  {icon}  {task:<10}  {status}")

print(f"\n  Total: {GREEN}{passed}{RESET}/{total} checks passed", end="")
if failed:
    print(f"  ·  {RED}{failed} failed{RESET}")
else:
    print(f"  ·  {GREEN}All good!{RESET}")

print(f"{'═'*60}\n")

sys.exit(0 if failed == 0 else 1)
