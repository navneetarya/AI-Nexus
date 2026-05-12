"""
validate_week4_fixes.py
========================
Validates every Week 4 code change made to AI Nexus.

Run from the ROOT of your repo:
    python validate_week4_fixes.py

Each check prints PASS / FAIL with a clear reason.
Exit code 0 = all passed. Exit code 1 = one or more failed.
"""

import os
import sys
import re

# ─── Colour helpers ───────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

def pass_(label):  print(f"  {GREEN}✔ PASS{RESET}  {label}")
def fail_(label):  print(f"  {RED}✗ FAIL{RESET}  {label}")
def warn_(label):  print(f"  {YELLOW}⚠ WARN{RESET}  {label}")
def head_(label):  print(f"\n{BOLD}{CYAN}{label}{RESET}")

# ─── File loader ──────────────────────────────────────────────────────────────
def read(path):
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return f.read()

# ─── Core assertion helpers ───────────────────────────────────────────────────
failures = []

def check(condition, pass_msg, fail_msg):
    if condition:
        pass_(pass_msg)
    else:
        fail_(fail_msg)
        failures.append(fail_msg)

def has(content, substring, pass_msg, fail_msg):
    check(substring in content, pass_msg, fail_msg)

def not_has(content, substring, pass_msg, fail_msg):
    check(substring not in content, pass_msg, fail_msg)

def file_exists(path):
    ok = os.path.exists(path)
    check(ok, f"File exists: {path}", f"File NOT found: {path}")
    return ok

# ═════════════════════════════════════════════════════════════════════════════
# FILE PATHS  (relative to repo root)
# ═════════════════════════════════════════════════════════════════════════════
TOOL_PAGE    = "pages/ToolPage.tsx"
BEEHIIV_FORM = "components/BeehiivForm.tsx"
APP          = "App.tsx"

# ═════════════════════════════════════════════════════════════════════════════
# TASK 19 — "Independently reviewed" badge in ToolPage hero
# ═════════════════════════════════════════════════════════════════════════════
head_("TASK 19 · ToolPage.tsx — 'Independently reviewed' badge")

tp = read(TOOL_PAGE)
if tp is None:
    fail_(f"{TOOL_PAGE} not found — skipping Task 19 checks")
    failures.append(f"{TOOL_PAGE} missing")
else:
    # ── New badge 1: top metadata row ─────────────────────────────────────────
    has(tp,
        "🔍 Independently reviewed —",
        "Hero badge contains '🔍 Independently reviewed —'",
        "Hero badge missing '🔍 Independently reviewed —' (still says 'Last verified'?)")

    has(tp,
        "· 8 min read",
        "Hero badge includes read-time '· 8 min read'",
        "Hero badge missing read-time '· 8 min read'")

    # ── New badge 2: green check tag ──────────────────────────────────────────
    has(tp,
        "Independently reviewed — {content.lastTested} · Navneet Arya, AI Nexus",
        "Green check tag shows 'Independently reviewed … Navneet Arya, AI Nexus'",
        "Green check tag missing updated text (still says 'Last tested'?)")

    # ── Old strings must be gone ──────────────────────────────────────────────
    not_has(tp,
        "Last verified:",
        "Old 'Last verified:' text removed from hero badge",
        "Old 'Last verified:' text still present — badge not updated")

    not_has(tp,
        "Last tested:",
        "Old 'Last tested:' text removed from green check tag",
        "Old 'Last tested:' text still present — green check tag not updated")

    # ── Calendar icon removed from badge (optional but cleaner) ──────────────
    # Badge line should NOT have <Calendar … /> alongside the new emoji text
    badge_lines = [l for l in tp.splitlines() if "Independently reviewed —" in l]
    for bl in badge_lines:
        check("<Calendar" not in bl,
              "Calendar icon not mixed with new emoji badge",
              "Calendar icon still present alongside new 'Independently reviewed' badge")

# ═════════════════════════════════════════════════════════════════════════════
# TASK 21a — Newsletter form injected in ToolPage (below verdict section)
# ═════════════════════════════════════════════════════════════════════════════
head_("TASK 21a · ToolPage.tsx — Newsletter form below verdict")

