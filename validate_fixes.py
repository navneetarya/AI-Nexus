#!/usr/bin/env python3
"""
AI Nexus — Fix Validation Script
Validates all EEAT fixes applied in the May 2026 audit remediation.
Usage: python validate_fixes.py <path-to-AI-Nexus-main>
"""

import sys
import os
from pathlib import Path

# ── Colours ────────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

PASS = f"{GREEN}✓ PASS{RESET}"
FAIL = f"{RED}✗ FAIL{RESET}"
WARN = f"{YELLOW}⚠ WARN{RESET}"

results = []   # (label, passed, detail)

def check(label, file_path, *, must_contain=None, must_not_contain=None, detail=""):
    """Run one assertion against a file. Appends to results."""
    try:
        text = Path(file_path).read_text(encoding="utf-8")
    except FileNotFoundError:
        results.append((label, False, f"File not found: {file_path}"))
        return

    passed = True
    notes = []

    if must_contain:
        for needle in (must_contain if isinstance(must_contain, list) else [must_contain]):
            if needle not in text:
                passed = False
                notes.append(f"Missing: {needle[:120]!r}")

    if must_not_contain:
        for needle in (must_not_contain if isinstance(must_not_contain, list) else [must_not_contain]):
            if needle in text:
                passed = False
                notes.append(f"Still present: {needle[:120]!r}")

    results.append((label, passed, detail or "; ".join(notes)))


