#!/usr/bin/env python3
"""
validate_grok_blog_fix.py
=========================
Validates all changes made to integrate the blog post:
  "Grok 4 vs ChatGPT vs Claude: Which AI Is Best for Content Creators in 2026?"

Run from the ROOT of your AI-Nexus repo:
  python validate_grok_blog_fix.py

Exit code 0 = all checks passed — safe to push.
Exit code 1 = one or more checks failed.
"""

import re
import sys
import os

# ── Paths (relative to repo root) ─────────────────────────────────────────────
BLOG_POST_FILE  = os.path.join("blog", "grok-4-vs-chatgpt-vs-claude-content-creators-2026.ts")
BLOG_INDEX_FILE = os.path.join("blog", "index.ts")
SITEMAP_FILE    = os.path.join("public", "sitemap.xml")
PRERENDER_FILE  = os.path.join("scripts", "prerender.mjs")
DEPLOY_FILE     = os.path.join(".github", "workflows", "deploy.yml")

SLUG = "grok-4-vs-chatgpt-vs-claude-content-creators-2026"

# ── Colour helpers ─────────────────────────────────────────────────────────────
PASS = "\033[92m✅ PASS\033[0m"
FAIL = "\033[91m❌ FAIL\033[0m"
SEP  = "─" * 65

failures = []

def read(path):
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def check(label, condition, detail=""):
    status = PASS if condition else FAIL
    print(f"  {status}  {label}")
    if not condition:
        if detail:
            print(f"         └─ {detail}")
        failures.append(label)
    return condition

def section(title):
    print(f"\n{SEP}\n  {title}\n{SEP}")


# ══════════════════════════════════════════════════════════════════════════════
# 1.  BLOG POST FILE
# ══════════════════════════════════════════════════════════════════════════════
section(f"1 · Blog post file — {BLOG_POST_FILE}")

bp = read(BLOG_POST_FILE)
check("File exists",
      bp is not None,
      f"Expected at: {BLOG_POST_FILE}  (run from repo root)")

if bp:
    check("Correct slug field",
          f"slug: '{SLUG}'" in bp)

    check("Has seoTitle field",
          "seoTitle:" in bp)

    check("Has metaDescription",
          "metaDescription:" in bp)

    check("Has datePublished: '2026-05-22'",
          "datePublished: '2026-05-22'" in bp)

    check("Has dateModified: '2026-05-22'",
          "dateModified: '2026-05-22'" in bp)

    check("Has author field",
          "author:" in bp)

    check("Has ogImage field with correct URL path",
          "ogImage:" in bp and f"og/blog/{SLUG}.webp" in bp)

    # FAQs — multi-line format:  q:\n or  q: ' both styles
    faq_count = len(re.findall(r"^\s+q:\s+['\"]", bp, re.MULTILINE))
    check(f"Has at least 5 FAQ entries (found {faq_count})",
          faq_count >= 5)

    check("Content covers all 3 tools (Grok 4, ChatGPT, Claude)",
          all(tool in bp for tool in ["Grok 4", "ChatGPT", "Claude"]))

    check("Content has a comparison table (HTML <table>)",
          "<table" in bp)

    check("Content has pricing information",
          any(p in bp for p in ["$20/mo", "$16/mo", "$30/mo", "SuperGrok", "pricing"]))

    check("Content has internal link to /tools/grammarly",
          "/tools/grammarly" in bp)

    check("Content has internal link to /tools/writesonic or /tools/rytr",
          "/tools/writesonic" in bp or "/tools/rytr" in bp)

    check("Content has at least one internal /blog/ link (cross-linking)",
          "/blog/" in bp)

    check("Exports default post object",
          "export default post" in bp)

    check("No TODO or PLACEHOLDER left in content",
          "TODO" not in bp and "PLACEHOLDER" not in bp)


# ══════════════════════════════════════════════════════════════════════════════
# 2.  BLOG INDEX — blog/index.ts
# ══════════════════════════════════════════════════════════════════════════════
section(f"2 · Blog registry — {BLOG_INDEX_FILE}")

idx = read(BLOG_INDEX_FILE)
check("File exists", idx is not None)

if idx:
    check("Import statement for new post present",
          f"from './{SLUG}'" in idx or f'from "./{SLUG}"' in idx)

    import_match = re.search(
        r"import\s+(post\d+)\s+from\s+['\"]\./" + re.escape(SLUG) + r"['\"]",
        idx
    )
    post_var = import_match.group(1) if import_match else None

    check("Import assigned to a postN variable",
          post_var is not None,
          "Pattern `import postN from './slug'` not found.")

    if post_var:
        after_export = idx.split("export const BLOG_POSTS")[1] if "export const BLOG_POSTS" in idx else ""
        check(f"'{post_var}' is listed inside BLOG_POSTS array",
              post_var in after_export)


# ══════════════════════════════════════════════════════════════════════════════
# 3.  SITEMAP — public/sitemap.xml
# ══════════════════════════════════════════════════════════════════════════════
section(f"3 · Sitemap — {SITEMAP_FILE}")

sm = read(SITEMAP_FILE)
check("File exists", sm is not None)

