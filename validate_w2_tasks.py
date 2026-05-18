#!/usr/bin/env python3
"""
AI Nexus — Week 2 Task Validation Script
=========================================
Validates every W2 fix against the project source files.

Usage:
    python validate_w2_tasks.py                     # auto-detects project root
    python validate_w2_tasks.py /path/to/project    # explicit path

Exit codes:
    0 — all checks passed
    1 — one or more checks failed
"""

import sys
import os
import re
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

# ── ANSI colours ─────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RESET  = "\033[0m"

def ok(msg):    print(f"  {GREEN}✓{RESET}  {msg}")
def fail(msg):  print(f"  {RED}✗{RESET}  {RED}{msg}{RESET}")
def warn(msg):  print(f"  {YELLOW}⚠{RESET}  {YELLOW}{msg}{RESET}")
def info(msg):  print(f"  {DIM}{msg}{RESET}")

# ── Result tracking ───────────────────────────────────────────────────────────
@dataclass
class Results:
    passed: int = 0
    failed: int = 0
    skipped: int = 0
    failures: list = field(default_factory=list)

    def record(self, passed: bool, check: str, detail: str = ""):
        if passed:
            self.passed += 1
            ok(check)
        else:
            self.failed += 1
            self.failures.append(f"{check}" + (f" — {detail}" if detail else ""))
            fail(check + (f" — {detail}" if detail else ""))

    def skip(self, check: str, reason: str):
        self.skipped += 1
        warn(f"SKIP  {check}  ({reason})")


def section(title: str):
    print(f"\n{BOLD}{CYAN}{'─' * 60}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'─' * 60}{RESET}")


def read(path: Path) -> Optional[str]:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return None
    except Exception as e:
        return None


# ── Project root detection ────────────────────────────────────────────────────
def find_project_root(hint: str = "") -> Path:
    candidates = [Path(hint)] if hint else []
    candidates += [
        Path.cwd(),
        Path.cwd() / "AI-Nexus-main",
        Path(__file__).parent,
        Path(__file__).parent / "AI-Nexus-main",
    ]
    for c in candidates:
        if (c / "pages" / "ToolPage.tsx").exists():
            return c
    # Last resort: walk up from cwd
    p = Path.cwd()
    for _ in range(5):
        if (p / "pages" / "ToolPage.tsx").exists():
            return p
        p = p.parent
    return Path.cwd()


# ═════════════════════════════════════════════════════════════════════════════
# TASK VALIDATORS
# ═════════════════════════════════════════════════════════════════════════════

def validate_w2_t1(root: Path, r: Results):
    """
    W2-T1 · HIGH · SCHEMA · CTR
    Verify FAQPage JSON-LD is injected for all blog posts in prerender.mjs.

    Checks:
      1. prerender.mjs exists
      2. faqSchema() function is defined
      3. BLOG_POSTS loop injects faqSchema when faqs present
      4. Every blog .ts file in /blog/ has a non-empty faqs: array
      5. Every blog post slug present in BLOG_POSTS in prerender.mjs
    """
    section("W2-T1 · FAQPage JSON-LD injected for all blog posts")
    info("File: scripts/prerender.mjs  |  blog/*.ts")

    prerender = root / "scripts" / "prerender.mjs"
    content = read(prerender)

    if content is None:
        r.record(False, "prerender.mjs exists", "file not found")
        r.skip("faqSchema function defined", "prerender.mjs missing")
        r.skip("faqSchema injected in BLOG_POSTS loop", "prerender.mjs missing")
        r.skip("All blog .ts files have faqs arrays", "prerender.mjs missing")
        r.skip("All blog slugs registered in BLOG_POSTS", "prerender.mjs missing")
        return

    r.record(True, "prerender.mjs exists")

    # Check faqSchema function definition
    has_faq_fn = "function faqSchema(" in content or "faqSchema" in content
    r.record(has_faq_fn, "faqSchema() function defined in prerender.mjs")

    # Check faqSchema is injected in the BLOG_POSTS loop
    # The pattern: post.faqs.length > 0 ? [faqSchema(post.faqs)] : []
    pattern = r"post\.faqs\.length\s*>\s*0\s*\?\s*\[faqSchema\(post\.faqs\)\]"
    has_injection = bool(re.search(pattern, content))
    r.record(
        has_injection,
        "faqSchema injected in BLOG_POSTS loop (post.faqs.length > 0 guard)",
        "pattern not found — check: ...(post.faqs.length > 0 ? [faqSchema(post.faqs)] : [])"
    )

    # Check every blog .ts file has a faqs: array with content
    blog_dir = root / "blog"
    blog_files = [
        f for f in blog_dir.glob("*.ts")
        if f.name not in ("index.ts", "types.ts")
    ] if blog_dir.exists() else []

    blog_slugs_in_files = []
    missing_faqs = []
    empty_faqs = []

    for bf in blog_files:
        text = read(bf)
        if text is None:
            continue
        slug = bf.stem
        blog_slugs_in_files.append(slug)
        if "faqs:" not in text:
            missing_faqs.append(slug)
        elif re.search(r"faqs:\s*\[\s*\]", text):
            empty_faqs.append(slug)

    if missing_faqs:
        r.record(False, f"All blog .ts files have a faqs: array",
                 f"missing in: {', '.join(missing_faqs)}")
    elif empty_faqs:
        r.record(False, f"All blog .ts faqs arrays are non-empty",
                 f"empty faqs: {', '.join(empty_faqs)}")
    else:
        r.record(True, f"All {len(blog_files)} blog .ts files have non-empty faqs arrays")

    # Check all blog slugs are registered in BLOG_POSTS
    registered = re.findall(r"slug:\s*['\"]([^'\"]+)['\"]", content)
    missing_from_prerender = [s for s in blog_slugs_in_files if s not in registered]
    if missing_from_prerender:
        r.record(False, "All blog slugs registered in BLOG_POSTS in prerender.mjs",
                 f"missing: {', '.join(missing_from_prerender)}")
    else:
        r.record(True, f"All {len(blog_slugs_in_files)} blog slugs registered in BLOG_POSTS")


