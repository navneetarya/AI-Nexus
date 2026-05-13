#!/usr/bin/env python3
"""
AI Nexus — Week 2 Fix Validator
Python 3.12.4 compatible
Validates every change made in the Week 2 implementation sprint.
Run from any directory: python3 validate_week2.py
"""

import sys
import re
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

# ── Colour helpers ─────────────────────────────────────────────────────────────
RESET  = "\033[0m"
BOLD   = "\033[1m"
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
DIM    = "\033[2m"

def ok(msg):   return f"  {GREEN}✓{RESET}  {msg}"
def fail(msg): return f"  {RED}✗{RESET}  {BOLD}{msg}{RESET}"
def warn(msg): return f"  {YELLOW}⚠{RESET}  {msg}"
def info(msg): return f"  {CYAN}·{RESET}  {DIM}{msg}{RESET}"


# ── Result tracker ─────────────────────────────────────────────────────────────
@dataclass
class Results:
    passed: int = 0
    failed: int = 0
    warns:  int = 0
    failures: list = field(default_factory=list)

    def record(self, passed, label, detail=""):
        if passed:
            self.passed += 1
            print(ok(label))
        else:
            self.failed += 1
            msg = f"{label}" + (f" — {detail}" if detail else "")
            self.failures.append(msg)
            print(fail(msg))

    def record_warn(self, label):
        self.warns += 1
        print(warn(label))

R = Results()


# ── Project root detection ─────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
CANDIDATES = [
    SCRIPT_DIR / "AI-Nexus-main",
    SCRIPT_DIR,
    Path("/home/claude/AI-Nexus-main"),
    Path("/tmp/AI-Nexus-main"),
]
ROOT: Optional[Path] = None
for c in CANDIDATES:
    if (c / "constants.ts").exists():
        ROOT = c
        break

if ROOT is None:
    print(f"\n{RED}FATAL:{RESET} Could not locate AI-Nexus-main project root.")
    sys.exit(1)

print(f"\n{BOLD}{'═'*62}{RESET}")
print(f"{BOLD}  AI Nexus — Week 2 Fix Validator{RESET}")
print(f"{BOLD}{'═'*62}{RESET}")
print(info(f"Project root : {ROOT}"))
print(info(f"Python       : {sys.version.split()[0]}"))
print()


# ── Helpers ────────────────────────────────────────────────────────────────────
def read(rel):
    """Read file text or return None (recording failure)."""
    p = ROOT / rel
    if not p.exists():
        R.record(False, f"File exists: {rel}", "file not found")
        return None
    return p.read_text(encoding="utf-8")


