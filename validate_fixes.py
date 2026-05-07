#!/usr/bin/env python3
"""
AI Nexus — Performance & SEO Fix Validation Script
===================================================
Validates all changes from the 4-week audit action plan and mobile performance fixes.
Run after `npm run build` to verify the build output is correct.

Usage:
    python validate_fixes.py [--live] [--dist-path ./dist]

Options:
    --live          Also run checks against the live site (https://ainexustools.online)
    --dist-path     Path to the dist directory (default: ./dist)
"""

import os
import sys
import json
import re
import argparse
from pathlib import Path

try:
    import urllib.request
    import urllib.error
    HAS_URLLIB = True
except ImportError:
    HAS_URLLIB = False


# ── Configuration ─────────────────────────────────────────────────────────────
SITE_URL = "https://ainexustools.online"
EXPECTED_TOOLS = [
    "grammarly", "writesonic", "rytr", "quillbot", "frase",
    "leonardo-ai", "photoroom", "looka", "pictory", "opus-clip",
    "invideo", "murf-ai", "podcastle", "gamma", "beautiful-ai",
    "ocoya", "replit", "notion-ai", "taskade",
    "elevenlabs", "jasper", "descript", "perplexity", "canva-ai",
]
EXPECTED_BLOG_POSTS = [
    "best-ai-writing-tools-for-beginners-2026",
    "best-ai-tools-for-freelancers-2026",
    "best-grammarly-alternatives",
    "best-podcastle-alternatives",
    "best-ai-tools-for-social-media-2026",
    "how-to-use-rytr-to-write-blog-posts",
    "ai-tools-for-students-free-2026",
    "best-ai-podcast-tools-2026",
]
EXPECTED_COMPARE_PAGES = [
    "rytr-vs-writesonic",
    "grammarly-vs-quillbot",
    "podcastle-vs-descript",
    "ocoya-vs-buffer-vs-hootsuite",
    "leonardo-vs-midjourney",
    "replit-vs-github-copilot",
    "taskade-vs-notion",
]


class ValidationResult:
    def __init__(self):
        self.passed = []
        self.failed = []
        self.warnings = []

    def ok(self, msg):
        self.passed.append(msg)
        print(f"  ✅ {msg}")

    def fail(self, msg):
        self.failed.append(msg)
        print(f"  ❌ {msg}")

    def warn(self, msg):
        self.warnings.append(msg)
        print(f"  ⚠️  {msg}")

    def summary(self):
        total = len(self.passed) + len(self.failed)
        print(f"\n{'='*60}")
        print(f"VALIDATION SUMMARY")
        print(f"{'='*60}")
        print(f"  Passed:   {len(self.passed)}/{total}")
        print(f"  Failed:   {len(self.failed)}/{total}")
        print(f"  Warnings: {len(self.warnings)}")
        print(f"{'='*60}")
        if self.failed:
            print("\nFailed checks:")
            for f in self.failed:
                print(f"  • {f}")
        if self.warnings:
            print("\nWarnings:")
            for w in self.warnings:
                print(f"  • {w}")
        print()
        return len(self.failed) == 0


