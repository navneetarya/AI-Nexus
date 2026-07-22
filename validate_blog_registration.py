#!/usr/bin/env python3
"""
validate_blog_registration.py

Post-fix verification tool for the AI Nexus blog content sprint.
Checks that a newly registered blog post is correctly wired into every
required touchpoint, and that all the parallel data stores are in sync
with each other (the recurring desync failure mode on this project).

Usage:
    python3 scripts/validate_blog_registration.py <slug>
    python3 scripts/validate_blog_registration.py chatgpt-atlas-vs-perplexity-comet-vs-dia-2026

    # Or with no slug: validates cross-file sync only (no single-post checks)
    python3 scripts/validate_blog_registration.py
"""

import re
import sys
import shutil
import subprocess
from pathlib import Path

def find_repo_root():
    """Locate the repo root regardless of whether this script lives at
    <repo>/scripts/validate_blog_registration.py or was copied straight into
    <repo>/validate_blog_registration.py. Walks up from this file's location,
    then from the current working directory, looking for a folder that has
    both a blog/ and a .github/ subfolder (this repo's fingerprint)."""
    candidates = [Path(__file__).resolve().parent, Path.cwd()]
    for start in candidates:
        cur = start
        for _ in range(4):
            if (cur / "blog").is_dir() and (cur / ".github").is_dir():
                return cur
            cur = cur.parent
    # Fall back to old assumption so the error message below is still useful
    return Path(__file__).resolve().parent.parent


ROOT = find_repo_root()
FAIL = "\033[91m❌\033[0m"
OK = "\033[92m✅\033[0m"
WARN = "\033[93m⚠️ \033[0m"

failures = []
warnings = []


def check(label, condition, hard=True):
    if condition:
        print(f"{OK} {label}")
    else:
        print(f"{FAIL} {label}")
        (failures if hard else warnings).append(label)


def read(path):
    p = ROOT / path
    if not p.exists():
        return None
    return p.read_text(encoding="utf-8")


def count_matches(text, pattern):
    return len(re.findall(pattern, text, re.M))


# ── Cross-file sync checks (always run, independent of slug) ──────────────

def sync_checks():
    print(f"Repo root detected: {ROOT}")
    if not (ROOT / "blog").is_dir():
        print(f"{FAIL} Could not find a 'blog/' folder under {ROOT}.")
        print("    Run this script from inside the repo (e.g. `python scripts\\validate_blog_registration.py <slug>`")
        print("    from D:\\AI-Nexus\\AI-Nexus), or place it in the repo's scripts\\ folder.")
        sys.exit(1)

    print("\n=== CROSS-FILE SYNC (all 70+ posts) ===")

    blog_dir = ROOT / "blog"
    post_files = sorted(
        f.stem for f in blog_dir.glob("*.ts")
        if f.stem not in ("index", "types", "metadata", "loaders")
    )
    file_count = len(post_files)

    index_ts = read("blog/index.ts") or ""
    index_count = count_matches(index_ts, r"^import post\d+ from")

    loaders_ts = read("blog/loaders.ts") or ""
    loaders_count = count_matches(loaders_ts, r"=> import\(")

    metadata_ts = read("blog/metadata.ts") or ""
    metadata_count = count_matches(metadata_ts, r'"slug":\s*"')

    deploy_yml = read(".github/workflows/deploy.yml") or ""
    slugs_block_match = re.search(r"BLOG_SLUGS=\((.*?)\n\s*\)", deploy_yml, re.S)
    deploy_count = 0
    if slugs_block_match:
        deploy_count = len([
            tok for tok in slugs_block_match.group(1).split()
            if tok and not tok.startswith("#")
        ])

    prerender_mjs = read("scripts/prerender.mjs") or ""
    bp_match = re.search(
        r"^const BLOG_POSTS = \[(.*?)\n^const \w+", prerender_mjs, re.S | re.M
    )
    prerender_blog_count = 0
    if bp_match:
        prerender_blog_count = count_matches(bp_match.group(1), r"^\s{4}slug: '")

    print(f"  blog/*.ts post files:          {file_count}")
    print(f"  blog/index.ts imports:         {index_count}")
    print(f"  blog/loaders.ts entries:       {loaders_count}")
    print(f"  blog/metadata.ts entries:      {metadata_count}")
    print(f"  deploy.yml BLOG_SLUGS entries: {deploy_count}")
    print(f"  prerender.mjs BLOG_POSTS:      {prerender_blog_count}")

    all_counts = [file_count, index_count, loaders_count, metadata_count,
                  deploy_count, prerender_blog_count]
    check(
        f"All counts match ({file_count})",
        len(set(all_counts)) == 1 and file_count > 0,
    )


# ── Single-post checks (only if a slug is given) ───────────────────────────

