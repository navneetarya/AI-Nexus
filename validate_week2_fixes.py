"""
validate_week2_fixes.py
=======================
Python 3.12.4 — validates all Week 2 audit fixes for AI Nexus.

Run from the project root:
    python validate_week2_fixes.py

Exit code 0 = all checks passed.
Exit code 1 = one or more checks failed.
"""

import sys
import re
from pathlib import Path

# ── Colour helpers ────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

passed: list[str] = []
failed: list[str] = []

def ok(label: str, detail: str = "") -> None:
    msg = f"  {GREEN}✓{RESET} {label}"
    if detail:
        msg += f"  {CYAN}({detail}){RESET}"
    print(msg)
    passed.append(label)

def fail(label: str, detail: str = "") -> None:
    msg = f"  {RED}✗{RESET} {label}"
    if detail:
        msg += f"  {YELLOW}→ {detail}{RESET}"
    print(msg)
    failed.append(label)

def section(title: str) -> None:
    print(f"\n{BOLD}{CYAN}{'─' * 60}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'─' * 60}{RESET}")

def read(path: Path) -> str:
    if not path.exists():
        fail(f"File exists: {path}", "FILE NOT FOUND — check you're running from the project root")
        return ""
    return path.read_text(encoding="utf-8")

# ── Resolve project root (script can sit in root or a sub-folder) ─────────────
SCRIPT_DIR = Path(__file__).resolve().parent
# Walk up until we find the project root: must have types.ts + pages/ + blog/
ROOT = SCRIPT_DIR
for _ in range(4):
    if (ROOT / "types.ts").exists() and (ROOT / "pages").is_dir() and (ROOT / "blog").is_dir():
        break
    ROOT = ROOT.parent
else:
    print(f"{RED}ERROR: Could not locate project root.{RESET}")
    print(f"  Expected: types.ts + pages/ + blog/ in the same directory.")
    print(f"  Searched from: {SCRIPT_DIR}")
    print(f"  Run this script from your project root:  python validate_week2_fixes.py")
    sys.exit(1)

print(f"\n{BOLD}AI Nexus — Week 2 Fix Validation{RESET}")
print(f"Project root : {ROOT}")
print(f"Python       : {sys.version}")

# ═════════════════════════════════════════════════════════════════════════════
# TASK A-1 — types.ts: researchSources interface added
# ═════════════════════════════════════════════════════════════════════════════
section("TASK A-1 · types.ts — researchSources interface")

types_src = read(ROOT / "types.ts")

checks_types = [
    ("researchSources field declared",        "researchSources?:",                    types_src),
    ("trustpilot sub-field present",          "trustpilot?:",                         types_src),
    ("g2 sub-field present",                  "g2?:",                                 types_src),
    ("reddit sub-field present",              "reddit?:",                             types_src),
    ("lastVerified sub-field present",        "lastVerified:",                        types_src),
]
for label, needle, src in checks_types:
    (ok if needle in src else fail)(label)

# ═════════════════════════════════════════════════════════════════════════════
# TASK A-2 — constants.ts: researchSources on 5 tools
# ═════════════════════════════════════════════════════════════════════════════
section("TASK A-2 · constants.ts — researchSources data on 5 tools")

constants_src = read(ROOT / "constants.ts")

TOOLS_WITH_SOURCES = ["grammarly", "rytr", "podcastle", "ocoya", "taskade"]

# Count occurrences of researchSources block
research_count = constants_src.count("researchSources:")
if research_count >= 5:
    ok(f"researchSources present on ≥5 tools", f"found {research_count} occurrences")
else:
    fail(f"researchSources present on ≥5 tools", f"only {research_count} found, expected 5")

# Check each tool has its own block
for slug in TOOLS_WITH_SOURCES:
    # Each tool block has `slug: 'X', ... researchSources:`
    # We check both the slug and that researchSources appears in the file at least once per tool
    slug_pattern = rf"slug:\s*['\"]{ re.escape(slug) }['\"]"
    if re.search(slug_pattern, constants_src):
        ok(f"  slug '{slug}' exists in TOOLS array")
    else:
        fail(f"  slug '{slug}' exists in TOOLS array", "slug not found — check constants.ts")

# Verify required sub-fields exist at least once each (shared across all 5 tools)
for field in ["trustpilot:", "g2:", "lastVerified:"]:
    count = constants_src.count(field)
    (ok if count >= 5 else fail)(
        f"  field '{field}' present ≥5 times",
        f"found {count}, expected ≥5" if count < 5 else f"{count} occurrences"
    )

# ═════════════════════════════════════════════════════════════════════════════
# TASK A-3 — ToolPage.tsx: Research Basis citation bar rendered
# ═════════════════════════════════════════════════════════════════════════════
section("TASK A-3 · ToolPage.tsx — Research Basis citation bar")

toolpage_src = read(ROOT / "pages" / "ToolPage.tsx")

