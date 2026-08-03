#!/usr/bin/env python3
"""
validate_cta_consistency.py

Audits every post in blog/ for CTA (affiliate/outbound button) presence and
style consistency against the canonical pattern used in
blog/ai-tools-for-solopreneurs-2026.ts.

Canonical CTA block:
    <div style="margin:14px 0 24px;">
      <a href="[LINK]" target="_blank" rel="sponsored nofollow noopener noreferrer"
         style="display:inline-block;background:linear-gradient(135deg,#0D9488,#0f766e);
                color:#fff;padding:10px 14px;margin:6px 8px 0 0;border-radius:10px;
                font-weight:700;font-size:13px;text-decoration:none;">Try [Tool] Free →</a>
    </div>

This script does NOT modify anything. It only reports. Use it as:
  - a pre-publish check for a single new post (`AUDIT CTAS` / `FIX CTAS` in the
    Loop Engineering Prompt should call this with a slug)
  - a periodic sweep of the whole blog/ directory to find drift

Usage:
    python3 validate_cta_consistency.py              # audits every post
    python3 validate_cta_consistency.py <slug>        # audits one post
"""

import re
import sys
import glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BLOG_DIR = ROOT / "blog"

CANONICAL_GRADIENT = "linear-gradient(135deg,#0D9488,#0f766e)"
KNOWN_WRONG_FINGERPRINTS = [
    "background:#6366f1",
    "background:#0ea5e9",
    "background:#f59e0b",
    "background:#0D9488;color:#fff;padding:10px 24px",  # flat teal, wrong padding
    "padding:10px 24px",
]

NON_POST_FILES = {"index.ts", "metadata.ts", "loaders.ts", "types.ts"}

AFFILIATE_MARKERS = ["?via=", "?pc=", "?fpr=", "/?ref=", "?ref="]

RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RESET = "\033[0m"


def get_post_files(slug=None):
    if slug:
        f = BLOG_DIR / f"{slug}.ts"
        if not f.exists():
            print(f"{RED}No such file: {f}{RESET}")
            sys.exit(1)
        return [f]
    return sorted(
        p for p in BLOG_DIR.glob("*.ts") if p.name not in NON_POST_FILES
    )


def audit_file(path):
    txt = path.read_text(encoding="utf-8")

    h2_count = len(re.findall(r"<h2", txt))
    canonical_count = txt.count(CANONICAL_GRADIENT)
    outbound_links = re.findall(r'<a href="(https?://[^"]+)"[^>]*>', txt)
    button_links = re.findall(r'<a href="https?://[^"]+"[^>]*display:inline-block[^>]*>', txt)
    wrong_style_hits = [fp for fp in KNOWN_WRONG_FINGERPRINTS if fp in txt]

    # rel attribute check on affiliate links specifically
    rel_issues = []
    for m in re.finditer(r'<a href="(https?://[^"]+)"([^>]*)>', txt):
        url, attrs = m.group(1), m.group(2)
        is_affiliate = any(marker in url for marker in AFFILIATE_MARKERS)
        if is_affiliate and "sponsored" not in attrs:
            rel_issues.append(url)

    if canonical_count > 0 and not wrong_style_hits:
        status = "CANONICAL"
    elif button_links and not canonical_count:
        status = "NON-CANONICAL STYLE"
    elif outbound_links and not button_links:
        status = "PLAIN LINKS ONLY (no button)"
    else:
        status = "NO CTA AT ALL"

    return {
        "file": path.name,
        "h2_count": h2_count,
        "canonical_ctas": canonical_count,
        "outbound_links": len(outbound_links),
        "button_links": len(button_links),
        "wrong_style_hits": wrong_style_hits,
        "rel_issues": rel_issues,
        "status": status,
    }


def main():
    slug = sys.argv[1] if len(sys.argv) > 1 else None
    files = get_post_files(slug)

    results = [audit_file(f) for f in files]

    buckets = {"CANONICAL": [], "NON-CANONICAL STYLE": [], "PLAIN LINKS ONLY (no button)": [], "NO CTA AT ALL": []}
    for r in results:
        buckets[r["status"]].append(r)

    print(f"\n{'='*70}\nCTA CONSISTENCY AUDIT — {len(results)} post(s) checked\n{'='*70}\n")

    for status, color in [
        ("CANONICAL", GREEN),
        ("NON-CANONICAL STYLE", YELLOW),
        ("PLAIN LINKS ONLY (no button)", YELLOW),
        ("NO CTA AT ALL", RED),
    ]:
        items = buckets[status]
        print(f"{color}{status}: {len(items)}{RESET}")
        for r in items:
            extra = ""
            if r["wrong_style_hits"]:
                extra += f"  [wrong style: {', '.join(r['wrong_style_hits'])}]"
            if r["rel_issues"]:
                extra += f"  [missing rel=sponsored on {len(r['rel_issues'])} affiliate link(s)]"
            if slug:  # verbose mode for single-post audits
                print(f"  - {r['file']}  (h2s: {r['h2_count']}, canonical CTAs: {r['canonical_ctas']}, "
                      f"outbound links: {r['outbound_links']}, button links: {r['button_links']}){extra}")
            else:
                print(f"  - {r['file']}{extra}")
        print()

    total = len(results)
    canonical = len(buckets["CANONICAL"])
    print(f"{'='*70}")
    print(f"Summary: {canonical}/{total} posts fully canonical.")
    if total - canonical:
        print(f"{YELLOW}{total - canonical} post(s) need CTA fixes — run FIX CTAS [slug] per post.{RESET}")
    print(f"{'='*70}\n")

    sys.exit(0 if canonical == total else 1)


if __name__ == "__main__":
    main()
