#!/usr/bin/env python3
"""
validate_critical_fixes.py

Validates the two PartnerStack "critical" fixes for AI Nexus:

  Issue 1 — No fabricated first-person testing claims remain
            ("I tested", "I've tested", "personally tested", etc.)
            in manifest.json or any content file.

  Issue 2 — Every tool with a live, commission-tracked affiliateLink in
            constants.ts is present in AFFILIATE_SLUGS in BOTH
            pages/ToolPage.tsx and pages/HomePage.tsx, and the two
            arrays are identical (so the disclosure banner and the
            "affiliate pick" badge never fall out of sync).

Usage:
    python3 validate_critical_fixes.py [path_to_repo_root]

Exit code 0 = all checks passed. Exit code 1 = at least one check failed.
Run this from CI (or manually before every deploy) after any sprint day
that touches constants.ts, ToolPage.tsx, HomePage.tsx, or blog content.
"""

import json
import re
import sys
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────

# Phrases that indicate a fabricated first-person "I personally tested this"
# claim. Kept deliberately narrow (word-boundary, case-insensitive) to avoid
# false positives on legitimate research-synthesis language like
# "researched", "documented", "Independently Researched" badges, etc.
BANNED_PATTERNS = [
    r"\bpersonally tested\b",
    r"\bi(?:'ve| have)? tested\b",
    r"\bi tested\b",
    r"\bi asked (?:it|for)\b",
    r"\bon my end\b",
    r"\bi ran\b",
    r"\bi built\b",
    r"\bi found in testing\b",
    r"\bhands-on testing\b",
]
BANNED_RE = re.compile("|".join(BANNED_PATTERNS), re.IGNORECASE)

# Files that were part of the Issue-1 fix and must be clean.
# (Extend this list any time new content is added — see Issue-1 note below.)
CONTENT_FILES_TO_CHECK = [
    "pages/CategoryPage.tsx",
    "pages/compare-data.ts",
    "blog/best-vibe-coding-tools-2026.ts",
    "blog/best-ai-tools-for-youtubers-2026.ts",
    "blog/metadata.ts",
    "constants.ts",
]

MANIFEST_PATH = "public/manifest.json"
TOOLPAGE_PATH = "pages/ToolPage.tsx"
HOMEPAGE_PATH = "pages/HomePage.tsx"
CONSTANTS_PATH = "constants.ts"

# Regex to find every `slug: '...' ... affiliateLink: '...'` pair inside a
# tool object in constants.ts. This is a light heuristic parser, not a full
# TS parser — it assumes each tool object has `slug:` before `affiliateLink:`.
SLUG_RE = re.compile(r"slug:\s*'([a-z0-9\-]+)'")
AFFILIATE_LINK_RE = re.compile(r"affiliateLink:\s*'([^']+)'")

# URL patterns that indicate a genuine, commission-tracked affiliate link.
TRACKING_MARKERS = [
    r"[?&](via|ref|fpr|pc)=",   # query-param tracking codes
    r"/refer/",                  # path-based referral codes
    r"\.sjv\.io",                # impact.com / partner-network subdomains
    r"get\.murf\.ai",
    r"try\.elevenlabs\.io",
]
TRACKING_RE = re.compile("|".join(TRACKING_MARKERS), re.IGNORECASE)

# Explicit "no affiliate programme yet" markers as an extra signal that a
# slug should NOT be expected in AFFILIATE_SLUGS even if the regex above
# were to misfire.
NO_PROGRAM_MARKERS = re.compile(
    r"no (?:public )?affiliate programme|no affiliate programme yet|todo:.*affiliate",
    re.IGNORECASE,
)

AFFILIATE_SLUGS_ARRAY_RE = re.compile(
    r"const AFFILIATE_SLUGS\s*=\s*\[(.*?)\];", re.DOTALL
)


# ── Helpers ───────────────────────────────────────────────────────────────

def fail(msg: str, failures: list):
    failures.append(msg)
    print(f"  ✗ {msg}")


