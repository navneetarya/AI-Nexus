#!/usr/bin/env python3
"""
AI Nexus — Week 3 Task Validation Script
Audit: ainexus-upgraded-audit-v2-2026
Run from the repo root: python validate_week3.py
"""

import os
import re
import sys
import urllib.request
import urllib.error
from pathlib import Path

# ── Colour helpers ────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RESET  = "\033[0m"

def ok(msg):   print(f"  {GREEN}✔{RESET}  {msg}")
def fail(msg): print(f"  {RED}✗{RESET}  {msg}")
def warn(msg): print(f"  {YELLOW}⚠{RESET}  {msg}")
def info(msg): print(f"  {CYAN}→{RESET}  {msg}")
def head(msg): print(f"\n{BOLD}{msg}{RESET}")
def rule():    print(f"{DIM}{'─'*64}{RESET}")


# ── Locate repo root ──────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).resolve().parent
REPO_ROOTS   = [SCRIPT_DIR, SCRIPT_DIR.parent]
COMPARE_DATA = None
COMPARE_PAGE = None

for root in REPO_ROOTS:
    cd = root / "pages" / "compare-data.ts"
    cp = root / "pages" / "CompareArticlePage.tsx"
    if cd.exists() and cp.exists():
        COMPARE_DATA = cd
        COMPARE_PAGE = cp
        break

if not COMPARE_DATA:
    print(f"{RED}ERROR: Could not find pages/compare-data.ts.{RESET}")
    print("Run this script from the repo root (same folder as package.json).")
    sys.exit(1)

info(f"Repo root  : {COMPARE_DATA.parent.parent}")
info(f"compare-data.ts : {COMPARE_DATA}")
info(f"CompareArticlePage.tsx : {COMPARE_PAGE}")


# ═══════════════════════════════════════════════════════════════════════════════
# W3-T3  Code Validation
# ═══════════════════════════════════════════════════════════════════════════════
head("W3-T3 — Add 'Last Verified' Dates to All Compare Pages")
rule()

cd_text = COMPARE_DATA.read_text(encoding="utf-8")
cp_text = COMPARE_PAGE.read_text(encoding="utf-8")

total_checks = 0
passed_checks = 0

def check(condition, pass_msg, fail_msg):
    global total_checks, passed_checks
    total_checks += 1
    if condition:
        passed_checks += 1
        ok(pass_msg)
    else:
        fail(fail_msg)
    return condition


# ── 1. Interface definition ───────────────────────────────────────────────────
print(f"\n{CYAN}[1] Interface — lastUpdated field added to CompareArticle{RESET}")

has_interface_field = bool(re.search(
    r'lastUpdated\s*\??\s*:\s*string',
    cd_text
))
check(
    has_interface_field,
    "lastUpdated?: string  present in CompareArticle interface",
    "lastUpdated field MISSING from CompareArticle interface"
)

is_optional = bool(re.search(r'lastUpdated\?', cd_text))
check(
    is_optional,
    "Field is optional (lastUpdated?) — TypeScript safe",
    "Field is NOT optional — will break TypeScript if any entry is missing it"
)


# ── 2. All entries have lastUpdated ──────────────────────────────────────────
print(f"\n{CYAN}[2] Data entries — lastUpdated: 'May 2026' on all compare articles{RESET}")

slugs = re.findall(r"slug:\s*'([^']+)'", cd_text)
total_articles = len(slugs)
info(f"Found {total_articles} compare articles")

# For each slug, check the block after it contains lastUpdated
slug_pattern = re.compile(
    r"slug:\s*'([^']+)'.*?(?=slug:\s*'|\Z)",
    re.DOTALL
)
blocks = slug_pattern.findall(cd_text)

missing_lastUpdated = []
wrong_date          = []

for slug in slugs:
    # Extract the article block between this slug and the next
    pattern = rf"slug:\s*'{re.escape(slug)}'(.*?)(?=\{{\s*slug:|$)"
    match = re.search(pattern, cd_text, re.DOTALL)
    if match:
        block = match.group(1)
        if "lastUpdated" not in block:
            missing_lastUpdated.append(slug)
        elif "May 2026" not in block:
            wrong_date.append(slug)

