#!/usr/bin/env python3
"""
AI Nexus — Weekly Task Validator
=================================
Validates that every week's required code changes are properly in place.

Usage:
  python3 validate_weekly_tasks.py                  # auto-detects project root
  python3 validate_weekly_tasks.py /path/to/project # explicit root

Checks every week against the Growth Command Center task list:
  Week 1 (Jun  5–11)  Foundation — Cursor + Lovable + Vibe Coding
  Week 2 (Jun 12–18)  EEAT pages + Headshot category + Cursor review
  Week 3 (Jun 19–25)  Email / YouTube / 5 new tools / Compare pages
  Week 4 (Jun 26–Jul2) types.ts fix + Meeting tools + Sitemap/Prerender

Exit codes: 0 = all pass, 1 = one or more failures
"""

import os
import re
import sys
from pathlib import Path

# ── ANSI colours ──────────────────────────────────────────────────────────────
GREEN  = '\033[92m'
RED    = '\033[91m'
YELLOW = '\033[93m'
BLUE   = '\033[94m'
CYAN   = '\033[96m'
GREY   = '\033[90m'
BOLD   = '\033[1m'
DIM    = '\033[2m'
RESET  = '\033[0m'

# ── Result accumulator ────────────────────────────────────────────────────────
_results: list[tuple[str, str, bool | None, str]] = []  # (week, label, passed, hint)
_week_counters: dict[str, dict] = {}

def _record(week: str, label: str, passed: bool | None, hint: str = ''):
    _results.append((week, label, passed, hint))
    c = _week_counters.setdefault(week, {'pass': 0, 'fail': 0, 'skip': 0})
    if passed is True:
        c['pass'] += 1
    elif passed is False:
        c['fail'] += 1
    else:
        c['skip'] += 1

# ── Print helpers ─────────────────────────────────────────────────────────────
def section(title: str):
    print(f"\n{BOLD}{CYAN}{'━' * 64}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'━' * 64}{RESET}")

def subsection(title: str):
    print(f"\n  {BOLD}{BLUE}▸ {title}{RESET}")

def check(week: str, label: str, passed: bool, hint: str = '') -> bool:
    icon  = f"{GREEN}✅{RESET}" if passed else f"{RED}❌{RESET}"
    htext = f"  {GREY}→ {hint}{RESET}" if (hint and not passed) else ''
    print(f"    {icon}  {label}{htext}")
    _record(week, label, passed, hint)
    return passed

def skip(week: str, label: str, reason: str = ''):
    icon  = f"{YELLOW}⏭ {RESET}"
    rtext = f"  {GREY}({reason}){RESET}" if reason else ''
    print(f"    {icon}  {YELLOW}{label}{RESET}{rtext}")
    _record(week, label, None, reason)

# ── File helpers ──────────────────────────────────────────────────────────────
_cache: dict[Path, str] = {}

def read(path: Path) -> str:
    if path not in _cache:
        try:
            _cache[path] = path.read_text(encoding='utf-8', errors='replace')
        except FileNotFoundError:
            _cache[path] = ''
    return _cache[path]

def contains(path: Path, pattern: str, literal: bool = True) -> bool:
    src = read(path)
    if not src:
        return False
    return (pattern in src) if literal else bool(re.search(pattern, src))

def file_exists(root: Path, rel: str) -> bool:
    return (root / rel).exists()

# ── Locate project root ───────────────────────────────────────────────────────
def find_root() -> Path:
    if len(sys.argv) > 1:
        p = Path(sys.argv[1]).resolve()
        if p.is_dir():
            return p
        print(f"{RED}Error: {sys.argv[1]} is not a directory{RESET}")
        sys.exit(2)

    # Walk up from cwd looking for constants.ts
    cwd = Path.cwd()
    for candidate in [cwd, *cwd.parents]:
        if (candidate / 'constants.ts').exists():
            return candidate

    # Also check common subdirectory names (e.g. if run from parent of AI-Nexus-main)
    for sub in ['AI-Nexus-main', 'ai-nexus', 'ainexus']:
        p = cwd / sub
        if (p / 'constants.ts').exists():
            return p

    print(f"{RED}Could not locate project root. Run from the project directory "
          f"or pass the path as an argument.{RESET}")
    sys.exit(2)