def ok(msg: str):
    print(f"  ✓ {msg}")


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def find_banned_phrases(text: str):
    """Return list of (line_number, matched_snippet) for banned phrases."""
    hits = []
    for i, line in enumerate(text.splitlines(), start=1):
        m = BANNED_RE.search(line)
        if m:
            hits.append((i, line.strip()[:160]))
    return hits


def extract_affiliate_slugs_array(text: str, label: str, failures: list):
    m = AFFILIATE_SLUGS_ARRAY_RE.search(text)
    if not m:
        fail(f"Could not find `AFFILIATE_SLUGS` array in {label} — did the "
             f"variable get renamed or removed?", failures)
        return None
    body = m.group(1)
    slugs = re.findall(r"'([a-z0-9\-]+)'", body)
    return slugs


def extract_tool_slug_affiliate_pairs(constants_text: str):
    """
    Heuristic split: break constants.ts into per-tool chunks on each
    `slug: '...'` occurrence, then look for the first `affiliateLink:`
    within that chunk (up to the next `slug:`).
    Returns list of (slug, affiliateLink, has_tracking, explicitly_no_program)
    """
    slug_matches = list(SLUG_RE.finditer(constants_text))
    results = []
    for idx, sm in enumerate(slug_matches):
        start = sm.end()
        end = slug_matches[idx + 1].start() if idx + 1 < len(slug_matches) else len(constants_text)
        chunk = constants_text[start:end]
        link_m = AFFILIATE_LINK_RE.search(chunk)
        if not link_m:
            continue
        link = link_m.group(1)
        # only look at the affiliateLink line itself (plus trailing comment)
        # for the "no program" marker, not the whole chunk, to avoid noise.
        line_end = chunk.find("\n", link_m.end())
        line_end = line_end if line_end != -1 else len(chunk)
        affiliate_line = chunk[link_m.start():line_end]
        has_tracking = bool(TRACKING_RE.search(link))
        no_program = bool(NO_PROGRAM_MARKERS.search(affiliate_line))
        results.append((sm.group(1), link, has_tracking, no_program))
    return results


# ── Checks ────────────────────────────────────────────────────────────────

def check_issue_1(repo_root: Path, failures: list):
    print("\n[Issue 1] Fabricated first-person testing claims")

    # manifest.json
    manifest_path = repo_root / MANIFEST_PATH
    if not manifest_path.exists():
        fail(f"{MANIFEST_PATH} not found", failures)
    else:
        try:
            data = json.loads(read(manifest_path))
        except json.JSONDecodeError as e:
            fail(f"{MANIFEST_PATH} is not valid JSON: {e}", failures)
            data = {}
        description = data.get("description", "")
        if BANNED_RE.search(description):
            fail(f"{MANIFEST_PATH} description still contains a banned "
                 f"phrase: \"{description}\"", failures)
        else:
            ok(f"{MANIFEST_PATH} description is clean")

    # content files
    for rel_path in CONTENT_FILES_TO_CHECK:
        path = repo_root / rel_path
        if not path.exists():
            fail(f"{rel_path} not found (expected to check for banned phrases)",
                 failures)
            continue
        hits = find_banned_phrases(read(path))
        if hits:
            for line_no, snippet in hits:
                fail(f"{rel_path}:{line_no} still contains a banned phrase "
                     f"→ \"{snippet}\"", failures)
        else:
            ok(f"{rel_path} is clean")