if not missing_lastUpdated:
    check(True,
          f"All {total_articles} articles have lastUpdated field",
          "")
else:
    check(False,
          "",
          f"{len(missing_lastUpdated)} article(s) MISSING lastUpdated:\n"
          + "\n".join(f"       • {s}" for s in missing_lastUpdated))

if not wrong_date:
    check(True,
          "All lastUpdated values set to 'May 2026'",
          "")
else:
    check(False,
          "",
          f"{len(wrong_date)} article(s) have wrong date in lastUpdated:\n"
          + "\n".join(f"       • {s}" for s in wrong_date))


# ── 3. Top-5 meta descriptions updated ───────────────────────────────────────
print(f"\n{CYAN}[3] Meta descriptions — 'Updated May 2026' on top-5 compare pages{RESET}")

TARGET_SLUGS = [
    "rytr-vs-writesonic",
    "grammarly-vs-quillbot",
    "grammarly-vs-writesonic",
    "taskade-vs-notion",
    "writesonic-vs-jasper",
]

for slug in TARGET_SLUGS:
    # Extract block for this slug
    pattern = rf"slug:\s*'{re.escape(slug)}'(.*?)(?=\{{\s*slug:|$)"
    match = re.search(pattern, cd_text, re.DOTALL)
    if match:
        block = match.group(1)
        meta_match = re.search(r"metaDescription:\s*'([^']*)'", block)
        if meta_match:
            meta = meta_match.group(1)
            has_tag = "Updated May 2026" in meta
            # Also check description length (Google shows ~155-158 chars)
            length = len(meta)
            length_note = f"{length} chars"
            if length > 160:
                length_note = f"{RED}{length} chars — too long!{RESET}"
            elif length < 140:
                length_note = f"{YELLOW}{length} chars — could be longer{RESET}"
            else:
                length_note = f"{GREEN}{length} chars ✓{RESET}"

            check(
                has_tag,
                f"{slug}  [{length_note}]",
                f"{slug} — 'Updated May 2026' tag MISSING  [{length_note}]"
            )
        else:
            check(False, "", f"{slug} — metaDescription field not found")
    else:
        check(False, "", f"{slug} — article block not found in file")


# ── 4. CompareArticlePage renders lastUpdated ─────────────────────────────────
print(f"\n{CYAN}[4] CompareArticlePage.tsx — renders lastUpdated with publishDate fallback{RESET}")

uses_lastUpdated = bool(re.search(
    r'article\.lastUpdated',
    cp_text
))
check(
    uses_lastUpdated,
    "CompareArticlePage uses article.lastUpdated",
    "CompareArticlePage still uses article.publishDate only — fix not applied"
)

has_fallback = bool(re.search(
    r'article\.lastUpdated\s*\?\?\s*article\.publishDate',
    cp_text
))
check(
    has_fallback,
    "Nullish coalescing fallback present (?? article.publishDate)",
    "No fallback to publishDate — may break older entries"
)

# Check the full rendered line for context
render_match = re.search(r'.{0,40}article\.lastUpdated.{0,40}', cp_text)
if render_match:
    info(f"Render line: {render_match.group(0).strip()}")


# ═══════════════════════════════════════════════════════════════════════════════
# W3-T1  Directory Submissions  (manual — site reachability check)
# ═══════════════════════════════════════════════════════════════════════════════
head("W3-T1 — 10 Directory Submissions (External / Manual Task)")
rule()

print(f"\n{CYAN}[5] Live site reachability — ainexustools.online{RESET}")