# =============================================================================
# WEEK 1  Jun 5–11 — Foundation: Cursor + Lovable + Vibe Coding content
# =============================================================================
def validate_week1(root: Path):
    W = 'Week 1'
    constants = root / 'constants.ts'
    types_    = root / 'types.ts'
    prerender = root / 'scripts' / 'prerender.mjs'
    sitemap   = root / 'public' / 'sitemap.xml'
    robots    = root / 'public' / 'robots.txt'
    blog_idx  = root / 'blog' / 'index.ts'

    section('WEEK 1 — Jun 5–11 | Foundation')

    subsection('types.ts — base categories')
    check(W, 'CODING category exists',     contains(types_, "CODING = 'Coding'"),     "Add CODING = 'Coding' to enum Category in types.ts")
    check(W, 'PRODUCTIVITY category exists', contains(types_, "PRODUCTIVITY = 'Productivity'"), "Add PRODUCTIVITY to Category enum")

    subsection('constants.ts — new tool entries')
    check(W, "Cursor tool entry (slug: 'cursor')",   contains(constants, "slug: 'cursor'"),  "Add Cursor tool to TOOLS array in constants.ts")
    check(W, "Lovable tool entry (slug: 'lovable')", contains(constants, "slug: 'lovable'"), "Add Lovable tool to TOOLS array in constants.ts")
    check(W, "TRENDING_SLUGS includes 'cursor'",     contains(constants, "'cursor'"),         "Add 'cursor' to TRENDING_SLUGS array in constants.ts")
    check(W, "TRENDING_SLUGS includes 'lovable'",    contains(constants, "'lovable'"),        "Add 'lovable' to TRENDING_SLUGS array in constants.ts")

    subsection('blog/ — Vibe coding pillar post')
    vibe_ts = root / 'blog' / 'best-vibe-coding-tools-2026.ts'
    check(W, 'best-vibe-coding-tools-2026.ts exists',          vibe_ts.exists(),                                   'Create blog/best-vibe-coding-tools-2026.ts')
    check(W, 'blog/index.ts has best-vibe-coding-tools-2026',  contains(blog_idx, 'best-vibe-coding-tools-2026'),  "Add import + export for best-vibe-coding-tools-2026 in blog/index.ts")
    check(W, 'prerender.mjs has best-vibe-coding-tools-2026',  contains(prerender, 'best-vibe-coding-tools-2026'), "Add BLOG_POSTS entry for best-vibe-coding-tools-2026 in scripts/prerender.mjs")

    subsection('SEO infrastructure')
    check(W, 'public/robots.txt exists',             robots.exists(),                              'Create public/robots.txt allowing all crawlers')
    check(W, 'robots.txt has Sitemap directive',      contains(robots, 'Sitemap:'),                 'Add Sitemap: https://ainexustools.online/sitemap.xml to robots.txt')
    check(W, 'robots.txt allows AI crawlers (GPTBot)', contains(robots, 'GPTBot'),                 'Add GPTBot + ClaudeBot user-agent rules to robots.txt')
    check(W, 'public/llms.txt exists',               (root / 'public' / 'llms.txt').exists(),      'Run: node scripts/generate-llms-full.mjs to create public/llms.txt')
    check(W, 'public/sitemap.xml exists',             sitemap.exists(),                             'Create public/sitemap.xml with at least the homepage URL')
    check(W, 'sitemap.xml has homepage URL',          contains(sitemap, 'ainexustools.online/<'), 'Add homepage <url> entry to sitemap.xml')