def check_issue_2(repo_root: Path, failures: list):
    print("\n[Issue 2] Affiliate disclosure sync")

    constants_path = repo_root / CONSTANTS_PATH
    toolpage_path = repo_root / TOOLPAGE_PATH
    homepage_path = repo_root / HOMEPAGE_PATH

    for p, label in [(constants_path, CONSTANTS_PATH),
                      (toolpage_path, TOOLPAGE_PATH),
                      (homepage_path, HOMEPAGE_PATH)]:
        if not p.exists():
            fail(f"{label} not found", failures)
            return

    constants_text = read(constants_path)
    toolpage_text = read(toolpage_path)
    homepage_text = read(homepage_path)

    tool_slugs = extract_tool_slug_affiliate_pairs(constants_text)
    if not tool_slugs:
        fail("Could not parse any slug/affiliateLink pairs out of "
             f"{CONSTANTS_PATH} — heuristic parser may need updating",
             failures)
        return

    expected_tracked = sorted({
        slug for slug, link, tracked, no_program in tool_slugs
        if tracked and not no_program
    })
    ok(f"Found {len(expected_tracked)} tools with a live tracked affiliate "
       f"link in {CONSTANTS_PATH}")

    toolpage_slugs = extract_affiliate_slugs_array(toolpage_text, TOOLPAGE_PATH, failures)
    homepage_slugs = extract_affiliate_slugs_array(homepage_text, HOMEPAGE_PATH, failures)

    if toolpage_slugs is None or homepage_slugs is None:
        return

    # 1. Every tracked tool must appear in ToolPage.tsx's list
    missing_in_toolpage = [s for s in expected_tracked if s not in toolpage_slugs]
    if missing_in_toolpage:
        fail(f"{TOOLPAGE_PATH}: AFFILIATE_SLUGS is missing tracked tool(s): "
             f"{missing_in_toolpage} — disclosure banner will NOT show on "
             f"these pages", failures)
    else:
        ok(f"{TOOLPAGE_PATH}: AFFILIATE_SLUGS covers every tracked affiliate tool")

    # 2. Every tracked tool must appear in HomePage.tsx's list
    missing_in_homepage = [s for s in expected_tracked if s not in homepage_slugs]
    if missing_in_homepage:
        fail(f"{HOMEPAGE_PATH}: AFFILIATE_SLUGS is missing tracked tool(s): "
             f"{missing_in_homepage}", failures)
    else:
        ok(f"{HOMEPAGE_PATH}: AFFILIATE_SLUGS covers every tracked affiliate tool")

    # 3. The two arrays should be identical (badge + disclosure must agree)
    if sorted(toolpage_slugs) != sorted(homepage_slugs):
        only_tp = sorted(set(toolpage_slugs) - set(homepage_slugs))
        only_hp = sorted(set(homepage_slugs) - set(toolpage_slugs))
        fail(f"AFFILIATE_SLUGS differs between {TOOLPAGE_PATH} and "
             f"{HOMEPAGE_PATH}. Only in ToolPage: {only_tp or 'none'}; "
             f"only in HomePage: {only_hp or 'none'}", failures)
    else:
        ok(f"{TOOLPAGE_PATH} and {HOMEPAGE_PATH} AFFILIATE_SLUGS lists are identical")

    # 4. Warn (not fail) on slugs listed that no longer have a tracked link —
    #    stale entries aren't dangerous (over-disclosure is safe) but are worth flagging.
    all_tracked_or_untracked_slugs = {slug for slug, *_ in tool_slugs}
    stale_toolpage = [s for s in toolpage_slugs
                       if s in all_tracked_or_untracked_slugs and s not in expected_tracked]
    if stale_toolpage:
        print(f"  ⚠ {TOOLPAGE_PATH}: slug(s) {stale_toolpage} are listed but no "
              f"longer have a tracked affiliate link in constants.ts — safe to "
              f"leave (over-discloses) but consider cleaning up.")


# ── Main ──────────────────────────────────────────────────────────────────

def main():
    repo_root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    repo_root = repo_root.resolve()

    print(f"Validating critical fixes in: {repo_root}")
    failures: list = []

    check_issue_1(repo_root, failures)
    check_issue_2(repo_root, failures)

    print("\n" + "=" * 70)
    if failures:
        print(f"RESULT: FAILED — {len(failures)} issue(s) found\n")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    else:
        print("RESULT: PASSED — no fabricated testing claims found, "
              "affiliate disclosure is fully in sync.")
        sys.exit(0)


if __name__ == "__main__":
    main()
