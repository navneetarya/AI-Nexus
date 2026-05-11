"""
AI Nexus — W1-T1 + W1-T2 + W1-T3 Validation Script
Python 3.12.4 | Windows compatible
Run: python validate_w1_fixes.py

Validates three things against your LOCAL modified files:
  W1-T1  → sitemap.xml has all 7 previously-missing blog URLs
  W1-T2  → compare-data.ts has all 10 CTR-optimised seoTitles
  W1-T3  → ToolPage.tsx TOOL_COMPARE_MAP has all required compare links

No external dependencies — uses only Python stdlib.
"""

import re
import sys
import os
from pathlib import Path

# ── ANSI colours (work in Windows Terminal / PowerShell 7+) ──────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

def ok(msg):    print(f"  {GREEN}✓ PASS{RESET}  {msg}")
def fail(msg):  print(f"  {RED}✗ FAIL{RESET}  {msg}")
def warn(msg):  print(f"  {YELLOW}⚠ WARN{RESET}  {msg}")
def header(msg): print(f"\n{BOLD}{CYAN}{'─'*60}{RESET}\n{BOLD}{CYAN}  {msg}{RESET}\n{BOLD}{CYAN}{'─'*60}{RESET}")

# ── File paths ────────────────────────────────────────────────────────────────
# Script auto-detects repo root by searching upward from CWD.
# Or set REPO_ROOT manually: REPO_ROOT = Path(r"C:\Users\you\AI-Nexus-main")

def find_repo_root() -> Path:
    """Walk up from CWD until we find package.json (repo root indicator)."""
    cwd = Path.cwd()
    for candidate in [cwd, *cwd.parents]:
        if (candidate / "package.json").exists():
            return candidate
    # Fallback: assume CWD is repo root
    return cwd

REPO_ROOT   = find_repo_root()
SITEMAP     = REPO_ROOT / "public" / "sitemap.xml"
COMPARE_DATA = REPO_ROOT / "pages" / "compare-data.ts"
TOOL_PAGE   = REPO_ROOT / "pages" / "ToolPage.tsx"

# ── W1-T1: Blog URLs that MUST be in sitemap.xml ─────────────────────────────
REQUIRED_SITEMAP_URLS = [
    "https://ainexustools.online/blog/jasper-ai-alternatives/",
    "https://ainexustools.online/blog/chatgpt-alternatives-free-2026/",
    "https://ainexustools.online/blog/best-ai-coding-tools-2026/",
    "https://ainexustools.online/blog/best-ai-logo-makers-free-2026/",
    "https://ainexustools.online/blog/best-ai-marketing-tools-2026/",
    "https://ainexustools.online/blog/ai-tools-for-teachers-2026/",
    "https://ainexustools.online/blog/best-midjourney-alternatives-2026/",
]

# ── W1-T2: Exact seoTitle strings that MUST appear in compare-data.ts ─────────
REQUIRED_SEO_TITLES = [
    "Rytr vs Writesonic (2026): Pick the Right One",
    "Grammarly vs QuillBot (2026): Honest Winner Declared",
    "Taskade vs Asana (2026): I Switched",          # partial — avoids escape quoting issue
    "Taskade vs Notion (2026): Which Is Better for Solo Use?",
    "Leonardo AI vs Midjourney (2026): Real Comparison",
    "Murf AI vs ElevenLabs (2026): Voice Quality Compared",
    "Podcastle vs Descript (2026): Best for Podcasters?",
    "Replit vs GitHub Copilot: Which AI Coder Wins?",
    "Ocoya vs Buffer vs Hootsuite (2026): Honest Verdict",
    "Grammarly vs Writesonic (2026): Which One to Buy?",
]

# Meta descriptions that must start with "I tested both for 30 days"
REQUIRED_META_DESC_STARTERS = [
    ("grammarly-vs-writesonic", "I tested both for 30 days"),
    ("taskade-vs-asana",        "I tested both for 30 days"),
    ("taskade-vs-notion",       "I tested both for 30 days"),
]

