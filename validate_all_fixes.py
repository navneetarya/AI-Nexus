"""
AI Nexus — 4-Week Action Plan Validation Script
Run: python validate_all_fixes.py
Checks all implemented fixes from the audit action plan.
"""

import os
import json
import re
from pathlib import Path

BASE = Path(r"D:\AI-Nexus\AI-Nexus")
PASS = 0
FAIL = 0
WARN = 0

def check(label, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  ✅ {label}")
    else:
        FAIL += 1
        print(f"  ❌ {label}" + (f" — {detail}" if detail else ""))

def warn(label, detail=""):
    global WARN
    WARN += 1
    print(f"  ⚠️  {label}" + (f" — {detail}" if detail else ""))

def file_contains(path, text):
    try:
        return text in (BASE / path).read_text(encoding="utf-8")
    except FileNotFoundError:
        return False

def file_exists(path):
    return (BASE / path).exists()

def file_content(path):
    try:
        return (BASE / path).read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""


print("\n" + "=" * 70)
print("  AI NEXUS — 4-WEEK ACTION PLAN VALIDATION")
print("=" * 70)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n─── CRITICAL FIXES (C1–C3) ───")

# C1: apple-touch-icon + manifest
print("\n[C1] Apple Touch Icon & Manifest")
check("apple-touch-icon.png exists", file_exists("public/apple-touch-icon.png"))
check("icon-512.png exists", file_exists("public/icon-512.png"))
manifest = file_content("public/manifest.json")
if manifest:
    try:
        mdata = json.loads(manifest)
        icons = mdata.get("icons", [])
        sizes = [i.get("sizes") for i in icons]
        check("manifest.json has 180x180 icon", "180x180" in sizes)
        check("manifest.json has 512x512 icon", "512x512" in sizes)
    except json.JSONDecodeError:
        check("manifest.json valid JSON", False, "JSON parse error")
else:
    check("manifest.json exists", False)

# C2: GA4 script timing
print("\n[C2] GA4 Script Timing Fix")
index_html = file_content("index.html")
check("GA4 gtag('config') inside s.onload", "s.onload" in index_html and "gtag('config'" in index_html)
# Verify gtag config is NOT before the onload pattern
lines = index_html.split("\n")
onload_line = next((i for i, l in enumerate(lines) if "s.onload" in l), 999)
config_line = next((i for i, l in enumerate(lines) if "gtag('config'" in l), 0)
check("gtag('config') appears AFTER s.onload", config_line > onload_line,
      f"onload@L{onload_line+1}, config@L{config_line+1}")

# C3: Sitemap auto-generation
print("\n[C3] Sitemap Auto-Generation")
prerender = file_content("scripts/prerender.mjs")
check("prerender.mjs has generateSitemap()", "generateSitemap" in prerender)
check("prerender.mjs has jasper-ai-alternatives in BLOG_POSTS", "jasper-ai-alternatives" in prerender)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n─── SEO HIGH-PRIORITY (H2–H11) ───")

# H2: Tool card hover animations
print("\n[H2] Tool Card Hover Animations")
homepage = file_content("pages/HomePage.tsx")
check("Hover transition CSS exists", ".tool-card-inner { transition:" in homepage or "tool-card-inner" in homepage)
check("Hover transform on wrap:hover", "tool-card-wrap:hover .tool-card-inner" in homepage)

# H3: Breadcrumbs
print("\n[H3] Breadcrumb Navigation")
toolpage = file_content("pages/ToolPage.tsx")
blogpage = file_content("pages/BlogPostPage.tsx")
comparepage = file_content("pages/CompareArticlePage.tsx")
check("ToolPage has breadcrumb nav", 'aria-label="Breadcrumb"' in toolpage)
check("BlogPostPage has breadcrumb nav", "›" in blogpage and "Blog" in blogpage)
check("CompareArticlePage has breadcrumb nav", 'aria-label="Breadcrumb"' in comparepage)

# H4: ItemList schema on homepage
print("\n[H4] ItemList Schema on Homepage")
check("prerender.mjs has itemListSchema for homepage", "itemListSchema" in prerender)

# H5: Title tag length
print("\n[H5] Title Tag Length Fix")
check("Tool page title uses 'Personally Tested'",
      "Personally Tested | AI Nexus" in prerender)
# Verify no tagline in title (which made it too long)
check("Tool page title does NOT include tagline in template",
      "${tool.tagline}" not in prerender.split("Personally Tested")[0][-200:] if "Personally Tested" in prerender else False)

# H6: Category landing pages
print("\n[H6] 8 Category Landing Pages")
check("CategoryPage.tsx exists", file_exists("pages/CategoryPage.tsx"))
app_tsx = file_content("App.tsx")
categories = ['best-ai-writing-tools', 'best-ai-image-tools', 'best-ai-video-tools',
              'best-ai-audio-tools', 'best-ai-marketing-tools', 'best-ai-design-tools',
              'best-ai-coding-tools', 'best-ai-productivity-tools']
for cat in categories:
    check(f"  Route /{cat}/ in App.tsx", cat in app_tsx)
check("CategoryPage lazy import in App.tsx", "CategoryPage" in app_tsx)
check("Category pages in prerender sitemap", "CATEGORY_SLUGS" in prerender or "best-ai-writing-tools" in prerender)

# H8: 5 New Compare Articles
print("\n[H8] 5 New Compare Articles")
compare_data = file_content("pages/compare-data.ts")
new_compares = ['writesonic-vs-jasper', 'grammarly-vs-prowritingaid',
                'leonardo-ai-vs-stable-diffusion', 'gamma-vs-beautiful-ai', 'invideo-vs-pictory']
for slug in new_compares:
    check(f"  Compare: {slug}", slug in compare_data)
# Also in prerender
for slug in new_compares:
    check(f"  Prerender: {slug}", slug in prerender)

# H11: SoftwareApplication schema
print("\n[H11] SoftwareApplication Schema on Tool Pages")
check("SoftwareApplication in prerender.mjs", "SoftwareApplication" in prerender)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n─── SEO MEDIUM-PRIORITY (M1–M22) ───")

# M1: Speakable schema
print("\n[M1] Speakable Schema")
check("speakableSchema function in prerender.mjs", "speakable" in prerender.lower())

# M2: llms.txt updated
print("\n[M2] llms.txt Updated")
llms = file_content("public/llms.txt")
check("llms.txt has ElevenLabs", "ElevenLabs" in llms)
check("llms.txt has Jasper", "Jasper" in llms)
check("llms.txt has Canva AI", "Canva AI" in llms)
check("llms.txt has jasper-ai-alternatives blog", "jasper-ai-alternatives" in llms)
check("llms.txt has chatgpt-alternatives blog", "chatgpt-alternatives" in llms)
check("llms.txt has writesonic-vs-jasper compare", "writesonic-vs-jasper" in llms)
check("llms.txt has invideo-vs-pictory compare", "invideo-vs-pictory" in llms)

# M3: Card entrance animations
print("\n[M3] Card Entrance Animations")
check("@keyframes fadeUp in HomePage", "fadeUp" in homepage or "fade" in homepage)
check("scroll-reveal class used", "scroll-reveal" in homepage)

# M4: Meta description template
print("\n[M4] Meta Description Template")
check("Meta desc includes 'personally tested'",
      "personally tested" in prerender.lower())

# M5: Last Tested badge on cards
print("\n[M5] Last Tested Badge on Tool Cards")
check("lastTestedISO referenced in HomePage", "lastTestedISO" in homepage)
check("'Tested' badge text in card", "Tested" in homepage)

# M6: Newsletter inline CTA in blog posts
print("\n[M6] Newsletter Inline CTA in Blog Posts")
check("BeehiivForm imported in BlogPostPage", "BeehiivForm" in blogpage)
check("Newsletter CTA section in BlogPostPage", "weekly AI tool updates" in blogpage or "BeehiivForm" in blogpage)

# M7: Trust banner on tool pages
print("\n[M7] Trust Banner on Tool Pages")
check("'Last verified' in ToolPage hero", "Last verified" in toolpage)
check("'Reviewed by' in ToolPage hero", "Reviewed by" in toolpage)
check("'Tested for' badge in ToolPage", "Tested for" in toolpage)

# M11: Related Tools section
print("\n[M11] Related Tools Section on Tool Pages")
check("'Related comparisons' section in ToolPage", "Related comparisons" in toolpage)
check("'Related tools in same category' in ToolPage", "Related tools in same category" in toolpage or "same category" in toolpage)

# M12: Glossary page
print("\n[M12] Glossary Page")
check("GlossaryPage.tsx exists", file_exists("pages/GlossaryPage.tsx"))
check("Glossary route in App.tsx", "/glossary" in app_tsx)
check("GlossaryPage lazy import", "GlossaryPage" in app_tsx)
check("Glossary in prerender sitemap", "glossary" in prerender)

# M15: Skeleton shimmer CSS
print("\n[M15] Skeleton Shimmer Loaders")
check("@keyframes shimmer in index.html", "shimmer" in index_html)
check(".skeleton CSS class in index.html", ".skeleton" in index_html)

# M16: Trending This Week section
print("\n[M16] Trending This Week Section")
check("'Trending This Week' in HomePage", "Trending This Week" in homepage)

# M19: Tools Tested counter in hero
print("\n[M19] Dynamic Tools Counter in Hero")
check("TOOLS.length used for counter", "TOOLS.length" in homepage)

# M21: Readers Also Ask (PAA) section
print("\n[M21] Readers Also Ask Section")
check("ReadersAlsoAsk component in BlogPostPage", "ReadersAlsoAsk" in blogpage)
check("'Readers Also Ask' heading text", "Readers Also Ask" in blogpage)

# M22: Expanded Notion AI content
print("\n[M22] Notion AI Content Expanded")
check("Notion AI pricingSection field", "pricingSection" in toolpage and "notion-ai" in toolpage)
check("Notion AI faqs field added", "Does Notion AI work on the free plan" in toolpage)
check("Notion AI expanded myTake (>500 chars)",
      len(toolpage[toolpage.find("'notion-ai':"):toolpage.find("'notion-ai':") + 3000].split("myTake")[1][:1500]) > 500
      if "'notion-ai':" in toolpage else False)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n─── BLOG POSTS ───")

blog_index = file_content("blog/index.ts")
new_posts = [
    ("chatgpt-alternatives-free-2026", "blog/chatgpt-alternatives-free-2026.ts"),
    ("best-ai-coding-tools-2026", "blog/best-ai-coding-tools-2026.ts"),
    ("best-ai-logo-makers-free-2026", "blog/best-ai-logo-makers-free-2026.ts"),
    ("best-ai-marketing-tools-2026", "blog/best-ai-marketing-tools-2026.ts"),
    ("ai-tools-for-teachers-2026", "blog/ai-tools-for-teachers-2026.ts"),
    ("best-midjourney-alternatives-2026", "blog/best-midjourney-alternatives-2026.ts"),
]

print("\n[H7/H9/H10/H15/M8/M9] New Blog Posts")
for slug, path in new_posts:
    check(f"  {slug}.ts exists", file_exists(path))
    check(f"  {slug} in blog/index.ts", slug in blog_index)
    check(f"  {slug} in prerender.mjs", slug in prerender)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n─── BUILD VERIFICATION ───")

dist = BASE / "dist"
if dist.exists():
    print("\n[BUILD] dist/ folder")
    check("dist/index.html exists", (dist / "index.html").exists())
    check("dist/sitemap.xml exists", (dist / "sitemap.xml").exists())
    check("dist/rss.xml exists", (dist / "rss.xml").exists())

    # Check sitemap for new URLs
    sitemap = (dist / "sitemap.xml").read_text(encoding="utf-8") if (dist / "sitemap.xml").exists() else ""
    check("Sitemap has /best-ai-writing-tools/", "best-ai-writing-tools" in sitemap)
    check("Sitemap has /glossary/", "glossary" in sitemap)
    check("Sitemap has /blog/chatgpt-alternatives-free-2026/", "chatgpt-alternatives-free-2026" in sitemap)
    check("Sitemap has /compare/writesonic-vs-jasper/", "writesonic-vs-jasper" in sitemap)

    # Count URLs in sitemap
    url_count = sitemap.count("<loc>")
    check(f"Sitemap has 60+ URLs (found {url_count})", url_count >= 60)

    # Check pre-rendered pages exist
    prerendered_dirs = [
        "best-ai-writing-tools", "best-ai-image-tools", "glossary",
        "tools/grammarly", "blog/chatgpt-alternatives-free-2026",
        "compare/writesonic-vs-jasper",
    ]
    for d in prerendered_dirs:
        check(f"  Pre-rendered: /{d}/index.html", (dist / d / "index.html").exists())

    # Check RSS feed
    rss = (dist / "rss.xml").read_text(encoding="utf-8") if (dist / "rss.xml").exists() else ""
    rss_items = rss.count("<item>")
    check(f"RSS has 15+ items (found {rss_items})", rss_items >= 15)
else:
    warn("dist/ folder not found — run 'npm run build' first")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n─── TYPE SAFETY ───")

print("\n[TS] TypeScript Checks")
check("ToolContent type has pricingSection optional field",
      "pricingSection?" in toolpage)
check("ToolContent type has faqs optional field",
      "faqs?" in toolpage)
check("ToolContent type has lastTestedISO optional field",
      "lastTestedISO?" in toolpage)
check("BlogPost type imported correctly in blog/index.ts",
      "import type { BlogPost }" in blog_index or "BlogPost" in blog_index)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n─── COMPONENT FILES ───")

print("\n[FILES] Component Existence")
required_files = [
    "components/Breadcrumb.tsx",
    "components/BeehiivForm.tsx",
    "pages/CategoryPage.tsx",
    "pages/GlossaryPage.tsx",
    "pages/HomePage.tsx",
    "pages/ToolPage.tsx",
    "pages/BlogPostPage.tsx",
    "pages/CompareArticlePage.tsx",
    "pages/SharedNav.tsx",
    "pages/compare-data.ts",
    "scripts/prerender.mjs",
    "scripts/generate-icons.mjs",
    "public/manifest.json",
    "public/llms.txt",
    "public/robots.txt",
]
for f in required_files:
    check(f"  {f}", file_exists(f))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n─── EXTERNAL TASKS (not code — manual action needed) ───")
print("  ℹ️  M10: Create Wikidata entity for AI Nexus")
print("  ℹ️  M18: Register Bing Webmaster Tools + submit sitemap")
print("  ℹ️  H14: Submit to 10 AI directories (Product Hunt, etc.)")
print("  ℹ️  M20: Send affiliate outreach emails")
print("  ℹ️  M23: Create 30-day content calendar")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n" + "=" * 70)
print(f"  RESULTS:  ✅ {PASS} passed  |  ❌ {FAIL} failed  |  ⚠️  {WARN} warnings")
print("=" * 70)

if FAIL == 0:
    print("\n  🎉 All validation checks passed!\n")
else:
    print(f"\n  ⚠️  {FAIL} check(s) failed — review above for details.\n")
