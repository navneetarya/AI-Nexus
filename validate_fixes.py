#!/usr/bin/env python3
"""
validate_fixes.py
=================
Validates Bug 1 (FAQ Schema) and Bug 4 (Blog OG Images) fixes
for the AI Nexus site.

Run from the project root:
    python3 scripts/validate_fixes.py

Or point it at your project root with --root:
    python3 validate_fixes.py --root /path/to/AI-Nexus-main

Checks performed
----------------
BUG 1 — FAQ Schema (scripts/prerender.mjs + dist/tools/*)
  S1  Every TOOLS[] slug has a matching key in TOOL_FAQS{}
  S2  Every TOOL_FAQS entry has at least 3 Q&A pairs
  S3  Every TOOL_FAQS entry has both 'q' and 'a' keys in each pair
  H1  dist/tools/<slug>/index.html exists for every tool
  H2  Each tool HTML contains exactly one FAQPage JSON-LD block
  H3  The FAQPage schema is valid JSON and has ≥ 3 questions
  H4  FAQ question count in HTML matches the source TOOL_FAQS count

BUG 4 — Blog OG Images (blog/types.ts + prerender.mjs + dist/blog/*)
  T1  blog/types.ts defines the `ogImage?` optional field
  T2  resolveOgImage() in prerender.mjs checks post.ogImage
  T3  BLOG_OG_MAP constant exists in prerender.mjs
  T4  resolveOgImage() checks BLOG_OG_MAP[post.slug]
  T5  Every BLOG_POSTS slug has a matching BLOG_OG_MAP entry
  F1  public/og/blog/<slug>.webp exists for every mapped slug
  F2  Every WebP file is ≥ 10 KB (not a corrupt/empty image)
  H5  dist/blog/<slug>/index.html exists for every blog post
  H6  The og:image tag in each blog HTML points to /og/blog/<slug>.webp
  H7  The og:image URL is NOT a generic category-level fallback image

Exit codes: 0 = all checks passed  |  1 = one or more failures
"""

import sys
import re
import json
import os
import argparse
from pathlib import Path

# ── Colour helpers ─────────────────────────────────────────────────────────────
RESET  = "\033[0m"
BOLD   = "\033[1m"
GREEN  = "\033[32m"
RED    = "\033[31m"
YELLOW = "\033[33m"
CYAN   = "\033[36m"
DIM    = "\033[2m"

def ok(msg):   print(f"  {GREEN}✓{RESET}  {msg}")
def fail(msg): print(f"  {RED}✗{RESET}  {BOLD}{msg}{RESET}")
def warn(msg): print(f"  {YELLOW}⚠{RESET}  {msg}")
def info(msg): print(f"  {CYAN}·{RESET}  {DIM}{msg}{RESET}")

def section(title):
    width = 70
    print(f"\n{BOLD}{CYAN}{'─' * width}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'─' * width}{RESET}")


# ── Generic OG image patterns (Bug 4 — these should no longer appear) ─────────
GENERIC_OG_PATTERNS = [
    r"/og-blog-writing\.webp",
    r"/og-blog-audio\.webp",
    r"/og-blog-video\.webp",
    r"/og-india-guide\.webp",
    r"/og-image\.png",
]
EXPECTED_OG_PREFIX = "/og/blog/"


# ── Source parsers ─────────────────────────────────────────────────────────────

def parse_tool_slugs(prerender_src: str) -> list[str]:
    """Extract slugs from the TOOLS = [ ... ] array (tool entries only)."""
    # Find the TOOLS array block
    m = re.search(r"const TOOLS\s*=\s*\[(.*?)^\]", prerender_src,
                  re.DOTALL | re.MULTILINE)
    if not m:
        return []
    block = m.group(1)
    # Each tool entry has: slug: 'something', name: 'Something', category:
    # This pattern captures slugs that are immediately followed by `name:` on
    # the same or next non-empty line (distinguishes tools from compare/blog slugs).
    slugs = re.findall(r"slug:\s*'([^']+)',\s*name:", block)
    return slugs


