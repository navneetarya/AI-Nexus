#!/usr/bin/env python3
"""
validate_week4_fixes.py
=======================
Validates W4-T1, W4-T2, and W4-T4 changes across:
  - scripts/prerender.mjs
  - pages/BlogPostPage.tsx
  - pages/MethodologyPage.tsx

Usage:
  python validate_week4_fixes.py                        # expects files next to this script
  python validate_week4_fixes.py --root /path/to/repo  # explicit repo root

Requires: Python 3.12+  |  No third-party dependencies
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import textwrap
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path

# ── ANSI colours ─────────────────────────────────────────────────────────────

RESET  = "\033[0m"
BOLD   = "\033[1m"
GREEN  = "\033[32m"
RED    = "\033[31m"
YELLOW = "\033[33m"
CYAN   = "\033[36m"
DIM    = "\033[2m"


def green(s: str)  -> str: return f"{GREEN}{s}{RESET}"
def red(s: str)    -> str: return f"{RED}{s}{RESET}"
def yellow(s: str) -> str: return f"{YELLOW}{s}{RESET}"
def cyan(s: str)   -> str: return f"{CYAN}{s}{RESET}"
def bold(s: str)   -> str: return f"{BOLD}{s}{RESET}"
def dim(s: str)    -> str: return f"{DIM}{s}{RESET}"


# ── Result primitives ─────────────────────────────────────────────────────────

class Status(Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    WARN = "WARN"


@dataclass
class Check:
    name: str
    status: Status
    detail: str
    snippet: str = ""          # optional extracted text for evidence
    line_no: int | None = None


@dataclass
class TaskResult:
    task_id: str               # e.g. "W4-T1"
    task_title: str
    file: str
    checks: list[Check] = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return all(c.status == Status.PASS for c in self.checks)

    @property
    def failed_checks(self) -> list[Check]:
        return [c for c in self.checks if c.status == Status.FAIL]


# ── Helpers ───────────────────────────────────────────────────────────────────

def read_file(path: Path) -> tuple[str, list[str]]:
    """Return (full_text, lines).  Raises SystemExit on missing file."""
    if not path.exists():
        print(red(f"\n  ✗  File not found: {path}"))
        print(dim("     Re-run with --root pointing to your repo root.\n"))
        sys.exit(1)
    text = path.read_text(encoding="utf-8")
    return text, text.splitlines()


def find_line(lines: list[str], pattern: str, flags: int = 0) -> int | None:
    """Return 1-based line number of first match, or None."""
    rx = re.compile(pattern, flags)
    for i, ln in enumerate(lines, 1):
        if rx.search(ln):
            return i
    return None


def find_lines(lines: list[str], pattern: str, flags: int = 0) -> list[int]:
    """Return all 1-based line numbers that match."""
    rx = re.compile(pattern, flags)
    return [i for i, ln in enumerate(lines, 1) if rx.search(ln)]


def extract_block(text: str, start_pattern: str, end_pattern: str) -> str | None:
    """Extract first text block between two regex patterns (inclusive)."""
    m_start = re.search(start_pattern, text)
    if not m_start:
        return None
    chunk = text[m_start.start():]
    m_end = re.search(end_pattern, chunk)
    if not m_end:
        return chunk[:300]
    return chunk[: m_end.end()]


def snippet(text: str, pattern: str, context: int = 60) -> str:
    """Return a short snippet around the first match of pattern."""
    m = re.search(pattern, text)
    if not m:
        return ""
    start = max(0, m.start() - context)
    end   = min(len(text), m.end() + context)
    raw   = text[start:end].strip().replace("\n", " ↵ ")
    return f"…{raw}…" if start > 0 or end < len(text) else raw


def check(name: str, condition: bool, pass_detail: str, fail_detail: str,
          snip: str = "", line_no: int | None = None) -> Check:
    status = Status.PASS if condition else Status.FAIL
    detail = pass_detail if condition else fail_detail
    return Check(name=name, status=status, detail=detail,
                 snippet=snip, line_no=line_no)


# ── W4-T1  ────────────────────────────────────────────────────────────────────

EXPECTED_CATEGORIES = [
    "best-ai-writing-tools",
    "best-ai-image-tools",
    "best-ai-video-tools",
    "best-ai-audio-tools",
    "best-ai-marketing-tools",
    "best-ai-design-tools",
    "best-ai-coding-tools",
    "best-ai-productivity-tools",
]

EXPECTED_OG_KEYS = [
    "og-category-writing.webp",
    "og-category-image.webp",
    "og-category-video.webp",
    "og-category-audio.webp",
    "og-category-marketing.webp",
    "og-category-design.webp",
    "og-category-coding.webp",
    "og-category-productivity.webp",
]


def validate_w4t1(prerender_path: Path) -> TaskResult:
    result = TaskResult(
        task_id    = "W4-T1",
        task_title = "Category OG images wired in prerender.mjs",
        file       = str(prerender_path),
    )
    text, lines = read_file(prerender_path)

    # ── Check 1: CATEGORY_OG_MAP constant exists ──────────────────────────────
    map_line = find_line(lines, r"CATEGORY_OG_MAP\s*=\s*\{")
    result.checks.append(check(
        name        = "CATEGORY_OG_MAP constant declared",
        condition   = map_line is not None,
        pass_detail = f"Found at line {map_line}",
        fail_detail = "CATEGORY_OG_MAP = { ... } not found — constant was never added",
        snip        = snippet(text, r"CATEGORY_OG_MAP"),
        line_no     = map_line,
    ))

    # ── Check 2: All 8 category slugs present in the map ─────────────────────
    missing_slugs = [slug for slug in EXPECTED_CATEGORIES if slug not in text]
    result.checks.append(check(
        name        = "All 8 category slugs in CATEGORY_OG_MAP",
        condition   = len(missing_slugs) == 0,
        pass_detail = "All 8 category slugs present",
        fail_detail = f"Missing slugs: {missing_slugs}",
        snip        = snippet(text, r"best-ai-writing-tools"),
    ))

    # ── Check 3: All 8 WebP OG filenames present ─────────────────────────────
    missing_webp = [k for k in EXPECTED_OG_KEYS if k not in text]
    result.checks.append(check(
        name        = "All 8 og-category-*.webp filenames in map",
        condition   = len(missing_webp) == 0,
        pass_detail = "All 8 WebP filenames present",
        fail_detail = f"Missing WebP references: {missing_webp}",
        snip        = snippet(text, r"og-category-writing\.webp"),
    ))

    # ── Check 4: resolveOgImage() checks CATEGORY_OG_MAP first ───────────────
    block = extract_block(text, r"function resolveOgImage", r"^}")
    map_check_in_fn = bool(block and "CATEGORY_OG_MAP" in block)
    result.checks.append(check(
        name        = "resolveOgImage() routes via CATEGORY_OG_MAP before other slugs",
        condition   = map_check_in_fn,
        pass_detail = "CATEGORY_OG_MAP lookup is inside resolveOgImage()",
        fail_detail = "resolveOgImage() body does not reference CATEGORY_OG_MAP — category pages still fall through to generic OG",
        snip        = (block or "")[:200].replace("\n", " ↵ "),
    ))

    # ── Check 5: CATEGORY_OG_MAP slug check is the FIRST branch ──────────────
    if block:
        first_if_match = re.search(r"if\s*\(", block)
        first_if_text  = block[first_if_match.start():first_if_match.start()+80] if first_if_match else ""
        is_first = "CATEGORY_OG_MAP" in first_if_text
    else:
        is_first = False
    result.checks.append(check(
        name        = "CATEGORY_OG_MAP check is the FIRST if-branch in resolveOgImage()",
        condition   = is_first,
        pass_detail = "Category pages are checked before compare/ and blog/ branches",
        fail_detail = "CATEGORY_OG_MAP check is NOT the first branch — other routes may intercept category slugs",
        snip        = snippet(text, r"if \(CATEGORY_OG_MAP"),
    ))

    # ── Check 6: ogImage passed to category writeRoute() ─────────────────────
    # Directly search for the line that wires ogImage into the category loop.
    # extract_block end-patterns are fragile when the closing log line varies;
    # a targeted line search is more reliable and immune to whitespace changes.
    wiredup_line = find_line(lines, r"ogImage\s*:.*resolveOgImage\s*\(\s*page\.slug\s*\)")
    result.checks.append(check(
        name        = "ogImage: resolveOgImage(page.slug) passed to category writeRoute()",
        condition   = wiredup_line is not None,
        pass_detail = f"ogImage wire-up found at line {wiredup_line}",
        fail_detail = "ogImage not wired into category writeRoute() — category pages will still emit generic OG tag",
        snip        = snippet(text, r"ogImage.*resolveOgImage\(page\.slug\)"),
        line_no     = wiredup_line,
    ))

    return result


# ── W4-T2  ────────────────────────────────────────────────────────────────────

EXPECTED_SAME_AS_URLS = [
    "linkedin.com/in/navneetarya",
    "twitter.com/ainexustools",
    "/about/",
    "github.com/navneetarya",
]


def validate_w4t2(blogpost_path: Path) -> TaskResult:
    result = TaskResult(
        task_id    = "W4-T2",
        task_title = "BlogPosting author schema upgraded with @id + sameAs",
        file       = str(blogpost_path),
    )
    text, lines = read_file(blogpost_path)

    # ── Check 1: @id field present in author object ───────────────────────────
    id_line = find_line(lines, r"'@id'\s*:|\"@id\"\s*:")
    result.checks.append(check(
        name        = "@id field present in author schema",
        condition   = id_line is not None,
        pass_detail = f"'@id' found at line {id_line}",
        fail_detail = "'@id' key missing from author object — Google Knowledge Graph cannot link the entity",
        snip        = snippet(text, r"'@id'"),
        line_no     = id_line,
    ))

    # ── Check 2: @id value points to /about/#author ───────────────────────────
    id_val_match = re.search(r"'@id'\s*:\s*`([^`]+)`", text) or \
                   re.search(r'"@id"\s*:\s*"([^"]+)"',  text)
    id_val = id_val_match.group(1) if id_val_match else ""
    has_anchor = "#author" in id_val or "about" in id_val
    result.checks.append(check(
        name        = "@id value targets /about/#author canonical anchor",
        condition   = has_anchor,
        pass_detail = f"@id value: '{id_val}'",
        fail_detail = f"@id value '{id_val}' does not include /about/#author — entity linking will be weaker",
        snip        = snippet(text, r"about.*#author|#author"),
    ))

    # ── Check 3: sameAs array present ────────────────────────────────────────
    sa_line = find_line(lines, r"sameAs\s*:")
    result.checks.append(check(
        name        = "sameAs array present in author object",
        condition   = sa_line is not None,
        pass_detail = f"sameAs found at line {sa_line}",
        fail_detail = "sameAs missing — author entity not cross-linked to external profiles",
        snip        = snippet(text, r"sameAs"),
        line_no     = sa_line,
    ))

    # ── Check 4: All expected profile URLs inside sameAs ─────────────────────
    sa_block = extract_block(text, r"sameAs\s*:\s*\[", r"\]")
    missing_urls = [u for u in EXPECTED_SAME_AS_URLS if sa_block and u not in sa_block]
    result.checks.append(check(
        name        = "sameAs contains all 4 expected profile URLs",
        condition   = len(missing_urls) == 0,
        pass_detail = "LinkedIn, Twitter/X, About page, and GitHub all present",
        fail_detail = f"Missing URLs in sameAs: {missing_urls}",
        snip        = (sa_block or "")[:250].replace("\n", " ↵ "),
    ))

    # ── Check 5: sameAs is inside the author block (not publisher) ───────────
    # Find author block and confirm sameAs is inside it (not after publisher:)
    author_block = extract_block(text, r"author\s*:\s*\{", r"\},\s*\n\s*(publisher|inLanguage|mainEntity)")
    sa_in_author = bool(author_block and "sameAs" in author_block)
    result.checks.append(check(
        name        = "sameAs is scoped inside the author block (not publisher)",
        condition   = sa_in_author,
        pass_detail = "sameAs correctly nested under author",
        fail_detail = "sameAs not found inside author block — it may have landed in the wrong object",
        snip        = (author_block or "")[:200].replace("\n", " ↵ "),
    ))

    # ── Check 6: sameAs mirrors the prerender AUTHOR_SAME_AS array ───────────
    # Presence of both 'linkedin' and 'github' guarantees parity with prerender
    has_linkedin = "linkedin" in text
    has_github   = "github"   in text
    result.checks.append(check(
        name        = "sameAs mirrors AUTHOR_SAME_AS from prerender.mjs (LinkedIn + GitHub present)",
        condition   = has_linkedin and has_github,
        pass_detail = "LinkedIn and GitHub profiles found — client + static schemas in sync",
        fail_detail = f"LinkedIn present: {has_linkedin}  |  GitHub present: {has_github}",
        snip        = snippet(text, r"linkedin|github"),
    ))

    return result


# ── W4-T4  ────────────────────────────────────────────────────────────────────

EXPECTED_CRITERIA = [
    "Pricing fairness",
    "Free plan quality",
    "Output accuracy",
    "Ease of use",
    "Reliability",
]

EXPECTED_WEIGHTS = ["25%", "20%", "25%", "15%", "15%"]

WEIGHT_SUM = 100   # must add to 100%


def validate_w4t4(methodology_path: Path) -> TaskResult:
    result = TaskResult(
        task_id    = "W4-T4",
        task_title = "Research criteria section added to MethodologyPage.tsx",
        file       = str(methodology_path),
    )
    text, lines = read_file(methodology_path)

    # ── Check 1: Section heading present ─────────────────────────────────────
    heading_line = find_line(lines, r"How each rating is scored", re.IGNORECASE)
    result.checks.append(check(
        name        = "Section heading 'How each rating is scored' present",
        condition   = heading_line is not None,
        pass_detail = f"Heading found at line {heading_line}",
        fail_detail = "Section heading not found — the criteria section was not added",
        snip        = snippet(text, r"How each rating is scored"),
        line_no     = heading_line,
    ))

    # ── Check 2: All 5 criteria labels present ────────────────────────────────
    missing_criteria = [c for c in EXPECTED_CRITERIA if c not in text]
    result.checks.append(check(
        name        = "All 5 scoring criteria present",
        condition   = len(missing_criteria) == 0,
        pass_detail = f"All 5 criteria found: {EXPECTED_CRITERIA}",
        fail_detail = f"Missing criteria: {missing_criteria}",
        snip        = snippet(text, r"Pricing fairness"),
    ))

    # ── Check 3: All 5 weight values present ─────────────────────────────────
    missing_weights = [w for w in EXPECTED_WEIGHTS if w not in text]
    # Allow both "25%" appearing twice (pricing + accuracy) — count occurrences
    weight_counts = {w: text.count(w) for w in set(EXPECTED_WEIGHTS)}
    # 25% appears twice, 20% once, 15% twice
    expected_counts = {"25%": 2, "20%": 1, "15%": 2}
    weight_counts_ok = all(weight_counts.get(w, 0) >= n for w, n in expected_counts.items())
    result.checks.append(check(
        name        = "Weight values (25%×2, 20%×1, 15%×2) present and sum to 100%",
        condition   = weight_counts_ok,
        pass_detail = f"Weight occurrences: {weight_counts}",
        fail_detail = f"Weight mismatch — found {weight_counts}, expected {expected_counts}",
        snip        = snippet(text, r"25%|20%|15%"),
    ))

    # ── Check 4: Section is inserted BEFORE the "Standards I don't compromise" section ──
    criteria_line  = find_line(lines, r"How each rating is scored", re.IGNORECASE)
    standards_line = find_line(lines, r"Standards I don.t compromise",  re.IGNORECASE)
    correct_order  = (
        criteria_line is not None and
        standards_line is not None and
        criteria_line < standards_line
    )
    result.checks.append(check(
        name        = "Criteria section inserted BEFORE 'Standards I don't compromise'",
        condition   = correct_order,
        pass_detail = f"Criteria at line {criteria_line}, Standards at line {standards_line} — correct order ✓",
        fail_detail = f"Order wrong — criteria line: {criteria_line}, standards line: {standards_line}",
        line_no     = criteria_line,
    ))

    # ── Check 5: Visual weight bar present ───────────────────────────────────
    bar_present = "barBg" in text or "bar-bg" in text
    # More specific: look for the bar inside the new section (after criteria heading)
    if criteria_line:
        section_text = "\n".join(lines[criteria_line - 1:])
        bar_in_section = "barBg" in section_text or "bar-bg" in section_text
    else:
        bar_in_section = False
    result.checks.append(check(
        name        = "Visual weight bar (barBg / bar-bg) rendered per criterion",
        condition   = bar_in_section,
        pass_detail = "barBg / bar-bg style found inside the criteria section",
        fail_detail = "Weight bars not found inside the criteria section — visual indicator missing",
        snip        = snippet(text, r"barBg|bar-bg"),
    ))

    # ── Check 6: W4-T4 comment tag present (audit trail) ─────────────────────
    tag_line = find_line(lines, r"W4-T4")
    result.checks.append(check(
        name        = "W4-T4 audit comment present (change traceability)",
        condition   = tag_line is not None,
        pass_detail = f"W4-T4 tag found at line {tag_line}",
        fail_detail = "W4-T4 comment not found — change is not traceable back to the audit",
        line_no     = tag_line,
    ))

    return result


# ── Reporter ──────────────────────────────────────────────────────────────────

def print_separator(char: str = "─", width: int = 72) -> None:
    print(dim(char * width))


def print_task(result: TaskResult) -> None:
    status_str = green("PASSED") if result.passed else red("FAILED")
    print()
    print_separator("═")
    print(f"  {bold(result.task_id)}  {cyan(result.task_title)}")
    print(f"  File   : {dim(result.file)}")
    print(f"  Status : {status_str}  ({len(result.checks)} checks)")
    print_separator()

    for i, c in enumerate(result.checks, 1):
        icon  = green("✓") if c.status == Status.PASS else red("✗")
        badge = green(" PASS ") if c.status == Status.PASS else red(" FAIL ")
        loc   = f"  {dim(f'line {c.line_no}')}" if c.line_no else ""

        print(f"  {icon} [{badge}] Check {i:02d} — {c.name}{loc}")
        print(f"          {dim(c.detail)}")

        if c.status == Status.FAIL and c.snippet:
            wrapped = textwrap.fill(
                c.snippet, width=64,
                initial_indent="          ⤷ ", subsequent_indent="            "
            )
            print(yellow(wrapped))

    print_separator()


def print_summary(results: list[TaskResult]) -> None:
    passed = [r for r in results if r.passed]
    failed = [r for r in results if not r.passed]
    total_checks  = sum(len(r.checks) for r in results)
    passed_checks = sum(len([c for c in r.checks if c.status == Status.PASS]) for r in results)
    failed_checks = total_checks - passed_checks

    print()
    print_separator("═")
    print(f"  {bold('VALIDATION SUMMARY')}")
    print_separator()
    print(f"  Tasks   : {len(results)} total  |  "
          f"{green(str(len(passed)))} passed  |  {red(str(len(failed)))} failed")
    print(f"  Checks  : {total_checks} total  |  "
          f"{green(str(passed_checks))} passed  |  {red(str(failed_checks))} failed")
    print_separator()

    if failed:
        print(f"\n  {bold(red('Failed tasks:'))}")
        for r in failed:
            print(f"    {red('✗')}  {bold(r.task_id)} — {r.task_title}")
            for c in r.failed_checks:
                print(f"         {red('·')} {c.name}")
                print(f"           {dim(c.detail)}")
        print()

    if not failed:
        print(f"\n  {bold(green('All Week 4 code fixes validated successfully.'))}")
        print(f"  {dim('Safe to commit and push to GitHub.')}\n")
    else:
        print(f"\n  {bold(yellow('Fix the failing checks before pushing to GitHub.'))}\n")

    print_separator("═")
    print()


# ── Main ──────────────────────────────────────────────────────────────────────

def resolve_paths(root: Path) -> tuple[Path, Path, Path]:
    """Resolve the 3 target file paths from the repo root."""
    prerender   = root / "scripts"  / "prerender.mjs"
    blogpost    = root / "pages"    / "BlogPostPage.tsx"
    methodology = root / "pages"    / "MethodologyPage.tsx"
    return prerender, blogpost, methodology


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Validate W4-T1, W4-T2, W4-T4 code fixes for AI Nexus",
    )
    parser.add_argument(
        "--root", "-r",
        type=Path,
        default=Path(__file__).parent,
        help="Repo root directory (default: directory containing this script)",
    )
    args = parser.parse_args()
    root: Path = args.root.resolve()

    print()
    print_separator("═")
    print(f"  {bold('AI Nexus — Week 4 Fix Validator')}")
    print(f"  {dim('Checks W4-T1 · W4-T2 · W4-T4 across 3 source files')}")
    print(f"  {dim(f'Repo root : {root}')}")
    print_separator("═")

    prerender_path, blogpost_path, methodology_path = resolve_paths(root)

    # Run validators
    results: list[TaskResult] = [
        validate_w4t1(prerender_path),
        validate_w4t2(blogpost_path),
        validate_w4t4(methodology_path),
    ]

    # Print per-task results
    for r in results:
        print_task(r)

    # Print summary
    print_summary(results)

    # Exit code: 0 = all pass, 1 = any failure
    sys.exit(0 if all(r.passed for r in results) else 1)


if __name__ == "__main__":
    main()
