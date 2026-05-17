#!/usr/bin/env python3
"""
AI Nexus — Week 1 Fix Validator
================================
Validates all 6 Week 1 audit fixes across 5 source files.
Run from the root of the AI-Nexus-main repo:

    python validate_w1_fixes.py

Or point it at a different root:

    python validate_w1_fixes.py --root /path/to/AI-Nexus-main

Exit code 0  → all checks passed
Exit code 1  → one or more checks failed
"""

import sys
import re
import argparse
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Optional

# ── ANSI colours ──────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RESET  = "\033[0m"

def ok(msg):   print(f"  {GREEN}✓{RESET}  {msg}")
def fail(msg): print(f"  {RED}✗{RESET}  {msg}")
def warn(msg): print(f"  {YELLOW}⚠{RESET}  {msg}")
def info(msg): print(f"  {DIM}{msg}{RESET}")


# ── Result container ──────────────────────────────────────────────────────────
@dataclass
class CheckResult:
    name: str
    passed: bool
    message: str
    detail: Optional[str] = None


@dataclass
class TaskResult:
    task_id: str
    title: str
    file: str
    checks: List[CheckResult] = field(default_factory=list)

    @property
    def passed(self):
        return all(c.passed for c in self.checks)

    @property
    def total(self):
        return len(self.checks)

    @property
    def passed_count(self):
        return sum(1 for c in self.checks if c.passed)


# ── Core helpers ──────────────────────────────────────────────────────────────
def read(path: Path) -> str:
    """Read file content, return empty string on error."""
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""
    except Exception as e:
        warn(f"Could not read {path}: {e}")
        return ""


def contains(text: str, pattern: str, regex: bool = False) -> bool:
    if regex:
        return bool(re.search(pattern, text))
    return pattern in text


def not_contains(text: str, pattern: str, regex: bool = False) -> bool:
    return not contains(text, pattern, regex)


# ── Individual task validators ─────────────────────────────────────────────────

def validate_w1_t1(root: Path) -> TaskResult:
    """W1-T1: Rewrite fabricated myTake sections as honest research synthesis."""
    task = TaskResult(
        task_id="W1-T1",
        title="Rewrite fabricated myTake sections as honest research synthesis",
        file="pages/ToolPage.tsx",
    )
    src = read(root / "pages/ToolPage.tsx")

    # ── Removed: first-person fabricated claims ────────────────────────────
    task.checks.append(CheckResult(
        name="Grammarly myTake — old first-person '2 years' claim removed",
        passed=not_contains(src, "I've used Grammarly daily for over two years"),
        message="Old fabricated claim still present" if contains(src, "I've used Grammarly daily for over two years")
                else "Grammarly fabricated '2 years' claim is gone",
    ))
    task.checks.append(CheckResult(
        name="Writesonic myTake — old first-person 'I gave it' claim removed",
        passed=not_contains(src, "I gave it 'best AI tools for freelancers 2026'"),
        message="Old fabricated claim still present" if contains(src, "I gave it 'best AI tools for freelancers 2026'")
                else "Writesonic fabricated usage claim is gone",
    ))
    task.checks.append(CheckResult(
        name="Rytr myTake — old '8 months' first-person claim removed",
        passed=not_contains(src, "I've been using Rytr for 8 months"),
        message="Old fabricated claim still present" if contains(src, "I've been using Rytr for 8 months")
                else "Rytr fabricated '8 months' claim is gone",
    ))

    # ── Added: research-synthesis framing ─────────────────────────────────
    task.checks.append(CheckResult(
        name="Grammarly myTake — research synthesis framing present",
        passed=contains(src, "This review synthesises 200+ verified user reviews") and
               contains(src, "Trustpilot, G2, and Capterra") and
               contains(src, "r/grammarly"),
        message="Research synthesis framing missing from Grammarly myTake",
    ))
    task.checks.append(CheckResult(
        name="Writesonic myTake — research synthesis framing present",
        passed=contains(src, "r/writing and r/artificial"),
        message="Research synthesis framing missing from Writesonic myTake",
    ))
    task.checks.append(CheckResult(
        name="Rytr myTake — research synthesis framing present",
        passed=contains(src, "r/rytr and r/productivity"),
        message="Research synthesis framing missing from Rytr myTake",
    ))

    # ── Grammarly handsOnTesting rewritten ───────────────────────────────
    task.checks.append(CheckResult(
        name="Grammarly handsOnTesting — old first-person test account removed",
        passed=not_contains(src, "In my 30-minute Grammarly free-plan test"),
        message="Old fabricated Grammarly handsOnTesting still present",
    ))
    task.checks.append(CheckResult(
        name="Grammarly handsOnTesting — replaced with documented outcomes",
        passed=contains(src, "official feature documentation") and
               contains(src, "review analysis from G2 and Capterra"),
        message="New research-sourced handsOnTesting text not found",
    ))

    # ── Research method badge added to renderer ──────────────────────────
    task.checks.append(CheckResult(
        name="Research method badge rendered in 'My honest take' section",
        passed=contains(src, "Research method:") and
               contains(src, "200+ verified reviews (Trustpilot, G2, Capterra)"),
        message="Research method badge not found in ToolPage renderer",
    ))

    return task