if tp is None:
    fail_(f"{TOOL_PAGE} not found — skipping Task 21a checks")
else:
    # Import must exist
    has(tp,
        "import { BeehiivForm } from '../components/BeehiivForm'",
        "BeehiivForm imported in ToolPage",
        "BeehiivForm import missing from ToolPage — form won't render")

    # Component must be used
    has(tp,
        "<BeehiivForm variant=\"article\"",
        "<BeehiivForm variant=\"article\" /> present in ToolPage JSX",
        "<BeehiivForm variant=\"article\" /> missing — newsletter not rendered on tool pages")

    # Placement: must come AFTER the verdict section
    verdict_idx  = tp.find('aria-label="Quick Verdict"')
    beehiiv_idx  = tp.find('<BeehiivForm variant="article"')
    check(verdict_idx != -1 and beehiiv_idx != -1 and beehiiv_idx > verdict_idx,
          "Newsletter form placed AFTER the verdict section",
          "Newsletter form placement incorrect — must come after the Quick Verdict section")

# ═════════════════════════════════════════════════════════════════════════════
# TASK 21b — BeehiivForm.tsx CTA text updated
# ═════════════════════════════════════════════════════════════════════════════
head_("TASK 21b · BeehiivForm.tsx — CTA text updated")

bf = read(BEEHIIV_FORM)
if bf is None:
    fail_(f"{BEEHIIV_FORM} not found — skipping Task 21b checks")
    failures.append(f"{BEEHIIV_FORM} missing")
else:
    # HeroStrip new headline
    has(bf,
        "3 best new AI tools — every Friday",
        "HeroStrip headline updated to '3 best new AI tools — every Friday'",
        "HeroStrip headline not updated (still says 'New AI tool reviews'?)")

    # ArticleCard new headline
    has(bf,
        "Get the 3 best new AI tools every Friday",
        "ArticleCard headline updated to 'Get the 3 best new AI tools every Friday'",
        "ArticleCard headline not updated (still says 'Found this useful?'?)")

    # Sub-copy mentions Navneet Arya + 200+ readers
    has(bf,
        "Independently researched by Navneet Arya",
        "Sub-copy contains 'Independently researched by Navneet Arya'",
        "Sub-copy missing 'Independently researched by Navneet Arya'")

    has(bf,
        "200+ readers",
        "Sub-copy contains subscriber count '200+ readers'",
        "Sub-copy missing subscriber count — add a real number for social proof")

    # Old generic copy must be gone
    not_has(bf,
        "New AI tool reviews",
        "Old 'New AI tool reviews' headline removed from HeroStrip",
        "Old 'New AI tool reviews' headline still present in HeroStrip")

    not_has(bf,
        "Found this useful?",
        "Old 'Found this useful?' headline removed from ArticleCard",
        "Old 'Found this useful?' headline still present in ArticleCard")

# ═════════════════════════════════════════════════════════════════════════════
# TASK 21c — BeehiivForm.tsx StickyNewsletterBar component
# ═════════════════════════════════════════════════════════════════════════════
head_("TASK 21c · BeehiivForm.tsx — StickyNewsletterBar component")

if bf is None:
    fail_(f"{BEEHIIV_FORM} not found — skipping Task 21c checks")