if sm:
    url = f"https://ainexustools.online/blog/{SLUG}/"

    check("URL entry is present",
          url in sm)

    check("changefreq is 'weekly' (trending content signal)",
          bool(re.search(re.escape(url) + r".*?<changefreq>weekly</changefreq>", sm, re.DOTALL)))

    check("priority is 0.90",
          bool(re.search(re.escape(url) + r".*?<priority>0\.90</priority>", sm, re.DOTALL)))

    check("lastmod is 2026-05-22",
          bool(re.search(re.escape(url) + r".*?<lastmod>2026-05-22</lastmod>", sm, re.DOTALL)))

    check("image:image OG WebP reference present",
          f"og/blog/{SLUG}.webp" in sm)

    check("image:title tag present",
          "Grok 4 vs ChatGPT vs Claude for Content Creators 2026" in sm)

    check("Entry appears before closing </urlset>",
          (url in sm and "</urlset>" in sm and sm.index(url) < sm.index("</urlset>")))

    check("XML structure intact (<urlset> opens and closes)",
          "<urlset" in sm and "</urlset>" in sm)

    occurrences = sm.count(url)
    check(f"URL appears exactly once — no duplicate (found {occurrences}x)",
          occurrences == 1)


# ══════════════════════════════════════════════════════════════════════════════
# 4.  PRERENDER.MJS — the file containing the original bug
# ══════════════════════════════════════════════════════════════════════════════
section(f"4 · Prerender script — {PRERENDER_FILE}")

pr = read(PRERENDER_FILE)
check("File exists", pr is not None)

if pr:
    # ── 4a. BLOG_OG_MAP ───────────────────────────────────────────────────────
    check("BLOG_OG_MAP entry present",
          f"'{SLUG}'" in pr)

    check("BLOG_OG_MAP uses correct WebP path pattern",
          f"'{SLUG}': `${{SITE}}/og/blog/{SLUG}.webp`" in pr)

    # ── 4b. BLOG_POSTS inline array ───────────────────────────────────────────
    array_start = pr.find("const BLOG_POSTS = [")
    array_end   = pr.find("\n];\n\nconst template = readTemplate();", array_start)
    segment = pr[array_start:array_end] if (array_start != -1 and array_end != -1) else ""

    check("BLOG_POSTS array block located in file",
          segment != "",
          "Could not find 'const BLOG_POSTS = [' … '];\\n\\nconst template' boundaries.")

    if segment:
        slugs = re.findall(r"slug:\s*'([^']+)'", segment)

        check(f"New slug present in BLOG_POSTS (found {len(slugs)} total entries)",
              SLUG in slugs)

        check("BLOG_POSTS has exactly 26 entries (25 original + 1 new)",
              len(slugs) == 26,
              f"Found {len(slugs)}. Missing or extra entries: {set(slugs) - {SLUG}}")

        # ── THE CRITICAL BUG CHECK ────────────────────────────────────────────
        # The original bug: Python replacement produced  },\n,\n  which creates
        # an undefined hole in the JS array → TypeError: Cannot read properties
        # of undefined (reading 'slug') at prerender.mjs:1733
        stray_comma = re.search(r'\},\s*\n\s*,\s*\n', segment)
        check(
            "No stray standalone comma between entries (the TypeError root cause)",
            stray_comma is None,
            "Found pattern  },\\n,\\n  inside BLOG_POSTS. This creates an "
            "undefined array slot. Remove the lone comma line."
        )

        # ── Verify new entry has all required prerender fields ────────────────
        grok_start = segment.find(f"slug: '{SLUG}'")
        entry_slice = segment[max(0, grok_start - 10): grok_start + 900] if grok_start != -1 else ""

        check("New BLOG_POSTS entry has 'title' field",
              "title:" in entry_slice)

        check("New BLOG_POSTS entry has 'metaDescription' field",
              "metaDescription:" in entry_slice)

        check("New BLOG_POSTS entry has 'datePublished' field",
              "datePublished:" in entry_slice)

        check("New BLOG_POSTS entry has 'faqs' array",
              "faqs:" in entry_slice)

        check("New BLOG_POSTS entry has 'readTimeMinutes' field",
              "readTimeMinutes:" in entry_slice)

        # ── Position check: new entry should be last ─────────────────────────
        pos = slugs.index(SLUG) if SLUG in slugs else -1
        check("New post is appended as the last entry in BLOG_POSTS",
              pos == len(slugs) - 1,
              f"Found at index {pos}, expected index {len(slugs) - 1}.")


# ══════════════════════════════════════════════════════════════════════════════
# 5.  CI / DEPLOY WORKFLOW
# ══════════════════════════════════════════════════════════════════════════════
section(f"5 · CI workflow — {DEPLOY_FILE}")

dy = read(DEPLOY_FILE)
check("File exists", dy is not None)

if dy:
    check("New slug is present in deploy.yml",
          SLUG in dy)

    blog_loop = next(
        (ln for ln in dy.splitlines()
         if "for slug in" in ln and "best-ai-writing-tools-for-beginners-2026" in ln),
        None
    )
    check("Slug is in the correct blog-post validation for-loop",
          blog_loop is not None and SLUG in (blog_loop or ""),
          "Could not find the blog slug loop, or slug not in it.")


# ══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════════════════════════
print(f"\n{SEP}")
if failures:
    print(f"\n  \033[91m{len(failures)} check(s) FAILED:\033[0m")
    for f in failures:
        print(f"    • {f}")
    print(f"\n  Fix the issues above before pushing to GitHub.\n{SEP}\n")
    sys.exit(1)
else:
    print(f"\n  \033[92mAll checks passed — the integration is valid.\033[0m")
    print(f"  Safe to commit and push. The build will succeed.\n{SEP}\n")
    sys.exit(0)
