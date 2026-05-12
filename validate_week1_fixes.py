"""
AI Nexus — Week 1 Fix Validation Script
Python 3.12.4
Run from the root of the AI-Nexus repo:
    python validate_week1_fixes.py

Validates every change made across Tasks 1–5 (Week 1):
  Task 1 — Remove false "personally tested" + fabricated timeUsed claims
  Task 2 — Category page CI validation added to deploy.yml
  Task 3 — foundingDate fixed + HomePage false claims removed
  Task 4 — All 18 blog slugs present in deploy.yml
  Task 5 — Dark mode default respects OS preference
"""

import sys
from pathlib import Path
from dataclasses import dataclass, field

# ── Colour codes ──────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

PASS = f"{GREEN}✅ PASS{RESET}"
FAIL = f"{RED}❌ FAIL{RESET}"
SKIP = f"{YELLOW}⚠️  SKIP{RESET}"


# ── Data structures ───────────────────────────────────────────────────────────
@dataclass
class Check:
    description: str
    status: str       # "pass" | "fail" | "skip"
    detail: str = ""


@dataclass
class Suite:
    name: str
    file: str
    checks: list[Check] = field(default_factory=list)

    @property
    def passed(self) -> int:
        return sum(1 for c in self.checks if c.status == "pass")

    @property
    def failed(self) -> int:
        return sum(1 for c in self.checks if c.status == "fail")

    @property
    def skipped(self) -> int:
        return sum(1 for c in self.checks if c.status == "skip")


# ── Helpers ───────────────────────────────────────────────────────────────────
def read(path: str) -> str | None:
    """Return file contents or None if file not found."""
    p = Path(path)
    if not p.exists():
        return None
    return p.read_text(encoding="utf-8")


def absent(content: str | None, text: str, description: str) -> Check:
    """Pass if `text` is NOT in `content`."""
    if content is None:
        return Check(description, "skip", "file not found")
    if text in content:
        # Find a short context snippet
        idx = content.index(text)
        snippet = content[max(0, idx - 30):idx + len(text) + 30].replace("\n", " ").strip()
        return Check(description, "fail", f"Found: …{snippet}…")
    return Check(description, "pass")


def present(content: str | None, text: str, description: str) -> Check:
    """Pass if `text` IS in `content`."""
    if content is None:
        return Check(description, "skip", "file not found")
    if text not in content:
        return Check(description, "fail", f"Expected string not found: {text!r}")
    return Check(description, "pass")


def present_all(content: str | None, items: list[str], description: str) -> Check:
    """Pass if ALL strings in `items` are found in `content`."""
    if content is None:
        return Check(description, "skip", "file not found")
    missing = [s for s in items if s not in content]
    if missing:
        return Check(description, "fail", f"Missing: {missing}")
    return Check(description, "pass")


# ── Print helpers ─────────────────────────────────────────────────────────────
def print_suite(suite: Suite) -> None:
    tag = PASS if suite.failed == 0 and suite.skipped == 0 else (SKIP if suite.failed == 0 else FAIL)
    print(f"\n{BOLD}{CYAN}{'─' * 60}{RESET}")
    print(f"{BOLD}{suite.name}{RESET}  {CYAN}({suite.file}){RESET}")
    print(f"{CYAN}{'─' * 60}{RESET}")
    for c in suite.checks:
        icon = PASS if c.status == "pass" else (SKIP if c.status == "skip" else FAIL)
        print(f"  {icon}  {c.description}")
        if c.detail:
            print(f"         {YELLOW}{c.detail}{RESET}")
    total = len(suite.checks)
    print(f"\n  {suite.passed}/{total} passed", end="")
    if suite.failed:
        print(f"  {RED}{suite.failed} failed{RESET}", end="")
    if suite.skipped:
        print(f"  {YELLOW}{suite.skipped} skipped{RESET}", end="")
    print()


# ═════════════════════════════════════════════════════════════════════════════
# SUITES
# ═════════════════════════════════════════════════════════════════════════════

