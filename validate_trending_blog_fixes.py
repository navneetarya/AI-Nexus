#!/usr/bin/env python3
"""
AI Nexus — Trending Blog Posts Validator
==========================================
Validates the 3 new trending blog posts added from the May 2026 SEO audit:

  Post 1 · 🔥 Trending +550%  — google-gemini-ai-review-2026          (2026-05-15)
  Post 2 · 🔥 Trending +380%  — claude-code-vs-github-copilot-vs-replit-2026 (2026-05-17)
  Post 3 · 📈 Rising   +280%  — perplexity-ai-review-2026             (2026-05-19)

Checks:
  A  — File existence (all 3 .ts blog files present)
  B  — BlogPost schema fields (slug, title, seoTitle, metaDescription, dates,
        author, category, readTime, excerpt, content, faqs, ogImage)
  C  — Date integrity (backdated, unique, no collision with existing posts)
  D  — Content quality (word count, H2 headings, comparison table, internal links)
  E  — blog/index.ts registry (imports + BLOG_POSTS array)
  F  — public/sitemap.xml (URL entries, lastmod, image tags)
  G  — scripts/prerender.mjs (OG image map + inline BLOG_POSTS entries with FAQs)
  H  — Navigation integrity (App.tsx routing resolves all 3 slugs)
  I  — Cross-dependency (internal links point to existing pages/posts)

Run from project root:
    python validate_trending_blog_fixes.py

Exit codes:
    0 — all checks passed
    1 — one or more CRITICAL checks failed
"""

import os
import re
import sys
import pathlib
from typing import Any

ROOT = pathlib.Path(__file__).parent.resolve()

# ─── ANSI colours ─────────────────────────────────────────────────────────────
RED    = "\033[91m"
GREEN  = "\033[92m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

# ─── Result accumulator ───────────────────────────────────────────────────────
results: list[dict[str, Any]] = []

def check(label: str, ok: bool, detail: str = "", severity: str = "CRITICAL") -> bool:
    icon       = f"{GREEN}✓{RESET}" if ok else (f"{RED}✗{RESET}" if severity == "CRITICAL" else f"{YELLOW}⚠{RESET}")
    sev_color  = RED if severity == "CRITICAL" else (YELLOW if severity == "WARN" else CYAN)
    status     = f"{sev_color}[{severity:8}]{RESET}" if not ok else f"{GREEN}[PASS    ]{RESET}"
    results.append({"label": label, "ok": ok, "detail": detail, "severity": severity})
    msg = f"  {icon}  {label}"
    if detail:
        msg += f"\n           {YELLOW}→ {detail}{RESET}" if not ok else f"\n           {detail}"
    print(f"{status} {msg}")
    return ok

def section(title: str):
    print(f"\n{BOLD}{CYAN}{'─' * 72}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'─' * 72}{RESET}")

def read(rel: str) -> str:
    p = ROOT / rel
    return p.read_text(encoding="utf-8", errors="replace") if p.exists() else ""

def file_exists(rel: str) -> bool:
    return (ROOT / rel).exists()

# ─── The 3 new posts ──────────────────────────────────────────────────────────
NEW_POSTS = [
    {
        "slug":          "google-gemini-ai-review-2026",
        "title_frag":    "Google Gemini AI Review 2026",
        "date":          "2026-05-15",
        "category":      "Writing",
        "min_words":     1800,
        "internal_links": ["/tools/grammarly", "/tools/writesonic",
                           "/blog/grok-4-vs-chatgpt-vs-claude-content-creators-2026"],
        "required_h2s":  ["Verdict", "Pricing", "Gemini"],
        "import_var":    "post29",
    },
    {
        "slug":          "claude-code-vs-github-copilot-vs-replit-2026",
        "title_frag":    "Claude Code vs GitHub Copilot vs Replit",
        "date":          "2026-05-17",
        "category":      "Coding",
        "min_words":     1800,
        "internal_links": ["/tools/replit", "/blog/best-ai-coding-tools-2026"],
        "required_h2s":  ["Claude Code", "Copilot", "Replit"],
        "import_var":    "post30",
    },
    {
        "slug":          "perplexity-ai-review-2026",
        "title_frag":    "Perplexity AI Review 2026",
        "date":          "2026-05-19",
        "category":      "Productivity",
        "min_words":     1800,
        "internal_links": ["/tools/perplexity",
                           "/blog/grok-4-vs-chatgpt-vs-claude-content-creators-2026"],
        "required_h2s":  ["Google", "Perplexity", "Verdict"],
        "import_var":    "post31",
    },
]