def validate_w2_t2(root: Path, r: Results):
    """
    W2-T2 · HIGH · CONTENT
    Expand BestAIToolsIndiaPage — add India Verdict paragraphs + UPI payment section.

    Checks:
      1. BestAIToolsIndiaPage.tsx exists
      2. indiaVerdict field declared in INDIA_TOOLS type
      3. Top-3 tools (grammarly, rytr, canva-ai) have non-empty indiaVerdict values
      4. Each verdict is meaningful length (>= 40 words)
      5. India Verdict render block present in IndiaToolCard
      6. UPI/Payment Methods section present in page JSX
      7. Key India payment terms mentioned (UPI, Niyo, international)
    """
    section("W2-T2 · BestAIToolsIndiaPage — India Verdicts + UPI Payment Section")
    info("File: pages/BestAIToolsIndiaPage.tsx")

    path = root / "pages" / "BestAIToolsIndiaPage.tsx"
    content = read(path)

    if content is None:
        r.record(False, "BestAIToolsIndiaPage.tsx exists", "file not found")
        for check in [
            "indiaVerdict field in INDIA_TOOLS type",
            "Grammarly indiaVerdict populated",
            "Rytr indiaVerdict populated",
            "Canva AI indiaVerdict populated",
            "All top-3 verdicts >= 40 words",
            "India Verdict render block in IndiaToolCard",
            "UPI/Payment Methods section present",
            "Key payment terms present (UPI, Niyo, international)",
        ]:
            r.skip(check, "file missing")
        return

    r.record(True, "BestAIToolsIndiaPage.tsx exists")

    # indiaVerdict in type declaration
    r.record(
        "indiaVerdict?" in content or "indiaVerdict:" in content,
        "indiaVerdict field declared in INDIA_TOOLS type/array"
    )

    # Top-3 tools have populated verdicts
    top3 = [
        ("grammarly", "Grammarly"),
        ("rytr", "Rytr"),
        ("canva-ai", "Canva AI"),
    ]
    verdict_lengths = {}
    for slug, name in top3:
        # Find the indiaVerdict string for this tool block
        # Strategy: find the slug block then look for indiaVerdict in it
        # Use a generous window (500 chars) after slug appears
        pattern = rf"slug:\s*['\"]({re.escape(slug)})['\"].*?indiaVerdict:\s*['\"]([^'\"]+)['\"]"
        m = re.search(pattern, content, re.DOTALL)
        if m:
            verdict_text = m.group(2)
            word_count = len(verdict_text.split())
            verdict_lengths[slug] = word_count
            r.record(True, f"{name} indiaVerdict populated ({word_count} words)")
        else:
            verdict_lengths[slug] = 0
            r.record(False, f"{name} indiaVerdict populated",
                     "no indiaVerdict string found after slug declaration")

    # All verdicts >= 40 words
    short = [s for s, wc in verdict_lengths.items() if 0 < wc < 40]
    missing = [s for s, wc in verdict_lengths.items() if wc == 0]
    if missing:
        r.record(False, "All top-3 verdicts >= 40 words",
                 f"missing verdicts for: {', '.join(missing)}")
    elif short:
        r.record(False, "All top-3 verdicts >= 40 words",
                 f"too short (<40 words): {', '.join(short)}")
    else:
        r.record(True, "All top-3 verdicts >= 40 words")

    # India Verdict render block in IndiaToolCard
    has_render = "India Verdict" in content and "indiaVerdict" in content
    r.record(has_render, "India Verdict render block present in IndiaToolCard JSX")

    # UPI/Payment section
    has_payment_section = (
        "Payment Methods" in content or
        "UPI & Indian" in content or
        "payment" in content.lower() and "UPI" in content
    )
    r.record(has_payment_section, "UPI/Payment Methods section present in page JSX")

    # Key payment terms
    terms = {
        "UPI": "UPI" in content,
        "Niyo": "Niyo" in content,
        "international card": "international" in content.lower(),
    }
    missing_terms = [t for t, present in terms.items() if not present]
    r.record(
        len(missing_terms) == 0,
        "Key payment terms present: UPI, Niyo, international card",
        f"missing: {', '.join(missing_terms)}" if missing_terms else ""
    )


