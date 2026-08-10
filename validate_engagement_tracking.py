#!/usr/bin/env python3
"""
validate_engagement_tracking.py

Audits two engagement-tracking issues across the AI Nexus repo:

  1. OUTBOUND / CTA CLICK TRACKING
     - Extracts the `affiliateDomains` allowlist from ga-init.js
     - Scans every blog post (.ts) and page (.tsx) for outbound
       affiliate-style links (href="https://...")
     - Flags any external domain that's linked from content but is
       NOT covered by the affiliateDomains allowlist (untracked clicks)
     - Flags if bindAffiliateClickTracking() is still gated behind
       window.load / requestIdleCallback instead of firing immediately

  2. RELATED-POST / INTERNAL LINKING COVERAGE
     - Extracts every blog post's slug
     - Scans each post's `content` field for internal /blog/<slug>/ links
     - Flags posts with zero links to any other blog post
     - Warns if there's no dedicated BLOG_RELATED_POSTS map (as opposed
       to relying purely on ad-hoc links inside prose)

Usage:
    python3 validate_engagement_tracking.py [path-to-repo-root]

Exit code 1 if any FAIL-level issue is found, so it can be used as a
CI gate the same way your other validate_*.py scripts are.
"""

import os
import re
import sys
from collections import defaultdict

# ── ANSI colors ───────────────────────────────────────────────────────────
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def pass_(msg):
    print(f"{GREEN}✓ PASS{RESET}  {msg}")


def fail(msg):
    print(f"{RED}✗ FAIL{RESET}  {msg}")


def warn(msg):
    print(f"{YELLOW}⚠ WARN{RESET}  {msg}")


def section(title):
    print(f"\n{BOLD}{CYAN}── {title} {'─' * max(0, 60 - len(title))}{RESET}")


# ── Helpers ─────────────────────────────────────────────────────────────