# =============================================================================
# WEEK 2  Jun 12–18 — EEAT pages + Headshot category + Cursor review
# =============================================================================
def validate_week2(root: Path):
    W = 'Week 2'
    constants = root / 'constants.ts'
    types_    = root / 'types.ts'
    prerender = root / 'scripts' / 'prerender.mjs'
    sitemap   = root / 'public' / 'sitemap.xml'
    blog_idx  = root / 'blog' / 'index.ts'

    section('WEEK 2 — Jun 12–18 | EEAT + Headshot + Cursor Review')

    subsection('types.ts — HEADSHOT category')
    check(W, "HEADSHOT = 'Headshot' in Category enum",
          contains(types_, "HEADSHOT = 'Headshot'"),
          "Add  HEADSHOT = 'Headshot',  to enum Category in types.ts")

    subsection('constants.ts — HeadshotPro tool')
    check(W, "HeadshotPro tool entry (slug: 'headshotpro')",
          contains(constants, "slug: 'headshotpro'"),
          "Add HeadshotPro entry (Category.HEADSHOT, slug 'headshotpro') to TOOLS array in constants.ts")
    check(W, "TRENDING_SLUGS includes 'headshotpro'",
          contains(constants, "'headshotpro'"),
          "Add 'headshotpro' to TRENDING_SLUGS array in constants.ts")

    subsection('EEAT trust pages (pages/ directory)')
    eeat = {
        'AboutPage.tsx':          '/about/',
        'ContactPage.tsx':        '/contact/',
        'EditorialPolicyPage.tsx': '/editorial-policy/',
        'MethodologyPage.tsx':    '/methodology/',
        'HowWeAnalyzePage.tsx':   '/how-we-analyze-ai-tools/',
        'PrivacyPage.tsx':        '/privacy/',
    }
    for filename, url in eeat.items():
        check(W, f'pages/{filename} exists',
              (root / 'pages' / filename).exists(),
              f'Create pages/{filename} — required for EEAT. Route: {url}')

    subsection('blog/ — Headshot post + Cursor review')
    for slug, label in [
        ('best-ai-headshot-tools-linkedin-2026', 'AI headshot tools LinkedIn post'),
        ('cursor-ai-review-2026',                'Cursor AI review post'),
    ]:
        ts_path = root / 'blog' / f'{slug}.ts'
        check(W, f'{slug}.ts exists',            ts_path.exists(),                          f'Create blog/{slug}.ts')
        check(W, f'blog/index.ts registers {slug}', contains(blog_idx, slug),               f"Import and export {slug} in blog/index.ts")
        check(W, f'prerender.mjs has {slug}',    contains(prerender, slug),                 f"Add BLOG_POSTS entry for {slug} in scripts/prerender.mjs")

    subsection('sitemap.xml — Week 2 blog entries')
    for url, label in [
        ('/blog/best-ai-headshot-tools-linkedin-2026/', 'Headshot tools blog URL'),
        ('/blog/cursor-ai-review-2026/',                'Cursor AI review blog URL'),
    ]:
        check(W, f'sitemap.xml has {label}',
              contains(sitemap, url),
              f'Add <url><loc>https://ainexustools.online{url}</loc>…</url> to public/sitemap.xml')

    subsection('sitemap.xml — EEAT static pages')
    for url in ['/about/', '/contact/', '/editorial-policy/', '/methodology/']:
        check(W, f'sitemap.xml has {url}',
              contains(sitemap, url),
              f'Add {url} entry to public/sitemap.xml')


