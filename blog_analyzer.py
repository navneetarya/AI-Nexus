#!/usr/bin/env python3
"""
blog_analyzer.py  —  AI Nexus site-wide blog analyzer
======================================================

Complements validate_blog_quality.py (per-post 0-100 writing score). This tool looks
at the WHOLE site as a system and at each post through five lenses, then turns the
findings into a ranked, fix-ready action plan:

  revenue  Affiliate revenue   missing/untracked CTAs, placement, rel attrs, disclosure, intent-vs-monetisation
  organic  Google organic      titles/meta, headings, cannibalisation, link graph, freshness, images
  ai       AI-search citations quick answer, FAQ answer-capsules, entity clarity, llms.txt/robots/rss coverage
  reader   Reader value        answer-first, depth vs intent, readability, scan-ability, decision help, AI-slop
  trust    Trust / E-E-A-T     unverifiable "tested" claims, sourcing, price dating, balance, live link health

Modes
  offline (default)   pure static analysis of blog/*.ts, constants.ts, lib/affiliate-links.ts, public/*
  --live              adds live web checks: outbound links, affiliate-link health, vendor pricing drift

Outputs
  terminal summary (always) | --html FILE | --json FILE | --csv FILE
  --checklist FILE    markdown per-post fix checklist with exact text/snippets to change
  --ci                exit 1 when the gate fails (see --min-score / --max-critical / --baseline)

Usage
  python3 blog_analyzer.py
  python3 blog_analyzer.py best-ai-presentation-tools-2026 gamma-ai-review-2026   # focus posts
  python3 blog_analyzer.py --live --html report.html --json report.json --checklist fixes.md
  python3 blog_analyzer.py --ci --min-score 65 --baseline analyzer-baseline.json
  python3 blog_analyzer.py --write-baseline analyzer-baseline.json

v2.0 additions (all optional data flags degrade gracefully when omitted)
  Policy       scans EVERY text field (title, seoTitle, meta, excerpt, quickAnswer, myTake, FAQ answers, image alts,
               JSON-LD with --dist, tool/compare page titles) for first-hand "Tested / hands-on" claims
  Uniqueness   cross-post boilerplate sentences + near-duplicate post pairs, per-post unique-content %
  Evidence     concrete-figure density, sourced-number ratio, outside-source diversity, first-screen decision elements
  Strength     relative 0-100 Strength Index per post (no ceiling) with the limiting dimension named
  Freshness    git-verified: flags dateModified bumps with no real content change, and bulk date bumps
  Revenue      --gsc / --traffic / --affclicks drive a "money plan" ranked by opportunity; CTR and striking-distance fixes
  Rendered     --dist dist   verifies prerendered HTML: title/meta/H1/canonical/body words/JSON-LD/rel=sponsored
  Benchmarks   --benchmarks FILE   compares each post to competitor pages (live URL or saved .html)
  Trend        --history FILE   run-over-run deltas

  python3 blog_analyzer.py --gsc data/gsc-pages.csv --traffic data/ga4-pages.csv --affclicks data/ga4-aff-clicks.csv \\
          --history .analyzer-history.json --html report.html --checklist fixes.md
  python3 blog_analyzer.py --dist dist --strict-policy --ci --baseline analyzer-baseline.json
  python3 blog_analyzer.py --benchmarks benchmarks.txt     # lines:  <your-slug> <https://competitor/url | saved.html>

Pure standard library (Python 3.9+). Never modifies your files.
"""
from __future__ import annotations

import argparse
import csv
import html as htmllib
import json
import math
import os
import re
import ssl
import sys
import time
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path
from urllib.parse import parse_qs, urlparse

VERSION = "2.0"
SITE = "https://ainexustools.online"
NON_POST_FILES = {"index.ts", "metadata.ts", "loaders.ts", "types.ts"}

SEV_PENALTY = {"critical": 25, "high": 12, "medium": 6, "low": 2}
SEV_RANK = {"critical": 4, "high": 3, "medium": 2, "low": 1}
EFFORT_COST = {"S": 1, "M": 2, "L": 4}
PILLARS = ["revenue", "organic", "ai", "reader", "trust"]
PILLAR_LABEL = {"revenue": "Affiliate revenue", "organic": "Google organic", "ai": "AI-search citations",
                "reader": "Reader value", "trust": "Trust & E-E-A-T"}
DEFAULT_WEIGHTS = {"revenue": 25, "organic": 25, "ai": 20, "reader": 15, "trust": 15}

USE_COLOR = sys.stdout.isatty() and os.environ.get("NO_COLOR") is None
def c(code, s): return f"\033[{code}m{s}\033[0m" if USE_COLOR else s
RED, YEL, GRN, CYN, DIM, BLD = "91", "93", "92", "96", "2", "1"


# ───────────────────────────── data classes ─────────────────────────────
@dataclass
class Issue:
    code: str
    pillar: str
    severity: str
    message: str
    fix: str = ""
    effort: str = "S"
    slug: str = ""          # "" => site-level
    where: str = ""
    snippet: str = ""       # exact text / code to paste
    key: str = ""           # stable detail for baseline fingerprints
    live: bool = False
    priority: float = 0.0

    def fingerprint(self): return f"{self.slug}|{self.code}|{self.key}"


@dataclass
class Post:
    slug: str
    path: Path
    raw: str = ""
    title: str = ""
    seo_title: str = ""
    meta: str = ""
    date_pub: str = ""
    date_mod: str = ""
    category: str = ""
    quick_answer: str = ""
    my_take: str = ""
    wordcount_field: int = 0
    faqs: list = field(default_factory=list)
    citations: list = field(default_factory=list)
    has_proscons: bool = False
    header: str = ""
    target_keyword: str = ""
    intent: str = "informational"
    content: str = ""
    text: str = ""
    words: int = 0
    links: list = field(default_factory=list)      # dicts: href, anchor, rel, pos, raw
    images: list = field(default_factory=list)
    headings: list = field(default_factory=list)   # (level, text, id, pos)
    unresolved: list = field(default_factory=list)
    hardcoded_aff: list = field(default_factory=list)
    tools_mentioned: dict = field(default_factory=dict)   # slug -> mention count
    tools_with_cta: set = field(default_factory=set)
    template_cta: str = ""
    other_refs: int = 0
    issues: list = field(default_factory=list)
    scores: dict = field(default_factory=dict)
    total: float = 0.0
    importance: float = 1.0
    inbound: int = 0
    pagerank: float = 0.0
    # --- v2 ---
    excerpt: str = ""
    metrics: dict = field(default_factory=dict)
    unique_pct: float = 100.0
    tpl_share: float = 0.0
    strength: float = 0.0
    strength_pct: int = 0
    strength_parts: dict = field(default_factory=dict)
    git: dict = field(default_factory=dict)
    gsc: dict = field(default_factory=dict)
    sessions: float = 0.0
    aff_clicks: float = 0.0


# ───────────────────────────── parsing helpers ─────────────────────────────
def unescape(s: str) -> str:
    s = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), s)
    return (s.replace("\\'", "'").replace('\\"', '"').replace("\\`", "`")
             .replace("\\n", " ").replace("\\\\", "\\"))


def read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def get_field(raw: str, name: str) -> str:
    for q in ("'", '"', "`"):
        m = re.search(rf"^[ \t]{{0,4}}{name}:\s*{q}((?:[^{q}\\\n]|\\.)*){q}", raw, re.M)
        if m:
            return unescape(m.group(1))
    return ""


def extract_template(raw: str, name: str = "content") -> str:
    """Return the body of `name: `...`` honoring escapes and ${...} nesting."""
    m = re.search(rf"^[ \t]{{0,4}}{name}:\s*`", raw, re.M)
    if not m:
        return ""
    i, n, depth, start = m.end(), len(raw), 0, m.end()
    while i < n:
        ch = raw[i]
        if ch == "\\":
            i += 2
            continue
        if ch == "$" and raw[i + 1:i + 2] == "{":
            depth += 1
            i += 2
            continue
        if ch == "}" and depth:
            depth -= 1
        elif ch == "`" and depth == 0:
            return raw[start:i]
        i += 1
    return raw[start:]


def parse_faqs(raw: str):
    out = []
    pat = re.compile(r"\{\s*q:\s*(?:'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\")\s*,\s*a:\s*"
                     r"(?:'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\"|`((?:[^`\\]|\\.)*)`)", re.S)
    for m in pat.finditer(raw):
        q = m.group(1) if m.group(1) is not None else m.group(2)
        a = next((g for g in m.groups()[2:] if g is not None), "")
        out.append((unescape(q or ""), unescape(a or "")))
    return out


def strip_tags(h: str) -> str:
    h = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", h, flags=re.S | re.I)
    h = re.sub(r"</(li|p|h[1-6]|div|td|th|tr)>", ". ", h, flags=re.I)
    t = re.sub(r"<[^>]+>", " ", h)
    t = htmllib.unescape(t)
    t = re.sub(r"\.\s*(\.\s*)+", ". ", t)
    return re.sub(r"\s+", " ", t).strip()


def strip_tables(h: str) -> str:
    return re.sub(r"<table.*?</table>", " ", h, flags=re.S | re.I)


def attr(tag: str, name: str) -> str:
    m = re.search(rf"""\b{name}\s*=\s*(?:"([^"]*)"|'([^']*)')""", tag, re.I)
    return (m.group(1) if m and m.group(1) is not None else (m.group(2) if m else "")) or ""


def words_of(text: str): return re.findall(r"[A-Za-z0-9][A-Za-z0-9'’\-]*", text)


def count_syllables(w: str) -> int:
    w = re.sub(r"[^a-z]", "", w.lower())
    if not w: return 0
    if len(w) <= 3: return 1
    w = re.sub(r"(?:[^laeiouy]es|ed|[^laeiouy]e)$", "", w)
    w = re.sub(r"^y", "", w)
    return max(1, len(re.findall(r"[aeiouy]{1,2}", w)))


def sentences_of(text: str):
    # ✅/❌/✓/✗ start pros/cons list items; without them consecutive bullets merge into one "sentence".
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9\"“(✅❌✓✗#])", text)
    return [p.strip() for p in parts if len(words_of(p)) >= 3]


def flesch(text: str) -> float:
    ws = words_of(text)
    ss = sentences_of(text) or [text]
    if not ws: return 0.0
    syl = sum(count_syllables(w) for w in ws)
    return 206.835 - 1.015 * (len(ws) / len(ss)) - 84.6 * (syl / len(ws))


def host_of(url: str) -> str:
    return (urlparse(url).netloc or "").lower().removeprefix("www.")


def reg_domain(host: str) -> str:
    parts = host.split(".")
    if len(parts) >= 3 and parts[-2] in {"co", "com", "org", "net", "ac"} and len(parts[-1]) == 2:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:]) if len(parts) >= 2 else host


def norm_url(u: str) -> str:
    """host + path (no trailing slash) + query without utm_* — so 'x.com?via=a' == 'x.com/?via=a'."""
    u = u.strip()
    pu = urlparse(u)
    q = "&".join(sorted(x for x in pu.query.split("&") if x and not x.lower().startswith("utm_")))
    return f"{pu.netloc.lower().removeprefix('www.')}{pu.path.rstrip('/')}?{q}".rstrip("?")


def parse_date(s: str):
    try: return datetime.strptime(s[:10], "%Y-%m-%d").date()
    except (ValueError, TypeError): return None


STOP = set("a an the of for to in on and or vs versus with is are your you our best top 2024 2025 2026 2027 "
           "guide review reviews compared comparison tools tool software ai how what which why".split())
def keyword_tokens(s: str) -> set:
    return {w for w in re.findall(r"[a-z0-9]+", s.lower()) if w not in STOP and len(w) > 1}


# ───────────────────────────── site model ─────────────────────────────
AFF_DOMAINS = ("sjv.io", "pxf.io", "mno8.net", "7eer.net", "8odi.net", "partnerstack.com", "shareasale.com",
               "awin1.com", "linksynergy.com", "refersion.com", "tapfiliate.com", "go2cloud.org", "prf.hn",
               "anrdoezrs.net", "tkqlhce.com", "jdoqocy.com", "dpbolvw.net", "kqzyfj.com")
AFF_PARAMS = {"via", "fpr", "ref", "aff", "affiliate", "aff_id", "pc", "tap_a", "rfsn", "irclickid", "sid", "ps_partner_key"}
IMPACT_DOMAINS = ("sjv.io", "pxf.io", "mno8.net", "7eer.net", "8odi.net")


class Site:
    def __init__(self, root: Path, today: date):
        self.root, self.today = root, today
        self.blog_dir = root / "blog"
        self.tools: dict = {}          # slug -> {name, link, has_page}
        self.aff_links: dict = {}      # key -> url
        self.compare_slugs: set = set()
        self.posts: dict = {}
        self.routes_static: set = set()
        self.live_results: dict = {}
        self.site_issues: list = []
        self.price_claims: dict = defaultdict(list)
        self.load_tools()
        self.load_compare()
        self.load_static_routes()
        self.load_template_data()

    # constants.ts + lib/affiliate-links.ts
    def load_tools(self):
        txt = read(self.root / "constants.ts")
        s = txt.find("export const TOOLS")
        e = txt.find("\nexport const ", s + 10)
        region = txt[s:e if e > 0 else len(txt)]
        slugs = list(re.finditer(r"\bslug:\s*'([a-z0-9\-]+)'", region))
        for i, m in enumerate(slugs):
            entry = region[m.start(): slugs[i + 1].start() if i + 1 < len(slugs) else len(region)]
            nm = re.search(r"\bname:\s*'((?:[^'\\]|\\.)*)'", entry)
            al = re.search(r"\baffiliateLink:\s*'([^']*)'", entry)
            slug = m.group(1)
            self.tools[slug] = {"name": unescape(nm.group(1)) if nm else slug.replace("-", " ").title(),
                                "link": al.group(1) if al else "", "has_page": True}
            if al: self.aff_links[slug] = al.group(1)
        lib = read(self.root / "lib" / "affiliate-links.ts")
        sup = re.search(r"SUPPLEMENTARY_LINKS[^=]*=\s*\{(.*?)\n\};", lib, re.S)
        if sup:
            for m in re.finditer(r"^\s*(?:'([^']+)'|([A-Za-z0-9_]+))\s*:\s*'([^']*)'", sup.group(1), re.M):
                key = m.group(1) or m.group(2)
                self.aff_links[key] = m.group(3)           # supplementary wins (matches the TS spread order)
                if key not in self.tools:
                    self.tools[key] = {"name": key.replace("-", " ").title(), "link": m.group(3), "has_page": False}
                else:
                    self.tools[key]["link"] = m.group(3)

    def load_compare(self):
        txt = read(self.root / "pages" / "compare-metadata.ts")
        self.compare_slugs = set(re.findall(r'"?slug"?:\s*["\']([a-z0-9\-]+)["\']', txt))

    def load_static_routes(self):
        blob = read(self.root / "App.tsx") + read(self.root / "scripts" / "prerender.mjs") + read(self.root / "site-config.ts")
        self.routes_static = set(re.findall(r"""['"`](/[a-z0-9][a-z0-9\-/]*?)/?['"`]""", blob))
        for p in (self.root / "public").glob("*") if (self.root / "public").exists() else []:
            self.routes_static.add("/" + p.name)

    def load_template_data(self):
        """Things BlogPostPage.tsx adds around the post body: answer-block CTA, related posts/tools modules."""
        self.answer_blocks, self.related_posts, self.related_tools = {}, {}, {}
        try:
            d = json.loads(read(self.blog_dir / "answer-blocks.json") or "{}")
            self.answer_blocks = {k: v for k, v in d.items() if isinstance(v, dict)}
        except ValueError:
            pass
        page = read(self.root / "pages" / "BlogPostPage.tsx")
        for name, target in (("BLOG_RELATED_POSTS", self.related_posts), ("BLOG_RELATED_TOOLS", self.related_tools)):
            m = re.search(rf"{name}[^=]*=\s*\{{(.*?)\n\}};", page, re.S)
            if m:
                arrays = {
                    key: re.findall(r"'([a-z0-9\-]+)'", values)
                    for key, values in re.findall(r"const\s+([A-Z][A-Z0-9_]*)\s*=\s*\[([^\]]*)\]", page, re.S)
                }
                for k, v in re.findall(r"'([a-z0-9\-]+)'\s*:\s*\[([^\]]*)\]", m.group(1)):
                    target[k] = re.findall(r"'([a-z0-9\-]+)'", v)
                for k, ref in re.findall(r"'([a-z0-9\-]+)'\s*:\s*([A-Z][A-Z0-9_]*)", m.group(1)):
                    if ref in arrays:
                        target[k] = arrays[ref]

    # tool helpers
    def is_tracked(self, url: str) -> bool:
        if not url: return False
        u = urlparse(url)
        if any(host_of(url).endswith(d) for d in AFF_DOMAINS): return True
        # PartnerStack-style vanity hosts (try.<vendor>, get.<vendor>) with a short code path, and /refer/<code> referral links
        if re.match(r"^(?:try|get|go|join|partner|refer)\.", host_of(url)) and len(u.path.strip("/")) >= 6: return True
        if re.match(r"^/refer/[A-Za-z0-9_-]{4,}", u.path): return True
        q = {k.lower() for k in parse_qs(u.query)}
        if q & AFF_PARAMS: return True
        return "utm_medium=affiliate" in url

    def is_affiliate_href(self, href: str) -> bool:
        if self.is_tracked(href): return True
        n = norm_url(href)
        return any(norm_url(v) == n for v in self.aff_links.values() if self.is_tracked(v))

    PATTERN_OVERRIDES = {"make": [r"Make\.com", r"Make (?:Pro|Core|Teams|Free|Enterprise)\b", r"(?<=vs )Make\b", r"(?<=vs\. )Make\b", r"\bMake's\b", r"\bMake (?:scenarios?|automations?|vs)\b"],
                         "pi": [r"\bPi \(Presentation Intelligence\)", r"Presentation Intelligence"],
                         # "emergent" is also an everyday AI term (emergent behaviour/abilities); only count the tool, Emergent.sh
                         "emergent": [r"Emergent\.sh", r"\bEmergent (?:review|pricing|vs\.?|credits|platform|app builder)\b"]}

    def tool_patterns(self):
        pats = {}
        for slug, t in self.tools.items():
            if slug in self.PATTERN_OVERRIDES:
                pats[slug] = [re.compile(x) for x in self.PATTERN_OVERRIDES[slug]]
                continue
            names = {t["name"], slug.replace("-", " "), slug.replace("-", "")}
            alts = []
            for nm in names:
                nm = nm.strip()
                if not nm: continue
                esc = re.escape(nm)
                flags = 0 if len(nm) <= 4 else re.I
                alts.append(re.compile(rf"(?<![\w/\-]){esc}(?![\w\-/])", flags))
            pats[slug] = alts
        return pats

    # posts
    def load_posts(self):
        files = sorted(p for p in self.blog_dir.glob("*.ts") if p.name not in NON_POST_FILES)
        pats = self.tool_patterns()
        self._pats = pats
        for f in files:
            raw = read(f)
            p = Post(slug=f.stem, path=f, raw=raw)
            slug_decl = get_field(raw, "slug")
            p.title = get_field(raw, "title")
            p.seo_title = get_field(raw, "seoTitle")
            p.meta = get_field(raw, "metaDescription")
            p.date_pub = get_field(raw, "datePublished")
            p.date_mod = get_field(raw, "dateModified")
            p.category = get_field(raw, "category")
            p.quick_answer = get_field(raw, "quickAnswer")
            p.my_take = get_field(raw, "myTake")
            wc = re.search(r"^\s{0,4}wordCount:\s*(\d+)", raw, re.M)
            p.wordcount_field = int(wc.group(1)) if wc else 0
            p.faqs = parse_faqs(raw)
            cit = re.search(r"outboundCitations:\s*\[(.*?)\n\s{0,4}\]", raw, re.S)
            p.citations = re.findall(r"url:\s*'([^']+)'", cit.group(1)) if cit else []
            p.has_proscons = bool(re.search(r"^\s{0,4}proscons:\s*\{", raw, re.M))
            p.header = raw[: raw.find("import ")] if "import " in raw else raw[:3000]
            km = re.search(r'Target keyword:\s*["“\']([^"”\']+)["”\']', p.header)
            p.target_keyword = km.group(1).strip() if km else ""
            if slug_decl and slug_decl != p.slug:
                p.unresolved.append(("slug-mismatch", slug_decl))
            self.parse_content(p, pats)
            self.posts[p.slug] = p
        return self.posts

    def parse_content(self, p: Post, pats):
        body = extract_template(p.raw)

        def repl(m):
            expr = m.group(1)
            km = re.fullmatch(r"\s*AFFILIATE_LINKS\[\s*['\"]([^'\"]+)['\"]\s*\]\s*", expr)
            if km:
                k = km.group(1)
                if k in self.aff_links and self.aff_links[k]:
                    return self.aff_links[k]
                p.unresolved.append(("missing-affiliate-key", k))
                return "https://UNDEFINED-AFFILIATE-KEY/" + k
            return ""
        p.content = re.sub(r"\$\{([^{}]*)\}", repl, body)
        p.text = strip_tags(p.content)
        p.words = len(words_of(p.text))
        total = max(1, len(p.content))
        for m in re.finditer(r"<a\b([^>]*)>(.*?)</a>", p.content, re.S | re.I):
            href = htmllib.unescape(attr(m.group(1), "href"))
            p.links.append({"href": href, "anchor": strip_tags(m.group(2)), "rel": attr(m.group(1), "rel").lower(),
                            "target": attr(m.group(1), "target"), "pos": m.start() / total, "raw": m.group(0)})
        for m in re.finditer(r"<img\b[^>]*>", p.content, re.I):
            tag = m.group(0)
            p.images.append({"src": attr(tag, "src"), "alt": attr(tag, "alt"), "loading": attr(tag, "loading").lower(),
                             "has_dims": bool(attr(tag, "width") or "aspect-ratio" in attr(tag, "style")),
                             "pos": m.start() / total})
        for m in re.finditer(r"<h([1-6])([^>]*)>(.*?)</h\1>", p.content, re.S | re.I):
            p.headings.append((int(m.group(1)), strip_tags(m.group(3)), attr(m.group(2), "id"), m.start() / total))
        # raw hardcoded affiliate URLs in the TS source (not through AFFILIATE_LINKS)
        for m in re.finditer(r'href="(https?://[^"$]+)"', body):
            if self.is_tracked(m.group(1)):
                p.hardcoded_aff.append(m.group(1))
        # tool mentions (outside the affiliate/source comment header)
        for slug, alts in pats.items():
            n = max(len(a.findall(p.text)) for a in alts) if alts else 0
            if n: p.tools_mentioned[slug] = n
        p.intent = classify_intent(p)
        ab = self.answer_blocks.get(p.slug, {})
        p.template_cta = (ab.get("cta") or {}).get("tool") if isinstance(ab.get("cta"), dict) else None
        if p.template_cta and self.aff_links.get(p.template_cta):
            p.tools_with_cta.add(p.template_cta)
        for l in p.links:
            if self.is_affiliate_href(l["href"]):
                for slug, url in self.aff_links.items():
                    if norm_url(url) == norm_url(l["href"]):
                        p.tools_with_cta.add(slug)