SITE_URL = "https://ainexustools.online"
try:
    req = urllib.request.Request(
        SITE_URL,
        headers={"User-Agent": "Mozilla/5.0 (validator bot)"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        status = resp.status
    check(status == 200,
          f"Site is live — HTTP {status}",
          f"Site returned HTTP {status}")
except urllib.error.HTTPError as e:
    check(False, "", f"HTTP error {e.code} reaching {SITE_URL}")
except Exception as e:
    warn(f"Could not reach {SITE_URL} ({type(e).__name__}: {e})")
    warn("This is OK if running locally without internet access.")
    total_checks += 1  # count but don't penalise

print(f"\n{CYAN}[6] Directory submission tracker{RESET}")
DIRECTORIES = [
    ("Hacker News",          "https://news.ycombinator.com",       "DA 93"),
    ("Product Hunt",         "https://www.producthunt.com",        "DA 90"),
    ("AlternativeTo",        "https://alternativeto.net",          "DA 83"),
    ("IndieHackers",         "https://www.indiehackers.com",       "DA 73"),
    ("Futurepedia",          "https://www.futurepedia.io",         "DA 71"),
    ("BetaList",             "https://betalist.com",               "DA 68"),
    ("There's An AI For That","https://theresanaiforthat.com",     "DA 62"),
    ("BetaPage",             "https://betapage.co",                "DA 56"),
    ("AI Tools Directory",   "https://aitools-directory.com",      "DA 52"),
    ("Toolify.ai",           "https://toolify.ai",                 "DA 48"),
]
warn("This task requires MANUAL submissions — it cannot be automated.")
warn("Check each directory below and mark as done once submitted:\n")
print(f"  {'#':<3} {'Directory':<28} {'Auth':<8} {'Status'}")
print(f"  {'-'*3} {'-'*28} {'-'*8} {'-'*20}")
for i, (name, url, da) in enumerate(DIRECTORIES, 1):
    print(f"  {i:<3} {name:<28} {da:<8} {'[ ] Pending submission'}")
print()
info("Submit ainexustools.online homepage + 2 best India blog post URLs.")
info("Estimated time: 12 min per directory · 2 hrs total.")


# ═══════════════════════════════════════════════════════════════════════════════
# W3-T2  LinkedIn  (skipped by user)
# ═══════════════════════════════════════════════════════════════════════════════
head("W3-T2 — LinkedIn Posting (Skipped by user decision)")
rule()
warn("User has chosen NOT to post on LinkedIn.")
warn("EEAT impact: +4 pts authoritativeness foregone.")
info("Alternative: Quora answers + blog posts on other platforms (IndieHackers,")
info("             Dev.to, Medium) can partially substitute — linked to W3-T1.")


# ═══════════════════════════════════════════════════════════════════════════════
# Final Summary
# ═══════════════════════════════════════════════════════════════════════════════
head("Week 3 — Final Validation Summary")
rule()

score_pct = int((passed_checks / total_checks) * 100) if total_checks else 0
colour    = GREEN if score_pct == 100 else (YELLOW if score_pct >= 70 else RED)

print(f"\n  Code checks  : {colour}{passed_checks}/{total_checks} passed ({score_pct}%){RESET}")
print()

TASK_SUMMARY = [
    ("W3-T1", "10 Directory Submissions",                  "MANUAL",  YELLOW),
    ("W3-T2", "LinkedIn Posting",                          "SKIPPED", DIM),
    ("W3-T3", "Last Verified dates on all compare pages",
     "DONE ✔" if passed_checks == total_checks else "PARTIAL", 
     GREEN if passed_checks == total_checks else YELLOW),
]

print(f"  {'Task':<8} {'Description':<42} {'Status'}")
print(f"  {'-'*8} {'-'*42} {'-'*12}")
for tid, desc, status, col in TASK_SUMMARY:
    print(f"  {col}{tid:<8}{RESET} {desc:<42} {col}{status}{RESET}")

print()
if passed_checks == total_checks:
    print(f"  {GREEN}{BOLD}W3-T3 fully validated. Deploy compare-data.ts + CompareArticlePage.tsx.{RESET}")
else:
    print(f"  {YELLOW}Fix the failures above, then re-run this script.{RESET}")

rule()
print(f"  {DIM}AI Nexus · Audit V2 · May 2026{RESET}\n")