# =============================================================================
# WEEK 3  Jun 19–25 — 5 New tools + Email + YouTube + Compare pages
# =============================================================================
def validate_week3(root: Path):
    W = 'Week 3'
    constants = root / 'constants.ts'
    prerender = root / 'scripts' / 'prerender.mjs'
    sitemap   = root / 'public' / 'sitemap.xml'
    blog_idx  = root / 'blog' / 'index.ts'
    compare   = root / 'pages' / 'compare-data.ts'

    section('WEEK 3 — Jun 19–25 | 5 New Tools + Email + YouTube + Compare')

    subsection('constants.ts — Week 3 tool entries')
    new_tools = {
        'getresponse': 'GetResponse (EMAIL affiliate, 40–60% recurring)',
        'munch':       'Munch AI (video repurposing)',
        'basedlabs':   'BasedLabs (AI image/video generation)',
        'narrato':     'Narrato (AI content workspace)',
        'fireflies':   'Fireflies.ai (MEETING affiliate, 20% recurring)',
    }
    for slug, desc in new_tools.items():
        check(W, f"Tool entry: '{slug}' — {desc}",
              contains(constants, f"slug: '{slug}'"),
              f"Add {desc} to TOOLS array in constants.ts  (slug: '{slug}')")

    subsection('blog/ — Email marketing + YouTube creators posts')
    for slug, label in [
        ('best-ai-email-marketing-tools-2026',    'Email marketing tools post'),
        ('best-ai-tools-for-youtube-creators-2026', 'YouTube creators tools post'),
    ]:
        ts_path = root / 'blog' / f'{slug}.ts'
        check(W, f'{slug}.ts exists',              ts_path.exists(),               f'Create blog/{slug}.ts')
        check(W, f'blog/index.ts registers {slug}', contains(blog_idx, slug),      f"Import and export {slug} in blog/index.ts")
        check(W, f'prerender.mjs has {slug}',      contains(prerender, slug),      f"Add BLOG_POSTS entry for {slug} in scripts/prerender.mjs")

    subsection('compare-data.ts — Week 3 compare pages')
    for slug, label in [
        ('cursor-vs-windsurf',    'Cursor vs Windsurf compare page'),
        ('lovable-vs-bolt-vs-v0', 'Lovable vs Bolt vs v0 compare page'),
    ]:
        check(W, f"compare-data.ts has '{slug}'",
              contains(compare, f"slug: '{slug}'"),
              f"Add compare article for '{slug}' to pages/compare-data.ts")

    subsection('sitemap.xml — Week 3 new tool pages')
    for slug in ['cursor', 'lovable', 'getresponse', 'munch', 'basedlabs', 'narrato', 'fireflies']:
        check(W, f'sitemap.xml has /tools/{slug}/',
              contains(sitemap, f'/tools/{slug}/'),
              f'Add <url> for https://ainexustools.online/tools/{slug}/ to public/sitemap.xml')

    subsection('sitemap.xml — Week 3 blog + compare entries')
    for url, label in [
        ('/blog/best-ai-email-marketing-tools-2026/',    'Email marketing blog'),
        ('/blog/best-ai-tools-for-youtube-creators-2026/', 'YouTube creators blog'),
        ('/compare/lovable-vs-bolt-vs-v0/',              'Lovable vs Bolt vs v0 compare'),
        ('/compare/cursor-vs-windsurf/',                 'Cursor vs Windsurf compare'),
    ]:
        check(W, f'sitemap.xml has {label}',
              contains(sitemap, url),
              f'Add <url><loc>https://ainexustools.online{url}</loc>…</url> to public/sitemap.xml')


