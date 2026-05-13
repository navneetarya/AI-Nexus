#!/usr/bin/env python3
"""
validate_w3_fixes.py
────────────────────
Week 3 audit-fix validator for AI Nexus (ainexustools.online).

Checks:
  1. New India freelancers post exists and is structurally complete
  2. Logo makers post has India updates applied
  3. blog/index.ts registers the new post

Usage:
  python validate_w3_fixes.py                        # auto-detects repo root
  python validate_w3_fixes.py --repo /path/to/repo   # explicit path

Exit codes:
  0 — all checks passed
  1 — one or more checks failed
"""

import re
import sys
import argparse
from pathlib import Path
from datetime import date

# ── ANSI colours ──────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

PASS = f"{GREEN}✓ PASS{RESET}"
FAIL = f"{RED}✗ FAIL{RESET}"
WARN = f"{YELLOW}⚠ WARN{RESET}"

# ── Result tracker ─────────────────────────────────────────────────────────────
results: list[tuple[str, str, str]] = []   # (status, check_name, detail)

def ok(name: str, detail: str = "") -> None:
    results.append(("PASS", name, detail))
    print(f"  {PASS}  {name}" + (f" — {detail}" if detail else ""))

def fail(name: str, detail: str = "") -> None:
    results.append(("FAIL", name, detail))
    print(f"  {FAIL}  {name}" + (f"\n         {RED}{detail}{RESET}" if detail else ""))

def warn(name: str, detail: str = "") -> None:
    results.append(("WARN", name, detail))
    print(f"  {WARN}  {name}" + (f" — {detail}" if detail else ""))

# ── Helpers ────────────────────────────────────────────────────────────────────
def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")

def contains(text: str, *phrases: str) -> bool:
    return all(p.lower() in text.lower() for p in phrases)

def count_words(html_text: str) -> int:
    clean = re.sub(r"<[^>]+>", " ", html_text)
    return len(clean.split())

def extract_field(text: str, field: str) -> str:
    """Pull the value of a string field from a TS object literal."""
    pattern = rf"{re.escape(field)}\s*:\s*['\"`]([^'\"`]+)['\"`]"
    m = re.search(pattern, text)
    return m.group(1).strip() if m else ""

def extract_content_block(text: str) -> str:
    """Extract the template-literal content field."""
    m = re.search(r"content\s*:\s*`([\s\S]*?)`\s*\.trim\(\)", text)
    if m:
        return m.group(1)
    m = re.search(r"content\s*:\s*`([\s\S]*?)`", text)
    return m.group(1) if m else ""

def faq_count(text: str) -> int:
    return len(re.findall(r"\{\s*q\s*:", text))

# ── Section printers ───────────────────────────────────────────────────────────
def section(title: str) -> None:
    print(f"\n{BOLD}{CYAN}{'─'*60}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'─'*60}{RESET}")

