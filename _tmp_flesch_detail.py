import re
import validate_blog_quality as v

content = open('blog/best-ai-receptionist-small-business-2026.ts', encoding='utf-8').read()
m = re.search(r'content: `(.*?)`,\n\n  faqs', content, re.S)
html = m.group(1)
prose = v.strip_tables(html)
text = v.strip_tags(prose)

sentences = [s for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
words_all = re.findall(r"[A-Za-z']+", text)
syll_all = sum(v.count_syllables(w) for w in words_all)
print("sentences:", len(sentences), "words:", len(words_all), "syllables:", syll_all)
print("ASL:", len(words_all)/len(sentences), "ASW:", syll_all/len(words_all))

# find words with high syllable count, sorted by frequency*syllables impact
from collections import Counter
word_syll = {}
counts = Counter(w.lower() for w in words_all)
for w, c in counts.items():
    s = v.count_syllables(w)
    if s >= 3:
        word_syll[w] = (s, c, s*c)

top = sorted(word_syll.items(), key=lambda x: -x[1][2])[:30]
for w, (s, c, total) in top:
    print(w, "syll:", s, "count:", c, "total:", total)