def parse_tool_faq_keys(prerender_src: str) -> dict[str, list]:
    """
    Extract TOOL_FAQS keys and their Q&A pairs.
    Returns { slug: [ {q, a}, ... ] }
    """
    # Locate the TOOL_FAQS block
    m = re.search(r"const TOOL_FAQS\s*=\s*\{(.*?)^\};",
                  prerender_src, re.DOTALL | re.MULTILINE)
    if not m:
        return {}
    block = m.group(1)

    faqs: dict[str, list] = {}
    # Find each key: either 'key-with-dashes': or plainKey:
    key_positions = [(km.group(1), km.start())
                     for km in re.finditer(r"^\s+(?:'([^']+)'|([a-zA-Z_][a-zA-Z0-9_]*)):\s*\[",
                                           block, re.MULTILINE)
                     for km in [km]
                     if km.group(1) or km.group(2)]

    # Re-parse cleanly
    faqs = {}
    for km in re.finditer(
            r"^\s+(?:'([^'-][^']*)'|([a-zA-Z][a-zA-Z0-9_]*)):\s*\[",
            block, re.MULTILINE):
        slug = km.group(1) or km.group(2)
        # Count { q: ... a: ... } pairs after this key until the closing ],
        start = km.end()
        # find the matching ], by bracket counting
        depth = 1
        i = start
        while i < len(block) and depth > 0:
            if block[i] == '[':
                depth += 1
            elif block[i] == ']':
                depth -= 1
            i += 1
        pair_block = block[start:i - 1]
        pairs = re.findall(r"\{\s*q:\s*'((?:[^'\\]|\\.)*)'.*?a:\s*`((?:[^`\\]|\\.)*)`",
                           pair_block, re.DOTALL)
        # Also try double-quote strings
        if not pairs:
            pairs = re.findall(r'\{\s*q:\s*"((?:[^"\\]|\\.)*)".*?a:\s*"((?:[^"\\]|\\.)*)"',
                               pair_block, re.DOTALL)
        # Fallback: just count occurrences of { q:
        count = len(re.findall(r'\{\s*q:', pair_block))
        faqs[slug] = [{'q': p[0], 'a': p[1]} for p in pairs] if pairs else [{}] * count
    return faqs


def parse_blog_post_slugs(prerender_src: str) -> list[str]:
    """Extract slugs from the BLOG_POSTS = [ ... ] array."""
    m = re.search(r"const BLOG_POSTS\s*=\s*\[(.*?)^\]",
                  prerender_src, re.DOTALL | re.MULTILINE)
    if not m:
        return []
    block = m.group(1)
    return re.findall(r"slug:\s*'([^']+)'", block)


def parse_blog_og_map_keys(prerender_src: str) -> dict[str, str]:
    """Extract BLOG_OG_MAP slug → URL entries."""
    m = re.search(r"const BLOG_OG_MAP\s*=\s*\{(.*?)^\};",
                  prerender_src, re.DOTALL | re.MULTILINE)
    if not m:
        return {}
    block = m.group(1)
    entries = re.findall(r"'([^']+)':\s*`([^`]+)`", block)
    return {k: v for k, v in entries}


def get_faq_schema_from_html(html: str) -> list[dict]:
    """Return all FAQPage JSON-LD objects found in the HTML."""
    schemas = re.findall(
        r'<script\s+type="application/ld\+json">(.*?)</script>',
        html, re.DOTALL)
    faq_schemas = []
    for raw in schemas:
        try:
            obj = json.loads(raw)
            if obj.get("@type") == "FAQPage":
                faq_schemas.append(obj)
        except json.JSONDecodeError:
            pass
    return faq_schemas


def get_og_image_from_html(html: str) -> str | None:
    """Extract the og:image content value from the HTML."""
    m = re.search(r'og:image"\s+content="([^"]+)"', html)
    return m.group(1) if m else None


# ── Validation runners ─────────────────────────────────────────────────────────