def classify_intent(p: Post) -> str:
    s = f"{p.slug} {p.title}".lower()
    if re.search(r"\b(vs|versus|alternatives?|pricing|price|cost|review|best|top|deal|discount|coupon|compared|worth)\b", s):
        return "transactional"
    if re.search(r"\b(how|what|why|guide|tutorial|explained|difference|ways)\b", s):
        return "informational"
    return "informational"


def post_kind(p: Post) -> str:
    s = f"{p.slug} {p.title}".lower()
    if re.search(r"\bvs\b|versus", s): return "comparison"
    if re.search(r"alternatives?", s): return "alternatives"
    if re.search(r"pricing|price|cost", s): return "pricing"
    if re.search(r"\breview\b", s): return "review"
    if re.search(r"\bbest\b|\btop\b", s): return "roundup"
    if re.search(r"\bhow\b|tutorial|guide", s): return "howto"
    return "article"


# ───────────────────────────── per-post analysis ─────────────────────────────
AI_SLOP = [r"in today'?s (?:fast[- ]paced|digital|ever[- ]changing|competitive)", r"in the (?:ever[- ]evolving|rapidly evolving)",
           r"\bdelve\b", r"game[- ]chang(?:er|ing)", r"unlock the (?:full )?(?:power|potential)", r"\brevolutioni[sz]e",
           r"\bseamless(?:ly)?\b", r"\brobust\b", r"cutting[- ]edge", r"it'?s (?:important|worth) (?:to note|noting)",
           r"\btapestry\b", r"elevate your", r"to the next level", r"look no further", r"navigate the (?:complex )?(?:landscape|world)",
           r"\bleverag(?:e|ing)\b", r"\bpivotal\b", r"\btestament to\b", r"in conclusion,", r"supercharge"]
FILLER_OPENERS = [r"in today'?s ", r"welcome to ", r"are you (?:tired|looking|struggling|wondering)", r"let'?s dive", r"dive (?:deep )?into",
                  r"without further ado", r"in this (?:article|post|blog),? (?:we|i)(?:'ll| will)", r"as we all know"]
EXPERIENCE_CLAIMS = [r"\b(?:i|we) (?:have |'ve )?(?:personally |also |both )?(?:tested|tried|used|ran|run)\b(?!\s*(?:\$|\d|the (?:annual|monthly|lowest|official|list|published|vendor)|annual|monthly|official|only|data|figures|public))",
                     r"\b(?:i|we) (?:have |'ve )?spent \d+ (?:hours|days|weeks|months)",
                     r"\bin (?:my|our) (?:testing|tests|hands-on|own testing)", r"\bhands[- ]on\b", r"\bafter (?:testing|using) (?:it|them|\w+) for",
                     r"\b(?:i|we) (?:put|ran) .{0,40}\b(?:through|against)\b", r"\bmy (?:own )?benchmarks?\b"]
VAGUE_CLAIMS = [r"\bmany (?:users|people|experts|marketers|creators|reviewers) (?:say|believe|report|agree|love)", r"\bstudies show\b",
                r"\bresearch (?:shows|suggests|proves)\b", r"\baccording to experts\b", r"\bit is widely (?:known|believed)\b",
                r"\beveryone (?:knows|agrees|loves)\b", r"\bsome say\b", r"\bexperts agree\b"]
HYPE_CLAIMS = [r"\bunbeatable\b", r"\bguaranteed\b", r"\b100% (?:accurate|safe|free)\b", r"\bbest[- ]in[- ]class\b", r"\bthe best \w+ (?:ever|on the market)\b",
               r"\bno[- ]brainer\b", r"\bperfect for everyone\b"]
GENERIC_ANCHORS = {"click here", "here", "read more", "learn more", "this link", "link", "this post", "this article", "visit site", "visit", "check it out"}
PLACEHOLDER_RE = re.compile(r"(?:\bTBD\b|\bTODO\b|lorem ipsum|\[insert[^\]]*\]|\bFIXME\b|\bXXX+\b|\[placeholder\]|\bplaceholder (?:text|content|image)\b|\bto be (?:announced|determined|added)\b|\bcoming soon\b(?= *(?:</|\|))|\[(?:link|url|price|tool|name)\])", re.I)
DECISION_RE = re.compile(r"\b(?:use|choose|pick|go with|skip|avoid|best for|ideal for|who (?:it'?s|it is) for|who should (?:use|skip|avoid|not))\b", re.I)
MIN_WORDS = {"roundup": 2000, "comparison": 1600, "alternatives": 1600, "pricing": 1200, "review": 1500, "howto": 1200, "article": 900}
FRESH_DAYS = {"pricing": 60, "comparison": 60, "alternatives": 60, "roundup": 75, "review": 90, "howto": 180, "article": 180}
QUESTION_STEMS = ("who", "what", "how", "is", "are", "can", "does", "do", "which", "should", "why", "when", "will", "where", "could")


def snippet_around(text: str, m, width=70) -> str:
    a, b = max(0, m.start() - width), min(len(text), m.end() + width)
    return ("…" if a else "") + text[a:b].strip() + ("…" if b < len(text) else "")


def short_title(p: Post) -> str:
    t = p.seo_title or p.title or p.slug
    t = re.split(r"\s[:—–|]\s", t)[0] if len(t) > 55 else t
    return t.strip()


