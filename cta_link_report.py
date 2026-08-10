#!/usr/bin/env python3
"""
cta_link_report.py

Builds a full tool -> CTA link mapping/report across the whole site:

  1. TOOL PAGES (/tools/<slug>/)
     Rendered from a single template (pages/ToolPage.tsx) that always pulls
     tool.affiliateLink live from constants.ts. These can't drift, so the
     report just lists them as the canonical source of truth.

  2. BLOG POSTS (blog/*.ts)
     Hand-written HTML per file. Every <a href="..."> is inspected and
     classified into one of three shapes:
       - BUTTON   : styled as the canonical CTA button (display:inline-block)
       - PLAIN    : a normal inline text link, not styled as a button
     For each, this script reports:
       - which tool it points to (exact canonical match, or "drift" if it's
         the right domain but a different/missing tracking param)
       - hardcoded plain links that match a known tool's affiliate domain
         (candidates to convert into a proper CTA button)
       - hardcoded plain links that carry an affiliate/tracking marker
         (?via=, ?pc=, ?fpr=, ?ref=, partner subdomains like sjv.io, .refr.cc,
         get.<tool>.ai, etc.) but don't match ANY known tool at all —
         these are easy to miss because they're neither styled as buttons
         nor registered anywhere as a canonical link
       - plain reference/citation links (docs, competitor sites, sources)
         are counted but not spammed into the report individually, since
         they're not CTA candidates
       - tool names mentioned in a post with NO link (button or plain) at
         all anywhere in that post (missed monetization opportunities)

This script is READ-ONLY. It does not modify any files.

Usage:
    python3 cta_link_report.py                # full report, all tools
    python3 cta_link_report.py --slug rytr     # filter to one tool
    python3 cta_link_report.py --csv out.csv   # also write a CSV
    python3 cta_link_report.py --root /path/to/AI-Nexus-main
"""

import argparse
import csv
import re
import sys
from pathlib import Path
from urllib.parse import urlparse


# --------------------------------------------------------------------------
# Parsing helpers
# --------------------------------------------------------------------------

def parse_tools_from_constants(constants_path: Path):
    """Extract {slug: {name, affiliateLink}} from constants.ts.

    Regex-based (not a real TS parser) but constants.ts follows a very
    consistent `slug: '...'` / `name: '...'` / `affiliateLink: '...'`
    pattern per tool block, so this is reliable in practice.
    """
    txt = constants_path.read_text(encoding="utf-8")
    tools = {}

    for block in re.split(r"\n\s*\{\s*\n\s*id:\s*'[^']*',\s*slug:", txt)[1:]:
        slug_m = re.match(r"\s*'([^']+)'", block)
        name_m = re.search(r"name:\s*'([^']+)'", block)
        link_m = re.search(r"affiliateLink:\s*'([^']+)'", block)
        if slug_m and link_m:
            slug = slug_m.group(1)
            tools[slug] = {
                "name": name_m.group(1) if name_m else slug,
                "affiliateLink": link_m.group(1),
                "source": "constants.ts (tool page)",
            }
    return tools


def parse_supplementary_links(affiliate_links_path: Path):
    """Extract SUPPLEMENTARY_LINKS = { slug: 'url', ... } from affiliate-links.ts."""
    txt = affiliate_links_path.read_text(encoding="utf-8")
    m = re.search(r"SUPPLEMENTARY_LINKS[^{]*\{(.*?)\n\};", txt, re.S)
    supplementary = {}
    if not m:
        return supplementary
    body = m.group(1)
    for line in body.splitlines():
        line_m = re.match(r"\s*([\w-]+):\s*'([^']+)'", line)
        if line_m:
            supplementary[line_m.group(1)] = line_m.group(2)
    return supplementary


# Matches every <a ...>...</a> tag, capturing the attrs blob and inner label
LINK_TAG_RE = re.compile(r'<a\s+([^>]*)>(.*?)</a>', re.S)
HREF_ATTR_RE = re.compile(r'href="(https?://[^"]+)"')

# Substrings that indicate an affiliate/referral tracking link even when the
# href doesn't match anything in constants.ts / affiliate-links.ts
AFFILIATE_MARKERS = [
    "?via=", "?pc=", "?fpr=", "?ref=", "/?ref=", "&ref=",
    "sjv.io", ".refr.cc", "partnerstack", "firstpromoter",
    "get.murf.ai", "try.elevenlabs.io",
]

NON_POST_FILES = {"index.ts", "metadata.ts", "loaders.ts", "types.ts"}


def normalize(url: str) -> str:
    """Strip query/fragment/trailing slash so links with different tracking
    params but the same destination still match (e.g. ?via=ainexus vs no
    param at all -> same host+path)."""
    p = urlparse(url)
    path = p.path.rstrip("/")
    return f"{p.netloc.lower()}{path}"


def host_of(url: str) -> str:
    return urlparse(url).netloc.lower().replace("www.", "")