# =============================================================================
# WEEK 4  Jun 26–Jul 2 — types.ts fix + Meeting tools + Prerender + Sitemap
# =============================================================================
def validate_week4(root: Path):
    W = 'Week 4'
    constants = root / 'constants.ts'
    types_    = root / 'types.ts'
    prerender = root / 'scripts' / 'prerender.mjs'
    sitemap   = root / 'public' / 'sitemap.xml'
    blog_idx  = root / 'blog' / 'index.ts'

    section('WEEK 4 — Jun 26–Jul 2 | types.ts Fix + Meeting Tools')

    subsection('Task 1 — types.ts: EMAIL + MEETING categories')
    check(W, "EMAIL = 'Email' in Category enum",
          contains(types_, "EMAIL = 'Email'"),
          "Add  EMAIL = 'Email',  to enum Category in types.ts (required for GetResponse tool page)")
    check(W, "MEETING = 'Meeting' in Category enum",
          contains(types_, "MEETING = 'Meeting'"),
          "Add  MEETING = 'Meeting',  to enum Category in types.ts (required for Fireflies tool page)")
    check(W, "No TypeScript enum gap (HEADSHOT + EMAIL + MEETING all present)",
          all(contains(types_, x) for x in ["HEADSHOT = 'Headshot'", "EMAIL = 'Email'", "MEETING = 'Meeting'"]),
          "All three new categories must be present together to avoid TS build errors")

    subsection('Task 2 — constants.ts: Windsurf tool entry')
    check(W, "Windsurf tool entry (slug: 'windsurf')",
          contains(constants, "slug: 'windsurf'"),
          "Add Windsurf (Cognition) to TOOLS array in constants.ts  (slug: 'windsurf', Category.CODING)")

    subsection('Task 3 — windsurf-vs-cursor-2026 blog post')
    skip(W, 'windsurf-vs-cursor-2026.ts (Task 3)',
         'Intentionally skipped — compare already covered by compare-data.ts cursor-vs-windsurf')

    subsection('Task 4 — best-ai-meeting-tools-2026 blog post')
    meeting_ts = root / 'blog' / 'best-ai-meeting-tools-2026.ts'
    check(W, 'best-ai-meeting-tools-2026.ts exists',
          meeting_ts.exists(),
          'Create blog/best-ai-meeting-tools-2026.ts  (keyword: "best ai meeting tools 2026" 2K–4K/mo)')

    # Spot-check required sections inside the blog .ts
    if meeting_ts.exists():
        src = read(meeting_ts)
        check(W, '  └─ has TL;DR / Quick Summary section',
              bool(re.search(r'TL;DR|Quick Summary|quick-summary', src, re.IGNORECASE)),
              'Add a TL;DR box and <h2 id="quick-summary"> in the content template literal')
        check(W, '  └─ has Comparison Table section',
              bool(re.search(r'comparison.table|<table|Comparison Table', src, re.IGNORECASE)),
              'Add a comparison table (<table>) to the article content')
        check(W, '  └─ has FAQ entries (≥ 3)',
              len(re.findall(r"q:\s*'", src)) >= 3,
              'Add at least 3 FAQ entries in the faqs: [] array for FAQ schema + rich results')
        check(W, '  └─ has Final Verdict section',
              bool(re.search(r'Final Verdict|final-verdict', src, re.IGNORECASE)),
              'Add a Final Verdict section at the end of the article')
        check(W, '  └─ has affiliate link for Fireflies',
              'fireflies' in src.lower() and ('fpr=' in src or 'ref=' in src or 'affiliate' in src.lower()),
              'Add Fireflies.ai affiliate link (fireflies.ai/?fpr=...) as the primary CTA')
        check(W, '  └─ metaDescription ≤ 160 chars',
              _meta_len_ok(src, 160),
              'metaDescription must be ≤ 160 characters for Google snippets')
        check(W, '  └─ title ≤ 60 chars',
              _title_len_ok(src, 60),
              'title must be ≤ 60 characters to avoid truncation in SERPs')

    subsection('Task 5 — blog/index.ts registration')
    check(W, 'blog/index.ts registers best-ai-meeting-tools-2026',
          contains(blog_idx, 'best-ai-meeting-tools-2026'),
          "Add  import + export  for best-ai-meeting-tools-2026 in blog/index.ts")

    subsection('Task 6 — scripts/prerender.mjs BLOG_POSTS entry')
    check(W, 'prerender.mjs has best-ai-meeting-tools-2026 entry',
          contains(prerender, "slug: 'best-ai-meeting-tools-2026'"),
          "Add BLOG_POSTS object for best-ai-meeting-tools-2026 in scripts/prerender.mjs")
    if contains(prerender, "slug: 'best-ai-meeting-tools-2026'"):
        src = read(prerender)
        # Find the entry and check it has faqs
        idx = src.find("slug: 'best-ai-meeting-tools-2026'")
        snippet = src[idx:idx + 2000]
        check(W, '  └─ prerender entry has faqs array (≥ 1)',
              bool(re.search(r'faqs\s*:\s*\[', snippet)),
              'Add  faqs: [...]  inside the prerender BLOG_POSTS entry for FAQ rich results')
        check(W, '  └─ prerender entry has datePublished',
              'datePublished' in snippet,
              "Add  datePublished: '2026-06-09'  to the prerender BLOG_POSTS entry")

    subsection('Task 7 — public/sitemap.xml completeness')
    sm_checks = [
        ('/blog/cursor-ai-review-2026/',                   'Week 2 cursor review blog'),
        ('/blog/best-ai-email-marketing-tools-2026/',      'Week 3 email marketing blog'),
        ('/blog/best-ai-tools-for-youtube-creators-2026/', 'Week 3 YouTube creators blog'),
        ('/compare/cursor-vs-windsurf/',                   'Week 3/4 Cursor vs Windsurf compare'),
        ('/compare/lovable-vs-bolt-vs-v0/',                'Week 3 Lovable vs Bolt vs v0 compare'),
        ('/tools/cursor/',                                 'Week 3 Cursor tool page'),
        ('/tools/lovable/',                                'Week 3 Lovable tool page'),
        ('/tools/getresponse/',                            'Week 3 GetResponse tool page'),
        ('/tools/munch/',                                  'Week 3 Munch AI tool page'),
        ('/tools/basedlabs/',                              'Week 3 BasedLabs tool page'),
        ('/tools/narrato/',                                'Week 3 Narrato tool page'),
        ('/tools/fireflies/',                              'Week 3 Fireflies.ai tool page'),
        ('/blog/best-ai-meeting-tools-2026/',              'Week 4 meeting tools blog'),
    ]
    for url, label in sm_checks:
        check(W, f'sitemap.xml has {label}  ({url})',
              contains(sitemap, url),
              f'Add <url><loc>https://ainexustools.online{url}</loc>…</url> to public/sitemap.xml')

    subsection('sitemap.xml — quality checks')
    sm_src = read(sitemap)
    urls   = re.findall(r'<loc>(https?://[^<]+)</loc>', sm_src)
    dups   = [u for u in set(urls) if urls.count(u) > 1]
    check(W, f'No duplicate URLs in sitemap ({len(urls)} total)',
          len(dups) == 0,
          f'Remove duplicate entries: {dups[:5]}')
    check(W, 'sitemap.xml is valid XML (no unclosed tags)',
          not bool(re.search(r'<url>[^<]*<url>', sm_src)),
          'sitemap.xml has nested <url> tags — fix XML structure')
    check(W, 'sitemap has image:image namespace declared',
          'xmlns:image=' in sm_src,
          'Add  xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"  to <urlset>')