checks_tp = [
    ("tool.researchSources guard present",     "tool.researchSources",                toolpage_src),
    ("'Research Basis' label in JSX",          "Research Basis",                      toolpage_src),
    ("Trustpilot link rendered",               "tool.researchSources.trustpilot",     toolpage_src),
    ("G2 rating rendered",                     "tool.researchSources.g2",             toolpage_src),
    ("Reddit sentiment rendered",              "tool.researchSources.reddit",         toolpage_src),
    ("lastVerified date rendered",             "tool.researchSources.lastVerified",   toolpage_src),
    ("aria-label on research section",         "aria-label",                          toolpage_src),
    ("Trustpilot link opens in new tab",       'target="_blank"',                     toolpage_src),
]
for label, needle, src in checks_tp:
    (ok if needle in src else fail)(label)

# ═════════════════════════════════════════════════════════════════════════════
# TASK B-1 — best-ai-writing-tools-for-beginners: rytr-vs-writesonic link added
# ═════════════════════════════════════════════════════════════════════════════
section("TASK B-1 · best-ai-writing-tools-for-beginners-2026.ts")

beginners_src = read(ROOT / "blog" / "best-ai-writing-tools-for-beginners-2026.ts")

checks_b1 = [
    ("rytr-vs-writesonic compare link present",    "/compare/rytr-vs-writesonic",    beginners_src),
    ("grammarly-vs-quillbot link still present",   "/compare/grammarly-vs-quillbot", beginners_src),
]
for label, needle, src in checks_b1:
    (ok if needle in src else fail)(label)

# ═════════════════════════════════════════════════════════════════════════════
# TASK B-2 — best-ai-tools-for-freelancers: taskade-vs-asana link added
# ═════════════════════════════════════════════════════════════════════════════
section("TASK B-2 · best-ai-tools-for-freelancers-2026.ts")

freelancers_src = read(ROOT / "blog" / "best-ai-tools-for-freelancers-2026.ts")

checks_b2 = [
    ("taskade-vs-asana compare link added",        "/compare/taskade-vs-asana",      freelancers_src),
    ("taskade-vs-notion link still present",       "/compare/taskade-vs-notion",     freelancers_src),
    ("rytr-vs-writesonic link still present",      "/compare/rytr-vs-writesonic",    freelancers_src),
]
for label, needle, src in checks_b2:
    (ok if needle in src else fail)(label)

# ═════════════════════════════════════════════════════════════════════════════
# TASK B-3 — best-ai-marketing-tools: ocoya-vs-buffer-vs-hootsuite link added
# ═════════════════════════════════════════════════════════════════════════════
section("TASK B-3 · best-ai-marketing-tools-2026.ts")

marketing_src = read(ROOT / "blog" / "best-ai-marketing-tools-2026.ts")

checks_b3 = [
    ("ocoya-vs-buffer-vs-hootsuite link added",   "/compare/ocoya-vs-buffer-vs-hootsuite", marketing_src),
    ("Jasper h2 section still intact",            "<h2>3. Jasper",                         marketing_src),
    ("Ocoya section still intact",                "<h2>2. Ocoya",                          marketing_src),
]
for label, needle, src in checks_b3:
    (ok if needle in src else fail)(label)

# ═════════════════════════════════════════════════════════════════════════════
# REGRESSION — ensure no existing compare links were broken
# ═════════════════════════════════════════════════════════════════════════════
section("REGRESSION · pre-existing compare links still intact")

regressions = [
    ("best-grammarly-alternatives",  "best-grammarly-alternatives.ts",       "/compare/grammarly-vs-quillbot"),
    ("best-grammarly-alternatives",  "best-grammarly-alternatives.ts",       "/compare/grammarly-vs-writesonic"),
    ("best-ai-podcast-tools",        "best-ai-podcast-tools-2026.ts",        "/compare/podcastle-vs-descript"),
]
for post_name, filename, link in regressions:
    src = read(ROOT / "blog" / filename)
    label = f"  {post_name} → {link.split('/')[-1]}"
    (ok if link in src else fail)(label)

# ═════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═════════════════════════════════════════════════════════════════════════════
total = len(passed) + len(failed)
print(f"\n{BOLD}{'═' * 60}{RESET}")
print(f"{BOLD}  RESULTS: {GREEN}{len(passed)} passed{RESET}{BOLD}  ·  {RED}{len(failed)} failed{RESET}{BOLD}  ·  {total} total{RESET}")
print(f"{BOLD}{'═' * 60}{RESET}")

if failed:
    print(f"\n{YELLOW}  Failed checks:{RESET}")
    for f in failed:
        print(f"    {RED}✗{RESET} {f}")
    print()
    sys.exit(1)
else:
    print(f"\n  {GREEN}All Week 2 fixes verified successfully.{RESET}\n")
    sys.exit(0)