# ══════════════════════════════════════════════════════════════════════════════
# CHECK 1 — New India freelancers post
# ══════════════════════════════════════════════════════════════════════════════
def check_india_freelancers_post(repo: Path) -> None:
    section("CHECK 1 · blog/best-ai-tools-for-freelancers-india-2026.ts  (W3-T3 NEW FILE)")

    target = repo / "blog" / "best-ai-tools-for-freelancers-india-2026.ts"

    # 1.1 File exists
    if not target.exists():
        fail("File exists", str(target))
        return
    ok("File exists")

    text = read(target)

    # 1.2 Required BlogPost fields
    required_fields = ["slug", "title", "metaDescription", "datePublished",
                       "dateModified", "author", "category", "readTime",
                       "excerpt", "content", "faqs"]
    missing = [f for f in required_fields if f not in text]
    if missing:
        fail("Required BlogPost fields present", f"Missing: {missing}")
    else:
        ok("Required BlogPost fields present")

    # 1.3 Correct slug
    slug = extract_field(text, "slug")
    if slug == "best-ai-tools-for-freelancers-india-2026":
        ok("Slug correct", slug)
    else:
        fail("Slug correct", f"Got: '{slug}'")

    # 1.4 Category = 'india' (needed for W4 OG image routing)
    cat = extract_field(text, "category")
    if cat == "india":
        ok("Category = 'india' (W4 OG routing ready)")
    else:
        warn("Category = 'india'", f"Got '{cat}' — OG image routing won't fire for India category")

    # 1.5 Target keyword in title + metaDescription
    title_val = extract_field(text, "title")
    meta_val  = extract_field(text, "metaDescription")
    if "india" in title_val.lower() and "freelancer" in title_val.lower():
        ok("Target keyword in title", title_val[:70] + "…")
    else:
        fail("Target keyword in title", f"'india' + 'freelancer' not found in: {title_val}")

    if "india" in meta_val.lower() and "freelancer" in meta_val.lower():
        ok("Target keyword in metaDescription")
    else:
        warn("Target keyword in metaDescription", "Consider adding 'India' and 'freelancer' explicitly")

    # 1.6 SEO title ≤ 60 chars (Google cuts at ~60)
    seo = extract_field(text, "seoTitle")
    if seo:
        full_seo = seo + " | AI Nexus"
        if len(full_seo) <= 65:
            ok("SEO title length OK", f"{len(full_seo)} chars: '{full_seo}'")
        else:
            warn("SEO title length", f"{len(full_seo)} chars (>65) — Google may truncate: '{full_seo}'")

    # 1.7 Meta description length (120–160 chars)
    if meta_val:
        if 120 <= len(meta_val) <= 160:
            ok("Meta description length OK", f"{len(meta_val)} chars")
        else:
            warn("Meta description length", f"{len(meta_val)} chars (target: 120–160)")

    # 1.8 dateModified is today or recent (within 7 days)
    dm = extract_field(text, "dateModified")
    try:
        d = date.fromisoformat(dm)
        delta = (date.today() - d).days
        if delta <= 7:
            ok("dateModified is recent", dm)
        else:
            warn("dateModified is recent", f"Set to {dm} ({delta} days ago) — update to today")
    except ValueError:
        fail("dateModified valid date", f"Got: '{dm}'")

    # 1.9 INR pricing present in content
    content = extract_content_block(text)
    inr_matches = re.findall(r"₹[\d,]+", content)
    if len(inr_matches) >= 3:
        ok("INR pricing in content", f"{len(inr_matches)} occurrences: {inr_matches[:5]}")
    else:
        fail("INR pricing in content", f"Only {len(inr_matches)} ₹ occurrences — need ≥3")

    # 1.10 UPI mention
    if "upi" in content.lower():
        ok("UPI mentioned in content")
    else:
        warn("UPI mentioned in content", "Adding UPI reference improves India trust signals")

    # 1.11 Word count (target 900–1,100)
    words = count_words(content)
    if 800 <= words <= 1200:
        ok("Word count in range", f"~{words} words (target: 900–1,100)")
    elif words < 800:
        fail("Word count in range", f"Only ~{words} words — too thin for KD 8 ranking")
    else:
        warn("Word count", f"~{words} words — slightly long but fine")

    # 1.12 FAQs (≥ 4 for FAQPage schema coverage)
    faqs = faq_count(text)
    if faqs >= 4:
        ok("FAQ count", f"{faqs} Q&A pairs (schema-eligible)")
    else:
        fail("FAQ count", f"Only {faqs} FAQs — add ≥4 for FAQPage JSON-LD schema")

    # 1.13 Internal links to compare pages
    compare_links = re.findall(r'href=["\']/(compare|tools)/[^"\']+["\']', content)
    if len(compare_links) >= 2:
        ok("Internal links to /compare or /tools", f"{len(compare_links)} links found")
    else:
        fail("Internal links to /compare or /tools", f"Only {len(compare_links)} — add links to compare pages for PageRank flow")

    # 1.14 Link back to Week 2 India post
    if "best-ai-tools-in-india-2026" in content:
        ok("Cross-link to Week 2 India post present")
    else:
        warn("Cross-link to Week 2 India post", "Add link to /blog/best-ai-tools-in-india-2026 for topical cluster")

    # 1.15 No false "personally tested" language (W1-T1 compliance)
    banned = ["personally tested", "i use this daily", "after weeks of testing",
              "i've been using", "i have been using", "i tested"]
    found_banned = [b for b in banned if b in text.lower()]
    if not found_banned:
        ok("No false 'personally tested' language (W1-T1 compliant)")
    else:
        fail("No false 'personally tested' language", f"Found: {found_banned}")