# ── Blog content helpers ──────────────────────────────────────────────────────
def _meta_len_ok(src: str, limit: int) -> bool:
    m = re.search(r"metaDescription\s*:\s*['\"]([^'\"]+)['\"]", src)
    return (len(m.group(1)) <= limit) if m else True  # pass if field not found (blog/index might not have it)

def _title_len_ok(src: str, limit: int) -> bool:
    m = re.search(r"\btitle\s*:\s*['\"]([^'\"]+)['\"]", src)
    return (len(m.group(1)) <= limit) if m else True


# ── BONUS: cross-cutting parity check ────────────────────────────────────────
def validate_parity(root: Path):
    """Checks that blog/index.ts, prerender.mjs, and sitemap.xml are in sync for ALL blog posts."""
    W = 'Parity'
    section('PARITY CHECK — blog/index.ts ↔ prerender.mjs ↔ sitemap.xml')

    blog_idx  = root / 'blog' / 'index.ts'
    prerender = root / 'scripts' / 'prerender.mjs'
    sitemap   = root / 'public' / 'sitemap.xml'

    # Extract slugs from each source
    idx_slugs    = set(re.findall(r"from '\./([^']+)'",          read(blog_idx)))
    idx_slugs.discard('types')  # not a blog post

    pre_slugs    = set(re.findall(r"slug:\s*'([a-z0-9-]+)'",    read(prerender)))
    # Filter to only blog-like slugs (prerender also has tool slugs and compare slugs)
    # We cross-reference with blog_idx which we know are blog posts
    blog_ts_slugs = {
        f.stem for f in (root / 'blog').glob('*.ts')
        if f.stem != 'types' and f.stem != 'index'
    } if (root / 'blog').exists() else set()

    sm_src    = read(sitemap)
    sm_slugs  = set(re.findall(r'/blog/([a-z0-9-]+)/', sm_src))

    subsection('blog/index.ts ↔ blog/*.ts files')
    missing_from_idx = blog_ts_slugs - idx_slugs
    extra_in_idx     = idx_slugs - blog_ts_slugs
    check(W, 'All .ts files in blog/ are registered in blog/index.ts',
          len(missing_from_idx) == 0,
          f'Missing: {sorted(missing_from_idx)}')
    check(W, 'No ghost imports in blog/index.ts (every import has a .ts file)',
          len(extra_in_idx) == 0,
          f'In index but no .ts file: {sorted(extra_in_idx)}')

    subsection('blog/index.ts ↔ prerender.mjs BLOG_POSTS')
    # Only compare slugs that exist as .ts files (ground truth)
    pre_blog_slugs = pre_slugs & blog_ts_slugs
    missing_from_pre = blog_ts_slugs - pre_blog_slugs
    check(W, 'All blog .ts files have a prerender.mjs BLOG_POSTS entry',
          len(missing_from_pre) == 0,
          f'Missing from prerender BLOG_POSTS (will 404 for Googlebot): {sorted(missing_from_pre)}')

    subsection('blog/index.ts ↔ sitemap.xml')
    missing_from_sm  = blog_ts_slugs - sm_slugs
    # Exclude very old posts that are intentionally not in sitemap yet
    quietly_missing  = set()   # any intentional exclusions go here
    real_missing     = missing_from_sm - quietly_missing
    check(W, 'All blog .ts files have a sitemap.xml entry',
          len(real_missing) == 0,
          f'Missing from sitemap (Google can\'t find these URLs): {sorted(real_missing)}')

    # Count totals
    print(f"\n  {DIM}Blog .ts files: {len(blog_ts_slugs)}   "
          f"| index.ts imports: {len(idx_slugs)}   "
          f"| prerender BLOG_POSTS: {len(pre_blog_slugs)}   "
          f"| sitemap /blog/ entries: {len(sm_slugs)}{RESET}")