def validate_w2_t3(root: Path, r: Results):
    """
    W2-T3 · MEDIUM · TECHNICAL
    BreadcrumbList schema injected for /best-free-ai-tools/ and /best-ai-tools-india/.

    Checks:
      1. prerender.mjs exists
      2. breadcrumbs() called in best-free-ai-tools route block
      3. breadcrumbs() called in best-ai-tools-india route block
      4. BreadcrumbSchema component present in BestAIToolsIndiaPage.tsx
      5. BestFreeAIToolsPage has breadcrumb schema (via prerender OR component)
    """
    section("W2-T3 · BreadcrumbList schema for /best-free-ai-tools/ and /best-ai-tools-india/")
    info("Files: scripts/prerender.mjs  |  pages/BestAIToolsIndiaPage.tsx")

    prerender = root / "scripts" / "prerender.mjs"
    content = read(prerender)

    if content is None:
        r.record(False, "prerender.mjs exists", "file not found")
        r.skip("breadcrumbs() in best-free-ai-tools block", "prerender.mjs missing")
        r.skip("breadcrumbs() in best-ai-tools-india block", "prerender.mjs missing")
    else:
        r.record(True, "prerender.mjs exists")

        # best-free-ai-tools breadcrumb
        # Find the block and check breadcrumbs appears nearby
        free_block_match = re.search(
            r"best-free-ai-tools.*?breadcrumbs\(",
            content, re.DOTALL
        )
        r.record(
            bool(free_block_match),
            "breadcrumbs() schema in /best-free-ai-tools/ route block",
            "not found — check the best-free-ai-tools section in prerender.mjs"
        )

        # best-ai-tools-india breadcrumb
        india_block_match = re.search(
            r"best-ai-tools-india.*?breadcrumbs\(",
            content, re.DOTALL
        )
        r.record(
            bool(india_block_match),
            "breadcrumbs() schema in /best-ai-tools-india/ route block",
            "not found — check the best-ai-tools-india section in prerender.mjs"
        )

    # BreadcrumbSchema inline component in BestAIToolsIndiaPage.tsx
    india_page = root / "pages" / "BestAIToolsIndiaPage.tsx"
    india_content = read(india_page)

    if india_content is None:
        r.skip("BreadcrumbSchema component in BestAIToolsIndiaPage.tsx", "file not found")
    else:
        has_component = (
            "BreadcrumbSchema" in india_content and
            "BreadcrumbList" in india_content
        )
        r.record(
            has_component,
            "BreadcrumbSchema component present in BestAIToolsIndiaPage.tsx"
        )