# Dates already used by existing posts — new posts must not collide
EXISTING_DATES = {
    "2026-05-03", "2026-05-04", "2026-05-05", "2026-05-06",
    "2026-05-07", "2026-05-12", "2026-05-13", "2026-05-14",
    "2026-05-20", "2026-05-22",
}

# ─── Load files once ──────────────────────────────────────────────────────────
blog_index  = read("blog/index.ts")
sitemap     = read("public/sitemap.xml")
prerender   = read("scripts/prerender.mjs")
app_tsx     = read("App.tsx")

# ═══════════════════════════════════════════════════════════════════════════════
# A — FILE EXISTENCE
# ═══════════════════════════════════════════════════════════════════════════════
section("A — File Existence")

for post in NEW_POSTS:
    slug = post["slug"]
    check(
        f"A · blog/{slug}.ts exists",
        file_exists(f"blog/{slug}.ts"),
        f"Create blog/{slug}.ts and place it in the blog/ directory",
    )

# ═══════════════════════════════════════════════════════════════════════════════
# B — BlogPost schema fields
# ═══════════════════════════════════════════════════════════════════════════════
section("B — BlogPost Schema Fields")

REQUIRED_FIELDS = [
    "slug", "title", "seoTitle", "metaDescription",
    "datePublished", "dateModified", "author", "category",
    "readTime", "excerpt", "content", "faqs", "ogImage",
]

for post in NEW_POSTS:
    slug    = post["slug"]
    content = read(f"blog/{slug}.ts")
    if not content:
        check(f"B · {slug}: file readable", False, "File missing or empty")
        continue

    for field in REQUIRED_FIELDS:
        check(
            f"B · {slug}: has '{field}' field",
            f"{field}:" in content,
            f"Add '{field}:' to the BlogPost object in blog/{slug}.ts",
        )

    # author must be Navneet Arya
    check(
        f"B · {slug}: author is 'Navneet Arya'",
        "Navneet Arya" in content,
        "Set author: 'Navneet Arya' — must match the rest of the site",
    )

    # ogImage must follow convention: /og/blog/<slug>.webp
    expected_og = f"/og/blog/{slug}.webp"
    check(
        f"B · {slug}: ogImage follows /og/blog/<slug>.webp convention",
        expected_og in content,
        f"Set ogImage: 'https://ainexustools.online{expected_og}'",
    )

    # category must match expected value
    check(
        f"B · {slug}: category is '{post['category']}'",
        f"category: '{post['category']}'" in content,
        f"Set category: '{post['category']}' in {slug}.ts",
    )

    # faqs must have at least 4 entries
    faq_count = content.count("{ q:")
    check(
        f"B · {slug}: has at least 4 FAQ entries (found {faq_count})",
        faq_count >= 4,
        f"Add at least 4 FAQ pairs to the faqs array — needed for FAQPage schema",
    )

    # export default
    check(
        f"B · {slug}: has 'export default post'",
        "export default post" in content,
        f"Add 'export default post;' at the end of blog/{slug}.ts",
    )

# ═══════════════════════════════════════════════════════════════════════════════
# C — Date integrity
# ═══════════════════════════════════════════════════════════════════════════════
section("C — Date Integrity (Backdated + Unique + No Collision)")

assigned_dates: dict[str, str] = {}  # date → slug

