#!/usr/bin/env python3
"""
validate_blog_quality.py
=========================
Unified, scored blog quality validator for AI Nexus (blog/*.ts).

This is a NEW, independent layer on top of the existing validate_*.py family
(validate_readability_engagement.py, validate_blog_structure.py,
validate_cta_consistency.py, validate_audit_fixes.py, validate_v3_fixes.py,
validate_critical_fixes.py, validate_blog_registration.py, etc.). Those scripts
are untouched and still the source of truth for their specific checks (CI
registration gates, CTA style fingerprints, etc). This script does not call
or replace them — it adds a single 0-100 SCORED report per post, covering the
full "make the blog readable & engaging" checklist across seven categories:

    1. SEO & Metadata        (15 pts)
    2. Readability            (20 pts)
    3. Engagement & Scan-ability (20 pts)
    4. Trust / E-E-A-T         (15 pts)
    5. AEO/GEO (AI search)     (15 pts)
    6. Conversion / CTA        (10 pts)
    7. Internal Links          ( 5 pts)
                                ---------
                                100 pts

Each category returns a score + a list of human-readable issues. A post's
total score maps to a letter grade (A+ down to F). This script is REPORT
ONLY — it never modifies files.

Outputs:
    - Colored terminal summary (always)
    - --json  <path>   full machine-readable report
    - --csv   <path>   one row per post, one column per category score
    - --html  <path>   a single self-contained dashboard file (no CDN deps)

CI usage:
    python3 validate_blog_quality.py --min-score 60
    Exit code 1 if ANY post scores below --min-score (default: 60).
    Exit code 0 otherwise.

Usage:
    python3 validate_blog_quality.py                          # all posts, terminal only
    python3 validate_blog_quality.py <slug>                    # one post, verbose
    python3 validate_blog_quality.py --json report.json --csv report.csv --html dashboard.html
    python3 validate_blog_quality.py --min-score 70            # stricter CI gate
"""

import argparse
import csv as csv_module
import json
import re
import sys
from datetime import datetime, date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BLOG_DIR = ROOT / "blog"
NON_POST_FILES = {"index.ts", "metadata.ts", "loaders.ts", "types.ts"}

RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"

CATEGORY_WEIGHTS = {
    "seo": 15,
    "readability": 20,
    "engagement": 20,
    "trust": 15,
    "aeo": 15,
    "conversion": 10,
    "links": 5,
}
CATEGORY_LABELS = {
    "seo": "SEO & Metadata",
    "readability": "Readability",
    "engagement": "Engagement & Scan-ability",
    "trust": "Trust / E-E-A-T",
    "aeo": "AEO/GEO (AI Search)",
    "conversion": "Conversion / CTA",
    "links": "Internal Links",
}

# ── AI-writing tell / filler phrases (independent pattern set) ─────────────
FILLER_PHRASES = [
    r"\bit'?s worth noting\b", r"\bit is important to note\b",
    r"\bin today'?s (?:fast-paced|digital|ever-evolving)\b",
    r"\bat the end of the day\b", r"\bwhen it comes to\b",
    r"\bin the world of\b", r"\bin the realm of\b",
    r"\bplays a (?:vital|significant|crucial|key|pivotal) role\b",
    r"\bstands as a testament\b", r"\bis a testament to\b",
    r"\bunderscores (?:its|the) (?:importance|significance)\b",
    r"\bnot only .+? but also\b",
    r"\bboasts a\b", r"\bin conclusion\b", r"\boverall,\b",
    r"\bindustry reports (?:show|suggest|indicate)\b",
]
FILLER_RE = re.compile("|".join(FILLER_PHRASES), re.IGNORECASE)

CONTENT_RE = re.compile(r"content:\s*`(.*)`", re.S)
FIELD_RE = lambda name: re.compile(rf"{name}:\s*'((?:[^'\\]|\\.)*)'", re.S)
FIELD_RE_DQ = lambda name: re.compile(rf'{name}:\s*"((?:[^"\\]|\\.)*)"', re.S)


def unescape_ts_string(s):
    return (s.replace("\\'", "'").replace('\\"', '"')
             .replace("\\n", " ").replace("\\u2019", "\u2019")
             .replace("\\u2014", "\u2014").replace("\\u201c", "\u201c")
             .replace("\\u201d", "\u201d"))