def validate_w1_t2(root: Path) -> TaskResult:
    """W1-T2: Remove fabricated testimonials, replace with author CTA."""
    task = TaskResult(
        task_id="W1-T2",
        title="Remove fabricated testimonials — replace with honest author CTA",
        file="pages/HomePage.tsx",
    )
    src = read(root / "pages/HomePage.tsx")

    # ── Removed: fake testimonial content ────────────────────────────────
    task.checks.append(CheckResult(
        name="Fake testimonial — 'Priya S.' removed",
        passed=not_contains(src, "Priya S."),
        message="Fake testimonial from 'Priya S.' still present",
    ))
    task.checks.append(CheckResult(
        name="Fake testimonial — 'Marcus T.' removed",
        passed=not_contains(src, "Marcus T."),
        message="Fake testimonial from 'Marcus T.' still present",
    ))
    task.checks.append(CheckResult(
        name="Fake testimonial — 'Aisha K.' removed",
        passed=not_contains(src, "Aisha K."),
        message="Fake testimonial from 'Aisha K.' still present",
    ))
    task.checks.append(CheckResult(
        name="'What readers say' section heading removed",
        passed=not_contains(src, "What readers say"),
        message="'What readers say' section heading still present",
    ))

    # ── Added: honest author CTA ──────────────────────────────────────────
    task.checks.append(CheckResult(
        name="Author CTA — real email link present",
        passed=contains(src, "hello@ainexustools.online"),
        message="Author CTA email link not found",
    ))
    task.checks.append(CheckResult(
        name="Author CTA — author photo used",
        passed=contains(src, "/author-photo.jpg"),
        message="Author photo reference not found in CTA section",
    ))
    task.checks.append(CheckResult(
        name="Author CTA — honest 'I read every email' message present",
        passed=contains(src, "I read every email"),
        message="Honest author CTA message not found",
    ))

    return task


def validate_w1_t3(root: Path) -> TaskResult:
    """W1-T3: Remove fake subscriber counts from two locations."""
    task = TaskResult(
        task_id="W1-T3",
        title="Remove fake subscriber counts (500+, 1,200+) from HomePage",
        file="pages/HomePage.tsx",
    )
    src = read(root / "pages/HomePage.tsx")

    # ── Removed: fake counts ──────────────────────────────────────────────
    task.checks.append(CheckResult(
        name="Hero — '500+ creators' fake count removed",
        passed=not_contains(src, "Join 500+ creators getting weekly AI tool picks"),
        message="Fake '500+ creators' text still present in hero",
    ))
    task.checks.append(CheckResult(
        name="Bottom strip — '1,200+ creators' fake count removed",
        passed=not_contains(src, "1,200+ creators"),
        message="Fake '1,200+ creators' text still present in bottom strip",
    ))

    # ── Added: honest replacement copy ───────────────────────────────────
    task.checks.append(CheckResult(
        name="Hero — replaced with honest 'no sponsored content' copy",
        passed=contains(src, "Weekly AI tool picks — free, no sponsored content"),
        message="Replacement hero newsletter copy not found",
    ))
    task.checks.append(CheckResult(
        name="Bottom strip — replaced with honest 'New reviews every week' copy",
        passed=contains(src, "New reviews every week. No sponsored content. Unsubscribe anytime."),
        message="Replacement bottom-strip copy not found",
    ))

    return task


