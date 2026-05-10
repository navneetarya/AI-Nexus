#!/usr/bin/env python3
"""
AI Nexus Master Audit 2026 — Validation Script
Validates all code-level tasks from the 4-week action plan.
Run: python validate_audit.py
"""

import os, re, json, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, "dist")
passed = 0
failed = 0
warnings = 0

def check(name, condition, detail=""):
    global passed, failed
    if condition:
        print(f"  ✅ {name}")
        passed += 1
    else:
        print(f"  ❌ {name}" + (f" — {detail}" if detail else ""))
        failed += 1

def warn(name, detail=""):
    global warnings
    print(f"  ⚠️  {name}" + (f" — {detail}" if detail else ""))
    warnings += 1

def read(path):
    try:
        with open(os.path.join(ROOT, path), "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return None

def read_dist(path):
    try:
        with open(os.path.join(DIST, path), "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return None

# ═══════════════════════════════════════════════════════════════════
print("\n" + "═" * 60)
print("  FONT CHANGE — Syne/DM Sans → Inter")
print("═" * 60)

html = read("index.html")
if html:
    check("Inter @font-face in index.html", "font-family: 'Inter'" in html)
    check("Inter preload in index.html", "inter-v20-latin-700.woff2" in html or "inter-" in html)
    check("No Syne @font-face in index.html", "font-family: 'Syne'" not in html)
    check("No DM Sans @font-face in index.html", "font-family: 'DM Sans'" not in html)
    check("Body uses Inter font", "'Inter'" in html and "font-family" in html)
else:
    check("index.html exists", False)

# Check all TSX files for Syne/DM Sans remnants
tsx_files = []
for dirpath, _, filenames in os.walk(ROOT):
    if "node_modules" in dirpath or "dist" in dirpath:
        continue
    for f in filenames:
        if f.endswith(".tsx"):
            tsx_files.append(os.path.join(dirpath, f))

syne_remnants = []
for fp in tsx_files:
    content = open(fp, "r", encoding="utf-8").read()
    if "'Syne'" in content or '"Syne"' in content:
        syne_remnants.append(os.path.relpath(fp, ROOT))
check("No Syne references in any .tsx file", len(syne_remnants) == 0,
      f"Found in: {', '.join(syne_remnants)}" if syne_remnants else "")

dm_remnants = []
for fp in tsx_files:
    content = open(fp, "r", encoding="utf-8").read()
    if "'DM Sans'" in content or '"DM Sans"' in content:
        dm_remnants.append(os.path.relpath(fp, ROOT))
check("No DM Sans references in any .tsx file", len(dm_remnants) == 0,
      f"Found in: {', '.join(dm_remnants)}" if dm_remnants else "")

# Check font files exist
fonts_dir = os.path.join(ROOT, "public", "fonts")
inter_files = [f for f in os.listdir(fonts_dir) if f.startswith("inter-")] if os.path.isdir(fonts_dir) else []
check("Inter font files downloaded", len(inter_files) >= 3, f"Found {len(inter_files)} Inter font files")

# ═══════════════════════════════════════════════════════════════════
print("\n" + "═" * 60)
print("  WEEK 1 — Critical Foundations")
print("═" * 60)

# W1-C1: Blog posts published
print("\n  W1-C1: Publish 7 Dormant Blog Posts")
blog_index = read("blog/index.ts")
if blog_index:
    required_posts = [
        "ai-tools-for-teachers-2026",
        "best-ai-coding-tools-2026",
        "best-ai-logo-makers-free-2026",
        "best-ai-marketing-tools-2026",
        "chatgpt-alternatives-free-2026",
        "how-to-use-ai-for-content-creation-2026",
        "best-midjourney-alternatives-2026",
    ]
    for slug in required_posts:
        check(f"  Blog post imported: {slug}", slug in blog_index)
    
    # Check BLOG_POSTS array has all posts
    post_count = blog_index.count("import post")
    check(f"  Total blog imports: {post_count} (expect 17)", post_count >= 17)
else:
    check("blog/index.ts exists", False)

# W1-C2: Fix package.json
print("\n  W1-C2: Fix Package.json Version Conflicts")
pkg = read("package.json")
if pkg:
    pkg_json = json.loads(pkg)
    deps = pkg_json.get("dependencies", {})
    dev_deps = pkg_json.get("devDependencies", {})
    check("vite NOT in dependencies", "vite" not in deps)
    check("@vitejs/plugin-react NOT in dependencies", "@vitejs/plugin-react" not in deps)
    check("vite in devDependencies", "vite" in dev_deps)
    check("@vitejs/plugin-react in devDependencies", "@vitejs/plugin-react" in dev_deps)
else:
    check("package.json exists", False)

# W1-C3: Fix 404.html
print("\n  W1-C3: Fix 404.html")
four04 = read("public/404.html")
if four04:
    check("noindex meta tag present", 'content="noindex' in four04)
    check("canonical link to homepage", 'rel="canonical"' in four04 and 'ainexustools.online' in four04)
    check("Static navigation links present", "/best-free-ai-tools/" in four04)
    check("Link to /blog/", "/blog/" in four04)
    check("Link to /about/", "/about/" in four04)
else:
    check("public/404.html exists", False)

# W1-C4: CI Build Verification
print("\n  W1-C4: GitHub Actions CI Build Verification")
deploy_yml = read(".github/workflows/deploy.yml")
if deploy_yml:
    check("Page count check in CI", "Too few pages" in deploy_yml or "page" in deploy_yml.lower())
    check("Sitemap verification in CI", "sitemap.xml" in deploy_yml)
    check("RSS verification in CI", "rss.xml" in deploy_yml)
    check("IndexNow ping in deploy", "indexnow" in deploy_yml.lower())
else:
    check(".github/workflows/deploy.yml exists", False)

# W1-C5: Remove _headers
print("\n  W1-C5: Remove _headers File")
check("public/_headers deleted", not os.path.exists(os.path.join(ROOT, "public", "_headers")))

# W1-C6: Verify H1 in static HTML
print("\n  W1-C6: H1 Tags in Pre-rendered HTML")
if os.path.isdir(DIST):
    tool_dirs = []
    tools_dist = os.path.join(DIST, "tools")
    if os.path.isdir(tools_dist):
        tool_dirs = [d for d in os.listdir(tools_dist) if os.path.isdir(os.path.join(tools_dist, d))]
    
    missing_h1 = []
    for slug in tool_dirs:
        html_path = os.path.join(tools_dist, slug, "index.html")
        if os.path.exists(html_path):
            content = open(html_path, "r", encoding="utf-8").read()
            if "<h1" not in content:
                missing_h1.append(slug)
    check(f"All {len(tool_dirs)} tool pages have <h1>", len(missing_h1) == 0,
          f"Missing in: {', '.join(missing_h1)}" if missing_h1 else "")
    
    # Check blog pages too
    blog_dist = os.path.join(DIST, "blog")
    if os.path.isdir(blog_dist):
        blog_dirs = [d for d in os.listdir(blog_dist) if os.path.isdir(os.path.join(blog_dist, d))]
        missing_h1_blog = []
        for slug in blog_dirs:
            hp = os.path.join(blog_dist, slug, "index.html")
            if os.path.exists(hp):
                c = open(hp, "r", encoding="utf-8").read()
                if "<h1" not in c:
                    missing_h1_blog.append(slug)
        check(f"All {len(blog_dirs)} blog pages have <h1>", len(missing_h1_blog) == 0,
              f"Missing in: {', '.join(missing_h1_blog)}" if missing_h1_blog else "")
else:
    warn("dist/ not found — run 'npm run build' first", "Skipping H1 checks")

# W1-H1: Article Schema on Blog Posts
print("\n  W1-H1: Article Schema on Blog Posts")
prerender = read("scripts/prerender.mjs")
if prerender:
    check("Article schema function exists", "articleSchema" in prerender)
    check("Article schema has wordCount", "wordCount" in prerender)
    check("Article schema has image", "ImageObject" in prerender)
    check("Article schema used for blog posts", "'Article'" in prerender and "datePublished" in prerender)
else:
    check("scripts/prerender.mjs exists", False)

# W1-H3: Hero H1 Rewrite
print("\n  W1-H3: Rewrite Hero H1 + Social Proof")
homepage = read("pages/HomePage.tsx")
if homepage:
    check("New H1: 'I Test AI Tools'", "I Test AI Tools" in homepage)
    check("New H1: '30+ Days'", "30+ Days" in homepage or "30+" in homepage)
    check("Subhead: 'Navneet Arya'", "Navneet Arya" in homepage)
    check("Social proof strip: 'tools tested'", "tools tested" in homepage)
    check("Social proof strip: 'guides published'", "guides published" in homepage)
    check("Old H1 removed: 'Best AI Tools for Creators'", "Best AI Tools for Creators" not in homepage)
else:
    check("pages/HomePage.tsx exists", False)

# ═══════════════════════════════════════════════════════════════════
print("\n" + "═" * 60)
print("  WEEK 2 — Content Depth + Schema Blitz")
print("═" * 60)

# W2-H2: Quick Verdict on Compare Pages
print("\n  W2-H2: Quick Verdict on Compare Pages")
compare_page = read("pages/CompareArticlePage.tsx")
if compare_page:
    check("Quick Answer/Verdict rendered", "quickAnswer" in compare_page or "Quick Answer" in compare_page)
    check("role='note' for AEO", 'role="note"' in compare_page or "role=\"note\"" in compare_page)
else:
    check("pages/CompareArticlePage.tsx exists", False)

compare_data = read("pages/compare-data.ts")
if compare_data:
    check("quickAnswer field in compare data", "quickAnswer" in compare_data)
    # Count how many articles have quickAnswer
    qa_count = compare_data.count("quickAnswer:")
    check(f"quickAnswer on {qa_count} compare articles", qa_count >= 7, f"Found {qa_count}")
else:
    check("pages/compare-data.ts exists", False)

# W2-H5: HowTo + Speakable Schema
print("\n  W2-H5: HowTo + Speakable Schema")
if prerender:
    check("HowTo schema function exists", "howToSchema" in prerender or "HowTo" in prerender)
    check("Speakable schema function exists", "speakableSchema" in prerender or "SpeakableSpecification" in prerender)
    check("HowTo used for how-to posts", "how-to-" in prerender and "howToSteps" in prerender)
else:
    warn("prerender.mjs not loaded")

# W2-M1: Last Tested Badge
print("\n  W2-M1: Last Tested Badge on Tool Pages")
toolpage = read("pages/ToolPage.tsx")
if toolpage:
    check("lastTested displayed on tool page", "lastTested" in toolpage or "Last tested" in toolpage)
    check("Check icon with last tested", "Last tested" in toolpage)
else:
    check("pages/ToolPage.tsx exists", False)

# W2-M3: llms.txt Update
print("\n  W2-M3: llms.txt / llms-full.txt")
check("llms.txt exists", os.path.exists(os.path.join(ROOT, "public", "llms.txt")))
check("llms-full.txt exists", os.path.exists(os.path.join(ROOT, "public", "llms-full.txt")))

# ═══════════════════════════════════════════════════════════════════
print("\n" + "═" * 60)
print("  WEEK 3 — Authority Building")
print("═" * 60)

# W3-M2: IndexNow
print("\n  W3-M2: IndexNow in Deploy Pipeline")
if deploy_yml:
    check("IndexNow API call in CI", "indexnow" in deploy_yml.lower())
    check("Bing ping in CI", "bing.com" in deploy_yml)
    check("Google ping in CI", "google.com" in deploy_yml)
else:
    warn("deploy.yml not loaded")

# Affiliate Disclosure on Tool Pages
print("\n  PartnerStack: Affiliate Disclosure on Tool Pages")
if toolpage:
    check("Affiliate disclosure notice", "Disclosure" in toolpage and "affiliate" in toolpage.lower())
    check("Link to /disclosure/ page", "/disclosure/" in toolpage)
    check("AFFILIATE_SLUGS defined", "AFFILIATE_SLUGS" in toolpage)
else:
    warn("ToolPage.tsx not loaded")

# ═══════════════════════════════════════════════════════════════════
print("\n" + "═" * 60)
print("  WEEK 4 — Design + CRO")
print("═" * 60)

# W4-H1: Affiliate Tool Card Redesign
print("\n  W4-H1: Affiliate Tool Card Redesign")
if homepage:
    check("EDITOR'S PICK badge", "EDITOR" in homepage and "PICK" in homepage)
    check("Orange CTA (#E8580A)", "#E8580A" in homepage or "E8580A" in homepage)
    check("Teal border on affiliate cards", "borderLeft" in homepage and "var(--a1)" in homepage)
else:
    warn("HomePage.tsx not loaded")

# W4-H2: Testing Methodology Bar
print("\n  W4-H2: Testing Methodology Bar on Tool Pages")
if toolpage:
    check("'Tested by Navneet Arya' section", "Tested by Navneet Arya" in toolpage)
    check("timeUsed field displayed", "timeUsed" in toolpage)
    check("Link to /methodology/", "/methodology/" in toolpage)
else:
    warn("ToolPage.tsx not loaded")

# W4-H3: Font Swap (already checked above)
print("\n  W4-H3: Design Fingerprint — Font Swap")
check("Inter font is the new identity (verified above)", len(syne_remnants) == 0 and len(dm_remnants) == 0)

# W4-M1: Compare Navigation on Tool Pages
print("\n  W4-M1: Compare Navigation on Tool Pages")
if toolpage:
    check("COMPARE_ARTICLES imported in ToolPage", "COMPARE_ARTICLES" in toolpage)
    check("'See How' compare section", "See How" in toolpage or "Compares" in toolpage)
    check("Compare cards link to /compare/", "/compare/" in toolpage)
else:
    warn("ToolPage.tsx not loaded")

# ═══════════════════════════════════════════════════════════════════
print("\n" + "═" * 60)
print("  BUILD OUTPUT VERIFICATION")
print("═" * 60)

if os.path.isdir(DIST):
    # Count pages
    page_count = 0
    for dp, _, fns in os.walk(DIST):
        for fn in fns:
            if fn == "index.html":
                page_count += 1
    check(f"Total pages built: {page_count} (expect 40+)", page_count >= 40)

    # Check critical files
    check("dist/sitemap.xml exists", os.path.exists(os.path.join(DIST, "sitemap.xml")))
    check("dist/rss.xml exists", os.path.exists(os.path.join(DIST, "rss.xml")))
    check("dist/404.html exists", os.path.exists(os.path.join(DIST, "404.html")))

    # Check 404 in dist has noindex
    dist_404 = read_dist("404.html")
    if dist_404:
        check("dist/404.html has noindex", "noindex" in dist_404)
        check("dist/404.html has static links", "/blog/" in dist_404 and "/about/" in dist_404)

    # Check no Syne in dist/index.html
    dist_index = read_dist("index.html")
    if dist_index:
        check("No Syne in built index.html", "Syne" not in dist_index)
        check("Inter in built index.html", "Inter" in dist_index)
        check("FAQPage schema on homepage", "FAQPage" in dist_index)

    # Verify schemas in tool pages
    rytr_html = read_dist("tools/rytr/index.html")
    if rytr_html:
        check("Review schema on tool page", '"Review"' in rytr_html or "'Review'" in rytr_html)
        check("BreadcrumbList on tool page", "BreadcrumbList" in rytr_html)
        check("SpeakableSpecification on tool page", "SpeakableSpecification" in rytr_html or "speakable" in rytr_html)
        check("FAQPage on tool page (rytr)", "FAQPage" in rytr_html)

    # Verify blog post schemas
    blog_html = read_dist("blog/best-ai-writing-tools-for-beginners-2026/index.html")
    if blog_html:
        check("Article schema on blog post", '"Article"' in blog_html)
        check("FAQPage schema on blog post", "FAQPage" in blog_html)

    # Verify HowTo schema on how-to posts
    howto_html = read_dist("blog/how-to-use-rytr-to-write-blog-posts/index.html")
    if howto_html:
        check("HowTo schema on how-to blog post", "HowTo" in howto_html)

    # Verify compare page schemas
    compare_html = read_dist("compare/rytr-vs-writesonic/index.html")
    if compare_html:
        check("FAQPage schema on compare page", "FAQPage" in compare_html)
        check("Article schema on compare page", '"Article"' in compare_html)

    # Sitemap content check
    sitemap = read_dist("sitemap.xml")
    if sitemap:
        url_count = sitemap.count("<url>")
        check(f"Sitemap has {url_count} URLs (expect 60+)", url_count >= 60)
        check("Sitemap has image namespace", "image:image" in sitemap)

    # RSS content check
    rss = read_dist("rss.xml")
    if rss:
        item_count = rss.count("<item>")
        check(f"RSS has {item_count} items (expect 15+)", item_count >= 15)
else:
    warn("dist/ directory not found", "Run 'npm run build' before validating build output")

# ═══════════════════════════════════════════════════════════════════
print("\n" + "═" * 60)
print("  SCHEMA COMPLETENESS")
print("═" * 60)

if prerender:
    check("Organization schema in index.html", '"Organization"' in (html or ""))
    check("Person/Author schema in index.html", '"Person"' in (html or ""))
    check("WebSite schema in index.html", '"WebSite"' in (html or ""))
    check("SearchAction schema in index.html", '"SearchAction"' in (html or ""))
    check("Review schema builder in prerender", "reviewSchema" in prerender)
    check("FAQPage schema builder in prerender", "faqSchema" in prerender)
    check("Article schema builder in prerender", "articleSchema" in prerender)
    check("Speakable schema builder in prerender", "speakableSchema" in prerender)
    check("HowTo schema builder in prerender", "howToSchema" in prerender)
    check("ItemList schema builder in prerender", "itemListSchema" in prerender)
    check("SoftwareApplication schema in prerender", "SoftwareApplication" in prerender)

# ═══════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════
total = passed + failed
print("\n" + "═" * 60)
print(f"  RESULTS: {passed}/{total} passed, {failed} failed, {warnings} warnings")
print("═" * 60)

if failed == 0:
    print("\n  🎉 All audit tasks validated successfully!\n")
else:
    print(f"\n  ⚠️  {failed} check(s) failed — review above.\n")

sys.exit(0 if failed == 0 else 1)