def suite_index_html() -> Suite:
    s = Suite("Task 1 + 3 + 5 — index.html", "index.html")
    c = read("index.html")

    # ── Task 1: False "personally tested" claims removed ──
    s.checks.append(absent(c, "Every tool personally tested by Navneet Arya",
        "Meta description: 'personally tested by Navneet Arya' removed"))
    s.checks.append(absent(c, "Every tool tested for 30+ days before it earns a spot",
        "Static shell hero: '30+ days' claim removed"))
    s.checks.append(absent(c, "personally tested for a minimum of 30 days",
        "Organization schema: '30 days personally tested' claim removed"))
    s.checks.append(absent(c, '"every tool personally tested"',
        "Organization schema short description: false claim removed"))
    s.checks.append(absent(c, "every tool personally tested.",
        "Organization schema short description (lowercase): false claim removed"))

    # ── Task 1: Correct replacement strings present ──
    s.checks.append(present(c, "Independent research on the best AI tools",
        "Meta description updated to honest 'Independent research' language"))
    s.checks.append(present(c, "Researched &amp; compared so you don't have to",
        "Hero paragraph updated to honest language"))
    s.checks.append(present(c, "Independent AI tool research and comparisons for creators",
        "Organization schema description uses honest language"))

    # ── Task 3: foundingDate fixed ──
    s.checks.append(absent(c, '"foundingDate": "2025"',
        "foundingDate: '2025' removed"))
    s.checks.append(present(c, '"foundingDate": "2026"',
        "foundingDate correctly set to '2026'"))

    # ── Task 5: Dark mode respects OS preference ──
    s.checks.append(absent(c, "? saved : 'dark'",
        "Dark mode: hardcoded 'dark' default removed"))
    s.checks.append(present(c, "window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'",
        "Dark mode: OS preference (matchMedia) used for first-time visitors"))

    return s


def suite_toolpage() -> Suite:
    s = Suite("Task 1 — pages/ToolPage.tsx", "pages/ToolPage.tsx")
    c = read("pages/ToolPage.tsx")

    # ── Fabricated timeUsed values removed ──
    fabricated = [
        ('timeUsed: "2+ years daily"', "Grammarly '2+ years daily' timeUsed removed"),
        ('timeUsed: "6 months"',       "Writesonic/others '6 months' timeUsed removed"),
        ('timeUsed: "1 year"',         "'1 year' timeUsed removed"),
        ('timeUsed: "10 months"',      "'10 months' timeUsed removed"),
        ('timeUsed: "1.5 years"',      "'1.5 years' timeUsed removed"),
        ('timeUsed: "7 months"',       "'7 months' timeUsed removed"),
        ('timeUsed: "9 months"',       "'9 months' timeUsed removed"),
        ('timeUsed: "8 months"',       "'8 months' timeUsed removed"),
        ('timeUsed: "4 months"',       "'4 months' timeUsed removed"),
    ]
    for text, desc in fabricated:
        s.checks.append(absent(c, text, desc))

    # ── Researched format present ──
    s.checks.append(present(c, 'timeUsed: "Researched Mar 2026"',
        "Grammarly timeUsed set to 'Researched Mar 2026'"))
    s.checks.append(present(c, 'timeUsed: "Researched Feb 2026"',
        "At least one tool has 'Researched Feb 2026' timeUsed"))
    s.checks.append(present(c, 'timeUsed: "Researched Apr 2026"',
        "At least one tool has 'Researched Apr 2026' timeUsed"))

    # ── UI display labels fixed ──
    s.checks.append(absent(c, "Tested for {content.timeUsed}",
        "UI badge: 'Tested for X' label removed"))
    s.checks.append(absent(c, "of hands-on use",
        "UI label: 'of hands-on use' suffix removed"))
    s.checks.append(absent(c, "tested {tool.name} for {content.timeUsed}",
        "Author bio: 'tested tool.name for X' removed"))
    s.checks.append(absent(c, "I've personally tested",
        "Compare section: 'I've personally tested' removed"))

    # ── Schema description fixed ──
    s.checks.append(absent(c, "Tested personally for",
        "Schema description: 'Tested personally for' removed"))
    s.checks.append(present(c, "Independently researched",
        "Schema description uses 'Independently researched' language"))

    return s


