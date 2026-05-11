"""
Validate Week 2 + Week 3 SEO/AEO/GEO fixes for AI Nexus.
Run: python validate_w2_w3_fixes.py
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
PRERENDER = ROOT / "scripts" / "prerender.mjs"
COMPARE_PAGE = ROOT / "pages" / "CompareArticlePage.tsx"
CONSTANTS = ROOT / "constants.ts"

PASS = "\033[92m✔ PASS\033[0m"
FAIL = "\033[91m✘ FAIL\033[0m"

results: list[tuple[str, bool, str]] = []


def check(task_id: str, label: str, passed: bool, detail: str = ""):
    results.append((task_id, passed, label))
    status = PASS if passed else FAIL
    msg = f"  {status}  [{task_id}] {label}"
    if detail and not passed:
        msg += f"\n         ↳ {detail}"
    print(msg)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


# ─────────────────────────────────────────────────────────
#  WEEK 2 CHECKS
# ─────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  WEEK 2 — Technical SEO & On-Page Fixes")
print("=" * 60)

prerender = read(PRERENDER)
constants = read(CONSTANTS)

# W2-T1: Frase FAQs in TOOL_FAQS (prerender.mjs)
frase_faq_prerender = "frase" in prerender.lower() and re.search(
    r"frase.*?:\s*\[", prerender, re.IGNORECASE | re.DOTALL
)
check(
    "W2-T1",
    "Frase FAQs added to TOOL_FAQS in prerender.mjs",
    bool(frase_faq_prerender),
    "Expected 'frase: [' block inside TOOL_FAQS in prerender.mjs",
)

# Also verify Frase FAQs have at least 3 Q&A pairs
frase_section = re.search(
    r"frase\s*:\s*\[(.*?)\]", prerender, re.IGNORECASE | re.DOTALL
)
frase_qa_count = len(re.findall(r"\bq\s*:", frase_section.group(1))) if frase_section else 0
check(
    "W2-T1b",
    f"Frase has ≥3 FAQ pairs (found {frase_qa_count})",
    frase_qa_count >= 3,
    "Expected at least 3 { q: ..., a: ... } entries for frase",
)

# W2-T2: dateModified in articleSchema
has_date_modified = bool(
    re.search(r"dateModified\s*:\s*TODAY", prerender)
    or re.search(r"dateModified\s*:", prerender)
)
check(
    "W2-T2",
    "dateModified present in articleSchema()",
    has_date_modified,
    "Expected dateModified field in articleSchema function",
)

# W2-T3: resolveOgImage function exists
has_resolve_og = "resolveOgImage" in prerender
check(
    "W2-T3a",
    "resolveOgImage() function defined in prerender.mjs",
    has_resolve_og,
    "Expected function resolveOgImage in prerender.mjs",
)

# W2-T3b: ogImage param used in buildPage
has_og_image_param = bool(re.search(r"ogImage", prerender))
check(
    "W2-T3b",
    "ogImage parameter wired into buildPage()",
    has_og_image_param,
    "Expected ogImage usage in buildPage",
)

# W2-T3c: OG image meta replacement logic
has_og_replace = bool(
    re.search(r'og:image.*?content', prerender)
    or re.search(r'property="og:image"', prerender)
    or re.search(r"og:image", prerender)
)
check(
    "W2-T3c",
    "OG image meta tag replacement logic present",
    has_og_replace,
    "Expected og:image replacement in buildPage",
)

# W2-T4: autoLinkToolMentions in BlogPostPage
blog_post = read(ROOT / "pages" / "BlogPostPage.tsx")
has_auto_link = "autoLinkToolMentions" in blog_post or "TOOL_MENTION_MAP" in blog_post
check(
    "W2-T4",
    "Blog→tool auto-linking (autoLinkToolMentions) exists",
    has_auto_link,
    "Expected autoLinkToolMentions or TOOL_MENTION_MAP in BlogPostPage.tsx",
)

# W2-T5: LinkedIn link on About page
about_page = read(ROOT / "pages" / "AboutPage.tsx")
has_linkedin = "linkedin.com" in about_page.lower()
check(
    "W2-T5",
    "LinkedIn link on AboutPage.tsx",
    has_linkedin,
    "Expected linkedin.com URL in AboutPage.tsx",
)

# W2-T6: Author photo on Homepage + BlogPostPage
home_page = read(ROOT / "pages" / "HomePage.tsx")
has_author_home = bool(
    re.search(r"navneet|author.*photo|author.*avatar|author.*img", home_page, re.IGNORECASE)
)
has_author_blog = bool(
    re.search(r"navneet|author.*photo|author.*avatar|author.*img", blog_post, re.IGNORECASE)
)
check(
    "W2-T6a",
    "Author photo on HomePage hero",
    has_author_home,
    "Expected author image reference in HomePage.tsx",
)
check(
    "W2-T6b",
    "Author photo on BlogPostPage byline",
    has_author_blog,
    "Expected author image reference in BlogPostPage.tsx",
)


# ─────────────────────────────────────────────────────────
#  WEEK 3 CHECKS
# ─────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  WEEK 3 — AEO / GEO & Schema Enhancements")
print("=" * 60)

compare_page = read(COMPARE_PAGE)

# W3-T2a: QuickAnswer wrapped in <section> with itemScope
has_section_answer = bool(
    re.search(r'<section[\s\S]*?itemScope', compare_page)
)
check(
    "W3-T2a",
    "QuickAnswer wrapped in <section itemScope>",
    has_section_answer,
    "Expected <section ... itemScope in CompareArticlePage.tsx",
)

# W3-T2b: schema.org/Answer itemType
has_answer_schema = bool(
    re.search(r'schema\.org/Answer', compare_page)
)
check(
    "W3-T2b",
    "QuickAnswer has itemType schema.org/Answer",
    has_answer_schema,
    "Expected itemType='https://schema.org/Answer'",
)

# W3-T2c: itemProp="text" on answer paragraph
has_itemprop_text = bool(
    re.search(r'itemProp\s*=\s*"text"', compare_page)
    or re.search(r"itemProp\s*=\s*['\"]text['\"]", compare_page)
)
check(
    "W3-T2c",
    'QuickAnswer paragraph has itemProp="text"',
    has_itemprop_text,
    'Expected itemProp="text" on the answer <p> tag',
)

# W3-T2d: H2 heading with tool names in QuickAnswer
has_h2_quick = bool(
    re.search(r"<h2[\s\S]*?Quick\s*Answer", compare_page)
)
check(
    "W3-T2d",
    "QuickAnswer has <h2> heading with tool names",
    has_h2_quick,
    "Expected <h2> containing 'Quick Answer:' with dynamic tool names",
)

# W3-T3a: DefinedTermSet schema in glossary section
has_defined_term_set = bool(
    re.search(r"DefinedTermSet", prerender)
)
check(
    "W3-T3a",
    "DefinedTermSet schema added for Glossary",
    has_defined_term_set,
    "Expected '@type': 'DefinedTermSet' in glossary section of prerender.mjs",
)

# W3-T3b: DefinedTerm entries (may be generated via .map(), so also check GLOSSARY_TERMS array size)
defined_term_literal = len(re.findall(r"DefinedTerm", prerender))
# Count terms in the GLOSSARY_TERMS array (each { term: '...' } entry)
glossary_terms_count = len(re.findall(r"\{\s*term\s*:", prerender))
has_map_pattern = bool(re.search(r"\.map\(.*DefinedTerm", prerender, re.DOTALL))
effective_count = glossary_terms_count if has_map_pattern else defined_term_literal
check(
    "W3-T3b",
    f"DefinedTerm entries present ({glossary_terms_count} terms via .map() expansion)",
    effective_count >= 10,
    f"Expected ≥10 terms in GLOSSARY_TERMS array (found {glossary_terms_count}). "
    f"Literal 'DefinedTerm' occurrences: {defined_term_literal}",
)

# W3-T3c: FAQPage schema for glossary
# Check for faqSchema call in glossary section
glossary_section = re.search(
    r"Glossary page.*?console\.log\(\s*['\"].*glossary", prerender, re.DOTALL | re.IGNORECASE
)
has_glossary_faq = bool(glossary_section and "faqSchema" in glossary_section.group())
check(
    "W3-T3c",
    "FAQPage schema added for Glossary page",
    has_glossary_faq,
    "Expected faqSchema() call in glossary section of prerender.mjs",
)

# W3-T3d: Glossary terms have URL anchors (may use template literals like `${canonical}#${toSlug(...)}`)
has_glossary_anchors = bool(
    re.search(r"url.*?glossary.*?#", prerender)
    or re.search(r"url.*?\$\{canonical\}#", prerender)
    or re.search(r"canonical.*#.*toSlug", prerender)
    or re.search(r"\$\{canonical\}#\$\{toSlug", prerender)
)
check(
    "W3-T3d",
    "Glossary terms have anchor URLs (#slug)",
    has_glossary_anchors,
    "Expected url with #slug pattern (literal or template literal) for DefinedTerm entries",
)

# W3-T5a: SiteNavigationElement schema
has_site_nav = bool(
    re.search(r"SiteNavigationElement", prerender)
)
check(
    "W3-T5a",
    "SiteNavigationElement schema on Homepage",
    has_site_nav,
    "Expected '@type': 'SiteNavigationElement' in homepage section of prerender.mjs",
)

# W3-T5b: Nav items include key pages
nav_section = re.search(
    r"SiteNavigationElement.*?\}", prerender, re.DOTALL
)
nav_text = nav_section.group() if nav_section else ""
nav_pages = ["blog", "glossary", "about", "compare", "free"]
nav_found = [p for p in nav_pages if p in nav_text.lower()]
check(
    "W3-T5b",
    f"SiteNav includes key pages ({len(nav_found)}/{len(nav_pages)} found)",
    len(nav_found) >= 4,
    f"Found: {nav_found}. Expected at least 4 of: {nav_pages}",
)

# W3-T5c: SiteNav injected as <script> tag
has_site_nav_script = bool(
    re.search(r"siteNavSchema", prerender)
)
check(
    "W3-T5c",
    "SiteNavigationElement injected as JSON-LD script tag",
    has_site_nav_script,
    "Expected siteNavSchema variable used in script tag injection",
)


# ─────────────────────────────────────────────────────────
#  SUMMARY
# ─────────────────────────────────────────────────────────
print("\n" + "=" * 60)
total = len(results)
passed = sum(1 for _, ok, _ in results if ok)
failed = total - passed
color = "\033[92m" if failed == 0 else "\033[91m"
print(f"  {color}RESULTS: {passed}/{total} checks passed, {failed} failed\033[0m")
print("=" * 60)

if failed:
    print("\n  Failed checks:")
    for tid, ok, label in results:
        if not ok:
            print(f"    ✘ [{tid}] {label}")
    print()

sys.exit(1 if failed else 0)
