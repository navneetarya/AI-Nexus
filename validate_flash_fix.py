"""
validate_flash_fix.py
=====================
Python 3.12.4 — validates the landing-page flash fix in index.html.

Run from the project root:
    python validate_flash_fix.py

Exit code 0 = all checks passed.
Exit code 1 = one or more checks failed.
"""

import sys
import re
from html.parser import HTMLParser
from pathlib import Path

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
    if detail: msg += f"  {CYAN}({detail}){RESET}"
    print(msg); passed.append(label)

def fail(label: str, detail: str = "") -> None:
    msg = f"  {RED}✗{RESET} {label}"
    if detail: msg += f"  {YELLOW}→ {detail}{RESET}"
    print(msg); failed.append(label)

def section(title: str) -> None:
    print(f"\n{BOLD}{CYAN}{'─'*60}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'─'*60}{RESET}")

# ── Locate project root ───────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR
for _ in range(4):
    if (ROOT / "index.html").exists() and (ROOT / "pages").is_dir():
        break
    ROOT = ROOT.parent
else:
    print(f"{RED}ERROR: Cannot find project root (index.html + pages/ expected).{RESET}")
    sys.exit(1)

INDEX = ROOT / "index.html"
src   = INDEX.read_text(encoding="utf-8")

print(f"\n{BOLD}AI Nexus — Landing Page Flash Fix Validation{RESET}")
print(f"Project root : {ROOT}")
print(f"Python       : {sys.version}")

# ═════════════════════════════════════════════════════════════════════════════
# CHECK 1 — HTML tag balance
# ═════════════════════════════════════════════════════════════════════════════
section("CHECK 1 · HTML structure — no broken tags")

class TagChecker(HTMLParser):
    VOID = {'area','base','br','col','embed','hr','img','input',
            'link','meta','param','source','track','wbr'}
    def __init__(self):
        super().__init__()
        self.stack: list[str] = []
        self.errors: list[str] = []
    def handle_starttag(self, tag, attrs):
        if tag not in self.VOID:
            self.stack.append(tag)
    def handle_endtag(self, tag):
        if tag in self.VOID: return
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
        else:
            self.errors.append(f"Unexpected </{tag}> — stack tail: {self.stack[-3:]}")

checker = TagChecker()
checker.feed(src)
if checker.errors:
    for e in checker.errors[:5]:
        fail("HTML tag balance", e)
elif checker.stack:
    fail("HTML tag balance", f"Unclosed tags: {checker.stack[-5:]}")
else:
    ok("HTML tag balance — no broken tags")

# ═════════════════════════════════════════════════════════════════════════════
# CHECK 2 — Old static shell is gone
# ═════════════════════════════════════════════════════════════════════════════
section("CHECK 2 · Old static shell removed")

OLD_SHELL_MARKERS = [
    ("Old centered H1 text gone",    "Deep-Researched AI Tool Reviews"),
    ("Old subtitle text gone",       "Research-backed comparisons so you don't have to"),
    ("Old narrow hero div gone",     "padding:72px 24px 48px;text-align:center"),
]
for label, needle in OLD_SHELL_MARKERS:
    (ok if needle not in src else fail)(label)

# ═════════════════════════════════════════════════════════════════════════════
# CHECK 3 — New skeleton shell present
# ═════════════════════════════════════════════════════════════════════════════
section("CHECK 3 · New skeleton shell present")

SKELETON_MARKERS = [
    ("skeleton class used",                    'class="skeleton"'),
    ("Hero padding matches React (68px)",      "padding:68px 24px 60px"),
    ("Hero bg matches React (var(--surf))",    "background:var(--surf)"),
    ("Hero border matches React",              "border-bottom:1px solid var(--bar-brd)"),
    ("Radial gradient wash present",           "radial-gradient"),
    ("Author badge skeleton present",          "border-radius:50%"),
    ("Card grid skeleton present",             "grid-template-columns:repeat(auto-fill,minmax(300px,1fr))"),
    ("Card gap matches React (14px)",          "gap:14px"),
    ("Filter tabs skeleton present",           "border-radius:100px"),
    ("Search bar skeleton present",            "height:44px;border-radius:12px"),
    ("max-width matches React (1200px)",       "max-width:1200px"),
]
for label, needle in SKELETON_MARKERS:
    (ok if needle in src else fail)(label)