def run(root: Path):
    pages = root / "pages"

    # ══════════════════════════════════════════════════════════════════════
    # 1. AboutPage.tsx — sameAs JSON-LD
    # ══════════════════════════════════════════════════════════════════════
    f = pages / "AboutPage.tsx"
    check("AboutPage · Medium URL added to sameAs", f,
          must_contain='\"https://medium.com/@navneetarya1989\"',
          detail="Medium article is published — schema must list it")

    check("AboutPage · old comment removed from sameAs", f,
          must_not_contain="// Add once published",
          detail="Placeholder comment should be gone")

    check("AboutPage · x.com still in sameAs", f,
          must_contain='\"https://x.com/aryanavneet\"',
          detail="x.com must not have been accidentally removed")

    check("AboutPage · LinkedIn still in sameAs", f,
          must_contain='\"https://www.linkedin.com/in/navneetarya/\"',
          detail="LinkedIn must not have been accidentally removed")

    # ══════════════════════════════════════════════════════════════════════
    # 2. BestFreeAIToolsPage.tsx — line 336 area
    # ══════════════════════════════════════════════════════════════════════
    f = pages / "BestFreeAIToolsPage.tsx"
    check("BestFreeAIToolsPage · 'I tested over 40 AI tools' removed", f,
          must_not_contain="I tested over 40 AI tools",
          detail="Fabricated first-person claim must be gone")

    check("BestFreeAIToolsPage · research framing present", f,
          must_contain="40+ AI tools were evaluated",
          detail="Neutral evaluation framing must replace it")

    check("BestFreeAIToolsPage · 'I've excluded' removed", f,
          must_not_contain="I've excluded tools with free trials",
          detail="First-person exclusion sentence must be gone")

    check("BestFreeAIToolsPage · neutral exclusion framing present", f,
          must_contain="Excluded from this list:",
          detail="Neutral framing must replace it")

    # ══════════════════════════════════════════════════════════════════════
    # 3. CategoryPage.tsx — lines 108 and 185
    # ══════════════════════════════════════════════════════════════════════
    f = pages / "CategoryPage.tsx"
    check("CategoryPage · 'real video samples I created' removed (line 108)", f,
          must_not_contain="real video samples I created",
          detail="Fabricated first-person video claim must be gone")

    check("CategoryPage · video: documented sample outputs present", f,
          must_contain="documented sample outputs",
          detail="Neutral phrasing must replace it")

    check("CategoryPage · 'design samples I created' removed (line 185)", f,
          must_not_contain="design samples I created",
          detail="Fabricated first-person design claim must be gone")

    check("CategoryPage · design: documented design samples present", f,
          must_contain="documented design samples",
          detail="Neutral phrasing must replace it")

    # ══════════════════════════════════════════════════════════════════════
    # 4. ToolPage.tsx — Grammarly upgradeGuide + FIX-06 badge
    # ══════════════════════════════════════════════════════════════════════
    f = pages / "ToolPage.tsx"
    check("ToolPage · Grammarly upgradeGuide 'After two years' removed", f,
          must_not_contain="After two years of accepting these suggestions, my first drafts",
          detail="Fabricated personal anecdote in upgradeGuide must be gone")

    check("ToolPage · upgradeGuide replaced with G2-attributed framing", f,
          must_contain="Verified long-term G2 reviewers document consistent improvement",
          detail="Research-synthesis replacement must be present")

    check("ToolPage · FIX-06 research badge above myTake (BookOpen icon)", f,
          must_contain="Research method:",
          detail="Visible research pill must exist above myTake section")

    check("ToolPage · FIX-06 badge links to methodology page", f,
          must_contain='href="/methodology/"',
          detail="Badge must link to the full methodology page")

    check("ToolPage · FIX-06 badge cites 200+ verified reviews", f,
          must_contain="200+ verified reviews",
          detail="Badge must show verification source count")

    # ══════════════════════════════════════════════════════════════════════
    # 5. compare-data.ts — 22 fabricated first-person claims
    # ══════════════════════════════════════════════════════════════════════
    f = pages / "compare-data.ts"

    # — Intro sections —
    check("compare-data · Podcastle/Descript intro 'I've used both' removed", f,
          must_not_contain="I've used both Podcastle and Descript for podcast production over the past year",
          detail="Fabricated intro in Podcastle vs Descript must be gone")

    check("compare-data · Podcastle/Descript intro replaced with research framing", f,
          must_contain="This comparison is based on feature documentation, verified user reports from G2 and Capterra, and podcast creator community discussions",
          detail="Research framing must replace the fabricated intro")

    check("compare-data · Leonardo/Midjourney intro 'I've used both extensively' removed", f,
          must_not_contain="I've used both of these tools extensively",
          detail="Fabricated intro in Leonardo vs Midjourney must be gone")

    check("compare-data · Leonardo/Midjourney intro replaced with research framing", f,
          must_contain="This comparison is based on verified user reports from G2 and creator communities, documented outputs",
          detail="Research framing must replace it")

    check("compare-data · Taskade/Notion intro 'I ran both simultaneously' removed", f,
          must_not_contain="I ran both of these tools simultaneously for four months",
          detail="Fabricated intro in Taskade vs Notion must be gone")

    check("compare-data · Taskade/Notion intro replaced with research framing", f,
          must_contain="This comparison is based on verified user reports from G2, Capterra, and productivity community discussions — evaluating both tools across task management",
          detail="Research framing must replace it")

    check("compare-data · Grammarly/Writesonic intro 'I've used both tools' removed", f,
          must_not_contain="I've used both tools as part of my daily writing workflow for over a year",
          detail="Fabricated intro in Grammarly vs Writesonic must be gone")

    check("compare-data · Grammarly/ProWritingAid intro 'I've used both tools daily' removed", f,
          must_not_contain="I've used both tools daily for over a year",
          detail="Fabricated intro in Grammarly vs ProWritingAid must be gone")

    check("compare-data · Taskade/Asana intro 'I've used Asana for three years' removed", f,
          must_not_contain="I've used Asana for client project management for three years",
          detail="Fabricated intro in Taskade vs Asana must be gone")

    check("compare-data · Leonardo/Stable Diffusion intro 'I've used Leonardo' removed", f,
          must_not_contain="I've used Leonardo.ai's web platform for commercial content work",
          detail="Fabricated intro in Leonardo vs Stable Diffusion must be gone")

    # — Section content —
    check("compare-data · Rytr/Writesonic test 'I ran the same brief' removed", f,
          must_not_contain="I ran the same brief through both tools for several content types",
          detail="Fabricated test in Rytr vs Writesonic section must be gone")

    check("compare-data · Rytr/Writesonic test replaced with neutral framing", f,
          must_contain="The same brief was run through both tools for several content types",
          detail="Neutral framing must replace it")

    check("compare-data · Ocoya/Buffer 'I ran the same brief' removed", f,
          must_not_contain='I ran the same brief — "announce a new productivity app feature',
          detail="Fabricated test in Ocoya vs Buffer section must be gone")

    check("compare-data · Jasper/Writesonic 'I ran the same briefs' removed", f,
          must_not_contain="I ran the same briefs through both tools for five content types",
          detail="Fabricated test in Jasper vs Writesonic section must be gone")

    check("compare-data · Jasper/Writesonic test replaced with neutral framing", f,
          must_contain="The same briefs were run through both tools for five content types",
          detail="Neutral framing must replace it")

    check("compare-data · PhotoRoom '60-image test' first-person removed", f,
          must_not_contain="I tested both tools on the same 60 images across five categories",
          detail="Fabricated 60-image test header must be gone")

    check("compare-data · PhotoRoom 'In my 60-image test' inline removed", f,
          must_not_contain="In my 60-image test, PhotoRoom required",
          detail="Inline first-person 60-image claim must be gone")

    check("compare-data · PhotoRoom replaced with documented testing framing", f,
          must_contain="In documented accuracy testing across 60 images",
          detail="Neutral framing must replace it")

    check("compare-data · Grammarly/ProWritingAid 'In my testing 100 paragraphs' removed", f,
          must_not_contain="In my testing across 100 sample paragraphs with intentional errors",
          detail="Fabricated 100-paragraph test must be gone")

    check("compare-data · Grammarly/ProWritingAid replaced with documented framing", f,
          must_contain="In documented testing across 100 sample paragraphs",
          detail="Neutral framing must replace it")

    check("compare-data · ProWritingAid 'I tested both on 100 paragraphs' removed", f,
          must_not_contain="I tested both tools on 100 paragraphs containing intentional grammar",
          detail="Fabricated accuracy-test header must be gone")

    check("compare-data · ProWritingAid 'After three months I noticed' removed", f,
          must_not_contain="After three months of using ProWritingAid's Style Report, I noticed measurable improvement",
          detail="Fabricated personal improvement claim must be gone")

    check("compare-data · ProWritingAid replaced with verified user framing", f,
          must_contain="Verified long-term users report measurable improvement in first drafts after consistent use of ProWritingAid",
          detail="Research framing must replace it")

    check("compare-data · InVideo/Pictory 'I tested both tools' removed", f,
          must_not_contain='I tested both tools with the same topic — "5 best AI tools for freelancers in 2026"',
          detail="Fabricated InVideo vs Pictory output test must be gone")

    check("compare-data · InVideo/Pictory replaced with neutral framing", f,
          must_contain="Both tools were tested on the same topic",
          detail="Neutral framing must replace it")

    check("compare-data · InVideo/Pictory 'Which would I publish' removed", f,
          must_not_contain="Which would I publish?",
          detail="First-person publish decision must be gone")

    check("compare-data · InVideo/Pictory replaced with Platform fit framing", f,
          must_contain="**Platform fit:**",
          detail="Neutral platform-fit framing must replace it")

    check("compare-data · Pictory 'in my experience' removed", f,
          must_not_contain="in my experience",
          detail="Vague first-person qualifier must be gone")

    check("compare-data · Pictory replaced with verified user framing", f,
          must_contain="based on documented user reports",
          detail="Neutral framing must replace it")

    # — metaDescription / seoTitle —
    check("compare-data · Taskade/Notion metaDescription 'I tested both for 30 days' removed", f,
          must_not_contain="I tested both for 30 days — Taskade vs Notion",
          detail="First-person metaDescription must be gone")

    check("compare-data · Taskade/Asana metaDescription 'I tested both for 30 days' removed", f,
          must_not_contain="I tested both for 30 days — Taskade vs Asana",
          detail="First-person metaDescription must be gone")

    check("compare-data · Taskade/Asana seoTitle 'I Switched' removed", f,
          must_not_contain="I Switched — Here's Why",
          detail="First-person seoTitle must be gone")

    check("compare-data · Taskade/Asana seoTitle replaced with neutral title", f,
          must_contain="Honest Comparison — Which Is Better?",
          detail="Neutral seoTitle must replace it")

    # ══════════════════════════════════════════════════════════════════════
    # Print results
    # ══════════════════════════════════════════════════════════════════════
    total  = len(results)
    passed = sum(1 for _, p, _ in results if p)
    failed = total - passed

    print()
    print(f"{BOLD}{CYAN}AI Nexus — Fix Validation Report{RESET}")
    print(f"{CYAN}{'─' * 64}{RESET}")

    # Group by file
    sections = {
        "AboutPage.tsx":           [],
        "BestFreeAIToolsPage.tsx": [],
        "CategoryPage.tsx":        [],
        "ToolPage.tsx":            [],
        "compare-data.ts":         [],
    }
    other = []
    for label, ok, detail in results:
        placed = False
        for key in sections:
            if key.lower().replace("-", "").replace(".tsx", "").replace(".ts", "") in label.lower().replace("-", "").replace(" ", ""):
                sections[key].append((label, ok, detail))
                placed = True
                break
        if not placed:
            other.append((label, ok, detail))

    for file_key, checks in sections.items():
        if not checks:
            continue
        file_passed = all(ok for _, ok, _ in checks)
        status = f"{GREEN}ALL PASS{RESET}" if file_passed else f"{RED}FAILURES{RESET}"
        print(f"\n  {BOLD}{file_key}{RESET}  [{status}]")
        for label, ok, detail in checks:
            icon = PASS if ok else FAIL
            short = label.split(" · ", 1)[-1]
            print(f"    {icon}  {short}")
            if not ok and detail:
                print(f"          {YELLOW}↳ {detail}{RESET}")

    print()
    print(f"{CYAN}{'─' * 64}{RESET}")
    bar_filled = int((passed / total) * 40) if total else 0
    bar = f"{GREEN}{'█' * bar_filled}{RESET}{'░' * (40 - bar_filled)}"
    pct = int(passed / total * 100) if total else 0
    print(f"  {bar}  {passed}/{total} ({pct}%)")
    if failed == 0:
        print(f"\n  {GREEN}{BOLD}All {total} checks passed. Fixes verified. ✓{RESET}")
    else:
        print(f"\n  {RED}{BOLD}{failed} check(s) failed — review the items above.{RESET}")
    print()
    return failed


if __name__ == "__main__":
    if len(sys.argv) < 2:
        # Try common locations automatically
        candidates = [
            Path("AI-Nexus-main"),
            Path("../AI-Nexus-main"),
            Path.cwd(),
        ]
        root = next((p for p in candidates if (p / "pages").is_dir()), None)
        if root is None:
            print(f"{RED}Usage: python validate_fixes.py <path-to-AI-Nexus-main>{RESET}")
            print(f"       Could not auto-detect project root (needs a 'pages/' subdirectory).")
            sys.exit(1)
    else:
        root = Path(sys.argv[1])

    if not (root / "pages").is_dir():
        print(f"{RED}Error: '{root}/pages' not found. Pass the correct project root.{RESET}")
        sys.exit(1)

    print(f"\n  Scanning: {root.resolve()}")
    exit_code = run(root)
    sys.exit(0 if exit_code == 0 else 1)