# ══════════════════════════════════════════════════════════════════════════════
# CHECK 2 — Updated logo makers post
# ══════════════════════════════════════════════════════════════════════════════
def check_logo_makers_post(repo: Path) -> None:
    section("CHECK 2 · blog/best-ai-logo-makers-free-2026.ts  (W3 UPDATE — India context)")

    target = repo / "blog" / "best-ai-logo-makers-free-2026.ts"

    if not target.exists():
        fail("File exists", str(target))
        return
    ok("File exists")

    text    = read(target)
    content = extract_content_block(text)

    # 2.1 India keyword in title
    title_val = extract_field(text, "title")
    if "india" in title_val.lower():
        ok("India in title", title_val[:70] + "…")
    else:
        fail("India in title", f"Missing — got: {title_val}")

    # 2.2 India in metaDescription
    meta_val = extract_field(text, "metaDescription")
    if "india" in meta_val.lower() or "inr" in meta_val.lower():
        ok("India/INR in metaDescription")
    else:
        fail("India/INR in metaDescription", f"Got: {meta_val}")

    # 2.3 Category updated to 'india'
    cat = extract_field(text, "category")
    if cat == "india":
        ok("Category updated to 'india'")
    else:
        warn("Category updated to 'india'", f"Currently '{cat}' — W4 OG routing targets 'india' category")

    # 2.4 dateModified updated
    dm = extract_field(text, "dateModified")
    try:
        d = date.fromisoformat(dm)
        delta = (date.today() - d).days
        if delta <= 7:
            ok("dateModified updated", dm)
        else:
            fail("dateModified updated", f"Still set to old date: {dm}")
    except ValueError:
        fail("dateModified valid date", f"Got: '{dm}'")

    # 2.5 INR pricing added to content
    inr_matches = re.findall(r"₹[\d,]+", content)
    if len(inr_matches) >= 4:
        ok("INR pricing added to content", f"{len(inr_matches)} occurrences: {inr_matches[:5]}")
    else:
        fail("INR pricing added to content", f"Only {len(inr_matches)} ₹ occurrences — need ≥4")

    # 2.6 UPI mentioned
    if "upi" in content.lower():
        ok("UPI payment method mentioned")
    else:
        warn("UPI payment method", "Adding UPI builds trust with Indian readers")

    # 2.7 India-specific decision section present
    india_section_triggers = ["india-specific", "indian creator", "indian freelancer",
                               "india-first", "based in india"]
    found = [t for t in india_section_triggers if t.lower() in content.lower()]
    if found:
        ok("India-specific section present", f"Detected: '{found[0]}'")
    else:
        fail("India-specific section present", "Add a dedicated India-first guidance section")

    # 2.8 FAQs include India-specific Q&A
    india_faq_pattern = re.findall(r"\{\s*q\s*:[^}]*india[^}]*\}", text, re.IGNORECASE)
    if india_faq_pattern:
        ok("India FAQ entries present", f"{len(india_faq_pattern)} India-specific Q&A found")
    else:
        fail("India FAQ entries present", "Add at least 1 FAQ specifically about India pricing or usage")

    # 2.9 Internal link to new India freelancers post
    if "best-ai-tools-for-freelancers-india-2026" in content:
        ok("Cross-link to new India freelancers post present")
    else:
        warn("Cross-link to new India freelancers post", "Add link to /blog/best-ai-tools-for-freelancers-india-2026")

    # 2.10 Word count (should be longer than original ~1,500)
    words = count_words(content)
    if words >= 1400:
        ok("Word count maintained/increased", f"~{words} words")
    else:
        warn("Word count", f"~{words} words — original was ~1,500, check nothing was removed")

    # 2.11 Original four tools still present
    tools = ["looka", "canva", "leonardo", "hatchful"]
    missing_tools = [t for t in tools if t not in content.lower()]
    if not missing_tools:
        ok("All 4 original tools present")
    else:
        fail("All 4 original tools present", f"Missing: {missing_tools}")

    # 2.12 No false "personally tested" language
    banned = ["i designed 20 logos", "i tested", "personally tested"]
    found_banned = [b for b in banned if b in text.lower()]
    if not found_banned:
        ok("No false personal testing claims (W1-T1 compliant)")
    else:
        warn("Personal testing language", f"Found: {found_banned} — consider replacing with research-based language")