def post_checks(slug):
    print(f"\n=== POST REGISTRATION: {slug} ===")

    post_path = f"blog/{slug}.ts"
    post = read(post_path)
    check(f"{post_path} exists", post is not None)
    if post is None:
        return

    check("blog/index.ts imports this slug",
          f"from './{slug}'" in (read("blog/index.ts") or ""))
    check("blog/index.ts references it in BLOG_POSTS array",
          re.search(r"^\s*post\d+,", read("blog/index.ts") or "", re.M) is not None
          and slug in (read("blog/index.ts") or "") or
          f"'./{slug}'" in (read("blog/index.ts") or ""))

    check("blog/loaders.ts has dynamic import entry",
          f"'{slug}'" in (read("blog/loaders.ts") or "")
          and f"=> import('./{slug}')" in (read("blog/loaders.ts") or ""))

    check("blog/metadata.ts has a matching entry",
          f'"slug": "{slug}"' in (read("blog/metadata.ts") or ""))

    check(".github/workflows/deploy.yml lists this slug in BLOG_SLUGS",
          slug in (read(".github/workflows/deploy.yml") or ""))

    prerender = read("scripts/prerender.mjs") or ""
    check("scripts/prerender.mjs — BLOG_OG_MAP entry",
          f"'{slug}':" in prerender)
    check("scripts/prerender.mjs — BLOG_POSTS entry",
          f"slug: '{slug}'" in prerender)
    check("scripts/prerender.mjs — BLOG_RELATED_LINKS entry",
          f"'{slug}': [" in prerender, hard=False)

    # ── Content quality gates (Gates 1-3 from the loop prompt) ──
    print(f"\n=== CONTENT GATES: {slug} ===")

    seo_title_m = re.search(r"seoTitle: '(.*?)',", post)
    meta_desc_m = re.search(r"metaDescription: '(.*?)',", post)
    seo_title = seo_title_m.group(1) if seo_title_m else ""
    meta_desc = meta_desc_m.group(1) if meta_desc_m else ""

    check(f"seoTitle length ≤ 60 chars ({len(seo_title)})", 0 < len(seo_title) <= 60)
    check(f"metaDescription length ≤ 160 chars ({len(meta_desc)})",
          0 < len(meta_desc) <= 160)

    content_m = re.search(r"content: `(.*)`,\n\};", post, re.S)
    if content_m:
        content = content_m.group(1)
        text = re.sub(r"<[^>]+>", " ", content)
        text = re.sub(r"\s+", " ", text).strip()
        words = text.split(" ")
        word_count = len(words)
        check(f"Word count in range 1800-3000 ({word_count})",
              1800 <= word_count <= 3000, hard=False)

        paras = re.findall(r"<p[^>]*>(.*?)</p>", content, re.S)
        max_para = 0
        for p in paras:
            t = re.sub(r"<[^>]+>", " ", p)
            t = re.sub(r"\s+", " ", t).strip()
            max_para = max(max_para, len(t.split(" ")))
        check(f"No paragraph exceeds 100 words (longest: {max_para})", max_para <= 100)

        h2_count = count_matches(content, r"<h2")
        h3_count = count_matches(content, r"<h3")
        check(f"At least 2 H3 subheadings ({h3_count})", h3_count >= 2)
        check(f"At least 4 H2 sections ({h2_count})", h2_count >= 4)

    faqs_count = count_matches(post, r"^\s*q: '")
    check(f"At least 5 FAQs ({faqs_count})", faqs_count >= 5)

    check("quickAnswer field present", "quickAnswer:" in post)
    check("myTake field present", "myTake:" in post, hard=False)
    check("proscons.pros has ≥5 entries",
          len(re.findall(r"'", (re.search(r'pros:\s*\[(.*?)\]', post, re.S) or [None,""])[1]
                          if re.search(r'pros:\s*\[(.*?)\]', post, re.S) else "")) >= 10,
          hard=False)


def run_syntax_checks(slug=None):
    print("\n=== SYNTAX VALIDATION ===")
    node_bin = shutil.which("node")
    if node_bin:
        r = subprocess.run(
            [node_bin, "--check", str(ROOT / "scripts/prerender.mjs")],
            capture_output=True, text=True
        )
        check("scripts/prerender.mjs — node --check passes", r.returncode == 0)
        if r.returncode != 0:
            print(r.stderr[:500])
    else:
        print(f"{WARN} node not found on PATH — skipping node --check")

    ts_targets = ["blog/index.ts", "blog/metadata.ts", "blog/loaders.ts"]
    if slug:
        ts_targets.append(f"blog/{slug}.ts")
    ts_targets = [t for t in ts_targets if (ROOT / t).exists()]

    npx_bin = shutil.which("npx")
    if npx_bin:
        base_args = [npx_bin, "tsc", "--noEmit", "--skipLibCheck",
                     "--target", "es2020", "--module", "esnext",
                     "--moduleResolution", "bundler", "--jsx", "react-jsx"] + ts_targets

        r = subprocess.run(base_args, capture_output=True, text=True, cwd=str(ROOT))

        # Some tsc versions (the newer native/Go preview, v6+) refuse to run
        # with explicit file args if a tsconfig.json is present unless you
        # pass --ignoreConfig (TS5112). Older/standard tsc doesn't have that
        # flag at all (TS5023: Unknown compiler option) and doesn't need it.
        # Detect which situation we're in and retry once accordingly.
        if r.returncode != 0 and "TS5112" in r.stdout:
            r = subprocess.run(
                base_args[:2] + ["--ignoreConfig"] + base_args[2:],
                capture_output=True, text=True, cwd=str(ROOT)
            )

        check("TypeScript compiles cleanly (tsc --noEmit)", r.returncode == 0)
        if r.returncode != 0:
            print(r.stdout[:1000])
    else:
        print(f"{WARN} npx not found on PATH — skipping tsc check")


def main():
    slug = sys.argv[1] if len(sys.argv) > 1 else None

    sync_checks()
    if slug:
        post_checks(slug)
    run_syntax_checks(slug)

    print("\n" + "=" * 60)
    if failures:
        print(f"{FAIL} {len(failures)} HARD FAILURE(S):")
        for f in failures:
            print(f"   - {f}")
        if warnings:
            print(f"{WARN} {len(warnings)} warning(s) (non-blocking):")
            for w in warnings:
                print(f"   - {w}")
        sys.exit(1)
    else:
        if warnings:
            print(f"{OK} All hard checks passed. {WARN} {len(warnings)} warning(s):")
            for w in warnings:
                print(f"   - {w}")
        else:
            print(f"{OK} ALL CHECKS PASSED")
        sys.exit(0)


if __name__ == "__main__":
    main()
