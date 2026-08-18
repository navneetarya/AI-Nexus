#!/usr/bin/env python3
"""
validate_blog_images.py
========================
Image validator for AI Nexus (blog/*.ts).

Checks every <img> tag embedded in blog/*.ts against three rules:

    1. WITHIN-POST DUPLICATES  - the same Unsplash photo ID used twice
                                  in the same post.
    2. SITE-WIDE DUPLICATES    - the same Unsplash photo ID reused across
                                  two or more different posts.
    3. RELEVANCE (heuristic)   - the image's alt text is checked against
                                  its position in the article (nearest
                                  preceding <h2>/<h3>) for keyword overlap,
                                  and against generic/placeholder-sounding
                                  alt text patterns. This is a heuristic
                                  flag, not a visual check -- it cannot see
                                  the actual pixels, so it should be read
                                  as "worth a manual look", not "wrong".

This script is REPORT ONLY. It never modifies files. Pair it with a
manual/visual pass (screenshots) for anything it flags under Rule 3 --
it can prove a duplicate photo ID with certainty, but it cannot prove an
image genuinely matches its content without eyes on the render.

Outputs:
    - Colored terminal summary (always)
    - --json <path>   full machine-readable report
    - --csv  <path>   one row per duplicate/flag

CI usage:
    python3 validate_blog_images.py --strict
    Exit code 1 if ANY within-post or site-wide duplicate exists.
    Exit code 0 otherwise. (Relevance flags never affect exit code --
    they're advisory only, since the check is heuristic.)

Usage:
    python3 validate_blog_images.py                       # all posts, terminal only
    python3 validate_blog_images.py <slug>                 # one post, verbose
    python3 validate_blog_images.py --json report.json --csv report.csv
    python3 validate_blog_images.py --strict                # CI gate mode
"""

import argparse
import csv as csv_module
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BLOG_DIR = ROOT / "blog"
NON_POST_FILES = {"index.ts", "metadata.ts", "loaders.ts", "types.ts"}

RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"
DIM = "\033[2m"

IMG_TAG_RE = re.compile(r'<img\s+[^>]*?/?>', re.IGNORECASE)
SRC_RE = re.compile(r'src="([^"]+)"')
ALT_RE = re.compile(r'alt="([^"]*)"')
UNSPLASH_ID_RE = re.compile(r'images\.unsplash\.com/(photo-[a-f0-9\-]+)')
HEADING_RE = re.compile(r'<h[23][^>]*>(.*?)</h[23]>', re.IGNORECASE | re.DOTALL)
TAG_STRIP_RE = re.compile(r'<[^>]+>')

# Generic/placeholder-sounding alt phrases that carry little content-specific
# signal. Not wrong by themselves, but common in copy-pasted images.
GENERIC_ALT_PATTERNS = [
    r'^a (person|man|woman|team) (sitting|working|using|wearing)',
    r'^a (desk|laptop|computer) (with|on)',
    r'representing (ai|artificial intelligence) (technology|tools?)$',
]

STOPWORDS = {
    "a", "an", "the", "and", "or", "of", "for", "in", "on", "at", "to",
    "with", "is", "are", "your", "you", "this", "that", "how", "what",
    "best", "2026", "tools", "tool", "guide", "software", "review",
}


def find_blog_files():
    return sorted(
        f for f in BLOG_DIR.glob("*.ts")
        if f.name not in NON_POST_FILES
    )


def extract_images(text: str):
    """Return list of dicts: {src, alt, unsplash_id, nearest_heading, position}."""
    images = []
    # Track heading positions so we can find the nearest preceding one per image
    headings = [(m.start(), TAG_STRIP_RE.sub('', m.group(1)).strip())
                for m in HEADING_RE.finditer(text)]

    for m in IMG_TAG_RE.finditer(text):
        tag = m.group(0)
        src_m = SRC_RE.search(tag)
        alt_m = ALT_RE.search(tag)
        src = src_m.group(1) if src_m else ""
        alt = alt_m.group(1) if alt_m else ""
        id_m = UNSPLASH_ID_RE.search(src)
        unsplash_id = id_m.group(1) if id_m else None

        nearest_heading = None
        for h_pos, h_text in headings:
            if h_pos < m.start():
                nearest_heading = h_text
            else:
                break

        images.append({
            "src": src,
            "alt": alt,
            "unsplash_id": unsplash_id,
            "nearest_heading": nearest_heading,
        })
    return images