def validate_w1_t4(root: Path) -> TaskResult:
    """W1-T4: Fix dead sameAs Twitter references in 3 locations."""
    task = TaskResult(
        task_id="W1-T4",
        title="Fix dead sameAs Twitter references in prerender.mjs + index.html",
        file="scripts/prerender.mjs · index.html",
    )
    prerender = read(root / "scripts/prerender.mjs")
    index_html = read(root / "index.html")

    # ── prerender.mjs ─────────────────────────────────────────────────────
    task.checks.append(CheckResult(
        name="prerender.mjs — dead twitter.com/ainexustools removed",
        passed=not_contains(prerender, "twitter.com/ainexustools"),
        message="Dead Twitter URL still present in prerender.mjs AUTHOR_SAME_AS",
    ))
    task.checks.append(CheckResult(
        name="prerender.mjs — replaced with x.com/aryanavneet",
        passed=contains(prerender, "x.com/aryanavneet"),
        message="New x.com/aryanavneet URL not found in prerender.mjs",
    ))

    # ── index.html — Organization schema ──────────────────────────────────
    task.checks.append(CheckResult(
        name="index.html — Organization sameAs dead Twitter removed",
        passed=not_contains(index_html, "twitter.com/ainexustools"),
        message="Dead twitter.com/ainexustools still present in index.html",
    ))
    task.checks.append(CheckResult(
        name="index.html — Organization sameAs updated to x.com/aryanavneet",
        passed=contains(index_html, "x.com/aryanavneet"),
        message="New x.com/aryanavneet URL not found in index.html",
    ))

    # ── index.html — Person schema sameAs has LinkedIn intact ─────────────
    task.checks.append(CheckResult(
        name="index.html — Person sameAs LinkedIn preserved",
        passed=contains(index_html, "linkedin.com/in/navneetarya"),
        message="LinkedIn sameAs was accidentally removed from Person schema",
    ))

    # ── AboutPage.tsx — confirm Twitter was never there (already clean) ───
    about = read(root / "pages/AboutPage.tsx")
    task.checks.append(CheckResult(
        name="AboutPage.tsx — no dead twitter.com/ainexustools reference",
        passed=not_contains(about, "twitter.com/ainexustools"),
        message="Dead Twitter URL found in AboutPage.tsx sameAs",
    ))

    return task


def validate_w1_t5(root: Path) -> TaskResult:
    """W1-T5: Fix '2+ years of testing' in trust bar."""
    task = TaskResult(
        task_id="W1-T5",
        title="Fix '2+ years of testing' trust bar claim",
        file="pages/HomePage.tsx",
    )
    src = read(root / "pages/HomePage.tsx")

    task.checks.append(CheckResult(
        name="Trust bar — '2+ years of testing' fabricated claim removed",
        passed=not_contains(src, "2+ years of testing"),
        message="Fabricated '2+ years of testing' still in trust bar",
    ))
    task.checks.append(CheckResult(
        name="Trust bar — replaced with honest defensible claim",
        passed=contains(src, "Researching AI tools since 2022") or
               contains(src, "Research-first methodology") or
               contains(src, "Independent research"),
        message="No honest replacement trust bar claim found",
    ))

    return task


def validate_w1_t7(root: Path) -> TaskResult:
    """W1-T7: Fix MethodologyPage Step 1 framing."""
    task = TaskResult(
        task_id="W1-T7",
        title="Fix MethodologyPage — Step 1 honest research framing",
        file="pages/MethodologyPage.tsx",
    )
    src = read(root / "pages/MethodologyPage.tsx")

    task.checks.append(CheckResult(
        name="Step 1 title — old 'Free account sign-up & interface exploration' removed",
        passed=not_contains(src, "Free account sign-up & interface exploration"),
        message="Old misleading Step 1 title still present in HANDS_ON_STEPS",
    ))
    task.checks.append(CheckResult(
        name="Step 1 title — replaced with 'Official documentation & interface research'",
        passed=contains(src, "Official documentation & interface research"),
        message="New Step 1 title not found in HANDS_ON_STEPS",
    ))
    task.checks.append(CheckResult(
        name="Step 1 detail — account creation described as optional",
        passed=contains(src, "optional") and
               (contains(src, "account creation is an optional") or
                contains(src, "free account may be registered")),
        message="Account creation not described as optional in Step 1 detail",
    ))
    task.checks.append(CheckResult(
        name="Step 1 detail — documentation listed as primary process",
        passed=contains(src, "official documentation") and
               contains(src, "help centre"),
        message="Documentation-first framing not found in Step 1 detail",
    ))

    return task


