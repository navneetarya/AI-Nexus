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

VERSION = "1.0"
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
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9\"“(])", text)
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
                for k, v in re.findall(r"'([a-z0-9\-]+)'\s*:\s*\[([^\]]*)\]", m.group(1)):
                    target[k] = re.findall(r"'([a-z0-9\-]+)'", v)

    # tool helpers
    def is_tracked(self, url: str) -> bool:
        if not url: return False
        u = urlparse(url)
        if any(host_of(url).endswith(d) for d in AFF_DOMAINS): return True
        q = {k.lower() for k in parse_qs(u.query)}
        if q & AFF_PARAMS: return True
        return "utm_medium=affiliate" in url

    def is_affiliate_href(self, href: str) -> bool:
        if self.is_tracked(href): return True
        n = norm_url(href)
        return any(norm_url(v) == n for v in self.aff_links.values() if self.is_tracked(v))

    PATTERN_OVERRIDES = {"make": [r"Make\.com", r"Make (?:Pro|Core|Teams|Free|Enterprise)\b", r"(?<=vs )Make\b", r"(?<=vs\. )Make\b", r"\bMake's\b", r"\bMake (?:scenarios?|automations?|vs)\b"],
                         "pi": [r"\bPi \(Presentation Intelligence\)", r"Presentation Intelligence"]}

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
                   self.affiliate, self.geo, self.reader, self.trust, self.integrity):
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
        if with_id >= len(hs) * 0.5 and len(hs) - with_id >= 2:
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
            if tables and kind in ("roundup", "comparison", "alternatives", "pricing") and not any(site.is_affiliate_href(h) for t in tables for h in re.findall(r'href="([^"]+)"', t)):
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
        if "data-speakable" not in p.content: self.add(p, "speakable", "ai", "low", "No data-speakable block in content.", "Wrap the quick answer in data-speakable=\"quick-answer\".", "S")
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
        if p.words > 2500 and not anchors: self.add(p, "no-toc", "reader", "low", "Long post without a table of contents / jump links.", "Add a 'Jump to' list linking to H2 ids.", "S")
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
        if p.intent == "transactional" and revenue_potential(site, p) >= 12 and p.pagerank < median_pr and p.inbound > 2:
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

    def _req(self, url, method):
        self._wait(host_of(url))
        req = urllib.request.Request(url, method=method, headers={"User-Agent": self.UA, "Accept": "text/html,application/xhtml+xml,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.9"})
        try:
            with self.opener.open(req, timeout=self.timeout) as r:
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
        if st in (404, 410) or (st == 0 and "timed out" not in r["error"].lower()): cls = "broken"
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
    return rep


def print_summary(site, rep, args):
    s = rep["summary"]
    print(c(BLD, f"\nAI Nexus blog analyzer v{VERSION} — {rep['meta']['posts']} posts · {'LIVE + static' if rep['meta']['live'] else 'static only (add --live for web checks)'}"))
    print(f"Site score {c(BLD, str(s['avg_score']))}/100   " + "  ".join(f"{PILLAR_LABEL[k]} {v:.0f}" for k, v in s["pillar_avg"].items()))
    sv = s["severity"]
    print(f"Issues: {c(RED, str(sv.get('critical', 0)) + ' critical')} · {c(YEL, str(sv.get('high', 0)) + ' high')} · {sv.get('medium', 0)} medium · {sv.get('low', 0)} low"
          + "   Grades: " + " ".join(f"{g}:{n}" for g, n in sorted(s["grades"].items())))
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
        w.writerow(["slug", "kind", "intent", "words", "score", "grade"] + PILLARS + ["critical", "high", "medium", "low", "inbound", "pagerank_x1000", "importance", "top_issue"])
        for p in rep["posts"]:
            cnt = Counter(i["severity"] for i in p["issues"])
            w.writerow([p["slug"], p["kind"], p["intent"], p["words"], p["score"], p["grade"]] + [p["scores"][k] for k in PILLARS]
                       + [cnt.get("critical", 0), cnt.get("high", 0), cnt.get("medium", 0), cnt.get("low", 0), p["inbound"], p["pagerank"], p["importance"],
                          p["issues"][0]["message"][:120] if p["issues"] else ""])


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
    Path(path).write_text("\n".join(L), encoding="utf-8")


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
    Path(path).write_text(HTML_TMPL.replace("__DATA__", data), encoding="utf-8")


# ───────────────────────────── CI gate ─────────────────────────────
def ci_gate(site, rep, args):
    base = set()
    if args.baseline and Path(args.baseline).exists():
        base = set(json.loads(Path(args.baseline).read_text()).get("fingerprints", []))
    fails, notes = [], []
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
    A = Analyzer(site)
    for p in site.posts.values(): A.analyze(p)
    site_analysis(site, A)
    if args.slugs:
        unknown = [s for s in args.slugs if s not in site.posts]
        if unknown: sys.exit("Unknown slug(s): " + ", ".join(unknown))
    if args.live: run_live(site, A, args)
    score_all(site, weights)
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