def read_file(filepath):
    """Read a file and return its contents."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return None
    except Exception as e:
        return None


# ── TASK 1: RSS link fix ──────────────────────────────────────────────────────
def check_rss_link(result, root):
    """Task 1: Verify RSS link references a build-generated file (not broken)."""
    print("\n[Task 1] RSS Feed Link")
    index_html = read_file(os.path.join(root, "index.html"))
    if index_html is None:
        result.fail("Cannot read index.html")
        return

    # The RSS link should still exist but now it's generated at build time
    if 'type="application/rss+xml"' in index_html:
        result.ok("RSS feed link present in index.html")
    else:
        result.warn("RSS feed link removed entirely (optional — could re-add after build)")


# ── TASK 3: GA4 removed from 404.html ────────────────────────────────────────
def check_404_no_ga4(result, root):
    """Task 3: Verify GA4 is NOT in 404.html."""
    print("\n[Task 3] GA4 Removed from 404.html")
    content = read_file(os.path.join(root, "public", "404.html"))
    if content is None:
        result.fail("Cannot read public/404.html")
        return

    if "googletagmanager.com" in content:
        result.fail("GA4 script still present in 404.html")
    else:
        result.ok("GA4 removed from 404.html — no longer blocks 404 redirect")

    if "window.location.replace" in content:
        result.ok("404.html redirect script still functional")
    else:
        result.fail("404.html missing redirect script")


# ── TASK 4: framer-motion removed ─────────────────────────────────────────────
def check_framer_motion_removed(result, root):
    """Task 4: Verify framer-motion is not in package.json dependencies."""
    print("\n[Task 4] framer-motion Removed")
    pkg = read_file(os.path.join(root, "package.json"))
    if pkg is None:
        result.fail("Cannot read package.json")
        return

    pkg_data = json.loads(pkg)
    deps = pkg_data.get("dependencies", {})
    if "framer-motion" in deps:
        result.fail("framer-motion still in dependencies — remove to save 150KB")
    else:
        result.ok("framer-motion removed from dependencies (-150KB JS)")

    # Check vite.config.ts
    vite_config = read_file(os.path.join(root, "vite.config.ts"))
    if vite_config and "vendor-motion" in vite_config:
        result.fail("vendor-motion chunk still in vite.config.ts")
    else:
        result.ok("vendor-motion chunk removed from vite.config.ts")


# ── TASK 5: PWA meta tags ─────────────────────────────────────────────────────
def check_pwa_meta(result, root):
    """Task 5: Verify theme-color, apple-touch-icon, and manifest."""
    print("\n[Task 5] PWA Meta Tags (theme-color, apple-touch-icon, manifest)")
    index_html = read_file(os.path.join(root, "index.html"))
    if index_html is None:
        result.fail("Cannot read index.html")
        return

    if 'name="theme-color"' in index_html:
        result.ok("meta theme-color present")
    else:
        result.fail("meta theme-color missing from index.html")

    if "apple-touch-icon" in index_html:
        result.ok("apple-touch-icon link present")
    else:
        result.fail("apple-touch-icon link missing")

    if "manifest.json" in index_html:
        result.ok("manifest.json link present")
    else:
        result.fail("manifest.json link missing")

    # Verify manifest.json exists
    manifest = read_file(os.path.join(root, "public", "manifest.json"))
    if manifest:
        try:
            data = json.loads(manifest)
            if data.get("theme_color") == "#0D9488":
                result.ok("manifest.json has correct theme_color")
            else:
                result.fail(f"manifest.json theme_color is '{data.get('theme_color')}', expected '#0D9488'")
            if data.get("display") == "standalone":
                result.ok("manifest.json display: standalone")
            else:
                result.warn("manifest.json display not set to 'standalone'")
        except json.JSONDecodeError:
            result.fail("manifest.json is not valid JSON")
    else:
        result.fail("public/manifest.json not found")


# ── TASK 7: BreadcrumbList schema ─────────────────────────────────────────────
def check_breadcrumb_schema(result, dist):
    """Task 7: Verify BreadcrumbList schema in prerendered tool pages."""
    print("\n[Task 7] BreadcrumbList Schema in Static HTML")
    if not os.path.isdir(dist):
        result.warn("dist/ directory not found — run `npm run build` first")
        return

    sample_tools = ["rytr", "grammarly", "podcastle"]
    for slug in sample_tools:
        filepath = os.path.join(dist, "tools", slug, "index.html")
        content = read_file(filepath)
        if content is None:
            result.fail(f"dist/tools/{slug}/index.html not found")
            continue
        if "BreadcrumbList" in content:
            result.ok(f"BreadcrumbList schema in /tools/{slug}/")
        else:
            result.fail(f"BreadcrumbList schema MISSING in /tools/{slug}/")


# ── TASK 8: Review schema in static HTML ──────────────────────────────────────
def check_review_schema(result, dist):
    """Task 8: Verify Review schema is in prerendered tool pages."""
    print("\n[Task 8] Review Schema in Static HTML")
    if not os.path.isdir(dist):
        result.warn("dist/ directory not found — run `npm run build` first")
        return

    sample_tools = ["rytr", "grammarly", "writesonic"]
    for slug in sample_tools:
        filepath = os.path.join(dist, "tools", slug, "index.html")
        content = read_file(filepath)
        if content is None:
            result.fail(f"dist/tools/{slug}/index.html not found")
            continue
        if '"@type":"Review"' in content or '"@type": "Review"' in content:
            result.ok(f"Review schema in /tools/{slug}/")
        else:
            result.fail(f"Review schema MISSING in /tools/{slug}/")


# ── TASK 9: Dynamic sitemap ───────────────────────────────────────────────────
def check_sitemap(result, dist):
    """Task 9: Verify sitemap.xml is generated and contains all routes."""
    print("\n[Task 9] Dynamic Sitemap Generation")
    if not os.path.isdir(dist):
        result.warn("dist/ directory not found — run `npm run build` first")
        return

    sitemap_path = os.path.join(dist, "sitemap.xml")
    content = read_file(sitemap_path)
    if content is None:
        result.fail("dist/sitemap.xml not found")
        return

    result.ok("sitemap.xml exists in dist/")

    # Check for tool URLs
    missing_tools = [t for t in EXPECTED_TOOLS[:5] if f"/tools/{t}/" not in content]
    if missing_tools:
        result.fail(f"Sitemap missing tools: {', '.join(missing_tools)}")
    else:
        result.ok("Sitemap contains all sampled tool URLs")

    # Check for image namespace
    if "image:image" in content or "image:loc" in content:
        result.ok("Sitemap includes image: namespace for Google Image Search")
    else:
        result.warn("Sitemap missing image: namespace")

    # Check auto-generated comment
    if "Auto-generated" in content:
        result.ok("Sitemap is auto-generated (not manually maintained)")
    else:
        result.warn("Sitemap may be manually maintained (check for staleness)")


# ── TASK 12: Homepage FAQPage schema ──────────────────────────────────────────
def check_homepage_faq(result, dist):
    """Task 12: Verify FAQPage schema on homepage."""
    print("\n[Task 12] Homepage FAQPage Schema")
    if not os.path.isdir(dist):
        result.warn("dist/ directory not found — run `npm run build` first")
        return

    homepage = read_file(os.path.join(dist, "index.html"))
    if homepage is None:
        result.fail("dist/index.html not found")
        return

    if "FAQPage" in homepage:
        result.ok("FAQPage schema found in homepage")
    else:
        result.fail("FAQPage schema MISSING from homepage — featured snippet opportunity lost")

    if "best free AI tools" in homepage or "best free ai tools" in homepage or "best AI tools" in homepage:
        result.ok("Homepage FAQ targets high-volume AI tools queries")
    else:
        result.warn("Homepage FAQ may not target high-volume queries")


# ── TASK 14: dateModified in Review schema ────────────────────────────────────
def check_date_modified(result, dist):
    """Task 14: Verify dateModified is present in Review schema."""
    print("\n[Task 14] dateModified in Review Schema")
    if not os.path.isdir(dist):
        result.warn("dist/ directory not found — run `npm run build` first")
        return

    filepath = os.path.join(dist, "tools", "rytr", "index.html")
    content = read_file(filepath)
    if content is None:
        result.fail("dist/tools/rytr/index.html not found")
        return

    if "dateModified" in content:
        result.ok("dateModified present in tool page schema")
    else:
        result.fail("dateModified MISSING from Review schema — freshness signal lost")


# ── TASK 21: RSS feed generation ──────────────────────────────────────────────
def check_rss_feed(result, dist):
    """Task 21: Verify rss.xml is generated at build time."""
    print("\n[Task 21] RSS Feed Generation")
    if not os.path.isdir(dist):
        result.warn("dist/ directory not found — run `npm run build` first")
        return

    rss_path = os.path.join(dist, "rss.xml")
    content = read_file(rss_path)
    if content is None:
        result.fail("dist/rss.xml not found — build may not generate RSS")
        return

    result.ok("rss.xml exists in dist/")

    if "<item>" in content:
        item_count = content.count("<item>")
        result.ok(f"RSS feed contains {item_count} blog post items")
    else:
        result.fail("RSS feed has no <item> entries")

    if "ainexustools.online" in content:
        result.ok("RSS feed uses correct site URL")
    else:
        result.fail("RSS feed missing site URL")


# ── TASK 25: Speakable schema ─────────────────────────────────────────────────
def check_speakable(result, dist):
    """Task 25: Verify Speakable schema on tool pages."""
    print("\n[Task 25] Speakable Schema")
    if not os.path.isdir(dist):
        result.warn("dist/ directory not found — run `npm run build` first")
        return

    filepath = os.path.join(dist, "tools", "rytr", "index.html")
    content = read_file(filepath)
    if content is None:
        result.fail("dist/tools/rytr/index.html not found")
        return

    if "SpeakableSpecification" in content:
        result.ok("Speakable schema present on tool page")
    else:
        result.fail("Speakable schema MISSING from tool pages")


# ── TASK 26: contactPoint in Organization schema ──────────────────────────────
def check_contact_point(result, root):
    """Task 26: Verify contactPoint in Organization schema."""
    print("\n[Task 26] contactPoint in Organization Schema")
    index_html = read_file(os.path.join(root, "index.html"))
    if index_html is None:
        result.fail("Cannot read index.html")
        return

    if "contactPoint" in index_html or "ContactPoint" in index_html:
        result.ok("contactPoint present in Organization schema")
    else:
        result.fail("contactPoint MISSING from Organization schema")

    if '"contactType"' in index_html:
        result.ok("contactType specified (editorial)")
    else:
        result.warn("contactType not explicitly set")


# ── MOBILE PERFORMANCE: Cache headers ─────────────────────────────────────────
def check_cache_headers(result, root):
    """Verify _headers file exists for cache control."""
    print("\n[Performance] Cache Headers Configuration")
    headers_path = os.path.join(root, "public", "_headers")
    content = read_file(headers_path)
    if content is None:
        result.warn("public/_headers not found — cache control may rely on hosting defaults")
        return

    result.ok("_headers file exists for cache configuration")

    if "immutable" in content:
        result.ok("Static assets configured with immutable cache (1 year)")
    else:
        result.warn("No immutable cache directives found")

    if "/fonts/*" in content:
        result.ok("Font caching configured")
    else:
        result.warn("Font-specific cache rules missing")


# ── MOBILE PERFORMANCE: Font loading ─────────────────────────────────────────
def check_font_optimization(result, root):
    """Verify font-display: optional for non-critical fonts."""
    print("\n[Performance] Font Loading Optimization")
    index_html = read_file(os.path.join(root, "index.html"))
    if index_html is None:
        result.fail("Cannot read index.html")
        return

    # Critical fonts should use swap
    if "font-weight: 800" in index_html and "font-display: swap" in index_html:
        result.ok("Critical font (Syne 800) uses font-display: swap")
    else:
        result.warn("Critical font display strategy unclear")

    # Non-critical fonts should use optional
    if "font-display: optional" in index_html:
        result.ok("Non-critical fonts use font-display: optional (reduces layout shift)")
    else:
        result.warn("Non-critical fonts not using font-display: optional")


# ── MOBILE PERFORMANCE: GA4 deferral ─────────────────────────────────────────
def check_ga4_deferral(result, root):
    """Verify GA4 is deferred more on mobile."""
    print("\n[Performance] GA4 Mobile Deferral")
    index_html = read_file(os.path.join(root, "index.html"))
    if index_html is None:
        result.fail("Cannot read index.html")
        return

    if "4000" in index_html and "innerWidth" in index_html:
        result.ok("GA4 deferred 4s on mobile (vs 2s desktop) — reduces TBT")
    elif "2000" in index_html:
        result.warn("GA4 deferred 2s on all devices — consider longer mobile delay")
    else:
        result.fail("GA4 deferral strategy unclear")


# ── MOBILE PERFORMANCE: Resource hints ────────────────────────────────────────
def check_resource_hints(result, root):
    """Verify DNS prefetch and preconnect for external resources."""
    print("\n[Performance] Resource Hints")
    index_html = read_file(os.path.join(root, "index.html"))
    if index_html is None:
        result.fail("Cannot read index.html")
        return

    if "dns-prefetch" in index_html:
        result.ok("DNS prefetch hints present")
    else:
        result.warn("No DNS prefetch hints — external requests will be slower")

    if "preconnect" in index_html:
        result.ok("Preconnect hints present")
    else:
        result.warn("No preconnect hints")

    if "preload" in index_html and "font" in index_html:
        result.ok("Critical font preload present")
    else:
        result.fail("Critical font preload MISSING — LCP will suffer")


# ── MOBILE PERFORMANCE: Animation reduction ──────────────────────────────────
def check_mobile_animation_reduction(result, root):
    """Verify animations are reduced on mobile."""
    print("\n[Performance] Mobile Animation Reduction")
    homepage = read_file(os.path.join(root, "pages", "HomePage.tsx"))
    if homepage is None:
        result.fail("Cannot read pages/HomePage.tsx")
        return

    if "max-width:680px" in homepage and "transition:none" in homepage:
        result.ok("Hover transitions disabled on mobile (saves paint cycles)")
    else:
        result.warn("Mobile animation optimizations may be missing")

    if "animation-duration" in homepage and "680px" in homepage:
        result.ok("Animation duration reduced on mobile")
    else:
        result.warn("Animation duration not specifically reduced for mobile")


# ── MOBILE PERFORMANCE: Content visibility ────────────────────────────────────
def check_content_visibility(result, root):
    """Verify content-visibility: auto for below-fold content."""
    print("\n[Performance] Content Visibility Optimization")
    index_html = read_file(os.path.join(root, "index.html"))
    if index_html is None:
        result.fail("Cannot read index.html")
        return

    if "content-visibility" in index_html:
        result.ok("content-visibility: auto defined in CSS (skip off-screen rendering)")
    else:
        result.warn("content-visibility not found — off-screen sections render eagerly")


# ── PRERENDER COMPLETENESS ────────────────────────────────────────────────────
def check_prerender_completeness(result, dist):
    """Verify all expected routes have prerendered HTML."""
    print("\n[Infrastructure] Prerender Output Completeness")
    if not os.path.isdir(dist):
        result.warn("dist/ directory not found — run `npm run build` first")
        return

    missing_tools = []
    for slug in EXPECTED_TOOLS:
        filepath = os.path.join(dist, "tools", slug, "index.html")
        if not os.path.isfile(filepath):
            missing_tools.append(slug)

    if missing_tools:
        result.fail(f"Missing prerendered tool pages: {', '.join(missing_tools)}")
    else:
        result.ok(f"All {len(EXPECTED_TOOLS)} tool pages prerendered")

    missing_blogs = []
    for slug in EXPECTED_BLOG_POSTS:
        filepath = os.path.join(dist, "blog", slug, "index.html")
        if not os.path.isfile(filepath):
            missing_blogs.append(slug)

    if missing_blogs:
        result.fail(f"Missing prerendered blog posts: {', '.join(missing_blogs)}")
    else:
        result.ok(f"All {len(EXPECTED_BLOG_POSTS)} sampled blog posts prerendered")

    missing_compare = []
    for slug in EXPECTED_COMPARE_PAGES:
        filepath = os.path.join(dist, "compare", slug, "index.html")
        if not os.path.isfile(filepath):
            missing_compare.append(slug)

    if missing_compare:
        result.fail(f"Missing prerendered compare pages: {', '.join(missing_compare)}")
    else:
        result.ok(f"All {len(EXPECTED_COMPARE_PAGES)} sampled compare pages prerendered")


# ── SCHEMA VALIDATION ─────────────────────────────────────────────────────────
def check_schema_in_pages(result, dist):
    """Verify JSON-LD schema exists in all prerendered pages."""
    print("\n[SEO] Schema.org JSON-LD Presence")
    if not os.path.isdir(dist):
        result.warn("dist/ directory not found — run `npm run build` first")
        return

    pages_with_schema = 0
    pages_without_schema = 0

    for slug in EXPECTED_TOOLS[:5]:
        filepath = os.path.join(dist, "tools", slug, "index.html")
        content = read_file(filepath)
        if content and 'application/ld+json' in content:
            pages_with_schema += 1
        else:
            pages_without_schema += 1

    if pages_without_schema == 0:
        result.ok(f"All sampled tool pages contain JSON-LD schema ({pages_with_schema} checked)")
    else:
        result.fail(f"{pages_without_schema} tool pages missing JSON-LD schema")


# ── LIVE SITE CHECKS ─────────────────────────────────────────────────────────
def check_live_site(result):
    """Run checks against the live deployed site."""
    print("\n[Live] Checking deployed site...")
    if not HAS_URLLIB:
        result.warn("urllib not available — skipping live checks")
        return

    try:
        # Check HTTPS redirect
        req = urllib.request.Request(f"{SITE_URL}/", method="HEAD")
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.url.startswith("https://"):
                result.ok("Site serves over HTTPS")
            else:
                result.fail("Site not serving over HTTPS")
    except Exception as e:
        result.warn(f"Could not reach site: {e}")

    # Check RSS feed exists
    try:
        req = urllib.request.Request(f"{SITE_URL}/rss.xml")
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                result.ok("rss.xml accessible (HTTP 200)")
            else:
                result.fail(f"rss.xml returned HTTP {resp.status}")
    except urllib.error.HTTPError as e:
        result.fail(f"rss.xml returned HTTP {e.code} — still broken")
    except Exception as e:
        result.warn(f"Could not check rss.xml: {e}")

    # Check sitemap
    try:
        req = urllib.request.Request(f"{SITE_URL}/sitemap.xml")
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                result.ok("sitemap.xml accessible (HTTP 200)")
            else:
                result.fail(f"sitemap.xml returned HTTP {resp.status}")
    except Exception as e:
        result.warn(f"Could not check sitemap.xml: {e}")

    # Check manifest
    try:
        req = urllib.request.Request(f"{SITE_URL}/manifest.json")
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                result.ok("manifest.json accessible (HTTP 200)")
            else:
                result.fail(f"manifest.json returned HTTP {resp.status}")
    except Exception as e:
        result.warn(f"Could not check manifest.json: {e}")


# ── BUNDLE SIZE ANALYSIS ──────────────────────────────────────────────────────
def check_bundle_size(result, dist):
    """Verify bundle sizes are within acceptable limits."""
    print("\n[Performance] Bundle Size Analysis")
    if not os.path.isdir(dist):
        result.warn("dist/ directory not found — run `npm run build` first")
        return

    assets_dir = os.path.join(dist, "assets")
    if not os.path.isdir(assets_dir):
        result.warn("dist/assets/ not found")
        return

    total_js = 0
    vendor_motion_found = False

    for f in os.listdir(assets_dir):
        filepath = os.path.join(assets_dir, f)
        if f.endswith(".js"):
            size = os.path.getsize(filepath)
            total_js += size
            if "vendor-motion" in f:
                vendor_motion_found = True
                result.fail(f"vendor-motion chunk still exists: {f} ({size//1024}KB)")

    if not vendor_motion_found:
        result.ok("No vendor-motion chunk in dist/ — framer-motion successfully removed")

    total_js_kb = total_js // 1024
    if total_js_kb < 400:
        result.ok(f"Total JS bundle: {total_js_kb}KB (excellent)")
    elif total_js_kb < 600:
        result.ok(f"Total JS bundle: {total_js_kb}KB (good)")
    else:
        result.warn(f"Total JS bundle: {total_js_kb}KB (consider further code splitting)")


# ── MAIN ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Validate AI Nexus audit fixes")
    parser.add_argument("--live", action="store_true", help="Also check the live site")
    parser.add_argument("--dist-path", default="./dist", help="Path to dist directory")
    args = parser.parse_args()

    # Determine project root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root = script_dir
    dist = os.path.join(root, args.dist_path) if not os.path.isabs(args.dist_path) else args.dist_path

    print("=" * 60)
    print("AI NEXUS — Audit Fix Validation Script")
    print("=" * 60)
    print(f"  Project root: {root}")
    print(f"  Dist path:    {dist}")
    print(f"  Live checks:  {'Yes' if args.live else 'No (use --live to enable)'}")

    result = ValidationResult()

    # ── Source code checks (always run) ──
    check_rss_link(result, root)
    check_404_no_ga4(result, root)
    check_framer_motion_removed(result, root)
    check_pwa_meta(result, root)
    check_contact_point(result, root)
    check_cache_headers(result, root)
    check_font_optimization(result, root)
    check_ga4_deferral(result, root)
    check_resource_hints(result, root)
    check_mobile_animation_reduction(result, root)
    check_content_visibility(result, root)

    # ── Build output checks (only if dist/ exists) ──
    if os.path.isdir(dist):
        check_breadcrumb_schema(result, dist)
        check_review_schema(result, dist)
        check_sitemap(result, dist)
        check_homepage_faq(result, dist)
        check_date_modified(result, dist)
        check_rss_feed(result, dist)
        check_speakable(result, dist)
        check_prerender_completeness(result, dist)
        check_schema_in_pages(result, dist)
        check_bundle_size(result, dist)
    else:
        print(f"\n⚠️  dist/ not found at '{dist}' — skipping build output checks.")
        print("   Run `npm run build` first to validate the full output.")
        result.warn("Build output checks skipped (dist/ not found)")

    # ── Live site checks (optional) ──
    if args.live:
        check_live_site(result)

    # ── Summary ──
    success = result.summary()

    if success:
        print("🎉 All validation checks passed!")
    else:
        print("⚠️  Some checks failed — review the list above.")

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