# ── Bonus: confirm already-fixed tasks weren't accidentally broken ─────────────

def validate_already_done(root: Path) -> TaskResult:
    """W1-T6 & W1-T8: Confirm pre-existing fixes weren't broken."""
    task = TaskResult(
        task_id="W1-T6/T8",
        title="Pre-existing fixes still intact (font file + sitemap glossary)",
        file="index.html · public/sitemap.xml",
    )

    # T6 — font file exists
    font_path = root / "public/fonts/inter-v20-latin-regular.woff2"
    task.checks.append(CheckResult(
        name="W1-T6: inter-v20-latin-regular.woff2 font file exists",
        passed=font_path.exists(),
        message=f"Font file missing: {font_path}",
    ))

    # T8 — glossary in sitemap
    sitemap = read(root / "public/sitemap.xml")
    task.checks.append(CheckResult(
        name="W1-T8: /glossary/ present in sitemap.xml",
        passed=contains(sitemap, "/glossary/"),
        message="Glossary URL missing from public/sitemap.xml",
    ))

    return task


# ── Runner ────────────────────────────────────────────────────────────────────

def run_all(root: Path) -> int:
    print()
    print(f"{BOLD}{CYAN}AI Nexus — Week 1 Fix Validator{RESET}")
    print(f"{DIM}Root: {root}{RESET}")
    print("─" * 60)

    validators = [
        validate_w1_t1,
        validate_w1_t2,
        validate_w1_t3,
        validate_w1_t4,
        validate_w1_t5,
        validate_w1_t7,
        validate_already_done,
    ]

    all_tasks: List[TaskResult] = []

    for validator in validators:
        task = validator(root)
        all_tasks.append(task)

        status_color = GREEN if task.passed else RED
        status_icon  = "✓ PASS" if task.passed else "✗ FAIL"
        print()
        print(f"{BOLD}{status_color}[{status_icon}]{RESET}  "
              f"{BOLD}{task.task_id}{RESET} — {task.title}")
        print(f"         {DIM}File: {task.file}{RESET}")

        for check in task.checks:
            if check.passed:
                ok(check.message)
            else:
                fail(check.message)
            if check.detail:
                info(f"       → {check.detail}")

        print(f"         {DIM}{task.passed_count}/{task.total} checks passed{RESET}")

    # ── Summary ────────────────────────────────────────────────────────────
    total_checks  = sum(t.total for t in all_tasks)
    passed_checks = sum(t.passed_count for t in all_tasks)
    failed_tasks  = [t for t in all_tasks if not t.passed]

    print()
    print("─" * 60)
    print(f"{BOLD}Results: {passed_checks}/{total_checks} checks passed across "
          f"{len(all_tasks)} tasks{RESET}")

    if not failed_tasks:
        print(f"{GREEN}{BOLD}✓ All Week 1 fixes validated successfully.{RESET}")
        print()
        return 0
    else:
        print(f"{RED}{BOLD}✗ {len(failed_tasks)} task(s) failed:{RESET}")
        for t in failed_tasks:
            failed_checks = [c for c in t.checks if not c.passed]
            print(f"  {RED}•{RESET} {t.task_id}: {t.title}")
            for c in failed_checks:
                print(f"      {RED}↳{RESET} {c.message}")
        print()
        return 1


def main():
    parser = argparse.ArgumentParser(
        description="Validate all Week 1 AI Nexus audit fixes.",
    )
    parser.add_argument(
        "--root",
        default=".",
        help="Path to the AI-Nexus-main repo root (default: current directory)",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve()

    # Quick sanity check — make sure we're pointing at the right repo
    if not (root / "pages" / "HomePage.tsx").exists():
        print(f"{RED}Error:{RESET} pages/HomePage.tsx not found under {root}")
        print("Run from inside the AI-Nexus-main folder, or pass --root <path>")
        sys.exit(2)

    sys.exit(run_all(root))


if __name__ == "__main__":
    main()