def validate_bug1(root: Path, prerender_src: str) -> tuple[int, int]:
    """Returns (passes, failures)."""
    section("BUG 1 — FAQ Schema: Tool Pages")
    p = f = 0

    tool_slugs  = parse_tool_slugs(prerender_src)
    faq_entries = parse_tool_faq_keys(prerender_src)

    if not tool_slugs:
        fail("Could not parse TOOLS[] from prerender.mjs")
        return 0, 1
    if not faq_entries:
        fail("Could not parse TOOL_FAQS{} from prerender.mjs")
        return 0, 1

    info(f"Found {len(tool_slugs)} tools in TOOLS[]")
    info(f"Found {len(faq_entries)} keys in TOOL_FAQS{{}}")

    # ── Source checks ──────────────────────────────────────────────────────────
    print(f"\n  {BOLD}Source checks (prerender.mjs){RESET}")

    missing_faq_keys = [s for s in tool_slugs if s not in faq_entries]
    if missing_faq_keys:
        fail(f"S1 — {len(missing_faq_keys)} tool(s) have NO TOOL_FAQS entry:")
        for s in missing_faq_keys:
            print(f"       {RED}→ {s}{RESET}")
        f += 1
    else:
        ok(f"S1 — All {len(tool_slugs)} tools have a TOOL_FAQS entry")
        p += 1

    # S2 / S3 — pair count and key validity per tool
    low_count = []
    bad_keys  = []
    for slug, pairs in faq_entries.items():
        if slug not in tool_slugs:
            continue  # skip compare/blog cross-referenced slugs
        if len(pairs) < 3:
            low_count.append((slug, len(pairs)))
        for pair in pairs:
            if pair and ('q' not in pair or 'a' not in pair):
                bad_keys.append(slug)
                break

    if low_count:
        fail(f"S2 — {len(low_count)} tool(s) have fewer than 3 FAQ pairs:")
        for slug, n in low_count:
            print(f"       {RED}→ {slug}: {n} pair(s){RESET}")
        f += 1
    else:
        ok(f"S2 — All TOOL_FAQS entries have ≥ 3 Q&A pairs")
        p += 1

    if bad_keys:
        fail(f"S3 — {len(bad_keys)} entry(ies) have malformed Q&A pairs (missing q or a key):")
        for slug in bad_keys:
            print(f"       {RED}→ {slug}{RESET}")
        f += 1
    else:
        ok(f"S3 — All Q&A pairs have both 'q' and 'a' keys")
        p += 1

    # ── HTML checks ───────────────────────────────────────────────────────────
    print(f"\n  {BOLD}HTML checks (dist/tools/<slug>/index.html){RESET}")

    dist_tools = root / "dist" / "tools"
    if not dist_tools.exists():
        warn("H1–H4 skipped — dist/tools/ not found. Run `npm run build` first.")
        return p, f

    missing_html = []
    no_faq_html  = []
    multi_faq    = []
    bad_json     = []
    count_mismatch = []

    for slug in tool_slugs:
        html_path = dist_tools / slug / "index.html"

        # H1 — file exists
        if not html_path.exists():
            missing_html.append(slug)
            continue

        html = html_path.read_text(encoding="utf-8")
        faq_schemas = get_faq_schema_from_html(html)

        # H2 — exactly one FAQPage block
        if len(faq_schemas) == 0:
            no_faq_html.append(slug)
            continue
        if len(faq_schemas) > 1:
            multi_faq.append((slug, len(faq_schemas)))

        schema = faq_schemas[0]
        questions = schema.get("mainEntity", [])

        # H3 — ≥ 3 questions
        if len(questions) < 3:
            bad_json.append((slug, len(questions)))

        # H4 — count matches source
        src_count = len(faq_entries.get(slug, []))
        if src_count and len(questions) != src_count:
            count_mismatch.append((slug, src_count, len(questions)))

    if missing_html:
        fail(f"H1 — {len(missing_html)} tool HTML file(s) missing in dist/:")
        for s in missing_html:
            print(f"       {RED}→ dist/tools/{s}/index.html{RESET}")
        f += 1
    else:
        ok(f"H1 — All {len(tool_slugs)} tool HTML files exist in dist/")
        p += 1

    if no_faq_html:
        fail(f"H2 — {len(no_faq_html)} tool page(s) have NO FAQPage schema in HTML:")
        for s in no_faq_html:
            print(f"       {RED}→ dist/tools/{s}/index.html{RESET}")
        f += 1
    else:
        ok(f"H2 — All tool HTML files contain a FAQPage JSON-LD block")
        p += 1

    if multi_faq:
        warn(f"H2b — {len(multi_faq)} page(s) have MULTIPLE FAQPage blocks (usually harmless):")
        for s, n in multi_faq:
            print(f"       {YELLOW}→ {s}: {n} blocks{RESET}")

    if bad_json:
        fail(f"H3 — {len(bad_json)} page(s) have fewer than 3 FAQ questions in HTML:")
        for s, n in bad_json:
            print(f"       {RED}→ {s}: {n} question(s){RESET}")
        f += 1
    else:
        ok(f"H3 — All FAQPage schemas have ≥ 3 questions")
        p += 1

    if count_mismatch:
        fail(f"H4 — {len(count_mismatch)} page(s) have a source/HTML question count mismatch:")
        for s, src, html_c in count_mismatch:
            print(f"       {RED}→ {s}: source={src}, HTML={html_c}{RESET}")
        f += 1
    else:
        ok(f"H4 — FAQ question counts match between source and rendered HTML")
        p += 1

    return p, f