for post in NEW_POSTS:
    slug    = post["slug"]
    content = read(f"blog/{slug}.ts")
    if not content:
        continue

    expected_date = post["date"]

    # datePublished matches expected
    check(
        f"C · {slug}: datePublished is '{expected_date}'",
        f"datePublished: '{expected_date}'" in content,
        f"Set datePublished: '{expected_date}' in {slug}.ts",
    )

    # dateModified matches datePublished (on first publish)
    check(
        f"C · {slug}: dateModified matches datePublished on first publish",
        f"dateModified: '{expected_date}'" in content,
        f"Set dateModified: '{expected_date}' — should match datePublished on initial publish",
    )

    # datePublished is before today (backdated)
    check(
        f"C · {slug}: date {expected_date} is backdated before 2026-05-22",
        expected_date < "2026-05-22",
        f"Date must be before today (2026-05-22) — currently '{expected_date}'",
    )

    # No collision with existing posts
    check(
        f"C · {slug}: date {expected_date} does not collide with existing posts",
        expected_date not in EXISTING_DATES,
        f"Date '{expected_date}' is already used by another post — pick a free date",
    )

    # No two new posts share a date
    if expected_date in assigned_dates:
        other = assigned_dates[expected_date]
        check(
            f"C · {slug}: date {expected_date} is unique among new posts",
            False,
            f"Date collision: '{slug}' and '{other}' both use {expected_date}",
        )
    else:
        check(
            f"C · {slug}: date {expected_date} is unique among new posts",
            True,
        )
        assigned_dates[expected_date] = slug

# ═══════════════════════════════════════════════════════════════════════════════
# D — Content quality
# ═══════════════════════════════════════════════════════════════════════════════
section("D — Content Quality (Word Count, Headings, Tables, Internal Links)")

for post in NEW_POSTS:
    slug    = post["slug"]
    content = read(f"blog/{slug}.ts")
    if not content:
        continue

    # Strip TS boilerplate to count only article prose
    # Extract just the HTML content string (between backtick template literal)
    html_match = re.search(r"content:\s*`([\s\S]+?)`\s*,\s*\}", content)
    html_body  = html_match.group(1) if html_match else content

    # Strip HTML tags for word count
    text_only  = re.sub(r"<[^>]+>", " ", html_body)
    word_count = len(text_only.split())

    check(
        f"D · {slug}: word count ≥ {post['min_words']} (found ~{word_count})",
        word_count >= post["min_words"],
        f"Content is too thin ({word_count} words). Target {post['min_words']}+ words for SEO depth.",
    )

    # H2 headings present
    h2_count = len(re.findall(r"<h2[^>]*>", html_body, re.IGNORECASE))
    check(
        f"D · {slug}: has at least 4 <h2> headings (found {h2_count})",
        h2_count >= 4,
        f"Add more <h2> headings to improve document structure and crawlability",
    )

    # Required H2 keyword fragments
    for frag in post["required_h2s"]:
        check(
            f"D · {slug}: <h2> contains '{frag}'",
            bool(re.search(rf"<h2[^>]*>[^<]*{re.escape(frag)}", html_body, re.IGNORECASE)),
            f"Add an <h2> heading containing '{frag}' — required for topical coverage",
            severity="WARN",
        )

    # Comparison table present
    has_table = "<table" in html_body
    check(
        f"D · {slug}: has a comparison <table>",
        has_table,
        "Add an HTML comparison table — essential for CTR and featured snippet eligibility",
    )

    # Internal links
    for link in post["internal_links"]:
        check(
            f"D · {slug}: internal link to '{link}'",
            link in content,
            f"Add an internal link to '{link}' — required by the audit interlinking strategy",
            severity="WARN",
        )

# ═══════════════════════════════════════════════════════════════════════════════
# E — blog/index.ts registry
# ═══════════════════════════════════════════════════════════════════════════════
section("E — blog/index.ts Registry")

for post in NEW_POSTS:
    slug     = post["slug"]
    var      = post["import_var"]

    # import statement
    check(
        f"E · blog/index.ts: imports '{slug}' as {var}",
        f"import {var} from './{slug}'" in blog_index,
        f"Add: import {var} from './{slug}'; to blog/index.ts",
    )

    # registered in BLOG_POSTS array
    check(
        f"E · blog/index.ts: {var} present in BLOG_POSTS array",
        var in blog_index and
        bool(re.search(rf"BLOG_POSTS.*{re.escape(var)}", blog_index, re.DOTALL)),
        f"Add {var} to the BLOG_POSTS = [ ... ] array in blog/index.ts",
    )

# All 3 vars appear together in one BLOG_POSTS line/block
vars_in_array = all(
    v in blog_index for v in [p["import_var"] for p in NEW_POSTS]
)
check(
    "E · blog/index.ts: all 3 new post vars registered in BLOG_POSTS",
    vars_in_array,
    "Ensure post29, post30, post31 are all listed in the BLOG_POSTS array",
)

