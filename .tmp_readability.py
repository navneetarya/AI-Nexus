import re, urllib.request
from html import unescape

urls = [
    'https://ainexustools.online/',
    'https://ainexustools.online/blog/best-ai-voice-dictation-tools-2026/'
]


def strip_html(html):
    html = re.sub(r'<script.*?</script>', ' ', html, flags=re.S | re.I)
    html = re.sub(r'<style.*?</style>', ' ', html, flags=re.S | re.I)
    html = re.sub(r'<[^>]+>', ' ', html)
    html = unescape(html)
    html = re.sub(r'\s+', ' ', html)
    return html.strip()


def syllables(word):
    w = re.sub(r'[^a-z]', '', word.lower())
    if len(w) <= 3:
        return 1
    count = 0
    prev = False
    vowels = 'aeiouy'
    for ch in w:
        is_vowel = ch in vowels
        if is_vowel and not prev:
            count += 1
        prev = is_vowel
    if w.endswith('e') and count > 1:
        count -= 1
    return max(1, count)

for u in urls:
    html = urllib.request.urlopen(u, timeout=25).read().decode('utf-8', 'ignore')
    text = strip_html(html)
    words = re.findall(r"\b[\w'-]+\b", text)
    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentence_count = max(1, len([s for s in sentences if s.strip()]))
    word_count = len(words)
    syllable_count = sum(syllables(w) for w in words)
    flesch = 206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (syllable_count / word_count)
    print('URL:', u)
    print('Words:', word_count)
    print('Sentences:', sentence_count)
    print('Flesch Reading Ease:', round(flesch, 2))
    print('---')