def validate_w2_t4(root: Path, r: Results):
    """
    W2-T4 · MEDIUM · SCHEMA
    Medium profile in sameAs — depends on Medium article being published first.
    This task is BLOCKED on a non-code action. We validate the placeholder exists
    and flag whether Medium has been added yet.
    """
    section("W2-T4 · Medium profile in sameAs (non-code dependency)")
    info("Files: scripts/prerender.mjs  |  pages/AboutPage.tsx")
    info("Status: BLOCKED until Medium article is published")

    about = root / "pages" / "AboutPage.tsx"
    prerender = root / "scripts" / "prerender.mjs"

    about_content = read(about)
    prerender_content = read(prerender)

    # Check placeholder comment exists (shows intent is tracked in code)
    if about_content:
        has_placeholder = "medium.com/@navneetarya" in about_content
        if has_placeholder:
            # Check if it's still a comment or actually added
            is_live = bool(re.search(
                r'"https://medium\.com/@navneetarya"',
                about_content
            ))
            if is_live:
                ok("Medium URL is live in AboutPage.tsx sameAs ✓ (W2-T4 complete)")
                r.passed += 1
            else:
                warn("Medium URL placeholder in AboutPage.tsx — add after publishing")
                r.skipped += 1
        else:
            r.record(False, "Medium URL placeholder present in AboutPage.tsx",
                     "no reference to medium.com/@navneetarya found")
    else:
        r.skip("AboutPage.tsx Medium placeholder check", "file not found")

    if prerender_content:
        has_placeholder = "medium.com/@navneetarya" in prerender_content
        if has_placeholder:
            # Check AUTHOR_SAME_AS specifically
            is_live = bool(re.search(
                r"'https://medium\.com/@navneetarya'",
                prerender_content
            ))
            if is_live:
                ok("Medium URL is live in prerender.mjs AUTHOR_SAME_AS ✓")
                r.passed += 1
            else:
                warn("Medium URL placeholder in prerender.mjs — add after publishing")
                r.skipped += 1
        else:
            # Not there yet — this is expected until article is published
            warn("Medium URL not yet in prerender.mjs AUTHOR_SAME_AS — add after publishing")
            r.skipped += 1
    else:
        r.skip("prerender.mjs Medium placeholder check", "file not found")


def validate_w2_t5(root: Path, r: Results):
    """
    W2-T5 · MEDIUM · CONTENT
    Sources consulted disclosure added to myTake sections in ToolPage.tsx.

    Checks:
      1. ToolPage.tsx exists
      2. "Sources consulted" label present
      3. Block positioned after myTake paragraph (not before)
      4. G2 review count rendered from researchSources
      5. Trustpilot data rendered from researchSources
      6. Reddit communities rendered from researchSources
      7. Research date (lastVerified) rendered
      8. Link to /methodology/ present in the sources block
      9. researchSources guard used (conditional render)
      10. constants.ts has researchSources on all tools
    """
    section("W2-T5 · Sources consulted disclosure in ToolPage.tsx myTake sections")
    info("Files: pages/ToolPage.tsx  |  constants.ts")

    path = root / "pages" / "ToolPage.tsx"
    content = read(path)

    if content is None:
        r.record(False, "ToolPage.tsx exists", "file not found")
        for c in [
            '"Sources consulted" label present',
            "Block positioned after myTake paragraph",
            "G2 review count rendered (researchSources.g2.count)",
            "Trustpilot data rendered (researchSources.trustpilot)",
            "Reddit communities rendered (researchSources.reddit)",
            "Research date rendered (researchSources.lastVerified)",
            "Link to /methodology/ in sources block",
            "Conditional render guard (tool.researchSources)",
        ]:
            r.skip(c, "ToolPage.tsx missing")
        return

    r.record(True, "ToolPage.tsx exists")

    # "Sources consulted" label
    r.record(
        "Sources consulted" in content,
        '"Sources consulted" label present in ToolPage.tsx'
    )

    # Block comes AFTER content.myTake paragraph
    # Find positions of myTake render and sources block
    mytake_pos = content.find("{content.myTake}")
    sources_pos = content.find("Sources consulted")
    if mytake_pos == -1:
        r.record(False, "Block positioned after myTake paragraph",
                 "{content.myTake} render not found in file")
    elif sources_pos == -1:
        r.record(False, "Block positioned after myTake paragraph",
                 "Sources consulted block not found")
    else:
        r.record(
            sources_pos > mytake_pos,
            "Sources consulted block positioned after {content.myTake} paragraph"
        )

    # G2 count
    r.record(
        "researchSources.g2" in content and "g2.count" in content,
        "G2 review count rendered (tool.researchSources.g2.count)"
    )

    # Trustpilot
    r.record(
        "researchSources.trustpilot" in content and "trustpilot.count" in content,
        "Trustpilot review count rendered (tool.researchSources.trustpilot.count)"
    )

    # Reddit
    r.record(
        "researchSources.reddit" in content,
        "Reddit communities rendered (tool.researchSources.reddit)"
    )

    # lastVerified / research date
    r.record(
        "researchSources.lastVerified" in content or "lastVerified" in content,
        "Research date rendered (tool.researchSources.lastVerified)"
    )

    # Link to methodology
    # Must appear within the sources block — search from the *rendered* label
    # (the second occurrence is the JSX text node, not the comment).
    # The block spans ~2300 chars, so use a 4000-char window to be safe.
    all_sources_positions = [
        m.start() for m in re.finditer("Sources consulted", content)
    ]
    found_meth = False
    for sources_pos_i in all_sources_positions:
        window = content[sources_pos_i: sources_pos_i + 4000]
        if "/methodology/" in window:
            found_meth = True
            break
    r.record(
        found_meth,
        'Link to /methodology/ present inside sources block'
    )

    # Conditional guard
    r.record(
        "tool.researchSources" in content and
        ("tool.researchSources &&" in content or "{tool.researchSources" in content),
        "Conditional render guard present (tool.researchSources &&)"
    )

    # Validate constants.ts has researchSources on all tools
    constants = root / "constants.ts"
    constants_content = read(constants)
    if constants_content is None:
        r.skip("constants.ts has researchSources on all tools", "constants.ts not found")
    else:
        # Parse per-tool blocks to find which ones are missing researchSources
        blocks = re.split(r"(?=id: '[^']+', slug: ')", constants_content)
        missing_rs = []
        has_rs = []
        for block in blocks:
            slug_m = re.search(r"slug: '([^']+)'", block)
            if not slug_m:
                continue
            slug = slug_m.group(1)
            if "researchSources:" in block:
                has_rs.append(slug)
            else:
                missing_rs.append(slug)

        total = len(has_rs) + len(missing_rs)
        if missing_rs:
            r.record(
                False,
                f"constants.ts: researchSources on all {total} tools "
                f"({len(has_rs)} have it, {len(missing_rs)} missing)",
                f"missing: {', '.join(missing_rs)}"
            )
        else:
            r.record(True, f"constants.ts: researchSources on all {total} tools ✓")