def read(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def find_repo_files(repo_root, subdir, exts):
    out = []
    d = os.path.join(repo_root, subdir)
    if not os.path.isdir(d):
        return out
    for name in sorted(os.listdir(d)):
        if any(name.endswith(ext) for ext in exts):
            out.append(os.path.join(d, name))
    return out


EXTERNAL_HREF_RE = re.compile(r'href=["\'](https?://[^"\']+)["\']')
SLUG_RE = re.compile(r"slug:\s*['\"]([a-z0-9-]+)['\"]")
INTERNAL_BLOG_LINK_RE = re.compile(r'href=["\']\/blog\/([a-z0-9-]+)\/["\']')


def extract_affiliate_domains(ga_init_text):
    m = re.search(
        r"var\s+affiliateDomains\s*=\s*\[(.*?)\];", ga_init_text, re.DOTALL
    )
    if not m:
        return None
    raw = m.group(1)
    return [d.strip().strip("'\"") for d in raw.split(",") if d.strip()]


def domain_of(url):
    m = re.match(r"https?://([^/?#]+)", url)
    if not m:
        return None
    dom = m.group(1).lower()
    if dom.startswith("www."):
        dom = dom[4:]  # strip the literal "www." prefix (not str.lstrip,
        # which removes characters, not a prefix, and would mangle
        # domains like "writesonic.com" -> "ritesonic.com")
    return dom


def is_tracked(domain, affiliate_domains):
    # Mirrors the JS logic: href.indexOf(domain) !== -1
    return any(ad in domain for ad in affiliate_domains)


# ── Check 1: outbound / CTA click tracking ─────────────────────────────


def check_click_tracking(repo_root):
    section("Outbound / CTA Click Tracking")

    ga_init_path = os.path.join(repo_root, "public", "js", "ga-init.js")
    if not os.path.isfile(ga_init_path):
        fail(f"ga-init.js not found at {ga_init_path} — cannot audit tracking.")
        return False

    ga_init_text = read(ga_init_path)
    affiliate_domains = extract_affiliate_domains(ga_init_text)

    if affiliate_domains is None:
        fail("Could not parse `affiliateDomains` array out of ga-init.js.")
        return False

    pass_(f"Parsed {len(affiliate_domains)} domains from affiliateDomains allowlist.")

    # --- generic outbound-click catch-all check ---
    has_catchall = bool(re.search(r"gtag\(\s*['\"]event['\"]\s*,\s*['\"]outbound_click['\"]", ga_init_text))

    # --- binding timing check ---
    ok_timing = True
    call_match = re.search(r"^\s*bindAffiliateClickTracking\(\);\s*$", ga_init_text, re.MULTILINE)
    load_match = re.search(r"window\.addEventListener\(\s*['\"]load['\"]", ga_init_text)

    if not call_match:
        fail(
            "bindAffiliateClickTracking() is never called as a top-level "
            "statement — click tracking may not be active at all."
        )
        ok_timing = False
    elif load_match and call_match.start() > load_match.start():
        fail(
            "bindAffiliateClickTracking() is called AFTER the "
            "window.addEventListener('load', ...) block starts — it's still "
            "gated behind page load (+ requestIdleCallback), so early clicks "
            "can be missed."
        )
        ok_timing = False
    else:
        pass_(
            "bindAffiliateClickTracking() fires immediately at script-parse "
            "time, not gated behind window.load."
        )

    # --- domain coverage check ---
    blog_files = find_repo_files(repo_root, "blog", [".ts"])
    tsx_files = find_repo_files(repo_root, "pages", [".tsx"])
    all_content_files = blog_files + tsx_files

    REFERRAL_PARAM_RE = re.compile(r"[?&](via|fpr|pc|ref|aff|affid|utm_source=ainexus)=", re.IGNORECASE)

    used_domains = defaultdict(list)  # domain -> [(file, is_referral)]
    for path in all_content_files:
        text = read(path)
        for url in EXTERNAL_HREF_RE.findall(text):
            dom = domain_of(url)
            if not dom:
                continue
            # Skip obviously non-affiliate infra domains
            if any(
                skip in dom
                for skip in [
                    "ainexustools.online",
                    "schema.org",
                    "googletagmanager.com",
                    "google.com",
                    "w3.org",
                ]
            ):
                continue
            is_referral = bool(REFERRAL_PARAM_RE.search(url))
            used_domains[dom].append((os.path.relpath(path, repo_root), is_referral))

    untracked = {
        dom: entries
        for dom, entries in used_domains.items()
        if not is_tracked(dom, affiliate_domains)
    }

    untracked_referral = {d: e for d, e in untracked.items() if any(is_ref for _, is_ref in e)}
    untracked_reference = {d: e for d, e in untracked.items() if d not in untracked_referral}

    if untracked_referral:
        fail(
            f"{len(untracked_referral)} domain(s) have a REFERRAL LINK (?via=/?fpr=/?pc= etc.) "
            f"but aren't in affiliateDomains — these clicks earn revenue but aren't tracked:"
        )
        for dom, entries in sorted(untracked_referral.items()):
            uniq_files = sorted(set(f for f, _ in entries))
            shown = ", ".join(uniq_files[:3])
            more = f" (+{len(uniq_files) - 3} more)" if len(uniq_files) > 3 else ""
            print(f"         {RED}•{RESET} {dom}  —  {shown}{more}")
    else:
        pass_("Every domain with a referral param is covered by affiliateDomains.")

    if untracked_reference:
        if has_catchall:
            pass_(
                f"{len(untracked_reference)} non-affiliate domain(s) aren't on the "
                f"affiliateDomains allowlist, but a generic outbound_click catch-all "
                f"is in place — every external link click is still tracked regardless "
                f"of allowlist membership."
            )
        else:
            warn(
                f"{len(untracked_reference)} other external domain(s) are linked (no referral param — "
                f"likely citations/sources) and also aren't tracked. Lower priority, but review if any "
                f"are meant to be affiliate links without a referral param yet:"
            )
            for dom, entries in sorted(untracked_reference.items()):
                uniq_files = sorted(set(f for f, _ in entries))
                shown = ", ".join(uniq_files[:2])
                more = f" (+{len(uniq_files) - 2} more)" if len(uniq_files) > 2 else ""
                print(f"         {YELLOW}•{RESET} {dom}  —  {shown}{more}")
    else:
        pass_("No untracked non-affiliate domains found.")

    print(
        f"\n         Scanned {len(all_content_files)} files "
        f"({len(blog_files)} blog posts, {len(tsx_files)} pages), "
        f"found {len(used_domains)} distinct external domains."
    )

    return ok_timing and not untracked_referral


# ── Check 2: related-post / internal linking coverage ──────────────────


def check_related_posts(repo_root):
    section("Related-Post / Internal Linking Coverage")

    blog_files = find_repo_files(repo_root, "blog", [".ts"])
    if not blog_files:
        fail("No blog/*.ts files found — check the repo path.")
        return False

    slugs = {}
    for path in blog_files:
        text = read(path)
        m = SLUG_RE.search(text)
        if m:
            slugs[path] = m.group(1)

    pass_(f"Found {len(slugs)} blog posts with a parsed slug.")

    all_slugs = set(slugs.values())
    zero_link_posts = []
    link_counts = {}

    # Structural cross-links via BLOG_RELATED_POSTS (blog->blog map), separate
    # from ad-hoc links inside article prose — a post can satisfy the
    # "links to another post" requirement either way.
    related_posts_map = {}
    blog_post_page = os.path.join(repo_root, "pages", "BlogPostPage.tsx")
    if os.path.isfile(blog_post_page):
        bpp_text = read(blog_post_page)
        m = re.search(
            r"const\s+BLOG_RELATED_POSTS\s*:\s*Record<string,\s*string\[\]>\s*=\s*\{(.*?)\n\};",
            bpp_text,
            re.DOTALL,
        )
        if m:
            for key, val in re.findall(r"['\"]([a-z0-9-]+)['\"]\s*:\s*\[([^\]]*)\]", m.group(1)):
                targets = re.findall(r"['\"]([a-z0-9-]+)['\"]", val)
                related_posts_map[key] = targets

    for path, slug in slugs.items():
        text = read(path)
        linked = set(INTERNAL_BLOG_LINK_RE.findall(text))
        linked_to_others = linked - {slug}
        # Only count links that point to a real, known slug
        linked_to_others = linked_to_others & all_slugs
        linked_to_others |= set(related_posts_map.get(slug, [])) & all_slugs
        link_counts[slug] = len(linked_to_others)
        if len(linked_to_others) == 0:
            zero_link_posts.append((slug, os.path.relpath(path, repo_root)))

    if zero_link_posts:
        fail(f"{len(zero_link_posts)} of {len(slugs)} blog posts have ZERO internal links to other blog posts:")
        for slug, relpath in sorted(zero_link_posts):
            print(f"         {RED}•{RESET} {slug}  ({relpath})")
    else:
        pass_("Every blog post links to at least one other blog post.")

    # --- dedicated related-posts module check ---
    blog_post_page = os.path.join(repo_root, "pages", "BlogPostPage.tsx")
    has_related_posts_map = False
    if os.path.isfile(blog_post_page):
        text = read(blog_post_page)
        has_related_tools = "BLOG_RELATED_TOOLS" in text
        has_related_posts_map = "BLOG_RELATED_POSTS" in text

        if has_related_tools and not has_related_posts_map:
            warn(
                "BlogPostPage.tsx has a BLOG_RELATED_TOOLS map (blog → tool "
                "pages) but no equivalent BLOG_RELATED_POSTS map (blog → "
                "blog). Recirculation currently relies only on ad-hoc links "
                "inside article prose."
            )
        elif has_related_posts_map:
            pass_("BLOG_RELATED_POSTS map found in BlogPostPage.tsx.")
        else:
            warn("No related-tools or related-posts map found in BlogPostPage.tsx.")
    else:
        warn(f"pages/BlogPostPage.tsx not found at expected path — skipped module check.")

    # --- distribution summary ---
    avg_links = sum(link_counts.values()) / len(link_counts) if link_counts else 0
    print(f"\n         Average internal blog-to-blog links per post: {avg_links:.1f}")

    return len(zero_link_posts) == 0


# ── Main ────────────────────────────────────────────────────────────────


def main():
    repo_root = sys.argv[1] if len(sys.argv) > 1 else "."
    repo_root = os.path.abspath(repo_root)

    print(f"{BOLD}Auditing engagement tracking in: {repo_root}{RESET}")

    click_ok = check_click_tracking(repo_root)
    related_ok = check_related_posts(repo_root)

    section("Summary")
    if click_ok:
        pass_("Click tracking: OK")
    else:
        fail("Click tracking: ISSUES FOUND")

    if related_ok:
        pass_("Related-post linking: OK")
    else:
        fail("Related-post linking: ISSUES FOUND")

    if not (click_ok and related_ok):
        print(f"\n{RED}{BOLD}Result: FAIL — see issues above.{RESET}")
        sys.exit(1)
    else:
        print(f"\n{GREEN}{BOLD}Result: PASS{RESET}")
        sys.exit(0)


if __name__ == "__main__":
    main()
