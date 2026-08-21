import re
from collections import Counter

content = open('blog/best-ai-agents-for-small-business-2026.ts', encoding='utf-8').read()
m = re.search(r'content: `(.*?)`,\n};', content, re.S)
html = m.group(1)


def strip_tags(html):
    html = re.sub(r"</(li|p|h[1-6]|div|td|th)>", ". ", html, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"&nbsp;|&amp;|&#\d+;", " ", text)
    text = re.sub(r"\.\s*\.", ".", text)
    return re.sub(r"\s+", " ", text).strip()


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


text = strip_tags(re.sub(r"<table[^>]*>.*?</table>", " ", html, flags=re.S))
sentences = [s for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
words = re.findall(r"[A-Za-z']+", text)
syllables = sum(count_syllables(w) for w in words)
asl = len(words) / len(sentences)
asw = syllables / len(words)
flesch = 206.835 - 1.015 * asl - 84.6 * asw
print('sentences', len(sentences), 'words', len(words), 'asl', asl, 'asw', asw, 'flesch', flesch)

counter = Counter()
for w in words:
    s = count_syllables(w)
    if s >= 4:
        counter[w.lower()] += 1
for w, c in counter.most_common(40):
    print(c, w)