else:
    has(bf,
        "export function StickyNewsletterBar()",
        "StickyNewsletterBar exported from BeehiivForm.tsx",
        "StickyNewsletterBar function not found — sticky mobile bar missing")

    has(bf,
        "position: 'fixed'",
        "Sticky bar uses position:fixed",
        "Sticky bar missing position:fixed — it won't stick to the bottom")

    has(bf,
        "bottom: 0",
        "Sticky bar anchored to bottom:0",
        "Sticky bar missing bottom:0 — won't appear at screen bottom")

    # Mobile-only via media query
    has(bf,
        "min-width: 641px",
        "Mobile-only CSS: hidden at ≥641px via media query",
        "Missing media query to hide bar on desktop (min-width: 641px)")

    # Dismiss button
    has(bf,
        "setDismissed(true)",
        "Dismiss button calls setDismissed(true)",
        "Dismiss logic missing — users can't close the sticky bar")

    # Animation
    has(bf,
        "slideUp",
        "Slide-up animation defined for sticky bar",
        "slideUp animation missing — bar appears without transition")

    # Notion form wiring (same WORKER_URL used)
    has(bf,
        "WORKER_URL",
        "Sticky bar reuses existing WORKER_URL for Notion form submission",
        "WORKER_URL not referenced — sticky bar won't submit to Notion")

# ═════════════════════════════════════════════════════════════════════════════
# TASK 21d — App.tsx mounts StickyNewsletterBar globally
# ═════════════════════════════════════════════════════════════════════════════
head_("TASK 21d · App.tsx — StickyNewsletterBar mounted globally")

ap = read(APP)
if ap is None:
    fail_(f"{APP} not found — skipping Task 21d checks")
    failures.append(f"{APP} missing")
else:
    has(ap,
        "import { StickyNewsletterBar } from './components/BeehiivForm'",
        "StickyNewsletterBar imported in App.tsx",
        "StickyNewsletterBar import missing from App.tsx")

    has(ap,
        "<StickyNewsletterBar />",
        "<StickyNewsletterBar /> rendered in App.tsx",
        "<StickyNewsletterBar /> not rendered — sticky bar won't show on any page")

    has(ap,
        "AppWithStickyBar",
        "AppWithStickyBar wrapper function present",
        "AppWithStickyBar wrapper missing — sticky bar not wired to default export")

    has(ap,
        "export default AppWithStickyBar",
        "AppWithStickyBar is the default export",
        "Default export is not AppWithStickyBar — sticky bar will never mount")

    not_has(ap,
        "export default App;",
        "Old 'export default App' replaced by AppWithStickyBar",
        "Old 'export default App' still present — sticky bar export not wired up")

# ═════════════════════════════════════════════════════════════════════════════
# TASK 20 — Glossary (informational, no code change expected)
# ═════════════════════════════════════════════════════════════════════════════
head_("TASK 20 · GlossaryPage.tsx — 25+ terms + DefinedTerm schema (pre-existing)")

GLOSSARY = "pages/GlossaryPage.tsx"
gp = read(GLOSSARY)
if gp is None:
    warn_(f"{GLOSSARY} not found — skipping Task 20 checks")
else:
    term_count = len(re.findall(r"\{ term:", gp))
    check(term_count >= 25,
          f"Glossary has {term_count} terms (≥25 required)",
          f"Glossary only has {term_count} terms — need at least 25")

    has(gp,
        '"@type": "DefinedTermSet"',
        'DefinedTermSet schema present in GlossaryPage',
        'DefinedTermSet schema missing — add JSON-LD schema for AEO')

    # Check 4 of the 8 priority AEO terms from the audit
    priority_terms = [
        ("prompt engineering", "what is prompt engineering"),
        ("LLM",                "what is an LLM"),
        ("hallucination",      "what is AI hallucination"),
        ("RAG",                "what is RAG"),
    ]
    for term, query in priority_terms:
        has(gp, term,
            f"Priority AEO term present: '{query}'",
            f"Priority AEO term MISSING: '{query}' — add it for featured snippet coverage")

# ═════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═════════════════════════════════════════════════════════════════════════════
total_checks = 0  # counted implicitly via failures list
print(f"\n{'═'*60}")
if not failures:
    print(f"{GREEN}{BOLD}  ALL CHECKS PASSED ✔{RESET}")
    print(f"  Week 4 fixes are correctly deployed.\n")
    sys.exit(0)
else:
    print(f"{RED}{BOLD}  {len(failures)} CHECK(S) FAILED{RESET}")
    print(f"\n  Failed checks:")
    for i, f in enumerate(failures, 1):
        print(f"  {i}. {f}")
    print()
    sys.exit(1)
