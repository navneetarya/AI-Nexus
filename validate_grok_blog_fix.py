#!/usr/bin/env python3
"""
validate_grok_blog_fix.py
=========================
Validates integration for:
  grok-4-vs-chatgpt-vs-claude-content-creators-2026

Run from repository root:
  python validate_grok_blog_fix.py

Exit code:
  0 = all checks passed
  1 = one or more checks failed
"""

import os
import re
import sys

# Paths relative to repository root
BLOG_POST_FILE = os.path.join("blog", "grok-4-vs-chatgpt-vs-claude-content-creators-2026.ts")
BLOG_INDEX_FILE = os.path.join("blog", "index.ts")
SITEMAP_CANDIDATES = [
    os.path.join("dist", "sitemap.xml"),
    os.path.join("public", "sitemap.xml"),
]
PRERENDER_FILE = os.path.join("scripts", "prerender.mjs")
DEPLOY_FILE = os.path.join(".github", "workflows", "deploy.yml")

SLUG = "grok-4-vs-chatgpt-vs-claude-content-creators-2026"
CANONICAL_URL = f"https://ainexustools.online/blog/{SLUG}/"

PASS = "\033[92mPASS\033[0m"
FAIL = "\033[91mFAIL\033[0m"
SEP = "-" * 72

failures = []


def read(path):
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def check(label, condition, detail=""):
    status = PASS if condition else FAIL
    print(f"  [{status}] {label}")
    if not condition:
        if detail:
            print(f"         -> {detail}")
        failures.append(label)
    return condition


def section(title):
    print(f"\n{SEP}\n{title}\n{SEP}")


def is_iso_date(value):
    return bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", value or ""))


def extract_field(content, field_name):
    m = re.search(rf"{re.escape(field_name)}\s*:\s*['\"]([^'\"]+)['\"]", content)
    return m.group(1) if m else None


def select_existing_sitemap():
    for path in SITEMAP_CANDIDATES:
        if os.path.exists(path):
            return path
    return None


# 1) Blog source file
section(f"1) Blog post source: {BLOG_POST_FILE}")

bp = read(BLOG_POST_FILE)
check("Source file exists", bp is not None, f"Missing: {BLOG_POST_FILE}")

if bp:
    check("Correct slug field", f"slug: '{SLUG}'" in bp)
    check("Contains seoTitle", "seoTitle:" in bp)
    check("Contains metaDescription", "metaDescription:" in bp)

    date_published = extract_field(bp, "datePublished")
    date_modified = extract_field(bp, "dateModified")
    check("datePublished present and valid ISO date", is_iso_date(date_published), f"Found: {date_published}")
    check("dateModified present and valid ISO date", is_iso_date(date_modified), f"Found: {date_modified}")

    check("Contains author field", "author:" in bp)
    check("ogImage points to correct blog OG path", "ogImage:" in bp and f"og/blog/{SLUG}.webp" in bp)

    faq_count = len(re.findall(r"^\s+q:\s*['\"]", bp, re.MULTILINE))
    check(f"At least 5 FAQ entries (found {faq_count})", faq_count >= 5)

    check("Mentions Grok 4, ChatGPT, and Claude", all(token in bp for token in ["Grok 4", "ChatGPT", "Claude"]))
    check("Has comparison table", "<table" in bp)
    check("Has internal /blog/ links", "/blog/" in bp)
    check("Exports default post", "export default post" in bp)
    check("No TODO/PLACEHOLDER markers", "TODO" not in bp and "PLACEHOLDER" not in bp)


# 2) Blog registry
section(f"2) Blog registry: {BLOG_INDEX_FILE}")

idx = read(BLOG_INDEX_FILE)
check("Registry file exists", idx is not None, f"Missing: {BLOG_INDEX_FILE}")

if idx:
    check("Import statement for slug is present", f"from './{SLUG}'" in idx or f'from "./{SLUG}"' in idx)

    import_match = re.search(r"import\s+(post\d+)\s+from\s+['\"]\./" + re.escape(SLUG) + r"['\"]", idx)
    post_var = import_match.group(1) if import_match else None

    check("Import uses postN variable pattern", post_var is not None, "Expected: import postN from './<slug>'")

    if post_var and "export const BLOG_POSTS" in idx:
        tail = idx.split("export const BLOG_POSTS", 1)[1]
        check(f"{post_var} appears in BLOG_POSTS export", post_var in tail)