# ══════════════════════════════════════════════════════════════════════════════
# CHECK 3 — blog/index.ts registration
# ══════════════════════════════════════════════════════════════════════════════
def check_blog_index(repo: Path) -> None:
    section("CHECK 3 · blog/index.ts  (New post registered)")

    target = repo / "blog" / "index.ts"

    if not target.exists():
        fail("blog/index.ts exists", str(target))
        return
    ok("blog/index.ts exists")

    text = read(target)

    # 3.1 Import statement present
    if "best-ai-tools-for-freelancers-india-2026" in text:
        ok("Import for new India freelancers post present")
    else:
        fail("Import for new India freelancers post", "Add: import post20 from './best-ai-tools-for-freelancers-india-2026'")

    # 3.2 Post included in BLOG_POSTS array
    array_match = re.search(r"export const BLOG_POSTS[^=]*=\s*\[([\s\S]*?)\]", text)
    if array_match:
        array_body = array_match.group(1)
        # Find post variable for india freelancers
        import_var = re.search(
            r"import\s+(post\d+)\s+from\s+['\"]./best-ai-tools-for-freelancers-india-2026['\"]",
            text
        )
        if import_var:
            var_name = import_var.group(1)
            if var_name in array_body:
                ok("New post in BLOG_POSTS array", f"Variable: {var_name}")
            else:
                fail("New post in BLOG_POSTS array", f"{var_name} imported but not in the array")
        else:
            fail("Import variable found for new post", "Cannot verify array inclusion without import variable")
    else:
        fail("BLOG_POSTS array found in index.ts")

    # 3.3 All previous posts still present (regression check)
    known_posts = [
        "best-ai-writing-tools-for-beginners-2026",
        "best-ai-tools-for-freelancers-2026",
        "best-grammarly-alternatives",
        "best-ai-tools-in-india-2026",
        "best-ai-logo-makers-free-2026",
    ]
    missing = [p for p in known_posts if p not in text]
    if not missing:
        ok("All previously registered posts retained (no regressions)")
    else:
        fail("Regression check — posts removed", f"Missing from index: {missing}")

    # 3.4 W3 comment annotation
    if "W3" in text or "w3" in text.lower():
        ok("W3 comment annotation present (traceability)")
    else:
        warn("W3 comment annotation", "Consider adding '// W3-T3' comment above the new import for traceability")

    # 3.5 Total post count sanity check
    import_count = len(re.findall(r"^import post\d+ from", text, re.MULTILINE))
    if import_count >= 20:
        ok("Post count sanity check", f"{import_count} posts registered")
    elif import_count >= 19:
        warn("Post count", f"{import_count} posts — new post may not have been added yet")
    else:
        fail("Post count", f"Only {import_count} posts — expected ≥20 after Week 3 addition")


# ══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════════════════════════
def print_summary() -> int:
    passes = sum(1 for r in results if r[0] == "PASS")
    fails  = sum(1 for r in results if r[0] == "FAIL")
    warns  = sum(1 for r in results if r[0] == "WARN")
    total  = len(results)

    print(f"\n{BOLD}{'═'*60}{RESET}")
    print(f"{BOLD}  WEEK 3 VALIDATION SUMMARY{RESET}")
    print(f"{BOLD}{'═'*60}{RESET}")
    print(f"  Total checks : {total}")
    print(f"  {GREEN}Passed       : {passes}{RESET}")
    print(f"  {RED}Failed       : {fails}{RESET}")
    print(f"  {YELLOW}Warnings     : {warns}{RESET}")

    if fails == 0 and warns == 0:
        print(f"\n  {GREEN}{BOLD}🎉 All checks passed. Files are ready to commit.{RESET}")
    elif fails == 0:
        print(f"\n  {YELLOW}{BOLD}⚠  No failures, but {warns} warning(s) to review before committing.{RESET}")
    else:
        print(f"\n  {RED}{BOLD}✗  {fails} check(s) failed. Fix before committing.{RESET}")
        print(f"\n  {RED}Failed checks:{RESET}")
        for r in results:
            if r[0] == "FAIL":
                print(f"    • {r[1]}" + (f": {r[2]}" if r[2] else ""))

    print(f"{BOLD}{'═'*60}{RESET}\n")
    return 1 if fails > 0 else 0


# ══════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════
def find_repo_root(start: Path) -> Path:
    """Walk up from cwd looking for blog/index.ts or package.json."""
    for parent in [start, *start.parents]:
        if (parent / "blog" / "index.ts").exists():
            return parent
        if (parent / "package.json").exists() and (parent / "blog").exists():
            return parent
    return start

def main() -> None:
    parser = argparse.ArgumentParser(description="Validate AI Nexus Week 3 blog fixes")
    parser.add_argument(
        "--repo", type=Path, default=None,
        help="Path to the AI Nexus repo root (auto-detected if omitted)"
    )
    args = parser.parse_args()

    repo = args.repo or find_repo_root(Path.cwd())

    print(f"\n{BOLD}AI Nexus — Week 3 Fix Validator{RESET}")
    print(f"Repo root : {CYAN}{repo}{RESET}")
    print(f"Run date  : {date.today().isoformat()}")

    check_india_freelancers_post(repo)
    check_logo_makers_post(repo)
    check_blog_index(repo)

    sys.exit(print_summary())


if __name__ == "__main__":
    main()