# Total import count — should now be 31
import_count = len(re.findall(r"^import post\d+", blog_index, re.MULTILINE))
check(
    f"E · blog/index.ts: total imports = 31 (found {import_count})",
    import_count == 31,
    f"Expected 31 post imports (28 original + 3 new). Found {import_count}.",
    severity="WARN",
)

# ═══════════════════════════════════════════════════════════════════════════════
# F — public/sitemap.xml
# ═══════════════════════════════════════════════════════════════════════════════
section("F — public/sitemap.xml")

for post in NEW_POSTS:
    slug = post["slug"]
    date = post["date"]
    url  = f"https://ainexustools.online/blog/{slug}/"

    # URL entry present
    check(
        f"F · sitemap.xml: <loc> entry for '{slug}'",
        url in sitemap,
        f"Add <url><loc>{url}</loc>...</url> to public/sitemap.xml",
    )

    # lastmod matches datePublished
    check(
        f"F · sitemap.xml: lastmod='{date}' for '{slug}'",
        f"lastmod>{date}<" in sitemap or f"lastmod={date}" in sitemap or
        bool(re.search(rf"{re.escape(url)}.*?lastmod>{date}", sitemap, re.DOTALL)) or
        bool(re.search(rf"lastmod>{date}", sitemap) and url in sitemap),
        f"Set <lastmod>{date}</lastmod> for {slug} in sitemap.xml",
    )

    # priority set to 0.90
    check(
        f"F · sitemap.xml: priority=0.90 for '{slug}'",
        bool(re.search(
            rf"{re.escape(url)}.*?priority>0\.90<",
            sitemap, re.DOTALL
        )),
        f"Set <priority>0.90</priority> for {slug} — trending posts deserve high crawl priority",
        severity="WARN",
    )

    # image:image tag present
    og_image_ref = f"/og/blog/{slug}.webp"
    check(
        f"F · sitemap.xml: image:image tag for '{slug}'",
        og_image_ref in sitemap,
        f"Add <image:image><image:loc>https://ainexustools.online{og_image_ref}</image:loc></image:image>",
        severity="WARN",
    )

# Sitemap has image namespace
check(
    "F · sitemap.xml: image namespace declared",
    'xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"' in sitemap,
    "sitemap.xml must declare xmlns:image namespace for image tags to be valid",
)

# Confirm sitemap closes properly
check(
    "F · sitemap.xml: closes with </urlset>",
    sitemap.strip().endswith("</urlset>"),
    "sitemap.xml does not end with </urlset> — it may be malformed",
)

# ═══════════════════════════════════════════════════════════════════════════════
# G — scripts/prerender.mjs
# ═══════════════════════════════════════════════════════════════════════════════
section("G — scripts/prerender.mjs")

for post in NEW_POSTS:
    slug = post["slug"]
    date = post["date"]

    # OG image map entry
    check(
        f"G · prerender.mjs: OG image map has '{slug}'",
        f"'{slug}'" in prerender and f"/og/blog/{slug}.webp" in prerender,
        f"Add '{slug}': `${{SITE}}/og/blog/{slug}.webp` to the OG image slug map",
    )

    # Inline BLOG_POSTS entry (slug field)
    slug_pattern = rf"slug:\s*'{re.escape(slug)}'"
    check(
        f"G · prerender.mjs: inline BLOG_POSTS has slug '{slug}'",
        bool(re.search(slug_pattern, prerender)),
        f"Add a BLOG_POSTS object with slug: '{slug}' to scripts/prerender.mjs",
    )

    # datePublished in inline BLOG_POSTS entry
    check(
        f"G · prerender.mjs: inline entry has datePublished '{date}'",
        bool(re.search(
            rf"slug:\s*'{re.escape(slug)}'[\s\S]{{0,500}}datePublished:\s*'{re.escape(date)}'",
            prerender
        )),
        f"Set datePublished: '{date}' in the inline BLOG_POSTS entry for '{slug}'",
    )

    # FAQs in inline entry (at least 4)
    # Find the block for this slug and count q: entries within it
    slug_block_match = re.search(
        rf"slug:\s*'{re.escape(slug)}'([\s\S]{{0,3000}?}}[\s\S]{{0,100}}),\s*\n  [{{/]",
        prerender
    )
    if slug_block_match:
        block_faqs = slug_block_match.group(1).count("{ q:")
    else:
        # Fallback: just count total after slug declaration
        slug_pos = prerender.find(f"slug: '{slug}'")
        block_text = prerender[slug_pos:slug_pos + 3000] if slug_pos >= 0 else ""
        block_faqs = block_text.count("{ q:")

    check(
        f"G · prerender.mjs: inline entry for '{slug}' has ≥4 FAQs (found {block_faqs})",
        block_faqs >= 4,
        f"Add at least 4 FAQ pairs to the inline BLOG_POSTS entry for '{slug}' in prerender.mjs",
    )