# 3) Sitemap (dist preferred, public fallback)
sitemap_path = select_existing_sitemap()
section(f"3) Sitemap: {sitemap_path or '(none found)'}")

sm = read(sitemap_path) if sitemap_path else None
check("Sitemap exists (dist/sitemap.xml or public/sitemap.xml)", sm is not None)

if sm:
    check("Canonical URL entry present", CANONICAL_URL in sm)

    url_block_match = re.search(rf"<url>\s*<loc>{re.escape(CANONICAL_URL)}</loc>(.*?)</url>", sm, re.DOTALL)
    url_block = url_block_match.group(1) if url_block_match else ""

    check("Dedicated <url> block found for canonical URL", bool(url_block))

    if url_block:
        check("Contains <lastmod> with ISO date", bool(re.search(r"<lastmod>\d{4}-\d{2}-\d{2}</lastmod>", url_block)))
        check("Contains <changefreq>", "<changefreq>" in url_block and "</changefreq>" in url_block)
        check("Contains <priority>", "<priority>" in url_block and "</priority>" in url_block)
        check(
            "Contains image reference for the post",
            "<image:loc>" in url_block and (
                f"og/blog/{SLUG}.webp" in url_block or "og-blog-writing.webp" in url_block
            ),
        )

    occurrences = sm.count(CANONICAL_URL)
    check(f"Canonical URL appears exactly once (found {occurrences})", occurrences == 1)


# 4) Prerender checks
section(f"4) Prerender script: {PRERENDER_FILE}")

pr = read(PRERENDER_FILE)
check("Prerender file exists", pr is not None)

if pr:
    check("BLOG_OG_MAP contains slug key", f"'{SLUG}'" in pr)
    check(
        "BLOG_OG_MAP has an OG mapping for slug",
        bool(re.search(rf"'{re.escape(SLUG)}'\s*:\s*`\$\{{SITE\}}/[^`]+`", pr)),
    )

    array_start = pr.find("const BLOG_POSTS = [")
    array_end = pr.find("\n];", array_start) if array_start != -1 else -1
    posts_segment = pr[array_start:array_end] if array_start != -1 and array_end != -1 else ""

    check("BLOG_POSTS array block located", bool(posts_segment))

    if posts_segment:
        check("Slug present in BLOG_POSTS array", f"slug: '{SLUG}'" in posts_segment)

        stray_comma = re.search(r"\},\s*\n\s*,\s*\n", posts_segment)
        check("No standalone stray comma between entries", stray_comma is None)

        slug_pos = posts_segment.find(f"slug: '{SLUG}'")
        entry = posts_segment[slug_pos:slug_pos + 1400] if slug_pos != -1 else ""

        check("Entry object for slug found", bool(entry))
        if entry:
            check("Entry includes title", "title:" in entry)
            check("Entry includes metaDescription", "metaDescription:" in entry)
            check("Entry includes datePublished", "datePublished:" in entry)
            check("Entry includes faqs", "faqs:" in entry)
            check("Entry includes readTimeMinutes", "readTimeMinutes:" in entry)


# 5) Deploy workflow checks
section(f"5) Deploy workflow: {DEPLOY_FILE}")

dy = read(DEPLOY_FILE)
check("Deploy workflow file exists", dy is not None)

if dy:
    check("Slug appears in deploy workflow", SLUG in dy)

    slugs_array_match = re.search(r"BLOG_SLUGS=\((.*?)\)", dy, re.DOTALL)
    if slugs_array_match:
        slugs_array_text = slugs_array_match.group(1)
        check("Slug present in BLOG_SLUGS array", SLUG in slugs_array_text)
    else:
        check("BLOG_SLUGS array exists", False, "Could not locate BLOG_SLUGS=( ... ) block")


# Summary
print(f"\n{SEP}")
if failures:
    print(f"\n{len(failures)} checks failed:")
    for label in failures:
        print(f"  - {label}")
    print("\nFix the failed checks before pushing.\n")
    sys.exit(1)

print("\nAll checks passed. Integration looks valid.\n")
sys.exit(0)