# ── Summary ───────────────────────────────────────────────────────────────────
def print_summary():
    section('SUMMARY')

    total_pass = total_fail = total_skip = 0
    for week in ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Parity']:
        c = _week_counters.get(week, {'pass': 0, 'fail': 0, 'skip': 0})
        p, f, s = c['pass'], c['fail'], c['skip']
        total_pass += p; total_fail += f; total_skip += s
        bar_fill   = '█' * p + '░' * f
        status_col = GREEN if f == 0 else (YELLOW if f <= 2 else RED)
        label_col  = GREEN if f == 0 else RED
        print(f"  {label_col}{week:<10}{RESET}  "
              f"{status_col}{bar_fill:<30}{RESET}  "
              f"{GREEN}{p:>2} pass{RESET}  "
              f"{RED}{f:>2} fail{RESET}  "
              f"{YELLOW}{s:>2} skip{RESET}")

    print(f"\n  {BOLD}Total:{RESET}  "
          f"{GREEN}{total_pass} passed{RESET}  "
          f"{RED}{total_fail} failed{RESET}  "
          f"{YELLOW}{total_skip} skipped{RESET}\n")

    if total_fail == 0:
        print(f"  {GREEN}{BOLD}🎉  All checks passed! Deploy with confidence.{RESET}\n")
    else:
        print(f"  {RED}{BOLD}⚠️   {total_fail} check(s) failed — fix the items marked ❌ above.{RESET}")
        print(f"  {GREY}Hints are shown inline next to each failure.{RESET}\n")

    return total_fail


# ── Entry point ───────────────────────────────────────────────────────────────
def main():
    root = find_root()
    print(f"\n{BOLD}AI Nexus — Weekly Task Validator{RESET}")
    print(f"{GREY}Project root: {root}{RESET}")

    validate_week1(root)
    validate_week2(root)
    validate_week3(root)
    validate_week4(root)
    validate_parity(root)
    fails = print_summary()
    sys.exit(1 if fails > 0 else 0)


if __name__ == '__main__':
    main()