def get_field(raw, name):
    for rx in (FIELD_RE(name), FIELD_RE_DQ(name)):
        m = rx.search(raw)
        if m:
            return unescape_ts_string(m.group(1))
    return None


def get_post_files(slug=None):
    if slug:
        f = BLOG_DIR / f"{slug}.ts"
        if not f.exists():
            print(f"{RED}No such file: {f}{RESET}")
            sys.exit(1)
        return [f]
    return sorted(p for p in BLOG_DIR.glob("*.ts") if p.name not in NON_POST_FILES)


def strip_tags(html):
    html = re.sub(r"</(li|p|h[1-6]|div|td|th)>", ". ", html, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"&nbsp;|&amp;|&#\d+;", " ", text)
    text = re.sub(r"\.\s*\.", ".", text)
    return re.sub(r"\s+", " ", text).strip()


def strip_tables(html):
    return re.sub(r"<table[^>]*>.*?</table>", " ", html, flags=re.S)


def count_syllables(word):
    word = word.lower().strip(".,!?;:\"'()")
    if not word:
        return 0
    vowels = "aeiouy"
    count, prev_vowel = 0, False
    for ch in word:
        is_vowel = ch in vowels
        if is_vowel and not prev_vowel:
            count += 1
        prev_vowel = is_vowel
    if word.endswith("e") and count > 1:
        count -= 1
    return max(count, 1)