def suite_prerender() -> Suite:
    s = Suite("Task 1 — scripts/prerender.mjs", "scripts/prerender.mjs")
    c = read("scripts/prerender.mjs")

    s.checks.append(absent(c, "personally tested for 30+ days",
        "Tool page description: '30+ days personally tested' removed"))
    s.checks.append(absent(c, "I personally tested",
        "Blog meta description: 'I personally tested' removed"))
    s.checks.append(absent(c, "personally tested by",
        "'personally tested by' removed"))
    s.checks.append(absent(c, "Every tool on this list has been personally tested",
        "Free tools page paragraph: false claim removed"))
    s.checks.append(absent(c, "Does ${AUTHOR} personally test every AI tool",
        "FAQ question: 'personally test every AI tool' removed"))
    s.checks.append(absent(c, 'What does \\"personally tested\\" mean',
        "FAQ question: 'personally tested' definition removed"))

    s.checks.append(present(c, "independently researched",
        "Tool page description uses 'independently researched'"))
    s.checks.append(present(c, "independently researched by",
        "Free tools page description uses 'independently researched by'"))
    s.checks.append(present(c, "independently research every AI tool",
        "FAQ question updated to 'independently research'"))

    return s


def suite_llms_txt() -> Suite:
    s = Suite("Task 1 — public/llms.txt", "public/llms.txt")
    c = read("public/llms.txt")

    s.checks.append(absent(c, "Every tool is personally tested before being reviewed",
        "False testing claim removed"))
    s.checks.append(present(c, "independently researched",
        "Honest 'independently researched' language present"))
    s.checks.append(present(c, "No sponsored reviews",
        "'No sponsored reviews' disclosure retained"))

    return s


def suite_llms_full_txt() -> Suite:
    s = Suite("Task 1 — public/llms-full.txt", "public/llms-full.txt")
    c = read("public/llms-full.txt")

    s.checks.append(absent(c, "All tools personally tested before review",
        "Header: false 'personally tested' claim removed"))
    s.checks.append(absent(c, "Every tool tested for a minimum of 30 days before being reviewed",
        "Testing standard: false '30 days' claim removed"))
    s.checks.append(present(c, "independently researched",
        "Honest 'independently researched' language present"))

    return s


def suite_homepage() -> Suite:
    s = Suite("Task 3 — pages/HomePage.tsx", "pages/HomePage.tsx")
    c = read("pages/HomePage.tsx")

    s.checks.append(absent(c, "Every tool personally tested",
        "Trust pill + footer: 'Every tool personally tested' removed"))
    s.checks.append(absent(c, "personally tested breakdowns",
        "Compare section: 'personally tested breakdowns' removed"))
    s.checks.append(absent(c, "I Test AI Tools for 30+ Days",
        "H1 headline: '30+ Days' false claim removed"))

    s.checks.append(present(c, "Independently researched",
        "Trust pill updated to 'Independently researched'"))
    s.checks.append(present(c, "I Research AI Tools",
        "H1 updated to honest 'I Research AI Tools' headline"))
    s.checks.append(present(c, "research-backed breakdowns",
        "Compare section updated to 'research-backed breakdowns'"))
    s.checks.append(present(c, "Honest AI tool research",
        "Footer tagline updated to honest language"))

    # Author photo (Task 3 — pre-existing in this codebase)
    s.checks.append(present(c, 'src="/author-photo.jpg"',
        "Author photo present in hero section"))
    s.checks.append(present(c, "by Navneet Arya",
        "Author byline present below photo"))

    return s