def extract_nested_block(text, start_marker):
    """
    Find `start_marker` in `text`, then extract the complete {...} block
    that follows it — correctly handling nested braces.
    Returns the block string (including outer braces), or '' if not found.
    """
    idx = text.find(start_marker)
    if idx == -1:
        return ""
    open_idx = text.find("{", idx + len(start_marker))
    if open_idx == -1:
        return ""
    depth = 0
    for i in range(open_idx, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                return text[open_idx : i + 1]
    return ""


# ══════════════════════════════════════════════════════════════════════════════
# W2-T1  researchSources added to QuillBot, PhotoRoom, InVideo AI
# ══════════════════════════════════════════════════════════════════════════════
print(f"{BOLD}W2-T1 — researchSources: QuillBot, PhotoRoom, InVideo AI{RESET}")
print(f"{DIM}{'─'*62}{RESET}")

constants = read("constants.ts")
if constants:
    total_rs = constants.count("researchSources:")
    R.record(total_rs == 8,
             f"Total researchSources blocks = {total_rs} (expected 8)",
             f"found {total_rs}")

    tools_to_check = [
        ("quillbot",  "QuillBot"),
        ("photoroom", "PhotoRoom"),
        ("invideo",   "InVideo AI"),
    ]

    # Pass 1 — quick slug→researchSources check
    for slug, name in tools_to_check:
        pattern = rf"slug:\s*'{slug}'.*?researchSources\s*:"
        found = bool(re.search(pattern, constants, re.DOTALL))
        R.record(found, f"{name} has researchSources block")

    # Pass 2 — deep block structure validation
    required_keys = ["trustpilot", "g2", "reddit", "lastVerified"]
    for slug, name in tools_to_check:
        # Find slug position, then extract its researchSources block
        slug_pos = constants.find(f"slug: '{slug}'")
        if slug_pos == -1:
            R.record(False, f"  {name}: slug marker not found in constants.ts")
            continue

        # Find the next researchSources after this slug
        rs_pos = constants.find("researchSources:", slug_pos)
        if rs_pos == -1:
            R.record(False, f"  {name}: researchSources not found after slug")
            continue

        # Depth-counting block extractor
        block = extract_nested_block(constants, "researchSources:" + constants[rs_pos + len("researchSources:"):rs_pos + len("researchSources:") + 5])
        # Simpler: extract from rs_pos directly
        block = extract_nested_block(constants[rs_pos:], "{")
        if not block:
            block = extract_nested_block(constants, constants[rs_pos : rs_pos + 30])

        # Fallback: grab raw text until next tool entry '  },'
        chunk_start = rs_pos
        chunk_end   = constants.find("\n  },", rs_pos)
        if chunk_end == -1:
            chunk_end = rs_pos + 500
        chunk = constants[chunk_start : chunk_end + 5]

        for key in required_keys:
            R.record(key in chunk,
                     f"  {name}.researchSources has '{key}'")

        # lastVerified ISO-8601
        lv = re.search(r"lastVerified\s*:\s*'(\d{4}-\d{2}-\d{2})'", chunk)
        R.record(bool(lv), f"  {name}.lastVerified is ISO-8601 date",
                 "format should be 'YYYY-MM-DD'")

        # trustpilot rating 1–5
        tp = re.search(r"trustpilot\s*:\s*\{[^}]*rating\s*:\s*([\d.]+)", chunk)
        if tp:
            rating = float(tp.group(1))
            R.record(1.0 <= rating <= 5.0,
                     f"  {name}.trustpilot rating {rating} in valid range 1–5")

        # g2 rating 1–5
        g2 = re.search(r"g2\s*:\s*\{[^}]*rating\s*:\s*([\d.]+)", chunk)
        if g2:
            rating = float(g2.group(1))
            R.record(1.0 <= rating <= 5.0,
                     f"  {name}.g2 rating {rating} in valid range 1–5")

        # trustpilot URL present
        R.record("trustpilot.com/review/" in chunk,
                 f"  {name}.trustpilot has review URL")

        # reddit sentiment is positive
        R.record("Positive" in chunk,
                 f"  {name}.reddit sentiment is 'Positive'")

print()


# ══════════════════════════════════════════════════════════════════════════════
# W2-T2a  India students post registered in blog/index.ts
# ══════════════════════════════════════════════════════════════════════════════
print(f"{BOLD}W2-T2a — India students post registered in blog/index.ts{RESET}")
print(f"{DIM}{'─'*62}{RESET}")

blog_index = read("blog/index.ts")
if blog_index:
    slug_file = "best-free-ai-tools-for-students-in-india-2026"

    has_import = slug_file in blog_index
    R.record(has_import, f"Import line for '{slug_file}' exists")

    m_var = re.search(rf"import\s+(post\d+)\s+from\s+'\./{slug_file}'", blog_index)
    if m_var:
        var_name = m_var.group(1)
        R.record(True, f"Imported as '{var_name}'")
        array_match = re.search(r"BLOG_POSTS\s*:\s*BlogPost\[\]\s*=\s*\[([^\]]+)\]",
                                 blog_index, re.DOTALL)
        if array_match:
            R.record(var_name in array_match.group(1),
                     f"'{var_name}' included in BLOG_POSTS array")
        else:
            R.record(False, "BLOG_POSTS array could not be parsed")
    else:
        R.record(False, f"Import variable for '{slug_file}' not found")

    src = ROOT / "blog" / f"{slug_file}.ts"
    R.record(src.exists(), f"Source file '{slug_file}.ts' exists on disk")

print()


# ══════════════════════════════════════════════════════════════════════════════
# W2-T2b  India hub post → both sub-posts
# ══════════════════════════════════════════════════════════════════════════════
print(f"{BOLD}W2-T2b — India hub post hub→spoke interlinking{RESET}")
print(f"{DIM}{'─'*62}{RESET}")

india_hub = read("blog/best-ai-tools-in-india-2026.ts")
if india_hub:
    spoke_links = [
        ("/blog/best-free-ai-tools-for-students-in-india-2026", "Students sub-post"),
        ("/blog/best-ai-tools-for-freelancers-india-2026",      "Freelancers sub-post"),
    ]
    for href, label in spoke_links:
        R.record(href in india_hub, f"Hub contains {label} link: {href}")
        R.record(bool(re.search(rf'href\s*=\s*"?{re.escape(href)}"?', india_hub)),
                 f"  {label} uses href attribute")

    # Anchor text is descriptive — allow style/other attrs between href and >
    anchors = re.findall(r'href="[^"]*"[^>]*>([^<]+)</a>', india_hub)
    india_anchors = [a for a in anchors if any(
        w in a.lower() for w in ["india", "student", "freelanc"])]
    R.record(len(india_anchors) >= 2,
             f"  At least 2 descriptive India-context anchor texts found ({len(india_anchors)})")

print()


# ══════════════════════════════════════════════════════════════════════════════
# W2-T2c  Beginners post → India students link
# ══════════════════════════════════════════════════════════════════════════════
print(f"{BOLD}W2-T2c — Beginners post → India students link{RESET}")
print(f"{DIM}{'─'*62}{RESET}")

beginners = read("blog/best-ai-writing-tools-for-beginners-2026.ts")
if beginners:
    target = "/blog/best-free-ai-tools-for-students-in-india-2026"
    R.record(target in beginners, "Link to India students post present")
    R.record(bool(re.search(rf'href="?{re.escape(target)}"?', beginners)),
             "Link uses href attribute")
    idx = beginners.find(target)
    if idx != -1:
        snippet = beginners[max(0, idx - 200) : idx + 200]
        R.record("India" in snippet or "india" in snippet,
                 "India keyword present near the link")
        R.record("free" in snippet.lower(),
                 "Free-plan messaging present near the link")

print()


# ══════════════════════════════════════════════════════════════════════════════
# W2-T2d  Freelancers post → India freelancers link
# ══════════════════════════════════════════════════════════════════════════════
print(f"{BOLD}W2-T2d — Freelancers post → India freelancers link{RESET}")
print(f"{DIM}{'─'*62}{RESET}")

freelancers = read("blog/best-ai-tools-for-freelancers-2026.ts")
if freelancers:
    target = "/blog/best-ai-tools-for-freelancers-india-2026"
    R.record(target in freelancers, "Link to India freelancers post present")
    R.record(bool(re.search(rf'href="?{re.escape(target)}"?', freelancers)),
             "Link uses href attribute")
    idx = freelancers.find(target)
    if idx != -1:
        snippet = freelancers[max(0, idx - 200) : idx + 200]
        R.record("India" in snippet or "INR" in snippet,
                 "India/INR keyword present near the link")
        R.record("freelanc" in snippet.lower(),
                 "Freelancer context present near the link")

print()


# ══════════════════════════════════════════════════════════════════════════════
# W2-T3  Compare links regression check
# ══════════════════════════════════════════════════════════════════════════════
print(f"{BOLD}W2-T3 — Compare page links in blog posts (regression check){RESET}")
print(f"{DIM}{'─'*62}{RESET}")

compare_checks = [
    ("blog/best-grammarly-alternatives.ts",
     ["/compare/grammarly-vs-quillbot", "/compare/grammarly-vs-writesonic"],
     "Grammarly alternatives"),
    ("blog/best-ai-writing-tools-for-beginners-2026.ts",
     ["/compare/rytr-vs-writesonic"],
     "Writing beginners"),
    ("blog/best-ai-podcast-tools-2026.ts",
     ["/compare/podcastle-vs-descript"],
     "Podcast tools"),
    ("blog/best-ai-marketing-tools-2026.ts",
     ["/compare/ocoya-vs-buffer-vs-hootsuite"],
     "Marketing tools"),
    ("blog/best-ai-tools-for-freelancers-2026.ts",
     ["/compare/taskade-vs-notion", "/compare/taskade-vs-asana"],
     "Freelancers"),
]
for file_rel, links, label in compare_checks:
    content = read(file_rel)
    if content:
        for link in links:
            R.record(link in content, f"{label}: contains '{link}'")

print()


# ══════════════════════════════════════════════════════════════════════════════
# W2-T4a  Grammarly vs Writesonic meta
# ══════════════════════════════════════════════════════════════════════════════
print(f"{BOLD}W2-T4a — Meta: grammarly-vs-writesonic  (GSC pos 7.78){RESET}")
print(f"{DIM}{'─'*62}{RESET}")

compare_data = read("pages/compare-data.ts")
if compare_data:
    m = re.search(
        r"slug:\s*'grammarly-vs-writesonic'.*?metaDescription:\s*'((?:[^'\\]|\\.)*)'",
        compare_data, re.DOTALL
    )
    if m:
        meta = m.group(1).replace("\\'", "'")
        print(info(f"Meta ({len(meta)} chars): {meta}"))
        R.record(120 <= len(meta) <= 160,
                 f"Meta length {len(meta)} chars in target 120–160",
                 f"got {len(meta)}")
        R.record("freelancers, bloggers, and content creators" not in meta,
                 "Old boilerplate removed")
        contrast = any(w in meta.lower() for w in
                       ["fixes", "generates", "different", "honest", "tested", "verdict"])
        R.record(contrast, "Meta contains contrast/action signal word")
        kw = meta.lower().count("grammarly") + meta.lower().count("writesonic")
        R.record(kw <= 2, f"Keyword density OK (grammarly+writesonic = {kw}x)")
    else:
        R.record(False, "grammarly-vs-writesonic metaDescription not found")

print()


# ══════════════════════════════════════════════════════════════════════════════
# W2-T4b  Replit vs GitHub Copilot meta
# ══════════════════════════════════════════════════════════════════════════════
print(f"{BOLD}W2-T4b — Meta: replit-vs-github-copilot  (GSC pos 9.67){RESET}")
print(f"{DIM}{'─'*62}{RESET}")

if compare_data:
    m = re.search(
        r"slug:\s*'replit-vs-github-copilot'.*?metaDescription:\s*'((?:[^'\\]|\\.)*)'",
        compare_data, re.DOTALL
    )
    if m:
        meta = m.group(1).replace("\\'", "'")
        print(info(f"Meta ({len(meta)} chars): {meta}"))
        R.record(120 <= len(meta) <= 160,
                 f"Meta length {len(meta)} chars in target 120–160",
                 f"got {len(meta)}")
        R.record("compared for beginners and developers" not in meta,
                 "Old boilerplate removed")
        diff = any(w in meta.lower() for w in
                   ["different", "builds", "whole", "autocomplete",
                    "vs code", "environment", "need"])
        R.record(diff, "Meta communicates tool differentiation")
        kw = meta.lower().count("replit") + meta.lower().count("copilot")
        R.record(kw <= 2, f"Keyword density OK (replit+copilot = {kw}x)")
    else:
        R.record(False, "replit-vs-github-copilot metaDescription not found")

print()


# ══════════════════════════════════════════════════════════════════════════════
# W2-T4c  AI Tools for Teachers meta
# ══════════════════════════════════════════════════════════════════════════════
print(f"{BOLD}W2-T4c — Meta: ai-tools-for-teachers-2026  (GSC pos 2.0 — urgent!){RESET}")
print(f"{DIM}{'─'*62}{RESET}")

teachers = read("blog/ai-tools-for-teachers-2026.ts")
if teachers:
    m = re.search(r"metaDescription\s*:\s*'((?:[^'\\]|\\.)*)'", teachers)
    if m:
        meta = m.group(1).replace("\\'", "'")
        print(info(f"Meta ({len(meta)} chars): {meta}"))
        R.record(120 <= len(meta) <= 160,
                 f"Meta length {len(meta)} chars in target 120–160",
                 f"got {len(meta)}")
        R.record("Gamma, Grammarly, Notion AI, and Rytr compared" not in meta,
                 "Old tool-list boilerplate removed")
        specific = any(w in meta.lower() for w in
                       ["min", "hour", "save", "free", "week",
                        "worksheet", "lesson plan", "feedback", "4 min"])
        R.record(specific, "Meta contains specific result/time claim (CTR hook)")
        teacher_ctx = any(w in meta.lower() for w in
                          ["teacher", "teach", "lesson", "classroom", "worksheet"])
        R.record(teacher_ctx, "Meta retains teacher context keyword")
        R.record(not meta.strip().endswith("2026."),
                 "Meta ends with benefit/action (not flat year)")
    else:
        R.record(False, "ai-tools-for-teachers metaDescription not found")

print()


# ══════════════════════════════════════════════════════════════════════════════
# BONUS — Internal link integrity
# ══════════════════════════════════════════════════════════════════════════════
print(f"{BOLD}BONUS — Internal link integrity check{RESET}")
print(f"{DIM}{'─'*62}{RESET}")

# Build known blog slugs from all .ts files
blog_dir = ROOT / "blog"
known_blog_slugs: set[str] = set()
for ts in blog_dir.glob("*.ts"):
    if ts.name in ("index.ts", "types.ts", "blog-index.ts", "blog_index.ts"):
        continue
    text = ts.read_text(encoding="utf-8")
    sm = re.search(r"slug\s*:\s*'([^']+)'", text)
    if sm:
        known_blog_slugs.add(sm.group(1))

new_hrefs = [
    "best-free-ai-tools-for-students-in-india-2026",
    "best-ai-tools-for-freelancers-india-2026",
    "best-ai-tools-in-india-2026",
]
for slug in new_hrefs:
    R.record(slug in known_blog_slugs,
             f"Slug '{slug}' has a real .ts source file")

# Students post: slug field matches filename
students_file = ROOT / "blog" / "best-free-ai-tools-for-students-in-india-2026.ts"
if students_file.exists():
    content = students_file.read_text(encoding="utf-8")
    sm = re.search(r"slug\s*:\s*'([^']+)'", content)
    if sm:
        R.record(sm.group(1) == "best-free-ai-tools-for-students-in-india-2026",
                 f"Students post slug matches filename ('{sm.group(1)}')")

# All compare slugs we link to exist in compare-data.ts
compare_data_path = ROOT / "pages" / "compare-data.ts"
known_compare_slugs: set[str] = set()
if compare_data_path.exists():
    cdata = compare_data_path.read_text(encoding="utf-8")
    for sm in re.finditer(r"slug\s*:\s*'([^']+)'", cdata):
        known_compare_slugs.add(sm.group(1))

for _, links, label in compare_checks:
    for link in links:
        slug = link.replace("/compare/", "")
        R.record(slug in known_compare_slugs,
                 f"Compare slug '{slug}' exists in compare-data.ts")

print()


# ══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════════════════════════
total = R.passed + R.failed
bar_filled = int(R.passed / total * 40) if total else 0
bar = f"{GREEN}{'█' * bar_filled}{RESET}{'░' * (40 - bar_filled)}"

print(f"{BOLD}{'═'*62}{RESET}")
print(f"{BOLD}  RESULTS{RESET}")
print(f"{BOLD}{'═'*62}{RESET}")
print(f"  {bar}  {R.passed}/{total}")
print(f"  {GREEN}Passed : {R.passed}{RESET}")
print(f"  {RED}Failed : {R.failed}{RESET}")
if R.warns:
    print(f"  {YELLOW}Warns  : {R.warns}{RESET}")
print()

if R.failures:
    print(f"{BOLD}{RED}  Failed checks:{RESET}")
    for f_msg in R.failures:
        print(f"    {RED}✗{RESET} {f_msg}")
    print()

if R.failed == 0:
    print(f"  {GREEN}{BOLD}All Week 2 fixes validated successfully. ✓{RESET}")
else:
    pct = int(R.passed / total * 100)
    print(f"  {YELLOW}Score: {pct}% — review failed checks above.{RESET}")
print(f"{BOLD}{'═'*62}{RESET}\n")

sys.exit(0 if R.failed == 0 else 1)