def is_button_style(attrs: str) -> bool:
    return bool(re.search(r"display:\s*inline-block", attrs))


def looks_like_affiliate(href: str) -> bool:
    return any(marker in href for marker in AFFILIATE_MARKERS)


def get_post_files(blog_dir: Path, slug_filter=None):
    files = sorted(p for p in blog_dir.glob("*.ts") if p.name not in NON_POST_FILES)
    if slug_filter:
        files = [p for p in files if p.stem == slug_filter or slug_filter in p.stem]
    return files


# --------------------------------------------------------------------------
# Report building
# --------------------------------------------------------------------------

def build_report(root: Path, slug_filter=None):
    constants_path = root / "constants.ts"
    affiliate_links_path = root / "lib" / "affiliate-links.ts"
    blog_dir = root / "blog"

    tools = parse_tools_from_constants(constants_path)
    supplementary = parse_supplementary_links(affiliate_links_path)
    for slug, url in supplementary.items():
        tools.setdefault(slug, {"name": slug, "affiliateLink": url,
                                 "source": "affiliate-links.ts (SUPPLEMENTARY_LINKS, no tool page)"})

    # reverse lookup: normalized url -> slug, plus host -> slug list
    url_to_slug = {}
    host_to_slugs = {}
    for slug, info in tools.items():
        url_to_slug[normalize(info["affiliateLink"])] = slug
        host_to_slugs.setdefault(host_of(info["affiliateLink"]), []).append(slug)

    def resolve_slug(href: str):
        norm = normalize(href)
        if norm in url_to_slug:
            return url_to_slug[norm], True  # exact canonical match
        candidates = host_to_slugs.get(host_of(href))
        if candidates and len(candidates) == 1:
            return candidates[0], False  # same host, different path/params -> drift
        return None, False

    per_tool = {
        slug: {
            "button_posts": [],       # (post, count) — canonical-style CTA buttons
            "plain_posts": [],        # (post, count) — hardcoded plain links to this tool
            "drift_hrefs": set(),     # any href (button or plain) that's off-canonical
            "mention_no_link_posts": [],  # tool named, but no link (button OR plain) at all
        }
        for slug in tools
    }

    orphan_buttons = {}          # href -> [posts]   (styled as button, matches no tool)
    untracked_affiliate_plain = {}  # href -> [posts]   (plain link, has tracking marker, matches no tool)
    reference_link_count = 0     # plain links that are neither tool matches nor affiliate-looking

    post_files = get_post_files(blog_dir, slug_filter)

    for path in post_files:
        txt = path.read_text(encoding="utf-8")
        post_name = path.name

        buttons_in_post = {}   # slug -> [hrefs]
        plain_in_post = {}     # slug -> [hrefs]
        any_link_slugs = set()  # slugs that got ANY link (button or plain) in this post

        for attrs, _label in LINK_TAG_RE.findall(txt):
            href_m = HREF_ATTR_RE.search(attrs)
            if not href_m:
                continue
            href = href_m.group(1)
            button = is_button_style(attrs)
            slug, exact = resolve_slug(href)

            if button:
                if slug:
                    buttons_in_post.setdefault(slug, []).append(href)
                    any_link_slugs.add(slug)
                    if not exact:
                        per_tool[slug]["drift_hrefs"].add(href)
                else:
                    orphan_buttons.setdefault(href, []).append(post_name)
            else:
                if slug:
                    plain_in_post.setdefault(slug, []).append(href)
                    any_link_slugs.add(slug)
                    if not exact:
                        per_tool[slug]["drift_hrefs"].add(href)
                elif looks_like_affiliate(href):
                    untracked_affiliate_plain.setdefault(href, []).append(post_name)
                else:
                    reference_link_count += 1

        for slug, hrefs in buttons_in_post.items():
            per_tool[slug]["button_posts"].append((post_name, len(hrefs)))
        for slug, hrefs in plain_in_post.items():
            per_tool[slug]["plain_posts"].append((post_name, len(hrefs)))

        for slug, info in tools.items():
            if slug in any_link_slugs:
                continue
            if re.search(r"\b" + re.escape(info["name"]) + r"\b", txt, re.I):
                per_tool[slug]["mention_no_link_posts"].append(post_name)

    return {
        "tools": tools,
        "per_tool": per_tool,
        "orphan_buttons": orphan_buttons,
        "untracked_affiliate_plain": untracked_affiliate_plain,
        "reference_link_count": reference_link_count,
        "n_posts": len(post_files),
    }


# --------------------------------------------------------------------------
# Output
# --------------------------------------------------------------------------