def keywords(text: str):
    words = re.findall(r"[a-z0-9]+", text.lower())
    return {w for w in words if w not in STOPWORDS and len(w) > 2}


def check_relevance(img):
    """Heuristic-only. Returns a list of flag strings (may be empty)."""
    flags = []
    alt = img["alt"].strip()

    if not alt:
        flags.append("missing alt text")
        return flags

    for pattern in GENERIC_ALT_PATTERNS:
        if re.search(pattern, alt.lower()):
            flags.append(f"generic/templated alt phrasing: \"{alt}\"")
            break

    if img["nearest_heading"]:
        alt_kw = keywords(alt)
        heading_kw = keywords(img["nearest_heading"])
        if alt_kw and heading_kw and not (alt_kw & heading_kw):
            flags.append(
                f"no keyword overlap between alt (\"{alt}\") "
                f"and nearest heading (\"{img['nearest_heading']}\") "
                f"-- worth a manual look, may be a false positive"
            )

    return flags


def run(slugs_filter=None):
    files = find_blog_files()
    if slugs_filter:
        files = [f for f in files if f.stem in slugs_filter]

    post_images = {}       # slug -> list of image dicts
    id_to_posts = defaultdict(list)  # unsplash_id -> [(slug, alt), ...]
    within_post_dupes = {}  # slug -> [dup_id, ...]
    relevance_flags = {}   # slug -> [(img, flags), ...]

    for f in files:
        slug = f.stem
        text = f.read_text(encoding="utf-8")
        images = extract_images(text)
        post_images[slug] = images

        seen_ids = defaultdict(int)
        for img in images:
            if img["unsplash_id"]:
                seen_ids[img["unsplash_id"]] += 1
                id_to_posts[img["unsplash_id"]].append((slug, img["alt"]))

        dupes = [pid for pid, count in seen_ids.items() if count > 1]
        if dupes:
            within_post_dupes[slug] = dupes

        flags = []
        for img in images:
            f_list = check_relevance(img)
            if f_list:
                flags.append((img, f_list))
        if flags:
            relevance_flags[slug] = flags

    sitewide_dupes = {
        pid: posts for pid, posts in id_to_posts.items()
        if len({slug for slug, _ in posts}) > 1
    }

    return {
        "files_checked": len(files),
        "post_images": post_images,
        "within_post_dupes": within_post_dupes,
        "sitewide_dupes": sitewide_dupes,
        "relevance_flags": relevance_flags,
    }