# Total BLOG_POSTS in prerender (count slug: entries in the array after const BLOG_POSTS)
prerender_bp_start = prerender.find("const BLOG_POSTS = [")
prerender_bp_block = prerender[prerender_bp_start:] if prerender_bp_start >= 0 else ""
prerender_slug_count = len(re.findall(r"slug:", prerender_bp_block[:prerender_bp_block.find("\nconst template") if "\nconst template" in prerender_bp_block else len(prerender_bp_block)]))
check(
    f"G · prerender.mjs: BLOG_POSTS array has 31 entries (found {prerender_slug_count})",
    prerender_slug_count == 31,
    f"Expected 31 entries in BLOG_POSTS (28 original + 3 new). Found {prerender_slug_count}.",
    severity="WARN",
)

# ═══════════════════════════════════════════════════════════════════════════════
# H — Navigation integrity (App.tsx routing)
# ═══════════════════════════════════════════════════════════════════════════════
section("H — Navigation Integrity (App.tsx Routing)")

# App.tsx must import BLOG_POSTS from blog/index
check(
    "H · App.tsx: imports BLOG_POSTS from './blog/index'",
    "BLOG_POSTS" in app_tsx and "blog/index" in app_tsx,
    "App.tsx must import BLOG_POSTS from './blog/index' for routing to work",
)

# App.tsx must use dynamic /blog/:slug routing (not hardcoded slugs)
check(
    "H · App.tsx: uses dynamic /blog/:slug pattern",
    bool(re.search(r"/blog/\(\[^/\]\+\)|blogPostMatch|blog/.*slug", app_tsx)),
    "App.tsx must match /blog/:slug dynamically against BLOG_POSTS — do not hardcode slugs",
)

# BlogPostPage imported
check(
    "H · App.tsx: BlogPostPage component imported",
    "BlogPostPage" in app_tsx,
    "BlogPostPage must be imported in App.tsx for blog post rendering",
)

# Blog list page imported
check(
    "H · App.tsx: BlogPage component imported",
    "BlogPage" in app_tsx,
    "BlogPage must be imported in App.tsx for the /blog listing page",
)

# All 3 new slugs are discoverable via BLOG_POSTS (since routing is dynamic,
# registering in blog/index.ts is sufficient — we already checked E)
for post in NEW_POSTS:
    slug = post["slug"]
    # The routing works if: App.tsx uses BLOG_POSTS dynamically (checked above)
    # AND the slug is in blog/index.ts (checked in section E)
    in_index = f"'{slug}'" in blog_index or slug in blog_index
    check(
        f"H · /blog/{slug}/ route resolves via BLOG_POSTS registry",
        in_index,
        f"'{slug}' must be in blog/index.ts BLOG_POSTS for App.tsx dynamic routing to serve it",
    )

# /blog listing page will show all 3 new posts (it renders from BLOG_POSTS)
blog_page = read("pages/BlogPage.tsx")
check(
    "H · pages/BlogPage.tsx: renders from BLOG_POSTS (not hardcoded list)",
    "BLOG_POSTS" in blog_page,
    "BlogPage.tsx must import and render from BLOG_POSTS — new posts won't appear otherwise",
)

# ═══════════════════════════════════════════════════════════════════════════════
# I — Cross-dependency: internal links resolve to existing pages
# ═══════════════════════════════════════════════════════════════════════════════
section("I — Cross-Dependency (Internal Links Resolve)")

# Tools that must exist in constants.ts
constants = read("constants.ts")

LINKED_TOOLS = ["grammarly", "writesonic", "replit", "perplexity"]
for tool in LINKED_TOOLS:
    check(
        f"I · constants.ts: tool slug '{tool}' exists (link target)",
        f"slug: '{tool}'" in constants or f'slug: "{tool}"' in constants,
        f"Tool '{tool}' is linked from new blog posts but may not exist in constants.ts TOOLS",
        severity="WARN",
    )