def flesch_reading_ease(text):
    sentences = [s for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    words = re.findall(r"[A-Za-z']+", text)
    if not sentences or not words:
        return 0.0
    syllables = sum(count_syllables(w) for w in words)
    asl = len(words) / len(sentences)
    asw = syllables / len(words)
    return 206.835 - 1.015 * asl - 84.6 * asw


def parse_list_field(raw, field_name):
    """Roughly count entries in an array-of-object field like faqs / outboundCitations."""
    m = re.search(rf"{field_name}:\s*\[(.*?)\n\s*\],?\n", raw, re.S)
    if not m:
        return []
    block = m.group(1)
    # count top-level object openings "{"
    return re.findall(r"\{", block)


def parse_proscons(raw):
    m = re.search(r"proscons:\s*\{(.*?)\n\s*\},?\n", raw, re.S)
    if not m:
        return (0, 0)
    block = m.group(1)
    pros_m = re.search(r"pros:\s*\[(.*?)\]", block, re.S)
    cons_m = re.search(r"cons:\s*\[(.*?)\]", block, re.S)
    pros_n = len(re.findall(r"'(?:[^'\\]|\\.)*'\s*,?", pros_m.group(1))) if pros_m else 0
    cons_n = len(re.findall(r"'(?:[^'\\]|\\.)*'\s*,?", cons_m.group(1))) if cons_m else 0
    return (pros_n, cons_n)


def score_seo(raw, fields, word_count):
    issues, pts = [], 0
    max_pts = CATEGORY_WEIGHTS["seo"]

    seo_title = fields.get("seoTitle") or fields.get("title") or ""
    meta_desc = fields.get("metaDescription") or ""
    quick_answer = fields.get("quickAnswer") or ""

    # seoTitle length (4 pts)
    if 40 <= len(seo_title) <= 65:
        pts += 4
    elif seo_title:
        pts += 2
        issues.append(f"seoTitle length {len(seo_title)} chars (ideal 40-65)")
    else:
        issues.append("seoTitle missing")

    # metaDescription length (5 pts)
    if 120 <= len(meta_desc) <= 165:
        pts += 5
    elif meta_desc:
        pts += 2
        issues.append(f"metaDescription length {len(meta_desc)} chars (ideal 120-165)")
    else:
        issues.append("metaDescription missing")

    # quickAnswer present + right length for featured-snippet targeting (4 pts)
    qa_words = len(quick_answer.split())
    if quick_answer and 30 <= qa_words <= 75:
        pts += 4
    elif quick_answer:
        pts += 2
        issues.append(f"quickAnswer is {qa_words} words (ideal ~40-60)")
    else:
        issues.append("quickAnswer missing (hurts featured-snippet / AI Overview eligibility)")

    # year/currency in title signals freshness (2 pts)
    if re.search(r"20(2[5-9]|3\d)", seo_title):
        pts += 2
    else:
        issues.append("no year in seoTitle — may read as stale to searchers")

    return min(pts, max_pts), max_pts, issues


def score_readability(text, html, word_count):
    issues, pts = [], 0
    max_pts = CATEGORY_WEIGHTS["readability"]

    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    sentence_lengths = [len(re.findall(r"\b[\w']+\b", s)) for s in sentences]
    longest_sentence = max(sentence_lengths) if sentence_lengths else 0
    avg_sentence = (sum(sentence_lengths) / len(sentence_lengths)) if sentence_lengths else 0

    # sentence length (6 pts)
    if avg_sentence <= 20:
        pts += 6
    elif avg_sentence <= 24:
        pts += 4
        issues.append(f"avg sentence {avg_sentence:.0f}w (target 15-20w)")
    else:
        pts += 1
        issues.append(f"avg sentence {avg_sentence:.0f}w — too long (target 15-20w)")
    if longest_sentence > 35:
        issues.append(f"longest sentence {longest_sentence}w — split it up")

    # paragraph length (6 pts)
    paragraphs = re.findall(r"<p[^>]*>(.*?)</p>", html, re.S)
    para_word_counts = [len(re.findall(r"\b[\w']+\b", strip_tags(p))) for p in paragraphs]
    over_60 = sum(1 for w in para_word_counts if w > 60)
    ratio_ok = 1 - (over_60 / len(para_word_counts)) if para_word_counts else 0
    pts += round(6 * ratio_ok)
    if over_60:
        issues.append(f"{over_60}/{len(para_word_counts)} paragraphs exceed ~60 words (target 2-3 lines)")

    # Flesch reading ease (5 pts)
    flesch = flesch_reading_ease(text)
    if flesch >= 60:
        pts += 5
    elif flesch >= 45:
        pts += 3
        issues.append(f"Flesch reading ease {flesch:.0f} (target 60+, plain everyday language)")
    else:
        pts += 1
        issues.append(f"Flesch reading ease {flesch:.0f} — hard to read, simplify vocabulary/sentences")

    # filler / AI-writing tells (3 pts)
    filler_hits = len(FILLER_RE.findall(text))
    if filler_hits == 0:
        pts += 3
    elif filler_hits <= 2:
        pts += 2
        issues.append(f"{filler_hits} filler/AI-tell phrase(s) found")
    else:
        issues.append(f"{filler_hits} filler/AI-tell phrases found — sounds generic/AI-written")

    return min(pts, max_pts), max_pts, issues


def score_engagement(text, html, word_count):
    issues, pts = [], 0
    max_pts = CATEGORY_WEIGHTS["engagement"]

    # heading density (5 pts)
    h2_count = len(re.findall(r"<h2", html))
    h3_count = len(re.findall(r"<h3", html))
    headings_per_500 = ((h2_count + h3_count) / word_count * 500) if word_count else 0
    if headings_per_500 >= 1.2:
        pts += 5
    elif headings_per_500 >= 0.7:
        pts += 3
        issues.append(f"heading density {headings_per_500:.1f}/500w (target 1.2+)")
    else:
        issues.append(f"heading density {headings_per_500:.1f}/500w — too sparse, add subheads")

    # visual breaks: table/list presence (5 pts)
    has_table = "<table" in html
    has_list = "<ul" in html or "<ol" in html
    if has_table and has_list:
        pts += 5
    elif has_table or has_list:
        pts += 3
        issues.append("has only one of table/list — add the other for variety")
    else:
        issues.append("no table or list — pure prose walls hurt scan-ability")

    # images (5 pts) — target ~1 image per 150-200 words
    img_count = len(re.findall(r"<img\b", html))
    target_images = max(1, round(word_count / 400))  # conservative floor for blog posts
    if img_count >= target_images:
        pts += 5
    elif img_count >= 1:
        pts += 2
        issues.append(f"{img_count} image(s) for {word_count}w — consider more visual breaks")
    else:
        issues.append(f"0 images for {word_count}w — add screenshots/diagrams/comparison visuals")

    # info/callout boxes (3 pts) — styled div or emoji-prefixed callout
    has_callout = bool(re.search(r"💡|⚠️|⭐|📌|✅|border-left:\s*\d", html))
    if has_callout:
        pts += 3
    else:
        issues.append("no Pro Tip / Warning / Summary callout box detected")

    # hook in first ~100 words (2 pts)
    first_100 = " ".join(text.split()[:100])
    has_number = bool(re.search(r"\d", first_100))
    has_question = "?" in first_100
    if has_number or has_question:
        pts += 2
    else:
        issues.append("no number/question hook in the first ~100 words")

    return min(pts, max_pts), max_pts, issues


def score_trust(fields, raw, html, word_count):
    issues, pts = [], 0
    max_pts = CATEGORY_WEIGHTS["trust"]

    # author present (2 pts)
    if fields.get("author"):
        pts += 2
    else:
        issues.append("author field missing")

    # dateModified recency (4 pts)
    date_modified = fields.get("dateModified")
    if date_modified:
        try:
            dm = datetime.strptime(date_modified, "%Y-%m-%d").date()
            age_days = (date.today() - dm).days
            if age_days <= 120:
                pts += 4
            elif age_days <= 240:
                pts += 2
                issues.append(f"dateModified {date_modified} is {age_days}d old — consider refreshing")
            else:
                issues.append(f"dateModified {date_modified} is {age_days}d old — stale for freshness signals")
        except ValueError:
            issues.append(f"dateModified '{date_modified}' not parseable as YYYY-MM-DD")
    else:
        issues.append("dateModified missing")

    # myTake (first-person expert opinion) (3 pts)
    if fields.get("myTake"):
        pts += 3
    else:
        issues.append("myTake missing — no labelled first-person expert opinion (GEO/EEAT signal)")

    # outbound citations / external references (4 pts)
    citations = parse_list_field(raw, "outboundCitations")
    n_citations = len(citations)
    if n_citations >= 3:
        pts += 4
    elif n_citations >= 1:
        pts += 2
        issues.append(f"{n_citations} outbound citation(s) — target 3+ external sources")
    else:
        issues.append("no outboundCitations — no external sources cited")

    # affiliate disclosure link (2 pts)
    if "/disclosure/" in html or "disclosure" in html.lower():
        pts += 2
    else:
        issues.append("no affiliate disclosure link found in content")

    return min(pts, max_pts), max_pts, issues


def score_aeo(fields, raw, html, word_count):
    issues, pts = [], 0
    max_pts = CATEGORY_WEIGHTS["aeo"]

    # FAQs (6 pts) — target 8-15
    faqs = parse_list_field(raw, "faqs")
    n_faqs = len(faqs)
    if n_faqs >= 8:
        pts += 6
    elif n_faqs >= 4:
        pts += 3
        issues.append(f"{n_faqs} FAQs — target 8-15 for AI Overviews/ChatGPT/Perplexity eligibility")
    else:
        issues.append(f"only {n_faqs} FAQ(s) — target 8-15")

    # quickAnswer as direct-answer signal (3 pts)
    if fields.get("quickAnswer"):
        pts += 3
    else:
        issues.append("no quickAnswer — no direct-answer block for AI extraction")

    # table presence + early position (4 pts) — tables are heavily favored by AI Overviews
    table_match = re.search(r"<table", html)
    if table_match:
        pos_ratio = table_match.start() / max(len(html), 1)
        if pos_ratio <= 0.40:
            pts += 4
        else:
            pts += 2
            issues.append(f"first table at {pos_ratio*100:.0f}% through content — move earlier (target <40%)")
    else:
        issues.append("no comparison table — tables are strongly favored by AI Overviews/Perplexity")

    # step-by-step / ordered list presence (2 pts)
    if "<ol" in html:
        pts += 2
    else:
        issues.append("no numbered/step-by-step list (<ol>) — helps AI answer extraction")

    return min(pts, max_pts), max_pts, issues


def score_conversion(fields, raw, html, word_count):
    issues, pts = [], 0
    max_pts = CATEGORY_WEIGHTS["conversion"]

    # proscons (4 pts)
    pros_n, cons_n = parse_proscons(raw)
    if pros_n >= 2 and cons_n >= 2:
        pts += 4
    elif pros_n or cons_n:
        pts += 2
        issues.append(f"proscons thin ({pros_n} pros / {cons_n} cons) — target 2+ each")
    else:
        issues.append("proscons missing")

    # CTA button presence + count (4 pts) — canonical gradient button pattern
    cta_count = len(re.findall(r"<a[^>]+href=\"https?://[^\"]+\"[^>]*>.*?(?:Try|Get|Start|Visit).*?</a>", html, re.I))
    if cta_count >= 3:
        pts += 4
    elif cta_count >= 1:
        pts += 2
        issues.append(f"{cta_count} CTA button(s) detected — spread more across top/middle/end")
    else:
        issues.append("no clear CTA buttons detected")

    # CTA distribution — at least one in first half AND one in second half (2 pts)
    if cta_count >= 2:
        # crude split check
        half = len(html) // 2
        first_half_ctas = len(re.findall(r"<a[^>]+href=\"https?://", html[:half]))
        second_half_ctas = len(re.findall(r"<a[^>]+href=\"https?://", html[half:]))
        if first_half_ctas and second_half_ctas:
            pts += 2
        else:
            issues.append("CTAs clustered in one half of the post — spread top/middle/end")

    return min(pts, max_pts), max_pts, issues


def score_links(html, word_count):
    issues, pts = [], 0
    max_pts = CATEGORY_WEIGHTS["links"]

    internal_links = set(re.findall(r'href="(/[^"#]*)"', html))
    n_internal = len(internal_links)
    if n_internal >= 4:
        pts += max_pts
    elif n_internal >= 2:
        pts += 3
        issues.append(f"{n_internal} internal links — target 4-8+ for a post this length")
    elif n_internal >= 1:
        pts += 1
        issues.append(f"only {n_internal} internal link — add more related-content links")
    else:
        issues.append("no internal links found — missed opportunity to keep readers on-site")

    return min(pts, max_pts), max_pts, issues


def grade_for(score):
    if score >= 90:
        return "A+"
    if score >= 80:
        return "A"
    if score >= 70:
        return "B"
    if score >= 60:
        return "C"
    if score >= 50:
        return "D"
    return "F"


def audit_file(path):
    raw = path.read_text(encoding="utf-8")
    m = CONTENT_RE.search(raw)
    html = m.group(1) if m else ""
    prose_html = strip_tables(html)
    text = strip_tags(prose_html)
    word_count = len(re.findall(r"\b[\w']+\b", text))

    fields = {
        "title": get_field(raw, "title"),
        "seoTitle": get_field(raw, "seoTitle"),
        "metaDescription": get_field(raw, "metaDescription"),
        "quickAnswer": get_field(raw, "quickAnswer"),
        "author": get_field(raw, "author"),
        "dateModified": get_field(raw, "dateModified"),
        "myTake": get_field(raw, "myTake"),
    }

    categories = {}
    categories["seo"] = score_seo(raw, fields, word_count)
    categories["readability"] = score_readability(text, html, word_count)
    categories["engagement"] = score_engagement(text, html, word_count)
    categories["trust"] = score_trust(fields, raw, html, word_count)
    categories["aeo"] = score_aeo(fields, raw, html, word_count)
    categories["conversion"] = score_conversion(fields, raw, html, word_count)
    categories["links"] = score_links(html, word_count)

    total = sum(c[0] for c in categories.values())
    max_total = sum(c[1] for c in categories.values())

    all_issues = []
    for key, (pts, mx, issues) in categories.items():
        for issue in issues:
            all_issues.append(f"[{CATEGORY_LABELS[key]}] {issue}")

    return {
        "file": path.name,
        "slug": path.stem,
        "title": fields.get("title") or path.stem,
        "word_count": word_count,
        "score": total,
        "max_score": max_total,
        "grade": grade_for(total),
        "categories": {
            key: {"score": pts, "max": mx, "issues": issues}
            for key, (pts, mx, issues) in categories.items()
        },
        "issues": all_issues,
    }


# ── Output renderers ─────────────────────────────────────────────────────

def print_terminal_report(results, verbose):
    print(f"\n{'='*78}\n{BOLD}AI NEXUS — BLOG QUALITY SCORE — {len(results)} post(s){RESET}\n{'='*78}\n")

    for r in sorted(results, key=lambda x: x["score"]):
        color = GREEN if r["score"] >= 80 else YELLOW if r["score"] >= 60 else RED
        print(f"{color}{r['score']:>3}/100  [{r['grade']}]{RESET}  {r['slug']}")
        if verbose:
            for key, cat in r["categories"].items():
                cat_color = GREEN if cat["score"] == cat["max"] else YELLOW if cat["score"] >= cat["max"] * 0.6 else RED
                print(f"    {cat_color}{cat['score']:>2}/{cat['max']:<2} {CATEGORY_LABELS[key]}{RESET}")
                for issue in cat["issues"]:
                    print(f"        {DIM}\u26a0 {issue}{RESET}")
            print()

    avg = sum(r["score"] for r in results) / len(results) if results else 0
    print(f"\n{'='*78}")
    print(f"Site average: {BOLD}{avg:.1f}/100{RESET}  |  "
          f"A+/A: {sum(1 for r in results if r['score']>=80)}  "
          f"B: {sum(1 for r in results if 70<=r['score']<80)}  "
          f"C: {sum(1 for r in results if 60<=r['score']<70)}  "
          f"D/F: {sum(1 for r in results if r['score']<60)}")
    if not verbose:
        print(f"{DIM}Run with a slug for full per-category breakdown, e.g.:{RESET}")
        print(f"  python3 validate_blog_quality.py <slug>")
    print(f"{'='*78}\n")


def write_json(results, path):
    Path(path).write_text(json.dumps({
        "generated": datetime.now().isoformat(),
        "site_average": round(sum(r["score"] for r in results) / len(results), 1) if results else 0,
        "posts": results,
    }, indent=2), encoding="utf-8")


def write_csv(results, path):
    cat_keys = list(CATEGORY_WEIGHTS.keys())
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv_module.writer(f)
        writer.writerow(["slug", "title", "word_count", "score", "grade"] +
                         [CATEGORY_LABELS[k] for k in cat_keys] + ["issue_count"])
        for r in sorted(results, key=lambda x: -x["score"]):
            writer.writerow([
                r["slug"], r["title"], r["word_count"], r["score"], r["grade"]
            ] + [r["categories"][k]["score"] for k in cat_keys] + [len(r["issues"])])


HTML_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>AI Nexus — Blog Quality Dashboard</title>
<style>
  :root {{ --teal: #0D9488; --teal-dark: #0f766e; }}
  * {{ box-sizing: border-box; }}
  body {{ font-family: -apple-system, "Inter", "Manrope", sans-serif; background: #0b1220; color: #e6edf3; margin: 0; padding: 32px; }}
  h1 {{ font-size: 22px; margin: 0 0 4px; }}
  .sub {{ color: #94a3b8; margin-bottom: 24px; font-size: 13px; }}
  .summary {{ display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }}
  .card {{ background: #111a2e; border: 1px solid #1f2b45; border-radius: 12px; padding: 16px 20px; min-width: 140px; }}
  .card .big {{ font-size: 28px; font-weight: 700; }}
  .card .label {{ font-size: 12px; color: #94a3b8; margin-top: 2px; }}
  table {{ width: 100%; border-collapse: collapse; background: #111a2e; border-radius: 12px; overflow: hidden; }}
  th, td {{ padding: 10px 14px; text-align: left; font-size: 13px; border-bottom: 1px solid #1f2b45; }}
  th {{ background: #0f1729; color: #94a3b8; font-weight: 600; cursor: pointer; user-select: none; }}
  tr:hover {{ background: #16213a; }}
  .grade {{ display: inline-block; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 12px; }}
  .g-A {{ background: rgba(34,197,94,.15); color: #4ade80; }}
  .g-B {{ background: rgba(234,179,8,.15); color: #facc15; }}
  .g-C {{ background: rgba(249,115,22,.15); color: #fb923c; }}
  .g-D, .g-F {{ background: rgba(239,68,68,.15); color: #f87171; }}
  .bar {{ height: 6px; border-radius: 3px; background: #1f2b45; overflow: hidden; width: 100px; }}
  .bar > div {{ height: 100%; background: linear-gradient(90deg, var(--teal), var(--teal-dark)); }}
  details {{ margin-top: 4px; }}
  summary {{ cursor: pointer; color: #5eead4; font-size: 12px; }}
  .issue {{ font-size: 12px; color: #94a3b8; padding: 3px 0 3px 14px; border-left: 2px solid #1f2b45; margin-top: 4px; }}
</style>
</head>
<body>
  <h1>AI Nexus — Blog Quality Dashboard</h1>
  <div class="sub">Generated {generated} &middot; {n} posts &middot; validate_blog_quality.py</div>
  <div class="summary">
    <div class="card"><div class="big">{avg}</div><div class="label">Site average / 100</div></div>
    <div class="card"><div class="big">{n_good}</div><div class="label">A/A+ (80+)</div></div>
    <div class="card"><div class="big">{n_mid}</div><div class="label">B/C (60-79)</div></div>
    <div class="card"><div class="big">{n_bad}</div><div class="label">D/F (below 60)</div></div>
  </div>
  <table id="tbl">
    <thead><tr>
      <th onclick="sortBy(0)">Post</th>
      <th onclick="sortBy(1)">Score</th>
      <th onclick="sortBy(2)">Grade</th>
      <th>SEO</th><th>Read</th><th>Eng.</th><th>Trust</th><th>AEO</th><th>Conv.</th><th>Links</th>
      <th>Issues</th>
    </tr></thead>
    <tbody>
      {rows}
    </tbody>
  </table>
<script>
function sortBy(col) {{
  const tbody = document.querySelector('#tbl tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const dir = tbody.dataset.dir === 'asc' ? -1 : 1;
  tbody.dataset.dir = dir === 1 ? 'asc' : 'desc';
  rows.sort((a, b) => {{
    const av = a.children[col].dataset.v ?? a.children[col].textContent;
    const bv = b.children[col].dataset.v ?? b.children[col].textContent;
    const an = parseFloat(av), bn = parseFloat(bv);
    if (!isNaN(an) && !isNaN(bn)) return (an - bn) * dir;
    return av.localeCompare(bv) * dir;
  }});
  rows.forEach(r => tbody.appendChild(r));
}}
</script>
</body>
</html>
"""

ROW_TEMPLATE = """<tr>
  <td>{title}<br><span style="color:#64748b">{slug}</span></td>
  <td data-v="{score}">{score}</td>
  <td><span class="grade g-{grade_class}">{grade}</span></td>
  <td>{seo}</td><td>{read}</td><td>{eng}</td><td>{trust}</td><td>{aeo}</td><td>{conv}</td><td>{links}</td>
  <td><details><summary>{n_issues} issue(s)</summary>{issue_html}</details></td>
</tr>"""


def write_html(results, path):
    rows = []
    for r in sorted(results, key=lambda x: -x["score"]):
        cats = r["categories"]
        issue_html = "".join(f'<div class="issue">{i}</div>' for i in r["issues"]) or '<div class="issue">None \U0001F389</div>'
        rows.append(ROW_TEMPLATE.format(
            title=r["title"], slug=r["slug"], score=r["score"],
            grade=r["grade"], grade_class=r["grade"][0],
            seo=cats["seo"]["score"], read=cats["readability"]["score"],
            eng=cats["engagement"]["score"], trust=cats["trust"]["score"],
            aeo=cats["aeo"]["score"], conv=cats["conversion"]["score"],
            links=cats["links"]["score"], n_issues=len(r["issues"]),
            issue_html=issue_html,
        ))
    avg = round(sum(r["score"] for r in results) / len(results), 1) if results else 0
    html = HTML_TEMPLATE.format(
        generated=datetime.now().strftime("%Y-%m-%d %H:%M"),
        n=len(results), avg=avg,
        n_good=sum(1 for r in results if r["score"] >= 80),
        n_mid=sum(1 for r in results if 60 <= r["score"] < 80),
        n_bad=sum(1 for r in results if r["score"] < 60),
        rows="\n".join(rows),
    )
    Path(path).write_text(html, encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Unified scored blog quality validator.")
    parser.add_argument("slug", nargs="?", help="Audit a single post by slug (verbose).")
    parser.add_argument("--json", metavar="PATH", help="Write full JSON report.")
    parser.add_argument("--csv", metavar="PATH", help="Write CSV summary report.")
    parser.add_argument("--html", metavar="PATH", help="Write self-contained HTML dashboard.")
    parser.add_argument("--min-score", type=int, default=60, help="CI fail threshold (default 60).")
    args = parser.parse_args()

    files = get_post_files(args.slug)
    results = [audit_file(f) for f in files]

    print_terminal_report(results, verbose=bool(args.slug))

    if args.json:
        write_json(results, args.json)
        print(f"{CYAN}JSON report written to {args.json}{RESET}")
    if args.csv:
        write_csv(results, args.csv)
        print(f"{CYAN}CSV report written to {args.csv}{RESET}")
    if args.html:
        write_html(results, args.html)
        print(f"{CYAN}HTML dashboard written to {args.html}{RESET}")

    failing = [r for r in results if r["score"] < args.min_score]
    if failing:
        print(f"{RED}{len(failing)} post(s) below min-score {args.min_score}: "
              f"{', '.join(r['slug'] for r in failing)}{RESET}\n")
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