def print_report(data, slug_filter=None):
    tools, per_tool = data["tools"], data["per_tool"]
    print(f"\n{'='*78}\nCTA LINK REPORT — {len(tools)} tool(s), {data['n_posts']} blog post(s) scanned\n{'='*78}\n")

    for slug in sorted(tools):
        if slug_filter and slug != slug_filter and slug_filter not in slug:
            continue
        info = tools[slug]
        agg = per_tool[slug]
        total_buttons = sum(c for _, c in agg["button_posts"])
        total_plain = sum(c for _, c in agg["plain_posts"])
        print(f"- {info['name']}  ({slug})")
        print(f"    canonical link : {info['affiliateLink']}")
        print(f"    source         : {info['source']}")
        print(f"    CTA buttons    : {total_buttons} across {len(agg['button_posts'])} post(s)")
        for post_name, count in sorted(agg["button_posts"]):
            tag = f" x{count}" if count > 1 else ""
            print(f"        - {post_name}{tag}")
        if agg["plain_posts"]:
            print(f"    ⚠ plain links  : {total_plain} hardcoded (non-button) link(s) to this tool "
                  f"across {len(agg['plain_posts'])} post(s) — candidates to convert to a CTA button:")
            for post_name, count in sorted(agg["plain_posts"]):
                tag = f" x{count}" if count > 1 else ""
                print(f"        - {post_name}{tag}")
        if agg["drift_hrefs"]:
            print(f"    ⚠ drift        : {len(agg['drift_hrefs'])} href(s) (button or plain) point to this "
                  f"tool's domain but don't match the canonical link exactly:")
            for href in sorted(agg["drift_hrefs"]):
                print(f"        - {href}")
        if agg["mention_no_link_posts"]:
            print(f"    mentioned, NO link at all in {len(agg['mention_no_link_posts'])} post(s):")
            for post_name in sorted(agg["mention_no_link_posts"]):
                print(f"        - {post_name}")
        print()

    if data["orphan_buttons"]:
        print(f"{'-'*78}\nUNMAPPED CTA BUTTONS — button-styled links matching no known tool:\n{'-'*78}")
        for href, posts in sorted(data["orphan_buttons"].items()):
            print(f"  {href}")
            for p in posts:
                print(f"      - {p}")
        print()

    if data["untracked_affiliate_plain"]:
        print(f"{'-'*78}\nHARDCODED PLAIN LINKS THAT LOOK LIKE AFFILIATE LINKS\n"
              f"(carry a tracking param but aren't registered in constants.ts / affiliate-links.ts\n"
              f" and aren't styled as a CTA button — easy to lose track of):\n{'-'*78}")
        for href, posts in sorted(data["untracked_affiliate_plain"].items()):
            print(f"  {href}")
            for p in posts:
                print(f"      - {p}")
        print()

    if data["reference_link_count"] and not slug_filter:
        print(f"({data['reference_link_count']} other plain link(s) look like plain reference/citation "
              f"links — no tracking marker, no match to a known tool. Not shown individually.)\n")

    zero_cta = [s for s in tools
                if not per_tool[s]["button_posts"] and not per_tool[s]["plain_posts"]]
    if zero_cta and not slug_filter:
        print(f"{'-'*78}\nTOOLS WITH ZERO LINKS IN BLOG CONTENT ({len(zero_cta)}) "
              f"— only reachable via /tools/<slug>/:\n{'-'*78}")
        for s in sorted(zero_cta):
            print(f"  - {tools[s]['name']} ({s})")
        print()

    print(f"{'='*78}\n")


def write_csv(path: Path, data):
    tools, per_tool = data["tools"], data["per_tool"]
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow([
            "slug", "name", "canonical_link", "source",
            "button_cta_count", "posts_with_button",
            "plain_link_count", "posts_with_plain_link",
            "drift_hrefs", "mentioned_no_link_posts",
        ])
        for slug in sorted(tools):
            info = tools[slug]
            agg = per_tool[slug]
            w.writerow([
                slug,
                info["name"],
                info["affiliateLink"],
                info["source"],
                sum(c for _, c in agg["button_posts"]),
                "; ".join(p for p, _ in sorted(agg["button_posts"])),
                sum(c for _, c in agg["plain_posts"]),
                "; ".join(p for p, _ in sorted(agg["plain_posts"])),
                "; ".join(sorted(agg["drift_hrefs"])),
                "; ".join(sorted(agg["mention_no_link_posts"])),
            ])


def main():
    ap = argparse.ArgumentParser(description="Report tool -> CTA link usage across blog + tool pages "
                                              "(both styled CTA buttons and hardcoded plain links).")
    ap.add_argument("--root", default=".", help="Path to the AI-Nexus-main repo root")
    ap.add_argument("--slug", default=None, help="Filter to a single tool slug")
    ap.add_argument("--csv", default=None, help="Also write results to this CSV path")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    if not (root / "constants.ts").exists():
        print(f"Could not find constants.ts under {root} — pass --root pointing at AI-Nexus-main/")
        sys.exit(1)

    data = build_report(root, args.slug)
    print_report(data, args.slug)

    if args.csv:
        write_csv(Path(args.csv), data)
        print(f"CSV written to {args.csv}")


if __name__ == "__main__":
    main()