def suite_deploy_yml() -> Suite:
    s = Suite("Tasks 2 + 4 — .github/workflows/deploy.yml",
              ".github/workflows/deploy.yml")
    c = read(".github/workflows/deploy.yml")

    # ── Task 4: All 18 blog slugs ──
    blog_slugs = [
        "best-ai-writing-tools-for-beginners-2026",
        "best-ai-tools-for-freelancers-2026",
        "best-grammarly-alternatives",
        "best-podcastle-alternatives",
        "best-ai-tools-for-social-media-2026",
        "how-to-use-rytr-to-write-blog-posts",
        "ai-tools-for-students-free-2026",
        "best-ai-podcast-tools-2026",
        "jasper-ai-alternatives",
        "chatgpt-alternatives-free-2026",
        "best-ai-coding-tools-2026",
        "best-ai-logo-makers-free-2026",
        "best-ai-marketing-tools-2026",
        "ai-tools-for-teachers-2026",
        "best-midjourney-alternatives-2026",
        "best-notion-ai-alternatives-2026",
        "best-invideo-alternatives-2026",
        "how-to-use-ai-for-content-creation-2026",
    ]
    for slug in blog_slugs:
        s.checks.append(present(c, slug, f"Blog slug present: {slug}"))

    # ── Task 2: All 8 category page slugs validated ──
    category_slugs = [
        "best-ai-writing-tools",
        "best-ai-image-tools",
        "best-ai-video-tools",
        "best-ai-audio-tools",
        "best-ai-marketing-tools",
        "best-ai-design-tools",
        "best-ai-coding-tools",
        "best-ai-productivity-tools",
    ]
    s.checks.append(present_all(c, category_slugs,
        "All 8 category page slugs present in CI validation loop"))

    # ── Category pages checked in the right dist path ──
    s.checks.append(present(c, 'dist/$slug/index.html',
        "Category pages validated at correct dist path (dist/$slug/index.html)"))

    return s


# ═════════════════════════════════════════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════════════════════════════════════════

def main() -> None:
    print(f"\n{BOLD}{'═' * 60}{RESET}")
    print(f"{BOLD}  AI Nexus — Week 1 Fix Validation{RESET}")
    print(f"{BOLD}{'═' * 60}{RESET}")
    print(f"  Python {sys.version.split()[0]}  |  cwd: {Path.cwd()}")

    suites: list[Suite] = [
        suite_index_html(),
        suite_toolpage(),
        suite_prerender(),
        suite_llms_txt(),
        suite_llms_full_txt(),
        suite_homepage(),
        suite_deploy_yml(),
    ]

    for suite in suites:
        print_suite(suite)

    # ── Grand summary ──────────────────────────────────────────────────────
    total_pass   = sum(s.passed  for s in suites)
    total_fail   = sum(s.failed  for s in suites)
    total_skip   = sum(s.skipped for s in suites)
    total_checks = sum(len(s.checks) for s in suites)

    print(f"\n{BOLD}{'═' * 60}{RESET}")
    print(f"{BOLD}  GRAND SUMMARY{RESET}")
    print(f"{BOLD}{'═' * 60}{RESET}")

    suite_results = []
    for s in suites:
        icon = "✅" if s.failed == 0 and s.skipped == 0 else ("⚠️ " if s.failed == 0 else "❌")
        suite_results.append(f"  {icon}  {s.name}")
    print("\n".join(suite_results))

    print(f"\n  Checks : {total_checks}")
    print(f"  {GREEN}Passed : {total_pass}{RESET}")
    if total_fail:
        print(f"  {RED}Failed : {total_fail}{RESET}")
    if total_skip:
        print(f"  {YELLOW}Skipped: {total_skip} (file not found){RESET}")

    if total_fail == 0 and total_skip == 0:
        print(f"\n  {BOLD}{GREEN}All checks passed — Week 1 fixes verified. ✅{RESET}")
    elif total_fail == 0:
        print(f"\n  {BOLD}{YELLOW}No failures, but {total_skip} file(s) not found. "
              f"Run from the repo root.{RESET}")
    else:
        print(f"\n  {BOLD}{RED}{total_fail} check(s) failed — see details above.{RESET}")

    print(f"{BOLD}{'═' * 60}{RESET}\n")
    sys.exit(1 if total_fail > 0 else 0)


if __name__ == "__main__":
    main()