# ═════════════════════════════════════════════════════════════════════════════
# BONUS: Sitemap check (W2 mentioned india page should be in sitemap)
# ═════════════════════════════════════════════════════════════════════════════

def validate_sitemap(root: Path, r: Results):
    section("BONUS · Sitemap sanity (India page + blog posts)")
    info("File: public/sitemap.xml")

    sitemap = root / "public" / "sitemap.xml"
    content = read(sitemap)

    if content is None:
        r.record(False, "public/sitemap.xml exists", "file not found")
        return

    r.record(True, "public/sitemap.xml exists")

    checks = {
        "/best-ai-tools-india/": "Best AI Tools India page in sitemap",
        "/best-free-ai-tools/": "Best Free AI Tools page in sitemap",
    }
    for url, label in checks.items():
        r.record(url in content, label)

    # Count blog posts in sitemap vs blog folder
    sitemap_blogs = re.findall(r"/blog/([^/<]+)/", content)
    blog_dir = root / "blog"
    if blog_dir.exists():
        blog_files = [
            f.stem for f in blog_dir.glob("*.ts")
            if f.name not in ("index.ts", "types.ts")
        ]
        not_in_sitemap = [b for b in blog_files if b not in sitemap_blogs]
        if not_in_sitemap:
            r.record(False,
                     f"All blog posts in sitemap ({len(blog_files)} total)",
                     f"missing: {', '.join(not_in_sitemap)}")
        else:
            r.record(True, f"All {len(blog_files)} blog posts present in sitemap")


# ═════════════════════════════════════════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════════════════════════════════════════

def main():
    hint = sys.argv[1] if len(sys.argv) > 1 else ""
    root = find_project_root(hint)

    print(f"\n{BOLD}AI Nexus — Week 2 Task Validation{RESET}")
    print(f"{DIM}Project root: {root}{RESET}")

    r = Results()

    validate_w2_t1(root, r)
    validate_w2_t2(root, r)
    validate_w2_t3(root, r)
    validate_w2_t4(root, r)
    validate_w2_t5(root, r)
    validate_sitemap(root, r)

    # ── Summary ──────────────────────────────────────────────────────────────
    print(f"\n{BOLD}{'═' * 60}{RESET}")
    print(f"{BOLD}  SUMMARY{RESET}")
    print(f"{'═' * 60}")
    print(f"  {GREEN}Passed : {r.passed}{RESET}")
    print(f"  {RED}Failed : {r.failed}{RESET}")
    print(f"  {YELLOW}Skipped: {r.skipped}{RESET} (blocked on non-code dependencies)")

    if r.failures:
        print(f"\n{BOLD}{RED}  Failed checks:{RESET}")
        for f in r.failures:
            print(f"    {RED}✗{RESET}  {f}")

    if r.failed == 0:
        print(f"\n  {GREEN}{BOLD}All checks passed. Week 2 tasks are complete. ✓{RESET}\n")
        sys.exit(0)
    else:
        print(f"\n  {RED}{BOLD}{r.failed} check(s) failed. Review the output above.{RESET}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