# Blog posts that are linked from new posts — must exist
LINKED_BLOGS = [
    "grok-4-vs-chatgpt-vs-claude-content-creators-2026",
    "best-ai-coding-tools-2026",
]
for linked_slug in LINKED_BLOGS:
    check(
        f"I · blog/{linked_slug}.ts exists (link target)",
        file_exists(f"blog/{linked_slug}.ts"),
        f"blog/{linked_slug}.ts is linked from new posts but the file doesn't exist",
        severity="WARN",
    )

# Verify new posts don't link to each other with broken slugs
for post in NEW_POSTS:
    content = read(f"blog/{post['slug']}.ts")
    # Check no /blog/ links point to non-existent slugs
    blog_links = re.findall(r'/blog/([\w-]+)', content)
    for linked in blog_links:
        exists = file_exists(f"blog/{linked}.ts") or any(p["slug"] == linked for p in NEW_POSTS)
        check(
            f"I · {post['slug']}: internal link '/blog/{linked}' resolves",
            exists,
            f"blog/{linked}.ts does not exist — fix or remove the link in {post['slug']}.ts",
            severity="WARN",
        )

# No new post links to /tools/ slugs that don't exist
for post in NEW_POSTS:
    content = read(f"blog/{post['slug']}.ts")
    tool_links = re.findall(r'/tools/([\w-]+)', content)
    for linked_tool in tool_links:
        tool_exists = (f"slug: '{linked_tool}'" in constants or
                       f'slug: "{linked_tool}"' in constants)
        check(
            f"I · {post['slug']}: internal link '/tools/{linked_tool}' resolves",
            tool_exists,
            f"Tool slug '{linked_tool}' doesn't exist in constants.ts — fix the link",
            severity="WARN",
        )

# ═══════════════════════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════
section("SUMMARY")

critical_fails = [r for r in results if not r["ok"] and r["severity"] == "CRITICAL"]
warn_fails     = [r for r in results if not r["ok"] and r["severity"] == "WARN"]
passed         = [r for r in results if r["ok"]]
total          = len(results)

print(f"\n  {GREEN}Passed   : {len(passed)}/{total}{RESET}")
print(f"  {RED}Critical : {len(critical_fails)}{RESET}")
print(f"  {YELLOW}Warnings : {len(warn_fails)}{RESET}")

if critical_fails:
    print(f"\n{RED}{BOLD}  CRITICAL FAILURES — fix before deploying:{RESET}")
    for r in critical_fails:
        print(f"  {RED}✗  {r['label']}{RESET}")
        if r["detail"]:
            print(f"     {YELLOW}→ {r['detail']}{RESET}")

if warn_fails:
    print(f"\n{YELLOW}{BOLD}  WARNINGS — address before next audit:{RESET}")
    for r in warn_fails:
        print(f"  {YELLOW}⚠  {r['label']}{RESET}")
        if r["detail"]:
            print(f"     → {r['detail']}")

print(f"""
{BOLD}{CYAN}{'═' * 72}{RESET}
{BOLD}  TRENDING BLOG POSTS — VALIDATION COMPLETE{RESET}
{BOLD}{CYAN}{'═' * 72}{RESET}
  A  File existence        — 3 new .ts files present in blog/
  B  BlogPost schema       — all required fields, author, ogImage, FAQs
  C  Date integrity        — backdated, unique, no collision with existing
  D  Content quality       — word count, H2s, tables, internal links
  E  blog/index.ts         — imports + BLOG_POSTS array registration
  F  public/sitemap.xml    — URL entries, lastmod, priority, image tags
  G  scripts/prerender.mjs — OG image map + inline BLOG_POSTS with FAQs
  H  Navigation integrity  — App.tsx routing resolves all 3 slugs
  I  Cross-dependency      — all linked /tools/ and /blog/ targets exist
{BOLD}{CYAN}{'═' * 72}{RESET}
  Posts validated:
    🔥 +550%  google-gemini-ai-review-2026           → 2026-05-15
    🔥 +380%  claude-code-vs-github-copilot-vs-replit-2026 → 2026-05-17
    📈 +280%  perplexity-ai-review-2026              → 2026-05-19
{BOLD}{CYAN}{'═' * 72}{RESET}
""")

sys.exit(1 if critical_fails else 0)