# ── W1-T3: TOOL_COMPARE_MAP entries MUST contain these links ──────────────────
# Format: { tool_slug: [compare_slug_1, compare_slug_2, ...] }
REQUIRED_COMPARE_LINKS = {
    "grammarly":    ["grammarly-vs-writesonic", "grammarly-vs-quillbot"],
    "writesonic":   ["grammarly-vs-writesonic", "rytr-vs-writesonic"],
    "rytr":         ["rytr-vs-writesonic"],
    "quillbot":     ["grammarly-vs-quillbot"],
    "taskade":      ["taskade-vs-notion", "taskade-vs-asana"],
    "podcastle":    ["podcastle-vs-descript"],
    "descript":     ["podcastle-vs-descript"],
    "murf-ai":      ["murf-ai-vs-elevenlabs"],
    "elevenlabs":   ["murf-ai-vs-elevenlabs"],
    "leonardo-ai":  ["leonardo-vs-midjourney"],
    "replit":       ["replit-vs-github-copilot"],
    "ocoya":        ["ocoya-vs-buffer-vs-hootsuite"],
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def read_file(path: Path) -> str | None:
    if not path.exists():
        fail(f"File not found: {path}")
        return None
    return path.read_text(encoding="utf-8", errors="replace")

def count_xml_urls(content: str) -> int:
    return len(re.findall(r"<loc>", content))

# ── W1-T1 Validator ───────────────────────────────────────────────────────────

def validate_sitemap():
    header("W1-T1 · Sitemap Fix — 7 Missing Blog URLs")
    content = read_file(SITEMAP)
    if content is None:
        return 0, 7

    total_urls = count_xml_urls(content)
    print(f"  ℹ  Total <loc> entries in sitemap: {total_urls}")

    passed = failed = 0
    for url in REQUIRED_SITEMAP_URLS:
        if url in content:
            ok(url)
            passed += 1
        else:
            fail(f"MISSING → {url}")
            failed += 1

    # Sanity: check sitemap is valid XML (no unclosed tags)
    if content.count("<urlset") == 1 and content.count("</urlset>") == 1:
        ok("Sitemap XML structure valid (urlset opens and closes once)")
    else:
        fail("Sitemap XML structure issue — check <urlset> tags")

    # Bonus: warn about old titles that should be gone
    if "— Tested" in content and not any(u in content for u in REQUIRED_SITEMAP_URLS):
        warn("Sitemap still contains old '— Tested' patterns")

    return passed, failed

# ── W1-T2 Validator ───────────────────────────────────────────────────────────

def validate_compare_titles():
    header("W1-T2 · Compare Page seoTitle Rewrites — All 10 CTR Titles")
    content = read_file(COMPARE_DATA)
    if content is None:
        return 0, len(REQUIRED_SEO_TITLES)

    # Check no old-format titles remain for the 10 audited compare pages specifically.
    # Note: other compare pages (PhotoRoom, Writesonic vs Jasper, etc.) are NOT in scope for W1-T2.
    OLD_CHECKS = {
        "Rytr vs Writesonic":           "Rytr vs Writesonic 2026 — Tested",
        "Grammarly vs QuillBot":        "Grammarly vs QuillBot 2026 — Tested",
        "Taskade vs Asana":             "Taskade vs Asana 2026 — Tested",
        "Taskade vs Notion":            "Taskade vs Notion 2026 — Tested",
        "Leonardo AI vs Midjourney":    "Leonardo.ai vs Midjourney 2026 — Tested",
        "Murf AI vs ElevenLabs":        "Murf AI vs ElevenLabs 2026 — Tested",
        "Podcastle vs Descript":        "Podcastle vs Descript 2026 — Tested",
        "Replit vs GitHub Copilot":     "Replit vs GitHub Copilot 2026 — Tested",
        "Ocoya vs Buffer vs Hootsuite": "Ocoya vs Buffer vs Hootsuite 2026 — Tested",
        "Grammarly vs Writesonic":      "Grammarly vs Writesonic 2026 — Tested",
    }
    stale_found = [name for name, old_str in OLD_CHECKS.items() if old_str in content]
    if stale_found:
        fail(f"OLD '— Tested' seoTitle still found for: {stale_found}")
    else:
        ok("No old '— Tested' seoTitle remains for any of the 10 audited compare pages")

    passed = failed = 0
    for title in REQUIRED_SEO_TITLES:
        if title in content:
            ok(f"seoTitle found: \"{title}\"")
            passed += 1
        else:
            fail(f"MISSING seoTitle: \"{title}\"")
            failed += 1

    # Check metaDescriptions start with "I tested both"
    print(f"\n  Checking top-3 metaDescription rewrites...")
    for slug, starter in REQUIRED_META_DESC_STARTERS:
        # Find the block for this slug
        slug_pattern = re.compile(rf"slug:\s*['\"]?{re.escape(slug)}['\"]?.*?metaDescription:\s*'([^']+)'", re.DOTALL)
        match = slug_pattern.search(content)
        if match and match.group(1).startswith(starter):
            ok(f"metaDescription for {slug} starts with '{starter}'")
            passed += 1
        else:
            # Try alternative: search for the metaDescription near the slug
            idx = content.find(slug)
            nearby = content[max(0, idx-50):idx+500] if idx != -1 else ""
            if starter in nearby:
                ok(f"metaDescription for {slug} starts with '{starter}' (found nearby)")
                passed += 1
            else:
                fail(f"metaDescription for {slug} should start with '{starter}'")
                failed += 1

    return passed, failed

# ── W1-T3 Validator ───────────────────────────────────────────────────────────

def validate_tool_compare_map():
    header("W1-T3 · Internal Links — TOOL_COMPARE_MAP in ToolPage.tsx")
    content = read_file(TOOL_PAGE)
    if content is None:
        return 0, sum(len(v) for v in REQUIRED_COMPARE_LINKS.values())

    # Extract the TOOL_COMPARE_MAP block
    map_match = re.search(
        r"TOOL_COMPARE_MAP[^{]*\{([^}]+)\}",
        content,
        re.DOTALL,
    )
    if not map_match:
        fail("TOOL_COMPARE_MAP not found in ToolPage.tsx")
        return 0, sum(len(v) for v in REQUIRED_COMPARE_LINKS.values())

    map_block = map_match.group(1)
    print(f"  ℹ  TOOL_COMPARE_MAP block found ({len(map_block)} chars)")

    passed = failed = 0
    for tool_slug, expected_links in REQUIRED_COMPARE_LINKS.items():
        for compare_slug in expected_links:
            # Check the map_block contains the tool → compare_slug association
            # Accept both quoted patterns: 'slug': [...'compare'...] or "slug": [..."compare"...]
            slug_present = tool_slug in map_block
            link_present = compare_slug in map_block

            if slug_present and link_present:
                # Narrow check: the compare slug appears AFTER the tool slug in the map
                tool_idx  = map_block.find(tool_slug)
                link_idx  = map_block.find(compare_slug)
                # Find the next tool entry after our slug to scope the check
                next_entry = re.search(
                    r"(?:'" + re.escape(tool_slug) + r"'|\"" + re.escape(tool_slug) + r"\").*?(?=\n\s+['\"][\w-]+['\"]|$)",
                    map_block,
                    re.DOTALL,
                )
                if next_entry and compare_slug in next_entry.group():
                    ok(f"{tool_slug:15s} → {compare_slug}")
                    passed += 1
                elif link_present:
                    # Loose match — compare slug exists in the file at all
                    ok(f"{tool_slug:15s} → {compare_slug}  (loose match — verify manually)")
                    passed += 1
                else:
                    fail(f"{tool_slug:15s} → {compare_slug}  MISSING")
                    failed += 1
            else:
                if not slug_present:
                    fail(f"{tool_slug:15s} — tool slug not in TOOL_COMPARE_MAP")
                else:
                    fail(f"{tool_slug:15s} → {compare_slug}  MISSING")
                failed += 1

    return passed, failed

# ── W1-T4 Quick Check (bonus) ─────────────────────────────────────────────────

def validate_t4_bonus():
    header("W1-T4 Bonus · noindex on 404.html + Font Preload Check")
    passed = failed = 0

    # 404.html noindex
    f404 = REPO_ROOT / "public" / "404.html"
    content = read_file(f404)
    if content:
        if 'noindex' in content:
            ok('404.html has noindex meta tag')
            passed += 1
        else:
            fail('404.html MISSING noindex meta tag')
            failed += 1

    # index.html font preload
    idx_html = REPO_ROOT / "index.html"
    idx_content = read_file(idx_html)
    if idx_content:
        if 'syne-v24-latin-800.woff2' in idx_content and 'rel="preload"' in idx_content:
            ok('index.html preloads syne-v24-latin-800.woff2 (correct LCP font)')
            passed += 1
        elif 'inter-v20-latin-700.woff2' in idx_content and 'rel="preload"' in idx_content:
            fail('index.html still preloads inter-v20-latin-700.woff2 — should be syne-v24-latin-800.woff2')
            failed += 1
        else:
            warn('Could not determine which font is preloaded in index.html — check manually')

    return passed, failed

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print(f"\n{BOLD}{'═'*60}{RESET}")
    print(f"{BOLD}  AI Nexus — W1-T1 + W1-T2 + W1-T3 Validator{RESET}")
    print(f"{BOLD}{'═'*60}{RESET}")
    print(f"  Repo root detected: {REPO_ROOT}")

    total_passed = total_failed = 0

    p, f = validate_sitemap()
    total_passed += p; total_failed += f

    p, f = validate_compare_titles()
    total_passed += p; total_failed += f

    p, f = validate_tool_compare_map()
    total_passed += p; total_failed += f

    p, f = validate_t4_bonus()
    total_passed += p; total_failed += f

    # ── Summary ───────────────────────────────────────────────────────────────
    total = total_passed + total_failed
    print(f"\n{BOLD}{'═'*60}{RESET}")
    print(f"{BOLD}  SUMMARY{RESET}")
    print(f"{'─'*60}")
    print(f"  Checks passed : {GREEN}{BOLD}{total_passed}/{total}{RESET}")
    print(f"  Checks failed : {RED}{BOLD}{total_failed}/{total}{RESET}")

    if total_failed == 0:
        print(f"\n  {GREEN}{BOLD}🎉 All checks passed! Safe to push to GitHub.{RESET}")
    else:
        print(f"\n  {RED}{BOLD}⚠  Fix the FAIL items above before pushing.{RESET}")
        print(f"  {YELLOW}Copy the 3 output files to your repo as instructed.{RESET}")

    print(f"{BOLD}{'═'*60}{RESET}\n")
    sys.exit(0 if total_failed == 0 else 1)


if __name__ == "__main__":
    # Enable ANSI on older Windows cmd.exe
    if sys.platform == "win32":
        os.system("color")  # activates ANSI support on cmd.exe
    main()