# ── Count skeleton elements ───────────────────────────────────────────────────
sk_count = src.count('class="skeleton"')
if sk_count >= 20:
    ok(f"Sufficient skeleton elements", f"{sk_count} found")
else:
    fail(f"Sufficient skeleton elements", f"{sk_count} found, expected ≥20")

# ── At least 6 card skeletons ────────────────────────────────────────────────
card_skeletons = len(re.findall(r'border-radius:16px', src))
if card_skeletons >= 6:
    ok(f"Card skeletons ≥ 6", f"{card_skeletons} found")
else:
    fail(f"Card skeletons ≥ 6", f"{card_skeletons} found")

# ── Filter tab pills — 9 categories ──────────────────────────────────────────
tab_skeletons = len(re.findall(r'height:34px;border-radius:100px', src))
if tab_skeletons >= 9:
    ok(f"Category tab skeletons ≥ 9", f"{tab_skeletons} found")
else:
    fail(f"Category tab skeletons ≥ 9", f"{tab_skeletons} found, expected 9")

# ═════════════════════════════════════════════════════════════════════════════
# CHECK 4 — Critical pre-existing elements preserved
# ═════════════════════════════════════════════════════════════════════════════
section("CHECK 4 · Critical pre-existing elements preserved")

PRESERVED = [
    ("Theme init script (prevents dark-mode flash)",  "ainexus-theme"),
    ("Fraunces font preload",                         "Fraunces"),
    ("Inter font-face declarations",                  "inter-v20-latin-regular"),
    ("CSS custom property tokens",                    "--a1:"),
    ("Skeleton shimmer keyframes",                    "@keyframes shimmer"),
    ("Dark mode tokens",                              "data-theme=\"dark\""),
    ("GA4 deferred loader",                           "G-9M7R4GGEEK"),
    ("SPA routing script (GitHub Pages)",             "p="),
    ("React entry point",                             'src="/index.tsx"'),
    ("Canonical URL",                                 "canonical"),
    ("OG image tag",                                  "og:image"),
    ("#root div present",                             'id="root"'),
    ("Nav logo SVG intact",                           "M12 28V12h4l4 10"),
    ("AI Nexus brand name in nav",                    "AI Nexus"),
]
for label, needle in PRESERVED:
    (ok if needle in src else fail)(label)

# ═════════════════════════════════════════════════════════════════════════════
# CHECK 5 — No inline scripts that could block paint
# ═════════════════════════════════════════════════════════════════════════════
section("CHECK 5 · No render-blocking additions in shell")

# The theme init script must stay (prevents dark flash) but must be tiny
theme_scripts = re.findall(r'<script>\s*\(function\(\)[^<]+ainexus-theme[^<]+\)\(\)', src, re.DOTALL)
if theme_scripts:
    ok("Theme init script present and inline (correct — must be sync)")
else:
    fail("Theme init script", "missing or altered — dark mode flash will return")

# No new synchronous external scripts added to <head>
blocking = re.findall(r'<script\s+src=(?!.*async|.*defer)[^>]+>', src)
# filter out known allowed ones
blocking = [b for b in blocking if 'index.tsx' not in b and 'gtag' not in b]
if not blocking:
    ok("No new render-blocking external scripts")
else:
    fail("Render-blocking scripts found", str(blocking[:3]))

# ═════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═════════════════════════════════════════════════════════════════════════════
total = len(passed) + len(failed)
print(f"\n{BOLD}{'═'*60}{RESET}")
print(f"{BOLD}  RESULTS: {GREEN}{len(passed)} passed{RESET}{BOLD}  ·  {RED}{len(failed)} failed{RESET}{BOLD}  ·  {total} total{RESET}")
print(f"{BOLD}{'═'*60}{RESET}")

if failed:
    print(f"\n{YELLOW}  Failed checks:{RESET}")
    for f in failed:
        print(f"    {RED}✗{RESET} {f}")
    print()
    sys.exit(1)
else:
    print(f"\n  {GREEN}Landing page flash fix verified — all checks passed.{RESET}\n")
    sys.exit(0)