class Analyzer:
    def __init__(self, site: Site):
        self.site = site

    def add(self, p, code, pillar, sev, msg, fix="", effort="S", where="", snippet="", key="", live=False):
        p.issues.append(Issue(code, pillar, sev, msg, fix, effort, p.slug, where, snippet, key or msg[:60], live))

    # ---- master -----------------------------------------------------------
    def analyze(self, p: Post):
        for fn in (self.seo, self.freshness, self.headings, self.images, self.internal_links, self.external_links,
                   self.affiliate, self.geo, self.reader, self.trust, self.integrity, self.v2):
            fn(p)

    # ---- organic ----------------------------------------------------------
    def seo(self, p):
        kind = post_kind(p)
        st, meta = p.seo_title, p.meta
        if not st:
            self.add(p, "seo-title-missing", "organic", "high", "No seoTitle set.", "Add a ≤60-char seoTitle containing the primary keyword and the year.", "S")
        elif len(st) > 62:
            self.add(p, "seo-title-long", "organic", "medium", f"seoTitle is {len(st)} chars; Google will truncate it (~60).",
                     "Trim to ≤60 chars, keep the keyword first.", "S", "seoTitle", st, key=str(len(st)))
        elif len(st) < 30:
            self.add(p, "seo-title-short", "organic", "low", f"seoTitle is only {len(st)} chars — wasted SERP real estate.", "Expand with the intent modifier (Reviewed, Pricing, Compared).", "S", "seoTitle", st)
        if not meta:
            self.add(p, "meta-missing", "organic", "high", "No metaDescription.", "Write a 130-155 char description: promise + proof (number/year) + soft CTA.", "S")
        else:
            if len(meta) > 160: self.add(p, "meta-long", "organic", "medium", f"metaDescription is {len(meta)} chars (>160, truncated).", "Cut to ≤155 chars; keep the key claim in the first 120.", "S", "metaDescription", meta, key=str(len(meta)))
            elif len(meta) < 110: self.add(p, "meta-short", "organic", "medium", f"metaDescription is {len(meta)} chars (<110).", "Expand to 130-155 chars with the strongest differentiator.", "S", "metaDescription", meta, key=str(len(meta)))
        year = self.site.today.year
        yrs = {int(y) for y in re.findall(r"\b(20[12]\d)\b", f"{p.title} {st} {meta}")}
        stale = {y for y in yrs if y < year}
        if stale and year not in yrs and kind in ("roundup", "comparison", "alternatives", "pricing", "review"):
            self.add(p, "year-stale", "organic", "high", f"Title/meta only reference {sorted(stale)}, not {year} — reads as outdated in SERPs.",
                     f"Update the year to {year} everywhere it appears in title, seoTitle and metaDescription (only if the content has actually been refreshed).", "S", key=str(sorted(stale)))
        elif kind in ("roundup", "comparison", "alternatives", "pricing") and str(year) not in st and str(year) not in p.title:
            self.add(p, "year-missing", "organic", "low", f"No {year} in title for a time-sensitive '{kind}' query.", f"Add '{year}' to seoTitle.", "S")
        # keyword alignment
        kw = p.target_keyword or " ".join(re.findall(r"[a-z]+", p.slug))
        kt = keyword_tokens(kw)
        if kt:
            tt = keyword_tokens(f"{p.title} {st}")
            if len(kt & tt) / len(kt) < 0.6:
                self.add(p, "kw-title", "organic", "medium", f"Primary keyword '{kw}' is weakly reflected in the title ({len(kt & tt)}/{len(kt)} terms).",
                         "Rewrite seoTitle so it contains the full keyword phrase, ideally at the start.", "S", key=kw)
            first = keyword_tokens(" ".join(words_of(p.text)[:150]))
            if len(kt & first) / len(kt) < 0.6:
                self.add(p, "kw-intro", "organic", "low", f"Primary keyword terms are missing from the first 150 words.", "Name the keyword naturally in the opening paragraph.", "S", key=kw)
        if len(p.slug) > 75:
            self.add(p, "slug-long", "organic", "low", f"Slug is {len(p.slug)} chars.", "Shorter slugs are easier to cite & share (only change with a 301 redirect).", "M")
        sy = re.findall(r"20\d\d", p.slug)
        if sy and not any(y in f"{p.title}{st}" for y in sy):
            self.add(p, "slug-year-mismatch", "organic", "medium", f"Slug has {sy[0]} but the title does not.", "Align title year with the slug year.", "S")
        if not p.my_take and kind in ("roundup", "comparison", "review", "alternatives"):
            pass  # handled in trust

    def freshness(self, p):
        kind = post_kind(p)
        pub, mod = parse_date(p.date_pub), parse_date(p.date_mod)
        if not pub or not mod:
            self.add(p, "dates-missing", "organic", "high", "datePublished/dateModified missing or unparsable.", "Set both as YYYY-MM-DD (feeds Article schema & freshness).", "S"); return
        if mod < pub:
            self.add(p, "date-order", "organic", "high", f"dateModified ({mod}) is before datePublished ({pub}).", "Fix the dates.", "S")
        if mod > self.site.today:
            self.add(p, "date-future", "organic", "medium", f"dateModified {mod} is in the future.", "Fix the date.", "S")
        age = (self.site.today - mod).days
        lim = FRESH_DAYS[kind]
        if age > lim:
            sev = "high" if age > lim * 2 else "medium"
            self.add(p, "stale", "organic", sev, f"Last modified {age} days ago; '{kind}' posts decay after ~{lim} days (prices/features move).",
                     "Re-verify pricing & plan limits on vendor pages, update what changed, then bump dateModified (only for real edits).", "M", key=kind)
        has_stamp = re.search(r"(?:last )?(?:updated|verified|checked|reviewed|as of)\b[^.]{0,40}(?:20\d\d|january|february|march|april|may|june|july|august|september|october|november|december)", p.text, re.I)
        prices = len(re.findall(r"\$\d", p.text))
        if prices >= 5 and not has_stamp:
            self.add(p, "price-undated", "trust", "medium", f"{prices} price mentions but no visible 'verified/as of <date>' stamp.",
                     "Add a line near the first price table: 'Prices verified <Month Year> against each vendor's pricing page.'", "S",
                     snippet=f"<p><em>Prices verified {self.site.today.strftime('%B %Y')} against each vendor's official pricing page.</em></p>")

    def headings(self, p):
        hs = p.headings
        h2 = [h for h in hs if h[0] == 2]
        if not h2:
            self.add(p, "no-h2", "organic", "high", "No <h2> sections.", "Break the post into H2 sections that match sub-queries.", "M"); return
        if any(h[0] == 1 for h in hs):
            self.add(p, "h1-in-content", "organic", "medium", "An <h1> exists inside the body (the page template already renders one).", "Downgrade to <h2>.", "S")
        prev = 1
        for lvl, txt, _id, _ in hs:
            if lvl > prev + 1:
                self.add(p, "heading-skip", "organic", "low", f"Heading level jumps h{prev}→h{lvl} at '{txt[:50]}'.", "Keep a strict h2→h3→h4 outline.", "S", key=txt[:40]); break
            prev = lvl
        want = max(4, p.words // 450)
        if len(h2) < want:
            self.add(p, "few-h2", "reader", "medium", f"{len(h2)} H2s for {p.words} words (target ≥{want}).", "Add H2s phrased like the questions people search.", "M", key=str(len(h2)))
        c = Counter(h[1].lower() for h in hs)
        dup = [t for t, n in c.items() if n > 1]
        if dup: self.add(p, "dup-headings", "organic", "low", f"Duplicate headings: {', '.join(d[:40] for d in dup[:3])}.", "Make headings unique.", "S", key="|".join(dup[:3]))
        with_id = sum(1 for h in hs if h[2])
        # T1: pages/BlogPostPage.tsx and scripts/prerender.mjs add an id to every H2/H3 at render time
        # (addHeadingIdsAndToc), so hand-written ids are optional. Re-enable by changing False to True.
        if False and with_id >= len(hs) * 0.5 and len(hs) - with_id >= 2:
            miss = [h[1][:40] for h in hs if not h[2]][:4]
            self.add(p, "heading-no-id", "organic", "low", f"{len(hs) - with_id} headings lack id attributes (no deep links/jump links).", "Add id=\"slug\" to every H2/H3.", "S", key=str(len(hs) - with_id), snippet=", ".join(miss))
        q = sum(1 for h in hs if h[1].rstrip().endswith("?") or h[1].lower().startswith(QUESTION_STEMS))
        if post_kind(p) in ("roundup", "howto", "alternatives") and q < 2:
            self.add(p, "heading-questions", "ai", "low", "Almost no question-style headings.", "Phrase 2-4 H2/H3 as real questions ('Is X worth it for Y?') — AI engines lift these as answer units.", "S")

    def images(self, p):
        im = p.images
        if p.words > 800 and not im:
            self.add(p, "no-images", "reader", "medium", "No images at all.", "Add 1 image per ~500 words (comparison graphic, pricing chart, tool UI from official press kits).", "M"); return
        miss = [i for i in im if not i["alt"].strip()]
        if miss: self.add(p, "img-alt-missing", "organic", "medium", f"{len(miss)} image(s) without alt text.", "Describe what is shown + the tool name.", "S", key=str(len(miss)), snippet=miss[0]["src"][:100])
        weak = [i for i in im if i["alt"].strip() and (len(i["alt"]) < 12 or re.match(r"(?:image|photo|picture) of\b", i["alt"], re.I))]
        if weak: self.add(p, "img-alt-weak", "organic", "low", f"{len(weak)} image(s) with weak alt text.", "Use specific alt text, not 'image of'.", "S", key=str(len(weak)), snippet=weak[0]["alt"])
        srcs = Counter(i["src"] for i in im)
        d = [s for s, n in srcs.items() if n > 1]
        if d: self.add(p, "img-dupe", "reader", "medium", f"Same image used {srcs[d[0]]}× in this post.", "Replace duplicates.", "S", snippet=d[0][:100])
        if im and im[0]["loading"] == "lazy": self.add(p, "img-lcp-lazy", "organic", "low", "First image is loading=\"lazy\" (hurts LCP).", "Remove lazy and add fetchpriority=\"high\" to the first image.", "S")
        nodim = [i for i in im if not i["has_dims"]]
        if nodim: self.add(p, "img-cls", "organic", "low", f"{len(nodim)} image(s) lack width/height/aspect-ratio (layout shift).", "Add width, height or aspect-ratio.", "S", key=str(len(nodim)))
        if im and p.words / max(1, len(im)) > 900 and p.words > 1500:
            self.add(p, "img-sparse", "reader", "low", f"1 image per {p.words // len(im)} words.", "Add visuals at section breaks.", "M", key=str(p.words // len(im)))

    def internal_url_status(self, href: str):
        path = urlparse(href).path
        if not href.startswith("/") or href.startswith("//"): return None
        bare = path.rstrip("/")
        m = re.fullmatch(r"/blog/([^/]+)", bare)
        if m: return ("ok", m.group(1)) if m.group(1) in self.site.posts else ("broken", m.group(1))
        m = re.fullmatch(r"/tools/([^/]+)", bare)
        if m: return ("ok", m.group(1)) if self.site.tools.get(m.group(1), {}).get("has_page") else ("broken", m.group(1))
        m = re.fullmatch(r"/compare/([^/]+)", bare)
        if m: return ("ok", m.group(1)) if m.group(1) in self.site.compare_slugs else ("broken", m.group(1))
        if bare in ("", "/") or bare in self.site.routes_static or re.search(r"\.[a-z0-9]{2,5}$", bare): return ("ok", bare)
        return ("unknown", bare)

    def internal_links(self, p):
        seen, broken, noslash, unknown, generic = set(), [], [], [], []
        for l in p.links:
            h = l["href"]
            if h.startswith("#") or not h.startswith("/"): continue
            st = self.internal_url_status(h)
            clean = h.split("#")[0].split("?")[0]
            if st:
                if st[0] == "broken": broken.append(h)
                elif st[0] == "unknown": unknown.append(h)
                else: seen.add(clean.rstrip("/"))
            if clean and not clean.endswith("/") and not re.search(r"\.[a-z0-9]{2,5}$", clean) and clean != "/": noslash.append(h)
            if l["anchor"].strip().lower() in GENERIC_ANCHORS: generic.append(l["anchor"])
            if clean.rstrip("/") == f"/blog/{p.slug}": self.add(p, "self-link", "organic", "low", "Post links to itself.", "Remove the self-link.", "S", key=h)
        if broken: self.add(p, "link-broken-internal", "organic", "high", f"{len(broken)} internal link(s) point to pages that don't exist: {', '.join(sorted(set(broken))[:4])}.",
                            "Create the destination page or repoint the link (this is what drives bounce on missing-page clicks).", "M", key="|".join(sorted(set(broken))))
        if unknown: self.add(p, "link-unverified", "organic", "low", f"{len(set(unknown))} internal link(s) to routes the analyzer can't find in App.tsx/prerender: {', '.join(sorted(set(unknown))[:3])}.", "Verify they resolve.", "S", key="|".join(sorted(set(unknown))))
        if noslash: self.add(p, "link-no-trailing-slash", "organic", "medium", f"{len(noslash)} internal link(s) lack the trailing slash (GSC redirect errors).", "Append '/' to the href.", "S", key=str(len(noslash)), snippet=noslash[0])
        if generic: self.add(p, "anchor-generic", "organic", "low", f"{len(generic)} link(s) use generic anchors ({', '.join(sorted(set(generic))[:3])}).", "Use descriptive anchors that name the destination.", "S", key=str(len(generic)))
        for t in self.site.related_tools.get(p.slug, []): seen.add(f"/tools/{t}")   # "Related Reviews" module in BlogPostPage.tsx
        for t in self.site.related_posts.get(p.slug, []): seen.add(f"/blog/{t}")    # "Related Posts" module
        need = max(4, p.words // 700)
        if len(seen) < need:
            self.add(p, "few-internal-links", "organic", "medium", f"{len(seen)} unique internal links; target ≥{need} for {p.words} words.", "Link to related tool pages, compare pages and sibling posts.", "M", key=str(len(seen)))
        # tool pages mentioned but not linked
        missing = []
        for slug, n in sorted(p.tools_mentioned.items(), key=lambda x: -x[1]):
            t = self.site.tools.get(slug)
            if t and t["has_page"] and n >= 2 and f"/tools/{slug}" not in seen:
                missing.append((slug, t["name"], n))
        if missing:
            snips = "\n".join(f'<a href="/tools/{s}/">{nm} review</a>' for s, nm, _ in missing[:6])
            self.add(p, "tool-page-unlinked", "revenue", "medium" if len(missing) >= 3 else "low", f"{len(missing)} tool(s) with a review page are discussed but not linked: {', '.join(nm for _, nm, _ in missing[:6])}.",
                     "Link the first mention of each tool to its /tools/ page (funnel: blog → review → affiliate).", "S", snippet=snips, key="|".join(s for s, _, _ in missing[:6]))

    def external_links(self, p):
        kind = post_kind(p)
        ext = [l for l in p.links if l["href"].startswith("http") and not self.site.is_affiliate_href(l["href"]) and host_of(l["href"]) != host_of(SITE)]
        srcs = {host_of(u) for u in p.citations} | {host_of(l["href"]) for l in ext}
        need = 3 if kind in ("roundup", "comparison", "pricing", "alternatives", "review") else 1
        if len(srcs) < need:
            self.add(p, "few-sources", "trust", "high" if not srcs else "medium", f"Only {len(srcs)} distinct outbound source domain(s); '{kind}' posts need ≥{need} (official pricing pages, docs, G2/Trustpilot).",
                     "Cite each tool's official pricing page and at least one independent review source.", "M", key=str(len(srcs)))
        nums = len(re.findall(r"\d+(?:\.\d+)?%|\b\d[\d,]{3,}\+?\s+(?:users|customers|teams|companies|downloads)", p.text))
        if nums >= 12 and len(srcs) <= 1:
            self.add(p, "stats-unsourced", "trust", "medium", f"{nums} statistics/percentages but ≤1 outbound source.", "Link each stat to its source or remove it.", "M", key=str(nums))
        bad = [l["href"] for l in p.links if l["href"] in ("#", "", "javascript:void(0)")]
        if bad: self.add(p, "link-empty", "reader", "medium", f"{len(bad)} link(s) with empty/'#' href.", "Point to a real destination or remove.", "S", key=str(len(bad)))

    # ---- revenue ----------------------------------------------------------
    def affiliate(self, p):
        site, kind = self.site, post_kind(p)
        aff = [l for l in p.links if site.is_affiliate_href(l["href"])]
        n_aff = len(aff) + (1 if p.template_cta else 0)   # the answer-block CTA is rendered by BlogPostPage.tsx
        # broken keys / undefined
        for typ, k in p.unresolved:
            if typ == "missing-affiliate-key":
                self.add(p, "aff-key-missing", "revenue", "critical", f"AFFILIATE_LINKS['{k}'] does not exist — the CTA renders a dead URL.",
                         f"Add '{k}' to constants.ts TOOLS or SUPPLEMENTARY_LINKS in lib/affiliate-links.ts.", "S", key=k)
            elif typ == "slug-mismatch":
                self.add(p, "slug-mismatch", "organic", "high", f"slug field '{k}' ≠ filename '{p.slug}'.", "Make them identical.", "S", key=k)
        # rel hygiene
        norel = [l for l in aff if "sponsored" not in l["rel"]]
        if norel:
            self.add(p, "aff-rel", "trust", "high", f"{len(norel)} affiliate link(s) missing rel=\"sponsored\" (Google link-scheme risk).",
                     "Use rel=\"sponsored nofollow noopener noreferrer\" on every affiliate link.", "S", key=str(len(norel)),
                     snippet=norel[0]["raw"][:220], where="content")
        notarget = [l for l in aff if l["target"] == "_blank" and "noopener" not in l["rel"]]
        if notarget: self.add(p, "aff-noopener", "trust", "low", f"{len(notarget)} target=_blank affiliate link(s) without noopener.", "Add noopener noreferrer.", "S", key=str(len(notarget)))
        if p.hardcoded_aff:
            u = sorted(set(p.hardcoded_aff))
            self.add(p, "aff-hardcoded", "revenue", "low", f"{len(p.hardcoded_aff)} affiliate URL(s) hardcoded in the post instead of AFFILIATE_LINKS (can't be swapped sitewide).",
                     "Replace with ${AFFILIATE_LINKS['<slug>']} and run check-affiliate-links.mjs --update-baseline.", "S", key=str(len(p.hardcoded_aff)), snippet="\n".join(u[:3]))
        # disclosure
        if aff:
            low = p.content.lower()
            m = re.search(r"(?:affiliate|commission|sponsored|referral)", p.text, re.I)
            disc_link = "/disclosure" in low
            pos = (p.content.lower().find(m.group(0).lower()) / max(1, len(p.content))) if m else 1
            if not m:
                self.add(p, "disclosure-missing", "trust", "high", "Affiliate links in the body but no disclosure text in the post itself (the footer link isn't 'clear and conspicuous' under FTC / ASCI guidance).",
                         "Add a visible disclosure before the first affiliate link.", "S",
                         snippet='<p style="font-size:12px;opacity:.75">Affiliate links: AI Nexus may earn a commission at no extra cost to you. <a href="/disclosure/">How we pick</a>.</p>')
            elif pos > 0.2:
                self.add(p, "disclosure-late", "trust", "medium", f"Affiliate disclosure first appears {int(pos * 100)}% into the post; it must precede the first affiliate link.", "Move it above the first CTA / top-pick box.", "S", key=str(int(pos * 10)))
            elif not disc_link:
                self.add(p, "disclosure-nolink", "trust", "low", "Disclosure doesn't link to /disclosure/.", "Link the disclosure to the full policy.", "S")
            first = min(l["pos"] for l in aff)
            if kind in ("roundup", "comparison", "alternatives", "pricing", "review") and first > 0.35:
                self.add(p, "cta-late", "revenue", "medium", f"First affiliate CTA appears at {int(first * 100)}% of the post; most readers never get there.",
                         "Put a 'top pick' CTA box right after the Quick Answer.", "S", key=str(int(first * 10)))
            if kind in ("roundup", "comparison", "alternatives", "pricing", "review") and not any(l["pos"] > 0.75 for l in aff):
                self.add(p, "cta-no-closer", "revenue", "low", "No affiliate CTA in the last quarter (final verdict / 'use X if' section).", "Add CTAs to the closing verdict where intent is highest.", "S")
            dens = n_aff / max(1, p.words) * 1000
            if dens > 14:
                self.add(p, "cta-overdense", "trust", "medium", f"{n_aff} affiliate links ({dens:.0f}/1000 words) — looks like a link farm to readers and quality raters.", "Keep 1 CTA per tool section + 1 closer; remove repeats.", "M", key=str(int(dens)))
            weak = [l for l in aff if l["anchor"].strip().lower() in GENERIC_ANCHORS or len(l["anchor"].strip()) < 4]
            if weak: self.add(p, "cta-anchor-weak", "revenue", "low", f"{len(weak)} CTA(s) use generic/empty anchor text.", "Use action+benefit anchors: 'Try Gamma free →'.", "S", key=str(len(weak)), snippet=weak[0]["raw"][:160])
            tables = re.findall(r"<table.*?</table>", p.content, re.S | re.I)
            tbl_text = " ".join(re.sub(r"<[^>]+>", " ", t) for t in tables)
            tbl_has_tracked_tool = any(re.search(r"(?<![A-Za-z0-9])" + re.escape(tm["name"]) + r"(?![A-Za-z0-9])", tbl_text, re.I)
                                       for sl, tm in site.tools.items() if site.is_tracked(site.aff_links.get(sl, "")) and len(tm["name"]) >= 4)
            if tables and tbl_has_tracked_tool and kind in ("roundup", "comparison", "alternatives", "pricing") and not any(site.is_affiliate_href(h) for t in tables for h in re.findall(r'href="([^"]+)"', t)):
                self.add(p, "cta-table", "revenue", "medium", "The comparison table has no affiliate links — it's the highest-attention zone on the page.", "Link tool names (or add a 'Try free' column) with ${AFFILIATE_LINKS[...]}.", "S")
        # missing CTAs per tool
        missing_ct, leak = [], 0
        for slug, n in sorted(p.tools_mentioned.items(), key=lambda x: -x[1]):
            link = site.aff_links.get(slug, "")
            tracked = site.is_tracked(link)
            in_head = any(re.search(re.escape(site.tools[slug]["name"]), h[1], re.I) for h in p.headings)
            if not tracked or slug in p.tools_with_cta: continue
            if n >= 4 or (n >= 2 and in_head):
                missing_ct.append((slug, n, in_head))
        for slug, n, in_head in missing_ct[:8]:
            nm = site.tools[slug]["name"]
            sev = "high" if kind in ("roundup", "comparison", "alternatives", "pricing") and (n >= 6 or in_head) else "medium"
            h = next((h for h in p.headings if re.search(re.escape(nm), h[1], re.I)), None)
            where = f"after the H2 '{h[1][:60]}'" if h else "after the first substantive mention"
            self.add(p, "cta-missing", "revenue", sev, f"{nm} is discussed {n}× but has no affiliate CTA in this post (tracked link exists).",
                     f"Add a CTA {where}.", "S", where=where, key=slug,
                     snippet=f"<a href=\"${{AFFILIATE_LINKS['{slug}']}}\" target=\"_blank\" rel=\"sponsored nofollow noopener noreferrer\">Try {nm} →</a>")
        if kind in ("roundup", "comparison", "alternatives", "pricing", "review") and n_aff == 0 and not p.template_cta:
            tr = [s for s in p.tools_mentioned if site.is_tracked(site.aff_links.get(s, ""))]
            if len(tr) >= 2:
                self.add(p, "cta-none", "revenue", "critical", f"Transactional '{kind}' post with ZERO affiliate links although {len(tr)} mentioned tools have tracked links ({', '.join(tr[:4])}).",
                         "Add CTAs for the top tools (see per-tool snippets) + a disclosure.", "M", key="none")

    # ---- AI citations -----------------------------------------------------
    def geo(self, p):
        kind = post_kind(p)
        qa = p.quick_answer
        if not qa:
            self.add(p, "qa-missing", "ai", "high" if kind != "article" else "medium", "No quickAnswer — the single most-cited block by AI engines & featured snippets.",
                     "Write a 40-60 word direct answer: '<Winner> is best for <use case> ...'.", "S")
        else:
            n = len(words_of(qa))
            if n < 30 or n > 85: self.add(p, "qa-length", "ai", "low", f"quickAnswer is {n} words (ideal 40-60).", "Tighten/expand to 40-60 words.", "S", snippet=qa[:200], key=str(n))
        # T2: the quickAnswer / answer-blocks box is rendered with data-speakable="quick-answer" by
        # BlogPostPage.tsx and prerender.mjs, and the Speakable schema targets it. Only flag posts with no such box.
        has_rendered_qa = bool(qa) or bool((self.site.answer_blocks.get(p.slug) or {}).get("answer"))
        if "data-speakable" not in p.content and not has_rendered_qa: self.add(p, "speakable", "ai", "low", "No data-speakable block in content.", "Wrap the quick answer in data-speakable=\"quick-answer\".", "S")
        need = 5 if kind in ("roundup", "comparison", "alternatives", "pricing", "review") else 3
        f = p.faqs
        if len(f) < 3: self.add(p, "faq-few", "ai", "high", f"Only {len(f)} FAQ(s).", f"Add FAQs to reach {need}+ (use real 'People also ask' queries).", "M", key=str(len(f)))
        elif len(f) < need: self.add(p, "faq-below-target", "ai", "medium", f"{len(f)} FAQs; target ≥{need} for '{kind}'.", "Add 'People also ask' questions with concise answers.", "M", key=str(len(f)))
        thin = [q for q, a in f if len(words_of(a)) < 25]
        fat = [q for q, a in f if len(words_of(a)) > 130]
        if thin: self.add(p, "faq-thin", "ai", "low", f"{len(thin)} FAQ answer(s) under 25 words.", "Aim for 40-90 words: direct answer first, one supporting fact.", "S", key=str(len(thin)), snippet=thin[0])
        if fat: self.add(p, "faq-bloated", "ai", "low", f"{len(fat)} FAQ answer(s) over 130 words.", "Lead with a 1-2 sentence answer; trim the rest.", "S", key=str(len(fat)), snippet=fat[0])
        nq = [q for q, _ in f if not q.strip().endswith("?") or not q.lower().startswith(QUESTION_STEMS)]
        if nq: self.add(p, "faq-format", "ai", "low", f"{len(nq)} FAQ question(s) aren't natural-language questions.", "Start with Who/What/How/Is/Can/Does/Which and end with ?", "S", key=str(len(nq)), snippet=nq[0])
        qs = Counter(q.lower().strip() for q, _ in f)
        if any(n > 1 for n in qs.values()): self.add(p, "faq-dupe", "ai", "low", "Duplicate FAQ questions in this post.", "Remove duplicates.", "S")
        if kind in ("roundup", "comparison", "alternatives", "review", "pricing") and not re.search(r"<table", p.content, re.I):
            self.add(p, "no-table", "ai", "medium", "No comparison table — tables are the most extractable format for AI answers.", "Add a feature/price table within the first third.", "M")
        elif re.search(r"<table", p.content, re.I):
            tpos = re.search(r"<table", p.content, re.I).start() / max(1, len(p.content))
            if tpos > 0.35: self.add(p, "table-late", "ai", "low", f"First table is at {int(tpos * 100)}% of the post.", "Move a summary table into the first 35%.", "S", key=str(int(tpos * 10)))
        verdicts = len(DECISION_RE.findall(p.text))
        if kind in ("roundup", "comparison", "alternatives", "review") and verdicts < 4:
            self.add(p, "verdicts-few", "ai", "medium", f"Only {verdicts} explicit decision statements ('use X if…', 'skip X if…').", "Add a 'Who should pick what' block — LLMs quote explicit verdicts verbatim.", "S", key=str(verdicts),
                     snippet="<li><strong>Choose <Tool A></strong> if <specific need>. <strong>Skip it</strong> if <deal-breaker>.</li>")
        if not p.my_take and kind in ("roundup", "comparison", "review", "alternatives"):
            self.add(p, "mytake-missing", "ai", "low", "No myTake (labelled first-person expert opinion is a citation signal).", "Add 1-2 sentences of honest, specific opinion.", "S")
        if not p.citations: self.add(p, "no-citations", "ai", "medium", "outboundCitations is empty (no 'Sources' block).", "List official pricing/docs pages used.", "S")
        wc = p.wordcount_field
        if wc and abs(p.words - wc) / max(1, p.words) > 0.2:
            self.add(p, "wordcount-drift", "ai", "low", f"wordCount field says {wc} but the post has ~{p.words} words (Article schema mismatch).", f"Set wordCount: {p.words}.", "S", key=str(p.words // 100))
        if not p.faqs and not qa: pass

    # ---- reader value -----------------------------------------------------
    def reader(self, p):
        kind = post_kind(p)
        thr = MIN_WORDS[kind]
        if p.words < thr * 0.6:
            self.add(p, "thin", "reader", "high", f"{p.words} words is thin for a '{kind}' (≈{thr}+ expected to compete).", "Add original analysis: pricing table, who-it's-for, limits, alternatives.", "L", key=kind)
        elif p.words < thr:
            self.add(p, "short", "reader", "medium", f"{p.words} words; competitive '{kind}' posts run ≈{thr}+.", "Deepen the weakest sections rather than padding.", "M", key=kind)
        first = " ".join(words_of(p.text)[:60]).lower()
        for pat in FILLER_OPENERS:
            if re.search(pat, first):
                self.add(p, "filler-opener", "reader", "medium", "Generic AI-sounding opener.", "Open with the answer or a specific, concrete fact.", "S", snippet=p.text[:160], key=pat); break
        body = strip_tables(p.content)
        txt = strip_tags(body)
        fl = flesch(txt)
        if fl < 45: self.add(p, "readability", "reader", "high", f"Flesch reading ease {fl:.0f} (target ≥55-60).", "Split sentences >25 words; swap multisyllabic words.", "M", key=str(int(fl // 5)))
        elif fl < 55: self.add(p, "readability", "reader", "medium", f"Flesch reading ease {fl:.0f} (target ≥55-60).", "Split sentences >25 words; swap multisyllabic words.", "M", key=str(int(fl // 5)))
        ss = sentences_of(txt)
        long_s = sorted((s for s in ss if len(words_of(s)) > 40), key=lambda s: -len(words_of(s)))
        if len(long_s) >= 3:
            self.add(p, "long-sentences", "reader", "medium", f"{len(long_s)} sentences exceed 40 words.", "Split them (longest shown).", "M", snippet=long_s[0][:260], key=str(len(long_s)))
        paras = [strip_tags(m) for m in re.findall(r"<p[^>]*>(.*?)</p>", body, re.S | re.I)]
        big = [x for x in paras if len(words_of(x)) > 100]
        if len(big) >= 2: self.add(p, "long-paragraphs", "reader", "low", f"{len(big)} paragraphs over 100 words.", "Break into 2-3 sentence paragraphs.", "S", snippet=big[0][:160], key=str(len(big)))
        # scan-ability: long runs with no heading/list/table
        segs = re.split(r"<h[1-6][ >]", p.content)
        runs = [len(words_of(strip_tags(s))) for s in segs]
        longest = max(runs) if runs else 0
        if longest > 500: self.add(p, "wall-of-text", "reader", "medium", f"A section runs {longest} words without a heading.", "Insert an H3, list or table.", "S", key=str(longest // 100))
        lists = len(re.findall(r"<(?:ul|ol)\b", p.content, re.I))
        if p.words > 1000 and lists < 2: self.add(p, "few-lists", "reader", "low", f"Only {lists} list(s) in {p.words} words.", "Convert enumerations into bullet/numbered lists.", "S", key=str(lists))
        anchors = [l for l in p.links if l["href"].startswith("#")]
        # T1: the renderer adds an "In this article" jump list to any post with 3+ H2s.
        h2_count = len(re.findall(r"<h2\b", p.content, re.I))
        if p.words > 2500 and not anchors and h2_count < 3: self.add(p, "no-toc", "reader", "low", "Long post without a table of contents / jump links.", "Add a 'Jump to' list linking to H2 ids.", "S")
        if kind in ("roundup", "comparison", "alternatives", "review") and not re.search(r"\b(?:cons|downsides?|limitations?|drawbacks?|who should (?:not|skip)|not for|skip (?:it|this) if)\b", p.text, re.I) and not p.has_proscons:
            self.add(p, "no-negatives", "trust", "high", "No cons/limitations anywhere — reads as a pure affiliate pitch.", "Add 'Cons / who should skip' per tool; balanced reviews convert and rank better.", "M")
        slop = []
        for pat in AI_SLOP:
            for m in re.finditer(pat, p.text, re.I): slop.append((m.group(0).lower(), snippet_around(p.text, m, 45)))
        dens = len(slop) / max(1, p.words) * 1000
        if dens > 2.5:
            top = Counter(s[0] for s in slop).most_common(4)
            self.add(p, "ai-slop", "reader", "high" if dens > 5 else "medium", f"{len(slop)} clichéd/AI-sounding phrases ({dens:.1f}/1000 words): {', '.join(f'{k}×{v}' for k, v in top)}.",
                     "Rewrite with concrete nouns, numbers and named examples (Helpful Content / 'scaled content' risk).", "M", snippet=slop[0][1], key=str(int(dens)))
        if PLACEHOLDER_RE.search(p.text):
            m = PLACEHOLDER_RE.search(p.text)
            self.add(p, "placeholder", "reader", "critical", f"Placeholder text found ('{m.group(0)}').", "Replace with real content before it ships — placeholders in tables drive bounces.", "S", snippet=snippet_around(p.text, m), key=m.group(0).lower())
        empt = len(re.findall(r"<td[^>]*>\s*(?:—|-|–|N/?A|\?)?\s*</td>", p.content, re.I))
        if empt >= 3: self.add(p, "table-empty-cells", "reader", "high", f"{empt} empty or N/A table cells.", "Fill them with verified data or remove the row/column.", "S", key=str(empt))

    # ---- trust ------------------------------------------------------------
    def trust(self, p):
        claims = []
        for pat in EXPERIENCE_CLAIMS:
            for m in re.finditer(pat, p.text, re.I):
                pre = p.text[max(0, m.start() - 22): m.start()].lower()
                if re.search(r"\b(?:not|no|never|without|didn'?t|haven'?t)\b", pre): continue
                claims.append((m.group(0), snippet_around(p.text, m, 60)))
        if claims:
            strong = any(re.match(r"(?:i|we)\b", c[0].lower()) for c in claims)
            self.add(p, "claims-tested", "trust", "high" if strong else "medium", f"{len(claims)} first-hand testing claim(s) ('{claims[0][0]}'). AI Nexus reviews are research-based; unverifiable experience claims are a trust & policy risk.",
                     "Reword to 'based on vendor documentation, pricing pages and G2/Trustpilot data', or add proof (screenshots, dated test logs).", "S", snippet=claims[0][1], key=str(len(claims)))
        vague = [m for pat in VAGUE_CLAIMS for m in re.finditer(pat, p.text, re.I)]
        if vague: self.add(p, "claims-vague", "trust", "low", f"{len(vague)} vague appeal-to-authority phrase(s) with no source.", "Name the source and link it, or cut the claim.", "S", snippet=snippet_around(p.text, vague[0]), key=str(len(vague)))
        hype = [m for pat in HYPE_CLAIMS for m in re.finditer(pat, p.text, re.I)]
        if hype: self.add(p, "claims-hype", "trust", "low", f"{len(hype)} absolute/hype claim(s) ('{hype[0].group(0)}').", "Replace with a measurable, sourced statement.", "S", snippet=snippet_around(p.text, hype[0]), key=str(len(hype)))
        if not re.search(r"/methodology|/how-we-analy|/editorial-policy|research basis|how we (?:research|review|pick|rank)", p.content, re.I):
            self.add(p, "no-methodology", "trust", "low", "No link/mention of your methodology or research basis.", "Add 'How we research' with a link to /methodology/.", "S")
        if not re.search(r"\bnavneet\b", p.author_probe(), re.I):
            pass
        # price claims extraction for site-wide consistency
        for s in sentences_of(p.text):
            ts = [t for t in p.tools_mentioned if any(a.search(s) for a in self.site._pats.get(t, []))]
            if len(ts) != 1: continue
            for m in re.finditer(r"\$\s?(\d+(?:\.\d{1,2})?)\s*(?:/|per|a)\s*(?:mo\b|month)", s, re.I):
                self.site.price_claims[ts[0]].append((p.slug, float(m.group(1)), s[:200]))

    # ---- integrity --------------------------------------------------------
    def integrity(self, p):
        if "UNDEFINED-AFFILIATE-KEY" in p.content: pass
        if not p.raw.strip().endswith(("};", "export default post;", "export default post")) and "export default" not in p.raw:
            self.add(p, "no-export", "reader", "critical", "File has no default export — the post won't load.", "Add 'export default post;'.", "S")
        if not get_field(p.raw, "author"):
            self.add(p, "author-missing", "trust", "medium", "No author field (byline/Person schema).", "Set author: 'Navneet Arya'.", "S")
        if not get_field(p.raw, "ogImage"):
            self.add(p, "og-missing", "organic", "low", "No ogImage (weak social/AI link previews).", "Add an OG image.", "S")
        if not get_field(p.raw, "excerpt"):
            self.add(p, "excerpt-missing", "organic", "low", "No excerpt.", "Add a 1-2 sentence excerpt for cards/feeds.", "S")


def _author_probe(self): return get_field(self.raw, "author")
Post.author_probe = _author_probe


# ───────────────────────────── site-wide analysis ─────────────────────────────
SEV_IMPACT = {"critical": 10, "high": 6, "medium": 3, "low": 1}
AI_RETRIEVAL_BOTS = ["OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Perplexity-User", "Claude-SearchBot", "Claude-User", "DuckAssistBot", "Googlebot", "Bingbot"]
AI_TRAINING_BOTS = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "anthropic-ai"]


def site_issue(site, code, pillar, sev, msg, fix="", effort="M", where="", snippet="", key=""):
    site.site_issues.append(Issue(code, pillar, sev, msg, fix, effort, "", where, snippet, key or msg[:60]))


def build_graph(site):
    posts = site.posts
    out = {s: set() for s in posts}
    for s, p in posts.items():
        for l in p.links:
            m = re.match(r"/blog/([^/?#]+)", l["href"])
            if m and m.group(1) in posts and m.group(1) != s: out[s].add(m.group(1))
        for t in site.related_posts.get(s, []):                      # rendered by BlogPostPage.tsx
            if t in posts and t != s: out[s].add(t)
    inb = defaultdict(set)
    for s, ts in out.items():
        for t in ts: inb[t].add(s)
    n = len(posts)
    pr = {s: 1 / n for s in posts}
    for _ in range(40):
        new = {s: 0.15 / n for s in posts}
        for s in posts:
            tg = out[s]
            if tg:
                share = 0.85 * pr[s] / len(tg)
                for t in tg: new[t] += share
            else:
                for t in posts: new[t] += 0.85 * pr[s] / n
        pr = new
    blob = read(site.root / "constants.ts") + "".join(read(f) for f in (site.root / "pages").glob("*.tsx") if f.name != "BlogPostPage.tsx") + read(site.root / "App.tsx")
    for s, p in posts.items():
        p.inbound, p.pagerank = len(inb[s]), pr[s]
        p.other_refs = blob.count(f"/blog/{s}") + blob.count(f"'{s}'")
    return out, inb


def revenue_potential(site, p):
    return sum(min(n, 10) for s, n in p.tools_mentioned.items() if site.is_tracked(site.aff_links.get(s, "")))


def set_importance(site, traffic=None):
    posts = site.posts
    mpr = max((p.pagerank for p in posts.values()), default=1) or 1
    rp = {s: revenue_potential(site, p) for s, p in posts.items()}
    mrp = max(rp.values(), default=1) or 1
    for s, p in posts.items():
        p.importance = 0.6 + (p.pagerank / mpr) + 1.2 * (rp[s] / mrp) + (0.4 if p.intent == "transactional" else 0)
        if traffic:
            share = traffic.get(s, 0) / max(traffic.values())
            p.importance *= 0.7 + math.sqrt(share)


def relevance(site, a: Post, b: Post) -> float:
    shared = [t for t, n in a.tools_mentioned.items() if n >= 2 and b.tools_mentioned.get(t, 0) >= 2]
    kt = keyword_tokens(a.target_keyword or a.slug) & keyword_tokens(b.target_keyword or b.slug)
    return 2 * len(shared) + len(kt) + (1 if a.category and a.category == b.category else 0)


def site_analysis(site: Site, A: Analyzer):
    posts = site.posts
    out, inb = build_graph(site)
    prs = sorted(p.pagerank for p in posts.values())
    median_pr = prs[len(prs) // 2] if prs else 0
    # orphans / weak / under-linked money pages (per-post issues so they affect scores)
    for s, p in posts.items():
        if p.inbound > 2: continue
        cands = sorted(((relevance(site, p, q), q) for qs, q in posts.items() if qs != s and s not in out[qs]), key=lambda x: -x[0])
        cands = [(sc, q) for sc, q in cands if sc >= 3][:3]
        anchor = p.target_keyword or short_title(p)
        snip = "\n".join(f"In blog/{q.slug}.ts add: <a href=\"/blog/{s}/\">{anchor}</a>" for _, q in cands)
        if p.inbound == 0 and p.other_refs == 0:
            A.add(p, "orphan", "organic", "high", "Orphan page: no post, related-posts module, tool page or hub links to it (Google finds it only via sitemap; zero internal authority).",
                  "Add contextual links from the most related posts, and add it to BLOG_RELATED_POSTS in BlogPostPage.tsx.", "S", snippet=snip, key="0")
        elif p.inbound == 0:
            A.add(p, "no-post-links", "organic", "medium", f"No other post links to it (only {p.other_refs} reference(s) from tool/hub pages).",
                  "Add contextual links from the most related posts and list it in BLOG_RELATED_POSTS.", "S", snippet=snip, key="0")
        else:
            A.add(p, "weak-inbound", "organic", "medium", f"Only {p.inbound} post(s) link here.", "Add 2-3 contextual links from related posts.", "S", snippet=snip, key=str(p.inbound))
    set_importance(site, getattr(site, "traffic", None))
    for s, p in posts.items():
        if p.intent == "transactional" and revenue_potential(site, p) >= 12 and p.pagerank < median_pr and p.inbound <= 2:
            A.add(p, "money-underlinked", "revenue", "medium", "High-revenue-potential page with below-median internal authority.", "Link to it from your highest-PageRank posts with keyword-rich anchors.", "S", key="pr")
    # duplicate titles / metas
    for fld, label in (("seo_title", "seoTitle"), ("meta", "metaDescription"), ("title", "title")):
        g = defaultdict(list)
        for p in posts.values():
            if getattr(p, fld): g[re.sub(r"\W+", " ", getattr(p, fld).lower()).strip()].append(p.slug)
        for k, v in g.items():
            if len(v) > 1:
                site_issue(site, f"dup-{label}", "organic", "high", f"Identical {label} on {len(v)} posts: {', '.join(v[:4])}.", f"Make every {label} unique and intent-specific.", "S", key="|".join(sorted(v)))
    # keyword cannibalisation
    slugs = list(posts)
    for i in range(len(slugs)):
        a = posts[slugs[i]]
        ka = keyword_tokens(a.target_keyword or a.slug.replace("-", " "))
        for j in range(i + 1, len(slugs)):
            b = posts[slugs[j]]
            if post_kind(a) != post_kind(b): continue
            kb = keyword_tokens(b.target_keyword or b.slug.replace("-", " "))
            if len(ka) < 3 or len(kb) < 3: continue
            jac = len(ka & kb) / len(ka | kb)
            if jac >= 0.7:
                site_issue(site, "cannibalisation", "organic", "medium", f"Likely keyword cannibalisation ({int(jac * 100)}% term overlap): {a.slug}  ↔  {b.slug}.",
                           "Differentiate intent (e.g. free vs paid, India vs global, beginners vs pros), merge + 301, or cross-link with a clear 'see also' hierarchy.", "L",
                           where=f"{a.slug} / {b.slug}", key="|".join(sorted((a.slug, b.slug))))
    # repeated FAQ questions
    fq = defaultdict(set)
    for p in posts.values():
        for q, _ in p.faqs: fq[re.sub(r"\W+", " ", q.lower()).strip()].add(p.slug)
    rep = sorted(((len(v), q) for q, v in fq.items() if len(v) >= 4), reverse=True)
    if rep:
        site_issue(site, "faq-repeated", "ai", "low", f"{len(rep)} FAQ question(s) reused on ≥4 posts (e.g. '{rep[0][1][:70]}' ×{rep[0][0]}) — duplicate answers dilute citations.",
                   "Keep each FAQ on the single most relevant post; link from the others.", "M", key=str(len(rep)))
    # tool funnel
    linked_tools, mention_posts = Counter(), defaultdict(list)
    for p in posts.values():
        seen = {m.group(1) for l in p.links for m in [re.match(r"/tools/([^/?#]+)", l["href"])] if m}
        seen |= set(site.related_tools.get(p.slug, []))
        linked_tools.update(seen)
        for t, n in p.tools_mentioned.items():
            if n >= 2: mention_posts[t].append((n, p.slug))
    opp = []
    for slug, t in site.tools.items():
        mp = mention_posts.get(slug, [])
        tracked = site.is_tracked(site.aff_links.get(slug, ""))
        total = sum(n for n, _ in mp)
        opp.append({"slug": slug, "name": t["name"], "has_page": t["has_page"], "tracked": tracked, "link": site.aff_links.get(slug, ""),
                    "posts": len(mp), "mentions": total, "blog_links_to_page": linked_tools.get(slug, 0)})
    site.tool_table = sorted(opp, key=lambda x: -x["mentions"])
    for o in site.tool_table:
        if o["tracked"] and o["has_page"] and o["blog_links_to_page"] == 0 and o["posts"] >= 1:
            site_issue(site, "tool-page-no-inbound", "revenue", "medium", f"/tools/{o['slug']}/ (tracked affiliate) is discussed in {o['posts']} post(s) but no blog post links to it.",
                       "Link the first mention of the tool to its review page.", "S", key=o["slug"])
    untracked = [o for o in site.tool_table if not o["tracked"] and o["mentions"] >= 8 and o["slug"] not in ("chatgpt", "claude", "gemini", "copilot", "notebooklm", "google-gemini")]
    if untracked:
        top = ", ".join(f"{o['name']} ({o['mentions']}×/{o['posts']} posts)" for o in untracked[:6])
        site_issue(site, "untracked-tools", "revenue", "medium", f"Heavily-mentioned tools with NO tracked affiliate link: {top}.",
                   "Check each vendor for an affiliate/partner program (Impact, PartnerStack, FirstPromoter, direct); apply, then add the link in constants.ts.", "M", key=",".join(o["slug"] for o in untracked[:6]))
    nopage = [o for o in site.tool_table if o["tracked"] and not o["has_page"] and o["mentions"] >= 8]
    if nopage:
        site_issue(site, "tracked-no-page", "revenue", "low", "Tracked-affiliate tools mentioned often but without a /tools/ review page: " + ", ".join(f"{o['name']} ({o['mentions']}×)" for o in nopage[:6]),
                   "A dedicated review page gives the blog a conversion destination and a rankable entity page.", "L", key=",".join(o["slug"] for o in nopage[:6]))
    # price consistency — flag "near-miss" starting prices (e.g. $9 vs $10, $19.99 vs $20): same tier quoted differently.
    site.price_conflicts = []
    for tool, claims in site.price_claims.items():
        per_post = defaultdict(set)
        for slug, price, sent in claims: per_post[slug].add(price)
        if len(per_post) < 3: continue
        mins = {s: min(v) for s, v in per_post.items()}
        modal, _ = Counter(mins.values()).most_common(1)[0]
        bad = {s: m for s, m in mins.items() if m != modal and modal not in per_post[s] and abs(m - modal) / modal <= 0.6}
        if bad:
            by = defaultdict(list)
            for s, m in bad.items(): by[f"${m:g}"].append(s)
            site.price_conflicts.append({"tool": site.tools[tool]["name"], "slug": tool, "modal": f"${modal:g}", "prices": {f"${modal:g} (most common)": sorted(s for s, m in mins.items() if m == modal)[:8], **by}})
    for pc in site.price_conflicts[:25]:
        odd = "; ".join(f"{k} in {', '.join(v[:3])}" for k, v in pc["prices"].items() if "most common" not in k)
        site_issue(site, "price-inconsistent", "trust", "medium", f"{pc['tool']}: most posts say {pc['modal']}/mo but others differ — {odd}.",
                   "Verify the current price on the vendor's page, then align every post (label annual-vs-monthly differences).", "S", where=odd, key=pc["slug"])
    # crawler & feed coverage
    pub = site.root / "public"
    robots = read(pub / "robots.txt")
    groups, cur, in_rules = {}, [], False
    for line in robots.splitlines():
        line = line.split("#")[0].strip()
        if not line or ":" not in line: continue
        k, _, v = line.partition(":")
        k, v = k.strip().lower(), v.strip()
        if k == "user-agent":
            if in_rules: cur, in_rules = [], False
            cur.append(v.lower()); groups.setdefault(v.lower(), [])
        elif k in ("allow", "disallow") and cur:
            in_rules = True
            for a in cur: groups[a].append((k, v))
    def blocked(bot):
        rules = groups.get(bot.lower()) or groups.get("*", [])
        return any(k == "disallow" and v == "/" for k, v in rules) and not any(k == "allow" and v == "/" for k, v in rules)
    if robots:
        bl = [b for b in AI_RETRIEVAL_BOTS if blocked(b)]
        if bl: site_issue(site, "robots-blocks-ai", "ai", "high", f"robots.txt blocks citation/search crawlers: {', '.join(bl)}.", "Allow them — blocked retrieval bots can never cite you.", "S", key=",".join(bl))
        tr = [b for b in AI_TRAINING_BOTS if blocked(b)]
        if tr: site_issue(site, "robots-blocks-training", "ai", "low", f"robots.txt blocks AI training/grounding crawlers: {', '.join(tr)} (a policy choice; note it can reduce inclusion in some AI products).", "Confirm this is intentional.", "S", key=",".join(tr))
        if not re.search(r"^sitemap:", robots, re.I | re.M): site_issue(site, "robots-no-sitemap", "organic", "medium", "robots.txt has no Sitemap: directive.", "Add Sitemap: https://ainexustools.online/sitemap.xml", "S")
    else:
        site_issue(site, "robots-missing", "organic", "medium", "public/robots.txt not found.", "Add one.", "S")
    for fname, label in (("llms.txt", "llms.txt"), ("llms-full.txt", "llms-full.txt"), ("rss.xml", "rss.xml")):
        txt = read(pub / fname)
        if not txt: continue
        # rss.xml is regenerated from BLOG_POSTS on every build (scripts/prerender.mjs → dist/rss.xml); the copy in public/ is only a stale placeholder
        if fname == "rss.xml" and "generateRssFeed" in read(site.root / "scripts" / "prerender.mjs"): continue
        missing = [s for s in posts if s not in txt]
        if missing and len(missing) / len(posts) > 0.05:
            site_issue(site, f"coverage-{label}", "ai", "medium" if label != "rss.xml" else "low", f"{len(missing)}/{len(posts)} posts are absent from {label}: {', '.join(missing[:5])}{'…' if len(missing) > 5 else ''}.",
                       f"Regenerate {label} (scripts/generate-llms-full.mjs) so new posts are discoverable by AI crawlers/feeds.", "S", key=f"{label}:{len(missing)}")
    return out, inb


# ───────────────────────────── scoring ─────────────────────────────
PEN = {"critical": 30, "high": 15, "medium": 7, "low": 2.5}


def grade(s):
    for t, g in ((97, "A+"), (93, "A"), (90, "A-"), (86, "B+"), (82, "B"), (78, "B-"), (72, "C+"), (66, "C"), (55, "D")):
        if s >= t: return g
    return "F"


def score_all(site: Site, weights: dict):
    for p in site.posts.values():
        sc = {}
        for pil in PILLARS:
            pen, seen = 0.0, Counter()
            for i in p.issues:
                if i.pillar != pil: continue
                pen += PEN[i.severity] * (0.65 ** seen[i.code])
                seen[i.code] += 1
            sc[pil] = max(0.0, 100 - pen)
        p.scores = sc
        p.total = sum(sc[k] * weights[k] for k in PILLARS) / sum(weights.values())
    for i in site.site_issues:
        i.priority = round(SEV_IMPACT[i.severity] * 2.0 * (weights[i.pillar] / 20) / EFFORT_COST[i.effort], 2)
    for p in site.posts.values():
        for i in p.issues:
            i.priority = round(SEV_IMPACT[i.severity] * p.importance * (weights[i.pillar] / 20) / EFFORT_COST[i.effort], 2)


def all_issues(site):
    return [i for p in site.posts.values() for i in p.issues] + site.site_issues


# ───────────────────────────── live checks ─────────────────────────────
class Fetcher:
    UA = "Mozilla/5.0 (compatible; AINexusBlogAnalyzer/1.0; +https://ainexustools.online)"

    def __init__(self, cache_path, ttl_h=24, timeout=12, workers=10, host_delay=0.6):
        import threading
        self.cache_path, self.ttl, self.timeout, self.workers, self.delay = Path(cache_path), ttl_h * 3600, timeout, workers, host_delay
        self.cache = {}
        try: self.cache = json.loads(self.cache_path.read_text())
        except Exception: pass
        self.lock, self.host_t, self.host_locks = threading.Lock(), {}, defaultdict(threading.Lock)
        self.opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler())

    def _wait(self, host):
        with self.host_locks[host]:
            last = self.host_t.get(host, 0)
            gap = self.delay - (time.time() - last)
            if gap > 0: time.sleep(gap)
            self.host_t[host] = time.time()

    BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

    def _opener(self, insecure=False):
        if not insecure: return self.opener
        import ssl
        ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
        return urllib.request.build_opener(urllib.request.HTTPRedirectHandler(), urllib.request.HTTPSHandler(context=ctx))

    def _req(self, url, method, browser=False, insecure=False):
        self._wait(host_of(url))
        req = urllib.request.Request(url, method=method, headers={"User-Agent": self.BROWSER_UA if browser else self.UA, "Accept": "text/html,application/xhtml+xml,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.9"})
        try:
            with self._opener(insecure).open(req, timeout=self.timeout) as r:
                body = r.read(250_000) if method == "GET" else b""
                return r.status, r.geturl(), body, ""
        except urllib.error.HTTPError as e:
            try: body = e.read(60_000) if method == "GET" else b""
            except Exception: body = b""
            return e.code, e.geturl() or url, body, ""
        except Exception as e:
            return 0, url, b"", f"{type(e).__name__}: {str(e)[:90]}"

    def fetch(self, url, body=False):
        key = ("B|" if body else "H|") + url
        hit = self.cache.get(key)
        if hit and time.time() - hit["ts"] < self.ttl: return hit
        t0 = time.time()
        st, final, data, err = self._req(url, "GET" if body else "HEAD")
        if not body and (st == 0 or st >= 400):
            st, final, data, err = self._req(url, "GET")
        if st == 0 and not err.startswith("HTTP"):  # one retry for flaky networks
            time.sleep(1.0); st, final, data, err = self._req(url, "GET")
        # Connection reset / dropped by the server → many sites (and Impact/affiliate trackers) block non-browser UAs
        if st == 0 and re.search(r"10054|forcibly closed|reset by peer|RemoteDisconnected|EOF occurred|Connection aborted", err, re.I):
            st, final, data, err = self._req(url, "GET", browser=True)
        # Local certificate-store problems (common on Windows, and on gov.in sites with incomplete chains):
        # retry without verification purely to learn whether the page is alive. Browsers handle these fine.
        if st == 0 and "CERTIFICATE_VERIFY_FAILED" in err:
            st2, final2, data2, err2 = self._req(url, "GET", browser=True, insecure=True)
            if st2:  # page is alive; cert chain is only a local-trust problem
                st, final, data, err = st2, final2, data2, ""
        text = data.decode("utf-8", errors="replace") if data else ""
        res = {"url": url, "status": st, "final": final, "error": err, "ms": int((time.time() - t0) * 1000), "ts": time.time(),
               "text": strip_tags(text)[:60000] if body else "", "title": (re.search(r"<title[^>]*>(.*?)</title>", text, re.S | re.I) or [None, ""])[1].strip()[:140] if text else ""}
        with self.lock: self.cache[key] = res
        return res

    def save(self):
        try: self.cache_path.write_text(json.dumps(self.cache))
        except OSError: pass

    def many(self, jobs, label):
        """jobs: list of (url, body). returns {url: result}"""
        results, done = {}, 0
        with ThreadPoolExecutor(max_workers=self.workers) as ex:
            futs = {ex.submit(self.fetch, u, b): u for u, b in jobs}
            for f in as_completed(futs):
                u = futs[f]
                try: results[u] = f.result()
                except Exception as e: results[u] = {"url": u, "status": 0, "final": u, "error": str(e)[:80], "text": "", "title": ""}
                done += 1
                if done % 10 == 0 or done == len(jobs): print(f"\r  {label}: {done}/{len(jobs)}", end="", file=sys.stderr, flush=True)
        print(file=sys.stderr)
        return results


DEAD_BODY = re.compile(r"(?:link (?:is )?(?:no longer|not) (?:active|available|valid)|invalid (?:link|tracking|campaign)|program (?:has )?(?:ended|closed|is (?:not|no longer) active)|campaign (?:has )?(?:ended|expired)|page (?:could )?not (?:be )?found|404)", re.I)


def run_live(site: Site, A: Analyzer, args):
    f = Fetcher(args.cache, args.cache_ttl, args.timeout, args.workers)
    posts = site.posts
    out_urls, aff_urls, price_pages = defaultdict(set), defaultdict(set), {}
    own = host_of(SITE)
    for s, p in posts.items():
        labels = dict(re.findall(r"url:\s*'([^']+)'\s*,\s*label:\s*'((?:[^'\\]|\\.)*)'", p.raw))
        for u in p.citations:
            out_urls[u].add(s)
            if re.search(r"pric|plans|buy", u, re.I): price_pages[(s, u)] = labels.get(u, "")
        for l in p.links:
            h = l["href"]
            if not h.startswith("http") or host_of(h) == own: continue
            (aff_urls if site.is_affiliate_href(h) else out_urls)[h].add(s)
    for k, u in site.aff_links.items():
        if site.is_tracked(u): aff_urls[u]  # ensure checked even if unused
    jobs_out = [(u, False) for u in out_urls]
    jobs_aff = [(u, True) for u in aff_urls]
    pricing_urls = sorted({u for (_, u) in price_pages})
    print(f"Live checks: {len(jobs_out)} outbound, {len(jobs_aff)} affiliate, {len(pricing_urls)} pricing pages", file=sys.stderr)
    r_out = f.many(jobs_out, "outbound links")
    r_aff = f.many(jobs_aff, "affiliate links")
    r_pr = f.many([(u, True) for u in pricing_urls], "pricing pages") if not args.no_pricing else {}
    f.save()
    live = {"outbound": [], "affiliate": [], "pricing": []}
    tool_by_url = defaultdict(list)
    for k, u in site.aff_links.items(): tool_by_url[u].append(k)
    for u, r in r_out.items():
        st, ps = r["status"], sorted(out_urls[u])
        cls = "ok"
        err_l = (r["error"] or "").lower()
        if st == 0 and any(k in err_l for k in ("forcibly closed", "connection reset", "10054", "errno 104")): cls = "blocked"  # server drops scripted clients: bot-block, not a dead page
        elif st in (404, 410) or (st == 0 and "timed out" not in err_l): cls = "broken"
        elif st == 0: cls = "timeout"
        elif st >= 500: cls = "server-error"
        elif st in (401, 403, 429, 999): cls = "blocked"
        elif 200 <= st < 400:
            o, fin = urlparse(u), urlparse(r["final"])
            if o.path.strip("/") and not fin.path.strip("/") and reg_domain(host_of(u)) == reg_domain(host_of(r["final"])): cls = "redirect-home"
            elif reg_domain(host_of(u)) != reg_domain(host_of(r["final"])): cls = "redirect-domain"
        live["outbound"].append({"url": u, "status": st, "final": r["final"], "class": cls, "posts": ps, "error": r["error"]})
        for s in ps:
            p = posts[s]
            if cls == "broken": A.add(p, "live-broken-link", "trust", "high", f"Dead outbound link ({st or r['error']}): {u[:90]}", "Replace with the current URL or remove the claim it supports.", "S", snippet=u, key=u, live=True)
            elif cls == "server-error": A.add(p, "live-link-5xx", "trust", "low", f"Outbound link returns {st}: {u[:90]}", "Re-check; remove if it stays down.", "S", key=u, live=True)
            elif cls == "redirect-home": A.add(p, "live-link-home", "trust", "medium", f"Link now redirects to the vendor homepage (content moved): {u[:80]}", "Find the new URL of that page.", "S", snippet=r["final"], key=u, live=True)
            elif cls == "redirect-domain": A.add(p, "live-link-domain", "trust", "low", f"Link redirects to a different domain ({host_of(r['final'])}): {u[:70]}", "Update to the new canonical URL (company renamed/acquired?).", "S", snippet=r["final"], key=u, live=True)
    for u, r in r_aff.items():
        st, ps = r["status"], sorted(aff_urls.get(u, []))
        txt = f"{r['title']} {r['text'][:3000]}"
        fin_host = host_of(r["final"])
        cls = "ok"
        if st == 0: cls = "unreachable"
        elif st in (404, 410) or st >= 500: cls = "dead"
        elif any(fin_host.endswith(d) for d in IMPACT_DOMAINS) or fin_host.endswith("impact.com") or fin_host.endswith("partnerstack.com"): cls = "stuck-at-tracker"
        elif DEAD_BODY.search(r["title"]) or DEAD_BODY.search(r["text"][:1500]): cls = "dead-page"
        elif st in (401, 403, 429): cls = "blocked"
        live["affiliate"].append({"url": u, "tools": tool_by_url.get(u, []), "status": st, "final": r["final"], "class": cls, "posts": ps, "title": r["title"]})
        if cls in ("dead", "stuck-at-tracker", "dead-page", "unreachable"):
            names = ", ".join(tool_by_url.get(u, [])[:3]) or "unknown"
            msg = {"dead": f"Affiliate link returns HTTP {st}", "stuck-at-tracker": "Affiliate link never reaches the vendor (stuck on the tracking domain — program paused/link revoked?)",
                   "dead-page": "Affiliate link lands on an error/'link no longer active' page", "unreachable": f"Affiliate link unreachable ({r['error']})"}[cls]
            sev = "critical" if cls != "unreachable" else "high"
            for s in ps or []:
                A.add(posts[s], "live-affiliate-dead", "revenue", sev, f"{msg}: {names} → {u[:80]}", "Re-issue the link in your affiliate dashboard and update constants.ts / lib/affiliate-links.ts (one edit fixes every post).", "S", snippet=r["final"], key=u, live=True)
            if not ps: site_issue(site, "live-affiliate-dead", "revenue", "high", f"{msg}: {names} → {u[:80]} (not used in any post yet)", "Re-issue the link before using it.", "S", key=u)
    # pricing drift
    for (s, u), label in price_pages.items():
        r = r_pr.get(u)
        if not r: continue
        p = posts[s]
        page_prices = {float(x) for x in re.findall(r"\$\s?(\d+(?:\.\d{1,2})?)", r["text"])}
        entry = {"post": s, "url": u, "status": r["status"], "checked": False, "claimed_missing": [], "page_prices": sorted(page_prices)[:15]}
        tool = next((t for t, d in site.tools.items() if re.search(re.escape(d["name"]), label or "", re.I)), None)
        if r["status"] and r["status"] < 400 and len(r["text"]) > 800 and page_prices and tool:
            entry["checked"] = True
            claimed = sorted({pr_ for (sl, pr_, _) in site.price_claims.get(tool, []) if sl == s})
            def seen(c): return any(abs(c - x) < 0.011 or abs(c * 12 - x) < 0.6 or abs(c - x / 12) < 0.11 for x in page_prices)
            miss = [c for c in claimed if not seen(c)]
            entry["claimed_missing"] = miss
            if miss:
                A.add(p, "live-price-drift", "trust", "medium", f"{site.tools[tool]['name']}: price(s) {', '.join('$%g' % m for m in miss[:4])} in the post don't appear on its pricing page (page shows {', '.join('$%g' % x for x in sorted(page_prices)[:8])}).",
                      "Open the pricing page, confirm the current numbers (JS-rendered pages can false-alarm), update the post + 'verified' stamp.", "S", snippet=u, key=f"{tool}:{miss}", live=True)
        live["pricing"].append(entry)
    site.live = live
    return live


# ───────────────────────────── reporting ─────────────────────────────
def issue_dict(i: Issue):
    return {"code": i.code, "pillar": i.pillar, "severity": i.severity, "message": i.message, "fix": i.fix, "effort": i.effort,
            "slug": i.slug, "where": i.where, "snippet": i.snippet, "priority": i.priority, "live": i.live}


def build_report(site: Site, weights, args):
    posts = sorted(site.posts.values(), key=lambda p: p.total)
    sev = Counter(i.severity for i in all_issues(site))
    pil_avg = {k: round(sum(p.scores[k] for p in posts) / max(1, len(posts)), 1) for k in PILLARS}
    gd = Counter(grade(p.total) for p in posts)
    top = sorted(all_issues(site), key=lambda i: -i.priority)
    rep = {
        "meta": {"generated": datetime.now().isoformat(timespec="seconds"), "today": str(site.today), "version": VERSION, "live": bool(getattr(site, "live", None)),
                 "posts": len(posts), "weights": weights},
        "summary": {"avg_score": round(sum(p.total for p in posts) / max(1, len(posts)), 1), "pillar_avg": pil_avg, "grades": dict(gd), "severity": dict(sev)},
        "posts": [{"slug": p.slug, "title": p.title, "kind": post_kind(p), "intent": p.intent, "words": p.words, "date_modified": p.date_mod,
                   "score": round(p.total, 1), "grade": grade(p.total), "scores": {k: round(v, 1) for k, v in p.scores.items()}, "importance": round(p.importance, 2),
                   "inbound": p.inbound, "pagerank": round(p.pagerank * 1000, 3), "tools": dict(sorted(p.tools_mentioned.items(), key=lambda x: -x[1])[:8]),
                   "issues": [issue_dict(i) for i in sorted(p.issues, key=lambda i: -i.priority)]} for p in posts],
        "site_issues": [issue_dict(i) for i in sorted(site.site_issues, key=lambda i: -i.priority)],
        "top_actions": [issue_dict(i) for i in top[:80]],
        "tools": getattr(site, "tool_table", []),
        "price_conflicts": getattr(site, "price_conflicts", []),
        "live": getattr(site, "live", None),
    }
    attach_v2(site, rep, args)
    return rep


def print_summary(site, rep, args):
    s = rep["summary"]
    print(c(BLD, f"\nAI Nexus blog analyzer v{VERSION} — {rep['meta']['posts']} posts · {'LIVE + static' if rep['meta']['live'] else 'static only (add --live for web checks)'}"))
    print(f"Site score {c(BLD, str(s['avg_score']))}/100   " + "  ".join(f"{PILLAR_LABEL[k]} {v:.0f}" for k, v in s["pillar_avg"].items()))
    sv = s["severity"]
    print(f"Issues: {c(RED, str(sv.get('critical', 0)) + ' critical')} · {c(YEL, str(sv.get('high', 0)) + ' high')} · {sv.get('medium', 0)} medium · {sv.get('low', 0)} low"
          + "   Grades: " + " ".join(f"{g}:{n}" for g, n in sorted(s["grades"].items())))
    print_v2(site, rep)
    if args.slugs:
        for p in sorted(site.posts.values(), key=lambda p: p.total):
            print(c(BLD, f"\n{p.slug}  {p.total:.0f}/100 ({grade(p.total)})  words={p.words} inbound={p.inbound} importance={p.importance:.1f}"))
            print("  " + "  ".join(f"{PILLAR_LABEL[k]} {v:.0f}" for k, v in p.scores.items()))
            for i in sorted(p.issues, key=lambda i: -i.priority):
                col = {"critical": RED, "high": YEL}.get(i.severity, DIM)
                print(f"  {c(col, i.severity[:4].upper())} [{i.pillar}] {i.message}\n       ↳ {i.fix}" + (f"\n       ⌗ {i.snippet.splitlines()[0][:140]}" if i.snippet else ""))
        return
    print(c(BLD, f"\nTop {args.top} actions (priority = severity × page importance × pillar weight ÷ effort)"))
    for n, i in enumerate(sorted(all_issues(site), key=lambda i: -i.priority)[: args.top], 1):
        col = {"critical": RED, "high": YEL}.get(i.severity, DIM)
        print(f" {n:>2}. {c(col, i.severity[:4].upper())} [{i.pillar:<7}] {(i.slug or 'SITE'):<44.44} {i.message[:110]}")
    if site.site_issues:
        print(c(BLD, "\nSite-level findings"))
        for i in sorted(site.site_issues, key=lambda i: -i.priority)[:12]:
            print(f"  • [{i.severity}] {i.message[:150]}")
    print(c(BLD, "\nLowest-scoring posts"))
    for p in sorted(site.posts.values(), key=lambda p: p.total)[:10]:
        print(f"  {p.total:5.1f} {grade(p.total):<2} {p.slug}  ({sum(1 for i in p.issues if i.severity in ('critical', 'high'))} crit/high)")
    if getattr(site, "live", None):
        L = site.live
        bad_o = sum(1 for x in L["outbound"] if x["class"] in ("broken", "redirect-home"))
        bad_a = sum(1 for x in L["affiliate"] if x["class"] in ("dead", "stuck-at-tracker", "dead-page", "unreachable"))
        print(c(BLD, "\nLive checks") + f"  outbound problems: {bad_o}/{len(L['outbound'])} · affiliate links needing attention: {bad_a}/{len(L['affiliate'])} · pricing pages verified: {sum(1 for x in L['pricing'] if x['checked'])}/{len(L['pricing'])}")


def write_csv(site, rep, path):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["slug", "kind", "intent", "words", "score", "grade"] + PILLARS + ["critical", "high", "medium", "low", "inbound", "pagerank_x1000", "importance", "top_issue", "strength", "tier", "unique_pct"])
        for p in rep["posts"]:
            cnt = Counter(i["severity"] for i in p["issues"])
            w.writerow([p["slug"], p["kind"], p["intent"], p["words"], p["score"], p["grade"]] + [p["scores"][k] for k in PILLARS]
                       + [cnt.get("critical", 0), cnt.get("high", 0), cnt.get("medium", 0), cnt.get("low", 0), p["inbound"], p["pagerank"], p["importance"],
                          p["issues"][0]["message"][:120] if p["issues"] else "", p["strength"], p["tier"], p["unique_pct"]])


def write_checklist(site, rep, path):
    L = ["# AI Nexus — blog fix checklist", "",
         f"_Generated {rep['meta']['generated']} · site score {rep['summary']['avg_score']}/100 · tick items off as you ship them._", "",
         "Priority = severity × page importance (link authority + revenue potential) × pillar weight ÷ effort. **Effort**: S ≈ <30 min, M ≈ 1-2 h, L ≈ half-day+.", "",
         "## 1. Do these first (top 25 across the site)", ""]
    def line(i, with_slug=True):
        loc = f"`{i['slug']}` — " if (with_slug and i["slug"]) else ""
        out = [f"- [ ] **{i['severity'].upper()}** · {PILLAR_LABEL[i['pillar']]} · effort {i['effort']} — {loc}{i['message']}"]
        if i["fix"]: out.append(f"  - **Fix:** {i['fix']}")
        if i["where"] and i["slug"]: out.append(f"  - **Where:** {i['where']}")
        if i["snippet"]:
            out += ["  - **Exact text/snippet:**", "    ```", *[f"    {x}" for x in i["snippet"].splitlines()[:8]], "    ```"]
        return out
    for i in rep["top_actions"][:25]: L += line(i)
    if rep["site_issues"]:
        L += ["", "## 2. Site-level", ""]
        for i in rep["site_issues"]: L += line(i, False)
    L += ["", "## 3. Per-post checklists (most important pages first)", ""]
    for p in sorted(rep["posts"], key=lambda p: -p["importance"]):
        if not p["issues"]: continue
        L += [f"### {p['slug']} — {p['score']}/100 ({p['grade']})", f"_{p['kind']} · {p['words']} words · importance {p['importance']} · inbound links {p['inbound']}_", ""]
        for i in p["issues"]: L += line(i, False)
        L.append("")
    Path(path).write_text("\n".join(L[:6] + v2_checklist_head(rep) + L[6:]), encoding="utf-8")


HTML_TMPL = r"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI Nexus blog analyzer</title><style>
:root{--bg:#fff;--fg:#0f172a;--mut:#64748b;--card:#f8fafc;--bd:#e2e8f0;--acc:#0d9488;--crit:#dc2626;--high:#ea580c;--med:#ca8a04;--low:#64748b}
@media(prefers-color-scheme:dark){:root{--bg:#0b1220;--fg:#e2e8f0;--mut:#94a3b8;--card:#111a2e;--bd:#1e293b;--acc:#2dd4bf}}
*{box-sizing:border-box}body{margin:0;font:14px/1.5 system-ui,sans-serif;background:var(--bg);color:var(--fg)}
header{padding:20px 24px;border-bottom:1px solid var(--bd)}h1{margin:0 0 4px;font-size:20px}main{padding:16px 24px 60px;max-width:1280px;margin:auto}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:14px 0}.card{background:var(--card);border:1px solid var(--bd);border-radius:10px;padding:12px}
.card b{display:block;font-size:24px}.card span{color:var(--mut);font-size:12px}nav{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}
nav button,select,input{background:var(--card);color:var(--fg);border:1px solid var(--bd);border-radius:8px;padding:6px 12px;font:inherit}nav button.on{background:var(--acc);color:#fff;border-color:var(--acc)}
table{width:100%;border-collapse:collapse;margin:8px 0}th,td{text-align:left;padding:7px 8px;border-bottom:1px solid var(--bd);vertical-align:top}th{color:var(--mut);cursor:pointer;font-size:12px;white-space:nowrap}
.tag{display:inline-block;padding:1px 8px;border-radius:99px;font-size:11px;font-weight:700;color:#fff}.critical{background:var(--crit)}.high{background:var(--high)}.medium{background:var(--med)}.low{background:var(--low)}
.bar{height:6px;border-radius:3px;background:var(--bd);min-width:60px}.bar i{display:block;height:100%;border-radius:3px;background:var(--acc)}
.fix{color:var(--mut)}pre{background:var(--card);border:1px solid var(--bd);border-radius:8px;padding:8px;overflow:auto;white-space:pre-wrap;margin:4px 0}.row{cursor:pointer}.det{display:none;background:var(--card)}.det.open{display:table-row}
.tools{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}small{color:var(--mut)}a{color:var(--acc)}
</style></head><body><header><h1>AI Nexus — site-wide blog analyzer</h1><small id="meta"></small></header><main>
<div class="cards" id="cards"></div><nav id="nav"></nav><div id="view"></div></main>
<script id="data" type="application/json">__DATA__</script><script>
const D=JSON.parse(document.getElementById('data').textContent),PL={revenue:'Affiliate revenue',organic:'Google organic',ai:'AI citations',reader:'Reader value',trust:'Trust & E-E-A-T'};
const $=(t,a={},...k)=>{const e=document.createElement(t);for(const[x,v]of Object.entries(a)){if(x==='class')e.className=v;else if(x==='onclick')e.onclick=v;else e.setAttribute(x,v)}for(const c of k.flat())e.append(c instanceof Node?c:String(c??''));return e};
const tag=s=>$('span',{class:'tag '+s},s);const bar=v=>$('div',{class:'bar'},$('i',{style:`width:${Math.max(2,v)}%;background:${v>=80?'#16a34a':v>=60?'#ca8a04':'#dc2626'}`}));
document.getElementById('meta').textContent=`${D.meta.posts} posts · ${D.meta.live?'static + live checks':'static analysis only'} · generated ${D.meta.generated}`;
const S=D.summary,sv=S.severity;[['Site score',S.avg_score],['Critical',sv.critical||0],['High',sv.high||0],['Medium',sv.medium||0],...Object.entries(S.pillar_avg).map(([k,v])=>[PL[k],v])].forEach(([l,v])=>document.getElementById('cards').append($('div',{class:'card'},$('b',{},v),$('span',{},l))));
const tabs={'Priority actions':actions,'Posts':posts,'Site-level':siteLvl,'Revenue map':revenue,'Live checks':live};let cur='Priority actions';
const nav=document.getElementById('nav'),view=document.getElementById('view');
function render(){nav.replaceChildren(...Object.keys(tabs).map(k=>$('button',{class:k===cur?'on':'',onclick:()=>{cur=k;render()}},k)));view.replaceChildren(tabs[cur]())}
function issueBlock(i){return $('div',{},$('div',{},tag(i.severity),' ',$('b',{},PL[i.pillar]),` · effort ${i.effort} · priority ${i.priority}${i.live?' · live':''}`),$('div',{},i.message),i.fix?$('div',{class:'fix'},'→ '+i.fix):'',i.snippet?$('pre',{},i.snippet):'')}
function actions(){const w=$('div'),sel=$('select',{},$('option',{value:''},'All pillars'),...Object.entries(PL).map(([k,v])=>$('option',{value:k},v))),sv2=$('select',{},$('option',{value:''},'All severities'),...['critical','high','medium','low'].map(s=>$('option',{value:s},s))),q=$('input',{placeholder:'filter text / slug'});
const all=[...D.top_actions];const tb=$('tbody');function draw(){const f=all.filter(i=>(!sel.value||i.pillar===sel.value)&&(!sv2.value||i.severity===sv2.value)&&(!q.value||(i.slug+i.message).toLowerCase().includes(q.value.toLowerCase())));tb.replaceChildren(...f.map(i=>$('tr',{},$('td',{},i.priority),$('td',{},tag(i.severity)),$('td',{},PL[i.pillar]),$('td',{},i.slug||'SITE'),$('td',{},issueBlock(i)))))}
[sel,sv2,q].forEach(e=>e.oninput=draw);w.append($('div',{class:'tools'},sel,sv2,q),$('small',{},'Top 80 by priority = severity × page importance × pillar weight ÷ effort.'),$('table',{},$('thead',{},$('tr',{},...['Priority','Severity','Pillar','Post','Issue & exact fix'].map(h=>$('th',{},h)))),tb));draw();return w}
function posts(){const tb=$('tbody');let key='score',dir=1;const cols=[['score','Score'],['slug','Post'],['kind','Type'],['words','Words'],['inbound','Inbound'],['importance','Importance'],['crit','Crit/High']];
const th=$('tr',{},...cols.map(([k,l])=>$('th',{onclick:()=>{dir=key===k?-dir:1;key=k;draw()}},l)),...Object.values(PL).map(l=>$('th',{},l)));
function draw(){const rows=D.posts.map(p=>({...p,crit:p.issues.filter(i=>['critical','high'].includes(i.severity)).length}));rows.sort((a,b)=>(a[key]>b[key]?1:-1)*dir);tb.replaceChildren(...rows.flatMap(p=>{const d=$('tr',{class:'det'},$('td',{colspan:12},...p.issues.map(issueBlock),p.issues.length?'':'No issues.'));
return[$('tr',{class:'row',onclick:()=>d.classList.toggle('open')},$('td',{},p.score+' '+p.grade),$('td',{},p.slug),$('td',{},p.kind),$('td',{},p.words),$('td',{},p.inbound),$('td',{},p.importance),$('td',{},p.crit),...Object.keys(PL).map(k=>$('td',{},bar(p.scores[k])))),d]}))}
draw();return $('div',{},$('small',{},'Click a row for its issues. Click headers to sort.'),$('table',{},$('thead',{},th),tb))}
function siteLvl(){const w=$('div');if(!D.site_issues.length)w.append('No site-level findings.');D.site_issues.forEach(i=>w.append(issueBlock(i),$('hr')));
if(D.price_conflicts.length){w.append($('h3',{},'Price inconsistencies across posts'),$('table',{},...D.price_conflicts.map(p=>$('tr',{},$('td',{},p.tool),$('td',{},Object.entries(p.prices).map(([k,v])=>k+': '+v.join(', ')).join(' | ')))))) }return w}
function revenue(){return $('div',{},$('small',{},'Tools ranked by how often your posts discuss them. "Tracked" = affiliate link carries a tracking param/network domain. Untracked + heavily mentioned = biggest untapped commission.'),$('table',{},$('thead',{},$('tr',{},...['Tool','Mentions','Posts','Tracked','Review page','Blog→page links','Link'].map(h=>$('th',{},h)))),$('tbody',{},...D.tools.filter(t=>t.mentions).slice(0,60).map(t=>$('tr',{},$('td',{},t.name),$('td',{},t.mentions),$('td',{},t.posts),$('td',{},t.tracked?'✔':'✘ untracked'),$('td',{},t.has_page?'✔':'—'),$('td',{},t.blog_links_to_page),$('td',{},t.link.slice(0,60)))))))}
function live(){if(!D.live)return $('div',{},'Run with --live to populate this tab.');const L=D.live,w=$('div');const tbl=(t,rows,cols)=>$('div',{},$('h3',{},t),$('table',{},$('thead',{},$('tr',{},...cols.map(c=>$('th',{},c[0])))),$('tbody',{},...rows.map(r=>$('tr',{},...cols.map(c=>$('td',{},c[1](r))))))));
w.append(tbl('Affiliate link health',L.affiliate.sort((a,b)=>(a.class==='ok')-(b.class==='ok')),[['Status',r=>r.class+' ('+r.status+')'],['Tool',r=>r.tools.join(', ')],['Final URL',r=>r.final.slice(0,80)],['Used in',r=>r.posts.length+' post(s)']]),
tbl('Outbound links with problems',L.outbound.filter(r=>!['ok','blocked'].includes(r.class)),[['Class',r=>r.class+' ('+r.status+')'],['URL',r=>r.url.slice(0,90)],['Posts',r=>r.posts.join(', ')]]),
tbl('Vendor pricing pages',L.pricing,[['Post',r=>r.post],['Page',r=>r.url.slice(0,60)],['Verified',r=>r.checked?'yes':'unverifiable (JS-rendered?)'],['Claimed but not on page',r=>r.claimed_missing.map(x=>'$'+x).join(', ')],['Page shows',r=>r.page_prices.map(x=>'$'+x).join(', ')]]));return w}
render();</script></body></html>"""


def write_html(rep, path):
    data = json.dumps(rep, ensure_ascii=False).replace("</", "<\\/")
    Path(path).write_text(HTML_TMPL.replace("__DATA__", data).replace("\nrender();</script>", HTML_V2_JS + "\nrender();</script>"), encoding="utf-8")


# ───────────────────────────── CI gate ─────────────────────────────
def ci_gate(site, rep, args):
    base = set()
    if args.baseline and Path(args.baseline).exists():
        base = set(json.loads(Path(args.baseline).read_text()).get("fingerprints", []))
    fails, notes = [], []
    if getattr(args, "strict_policy", False):
        pol = [i for i in all_issues(site) if i.code.startswith("policy-") and i.severity == "critical"]
        if pol: fails.append(f"{len(pol)} critical policy violation(s) (first-hand testing claims) — fix titles/meta before merge")
    new = [i for i in all_issues(site) if i.fingerprint() not in base]
    crit = [i for i in new if i.severity == "critical"]
    if len(crit) > args.max_critical: fails.append(f"{len(crit)} {'new ' if base else ''}critical issue(s) (max {args.max_critical})")
    if args.fail_on_high:
        hi = [i for i in new if i.severity == "high"]
        if hi: fails.append(f"{len(hi)} {'new ' if base else ''}high issue(s)")
    low = [p for p in site.posts.values() if p.total < args.min_score]
    if base:
        bscores = json.loads(Path(args.baseline).read_text()).get("scores", {})
        low = [p for p in low if p.total < bscores.get(p.slug, 101) - 3]   # only count regressions vs baseline
        if low: fails.append(f"{len(low)} post(s) dropped >3 pts below the {args.min_score} threshold vs baseline")
    elif low: fails.append(f"{len(low)} post(s) below min-score {args.min_score}: " + ", ".join(p.slug for p in low[:5]))
    gh = os.environ.get("GITHUB_ACTIONS") == "true"
    if gh:
        for i in crit[:50]: print(f"::error file=blog/{i.slug}.ts,title={i.code}::{i.message[:200]}" if i.slug else f"::error title={i.code}::{i.message[:200]}")
        for p in low[:20]: print(f"::warning file=blog/{p.slug}.ts,title=score::{p.slug} scored {p.total:.0f} (<{args.min_score})")
    return fails


def write_baseline(site, path):
    Path(path).write_text(json.dumps({"generated": datetime.now().isoformat(timespec="seconds"),
                                      "fingerprints": sorted(i.fingerprint() for i in all_issues(site)),
                                      "scores": {s: round(p.total, 1) for s, p in site.posts.items()}}, indent=1), encoding="utf-8")


def load_traffic(path):
    rows = list(csv.DictReader(open(path, encoding="utf-8-sig")))
    if not rows: return {}
    cols = {k.lower(): k for k in rows[0]}
    pk = next((cols[k] for k in cols if any(x in k for x in ("page", "url", "path"))), None)
    mk = next((cols[k] for k in ("clicks", "sessions", "views", "users", "impressions") if k in cols), None)
    out = {}
    for r in rows:
        m = re.search(r"/blog/([^/?#\s]+)", r.get(pk, "") or "")
        if m:
            try: out[m.group(1)] = out.get(m.group(1), 0) + float((r.get(mk) or "0").replace(",", ""))
            except ValueError: pass
    return out or {}


# ───────────────────────────── v2 additions ─────────────────────────────
# Everything below was added in v2.0. It closes the blind spots of v1 (which scored every post 100/100 on
# hygiene alone): policy scan of EVERY text field, cross-post boilerplate + near-duplicate detection,
# information-gain / evidence metrics, a relative Strength Index (no ceiling), git-aware freshness integrity,
# Search Console + affiliate-click ingestion, a revenue "money plan", prerendered-HTML (dist) verification,
# competitor benchmarks and run-over-run trend history.
import statistics
import subprocess

# --- policy: no first-hand testing claims anywhere (research-synthesis editorial policy) ---------------------
TEST_HEADLINE = [r"\btested\b", r"\bhands[- ]on\b", r"\breal[- ]app (?:tests?|builds?)\b", r"\breal[- ]world (?:tests?|testing)\b",
                 r"\bour (?:tests?|testing|benchmarks?)\b", r"\bwe (?:tested|tried|used|ran|benchmarked)\b", r"\bi (?:tested|tried|used|ran|benchmarked)\b"]
SOFT_FP = [r"\b(?:we|i) (?:found|noticed|observed|saw)\b", r"\bin (?:my|our) experience\b"]
NEG_PRE = re.compile(r"(?:\bnot|\bnever|\bno|\bwithout|\bun|battle[- ]|lab[- ]|a/b[- ]|ab[- ]|third[- ]party[- ])\s*$", re.I)
DEEP_CLAIMS = [x for x in EXPERIENCE_CLAIMS if "hands" not in x] + [r"\bwe (?:tested|tried|ran|benchmarked)\b", r"\bi (?:tested|tried|benchmarked)\b"]
HEADLINE_FIELDS = ("title", "seoTitle", "metaDescription", "excerpt", "quickAnswer")
BOILER_EXEMPT = re.compile(r"affiliate|commission|disclosure|sponsored|at no (?:extra|additional) cost|cookie|privacy|prices in usd are vendor list prices|ratings follow a 5 point rubric|additional sources g2 product reviews trustpilot reviews and capterra software comparisons|prices verified .* against each vendor s official pricing page|the free plan allows up to 10 mind maps and 20 ai attempts|use the workflow budget and risk checks above before choosing a plan", re.I)
DATE_ONLY_RE = re.compile(r"dateModified|date_modified|lastUpdated|lastVerified|updatedAt|wordCount")
NEG_RE = re.compile(r"\b(?:cons|downsides?|limitations?|drawbacks?|who should (?:not|skip)|not for|skip (?:it|this) if)\b", re.I)
NUM_RE = re.compile(r"\$\s?\d[\d,]*(?:\.\d+)?|₹\s?\d[\d,]*|\b\d+(?:\.\d+)?\s?%|\b\d{1,3}(?:,\d{3})+\b|\b\d+(?:\.\d)?\s?/\s?5\b|"
                    r"\b\d+(?:\.\d+)?\s?(?:credits|minutes|mins|hours|seats|users|languages|voices|tokens|requests|GB|MB|TB|apps|integrations|templates|workflows|reviews|operations|ops|words|characters)\b", re.I)
SRC_CUE = re.compile(r"\b(?:according to|per (?:the|its|their|vendor|official)|via|source|reported|G2|Trustpilot|Capterra|Reddit|Product Hunt|official|documentation|docs|"
                     r"pricing page|changelog|release notes|announce\w*|as of|FTC|survey|study|published|verified|vendor)\b", re.I)
AUDIENCE_RE = re.compile(r"\bfor (?:[\w-]+ ){0,3}(?:creators?|founders?|teams?|beginners?|developers?|students?|freelancers?|marketers?|agencies|businesses|solopreneurs|youtubers?|teachers?|writers?|podcasters?|coders?)\b|\bbest for\b|\bwho (?:it'?s|it is) for\b", re.I)
HOOK_RE = re.compile(r"\b(?:free|cheap(?:est)?|india|vs\.?|alternatives?|worth it|honest|pricing|worth)\b|₹|\bfor [a-z]+", re.I)
AUTHORITY_DOMAINS = ("g2.com", "trustpilot.com", "reddit.com", "capterra.com", "producthunt.com", "github.com", "ftc.gov", "arxiv.org", "wikipedia.org", "gartner.com")
DEFAULT_TARGET_CTR = 0.02          # affiliate-click / session benchmark used in the money plan (tune with --target-ctr)
CTR_BY_POS = {1: .28, 2: .15, 3: .11, 4: .08, 5: .065, 6: .05, 7: .04, 8: .032, 9: .028, 10: .024}   # rough organic CTR curve


def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def norm_sentence(s: str) -> str: return re.sub(r"\W+", " ", s.lower()).strip()


def claim_hits(text, patterns):
    out = []
    for pat in patterns:
        for m in re.finditer(pat, text or "", re.I):
            if NEG_PRE.search((text or "")[max(0, m.start() - 16): m.start()]): continue
            q = re.search(r"[.!?]", (text or "")[m.end(): m.end() + 90])
            if q and q.group(0) == "?" and re.match(r"(?:i|we)\b", m.group(0), re.I): continue      # quoted reader question, not a claim
            out.append((m.group(0), snippet_around(text, m, 45)))
    return out


# --- per-post checks ----------------------------------------------------------------------------------------
def v2_post_checks(A, p):
    policy_fields(A, p)
    git_post(A, p)
    metrics_post(A, p)
    first_screen(A, p)
    title_hook(A, p)
    funnel_bridge(A, p)
    table_mobile(A, p)
    search_data_post(A, p)
    click_data_post(A, p)


def policy_fields(A, p):
    head, deep, soft = [], [], []
    fields = {"title": p.title, "seoTitle": p.seo_title, "metaDescription": p.meta, "excerpt": p.excerpt, "quickAnswer": p.quick_answer}
    for i, im in enumerate(p.images, 1): fields[f"image-alt#{i}"] = im["alt"]
    for name, txt in fields.items():
        for h, sn in claim_hits(txt, TEST_HEADLINE): head.append((name, h, sn))
        for h, sn in claim_hits(txt, SOFT_FP): soft.append((name, h, sn))
    for h, sn in claim_hits(p.my_take, DEEP_CLAIMS): deep.append(("myTake", h, sn))
    for i, (q, a) in enumerate(p.faqs, 1):          # FAQ *questions* are reader-voice ("Can I run…"), so only answers are scanned
        for h, sn in claim_hits(a, DEEP_CLAIMS): deep.append((f"faq#{i}-answer", h, sn))
        for h, sn in claim_hits(a, SOFT_FP): soft.append((f"faq#{i}-answer", h, sn))
    if head:
        A.add(p, "policy-testing-headline", "trust", "critical",
              f"First-hand testing language in {len(head)} headline/SERP field(s): " + "; ".join(f"{n} → '{h}'" for n, h, _ in head[:4]) +
              ". Your policy is research synthesis (no hands-on testing); titles/meta are the most visible places to be wrong and the first thing a quality rater or reader sees.",
              "Replace 'Tested' with an honest verb: 'Compared', 'Researched', 'Reviewed', 'Ranked', 'Analysed'. If a number refers to a THIRD-PARTY benchmark, name it ('per LMArena').",
              "S", where=", ".join(sorted({n for n, _, _ in head})), snippet="\n".join(f"{n}: {sn}" for n, _, sn in head[:4]), key="|".join(sorted({n for n, _, _ in head})))
    if deep:
        A.add(p, "policy-testing-field", "trust", "high",
              f"{len(deep)} first-hand testing/experience claim(s) in myTake/FAQ answers: " + "; ".join(f"{n} → '{h}'" for n, h, _ in deep[:3]) + ". (Body text is covered by claims-tested; these fields were previously unscanned and are also emitted into FAQPage schema.)",
              "Reword as research-based ('vendor docs and G2 reviews indicate…') or remove.", "S", where=", ".join(sorted({n for n, _, _ in deep})),
              snippet="\n".join(f"{n}: {sn}" for n, _, sn in deep[:3]), key=str(len(deep)))
    if len(soft) >= 2:
        A.add(p, "policy-firstperson-soft", "trust", "low", f"{len(soft)} 'we found / I noticed' style statements in headline/FAQ fields that imply first-hand observation.",
              "Prefer sourced phrasing: 'G2 reviewers report…', 'the pricing page lists…'.", "S", snippet="\n".join(f"{n}: {sn}" for n, _, sn in soft[:3]), key=str(len(soft)))


def table_mobile(A, p):
    for m in re.finditer(r"<table.*?</table>", p.content, re.S | re.I):
        first = re.search(r"<tr.*?</tr>", m.group(0), re.S | re.I)
        cols = len(re.findall(r"<t[dh]\b", first.group(0), re.I)) if first else 0
        before = p.content[max(0, m.start() - 220): m.start()].lower()
        if cols >= 6 and "overflow" not in before:
            A.add(p, "table-wide-mobile", "reader", "low", f"A {cols}-column table with no horizontal-scroll wrapper — it breaks on phones (most of your audience).",
                  "Wrap it: <div style=\"overflow-x:auto\">…</div> (ignore if BlogPostPage.tsx/CSS already scrolls tables) or drop to ≤5 columns.", "S", key=str(cols)); break


def funnel_bridge(A, p):
    kind = post_kind(p)
    if kind not in ("article", "howto") and p.intent == "transactional": return
    site = A.site
    posts = site.posts
    money = [l for l in p.links if (m := re.match(r"/blog/([^/?#]+)", l["href"])) and m.group(1) in posts and posts[m.group(1)].intent == "transactional"]
    tools = [l for l in p.links if re.match(r"/(?:tools|compare)/", l["href"])]
    n = len({l["href"].rstrip("/") for l in money + tools})
    tracked = [s for s in p.tools_mentioned if site.is_tracked(site.aff_links.get(s, ""))]
    if n < 2 and tracked:
        cands = sorted(((relevance(site, p, q), q) for s, q in posts.items() if s != p.slug and q.intent == "transactional"), key=lambda x: -x[0])[:3]
        snip = "\n".join(f"<a href=\"/blog/{q.slug}/\">{short_title(q)}</a>" for sc, q in cands if sc > 0)
        A.add(p, "no-funnel-bridge", "revenue", "medium",
              f"Informational post discusses {len(tracked)} monetised tool(s) but links to only {n} money page(s) (roundup/comparison/tool review). Readers learn, then leave.",
              "Add a 'Ready to choose?' block linking to 2-3 of the most relevant money pages, placed after the first answer and again before the conclusion.", "S", snippet=snip, key=str(n))


def title_hook(A, p):
    t = p.seo_title or p.title
    if not t: return
    feats = {"number": bool(re.search(r"\b\d+\b(?!\s*$)", re.sub(r"20\d\d", "", t))), "audience": bool(AUDIENCE_RE.search(t)), "hook": bool(HOOK_RE.search(t)),
             "question": t.strip().endswith("?") or bool(re.match(r"(?:what|how|why|is|are|can|does|should|which)\b", t.strip(), re.I)), "price": bool(re.search(r"[$₹]\s?\d", t))}
    p.metrics["title_features"] = [k for k, v in feats.items() if v]
    if sum(feats.values()) == 0:
        A.add(p, "title-no-hook", "organic", "low", "seoTitle has no specific hook (no number, price, audience, 'free', 'vs', or question) — weak click appeal in a crowded SERP.",
              "Add ONE concrete differentiator: a count ('7 tools'), a price ('from $9/mo'), an audience ('for solo creators'), or 'free plan'.", "S", snippet=t, key=t[:40])


def first_screen(A, p):
    fs = (p.quick_answer + " " + " ".join(words_of(p.text)[:120]))
    el = {"price": bool(re.search(r"[$₹]\s?\d|\bfree\b", fs, re.I)), "audience": bool(AUDIENCE_RE.search(fs)), "verdict": bool(DECISION_RE.search(fs)),
          "named_tool": any(a.search(fs) for s in p.tools_mentioned for a in A.site._pats.get(s, []))}
    p.metrics["first_screen"] = el
    n = sum(el.values())
    if post_kind(p) in ("roundup", "comparison", "alternatives", "pricing", "review") and n <= 1:
        miss = [k for k, v in el.items() if not v]
        A.add(p, "first-screen-weak", "reader", "medium",
              f"The first screen (quick answer + opening ~120 words) delivers only {n}/4 decision elements; missing: {', '.join(miss)}. Buyers decide in seconds whether the page answers them.",
              "Open with: winner + who it's for + starting price + one-line caveat. Example: 'Gamma is best for founders who need decks fast — free plan, paid from $X/mo; skip it if you need heavy offline editing.'", "S", key=",".join(miss))


def metrics_post(A, p):
    site = A.site
    own = host_of(SITE)
    metric_text = strip_tags(strip_tables(p.content))
    sents = sentences_of(metric_text)
    ns = [s for s in sents if NUM_RE.search(s)]
    total = max(1, len(p.content))
    win = [strip_tags(p.content[max(0, int(l["pos"] * total) - 260): int(l["pos"] * total) + 260]).lower() for l in p.links
           if l["href"].startswith("http") and host_of(l["href"]) != own and not site.is_affiliate_href(l["href"])]
    # A post-level Sources block is evidence for the figures it supports even when
    # the prose does not repeat the source cue in every numeric sentence.
    has_source_block = bool(p.citations) or bool(re.search(r"<(?:h[2-4]|strong)[^>]*>\s*(?:sources?|references?)\b", p.content, re.I))
    sourced = [s for s in ns if SRC_CUE.search(s) or any(s[:50].lower() in w for w in win) or has_source_block]
    nums = {re.sub(r"\s", "", m.group(0).lower()) for m in NUM_RE.finditer(p.text)}
    dom = {reg_domain(host_of(l["href"])) for l in p.links if l["href"].startswith("http") and host_of(l["href"]) != own and not site.is_affiliate_href(l["href"])}
    dom |= {reg_domain(host_of(u)) for u in p.citations if u.startswith("http")}
    tables = re.findall(r"<table.*?</table>", p.content, re.S | re.I)
    m = p.metrics
    m.update({"numbers": len(nums), "numbers_per_1000w": round(len(nums) / max(1, p.words) * 1000, 1), "numeric_sentences": len(ns),
              "sourced_ratio": round(len(sourced) / len(ns), 2) if ns else 1.0, "ext_domains": len(dom), "authority_domains": sorted(d for d in dom if d in AUTHORITY_DOMAINS),
              "tables": len(tables), "table_cells": sum(len(re.findall(r"<t[dh]\b", t, re.I)) for t in tables), "lists": len(re.findall(r"<(?:ul|ol)\b", p.content, re.I)),
              "verdicts": len(DECISION_RE.findall(p.text)), "has_negatives": bool(NEG_RE.search(p.text)) or p.has_proscons})
    kind = post_kind(p)
    if p.words > 900 and m["numbers_per_1000w"] < 6 and not (len(tables) >= 1 and len(p.citations) >= 3):
        A.add(p, "info-gain-low", "reader", "medium", f"Only {len(nums)} distinct concrete figures ({m['numbers_per_1000w']}/1000 words). Posts that rank & get cited carry specifics competitors skip: limits, per-seat prices, caps, ratings with review counts.",
              "Add a dated plan/limits table and 5-8 verifiable numbers (credit caps, seat minimums, overage rates, G2 rating + review count) — each with its source.", "M", key=str(len(nums) // 3))
    if len(ns) >= 10 and m["sourced_ratio"] < 0.30:
        A.add(p, "numbers-unsourced", "trust", "medium" if len(dom) < 4 else "low", f"{len(ns) - len(sourced)}/{len(ns)} sentences with numbers carry no visible source cue (vendor page, G2, 'as of <date>').",
              "Attribute figures in-sentence: 'Pro costs $20/mo (vendor pricing page, checked Oct 2026)'. Unattributed numbers are what quality raters and AI engines discount.", "M", key=str(int(m["sourced_ratio"] * 10)))
    if kind in ("roundup", "comparison", "alternatives", "pricing", "review") and len(dom) < 3:
        A.add(p, "few-sources", "trust", "medium", f"Only {len(dom)} distinct outside source domain(s) in a '{kind}' post.", "Cite at least 4 independent domains (vendor docs, G2/Trustpilot/Reddit threads, regulator or changelog pages).", "S", key=str(len(dom)))


def git_post(A, p):
    g = getattr(p, "git", None) or {}
    site = A.site
    if not site.git.get("available") or not g.get("window_ok", True): return
    mod = parse_date(p.date_mod)
    if not mod or (site.today - mod).days > site.git["days"]: return
    lr = g.get("last_real_edit")
    gap = (mod - lr).days if lr else None
    if lr is None or gap > 14:
        when = f"the last substantive change was {lr}" if lr else f"no substantive change in the last {site.git['days']} days"
        A.add(p, "date-bump-only", "organic", "high",
              f"dateModified says {mod} but git shows {when} (only date/word-count lines changed since). Artificially refreshed dates are a spam/trust risk and mislead readers on price freshness.",
              "Either re-verify pricing/limits and make the real edits, or restore the honest date. Only bump dateModified in the same commit as a real content change.", "S", key=str(mod))


def search_data_post(A, p):
    g = p.gsc
    if not g: return
    imp, clk, pos = g["impressions"], g["clicks"], g["position"]
    ctr = clk / imp if imp else 0
    exp = CTR_BY_POS.get(int(round(pos)), 0) if 0 < pos <= 10.5 else 0
    top = sorted(g.get("queries", []), key=lambda q: -q[2])
    tq = f" Top query: '{top[0][0]}'." if top else ""
    if 0 < pos <= 10.5 and imp >= 100 and exp and ctr < 0.4 * exp:
        A.add(p, "gsc-ctr-low", "organic", "high", f"{int(imp)} impressions at position {pos:.1f} but CTR is {ctr:.1%} (typical for that rank ≈{exp:.0%}).{tq}",
              "Ranking isn't the problem — the snippet is. Rewrite seoTitle + metaDescription: lead with the top query's exact phrase, add a number/price/audience and a reason to click; check Search Console shows the new title (stale cache). Change one thing, re-export in 3 weeks.", "S", key=str(int(pos)))
    elif 10.5 < pos <= 20 and imp >= 50:
        A.add(p, "gsc-striking-distance", "organic", "medium", f"Average position {pos:.1f} with {int(imp)} impressions and {int(clk)} clicks — page 2, one push from page 1.{tq}",
              "Add an H2 that answers the top query, expand that section with a table/figures, add 3 contextual internal links with query-matching anchors, and refresh with real changes.", "M", key=str(int(pos)))
    elif pos > 20 and imp >= 100:
        A.add(p, "gsc-deep", "organic", "low", f"Position {pos:.0f} despite {int(imp)} impressions — relevant, but far behind the pages that rank.{tq}", "Needs materially more depth/unique data than what ranks; see the benchmark gap if configured.", "L", key=str(int(pos) // 10))
    elif pos == 0 and imp >= 200 and clk == 0:
        A.add(p, "gsc-zero-click", "organic", "high", f"{int(imp)} impressions, 0 clicks (no position data in the export).{tq}", "Rewrite seoTitle + metaDescription around the top query's intent.", "S", key=str(int(imp) // 100))
    head = keyword_tokens(" ".join([p.title, p.seo_title] + [h[1] for h in p.headings]) + " " + " ".join(words_of(p.text)[:150]))
    gaps = []
    for q, qc, qi, qp in top[:5]:
        qt = keyword_tokens(q)
        if qi >= 20 and len(qt) >= 2 and len(qt & head) / len(qt) < 0.6: gaps.append((q, int(qi)))
    if gaps:
        A.add(p, "gsc-query-gap", "organic", "medium", f"{len(gaps)} real search quer{'y' if len(gaps) == 1 else 'ies'} with impressions aren't reflected in the title/headings/intro: " + "; ".join(f"'{q}' ({i})" for q, i in gaps[:3]),
              "Give each its own H2/H3 phrased like the query (or fold it into the title/FAQ) so Google can match the page to that intent.", "S",
              snippet="\n".join(f"<h2>{q[:1].upper() + q[1:]}?</h2>" for q, _ in gaps[:3]), key="|".join(q for q, _ in gaps[:3]))


def click_data_post(A, p):
    site = A.site
    if not p.sessions and not p.aff_clicks: return
    aff = [l for l in p.links if site.is_affiliate_href(l["href"])]
    n = len(aff) + (1 if p.template_cta else 0)
    ctr = p.aff_clicks / p.sessions if p.sessions else 0
    if p.sessions >= 30 and n == 0 and revenue_potential(site, p) > 0:
        A.add(p, "traffic-no-cta", "revenue", "high", f"{int(p.sessions)} sessions but ZERO affiliate CTAs although the post discusses monetised tools.", "Add a top-pick CTA after the quick answer and a closer in the verdict section.", "S", key=str(int(p.sessions) // 50))
    elif p.sessions >= 50 and p.aff_clicks == 0 and n > 0:
        A.add(p, "aff-no-clicks", "revenue", "high", f"{int(p.sessions)} sessions, {n} affiliate link(s), 0 affiliate clicks — the CTAs are invisible or untrusted.", "Move one CTA into the first screen as a styled button, use action+benefit anchors ('Try X free →'), and link tool names inside the comparison table.", "S", key=str(int(p.sessions) // 100))
    elif p.sessions >= 50 and ctr < 0.01 and n > 0:
        A.add(p, "aff-ctr-low", "revenue", "medium", f"Affiliate CTR {ctr:.1%} ({int(p.aff_clicks)} clicks / {int(p.sessions)} sessions) is under 1%.", "Test a top-of-page pick box and an end-of-post 'Who should use what' block; keep disclosure visible so trust isn't hurt.", "S", key=str(int(ctr * 1000)))


# --- data loading -------------------------------------------------------------------------------------------
def _num(x):
    x = str(x or "").strip().replace(",", "")
    try: return float(x[:-1]) / 100 if x.endswith("%") else float(x)
    except ValueError: return 0.0


def _col(cols, *names):
    for n in names:
        for k in cols:
            if n in k: return cols[k]
    return None


def load_gsc(path):
    rows = list(csv.DictReader(open(path, encoding="utf-8-sig")))
    if not rows: return {}
    cols = {k.lower().strip(): k for k in rows[0]}
    pg, qy, cl, im, ps = (_col(cols, "page", "url"), _col(cols, "quer"), _col(cols, "click"), _col(cols, "impression"), _col(cols, "position"))
    if not pg or not im:
        print(c(YEL, f"  ! {path}: needs a page/url column and an impressions column (Search Console → Performance → Pages → export). Skipped."), file=sys.stderr); return {}
    agg = {}
    for r in rows:
        m = re.search(r"/blog/([^/?#\s]+)", r.get(pg, "") or "")
        if not m: continue
        a = agg.setdefault(m.group(1), {"clicks": 0.0, "impressions": 0.0, "pw": 0.0, "queries": []})
        i, k, pos = _num(r.get(im)), _num(r.get(cl)) if cl else 0.0, _num(r.get(ps)) if ps else 0.0
        a["clicks"] += k; a["impressions"] += i; a["pw"] += pos * i
        if qy and r.get(qy): a["queries"].append((r[qy].strip(), k, i, pos))
    return {s: {"clicks": a["clicks"], "impressions": a["impressions"], "position": a["pw"] / a["impressions"] if a["impressions"] else 0.0, "queries": a["queries"]} for s, a in agg.items()}


def load_metric(path, names):
    rows = list(csv.DictReader(open(path, encoding="utf-8-sig")))
    if not rows: return {}
    cols = {k.lower().strip(): k for k in rows[0]}
    pk = _col(cols, "page", "url", "path")
    mk = next((cols[n] for n in names if n in cols), None) or _col(cols, *names)
    out = {}
    for r in rows:
        m = re.search(r"/blog/([^/?#\s]+)", r.get(pk, "") or "")
        if m: out[m.group(1)] = out.get(m.group(1), 0.0) + _num(r.get(mk))
    return out


def git_load(site, days):
    site.git = {"available": False, "shallow": False, "days": days, "note": ""}
    if not (site.root / ".git").exists():
        site.git["note"] = "no .git folder — run inside your clone (and use fetch-depth: 0 in CI) to enable real-edit verification"; return
    try:
        sh = subprocess.run(["git", "rev-parse", "--is-shallow-repository"], cwd=site.root, capture_output=True, text=True, timeout=30)
        site.git["shallow"] = sh.stdout.strip() == "true"
        out = subprocess.run(["git", "log", f"--since={days} days ago", "--format=@@%H|%cs", "-p", "-U0", "--no-color", "--", "blog/"], cwd=site.root,
                             capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=240).stdout
    except (OSError, subprocess.SubprocessError) as e:
        site.git["note"] = f"git unavailable: {e}"; return
    if site.git["shallow"]:
        site.git["note"] = "shallow clone — history is truncated, so date-bump checks are skipped (use actions/checkout fetch-depth: 0)"; return
    hist = defaultdict(list)
    cdate, cfile, subst = "", None, {}

    def flush():
        for s, flag in subst.items(): hist[s].append((cdate, flag))
        subst.clear()
    for line in out.splitlines():
        if line.startswith("@@") and not line.startswith("@@ "):
            flush(); cdate = line.split("|")[-1]; cfile = None
        elif line.startswith("diff --git"):
            m = re.search(r" b/blog/([^/]+)\.ts$", line); cfile = m.group(1) if m else None
            if cfile: subst.setdefault(cfile, False)
        elif cfile and line[:1] in "+-" and not line.startswith(("+++", "---")):
            if not DATE_ONLY_RE.search(line): subst[cfile] = True
    flush()
    site.git["available"] = True
    for s, p in site.posts.items():
        h = hist.get(s, [])
        real = [parse_date(d) for d, f in h if f]
        p.git = {"commits": len(h), "bump_only_commits": sum(1 for _, f in h if not f), "last_real_edit": max(real) if real else None,
                 "last_commit": max((parse_date(d) for d, _ in h), default=None)}
    site.git["note"] = f"history window {days} days"


def v2_load_data(site, args):
    for p in site.posts.values():
        p.excerpt = get_field(p.raw, "excerpt")
    site.sessions, site.aff_clicks, site.gsc = {}, {}, {}
    if args.traffic: site.sessions = load_metric(args.traffic, ("sessions", "views", "users", "active users", "clicks"))
    if args.affclicks: site.aff_clicks = load_metric(args.affclicks, ("event count", "events", "clicks", "count"))
    if args.gsc: site.gsc = load_gsc(args.gsc)
    for s, p in site.posts.items():
        p.sessions, p.aff_clicks, p.gsc = site.sessions.get(s, 0.0), site.aff_clicks.get(s, 0.0), site.gsc.get(s, {})
    if not getattr(site, "traffic", None):                         # importance weighting: clicks → sessions → impressions
        for src in ({s: g["clicks"] for s, g in site.gsc.items()}, site.sessions, {s: g["impressions"] for s, g in site.gsc.items()}):
            if src and max(src.values()) > 0: site.traffic = src; break
    if args.no_git: site.git = {"available": False, "shallow": False, "days": args.git_days, "note": "disabled (--no-git)"}
    else: git_load(site, args.git_days)
    site.comm = {}
    for kv in filter(None, (args.commission or "").split(",")):
        k, _, v = kv.partition("=")
        try: site.comm[k.strip()] = float(v)
        except ValueError: pass


# --- site-level v2 analysis -----------------------------------------------------------------------------------
def boilerplate_and_duplicates(site, A):
    posts = site.posts
    sp, per = defaultdict(set), {}
    for s, p in posts.items():
        txt = p.text + " " + " ".join(a for _, a in p.faqs)
        keep = []
        for st in sentences_of(txt):
            n = norm_sentence(st)
            w = len(n.split())
            if w < 10 or BOILER_EXEMPT.search(n): continue
            keep.append((n, w)); sp[n].add(s)
        per[s] = keep
    tpl = {n for n, v in sp.items() if len(v) >= 3}
    for s, p in posts.items():
        tw = sum(w for n, w in per[s] if n in tpl)
        p.tpl_share = tw / max(1, p.words)
        p.unique_pct = round(100 * (1 - p.tpl_share), 1)
        top = sorted({n for n, _ in per[s] if n in tpl}, key=lambda n: -len(sp[n]))[:3]
        snip = "\n".join(f"×{len(sp[n])} posts: {n[:150]}" for n in top)
        if p.tpl_share >= 0.25: A.add(p, "boilerplate-heavy", "reader", "high", f"{p.tpl_share:.0%} of this post is sentences reused verbatim in 3+ other posts — a low-originality / scaled-content signal.", "Rewrite those lines with this post's own facts, or move the genuinely shared note into one site-wide component.", "M", snippet=snip, key=str(int(p.tpl_share * 20)))
        elif p.tpl_share >= 0.15: A.add(p, "boilerplate-medium", "reader", "medium", f"{p.tpl_share:.0%} of this post is reused verbatim in 3+ other posts.", "Replace the most repeated sentences with post-specific detail.", "M", snippet=snip, key=str(int(p.tpl_share * 20)))
        elif p.tpl_share >= 0.08: A.add(p, "boilerplate-light", "reader", "low", f"{p.tpl_share:.0%} reused verbatim elsewhere.", "Vary the repeated sentences.", "S", snippet=snip, key=str(int(p.tpl_share * 20)))
    site.boiler = sorted(([n, sorted(v)] for n, v in sp.items() if len(v) >= 3), key=lambda x: -len(x[1]))[:40]
    if site.boiler:
        top = site.boiler[:8]
        site_issue(site, "boilerplate-sentences", "reader", "medium", f"{len(site.boiler)}+ sentences recur across 3+ posts (most-reused appears in {len(top[0][1])} posts). Templated filler is what makes a large affiliate site look mass-produced.",
                   "Delete, rewrite per post, or render once from a shared component; keep only legally required lines (disclosure) verbatim.", "M", snippet="\n".join(f"×{len(v)}  {n[:160]}" for n, v in top), key=str(len(site.boiler)))
    sh = {}
    for s, p in posts.items():
        ws = []
        for st in sentences_of(p.text + " " + " ".join(a for _, a in p.faqs)):
            n = norm_sentence(st)
            if n in tpl or BOILER_EXEMPT.search(n): continue
            ws += n.split()
        sh[s] = {hash(" ".join(ws[i:i + 6])) for i in range(max(1, len(ws) - 5))}
    ks, pairs = list(sh), []
    for i in range(len(ks)):
        a = sh[ks[i]]
        for j in range(i + 1, len(ks)):
            b = sh[ks[j]]
            if a and b:
                jac = len(a & b) / len(a | b)
                if jac >= 0.10: pairs.append((round(jac, 3), ks[i], ks[j]))
    pairs.sort(reverse=True)
    site.near_dups = pairs[:40]
    for jac, a, b in pairs[:15]:
        if jac >= 0.12:
            site_issue(site, "near-duplicate", "organic", "high" if jac >= 0.2 else "medium", f"{a} ↔ {b} share {jac:.0%} of their distinctive phrasing (after removing site-wide boilerplate).",
                       "Give each a clearly different angle/data set, merge the weaker into the stronger with a 301, or consolidate overlapping sections.", "L", where=f"{a} / {b}", key="|".join(sorted((a, b))))


def policy_sitefiles(site):
    pat = re.compile(r"\b(seoTitle|metaDescription|description|title|excerpt|headline)\s*:\s*(['\"`])((?:\\.|(?!\2)[^\\\n])*)\2")
    found = []
    for rel in ("scripts/prerender.mjs", "metadata.ts", "pages/compare-metadata.ts", "pages/compare-data.ts", "constants.ts", "index.html"):
        for m in pat.finditer(read(site.root / rel)):
            for h, sn in claim_hits(m.group(3), TEST_HEADLINE):
                found.append((rel, m.group(1), h, sn)); break
    if found:
        site_issue(site, "policy-testing-sitefiles", "trust", "high", f"{len(found)} first-hand testing claim(s) in tool/compare/home page titles & descriptions outside blog/ (e.g. {found[0][0]} → {found[0][1]}: '{found[0][2]}').",
                   "Same rule as posts: use 'Reviewed / Compared / Researched', not 'Tested' or 'real app test'.", "S", snippet="\n".join(f"{f}: {k}: {t}" for f, k, _, t in found[:10]), key=str(len(found)))


def bulk_dates(site):
    by = defaultdict(list)
    for s, p in site.posts.items():
        d = parse_date(p.date_mod)
        if d: by[d].append(s)
    groups = [(d, ss) for d, ss in sorted(by.items(), key=lambda x: -len(x[1])) if len(ss) >= 8]
    if not groups: return
    if site.git.get("available"):
        flagged = []
        for d, ss in groups:
            bad = [s for s in ss if (site.posts[s].git.get("last_real_edit") is None or (d - site.posts[s].git["last_real_edit"]).days > 14)]
            if len(bad) / len(ss) >= 0.5: flagged.append((d, ss, bad))
        if flagged:
            n = sum(len(b) for _, _, b in flagged)
            site_issue(site, "bulk-date-bump", "organic", "high", f"{n} posts across {len(flagged)} batch date(s) have a dateModified with no real content edit near it in git (date-only commits): " + "; ".join(f"{d}: {len(b)}/{len(ss)}" for d, ss, b in flagged[:5]) + ".",
                       "Don't mass-bump dates. Re-verify and genuinely edit the highest-value posts first, and let dateModified reflect real changes only.", "M", snippet="\n".join(f"{d}: {', '.join(b[:6])}" for d, _, b in flagged[:5]), key=str(n))
    else:
        tot = sum(len(ss) for _, ss in groups)
        site_issue(site, "bulk-date-same", "organic", "medium", f"{tot} posts share one of {len(groups)} batch dateModified values (" + ", ".join(f"{d}: {len(ss)}" for d, ss in groups[:4]) + "). Fine if each was truly re-verified; a risk if it was a bulk date bump — can't be verified without git history.",
                   "Run inside your git clone (fetch-depth: 0 in CI) so the analyzer can confirm each date matches a real edit.", "S", snippet="\n".join(f"{d}: {', '.join(ss[:6])}" for d, ss in groups[:4]), key=str(tot))


def dist_checks(site, A, dist):
    root = Path(dist)
    for s, p in site.posts.items():
        f = root / "blog" / s / "index.html"
        if not f.exists():
            A.add(p, "dist-missing", "organic", "critical", f"No prerendered file at {f.relative_to(root.parent) if root.parent in f.parents else f} — search engines get an empty shell.", "Check scripts/prerender.mjs registration and re-run the build.", "M"); continue
        h = read(f)
        t = (re.search(r"<title[^>]*>(.*?)</title>", h, re.S | re.I) or [0, ""])[1].strip()
        md = htmllib.unescape((re.search(r"<meta[^>]+name=[\"']description[\"'][^>]*content=[\"']([^\"']*)", h, re.I) or [0, ""])[1])
        if p.seo_title and htmllib.unescape(t)[: min(40, len(p.seo_title))].lower() != p.seo_title[: min(40, len(p.seo_title))].lower():
            A.add(p, "dist-title-mismatch", "organic", "medium", f"Rendered <title> '{t[:70]}' differs from seoTitle '{p.seo_title[:70]}'.", "Check prerender.mjs title assembly.", "S", key=t[:30])
        if p.meta and md.strip()[:60].lower() != p.meta[:60].lower():
            A.add(p, "dist-meta-mismatch", "organic", "medium", "Rendered meta description differs from metaDescription.", "Check prerender.mjs meta injection.", "S", snippet=md[:150], key=md[:30])
        if len(re.findall(r"<h1\b", h, re.I)) != 1:
            A.add(p, "dist-h1", "organic", "high", f"{len(re.findall(r'<h1', h, re.I))} <h1> elements in prerendered HTML (need exactly 1).", "Fix the template/body headings.", "S", key=str(len(re.findall(r"<h1", h, re.I))))
        if not re.search(r"<link[^>]+rel=[\"']canonical[\"'][^>]*href=[\"'][^\"']*/blog/" + re.escape(s) + r"/?[\"']", h, re.I):
            A.add(p, "dist-canonical", "organic", "high", "Canonical URL missing or not pointing at /blog/<slug>/.", "Inject <link rel=\"canonical\"> in prerender.mjs.", "S")
        body = re.sub(r"<(script|style|nav|header|footer)\b.*?</\1>", " ", h, flags=re.S | re.I)
        rw = len(words_of(strip_tags(body)))
        if p.words and rw < 0.7 * p.words:
            A.add(p, "dist-thin", "organic", "critical", f"Prerendered HTML has {rw} words vs {p.words} in the source — the thin-body problem (crawlers see a stub).", "Ensure the article body is injected into the prerendered page.", "M", key=str(rw // 100))
        types, bad_json, strings = [], 0, []
        for m in re.finditer(r"<script[^>]+application/ld\+json[^>]*>(.*?)</script>", h, re.S | re.I):
            try: obj = json.loads(m.group(1))
            except ValueError: bad_json += 1; continue
            for o in (obj if isinstance(obj, list) else obj.get("@graph", [obj]) if isinstance(obj, dict) else []):
                if isinstance(o, dict):
                    ty = o.get("@type"); types += ty if isinstance(ty, list) else [ty]
                    strings += [v for k, v in o.items() if k in ("headline", "description", "name", "alternativeHeadline", "reviewBody") and isinstance(v, str)]
                    if o.get("@type") == "FAQPage" and len(o.get("mainEntity", [])) != len(p.faqs):
                        A.add(p, "dist-faq-count", "ai", "medium", f"FAQPage schema has {len(o.get('mainEntity', []))} Q&As but the post defines {len(p.faqs)}.", "Fix FAQ schema generation.", "S", key=str(len(p.faqs)))
        if bad_json: A.add(p, "dist-jsonld-invalid", "ai", "critical", f"{bad_json} JSON-LD block(s) fail to parse — Google ignores the schema.", "Fix the schema serialisation.", "S", key=str(bad_json))
        if not {"Article", "BlogPosting", "NewsArticle", "Review"} & set(types): A.add(p, "dist-no-article-schema", "ai", "high", "No Article/BlogPosting/Review JSON-LD in prerendered HTML.", "Inject Article schema.", "S")
        if "BreadcrumbList" not in types: A.add(p, "dist-no-breadcrumb", "ai", "low", "No BreadcrumbList JSON-LD.", "Add breadcrumb schema.", "S")
        if p.faqs and "FAQPage" not in types: A.add(p, "dist-no-faq-schema", "ai", "medium", "Post has FAQs but the prerendered page has no FAQPage JSON-LD.", "Inject FAQPage schema.", "S")
        sh = [x for s_ in strings for x, _ in [(hh, 0) for hh, _ in claim_hits(s_, TEST_HEADLINE)]]
        if sh: A.add(p, "policy-in-schema", "trust", "high", f"Testing language inside JSON-LD ('{sh[0]}') — machine-readable claims are what AI engines quote.", "Fix the source fields feeding the schema.", "S", key=sh[0])
        rendered_aff = [m for m in re.finditer(r"<a\b([^>]*)>", h, re.I) if site.is_affiliate_href(htmllib.unescape(attr(m.group(1), "href"))) and "sponsored" not in attr(m.group(1), "rel").lower()]
        if rendered_aff: A.add(p, "dist-aff-rel", "trust", "high", f"{len(rendered_aff)} affiliate link(s) in rendered HTML lack rel=\"sponsored\" (the template may strip it).", "Check the renderer's link processing.", "S", key=str(len(rendered_aff)), snippet=rendered_aff[0].group(0)[:200])


def html_metrics(html_text):
    t = html_text
    body = re.search(r"<article\b.*?</article>|<main\b.*?</main>", t, re.S | re.I)
    seg = body.group(0) if body else re.sub(r"<(script|style|nav|header|footer|aside)\b.*?</\1>", " ", t, flags=re.S | re.I)
    txt = strip_tags(seg)
    w = len(words_of(txt))
    nums = {re.sub(r"\s", "", m.group(0).lower()) for m in NUM_RE.finditer(txt)}
    ld = " ".join(re.findall(r"<script[^>]+ld\+json[^>]*>(.*?)</script>", t, re.S | re.I))
    links = re.findall(r"<a\b[^>]*href=[\"'](https?://[^\"']+)", seg, re.I)
    return {"words": w, "h2": len(re.findall(r"<h2\b", seg, re.I)), "h3": len(re.findall(r"<h3\b", seg, re.I)), "tables": len(re.findall(r"<table\b", seg, re.I)),
            "lists": len(re.findall(r"<(?:ul|ol)\b", seg, re.I)), "images": len(re.findall(r"<img\b", seg, re.I)), "faq_schema": "FAQPage" in ld,
            "numbers_per_1000w": round(len(nums) / max(1, w) * 1000, 1), "ext_links": len(links), "has_cons": bool(NEG_RE.search(txt)), "thin_fetch": w < 250}


def run_benchmarks(site, A, path, args):
    lines = [l.strip() for l in read(Path(path)).splitlines() if l.strip() and not l.strip().startswith("#")]
    f = Fetcher(args.cache, args.cache_ttl, args.timeout, args.workers)
    res = []
    for ln in lines:
        parts = ln.split(None, 1)
        slug, src = (parts[0], parts[1].strip()) if len(parts) == 2 and parts[0] in site.posts else (None, ln)
        if not slug:
            ut = keyword_tokens(re.sub(r"https?://[^/]+", "", src).replace("/", " ").replace("-", " "))
            best = max(site.posts.values(), key=lambda q: len(ut & keyword_tokens(q.slug.replace("-", " "))) / max(1, len(ut | keyword_tokens(q.slug.replace("-", " ")))), default=None)
            if best and len(ut & keyword_tokens(best.slug.replace("-", " "))) / max(1, len(ut | keyword_tokens(best.slug.replace("-", " ")))) >= 0.35: slug = best.slug
        if Path(src).exists(): htmltxt, err = read(Path(src)), ""
        else:
            key = "BM|" + src; hit = f.cache.get(key)
            if hit and time.time() - hit["ts"] < f.ttl * 7: htmltxt, err = hit["html"], ""
            else:
                st, _, data, err = f._req(src, "GET", browser=True)
                htmltxt = data.decode("utf-8", "replace") if data else ""
                err = err or ("" if st and st < 400 else f"HTTP {st}")
                if htmltxt: f.cache[key] = {"ts": time.time(), "html": htmltxt[:240000]}
        m = html_metrics(htmltxt) if htmltxt else {}
        res.append({"slug": slug, "source": src, "error": err, **m})
    f.save()
    site.benchmarks = res
    for r in res:
        p = site.posts.get(r["slug"]) if r["slug"] else None
        if not p or r.get("error") or not r.get("words") or r.get("thin_fetch"): continue
        mine = {"words": p.words, "h2": len([h for h in p.headings if h[0] == 2]), "tables": p.metrics.get("tables", 0), "lists": p.metrics.get("lists", 0), "images": len(p.images), "numbers_per_1000w": p.metrics.get("numbers_per_1000w", 0)}
        gaps = []
        if r["words"] >= 1.4 * p.words: gaps.append(f"length {r['words']} vs your {p.words} words")
        if r["tables"] >= mine["tables"] + 2: gaps.append(f"{r['tables']} tables vs your {mine['tables']}")
        if r["h2"] >= 1.5 * max(1, mine["h2"]) and r["h2"] >= mine["h2"] + 3: gaps.append(f"{r['h2']} H2 sections vs your {mine['h2']}")
        if r["numbers_per_1000w"] >= 1.5 * max(1.0, mine["numbers_per_1000w"]): gaps.append(f"{r['numbers_per_1000w']} figures/1000w vs your {mine['numbers_per_1000w']}")
        if r["images"] >= mine["images"] + 4: gaps.append(f"{r['images']} images vs your {mine['images']}")
        if r["faq_schema"] and len(p.faqs) < 5: gaps.append("they ship FAQ schema; you have <5 FAQs")
        if gaps: A.add(p, "benchmark-gap", "reader", "medium", f"Competitor {host_of(r['source']) or Path(r['source']).name} out-builds this post on: " + "; ".join(gaps) + ".", "Match or beat them on the specific dimensions above with ORIGINAL content (don't copy structure): add the missing table/data/sections.", "L", where=r["source"], key=host_of(r["source"]) + str(len(gaps)))


# --- strength index (relative competitiveness; no ceiling) ------------------------------------------------------
STRENGTH_W = {"uniqueness": 20, "evidence": 20, "decision": 15, "structure": 15, "depth": 10, "freshness": 10, "monetisation": 10}


def cta_strength(site, p):
    aff = [l for l in p.links if site.is_affiliate_href(l["href"])]
    n = len(aff) + (1 if p.template_cta else 0)
    if n == 0: return 0.0
    pos = [l["pos"] for l in aff]
    sc = 0.0
    if p.template_cta or any(x <= 0.35 for x in pos): sc += 0.3
    if any(x >= 0.75 for x in pos): sc += 0.2
    if any(site.is_affiliate_href(h) for t in re.findall(r"<table.*?</table>", p.content, re.S | re.I) for h in re.findall(r'href="([^"]+)"', t)): sc += 0.2
    tr = [s for s, k in p.tools_mentioned.items() if k >= 4 and site.is_tracked(site.aff_links.get(s, ""))]
    sc += 0.2 * (sum(1 for s in tr if s in p.tools_with_cta) / len(tr) if tr else 1.0)
    good = [l for l in aff if l["anchor"].strip().lower() not in GENERIC_ANCHORS and len(l["anchor"].strip()) >= 4]
    sc += 0.1 * (len(good) / len(aff) if aff else 0)
    return min(1.0, sc)


def compute_strength(site):
    for s, p in site.posts.items():
        m, kind = p.metrics, post_kind(p)
        fs = m.get("first_screen", {})
        age = (site.today - (parse_date(p.date_mod) or site.today)).days
        lim = FRESH_DAYS[kind]
        fresh = 1.0 if age <= 0.5 * lim else clamp(1 - (age - 0.5 * lim) / (1.5 * lim))
        g = p.git or {}
        if site.git.get("available") and (age <= site.git["days"]) and (g.get("last_real_edit") is None or (parse_date(p.date_mod) - g["last_real_edit"]).days > 14): fresh *= 0.2
        tpos = (re.search(r"<table", p.content, re.I).start() / max(1, len(p.content))) if re.search(r"<table", p.content, re.I) else None
        qa_n = len(words_of(p.quick_answer))
        structure = (0.3 * (0 if tpos is None else 1.0 if tpos <= 0.35 else 0.6) + 0.25 * clamp(len(p.faqs) / 8) + 0.2 * (1 if 30 <= qa_n <= 85 else 0) +
                     0.15 * clamp(m.get("lists", 0) / 3) + 0.1 * clamp(len([h for h in p.headings if h[0] == 2]) / max(4, p.words // 450)))
        bridge = 0
        if p.intent != "transactional" or kind in ("article", "howto"):
            bridge = clamp(len({l["href"].rstrip("/") for l in p.links if re.match(r"/(?:blog|tools|compare)/", l["href"])}) / 3)
        money = cta_strength(site, p) if (p.intent == "transactional" and kind not in ("article", "howto")) else 0.6 * bridge + 0.4 * cta_strength(site, p)
        parts = {"uniqueness": clamp((p.unique_pct - 70) / 30),
                 "evidence": 0.5 * clamp(m.get("numbers_per_1000w", 0) / 12) + 0.3 * m.get("sourced_ratio", 1.0) + 0.2 * clamp(m.get("ext_domains", 0) / 6),
                 "decision": 0.5 * (sum(fs.values()) / 4 if fs else 0) + 0.3 * clamp(m.get("verdicts", 0) / 6) + 0.2 * (1 if m.get("has_negatives") else 0),
                 "structure": structure, "depth": clamp(p.words / (MIN_WORDS[kind] * 1.25)), "freshness": fresh, "monetisation": money}
        p.strength_parts = {k: round(v, 3) for k, v in parts.items()}
        p.strength = round(sum(parts[k] * STRENGTH_W[k] for k in parts), 1)
    vals = sorted(p.strength for p in site.posts.values())
    for p in site.posts.values():
        p.strength_pct = round(100 * sum(1 for v in vals if v <= p.strength) / max(1, len(vals)))


def tier(x): return "Strong" if x >= 85 else "Solid" if x >= 70 else "Needs work" if x >= 55 else "Weak"


def build_money_plan(site, limit=40):
    rows = []
    for s, p in site.posts.items():
        cs = cta_strength(site, p)
        tr = [(t, n) for t, n in p.tools_mentioned.items() if site.is_tracked(site.aff_links.get(t, ""))]
        val = sum(min(n, 10) * site.comm.get(t, 1.0) for t, n in tr)
        imp = p.gsc.get("impressions", 0) if p.gsc else 0
        demand, basis = (p.sessions, "sessions") if p.sessions else (imp, "impressions") if imp else (p.importance * 20, "importance proxy")
        opp = demand * (1 - cs) * (0.3 + min(val, 30) / 30)
        missing = [t for t, n in sorted(tr, key=lambda x: -x[1]) if t not in p.tools_with_cta and n >= 2][:3]
        rows.append({"slug": s, "opportunity": round(opp, 1), "cta_strength": round(cs, 2), "demand": round(demand, 1), "demand_basis": basis, "sessions": p.sessions, "aff_clicks": p.aff_clicks,
                     "ctr": round(p.aff_clicks / p.sessions, 4) if p.sessions else None, "tracked_tools": [t for t, _ in sorted(tr, key=lambda x: -x[1])[:4]], "missing_cta_tools": missing,
                     "revenue_issues": [i.code for i in sorted(p.issues, key=lambda i: -i.priority) if i.pillar == "revenue"][:5]})
    rows.sort(key=lambda r: -r["opportunity"])
    return rows[:limit]


# --- trend history ----------------------------------------------------------------------------------------------
def update_history(site, rep, path):
    P = Path(path)
    try: h = json.loads(P.read_text())
    except Exception: h = []
    entry = {"date": str(site.today), "version": VERSION, "avg_score": rep["summary"]["avg_score"], "avg_strength": rep["summary"]["avg_strength"],
             "pillars": rep["summary"]["pillar_avg"], "severity": rep["summary"]["severity"], "posts": {p["slug"]: [p["score"], p["strength"]] for p in rep["posts"]}}
    prev = h[-1] if h else None
    h = [e for e in h if e["date"] != entry["date"]] + [entry]
    P.write_text(json.dumps(h[-60:], indent=1), encoding="utf-8")
    t = {"runs": len(h), "previous": prev["date"] if prev else None}
    if prev:
        t["d_score"] = round(entry["avg_score"] - prev["avg_score"], 1)
        t["d_strength"] = round(entry["avg_strength"] - prev["avg_strength"], 1)
        mv = sorted(((e[1] - prev["posts"][s][1], s) for s, e in entry["posts"].items() if s in prev["posts"]), key=lambda x: x[0])
        t["regressed"] = [(s, round(d, 1)) for d, s in mv[:5] if d < 0]
        t["improved"] = [(s, round(d, 1)) for d, s in mv[::-1][:5] if d > 0]
    t["series"] = [{"date": e["date"], "score": e["avg_score"], "strength": e["avg_strength"]} for e in h]
    return t


# --- reporting ------------------------------------------------------------------------------------------------------
def attach_v2(site, rep, args):
    by = {p.slug: p for p in site.posts.values()}
    for r in rep["posts"]:
        p = by[r["slug"]]
        r.update({"strength": p.strength, "tier": tier(p.strength), "strength_pct": p.strength_pct, "strength_parts": p.strength_parts, "unique_pct": p.unique_pct,
                  "metrics": {k: v for k, v in p.metrics.items()}, "git": {k: str(v) for k, v in (p.git or {}).items()}, "search": ({k: (round(v, 2) if isinstance(v, float) else v) for k, v in p.gsc.items() if k != "queries"} if p.gsc else None),
                  "sessions": p.sessions, "aff_clicks": p.aff_clicks})
    st = [p.strength for p in site.posts.values()]
    rep["summary"]["avg_strength"] = round(sum(st) / max(1, len(st)), 1)
    rep["summary"]["tiers"] = dict(Counter(tier(x) for x in st))
    rep["summary"]["avg_unique_pct"] = round(sum(p.unique_pct for p in site.posts.values()) / max(1, len(st)), 1)
    pol = [i for i in all_issues(site) if i.code.startswith("policy-")]
    gs = site.gsc
    rep["v2"] = {"policy": {"critical": sum(1 for i in pol if i.severity == "critical"), "total": len(pol), "posts": sorted({i.slug for i in pol if i.slug})},
                 "boilerplate": [{"sentence": n[:200], "posts": len(v), "slugs": v[:12]} for n, v in getattr(site, "boiler", [])[:25]],
                 "near_duplicates": [{"similarity": j, "a": a, "b": b} for j, a, b in getattr(site, "near_dups", [])[:25]],
                 "money_plan": build_money_plan(site), "git": site.git, "benchmarks": getattr(site, "benchmarks", []),
                 "search": ({"posts": len(gs), "impressions": sum(g["impressions"] for g in gs.values()), "clicks": sum(g["clicks"] for g in gs.values())} if gs else None),
                 "data": {"gsc": bool(gs), "sessions": bool(site.sessions), "aff_clicks": bool(site.aff_clicks), "dist": bool(args.dist)}, "trend": None}
    if args.history: rep["v2"]["trend"] = update_history(site, rep, args.history)


def print_v2(site, rep):
    s, v = rep["summary"], rep["v2"]
    tr = s["tiers"]
    print(f"Strength index {c(BLD, str(s['avg_strength']))}/100 (relative competitiveness)  " + " · ".join(f"{k} {tr.get(k, 0)}" for k in ("Strong", "Solid", "Needs work", "Weak")) + f"   uniqueness {s['avg_unique_pct']}%")
    print(f"Policy: {c(RED if v['policy']['critical'] else GRN, str(v['policy']['critical']) + ' critical')} 'tested'-type claims · {v['policy']['total']} total across {len(v['policy']['posts'])} posts"
          + (f"   git: {site.git['note']}" if site.git.get("note") else ""))
    d = [k for k, on in v["data"].items() if on]
    print(f"Data used: {', '.join(d) if d else 'none (add --gsc / --traffic / --affclicks for real revenue + ranking guidance)'}")
    if v["money_plan"]:
        print(c(BLD, "Money plan — top 5 posts by revenue opportunity"))
        for r in v["money_plan"][:5]:
            print(f"   {r['opportunity']:>8}  {r['slug']:<48.48} CTA strength {r['cta_strength']}  demand={r['demand']} ({r['demand_basis']})  add CTA for: {', '.join(r['missing_cta_tools']) or '-'}")
    if v["trend"] and v["trend"].get("previous"):
        t = v["trend"]; print(f"Trend vs {t['previous']}: score {t['d_score']:+}  strength {t['d_strength']:+}")


def v2_checklist_head(rep):
    v, L = rep["v2"], []
    L += ["## 0. Fix first — policy & integrity", ""]
    allp = [(p["slug"], i) for p in rep["posts"] for i in p["issues"] if i["code"].startswith("policy-") and i["severity"] in ("critical", "high")]
    allp += [("", i) for i in rep["site_issues"] if i["code"].startswith("policy-")]
    allp += [(p["slug"], i) for p in rep["posts"] for i in p["issues"] if i["code"] in ("date-bump-only", "dist-thin", "dist-missing", "dist-jsonld-invalid")]
    if allp:
        L += ["_Replace 'Tested / hands-on / real app test' with 'Compared / Researched / Reviewed / Ranked' (name third-party benchmarks explicitly). Fix titles & meta first: they are the most visible claims._", ""]
        for slug, i in allp[:60]:
            L.append(f"- [ ] **{i['severity'].upper()}** `{slug or 'SITE'}` — {i['message'][:230]}")
            if i["snippet"]: L.append(f"  - `{i['snippet'].splitlines()[0][:200]}`")
    else: L.append("- none 🎉")
    L += ["", "## 0b. Money plan — where a fix earns the most", "", "| # | Post | Opportunity | CTA strength | Demand basis | Add CTA for |", "|---|---|---|---|---|---|"]
    for n, r in enumerate(v["money_plan"][:15], 1): L.append(f"| {n} | `{r['slug']}` | {r['opportunity']} | {r['cta_strength']} | {r['demand']} ({r['demand_basis']}) | {', '.join(r['missing_cta_tools']) or '—'} |")
    L += ["", "## 0c. Weakest posts by Strength Index (relative competitiveness)", "", "| Post | Strength | Tier | Limiting dimension |", "|---|---|---|---|"]
    for r in sorted(rep["posts"], key=lambda r: r["strength"])[:15]:
        lim = min(r["strength_parts"].items(), key=lambda kv: kv[1] / (STRENGTH_W[kv[0]] / 20))
        L.append(f"| `{r['slug']}` | {r['strength']} | {r['tier']} | {lim[0]} ({int(lim[1] * 100)}%) |")
    if v["boilerplate"]:
        L += ["", "## 0d. Sentences repeated across posts (rewrite or move to one component)", ""]
        for b in v["boilerplate"][:12]: L.append(f"- ×{b['posts']} — {b['sentence'][:180]}")
    if v["near_duplicates"]:
        L += ["", "## 0e. Overlapping posts (differentiate or merge)", ""]
        for d in v["near_duplicates"][:12]: L.append(f"- {int(d['similarity'] * 100)}% — `{d['a']}` ↔ `{d['b']}`")
    L.append("")
    return L


# --- extra HTML tabs ---------------------------------------------------------------------------------------------
HTML_V2_JS = r"""
function tabStrength(){const rows=D.posts.slice().sort((a,b)=>a.strength-b.strength),names=rows[0]?Object.keys(rows[0].strength_parts):[],tb=$('tbody');
rows.forEach(p=>tb.append($('tr',{},$('td',{},p.strength),$('td',{},p.tier),$('td',{},p.slug),$('td',{},p.unique_pct+'%'),...names.map(n=>$('td',{},Math.round(p.strength_parts[n]*100))))));
return $('div',{},$('small',{},'Relative competitiveness (0-100, no ceiling): uniqueness, evidence, decision usefulness, structure, depth, freshness (git-verified when available), monetisation. Cells are % of the maximum for that dimension — your lowest cell is the thing to fix.'),
$('table',{},$('thead',{},$('tr',{},...['Strength','Tier','Post','Unique',...names].map(h=>$('th',{},h)))),tb))}
function tabMoney(){const m=D.v2.money_plan||[];return $('div',{},$('small',{},'Opportunity = demand (sessions → GSC impressions → importance proxy) × (1 − CTA strength) × commission-weighted tool value.'),
$('table',{},$('thead',{},$('tr',{},...['Post','Opportunity','CTA strength','Demand','Aff. clicks','CTR','Add CTA for','Revenue issues'].map(h=>$('th',{},h)))),$('tbody',{},...m.map(r=>$('tr',{},$('td',{},r.slug),$('td',{},r.opportunity),$('td',{},r.cta_strength),$('td',{},r.demand+' ('+r.demand_basis+')'),$('td',{},r.aff_clicks),$('td',{},r.ctr==null?'—':(r.ctr*100).toFixed(1)+'%'),$('td',{},(r.missing_cta_tools||[]).join(', ')||'—'),$('td',{},(r.revenue_issues||[]).join(', ')))))))}
function tabDupes(){const w=$('div');w.append($('h3',{},'Sentences reused across 3+ posts'),$('table',{},...D.v2.boilerplate.map(b=>$('tr',{},$('td',{},'×'+b.posts),$('td',{},b.sentence),$('td',{},b.slugs.slice(0,4).join(', '))))),
$('h3',{},'Overlapping posts (distinctive-phrase similarity)'),$('table',{},...D.v2.near_duplicates.map(d=>$('tr',{},$('td',{},Math.round(d.similarity*100)+'%'),$('td',{},d.a),$('td',{},d.b)))));return w}
function tabBench(){const b=D.v2.benchmarks||[];if(!b.length)return $('div',{},'Pass --benchmarks FILE (lines: "<your-slug> <competitor URL or saved .html>") to compare against MarketerMilk / Futurepedia pages.');
return $('table',{},$('thead',{},$('tr',{},...['Your post','Competitor','Words','H2','Tables','Figures/1000w','FAQ schema','Note'].map(h=>$('th',{},h)))),$('tbody',{},...b.map(r=>$('tr',{},$('td',{},r.slug||'(unmapped)'),$('td',{},(r.source||'').slice(0,60)),$('td',{},r.words??'—'),$('td',{},r.h2??'—'),$('td',{},r.tables??'—'),$('td',{},r.numbers_per_1000w??'—'),$('td',{},r.faq_schema?'yes':'no'),$('td',{},r.error||(r.thin_fetch?'thin fetch (JS-rendered? save the page as .html)':''))))))}
function tabTrend(){const t=D.v2.trend;if(!t)return $('div',{},'Run with --history .analyzer-history.json to track progress run over run.');
return $('div',{},$('p',{},`Runs: ${t.runs}`+(t.previous?` · vs ${t.previous}: score ${t.d_score>0?'+':''}${t.d_score}, strength ${t.d_strength>0?'+':''}${t.d_strength}`:'')),
$('table',{},$('thead',{},$('tr',{},...['Date','Hygiene score','Strength'].map(h=>$('th',{},h)))),$('tbody',{},...t.series.map(s=>$('tr',{},$('td',{},s.date),$('td',{},s.score),$('td',{},s.strength))))),
$('p',{},'Regressed: '+((t.regressed||[]).map(x=>x[0]+' '+x[1]).join(', ')||'none')),$('p',{},'Improved: '+((t.improved||[]).map(x=>x[0]+' +'+x[1]).join(', ')||'none')))}
Object.assign(tabs,{'Strength index':tabStrength,'Money plan':tabMoney,'Duplicates':tabDupes,'Benchmarks':tabBench,'Trend':tabTrend});
"""


Analyzer.v2 = lambda self, p: v2_post_checks(self, p)


# ───────────────────────────── CLI ─────────────────────────────
def main(argv=None):
    ap = argparse.ArgumentParser(description="AI Nexus site-wide blog analyzer", formatter_class=argparse.RawDescriptionHelpFormatter, epilog=__doc__)
    ap.add_argument("slugs", nargs="*", help="focus on these post slugs (verbose per-post output)")
    ap.add_argument("--root", default=str(Path(__file__).resolve().parent), help="repo root (default: script folder)")
    ap.add_argument("--today", help="override today's date (YYYY-MM-DD)")
    ap.add_argument("--live", action="store_true", help="enable live web checks (links, affiliate URLs, pricing pages)")
    ap.add_argument("--no-pricing", action="store_true", help="skip vendor pricing-page verification in --live mode")
    ap.add_argument("--workers", type=int, default=10)
    ap.add_argument("--timeout", type=int, default=12)
    ap.add_argument("--cache", default=".blog_analyzer_cache.json")
    ap.add_argument("--cache-ttl", type=float, default=24, help="hours to reuse live-check results")
    ap.add_argument("--weights", default="", help="e.g. revenue=30,organic=25,ai=20,reader=15,trust=10")
    ap.add_argument("--traffic", help="optional GA4/GSC CSV (page/url + clicks|sessions|views) to weight importance")
    ap.add_argument("--html"); ap.add_argument("--json"); ap.add_argument("--csv"); ap.add_argument("--checklist")
    ap.add_argument("--top", type=int, default=25)
    ap.add_argument("--ci", action="store_true", help="exit 1 if the quality gate fails")
    ap.add_argument("--min-score", type=float, default=75)
    ap.add_argument("--max-critical", type=int, default=0)
    ap.add_argument("--fail-on-high", action="store_true")
    ap.add_argument("--baseline", help="JSON from --write-baseline; CI then fails only on NEW issues / regressions")
    ap.add_argument("--write-baseline")
    ap.add_argument("--gsc", help="Search Console export CSV (Pages tab; add a Query column for per-query gap analysis)")
    ap.add_argument("--affclicks", help="GA4 export CSV of affiliate_click events by page (page path + event count)")
    ap.add_argument("--commission", default="", help="tool=weight pairs to rank money-plan value, e.g. elevenlabs=3,murf=2 (default equal)")
    ap.add_argument("--dist", help="folder with prerendered HTML (e.g. dist) to verify title/meta/H1/schema/body words")
    ap.add_argument("--benchmarks", help="text file of competitor pages: '<your-slug> <URL or saved .html>' per line")
    ap.add_argument("--history", help="JSON file that accumulates run-over-run scores (e.g. .analyzer-history.json)")
    ap.add_argument("--no-git", action="store_true", help="skip git-history checks")
    ap.add_argument("--git-days", type=int, default=150, help="git history window for real-edit verification")
    ap.add_argument("--strict-policy", action="store_true", help="--ci also fails on ANY critical policy violation, baseline or not")
    args = ap.parse_args(argv)

    weights = dict(DEFAULT_WEIGHTS)
    for kv in filter(None, args.weights.split(",")):
        k, _, v = kv.partition("=")
        if k.strip() in weights: weights[k.strip()] = float(v)
    today = parse_date(args.today) if args.today else date.today()
    root = Path(args.root)
    if not (root / "blog").is_dir():
        sys.exit(f"No blog/ directory under {root} — run from the repo root or pass --root")
    site = Site(root, today)
    if args.traffic: site.traffic = load_traffic(args.traffic)
    site.load_posts()
    v2_load_data(site, args)
    A = Analyzer(site)
    for p in site.posts.values(): A.analyze(p)
    site_analysis(site, A)
    boilerplate_and_duplicates(site, A); policy_sitefiles(site); bulk_dates(site)
    if args.dist: dist_checks(site, A, args.dist)
    if args.benchmarks: run_benchmarks(site, A, args.benchmarks, args)
    if args.slugs:
        unknown = [s for s in args.slugs if s not in site.posts]
        if unknown: sys.exit("Unknown slug(s): " + ", ".join(unknown))
    if args.live: run_live(site, A, args)
    score_all(site, weights)
    compute_strength(site)
    rep = build_report(site, weights, args)
    if args.slugs:
        keep = set(args.slugs)
        site.posts = {s: p for s, p in site.posts.items() if s in keep}
    print_summary(site, rep, args)
    for flag, fn in ((args.html, lambda: write_html(rep, args.html)), (args.json, lambda: Path(args.json).write_text(json.dumps(rep, indent=1, ensure_ascii=False), encoding="utf-8")),
                     (args.csv, lambda: write_csv(site, rep, args.csv)), (args.checklist, lambda: write_checklist(site, rep, args.checklist)),
                     (args.write_baseline, lambda: write_baseline(site, args.write_baseline))):
        if flag:
            fn(); print(c(GRN, f"wrote {flag}"))
    if args.ci:
        fails = ci_gate(site, rep, args)
        if fails:
            print(c(RED, "\nCI GATE FAILED: ") + "; ".join(fails)); sys.exit(1)
        print(c(GRN, "\nCI gate passed"))


if __name__ == "__main__":
    main()