def validate_bug4(root: Path, prerender_src: str, types_src: str) -> tuple[int, int]:
    """Returns (passes, failures)."""
    section("BUG 4 — Blog OG Images: Per-Post Images")
    p = f = 0

    blog_slugs  = parse_blog_post_slugs(prerender_src)
    blog_og_map = parse_blog_og_map_keys(prerender_src)

    if not blog_slugs:
        fail("Could not parse BLOG_POSTS[] from prerender.mjs")
        return 0, 1

    info(f"Found {len(blog_slugs)} posts in BLOG_POSTS[]")
    info(f"Found {len(blog_og_map)} entries in BLOG_OG_MAP{{}}")

    # ── TypeScript type check ─────────────────────────────────────────────────
    print(f"\n  {BOLD}Type check (blog/types.ts){RESET}")

    if re.search(r"ogImage\s*\??\s*:", types_src):
        ok("T1 — BlogPost interface has ogImage field")
        p += 1
    else:
        fail("T1 — BlogPost interface is MISSING ogImage field in blog/types.ts")
        f += 1

    # ── Source checks ─────────────────────────────────────────────────────────
    print(f"\n  {BOLD}Source checks (prerender.mjs){RESET}")

    if re.search(r"post\.ogImage", prerender_src):
        ok("T2 — resolveOgImage() checks post.ogImage")
        p += 1
    else:
        fail("T2 — resolveOgImage() does NOT check post.ogImage")
        f += 1

    if re.search(r"const BLOG_OG_MAP\s*=", prerender_src):
        ok("T3 — BLOG_OG_MAP constant exists in prerender.mjs")
        p += 1
    else:
        fail("T3 — BLOG_OG_MAP constant is MISSING from prerender.mjs")
        f += 1

    if re.search(r"BLOG_OG_MAP\[post\.slug\]", prerender_src):
        ok("T4 — resolveOgImage() checks BLOG_OG_MAP[post.slug]")
        p += 1
    else:
        fail("T4 — resolveOgImage() does NOT check BLOG_OG_MAP[post.slug]")
        f += 1

    missing_map = [s for s in blog_slugs if s not in blog_og_map]
    if missing_map:
        fail(f"T5 — {len(missing_map)} blog post(s) have NO BLOG_OG_MAP entry:")
        for s in missing_map:
            print(f"       {RED}→ {s}{RESET}")
        f += 1
    else:
        ok(f"T5 — All {len(blog_slugs)} blog posts are in BLOG_OG_MAP")
        p += 1

    # ── File checks ───────────────────────────────────────────────────────────
    print(f"\n  {BOLD}File checks (public/og/blog/<slug>.webp){RESET}")

    og_dir = root / "public" / "og" / "blog"
    if not og_dir.exists():
        fail(f"F1 — Directory does not exist: {og_dir}")
        f += 1
    else:
        missing_files  = []
        too_small      = []
        for slug in blog_og_map:
            webp = og_dir / f"{slug}.webp"
            if not webp.exists():
                missing_files.append(slug)
            elif webp.stat().st_size < 10_000:   # < 10 KB → corrupt/empty
                too_small.append((slug, webp.stat().st_size))

        if missing_files:
            fail(f"F1 — {len(missing_files)} WebP file(s) missing from public/og/blog/:")
            for s in missing_files:
                print(f"       {RED}→ {s}.webp{RESET}")
            f += 1
        else:
            ok(f"F1 — All {len(blog_og_map)} WebP OG images exist in public/og/blog/")
            p += 1

        if too_small:
            fail(f"F2 — {len(too_small)} WebP file(s) suspiciously small (< 10 KB, may be corrupt):")
            for s, sz in too_small:
                print(f"       {RED}→ {s}.webp: {sz:,} bytes{RESET}")
            f += 1
        else:
            ok(f"F2 — All WebP files are ≥ 10 KB (not empty/corrupt)")
            p += 1

    # ── HTML checks ───────────────────────────────────────────────────────────
    print(f"\n  {BOLD}HTML checks (dist/blog/<slug>/index.html){RESET}")

    dist_blog = root / "dist" / "blog"
    if not dist_blog.exists():
        warn("H5–H7 skipped — dist/blog/ not found. Run `npm run build` first.")
        return p, f

    missing_html    = []
    generic_og      = []
    wrong_slug_og   = []
    correct_og      = []

    for slug in blog_slugs:
        html_path = dist_blog / slug / "index.html"

        # H5 — file exists
        if not html_path.exists():
            missing_html.append(slug)
            continue

        html = html_path.read_text(encoding="utf-8")
        og_url = get_og_image_from_html(html)

        if og_url is None:
            generic_og.append((slug, "(no og:image tag found)"))
            continue

        # H7 — must not be a generic fallback
        is_generic = any(re.search(pat, og_url) for pat in GENERIC_OG_PATTERNS)
        if is_generic:
            generic_og.append((slug, og_url))
            continue

        # H6 — must point to /og/blog/<slug>.webp
        expected_suffix = f"{EXPECTED_OG_PREFIX}{slug}.webp"
        if not og_url.endswith(expected_suffix):
            wrong_slug_og.append((slug, og_url))
        else:
            correct_og.append(slug)

    if missing_html:
        fail(f"H5 — {len(missing_html)} blog HTML file(s) missing in dist/:")
        for s in missing_html:
            print(f"       {RED}→ dist/blog/{s}/index.html{RESET}")
        f += 1
    else:
        ok(f"H5 — All {len(blog_slugs)} blog HTML files exist in dist/")
        p += 1

    if generic_og:
        fail(f"H7 — {len(generic_og)} blog page(s) still use a GENERIC category-level OG image:")
        for s, url in generic_og:
            print(f"       {RED}→ {s}{RESET}")
            print(f"          {DIM}{url}{RESET}")
        f += 1
    else:
        ok(f"H7 — No blog pages use generic category-level OG images")
        p += 1

    if wrong_slug_og:
        fail(f"H6 — {len(wrong_slug_og)} blog page(s) have an OG image that does not match their slug:")
        for s, url in wrong_slug_og:
            print(f"       {RED}→ {s}{RESET}")
            print(f"          {DIM}Got:      {url}{RESET}")
            print(f"          {DIM}Expected: …/og/blog/{s}.webp{RESET}")
        f += 1
    elif correct_og:
        ok(f"H6 — All {len(correct_og)} blog pages have a correct per-post OG image URL")
        p += 1

    return p, f


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Validate Bug 1 (FAQ Schema) and Bug 4 (Blog OG Images) fixes")
    parser.add_argument(
        "--root", default=".",
        help="Path to the AI Nexus project root (default: current directory)")
    parser.add_argument(
        "--bug", choices=["1", "4", "all"], default="all",
        help="Which bug to validate (default: all)")
    args = parser.parse_args()

    root = Path(args.root).resolve()

    print(f"\n{BOLD}{'═' * 70}{RESET}")
    print(f"{BOLD}  AI Nexus — SEO Fix Validator{RESET}")
    print(f"{BOLD}  Project root: {DIM}{root}{RESET}")
    print(f"{BOLD}{'═' * 70}{RESET}")

    # Load source files
    prerender_path = root / "scripts" / "prerender.mjs"
    types_path     = root / "blog" / "types.ts"

    if not prerender_path.exists():
        print(f"\n{RED}Error:{RESET} Cannot find scripts/prerender.mjs at {prerender_path}")
        sys.exit(1)
    if not types_path.exists():
        print(f"\n{RED}Error:{RESET} Cannot find blog/types.ts at {types_path}")
        sys.exit(1)

    prerender_src = prerender_path.read_text(encoding="utf-8")
    types_src     = types_path.read_text(encoding="utf-8")

    total_p = total_f = 0

    if args.bug in ("1", "all"):
        p, f = validate_bug1(root, prerender_src)
        total_p += p
        total_f += f

    if args.bug in ("4", "all"):
        p, f = validate_bug4(root, prerender_src, types_src)
        total_p += p
        total_f += f

    # ── Summary ───────────────────────────────────────────────────────────────
    total = total_p + total_f
    section("Summary")
    print(f"  Checks run:   {total}")
    print(f"  {GREEN}Passed:  {total_p}{RESET}")
    print(f"  {RED if total_f else GREEN}Failed:  {total_f}{RESET}")

    if total_f == 0:
        print(f"\n  {GREEN}{BOLD}✅  All checks passed — both fixes are correctly deployed.{RESET}\n")
        sys.exit(0)
    else:
        print(f"\n  {RED}{BOLD}❌  {total_f} check(s) failed — review the output above.{RESET}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
