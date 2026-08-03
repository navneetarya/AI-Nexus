#!/usr/bin/env python3
"""
validate_readability_engagement.py
====================================
Sitewide Readability, Engagement & Blog-Writing-Criteria Audit.

Gates 4 (READABILITY) and 7 (HUMAN QUALITY) in LOOP_ENGINEERING_PROMPT.md
are currently *soft* checks the writing agent scores manually at the moment
a post is drafted — there's no repeatable script that re-checks the whole
published blog/ later, the way validate_cta_consistency.py does for CTAs.
This fills that gap and adds a few concrete engagement/scan-ability checks
the prompt only gestures at (heading density, hook strength, list/table use,
AI-writing tells).

Checks per post:
  1. SENTENCE LENGTH     — longest sentence ≤ 30 words (Gate 4 rule),
                            average sentence length flagged if > 22 words.
  2. PARAGRAPH LENGTH     — longest <p> ≤ 100 words (Gate 3 rule).
  3. READING EASE          — Flesch Reading Ease approximation; flag < 45
                            (roughly "difficult" — college level).
  4. AI-WRITING TELLS      — em dashes, filler phrases, "not just X but Y"
                            rule-of-three padding, generic AI vocabulary,
                            vague attributions ("industry reports show").
                            Pattern set adapted from the humanizer skill.
  5. HOOK CHECK             — primary engagement anchor in the first ~100
                            words: a number, a question, or a bolded/callout
                            "Key Finding" box.
  6. SCAN-ABILITY           — heading (h2+h3) density per 500 words, and
                            presence of at least one table or list.
  7. DIRECT ADDRESS         — "you/your" frequency, a rough proxy for
                            reader-facing vs. encyclopedic tone.
  8. FORBIDDEN VERDICT       — flags "it depends" as a closing verdict
                            without a clear recommendation (Gate 4 rule).

This script does NOT modify anything — report only. Scores are directional,
not authoritative; use FLAG posts as a worklist, not a hard fail gate.

Usage:
    python3 validate_readability_engagement.py              # all posts
    python3 validate_readability_engagement.py <slug>        # one post, verbose
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BLOG_DIR = ROOT / "blog"

NON_POST_FILES = {"index.ts", "metadata.ts", "loaders.ts", "types.ts"}

RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RESET = "\033[0m"

CONTENT_FIELD_PATTERN = re.compile(r"content:\s*`(.*)`", re.S)

# ── AI-writing tell patterns (subset of the humanizer skill's list) ─────────
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
    r"\bobservers have (?:cited|noted)\b",
    r"\bexperts argue\b", r"\bsome critics argue\b",
]
FILLER_RE = re.compile("|".join(FILLER_PHRASES), re.IGNORECASE)

VAGUE_VERDICT_RE = re.compile(r"\bit (?:really |just )?depends\b", re.IGNORECASE)

# ── Tunable thresholds ───────────────────────────────────────────────────────
MAX_SENTENCE_WORDS = 30
FLAG_AVG_SENTENCE_WORDS = 22
MAX_PARAGRAPH_WORDS = 100
MIN_FLESCH_SCORE = 45
MIN_HEADINGS_PER_500_WORDS = 1.2
MAX_EM_DASH_DENSITY_PER_1000 = 6
MAX_FILLER_HITS = 3


def get_post_files(slug=None):
    if slug:
        f = BLOG_DIR / f"{slug}.ts"
        if not f.exists():
            print(f"{RED}No such file: {f}{RESET}")
            sys.exit(1)
        return [f]
    return sorted(p for p in BLOG_DIR.glob("*.ts") if p.name not in NON_POST_FILES)


def strip_tags(html):
    # Force a sentence boundary at block-level closes so list items,
    # table-adjacent captions, etc. don't get concatenated into one
    # run-on "sentence" once tags are stripped.
    html = re.sub(r"</(li|p|h[1-6]|div|td|th)>", ". ", html, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"&nbsp;|&amp;|&#\d+;", " ", text)
    text = re.sub(r"\.\s*\.", ".", text)
    return re.sub(r"\s+", " ", text).strip()


def strip_tables(html):
    """Remove <table>...</table> blocks — table cell text has no terminal
    punctuation, which corrupts sentence-splitting for the prose checks
    (a whole table reads as one run-on "sentence"). Table presence itself
    is still checked separately for scan-ability."""
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
    sentences = re.split(r"(?<=[.!?])\s+", text)
    sentences = [s for s in sentences if s.strip()]
    words = re.findall(r"[A-Za-z']+", text)
    if not sentences or not words:
        return 0.0
    syllables = sum(count_syllables(w) for w in words)
    asl = len(words) / len(sentences)
    asw = syllables / len(words)
    return 206.835 - 1.015 * asl - 84.6 * asw


def audit_file(path):
    raw = path.read_text(encoding="utf-8")
    m = CONTENT_FIELD_PATTERN.search(raw)
    html = m.group(1) if m else ""
    prose_html = strip_tables(html)
    text = strip_tags(prose_html)
    word_count = len(re.findall(r"\b[\w']+\b", text))

    flags = []

    # 1. Sentence length
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    sentence_lengths = [len(re.findall(r"\b[\w']+\b", s)) for s in sentences]
    longest_sentence = max(sentence_lengths) if sentence_lengths else 0
    avg_sentence = (sum(sentence_lengths) / len(sentence_lengths)) if sentence_lengths else 0
    if longest_sentence > MAX_SENTENCE_WORDS:
        flags.append(f"longest sentence {longest_sentence}w (limit {MAX_SENTENCE_WORDS})")
    if avg_sentence > FLAG_AVG_SENTENCE_WORDS:
        flags.append(f"avg sentence {avg_sentence:.0f}w (flag >{FLAG_AVG_SENTENCE_WORDS})")

    # 2. Paragraph length
    paragraphs = re.findall(r"<p[^>]*>(.*?)</p>", html, re.S)
    para_word_counts = [len(re.findall(r"\b[\w']+\b", strip_tags(p))) for p in paragraphs]
    longest_para = max(para_word_counts) if para_word_counts else 0
    if longest_para > MAX_PARAGRAPH_WORDS:
        flags.append(f"longest paragraph {longest_para}w (limit {MAX_PARAGRAPH_WORDS})")

    # 3. Reading ease
    flesch = flesch_reading_ease(text)
    if flesch < MIN_FLESCH_SCORE:
        flags.append(f"Flesch reading ease {flesch:.0f} (flag <{MIN_FLESCH_SCORE}, harder to read)")

    # 4. AI-writing tells
    filler_hits = FILLER_RE.findall(text)
    em_dash_count = text.count("—") + text.count(" -- ")
    em_dash_density = (em_dash_count / word_count * 1000) if word_count else 0
    if len(filler_hits) > MAX_FILLER_HITS:
        flags.append(f"{len(filler_hits)} filler/AI-tell phrases found (flag >{MAX_FILLER_HITS})")
    if em_dash_density > MAX_EM_DASH_DENSITY_PER_1000:
        flags.append(f"em dash density {em_dash_density:.1f}/1000 words (flag >{MAX_EM_DASH_DENSITY_PER_1000})")

    # 5. Hook check — first ~100 words
    first_100 = " ".join(text.split()[:100])
    has_number = bool(re.search(r"\d", first_100))
    has_question = "?" in first_100
    has_callout = "Key Finding" in html[:1500] or "background:rgba(13,148,136" in html[:1500]
    if not (has_number or has_question or has_callout):
        flags.append("no number/question/callout hook in first ~100 words")

    # 6. Scan-ability
    h2_count = len(re.findall(r"<h2", html))
    h3_count = len(re.findall(r"<h3", html))
    headings_per_500 = ((h2_count + h3_count) / word_count * 500) if word_count else 0
    has_table = "<table" in html
    has_list = "<ul" in html or "<ol" in html
    if headings_per_500 < MIN_HEADINGS_PER_500_WORDS:
        flags.append(f"heading density {headings_per_500:.1f}/500w (flag <{MIN_HEADINGS_PER_500_WORDS})")
    if not (has_table or has_list):
        flags.append("no table or list — pure prose hurts scan-ability")

    # 7. Direct address
    you_count = len(re.findall(r"\byou(?:r|'re|'ll|'ve)?\b", text, re.IGNORECASE))
    you_density = (you_count / word_count * 1000) if word_count else 0

    # 8. Forbidden vague verdict near the end
    tail = text[-600:]
    if VAGUE_VERDICT_RE.search(tail) and "if" not in tail.lower()[:tail.lower().find("depends") if "depends" in tail.lower() else 0]:
        flags.append('vague "it depends" near the close with no clear recommendation')

    return {
        "file": path.name,
        "word_count": word_count,
        "longest_sentence": longest_sentence,
        "avg_sentence": avg_sentence,
        "longest_para": longest_para,
        "flesch": flesch,
        "filler_hits": len(filler_hits),
        "em_dash_density": em_dash_density,
        "h2_count": h2_count,
        "h3_count": h3_count,
        "has_table": has_table,
        "has_list": has_list,
        "you_density": you_density,
        "flags": flags,
        "status": "FLAG" if flags else "PASS",
    }


def main():
    slug = sys.argv[1] if len(sys.argv) > 1 else None
    files = get_post_files(slug)
    results = [audit_file(f) for f in files]

    print(f"\n{'='*70}\nREADABILITY & ENGAGEMENT AUDIT — {len(results)} post(s) checked\n{'='*70}\n")

    passed = [r for r in results if r["status"] == "PASS"]
    flagged = [r for r in results if r["status"] == "FLAG"]

    print(f"{GREEN}CLEAN: {len(passed)}{RESET}")
    if slug:
        for r in passed:
            print(f"  - {r['file']}")
    print()

    print(f"{YELLOW}FLAGGED: {len(flagged)}{RESET}")
    for r in flagged:
        print(f"  - {r['file']}")
        if slug:
            print(f"      words: {r['word_count']}  |  longest sentence: {r['longest_sentence']}w  |  "
                  f"avg sentence: {r['avg_sentence']:.0f}w  |  Flesch: {r['flesch']:.0f}  |  "
                  f"longest para: {r['longest_para']}w  |  h2+h3: {r['h2_count']}+{r['h3_count']}  |  "
                  f"table/list: {r['has_table']}/{r['has_list']}  |  you-density: {r['you_density']:.1f}/1000w")
        for flag in r["flags"]:
            print(f"      \u26a0 {flag}")
        print()

    total = len(results)
    print(f"{'='*70}")
    print(f"Summary: {len(passed)}/{total} posts clean on readability & engagement checks.")
    if flagged:
        print(f"{YELLOW}{len(flagged)} post(s) worth a manual pass — run with a slug for full detail:{RESET}")
        print(f"  python3 validate_readability_engagement.py <slug>")
    print(f"{'='*70}\n")
    print("Note: these are directional signals, not a hard gate — a post can FLAG on")
    print("one metric (e.g. a long comparison sentence) and still read well. Use this")
    print("as a worklist, not an auto-fail, and re-run validate_cta_consistency.py and")
    print("validate_blog_structure.py alongside it for the full picture.\n")

    sys.exit(0 if not flagged else 1)


if __name__ == "__main__":
    main()