def print_report(result, verbose_slug=None):
    total_files = result["files_checked"]
    total_images = sum(len(v) for v in result["post_images"].values())
    within = result["within_post_dupes"]
    sitewide = result["sitewide_dupes"]
    relevance = result["relevance_flags"]

    print(f"\n{BOLD}{CYAN}AI Nexus - Blog Image Validation{RESET}")
    print(f"{DIM}{'=' * 60}{RESET}")
    print(f"Posts scanned : {total_files}")
    print(f"Images found  : {total_images}\n")

    # Rule 1: within-post duplicates
    print(f"{BOLD}Rule 1 - Within-post duplicate images{RESET}")
    if not within:
        print(f"  {GREEN}PASS{RESET} - no post reuses the same image twice.\n")
    else:
        print(f"  {RED}FAIL{RESET} - {len(within)} post(s) reuse an image internally:")
        for slug, dupe_ids in within.items():
            print(f"    {YELLOW}{slug}{RESET}")
            for pid in dupe_ids:
                print(f"      - {pid} appears more than once")
        print()

    # Rule 2: site-wide duplicates
    print(f"{BOLD}Rule 2 - Site-wide duplicate images (across posts){RESET}")
    if not sitewide:
        print(f"  {GREEN}PASS{RESET} - every image is unique across the whole blog.\n")
    else:
        print(f"  {RED}FAIL{RESET} - {len(sitewide)} photo ID(s) reused across multiple posts:")
        for pid, posts in sitewide.items():
            slugs = sorted({slug for slug, _ in posts})
            print(f"    {YELLOW}{pid}{RESET} -> used in {len(slugs)} posts:")
            for slug in slugs:
                alt = next((a for s, a in posts if s == slug), "")
                print(f"      - {slug}  ({DIM}alt: \"{alt}\"{RESET})")
        print()

    # Rule 3: relevance (heuristic, advisory only)
    print(f"{BOLD}Rule 3 - Relevance flags (heuristic, advisory only){RESET}")
    if not relevance:
        print(f"  {GREEN}No flags.{RESET} (This checks alt-text vs. nearby heading "
              f"keyword overlap + generic phrasing. It cannot see the actual "
              f"image -- pair with a visual/screenshot pass.)\n")
    else:
        flagged_count = len(relevance)
        print(f"  {YELLOW}{flagged_count} post(s) have at least one image worth a manual look:{RESET}")
        for slug, items in relevance.items():
            print(f"    {YELLOW}{slug}{RESET}")
            for img, flags in items:
                for flag in flags:
                    print(f"      - {flag}")
        print(f"  {DIM}Note: this is a keyword heuristic, not a vision check. "
              f"False positives are expected -- treat this as a shortlist to "
              f"look at, not a verdict.{RESET}\n")

    if verbose_slug:
        print(f"{BOLD}{CYAN}Detail for '{verbose_slug}'{RESET}")
        images = result["post_images"].get(verbose_slug)
        if images is None:
            print(f"  {RED}No such post found.{RESET}")
        else:
            for i, img in enumerate(images, 1):
                print(f"  [{i}] id={img['unsplash_id']}")
                print(f"      alt: \"{img['alt']}\"")
                print(f"      nearest heading: \"{img['nearest_heading']}\"")
        print()

    print(f"{DIM}{'=' * 60}{RESET}")
    ok = not within and not sitewide
    if ok:
        print(f"{GREEN}{BOLD}All duplicate checks passed.{RESET}\n")
    else:
        print(f"{RED}{BOLD}Duplicate checks FAILED - see above.{RESET}\n")
    return ok


def write_json(result, path):
    serializable = {
        "files_checked": result["files_checked"],
        "within_post_dupes": result["within_post_dupes"],
        "sitewide_dupes": {
            pid: [{"slug": s, "alt": a} for s, a in posts]
            for pid, posts in result["sitewide_dupes"].items()
        },
        "relevance_flags": {
            slug: [
                {"alt": img["alt"], "unsplash_id": img["unsplash_id"], "flags": flags}
                for img, flags in items
            ]
            for slug, items in result["relevance_flags"].items()
        },
    }
    Path(path).write_text(json.dumps(serializable, indent=2), encoding="utf-8")
    print(f"JSON report written to {path}")


def write_csv(result, path):
    rows = []
    for slug, dupe_ids in result["within_post_dupes"].items():
        for pid in dupe_ids:
            rows.append(["within_post_duplicate", slug, pid, ""])
    for pid, posts in result["sitewide_dupes"].items():
        for slug, alt in posts:
            rows.append(["sitewide_duplicate", slug, pid, alt])
    for slug, items in result["relevance_flags"].items():
        for img, flags in items:
            for flag in flags:
                rows.append(["relevance_flag", slug, img["unsplash_id"] or "", flag])

    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv_module.writer(f)
        writer.writerow(["issue_type", "slug", "unsplash_id", "detail"])
        writer.writerows(rows)
    print(f"CSV report written to {path}")


def main():
    parser = argparse.ArgumentParser(description="Validate blog image duplicates and relevance.")
    parser.add_argument("slug", nargs="?", help="Only check this post slug (verbose detail).")
    parser.add_argument("--json", metavar="PATH", help="Write JSON report to PATH.")
    parser.add_argument("--csv", metavar="PATH", help="Write CSV report to PATH.")
    parser.add_argument("--strict", action="store_true",
                         help="Exit 1 if any within-post or site-wide duplicate exists.")
    args = parser.parse_args()

    if not BLOG_DIR.exists():
        print(f"{RED}blog/ directory not found at {BLOG_DIR}{RESET}")
        sys.exit(2)

    slugs_filter = {args.slug} if args.slug else None
    result = run(slugs_filter=slugs_filter)

    if args.slug and args.slug not in result["post_images"]:
        print(f"{RED}No post found with slug '{args.slug}'{RESET}")
        sys.exit(2)

    ok = print_report(result, verbose_slug=args.slug)

    if args.json:
        write_json(result, args.json)
    if args.csv:
        write_csv(result, args.csv)

    if args.strict and not ok:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
